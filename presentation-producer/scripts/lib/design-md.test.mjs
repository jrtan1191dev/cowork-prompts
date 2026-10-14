/**
 * design.md brand layer tests — tier 1: no install required, system Node alone.
 *
 * This file covers the pure mapping in design-md.mjs: turning an authored
 * DESIGN.md into the CSS custom properties the deck renders with. It is the one
 * layer where a third-party brand file meets the deck's fixed design system, so
 * the behaviours worth pinning are the tolerant-parse rules the spec mandates,
 * the exact accounting of what was branded versus substituted versus omitted,
 * and the type-scale regression that once collapsed two heading levels onto one
 * size. Rendering and disk access live elsewhere; this module is dependency-
 * free by design, so the mapping and parsed-frontmatter objects below are built
 * as plain JS object literals rather than parsed from YAML.
 *
 *   node --test scripts/lib/design-md.test.mjs
 */

import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  DESIGN_SECTIONS,
  brandFingerprint,
  brandReport,
  deref,
  dimensionToPx,
  isPlausibleColour,
  parseBrand,
  resolveBrand,
  resolveFontFamily,
  resolvePassthrough,
  resolveTokens,
  resolveTypeScale,
  sectionHeadings,
  splitFrontmatter,
} from './design-md.mjs';

// ---------------------------------------------------------------------------
// A mapping literal mirroring references/design-token.md's normative shape.
//
// Built by hand rather than parsed so the suite never imports the `yaml`
// package. Key order matters: --card must precede --card-alt so the `inherits`
// rule can observe --card's resolved origin, exactly as the real file orders
// them.
// ---------------------------------------------------------------------------

const MAPPING = {
  variables: {
    '--bg': {
      role: 'page background',
      sources: ['colors.background', 'colors.neutral', 'colors.base'],
      builtin: { light: '#F1F5F9', dark: '#0F172A' },
    },
    '--card': {
      role: 'raised card surface',
      sources: ['colors.surface', 'colors.card', 'colors.elevated'],
      builtin: { light: '#FFFFFF', dark: '#1E293B' },
    },
    '--card-alt': {
      role: 'secondary card surface',
      sources: ['colors.surface-variant', 'colors.surface-alt', 'colors.card-alt', 'colors.muted'],
      inherits: '--card',
      builtin: { light: '#F8FAFC', dark: '#243044' },
    },
    '--primary': {
      role: 'primary text ink',
      sources: ['colors.on-surface', 'colors.on-background', 'colors.foreground', 'colors.ink', 'colors.primary'],
      builtin: { light: '#0F172A', dark: '#F1F5F9' },
    },
    '--accent-1': {
      role: 'brand accent',
      sources: ['colors.tertiary', 'colors.accent', 'colors.brand', 'colors.action'],
      builtin: { light: '#10B981', dark: '#34D399' },
    },
    '--shadow': {
      role: 'card elevation',
      sources: [],
      omitted: true,
      builtin: {
        light: '0 1px 2px rgba(15,23,42,.04)',
        dark: '0 1px 2px rgba(0,0,0,.25)',
      },
    },
  },
  typography: {
    fontFamily: {
      sources: ['typography.body.fontFamily', 'typography.base.fontFamily'],
      builtin: 'Inter',
    },
    base: 'typography.body.fontSize',
    headingDominance: {
      source: 'typography.h1.fontSize',
      canvasHeading: 64,
      canvasBody: 28,
    },
    scaled: { title: 64, 'hero-title': 96, 'card-title': 34, 'stat-value': 140 },
    fixed: { body: 28, 'card-text': 24, 'card-detail': 19, 'stat-label': 28, pill: 20 },
    clamp: { min: 0.85, max: 1.15 },
    passthrough: {
      title: ['fontWeight', 'letterSpacing', 'lineHeight'],
      body: ['fontWeight', 'letterSpacing', 'lineHeight'],
      'card-title': ['fontWeight', 'letterSpacing', 'lineHeight'],
    },
  },
};

// ---------------------------------------------------------------------------
// splitFrontmatter
// ---------------------------------------------------------------------------

