/**
 * Bento slide renderer: structured content -> a single self-contained HTML page.
 *
 * Pure string generation on purpose (D21 tier 1): the layout logic is the part
 * most likely to regress, and it is testable with system Node alone. deck.mjs
 * only adds a browser to turn this HTML into pixels and to *measure* it.
 *
 * Authors never write this HTML (D4). They pick a layout id and supply content,
 * which is what keeps the design system a constraint rather than a suggestion.
 */

import { LAYOUTS } from './deck.mjs';

export const CANVAS = {
  landscape: { width: 1920, height: 1080 },
  vertical: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
};

/**
 * Theme tokens. Both variants use identical names so no layout ever branches on
 * theme (D17) — only the values change, which keeps the layouts
 * single-implementation.
 */
export const THEME_TOKENS = {
  light: {
    '--bg': '#F1F5F9',
    '--card': '#FFFFFF',
    '--card-alt': '#F8FAFC',
    '--primary': '#0F172A',
    '--secondary': '#64748B',
    '--accent-1': '#10B981',
    '--rule': '#E2E8F0',
    '--shadow': '0 1px 2px rgba(15,23,42,.04), 0 12px 32px rgba(15,23,42,.08)',
  },
  dark: {
    '--bg': '#0F172A',
    '--card': '#1E293B',
    '--card-alt': '#243044',
    '--primary': '#F1F5F9',
    '--secondary': '#94A3B8',
    '--accent-1': '#34D399',
    '--rule': '#334155',
    '--shadow': '0 1px 2px rgba(0,0,0,.25), 0 12px 32px rgba(0,0,0,.35)',
  },
};

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/**
 * Inline an icon by name.
 *
 * `icons` is injected rather than read from disk so this module stays pure.
 * A missing icon renders an explicit marker instead of empty space: the
 * validator already fails unknown names (D18), so anything reaching here is a
 * wiring bug and should be visible, not invisible.
 */
function icon(name, icons) {
  if (!name) return '';
  const svg = icons?.[name];
  if (!svg) return `<span class="icon icon-missing" data-icon-missing="${esc(name)}">?</span>`;
  return `<span class="icon">${svg}</span>`;
}

function card(c, icons, extraClass = '') {
  return [
    `<div class="card ${extraClass}" data-measure="card">`,
    c.icon ? `<div class="card-icon">${icon(c.icon, icons)}</div>` : '',
    c.title ? `<div class="card-title" data-measure="text">${esc(c.title)}</div>` : '',
    c.text ? `<div class="card-text" data-measure="text">${esc(c.text)}</div>` : '',
    c.detail ? `<div class="card-detail" data-measure="text">${esc(c.detail)}</div>` : '',
    '</div>',
  ].join('');
}

function statBlock(stat, icons) {
  return [
    '<div class="card stat" data-measure="card">',
    stat.icon ? `<div class="card-icon">${icon(stat.icon, icons)}</div>` : '',
    `<div class="stat-value" data-measure="text">${esc(stat.value)}${stat.unit ? `<span class="stat-unit">${esc(stat.unit)}</span>` : ''}</div>`,
    stat.label ? `<div class="stat-label" data-measure="text">${esc(stat.label)}</div>` : '',
    '</div>',
  ].join('');
}

/**
 * A frozen diagram-design drawing, inlined. `svg` is supplied by the renderer
 * (read from diagrams/); a missing drawing renders a conspicuous placeholder so
 * the PNG review still works under --allow-stale-diagrams, exactly as a missing
 * icon renders the magenta marker rather than nothing.
 */
function diagramFrame(s, extraClass = '') {
  const inner = s.diagramSvg
    ? s.diagramSvg
    : `<div class="diagram-missing" data-diagram-missing="${esc(s.diagram?.id ?? '')}">diagram “${esc(s.diagram?.id ?? '?')}” not drawn</div>`;
  return `<div class="diagram-frame ${extraClass}" data-measure="diagram" data-diagram="${esc(s.diagram?.id ?? '')}">${inner}</div>`;
}

