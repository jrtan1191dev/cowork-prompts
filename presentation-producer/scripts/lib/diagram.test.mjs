/**
 * Diagram slot and URL-sourced custom slides — tier 1: no install, no browser,
 * no Python. The renderer-side behaviour (embedding, the floor measurement, the
 * HAR replay) is verified by rendering a deck; these cover the rules.
 *
 *   node --test scripts/lib/diagram.test.mjs
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { compileStoryline, recommendLayout, validateStoryline } from './deck.mjs';
import { renderSlideHtml } from './deck-html.mjs';
import {
  DIAGRAM_KINDS,
  MAX_DIAGRAM_STEPS,
  countDiagramNodes,
  customUrlProblem,
  diagramCanvas,
  diagramFiles,
  diagramHash,
  diagramProfile,
  diagramSpec,
  diagramStatus,
  profileThemeFor,
  resolveDiagram,
} from './diagram.mjs';
import { slideMarkdown, themeCss } from './marp.mjs';

const slides = (entries) => ({ presentation: { mode: 'slides', title: 'T' }, entries });

const seq = {
  kind: 'sequence',
  actors: ['A', 'API', 'B'],
  messages: [
    { from: 'A', to: 'API', label: 'CLAIM', weight: 'primary' },
    { from: 'B', to: 'API', label: 'CLAIM' },
  ],
};

const diagramSlide = (over = {}) => ({
  id: 'race',
  type: 'slide',
  layout: 'diagram',
  title: 'Two people race for one patient; only one wins',
  diagram: seq,
  ...over,
});

const errorsOf = (entries) => validateStoryline(slides(entries)).errors;
const warningsOf = (entries) => validateStoryline(slides(entries)).warnings;

// ---------------------------------------------------------------------------
// Validation

test('a well-formed diagram slide validates cleanly', () => {
  assert.deepEqual(errorsOf([diagramSlide()]), []);
});

// WHY: the kind names the type reference the agent opens next, so a typo must
// fail exactly as an unknown layout or icon does — never draw a guessed type.
test('an unknown diagram kind is an error, and every upstream type is accepted', () => {
  assert.ok(errorsOf([diagramSlide({ diagram: { ...seq, kind: 'sequnce' } })]).some((e) => /unknown diagram kind "sequnce"/.test(e)));
  assert.equal(DIAGRAM_KINDS.size, 45);
  for (const k of ['sequence', 'swimlane', 'tree', 'layers', 'flowchart', 'architecture', 'quadrant', 'pyramid']) assert.ok(DIAGRAM_KINDS.has(k), k);
});

// WHY: shape is a claim, and one claim gets one implementation — two answers for
// "this recurs" is the duplicate advice that retired bento-a.
test('loop and timeline redirect to the cycle and lifecycle layouts', () => {
  assert.ok(errorsOf([diagramSlide({ diagram: { kind: 'loop', nodes: ['a', 'b', 'c'] } })]).some((e) => /layout "cycle"/.test(e)));
  assert.ok(errorsOf([diagramSlide({ diagram: { kind: 'timeline', nodes: ['a', 'b', 'c'] } })]).some((e) => /layout "lifecycle"/.test(e)));
});

test('layout "diagram" without a diagram block is an error', () => {
  assert.ok(errorsOf([diagramSlide({ diagram: undefined })]).some((e) => /needs a `diagram:` block/.test(e)));
});

// WHY: the diagram is the primary element, so it can only take a slot the eye
// lands on first, and at most two cards may support it.
test('a diagram sits only on diagram or a dominant slot, with bounded cards', () => {
  assert.ok(errorsOf([diagramSlide({ layout: 'tiled', cards: [{ title: 'a' }, { title: 'b' }, { title: 'c' }] })]).some((e) => /dominant slot/.test(e)));
  assert.deepEqual(errorsOf([diagramSlide({ layout: 'spotlight', cards: [{ title: 'a' }, { title: 'b' }] })]), []);
  assert.deepEqual(errorsOf([diagramSlide({ layout: 'hero' })]), []);
  assert.ok(errorsOf([diagramSlide({ cards: [{ title: 'a' }, { title: 'b' }, { title: 'c' }] })]).some((e) => /takes 0-2 cards/.test(e)));
});

test('a card cannot claim primary beside a diagram, and a diagram slide has no stat', () => {
  assert.ok(errorsOf([diagramSlide({ cards: [{ title: 'a', weight: 'primary' }] })]).some((e) => /diagram is the primary element/.test(e)));
  assert.ok(errorsOf([diagramSlide({ stat: { value: '1' } })]).some((e) => /has no stat/.test(e)));
});

// WHY: the accent is editorial, not a flag — the same "salience is relative"
// rule as two primary cards, in diagram vocabulary.
test('at most one primary and one secondary accent inside a diagram', () => {
  const two = { ...seq, messages: seq.messages.map((m) => ({ ...m, weight: 'primary' })) };
  assert.ok(errorsOf([diagramSlide({ diagram: two })]).some((e) => /2 elements declare weight: primary/.test(e)));
  const odd = { ...seq, messages: [{ from: 'A', to: 'B', weight: 'tertiary' }] };
  assert.ok(errorsOf([diagramSlide({ diagram: odd })]).some((e) => /unknown weight "tertiary"/.test(e)));
});

// WHY: a hand-placed bar is a claim no gate can check.
test('a chart kind without data is an error', () => {
  assert.ok(errorsOf([diagramSlide({ diagram: { kind: 'bar' } })]).some((e) => /carries no data/.test(e)));
  assert.deepEqual(errorsOf([diagramSlide({ diagram: { kind: 'bar', data: [{ label: 'a', value: 3 }] } })]), []);
});

test('more than two annotations is an error; over the node budget is a warning', () => {
  assert.ok(errorsOf([diagramSlide({ diagram: { ...seq, annotations: ['a', 'b', 'c'] } })]).some((e) => /at most 2/.test(e)));
  const big = { kind: 'architecture', nodes: Array.from({ length: 11 }, (_, i) => `n${i}`) };
  assert.deepEqual(errorsOf([diagramSlide({ diagram: big })]), []);
  assert.ok(warningsOf([diagramSlide({ diagram: big })]).some((w) => /~11 nodes/.test(w)));
});

// WHY: a reveal is one scene per step, all reading ONE drawing, so the ref must
// point at the defining entry and the step must fit diagram-design's budget.
test('step scenes reference the defining entry and stay within the motion budget', () => {
  const base = diagramSlide();
  const step = (n, extra = {}) => ({ id: `race-${n}`, type: 'slide', layout: 'diagram', title: 'A step of the race, as a sentence.', diagram: { ref: 'race', step: n }, ...extra });
  assert.deepEqual(errorsOf([base, step(1), step(2)]), []);
  assert.ok(errorsOf([base, step(MAX_DIAGRAM_STEPS + 1)]).some((e) => /integer 1-8/.test(e)));
  assert.ok(errorsOf([base, { ...step(1), diagram: { ref: 'nope', step: 1 } }]).some((e) => /no entry "nope"/.test(e)));
  assert.ok(errorsOf([base, { ...step(1), diagram: { ref: 'race', step: 1, kind: 'tree' } }]).some((e) => /carries only `ref` and `step`/.test(e)));
  assert.ok(errorsOf([base, step(1, { layout: 'spotlight', cards: [{ title: 'a' }, { title: 'b' }] })]).some((e) => /same layout and card count/.test(e)));
});

test('the advisor routes an entry with a diagram to the diagram layout', () => {
  assert.equal(recommendLayout({ diagram: seq }).layout, 'diagram');
  assert.equal(recommendLayout({ htmlUrl: 'https://x.test/a.html' }).layout, 'custom');
});

// ---------------------------------------------------------------------------
// Custom slides from a URL

test('a custom slide takes a path or a URL, never both, and never credentials', () => {
  const custom = (over) => ({ id: 'c', type: 'slide', layout: 'custom', title: 't', ...over });
  assert.deepEqual(errorsOf([custom({ htmlUrl: 'https://x.test/a.html' })]), []);
  assert.ok(errorsOf([custom({})]).some((e) => /htmlPath or an htmlUrl/.test(e)));
  assert.ok(errorsOf([custom({ htmlPath: 'a.html', htmlUrl: 'https://x.test' })]).some((e) => /not both/.test(e)));
  assert.ok(errorsOf([custom({ htmlUrl: 'ftp://x.test/a' })]).some((e) => /http\(s\)/.test(e)));
  assert.ok(errorsOf([custom({ htmlUrl: 'https://u:p@x.test/a' })]).some((e) => /credentials/.test(e)));
  assert.equal(customUrlProblem('https://x.test/a.html'), null);
});

test('a vertical deck needs a portrait source for a URL custom slide too', () => {
  const s = slides([{ id: 'c', type: 'slide', layout: 'custom', title: 't', htmlUrl: 'https://x.test/a.html' }]);
  s.presentation.orientations = ['landscape', 'vertical'];
  assert.ok(validateStoryline(s).errors.some((e) => /portraitHtmlUrl/.test(e)));
});

// ---------------------------------------------------------------------------
// Compilation

test('compiled slides carry the resolved diagram, and other slides are unchanged', () => {
  const story = { presentation: { mode: 'video', title: 'T' }, entries: [
    { ...diagramSlide(), narration: 'n' },
    { id: 'race-1', type: 'slide', layout: 'diagram', title: 'A step.', diagram: { ref: 'race', step: 1 }, narration: 'n' },
    { id: 'plain', type: 'slide', layout: 'statement', title: 'A claim carries this slide.', narration: 'n' },
  ] };
  const { manifest } = compileStoryline(story);
  const [def, step, plain] = manifest.scenes.map((s) => s.slide);
  assert.equal(def.diagram.id, 'race');
  assert.equal(def.diagram.kind, 'sequence');
  assert.equal(step.diagram.id, 'race');
  assert.equal(step.diagram.step, 1);
  assert.deepEqual(step.diagram.spec, def.diagram.spec);
  // Byte-identity: a slide without a diagram gains no key, so its cache key holds.
  assert.ok(!('diagram' in plain) && !('htmlUrl' in plain));
});

test('the spec excludes control keys, so a reason comment never invalidates a drawing', () => {
  assert.deepEqual(diagramSpec({ kind: 'tree', nodes: [1], reason: 'x', step: 2 }), { kind: 'tree', nodes: [1] });
  const r = resolveDiagram({ id: 'a', layout: 'spotlight', cards: [{}, {}], diagram: { kind: 'tree', nodes: [1] } });
  assert.deepEqual(r.placement, { layout: 'spotlight', cards: 2 });
});

test('node counting reaches nested node-like arrays', () => {
  assert.equal(countDiagramNodes({ kind: 'tree', nodes: [{ name: 'a', children: ['b', 'c'] }] }), 3);
  assert.equal(countDiagramNodes(seq), 3);
});

// ---------------------------------------------------------------------------
// Staleness

// WHY: a drawing that contradicts its spec passes every other gate, so the hash
// covers every input that changes what it must say — and the skill version is
// deliberately absent, or each upstream update would invalidate every deck.
test('the diagram hash moves with spec, profile and size, and nothing else', () => {
  const base = { spec: seq, profileText: 'p', size: { width: 1, height: 2 } };
  const h = diagramHash(base);
  assert.equal(h, diagramHash({ ...base }));
  assert.notEqual(h, diagramHash({ ...base, spec: { ...seq, actors: ['A'] } }));
  assert.notEqual(h, diagramHash({ ...base, profileText: 'q' }));
  assert.notEqual(h, diagramHash({ ...base, size: { width: 1, height: 3 } }));
  assert.equal(h, diagramHash({ ...base, version: '9.9' }));
});

test('status is missing, stale or ok', () => {
  const provenance = { frames: { landscape: { hash: 'h1' } } };
  assert.equal(diagramStatus({ provenance, orientation: 'landscape', expectedHash: 'h1', svgExists: false }), 'missing');
  assert.equal(diagramStatus({ provenance, orientation: 'landscape', expectedHash: 'h2', svgExists: true }), 'stale');
  assert.equal(diagramStatus({ provenance, orientation: 'vertical', expectedHash: 'h1', svgExists: true }), 'stale');
  assert.equal(diagramStatus({ provenance: null, orientation: 'landscape', expectedHash: 'h1', svgExists: true }), 'stale');
  assert.equal(diagramStatus({ provenance, orientation: 'landscape', expectedHash: 'h1', svgExists: true }), 'ok');
});

test('frozen file names are per orientation and per step', () => {
  assert.equal(diagramFiles('race').svg, 'diagrams/race.svg');
  assert.equal(diagramFiles('race', 'vertical').svg, 'diagrams/race.vertical.svg');
  assert.equal(diagramFiles('race', 'landscape', 2).svg, 'diagrams/race.step-2.svg');
  assert.equal(diagramFiles('race', 'vertical', 2).provenance, 'diagrams/race.provenance.json');
});

test('a diagram is drawn at its slot size, smaller beside cards', () => {
  const full = diagramCanvas('diagram', 'landscape', 0);
  const withCards = diagramCanvas('diagram', 'landscape', 2);
  assert.ok(withCards.width < full.width);
  for (const o of ['landscape', 'vertical', 'square']) {
    for (const l of ['diagram', 'hero', 'spotlight', 'bento-b']) {
      const { width, height } = diagramCanvas(l, o);
      assert.equal(width % 4, 0, `${l}/${o} width on the 4px grid`);
      assert.equal(height % 4, 0, `${l}/${o} height on the 4px grid`);
    }
  }
});

// ---------------------------------------------------------------------------
// Brand profile

test('dark is optional: a dark slide without designDark draws on the light profile', () => {
  assert.equal(profileThemeFor('light', { hasLight: true }), 'light');
  assert.equal(profileThemeFor('dark', { hasLight: true, hasDark: true }), 'dark');
  assert.equal(profileThemeFor('dark', { hasLight: true, hasDark: false }), 'light');
  // No brand at all: the built-ins follow the slide's own theme.
  assert.equal(profileThemeFor('dark', {}), 'dark');
});

// WHY: one brand source. The profile maps the deck's resolved tokens onto
// diagram-design's roles and carries the deck's TYPE scale, so node names land on
// card-text rather than diagram-design's 16px ramp.
test('the profile maps deck tokens onto diagram-design roles and type scale', () => {
  const text = diagramProfile({
    tokens: { '--bg': '#FAFAFA', '--primary': '#111111', '--secondary': '#555555', '--accent-1': '#1D4ED8', '--rule': '#DDDDDD', '--card-alt': '#F0F0F0' },
    typeScale: { 'card-text': 26, 'card-detail': 20, 'card-title': 36 },
    fontFamily: 'Geist',
    source: 'DESIGN.md',
  });
  assert.match(text, /\| `paper` \| [^|]+\| `#FAFAFA` \|/);
  assert.match(text, /\| `ink` \| [^|]+\| `#111111` \|/);
  assert.match(text, /\| `accent` \| [^|]+\| `#1D4ED8` \|/);
  assert.match(text, /\| `node-name` \| Geist \| 26px \|/);
  assert.match(text, /\| `arrow-label` \| ui-monospace \| 20px \|/);
  // Mixed-case sublabels take the body size, not the all-caps detail size.
  assert.match(text, /\| `sublabel` \| ui-monospace \| 26px \|/);
  assert.match(text, /Font source: `system`/);
  assert.match(text, /GENERATED from DESIGN\.md/);
  assert.match(text, /### Semantic roles/);
  assert.match(text, /## Typography/);
});

// ---------------------------------------------------------------------------
// Rendering (template level)

test('the diagram body inlines the frozen SVG, or a conspicuous placeholder', () => {
  const slide = { layout: 'diagram', title: 'T', diagram: { id: 'race' }, diagramSvg: '<svg viewBox="0 0 4 4"><text>x</text></svg>', cards: [] };
  const html = renderSlideHtml({ slide });
  assert.match(html, /data-measure="diagram" data-diagram="race"><svg viewBox/);
  const missing = renderSlideHtml({ slide: { ...slide, diagramSvg: null } });
  assert.match(missing, /data-diagram-missing="race"/);
});

test('a diagram fills the dominant slot of spotlight, bento-b and hero', () => {
  const base = { title: 'T', diagram: { id: 'd' }, diagramSvg: '<svg></svg>', cards: [{ title: 'a' }, { title: 'b' }] };
  assert.match(renderSlideHtml({ slide: { ...base, layout: 'spotlight' } }), /diagram-frame lead/);
  assert.match(renderSlideHtml({ slide: { ...base, layout: 'bento-b' } }), /diagram-frame span-wide/);
  const hero = renderSlideHtml({ slide: { ...base, layout: 'hero', cards: [] } });
  assert.match(hero, /hero-visual"><div class="diagram-frame/);
  // Both supporting cards survive: the diagram replaces the lead CARD, not a card.
  assert.equal((renderSlideHtml({ slide: { ...base, layout: 'spotlight' } }).match(/class="card detail"/g) ?? []).length, 2);
});

test('the marp path carries the diagram as the first blockquote image', () => {
  const { markdown } = slideMarkdown({ layout: 'diagram', title: 'T', diagram: { id: 'd' }, diagramSvg: '<svg></svg>', cards: [{ title: 'a' }] });
  const first = markdown.indexOf('> ![](data:image/svg+xml;base64,');
  assert.ok(first > 0 && first < markdown.indexOf('> ### a'));
  assert.ok(themeCss({ orientation: 'landscape' }).includes('section.diagram{'));
});
