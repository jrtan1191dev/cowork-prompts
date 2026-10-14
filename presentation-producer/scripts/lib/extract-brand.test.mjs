/**
 * brand extraction tests — tier 1: no browser, no install, system Node alone.
 *
 * The browser half (getComputedStyle, the two colour-scheme passes, writeFile)
 * lives in deck.mjs and is deliberately absent here; this file pins the pure
 * mapping that decides which design.md key a raw app custom property lands
 * under. The behaviour worth guarding is the accent-vs-ink trap: an app's
 * `--primary` is its action colour and must NOT become the deck's ink, or every
 * headline renders in the app's button colour.
 *
 * The suite never imports `yaml`, so the mapping and the parsed frontmatter fed
 * to parseBrand are built as plain JS object literals — the same discipline as
 * design-md.test.mjs, whose MAPPING literal is mirrored below.
 *
 *   node --test scripts/lib/extract-brand.test.mjs
 */

import assert from 'node:assert/strict';
import test from 'node:test';

import { parseBrand, resolveBrand, splitFrontmatter } from './design-md.mjs';
import { buildDesignMd, extractBrand, toFrontmatter } from './extract-brand.mjs';

// The normative mapping's shape, by hand, so the suite stays YAML-free. Key
// order matters: --primary lists ink names before `colors.primary`, and
// --accent-1 omits `colors.primary` entirely — the two facts that make the
// accent-vs-ink routing correct.
const MAPPING = {
  variables: {
    '--bg': { sources: ['colors.background', 'colors.neutral', 'colors.base'], builtin: { light: '#F1F5F9', dark: '#0F172A' } },
    '--card': { sources: ['colors.surface', 'colors.card', 'colors.elevated'], builtin: { light: '#FFFFFF', dark: '#1E293B' } },
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
    '--accent-1': { sources: ['colors.tertiary', 'colors.accent', 'colors.brand', 'colors.action'], builtin: { light: '#10B981', dark: '#34D399' } },
    '--rule': { sources: ['colors.outline', 'colors.border', 'colors.divider'], builtin: { light: '#E2E8F0', dark: '#334155' } },
    '--shadow': { sources: [], omitted: true, builtin: { light: '0 1px 2px rgba(15,23,42,.04)', dark: '0 1px 2px rgba(0,0,0,.25)' } },
  },
  typography: {
    fontFamily: { sources: ['typography.body.fontFamily', 'typography.base.fontFamily'], builtin: 'Inter' },
    base: 'typography.body.fontSize',
    headingDominance: { source: 'typography.h1.fontSize', canvasHeading: 64, canvasBody: 28 },
    scaled: { title: 64, 'hero-title': 96, 'card-title': 34, 'stat-value': 140 },
    fixed: { body: 28, 'card-text': 24, 'card-detail': 19, 'stat-label': 28, pill: 20 },
    clamp: { min: 0.85, max: 1.15 },
    passthrough: {},
  },
};

// A shadcn-conventioned computed-property bag: `--primary` is the ACTION colour,
// `--foreground` is ink. This is the exact shape the trap is about.
const SHADCN_PROPS = {
  '--background': 'oklch(1 0 0)',
  '--foreground': 'oklch(0.145 0 0)',
  '--card': 'oklch(0.99 0 0)',
  '--muted': 'oklch(0.97 0 0)',
  '--muted-foreground': 'oklch(0.556 0 0)',
  '--primary': 'oklch(0.55 0.2 264)', // the app's action/button colour
  '--border': 'oklch(0.922 0 0)',
};

// ---------------------------------------------------------------------------
// extractBrand — the mapping
// ---------------------------------------------------------------------------

test("an app's --primary is emitted as an accent key, never as colors.primary", () => {
  const { colors, audit } = extractBrand({ props: SHADCN_PROPS });
  assert.equal(colors.primary, undefined);
  assert.equal(colors.tertiary, 'oklch(0.55 0.2 264)');
  assert.ok(audit.some((a) => a.token === 'colors.tertiary' && a.source === '--primary'));
});

test('a shadcn --foreground is emitted as the ink key colors.on-surface', () => {
  const { colors } = extractBrand({ props: SHADCN_PROPS });
  assert.equal(colors['on-surface'], 'oklch(0.145 0 0)');
});

test('leading -- is optional and empty computed values are ignored', () => {
  const { colors } = extractBrand({ props: { background: '#fff', '--surface': '', card: '#eee' } });
  assert.equal(colors.background, '#fff');
  assert.equal(colors.surface, '#eee'); // from --card, since --surface was empty
});

test('a colour value carrying CSS punctuation is refused rather than emitted', () => {
  const { colors, missing } = extractBrand({ props: { background: 'red; color: blue' } });
  assert.equal(colors.background, undefined);
  assert.ok(missing.some((m) => /colors\.background/.test(m)));
});

test('typography and rounded are captured with their computed sources recorded', () => {
  const { typography, rounded, audit } = extractBrand({
    props: SHADCN_PROPS,
    fontFamily: 'Inter, sans-serif',
    bodyFontSize: '16px',
    h1FontSize: '44px',
    radius: '8px',
  });
  assert.equal(typography.body.fontFamily, 'Inter, sans-serif');
  assert.equal(typography.body.fontSize, '16px');
  assert.equal(typography.h1.fontSize, '44px');
  assert.equal(rounded, '8px');
  assert.ok(audit.some((a) => a.token === 'typography.h1.fontSize'));
});

