/**
 * presentation-producer :: design.md brand layer (pure)
 *
 * Turns an authored `DESIGN.md` into the CSS custom properties the deck
 * renders with, using the normative mapping in references/design-token.md.
 *
 * Dependency-free and disk-free on purpose. YAML has no parser in Node, so the
 * caller loads the pinned `yaml` from `.runtime` and hands this module plain
 * objects — the same injection pattern that keeps deck-html.mjs pure and lets
 * the whole tier-1 suite run with the system node and no install.
 *
 * Design decisions encoded here (see hand-off-plan.md):
 *   D1  DESIGN.md frontmatter is the authored IR; the CSS variables are the
 *       render contract; this file is the mapping between them
 *   D13 tolerant at parse, floored at render: unknown content is preserved per
 *       design.md's published consumer-behaviour table, but every variable the
 *       renderer needs must resolve, and anything landing on a built-in is
 *       reported rather than silently defaulted
 */

// ---------------------------------------------------------------------------
// Frontmatter splitting
// ---------------------------------------------------------------------------

/** design.md's eight ordered sections, normalised for duplicate detection. */
export const DESIGN_SECTIONS = [
  'overview',
  'colors',
  'typography',
  'layout',
  'elevation & depth',
  'shapes',
  'components',
  "do's and don'ts",
];

/** `Brand & Style` is the spec's accepted alias for `Overview`. */
const SECTION_ALIASES = new Map([['brand & style', 'overview']]);

/**
 * Split a design.md file into its frontmatter text and its markdown body.
 *
 * Frontmatter is optional per the spec: a file that is pure prose is valid and
 * simply carries no tokens. Returns the raw frontmatter string rather than a
 * parsed object so this module stays free of a YAML dependency.
 */
export function splitFrontmatter(text) {
  const src = String(text ?? '');
  // Tolerate a leading BOM and CRLF line endings: a brand file authored on
  // Windows must parse identically to one authored on macOS.
  const clean = src.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  if (!clean.startsWith('---\n')) return { frontmatter: null, body: clean };
  const end = clean.indexOf('\n---', 3);
  if (end === -1) return { frontmatter: null, body: clean };
  return {
    frontmatter: clean.slice(4, end + 1),
    body: clean.slice(end + 4).replace(/^\n/, ''),
  };
}

/**
 * Collect `##` headings from a markdown body, normalised.
 *
 * Used for the one parse-time error the spec mandates: a duplicate section
 * heading rejects the file, because two `## Colors` sections make "which one
 * wins" a coin toss.
 */
