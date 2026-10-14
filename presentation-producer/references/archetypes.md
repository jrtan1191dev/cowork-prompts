# Narrative archetypes

Pick a structure before writing scenes. Without one, every video improvises and quality varies wildly — this is the single largest determinant of whether the output is worth watching, and the pipeline cannot supply it.

Each archetype gives a scene skeleton, a duration budget, and the failure it prevents.

---

## 1. Product demo — "the operator's day"

**For:** selling a tool to someone who would use or buy it. 90s–3min.

| # | Scene | Duration | Engine |
| --- | --- | --- | --- |
| 1 | The cost of the status quo, stated concretely | 12–18s | `marp_slides` or chapter card |
| 2 | Where the work starts today | 10–15s | `playwright_web` / stills |
| 3–5 | The workflow, one decision per scene | 12–20s each | `playwright_web` / screencast |
| 6 | The thing that used to be impossible | 15–20s | screencast (real motion) |
| 7 | The measurable outcome | 10–15s | stills or slide |
| 8 | Call to action | 8–10s | slide |

**Prevents:** the feature tour. Nobody wants a list of features; they want to see their own problem disappear.

**Rule:** scene 1 must name a cost — hours, dollars, errors, phone calls. "Streamline your workflow" is not a cost.

---

## 2. Feature announcement

**For:** existing users, one new capability. 45–90s.

1. The friction this removes, in one sentence — 8–12s
2. The feature, doing its job, uncut — 20–30s, screencast
3. The one non-obvious detail power users will care about — 12–18s
4. How to turn it on — 8–12s

**Prevents:** burying a good feature under context existing users already have.

---

## 3. Tutorial / walkthrough

**For:** someone who will follow along. 2–6min.

1. What you will have at the end — show the finished state first — 10–15s
2. Prerequisites — 8–12s, slide
3. Steps, **one action per scene**, 10–20s each, screencast
4. Verification: how you know it worked — 15s
5. Common failure and its fix — 15–20s

**Prevents:** the demo that works only for the presenter. Step 4 is what separates a tutorial from a performance.

**Rule:** use `stills` for explanation, `screencast` for the actions the viewer must replicate.

---

## 4. Before / after contrast

**For:** a process improvement where the old way is familiar and painful. 60–120s.

Alternate deliberately: old way (12–18s) → new way (12–18s), three times, then a summary. Keep the pairing tight so the contrast lands.

**Prevents:** describing an improvement no one can feel. Contrast is comprehension.

**Rule:** the "before" must be honest. A strawman destroys the credibility of the "after".

---

## 5. Tracer journey

**For:** systems where a single unit of work crosses many roles — the shape of `video-plan.md`'s "Tri-Hybrid Arc". 5–12min.

Follow one concrete case end to end, switching persona as it moves, and cut to a contrasting case where the path diverges. Structure per hop: what this role sees → what they decide → what the next role receives.

**Prevents:** the org-chart tour. A dashboard-by-dashboard walkthrough shows the software; a tracer journey shows the *system*.

**Rules:**

- Name the case and keep it named. "Mr Tan" is memorable; "the patient" is not.
- One persona switch per scene. Two is disorienting.
- End the arc where it started, closed.
- At this length, use `--yes` only after approving an outline; a 12-minute render is not a cheap mistake.

---

## 6. Narrated slide deck

**For:** conference talks, internal briefings, async architecture reviews. 3–10min.

`marp_slides` + `stills` throughout, with `remotion_motion` for diagram builds. One idea per slide; the narration carries the argument and the slide carries the evidence.

**Prevents:** slides that are speaker notes. If narration reads the slide aloud, one of them is redundant.

---

## 7. SCR — situation, complication, resolution

**For:** an argument aimed at people who decide. Briefings, exec reviews, funding cases, anything where the deck matters as much as the video. 2–5min.

The consulting structure, and the only archetype that is natively **both** a deck and a video. Set `archetype: scr` in `storyline.yml` to turn on its checks.

