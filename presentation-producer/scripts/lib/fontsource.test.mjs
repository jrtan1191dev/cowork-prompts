/**
 * Font resolution tests — tier 1: no install required, system Node alone.
 *
 * Two layers are covered. `fontsource.mjs` is pure and gets the interesting
 * cases: the derivation that used to return undefined for any family variable on
 * a non-weight axis, which made a declared brand font vanish into a system
 * fallback with nothing reported. `brand-io.mjs` is the reader, exercised against
 * a temporary directory laid out like a real `.runtime/node_modules` — it touches
 * disk but needs nothing installed, which keeps it in tier 1.
 *
 *   node --test scripts/lib/fontsource.test.mjs
 */

import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { brandReportLines, fontReportLine, loadFontFaceCss, resolveDeckFont } from './brand-io.mjs';
import { cssFamilyName, fontFaceCss, fontsourceFile, fontsourcePackages, fontsourceSlug } from './fontsource.mjs';

// ---------------------------------------------------------------------------
// Slug and package derivation
// ---------------------------------------------------------------------------

test('a family name becomes the Fontsource slug, so the package need not be declared', () => {
  assert.equal(fontsourceSlug('Inter'), 'inter');
  assert.equal(fontsourceSlug('Source Serif 4'), 'source-serif-4');
  assert.equal(fontsourceSlug('IBM Plex Sans'), 'ibm-plex-sans');
  assert.equal(fontsourceSlug('  Noto Sans JP '), 'noto-sans-jp');
});

test('apostrophes are dropped rather than hyphenated, matching the registry', () => {
  assert.equal(fontsourceSlug("Gochi Hand's"), 'gochi-hands');
});

test('an empty family yields no slug and therefore no candidate packages', () => {
  assert.equal(fontsourceSlug(''), '');
  assert.deepEqual(fontsourcePackages(''), []);
  assert.deepEqual(fontsourcePackages(null), []);
});

// WHY: variable first because one file covers 100-900, which is what lets the
// emitted @font-face declare the whole range and the layouts use 400 to 800
// without a second request.
test('the variable package is tried before the static one', () => {
  const [first, second] = fontsourcePackages('Source Serif 4');
  assert.equal(first.pkg, '@fontsource-variable/source-serif-4');
  assert.equal(first.kind, 'variable');
  assert.equal(second.pkg, '@fontsource/source-serif-4');
  assert.equal(second.kind, 'static');
});

// ---------------------------------------------------------------------------
// File selection — the bug this deliverable exists to fix
// ---------------------------------------------------------------------------

test('the weight axis is preferred when a package ships one', () => {
  const pick = fontsourceFile('Inter', [
    'inter-latin-wght-normal.woff2',
    'inter-latin-wght-italic.woff2',
    'inter-cyrillic-wght-normal.woff2',
  ]);
  assert.deepEqual(pick, { file: 'inter-latin-wght-normal.woff2', axis: 'wght', weight: '100 900' });
});

// WHY: this is the U4 gap. @fontsource-variable packages also ship `opsz` and
// `standard` builds, and a family variable on a non-weight axis has no `wght`
// file at all. The previous single-regex find returned undefined, loadFontCss
// returned '', and the brand font was silently dropped.
test('a family variable on a non-weight axis still resolves instead of vanishing', () => {
  const opsz = fontsourceFile('Nunito', ['nunito-latin-opsz-normal.woff2']);
  assert.equal(opsz.file, 'nunito-latin-opsz-normal.woff2');
  assert.equal(opsz.axis, 'opsz');

  const standard = fontsourceFile('Recursive', ['recursive-latin-standard-normal.woff2']);
  assert.equal(standard.axis, 'standard');

  const full = fontsourceFile('Roboto Flex', ['roboto-flex-latin-full-normal.woff2']);
  assert.equal(full.axis, 'full');
});

test('the axis preference order holds when a package ships several', () => {
  const pick = fontsourceFile('Source Serif 4', [
    'source-serif-4-latin-standard-normal.woff2',
    'source-serif-4-latin-opsz-normal.woff2',
    'source-serif-4-latin-wght-normal.woff2',
  ]);
  assert.equal(pick.axis, 'wght');
});

test('a static package resolves to its 400 weight, the weight the layouts assume', () => {
  const pick = fontsourceFile('Lora', [
    'lora-latin-400-normal.woff2',
    'lora-latin-700-normal.woff2',
    'lora-latin-400-italic.woff2',
  ]);
  assert.deepEqual(pick, { file: 'lora-latin-400-normal.woff2', axis: 'static', weight: '400' });
});

test('a static package without 400 takes the nearest weight rather than nothing', () => {
  const pick = fontsourceFile('Oswald', ['oswald-latin-200-normal.woff2', 'oswald-latin-500-normal.woff2']);
  assert.equal(pick.weight, '500');
});