test('a file with no --- block carries null frontmatter, because pure prose is valid', () => {
  const { frontmatter, body } = splitFrontmatter('# Just a heading\n\nsome prose');
  assert.equal(frontmatter, null);
  assert.equal(body, '# Just a heading\n\nsome prose');
});

test('a --- block is extracted as raw text so the module stays free of a YAML parser', () => {
  const { frontmatter, body } = splitFrontmatter('---\nname: Acme\n---\n# Body\n');
  assert.equal(frontmatter, 'name: Acme\n');
  assert.equal(body, '# Body\n');
});

// WHY: a Windows-authored brand file (BOM + CRLF) must behave identically to a
// macOS one, or the same brand parses on one machine and not the other.
test('a leading BOM and CRLF endings parse identically to plain LF', () => {
  const unix = splitFrontmatter('---\nname: Acme\n---\n# Body\n');
  const windows = splitFrontmatter('\uFEFF---\r\nname: Acme\r\n---\r\n# Body\r\n');
  assert.deepEqual(windows, unix);
});

// ---------------------------------------------------------------------------
// sectionHeadings
// ---------------------------------------------------------------------------

test('headings normalise case and internal whitespace so duplicate detection is reliable', () => {
  assert.deepEqual(sectionHeadings('##   COLORS  \n##\tTypography'), ['colors', 'typography']);
});

// WHY: the spec names the section 'Overview' but accepts 'Brand & Style' as an
// alias, so both must collapse to the same canonical key.
test("the alias 'Brand & Style' maps to 'overview'", () => {
  assert.deepEqual(sectionHeadings('## Brand & Style'), ['overview']);
  assert.ok(DESIGN_SECTIONS.includes('overview'));
});

// ---------------------------------------------------------------------------
// parseBrand
// ---------------------------------------------------------------------------

// WHY: the spec mandates rejecting a file with two identical section headings,
// because "which one wins" would otherwise be an evaluation-order coin toss.
test('a duplicate ## Colors section is fatal, so ok is false', () => {
  const { ok, errors } = parseBrand({ frontmatter: {}, body: '## Colors\n\n## Colors\n' });
  assert.equal(ok, false);
  assert.ok(errors.some((e) => /duplicate section/.test(e)));
});

// WHY: the spec explicitly allows extra sections, so an unknown one is preserved
// with a warning rather than rejecting an otherwise-valid third-party file.
test('an unknown section warns but is not fatal', () => {
  const { ok, warnings } = parseBrand({ frontmatter: {}, body: '## Vibes\n' });
  assert.equal(ok, true);
  assert.ok(warnings.some((w) => /unknown section "vibes"/.test(w)));
});

test('an unknown colour name is accepted when its value is a plausible colour', () => {
  const { brand } = parseBrand({ frontmatter: { colors: { 'brand-fizz': '#123456' } }, body: '' });
  assert.equal(brand.colors['brand-fizz'], '#123456');
});

// WHY: a value carrying CSS punctuation could break out of the declaration it is
// interpolated into, so it is dropped with a warning rather than trusted.
test("a colour value containing ';' or '{' is dropped with a warning", () => {
  const semi = parseBrand({ frontmatter: { colors: { bad: 'red; color: blue' } }, body: '' });
  assert.equal(semi.brand.colors.bad, undefined);
  assert.ok(semi.warnings.some((w) => /"bad" dropped/.test(w)));

  const brace = parseBrand({ frontmatter: { colors: { bad: 'var(--x){}' } }, body: '' });
  assert.equal(brace.brand.colors.bad, undefined);
  assert.ok(brace.warnings.some((w) => /"bad" dropped/.test(w)));
});

// WHY: components are parsed and preserved as a recorded decision, but the deck
// has no buttons to consume them; resolveTokens must never read them.
test('components are preserved but never consumed by token resolution', () => {
  const { brand } = parseBrand({
    frontmatter: { components: { 'button-primary': { backgroundColor: '#ff0000' } } },
    body: '',
  });
  assert.deepEqual(brand.components['button-primary'], { backgroundColor: '#ff0000' });
  const { tokens } = resolveTokens({ brand, mapping: MAPPING, theme: 'light' });
  assert.equal(tokens['--accent-1'], MAPPING.variables['--accent-1'].builtin.light);
});

