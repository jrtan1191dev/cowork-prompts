/**
 * Marp deck emission: a validated storyline -> an EDITABLE Markdown file plus
 * the CSS theme marp renders it with.
 *
 * Why markdown-native rather than HTML-in-Markdown: the governing design record
 * rejected "marp as a second pixel renderer of HTML-in-Markdown", because a file
 * of `<div class="card">` wearing a .md extension throws away the one thing that
 * motivates the marp engine at all — a source a human can edit in an editor that
 * speaks Markdown. So every construct this module emits is ordinary Markdown:
 *
 *   <!-- _class: spotlight -->  the marpit directive that lands the layout class
 *   ###### SECTION LABEL       h6 directly under the section  -> the pill
 *   # Slide title              h1                             -> the title
 *   Optional body paragraph.   a paragraph under the section  -> the body
 *   > ### Card title           a blockquote IS one card; h3   -> the card title
 *   > Card text.               a paragraph inside it          -> the card text
 *   > ###### DETAIL LABEL       h6 inside it                   -> the card detail
 *
 * A blockquote is the single Markdown construct that yields ONE container
 * element per item, so a card grid is expressible without any HTML wrapper: each
 * `<blockquote>` is one card, and the theme's grid rules place them.
 *
 * Icons ride on the marp path as a Markdown image with an inline
 * `data:image/svg+xml;base64,...` URI as the first line inside the blockquote — a
 * data URI because marp's `--allow-local-files` is flagged NOT SECURE and must
 * stay avoidable. The icon SVGs are INJECTED as a `name -> svg` map, exactly as
 * renderSlideHtml receives `icons`, so this module stays PURE: no node:fs, no
 * network. That purity is load-bearing — the test suite runs on system Node with
 * nothing installed.
 *
 * The theme is built ON TOP of slideCss (tier 1: one CSS generator, no restated
 * rules): slideCss stays the single source of tokens, type scale and card rules,
 * and themeCss aliases its class selectors onto the marp element selectors from
 * ONE declarative table, then adds the flat-section grid rules the different
 * element tree needs.
 *
 * FUTURE OPPORTUNITY (deferred by agreement): marp-cli can export PDF, HTML,
 * PPTX and speaker notes natively. The deck still routes those through writePdf()
 * and deckHtmlBundle() in deck.mjs so both engines produce one identical set of
 * presentation artefacts. Adopting marp's native export is a later choice,
 * recorded here and in references/capture-terminal-slides.md.
 */

import { slideCss } from './deck-html.mjs';
import { LAYOUTS, storylineChecksum } from './deck.mjs';

/**
 * Marker written into the emitted .md so a regeneration knows the file is its
 * own past output, not a hand-authored source. Mirrors deck.mjs's LOCKFILE_HEADER
 * wording so the two generated-file models read the same to a human.
 */
const GENERATED_MARKER = 'GENERATED FILE — do not edit. Source: storyline.yml. Regenerate with: node scripts/deck.mjs';

/**
 * The SINGLE place the element-to-class mapping is written down.
 *
 * Each row pairs a marp element selector with the HTML class it stands in for.
 * themeCss aliases the CSS with it (so a change to `.card`'s padding reaches the
 * marp path automatically), and marpContrastRules rewrites the contrast rule
 * selectors with it (so the readability gate fires on the real marp elements).
 * Because both consumers read this one table, the mapping cannot drift.
 *
 * Order matters for the string transform: `.card-title` must be aliased before
 * `.card`, or the substring match would rewrite `.card` inside `.card-title`.
 * Longest class first guarantees that.
 */
