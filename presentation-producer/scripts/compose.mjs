/**
 * presentation-producer :: composition (stage 5)
 *
 * Engine is DERIVED from what the requested output needs, not chosen by taste:
 *   - one aspect, static captions          -> ffmpeg (light, no 400MB install)
 *   - reframing / kinetic captions / PIP    -> Remotion (declarative, per-output)
 * The choice and its reasoning are always reported.
 *
 * Subtitles are burned in, and their placement is derived per aspect: landscape
 * sits just above the lower edge; vertical rides high enough to clear phone UI
 * chrome; letterboxed vertical drops into the empty bar under the footage so it
 * never covers the UI being demonstrated.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import {
  ASPECTS,
  chooseVerticalStrategy,
  composeCacheKey,
  computeReframe,
  isMainModule,
  selectEngine,
  selectOutputs,
} from './lib/core.mjs';
import {
  Ffmpeg,
  concatArgs,
  concatListFile,
  freezePadFilter,
  letterboxFilter,
  loudnormFilter,
  mergeSceneArgs,
  reframeFilter,
  silencePadFilter,
  subtitlesFilter,
} from './lib/ffmpeg.mjs';
import { Ledger } from './lib/ledger.mjs';
import { presentationContext, probe } from './lib/probe.mjs';
import { assStyleOverrides, formatSrt, prepareSceneSubtitles, shiftCues } from './lib/subtitles.mjs';

/**
 * Build the video filter chain for one scene and one output aspect.
 * Exported for unit testing: it is the crux of "one capture, many framings".
 */
export function sceneVideoFilters({ scene, manifest, output, subtitlePath }) {
  const filters = [];
  const captureAspect = manifest.meta?.captureAspect ?? 'landscape';
  const src = ASPECTS[captureAspect];
  const dst = ASPECTS[output.aspect] ?? src;

  // 1. Hold the last frame if narration outlasts the visual (D13).
  const pad = freezePadFilter(scene.resolvedTiming?.padVisualMs);
  if (pad) filters.push(pad);

  // 2. Reframe for a different aspect than we captured (D10).
  if (output.aspect !== captureAspect) {
    const strategy = output.strategy ?? chooseVerticalStrategy(scene, { hasRoi: Boolean(scene.roi) });
    if (strategy === 'letterbox') {
      filters.push(letterboxFilter({ dstW: dst.width, dstH: dst.height, background: manifest.meta?.background ?? '#0f172a' }));
    } else if (strategy === 'reframe') {
      const crop = computeReframe({
        srcW: src.width, srcH: src.height, dstW: dst.width, dstH: dst.height, roi: scene.roi ?? null,
      });
      filters.push(reframeFilter({ crop, dstW: dst.width, dstH: dst.height }));
    } else {
      // 'native' was captured at the target viewport already; just conform.
      filters.push(`scale=${dst.width}:${dst.height},format=yuv420p`);
    }
  }

  // 3. Burn the captions LAST, so they are never cropped or scaled by the
  //    reframe. This ordering is the whole reason placement can be per-aspect,
  //    and it is also why the ASS PlayRes must equal the *output* frame.
  if (subtitlePath) filters.push(subtitlesFilter(subtitlePath, { fontsDir: manifest.meta?.subtitles?.fontsDir ?? null }));

  return filters;
}