/** Layout bodies. Each returns the inner HTML of `.slide-body`. */
const BODIES = {
  /**
   * A diagram carries the slide; up to two cards support it on the right. The
   * diagram is the primary element, so the cards are deliberately the narrower
   * track — never a peer of the drawing.
   */
  diagram: (s, icons) => {
    const cards = s.cards ?? [];
    return [
      header(s),
      `<div class="diagram${cards.length ? ' with-cards' : ''}">`,
      diagramFrame(s),
      cards.length ? `<div class="diagram-cards">${cards.map((c) => card(c, icons, 'detail')).join('')}</div>` : '',
      '</div>',
    ].join('');
  },

  hero: (s, icons) =>
    [
      '<div class="hero">',
      '<div class="hero-copy">',
      s.pill ? `<div class="pill" data-measure="text">${esc(s.pill)}</div>` : '',
      `<h1 class="title hero-title" data-measure="text">${esc(s.title)}</h1>`,
      s.body ? `<p class="body" data-measure="text">${esc(s.body)}</p>` : '',
      '</div>',
      '<div class="hero-visual">',
      s.diagram ? diagramFrame(s) : (s.cards ?? []).map((c) => card(c, icons)).join(''),
      '</div>',
      '</div>',
    ].join(''),

  /**
   * One claim, centred, nothing else.
   *
   * Distinct from `hero` rather than a zero-card variant of it: hero splits the
   * canvas into a copy column and a visual column, so with no cards it renders a
   * half-width block of text against an empty half. A claim that carries the
   * whole slide needs the whole slide.
   */
  statement: (s) =>
    [
      '<div class="statement">',
      s.pill ? `<div class="pill" data-measure="text">${esc(s.pill)}</div>` : '',
      `<h1 class="title statement-title" data-measure="text">${esc(s.title)}</h1>`,
      s.body ? `<p class="body statement-body" data-measure="text">${esc(s.body)}</p>` : '',
      '</div>',
    ].join(''),

  /**
   * One dominant card plus two or three supporting ones.
   *
   * The lead card spans every row; the column ratio is what makes the dominance
   * visible. Three and four cards both work unchanged, which is why the advisor
   * does not fork on the card count.
   */
  spotlight: (s, icons) =>
    [
      header(s),
      '<div class="grid spotlight">',
      s.diagram ? diagramFrame(s, 'lead') : card((s.cards ?? [])[0] ?? {}, icons, 'lead'),
      (s.diagram ? s.cards ?? [] : (s.cards ?? []).slice(1)).map((c) => card(c, icons, 'detail')).join(''),
      '</div>',
    ].join(''),

  'bento-b': (s, icons) =>
    [
      header(s),
      '<div class="grid bento-b">',
      s.diagram ? diagramFrame(s, 'span-wide') : card(s.cards[0] ?? {}, icons, 'span-wide'),
      (s.diagram ? s.cards ?? [] : (s.cards ?? []).slice(1)).map((c) => card(c, icons, 'detail')).join(''),
      '</div>',
    ].join(''),

  tiled: (s, icons) =>
    [header(s), `<div class="grid tiled cols-${(s.cards ?? []).length}">`, (s.cards ?? []).map((c) => card(c, icons)).join(''), '</div>'].join(''),

  'process-flow': (s, icons) =>
    [
      header(s),
      '<div class="flow">',
      `<div class="flow-hub">${card(s.cards[0] ?? {}, icons, 'hub')}</div>`,
      `<div class="flow-nodes">${(s.cards ?? []).slice(1).map((c) => card(c, icons, 'node')).join('')}</div>`,
      '</div>',
    ].join(''),

  lifecycle: (s, icons) =>
    [
      header(s),
      '<div class="lifecycle">',
      '<div class="lifecycle-rail" aria-hidden="true"></div>',
      (s.cards ?? [])
        .map((c, i) => card({ ...c, detail: c.detail ?? `Phase ${i + 1}` }, icons, 'phase'))
        .join(''),
      '</div>',
    ].join(''),

  /**
   * Recurring stages with no terminus (PDCA, a retention loop).
   *
   * Derived from `lifecycle` so it inherits the rail + phase CSS that already
   * renders, changing only the CLAIM: one explicit return connector runs from
   * the last stage back to the first, so the shape asserts recurrence rather
   * than an end. No SVG ring and no hand-rolled arrow geometry — the connector
   * is a plain element the stylesheet positions, exactly as the lifecycle rail
   * is. A straight rail drawn for a loop would be a false statement about the
   * content, which is the whole reason this layout is separate from lifecycle.
   */
  cycle: (s, icons) =>
    [
      header(s),
      '<div class="cycle">',
      '<div class="lifecycle-rail" aria-hidden="true"></div>',
      '<div class="cycle-return" aria-hidden="true" data-cycle-return="last-to-first"></div>',
      (s.cards ?? [])
        .map((c, i) => card({ ...c, detail: c.detail ?? `Stage ${i + 1}` }, icons, 'phase'))
        .join(''),
      '</div>',
    ].join(''),

  comparison: (s, icons) =>
    [
      header(s),
      '<div class="grid comparison">',
      card(s.cards[0] ?? {}, icons, 'side-old'),
      card(s.cards[1] ?? {}, icons, 'side-new'),
      '</div>',
    ].join(''),

  'stat-deepdive': (s, icons) =>
    [
      header(s),
      '<div class="deepdive">',
      statBlock(s.stat ?? {}, icons),
      `<div class="deepdive-details">${(s.cards ?? []).map((c) => card(c, icons, 'detail')).join('')}</div>`,
      '</div>',
    ].join(''),
};

