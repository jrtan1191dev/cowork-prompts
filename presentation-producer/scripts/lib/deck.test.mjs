/**
 * Deck layer tests — tier 1: no install required, system Node alone.
 *
 * These cover the parts most likely to regress and cheapest to check: schema
 * invariants, compilation, id stability, portrait rules and the redundancy
 * heuristic. Rendering is verified separately by measuring geometry in a
 * browser, never by comparing pixels — a baseline image fails for antialiasing
 * and gets re-baselined reflexively, which teaches people to ignore it.
 *
 *   node --test scripts/lib/deck.test.mjs
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { pathToFileURL } from 'node:url';

import { captureCacheKey, isMainModule, validateManifest } from './core.mjs';
import { CANVAS, THEME_TOKENS, renderSlideHtml, resolveThemeTokens, slideCss } from './deck-html.mjs';
import {
  LAYOUTS,
  recommendLayout,
  SCR_SKELETON,
  compileStoryline,
  storylineChecksum,
  deckEntries,
  defaultLayoutFor,
  narrationOverlap,
  slideText,
  validateStoryline,
  CARD_WEIGHTS,
  VIEWING_PROFILES,
  legibilityFloorReport,
  typeFloor,
} from './deck.mjs';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const slide = (over = {}) => ({
  id: 'a-slide',
  type: 'slide',
  layout: 'tiled',
  title: 'A title',
  narration: 'Something spoken that does not repeat the cards.',
  cards: [
    { icon: 'shield', title: 'One', text: 'First' },
    { icon: 'timer', title: 'Two', text: 'Second' },
    { icon: 'users', title: 'Three', text: 'Third' },
  ],
  ...over,
});

// Splits authored meta into the two blocks the way an author would: video keys
// into `video:`, everything else into `presentation:`. Tests pass meta flat, so
// this is the one place that knows where each key lives.
const VIDEO_META = new Set(['aspect', 'captureAspect', 'outputs', 'voice', 'baseUrl', 'fixedTime', 'fps', 'subtitles', 'background', 'bgm']);
const storylineOf = (entries, meta = {}) => {
  const presentation = { mode: 'video', title: 'T', engine: 'html', theme: 'light' };
  const video = {};
  for (const [k, v] of Object.entries(meta)) (VIDEO_META.has(k) ? video : presentation)[k] = v;
  return { presentation, ...(Object.keys(video).length ? { video } : {}), entries };
};

const scrStoryline = (over = {}) =>
  storylineOf(
    [
      slide({ id: '01-s', role: 'situation', layout: 'stat-deepdive', cards: [{ title: 'a' }, { title: 'b' }], stat: { value: '3', label: 'doctors' }, narration: 'Three doctors must agree, which takes four hours.' }),
      slide({ id: '02-c', role: 'complication', layout: 'comparison', cards: [{ title: 'old' }, { title: 'new' }], narration: 'Consensus by phone costs about four hours of waiting.' }),
      slide({ id: '03-r', role: 'resolution', layout: 'tiled', narration: 'The engine resolves disagreement toward the safer answer.' }),
      slide({ id: '04-r', role: 'resolution', layout: 'tiled', narration: 'Everything downstream reads one shared queue.' }),
    ],
    { archetype: 'scr', ...over }
  );

// ---------------------------------------------------------------------------
// layout completeness (D12)
// ---------------------------------------------------------------------------

test('every layout declares a portrait behaviour — a layout without one is incomplete', () => {
  for (const [name, spec] of Object.entries(LAYOUTS)) {
    assert.ok(spec.portrait && spec.portrait.length > 10, `${name} has no portrait rule`);
    assert.ok(Array.isArray(spec.slots.cards), `${name} has no card range`);
  }
});

test('each SCR role maps to a real layout', () => {
  for (const role of Object.keys(SCR_SKELETON)) {
    assert.ok(LAYOUTS[defaultLayoutFor(role)], `${role} defaults to an unknown layout`);
  }
});

// ---------------------------------------------------------------------------
// validation: invariants fail
// ---------------------------------------------------------------------------

test('a valid storyline produces no errors', () => {
  const { errors } = validateStoryline(storylineOf([slide()]));
  assert.deepEqual(errors, []);
});

test('card count outside the layout range is an error', () => {
  const { errors } = validateStoryline(storylineOf([slide({ layout: 'comparison' })])); // 3 cards, needs 2
  assert.ok(errors.some((e) => /takes 2 cards/.test(e)), errors.join('\n'));
});

test('a stat on a layout with nowhere to put it is an error', () => {
  const { errors } = validateStoryline(storylineOf([slide({ stat: { value: '1' } })]));
  assert.ok(errors.some((e) => /nowhere to put a stat/.test(e)));
});

test('unknown icon names fail rather than rendering blank space', () => {
  const iconNames = new Set(['shield', 'timer']);
  const { errors } = validateStoryline(storylineOf([slide()]), { iconNames });
  assert.ok(errors.some((e) => /unknown icon "users"/.test(e)));
});

test('icon validation is skipped when the set is not installed', () => {
  const { errors } = validateStoryline(storylineOf([slide()]));
  assert.ok(!errors.some((e) => /unknown icon/.test(e)));
});

test('ids must be stable, unique, kebab-case — they are cache keys', () => {
  const dup = validateStoryline(storylineOf([slide({ id: 'x' }), slide({ id: 'x' })]));
  assert.ok(dup.errors.some((e) => /duplicate id/.test(e)));
  const bad = validateStoryline(storylineOf([slide({ id: 'Not Kebab' })]));
  assert.ok(bad.errors.some((e) => /lower-kebab-case/.test(e)));
});

test('a capture entry without assert.visible is rejected', () => {
  const { errors } = validateStoryline(storylineOf([{ id: 'c', type: 'capture', url: '/x', narration: 'n' }]));
  assert.ok(errors.some((e) => /assert\.visible/.test(e)));
});

test('narration is required for video entries but not for deck-only slides', () => {
  const deckOnly = validateStoryline(storylineOf([slide({ id: 'd', in: ['deck'], narration: undefined })]));
  assert.deepEqual(deckOnly.errors, []);
  const inVideo = validateStoryline(storylineOf([slide({ id: 'v', narration: '  ' })]));
  assert.ok(inVideo.errors.some((e) => /narration/.test(e)));
});

test('custom layout needs an html path, and a portrait one when vertical is declared', () => {
  const noHtml = validateStoryline(storylineOf([{ id: 'c', type: 'slide', layout: 'custom', title: 't', narration: 'n' }]));
  assert.ok(noHtml.errors.some((e) => /htmlPath/.test(e)));

  const vertical = validateStoryline(
    storylineOf([{ id: 'c', type: 'slide', layout: 'custom', htmlPath: 'a.html', title: 't', narration: 'n' }], {
      outputs: [{ aspect: 'landscape' }, { aspect: 'vertical' }],
    })
  );
  assert.ok(vertical.errors.some((e) => /portraitHtmlPath/.test(e)), vertical.errors.join('\n'));
});

test('pip belongs on a capture, not a slide', () => {
  const { errors } = validateStoryline(storylineOf([slide({ overlay: 'pip' })]));
  assert.ok(errors.some((e) => /pip belongs on a capture/.test(e)));
});

test('generated footage may not live in the gitignored assets directory', () => {
  const { errors } = validateStoryline(
    storylineOf([{ id: 'f', type: 'footage', narration: 'n', src: 'assets/b.mp4', generate: { provider: 'veo', prompt: 'x' } }])
  );
  assert.ok(errors.some((e) => /committed directory/.test(e)));
});

test('footage trim points must be ordered', () => {
  const { errors } = validateStoryline(
    storylineOf([{ id: 'f', type: 'footage', narration: 'n', src: 'footage/b.mp4', trim: { in: 5, out: 2 } }])
  );
  assert.ok(errors.some((e) => /out must be greater than in/.test(e)));
});

// ---------------------------------------------------------------------------
// SCR archetype (D5)
// ---------------------------------------------------------------------------

test('the SCR archetype enforces its beat ranges', () => {
  const ok = validateStoryline(scrStoryline());
  assert.deepEqual(ok.errors, []);

  const noComplication = storylineOf(
    [slide({ id: '01-s', role: 'situation' }), slide({ id: '02-r', role: 'resolution' }), slide({ id: '03-r', role: 'resolution' })],
    { archetype: 'scr' }
  );
  const missing = validateStoryline(noComplication);
  assert.ok(missing.errors.some((e) => /at least 1 "complication"/.test(e)));
});

test('SCR beats must run situation -> complication -> resolution', () => {
  const out = storylineOf(
    [
      slide({ id: '01-c', role: 'complication', layout: 'comparison', cards: [{ title: 'a' }, { title: 'b' }] }),
      slide({ id: '02-s', role: 'situation' }),
      slide({ id: '03-r', role: 'resolution' }),
      slide({ id: '04-r', role: 'resolution' }),
    ],
    { archetype: 'scr' }
  );
  const { errors } = validateStoryline(out);
  assert.ok(errors.some((e) => /must run situation -> complication -> resolution/.test(e)));
});

test('role checks only apply when the storyline declares the SCR archetype', () => {
  const { errors } = validateStoryline(storylineOf([slide()])); // no archetype, no roles
  assert.deepEqual(errors, []);
});

test('a complication with no cost named produces a warning, not an error', () => {
  const d = scrStoryline();
  d.entries[1].narration = 'The teams sometimes see things differently.';
  d.entries[1].cards = [{ title: 'Old way' }, { title: 'New way' }];
  const { errors, warnings } = validateStoryline(d);
  assert.deepEqual(errors, []);
  assert.ok(warnings.some((w) => /does not name a cost/.test(w)));
});

// ---------------------------------------------------------------------------
// redundancy heuristic (D19) — warns, never fails
// ---------------------------------------------------------------------------

test('narration that reads the slide aloud is measured as high overlap', () => {
  const s = slide({ title: 'Zero phone calls', cards: [{ title: 'Zero phone calls', text: 'No phone calls between teams' }] });
  const high = narrationOverlap('Zero phone calls, no phone calls between teams.', slideText(s));
  assert.ok(high >= 0.7, `expected high overlap, got ${high}`);
});

test('narration that adds information scores low overlap', () => {
  const s = slide({ title: 'Zero phone calls', cards: [{ title: 'Shared queue', text: 'One ranked list' }] });
  const low = narrationOverlap('Coordinators approve allocations in a single click.', slideText(s));
  assert.ok(low < 0.7, `expected low overlap, got ${low}`);
});

test('redundancy only ever warns', () => {
  const s = slide({
    title: 'Zero phone calls',
    cards: [
      { title: 'Zero phone calls', text: 'Zero phone calls' },
      { title: 'Shared queue', text: 'Shared queue' },
      { title: 'One click', text: 'One click' },
    ],
  });
  s.narration = 'Zero phone calls, a shared queue, and one click.';
  const { errors, warnings } = validateStoryline(storylineOf([s]));
  assert.deepEqual(errors, []);
  assert.ok(warnings.some((w) => /redundant/.test(w)));
});

test('overlap of an empty slide is zero rather than NaN', () => {
  assert.equal(narrationOverlap('anything', ''), 0);
});

// ---------------------------------------------------------------------------
// compilation (D1, D6)
// ---------------------------------------------------------------------------

test('compilation emits a valid storyboard', () => {
  const { manifest } = compileStoryline(scrStoryline(), { sourceText: 'x' });
  assert.deepEqual(validateManifest(manifest), []);
});

test('deck-only entries are excluded from the video but kept in the deck', () => {
  const d = scrStoryline();
  d.entries.unshift({ id: '00-answer', type: 'slide', in: ['deck'], layout: 'hero', title: 'The answer' });
  const { manifest } = compileStoryline(d, { sourceText: 'x' });
  assert.ok(!manifest.scenes.some((s) => s.id === '00-answer'));
  assert.ok(deckEntries(d).some((e) => e.id === '00-answer'));
});

test('entry ids become scene ids verbatim, so reordering the storyline does not rebuild', () => {
  const a = compileStoryline(scrStoryline(), { sourceText: 'x' }).manifest;
  const reordered = scrStoryline();
  reordered.entries = [reordered.entries[0], reordered.entries[1], reordered.entries[3], reordered.entries[2]];
  const b = compileStoryline(reordered, { sourceText: 'x' }).manifest;

  const keyOf = (m, id) => captureCacheKey(m.scenes.find((s) => s.id === id), 'v1');
  for (const id of ['01-s', '02-c', '03-r', '04-r']) {
    assert.equal(keyOf(a, id), keyOf(b, id), `${id} cache key changed on reorder`);
  }
});

test('editing slide content changes the capture cache key', () => {
  const before = compileStoryline(scrStoryline(), { sourceText: 'x' }).manifest;
  const edited = scrStoryline();
  edited.entries[2].title = 'A different claim';
  const after = compileStoryline(edited, { sourceText: 'x' }).manifest;
  const keyOf = (m) => captureCacheKey(m.scenes.find((s) => s.id === '03-r'), 'v1');
  assert.notEqual(keyOf(before), keyOf(after));
});

test('engine choice maps to the slide visual engine and can be overridden', () => {
  const html = compileStoryline(scrStoryline(), { sourceText: 'x' }).manifest;
  assert.equal(html.scenes[0].visualEngine, 'html_slides');
  const marp = compileStoryline(scrStoryline({ engine: 'marp' }), { sourceText: 'x' }).manifest;
  assert.equal(marp.scenes[0].visualEngine, 'marp_slides');
  const forced = compileStoryline(scrStoryline(), { sourceText: 'x', engineOverride: 'marp' }).manifest;
  assert.equal(forced.scenes[0].visualEngine, 'marp_slides');
});

test('slides compile to stills with native vertical strategy', () => {
  const { manifest } = compileStoryline(scrStoryline(), { sourceText: 'x' });
  for (const s of manifest.scenes.filter((x) => x.slide)) {
    assert.equal(s.captureMode, 'stills');
    assert.equal(s.vertical.strategy, 'native');
  }
});

test('captures compile into a playwright actionSpec, footage into a src', () => {
  const d = storylineOf([
    { id: 'c', type: 'capture', narration: 'n', url: '/bmu', steps: [{ action: 'click', target: 'Approve' }], assert: { visible: ['x'] }, roiSelector: '#r' },
    { id: 'f', type: 'footage', narration: 'n', src: 'footage/a.mp4', trim: { in: 1, out: 4 }, useFootageAudio: true },
  ]);
  const { manifest } = compileStoryline(d, { sourceText: 'x' });
  const cap = manifest.scenes.find((s) => s.id === 'c');
  assert.equal(cap.visualEngine, 'playwright_web');
  assert.equal(cap.actionSpec.url, '/bmu');
  assert.equal(cap.roiSelector, '#r');
  const foot = manifest.scenes.find((s) => s.id === 'f');
  assert.equal(foot.visualEngine, 'manual_footage');
  assert.deepEqual(foot.actionSpec.trim, { in: 1, out: 4 });
  assert.equal(foot.useFootageAudio, true);
});

test('chapter overlay compiles to a native chapter card, not a slide', () => {
  const d = storylineOf([{ id: 'c', type: 'capture', narration: 'n', url: '/x', assert: { visible: ['x'] }, overlay: 'chapter', title: 'Step two' }]);
  const { manifest } = compileStoryline(d, { sourceText: 'x' });
  assert.equal(manifest.scenes[0].chapter.title, 'Step two');
});

test('the lockfile records its source and a checksum', () => {
  const { manifest } = compileStoryline(scrStoryline(), { sourceText: 'storyline-source-text' });
  assert.match(manifest.$generated, /GENERATED FILE/);
  assert.equal(manifest.$source.checksum, storylineChecksum('storyline-source-text'));
  assert.notEqual(manifest.$source.checksum, storylineChecksum('other'));
});

test('background defaults follow the theme so slides and letterbox agree', () => {
  assert.equal(compileStoryline(scrStoryline({ theme: 'light' }), {}).manifest.meta.background, '#F1F5F9');
  assert.equal(compileStoryline(scrStoryline({ theme: 'dark' }), {}).manifest.meta.background, '#0F172A');
});

test('a storyline with no video entries compiles but warns', () => {
  const d = storylineOf([slide({ in: ['deck'] })]);
  const { manifest, warnings } = compileStoryline(d, { sourceText: 'x' });
  assert.equal(manifest.scenes.length, 0);
  assert.ok(warnings.some((w) => /no entry targets the video/.test(w)));
});

// ---------------------------------------------------------------------------
// rendering: HTML structure and theme tokens (still install-free)
// ---------------------------------------------------------------------------

test('both themes expose identical token names, so layouts never branch on theme', () => {
  assert.deepEqual(Object.keys(THEME_TOKENS.light).sort(), Object.keys(THEME_TOKENS.dark).sort());
});

test('a rendered slide carries its layout, theme and orientation for measurement', () => {
  const html = renderSlideHtml({ slide: { ...slide(), layout: 'tiled', theme: 'dark' }, orientation: 'vertical' });
  assert.match(html, /data-layout="tiled"/);
  assert.match(html, /data-theme="dark"/);
  assert.match(html, /data-orientation="vertical"/);
  assert.match(html, /data-measure="slide"/);
});

test('every layout renders without throwing and emits the content its slots declare', () => {
  for (const name of Object.keys(LAYOUTS)) {
    if (name === 'custom') continue;
    const [min, max] = LAYOUTS[name].slots.cards;
    const n = Math.min(Math.max(min, 2), max);
    const s = {
      layout: name,
      theme: 'light',
      title: 'Title',
      pill: LAYOUTS[name].slots.pill ? 'Pill' : null,
      cards: Array.from({ length: n }, (_, i) => ({ title: `Card ${i}`, text: 't', icon: 'shield' })),
      stat: LAYOUTS[name].slots.stat ? { value: '3', unit: 'x', label: 'l' } : null,
    };
    const html = renderSlideHtml({ slide: s, icons: { shield: '<svg></svg>' } });
    // A card-free layout must not smuggle a card in: `statement` exists because
    // a claim that carries the whole slide has no supporting cards at all.
    if (max === 0) {
      assert.ok(!html.includes('class="card '), `${name} rendered a card it has no slot for`);
      assert.ok(html.includes('Title'), `${name} dropped its title`);
      continue;
    }
    assert.match(html, /class="card /, `${name} rendered no cards`);
    assert.ok(html.includes('Card 0'), `${name} dropped card content`);
  }
});

test('custom layout is not rendered by the template layer', () => {
  assert.throws(() => renderSlideHtml({ slide: { layout: 'custom' } }), /rendered from its htmlPath/);
});

test('a missing icon renders a visible marker rather than empty space', () => {
  const html = renderSlideHtml({ slide: slide(), icons: {} });
  assert.match(html, /data-icon-missing="shield"/);
});

test('slide content is escaped', () => {
  const html = renderSlideHtml({ slide: slide({ title: '<script>x</script>' }) });
  assert.ok(!html.includes('<script>x</script>'));
  assert.match(html, /&lt;script&gt;/);
});

test('canvas sizes are the declared 1080-class targets', () => {
  assert.deepEqual(CANVAS.landscape, { width: 1920, height: 1080 });
  assert.deepEqual(CANVAS.vertical, { width: 1080, height: 1920 });
});

test('portrait CSS is emitted only for the vertical canvas', () => {
  const landscape = slideCss({ orientation: 'landscape' });
  const vertical = slideCss({ orientation: 'vertical' });
  assert.ok(!/grid-template-columns:1fr;grid-template-rows:repeat\(3,1fr\)/.test(landscape));
  assert.match(vertical, /\.spotlight\{grid-template-columns:1fr/);
  assert.match(vertical, /html,body\{width:1080px;height:1920px/);
  assert.match(landscape, /html,body\{width:1920px;height:1080px/);
});

test('comparison stacks in portrait so the flip still reads downward', () => {
  const css = slideCss({ orientation: 'vertical' });
  // One column is what makes the flip read downward.
  assert.match(css, /\.comparison\{grid-template-columns:1fr;/);
  // Two content-sized rows, not 1fr: comparison is a PEER layout (no dominant
  // slot), so a stretched row would encode a hierarchy the content does not have
  // and leave most of each card empty. Same rule as landscape.
  assert.match(css, /\.comparison\{grid-template-columns:1fr;grid-template-rows:max-content max-content\}/);
});

test('a card is stretched only where the stretch is the dominance signal', () => {
  const css = slideCss({ orientation: 'landscape' });
  // Peer layouts (dominant: null) hug their content: no card outranks another, so
  // a stretched row would encode a hierarchy the content does not have.
  for (const peer of ['tiled', 'lifecycle', 'cycle', 'comparison']) {
    const rule = css.match(new RegExp(`\\.${peer}\\{[^}]*\\}`))[0];
    assert.match(rule, /flex:0 1 auto;margin-block:auto/, `${peer} should hug its content, got: ${rule}`);
  }
  // bento-b and spotlight encode dominance in an explicit RATIO, so their tracks
  // must keep their proportions; hugging would hand the biggest slot to whichever
  // card happens to hold the most words.
  assert.match(css, /\.bento-b\{grid-template-columns:1fr 1fr;grid-template-rows:1\.5fr 1fr\}/);
  assert.match(css, /\.spotlight\{grid-template-columns:1\.6fr 1fr;grid-auto-rows:1fr\}/);
});

test('tiled becomes two columns in portrait, with three cards spanning', () => {
  const css = slideCss({ orientation: 'vertical' });
  assert.match(css, /\.tiled\{grid-auto-flow:row;grid-template-columns:1fr 1fr/);
  assert.match(css, /\.tiled\.cols-3 \.card:nth-child\(3\)\{grid-column:1 \/ span 2\}/);
});

// ---------------------------------------------------------------------------
// Phase 0 — theming seam and cross-platform entry detection
//
// These exist to make the prefactor provable rather than inspected. The
// resolver was introduced so brand tokens have one place to arrive; the tests
// below pin down that introducing it changed nothing, so any future CSS
// difference is a deliberate edit and not resolver drift.
// ---------------------------------------------------------------------------

test('the resolver with no overrides is exactly the built-in palette', () => {
  for (const theme of ['light', 'dark']) {
    assert.deepEqual(resolveThemeTokens(theme), THEME_TOKENS[theme]);
  }
});

test('resolved CSS is byte-identical whether tokens are defaulted or passed explicitly', () => {
  // A pure string comparison is the whole point: it proves the brand seam is
  // inert until a brand is supplied, across every canvas and theme.
  for (const orientation of ['landscape', 'vertical', 'square']) {
    for (const theme of ['light', 'dark']) {
      const implicit = slideCss({ orientation, theme });
      const explicit = slideCss({ orientation, theme, themeTokens: THEME_TOKENS[theme] });
      assert.equal(explicit, implicit, `${orientation}/${theme} drifted`);
    }
  }
});

test('an override replaces one variable and leaves the rest of the palette alone', () => {
  const resolved = resolveThemeTokens('light', { '--accent-1': '#C2410C' });
  assert.equal(resolved['--accent-1'], '#C2410C');
  assert.equal(resolved['--bg'], THEME_TOKENS.light['--bg']);
  assert.equal(Object.keys(resolved).length, Object.keys(THEME_TOKENS.light).length);
});

test('overriding does not reorder the emitted :root block', () => {
  // Order matters only because byte-identity is the refactor's proof; if an
  // override appended instead of replacing, the diff would be noise forever.
  const before = Object.keys(resolveThemeTokens('light'));
  const after = Object.keys(resolveThemeTokens('light', { '--bg': '#000000' }));
  assert.deepEqual(after, before);
});

test('deleted tokens stay deleted — no palette defines --accent-2 or --on-accent', () => {
  for (const theme of ['light', 'dark']) {
    assert.equal(THEME_TOKENS[theme]['--accent-2'], undefined);
    assert.equal(THEME_TOKENS[theme]['--on-accent'], undefined);
  }
  const css = slideCss({ theme: 'light' });
  assert.ok(!css.includes('--accent-2'), 'CSS still references --accent-2');
  assert.ok(!css.includes('--on-accent'), 'CSS still references --on-accent');
});

test('the missing-icon marker is unbranded so a wiring bug stays conspicuous', () => {
  const css = slideCss({ theme: 'light' });
  assert.match(css, /\.icon-missing\{color:#FF00FF/);
});

test('a pre-change slide — bare theme string, no brand — still renders', () => {
  // Storyboards generated before the brand work carry slide.theme as the
  // string "light" and no brand fields at all. They must keep rendering
  // untouched, so upgrading the skill never invalidates committed work.
  const slide = { layout: 'spotlight', theme: 'light', title: 'Legacy', cards: [{ title: 'A' }, { title: 'B' }] };
  const html = renderSlideHtml({ slide, orientation: 'landscape' });
  assert.match(html, /:root\{--bg:#F1F5F9;/);
  assert.ok(!html.includes('undefined'), 'legacy slide leaked an undefined into the output');
});

test('isMainModule matches the entry script on any path shape', () => {
  const original = process.argv[1];
  try {
    // A path containing a space is the POSIX-reproducible case of the bug the
    // old `file://${process.argv[1]}` template had: import.meta.url
    // percent-encodes, a raw template does not, so the guard never fired and
    // the script exited 0 having produced nothing.
    for (const entry of ['/tmp/plain.mjs', '/tmp/My Projects/deck.mjs', '/tmp/a#b/deck.mjs']) {
      process.argv[1] = entry;
      const href = pathToFileURL(entry).href;
      assert.equal(isMainModule(href), true, `did not match ${entry}`);
      assert.equal(isMainModule(`file://${entry}`), entry === '/tmp/plain.mjs', `raw template behaviour changed for ${entry}`);
    }
  } finally {
    process.argv[1] = original;
  }
});

test('isMainModule says no when the module is merely imported', () => {
  const original = process.argv[1];
  try {
    process.argv[1] = '/tmp/some-other-entry.mjs';
    assert.equal(isMainModule(pathToFileURL('/tmp/deck.mjs').href), false);
  } finally {
    process.argv[1] = original;
  }
});

// ---------------------------------------------------------------------------
// Phase 2 — the brand font escape hatch (D5)
// ---------------------------------------------------------------------------

test('presentation.fontFile is validated like the other declared brand paths', () => {
  const base = { title: 'T', entries: [{ id: 'a', type: 'slide', layout: 'hero', title: 'X', narration: 'n' }] };
  const errorsFor = (fontFile) =>
    validateStoryline({ presentation: { mode: 'video', title: 'T', fontFile }, entries: base.entries }).errors.join('\n');

  assert.match(errorsFor('/abs/brand.woff2'), /presentation\.fontFile: must be relative/);
  assert.match(errorsFor('fonts\\brand.woff2'), /presentation\.fontFile: use forward slashes/);
  assert.match(errorsFor(''), /presentation\.fontFile: must be a non-empty path/);
  // woff2 only: the file is base64-embedded with a woff2 mime type and a
  // format('woff2') hint, so any other container renders nothing at all.
  assert.match(errorsFor('fonts/brand.ttf'), /presentation\.fontFile: must be a \.woff2 file/);
  assert.equal(errorsFor('../fonts/brand.woff2'), '');
});

test('the compiled deck block carries fontFile only when it was declared', () => {
  const entries = [{ id: 'a', type: 'slide', layout: 'hero', title: 'X', narration: 'n' }];
  const withFont = compileStoryline({ presentation: { mode: 'video', title: 'T', fontFile: 'fonts/brand.woff2' }, entries }, { sourceText: 'x' });
  assert.equal(withFont.manifest.meta.deck.fontFile, 'fonts/brand.woff2');
  // Omitted entirely when absent, so a storyboard compiled before the font
  // escape hatch existed stays byte-comparable and its cache keys do not move.
  const without = compileStoryline({ presentation: { mode: 'video', title: 'T' }, entries }, { sourceText: 'x' });
  assert.ok(!('fontFile' in without.manifest.meta.deck));
});

// WHY: this is the one machine-dependent render path. Naming the bundled family
// behind the brand family means a machine that lacks the brand font lands on
// known metrics instead of an arbitrary system default, which is what keeps the
// pixel-measured overflow gate from flipping between machines.
test('an unembeddable brand family keeps the bundled family behind it in the stack', () => {
  const css = slideCss({ fontFamily: 'Brand Grotesk', brand: { fontFallback: 'Inter' } });
  assert.match(css, /font-family:'Brand Grotesk','Inter',system-ui,sans-serif;/);
  assert.match(css, /font-size-adjust:from-font/);
});

test('with no fallback the stack is byte-identical to the pre-brand one', () => {
  assert.match(slideCss({}), /font-family:'Inter',system-ui,sans-serif;/);
  assert.ok(!slideCss({}).includes('font-size-adjust'));
  // A fallback equal to the family would emit the same name twice.
  assert.match(slideCss({ fontFamily: 'Inter', brand: { fontFallback: 'Inter' } }), /font-family:'Inter',system-ui/);
});

// ---------------------------------------------------------------------------
// Phase 2 — layout advice
//
// The advisor is a heuristic, so these tests pin two things only: that its
// STRUCTURAL rules can never recommend a slide the validator would then reject,
// and that its SHAPE rules put the heaviest card in the biggest slot. Taste is
// not tested, because taste is the author's and `layout:` in storyline.yml wins.
// ---------------------------------------------------------------------------

const cardsOf = (n, extra = () => ({})) =>
  Array.from({ length: n }, (_, i) => ({ title: `Card ${i}`, text: 'some supporting copy here', ...extra(i) }));

// WHY: this is the property that matters. A recommendation the card-count
// validator rejects would send an author in a circle, so every structural
// recommendation is checked against the very `slots` table that validates it.
test('every recommendation satisfies the slots table it will be validated against', () => {
  const entries = [
    { title: 'T' },
    { title: 'T', pill: 'Section' },
    { title: 'T', cards: cardsOf(1) },
    { title: 'T', cards: cardsOf(2) },
    { title: 'T', cards: cardsOf(3) },
    { title: 'T', cards: cardsOf(4) },
    { title: 'T', cards: cardsOf(5) },
    { title: 'T', cards: cardsOf(3, () => ({ detail: 'Phase' })) },
    { title: 'T', cards: cardsOf(3, () => ({ title: 'Short', text: '' })) },
    { title: 'T', stat: { value: '3', unit: 'x', label: 'faster' }, cards: cardsOf(2) },
  ];
  for (const entry of entries) {
    const { layout } = recommendLayout(entry);
    const [min, max] = LAYOUTS[layout].slots.cards;
    const n = (entry.cards ?? []).length;
    assert.ok(n >= min && n <= max, `${layout} cannot hold ${n} cards`);
    if (entry.stat) assert.ok(LAYOUTS[layout].slots.stat, `${layout} has nowhere to put a stat`);
    if (entry.pill) assert.ok(LAYOUTS[layout].slots.pill, `${layout} has nowhere to put a pill`);
  }
});

test('structural facts decide on their own: a stat, a pair, or five cards have one home each', () => {
  assert.equal(recommendLayout({ stat: { value: '9' }, cards: cardsOf(4) }).layout, 'stat-deepdive');
  assert.equal(recommendLayout({ cards: cardsOf(2) }).layout, 'comparison');
  assert.equal(recommendLayout({ cards: cardsOf(5) }).layout, 'process-flow');
  assert.equal(recommendLayout({ cards: cardsOf(1) }).layout, 'hero');
});

test('a card-free entry is a statement, unless a section label makes it an opener', () => {
  assert.equal(recommendLayout({ title: 'One claim' }).layout, 'statement');
  assert.equal(recommendLayout({ title: 'Part two', pill: 'Section' }).layout, 'hero');
});

// WHY: over the ceiling there is no layout to recommend, and silently picking
// the largest one would hide the real problem — the slide is two slides.
test('more cards than any layout holds recommends splitting rather than a layout', () => {
  const advice = recommendLayout({ cards: cardsOf(7) });
  assert.equal(advice.layout, null);
  assert.match(advice.reason, /split the slide/);
});

test('detail labels on every card read as phases, and plain short labels tile', () => {
  assert.equal(recommendLayout({ cards: cardsOf(4, () => ({ detail: 'Phase' })) }).layout, 'lifecycle');
  assert.equal(recommendLayout({ cards: cardsOf(3, () => ({ title: 'Ship', text: '' })) }).layout, 'tiled');
  // A sentence is prose, not a label, so it must not be tiled into equal boxes.
  assert.notEqual(
    recommendLayout({ cards: cardsOf(3, () => ({ title: 'We ship it, then we measure it.', text: '' })) }).layout,
    'tiled'
  );
});

// WHY: text overflow is a hard, pixel-measured build failure. The arrangement
// that gives the heaviest card the most room is the one least likely to fail the
// gate, which is why this is a rule and not a preference.
test('the heaviest card earns the dominant slot', () => {
  const heavyFirst = [{ title: 'A', text: 'x'.repeat(200) }, { title: 'B', text: 'short' }, { title: 'C', text: 'short' }];
  // Three and four cards both reach spotlight: it declares cards [3, 4] and its
  // lead spans every row, so the advisor does not fork on the count.
  assert.equal(recommendLayout({ cards: heavyFirst }).layout, 'spotlight');
  assert.equal(recommendLayout({ cards: [...heavyFirst, { title: 'D', text: 'short' }] }).layout, 'spotlight');
  // Even weight invents no hierarchy.
  assert.equal(recommendLayout({ cards: cardsOf(4) }).layout, 'tiled');
});

test('a heavy card that is not first is reported, because the dominant slot is positional', () => {
  const advice = recommendLayout({
    cards: [{ title: 'A', text: 'short' }, { title: 'B', text: 'x'.repeat(200) }, { title: 'C', text: 'short' }],
  });
  assert.match(advice.notes.join('\n'), /card 2 carries the most text but is not first/);
});

// WHY: an explicit layout is a decision. Advising against it on every build is
// the kind of noise that teaches people to ignore the report entirely.
test('an omitted layout warns with the recommendation; a declared one is left alone', () => {
  const entry = { id: 'a', type: 'slide', title: 'T', narration: 'n', cards: cardsOf(3, () => ({ title: 'Ship', text: '' })) };
  const omitted = validateStoryline({ presentation: { mode: 'video', title: 'T' }, entries: [entry] });
  assert.equal(omitted.errors.length, 0);
  assert.match(omitted.warnings.join('\n'), /no layout declared, so it falls back to "spotlight"/);
  assert.match(omitted.warnings.join('\n'), /suits "tiled"/);

  const declared = validateStoryline({ presentation: { mode: 'video', title: 'T' }, entries: [{ ...entry, layout: 'spotlight' }] });
  assert.ok(!declared.warnings.some((w) => /no layout declared/.test(w)));
});

test('the two new layouts render their own arrangement, not a restyled bento', () => {
  const statement = renderSlideHtml({ slide: { layout: 'statement', title: 'One claim', body: 'Why it matters' } });
  assert.match(statement, /class="statement"/);
  assert.match(statement, /class="title statement-title"/);

  const spotlight = renderSlideHtml({
    slide: { layout: 'spotlight', title: 'T', cards: cardsOf(4) },
  });
  assert.match(spotlight, /class="card lead"/);
  const css = slideCss({});
  assert.match(css, /\.spotlight\{grid-template-columns:1\.6fr 1fr/);
  // The lead spans the SUPPORT count. \`1 / -1\` spans the explicit grid, which
  // has no rows, so it used to leave the lead one row tall: a peer, not a lead.
  assert.match(css, /\.spotlight \.lead\{grid-row:span 2\}/);
  assert.match(css, /\.spotlight:has\(>:nth-child\(4\)\) \.lead\{grid-row:span 3\}/);
});

// WHY: a layout without a portrait rule is an incomplete layout — vertical
// output re-renders at 1080x1920, so eight layouts really means eight times two.
test('every layout still declares a portrait rule, including the new ones', () => {
  for (const [name, spec] of Object.entries(LAYOUTS)) {
    assert.ok(spec.portrait && spec.portrait.length > 10, `${name} has no portrait rule`);
  }
  const portrait = slideCss({ orientation: 'vertical' });
  assert.match(portrait, /\.spotlight\{grid-template-columns:1fr;grid-template-rows:1\.4fr\}/);
});

// ---------------------------------------------------------------------------
// Phase 3 — the weight field (M1)
//
// text length is a proxy for OVERFLOW RISK, not importance: a headline number is
// the shortest card and usually the most important. These pin that a declared
// weight overrides text length, that the invariants fire, and that an undeclared
// storyline behaves exactly as before.
// ---------------------------------------------------------------------------

const weightSlide = (over = {}) => ({
  id: 'w-slide',
  type: 'slide',
  title: 'Conversion recovered after the checkout rebuild.',
  narration: 'Something spoken that does not repeat the cards at all today.',
  ...over,
});

test('CARD_WEIGHTS is the three ordinal levels and nothing else', () => {
  assert.deepEqual([...CARD_WEIGHTS].sort(), ['primary', 'secondary', 'tertiary']);
});

test('every layout declares a dominant card slot or null, derived from its body', () => {
  // Read from the actual BODIES arrangement, not assumed: spotlight/
  // bento-b/process-flow give card 0 the dominant class; the rest express none.
  const expected = {
    hero: null,
    statement: null,
    'bento-b': 0,
    tiled: null,
    spotlight: 0,
    'process-flow': 0,
    lifecycle: null,
    comparison: null,
    'stat-deepdive': null,
    cycle: null,
    // The diagram is the primary element, like a stat — not a card.
    diagram: null,
    custom: null,
  };
  for (const [name, spec] of Object.entries(LAYOUTS)) {
    assert.ok('dominant' in spec, `${name} has no dominant property`);
    assert.equal(spec.dominant, expected[name], `${name} dominant is wrong`);
  }
});

test('an unknown weight value is an invariant, like an unknown layout or icon', () => {
  const { errors } = validateStoryline(
    storylineOf([weightSlide({ layout: 'tiled', cards: [{ title: 'A', weight: 'huge' }, { title: 'B' }, { title: 'C' }] })])
  );
  assert.ok(errors.some((e) => /unknown weight "huge"/.test(e)), errors.join('\n'));
});

test('two cards declaring primary is an error, because salience is relative', () => {
  const { errors } = validateStoryline(
    storylineOf([
      weightSlide({ layout: 'spotlight', cards: [{ title: 'A', weight: 'primary' }, { title: 'B', weight: 'primary' }, { title: 'C' }] }),
    ])
  );
  const hit = errors.find((e) => /weight: primary/.test(e));
  assert.ok(hit, errors.join('\n'));
  assert.match(hit, /salience is relative/);
});

test('the stat is implicitly primary, so a primary card on a stat slide is an error', () => {
  const { errors } = validateStoryline(
    storylineOf([
      weightSlide({ layout: 'stat-deepdive', stat: { value: '3', label: 'x' }, cards: [{ title: 'A', weight: 'primary' }, { title: 'B' }] }),
    ])
  );
  const hit = errors.find((e) => /stat is already the primary/.test(e));
  assert.ok(hit, errors.join('\n'));
});

test('one primary card is fine — the invariant is only about MORE than one', () => {
  const { errors } = validateStoryline(
    storylineOf([weightSlide({ layout: 'spotlight', cards: [{ title: 'A', weight: 'primary' }, { title: 'B' }, { title: 'C' }] })])
  );
  assert.ok(!errors.some((e) => /weight/.test(e)), errors.join('\n'));
});

// WHY: the whole point of the field. The primary card is the SHORTEST here, so
// the old text-length proxy would have put the long card in the dominant slot.
test('a declared primary takes the dominant slot even when it is the shortest card', () => {
  const cards = [
    { title: 'Caveat', text: 'x'.repeat(300), weight: 'secondary' },
    { title: '$4.2M', text: 'up', weight: 'primary' },
    { title: 'Also', text: 'y'.repeat(200), weight: 'secondary' },
  ];
  const advice = recommendLayout({ cards });
  // card 2 ($4.2M) is primary but not in spotlight's dominant slot (card 1).
  assert.match(advice.notes.join('\n'), /card 2 declares weight: primary but is not in "spotlight"'s dominant slot/);
  assert.match(advice.notes.join('\n'), /move it first/);
});

test('a declared primary already first emits no reorder note', () => {
  const advice = recommendLayout({
    cards: [{ title: '$4.2M', weight: 'primary' }, { title: 'B', weight: 'secondary' }, { title: 'C', weight: 'secondary' }],
  });
  assert.ok(!advice.notes.some((n) => /dominant slot/.test(n)), advice.notes.join('\n'));
});

// WHY: with no weight declared anywhere, the advisor must fall back to the
// text-length path so every pre-weight storyline behaves exactly as before.
test('with no weight declared the text-length fallback still ranks the heaviest card', () => {
  const heavyFirst = [{ title: 'A', text: 'x'.repeat(200) }, { title: 'B', text: 'short' }, { title: 'C', text: 'short' }];
  assert.equal(recommendLayout({ cards: heavyFirst }).layout, 'spotlight');
  const advice = recommendLayout({
    cards: [{ title: 'A', text: 'short' }, { title: 'B', text: 'x'.repeat(200) }, { title: 'C', text: 'short' }],
  });
  // The text-length note wording, distinct from the declared-primary wording.
  assert.match(advice.notes.join('\n'), /card 2 carries the most text but is not first/);
});

// ---------------------------------------------------------------------------
// Phase 3 — tiled means equal weight (M1 / A3)
// ---------------------------------------------------------------------------

test('unequal declared weights route away from tiled, to spotlight', () => {
  const four = recommendLayout({
    cards: [
      { title: 'A', weight: 'primary' },
      { title: 'B', weight: 'secondary' },
      { title: 'C', weight: 'secondary' },
      { title: 'D', weight: 'secondary' },
    ],
  });
  assert.equal(four.layout, 'spotlight');
  const three = recommendLayout({
    cards: [{ title: 'A', weight: 'primary' }, { title: 'B', weight: 'secondary' }, { title: 'C', weight: 'tertiary' }],
  });
  assert.equal(three.layout, 'spotlight');
});

test('equal declared weights still tile, because they really are peers', () => {
  const advice = recommendLayout({
    cards: [
      { title: 'Ship', weight: 'secondary' },
      { title: 'Measure', weight: 'secondary' },
      { title: 'Learn', weight: 'secondary' },
    ],
  });
  assert.equal(advice.layout, 'tiled');
});

test('an explicit tiled with unequal declared weights warns that the layout lies', () => {
  const { warnings } = validateStoryline(
    storylineOf([
      weightSlide({
        layout: 'tiled',
        cards: [{ title: 'A', weight: 'primary' }, { title: 'B', weight: 'secondary' }, { title: 'C', weight: 'secondary' }],
      }),
    ])
  );
  assert.ok(warnings.some((w) => /claims its cards are peers, but they declare unequal weight/.test(w)), warnings.join('\n'));
});

test('an explicit tiled with equal declared weights does not warn', () => {
  const { warnings } = validateStoryline(
    storylineOf([
      weightSlide({
        layout: 'tiled',
        cards: [{ title: 'A', weight: 'secondary' }, { title: 'B', weight: 'secondary' }, { title: 'C', weight: 'secondary' }],
      }),
    ])
  );
  assert.ok(!warnings.some((w) => /unequal weight/.test(w)), warnings.join('\n'));
});

// ---------------------------------------------------------------------------
// Phase 3 — assertion-title heuristic (M3 / A5), warns, never fails
// ---------------------------------------------------------------------------

test('a topic-shaped title warns, because a topic makes the body an exhibit with no claim', () => {
  const { errors, warnings } = validateStoryline(
    storylineOf([weightSlide({ layout: 'tiled', title: 'Checkout Flow', cards: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] })])
  );
  assert.deepEqual(errors, []);
  assert.ok(warnings.some((w) => /topic-shaped, not an assertion/.test(w)), warnings.join('\n'));
});

test('the topic-shape threshold is at most three words with no sentence punctuation', () => {
  const topicOf = (title) =>
    validateStoryline(storylineOf([weightSlide({ layout: 'tiled', title, cards: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] })]))
      .warnings.some((w) => /topic-shaped/.test(w));
  assert.equal(topicOf('One Two Three'), true); // 3 words, no punctuation
  assert.equal(topicOf('One Two Three Four'), false); // 4 words is a phrase, not a bare topic
  assert.equal(topicOf('One two three.'), false); // sentence punctuation makes it an assertion
});

test('the over-long title warning fires past twelve words or seventy characters', () => {
  const longWords = 'a b c d e f g h i j k l m'; // 13 words, short chars
  const longChars = 'This assertion is deliberately padded out well beyond seventy characters total length here'; // >70 chars
  const warnOf = (title) =>
    validateStoryline(storylineOf([weightSlide({ layout: 'tiled', title, cards: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] })]))
      .warnings.some((w) => /stops reading as a headline/.test(w));
  assert.equal(warnOf(longWords), true);
  assert.equal(warnOf(longChars), true);
  assert.equal(warnOf('A concise correct assertion.'), false);
});

test('a section opener and a statement suppress the topic-shape warning', () => {
  const heroOpener = validateStoryline(storylineOf([weightSlide({ layout: 'hero', pill: 'Section', title: 'Part Two', cards: [] })]));
  assert.ok(!heroOpener.warnings.some((w) => /topic-shaped/.test(w)), heroOpener.warnings.join('\n'));
  const statement = validateStoryline(storylineOf([weightSlide({ layout: 'statement', title: 'The Thesis' })]));
  assert.ok(!statement.warnings.some((w) => /topic-shaped/.test(w)), statement.warnings.join('\n'));
});

test('the over-long warning is suppressed nowhere, not even on a statement', () => {
  const longTitle = 'This statement runs far too long to read as a single crisp headline assertion here now';
  const statement = validateStoryline(storylineOf([weightSlide({ layout: 'statement', title: longTitle })]));
  assert.ok(statement.warnings.some((w) => /stops reading as a headline/.test(w)), statement.warnings.join('\n'));
});

// ---------------------------------------------------------------------------
// Phase 3 — the cycle layout (S1 / O1), reachable only via cycle: true
// ---------------------------------------------------------------------------

test('cycle is an eleventh content layout with a dominant of null and a portrait rule', () => {
  assert.ok(LAYOUTS.cycle, 'cycle layout is missing');
  assert.deepEqual(LAYOUTS.cycle.slots.cards, [3, 5]);
  assert.equal(LAYOUTS.cycle.dominant, null);
  assert.match(LAYOUTS.cycle.portrait, /return connector/);
});

test('cycle is recommended only when cycle: true is declared, never from card shape', () => {
  const stages = { cards: cardsOf(4, () => ({ detail: 'Stage' })) };
  // allDetailed alone reads as lifecycle — cycle must not steal that traffic.
  assert.equal(recommendLayout(stages).layout, 'lifecycle');
  // The explicit marker, placed after the lifecycle rule, reaches cycle.
  assert.equal(recommendLayout({ ...stages, cycle: true }).layout, 'cycle');
});

test('cycle: true on a terminus layout warns that the arrangement denies the loop', () => {
  const { warnings } = validateStoryline(
    storylineOf([weightSlide({ layout: 'lifecycle', cycle: true, cards: [{ title: 'A' }, { title: 'B' }, { title: 'C' }] })])
  );
  assert.ok(warnings.some((w) => /draws a terminus/.test(w)), warnings.join('\n'));
});

test('cycles five places are wired: LAYOUTS, body, slideCss, marp grid, advisor', () => {
  // 1. LAYOUTS entry with slots + dominant + portrait (asserted above).
  // 2. BODIES: the return connector element is emitted.
  const html = renderSlideHtml({ slide: { layout: 'cycle', title: 'Loop', cards: cardsOf(3) } });
  assert.match(html, /data-cycle-return="last-to-first"/);
  assert.match(html, /class="cycle"/);
  // 3. slideCss: a cycle rule and its portrait block both exist.
  const landscape = slideCss({ orientation: 'landscape' });
  assert.match(landscape, /\.cycle\{position:relative/);
  assert.match(landscape, /\.cycle-return\{/);
  const portrait = slideCss({ orientation: 'vertical' });
  assert.match(portrait, /\.cycle\{grid-auto-flow:row/);
  // 5. advisor reaches cycle on the explicit marker (asserted above).
});

// ---------------------------------------------------------------------------
// Phase 3 — legibility floors: derived from a stated viewing distance,
// pure, offline-testable, warn-only
// ---------------------------------------------------------------------------

test('a floor is derived from the viewing profile, not imported as a constant', () => {
  // The whole point: a pixel has no angular size until a distance is stated, so
  // the same role has different floors at different distances. Monotonic in
  // distance, because further away needs bigger type.
  const phone = typeFloor('card-text', { profile: 'phone' });
  const screen = typeFloor('card-text', { profile: 'screen' });
  const room = typeFloor('card-text', { profile: 'room' });
  const hall = typeFloor('card-text', { profile: 'hall' });
  assert.ok(phone < screen && screen < room && room < hall, `expected monotonic floors, got ${[phone, screen, room, hall]}`);
});

test('the screen profile lands on the shipped body size, which is what calibrates it', () => {
  // This is the check that resolves the old contradiction: the floors and the
  // shipped scale agree to the pixel once the distance is stated. If this test
  // fails, either the scale moved or the derivation did, and one of them is wrong.
  assert.equal(typeFloor('card-text', { profile: 'screen' }), 24);
});

test('an uppercase role gets a lower floor, because cap-height not x-height binds it', () => {
  // A 19px uppercase label is a larger angular target than 19px of sentence
  // text. Treating them alike would flag a role that is in fact legible.
  const upper = typeFloor('card-detail', { profile: 'screen' });
  const mixed = typeFloor('card-text', { profile: 'screen' });
  assert.ok(upper < mixed, `expected uppercase floor ${upper} below mixed-case ${mixed}`);
});

test('an unknown viewing profile throws rather than silently picking one', () => {
  assert.throws(() => typeFloor('card-text', { profile: 'cinema' }), /unknown viewing profile/);
});

test('the profiles are distance-to-screen-height ratios, ordered near to far', () => {
  // Ratios rather than absolute distances, because that is the only form that
  // holds for both a phone and a projection wall.
  const ratios = ['phone', 'screen', 'room', 'hall'].map((p) => VIEWING_PROFILES[p]);
  assert.deepEqual(ratios, [...ratios].sort((a, b) => a - b));
});

test('the shipped scale clears every floor at its default landscape profile', () => {
  // A check that fires on the default deck is noise, and noise teaches people to
  // ignore checks. This asserts the check is trustworthy on a clean deck.
  assert.deepEqual(legibilityFloorReport(), []);
});

test('the portrait canvas defaults to the phone profile, because 9:16 is a phone format', () => {
  const report = legibilityFloorReport({ orientation: 'vertical' });
  for (const f of report) assert.equal(f.profile, 'phone');
});

test('projecting a monitor-calibrated deck into a room is reported, not hidden', () => {
  // True and actionable: type sized for a laptop is unreadable from the back of
  // a large room. The profile is what makes that statement possible.
  const roles = legibilityFloorReport({ profile: 'room' }).map((f) => f.role);
  assert.ok(roles.includes('card-text'), 'card-text at 24 is below the room floor');
  assert.ok(roles.includes('body'), 'body at 28 is below the room floor');
});

test('heading roles are not measured against the reading floor', () => {
  // A title is never near the reading floor; what governs it is the hierarchy
  // step between roles. Reporting a hierarchy problem as a legibility one would
  // point the author at the wrong fix.
  const roles = legibilityFloorReport({ profile: 'hall' }).map((f) => f.role);
  for (const heading of ['title', 'hero-title', 'card-title', 'stat-value']) {
    assert.ok(!roles.includes(heading), `${heading} is a heading and is not a reading-floor role`);
  }
});

test('the floor report is pure — same inputs, same output, no side channel', () => {
  const a = legibilityFloorReport({ profile: 'room', orientation: 'landscape', headingMultiplier: 1 });
  const b = legibilityFloorReport({ profile: 'room', orientation: 'landscape', headingMultiplier: 1 });
  assert.deepEqual(a, b);
});

test('the portrait scale factor lifts sizes, matching slideCss', () => {
  const landscape = legibilityFloorReport({ profile: 'room' }).find((f) => f.role === 'card-text');
  const vertical = legibilityFloorReport({ profile: 'room', orientation: 'vertical' }).find((f) => f.role === 'card-text');
  assert.equal(landscape.effective, 24);
  assert.equal(vertical.effective, Math.round(24 * 1.15));
});

test('the heading multiplier never scales body roles', () => {
  // A brand body size is authored for a scrolling page, not a 1920x1080 canvas,
  // so the multiplier applies to headings only — and headings are not measured
  // here, which means the multiplier cannot change this report at all.
  const plain = legibilityFloorReport({ profile: 'room' });
  const branded = legibilityFloorReport({ profile: 'room', headingMultiplier: 0.85 });
  assert.deepEqual(plain, branded);
});

test('a role lifted above its floor drops out of the findings', () => {
  // Proves the check is a real comparison and not a constant list.
  const report = legibilityFloorReport({ profile: 'room', typeScale: { body: 48, 'card-text': 48 } });
  assert.ok(!report.some((f) => f.role === 'body'), 'body at 48 clears the room floor');
  assert.ok(!report.some((f) => f.role === 'card-text'), 'card-text at 48 clears the room floor');
});
