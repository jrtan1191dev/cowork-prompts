# Synthesis — an improvement proposal for `presentation-producer`

Turns the six research tracks (`01`–`06`) into one opinionated proposal. It edits
no skill file; it proposes what should change and cites the report and primary
source behind each claim. Reports are referenced as **[01]** narrative-craft,
**[02]** weighting-hierarchy, **[03]** layout-systems, **[04]** cognition,
**[05]** video-motion, **[06]** evidence-a11y.

The proposal preserves the skill's stated voice — terse, declarative, opinionated,
"invariants fail, heuristics warn" — and its non-negotiables: offline,
deterministic, free at build time; no bullet lists; authors never write slide HTML.

Where the six reports disagree, the disagreement is resolved explicitly in §8.

---

## 1. THE THESIS

*A slide is read in two passes. The arrangement is read in ~100 ms, before a
single word ([04], Greene & Oliva). So the arrangement must already say what
matters most. If the biggest, brightest, first-moving thing is not the thing that
carries the point, the viewer parses a hierarchy, finds it lies, and re-reads.
Good slide design eliminates that cost.*

Everything the evidence supports reduces to one instruction: **make information
weight and layout weight the same thing.** Three findings make it engineering, not
slogan. **Signalling works** (Mayer d≈0.4–0.6, [04]): a cue marking the essential
element measurably improves comprehension — weight *is* a signal. **Salience is
relative** (Wolfe & Horowitz, [02]): you make one card dominant by keeping the
others quiet, not by piling cues on the hero. **Only size and luminance survive**
greyscale, portrait reflow, and a held video frame ([02]); they must carry weight,
with colour and motion as conditional additions.

The second axis is *time*. A deck reader controls dwell; a video viewer cannot
pause ([05], [04]). So in video the heaviest element is not merely biggest — it is
the one that **reveals, moves, or magnifies on the beat the narration names it**
(temporal contiguity, Mayer d≈1.22, the largest effect in the corpus, [05]).
Weight maps to layout in space *and* to the narration timeline in time.

The invariant across deck, live, and video is **one assertion per unit**, stated
in the title, proven by the one dominant element ([01], Alley 79% vs 69%,
p<0.001). The variable across them is **density** ([01]). The improved reference
should be organised around this: weight→layout as the spine, density-per-mode as
the fork, numeric legibility floors as the hard ground beneath both.

---

## 2. GAP ANALYSIS

### What `slide-layouts.md` gets right (keep the voice and the substance)

- **Cards, not bullets.** Directly backed: bullets trigger the redundancy penalty
  and fail the multimedia principle ([01] §0, [04] §1). Keep verbatim.
- **"Invariants fail, heuristics warn."** This distinction is correct and is the
  right frame for every addition below. Preserve it.
- **"Longest card in the biggest slot… risk reduction rather than taste."** The
  *instinct* is exactly right (put the heaviest thing in the dominant slot). The
  *proxy* is wrong — see below.
- **"Heaviest card not first → warn."** Correct instinct ([04] §8 calls it
  "cognitively correct core"). Should be strengthened, not discarded.
