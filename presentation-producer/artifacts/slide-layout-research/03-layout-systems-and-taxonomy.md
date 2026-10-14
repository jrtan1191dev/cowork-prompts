# Layout systems, composition, and a taxonomy of slide arrangements

Research track 03. Scope: the general craft of layout and composition as it
transfers to slides and narrated video, judged throughout against one aim —
**information weight should map onto layout so the layout itself directs the
viewer to the right thing**, whether they are following a narration or reading
the slide alone.

Every non-obvious claim carries a URL. Where popular advice lacks evidence it is
labelled **folklore**. Unverified inferences are labelled **assumption**. Where
sources conflict, both sides are reported.

A note on source quality: primary sources (Mayer's peer-reviewed multimedia
corpus, Müller-Brockmann, NN/g's eyetracking-backed articles, MDN/CSS specs,
vendor layout catalogues) are weighted above SEO blogspam. Marketing blog posts
citing "studies" without a reference (e.g. the recurring "whitespace increases
comprehension by 20%" claim) are flagged as unsourced.

---

## 0. Executive summary — what this means for the skill

The strongest, best-evidenced findings, and how each bears on the catalogue:

1. **Hierarchy through size/space is real and measurable; golden-ratio and
   rule-of-thirds framing are not.** The skill is right to rank cards by text
   weight and give the heaviest the biggest slot (`spotlight`/`bento-a`). It
   should *not* adopt any golden-ratio or 12-column dogma — both are folklore in
   this context (§1).
2. **Coherence is the single highest-effect-size principle in all of multimedia
   learning** (median d≈0.86, 23/23 studies). "Remove the extraneous" is not
   taste; it is the most robust result in the field. This directly validates the
   no-bullets, cards-only content model and the one-idea-per-slide rule (§2).
3. **Gestalt proximity gives a testable gap rule**: the gap *between* groups must
   exceed the gap *within* a group, empirically by roughly ≥1.5–2×, or grouping
   reads wrong. The skill currently has no explicit inter- vs intra-card gap
   ratio; it should (§3).
4. **The recurrence taxonomy** (§4–5): across PowerPoint SmartArt, Beautiful.ai,
   Slidev, Marp, reveal.js and the bento web pattern, a small set of arrangements
   recur in *every* system: title/statement, comparison (2-up), grid/tiles,
   process/sequence, cycle, hierarchy/tree, matrix (2 axes), big-number/stat,
   media+caption. The skill covers most; it is **missing an honest cycle and an
   honest hierarchy/tree**, and its rejection of `quadrant`/matrix deserves a
   second look because a matrix is the *only* shape that claims two independent
   axes (§8).
5. **Diagram shape is a claim** (§8). A cycle asserts recurrence, an arrow
   asserts causation/sequence, a matrix asserts two independent axes, a pyramid
   asserts proportion/hierarchy. Using the wrong shape asserts the wrong thing.
   `process-flow` and `lifecycle` already encode sequence; the catalogue has no
   shape that honestly encodes *recurrence* (a loop) — `lifecycle` on a straight
   rail quietly denies it.
6. **Vertical is a different argument, not a reflow** (§7). Side-by-side
   comparison has *no honest 9:16 equivalent*; it must become a stacked
   before/after with sequential reveal. This is consistent with the skill's
   existing "reframe changes the story" stance and should be stated per-layout.
7. **In video, the hard cut makes layout repetition read as "same kind of
   thing" and layout change as "new thing"** (§9). Continuity-editing theory says
   a repeated frame = continuity, an abrupt change = a new beat. Sequencing
   layouts is therefore a narration tool, not just deck hygiene.

---

## 1. Classical layout and composition theory that transfers to slides

### 1.1 Müller-Brockmann and the Swiss/modular grid — substantiated as method

Josef Müller-Brockmann's *Grid Systems in Graphic Design* (1981) is the canonical
source and remains the most widely assigned grid text in design education
(https://www.thegraphicdesignschool.com/design-history/joseph-mueller-brockmann/).
The grid's claim is not aesthetic but *epistemic*: it takes elements that are
"subjective, irrational, and chaotic" and brings them "under tight, measured
control," so that a consistent structure produces objectivity, clarity and — the
part that matters for us — **legibility and faster comprehension**
(https://openlab.citytech.cuny.edu/langecomd3504sp2020/files/2018/10/MullerBrockmann_Grid_Des-Phil.pdf).

Transfer to slides: a **modular grid** (rows *and* columns forming cells) is the
right mental model for a card deck, not a column grid. Müller-Brockmann's modular
grid is literally a field of cells that content is assigned into — which is
exactly what a bento/card layout is. The skill's CSS-Grid-per-layout approach is
the direct descendant. What transfers:

- **A fixed field of cells beats free placement.** The value is consistency
  across slides so the viewer's eye learns where to look. This is the deepest
  justification for "authors pick a layout id, never write HTML."
- **The grid is a constraint that removes decisions**, which is the skill's whole
  thesis. This is well-supported, not folklore.

### 1.2 Baseline grids and vertical rhythm — substantiated for type, partial for slides

A baseline grid aligns text baselines to a repeating vertical unit (typically the
body leading), so type across columns sits on shared lines
(https://medium.com/subform/are-grid-systems-still-relevant-in-digital-407beb4128c1).
Row heights "should be determined by the type size and leading, so that the
baselines of the text always align evenly with the horizontal divisions" (ibid).

Transfer: vertical rhythm matters most for **multi-column running text**, which a
cards deck deliberately avoids. For short card labels it matters less. **Useful
finding for the skill:** because cards hold *phrases not paragraphs*, a strict
baseline grid is low value; a consistent *spacing scale* (an 8pt-style step for
gaps, padding, and inter-element space) captures most of the benefit and is what
the design tokens should encode. This is an argument for a spacing token scale,
not for baseline snapping.

### 1.3 Column systems, and why 12 columns is wrong for 16:9

The 12-column grid is a **web responsive convention**, chosen because 12 factors
cleanly into 2, 3, 4, and 6 for fluid reflow across unknown viewport widths. A
slide canvas is **fixed** (1920×1080 or 1080×1920), so the reason 12 exists does
not apply. On a wide 16:9 field, 12 narrow columns produce column widths (~140px
with gutters) far too narrow for a card; content spans 3–6 of them anyway, so the
12-column structure is invisible overhead.

- **Better for a 16:9 canvas:** a coarse modular grid — the bento recipe's
  `repeat(4, ...)` with fixed row units is a good default (§6), or even 3×2 /
  2×2. Four columns give "enough span variety without chaos"
  (https://superdesign.dev/styles/bento-grid).
- **Assumption (U-03-1):** I did not find a peer-reviewed study saying "12
  columns harms slides." The argument here is structural (fixed vs fluid canvas),
  not empirical. Treat "12 is wrong for slides" as a well-reasoned design
  position, not a measured fact.

### 1.4 Symmetry vs asymmetry — the tension is real and useful

Swiss-style asymmetric layout deliberately creates tension and directs the eye:
an off-centre heavy element plus negative space reads as dynamic and points
attention, where perfect symmetry reads as static and formal. This is the basis
of the skill's `bento-a` (one tall card left, two stacked right): the asymmetry
*is* the hierarchy signal. Symmetric `tiled` deliberately refuses hierarchy — all
cards equal weight — which is correct when items are genuinely peers.

**Rule for the skill:** symmetry claims "these are equals"; asymmetry claims
"this one first." Choosing `tiled` for items of unequal importance is a wrong
claim, exactly as choosing the wrong diagram shape is (§8).

### 1.5 Picture plane and figure/ground

Figure/ground is one of the original Gestalt relationships: the viewer separates a
focal "figure" from a background "ground"
(https://www.nngroup.com/videos/figure-ground-gestalt/). On a slide, the card
surface (`#f5f5f7` on white, or `#161617` in dark) *is* the figure/ground device —
a filled card lifts content off the canvas as figure. This is why a bare
half-width text block on an empty half (the `statement`-rendered-as-`hero`
failure the skill already warns about) reads as broken: there is no figure/ground
resolution, just an unbalanced ground.

### 1.6 Optical vs mathematical centring — substantiated craft

Well-documented and repeatedly confirmed by practitioners: mathematical
(geometric) centring often looks wrong because perceived visual mass differs from
the bounding box. The optical centre of a rectangle sits **slightly above** the
geometric centre, so a mathematically centred title looks low
(https://graphicdesign.stackexchange.com/questions/49527/,
https://railsdesigner.com/mathematical-optical-alignment-design/). Non-rectangular
shapes (triangles, play icons) need horizontal nudging toward their point
(https://pixso.net/articles/alignment-icon/).

Transfer to slides:
- A single centred `statement` claim should sit at or slightly **above** the
  optical centre, not the geometric 50% line, or it reads as sinking.
- Icons inside cards need optical, not box, centring (a right-pointing arrow/play
  glyph nudged left of centre). **Actionable:** the renderer can bake a small
  upward optical offset into centred hero/statement text as a token, rather than
  leaving it to chance. (Assumption U-03-2: exact offset — commonly cited as ~2–3%
  of height — is craft heuristic, not a measured constant.)

### 1.7 Margin and gutter proportion

Two robust, transferable points:
- **One consistent gutter** across a layout is what makes a grid read as a single
  tray rather than scattered boxes — verified in the bento recipe: "mixed gaps …
  and the effect dies" (https://superdesign.dev/styles/bento-grid).
- **Margins should exceed gutters.** The frame (slide padding) reads as the
  outer container; if the outer margin equals the inter-card gap, cards appear to
  touch the edge and the composition loses its ground. This follows directly from
  proximity (§3): the biggest gap should be at the boundary.

### 1.8 Rule of thirds and golden ratio — folklore, stated plainly

**Golden ratio: folklore in design.** The mathematical constant is real; its
claimed appearance in art, architecture, faces and "pleasing rectangles" is "false
or seriously misleading" and stems from imprecise measurement — pick enough
lengths and you can find 1.618 anywhere (Markowsky,
https://www.researchgate.net/publication/322814290_Misconceptions_about_the_Golden_Ratio;
https://patterns.architexturez.net/doc/az-cf-172604). A 2024 randomized controlled
trial found the golden ratio "showed no effect … and remains a myth"
(https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0303032). A
2024 review found "no convincing evidence that the golden ratio is linked to
idealized … proportions or facial beauty"
(https://link.springer.com/article/10.1186/s40902-024-00411-2). Popular summary:
"The Golden Ratio: Design's Biggest Myth" (Fast Company, 2015 — behind a 403 but
widely quoted).

**Rule of thirds: weak evidence, essentially folklore-with-a-grain.** The one
empirical test found aesthetic ratings correlated only *weakly* with subjective
rule-of-thirds scores and **not at all** with calculated rule-of-thirds values
(https://www.researchgate.net/publication/259620557_Evaluating_the_Rule_of_Thirds_in_Photographs_and_Paintings).
The rule traces to J.T. Smith (1797) as a painting heuristic, not a law
(https://www.onlandscape.co.uk/2011/01/rule-of-thirds/).

**Consequence for the skill:** do **not** encode golden-ratio card proportions or
rule-of-thirds focal placement as if they were principles. What *is* substantiated
and does the same job better: **visual hierarchy** (size/weight/space, §1.4, §2),
**Gestalt grouping** (§3), and **optical balance** (§1.6). The skill's existing
"heaviest card → biggest slot" rule is the evidence-based version of what
golden-ratio talk gestures at. Keep that; drop the ratio mysticism.

---

## 2. Whitespace and density as design tools

### 2.1 Active vs passive whitespace

Standard, well-attested distinction: **passive** (micro) whitespace is the
incidental space between letters, lines and elements that aids legibility;
**active** (macro) whitespace is *deliberately placed* to create emphasis and
direct attention. "Whitespace is to be regarded as an active element, not a
passive background" (Müller-Brockmann, quoted at
https://www.interaction-design.org/literature/topics/white-space). Negative space
reads as confidence/emphasis because isolating an element makes it the figure
(§1.5) and removes competing figures.

### 2.2 The evidence, honestly

- **Strong:** Mayer's **coherence principle** — "people learn more deeply when
  extraneous material is excluded" — supported in **23 of 23** experiments,
  median effect size **d≈0.86** (very large)
  (https://www.researchgate.net/publication/262915119_,
  https://www.cambridge.org/core/books/cambridge-handbook-of-multimedia-learning/...C98AB3A6CE760DD63C048936EA0B3B44).
  This is the rigorous backbone under "whitespace = clarity": empty space is
  space *not* spent on extraneous content.
- **Weak/unsourced:** the widely repeated "whitespace increases comprehension by
  up to 20%" (e.g. https://artversion.com/blog/... ) traces to Lin (2004) on
  *margins and leading in reading*, not slide whitespace, and the "20%" figure is
  passed around without a clean citation. **Flag as folklore-adjacent**; the real,
  citable result is Mayer's coherence effect, plus NN/g's qualitative finding that
  whitespace improves comprehension and reduces cognitive load
  (https://www.nngroup.com/articles/signal-noise-ratio/).

### 2.3 Measurable density metrics

Concrete, computable proxies for "weight" the pipeline could actually enforce
(most already latent in its overflow gate):

- **Words per slide / per card.** The one-idea-per-slide and "cut every adjective
  that survives deletion" rules in the skill's narration guidance are density
  caps. A hard cap per card (bento recipe suggests one 17–21px heading + one
  14–15px supporting line, **no paragraphs**:
  https://superdesign.dev/styles/bento-grid) is a defensible default.
- **Element count.** The catalogue's card-count ranges *are* a density metric.
  The ">5 cards → split the slide" rule is exactly this: cap element count.
- **Ink coverage / signal-to-noise.** NN/g frames this as signal-to-noise ratio
  (https://www.nngroup.com/articles/signal-noise-ratio/): maximise the share of
  pixels carrying meaning. A dense evidence slide legitimately runs a higher ink
  ratio than a single-claim slide.

### 2.4 Density should change with slide role — this is the core mapping

The central question — weight → layout — resolves partly here. A slide's density
should track its **narrative job**:

- **Single-claim slide** (`statement`, `hero`, a resolution punchline): near-zero
  density, maximum active whitespace, one focal element at optical centre. The
  emptiness *is* the emphasis.
- **Dense evidence slide** (`stat-deepdive`, a `bento` of supporting facts): higher
  density is honest — the point is "here is the weight of evidence." But it must
  still resolve into groups (§3), or density becomes noise.

**Rule for the skill:** density is not a bug to minimise uniformly; it is a dial
that should be *low for claims and higher for evidence*, and the layout id should
imply a density band. `statement`/`hero` = low; `tiled`/`bento` = medium;
`stat-deepdive` = a single high-weight figure amid low-density support. Consider
documenting a "density band" per layout in `slide-layouts.md`.

---

## 3. Gestalt principles as concrete card-grid rules

Gestalt grouping principles are the mechanism by which layout directs the eye;
they were derived by Gestalt psychologists and later extended (common region) and
are foundational to UI (https://www.nngroup.com/articles/gestalt-proximity/). For
each, a testable rule for a card grid.

### 3.1 Proximity — the gap-ratio rule (most important)

"Items close together are perceived as part of the same group; elements spaced
apart are perceived as separate" and proximity "can overpower competing visual
cues such as similarity of colour or shape"
(https://www.nngroup.com/articles/gestalt-proximity/).

**Testable rule:** for two cards to read as *one* group, the gap between them must
be clearly smaller than the gap to the next group. Practically, the **between-group
gap should be ≥1.5–2× the within-group gap.** If all gaps are equal, everything
reads as one flat set (which is what `tiled` intends — equal gaps, no subgroups).
The moment a layout wants subgroups (e.g. `bento-b`: one wide card, then two detail
cards *belonging to it*), the wide→detail gap must be tighter than the outer
margin, or the belonging is lost.

Current skill gap: layouts specify grid structure but I saw **no explicit inter-
vs intra-group gap ratio**. Recommend adding a token pair (`gap-within`,
`gap-between`) with an enforced ratio ≥1.5.

### 3.2 Common region — the border/fill rule

"When objects appear inside the same enclosed area, we perceive them as related,
even if they differ in shape or size"
(https://uxcel.com/blog/law-of-the-common-region-in-ux;
https://www.nngroup.com/articles/common-region/). Common region can *override*
proximity — a border or shared background groups items even across a gap.

**Testable rule:** a filled card *is* a common region; everything inside it is one
group regardless of internal spacing. Therefore **do not** put two unrelated ideas
in one card, and **do** use a card boundary (not just proximity) when you need a
group to survive portrait reflow that changes gaps (§7). This is why cards reflow
more reliably than proximity-only groupings: the region travels with the content.

### 3.3 Similarity

Elements sharing colour, shape, size or type read as a group/kind. **Rule:** all
peer cards in `tiled` must share size and style — that sameness *is* the claim
"these are the same kind of thing." Breaking similarity (one card a different
colour) is a strong focal signal; spend it deliberately (e.g. the "after" card in
`comparison`, or the recommended option).

### 3.4 Continuation (continuity)

The eye follows lines and aligned edges (https://www.nngroup.com/videos/continuation-gestalt/).
**Rule:** shared alignment edges across cards create an implied line the eye
follows — this is why ragged card tops read as broken. Enforce a shared top
baseline and left edge per row. `process-flow`/`lifecycle` exploit continuation: a
rail or aligned sequence makes the eye travel left→right = "next."

### 3.5 Closure

The mind completes implied shapes. **Rule (mostly a caution):** an incomplete
grid (5 cards in a 6-cell field) leaves a hole the eye tries to close; either fill
it (bento `grid-auto-flow: dense`, §6) or make the emptiness intentional. This is
the real problem behind odd card counts (§6.3).

### 3.6 Connectedness

Explicit connectors (lines, arrows) group more strongly than proximity or
similarity. **Rule:** only draw a connector when you mean a relationship —
`process-flow`'s arrows claim sequence/causation (§8). Connectors between cards
that have no real relationship are a wrong claim.

### 3.7 Figure/ground

Covered in §1.5. **Rule:** every text-over-media cell needs a scrim
(`rgba(0,0,0,0.55)`→transparent) and a per-cell 4.5:1 contrast check (WCAG 1.4.3),
the single most common bento accessibility failure
(https://superdesign.dev/styles/bento-grid). The skill's overflow gate should
arguably be joined by a contrast gate on any media-backed card.

---

## 4. A broad, empirical taxonomy of slide arrangements

Method: inventory the actual layout/shape sets of independent products, then
consolidate. Recurrence across independent systems is the evidence a shape earns
its place.

### 4.1 Inventoried systems (primary sources)

**PowerPoint SmartArt** — an explicit content-shape→diagram mapping, organised
into seven type categories (plus Picture and Office.com), verbatim from Microsoft
(https://support.microsoft.com/en-au/office/all-smartart-graphics-described-cf1a453b-de4a-4217-8da0-1aff97bb32cd):
- **List** — "non-sequential or grouped blocks of information" (grouping without
  order). Dozens of variants.
- **Process** — "a progression or sequential steps … or to emphasise movement or
  direction" (order/sequence; arrows). The largest category.
- **Cycle** — "a continuing sequence of stages … in a circular flow" (recurrence).
- **Hierarchy** — "hierarchical relationships / reporting relationships"
  (org chart, tree; top-down or L→R). Includes decision trees.
- **Relationship** — Venn (overlap), Balance (trade-off), Target (containment),
  radial (relationship to a centre), opposing/counterbalance arrows (tension).
- **Matrix** — "placement of concepts along two axes" / "components to a whole in
  quadrants" (two independent axes; 4 quadrants).
- **Pyramid** — "proportional, interconnected, or hierarchical relationships …
  largest on the bottom" (proportion/foundation).
- **Picture** — media + caption variants of all the above.

The key SmartArt insight for this skill: Microsoft explicitly ties **content shape
to diagram type**, and *warns via the descriptions* which shape claims what — e.g.
Basic Cycle "emphasises the stages rather than the connecting arrows," Grid Matrix
"emphasises the individual components rather than the whole." That is precisely the
"shape = claim" thesis (§8), shipped as product copy since 2007.

**Beautiful.ai Smart Slides** — 300+ layouts that "realign, resize and animate
content automatically," organised into six content-type categories
(https://www.beautiful.ai/smart-slides,
https://www.beautiful.ai/presentations):
- **Data & Chart** (line/bar/pie/waterfall/area/donut)
- **Impact** ("wow moments")
- **Big Number** (single dynamic metric) — equivalent to the skill's `stat-deepdive`.
- **Comparison** ("help your audience choose") — equivalent to `comparison`.
- **People & Team** (headshots + roles) — no skill equivalent.
- **Diagrams & Timeline** ("puzzles, diamonds, hexagons, circles"; timelines) —
  process/cycle/timeline family.

Beautiful.ai is the closest analogue to this skill's thesis: a content-type→layout
mapping where the layout logic auto-adjusts as content changes — i.e. layout as a
constraint, not a canvas.

**Slidev** built-in layouts (https://sli.dev/builtin/layouts, verified list at
https://github.com/antfu/skills/blob/main/skills/slidev/references/core-frontmatter.md):
`default, cover, center, two-cols, two-cols-header, image, image-left,
image-right, iframe(+left/right), quote, section, statement, fact, full, intro,
end, none`. Note the near-1:1 overlaps with the skill: `statement`, `fact`
(≈`stat-deepdive`), `two-cols` (≈`comparison`), `section`/`cover`/`intro`
(≈`hero`), `image-*` (media split).

**Marp** — theme-driven; layout via CSS + directives (split backgrounds,
`image-left/right`), not a fixed catalogue. Confirms the "few primitives, styled
by theme" model the skill uses on its marp path.

**reveal.js** — no semantic layout catalogue; a canvas with horizontal/vertical
slide *sections* and fragment reveals. Its contribution to the taxonomy is
**sequence/fragment reveal** (progressive disclosure), not arrangement.

**Gamma / Tome / Canva** — card/block systems. Gamma: "card-based layout …
content adapts naturally, eliminating resizing"; each card "acts like a flexible
slide" (https://help.gamma.app/en/articles/11016396-,
https://gamma.app/explore/content/guides/how-gamma-maps-content-directly-to-slides-using-its-card-system).
This is strong independent convergence on the **card as the atomic unit** — the
same choice this skill made. (Tome shut its AI presentation product April 2025,
https://slidespeak.co/blog/tome-alternatives/ — treat as historical.)

**Bento marketing pattern** (Apple/Vercel/Linear/Stripe/Raycast/shadcn) — see §6.

### 4.2 Consolidated arrangement archetypes and cross-system recurrence

| Archetype | Claim it makes | PPT SmartArt | Beautiful.ai | Slidev | Bento web | reveal.js | Skill has it? |
|---|---|---|---|---|---|---|---|
| **Title / section opener** | "new topic starts" | (title layouts) | Impact | cover/section/intro | — | section | ✅ `hero` |
| **Single statement** | "one claim" | — | Impact | statement | — | — | ✅ `statement` |
| **Big number / stat** | "this metric matters" | — | Big Number | fact | stat cell | — | ✅ `stat-deepdive` |
| **Grid / tiles (peers)** | "these are equal kinds" | List (block) | (grids) | — | equal-cell (anti-bento) | — | ✅ `tiled` |
| **Asymmetric emphasis grid** | "this one first" | List (varying width) | — | — | **bento** (core) | — | ✅ `bento-a/b`, `spotlight` |
| **Comparison / 2-up** | "A vs B" | Relationship (Balance, Opposing) | Comparison | two-cols | — | — | ✅ `comparison` |
| **Process / sequence** | "steps in order; causation" | Process (largest cat.) | Diagrams | — | — | fragments | ✅ `process-flow` |
| **Cycle / loop** | "recurs, no end" | **Cycle** | Diagrams | — | — | — | ⚠️ `lifecycle` denies the loop |
| **Hierarchy / tree** | "parent→child; reporting" | **Hierarchy** | — | — | — | — | ❌ none |
| **Matrix / quadrants** | "two independent axes" | **Matrix** | — | — | — | — | ❌ rejected `quadrant` |
| **Timeline** | "along a time axis" | Process (Timeline) | Timeline | — | — | — | ~ `lifecycle` (rail) |
| **Media + caption** | "look at this, here's why" | Picture | Image | image-left/right | media cell | — | partial (`hero` visual) |
| **Radial / hub-and-spoke** | "relationship to a centre" | Relationship (Radial) | — | — | — | — | ~ `process-flow` (hub) |
| **Venn / overlap** | "shared attributes" | Relationship (Venn) | — | — | — | — | ❌ none |
| **Pyramid / proportion** | "foundation / proportion" | Pyramid | — | — | — | — | ❌ rejected `pyramid` |
| **People / team** | "who" | Picture (org) | People | — | — | — | ❌ none |

**Reading the recurrence:** the archetypes present in *every* general system are
title, statement/stat, grid/tiles, comparison, process, and media+caption — the
skill has all of these. The archetypes present in the two richest *semantic*
systems (SmartArt + Beautiful.ai) but weak or absent in the skill are **cycle,
hierarchy/tree, matrix, timeline, and people**. Recurrence across SmartArt (used
by hundreds of millions) plus Beautiful.ai (a content-type-mapped competitor) is
strong evidence **cycle and hierarchy earn their place**; matrix earns a
reconsideration (§8, §10).

---

## 5. Each archetype specified

For each: **content shape** it serves · **element count** it holds well · how it
**expresses hierarchy** · **portrait/vertical reflow** · **characteristic failure
mode**. Judged against the skill's fixed canvas and overflow gate.

### Title / section opener (`hero`)
- Shape: a topic name, optional one visual. Count: 0–1 supporting card.
- Hierarchy: the title *is* the whole hierarchy; a pill marks it as an opener.
- Portrait: trivial — stack title over visual. Best-behaved layout in 9:16.
- Failure: no supporting content, so it can become a content slide by accident;
  keep it a punctuation mark, not a dumping ground.

### Single statement (`statement`)
- Shape: one claim. Count: 0 cards.
- Hierarchy: refuses internal hierarchy — the claim carries everything. Density
  near zero; the whitespace is the emphasis (§2.4).
- Portrait: trivial; re-centre optically (§1.6).
- Failure: rendered as half-width text on an empty half (the `hero`-with-no-cards
  bug the skill already guards). Also: a "statement" that is really two claims.

### Big number / stat (`stat-deepdive`)
- Shape: one headline metric + 2–4 supporting details. Count: 2–4.
- Hierarchy: extreme — the number dwarfs its support. This is weight→layout done
  right: the most important thing is physically the biggest.
- Portrait: number on top, details stacked below. Reflows cleanly.
- Failure: multiple competing big numbers (should be `tiled` of stats or split);
  or a number with no unit/context ("42" claims nothing).

### Grid / tiles (`tiled`)
- Shape: peer items of equal weight, short labels. Count: 3–4.
- Hierarchy: *deliberately none* — equal size + equal gaps = "same kind"
  (similarity + equal proximity, §3.1/§3.3). Choosing it for unequal items is a
  wrong claim.
- Portrait: 3–4 across → single column stack; order becomes reading order, so
  ensure DOM order = intended order (bento accessibility caveat,
  https://superdesign.dev/styles/bento-grid).
- Failure: prose in an evenly tiled row overflows the shortest cell first (the
  skill's exact overflow rationale). Tiles want labels, not sentences.

### Asymmetric emphasis grid (`bento-a`, `bento-b`, `spotlight`)
- Shape: one dominant idea + supporting. Count: 3 (`bento-*`), 3–4 (`spotlight`).
- Hierarchy: **size encodes priority** — the whole point of bento (§6). The
  dominant slot is positional; the heaviest card must be first (skill already
  warns).
- Portrait: the hero cell goes full-width on top, supporting cells stack. The
  asymmetry survives as "big thing first, then details."
- Failure: equal-weight cards in an asymmetric grid → the size difference lies
  about importance (the "equal cells = not a bento" trap, §6). Then it should be
  `tiled`.

### Comparison / 2-up (`comparison`)
- Shape: exactly two contrasted things. Count: 2.
- Hierarchy: symmetric by default (A vs B as equals); break similarity to signal a
  winner (§3.3). SmartArt's *Balance* even tips toward the heavier side.
- Portrait: **this is the hard one.** Side-by-side has no honest vertical form
  (§7); it must become stacked before→after with the contrast carried by sequence
  and a divider, not adjacency.
- Failure: false symmetry (strawman "before"), which the skill's archetypes doc
  already warns kills credibility.

### Process / sequence (`process-flow`, `lifecycle`)
- Shape: ordered steps; optionally a hub + downstream. Count: 3–5 (`process-flow`),
  3–4 phases (`lifecycle`).
- Hierarchy: order is the hierarchy; arrows/rail claim sequence and often
  causation (§8). Continuation (§3.4) carries the eye.
- Portrait: horizontal rail → vertical rail (top→bottom); arrows rotate 90°. Works,
  but 5 steps get cramped in 9:16 — cap lower in portrait.
- Failure: using a straight sequence for something that actually loops (§8) — a
  wrong claim of "has an end." This is the gap that argues for a real cycle layout.

### Cycle / loop *(missing as an honest shape)*
- Shape: stages that recur with no terminus. Count: 3–6 (SmartArt Basic Cycle).
- Hierarchy: usually none among stages; emphasis optional via a hub (radial).
- Portrait: a ring is hard in 9:16; degrade to a vertical list with a "return"
  arrow from last→first to preserve the loop claim.
- Failure: **rendering a cycle as a straight rail (current `lifecycle`) denies the
  recurrence.** A PDCA/feedback loop drawn straight asserts it ends. See §8/§10.

### Hierarchy / tree *(missing)*
- Shape: parent→child, org/reporting, decision tree. Count: 1 root + ~2–6 children
  per level.
- Hierarchy: it *is* the structure; depth = level.
- Portrait: top-down trees get very tall; L→R trees reflow worse. Honest vertical
  form is an indented list with connectors.
- Failure: faking hierarchy with a flat grid (loses the parent/child claim Duarte
  explicitly tests for, https://www.duarte.com/blog/techniques-for-using-critique-language-.../).

### Matrix / quadrants *(rejected as `quadrant`; reconsider)*
- Shape: items placed on **two independent axes**. Count: 4 quadrants (or scatter).
- Hierarchy: refuses ranking; asserts two orthogonal dimensions instead.
- Portrait: **genuinely breaks** — rotating axes changes their meaning (the skill's
  stated rejection reason, and it is correct). A 2×2 can *sometimes* survive as a
  square that shrinks; a labelled-axis scatter cannot.
- Failure: the skill's rejection stands *for scatter/axis-labelled matrices*. But a
  **2×2 quadrant with categorical (not continuous) axes** is just four labelled
  cells and reflows like `tiled` — see §10 for the materially-new argument.

### Media + caption (partial via `hero`)
- Shape: an image/screenshot + its meaning. Count: 1 image + short caption.
- Hierarchy: image dominant, caption subordinate (Picture-superiority, §8.1).
- Portrait: image top, caption below — the native vertical form.
- Failure: caption narrates the UI instead of its meaning (skill's narration rule).

### Radial / hub-and-spoke (partial via `process-flow` hub)
- Shape: relationship of parts to a centre. Count: 1 hub + 3–6 spokes.
- Hierarchy: centre dominant. Portrait: hub on top, spokes stack — loses the
  "radiates from" reading; degrade to hub + indented children.
- Failure: implying sequence (arrows) when the claim is only "related to centre."

---

## 6. The bento grid in depth

### 6.1 Origin
Named for the Japanese compartmentalised lunchbox; one tray, differently sized
compartments, each holding one thing. Popularised for UI by **Apple's product
pages and keynote slides around 2023**; now the default look for SaaS feature
sections (https://superdesign.dev/styles/bento-grid,
https://www.banani.co/definitions/bento-grid). Note the direct slide lineage:
Apple *keynote slides* are a primary origin, so bento is native to presentations,
not just web.

### 6.2 Intentional vs random — the defining rule
"**Equal cells = not a bento.** If every cell is the same size you have a plain
card grid wearing a trendy name … The pattern only earns its keep when size
encodes priority" (https://superdesign.dev/styles/bento-grid). This is the single
most important bento rule and it *is* the weight→layout thesis: **cell size must
map to information priority.** Amie's page is cited as the exemplar — "cell size
encodes priority: the calendar hero earns the big cell." Bento is distinguished
from **masonry** (variable-height packed columns, nothing aligns — "a feed") by
being *curated hierarchy on a fixed grid where rows stay aligned*.

### 6.3 Cell ratios, odd counts, and observed conventions
Verified recipe (https://superdesign.dev/styles/bento-grid):
- `grid-template-columns: repeat(4, minmax(0,1fr))` — 4 tracks give "span variety
  without chaos." `minmax(0,1fr)` (not bare `1fr`) stops long tokens blowing out a
  track.
- `grid-auto-rows: 180px` **fixed** — "spans only feel bento when the row unit is
  fixed; auto rows make 2×2 cells collapse unevenly."
- **One** consistent `gap: 16px` everywhere — mixed gaps "and the effect dies"
  (proximity, §3.1).
- `border-radius: 24px` (20–28px) — "the large radius IS the signature; under 16px
  it reads as a plain card grid."
- `grid-auto-flow: dense` backfills the holes spanning cells leave — the property
  "most tutorials miss." **Caveat:** it decouples visual from DOM order → focus
  order breaks (WCAG 2.4.3); reserve `dense` for non-interactive media, keep DOM in
  reading order.
- Hierarchy convention: **exactly one 2×2 hero cell**, one or two 2×1 wide cells,
  rest 1×1, **max ~8 cells total**. Typography per cell: one 17–21px semibold
  heading + one 14–15px 65%-opacity line, **no paragraphs**.

**Odd counts** are handled by *spanning*, not by adding filler: an odd cell is
promoted to 2×1 or 2×2 so the grid stays full and `dense` backfills the rest. This
is a better answer than the skill's current fixed 3-card bento — it means bento can
absorb 3–8 items by varying spans rather than switching layouts. (Closure, §3.5:
spanning fills the hole the eye wants closed.)

### 6.4 Real implementations (verified live per source)
- **Apple (MacBook Air "highlights"):** five mixed-size rounded tiles, exactly one
  idea per cell, motion rationed to hero tiles only.
- **Raycast:** ~a dozen feature cells at mixed spans — "breadth without a wall of
  text."
- **Amie:** cell size = priority (calendar hero big, chat actions small).
- **GitHub Copilot:** three mixed-size cards; "the asymmetry tells you which entry
  point GitHub wants you to pick first" — asymmetry as a directive.
- **Correction to folklore:** the source verified that **Linear, Vercel, Notion,
  Cursor, Framer do *not* currently run bento homepages** despite being cited in
  listicles (https://superdesign.dev/styles/bento-grid). Do not cite them as bento
  exemplars; cite Apple/Raycast/Amie/Copilot.

### 6.5 When bento is wrong (directly relevant to the skill)
"It fights long-form content … If you find yourself truncating sentences to fit
cells, the layout is winning and the message is losing." Also dies on mobile if
spans aren't reset. **Both caveats already match the skill's design:** cards forbid
paragraphs, and the overflow gate is precisely the "don't truncate to fit"
enforcement. The skill's bento is well-founded; the improvement is variable spans
for 3–8 items (§6.3) rather than a hard 3-card cap.

---

## 7. Vertical and square as first-class formats

Vertical (9:16, 1080×1920) is now the dominant social consumption format — cited
~94% of social video views on mobile in portrait
(https://blog.picassoia.com/how-to-use-veo-3-1-for-vertical-videos). Square (1:1)
and 4:5 are the feed-optimised middle grounds.

### 7.1 Why vertical favours stacks and sequential reveal
A tall, narrow frame has **width for one column, height for many rows.** Side-by-side
comparison needs width it doesn't have; stacking and sequential reveal need height
it has in abundance. The cross-format editing literature states the constraint
precisely: a vertical crop "does not need to preserve every pixel … it does need to
preserve the *relationship* between setup and payoff"; if the crop removes the
element that explains the point, "the edit may look polished but stop making sense"
(https://www.capcut.com/create/vertical-video-meme-editing-mobile-first-platforms).
Rendering a landscape layout at a mobile viewport "does not shrink the story, it
changes it" — which is exactly the skill's own composition.md stance on `reframe`.

### 7.2 Which landscape arrangements have no honest vertical equivalent
- **Side-by-side comparison** (`comparison`): no honest 9:16 form. Must become a
  **stacked before→after** where sequence + a divider carry the contrast. In a
  video this is *better* — reveal "before," then "after" — because sequential
  reveal suits the medium. As a static portrait slide it is weaker (the eye can't
  hold both at once).
- **Matrix / 2-axis** (§5): no honest vertical form — rotating axes changes meaning.
- **Wide process/timeline (5 steps):** survives only by rotating to a vertical rail
  and usually shedding steps; cap step count lower in portrait.
- **Radial/hub-and-spoke:** loses "radiates from centre"; degrade to hub + list.

Arrangements that are **natively vertical**: statement, hero, stat, media+caption,
and any single-column stack. **Actionable:** the skill should tag each layout with
a *portrait fidelity* class — `native` (statement/hero/stat), `reflows`
(bento/tiled/process→vertical rail), `changes-argument` (comparison→stacked,
matrix→none). This makes the "reflow story" per layout explicit rather than
implicit, and warns authors when a portrait render will change the claim.

### 7.3 Square (1:1) and 4:5
Between the two: fits more than 9:16 across but far less than 16:9. Treat as a mild
16:9 → favours 2-up at most, single focal element ideally. The subtitle table in
the skill's composition.md already encodes per-aspect caption sizing; the same
per-aspect thinking should extend to *max element count* (e.g. bento caps at ~8 in
16:9, ~4 in 1:1, ~3 stacked in 9:16).

---

## 8. Diagrammatic layouts — shape is a claim

### 8.1 When a diagram beats prose cards
Picture-superiority and the multimedia principle: people learn better from words +
graphics than words alone (Mayer, dual-channel;
https://link.springer.com/article/10.1007/s10648-023-09842-1/fulltext.html). A
diagram beats prose cards when the *relationship between items* is the point —
sequence, causation, overlap, containment, proportion, two-axis position. If the
items are independent peers with no structural relationship, prose cards (`tiled`)
are honest and a diagram would invent a relationship that isn't there.

### 8.2 Each diagram shape asserts a proposition
This is the core of the track's thesis, and SmartArt's own descriptions confirm it
(https://support.microsoft.com/en-au/office/all-smartart-graphics-described-...):

| Shape | Proposition it asserts | Wrong-claim if misused |
|---|---|---|
| **Arrow / sequence** | order, and often causation: "A → B" means B follows/because of A | implies causation/order where there is only a list |
| **Cycle / loop** | recurrence, no terminus: "this repeats forever" | a straight rail asserts an end that doesn't exist |
| **Tree / hierarchy** | parent→child, containment of authority: "B reports to A" | flat grid denies the levels; wrong tree implies false authority |
| **Matrix (2 axes)** | two *independent* dimensions: position on X and Y both mean something | using it for one dimension, or for correlated axes, fakes independence |
| **Venn / overlap** | shared membership: "these sets intersect" | overlap drawn where sets are actually disjoint |
| **Pyramid** | proportion or foundation: "base supports apex / bigger at bottom" | asserts proportion/priority that isn't in the data |
| **Radial / hub** | relationship to a centre: "all relate to X" | implies a centre where items are peers |
| **Timeline** | position on a time axis: "when" | even spacing implies even time intervals (often false) |
| **Nested containment (target)** | one thing inside another: "B ⊂ A" | implies containment instead of mere association |

Causation via arrows is a documented convention across biology, chemistry and
causal-inference literature: "an arrow from object A to object B depicts that a
change of A causes a change of B"
(https://www.researchgate.net/publication/263235965_Why_do_Biologists_Use_so_Many_Diagrams;
https://en.wikipedia.org/wiki/Causal_notation). So an arrow in a `process-flow` is
not decorative — it is asserting causal/temporal succession. Use it only when true.

### 8.3 Comparison tables
A table asserts that every row is comparable across every column — a **matrix of
one categorical axis (items) × attributes.** It beats prose when readers need to
look up a cell ("does plan B include X?"). It is the honest form of feature
comparison; `comparison` (2-up cards) is its degenerate 2-item form. The skill has
no N-way table; for ≥3 compared items with ≥3 attributes, cards cannot carry it and
a table is the correct shape. (Flag: tables stress the overflow gate hard; likely
why the skill avoids them. Reasonable to keep out of scope, but name the boundary.)

### 8.4 Consequence: the catalogue is missing an honest *loop*
`lifecycle` renders chronological phases "along a rail" — a straight line. For a
genuine cycle (PDCA, feedback loop, retention loop) the straight rail **asserts a
terminus that contradicts the content.** SmartArt separates Process (has an end)
from Cycle (recurs) for exactly this reason. Recommendation in §10.

---

## 9. Layout sequencing across a whole deck

### 9.1 Consistency vs monotony
Müller-Brockmann's case for the grid is consistency so the eye learns where to look
(§1.1). But total uniformity is monotony. The resolution is **meaningful variation**:
repeat a layout to signal "same kind of content," change it to signal "new kind."

- **Repeated layout = parallel content.** Three resolution beats each on
  `process-flow`, or three stats each on `stat-deepdive`, tell the viewer "these are
  peers, keep the same reading strategy." This is similarity (§3.3) applied across
  slides/time.
- **Layout change = section boundary.** Switching to `hero`/`section` says "new
  topic." Slidev encodes this with a dedicated `section` layout; the skill uses
  `hero`+pill. The change *is* the signal.

### 9.2 How this reads differently as a video with hard cuts
In a deck, the viewer controls pace and can compare adjacent slides. In a video with
the skill's default **hard cut**, the layout transition is perceived through
**continuity-editing** grammar (https://en.wikipedia.org/wiki/Continuity_editing):

- A **repeated frame/layout across a cut reads as continuity** — "same scene,
  next point." Keeping `process-flow` across three resolution beats makes the cuts
  feel like one continuous argument.
- An **abrupt layout (and theme) change across a cut reads as a new beat/scene** —
  the visual equivalent of a scene change. This is *useful*: a cut from a dense
  `bento` to a single `statement` punctuates. It is also *dangerous*: an
  unmotivated change reads as a jump cut / discontinuity error.
- **Match-cut logic** (https://www.researchgate.net/publication/264699419_): if two
  consecutive scenes share composition (e.g. the hero cell sits where the previous
  screenshot's focal point was), the cut feels intentional and smooth. The skill
  could exploit this by aligning a slide's dominant slot to the prior capture's ROI.
- The skill's existing **theme-continuity note** (light bento → dark terminal = a
  visible flash) is the same principle: an unmotivated visual jump across a cut is a
  discontinuity error; a motivated one is punctuation. This generalises from
  theme to *layout*: sequencing is a narration tool in video, not just deck hygiene.

### 9.3 Rule for the skill
Sequencing should be *legible*: parallel beats share a layout; a new section changes
it; and in video, a layout change across a hard cut should be **motivated** (marks a
real beat boundary) because the medium reads it as a scene change whether you meant
it or not. Consider a linter note when consecutive same-role beats use *different*
layouts (accidental discontinuity) or different-role beats use the *same* layout
(missed section signal).

---

## 10. Recommendations for the skill

Ranked by strength of evidence. Each is a proposal, consistent with the skill's
constraints (fixed canvas, overflow gate, offline deterministic build, cards not
bullets, explicit `layout:` in the diff).

### Strong (well-evidenced, low-risk)
1. **Add an honest `cycle` layout.** Recurrence is one of the seven SmartArt
   categories and a distinct claim from `process`/`lifecycle` (§8.4). Portrait
   degrades to a vertical list with a last→first return arrow. Fills a real gap:
   the catalogue can currently only assert "has an end." Cross-system recurrence
   (SmartArt Cycle, Beautiful.ai Diagrams) is strong evidence it earns its place.
2. **Add an explicit inter- vs intra-group gap ratio token** (`gap-between ≥1.5×
   gap-within`), enforced. Proximity is the mechanism that makes grouping legible
   (§3.1); the skill currently leaves it implicit.
3. **Document a "density band" per layout** (§2.4): `statement`/`hero` = low,
   `tiled`/`bento`/`spotlight` = medium, `stat-deepdive` = one high-weight figure
   amid low support. Grounded in the coherence principle (d≈0.86).
4. **Tag each layout with a portrait-fidelity class** — `native`, `reflows`,
   `changes-argument` (§7.2) — and warn when a portrait render of a
   `changes-argument` layout (comparison, any matrix) will alter the claim.
5. **Bake a small upward optical offset into centred hero/statement text** (§1.6),
   as a token rather than leaving it to chance.
6. **Drop any golden-ratio / rule-of-thirds framing** from guidance if present;
   both are folklore here (§1.8). Replace with size/space hierarchy + Gestalt +
   optical balance, which the skill already largely does.

### Worth exploring (good evidence, some cost)
7. **Variable-span bento for 3–8 items** instead of a hard 3-card cap (§6.3).
   Promote an odd cell to 2×1/2×2 and backfill; this is how real bento handles odd
   counts and lets one layout absorb a range. Cost: the overflow gate must reason
   about spans, and `grid-auto-flow: dense` must be avoided for anything
   interactive (not an issue for static slides — a point in the skill's favour).
8. **Add a `hierarchy`/tree layout** for parent→child/org content (§5). Second of
   the two clearly-earned SmartArt categories. Portrait is the known weakness
   (indented list with connectors); scope it to shallow trees.
9. **Reconsider `quadrant` — the materially-new argument** the skill invites:
   the prior rejection ("no axis-label field, portrait reflow destroys axis
   meaning") is correct *for continuous, axis-labelled matrices* (a BCG-style
   scatter). But a **2×2 with two *categorical* axes** (e.g. "urgent/not ×
   important/not") is just four labelled cells whose axis labels are group headers,
   not a coordinate space — it reflows to a 1-column stack of four labelled cells
   without lying, because categorical axes have no interpolation to destroy. If
   added, gate it to **categorical-only** and forbid the continuous/scatter form.
   Matrix is the *only* shape that claims two independent axes (§8.2); nothing else
   in the catalogue can make that claim honestly.

### Note / boundary (keep as-is, but name it)
10. **N-way comparison tables** are the honest shape for ≥3 items × ≥3 attributes
    (§8.3) and the skill has no equivalent. Keeping them out of scope is
    defensible (they stress the overflow gate), but the boundary should be *stated*
    so authors know cards are the wrong tool there rather than forcing content into
    `tiled`.
11. **People/team** layout recurs in Beautiful.ai and SmartArt Picture-orgs but is
    a narrow content type; reasonable to omit. Name it as a deliberate omission.

---

## Appendix A — source quality and conflicts

- **Primary / high-trust:** Mayer multimedia corpus (peer-reviewed, effect sizes
  reported); Müller-Brockmann (canonical text); NN/g (practitioner research, some
  eyetracking-backed); MDN/CSS Grid behaviour; Microsoft SmartArt docs and
  Beautiful.ai/Slidev catalogues (primary product truth); Markowsky and the 2024
  PLoS RCT on the golden ratio (empirical).
- **Medium-trust:** superdesign.dev bento recipe — a vendor blog, but it *verified
  examples live*, corrected the Linear/Vercel folklore, and its CSS matches MDN
  Grid behaviour, so its concrete recipe is trustworthy; its trend-percentage stats
  are self-reported.
- **Low-trust / flagged:** the "whitespace +20% comprehension" figure (unsourced,
  §2.2); generic "gestalt principles" listicles (used only to corroborate NN/g).

**Conflicts reported:**
- *Rule of thirds:* photographers defend it as a simplification of the golden
  section; the one empirical test found no correlation with calculated values
  (§1.8). Reported both; sided with the empirical result.
- *Golden ratio:* near-universal in popular design writing; refuted in the peer-
  reviewed and RCT literature. Sided with the evidence.
- *12-column grid:* no empirical source condemns it for slides; the case here is
  structural (fixed vs fluid canvas), flagged as reasoning not measurement.

## Appendix B — assumptions (unverified)
- **U-03-1:** "12 columns is wrong for a 16:9 slide" is a structural argument, not
  a measured finding.
- **U-03-2:** the optical-centre upward offset (~2–3% of height) is a craft
  heuristic, not a measured constant.
- **U-03-3:** the variable-span bento (§6.3, rec 7) interacting cleanly with the
  skill's pixel-measured overflow gate is inferred from the CSS behaviour, not
  tested against the skill's actual gate implementation.
- **U-03-4:** portrait-reflow claims per archetype (§5, §7.2) are reasoned from the
  geometry of a tall canvas; not empirically A/B tested for comprehension.
