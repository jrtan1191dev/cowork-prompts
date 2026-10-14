#!/usr/bin/env node
/**
 * presentation-producer :: orchestrator
 *
 * Runs the stages with an OUTLINE GATE before any expensive, side-effecting or
 * billable work. Authoring is cheap and reversible; synthesis and capture are
 * slow and (on paid providers) metered — so the pipeline spends generously on
 * planning and stops hard before execution.
 *
 * Resumability comes from the content-addressed ledger: after fixing one scene,
 * a rerun costs that scene alone.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';

import { SLIDE_ENGINES, estimateNarrationMs, estimateRuntimeMs, isMainModule, selectEngine, selectOutputs, validateManifest } from './lib/core.mjs';
import { allowedSceneTypes, presentationContext, probe } from './lib/probe.mjs';
import { changedSceneIds } from './lib/ledger.mjs';
import { capture } from './capture.mjs';
import { compile } from './compile.mjs';
import { renderDeck } from './deck.mjs';
import { MODES, presentationMeta } from './lib/deck.mjs';
import { compose } from './compose.mjs';
import { availableProviders, parseArgs, positionals, resolveProvider, resolveVoiceId, synthesise } from './synthesize.mjs';
import { verify } from './verify.mjs';

/** Approximate cost of paid TTS, for the outline gate. */
const COST_PER_1K_CHARS = { openai: 0.015, elevenlabs: 0.3, gemini: 0.01 };

/**
 * Render the pre-spend outline: scene count, per-scene duration, total runtime,
 * engine decision, provider, estimated cost, and cache reuse.
 */
export function renderOutline({ manifest, engine, provider, voiceId, changed, allowed }) {
  const lines = [];
  const fps = manifest.meta?.fps ?? 30;
  const outputs = (manifest.meta?.outputs ?? [{ aspect: 'landscape' }]).map((o) => o.aspect).join(', ');

  lines.push(`title:    ${manifest.meta?.title ?? '(untitled)'}`);
  lines.push(`outputs:  ${outputs} @ ${fps}fps  (captured as ${manifest.meta?.captureAspect ?? 'landscape'})`);
  lines.push(`engine:   ${engine.engine} — ${engine.reason}`);
  lines.push(`voice:    ${provider}${voiceId ? ` / ${voiceId}` : ''}`);
  lines.push(`captions: burned in, placement derived per aspect`);
  lines.push('');
  lines.push('scenes:');

  let chars = 0;
  manifest.scenes.forEach((scene, i) => {
    const ms = scene.resolvedTiming?.sceneMs ?? estimateNarrationMs(scene.narration);
    chars += String(scene.narration ?? '').length;
    const flag = changed?.includes(scene.id) ? ' [changed]' : scene.resolvedAudio ? ' [cached]' : '';
    const mode = scene.captureMode ?? (SLIDE_ENGINES.has(scene.visualEngine) ? 'stills' : 'screencast');
    const unsupported = allowed && !allowed.includes(scene.visualEngine) ? '  !! unsupported here' : '';
    lines.push(
      `  ${String(i + 1).padStart(2, '0')}. ${scene.id.padEnd(24)} ${String(Math.round(ms / 1000) + 's').padStart(5)}` +
        `  ${scene.visualEngine}/${mode}${flag}${unsupported}`
    );
  });

  const totalMs = estimateRuntimeMs(manifest);
  lines.push('');
  lines.push(`runtime:  ~${Math.floor(totalMs / 60_000)}m ${Math.round((totalMs % 60_000) / 1000)}s across ${manifest.scenes.length} scenes`);
  const rate = COST_PER_1K_CHARS[provider];
  lines.push(`cost:     ${rate ? `~$${((chars / 1000) * rate).toFixed(2)} (${chars} chars @ $${rate}/1k)` : '$0.00 (local/free provider)'}`);
  return lines.join('\n');
}

async function confirm(question) {
  if (!process.stdin.isTTY) return false;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(`${question} [y/N] `);
    return /^y(es)?$/i.test(answer.trim());
  } finally {
    rl.close();
  }
}

