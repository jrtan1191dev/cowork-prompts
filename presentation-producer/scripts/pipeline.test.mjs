/**
 * Integration-ish tests for the pipeline stages.
 *
 * Exercises the exported decision logic of capture/compose/generate with
 * lightweight fakes, so the whole thing is verifiable without the ~500MB
 * project-local install, ffmpeg, or a browser.
 *
 *   node --test scripts/pipeline.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { sceneVideoFilters } from './compose.mjs';
import { renderOutline } from './generate.mjs';
import { mergeGitignore } from './bootstrap.mjs';
import { SceneAssertionError, assertSceneState, resolveTarget } from './capture.mjs';
import {
  AUTO_ORDER,
  DEFAULT_VOICE_GENDER,
  VOICES,
  resolveProvider,
  resolveVoiceId,
  wrapPcmAsWav,
} from './synthesize.mjs';
import { selectEngine, validateManifest } from './lib/core.mjs';

const FIXTURE = JSON.parse(
  readFileSync(path.join(import.meta.dirname, '..', 'templates', 'fixture', 'storyboard.json'), 'utf8')
);

// ---------------------------------------------------------------------------
// the shipped fixture must always be valid: it is the smoke test's input
// ---------------------------------------------------------------------------

test('the bundled fixture storyboard is valid', () => {
  assert.deepEqual(validateManifest(FIXTURE), []);
});

test('the fixture exercises both capture modes and both aspects', () => {
  const modes = new Set(FIXTURE.scenes.map((s) => s.captureMode));
  assert.ok(modes.has('stills') && modes.has('screencast'), 'smoke test must cover both capture paths');
  const aspects = FIXTURE.meta.outputs.map((o) => o.aspect);
  assert.ok(aspects.includes('landscape') && aspects.includes('vertical'));
});

test('every fixture scene carries preconditions, including a forbidden-text guard', () => {
  for (const scene of FIXTURE.scenes) {
    assert.ok(scene.assert?.visible?.length, `${scene.id} must assert what should be on screen`);
    assert.ok(scene.assert?.notVisible?.length, `${scene.id} must guard against an error state`);
  }
});

// ---------------------------------------------------------------------------
// compose: filter chain assembly
// ---------------------------------------------------------------------------

const landscapeScene = {
  id: 's1',
  resolvedTiming: { sceneMs: 6000, padVisualMs: 0, padAudioMs: 0 },
  resolvedVisual: { durationMs: 6000 },
};

test('same-aspect output needs no geometry filters', () => {
  const filters = sceneVideoFilters({
    scene: landscapeScene,
    manifest: FIXTURE,
    output: { aspect: 'landscape' },
    srtPath: null,
    layout: { fontSize: 40, marginV: 72, marginH: 180, alignment: 2 },
  });
  assert.deepEqual(filters, []);
});

test('freeze padding is applied when narration outlasts the visual', () => {
  const filters = sceneVideoFilters({
    scene: { ...landscapeScene, resolvedTiming: { sceneMs: 8300, padVisualMs: 2300, padAudioMs: 0 } },
    manifest: FIXTURE,
    output: { aspect: 'landscape' },
    srtPath: null,
    layout: {},
  });
  assert.equal(filters.length, 1);
  assert.match(filters[0], /tpad=stop_mode=clone:stop_duration=2\.300/);
});

test('vertical output with an ROI produces a crop that follows the subject', () => {
  const filters = sceneVideoFilters({
    scene: { ...landscapeScene, roi: { x: 700, y: 300, width: 300, height: 200 } },
    manifest: FIXTURE,
    output: { aspect: 'vertical', strategy: 'reframe' },
    srtPath: null,
    layout: {},
  });
  const joined = filters.join(' | ');
  assert.match(joined, /crop=\d+:\d+:\d+:\d+/);
  assert.match(joined, /scale=1080:1920/);
});

test('vertical output without an ROI letterboxes rather than guessing a crop', () => {
  const filters = sceneVideoFilters({
    scene: landscapeScene,
    manifest: FIXTURE,
    output: { aspect: 'vertical', strategy: 'letterbox' },
    srtPath: null,
    layout: {},
  });
  const joined = filters.join(' | ');
  assert.match(joined, /force_original_aspect_ratio=decrease/);
  assert.doesNotMatch(joined, /crop=/);
});

test('captions are burned LAST so the reframe never crops or scales them', () => {
  const filters = sceneVideoFilters({
    scene: { ...landscapeScene, roi: { x: 700, y: 300, width: 300, height: 200 } },
    manifest: FIXTURE,
    output: { aspect: 'vertical', strategy: 'reframe' },
    subtitlePath: '/tmp/s1.vertical.ass',
  });
  assert.match(filters.at(-1), /^subtitles=/, 'subtitles must be the final filter');
  assert.ok(filters.findIndex((f) => /crop=/.test(f)) < filters.length - 1);
});

test('each aspect burns its own subtitle file, so placement can differ', () => {
  const mk = (aspect) =>
    sceneVideoFilters({
      scene: landscapeScene,
      manifest: FIXTURE,
      output: { aspect },
      subtitlePath: `/tmp/s1.${aspect}.ass`,
    }).at(-1);
  assert.match(mk('landscape'), /s1\.landscape\.ass/);
  assert.match(mk('vertical'), /s1\.vertical\.ass/);
  // Geometry itself lives inside the ASS file (see lib/subtitles.test.mjs), not
  // in the filter string, because force_style is not resolution-aware.
  assert.ok(!mk('vertical').includes('force_style'));
});

test('the outline names the resolved voice, not just the provider', () => {
  const outline = renderOutline({
    manifest: FIXTURE,
    engine: selectEngine(FIXTURE, {}),
    provider: 'kokoro',
    voiceId: 'am_michael',
    changed: [],
  });
  assert.match(outline, /voice:\s+kokoro \/ am_michael/);
});

// ---------------------------------------------------------------------------
// generate: the outline gate
// ---------------------------------------------------------------------------

test('the outline reports everything needed to approve a spend', () => {
  const outline = renderOutline({
    manifest: FIXTURE,
    engine: selectEngine(FIXTURE, { remotion: true, ffmpeg: true }),
    provider: 'kokoro',
    changed: [],
    allowed: ['playwright_web', 'marp_slides', 'manual_footage'],
  });
  assert.match(outline, /title:\s+Smoke Test/);
  assert.match(outline, /outputs:\s+landscape, vertical/);
  assert.match(outline, /engine:\s+remotion/);
  assert.match(outline, /voice:\s+kokoro/);
  assert.match(outline, /captions: burned in/);
  assert.match(outline, /runtime:\s+~\d+m \d+s across 2 scenes/);
  assert.match(outline, /cost:\s+\$0\.00/, 'a local provider must be shown as free');
  for (const scene of FIXTURE.scenes) assert.ok(outline.includes(scene.id));
});

test('the outline prices paid providers before any call is made', () => {
  const outline = renderOutline({ manifest: FIXTURE, engine: selectEngine(FIXTURE, {}), provider: 'elevenlabs', changed: [] });
  assert.match(outline, /cost:\s+~\$\d+\.\d\d \(\d+ chars/);
});

test('the outline flags changed scenes and locally unsupported engines', () => {
  const outline = renderOutline({
    manifest: FIXTURE,
    engine: selectEngine(FIXTURE, {}),
    provider: 'kokoro',
    changed: ['02-approve'],
    allowed: ['marp_slides'], // playwright unavailable
  });
  assert.match(outline, /02-approve.*\[changed\]/);
  assert.match(outline, /!! unsupported here/);
});

// ---------------------------------------------------------------------------
// capture: preconditions catch the failures ffprobe cannot see
// ---------------------------------------------------------------------------

/** Minimal Playwright-shaped fake. Matches strings by substring and RegExp by
 *  test(), which is what real locators do. */
