# Slide layouts: the catalogue, the advice, and where advice comes from

The deck has eleven layouts, and any of diagram-design's 45 diagram types can carry a slide through the `diagram` layout. Authors do not write slide HTML — they pick a layout
id and supply structured content, which is what keeps the design system a
constraint rather than a suggestion. This file is the reference for choosing among
them.

Two rules frame everything below:

- **The layout is declared in `storyline.yml`.** An entry that omits `layout:`
  inherits a default from its SCR role, so the arrangement gets decided by a table
  nobody reads and never appears in a diff. Omission is therefore a warning.
- **Advice is a heuristic, so it warns and never decides.** An explicit `layout:`
  wins, always. Invariants fail; heuristics warn.

## The catalogue

`slots.cards` is the accepted card range. Every layout has a mandatory portrait
rule, because vertical output re-renders at 1080x1920 — eleven layouts really means
eleven times two.

`Dominant` names the card slot the eye lands on first, as a zero-based index into
the cards, or `—` when the layout expresses no card hierarchy by design. It is
derived by reading the `BODIES` implementation, not assumed: `spotlight` gives
card 0 the `lead` class, `bento-b` gives card
0 `span-wide`, `process-flow` makes card 0 the hub. It is the slot a declared
`weight: primary` must occupy; see *Weight* below.

`Portrait` is the fidelity of the 9:16 reflow: `native` — portrait already is the
arrangement; `reflows` — the reflow keeps the claim intact; `changes-argument` —
the reflow alters the claim, and the author must accept the new claim or split the
slide.

| Layout | Cards | Dominant | Portrait | The narrative job it does |
| --- | --- | --- | --- | --- |
| `hero` | 0-1 | — | reflows | Section opener: a title block, optionally one visual card beside it. |
| `statement` | 0 | — | native | One claim carries the whole slide. Not a zero-card `hero`: hero splits the canvas into a copy column and a visual column, so with no cards it renders half-width text against an empty half. |
| `bento-b` | 3 | 0 | reflows | One wide card across the top, two detail cards beneath. |
| `spotlight` | 3-4 | 0 | reflows | One dominant card plus two or three supporting. The default for any card set with a dominant member: the lead spans every row, so three and four cards work unchanged. |
| `tiled` | 3-4 | — | reflows | Equal cards in a row. For short labels of even weight. |
| `process-flow` | 3-5 | 0 | reflows | A hub plus downstream nodes. The only layout that takes five cards. |
| `lifecycle` | 3-4 | — | reflows | Chronological phases along a rail. |
| `comparison` | 2 | — | changes-argument | Before and after. Side-by-side asserts a shared scale; portrait has no honest 9:16 side-by-side, so it stacks to a before-then-after and the claim shifts from "compare these" to "this became that". |
| `stat-deepdive` | 2-4 | — | reflows | One headline metric plus supporting detail. The only layout with a stat slot. The dominant element is the stat, not a card — so no dominant *card* slot. |
| `cycle` | 3-5 | — | reflows | Stages that recur with no terminus (PDCA, a retention loop). A return connector from the last stage to the first carries the recurrence claim; stages are peers. |
| `diagram` | 0-2 | — | reflows | A frozen diagram-design drawing carries the slide; up to two cards support it. The diagram is the primary element, like a stat, so there is no dominant *card* slot. A diagram may instead fill the dominant slot of `hero`, `spotlight` or `bento-b`. The portrait frame is its own drawing, never a crop. |
| `custom` | 0 | — | changes-argument | Escape hatch: author-supplied HTML, from a path or a URL frozen once. No marp emission; a portrait file must be supplied explicitly, because arbitrary HTML has no known reflow. |

The `Dominant` column is what the validator and advisor read to place a declared
`weight: primary` and to decide when the dominant slot lies. A layout with `—`
deliberately expresses no card hierarchy: declaring `weight: primary` on it is not
an error, but the "primary not in the dominant slot" note never fires because there
is no slot to name.

## Weight: the author declares what matters