// WHY: null is the signal the caller turns into a named, reported fallback. It
// must not be reachable by accident, and it must not be confused with a miss on
// a different family's files.
test('nothing usable returns null so the caller can report a named fallback', () => {
  assert.equal(fontsourceFile('Inter', []), null);
  assert.equal(fontsourceFile('Inter', ['inter-latin-wght-italic.woff2']), null);
  assert.equal(fontsourceFile('Inter', ['lora-latin-wght-normal.woff2']), null);
  assert.equal(fontsourceFile('', ['inter-latin-wght-normal.woff2']), null);
});

// ---------------------------------------------------------------------------
// @font-face emission
// ---------------------------------------------------------------------------

// WHY: the no-brand path must stay byte-identical, so the rule emitted for Inter
// is pinned character for character against what the hardcoded loader produced.
test('the Inter rule is byte-identical to the pre-brand hardcoded string', () => {
  const expected =
    "@font-face{font-family:'Inter';font-style:normal;font-weight:100 900;font-display:block;\n" +
    "src:url(data:font/woff2;base64,QUJD) format('woff2')}";
  assert.equal(fontFaceCss({ family: 'Inter', base64: 'QUJD' }), expected);
});

test('a static weight is declared as that weight, not as a range it cannot serve', () => {
  assert.match(fontFaceCss({ family: 'Lora', base64: 'QQ', weight: '400' }), /font-weight:400;/);
});

test('nothing to embed emits nothing rather than a broken rule', () => {
  assert.equal(fontFaceCss({ family: 'Inter', base64: '' }), '');
  assert.equal(fontFaceCss({ family: '', base64: 'QQ' }), '');
});

// WHY: the family comes from a project-authored file and is interpolated into a
// quoted declaration, so CSS punctuation must not survive into the stylesheet.
test('CSS punctuation cannot escape the quoted family declaration', () => {
  assert.equal(cssFamilyName("Evil'; } body{display:none"), 'Evil  bodydisplay:none');
  assert.ok(!fontFaceCss({ family: "X';}", base64: 'QQ' }).includes('}body'));
});

// ---------------------------------------------------------------------------
// The reader
// ---------------------------------------------------------------------------

/** A throwaway .runtime/node_modules laid out the way bootstrap lays it out. */
function runtimeWith(packages = {}) {
  const dir = mkdtempSync(path.join(tmpdir(), 'vg-font-'));
  for (const [pkg, files] of Object.entries(packages)) {
    const filesDir = path.join(dir, 'node_modules', ...pkg.split('/'), 'files');
    mkdirSync(filesDir, { recursive: true });
    for (const f of files) writeFileSync(path.join(filesDir, f), 'FONTBYTES');
  }
  return { paths: { nodeModules: path.join(dir, 'node_modules') }, workDir: dir, dir };
}

test('an installed brand family is embedded from its package and reported as such', (t) => {
  const rt = runtimeWith({ '@fontsource-variable/source-serif-4': ['source-serif-4-latin-wght-normal.woff2'] });
  t.after(() => rmSync(rt.dir, { recursive: true, force: true }));

  const font = resolveDeckFont({ paths: rt.paths, workDir: rt.workDir, family: 'Source Serif 4' });
  assert.equal(font.provenance, 'fontsource');
  assert.equal(font.package, '@fontsource-variable/source-serif-4');
  assert.equal(font.axis, 'wght');
  assert.equal(font.fallbackFamily, null);
  assert.match(loadFontFaceCss(font), /font-family:'Source Serif 4'/);
  assert.match(fontReportLine(font), /^font: Source Serif 4 \[fontsource\]/);
});

test('a static package is used when no variable build is installed', (t) => {
  const rt = runtimeWith({ '@fontsource/lora': ['lora-latin-400-normal.woff2'] });
  t.after(() => rmSync(rt.dir, { recursive: true, force: true }));

  const font = resolveDeckFont({ paths: rt.paths, workDir: rt.workDir, family: 'Lora' });
  assert.equal(font.package, '@fontsource/lora');
  assert.equal(font.weight, '400');
});

// WHY: the whole point of the deliverable. An absent family must name itself and
// name the remedy, and must NOT throw — a brand that cannot supply its font is a
// reported degradation, not a broken build.
test('an uninstalled brand family reports a named fallback instead of failing or going quiet', (t) => {
  const rt = runtimeWith({ '@fontsource-variable/inter': ['inter-latin-wght-normal.woff2'] });
  t.after(() => rmSync(rt.dir, { recursive: true, force: true }));

  const font = resolveDeckFont({ paths: rt.paths, workDir: rt.workDir, family: 'Brand Grotesk' });
  assert.equal(font.provenance, 'local');
  assert.equal(font.family, 'Brand Grotesk');
  assert.equal(font.fallbackFamily, 'Inter');
  assert.match(font.note, /@fontsource-variable\/brand-grotesk/);
  assert.match(font.note, /deck\.fontFile/);
  // Bundled Inter is embedded behind it so line counts stay machine-stable.
  assert.match(loadFontFaceCss(font), /font-family:'Inter'/);
});