export const SELECTOR_ALIASES = [
  ['.card-title', 'section blockquote h3'],
  ['.card-text', 'section blockquote p'],
  ['.card-detail', 'section blockquote h6'],
  ['.card-icon', 'section blockquote img'],
  ['.card', 'section blockquote'],
  ['.stat-value', 'section blockquote h2'],
  ['.stat-label', 'section blockquote p'],
  ['.title', 'section>h1'],
  ['.body', 'section>p'],
  ['.pill', 'section>h6'],
  // The slide box itself. Without this the marp `section` inherits marpit's
  // default 1280x720 sizing and none of the canvas padding, so every slide would
  // render at the wrong size on the marp path alone. marpGridCss is appended
  // afterwards and overrides `display` to grid, which is the one property the
  // flat markdown tree needs differently.
  ['.slide', 'section'],
];

/**
 * The theme marp renders with, built on slideCss so there is ONE generator.
 *
 * Two parts. (a) SELECTOR ALIASING: take slideCss's output and, from
 * SELECTOR_ALIASES, prepend the marp element selector to each class selector it
 * defines, e.g. `.card{` becomes `section blockquote,.card{`. A future change to
 * `.card`'s rule reaches the marp render for free, and the mapping lives in
 * exactly one table. (b) THE GRID: markdown gives a FLAT `<section>` whose direct
 * children are the header elements and the blockquotes, whereas the HTML path
 * nests `.slide > .slide-body > .slide-header + .grid`. So each layout needs one
 * `section.<layout>` rule making the section itself the grid — this genuinely is
 * new CSS because the element tree differs, not a restatement.
 *
 * The `/* @theme <name> *\/` first line and the base64 `@font-face` are the
 * caller's (renderMarpHtml prepends them); this returns the sheet body.
 */
export function themeCss(opts = {}) {
  const base = aliasSelectors(slideCss(opts));
  return `${base}\n${marpGridCss(opts)}`;
}

/**
 * Prepend each marp element selector to the class selector it aliases.
 *
 * A pure string transform: for each `[cls, marp]` row, every `${cls}{` becomes
 * `${marp},${cls}{`. Only rule heads (`.card{`) are touched, never references
 * inside a selector list, because the class always sits at the start of its own
 * rule in slideCss's output. Longest-class-first ordering (see SELECTOR_ALIASES)
 * stops `.card` rewriting the `.card` inside `.card-title`.
 */
function aliasSelectors(css) {
  let out = css;
  for (const [cls, marp] of SELECTOR_ALIASES) {
    // Escape the leading dot; the class token is otherwise literal.
    const head = new RegExp(`(^|[\\n;}])${cls.replace('.', '\\.')}\\{`, 'g');
    out = out.replace(head, `$1${marp},${cls}{`);
  }
  return out;
}

/**
 * The grid rules the marp element tree needs, one terse `section.<layout>` per
 * layout. WHY each rule, not what: the section IS the grid, its direct header
 * children (h1/h6/p) span every column, and blockquotes auto-place into the
 * remaining tracks. Each layout reproduces its HTML-path arrangement. Portrait
 * variants are gated exactly as slideCss gates its portrait block.
 */