/**
 * Pre-approval summary for a slides run.
 *
 * Deliberately not `renderOutline()`: that reports per-scene seconds, total
 * runtime, TTS provider, caption placement and estimated cost, none of which
 * exist for a deck. Printing them as zeroes would be stating facts that are not
 * facts (D12).
 */
export function renderSlidesSummary({ manifest, report }) {
  const byOrientation = new Map();
  for (const s of report.slides) byOrientation.set(s.orientation, (byOrientation.get(s.orientation) ?? 0) + 1);
  const layouts = [...new Set(report.slides.map((s) => s.layout))].sort();

  return [
    `title:    ${manifest.meta?.title ?? '(untitled)'}`,
    `deck:     ${manifest.meta?.deck?.engine ?? 'html'} engine, ${manifest.meta?.deck?.theme ?? 'light'} theme`,
    `renders:  ${[...byOrientation].map(([o, n]) => `${n} ${o}`).join(', ') || 'none'}`,
    `formats:  ${report.formats.join(', ')}`,
    `layouts:  ${layouts.join(', ') || 'none'}`,
    `outputs:  ${report.artifacts.length ? report.artifacts.map((a) => path.relative(process.cwd(), a)).join('\n          ') : '(png only)'}`,
  ].join('\n');
}

/**
 * Load the parsed storyline, or null when the YAML runtime is not installed.
 *
 * The parser lives behind the install boundary on purpose, which is why the mode
 * guard degrades to "cannot check" rather than failing: a storyboard can still be
 * built from an already-compiled lockfile.
 */
async function loadStoryline(workDir, storylinePath) {
  if (!existsSync(storylinePath)) return null;
  const { presentationPaths } = await import('./lib/probe.mjs');
  const yamlEntry = path.join(presentationPaths(workDir).nodeModules, 'yaml', 'dist', 'index.js');
  if (!existsSync(yamlEntry)) return null;
  const YAML = await import(yamlEntry);
  return YAML.parse(readFileSync(storylinePath, 'utf8'));
}

