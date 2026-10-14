/**
 * Storyline source model: validation and compilation to a storyboard.
 *
 * `storyline.yml` is the authored source (D1). `storyboard.json` is a generated
 * lockfile (D2) — regenerable, diffable, not hand-edited. Everything in this
 * file is pure so it runs with system Node alone, before any install: YAML
 * parsing happens in compile.mjs, and a parsed object is handed in here.
 *
 * The storyline is a *narrative source*, not just slides: entries are typed, and
 * only some of them render as slides (D9). That is what lets one file drive a
 * standalone deck and a video without a second ordering.
 */

import { digest, sha256 } from './core.mjs';
import { DIAGRAM_PLACEMENTS, customUrlProblem, resolveDiagram, validateDiagram } from './diagram.mjs';

// ---------------------------------------------------------------------------
// Layouts (D4, D12)
// ---------------------------------------------------------------------------

/**
 * The layout catalogue, each entry with a mandatory portrait behaviour.
 *
 * A layout without a stated portrait rule is incomplete: vertical output
 * re-renders at 1080x1920 and reflows (D12), so the catalogue really means
 * every layout times two orientations. `slots` is what the validator checks
 * content against, so a layout cannot be fed cards it has nowhere to put.
 *
 * `dominant` is the zero-based index of the card slot the layout renders
 * dominant — the slot the eye lands on first — or `null` when the layout
 * deliberately expresses no card hierarchy. It is derived by reading the actual
 * BODIES implementation in deck-html.mjs, not assumed: `spotlight` gives card 0
 * the `lead` class, `bento-b` gives card 0
 * `span-wide`, `process-flow` gives card 0 the hub. It exists so the "declared
 * primary is not in the dominant slot" check is mechanical rather than guessed,
 * and so the old "heaviest card is not first" note is correct by construction
 * rather than hardcoding index 0.
 */
export const LAYOUTS = {
  hero: {
    label: 'Hero / section opener',
    slots: { title: true, pill: true, body: true, cards: [0, 1], stat: false, image: true },
    // One supporting card sits beside the copy; there is no ranking among cards
    // to express because there is at most one card.
    dominant: null,
    portrait: 'Title block on top, image or icon card beneath; pill stays above the title.',
  },
  statement: {
    label: 'Statement / a single claim carrying the slide',
    slots: { title: true, pill: true, body: true, cards: [0, 0], stat: false, image: false },
    dominant: null,
    // No reflow rule is needed, and that is the point: a centred single column
    // is already the portrait arrangement. Stated explicitly so the layout is
    // not mistaken for one whose portrait behaviour was forgotten.
    portrait: 'Unchanged — a centred single column is already the portrait arrangement.',
  },
  'bento-b': {
    label: 'Bento grid, pattern B (one wide top, two detail cards below)',
    slots: { title: true, pill: false, body: true, cards: [3, 3], stat: false, image: true },
    // Card 0 gets `span-wide` in BODIES, so it is the dominant slot.
    dominant: 0,
    portrait: 'Wide card stays full width; the two detail cards stack beneath it.',
  },
  tiled: {
    label: 'Tiled features (3-4 equal cards in a row)',
    slots: { title: true, pill: false, body: true, cards: [3, 4], stat: false, image: false },
    // Tiled claims its cards are peers, so it expresses no dominance by design.
    dominant: null,
    portrait: 'Two columns (2x2). With three cards the third spans both columns.',
  },
  spotlight: {
    label: 'Spotlight (one dominant card, two to three supporting)',
    // The default home for any card set with a dominant member. The 1.6fr lead
    // is what makes the dominance visible, and because the lead spans every row
    // three and four cards both work — so the advisor never forks on the count.
    slots: { title: true, pill: false, body: true, cards: [3, 4], stat: false, image: true },
    // Card 0 gets the `lead` class in BODIES, spanning every row.
    dominant: 0,
    portrait: 'Single column: the dominant card first and taller, supporting cards stacked beneath in order.',
  },
  'process-flow': {
    label: 'Process flow / ecosystem (hub plus downstream nodes)',
    slots: { title: true, pill: false, body: true, cards: [3, 5], stat: false, image: false },
    // Card 0 is the hub in BODIES, the element every node points back to.
    dominant: 0,
    portrait: 'Hub on top, nodes stacked below it; connectors rotate to vertical.',
  },
  lifecycle: {
    label: 'Lifecycle / timeline (chronological phases)',
    slots: { title: true, pill: false, body: true, cards: [3, 4], stat: false, image: false },
    // Phases are equal points on a rail; the rail asserts order, not rank.
    dominant: null,
    portrait: 'Vertical timeline: connector runs top-to-bottom on the left of the cards.',
  },
  comparison: {
    label: 'Comparison / flip paradigm (before vs after)',
    slots: { title: true, pill: false, body: true, cards: [2, 2], stat: false, image: false },
    // Before and after carry the accent difference, but neither is the dominant
    // slot: the claim is the contrast between two peers, not that one outranks
    // the other.
    dominant: null,
    portrait: 'Stacked, old/negative first and accent/positive second so the flip still reads downward.',
  },
  'stat-deepdive': {
    label: 'Data deep-dive (headline metric plus supporting details)',
    // The dominant element is the STAT, not a card, so there is no dominant CARD
    // slot to name — cards are the supporting detail beneath the headline metric.
    // Represented as null so the "declared primary not in the dominant card
    // slot" check never fires here, and so `weight: primary` on a card is caught
    // separately as "the stat is already the primary element".
    dominant: null,
    slots: { title: true, pill: false, body: true, cards: [2, 4], stat: true, image: false },
    portrait: 'Metric card full width on top; supporting detail cards stack beneath.',
  },
  cycle: {
    label: 'Cycle / recurring loop (stages that repeat with no terminus)',
    // Shape is a claim. lifecycle's straight rail and process-flow's hub both
    // assert an end or a centre; a genuine loop (PDCA, a retention loop) has
    // neither. Drawing recurring stages on a straight rail is a false statement
    // about the content, not a styling preference — so the loop gets its own
    // layout, reachable only via an explicit `cycle: true` (see recommendLayout).
    slots: { title: true, pill: false, body: true, cards: [3, 5], stat: false, image: false },
    // Stages in a loop are peers; the connector, not any one stage, carries the
    // recurrence claim.
    dominant: null,
    portrait: 'Vertical list of stages with a return connector from the last back to the first, so the loop claim survives the reflow.',
  },
  diagram: {
    label: 'Diagram (a diagram-design drawing carries the slide, up to two supporting cards)',
    // The diagram is the primary element, like a stat: it is not a card, so
    // there is no dominant CARD slot to name. Card range is enforced from
    // DIAGRAM_PLACEMENTS in lib/diagram.mjs, which also lets a diagram fill the
    // dominant slot of hero, spotlight and bento-b.
    slots: { title: true, pill: false, body: true, cards: [0, 2], stat: false, image: false },
    dominant: null,
    portrait: 'Diagram full width on top, supporting cards beneath. The portrait diagram is a separate 1080x1920 drawing, never a crop.',
  },
  custom: {
    label: 'Escape hatch: author-supplied HTML',
    slots: { title: false, pill: false, body: false, cards: [0, 0], stat: false, image: false },
    dominant: null,
    portrait: 'Unknown — a portrait HTML file must be supplied explicitly (D12).',
  },
};

export const THEMES = new Set(['light', 'dark']);
export const DECK_ENGINES = new Set(['html', 'marp']);
export const DECK_FORMATS = new Set(['png', 'pdf', 'html']);
export const ENTRY_TYPES = new Set(['slide', 'capture', 'footage']);
export const SCR_ROLES = ['situation', 'complication', 'resolution'];
export const OVERLAYS = new Set(['none', 'chapter', 'pip']);
export const TARGETS = new Set(['deck', 'video']);