function marpGridCss({ orientation = 'landscape' } = {}) {
  const portrait = orientation === 'vertical';
  const landscape = `
section{display:grid;gap:var(--gap);grid-auto-rows:minmax(0,1fr)}
/* Header elements are direct children, so they claim a full-width band above the
   card tracks; blockquotes fill the rest. */
section>h1,section>h6,section>p{grid-column:1 / -1;align-self:start}
section>p{color:var(--secondary);max-width:38ch}
/* A card is stretched only where the stretch is the dominance signal — the same
   rule the HTML path follows (see the .grid comment in deck-html.mjs). The peer
   layouts have no dominant slot, so a 1fr row would make every light card a tall
   slab and read as heavy. bento-b, spotlight, process-flow
   and stat-deepdive keep their tracks, because there the ratio IS the claim.

   DIVERGENCE FROM THE HTML PATH, stated rather than discovered: the HTML path
   centres the card block in the space under a separate header element, and marp's
   flat markdown tree has no such wrapper — the header and the cards are rows of
   one grid. Centring here would drag the title off the top of the slide, so the
   block is anchored under the header instead and the slack falls at the bottom.
   Cards hug their content on both paths; only the block's vertical placement
   differs. This is what the marp-versus-HTML geometry check in SKILL.md will show. */
section.tiled,section.lifecycle,section.cycle,section.comparison{
  grid-auto-rows:min-content;align-content:start}
/* bento-b: first card runs full width, the wide slot. */
section.bento-b{grid-template-columns:1fr 1fr}
section.bento-b>blockquote:first-of-type{grid-column:1 / -1}
/* tiled: equal columns, one track per card via auto-flow. */
section.tiled{grid-auto-flow:column;grid-auto-columns:1fr}
/* spotlight: a 1.6fr lead spanning every row so it dominates by area. */
section.spotlight{grid-template-columns:1.6fr 1fr}
section.spotlight>blockquote:first-of-type{grid-row:1 / -1}
/* comparison: two side-by-side columns, before and after. */
section.comparison{grid-template-columns:1fr 1fr}
/* lifecycle: a single row of phases. */
section.lifecycle{grid-auto-flow:column;grid-auto-columns:1fr}
/* cycle: a single row of recurring stages, same track shape as lifecycle; the
   loop claim is carried by the return connector emitted in the HTML body, which
   marp's flat markdown tree cannot reproduce, so on the marp path the grid is
   the lifecycle grid and the recurrence reads from the stage labels. */
section.cycle{grid-auto-flow:column;grid-auto-columns:1fr}
/* process-flow: a wider hub column plus a stacked node column. */
section.process-flow{grid-template-columns:1.1fr 1fr}
section.process-flow>blockquote:first-of-type{grid-row:1 / -1}
/* stat-deepdive: the metric card on top, detail cards beneath. */
section.stat-deepdive{grid-template-columns:repeat(3,1fr);grid-auto-rows:auto}
section.stat-deepdive>blockquote:first-of-type{grid-column:1 / -1}
/* statement: no cards, one centred column carrying a single claim. */
section.statement{grid-template-columns:1fr;align-content:center;justify-items:center;text-align:center}
/* hero: copy band over a card band. */
section.hero{grid-template-columns:1fr 1fr;align-content:center}
/* diagram: the drawing is the first blockquote; up to two cards take a narrower
   track beside it. The image keeps its aspect inside the slot. */
section.diagram{grid-template-columns:2.2fr 1fr}
section.diagram>blockquote:first-of-type{grid-row:span 2}
section.diagram>blockquote:only-of-type{grid-column:1 / -1}
section>blockquote>p>img[src^="data:image/svg"]{width:100%;height:100%;object-fit:contain;display:block}`;

  if (!portrait) return landscape.trim();

  // Portrait: every card layout collapses to a single reading column, matching
  // the declared portrait rule for each layout.
  const vertical = `
section.bento-b,section.spotlight,section.process-flow,
section.stat-deepdive,section.hero{grid-template-columns:1fr}
section.spotlight>blockquote:first-of-type,
section.process-flow>blockquote:first-of-type,section.bento-b>blockquote:first-of-type{grid-row:auto;grid-column:auto}
section.tiled{grid-auto-flow:row;grid-template-columns:1fr 1fr}
section.lifecycle{grid-auto-flow:row}
section.cycle{grid-auto-flow:row}
section.comparison{grid-template-columns:1fr}
section.diagram{grid-template-columns:1fr}
section.diagram>blockquote:first-of-type{grid-row:auto}`;
  return `${landscape}\n${vertical}`.trim();
}

/**
 * The contrast rules generalised to the marp elements.
 *
 * The overflow and contrast gates read the REAL DOM at render time
 * (document.querySelectorAll(rule.selector)); CSS aliasing cannot help there,
 * because the marp DOM carries no `.card-title` class to match. So the contrast
 * rule selectors are widened to include their marp equivalents — solved by
 * REWRITING the selectors rather than injecting classes (impossible in pure
 * Markdown) because it is fewer lines and reuses the ONE aliasing table. A
 * selector with no marp equivalent (e.g. `.hero-title`) is passed through
 * unchanged; a rule whose selector has an alias gains it as an alternative so the
 * threshold still fires. Thresholds are never touched.
 */