async function composeWithFfmpeg({ workDir, manifest, output, paths, ff, ledger, report }) {
  const fps = manifest.meta?.fps ?? 30;
  const dst = ASPECTS[output.aspect] ?? ASPECTS.landscape;
  const strategy = output.strategy ?? null;
  mkdirSync(paths.processed, { recursive: true });
  mkdirSync(paths.output, { recursive: true });

  const sceneFiles = [];
  const sidecarCues = [];
  let timelineMs = 0;

  for (const scene of manifest.scenes) {
    if (!scene.resolvedVisual?.filePath) {
      report.warnings.push(`${scene.id}: no captured visual, skipped`);
      continue;
    }
    const video = path.resolve(workDir, scene.resolvedVisual.filePath);
    const audio = scene.resolvedAudio?.filePath ? path.resolve(workDir, scene.resolvedAudio.filePath) : null;
    const sceneMs = scene.resolvedTiming?.sceneMs ?? scene.resolvedVisual.durationMs;

    // --- captions: synthesised when the provider gave none, re-timed when
    //     speech was re-rated, re-wrapped and re-placed for this aspect ------
    const { ass, srt, cues } = prepareSceneSubtitles({
      scene,
      output: { aspect: output.aspect, strategy },
      durationMs: sceneMs,
      providerSrt: scene.resolvedAudio?.providerSrt ?? null,
      ratePct: scene.ratePct ?? 0,
      overrides: assStyleOverrides(manifest.meta?.subtitles),
    });
    // The .ass is what gets burned in; the .srt is the readable record the
    // verification gate reads back per scene.
    const assPath = path.join(paths.processed, `${scene.id}.${output.aspect}.ass`);
    writeFileSync(assPath, ass);
    writeFileSync(path.join(paths.processed, `${scene.id}.${output.aspect}.srt`), srt);
    sidecarCues.push(...shiftCues(cues, timelineMs));
    timelineMs += sceneMs;

    const out = path.join(paths.processed, `${scene.id}.${output.aspect}.mp4`);
    // The whole ASS body participates in the key: a caption placement or style
    // change must invalidate the burn-in, which hashing only its length missed.
    const key = composeCacheKey(scene, { aspect: output.aspect, strategy, subtitles: ass, fps });
    const cached = ledger.get(key, `${scene.id} compose/${output.aspect}`);
    if (cached) {
      sceneFiles.push(cached.path);
      continue;
    }

    const videoFilters = sceneVideoFilters({
      scene, manifest, output: { aspect: output.aspect, strategy }, subtitlePath: assPath,
    });
    const audioFilters = [silencePadFilter(scene.resolvedTiming?.padAudioMs), loudnormFilter()];

    if (audio) {
      await ff.run(mergeSceneArgs({ video, audio, out, videoFilters, audioFilters, fps }));
    } else {
      // Footage that carries its own audio, or a silent scene.
      await ff.run([
        '-y', '-i', video,
        ...(videoFilters.length ? ['-vf', videoFilters.join(',')] : []),
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18',
        '-r', String(fps), '-fps_mode', 'cfr', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '192k',
        out,
      ]);
    }
    ledger.put(key, { path: out }, `${scene.id} compose/${output.aspect}`);
    sceneFiles.push(out);
  }

  if (sceneFiles.length === 0) throw new Error('nothing to compose: no scene produced both a visual and audio');

  // Concat. Stream-copy is safe because every scene was encoded identically.
  const listFile = path.join(paths.processed, `concat.${output.aspect}.txt`);
  writeFileSync(listFile, concatListFile(sceneFiles));
  const finalFile = path.join(paths.output, `${slug(manifest.meta?.title)}.${output.aspect}.mp4`);
  await ff.run(concatArgs({ listFile, out: finalFile, reencode: false, fps }));

  // Optional sidecar for platforms that prefer uploaded captions.
  if (manifest.meta?.subtitles?.sidecar) {
    writeFileSync(finalFile.replace(/\.mp4$/, '.srt'), formatSrt(sidecarCues));
  }

  return { file: finalFile, dimensions: dst, scenes: sceneFiles.length };
}

async function composeWithRemotion({ workDir, manifest, outputs, paths, report }) {
  const projectDir = paths.remotion;
  if (!existsSync(path.join(projectDir, 'node_modules', 'remotion'))) {
    throw new Error('Remotion project is not installed — run bootstrap.mjs --with-remotion');
  }

  // Remotion consumes the manifest as props; per-aspect compositions are
  // registered in the template, so one render pass serves each output.
  const propsFile = path.join(paths.runtime, 'remotion-props.json');
  writeFileSync(propsFile, JSON.stringify({ ...manifest, workDir: path.resolve(workDir) }, null, 2));

  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const exec = promisify(execFile);
  mkdirSync(paths.output, { recursive: true });

  /**
   * Locate the pinned Remotion CLI inside the project's own node_modules.
   *
   * Deliberately never `npx`: npx is `npx.cmd` on Windows, which execFile
   * cannot launch without a shell (the CVE-2024-27980 mitigation), and npx may
   * reach the network for an unpinned version, which would break the rule that
   * `.runtime` holds pinned dependencies. If the CLI is absent the install is
   * incomplete, and saying so plainly beats silently reaching outside the
   * project for a different version than the one that was pinned.
   */
  const resolveRemotionCli = () => {
    const modules = path.join(projectDir, 'node_modules');
    const direct = path.join(modules, 'remotion', 'dist', 'cli.js');
    if (existsSync(direct)) return direct;
    // Read the declared bin so this survives the entry moving between majors.
    const pkgPath = path.join(modules, '@remotion', 'cli', 'package.json');
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      const bin = typeof pkg.bin === 'string' ? pkg.bin : Object.values(pkg.bin ?? {})[0];
      if (bin) return path.join(modules, '@remotion', 'cli', bin);
    }
    throw new Error(
      `Remotion CLI not found under ${modules}. Run bootstrap.mjs --with-remotion to install it.`
    );
  };

  const produced = [];
  for (const output of outputs) {
    // Remotion burns captions from the props cues; write the per-scene SRT
    // sidecars too so the verification gate (which reads them back) can see
    // the captions and so a whole-video .srt can be assembled.
    const strategy = output.strategy ?? manifest.meta?.outputs?.find((o) => o.aspect === output.aspect)?.strategy;
    const sidecarCues = [];
    let timelineMs = 0;
    for (const scene of manifest.scenes) {
      const sceneMs = scene.resolvedTiming?.sceneMs ?? scene.resolvedVisual?.durationMs ?? scene.resolvedAudio?.durationMs ?? 3000;
      const captionMs = scene.resolvedAudio?.durationMs ?? sceneMs;
      const { srt, cues } = prepareSceneSubtitles({
        scene,
        output: { aspect: output.aspect, strategy },
        durationMs: captionMs,
        providerSrt: scene.resolvedAudio?.providerSrt ?? null,
        ratePct: scene.ratePct ?? 0,
        overrides: assStyleOverrides(manifest.meta?.subtitles),
      });
      writeFileSync(path.join(paths.processed, `${scene.id}.${output.aspect}.srt`), srt);
      sidecarCues.push(...shiftCues(cues, timelineMs));
      timelineMs += sceneMs;
    }

    const composition = output.aspect === 'landscape' ? 'VideoLandscape' : output.aspect === 'vertical' ? 'VideoVertical' : 'VideoSquare';
    const finalFile = path.join(paths.output, `${slug(manifest.meta?.title)}.${output.aspect}.mp4`);
    await exec(
      process.execPath,
      [
        resolveRemotionCli(),
        'render', 'src/index.ts', composition, finalFile,
        `--props=${propsFile}`,
        '--log=warn',
      ],
      { cwd: projectDir, timeout: 60 * 60_000, maxBuffer: 64 * 1024 * 1024 }
    );
    produced.push({ file: finalFile, dimensions: ASPECTS[output.aspect] });
    if (manifest.meta?.subtitles?.sidecar) {
      writeFileSync(finalFile.replace(/\.mp4$/, '.srt'), formatSrt(sidecarCues));
    }
  }
  return produced;
}