function header(s) {
  return [
    '<div class="slide-header">',
    s.pill ? `<div class="pill" data-measure="text">${esc(s.pill)}</div>` : '',
    `<h1 class="title" data-measure="text">${esc(s.title)}</h1>`,
    s.body ? `<p class="body" data-measure="text">${esc(s.body)}</p>` : '',
    '</div>',
  ].join('');
}

/**
 * CSS for one canvas size.
 *
 * Sizes are fixed to the canvas rather than responsive: the render target is a
 * known 1920x1080 or 1080x1920 surface, and fixed sizing is what makes overflow
 * detection meaningful. Portrait rules (D12) are folded in per layout.
 */
/**
 * Resolve the CSS custom properties for one slide.
 *
 * This is the single seam brand tokens arrive through. `overrides` wins over
 * the built-in palette one variable at a time, so a partially-specified brand
 * leaves every unspecified variable at its built-in value rather than blanking
 * it. Spreading over the base also preserves key order, which is what keeps the
 * emitted `:root` block byte-identical when no overrides are supplied — asserted
 * in lib/deck.test.mjs so the resolver cannot silently drift from the palettes.
 *
 * Pure by design: callers resolve the brand file and pass the result in, the
 * same way `icons` and `fontCss` are injected, so this module never reads disk.
 */
export function resolveThemeTokens(theme = 'light', overrides = null) {
  const base = THEME_TOKENS[theme] ?? THEME_TOKENS.light;
  return overrides ? { ...base, ...overrides } : { ...base };
}

/**
 * @param {boolean} [opts.scoped]  When true, emit a marpit-scoped variant: the
 *   sheet is unchanged except that marp's own `<section>` (its per-slide root)
 *   is given the same canvas size, background, colour and font the HTML path
 *   puts on `html,body` and `.slide`. This is the SINGLE intended difference
 *   between the two consumers (D-marp): brand tokens still resolve exactly once,
 *   through the same generator. Defaults to false so the HTML path stays
 *   BYTE-IDENTICAL — asserted in lib/deck.test.mjs and lib/marp.test.mjs.
 */
