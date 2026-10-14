# Narrative craft, structure and rhetoric — how a presentation is built so an audience can follow it

Research track 1 of the slide-layout research. Scope: the general craft of presentation
and slide design, judged against one aim — **information weight should map onto layout so
the layout itself directs focus, helping a viewer follow along**, whether they follow a
narration in a video or read slides on their own.

Every claim is cited. Evidence is graded:

- **[EVIDENCE]** — peer-reviewed study or meta-analysis with reported effect.
- **[PRACTICE]** — codified professional practice from a primary practitioner source (the author's own writing/book). Widely used, not experimentally tested as such.
- **[RECEIVED WISDOM]** — popular advice repeated widely, traced to a source, but not empirically supported. Flagged so it is not mistaken for evidence.
- **[ASSUMPTION]** — my inference; not directly sourced.

The single most important finding up front: **there is a strong empirical spine under a
handful of these techniques, and most of the rest is craft, not science.** The empirical
spine is Richard Mayer's cognitive theory of multimedia learning (four decades, dozens of
controlled experiments) and Michael Alley's assertion-evidence studies. They converge on
the same instruction: **one message per slide, stated as a sentence, supported by one
piece of visual evidence, with the words either on the slide OR spoken but not both.**
That instruction, not any narrative framework, is the highest-leverage thing this skill can
encode. The narrative frameworks below decide the *order of slides*; Mayer/Alley decide
*what one slide may contain*.

---

## 0. The empirical spine (read this before the frameworks)

### Mayer's multimedia principles — the effect sizes

Mayer's meta-analyses report median effect sizes (Cohen's d) across controlled experiments.
These are large by social-science standards (d=0.8 is conventionally "large"). Source:
Mayer, "Using multimedia for e-learning," *J. Computer Assisted Learning* (2017), reviewing
12 principles. https://link.springer.com/article/10.1007/s10648-023-09842-1/fulltext.html
and the principle-by-principle reviews at
https://www.researchgate.net/publication/359588527_Principles_for_Reducing_Extraneous_Processing_in_Multimedia_Learning
and https://www.researchgate.net/publication/359588534_Principles_for_Managing_Essential_Processing_in_Multimedia_Learning

| Principle | What it says | Effect (d) | What it means for a slide/video generator |
| --- | --- | --- | --- |
| **Multimedia** | Learn better from words + graphics than words alone | **1.67** | A slide that is pure text is the weakest possible slide. Every content slide should pair a claim with a visual. **[EVIDENCE]** |
| **Coherence** | Learn better when *extraneous* material is *excluded* | **0.70–0.86** | Decorative images, background music, tangential detail actively *hurt*. Supported in 23/23 tests. This is the evidence base for "cut every adjective." **[EVIDENCE]** |
| **Signaling** | Learn better when cues highlight the essential structure | **0.46** | Visual emphasis (a dominant card, a highlighted number, a heading that states the point) measurably helps — this is the direct evidence for *information weight → visual weight*. **[EVIDENCE]** |
| **Redundancy** | Learn better from graphics + narration than graphics + narration + on-screen text of the same words | **0.87** | **A narrated video must NOT put the narration's words on screen.** Reading identical text while hearing it overloads the verbal channel. **[EVIDENCE]** |
| **Spatial contiguity** | Related words and pictures placed near each other | **0.79** | A card's label must sit *on/beside* the thing it labels, not in a legend elsewhere. **[EVIDENCE]** |
| **Temporal contiguity** | Corresponding words and pictures presented at the same time | **1.30** | In video, the narration for a card must land while that card is visible/highlighted — the skill's "scene-level alignment / make the click land on the word" rule is empirically backed and one of the largest effects here. **[EVIDENCE]** |
| **Segmenting** | Learn more from learner-paced segments than one continuous unit | (positive) | Break a long build into steps the viewer's mind can chunk; in a deck, one idea per slide *is* segmenting. **[EVIDENCE]** |
| **Modality** | Present words as *speech* rather than on-screen text when accompanying a graphic | (positive) | For narrated video, prefer narration over on-screen paragraphs; reserve on-screen text for labels and the one assertion. **[EVIDENCE]** |