test('an installed package with no usable Latin file is a miss, not an empty embed', (t) => {
  const rt = runtimeWith({ '@fontsource-variable/brand-grotesk': ['brand-grotesk-cyrillic-wght-normal.woff2'] });
  t.after(() => rmSync(rt.dir, { recursive: true, force: true }));

  const font = resolveDeckFont({ paths: rt.paths, workDir: rt.workDir, family: 'Brand Grotesk' });
  assert.equal(font.provenance, 'local');
});

// WHY: brand fonts are frequently proprietary and can never appear on npm, so
// the supplied-file path is the only way objective (a) is reachable for them.
test('a supplied .woff2 wins over every package, because an explicit path is a decision', (t) => {
  const rt = runtimeWith({ '@fontsource-variable/inter': ['inter-latin-wght-normal.woff2'] });
  t.after(() => rmSync(rt.dir, { recursive: true, force: true }));
  writeFileSync(path.join(rt.dir, 'brand.woff2'), 'PRIVATEBYTES');

  const font = resolveDeckFont({ paths: rt.paths, workDir: rt.workDir, family: 'Inter', fontFile: 'brand.woff2' });
  assert.equal(font.provenance, 'file');
  assert.match(font.note, /brand\.woff2/);
  assert.match(loadFontFaceCss(font), /base64,UFJJVkFURUJZVEVT/);
});

// WHY: mirrors readCustomHtml. A declared-but-missing input is a hard error,
// because a deck that silently lost its brand font passes every automated gate.
test('a declared but missing font file is a hard error', (t) => {
  const rt = runtimeWith({});
  t.after(() => rmSync(rt.dir, { recursive: true, force: true }));
  assert.throws(
    () => resolveDeckFont({ paths: rt.paths, workDir: rt.workDir, family: 'Inter', fontFile: 'fonts/absent.woff2' }),
    /deck\.fontFile declares "fonts\/absent\.woff2"/
  );
});

// WHY: with no brand, built-ins are the theme rather than a degradation, so the
// clean default reports nothing at all even though it did resolve a package.
test('the unbranded default is silent, because built-ins are not a degradation', (t) => {
  const rt = runtimeWith({ '@fontsource-variable/inter': ['inter-latin-wght-normal.woff2'] });
  t.after(() => rmSync(rt.dir, { recursive: true, force: true }));

  const font = resolveDeckFont({ paths: rt.paths, workDir: rt.workDir });
  assert.equal(font.provenance, 'fontsource');
  assert.equal(font.family, 'Inter');
  assert.equal(fontReportLine(font), null);
});

test('a missing bundled font is still reported, because wrapping then varies per machine', (t) => {
  const rt = runtimeWith({});
  t.after(() => rmSync(rt.dir, { recursive: true, force: true }));

  const font = resolveDeckFont({ paths: rt.paths, workDir: rt.workDir });
  assert.equal(font.provenance, 'fallback-inter');
  assert.equal(font.file, null);
  assert.equal(loadFontFaceCss(font), '');
  assert.match(font.note, /bundled Inter not installed/);
});

// ---------------------------------------------------------------------------
// The brand report path (the loop that previously iterated an undefined symbol)
// ---------------------------------------------------------------------------

test('the brand report is built from the themes actually rendered', () => {
  const resolved = {
    tokens: { '--bg': '#FBF7F4' },
    sources: { '--bg': { origin: 'brand', path: 'colors.background' }, '--card': { origin: 'builtin' } },
    substitutions: [{ variable: '--card', tried: ['colors.surface'], used: '#FFFFFF' }],
    omissions: [{ variable: '--shadow', reason: 'design.md cannot express this' }],
    typeNotes: [],
    name: 'Terracotta',
  };
  const lines = brandReportLines(new Set(['light']), () => resolved, { light: { rel: '../DESIGN.md' } });
  assert.match(lines[0], /brand: Terracotta — 1\/2 variables/);
  assert.ok(lines.some((l) => /substituted --card/.test(l)));
  assert.ok(lines.some((l) => /omitted --shadow/.test(l)));
});

test('an unbranded deck produces no brand report lines at all', () => {
  assert.deepEqual(brandReportLines(new Set(['light', 'dark']), () => null, {}), []);
});