export function slideCss({ orientation = 'landscape', theme = 'light', fontFamily = 'Inter', themeTokens = null, brand = null, scoped = false } = {}) {
  const { width, height } = CANVAS[orientation] ?? CANVAS.landscape;
  const portrait = orientation === 'vertical';
  const tokens = Object.entries(resolveThemeTokens(theme, themeTokens))
    .map(([k, v]) => `${k}:${v};`)
    .join('');
  const s = portrait ? 1.15 : 1; // portrait has less width but more height per line

  /**
   * Make a grid hug its content and centre in the space left under the header,
   * instead of filling it.
   *
   * Used by the peer layouts only (see the comment on `.grid`). Auto block margins
   * do the centring, `flex-basis:auto` makes the box as tall as its rows, and
   * `flex-shrink:1` with `min-height:0` is retained so content that genuinely
   * cannot fit still shrinks and still trips the overflow gate, exactly as before.
   */
  const hugContent = 'flex:0 1 auto;margin-block:auto';

  /**
   * Font size for a named level, in canvas pixels.
   *
   * The brand may raise or lower heading dominance; `fallback` is the canvas
   * size that has always applied. With no brand every call returns exactly what
   * the literal used to, which is what keeps the emitted CSS byte-identical.
   */
  const fz = (level, fallback) => Math.round((brand?.typeScale?.[level] ?? fallback) * s);

  /** Brand pass-through declarations (weight, tracking, leading) for a level. */
  const pt = (level) => {
    const decls = brand?.passthrough?.[level];
    if (!decls) return '';
    return Object.entries(decls)
      .map(([k, v]) => `${k}:${v};`)
      .join('');
  };

  const radius = brand?.radius ?? 28;

  /**
   * The body font stack.
   *
   * A brand family that could not be embedded still leads the stack, so a
   * machine that has it installed renders the brand; `fontFallback` names the
   * bundled family behind it so a machine that does not lands on known metrics
   * rather than on an arbitrary system default. With no brand this is byte-for-
   * byte the stack that has always been emitted.
   */
  const stack =
    brand?.fontFallback && brand.fontFallback !== fontFamily
      ? `'${fontFamily}','${brand.fontFallback}',system-ui,sans-serif`
      : `'${fontFamily}',system-ui,sans-serif`;

  return `
:root{${tokens}--pad:${Math.round(88 * (portrait ? 0.72 : 1))}px;--gap:${portrait ? 28 : 32}px;--radius:${radius}px}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${width}px;height:${height}px;overflow:hidden}
body{background:var(--bg);color:var(--primary);font-family:${stack};
  font-feature-settings:'ss01','cv11';-webkit-font-smoothing:antialiased${
    brand?.fontFallback
      ? // Only when the brand family could not be embedded. Holding x-height
        // steady across the substituted family is what stops line counts -
        // and therefore the hard overflow gate - varying per machine. Not
        // applied otherwise: the bundled font never falls back, so this would
        // only perturb a rendering that is already deterministic.
        ';font-size-adjust:from-font'
      : ''
  }}
.slide{width:${width}px;height:${height}px;padding:var(--pad);display:flex;flex-direction:column;gap:var(--gap);overflow:hidden}
.slide-body{flex:1;min-height:0;display:flex;flex-direction:column;gap:var(--gap)}
.slide-header{display:flex;flex-direction:column;gap:14px;flex:0 0 auto}
.title{font-size:${fz('title', 64)}px;font-weight:800;letter-spacing:-.02em;line-height:1.06;text-wrap:balance;${pt('title')}}
.hero-title{font-size:${fz('hero-title', 96)}px;text-wrap:balance}
.body{font-size:${fz('body', 28)}px;font-weight:400;color:var(--secondary);line-height:1.4;max-width:38ch;text-wrap:pretty;${pt('body')}}
/* Declared after .title and .body so the single-class overrides win on order. */
.statement{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;gap:${portrait ? 24 : 30}px}
.statement-title{font-size:${fz('hero-title', 96)}px;max-width:26ch}
.statement-body{font-size:${fz('body', 28)}px;max-width:46ch}
.pill{align-self:flex-start;background:var(--primary);color:var(--bg);font-size:${fz('pill', 20)}px;
  font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:10px 22px;border-radius:999px}
.card{background:var(--card);border-radius:var(--radius);box-shadow:var(--shadow);padding:${Math.round(40 * (portrait ? 0.8 : 1))}px;
  display:flex;flex-direction:column;justify-content:center;gap:14px;min-width:0;min-height:0;overflow:hidden}
.card-icon{margin-bottom:6px;width:${Math.round(56 * s)}px;height:${Math.round(56 * s)}px;border-radius:16px;background:color-mix(in srgb,var(--accent-1) 14%,transparent);
  display:flex;align-items:center;justify-content:center;color:var(--accent-1);flex:0 0 auto}
.icon svg{width:${Math.round(30 * s)}px;height:${Math.round(30 * s)}px;stroke:currentColor;fill:none;stroke-width:2}
/* Deliberately unbranded: a missing icon is a wiring bug and must stay
   conspicuous, so this marker never takes a brand colour. */
.icon-missing{color:#FF00FF;font-weight:800;font-size:${Math.round(28 * s)}px}
.card-title{font-size:${fz('card-title', 34)}px;font-weight:700;line-height:1.15;text-box:trim-both cap alphabetic;${pt('card-title')}}
.card-text{font-size:${fz('card-text', 24)}px;color:var(--secondary);line-height:1.4;text-wrap:pretty}
.card-detail{margin-top:6px;font-size:${fz('card-detail', 19)}px;font-weight:700;letter-spacing:.06em;
  text-transform:uppercase;color:var(--accent-1)}
.grid{flex:1;min-height:0;display:grid;gap:var(--gap)}
/* A card is stretched to its row ONLY where the stretch is the dominance signal.
   Everywhere else the row hugs its content.

   In a peer layout (tiled, lifecycle, cycle, comparison — every layout whose
   LAYOUTS entry has "dominant: null") no card outranks another, so the grid has no
   reason to allocate space unequally and ends up allocating it equally AND
   maximally: every card grows to the full body height whatever it holds. Measured
   on a real 84-slide deck, that put 225px of content in an 804px card — a 0.38 fill
   ratio, so ~62% of every card was empty. That inverts the weighting model,
   because a light card rendered as a tall slab READS as heavy: visual weight stops
   tracking information weight, which is the one thing the layout is supposed to
   communicate. Hugging moves the whitespace BETWEEN cards, where it separates
   them, instead of inside a card where it only dilutes it. Cards still share one
   row height, which is what peer content wants.

   bento-b, spotlight, flow and deepdive are deliberately untouched: each encodes
   dominance in an explicit track ratio (1.5fr, 1.6fr, 1.1fr, 1.35fr), and hugging
   would hand the biggest slot to whichever card happens to hold the most words —
   exactly the text-length-as-importance mistake the weight field exists to undo. */
.hero{flex:1;min-height:0;display:grid;gap:var(--gap);grid-template-columns:1fr 1fr;align-items:center}
.hero-copy{display:flex;flex-direction:column;gap:24px}
.hero-visual{display:grid;gap:var(--gap);align-content:center;height:100%}
/* 1.6fr is the whole point: an even split would read as two equal cards, which
   is a peer claim. The lead spans every row, so three or four cards work
   unchanged without the layout branching on count. */
.spotlight{grid-template-columns:1.6fr 1fr;grid-auto-rows:1fr}
/* \`1 / -1\` would span the EXPLICIT grid, which has no rows, so the lead used to
   occupy one implicit row: half the height, a peer of its neighbour. Spanning
   the support count is what makes the lead the dominant slot it claims to be. */
.spotlight .lead{grid-row:span 2}
.spotlight:has(>:nth-child(4)) .lead{grid-row:span 3}
.bento-b{grid-template-columns:1fr 1fr;grid-template-rows:1.5fr 1fr}
.bento-b .span-wide{grid-column:1 / span 2}
.tiled{grid-auto-flow:column;grid-auto-columns:1fr;${hugContent}}
.flow{flex:1;min-height:0;display:grid;grid-template-columns:1.1fr 1fr;gap:var(--gap);align-items:stretch}
.flow-nodes{display:grid;gap:var(--gap)}
.flow-hub{position:relative;display:flex}
.flow-hub .card{flex:1}
.flow-hub::after{content:'';position:absolute;right:calc(var(--gap) * -1);top:50%;width:var(--gap);height:4px;
  background:var(--accent-1);border-radius:2px}
.lifecycle{position:relative;min-height:0;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:var(--gap);${hugContent}}
.lifecycle-rail{position:absolute;left:0;right:0;top:50%;height:4px;background:var(--accent-1);opacity:.35}
.lifecycle .card{position:relative}
/* cycle reuses lifecycle's rail and phase cards; the ONLY addition is the return
   connector that runs from the last stage back to the first, so the arrangement
   claims recurrence rather than an end. A straight rail drawn for a loop would
   lie about the content. */
.cycle{position:relative;min-height:0;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:var(--gap);${hugContent}}
.cycle .card{position:relative}
.cycle-return{position:absolute;left:0;right:0;bottom:-2px;height:4px;background:var(--accent-1);opacity:.55;
  border-radius:2px}
.cycle-return::before,.cycle-return::after{content:'';position:absolute;width:4px;height:calc(var(--pad) / 2);
  background:var(--accent-1);opacity:.55;top:calc(var(--pad) / -2)}
.cycle-return::before{left:0}
.cycle-return::after{right:0}
.comparison{grid-template-columns:1fr 1fr;${hugContent}}
.side-old{background:var(--card-alt);box-shadow:none;border:2px solid var(--rule)}
.side-old .card-icon{background:color-mix(in srgb,var(--secondary) 14%,transparent);color:var(--secondary)}
.side-old .card-detail{color:var(--secondary)}
.side-new{outline:3px solid var(--accent-1);outline-offset:-3px}
.deepdive{flex:1;min-height:0;display:grid;grid-template-rows:1.35fr 1fr;gap:var(--gap)}
.deepdive-details{display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:var(--gap)}
.stat{align-items:flex-start;justify-content:center}
.stat-value{font-size:${fz('stat-value', 140)}px;font-weight:800;letter-spacing:-.03em;line-height:1}
.stat-unit{font-size:${fz('stat-unit', 44)}px;font-weight:700;color:var(--secondary);margin-left:.28em}
.stat-label{font-size:${fz('stat-label', 28)}px;color:var(--secondary)}
/* A frozen diagram scales to its slot with its aspect kept (the SVG default,
   preserveAspectRatio="xMidYMid meet"), so nothing is cropped and nothing
   overflows. It sits on the slide surface with no card, no padding and no shadow:
   diagram-design's skin forbids shadows, and a card around a drawing would read
   as a second, nested frame. */
.diagram{flex:1;min-height:0;display:grid;gap:var(--gap);grid-template-columns:1fr}
.diagram.with-cards{grid-template-columns:2.2fr 1fr}
.diagram-cards{display:grid;gap:var(--gap);align-content:center;min-height:0}
.diagram-frame{min-width:0;min-height:0;display:flex;align-items:center;justify-content:center;overflow:hidden}
.diagram-frame>svg{width:100%;height:100%;display:block}
/* A diagram in hero's visual column fills it rather than sizing to its own aspect. */
.hero:has(.diagram-frame){grid-template-rows:minmax(0,1fr)}
.hero-visual:has(>.diagram-frame){grid-template-rows:minmax(0,1fr);align-content:stretch;min-height:0}
/* Deliberately unbranded, like the missing-icon marker: an undrawn diagram is a
   wiring gap and must stay conspicuous in the PNG review. */
.diagram-missing{border:4px dashed #FF00FF;color:#FF00FF;font-weight:800;font-size:${fz('card-title', 34)}px;
  width:100%;height:100%;display:flex;align-items:center;justify-content:center}
${portrait ? portraitCss() : ''}
${scoped ? marpSectionCss({ width, height, portrait, stack, brand }) : ''}
`.trim();
}

