# Video, Motion and Narration Craft

Research track: how the same content behaves when it becomes a *watched, narrated
piece* rather than a *presented or read deck*. Written to inform
`.kiro/skills/presentation-producer/references/slide-layouts.md` and the sibling
references (`subtitles.mjs`, `composition.md`, `storyboard-schema.md`).

The central question the whole research program is judged against: **information
weight should map onto layout so the layout itself directs the viewer's focus.**
In video that question gains a second axis — *time*. On a deck the viewer controls
dwell; in video the edit controls it. So the video track has to answer not only
"where does the eye go?" but "*when*, and for how long, and against what the ear is
hearing at that instant?"

A note on evidence quality, because the brief demands it. Three tiers appear below:

- **Primary / standards / peer-reviewed** — BBC Subtitle Guidelines, Netflix Timed
  Text Style Guide, W3C WCAG, MDN, Material Design motion specs, Richard Mayer's
  multimedia-learning experiments, the National Center for Voice and Speech, Walter
  Murch's *In the Blink of an Eye*. These are cited as load-bearing.
- **Industry-reported, widely corroborated** — the "85% watched without sound"
  figure, voiceover WPM ranges. Corroborated across many outlets but tracing to
  limited original measurement. Flagged inline.
- **Marketing-blog / unverifiable** — most "optimal video length" and retention
  percentages. Reported for direction only and explicitly flagged as unreliable.

---

## 1. Editorial and documentary technique transferable to explainer video