export function marpContrastRules(rules = []) {
  const byClass = new Map(SELECTOR_ALIASES.map(([cls, marp]) => [cls, marp]));
  return rules.map((rule) => {
    const marp = byClass.get(rule.selector);
    return marp ? { ...rule, selector: `${rule.selector},${marp}` } : rule;
  });
}

/** The overflow-gate selector list for the marp element tree. */
export const MARP_MEASURE_SELECTORS = [
  'section',
  'section blockquote',
  'section>h1',
  'section>p',
  'section>h6',
  'blockquote h3',
  'blockquote p',
  'blockquote h6',
];

/** Encode an SVG string as a data: URI marp can render without local-file access. */
function svgDataUri(svg) {
  return `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
}

/**
 * One card as a blockquote. The optional icon is the FIRST line, a Markdown
 * image with an inline data URI. A missing icon emits NOTHING and is reported so
 * the caller can warn — never a broken image. Returns `{ lines, missing }`.
 */
function cardBlock(card, icons, missing) {
  const lines = [];
  if (card.icon) {
    const svg = icons?.[card.icon];
    if (svg) lines.push(`> ![](${svgDataUri(svg)})`);
    else missing.push(card.icon);
  }
  if (card.title) lines.push(`> ### ${card.title}`);
  if (card.text) lines.push(`> ${card.text}`);
  if (card.detail) lines.push(`> ###### ${card.detail}`);
  return lines;
}

/**
 * The stat block as a blockquote: the value is an h2, the label is its paragraph.
 * One shape, kept consistent. The unit rides on the value line so it reads as one
 * metric rather than two stacked numbers.
 */
function statBlock(stat) {
  const value = `${stat.value ?? ''}${stat.unit ? ` ${stat.unit}` : ''}`;
  const lines = [`> ## ${value}`];
  if (stat.label) lines.push(`> ${stat.label}`);
  return lines;
}

/** The header block: pill (h6), title (h1), body (paragraph), each optional bar the title. */
function headerLines(slide) {
  const lines = [];
  if (slide.pill) lines.push(`###### ${slide.pill}`);
  lines.push(`# ${slide.title ?? ''}`);
  if (slide.body) lines.push('', slide.body);
  return lines;
}

/**
 * One slide as a Markdown block. `custom` has no marp emission — arbitrary author
 * HTML is the HTML engine's escape hatch, so throwing is correct. Returns
 * `{ markdown, missing }` where `missing` names any icon absent from the map.
 */
export function slideMarkdown(slide, icons = {}) {
  const layout = slide.layout ?? 'spotlight';
  if (layout === 'custom') {
    throw new Error('layout "custom" is an HTML-engine escape hatch; it has no marp emission');
  }
  const missing = [];
  const lines = [`<!-- _class: ${layout} -->`, '', ...headerLines(slide)];

  const cards = slide.cards ?? [];
  // A diagram rides as the FIRST blockquote, an image with an inline data URI —
  // the same carrier icons use. Being first is what puts it in the dominant slot
  // of spotlight and bento-b on the marp grid, with no layout-specific emission.
  if (slide.diagram) {
    if (slide.diagramSvg) lines.push('', `> ![](${svgDataUri(slide.diagramSvg)})`);
    else lines.push('', `> ### diagram “${slide.diagram.id}” not drawn`);
  }
  if (layout === 'stat-deepdive') {
    lines.push('', ...statBlock(slide.stat ?? {}));
    for (const c of cards) lines.push('', ...cardBlock(c, icons, missing));
  } else if (layout === 'statement') {
    // No cards: a claim carries the whole slide.
  } else {
    for (const c of cards) lines.push('', ...cardBlock(c, icons, missing));
  }
  return { markdown: lines.join('\n'), missing };
}

