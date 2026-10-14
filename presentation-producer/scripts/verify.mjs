/**
 * presentation-producer :: verification gate (stage 6)
 *
 * Three layers, because each catches a class the others cannot:
 *
 *   1. capture-time  per-scene assertions (in capture.mjs) — catches a 404, a
 *                    login screen, an empty table, a stuck spinner. None of
 *                    these are visible to a downstream probe.
 *   2. artifact      manifest-DERIVED expectations (never hardcoded 1920x1080),
 *                    plus per-scene A/V drift, silence, freeze, loudness and
 *                    caption bounds.
 *   3. code          unit tests over the pure logic (scripts/lib/*.test.mjs).
 *
 * Everything reported here is derived from the manifest, so a 9:16 or a
 * 12-minute output is checked against its own intent.
 */

import { closeSync, existsSync, openSync, readFileSync, readSync, statSync } from 'node:fs';
import path from 'node:path';

import { checkOutput, checkSceneSync, expectationsFor, isMainModule } from './lib/core.mjs';
import { Ffmpeg, loudnormAnalyseFilter } from './lib/ffmpeg.mjs';
import { parseBlackdetect, parseFreezedetect, parseLoudnorm, parseSilencedetect } from './lib/core.mjs';
import { presentationContext, presentationPaths, probe } from './lib/probe.mjs';
import { CANVAS } from './lib/deck-html.mjs';

/** Loudness window we consider acceptable for narration, in LUFS. */
const LOUDNESS_TARGET = -16;
const LOUDNESS_TOLERANCE = 3;

/**
 * Pixel dimensions from a PNG's IHDR chunk: big-endian width and height at
 * bytes 16-23 of every PNG ever written.
 *
 * Read from the header rather than with an image library because the whole test
 * suite runs on system Node with no install, and a dependency for eight bytes
 * would be the wrong trade. Returns null for anything that is not a PNG.
 */
export function pngSize(file) {
  const head = Buffer.alloc(24);
  let fd;
  try {
    fd = openSync(file, 'r');
    if (readSync(fd, head, 0, 24, 0) < 24) return null;
  } catch {
    return null;
  } finally {
    if (fd !== undefined) closeSync(fd);
  }
  if (head.toString('hex', 0, 8) !== '89504e470d0a1a0a') return null;
  return { width: head.readUInt32BE(16), height: head.readUInt32BE(20) };
}

/**
 * Terminal check for a slides run (D23).
 *
 * The render-time gates measure CONTENT inside a live browser — overflow,
 * contrast, missing icons — and structurally cannot see what landed on disk
 * afterwards. A Chromium screenshot taken at the wrong viewport, a marp-cli PDF
 * written as zero bytes, or a format silently skipped all pass every existing
 * check and then surface in front of an audience. So this asserts geometry and
 * existence, and nothing that the deck report already proves.
 */
export function verifySlides({ paths, manifest, deck }) {
  const failures = [];
  const warnings = [];
  const expected = new Map();

  for (const s of deck.slides) {
    const suffix = s.orientation === 'landscape' ? '' : `.${s.orientation}`;
    expected.set(path.join(paths.slides, `${s.id}${suffix}.png`), CANVAS[s.orientation] ?? CANVAS.landscape);
  }

  if (deck.formats.includes('png')) {
    for (const [file, canvas] of expected) {
      const size = pngSize(file);
      if (!size) {
        failures.push(`missing or unreadable PNG: ${path.basename(file)}`);
        continue;
      }
      if (size.width !== canvas.width || size.height !== canvas.height) {
        failures.push(
          `${path.basename(file)} is ${size.width}x${size.height}, expected ${canvas.width}x${canvas.height}`
        );
      }
    }
  }

  for (const artifact of deck.artifacts) {
    if (!existsSync(artifact)) {
      failures.push(`declared artifact was never written: ${path.basename(artifact)}`);
      continue;
    }
    // A PDF smaller than a single embedded font is suspicious rather than
    // provably wrong, and page-counting a PDF without a parser would be a
    // heuristic dressed as an invariant. Heuristics warn (non-negotiable 6).
    if (statSync(artifact).size < 1024) warnings.push(`${path.basename(artifact)} is under 1KB — check it opens`);
  }

  return {
    ok: failures.length === 0,
    outputs: [
      {
        output: 'deck',
        ok: failures.length === 0,
        file: paths.slides,
        resolution: `${deck.slides.length} render(s) across ${deck.orientations.join(', ')}`,
        failures,
        warnings,
      },
    ],
    sceneDrift: [],
    captions: [],
  };
}

