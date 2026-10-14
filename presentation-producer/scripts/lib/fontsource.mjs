/**
 * Fontsource on-disk conventions (pure).
 *
 * The deck embeds its font rather than naming it, so glyph shapes and line
 * wrapping cannot vary per machine — which is what makes the pixel-measured
 * overflow gate mean anything. Supporting a *brand* font is therefore a question
 * of which package name is pinned, not new rendering machinery: Fontsource
 * publishes well over a thousand OFL/Apache/MIT families through one package
 * convention and one file layout, and `@fontsource-variable/inter` is already a
 * pinned dependency.
 *
 * Kept pure and separate from the reader so the derivation — which is the part
 * that silently returned nothing before — is testable with system Node alone.
 */

/** Axis files a variable package may ship, in the order we prefer them. */
const AXIS_PREFERENCE = ['wght', 'opsz', 'standard', 'full'];

/**
 * Family name -> Fontsource package slug.
 *
 * Fontsource slugs are lowercase with hyphens for every run of non-alphanumerics,
 * so `Source Serif 4` is `source-serif-4` and `IBM Plex Sans` is `ibm-plex-sans`.
 * Apostrophes are dropped rather than hyphenated, matching the registry.
 */
export function fontsourceSlug(family) {
  return String(family ?? '')
    .trim()
    .toLowerCase()
    .replace(/['\u2019]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Candidate packages for a family, variable first.
 *
 * Variable leads because one file covers the whole weight range, which is what
 * lets the emitted `@font-face` declare `font-weight:100 900` and lets the
 * layouts use 400 through 800 without a second request. The static package is
 * the fallback for families Fontsource publishes no variable build of.
 */
export function fontsourcePackages(family) {
  const slug = fontsourceSlug(family);
  if (!slug) return [];
  return [
    { pkg: `@fontsource-variable/${slug}`, slug, kind: 'variable' },
    { pkg: `@fontsource/${slug}`, slug, kind: 'static' },
  ];
}

/**
 * Pick the file to embed from a package's `files/` listing.
 *
 * Returns `{ file, axis, weight }`, or null when the package ships nothing this
 * renderer can use. Null is a *reported* outcome, never a silent one: the
 * previous single-regex match for `-latin-wght-normal.woff2` returned undefined
 * for any family that is variable on a non-weight axis — `@fontsource-variable`
 * packages also ship `opsz` and `standard` builds — and the caller then embedded
 * nothing and rendered with whatever the machine happened to have.
 *
 * Latin-only by design: the subset files are per-script, and embedding every
 * subset would multiply the base64 payload of every slide for glyphs the deck
 * does not use. A non-Latin brand is a reported gap rather than a silent one.
 */
export function fontsourceFile(family, files = []) {
  const slug = fontsourceSlug(family);
  if (!slug || !Array.isArray(files) || files.length === 0) return null;
  const present = new Set(files);

  for (const axis of AXIS_PREFERENCE) {
    const file = `${slug}-latin-${axis}-normal.woff2`;
    if (present.has(file)) return { file, axis, weight: '100 900' };
  }

  // Static packages name one file per weight. 400 is the body weight the
  // layouts assume; anything else is a degradation the caller reports, so the
  // nearest available weight is better than nothing.
  const weights = [];
  const staticFile = new RegExp(`^${slug}-latin-(\\d{3})-normal\\.woff2$`);
  for (const f of files) {
    const m = staticFile.exec(f);
    if (m) weights.push({ file: f, weight: Number(m[1]) });
  }
  if (weights.length) {
    weights.sort((a, b) => Math.abs(a.weight - 400) - Math.abs(b.weight - 400) || a.weight - b.weight);
    const best = weights[0];
    return { file: best.file, axis: 'static', weight: String(best.weight) };
  }

  return null;
}

/**
 * The `@font-face` rule for one embedded file.
 *
 * `font-display:block` rather than `swap`: a screenshot taken during a swap
 * period would capture the fallback, which is a silently wrong render rather
 * than a slow one.
 *
 * The family is stripped of CSS punctuation because it is interpolated into a
 * quoted declaration and originates in a project-authored file.
 */
export function fontFaceCss({ family, base64, weight = '100 900' }) {
  const safe = cssFamilyName(family);
  if (!safe || !base64) return '';
  return `@font-face{font-family:'${safe}';font-style:normal;font-weight:${weight};font-display:block;
src:url(data:font/woff2;base64,${base64}) format('woff2')}`;
}

/** A family name safe to interpolate into a quoted CSS declaration. */
export function cssFamilyName(family) {
  return String(family ?? '')
    .replace(/['"\\;{}<>]/g, '')
    .trim();
}