Placed before the advisor derivation because it now governs it.

The arrangement is read in ~100ms, before a single word (Greene & Oliva). So the
biggest, brightest element must be the most important one, or the viewer parses a
hierarchy, discovers it lies, and re-reads — the exact cost good slide design
exists to eliminate. Declare importance; do not leave it to text length.

`weight:` on a card takes one of three levels. The slide title is always the top
level above these, so there are three card levels, not four — three size steps are
the reliable ceiling on a 1080p canvas, and a fourth would exceed what size alone
distinguishes.

| Weight | Gets | Rule the code enforces |
| --- | --- | --- |
| `primary` | the dominant slot; area ≥2x any secondary card; size + luminance | exactly one per slide |
| `secondary` | equal size among themselves; a card surface | must look alike, so the primary stays unique |
| `tertiary` | smallest; grey; no accent, no border | recedes to labels and detail |

The rules, as the validator and advisor apply them:

- **More than one `primary` is an error.** `N cards declare weight: primary —
  salience is relative, so two primaries means neither is one; mark exactly one`.
  Salience is relative: one card is made dominant by keeping the others quiet, not
  by piling emphasis on it.
- **`weight` is card-only.** The stat slot is implicitly the primary element, so a
  card that also declares `primary` on a stat slide is an error: `a card declares
  weight: primary on a slide that has a stat — the stat is already the primary
  element, so weight is card-only here`. Keeping weight off the stat is a
  deliberate simplification: fewer moving parts, same expressive power.
- **An unknown weight is an error**, exactly as an unknown layout or icon is:
  `unknown weight "<x>" (expected primary|secondary|tertiary)`. A typo would
  otherwise silently drop back to the text-length path and the author would never
  learn the declaration did nothing.
- **Primary not in the layout's dominant slot is a warning**, and it names the
  reorder: `card N declares weight: primary but is not in "<layout>"'s dominant
  slot (card M) — move it first so the arrangement points at the card you marked
  primary`. Routed through the layout's `dominant` index, so it is correct for
  spans that dominate at a non-zero index and never fires on a `—` layout.

The area ratio is **≥2x** for unambiguous dominance, because area is a weak
perceptual channel (Cleveland & McGill): a card 1.4x the area of its neighbour
reads as "roughly equal". The type step between adjacent levels is **≥1.2x** to
clear the just-noticeable difference. Size and luminance are the only carriers that
survive greyscale, portrait reflow and a held video frame — so accent colour and
motion are additive and never the sole carrier: hue dies in greyscale, motion dies
in a still deck or a frozen frame.

### Why text length was the wrong proxy

The single most useful thing to read before "simplifying" the `weight` field away.

Before `weight`, the advisor inferred importance from `String(c.text ??
c.title).length`. Text length measures **overflow risk, not importance.** The
canonical counterexample is a headline number — "$4.2M" — the *shortest* card and
usually the *most* important, losing the dominant slot to a hedging caveat, the
longest and least important card. Ranking by text length actively routes the eye to
the wrong card. Declared weight overrides it precisely so the arrangement points at
what matters; text length survives only as the fallback when nothing is declared.

### A card is stretched only where the stretch carries the claim

The same mistake has a second, purely visual form, and it is easy to ship without
noticing because no gate can see it. A grid row that fills the canvas makes every
card in it as tall as the body area, whatever the card holds — and a light card
rendered as a tall slab **reads as heavy.** Visual weight stops tracking information
weight, which is the one thing the arrangement exists to communicate.

Measured on an 84-slide deck before the rule existed: `lifecycle` put a median
225px of content inside a median 804px card — a fill ratio of **0.38**, so ~62% of
every card was empty. `tiled` was 0.43, `comparison` 0.46. Those three are exactly
the layouts with **no dominant slot**, and that is not a coincidence: where no card
outranks another, the grid has no reason to allocate space unequally, so it
allocates it equally *and maximally*.

So the rule the CSS follows is:

