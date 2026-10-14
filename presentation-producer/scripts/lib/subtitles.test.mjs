/**
 * Unit tests for burned-in, aspect-aware subtitles.
 *   node --test scripts/lib/subtitles.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  ALIGN_BOTTOM_CENTRE,
  CAPTION_FONT,
  SUBTITLE_LAYOUTS,
  clampCues,
  formatAss,
  formatSrt,
  layoutToAssStyle,
  msToAssTime,
  msToTimecode,
  parseSrt,
  prepareSceneSubtitles,
  rateToCueFactor,
  rewrapCues,
  scaleCues,
  shiftCues,
  subtitleLayoutFor,
  synthesiseCues,
  timecodeToMs,
} from './subtitles.mjs';

// ---------------------------------------------------------------------------
// placement
// ---------------------------------------------------------------------------

test('vertical captions ride higher than landscape to clear phone UI chrome', () => {
  const land = subtitleLayoutFor({ aspect: 'landscape' });
  const vert = subtitleLayoutFor({ aspect: 'vertical' });
  assert.ok(vert.marginV > land.marginV * 3, `landscape ${land.marginV} vs vertical ${vert.marginV}`);
  // ~21% of 1920 keeps captions above the TikTok/Reels/Shorts overlay band.
  assert.ok(vert.marginV / 1920 > 0.15 && vert.marginV / 1920 < 0.3);
});

test('vertical captions are larger, because vertical video is watched small', () => {
  assert.ok(subtitleLayoutFor({ aspect: 'vertical' }).fontSize > subtitleLayoutFor({ aspect: 'landscape' }).fontSize);
});

test('narrow frames wrap to shorter lines', () => {
  const land = subtitleLayoutFor({ aspect: 'landscape' });
  const vert = subtitleLayoutFor({ aspect: 'vertical' });
  const square = subtitleLayoutFor({ aspect: 'square' });
  assert.ok(vert.maxCharsPerLine < square.maxCharsPerLine);
  assert.ok(square.maxCharsPerLine < land.maxCharsPerLine);
});

test('letterboxed vertical puts captions in the empty bar, not over the UI', () => {
  const overContent = subtitleLayoutFor({ aspect: 'vertical', strategy: 'reframe' });
  const inBar = subtitleLayoutFor({ aspect: 'vertical', strategy: 'letterbox' });
  assert.equal(overContent.placement, 'over-content');
  assert.equal(inBar.placement, 'letterbox-bar');
  // 1080x1920 with 1920x1080 footage scaled to 1080 wide => 607px tall,
  // leaving ~656px of bar; captions belong inside the lower ~328px.
  assert.ok(inBar.marginV < overContent.marginV, 'bar placement sits lower than the safe-area default');
  assert.ok(inBar.marginV >= 48);
});

test('landscape never uses letterbox-bar placement', () => {
  assert.equal(subtitleLayoutFor({ aspect: 'landscape', strategy: 'letterbox' }).placement, 'over-content');
});

test('unknown aspects fall back to landscape rather than throwing', () => {
  const l = subtitleLayoutFor({ aspect: 'imax' });
  assert.equal(l.maxCharsPerLine, SUBTITLE_LAYOUTS.landscape.maxCharsPerLine);
});

test('manifest overrides win over derived placement', () => {
  const l = subtitleLayoutFor({ aspect: 'vertical' }, { fontSize: 64, marginV: 900 });
  assert.equal(l.fontSize, 64);
  assert.equal(l.marginV, 900);
});

test('undefined overrides do not clobber derived values', () => {
  const l = subtitleLayoutFor({ aspect: 'vertical' }, { fontSize: undefined });
  assert.equal(l.fontSize, SUBTITLE_LAYOUTS.vertical.fontSize);
});

test('landscape captions occupy the lower band, not the frame', () => {
  const l = subtitleLayoutFor({ aspect: 'landscape' });
  // The shipped bug rendered a 40px font at 150px and one word per line. These
  // bounds encode what "a caption strip" means in 1920x1080 pixels.
  assert.ok(l.fontSize / 1080 < 0.06, `font ${l.fontSize} is more than 6% of frame height`);
  assert.ok(l.marginV / 1080 < 0.12, 'captions must sit near the lower edge');
  assert.ok(1920 - l.marginH * 2 > 1920 * 0.5, 'at least half the width must remain for text');
});

test('layoutToAssStyle emits an opaque box for legibility over any UI', () => {
  const style = layoutToAssStyle(subtitleLayoutFor({ aspect: 'vertical' }));
  assert.equal(style.Alignment, ALIGN_BOTTOM_CENTRE);
  assert.equal(style.BorderStyle, 4, 'one box behind the whole cue, drawn in BackColour');
  assert.equal(style.MarginV, SUBTITLE_LAYOUTS.vertical.marginV);
  assert.equal(style.Fontsize, SUBTITLE_LAYOUTS.vertical.fontSize);
  assert.equal(style.Fontname, CAPTION_FONT);
});

test('the caption font is one that resolves on Windows, macOS and Linux', () => {
  // ASS has a single Fontname field and no fallback list, so a machine-specific
  // family (Helvetica, Inter) would change wrapping per OS.
  assert.equal(CAPTION_FONT, 'Arial');
});

test('style overrides reach the ASS style line', () => {
  const style = layoutToAssStyle(subtitleLayoutFor({ aspect: 'landscape' }), { Fontname: 'Liberation Sans' });
  assert.equal(style.Fontname, 'Liberation Sans');
});

// ---------------------------------------------------------------------------
// ASS output — the fix for captions rendering at 3.75x their declared size
// ---------------------------------------------------------------------------

const CUES = [{ index: 1, startMs: 0, endMs: 2500, text: 'Line one\nLine two' }];

test('formatAss declares the real frame as the script resolution', () => {
  const ass = formatAss(CUES, layoutToAssStyle(subtitleLayoutFor({ aspect: 'landscape' })), { width: 1920, height: 1080 });
  // Without these two lines libass scales every pixel value by height/288.
  assert.match(ass, /^PlayResX: 1920$/m);
  assert.match(ass, /^PlayResY: 1080$/m);
});

test('formatAss keeps the Style line aligned with its Format line', () => {
  const ass = formatAss(CUES, layoutToAssStyle(subtitleLayoutFor({ aspect: 'vertical' })), { width: 1080, height: 1920 });
  const format = /^Format: (Name,.*)$/m.exec(ass)[1].split(',').map((s) => s.trim());
  const style = /^Style: (.*)$/m.exec(ass)[1].split(',');
  assert.equal(style.length, format.length, 'a mismatched field count silently shifts every value');
  assert.equal(style[format.indexOf('Fontsize')], String(SUBTITLE_LAYOUTS.vertical.fontSize));
  assert.equal(style[format.indexOf('MarginV')], String(SUBTITLE_LAYOUTS.vertical.marginV));
  assert.equal(style[format.indexOf('Alignment')], String(ALIGN_BOTTOM_CENTRE));
});

test('formatAss writes one Dialogue line per cue with ASS line breaks', () => {
  const ass = formatAss(CUES, layoutToAssStyle(subtitleLayoutFor({ aspect: 'landscape' })), { width: 1920, height: 1080 });
  const dialogues = ass.split('\n').filter((l) => l.startsWith('Dialogue:'));
  assert.equal(dialogues.length, 1);
  assert.match(dialogues[0], /Line one\\NLine two$/, 'newlines must become \\N, not raw breaks');
  assert.match(dialogues[0], /^Dialogue: 0,0:00:00\.00,0:00:02\.50,Default,,0,0,0,,/);
});

test('formatAss strips braces, which would otherwise open an override block', () => {
  const ass = formatAss([{ startMs: 0, endMs: 1000, text: 'cost is {40}% lower' }], {}, { width: 1920, height: 1080 });
  assert.ok(!/\{|\}/.test(ass.split('[Events]')[1]), 'no raw braces may reach the dialogue text');
  assert.match(ass, /cost is 40% lower/);
});

test('msToAssTime uses centiseconds and a single-digit hour', () => {
  assert.equal(msToAssTime(0), '0:00:00.00');
  assert.equal(msToAssTime(2500), '0:00:02.50');
  assert.equal(msToAssTime(3_723_456), '1:02:03.46');
  assert.equal(msToAssTime(-10), '0:00:00.00');
});

// ---------------------------------------------------------------------------
// SRT round-trip
// ---------------------------------------------------------------------------

const SAMPLE_SRT = `1
00:00:00,000 --> 00:00:02,500
The coordinator reviews the queue.

2
00:00:02,500 --> 00:00:05,000
Then approves the allocation.
`;

test('parseSrt reads cues with comma or dot decimals', () => {
  const cues = parseSrt(SAMPLE_SRT);
  assert.equal(cues.length, 2);
  assert.equal(cues[0].startMs, 0);
  assert.equal(cues[0].endMs, 2500);
  assert.equal(cues[1].text, 'Then approves the allocation.');

  const dotted = parseSrt('1\n00:00:01.250 --> 00:00:02.500\nHi\n');
  assert.equal(dotted[0].startMs, 1250);
});

test('parseSrt tolerates missing index lines and blank blocks', () => {
  const cues = parseSrt('\n\n00:00:00,000 --> 00:00:01,000\nOnly text\n\n\n');
  assert.equal(cues.length, 1);
  assert.equal(cues[0].text, 'Only text');
});

test('parseSrt ignores blocks with no timing line', () => {
  assert.deepEqual(parseSrt('garbage\nmore garbage'), []);
  assert.deepEqual(parseSrt(''), []);
  assert.deepEqual(parseSrt(null), []);
});

test('formatSrt/parseSrt round-trip preserves timings and renumbers', () => {
  const cues = parseSrt(SAMPLE_SRT);
  const round = parseSrt(formatSrt(cues));
  assert.deepEqual(round.map((c) => [c.startMs, c.endMs, c.text]), cues.map((c) => [c.startMs, c.endMs, c.text]));
  assert.deepEqual(round.map((c) => c.index), [1, 2]);
});

test('timecode conversion round-trips including hours', () => {
  assert.equal(msToTimecode(0), '00:00:00,000');
  assert.equal(msToTimecode(3_723_456), '01:02:03,456');
  assert.equal(timecodeToMs('01:02:03,456'), 3_723_456);
  assert.equal(msToTimecode(-50), '00:00:00,000', 'negative times clamp to zero');
});

// ---------------------------------------------------------------------------
// rate scaling — the correctness bug this module exists to prevent
// ---------------------------------------------------------------------------

test('rateToCueFactor pulls cues earlier when speech is sped up', () => {
  assert.equal(rateToCueFactor(0), 1);
  assert.ok(rateToCueFactor(7) < 1, 'faster speech => earlier cues');
  assert.ok(rateToCueFactor(-7) > 1, 'slower speech => later cues');
});

test('scaleCues re-times a provider SRT to match re-rated audio (D13)', () => {
  const cues = parseSrt(SAMPLE_SRT);
  const scaled = scaleCues(cues, rateToCueFactor(7)); // 7% faster
  assert.ok(scaled[1].endMs < cues[1].endMs);
  // A 5s narration at +7% ends at ~4.67s.
  assert.ok(Math.abs(scaled[1].endMs - 5000 / 1.07) < 2, `got ${scaled[1].endMs}`);
});

test('scaleCues rejects a nonsense factor', () => {
  assert.throws(() => scaleCues(parseSrt(SAMPLE_SRT), 0), RangeError);
  assert.throws(() => scaleCues(parseSrt(SAMPLE_SRT), -1), RangeError);
});

test('shiftCues offsets for a whole-video sidecar', () => {
  const shifted = shiftCues(parseSrt(SAMPLE_SRT), 10_000);
  assert.equal(shifted[0].startMs, 10_000);
  assert.equal(shifted[1].endMs, 15_000);
});

test('clampCues drops and truncates cues that outlast the scene', () => {
  const cues = parseSrt(SAMPLE_SRT);
  const clamped = clampCues(cues, 3000);
  assert.equal(clamped.length, 2);
  assert.equal(clamped[1].endMs, 3000);
  assert.equal(clampCues(cues, 1000).length, 1);
});

// ---------------------------------------------------------------------------
// wrapping
// ---------------------------------------------------------------------------

test('rewrapCues respects the line budget for the aspect', () => {
  const cues = [{ index: 1, startMs: 0, endMs: 4000, text: 'The bed management coordinator reviews the top three recommendations' }];
  const wrapped = rewrapCues(cues, { maxCharsPerLine: 26, maxLines: 3 });
  for (const cue of wrapped) {
    for (const line of cue.text.split('\n')) {
      assert.ok(line.length <= 26, `line too long (${line.length}): "${line}"`);
    }
    assert.ok(cue.text.split('\n').length <= 3);
  }
});

test('rewrapCues splits an over-long cue in time rather than overflowing', () => {
  const long = Array(40).fill('word').join(' ');
  const cues = [{ index: 1, startMs: 0, endMs: 8000, text: long }];
  const wrapped = rewrapCues(cues, { maxCharsPerLine: 20, maxLines: 2 });
  assert.ok(wrapped.length > 1, 'should split into multiple cues');
  // Contiguous, ordered, and ending exactly where the original ended.
  assert.equal(wrapped[0].startMs, 0);
  assert.equal(wrapped.at(-1).endMs, 8000);
  for (let i = 1; i < wrapped.length; i++) {
    assert.equal(wrapped[i].startMs, wrapped[i - 1].endMs, 'cues must not overlap or gap');
  }
  assert.deepEqual(wrapped.map((c) => c.index), wrapped.map((_, i) => i + 1));
});

test('rewrapCues never emits a zero-length cue', () => {
  const cues = [{ index: 1, startMs: 0, endMs: 500, text: Array(30).fill('word').join(' ') }];
  for (const cue of rewrapCues(cues, { maxCharsPerLine: 10, maxLines: 1 })) {
    assert.ok(cue.endMs > cue.startMs, `cue ${cue.index} has no duration`);
  }
});

// ---------------------------------------------------------------------------
// cue synthesis — required because Kokoro (the default) emits no SRT
// ---------------------------------------------------------------------------

test('synthesiseCues covers the whole measured duration exactly', () => {
  const text = 'The coordinator reviews the queue. Then approves the allocation. The bed is assigned.';
  const cues = synthesiseCues(text, 9000, { maxCharsPerLine: 46, maxLines: 2 });
  assert.ok(cues.length >= 2);
  assert.equal(cues[0].startMs, 0);
  assert.equal(cues.at(-1).endMs, 9000, 'must end on the true measured duration, never drift past it');
});

test('synthesiseCues produces monotonic, non-overlapping cues', () => {
  const text = 'One. Two. Three. Four. Five. Six. Seven sentences make a paragraph here.';
  const cues = synthesiseCues(text, 12_000, { maxCharsPerLine: 26, maxLines: 3 });
  for (let i = 1; i < cues.length; i++) {
    assert.ok(cues[i].startMs >= cues[i - 1].startMs);
    assert.ok(cues[i].endMs > cues[i].startMs);
  }
});

test('synthesiseCues preserves all the words', () => {
  const text = 'Severity prioritised bed queue with top three recommendations showing constraint match rationale.';
  const cues = synthesiseCues(text, 8000, { maxCharsPerLine: 26, maxLines: 2 });
  const joined = cues.map((c) => c.text.replace(/\n/g, ' ')).join(' ').replace(/\s+/g, ' ').trim();
  assert.equal(joined, text, 'no narration may be dropped from the captions');
});

test('synthesiseCues splits a very long clause-laden sentence', () => {
  const text =
    'When the ED attending and the specialist disagree on acuity, the system escalates to the higher tier, ' +
    'unions the telemetry requirements, and records the discordance for audit.';
  const cues = synthesiseCues(text, 14_000, { maxCharsPerLine: 26, maxLines: 2 });
  assert.ok(cues.length >= 3, `expected several cues, got ${cues.length}`);
  for (const cue of cues) {
    for (const line of cue.text.split('\n')) assert.ok(line.length <= 26, `"${line}"`);
  }
});

test('synthesiseCues bounds how long any caption sits on screen', () => {
  const text = 'The coordinator reviews the queue. Then approves the allocation. The bed is assigned.';
  const cues = synthesiseCues(text, 30_000, { maxCharsPerLine: 46, maxLines: 2, maxCueMs: 6000 });
  for (const cue of cues) {
    assert.ok(cue.endMs - cue.startMs <= 6000 * 1.5, `cue held for ${cue.endMs - cue.startMs}ms`);
  }
  assert.equal(cues.at(-1).endMs, 30_000);
});

test('synthesiseCues handles empty and degenerate input', () => {
  assert.deepEqual(synthesiseCues('', 5000), []);
  assert.deepEqual(synthesiseCues('hi', 0), []);
  assert.deepEqual(synthesiseCues(null, 5000), []);
  assert.equal(synthesiseCues('Hi.', 1000).length, 1);
});

// ---------------------------------------------------------------------------
// the compose-stage entry point
// ---------------------------------------------------------------------------

const scene = { id: 's1', narration: 'The coordinator reviews the queue. Then approves the allocation.' };

test('prepareSceneSubtitles synthesises cues when the provider gives no SRT', () => {
  const { srt, cues, layout } = prepareSceneSubtitles({
    scene,
    output: { aspect: 'vertical', strategy: 'reframe' },
    durationMs: 6000,
  });
  assert.ok(cues.length > 0);
  assert.match(srt, /-->/);
  assert.equal(layout.maxCharsPerLine, SUBTITLE_LAYOUTS.vertical.maxCharsPerLine);
  assert.equal(cues.at(-1).endMs, 6000);
});

test('prepareSceneSubtitles re-times a provider SRT when speech was re-rated', () => {
  const plain = prepareSceneSubtitles({
    scene, output: { aspect: 'landscape' }, durationMs: 5000, providerSrt: SAMPLE_SRT, ratePct: 0,
  });
  const rated = prepareSceneSubtitles({
    scene, output: { aspect: 'landscape' }, durationMs: 5000, providerSrt: SAMPLE_SRT, ratePct: 7,
  });
  assert.ok(rated.cues.at(-1).endMs < plain.cues.at(-1).endMs, 'sped-up speech must pull captions earlier');
});

test('prepareSceneSubtitles yields different wrapping per aspect from one narration', () => {
  const land = prepareSceneSubtitles({ scene, output: { aspect: 'landscape' }, durationMs: 6000 });
  const vert = prepareSceneSubtitles({ scene, output: { aspect: 'vertical' }, durationMs: 6000 });
  assert.ok(vert.cues.length >= land.cues.length, 'narrower frames need at least as many cues');
  const longestVert = Math.max(...vert.cues.flatMap((c) => c.text.split('\n').map((l) => l.length)));
  assert.ok(longestVert <= SUBTITLE_LAYOUTS.vertical.maxCharsPerLine);
});

test('every aspect keeps its captions inside the frame', () => {
  // MarginV 400 on a 288-tall script became 2667px and the vertical captions
  // vanished off the top of the frame. Placement must be checked against the
  // real dimensions of each output.
  for (const [aspect, frame] of Object.entries({
    landscape: { width: 1920, height: 1080 },
    vertical: { width: 1080, height: 1920 },
    square: { width: 1080, height: 1080 },
  })) {
    const l = subtitleLayoutFor({ aspect });
    const blockHeight = l.fontSize * l.maxLines * 1.3;
    assert.ok(l.marginV + blockHeight < frame.height, `${aspect}: caption block runs off the frame`);
    assert.ok(l.marginH * 2 + l.fontSize * 4 < frame.width, `${aspect}: no usable width left for text`);
  }
});

test('prepareSceneSubtitles sizes the ASS to the output aspect, not the capture', () => {
  const vertical = prepareSceneSubtitles({ scene, output: { aspect: 'vertical' }, durationMs: 6000 });
  assert.match(vertical.ass, /PlayResX: 1080/);
  assert.match(vertical.ass, /PlayResY: 1920/);
  const landscape = prepareSceneSubtitles({ scene, output: { aspect: 'landscape' }, durationMs: 6000 });
  assert.match(landscape.ass, /PlayResX: 1920/);
  assert.match(landscape.ass, /PlayResY: 1080/);
});

test('prepareSceneSubtitles returns both burn-in ASS and sidecar SRT', () => {
  const { ass, srt, cues } = prepareSceneSubtitles({ scene, output: { aspect: 'landscape' }, durationMs: 6000 });
  assert.equal(ass.split('\n').filter((l) => l.startsWith('Dialogue:')).length, cues.length);
  assert.equal(srt.match(/-->/g).length, cues.length);
});

test('prepareSceneSubtitles never lets a cue outlast the scene', () => {
  const { cues } = prepareSceneSubtitles({
    scene, output: { aspect: 'landscape' }, durationMs: 2000, providerSrt: SAMPLE_SRT,
  });
  for (const cue of cues) assert.ok(cue.endMs <= 2000, `cue ends at ${cue.endMs}, past the 2000ms scene`);
});