/**
 * The one rule the marp consumer adds and the HTML consumer does not.
 *
 * Marp renders each slide as its own `<section>`, so `section` is marp's
 * equivalent of `html,body` + `.slide` combined: it is the fixed canvas that
 * makes overflow measurable, and it carries the background, ink and font that
 * `body` and `.slide` carry on the HTML path. The `_class` layout directive
 * lands its class here too, so the grids declared above resolve unchanged. The
 * font-smoothing and fallback declarations mirror `body` verbatim so a brand
 * whose family could not be embedded wraps identically on both renderers — the
 * one-rasteriser guarantee only holds if the font resolves the same way.
 *
 * Emitted only in the scoped variant, appended last so it overrides marpit's
 * built-in `section` centring; the unscoped sheet never sees it, which is what
 * keeps the HTML path byte-identical.
 */
function marpSectionCss({ width, height, portrait, stack, brand }) {
  const pad = Math.round(88 * (portrait ? 0.72 : 1));
  const smoothing = brand?.fontFallback ? ';font-size-adjust:from-font' : '';
  return `section{width:${width}px;height:${height}px;padding:var(--pad);margin:0;overflow:hidden;
  display:flex;flex-direction:column;gap:var(--gap);background:var(--bg);color:var(--primary);
  font-family:${stack};font-feature-settings:'ss01','cv11';-webkit-font-smoothing:antialiased${smoothing};--pad:${pad}px}`;
}