The single most transferable idea from film editing is that **a cut is a decision
about meaning and emotion, not about time.** Walter Murch, who edited *Apocalypse
Now* and wrote the canonical short book on editing, ranks the criteria for a good
cut in his "Rule of Six": emotion (51%), story (23%), rhythm (10%), eye-trace (7%),
two-dimensional plane of the screen (5%), three-dimensional continuity (4%). The
striking claim is that spatial/temporal continuity — the thing amateurs obsess over
— is worth 4%, and *emotion and story together are worth 74%.* Cut where the
meaning changes.
(Walter Murch, *In the Blink of an Eye*, 2nd ed. — summarized at
<https://diyvideoeditor.com/video-editing-basics-how-to-edit-a-scene/>; concept
overview <https://en.wikipedia.org/wiki/In_the_Blink_of_an_Eye_(Murch_book)>)

For a slide-driven explainer this reframes the transition between slides. **A slide
change should land on a meaning change in the narration, not on a fixed timer.** If
the storyboard advances the visual because 8 seconds elapsed rather than because the
narration reached a new idea, every cut fights the viewer's sense of structure. The
skill's storyboard model — which pairs a scene's visual with its narration — should
treat the *boundary between narration beats* as the natural cut point, and the
build should be able to hold a visual until its sentence completes.

**B-roll and the "visual answers the narration" discipline.** In documentary, B-roll
(supplementary footage over which narration plays) exists to *show what the voice is
talking about* so the viewer is not staring at a talking head. The discipline that
separates good explainer video from bad is: the visual on screen should answer the
question the narration just raised, at the moment it raises it. When narration says
"three inputs feed the pipeline," three inputs should be visible. This is the
editorial expression of Mayer's temporal contiguity principle (Section 3) and it is
the strongest argument for the storyboard pairing visual-to-narration-beat rather
than visual-to-clock.

**J-cuts and L-cuts (split edits).** A split edit is one where audio and picture
change at *different* instants. In a **J-cut** the audio of the next scene starts
*before* its picture arrives; in an **L-cut** the audio of the current scene
continues *after* its picture has gone. Both make a cut feel motivated rather than
abrupt, because the viewer hears the transition slightly before or after seeing it,
which is how attention naturally works — sound orients, then the eye follows.
(Adobe: <https://www.adobe.com/creativecloud/video/discover/j-cut-and-l-cut.html>;
Wikipedia "Split edit": <https://en.wikipedia.org/wiki/Split_edit>)

For a deterministic slide-plus-narration pipeline the transferable form is: **let
the narration of the next scene begin a beat before the new slide renders (a J-cut),
or let the outgoing narration finish over the incoming slide (an L-cut).** Hard-cut
audio and picture together on every scene and the piece feels like a slideshow with
a voice bolted on. The composition step (`compose.mjs`, `ffmpeg.mjs`) is where this
would live; it needs the ability to overlap an audio tail or head across a visual
boundary by a small offset (typically 0.3–1.0s, matching the BBC's 0.3s-per-word
reading floor in Section 6).

**Pacing and shot length.** Documentary convention is that shot length should track
information density and emotional register: fast cuts for energy and montage, long
holds for a point that needs to land or a complex image that needs reading. The
explainer analogue is that a slide carrying one statement can be short, while a slide
carrying a dense diagram must be *held long enough to be read* — and the read time is
computable (Section 5 gives figures). A build that assigns equal duration to every
slide will starve the dense ones and bore on the sparse ones.

**Lower thirds and on-screen titling.** A lower third is a name/title graphic in the
lower portion of frame (historically the lower third of a 4:3 screen). Convention:
it appears shortly after a person or subject is introduced, holds long enough to be
read (~3–5s), and sits inside the title-safe area (Section 7). For an explainer the
lower-third slot is where a speaker attribution, a section label, or a persistent
"you are here" marker belongs — and critically, it must not collide with the
burned-in subtitle band (Section 6). This is a real layout constraint: **a video
frame has a reserved lower band for captions and often a lower-third zone above it;
the deck's lower region is contested in a way a slide's never is.**

**Handling exposition without boring the viewer.** Documentary's answer is to never
let the voice state a fact the picture is not simultaneously earning — the montage,
the archival cut, the moving map. The explainer discipline that follows: **do not
narrate a bullet list.** If the narration is a list of five things, the screen must
transform as the list advances (reveal, highlight, count up), or the viewer
disengages. This is direct support for the skill's ban on static bullet lists and
its card model — but it also implies the *cards should be able to reveal in sequence,
timed to narration*, which is a motion requirement the current static-render model
may not express.

---

## 2. Narration writing for the ear

Writing for the ear is a different craft from writing for the eye. The reader can
re-scan a sentence; the listener gets one pass at the speed you chose. Every rule
below reduces the listener's working-memory load.

**Words per minute — comfortable narration pace.** The most defensible anchor:

- **Conversational English averages ~150 WPM.** The National Center for Voice and
  Speech is the usual citation for this figure.
  (via VirtualSpeech:
  <https://virtualspeech.com/blog/average-speaking-rate-words-per-minute>; CUNY
  speech-rate page recommends ~140 WPM for intelligibility:
  <https://tfcs.baruch.cuny.edu/speaking-rate/>)
- **Explainer / corporate narration: plan 130–160 WPM.** Slower than conversation,
  because the listener is also processing a visual. Industry voiceover guidance
  clusters here; commercial reads push to ~170 WPM for energy.
  (Industry-reported, corroborated:
  <https://biteable.com/blog/video-word-count/> gives 120–200 WPM as a workable
  band; voiceover services converge on ~150 WPM ≈ 75 words per 30s.)
- **Practical planning number: ~150 WPM = 2.5 words/second.** A 60-second scene is
  ~150 words; a 10-second scene is ~25 words. This is the ratio the pipeline should
  use to convert a narration string to an estimated scene duration, and it is the
  same number `synthesize.mjs` should target for TTS rate.

Flag: the exact "right" WPM is content- and voice-dependent, and none of the sources
is a controlled study of *comprehension vs. rate for narrated-slide video
specifically*. Treat 130–160 WPM as a well-corroborated planning band, not a law.
The hard ceiling that *is* well-grounded is the subtitle reading-speed limit (Section
6): narration that exceeds ~180 WPM produces captions the viewer cannot read, so the
caption limit effectively caps comfortable narration too.

**Sentence length and structure — concrete rules:**

- **Short sentences. One idea each.** The ear cannot hold a 40-word sentence with
  three subordinate clauses. Break it.
- **Avoid subordinate clauses and mid-sentence parentheticals.** "The pipeline,
  which was built last year and which handles both stacks, validates the input" is a
  reading sentence. For the ear: "The pipeline validates the input. We built it last
  year. It handles both stacks."
- **Name the subject before the action.** "The validator rejects malformed input"
  (subject → verb) is processable in one pass. "Malformed input, when it reaches the
  validator, is rejected" makes the listener hold "malformed input" in memory waiting
  for the verb. This mirrors the BBC's own sound-effect labelling rule — *subject +
  active finite verb* ("FLOORBOARDS CREAK", not "CREAKING OF FLOORBOARDS")
  (BBC Subtitle Guidelines §17.4:
  <https://www.bbc.co.uk/accessibility/forproducts/guides/subtitles/>).
- **Numbers as words for small counts; numerals for data.** For narration you are
  writing what the voice says, so spell out small numbers ("three inputs") but keep
  numerals with units and for precise data. Interestingly this *inverts* on the
  caption track, where the BBC spells out 1–10 in prose but uses numerals with units
  and for scores/data (BBC §18). The reconciling rule: the *spoken* form and the
  *caption* form of a number can legitimately differ, and a pipeline that derives
  captions verbatim from the narration script must be told which form the script is
  in.
- **Don't narrate the UI.** "Click the blue button in the top right" ages instantly
  and forces the eye to hunt. Narrate the *intent* ("submit the form") and let the
  visual — a cursor, a zoom, a highlight (Section 9) — carry the *where*. This is the
  screen-recording corollary of "the visual answers the narration."

**Narration and visual must reinforce, not duplicate.** This is the redundancy
finding from multimedia learning, and it is counterintuitive: **reading the on-screen
text aloud word-for-word while it is shown can *hurt* comprehension** (the redundancy
principle — Mayer). The productive relationship is complementary: the visual shows
the structure, the narration explains the significance; the on-screen text carries
the *keywords*, the voice carries the *connective tissue*. The exception is the
mute-viewer reality (Section 5): on-screen text must independently carry the message
for the 85% watching silent, so some duplication of the *headline* is defensible even
if the full narration is not duplicated.
(Mayer, redundancy principle:
<https://www.researchgate.net/publication/262915119>)

---

## 3. Scene and slide alignment (temporal contiguity)

This is the strongest evidence in the entire track, and it should carry real weight.

**The temporal contiguity principle.** People learn more deeply when corresponding
words and pictures are presented *simultaneously* rather than successively. Richard
Mayer's meta-analysis reports the principle held in **9 of 9 experimental tests, with
a median effect size of 1.22** — a very large effect by social-science standards.
(Mayer, "Principles for reducing extraneous processing…":
<https://www.researchgate.net/publication/262915119>; Cambridge chapter:
<https://www.cambridge.org/core/books/abs/multimedia-learning/temporal-contiguity-principle/2236655CB3759154DF148595FF2EC1FC>)

The direct implication for the pipeline: **a visual must arrive when its narration
arrives, not before and not after.** A diagram that appears 3 seconds after the voice
describes it, or a stat that flashes up 2 seconds before it is mentioned, both break
contiguity and cost comprehension. The storyboard's unit of synchronization should be
the *narration beat*, and the renderer should be able to reveal an element on the
beat that mentions it.

**The cost of a visual arriving late vs. early.** Both hurt, but differently:

- **Late** (visual lags the word): the viewer hears a claim with nothing to attach it
  to, holds it in working memory, and the picture arrives after the mental slot has
  gone stale. This is the more damaging direction for dense content.
- **Early** (visual leads the word): the viewer reads/interprets the visual, forms a
  guess, and the narration then either confirms (mild redundancy, tolerable) or
  contradicts the guess (costly). A *deliberate* early reveal is the J-cut used well;
  an *accidental* one is noise.

The tolerance is small. The subtitle-sync literature (Section 6) puts the acceptable
lag between speech and caption at **no more than 2 seconds, aiming for near-zero**
(BBC §5.4). Treat that 2-second ceiling as the outer bound for visual-to-narration
misalignment too; the target is sub-second.

**Word-level alignment techniques.**

- **Forced alignment** is the standard technique: an algorithm (e.g. Montreal Forced
  Aligner, aeneas, gentle, or a Whisper-based aligner) takes an audio file and its
  transcript and returns per-word start/end timestamps. This is exactly what a
  deterministic pipeline needs to place a highlight or reveal on the exact frame a
  word is spoken. The skill's `subtitles.mjs` already synthesizes cue timings from
  text + measured audio duration when the TTS provider (Kokoro) emits no SRT — that
  is a *coarse* alignment (proportional by character count). **A genuine forced
  aligner would give word-level timing and unlock keyword-highlight-on-mention.**
  Note the offline/deterministic constraint: forced aligners that run locally
  (aeneas, MFA) preserve the "no network at build time" property; Whisper-based ones
  can too if the model is vendored.
- **Keyword highlighting on mention** — highlighting or revealing a word/card at the
  instant the narration says it — is the applied form of temporal contiguity and the
  applied form of kinetic typography (Section 5). It is high-value and cheap once
  word timings exist.

**Caveat on the current cue-synthesis approach.** Proportional-by-character cue
timing drifts on any line where speech rate varies (emphasis, pauses, numbers read
slowly). For captions the drift is usually within the 2-second tolerance. For
*element reveals* it is not — a reveal 1.5s off its word is visibly wrong. So the
recommendation is graded: keep proportional timing for captions; require real forced
alignment before shipping word-synced *motion*.

---

## 4. Motion as an attention instrument, not decoration

Motion is expensive attention. It is nearly impossible to *not* look at something
that moves, which is exactly why decorative motion is harmful: it spends the
viewer's involuntary attention on nothing. The design-system consensus is that motion
must be *functional*.

**What motion is uniquely good at** (and static layout cannot do):

- **Directing gaze.** A single moving/appearing element in an otherwise still frame
  captures the eye. This is the motion expression of "information weight → focus":
  the heaviest element can *earn* its dominance by being the thing that moves or
  reveals, not just the thing that is biggest.
- **Showing causation and transformation.** "A becomes B" or "X causes Y" is shown by
  motion far more clearly than by two static states side by side. This is the video
  answer to the `comparison` (before/after) and `process-flow` layouts: in video they
  can *animate the transition* rather than juxtapose.
- **Showing change over time.** A count-up on a stat, a bar growing, a phase advancing
  along the `lifecycle` rail — motion makes the "over time" literal.

**Standard easing and duration conventions (Material Design — primary source).**

- **Small / micro-interactions: 100–200 ms.** Selection controls ~100 ms.
  (<https://material.io/design/motion/speed.html>,
  <https://material.io/archive/guidelines/motion/duration-easing.html>)
- **Larger transitions on mobile: 300–400 ms.** "Animations longer or shorter than
  these can feel sluggish or difficult to follow."
  (<https://material.io/archive/guidelines/motion/material-motion.html>)
- **Enter/exit asymmetry:** elements *entering* use a **decelerate** curve
  (fast→slow, `cubic-bezier(0.0, 0.0, 0.2, 1)`); elements *leaving* use an
  **accelerate** curve (slow→fast, `cubic-bezier(0.4, 0.0, 1, 1)`); elements moving
  within the frame use a **standard/emphasized** curve
  (`cubic-bezier(0.4, 0.0, 0.2, 1)`). Enter is often given slightly more time than
  exit, because arrivals should be noticed and departures should get out of the way.
  (Material movement: <https://material.io/archive/guidelines/motion/movement.html>;
  corroborated by Atlassian 150–400 ms range:
  <https://atlassian.design/foundations/motion>)

For a 1920×1080/1080×1920 explainer, a full-frame scene transition sits at the top of
that band (~300–500 ms); an element reveal *within* a held slide sits at
150–250 ms. Anything slower than ~500 ms for a routine transition reads as sluggish
and steals time from the narration.

**When a transition carries meaning vs. when it is noise.** A transition is
*meaningful* when it encodes a relationship: a push-left says "next in sequence," a
zoom-in says "detail of the thing you just saw," a cross-dissolve says "time passed
or subject changed." A transition is *noise* when the same flashy wipe is applied to
every cut regardless of relationship — the viewer stops reading it as information.
Rule: **pick the transition from the relationship between the two scenes, not from a
default.** This maps onto the SCR/archetype model — a `situation → complication` beat
might hard-cut (jarring is the point); a `hero → detail` beat should zoom (continuity
is the point).

**Accessibility — respect reduced-motion (requirement, not option).** Users can set
an OS-level "reduce motion" preference. On the web it is exposed as the
`prefers-reduced-motion` media query; the browser reports `reduce` when set.
(MDN: <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>)
WCAG covers this from two directions:

- **SC 2.3.3 Animation from Interactions (Level AAA):** interaction-triggered motion
  animation must be disable-able unless essential.
  (<https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions>)
- **SC 2.2.2 Pause, Stop, Hide (Level A):** auto-playing motion lasting >5s must be
  pausable/stoppable — relevant to any auto-playing rendered deck.

The subtlety for a *rendered video file*: a burned-in MP4 cannot read the viewer's OS
preference at play time. So the honest accessibility posture is:
1. For the **HTML/interactive deck path**, honour `prefers-reduced-motion` in the CSS
   (disable or reduce transitions) — this is achievable and should be done.
2. For the **rendered video path**, motion is baked in, so the mitigation is
   editorial restraint (no gratuitous motion, nothing flashing >3×/sec per WCAG
   2.3.1 to avoid seizure risk) plus, ideally, offering a **reduced-motion render
   variant** as a build flag. Flag as an assumption that the current pipeline has no
   reduced-motion render variant; recommend one.

---

## 5. Kinetic typography and text-on-screen

**When animated text helps.** Kinetic typography (text that appears, moves, or
emphasizes in time) helps when it (a) reveals in sync with narration — one line
arrives as the voice says it, satisfying temporal contiguity — or (b) emphasizes the
single word that carries the point. It *hurts* when all the text animates all the
time: the motion budget is spent and nothing stands out. The rule from Section 4
applies: the animated word should be the heaviest word.

**How much text a viewer can read in a held shot.** Two convergent numbers bound
this:

- **Subtitle reading-speed ceiling (Section 6): ~160–180 WPM ≈ 15–17 characters per
  second.** Above ~200 WPM most viewers cannot keep up (BBC/Ofcom).
- **Silent reading is faster than caption reading** (~238 WPM average silent reading,
  per aggregated reference data), but on-screen presentation text should be sized and
  timed to the *caption* ceiling, because a video viewer is also watching the picture
  and cannot re-read.

Practical figure for a held slide: **budget ~0.3 seconds per word of on-screen text
as a floor** (the BBC's 0.3s/word minimum, §4.1), and more for dense or unfamiliar
words. A slide with a 12-word statement needs ≥~4 seconds on screen *just to be
read*, before any narration time. A `tiled` slide with four 6-word cards (~24 words)
needs ≥~7 seconds. **This is a concrete input the duration model should use: minimum
slide duration = max(narration duration, on-screen-word-count × 0.3s).**

**The "watched without sound" reality.** This is decisive for the on-screen-text
question.

- **~85% of Facebook video views occur without sound**, per multiple publishers
  (LittleThings, Mic ~85%; PopSugar 50–80%). Widely corroborated but *publisher-
  reported*, from 2016, and a "view" was counted at 3 seconds of autoplay — so treat
  85% as directional, not precise.
  (Digiday: <https://digiday.com/media/silent-world-facebook-video/>; Nieman Lab
  archive: <https://www.niemanlab.org/reading/publishers-say-85-percent-of-facebook-video-is-watched-without-sound/>)
- A later industry survey reports **~75% of people often watch mobile video on mute**
  (85% millennials, 64% Gen X) — same direction, different method.
  (<https://digiday.com/sponsored/75-percent-of-people-watch-mobile-videos-on-mute/>)
- A **2024 peer-reviewed eye-tracking study** (PLOS ONE) confirms watching subtitled
  video with sound off measurably changes comprehension, cognitive load, and gaze
  patterns — i.e. the silent+subtitle mode is a real, distinct viewing condition, not
  a rounding error.
  (<https://pmc.ncbi.nlm.nih.gov/articles/PMC11458047/>)

**What this implies:** for any video intended for social/feed distribution
(especially the 1080×1920 portrait variant), **the on-screen text and captions must
carry the message independently of the audio.** The narration cannot be the sole
carrier of the argument. This is a strong argument that the portrait/video variant
should (a) always burn in captions, and (b) surface the headline of each scene as
persistent on-screen text, not rely on the voice. It also tightens the density
budget: silent viewers read, and reading takes the per-word time above, so the video
variant must carry *less* text per second than a read deck where the eye is the only
channel. (Quantified in Section 10.)

---

## 6. Captions and subtitles as design elements

Captions are not an afterthought layer; on a video frame they are a **reserved
region** that constrains everything beneath them. The standards are precise and
mostly consistent.

**Reading-speed limits (the core numbers):**

| Source | Limit | Notes |
| --- | --- | --- |
| **BBC Subtitle Guidelines** | **160–180 WPM**; >200 WPM "difficult for many"; **0.3–0.375 s/word**, min ~0.3 s/word (1.2 s for a 4-word cue) | Ofcom-aligned. §4, §4.1. <https://www.bbc.co.uk/accessibility/forproducts/guides/subtitles/> |
| **Netflix (English adult)** | **17 CPS** adult, **13 CPS** children ("USA" guide) | ≈ matches BBC's ~15–17 CPS. |
| **Netflix (general)** | Duration **5/6 s (0.83s) min – 7 s max** per event; **2 lines max**; **centre-justified, top or bottom** | <https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617-Timed-Text-Style-Guide-General-Requirements> |
| **FCC / Ofcom** | Require *readable, accurate, synchronized* captions but set **no single numeric CPS limit** — they defer to guidelines like the above. | Regulatory floor is qualitative. |

Convergent working ceiling: **~15–17 CPS / ~160–180 WPM**, with **~0.3 s/word
minimum on-screen** and a **minimum cue duration ~0.83 s** and **maximum ~7 s** (a
cue left up longer gets re-read). These belong in the caption module as hard checks.

**Placement, safe margins, line length, line count** (BBC §3, §9, §10 — primary):

- **Line count:** **2 lines max for 16:9 / 4:3 / 1:1**; **3 lines max for 9:16
  (vertical)**. Netflix: 2 lines max.
- **Line length:** broadcast Teletext cap is **37 characters**; online is defined by
  width — **≤68% of a 16:9 width**, **≤90% of a 4:3/1:1/9:16 width**. BBC's own
  equivalence: *37 chars in a 75%-width 16:9 region ≈ 25 chars in a 90%-width 9:16
  region.* So **a portrait caption line holds ~25 characters where a landscape line
  holds ~37** — the caption text must be **re-wrapped per aspect**, which
  `subtitles.mjs` already does.
- **Vertical placement:** bottom of frame by convention, inside the safe area; but in
  **9:16, ride higher** (still lower third) because faces sit in the top half and
  platform chrome eats the bottom. The BBC explicitly changed its guidance to add
  9:16-specific size/position rules.
- **Break at linguistic points** (after punctuation, before conjunctions/
  prepositions; never split article+noun, preposition+phrase, pronoun+verb). Netflix
  gives the same list. Prefer editing/timing over a bad line break.
- **Font size:** authored line height **7–8% of video height for 16:9/4:3/1:1**;
  **3.9–4.5% for 9:16** (the 8% × 9/16 adjustment, so text is the same physical size
  after rotation). Presentation may scale *down* (×0.5–0.8 on large screens) but never
  up.

**Styling for legibility over arbitrary backgrounds:**

- BBC: **white text (#FFFFFF) on a solid black box**, background applied per line,
  extended by **0.5 em each side**, no gap between lines (`itts:fillLineGap`). This is
  exactly the model `subtitles.mjs` implements (`rgba(15,23,42,0.86)` box). The
  black/near-black box is what guarantees legibility over *any* footage — it is the
  single most robust choice and should be the default.
- Speaker colours (yellow/cyan/green on black) exist but are for multi-speaker
  disambiguation; not needed for single-narrator explainer.
- Avoid coloured backgrounds; avoid emoji glyphs (hard to see on black — BBC uses ♫
  U+266B not 🎵).

**How burned-in subtitles constrain the layout beneath them.** This is the key
cross-cutting finding for the *layout catalogue*: the caption band is a **keep-out
zone** for slide content.

- In **16:9**, the caption occupies roughly the **bottom ~10–15%** (centred, within
  the 90%-vertical safe area). Slide content — especially the dominant/heaviest card,
  a stat, or a lower-third label — must not live in the bottom band, or the caption
  covers it.
- In **9:16**, captions ride higher (bottom third but above chrome), so the keep-out
  zone is *larger and higher* than in landscape.
- The clean solution the module already notes: in **9:16 letterbox**, captions can
  live in the empty bar *below* the footage, freeing the picture entirely. Where a
  letterbox exists, prefer it for captions.

**Recommendation for `slide-layouts.md`:** every layout's portrait rule (and ideally
the landscape rule) should declare a **caption-safe bottom band** that content must
not enter when captions are burned in. Layouts whose dominant slot is bottom-anchored
(`stat-deepdive` headline low, `bento-b` wide card if placed low) need an explicit
"raise content above the caption band" rule in the video path. This is a genuine gap:
the deck layouts were designed for a full canvas; the video frame has a reserved
band the deck never had.

---

## 7. Safe areas and platform framing

**Broadcast title-safe and action-safe (the origin of all safe-area thinking).** From
CRT overscan, standardized in SMPTE ST 2046 / EBU R95:

- **Action-safe: inner ~93% (≈3.5% inset each edge).** Important action stays inside.
- **Title-safe: inner ~90% (≈5% inset each edge).** Text/graphics stay inside.

Applied to the pipeline's two canvases:

| Canvas | Title-safe (90%) inset | Title-safe content box |
| --- | --- | --- |
| **1920×1080** | 96 px L/R, 54 px T/B | x∈[96,1824], y∈[54,1026], 1728×972 |
| **1080×1920** | 54 px L/R, 96 px T/B | x∈[54,1026], y∈[96,1824], 972×1728 |

(BBC's own online caption rule generalizes this: keep captions within the central 90%
vertically and 75% horizontally for 16:9; reversed for 9:16 — §10.)

**Platform UI keep-out zones (the modern, harder constraint).** Feed platforms overlay
their own chrome — captions, username, buttons, progress — on top of the video, and it
is not inside the safe area, it is *on top of the picture*. These zones are not
published as exact pixel specs by the platforms and shift with app versions, so the
figures below are **derived from creator-community measurement and the platforms'
"keep it in the middle" guidance — treat as approximate, verify against the current
app.** (Assumption flag: no platform publishes an authoritative pixel keep-out map;
these are community-consensus figures.)

Derived keep-out for **1080×1920 (9:16)** — the high-risk canvas:

- **Right edge:** action buttons (like/comment/share/profile) occupy roughly the
  **right ~120–140 px**, extending up from the bottom ~35–45% of height. Keep content
  out of the right ~140 px in the lower ~60% of frame.
- **Bottom:** caption/username/CTA occupy roughly the **bottom ~320–420 px** (≈17–22%)
  on TikTok/Reels; YouTube Shorts similar. Keep essential content — and your own
  burned-in captions — above ~420 px from the bottom.
- **Top:** a smaller band (~110–210 px) for "Following/For You" tabs, sound/profile
  chrome. Keep titles below ~210 px from the top.
- **Net safe content box for 9:16:** roughly the **central column ~820 px wide × the
  vertical span from ~210 px top to ~420 px bottom** — much smaller than the raw
  frame. This is why portrait layouts must carry *less* than landscape.

For **1920×1080 (16:9)** on YouTube/LinkedIn (in-feed or player): the main keep-out is
the **bottom ~120–150 px** (player scrubber/controls on hover, and the burned-in
caption band) and a modest bottom-right for the player's own controls. Landscape is
far more forgiving than portrait.

**Recommendation:** the composition/layout code should carry two nested boxes per
aspect — the **broadcast title-safe box (90%)** for general content, and the tighter
**platform-safe box** (subtracting the derived chrome zones) for anything that *must*
survive on a feed. The portrait platform-safe box is the binding constraint on how
much a 9:16 slide can hold.

---

## 8. Retention and attention over a video's duration

This is the topic with the weakest evidence base, so it is reported with the most
caution. Almost every "optimal length" and "X% drop-off" number in circulation is
marketing-blog content without published method. What *is* citable:

**The first seconds (the one well-grounded lever).** YouTube's own analytics define
an **"Intro" metric = the percentage of viewers still watching after the first 30
seconds** — the platform itself treats the opening 30s as the decisive window.
(Google/YouTube Support, primary:
<https://support.google.com/youtube/answer/9314415>)
The consistent creator-community observation is a **steep drop in the first ~30 s**
(commonly cited as 20–30% lost), which is directionally credible because it matches
the platform's own instrumentation focus — but the *specific percentages are
marketing-blog figures and should not be quoted as fact.*
(e.g. <https://alanspicer.com/youtube-audience-retention-keep-viewers-watching/> —
flagged unreliable.)

**Cost of a slow open.** The defensible, source-anchored claim: because the platform
measures and rewards early retention, and because a large share of viewers are
gone by 30s, **the opening must deliver the payload immediately** — state the value,
show the answer, or pose the concrete question in the first few seconds. No logo
sting, no "hi and welcome," no slow build. This aligns with the SCR archetype:
lead with the *complication* or the *resolution preview*, not throat-clearing.

**Chapter markers.** YouTube supports chapters (timestamped segments). Their
documented effect is navigational — they let viewers jump to the part they want,
which helps *satisfaction and re-watch* but can also let viewers skip. There is no
strong public causal data that chapters raise overall retention; treat their benefit
as "findability," not "retention," and flag any retention claim as unverified.

**Optimal length by purpose.** No source in this research rises above marketing-blog
quality for specific length recommendations, so these are offered as *conventions to
start from and measure against*, explicitly flagged as unverified:

- **Product demo:** long enough to show the one core flow end-to-end; convention
  ~60–120 s. Diminishing returns past the "aha."
- **Feature announcement:** short; ~30–60 s. One feature, one benefit, one proof.
- **Tutorial:** as long as the task honestly takes; retention on tutorials is more
  forgiving because intent is high, but pad nothing.
- **Briefing / internal:** length follows content; the deck-first path may run
  minutes.

**The honest takeaway for the pipeline:** the one evidence-backed rule is *front-load
the value in the first few seconds*. Everything else about length and retention is
context-dependent and should be a tunable, not a baked assumption. Do not encode
specific length or retention targets as invariants.

---

## 9. Screen recording and product-demo craft

For the product-demo archetype, the failure mode is that the viewer cannot find what
changed. The craft is entirely about *directing the eye to the change*.

- **Cursor visibility and smoothing.** A raw recorded cursor jitters and teleports.
  Convention: **smooth the cursor path, slow it near targets, and optionally enlarge
  or highlight it** (a soft ring/spotlight) so the eye can follow. Some tools add a
  click-pulse. The cursor is the narration's pointer — it answers the "where" the
  voice deliberately omits (Section 2, "don't narrate the UI").
- **Zoom-to-focus and pan.** **Zoom in on the region that matters** the moment the
  narration reaches it (temporal contiguity again), then pan/zoom to the next region.
  A full-resolution app screenshot at 1080p makes UI text tiny and buttons ambiguous;
  a zoom makes the relevant control unmistakable. This is the screen-recording form of
  "information weight → focus": the changed element gets magnified.
- **Speed-ramping dull stretches.** Long loads, repetitive typing, and navigation are
  **sped up (or cut with an L-cut)** so the viewer spends time only where meaning is.
  Never real-time a 20-second build; ramp it.
- **Hiding irrelevant UI.** Blur, crop, or dim chrome that is not part of the point.
  The frame should contain only what the current sentence is about. Reducing on-screen
  competition is the same discipline as not putting five cards where one belongs.
- **Show the change, don't make them hunt.** Before a change, briefly rest on the
  "before" state; trigger the change; then hold on the "after" — ideally with a
  highlight/flash on the exact element that changed. A cross-fade between before/after
  states, or an arrow/ring on the delta, removes the hunt. This is the motion
  expression of the `comparison` layout: in video, before/after is a *timed
  transformation*, not a static split.

None of this is exotic tooling: cursor smoothing, zoom keyframes, and speed ramps are
standard in screen-capture editors, and all are deterministically expressible as
keyframe metadata on a captured clip — compatible with the pipeline's Playwright
capture + FFmpeg/Remotion composition path.

---

## 10. The genuine differences between a deck page and a video frame

Enumerated concretely, then a recommendation.

| Dimension | Deck page (presented / read) | Video frame (watched, narrated) |
| --- | --- | --- |
| **Density** | High. The eye scans, the presenter elaborates, the reader lingers. A dense slide is fine. | Low. The eye has one pass at a controlled speed while also tracking narration and captions. |
| **Dwell time** | Viewer-controlled (reader) or presenter-controlled with Q&A. Effectively unbounded. | Editor-controlled and fixed. The frame is gone when the cut says so. |
| **Viewer control over pacing** | Full (reader can stop, re-scan) or shared (presenter reads the room). | None. The viewer can only scrub — a coarse, disengaging control. |
| **Re-reading** | Free and instant. | Impossible without scrubbing; assume it never happens. |
| **Subtitle intrusion** | None. Full canvas. | A reserved bottom band (Section 6) plus platform chrome (Section 7). Real usable area is smaller. |
| **Does audio carry the argument?** | No audio (read) or the presenter *is* the audio (live). | Narration carries it — *unless muted*, and ~85% may be muted (Section 5), so on-screen text must independently carry it. |
| **Attention model** | Voluntary, self-paced scanning. | Involuntary capture by motion + forced march by the edit. |
| **Failure mode** | Too sparse (looks empty, presenter has nothing to point at). | Too dense (can't be read in the dwell time; overflows the safe/caption zones). |

**Can one source of truth produce both?** **Yes — the structured `storyline.yml`
content model is the right single source** (a layout id + typed slots is
presentation-neutral). What must *not* be shared is the **density budget and the
timing/reveal metadata.** The same content should render at **systematically lower
on-screen density in the video variant**, and the video variant needs timing the deck
does not (per-scene duration, per-element reveal beats, caption cues, safe-band
offsets).

**How much less on-screen content should the video variant carry? A concrete
recommendation, built from the numbers above rather than taste:**

1. **Text budget per frame:** a video frame's on-screen text should be readable within
   its dwell time at the caption ceiling of **~15 CPS / ~0.3 s per word** (Section 6),
   while *also* leaving the dwell for the narration. A read deck slide has no such
   ceiling. Practically this caps a video frame at roughly **the headline + one short
   supporting line + at most 2–3 short cards**, versus the deck's comfortable 3–4
   denser cards. **Rule of thumb: a video frame should carry ~50–60% of the text a
   read-deck slide of the same layout carries.**
2. **Card counts, per layout, video variant:** shift the accepted range down by one.
   Where the deck's `spotlight`/`tiled` take 3–4 cards, the video variant should
   prefer the **lower bound (3)** and treat 4 as an overflow risk given the caption
   band and platform chrome. `process-flow`'s five cards is almost certainly **too
   many for a single video frame** — in video it should *reveal sequentially* (one
   node per narration beat) rather than show all five at once, or be split across
   scenes.
3. **Portrait is tighter still.** The 9:16 platform-safe box (Section 7) plus the
   3-line caption zone (Section 6) mean the portrait video variant should carry
   **~40–50% of the read-deck density** — headline + one card revealed at a time is
   often the honest maximum.
4. **Minimum duration is computed, not fixed:**
   `slide_duration = max(narration_seconds, onscreen_word_count × 0.3s, layout_read_floor)`.
   This ties Sections 3, 5, and 6 together into one build rule.

**Net recommendation to the skill:** keep the single structured source of truth, but
introduce a **per-target density profile** (`deck` vs `video-landscape` vs
`video-portrait`) that (a) lowers accepted card counts and text budgets for the video
targets, (b) reserves caption-safe and platform-safe bands as content keep-out zones,
(c) adds per-scene timing and per-element reveal beats driven by narration (ideally
via forced alignment), and (d) selects transitions by scene relationship rather than a
default. The layout *catalogue* can stay shared; the *constraints and timing* must
fork by target. This is the concrete way "information weight maps onto layout" extends
into time: in video, the heaviest element is not just the biggest — it is the one that
**moves, reveals, or magnifies on the exact beat the narration names it.**

---

## Sources (primary / standards / peer-reviewed first)

- BBC Subtitle Guidelines (v1.2.5, 2026) — reading speed, line length/count,
  placement, safe area, timing, colour, aspect-specific rules.
  <https://www.bbc.co.uk/accessibility/forproducts/guides/subtitles/>
- BBC R&D, "How fast should subtitles be?" (160–180 WPM; >200 WPM hard to follow).
  <https://www.bbc.co.uk/rd/blog/2015-09-how-fast-should-subtitles-be>
- Netflix Timed Text Style Guide — General Requirements (2 lines, 5/6s–7s, centre,
  %-values). <https://partnerhelp.netflixstudios.com/hc/en-us/articles/215758617-Timed-Text-Style-Guide-General-Requirements>
- Netflix Timed Text Style Guide — Subtitle Timing.
  <http://mep-support.zendesk.com/hc/en-us/articles/360051554394>
- W3C WCAG 2.2 — SC 2.3.3 Animation from Interactions.
  <https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions>
- MDN — `prefers-reduced-motion`.
  <https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion>
- Material Design — Duration & easing, Speed, Material motion, Movement.
  <https://material.io/design/motion/speed.html> ·
  <https://material.io/archive/guidelines/motion/duration-easing.html> ·
  <https://material.io/archive/guidelines/motion/material-motion.html> ·
  <https://material.io/archive/guidelines/motion/movement.html>
- R. Mayer, temporal contiguity principle (9/9 tests, median effect size 1.22) &
  redundancy principle.
  <https://www.researchgate.net/publication/262915119> ·
  <https://www.cambridge.org/core/books/abs/multimedia-learning/temporal-contiguity-principle/2236655CB3759154DF148595FF2EC1FC>
- W. Murch, *In the Blink of an Eye* — Rule of Six (emotion 51%, story 23%…).
  <https://en.wikipedia.org/wiki/In_the_Blink_of_an_Eye_(Murch_book)>
- National Center for Voice and Speech / CUNY — conversational ~150 WPM, ~140 for
  intelligibility. <https://tfcs.baruch.cuny.edu/speaking-rate/> ·
  <https://virtualspeech.com/blog/average-speaking-rate-words-per-minute>
- J-cut / L-cut (split edit): Adobe · Wikipedia.
  <https://www.adobe.com/creativecloud/video/discover/j-cut-and-l-cut.html> ·
  <https://en.wikipedia.org/wiki/Split_edit>
- YouTube Support — audience-retention "Intro" = % watching after first 30s (primary).
  <https://support.google.com/youtube/answer/9314415>

### Industry-reported (corroborated, methodologically limited — flagged)

- "85% of Facebook video watched without sound" (Digiday, 2016; Nieman Lab).
  <https://digiday.com/media/silent-world-facebook-video/> ·
  <https://www.niemanlab.org/reading/publishers-say-85-percent-of-facebook-video-is-watched-without-sound/>
- "~75% watch mobile video on mute" (Digiday sponsored survey).
  <https://digiday.com/sponsored/75-percent-of-people-watch-mobile-videos-on-mute/>
- Voiceover WPM planning bands (Biteable et al., ~120–200 WPM).
  <https://biteable.com/blog/video-word-count/>

### Peer-reviewed supporting

- Silent+subtitle viewing changes comprehension/load/gaze — PLOS ONE 2024, eye-track.
  <https://pmc.ncbi.nlm.nih.gov/articles/PMC11458047/>

### Explicitly flagged unreliable (marketing-blog; direction only)

- Specific YouTube first-30s drop-off percentages (e.g. "20–30% lost") and specific
  "optimal length by platform" numbers. Reported as conventions to measure against,
  not facts.

### Assumptions flagged in-text

- Platform UI keep-out pixel figures (Section 7) are community-measured, not
  platform-published; verify against current app versions.
- The current pipeline is assumed to have no reduced-motion render variant and no
  per-target density profile; both are recommendations, not observations of missing
  code confirmed exhaustively.
- Forced-alignment availability offline (aeneas/MFA/vendored Whisper) is asserted from
  general knowledge of those tools, not verified against this repo's dependency set.