/**
 * Ordinal card weights an author may declare (D-weight).
 *
 * Three levels, not four: the slide title already occupies the top ("hero")
 * level, and three size steps are the reliable ceiling on a 1080p canvas. The
 * author declares RANK, never pixels or colour — consistent with "authors never
 * write slide HTML". The stat slot is implicitly primary and carries no `weight`
 * of its own, so this set applies to cards only.
 */
export const CARD_WEIGHTS = new Set(['primary', 'secondary', 'tertiary']);

/** Declared kinds of presentation (D9). The CLI word must agree with this. */
export const MODES = new Set(['slides', 'video']);

/** Deck canvases (D22). Orientation is a property of a canvas, not of a document. */
export const ORIENTATIONS = new Set(['landscape', 'vertical', 'square']);

/**
 * Flatten `presentation:` + `video:` into the one meta shape the compiler and
 * the storyboard validator already speak.
 *
 * Flattening rather than nesting downstream is deliberate: the storyboard's
 * `meta` is consumed by capture, synthesis, composition and verification, all of
 * which read `meta.outputs`, `meta.voice`, `meta.captureAspect`. Changing the
 * *authoring* surface must not ripple into five stages and a dependency-free
 * validator, so the new blocks are a source-level concern only.
 *
 * The split exists because the old single `deck:` block held video aspect
 * ratios, TTS voices and a capture baseUrl alongside deck typography — so
 * `deck.mode: video` would have read as nonsense, and a slides presentation had
 * four keys that silently did nothing (D13).
 */
export function presentationMeta(storyline) {
  return { ...(storyline?.presentation ?? {}), ...(storyline?.video ?? {}) };
}

/**
 * Deck canvases a storyline renders, as the UNION of the deck-level default and
 * every per-slide override (D22).
 *
 * A video presentation derives them from `video.outputs` instead: a scene that
 * existed in the vertical cut but not the landscape one would desynchronise two
 * renders of the same argument, so per-slide orientation is slides-only.
 */
export function deckOrientations(storyline) {
  const meta = presentationMeta(storyline);
  if ((meta.mode ?? 'video') === 'video') {
    const fromOutputs = (meta.outputs ?? []).map((o) => o?.aspect ?? o).filter((a) => ORIENTATIONS.has(a));
    return fromOutputs.length ? [...new Set(fromOutputs)] : ['landscape'];
  }
  const base = Array.isArray(meta.orientations) && meta.orientations.length ? meta.orientations : ['landscape'];
  const union = new Set(base);
  for (const entry of storyline?.entries ?? []) {
    for (const o of entry?.orientations ?? []) if (ORIENTATIONS.has(o)) union.add(o);
  }
  return [...union];
}

/** Orientations one slide participates in: its own declaration, else the deck default. */
export function slideOrientations(entry, storyline) {
  const meta = presentationMeta(storyline);
  if ((meta.mode ?? 'video') === 'video') return deckOrientations(storyline);
  if (Array.isArray(entry?.orientations) && entry.orientations.length) return [...new Set(entry.orientations)];
  const base = Array.isArray(meta.orientations) && meta.orientations.length ? meta.orientations : ['landscape'];
  return [...new Set(base)];
}

/**
 * SCR archetype shape (D5). Ranges rather than a fixed count, because a storyline
 * that genuinely needs four complications is really describing two problems —
 * the ceiling is the signal, not an obstacle.
 */
export const SCR_SKELETON = {
  situation: { min: 1, max: 2, defaultLayout: 'stat-deepdive' },
  complication: { min: 1, max: 2, defaultLayout: 'comparison' },
  resolution: { min: 2, max: 5, defaultLayout: 'process-flow' },
};

/** Default layout for a role, used when an entry omits `layout`. */
export function defaultLayoutFor(role) {
  return SCR_SKELETON[role]?.defaultLayout ?? 'spotlight';
}

// ---------------------------------------------------------------------------
// Layout advice
// ---------------------------------------------------------------------------

/**
 * A card title longer than this, or carrying sentence punctuation, is prose
 * rather than a label — and prose in an evenly tiled row is what overflows.
 */
const LABEL_MAX = 24;

/** How much more text one card must carry before it counts as the dominant one. */
const DOMINANCE = 1.4;

/** Deterministic facts about a card set. No intent is inferred, only shape. */
function cardShape(cards) {
  const lengths = cards.map((c) => String(c?.text ?? c?.title ?? '').length);
  const longestByText = lengths.length ? lengths.indexOf(Math.max(...lengths)) : -1;
  const max = lengths.length ? Math.max(...lengths) : 0;
  const rest = lengths.filter((_, i) => i !== longestByText);
  const dominantByText = rest.length > 0 && max >= DOMINANCE * Math.max(...rest);

  // Declared weight overrides text length, and here is why the override matters:
  // text length is a proxy for OVERFLOW RISK, not for importance. The canonical
  // counterexample is a headline number ("$4.2M") — the shortest card and
  // usually the most important — losing the dominant slot to a hedging caveat,
  // the longest and least important card. Ranking by text length actively routes
  // the eye to the wrong card. When any card declares a weight, dominance follows
  // the declared `primary` instead. `weight` is still a DECLARED FACT about the
  // entry, not an inferred intent, so cardShape stays a reporter of shape.
  const weights = cards.map((c) => c?.weight ?? null);
  const declaresWeight = weights.some((w) => w != null);
  const primaryIndex = weights.indexOf('primary');
  const allWeightsEqual = declaresWeight && new Set(weights.map((w) => w ?? 'secondary')).size === 1;

  let longest;
  let dominant;
  if (declaresWeight) {
    // A declared primary is the dominant card. With weights declared but none
    // primary (all secondary/tertiary, or a mix without a primary), there is no
    // dominant card — the set is treated as peers.
    longest = primaryIndex >= 0 ? primaryIndex : longestByText;
    dominant = primaryIndex >= 0;
  } else {
    longest = longestByText;
    dominant = dominantByText;
  }

  return {
    n: cards.length,
    longest,
    dominant,
    // The two dominance sources produce different advice text and warning
    // strength, so callers must be able to tell them apart.
    dominanceSource: dominant ? (declaresWeight ? 'declared' : 'text-length') : null,
    declaresWeight,
    allWeightsEqual,
    allDetailed: cards.length > 0 && cards.every((c) => String(c?.detail ?? '').trim()),
    anyText: cards.some((c) => String(c?.text ?? '').trim()),
    allLabels:
      cards.length > 0 &&
      cards.every((c) => {
        const t = String(c?.title ?? '');
        return t.length > 0 && t.length <= LABEL_MAX && !/[.,;:]/.test(t);
      }),
  };
}

/**
 * Recommend a layout for one authored entry.
 *
 * A HEURISTIC, so it warns and never decides: the author writes `layout:` into
 * storyline.yml and that declaration wins. What this exists to prevent is the
 * silent path — an entry with no `layout:` takes the SCR role default, so the
 * arrangement is decided by a table nobody reads and never appears in a diff.
 *
 * Two kinds of rule, deliberately separated:
 *   STRUCTURAL, which are effectively forced. A stat block has exactly one home;
 *   two cards can only be a comparison; five cards fit only process-flow. These
 *   mirror the `slots` table, so following the advice cannot produce a slide the
 *   validator then rejects.
 *   SHAPE, which rank the remaining candidates by putting the longest card in the
 *   biggest slot. That is not a matter of taste: text overflow is a hard,
 *   pixel-measured build failure, so the arrangement that gives the heaviest card
 *   the most room is the one least likely to fail the gate.
 *
 * @returns {{layout: string|null, reason: string, alternatives: string[], notes: string[]}}
 */
