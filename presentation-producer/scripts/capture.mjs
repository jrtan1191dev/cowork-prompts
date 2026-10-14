/**
 * presentation-producer :: visual capture (stage 3)
 *
 * Uses Playwright's first-party screencast API rather than hand-rolled overlays.
 * Verified present in playwright 1.63.0 (`page.screencast`):
 *
 *   showActions({cursor:'pointer'})  animated cursor that travels between
 *                                    action points, plus an action-title label
 *   showChapter(title, {description}) centred chapter card, blurred backdrop
 *   showOverlay(html, {duration})     arbitrary HTML callout, pointer-events:none
 *   start({onFrame})                  JPEG frames WITH timestamps
 *
 * That last one matters: recordVideo caps near 25fps and is variable-rate,
 * which Remotion refuses outright. Capturing frames and encoding them ourselves
 * yields exact constant-frame-rate output.
 *
 * State handling (D12): storageState for auth, setupScript for anything that
 * must happen before the app bootstraps, and a fixed clock so relative
 * timestamps ("waiting 45 min") do not change between runs.
 */

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { ASPECTS, SLIDE_ENGINES, captureCacheKey, estimateNarrationMs, isMainModule, msToFrames, normaliseTimestamps, resampleToCfr } from './lib/core.mjs';
import { Ffmpeg, cfrEncodeArgs, normaliseClipArgs, stillClipArgs } from './lib/ffmpeg.mjs';
import { Ledger, resolveAppVersion } from './lib/ledger.mjs';
import { presentationContext, probe } from './lib/probe.mjs';

/** Failing a scene assertion aborts the run: a missing scene changes the story. */
export class SceneAssertionError extends Error {
  constructor(sceneId, detail) {
    super(`scene "${sceneId}" precondition failed: ${detail}`);
    this.name = 'SceneAssertionError';
    this.sceneId = sceneId;
  }
}

/**
 * Assert the page is showing what the storyboard claims before recording.
 * This is the check the plan's ffprobe gate could never make: a 404, a login
 * screen, an empty table or a stuck spinner all pass "correct resolution, has
 * audio, not black".
 */
export async function assertSceneState(page, scene, { timeout = 15_000 } = {}) {
  const spec = scene.assert;
  if (!spec) return { checked: false };

  for (const text of spec.visible ?? []) {
    try {
      await page.getByText(text, { exact: false }).first().waitFor({ state: 'visible', timeout });
    } catch {
      throw new SceneAssertionError(scene.id, `expected text "${text}" to be visible`);
    }
  }
  for (const selector of spec.visibleSelectors ?? []) {
    try {
      await page.locator(selector).first().waitFor({ state: 'visible', timeout });
    } catch {
      throw new SceneAssertionError(scene.id, `expected selector "${selector}" to be visible`);
    }
  }
  for (const text of spec.notVisible ?? []) {
    const count = await page.getByText(text, { exact: false }).count();
    if (count > 0) {
      throw new SceneAssertionError(scene.id, `forbidden text "${text}" is present (error state?)`);
    }
  }
  return { checked: true };
}

/**
 * Resolve a locator from the storyboard.
 *
 * Primary path is the stored semantic locator (D16). On failure the target
 * description is re-resolved against the live accessibility tree, the
 * substitution is REPORTED, and the storyboard is rewritten — so a renamed
 * button degrades gracefully instead of failing the build, but never drifts
 * silently.
 */
export async function resolveTarget(page, step, report) {
  const attempts = [];
  if (step.role && step.name) attempts.push({ how: `role=${step.role}[name="${step.name}"]`, locator: page.getByRole(step.role, { name: step.name }) });
  if (step.text) attempts.push({ how: `text="${step.text}"`, locator: page.getByText(step.text, { exact: false }) });
  if (step.label) attempts.push({ how: `label="${step.label}"`, locator: page.getByLabel(step.label) });
  if (step.testId) attempts.push({ how: `testId=${step.testId}`, locator: page.getByTestId(step.testId) });
  if (step.selector) attempts.push({ how: `css=${step.selector}`, locator: page.locator(step.selector) });

  for (const attempt of attempts) {
    const first = attempt.locator.first();
    if ((await first.count()) > 0) return { locator: first, how: attempt.how, substituted: false };
  }

  // Fallback: resolve the human description semantically.
  if (step.target) {
    const guesses = [
      page.getByRole('button', { name: new RegExp(escapeRe(step.target), 'i') }),
      page.getByRole('link', { name: new RegExp(escapeRe(step.target), 'i') }),
      page.getByText(new RegExp(escapeRe(step.target), 'i')),
    ];
    for (const guess of guesses) {
      const first = guess.first();
      if ((await first.count()) > 0) {
        const how = `semantic match for "${step.target}"`;
        report.substitutions.push({ step, resolvedTo: how });
        return { locator: first, how, substituted: true };
      }
    }
  }
  throw new Error(`could not resolve a target for step ${JSON.stringify(step)}`);
}