test('every unfound expected token is reported, never applied silently', () => {
  const { missing } = extractBrand({ props: { background: '#fff' } });
  assert.ok(missing.some((m) => /colors\.tertiary/.test(m)));
  assert.ok(missing.some((m) => /colors\.on-surface/.test(m)));
  assert.ok(missing.some((m) => /typography\.body\.fontFamily/.test(m)));
});

test('elevation is recorded as omitted because design.md cannot express it', () => {
  const { omitted } = extractBrand({ props: SHADCN_PROPS });
  assert.ok(omitted.includes('elevation'));
});

// ---------------------------------------------------------------------------
// End-to-end: emitted frontmatter round-trips through the reader unchanged.
// ---------------------------------------------------------------------------

// The property bag we EXTRACT is emitted as frontmatter text; a hand-parsed
// object of that same text is the parsed-frontmatter expectation. Feeding it
// through the real reader proves the extractor emits a conformant file.
test('extracted frontmatter parses cleanly and brands ink and accent correctly', () => {
  const built = buildDesignMd({
    props: SHADCN_PROPS,
    fontFamily: 'Inter, sans-serif',
    bodyFontSize: '16px',
    h1FontSize: '44px',
    radius: '8px',
    theme: 'light',
    url: 'https://example.test',
  });

  const { frontmatter, body } = splitFrontmatter(built.text);
  assert.ok(frontmatter, 'the emitted file must carry a --- frontmatter block');

  // The hand-written parsed-object expectation for that frontmatter, built as a
  // plain literal rather than via a YAML parse (the suite imports no yaml).
  const parsedFrontmatter = {
    version: '1.0.0',
    name: 'Extracted Light',
    description: built.text.match(/description: >\n((?:  .*\n)+)/)[1].split('\n').map((l) => l.trim()).filter(Boolean).join(' '),
    colors: {
      'on-surface': 'oklch(0.145 0 0)',
      'on-surface-variant': 'oklch(0.556 0 0)',
      background: 'oklch(1 0 0)',
      surface: 'oklch(0.99 0 0)',
      'surface-variant': 'oklch(0.97 0 0)',
      tertiary: 'oklch(0.55 0.2 264)',
      outline: 'oklch(0.922 0 0)',
    },
    typography: {
      body: { fontFamily: 'Inter, sans-serif', fontSize: '16px' },
      h1: { fontSize: '44px' },
    },
    rounded: '8px',
    omitted: ['spacing', 'elevation'],
  };

  const parsed = parseBrand({ frontmatter: parsedFrontmatter, body });
  assert.equal(parsed.ok, true);
  assert.deepEqual(parsed.errors, []);

  // Resolve against the mapping and prove the trap did not spring: ink took the
  // app's --foreground, and the accent — not the ink — took the app's --primary.
  const resolved = resolveBrand({ brand: parsed.brand, mapping: MAPPING, theme: 'light' });
  assert.equal(resolved.tokens['--primary'], 'oklch(0.145 0 0)', 'ink must be the app foreground');
  assert.equal(resolved.tokens['--accent-1'], 'oklch(0.55 0.2 264)', 'accent must be the app action colour');
  assert.notEqual(resolved.tokens['--primary'], resolved.tokens['--accent-1'], 'ink must not equal the action colour');
  assert.equal(resolved.tokens['--bg'], 'oklch(1 0 0)');
  assert.equal(resolved.tokens['--card'], 'oklch(0.99 0 0)');
});

// ---------------------------------------------------------------------------
// toFrontmatter — shape guarantees the reader depends on
// ---------------------------------------------------------------------------

test('toFrontmatter emits the required keys in a --- block', () => {
  const text = toFrontmatter({
    colors: { background: '#fff' },
    typography: { body: { fontFamily: 'Inter', fontSize: '16px' }, h1: { fontSize: '44px' } },
    rounded: '8px',
    omitted: ['elevation'],
    name: 'X',
    description: 'a desc',
  });
  assert.ok(text.startsWith('---\n'));
  assert.ok(text.trimEnd().endsWith('---'));
  assert.match(text, /version: 1\.0\.0/);
  assert.match(text, /name: 'X'/);
  assert.match(text, /background: '#fff'/);
  assert.match(text, /rounded: '8px'/);
});

test('the two themes are each standalone files with no dark: block', () => {
  const light = buildDesignMd({ props: SHADCN_PROPS, theme: 'light' });
  const dark = buildDesignMd({ props: { ...SHADCN_PROPS, '--background': 'oklch(0.145 0 0)', '--foreground': 'oklch(0.985 0 0)' }, theme: 'dark' });
  assert.ok(!/\bdark:/.test(light.text), 'a standalone light file must carry no dark block');
  assert.ok(!/\bdark:/.test(dark.text), 'the dark file is itself standalone, not a mode');
  assert.match(dark.text, /oklch\(0\.145 0 0\)/); // the dark background made it through verbatim
});