test("an omitted list is captured and lower-cased", () => {
  const { brand } = parseBrand({ frontmatter: { omitted: ['Spacing'] }, body: '' });
  assert.deepEqual(brand.omitted, ['spacing']);
});

// ---------------------------------------------------------------------------
// deref
// ---------------------------------------------------------------------------

test('deref resolves a single {colors.primary} reference', () => {
  const root = { colors: { primary: '#0F172A' } };
  assert.equal(deref('{colors.primary}', root), '#0F172A');
});

test('deref follows a chain of references to the final value', () => {
  const root = { colors: { accent: '{colors.brand}', brand: '#10B981' } };
  assert.equal(deref('{colors.accent}', root), '#10B981');
});

// WHY: a malformed file may point a token at itself; the depth cap must stop the
// recursion rather than let the build hang.
test('deref does not hang on a self-reference', () => {
  const root = { colors: { loop: '{colors.loop}' } };
  assert.doesNotThrow(() => deref('{colors.loop}', root));
});

// ---------------------------------------------------------------------------
// dimensionToPx
// ---------------------------------------------------------------------------

test('dimensionToPx handles px, rem and em against the root size', () => {
  assert.equal(dimensionToPx('18px'), 18);
  assert.equal(dimensionToPx('1.125rem'), 18);
  assert.equal(dimensionToPx('1.5em'), 24);
});

test('dimensionToPx returns null for nonsense rather than a misleading number', () => {
  assert.equal(dimensionToPx('huge'), null);
  assert.equal(dimensionToPx(''), null);
});

// ---------------------------------------------------------------------------
// resolveTokens
// ---------------------------------------------------------------------------

test('a brand value beats the built-in for that variable', () => {
  const brand = { colors: { background: '#010203' } };
  const { tokens, sources } = resolveTokens({ brand, mapping: MAPPING, theme: 'light' });
  assert.equal(tokens['--bg'], '#010203');
  assert.equal(sources['--bg'].origin, 'brand');
});

// WHY: a partial brand must still render, but every gap it leaves is reported so
// a 60%-branded deck never reads as a silent rendering bug.
test('a missing source falls back to the built-in AND is reported as a substitution', () => {
  const brand = { colors: { background: '#010203' } };
  const { tokens, substitutions } = resolveTokens({ brand, mapping: MAPPING, theme: 'light' });
  assert.equal(tokens['--accent-1'], MAPPING.variables['--accent-1'].builtin.light);
  assert.ok(substitutions.some((s) => s.variable === '--accent-1'));
});

// WHY: when no brand is requested the built-ins are simply the theme, not a
// degradation, so nothing at all should be reported (per the spec and
// references/design-token.md's "Fallback reporting" exception). Reporting an
// unbranded deck's built-ins would train people to ignore the report, which is
// the failure mode that makes every other warning in this pipeline worthless.
test('when brand is null nothing is reported at all — built-ins are the theme, not a degradation', () => {
  const { substitutions, omissions } = resolveTokens({ brand: null, mapping: MAPPING, theme: 'light' });
  assert.deepEqual(substitutions, []);
  assert.deepEqual(omissions, []);
});

// WHY: design.md's Elevation & Depth section is prose with no token subsection,
// so --shadow can never be branded; that is a format gap, reported as an
// omission rather than a per-brand substitution.
test('--shadow appears in omissions not substitutions, because design.md cannot express elevation', () => {
  const brand = { colors: { background: '#010203' } };
  const { substitutions, omissions } = resolveTokens({ brand, mapping: MAPPING, theme: 'light' });
  assert.ok(omissions.some((o) => o.variable === '--shadow'));
  assert.ok(!substitutions.some((s) => s.variable === '--shadow'));
});

// WHY: cohesion over completeness — --card-alt should follow --card only when
// --card actually came from the brand, so a one-surface brand gets a coherent
// deck rather than one branded card beside one slate card.
test('--card-alt inherits --card only when --card came from the brand', () => {
  const branded = resolveTokens({ brand: { colors: { surface: '#222222' } }, mapping: MAPPING, theme: 'light' });
  assert.equal(branded.tokens['--card-alt'], '#222222');
  assert.equal(branded.sources['--card-alt'].origin, 'inherited');

  const unbranded = resolveTokens({ brand: { colors: {} }, mapping: MAPPING, theme: 'light' });
  assert.equal(unbranded.tokens['--card-alt'], MAPPING.variables['--card-alt'].builtin.light);
  assert.notEqual(unbranded.sources['--card-alt'].origin, 'inherited');
});