// ---------------------------------------------------------------------------
// Capture
// ---------------------------------------------------------------------------

/**
 * Capture one scene.
 * `screencast` records frames and encodes them at exact CFR.
 * `stills` takes deterministic screenshots with CSS animation disabled.
 */
async function captureScene({ browser, scene, manifest, paths, ff, report, options }) {
  const fps = manifest.meta?.fps ?? 30;
  const aspect = ASPECTS[manifest.meta?.captureAspect ?? 'landscape'];
  const viewport = scene.viewport ?? aspect;
  const spec = scene.actionSpec ?? {};

  const contextOptions = {
    viewport,
    deviceScaleFactor: 1,
    reducedMotion: scene.captureMode === 'stills' ? 'reduce' : 'no-preference',
  };
  // Auth comes from a gitignored storageState, never from committed credentials.
  if (existsSync(paths.authState)) contextOptions.storageState = paths.authState;

  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();

  try {
    // Fixed clock so relative timestamps are reproducible across runs (D12).
    const fixedTime = manifest.meta?.fixedTime;
    if (fixedTime && page.clock) {
      await page.clock.install({ time: new Date(fixedTime) });
      await page.clock.setFixedTime(new Date(fixedTime));
    }

    // Pre-bootstrap state hook — the only thing that can express e.g. seeding
    // localStorage before an SPA reads it.
    if (spec.setupScript) {
      const mod = await import(pathToFileURL(path.resolve(paths.workDir, spec.setupScript)).href);
      await mod.default?.({ page, context, scene });
    }

    const url = new URL(spec.url ?? '/', options.baseUrl).toString();
    await page.goto(url, { waitUntil: spec.waitUntil ?? 'networkidle', timeout: 60_000 });
    await assertSceneState(page, scene);

    if (scene.captureMode === 'stills') {
      return await captureStills({ page, scene, paths, ff, fps, viewport, report });
    }
    return await captureScreencast({ page, scene, paths, ff, fps, viewport, report, spec });
  } finally {
    await context.close();
  }
}

/**
 * Stills: one screenshot per state, held for its share of the scene.
 * `animations: 'disabled'` stops CSS animations and fast-forwards transitions,
 * which is what makes the output byte-stable — otherwise every pulsing badge
 * randomises the capture and defeats the content-addressed cache.
 */
