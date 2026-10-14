# Presentation, Slide and Layout Design — The Reasoning Behind the Craft

*A learning document that teaches the reasoning behind presentation and slide design
decisions, derived from research and organised by first principles.*

This is not a style guide and not a checklist. It is a document for someone who wants to
**learn** — to understand what matters in presentation design and *why*, well enough to
make their own decisions and know when a rule breaks. Every rule here is traced back to
the mechanism or the evidence that makes it true. Where something is merely convention,
it says so. Where the evidence is contested, the conflict is presented rather than
resolved silently. The intended reader is any practitioner or tool-builder who designs
slides, decks, or narrated video and wants the mechanisms, not the folklore.

---

## How to read this

**The concept template.** Every named concept is taught the same way, as a short
subsection rather than a rigid form:

1. **The principle** — stated in one or two sentences.
2. **Why it is true** — the mechanism (how vision, memory or attention works) and/or the
   evidence, with the study or source named and its effect size or finding where known.
3. **What follows for the designer** — the concrete consequence.
4. **The failure mode** — what goes wrong when it is ignored, described so it is
   recognisable in a real deck.
5. **How to check it** — a mechanical check where one exists, or the manual test where it
   does not.

**The evidence-strength tags.** Every substantive claim carries exactly one:

- **[EVIDENCE]** — backed by a named study, standard, or spec.
- **[PRACTICE]** — established professional practice; no experimental backing.
- **[CONTESTED]** — sources disagree; the disagreement is stated, not resolved silently.
- **[MYTH]** — commonly repeated and unsupported; its origin is named.
- **[ASSUMPTION]** — could not be verified in the underlying research.

Weight your own decisions by the tag. When a claim is a large effect replicated many
times, treat it as a constraint. When it is practice, treat it as a strong default you
may override with reason. When it is a myth, drop it.

**How the document is ordered.** It is in three parts that build on each other.
**Part A (Chapters 1–4)** lays the perceptual and cognitive foundations and assembles
them into the central idea, information weight. **Part B (Chapters 5–9)** covers how a
presentation is structured, titled, laid out, shaped, and sequenced. **Part C (Chapters
10–14)** covers what changes when a deck is narrated and distributed, how to present
evidence, the hard floor of legibility, and the myths and open questions. Read in order
for the full argument. **A skeptic may read Chapter 14 first** — it debunks the myths and
marks the contested and open questions, so a reader who distrusts presentation advice can
see up front which claims are load-bearing and which are folklore. **Chapter 15**
compresses the whole argument into a single table that indexes back into the reasoning.

---

## The thesis in one page

If you read no further than this page, these are the load-bearing ideas.

**Attention is the scarce resource, so every design decision is an allocation of
attention.** A viewer arrives with a fixed, small budget of perception and working
memory. A slide contains more potential things to look at than that budget can process.
There is no neutral choice — even "make everything the same" is an allocation that
declines to point at anything. The designer's job is to allocate attention to match
importance.

**A layout always encodes a hierarchy, whether or not the author chose one.** Size,
position, and enclosure are always present, and the visual system extracts a ranking from
them in the first ~100 ms, before any word is read. So hierarchy is *not optional* — only
*deliberateness* is. The choice is between a deliberate hierarchy that matches the
argument and an accidental one that matches whatever geometry fell out.

**Therefore information weight must be made equal to layout weight.** The most important
element — the one that carries the argument — must be the biggest, brightest, first-read
thing. When the visually dominant element is not the most important one, the viewer parses
a false hierarchy, forms the wrong expectation, discovers the mismatch, and re-reads — a
measurable cost paid out of the same working-memory budget as understanding.

**The title states the assertion; the dominant element proves it.** At the slide level,
"make information weight equal layout weight" resolves to: the title carries the claim,
and the single dominant element carries the proof of that claim. If the two disagree, the
slide is broken. The element that deserves the biggest slot is the most load-bearing one —
often *not* the one with the most text.

**Density forks by consumption mode; the argument does not.** The same storyline can be
presented live, read alone, or watched as narrated video. How much a frame can carry
differs sharply between them — a read deck is dense, a narrated video frame is sparse
because reading outpaces listening and duplicated text competes with the voice. But the
one assertion per unit stays constant across all three; that invariant is what lets one
storyline fan out into three artefacts without becoming three arguments.

**In a narrated piece, weight has a second axis: time.** Weight is expressed in space by
size and position, but in video it is also expressed in time by reveal order and timing.
The heaviest element is not merely the biggest — it is the one that reveals, moves, or
magnifies on the exact beat the narration names it. Presenting a corresponding word and
picture simultaneously is the single largest effect in the instructional-design corpus.

**The purpose of all of it is helping a viewer follow along** — following a narration in a
video, or following the slides alone. Every concept in this document is judged against
that one purpose, and each says explicitly how it serves it.

---

## Chapter map

- **Chapter 1 — First principles: what a slide actually is.** Derives what a slide is from
  four hard constraints, and the axiom that attention is scarce.
- **Chapter 2 — The perceptual substrate.** How the eye parses a layout before it reads
  words: scene gist, pre-attentive attributes, the strength ranking of cues, salience as a
  relative property, and which channels survive degradation.
- **Chapter 3 — The cognitive substrate.** Working-memory limits, cognitive load,
  split-attention, expertise reversal, and Mayer's multimedia principles that determine
  whether a viewer can keep up.
- **Chapter 4 — Information weight: the central idea.** Assembles Chapters 1–3 into the
  spine — information weight must equal layout weight — and derives the numbers.
- **Chapter 5 — Narrative structure.** Why a presentation needs a spine before slides, the
  two families of framework, and each named framework judged.
- **Chapter 6 — The title carries the meaning.** The highest-leverage single change:
  assertion titles, horizontal logic, the length ceiling, and the title-to-dominant-element
  relationship.
- **Chapter 7 — Layout systems and composition.** Grids, whitespace, the Gestalt rules as
  concrete gap/border/alignment tests, and the explicit debunking of golden ratio, rule of
  thirds, and Z-pattern.
- **Chapter 8 — A taxonomy of arrangements, and what each CLAIMS.** Shape is a claim:
  every arrangement asserts a proposition about the content, and the wrong shape is a false
  statement.
- **Chapter 9 — Sequencing across a whole presentation.** Consistency versus monotony,
  primacy/recency, pacing, video hard-cut grammar, and signposting that helps versus cargo
  cult.
- **Chapter 10 — The three consumption modes, and why density must fork.** Live, read, and
  video derived from four variables; the reading-speed-versus-speech-rate proof; the
  muted-viewing reality.
- **Chapter 11 — Narration and the time axis.** Writing for the ear, temporal contiguity as
  the largest effect, editorial craft, motion as an attention instrument, and demo craft.
- **Chapter 12 — Presenting evidence.** Presentation versus analytical charts, choosing the
  chart from the message, the annotated chart as default, big numbers, comparisons, and
  tables.
- **Chapter 13 — Legibility and accessibility: the hard floor.** WCAG contrast, type size
  derived from visual angle, measure, colour, typography at distance, safe areas, captions,
  and artefact accessibility.
- **Chapter 14 — Myths, contested claims and open questions.** Separates invented "facts"
  from genuinely contested questions from the unresolved edges of what is known.

Chapter 15 — *The reasoning compressed* — follows Part C, then a Glossary and a Sources
section.

---

# Part A — Foundations

*How to think about presentation, slide and layout design, from first principles. This
part builds the reasoning ground the rest of the document stands on. It does not give you
rules to memorise; it gives you the mechanisms — how vision, memory and attention actually
work — so you can derive the rules yourself and know when they break.*

## Chapter 1 — First principles: what a slide actually is

Before any rule about type sizes or grids, you have to know what kind of object a
slide is, because the rules are consequences of that. A slide is easy to mistake for
two things it is not: a document page and a speech. It is neither. We can derive what
it *is* from four hard constraints, and derive from those what a slide can and cannot
do.

### 1.1 The four constraints that define a slide

A slide is:

1. **A bounded 2D surface.** It has a fixed frame — a rectangle of fixed aspect ratio
   and fixed resolution. There is no scrolling, no "next page" within the surface, no
   room to expand. Everything competes for the same finite area at the same instant.
2. **Consumed in bounded time.** A slide is on screen for seconds, not minutes. In a
   narrated video the viewer usually cannot pause; the frame advances on the author's
   schedule, not the viewer's. Even in a read-alone deck, dwell time per slide is
   short and the viewer sets it.
3. **Read by a viewer with fixed perceptual and cognitive limits.** The visual system
   parses the frame in a fixed way and on a fixed timescale (Chapter 2); working
   memory holds only a few items at once (Chapter 3). These limits are not tunable by
   the designer — they are properties of the audience's biology.
4. **Usually consumed while someone else controls the pacing.** In the narrated /
   presented case the author (or the narration) sequences attention. The viewer is not
   free-scanning at leisure; they are being led.

### 1.2 What follows — what a slide can and cannot do

From constraint 1 (bounded surface): a slide **cannot** hold the full content of a
document. There is no room, and no scroll to make room. Every element added subtracts
area and attention from every other element. So a slide is a device for showing *one
structured thing at a glance*, not for storing text.

From constraint 2 (bounded time): a slide **cannot** be studied like a page. The
viewer will not re-read it three times to recover the point. Whatever the slide is
going to communicate, it has to communicate quickly, on the first pass. This is why a
slide is not a document page: a page is self-paced and re-readable; a slide is timed
and usually seen once.

From constraint 3 (fixed limits): a slide **cannot** exceed the viewer's perceptual
and memory budget without losing them. You cannot "just add more" — more elements do
not mean more communicated; past a small number they mean *less* communicated, because
the budget is spent on parsing clutter instead of meaning.

From constraint 4 (someone else paces it): a slide is **not** a speech either. A speech
is a linear stream the listener follows in time with no persistent visual. A slide is a
*persistent visual that accompanies a paced stream* — so at any moment the slide must
support, not fight, wherever the narration currently is. A slide that shows everything
at once while the narration is on one part forces the viewer to reconcile the two, and
that reconciliation costs attention (Chapters 3 and, in Part B, the narrated case).

Put together: **a slide is a bounded visual surface that must convey one structured
idea, fast, on a first glance, to a limited viewer who is usually being paced by
someone else.** That is a genuinely different object from both a page and a speech, and
every craft rule in this document is a consequence of it.

### 1.3 The axiom: attention is scarce, so design allocates it

Here is the load-bearing idea the whole document rests on. The viewer arrives with a
*fixed, small* budget of attention and working memory (Chapters 2 and 3 give the
numbers). The slide contains more potential things to look at than that budget can
process. Therefore **attention is the scarce resource, and every design decision is an
allocation of it.** Making one thing bigger, brighter, or more isolated spends the
budget on that thing and takes it from everything else. There is no neutral choice:
even "make everything the same" is an allocation — it spreads the budget evenly, which
means it declines to point at anything.

The designer's job, stated precisely, is to **allocate attention to match importance**:
the most important thing should get the most attention, the least important the least.

### 1.4 The consequence stated plainly

It follows directly that **a slide which does not direct attention has not failed to
be pretty — it has failed to function.** Prettiness is not the axis of merit. A slide
functions when the viewer's eye lands first on what matters most, and the arrangement
carries the point without a second, deliberate pass. A slide that is beautiful but
directs the eye to the wrong element, or to nothing in particular, has failed at its
one job. This is why the rest of the document is about *directing attention*, and why
"is it attractive?" is the wrong first question. The right first question is: **does
the arrangement point at the point?** [PRACTICE — this is the framing the underlying
research adopts; the individual mechanisms that justify it are evidenced in Chapters 2–4.]

---

## Chapter 2 — The perceptual substrate: how the eye reads a layout before it reads words

Chapter 1 asserted that a slide is parsed fast, on a first glance. This chapter is the
mechanism layer that makes that true. It explains *how vision actually works* in the
first fraction of a second, because that is what determines what a layout communicates
before any word is read. If you understand these mechanisms you can predict where an
eye will go, and therefore engineer where it goes.

### 2.1 Scene gist — the ~100ms pre-attentive parse

**The principle.** The viewer forms a first impression of a slide's *structure* — how
many blocks there are, which is biggest, where to look — within a single glance, before
reading any word.

