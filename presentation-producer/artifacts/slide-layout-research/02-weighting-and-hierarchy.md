# Information Weighting and Visual Hierarchy

Track 02 of the presentation-design research. The central question: **information
weight should map onto layout, so the layout itself directs the viewer's focus to
the right thing at the right moment** — whether the viewer is following a narration
in a video or reading the slides on their own.

This report treats the craft on its own terms first, then closes with a concrete,
numeric **weighting model** a generator could implement, and a set of proposed
changes to the `presentation-producer` content model, layout catalogue, and
renderer. Every empirical claim carries a URL. Claims I could not verify against a
primary source are labelled **[UNVERIFIED]** or **[ASSUMPTION]**.

A note on transfer: almost all of the strong evidence here comes from three fields
— vision science (visual search / preattentive processing), data-visualisation
perception (Cleveland & McGill and successors), and multimedia learning (Mayer). None
of these studied *slides* directly. Where I extend their findings to slides I say so;
those extensions are reasoned, not measured.

---

## 0. Executive summary (the load-bearing claims)

1. **Only a handful of visual attributes actually pull the eye pre-attentively.**
   Wolfe & Horowitz's "undoubted" guiding attributes are **colour, motion,
   orientation, and size** (size includes length and apparent size). Everything
   else is weaker, ambiguous, or does not guide at all. A hierarchy system should
   spend its strongest signals on these four and treat the rest as decoration.
   (Wolfe & Horowitz 2017, Table 1 — https://pmc.ncbi.nlm.nih.gov/articles/PMC9879335/)

2. **Salience is relative, not absolute.** An element pops out in proportion to how
   *different* it is from its neighbours (target–distractor heterogeneity) and how
   *similar* the neighbours are to each other (distractor–distractor homogeneity).
   This is the single most important design consequence: you cannot make one card
   dominant by styling it heavily; you make it dominant by keeping the *others*
   quiet. (Wolfe & Horowitz 2017 — https://pmc.ncbi.nlm.nih.gov/articles/PMC9879335/)

3. **Area is a weak quantitative channel.** People systematically *under*-read area:
   Cleveland & McGill rank area well below position and length for judging "how much
   bigger." So a card twice the area does **not** read as twice as important —
   viewers underestimate the ratio. To make dominance *unambiguous* you need a large
   step, not a subtle one. (Cleveland & McGill 1984; Heer & Bostock 2010 —
   https://info3312.infosci.cornell.edu/ae/graphical-perception-A.html)

4. **Reading-path templates (Z, F, Gutenberg) are weak defaults, not laws.** The
   F-pattern is what happens when the designer supplies *no* hierarchy; NN/g calls it
   "bad for users" and says good design should *break* it. The takeaway is not "lay
   things out in an F" but "impose a hierarchy so strong the eye ignores the default
   scan path." (NN/g 2017 — https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)

5. **In the narrated case, audio drives the attention schedule; the visual must not
   fight it.** Mayer's signalling, spatial-contiguity, temporal-contiguity and
   redundancy principles all say the same practical thing: at any moment the visually
   dominant thing should be the thing the narration is talking about, and the slide
   must not duplicate the script as body text. This is the strongest argument in the
   whole report for **build-on-mention / one-idea-per-scene** over static
   many-part slides. (Mayer, multimedia principles — effect sizes below.)

6. **Three to four hierarchy levels per slide is the practical ceiling.** Beyond
   that, size steps stop being reliably distinguishable and the "equal cards"
   failure sets in. This matches both the type-scale literature and the
   dashboard "3–5 numbers, readable in 5 seconds" convention.

---

## 1. Preattentive processing and visual salience

### 1.1 What the primary sources actually say

**Anne Treisman — Feature Integration Theory (FIT).** Treisman proposed that a small
set of basic visual features are registered "pre-attentively," in parallel, across
the whole field, before focused attention binds them into objects. A target defined
by a *single* unique feature (one red dot among green) "pops out" — search time is
flat regardless of how many distractors there are. A target defined by a *conjunction*
of features (a red *vertical* bar among red horizontals and green verticals) requires
serial attention and gets slower as items are added. (Treisman & Gelade 1980, "A
feature-integration theory of attention"; summarised in Wolfe & Horowitz 2017 —
https://pmc.ncbi.nlm.nih.gov/articles/PMC9879335/)

**Design consequence of the conjunction finding, which is under-appreciated:** if you
try to mark the important card with *two* weak cues at once (say a slightly different
hue *and* a slightly different size), and other cards each share one of those cues,
the important card no longer pops — it becomes a conjunction search. One strong,
unique cue beats two shared weak ones.

**Koch & Ullman / Itti & Koch — computational salience.** Koch & Ullman (1985)
described a "winner-take-all" saliency map that selects the most salient location;
Itti & Koch (1998, 2000) built the canonical computational model that combines
colour, intensity (luminance), and orientation feature maps into a single saliency
map and predicts fixation order. This is the model behind most "attention heatmap"
tools. (Confirmed as "the seminal modern work on bottom-up salience" in Wolfe &
Horowitz 2017 — https://pmc.ncbi.nlm.nih.gov/articles/PMC9879335/. The Itti–Koch
model itself: Itti, Koch & Niebur 1998, IEEE PAMI — widely cited; primary PDF at
http://ilab.usc.edu/publications/doc/Itti_etal98pami.pdf **[UNVERIFIED — could not
fetch the PDF this session; citation from secondary references]**.)

**Crucial caveat from Wolfe & Horowitz on salience models:** bottom-up salience "by
itself … does only modestly well in predicting the deployment of attention." Models
predict fixations well *only when the viewer has no goal*; the moment the viewer has
a task (or, for us, a narration telling them what to look for), top-down feature
guidance and scene structure dominate. **This means a purely bottom-up "make it
salient" strategy is unreliable for a narrated video — the narration is the task.**
(https://pmc.ncbi.nlm.nih.gov/articles/PMC9879335/)

**Colin Ware — Information Visualization: Perception for Design.** Ware organises the
preattentive features into four groups: **form** (orientation, length, width, size,
curvature, shape, closure, etc.), **colour** (hue, intensity/luminance), **spatial
position** (2D position, stereo depth), and **motion** (flicker, motion direction).
(Confirmed grouping — https://www.scribd.com/document/591402459/Readings-02-Pre-attentive-attributes;
Ware's book is the primary source, 4th ed. 2021, Morgan Kaufmann.)

### 1.2 The authoritative ranking of attributes by strength

The best-evidenced ranking is Wolfe & Horowitz's tiered table (2017), which grades
each candidate attribute by *how confident the field is that it guides attention*, on
the basis of converging experiments. This is stronger than any listicle "top 7
preattentive attributes" because it is a literature-wide verdict, not one study.
(Full table: https://pmc.ncbi.nlm.nih.gov/articles/PMC9879335/, Table 1.)

| Tier | Attributes | Design reading |
| --- | --- | --- |
| **Undoubted** | **Colour, Motion, Orientation, Size** (size incl. length, spatial frequency, apparent size) | Use these to carry hierarchy. They are the reliable, cross-lab attention-getters. |
| **Probable** | Luminance onset (flicker), luminance polarity, vernier offset, stereoscopic depth/tilt, pictorial depth cues, **shape**, line termination, **closure**, curvature, topological status | Usable but weaker or ill-defined. "Shape" clearly guides but nobody can define *what about* shape. **Closure** = enclosure/containment (a box around content) — this is the perceptual basis for "card" borders. |
| **Possible** | Lighting direction (shading), expansion/looming, **number** (numerosity), glossiness, aspect ratio, eye-of-origin | Single-paper support. Treat as decorative, not load-bearing. |
| **Doubtful** | Novelty, letter identity, familiarity | Do not rely on. |
| **Probably NOT guiding** | Intersection, optic flow, colour *change*, 3-D volume, luminosity, material type, semantic category, **duration**, biological motion, your name, **threat** | These do not pull the eye pre-attentively even though intuition says some should. |

**Important nuances the table encodes:**

- **Motion is "undoubted."** In a *video*, motion (a build, a wipe, a highlight
  animating in) is one of your strongest attention tools — stronger than colour on a
  static slide. It is unavailable on a static slide or a printed handout, which is a
  first-class reason the narrated case differs from the deck case.
- **Colour = hue, and it is undoubted, but "colour *change*" is "probably not
  guiding."** So a static colour contrast pulls the eye; a colour that merely changes
  over time does not reliably do so on its own. **[Interpretation]** For a build, it
  is the *appearance/motion* of the new element that guides, not the colour swap.
- **Duration is "probably not guiding."** Holding something on screen longer does
  not make the eye go to it. Narration timing matters for *comprehension*, but you
  cannot rely on "it's been up longer" to draw the eye.
- **Enclosure (closure) is only "probable," weaker than size/colour.** A border
  around a card is a real but modest cue. This is evidence *against* relying on card
  borders alone to signal dominance — they are weaker than making the card bigger or
  recolouring it.

### 1.3 A practical strength ordering for slides

Wolfe & Horowitz grade *confidence that an attribute guides at all*, not *how
strongly* each guides in a design context. Combining their tiers with Ware and with
common data-viz practice, the practical ordering of emphasis strength for a slide is
approximately (strongest first):

1. **Motion / animated reveal** — video only; the single strongest cue when available.
2. **Size** (area + type size) — undoubted; also the channel that maps most naturally
   to "importance." But see §2 — it is read *non-linearly*.
3. **Hue / colour contrast** — undoubted; extremely strong but carries semantic and
   accessibility baggage (see §4).
4. **Luminance / value contrast** — probable (luminance polarity/onset); this is what
   survives greyscale and is the most accessibility-robust cue.
5. **Position / isolation (whitespace)** — spatial position is a Ware primary; centre
   of gravity attracts fixation (Wolfe & Horowitz cite Richards & Kaufman 1969).
6. **Orientation / alignment break** — undoubted as an attribute, but rarely usable in
   a text-slide grid without looking broken.
7. **Enclosure / border / elevation (shadow)** — probable (closure) and weaker; good
   for *grouping*, mediocre for *ranking*.

**[UNVERIFIED — ranking synthesis]** The relative *ordering within* the top tier
(size vs hue vs luminance) is my synthesis across Ware and Wolfe & Horowitz; the
literature grades confidence-of-guidance, not a clean strength scalar, so treat 2–4
as roughly co-equal "strong" cues rather than a strict order.

### 1.4 Which attribute encodes which rank

The design translation, judged against "the eye goes to the most important thing":

- **Primary (the one thing):** carry it on the **strongest available** channel and
  make it *unique* on that channel. On a static slide that means **largest size**,
  and optionally the *only* saturated/accent-coloured element. In video it means
  **it is the thing that just moved / built in**.
- **Secondary (supporting):** neutral colour, mid size, grouped by enclosure or
  alignment. It must be *homogeneous* with its peers so the primary stays unique
  (the DD-homogeneity rule).
- **Tertiary (context / labels / captions):** smallest size, lowest luminance
  contrast (grey), no accent colour, no border. It should recede.

**The governing rule from vision science:** dominance comes from *contrast against a
quiet field*, not from *stacking cues on the hero*. Practically: to make one card
dominant, first make the others plainer.

---

## 2. Encoding importance rank as layout (area, JND, type scales)

### 2.1 Does a card twice the area read as twice as important? No.

The Cleveland & McGill (1984) elementary-perceptual-task ranking, replicated and
extended by Heer & Bostock (2010), orders how *accurately* people decode a quantity
from each visual channel, from most to least accurate:

1. Position along a common scale (most accurate)
2. Position on non-aligned scales
3. Length
4. Angle / slope
5. **Area**
6. Volume
7. Colour saturation / luminance
8. Colour hue (least accurate — for categories, not quantity)

(Cleveland & McGill 1984, JASA 79:531–554; replication Heer & Bostock 2010, CHI —
task list and replication described at
https://info3312.infosci.cornell.edu/ae/graphical-perception-A.html; ranking summary
https://guides.lib.berkeley.edu/data-visualization/type and
https://arxiv.org/html/2212.10533v1)

The consequence for "area as weight": **area sits near the bottom.** People
*under-estimate* area ratios — a classic finding is that a circle that is
double the area is judged only ~1.5× bigger (Stevens' power law for area has an
exponent below 1). Rectangular area is more accurate than circular but still well
below length and position. So:

- **A card twice the area does NOT reliably read as twice as important — it reads as
  "somewhat more important," and the exact ratio is lost.** Area encodes *ordinal*
  dominance ("this one is the big one") reliably, but not *ratio* weight.
- **To make dominance unambiguous rather than ambiguous, the area step must be
  large.** Because viewers compress the perceived ratio, a 1.3–1.5× area difference
  reads as "roughly equal, slightly different" (ambiguous). A **≥2× area** difference
  is needed before "this is clearly the dominant one" is unmistakable, and combining
  area with a second channel (position + a bigger headline type) removes the
  remaining doubt. **[Interpretation grounded in the area-underestimation literature;
  the exact 2× threshold is a reasoned design heuristic, labelled ASSUMPTION.]**

This directly validates the existing `spotlight` layout's "one dominant card" concept
and the `recommendLayout` rule that routes a card carrying ≥1.4× the *text* of the
next heaviest into a dominant slot — but note that 1.4× of *text volume* is a
different thing from 1.4× of *area*, and 1.4× area alone is below the "unambiguous"
threshold. See the model in §8.

### 2.2 Weber's law / JND and size steps

Weber's law: the just-noticeable-difference (JND) in a stimulus is a roughly constant
*fraction* of the stimulus, not a constant absolute amount. For visual length/size
the Weber fraction is on the order of a few percent under ideal side-by-side
conditions, but for *un-aligned, non-adjacent* elements on a busy slide it is far
larger. (Weber–Fechner is textbook psychophysics; a readable primary-adjacent
treatment is Ware, *Information Visualization*, ch. on magnitude estimation.)

Design consequence: **two size levels that differ by less than ~15–20% will not read
as deliberately different across a slide** — viewers will read them as "the same size,
sloppily set." This is *why* modular type scales exist: they guarantee each step
clears the JND.

### 2.3 Modular / typographic scales — which ratios produce distinguishable levels

A modular scale multiplies a base size by a fixed ratio per step. Common ratios:

| Name | Ratio | Steps from 16px |
| --- | --- | --- |
| Minor second | 1.067 | 16 → 17.1 → 18.2 … (too subtle: below JND) |
| Major second | 1.125 | 16 → 18 → 20.25 … (marginal) |
| Minor third | 1.200 | 16 → 19.2 → 23 → 27.6 … |
| Major third | 1.250 | 16 → 20 → 25 → 31.25 → 39 … |
| Perfect fourth | 1.333 | 16 → 21.3 → 28.4 → 37.9 … |
| Golden ratio | 1.618 | 16 → 25.9 → 41.9 → 67.8 … |

(Ratios and worked examples:
https://iotools.cloud/journal/modular-type-scale-typography-css/ and
https://whatfontfinder.com/type-scale-calculator/)

Readings for hierarchy:

- **Ratios at or below ~1.125 do not clear the JND reliably** on a slide — adjacent
  levels look like the same size. Avoid for hierarchy (fine for body/caption
  micro-adjustments).
- **1.25 (major third) is the sweet spot for on-screen hierarchy**: each step is a
  clear +25%, comfortably above JND, but the scale does not explode so fast that you
  run out of room. This is the most common design-system default.
- **1.333–1.5 give very strong, unmistakable steps** — good when you have few levels
  and want them dramatically separated (typical of slides, which have far fewer
  levels than a document).
- **Golden ratio (1.618) is dramatic but coarse** — by the third step you are at ~4×
  the base, which on a 1080p slide is a large headline. Good for a 2-level hero, bad
  for 4-level hierarchy (levels 3 and 4 either collide with the base or the headline
  overflows). For a slide medium the practical choice is **1.25 for dense slides,
  1.333–1.5 for sparse hero/statement slides.** **[Interpretation]**

### 2.4 How many hierarchy levels can one slide support?

Converging evidence puts the ceiling at **three, occasionally four**:

- **Cleveland & McGill hierarchy re-examination** found that although the original
  ranking had ten elements, in practice "there may be no more than three or four
  individual rankings" that people reliably distinguish
  (https://www.researchgate.net/publication/221249388_An_Examination_of_Cleveland_and_McGill's_Hierarchy_of_Graphical_Elements).
- **Dashboard practice** converges on "3–5 numbers, understood in under 5 seconds"
  and NN/g's finding that dashboard effectiveness "drops sharply when more than 7
  metrics compete" (secondary citation of NN/g:
  https://powerbiconsulting.com/blog/executive-kpi-dashboards-power-bi-c-suite-2026
  **[UNVERIFIED — I could not locate the exact NN/g source for the "7 metrics" claim;
  treat as folkloric-but-plausible]**).
- **Type-scale reality:** with a 1.25 ratio and a slide's limited vertical budget you
  can fit at most ~4 clearly-distinct sizes (e.g. 24 / 30 / 38 / 60 px) before the
  top overflows or the bottom collides with the caption size.

**Recommendation: design for exactly three weight levels — Primary, Secondary,
Tertiary — and allow a fourth (a "hero/kicker" super-level) only on sparse slides.**
This is the backbone of the model in §8.

---

## 3. Reading paths and layout-driven attention order

### 3.1 What the templates claim

- **Gutenberg diagram:** for evenly-distributed *homogeneous* content, the eye starts
  top-left (primary optical area), sweeps to the terminal area bottom-right along
  "reading gravity," with a strong and a weak fallow corner. Origin: Colin Wheildon /
  typographic folklore. (https://vanseodesign.com/web-design/3-design-layouts/)
- **Z-pattern:** top-left → top-right → diagonal → bottom-left → bottom-right; a
  variant of Gutenberg for sparse layouts where the eye *does* pass through the fallow
  corners. (https://vanseodesign.com/web-design/3-design-layouts/)
- **F-pattern:** for text-heavy pages with no formatting, fixations cluster on the top
  lines and the left edge, forming an F. (NN/g, discovered 2006.)
- **Layer-cake:** the eye hops between headings/subheadings, skipping body — the *most
  effective* scan pattern per NN/g. (https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/)

### 3.2 What the eye-tracking evidence actually supports (vs folklore)

The honest verdict from the strongest source (NN/g, who *ran* the eye-tracking):

- **The F-pattern is real but it is a *failure mode*, not a template to design toward.**
  NN/g: "The F-pattern is the default pattern when there are no strong cues to attract
  the eyes toward meaningful information," and it is "bad for users and businesses"
  because they miss content merely by its column position. Their explicit advice is to
  *break* it with headings, bolding, grouping, and cutting text.
  (https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/)
- **The F/scan pattern is contingent on task, motivation, layout, and content** — not
  a fixed law. Four patterns (F, spotted, layer-cake, commitment) occur depending on
  those factors; layer-cake and commitment give better comprehension.
  (https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/)
- **Gutenberg and Z are largely folklore / weakly evidenced.** They come from
  mid-century typographic tradition (Wheildon) and design pedagogy, and I could find
  **no controlled eye-tracking study confirming a Z-scan on real content**. NN/g's
  data shows F and layer-cake, not Z. Treat Gutenberg/Z as *plausible heuristics for
  sparse, unstyled layouts only*, and note that a strong visual hierarchy *overrides*
  them entirely. **[Folklore flag — the Z/Gutenberg reading-gravity claim is not
  supported by the eye-tracking evidence I found; the sources asserting it are design
  blogs, not studies: https://vanseodesign.com/web-design/3-design-layouts/,
  https://studyguides.com/study-methods/overview/... ]**
- **Direction is script-dependent.** In right-to-left languages (Arabic, Hebrew) the
  F-pattern is mirrored — attention leans right. Confirmed by NN/g eye-tracking. Any
  "dominant slot goes top-left" rule must flip for RTL locales.
  (https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/ and
  https://www.nngroup.com/articles/horizontal-attention-original-research/)

### 3.3 What this implies for where the dominant element goes

- On a slide *with* a strong hierarchy (which is the whole point of this system), the
  dominant element goes wherever you make it dominant — a large, high-contrast,
  isolated element will be fixated first **regardless** of the F/Z template, because
  bottom-up salience + your deliberate cue beats the default scan. The reading-path
  templates only govern *residual* attention among near-equal elements.
- Absent a strong hierarchy, and for LTR scripts, the top-left / upper region is the
  safest home for the primary element and the first line of a title — this is where
  the F begins and where "reading gravity" starts. So **the default position for the
  primary slot should be top-left-biased for LTR, top-right-biased for RTL**, but this
  is a tiebreak, not a driver.
- The **layer-cake** finding is the most actionable for slides: viewers hop between
  *headings*. This is strong evidence for **every card carrying a short, information-
  first title/label** (heading-like), because that is what the scanning eye lands on.
  It also supports NN/g's "front-load the informative words" rule for card titles.

### 3.4 Does narration change the answer? Yes, fundamentally.

In a narrated video the *narration sequences attention for the viewer*. The reading-
path templates assume the viewer is free-scanning; a voiceover replaces free-scanning
with a scripted schedule. Wolfe & Horowitz's point that "bottom-up salience will not
do well if the observer has a clear top-down goal" applies directly: **the narration
is the goal.** So in video the question shifts from "where does the eye go first?" to
"is the visually dominant thing *right now* the thing the narration is saying *right
now*?" — which is §6.

---

## 4. The emphasis toolkit and its costs

Each technique rated for **strength** (as an attention cue), and for four **costs**
that matter to this pipeline specifically:
- **Noise:** does over-use of it destroy the "quiet field" that makes contrast work?
- **Greyscale:** does it survive when colour is removed (print, projector, colour-blind
  viewers)?
- **Portrait reflow:** does it survive the 1920×1080 → 1080×1920 re-render?
- **Static-in-video:** does it still work as a *held frame* in a video (i.e. without
  relying on motion)?

And flagged **A = safe to automate** (deterministic from declared weight) or
**E = editorial** (needs authorial judgement).

| Technique | Strength | Noise risk | Greyscale | Portrait reflow | Static-in-video | Auto? |
| --- | --- | --- | --- | --- | --- | --- |
| **Scale (area + type size)** | Very high (size = undoubted) | Low if few levels | ✅ survives | ⚠️ area ratios change; re-solve per orientation | ✅ | **A** |
| **Weight (font weight)** | Medium | Med — "everything bold = nothing bold" | ✅ | ✅ | ✅ | **A** |
| **Colour / accent hue** | Very high (undoubted) | High — one accent max | ❌ collapses in greyscale; fails for ~8% of men (colour-blind) | ✅ | ✅ | **A (single accent) / E (palette)** |
| **Luminance / value contrast** | High (probable) | Med | ✅ **best greyscale survivor** | ✅ | ✅ | **A** |
| **Isolation / whitespace** | High (position + centre-of-gravity) | Low | ✅ | ⚠️ vertical space is scarcer in portrait | ✅ | **A** |
| **Enclosure / border / card** | Medium (closure = probable) | Med — borders everywhere add noise | ✅ | ✅ | ✅ | **A** |
| **Position (top-left / centre)** | Medium | Low | ✅ | ⚠️ must flip for RTL; grid reflows | ✅ | **A** |
| **Alignment break** | Medium (orientation-ish) | High — reads as "broken" if unintended | ✅ | ⚠️ fragile | ✅ | **E** |
| **Dimming / greying non-focal** | High (creates contrast by *lowering* others) | Low — actively *reduces* noise | ✅ | ✅ | ✅ | **A** |
| **Highlight (marker/background)** | High | Med | ⚠️ depends on value contrast, not hue | ✅ | ✅ | **A** |
| **Elevation / shadow** | Low–Med | Med — subtle, easily lost | ⚠️ weak in greyscale | ✅ | ✅ | **A (subtle) / E (heavy)** |
| **Progressive reveal / build** | Very high (motion = undoubted) | Low | n/a | n/a | ❌ **motion does not exist in a held frame** | **A in video only** |

Sources for the strength column: Wolfe & Horowitz 2017 tiers
(https://pmc.ncbi.nlm.nih.gov/articles/PMC9879335/); centre-of-gravity fixation
(Richards & Kaufman 1969, cited therein); Mayer signalling for highlight/cue
(https://www.devlinpeck.com/content/mayers-principles-of-multimedia-learning).

**Key editorial-vs-automatable conclusions:**

- **Safe to automate from a declared weight:** scale, weight, single-accent colour,
  luminance, isolation, enclosure, position, dimming, highlight, subtle elevation.
  These are deterministic functions of "which level is this element."
- **Editorial (needs a human/agent decision):** *palette choice* (brand, semantics),
  *alignment breaks*, *heavy elevation/skeuomorphism*, and **the assignment of which
  content is Primary** — a machine can enforce that a Primary exists and is unique,
  but choosing *what deserves* to be primary is authorial. This maps cleanly onto the
  skill's existing "advisor warns, author decides" philosophy.
- **The two cues that survive everything (greyscale + portrait + held video frame)
  are SIZE and LUMINANCE.** These should be the *primary* hierarchy carriers.
  Colour and motion are powerful *additions* but must never be the *only* carrier,
  because colour dies in greyscale and motion dies in a static frame or handout.
  This is a concrete, defensible rule for a generator that must ship the same content
  as a landscape deck, a portrait deck, and a video.

---

## 5. When hierarchy is absent or contested — failure modes and detectable signals

### 5.1 The squint test (the canonical diagnostic)

Blur/squint at the design until detail disappears; you should still see the most
important thing first, second-most second, and so on. If everything blurs to the same
grey mass, there is no hierarchy. (Multiple practitioner sources converge:
https://learnui.design/blog/squint-test-ui-design-case-study.html,
https://polypane.app/blog/debug-your-visual-hierarchy-with-the-squint-test/,
and for data specifically
https://www.sqlservercentral.com/blogs/design-concepts-for-better-power-bi-reports-part-4-the-squint-test)

**This is directly automatable in a deterministic pipeline** — see §5.5.

### 5.2 Everything-is-bold

"When everything is bold, nothing is bold." Emphasising everything cues nothing —
exactly the conjunction/heterogeneity failure from §1: if every element carries the
"important" cue, no element is *unique* on that cue, so none pops.
(https://brainito.com/visual-hierarchy-checker; Mayer signalling: "cueing everything
cues nothing" — https://www.devlinpeck.com/content/mayers-principles-of-multimedia-learning)

### 5.3 The "equal cards" problem

Five cards of equal size, weight, and colour force the viewer to read all five to
learn which matters — the layout has abdicated its job of ranking. This is the
`tiled` layout's inherent risk, and it is *correct* only when the items genuinely are
of equal weight (a set, a menu, parallel options). When one item is actually more
important, equal tiling is a hierarchy failure.

### 5.4 Dominant slot filled with the least-important content

The worst failure: the layout *has* a dominant slot, but the content placed there is
not the most important thing — so the layout actively points the viewer at the wrong
thing. The skill's advisor already detects a weaker version of this ("if the heaviest
card is not first … the dominant slot goes to a lighter card"), but it uses *text
volume* as the proxy for importance, which is not the same as importance (a big number
is short but important; a caveat can be long but minor). See §8 for a declared-weight
fix.

### 5.5 Detectable signals a generator can compute

Because this pipeline already pixel-measures the rendered slide, several of these are
computable deterministically at build time:

| Failure | Detectable signal (computable) |
| --- | --- |
| No hierarchy (squint fail) | Downscale the rendered slide to ~1/16 linear size (a blur proxy), compute per-element mean luminance/contrast against background; if no element's saliency score exceeds the others by a set margin → **warn: no dominant element**. |
| Everything-bold | Count elements at the top weight/size level; if > 1 element is at Primary level (excluding the title) → **warn: multiple primaries**. |
| Equal cards but declared unequal | If author declared weights differ but rendered sizes/areas are within JND (< ~15%) → **warn: declared hierarchy not visible**. |
| Dominant slot mis-filled | If the element in the layout's dominant slot is not the highest declared weight → **warn/error: reorder** (generalises the existing "heaviest not first" note to declared weight, not text length). |
| Contrast too low to survive greyscale | Convert to greyscale, recompute the dominant-element margin; if it drops below threshold → **warn: hierarchy depends on colour alone**. |

**[ASSUMPTION]** The exact thresholds (1/16 downscale, 15% JND, saliency margin) are
proposed starting points, not measured constants; they should be tuned against a
corpus of known-good and known-bad slides.

---

## 6. Weighting in the narrated case

This is where the presentation-*video* diverges most sharply from the deck, and where
the strongest experimental evidence exists (Mayer's lab, 200+ controlled comparisons).

### 6.1 The relevant multimedia-learning principles and their effect sizes

From Mayer's "reducing extraneous processing" cluster (effect sizes are median
Cohen's *d* from his meta-analyses; a *d* of 0.4 is moderate, 1.0 is large):

- **Spatial contiguity** — put words near the graphic they describe. Supported in
  **22 of 22** tests, **median d ≈ 1.10** (large).
  (https://www.researchgate.net/publication/262915119_Principles_for_reducing_extraneous_processing_in_multimedia_learning_...)
- **Signalling** — add cues that highlight the organisation/location of essential
  material (arrows, highlights, headings, vocal emphasis). Supported in **24 of 28**
  tests, **median d ≈ 0.41** (moderate).
  (https://www.cambridge.org/core/books/abs/cambridge-handbook-of-multimedia-learning/...CD5B7AE1279A9AB81F8EEBB53DBEC86E)
- **Redundancy** — graphics + narration beat graphics + narration + *identical
  on-screen text*. Reading and hearing the same words at once overloads. This is the
  single most-violated principle in practice.
  (https://www.devlinpeck.com/content/mayers-principles-of-multimedia-learning)
- **Temporal contiguity** — spoken words and the graphic they describe should occur at
  the *same time*, not "explain then show."
- **Modality** — narration + graphic beats on-screen-text + graphic for explaining a
  visual (spreads load across the auditory and visual channels). Most-studied
  principle in the literature.
- **Segmenting** — learner-paced (or narration-paced) chunks beat one continuous
  stream. In video this maps to **one-idea-per-scene** and building content in step
  with the narration.

(All six, with the "defaults not commandments / boundary conditions" caveat, are laid
out at https://www.devlinpeck.com/content/mayers-principles-of-multimedia-learning,
which cites Mayer's *Multimedia Learning* 3rd ed. 2021 and the 2022 *Smart Learning
Environments* systematic review of 136 articles.)

### 6.2 Does the visual need to point at what the narration is saying? Yes.

- **Spatial contiguity (d ≈ 1.10)** is the strongest single effect in the set and it
  says the *visual referent* of the current words must be *co-located* with attention.
  In a narrated slide this means: when the voiceover says "conversion jumped 40%," the
  "40%" must be the visually dominant, currently-highlighted thing — not buried as one
  of five equal cards.
- **Signalling (d ≈ 0.41)** says adding a cue that points at the current referent
  *improves learning* — highlight-on-mention, an arrow, a build. This is the direct
  mandate for **highlight-on-mention / build-on-mention**.
- **Temporal contiguity** says the highlight must be *synchronised* to the narration,
  not early or late.

### 6.3 What happens when visual salience and narration disagree?

They compete for the same limited channel and create *extraneous processing* — the
viewer spends capacity reconciling "the voice is talking about X but the brightest
thing on screen is Y." Wolfe & Horowitz's framing predicts the same conflict at the
attention level: a strong bottom-up salient distractor can capture attention away
from the top-down (narration-defined) target. **Conclusion: in video, the visual
hierarchy must be *slaved to the narration timeline*, not fixed for the whole slide.**
A statically-dominant element that is not the current topic is a defect in video even
though it is fine in a deck.

### 6.4 The 15-second question: one focal point, or a progression?

**Recommendation: a slide held under ~15 seconds of narration that covers more than
one idea should be a PROGRESSION (build-on-mention), not a static multi-part slide.**
Reasoning, from the evidence:

- Segmenting + temporal contiguity + signalling all favour revealing/emphasising each
  idea *as it is spoken* rather than showing all parts at once and letting salience and
  narration drift apart.
- Motion (build) is an "undoubted" attention cue (§1) and is the strongest tool
  available *only* in video — wasting it by showing everything statically forfeits
  your best cue.
- The *exception*: if the slide covers **exactly one idea** for those 15 seconds, it
  should carry **one weighted focal point** and hold — adding motion to a single-idea
  slide is gratuitous and violates coherence ("cut the extraneous").

So the rule is content-shaped, not time-shaped: **one idea → one held focal point;
multiple ideas under one continuous narration → build them on mention.** For a slide
that must *also* ship as a static deck page, the *final built state* is the deck page,
and it must independently pass the squint test as a static image (because the deck
viewer never saw the build).

### 6.5 A consequence for the content model

Mayer's **redundancy** principle is a direct constraint on the skill: **the on-screen
text must not duplicate the narration script.** The slide should carry *labels,
numbers, and the graphic* — the narration carries the prose. This is strong external
support for the skill's existing "bullet lists are forbidden, content is cards"
stance, and it argues further that card `text` in a *narrated* build should be short
label/number content, with the sentence-level explanation living only in the voiceover
track. (§8 proposes a `narration` field separate from on-slide `text` to enforce this.)

---

## 7. Quantitative content: weighting a metric against its context

### 7.1 A bare number is trivia; the context is the metric

The consistent message across dashboard-design practice: "a bare number with no
comparison is trivia, not insight — the real work of a metric card is context."
A number needs a **target, a baseline, a trend, or a comparison** to be actionable.
(https://www.saasui.design/blog/saas-metric-kpi-card-ux-patterns;
https://tabulareditor.com/blog/kpi-card-best-practices-dashboard-design;
https://fuselabcreative.com/kpis-and-data-dashboard-design/)

### 7.2 When a big number is right, and when it is a cheap trick

- **Right** when the number *is* the message and the audience already shares the
  context — a single headline KPI ("99.98% uptime", "3× faster") where the comparison
  is implicit or stated in narration. The big-number treatment then correctly assigns
  Primary weight to the thing that matters. This is the legitimate use of the skill's
  `stat-deepdive` layout.
- **A cheap trick** when the big number lacks context and is sized huge purely for
  drama — "518M" with no target/trend/baseline "forces readers to guess"
  (https://tabulareditor.com/blog/kpi-card-best-practices-dashboard-design). It assigns
  Primary weight to something the viewer cannot interpret. Detectable signal:
  **a stat slot with no accompanying comparison/delta/context field → warn.**

### 7.3 Delta / trend vs absolute value

- The *absolute* value answers "what is it now"; the *delta/trend* answers "is it
  getting better." For a decision-making audience the **delta/trend usually carries
  more information weight than the absolute** — hence KPI cards pair the headline with
  a sparkline / % change / arrow. (fanruan KPI-card anatomy:
  https://gallery.fanruan.com/kpi-card-example)
- **But a two-point delta can mislead**: "up 4% vs last month" hides whether that is
  signal or noise. The statistically honest treatment weights the *trend over several
  points* (a sparkline / process-behaviour chart) above a single two-point comparison.
  (https://www.leanblog.org/2021/11/true-but-meaningless-what-you-say-about-that-data-point-or-two/)

### 7.4 Weighting recommendation for a stat slide

Three tiers within a single metric:
- **Primary:** the headline value **or** the delta — whichever *is the message*.
  (If the story is "we grew," the delta is Primary and the absolute is Secondary; if
  the story is "we crossed 1M users," the absolute is Primary.)
- **Secondary:** the other of {value, delta}, plus the comparison basis (vs target /
  vs last period).
- **Tertiary:** the metric label, units, and time window.

This means the generator should let the author declare **which of value/delta is the
message**, rather than always making the raw number the biggest thing. That is a small
extension to the existing single-`stat` model (§8).

---

## 8. Proposed information-weighting model for the generator

A concrete, implementable model that maps *declared importance* onto *layout area,
type size, and emphasis treatment*. Designed to be deterministic (no network, no
taste at build time) and to survive landscape → portrait → video.

### 8.1 Author declares weight, not styling

Add an optional **`weight`** field to each content element (card, stat, title),
taking one of **four ordinal levels**. The author declares *rank*, never pixels or
colours — consistent with the skill's "authors never write slide HTML" invariant.

```yaml
# storyline.yml (proposed)
- layout: spotlight
  title: Conversion recovered after the checkout rebuild
  cards:
    - label: "+40%"          # the message
      weight: primary        # exactly one per slide (excl. title)
      detail: conversion vs. prior quarter
    - label: "2.1s"
      weight: secondary
      detail: median checkout time
    - label: "0 P1s"
      weight: tertiary
      detail: since launch
```

Rules the validator enforces (invariants, hard-fail) and the advisor warns on
(heuristics):

- **Exactly one `primary` per slide** (excluding the slide title, which is its own
  super-level). More than one primary → **error** (the everything-bold failure, §5.2).
- **`primary` must occupy the layout's dominant slot.** If not → **error: reorder or
  re-weight** (generalises the existing "heaviest not first" note to *declared* weight
  instead of text length, fixing §5.4).
- Weight defaults: if omitted, fall back to **card order** (first = higher) and emit
  a note, mirroring the existing "omitted layout is a warning" philosophy.

### 8.2 The mapping table (four levels → area, type, emphasis)

| Level | Layout area (relative) | Type size (ratio 1.25 base, sparse 1.333) | Emphasis carriers (in order) | Notes |
| --- | --- | --- | --- | --- |
| **Hero / kicker** (title, statement) | full-bleed or ≥60% | base × 1.333³–⁴ (≈ 38–60px on 1080p) | size + isolation + weight | Sparse slides only; the slide's headline. |
| **Primary** (the one thing) | ≥ **2×** any secondary card's area | base × 1.25² (≈ 25–31px label / big for a stat) | **size + luminance** (survive greyscale) → **+ single accent hue** → **+ isolation** → **+ build-on-mention (video)** | Must be unique on the accent channel. ≥2× area to clear the "ambiguous dominance" threshold (§2.1). |
| **Secondary** (supporting) | equal among themselves | base × 1.25 (≈ 20px) | enclosure/card + neutral weight | Must be **homogeneous** with each other so Primary stays unique (DD-homogeneity, §1.2). |
| **Tertiary** (labels, captions, context) | smallest | base (≈ 16px) at reduced luminance (grey) | low luminance, no accent, no border | Recedes; carries units/time/detail. |

Base sizes are illustrative for 1920×1080; the generator already pixel-measures, so
it should *solve* sizes to the largest that clears the overflow gate while preserving
the ratio gaps. **Ratio, not absolute size, is the invariant.**

### 8.3 Enforced separations (the JND / dominance thresholds)

- Adjacent type levels must differ by **≥ 1.2×** (clears JND; §2.2). Below that →
  **warn: levels not distinguishable**.
- Primary card area must be **≥ 2×** the largest secondary area to read as
  unambiguously dominant (§2.1). Below that (down to 1.4×) → **warn: dominance
  ambiguous**; below 1.2× → treated as equal (route to `tiled`, not `spotlight`).
- Hierarchy must **survive greyscale**: the dominant-element saliency margin must hold
  when colour is stripped (§4, §5.5). Colour-only hierarchy → **warn**.

### 8.4 Portrait reflow rule for weight

Weight is **orientation-invariant**; the *expression* re-solves per orientation. In
portrait, horizontal area is scarce, so Primary dominance shifts from *width* to
*vertical position + size + luminance* (it goes to the top and stays the biggest).
Every layout's portrait rule must preserve: (a) exactly one primary, (b) primary
first/top, (c) the ≥1.2× type-ratio gaps. This is a testable invariant, matching the
skill's existing "ten layouts really means ten times two" discipline.

### 8.5 Narrated-build additions

- Add an optional **`narration`** field per element/scene, *separate from* on-slide
  `text`, to enforce Mayer's **redundancy** principle (on-screen text ≠ spoken script;
  §6.5). If `narration` duplicates `text` verbatim → **warn**.
- Add an optional **`reveal`/`build` order** so elements appear/highlight *on mention*
  (signalling + temporal contiguity; §6.2–6.4). Rule: **multi-idea scene under one
  continuous narration → build on mention; single-idea scene → one held focal point.**
- The **final built state must independently pass the static squint test** (§5.5),
  because it is also the deck page for viewers who never saw the build.

### 8.6 Stat-slide extension (§7)

- Add a **`message: value | delta`** flag to the stat slot so the author declares
  which is Primary (§7.4), rather than the raw number always being biggest.
- A stat with no `comparison`/`delta`/`context` → **warn: bare number lacks context**
  (§7.2).
- Prefer a multi-point trend (sparkline) over a two-point delta where data exists
  (§7.3). **[This needs an image/graphic slot; the skill currently has no chart
  rendering — flagged as out-of-current-scope but noted as the right direction.]**

### 8.7 How this lands against the existing catalogue

- **Validates:** `spotlight` (one dominant + supporting), `stat-deepdive`, `statement`
  (single hero-weight claim), and the advisor's "heaviest → dominant slot" instinct.
- **Sharpens:** the advisor currently uses **text volume** as the importance proxy.
  Replace/augment with the **declared `weight`** field so importance is stated, not
  inferred from how much someone typed (fixes §5.4 and the "big number is short but
  important" edge case).
- **Reframes `tiled`:** it is correct *only* when items are genuinely equal weight;
  the validator should require **all cards same weight (or none declared)** for
  `tiled`, and route any declared-unequal set to `spotlight`/`bento-a` (§5.3).
- **Adds two content-model fields** (`weight`, `narration`) and one stat flag
  (`message`) — small, ordinal, author-declared, deterministic. No renderer network
  access; all thresholds computable from the already-rendered pixels.

---

## 9. Conflicts and open questions

- **Area-as-weight vs "make it 2×":** the data-viz literature says area is a *poor*
  quantitative channel (don't use area to encode a precise value), yet for *ordinal
  slide dominance* a large area step is exactly right. These are not in conflict once
  you separate "encode a number" (use position/length) from "signal which one matters"
  (use area + a second cue). I have kept them distinct in the model.
- **Z/Gutenberg reading-gravity:** asserted confidently by design blogs, unsupported
  by the eye-tracking evidence I found. I have down-weighted them to "sparse-layout
  tiebreak only." If a primary eye-tracking study on *slides specifically* exists, it
  would change the confidence here; I did not find one (searched — the eye-tracking
  corpus is on web pages and charts, not slides). **[Gap flagged.]**
- **Exact numeric thresholds** (2× area, 1.2× type JND, squint-downscale factor,
  saliency margin) are reasoned starting points, not measured constants. They should
  be calibrated against a labelled corpus of good/bad slides before being hard gates.
  **[ASSUMPTION flagged throughout.]**
- **Itti–Koch model PDF** could not be fetched this session; the claim that it is the
  canonical bottom-up salience model rests on Wolfe & Horowitz's characterisation,
  which is authoritative, plus secondary citations. **[Partial verification.]**

---

## Sources (primary and authoritative first)

- Wolfe, J. M. & Horowitz, T. S. (2017). *Five Factors that Guide Attention in Visual
  Search.* Nature Human Behaviour 1:0058. Full text incl. Table 1 of guiding
  attributes: https://pmc.ncbi.nlm.nih.gov/articles/PMC9879335/ — also
  https://www.nature.com/articles/s41562-017-0058
- Wolfe, J. M. & Horowitz, T. S. (2004). *What attributes guide the deployment of
  visual attention and how do they do it?* Nature Reviews Neuroscience 5:495–501.
  (Earlier version of the attribute table; abstract at
  https://www.researchgate.net/publication/8554486 — full text 403 this session.)
- Treisman, A. & Gelade, G. (1980). *A feature-integration theory of attention.*
  Cognitive Psychology 12:97–136. (Foundational; via Wolfe & Horowitz above.)
- Koch, C. & Ullman, S. (1985); Itti, Koch & Niebur (1998), *A model of saliency-based
  visual attention.* IEEE PAMI 20(11). (Canonical bottom-up salience; characterised in
  Wolfe & Horowitz 2017. PDF http://ilab.usc.edu/publications/doc/Itti_etal98pami.pdf
  **[UNVERIFIED this session]**.)
- Ware, C. *Information Visualization: Perception for Design* (4th ed., 2021, Morgan
  Kaufmann). Four preattentive categories: form / colour / position / motion —
  summary at https://www.scribd.com/document/591402459/Readings-02-Pre-attentive-attributes
- Cleveland, W. S. & McGill, R. (1984). *Graphical Perception.* JASA 79:531–554;
  Heer, J. & Bostock, M. (2010) CHI replication. Task list + ranking:
  https://info3312.infosci.cornell.edu/ae/graphical-perception-A.html;
  ranking summaries https://guides.lib.berkeley.edu/data-visualization/type and
  https://arxiv.org/html/2212.10533v1; hierarchy re-examination (3–4 usable levels)
  https://www.researchgate.net/publication/221249388
- Nielsen Norman Group — *Text Scanning Patterns: Eyetracking Evidence* (Pernice 2019):
  https://www.nngroup.com/articles/text-scanning-patterns-eyetracking/ ;
  *F-Shaped Pattern … Misunderstood, But Still Relevant* (Pernice 2017):
  https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/ ;
  *Horizontal Attention Leans Left* (RTL / direction):
  https://www.nngroup.com/articles/horizontal-attention-original-research/
- Mayer, R. — multimedia-learning principles + effect sizes: spatial contiguity
  (d≈1.10, 22/22), signalling (d≈0.41, 24/28), redundancy, temporal contiguity,
  modality, segmenting. Effect-size sources:
  https://www.researchgate.net/publication/262915119 and
  https://www.cambridge.org/core/books/abs/cambridge-handbook-of-multimedia-learning/...CD5B7AE1279A9AB81F8EEBB53DBEC86E ;
  practitioner synthesis + evidence-strength table
  https://www.devlinpeck.com/content/mayers-principles-of-multimedia-learning
- Modular type scales / ratios: https://iotools.cloud/journal/modular-type-scale-typography-css/ ;
  https://whatfontfinder.com/type-scale-calculator/
- Squint test: https://learnui.design/blog/squint-test-ui-design-case-study.html ;
  https://polypane.app/blog/debug-your-visual-hierarchy-with-the-squint-test/ ;
  data-viz variant https://www.sqlservercentral.com/blogs/design-concepts-for-better-power-bi-reports-part-4-the-squint-test ;
  everything-bold https://brainito.com/visual-hierarchy-checker
- KPI / big-number weighting: https://www.saasui.design/blog/saas-metric-kpi-card-ux-patterns ;
  https://tabulareditor.com/blog/kpi-card-best-practices-dashboard-design ;
  https://fuselabcreative.com/kpis-and-data-dashboard-design/ ;
  https://gallery.fanruan.com/kpi-card-example ;
  two-point-delta caution https://www.leanblog.org/2021/11/true-but-meaningless-what-you-say-about-that-data-point-or-two/
- Reading-path templates (folklore-flagged): https://vanseodesign.com/web-design/3-design-layouts/