export function recommendLayout(entry = {}) {
  const cards = Array.isArray(entry.cards) ? entry.cards : [];
  const shape = cardShape(cards);
  const notes = [];
  const advise = (layout, reason, alternatives = []) => ({ layout, reason, alternatives, notes });

  // --- structural -------------------------------------------------------
  if (entry.htmlPath || entry.htmlUrl) return advise('custom', 'the entry supplies its own HTML');
  // A diagram is the slide's primary element; its home is the diagram layout,
  // and the dominant slots that can carry one are the alternatives.
  if (entry.diagram) return advise('diagram', 'the shape is the claim, so a drawing carries the slide', ['spotlight', 'bento-b', 'hero']);
  if (entry.stat) return advise('stat-deepdive', 'a stat block has a slot in stat-deepdive and nowhere else');
  if (shape.n === 0) {
    return entry.pill
      ? advise('hero', 'no cards and a section label — this opens a section', ['statement'])
      : advise('statement', 'no cards, so one claim carries the slide', ['hero']);
  }
  if (shape.n === 1) return advise('hero', 'a single supporting card sits beside the copy');
  if (shape.n === 2) return advise('comparison', 'two cards are a before/after pair');
  if (shape.n > 5) {
    return {
      layout: null,
      reason: `${shape.n} cards exceeds every layout's ceiling — split the slide rather than shrinking the cards`,
      alternatives: [],
      notes,
    };
  }

  // --- shape ------------------------------------------------------------
  // The "declared/heaviest card is not in the dominant slot" note. Routed
  // through the chosen layout's `spec.dominant` rather than the old hardcoded
  // index 0, so it is correct by construction for spans that dominate at a
  // different index, and so a layout with no dominant card slot (dominant:null)
  // never emits a nonsense note. The note text forks on how dominance was
  // decided: a declared primary names a firm reorder, a text-length guess is
  // softer because the author never stated intent.
  const dominantNote = (layout) => {
    const spec = LAYOUTS[layout];
    if (!shape.dominant || spec?.dominant == null || shape.longest === spec.dominant) return;
    if (shape.dominanceSource === 'declared') {
      notes.push(
        `card ${shape.longest + 1} declares weight: primary but is not in "${layout}"'s dominant slot ` +
          `(card ${spec.dominant + 1}) — move it first so the arrangement points at the card you marked primary`
      );
    } else {
      notes.push(
        `card ${shape.longest + 1} carries the most text but is not first, so the dominant slot goes to a lighter card — ` +
          'reorder the cards or expect that card to be the one that clips'
      );
    }
  };

  if (shape.n === 5 && entry.cycle !== true) {
    dominantNote('process-flow');
    return advise('process-flow', 'five cards fit only process-flow: one hub plus downstream nodes');
  }
  if (shape.allDetailed && entry.cycle !== true) {
    dominantNote('lifecycle');
    return advise('lifecycle', 'every card carries a detail label, which reads as a phase marker', ['process-flow']);
  }
  // Cycle sits AFTER the allDetailed -> lifecycle rule so it does not change how
  // any card shape is inferred — it is reachable ONLY via an explicit
  // `cycle: true`. The allDetailed rule above steps aside for that flag rather
  // than shadowing it, so a loop of detailed stages still reaches cycle: a loop
  // is a claim about the content that card shape alone cannot reveal.
  if (entry.cycle === true && shape.n >= 3 && shape.n <= 5) {
    return advise('cycle', 'stages that recur with no terminus need a loop, not a straight rail', ['lifecycle', 'process-flow']);
  }
  if (shape.allLabels && !shape.anyText && (!shape.declaresWeight || shape.allWeightsEqual)) {
    return advise('tiled', 'short labels with no supporting copy tile evenly', ['spotlight']);
  }
  // `spotlight` declares cards: [3, 4], and its lead spans every row, so three
  // and four cards both work unchanged. Forking on the count here is what used
  // to send a three-card slide to a layout with no track ratio, handing the
  // author a dominant slot that dominance could not actually be seen in.
  if (shape.dominant) {
    dominantNote('spotlight');
    return advise('spotlight', 'one card carries markedly more weight, so it takes the dominant slot', ['bento-b']);
  }
  // Even weight tiles — UNLESS the author declared unequal weights, in which
  // case `tiled`'s "these are peers" claim contradicts the content. Route to a
  // layout with a dominant slot so the declared primary has somewhere to land.
  if (shape.declaresWeight && !shape.allWeightsEqual) {
    dominantNote('spotlight');
    return advise('spotlight', 'the cards declare unequal weight, so they are not peers — tiled would claim they are', ['bento-b']);
  }
  return advise('tiled', 'cards of even weight tile without inventing a hierarchy', ['spotlight']);
}

// ---------------------------------------------------------------------------
// Legibility floors (M2)
// ---------------------------------------------------------------------------

/**
 * The canvas sizes each type role renders at with no brand — the same literals
 * `slideCss`'s `fz()` calls fall back to. Kept here so the floor check is pure
 * and dependency-free: it does not import the CSS generator, it mirrors the one
 * fact it needs (the default size per level).
 */
const DEFAULT_TYPE_SCALE = {
  title: 64,
  'hero-title': 96,
  body: 28,
  'card-title': 34,
  'card-text': 24,
  'card-detail': 19,
  'stat-value': 140,
  'stat-label': 28,
  pill: 20,
};

/**
 * Heading levels the brand's heading-dominance multiplier scales. Body-class
 * levels are never scaled — a brand's 16px body is authored for a scrolling
 * page, not a 1920x1080 canvas — so the multiplier applies to headings only,
 * matching resolveTypeScale in design-md.mjs.
 */
const SCALED_LEVELS = new Set(['title', 'hero-title', 'card-title', 'stat-value']);

/** Portrait scale factor, identical to slideCss's `s`. */
const PORTRAIT_SCALE = 1.15;

/**
 * Critical print size: fluent reading holds down to roughly 0.2 degrees of
 * x-height, below which reading speed falls off (Legge & Bigelow, "Does Print
 * Size Matter for Reading?", J Vis 2011).
 *
 * A pixel floor cannot be imported from that paper, because a pixel has no
 * angular size until a viewing distance is stated. "Use 24pt" and "body must be
 * 40px" are the same mistake wearing different numbers: both name a size while
 * omitting the distance that gives it meaning. So the floor is DERIVED here from
 * a declared viewing profile, and the profile is the thing an author chooses.
 */
const CRITICAL_X_HEIGHT_DEG = 0.2;

/** Canvas heights the floors are derived against, matching CANVAS in deck-html.mjs. */
const CANVAS_SHORT = 1080;
const CANVAS_LONG = 1920;

/**
 * Viewing profiles as a ratio of viewing distance to SCREEN HEIGHT, which is the
 * only form in which the ratio is resolution-independent — the same ratio holds
 * for a phone and for a projection wall.
 *
 * `screen` is the default because it is what the shipped scale targets. That is
 * measured, not asserted: the derivation below returns 24px for `screen`, and the
 * shipped `card-text` is 24px. The scale was calibrated for someone watching on a
 * laptop, a monitor or a phone, and the floors agree with it to the pixel.
 *
 * `room` is the profile that matters for a projected deck, and the honest finding
 * is that the shipped scale does NOT clear it: body text calibrated for a monitor
 * is unreadable from the back of a large room. That is a real property of the
 * deck, not a defect in the check, and it is why the profile is explicit.
 */