async function captureStills({ page, scene, paths, ff, fps, viewport, report }) {
  const dir = path.join(paths.frames, scene.id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const sceneMs = scene.resolvedTiming?.sceneMs ?? scene.resolvedAudio?.durationMs ?? 5000;
  const shot = path.join(dir, 'still.png');
  await page.screenshot({ path: shot, animations: 'disabled', caret: 'hide', scale: 'css' });

  const roi = await captureRoi(page, scene);
  const out = path.join(paths.recordings, `${scene.id}.mp4`);
  mkdirSync(paths.recordings, { recursive: true });

  // A single still stretched across the scene: exact duration, exact CFR.
  await ff.run([
    '-y', '-loop', '1', '-framerate', String(fps), '-i', shot,
    '-t', (sceneMs / 1000).toFixed(3),
    '-vf', `scale=${viewport.width}:${viewport.height},fps=${fps},format=yuv420p`,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-fps_mode', 'cfr',
    '-movflags', '+faststart', out,
  ]);

  report.scenes.push({ id: scene.id, mode: 'stills', durationMs: sceneMs, frames: msToFrames(sceneMs, fps) });
  return { path: out, durationMs: sceneMs, roi, frameCount: msToFrames(sceneMs, fps) };
}

/**
 * Screencast: collect timestamped frames, then resample to exact CFR.
 * Native decorations (cursor, action labels, chapter cards) are switched on so
 * we do not hand-roll cursor SVGs or highlight helpers.
 */
async function captureScreencast({ page, scene, paths, ff, fps, viewport, report, spec }) {
  const dir = path.join(paths.frames, scene.id);
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });

  const frames = [];
  const timestamps = [];

  let actions;
  if (page.screencast?.showActions && spec.showActions !== false) {
    actions = await page.screencast.showActions({
      cursor: 'pointer',
      duration: spec.actionLabelMs ?? 600,
      position: spec.actionLabelPosition ?? 'top-right',
      fontSize: 24,
    });
  }

  await page.screencast.start({
    size: viewport,
    quality: 90,
    onFrame: ({ data, timestamp }) => {
      frames.push(Buffer.from(data));
      timestamps.push(timestamp);
    },
  });

  const started = Date.now();
  if (scene.chapter && page.screencast?.showChapter) {
    await page.screencast.showChapter(scene.chapter.title ?? scene.title ?? scene.id, {
      description: scene.chapter.description,
      duration: scene.chapter.durationMs ?? 2000,
    });
  }

  const roi = await runSteps(page, scene, spec, report);

  // Hold the final state so the last action is legible before the cut.
  await page.waitForTimeout(spec.tailMs ?? 600);
  await page.screencast.stop();
  await actions?.dispose?.();

  const wallMs = Date.now() - started;
  if (frames.length === 0) throw new Error(`scene "${scene.id}" produced no frames`);

  // Write the resampled sequence: exactly the frames a CFR timeline needs.
  const times = normaliseTimestamps(timestamps);
  const durationMs = Math.max(times.at(-1) ?? wallMs, 200);
  const plan = resampleToCfr(times, durationMs, fps);
  plan.forEach((sourceIndex, outIndex) => {
    writeFileSync(path.join(dir, `${String(outIndex + 1).padStart(6, '0')}.jpg`), frames[sourceIndex]);
  });

  const out = path.join(paths.recordings, `${scene.id}.mp4`);
  mkdirSync(paths.recordings, { recursive: true });
  await ff.run(cfrEncodeArgs({ pattern: path.join(dir, '%06d.jpg'), fps, out }));

  report.scenes.push({
    id: scene.id,
    mode: 'screencast',
    durationMs,
    sourceFrames: frames.length,
    outputFrames: plan.length,
    sourceFps: Math.round((frames.length / (durationMs / 1000)) * 10) / 10,
  });
  return { path: out, durationMs, roi, frameCount: plan.length };
}

/** Execute the scene's steps, returning the ROI of the last acted element. */
async function runSteps(page, scene, spec, report) {
  let roi = null;
  for (const step of spec.steps ?? []) {
    switch (step.action) {
      case 'navigate':
        await page.goto(new URL(step.value ?? step.url, page.url()).toString(), { waitUntil: 'networkidle' });
        break;
      case 'wait':
        await page.waitForTimeout(step.delayMs ?? 1000);
        break;
      case 'waitForText':
        await page.getByText(step.value, { exact: false }).first().waitFor({ state: 'visible', timeout: 30_000 });
        break;
      case 'scroll':
        await page.mouse.wheel(0, step.delta ?? 600);
        await page.waitForTimeout(step.delayMs ?? 400);
        break;
      case 'click': {
        const { locator } = await resolveTarget(page, step, report);
        roi = (await locator.boundingBox()) ?? roi;
        await locator.click({ timeout: 15_000 });
        await page.waitForTimeout(step.delayMs ?? 500);
        break;
      }
      case 'fill': {
        const { locator } = await resolveTarget(page, step, report);
        roi = (await locator.boundingBox()) ?? roi;
        // pressSequentially gives natural typing cadence — a native API rather
        // than a bespoke per-character loop.
        await locator.click();
        await locator.pressSequentially(String(step.value ?? ''), { delay: step.typeDelayMs ?? 60 });
        break;
      }
      case 'selectOption': {
        // Native <select> elements: Playwright's own selectOption() sets the
        // value directly and fires the change event, avoiding the OS-level
        // popup that makes keyboard-only navigation unreliable under CDP.
        const { locator } = await resolveTarget(page, step, report);
        roi = (await locator.boundingBox()) ?? roi;
        await locator.selectOption(String(step.value ?? ''));
        await page.waitForTimeout(step.delayMs ?? 500);
        break;
      }
      case 'press':
        await page.keyboard.press(step.value ?? 'Enter');
        await page.waitForTimeout(step.delayMs ?? 400);
        break;
      case 'highlight': {
        const { locator } = await resolveTarget(page, step, report);
        const box = await locator.boundingBox();
        roi = box ?? roi;
        if (box && page.screencast?.showOverlay) {
          // Native overlay instead of injecting outline/box-shadow CSS.
          const overlay = await page.screencast.showOverlay(
            `<div style="position:fixed;left:${box.x - 6}px;top:${box.y - 6}px;` +
              `width:${box.width + 12}px;height:${box.height + 12}px;` +
              'border:3px solid #3b82f6;border-radius:10px;' +
              'box-shadow:0 0 28px rgba(59,130,246,.55);"></div>',
            { duration: step.delayMs ?? 2000 }
          );
          await page.waitForTimeout(step.delayMs ?? 2000);
          await overlay?.dispose?.();
        }
        break;
      }
      case 'callout':
        if (page.screencast?.showOverlay) {
          const overlay = await page.screencast.showOverlay(step.html ?? `<div>${step.value ?? ''}</div>`, {
            duration: step.delayMs ?? 2500,
          });
          await page.waitForTimeout(step.delayMs ?? 2500);
          await overlay?.dispose?.();
        }
        break;
      default:
        report.warnings.push(`${scene.id}: unknown step action "${step.action}" ignored`);
    }
  }
  return roi;
}