test("theme 'dark' selects the dark built-in for an unbranded variable", () => {
  const { tokens } = resolveTokens({ brand: null, mapping: MAPPING, theme: 'dark' });
  assert.equal(tokens['--bg'], MAPPING.variables['--bg'].builtin.dark);
});

// ---------------------------------------------------------------------------
// resolveTypeScale
// ---------------------------------------------------------------------------

// WHY: REGRESSION — an earlier per-level formula collapsed 'title' and
// 'hero-title' onto one size because both derive from h1. One shared multiplier
// must preserve the canvas ratio between them.
test('heading levels scale together, preserving the title:hero-title canvas ratio', () => {
  const brand = { typography: { body: { fontSize: '16px' }, h1: { fontSize: '32px' } } };
  const { scale } = resolveTypeScale({ brand, mapping: MAPPING });
  const canvasRatio = MAPPING.typography.scaled['hero-title'] / MAPPING.typography.scaled.title;
  assert.equal(scale['hero-title'] / scale.title, canvasRatio);
  assert.notEqual(scale.title, scale['hero-title']);
});

// WHY: body copy is authored for a scrolling page and means nothing on a
// 1920x1080 canvas read from across a room, so it keeps its canvas size exactly.
test("'body' and 'card-text' are never scaled by the brand", () => {
  const brand = { typography: { body: { fontSize: '16px' }, h1: { fontSize: '80px' } } };
  const { scale } = resolveTypeScale({ brand, mapping: MAPPING });
  assert.equal(scale.body, MAPPING.typography.fixed.body);
  assert.equal(scale['card-text'], MAPPING.typography.fixed['card-text']);
});

// WHY: overflow is a hard failure, so the multiplier clamps narrowly and hitting
// the bound is reported rather than silently applied.
test('the multiplier clamps and the clamp is recorded in notes', () => {
  const brand = { typography: { body: { fontSize: '10px' }, h1: { fontSize: '200px' } } };
  const { multiplier, notes } = resolveTypeScale({ brand, mapping: MAPPING });
  assert.equal(multiplier, MAPPING.typography.clamp.max);
  assert.ok(notes.some((n) => /clamped/.test(n.reason)));
});

// WHY: a brand with no h1/body pair cannot set dominance, so the canvas hierarchy
// is kept and the note says so rather than silently applying a multiplier.
test('a brand with no h1/body pair keeps canvas sizes and says so', () => {
  const { scale, multiplier, notes } = resolveTypeScale({ brand: { colors: {} }, mapping: MAPPING });
  assert.equal(multiplier, 1);
  assert.equal(scale.title, MAPPING.typography.scaled.title);
  assert.ok(notes.some((n) => n.requested == null));
});

// ---------------------------------------------------------------------------
// resolveFontFamily
// ---------------------------------------------------------------------------

test('resolveFontFamily takes the first family of a CSS stack and strips quotes', () => {
  const brand = { typography: { body: { fontFamily: '"Space Grotesk", Inter, sans-serif' } } };
  assert.equal(resolveFontFamily({ brand, mapping: MAPPING }), 'Space Grotesk');
});

test('resolveFontFamily falls back to the mapping built-in when the brand names none', () => {
  assert.equal(resolveFontFamily({ brand: { typography: {} }, mapping: MAPPING }), 'Inter');
});

// ---------------------------------------------------------------------------
// resolvePassthrough
// ---------------------------------------------------------------------------

// WHY: weight, tracking and leading change voice without changing the box, so
// they pass through literally — but must land on the right CSS property and the
// right level, which the LEVEL_SOURCE table maps (title<-h1, card-title<-h3).
test('resolvePassthrough maps weight, tracking and leading to CSS props on the right levels', () => {
  const brand = {
    typography: {
      h1: { fontWeight: 800, letterSpacing: '-0.02em' },
      body: { lineHeight: 1.5 },
    },
  };
  const out = resolvePassthrough({ brand, mapping: MAPPING });
  assert.equal(out.title['font-weight'], '800');
  assert.equal(out.title['letter-spacing'], '-0.02em');
  assert.equal(out.body['line-height'], '1.5');
});