function fakePage({ texts = [], selectors = [] } = {}) {
  const matches = (needle, candidate) =>
    needle instanceof RegExp ? needle.test(candidate) : String(candidate).includes(String(needle));
  const hit = (present) => ({
    first: () => ({
      waitFor: async () => {
        if (!present) throw new Error('timeout');
      },
      count: async () => (present ? 1 : 0),
      boundingBox: async () => ({ x: 10, y: 20, width: 100, height: 40 }),
      click: async () => {},
      pressSequentially: async () => {},
    }),
    count: async () => (present ? 1 : 0),
  });
  return {
    getByText: (needle) => hit(texts.some((t) => matches(needle, t))),
    getByRole: (_role, { name } = {}) => hit(texts.some((t) => matches(name ?? '', t))),
    getByLabel: (label) => hit(texts.some((t) => matches(label, t))),
    getByTestId: (id) => hit(selectors.includes(`[data-testid=${id}]`)),
    locator: (sel) => hit(selectors.includes(sel)),
  };
}

test('assertSceneState passes when the expected content is present', async () => {
  const page = fakePage({ texts: ['Capacity Overview', 'Available Beds'] });
  const result = await assertSceneState(page, FIXTURE.scenes[0], { timeout: 10 });
  assert.equal(result.checked, true);
});