/** Region of interest for vertical reframing (D10). */
async function captureRoi(page, scene) {
  const target = scene.roiSelector ?? scene.actionSpec?.roiSelector;
  if (!target) return scene.roi ?? null;
  try {
    return (await page.locator(target).first().boundingBox()) ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Non-browser engines
// ---------------------------------------------------------------------------

/** Manual/PIP footage: referenced by path, and a missing take fails loudly (D8). */
async function ingestFootage({ scene, paths, ff, manifest }) {
  const src = path.resolve(paths.workDir, scene.actionSpec.src);
  if (!existsSync(src)) {
    const generated = scene.actionSpec.generate;
    throw new Error(
      `scene "${scene.id}" references footage that does not exist: ${scene.actionSpec.src}. ` +
        (generated
          ? 'It declares a `generate` block, so produce it once and commit it — generated footage is frozen as an input, not regenerated per run.'
          : 'Manual footage is referenced by path, never silently skipped.')
    );
  }
  const aspect = ASPECTS[manifest.meta?.captureAspect ?? 'landscape'];
  const out = path.join(paths.recordings, `${scene.id}.mp4`);
  mkdirSync(paths.recordings, { recursive: true });
  await ff.run(
    normaliseClipArgs({
      input: src,
      fps: manifest.meta?.fps ?? 30,
      out,
      ...aspect,
      // Without this the scene is silent: synthesize skips TTS for
      // useFootageAudio, so stripping the take's audio leaves nothing (F2).
      keepAudio: Boolean(scene.useFootageAudio),
      trim: scene.actionSpec.trim ?? null,
    })
  );
  return { path: out, durationMs: await ff.durationMs(out), roi: null };
}

/**
 * Hold a rendered slide for the scene's duration.
 *
 * deck.mjs renders slides before the outline gate and writes PNGs; this is the
 * step that was previously delegated to a `render-assets.mjs` that never
 * existed, so slide scenes were silently skipped with a warning (F1).
 */
async function buildSlideClip({ scene, paths, ff, manifest }) {
  const aspectName = manifest.meta?.captureAspect ?? 'landscape';
  const suffix = aspectName === 'landscape' ? '' : `.${aspectName}`;
  const image = path.join(paths.slides, `${scene.id}${suffix}.png`);
  if (!existsSync(image)) {
    throw new Error(
      `scene "${scene.id}" has no rendered slide at ${path.relative(paths.workDir, image)}. ` +
        'Run deck.mjs first — it renders slides before the outline gate so they can be reviewed before any spend.'
    );
  }
  const durationMs =
    scene.resolvedTiming?.sceneMs ?? scene.resolvedAudio?.durationMs ?? estimateNarrationMs(scene.narration);
  const out = path.join(paths.recordings, `${scene.id}.mp4`);
  mkdirSync(paths.recordings, { recursive: true });
  await ff.run(
    stillClipArgs({
      image,
      fps: manifest.meta?.fps ?? 30,
      durationMs,
      out,
      ...ASPECTS[aspectName],
    })
  );
  return { path: out, durationMs: await ff.durationMs(out), roi: null };
}

// ---------------------------------------------------------------------------
// Stage entry point
// ---------------------------------------------------------------------------

export async function capture({ workDir, manifest, options = {} }) {
  const { paths, capabilities, bins } = await probe(workDir);
  const ff = new Ffmpeg(bins);
  const ledger = new Ledger(paths.ledger, { noCache: options.noCache });
  const report = { scenes: [], warnings: [], substitutions: [] };

  const { version: appVersion, source, note } = await resolveAppVersion({
    explicit: options.appVersion,
    cwd: options.appDir ?? process.cwd(),
  });
  if (note) report.warnings.push(note);
  report.appVersion = { version: appVersion, source };

  const needsBrowser = !options.onlySlides && manifest.scenes.some((s) => s.visualEngine === 'playwright_web');
  let browser = null;
  if (needsBrowser) {
    if (!capabilities.playwright) throw new Error('Playwright/Chromium missing — run bootstrap.mjs');
    process.env.PLAYWRIGHT_BROWSERS_PATH = paths.browsers; // required at run time too
    const { chromium } = await import(path.join(paths.nodeModules, 'playwright', 'index.mjs'));
    browser = await chromium.launch({ headless: options.headless !== false });
  }

  try {
    // Slides are elastic: their clip length comes from the narration, so they
    // are built in a second pass after synthesis. Screencast scenes are the
    // opposite — inelastic — which is why they are captured first and narration
    // is fitted to them. Filtering here keeps that ordering explicit.
    const wanted = (s) =>
      options.onlySlides ? SLIDE_ENGINES.has(s.visualEngine)
        : options.skipSlides ? !SLIDE_ENGINES.has(s.visualEngine)
        : true;

    for (const scene of manifest.scenes.filter(wanted)) {
      const key = captureCacheKey(scene, appVersion);
      const cached = ledger.get(key, `${scene.id} capture`);
      if (cached) {
        scene.resolvedVisual = { filePath: path.relative(workDir, cached.path), durationMs: cached.durationMs, roi: cached.roi ?? null, hash: key, reused: true };
        report.scenes.push({ id: scene.id, mode: 'cached', durationMs: cached.durationMs });
        continue;
      }

      let result;
      if (scene.visualEngine === 'playwright_web') {
        result = await captureScene({ browser, scene, manifest, paths, ff, report, options });
      } else if (scene.visualEngine === 'manual_footage') {
        result = await ingestFootage({ scene, paths, ff, manifest });
      } else if (SLIDE_ENGINES.has(scene.visualEngine)) {
        result = await buildSlideClip({ scene, paths, ff, manifest });
      } else {
        // vhs_terminal / remotion_motion still expect a pre-rendered clip.
        const pre = path.join(paths.recordings, `${scene.id}.mp4`);
        if (!existsSync(pre)) {
          report.warnings.push(`${scene.id}: no asset for engine "${scene.visualEngine}"`);
          continue;
        }
        result = { path: pre, durationMs: await ff.durationMs(pre), roi: null };
      }

      ledger.put(key, { path: result.path, durationMs: result.durationMs, roi: result.roi }, `${scene.id} capture`);
      scene.resolvedVisual = {
        filePath: path.relative(workDir, result.path),
        durationMs: result.durationMs,
        roi: result.roi ?? null,
        hash: key ?? null,
      };
      if (result.roi) scene.roi = result.roi;
    }
  } finally {
    await browser?.close();
  }

  ledger.save();
  report.cache = ledger.report();
  return { manifest, report };
}

function escapeRe(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

  const { manifest: updated, report } = await capture({
    workDir,
    manifest,
    options: {
      baseUrl: args.baseUrl ?? manifest.meta?.baseUrl ?? 'http://127.0.0.1:8080',
      appVersion: args['app-version'],
      appDir: args.appDir,
      noCache: Boolean(args['no-cache']),
      headless: args.headed ? false : true,
    },
  });
  writeFileSync(manifestPath, `${JSON.stringify(updated, null, 2)}\n`);
  console.log(`app version: ${report.appVersion.version ?? '(unresolved — captures rebuilt)'} [${report.appVersion.source}]`);
  for (const s of report.scenes) console.log(`  ${s.id}: ${s.mode} ${Math.round(s.durationMs)}ms${s.sourceFps ? ` (source ~${s.sourceFps}fps -> ${s.outputFrames} frames)` : ''}`);
  for (const sub of report.substitutions) console.warn(`  substituted locator: ${JSON.stringify(sub)}`);
  for (const w of report.warnings) console.warn(`  warning: ${w}`);
  console.log(report.cache);
}