// ---------------------------------------------------------------------------
// brandFingerprint
// ---------------------------------------------------------------------------

// WHY: the fingerprint keys the slide cache, so renaming a brand file must not
// invalidate cached renders — name and description are excluded on purpose.
test('brandFingerprint includes the pixel-affecting fields and excludes name/description', () => {
  const resolved = resolveBrand({ brand: { name: 'Acme', colors: { background: '#010203' } }, mapping: MAPPING });
  const fp = brandFingerprint(resolved);
  assert.deepEqual(Object.keys(fp).sort(), ['fontFamily', 'passthrough', 'radius', 'tokens', 'typeScale'].sort());
  assert.equal(fp.name, undefined);
  assert.equal(fp.description, undefined);

  const renamed = resolveBrand({ brand: { name: 'Beta', colors: { background: '#010203' } }, mapping: MAPPING });
  assert.deepEqual(brandFingerprint(renamed), fp);
});

// ---------------------------------------------------------------------------
// brandReport
// ---------------------------------------------------------------------------

test('brandReport lists substitutions, omissions and clamps', () => {
  const brand = { colors: { background: '#010203' }, typography: { body: { fontSize: '10px' }, h1: { fontSize: '200px' } } };
  const resolved = resolveBrand({ brand, mapping: MAPPING, theme: 'light' });
  const lines = brandReport(resolved).join('\n');
  assert.match(lines, /substituted --accent-1/);
  assert.match(lines, /omitted --shadow/);
  assert.match(lines, /clamped headings/);
});

// WHY: when a brand names no h1/body pair there is no requested ratio; the report
// must phrase that in prose rather than printing the literal word 'null'.
test('brandReport phrases the no-ratio case without printing the word null', () => {
  const resolved = resolveBrand({ brand: { colors: { background: '#010203' } }, mapping: MAPPING });
  const lines = brandReport(resolved).join('\n');
  assert.ok(/type:/.test(lines));
  assert.ok(!/null/.test(lines), lines);
});

// ---------------------------------------------------------------------------
// isPlausibleColour (used above, pinned directly for the punctuation rule)
// ---------------------------------------------------------------------------

test('isPlausibleColour rejects empty and punctuation-bearing values, accepts plain colours', () => {
  assert.equal(isPlausibleColour('#123456'), true);
  assert.equal(isPlausibleColour('rebeccapurple'), true);
  assert.equal(isPlausibleColour(''), false);
  assert.equal(isPlausibleColour('red;'), false);
});

// ---------------------------------------------------------------------------
// Bundled preset themes — templates/theme/*.md
//
// These are the visual-variety presets shipped with the skill. They are real
// design.md@alpha files on disk, so the checks below read them from disk rather
// than from a literal. The frontmatter is still supplied to parseBrand as a
// hand-written object per preset (the tolerant parser is dependency-free by
// design and never imports YAML), and each hand-written object is asserted to
// use only the flat and two-level-nested subset the presets actually declare.
// ---------------------------------------------------------------------------

// A path derived from the test file's own location — not import.meta.dirname,
// which needs Node 20.11+, whereas the skill's only prerequisite is "Node".
const THEME_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'templates', 'theme');