export const VIEWING_PROFILES = {
  /** A held phone: ~30cm from a ~13cm-tall screen. */
  phone: 2.5,
  /** A laptop, a monitor, or a phone in the hand — the default. */
  screen: 3.5,
  /** The back row of an ordinary meeting room facing a screen or projection. */
  room: 6,
  /** The back of a large hall or auditorium. */
  hall: 8,
};

/**
 * Fraction of the em box a role's READ height occupies.
 *
 * Mixed-case text is bound by x-height, which is the metric the critical print
 * size is expressed in (0.55 em for the bundled variable font). All-caps text is
 * bound by cap-height instead (0.73 em), so the same pixel size buys a larger
 * angular target — which is why a 19px uppercase label is not the same risk as
 * 19px of sentence text, and why treating them alike would flag a role that is
 * in fact legible.
 */
const X_HEIGHT_RATIO = 0.55;
const CAP_HEIGHT_RATIO = 0.73;

/** Roles rendered uppercase by slideCss, so bound by cap-height, not x-height. */
const UPPERCASE_ROLES = new Set(['card-detail', 'pill']);

/**
 * The floor for one role, in canvas pixels, for a declared viewing profile.
 *
 * Derivation, stated so it can be checked rather than trusted:
 *   required read height in px = tan(0.2 deg) * (D/H) * canvasHeightPx
 *   floor = that height / the role's em fraction
 *
 * The canvas height is the portrait one (1920) for the vertical canvas, and the
 * landscape one (1080) otherwise, because the ratio is to screen height — a
 * portrait canvas is physically taller, so the same angular target costs more
 * pixels. This is the same reason `slideCss` scales portrait type up.
 */
export function typeFloor(role, { profile = 'screen', orientation = 'landscape' } = {}) {
  const ratio = VIEWING_PROFILES[profile];
  if (ratio == null) throw new Error(`unknown viewing profile "${profile}" (expected ${Object.keys(VIEWING_PROFILES).join('|')})`);
  const canvasHeight = orientation === 'vertical' ? CANVAS_LONG : CANVAS_SHORT;
  const readHeightPx = Math.tan((CRITICAL_X_HEIGHT_DEG * Math.PI) / 180) * ratio * canvasHeight;
  const emFraction = UPPERCASE_ROLES.has(role) ? CAP_HEIGHT_RATIO : X_HEIGHT_RATIO;
  return Math.round(readHeightPx / emFraction);
}

/**
 * Default viewing profile per canvas, because the canvas implies the medium.
 *
 * A 1080x1920 canvas is a phone format — nobody watches a 9:16 cut on a
 * projector — and a phone is held closer relative to its screen height than a
 * laptop is. Defaulting both canvases to `screen` would measure the portrait
 * canvas against a distance nobody views it from.
 */
const DEFAULT_PROFILE_FOR = { landscape: 'screen', square: 'screen', vertical: 'phone' };

/**
 * Resolve the effective type size per role for one orientation, and report any
 * role below the reading floor for a declared viewing profile.
 *
 * PURE and dependency-free by design: it takes plain numbers and returns plain
 * data, so it is testable with no install and no browser — there is no
 * browser-side gate. It WARNS, never fails: the skill already decided that brand
 * type BENDS rather than fails, because a brand nobody can edit would otherwise
 * make a valid deck unbuildable. A hard floor would silently reverse that
 * decision.
 *
 * Only roles that are READ are checked. Heading roles are excluded deliberately:
 * a title is never near the reading floor, and what governs it is the hierarchy
 * step between roles (~1.5-2x), which is a different rule with a different
 * failure. Applying a reading floor to a title would report a hierarchy problem
 * as a legibility one.
 *
 * Effective size follows slideCss exactly: the portrait canvas scales every role
 * by 1.15, and the brand's heading-dominance multiplier scales heading levels
 * only. Both are applied, then the result is rounded as the CSS is.
 *
 * @param {object} [opts]
 * @param {string} [opts.profile]  phone | screen | room | hall
 * @param {string} [opts.orientation]  landscape | vertical | square
 * @param {number} [opts.headingMultiplier]  the brand's clamped heading-dominance
 *   multiplier (1 with no brand)
 * @param {object} [opts.typeScale]  per-level base sizes; defaults to the
 *   canvas scale, so with no brand this measures the shipped tokens
 * @returns {{ role, effective, floor, profile }[]}  one entry per role below the floor
 */
export function legibilityFloorReport({
  profile = null,
  orientation = 'landscape',
  headingMultiplier = 1,
  typeScale = null,
} = {}) {
  const scale = typeScale ?? DEFAULT_TYPE_SCALE;
  const resolved = profile ?? DEFAULT_PROFILE_FOR[orientation] ?? 'screen';
  const s = orientation === 'vertical' ? PORTRAIT_SCALE : 1;
  const findings = [];
  for (const role of READ_ROLES) {
    const base = scale[role];
    if (base == null) continue;
    const mult = SCALED_LEVELS.has(role) ? headingMultiplier : 1;
    const effective = Math.round(base * mult * s);
    const floor = typeFloor(role, { profile: resolved, orientation });
    if (effective < floor) findings.push({ role, effective, floor, profile: resolved });
  }
  return findings;
}

/**
 * Roles a viewer READS rather than glances at. Heading roles are absent by
 * design — see legibilityFloorReport.
 */
const READ_ROLES = ['body', 'card-text', 'card-detail', 'stat-label', 'pill'];

// ---------------------------------------------------------------------------
// Validation (D14 invariants fail, D19 heuristics warn)
// ---------------------------------------------------------------------------

/**
 * Validate a parsed storyline.
 *
 * Returns `{ errors, warnings }`. Errors are invariants — a storyline with any of
 * them cannot produce correct output. Warnings are heuristics with legitimate
 * exceptions, so they never block a build; a check people learn to override
 * stops meaning anything.
 *
 * @param {object} storyline         parsed storyline.yml
 * @param {object} [opts]
 * @param {Set<string>} [opts.iconNames]  known icon names; when supplied,
 *   unknown names are hard errors (D18). Omitted before the icon set installs.
 */