/**
 * Portrait reflow rules (D12). Each layout has a declared behaviour; reflow is
 * safe here because we own the CSS, unlike an app captured at a mobile
 * viewport where re-rendering changes the story rather than shrinking it.
 */
function portraitCss() {
  // The peer layouts (tiled, lifecycle, cycle, comparison) keep the landscape rule
  // that a row hugs its content: `1fr` rows inside a content-sized box are
  // ambiguous, and `max-content` says the intent outright. It also makes the
  // lifecycle rail and the cycle return connector span exactly the card stack,
  // because both are positioned against a box that now ends where the cards do.
  return `
.hero{grid-template-columns:1fr;grid-template-rows:auto 1fr}
.hero:has(.diagram-frame){grid-template-rows:auto minmax(0,1fr)}
/* The lead keeps its dominance by height rather than by width. One explicit
   1.4fr row plus implicit 1fr rows covers both three and four cards. */
.spotlight{grid-template-columns:1fr;grid-template-rows:1.4fr}
.spotlight .lead,.spotlight:has(>:nth-child(4)) .lead{grid-row:auto}
.statement-title{max-width:18ch}
.statement-body{max-width:30ch}
.bento-b{grid-template-columns:1fr;grid-template-rows:1.4fr 1fr 1fr}
.bento-b .span-wide{grid-column:1}
.tiled{grid-auto-flow:row;grid-template-columns:1fr 1fr;grid-auto-rows:max-content}
.tiled.cols-3 .card:nth-child(3){grid-column:1 / span 2}
.flow{grid-template-columns:1fr;grid-template-rows:1fr 2fr}
.flow-hub::after{right:50%;top:auto;bottom:calc(var(--gap) * -1);width:4px;height:var(--gap);transform:translateX(50%)}
.lifecycle{grid-auto-flow:row;grid-auto-rows:max-content}
.lifecycle-rail{left:calc(var(--pad) / -1 + 24px);right:auto;top:0;bottom:0;width:4px;height:auto}
/* Portrait cycle: stages stack top-to-bottom; the return connector runs down the
   right edge from the last stage back to the first, so the loop claim survives
   the reflow (the layout's declared portrait rule). */
.cycle{grid-auto-flow:row;grid-auto-rows:max-content}
.cycle-return{left:auto;right:-2px;top:0;bottom:0;width:4px;height:auto}
.cycle-return::before,.cycle-return::after{width:calc(var(--pad) / 2);height:4px;top:auto}
.cycle-return::before{left:calc(var(--pad) / -2);top:0}
.cycle-return::after{left:calc(var(--pad) / -2);right:auto;bottom:0;top:auto}
.comparison{grid-template-columns:1fr;grid-template-rows:max-content max-content}
.deepdive{grid-template-rows:1fr 1.2fr}
.deepdive-details{grid-auto-flow:row;grid-template-columns:1fr 1fr}
.diagram.with-cards{grid-template-columns:1fr;grid-template-rows:1fr max-content}
.diagram-cards{grid-auto-flow:column;grid-auto-columns:1fr}
`.trim();
}

/**
 * Render one slide to a complete HTML document.
 *
 * @param {object}  slide        compiled `scene.slide`
 * @param {string}  orientation  landscape | vertical | square
 * @param {object}  icons        name -> inline SVG
 * @param {string}  fontCss      @font-face rules (bundled font, so no substitution)
 */