| Layout | Row sizing | Why |
| --- | --- | --- |
| `tiled`, `lifecycle`, `cycle`, `comparison` | hug content, block centres | Peers (`dominant: null`). A stretched row would encode a hierarchy the content does not have. |
| `bento-b`, `spotlight`, `flow`, `stat-deepdive` | keep the track ratio | Dominance is the explicit ratio (1.5fr, 1.6fr, 1.1fr, 1.35fr). Hugging would hand the biggest slot to whichever card holds the most words — the text-length mistake again. |

### The ratio is not author-tunable, and the peer layouts never will be

Recorded so it is not re-litigated. The four ratios above (1.5fr, 1.6fr, 1.1fr,
1.35fr) are **constants, not configuration.** Exposing them would be a config key
for a constant: no deck has yet demonstrated that any of the four is wrong, and an
unbounded ratio lets a caller starve the supporting cards until they clip. If a
real deck shows 1.6fr is insufficient for its content, that is when a bounded
field earns its existence — with the failing deck as the evidence.

The four **peer** layouts (`tiled`, `lifecycle`, `cycle`, `comparison`) are a
harder case: they must **never** gain a ratio, tunable or otherwise. Equality is
their claim. `comparison`'s side-by-side asserts a shared scale, so unequal widths
would assert the two things are measured differently — a false statement about the
content, not a styling choice. The same holds for `tiled` ("these are peers") and
`cycle` ("stages are peers"). A ratio here is not expressiveness; it is a licence
to lie. `statement` has no grid to parameterise at all.

After the rule, the same deck measured **1.00** median fill with no card below 0.40,
and the proportional layouts were unchanged to the pixel. A dominant card is still
taller than its own text, and that is correct: the extra height *is* the dominance.

Whitespace belongs **between** cards, where it separates them, not inside one, where
it only dilutes it.

## When each layout is genuinely right, and its failure mode

| Layout | Genuinely right when | Failure mode if chosen wrongly |
| --- | --- | --- |
| `hero` | a section starts, or one claim needs one visual beside it | becomes a content dumping ground; keep it punctuation |
| `statement` | one claim carries everything; the emptiness is the emphasis | it is really two claims — split it |
| `bento-b` | one wide idea over two details that belong to it | the two below do not belong to the wide card |
| `spotlight` | one dominant idea plus two or three support, at three or four cards | the cards are equal — the dominant slot lies; use `tiled` |
| `tiled` | peers of equal weight, short labels | one item actually matters more — declare weight, use `spotlight` |
| `process-flow` | ordered steps, or a hub plus downstream nodes | the steps loop — use `cycle`; a hub asserts a centre a plain sequence lacks |
| `lifecycle` | chronological phases that end | the phases recur — a straight rail denies the loop; use `cycle` |
| `comparison` | exactly two things on the same axis, scale or period | a strawman "before"; false symmetry kills credibility |
| `stat-deepdive` | one number is the story, with its context | a bare number with no baseline, delta or period — trivia, not evidence |
| `cycle` | 3-5 stages that recur with no terminus | the stages actually end — the return connector then asserts a loop that is not there; use `lifecycle` |

## Shape is a claim

The arrangement makes an assertion about the content before any word is read:

- a **cycle** asserts recurrence,
- a **rail** (`lifecycle`) asserts an end,
- an **arrow** (`process-flow`) asserts sequence or causation,
- **side-by-side** (`comparison`) asserts a shared scale,
- a **hub** (`process-flow`) asserts centrality.

Choosing the wrong shape is a **false statement about the content**, not an
aesthetic slip. Drawing a genuine loop (PDCA, a retention loop) on `lifecycle`'s
straight rail tells the viewer the process ends when it does not. This is the whole
reason `cycle` exists as its own layout, and the reason `cycle: true` on a terminus
layout warns: `cycle: true declares the stages recur, but layout "<layout>" draws a
terminus — use layout "cycle" so the loop claim survives`.

## Diagrams: when the shape is the claim