- **Rejecting a literal `agenda`.** Consistent with the evidence — a literal ToC
  is not an advance organizer ([01] §2). The *reason on file* ("bullet lists")
  is weaker than the *real* reason ("not an advance organizer, little measurable
  good"); upgrade the reason.
- **Terse catalogue table + ordered advisor rules + "advice at authoring time
  only."** The structure is sound. The additions below slot into it, not over it.

### What it is missing (signal only)

The single most important question the brief poses: **does the current model give
an author any way to express relative importance?**

**No.** The advisor infers importance from `String(c.text ?? c.title).length` —
text volume ([02] §5.4, [01] §3). This is a proxy for *overflow risk*, not
*importance*. The failure is concrete and evidence-named: **a big number ("$4.2M")
is the shortest card and often the most important; a hedging caveat is the longest
and least important** ([02] §7, [01] §3). The advisor will put the caveat in the
dominant slot and the number in a corner — actively pointing the eye at the wrong
thing, the exact failure the thesis exists to prevent.

**The minimum mechanism that fixes it:** let an author declare an ordinal weight on
a card/stat, and let the advisor route the *declared-primary* element to the
dominant slot, falling back to text length only when weight is undeclared. This is
one optional field, ordinal, author-declared, deterministic — fully inside the
skill's constraints. It is the core deliverable (§3).

Other real gaps, ranked:

- **No assertion-title check.** The highest-evidence intervention in the whole
  corpus ([01] §3, Alley) is not a rule. `title` is validated for nothing.
- **Density is fixed across modes.** A read-alone deck slide and a narrated video
  frame of the same content need *different* text budgets ([01] §5, [04] §5,
  [05] §10). Today only pixel overflow gates text — necessary but insufficient.
- **No honest "recurrence" shape.** `lifecycle` draws a straight rail, which
  asserts a terminus; a real cycle (PDCA, retention loop) has none ([03] §8.4).
- **No numeric legibility floor.** Type size is gated only by overflow, not by a
  minimum-readable-size floor derived from visual angle ([06] §B7). A slide can
  pass overflow with 12px text that no one at the back of the room can read.
- **No inter/intra-card gap ratio.** Grouping is left to chance; proximity needs
  between-group gap ≥1.5–2× within-group gap or the grouping reads wrong
  ([03] §3.1).
- **Video frame keep-out is undocumented.** Deck layouts assume a full canvas; the
  video frame reserves a caption band and platform chrome the deck never had
  ([05] §6–7).
- **Card ceiling is 5, everyday.** Cowan's ~4 chunks says the everyday ceiling
  should be 4, with a hub exception ([04] §3).

Noise deliberately excluded from this list: golden-ratio/rule-of-thirds framing
(the file doesn't use it — good), progress chrome, and retention percentages — all
rejected in §8.

---

## 3. AN EXPLICIT WEIGHTING MODEL

The core deliverable. It is small: **one optional ordinal field on cards and the
stat, plus advisor and gate rules that consume it.**

### 3.1 How the author declares weight

Add an optional `weight:` field to each card and to the stat slot, taking one of
**three levels** (a fourth, hero, already exists implicitly as the slide title):

```yaml
- layout: spotlight
  title: Conversion recovered after the checkout rebuild   # the assertion (hero level)
  cards:
    - { title: "+40%", weight: primary,   detail: vs prior quarter }   # exactly one
    - { title: "2.1s", weight: secondary, detail: median checkout }
    - { title: "0 P1s", weight: secondary, detail: since launch }
```

**Three levels, not four**, for content cards. [02] §2.4 and [04] §3 converge:
3–4 hierarchy levels is the perceptual ceiling, and the slide *title* already
occupies the top ("hero/kicker") level. That leaves **primary / secondary /
tertiary** for cards. Declaring a fourth card level would exceed what size steps
can reliably distinguish on a 1080p canvas ([02] §2.3–2.4).

The author declares **rank, never pixels or colour** — consistent with "authors
never write slide HTML."

### 3.2 How each level maps to area, type, and emphasis

Numbers are from [02] §8.2 and [06] §B7, adjusted to the skill's existing canvas
sizes (title 64, card-title 34, card-text 24, stat-value 140 — from
`design-token.md`).

| Level | Layout area | Type role (existing token) | Emphasis carriers, in order | Cap |
|---|---|---|---|---|
| **Hero** (title/statement) | full-bleed / ≥60% | `title` 64 / `hero-title` 96 | size + isolation | slide title only |
| **Primary** (the one thing) | **≥2× any secondary card's area** | biggest card role, or `stat-value` | **size + luminance** → +single accent hue → +isolation → +reveal-on-mention (video) | exactly 1 per slide |
| **Secondary** (support) | equal among themselves | `card-title` 34 / `card-text` 24 | enclosure (card) + neutral weight | must be homogeneous |
| **Tertiary** (labels, detail) | smallest | `card-detail` 19 (grey) | low luminance, no accent, no border | recedes |

The load-bearing ratios, all cited:

- **Area step ≥2×** for unambiguous dominance ([02] §2.1). Area is a *weak*
  perceptual channel (Cleveland & McGill): a card 1.4× the area reads as "roughly
  equal." Below 1.2× it *is* equal — route to `tiled`, not `spotlight`.
- **Type step ≥1.2×** between adjacent levels to clear the just-noticeable
  difference ([02] §2.2). The skill's tokens already satisfy this (64/34/24/19).
- **~1.5–2× between type *roles*** so the hierarchy is visible from the room
  ([06] §B7, independently corroborated by Legge & Bigelow's measured
  newspaper size steps).
- **Size + luminance are the only cross-medium-safe carriers** ([02] §4). Accent
  hue and motion are additions, never the sole carrier — hue dies in greyscale,
  motion dies in a held frame or a static deck.

### 3.3 Interaction with existing slots and layouts

- **Needs one new content-model field** (`weight` on card + stat). Ordinal,
  optional, deterministic. Nothing else changes in the schema.
- **`spotlight`, `stat-deepdive`, `bento-a`, `bento-b`** already have a dominant
  slot — `weight: primary` names which card fills it, replacing the text-length
  guess.
- **`tiled` is reframed as equal-weight-only** ([02] §5.3, [03] §1.4): all cards
  same weight (or none declared). A declared-unequal set on `tiled` is a wrong
  claim ("these are peers") and should route to `spotlight`/`bento-a`.
- **The advisor** (§7) consumes `weight` before it consumes text length.

### 3.4 When declared weight and layout capacity disagree

The precedence rule, stated once:

1. **More than one `primary` on a slide → error.** This is the "everything-bold"
   failure ([02] §5.2, [04] §4): if every card is primary, none pops. Invariant.
2. **`primary` not in the layout's dominant slot → warn + name the reorder.**
   Generalises the existing "heaviest not first" note from text length to declared
   weight. Heuristic (author may have a reason).
3. **Declared-unequal weights on a hierarchy-free layout (`tiled`) → warn**, route
   to `spotlight`/`bento-a`.
4. **Weight undeclared → fall back to text length** (today's behaviour), and note
   it, so the author can lock the choice in.
5. **Primary card's rendered area <2× the largest secondary → warn "dominance
   ambiguous"** ([02] §8.3). Heuristic, because the pixel solver may be
   constrained.

Invariant vs heuristic split honoured: only "two primaries" fails the build;
everything else warns.

---

## 4. RECOMMENDED CHANGES (must / should / optional)

### MUST

**M1 — Add the `weight` field and make the advisor consume it.**
Affected: `storyline-authoring.md` (content rules), `slide-layouts.md` (advisor
rules), `LAYOUTS`/`recommendLayout()` and `cardShape()` in `deck.mjs`.
Change: ordinal `weight: primary|secondary|tertiary` on cards and stat; advisor
routes declared-primary to the dominant slot; "two primaries" is an invariant.
Evidence: [02] §5.4/§8 (Wolfe & Horowitz; Cleveland & McGill), [01] §3, [04] §8
(Greene & Oliva ~100 ms gist). Cost: **content-model change** (schema field +
advisor logic; renderer already has the dominant slots).

**M2 — Add numeric legibility floors as a build-time gate.**
Affected: `design-token.md` (thresholds), a new gate beside overflow/contrast.
Change: minimum canvas px per role — body ≥40, caption ≥30, card-title ≥56,
title ≥90 — derived from the 0.2° critical-print-size floor; fail below, like
overflow. Escape with a flag.
Evidence: [06] §B7 (Legge & Bigelow, *Does Print Size Matter for Reading?*,
J Vis 2011; WCAG large-text definitions). Cost: **renderer change** (measure
computed font-size pre-raster; precedent = overflow gate). *Note the skill's
existing tokens mostly clear these already; the gate protects brand-scaled type.*

**M3 — Add assertion-title guidance + a heuristic title check.**
Affected: `slide-layouts.md`/`storyline-authoring.md`, advisor.
Change: document that `title` is an *assertion* (a sentence stating the takeaway),
not a topic label; warn on topic-shaped titles and titles over ~12 words / ~70
chars / 2 lines at headline size.
Evidence: [01] §1.12/§3 (Alley 79/69 p<0.001; McKinsey action titles — two
independent traditions converging). Cost: **documentation + a heuristic**
(length is measurable; topic-vs-takeaway is a warn, never a fail).

### SHOULD

**S1 — Fork density by target (deck / video-landscape / video-portrait).**
Affected: `composition.md`, `storyline-authoring.md`, compile/verify.
Change: a per-target density profile that lowers card and text budgets for video;
video frame carries ~50–60% of read-deck text, portrait ~40–50%; shift accepted
card counts down by one in video; `process-flow`'s 5 nodes reveal sequentially in
video rather than all at once.
Evidence: [05] §10 (BBC reading-speed; 85%-muted), [01] §5 (Duarte
ballroom/reading; Amazon memo), [04] §5 (Brysbaert 238 vs 150 wpm; redundancy).
Cost: **content-model change** (a target/profile flag + budget table).

**S2 — Document a caption-safe + platform-safe keep-out band per layout in video.**
Affected: `slide-layouts.md` (per-layout portrait rule), `composition.md`.
Change: every layout declares a bottom keep-out band when captions are burned in;
bottom-anchored dominant slots (`stat-deepdive` low headline) must raise above it
in the video path.
Evidence: [05] §6–7 (BBC Subtitle Guidelines; SMPTE/EBU title-safe; platform
chrome flagged approximate). Cost: **documentation** for landscape; **renderer**
if the video path must physically re-anchor content.

**S3 — Tighten everyday card ceiling from 5 → 4, keep the hub exception.**
Affected: `slide-layouts.md`, `LAYOUTS`, advisor.
Change: everyday ceiling 4; `process-flow` keeps 5 *only because its hub chunks 5
into "1 hub + 4"*; >5 still splits.
Evidence: [04] §3 (Cowan ~4 chunks; Miller 7±2 debunked as misapplied). Cost:
**documentation + advisor tweak** (the >5 rule already exists).

**S4 — Add inter/intra-card gap-ratio tokens.**
Affected: `design-token.md`, `slideCss()`/`marpGridCss()`.
Change: `gap-within` and `gap-between` with an enforced ratio ≥1.5.
Evidence: [03] §3.1 (NN/g Gestalt proximity). Cost: **renderer change** (token +
grid rules).

**S5 — Add a per-card `narration` field distinct from on-slide `text`; add a
caption track distinct from body text.**
Affected: `storyline-authoring.md`, storyboard schema.
Change: under narration, on-screen text is keywords; the sentence lives in
`narration`; captions are a separate synchronised track (safe, not the harmful
redundancy).
Evidence: [04] §5 (three redundancy cases; Moreno & Mayer 2002b), [05] §2/§5.
Cost: **content-model change** (the skill already separates `narration`/`notes`;
this adds per-card granularity + a caption track).

### OPTIONAL

**O1 — Add an honest `cycle` layout.** ([03] §10 rec 1) — see §6.
**O2 — Add a `table` layout** for "4+ options × ≥3 attributes." ([06] §A5) — §6.
**O3 — Optional top-level `throughline:` sentence** checked against every scene
([01] §1.4, Anderson). Cost: content-model + heuristic.
**O4 — `stat` gains `message: value|delta` + a context field** so either the
delta or the absolute can be primary, and a bare number without context warns
([02] §7, [06] §A3). Cost: content-model.
**O5 — Emit structured-text sidecars** (per-slide alt text, reading-order
transcript = narration script, WebVTT captions) ([06] §B11). Cost: renderer;
nearly free given the structured source.
**O6 — Add sparkline/motivated-sequence and YC demo-day archetypes**
([01] §7). Cost: documentation (`archetypes.md`).
**O7 — Reframe the split-trigger** around "two assertions on one slide," keeping
pixel overflow as the backstop ([01] §4). Cost: documentation + heuristic.

---

## 5. PROPOSED NEW CONTENT (in the file's voice, ready to paste)

### 5.1 Where it goes — the file split

`slide-layouts.md` is already at a good length and single-purpose (choosing a
layout). Do **not** bloat it. Proposed split:

- **Into `slide-layouts.md`:** the weighting model (short), per-layout "right
  when / wrong when," the reframed `tiled` rule, and any catalogue changes.
- **Into a NEW `references/legibility.md`:** the numeric floors (type size,
  measure, contrast, colour, font selection, caption-safe bands). These are hard
  thresholds shared by every layout and bound the whole deck, not any one layout —
  they deserve their own reference, cross-linked from `design-token.md`.
- **Into `composition.md`:** the deck-vs-video density fork and keep-out bands
  (it already owns aspect/subtitle placement).
- **Into `storyline-authoring.md`:** the `weight`/`narration` field docs and the
  assertion-title rule (it owns the content rules).

### 5.2 Paste-ready — the weighting model (for `slide-layouts.md`)

```markdown
## Weight: the author declares what matters

The arrangement is read in ~100ms, before any word. So the biggest, brightest,
first thing must be the most important thing, or the viewer parses a hierarchy
that lies and re-reads. Declare it; do not leave it to text length.

`weight:` on a card or the stat takes one of three levels. The slide title is
always the top level above these.

| Weight | Gets | Rule |
| --- | --- | --- |
| `primary` | the dominant slot, ≥2x a secondary card's area, size+luminance | exactly one per slide |
| `secondary` | equal size among themselves, a card surface | must look alike, so primary stays unique |
| `tertiary` | smallest, grey, no accent | recedes to labels and detail |

- **Two primaries is an error.** When everything is emphasised, nothing is —
  salience is relative, not absolute.
- **Primary not in the dominant slot is a warning.** Reorder, or accept that the
  layout points at the wrong card.
- **Weight undeclared falls back to text length** and says so — the old
  behaviour, kept as a floor.
- Size and luminance carry weight. Accent colour and motion add to it, never
  alone: colour dies in greyscale, motion dies in a still frame.
```

### 5.3 Paste-ready — per-layout "right when / wrong when" (for `slide-layouts.md`)

```markdown
## When each layout is genuinely right, and its failure mode

| Layout | Genuinely right when | Failure mode if chosen wrongly |
| --- | --- | --- |
| `hero` | a section starts, or one claim needs one visual | becomes a content dumping ground; keep it punctuation |
| `statement` | one claim carries everything; the emptiness is the emphasis | it is really two claims — split it |
| `bento-a` | one idea leads two supporting, at three cards | three equal ideas — the size step then lies; use `tiled` |
| `bento-b` | one wide idea over two details that belong to it | the two below do not belong to the wide card |
| `spotlight` | one dominant idea plus two-three support | the cards are equal — the dominant slot lies; use `tiled` |
| `tiled` | peers of equal weight, short labels | one item actually matters more — declare weight, use `spotlight` |
| `process-flow` | ordered steps, or a hub plus downstream | the steps actually loop — use `cycle`, a rail asserts an end |
| `lifecycle` | chronological phases that end | the phases recur — a straight rail denies the loop |
| `comparison` | exactly two things, same axis/scale/period | a strawman "before"; false symmetry kills credibility |
| `stat-deepdive` | one number is the story, with its context | a bare number with no baseline/delta/period — trivia, not evidence |
```

### 5.4 Paste-ready — deck vs video density (for `composition.md`)

```markdown
## Density forks by target; the argument does not

One `storyline.yml` produces both. What must not be shared is the density budget
and the timing. A read deck slide and a narrated video frame of the same scene
are not the same density.

| | Read deck | Video landscape | Video portrait |
| --- | --- | --- | --- |
| On-screen text | full budget | ~50-60% of the deck | ~40-50% of the deck |
| Cards | catalogue range | lower bound; 4 is an overflow risk | headline + one card at a time |
| `process-flow` 5 nodes | shown together | revealed one per narration beat | split across scenes |
| Words carry the argument | yes (no audio) | on-screen text must (85% watch muted) | on-screen text must |

Minimum scene duration is computed, not fixed:
`max(narration_seconds, onscreen_word_count x 0.3s, layout_read_floor)`.

In video the heaviest element is not just the biggest — it reveals, moves, or
magnifies on the exact beat the narration names it. A card that appears before its
word invites reading ahead; after its word, a confused pause. Tolerance is under
two seconds; aim sub-second.
```

### 5.5 Paste-ready — legibility floors (for a new `references/legibility.md`)

```markdown
# Legibility floors — the hard ground under every layout

Derived from visual angle, not "use 24pt." A point size means nothing without a
viewing distance; the readable floor is the 0.2 degree critical print size (Legge
& Bigelow, J Vis 2011). These are canvas pixels, sized for the worse of a
projected room and a phone.

| Role | Floor (canvas px) | Prefer |
| --- | --- | --- |
| Body / card text | 40 | 44-48 |
| Caption / source / detail | 30 | never below 27 |
| Card title | 56 | |
| Slide title | 90 | |

- ~1.5-2x between roles so the hierarchy is visible from the back of the room.
- Contrast: WCAG 2.2 — 4.5:1 body, 3:1 large; prefer 7:1 body because a room and
  a codec both eat contrast. Chart marks 3:1. Gate on WCAG 2.2; APCA advisory only.
- Measure: ~45 chars/line landscape, ~30 portrait. Portrait forces shorter text —
  a card that fits landscape can overflow portrait.
- Colour: never colour alone (add label/position/icon); emphasis must survive
  greyscale (luminance, not hue); on dark themes avoid pure black and thin weights.
- Caption-safe band (video): keep content out of the bottom ~10-15% landscape,
  and higher/larger in portrait where captions ride up and platform chrome eats
  the bottom third.
```

### 5.6 Paste-ready — deck-level sequencing (for `slide-layouts.md`)

```markdown
## Sequencing across the deck

- Repeat a layout for parallel content (three resolution beats on `process-flow`):
  it says "same kind of thing, keep reading the same way."
- Change the layout for a new section: the change is the signal.
- In a video with hard cuts, a layout change reads as a scene change whether you
  meant it or not — so a change across a cut must be motivated by a real beat
  boundary, and consecutive parallel beats should share a layout.
- Open strong and close on the same message — first and last carry the most
  memory weight; the middle is the trough.
```

---

## 6. LAYOUT CATALOGUE CHANGES

High bar applied. Recommending few is acceptable and is the outcome here.

### Existing layouts that should change

- **`tiled` → equal-weight-only.** Described job becomes "peers of equal weight."
  A declared-unequal set warns and routes to `spotlight`/`bento-a` ([02] §5.3,
  [03] §1.4). No renderer change; a rule change.
- **`process-flow` everyday ceiling clarified.** Keeps 5, but the reason is
  explicit: the hub chunks 5 into "1 hub + 4" ([04] §3). Everyday non-hub content
  caps at 4.
- **`stat-deepdive` gains optional `message: value|delta` + context** so either
  the delta or the absolute can be primary; a bare number warns ([06] §A3,
  [02] §7). Content-model change; optional.
- **Portrait rule per layout gains a fidelity tag** — `native` /
  `reflows` / `changes-argument` ([03] §7.2). `comparison` is `changes-argument`
  (side-by-side has no honest 9:16 form; it becomes stacked before→after). Warn
  when a portrait render of a `changes-argument` layout will alter the claim.
  Documentation.

### New layouts the research genuinely justifies

**`cycle` (recommended, OPTIONAL O1).**
- Content shape: 3–6 stages that recur with no terminus (PDCA, feedback loop,
  retention loop).
- Why no existing layout covers it: `lifecycle`/`process-flow` draw a straight
  rail, which asserts an end. Shape is a claim; a straight line drawn for a loop
  is a *wrong* claim ([03] §8.2/§8.4, confirmed by SmartArt's own product copy
  separating Process from Cycle).
- Card range: 3–5 (portrait caps lower).
- Portrait rule: degrade the ring to a vertical list with a last→first return
  arrow, preserving the loop claim.
- Hierarchy: usually equal stages; optional hub via a centre. Uses similarity
  (equal stages) + a connector that closes.
- Advisor position: after `lifecycle`/`process-flow`, gated on an explicit
  `cycle: true` marker or a detected return edge — never inferred from card
  shape alone, so it stays reachable without stealing `lifecycle`'s traffic.

**`table` (recommended, OPTIONAL O2 — and materially distinct from rejected
`metric-row`).**
- Content shape: 4+ options × ≥3 attributes, where the *cell values* are the
  message and the viewer looks up (row, column).
- Why no existing layout covers it: `comparison` caps at 2; cards read as gestalt
  tiles, not a lookup grid. Forcing 4+ options into `tiled` is the exact reasoning
  error the sources warn against ([06] §A4–A5, Abela "detail → table").
- **Why this is NOT `metric-row`:** `metric-row` was rejected because "the content
  model carries one stat, not a list." A table is a *grid of values with lookup
  semantics*, not a row of stats — a different content shape and a different claim.
- Card range: ~6–8 rows × 4–5 columns (bounded by the type floor, [06] §A5).
- Portrait rule: drop to the 2–3 most important columns, or transpose.
- Hierarchy: one hero cell (colour/weight/fill); grey small headers; a subtle band
  on the row that matters. Not exempt from weight→layout.
- Advisor position: after `comparison`, gated on an explicit `rows`/`columns`
  slot (a new content shape), so it never captures 2-card comparisons.
- **Caveat:** tables stress the overflow gate hardest. If the cost of a
  `rows`/`columns` content shape is judged too high, keeping it out of scope is
  defensible — but then *name the boundary* so authors know cards are the wrong
  tool for 4+ options, rather than silently forcing `tiled`.

### Revisiting a rejected candidate — `quadrant`, with the materially-new argument

The recorded rejection: "no axis-label field, portrait reflow destroys axis
meaning." **That is correct for a *continuous* axis-labelled matrix** (a BCG-style
scatter) — rotating a continuous axis in portrait changes what a position means,
and there is no interpolation-safe reflow.

**The materially-new argument ([03] §10 rec 9):** a 2×2 with **categorical, not
continuous** axes (e.g. urgent/not × important/not) is *four labelled cells whose
axis labels are group headers*, not a coordinate space. Categorical axes have no
interpolation to destroy, so it reflows to a 1-column stack of four labelled cells
without lying. Matrix is the *only* shape that can honestly claim two independent
axes ([03] §8.2). **However:** this needs an axis-label content field and is close
to `tiled`-with-headers; the incremental value over `tiled` is the two-axis claim
alone. **Recommendation: do NOT add it yet.** Record the new argument so it is not
re-litigated, and gate any future addition to categorical-only, forbidding the
continuous/scatter form. This is a "record the argument, hold the change" outcome,
which the high bar warrants.

Other previously-rejected candidates (metric-row addressed above via `table`;
pyramid, funnel, map, agenda, pricing, gallery, split-hero): **no materially-new
argument found. Keep rejected.** See §8.

---

## 7. ADVISOR RULE CHANGES (`recommendLayout()`)

Precise and reachable. Preserving "invariants fail, heuristics warn." Rule numbers
refer to the current ordered rules in `deck.mjs`.

**A1 — Consume declared weight before text length.** In `cardShape()`, if any card
declares `weight`, derive `dominant`/`longest` from the declared `primary` card
instead of the longest string. Must sit *inside* `cardShape()` so every downstream
shape rule (5–9) sees the corrected dominant. This is the core change and makes the
existing rules 8–9 route on importance, not volume.
Evidence: [02] §5.4/§8, [01] §3.

**A2 — "Two primaries" invariant.** Before the shape rules, after the structural
block: if `cards.filter(c => c.weight === 'primary').length > 1` → return a
validation error (not a recommendation). Must sit in the *validator*, not just the
advisor, since it is an invariant. Evidence: [02] §5.2, [04] §4.

**A3 — `tiled` requires equal weight.** Amend rules 7 and 9: if any card declares a
non-equal weight, do not recommend `tiled`; route to `spotlight` (n=4) or `bento-a`
(n≥3). Heuristic warn. Evidence: [02] §5.3, [03] §1.4.

**A4 — Dominance-ambiguous warn.** After a `spotlight`/`bento-a` recommendation
driven by a declared primary: if the primary's declared weight step cannot produce
≥2× area in the chosen layout, add a note "dominance ambiguous." Heuristic.
Evidence: [02] §2.1/§8.3.

**A5 — Assertion-title heuristic.** Independent of card shape (title always
present): warn when `title` has no sentence punctuation and ≤ ~3 words (topic
shape), or exceeds ~12 words / ~70 chars / 2 lines at headline size. Warn, never
fail — topic-vs-takeaway has legitimate exceptions (a section opener). Evidence:
[01] §1.12/§3.

**A6 — `cycle`/`table` reachability.** If added (§6): `cycle` gated on
`entry.cycle === true` placed *after* the `allDetailed → lifecycle` rule (rule 6),
else `lifecycle` shadows it; `table` gated on `entry.rows`/`entry.columns` placed
*before* the card-count rules, since it is a different content shape, not a card
set. Evidence: [03] §8.4, [06] §A5.

**A7 — Upgrade "heaviest not first" toward an invariant for declared weight.** When
weight is *declared*, "primary not in the dominant slot" can escalate from note to
a harder warning (still not a fail, since the author may override). [04] §8 argues
the visual/info-hierarchy match should move toward invariant; keep it a warn while
weight is optional, because a fail on an optional field would teach override
reflexes. Evidence: [04] §8.

The numeric floors (M2), gap ratio (S4), and keep-out bands (S2) are **gates**, not
advisor rules — they belong beside the overflow/contrast gates in the renderer, not
in `recommendLayout()`.

---

## 8. REJECTED FINDINGS

Findings that should **not** enter the skill, with reasons. As valuable as §4.

**Golden ratio and rule of thirds — REJECT (taste/folklore).** [03] §1.8: golden
ratio refuted by RCT (PLoS 2024) and Markowsky; rule of thirds has no empirical
support. The file already avoids them; do not add. The evidence-based version
(size/space hierarchy + Gestalt + optical balance) is what the skill already does.

**Z-pattern / Gutenberg diagram reading paths — REJECT (unverifiable folklore).**
[02] §3.2: NN/g's eye-tracking shows F and layer-cake, not Z; no controlled study
confirms a Z-scan on real content. A strong hierarchy overrides scan paths anyway.
The one usable residue — "top-left is a tiebreak for LTR" — is too weak to encode.

**"Whitespace +20% comprehension" — REJECT (unsourced).** [03] §2.2: traces to a
reading-margins study, not slides. Cite Mayer's coherence principle (d≈0.86–1.32)
instead — which the skill's cards-not-bullets already embodies.

**Dale's Cone / "10-20-30…90%" retention percentages — REJECT (fabricated).**
[04] §9: no numbers were ever in Dale's Cone (Subramony; ASEE refutations). Add a
lint rejecting these if they appear in generated copy (a cheap guard), but never
cite them.

**A hardcoded video length rule (6-min / 18-min / etc.) — REJECT (conflicting
evidence).** [01] §8 + [05] §8: Guo (MOOC ~6min) vs Lagerstrom (college ~12–15min)
directly conflict; TED's 18-min is a discipline heuristic, not a law; YouTube's
first-30s "Intro" metric is the *only* evidence-backed lever. **Resolution:** encode
only "front-load the value in the first ~30s" (already matches SCR's answer-first
deck); make length a tunable, never an invariant. The skill's per-archetype
duration *budgets* (which track audience commitment) are the right variable.

**Progress bars / slide numbers / "N of M" chrome — REJECT (coherence penalty).**
[01] §2: no evidence they aid comprehension; they add extraneous processing and, in
video, compete for the visual channel. Consistent with the skill's minimal-chrome
aesthetic. Keep out.

**Literal `agenda`/ToC layout — KEEP REJECTED, upgrade the reason.** [01] §2: a
literal agenda is not an advance organizer. The file's reason ("bullet lists") is
weaker than the real reason ("not an advance organizer, little measurable good").
A *conceptual* throughline opener (O3) is the supported alternative.

**Pyramid, funnel, map, gallery, split-hero — KEEP REJECTED (no new argument /
would break the build).** [03] §4.2 finds pyramid recurs in SmartArt, but a width
taper still fights the overflow gate and degrades to a worse `tiled` — the original
reason stands. Funnel/map need per-slide SVG data-viz (breaks the no-chart,
deterministic model). Gallery needs real image rendering (out of scope).
Split-hero is a restyled `hero`. None has a materially-new argument.

**People/team layout — REJECT (narrow content type).** [03] §10 rec 11: recurs in
Beautiful.ai/SmartArt but is a narrow genre; reasonable deliberate omission. Name
it as omitted.

**Forced-alignment word-level reveals as a *build requirement* — DEFER, don't
mandate.** [05] §3: temporal contiguity is the strongest single effect, and
forced alignment (aeneas/MFA/vendored Whisper) *can* stay offline. But whether the
aligner is available in this repo's dependency set is flagged unverified ([05]
assumptions). **Resolution:** keep proportional cue timing for captions (fine
within the 2s tolerance); recommend forced alignment as an *opt-in* for word-synced
motion, not a mandatory gate. Do not fail a build on alignment precision.

**Reduced-motion render variant — DEFER (out of current renderer scope).** [05] §4:
a burned MP4 cannot read `prefers-reduced-motion`. Honour it in the HTML deck path
(cheap, correct); a separate reduced-motion MP4 variant is a real cost with unclear
demand. Recommend editorial restraint (nothing >3 flashes/s) now; defer the render
variant.

**APCA contrast — REJECT as a gate (non-normative).** [06] §B6: APCA is not
normative (WCAG 3.0 still a draft). Gate on WCAG 2.2 (stable, computable); report
APCA as advisory only. Do not fail a build on APCA.

**Per-slide charts / annotated chart layout — DEFER (breaks the deterministic,
no-SVG model).** [06] §A2 makes a strong case that a presentation chart is
"chart + conclusion + annotation." But real chart rendering needs data-viz the
skill deliberately excludes. **Resolution:** adopt the *principle* (evidence slides
expect a sentence title, M3/A5) without adopting chart rendering. The `stat` slot
+ assertion title already covers the single-number case; N-way charts stay out of
scope, boundary named.

---

## Resolved disagreements between reports (summary)

- **Coherence effect size:** [01] cites d≈0.70–0.86; [04] cites d≈1.32 (later
  Mayer consolidation). Both cited; the *direction* is identical and load-bearing
  (decoration has a measured cost). No decision hinges on the exact figure.
- **Everyday card ceiling:** [04] argues 4 (Cowan); the skill and [01]'s
  rule-of-three tolerate 3–5. Resolved: everyday 4, hub exception at 5, hard split
  above 5 — satisfies both.
- **Redundancy (on-screen text under narration):** [04] and [05] agree once the
  three cases are separated — identical *synchronised* captions are safe; keyword
  summaries help; different prose harms. Encoded in S5 (caption track ≠ body text).
- **Metric-row revival ([01] §7) vs `table` ([06] §A5):** [01] wants 2–3
  equal-weight headline numbers; [06] wants a lookup grid. Resolved: these are
  different needs. The equal-numbers case is served by `tiled`/`spotlight` with the
  new `weight` field (no new layout); the lookup grid is `table` (O2). `metric-row`
  stays rejected as originally framed.
- **Video length:** [01] and [05] both report the 6-min/18-min conflict; both say
  do not hardcode. Resolved in §8.
```
