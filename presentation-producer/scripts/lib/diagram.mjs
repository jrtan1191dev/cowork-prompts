/**
 * Diagrams: the `diagram:` slot, backed by the diagram-design skill.
 *
 * A diagram is DRAWN at authoring time by an agent following diagram-design
 * (https://github.com/cathrynlavery/diagram-design, MIT), then FROZEN under
 * `diagrams/` as an input — the same rule generated footage follows. A build
 * never draws, never reaches the network and never needs Python; it embeds the
 * frozen SVG and fails when the drawing no longer matches its spec.
 *
 * Everything here is pure, so it runs with system Node alone. The impure half
 * (reading frozen files, running diagram-design's self_check.py) is in
 * diagram-io.mjs.
 *
 * Why the skill is used directly rather than ported: diagram-design already
 * owns 45 type grammars, a connector rulebook and a taste gate. Re-implementing
 * any of them as native layouts would be a graph-layout engine nobody asked
 * for, and it would drift from the upstream it copied.
 */

import { digest, sha256 } from './core.mjs';

/**
 * diagram-design's visual types, by the stem of their `references/type-*.md`
 * file. The stem is the vocabulary because it is what the agent opens next, so
 * a `kind:` always names a file that exists.
 */
export const DIAGRAM_KINDS = new Set([
  'architecture', 'architecture-delta', 'it-state', 'flowchart', 'sequence', 'state', 'er',
  'timeline', 'swimlane', 'quadrant', 'radar', 'polar', 'loop', 'nested', 'tree', 'org-chart',
  'layers', 'exploded', 'axonometric-plan', 'venn', 'pyramid', 'bar', 'waterfall', 'treemap',
  'heatmap', 'line', 'gantt', 'scatter', 'high-level', 'process', 'medallion', 'data-flow',
  'dp-integration', 'dp-security-matrix', 'sankey', 'fishbone', 'wardley', 'kanban', 'journey',
  'service-blueprint', 'deployment', 'dependency', 'uml-class', 'story-map', 'db-schema',
]);

/**
 * Kinds whose claim a native layout already makes. Shape is a claim, and one
 * claim gets one implementation: two answers for "this recurs" is the duplicate
 * advice that got `bento-a` retired.
 */
export const KIND_SERVED_BY_LAYOUT = { loop: 'cycle', timeline: 'lifecycle' };

/**
 * Chart kinds: drawn from numbers in the spec, never eyeballed. A hand-placed
 * bar at 40% that should be 38% is a false claim no gate can see.
 */
export const CHART_KINDS = new Set(['bar', 'line', 'scatter', 'waterfall', 'treemap', 'heatmap', 'sankey', 'radar', 'polar']);

/**
 * Where a diagram may sit, and how many supporting cards it allows there.
 * The diagram is the slide's primary element, so it may only take a slot the
 * eye lands on first — and at most two cards support it.
 */
export const DIAGRAM_PLACEMENTS = {
  diagram: { cards: [0, 2] },
  hero: { cards: [0, 0] },
  spotlight: { cards: [2, 2] },
  'bento-b': { cards: [2, 2] },
};

/** diagram-design's motion budget: a build longer than eight steps is two diagrams. */
export const MAX_DIAGRAM_STEPS = 8;
/** diagram-design's annotation budget. */
export const MAX_ANNOTATIONS = 2;
/** diagram-design's per-diagram node budget; above it, it is probably two diagrams. */
export const NODE_BUDGET = 9;

/** Keys that are control, not content: they never enter the content hash. */
const CONTROL_KEYS = new Set(['ref', 'step', 'reason']);

/** Arrays whose members are drawn as nodes, for the budget heuristic. */
const NODE_KEYS = new Set(['nodes', 'actors', 'participants', 'lanes', 'layers', 'states', 'entities', 'components', 'stages', 'tables', 'classes', 'items', 'children', 'tasks', 'sets', 'phases', 'causes', 'zones', 'hosts']);