export function validateStoryline(storyline, opts = {}) {
  const errors = [];
  const warnings = [];
  const push = (at, msg) => errors.push(`${at}: ${msg}`);
  const warn = (at, msg) => warnings.push(`${at}: ${msg}`);

  if (!storyline || typeof storyline !== 'object') return { errors: ['storyline: not an object'], warnings };

  // Legacy layout, detected to be REPORTED, never translated (D14).
  //
  // A silent fallback would protect nobody: the only storylines that ever used
  // `deck:` live in this repository and are migrated by the same change that
  // introduced this check. What a fallback would guarantee is a translation
  // path nobody can prove is unused, so it could never be deleted. This branch
  // is expected to be dead once every storyline is migrated — delete it then.
  if (storyline.deck && !storyline.presentation) {
    return {
      errors: [
        'deck: this storyline uses the legacy `deck:` block. Split it into `presentation:` ' +
          '(mode, title, archetype, engine, theme, formats, orientations, design) and `video:` ' +
          '(aspect, outputs, voice, baseUrl, fixedTime), and declare `presentation.mode`. ' +
          'Step-by-step: references/migration.md',
      ],
      warnings,
    };
  }

  const meta = presentationMeta(storyline);
  const hasVideoBlock = storyline.video != null;
  if (!storyline.presentation || typeof storyline.presentation !== 'object') {
    push('presentation', 'missing the `presentation:` metadata block');
  }
  const mode = meta.mode;
  if (!mode) push('presentation.mode', `missing — declare one of ${[...MODES].join('|')}`);
  else if (!MODES.has(mode)) push('presentation.mode', `must be one of ${[...MODES].join('|')}`);
  const slidesMode = mode === 'slides';

  if (storyline.presentation && typeof storyline.presentation === 'object') {
    if (!meta.title) push('presentation.title', 'missing');
    if (meta.engine && !DECK_ENGINES.has(meta.engine)) {
      push('presentation.engine', `must be one of ${[...DECK_ENGINES].join('|')}`);
    }
    if (meta.theme && !THEMES.has(meta.theme)) {
      push('presentation.theme', `must be one of ${[...THEMES].join('|')}`);
    }
    for (const f of meta.formats ?? []) {
      if (!DECK_FORMATS.has(f)) push('presentation.formats', `unknown format "${f}" (expected ${[...DECK_FORMATS].join('|')})`);
    }
    // Brand paths are DECLARED, never discovered. They stay work-dir relative
    // and POSIX-separated so a storyboard is portable between machines and
    // checkouts. `../` is expected rather than suspect: the brand normally
    // lives in the repository above the work directory, which is the whole
    // point of letting DESIGN.md sit anywhere — and it is now also how one
    // brand is deliberately shared between presentations (D6).
    for (const key of ['design', 'designDark', 'fontFile']) {
      const value = meta[key];
      if (value === undefined || value === null) continue;
      if (typeof value !== 'string' || !value.trim()) {
        push(`presentation.${key}`, 'must be a non-empty path relative to the presentation directory');
        continue;
      }
      if (/^([a-zA-Z]:)?[\\/]/.test(value)) push(`presentation.${key}`, `must be relative, got "${value}"`);
      if (value.includes('\\')) push(`presentation.${key}`, `use forward slashes, got "${value}"`);
    }
    // The escape hatch for a proprietary brand font, which can never be on npm.
    // woff2 only: the file is base64-embedded with a woff2 mime type and a
    // format('woff2') hint, so any other container renders nothing at all.
    if (meta.fontFile && !/\.woff2$/i.test(String(meta.fontFile))) {
      push('presentation.fontFile', `must be a .woff2 file (the deck embeds woff2 only), got "${meta.fontFile}"`);
    }
    if (meta.designDark && !meta.design) {
      push('presentation.designDark', 'declared without presentation.design — the light palette is the base, not the optional half');
    }
    for (const o of meta.orientations ?? []) {
      if (!ORIENTATIONS.has(o)) push('presentation.orientations', `unknown orientation "${o}" (expected ${[...ORIENTATIONS].join('|')})`);
    }
    if (Array.isArray(meta.orientations) && meta.orientations.length === 0) {
      push('presentation.orientations', 'must be a non-empty array when declared');
    }
  }

  // Mode is a property of the presentation (D9), so a declared mode that
  // disagrees with the body is an error rather than something to reconcile
  // silently. Each rule below names the block the author actually wrote.
  if (slidesMode) {
    if (hasVideoBlock) {
      push('video', 'a `mode: slides` presentation has no video — remove the `video:` block');
    }
  } else if (mode === 'video') {
    if (Array.isArray(meta.orientations)) {
      push(
        'presentation.orientations',
        "a video presentation's deck follows `video.outputs`, so declaring orientations would give one argument two sources"
      );
    }
  }

  const entries = storyline.entries;
  if (!Array.isArray(entries) || entries.length === 0) {
    push('entries', 'must be a non-empty array');
    return { errors, warnings };
  }

  const wantsVertical = slidesMode
    ? deckOrientations(storyline).includes('vertical')
    : (meta.outputs ?? []).some((o) => (o?.aspect ?? o) === 'vertical');
  const seen = new Set();
  const roleCounts = Object.fromEntries(SCR_ROLES.map((r) => [r, 0]));
  const roleOrder = [];

  entries.forEach((entry, i) => {
    const at = `entries[${i}]`;
    const id = entry?.id;
    if (!id) push(`${at}.id`, 'missing — ids are cache keys and must be author-owned');
    else if (!/^[a-z0-9][a-z0-9-]*$/.test(String(id))) push(`${at}.id`, `"${id}" must be lower-kebab-case`);
    else if (seen.has(id)) push(`${at}.id`, `duplicate id "${id}"`);
    else seen.add(id);

    const type = entry?.type ?? 'slide';
    if (!ENTRY_TYPES.has(type)) push(`${at}.type`, `must be one of ${[...ENTRY_TYPES].join('|')}`);

    // A slides presentation has one medium, so the default target is the deck
    // alone. Defaulting to both would make every undeclared entry claim a video
    // target that cannot exist, and would compile deck slides into film scenes.
    const targets = entry?.in ?? (slidesMode ? ['deck'] : ['deck', 'video']);
    if (!Array.isArray(targets) || targets.length === 0) push(`${at}.in`, 'must be a non-empty array');
    else for (const t of targets) if (!TARGETS.has(t)) push(`${at}.in`, `unknown target "${t}"`);
    const inVideo = !slidesMode && Array.isArray(targets) && targets.includes('video');

    // Narration is only required for entries that reach the video, and not for
    // footage carrying its own audio.
    if (inVideo && !entry?.useFootageAudio && !String(entry?.narration ?? '').trim()) {
      push(`${at}.narration`, 'required for any entry that appears in the video');
    }

    // Presenter text and narrated text are different registers, so they are
    // different fields (D10). Reusing `narration` in a deck would also point the
    // overlap heuristic at notes, where restating the slide is the entire job —
    // a warning that fires on every slide teaches people to ignore warnings.
    if (slidesMode) {
      if (ENTRY_TYPES.has(type) && type !== 'slide') {
        push(`${at}.type`, `a \`mode: slides\` presentation renders slides only — a "${type}" entry never reaches a deck`);
      }
      if (String(entry?.narration ?? '').trim()) push(`${at}.narration`, 'is video-only — use `notes:` for presenter text');
      if (Array.isArray(targets) && targets.includes('video')) push(`${at}.in`, 'a `mode: slides` presentation has no video target');
      if (Array.isArray(entry?.orientations) && entry.orientations.length === 0) {
        push(`${at}.orientations`, 'must be a non-empty array when declared');
      }
      for (const o of entry?.orientations ?? []) {
        if (!ORIENTATIONS.has(o)) push(`${at}.orientations`, `unknown orientation "${o}" (expected ${[...ORIENTATIONS].join('|')})`);
      }
    } else {
      if (String(entry?.notes ?? '').trim()) push(`${at}.notes`, 'is slides-only — a video deck takes its notes from `narration:`');
      if (entry?.orientations != null) {
        push(`${at}.orientations`, "per-slide orientation is slides-only — a video's deck follows `video.outputs`");
      }
    }

    if (entry?.role != null && !SCR_ROLES.includes(entry.role)) {
      push(`${at}.role`, `must be one of ${SCR_ROLES.join('|')}`);
    }
    if (entry?.role) {
      roleCounts[entry.role] += 1;
      roleOrder.push(entry.role);
    }

    if (entry?.overlay != null && !OVERLAYS.has(entry.overlay)) {
      push(`${at}.overlay`, `must be one of ${[...OVERLAYS].join('|')}`);
    }
    // D8: a slide's own overlay cannot be `pip` — pip composites a capture over
    // something else, so it belongs on the capture entry.
    if (type === 'slide' && entry?.overlay === 'pip') {
      push(`${at}.overlay`, 'pip belongs on a capture entry, not a slide');
    }

    if (type === 'slide') validateSlide(entry, at, { push, warn, opts, wantsVertical, entries });
    if (type === 'capture') validateCapture(entry, at, push);
    if (type === 'footage') validateFootage(entry, at, push);
  });

  // SCR skeleton checks apply only when the storyline declares the archetype (D5).
  if (meta.archetype === 'scr') {
    for (const role of SCR_ROLES) {
      const { min, max } = SCR_SKELETON[role];
      const n = roleCounts[role];
      if (n < min) push('entries', `SCR archetype needs at least ${min} "${role}" beat (found ${n})`);
      if (n > max) push('entries', `SCR archetype allows at most ${max} "${role}" beats (found ${n}) — split the storyline instead`);
    }
    // Monotonic S -> C -> R. The deck-only answer-first slide carries no role,
    // so it does not participate (D6).
    const rank = (r) => SCR_ROLES.indexOf(r);
    for (let i = 1; i < roleOrder.length; i += 1) {
      if (rank(roleOrder[i]) < rank(roleOrder[i - 1])) {
        push('entries', `SCR beats must run situation -> complication -> resolution; "${roleOrder[i]}" appears after "${roleOrder[i - 1]}"`);
        break;
      }
    }
    const complications = entries.filter((e) => e?.role === 'complication');
    for (const e of complications) {
      if (!namesACost(e)) {
        warn(`entries[${entries.indexOf(e)}]`, 'complication does not name a cost (hours, dollars, errors, calls) — the archetype rule requires one');
      }
    }
  }

  return { errors, warnings };
}

