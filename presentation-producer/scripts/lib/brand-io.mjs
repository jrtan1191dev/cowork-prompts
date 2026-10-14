/**
 * Brand loading: the impure half of the brand layer.
 *
 * `design-md.mjs` stays pure so it is testable with no install. This module is
 * its disk-and-YAML counterpart, and exists because TWO scripts need the same
 * resolved brand for different reasons:
 *
 *   - `deck.mjs` needs the tokens to render slide pixels.
 *   - `compile.mjs` needs `--bg` and `--primary` to stamp into the manifest, so
 *     that `compose.mjs` and the Remotion templates can letterbox and burn
 *     captions in brand colours WITHOUT ever reading DESIGN.md. The storyboard
 *     stays the single contract every downstream stage reads.
 *
 * Duplicating the loader in both would have meant two places to keep the
 * mapping path, the error wording and the dark-fallback rule in step.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { sha256 } from './core.mjs';
import { brandReport, parseBrand, resolveBrand, splitFrontmatter } from './design-md.mjs';
import { fontFaceCss, fontsourceFile, fontsourcePackages } from './fontsource.mjs';

/** The skill-owned mapping. Not project-overridable, so it is located from here. */
export function mappingPath() {
  // Not import.meta.dirname: that needs Node 20.11+, and this skill's only
  // stated prerequisite is "Node".
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.join(here, '..', '..', 'references', 'design-token.md');
}

/**
 * Load the declared brand files and the mapping.
 *
 * Returns `{light: null, dark: null, mapping: null}` when nothing is declared,
 * which is the unbranded path and is deliberately silent: built-ins are the
 * theme, not a degradation, and warning about them would train people to ignore
 * the report.
 *
 * A declared-but-broken file is a hard error, mirroring `readCustomHtml` and the
 * unknown-icon rule: a silently unbranded deck passes overflow, passes contrast
 * and passes verification, and fails only in front of an audience.
 *
 * The brand path is DECLARED in storyline.yml (`deck.design`), never discovered
 * by walking the repository. The agent finds the file while it is already
 * reading repo material and pins the path, which keeps the brand visible in a
 * diff, keeps CI deterministic, and means no ignore lists, depth caps or
 * cross-platform directory-ordering code exist to go wrong.
 */
export async function loadBrandFiles({ workDir, paths, deck, warn = () => {} }) {
  const declared = deck?.design ?? null;
  const declaredDark = deck?.designDark ?? null;
  if (!declared && !declaredDark) return { light: null, dark: null, mapping: null };

  const yamlEntry = path.join(paths.nodeModules, 'yaml', 'dist', 'index.js');
  if (!existsSync(yamlEntry)) {
    throw new Error(
      'a brand file is declared (deck.design) but the `yaml` parser is not installed.\n' +
        'Run bootstrap.mjs --with-deck first.'
    );
  }
  const YAML = await import(yamlEntry);

  const mPath = mappingPath();
  const mappingSplit = splitFrontmatter(readFileSync(mPath, 'utf8'));
  if (!mappingSplit.frontmatter) {
    throw new Error('references/design-token.md has no frontmatter — the mapping is missing');
  }
  const mapping = YAML.parse(mappingSplit.frontmatter);

  const read = (rel, label) => {
    const abs = path.resolve(workDir, rel);
    if (!existsSync(abs)) throw new Error(`${label} declared as "${rel}" but no file exists at ${abs}`);
    const split = splitFrontmatter(readFileSync(abs, 'utf8'));
    const parsed = parseBrand({
      frontmatter: split.frontmatter ? YAML.parse(split.frontmatter) : null,
      body: split.body,
    });
    if (!parsed.ok) {
      throw new Error(`${label} (${rel}) is not a valid design.md file:\n  ${parsed.errors.join('\n  ')}`);
    }
    for (const w of parsed.warnings) warn(`${label}: ${w}`);
    return { parsed, rel, checksum: sha256(readFileSync(abs)) };
  };

  const light = declared ? read(declared, 'deck.design') : null;
  const dark = declaredDark ? read(declaredDark, 'deck.designDark') : null;
  return { light, dark, mapping };
}

