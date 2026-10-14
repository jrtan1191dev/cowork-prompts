/**
 * presentation-producer :: brand extraction (pure)
 *
 * Turns a live application's *computed* CSS custom properties into a conformant
 * design.md file, so a deck can be rendered in the product's own palette.
 *
 * Extraction, not source parsing (see phase-2-plan.md D2). One
 * getComputedStyle(document.documentElement) in the browser resolves every
 * custom property after the build, so this is identical for shadcn CSS
 * variables, Tailwind v4 @theme, plain CSS and CSS-in-JS — it reads what
 * actually rendered. The browser call, the two colour-scheme passes and the
 * writeFileSync live in deck.mjs; this module is PURE so the tier-1 suite runs
 * with system Node and no install.
 *
 * No colour maths anywhere. Values arrive as oklch()/rgb() strings and are
 * emitted verbatim: a nudged brand is not the brand, which defeats the fidelity
 * that is the entire point of extracting from a real product.
 */

// ---------------------------------------------------------------------------
// The application-name -> design.md-token mapping.
//
// This is the INVERSE of references/design-token.md. That file maps design.md
// token paths to the deck's variables; here we must decide, for a raw app
// custom property, which design.md colour KEY to emit it under so that the
// renderer's mapping then lands it on the right variable.
//
// The single most important trap (phase-2-plan.md, and the "--primary trap"
// section of design-token.md): an app's `--primary` is almost always its ACTION
// colour, while the deck's `--primary` is INK. So a shadcn `--foreground` (ink)
// must be emitted under an ink-named key in --primary's chain, and the app's
// `--primary` must be emitted under a key in --accent-1's chain
// (tertiary/accent/brand/action) — never under `colors.primary`, which would
// paint every headline in the app's button colour.
//
// Each row: the design.md key we emit, and the ordered list of raw app custom
// property names (without the leading `--`) we accept for it, most specific
// first. Order across rows matters only in that an app property is claimed by
// the first row that lists it, so ink names are matched before the ambiguous
// `primary`, and `primary` is deliberately claimed by the accent row.
// ---------------------------------------------------------------------------

const COLOUR_MAP = [
  // Ink. shadcn `--foreground`, Material `--on-surface`, design.md `ink`.
  // Claims `foreground`/`on-surface` BEFORE the accent row can see `primary`.
  { key: 'on-surface', from: ['foreground', 'on-surface', 'on-background', 'ink', 'text'] },
  // Muted / supporting text.
  { key: 'on-surface-variant', from: ['muted-foreground', 'on-surface-variant', 'secondary-foreground'] },
  // Page background.
  { key: 'background', from: ['background', 'bg', 'neutral', 'base'] },
  // Raised card surface.
  { key: 'surface', from: ['card', 'surface', 'popover', 'elevated'] },
  // Secondary card surface.
  { key: 'surface-variant', from: ['muted', 'surface-variant', 'surface-alt', 'card-alt', 'accent'] },
  // The brand ACTION colour. This is where a shadcn `--primary` belongs: it
  // becomes the deck's --accent-1, NOT its ink. `accent` is intentionally also
  // listed on surface-variant above; whichever row claims it first wins, and
  // surface-variant is the more common shadcn meaning of `--accent`.
  { key: 'tertiary', from: ['primary', 'accent-foreground', 'brand', 'action', 'ring'] },
  // Hairline dividers / outlines.
  { key: 'outline', from: ['border', 'outline', 'divider', 'input'] },
];

/**
 * The design.md key an app property lands under, or undefined.
 *
 * Returned so deck.mjs can build the audit trail (which raw property fed which
 * key), and so the accent trap is auditable rather than buried.
 */
function classify(rawName) {
  for (const row of COLOUR_MAP) {
    if (row.from.includes(rawName)) return { key: row.key, from: rawName };
  }
  return undefined;
}

/**
 * Normalise a computed-property bag to plain names.
 *
 * getComputedStyle yields keys like `--primary`; callers may also pass plain
 * `primary`. Strip the leading `--` and drop empty strings, which is what an
 * undefined custom property resolves to and must not be mistaken for a value.
 */
function normaliseProps(props) {
  const out = {};
  for (const [name, value] of Object.entries(props ?? {})) {
    const key = String(name).replace(/^--/, '').trim();
    const v = typeof value === 'string' ? value.trim() : value;
    if (key && v !== '' && v != null) out[key] = String(v).trim();
  }
  return out;
}

/**
 * A colour value with CSS punctuation cannot be trusted into a YAML string that
 * is later interpolated into a declaration. Mirrors design-md's
 * isPlausibleColour so a value this extractor emits will not later be dropped
 * by parseBrand — emitting something the reader rejects would be a silent loss.
 */