export function renderSlideHtml({ slide, orientation = 'landscape', icons = {}, fontCss = '', fontFamily = 'Inter', themeTokens = null, brand = null }) {
  const layout = slide.layout ?? 'spotlight';
  const theme = slide.theme ?? 'light';
  if (layout === 'custom') {
    throw new Error('layout "custom" is rendered from its htmlPath, not from the template layer');
  }
  const body = (BODIES[layout] ?? BODIES.spotlight)(slide, icons);
  return `<!doctype html>
<html lang="en" data-layout="${esc(layout)}" data-theme="${esc(theme)}" data-orientation="${esc(orientation)}">
<head><meta charset="utf-8"><title>${esc(slide.title ?? layout)}</title>
<style>${fontCss}</style>
<style>${slideCss({ orientation, theme, fontFamily, themeTokens, brand })}</style>
</head>
<body><div class="slide" data-measure="slide"><div class="slide-body">${body}</div></div></body>
</html>`;
}

/** Human-readable portrait rule for a layout, surfaced in docs and reports. */
export function portraitRuleFor(layout) {
  return LAYOUTS[layout]?.portrait ?? null;
}

/**
 * Browser-side measurement used for the overflow invariant (D14).
 *
 * Returned as a string so it can be handed to page.evaluate without bundling.
 * Measures scroll vs client box on every marked element: a clipped card passes
 * every other automated check, exactly like a 404 capture does.
 *
 * The selector list is a parameter because the marp engine renders a DIFFERENT
 * element tree — CSS cannot add attributes, so a markdown-native slide carries no
 * `data-measure` and a hardcoded selector would find nothing and pass silently.
 * That would be an unannounced downgrade rather than a second renderer. Defaults
 * to the HTML path's attribute so its behaviour is unchanged.
 */
export const MEASURE_FN = `(selectors) => {
  const list = (selectors && selectors.length ? selectors : ['[data-measure]']).join(',');
  const out = { overflow: [], cards: 0, columns: null, missingIcons: [] };
  const root = document.querySelector('[data-measure="slide"], section');
  const TOL = 2; // sub-pixel layout and descenders are not clipping
  for (const el of document.querySelectorAll(list)) {
    const cs = getComputedStyle(el);
    // Only a container that actually hides overflow can clip anything. Text
    // boxes with a tight line-height always report a few pixels of scroll
    // height from descenders, which is not a defect and must not fail a build.
    const clipsY = /hidden|clip|auto|scroll/.test(cs.overflowY);
    const clipsX = /hidden|clip|auto|scroll/.test(cs.overflowX);
    const dy = clipsY ? el.scrollHeight - el.clientHeight : 0;
    const dx = clipsX ? el.scrollWidth - el.clientWidth : 0;
    if (dy > TOL || dx > TOL) {
      out.overflow.push({
        // No attribute on the marp tree, so name the element instead: the report
        // has to be actionable on both engines.
        kind: el.getAttribute('data-measure') || el.tagName.toLowerCase() + (el.classList[0] ? '.' + el.classList[0] : ''),
        text: (el.textContent || '').trim().slice(0, 80),
        overflowY: Math.max(0, dy), overflowX: Math.max(0, dx),
      });
    }
  }
  out.cards = document.querySelectorAll('.card, section blockquote').length;
  const grid = document.querySelector('.grid, .flow, .lifecycle, .deepdive, .hero, section');
  if (grid) out.columns = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length;
  for (const el of document.querySelectorAll('[data-icon-missing]')) out.missingIcons.push(el.getAttribute('data-icon-missing'));
  if (root) out.canvas = { width: root.clientWidth, height: root.clientHeight, scrollHeight: root.scrollHeight };
  return out;
}`;

/**
 * The same measurement as a self-invoking expression.
 *
 * page.evaluate given a bare function *string* returns the function rather than
 * calling it, so the invocation has to be explicit.
 */
export const MEASURE_EXPR = `(${MEASURE_FN})()`;

/**
 * Rendered size of every text run inside an embedded diagram, in canvas pixels.
 *
 * An SVG's font-size is in viewBox units; what a viewer reads is that size times
 * the scale the SVG was embedded at, which getScreenCTM() reports including any
 * transform inside the drawing. Measured, not modelled: no capacity table can
 * know how a particular drawing was laid out. `caps` marks all-caps runs, which
 * have a lower floor because cap height, not x-height, binds them.
 */