export async function verify({ workDir, manifest, options = {} }) {
  if (options.mode === 'slides') {
    return verifySlides({ paths: presentationPaths(workDir), manifest, deck: options.deck });
  }
  const { paths, bins } = await probe(workDir);
  const ff = new Ffmpeg(bins);
  const results = [];

  const outputs = manifest.meta?.outputs ?? [{ aspect: 'landscape' }];
  for (const output of outputs) {
    const file = options.file ?? findOutput(paths.output, manifest, output.aspect);
    if (!file || !existsSync(file)) {
      results.push({ output: output.aspect, ok: false, failures: [`output not found for ${output.aspect}`], warnings: [] });
      continue;
    }

    const expect = expectationsFor(manifest, output);
    const probed = await ff.probeMedia(file);
    const base = checkOutput(probed, expect);
    const failures = [...base.failures];
    const warnings = [...base.warnings];

    // --- black frames: corrupted transitions -----------------------------
    const blacks = parseBlackdetect(await ff.analyse(file, 'blackdetect=d=0.8:pix_th=0.10'));
    if (blacks.length > 0) {
      const total = blacks.reduce((n, b) => n + b.duration, 0);
      const msg = `${blacks.length} black segment(s) totalling ${total.toFixed(1)}s`;
      if (total > 2) failures.push(msg);
      else warnings.push(msg);
    }

    // --- silence: a TTS call that returned empty audio --------------------
    const silences = parseSilencedetect(await ff.analyse(file, 'silencedetect=n=-45dB:d=2.5', { audio: true }));
    const longSilence = silences.filter((s) => (s.duration ?? Infinity) > 4);
    if (longSilence.length) {
      warnings.push(
        `${longSilence.length} silence gap(s) over 4s (first at ${longSilence[0].start}s) — ` +
          'a scene may have produced no narration'
      );
    }

    // --- freeze: a stalled capture, or padding that ran far too long ------
    const freezes = parseFreezedetect(await ff.analyse(file, 'freezedetect=n=-60dB:d=6'));
    if (freezes.length) {
      warnings.push(`${freezes.length} freeze(s) over 6s (first at ${freezes[0].start}s) — check capture and padding`);
    }

    // --- loudness: level consistency across scenes and providers ----------
    const loud = parseLoudnorm(await ff.analyse(file, loudnormAnalyseFilter(), { audio: true }));
    if (loud && Number.isFinite(loud.inputI)) {
      const drift = Math.abs(loud.inputI - LOUDNESS_TARGET);
      if (drift > LOUDNESS_TOLERANCE) {
        warnings.push(`integrated loudness ${loud.inputI} LUFS is ${drift.toFixed(1)} off the ${LOUDNESS_TARGET} target`);
      }
    }

    // --- captions: present, and none outlasting the video -----------------
    const captionCheck = checkCaptions({ manifest, paths, output, probed, file });
    failures.push(...captionCheck.failures);
    warnings.push(...captionCheck.warnings);

    results.push({
      output: output.aspect,
      file,
      resolution: `${probed.width}x${probed.height}`,
      durationMs: Math.round(probed.durationMs),
      fps: probed.fps,
      hasAudio: probed.hasAudio,
      ok: failures.length === 0,
      failures,
      warnings,
    });
  }

  // --- per-scene A/V drift: the pipeline's core risk ----------------------
  const sceneDrift = checkSceneSync(manifest.scenes ?? []);
  return {
    ok: results.every((r) => r.ok) && sceneDrift.length === 0,
    outputs: results,
    sceneDrift,
  };
}

/**
 * Captions are burned in, so their presence cannot be probed as a stream.
 * What IS checkable: that a per-scene SRT was generated for this aspect, and
 * that no cue extends past the rendered duration.
 */
function checkCaptions({ manifest, paths, output, probed }) {
  const failures = [];
  const warnings = [];
  if (manifest.meta?.subtitles?.enabled === false) return { failures, warnings };

  const missing = [];
  let lastCueMs = 0;
  for (const scene of manifest.scenes ?? []) {
    const srt = path.join(paths.processed, `${scene.id}.${output.aspect}.srt`);
    if (!existsSync(srt)) {
      missing.push(scene.id);
      continue;
    }
    const text = readFileSync(srt, 'utf8');
    const ends = [...text.matchAll(/-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})/g)].map((m) => tc(m[1]));
    lastCueMs = Math.max(lastCueMs, ...(ends.length ? ends : [0]));
  }

  if (missing.length === (manifest.scenes ?? []).length) {
    failures.push('no burned-in captions were generated for any scene');
  } else if (missing.length) {
    warnings.push(`captions missing for ${missing.length} scene(s): ${missing.slice(0, 5).join(', ')}`);
  }

  // Per-scene SRTs are scene-relative, so each must fit inside its own scene;
  // the loose bound here catches a cue longer than the entire video.
  if (Number.isFinite(probed.durationMs) && lastCueMs > probed.durationMs) {
    failures.push(`a caption cue ends at ${Math.round(lastCueMs)}ms, past the ${Math.round(probed.durationMs)}ms video`);
  }
  return { failures, warnings };
}

function tc(stamp) {
  const m = /(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})/.exec(stamp);
  if (!m) return 0;
  return Number(m[1]) * 3_600_000 + Number(m[2]) * 60_000 + Number(m[3]) * 1000 + Number(m[4].padEnd(3, '0'));
}

function findOutput(outputDir, manifest, aspect) {
  const slug = String(manifest.meta?.title ?? 'video').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const candidate = path.join(outputDir, `${slug || 'video'}.${aspect}.mp4`);
  return existsSync(candidate) ? candidate : null;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (isMainModule(import.meta.url)) {
  const { parseArgs } = await import('./synthesize.mjs');
  const args = parseArgs(process.argv.slice(2));
  const workDir = presentationContext({ root: args.root, presentation: args.presentation }).paths.workDir;
  const manifest = JSON.parse(readFileSync(path.join(workDir, 'storyboard.json'), 'utf8'));
  const result = await verify({ workDir, manifest, options: { file: args.file } });

  for (const o of result.outputs) {
    console.log(`${o.ok ? 'PASS' : 'FAIL'} ${o.output}: ${o.file ?? '(missing)'}`);
    if (o.resolution) console.log(`  ${o.resolution} @ ${o.fps}fps, ${Math.round((o.durationMs ?? 0) / 1000)}s, audio=${o.hasAudio}`);
    for (const f of o.failures) console.error(`  FAIL ${f}`);
    for (const w of o.warnings) console.warn(`  warn ${w}`);
  }
  for (const d of result.sceneDrift) console.error(`  FAIL scene drift ${d}`);
  console.log(result.ok ? 'quality gate PASSED' : 'quality gate FAILED');
  process.exitCode = result.ok ? 0 : 1;
}