const DIAGRAM_WEIGHTS = new Set(['primary', 'secondary']);

/** The drawable content of a diagram block: everything but its control keys. */
export function diagramSpec(diagram) {
  if (!diagram || typeof diagram !== 'object') return null;
  return Object.fromEntries(Object.entries(diagram).filter(([k]) => !CONTROL_KEYS.has(k)));
}

/**
 * Resolve an entry's diagram to `{ id, kind, step, spec }`.
 *
 * `ref` is how a video reveal works: each step scene points at one defining
 * entry, so the drawing and its spec have one home and N frames.
 */
export function resolveDiagram(entry, entries = []) {
  const d = entry?.diagram;
  if (!d) return null;
  const source = d.ref ? entries.find((e) => e?.id === d.ref) : entry;
  const spec = diagramSpec(source?.diagram);
  if (!spec) return null;
  // The slot the drawing was sized for travels with it, because a step scene
  // reuses the defining entry's frames and must therefore share its slot.
  const placement = { layout: source.layout ?? 'diagram', cards: (source.cards ?? []).length };
  return { id: source.id, kind: spec.kind ?? null, step: d.step ?? null, placement, spec };
}

/** Walk a spec, calling `visit(key, value)` for every property at any depth. */
function walk(value, visit, key = null) {
  if (Array.isArray(value)) {
    for (const v of value) walk(v, visit, key);
    return;
  }
  if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      visit(k, v);
      walk(v, visit, k);
    }
  }
}

/** Approximate drawn node count: members of node-like arrays, at any depth. */
export function countDiagramNodes(spec) {
  let n = 0;
  walk(spec, (k, v) => {
    if (NODE_KEYS.has(k) && Array.isArray(v)) n += v.length;
  });
  return n;
}

/**
 * Validate one slide's diagram. Invariants push, heuristics warn.
 *
 * @param {object}   entry
 * @param {string}   at        path prefix for messages
 * @param {object}   ctx       { push, warn, entries }
 */