function usableColour(value) {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (!v) return false;
  return !/[;{}<>'"\\]/.test(v);
}

/** YAML-safe single-line string. Colours carry no special chars once checked. */
function q(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

// ---------------------------------------------------------------------------
// Extraction
// ---------------------------------------------------------------------------

/**
 * Map one theme's computed properties to a design.md brand object plus an audit.
 *
 * @param {object} input
 * @param {Record<string,string>} input.props   computed custom properties, keyed
 *   `--name` or `name`, values verbatim (oklch/rgb/hex strings)
 * @param {string|null} [input.fontFamily]      computed body font-family stack
 * @param {string|null} [input.bodyFontSize]    computed body font-size, e.g. '16px'
 * @param {string|null} [input.h1FontSize]      computed h1 font-size
 * @param {string|null} [input.radius]          computed border-radius, e.g. '8px'
 * @returns {{
 *   colors: Record<string,string>,
 *   typography: object,
 *   rounded: string|null,
 *   omitted: string[],
 *   audit: Array<{ token:string, source:string }>,
 *   missing: string[],
 * }}
 */
export function extractBrand({ props, fontFamily = null, bodyFontSize = null, h1FontSize = null, radius = null } = {}) {
  const bag = normaliseProps(props);
  const colors = {};
  const audit = [];
  const claimedKeys = new Set();

  // Walk the map in row order so the first row that lists a property claims it —
  // this is what keeps ink ahead of the ambiguous `primary` and routes `primary`
  // to the accent key rather than to ink.
  for (const row of COLOUR_MAP) {
    if (colors[row.key] !== undefined) continue; // one app property per key
    for (const rawName of row.from) {
      if (claimedKeys.has(rawName)) continue;
      const value = bag[rawName];
      if (value === undefined || !usableColour(value)) continue;
      colors[row.key] = value;
      claimedKeys.add(rawName);
      audit.push({ token: `colors.${row.key}`, source: `--${rawName}` });
      break;
    }
  }

  const typography = {};
  const body = {};
  if (fontFamily && usableColour(fontFamily)) body.fontFamily = fontFamily.trim();
  if (bodyFontSize) body.fontSize = bodyFontSize.trim();
  if (Object.keys(body).length) {
    typography.body = body;
    if (body.fontFamily) audit.push({ token: 'typography.body.fontFamily', source: 'getComputedStyle(body).font-family' });
    if (body.fontSize) audit.push({ token: 'typography.body.fontSize', source: 'getComputedStyle(body).font-size' });
  }
  if (h1FontSize) {
    typography.h1 = { fontSize: h1FontSize.trim() };
    audit.push({ token: 'typography.h1.fontSize', source: 'getComputedStyle(h1).font-size' });
  }

  const rounded = radius && radius.trim() ? radius.trim() : null;
  if (rounded) audit.push({ token: 'rounded', source: 'getComputedStyle(a rounded element).border-radius' });

  // Report every gap. Non-negotiable 7: never apply a substitution or omission
  // silently. `omitted` is the design.md field the reader honours; `missing` is
  // the fuller human list for the prose body and the console.
  const missing = [];
  const expectedKeys = ['background', 'surface', 'on-surface', 'tertiary', 'outline'];
  for (const key of expectedKeys) {
    if (colors[key] === undefined) missing.push(`colors.${key} (no matching app custom property found)`);
  }
  if (!body.fontFamily) missing.push('typography.body.fontFamily (no computed body font-family)');
  if (!body.fontSize) missing.push('typography.body.fontSize (no computed body font-size)');
  if (!typography.h1) missing.push('typography.h1.fontSize (no computed h1 font-size)');
  if (!rounded) missing.push('rounded (no computed border-radius)');

  // Elevation cannot be extracted into a conformant file: design.md's Elevation
  // & Depth section is prose with no token subsection. Recorded as data, not an
  // oversight — the same treatment design-token.md gives --shadow.
  const omitted = ['spacing', 'elevation'];

  return { colors, typography, rounded, omitted, audit, missing };
}

// ---------------------------------------------------------------------------
// Serialisation to a standalone design.md
// ---------------------------------------------------------------------------

/** design.md frontmatter TEXT for one extracted theme. No YAML dependency. */
export function toFrontmatter({ colors, typography, rounded, omitted, name, description, version = '1.0.0' }) {
  const lines = ['---'];
  lines.push(`version: ${version}`);
  lines.push(`name: ${q(name)}`);
  // Block scalar keeps a multi-line description conformant without escaping.
  lines.push('description: >');
  for (const chunk of String(description).split('\n')) lines.push(`  ${chunk}`);

  lines.push('colors:');
  for (const [key, value] of Object.entries(colors)) lines.push(`  ${key}: ${q(value)}`);

  if (typography && Object.keys(typography).length) {
    lines.push('typography:');
    for (const [level, spec] of Object.entries(typography)) {
      lines.push(`  ${level}:`);
      for (const [prop, value] of Object.entries(spec)) lines.push(`    ${prop}: ${q(value)}`);
    }
  }

  if (rounded) lines.push(`rounded: ${q(rounded)}`);

  if (omitted && omitted.length) {
    lines.push('omitted:');
    for (const item of omitted) lines.push(`  - ${item}`);
  }

  lines.push('---');
  return lines.join('\n') + '\n';
}

/**
 * The prose body. Records WHERE each value came from so a human can audit the
 * extraction, and states the accent-vs-ink reasoning explicitly because getting
 * it wrong is the single most damaging failure in this deliverable.
 */
export function toBody({ audit, missing, theme, url }) {
  const lines = [];
  const themeLabel = theme === 'dark' ? 'dark' : 'light';
  lines.push(`# Extracted brand (${themeLabel})`);
  lines.push('');
  lines.push(
    `Extracted from the computed CSS custom properties of ${url ?? 'the target application'} ` +
      `(${themeLabel} colour scheme). Values are copied verbatim — no colour maths is applied, so this ` +
      'is the product\'s own palette, not an approximation.'
  );
  lines.push('');

  lines.push('## Brand & Style');
  lines.push('');
  lines.push(
    "The app's action colour is mapped to this deck's accent (`colors.tertiary`), NOT to ink. " +
      "This deck's `--primary` is ink; a headline painted in the app's button colour would be the " +
      'most common extraction failure, so the mapping routes an app `--primary`/`--brand` to the ' +
      'accent chain and an app `--foreground`/`--on-surface` to the ink key (`colors.on-surface`).'
  );
  lines.push('');

  lines.push('## Colors');
  lines.push('');
  lines.push('Each token records the source custom property it was read from:');
  lines.push('');
  for (const row of audit.filter((a) => a.token.startsWith('colors.'))) {
    lines.push(`- \`${row.token}\` <- \`${row.source}\``);
  }
  lines.push('');

  lines.push('## Typography');
  lines.push('');
  const typeAudit = audit.filter((a) => a.token.startsWith('typography.') || a.token === 'rounded');
  if (typeAudit.length) {
    for (const row of typeAudit) lines.push(`- \`${row.token}\` <- \`${row.source}\``);
  } else {
    lines.push('No typography could be read from the computed styles.');
  }
  lines.push('');

  lines.push('## Elevation & Depth');
  lines.push('');
  lines.push(
    'Not extracted. design.md has no token subsection for elevation, so shadows cannot be expressed ' +
      'in a conformant file; the deck uses its built-in elevation.'
  );
  lines.push('');

  lines.push("## Do's and Don'ts");
  lines.push('');
  if (missing.length) {
    lines.push('The following could not be found and fall back to the deck built-ins — review before use:');
    lines.push('');
    for (const item of missing) lines.push(`- ${item}`);
  } else {
    lines.push('Every expected token was found in the computed styles.');
  }
  lines.push('');

  return lines.join('\n');
}

/**
 * One theme in, a complete standalone design.md string out, plus the gap list.
 *
 * The two files (DESIGN.md light, DESIGN.dark.md dark) are each strictly valid
 * standalone design.md documents: design.md has no dual-mode concept, so a
 * `dark:` block would forfeit the portability that is the whole reason for the
 * format. deck.mjs runs this once per colour-scheme pass and writes each result.
 */
export function buildDesignMd({ props, fontFamily, bodyFontSize, h1FontSize, radius, theme = 'light', url = null, name = null }) {
  const extracted = extractBrand({ props, fontFamily, bodyFontSize, h1FontSize, radius });
  const themeLabel = theme === 'dark' ? 'Dark' : 'Light';
  const brandName = name ?? `Extracted ${themeLabel}`;
  const description =
    `Brand extracted from the computed styles of ${url ?? 'a live application'} ` +
    `(${theme} colour scheme). Values copied verbatim, no colour maths.`;

  const frontmatter = toFrontmatter({
    colors: extracted.colors,
    typography: extracted.typography,
    rounded: extracted.rounded,
    omitted: extracted.omitted,
    name: brandName,
    description,
  });
  const body = toBody({ audit: extracted.audit, missing: extracted.missing, theme, url });

  return {
    text: frontmatter + '\n' + body,
    audit: extracted.audit,
    missing: extracted.missing,
    colors: extracted.colors,
  };
}