// The mapping literal above omits --secondary and --rule for brevity; the
// presets exercise the full ten-variable set, so the preset tests resolve
// against a literal mirroring the complete normative shape in
// references/design-token.md, in the same key order as the real file.
const FULL_MAPPING = {
  variables: {
    '--bg': {
      sources: ['colors.background', 'colors.neutral', 'colors.base'],
      builtin: { light: '#F1F5F9', dark: '#0F172A' },
    },
    '--card': {
      sources: ['colors.surface', 'colors.card', 'colors.elevated'],
      builtin: { light: '#FFFFFF', dark: '#1E293B' },
    },
    '--card-alt': {
      sources: ['colors.surface-variant', 'colors.surface-alt', 'colors.card-alt', 'colors.muted'],
      inherits: '--card',
      builtin: { light: '#F8FAFC', dark: '#243044' },
    },
    '--primary': {
      sources: ['colors.on-surface', 'colors.on-background', 'colors.foreground', 'colors.ink', 'colors.primary'],
      builtin: { light: '#0F172A', dark: '#F1F5F9' },
    },
    '--secondary': {
      sources: ['colors.on-surface-variant', 'colors.muted-foreground', 'colors.secondary'],
      builtin: { light: '#64748B', dark: '#94A3B8' },
    },
    '--accent-1': {
      sources: ['colors.tertiary', 'colors.accent', 'colors.brand', 'colors.action'],
      builtin: { light: '#10B981', dark: '#34D399' },
    },
    '--rule': {
      sources: ['colors.outline', 'colors.border', 'colors.divider'],
      builtin: { light: '#E2E8F0', dark: '#334155' },
    },
    '--shadow': {
      sources: [],
      omitted: true,
      builtin: { light: '0 1px 2px rgba(15,23,42,.04)', dark: '0 1px 2px rgba(0,0,0,.25)' },
    },
  },
  typography: {
    fontFamily: {
      sources: ['typography.body.fontFamily', 'typography.base.fontFamily'],
      builtin: 'Inter',
    },
    base: 'typography.body.fontSize',
    headingDominance: { source: 'typography.h1.fontSize', canvasHeading: 64, canvasBody: 28 },
    scaled: { title: 64, 'hero-title': 96, 'card-title': 34, 'stat-value': 140 },
    fixed: { body: 28, 'card-text': 24, 'card-detail': 19, 'stat-label': 28, pill: 20 },
    clamp: { min: 0.85, max: 1.15 },
    passthrough: {},
  },
};

// Hand-written frontmatter per preset. Each object stays inside the flat
// `key: value` / two-level-nested subset the presets declare, so the parser
// used in production reads the on-disk YAML into exactly this shape.
const PRESET_FRONTMATTER = {
  'signal.md': {
    version: '1.0.0',
    name: 'Signal',
    colors: {
      background: '#FFFFFF',
      surface: '#F4F4F5',
      'surface-variant': '#E9E9EC',
      'on-surface': '#0A0A0A',
      'on-surface-variant': '#52525B',
      outline: '#D4D4D8',
      accent: '#8A5A00',
    },
    typography: {
      body: { fontFamily: 'IBM Plex Sans, Inter, sans-serif', fontSize: '16px' },
      h1: { fontSize: '40px' },
    },
    omitted: ['spacing', 'rounded'],
  },
  'civic.md': {
    version: '1.0.0',
    name: 'Civic',
    colors: {
      background: '#EEF2F6',
      surface: '#FFFFFF',
      'surface-variant': '#E1E8F0',
      'on-surface': '#132A43',
      'on-surface-variant': '#4A5B70',
      outline: '#C7D3E0',
      accent: '#155E75',
    },
    typography: {
      body: { fontFamily: 'Source Sans 3, Inter, sans-serif', fontSize: '17px' },
      h1: { fontSize: '42px' },
    },
    omitted: ['spacing'],
  },
  'umbra.md': {
    version: '1.0.0',
    name: 'Umbra',
    colors: {
      background: '#0B0F14',
      surface: '#151C24',
      'surface-variant': '#1E2731',
      'on-surface': '#EAF0F5',
      'on-surface-variant': '#9FB0BF',
      outline: '#2C3742',
      accent: '#39C6C0',
    },
    typography: {
      body: { fontFamily: 'Manrope, Inter, sans-serif', fontSize: '16px' },
      h1: { fontSize: '46px' },
    },
    rounded: '16px',
    omitted: ['spacing'],
  },
};