/**
 * Resolve one theme's brand, memoised.
 *
 * Resolution is per theme rather than per slide: a deck carries one brand, and
 * resolving per slide would invite per-slide drift.
 */
export function brandResolver(brandFiles, warn = () => {}) {
  const cache = new Map();
  const warned = new Set();
  return (theme) => {
    if (cache.has(theme)) return cache.get(theme);
    let resolved = null;
    if (brandFiles.mapping) {
      const file = theme === 'dark' ? brandFiles.dark ?? brandFiles.light : brandFiles.light;
      if (file) {
        if (theme === 'dark' && !brandFiles.dark && !warned.has(theme)) {
          // Warn and render, never fail: failing a build over a missing optional
          // brand variant is the trap that type-bending exists to avoid.
          warned.add(theme);
          warn('theme: dark requested but no deck.designDark declared — rendering the light palette on the dark built-ins');
        }
        resolved = resolveBrand({ brand: file.parsed.brand, mapping: brandFiles.mapping, theme });
      }
    }
    cache.set(theme, resolved);
    return resolved;
  };
}

/**
 * Report lines for every theme that actually rendered.
 *
 * Kept here rather than inline in deck.mjs because the resolver deliberately
 * exposes only a lookup function — a deck carries one brand, and handing out the
 * memo would invite callers to iterate it as if brands were per slide. The
 * caller passes the themes it rendered, which is the fact it owns.
 */
export function brandReportLines(themes, brandFor, brandFiles) {
  const lines = [];
  for (const theme of themes) {
    const resolved = brandFor(theme);
    if (!resolved) continue;
    const file = (theme === 'dark' ? brandFiles?.dark : brandFiles?.light)?.rel;
    lines.push(...brandReport(resolved, { file }));
  }
  return lines;
}

// ---------------------------------------------------------------------------
// Fonts (D5)
// ---------------------------------------------------------------------------

/**
 * Provenance values. All four are distinct outcomes, not synonyms:
 *   fontsource     the requested family was embedded from a Fontsource package
 *   file           the requested family was embedded from a supplied .woff2
 *   local          the family could not be embedded; it leads the CSS stack and
 *                  whatever the machine has is used, with the bundled family
 *                  behind it as a metric anchor
 *   fallback-inter nothing could be embedded at all, not even the bundled
 *                  family, so the render falls through to a system font
 * Every one of them except an embedded bundled default is reported.
 */

/** The bundled family. Its own resolution is the pre-brand behaviour. */
const DEFAULT_FONT_FAMILY = 'Inter';

/**
 * Decide which font file the deck will embed, without reading its bytes.
 *
 * Split from the byte-loading step because two callers want different halves:
 * `deck.mjs` needs the CSS, while `compile.mjs` needs only the provenance, which
 * it folds into the slide cache key. Embedding a 300KB font just to compute a
 * cache key would be absurd.
 *
 * Resolution order follows D5, and the order is the point:
 *   1. `deck.fontFile` — an explicit path always wins, because brand fonts are
 *      frequently proprietary and can never appear on npm at all.
 *   2. Fontsource, variable package before static.
 *   3. `local` — the family is named in CSS and whatever the machine has is
 *      used. This is the one machine-dependent path in the renderer, so it is
 *      reported and mitigated (see `fallbackFamily`).
 *   4. `fallback-inter` — no brand family was asked for.
 *
 * @returns {{family: string, provenance: string, file: string|null, weight: string,
 *            package: string|null, axis: string|null, fallbackFamily: string|null,
 *            note: string|null}}
 */