function validateSlide(entry, at, { push, warn, opts, wantsVertical, entries = [] }) {
  const layout = entry.layout ?? defaultLayoutFor(entry.role);
  const spec = LAYOUTS[layout];
  if (!spec) {
    push(`${at}.layout`, `unknown layout "${layout}" (expected ${Object.keys(LAYOUTS).join('|')})`);
    return;
  }

  if (layout === 'custom') {
    // A relative path OR a URL frozen once into custom/ — never both, because
    // two sources for one page is how they disagree.
    if (!entry.htmlPath && !entry.htmlUrl) push(`${at}.htmlPath`, 'layout "custom" requires an htmlPath or an htmlUrl');
    if (entry.htmlPath && entry.htmlUrl) push(`${at}.htmlUrl`, 'declare htmlPath or htmlUrl, not both');
    if (entry.portraitHtmlPath && entry.portraitHtmlUrl) push(`${at}.portraitHtmlUrl`, 'declare portraitHtmlPath or portraitHtmlUrl, not both');
    for (const key of ['htmlUrl', 'portraitHtmlUrl']) {
      const problem = entry[key] != null ? customUrlProblem(entry[key]) : null;
      if (problem) push(`${at}.${key}`, problem);
    }
    // D12: arbitrary HTML has no known reflow, so vertical needs an explicit file.
    if (wantsVertical && !entry.portraitHtmlPath && !entry.portraitHtmlUrl) {
      push(`${at}.portraitHtmlPath`, 'a vertical output is declared and layout "custom" cannot reflow — supply a portrait HTML file (portraitHtmlPath or portraitHtmlUrl)');
    }
    return;
  }

  validateDiagram(entry, at, { push, warn, entries });

  const cards = entry.cards ?? [];
  const [min, max] = entry.diagram ? DIAGRAM_PLACEMENTS[layout]?.cards ?? spec.slots.cards : spec.slots.cards;
  if (cards.length < min || cards.length > max) {
    push(`${at}.cards`, `layout "${layout}" takes ${min === max ? min : `${min}-${max}`} cards (found ${cards.length})`);
  }
  if (spec.slots.stat && !entry.stat) push(`${at}.stat`, `layout "${layout}" needs a stat block`);
  if (!spec.slots.stat && entry.stat) push(`${at}.stat`, `layout "${layout}" has nowhere to put a stat`);
  if (!spec.slots.pill && entry.pill) push(`${at}.pill`, `layout "${layout}" has nowhere to put a pill`);
  if (!entry.title) push(`${at}.title`, 'every slide needs a title');

  cards.forEach((card, j) => {
    const cat = `${at}.cards[${j}]`;
    if (!card?.title) push(`${cat}.title`, 'missing');
    if (card?.icon && opts.iconNames && !opts.iconNames.has(card.icon)) {
      // D18: a blank icon passes every automated check, so an unknown name fails.
      push(`${cat}.icon`, `unknown icon "${card.icon}"`);
    }
    // An unknown weight fails, exactly as an unknown layout or unknown icon does
    // — a typo'd weight would otherwise silently drop back to the text-length
    // path and the author would never learn their declaration did nothing.
    if (card?.weight != null && !CARD_WEIGHTS.has(card.weight)) {
      push(`${cat}.weight`, `unknown weight "${card.weight}" (expected ${[...CARD_WEIGHTS].join('|')})`);
    }
  });

  // Weight invariants (D-weight). Salience is RELATIVE: one card is made
  // dominant by keeping the others quiet, not by piling emphasis on it. So more
  // than one `primary` is a contradiction — two primaries means neither is one,
  // and the eye has no single place to land.
  const primaryCards = cards.filter((c) => c?.weight === 'primary');
  if (primaryCards.length > 1) {
    push(`${at}.cards`, `${primaryCards.length} cards declare weight: primary — salience is relative, so two primaries means neither is one; mark exactly one`);
  }
  // The stat slot is implicitly the primary element, so a card cannot also claim
  // primary on the same slide. Keeping weight card-only (never on the stat) is a
  // deliberate simplification: fewer moving parts, same expressive power.
  if (entry.stat && primaryCards.length > 0) {
    push(`${at}.cards`, 'a card declares weight: primary on a slide that has a stat — the stat is already the primary element, so weight is card-only here');
  }

  // The title is the slide's ASSERTION: an unlabelled topic makes the body an
  // exhibit with no claim. Alley's assertion-evidence studies measured 79% vs
  // 69% comprehension (p<0.001) for a sentence assertion over a topic phrase, so
  // these thresholds are evidence-grounded, not arbitrary tidy-up targets.
  // Heuristic (warn), never an invariant — a topic label is legitimate in the
  // right place.
  const title = String(entry.title ?? '').trim();
  if (title) {
    const words = title.split(/\s+/).filter(Boolean).length;
    const topicShaped = words <= 3 && !/[.?!,;:]/.test(title);
    // A section opener (a hero carrying a pill) and a statement legitimately use
    // a topic label, so the topic-shape warning is suppressed there. The
    // over-long warning is suppressed nowhere.
    const topicLabelLegitimate = (layout === 'hero' && entry.pill) || layout === 'statement';
    if (topicShaped && !topicLabelLegitimate) {
      warn(at, `title "${title}" is topic-shaped, not an assertion — state the takeaway as a sentence so the body has a claim to prove (Alley 79% vs 69%, p<0.001)`);
    }
    if (words > 12 || title.length > 70) {
      warn(at, `title is ${words} words / ${title.length} chars — an assertion that long stops reading as a headline; tighten it to one claim`);
    }
  }

  // `tiled` claims "these cards are peers". If the author declared unequal
  // weights AND still chose tiled explicitly, the layout makes a claim the
  // content contradicts. Heuristic (warn) — the author may accept it.
  if (entry.layout === 'tiled' && cards.some((c) => c?.weight != null)) {
    const distinct = new Set(cards.map((c) => c?.weight ?? 'secondary'));
    if (distinct.size > 1) {
      warn(at, 'layout "tiled" claims its cards are peers, but they declare unequal weight — use "spotlight" so the dominant card has a slot');
    }
  }

  // A cycle claim (`cycle: true`) drawn on a layout with a terminus contradicts
  // itself: the content says it recurs, the arrangement says it ends.
  if (entry.cycle === true && (layout === 'lifecycle' || layout === 'process-flow')) {
    warn(at, `cycle: true declares the stages recur, but layout "${layout}" draws a terminus — use layout "cycle" so the loop claim survives`);
  }

  // D19: heuristic, so it warns.
  const overlap = narrationOverlap(entry.narration, slideText(entry));
  if (overlap >= 0.7) {
    warn(at, `narration repeats ${Math.round(overlap * 100)}% of the slide text — one of them is redundant`);
  }

  // Layout advice. An explicit `layout:` is a decision and is never second-
  // guessed; an omitted one silently inherits the SCR role default, so the
  // arrangement gets chosen by a table nobody reads and never shows up in a
  // diff. Warning only on omission keeps the check from becoming noise that
  // teaches people to ignore the report.
  const advice = recommendLayout(entry);
  if (!entry.layout && advice.layout) {
    const better = advice.layout !== layout ? ` The content shape suits "${advice.layout}": ${advice.reason}.` : '';
    warn(at, `no layout declared, so it falls back to "${layout}".${better} Declare layout explicitly so the choice is in the diff`);
  }
  for (const note of advice.notes) warn(at, note);
}

