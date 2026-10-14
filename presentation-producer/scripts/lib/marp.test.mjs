/**
 * Marp engine tests — tier 1: no install required, system Node alone.
 *
 * The marp path is a second renderer, so the properties worth pinning are the
 * ones that make it CO-EQUAL rather than a quiet downgrade: the emitted file is
 * real Markdown a human can edit (not HTML wearing a .md extension, which is the
 * variant the design record rejected), the theme is slideCss plus a mapping table
 * rather than a second copy of the rules, the overflow and contrast gates still
 * find elements to measure, and a hand edit is detected rather than clobbered.
 *
 * Pixel parity between the two engines is renderer-dependent and deliberately not
 * asserted here — see references/capture-terminal-slides.md, which records that
 * parity is checked on geometry, never on a pixel baseline.
 *
 *   node --test scripts/lib/marp.test.mjs
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { MEASURE_FN, measureExpr, slideCss } from './deck-html.mjs';
import { LAYOUTS, storylineChecksum } from './deck.mjs';
import {
  MARP_LAYOUTS,
  MARP_MEASURE_SELECTORS,
  SELECTOR_ALIASES,
  emitDeckMarkdown,
  isHandEdited,
  marpContrastRules,

  readSourceChecksum,
  slideMarkdown,
  themeCss,
} from './marp.mjs';

const slide = (over = {}) => ({
  layout: 'spotlight',
  theme: 'light',
  title: 'Deterministic by construction',
  cards: [
    { icon: 'shield', title: 'Locked', text: 'The storyboard is a lockfile.', detail: 'STEP ONE' },
    { title: 'Cached', text: 'Content-addressed keys.' },
    { title: 'Gated', text: 'Overflow fails the build.' },
  ],
  ...over,
});

const icons = { shield: '<svg viewBox="0 0 24 24"></svg>' };

// ---------------------------------------------------------------------------
// The emission is Markdown, not HTML
// ---------------------------------------------------------------------------

// WHY: this is the whole reason the engine exists. A user who picks `marp` wants
// an editable Markdown file; emitting <div> soup would make the extension a lie
// and the editability — the only thing this engine offers over the HTML path —
// would evaporate. The design record rejected that variant explicitly.
test('a slide is emitted as editable Markdown with no HTML elements at all', () => {
  const { markdown } = slideMarkdown(slide(), icons);
  assert.ok(!/<(div|section|span|h1|p)\b/.test(markdown), `markdown contains HTML:\n${markdown}`);
  assert.match(markdown, /^<!-- _class: spotlight -->/);
  assert.match(markdown, /^# Deterministic by construction$/m);
  assert.match(markdown, /^> ### Locked$/m);
  assert.match(markdown, /^> The storyboard is a lockfile\.$/m);
  assert.match(markdown, /^> ###### STEP ONE$/m);
});

// WHY: a blockquote is the one Markdown construct that yields a single container
// element per item, which is what lets the theme place cards on a grid without
// HTML wrappers. One blockquote per card is therefore a load-bearing invariant,
// not a formatting preference.
test('each card is exactly one blockquote, so the theme can place it on the grid', () => {
  const { markdown } = slideMarkdown(slide(), icons);
  const blocks = markdown.split('\n\n').filter((b) => b.startsWith('> '));
  assert.equal(blocks.length, 3);
});

test('the layout directive is how marpit puts the layout class on the section', () => {
  for (const layout of MARP_LAYOUTS) {
    const cards = Array.from({ length: LAYOUTS[layout].slots.cards[0] }, (_, i) => ({ title: `C${i}`, text: 't' }));
    const stat = LAYOUTS[layout].slots.stat ? { value: '9', unit: 'x', label: 'faster' } : null;
    const { markdown } = slideMarkdown({ layout, title: 'T', cards, stat }, icons);
    assert.match(markdown, new RegExp(`^<!-- _class: ${layout} -->`));
  }
});

test('a card-free layout emits no blockquote, because a claim carries the slide alone', () => {
  const { markdown } = slideMarkdown({ layout: 'statement', title: 'One claim', body: 'Why it matters' }, icons);
  assert.ok(!/^>/m.test(markdown), markdown);
  assert.match(markdown, /^# One claim$/m);
  assert.match(markdown, /^Why it matters$/m);
});

test('the stat block leads its slide as a metric blockquote', () => {
  const { markdown } = slideMarkdown(
    { layout: 'stat-deepdive', title: 'T', stat: { value: '42', unit: 'ms', label: 'p95 latency' }, cards: [{ title: 'A', text: 'a' }, { title: 'B', text: 'b' }] },
    icons
  );
  assert.match(markdown, /^> ## 42 ms$/m);
  assert.match(markdown, /^> p95 latency$/m);
  assert.ok(markdown.indexOf('> ## 42 ms') < markdown.indexOf('> ### A'));
});

test('the custom escape hatch has no marp emission and says so', () => {
  assert.throws(() => slideMarkdown({ layout: 'custom', htmlPath: 'a.html' }), /HTML-engine escape hatch/);
  assert.ok(!MARP_LAYOUTS.includes('custom'));
});

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

// WHY: a data URI keeps --allow-local-files — flagged NOT SECURE by marp-cli —
// avoidable, and keeps the .md self-contained.
test('an icon travels as an inline data URI rather than a local file reference', () => {
  const { markdown } = slideMarkdown(slide(), icons);
  assert.match(markdown, /^> !\[\]\(data:image\/svg\+xml;base64,[A-Za-z0-9+/=]+\)$/m);
  assert.ok(!markdown.includes('.svg'));
});

// WHY: an unknown icon is a wiring bug. Emitting a broken image would hide it
// inside the render; reporting the name puts it in the build output where the
// unknown-icon rule already lives.
test('an unknown icon is reported by name instead of emitting a broken image', () => {
  const { markdown, missingIcons } = emitDeckMarkdown({ slides: [slide({ cards: [{ icon: 'nope', title: 'A', text: 'a' }] })], icons });
  assert.deepEqual(missingIcons, ['nope']);
  assert.ok(!markdown.includes('data:image'));
  assert.ok(!markdown.includes('nope'));
});

// ---------------------------------------------------------------------------
// The generated-file contract
// ---------------------------------------------------------------------------

// WHY: mirrors lockfileStatus(). Overwriting a hand edit silently is how a
// generated-file model loses trust, and the accepted cost of this engine is that
// a hand edit is unvalidated — so it must at least be DETECTED.
test('the emitted file carries a generated marker and the source checksum', () => {
  const sourceText = 'deck:\n  title: T\n';
  const { markdown } = emitDeckMarkdown({ slides: [slide()], icons, sourceText });
  assert.match(markdown, /GENERATED FILE/);
  assert.equal(readSourceChecksum(markdown), storylineChecksum(sourceText));
});

test('a supplied checksum is used verbatim so the .md and the storyboard agree on one source', () => {
  const { markdown } = emitDeckMarkdown({ slides: [slide()], icons, checksum: 'abc123def' });
  assert.equal(readSourceChecksum(markdown), 'abc123def');
});

test('the recorded checksum tells a moved-on source from an edited body', () => {
  const sourceText = 'deck:\n  title: T\n';
  const { markdown } = emitDeckMarkdown({ slides: [slide()], icons, sourceText });
  assert.equal(readSourceChecksum(markdown), storylineChecksum(sourceText));
  assert.notEqual(readSourceChecksum(markdown), storylineChecksum('deck:\n  title: CHANGED\n'));
  assert.equal(readSourceChecksum('# hand written\n'), null);
});

test('a hand edit is detected, and a file that is merely stale is not mistaken for one', () => {
  const { markdown } = emitDeckMarkdown({ slides: [slide()], icons, checksum: 'abc123def' });
  assert.equal(isHandEdited(markdown, markdown), false);
  assert.equal(isHandEdited(null, markdown), false);
  assert.equal(isHandEdited(`${markdown}\n\n> ### A fourth card someone added\n`, markdown), true);
  // No marker at all means the file was authored by hand, so it is never
  // clobbered — the same trust rule storyboard.json lives by.
  assert.equal(isHandEdited('# Just a deck I wrote\n', markdown), true);
  // A different recorded checksum means the source moved on, so the body
  // difference is expected regeneration rather than someone's edit.
  const stale = emitDeckMarkdown({ slides: [slide({ title: 'Older title' })], icons, checksum: 'deadbeef' }).markdown;
  assert.equal(isHandEdited(stale, markdown), false);
});

// ---------------------------------------------------------------------------
// One CSS generator, two consumers
// ---------------------------------------------------------------------------

// WHY: two renderers are acceptable ONLY because they share one CSS generator.
// If the marp theme restated the rules, the two engines would drift and equality
// would have to be inspected rather than guaranteed.
test('the theme is slideCss with marp selectors added, not a second copy of the rules', () => {
  const base = slideCss({});
  const theme = themeCss({});
  for (const [cls, marp] of SELECTOR_ALIASES) {
    assert.ok(theme.includes(`${marp},${cls}{`), `missing alias for ${cls}`);
  }
  // Every declaration block in the base sheet survives into the theme.
  const declarations = base.match(/\{[^{}]+\}/g) ?? [];
  assert.ok(declarations.length > 20);
  for (const d of declarations) assert.ok(theme.includes(d), `theme dropped ${d.slice(0, 40)}`);
});

test('aliasing leaves the HTML path untouched, so its byte-identical output holds', () => {
  const before = slideCss({ orientation: 'landscape', theme: 'light' });
  themeCss({ orientation: 'landscape', theme: 'light' });
  assert.equal(slideCss({ orientation: 'landscape', theme: 'light' }), before);
});

// WHY: the substring `.card` sits inside `.card-title`, so an unordered transform
// would rewrite the longer selector and silently lose the card rule.
test('a longer class is aliased before the shorter one it contains', () => {
  const theme = themeCss({});
  assert.match(theme, /section blockquote h3,\.card-title\{/);
  assert.match(theme, /section blockquote,\.card\{/);
  assert.ok(!theme.includes('section blockquote,.card-title{'));
});

// WHY: markdown gives a FLAT section — the header elements and the blockquotes
// are all direct children — so the grid genuinely has to be new CSS rather than a
// restatement of `.grid.spotlight`.
test('each layout gets a section grid rule, and portrait collapses to one column', () => {
  const landscape = themeCss({ orientation: 'landscape' });
  for (const layout of MARP_LAYOUTS) {
    assert.ok(landscape.includes(`section.${layout}{`), `${layout} has no marp grid rule`);
  }
  assert.match(landscape, /section\.spotlight\{grid-template-columns:1\.6fr 1fr\}/);
  const portrait = themeCss({ orientation: 'vertical' });
  assert.match(portrait, /section\.bento-b,[\s\S]*?\{grid-template-columns:1fr\}/);
});

// WHY: the markdown tree is flat where the HTML tree nests, so cycle needs its
// own section rule — the HTML return connector cannot exist in pure Markdown, so
// on the marp path the grid mirrors lifecycle and the loop reads from the stage
// labels. Portrait collapses cycle to a single reading column like the rest.
test('cycle has a section grid rule on the marp path, landscape and portrait', () => {
  assert.ok(MARP_LAYOUTS.includes('cycle'));
  const landscape = themeCss({ orientation: 'landscape' });
  assert.match(landscape, /section\.cycle\{grid-auto-flow:column;grid-auto-columns:1fr\}/);
  const portrait = themeCss({ orientation: 'vertical' });
  assert.match(portrait, /section\.cycle\{grid-auto-flow:row\}/);
});

// WHY: cycle carries no HTML wrapper on the marp path, so it must emit ordinary
// blockquote cards like every other card layout, under its own _class directive.
test('a cycle slide emits stage cards as blockquotes under its layout directive', () => {
  const { markdown } = slideMarkdown(
    { layout: 'cycle', title: 'Retention loop', cards: [{ title: 'Reach' }, { title: 'Engage' }, { title: 'Return' }] },
    icons
  );
  assert.match(markdown, /^<!-- _class: cycle -->/);
  assert.match(markdown, /^> ### Reach$/m);
  assert.match(markdown, /^> ### Return$/m);
});

// ---------------------------------------------------------------------------
// The gates hold on both engines
// ---------------------------------------------------------------------------

// WHY: this is the difference between a second engine and an unannounced
// downgrade. CSS cannot add attributes, so a markdown-native slide carries no
// data-measure; a hardcoded selector would find nothing and the overflow gate
// would pass on every slide while appearing to have run.
test('the measurement selector list is a parameter, defaulting to the HTML attribute', () => {
  assert.match(MEASURE_FN, /\(selectors\) =>/);
  assert.match(MEASURE_FN, /\['\[data-measure\]'\]/);
  const marp = measureExpr({ selectors: MARP_MEASURE_SELECTORS });
  assert.ok(marp.includes('"selectors":["section"'));
  // The unparameterised call keeps the attribute behaviour it always had.
  assert.ok(measureExpr({}).includes('"selectors":null'));
});

test('the marp selector list covers the slide box, every card and every text run', () => {
  assert.ok(MARP_MEASURE_SELECTORS.includes('section'));
  assert.ok(MARP_MEASURE_SELECTORS.includes('section blockquote'));
  assert.ok(MARP_MEASURE_SELECTORS.some((s) => /h1/.test(s)));
  assert.ok(MARP_MEASURE_SELECTORS.some((s) => /blockquote (h3|p)/.test(s)));
});

// WHY: contrast reads the real DOM, so CSS aliasing cannot help it — the marp
// tree has no .card-title class to match. Widening the rule selector is the one
// place this is fixable, and the threshold must survive untouched.
test('contrast rules gain their marp equivalent and keep their thresholds exactly', () => {
  const rules = [
    { selector: '.card-detail', min: 4.5, note: 'accent on card' },
    { selector: '.hero-title', min: 3.0 },
  ];
  const widened = marpContrastRules(rules);
  assert.equal(widened[0].selector, '.card-detail,section blockquote h6');
  assert.equal(widened[0].min, 4.5);
  assert.equal(widened[0].note, 'accent on card');
  // A selector with no marp equivalent passes through rather than being dropped.
  assert.deepEqual(widened[1], rules[1]);
});

test('the aliasing table is the single place the element mapping is written down', () => {
  const classes = SELECTOR_ALIASES.map(([cls]) => cls);
  assert.equal(new Set(classes).size, classes.length, 'a class is aliased twice');
  // Both consumers read the same table, so neither can drift from the other.
  const theme = themeCss({});
  for (const [cls, marp] of SELECTOR_ALIASES) {
    const widened = marpContrastRules([{ selector: cls, min: 3 }])[0].selector;
    assert.equal(widened, `${cls},${marp}`);
    assert.ok(theme.includes(`${marp},${cls}{`));
  }
});