export function resolveDeckFont({ paths, workDir, family = DEFAULT_FONT_FAMILY, fontFile = null }) {
  const interFile = fontsourceLookup(paths, DEFAULT_FONT_FAMILY);

  if (fontFile) {
    const abs = path.resolve(workDir, fontFile);
    // Mirrors readCustomHtml: a declared-but-missing input is a hard error,
    // because a deck that silently lost its brand font passes every gate.
    if (!existsSync(abs)) {
      throw new Error(`deck.fontFile declares "${fontFile}" but no file exists at ${abs}`);
    }
    return {
      family,
      provenance: 'file',
      file: abs,
      weight: '100 900',
      package: null,
      axis: null,
      fallbackFamily: null,
      note: `embedded from ${fontFile}`,
    };
  }

  const hit = fontsourceLookup(paths, family);
  if (hit) {
    return {
      family,
      provenance: 'fontsource',
      file: hit.file,
      weight: hit.weight,
      package: hit.pkg,
      axis: hit.axis,
      fallbackFamily: null,
      note: `embedded from ${hit.pkg} (${hit.axis} axis)`,
    };
  }

  const isDefault = family === DEFAULT_FONT_FAMILY;
  return {
    family,
    provenance: isDefault ? 'fallback-inter' : 'local',
    // Still embed the bundled font on the `local` path. The brand family leads
    // the CSS stack, so a machine that has it wins; a machine that does not
    // lands on a font whose metrics are known rather than on an arbitrary
    // system default, which is what keeps the pixel-measured overflow gate from
    // flipping between machines. `font-size-adjust` then holds x-height steady.
    file: interFile?.file ?? null,
    weight: interFile?.weight ?? '100 900',
    package: interFile?.pkg ?? null,
    axis: interFile?.axis ?? null,
    fallbackFamily: isDefault ? null : interFile ? DEFAULT_FONT_FAMILY : null,
    note: isDefault
      ? interFile
        ? null
        : 'bundled Inter not installed'
      : `not installed — install ${fontsourcePackages(family)[0]?.pkg ?? 'the Fontsource package'} ` +
        `or declare deck.fontFile${interFile ? ', falling back to bundled Inter' : ''}`,
  };
}

/** Find a family's embeddable file inside the project-local runtime. */
function fontsourceLookup(paths, family) {
  for (const candidate of fontsourcePackages(family)) {
    const dir = path.join(paths.nodeModules, ...candidate.pkg.split('/'), 'files');
    if (!existsSync(dir)) continue;
    const pick = fontsourceFile(family, readdirSync(dir));
    // An installed package with no usable Latin file is not a hit: falling
    // through reports the miss instead of embedding nothing and rendering with
    // whatever the machine happened to have.
    if (!pick) continue;
    return { ...pick, file: path.join(dir, pick.file), pkg: candidate.pkg };
  }
  return null;
}

/**
 * The `@font-face` block for a resolved font, or '' when there is nothing to
 * embed. Base64 rather than a file:// URL because a document installed with
 * setContent lives at about:blank and Chromium refuses its file subresources.
 */
export function loadFontFaceCss(resolved) {
  if (!resolved?.file || !existsSync(resolved.file)) return '';
  const family = resolved.provenance === 'local' && resolved.fallbackFamily ? resolved.fallbackFamily : resolved.family;
  return fontFaceCss({
    family,
    base64: readFileSync(resolved.file).toString('base64'),
    weight: resolved.weight,
  });
}

/**
 * One human-readable line per resolved font, or null when there is nothing to
 * say. The bundled default is silent: reporting it on every unbranded run would
 * be noise, and the unbranded path is deliberately quiet because built-ins are
 * the theme rather than a degradation.
 */
export function fontReportLine(resolved) {
  if (!resolved) return null;
  if (resolved.provenance === 'fontsource' && resolved.family === DEFAULT_FONT_FAMILY) return null;
  if (resolved.provenance === 'fallback-inter' && !resolved.note) return null;
  return `font: ${resolved.family} [${resolved.provenance}]${resolved.note ? ` — ${resolved.note}` : ''}`;
}