export function validateDiagram(entry, at, { push, warn, entries = [] }) {
  const layout = entry.layout;
  const d = entry.diagram;
  if (layout === 'diagram' && !d) {
    push(`${at}.diagram`, 'layout "diagram" needs a `diagram:` block');
    return;
  }
  if (!d) return;
  if (typeof d !== 'object' || Array.isArray(d)) {
    push(`${at}.diagram`, 'must be a mapping with a `kind:` (or a `ref:` to another entry\'s diagram)');
    return;
  }
  if (!DIAGRAM_PLACEMENTS[layout]) {
    push(`${at}.layout`, `a diagram fills a dominant slot, so it sits on ${Object.keys(DIAGRAM_PLACEMENTS).join('|')} — not "${layout}"`);
  }
  if (entry.stat) push(`${at}.stat`, 'a slide with a diagram has no stat — the diagram is already the primary element');
  if ((entry.cards ?? []).some((c) => c?.weight === 'primary')) {
    push(`${at}.cards`, 'a card declares weight: primary on a diagram slide — the diagram is the primary element; mark a node, message or lane `weight: primary` inside it instead');
  }

  if (d.step != null && !(Number.isInteger(d.step) && d.step >= 1 && d.step <= MAX_DIAGRAM_STEPS)) {
    push(`${at}.diagram.step`, `must be an integer 1-${MAX_DIAGRAM_STEPS} (diagram-design's motion budget) — a longer build is two diagrams`);
  }

  if (d.ref != null) {
    const target = entries.find((e) => e?.id === d.ref);
    if (!target) push(`${at}.diagram.ref`, `no entry "${d.ref}"`);
    else if (!target.diagram || target.diagram.ref) push(`${at}.diagram.ref`, `"${d.ref}" does not define a diagram (a ref must point at the entry that declares \`kind:\`)`);
    else if ((target.layout ?? 'diagram') !== layout || (target.cards ?? []).length !== (entry.cards ?? []).length) {
      push(`${at}.diagram.ref`, `a step reuses "${d.ref}"'s frames, which were drawn for its slot — use the same layout and card count ("${target.layout ?? 'diagram'}", ${(target.cards ?? []).length} cards)`);
    }
    if (Object.keys(diagramSpec(d)).length) push(`${at}.diagram`, 'a `ref:` diagram carries only `ref` and `step` — the spec lives on the defining entry');
    return;
  }

  const kind = d.kind;
  if (KIND_SERVED_BY_LAYOUT[kind]) {
    push(`${at}.diagram.kind`, `"${kind}" is the claim layout "${KIND_SERVED_BY_LAYOUT[kind]}" already makes — use that layout with cards, so one claim has one implementation`);
    return;
  }
  if (!DIAGRAM_KINDS.has(kind)) {
    push(`${at}.diagram.kind`, `unknown diagram kind "${kind}" — use a diagram-design type (its references/type-<kind>.md), e.g. sequence, swimlane, tree, layers, flowchart`);
    return;
  }
  if (CHART_KINDS.has(kind)) {
    const data = d.data;
    const empty = data == null || (Array.isArray(data) ? data.length === 0 : typeof data !== 'object' || Object.keys(data).length === 0);
    if (empty) push(`${at}.diagram.data`, `chart "${kind}" carries no data — charts are drawn from numbers in the spec, never eyeballed`);
  }

  const annotations = d.annotations ?? [];
  if (!Array.isArray(annotations)) push(`${at}.diagram.annotations`, 'must be a list');
  else if (annotations.length > MAX_ANNOTATIONS) {
    push(`${at}.diagram.annotations`, `${annotations.length} annotations — at most ${MAX_ANNOTATIONS}, or the callouts compete with the diagram`);
  }

  // The accent is editorial, not a flag: one primary and at most one secondary
  // accent. Same rule as "two primary cards is an error", in diagram vocabulary.
  const counts = { primary: 0, secondary: 0 };
  walk(diagramSpec(d), (k, v) => {
    if (k !== 'weight') return;
    if (!DIAGRAM_WEIGHTS.has(v)) push(`${at}.diagram`, `unknown weight "${v}" inside a diagram (expected primary|secondary)`);
    else counts[v] += 1;
  });
  if (counts.primary > 1) push(`${at}.diagram`, `${counts.primary} elements declare weight: primary — the accent goes on one focal element; mark exactly one`);
  if (counts.secondary > 1) push(`${at}.diagram`, `${counts.secondary} elements declare weight: secondary — at most one secondary accent per diagram`);

  const nodes = countDiagramNodes(d);
  if (nodes > NODE_BUDGET) {
    warn(at, `diagram has ~${nodes} nodes, over diagram-design's budget of ${NODE_BUDGET} — it is probably two diagrams; split it into an overview and a detail slide`);
  }
}

/**
 * Canvas pixels a diagram is DRAWN at, per placement and orientation.
 *
 * Drawn at the slot's size rather than the full canvas, so the SVG is embedded
 * at 1:1 and diagram text lands at the deck's type roles instead of being shrunk
 * to fit. Measured from the slide CSS in Chromium with a two-line assertion
 * title (the common case, and the smaller slot), rounded down to
 * diagram-design's 4px grid. A one-line title only adds room: the SVG keeps its
 * aspect, so a taller slot centres it at the same 1:1 scale. The floor check
 * measures the real result anyway.
 */
const SLOT_SIZES = {
  landscape: {
    diagram: [1744, 736], 'diagram+cards': [1176, 736], hero: [856, 904], spotlight: [1052, 736], 'bento-b': [1744, 420],
  },
  vertical: {
    diagram: [952, 1528], 'diagram+cards': [952, 1272], hero: [952, 1180], spotlight: [952, 604], 'bento-b': [952, 604],
  },
  square: {
    diagram: [904, 668], 'diagram+cards': [600, 668], hero: [436, 904], spotlight: [536, 668], 'bento-b': [904, 380],
  },
};