**The redundancy principle has a sharp, non-obvious edge relevant to this skill.** Full
redundancy (identical spoken + written text) hurts. But *partial* redundancy — a few
keywords or a short assertion on screen while narration elaborates — can *help* by guiding
attention (Mayer & Johnson, "Revising the Redundancy Principle,"
https://www.researchgate.net/publication/232540768_Revising_the_Redundancy_Principle_in_Multimedia_Learning).
This licenses exactly what assertion-evidence does: a *short sentence* headline on screen +
richer spoken elaboration. It forbids putting the *paragraph* on screen. **[EVIDENCE]**

**Implication for the skill's central question.** "Information weight should map onto
layout" is the *signaling principle* stated in layout terms, and signaling is empirically
real (d=0.46). The skill's shape rules — heaviest card in the biggest slot, spotlight for a
dominant card, statement for a single claim — are a defensible implementation of signaling.
The gap: the current advisor uses *text length* as the proxy for weight. Text length is a
proxy for overflow risk, not for importance. A one-word number ("$4.2M") can be the most
important thing on a slide and the shortest. See §3 and the recommendations.

### The curse of knowledge — why authors get this wrong

The Heath brothers name the root failure: once you know something, you cannot imagine not
knowing it, so you compress and abstract past the audience's ability to follow. *Made to
Stick* (Chip & Dan Heath). Summary: https://engineerguy.com/white-papers/made-to-stick.htm
A generator author is *always* under the curse of knowledge about their own product. The
antidote the Heaths give is **concreteness** — force a concrete image, number, or named
case before an abstraction. **[PRACTICE]** This is why the skill's existing rules ("name the
case and keep it named — 'Mr Tan', not 'the patient'"; "the Complication must name a cost")
are sound; they are concreteness discipline.

---

## 1. Structural frameworks — what each is actually for

A structural framework decides **the order in which ideas arrive**. It is orthogonal to
slide design (§0). The skill already ships archetypes; this section maps the canonical
frameworks onto that model, says what decision/audience each suits, gives its scene
skeleton, and names the specific failure it prevents.

### The two families

There are really two families, and conflating them is the most common authoring error:

- **Persuasion / narrative family** (move an audience to feel and act): Duarte sparkline,
  Monroe's Motivated Sequence, PAS, Hero's Journey, three-act/Freytag, SUCCESs. These
  *oscillate* or *build tension*. They suit a talk, a pitch, a launch, a video.
- **Executive-argument family** (get a decision from busy people): Minto Pyramid / SCQA,
  SCR, the consulting action-title discipline, STAR/CAR. These are **answer-first** and
  *anti-suspense*. They suit a briefing, a memo, a board deck, a review.

The skill's SCR archetype already encodes the crucial bridge between the two: **Beat 0
(the answer) is deck-only; the video starts at the Situation.** That is exactly the
answer-first/tension split, and it is correct. Keep it. (See §5.)

### 1.1 Minto Pyramid Principle & SCQA

- **What it is:** Barbara Minto's method from McKinsey. Lead with the single **governing
  thought** (the answer), support it with 3–4 **grouped, MECE arguments** (Mutually
  Exclusive, Collectively Exhaustive), back each with evidence. Ideas at any level must
  *summarise* the ideas below (vertical logic) and be *the same kind of thing in logical
  order* (horizontal logic). SCQA (Situation–Complication–Question–Answer) is the
  introduction pattern that leads into the pyramid.
  https://modelthinkers.com/mental-model/minto-pyramid-scqa ,
  https://www.dbai.tuwien.ac.at/staff/gatter/work/051104_The_Minto_Pyramid_Principle.pdf **[PRACTICE]**
- **Audience/decision:** executives who must decide and have no patience for suspense.
- **Slide skeleton:** answer slide → 3–4 argument slides (each a grouped claim) → evidence
  beneath each. Maps cleanly onto: `statement`/`hero` (answer) → `tiled`/`bento` (the 3–4
  arguments) → `stat-deepdive`/`comparison` (evidence per argument).
- **Failure it prevents:** the "mystery novel" deck that withholds the recommendation until
  slide 40. Executives disengage. MECE prevents overlapping/gappy arguments.
- **Note on the "3–4" number:** Minto's grouping of 3–4 is justified by working-memory
  limits; it aligns with the skill's card caps (most layouts 3, max 5). This is a
  *convergence* between an independent source and the existing design. **[PRACTICE]**

### 1.2 SCR (Situation–Complication–Resolution)

- **What it is:** the reduced, three-beat form of SCQA used for oral/deck delivery. Already
  the skill's flagship archetype. **[PRACTICE]** (Minto lineage, above.)
- **Audience/decision:** people who decide; the deck is a deliverable.
- **Skeleton:** already specified in `references/archetypes.md` (S: 1–2 beats, C: 1–2, R:
  2–5, order enforced). This is well designed and matches the source discipline.
- **Failure it prevents:** the deck that describes a system without saying what is wrong
  with the status quo. The skill already calls this "the most common defect" — corroborated:
  Duarte's whole sparkline rests on establishing "what is" (the problem) before "what could
  be," and YC's pitch guidance leads with the problem. **[PRACTICE]**

### 1.3 Duarte sparkline & the "what is / what could be" oscillation

- **What it is:** Nancy Duarte, *Resonate*. After studying many great talks she found they
  **oscillate between "what is" (current reality) and "what could be" (the future)**,
  widening the gap each cycle to build tension, ending on a plateau she calls **"the New
  Bliss"** and a call to action. Not one arc — a *repeated* toggle.
  https://www.duarte.com/resources/storytelling-framework/ **[PRACTICE]**
- **Audience/decision:** any audience you must *move*, especially a live talk or a launch.
- **Skeleton:** hook → (what is → what could be) × N → New Bliss → call to action. The
  contrast pairs are the engine.
- **Failure it prevents:** the flat, monotone deck with no tension; the "all vision, no
  problem" pitch. The oscillation *is* contrast, and contrast is comprehension.
- **Direct match in the skill:** archetype 4 (Before/After) is a *single-variable* sparkline
  — the skill already says "archetype 4 is S→(C→R)×3." The `comparison` layout is the
  atomic unit of one oscillation. **A gap:** the skill has no *multi-beat oscillation*
  archetype for a persuasive talk that isn't a before/after of one process. See recommendations.

### 1.4 Chris Anderson / TED — the throughline

- **What it is:** *TED Talks: The Official TED Guide to Public Speaking*. A talk needs one
  **throughline** — a single connecting idea "that ties together each narrative element,"
  the spine that decides what to include and (mostly) what to cut. "No throughline" →
  "a talk that never says anything meaningful."
  https://www.ted.com/read/ted-talks-the-official-ted-guide-to-public-speaking ,
  resource guide: https://wattshappening4capstone.edublogs.org/files/2023/03/Chris-Anderson-Resource-Guide-2_Craft-Your-Throughline.pdf **[PRACTICE]**
- **Audience/decision:** a talk/video for a general audience; also a discipline for any deck.
- **Skeleton:** it is not a scene skeleton — it is a *constraint* that sits above the
  skeleton. One sentence you could state the whole talk as.
- **Failure it prevents:** the "topic dump" — a presentation *about* an area rather than
  *arguing* one thing. This is the same failure the throughline and the governing thought
  and the assertion-title all attack from different directions.
- **Match in the skill:** there is no first-class "throughline" field. The closest is the
  SCR "answer" (Beat 0). A generator could require a one-sentence throughline per
  presentation and check every scene against it. See recommendations.

### 1.5 Freytag / three-act structure applied to talks

- **What it is:** Freytag's pyramid (exposition → rising action → climax → falling action →
  dénouement) and the simpler three-act (setup → confrontation → resolution). Duarte
  explicitly analogises the sparkline to three-act structure (same source as §1.3).
  Jobs/Gallo note Aristotle's beginning-middle-end as the root.
  https://www.inc.com/carmine-gallo/apple-is-obsessed-with-magical-number-3-it-will-transform-your-presentations-too.html **[PRACTICE]**