function validateCapture(entry, at, push) {
  if (!entry.url) push(`${at}.url`, 'a capture entry needs a url (absolute, or a path joined to baseUrl)');
  if (entry.steps != null && !Array.isArray(entry.steps)) push(`${at}.steps`, 'must be an array');
  // Non-negotiable: assert what should be on screen before recording.
  if (!entry.assert?.visible?.length) {
    push(`${at}.assert.visible`, 'required — without it a 404 or a login screen passes every downstream check');
  }
}

function validateFootage(entry, at, push) {
  if (!entry.src) push(`${at}.src`, 'footage is referenced by path and never silently skipped');
  if (entry.generate) {
    const g = entry.generate;
    if (!g.provider) push(`${at}.generate.provider`, 'missing');
    if (!String(g.prompt ?? '').trim()) push(`${at}.generate.prompt`, 'missing');
    // D11: the frozen file is the input; the prompt is provenance. Generated
    // footage that lands in assets/ would be gitignored and re-billed.
    if (/^assets\//.test(String(entry.src))) {
      push(`${at}.src`, 'generated footage must live in a committed directory (footage/), not the gitignored assets/');
    }
  }
  if (entry.trim) {
    const { in: tin, out: tout } = entry.trim;
    if (tin != null && !(Number(tin) >= 0)) push(`${at}.trim.in`, 'must be a non-negative number of seconds');
    if (tout != null && !(Number(tout) > 0)) push(`${at}.trim.out`, 'must be a positive number of seconds');
    if (tin != null && tout != null && Number(tout) <= Number(tin)) push(`${at}.trim`, 'out must be greater than in');
  }
}

/** Cost words the SCR complication rule looks for. */
const COST_HINTS = /\b(hour|hours|minute|minutes|day|days|week|weeks|dollar|dollars|\$|percent|%|call|calls|error|errors|delay|delays|wait|waits|cost|costs|fte|headcount|rework)\b/i;

function namesACost(entry) {
  const text = [entry.narration, slideText(entry)].join(' ');
  return COST_HINTS.test(text) || /\d/.test(text);
}

/** All human-visible text on a slide, flattened. */
export function slideText(entry) {
  const parts = [entry?.title, entry?.pill, entry?.body];
  for (const c of entry?.cards ?? []) parts.push(c?.title, c?.text);
  if (entry?.stat) parts.push(entry.stat.value, entry.stat.unit, entry.stat.label);
  // A diagram's labels are on-screen text too. Leaving them out would score a
  // diagram slide on its title alone, so any narration would look redundant.
  if (entry?.diagram && !entry.diagram.ref) parts.push(...diagramLabels(entry.diagram));
  return parts.filter(Boolean).join(' ');
}

/** Every human-visible string in a diagram spec: names, labels, steps, annotation text. */
function diagramLabels(value, key = null, out = []) {
  if (typeof value === 'string') {
    if (['name', 'label', 'text', 'sublabel', 'title', 'steps', 'actors', 'nodes', 'layers', 'lanes'].includes(key)) out.push(value);
  } else if (Array.isArray(value)) {
    for (const v of value) diagramLabels(v, key, out);
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) diagramLabels(v, k, out);
  }
  return out;
}

const STOPWORDS = new Set(
  ('a an and are as at be but by for from has have in into is it its of on or that the their then there these this to was were will with your you we our').split(' ')
);

function tokens(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w && !STOPWORDS.has(w));
}

/**
 * Fraction of the slide's meaningful words that also appear in the narration.
 *
 * Containment rather than Jaccard: narration is longer than slide text by
 * design, so a symmetric measure would always look low and never fire.
 */
export function narrationOverlap(narration, slideTextValue) {
  const slide = tokens(slideTextValue);
  if (slide.length === 0) return 0;
  const spoken = new Set(tokens(narration));
  const hits = slide.filter((w) => spoken.has(w)).length;
  return hits / slide.length;
}

// ---------------------------------------------------------------------------
// Compilation (D1, D13)
// ---------------------------------------------------------------------------

const LOCKFILE_HEADER = 'GENERATED FILE — do not edit. Source: storyline.yml. Regenerate with: node scripts/compile.mjs';

/** Checksum of the storyline source text, stored in the lockfile to detect drift. */
export function storylineChecksum(sourceText) {
  return sha256(String(sourceText ?? ''));
}

/**
 * Fold brand colours into the caption settings.
 *
 * The caption box takes the brand's ink and the caption text takes its surface,
 * which is the pairing the brand already guarantees is readable — the same
 * contrast the deck's body copy relies on, inverted.
 *
 * Stored as plain hex under `colours`, NOT as ASS style fields, because two
 * renderers consume it: ffmpeg burns ASS (`&HAABBGGRR`, inverted alpha) and
 * Remotion styles a DOM node (CSS). Keeping the manifest renderer-neutral means
 * one source of truth converted at each edge, rather than an ASS colour that the
 * React path would have to decode backwards.
 *
 * `Fontname` is never branded: ASS carries a single font name with no fallback
 * list and cannot embed, so naming a brand font here would change caption
 * wrapping on any machine lacking it. Arial stays.
 *
 * With no brand this returns exactly what it used to, so existing storyboards
 * compile byte-identically.
 */
function brandedSubtitles(authored, brandPalette) {
  const base = authored ?? { enabled: true };
  if (!brandPalette?.ink && !brandPalette?.background) return base;
  return {
    ...base,
    colours: {
      box: brandPalette.ink,
      text: brandPalette.background,
      // Authored last: an explicit caption colour is a decision, not a default.
      ...(base.colours ?? {}),
    },
  };
}

/**
 * Compile a parsed storyline into a storyboard manifest.
 *
 * Entry ids become scene ids verbatim: `captureCacheKey` and `audioCacheKey`
 * are content-addressed rather than positional, so a regenerated storyboard
 * reuses the cache as long as ids are stable (V6). Reordering the storyline is
 * therefore free; renaming an id is not.
 *
 * `brandPalette` is the resolved brand's `{background, ink}` when a brand is
 * declared. It is passed in because this function is pure while the brand lives
 * on disk, and it is baked into the manifest here so that `compose.mjs` and the
 * Remotion templates never have to open DESIGN.md — the storyboard stays the
 * single contract every later stage reads.
 */