// ---------------------------------------------------------------------------
// Stage entry point
// ---------------------------------------------------------------------------

export async function compose({ workDir, manifest, options = {} }) {
  const { paths, capabilities, bins } = await probe(workDir);
  const ff = new Ffmpeg(bins);
  const ledger = new Ledger(paths.ledger, { noCache: options.noCache });
  const report = { warnings: [], outputs: [] };

  const outputs = selectOutputs(manifest, options.aspect ?? null);
  const decision = selectEngine({ ...manifest, meta: { ...manifest.meta, outputs } }, capabilities, options.engine ?? null);
  report.engine = decision;
  report.aspects = outputs.map((o) => o.aspect);

  if (decision.degraded.length) {
    report.warnings.push(
      `degraded: ${decision.degraded.join(', ')} unavailable with the ${decision.engine} engine — ` +
        'these features are skipped, not silently applied'
    );
  }

  if (decision.engine === 'remotion') {
    const produced = await composeWithRemotion({ workDir, manifest, outputs, paths, report });
    report.outputs = produced;
  } else {
    // With ffmpeg, only aspects that were captured natively (or can be
    // letterboxed) are renderable; a reframe was declared degraded above.
    for (const output of outputs) {
      const captureAspect = manifest.meta?.captureAspect ?? 'landscape';
      const strategy = output.strategy ?? chooseVerticalStrategy({}, {});
      if (output.aspect !== captureAspect && strategy === 'reframe') {
        report.warnings.push(
          `${output.aspect}: ROI reframing needs Remotion; falling back to letterbox for this output`
        );
        output.strategy = 'letterbox';
      }
      const produced = await composeWithFfmpeg({ workDir, manifest, output, paths, ff, ledger, report });
      report.outputs.push(produced);
    }
  }

  ledger.save();
  report.cache = ledger.report();
  return { manifest, report };
}

function slug(title) {
  return String(title ?? 'video').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'video';
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (isMainModule(import.meta.url)) {
  const { parseArgs } = await import('./synthesize.mjs');
  const args = parseArgs(process.argv.slice(2));
  const workDir = presentationContext({ root: args.root, presentation: args.presentation }).paths.workDir;
  const manifestPath = path.join(workDir, 'storyboard.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

  const { manifest: updated, report } = await compose({
    workDir,
    manifest,
    options: { engine: args.engine, aspect: args.aspect, noCache: Boolean(args['no-cache']) },
  });
  writeFileSync(manifestPath, `${JSON.stringify(updated, null, 2)}\n`);
  console.log(`engine: ${report.engine.engine} — ${report.engine.reason}`);
  for (const o of report.outputs) console.log(`  ${o.file} (${o.dimensions.width}x${o.dimensions.height})`);
  for (const w of report.warnings) console.warn(`  warning: ${w}`);
  console.log(report.cache);
}
