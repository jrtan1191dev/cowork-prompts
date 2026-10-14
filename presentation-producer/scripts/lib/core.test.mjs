/**
 * Unit tests for video-generator pure logic.
 *
 * Runs with the system node and zero dependencies:
 *   node --test scripts/lib/
 *
 * This is the verification path that does NOT require the ~1GB project-local
 * install, so it works in CI and on a fresh machine.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  ASPECTS,
  PAD_WARN_MS,
  RATE_FIT,
  TAIL_BUFFER_MS,
  audioCacheKey,
  canonicalJson,
  captureCacheKey,
  checkOutput,
  checkSceneSync,
  chooseVerticalStrategy,
  computeReframe,
  digest,
  estimateNarrationMs,
  expectationsFor,
  formatRate,
  framesToMs,
  msToFrames,
  normaliseTimestamps,
  parseBlackdetect,
  parseFreezedetect,
  parseLoudnorm,
  parseSilencedetect,
  planTiming,
  resampleToCfr,
  selectEngine,
  selectOutputs,
  validateManifest,
} from './core.mjs';

// ---------------------------------------------------------------------------
// frames
// ---------------------------------------------------------------------------

test('msToFrames rounds to nearest, not up', () => {
  assert.equal(msToFrames(1000, 30), 30);
  assert.equal(msToFrames(6432, 30), 193); // the plan's worked example
  assert.equal(msToFrames(16, 30), 0); // sub-half-frame rounds down
  assert.equal(msToFrames(17, 30), 1);
});

test('msToFrames rejects nonsense', () => {
  assert.throws(() => msToFrames(-1, 30), RangeError);
  assert.throws(() => msToFrames(100, 0), RangeError);
});

test('framesToMs round-trips', () => {
  assert.equal(framesToMs(30, 30), 1000);
  assert.equal(msToFrames(framesToMs(193, 30), 30), 193);
});

// ---------------------------------------------------------------------------
// D13 timing: the inelastic side dictates
// ---------------------------------------------------------------------------

test('stills scene: audio dictates, visual is synthesised to fit', () => {
  const plan = planTiming({ audioMs: 6000, visualMs: 1, captureMode: 'stills' });
  assert.equal(plan.mode, 'audio-dictates');
  assert.equal(plan.sceneMs, 6000 + TAIL_BUFFER_MS);
  assert.equal(plan.ratePct, 0, 'a still must never cause speech re-rating');
  assert.deepEqual(plan.warnings, []);
});

test('screencast within the inaudible band: rate-fit exactly, no padding', () => {
  // visual 10s => target 9.6s; audio 10s is ~4% long: inside the 7% band.
  const plan = planTiming({ audioMs: 10_000, visualMs: 10_000, captureMode: 'screencast' });
  assert.equal(plan.mode, 'speech-fit');
  assert.equal(plan.sceneMs, 10_000);
  assert.equal(plan.padVisualMs, 0);
  assert.equal(plan.padAudioMs, 0);
  assert.ok(plan.ratePct > 0 && plan.ratePct <= RATE_FIT.INAUDIBLE * 100, `got ${plan.ratePct}`);
});

test('screencast in the middle band: rate capped at the inaudible edge, remainder padded', () => {
  // audio much longer than the visual, but within the 20% cap.
  const plan = planTiming({ audioMs: 11_500, visualMs: 10_000, captureMode: 'screencast' });
  assert.equal(plan.mode, 'speech-fit-capped');
  assert.equal(plan.ratePct, 7, 'rate must be capped at the inaudible edge, not unbounded');
  assert.ok(plan.padVisualMs > 0, 'residual must be absorbed by freezing the visual');
  assert.ok(plan.sceneMs > 10_000);
});

test('screencast with short narration: trailing silence, never a mid-action trim', () => {
  const plan = planTiming({ audioMs: 8_600, visualMs: 10_000, captureMode: 'screencast' });
  assert.equal(plan.padVisualMs, 0);
  assert.ok(plan.padAudioMs > 0, 'audio is padded with silence rather than trimming the visual');
  assert.equal(plan.sceneMs, 10_000, 'the visual keeps its full length');
});

test('beyond the cap: rejected with an actionable warning but still yields a plan', () => {
  const plan = planTiming({ audioMs: 20_000, visualMs: 10_000, captureMode: 'screencast' });
  assert.equal(plan.mode, 'reject');
  assert.equal(plan.ratePct, RATE_FIT.CAP * 100);
  assert.match(plan.warnings.join(' '), /Split the scene or rewrite/);
});

test('excessive freeze padding warns about splitting the scene', () => {
  const plan = planTiming({ audioMs: 11_800, visualMs: 10_000, captureMode: 'screencast' });
  const padded = plan.padVisualMs;
  if (padded > PAD_WARN_MS) assert.match(plan.warnings.join(' '), /splitting this scene/);
  else assert.ok(padded > 0);
});

test('planTiming rejects impossible inputs', () => {
  assert.throws(() => planTiming({ audioMs: 0, visualMs: 100 }), RangeError);
  assert.throws(() => planTiming({ audioMs: 100, visualMs: 0, captureMode: 'screencast' }), RangeError);
});

test('formatRate speaks each provider dialect', () => {
  assert.equal(formatRate(6, 'edge'), '+6%');
  assert.equal(formatRate(-6, 'edge'), '-6%');
  assert.equal(formatRate(6, 'openai'), '1.060');
  assert.equal(formatRate(0, 'kokoro'), '1.000');
  // clamped to the atempo/openai-safe range
  assert.equal(formatRate(500, 'openai'), '2.000');
});

// ---------------------------------------------------------------------------
// D9 screencast resampling
// ---------------------------------------------------------------------------

test('normaliseTimestamps detects seconds and rebases to zero', () => {
  const secs = [1000.0, 1000.04, 1000.08, 1000.12];
  const out = normaliseTimestamps(secs);
  assert.equal(out[0], 0);
  assert.ok(Math.abs(out[3] - 120) < 1e-6, `expected ~120ms, got ${out[3]}`);
});

test('normaliseTimestamps leaves millisecond input alone', () => {
  const ms = Array.from({ length: 50 }, (_, i) => 5_000 + i * 40); // 50 frames over 2s
  const out = normaliseTimestamps(ms);
  assert.equal(out[0], 0);
  assert.equal(out[49], 49 * 40);
});

test('normaliseTimestamps handles empty input', () => {
  assert.deepEqual(normaliseTimestamps([]), []);
  assert.deepEqual(normaliseTimestamps(null), []);
});

test('resampleToCfr produces exactly the requested frame count', () => {
  const times = Array.from({ length: 25 }, (_, i) => i * 40); // 25fps for 1s
  const plan = resampleToCfr(times, 1000, 30);
  assert.equal(plan.length, 30, 'a 30fps second must be exactly 30 frames');
});

test('resampleToCfr is zero-order hold: never invents a future frame', () => {
  const times = [0, 100, 200];
  const plan = resampleToCfr(times, 300, 30);
  // At t=0 the only available frame is index 0.
  assert.equal(plan[0], 0);
  // At t≈99ms (frame 2 of 30fps = 66.7ms) still frame 0.
  assert.equal(plan[2], 0);
  // At t≈100ms (frame 3 = 100ms) frame 1 becomes available.
  assert.equal(plan[3], 1);
  // Monotonic non-decreasing.
  for (let i = 1; i < plan.length; i++) assert.ok(plan[i] >= plan[i - 1]);
});

test('resampleToCfr duplicates frames when the source is slower than the target', () => {
  const times = [0, 200, 400]; // 5fps
  const plan = resampleToCfr(times, 600, 30);
  const counts = plan.reduce((m, i) => ((m[i] = (m[i] ?? 0) + 1), m), {});
  assert.ok(counts[0] >= 5, 'a 5fps source at 30fps must repeat each frame ~6x');
});

test('resampleToCfr is deterministic — same input, same plan (required by the cache)', () => {
  const times = [0, 33, 71, 118, 150];
  assert.deepEqual(resampleToCfr(times, 500, 30), resampleToCfr(times, 500, 30));
});

// ---------------------------------------------------------------------------
// D10 vertical reframing
// ---------------------------------------------------------------------------

test('computeReframe without ROI centres the largest portrait window', () => {
  const r = computeReframe({ srcW: 1920, srcH: 1080, dstW: 1080, dstH: 1920 });
  assert.equal(r.height, 1080, 'height is bounded by the source');
  assert.equal(r.width % 2, 0, 'dimensions must be even for yuv420p');
  assert.ok(r.width <= 1920);
  // Centred: the left and right margins differ by at most one pixel.
  const leftMargin = r.x;
  const rightMargin = 1920 - (r.x + r.width);
  assert.ok(Math.abs(leftMargin - rightMargin) <= 2, `margins ${leftMargin}/${rightMargin}`);
  assert.equal(r.y, 0);
});

test('computeReframe stays inside the source bounds for an edge ROI', () => {
  const r = computeReframe({
    srcW: 1920,
    srcH: 1080,
    dstW: 1080,
    dstH: 1920,
    roi: { x: 1850, y: 20, width: 60, height: 40 },
  });
  assert.ok(r.x >= 0 && r.y >= 0);
  assert.ok(r.x + r.width <= 1920, `x+w = ${r.x + r.width}`);
  assert.ok(r.y + r.height <= 1080, `y+h = ${r.y + r.height}`);
});

test('computeReframe punches in toward a small ROI', () => {
  const wide = computeReframe({ srcW: 1920, srcH: 1080, dstW: 1080, dstH: 1920 });
  const tight = computeReframe({
    srcW: 1920,
    srcH: 1080,
    dstW: 1080,
    dstH: 1920,
    roi: { x: 900, y: 500, width: 200, height: 120 },
  });
  assert.ok(tight.width <= wide.width, 'ROI crop should be no wider than the default window');
  assert.ok(tight.scale >= wide.scale, 'a tighter crop means a larger upscale factor');
});

test('computeReframe preserves the destination aspect ratio', () => {
  const r = computeReframe({ srcW: 1920, srcH: 1080, dstW: 1080, dstH: 1920 });
  const got = r.width / r.height;
  assert.ok(Math.abs(got - 1080 / 1920) < 0.01, `aspect ${got}`);
});

test('computeReframe rejects impossible geometry', () => {
  assert.throws(() => computeReframe({ srcW: 0, srcH: 1080, dstW: 1080, dstH: 1920 }), RangeError);
});

test('chooseVerticalStrategy honours explicit, then mobile-capability, then ROI', () => {
  assert.equal(chooseVerticalStrategy({ vertical: { strategy: 'letterbox' } }, { mobileCapable: true }), 'letterbox');
  assert.equal(chooseVerticalStrategy({}, { mobileCapable: true }), 'native');
  assert.equal(chooseVerticalStrategy({ roi: { x: 0, y: 0, width: 10, height: 10 } }, {}), 'reframe');
  assert.equal(chooseVerticalStrategy({}, {}), 'letterbox');
});

// ---------------------------------------------------------------------------
// D11 engine selection
// ---------------------------------------------------------------------------

const landscapeOnly = {
  meta: { captureAspect: 'landscape', outputs: [{ aspect: 'landscape' }], voice: { provider: 'kokoro' }, title: 't' },
  scenes: [{ id: 'a', narration: 'x', visualEngine: 'playwright_web', actionSpec: { url: 'u' } }],
};

// ---------------------------------------------------------------------------
// output selection — render only the aspect that was asked for
// ---------------------------------------------------------------------------

const bothAspects = {
  meta: { outputs: [{ aspect: 'landscape' }, { aspect: 'vertical', strategy: 'letterbox' }] },
};

test('selectOutputs keeps every declared output when no aspect is requested', () => {
  assert.deepEqual(selectOutputs(bothAspects).map((o) => o.aspect), ['landscape', 'vertical']);
  assert.deepEqual(selectOutputs(bothAspects, 'all').map((o) => o.aspect), ['landscape', 'vertical']);
});

test('selectOutputs narrows to one aspect, preserving its declared framing', () => {
  const only = selectOutputs(bothAspects, 'vertical');
  assert.equal(only.length, 1);
  assert.equal(only[0].aspect, 'vertical');
  assert.equal(only[0].strategy, 'letterbox', 'the storyboard strategy must survive the filter');
});

test('selectOutputs accepts a comma-separated list and de-duplicates it', () => {
  assert.deepEqual(selectOutputs(bothAspects, 'vertical,landscape').map((o) => o.aspect), ['vertical', 'landscape']);
  assert.deepEqual(selectOutputs(bothAspects, 'landscape, landscape').map((o) => o.aspect), ['landscape']);
});

test('selectOutputs honours an aspect the storyboard never declared', () => {
  const square = selectOutputs(bothAspects, 'square');
  assert.deepEqual(square, [{ aspect: 'square' }]);
});

test('selectOutputs rejects an unknown aspect instead of rendering nothing', () => {
  assert.throws(() => selectOutputs(bothAspects, 'portrait'), /unknown aspect "portrait"/);
});

test('selectOutputs returns copies, so compose cannot mutate the storyboard', () => {
  const picked = selectOutputs(bothAspects, 'vertical');
  picked[0].strategy = 'reframe';
  assert.equal(bothAspects.meta.outputs[1].strategy, 'letterbox');
});

test('selectOutputs defaults to landscape for a storyboard with no outputs', () => {
  assert.deepEqual(selectOutputs({ meta: {} }), [{ aspect: 'landscape' }]);
});

test('selectEngine picks ffmpeg when nothing requires a React compositor', () => {
  const r = selectEngine(landscapeOnly, { remotion: true, ffmpeg: true });
  assert.equal(r.engine, 'ffmpeg');
  assert.match(r.reason, /no feature requires/);
});

test('selectEngine picks remotion when a second aspect must be reframed', () => {
  const m = structuredClone(landscapeOnly);
  m.meta.outputs = [{ aspect: 'landscape' }, { aspect: 'vertical' }];
  const r = selectEngine(m, { remotion: true, ffmpeg: true });
  assert.equal(r.engine, 'remotion');
  assert.match(r.reason, /multi-aspect reframing/);
});

test('selectEngine does NOT require remotion when the second aspect is captured natively', () => {
  const m = structuredClone(landscapeOnly);
  m.meta.outputs = [{ aspect: 'landscape' }, { aspect: 'vertical', strategy: 'native' }];
  const r = selectEngine(m, { remotion: true, ffmpeg: true });
  assert.equal(r.engine, 'ffmpeg');
});

test('selectEngine requires remotion for kinetic captions and PIP', () => {
  const kinetic = structuredClone(landscapeOnly);
  kinetic.meta.kineticCaptions = true;
  assert.equal(selectEngine(kinetic, { remotion: true }).engine, 'remotion');

  const pip = structuredClone(landscapeOnly);
  pip.scenes[0].pip = { src: 'founder.mp4' };
  assert.match(selectEngine(pip, { remotion: true }).reason, /picture-in-picture/);
});

test('selectEngine degrades to ffmpeg and reports what was lost when remotion is missing', () => {
  const m = structuredClone(landscapeOnly);
  m.meta.outputs = [{ aspect: 'landscape' }, { aspect: 'vertical' }];
  const r = selectEngine(m, { remotion: false, ffmpeg: true });
  assert.equal(r.engine, 'ffmpeg');
  assert.deepEqual(r.degraded, ['multi-aspect reframing']);
  assert.match(r.reason, /Remotion is unavailable/);
});

test('selectEngine honours an override but still reports the degradation', () => {
  const m = structuredClone(landscapeOnly);
  m.meta.outputs = [{ aspect: 'landscape' }, { aspect: 'vertical' }];
  const r = selectEngine(m, { remotion: true, ffmpeg: true }, 'ffmpeg');
  assert.equal(r.engine, 'ffmpeg');
  assert.deepEqual(r.degraded, ['multi-aspect reframing']);
});

// ---------------------------------------------------------------------------
// D14 cache keys
// ---------------------------------------------------------------------------

test('canonicalJson is key-order independent', () => {
  assert.equal(canonicalJson({ a: 1, b: 2 }), canonicalJson({ b: 2, a: 1 }));
  assert.notEqual(canonicalJson({ a: 1 }), canonicalJson({ a: 2 }));
});

test('canonicalJson drops undefined and preserves array order', () => {
  assert.equal(canonicalJson({ a: 1, b: undefined }), '{"a":1}');
  assert.notEqual(canonicalJson([1, 2]), canonicalJson([2, 1]));
});

test('digest is stable and short', () => {
  const d = digest({ x: 1 });
  assert.equal(d.length, 12);
  assert.equal(d, digest({ x: 1 }));
});

test('audioCacheKey changes with narration, voice and rate', () => {
  const voice = { provider: 'kokoro', voiceId: 'af_heart' };
  const base = audioCacheKey({ narration: 'hello' }, voice);
  assert.notEqual(base, audioCacheKey({ narration: 'hello there' }, voice));
  assert.notEqual(base, audioCacheKey({ narration: 'hello' }, { ...voice, voiceId: 'other' }));
  assert.notEqual(base, audioCacheKey({ narration: 'hello', ratePct: 5 }, voice));
  assert.equal(base, audioCacheKey({ narration: 'hello' }, { ...voice }));
});

test('captureCacheKey returns null without an appVersion, forcing re-capture', () => {
  const scene = { id: 's1', actionSpec: { url: 'u' } };
  assert.equal(captureCacheKey(scene, null), null);
  assert.equal(captureCacheKey(scene, ''), null);
  assert.ok(captureCacheKey(scene, 'abc123'));
});

test('captureCacheKey changes when the app version changes', () => {
  const scene = { id: 's1', actionSpec: { url: 'u' } };
  assert.notEqual(captureCacheKey(scene, 'sha-a'), captureCacheKey(scene, 'sha-b'));
});

test('captureCacheKey changes when the action spec or assertions change', () => {
  const v = 'sha-a';
  const a = captureCacheKey({ id: 's', actionSpec: { url: 'u', steps: [] } }, v);
  const b = captureCacheKey({ id: 's', actionSpec: { url: 'u', steps: [{ action: 'click' }] } }, v);
  const c = captureCacheKey({ id: 's', actionSpec: { url: 'u', steps: [] }, assert: { visible: ['x'] } }, v);
  assert.notEqual(a, b);
  assert.notEqual(a, c);
});

// ---------------------------------------------------------------------------
// manifest validation
// ---------------------------------------------------------------------------

const validManifest = {
  meta: {
    title: 'Demo',
    fps: 30,
    captureAspect: 'landscape',
    outputs: [{ aspect: 'landscape' }],
    voice: { provider: 'kokoro', voiceId: 'af_heart' },
  },
  scenes: [
    { id: 'intro', narration: 'Welcome.', visualEngine: 'marp_slides', actionSpec: { markdown: '# hi' } },
    { id: 'demo', narration: 'Watch this.', visualEngine: 'playwright_web', actionSpec: { url: '/', steps: [] } },
  ],
};

test('validateManifest accepts a well-formed manifest', () => {
  assert.deepEqual(validateManifest(validManifest), []);
});

test('validateManifest catches missing essentials', () => {
  const errors = validateManifest({ meta: {}, scenes: [] });
  assert.ok(errors.some((e) => e.startsWith('meta.title')));
  assert.ok(errors.some((e) => e.startsWith('meta.voice.provider')));
  assert.ok(errors.some((e) => e.startsWith('scenes')));
});

test('validateManifest catches duplicate scene ids', () => {
  const m = structuredClone(validManifest);
  m.scenes[1].id = 'intro';
  assert.ok(validateManifest(m).some((e) => /duplicate id/.test(e)));
});

test('validateManifest rejects unknown engines and aspects', () => {
  const m = structuredClone(validManifest);
  m.scenes[0].visualEngine = 'ai_diffusion';
  m.meta.captureAspect = 'imax';
  const errors = validateManifest(m);
  assert.ok(errors.some((e) => /visualEngine/.test(e)));
  assert.ok(errors.some((e) => /captureAspect/.test(e)));
});

test('validateManifest requires a src for manual footage (D8: fail loudly)', () => {
  const m = structuredClone(validManifest);
  m.scenes.push({ id: 'pip', narration: 'Me talking.', visualEngine: 'manual_footage', actionSpec: {} });
  assert.ok(validateManifest(m).some((e) => /manual_footage requires a src/.test(e)));
});

test('validateManifest refuses credentials in committed source (D17)', () => {
  const m = structuredClone(validManifest);
  m.scenes[1].actionSpec.steps = [{ action: 'fill', selector: '#p', password: 'hunter2' }];
  assert.ok(validateManifest(m).some((e) => /credential/.test(e)));
});

test('validateManifest flags bgm without a src', () => {
  const m = structuredClone(validManifest);
  m.meta.bgm = { volume: 0.2 };
  assert.ok(validateManifest(m).some((e) => /bgm/.test(e)));
});

// ---------------------------------------------------------------------------
// outline-gate estimation
// ---------------------------------------------------------------------------

test('estimateNarrationMs scales with word count', () => {
  const short = estimateNarrationMs('one two three');
  const long = estimateNarrationMs(Array(150).fill('word').join(' '));
  assert.ok(long > short);
  assert.equal(estimateNarrationMs(Array(150).fill('word').join(' ')), 60_000);
  assert.equal(estimateNarrationMs(''), 0);
});

// ---------------------------------------------------------------------------
// D18 verification
// ---------------------------------------------------------------------------

test('expectationsFor derives resolution from the requested aspect, not a constant', () => {
  const land = expectationsFor(validManifest, { aspect: 'landscape' });
  const vert = expectationsFor(validManifest, { aspect: 'vertical' });
  assert.deepEqual([land.width, land.height], [1920, 1080]);
  assert.deepEqual([vert.width, vert.height], [1080, 1920]);
  assert.equal(vert.fps, 30);
});

test('checkOutput fails on wrong resolution and missing audio', () => {
  const expect = expectationsFor(validManifest, { aspect: 'vertical' });
  const r = checkOutput({ width: 1920, height: 1080, hasAudio: false, fps: 30, durationMs: 1000 }, expect);
  assert.equal(r.ok, false);
  assert.ok(r.failures.some((f) => /resolution/.test(f)));
  assert.ok(r.failures.some((f) => /no audio/.test(f)));
});

test('checkOutput passes a conforming file and warns rather than fails on small drift', () => {
  const expect = expectationsFor(validManifest, { aspect: 'landscape' });
  const good = checkOutput(
    { width: 1920, height: 1080, hasAudio: true, fps: 30, durationMs: expect.durationMs },
    expect
  );
  assert.equal(good.ok, true);
  assert.deepEqual(good.warnings, []);

  const drifted = checkOutput(
    { width: 1920, height: 1080, hasAudio: true, fps: 30, durationMs: expect.durationMs + 60_000 },
    expect
  );
  assert.equal(drifted.ok, true, 'duration drift is a warning, not a hard failure');
  assert.ok(drifted.warnings.some((w) => /drifts/.test(w)));
});

test('checkOutput fails on the wrong frame rate', () => {
  const expect = expectationsFor(validManifest, { aspect: 'landscape' });
  const r = checkOutput({ width: 1920, height: 1080, hasAudio: true, fps: 25, durationMs: expect.durationMs }, expect);
  assert.ok(r.failures.some((f) => /frame rate/.test(f)));
});

test('checkSceneSync reports per-scene drift against the plan', () => {
  const problems = checkSceneSync([
    {
      id: 'ok',
      resolvedAudio: { durationMs: 5000 },
      resolvedVisual: { durationMs: 5400 },
      resolvedTiming: { sceneMs: 5400 },
    },
    {
      id: 'bad',
      resolvedAudio: { durationMs: 5000 },
      resolvedVisual: { durationMs: 9000 },
      resolvedTiming: { sceneMs: 5400 },
    },
  ]);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /^bad:/);
});

// ---------------------------------------------------------------------------
// ffmpeg log parsers
// ---------------------------------------------------------------------------

test('parseBlackdetect extracts every segment', () => {
  const log = `
[blackdetect @ 0x1] black_start:0 black_end:1.5 black_duration:1.5
[blackdetect @ 0x1] black_start:10.2 black_end:11.0 black_duration:0.8
`;
  const got = parseBlackdetect(log);
  assert.equal(got.length, 2);
  assert.deepEqual(got[1], { start: 10.2, end: 11.0, duration: 0.8 });
  assert.deepEqual(parseBlackdetect(''), []);
});

test('parseSilencedetect pairs start/end and catches silence running to EOF', () => {
  const paired = `
[silencedetect @ 0x1] silence_start: 2.5
[silencedetect @ 0x1] silence_end: 4.0 | silence_duration: 1.5
`;
  const got = parseSilencedetect(paired);
  assert.equal(got.length, 1);
  assert.deepEqual(got[0], { start: 2.5, end: 4.0, duration: 1.5 });

  const dangling = parseSilencedetect('[silencedetect] silence_start: 7.25');
  assert.equal(dangling.length, 1);
  assert.equal(dangling[0].end, null);
});

test('parseFreezedetect pairs starts with ends and computes duration', () => {
  const log = `
[freezedetect @ 0x1] freeze_start: 1.0
[freezedetect @ 0x1] freeze_end: 3.5
`;
  const got = parseFreezedetect(log);
  assert.equal(got.length, 1);
  assert.equal(got[0].duration, 2.5);
});

test('parseLoudnorm reads the trailing JSON block', () => {
  const log = `some ffmpeg noise
[Parsed_loudnorm_0 @ 0x1]
{
  "input_i" : "-19.53",
  "input_tp" : "-3.21",
  "input_lra" : "5.20",
  "target_offset" : "-0.47"
}`;
  const got = parseLoudnorm(log);
  assert.equal(got.inputI, -19.53);
  assert.equal(got.targetOffset, -0.47);
  assert.equal(parseLoudnorm('no json here'), null);
  assert.equal(parseLoudnorm('{ broken'), null);
});

// ---------------------------------------------------------------------------
// constants sanity
// ---------------------------------------------------------------------------

test('aspect presets are 1080-class as decided (1080p is acceptable)', () => {
  assert.deepEqual(ASPECTS.landscape, { width: 1920, height: 1080 });
  assert.deepEqual(ASPECTS.vertical, { width: 1080, height: 1920 });
  assert.deepEqual(ASPECTS.square, { width: 1080, height: 1080 });
});