Card layouts can assert six shapes: peers, a dominant member, a hub, a rail, a
loop, a pair. Many narrations assert something else — order in time between
actors, work crossing owners, containment, a gate — and drawing those on cards
is the same false claim as a loop on a rail. The `diagram` layout carries any of
[diagram-design](https://github.com/cathrynlavery/diagram-design)'s types,
drawn at authoring time and frozen, so a build stays offline and deterministic.

### The gate: would cards do it?

Draw only when the shape is the claim. If a set of peer cards says the same
thing, use the cards: they reflow natively, every gate sees inside them, and a
diagram costs a drawing session and a re-stamp every time its spec moves. A
diagram that a table or a sentence could replace is decoration.

### The bridge: name the claim, then the type

First name what the narration ASSERTS, then pick the type. This table is the
bridge into diagram-design's own selection guide (its `SKILL.md` §3) and its
semantic patterns, which make the final pick — it is not a copy of them.

| The narration asserts | Card layout, if it holds | Otherwise `diagram.kind` |
| --- | --- | --- |
| these are peers | `tiled` | — |
| one matters most | `spotlight` | — |
| a sequence that ends | `lifecycle` | `process`, `gantt` |
| it recurs | `cycle` | — (`loop` is served by `cycle`) |
| this became that | `comparison` | `architecture-delta` (a topology changed) |
| order in time between actors | — | `sequence` |
| work crosses owners | — | `swimlane`, `service-blueprint` |
| a branch, a gate or a join | — | `flowchart` (fan-in pattern for "wait for all") |
| states and the moves between them | `cycle` when it only recurs | `state` |
| containment, parent and children | — | `tree`, `nested`, `org-chart` |
| layers, and a boundary between them | — | `layers` |
| components and how they connect | — | `architecture`, `deployment`, `data-flow`, `dependency` |
| a position on two axes | — | `quadrant`, `wardley` |
| a quantity, or how it changed | `stat-deepdive` for one number | `bar`, `line`, `waterfall`, `sankey`, `scatter`, `heatmap`, `treemap` |
| a ranked hierarchy or a drop-off | — | `pyramid` |
| causes of one effect | — | `fishbone` |
| overlap between sets | — | `venn` |

Worked examples from a real deck (`technical-design`), each recorded as an
explicit `diagram.kind` with a one-line reason comment in `storyline.yml`:

| Slide | Was | Claim | Now |
| --- | --- | --- | --- |
| "Two people can race for the same thing; only one wins" | `comparison` | order in time between actors | `sequence` |
| "Five desks, four handoffs" | `lifecycle` | work crosses owners | `swimlane` |
| "No bed until every consult is in" | `process-flow` | a join: wait for all | `flowchart`, fan-in pattern |
| "The domain is a tree of beds" | `process-flow` | containment | `tree` |
| "What's stubbed, and the boundary it's stubbed behind" | `tiled` | layers behind a boundary | `layers` |
| "Where the design decisions are written down" | `tiled` | four document counts are peers | stays `tiled` |

### How a diagram meets the weight model

- **The diagram is primary**, like the stat. A card cannot also claim `primary`.
- **diagram-design's focal rule and `weight` are one rule.** `weight: primary` on a
  node, message or lane is what receives the accent; at most one primary and one
  secondary accent. Two primaries is an error for the same reason two primary
  cards are.
- **Annotations over cards** when the point is about part of the drawing: at most
  two callouts, pointing at the element the narration names.
- **Legibility is measured, not modelled.** Each SVG text run's rendered size is
  checked against the viewing profile's floor (`legibility.md`) and warns below
  it. The generated profile hands diagram-design the deck's own type roles, so a
  drawing made at the brief's size clears the floor by construction.
- **In video, a reveal is one scene per step.** The heaviest element gets its own
  step, on the sentence that names it (temporal contiguity).

### Rejections this retires

`pyramid`, `funnel`, `map`-style data visualisation, per-slide charts and the
categorical `quadrant` were rejected or held below because they needed per-slide
SVG the renderer could not draw deterministically. A frozen, hash-checked drawing
is that way, so they are now `diagram.kind` values. Two constraints survive:
chart kinds are drawn from `data:` in the spec, never eyeballed; and the
continuous scatter form of a quadrant still asserts a coordinate space portrait
reflow cannot keep, so draw a separate portrait frame rather than expecting one.

## How the advice is derived

`recommendLayout(entry)` in `scripts/lib/deck.mjs` returns
`{ layout, reason, alternatives, notes }`. It has two kinds of rule.

**Structural rules**, which are effectively forced, because they mirror the same
`slots` table that validates the entry. A recommendation the validator would then
reject would send an author in a circle, and a test asserts that can never happen.

1. `htmlPath` or `htmlUrl` present → `custom`. A `diagram` present → `diagram`,
   with `spotlight`, `bento-b` and `hero` as the alternatives.
2. `stat` present → `stat-deepdive`. Nothing else has a stat slot.
3. No cards → `statement`, or `hero` when a `pill` marks it as a section opener.
4. One card → `hero`. Two cards → `comparison`. Five cards → `process-flow`.
5. More than five cards → **no layout**, and the advice is to split the slide.
   Silently picking the largest layout would hide the real problem.

**Shape rules**, which rank what is left. Their default is to put the heaviest card
in the biggest slot — but "heaviest" now means declared weight first, and text
length only as the fallback. When any card declares `weight`, `cardShape()` derives
dominance from the declared `primary` and reports `dominanceSource: declared`;
otherwise it falls back to the longest-string card and reports `text-length`. The
fallback is still risk reduction, not taste: text overflow is a hard, pixel-measured
build failure, so giving the longest card the most room is the arrangement least
likely to fail the gate — but importance and overflow risk are different things, so
a declared weight always wins over the fallback.

1. Five cards, and `cycle` not declared → `process-flow`; five cards fit only there.
2. Every card carries a `detail` label, and `cycle` not declared → `lifecycle`; a
   detail reads as a phase marker.
3. `cycle: true` with 3-5 cards → `cycle`. Placed *after* rule 7 so it changes no
   card-shape inference and is reachable only via the explicit marker: rules 6 and 7
   step aside for the flag rather than shadowing it, because a loop is a claim about
   the content that card shape alone cannot reveal.
4. Short titles (≤ 24 characters, no sentence punctuation) with no `text`, and
   weights either undeclared or all equal → `tiled`. A sentence is prose, not a
   label, and prose in an evenly tiled row is what clips.
5. A dominant card (declared primary, or ≥ 1.4x the text of the next heaviest when
    undeclared) → `spotlight`, at three cards or four. The advisor does **not**
    fork on the count: `spotlight` declares `cards: [3, 4]` and its lead spans
    every row, so both work unchanged.
6. Declared unequal weights with no single primary → `spotlight`. `tiled` would
    claim the cards are peers, which their declared weights contradict.
7. Otherwise even weight → `tiled`, at three cards or four.

Two further notes are emitted rather than decided:

- If the primary card is **not in the dominant slot**, the note names the reorder.
  The text forks on how dominance was decided: a declared primary names a firm
  reorder ("move it first so the arrangement points at the card you marked
  primary"); a text-length guess is softer ("the dominant slot goes to a lighter
  card — reorder the cards or expect that card to be the one that clips"), because
  the author never stated intent. It never fires on a `—` layout, which has no
  dominant slot to name.
- An omitted `layout:` reports both the default it fell back to and the
  recommendation, so the author can lock the choice into the source.

## Where layout advice comes from, and where it must not come from

The advisor above covers structural fit and overflow risk. It deliberately does
not model taste. When a choice is genuinely open — the advice returns
`alternatives`, or the content could read two ways — the **agent** consults
external material while authoring, then records the decision as an explicit
`layout:` with a one-line reason in the storyline's comments.

This consultation happens at **authoring time only, never at build time.** A
build must stay offline, deterministic and free: "a deck on its own, with no TTS,
no running app and no cost" is a stated property of this skill, and a renderer
that reached the network to decide a layout would forfeit it.

| Source | What it is good for | What it must not be used for |
| --- | --- | --- |
| `modern-web-guidance` (opt-in, `--with-guidance`) | HOW a layout is implemented: type quality (`text-wrap: balance`/`pretty`, `text-box` trim, `font-size-adjust`, metric-stable fallbacks) and content-reactive CSS (`:has()`, container queries, sibling counts). Its `visual-design` and `css` categories are the relevant ones. | WHICH layout suits given content. It is a web-platform feature corpus, not a design adviser: every guide is anchored to a feature or an implementation recipe, and there is no taxonomy of layouts by content type. It also ships no dedicated grid, subgrid or aspect-ratio recipes, so even on the "how" axis its layout coverage is partial. |
| Online references, including design systems such as Meta's Astryx | Arrangement inspiration and a sanity check on token naming. Looking at how a mature system arranges a dominant card against supporting ones is legitimate research. | Becoming a dependency. Astryx needs React 19 plus a StyleX compiler, its CLI is another `npx` surface on Windows, its themes are generic aesthetics rather than any product's brand, and its licence for vendoring token values is unverified (assumption U5). Do not copy its token values into a preset. |

The output of any consultation is the same artefact either way: an explicit
`layout:` in `storyline.yml`. Nothing about the decision survives in a form the
renderer reads, which is the point — the arrangement is in the diff, and the build
does not depend on having asked.

### Using the guidance corpus

Installed only under `--with-guidance`. Two routes, both offline after install and
both with telemetry force-disabled — it is on by default and would otherwise ship
the query and the retrieved ids to Google:

```bash
R=presentations/<slug>/.runtime/node_modules
G=$R/modern-web-guidance/skills/modern-web-guidance

# Read a guide directly. The cheapest way to read a markdown file is to read it.
ls  $G/guides/visual-design/
cat $G/guides/visual-design/improve-text-layout-and-legibility.md

# Or search semantically (offline model). JSON of {id, similarity} on stdout.
DISABLE_TELEMETRY=1 node $G/modern-web.mjs search "balanced headline line breaks"
DISABLE_TELEMETRY=1 node $G/modern-web.mjs retrieve <id1>,<id2>
```

`scripts/lib/guidance.mjs` wraps both: `listRelevantGuides(paths)` for the file
route, and `buildGuidanceCommand(paths, subcommand, arg)` which returns the exact
`{command, args, env}` to spawn. The query travels as one array element and never
through a shell, so an agent-generated string cannot be injected; the builder is
pure precisely so that property is assertable without an install.

## Sequencing across the deck

The arrangement carries meaning across slides, not only within one:

- **Repeat a layout for parallel content** — three resolution beats on
  `process-flow`, say. The repetition says "same kind of thing, keep reading the
  same way".
- **Change the layout to mark a section.** The change is the signal; an unmotivated
  change spends it for nothing.
- **In a video with hard cuts, a layout change reads as a scene change whether you
  meant it or not.** So a change across a cut must be motivated by a real beat
  boundary, and consecutive parallel beats should share a layout.
- **Open strong and close on the same message.** First and last positions carry the
  most memory weight; the middle is the trough.

## Adding a layout

Before adding one, check whether it is a diagram: a shape with connectors, axes or
containment belongs in `diagram.kind`, not in the card catalogue.

The cost is five places, and a layout that skips any of them is incomplete:

1. `LAYOUTS` in `scripts/lib/deck.mjs` — label, `slots`, `dominant`, and a portrait
   rule.
2. `BODIES` in `scripts/lib/deck-html.mjs` — the HTML-path body.
3. `slideCss()` in the same file — the grid rules, plus the portrait block.
4. `marpGridCss()` in `scripts/lib/marp.mjs` — the `section.<layout>` grid, because
   the markdown tree is flat where the HTML tree nests.
5. `recommendLayout()` — where it sits in the ordered rules, or it is unreachable
   advice.

`cycle` is the worked example: it derives its body from `lifecycle` plus one
explicit return-connector element (no SVG or arrow geometry), reuses the lifecycle
rail CSS with a `.cycle-return` block and a portrait reflow, adds a
`section.cycle` marp grid, and sits in `recommendLayout()` after the
`allDetailed → lifecycle` rule, gated on `cycle: true` so it is reachable without
stealing `lifecycle`'s traffic.

Rejected candidates, recorded so they are not re-litigated. Those marked *now a
diagram kind* are retired as rejections — see *Rejections this retires* above.

- `bento-a`, **retired** rather than rejected — it shipped, then came out. It was
  `1fr 1fr` columns with the lead spanning both rows, which made it the only
  layout holding a dominant slot (`dominant: 0`) with **no track ratio**: the lead
  was the same width as its neighbour, so a card marked `weight: primary` could
  not be seen to dominate. That is the same arrangement `spotlight` draws — lead
  left, support stacked right — with the dominance constant set to 1.0, so it was
  a degenerate duplicate carrying a real cost: it was simultaneously the
  `defaultLayoutFor` fallback and the advisor's answer for every three-card slide,
  because `recommendLayout` forked on the card count (`n === 4 ? spotlight :
  bento-a`) even though `spotlight` declares `cards: [3, 4]`. So the weakest
  dominance layout was the one three-card content was routed to. Dropping the fork
  sends three-card dominance to `spotlight`'s 1.6fr and even-weight sets to
  `tiled`, whose narrower columns also sit closer to the ~45-character measure in
  `legibility.md` than `bento-a`'s two wide columns did. Migration is mechanical:
  `layout: bento-a` → `layout: spotlight`.

- `metric-row` (the content model carries one stat, not a list; the equal-numbers
  case is now served by `tiled`/`spotlight` with declared `weight`).
- `table` and any rows/columns content shape. Name the boundary honestly: cards are
  the wrong tool for four-plus options by three-plus attributes, where the *cell
  values* are the message and the viewer looks up (row, column). That is a lookup
  grid, not a set of gestalt tiles, and forcing it into `tiled` is the reasoning
  error the sources warn against. This skill does not do lookup grids — split the
  slide, or accept the boundary. A `rows`/`columns` shape stresses the overflow gate
  hardest, and its cost is judged too high for the value.
- `quadrant`, revisited — *now a diagram kind* (`kind: quadrant`). The recorded rejection ("no axis-label field, portrait
  reflow destroys the axis meaning") is correct for a *continuous* axis matrix — a
  BCG-style scatter, where rotating a continuous axis in portrait changes what a
  position means and there is no interpolation-safe reflow. The materially-new
  argument: a 2x2 with **categorical** rather than continuous axes (urgent/not x
  important/not) is four labelled cells whose axis labels are group headers, not a
  coordinate space — it has no interpolation to destroy, so it reflows honestly.
  Decision: **hold the change.** It needs an axis-label field and sits close to
  `tiled`-with-headers, so the incremental value over `tiled` is the two-axis claim
  alone. Gate on any future addition: categorical-only, never the continuous scatter
  form.
- `pyramid`, `funnel` and `map` — *now diagram kinds* (`pyramid` covers funnel;
  data maps use the chart kinds). As CARD layouts they stay rejected: `pyramid` (a width taper fights the overflow gate and degrades to a worse
  `tiled`), `funnel` and `map` (data visualisation, needing per-slide SVG),
  `gallery` (needs real image rendering; logo walls are out of scope), `split-hero`
  (a restyled `hero`), `pricing` (bullet lists, which the skill forbids), and a
  people/team layout (a narrow content genre, deliberately omitted).
- `agenda`, kept rejected but with the reason upgraded. The old reason ("bullet
  lists") is weaker than the real one: **a literal contents list is not an advance
  organizer and has no measurable benefit.** A conceptual throughline opener would
  be the supported alternative, not a table of contents.