/**
 * Emit the whole deck as one marp Markdown document.
 *
 * Conformant at birth because it is generated from an already-validated
 * storyline: every slide's card count and slots were checked before this runs.
 * The front matter names the per-theme theme and sets marpit on; the render's
 * theme file is supplied via `--theme`. The `$source-checksum` uses the shared
 * storylineChecksum() so the .md and the storyboard lockfile agree on one
 * source-of-truth and a later run can tell a stale regenerable file from a
 * deliberate hand edit (see needsRegen / isHandEdited).
 *
 * Returns `{ markdown, missingIcons }`; `missingIcons` is the de-duplicated set
 * of icon names absent from `icons`, so the caller can warn once per name.
 *
 * @param {object}   deck        storyline.deck metadata (title, theme)
 * @param {object[]} slides      compiled slide blocks, in deck order
 * @param {object}   [icons]     name -> inline SVG, injected so this stays pure
 * @param {string}   [sourceText] the storyline.yml text, for the drift checksum
 * @param {string}   [checksum]  a precomputed source checksum used verbatim when
 *   supplied (e.g. the storyboard lockfile's $source.checksum). Falls back to
 *   hashing `sourceText`.
 */
export function emitDeckMarkdown({ deck = {}, slides = [], icons = {}, sourceText = '', checksum = null }) {
  const theme = deck.theme ?? 'light';
  const sourceChecksum = checksum ?? storylineChecksum(sourceText);
  const front = [
    '---',
    'marp: true',
    // paginate off: neither a video frame nor a still deck wants page numbers,
    // and the HTML engine never draws them.
    'paginate: false',
    `theme: deck-${theme}`,
    '---',
    // HTML comments, not YAML: they must survive as visible markers and carry
    // the checksum a regeneration reads back. Front matter would be parsed away
    // by editors that rewrite it.
    `<!-- ${GENERATED_MARKER} -->`,
    `<!-- $source-checksum: ${sourceChecksum} -->`,
    `<!-- deck-theme: ${theme} -->`,
  ].join('\n');

  const missingIcons = new Set();
  const body = slides
    .map((s) => {
      const { markdown, missing } = slideMarkdown(s.slide ?? s, icons);
      for (const name of missing) missingIcons.add(name);
      return markdown;
    })
    .join('\n\n---\n\n');

  return { markdown: `${front}\n\n${body}\n`, missingIcons: [...missingIcons] };
}

/**
 * Read back the checksum a previous emission wrote into an .md.
 * Returns null when the marker is absent (a hand-authored file).
 */
export function readSourceChecksum(markdown) {
  const m = /<!--\s*\$source-checksum:\s*([0-9a-f]+)\s*-->/.exec(String(markdown ?? ''));
  return m ? m[1] : null;
}

/**
 * Has the file been taken over by a human?
 *
 * Mirrors lockfileStatus()'s trust model, and answers one question: may this file
 * be overwritten? Two ways the answer is no. A file carrying NO generated marker
 * looks hand-authored, so it is never clobbered. A file whose recorded checksum
 * matches the current source but whose bytes differ has had its body edited, so
 * those edits are preserved. A DIFFERENT recorded checksum means the source moved
 * on and a body difference is expected regeneration, not a hand edit.
 *
 * Accepted, documented cost (design record): an edit made after generation is
 * unvalidated — adding a fourth card to a three-card layout will overflow,
 * because the birth-time conformance guarantee only covers what the emitter
 * produced. Detected is the requirement; validated is not.
 */
export function isHandEdited(existingMarkdown, freshMarkdown) {
  if (existingMarkdown == null) return false;
  const recorded = readSourceChecksum(existingMarkdown);
  if (recorded == null) return true;
  if (recorded !== readSourceChecksum(freshMarkdown)) return false;
  return existingMarkdown.trim() !== freshMarkdown.trim();
}

/** Slide layouts marp can emit — every LAYOUTS entry except the custom escape hatch. */
export const MARP_LAYOUTS = Object.keys(LAYOUTS).filter((l) => l !== 'custom');