test('assertSceneState fails on a missing expectation — the empty/404 case', async () => {
  const page = fakePage({ texts: ['Sign in to continue'] });
  await assert.rejects(
    () => assertSceneState(page, FIXTURE.scenes[0], { timeout: 10 }),
    (err) => err instanceof SceneAssertionError && /expected text "Capacity Overview"/.test(err.message)
  );
});

test('assertSceneState fails when a forbidden error string is on screen', async () => {
  const scene = { id: 'x', assert: { visible: [], notVisible: ['Something went wrong'] } };
  const page = fakePage({ texts: ['Something went wrong'] });
  await assert.rejects(() => assertSceneState(page, scene, { timeout: 10 }), SceneAssertionError);
});

test('assertSceneState is a no-op for a scene with no preconditions', async () => {
  const result = await assertSceneState(fakePage(), { id: 'x' });
  assert.equal(result.checked, false);
});

test('resolveTarget prefers the stored semantic locator', async () => {
  const report = { substitutions: [] };
  const page = fakePage({ texts: ['Approve Allocation'] });
  const { how, substituted } = await resolveTarget(page, { role: 'button', name: 'Approve Allocation' }, report);
  assert.equal(substituted, false);
  assert.match(how, /^role=button/);
  assert.deepEqual(report.substitutions, []);
});

test('resolveTarget falls back semantically and REPORTS the substitution (D16)', async () => {
  const report = { substitutions: [] };
  // The stored selector no longer matches; the description still does.
  const page = fakePage({ texts: ['Approve Bed Allocation'], selectors: [] });
  const { substituted } = await resolveTarget(
    page,
    { selector: '#gone', target: 'Approve Bed Allocation' },
    report
  );
  assert.equal(substituted, true);
  assert.equal(report.substitutions.length, 1, 'a silent drift would be worse than a failure');
});

test('resolveTarget throws when nothing resolves at all', async () => {
  const report = { substitutions: [] };
  await assert.rejects(() => resolveTarget(fakePage(), { selector: '#nope' }, report), /could not resolve a target/);
});

// ---------------------------------------------------------------------------
// synthesize: provider policy
// ---------------------------------------------------------------------------

test('auto selection prefers the local, licence-clean provider', () => {
  assert.equal(AUTO_ORDER[0], 'kokoro');
  assert.equal(AUTO_ORDER.at(-1), 'edge', 'the unofficial endpoint must be the last resort');
  assert.equal(resolveProvider('auto', { kokoro: true, openai: true, edge: true }), 'kokoro');
});

test('auto selection falls through to what is actually available', () => {
  assert.equal(resolveProvider('auto', { kokoro: false, gemini: true, openai: true }), 'gemini');
  assert.equal(resolveProvider('auto', { kokoro: false, openai: true }), 'openai');
  assert.equal(resolveProvider('auto', { kokoro: false, system: true }), 'system');
});

test('auto selection never silently picks edge-tts', () => {
  assert.throws(() => resolveProvider('auto', { edge: true }), /no speech provider available/);
  assert.equal(resolveProvider('auto', { edge: true }, { acknowledgeEdge: true }), 'edge');
});

test('explicitly requesting edge-tts requires an acknowledgement naming the risk', () => {
  assert.throws(
    () => resolveProvider('edge', { edge: true }),
    /unofficial reverse-engineered .* personal use .* --acknowledge-edge-tts/s
  );
});

test('requesting an unavailable provider fails loudly', () => {
  assert.throws(() => resolveProvider('elevenlabs', { kokoro: true }), /not available here/);
});

// ---------------------------------------------------------------------------
// synthesize: narrator gender
// ---------------------------------------------------------------------------