| # | Beat | `role` | `in` | Layout | Duration |
| --- | --- | --- | --- | --- | --- |
| 0 | The answer, stated | — | `deck` only | `hero` + pill | — |
| 1 | Situation: how it works today | `situation` | both | `stat-deepdive` | 12–18s |
| 2 | Situation evidence *(optional)* | `situation` | both | `spotlight` | 10–15s |
| 3 | Complication: the tension, priced | `complication` | both | `comparison` | 12–18s |
| 4 | Complication consequence *(optional)* | `complication` | both | `stat-deepdive` | 10–15s |
| 5–7 | Resolution: one mechanism per beat, each followed by a capture | `resolution` | both | `process-flow` / `tiled` | 12–20s each |
| 8 | Measurable outcome | `resolution` | both | `stat-deepdive` | 10–15s |
| 9 | Call to action | — | both | `hero` | 8–10s |

Enforced ranges: 1–2 situation beats, 1–2 complication, 2–5 resolution. Beats must run S → C → R.

**Prevents:** the deck that describes a system without ever saying what is wrong with the current one. "No complication" is the most common defect in both decks and demo videos, and it is now detectable.

**Rules:**

- **The Complication must name a cost** — hours, dollars, errors, phone calls, empty beds. The validator warns when it cannot find one. "Streamline your workflow" is not a cost.
- **Each Resolution beat is followed by a capture that demonstrates it.** The slide makes the claim; the capture is the evidence. A resolution with no demonstration is a promise.
- **Beat 0 is deck-only.** An executive in a meeting cannot leave, so answer-first costs nothing; a video viewer can leave at any second, so the video starts at the Situation. One ordering, one flag — see `references/storyline-authoring.md`.
- **The weighted primary follows the beat's job.** Declare `weight: primary` (or the `stat`) on the one element the beat turns on: in the Complication that is the **cost figure**, in the final Resolution beat the **outcome metric**. `stat-deepdive` beats already make the stat primary; on a card-based beat, mark the card that carries the point so the arrangement agrees with the title. See `references/slide-layouts.md` for the weight model.

**Note on SCR vs the others:** SCR is not a replacement spine. Archetype 1's "cost of the status quo" *is* a Complication, archetype 4 is S→(C→R)×3, and archetype 6 is SCR throughout. Use SCR explicitly when the deck is a deliverable in its own right; use the others when the video is the deliverable.

---

## Choosing

| Signal | Archetype |
| --- | --- |
| "I want to sell this" | 1 |
| "We shipped X" | 2 |
| "Teach people to use it" | 3 |
| "The old way is painful" | 4 |
| "Many roles, one workflow" | 5 |
| "I'm presenting this" | 6 |
| "I need a deck *and* a video, for people who decide" | 7 |

## Narration craft

- **Write for the ear.** Short sentences, no parentheticals, no nested clauses.
- **One idea per scene.** With scene-level alignment, this is what makes the click land on the word describing it.
- **Numbers as words** when spoken: "eighteen beds", not "18 beds".
- **Cut every adjective that survives deletion.** "Powerful", "seamless", "intuitive" carry no information.
- **Name the subject before the action.** "The coordinator approves…", not "It gets approved…".
- **Do not narrate the UI.** "Clicking the blue button in the top right" wastes the visual. Say what it *means*.
- **Target 10–20s per scene.** Beyond a 20% speech-rate change the pipeline refuses and asks you to split.

### Weight has a second axis under narration

On a static deck the heaviest element is simply the biggest. Under narration it has a second axis — **time**. The heaviest element should reveal or magnify **on the beat the narration names it** (temporal contiguity, the largest single effect in the evidence). A card that appears before its word invites reading ahead; after its word, a confused pause. Tolerance is under two seconds; aim sub-second. This is the same instinct as "one idea per scene" above, applied to the weighted primary specifically.

**On-screen text and narration must not be the same words.** Reading the slide aloud is the redundancy penalty — the overlap heuristic warns above 70% (`storyline-authoring.md`), and archetype 6 already names it. The safe exception is a **synchronised caption track**: identical words that appear in lockstep with the audio help rather than harm, because they are not competing prose. On-screen text is keywords; the sentence lives in the narration; captions mirror the narration on the timeline.

## Theme and cut continuity

A light bento slide cutting to a dark dashboard or terminal is a visible flash, and the default transition is a hard cut. Both theme variants exist so you can match the deck to the app: set `theme: dark` in `storyline.yml` when the captured product is dark, and the letterbox background follows automatically.

This is an editorial judgement, not a technical one — a deliberate cut from a bright claim to a dark terminal can be effective punctuation — so nothing is inserted automatically. Automating it would silently change total runtime and force a full re-encode. If you cannot match the themes and the flash bothers you, put a cross-fade only at the light↔dark boundary.