export function sectionHeadings(body) {
  const out = [];
  for (const line of String(body ?? '').split('\n')) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const name = m[1].toLowerCase().replace(/\s+/g, ' ').trim();
    out.push(SECTION_ALIASES.get(name) ?? name);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Token reference resolution
// ---------------------------------------------------------------------------

const REF = /^\{([a-zA-Z0-9_.-]+)\}$/;

/** Read `a.b.c` out of a nested object. */
function at(obj, dotted) {
  return String(dotted).split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

/**
 * Resolve design.md's `{path.to.token}` indirection.
 *
 * Chases chains so `{colors.accent}` pointing at `{colors.brand}` works, with a
 * depth cap because a file may legitimately be malformed and a self-reference
 * must not hang the build.
 */
export function deref(value, root, depth = 0) {
  if (typeof value !== 'string' || depth > 8) return value;
  const m = REF.exec(value.trim());
  if (!m) return value;
  return deref(at(root, m[1]), root, depth + 1);
}

/**
 * Syntactic plausibility check for a colour value.
 *
 * Deliberately permissive. design.md allows hex, named colours, rgb/hsl/hwb,
 * oklch/oklab/lch/lab and color-mix, and new CSS colour spaces keep arriving;
 * the real validator is the browser, which resolves every one of them to sRGB
 * when contrast is measured. So this rejects only values that cannot be a
 * colour at all — empty, or carrying CSS punctuation that would break out of
 * the declaration it is interpolated into.
 */
export function isPlausibleColour(value) {
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (!v) return false;
  if (/[;{}<>]/.test(v)) return false;
  return true;
}

// ---------------------------------------------------------------------------
// Parse
// ---------------------------------------------------------------------------

/**
 * Validate and normalise a parsed design.md file.
 *
 * Implements the spec's "Consumer Behavior for Unknown Content" table exactly:
 * unknown sections and token names are preserved, an unknown component
 * property warns, and a duplicate section heading is the single fatal parse
 * error. Being tolerant here is what makes a third-party DESIGN.md usable at
 * all, and portability is the entire reason this format was chosen — refusing a
 * file that is valid per its own spec would defeat the point.
 */
export function parseBrand({ frontmatter = null, body = '' } = {}) {
  const warnings = [];
  const errors = [];

  const seen = new Set();
  for (const name of sectionHeadings(body)) {
    if (seen.has(name)) errors.push(`duplicate section heading "${name}" — the spec rejects the file`);
    seen.add(name);
    if (!DESIGN_SECTIONS.includes(name)) {
      // Preserved, not an error: the spec explicitly allows extra sections.
      warnings.push(`unknown section "${name}" preserved and ignored`);
    }
  }

  const fm = frontmatter && typeof frontmatter === 'object' ? frontmatter : {};
  const omitted = new Set(
    Array.isArray(fm.omitted) ? fm.omitted.map((s) => String(s).toLowerCase()) : []
  );

  const colors = {};
  for (const [name, raw] of Object.entries(fm.colors ?? {})) {
    const value = deref(raw, fm);
    if (isPlausibleColour(value)) colors[name] = String(value).trim();
    else warnings.push(`colour "${name}" dropped: ${JSON.stringify(raw)} is not a usable colour value`);
  }

  const typography = {};
  for (const [level, spec] of Object.entries(fm.typography ?? {})) {
    if (!spec || typeof spec !== 'object') {
      warnings.push(`typography "${level}" ignored: expected a map of properties`);
      continue;
    }
    const entry = {};
    for (const [prop, raw] of Object.entries(spec)) entry[prop] = deref(raw, fm);
    typography[level] = entry;
  }

  // Parsed, preserved, never consumed. Recorded so a future reader sees the
  // decision rather than an omission: the deck has no buttons, chips or
  // inputs, and wiring components.button-primary into .pill would reintroduce
  // the --primary/ink confusion from a new direction.
  const components = {};
  for (const [name, spec] of Object.entries(fm.components ?? {})) {
    if (!spec || typeof spec !== 'object') {
      warnings.push(`component "${name}" ignored: expected a map of properties`);
      continue;
    }
    components[name] = { ...spec };
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    brand: {
      version: fm.version ?? null,
      name: fm.name ?? null,
      description: fm.description ?? null,
      colors,
      typography,
      rounded: fm.rounded ?? null,
      spacing: fm.spacing ?? null,
      components,
      omitted: [...omitted],
      body,
    },
  };
}

// ---------------------------------------------------------------------------
// Resolve against the mapping
// ---------------------------------------------------------------------------

/** Read one mapped source path (`colors.tertiary`) out of a parsed brand. */
function fromBrand(brand, dotted) {
  const value = at(brand, dotted);
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/**
 * Resolve the CSS custom properties for one theme.
 *
 * Returns the token object plus a full account of what happened: which
 * variables took a brand value, which fell back to a built-in, and which the
 * brand cannot express at all. Nothing is silently defaulted — a partial brand
 * file must produce a working deck AND an exact statement of what was branded,
 * because a deck that is 60% branded with no report reads as a rendering bug.
 */
export function resolveTokens({ brand, mapping, theme = 'light' }) {
  const vars = mapping?.variables ?? {};
  const tokens = {};
  const substitutions = [];
  const omissions = [];
  const sources = {};

  for (const [name, spec] of Object.entries(vars)) {
    const chain = Array.isArray(spec.sources) ? spec.sources : [];
    let hit;
    let hitPath;
    for (const dotted of chain) {
      const value = brand ? fromBrand(brand, dotted) : undefined;
      if (value !== undefined) {
        hit = value;
        hitPath = dotted;
        break;
      }
    }

    if (hit === undefined && spec.inherits && tokens[spec.inherits] !== undefined) {
      // Cohesion over completeness: a brand declaring one surface should get a
      // coherent deck, not one branded card beside one slate card.
      const inheritedFromBrand = sources[spec.inherits]?.origin === 'brand';
      if (inheritedFromBrand) {
        tokens[name] = tokens[spec.inherits];
        sources[name] = { origin: 'inherited', from: spec.inherits };
        continue;
      }
    }

    if (hit !== undefined) {
      tokens[name] = hit;
      sources[name] = { origin: 'brand', path: hitPath };
      continue;
    }

    const builtin = spec.builtin?.[theme] ?? spec.builtin?.light;
    tokens[name] = builtin;
    sources[name] = { origin: 'builtin' };
    // Both reports are conditional on a brand having been asked for. With no
    // brand the built-ins are simply the theme, which is the skill's
    // pre-existing behaviour and not a degradation — reporting it would train
    // people to ignore the report.
    if (!brand) continue;
    if (spec.omitted) {
      // A gap in the format itself, not in this brand file. Reported once as a
      // known limitation so it never reads as a missing token.
      omissions.push({ variable: name, reason: 'design.md cannot express this' });
    } else {
      substitutions.push({ variable: name, tried: chain, used: builtin });
    }
  }

  return { tokens, substitutions, omissions, sources };
}

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

/** Parse a design.md Dimension (`18px`, `1.125rem`, `1.5em`) into px. */
export function dimensionToPx(value, rootPx = 16) {
  if (typeof value === 'number') return value;
  const m = /^\s*(-?[\d.]+)\s*(px|rem|em)?\s*$/.exec(String(value ?? ''));
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return null;
  const unit = m[2] ?? 'px';
  return unit === 'px' ? n : n * rootPx;
}

/**
 * Convert brand type into canvas pixel sizes.
 *
 * The brand sets how dominant headings are; the canvas keeps owning absolute
 * pixels. One multiplier is derived from the brand's h1:body ratio measured
 * against the canvas's own title:body ratio, and applied to heading levels
 * only, so the canvas's relationships between heading levels survive — an
 * earlier per-level formulation collapsed `title` and `hero-title` onto one
 * size because both derive from `h1`.
 *
 * Body copy is never scaled. A brand's 16px body is authored for a scrolling
 * page; on a 1920x1080 canvas read from across a room it is simply wrong, and
 * the canvas sizes were chosen for that viewing distance.
 *
 * The multiplier is clamped narrowly because overflow is a hard failure: a wide
 * bound would turn "adopt a brand" into "rewrite approved copy". Hitting the
 * bound is reported.
 */
export function resolveTypeScale({ brand, mapping }) {
  const spec = mapping?.typography ?? {};
  const clamp = spec.clamp ?? { min: 0.85, max: 1.15 };
  const scaled = spec.scaled ?? {};
  const fixed = spec.fixed ?? {};
  const notes = [];
  const scale = { ...fixed };

  const dom = spec.headingDominance ?? {};
  const basePx = dimensionToPx(at(brand, spec.base ?? ''));
  const headingPx = dimensionToPx(at(brand, dom.source ?? ''));
  const canvasHeading = Number(dom.canvasHeading) || 64;
  const canvasBody = Number(dom.canvasBody) || 28;

  let multiplier = 1;
  if (basePx && headingPx && canvasHeading && canvasBody) {
    const brandRatio = headingPx / basePx;
    const canvasRatio = canvasHeading / canvasBody;
    const raw = brandRatio / canvasRatio;
    multiplier = Math.min(clamp.max, Math.max(clamp.min, raw));
    if (multiplier !== raw) {
      notes.push({
        level: 'headings',
        requested: Number(raw.toFixed(3)),
        applied: multiplier,
        reason: raw > multiplier ? 'clamped: larger headings risk overflow' : 'clamped: smaller headings would flatten the hierarchy',
      });
    }
  } else if (brand) {
    notes.push({
      level: 'headings',
      requested: null,
      applied: 1,
      reason: 'brand declares no h1/body size pair, so canvas hierarchy is kept',
    });
  }

  for (const [level, canvas] of Object.entries(scaled)) {
    scale[level] = Math.round(Number(canvas) * multiplier);
  }

  const family = resolveFontFamily({ brand, mapping });
  return { scale, family, notes, multiplier };
}

/** Resolve the brand's body font family, or the bundled default. */
export function resolveFontFamily({ brand, mapping }) {
  const spec = mapping?.typography?.fontFamily ?? {};
  for (const dotted of spec.sources ?? []) {
    const value = at(brand, dotted);
    if (typeof value === 'string' && value.trim()) {
      // design.md allows a full CSS font stack; the deck embeds one family, so
      // take the first and let the stack's own fallbacks apply in CSS.
      const first = value.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
      // The name is interpolated into a quoted CSS declaration and comes from a
      // project-authored file, so anything carrying CSS punctuation is refused
      // rather than sanitised: a silently altered family name would report as
      // branded while rendering something else.
      if (first && !/[;{}<>'"\\]/.test(first)) return first;
    }
  }
  return spec.builtin ?? 'Inter';
}

/**
 * Literal typography pass-throughs: weight, tracking, leading.
 *
 * These change the brand's voice without changing the box, so unlike size they
 * need no clamping.
 */
export function resolvePassthrough({ brand, mapping }) {
  const out = {};
  const table = mapping?.typography?.passthrough ?? {};
  const CSS_PROP = {
    fontWeight: 'font-weight',
    letterSpacing: 'letter-spacing',
    lineHeight: 'line-height',
    fontFeature: 'font-feature-settings',
    fontVariation: 'font-variation-settings',
  };
  const LEVEL_SOURCE = { title: 'h1', body: 'body', 'card-title': 'h3' };
  for (const [level, props] of Object.entries(table)) {
    const src = at(brand, `typography.${LEVEL_SOURCE[level] ?? level}`);
    if (!src || typeof src !== 'object') continue;
    const decls = {};
    for (const prop of props) {
      if (src[prop] === undefined || src[prop] === null) continue;
      const cssProp = CSS_PROP[prop];
      if (cssProp) decls[cssProp] = String(src[prop]);
    }
    if (Object.keys(decls).length) out[level] = decls;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Whole-brand resolution
// ---------------------------------------------------------------------------

/**
 * One call from parsed file to everything the renderer needs.
 *
 * `theme` selects which built-in fills a gap; the brand file itself is a single
 * palette, because design.md has no light/dark duality. Dark mode is a second
 * conformant file, not a mode inside one.
 */
export function resolveBrand({ brand, mapping, theme = 'light' }) {
  const { tokens, substitutions, omissions, sources } = resolveTokens({ brand, mapping, theme });
  const type = resolveTypeScale({ brand, mapping });
  const passthrough = resolvePassthrough({ brand, mapping });

  // `rounded` is the one non-colour token the layouts can honour directly.
  const radius = brand?.rounded
    ? dimensionToPx(typeof brand.rounded === 'object' ? Object.values(brand.rounded)[0] : brand.rounded)
    : null;

  return {
    tokens,
    fontFamily: type.family,
    typeScale: type.scale,
    typeNotes: type.notes,
    passthrough,
    radius: Number.isFinite(radius) ? radius : null,
    substitutions,
    omissions,
    sources,
    name: brand?.name ?? null,
  };
}

/**
 * The part of a resolved brand that changes pixels.
 *
 * Fed into the slide cache key so editing a brand re-renders. Deliberately
 * excludes the brand's name, description and prose: renaming a brand file must
 * not invalidate 154 cached PNGs.
 */
export function brandFingerprint(resolved) {
  if (!resolved) return null;
  return {
    tokens: resolved.tokens,
    fontFamily: resolved.fontFamily,
    typeScale: resolved.typeScale,
    passthrough: resolved.passthrough,
    radius: resolved.radius,
  };
}

/** Human-readable report lines, in the shape the other stages already use. */
export function brandReport(resolved, { file = null } = {}) {
  const lines = [];
  if (!resolved) return lines;
  const branded = Object.entries(resolved.sources).filter(([, s]) => s.origin === 'brand').length;
  const total = Object.keys(resolved.sources).length;
  lines.push(`brand: ${resolved.name ?? file ?? 'unnamed'} — ${branded}/${total} variables from the brand file`);
  for (const s of resolved.substitutions) {
    lines.push(`  substituted ${s.variable}: none of ${s.tried.join(', ')} present, used built-in ${s.used}`);
  }
  for (const o of resolved.omissions) {
    lines.push(`  omitted ${o.variable}: ${o.reason}`);
  }
  for (const n of resolved.typeNotes) {
    if (n.requested == null) lines.push(`  type: ${n.reason}`);
    else lines.push(`  clamped ${n.level}: requested ${n.requested}x, applied ${n.applied}x (${n.reason})`);
  }
  return lines;
}