export function compileStoryline(
  storyline,
  { sourceText = '', engineOverride = null, brandPalette = null } = {}
) {
  const meta = presentationMeta(storyline);
  const mode = meta.mode ?? 'video';
  const engine = engineOverride ?? meta.engine ?? 'html';
  const slideEngine = engine === 'marp' ? 'marp_slides' : 'html_slides';
  const warnings = [];

  const outputs = (meta.outputs ?? [{ aspect: 'landscape' }]).map((o) =>
    typeof o === 'string' ? { aspect: o } : o
  );

  const scenes = [];
  for (const entry of storyline.entries ?? []) {
    const targets = entry.in ?? (mode === 'slides' ? ['deck'] : ['deck', 'video']);
    if (!targets.includes('video')) continue;

    const type = entry.type ?? 'slide';
    const scene = {
      id: entry.id,
      title: entry.title ?? entry.id,
      narration: entry.narration ?? '',
      role: entry.role ?? null,
    };

    if (entry.overlay === 'chapter') {
      scene.chapter = { title: entry.title ?? entry.id, description: entry.chapterDescription ?? undefined };
    }
    if (entry.transition) scene.transition = entry.transition;

    if (type === 'slide') {
      scene.visualEngine = slideEngine;
      scene.captureMode = 'stills';
      // Slide content travels with the scene so deck.mjs and capture.mjs read
      // one description, and so a storyboard diff shows what changed on screen.
      scene.slide = {
        layout: entry.layout ?? defaultLayoutFor(entry.role),
        theme: entry.theme ?? meta.theme ?? 'light',
        title: entry.title ?? null,
        pill: entry.pill ?? null,
        body: entry.body ?? null,
        cards: entry.cards ?? [],
        stat: entry.stat ?? null,
        image: entry.image ?? null,
        htmlPath: entry.htmlPath ?? null,
        portraitHtmlPath: entry.portraitHtmlPath ?? null,
        notes: entry.narration ?? null,
        // Present only when used, so storyboards without diagrams or URL pages
        // keep byte-identical slides and therefore unchanged capture cache keys.
        ...diagramAndUrlFields(entry, storyline.entries),
      };
      if (entry.animation) scene.slide.animation = entry.animation;
      // D12: slides own their CSS, so reflow is the correct vertical strategy.
      scene.vertical = { strategy: 'native' };
    } else if (type === 'capture') {
      scene.visualEngine = 'playwright_web';
      scene.captureMode = entry.captureMode ?? 'screencast';
      scene.actionSpec = {
        url: entry.url,
        ...(entry.waitUntil ? { waitUntil: entry.waitUntil } : {}),
        ...(entry.setupScript ? { setupScript: entry.setupScript } : {}),
        ...(entry.roiSelector ? { roiSelector: entry.roiSelector } : {}),
        ...(entry.steps ? { steps: entry.steps } : {}),
      };
      if (entry.assert) scene.assert = entry.assert;
      if (entry.roiSelector) scene.roiSelector = entry.roiSelector;
      if (entry.viewport) scene.viewport = entry.viewport;
      if (entry.overlay === 'pip' && entry.pip) scene.pip = entry.pip;
    } else {
      scene.visualEngine = 'manual_footage';
      scene.captureMode = 'screencast';
      scene.actionSpec = {
        src: entry.src,
        ...(entry.trim ? { trim: entry.trim } : {}),
        ...(entry.generate ? { generate: entry.generate } : {}),
      };
      if (entry.useFootageAudio) scene.useFootageAudio = true;
    }

    scenes.push(scene);
  }

  if (scenes.length === 0 && mode !== 'slides') {
    warnings.push('no entry targets the video — the compiled storyboard has no scenes');
  }

  const manifest = {
    $generated: LOCKFILE_HEADER,
    $source: { file: meta.sourceFile ?? 'storyline.yml', checksum: storylineChecksum(sourceText) },
    meta: {
      title: meta.title,
      mode,
      fps: meta.fps ?? 30,
      captureAspect: meta.captureAspect ?? meta.aspect ?? 'landscape',
      outputs,
      voice: { provider: meta.voice?.provider ?? 'auto', ...(meta.voice ?? {}) },
      subtitles: brandedSubtitles(meta.subtitles, brandPalette),
      // Precedence: what the author wrote, then the brand's surface, then the
      // theme built-in. The letterbox bars and the Remotion stage read this, so
      // branding it here is what stops a terracotta deck sitting on slate bars.
      background:
        meta.background ?? brandPalette?.background ?? ((meta.theme ?? 'light') === 'light' ? '#F1F5F9' : '#0F172A'),
      ...(meta.baseUrl ? { baseUrl: meta.baseUrl } : {}),
      ...(meta.fixedTime ? { fixedTime: meta.fixedTime } : {}),
      ...(meta.bgm ? { bgm: meta.bgm } : {}),
      deck: {
        archetype: meta.archetype ?? null,
        engine,
        theme: meta.theme ?? 'light',
        formats: meta.formats ?? ['png', 'pdf'],
        // The deck-level canvas set, recorded only for a slides presentation so
        // deck.mjs never needs the storyline to know what a slide defaults to.
        // The DECLARATION, not the union: a slide that opts into portrait must
        // not drag every other slide onto the portrait canvas with it. deck.mjs
        // computes the union of this and the per-slide overrides at render time.
        // A video presentation's deck follows `video.outputs`, so emitting it
        // there would give one fact two homes (D22).
        ...(mode === 'slides'
          ? { orientations: Array.isArray(meta.orientations) && meta.orientations.length ? meta.orientations : ['landscape'] }
          : {}),
        // Omitted entirely when absent, so a storyboard compiled before brands
        // existed stays byte-comparable and its cache keys do not move.
        ...(meta.design ? { design: meta.design } : {}),
        ...(meta.designDark ? { designDark: meta.designDark } : {}),
        ...(meta.fontFile ? { fontFile: meta.fontFile } : {}),
      },
    },
    scenes,
  };

  return { manifest, warnings };
}

/**
 * The optional slide fields added for diagrams and URL-sourced custom pages.
 * Shared by the compiler and the deck-only path in deck.mjs, so a deck-only
 * slide and a video slide carry an identical description.
 */
export function diagramAndUrlFields(entry, entries = []) {
  const out = {};
  const diagram = resolveDiagram(entry, entries);
  if (diagram) out.diagram = diagram;
  if (entry.htmlUrl) out.htmlUrl = entry.htmlUrl;
  if (entry.portraitHtmlUrl) out.portraitHtmlUrl = entry.portraitHtmlUrl;
  return out;
}

/** Entries that render into the standalone deck, in authored order. */
export function deckEntries(storyline) {
  return (storyline.entries ?? []).filter((e) => (e.in ?? ['deck', 'video']).includes('deck') && (e.type ?? 'slide') === 'slide');
}

/**
 * Has the lockfile been hand-edited, or does it predate the current source?
 *
 * Returns a reason string, or null when regeneration is safe. Overwriting a
 * hand-edited lockfile silently is how a generated-file model loses trust.
 */
export function lockfileStatus(existingManifest, sourceText) {
  if (!existingManifest) return null;
  if (!existingManifest.$generated) {
    return 'storyboard.json exists but carries no generated-file marker — it looks hand-authored';
  }
  const recorded = existingManifest.$source?.checksum;
  if (recorded && recorded !== storylineChecksum(sourceText)) return null; // source changed: expected
  return null;
}

/** Short digest of a slide's rendered inputs, for asset filenames and caching. */
export function slideAssetKey(slide, orientation) {
  return digest({ kind: 'slide', orientation, slide });
}