export const DIAGRAM_TEXT_EXPR = `(() => {
  const out = [];
  for (const el of document.querySelectorAll('.diagram-frame svg text')) {
    const text = (el.textContent || '').trim();
    if (!text) continue;
    const ctm = el.getScreenCTM();
    const scale = ctm ? Math.hypot(ctm.a, ctm.b) : 1;
    const px = parseFloat(getComputedStyle(el).fontSize) * scale;
    // No lowercase letters: digits and capitals sit on cap height, not x-height.
    const caps = !/[a-z]/.test(text);
    out.push({ text: text.slice(0, 40), px: Math.round(px * 10) / 10, caps });
  }
  return out;
})()`;

/**
 * Measurement with the brand checks added: contrast, and whether the requested
 * font family actually resolved.
 *
 * Contrast is computed from COMPUTED STYLES in the browser, never from the
 * declared token pairs, for three reasons. design.md permits oklch, oklab, lch,
 * lab, hwb and color-mix, and getComputedStyle resolves every one of them to
 * sRGB for free — hand-writing those conversions in JavaScript would be well
 * past the point where custom code is justified, and is error-prone maths.
 * Chromium is already open and already being evaluated once per slide, so this
 * costs nothing extra. And it is strictly more accurate: `.card-icon` uses
 * `color-mix(in srgb, var(--accent-1) 14%, transparent)`, a wash that a
 * token-pair check cannot see at all.
 *
 * `cfg.contrast` comes from references/design-token.md, so the thresholds are
 * reviewable data rather than constants buried in a string.
 */
export function measureExpr({ contrast = [], fontFamily = null, selectors = null } = {}) {
  const cfg = JSON.stringify({ contrast, fontFamily, selectors });
  return `(() => {
  const cfg = ${cfg};
  const out = (${MEASURE_FN})(cfg.selectors);
  out.contrast = [];
  out.fontResolved = null;

  const channels = (s) => {
    const m = /rgba?\\(([^)]+)\\)/.exec(s || '');
    if (!m) return null;
    const p = m[1].split(/[,\\s/]+/).filter(Boolean).map(Number);
    if (p.length < 3 || p.some((n) => !Number.isFinite(n))) return null;
    return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
  };
  const luminance = ([r, g, b]) => {
    const f = (c) => { const x = c / 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  // Walk up collecting backgrounds until something opaque, then composite them
  // front-to-back. Without this a translucent wash reads as its own colour on
  // white, which is exactly the case that hides an invisible glyph.
  const effectiveBg = (el) => {
    const stack = [];
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      const c = channels(getComputedStyle(n).backgroundColor);
      if (!c || c.a === 0) continue;
      stack.push(c);
      if (c.a === 1) break;
    }
    if (!stack.length) return [255, 255, 255];
    let base = stack[stack.length - 1].rgb;
    for (let i = stack.length - 2; i >= 0; i--) {
      const { rgb, a } = stack[i];
      base = [0, 1, 2].map((k) => rgb[k] * a + base[k] * (1 - a));
    }
    return base;
  };
  const ratio = (fg, bg) => {
    const l1 = luminance(fg), l2 = luminance(bg);
    const hi = Math.max(l1, l2), lo = Math.min(l1, l2);
    return (hi + 0.05) / (lo + 0.05);
  };

  for (const rule of cfg.contrast) {
    for (const el of document.querySelectorAll(rule.selector)) {
      if (!(el.textContent || '').trim()) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none') continue;
      const fg = channels(cs.color);
      if (!fg) continue;
      const bg = effectiveBg(el);
      // Composite translucent text onto its own backdrop before comparing.
      const ink = fg.a === 1 ? fg.rgb : [0, 1, 2].map((k) => fg.rgb[k] * fg.a + bg[k] * (1 - fg.a));
      const got = ratio(ink, bg);
      if (got + 0.05 < rule.min) {
        out.contrast.push({
          selector: rule.selector,
          ratio: Math.round(got * 100) / 100,
          min: rule.min,
          text: (el.textContent || '').trim().slice(0, 60),
          color: cs.color,
          note: rule.note || null,
        });
      }
    }
  }

  if (cfg.fontFamily) {
    // Width comparison rather than document.fonts.check: check() reports what
    // the browser WOULD use after fallback, so it can answer optimistically for
    // a family that never loaded. Two different generic fallbacks are probed
    // because a coincidental width match against one is possible.
    const probe = (stack) => {
      const sp = document.createElement('span');
      sp.textContent = 'mmmmmmmmmmlliI0Oy';
      sp.style.cssText = 'position:absolute;left:-9999px;top:-9999px;font-size:72px;white-space:nowrap;font-family:' + stack;
      document.body.appendChild(sp);
      const w = sp.offsetWidth;
      sp.remove();
      return w;
    };
    const q = '"' + String(cfg.fontFamily).replace(/"/g, '') + '"';
    out.fontResolved =
      probe(q + ',monospace') !== probe('monospace') || probe(q + ',serif') !== probe('serif');
  }

  return out;
})()`;
}