test('every provider offers both a male and a female narrator', () => {
  for (const [provider, catalogue] of Object.entries(VOICES)) {
    assert.ok(catalogue.male, `${provider} has no male voice`);
    assert.ok(catalogue.female, `${provider} has no female voice`);
    assert.notEqual(catalogue.male, catalogue.female, `${provider} maps both genders to one voice`);
  }
});

test('requesting a gender resolves to that provider\'s voice id', () => {
  assert.equal(resolveVoiceId({ provider: 'kokoro', gender: 'male' }), 'am_michael');
  assert.equal(resolveVoiceId({ provider: 'kokoro', gender: 'female' }), 'af_heart');
  assert.equal(resolveVoiceId({ provider: 'openai', gender: 'male' }), 'onyx');
  assert.equal(resolveVoiceId({ provider: 'edge', gender: 'FEMALE' }), 'en-US-AriaNeural', 'case-insensitive');
});

test('a requested gender overrides a voice id pinned in the storyboard', () => {
  // Otherwise a storyboard that pinned af_heart would ignore --voice-gender=male
  // and the toggle would look broken.
  assert.equal(resolveVoiceId({ provider: 'kokoro', gender: 'male', voiceId: 'af_heart' }), 'am_michael');
});

test('a pinned voice id still wins when no gender is requested', () => {
  assert.equal(resolveVoiceId({ provider: 'kokoro', voiceId: 'af_bella' }), 'af_bella');
});

test('with neither gender nor voice id, the documented default applies', () => {
  assert.equal(DEFAULT_VOICE_GENDER, 'female');
  assert.equal(resolveVoiceId({ provider: 'kokoro' }), VOICES.kokoro.female);
});

test('an unmappable gender fails loudly instead of silently using the default', () => {
  assert.throws(() => resolveVoiceId({ provider: 'kokoro', gender: 'robot' }), /not mapped for provider "kokoro"/);
});

// ---------------------------------------------------------------------------
// bootstrap: ignore rules land in the project's own .gitignore
// ---------------------------------------------------------------------------

test('mergeGitignore appends work-dir-prefixed rules to an existing file', () => {
  const merged = mergeGitignore('node_modules/\ntarget/\n', 'presentations');
  assert.match(merged, /^node_modules\/$/m, 'existing rules must survive');
  assert.match(merged, /^target\/$/m);
  assert.match(merged, /^presentations\/\.runtime\/$/m);
  assert.match(merged, /^presentations\/\*\/output\/$/m, 'artifacts live inside each presentation');
  assert.match(merged, /^presentations\/\*\/\*\.log$/m);
  assert.ok(!/^presentations\/\*\/footage\/$/m.test(merged), 'generated footage is committed, never ignored');
});

test('mergeGitignore is idempotent for the same work directory', () => {
  const once = mergeGitignore('node_modules/\n', 'presentations');
  assert.equal(mergeGitignore(once, 'presentations'), once, 'a second bootstrap must not duplicate the block');
});

test('mergeGitignore keeps blocks for other work directories', () => {
  const first = mergeGitignore('', 'presentations');
  const both = mergeGitignore(first, 'decks');
  assert.match(both, /^presentations\/\*\/output\/$/m);
  assert.match(both, /^decks\/\*\/output\/$/m);
});

test('mergeGitignore writes unprefixed rules when the file sits in the work dir', () => {
  const merged = mergeGitignore('', '');
  assert.match(merged, /^\.runtime\/$/m);
  assert.match(merged, /^\*\/assets\/$/m);
  assert.ok(!merged.includes('//'));
});

test('wrapPcmAsWav produces a valid RIFF/WAVE header for Gemini PCM output', () => {
  const pcm = Buffer.alloc(480, 1);
  const wav = wrapPcmAsWav(pcm, { sampleRate: 24_000 });
  assert.equal(wav.subarray(0, 4).toString(), 'RIFF');
  assert.equal(wav.subarray(8, 12).toString(), 'WAVE');
  assert.equal(wav.subarray(36, 40).toString(), 'data');
  assert.equal(wav.readUInt32LE(4), 36 + pcm.length);
  assert.equal(wav.readUInt32LE(24), 24_000, 'sample rate must come from the response mime type');
  assert.equal(wav.readUInt16LE(22), 1, 'mono');
  assert.equal(wav.readUInt16LE(34), 16, '16-bit');
  assert.equal(wav.readUInt32LE(40), pcm.length);
  assert.equal(wav.length, 44 + pcm.length);
});
