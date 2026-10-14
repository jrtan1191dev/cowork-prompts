/**
 * Brand propagation: everything that renders pixels outside the slide itself.
 *
 * The slide HTML is covered by deck.test.mjs and the resolver by
 * design-md.test.mjs. This file covers the *edges* — the video background, the
 * burned-in caption colours and the renderer-neutral representation that keeps
 * ffmpeg and Remotion in agreement — because those are the places a brand
 * silently fails to arrive and nobody notices until the video is watched.
 *
 * All of it is pure, so it runs on the system node with nothing installed.
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { compileStoryline } from './deck.mjs';
import {
  CAPTION_BOX_COLOUR,
  CAPTION_BOX_OPACITY,
  CAPTION_FONT,
  assStyleOverrides,
  hexToAssColour,
  layoutToAssStyle,
} from './subtitles.mjs';

const storyline = (deck = {}) => ({
  presentation: { mode: 'video', title: 'T', theme: 'light', ...deck },
  entries: [{ id: 'a', type: 'slide', narration: 'hi', slide: { layout: 'title', title: 'X' } }],
});

const metaFor = (deck, brandPalette = null) =>
  compileStoryline(storyline(deck), { sourceText: 'x', brandPalette }).manifest.meta;

// ---------------------------------------------------------------------------
// hex -> ASS
// ---------------------------------------------------------------------------

// WHY: ASS orders channels BGR and inverts alpha, so a naive #RRGGBB paste
// produces a plausible-looking but wrong colour. Pinning the existing default
// proves the converter agrees with the constant it has to replace.
test('the converter reproduces the slate caption default exactly, so branding cannot shift unbranded output', () => {
  assert.equal(hexToAssColour('#0F172A', CAPTION_BOX_OPACITY), CAPTION_BOX_COLOUR);
});

test('channels are reversed to BGR and full opacity is alpha 00, because ASS inverts alpha', () => {
  assert.equal(hexToAssColour('#FFFFFF'), '&H00FFFFFF');
  assert.equal(hexToAssColour('#2B1B14'), '&H00141B2B');
});

test('three-digit hex is expanded before conversion', () => {
  assert.equal(hexToAssColour('#abc'), '&H00CCBBAA');
});

// WHY: a malformed style line does not degrade the caption, it fails the whole
// burn mid-render. Anything unparseable must therefore be refused here so the
// caller can fall back rather than emit it.
test('a colour ASS cannot express returns null rather than a malformed style field', () => {
  for (const bad of ['oklch(0.7 0.1 250)', 'rgb(1,2,3)', 'rebeccapurple', '#12345', '', null, undefined, 42]) {
    assert.equal(hexToAssColour(bad), null, `expected null for ${JSON.stringify(bad)}`);
  }
});

test('opacity is clamped, so an out-of-range value cannot produce a 3-digit alpha', () => {
  assert.equal(hexToAssColour('#000000', 5), '&H00000000');
  assert.equal(hexToAssColour('#000000', -2), '&HFF000000');
});

// ---------------------------------------------------------------------------
// Manifest propagation
// ---------------------------------------------------------------------------

// WHY: this is the backward-compatibility floor. Every storyboard compiled
// before brands existed must still produce these exact values.
test('with no brand the background and caption settings are byte-identical to the pre-brand output', () => {
  assert.equal(metaFor({ theme: 'light' }).background, '#F1F5F9');
  assert.equal(metaFor({ theme: 'dark' }).background, '#0F172A');
  assert.deepEqual(metaFor({}).subtitles, { enabled: true });
  assert.deepEqual(assStyleOverrides(metaFor({}).subtitles), {});
});

// WHY: meta.background is what paints the letterbox bars and the Remotion stage.
// If it stays slate, a terracotta deck sits in a grey frame and the brand is
// visibly broken in exactly the artefact the audience sees.
test('a declared brand colours the video background from its surface token', () => {
  const meta = metaFor({}, { background: '#FBF7F4', ink: '#2B1B14' });
  assert.equal(meta.background, '#FBF7F4');
});

test('an authored background still wins over the brand, because writing it down is a decision', () => {
  const meta = metaFor({ background: '#000000' }, { background: '#FBF7F4', ink: '#2B1B14' });
  assert.equal(meta.background, '#000000');
});

// WHY: two renderers consume these colours — ffmpeg wants &HAABBGGRR, Remotion
// wants CSS. Storing hex keeps one source of truth; storing ASS would force the
// React path to decode it backwards.
test('caption colours are stored as renderer-neutral hex, not as ASS fields', () => {
  const { colours } = metaFor({}, { background: '#FBF7F4', ink: '#2B1B14' }).subtitles;
  assert.deepEqual(colours, { box: '#2B1B14', text: '#FBF7F4' });
});

test('the caption box takes the brand ink and the text its surface, the readable pairing inverted', () => {
  const meta = metaFor({}, { background: '#FBF7F4', ink: '#2B1B14' });
  assert.deepEqual(assStyleOverrides(meta.subtitles), {
    BackColour: hexToAssColour('#2B1B14', CAPTION_BOX_OPACITY),
    PrimaryColour: hexToAssColour('#FBF7F4'),
  });
});

test('an authored ASS style overrides the brand field by field, leaving the others branded', () => {
  const meta = metaFor(
    { subtitles: { enabled: true, style: { BackColour: '&H00FF0000' } } },
    { background: '#FBF7F4', ink: '#2B1B14' }
  );
  const out = assStyleOverrides(meta.subtitles);
  assert.equal(out.BackColour, '&H00FF0000');
  assert.equal(out.PrimaryColour, hexToAssColour('#FBF7F4'));
});

// WHY: ASS carries a single Fontname with no fallback list and cannot embed a
// font, so naming a brand family would change caption wrapping on any machine
// that lacks it — the one machine-dependence this skill refuses to introduce.
test('the caption typeface is never branded, because ASS has no fallback list', () => {
  const meta = metaFor({}, { background: '#FBF7F4', ink: '#2B1B14' });
  assert.equal(meta.subtitles.colours.box, '#2B1B14');
  assert.equal(assStyleOverrides(meta.subtitles).Fontname, undefined);
  assert.equal(layoutToAssStyle({ fontSize: 44, alignment: 2, marginH: 0, marginV: 0 }).Fontname, CAPTION_FONT);
});

// WHY: a brand whose colours ASS cannot express must not take the captions down
// with it. The deck still renders those colours; only the burn falls back.
test('a brand colour ASS cannot express is dropped, leaving the built-in caption default', () => {
  const meta = metaFor({}, { background: 'oklch(0.98 0.01 60)', ink: 'oklch(0.2 0.04 40)' });
  assert.deepEqual(assStyleOverrides(meta.subtitles), {});
  const style = layoutToAssStyle({ fontSize: 44, alignment: 2, marginH: 0, marginV: 0 }, assStyleOverrides(meta.subtitles));
  assert.equal(style.BackColour, CAPTION_BOX_COLOUR);
});