export function diagramCanvas(layout, orientation = 'landscape', cardCount = 0) {
  const table = SLOT_SIZES[orientation] ?? SLOT_SIZES.landscape;
  const key = layout === 'diagram' && cardCount > 0 ? 'diagram+cards' : layout;
  const [width, height] = table[key] ?? table.diagram;
  return { width, height };
}

/**
 * Which brand profile a diagram is drawn against.
 *
 * Dark is optional: with a declared light brand and no dark file, a dark slide
 * carries a LIGHT diagram (a light panel, reported) rather than an unbranded
 * one. With no brand at all, the built-ins for the slide's own theme apply.
 */
export function profileThemeFor(slideTheme, { hasLight = false, hasDark = false } = {}) {
  if (slideTheme !== 'dark') return 'light';
  if (hasDark) return 'dark';
  return hasLight ? 'light' : 'dark';
}

/**
 * A diagram-design style guide generated from the deck's resolved brand.
 *
 * One brand source: DESIGN.md -> the skill-owned token mapping -> these roles.
 * Onboarding diagram-design from a URL instead would create a second brand
 * that drifts from the deck. The TYPE scale travels too, so node names land on
 * `card-text` and labels on `card-detail` rather than diagram-design's 16px
 * presentation ramp — which is what makes the legibility floor pass by
 * construction rather than by luck.
 *
 * Font source is `system`: the slide already embeds the deck font, and inline
 * SVG text inherits it, so the drawing needs no Google Fonts request.
 */
export function diagramProfile({ tokens, typeScale = {}, fontFamily = 'Inter', theme = 'light', source = 'built-in palette' }) {
  const t = (k, fallback) => tokens?.[k] ?? fallback;
  const size = (k, fallback) => Math.round(typeScale?.[k] ?? fallback);
  const accent = t('--accent-1', '#10B981');
  const rows = [
    ['paper', 'Page background, default node fill', t('--bg', '#F1F5F9')],
    ['paper-2', 'Container bg, secondary fill', t('--card-alt', '#F8FAFC')],
    ['ink', 'Primary text, primary stroke', t('--primary', '#0F172A')],
    ['ink-strong', 'Text on accent fills', t('--primary', '#0F172A')],
    ['muted', 'Secondary text, default arrow stroke', t('--secondary', '#64748B')],
    ['soft', 'Sublabels, boundary labels', t('--secondary', '#64748B')],
    ['rule', 'Hairline borders', t('--rule', '#E2E8F0')],
    ['rule-solid', 'Stronger borders, baselines', t('--rule', '#E2E8F0')],
    ['accent', 'Focal: the element declared weight: primary (1-2 max)', accent],
    ['accent-tint', 'Fill for accent-bordered boxes', `color-mix(in srgb, ${accent} 12%, transparent)`],
    ['link', 'HTTP/API calls, external arrows', t('--secondary', '#64748B')],
  ];
  const nodeName = size('card-text', 24);
  const label = size('card-detail', 19);
  const title = size('card-title', 34);
  const lines = [
    '<!-- diagram-design-profile',
    `name: presentation-producer (${theme})`,
    `slug: presentation-producer-${theme}`,
    'source-url: none',
    `notes: GENERATED from ${source} by presentation-producer. Do not edit; regenerate by compiling the presentation.`,
    '-->',
    '# Style Guide',
    '',
    'Generated for a presentation-producer slide. Use this as the effective style guide (diagram-design onboarding option: local design system) — never the installed default and never a URL onboarding.',
    '',
    '## Tokens',
    '',
    '### Semantic roles',
    '',
    `| Role | Purpose | Default (${theme}) |`,
    '|---|---|---|',
    ...rows.map(([role, purpose, value]) => `| \`${role}\` | ${purpose} | \`${value}\` |`),
    '',
    '## Typography',
    '',
    'Sizes are slide canvas pixels at the drawn size, not diagram-design\'s doc ramp. Do not shrink type to fit: cut nodes or split the diagram.',
    '',
    '| Role | Family | Size | Weight | Usage |',
    '|---|---|---|---|---|',
    `| \`title\` | ${fontFamily} | ${title}px | 700 | Group or entity heading only — the slide title is the diagram title |`,
    `| \`node-name\` | ${fontFamily} | ${nodeName}px | 600 | Human-readable labels |`,
    // Sublabels are mixed case, so they take the body floor, not the all-caps
    // card-detail size: a 19px mixed-case run fails a 24px screen floor.
    `| \`sublabel\` | ui-monospace | ${nodeName}px | 400 | Port, protocol, URL, field type (mixed case) |`,
    `| \`eyebrow\` | ui-monospace | ${label}px | 500, tracked 0.12em, UPPERCASE ONLY | Type tags, axis labels, index numbers |`,
    `| \`arrow-label\` | ui-monospace | ${label}px | 500, UPPERCASE ONLY | Arrow annotations |`,
    `| \`callout\` | ${fontFamily} *italic* | ${nodeName}px | 400 | Annotation callouts (max ${MAX_ANNOTATIONS}) |`,
    '',
    '### Font source',
    '',
    'Font source: `system`',
    '',
    `The slide embeds ${fontFamily}; inline SVG text inherits it. Emit no font link.`,
    '',
  ];
  return lines.join('\n');
}