- **Audience/decision:** narrative video, keynote, teaching a concept through a journey.
- **Skeleton:** Act 1 establish + inciting incident → Act 2 rising complications → Act 3
  climax + resolution. In deck terms: opener → escalating body → payoff + CTA.
- **Failure it prevents:** the deck with no climax — everything the same size, no peak. Note
  the tension with executive-argument decks, which *deliberately kill the climax* by
  answering first. **Report the conflict:** three-act is wrong for a board deck and right for
  a launch video. The framework must be chosen for the mode. **[PRACTICE]**

### 1.6 Hero's Journey — as used and abused in pitches

- **What it is:** Campbell's monomyth, imported into pitch coaching. The *correct* use
  (Duarte, and the "You're Not the Hero of Your Own Pitch" reading of her work) is that
  **the customer is the hero and the product is the guide/mentor**, not the other way round.
  https://persuasionbydesign.substack.com/p/youre-not-the-hero-of-your-own-pitch **[PRACTICE]**
- **Audience/decision:** sales, fundraising, product launch.
- **Skeleton:** ordinary world (customer's status quo) → call/problem → the guide (you)
  gives a plan → the customer acts → transformed world.
- **Failure it prevents (and the abuse):** the failure is *making the company the hero* —
  slides about the founder's genius and the product's cleverness, with the customer as a
  bystander. The abuse is forcing a full 12-stage monomyth onto a 90-second pitch. **[PRACTICE]**
- **Match in the skill:** archetype 1 (Product demo — "the operator's day") already puts the
  *operator* at the centre, which is the correct hero framing. Good.

### 1.7 Monroe's Motivated Sequence

- **What it is:** Alan Monroe, Purdue, 1930s. Five fixed steps: **Attention → Need →
  Satisfaction → Visualization → Action.** The distinctive step is *Visualization* — make
  the audience vividly *picture* the world with the solution (and, optionally, without it).
  https://llcc.pressbooks.pub/publicspeaking/chapter/monroes-motivated-sequence/ ,
  https://en.wikipedia.org/wiki/Monroe's_motivated_sequence **[PRACTICE]**
- **Audience/decision:** explicitly *persuasion toward action* — sales, advocacy, CTA-heavy
  talks.
- **Skeleton:** hook → problem the audience feels → your solution → paint the improved
  future → the specific ask. Maps to: `hero` (attention) → `stat-deepdive`/`comparison`
  (need) → `process-flow` (satisfaction) → `statement`/`hero` (visualization) → `hero`+CTA.
- **Failure it prevents:** the talk that explains a solution but never asks for anything, or
  asks vaguely. Monroe forces a *concrete* Action step. This is a near-twin of SCR + CTA and
  of the sparkline; its unique contribution is the mandatory Visualization beat.

### 1.8 Problem–Agitate–Solve (PAS)

- **What it is:** a copywriting/sales micro-structure. State the problem, *agitate* it (make
  the pain vivid and pressing), then present the solution.
  (Cross-referenced in the sparkline/pitch sources, e.g.
  https://www.linkedin.com/posts/grantslee_after-creating-hundreds-of-thousands-of-presentations-activity-7384242387902062592-5rFA) **[PRACTICE]**
- **Audience/decision:** short sales pitch, landing-page-style micro-narrative, ad.
- **Skeleton:** problem slide → agitation slide (cost, consequence) → solution slide. A
  single sparkline oscillation with an amplified valley.
- **Failure it prevents:** the pitch that names a problem so mildly no one cares. "Agitate"
  is the same instinct as SCR's "the Complication must name a cost." Corroborates the skill.

### 1.9 STAR / CAR

- **What it is:** **S**ituation–**T**ask–**A**ction–**R**esult (or **C**ontext–**A**ction–
  **R**esult). A retrospective micro-narrative for *one* accomplishment — interviews, case
  studies, project retros. (Standard behavioural-interview framing; widely documented.) **[PRACTICE]**
- **Audience/decision:** reporting a completed piece of work; a case-study slide or scene.
- **Skeleton:** context → what needed doing → what you did → measurable result.
- **Failure it prevents:** the accomplishment story that never states a *result*. Maps well
  to the skill's `lifecycle` (phases) ending in a `stat-deepdive` (the result).
- **Match:** archetype 5 (Tracer journey) is STAR at system scale — one case, end to end,
  ending closed. Good.

### 1.10 Gene Zelazny's approach

- **What it is:** *Say It With Charts.* Start from the **message you want the audience to
  take away**, then choose the chart form that carries it. "Your audience should never have
  to ask 'So what?' after looking at your chart."
  https://www.antoinebuteau.com/lessons-from-gene-zelazny/ **[PRACTICE]**
- **Audience/decision:** any data slide.
- **Contribution:** the *message drives the visual form*, not the data drives it. This is the
  data-slide instance of assertion-evidence. Directly relevant to `stat-deepdive`: the stat
  is chosen because it carries the message, and the assertion title says the "so what."

### 1.11 The consulting action-title discipline (horizontal & vertical logic)

- **What it is:** every slide's title is a **full sentence stating the takeaway** ("the so
  what"), not a topic label. Read the titles alone, top to bottom, and you get the entire
  argument (**horizontal logic**); the content of each slide supports its own title
  (**vertical logic**).
  https://slideworks.io/resources/how-to-write-action-titles-like-mckinsey ,
  https://slidescience.co/action-titles/ **[PRACTICE]**
- **Audience/decision:** executive decks, any deck read without a presenter.
- **Failure it prevents:** the deck that is illegible without the speaker, and the deck whose
  argument you cannot reconstruct by skimming. This is the reading-deck superpower (see §5).
- **This is the same instruction as assertion-evidence (§1.12) arrived at from consulting
  rather than from cognitive science — a strong convergence.** See §3.

### 1.12 Assertion-evidence (Michael Alley) — THE ONE WITH EVIDENCE

- **What it is:** each slide has (1) a **succinct sentence assertion** as the headline —
  the single message of the slide — supported by (2) **visual evidence** in the body
  (photo, diagram, chart), *not* a bulleted list. Rejects PowerPoint's default of a
  phrase-topic headline over bullets. https://www.assertion-evidence.com/ **[PRACTICE + EVIDENCE]**
- **The empirical findings (what the studies actually showed):**
  - **Alley et al., "How the design of headlines in presentation slides affects audience
    retention" (2006):** on 15 questions, the sentence-headline group scored **79% vs 69%**
    for the traditional (phrase-headline) group; **statistically significant at p<0.001.**
    https://www.researchgate.net/publication/228758758_How_the_design_of_headines_in_presentation_slides_affects_audience_retention **[EVIDENCE]**
  - **Garner & Alley, comprehension study (110 engineering students):** the assertion-evidence
    group showed **superior comprehension, fewer misconceptions, lower perceived cognitive
    load, and stronger recall at delayed post-test.**
    https://www.researchgate.net/publication/286042632_How_the_Design_of_Presentation_Slides_Affects_Audience_Comprehension **[EVIDENCE]**
  - **Presenter-side effect:** using AE slides raised the *presenter's own* understanding of
    the material, and the approach took minimal instruction to teach.
    https://pure.psu.edu/en/publications/slide-structure-can-influence-the-presenters-understanding-of-the **[EVIDENCE]**
  - A widely repeated "improves retention by 26%" figure appears in secondary literature
    (https://www.academia.edu/42766968/) — I could **not** trace it to a specific controlled
    result; treat as **[RECEIVED WISDOM]** and prefer the 79%-vs-69% and cognitive-load
    findings, which are directly sourced.
- **Audience/decision:** technical talks, teaching, any content-dense slide. Generalises.
- **Failure it prevents:** the "phrase headline + bullets" slide, which (a) fails to state
  the takeaway and (b) forces the audience to *read while listening*, triggering the
  redundancy penalty (§0). AE is the slide-level unit that satisfies multimedia + signaling +
  redundancy simultaneously. **This is the most important structural finding in this
  document and should be enforced, not merely recommended (see §3 and recommendations).**

---

## 2. Signposting and followability — what measurably helps vs cargo cult

### Advance organizers / agenda-and-roadmap slides — qualified support

- Ausubel's **advance organizer** (a higher-abstraction framing presented *before* the
  material) has genuine theoretical standing and *some* empirical support: it activates
  prior knowledge and reduces cognitive load for the material that follows.
  https://pmc.ncbi.nlm.nih.gov/articles/PMC10130311/ ,
  https://us.sagepub.com/sites/default/files/upm-binaries/14256_Chapter13.pdf **[EVIDENCE — mixed]**
- **Important caveat, reported honestly:** the evidence for advance organizers is *not*
  uniformly strong; reviews note it "has not been adequately evaluated" and effects vary
  with how the organizer is built (https://files.eric.ed.gov/fulltext/ED061554.pdf). An
  organizer works only when it is *conceptual scaffolding at a higher level of abstraction*
  — **not** a literal bulleted agenda ("1. Intro 2. Body 3. Conclusion").
- **Verdict for the skill:** A *conceptual* opener (a `statement` or `hero` throughline
  slide that frames the whole argument) is supported. A **literal agenda/table-of-contents
  slide is closer to cargo cult** and is one of the skill's already-rejected layouts
  (`agenda`) — that rejection is *consistent with the evidence*, keep it. Note the nuance:
  the rejection reason on file is "bullet lists, which the skill forbids"; the *better*
  reason is "a literal agenda is not an advance organizer and does little measurable good."
- **Pre-training principle (Mayer):** naming the key concepts up front *does* help
  (segmenting/pre-training review, §0 source). This supports a *vocabulary/throughline*
  opener over a *process-agenda* opener. **[EVIDENCE]**

### Segmenting / section dividers — supported

Section dividers are the visible form of the **segmenting principle** (§0): they chunk a
long presentation into learner-pace-able units. Supported. **[EVIDENCE]** The skill's `hero`
+ pill as a "section opener" is exactly this. Keep.

### Callbacks, repeated motifs, throughline reinforcement — supported by coherence + throughline

Repeating the throughline (Anderson) and using a recurring named case (the skill's "keep the
case named" rule) both aid coherence and memory. **[PRACTICE]** The Heaths' "stories" and
"concrete" principles support a recurring concrete case over abstract restatement.

### "Tell them what you told them" / recaps after dense segments — partially supported

- The *summary/recap* is supported indirectly: retrieval and consolidation aid retention,
  and a recap after a dense segment respects working-memory limits. **[ASSUMPTION / weak
  PRACTICE]** — I did not find a clean controlled study isolating the closing-summary slide.
- The *opening* "tell them what you're going to tell them" overlaps with advance organizers
  (qualified support above). The tripled redundancy ("tell/tell/told") is **partly cargo
  cult** — doing it three times mechanically is not evidence-based; doing it as
  organizer-then-payoff-then-consolidation is.

### Progress indicators / slide numbers / "N of M" — weak, possibly harmful

- No strong evidence they aid comprehension. They can *add* to extraneous processing
  (coherence principle: extraneous material hurts, d≈0.7). **[ASSUMPTION grounded in
  coherence principle]** For a *narrated video*, an on-screen progress bar competes with the
  content for the visual channel. **Verdict: do not add progress chrome by default.** This is
  consistent with the skill's minimal-chrome bento aesthetic.

### Verbal-visual transitions (temporal contiguity) — strongly supported

Making the spoken word land as the corresponding visual appears is the **temporal contiguity
principle (d=1.30)** — one of the largest effects in Mayer's corpus. The skill's scene-level
alignment ("make the click land on the word describing it") is the single best-supported
followability device it has. **[EVIDENCE]** Strengthen and generalise it.

**Signposting summary table**

| Device | Verdict | Basis |
| --- | --- | --- |
| Conceptual/throughline opener | Helps | Advance organizer + pre-training **[EVIDENCE, mixed]** |
| Literal agenda / ToC slide | Cargo cult | Not an advance organizer **[EVIDENCE-adjacent]** |
| Section dividers | Helps | Segmenting **[EVIDENCE]** |
| Recurring named case / motif | Helps | Coherence + concreteness **[PRACTICE]** |
| Closing recap | Probably helps | Consolidation **[weak]** |
| Tripled "tell/tell/told" | Partly cargo cult | No support for mechanical tripling |
| Progress bar / slide numbers | Skip by default | Coherence penalty **[ASSUMPTION]** |
| Word-lands-with-visual (video) | Strongly helps | Temporal contiguity d=1.30 **[EVIDENCE]** |

---

## 3. Titles as the carrier of meaning — the highest-leverage change

### Topic title vs assertion title

- **Topic title:** "Q3 Results." Names the subject. Adds no insight; the audience must
  extract the point themselves.
- **Assertion/action title:** "Q3 margin fell because freight tripled." States the takeaway
  as a complete sentence. https://slideworks.io/resources/how-to-write-action-titles-like-mckinsey **[PRACTICE]**

**Why it is the highest-leverage change in most decks — with evidence:**
1. It is the intervention Alley's studies actually tested. Sentence headlines beat phrase
   headlines **79% vs 69%, p<0.001** (§1.12). **[EVIDENCE]**
2. It converts the deck into a **read-alone artifact** (horizontal logic — read the titles,
   get the argument), which is what makes a deck survive without its presenter (§5). **[PRACTICE]**
3. It is *cheap* — it changes only the title string, not the layout or the visuals.
4. It forces the author out of the curse of knowledge: you cannot write an assertion title
   without deciding what the slide is *for*. **[PRACTICE]**

Two independent traditions — cognitive science (Alley) and management consulting (Minto/
McKinsey action titles) — arrive at the identical instruction. That convergence is the
strongest signal in this research.

### How long can an assertion title be before it stops being readable?

- Practitioner guidance: an action title is a *short, simple, single sentence* — "if done
  right, allows the audience to only read the title." https://slideworks.io/... **[PRACTICE]**
- Alley's own guidance for AE headlines: **one sentence, ideally ≤ 2 lines**, present-tense,
  no ending period, sized so it reads as a headline not body text (assertion-evidence.com
  templates and tutorial). **[PRACTICE]**
- **A concrete, defensible authoring ceiling** (my synthesis of the above, flagged as
  **[ASSUMPTION]** where it goes beyond the sources): **aim ≤ ~10–12 words / ≤ ~65–70
  characters, hard cap ~2 lines at headline size.** Beyond that it reads as body text and
  loses the "glance and get it" property. This can be a pixel/character check in the
  overflow gate applied specifically to the title slot.
- **Jobs' billboard test corroborates the ceiling:** slides should be graspable in ~3
  seconds like a billboard.
  https://www.forbes.com/sites/carminegallo/2025/10/29/why-steve-jobs-followed-the-3-second-slide-rule-for-better-presentations/ **[RECEIVED WISDOM, but consistent]**

### How the title relates to what sits below it

- The body is **evidence for the title's claim** (assertion-evidence; Zelazny's "so what";
  Minto's vertical logic — the point above summarises the content below). The body must not
  introduce a *second* claim.
- **This has a direct layout consequence and it reframes the skill's central question.** The
  *title* carries the assertion; the *layout* carries the evidence and must direct the eye to
  the piece of evidence that most supports the title. So "information weight → layout" should
  be read as: **the layout emphasises the evidence element that proves the assertion, and the
  assertion lives in the title, not in a card.** The current advisor puts the *longest* card
  in the biggest slot. It should put the *most-load-bearing* card there — which is often not
  the longest. See recommendations.

---

## 4. Pacing and density across a whole deck or video

### How long can an audience stay with one idea?

- **One idea per slide / per scene** is the consensus unit across Alley (one assertion),
  Minto (one governing thought per level), TED (throughline), Jobs (the "one thing"), and the
  skill's own narration rules. **[PRACTICE]** Mayer's segmenting principle is the empirical
  backing: chunk into single-idea units. **[EVIDENCE]**
- **Break a slide in two when it carries two assertions.** The test is not visual crowding —
  it is *"can I write one assertion title that honestly covers everything on the slide?"* If
  not, split. This is a better split-trigger than the skill's current text-overflow trigger
  (overflow is a symptom; two-assertions is the cause).

### Rhythm — dense slides against breathing-room slides

- Duarte's sparkline *is* a density rhythm: valleys (dense "what is") and peaks (spacious
  "what could be"). **[PRACTICE]** The skill supports this structurally via alternating
  `stat-deepdive`/`comparison` (dense) with `statement`/`hero` (spare).
- Rule of three: group supporting points in threes; the brain handles 3–4 items in working
  memory. https://www.inc.com/carmine-gallo/apple-is-obsessed-with-magical-number-3... —
  Gallo attributes this to working-memory limits; the underlying claim (≈4±1 chunks) is
  Cowan's, a real finding, though "exactly three" is a rhetorical convention not a law.
  **[PRACTICE, with a real cognitive-limit basis]** Supports the skill's 3-card default.

### The three modes have *different* ideal pacing

- **Live-presented deck:** slides are spare (the speaker carries the words); density is
  *low*; pace is set by the speaker. Assertion-evidence, minimal on-screen text.
- **Read-alone / "document" deck (Bezos/Amazon):** Amazon banned PowerPoint for decisions
  precisely because slides are *too low-density to carry an argument alone* and hide fuzzy
  thinking; they replaced it with a **6-page narrative memo read silently for ~30 min at the
  start of the meeting.** https://www.cnbc.com/2018/04/23/what-jeff-bezos-learned-from-requiring-6-page-memos-at-amazon.html ,
  Bezos' 2004 email: https://www.businessinsider.com/jeff-bezos-email-against-powerpoint-presentations-2015-7 **[PRACTICE]**
  A read-alone deck must be *denser* than a live deck — it needs the words the absent speaker
  would have said. Duarte's own answer to this is **Slidedocs** (documents built in slide
  software, meant to be read not projected). **[PRACTICE]**
- **Narrated video where the viewer cannot pause the speaker:** the viewer cannot re-read or
  set their own pace, so **density must be the LOWEST of the three** and segmenting is
  critical. On-screen text must be minimal (redundancy principle) and each idea must be short
  enough to land before the narration moves on (temporal contiguity). The skill's "10–20s per
  scene, one idea per scene" rule is right for this mode. **[EVIDENCE-backed]**

### How long can the *whole* thing run?

- **TED: 18-minute maximum.** Anderson's stated rationale is *discipline* ("forces speakers to
  really think about what they want to say") and shareability ("length of a coffee break"),
  not a hard cognitive law. https://www.narrative.com.sg/blog/how-the-18-min-rule-of-ted-talks-influenced-my-storytelling-workshops
  The popular "neuroscience of cognitive backlog" justification
  (https://www.inc.com/carmine-gallo/why-your-next-pitch-should-follow-teds-18-minute-rule.html)
  is **[RECEIVED WISDOM]** — I found no peer-reviewed study establishing an 18-minute limit;
  the actual attention-span literature is contested (see below).
- **Instructional-video length — a genuine, well-documented conflict; report both sides:**
  - **Guo et al. 2014 (MIT/edX, 6.9M MOOC video sessions):** median engagement drops sharply
    after **6 minutes**; shorter videos far more engaging. This is the origin of the
    "6-minute rule." https://3dvar.com/Guo2014How.pdf **[EVIDENCE]**
  - **Lagerstrom et al. 2015, "The Myth of the Six-Minute Rule":** in *for-credit college*
    courses (not MOOCs), students watched a **median of ~12–13 minutes** per session
    (mean ~17–20), and *preferred ~15-minute* videos. The 6-minute finding was context-bound
    to MOOCs and is **misapplied** to normal courses.
    https://sites.miamioh.edu/teach-online/online-course-video-engagement-strategies/ ,
    https://www.researchgate.net/publication/283479581_The_myth_of_the_six_minute_rule_Student_engagement_with_online_videos **[EVIDENCE]**
  - **Resolution for the skill:** do **not** hardcode a 6-minute rule. The defensible synthesis
    is: *segment ruthlessly (each segment single-idea, a few minutes) but total length can be
    longer if the audience is motivated (college/for-credit/committed) and shorter if the
    audience is casual (MOOC/marketing/cold).* Motivation, not a magic number, sets total
    length. The skill's per-archetype duration budgets (45s–12min) already reflect audience
    commitment, which is the right variable.

---

## 5. Three consumption modes for the same content — what genuinely must differ

The same storyline can be (a) presented live, (b) read silently, (c) watched as narrated
video. Practitioners handle this with **separate artifacts**, not one deck stretched across
all three:

- **Duarte's ballroom vs reading distinction / Slidedocs:** a *ballroom* deck (projected,
  presenter-driven) is sparse and visual; a *reading* deck (Slidedoc) is dense, self-contained
  prose-in-slides. Different documents from the same content.
  https://www.duarte.com/training/slide-document-design/slidedocs/ **[PRACTICE]**
- **Amazon:** for decisions, abandon slides entirely for a **narrative memo** — the extreme
  of the reading mode. **[PRACTICE]** (§4)
- **Speaker notes / appendix slides:** the live mode externalises the words into *speaker
  notes* (not on the slide) and pushes backup evidence into *appendix* slides shown only if
  asked. The read-alone mode must *inline* those notes because there is no speaker.

**What must actually differ (the essential variables):**

| Variable | Live | Read-alone (document) | Narrated video |
| --- | --- | --- | --- |
| On-screen text density | Lowest | **Highest** (words the absent speaker would say) | **Lowest** (redundancy penalty) |
| Where the words live | Speaker's mouth + speaker notes | On the page | Narration track (audio) |
| Pacing control | Speaker | **Reader** (self-paced) | **Fixed by the video** — viewer can't pace |
| Answer-first? | Optional (tension OK) | **Yes** (executives skim) | Often no (hook/tension to retain) |
| Assertion titles | Helpful | **Essential** (carry the argument alone) | Helpful but short (temporal contiguity) |
| Segmenting | Natural (slide breaks) | Sections/headers | **Critical** (viewer can't re-read) |

**The one thing that stays constant across all three: the assertion per unit.** Whether the
evidence is spoken, read, or narrated, each slide/scene/section carries exactly one claim.
That invariant is what lets one storyline fan out into three artifacts.

**Direct implication for the skill.** The skill already renders one storyline into a deck
*and* a video, and already makes Beat 0 deck-only (answer-first for the reader, tension for
the viewer). That is the correct core instinct. The gap is **content density is currently the
same across modes.** A read-alone deck needs more text than a narrated-video frame of the same
scene. The skill has one content model feeding both; it may need a per-mode density knob
(e.g. a `body`/notes field that renders in the deck but becomes narration-only in the video).
See recommendations.

---

## 6. Codifiable techniques of great presenters (patterns a tool can encode, not charisma)

Filtering for what a *generator* can enforce, not delivery skill:

### Jobs-era Apple keynotes
- **Rule of three:** group offerings/points in threes ("iPod, a phone, an internet
  communicator"). https://www.inc.com/bill-murphy-jr/how-emotionally-intelligent-minds-like-steve-jobs-use-rule-of-3... **[PRACTICE]** → *Encodable:* prefer 3 supporting cards (the skill already defaults to 3).
- **One big number, dramatised:** a single headline metric, often via analogy ("1,000 songs
  in your pocket"). **[PRACTICE]** → *Encodable:* `stat-deepdive` with one dominant stat.
- **The 3-second billboard slide:** each slide graspable at a glance; almost no text.
  https://www.forbes.com/sites/carminegallo/2025/10/29/... **[RECEIVED WISDOM, consistent with coherence]** → *Encodable:* enforce low text density + one assertion.
- **"One more thing":** a deliberate reserved climax. **[PRACTICE]** → *Encodable:* a final
  `statement`/`hero` payoff beat (three-act climax).

### YC pitch guidance (primary sources)
- **"Explain what you do in the simplest language possible… like baby food"** and **"give it
  to us in the first sentence, in the simplest possible terms."**
  https://www.ycombinator.com/blog/how-to-pitch-your-company/ ,
  https://www.ycombinator.com/howtoapply **[PRACTICE]** → *Encodable:* require a one-sentence,
  jargon-free throughline/opener; this is answer-first + throughline + Heaths' "simple."
- **Demo-day structure: hook → problem → solution → traction → market → team → ask**, weighted
  toward *traction* (evidence the thing works).
  https://www.stackmatix.com/blog/demo-day-pitch-checklist **[PRACTICE]** → *Encodable* as an
  archetype (this is a distinct, well-specified scene skeleton the skill does not yet have —
  see recommendations).
- **"Concrete and specific; vague answers are the most common rejection reason."**
  https://pitchgrade.com/... corroborates SCR's "name a cost." **[PRACTICE]**

### TED talks
- **One throughline** (§1.4). → *Encodable* as a required field checked against every scene.
- **≤18 min discipline.** → the skill's duration budgets already encode "shorter forces
  clarity."

### Heaths' SUCCESs (a checklist a tool can partly enforce)
Simple, Unexpected, Concrete, Credible, Emotional, Stories.
https://engineerguy.com/white-papers/made-to-stick.htm **[PRACTICE]**
→ *Encodable subset:* **Concrete** (require a named case / a real number, warn on abstraction
— the skill already does this for SCR costs), **Simple** (one assertion per slide),
**Stories** (archetype selection). Unexpected/Emotional/Credible are author judgment.

**The cross-source pattern a tool should encode, stated once:** *Lead with one concrete
claim, in plain words, backed by one piece of evidence, grouped in threes, one idea per
unit.* Every primary source above agrees on this. It is the intersection of Mayer, Alley,
Minto, Duarte, Anderson, the Heaths, Jobs, and YC.

---

## 7. Where this says the current design is right, incomplete, or wrong

### Right — keep
- **Cards over bullet lists.** Directly supported: bullets trigger the redundancy penalty and
  fail the multimedia principle (text-only). Alley's entire case is anti-bullet. **[EVIDENCE]**
- **`statement` / one-claim slide, `hero` opener, section dividers.** = signaling +
  segmenting + advance organizer. **[EVIDENCE]**
- **SCR with answer-first deck / tension-first video split.** = the executive-argument vs
  narrative-family distinction, correctly implemented. **[PRACTICE]**
- **"Complication must name a cost," "keep the case named," "cut every adjective."** =
  concreteness + coherence. **[EVIDENCE/PRACTICE]**
- **Scene-level narration alignment ("click lands on the word").** = temporal contiguity,
  d=1.30, one of the largest effects available. **[EVIDENCE]** Highlight this as a headline
  feature.
- **Rejecting the literal `agenda` layout.** Consistent with the weak/negative evidence for
  literal agendas (though the *reason on file* should be upgraded — see §2).
- **3-card default.** = rule of three + Minto's 3–4 grouping + working-memory limits. **[PRACTICE]**

### Incomplete — gaps worth filling
1. **No assertion-title enforcement.** The single most evidence-backed intervention (79% vs
   69%, p<0.001; and the consulting horizontal-logic discipline) is not a first-class rule.
   *Recommend:* the `title` slot should be validated as an *assertion* — a sentence, not a
   topic label — with a length ceiling (~≤12 words / ~65–70 char / ≤2 lines at headline
   size). A heuristic warn ("title 'Q3 Results' looks like a topic, not a takeaway; state the
   so-what") would be the highest-value addition to `recommendLayout`/the linter. This does
   *not* need a new layout — it is a content-model rule.
2. **Weight proxy is text length, not importance.** §0/§3: signaling should route the eye to
   the *most load-bearing* element (which proves the assertion), not the *longest* one.
   *Recommend:* allow an author to mark one card/stat as the *key* element (an `emphasis:` or
   `weight:` flag), and let the advisor put *that* in the dominant slot, falling back to text
   length only when unmarked. This aligns layout with the assertion, which is the whole point
   of the central question.
3. **No first-class throughline.** *Recommend:* an optional top-level `throughline:` sentence,
   surfaced in guidance, that the author checks scenes against (Anderson). Cheap, high-value.
4. **No multi-beat sparkline archetype.** Before/After (archetype 4) is a single-variable
   sparkline; there is no *N-oscillation* persuasive archetype for a talk that isn't a
   before/after of one process (Duarte's core pattern, Monroe, PAS). *Recommend:* add a
   `sparkline`/`motivated-sequence` archetype: hook → (what-is → what-could-be)×N → New Bliss
   → CTA, using `comparison` as the oscillation unit and `statement`/`hero` for the peaks.
5. **No YC demo-day / pitch archetype.** A distinct, well-specified skeleton (hook → problem →
   solution → traction → market → team → ask) that the skill does not cover. *Recommend:* add
   it; it is the highest-demand external genre not yet supported.
6. **Same content density across the three modes.** §5: a read-alone deck needs more text than
   a narrated-video frame. *Recommend:* a per-mode density mechanism — e.g. a field that
   renders as on-slide text in `deck` mode but becomes narration-only (never on-screen) in
   `video` mode, honouring the redundancy principle in video and the "words the absent speaker
   would say" need in a reading deck.

### Wrong / to reconsider
- **The overflow gate as the *primary* split-trigger.** Overflow is a *symptom*; the *cause*
  of a slide that should split is *two assertions on one slide*. *Recommend:* add a
  "one-assertion-per-slide" check (can you write a single honest assertion title covering all
  cards?) as the conceptual split-trigger, keeping the pixel gate as the backstop. This makes
  the split reason legible to the author instead of "it clipped."
- **Revisiting a rejected candidate — `metric-row` — with a new argument.** The recorded
  rejection is "the content model carries one stat, not a list." But the *rule of three* +
  Jobs' "one big number" + Monroe/Duarte peaks suggest a legitimate need for **2–3 headline
  numbers of equal weight** (e.g. "3 outcomes, each a metric") that `stat-deepdive` (one
  dominant stat) and `tiled` (labels, not numbers) both serve poorly. This is a *materially
  new argument* (grounded in rule-of-three and equal-weight signaling, not in "a list").
  *Recommend:* reconsider a constrained `metric-row` capped at exactly 3 equal-weight stats —
  but only if the content model gains a multi-stat slot, which is a real cost. Flagged as a
  candidate, not a decision.

---

## 8. Conflicts between sources, reported not resolved

1. **Six-minute video rule.** Guo/edX (MOOC, ~6 min) **vs** Lagerstrom (college, ~12–15 min).
   Context-dependent; do not hardcode. (§4) **[EVIDENCE vs EVIDENCE]**
2. **Answer-first vs build-tension.** Minto/SCR/executive family says *answer first, kill
   suspense*; Duarte/three-act/TED says *build tension, delay the payoff*. Not a contradiction
   — they suit different **modes and audiences** (decider-in-a-meeting vs
   audience-you-must-move). The skill's per-mode split is the correct resolution. (§1, §5)
3. **Redundancy.** Full spoken+written redundancy hurts (Mayer, d=0.87 for *removing* it);
   *partial* keyword redundancy helps (Mayer & Johnson). Reconciled by "short assertion on
   screen, full elaboration spoken" — which is assertion-evidence. (§0, §1.12)
4. **TED 18-minute "neuroscience."** Presented as science in pop sources; is really a
   discipline/shareability heuristic. The attention-span literature it invokes is itself
   contested (https://journals.physiology.org/doi/10.1152/advan.00109.2016). Report as
   heuristic, not law. (§4)
5. **Advance organizers.** Strong in theory (Ausubel) but "not adequately evaluated" in some
   reviews; effect depends on the organizer being conceptual, not a literal agenda. (§2)

---

## Sources (primary and peer-reviewed, deduplicated)

Empirical:
- Mayer, *Using multimedia for e-learning*, J. Computer Assisted Learning 2017 (effect sizes): https://link.springer.com/article/10.1007/s10648-023-09842-1/fulltext.html
- Mayer, *Principles for Reducing Extraneous Processing*: https://www.researchgate.net/publication/359588527
- Mayer, *Principles for Managing Essential Processing* (segmenting, pre-training, modality): https://www.researchgate.net/publication/359588534
- Mayer & Johnson, *Revising the Redundancy Principle*: https://www.researchgate.net/publication/232540768
- Alley et al., *How the design of headlines… affects audience retention* (79% vs 69%, p<0.001): https://www.researchgate.net/publication/228758758
- Garner & Alley, *How the Design of Presentation Slides Affects Audience Comprehension*: https://www.researchgate.net/publication/286042632
- Alley et al., *Slide structure can influence the presenter's understanding*: https://pure.psu.edu/en/publications/slide-structure-can-influence-the-presenters-understanding-of-the
- Guo et al. 2014, *How video production affects student engagement* (6-min): https://3dvar.com/Guo2014How.pdf
- Lagerstrom et al. 2015, *The Myth of the Six-Minute Rule*: https://www.researchgate.net/publication/283479581
- Ausubel advance organizers, re-visited: https://pmc.ncbi.nlm.nih.gov/articles/PMC10130311/
- Attention-span-during-lectures review: https://journals.physiology.org/doi/10.1152/advan.00109.2016

Primary practitioner:
- Michael Alley, assertion-evidence approach: https://www.assertion-evidence.com/
- Barbara Minto, Pyramid Principle / SCQA: https://www.dbai.tuwien.ac.at/staff/gatter/work/051104_The_Minto_Pyramid_Principle.pdf ; https://modelthinkers.com/mental-model/minto-pyramid-scqa
- Nancy Duarte, sparkline / New Bliss: https://www.duarte.com/resources/storytelling-framework/ ; Slidedocs: https://www.duarte.com/training/slide-document-design/slidedocs/
- Chris Anderson, TED throughline: https://www.ted.com/read/ted-talks-the-official-ted-guide-to-public-speaking
- Monroe's Motivated Sequence: https://llcc.pressbooks.pub/publicspeaking/chapter/monroes-motivated-sequence/
- Chip & Dan Heath, SUCCESs / curse of knowledge: https://engineerguy.com/white-papers/made-to-stick.htm
- Action titles / horizontal-vertical logic: https://slideworks.io/resources/how-to-write-action-titles-like-mckinsey ; https://slidescience.co/action-titles/
- Gene Zelazny, *Say It With Charts*: https://www.antoinebuteau.com/lessons-from-gene-zelazny/
- Amazon 6-pager / Bezos: https://www.cnbc.com/2018/04/23/what-jeff-bezos-learned-from-requiring-6-page-memos-at-amazon.html ; https://www.businessinsider.com/jeff-bezos-email-against-powerpoint-presentations-2015-7
- YC How to Pitch: https://www.ycombinator.com/blog/how-to-pitch-your-company/ ; How to Apply: https://www.ycombinator.com/howtoapply ; Demo-day structure: https://www.stackmatix.com/blog/demo-day-pitch-checklist
- Jobs rule-of-three / billboard / one-more-thing (Gallo): https://www.inc.com/bill-murphy-jr/how-emotionally-intelligent-minds-like-steve-jobs-use-rule-of-3-to-become-exceptionally-persuasive.html ; https://www.forbes.com/sites/carminegallo/2025/10/29/why-steve-jobs-followed-the-3-second-slide-rule-for-better-presentations/
- TED 18-min rationale: https://www.narrative.com.sg/blog/how-the-18-min-rule-of-ted-talks-influenced-my-storytelling-workshops