test('every bundled preset splits into frontmatter plus a prose body', () => {
  const files = readdirSync(THEME_DIR).filter((f) => f.endsWith('.md'));
  assert.ok(files.length >= 3, `expected at least three presets, found ${files.length}`);
  for (const file of files) {
    const { frontmatter, body } = splitFrontmatter(readFileSync(path.join(THEME_DIR, file), 'utf8'));
    assert.notEqual(frontmatter, null, `${file} must carry YAML frontmatter`);
    assert.ok(body.trim().length > 0, `${file} must carry a prose body`);
    assert.ok(/^#\s+/m.test(body), `${file} body must open with an h1 title`);
  }
});

// WHY: a preset ships as a working design.md, so it must clear the same
// parse-time bar a third-party brand file does — ok:true with zero errors. The
// one fatal parse error is a duplicate section heading, so this catches an
// author who copy-pastes a section while editing a preset.
test('every bundled preset parses with ok:true and zero errors', () => {
  const files = readdirSync(THEME_DIR).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const { body } = splitFrontmatter(readFileSync(path.join(THEME_DIR, file), 'utf8'));
    const fm = PRESET_FRONTMATTER[file];
    assert.ok(fm, `no hand-written frontmatter recorded for ${file}`);
    const { ok, errors } = parseBrand({ frontmatter: fm, body });
    assert.equal(ok, true, `${file} did not parse: ${errors.join('; ')}`);
    assert.deepEqual(errors, [], `${file} reported parse errors`);
  }
});

// WHY: a preset that resolved mostly to built-ins would render as the default
// theme with a preset's name, defeating the point of shipping visual variety.
// --shadow can never be branded (design.md has no elevation tokens), so a
// preset can brand at most nine of the ten variables; a majority is well above
// the built-in floor and every preset here reaches nine of ten.
test('every bundled preset resolves a majority of variables from the brand file, not built-ins', () => {
  const files = readdirSync(THEME_DIR).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const { body } = splitFrontmatter(readFileSync(path.join(THEME_DIR, file), 'utf8'));
    const { brand } = parseBrand({ frontmatter: PRESET_FRONTMATTER[file], body });
    const { sources } = resolveBrand({ brand, mapping: FULL_MAPPING, theme: 'light' });
    const total = Object.keys(sources).length;
    const branded = Object.values(sources).filter((s) => s.origin === 'brand' || s.origin === 'inherited').length;
    assert.ok(branded > total / 2, `${file} branded only ${branded}/${total} variables`);
    // The single built-in must be --shadow, the one variable the format cannot
    // express; anything else falling back would be an authoring mistake.
    const builtins = Object.entries(sources).filter(([, s]) => s.origin === 'builtin').map(([k]) => k);
    assert.deepEqual(builtins, ['--shadow'], `${file} fell back on more than just --shadow: ${builtins.join(', ')}`);
  }
});

// WHY: the accent must drive --accent-1, never --primary. Putting the accent in
// colors.primary is the documented "--primary trap": it paints every headline
// in the button colour. Ink and accent must therefore resolve to different
// values on every preset.
test('every bundled preset keeps ink (--primary) distinct from the accent (--accent-1)', () => {
  const files = readdirSync(THEME_DIR).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const { body } = splitFrontmatter(readFileSync(path.join(THEME_DIR, file), 'utf8'));
    const { brand } = parseBrand({ frontmatter: PRESET_FRONTMATTER[file], body });
    const { tokens, sources } = resolveBrand({ brand, mapping: FULL_MAPPING, theme: 'light' });
    assert.equal(sources['--primary'].origin, 'brand', `${file} ink did not come from the brand`);
    assert.equal(sources['--accent-1'].origin, 'brand', `${file} accent did not come from the brand`);
    assert.notEqual(tokens['--primary'], tokens['--accent-1'], `${file} paints ink and accent the same colour`);
  }
});

// WHY: each preset declares a body/h1 size pair specifically so the
// heading-dominance multiplier has a real ratio to work from rather than
// keeping the canvas default; a preset that forgot the pair would silently fall
// back to a multiplier of 1 with a "no h1/body pair" note.
test('every bundled preset gives the heading-dominance multiplier a real ratio', () => {
  const files = readdirSync(THEME_DIR).filter((f) => f.endsWith('.md'));
  for (const file of files) {
    const { body } = splitFrontmatter(readFileSync(path.join(THEME_DIR, file), 'utf8'));
    const { brand } = parseBrand({ frontmatter: PRESET_FRONTMATTER[file], body });
    const { typeNotes } = resolveBrand({ brand, mapping: FULL_MAPPING, theme: 'light' });
    assert.ok(
      !typeNotes.some((n) => n.requested == null),
      `${file} declared no usable h1/body size pair`
    );
  }
});