/**
 * The content hash a frozen diagram must carry to be current.
 *
 * Covers the spec, the brand profile and the drawn size — the three inputs that
 * change what the drawing should say or look like. The diagram-design version is
 * recorded in provenance but deliberately NOT hashed: hashing it would make
 * every skill update invalidate every deck, punishing the act of updating.
 */
export function diagramHash({ spec, profileText, size }) {
  return digest({ kind: 'diagram', spec, profile: sha256(String(profileText ?? '')), size }, 16);
}

/** Relative paths of a diagram's frozen files, per orientation and step. */
export function diagramFiles(id, orientation = 'landscape', step = null) {
  const o = orientation === 'landscape' ? '' : `.${orientation}`;
  const s = step ? `.step-${step}` : '';
  return {
    svg: `diagrams/${id}${o}${s}.svg`,
    html: `diagrams/${id}${o}${s}.html`,
    provenance: `diagrams/${id}.provenance.json`,
  };
}

/**
 * Is a frozen diagram current? `missing` | `stale` | `ok`.
 * A diagram that contradicts its spec passes overflow, contrast and geometry and
 * is wrong, so staleness is an invariant — the caller fails the render.
 */
export function diagramStatus({ provenance, orientation, expectedHash, svgExists }) {
  if (!svgExists) return 'missing';
  const frame = provenance?.frames?.[orientation];
  if (!frame || frame.hash !== expectedHash) return 'stale';
  return 'ok';
}

// ---------------------------------------------------------------------------
// Custom slides sourced from a URL
// ---------------------------------------------------------------------------

/**
 * A custom-slide URL is fetched once into `custom/` and never at build time.
 * Credentials never travel in it: userinfo in a URL lands in the committed
 * storyline and in provenance.
 */
export function customUrlProblem(value) {
  let url;
  try {
    url = new URL(String(value));
  } catch {
    return `"${value}" is not an absolute URL`;
  }
  if (!/^https?:$/.test(url.protocol)) return `"${value}" must be http(s)`;
  if (url.username || url.password) return 'credentials in a URL end up in the committed source — save the page yourself and use htmlPath';
  return null;
}

/** Relative paths of a frozen custom page (a HAR replayed offline at render). */
export function customFiles(id, orientation = 'landscape') {
  const o = orientation === 'vertical' ? '.portrait' : '';
  return { har: `custom/${id}${o}.har`, provenance: `custom/${id}${o}.provenance.json` };
}