**Why it is true.** The visual system extracts the "gist" of a scene astonishingly
fast. Greene & Oliva (2009), *The Briefest of Glances*, showed observers can categorise
a natural scene and its global properties from presentations of **19–67 ms**, reaching
maximum accuracy at **~100 ms** (https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2742770/).
Potter's conceptual short-term memory work showed a picture's *meaning* is grasped
almost immediately, even when the picture itself is quickly forgotten
(https://www.researchgate.net/publication/22152100). Oliva's *Gist of the Scene* review
consolidates the mechanism (http://olivalab.mit.edu/Papers/Oliva04.pdf). This is a
parallel, whole-field process: the brain does not scan the slide element by element to
form the gist; it takes in the coarse layout all at once. [EVIDENCE]

**What follows for the designer.** The arrangement is read *before* the text, so the
arrangement must already say what matters most. A layout whose structure matches its
information hierarchy is "instantly parseable"; a layout whose biggest block is not the
most important thing forces a second, deliberate pass — a measurable mismatch cost. This
is the deepest justification for the entire document: because the layout is parsed first,
the layout has to carry the ranking.

**The failure mode.** An even-weight grid with no focal point, or competing highlights,
or a misaligned reading order: the ~100ms glance yields no answer to "where do I look?",
and the viewer must fall back to slow, deliberate scanning. Recognisable as a slide
where you cannot tell at a squint what the point is.

**How to check it.** The squint test (Chapter 4): blur the slide until detail
disappears; if a clear focal point survives, the gist parse will succeed. If it blurs to
uniform grey, it will not.

### 2.2 Pre-attentive attributes and Feature Integration Theory

**The principle.** A small set of basic visual features are registered
"pre-attentively" — in parallel, across the whole visual field, before focused
attention is applied. A target that differs from everything around it on *one* such
feature "pops out" and is found instantly; a target that requires combining *two*
features is found only by slow, serial search.

**Why it is true.** This is Anne Treisman's Feature Integration Theory (Treisman &
Gelade 1980, *A feature-integration theory of attention*, Cognitive Psychology
12:97–136; summarised in Wolfe & Horowitz 2017,
https://pmc.ncbi.nlm.nih.gov/articles/PMC9879335/). A target defined by a single unique
feature (one red dot among green) produces flat search times — adding more distractors
does not slow the search, because the feature map lights up the odd one out in parallel.
A target defined by a *conjunction* of features (a red *vertical* bar among red
horizontals and green verticals) requires focused attention to bind the features
together at each location, so search time rises with the number of items. [EVIDENCE]

**What follows for the designer.** Carry emphasis on **one** strong, unique feature. The
conjunction finding has an under-appreciated design consequence: if you mark the
important element with *two* weak cues at once — say a slightly different hue *and* a
slightly different size — and the other elements each happen to share one of those cues,
the important element no longer pops. It has become a conjunction search. **One strong,
unique cue beats two shared weak ones.** [EVIDENCE — direct consequence of FIT]

**The failure mode.** The "hero" element is styled with several mild differences
(marginally bigger, a slightly different colour, a faint border), while surrounding
elements each share one of those traits. Nothing pops; the viewer has to hunt.

**How to check it.** Ask of the intended focal element: is there a single attribute on
which it is *uniquely* extreme against all its neighbours? If the uniqueness is split
across two attributes that others partly share, fix it to one.

### 2.3 The authoritative ranking of attributes by strength

**The principle.** Not all visual attributes guide attention equally. There is a
literature-wide verdict on which ones reliably do.

**Why it is true.** Wolfe & Horowitz (2017), *Five Factors that Guide Attention in
Visual Search* (Nature Human Behaviour 1:0058,
https://pmc.ncbi.nlm.nih.gov/articles/PMC9879335/; also
https://www.nature.com/articles/s41562-017-0058), grade each candidate attribute by how
confident the field is that it guides attention, on the basis of converging experiments
across many labs. This is stronger evidence than any single "top 7 attributes" listicle,
because it is a whole-literature judgement, not one study. Their tiers (Table 1): [EVIDENCE]

| Tier | Attributes | Design reading |
| --- | --- | --- |
| **Undoubted** | **Colour, Motion, Orientation, Size** (size incl. length, spatial frequency, apparent size) | Use these to carry hierarchy — reliable, cross-lab attention-getters. |
| **Probable** | Luminance onset (flicker), luminance polarity, vernier offset, stereoscopic depth/tilt, pictorial depth cues, **shape**, line termination, **closure**, curvature, topological status | Usable but weaker or ill-defined. "Shape" clearly guides but nobody can define *what about* shape. **Closure = enclosure/containment** (a box around content) — the perceptual basis for "card" borders. |
| **Possible** | Lighting direction (shading), expansion/looming, **number** (numerosity), glossiness, aspect ratio, eye-of-origin | Single-paper support. Treat as decorative, not load-bearing. |
| **Doubtful** | Novelty, letter identity, familiarity | Do not rely on. |
| **Probably NOT guiding** | Intersection, optic flow, colour *change*, 3-D volume, luminosity, material type, semantic category, **duration**, biological motion, your name, **threat** | These do not pull the eye pre-attentively even though intuition says some should. |

Important nuances this table encodes, each a design fact:

- **Motion is "undoubted."** In a *video*, motion (a build, a wipe, a highlight
  animating in) is one of your strongest attention tools — stronger than colour on a
  static slide. It is unavailable on a static slide or a printed handout, which is a
  first-class reason the narrated case differs from the deck case. [EVIDENCE]
- **Colour (hue) is undoubted, but "colour *change*" is "probably not guiding."** A
  static colour contrast pulls the eye; a colour that merely changes over time does not
  reliably do so on its own. For a build, it is the *appearance/motion* of the new
  element that guides, not the colour swap. [EVIDENCE for the tier;
  interpretation of the build case is reasoned — [ASSUMPTION]]
- **Duration is "probably not guiding."** Holding something on screen longer does not
  make the eye go to it. Narration timing matters for comprehension, but you cannot rely
  on "it's been up longer" to draw the eye. [EVIDENCE]
- **Enclosure (closure) is only "probable," weaker than size/colour.** A border around
  a card is a real but modest cue. This is evidence *against* relying on card borders
  alone to signal dominance — a border is weaker than making the card bigger or
  recolouring it. [EVIDENCE]

Colin Ware (*Information Visualization: Perception for Design*, 4th ed. 2021, Morgan
Kaufmann) organises the pre-attentive features into four groups — **form** (orientation,
length, width, size, curvature, shape, closure), **colour** (hue, intensity/luminance),
**spatial position** (2D position, stereo depth), and **motion** (flicker, motion
direction) — which lines up with the Wolfe & Horowitz verdict
(https://www.scribd.com/document/591402459/Readings-02-Pre-attentive-attributes). [EVIDENCE]

**What follows for the designer.** Spend your strongest signals on the "undoubted" four
(colour, motion, orientation, size) and treat everything below them as decoration, not
as a hierarchy carrier.

**A practical strength ordering for slides.** Wolfe & Horowitz grade *confidence that an
attribute guides at all*, not *how strongly* it guides in a design context. Combining
their tiers with Ware and common data-visualisation practice, the practical emphasis
strength ordering (strongest first) is approximately:

1. **Motion / animated reveal** — video only; the single strongest cue when available.
2. **Size** (area + type size) — undoubted; maps naturally to "importance," but is read
   non-linearly (§2.6).
3. **Hue / colour contrast** — undoubted; very strong but carries semantic and
   accessibility baggage.
4. **Luminance / value contrast** — probable; this is what survives greyscale and is the
   most accessibility-robust cue.
5. **Position / isolation (whitespace)** — spatial position is a Ware primary; the centre
   of gravity attracts fixation (Wolfe & Horowitz cite Richards & Kaufman 1969).
6. **Orientation / alignment break** — undoubted as an attribute, but rarely usable in a
   text-slide grid without looking broken.
7. **Enclosure / border / elevation (shadow)** — probable (closure), weaker; good for
   *grouping*, mediocre for *ranking*.

[CONTESTED — the relative ordering *within* the top tier (size vs hue vs luminance) is a
synthesis across Ware and Wolfe & Horowitz; the literature grades confidence-of-guidance,
not a clean strength scalar, so treat items 2–4 as roughly co-equal "strong" cues rather
than a strict order.]

### 2.4 Computational salience models (Itti & Koch)

**The principle.** The "most salient" location on a scene can be computed by combining
feature maps (colour, luminance, orientation) into a single saliency map, and this
predicts where an eye will fixate.

**Why it is true.** Koch & Ullman (1985) described a "winner-take-all" saliency map that
selects the most salient location; Itti & Koch (1998, 2000) built the canonical
computational model that combines colour, intensity (luminance) and orientation feature
maps into one saliency map and predicts fixation order (Itti, Koch & Niebur 1998, IEEE
PAMI 20(11); http://ilab.usc.edu/publications/doc/Itti_etal98pami.pdf). This is the model
behind most "attention heatmap" tools. Wolfe & Horowitz characterise it as the seminal
modern work on bottom-up salience. [EVIDENCE — but see the crucial caveat;
the primary PDF could not be fetched in the underlying research, so the characterisation
rests on Wolfe & Horowitz plus secondary citations — [ASSUMPTION] on the exact primary.]

**The crucial caveat — bottom-up salience is unreliable when the viewer has a goal.**
Wolfe & Horowitz are explicit: bottom-up salience "by itself … does only modestly well
in predicting the deployment of attention." Salience models predict fixations well *only
when the viewer has no goal*; the moment the viewer has a task — or, for us, a narration
telling them what to look for — top-down feature guidance and scene structure dominate
(https://pmc.ncbi.nlm.nih.gov/articles/PMC9879335/). [EVIDENCE]

**What follows for the designer.** A purely bottom-up "just make it salient" strategy is
unreliable for a narrated video, because the narration *is the task* and the viewer's
top-down goal overrides raw salience. In a narrated presentation the visual hierarchy
must be *slaved to what the narration is currently saying*, not fixed for the whole
slide. (This is developed in Part B; it is flagged here because it is where the mechanism
first bites.)

**The failure mode.** Designing a slide to a static "heatmap" prediction and assuming the
eye will follow — while a voiceover is simultaneously pulling attention elsewhere. The two
compete, and the viewer pays a reconciliation cost.

**How to check it.** Ask: at the moment this frame is on screen, is the most salient
thing also the thing the viewer is being *directed* to (by narration, by the task)? If
not, the salience is fighting the goal.

### 2.5 Salience is RELATIVE, not absolute — the single most important mechanical fact

This one gets its own treatment because it changes how you use every other cue.

**The principle.** An element pops out in proportion to how *different* it is from its
neighbours, and how *similar* the neighbours are to each other. Salience is a property of
the *relationship* between an element and its field, not a property of the element alone.

**Why it is true.** Wolfe & Horowitz (2017) formalise this as two factors:
**target–distractor heterogeneity** (the target pops more when it differs more from the
distractors) and **distractor–distractor homogeneity** (the target pops more when the
distractors are more similar to *each other*)
(https://pmc.ncbi.nlm.nih.gov/articles/PMC9879335/). The mechanism is the pre-attentive
feature map from §2.2: "pop-out" is the feature map detecting a *local difference*. If
everything carries the same feature value, there is no difference to detect, so nothing
pops — regardless of how heavily any single element is styled. [EVIDENCE]

**What follows for the designer — and it is the consequence the whole craft turns on:**
**you make one thing loud by making the others quiet, never by piling cues on the hero.**
Dominance comes from *contrast against a quiet field*, not from stacking cues on the
important element. Practically: to make one card dominant, first make the *other* cards
plainer. The supporting elements must be *homogeneous with each other* so that the
primary stays unique against them (the distractor–distractor-homogeneity rule). [EVIDENCE
— design consequence of the two factors above]

**The failure mode.** The author tries to make the hero dominant by adding more and more
emphasis to it — bigger, bolder, a colour, a glow, a shadow — while leaving the other
elements richly styled too. The field is noisy, so the hero has nothing quiet to stand
against, and it does not pop no matter how loud it gets. This is the mechanism behind the
"everything-emphasised → nothing-emphasised" failure (Chapter 4).

**How to check it.** Before adding a cue to the hero, ask instead: *can I remove a cue
from everything else?* If the supporting elements are not visibly plainer and visibly
alike, the hero cannot be unambiguously dominant.

### 2.6 Cleveland & McGill — the ranking of perceptual tasks, and why area is a weak channel

**The principle.** People decode a quantity from some visual channels far more accurately
than from others. Position and length are read accurately; area is read poorly; colour is
read worst of all for quantity.

**Why it is true.** Cleveland & McGill (1984), *Graphical Perception* (JASA
79:531–554), ranked the elementary perceptual tasks by how accurately people decode a
quantity from each, and Heer & Bostock (2010, CHI) replicated and extended it
(https://info3312.infosci.cornell.edu/ae/graphical-perception-A.html). From most to least
accurate:

1. Position along a common scale (most accurate)
2. Position on non-aligned scales
3. Length
4. Angle / slope
5. **Area**
6. Volume
7. Colour saturation / luminance
8. Colour hue (least accurate — good for categories, not quantity)

(Ranking summaries: https://guides.lib.berkeley.edu/data-visualization/type and
https://arxiv.org/html/2212.10533v1.) The mechanism is perceptual: judging length is a
near-linear 1D comparison the visual system does well, whereas judging area requires
integrating two dimensions, which the system compresses. Stevens' power law for area has
an exponent below 1 — people *under*-estimate area ratios. A classic finding: a circle
of double the area is judged only about **1.5×** bigger. Rectangular area is decoded more
accurately than circular, but still well below length and position. [EVIDENCE]

**What follows for the designer.** Area is a *weak* channel for encoding "how much more
important." A card twice the area does **not** reliably read as twice as important — it
reads as "somewhat more important," and the exact ratio is lost. Area encodes *ordinal*
dominance ("this is the big one") reliably, but not *ratio* weight. The consequence,
developed in Chapter 4: to make dominance **unambiguous** rather than ambiguous, the area
step must be *large* — a subtle 1.3–1.5× area difference reads as "roughly equal, slightly
different," so you need a step on the order of **≥2×**, ideally reinforced by a second
channel (a bigger headline, isolation). [EVIDENCE for the ranking and area
underestimation; the specific ≥2× threshold is a reasoned design heuristic — [ASSUMPTION]]

Note the distinction that resolves an apparent conflict: use position/length to *encode a
number precisely* (a chart), but use area + a second cue to *signal which element matters*
(a layout). These are different jobs; area is fine for the second and poor for the first.

**The failure mode.** A "dominant" card only 1.4× the area of its neighbours: the author
believes it is clearly the biggest, but viewers read the set as roughly equal and cannot
tell which one matters.

**How to check it.** Measure the area ratio of the intended primary to the largest
secondary. Below ~1.2× it reads as equal; 1.4× is ambiguous; ≥2× is unambiguous.

### 2.7 Weber's law and the just-noticeable-difference — why size steps must be large enough

**The principle.** Whether two sizes read as *deliberately different* depends on the
*ratio* between them, not the absolute difference. Below a threshold ratio, two sizes look
like "the same size, set sloppily."

**Why it is true.** Weber's law (Weber–Fechner, textbook psychophysics; a readable
primary-adjacent treatment is Ware, *Information Visualization*, on magnitude estimation):
the just-noticeable-difference (JND) in a stimulus is a roughly constant *fraction* of the
stimulus, not a constant absolute amount. For visual length/size the Weber fraction is a
few percent under ideal side-by-side conditions — but for *un-aligned, non-adjacent*
elements scattered across a busy slide, the effective JND is far larger, because the
comparison is harder. [EVIDENCE]

**What follows for the designer.** Two size levels that differ by less than roughly
**15–20%** will not read as deliberately different across a slide — the viewer sees them as
the same size, badly set. This is *why* modular type scales exist: they guarantee each step
clears the JND. Adjacent hierarchy levels should differ by at least **~1.2×** to be
reliably distinguishable. [EVIDENCE for Weber's law; the ~15–20% / 1.2×
slide-specific figure is a reasoned heuristic — [ASSUMPTION]]

**The failure mode.** A "heading" set at 20px above "body" at 18px: the author intends a
hierarchy, but the 1.11× step is below JND, so it reads as one flat block with an
accidental size wobble.

**How to check it.** For any two levels meant to look different, compute the size ratio; if
it is below ~1.2×, they will not read as distinct — increase the step or merge the levels.

### 2.8 Which channels survive degradation

**The principle.** A presentation is rarely seen in the pristine condition it was designed
in. It may be printed or projected in greyscale, re-rendered portrait, compressed by a
video codec, or paused on a still frame. Only some cues survive each of these; the
hierarchy must ride on the ones that survive *all* of them.

**Why it is true.** Each degradation removes a channel: greyscale removes hue (colour
collapses to a single luminance value); portrait reflow changes area ratios and horizontal
space; video compression eats fine contrast and thin detail; a held still frame removes
motion (there is no animation in a paused frame). Size and luminance are the two cues that
survive *every* one of these — size is geometric and orientation-robust, and luminance
contrast is what greyscale, compression and a still frame all preserve. Colour dies in
greyscale and fails for the ~8% of men who are colour-blind; motion dies in a still frame
and in a printed handout. [EVIDENCE — the greyscale-survival and colour-blindness
facts are established; the cross-medium survival summary is a synthesis over the tiers in
§2.3, marked [PRACTICE]]

**What follows for the designer.** **Size and luminance are the only cross-medium-safe
carriers of hierarchy.** They must carry the weight. Colour and motion are powerful
*additions* but must never be the *only* carrier, because a design that relies on colour
alone vanishes in greyscale and one that relies on motion alone vanishes in a still frame
or a handout. If a presentation must ship as a landscape deck, a portrait deck, and a
video, this is a hard constraint, not a preference. [PRACTICE]

**The failure mode.** A slide whose entire hierarchy is "the important card is the blue
one." Printed in greyscale, or seen by a colour-blind viewer, every card is the same grey
and the hierarchy is gone. Or: a video whose emphasis is entirely "the important thing is
the one that animated in" — paused on a still frame, or exported as a static deck page,
nothing stands out.

**How to check it.** Convert the slide to greyscale and squint. If the focal point still
wins, the hierarchy survives colour loss. Then check a still frame (no motion) and a
portrait re-flow. If the focus survives all three, it rides on size and luminance; if it
disappears in any, it was leaning on colour or motion alone.

---

## Chapter 3 — The cognitive substrate: what determines whether a viewer can keep up

Chapter 2 covered how the eye parses a layout. This chapter covers what happens next: once
the eye has landed, can the viewer *hold and integrate* what they take in, fast enough to
keep up with the pacing? Perception gets information in; cognition determines whether it
sticks and whether the viewer can follow along. The limits here are the reason "just add
more" fails.

### 3.1 Working-memory limits — the real numbers

**The principle.** A viewer can hold only a few distinct items in mind at once. Exceed
that and they cannot integrate the slide's parts into a whole while new material keeps
arriving.

**Why it is true — and why the famous number is misapplied.** Miller (1956), *The Magical
Number Seven, Plus or Minus Two* (Psychological Review, https://doi.org/10.1037/h0043158),
reported that people can repeat back about seven randomly ordered items. But Miller
explicitly treated the number as "a rough estimate and a rhetorical device," half-joked
that the integer was "persecuting" him, and his *central* point was **chunking**: capacity
is measured in chunks, and expertise lets you pack more into each chunk. He never said
interfaces or slides should cap at seven of anything. Design blogs that cite "7±2" as a
slide-item limit are misusing the source. [EVIDENCE — Miller; the misuse is
documented in Cowan's "The Legend of the Magical Number Seven,"
https://www.researchgate.net/publication/255060875]

The number that survives once the inflating tricks (rehearsal, grouping) are stripped out
is lower. Cowan (2001, *The Magical Number 4*, Behavioral and Brain Sciences,
https://doi.org/10.1017/s0140525x01003922; and *The Magical Mystery Four*, 2010, Current
Directions in Psychological Science, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2864034/)
shows that when chunking and verbal rehearsal are prevented, the central capacity limit is
**3 to 5 meaningful items in young adults, ~4 on average.** It is lower for longer or more
complex chunks: adults recall only 3–4 longer verbal chunks such as short sentences
(Gilchrist, Cowan & Naveh-Benjamin 2008). Cowan's own worked example is essay
comprehension: holding "the major premise, the point from the previous paragraph, and a
fact and an opinion from the current paragraph" — about four ideas — before they fuse into
one chunk or must be re-read. [EVIDENCE]

**Chunking is the mitigation.** Grouping related items into a labelled unit lets one
"slot" hold more. A slide with 3 groups of 3 — a titled section containing three cards —
is easier than 9 loose cards, because the title is the chunk handle. Element interactivity
(how many elements must be held and related *at once*, from Chapter 3.2) is what actually
drives the load; chunking reduces the count of things that must be juggled simultaneously.
[EVIDENCE]

**What follows for the designer.** A viewer parsing a slide for the first time, with no
chance to rehearse — especially in a system-paced video where they cannot pause — is close
to Cowan's stripped-down conditions. Distinct, unrelated ideas on one slide should
therefore be **capped at about 4.** Beyond that the viewer cannot hold them while
integrating. A fifth item is only safe when one item demonstrably *chunks* the others (for
example a hub that the other four hang off, turning "5 things" into "1 + 4"). [EVIDENCE
for the ~4 limit; the "cap at 4, hub exception" design rule is a reasoned application —
[PRACTICE]]

**The failure mode.** Five, six, seven independent cards of equal standing. The viewer
reads the first few, and by the time they reach the last, the first have decayed; they
never hold the whole set at once, so they never integrate the slide's point.

**How to check it.** Count the *distinct, unrelated* ideas on the slide (not the visual
elements — grouped elements count as one). If it is more than four, either split the slide
or introduce a chunking structure (a title, a hub) that reduces the simultaneous count.

### 3.2 Sweller's Cognitive Load Theory — intrinsic, extraneous, germane

**The principle.** Working memory is a single limited budget shared by three kinds of load.
Only one of them is under the designer's control, and the designer's job is to drive it to
zero.

**Why it is true.** Cognitive Load Theory (Sweller, Ayres & Kalyuga, *Cognitive Load
Theory*, 2011; Sweller 2019/2020, "Cognitive Architecture and Instructional Design: 20
Years Later," Educational Psychology Review,
https://www.researchgate.net/publication/344435215) names three loads that share one
limited working memory:

- **Intrinsic load** — the inherent difficulty of the material *for this learner*, driven
  by **element interactivity** (how many elements must be held and related at once).
  Learning "the French word for cat" is low interactivity; learning grammar, where every
  word constrains every other, is high.
- **Extraneous load** — load imposed by the *presentation*, not the content. This is what
  design controls.
- **Germane load** — the effort that actually builds understanding. In the current
  formulation this is the working-memory resource *devoted to* the intrinsic load, not a
  separate pool to be pumped up.

Since total load cannot exceed capacity, and you cannot reduce intrinsic load without
changing the content or the audience's expertise, **design's job is to drive extraneous
load to zero so the whole budget goes to the material.** [EVIDENCE]

**What follows for the designer.** Treat every design choice that is not carrying
information as extraneous load to be removed. Decoration, ornament, redundant text, and
anything the eye must process but the message does not need is a *cost* paid out of the
same budget as comprehension. This is the mechanism behind Mayer's coherence principle
(§3.5).

**The failure mode.** A slide loaded with decorative imagery, background texture,
ornamental icons and restated prose. The content is simple, but the viewer's budget is
consumed processing clutter, so the simple content still does not land.

**How to check it.** For each element ask: does this carry information the message needs?
If not, it is extraneous load — remove it.

### 3.3 The split-attention effect

**The principle.** When two sources *must* be combined to be understood — a diagram and
its explanatory text — separating them in space or time forces the viewer to hold one
while hunting for the other, wasting capacity.

**Why it is true.** Ayres & Sweller's split-attention work (within CLT) reports large
effects for integrated over separated formats. The mechanism is direct: to understand, the
viewer must integrate the two sources, and integration requires holding both in working
memory at once. If they are physically apart, the viewer spends capacity on the visual
search and on holding source A while locating source B — capacity that is then unavailable
for understanding. This is the same mechanism as Mayer's spatial contiguity (§3.5), viewed
from the load side. [EVIDENCE]

**What follows for the designer.** Never render a diagram and its explanation as two
separate blocks the eye must shuttle between. Put the text *into* the diagram at the point
it refers to; put a label *on* the thing it names, not in a legend elsewhere. Integrated
labels beat separated legends.

**The failure mode.** A diagram with a numbered legend in the corner: the viewer reads
"③", holds it, searches the diagram for the ③, integrates, then goes back for ④ — a shuttle
that consumes the whole budget on bookkeeping.

**How to check it.** For any label or explanatory text, ask: is it adjacent to the thing it
describes, or does the eye have to travel to connect them? If it has to travel, integrate
them.

### 3.4 The expertise reversal effect — the uncomfortable implication

**The principle.** The correct density of a slide *depends on the audience's expertise.*
Support that helps novices — extra explanation, scaffolding, redundant on-screen text —
becomes useless or actively *harmful* for experts.

**Why it is true.** Kalyuga, Ayres, Chandler & Sweller (2003), *The Expertise Reversal
Effect* (Educational Psychologist,
https://www.researchgate.net/publication/48829036_The_Expertise_Reversal_Effect): an
expert already has a schema for the material, so redundant support conflicts with that
schema and itself becomes extraneous load to process and suppress. Later work argues this
is a special case of the element-interactivity effect — for an expert, related elements are
already chunked into a single schema, so the effective interactivity (and intrinsic load)
is lower, leaving no spare need for scaffolding
(https://repository.lboro.ac.uk/articles/journal_contribution/The_expertise_reversal_effect_is_a_variant_of_the_more_general_element_interactivity_effect/12052695).
[EVIDENCE]

**What follows for the designer — and it is uncomfortable.** **There is no single correct
information density.** A slide for a board of experts should be sparser and faster than the
same content for newcomers; scaffolding that helps one audience insults and slows the
other. Density must be treated as a function of *declared audience expertise*, not a fixed
property of a layout. The honest position is that "how much should go on a slide?" has no
universal answer — it has an audience-dependent answer. [EVIDENCE for the effect; the
"density is a function of audience" design consequence is a reasoned application — [PRACTICE]]

**The failure mode.** A tutorial deck built for novices — worked examples, full
explanations, repeated on-screen text — shown to a room of experts, who are bored and
slowed because they must wade through support they do not need. Or the reverse: an
expert-density deck shown to newcomers who cannot fill the gaps.

**How to check it.** Ask who the audience is and what schema they already have. If they are
experts, cut scaffolding and redundancy; if novices, add worked steps and pre-teaching
(§3.5, pre-training). There is no way to check density without answering "for whom?"

### 3.5 Mayer's Cognitive Theory of Multimedia Learning

**The principle.** CTML is the framework that turns the perceptual and load facts above
into concrete presentation principles, each with measured effect sizes from a corpus of
more than 200 experiments.

**Why it is true — the three assumptions.** CTML (Mayer 2024, open-access, Educational
Psychology Review, https://link.springer.com/article/10.1007/s10648-023-09842-1) rests on:

- **Dual channels** — humans process auditory/verbal and visual/pictorial material in
  separate, interacting channels (Paivio's dual coding; Baddeley's phonological loop +
  visuospatial sketchpad).
- **Limited capacity** — each channel holds only a few elements at once (§3.1).
- **Active processing** — meaningful learning requires *selecting* relevant material,
  *organising* it into a coherent model, and *integrating* it with prior knowledge (the
  SOI model).

From these come three design goals: **reduce extraneous** processing, **manage essential**
processing, and **foster generative** processing. [EVIDENCE]

**How to read the effect sizes.** Cohen's *d* / Hedges *g*: 0.2 = small, 0.5 = medium, 0.8
= large (Cohen 1988). Mayer reports a *median* effect across a set of replications plus a
hit rate ("supported in N of M tests"); the hit rate matters as much as the median because
it shows the effect is robust, not a one-off. The primary source for the
extraneous-processing set is the *Cambridge Handbook of Multimedia Learning* ch. 12
(https://www.cambridge.org/core/books/cambridge-handbook-of-multimedia-learning/principles-for-reducing-extraneous-processing-in-multimedia-learning-coherence-signaling-redundancy-spatial-contiguity-and-temporal-contiguity-principles/C98AB3A6CE760DD63C048936EA0B3B44);
a practitioner synthesis with an evidence-strength table is at
https://www.devlinpeck.com/content/mayers-principles-of-multimedia-learning.

A scope caveat runs through all of these: the literature is overwhelmingly about
*learning* (retention and transfer test scores). A marketing sizzle-reel or a keynote is
not a lesson, so the effect sizes are an *upper bound* on how much a principle should
constrain design, not a hard rule, when the presentation's job is persuasion or delight
rather than instruction. [EVIDENCE for the effects; the "upper bound for non-instructional
use" caveat is the research's own framing — [PRACTICE]]

The principles that matter for presentation design:

**Coherence** — people learn more deeply when extraneous words, pictures, sounds and
decoration are *excluded*. Supported 10/11 tests, **median d = 1.32** in the Handbook; an
earlier count reported 23/23 at **d = 0.86** (Mayer 2014 consolidated to the higher
figure). This is the largest and most reliable effect in the set. "Seductive details" —
interesting but irrelevant material — actively *depress* learning. [EVIDENCE]
[CONTESTED — the exact figure differs between Mayer editions: 10/11 at d=1.32 (Handbook)
vs 23/23 at d=0.86 (earlier); the direction is identical and load-bearing, so no design
decision hinges on which figure is right.] *Serves following-along:* every non-load-bearing
element has a measured cost; decoration is not neutral, it competes for the same budget as
the message.

**Signalling (cueing)** — adding cues that highlight the organisation or location of
essential material (headings, arrows, a colour-highlight on the one word that matters,
vocal emphasis) improves learning. Supported 3/3 in the Handbook; later meta-analyses
(e.g. Schneider et al. 2018) put it around **d ≈ 0.4–0.6.** It works by guiding *selecting*
and *organising* without adding content. [EVIDENCE] *Serves following-along:* this is the
direct evidence that **weight is a signal** — one element should be visually dominant, and
it should be the one the narration is on. It is the empirical backing for the whole spine
of this document.

**Redundancy** — people learn more deeply from graphics + narration than from graphics +
narration + *on-screen text that duplicates the narration verbatim.* Supported 10/10,
**median d = 0.69.** Treated in detail in §3.6 because it is widely over-applied.
[EVIDENCE]

**Spatial contiguity** — place corresponding words and pictures *near* each other, not far
apart. Supported 8/8, **median d = 1.11** in the Handbook; Ginns (2006) meta-analysis puts
it around **d ≈ 0.89** (https://inspire.acu.edu.au/articles/contiguity-present-words-and-pictures-in-the-same-place-and-at-the-same-time).
Large and reliable. A label six inches from the thing it labels forces a visual search that
consumes capacity — this is the split-attention effect (§3.3) in space. [EVIDENCE]
*Serves following-along:* a card's label belongs on or adjacent to its visual, never in a
separate legend block.

**Temporal contiguity** — present corresponding narration and animation *simultaneously*,
not in sequence. One of the strongest effects (the Handbook reports it among the largest;
Ginns 2006 combined contiguity d = 0.89). A diagram that animates in while the voice
describes something else, or a build that lags the narration, breaks the pairing.
[EVIDENCE] *Serves following-along:* in video a card must appear *when* the narration
reaches it — not before (the viewer reads ahead) and not after (the viewer waits confused).

**Segmenting** — present a continuous lesson in learner-paced chunks rather than one
unbroken unit. Supported 10/10, **median d = 0.79** (Cambridge Handbook ch. 13,
https://resolve.cambridge.org/core/product/identifier/9781139547369%23C03520-13-1/type/BOOK_PART).
Rey et al. (2019) meta-analysis of the segmenting effect
(https://www.researchgate.net/publication/330143605_A_Meta-analysis_of_the_Segmenting_Effect)
confirms a positive but smaller pooled effect and finds the benefit **shrinks or vanishes
when segments are system-paced rather than learner-paced** — directly relevant to video,
where the viewer cannot pause (§3.7). [EVIDENCE] *Serves following-along:* one slide = one
idea; a slide carrying three sub-arguments should be three slides, or one slide whose
builds are paced by the narration.

**Pre-training** — people learn more deeply when the names and characteristics of the key
concepts are known *before* the main lesson. Supported 13/16, **median d ≈ 0.75.**
Front-loading vocabulary frees working memory during the complex part. [EVIDENCE]
*Serves following-along:* introduce a term on its own before the slide that puts it to work;
a "define the terms first" opener is legitimate pre-training (and is distinct from a bullet
agenda).

**Modality** — present words as *narration* rather than *on-screen text* when they
accompany a graphic, so the verbal load moves off the overloaded visual channel onto the
free auditory channel. One of the most-replicated effects; Mayer reports it as large (**d ≈
1.0** in the strongest sets), with well-known boundary conditions: it weakens or reverses
for very long or technical text, for non-native speakers, for unfamiliar terms, and under
system-paced presentation (§3.6). This is *the* theoretical justification for narrated video
over text-heavy slides. [EVIDENCE] *Serves following-along:* in a narrated deck, push
explanation into the voice and keep the slide to labels and visuals; in a silent deck the
slide must carry the words because there is no auditory channel — so the same content must
reflow differently between the two modes.

**Multimedia principle** — the foundation: people learn better from words + pictures than
from words alone. **Median d ≈ 1.35** in the strongest sets; robust. [EVIDENCE]
*Serves following-along:* prefer a diagram/visual paired with a label over a text-only
card, *when the content is depictable* — a forced stock image violates coherence.

**What follows for the designer.** These are not independent style tips; they are all
consequences of the dual-channel, limited-capacity, active-processing architecture. Almost
every one reduces to the same instruction: put the viewer's limited capacity on the
message and nothing else, and make the visual point at what the narration is saying right
now.

**The failure mode.** Violating them looks like: a decorated slide (coherence), no clear
focal point (signalling), the script pasted on as body text (redundancy), a legend in the
corner (spatial contiguity), builds out of sync with the voice (temporal contiguity), one
slide crammed with three arguments (segmenting), words on screen that the viewer must read
while a voice says other words (modality).

**How to check it.** Walk the list against the slide: is anything decorative? Is there one
dominant element? Does on-screen text duplicate the script? Are labels attached to their
referents? In video, do reveals match the narration beat?

### 3.6 The redundancy principle in detail — three cases most advice collapses

Redundancy deserves its own treatment because the distinction between three cases is
load-bearing, and most popular advice collapses them into one wrong rule ("never put text
on screen with narration").

**The mechanism.** Reading printed words and processing heard words at the same time both
recruit the phonological loop (Baddeley): you cannot silently "sound out" printed words and
process spoken words simultaneously without interference. When the printed and spoken words
are the same but *unsynchronised or self-paced*, the reader's pace fights the narrator's
pace; when they are *different*, the two streams interfere directly. Either way,
comprehension of both drops. [EVIDENCE]

The three cases — and they are genuinely different:

1. **Identical, synchronised text (captions/subtitles).** Printed words equal spoken words,
   presented in sync. This is **not** the harmful redundancy Mayer warns about. Verbatim
   *synchronised* captions help accessibility, non-native speakers, and noisy or muted
   viewing, and do not reliably hurt native learners. Mayer's caution is specifically about
   *unsynchronised or self-paced* duplicate text placed next to a graphic. Captions should
   be available and are best treated as a separate track from the slide's body content.
   [EVIDENCE — captions ≠ the redundancy effect]

2. **Summarised text (keywords).** A few printed keywords while the voice gives the full
   sentence. This is the *recommended* pattern for narrated video: the keyword anchors
   *organising* (it acts as a signal/heading) without racing the voice or duplicating it.
   Moreno & Mayer (2002b), *Verbal redundancy in multimedia learning: when reading helps
   listening* (https://doi.org/10.1037/0022-0663.94.1.156), found redundant text *helps*
   when it is **short**, placed next to the graphic, and there is **no concurrent
   animation** competing for the eyes. [EVIDENCE]

3. **Different text (new prose).** Printed prose the voice is *not* saying, or is
   contradicting. This is maximally harmful — the two streams interfere directly. Forbidden
   under narration. [EVIDENCE]

**The boundary conditions / the debate.** [CONTESTED] The redundancy principle has real
exceptions the literature argues about:

- **Reverse redundancy for non-native speakers / foreign-language material:** synchronised
  redundant on-screen text *reduces* load and *helps* when the language is not the viewer's
  first, or the terms are unfamiliar ("Redundancy effect in multimedia learning: a closer
  look," https://www.researchgate.net/publication/228947987).
- **No competing visuals + short segments:** redundancy hurts most when the eyes are needed
  for an animation; with a static image and brief text the cost falls.
- **System-paced vs self-paced:** the harm is worse when the viewer cannot control pace (a
  video), because they cannot resolve the race between reading and listening.

**What follows for the designer.** The on-screen text budget must depend on both *mode* and
*audience.* In a silent deck the slide must carry the words (no auditory channel). In a
narrated video for a native/expert audience, use keywords only and push prose to the voice.
For a non-native or highly technical audience, allow *synchronised* key terms/short phrases
on screen (reverse redundancy) — but still not full paragraphs, and kept beside the visual.
And always allow a separate synchronised caption track. [EVIDENCE for the cases; the
"budget by mode and audience" design rule is a reasoned application — [PRACTICE]]

**The failure mode.** The most common violation in practice: the narration script pasted
onto the slide as body text, the voice reading roughly-but-not-exactly the same words a beat
behind. The viewer reads ahead, finishes, and either waits (bored) or re-reads while the
voice lags — comprehension of both drops.

**How to check it.** Compare on-screen text to the narration segment. If they are identical
and synchronised → captions, safe. If the on-screen text is a short keyword summary → good.
If it is a full sentence differing from the script → remove it or move it to the voice.

### 3.7 Reading speed versus speech rate — the crux for narrated slides

**The principle.** Silent reading is materially faster than listening. That mismatch is
exactly why verbatim on-screen text under narration causes trouble.

**Why it is true — the numbers.** Adults read English non-fiction silently at **~238 wpm**
(fiction ~260 wpm), per Brysbaert (2019), a meta-analysis of 190 studies / 18,573
participants (Journal of Memory and Language,
https://gwern.net/doc/psychology/linguistics/2019-brysbaert.pdf); reading *aloud* is ~183
wpm. Comfortable narration is **~150–160 wpm** (audiobook norm); conversational speech is
~130–150 wpm. So silent reading (~238 wpm) outpaces listening (~150 wpm) substantially.
[EVIDENCE]

**What follows for the designer.** A viewer *can* read a short slide faster than the
narrator can speak it. So if the slide shows the full text the narrator is speaking, the
viewer races ahead, reaches the end, and then either waits or re-reads — desynchronised from
the voice. This is the quantitative core of the redundancy problem (§3.6): the two channels
run at different speeds, so verbatim duplication cannot stay in step.

**The failure mode.** Recognisable as the viewer visibly "reading ahead" of a narrated
deck, then disengaging while the voice catches up.

**How to check it.** Estimate on-screen reading time (word count ÷ ~238 wpm × 60) against
the narration duration for that beat. If reading time is much shorter than narration, and
the text duplicates the script, the viewer will race ahead — cut the on-screen text to
keywords.

### 3.8 Attention phenomena — change blindness, attentional blink, attention residue

These three phenomena govern what happens when the *scene changes* — exactly the situation
in a paced presentation.

**Change blindness.**
*The principle:* a large change to a scene goes unnoticed if it coincides with a disruption
— a cut, a flash, a saccade.
*Why it is true:* Rensink, O'Regan & Clark (1997), *To See or Not to See* (Psychological
Science); Simons & Levin (1997). The visual system does not store a pixel-perfect model of
the scene; it re-derives the gist after each disruption, and a change hidden inside the
disruption leaves no signal to detect. [EVIDENCE]
*What follows:* a change introduced *during* a slide transition will very likely be missed.
A change must be marked by motion or contrast *within a stable frame*, not hidden inside a
cut.
*Failure mode:* a new element appears on the same frame as the transition to the slide, and
viewers simply never notice it arrived.
*Check:* never introduce a new element on the same frame as a transition; reveal it as a
distinct, marked change on a held frame.

**Inattentional blindness.**
*The principle:* attention is required to see; an unattended object is not perceived even
when looked at.
*Why it is true:* Simons & Chabris (1999), the "invisible gorilla" (Perception,
https://doi.org/10.1068/p281059) — observers counting passes miss a person in a gorilla
suit walking through the scene. Perception is not automatic; it needs attention directed to
the object. [EVIDENCE]
*What follows:* the viewer processes only what attention was directed to. If everything is
equally loud, the important thing is as likely to be missed as anything else — this is the
flip side of signalling: weight *is* the attention director.
*Failure mode:* the key element is present and even centrally placed, but nothing directs
attention to it among equally-loud competitors, and viewers report never seeing it.
*Check:* one and only one focal point per moment; secondary content must be visibly
subordinate.

**Attentional blink.**
*The principle:* after detecting one target, there is a ~200–500 ms window in which a second
target is likely to be missed.
*Why it is true:* Raymond, Shapiro & Arnell (1992), J. Exp. Psychol. HPP. Processing the
first target briefly occupies the attentional bottleneck, so a second target arriving inside
the window is not consolidated. [EVIDENCE]
*What follows:* two important reveals fired within half a second of each other — the second
is likely lost. Builds must be spaced.
*Failure mode:* two cards animate in almost together; viewers register the first and miss
the second.
*Check:* space successive reveals by more than ~0.5 s (in practice much more, paced to the
narration).

**Attention residue.**
*The principle:* after switching tasks, part of attention stays on the previous task,
degrading performance on the new one.
*Why it is true:* Leroy (2009), *Why Is It So Hard to Do My Work?* (Organizational Behavior
and Human Decision Processes, https://www.researchgate.net/publication/46489122). [EVIDENCE]
*What follows:* every time a slide forces the viewer to switch between reading text and
listening to *different* words, residue from each degrades the other — reinforcing the
redundancy/modality argument.
*Failure mode:* a deck that constantly makes the viewer alternate between reading on-screen
prose and listening to non-matching narration; both are half-absorbed.
*Check:* do not make the viewer alternate between reading and listening to non-matching
content.

*A caution on a widely-cited number.* [MYTH] The "23 minutes 15 seconds to refocus after an
interruption" figure is **Gloria Mark's** interruption research (UC Irvine, *The Cost of
Interrupted Work*, 2008, https://www.ics.uci.edu/~gmark/chi08-mark.pdf), routinely and
wrongly attributed to Leroy. It concerns *workplace task interruptions* and does not
transfer literally to a viewer's recovery within a presentation. Cite it only for the
general point that switching is costly, and flag the misattribution. [ASSUMPTION — the exact
within-presentation recovery cost is not well quantified in the underlying research.]

### 3.9 Progressive disclosure and segmenting — including the system-paced video case

**The principle.** Revealing a slide's content incrementally, in step with the pacing, keeps
attention on the current beat and enforces one-idea-at-a-time; showing everything at once
lets the viewer race ahead and spreads attention across everything.

**Why it is true.** The evidence is the segmenting principle (§3.5, median d = 0.79) plus
the self-paced/system-paced distinction from Rey et al. (2019). Showing a dense slide all at
once invites reading ahead (§3.7) and spreads attention (inattentional blindness, §3.8);
revealing incrementally holds attention on the current segment. [EVIDENCE]

**The system-paced video case — where it bites hardest.** The segmenting benefit is
strongest when the *learner* controls the pace. In a **video the viewer cannot pause**
(system-paced), so the pacing burden falls entirely on the author: reveals must match the
narration, and each segment must be short enough to process before the next arrives.
Over-long system-paced segments lose the segmenting benefit. And builds that lag or lead the
narration violate temporal contiguity — a card appearing before the voice reaches it invites
reading ahead; a card appearing after invites a confused pause. [EVIDENCE]

**What follows for the designer.** In narrated video, reveal each card in sync with the
narration segment that introduces it — one card per beat, appearing when the voice reaches
it, spaced more than ~0.5 s apart (attentional blink). In a silent deck there is no
narration to sync to and no forced pacing, so a static whole-slide reveal is fine (the reader
self-paces); builds there are optional polish, not a cognitive requirement. [EVIDENCE for the
mechanisms; the specific per-mode rule is a reasoned application — [PRACTICE]]

**The failure mode.** A narrated video that dumps a full multi-part slide at once: the viewer
reads all of it in a few seconds (faster than the voice), then disengages, and the careful
narration sequence lands on a viewer who has already moved on.

**How to check it.** In video, is there a per-card binding to the narration segment that
introduces it, with reveals spaced > ~0.5 s? In a deck, does the final static state stand on
its own (since the reader never saw a build)?

---

## Chapter 4 — Information weight: the central idea

This is the spine of the whole document, so it gets the most space and the most care.
Everything in Chapters 1–3 was groundwork; this chapter assembles it into a single working
idea — **information weight must equal layout weight** — and builds that idea from first
principles rather than asserting it. By the end you should be able to derive the weighting
rules yourself, and know exactly why each number is what it is.

### 4.1 Premise: content is never of equal importance, and importance belongs to the argument

**The principle.** The parts of a slide are not equally important, and importance is a
property of the *argument the slide is making*, not of the *text* that expresses it.

**Why it is true.** A slide exists to make a point. A point has a structure: there is a
claim, there is the evidence or detail that supports it, and there is context that situates
it. Those roles are not interchangeable — the claim is what the viewer must leave with; the
context is what they can forget. Importance is therefore assigned by the *argument*: the
element that carries the claim is most important *because of its role in the argument*, not
because of any surface property. This is why two slides with identical text can have opposite
hierarchies depending on what each is arguing. [PRACTICE — this is the framing the
narrative-craft and weighting research adopt; it is a conceptual premise rather than an
empirical finding.]

**What follows for the designer.** The designer must first decide *what the slide is
arguing* and *which element carries that argument*, and only then decide how to lay it out.
Importance is an editorial judgement about the argument, made before any styling. A tool can
enforce that a most-important element *exists and is unique*, but *which* element deserves to
be most important is an authorial decision about the argument.

**The failure mode.** Laying out a slide by "what fits nicely" or "what there is most of,"
without first deciding what it argues — producing an arrangement that emphasises whatever
happened to be longest or most colourful rather than what matters.

**How to check it.** Before styling, state the slide's claim in one sentence, then name the
single element that carries it. If you cannot, the slide has no argument yet — fix that
first.

### 4.2 A layout unavoidably encodes *some* hierarchy — so hierarchy is not optional

**The principle.** Any arrangement of elements on a bounded surface encodes a hierarchy,
whether or not the author intended one. There is no neutral arrangement.

**Why it is true.** Size, position, and enclosure are *always present* — every element has
some size, sits in some position, and is either enclosed or not. From Chapter 2 we know these
are attention-guiding attributes: the biggest thing, the thing at the strong position, the
enclosed thing all pull the eye pre-attentively (§2.2–2.3), and the ~100ms gist parse reads
this arrangement *before* any word (§2.1). So the moment elements are placed, the viewer's
visual system extracts a ranking from them — the arrangement *is* a hierarchy to the eye,
regardless of intent. You cannot switch this off; you can only choose whether the hierarchy
the eye extracts is the one you meant. [EVIDENCE — follows directly from pre-attentive
processing (§2.2) and scene gist (§2.1).]

**What follows for the designer — the pivotal consequence.** **Hierarchy is not optional;
only deliberateness is.** "I didn't impose a hierarchy" is impossible — the layout imposed
one for you, and it will be accidental. The choice is between a *deliberate* hierarchy that
matches the argument and an *accidental* one that matches whatever geometry fell out. The
designer's job is to make the deliberate hierarchy match the argument's importance ranking.

**The failure mode.** An "even, neutral" grid of equal cards: the author believes they have
declined to rank the items, but the eye still ranks them — by reading order, by tiny
accidental size differences, by whichever one happens to sit top-left. The hierarchy exists;
it is just arbitrary and probably wrong.

**How to check it.** Squint at the slide (§4.9). Whatever stands out *is* the hierarchy the
eye sees. If that is not the element carrying the argument, the accidental hierarchy is
lying and must be corrected.

### 4.3 The cost of a lying hierarchy

**The principle.** When the visually dominant element is not the most important element, the
viewer pays a measurable cost: they parse the false hierarchy, form the wrong expectation,
discover the mismatch, and must re-read.

**Why it is true.** The mechanism chains together facts already established. The viewer
extracts the gist — including "which is biggest / where to look" — in ~100 ms (§2.1, Greene &
Oliva). That glance forms an expectation about what matters. If the biggest, brightest, first
thing turns out *not* to carry the point, the expectation is violated, and the viewer must
make a second, deliberate, serial pass to find the real point — a slower, attention-costly
process instead of the free parallel gist parse. The cost is paid out of the limited
working-memory budget (§3.1–3.2), so it is not just time lost; it is capacity taken away from
understanding the content. Signalling evidence (§3.5, d ≈ 0.4–0.6) shows the converse — a
correct cue *improves* comprehension — so a lying cue forgoes that gain and adds a
reconciliation cost on top. [EVIDENCE — assembled from scene gist (§2.1), working-memory
limits (§3.1), and signalling (§3.5); the specific "re-read" chain is the research's reasoned
synthesis.]

**What follows for the designer.** Aligning layout weight to information weight is not a
matter of taste or polish — it removes a real, quantifiable cost. Every slide whose biggest
element is not its most important element taxes every viewer, every time.

**The failure mode.** A slide where a long secondary caveat occupies the dominant slot while
the key number sits small in a corner: the eye goes to the caveat first, the viewer thinks
"this slide is about the caveat," then finds the number, then has to re-interpret the whole
slide. Recognisable as a slide that "takes a second to get."

**How to check it.** Time yourself (or a colleague) finding the slide's point on first
glance. If the eye lands on the wrong thing first and has to correct, the hierarchy is lying.

### 4.4 The text-length proxy trap — a lesson in conflating correlated variables

**The principle.** "The longest text is the most important" is a category error. Text length
is not importance; treating it as importance actively points the eye at the wrong element.

**Why it is true.** Importance is a property of the argument (§4.1); text length is a property
of how much someone typed. These are *different variables* that correlate only weakly. The
canonical counterexample makes it obvious: a short number ("$4.2M", "+40%", "99.98% uptime")
is often the *shortest* element on the slide and the *most* important; a hedging caveat ("note
that these figures exclude Q3 refunds and are unaudited…") is often the *longest* element and
the *least* important. If a system uses text length as the importance proxy, it puts the
caveat in the dominant slot and the number in a corner — the exact lying hierarchy of §4.3.
[PRACTICE — the counterexample and the critique are drawn from the weighting and
narrative-craft research; it is a reasoned argument, not an experimental finding.]

**Why the proxy exists anyway — the teaching point.** The proxy is not pure superstition. Text
length *does* track something real: **overflow risk.** The longest card is the one most likely
to overflow its slot, so "the longest thing needs the most room" is a legitimate *layout*
concern. The error is conflating that legitimate concern (overflow) with a different variable
(importance). Two variables that correlate weakly get fused into one, and the weak correlation
means the fused rule is wrong much of the time. This is the general lesson: when a proxy is
convenient, check *what it actually measures* before you let it stand in for the thing you
care about. Length measures "how much space this needs," not "how much this matters." [PRACTICE]

**What follows for the designer.** Importance must be *declared or decided from the argument*,
never inferred from how much text an element contains. Handle overflow as its own separate
concern (give long things room) and handle importance as its own separate concern (give
important things dominance). Do not let one masquerade as the other.

**The failure mode.** A layout that automatically enlarges the card with the most text —
so a slide's dominant element is reliably its wordiest, least-punchy element, and its sharp
one-line takeaways are shrunk into the margins.

**How to check it.** For the element currently sized largest, ask: is it largest because it
matters most, or because it has the most words? If the latter, the proxy has trapped you.

### 4.5 How many hierarchy levels are usable — deriving a specific number

**The principle.** A slide can support **three** reliably distinguishable weight levels for
its content, with an occasional fourth reserved for a slide-title / hero super-level — so
about **three, occasionally four** in total.

**Why it is true — two independent derivations converging.**

*From the just-noticeable-difference (§2.7).* Levels are told apart by size (and luminance)
steps that must each clear the JND (~1.2× minimum, §2.7). A slide has a limited size budget:
the top level cannot be so large it overflows, and the bottom cannot be so small it is
illegible (Part B's legibility floors). With a sensible ratio (a major-third 1.25 scale,
§4.6) you can fit roughly four clearly distinct sizes before the top overflows or the bottom
collides with the caption size — e.g. ~24 / 30 / 38 / 60 px on a 1080p canvas. More levels
than that and adjacent ones fall below JND and read as the same size.

*From working memory (§3.1).* The Cleveland & McGill hierarchy re-examination found that
although the original perceptual-task ranking had ten elements, in practice "there may be no
more than three or four individual rankings" that people reliably distinguish
(https://www.researchgate.net/publication/221249388). Dashboard practice converges
independently on "3–5 numbers, understood in under five seconds." Both track Cowan's ~4-chunk
limit (§3.1): the viewer cannot hold more than about four ranked levels in mind while parsing.
[EVIDENCE — Cleveland & McGill hierarchy re-examination; Cowan ~4; the "3–5 numbers"
dashboard convention is [PRACTICE].]

**The landing number, with reasoning.** Design for **exactly three content weight levels —
Primary, Secondary, Tertiary** — because three clears JND comfortably within a slide's size
budget *and* sits safely inside the ~4-chunk memory limit. Allow a fourth **Hero/kicker**
super-level (the slide title or a statement) only on sparse slides, where there is size budget
for it and few enough other levels that four remains distinguishable. Since the slide title
usually occupies that top level already, content cards are left with three: Primary,
Secondary, Tertiary. [EVIDENCE for the ceiling; the specific "three content levels + title"
allocation is a reasoned design choice — [PRACTICE].]

**The failure mode.** Five or six intended weight levels: adjacent ones fall below JND, so the
viewer sees maybe two or three actual bands with the rest blurring together — the intended
fine ranking is invisible, and the slide reads as flatter than designed.

**How to check it.** Count the intended distinct weight levels. More than four (including the
title) → collapse some together; you cannot render more than about four distinguishably.

### 4.6 Deriving the ratios — area, type scale, modular scales

**The principle.** Dominance and level-separation depend on *ratios* that clear perception,
and because area is a weak channel it needs a *large* ratio while type needs only a modest one.

**Why it is true, and the numbers.**

*Area ratio for unambiguous dominance.* From §2.6, area is near the bottom of the perceptual
ranking and is *under*-read (a double-area shape reads as ~1.5× bigger). So a small area step
is ambiguous: a 1.3–1.5× area difference reads as "roughly equal, slightly different." To make
one element **unambiguously** dominant, the area step must be large — on the order of **≥2×**
the largest competing element — and is best reinforced by a second channel (a bigger headline,
isolation). Below ~1.2× area the elements simply read as *equal* (route them to an
equal-weight arrangement, not a dominant one). Because area is weak, it *needs* the large step
— this is the direct consequence of Cleveland & McGill. [EVIDENCE for area weakness; the ≥2×
threshold is a reasoned heuristic — [ASSUMPTION].]

*Type-scale step for clearing JND.* From §2.7, adjacent type levels must differ by at least
**~1.2×** to read as deliberately different across a slide. Below that they look like the same
size set sloppily.

*Modular scales — which ratios produce distinguishable levels.* A modular scale multiplies a
base size by a fixed ratio per step (ratios and worked examples:
https://iotools.cloud/journal/modular-type-scale-typography-css/,
https://whatfontfinder.com/type-scale-calculator/):

| Name | Ratio | Steps from 16px |
| --- | --- | --- |
| Minor second | 1.067 | 16 → 17.1 → 18.2 … (too subtle: below JND) |
| Major second | 1.125 | 16 → 18 → 20.25 … (marginal) |
| Minor third | 1.200 | 16 → 19.2 → 23 → 27.6 … |
| Major third | 1.250 | 16 → 20 → 25 → 31.25 → 39 … |
| Perfect fourth | 1.333 | 16 → 21.3 → 28.4 → 37.9 … |
| Golden ratio | 1.618 | 16 → 25.9 → 41.9 → 67.8 … |

Readings for hierarchy:
- Ratios at or below **~1.125 do not clear the JND reliably** on a slide — adjacent levels look
  the same size. Avoid them for hierarchy (fine for body/caption micro-adjustments).
- **1.25 (major third) is the sweet spot for on-screen hierarchy:** each step is a clear +25%,
  comfortably above JND, and the scale does not explode so fast you run out of room. This is the
  most common design-system default.
- **1.333–1.5 give very strong, unmistakable steps** — good when you have few levels and want
  them dramatically separated (typical of slides, which have far fewer levels than a document).
- **Golden ratio (1.618) is dramatic but coarse:** by the third step you are near 4× the base,
  a large headline; good for a 2-level hero, bad for a 4-level hierarchy (levels 3 and 4 collide
  with the base or the headline overflows).

Practical choice: **1.25 for dense slides, 1.333–1.5 for sparse hero/statement slides.**
[EVIDENCE for the ratio table and JND; the per-slide-density choice is [PRACTICE].]

**What follows for the designer.** Pick a modular ratio (1.25 dense, 1.333–1.5 sparse) so
adjacent type levels are always ≥1.2×; make the primary element's *area* ≥2× the largest
secondary; and remember these are two different channels doing two different jobs — type ratio
separates *levels*, area ratio establishes *dominance*.

**The failure mode.** A "dominant" element made larger only by type (say 1.4× type) but the
same card area as its neighbours: the type step clears JND but the area does not signal
dominance, so it reads as "a slightly bigger label," not "the point."

**How to check it.** Two measurements: adjacent type levels ≥1.2×? Primary area ≥2× the largest
secondary? If either fails, the intended hierarchy will not read as intended.

### 4.7 The emphasis toolkit as a ranked instrument set

**The principle.** Emphasis is not one thing; it is a set of instruments of differing strength
and differing cost, and each survives a different set of degradations. Choosing emphasis means
choosing the right instrument for the strength you need and the media you must survive.

**Why it is true.** Each technique maps to a pre-attentive attribute of known strength (§2.3)
and to known survival under greyscale, portrait reflow, and a held video frame (§2.8). The
table below rates each for **strength** (as an attention cue) and for the costs that matter:
**noise** (does over-use destroy the quiet field that makes contrast work? — §2.5), and what it
**survives** (greyscale / portrait / a held video frame). Sources: Wolfe & Horowitz 2017 tiers
(https://pmc.ncbi.nlm.nih.gov/articles/PMC9879335/); centre-of-gravity fixation (Richards &
Kaufman 1969, cited therein); Mayer signalling for highlight/cue
(https://www.devlinpeck.com/content/mayers-principles-of-multimedia-learning). [EVIDENCE for
strengths and survival; the ordering is a synthesis — [PRACTICE].]

| Technique | Strength | Noise risk | Greyscale | Portrait reflow | Held video frame |
| --- | --- | --- | --- | --- | --- |
| **Size** (area + type) | Very high (size = undoubted) | Low if few levels | ✅ survives | ⚠️ area ratios change; re-solve per orientation | ✅ |
| **Luminance / value contrast** | High (probable) | Med | ✅ **best greyscale survivor** | ✅ | ✅ |
| **Colour / accent hue** | Very high (undoubted) | High — one accent max | ❌ collapses in greyscale; fails ~8% of men | ✅ | ✅ |
| **Isolation / whitespace** | High (position + centre-of-gravity) | Low | ✅ | ⚠️ vertical space scarcer in portrait | ✅ |
| **Enclosure / border / card** | Medium (closure = probable) | Med — borders everywhere add noise | ✅ | ✅ | ✅ |
| **Position (top-left / centre)** | Medium | Low | ✅ | ⚠️ must flip for RTL; grid reflows | ✅ |
| **Alignment break** | Medium (orientation-ish) | High — reads as "broken" if unintended | ✅ | ⚠️ fragile | ✅ |
| **Font weight (bold)** | Medium | Med — "everything bold = nothing bold" | ✅ | ✅ | ✅ |
| **Dimming non-focal content** | High (creates contrast by *lowering* others) | Low — actively *reduces* noise | ✅ | ✅ | ✅ |
| **Highlight (marker/background)** | High | Med | ⚠️ depends on value contrast, not hue | ✅ | ✅ |
| **Elevation / shadow** | Low–Med | Med — subtle, easily lost | ⚠️ weak in greyscale | ✅ | ✅ |
| **Motion / progressive reveal** | Very high (motion = undoubted) | Low | n/a | n/a | ❌ **motion does not exist in a held frame** |

**Why size and luminance are the only cross-medium-safe carriers.** From §2.8: size is
geometric (survives greyscale, compression, a still frame; only its ratios shift under
reflow) and luminance contrast is exactly what greyscale, compression and a still frame all
preserve. Every other strong cue fails at least one medium: **colour dies in greyscale** and
for colour-blind viewers, and **motion dies in a held frame** and in a printed handout. So
colour and motion **can only ever be additive** — layered on top of a hierarchy that already
works in size and luminance, never the sole carrier. A design whose ranking rides on colour
alone vanishes in greyscale; one that rides on motion alone vanishes when paused or exported
as a static page. [EVIDENCE for survival facts; the "additive only" rule is the reasoned
consequence — [PRACTICE].]

**What follows for the designer.** Build the hierarchy in **size + luminance first**, verify
it survives greyscale and a still frame, and only then add colour and/or motion as
reinforcement. Prefer *dimming the others* over *shouting louder on the hero* (it reduces
noise instead of adding it — §2.5). Reserve alignment breaks and heavy elevation for
deliberate editorial moments; they are noisy and fragile.

**The failure mode.** A hierarchy carried entirely by an accent colour or entirely by an
entrance animation — invisible the moment colour or motion is removed by the medium.

**How to check it.** Strip colour (greyscale) and strip motion (freeze a frame). If the
intended focal point still wins both times, the hierarchy rides on the safe carriers; if it
loses either, it was leaning on an additive-only cue as its sole carrier.

### 4.8 Failure modes with detectable signals

Four hierarchy failures recur, each with a recognisable signal.

**Everything-emphasised.** *Signal:* more than one element is at the top weight/size level.
*Why it fails:* salience is relative (§2.5) — if every element carries the "important" cue, no
element is *unique* on that cue, so none pops. "When everything is bold, nothing is bold"
(https://brainito.com/visual-hierarchy-checker; Mayer's "cueing everything cues nothing,"
https://www.devlinpeck.com/content/mayers-principles-of-multimedia-learning). *Detectable
check:* count elements at the top level (excluding the title); more than one → warn "multiple
primaries." [EVIDENCE]

**Nothing-emphasised.** *Signal:* no element's saliency exceeds the others by a clear margin;
the slide blurs to a uniform grey mass under a squint. *Why it fails:* no focal point means
the ~100ms gist parse (§2.1) returns no answer and the viewer must scan deliberately.
*Detectable check:* the squint test (§4.9), or downscale the rendered slide to a blur proxy and
check whether any element's contrast exceeds the rest by a set margin; if not → warn "no
dominant element." [EVIDENCE for the mechanism; the downscale threshold is [ASSUMPTION].]

**Dominant slot filled with the wrong content.** *Signal:* the layout *has* a dominant slot,
but the element in it is not the most important one — so the layout actively points at the
wrong thing (§4.3, §4.4). *Why it fails:* it is a lying hierarchy, the most expensive failure,
because the layout is confidently wrong. *Detectable check:* if the element in the dominant
slot is not the declared/decided most-important element → warn or error "reorder." (Note this
is exactly what the text-length proxy causes — §4.4.) [EVIDENCE for the cost; the proxy origin
is [PRACTICE].]

**The equal-cards problem.** *Signal:* five (or more) cards of equal size, weight and colour,
forcing the viewer to read all of them to learn which matters. *Why it fails:* the layout has
abdicated its ranking job (§4.2). *This is only a failure when one item is genuinely more
important* — equal tiling is *correct* when the items truly are peers (a set, a menu, parallel
options). *Detectable check:* if the author declared unequal weights but the rendered sizes are
within JND (< ~15%) → warn "declared hierarchy not visible." [EVIDENCE for the relative-salience
basis; the JND threshold is [ASSUMPTION].]

**How to check the whole set at once — the squint test.** See §4.9.

### 4.9 The squint test — why the cheap manual check works

**The principle.** Blur or squint at the slide until detail disappears; you should still see
the most important thing first, the second-most second, and so on. If everything blurs to the
same grey mass, there is no hierarchy.

**Why it works — perceptually.** Squinting (or blurring) removes high-spatial-frequency detail
— the text, the fine edges — and leaves only the low-frequency structure: the coarse pattern of
size, position, and luminance. That low-frequency structure is *exactly what the ~100ms
pre-attentive gist parse uses* (§2.1) and what the pre-attentive feature maps respond to
(§2.2). So squinting is a physical simulation of the first glance: it shows you what the viewer
sees *before* they read anything. If a focal point survives the blur, the gist parse will find
it; if the slide blurs to uniform grey, the gist parse returns nothing and the viewer must fall
back to slow scanning. The test works because it isolates the same signal the visual system
uses first. (Practitioner convergence: https://learnui.design/blog/squint-test-ui-design-case-study.html,
https://polypane.app/blog/debug-your-visual-hierarchy-with-the-squint-test/, and for data
https://www.sqlservercentral.com/blogs/design-concepts-for-better-power-bi-reports-part-4-the-squint-test.)
[EVIDENCE — the mechanism ties directly to scene gist and pre-attentive processing; the test
itself is [PRACTICE].]

**What follows for the designer.** Run the squint test on every slide, and — because size and
luminance are the cross-medium-safe carriers (§2.8, §4.7) — run it in *greyscale* to confirm the
hierarchy does not secretly depend on colour. For a video whose final built state also ships as
a static deck page, run it on that final state, because the deck viewer never saw the build.

**The failure mode it catches.** All four failures of §4.8: everything-emphasised (two things
survive the blur), nothing-emphasised (nothing survives), wrong-content-dominant (the wrong
thing survives), and equal-cards (a uniform grid of equal blobs).

**How to check it.** Blur the slide (defocus your eyes, or apply a heavy Gaussian blur, or
downscale then upscale). Ask: what do I see first? Is it the element carrying the argument? Then
repeat in greyscale.

### 4.10 A general model of weighting

Pulling the chapter together into a model abstract enough to apply to any presentation tool or
practice. It has three parts: how an author should express importance, how many levels there
are, and how each level maps onto area, type scale, and emphasis treatment.

**How the author expresses importance.** The author declares *rank*, not pixels or colours —
an ordinal weight per element, decided from the *argument* (§4.1), never inferred from text
length (§4.4). A tool enforces that a single most-important element exists and is unique; the
author chooses which element that is. Overflow (how much room an element needs) is handled as a
separate concern from importance (how much it matters).

**How many levels.** Three content levels — **Primary, Secondary, Tertiary** — plus a
**Hero/kicker** super-level for the slide title or a statement, used only on sparse slides
(§4.5). Three clears JND within the size budget and sits inside the ~4-chunk memory limit; a
fourth is the ceiling, not the target.

**How each level maps onto area, type, and emphasis.** Numbers below are illustrative for a
1920×1080 canvas; the *ratios*, not the absolute sizes, are the invariant — solve sizes to the
largest that fits without overflow while preserving the ratio gaps.

| Level | Layout area (relative) | Type step (ratio ≥1.2× between levels; 1.25 dense / 1.333–1.5 sparse) | Emphasis carriers, in order | Rule |
| --- | --- | --- | --- | --- |
| **Hero / kicker** (title, statement) | full-bleed or ≥60% | largest (e.g. base × 1.333³⁻⁴ ≈ 38–60px+) | size + isolation + weight | sparse slides only; the slide's headline |
| **Primary** (the one thing) | **≥2×** any secondary card's area | large (e.g. base × 1.25² ≈ 25–31px, or a big stat) | **size + luminance** → +single accent hue → +isolation → +reveal-on-mention (video only) | exactly one per slide; unique on the accent channel |
| **Secondary** (supporting) | equal among themselves | mid (e.g. base × 1.25 ≈ 20px) | enclosure/card + neutral weight | must be *homogeneous* with each other so Primary stays unique (§2.5) |
| **Tertiary** (labels, captions, context) | smallest | base (≈16px) at reduced luminance (grey) | low luminance, no accent, no border | recedes; carries units, time, detail |

The load-bearing numbers, each derived above:
- **Adjacent type levels ≥ 1.2×** — clears JND (§2.7, §4.6). Below that → not distinguishable.
- **Primary area ≥ 2× the largest secondary** — makes dominance unambiguous given area's
  weakness (§2.6, §4.6). Between 1.2× and 2× → dominance ambiguous; below 1.2× → treat as equal
  (route to an equal-weight arrangement).
- **Size + luminance carry the hierarchy; colour and motion are additive only** (§2.8, §4.7).
- **Exactly one Primary; Primary occupies the dominant slot** — else the everything-emphasised
  (§4.8) or lying-hierarchy (§4.3) failure.
- **Hierarchy must survive greyscale and a held frame** — verify with the greyscale squint test
  (§4.9).

[EVIDENCE for the perceptual thresholds (JND, area ranking, greyscale survival, relative
salience); the specific three-level allocation, the ≥2× area figure, and the illustrative pixel
sizes are reasoned design heuristics — [ASSUMPTION] on the exact numbers, [PRACTICE] on the
level structure.]

**How this serves following-along.** Every part of the model exists to make the ~100ms glance
land on the argument's most important element, so the viewer — whether following a narration or
reading alone — sees what matters first and does not pay the re-read cost. That is the single
purpose against which every rule in this document is judged.

---

# Part B — Structure and Arrangement

*How a presentation is ordered, titled, laid out, shaped, and sequenced so that a viewer
can follow it — whether following a narration in a video or reading the slides alone.
Part A covered what a single slide may contain and how visual weight is built; Part B
covers what comes before slides (structure), the one field that carries the meaning (the
title), the systems that arrange elements (composition and grids), the shapes those
arrangements make (the taxonomy), and the ordering of the whole (sequencing). The spine
carries through: does each concept help a viewer follow along?*
## Chapter 5 — Narrative structure: why a presentation needs a spine before it needs slides

### 5.0 Why structure is not decoration — the first-principles case

An audience receives a presentation **linearly and cannot random-access it.** A
reader of a book can flip back a page; a listener in a talk, or a viewer of a
narrated video, cannot. Each unit — each slide, each scene — arrives once, in
order, and must be understood *as it arrives*, because the next one is already
coming.

Comprehension, then, depends on **attachment**: each new unit is understood only
if the listener can attach it to something they already hold in mind. A fact with
nothing to attach to is not stored; it is dropped. Structure is precisely what
makes attachment possible — it arranges the units so that each one arrives *after*
the thing it depends on and *before* the thing that depends on it. Without
structure, the audience spends its scarce attention reconstructing the order
instead of following the argument. So structure is not ornament on top of content;
it is the precondition for content being received at all. **[ASSUMPTION — this is a
first-principles derivation from the linearity of delivery and working-memory
limits; the specific framing is not directly sourced, though it rests on the
segmenting and coherence findings below.]**

This has an immediate consequence that the rest of the chapter turns on: **a
structural framework decides the *order* in which ideas arrive; it does not decide
what a single slide may contain.** The order-deciding job (this chapter) is
orthogonal to the slide-composing job (Part A, and Chapters 6–8). Conflating them
is the most common authoring error. **[PRACTICE]**

There is one more first-principles point that governs which framework to reach for.
The frameworks fall into **two families, and picking from the wrong family is worse
than picking the wrong framework within a family:**

- **Persuasion / narrative family** — moves an audience to feel and act. These
  *build tension* or *oscillate*. They suit a talk, a pitch, a launch, a video.
  Members: Duarte's sparkline, Monroe's Motivated Sequence, problem-agitate-solve,
  the Hero's Journey, three-act/Freytag, the Heaths' SUCCESs.
- **Executive-argument family** — gets a decision from busy people. These are
  **answer-first** and deliberately *anti-suspense*. They suit a briefing, a memo,
  a board deck, a review. Members: Minto's Pyramid / SCQA, SCR, the consulting
  action-title discipline, STAR/CAR.

The critical, load-bearing distinction: the persuasion family *withholds the
answer to build tension*; the executive family *leads with the answer to kill
suspense*. They are not in conflict — they suit different audiences and modes. A
three-act build is right for a launch video and wrong for a board deck; answer-first
is right for the board and flattens a keynote. **[PRACTICE]** The conflict is
reported honestly, not resolved silently: choose the family by the audience's job,
then choose the framework within it.

---

### 5.1 Minto's Pyramid Principle & SCQA

**The principle.** Lead with the single governing thought (the answer), then support
it with 3–4 grouped, MECE (Mutually Exclusive, Collectively Exhaustive) arguments,
each backed by evidence. Ideas at any level must *summarise* the ideas below
(vertical logic) and be *the same kind of thing in logical order* (horizontal
logic). SCQA — Situation, Complication, Question, Answer — is the introduction
pattern that leads into the pyramid.
https://modelthinkers.com/mental-model/minto-pyramid-scqa ,
https://www.dbai.tuwien.ac.at/staff/gatter/work/051104_The_Minto_Pyramid_Principle.pdf
**[PRACTICE]**

**Why it works.** Executives decide under time pressure and have no patience for
suspense; leading with the answer lets them attach every subsequent argument to a
conclusion they already hold. The "3–4" grouping is justified by working-memory
limits — it aligns with the ~4-chunk ceiling (a real cognitive finding; see the
rule-of-three discussion in Part A / Chapter 9). This is a convergence between an
independent management source and the cognitive limit. **[PRACTICE]**

**What follows for the designer.** Structure the deck as: answer slide → 3–4
argument slides (each a grouped claim) → evidence beneath each. Every slide's title
should state its own conclusion (this is horizontal logic; see Chapter 6).

**The failure mode.** The "mystery novel" deck that withholds the recommendation
until slide 40. Executives disengage long before the reveal. A second, subtler
failure: arguments that overlap or leave gaps — the defect MECE exists to prevent.

**How to check it.** Read the slide titles alone, top to bottom. If they do not
reconstruct the whole argument, horizontal logic is broken. Ask of each argument
group: do these overlap? Is anything missing? If yes to either, the grouping is not
MECE.

**Empirical status:** received practice, not experimentally tested as a whole.
**[PRACTICE]**

---

### 5.2 SCR (Situation–Complication–Resolution)

**The principle.** The reduced three-beat form of SCQA for oral and deck delivery:
establish the Situation (current reality), name the Complication (what is wrong,
and its *cost*), then give the Resolution.
**[PRACTICE]** (Minto lineage, §5.1.)

**Why it works.** It is answer-oriented but keeps a minimal tension arc — enough to
motivate the resolution without the full suspense of a narrative. The Complication
is the engine: naming a *cost* is what makes the audience care.

**What follows for the designer.** A workable skeleton is S: 1–2 beats, C: 1–2
beats, R: 2–5 beats, in that fixed order. The single most important discipline is
that the Complication must **name a cost**, not merely describe a system.

**The failure mode.** The deck that describes a system without ever saying what is
wrong with the status quo. This is repeatedly identified as *the most common
defect* — corroborated from two directions: Duarte's sparkline rests on establishing
"what is" (the problem) before "what could be," and YC pitch guidance leads with the
problem. A deck that skips the Complication has no reason to exist. **[PRACTICE]**

**How to check it.** Point at the Complication beat and ask: does it name a concrete
cost (money, time, risk, lost opportunity)? If it only describes, it fails.

**Empirical status:** received practice. **[PRACTICE]**

---

### 5.3 Duarte's sparkline & the "what is / what could be" oscillation

**The principle.** Nancy Duarte, *Resonate*: great talks **oscillate between "what
is" (current reality) and "what could be" (the future)**, widening the gap on each
cycle to build tension, ending on a plateau she calls **"the New Bliss"** and a call
to action. It is not one arc — it is a *repeated toggle*.
https://www.duarte.com/resources/storytelling-framework/ **[PRACTICE]**

**Why it works.** The oscillation *is* contrast, and contrast is comprehension — the
gap between reality and possibility is what the audience feels. Widening it each
cycle sustains attention across a long talk without a single climax that, once
passed, releases all tension.

**What follows for the designer.** Skeleton: hook → (what is → what could be) × N →
New Bliss → call to action. The contrast pair is the atomic unit; a before/after
comparison slide is a single oscillation.

**The failure mode.** The flat, monotone deck with no tension — every slide the same
weight, no gap between problem and promise. The related failure is the "all vision,
no problem" pitch, which is an oscillation with the "what is" valley deleted.

**How to check it.** Trace the deck as a zig-zag: does it actually move between
present reality and future possibility, or does it sit on one side? If it never
returns to "what is," there is no gap to feel.

**Empirical status:** received practice, from a primary practitioner source.
**[PRACTICE]**

---

### 5.4 Freytag / three-act structure applied to talks

**The principle.** Freytag's pyramid (exposition → rising action → climax → falling
action → dénouement) and the simpler three-act (setup → confrontation →
resolution). Duarte explicitly analogises the sparkline to three-act structure;
Aristotle's beginning-middle-end is the root.
https://www.inc.com/carmine-gallo/apple-is-obsessed-with-magical-number-3-it-will-transform-your-presentations-too.html
**[PRACTICE]**

**Why it works.** A single rising-then-resolving arc gives the audience a peak to
anticipate and a release to remember; it is the shape most narrative media train
audiences to expect.

**What follows for the designer.** In deck terms: opener → escalating body → payoff
+ CTA. Suits a narrative video, a keynote, or teaching a concept as a journey.

**The failure mode.** The deck with no climax — everything the same size, no peak.
But note the reported conflict: three-act is *wrong* for an executive-argument deck,
which deliberately kills the climax by answering first (§5.1). **The framework must
be chosen for the mode.** [CONTESTED] — three-act (build tension) versus Minto
(answer first) genuinely disagree; the resolution is that they suit different
audiences (audience-you-must-move vs decider-in-a-meeting), not that one is right.
**[PRACTICE]**

**How to check it.** Ask whether the content has a genuine peak the rest builds
toward. If it is a board decision, the absence of a climax is correct, not a defect
— check the *family* first.

**Empirical status:** received practice. **[PRACTICE]**

---

### 5.5 The Hero's Journey — as used and abused in pitches

**The principle.** Campbell's monomyth, imported into pitch coaching. The *correct*
use is that **the customer is the hero and the product is the guide/mentor** — not
the other way round.
https://persuasionbydesign.substack.com/p/youre-not-the-hero-of-your-own-pitch
**[PRACTICE]**

**Why it works (when it works).** Audiences identify with the hero; casting the
customer as hero makes the audience see themselves in the transformation, with the
product as the tool that got them there.

**What follows for the designer.** Skeleton: ordinary world (customer's status quo)
→ call/problem → the guide (you) offers a plan → the customer acts → transformed
world. Suits sales, fundraising, product launch.

**The failure mode — and the abuse.** The failure is *making the company the hero* —
slides about the founder's genius and the product's cleverness, with the customer a
bystander. The abuse is forcing a full 12-stage monomyth onto a 90-second pitch,
padding a short pitch with mythic scaffolding it cannot carry. **[PRACTICE]**

**How to check it.** Ask: who is the hero of this deck? If every triumphant slide is
about the product and none about the customer's changed life, the roles are
inverted.

**Empirical status:** received practice. **[PRACTICE]**

---

### 5.6 Chris Anderson / TED — the throughline

**The principle.** A talk needs one **throughline** — a single connecting idea "that
ties together each narrative element," the spine that decides what to include and
(mostly) what to cut. No throughline → "a talk that never says anything meaningful."
https://www.ted.com/read/ted-talks-the-official-ted-guide-to-public-speaking ,
https://wattshappening4capstone.edublogs.org/files/2023/03/Chris-Anderson-Resource-Guide-2_Craft-Your-Throughline.pdf
**[PRACTICE]**

**Why it works.** A single spine gives every unit something to attach to (§5.0): the
throughline. Anything that does not attach to it is, by definition, extraneous — and
extraneous material has a measured cost (the coherence principle, Part A). The
throughline is the editorial rule that operationalises coherence.

**What follows for the designer.** It is not a scene skeleton — it is a *constraint*
above the skeleton: one sentence you could state the whole talk as, checked against
every scene. Require it before writing slides.

**The failure mode.** The "topic dump" — a presentation *about* an area rather than
one that *argues* one thing. This is the same failure the governing thought (§5.1)
and the assertion title (Chapter 6) attack from other directions.

**How to check it.** Write the talk as one sentence. Then take each scene and ask:
does this serve that sentence? If a scene does not, cut it or fix the sentence.

**Empirical status:** received practice. **[PRACTICE]**

---

### 5.7 Monroe's Motivated Sequence

**The principle.** Alan Monroe (Purdue, 1930s): five fixed steps — **Attention →
Need → Satisfaction → Visualization → Action.** The distinctive step is
*Visualization* — make the audience vividly *picture* the world with the solution
(and, optionally, without it).
https://llcc.pressbooks.pub/publicspeaking/chapter/monroes-motivated-sequence/ ,
https://en.wikipedia.org/wiki/Monroe's_motivated_sequence **[PRACTICE]**

**Why it works.** It is explicitly built for persuasion toward action; the mandatory
Visualization beat makes the future concrete (concreteness aids memory and belief),
and the mandatory Action beat forces a specific ask.

**What follows for the designer.** Skeleton: hook (attention) → problem the audience
feels (need) → your solution (satisfaction) → paint the improved future
(visualization) → the specific ask (action). Suits sales, advocacy, CTA-heavy talks.

**The failure mode.** The talk that explains a solution but never asks for anything,
or asks vaguely. Monroe's unique contribution over its near-twins (SCR+CTA, the
sparkline) is the mandatory Visualization beat *and* the concrete Action.

**How to check it.** Point at the final beat: is there a single, concrete ask? Point
at the Visualization beat: does the audience actually picture the changed world, or
is it another feature list?

**Empirical status:** received practice. **[PRACTICE]**

---

### 5.8 Problem–Agitate–Solve (PAS)

**The principle.** A copywriting micro-structure: state the problem, *agitate* it
(make the pain vivid and pressing), then present the solution.
https://www.linkedin.com/posts/grantslee_after-creating-hundreds-of-thousands-of-presentations-activity-7384242387902062592-5rFA
**[PRACTICE]**

**Why it works.** Agitation deepens the "what is" valley so the "what could be" peak
lands harder — it is the same instinct as SCR's "the Complication must name a cost,"
compressed to three beats.

**What follows for the designer.** Skeleton: problem slide → agitation slide (cost,
consequence) → solution slide. A single sparkline oscillation with an amplified
valley. Suits a short sales pitch, a landing-page micro-narrative, an ad.

**The failure mode.** The pitch that names a problem so mildly no one cares — the
"Agitate" step deleted.

**How to check it.** Ask of the agitation beat: does it make the pain *pressing*, or
merely mention it?

**Empirical status:** received practice. **[PRACTICE]**

---

### 5.9 STAR / CAR

**The principle.** Situation–Task–Action–Result (or Context–Action–Result): a
retrospective micro-narrative for *one* accomplishment — interviews, case studies,
project retros. **[PRACTICE]**

**Why it works.** It forces the story to end on a *measurable result*, which is what
makes an accomplishment credible rather than a claim.

**What follows for the designer.** Skeleton: context → what needed doing → what you
did → measurable result. Suits a case-study slide or scene; scales up to a whole
"tracer journey" that follows one case end to end and closes on a metric.

**The failure mode.** The accomplishment story that never states a *result* — all
activity, no outcome.

**How to check it.** Point at the last beat: is there a number or a concrete
outcome? If it ends on "and then we shipped it," it fails.

**Empirical status:** received practice. **[PRACTICE]**

---

### 5.10 Gene Zelazny — message-first charts

**The principle.** *Say It With Charts*: start from the **message you want the
audience to take away**, then choose the chart form that carries it. "Your audience
should never have to ask 'So what?' after looking at your chart."
https://www.antoinebuteau.com/lessons-from-gene-zelazny/ **[PRACTICE]**

**Why it works.** The message drives the visual form, not the data. A chart chosen
to display data leaves the audience to extract the point; a chart chosen to carry a
message *states* the point. This is the data-slide instance of assertion-evidence
(Chapter 6).

**What follows for the designer.** For any data slide, decide the one sentence the
chart must prove, then pick the form (and the title) that proves it. Pick the stat
because it carries the message; let the title say the "so what."

**The failure mode.** The chart that shows everything and says nothing — the "so
what?" chart.

**How to check it.** Cover the title and ask a colleague what the chart's point is.
If they cannot say it in one sentence, the message did not drive the form.

**Empirical status:** received practice. **[PRACTICE]**

---

### 5.11 The consulting action-title discipline (horizontal & vertical logic)

**The principle.** Every slide's title is a **full sentence stating the takeaway**
("the so what"), not a topic label. Read the titles alone, top to bottom, and you
get the entire argument (**horizontal logic**); the content of each slide supports
its own title (**vertical logic**).
https://slideworks.io/resources/how-to-write-action-titles-like-mckinsey ,
https://slidescience.co/action-titles/ **[PRACTICE]**

**Why it works.** It converts a deck into a read-alone artifact: the argument
survives without a presenter because it lives in the titles. This is the same
instruction assertion-evidence (§5.12) reaches from cognitive science — a strong
convergence of two independent traditions (management consulting and experimental
psychology). It is treated in depth in Chapter 6, because the title is the
highest-leverage single change available.

**What follows for the designer.** Write titles as sentences; check that the titles
alone read as the argument; ensure each slide's body supports its own title and
introduces no second claim.

**The failure mode.** The deck that is illegible without the speaker, and the deck
whose argument you cannot reconstruct by skimming the titles.

**How to check it.** Extract every title into a list. Does the list read as a
coherent argument? Does any body slide prove a claim its title does not state?

**Empirical status:** received practice (but see §5.12 for the experimental backing
of the closely-related assertion-title). **[PRACTICE]**

---

### 5.12 Assertion-evidence (Michael Alley) — the one with real evidence

**The principle.** Each slide has (1) a **succinct sentence assertion** as the
headline — the single message of the slide — supported by (2) **visual evidence** in
the body (photo, diagram, chart), *not* a bulleted list. It rejects the default of a
phrase-topic headline over bullets. https://www.assertion-evidence.com/
**[PRACTICE + EVIDENCE]**

**Why it is true — what the studies actually measured.** This is the one structural
technique in the corpus with controlled experimental backing, so the findings are
reported precisely:

- **Alley et al., "How the design of headlines in presentation slides affects
  audience retention" (2006):** on 15 questions, the sentence-headline group scored
  **79% vs 69%** for the traditional phrase-headline group; **statistically
  significant at p<0.001.**
  https://www.researchgate.net/publication/228758758_How_the_design_of_headines_in_presentation_slides_affects_audience_retention
  **[EVIDENCE]**
- **Garner & Alley, comprehension study (110 engineering students):** the
  assertion-evidence group showed **superior comprehension, fewer misconceptions,
  lower perceived cognitive load, and stronger recall at delayed post-test.**
  https://www.researchgate.net/publication/286042632_How_the_Design_of_Presentation_Slides_Affects_Audience_Comprehension
  **[EVIDENCE]**
- **Presenter-side effect:** using AE slides raised the *presenter's own*
  understanding of the material, and the approach took minimal instruction to teach.
  https://pure.psu.edu/en/publications/slide-structure-can-influence-the-presenters-understanding-of-the
  **[EVIDENCE]**
- A widely repeated "**improves retention by 26%**" figure appears in secondary
  literature (https://www.academia.edu/42766968/) but **could not be traced to a
  specific controlled result** — treat it as unsupported and prefer the 79%-vs-69%
  and cognitive-load findings, which are directly sourced. **[MYTH — origin:
  secondary literature repeating an untraceable figure.]**

**What follows for the designer.** Each slide's headline is a sentence stating its
one message; the body is visual evidence for that sentence, never a bullet list.
This is the slide-level unit that satisfies the multimedia, signaling, and
redundancy principles simultaneously (Part A). It generalises well beyond
engineering talks.

**The failure mode.** The "phrase headline + bullets" slide, which (a) fails to state
the takeaway and (b) forces the audience to *read while listening*, triggering the
redundancy penalty. It is recognisable as any slide whose title is a noun phrase
("Q3 Results") sitting over a bulleted list.

**How to check it.** Read the headline: is it a complete sentence that states a
claim? Look at the body: is it evidence for that claim, or is it a list of topics? If
the headline is a phrase and the body is bullets, it is the exact pattern the studies
beat by ten points.

**Empirical status:** the practice is codified by a practitioner (Alley); the
*effect* is experimentally established. This is the strongest structural finding in
the document. **[PRACTICE + EVIDENCE]**

---

## Chapter 6 — The title carries the meaning

### 6.0 Why this is the highest-leverage single change

Of every intervention in this document, changing how titles are written is the one
with the most evidence behind it, the lowest cost to apply, and the widest reach.
The case, stated plainly:

1. **It is the intervention Alley's studies actually tested.** Sentence headlines
   beat phrase headlines **79% vs 69%, p<0.001** (§5.12). No other structural change
   in this document has a controlled result attached. **[EVIDENCE]**
2. **It converts the deck into a read-alone artifact.** Read the titles alone and
   get the argument (horizontal logic, §6.2) — this is what lets a deck survive
   without its presenter. **[PRACTICE]**
3. **It is cheap.** It changes only the title string, not the layout or the visuals.
4. **It forces the author out of the curse of knowledge.** You cannot write an
   assertion title without first deciding what the slide is *for*. **[PRACTICE]**

Two independent traditions — cognitive science (Alley) and management consulting
(Minto / McKinsey action titles) — arrive at the identical instruction. That
convergence is among the strongest signals in the whole body of research.

---

### 6.1 Topic titles versus assertion titles

**The principle.** A *topic title* names the subject ("Q3 Results"); it adds no
insight and leaves the audience to extract the point. An *assertion title* states
the takeaway as a complete sentence ("Q3 margin fell because freight tripled").
https://slideworks.io/resources/how-to-write-action-titles-like-mckinsey
**[PRACTICE]**

**Why it is true.** A topic title makes the body an *unlabelled exhibit* — the
audience must work out what they are looking at and why. An assertion title makes
the body *evidence for a stated claim* — the audience knows what the slide argues
before they parse the detail, so every element attaches to the claim (§5.0). This
is the signaling principle in title form: the title is the cue that marks the
essential structure. **[PRACTICE, resting on EVIDENCE for signaling.]**

**What follows for the designer.** Write the title as a sentence that states the
slide's one conclusion. The single most valuable authoring check is to flag a
title that looks like a topic ("Q3 Results") and prompt: *state the so-what.*

**The failure mode.** The topic-titled slide: a noun phrase over an exhibit, where
the audience nods along without knowing what they were supposed to conclude. It is
recognisable because you can read the title and still not know the slide's point.

**How to check it.** Does the title contain a verb and make a claim you could argue
with? "Q3 Results" cannot be argued with (it is a label); "Q3 margin fell because
freight tripled" can (it is a claim). If the title is not arguable, it is a topic,
not an assertion.

---

### 6.2 Horizontal logic — the titles alone should read as the argument

**The principle.** Across a whole deck, the titles read top-to-bottom must
reconstruct the entire argument on their own; each slide's body then supports only
its own title (vertical logic).
https://slideworks.io/resources/how-to-write-action-titles-like-mckinsey ,
https://slidescience.co/action-titles/ **[PRACTICE]**

**Why it is true.** Readers skim; decision-makers skim titles first and read bodies
only where the title provokes a question. If the titles form a coherent chain, the
skim delivers the argument; if they are topic labels, the skim delivers a table of
contents and nothing more. This is what makes a reading deck function without its
author present (see the consumption-mode distinction in Part A). **[PRACTICE]**

**What follows for the designer.** After drafting, extract every title into a list
and read it as prose. It should flow as a connected argument. Where it jumps or
repeats, the deck's logic — not just its wording — has a gap.

**The failure mode.** A title list that reads as ["Background", "Our Approach",
"Results", "Next Steps"] — a structure, not an argument. The reader learns the shape
of the talk but not its content.

**How to check it.** The title-extraction test above. A stronger version: hand the
title list to someone who has not seen the deck and ask them to state the
recommendation. If they can, horizontal logic holds.

---

### 6.3 The length ceiling — when a title stops being readable

**The principle.** An assertion title must stay short enough to read as a *headline*
at a glance, not as body text. Practitioner guidance: an action title is a short,
simple, single sentence that "allows the audience to only read the title." Alley's
own guidance for AE headlines: **one sentence, ideally ≤ 2 lines**, present tense,
no ending period, sized as a headline. **[PRACTICE]**

**Why it is true.** A headline works because it is grasped in a single fixation
pass; past a certain length it becomes a paragraph, loses the "glance and get it"
property, and competes with the body for reading time. Jobs' "billboard test" — a
slide graspable in ~3 seconds — corroborates the ceiling, though it is itself
popular heuristic rather than measured law.
https://www.forbes.com/sites/carminegallo/2025/10/29/why-steve-jobs-followed-the-3-second-slide-rule-for-better-presentations/
**[MYTH for the "3-second" figure specifically — origin: Gallo/Forbes popularising
Jobs; consistent with the coherence principle but not itself measured.]**

**What follows for the designer.** A defensible authoring ceiling, synthesised from
the sources: **aim ≤ ~10–12 words / ≤ ~65–70 characters, hard cap ~2 lines at
headline size.** Beyond that it reads as body text. This is a mechanical check — a
character or word count on the title. **[ASSUMPTION — the specific 10–12 word /
65–70 char figure is a synthesis of Alley's "≤2 lines" and consulting "single
sentence" guidance, not a directly measured threshold.]**

**The failure mode.** The two-and-a-half-line title that is really a sentence *and*
its qualifying clause — the author trying to fit the whole argument into the
headline. It reads as a paragraph, and the "glance and get it" property is gone.

**How to check it.** Count the words and characters; check it wraps to at most two
lines at headline size. If it exceeds the ceiling, the surplus is usually a second
claim that belongs in the body or on its own slide.

---

### 6.4 The title's claim and the one dominant element that proves it

**The principle.** The body is *evidence for the title's claim* — and the layout
must direct the eye to the single element that most supports it. The title carries
the assertion; the weighted dominant element carries the proof. If the two disagree,
the slide is broken.

**Why it is true.** This reframes the spine of the whole document. "Make information
weight equal to layout weight" resolves, at the slide level, to: **the title states
the assertion, and the layout emphasises the one piece of evidence that proves that
assertion.** The assertion lives in the *title*, not in a card; the dominant slot
carries the *proof*. So the element that deserves the biggest, brightest slot is the
*most load-bearing* one — the one that proves the title — which is often *not* the
one with the most text. A one-word number ("$4.2M") can be the shortest element on
the slide and the most important. **[PRACTICE, tying together Chapter 4's weighting
model and Alley's assertion-evidence.]**

**What follows for the designer.** Decide the title's claim first. Then ask: which
single element proves it? Give *that* element the dominant slot — do not route the
longest card there by default. Text length is a proxy for overflow risk, not for
importance; using it to allocate emphasis points the eye at the wrong thing.

**The failure mode — the broken slide, stated sharply.** The title asserts one thing
("Conversion recovered after the rebuild") and the biggest element on the slide
proves something else (a large caveat card, or an unrelated screenshot). The viewer
reads the title, looks for the proof, and the eye lands on the wrong element. They
re-read. This is the exact cost the whole discipline exists to eliminate. It is
recognisable whenever the dominant element and the title's claim do not match.

**How to check it.** Cover the title. Look at what the layout makes dominant. Does
that dominant element prove the (covered) title's claim? If the biggest thing on the
slide is not the thing that proves the headline, the slide is broken — either
re-weight the layout so the proof dominates, or change the title to assert what the
dominant element actually shows.

**Connecting back to Chapter 4.** Chapter 4 established *how* to build visual weight
(size and luminance as the cross-medium-safe carriers; salience is relative; one
dominant element per slide). Chapter 6 supplies the *target*: the element that
receives that weight is the one proving the title's assertion. Chapter 4 is the
mechanism; the title is the specification for where to aim it. When they agree, the
slide reads in one pass. When they disagree, it does not.

---

## Chapter 7 — Layout systems and composition

A layout system is a set of rules for placing elements so the placement is
consistent and the eye learns where to look. The recurring theme of this chapter:
**the systems worth adopting reduce the number of decisions the author makes, while
the "principles" worth discarding (golden ratio, rule of thirds, Z-pattern) are
folklore that dress up taste as law.** Every rule below is judged against whether it
helps the viewer follow along.

### 7.1 Modular grids and the Swiss / International Typographic Style

**The principle.** A modular grid divides the canvas into a field of cells (rows
*and* columns) that content is assigned into. Josef Müller-Brockmann's *Grid Systems
in Graphic Design* (1981) is the canonical source.
https://www.thegraphicdesignschool.com/design-history/joseph-mueller-brockmann/
**[PRACTICE]**

**Why it works.** The grid's claim is epistemic, not aesthetic: it takes elements
that are "subjective, irrational, and chaotic" and brings them "under tight,
measured control," producing clarity and — the part that matters here — **legibility
and faster comprehension.**
https://openlab.citytech.cuny.edu/langecomd3504sp2020/files/2018/10/MullerBrockmann_Grid_Des-Phil.pdf
A fixed field of cells beats free placement because consistency across slides lets
the viewer's eye *learn* where to look, spending attention on content rather than on
re-locating things each slide. **[PRACTICE]**

**What follows for the designer.** A card deck is literally a modular grid — a field
of cells, each holding one thing. The deepest justification for "pick a layout,
never hand-place elements" is here: the grid removes placement decisions, which is
the whole value.

**The failure mode.** Free-placed elements that sit at slightly different positions
slide to slide, so the eye must re-scan each time — death by a thousand small
relocations.

**How to check it.** Flip through the deck quickly. Do repeated element types (title,
first card, metric) sit in the same place each time? If they drift, there is no grid.

---

### 7.2 Baseline grids and vertical rhythm

**The principle.** A baseline grid aligns text baselines to a repeating vertical
unit (typically the body leading) so type across columns sits on shared lines.
https://medium.com/subform/are-grid-systems-still-relevant-in-digital-407beb4128c1
**[PRACTICE]**

**Why it works.** Shared baselines make multi-column running text read as one
coherent block rather than as columns drifting against each other.

**What follows for the designer.** Vertical rhythm matters most for *multi-column
running text* — which a card deck deliberately avoids. Because cards hold *phrases,
not paragraphs*, a strict baseline grid is low value; a consistent **spacing scale**
(an 8pt-style step for gaps, padding, and inter-element space) captures most of the
benefit. Encode a spacing token scale, not baseline snapping.

**The failure mode.** Over-engineering baseline alignment for content that is all
short labels — effort spent where it buys nothing — or, conversely, ragged
inconsistent spacing that makes a card grid feel scattered.

**How to check it.** Are all gaps, paddings, and inter-element spaces drawn from a
small fixed set of values? If spacing is ad hoc, the rhythm is broken.

---

### 7.3 Column systems, and why a web 12-column grid may be wrong for 16:9

**The principle.** The 12-column grid is a *web responsive* convention: 12 factors
cleanly into 2, 3, 4, and 6 for fluid reflow across unknown viewport widths. A slide
canvas is **fixed** (1920×1080 or 1080×1920), so the reason 12 exists does not apply.

**Why it (probably) does not transfer.** On a wide 16:9 field, 12 narrow columns
produce column widths (~140px with gutters) far too narrow for a card; content spans
3–6 of them anyway, so the 12-column structure is invisible overhead. A coarse
modular grid — four columns with fixed row units, or 3×2 / 2×2 — is a better default;
four columns give "enough span variety without chaos."
https://superdesign.dev/styles/bento-grid **[ASSUMPTION — labelled U-03-1 in the
source: no peer-reviewed study says "12 columns harms slides"; the argument is
structural (fixed vs fluid canvas), not measured.]**

**What follows for the designer.** For a fixed 16:9 canvas, prefer a coarse grid (≈4
columns) over a borrowed 12-column web grid. Do not import the 12-column convention
just because web tooling defaults to it.

**The failure mode.** A slide built on 12 columns where every element spans several,
so the grid does no visible work but adds complexity to every placement decision.

**How to check it.** Count how many columns your typical element spans. If it is
always 3–6 of 12, the 12-column grid is overhead; collapse to a coarser grid.

---

### 7.4 Symmetry versus asymmetry — the tension asymmetry creates

**The principle.** Symmetry reads as static, formal, and *equal*; asymmetry (an
off-centre heavy element plus negative space) reads as dynamic and *directs the eye*.

**Why it works.** Perfect symmetry gives the eye no reason to prefer one side, so it
reads "these are equals." An off-centre heavy element creates a visual imbalance the
eye resolves by looking at the heavy element first — the asymmetry *is* a hierarchy
signal. This is the mechanism behind an asymmetric emphasis grid (one tall card
left, two stacked right): the imbalance points attention. **[PRACTICE]**

**What follows for the designer.** Choose symmetry to claim "these are equals" and
asymmetry to claim "this one first." An asymmetric grid for genuinely equal items,
or a symmetric grid for items of unequal importance, is a *wrong claim* — exactly as
a wrong diagram shape is (Chapter 8).

**The failure mode.** Equal-weight items placed in an asymmetric grid: the size
difference lies about importance, and the viewer's eye is pulled to whichever item
happens to be big rather than to what matters.

**How to check it.** Ask: are these items genuinely peers? If yes, use a symmetric
equal-cell arrangement. If one leads, use asymmetry and make the leader the big one.

---

### 7.5 Figure/ground

**The principle.** The viewer separates a focal "figure" from a background "ground";
this is one of the original Gestalt relationships.
https://www.nngroup.com/videos/figure-ground-gestalt/ **[PRACTICE]**

**Why it works.** Vision is built to segment scenes into objects against backgrounds;
a design that gives no clear figure forces the viewer to do that segmentation work
themselves. On a slide, a filled card surface *is* the figure/ground device — a
filled card lifts its content off the canvas as a distinct figure.

**What follows for the designer.** Use a card surface (a fill or a subtle contrast
against the canvas) to establish figure/ground. A single claim needs a resolved
figure — a centred, self-contained element — not a bare text block floating on an
unbalanced empty half.

**The failure mode.** A half-width text block on an empty half of the canvas: there
is no figure/ground resolution, just an unbalanced ground, and the slide reads as
broken.

**How to check it.** Squint at the slide. Does one region clearly read as the figure?
If the content and the empty space compete with no clear foreground, figure/ground
is unresolved.

---

### 7.6 Optical versus mathematical centring

**The principle.** Mathematical (geometric) centring often looks wrong because
perceived visual mass differs from the bounding box. The optical centre of a
rectangle sits **slightly above** the geometric centre, so a mathematically centred
title looks low.
https://graphicdesign.stackexchange.com/questions/49527/ ,
https://railsdesigner.com/mathematical-optical-alignment-design/ **[PRACTICE]**

**Why it works.** The eye weights the upper portion of a frame differently and
judges "centred" by perceived mass, not by pixel midpoint. Non-rectangular shapes
(triangles, play icons) have their mass off-centre, so they need nudging toward their
point. https://pixso.net/articles/alignment-icon/ **[PRACTICE]**

**What follows for the designer.** A single centred claim should sit at or slightly
*above* the geometric 50% line. Icons inside cards need optical, not box, centring (a
right-pointing arrow nudged left of centre). A small upward optical offset can be
baked into centred hero/statement text as a token rather than left to chance.

**The failure mode.** A mathematically centred title that reads as *sinking* — it
looks low even though it is technically centred, and the slide feels
bottom-heavy.

**How to check it.** Does centred text look like it is drifting down? If so, nudge it
up. **[ASSUMPTION — the commonly cited ~2–3% of height offset (labelled U-03-2 in the
source) is a craft heuristic, not a measured constant.]**

---

### 7.7 Margin and gutter proportion

**The principle.** Use one consistent gutter across a layout, and make outer margins
*exceed* inter-element gutters.

**Why it works.** A single consistent gutter is what makes a grid read as one tray
rather than scattered boxes — "mixed gaps … and the effect dies."
https://superdesign.dev/styles/bento-grid Margins exceeding gutters follows directly
from proximity (§7.9.1): the *biggest* gap should be at the boundary, so the frame
reads as the outer container. If the outer margin equals the inter-card gap, cards
appear to touch the edge and the composition loses its ground. **[PRACTICE]**

**What follows for the designer.** Pick one gutter value and use it everywhere within
a layout; set the slide's outer padding larger than that gutter.

**The failure mode.** Cards that appear to bleed to the slide edge because the margin
equals the gutter — the composition has no frame and feels cramped.

**How to check it.** Measure the outer margin against the inter-card gap. Is the
margin clearly larger? Are all internal gutters the same value? If not, fix both.

---

### 7.8 Active versus passive whitespace, and why negative space reads as emphasis

**The principle.** *Passive* (micro) whitespace is the incidental space between
letters, lines, and elements that aids legibility; *active* (macro) whitespace is
*deliberately placed* to create emphasis and direct attention.
https://www.interaction-design.org/literature/topics/white-space **[PRACTICE]**

**Why it works.** Negative space reads as confidence and emphasis because isolating
an element makes it the figure (§7.5) and removes competing figures — salience is
relative, so quieting everything around an element *is* how you make it dominant.
"Whitespace is to be regarded as an active element, not a passive background"
(Müller-Brockmann). **[PRACTICE]**

**What follows for the designer.** Spend active whitespace deliberately: a single
claim earns maximum surrounding emptiness, because the emptiness *is* the emphasis.
Density is a dial, not a bug to minimise uniformly — low for claims, higher for
evidence (§7.10).

**The failure mode.** A slide that fills every region "so it doesn't look empty,"
drowning the one important element among competitors and destroying the emphasis
that space would have created.

**How to check it.** Is there one element the emptiness is pointing at? If the space
is evenly distributed with no focal beneficiary, it is passive, not active.

---

### 7.9 The Gestalt principles as concrete card-grid rules

Gestalt grouping principles are *the mechanism by which layout directs the eye* —
they were derived by Gestalt psychologists and are foundational to UI.
https://www.nngroup.com/articles/gestalt-proximity/ Each is translated below into a
testable rule about gaps, borders, alignment, and grouping.

#### 7.9.1 Proximity — the gap-ratio rule (the most important one)

**The principle.** "Items close together are perceived as part of the same group;
elements spaced apart are perceived as separate," and proximity "can overpower
competing visual cues such as similarity of colour or shape."
https://www.nngroup.com/articles/gestalt-proximity/ **[PRACTICE]**

**Why it works.** The visual system groups by distance before it groups by anything
else, so relative gaps encode grouping whether or not the author intended them to.

**What follows for the designer — the gap-ratio rule.** For two cards to read as
*one* group, the gap between them must be clearly smaller than the gap to the next
group. Practically, the **between-group gap should be ≥1.5–2× the within-group gap.**
If all gaps are equal, everything reads as one flat set (which is exactly what an
equal-cell tiled arrangement intends). The moment a layout wants subgroups (a wide
card with two detail cards belonging to it), the wide→detail gap must be tighter than
the outer margin, or the belonging is lost. Encode a `gap-within` / `gap-between`
token pair with an enforced ratio ≥1.5. **[PRACTICE]**

**The failure mode.** Two cards meant to belong together sit as far apart as they sit
from everything else, so the "belonging" is invisible and the group reads as four
loose items instead of "one thing plus its two details."

**How to check it.** Measure the gap within an intended group against the gap to the
next group. Is the between-group gap at least 1.5× the within-group gap? If gaps are
equal, no subgroup will be perceived.

#### 7.9.2 Common region — the border/fill rule

**The principle.** "When objects appear inside the same enclosed area, we perceive
them as related, even if they differ in shape or size" — and common region can
*override* proximity.
https://uxcel.com/blog/law-of-the-common-region-in-ux ,
https://www.nngroup.com/articles/common-region/ **[PRACTICE]**

**Why it works.** An enclosing border or shared background is a stronger grouping cue
than distance, so a region groups items even across a gap.

**What follows for the designer.** A filled card *is* a common region; everything
inside it is one group regardless of internal spacing. Therefore: do **not** put two
unrelated ideas in one card, and **do** use a card boundary (not just proximity) when
a group must survive portrait reflow that changes gaps (Chapter 8). Cards reflow more
reliably than proximity-only groupings because the region travels with the content.

**The failure mode.** Two unrelated ideas crammed into one card — the enclosure
asserts they belong together when they do not.

**How to check it.** For each card, can you write one label that honestly covers
everything in it? If not, the common region is making a false grouping claim.

#### 7.9.3 Similarity

**The principle.** Elements sharing colour, shape, size, or type read as a group or
kind. **[PRACTICE]**

**Why it works.** The visual system treats visually alike things as the same kind, so
sameness *is* a claim of equivalence.

**What follows for the designer.** All peer cards in an equal-cell arrangement must
share size and style — that sameness *is* the claim "these are the same kind of
thing." Breaking similarity (one card a different colour) is a strong focal signal;
spend it deliberately (the "after" card in a comparison, or the recommended option).

**The failure mode.** Peer items rendered in slightly different styles for no reason,
so the eye reads a distinction the content does not intend.

**How to check it.** Are all genuine peers visually identical except in their text?
Is every visual difference intentional and meaningful?

#### 7.9.4 Continuation

**The principle.** The eye follows lines and aligned edges.
https://www.nngroup.com/videos/continuation-gestalt/ **[PRACTICE]**

**Why it works.** Aligned edges create an implied line the eye travels along, which
is why ragged card tops read as broken and why a rail makes the eye move left→right =
"next."

**What follows for the designer.** Enforce a shared top baseline and left edge per
row. Sequence layouts (a process rail) exploit continuation: an aligned sequence
makes the eye travel in reading order = "next step."

**The failure mode.** Ragged card tops in a row, so the implied horizontal line is
broken and the row reads as scattered rather than as a set.

**How to check it.** Do the cards in each row share a top edge and a left edge? Any
ragged edge is a broken implied line.

#### 7.9.5 Closure

**The principle.** The mind completes implied shapes and tries to close incomplete
ones. **[PRACTICE]**

**Why it works.** An incomplete grid (5 cards in a 6-cell field) leaves a hole the
eye tries to close, drawing attention to the emptiness.

**What follows for the designer.** Either fill the hole (promote a cell to span the
gap) or make the emptiness intentional. This is the real problem behind odd card
counts (Chapter 8).

**The failure mode.** A dangling empty cell in an otherwise full grid — the eye keeps
returning to the hole instead of the content.

**How to check it.** Is there a visible gap where the grid "should" continue? If so,
either span a cell into it or rebalance the count.

#### 7.9.6 Connectedness

**The principle.** Explicit connectors (lines, arrows) group more strongly than
proximity or similarity. **[PRACTICE]**

**Why it works.** A drawn connector is an unambiguous assertion of relationship — the
strongest grouping cue available.

**What follows for the designer.** Only draw a connector when you mean a
relationship. A process arrow claims sequence/causation (Chapter 8); a connector
between cards with no real relationship is a wrong claim.

**The failure mode.** Decorative arrows or lines between elements that have no actual
relationship, asserting a connection the content does not support.

**How to check it.** For every connector, name the relationship it asserts. If you
cannot, delete it.

#### 7.9.7 Figure/ground (as a grouping rule)

Covered as composition in §7.5; as a grouping rule it yields a concrete check: every
text-over-media cell needs a scrim (e.g. a dark gradient) and a per-cell 4.5:1
contrast check (WCAG 1.4.3) — the single most common media-card accessibility
failure. https://superdesign.dev/styles/bento-grid A contrast gate should accompany
the overflow gate on any media-backed card. **[EVIDENCE — WCAG 1.4.3 is a normative
spec.]**

---

### 7.10 Measurable density metrics

**The principle.** "Weight" and "density" can be made computable, not just felt.

**Why it matters.** If density is measurable, it can be enforced, and it can be tuned
to a slide's job rather than minimised uniformly.

**What follows for the designer — three computable proxies.**

- **Words per slide / per card.** A hard cap per card (e.g. one short heading + one
  short supporting line, *no paragraphs*) is a defensible default.
  https://superdesign.dev/styles/bento-grid **[PRACTICE]**
- **Element count.** Card-count ranges *are* a density metric; a ">5 cards → split"
  rule is exactly an element-count cap. **[PRACTICE]**
- **Ink coverage / signal-to-noise.** Maximise the share of pixels carrying meaning;
  a dense evidence slide legitimately runs a higher ink ratio than a single-claim
  slide. https://www.nngroup.com/articles/signal-noise-ratio/ **[PRACTICE]**

**Density should track the slide's narrative job — the core mapping.** A
single-claim slide should have near-zero density and maximum active whitespace (the
emptiness is the emphasis); a dense evidence slide *honestly* runs higher density
(the point is "here is the weight of evidence") but must still resolve into groups
(§7.9) or density becomes noise. The strongest backing is Mayer's **coherence
principle**: "people learn more deeply when extraneous material is excluded,"
supported in **23 of 23 experiments, median effect size d≈0.86** (very large). Empty
space is space *not* spent on extraneous content.
https://www.researchgate.net/publication/262915119_ ,
https://www.nngroup.com/articles/signal-noise-ratio/ **[EVIDENCE]**

**The failure mode.** Uniform medium density across the whole deck — claims that are
too busy to land and evidence slides that are too sparse to carry their weight.

**How to check it.** For each slide, name its job (claim or evidence). Claims should
be sparse; evidence slides may be dense but must resolve into visible groups.

---

### 7.11 Debunked, explicitly, with evidence

Four widely repeated "principles" are folklore in this context. Each is named, its
origin traced, and its evidence-based replacement stated — because a learner needs to
know *why* to discard them, not just that they are out of fashion.

#### 7.11.1 Golden ratio — [MYTH]

**The claim.** That the constant 1.618 governs pleasing proportions in art,
architecture, faces, and rectangles.

**Why it is a myth.** The mathematical constant is real; its claimed appearance in
aesthetics is "false or seriously misleading" and stems from imprecise measurement —
pick enough lengths and you can find 1.618 anywhere (Markowsky,
https://www.researchgate.net/publication/322814290_Misconceptions_about_the_Golden_Ratio;
https://patterns.architexturez.net/doc/az-cf-172604). A **2024 randomized controlled
trial** found the golden ratio "showed no effect … and remains a myth"
(https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0303032). A 2024
review found "no convincing evidence that the golden ratio is linked to idealized …
proportions or facial beauty"
(https://link.springer.com/article/10.1186/s40902-024-00411-2). Popularised as design
gospel; a Fast Company piece even titled it "Design's Biggest Myth" (2015). **[MYTH —
origin: centuries of imprecise measurement and popular design writing; refuted by
RCT and review.]**

**Evidence-based replacement.** Visual hierarchy through **size, weight, and space**
(§7.4, §7.10) and **optical balance** (§7.6) do the job golden-ratio talk gestures
at, and they are substantiated. Put the heaviest element in the biggest slot; that is
the real version of "pleasing proportion."

#### 7.11.2 Rule of thirds — [MYTH / weak]

**The claim.** That placing focal points on the lines/intersections of a 3×3 grid
produces better composition.

**Why it is weak.** The one empirical test found aesthetic ratings correlated only
*weakly* with subjective rule-of-thirds scores and **not at all** with calculated
rule-of-thirds values.
https://www.researchgate.net/publication/259620557_Evaluating_the_Rule_of_Thirds_in_Photographs_and_Paintings
It traces to J.T. Smith (1797) as a painting heuristic, not a law.
https://www.onlandscape.co.uk/2011/01/rule-of-thirds/ **[MYTH — origin: Smith 1797;
essentially folklore-with-a-grain, no empirical support for the calculated rule.]**

**Evidence-based replacement.** Deliberate visual hierarchy and Gestalt grouping
place focal points where the *content* demands, not where a fixed grid dictates. A
strong hierarchy overrides any generic placement rule.

#### 7.11.3 Z-pattern and the Gutenberg diagram — [MYTH]

**The claim.** That the eye reliably scans a page in a Z (or, per Gutenberg, along a
diagonal from top-left to bottom-right with weak "fallow" corners), so elements
should be placed along that path.

**Why it is a myth.** Eye-tracking shows F-shaped and "layer-cake" scanning on real
content, not a Z; no controlled study confirms a Z-scan on real content, and a strong
hierarchy overrides scan paths anyway. The one usable residue — "top-left is a
tiebreak for left-to-right readers" — is too weak to build on. **[MYTH — origin:
design lore generalising from sparse layouts; contradicted by NN/g eye-tracking.]**

**Evidence-based replacement.** Build a strong visual hierarchy: the eye goes to the
heaviest element first regardless of position (Chapter 4). Do not place a key element
"on the Z"; make it dominant and it will be found.

#### 7.11.4 "Whitespace improves comprehension by 20%" — [MYTH]

**The claim.** A specific figure — often "whitespace increases comprehension by up to
20%" — cited to justify empty space.

**Why it is a myth.** The figure traces to Lin (2004) on *margins and leading in
reading*, not slide whitespace, and the "20%" is passed around without a clean
citation. https://artversion.com/blog/ **[MYTH — origin: a reading-margins study
misapplied to slides; the percentage is uncited.]**

**Evidence-based replacement.** The *real, citable* result is Mayer's **coherence
principle** (median d≈0.86, 23/23 studies; §7.10), plus NN/g's qualitative finding
that whitespace improves comprehension and reduces cognitive load.
https://www.nngroup.com/articles/signal-noise-ratio/ Cite coherence, not the 20%.
**[EVIDENCE for the replacement.]**

---

## Chapter 8 — A taxonomy of arrangements, and what each arrangement CLAIMS

This is the practical heart of Part B. It answers two questions: *which*
arrangements have earned their place, and *what each one asserts about the content*.
The second question is the more important, and the chapter's central argument:
**shape is a claim.** Choosing the wrong arrangement is not an aesthetic slip — it is
a false statement about the content.

### 8.1 How the taxonomy was derived — recurrence as evidence

**The principle.** The arrangements worth having are the ones that recur across many
independent presentation systems. Recurrence across products that did not copy each
other is decent evidence an arrangement earns its place.

**Why recurrence is evidence.** The taxonomy below was built by inventorying the
actual layout/shape sets of independent products — PowerPoint SmartArt, Beautiful.ai,
Slidev, Marp, reveal.js, the bento web pattern, and card systems like Gamma — and
consolidating. When SmartArt (used by hundreds of millions), a content-type-mapped
competitor (Beautiful.ai), and a developer deck tool (Slidev) *all independently*
ship "comparison," "big number," and "process," that convergence is far stronger
evidence than any single vendor's taste. Conversely, a shape that appears in only one
system may be that vendor's idiosyncrasy. **[PRACTICE — the inventory is documented;
"recurrence = earned place" is a reasoned inference.]**

The inventoried primary sources:

- **PowerPoint SmartArt** — an explicit content-shape→diagram mapping in seven
  categories: List (grouping without order), Process (sequence; the largest
  category), Cycle (recurrence), Hierarchy (tree/org), Relationship (Venn, balance,
  target, radial), Matrix (two axes / quadrants), Pyramid (proportion). Microsoft's
  own descriptions tie content shape to diagram type — e.g. Basic Cycle "emphasises
  the stages rather than the connecting arrows," Grid Matrix "emphasises the
  individual components rather than the whole." That is the "shape = claim" thesis,
  shipped as product copy since 2007.
  https://support.microsoft.com/en-au/office/all-smartart-graphics-described-cf1a453b-de4a-4217-8da0-1aff97bb32cd
- **Beautiful.ai Smart Slides** — 300+ layouts that auto-adjust, in six categories:
  Data & Chart, Impact, Big Number, Comparison, People & Team, Diagrams & Timeline.
  The closest analogue to a content-type→layout mapping where layout is a constraint,
  not a canvas. https://www.beautiful.ai/smart-slides ,
  https://www.beautiful.ai/presentations
- **Slidev** built-in layouts: `default, cover, center, two-cols, two-cols-header,
  image, image-left/right, iframe, quote, section, statement, fact, full, intro,
  end, none`. https://sli.dev/builtin/layouts
- **Marp** — theme-driven; confirms the "few primitives, styled by theme" model.
- **reveal.js** — no semantic catalogue; its contribution is *sequence/fragment
  reveal* (progressive disclosure), not arrangement.
- **Gamma / Tome / Canva** — card/block systems; Gamma's "card-based layout … each
  card acts like a flexible slide" is strong independent convergence on the **card as
  the atomic unit.** https://gamma.app/explore/content/guides/how-gamma-maps-content-directly-to-slides-using-its-card-system
  (Tome shut its AI presentation product April 2025 — historical.)
- **The bento marketing pattern** (Apple/Vercel/Linear/Stripe/Raycast) — §8.4.

**Reading the recurrence.** The archetypes present in *every* general system are
title, statement/stat, grid/tiles, comparison, process, and media+caption. The
archetypes present in the two richest *semantic* systems (SmartArt + Beautiful.ai)
but weaker elsewhere are cycle, hierarchy/tree, matrix, timeline, and people.
Recurrence across SmartArt plus a content-mapped competitor is strong evidence that
**cycle and hierarchy earn their place**, and that **matrix earns a reconsideration.**

---

### 8.2 The central argument: SHAPE IS A CLAIM

**The principle, stated as plainly as possible.** Every arrangement makes a
proposition about the content, independent of the words in it. A cycle asserts
recurrence. An arrow asserts causation or sequence. A matrix asserts two independent
axes. A tapering shape asserts narrowing. Side-by-side asserts comparability on a
shared scale. A hub asserts centrality. **Therefore choosing the wrong shape is not
an aesthetic mistake — it is a false statement about the content.**

**Why it is true.** The arrangement is read in roughly 100 ms, before a single word
(the gist of a scene registers pre-attentively). So the shape delivers its
proposition *first*, and if that proposition contradicts the words, the viewer parses
a claim, checks it against the text, finds a mismatch, and re-reads. SmartArt's own
product copy confirms designers have always known this — Microsoft warns which shape
emphasises what. Causation-via-arrows is a documented convention across biology,
chemistry, and causal-inference literature: "an arrow from object A to object B
depicts that a change of A causes a change of B."
https://www.researchgate.net/publication/263235965_Why_do_Biologists_Use_so_Many_Diagrams ,
https://en.wikipedia.org/wiki/Causal_notation **[PRACTICE, with the arrow=causation
convention documented across fields.]**

**Each shape, the claim it makes, and the lie it tells when misused:**

| Shape | The proposition it asserts | The lie it tells when misused |
|---|---|---|
| **Arrow / sequence** | order, and often causation: "A → B" means B follows or is caused by A | implies causation or order where there is only an unordered list |
| **Cycle / loop** | recurrence, no terminus: "this repeats forever" | a straight rail asserts an end that does not exist |
| **Tree / hierarchy** | parent→child, containment of authority: "B reports to A" | a flat grid denies the levels; a wrong tree implies false authority |
| **Matrix (two axes)** | two *independent* dimensions: position on X and Y both mean something | using it for one dimension, or for correlated axes, fakes independence |
| **Venn / overlap** | shared membership: "these sets intersect" | overlap drawn where the sets are actually disjoint |
| **Pyramid** | proportion or foundation: "base supports apex / bigger at bottom" | asserts proportion or priority that is not in the data |
| **Radial / hub** | relationship to a centre: "all relate to X" | implies a centre where the items are peers |
| **Timeline** | position on a time axis: "when" | even spacing implies even time intervals, which is often false |
| **Nested containment (target)** | one thing inside another: "B ⊂ A" | implies containment instead of mere association |
| **Side-by-side (comparison)** | comparability on a shared scale: "A and B measured the same way" | false symmetry — a strawman "before" measured differently from the "after" |

The practical upshot: before choosing an arrangement, state the proposition the
content actually makes, then pick the shape whose claim *matches* it. If no shape
matches — if the items are independent peers with no structural relationship — use
plain peer cards and let a diagram *not* invent a relationship that is not there
(§8.6).

---

### 8.3 Each archetype specified

For each: the **content shape** it serves, **how many elements** it holds well, how
it **expresses hierarchy** (or deliberately refuses to), its **portrait/vertical
reflow** behaviour, and its **characteristic failure mode.** Judged against a fixed
canvas.

#### Title / section opener
- **Content shape:** a topic name, optional single visual. **Holds:** 0–1 supporting
  element. **Hierarchy:** the title *is* the whole hierarchy; a marker (a pill or
  kicker) signals it as an opener.
- **Portrait reflow:** trivial — stack title over visual. The best-behaved layout in
  9:16.
- **Failure mode:** it becomes a content slide by accident (cards creep in); keep it
  a punctuation mark, not a dumping ground.

#### Single statement
- **Content shape:** one claim. **Holds:** 0 cards. **Hierarchy:** refuses internal
  hierarchy — the claim carries everything; density near zero, and the whitespace
  *is* the emphasis (§7.8).
- **Portrait reflow:** trivial; re-centre optically (§7.6).
- **Failure mode:** rendered as half-width text on an empty half (no figure/ground
  resolution, §7.5); or a "statement" that is really two claims.

#### Big number / stat
- **Content shape:** one headline metric + 2–4 supporting details. **Holds:** 2–4.
  **Hierarchy:** extreme — the number dwarfs its support. This is weight→layout done
  right: the most important thing is physically the biggest.
- **Portrait reflow:** number on top, details stacked below. Reflows cleanly.
- **Failure mode:** multiple competing big numbers (should be a tiled set of stats,
  or split); or a number with no unit/context ("42" claims nothing).

#### Grid / tiles (peers)
- **Content shape:** peer items of equal weight, short labels. **Holds:** 3–4.
  **Hierarchy:** *deliberately none* — equal size + equal gaps = "same kind"
  (similarity + equal proximity, §7.9.1/§7.9.3). Choosing it for unequal items is a
  wrong claim.
- **Portrait reflow:** 3–4 across → single-column stack; order becomes reading order,
  so ensure the source order equals the intended order.
- **Failure mode:** prose in an evenly tiled row overflows the shortest cell first;
  tiles want labels, not sentences.

#### Asymmetric emphasis grid
- **Content shape:** one dominant idea + supporting. **Holds:** 3–4. **Hierarchy:**
  **size encodes priority** — the whole point (§8.4). The dominant slot is
  positional; the heaviest element must fill it.
- **Portrait reflow:** the hero cell goes full-width on top, supporting cells stack;
  the asymmetry survives as "big thing first, then details."
- **Failure mode:** equal-weight cards in an asymmetric grid — the size difference
  lies about importance (the "equal cells = not a bento" trap, §8.4). Then it should
  be a tiled set.

#### Comparison / 2-up
- **Content shape:** exactly two contrasted things on the same scale. **Holds:** 2.
  **Hierarchy:** symmetric by default (A vs B as equals); break similarity to signal
  a winner (§7.9.3). SmartArt's *Balance* variant even tips toward the heavier side.
- **Portrait reflow:** **this is the hard one.** Side-by-side has no honest vertical
  form (§8.5); it must become stacked before→after, with the contrast carried by
  sequence and a divider, not adjacency.
- **Failure mode:** false symmetry — a strawman "before" measured differently from
  the "after," which kills credibility.

#### Process / sequence
- **Content shape:** ordered steps; optionally a hub + downstream. **Holds:** 3–5
  steps, 3–4 phases. **Hierarchy:** order is the hierarchy; arrows/rail claim
  sequence and often causation (§8.2). Continuation (§7.9.4) carries the eye.
- **Portrait reflow:** horizontal rail → vertical rail (top→bottom); arrows rotate
  90°. Works, but 5 steps get cramped in 9:16 — cap lower in portrait.
- **Failure mode:** using a straight sequence for something that actually loops — a
  wrong claim of "has an end." This is the gap that argues for a real cycle layout
  (§8.7).

#### Cycle / loop
- **Content shape:** stages that recur with no terminus (PDCA, feedback loop,
  retention loop). **Holds:** 3–6 stages. **Hierarchy:** usually none among stages;
  emphasis optional via a hub (radial).
- **Portrait reflow:** a ring is hard in 9:16; degrade to a vertical list with a
  *return arrow* from last→first to preserve the loop claim.
- **Failure mode:** rendering a cycle as a straight rail *denies the recurrence* — a
  PDCA loop drawn straight asserts it ends (§8.2, §8.7).

#### Hierarchy / tree
- **Content shape:** parent→child, org/reporting, decision tree. **Holds:** 1 root +
  ~2–6 children per level. **Hierarchy:** it *is* the structure; depth = level.
- **Portrait reflow:** top-down trees get very tall; left→right trees reflow worse.
  The honest vertical form is an indented list with connectors.
- **Failure mode:** faking hierarchy with a flat grid loses the parent/child claim.

#### Matrix / quadrants
- **Content shape:** items placed on **two independent axes.** **Holds:** 4 quadrants
  (or a scatter). **Hierarchy:** refuses ranking; asserts two orthogonal dimensions
  instead.
- **Portrait reflow:** **genuinely breaks** for a *continuous* axis-labelled matrix —
  rotating the axes changes their meaning, and there is no interpolation-safe reflow.
  A **2×2 with *categorical* axes** (urgent/not × important/not) is just four labelled
  cells and reflows to a stack without lying, because categorical axes have no
  interpolation to destroy.
- **Failure mode:** using it for one dimension, or for correlated axes, fakes
  independence. Matrix is the *only* shape that can honestly claim two independent
  axes (§8.2) — which is exactly why it should not be faked with a grid.

#### Media + caption
- **Content shape:** an image/screenshot + its meaning. **Holds:** 1 image + short
  caption. **Hierarchy:** image dominant, caption subordinate (picture-superiority,
  §8.6).
- **Portrait reflow:** image top, caption below — the native vertical form.
- **Failure mode:** the caption narrates the UI ("click the blue button") instead of
  its meaning ("checkout is now one tap").

#### Radial / hub-and-spoke
- **Content shape:** relationship of parts to a centre. **Holds:** 1 hub + 3–6 spokes.
  **Hierarchy:** centre dominant. **Portrait reflow:** hub on top, spokes stack —
  loses the "radiates from" reading; degrade to hub + indented children.
- **Failure mode:** implying sequence (arrows between spokes) when the claim is only
  "related to the centre."

---

### 8.4 The bento grid in depth

**Origin.** Named for the Japanese compartmentalised lunchbox — one tray, differently
sized compartments, each holding one thing. Popularised for UI by **Apple's product
pages and keynote slides around 2023**; now the default look for SaaS feature
sections. https://superdesign.dev/styles/bento-grid ,
https://www.banani.co/definitions/bento-grid Note the direct slide lineage: Apple
*keynote slides* are a primary origin, so bento is native to presentations, not just
web. **[PRACTICE]**

**What makes a bento read as intentional rather than random — the defining rule.**
"**Equal cells = not a bento.** If every cell is the same size you have a plain card
grid wearing a trendy name … The pattern only earns its keep when size encodes
priority." https://superdesign.dev/styles/bento-grid This *is* the weight→layout
thesis: **cell size must map to information priority.** Bento is distinguished from
*masonry* (variable-height packed columns, nothing aligns — "a feed") by being
*curated hierarchy on a fixed grid where rows stay aligned.* **[PRACTICE]**

**Cell ratio conventions (verified recipe).**
https://superdesign.dev/styles/bento-grid
- Four columns (`repeat(4, minmax(0,1fr))`) give "span variety without chaos";
  `minmax(0,1fr)` stops long tokens blowing out a track.
- **Fixed** row units (`grid-auto-rows: 180px`) — "spans only feel bento when the row
  unit is fixed; auto rows make 2×2 cells collapse unevenly."
- **One** consistent gap everywhere — mixed gaps "and the effect dies" (proximity,
  §7.9.1).
- Large corner radius (20–28px) — "the large radius IS the signature; under 16px it
  reads as a plain card grid."
- Hierarchy convention: **exactly one 2×2 hero cell**, one or two 2×1 wide cells,
  rest 1×1, **max ~8 cells total.** Per cell: one 17–21px semibold heading + one
  14–15px 65%-opacity line, **no paragraphs.**

**Odd-count handling.** Odd counts are handled by *spanning*, not by adding filler: an
odd cell is promoted to 2×1 or 2×2 so the grid stays full, and dense backfill fills
the rest. This closes the hole the eye wants closed (closure, §7.9.5) and lets one
bento absorb 3–8 items by varying spans rather than switching layouts. **[PRACTICE]**

**Observed rules from real implementations (verified live per source).**
- **Apple (MacBook Air "highlights"):** five mixed-size rounded tiles, exactly one
  idea per cell, motion rationed to hero tiles only.
- **Raycast:** ~a dozen feature cells at mixed spans — "breadth without a wall of
  text."
- **Amie:** cell size = priority (calendar hero big, chat actions small).
- **GitHub Copilot:** three mixed-size cards; "the asymmetry tells you which entry
  point GitHub wants you to pick first" — asymmetry as a directive.
- **Correction to folklore:** the source verified that **Linear, Vercel, Notion,
  Cursor, and Framer do *not* currently run bento homepages** despite being cited in
  listicles. Do not cite them as bento exemplars; cite Apple/Raycast/Amie/Copilot.
  https://superdesign.dev/styles/bento-grid **[EVIDENCE — the source verified live.]**

**When bento is wrong.** "It fights long-form content … If you find yourself
truncating sentences to fit cells, the layout is winning and the message is losing."
It also dies on mobile if spans are not reset. Both caveats reinforce the same craft
rule: cards forbid paragraphs, and a "don't truncate to fit" gate is essential.
**[PRACTICE]**

---

### 8.5 Vertical and square formats as first-class citizens

**The principle.** Vertical (9:16) is not a reflow of a landscape slide — it is a
*different argument*. Rendering a landscape layout at a mobile viewport "does not
shrink the story, it changes it."

**Why it is true.** A tall, narrow frame has **width for one column, height for many
rows.** Side-by-side comparison needs width it does not have; stacking and sequential
reveal need height it has in abundance. The cross-format editing literature states the
constraint precisely: a vertical crop "does not need to preserve every pixel … it does
need to preserve the *relationship* between setup and payoff"; if the crop removes the
element that explains the point, "the edit may look polished but stop making sense."
https://www.capcut.com/create/vertical-video-meme-editing-mobile-first-platforms
Vertical is now dominant for social consumption — cited ~94% of social video views on
mobile in portrait. https://blog.picassoia.com/how-to-use-veo-3-1-for-vertical-videos
**[PRACTICE, with the ~94% figure cited to the source.]**

**What follows for the designer.** In vertical, favour **stacks and sequential
reveal** over side-by-side. Tag each layout with a *portrait-fidelity* class:
- **native** — statement, hero, big-number, media+caption, any single-column stack;
- **reflows** — bento/tiled/process (→ vertical rail);
- **changes-argument** — comparison (→ stacked before→after), any matrix.

**Which landscape arrangements have NO honest vertical equivalent — stated sharply.**
This matters a great deal:
- **Side-by-side comparison** has *no honest 9:16 form.* It must become a **stacked
  before→after** where sequence + a divider carry the contrast. In a *video* this is
  often *better* (reveal "before," then "after" — sequential reveal suits the medium);
  as a *static portrait slide* it is weaker, because the eye cannot hold both at once.
- **Matrix / two-axis** has *no honest vertical form* — rotating the axes changes
  their meaning (unless the axes are categorical, in which case it degrades to a stack
  of labelled cells; §8.3).
- **Wide process/timeline (5 steps)** survives only by rotating to a vertical rail and
  usually shedding steps; cap the step count lower in portrait.
- **Radial/hub-and-spoke** loses "radiates from centre"; degrade to hub + list.

Natively vertical: statement, hero, stat, media+caption, and any single-column stack.
**The actionable rule:** warn the author when a portrait render of a
*changes-argument* layout will alter the claim — a comparison silently restacked has
made a different argument than the author wrote. **[PRACTICE]**

**Square (1:1) and 4:5.** Between the two: fits more than 9:16 across but far less
than 16:9. Treat as a mild 16:9 — favours 2-up at most, single focal element ideally.
The same per-aspect thinking that governs caption sizing should extend to *max element
count* (e.g. a bento caps at ~8 in 16:9, ~4 in 1:1, ~3 stacked in 9:16). **[PRACTICE]**

**How to check it.** For any vertical render, ask: does the stacked version still make
the *same claim* the landscape version made? If a side-by-side became a stack, is the
comparability still honest, or did it quietly become a sequence?

---

### 8.6 Diagrammatic layouts — when a diagram beats prose

**The principle.** A diagram beats prose cards when the *relationship between items*
is the point; prose cards are honest when the items are independent peers.

**Why it is true.** People learn better from words + graphics than from words alone
(Mayer's multimedia principle, dual-channel processing).
https://link.springer.com/article/10.1007/s10648-023-09842-1/fulltext.html A diagram
externalises a *structure* — sequence, causation, overlap, containment, proportion,
two-axis position — that prose would force the reader to reconstruct. But if the items
have no structural relationship, a diagram *invents* one that is not there, which is
the shape-is-a-claim lie (§8.2). **[EVIDENCE for multimedia; PRACTICE for the
diagram-vs-prose boundary.]**

**What follows for the designer — the diagram family and what each is for.** Each is
specified in §8.3; the selection rule is: name the relationship, then pick the shape
whose claim matches:
- **flow / process** — steps in order, often causation;
- **cycle** — recurrence with no end;
- **hierarchy / tree** — parent→child;
- **matrix** — two independent axes;
- **timeline** — position on a time axis;
- **layered stack** — levels built on each other (a foundation claim);
- **hub-and-spoke** — relationship to a centre;
- **nested containment** — one thing inside another;
- **comparison table** — every row comparable across every column.

**The comparison table specifically.** A table asserts that every row is comparable
across every column — a **matrix of one categorical axis (items) × attributes.** It
beats prose when readers need to *look up* a cell ("does plan B include X?"). It is
the honest form of feature comparison; a 2-up comparison is its degenerate 2-item
form. For **≥3 compared items with ≥3 attributes, cards cannot carry it and a table is
the correct shape.** (Tables stress an overflow gate hard, which is why many card-only
systems avoid them — a reasonable boundary, but name it so authors know cards are the
wrong tool there rather than forcing content into a tiled grid.) **[PRACTICE]**

**The failure mode.** Two opposite errors: (1) prose cards for content that is really
a sequence or a hierarchy, forcing the reader to reconstruct the structure; (2) a
diagram imposed on independent peers, asserting a relationship that does not exist.

**How to check it.** Ask: is the *relationship between the items* the point? If yes,
diagram — and pick the shape whose claim matches the relationship. If the items are
independent peers, use plain cards and let no diagram invent a false relationship.

---

### 8.7 The consequence: an honest loop is often missing

**The principle.** A catalogue built only from process/sequence and a straight
"lifecycle" rail can assert "has an end" but cannot honestly assert "recurs."

**Why it matters.** A straight rail drawn for a genuine cycle (PDCA, a feedback loop,
a retention loop) **asserts a terminus that contradicts the content** (§8.2). SmartArt
separates Process (has an end) from Cycle (recurs) for exactly this reason, and that
separation recurs in Beautiful.ai's Diagrams category — cross-system evidence that the
cycle earns its place (§8.1). **[PRACTICE]**

**What follows for the designer.** When content recurs, use a shape that closes the
loop (a ring, or in portrait a vertical list with a last→first return arrow). Do not
reach for the sequence rail by default; check first whether the last step feeds the
first.

**The failure mode.** A PDCA or "build → measure → learn" loop drawn as a straight
left-to-right rail — the arrangement quietly tells the viewer the process stops at the
last box.

**How to check it.** Does the last step connect back to the first? If it does and the
arrangement does not show that return, the shape is lying about a terminus.

---

## Chapter 9 — Sequencing across a whole presentation

### 9.0 Why a deck is more than a set of slides

A deck is not a bag of independent slides; it is a *sequence*, and the sequence
itself carries meaning. The viewer receives it linearly (§5.0), so the *relationship
between consecutive slides* — same arrangement or different, dense then sparse,
repeated then varied — is itself a signal the viewer reads whether or not the author
intended it. Sequencing is therefore a followability tool, not just deck hygiene. In
a video with hard cuts, sequencing becomes even more consequential, because the
medium reads a layout change as a scene change (§9.4). Every concept below is judged
against the one purpose: does this ordering help the viewer follow along?

---

### 9.1 Consistency versus monotony — meaningful variation

**The principle.** Repeat a layout to signal "same kind of content"; change it to
signal "new kind." Total uniformity is monotony; total variety is chaos. The
resolution is *meaningful* variation.

**Why it is true.** The grid's whole value is that the eye learns where to look
(§7.1); repetition extends that learning across slides, so a repeated arrangement
tells the viewer "keep reading the same way." This is the similarity principle
(§7.9.3) applied across time: same shape = same kind of thing. A change breaks the
pattern, and a broken pattern is a signal — used well, it marks a boundary; used
carelessly, it reads as an error. **[PRACTICE]**

**What follows for the designer.**
- **Repeat a layout for parallel content.** Three resolution beats each on the same
  process arrangement, or three peer stats each on the same big-number arrangement,
  tell the viewer "these are peers — keep the same reading strategy." The repetition
  *communicates* parallelism.
- **Change the layout for a section boundary.** Switching to a section-opener
  arrangement says "new topic." The change *is* the signal; a dedicated
  section/opener layout exists precisely to carry it.

**The failure mode.** Two opposite errors: consecutive *parallel* beats rendered in
*different* layouts (accidental discontinuity — the viewer thinks the content
changed kind when it did not), and different-*role* beats rendered in the *same*
layout (a missed section signal — the boundary is invisible).

**How to check it.** Walk the deck and, at each transition, ask: is this the same
*kind* of content as the previous slide? If yes, is the layout the same? If no, is
the layout different? A mismatch on either is an accidental signal.

---

### 9.2 Primacy, recency, and the mid-deck trough

**The principle.** The first and last slides carry the most memory weight; the middle
is the trough. Open strong and close on the same message.

**Why it is true.** Primacy and recency are well-established in memory: items at the
start and end of a sequence are recalled better than those in the middle. Applied to
a deck, the opener and the closer are the highest-leverage positions, and the
mid-deck is where attention and retention sag. **[ASSUMPTION — the serial-position
effect is a real, well-known memory finding, but the source reports state the deck
application as practice rather than citing a controlled study on slide ordering
specifically; treat the deck-level claim as PRACTICE resting on a real memory
effect.]**

**What follows for the designer.** Put the load-bearing message at the start (the
answer, for an executive deck) *and* echo it at the close (the recap or call to
action). Do not bury the single most important slide in the middle. Use the mid-deck
for supporting evidence, and use pacing (§9.3) to keep the trough from going flat.

**The failure mode.** The deck whose most important claim sits on slide 22 of 40,
where memory is weakest, with a weak opener and no closing echo — the point is made
where it is least likely to be retained.

**How to check it.** Where is the single most important slide? If it is neither near
the start nor the end, either move it or ensure it is echoed at the close.

---

### 9.3 Pacing — alternating dense and sparse

**The principle.** Alternate dense (evidence) slides with sparse (claim) slides so
the deck breathes.

**Why it is true.** Density should track a slide's narrative job (§7.10): claims are
sparse, evidence is dense. Alternating them *is* Duarte's sparkline expressed as a
density rhythm — valleys (dense "what is") against peaks (spacious "what could be")
(§5.3). A run of uniformly dense slides overloads working memory with no recovery; a
run of uniformly sparse slides carries no evidence. The alternation gives the viewer
a rhythm of load and release. **[PRACTICE]**

**What follows for the designer.** After a dense evidence slide, place a sparse claim
or section beat as breathing room. Group supporting points in threes where natural —
the ~4-chunk working-memory ceiling makes three a comfortable group (a real cognitive
limit, though "exactly three" is a rhetorical convention, not a law). **[PRACTICE,
with a real cognitive-limit basis.]**

**The failure mode.** A "wall of dense slides" stretch where every slide is a busy
evidence grid — the viewer never gets a beat to consolidate, and retention collapses
across the run.

**How to check it.** Mark each slide dense or sparse and read the pattern. Is there a
long unbroken run of dense slides? If so, insert breathing room.

---

### 9.4 How sequencing reads differently as a video with hard cuts

**The principle.** In a video with hard cuts, a repeated layout across a cut reads as
*continuity* ("same scene, next point"), and an abrupt layout change reads as a *new
beat or scene* — whether or not the author intended it.

**Why it is true.** A deck reader controls pace and can compare adjacent slides; a
video viewer cannot. So the layout transition is perceived through *continuity-editing*
grammar. https://en.wikipedia.org/wiki/Continuity_editing A repeated frame across a
cut reads as continuity; an abrupt change reads as the visual equivalent of a scene
change. This is *useful* — a cut from a dense grid to a single statement punctuates —
and *dangerous* — an unmotivated change reads as a jump cut, a discontinuity error.
Match-cut logic reinforces it: if two consecutive scenes share composition (the
dominant slot sits where the previous scene's focal point was), the cut feels
intentional and smooth. https://www.researchgate.net/publication/264699419_ The same
principle governs theme continuity: an unmotivated jump (light grid → dark terminal)
reads as a flash. **[PRACTICE, grounded in continuity-editing theory.]**

**What follows for the designer.** In video, make every layout change across a hard
cut *motivated* — it should mark a real beat boundary, because the medium will read
it as a scene change regardless. Keep parallel beats on a shared layout so the cuts
feel like one continuous argument. Where possible, align a slide's dominant slot to
the prior scene's focal point for a smooth match cut.

**The failure mode.** An unmotivated layout (or theme) change mid-argument that reads
as a scene break — the viewer feels a discontinuity where the argument was meant to
be continuous, and re-orients unnecessarily.

**How to check it.** For each cut in the video, ask: does the layout change here? If
yes, is there a real beat boundary justifying it? An unjustified change is a jump cut;
a missing change where the section actually turned is a missed scene signal.

---

### 9.5 Signposting devices — what measurably helps versus cargo cult

**The principle.** Some signposting devices measurably aid comprehension; others are
mechanical ritual with no support and sometimes a cost. They must be separated.

**Why it matters.** Signposting spends attention (chrome competes with content), so a
device that does not earn its keep is a net negative under the coherence principle
(extraneous material hurts; §7.10). Each device is judged on evidence.

**The devices, judged:**

- **Conceptual / throughline opener — helps.** An *advance organizer* — a
  higher-abstraction framing presented *before* the material — has theoretical
  standing (Ausubel) and *some* empirical support: it activates prior knowledge and
  reduces cognitive load for what follows.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC10130311/ ,
  https://us.sagepub.com/sites/default/files/upm-binaries/14256_Chapter13.pdf But the
  evidence is *mixed* — reviews note it "has not been adequately evaluated" and
  effects depend on the organizer being *conceptual scaffolding at a higher level of
  abstraction*, not a literal agenda. https://files.eric.ed.gov/fulltext/ED061554.pdf
  Mayer's pre-training principle (naming key concepts up front) supports a
  *vocabulary/throughline* opener. **[CONTESTED — strong in theory, "not adequately
  evaluated" in some reviews; net verdict: a conceptual opener helps, a literal one
  does not.]**

- **Literal agenda / table-of-contents slide — cargo cult.** A literal agenda
  ("1. Intro 2. Body 3. Conclusion") is *not* an advance organizer and does little
  measurable good; it is closer to ritual. The better reason to omit it is not "it
  uses bullets" but "it is not a conceptual organizer." **[EVIDENCE-adjacent — the
  distinction between conceptual and literal organizers is drawn from the advance-
  organizer literature above.]**

- **Section dividers — helps.** Dividers are the visible form of the **segmenting
  principle**: they chunk a long presentation into learner-pace-able units.
  Supported. **[EVIDENCE.]**

- **Recurring named case / motif / throughline reinforcement — helps.** Repeating the
  throughline (Anderson) and using a recurring named case aid coherence and memory;
  the Heaths' "concrete" and "stories" principles support a recurring concrete case
  over abstract restatement. **[PRACTICE.]**

- **Closing recap / summary — probably helps.** Retrieval and consolidation aid
  retention, and a recap after a dense segment respects working-memory limits — but no
  clean controlled study isolating the closing-summary slide was found. **[ASSUMPTION
  / weak PRACTICE — plausible on consolidation grounds, not directly measured.]**

- **Tripled "tell them what you'll tell them / tell them / tell them what you told
  them" — partly cargo cult.** Doing it three times *mechanically* is not
  evidence-based; doing it as *organizer → payoff → consolidation* is. The mechanical
  tripling has no support. **[MYTH for the mechanical tripling — origin: a widely
  repeated speaking maxim of uncertain provenance.]**

- **Progress bars / slide numbers / "N of M" — skip by default.** No strong evidence
  they aid comprehension; they *add* extraneous processing (coherence penalty,
  d≈0.7), and in a narrated video an on-screen progress bar competes with the content
  for the visual channel. **[ASSUMPTION grounded in the coherence principle — no
  direct study, but the coherence cost is measured.]**

- **Word-lands-with-visual (video) — strongly helps.** Making the spoken word land as
  its corresponding visual appears is the **temporal contiguity principle (d=1.30)**,
  one of the largest effects in Mayer's corpus. Though this is a within-scene timing
  device rather than a deck-level signpost, it is the single best-supported
  followability tool available. **[EVIDENCE.]**

**Summary table.**

| Device | Verdict | Basis |
| --- | --- | --- |
| Conceptual / throughline opener | Helps | Advance organizer + pre-training **[CONTESTED, net-helps]** |
| Literal agenda / ToC slide | Cargo cult | Not an advance organizer **[EVIDENCE-adjacent]** |
| Section dividers | Helps | Segmenting **[EVIDENCE]** |
| Recurring named case / motif | Helps | Coherence + concreteness **[PRACTICE]** |
| Closing recap | Probably helps | Consolidation **[weak]** |
| Tripled "tell/tell/told" | Partly cargo cult | No support for mechanical tripling **[MYTH]** |
| Progress bar / slide numbers | Skip by default | Coherence penalty **[ASSUMPTION]** |
| Word-lands-with-visual (video) | Strongly helps | Temporal contiguity d=1.30 **[EVIDENCE]** |

**The failure mode.** Cargo-cult signposting: a literal agenda, a progress bar, and a
mechanical triple-recap all added "because presentations have them," each spending
attention the content needed, with no comprehension gain.

**How to check it.** For each signposting element, ask what it is *for* and whether
the evidence supports it. Keep conceptual openers, section dividers, recurring cases,
and (in video) word-synced reveals. Cut literal agendas, progress chrome, and
mechanical triple-recaps.


---

# Part C — Delivery, Evidence and Limits

*What changes when a deck stops being a static artefact and becomes a watched, narrated,
distributed thing — and the hard floor of legibility that bounds every layout regardless
of how clever its composition is. Chapters 10–11 deal with time and narration; Chapter 12
with presenting evidence; Chapter 13 with the checkable legibility and accessibility
numbers; Chapter 14 cleans up the myths and marks the edges of what is known.*
## Chapter 10 — The three consumption modes, and why density must fork

The same storyline can reach a viewer three ways: **presented live** with a speaker in
the room, **read alone** with no speaker, or **watched as a narrated video**. It is
tempting to build one deck and reuse it across all three. That instinct is wrong, and it
is wrong for reasons you can derive from first principles rather than take on faith.

### 10.1 The derivation: four variables decide how much a frame can carry

Start from the spine — attention is scarce, and the job of a frame is to let the viewer
follow along. How much on-screen content a frame can carry before it stops helping is
decided by four independent questions:

1. **Who controls pacing?** If the *viewer* controls it (a reader), the frame can be
   dense because the viewer sets dwell time to match. If the *speaker* controls it (live)
   the speaker absorbs the words and the frame can be sparse. If the *edit* controls it
   (video), the frame is gone when the cut says so and the viewer cannot slow it down.
2. **Is audio carrying the argument?** In a read deck there is no audio, so the words must
   be on the page. Live, the speaker *is* the audio. In video, narration carries the
   argument — unless the sound is off (10.4).
3. **Can the viewer re-read?** A reader can re-scan a sentence for free and instantly. A
   video viewer cannot without scrubbing, which is coarse and disengaging — assume
   re-reading never happens in video.
4. **Can the viewer pause?** A reader pauses by simply not turning the page. A live
   audience can ask a question. A video viewer in a feed effectively cannot pause and stay
   engaged.

Run those four questions across the three modes and the table falls out — this is the
essential-variables matrix from the narrative-craft research:

| Variable | Live | Read-alone (document) | Narrated video |
| --- | --- | --- | --- |
| On-screen text density | Lowest | **Highest** (words the absent speaker would say) | **Lowest** (redundancy penalty) |
| Where the words live | Speaker's mouth + speaker notes | On the page | Narration track (audio) |
| Pacing control | Speaker | **Reader** (self-paced) | **Fixed by the video** — viewer can't pace |
| Answer-first? | Optional (tension OK) | **Yes** (readers skim) | Often no (hook/tension to retain) |
| Assertion titles | Helpful | **Essential** (carry the argument alone) | Helpful but short |
| Segmenting | Natural (slide breaks) | Sections/headers | **Critical** (viewer can't re-read) |

`[PRACTICE]` — the matrix is a synthesis of practitioner sources (Duarte, Amazon, Alley);
the individual mechanisms behind it are `[EVIDENCE]`, covered below and in Chapters 11
and 13.

The one thing that stays *constant* across all three modes is the **assertion per unit**:
each slide, scene or section carries exactly one claim. That invariant is what lets a
single storyline fan out into three different artefacts without becoming three different
arguments. `[PRACTICE]`

### 10.2 Why a narrated slide cannot carry prose — the reading-speed vs speech-rate proof

This is the quantitative heart of the chapter. The two rates that matter:

- **Silent reading:** adults read English non-fiction at **~238 wpm**, fiction ~260 wpm
  (Brysbaert 2019, meta-analysis of 190 studies / 18,573 participants, *Journal of Memory
  and Language*, <https://gwern.net/doc/psychology/linguistics/2019-brysbaert.pdf>).
  Reading *aloud* is slower, ~183 wpm. `[EVIDENCE]`
- **Speech / narration:** comfortable narration is **~150–160 wpm** (audiobook norm);
  conversational speech ~130–150 wpm. Conversational English is usually anchored at
  ~150 wpm (National Center for Voice and Speech, via VirtualSpeech
  <https://virtualspeech.com/blog/average-speaking-rate-words-per-minute>; CUNY recommends
  ~140 wpm for intelligibility <https://tfcs.baruch.cuny.edu/speaking-rate/>). `[EVIDENCE]`

Silent reading (~238 wpm) is materially faster than listening (~150 wpm). That gap is the
whole problem. If you paste the narration script onto the slide as prose, the viewer
*reads it faster than the narrator speaks it*, reaches the end, and then either waits
(bored) or re-reads (lost) while the voice lags behind. The two channels are now racing,
and worse — if the on-screen prose is *different* from the spoken words, both compete for
the phonological loop (Baddeley's model): you cannot silently sound out printed words and
process heard words at once without interference, and comprehension of both drops. This is
the redundancy and split-attention mechanism operating in the time dimension. `[EVIDENCE]`
(Mayer redundancy principle, median d = 0.69, supported 10/10 tests, Cambridge Handbook
ch. 12; and the reading-vs-listening interference above.)

**Concept — the redundancy principle (and its sharp edge).**

1. *Principle.* Under narration, on-screen text should be *keywords*, not sentences that
   restate the voice. Full verbatim spoken-plus-written duplication hurts comprehension;
   short synchronised keywords help.
2. *Why it is true.* Identical spoken and printed words force the visual channel to
   process text while it is also processing the graphic, and the reader's pace fights the
   narrator's pace. Mayer's meta-syntheses report removing redundant on-screen text
   improves learning at **median d = 0.69, supported in 10 of 10 tests**. But *partial*
   redundancy — a few keywords or a short assertion on screen while narration elaborates —
   can *help* by guiding attention (Mayer & Johnson, "Revising the Redundancy Principle,"
   <https://www.researchgate.net/publication/232540768>). `[EVIDENCE]`
3. *Consequence.* In a narrated frame, put the *keywords* on screen and the *connective
   tissue* in the voice. The visual shows structure; the narration explains significance.
   This is exactly what assertion-evidence design does: a short sentence headline on
   screen, richer spoken elaboration.
4. *Failure mode.* The "narrated slide-doc": every scene is a paragraph of body text and
   the voiceover reads it word for word. The viewer races ahead, disengages, and remembers
   less than if the text had not been there at all.
5. *How to check it.* Measure similarity between a card's on-screen text and its narration
   segment; flag any card whose text is a near-duplicate sentence of the voice. Manually:
   read the slide silently at reading speed and time it against the narration — if you
   finish first, the slide is carrying prose it should not.

### 10.3 How practitioners actually solve it — separate artefacts, not one stretched deck

Practitioners do not stretch one deck across the modes. They build *different artefacts*
from the same content:

- **Duarte's ballroom vs reading distinction / Slidedocs.** A *ballroom* deck (projected,
  presenter-driven) is sparse and visual; a *reading* deck ("Slidedoc") is dense and
  self-contained — a document built in slide software, meant to be read, not projected.
  Different documents from the same content.
  (<https://www.duarte.com/training/slide-document-design/slidedocs/>) `[PRACTICE]`
- **Speaker notes and appendices.** The live mode externalises the words into *speaker
  notes* (not on the slide) and pushes backup evidence into *appendix* slides shown only
  if asked. The read-alone mode must *inline* those notes because there is no speaker to
  say them. `[PRACTICE]`
- **The Amazon memo — the extreme of the reading mode.** Amazon banned PowerPoint for
  decision meetings precisely because slides are *too low-density to carry an argument
  alone* and let fuzzy thinking hide in the gaps between bullets. They replaced it with a
  **6-page narrative memo read silently for ~30 minutes at the start of the meeting.**
  (<https://www.cnbc.com/2018/04/23/what-jeff-bezos-learned-from-requiring-6-page-memos-at-amazon.html>;
  Bezos' 2004 email
  <https://www.businessinsider.com/jeff-bezos-email-against-powerpoint-presentations-2015-7>)
  `[PRACTICE]`

The lesson: a read-alone deck needs *more* text than a live deck (it must inline the words
the absent speaker would have said), and a narrated video needs *less* than either (the
voice carries the words and the viewer cannot re-read). The read deck and the video deck
are near-opposites in density, even though they share a storyline.

### 10.4 A quantitative recommendation: how much less should a narrated frame carry?

The brief asks for a number, built from the figures rather than from taste. Here is the
reasoning.

A video frame's on-screen text must be readable within its dwell time *and* leave dwell
for the narration. The binding ceiling is the subtitle/caption reading limit (Chapter 13
and the video research): **~15 characters per second (CPS) / ~160–180 wpm**, with a
**~0.3 seconds per word minimum on-screen** (BBC Subtitle Guidelines §4.1,
<https://www.bbc.co.uk/accessibility/forproducts/guides/subtitles/>). A read-deck slide
has no such ceiling — the reader lingers as long as they like. `[EVIDENCE]`

Working the numbers through:

- **Text budget per frame.** At ~0.3 s/word, a 12-word statement needs ≥ ~4 seconds on
  screen *just to be read*, before any narration time. Four short cards of ~6 words each
  (~24 words) need ≥ ~7 seconds. Practically this caps a narrated frame at roughly **the
  headline + one short supporting line + at most 2–3 short cards**, versus a read deck's
  comfortable 3–4 denser cards.
- **The rule of thumb:** a video frame should carry **~50–60% of the text a read-deck
  slide of the same layout carries.** `[ASSUMPTION]` (derived from the CPS ceiling and
  per-word read floor, not measured on real decks).
- **Card counts:** shift the accepted card range down by one for video. Where a deck
  comfortably takes 3–4 cards, the video variant should prefer the **lower bound (3)** and
  treat 4 as an overflow risk. A five-node process is almost certainly **too many for a
  single video frame** — in video it should *reveal sequentially* (one node per narration
  beat, see Chapter 11) rather than show all five at once, or be split across scenes.
- **Minimum duration is computed, not fixed:**
  `slide_duration = max(narration_seconds, on-screen_word_count × 0.3s, layout_read_floor)`.
  This ties the reading floor, the narration length, and the layout's own read time into a
  single build rule. `[EVIDENCE]`-grounded (0.3 s/word is from the BBC standard).

### 10.5 The muted-viewing reality, and the tension it creates

Now the uncomfortable part. A large share of video is watched with **no sound**:

- **~85% of Facebook video views occur without sound**, per multiple publishers
  (LittleThings, Mic ~85%; PopSugar 50–80%). Widely corroborated but *publisher-reported*,
  from 2016, and a "view" was counted at 3 seconds of autoplay — so treat 85% as
  directional, not precise. (Digiday
  <https://digiday.com/media/silent-world-facebook-video/>; Nieman Lab
  <https://www.niemanlab.org/reading/publishers-say-85-percent-of-facebook-video-is-watched-without-sound/>)
  `[EVIDENCE]` (industry-reported, methodologically limited — flagged).
- A later survey reports **~75% of people often watch mobile video on mute** (85%
  millennials, 64% Gen X) — same direction, different method.
  (<https://digiday.com/sponsored/75-percent-of-people-watch-mobile-videos-on-mute/>)
  `[EVIDENCE]`
- A **2024 peer-reviewed eye-tracking study** (PLOS ONE) confirms watching subtitled video
  with sound off measurably changes comprehension, cognitive load, and gaze patterns — the
  silent+subtitle mode is a real, distinct viewing condition, not a rounding error.
  (<https://pmc.ncbi.nlm.nih.gov/articles/PMC11458047/>) `[EVIDENCE]`

**The tension.** If a large share of viewers watch with no sound, on-screen text must
carry the message *independently* of the audio. But that pulls directly against the
redundancy principle (10.2), which says on-screen text under narration should be keywords,
not the full argument. You cannot simultaneously "keep on-screen text minimal so it does
not compete with the voice" and "put the whole argument on screen because there is no
voice."

**How to resolve it rather than pretend it does not exist.** The resolution is that the
two audiences are reached by *two different text layers*, not by one compromise layer:

1. **The headline layer carries the message for the silent viewer.** Each scene surfaces
   its one assertion as persistent on-screen text — the sentence that, read alone, conveys
   the point. This is defensible *partial* redundancy: it is the headline, not the full
   narration, so it does not trip the full-redundancy penalty for the sound-on viewer, and
   it independently carries the argument for the sound-off viewer. `[EVIDENCE]` (partial
   redundancy helps — Mayer & Johnson.)
2. **The caption track carries the detail for the silent viewer, and is safe for the
   sound-on viewer because it is synchronised.** Verbatim *synchronised* captions are
   **not** the harmful redundancy Mayer warns about — that caution is specifically about
   *unsynchronised or self-paced* duplicate prose sitting next to a graphic. Synchronised
   captions help accessibility, non-native speakers and noisy/silent environments and do
   not reliably hurt native viewers. So the full detail rides on the caption track, which
   the sound-on viewer can ignore. `[EVIDENCE]`
3. **The narration carries the connective tissue for the sound-on viewer** and simply is
   not received by the silent one — which is fine, because layers 1 and 2 already carried
   the message.

So the honest posture for feed-distributed video (especially portrait) is: **always burn
in captions, and always surface the scene headline as persistent on-screen text** — and
keep the *body* prose off the frame so the sound-on viewer is not forced to race it. The
redundancy principle is not violated; it is *satisfied per layer*. The silent-viewer share
also *tightens* the density budget from 10.4: silent viewers read, and reading takes the
per-word time above, so the video variant must carry even less text per second than a read
deck where the eye is the only channel. For portrait/feed video the practical maximum is
often **headline + one card revealed at a time**, ~40–50% of read-deck density.
`[ASSUMPTION]` on the exact 40–50% figure.

---

## Chapter 11 — Narration and the time axis

**The central point of this chapter, stated once so it is unmissable:** in a narrated
piece, information weight has a *second axis*. Weight is expressed in **space** by size
and position — the whole of the spine so far. But it is also expressed in **time** by
reveal order and timing. A held frame that shows everything at once discards the time
axis entirely: it spends its whole attention budget in the first glance and has nothing
left to direct the eye as the argument unfolds. In video, the heaviest element is not just
the biggest — it is the one that *moves, reveals, or magnifies on the exact beat the
narration names it.*

### 11.1 Writing for the ear versus the eye

**Concept — narration is written for one pass at a speed you chose.**

1. *Principle.* A reader can re-scan a sentence; a listener gets one pass at the speed you
   set. Every narration rule reduces the listener's working-memory load.
2. *Why it is true.* Speech arrives serially and cannot be re-read; a sentence the ear
   cannot hold is simply lost. Working memory holds only ~4 chunks (Cowan), and a long
   subordinate clause forces the listener to hold an unresolved subject while waiting for
   the verb. `[EVIDENCE]` (Cowan ~4 chunks, <https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2864034/>).
3. *Consequence — concrete rules:*
   - **Short sentences, one idea each.** Break a 40-word sentence with three clauses into
     three sentences.
   - **Avoid subordinate clauses and mid-sentence parentheticals.** "The pipeline, which
     was built last year and handles both stacks, validates the input" is a *reading*
     sentence. For the ear: "The pipeline validates the input. We built it last year. It
     handles both stacks."
   - **Name the subject before the action.** "The validator rejects malformed input"
     (subject → verb) is processable in one pass; "Malformed input, when it reaches the
     validator, is rejected" makes the listener hold "malformed input" waiting for the
     verb. This mirrors the BBC's own sound-effect labelling rule — *subject + active
     finite verb* ("FLOORBOARDS CREAK", not "CREAKING OF FLOORBOARDS"), BBC Subtitle
     Guidelines §17.4. `[EVIDENCE]`
   - **Numbers as words for small counts; numerals for data.** Spell out small spoken
     numbers ("three inputs") but keep numerals with units and for precise data.
     Interestingly this *inverts* on the caption track, where the BBC spells out 1–10 in
     prose but uses numerals with units and for scores/data (BBC §18). The spoken form and
     the caption form of a number can legitimately differ. `[EVIDENCE]`
   - **Don't narrate the UI.** "Click the blue button in the top right" ages instantly and
     forces the eye to hunt. Narrate the *intent* ("submit the form") and let the visual —
     a cursor, a zoom, a highlight — carry the *where*. `[PRACTICE]`
4. *Failure mode.* Narration that reads like a written report: long sentences, nested
   clauses, "the aforementioned system." The listener falls behind on the first sentence
   and never catches up.
5. *How to check it.* Read the script aloud at ~150 wpm. Any sentence you stumble on, or
   that you cannot say in one breath, is too long for the ear.

**Words-per-minute figures and script-to-runtime ratios.** Plan explainer / corporate
narration at **130–160 wpm** — slower than conversation because the listener is also
processing a visual. The practical planning number is **~150 wpm = 2.5 words/second**: a
60-second scene is ~150 words, a 10-second scene ~25 words. This is the ratio to convert a
narration string to an estimated scene duration. Commercial reads push to ~170 wpm for
energy; the well-corroborated band is 130–160 wpm, not a law.
(Biteable gives 120–200 wpm as workable, <https://biteable.com/blog/video-word-count/>.)
The hard ceiling that *is* well-grounded is the subtitle reading-speed limit: narration
above ~180 wpm produces captions the viewer cannot read, so the caption limit effectively
caps comfortable narration too. `[EVIDENCE]`

### 11.2 The temporal contiguity effect — the largest effect in the corpus

**Concept — a visual must arrive when its narration arrives.**

1. *Principle.* People learn more deeply when corresponding words and pictures are
   presented *simultaneously* rather than successively. In video, a card must appear when
   the narration reaches it — not before, not after.
2. *Why it is true.* Corresponding verbal and visual material must be held in working
   memory *at the same time* to be integrated; a gap forces the viewer to hold one while
   waiting for the other, and the mental slot goes stale. Mayer's meta-analysis reports the
   temporal contiguity principle held in **9 of 9 experimental tests, with a median effect
   size of 1.22** — a very large effect by social-science standards; Mayer's consolidated
   figures put it as high as d = 1.30, one of the largest effects in his entire corpus.
   (Mayer, "Principles for reducing extraneous processing,"
   <https://www.researchgate.net/publication/262915119>; Cambridge chapter
   <https://www.cambridge.org/core/books/abs/multimedia-learning/temporal-contiguity-principle/2236655CB3759154DF148595FF2EC1FC>;
   Ginns 2006 combined contiguity d ≈ 0.89.) `[EVIDENCE]`
3. *Consequence.* This is why WHEN something appears matters as much as how big it is. The
   unit of synchronisation should be the *narration beat*, and the renderer should reveal
   an element on the beat that mentions it. It is the strongest single justification for
   binding reveals to the voice rather than to a clock.
4. *Failure mode.* A diagram that fades in three seconds after the voice described it, or a
   statistic that flashes up two seconds before it is mentioned. Both break the pairing and
   cost comprehension.
5. *How to check it.* In a video pipeline, derive each reveal's timestamp from the
   narration segment that introduces it, then verify alignment. Manually: watch once and
   note any moment where the voice is talking about something not yet (or no longer) the
   focal element.

**The cost of late versus early, and the tolerance window.** Both hurt, differently:

- **Late** (visual lags the word): the viewer hears a claim with nothing to attach it to,
  holds it, and the picture arrives after the mental slot has gone stale. This is the more
  damaging direction for dense content.
- **Early** (visual leads the word): the viewer interprets the visual, forms a guess, and
  the narration then either confirms it (mild redundancy, tolerable) or contradicts it
  (costly). A *deliberate* early reveal is a J-cut used well (11.3); an *accidental* one is
  noise.

The tolerance is small. The subtitle-sync literature puts the acceptable lag between speech
and caption at **no more than 2 seconds, aiming for near-zero** (BBC §5.4). Treat that
2-second ceiling as the outer bound for visual-to-narration misalignment too; the target
is sub-second. For *element reveals* (as opposed to captions) even 1.5 s off the word is
visibly wrong. `[EVIDENCE]`

**Keyword highlighting on mention, and forced alignment as the mechanism.** Highlighting or
revealing a word/card at the instant the narration says it is the applied form of temporal
contiguity. The enabling mechanism is **forced alignment**: an algorithm (Montreal Forced
Aligner, aeneas, gentle, or a Whisper-based aligner) takes an audio file and its transcript
and returns per-word start/end timestamps — exactly what you need to place a highlight on
the frame a word is spoken. Coarse alignment by character-count proportion drifts whenever
speech rate varies (emphasis, pauses, numbers read slowly); for captions the drift usually
stays within the 2-second tolerance, but for *element reveals* it does not. The graded rule:
proportional timing is acceptable for captions; real forced alignment is required before
shipping word-synced *motion*. Local aligners (aeneas, MFA, vendored Whisper) preserve an
offline/deterministic build. `[EVIDENCE]` on the technique; `[ASSUMPTION]` that a given tool
runs offline in a given environment.

### 11.3 Editorial craft that transfers from documentary and explainer video

**Concept — a cut is a decision about meaning, not about time.**

1. *Principle.* A slide change should land on a *meaning change* in the narration, not on a
   fixed timer.
2. *Why it is true.* Walter Murch's "Rule of Six" ranks the criteria for a good cut:
   emotion 51%, story 23%, rhythm 10%, eye-trace 7%, two-dimensional plane 5%,
   three-dimensional continuity 4%. The striking claim is that spatial/temporal continuity
   — what amateurs obsess over — is worth 4%, while emotion and story together are worth
   74%. Cut where the meaning changes. (Murch, *In the Blink of an Eye*, 2nd ed.;
   <https://en.wikipedia.org/wiki/In_the_Blink_of_an_Eye_(Murch_book)>) `[PRACTICE]`
   (a canonical craft source, not an experiment).
3. *Consequence.* Treat the boundary between narration beats as the natural cut point;
   hold a visual until its sentence completes. If a cut happens because 8 seconds elapsed
   rather than because the narration reached a new idea, every cut fights the viewer's
   sense of structure.
4. *Failure mode.* The fixed-timer slideshow: every slide gets the same duration, so dense
   slides are starved of read time and sparse slides overstay.
5. *How to check it.* For each cut, ask "did the narration just reach a new idea?" If not,
   the cut is on the clock, not the meaning.

The transferable techniques:

- **B-roll and "the visual answers the narration."** In documentary, B-roll shows what the
  voice is talking about. The discipline that separates good explainer from bad: the visual
  on screen should answer the question the narration just raised, *at the moment it raises
  it*. When narration says "three inputs feed the pipeline," three inputs should be visible.
  This is the editorial expression of temporal contiguity. `[PRACTICE]`
- **Cutting on meaning versus on time** — as above; the cut lands on the idea boundary.
- **J-cuts and L-cuts (split edits).** A split edit changes audio and picture at *different*
  instants. In a **J-cut** the next scene's audio starts *before* its picture arrives; in
  an **L-cut** the current scene's audio continues *after* its picture is gone. Both make a
  cut feel motivated rather than abrupt, because sound orients attention and the eye then
  follows. For a slide-plus-narration piece: let the next scene's narration begin a beat
  before the new slide renders (J-cut), or let the outgoing narration finish over the
  incoming slide (L-cut). Hard-cut audio and picture together on every scene and it feels
  like a slideshow with a voice bolted on. Typical overlap 0.3–1.0 s.
  (Adobe <https://www.adobe.com/creativecloud/video/discover/j-cut-and-l-cut.html>;
  Wikipedia "Split edit" <https://en.wikipedia.org/wiki/Split_edit>) `[PRACTICE]`
- **Shot length and pacing.** Shot length should track information density: fast cuts for
  energy and montage, long holds for a point that needs to land or a complex image that
  needs reading. The explainer analogue: a slide carrying one statement can be short; a
  slide carrying a dense diagram must be *held long enough to be read* — and the read time
  is computable (Chapter 10's duration formula). Equal duration for every slide starves the
  dense ones and bores on the sparse ones. `[PRACTICE]`
- **Lower thirds.** A lower third is a name/title graphic in the lower portion of frame. It
  appears shortly after a subject is introduced, holds ~3–5 s, and sits inside the
  title-safe area. In an explainer it is where a speaker attribution, section label, or "you
  are here" marker belongs — and critically, it must not collide with the burned-in subtitle
  band (Chapter 13). A video frame has a reserved lower band for captions and often a
  lower-third zone above it; the deck's lower region is contested in a way a slide's never
  is. `[PRACTICE]`
- **The discipline: the visual answers the narration rather than duplicating it.** Do *not*
  narrate a bullet list. If the narration is a list of five things, the screen must
  transform as the list advances (reveal, highlight, count up), or the viewer disengages.
  `[PRACTICE]` (this is the editorial face of the redundancy principle, which is `[EVIDENCE]`).

### 11.4 Motion as an attention instrument, not decoration

**Concept — motion is expensive attention, so it must be functional.**

1. *Principle.* It is nearly impossible *not* to look at something that moves, so decorative
   motion is harmful — it spends the viewer's involuntary attention on nothing.
2. *Why it is true.* Onset motion triggers exogenous (involuntary) attention capture — the
   visual system orients to it automatically. That capture is a fixed resource; spend it on
   a decorative wipe and it is not available for the element that matters. `[EVIDENCE]`
   (exogenous capture; connects to inattentional blindness — attention is required to see).
3. *Consequence.* Use motion for what it is uniquely good at:
   - **Directing gaze.** A single moving/appearing element in a still frame captures the
     eye. This is the motion expression of "weight → focus": the heaviest element can
     *earn* dominance by being the thing that reveals, not just the biggest.
   - **Showing causation and transformation.** "A becomes B" or "X causes Y" is shown by
     motion far more clearly than by two static states side by side.
   - **Showing change over time.** A count-up on a statistic, a bar growing, a phase
     advancing — motion makes "over time" literal.
4. *Failure mode.* The same flashy wipe applied to every cut; text that all animates all
   the time so nothing stands out; motion as brand garnish.
5. *How to check it.* For each animated element, ask "what information does this motion
   carry?" If the answer is "none," cut it.

**Duration and easing conventions (Material Design — primary source).**

- **Small / micro-interactions: 100–200 ms** (selection controls ~100 ms).
- **Larger transitions on mobile: 300–400 ms** — "Animations longer or shorter than these
  can feel sluggish or difficult to follow."
- **Enter/exit asymmetry:** entering elements use a **decelerate** curve (fast→slow,
  `cubic-bezier(0.0, 0.0, 0.2, 1)`); leaving elements use an **accelerate** curve
  (`cubic-bezier(0.4, 0.0, 1, 1)`); elements moving within the frame use a
  **standard/emphasized** curve (`cubic-bezier(0.4, 0.0, 0.2, 1)`). Enter is often given
  slightly more time than exit — arrivals should be noticed, departures should get out of
  the way.
  (<https://material.io/design/motion/speed.html>,
  <https://material.io/archive/guidelines/motion/duration-easing.html>,
  <https://material.io/archive/guidelines/motion/movement.html>; corroborated by Atlassian's
  150–400 ms range, <https://atlassian.design/foundations/motion>) `[EVIDENCE]` (design
  specification). For a full-frame explainer transition, ~300–500 ms; an element reveal
  within a held slide, 150–250 ms. Slower than ~500 ms for a routine transition reads as
  sluggish and steals time from the narration.

**When a transition carries meaning versus when it is noise.** A transition is *meaningful*
when it encodes a relationship: a push-left says "next in sequence," a zoom-in says "detail
of the thing you just saw," a cross-dissolve says "time passed or subject changed." It is
*noise* when the same wipe is applied to every cut regardless of relationship — the viewer
stops reading it as information. Rule: pick the transition from the relationship between the
two scenes, not from a default. `[PRACTICE]`

**Attention timing constraints from cognition** (why builds must be spaced):

- **Change blindness:** a large change that coincides with a cut is very likely missed.
  Never introduce a new element on the same frame as a transition; reveal it as a distinct,
  marked change on a *held* frame. (Rensink, O'Regan & Clark 1997.) `[EVIDENCE]`
- **Attentional blink:** after detecting one target there is a ~200–500 ms window in which a
  second is missed. Space successive reveals by more than ~0.5 s (in practice much more,
  paced to narration). (Raymond, Shapiro & Arnell 1992.) `[EVIDENCE]`

**Reduced-motion is an accessibility obligation, not an option.** Users can set an OS-level
"reduce motion" preference, exposed on the web as `prefers-reduced-motion` (the browser
reports `reduce`). WCAG covers it two ways: **SC 2.3.3 Animation from Interactions (AAA)** —
interaction-triggered motion must be disable-able unless essential; **SC 2.2.2 Pause, Stop,
Hide (Level A)** — auto-playing motion lasting >5 s must be pausable/stoppable.
(MDN <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>;
<https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions>) `[EVIDENCE]`

The subtlety for a *rendered* video: a burned-in MP4 cannot read the viewer's OS preference
at play time. So the honest posture is: for an interactive/HTML deck, honour
`prefers-reduced-motion` in CSS; for a rendered video, motion is baked in, so mitigate by
editorial restraint (no gratuitous motion; nothing flashing >3×/sec per WCAG 2.3.1 to avoid
seizure risk) and ideally offer a reduced-motion render variant. `[ASSUMPTION]` that a given
pipeline lacks such a variant.

### 11.5 Kinetic typography and text-on-screen limits

**Concept — animated text helps only when it reveals in sync or emphasises the one word.**

1. *Principle.* Kinetic typography helps when it (a) reveals in sync with narration — one
   line arrives as the voice says it, satisfying temporal contiguity — or (b) emphasises the
   single word carrying the point. It hurts when all the text animates all the time.
2. *Why it is true.* The motion budget is finite (11.4); if everything moves, nothing is
   signalled. The animated word should be the heaviest word. `[EVIDENCE]` (signalling +
   exogenous capture).
3. *Consequence — how much text a viewer can read in a held shot.* Two convergent numbers
   bound it: the subtitle reading-speed ceiling of **~160–180 wpm ≈ 15–17 CPS** (above
   ~200 wpm most viewers cannot keep up), and a **~0.3 s per word floor** for on-screen
   text. So a 12-word statement needs ≥ ~4 s on screen just to be read; four 6-word cards
   (~24 words) need ≥ ~7 s. Silent reading is faster (~238 wpm) but on-screen text should be
   sized and timed to the *caption* ceiling, because a video viewer is also watching the
   picture and cannot re-read. `[EVIDENCE]`
4. *Failure mode.* A frame that flashes a paragraph for two seconds; the viewer gets one or
   two words and the rest is gone.
5. *How to check it.* Apply `slide_duration ≥ on-screen_word_count × 0.3 s` and verify.

### 11.6 Screen-recording and product-demo craft

**Concept — for a demo, the whole craft is directing the eye to the change.** The failure
mode is that the viewer cannot find what changed. `[PRACTICE]` throughout this section.

- **Cursor treatment.** A raw recorded cursor jitters and teleports. Smooth the path, slow
  it near targets, and optionally enlarge or highlight it (a soft ring/spotlight) so the eye
  can follow. The cursor is the narration's pointer — it answers the "where" the voice
  deliberately omits ("don't narrate the UI", 11.1). This connects to the embodiment effect:
  a pointer that *tracks the narration focus* helps; one that wanders misdirects. `[EVIDENCE]`
  for embodiment (median d = 0.36), `[PRACTICE]` for the cursor conventions.
- **Zoom-to-focus.** Zoom in on the region that matters the moment the narration reaches it
  (temporal contiguity again), then pan to the next region. A full-resolution app screenshot
  makes UI text tiny; a zoom makes the relevant control unmistakable. This is the
  screen-recording form of "weight → focus": the changed element gets magnified.
- **Speed ramping.** Long loads, repetitive typing and navigation are sped up (or cut with
  an L-cut) so the viewer spends time only where meaning is. Never real-time a 20-second
  build; ramp it.
- **Hiding irrelevant UI.** Blur, crop or dim chrome that is not part of the point. The frame
  should contain only what the current sentence is about — the same discipline as not putting
  five cards where one belongs (coherence).
- **Making the change findable.** Before a change, briefly rest on the "before" state;
  trigger the change; hold on the "after" — ideally with a highlight/flash on the exact
  element that changed. A cross-fade between before/after, or an arrow/ring on the delta,
  removes the hunt. In video, before/after is a *timed transformation*, not a static split.

---

## Chapter 12 — Presenting evidence: numbers, comparisons and data

For evidence, "weight" is literal — a number, a delta, a comparison. The layout's job is
to make the one figure that carries the argument the first thing the eye lands on, whether
the viewer follows a narration or reads the slide alone. This whole chapter is an
application of the spine to data.

### 12.1 A presentation chart is not an analytical chart

**Concept — the unit is a chart *plus its conclusion*, not a chart.**

1. *Principle.* An analytical (exploratory) chart is a tool the *author* uses to find what
   is true; it can be dense, unlabelled and read slowly. A presentation (explanatory) chart
   is a claim the author has *already reached* and is handing to an audience who will look
   for seconds.
2. *Why it is true.* The audience of a presentation chart has neither the time nor the
   intent to explore; they need the claim delivered. The Financial Times frames its entire
   Visual Vocabulary as "not an attempt to teach everyone how to make charts, but how to
   recognise the opportunities to use them effectively **alongside words**"
   (<https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md>).
   Knaflic frames the same move: decide the *one* thing the audience should take away, then
   use preattentive attributes to push everything else back
   (<https://storytellingwithdata.com/blog/two-tips-for-better-graphs>). `[PRACTICE]`
3. *Consequence.* A slide that can place a chart but cannot place its headline conclusion
   and one annotation has built the analytical tool, not the explanatory one. An
   evidence slide has a *fixed information hierarchy*: (1) the takeaway sentence [heaviest],
   (2) the emphasised mark/number, (3) the supporting chart body, (4) axis and source
   furniture [lightest].
4. *Failure mode.* "Revenue by quarter" over a five-series line chart with a legend and no
   annotation — the audience must do the analysis the author should have done.
5. *How to check it.* Does the chart have a *sentence* title stating the conclusion? A
   topic-only title is a warning.

**Tufte on data-ink and chartjunk, and the critiques.** Edward Tufte's principle: maximise
the *data-ink ratio* — the proportion of ink that presents data rather than decoration —
and remove "chartjunk" (gratuitous grids, 3-D effects, ornament). This underlies the
"declutter" discipline. The substantive critiques, held honestly: maximising data-ink to
the extreme can *harm* readability — some redundancy and non-data ink (gridlines, framing,
labels) aids comprehension and memorability, and empirical work (e.g. on "chartjunk" and
memorability) has questioned whether the barest chart is always the most effective for an
audience that must *remember* it. `[CONTESTED]` — Tufte's minimalism is widely taught as
`[PRACTICE]` but its strongest form is disputed by later readability and memorability
research. The reconciling position: declutter *non-data* ink that competes for attention,
but keep the labels and light structure that help a glancing viewer.

### 12.2 Choosing the chart from the message

**Zelazny's message-to-chart mapping.** Gene Zelazny (*Say It With Charts*): start from the
**message you want the audience to take away**, not the data. The *comparison in the
message* dictates the chart. His five comparison types — component, item, time-series,
frequency, correlation — map onto: component → part-to-whole/pie; item → ranking/bar;
time-series → change-over-time/line-column; frequency → distribution; correlation →
relationship/scatter. "Your audience should never have to ask 'So what?' after looking at
your chart." `[PRACTICE]`; `[ASSUMPTION]` on exact wording (not verified against the primary
text). (<https://www.antoinebuteau.com/lessons-from-gene-zelazny/>)

**Knaflic on preattentive emphasis and decluttering.** Cole Nussbaumer Knaflic narrows the
working set to what she will actually recommend — lines, bars (vertical/horizontal/stacked),
slopegraph, the single big number, and the table — and treats pies, 3-D and secondary axes
as things to avoid. The mechanism she leans on is *preattentive processing*: colour, size
and position are picked up by iconic memory before conscious attention
(<https://cole-knaflic.squarespace.com/blog/2011/10/google-example-preattentive-attributes>).
`[PRACTICE]` (technique) resting on `[EVIDENCE]` (preattentive processing is a real
perceptual mechanism).

**Cairo.** Alberto Cairo's contribution is the ethical/functional dimension — a chart must
be *truthful* and *functional* as well as beautiful; the same decluttering-plus-honesty
discipline as above. `[PRACTICE]`

**The FT Visual Vocabulary and Abela's Chart Chooser.** Abela's *Chart Suggestions* starts
from "What would you like to show?" and routes to **four** intents: Comparison, Composition,
Distribution, Relationship — with the observation that most real questions are Comparison or
Composition, bar and line cover most cases, and "when a high degree of detail is required,
the data table is generally used"
(<https://datavizblog.com/2023/03/26/choosing-the-right-chart-when-creating-a-data-visualization-part-1-of-a-series/>;
origin <https://flowingdata.com/2009/01/15/flow-chart-shows-you-what-chart-to-use/>). The FT
refines this to **nine** categories, each with a one-line "when to use":

| FT category | When to use (condensed) | Presentation-safe forms |
| --- | --- | --- |
| **Deviation** | variation +/- from a fixed reference (zero, target, average) | diverging bar, diverging stacked bar, surplus/deficit line |
| **Correlation** | relationship between 2+ variables (readers assume causation unless told) | scatterplot, bubble, connected scatter, line+column |
| **Ranking** | position in an ordered list matters more than the value | ordered bar/column, dot-strip, lollipop, slope |
| **Distribution** | values and how often they occur; the "shape"/skew | histogram, boxplot, population pyramid, dot plot |
| **Change over time** | changing trends; the time window matters | line, column, area (with care), slope, calendar heatmap |
| **Part-to-whole** | one entity broken into components | stacked/proportional bar, pie (with caveats), donut, waterfall |
| **Magnitude** | size comparisons, relative or absolute | column, bar, paired bar/column, lollipop |
| **Spatial** | only when precise location/geographic pattern matters most | choropleth (rates not totals), proportional-symbol map, cartogram |
| **Flow** | volume/intensity of movement between states | Sankey, chord, network, waterfall |

`[PRACTICE]` (all four frameworks are professional practice; they agree far more than they
differ — the differences are granularity and vocabulary, not substance).

**The consolidated message-type → chart-type mapping** (narrowed to what reads in seconds):

| The sentence you want to say | Intent | Default presentation form | Notes |
| --- | --- | --- | --- |
| "X is bigger/smaller than Y" | Magnitude | horizontal bar (sorted) | bars **must** baseline at 0 |
| "A ranks above B above C" | Ranking | ordered bar or dot/lollipop | sort by value, not alphabet |
| "It rose/fell over time" | Change over time | line (one emphasised series) | column only for a single series |
| "It's above/below target" | Deviation | diverging bar from the reference | reference line is the anchor |
| "It splits into these parts" | Part-to-whole | stacked bar; pie only if ≤3 slices | pie is hard to compare |
| "These two move together" | Correlation | scatter (annotate the outlier) | say if you don't mean causation |
| "The distribution is skewed" | Distribution | histogram / population pyramid | rarely a good glance-slide |
| "One number is the story" | headline metric | **big number + context** (12.4) | |
| "Compare on many attributes" | Comparison at detail | **table** (12.6) | when precision beats shape |

**Where they conflict — pie charts.** `[CONTESTED]`. The FT lists pie under part-to-whole but
warns "it's difficult to accurately compare the size of the segments" and links Kosara's and
Few's critiques (Few, "Save the Pies for Dessert,"
<https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf>).
Knaflic effectively bans them. The defensible synthesis: a pie is acceptable *only* for a
single part-of-whole with ≤3 slices where "roughly this fraction" is the whole message;
anything needing segment-to-segment comparison should be a bar.

### 12.3 The annotated chart is the presentation default

**Concept — the chart carries its own conclusion; highlight one series and grey the rest;
direct labels beat legends.**

1. *Principle.* Title the chart with the *takeaway sentence*, not the topic ("Revenue fell
   12% after the Q3 price change", not "Revenue by quarter"); emphasise the one series that
   carries the point in a saturated colour and push every other series to a single neutral
   grey; label series directly at the data rather than in a legend.
2. *Why it is true.* Two mechanisms. First, *preattentive processing* — one saturated
   element among greys is found before conscious search
   (<https://cole-knaflic.squarespace.com/blog/2011/10/google-example-preattentive-attributes>).
   Second, the **split-attention effect** (Chapter 3): a legend forces the eye to shuttle
   between a key and the data, holding a symbol in working memory during the search; a
   directly-placed label removes that shuttle. Spatial contiguity — placing words near the
   picture they describe — is a large, reliable effect (Mayer d ≈ 0.79–1.11; Ginns 2006
   d ≈ 0.89). `[EVIDENCE]` for the split-attention/contiguity mechanism; `[PRACTICE]` for
   the decluttering technique.
3. *Consequence.* The layout must honour the fixed hierarchy from 12.1: a *sentence* title
   slot, an emphasised mark, a subdued chart body, light furniture. Knaflic's own acceptance
   test: "look away, look back, note where your eyes land first"
   (<https://storytellingwithdata.com/blog/whereareyoureyesdrawn>). FT echoes it: "Don't be
   afraid to highlight the points of interest."
4. *Failure mode.* Every series in a different bright colour, a legend in the corner, a
   topic title — the viewer must decode which line matters before they can even start.
5. *How to check it.* The look-away/look-back test; and mechanically, verify direct labels
   exist and only one series is saturated.

Knaflic's primary posts: direct labels vs legends
<https://cole-knaflic.squarespace.com/blog/2012/06/drawing-attention-with-data-labels>;
axis vs data labels
<https://www.storytellingwithdata.com/blog/2017/8/2/axis-vs-data-labels>; annotate with
text <https://storytellingwithdata.com/blog/annotate-with-text>.

### 12.4 Big-number / headline-metric design

**Concept — a single large figure, given context without dilution.**

1. *Principle.* When the entire message is one number the audience must *remember* (not
   analyse), show it big and strip everything that competes — but give it the minimum honest
   context: baseline, comparator, direction+magnitude of change, and time period/unit.
2. *Why it is true.* Size and isolation give a number emotional/mnemonic weight (Knaflic
   reserves the single bold number for "when you have just a number or two to share"). But a
   bare number is trivia, not evidence — a number without a point of comparison cannot be
   judged good or bad (Few's dashboard principle of "comparative context," Perceptual Edge,
   <https://www.perceptualedge.com>). `[PRACTICE]`; `[ASSUMPTION]` that Few's specific
   dashboard principle is cited from the body of work rather than one verified page.
3. *Consequence.* The context must be *subordinate* — smaller, greyer, below or beside — so
   it informs without competing (the same preattentive move as 12.3). And **weight the delta
   against the absolute** by message: for "we grew," the delta (+18%) is the hero and the
   absolute is context; for "we crossed a threshold," the absolute ($1.0M ARR) is the hero
   and the delta is context. The layout must let *either* be dominant.
4. *Failure mode.* "$4.2M" alone on a slide — impressive-looking, uninterpretable; or a big
   number surrounded by equally-sized context that dilutes it.
5. *How to check it.* Can a stranger say whether the number is good or bad? If not, context
   is missing. Is exactly one figure the largest thing on the slide? If two compete, the
   hierarchy is unset.

**Honest-scaling issues that make a metric misleading** (checkable, belong as warnings):

- **Truncated bar axes.** Bars encode magnitude by length, so a bar chart axis **must** start
  at zero — the FT states it flatly for Magnitude ("Must always start at 0 on the axis").
  `[EVIDENCE]` (a stated standard). Line charts are the contested exception: the FT links both
  "does the axis have to start at zero" (ONS) and Vox's "it's OK not to start your y-axis at
  zero" — for lines a non-zero baseline can be legitimate but must be signalled.
  `[CONTESTED]` — report the conflict rather than banning either.
- **Percentages without a base.** "+200%" off a base of 3 is 6. A big-number slide showing a
  percentage must be able to show *n*. `[PRACTICE]`
- **Cherry-picked periods.** A delta is only honest against a *representative* window; the
  layout should have a place for the period so the viewer can judge it. `[PRACTICE]`
- **Ratio/area distortion.** If a metric is shown as a scaled icon or circle, **area** (not
  radius) must encode the value, or the eye over-reads it (FT proportional-symbol notes).
  `[EVIDENCE]` (a stated encoding rule).

### 12.5 Comparison structures and the discipline of an honest comparison

**Concept — same axis, same period, no strawman; and comparisons have a headcount limit.**

1. *Principle.* An honest comparison (before/after, us/them, A/B) holds axis, scale, time
   period and definition constant, with no strawman. And there is a perceptual limit on how
   many alternatives a comparison can hold before it becomes a table.
2. *Why it is true.* Viewers infer more than you showed unless you constrain it (the FT's
   causation caveat under Correlation). Perceptually: two options is a *contrast* the eye
   compares directly; three is still a comparison but the eye now scans; **four or more
   parallel options with multiple attributes each is a matrix, and a matrix is a table** —
   you are then asking the viewer to read cells, not perceive a shape, which is Abela's own
   "detail → table" trigger. `[PRACTICE]`; the exact cutover is `[ASSUMPTION]` (a synthesis
   of Abela's rule and span-of-attention lore, not a single measured threshold).
3. *Consequence.* Practical rule: **≤3 alternatives → cards/columns; ≥4 alternatives, or any
   number compared on ≥3 attributes → table.** The direct two-way contrast should stay capped
   at two.
4. *Failure mode.* Comparing a cherry-picked period against a full one; two series on two
   differently-scaled axes; your best case against a competitor's worst; or six options
   crammed as cards so none can be read.
5. *How to check it.* Are both sides on the same axis, scale, period and definition? Count
   the alternatives and attributes against the ≤3 / ≥4 rule.

### 12.6 Tables on slides

**Concept — a table beats cards when the cell *values* are the message.**

1. *Principle.* Use a table when the audience will look up a *specific* value, when precision
   matters more than shape, or when the comparison is across several attributes at once.
2. *Why it is true.* Cards are read as gestalt tiles (a label plus a little prose); a table
   is a grid read by row/column lookup. If the viewer's question is "what is the value at
   (row, column)?" a table wins; if it is "what's the overall shape?" a chart or cards win.
   In a read/live setting a table lets each reader find their own row — a property a chart
   loses. `[PRACTICE]` (Knaflic rehabilitates the table for these cases).
3. *Consequence — glanced-table limits.* No single vision study gives a hard cap, so it is
   bounded by legibility. At the body-text minimums derived in Chapter 13, a landscape slide
   with a title and source furniture leaves room for roughly **6–8 body rows** before row
   text drops under the fluent reading range; columns are bounded by measure, so **4–5
   columns** is the practical ceiling on a wide canvas, fewer in portrait. `[ASSUMPTION]` on
   the 6–8 rows / 4–5 columns figures (derived from the type-size minimums and a ~700 px
   content band, not measured on real decks). Dashboard sources (Few) tolerate denser tables
   because those are read *at a desk*, not glanced in a room or a video — do not import
   desk-density tables onto a slide. `[CONTESTED]` (desk vs glance density).
4. *Failure mode.* A twenty-row spreadsheet screenshot pasted onto a slide; or forcing a
   "4+ options × several attributes" comparison into cards, which is exactly the reasoning
   error the sources warn against.
5. *How to check it.* Count rows and columns against the caps; verify one cell is weighted.

**How to weight the one cell that matters.** Same preattentive logic as 12.3: the hero cell
gets colour/weight or a single-cell fill; other cells stay neutral; column headers are small
and grey; the row that matters can get a subtle background band. A table is not exempt from
the weight-to-layout rule — one cell should still win the eye. `[PRACTICE]`

---

## Chapter 13 — Legibility and accessibility: the hard floor under everything

No amount of good composition survives type too small to read or contrast too low to see.
This chapter is about *checkable numbers* — most of them machine-verifiable at build time —
so it gives the numbers with their sources and shows the derivations rather than asserting
folk rules.

### 13.1 Contrast: WCAG 2.2 requirements and what each applies to

**Concept — text and meaningful graphics must clear a measured contrast ratio.**

1. *Principle.* WCAG 2.2 sets contrast thresholds that are *thresholds*, not targets — do
   not round; 4.499:1 fails a 4.5:1 requirement.
2. *Why it is true / the numbers.*
   - **1.4.3 Contrast (Minimum), Level AA:** text and images of text need **≥ 4.5:1**,
     except **large-scale text** which needs **≥ 3:1**. Large-scale = **≥ 18 pt, or ≥ 14 pt
     bold** (≈ **24 px** and ≈ **18.5 px**, since the spec fixes **1 pt = 1.333 px**).
     (<https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html>) `[EVIDENCE]`
     The rationale is quantitative: 3:1 is the ISO-9241-3 / ANSI-HFES-100-1988 minimum for
     *normal* vision; 4.5:1 accounts for ~20/40 acuity (a contrast-sensitivity loss factor
     of ~1.5, i.e. 3 × 1.5); 7:1 accounts for ~20/80. This is *why* large text gets 3:1 —
     larger, thicker strokes are readable at lower contrast.
   - **1.4.6 Contrast (Enhanced), Level AAA:** **7:1** for normal text, **4.5:1** for large
     text. `[EVIDENCE]`
   - **1.4.11 Non-text Contrast, Level AA:** **3:1** against adjacent colours for UI
     components and their states, and for **"parts of graphics required to understand the
     content."** (<https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html>)
     `[EVIDENCE]` This governs **charts**: a chart's bars/lines/slices must clear 3:1 vs
     background — *unless* labels and values convey the same information, in which case the
     shape no longer has to carry understanding alone. That exception is precisely the
     annotated/directly-labelled chart from 12.3, so 12.3 and this rule reinforce each other.
3. *Consequence.* A deck that must survive a bright room or video compression should target
   **AAA / 7:1 for body text**, not merely AA — the room and the codec both eat contrast.
   Compute contrast from the *authored* CSS colours before rasterisation (WCAG evaluates the
   specified foreground/background, not the anti-aliased pixels), and add margin above the
   threshold because thin fonts render fainter than specified.
4. *Failure mode.* Grey-on-white body text at 3.5:1 that looks fine on the designer's
   monitor and vanishes on a projector or after H.264 compression.
5. *How to check it.* Automated, offline, deterministic: compute text-vs-background ratio for
   every text token against 4.5:1 (body) / 3:1 (large) or the stricter 7:1; if the pipeline
   emits real charts, check each graphical mark vs its background against 3:1. What a checker
   *cannot* verify: whether a low-contrast element is "decorative" (exempt) or meaningful —
   that is human judgement.

**APCA's current standing.** The Advanced Perceptual Contrast Algorithm is a *perceptual*
model built to fix a real WCAG-2 flaw: the L1/L2 luminance-ratio method can score some
high-contrast pairs lower than some lower-contrast pairs because it does not match
perception, and it handles dark mode poorly
(<https://github.com/Myndex/SAPC-APCA/blob/master/documentation/WhyAPCA.md>;
<https://data.europa.eu/apps/data-visualisation-guide/colour-contrast>). **Status: not
normative.** It is being explored for **WCAG 3.0 ("Silver")**, which as of the current W3C
Working Draft is explicitly *informative, not expected to become a Recommendation in its
present form* (<https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/>;
<https://w3c.github.io/silver/explainer/>). So gate the build on **WCAG 2.2 ratios** (stable,
normative, trivially computable) and optionally *report* APCA as advisory, since it better
predicts real legibility on dark themes — but do not fail a build on APCA while it is
non-normative. `[CONTESTED]` (APCA better predicts perception; WCAG 2.2 is the normative
floor).

### 13.2 Minimum legible type size, derived from visual angle

**Concept — the folk rule "use ≥24 pt" has no vision-science content, because a point size
means nothing without a viewing distance.**

1. *Principle.* The correct variable is **visual angle** — the size of the letter on the
   retina — because that is what the visual system resolves.
2. *Why it is true / the governing numbers* (Legge & Bigelow, *Does Print Size Matter for
   Reading?*, J Vis 2011, <https://pmc.ncbi.nlm.nih.gov/articles/PMC3428264/>):
   - **Fluent range:** text is read at *maximum speed* over a ~10× range of angular
     x-height, **~0.2° to ~2°**.
   - **Critical Print Size (CPS):** the smallest x-height that still gives max speed;
     consensus **0.2° x-height** for normal vision (below it, reading speed falls sharply).
   - **Conversion:** `Angular size (°) = 57.3 × physical size / viewing distance` (same
     units). Rule of thumb at 40 cm reading distance: `VA° = point size / 20`.
   - **x-height vs body size:** x-height averages ~**0.46–0.52** of font size for screen
     faces (digital screen fonts mean 0.52). To hit a target *x-height* angle, divide by the
     x-height fraction (~0.5) to get the font size. `[EVIDENCE]`
3. *Consequence — the derivations, both canvases:*

   *Case 1 — projected in a room.* Take a 3 m-wide projected image viewed from ~6 m (a
   typical mid-room seat) `[ASSUMPTION]` on room geometry. A 1920 px-wide canvas → 3000 mm,
   so **1 px ≈ 1.5625 mm** on the wall. Physical x-height for 0.2° at 6000 mm:
   `mm = (0.2 / 57.3) × 6000 = 20.9 mm` → **≈ 13.4 px x-height** → at x-height fraction 0.5,
   **≈ 27 px font-size** as the absolute floor; the comfortable 0.3° target → **≈ 40 px
   font-size**. The back row (~12 m) doubles those: floor ~54 px, comfortable ~80 px. This is
   why room decks use very large type — and why "24 pt" (≈ 32 px) is marginal even mid-room
   and fails at the back.

   *Case 2 — watched on a phone.* A 1080×1920 portrait video on a ~6.5" phone (~150 mm tall
   screen showing the 1920 px dimension) viewed at ~35 cm `[ASSUMPTION]` on handheld distance
   (Shieh & Lee report ~36 cm, cited within Legge & Bigelow). The 1920 px maps to ~150 mm, so
   **1 px ≈ 0.078 mm**. Physical x-height for 0.2° at 350 mm:
   `mm = (0.2 / 57.3) × 350 = 1.22 mm` → **≈ 15.6 px x-height** → **≈ 31 px font-size** floor;
   comfortable 0.3° → **≈ 47 px font-size**.

   **Consolidated minimum-size table** (px on the *canvas*; floor = 0.2° CPS, comfortable =
   0.3°; the room case dominates, so a deck that must work both projected and on a phone
   should use the larger room numbers):

   | Role | Angular target | 1920×1080 (room ~6 m) floor / comfortable | 1080×1920 (phone ~35 cm) floor / comfortable | Design recommendation (canvas px) |
   | --- | --- | --- | --- | --- |
   | Body / card text | ≥ CPS 0.2°, aim 0.3° | 27 / 40 | 31 / 47 | **≥ 40 px**, prefer 44–48 px |
   | Caption / source | ~0.2° (skim only) | 27 / — | 31 / — | **≥ 30 px**, never below 27 px |
   | Card title | ~0.35–0.4° | ~47 / 54 | ~55 / 63 | **≥ 56 px** |
   | Slide title | ≥ 0.6° (headline) | ~80+ | ~94+ | **≥ 90 px** |

   These agree with the *ratios* Legge & Bigelow measured in real publications: newspaper
   text → subhead → small-headline → large-headline steps are ~**2× each**. That is
   independent evidence for a **type scale with ~1.5–2× steps between roles** — which is also
   what makes the weight hierarchy *visible*: title, card-title, body and caption should be
   perceptibly different sizes, not fine gradations. `[EVIDENCE]`
4. *Failure mode.* A deck authored at "looks fine on my laptop" sizes, projected to a room
   where the back three rows cannot read the body text, or shrunk to portrait where captions
   fall under the CPS floor.
5. *How to check it.* Enforce minimum canvas px per role; verify the type scale has ~1.5–2×
   steps. Caveats worth stating: these floors are for *normal* vision (low-vision viewers need
   more, the same reason WCAG uses 4.5:1 not 3:1); and CPS is a *max-speed* floor, so a very
   short headline can go slightly under it because a few words read slowly is fine.

### 13.3 Line length and measure

**Concept — a glanced slide is not read prose, so its measure is a headline measure.**

1. *Principle.* Continuous prose reads best at **~45–75 characters per line, ~66 ideal**
   (Bringhurst, *The Elements of Typographic Style*) `[ASSUMPTION]` on the exact figures
   (widely reported, not verified against the page this session). But a slide card is
   *glanced*, closer to a headline or label, and wants **shorter** lines.
2. *Why it is true.* Below ~45 characters the eye makes too many return sweeps; above ~75 it
   loses the start of the next line. For a *glance*, the visual span (letters recognised per
   fixation) is ~**9–10 characters** and crowding — not letter size — limits it (Legge &
   Bigelow, "Visual Span and Crowding"). You want text taken in few fixations, i.e. short.
   `[EVIDENCE]` for visual span and crowding.
3. *Consequence.* Target **~30–45 characters per line** for a glanced card. Converting to px
   at the body minimums (mean lower-case width ≈ x-height): on 1920×1080 with ~44 px body →
   x-height ≈ 22 px ≈ mean char width → **45 chars ≈ 990 px** max text column (comfortable
   ~600–900 px). On 1080×1920 portrait, 45 chars ≈ 990 px exceeds the width minus margins, so
   portrait cards should cap nearer **~30 chars (~660 px)**. Portrait forces shorter card text
   than landscape — a card that fits landscape can overflow portrait.
4. *Failure mode.* A wide card whose text runs 90 characters edge to edge; the eye loses the
   next line's start. Or portrait cards inherited from a landscape layout that now wrap
   awkwardly or clip.
5. *How to check it.* A per-canvas character-count advisory per card line (warn ~>45
   landscape, ~>30 portrait) is a cheaper early signal than full pixel measurement.

### 13.4 Colour

**Concept — never colour alone, and emphasis must survive greyscale.**

1. *Principle.* Information must not be conveyed by colour as the *only* visual means
   (WCAG **1.4.1 Use of Colour**, Level AA). `[EVIDENCE]`
2. *Why it is true.* ~8% of men have a colour-vision deficiency; red/green is the common
   confusion. If pass/fail or us/them is *only* red/green, those viewers lose the
   information.
3. *Consequence.* Before/after, us/them, pass/fail must *also* differ by label, position,
   icon or pattern — not just hue. Use tested colour-blind-safe palettes:
   - **Okabe–Ito Color Universal Design palette** — the most-cited CVD-safe *qualitative*
     palette, 8 colours distinguishable under protan/deutan/tritan vision:
     `#000000` black, `#E69F00` orange, `#56B4E9` sky blue, `#009E73` bluish green,
     `#F0E442` yellow, `#0072B2` blue, `#D55E00` vermilion, `#CC79A7` reddish purple (plus
     `#999999` grey). Okabe & Ito, *Color Universal Design* (2008); hex confirmed at
     <https://siegal.bio.nyu.edu/color-palette/> (base-R `palette.colors("Okabe-Ito")`). This
     is the right *categorical* palette for distinguishing cards/series/states. `[EVIDENCE]`
   - **ColorBrewer** (Cynthia Brewer) — the standard for *sequential* and *diverging* scales,
     with explicit "colorblind safe" filtering (<https://colorbrewer2.org>). Use diverging
     schemes (RdBu, BrBG) for above/below-reference data. `[EVIDENCE]`
   The A2/12.3 "highlight one, grey the rest" technique must survive desaturation or it fails
   1.4.1: convert the slide to greyscale and confirm the hero still stands out by
   **luminance** (not just hue). Okabe–Ito is partly designed for this — its colours differ
   in luminance, not only hue. So honest emphasis is *luminance + hue + one more channel*
   (size/position/label), never hue alone.
4. *Dark-theme issues.*
   - **Pure black (#000) backgrounds cause halation** — bright text on pure black
     smears/vibrates for many readers, especially with astigmatism; use a dark grey (~#121212)
     instead. This is the documented reason dark-mode guidance avoids pure black.
     `[ASSUMPTION]` (halation well-documented; the specific #121212 is convention, not a
     measured threshold).
   - **Thin weights fail on dark.** Light text on dark appears to "bloom", eroding thin
     strokes; on dark themes prefer heavier weights and avoid hairline fonts. `[EVIDENCE]`
     (WCAG 1.4.3 anti-aliasing note applies doubly on dark).
   - **WCAG's ratio is symmetric but perception is not** (APCA's core complaint); a pair that
     passes 4.5:1 on light may look weaker inverted on dark — give dark-theme text extra
     contrast margin. `[CONTESTED]`.
5. *How to check it.* Greyscale-convert and confirm the hero still leads; verify no
   information rides on hue alone; confirm palette is Okabe–Ito / ColorBrewer.

### 13.5 Typography for legibility at distance and small size

**Concept — some good typefaces fail on a projector or under video compression, for reasons
you can name.**

1. *Principle.* Choose faces with high x-height fraction, open counters, low stroke-contrast
   and moderate weight (heavier on dark).
2. *Why it is true (the vision-science reasons):*
   - **x-height fraction.** Larger x-height = larger effective letters at a given font-size;
     screen legibility tracks x-height fraction (Verdana 0.55 > Georgia 0.48 > Times New
     Roman 0.45 in threshold legibility, Sheedy et al. 2005, reported in Legge & Bigelow).
     Choose faces with x-height fraction ≥ ~0.5. `[EVIDENCE]`
   - **Counters and apertures.** Open counters survive blur and small size; tight counters
     fill in when compressed or projected, because small/blurred letters are recognised by
     *low* spatial frequencies (coarse features), and fine detail is lost first
     (Legge & Bigelow, "Spatial-Frequency Representation"). `[EVIDENCE]`
   - **Weight contrast.** High-contrast faces (Didone display types — thin hairlines against
     thick stems) lose the hairlines to projector glare and video compression; prefer
     low-to-moderate stroke-contrast faces. `[EVIDENCE]` (same anti-aliasing failure as
     WCAG 1.4.3).
   - **Letter-spacing for uppercase.** All-caps and small-caps need positive tracking because
     caps were spaced for mixed-case; tight all-caps crowds (the crowding mechanism of 13.2–
     13.3). Add letter-spacing to any uppercase pill/label. `[PRACTICE]`
   - **Line-height (leading).** Comfortable body leading is **~1.4–1.6× font-size** for
     multi-line screen text; large display headlines can go tighter (~1.05–1.2×). WCAG 1.4.12
     sets a **1.5 line-height minimum** for user-overridable text
     (<https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html>). `[ASSUMPTION]` on the
     1.4–1.6 / 1.05–1.2 ranges (web-typography convention, not a single measured optimum);
     `[EVIDENCE]` on the WCAG 1.5 minimum.
3. *Consequence.* Net font rule: x-height fraction ≥ 0.5, open counters, low stroke-contrast,
   moderate weight, heavier on dark. A low-x-height face also needs a *bigger* font-size to
   hit the same angular x-height (feeds 13.2).
4. *Failure mode.* An elegant high-contrast serif chosen in a browser preview whose hairlines
   disappear on the projector; or a hairline-weight body font that blooms away on a dark theme.
5. *How to check it.* Preview on the actual delivery medium (projector, compressed encode),
   not just the design monitor.

### 13.6 Safe areas and keep-out zones

**Concept — a video frame reserves regions that a slide never had; content outside them is
cropped or covered.**

1. *Principle.* Keep general content inside the broadcast title-safe box, and keep anything
   that must survive a feed inside a tighter platform-safe box that subtracts the app's chrome.
2. *Why it is true / the numbers:*
   - **Broadcast title-safe and action-safe** (from CRT overscan, standardised in SMPTE
     ST 2046 / EBU R95): **action-safe = inner ~93%** (≈ 3.5% inset each edge), **title-safe =
     inner ~90%** (≈ 5% inset each edge). `[EVIDENCE]`

     | Canvas | Title-safe (90%) inset | Title-safe content box |
     | --- | --- | --- |
     | **1920×1080** | 96 px L/R, 54 px T/B | x∈[96,1824], y∈[54,1026], 1728×972 |
     | **1080×1920** | 54 px L/R, 96 px T/B | x∈[54,1026], y∈[96,1824], 972×1728 |

   - **Platform UI keep-out zones.** Feed platforms overlay chrome *on top of* the picture,
     outside the safe area. No platform publishes an authoritative pixel keep-out map, so these
     are community-measured — `[ASSUMPTION]`, verify against the current app. Derived for
     **1080×1920 (9:16)** — the high-risk canvas: right edge action buttons occupy roughly the
     **right ~120–140 px** in the lower ~60% of frame; **bottom** caption/username/CTA occupy
     roughly the **bottom ~320–420 px** (≈17–22%); **top** ~110–210 px for tabs/chrome. Net
     safe content box for 9:16: roughly the **central column ~820 px wide × from ~210 px top to
     ~420 px bottom** — much smaller than the raw frame, which is why portrait layouts must
     carry less. For **1920×1080** on YouTube/LinkedIn the main keep-out is the **bottom
     ~120–150 px** (scrubber/controls plus caption band) and a modest bottom-right — landscape
     is far more forgiving.
3. *Consequence.* Carry two nested boxes per aspect: the broadcast title-safe box (90%) for
   general content, and the tighter platform-safe box for anything that must survive a feed.
   The portrait platform-safe box is the binding constraint on how much a 9:16 slide can hold.
4. *Failure mode.* A stat anchored bottom-centre that the platform's caption bar covers; a
   title in the top band hidden behind the "For You" tab.
5. *How to check it.* Overlay the safe boxes on the render and confirm no essential content
   enters a keep-out zone.

**Caption placement, line length and reading-speed limits (broadcast standards).** Captions
are not an afterthought layer; on a video frame they are a **reserved region** that
constrains everything beneath. The standards:

| Source | Limit | Notes |
| --- | --- | --- |
| **BBC Subtitle Guidelines** | **160–180 wpm**; >200 wpm "difficult for many"; **0.3–0.375 s/word**, min ~0.3 s/word (1.2 s for a 4-word cue) | Ofcom-aligned. §4, §4.1 |
| **Netflix (English adult)** | **17 CPS** adult, **13 CPS** children | ≈ BBC's ~15–17 CPS |
| **Netflix (general)** | Duration **5/6 s (0.83 s) min – 7 s max** per event; **2 lines max**; centre-justified, top or bottom | |
| **FCC / Ofcom** | require *readable, accurate, synchronized* captions but set **no single numeric CPS limit** | regulatory floor is qualitative |

`[EVIDENCE]` (BBC Subtitle Guidelines
<https://www.bbc.co.uk/accessibility/forproducts/guides/subtitles/>; Netflix Timed Text Style
Guide <https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617-Timed-Text-Style-Guide-General-Requirements>).
Convergent working ceiling: **~15–17 CPS / ~160–180 wpm**, **~0.3 s/word minimum on-screen**,
**minimum cue ~0.83 s**, **maximum ~7 s** (a cue left up longer gets re-read).

- **Line count:** 2 lines max for 16:9 / 4:3 / 1:1; **3 lines max for 9:16**. `[EVIDENCE]`
- **Line length:** broadcast Teletext cap **37 characters**; online defined by width —
  ≤68% of a 16:9 width, ≤90% of a 4:3/1:1/9:16 width. BBC's equivalence: 37 chars in a
  75%-width 16:9 region ≈ **25 chars** in a 90%-width 9:16 region. A portrait caption line
  holds ~25 characters where a landscape line holds ~37 — captions must be **re-wrapped per
  aspect**. `[EVIDENCE]`
- **Vertical placement:** bottom by convention, inside the safe area; in **9:16, ride higher**
  (still lower third) because faces sit in the top half and platform chrome eats the bottom.
  Where a **9:16 letterbox** exists, put captions in the empty bar *below* the footage, freeing
  the picture entirely. `[EVIDENCE]`/`[PRACTICE]`
- **Break at linguistic points** (after punctuation, before conjunctions/prepositions; never
  split article+noun, preposition+phrase, pronoun+verb). Prefer editing/timing over a bad break.
  `[EVIDENCE]`
- **Font size:** authored line height 7–8% of video height for 16:9/4:3/1:1; 3.9–4.5% for 9:16
  (the 8% × 9/16 adjustment, so text is the same physical size after rotation). May scale down
  on large screens but never up. `[EVIDENCE]`
- **Styling:** BBC's most robust default is **white text (#FFFFFF) on a solid black box**,
  applied per line, extended 0.5 em each side, no gap between lines. The black/near-black box
  guarantees legibility over *any* footage. Speaker colours (yellow/cyan/green on black) exist
  for multi-speaker disambiguation only. Avoid coloured backgrounds and emoji glyphs (hard to
  see — BBC uses ♫ U+266B not 🎵). `[EVIDENCE]`

**How the caption band constrains the layout.** The caption band is a **keep-out zone** for
slide content. In 16:9 it is roughly the bottom ~10–15%; in 9:16 it rides higher and is larger.
Content — especially the dominant card, a stat, or a lower-third label — must not live in the
band, or the caption covers it. Every layout's video rule should declare a caption-safe bottom
band. This is a genuine gap between a deck (full canvas) and a video frame (reserved band).
`[PRACTICE]`

### 13.7 Accessibility of the artefacts themselves

**Concept — rasterising a slide destroys everything a screen reader can use, so the argument
must be emitted as text alongside the picture.**

1. *Principle.* Emit structured text alongside any rasterised or video artefact so a non-visual
   reader receives the argument.
2. *Why it is true.* An HTML slide exposes real text, headings and structure to a screen
   reader. A **rasterised** slide (PNG) or a **video frame** is, to assistive tech, an opaque
   picture — *all* semantic structure is lost; only alt text / a long description recovers it. A
   tagged PDF sits in between: it can carry reading order and alt text, but only if tagged; an
   untagged export is nearly as opaque as an image. WCAG itself points at emit-the-text-alongside
   as the mitigation: images of text "don't scale as well… use text wherever possible" (1.4.3),
   and for graphics, information "available in another form, such as in a table… or a Long
   Description" satisfies non-text contrast (1.4.11). `[EVIDENCE]`
3. *Consequence — what a pipeline should emit* (all deterministic, offline, free):
   - **Per-slide alt text / structured text** — the slide's title + card labels + any stat and
     its context, emitted as a machine-readable sidecar rather than only baked pixels. Nearly
     free if the author already writes structured content.
   - **A full structured-text transcript in reading order** — which doubles as the narration
     script and the screen-reader path. For a *narrated* deck the narration text *is* the alt
     text; emit it as captions (WebVTT) on the video and as the slide transcript.
   - **Chart/figure long descriptions** — a required text description of what a chart shows and
     concludes (the 12.3 takeaway sentence is most of it). Per 1.4.11, printing the values as
     text can exempt the graphic from the 3:1 graphical-object rule *and* serve the non-visual
     reader.
   - **A real caption track on the video, not burned-in only** — burned-in subtitles help some
     viewers but are invisible to screen readers and untranslatable; emit a WebVTT track as well.
4. *Failure mode.* A beautiful rasterised deck or MP4 that is, to a blind user, a blank
   rectangle — the entire argument inaccessible.
5. *How to check it.* Confirm every rasterised/video artefact ships with a text sidecar
   (per-slide alt + reading-order transcript + chart descriptions) and a real caption track.

---

## Chapter 14 — Myths, contested claims and open questions

A cleanup chapter, and an important one. Much presentation advice is repeated confidently and
sourced to nothing. This chapter separates three tiers: **myths** (repeat as fact and you are
citing an invention), **contested questions** (the evidence genuinely conflicts and an honest
reader holds both), and **open questions** (the research could not settle them, so you should
know the edge of what is known).

### 14.1 Myths — for each: the claim, where it came from, what the evidence says, the replacement

**Dale's Cone and the fabricated retention percentages.** `[MYTH]`
- *The claim.* People remember "10% of what they read, 20% of what they hear, 30% of what they
  see, 50% of what they see and hear, 70% of what they say, 90% of what they do," usually pinned
  to a "Dale's Cone of Experience / Cone of Learning."
- *Where it came from.* Edgar Dale's actual Cone (1946/1969) **had no numbers**; the percentages
  were invented and grafted on later. No study produces those neat round figures. Refutations:
  Subramony (2003); Molenda; ASEE "A Refutation of the Percentages Often Associated with Edgar
  Dale's Cone of Learning" (<https://peer.asee.org/5410.pdf>) and "Toward Eliminating an
  Unsupported Statement…" (<https://peer.asee.org/4575>); "Myths of Active Learning: Edgar Dale
  and the Cone of Experience" (<https://www.researchgate.net/publication/301754925>).
- *What the evidence says.* Any guidance citing these percentages is citing a myth.
- *The replacement.* The defensible, evidence-based versions of the underlying intuition are:
  words + pictures beat words alone (multimedia effect, d ≈ 1.35–1.67); pictures are remembered
  better than words (picture superiority); and generating/doing beats passive intake (generation
  effect) — all real, none quantified as tidy round percentages.

**6×6 and similar bullet rules.** `[MYTH]`
- *The claim.* "No more than 6 bullets per slide, 6 words per bullet" (and variants: 5×5, 7×7).
- *Where it came from.* Presentation folklore, often mis-derived from Miller's 7±2.
- *What the evidence says.* Miller's 7±2 is itself misapplied (see below); the deeper problem is
  that the *bullet list under a topic headline* triggers the redundancy penalty (reading while
  listening) and fails the multimedia principle (text-only), regardless of how many bullets. The
  count is not the lever.
- *The replacement.* One assertion per slide, stated as a sentence headline, supported by *visual*
  evidence, not a bulleted list (assertion-evidence; Alley's sentence-headline group scored 79%
  vs 69%, p<0.001). Cap distinct ideas at ~4 (Cowan), not bullets at 6.

**Miller's 7±2 as an item limit.** `[MYTH]`
- *The claim.* Interfaces/slides should cap at ~7 items.
- *Where it came from.* Miller (1956), "The Magical Number Seven, Plus or Minus Two."
- *What the evidence says.* Miller explicitly treated 7 as "a rough estimate and a rhetorical
  device," half-joked the integer was "persecuting" him, and his *central* point was **chunking**,
  not a cap. He never said slides should cap at seven of anything. Cowan (2001) shows the real
  central capacity, once chunking and rehearsal are stripped out, is **3–5 items, ~4 on average**.
- *The replacement.* Cap distinct top-level items at ~4; use chunking (a titled group) to hold
  more.

**10-20-30.** `[MYTH]`
- *The claim.* Guy Kawasaki's "10 slides, 20 minutes, 30-point font."
- *Where it came from.* Kawasaki's blog, from his VC pitch experience.
- *What the evidence says.* It is a useful heuristic for one genre (the VC pitch) with no
  experimental backing as a general law; the 30-point font in particular is a distance-blind folk
  rule (Chapter 13 shows font size must be derived from visual angle, not fixed at a point size).
- *The replacement.* Segment ruthlessly and front-load value (both defensible); size type by
  visual angle (Chapter 13); let length follow audience motivation (14.2), not a fixed slide count.

**The golden ratio and rule of thirds.** `[MYTH]` (as *laws* of good layout)
- *The claim.* Good composition must place elements on golden-ratio or rule-of-thirds lines.
- *Where it came from.* Classical art/photography convention, imported into slide design.
- *What the evidence says.* These are aesthetic conventions with no controlled evidence that they
  improve *comprehension* or *followability* — the aims this document judges against. They may
  please the eye; they do not demonstrably help a viewer find the most important thing.
- *The replacement.* Make the visual hierarchy monotonic with the information hierarchy (the
  heaviest information in the most dominant slot) — that *is* evidence-linked (signalling; scene
  gist read in ~100 ms). Composition grids are optional polish, not the mechanism.

**Z-pattern (and F-pattern) reading as a layout law.** `[MYTH]` (as a universal)
- *The claim.* Eyes always sweep a slide in a fixed "Z" (or "F") path, so lay content along it.
- *Where it came from.* Web-usability eye-tracking (notably F-pattern findings on text-heavy
  pages) over-generalised into a universal law for all layouts.
- *What the evidence says.* Gaze path is *driven by visual salience and task*, not a fixed
  geometric template — the ~100 ms scene-gist finding shows the viewer first parses *structure*
  (which block is biggest, where the focal point is) and *then* reads. A strong focal point
  overrides any default sweep.
- *The replacement.* Set the reading order with weight and salience (size, contrast, position,
  motion), not by trusting a template path.

**The unsourced whitespace figure.** `[MYTH]`
- *The claim.* Specific figures such as "whitespace increases comprehension by 20%" (or similar
  round numbers).
- *Where it came from.* Design blogs, untraceable to a study.
- *What the evidence says.* The *direction* is supported — removing extraneous, non-load-bearing
  material helps (coherence principle, d ≈ 0.7–1.32) — but the specific percentage is invented.
- *The replacement.* Cite the coherence principle for "remove what does not carry information";
  do not attach a fabricated percentage to whitespace.

**Mehrabian 7-38-55.** `[MYTH]` (as applied to presentations)
- *The claim.* "Communication is 7% words, 38% tone, 55% body language," used to argue slides/words
  barely matter.
- *Where it came from.* Albert Mehrabian's narrow experiments on *incongruent* messages about
  *feelings and attitudes* — not a general communication law. Mehrabian himself warned against the
  generalisation. (The reports in this research corpus did not treat Mehrabian as load-bearing; it
  is included here for completeness because it is a pervasive presentation-advice myth.)
  `[ASSUMPTION]` that the corpus did not directly cover it.
- *What the evidence says.* It does not generalise to whether words or slide content matter; the
  content principles in this document (multimedia, signalling, contiguity) are what have evidence.
- *The replacement.* Judge content by the multimedia-learning evidence, not by 7-38-55.

**"Optimal video length is N minutes."** `[MYTH]` as a fixed number (and see 14.2 for the real
contested version)
- *The claim.* A single best length (commonly "under 2 minutes," "6 minutes," etc.).
- *Where it came from.* Marketing-blog content without published method; the "6-minute" figure was
  a real MOOC finding (Guo 2014) over-generalised.
- *What the evidence says.* The one *well-grounded* lever is the opening: YouTube's own analytics
  define the "Intro" metric as the percentage still watching after the first 30 seconds
  (<https://support.google.com/youtube/answer/9314415>), so the opening must deliver the payload
  immediately. Specific drop-off percentages ("20–30% lost in 30 s") are marketing-blog figures,
  flagged unreliable. Chapter markers aid *findability*, not demonstrably *retention*.
- *The replacement.* Front-load value in the first few seconds (evidence-backed); treat total
  length as audience-dependent (14.2), not a baked constant.

### 14.2 Contested questions — hold both

**Optimal instructional-video length: the MOOC vs college-lecture conflict.** `[CONTESTED]`
- **Guo et al. 2014** (MIT/edX, 6.9M MOOC video sessions): median engagement drops sharply after
  **6 minutes**; shorter videos far more engaging — the origin of the "6-minute rule."
  (<https://3dvar.com/Guo2014How.pdf>) `[EVIDENCE]`
- **Lagerstrom et al. 2015, "The Myth of the Six-Minute Rule":** in *for-credit college* courses,
  students watched a **median of ~12–13 minutes** per session (mean ~17–20) and *preferred
  ~15-minute* videos. The 6-minute finding was context-bound to MOOCs and is misapplied elsewhere.
  (<https://www.researchgate.net/publication/283479581>) `[EVIDENCE]`
- *How to hold both.* Do not hardcode a length. Segment ruthlessly (each segment single-idea, a
  few minutes) but total length can be longer for a *motivated* audience (college/for-credit/
  committed) and must be shorter for a *casual* one (MOOC/marketing/cold). **Motivation, not a
  magic number, sets total length.**

**The exact card/chunk ceiling.** `[CONTESTED]`
- Cowan's central capacity is **3–5 items, ~4 on average**, and adults recall only **3–4** longer
  verbal chunks such as short sentences. Whether the everyday slide ceiling should be **4** (strict
  reading of Cowan under system-paced, no-rehearsal conditions) or **5** (a chunked hub-plus-four
  can work) is not settled by a single measurement. The defensible synthesis: everyday ceiling ~4;
  allow a 5th only when one element demonstrably *chunks* the rest (a hub). `[EVIDENCE]` for the
  3–5 range; the exact slide cap is a judgement within it.

**When redundant on-screen text helps versus harms.** `[CONTESTED]`
- Mayer's redundancy principle: full verbatim spoken + written text *hurts* (removing it improves
  learning, d ≈ 0.69, 10/10 tests). But there are real, argued exceptions:
  - **Reverse redundancy for non-native speakers / unfamiliar terms:** synchronised redundant
    on-screen text *reduces* load and *helps* (Moreno & Mayer 2002b, "Verbal redundancy in
    multimedia learning: when reading helps listening," <https://doi.org/10.1037/0022-0663.94.1.156>;
    "Redundancy effect… a closer look," <https://www.researchgate.net/publication/228947987>).
    Helps when text is **short**, next to the graphic, with **no competing animation**.
  - **System-paced vs self-paced:** harm is worse when the viewer cannot control pace (video),
    because they cannot resolve the read-vs-listen race.
  - **Synchronised captions are not the harmful case:** verbatim *synchronised* captions help
    accessibility and non-native viewers and do not reliably hurt natives; Mayer's caution is about
    *unsynchronised/self-paced* duplicate prose beside a graphic.
- *How to hold both.* Keywords-only under narration for a native/expert audience; allow
  **synchronised** short key terms for a non-native or highly technical audience; always allow a
  separate synchronised caption track. `[EVIDENCE]` on both directions.

**Expertise reversal — density advice is audience-dependent.** `[CONTESTED]` (in the sense that
there is no single correct density)
- Techniques that help novices (worked examples, extra explanatory text, scaffolding, redundant
  on-screen text) become useless or *harmful* for experts, because processing redundant support
  conflicts with the expert's existing schema and itself becomes extraneous load (Kalyuga, Ayres,
  Chandler & Sweller 2003, "The Expertise Reversal Effect,"
  <https://www.researchgate.net/publication/48829036>). `[EVIDENCE]`
- *The consequence.* There is **no single correct information density.** A slide for a board of
  experts should be sparser and faster than the same content for newcomers; scaffolding that helps
  one insults and slows the other. Density should be a function of *declared audience expertise*,
  not a fixed per-layout constant. This is why any "always use N words / N cards" rule is
  suspect — it hides an audience assumption.

**Tufte minimalism (data-ink) vs readability/memorability.** `[CONTESTED]` — see 12.1: maximising
data-ink to the extreme can harm the audience that must *remember* a chart; some non-data ink aids
comprehension. Declutter competing ink; keep helpful labels and light structure.

**Line chart zero-baseline.** `[CONTESTED]` — see 12.4: bars must baseline at zero (FT states it),
but for line charts a non-zero baseline can be legitimate if signalled (FT links both the ONS
"start at zero" and Vox "OK not to" positions). Report the conflict rather than banning either.

### 14.3 Open questions — the edges of what is known

These the research could not settle; a reader should know they are unresolved rather than assume a
number exists:

- **Within-presentation refocus cost after an interruption.** The widely-cited "23 minutes 15
  seconds to refocus" is **Gloria Mark's** workplace interruption research
  (<https://www.ics.uci.edu/~gmark/chi08-mark.pdf>), *routinely misattributed* to Leroy's
  attention-residue work, and it is about workplace task-switching — it does **not** transfer
  literally to a viewer's recovery *within* a presentation. The exact within-presentation recovery
  cost is not well quantified. `[ASSUMPTION]` / open.
- **24-hour retention from a presentation.** There is no credible single universal "you remember
  X% a day later" figure for presentations; retention depends on encoding, testing, spacing and
  prior knowledge. The honest statement: most *detail* decays fast (Ebbinghaus) while the *gist*
  and a few signalled key points survive — an argument for one clear message per slide and a
  repeated through-line, not a percentage. Treat any such blog number as unsupported. Open.
- **The exact WPM comprehension optimum for narrated-slide video specifically.** The 130–160 wpm
  band is well-corroborated planning guidance, but none of the sources is a controlled study of
  *comprehension vs rate for narrated-slide video*. The subtitle reading ceiling (~180 wpm) is the
  hard bound; the comfortable optimum within the band is not precisely established. Open.
- **Platform UI keep-out pixel maps.** No platform publishes an authoritative keep-out map; the
  figures in Chapter 13 are community-measured and shift with app versions. Verify against the
  current app. `[ASSUMPTION]` / open.
- **The precise card/chunk ceiling** (4 vs 5) and the **exact glanced-table row/column caps**
  (~6–8 rows, ~4–5 columns) are derived, not measured on real decks. Open within known bounds.
- **Effect-size discrepancies between Mayer editions.** Coherence is reported as 10/11 tests at
  d = 1.32 in the Cambridge Handbook versus 23/23 at d = 0.86 in an earlier consolidation; both
  are cited here so the discrepancy is visible rather than hidden. The effect is robustly positive;
  its exact magnitude varies by edition and test set.

---

### A closing note on how to read this evidence

The strongest empirical spine under all of Part C is Mayer's multimedia-learning corpus (temporal
contiguity d ≈ 1.22–1.30, redundancy d ≈ 0.69, coherence d ≈ 0.7–1.32, signalling d ≈ 0.4–0.6) and
the vision-science thresholds (WCAG contrast ratios; Legge & Bigelow's CPS and fluent range;
broadcast caption limits). Those are load-bearing. Most of the rest — narrative frameworks,
editorial technique, motion conventions, chart-choice frameworks — is codified professional
practice: valuable, convergent across independent sources, but not experimentally proven as such.
And a stubborn residue is myth dressed as science. The point of tagging every claim is so a
practitioner can tell which is which, and weight their own decisions accordingly. When the evidence
is a large effect replicated many times, treat it as a constraint. When it is practice, treat it as
a strong default you may override with reason. When it is a myth, drop it.

---

## Chapter 15 — The reasoning compressed

This chapter is the reader's index back into the reasoning. Each row is a load-bearing
rule the document supports, the principle it follows from, the chapter that derives it,
its evidence strength, and whether it can be checked mechanically or requires human
judgement. Where a rule's evidence strength is mixed (a measured mechanism applied via a
reasoned heuristic), the *weakest* tag on the load-bearing part is shown, so the table
never overstates confidence.

| The rule | Principle it follows from | Chapter | Evidence | Check |
| --- | --- | --- | --- | --- |
| Design allocates attention; the most important thing gets the most | Attention is the scarce resource | 1 | [PRACTICE] | Human |
| A slide conveys one structured idea, fast, on first glance | A slide is neither a page nor a speech | 1 | [PRACTICE] | Human |
| The arrangement must say what matters before any word is read | Scene gist is parsed in ~100 ms (Greene & Oliva) | 2 | [EVIDENCE] | Human (squint) |
| Carry emphasis on one strong unique cue, not two shared weak ones | Feature Integration Theory; conjunction search | 2 | [EVIDENCE] | Human |
| Use the "undoubted" cues (colour, motion, orientation, size) for hierarchy | Wolfe & Horowitz attention-guidance tiers | 2 | [EVIDENCE] | Human |
| Make one thing loud by making the others quiet | Salience is relative, not absolute | 2 | [EVIDENCE] | Human (squint) |
| Area is a weak channel; use ≥2× area for unambiguous dominance | Cleveland & McGill perceptual-task ranking | 2, 4 | [EVIDENCE] mechanism / [ASSUMPTION] on ≥2× | Mechanical (area ratio) |
| Adjacent size levels must differ by ≥~1.2× to read as distinct | Weber's law / just-noticeable-difference | 2, 4 | [EVIDENCE] mechanism / [ASSUMPTION] on 1.2× | Mechanical (type ratio) |
| Size and luminance are the only cross-medium-safe carriers | Colour dies in greyscale; motion dies in a still frame | 2, 4 | [EVIDENCE] survival / [PRACTICE] rule | Mechanical (greyscale + freeze) |
| Cap distinct unrelated ideas at ~4; chunk to hold more | Cowan ~4-chunk working-memory limit | 3 | [EVIDENCE] limit / [PRACTICE] cap | Mechanical (count ideas) |
| Drive extraneous load to zero; remove non-informational elements | Cognitive Load Theory (Sweller) | 3 | [EVIDENCE] | Human |
| Integrate labels with the thing they label; no separate legend | Split-attention effect; spatial contiguity | 3, 12 | [EVIDENCE] | Human |
| There is no single correct density; it depends on audience expertise | Expertise reversal effect (Kalyuga et al.) | 3, 14 | [EVIDENCE] | Human |
| Exclude decoration and seductive details | Coherence principle (d ≈ 0.86–1.32) | 3, 7 | [EVIDENCE] | Human |
| One dominant element, and it is the one the narration is on | Signalling principle (d ≈ 0.4–0.6) | 3, 4 | [EVIDENCE] | Human |
| Under narration, on-screen text is keywords, not the spoken sentences | Redundancy principle (d ≈ 0.69) | 3, 10 | [EVIDENCE] | Mechanical (text-vs-script similarity) |
| A reveal must land when the narration reaches it | Temporal contiguity (d ≈ 1.22–1.30) | 3, 11 | [EVIDENCE] | Mechanical (align reveal to beat) |
| Space successive reveals by more than ~0.5 s | Attentional blink (~200–500 ms) | 3, 11 | [EVIDENCE] | Mechanical (reveal spacing) |
| Never introduce a new element on the same frame as a transition | Change blindness | 3, 11 | [EVIDENCE] | Mechanical |
| Importance belongs to the argument, not to text length | The text-length proxy is a category error | 4 | [PRACTICE] | Human |
| Hierarchy is not optional; only deliberateness is | A layout always encodes a hierarchy | 4 | [EVIDENCE] | Human (squint) |
| Design for three content weight levels, a fourth only when sparse | JND size budget + ~4-chunk limit converge | 4 | [EVIDENCE] ceiling / [PRACTICE] allocation | Mechanical (count levels) |
| Build hierarchy in size + luminance first, then add colour/motion | Cross-medium survival | 4 | [PRACTICE] | Mechanical (greyscale squint) |
| Run the squint test, in greyscale, on the final built state | It simulates the ~100 ms gist parse | 4 | [EVIDENCE] mechanism / [PRACTICE] test | Human |
| A presentation needs one spine (throughline) before slides | Linear delivery needs attachment points | 5, 6 | [PRACTICE] | Human |
| Choose framework family by the audience's job (persuade vs decide) | Persuasion builds tension; executive answers first | 5 | [CONTESTED] (families disagree) | Human |
| Each slide title is a sentence stating its takeaway | Assertion-evidence (Alley 79% vs 69%, p<0.001) | 5, 6 | [EVIDENCE] | Mechanical (verb/claim check) |
| Titles read alone should reconstruct the argument | Horizontal logic (Minto/McKinsey) | 6 | [PRACTICE] | Mechanical (title extraction) |
| Keep titles ≤ ~10–12 words / ~65–70 chars / 2 lines | A headline is grasped in one fixation pass | 6 | [ASSUMPTION] on the figure | Mechanical (word/char count) |
| The dominant element must prove the title's claim | Title asserts, weighted element proves | 4, 6 | [PRACTICE] | Human (cover-the-title test) |
| Pick one layout/grid and never hand-place elements | A grid lets the eye learn where to look | 7 | [PRACTICE] | Mechanical (position consistency) |
| Between-group gap ≥ 1.5–2× within-group gap | Gestalt proximity | 7 | [PRACTICE] | Mechanical (gap ratio) |
| A filled card is a common region; one label must cover its contents | Gestalt common region | 7 | [PRACTICE] | Human |
| Outer margins exceed inter-element gutters; one gutter value | Proximity: biggest gap at the boundary | 7 | [PRACTICE] | Mechanical (margin vs gutter) |
| Density tracks the slide's job: claims sparse, evidence dense | Coherence + active whitespace as emphasis | 7 | [EVIDENCE] basis / [PRACTICE] mapping | Human |
| Golden ratio, rule of thirds, Z-pattern are not layout laws | Refuted or unsupported for comprehension | 7, 14 | [MYTH] | — |
| Shape is a claim; the wrong shape is a false statement | The arrangement's proposition is read first | 8 | [PRACTICE] | Human (name the proposition) |
| A straight rail asserts an end; use a closing shape for a loop | Process ≠ cycle (SmartArt separates them) | 8 | [PRACTICE] | Mechanical (last→first edge?) |
| Bento cell size must encode priority; equal cells is not a bento | Weight → layout on a fixed grid | 8 | [PRACTICE] | Mechanical (cell-size variance) |
| Vertical is a different argument, not a reflow | Portrait has width for one column, height for many | 8 | [PRACTICE] | Human (same-claim test) |
| Side-by-side comparison and continuous matrix have no honest 9:16 form | Rotating axes / losing adjacency changes the claim | 8 | [PRACTICE] | Human |
| Repeat a layout for parallel content; change it for a section | Similarity across time signals same-kind | 9 | [PRACTICE] | Human |
| Open strong, close on the same message; do not bury the point mid-deck | Primacy and recency (serial-position effect) | 9 | [PRACTICE] on real memory effect | Human |
| In video, an unmotivated layout change reads as a scene break | Continuity-editing grammar | 9 | [PRACTICE] | Human |
| Keep conceptual openers and dividers; cut literal agendas and progress chrome | Advance organizer vs coherence penalty | 9, 14 | [CONTESTED]/[EVIDENCE] mixed | Human |
| The assertion per unit is constant across live/read/video | One storyline, three artefacts | 10 | [PRACTICE] | Human |
| A narrated slide cannot carry prose | Reading ~238 wpm outpaces speech ~150 wpm | 10 | [EVIDENCE] | Mechanical (read time vs narration) |
| Read decks are dense; video frames sparse (~50–60%, portrait ~40–50%) | Density forks by mode | 10 | [EVIDENCE] basis / [ASSUMPTION] figures | Mechanical (word budget) |
| Always burn in captions and surface the scene headline for silent viewers | ~85% of feed video is watched muted | 10 | [EVIDENCE] | Mechanical (caption + headline present) |
| Write narration for the ear: short sentences, subject before action | Speech is one pass; ~4-chunk memory | 11 | [EVIDENCE] basis / [PRACTICE] rules | Human (read aloud at 150 wpm) |
| Cut on meaning, not on a timer | Murch's Rule of Six (emotion+story = 74%) | 11 | [PRACTICE] | Human |
| Motion must carry information, never decorate | Motion captures involuntary attention | 11 | [EVIDENCE] mechanism / [PRACTICE] rule | Human |
| Transitions 300–500 ms (frame) / 150–250 ms (element); ease correctly | Material Design duration/easing spec | 11 | [EVIDENCE] | Mechanical (durations) |
| Honour reduced-motion; nothing flashes >3×/sec | WCAG 2.3.3, 2.2.2, 2.3.1 | 11, 13 | [EVIDENCE] | Mechanical |
| A presentation chart is a claim, not an exploration tool | Audience looks for seconds, not minutes | 12 | [PRACTICE] | Human (sentence title?) |
| Choose the chart from the message's comparison type | Zelazny / FT Visual Vocabulary / Abela | 12 | [PRACTICE] | Human |
| Annotated chart is default: highlight one series, grey the rest, direct labels | Preattentive processing + split attention | 12 | [EVIDENCE] mechanism / [PRACTICE] technique | Mechanical (one series saturated; labels present) |
| Bars must baseline at zero; line-chart baseline is contested | Bars encode magnitude by length | 12 | [EVIDENCE] bars / [CONTESTED] lines | Mechanical (bar axis) |
| A big number needs comparative context to be evidence | A bare number cannot be judged good or bad | 12 | [PRACTICE] | Human |
| ≤3 alternatives → cards; ≥4, or ≥3 attributes → table | Two is a contrast; four is a matrix | 12 | [PRACTICE] / [ASSUMPTION] on cutover | Mechanical (count) |
| Body text ≥40 px, title ≥90 px on a 1920-wide canvas | 0.2° critical print size (Legge & Bigelow) | 13 | [EVIDENCE] basis / [ASSUMPTION] room geometry | Mechanical (px per role) |
| Text contrast ≥4.5:1 (3:1 large); prefer 7:1; chart marks ≥3:1 | WCAG 2.2 (ISO/ANSI acuity rationale) | 13 | [EVIDENCE] | Mechanical (contrast ratio) |
| Never colour alone; emphasis survives greyscale; use CVD-safe palettes | ~8% of men have a colour-vision deficiency | 13 | [EVIDENCE] | Mechanical (greyscale + hue-only check) |
| Keep content inside title-safe (90%) and platform keep-out boxes | CRT overscan → SMPTE/EBU; feed chrome | 13 | [EVIDENCE] safe area / [ASSUMPTION] platform maps | Mechanical (overlay boxes) |
| Captions ~15–17 CPS, ≤2 lines (3 in 9:16), re-wrapped per aspect | BBC / Netflix caption standards | 13 | [EVIDENCE] | Mechanical (CPS, lines) |
| Emit structured text alongside any raster/video artefact | Rasterising destroys screen-reader semantics | 13 | [EVIDENCE] | Mechanical (sidecar present) |
| Drop Dale's Cone, 6×6, 7±2, 10-20-30, Mehrabian 7-38-55 | Fabricated or misapplied | 14 | [MYTH] | — |

---

## Glossary

**Pre-attentive attribute.** A basic visual feature (colour, motion, orientation, size,
luminance, closure) that the visual system registers in parallel across the whole field
*before* focused attention is applied. A target differing on one such feature "pops out"
and is found instantly. See Chapter 2.

**Feature Integration Theory (FIT).** Treisman & Gelade's account of why a target defined
by one unique feature is found in parallel (flat search time) while a target defined by a
*conjunction* of two features requires slow serial search. The design lesson: one strong
unique cue beats two shared weak ones. See Chapter 2.

**Scene gist.** The coarse structure of a scene — how many blocks, which is biggest,
where to look — extracted in a single glance (max accuracy ~100 ms; measurable from
19–67 ms). It is read before any word, which is why a layout must already say what
matters most. See Chapter 2.

**Salience.** How much an element draws the eye. Crucially it is *relative*: an element
pops in proportion to how different it is from its neighbours and how similar the
neighbours are to each other, not by how heavily the element itself is styled. See
Chapter 2.

**Saliency map.** A computed combination of feature maps (colour, luminance, orientation)
that predicts where an eye will fixate. It predicts well only when the viewer has *no
goal*; a task or a narration overrides it. See Chapter 2 (Itti & Koch).

**Just-noticeable difference (JND).** The smallest change in a stimulus a viewer can
detect, which by Weber's law is a roughly constant *fraction* of the stimulus. On a
slide, two sizes below ~1.2× apart read as "the same size, set sloppily." See Chapter 2.

**Cleveland & McGill ranking.** The ordering of visual channels by how accurately people
decode a quantity: position and length are read accurately, area poorly, colour worst.
The reason area is a weak channel and needs a large ratio to signal dominance. See
Chapter 2.

**Cognitive load — intrinsic, extraneous, germane.** The three demands sharing one
limited working-memory budget. *Intrinsic* is the material's inherent difficulty
(driven by element interactivity); *extraneous* is imposed by the presentation and is
what design controls; *germane* is the resource actually devoted to understanding. See
Chapter 3.

**Element interactivity.** How many elements must be held and related *at once* to
understand something; the real driver of intrinsic load. Chunking reduces the count that
must be juggled simultaneously. See Chapter 3.

**Chunking.** Grouping related items into a single labelled unit so one memory "slot"
holds more. Three groups of three are easier than nine loose items. See Chapter 3.

**Split attention.** The waste incurred when two sources that must be combined (a diagram
and its explanation) are separated in space or time, forcing the viewer to hold one while
hunting for the other. See Chapters 3 and 12.

**Expertise reversal.** The finding that support which helps novices (scaffolding,
redundant text, worked examples) becomes useless or harmful for experts, because it
conflicts with the schema they already hold. The reason there is no single correct
density. See Chapters 3 and 14.

**Cognitive Theory of Multimedia Learning (CTML).** Mayer's framework built on dual
channels, limited capacity, and active processing, from which the coherence, signalling,
redundancy, contiguity, segmenting, pre-training, modality and multimedia principles are
derived. See Chapter 3.

**Coherence principle.** Learning improves when extraneous words, pictures and decoration
are excluded (d ≈ 0.86–1.32). See Chapter 3.

**Signalling (cueing) principle.** Cues that highlight the essential material's structure
or location improve learning (d ≈ 0.4–0.6). The direct evidence that weight is a signal.
See Chapter 3.

**Redundancy principle.** Graphics + narration beats graphics + narration + verbatim
on-screen text (d ≈ 0.69). Applies to unsynchronised/self-paced duplicate prose, *not* to
synchronised captions. See Chapters 3, 10, 14.

**Spatial contiguity.** Corresponding words and pictures should be placed near each other
(d ≈ 0.89–1.11). See Chapters 3 and 12.

**Temporal contiguity.** Corresponding narration and animation should be presented
simultaneously, not in sequence (d ≈ 1.22–1.30 — the largest effect in the corpus). The
reason a reveal must land on the beat that names it. See Chapters 3 and 11.

**Segmenting.** Presenting a continuous lesson in learner-paced chunks (d ≈ 0.79). The
benefit shrinks when segments are system-paced (as in video). See Chapters 3 and 9.

**Modality principle.** Present accompanying words as narration rather than on-screen
text, moving verbal load off the overloaded visual channel onto the free auditory one
(d ≈ 1.0). See Chapter 3.

**Multimedia principle.** People learn better from words + pictures than from words alone
(d ≈ 1.35). See Chapters 3 and 8.

**Change blindness.** A large change goes unnoticed if it coincides with a disruption
such as a cut. Reveal changes on a held frame, not inside a transition. See Chapters 3
and 11.

**Attentional blink.** After detecting one target, a ~200–500 ms window in which a second
is likely missed. The reason to space successive reveals. See Chapters 3 and 11.

**Modular scale.** A type scale built by multiplying a base size by a fixed ratio per
step (e.g. major third 1.25). Ratios at or below ~1.125 do not clear the JND. See
Chapter 4.

**Measure.** The length of a line of text, counted in characters. Prose reads best at
~45–75 characters; a *glanced* card wants shorter (~30–45, fewer in portrait). See
Chapter 13.

**Gutter.** The consistent gap between columns or cells in a grid. Outer margins should
exceed the gutter so the frame reads as the container. See Chapter 7.

**Figure/ground.** The perceptual separation of a focal object (figure) from its
background (ground). A filled card surface is the slide's figure/ground device. See
Chapter 7.

**Gestalt principles.** The grouping laws (proximity, common region, similarity,
continuation, closure, connectedness, figure/ground) by which the visual system organises
elements — translated in Chapter 7 into testable gap, border and alignment rules.

**Active vs passive whitespace.** *Passive* (micro) space aids legibility between letters
and lines; *active* (macro) space is deliberately placed to isolate an element and create
emphasis. See Chapter 7.

**Advance organizer.** A higher-abstraction framing presented *before* the material to
activate prior knowledge — distinct from a literal agenda, which is not one. See Chapter
9.

**Critical print size (CPS).** The smallest angular x-height that still permits maximum
reading speed; consensus ~0.2° for normal vision. The floor from which minimum type sizes
are derived. See Chapter 13.

**Visual angle.** The size of a letter on the retina, the variable the visual system
actually resolves. A point size means nothing without a viewing distance. See Chapter 13.

**x-height.** The height of a lower-case letter without ascenders/descenders, ~0.46–0.52
of font size for screen faces. A higher x-height fraction means larger effective letters
at a given font size. See Chapter 13.

**Forced alignment.** An algorithm that takes an audio file and its transcript and returns
per-word start/end timestamps — the mechanism for placing a highlight or reveal on the
exact frame a word is spoken. See Chapter 11.

**J-cut / L-cut (split edit).** A cut where audio and picture change at different instants
— in a J-cut the next scene's audio starts before its picture; in an L-cut the current
audio continues over the incoming picture. Both make a cut feel motivated. See Chapter 11.

**Data-ink ratio.** Tufte's measure of the proportion of a chart's ink that presents data
rather than decoration; maximising it is the "declutter" discipline (contested in its
strongest form). See Chapter 12.

**Title-safe and action-safe.** Nested inset boxes inherited from CRT overscan and
standardised by SMPTE/EBU: action-safe ≈ inner 93%, title-safe ≈ inner 90%. Content
outside them risks being cropped. See Chapter 13.

**Keep-out zone.** A region a platform overlays with its own chrome (buttons, captions,
tabs) on top of the picture, into which essential content must not be placed. See Chapter
13.

**Halation.** The smearing/vibrating of bright text on a pure-black background for many
readers; the reason dark themes use a dark grey (~#121212) rather than #000. See Chapter
13.

**Characters per second (CPS).** The caption reading-speed limit (~15–17 CPS adult); above
~200 wpm most viewers cannot keep up. See Chapter 13.

**Forced alignment vs proportional timing.** Proportional (character-count) timing drifts
when speech rate varies; acceptable for captions within the 2 s tolerance, insufficient
for word-synced motion. See Chapter 11.

---

## Sources

Grouped by domain. **(Primary)** marks an original study, standard, spec, or a primary
practitioner's own statement of their method; **(Secondary)** marks a synthesis,
practitioner summary, or reporting of a primary source. URLs are preserved as cited in the
underlying research; some primary PDFs could not be fetched during that research and are
flagged in-text where a claim rests on a secondary characterisation.

### Perception and cognition

- Greene & Oliva (2009), *The Briefest of Glances: The Time Course of Natural Scene
  Understanding.* **(Primary)** https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2742770/
- Potter, conceptual short-term memory work. **(Primary)**
  https://www.researchgate.net/publication/22152100
- Oliva, *Gist of the Scene* (review). **(Secondary)**
  http://olivalab.mit.edu/Papers/Oliva04.pdf
- Treisman & Gelade (1980), *A Feature-Integration Theory of Attention*, Cognitive
  Psychology 12:97–136. **(Primary)**
- Wolfe & Horowitz (2017), *Five Factors that Guide Attention in Visual Search*, Nature
  Human Behaviour 1:0058. **(Primary)** https://pmc.ncbi.nlm.nih.gov/articles/PMC9879335/
  · https://www.nature.com/articles/s41562-017-0058
- Koch & Ullman (1985); Itti, Koch & Niebur (1998), IEEE PAMI 20(11), saliency model.
  **(Primary)** http://ilab.usc.edu/publications/doc/Itti_etal98pami.pdf
- Ware, *Information Visualization: Perception for Design*, 4th ed. (2021), Morgan
  Kaufmann. **(Primary)**
  https://www.scribd.com/document/591402459/Readings-02-Pre-attentive-attributes
- Cleveland & McGill (1984), *Graphical Perception*, JASA 79:531–554; Heer & Bostock
  (2010, CHI) replication. **(Primary)**
  https://info3312.infosci.cornell.edu/ae/graphical-perception-A.html · ranking summaries
  https://guides.lib.berkeley.edu/data-visualization/type ·
  https://arxiv.org/html/2212.10533v1
- Cleveland & McGill hierarchy re-examination ("three or four individual rankings").
  **(Secondary)** https://www.researchgate.net/publication/221249388
- Miller (1956), *The Magical Number Seven, Plus or Minus Two*, Psychological Review.
  **(Primary)** https://doi.org/10.1037/h0043158
- Cowan (2001), *The Magical Number 4*, Behavioral and Brain Sciences; Cowan (2010), *The
  Magical Mystery Four*, Current Directions in Psychological Science. **(Primary)**
  https://doi.org/10.1017/s0140525x01003922 ·
  https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2864034/
- Cowan, *The Legend of the Magical Number Seven* (on Miller's misapplication).
  **(Secondary)** https://www.researchgate.net/publication/255060875
- Sweller, Ayres & Kalyuga (2011), *Cognitive Load Theory*; Sweller (2019/2020),
  *Cognitive Architecture and Instructional Design: 20 Years Later*, Educational Psychology
  Review. **(Primary)** https://www.researchgate.net/publication/344435215
- Kalyuga, Ayres, Chandler & Sweller (2003), *The Expertise Reversal Effect*, Educational
  Psychologist. **(Primary)**
  https://www.researchgate.net/publication/48829036_The_Expertise_Reversal_Effect ·
  element-interactivity variant
  https://repository.lboro.ac.uk/articles/journal_contribution/The_expertise_reversal_effect_is_a_variant_of_the_more_general_element_interactivity_effect/12052695
- Mayer (2024), CTML (open access), Educational Psychology Review. **(Primary)**
  https://link.springer.com/article/10.1007/s10648-023-09842-1
- *Cambridge Handbook of Multimedia Learning*, ch. 12 (reducing extraneous processing) and
  ch. 13 (segmenting). **(Primary)**
  https://www.cambridge.org/core/books/cambridge-handbook-of-multimedia-learning/principles-for-reducing-extraneous-processing-in-multimedia-learning-coherence-signaling-redundancy-spatial-contiguity-and-temporal-contiguity-principles/C98AB3A6CE760DD63C048936EA0B3B44
  · https://resolve.cambridge.org/core/product/identifier/9781139547369%23C03520-13-1/type/BOOK_PART
- Devlin Peck, Mayer's principles synthesis with evidence-strength table. **(Secondary)**
  https://www.devlinpeck.com/content/mayers-principles-of-multimedia-learning
- Ginns (2006), contiguity meta-analysis (combined d ≈ 0.89). **(Primary)**
  https://inspire.acu.edu.au/articles/contiguity-present-words-and-pictures-in-the-same-place-and-at-the-same-time
- Rey et al. (2019), segmenting-effect meta-analysis. **(Primary)**
  https://www.researchgate.net/publication/330143605_A_Meta-analysis_of_the_Segmenting_Effect
- Moreno & Mayer (2002b), *Verbal redundancy in multimedia learning: when reading helps
  listening.* **(Primary)** https://doi.org/10.1037/0022-0663.94.1.156 · closer-look review
  https://www.researchgate.net/publication/228947987
- Mayer & Johnson, *Revising the Redundancy Principle.* **(Primary)**
  https://www.researchgate.net/publication/232540768
- Mayer, *Principles for reducing extraneous processing* (temporal contiguity 9/9, d).
  **(Primary)** https://www.researchgate.net/publication/262915119 · Cambridge chapter
  https://www.cambridge.org/core/books/abs/multimedia-learning/temporal-contiguity-principle/2236655CB3759154DF148595FF2EC1FC
- Brysbaert (2019), reading-rate meta-analysis (190 studies / 18,573 participants), Journal
  of Memory and Language. **(Primary)**
  https://gwern.net/doc/psychology/linguistics/2019-brysbaert.pdf
- Rensink, O'Regan & Clark (1997), *To See or Not to See*, Psychological Science; Simons &
  Levin (1997). **(Primary)**
- Simons & Chabris (1999), the "invisible gorilla", Perception. **(Primary)**
  https://doi.org/10.1068/p281059
- Raymond, Shapiro & Arnell (1992), attentional blink, J. Exp. Psychol. HPP. **(Primary)**
- Leroy (2009), *Why Is It So Hard to Do My Work?*, Organizational Behavior and Human
  Decision Processes (attention residue). **(Primary)**
  https://www.researchgate.net/publication/46489122
- Mark (2008), *The Cost of Interrupted Work*, CHI (the "23 minutes" figure, commonly
  misattributed). **(Primary)** https://www.ics.uci.edu/~gmark/chi08-mark.pdf

### Presentation and narrative craft

- Minto, *The Pyramid Principle*; SCQA. **(Primary)**
  https://www.dbai.tuwien.ac.at/staff/gatter/work/051104_The_Minto_Pyramid_Principle.pdf ·
  **(Secondary)** https://modelthinkers.com/mental-model/minto-pyramid-scqa
- Duarte, *Resonate* / sparkline / Slidedocs. **(Primary)**
  https://www.duarte.com/resources/storytelling-framework/ ·
  https://www.duarte.com/training/slide-document-design/slidedocs/
- Freytag / three-act (Gallo on the "magical number 3"). **(Secondary)**
  https://www.inc.com/carmine-gallo/apple-is-obsessed-with-magical-number-3-it-will-transform-your-presentations-too.html
- Hero's Journey in pitches. **(Secondary)**
  https://persuasionbydesign.substack.com/p/youre-not-the-hero-of-your-own-pitch
- Anderson, *TED Talks: The Official TED Guide to Public Speaking* (throughline).
  **(Primary)** https://www.ted.com/read/ted-talks-the-official-ted-guide-to-public-speaking
  · **(Secondary)**
  https://wattshappening4capstone.edublogs.org/files/2023/03/Chris-Anderson-Resource-Guide-2_Craft-Your-Throughline.pdf
- Monroe's Motivated Sequence. **(Secondary)**
  https://llcc.pressbooks.pub/publicspeaking/chapter/monroes-motivated-sequence/ ·
  https://en.wikipedia.org/wiki/Monroe's_motivated_sequence
- Problem–Agitate–Solve. **(Secondary)**
  https://www.linkedin.com/posts/grantslee_after-creating-hundreds-of-thousands-of-presentations-activity-7384242387902062592-5rFA
- Zelazny, *Say It With Charts.* **(Secondary)**
  https://www.antoinebuteau.com/lessons-from-gene-zelazny/
- Consulting action titles (horizontal/vertical logic). **(Secondary)**
  https://slideworks.io/resources/how-to-write-action-titles-like-mckinsey ·
  https://slidescience.co/action-titles/
- Alley, assertion-evidence. **(Primary)** https://www.assertion-evidence.com/ · Alley et
  al. (2006), headline-design retention (79% vs 69%, p<0.001)
  https://www.researchgate.net/publication/228758758_How_the_design_of_headines_in_presentation_slides_affects_audience_retention
  · Garner & Alley comprehension study
  https://www.researchgate.net/publication/286042632_How_the_Design_of_Presentation_Slides_Affects_Audience_Comprehension
  · presenter-side effect
  https://pure.psu.edu/en/publications/slide-structure-can-influence-the-presenters-understanding-of-the
  · untraceable "26% retention" (secondary) https://www.academia.edu/42766968/
- Jobs' "3-second rule" (Gallo/Forbes, popular heuristic). **(Secondary)**
  https://www.forbes.com/sites/carminegallo/2025/10/29/why-steve-jobs-followed-the-3-second-slide-rule-for-better-presentations/
- Amazon 6-page memo. **(Secondary)**
  https://www.cnbc.com/2018/04/23/what-jeff-bezos-learned-from-requiring-6-page-memos-at-amazon.html
  · Bezos 2004 email
  https://www.businessinsider.com/jeff-bezos-email-against-powerpoint-presentations-2015-7

### Layout and typography

- Müller-Brockmann, *Grid Systems in Graphic Design* (1981). **(Primary)**
  https://openlab.citytech.cuny.edu/langecomd3504sp2020/files/2018/10/MullerBrockmann_Grid_Des-Phil.pdf
  · **(Secondary)**
  https://www.thegraphicdesignschool.com/design-history/joseph-mueller-brockmann/
- Baseline grids / vertical rhythm. **(Secondary)**
  https://medium.com/subform/are-grid-systems-still-relevant-in-digital-407beb4128c1
- Bento grid recipe and real-implementation audit. **(Secondary)**
  https://superdesign.dev/styles/bento-grid · https://www.banani.co/definitions/bento-grid
- Optical vs mathematical centring. **(Secondary)**
  https://graphicdesign.stackexchange.com/questions/49527/ ·
  https://railsdesigner.com/mathematical-optical-alignment-design/ ·
  https://pixso.net/articles/alignment-icon/
- Whitespace (active/passive). **(Secondary)**
  https://www.interaction-design.org/literature/topics/white-space
- NN/g Gestalt articles — proximity, common region, continuation, figure/ground.
  **(Secondary)** https://www.nngroup.com/articles/gestalt-proximity/ ·
  https://www.nngroup.com/articles/common-region/ ·
  https://uxcel.com/blog/law-of-the-common-region-in-ux ·
  https://www.nngroup.com/videos/continuation-gestalt/ ·
  https://www.nngroup.com/videos/figure-ground-gestalt/
- Signal-to-noise ratio. **(Secondary)**
  https://www.nngroup.com/articles/signal-noise-ratio/
- Modular type scales. **(Secondary)**
  https://iotools.cloud/journal/modular-type-scale-typography-css/ ·
  https://whatfontfinder.com/type-scale-calculator/
- Legge & Bigelow (2011), *Does Print Size Matter for Reading?*, J Vis. **(Primary)**
  https://pmc.ncbi.nlm.nih.gov/articles/PMC3428264/
- Bringhurst, *The Elements of Typographic Style* (measure ~66 chars). **(Primary)**
- Golden ratio debunking — Markowsky; PLOS ONE 2024 RCT; 2024 review. **(Primary)**
  https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0303032 ·
  https://link.springer.com/article/10.1186/s40902-024-00411-2 · **(Secondary)**
  https://www.researchgate.net/publication/322814290_Misconceptions_about_the_Golden_Ratio
  · https://patterns.architexturez.net/doc/az-cf-172604
- Rule of thirds evaluation; origin J.T. Smith (1797). **(Primary)**
  https://www.researchgate.net/publication/259620557_Evaluating_the_Rule_of_Thirds_in_Photographs_and_Paintings
  · **(Secondary)** https://www.onlandscape.co.uk/2011/01/rule-of-thirds/
- "Whitespace +20%" origin (Lin 2004 misapplied). **(Secondary)**
  https://artversion.com/blog/
- PowerPoint SmartArt catalogue. **(Primary)**
  https://support.microsoft.com/en-au/office/all-smartart-graphics-described-cf1a453b-de4a-4217-8da0-1aff97bb32cd
- Beautiful.ai Smart Slides. **(Primary)** https://www.beautiful.ai/smart-slides ·
  https://www.beautiful.ai/presentations
- Slidev built-in layouts. **(Primary)** https://sli.dev/builtin/layouts
- Gamma card system. **(Primary)**
  https://gamma.app/explore/content/guides/how-gamma-maps-content-directly-to-slides-using-its-card-system
- Arrow = causation convention. **(Primary/Secondary)**
  https://www.researchgate.net/publication/263235965_Why_do_Biologists_Use_so_Many_Diagrams
  · https://en.wikipedia.org/wiki/Causal_notation
- Squint test (practitioner convergence). **(Secondary)**
  https://learnui.design/blog/squint-test-ui-design-case-study.html ·
  https://polypane.app/blog/debug-your-visual-hierarchy-with-the-squint-test/ ·
  https://www.sqlservercentral.com/blogs/design-concepts-for-better-power-bi-reports-part-4-the-squint-test
  · visual-hierarchy checker https://brainito.com/visual-hierarchy-checker

### Video and motion

- Murch, *In the Blink of an Eye* (Rule of Six). **(Primary)**
  https://en.wikipedia.org/wiki/In_the_Blink_of_an_Eye_(Murch_book)
- J-cuts / L-cuts (split edits). **(Secondary)**
  https://www.adobe.com/creativecloud/video/discover/j-cut-and-l-cut.html ·
  https://en.wikipedia.org/wiki/Split_edit
- Material Design motion (duration/easing). **(Primary)**
  https://material.io/design/motion/speed.html ·
  https://material.io/archive/guidelines/motion/duration-easing.html ·
  https://material.io/archive/guidelines/motion/movement.html · Atlassian corroboration
  https://atlassian.design/foundations/motion
- Continuity editing / match cut. **(Secondary)**
  https://en.wikipedia.org/wiki/Continuity_editing ·
  https://www.researchgate.net/publication/264699419_
- Narration WPM guidance. **(Secondary)**
  https://virtualspeech.com/blog/average-speaking-rate-words-per-minute ·
  https://tfcs.baruch.cuny.edu/speaking-rate/ · https://biteable.com/blog/video-word-count/
- Muted-viewing figures. **(Secondary, industry-reported)**
  https://digiday.com/media/silent-world-facebook-video/ ·
  https://www.niemanlab.org/reading/publishers-say-85-percent-of-facebook-video-is-watched-without-sound/
  · https://digiday.com/sponsored/75-percent-of-people-watch-mobile-videos-on-mute/ ·
  **(Primary)** PLOS ONE 2024 eye-tracking
  https://pmc.ncbi.nlm.nih.gov/articles/PMC11458047/
- Vertical-format editing and ~94% mobile-portrait figure. **(Secondary)**
  https://www.capcut.com/create/vertical-video-meme-editing-mobile-first-platforms ·
  https://blog.picassoia.com/how-to-use-veo-3-1-for-vertical-videos
- MOOC / lecture video length — Guo et al. (2014). **(Primary)**
  https://3dvar.com/Guo2014How.pdf · Lagerstrom et al. (2015), *The Myth of the Six-Minute
  Rule* https://www.researchgate.net/publication/283479581 · YouTube "Intro" metric
  https://support.google.com/youtube/answer/9314415

### Accessibility and standards

- WCAG 2.2 — 1.4.3 Contrast (Minimum), 1.4.6 (Enhanced), 1.4.11 Non-text Contrast, 1.4.1
  Use of Colour, 1.4.12 Text Spacing, 2.3.3 Animation from Interactions, 2.2.2 Pause/Stop/
  Hide, 2.3.1 flash. **(Primary)**
  https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html ·
  https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html ·
  https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html ·
  https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions
- APCA / WCAG 3.0 status. **(Primary/Secondary)**
  https://github.com/Myndex/SAPC-APCA/blob/master/documentation/WhyAPCA.md ·
  https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/ ·
  https://w3c.github.io/silver/explainer/ ·
  https://data.europa.eu/apps/data-visualisation-guide/colour-contrast
- Okabe & Ito, *Color Universal Design* (2008). **(Primary)**
  https://siegal.bio.nyu.edu/color-palette/
- ColorBrewer (Cynthia Brewer). **(Primary)** https://colorbrewer2.org
- prefers-reduced-motion. **(Secondary)**
  https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- BBC Subtitle Guidelines. **(Primary)**
  https://www.bbc.co.uk/accessibility/forproducts/guides/subtitles/
- Netflix Timed Text Style Guide. **(Primary)**
  https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617-Timed-Text-Style-Guide-General-Requirements
- SMPTE ST 2046 / EBU R95 title-safe & action-safe. **(Primary)**

### Evidence and data visualisation

- Tufte, data-ink ratio and chartjunk. **(Primary)**
- Financial Times Visual Vocabulary. **(Primary)**
  https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md
- Knaflic, *Storytelling with Data* (preattentive emphasis, direct labels, tables).
  **(Primary)**
  https://cole-knaflic.squarespace.com/blog/2011/10/google-example-preattentive-attributes ·
  https://storytellingwithdata.com/blog/two-tips-for-better-graphs ·
  https://storytellingwithdata.com/blog/whereareyoureyesdrawn ·
  https://cole-knaflic.squarespace.com/blog/2012/06/drawing-attention-with-data-labels ·
  https://www.storytellingwithdata.com/blog/2017/8/2/axis-vs-data-labels ·
  https://storytellingwithdata.com/blog/annotate-with-text
- Cairo (truthful/functional charts). **(Primary)**
- Abela, *Chart Suggestions.* **(Secondary)**
  https://datavizblog.com/2023/03/26/choosing-the-right-chart-when-creating-a-data-visualization-part-1-of-a-series/
  · origin https://flowingdata.com/2009/01/15/flow-chart-shows-you-what-chart-to-use/
- Few, *Save the Pies for Dessert* and comparative-context dashboards. **(Primary)**
  https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf
  · https://www.perceptualedge.com

### Myth refutations

- Dale's Cone / retention percentages — Subramony (2003); Molenda; ASEE refutations.
  **(Primary/Secondary)** https://peer.asee.org/5410.pdf · https://peer.asee.org/4575 ·
  https://www.researchgate.net/publication/301754925
- Advance-organizer literature (Ausubel), mixed evidence. **(Primary/Secondary)**
  https://pmc.ncbi.nlm.nih.gov/articles/PMC10130311/ ·
  https://us.sagepub.com/sites/default/files/upm-binaries/14256_Chapter13.pdf ·
  https://files.eric.ed.gov/fulltext/ED061554.pdf

*A note on how to read this evidence.* The strongest empirical spine under the whole
document is Mayer's multimedia-learning corpus (temporal contiguity d ≈ 1.22–1.30,
coherence d ≈ 0.7–1.32, redundancy d ≈ 0.69, signalling d ≈ 0.4–0.6) together with the
vision-science thresholds (WCAG contrast; Legge & Bigelow's critical print size; broadcast
caption limits) and the one structural finding with a controlled result, Alley's
assertion-evidence (79% vs 69%, p<0.001). Those are load-bearing. Most of the rest —
narrative frameworks, editorial technique, motion conventions, chart-choice frameworks — is
codified professional practice: valuable and convergent across independent sources, but not
experimentally proven as such. A stubborn residue is myth dressed as science. The point of
tagging every claim is so a practitioner can tell which is which and weight their own
decisions accordingly.