export async function generate(options) {
  const workDir = options.workDir ?? presentationContext({ root: options.root, presentation: options.presentation }).paths.workDir;
  const manifestPath = path.join(workDir, 'storyboard.json');
  const storylinePath = path.join(workDir, 'storyline.yml');
  const storylineSource = await loadStoryline(workDir, storylinePath);

  // --- mode guard: the CLI word must agree with the declaration -----------
  // Mode is a property of the presentation (D9), so the word on the command line
  // is a guard rather than a selector. Disagreement is the likely shape of "I
  // picked the wrong presentation", which is worth catching before a compile.
  const declaredMode = storylineSource ? (presentationMeta(storylineSource).mode ?? 'video') : null;
  if (options.mode && declaredMode && options.mode !== declaredMode) {
    throw new Error(
      `${path.basename(workDir)} is a ${declaredMode} presentation, but you asked for ${options.mode}. ` +
        `Run \`${declaredMode}\` instead, or pick a different --presentation.`
    );
  }
  const mode = declaredMode ?? options.mode ?? 'video';

  // --- compile the authored storyline into the storyboard lockfile -------
  // storyline.yml is source; storyboard.json is generated and committed, so the
  // compiled cost — scene count, durations, capture actions — shows up in a
  // diff rather than hiding in a build directory.
  let compiled = null;
  if (existsSync(storylinePath) && options.compile !== false) {
    compiled = await compile({ workDir, force: Boolean(options.force) });
    console.log(
      `compiled storyline.yml: ${compiled.counts.entries} entries -> ${compiled.counts.scenes} scenes` +
        (compiled.counts.deckOnly ? ` (${compiled.counts.deckOnly} deck-only)` : '')
    );
    for (const w of compiled.warnings) console.warn(`  warning: ${w}`);
  }

  if (!existsSync(manifestPath)) {
    throw new Error(
      `no storyboard at ${manifestPath}. Author storyline.yml and let compile.mjs generate it ` +
        '(see references/storyline-authoring.md), or hand-author a storyboard (references/storyboard-schema.md).'
    );
  }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));

  // --- slides: render, verify, stop --------------------------------------
  // No approval gate. The gate exists to stop before slow, billable work, and a
  // deck has none: the run is idempotent, the PNGs are the review surface, and
  // the one file a human may have edited is protected by its generated-file
  // marker. A gate guarding nothing would also make every non-interactive run a
  // silent no-op, because confirm() declines without a TTY (D18).
  if (mode === 'slides') {
    const d = await renderDeck({
      workDir, manifest, storylineSource,
      options: { allowOverflow: Boolean(options.allowOverflow), formats: options.formats },
    });
    const verification = await verify({ workDir, manifest, options: { mode: 'slides', deck: d.report } });
    console.log(`\n${renderSlidesSummary({ manifest, report: d.report })}\n`);
    for (const w of d.report.warnings) console.warn(`  warning: ${w}`);
    return { stopped: false, mode, reports: { deck: d.report, verify: verification }, ok: verification.ok };
  }

  // --- validate before anything else -------------------------------------
  const errors = validateManifest(manifest);
  if (errors.length) {
    throw new Error(`storyboard is invalid:\n  ${errors.join('\n  ')}`);
  }

  const { capabilities, bins } = await probe(workDir);
  const allowed = allowedSceneTypes(capabilities);
  const { available } = await availableProviders({ capabilities, bins });
  const provider = resolveProvider(options.tts ?? manifest.meta?.voice?.provider ?? 'auto', available, {
    acknowledgeEdge: options.acknowledgeEdgeTts,
  });
  const voiceId = resolveVoiceId({
    provider,
    gender: options.voiceGender ?? manifest.meta?.voice?.gender ?? null,
    voiceId: manifest.meta?.voice?.voiceId ?? null,
  });

  // A one-off `--aspect` must not rewrite the committed storyboard, so the
  // narrowed output list lives on a planning view. `scenes` is shared by
  // reference, so resolved timings still land on the manifest that gets saved.
  const outputs = selectOutputs(manifest, options.aspect ?? null);
  const planned = { ...manifest, meta: { ...manifest.meta, outputs } };

  const engine = selectEngine(planned, capabilities, options.engine ?? null);
  const changed = await changedSceneIds(manifestPath);

  // --- render slides BEFORE the gate ------------------------------------
  // Slide rendering is cheap and non-billable, and it is the only way to see
  // that a card clipped. Overflow is a hard failure here so it is fixed before
  // a single TTS call is made.
  const reports = {};
  if (manifest.scenes.some((s) => SLIDE_ENGINES.has(s.visualEngine))) {
    const d = await renderDeck({
      workDir, manifest: planned, storylineSource,
      options: { allowOverflow: Boolean(options.allowOverflow) },
    });
    reports.deck = d.report;
    console.log(`rendered ${d.report.slides.length} slide render(s) across ${d.report.orientations.join(', ')}`);
    for (const w of d.report.warnings) console.warn(`  warning: ${w}`);
  }

  // --- outline gate: stop before spending --------------------------------
  const outline = renderOutline({ manifest: planned, engine, provider, voiceId, changed, allowed });
  console.log(`\n${outline}\n`);

  const unsupported = manifest.scenes.filter((s) => !allowed.includes(s.visualEngine));
  if (unsupported.length) {
    console.warn(
      `warning: ${unsupported.length} scene(s) use engines unavailable here ` +
        `(${[...new Set(unsupported.map((s) => s.visualEngine))].join(', ')}). They will degrade or be skipped.`
    );
  }

  if (!options.yes) {
    const approved = await confirm('Proceed with synthesis and capture?');
    if (!approved) {
      console.log('stopped at the outline gate — nothing was synthesised or captured');
      return { stopped: true, outline };
    }
  }

  // --- capture first when scenes are screencast: their real duration is the
  //     inelastic side that narration must fit (D13). Slides are elastic, so
  //     their clips are built last, once narration length is known. ---------
  const hasSlides = manifest.scenes.some((s) => SLIDE_ENGINES.has(s.visualEngine));
  const hasScreencast = manifest.scenes.some(
    (s) => !SLIDE_ENGINES.has(s.visualEngine) && (s.captureMode ?? 'screencast') === 'screencast'
  );
  const order = hasScreencast ? ['capture', 'synthesise'] : ['synthesise', 'capture'];
  if (hasSlides) order.push('slides');

  const captureOptions = {
    baseUrl: options.baseUrl ?? manifest.meta?.baseUrl ?? 'http://127.0.0.1:8080',
    appVersion: options.appVersion,
    appDir: options.appDir,
    noCache: options.noCache,
    headless: options.headless,
  };

  for (const stage of order) {
    if (stage === 'capture') {
      const r = await capture({
        workDir, manifest,
        // Slides are excluded here and built in the `slides` pass: holding a
        // still needs the narration length, which synthesis has not produced yet.
        options: { ...captureOptions, skipSlides: hasSlides },
      });
      reports.capture = r.report;
    } else if (stage === 'slides') {
      const r = await capture({ workDir, manifest, options: { ...captureOptions, onlySlides: true } });
      reports.slideClips = r.report;
    } else {
      const r = await synthesise({
        workDir, manifest,
        options: {
          tts: provider,
          voiceGender: options.voiceGender,
          noCache: options.noCache,
          acknowledgeEdgeTts: options.acknowledgeEdgeTts,
        },
      });
      reports.synthesise = r.report;
    }
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  // Second synthesis pass: now that visuals have real durations, narration can
  // be fitted to the inelastic ones.
  if (order[0] === 'capture') {
    const r = await synthesise({
      workDir, manifest,
      options: {
        tts: provider,
        voiceGender: options.voiceGender,
        noCache: false,
        acknowledgeEdgeTts: options.acknowledgeEdgeTts,
      },
    });
    reports.synthesise = r.report;
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  const composed = await compose({ workDir, manifest: planned, options: { engine: options.engine, noCache: options.noCache } });
  reports.compose = composed.report;
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const verification = await verify({ workDir, manifest: planned, options: {} });
  reports.verify = verification;

  return { stopped: false, outline, reports, ok: verification.ok };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (isMainModule(import.meta.url)) {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);
  const word = positionals(argv).find((a) => MODES.has(a)) ?? null;
  const result = await generate({
    mode: word,
    root: args.root,
    presentation: args.presentation,
    workDir: args.workDir,
    baseUrl: args.baseUrl,
    tts: args.tts,
    voiceGender: args['voice-gender'],
    aspect: args.aspect,
    engine: args.engine,
    appVersion: args['app-version'],
    appDir: args.appDir,
    noCache: Boolean(args['no-cache']),
    headless: args.headed ? false : true,
    yes: Boolean(args.yes),
    acknowledgeEdgeTts: Boolean(args['acknowledge-edge-tts']),
  });

  if (result.stopped) process.exit(0);

  console.log('\n--- report ---');
  if (result.reports.synthesise) {
    console.log(`voice: ${result.reports.synthesise.provider} / ${result.reports.synthesise.voiceId ?? '(provider default)'}`);
  }
  if (result.reports.capture?.appVersion) {
    console.log(`app version: ${result.reports.capture.appVersion.version ?? '(unresolved: captures rebuilt)'}`);
  }
  if (result.reports.compose) {
    console.log(`engine: ${result.reports.compose.engine.engine} — ${result.reports.compose.engine.reason}`);
  }
  for (const o of result.reports.verify.outputs) {
    console.log(`${o.ok ? 'PASS' : 'FAIL'} ${o.file ?? o.output} ${o.resolution ?? ''}`);
    for (const f of o.failures) console.error(`  FAIL ${f}`);
    for (const w of o.warnings) console.warn(`  warn ${w}`);
  }
  process.exitCode = result.ok ? 0 : 1;
}
