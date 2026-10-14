# The cognitive science of following along

**Track:** What actually determines whether a viewer can keep up with a slide or a
narration. Every finding below is judged against one aim: *the layout and the
timing must direct the viewer's limited attention to the one thing that matters at
that moment*, whether they are following a narration in a video or reading slides
on their own.

**How to read the effect sizes.** Cohen's *d* / Hedges *g*: 0.2 = small, 0.5 =
medium, 0.8 = large (Cohen, 1988). Mayer reports *median* effect size across a set
of replications plus a hit rate ("supported in N of M tests"); a high hit rate
matters as much as the median because it shows the effect is robust, not a
one-off. Where a source is behind a paywall and only the abstract was readable,
that is flagged inline.

**Scope note.** This literature is overwhelmingly about *learning* (retention and
transfer test scores). A marketing sizzle-reel or a conference keynote is not a
lesson, so some effects transfer only partially. Where the presentation's job is
persuasion or delight rather than instruction, the learning effect sizes are an
upper bound on how much the principle should constrain design, not a hard rule.
Those cases are flagged as **authorial judgement** below.

---

## 1. Mayer's Cognitive Theory of Multimedia Learning (CTML)

CTML rests on three assumptions from cognitive science (Mayer 2024, open-access,
*Educational Psychology Review*, https://link.springer.com/article/10.1007/s10648-023-09842-1):

- **Dual channels** — humans process auditory/verbal and visual/pictorial material
  in separate, interacting channels (Paivio's dual coding; Baddeley's phonological
  loop + visuospatial sketchpad).
- **Limited capacity** — each channel can hold only a few elements at once (see §3).
- **Active processing** — meaningful learning requires *selecting* relevant
  material, *organising* it into a coherent model, and *integrating* it with prior
  knowledge (the SOI model).

From these, three design goals: **reduce extraneous** processing (bad design),
**manage essential** processing (inherent complexity), **foster generative**
processing (motivate sense-making). The 15 principles map onto those three goals.
More than 200 experiments underpin them (Mayer 2024, Table 3).

Effect sizes below are from Mayer's own meta-syntheses. Primary source for the
extraneous-processing set is the *Cambridge Handbook of Multimedia Learning*
ch. 12 (Mayer, https://www.cambridge.org/core/books/cambridge-handbook-of-multimedia-learning/principles-for-reducing-extraneous-processing-in-multimedia-learning-coherence-signaling-redundancy-spatial-contiguity-and-temporal-contiguity-principles/C98AB3A6CE760DD63C048936EA0B3B44).
Social-cue and essential-processing figures are consolidated in Mayer (2017),
*Using multimedia for e-learning*, *J. Computer Assisted Learning*
(https://scispace.com/papers/using-multimedia-for-e-learning-2rspgnaqjn).

### Reduce extraneous processing

**Coherence** — learn more deeply when extraneous words, pictures, sounds, and
decoration are *excluded*. Supported 10/11 tests, **median d = 1.32** (Cambridge
Handbook ch. 12 abstract; an earlier count reported 23/23 at d = 0.86 — Mayer 2014
consolidated to the higher figure). This is the largest and most reliable effect
in the set. "Seductive details" — interesting but irrelevant material — actively
depress learning.
→ *Every non-load-bearing element on a slide has a measured cost. Decoration is
not neutral; it competes for the same capacity as the message.*
**Rule:** Forbid decorative imagery, background video, and ornamental icons that
carry no information. **Auto-checkable** (flag image/icon slots with no
corresponding label or narration reference). **Strongest single lever in this file.**

**Signalling (cueing)** — add cues that highlight the organisation of essential
material (headings, arrows, colour-highlight of the one word that matters,
bolding). Supported 3/3 (ch. 12) — later meta-analyses (e.g. Schneider et al.
2018) put it around **d ≈ 0.4–0.6** across many studies. Works by guiding
*selecting* and *organising* without adding content.
→ *One element per slide should be visually dominant, and it should be the one the
narration is on. Weight is a signal.* This is the direct evidence for the central
question: information weight must map onto visual weight.
**Rule:** Exactly one dominant slot per layout; the heaviest-information card gets
it. **Partly auto-checkable** (enforce a single dominant slot structurally; whether
the *right* card is dominant is authorial judgement — the current advisor's
"heaviest card not first" note is the correct instinct).

**Redundancy** — learn more deeply from graphics + narration than from graphics +
narration + *on-screen text that duplicates the narration verbatim*. Supported
10/10, **median d = 0.69** (ch. 12). Mechanism: identical spoken and printed words
force the visual channel to process text while also processing the graphic (split
attention), and the reader's pace fights the narrator's pace. **This is the
critical principle for a slide-plus-narration generator — see §5 for the full
treatment of its boundary conditions, because it is widely over-applied.**
→ *Do not paste the narration script onto the slide as body text.*
**Rule:** On-screen text under narration must be keywords/labels, not sentences
that restate the voice-over. **Partly auto-checkable** (flag a card whose text is a
near-duplicate of its narration segment above a similarity threshold).

**Spatial contiguity** — place corresponding words and pictures *near* each other,
not far apart. Supported 8/8, **median d = 1.11** (ch. 12); Ginns (2006)
meta-analysis puts spatial contiguity around **d ≈ 0.89**
(https://inspire.acu.edu.au/articles/contiguity-present-words-and-pictures-in-the-same-place-and-at-the-same-time).
Large and reliable. A label six inches from the thing it labels forces a visual
search that consumes capacity. This is the evidence base for §7's "integrated
labels beat legends".
→ *A card's label belongs on/adjacent to its visual, never in a separate legend
block or a caption column.*
**Rule:** Per-card detail labels render attached to their card, never collected
into a shared key. **Auto-checkable** (structural).

**Temporal contiguity** — present corresponding narration and animation
*simultaneously*, not in sequence. Very large effect (ch. 12 reports it as one of
the strongest; Ginns 2006 combined contiguity d = 0.89). A diagram that animates
in while the voice describes something else, or a build that lags the narration,
breaks the pairing.
→ *In video, a card must appear when the narration reaches it — not before (viewer
reads ahead) and not after (viewer waits confused).* See §6.
**Rule:** Card reveal timestamps are derived from the narration segment that
introduces them. **Auto-checkable** in a video pipeline (align build cues to the
narration timeline).

### Manage essential processing

**Segmenting** — present a continuous lesson in learner-paced chunks rather than
one unbroken unit. Supported 10/10, **median d = 0.79** (Cambridge Handbook ch. 13,
https://resolve.cambridge.org/core/product/identifier/9781139547369%23C03520-13-1/type/BOOK_PART).
A separate meta-analysis of the segmenting effect (Rey et al. 2019, *Educational
Research Review*, https://www.researchgate.net/publication/330143605_A_Meta-analysis_of_the_Segmenting_Effect)
confirms a positive but smaller pooled effect and finds the benefit shrinks or
vanishes when segments are *system-paced* rather than *learner-paced* — directly
relevant to video, where the viewer cannot pause (see §6).
→ *One slide = one idea. A slide carrying three sub-arguments should be three
slides, or one slide whose builds are paced by the narration.*
**Rule:** Cap distinct ideas per slide (see §3 for the number); split rather than
cram. **Partly auto-checkable** (card-count ceiling is structural; whether two
cards are really "one idea" is authorial judgement).

**Pre-training** — learn more deeply when the names and characteristics of the key
concepts are known *before* the main lesson. Supported 13/16, **median d ≈ 0.75**
(ch. 13 / Mayer 2017). Front-loading vocabulary frees working memory during the
complex part.
→ *Introduce a term on its own slide before the slide that puts it to work. A
glossary/agenda-of-concepts slide is legitimate pre-training, distinct from a
bullet agenda.*
**Rule:** Allow a "define the terms first" opener before a dense sequence.
**Authorial judgement** (the generator can offer the pattern; deciding what needs
pre-teaching is the author's).

**Modality** — present words as *narration* rather than *on-screen text* when they
accompany a graphic, so the verbal load moves off the overloaded visual channel
onto the free auditory channel. One of the most-replicated effects; Mayer reports
it as large (d ≈ 1.0 in the strongest sets), though it has well-known boundary
conditions: it weakens or reverses for very long/technical text, non-native
speakers, unfamiliar terms, and system-paced presentation (see §5). This is *the*
theoretical justification for narrated video over text-heavy slides.
→ *In a narrated deck, push explanation into the voice-over and keep the slide to
labels and visuals. In a silent deck, the slide must carry the words because there
is no auditory channel — the same content model must reflow between the two.*
**Rule:** Narrated mode favours keyword slides + full voice-over; silent mode
requires the words on-screen. The generator must know which mode it is targeting.
**Auto-checkable** (mode is a build flag; enforce different text budgets per mode —
see §5).

### Foster generative processing

**Multimedia principle** — the foundation: people learn better from words +
pictures than words alone. Median **d ≈ 1.35** in the strongest sets; robust.
→ *Prefer a diagram/visual paired with a label over a text-only card, when the
content is depictable.*
**Rule:** Offer and reward a visual slot on every content layout. **Authorial
judgement** (not everything is depictable; a forced stock image violates coherence).

**Personalisation** — conversational wording ("your data", "we") beats formal
third-person. Supported 14/17, **median d = 0.79** (Cambridge Handbook ch. 14,
https://www.cambridge.org/core/books/cambridge-handbook-of-multimedia-learning/principles-based-on-social-cues-in-multimedia-learning-personalization-voice-image-and-embodiment-principles/3841340D8AD820C26DBCD39AE664BCEC).
→ *Narration and titles should address the viewer directly.*
**Rule:** Prefer second-person, active voice in generated copy. **Authorial
judgement** (tone must match brand/register).

**Voice** — a human (or high-quality) voice beats a machine/foreign-accented
voice. **median d = 0.74** (Mayer 2017). Matters for TTS-narrated video: cheap
robotic TTS has a measurable learning cost.
→ *Use the best available TTS voice; it is not cosmetic.*
**Rule:** Default to the highest-fidelity voice the pipeline supports.
**Authorial/config judgement.**

**Image** — putting a *static* image of the speaker's face on screen does **not**
help and can hurt (it competes for visual attention). Near-zero/negative effect.
→ *Do not add a presenter headshot or talking-head thumbnail to an information
slide.*
**Rule:** No decorative presenter image on content slides. **Auto-checkable.**

**Embodiment** — a *gesturing, moving* on-screen agent that points at relevant
content helps. **median d = 0.36** (Mayer 2017) — real but the smallest social-cue
effect. The active ingredient is gesture/gaze directing attention, not mere
presence (this connects to §4's "pointing" cue).
→ *If an agent/cursor is present, it should point at what is being discussed;
otherwise omit it.*
**Rule:** Any on-screen pointer must track the narration focus. **Authorial
judgement.**

**Generative-activity principles** (summarising, self-explaining, drawing,
enacting, mapping) — prompting the learner to do something with the material
improves transfer (effects vary by activity, generally medium). These require
interactivity a linear video/deck lacks.
→ *Mostly out of scope for a non-interactive artefact, but a "pause and predict"
beat or a recap slide is a cheap approximation of self-explanation.*
**Rule:** Optionally emit a recap/summary slide at section ends. **Authorial
judgement.**

---

## 2. Sweller's Cognitive Load Theory (CLT)

Primary source: Sweller, Ayres & Kalyuga, *Cognitive Load Theory* (2011); Sweller
(2019/2020) "Cognitive Architecture and Instructional Design: 20 Years Later,"
*Educational Psychology Review*
(https://www.researchgate.net/publication/344435215). CLT and CTML are
complementary: CTML describes the architecture; CLT names the load types and the
effects that follow.

**Three loads share one limited working memory:**
- **Intrinsic load** — inherent difficulty of the material *for this learner*,
  driven by **element interactivity** (how many elements must be held and related
  at once). Learning "the French word for cat" = low interactivity; learning
  grammar where every word constrains every other = high.
- **Extraneous load** — imposed by presentation, not content. This is what design
  controls. Every CTML extraneous-processing principle (§1) is a way to cut it.
- **Germane load** — effort that builds schemas (in the current formulation,
  germane load is the working-memory resources *devoted to* intrinsic load, not a
  separate pool to be pumped up).

Design implication: total load ≤ capacity. You cannot reduce intrinsic load
without changing the content or the audience's expertise, so **design's job is to
drive extraneous load to zero so the whole budget goes to the material.**
→ **Rule:** Treat every design choice that isn't carrying information as extraneous
load to be removed. **Design-review lens, partly auto-checkable.**

**Split-attention effect** — when two sources *must* be integrated to be
understood (a diagram and its explanatory text), separating them in space or time
forces the learner to hold one while searching for the other, wasting capacity.
The fix is *physical integration*: put the text into the diagram at the point it
refers to. This is the mechanism behind spatial contiguity (§1) and §7's
integrated-labels finding. Ayres & Sweller report large effects for integrated vs
separated formats.
→ **Rule:** Never render a diagram and its explanation as two separate blocks the
eye must shuttle between. **Auto-checkable structurally.**

**Expertise reversal effect** — *the density of a slide should depend on the
audience.* Techniques that help novices (worked examples, extra explanatory text,
scaffolding, redundant on-screen text) become useless or *harmful* for experts,
because processing redundant support conflicts with the expert's existing schema
and itself becomes extraneous load. Kalyuga, Ayres, Chandler & Sweller (2003), *The
Expertise Reversal Effect*, *Educational Psychologist*
(https://www.researchgate.net/publication/48829036_The_Expertise_Reversal_Effect).
Later work argues it is a special case of the element-interactivity effect
(https://repository.lboro.ac.uk/articles/journal_contribution/The_expertise_reversal_effect_is_a_variant_of_the_more_general_element_interactivity_effect/12052695).
→ *There is no single correct information density. A slide for a board of experts
should be sparser and faster than the same content for newcomers; scaffolding that
helps one insults and slows the other.*
**Rule:** The generator must take an audience-expertise parameter and scale text
budget, pre-training, and redundancy to it. **Authorial judgement** (the author
declares the audience; the generator adjusts). *This is a materially new
consideration for the skill's content model — density is currently fixed per
layout, but it should be a function of declared audience expertise.*

**Worked-example effect** — for novices, studying a fully worked example beats
solving the equivalent problem unaided; frees capacity for schema-building. Reverses
with expertise (see above).
→ *For a tutorial archetype aimed at novices, show the complete solved case, not
just the task.*
**Rule:** Tutorial/how-to content should present complete worked steps for novice
audiences. **Authorial judgement.**

---

## 3. Working-memory limits: the real numbers

**Miller's 7±2 is misapplied.** Miller (1956, *The Magical Number Seven, Plus or
Minus Two*, *Psychological Review*, https://doi.org/10.1037/h0043158) reported that
people can repeat back ~7 randomly ordered items — but he explicitly treated the
number as "a rough estimate and a rhetorical device," half-joked the integer was
"persecuting" him, and his *central* point was **chunking**: capacity is measured
in chunks, and expertise lets you pack more into a chunk. He never said interfaces
or slides should cap at seven of anything (Cowan 2001, *The Magical Number 4*,
*Behavioral and Brain Sciences*, https://doi.org/10.1017/s0140525x01003922;
"The Legend of the Magical Number Seven,"
https://www.researchgate.net/publication/255060875). **Design blogs citing "7±2"
as a slide-item limit are misusing the source.**

**Cowan's revision: ~4 chunks (range 3–5).** Cowan (2001; and *The Magical
Mystery Four*, 2010, *Current Directions in Psychological Science*,
https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2864034/) shows that when chunking and
verbal rehearsal are prevented, the *central* capacity limit is **3 to 5 meaningful
items in young adults, ~4 on average.** This is the number that survives once you
strip out the tricks (rehearsal, grouping) that inflated Miller's 7. It is lower
for longer/complex chunks: adults recall only 3–4 longer verbal chunks such as
short sentences (Gilchrist, Cowan & Naveh-Benjamin 2008). Crucially for slides,
Cowan's own worked example is *essay comprehension*: holding "the major premise,
the point from the previous paragraph, and a fact and an opinion from the current
paragraph" — about four ideas — before they must fuse into one chunk or be
re-read.

**Chunking is the mitigation.** Grouping related items into a labelled unit lets
one "slot" hold more. A slide with 3 groups of 3 (a titled section containing 3
cards) is easier than 9 loose cards, because the title is the chunk handle.

**Implication for cards per slide.** A viewer parsing a slide for the first time,
with no chance to rehearse (especially in a system-paced video), is close to
Cowan's stripped-down conditions. Distinct, unrelated ideas on one slide should
therefore be **capped at about 4** — beyond that the viewer cannot hold them while
integrating. This is precisely where the current catalogue lands
(`process-flow` at 5 is the outlier and should carry a hub that chunks the 5 into
"1 hub + 4"). The "3" defaults (`bento-a`, `bento-b`) are comfortably inside the
limit; `spotlight`/`tiled`/`lifecycle` at 3–4 sit at the edge.
→ **Rule:** Hard-cap distinct top-level cards at 4; permit a 5th only when one card
demonstrably chunks the rest (a hub). **Auto-checkable** (the advisor already
refuses >5 and splits; tighten the general ceiling from 5 to 4 with the hub
exception). *Recommendation: the current 5-card allowance on `process-flow` is
defensible only because the hub does the chunking; the "no layout above 5" rule is
correct but the everyday ceiling should be 4.*

---

## 4. Attention: what redirects it, and what resets it

**Change blindness** — large changes to a scene go unnoticed if they coincide with
a disruption (a cut, a flash, a saccade). Rensink, O'Regan & Clark (1997), *To See
or Not to See*, *Psychological Science*; Simons & Levin (1997). Implication: a card
that changes *during a slide transition* will very likely be missed. A change must
be marked by motion or contrast *within a stable frame*, not hidden inside a cut.
→ **Rule:** Never introduce a new element on the same frame as a slide transition;
reveal it as a distinct, marked change on a held frame. **Auto-checkable in video.**

**Inattentional blindness** — attention is required to see; an unattended object
(the famous invisible gorilla, Simons & Chabris 1999, *Perception*,
https://doi.org/10.1068/p281059) is not perceived even when looked at. Implication:
the viewer will only process what you have directed attention to. If everything is
equally loud, the important thing is as likely to be missed as anything else. This
is the flip side of signalling (§1): weight *is* the attention director.
→ **Rule:** One and only one focal point per moment; secondary content must be
visibly subordinate. **Partly auto-checkable** (single-dominant-slot invariant).

**Attentional blink** — after detecting one target, there is a ~200–500 ms window
in which a second target is missed (Raymond, Shapiro & Arnell 1992, *J. Exp.
Psychol. HPP*). Implication: two important reveals fired within half a second of
each other — the second is likely lost. Builds must be spaced.
→ **Rule:** Space successive card reveals by more than ~0.5 s (in practice much
more, paced to narration). **Auto-checkable in video.**

**Attention residue** — after switching tasks, part of attention stays on the
previous task, degrading performance on the new one. Leroy (2009), *Why Is It So
Hard to Do My Work?*, *Organizational Behavior and Human Decision Processes*
(https://www.researchgate.net/publication/46489122). Implication: every time a
slide forces the viewer to switch between reading text and listening to
*different* words, residue from each degrades the other (see §5).
→ **Rule:** Do not make the viewer alternate between reading and listening to
non-matching content. **Design lens; ties to redundancy/modality.**

**Interruption recovery cost.** The widely-cited "23 minutes 15 seconds to refocus"
is **Gloria Mark's** interruption research (UC Irvine; *The Cost of Interrupted
Work*, 2008, https://www.ics.uci.edu/~gmark/chi08-mark.pdf), **not** Leroy's — the
two are routinely conflated by productivity blogs. The 23-minute figure is about
workplace task interruptions and does **not** transfer literally to a viewer's
recovery within a presentation; cite it only for the general point that switching
is costly, and flag the misattribution. **(Assumption/caveat: the exact within-
presentation recovery cost is not well quantified in the literature I found.)**

**Techniques that redirect attention without a reset, and their costs:**
| Technique | How it works | Cost / risk |
| --- | --- | --- |
| **Motion / entrance** (a card slides/fades in) | Exogenous capture — the visual system orients to onset automatically | Strong but blunt; competes if two things move; overuse trains the viewer to ignore it. Sync to narration. |
| **Highlight** (colour/weight on the focal element) | Endogenous signalling; guides *selecting* | Cheap and reversible; ineffective if everything is highlighted (loses contrast). |
| **Dim-others** (fade non-focal cards) | Removes competitors, raising relative salience of the focus | Very effective for "now look here"; requires a held frame; must restore for the next beat. |
| **Pointing** (cursor/arrow/agent gesture) | Deictic cue; the embodiment effect (§1) | Adds a moving element; only helps if it tracks the actual focus, else it misdirects. |

Motion and dim-others are the reliable, low-cost redirectors *inside a held frame*;
a slide *transition* is the expensive one because it risks change blindness for
anything carried across it.
→ **Rule:** Prefer dim-others + highlight to redirect attention within a slide;
reserve full transitions for genuine topic changes. **Auto-checkable in video
(build primitives); authorial for silent decks.**

---

## 5. Reading vs listening — the crux for narrated slides

**The numbers.**
- **Silent reading:** adults read English non-fiction at **~238 wpm**, fiction
  ~260 wpm (Brysbaert 2019, meta-analysis of 190 studies / 18,573 participants,
  *Journal of Memory and Language*, https://gwern.net/doc/psychology/linguistics/2019-brysbaert.pdf).
  Reading *aloud*: ~183 wpm.
- **Speech / narration:** comfortable narration is **~150–160 wpm** (audiobook
  norm); conversational speech ~130–150 wpm.

So silent reading (~238 wpm) is materially faster than listening (~150 wpm). A
viewer *can* read a short slide faster than the narrator can speak it — which is
exactly why verbatim on-screen text causes trouble: the viewer races ahead, reaches
the end, and then either waits (bored) or re-reads, while the voice lags behind.

**Reading text while a voice speaks *different* words.** This is the worst case.
Both compete for the phonological loop (Baddeley) — you cannot silently
"sound out" printed words and process heard words at the same time without
interference. Comprehension of both drops. This is the redundancy/modality
mechanism (§1) and the split-attention effect (§2) in the temporal dimension.
→ *Never put on-screen sentences that differ from the narration.* If the slide has
prose, the voice must be reading that prose (captions case), or there must be no
prose.

**The three cases — this distinction is decisive for the skill:**

1. **Identical text (captions/subtitles).** Printed words = spoken words,
   synchronised. This is **not** the harmful redundancy Mayer warns about. Verbatim
   *synchronised captions* help accessibility, non-native speakers, and noisy
   environments, and do not reliably hurt native learners (the reverse-redundancy
   finding — see below). Mayer's redundancy caution is specifically about
   *unsynchronised or self-paced* duplicate text next to a graphic.
   → **Captions are safe and should be available; they are a separate track from
   slide body content.**

2. **Summarised text (keywords).** A few printed keywords while the voice gives the
   full sentence. This is the *recommended* pattern for narrated video: the keyword
   anchors *organising* (acts as a signal/heading) without racing the voice or
   duplicating it. Mayer & Johnson and others show short printed labels can *guide*
   attention beneficially — "when reading helps listening."
   → **This is the target for narrated content cards: label, not paragraph.**

3. **Different text (new content).** Printed prose the voice is *not* saying, or is
   contradicting. Maximally harmful (dual interference above).
   → **Forbidden under narration.**

**Boundary conditions — the redundancy debate.** Mayer's redundancy principle
(avoid narration + verbatim on-screen text) has real exceptions the literature
argues about:
- **Reverse redundancy for non-native speakers / foreign-language material:**
  synchronised redundant on-screen text *reduces* load and *helps* when the
  language is not the viewer's first, or the terms are unfamiliar (foreign-language
  learning studies; "Redundancy effect in multimedia learning: a closer look,"
  https://www.researchgate.net/publication/228947987). Moreno & Mayer (2002b)
  "Verbal redundancy in multimedia learning: when reading helps listening"
  (https://doi.org/10.1037/0022-0663.94.1.156) found redundant text helps when it
  is **short**, next to the graphic, and there is **no concurrent animation** to
  compete for the eyes.
- **No competing visuals + short segments:** redundancy hurts most when the eyes
  are needed for an animation; with a static image and brief text, the cost falls.
- **System-paced vs self-paced:** harm is worse when the learner cannot control
  pace (video), because they cannot resolve the race between reading and listening.

**Net implication for the generator.** Text budget must depend on **mode** and
**audience**:
- *Silent deck:* the slide must carry the words (no auditory channel). Budget is
  set by reading time and overflow, not by narration.
- *Narrated video, native/expert audience:* keywords only; push prose to voice
  (modality + redundancy). Small text budget.
- *Narrated video, non-native or highly technical:* allow **synchronised** key
  terms/short phrases on screen (reverse redundancy) — but still not full
  paragraphs, and kept beside the visual.
→ **Rule:** Enforce a per-mode, per-audience on-screen text budget; under narration
forbid card `text` that is a sentence differing from the narration segment; always
allow a separate synchronised caption track. **Auto-checkable** (mode/audience are
flags; sentence-vs-narration similarity is measurable). *This is a concrete new
constraint the content model should encode: today text budget is governed only by
pixel overflow, not by whether the slide is narrated.*

---

## 6. Progressive disclosure and builds

The relevant evidence is the **segmenting principle** (§1, median d = 0.79) plus
the self-paced/system-paced distinction from Rey et al.'s meta-analysis (§1).

- **Whole slide at once vs incremental reveal.** Showing a dense slide all at once
  lets the viewer read ahead of the narrator (racing, §5) and spreads attention
  across everything (inattentional blindness, §4). Revealing incrementally keeps
  attention on the current beat and enforces one-idea-at-a-time (segmenting).
- **Self-paced vs system-paced.** The segmenting benefit is strongest when the
  learner controls the pace. In a **video the viewer cannot pause** (system-paced),
  so the pacing burden falls entirely on the author: reveals must match the
  narration, and each segment must be short enough to process before the next.
  Over-long system-paced segments lose the segmenting benefit.
- **A subtle risk:** builds that lag or lead the narration violate temporal
  contiguity (§1). A card that appears before the voice reaches it invites reading
  ahead; a card that appears after invites a confused pause.

**Recommendation on syncing card animation to narration:** For **narrated video,
yes — reveal each card in sync with the narration segment that introduces it.** The
segmenting, temporal-contiguity, and attentional-blink findings all converge on
this: one card per beat, appearing when the voice reaches it, spaced >0.5 s apart.
For a **silent deck**, there is no narration to sync to and no forced pacing, so a
static whole-slide reveal is fine (the reader self-paces) — builds are optional
polish, not a cognitive requirement.
→ **Rule:** In video mode, derive per-card reveal timestamps from the narration
timeline (one card per narration segment, min ~0.5 s spacing); in slide mode,
render the whole slide. **Auto-checkable in a video pipeline.** *This is the single
most important video-specific finding and argues for the storyboard carrying a
per-card narration-segment binding, not just a per-slide one.*

---

## 7. Dual coding and diagram comprehension

Paivio's dual-coding theory: verbal and visual codes are separate and additive, so
a concept encoded both ways is remembered better (the basis of the multimedia and
picture-superiority effects).

- **When a picture beats words:** when the content is *spatial, structural, or
  relational* (how parts connect, a process, a comparison, a trend). A diagram
  offloads relational structure onto the visual channel, freeing the verbal channel.
- **When a picture adds load:** when it is *decorative* (coherence violation, §1),
  when it duplicates text that must also be read, or when the learner must split
  attention between the picture and separated explanatory text (split-attention, §2).
- **Legend/label cost:** a legend forces the eye to shuttle between the diagram and
  a key, holding a symbol in working memory during the search (split attention,
  spatial-contiguity violation). **Integrated labels — text placed *at* the thing
  it names — beat legends**, and the effect is large (spatial contiguity d ≈ 0.89–
  1.11, §1; Ayres & Sweller split-attention work). Johnson & Mayer's eye-tracking
  (2012) shows integrated formats reduce the visual search that separated formats
  force.
→ **Rule:** Render labels *on* their referent, never as a separate key or caption
column; prefer a labelled diagram to text when content is relational. **Auto-
checkable structurally** (the per-card detail-label-attached-to-card rule); *which*
content is relational is authorial judgement.

---

## 8. Comprehension at a glance

- **Scene gist is extracted in ~100 ms.** Observers categorise a natural scene
  (beach vs city, and global properties) with presentations of **19–67 ms**,
  reaching maximum at **~100 ms** (Greene & Oliva 2009, *The Briefest of Glances*,
  *Psychological Science*, https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2742770/;
  Oliva, *Gist of the Scene*, http://olivalab.mit.edu/Papers/Oliva04.pdf). Potter's
  conceptual short-term memory work shows a picture's *meaning* is grasped almost
  immediately even when the picture itself is quickly forgotten
  (https://www.researchgate.net/publication/22152100).
- **What this means for layout.** The viewer forms a first impression of a slide's
  *structure* (how many blocks, which is biggest, where to look) within the first
  glance — before reading any word. A layout whose structure matches its
  information hierarchy is "instantly parseable"; one where the biggest block is not
  the most important thing forces a second, deliberate pass (a mismatch cost). This
  is the deepest justification for the central question: **the arrangement is read
  before the text, so the arrangement must already say what matters most.**
- **Instantly parseable vs requiring study:** parseable = clear single focal point,
  strong size/weight contrast, aligned reading order (Gestalt grouping, consistent
  gutters), ≤4 groups. Requires study = even-weight grid with no focal point,
  competing highlights, misaligned or ambiguous reading order, >4 groups.
→ **Rule:** The visual hierarchy (size, weight, position) of a layout must be
monotonic with the information hierarchy of its content; the most important card is
the largest/first. **Partly auto-checkable** (the advisor's "heaviest card in the
biggest slot / heaviest not first is a warning" logic is exactly right and should
be strengthened, not just noted).

---

## 9. Memory and retention

- **Primacy and recency (serial-position effect).** First and last items in a
  sequence are recalled best (Murdock 1962; Ebbinghaus). Applied to slide ordering:
  the **opening and closing slides carry disproportionate memory weight** — put the
  core message first and repeat it last. The middle is the trough.
  → **Rule:** Emit a strong opening statement slide and a closing recap of the same
  message; place the least-critical material in the middle. **Authorial judgement**
  (the generator can offer opener/closer archetypes; what goes in them is the
  author's).
- **Picture superiority effect.** Pictures are recalled better than words in both
  recall and recognition (Paivio & Csapo 1973; Nelson et al.; review in
  https://link.springer.com/content/pdf/10.3758/MC.36.7.1351.pdf). Reinforces §7:
  depict when possible.
  → **Rule:** Prefer a labelled visual to a text-only card for anything memorable.
  **Authorial judgement.**
- **Generation effect.** Material the viewer generates themselves is remembered
  better than material read passively (Slamecka & Graf 1978). Non-interactive decks
  can only approximate this (a posed question before the answer slide, a "pause and
  predict" beat).
  → **Rule:** Optionally pose the question one slide before revealing the answer.
  **Authorial judgement.**
- **Spacing effect.** Distributed exposure beats massed (Cepeda et al. 2006, review,
  https://pmc.ncbi.nlm.nih.gov/articles/PMC3399982/). For a single presentation this
  mainly argues for *revisiting* the core message (opener, body, recap) rather than
  stating it once.
  → **Rule:** Restate the through-line at intervals, not once. **Authorial judgement.**

- **DEBUNK — the fake retention percentages.** The claim that people remember
  "10% of what they read, 20% of what they hear, 30% of what they see, 50% of what
  they see and hear, 70% of what they say, 90% of what they do" — often pinned to a
  "Dale's Cone of Experience / Cone of Learning" — is **fabricated**. Edgar Dale's
  actual Cone (1946/1969) **had no numbers**; the percentages were invented and
  grafted on later, and no study produces those neat figures. Refutations: Subramony
  (2003); Molenda; the ASEE papers "A Refutation of the Percentages Often Associated
  with Edgar Dale's Cone of Learning" (https://peer.asee.org/5410.pdf) and "Toward
  Eliminating an Unsupported Statement…" (https://peer.asee.org/4575); "Myths of
  Active Learning: Edgar Dale and the Cone of Experience"
  (https://www.researchgate.net/publication/301754925). **Any presentation-design
  guidance that cites these percentages is citing a myth. Do not repeat them.** The
  defensible, evidence-based version of the underlying intuition is: words+pictures
  beat words alone (multimedia effect, §1), pictures are remembered better than
  words (picture superiority, above), and generating/doing beats passive intake
  (generation effect, above) — all real, none quantified as tidy round percentages.
- **What is actually retained after 24 h?** There is no single credible universal
  "you remember X% a day later" figure for presentations; retention depends on
  encoding, testing, spacing, and prior knowledge. The honest statement is that
  most *detail* decays fast (Ebbinghaus forgetting curve) while the *gist* and a few
  signalled key points survive — which is another argument for one clear message
  per slide and a repeated through-line rather than dense coverage.
  **(Assumption/caveat: I did not find a rigorous single-number 24-hour retention
  figure specific to slide presentations; treat any such number in design blogs as
  unsupported.)**

---

## Consolidated rules for the generator

| # | Rule | Auto-checkable? | Source principle |
| --- | --- | --- | --- |
| R1 | Remove every element that carries no information (no decorative images/icons/backgrounds). | Partly | Coherence (d=1.32) |
| R2 | Exactly one dominant slot per slide; the heaviest-information card gets it. | Partly (structure) | Signalling / inattentional blindness |
| R3 | Under narration, on-screen text = keywords, never sentences duplicating the voice. | Partly (similarity) | Redundancy (d=0.69), modality |
| R4 | Labels render attached to their referent; never a separate legend/key. | Yes | Spatial contiguity (d≈1.1), split-attention |
| R5 | In video, card reveals are timed to the narration segment that introduces them. | Yes (video) | Temporal contiguity, segmenting |
| R6 | One idea per slide; split rather than cram. | Partly | Segmenting (d=0.79) |
| R7 | Support a "define terms first" opener before dense sequences. | No | Pre-training (d≈0.75) |
| R8 | Text budget is a function of mode (silent vs narrated) AND audience expertise. | Yes (flags) | Modality, redundancy, expertise reversal |
| R9 | Prefer second-person conversational copy in narration/titles. | No | Personalisation (d=0.79) |
| R10 | Use the highest-fidelity TTS voice available. | Config | Voice (d=0.74) |
| R11 | No decorative presenter headshot on content slides. | Yes | Image (~0/negative) |
| R12 | Any on-screen pointer/agent must track the narration focus. | No | Embodiment (d=0.36) |
| R13 | Cap distinct top-level cards at 4; allow a 5th only if one card chunks the rest (hub). | Yes | Cowan ~4 chunks |
| R14 | Physically integrate a diagram with its explanation; never two separate blocks. | Yes | Split-attention |
| R15 | Redirect attention within a held frame (dim-others/highlight); reserve transitions for topic changes. | Yes (video) | Change blindness, attentional blink |
| R16 | Never introduce a new element on the same frame as a slide transition. | Yes (video) | Change blindness |
| R17 | Space successive reveals > ~0.5 s. | Yes (video) | Attentional blink |
| R18 | Visual hierarchy (size/weight/position) must be monotonic with information hierarchy. | Partly | Scene gist ~100 ms |
| R19 | Strong opener + closing recap of the same message; weakest material in the middle. | No | Primacy/recency |
| R20 | Prefer a labelled visual to text-only for memorable content. | No | Multimedia + picture superiority |
| R21 | Always allow a separate *synchronised* caption track (safe, helps non-native/accessibility). | Yes | Reverse redundancy, captions ≠ redundancy |
| R22 | Never cite "10/20/30…90%" retention or "Dale's Cone" numbers — fabricated. | Yes (lint) | Subramony/ASEE debunk |

**Auto-checkable** = the generator/validator can enforce it from structure or flags.
**Authorial judgement** = the generator can offer/nudge, but a human decides.

### The three most consequential findings for this skill

1. **Weight must map to hierarchy, read before text (R2, R18, §8).** Scene gist at
   ~100 ms means the arrangement is parsed before any word — the advisor's
   "heaviest card in the biggest slot" logic is the cognitively correct core and
   should be strengthened from a warning toward an invariant.
2. **Text budget must depend on mode and audience, not just pixels (R3, R8, §5, §2).**
   The current overflow-only gate is necessary but insufficient: a narrated slide
   and a silent slide with the same content should have different text budgets, and
   an expert audience wants less scaffolding than a novice one. This is a genuine
   gap in the content model.
3. **In video, bind card reveals to narration segments (R5, R15–R17, §6).** The
   storyboard should carry a per-card narration binding so builds sync to the voice;
   this is the difference between a video a viewer can follow and one that races or
   lags them.

### Where the current design is already right
- Refusing >5 cards and forcing a split (segmenting, Cowan).
- Per-card detail labels attached to cards, not a shared legend (spatial contiguity).
- Forbidding bullet lists in favour of chunked cards (chunking).
- "Heaviest card not first" as a warning (signalling / gist) — correct instinct.

### Where a change is warranted (in scope, per the brief)
- Tighten the everyday card ceiling from 5 to **4** (keep the hub exception for
  `process-flow`). — §3
- Add a **mode + audience** parameter that scales on-screen text budget and
  scaffolding. — §5, §2
- Make the storyboard carry a **per-card narration-segment binding** for video so
  reveals sync to the voice. — §6
- Promote the visual-hierarchy/information-hierarchy match from a warning toward an
  **invariant** for layouts that have a dominant slot. — §8
- Add a **caption track** distinct from slide body text (safe under narration;
  helps non-native/accessibility). — §5
- Add a **lint** that rejects the fabricated Dale's-Cone retention percentages if
  they ever appear in generated copy. — §9

### Unverified / flagged
- The "23 min 15 s" refocus figure is Gloria Mark's interruption research,
  routinely misattributed to Leroy; it does not transfer literally to in-
  presentation recovery. (§4)
- No rigorous single-number 24-hour retention figure specific to presentations was
  found; treat blog figures as unsupported. (§9)
- Some effect-size counts differ between Mayer editions (e.g. coherence reported as
  10/11 at d=1.32 in the Handbook vs 23/23 at d=0.86 earlier); both are cited so the
  discrepancy is visible rather than hidden. (§1)
- A few paywalled primary sources (ScienceDirect, some ResearchGate PDFs) were read
  via abstract + secondary citation only; flagged inline where relevant.
