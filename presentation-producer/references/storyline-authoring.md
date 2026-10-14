# Storyline authoring: `storyline.yml`

The storyline is the authored source. `storyboard.json` is generated from it and committed as a lockfile — regenerable, diffable, never hand-edited.

```bash
node $S/scripts/compile.mjs --root=presentations --presentation=<slug>      # storyline.yml -> storyboard.json
node $S/scripts/deck.mjs    --root=presentations --presentation=<slug>      # slides -> PNG + PDF (+ HTML)
```

`deck.mjs` needs no TTS, no running app and no money. That is deliberate: a deck is a deliverable on its own, and the slides must be reviewable before anything billable runs.

## Why YAML, and why a lockfile

The storyline's job is to make **the argument reviewable in one read**. SCR is a claim about sequence, so a reviewer must see the order without reconstructing it from filenames — hence one ordered file. YAML over JSON because comments are where a slide's *why* lives, and that reasoning survives every regeneration since the pipeline never rewrites this file.

The storyboard is committed rather than gitignored because that is where **cost** lives — scene count, durations, capture actions, total render time. Cost belongs in a pull request. It is not hand-edited because a generator that must preserve human edits cannot be deterministic; `compile.mjs` refuses to overwrite a storyboard with no `$generated` marker unless you pass `--force`.

Node ships no YAML parser, so `compile.mjs` requires the bootstrap. `validateManifest` in `lib/core.mjs` stays dependency-free, because that is where the install-free property was actually earned: an agent can check a storyboard it just wrote without paying for an install.

## Top level

Two blocks. `presentation:` describes the thing being produced; `video:` holds everything only a film needs, and must be absent from a `mode: slides` presentation.

```yaml
presentation:
  mode: video                # slides | video — REQUIRED, and the CLI word must agree
  title: Bed Allocation Without Phone Calls
  archetype: scr             # enables the SCR beat checks
  engine: html               # html | marp — a rendering choice, not an authoring one
  theme: light               # light | dark, identical token names in both
  formats: [png, pdf]        # add `html` for the presentable, convertible bundle
  design: ../shared/DESIGN.md   # optional brand; designDark for the dark palette
  # fontFile: fonts/brand.woff2  # optional: a font Fontsource does not publish
  # orientations: [landscape]    # SLIDES ONLY — a video's deck follows video.outputs

video:                       # omit entirely when mode: slides
  aspect: landscape
  outputs: [{ aspect: landscape }]   # landscape only unless you ask for more
  voice: { provider: auto, gender: female }
  baseUrl: http://127.0.0.1:8080
entries: [ ... ]
```

| Field | Notes |
|---|---|
| `presentation.mode` | **Required.** `slides` produces a deck and nothing else; `video` produces a film *and* its companion deck. The mode belongs to the presentation, so the word on the command line is a guard: a mismatch stops the run. |
| `presentation.title` | **Required.** Also the artifact filename slug. |
| `presentation.archetype` | `scr` turns on beat-count, ordering and cost-naming checks. Omit for a free-form storyline. |
| `presentation.engine` | `html` (bento templates) or `marp`. You never hand-write either — both are compile targets, which is what keeps deck and video pixel-identical. |
| `presentation.theme` | Also sets `meta.background`, so letterbox bars match the deck instead of clashing with it. |
| `presentation.formats` | `png` feeds the video, `pdf` is for presenting, `html` is the hand-off for external PowerPoint conversion — and the only artifact that shows `notes:`. |
| `presentation.orientations` | **Slides only.** The deck's canvas set, default `[landscape]`. A single slide may override it (see *Orientation* below). Declaring it on a video presentation is an error: its deck follows `video.outputs`, and one fact with two sources is one fact that disagrees with itself. |
| `presentation.design`, `designDark` | Paths relative to the **presentation directory**, POSIX-separated. Declared, never discovered: a pinned path is visible in a diff and keeps CI deterministic. `../shared/DESIGN.md` is how two presentations deliberately share one brand. A preset from `templates/theme/` copied in is just another `DESIGN.md`. |
| `presentation.fontFile` | Optional `.woff2` path, embedded exactly as a Fontsource package would be. The escape hatch for a proprietary brand font that can never appear on npm. woff2 only, because the file is base64-embedded with a woff2 mime type. |
| `video.outputs` | **Landscape only by default.** Add `{ aspect: vertical }` or `{ aspect: square }` only when the cut is actually wanted: each extra aspect re-renders every scene and burns its own subtitle track, and for slides it also requires the portrait reflow to hold for every layout. Omitting `outputs` entirely means landscape. |
| `video.voice`, `video.baseUrl`, `video.fixedTime`, `video.aspect` | The narrator, the app being captured, the frozen clock, and the capture canvas. All meaningless in a deck, which is why they are in their own block. |

## Orientation

Orientation is a property of a **canvas**, and a document has one canvas: marp's size lives in its theme, PDFs are written one per orientation, and PowerPoint and Google Slides have a single slide size per deck. So a slide cannot be "portrait inside a landscape deck". What *can* vary per slide is **which canvases it renders onto**.

```yaml
presentation:
  mode: slides
  orientations: [landscape]     # every slide, unless it says otherwise

entries:
  - id: 04-metric
    orientations: [landscape, vertical]   # also emits 04-metric.vertical.png
```

The render passes are the **union** of the deck default and every per-slide override, and each pass contains only the slides that declare it. A pass holding a subset produces a partial deck, which is usually a mistake and occasionally the entire point (three portrait cards for a comms channel) — so it **warns** rather than fails.

## Entries

Every entry has an `id`, a `type`, and an `in` target list. The storyline is a *narrative source*: only some entries render as slides.

| `type` | Becomes | Use for |
|---|---|---|
| `slide` | `html_slides` / `marp_slides`, `stills` | Claims, comparisons, data, section openers |
| `capture` | `playwright_web` | The app doing the thing |
| `footage` | `manual_footage` | Pre-made or generated video |

`capture` and `footage` exist only in a `mode: video` presentation. In a slides presentation they are a hard error rather than something silently dropped, because a claim whose evidence vanished still looks like a finished slide.

### Presenter text: `narration:` or `notes:`

| Mode | Field | Reaches |
|---|---|---|
| `video` | `narration:` | TTS, the burned subtitles, and the deck's notes strip |
| `slides` | `notes:` | the HTML deck's notes strip |

They are separate fields because they are separate registers. A narrator must not read the slide aloud — that is dead air, and the overlap heuristic warns about it. A presenter's note restating the slide is exactly what a note is for, so pointing that heuristic at notes would make it fire on every slide and teach everyone to ignore warnings. Using the wrong field for the mode is a hard error, not a silent coercion.

```yaml
- id: 02-complication          # lower-kebab-case, stable: ids are cache keys
  type: slide
  role: complication           # situation | complication | resolution
  in: [deck, video]            # video default; slides default is [deck]
  layout: comparison
  title: The agreement is the bottleneck
  narration: When the two disagree, someone picks up a phone.
  cards:
    - { icon: phone-off, title: Today, text: Coordinators chase consensus., detail: Four hours }
    - { icon: gauge, title: What it costs, text: Beds sit empty., detail: Empty beds }
```

**Ids are cache keys.** `captureCacheKey` and `audioCacheKey` are content-addressed, not positional, so reordering the storyline rebuilds nothing. Renaming an id rebuilds that scene.

### `in` — the one flag that reconciles deck and video

An executive in a meeting cannot leave, so answer-first costs nothing. A video viewer can leave at any second, so the answer must be promised, not delivered. Both shapes come from one ordering: the deck opens with a `resolution` summary marked `in: [deck]`, and the video starts at the Situation.

```yaml
- id: 00-answer
  type: slide
  in: [deck]                  # never appears in the video
  layout: hero
  pill: Recommendation
  title: Move bed allocation from phone calls to a constraint engine
```

Use `in: [video]` for the inverse — a screencast the deck can only represent as a poster frame.

### `overlay` — how a slide relates to a capture

| `overlay` | Mechanism | Cost |
|---|---|---|
| `none` *(default for slides)* | A full bento slide, hard cut | Free |
| `chapter` | `page.screencast.showChapter` over the **live app**, blurred backdrop | Free |
| `pip` *(captures only)* | True composite | **Forces Remotion** — 400MB, and free only for organisations of 3 or fewer |

SCR beats default to `none`, because a beat is a *claim* and a claim earns a designed slide. Chapter cards carry no information beyond their text, so they belong on in-demo step labels ("Step two: coordinator approves"), where cutting away would break the walkthrough's continuity. When Remotion is unavailable, `pip` degrades to interleave **with a reported warning** — declared need, derived engine, reported degradation, same as every other capability here.

### `capture` entries

```yaml
- id: 04-approve
  type: capture
  narration: Approving an allocation takes one click.
  url: /bmu
  roiSelector: '#recommendations'
  overlay: chapter
  steps:
    - { action: click, role: button, name: Approve, target: Approve, delayMs: 800 }
    - { action: waitForText, value: Allocation approved }
  assert:
    visible: ['Bed Allocation', 'Approve']
    notVisible: ['Sign in', 'Something went wrong']
```

`assert.visible` is **required** on captures. Without it a 404, a login screen or an empty table passes every downstream check — correct resolution, has audio, not black.

### `footage` entries

```yaml
- id: 06-broll
  type: footage
  narration: Meanwhile, the corridor keeps filling.
  src: footage/corridor.mp4        # committed; assets/ is gitignored
  trim: { in: 1.2, out: 9.4 }      # seconds
  useFootageAudio: false
  generate:                        # provenance, not a per-run instruction
    provider: veo
    prompt: Empty hospital corridor at dusk, slow dolly forward, no text, no people
    seed: 42
    durationSec: 8
```

**Generated footage is frozen as an input.** A generative API cannot be pinned by hash — same prompt, different pixels — so the only way to keep the pipeline re-renderable is to produce the file once, commit it, and keep the prompt as documentation. Validation rejects a generated `src` under `assets/`, because that directory is gitignored and a fresh clone would silently re-bill.

**Generated footage never depicts UI, text, or product behaviour.** This skill exists because diffusion models cannot render exact UI text or keep layouts stable. Generated atmosphere complements a real capture; generated *software* would make every factual claim in the video unverifiable.

`useFootageAudio: true` skips TTS and keeps the take's own audio, loudness-matched to the narration target so the cut does not jump in level.

## Layouts

Eleven layouts, each with a mandatory portrait behaviour. Vertical output re-renders at 1080×1920 and reflows — safe here because we own the CSS, unlike an app captured at a mobile viewport where re-rendering changes the story rather than shrinking it.

| `layout` | Cards | Portrait behaviour |
|---|---|---|
| `hero` | 0–1 | Title block on top, visual card beneath |
| `statement` | 0 | Unchanged — a centred single column already is the portrait arrangement |
| `bento-b` | 3 | Wide card full width, two detail cards stacked |
| `spotlight` | 3–4 | Single column, the dominant card first and taller |
| `tiled` | 3–4 | Two columns; with three cards the third spans both |
| `process-flow` | 3–5 | Hub on top, nodes stacked, connector rotates vertical |
| `lifecycle` | 3–4 | Vertical timeline, rail on the left |
| `comparison` | 2 | Stacked, old first and accent second so the flip reads downward |
| `stat-deepdive` | 2–4 + `stat` | Metric full width on top, details stacked |
| `cycle` | 3–5 | Vertical list of stages with a return connector from last back to first, so the loop claim survives |
| `diagram` | 0–2 + `diagram` | Diagram full width on top, cards beneath; the portrait diagram is its own 1080×1920 drawing |
| `custom` | — | **Unknown.** Requires `htmlPath` or `htmlUrl`, plus `portraitHtmlPath`/`portraitHtmlUrl` when vertical is declared |

**Declare `layout:` on every slide.** Omitting it inherits a default from the entry's SCR role, which means the arrangement is decided by a table nobody reads and never appears in a diff — so omission is a warning that names both the fallback and the recommendation for the content's shape. `references/slide-layouts.md` records the advisor's ordered rules and where layout advice may come from.

A layout fed content it has nowhere to put is an error, not a silent drop: a `stat` on `tiled`, a `pill` on `comparison`, or five cards in a two-card layout all fail validation.

`layout: custom` is the escape hatch and is excluded from the guarantees — arbitrary HTML has no known reflow, which is why vertical output demands an explicit portrait file. See *Custom slides* below.

## Content rules

1. **No bullets.** Lists become cards. If content will not fit in cards, it is two slides.
2. **Card text is one or two sentences.** Enforced, not advised — see overflow below.
3. **Every card title takes an `icon`.** Names come from the bundled Lucide set; an unknown name is a **hard error**, because a blank icon passes every automated check.
4. **Do not read the slide aloud.** The validator measures how much of the slide's text reappears in the narration and warns above 70%.

## `weight`: declare what matters most on the slide

The arrangement is read in ~100ms, before a word. The biggest element must be the most important one, or the viewer parses a hierarchy that lies and re-reads. Declaring `weight` on a card is how the author states importance directly, instead of letting it be guessed from text length.

`weight` takes `primary`, `secondary`, or `tertiary`. It is **optional and card-only**. The full model — the three levels, the area and type steps, and why text length was the wrong proxy — is in `references/slide-layouts.md`. The rules the validator enforces:

- **Exactly one `primary` per slide.** Two or more is an error: *"N cards declare weight: primary — salience is relative, so two primaries means neither is one; mark exactly one."* Salience is relative — you make one card dominant by keeping the others quiet.
- **The stat is implicitly primary.** A card declaring `primary` on a slide that has a `stat` is an error: *"a card declares weight: primary on a slide that has a stat — the stat is already the primary element, so weight is card-only here."*
- **An unknown weight is an error**, like an unknown icon: *"unknown weight ... (expected primary|secondary|tertiary)"* — so a typo cannot silently fall back to the text-length path.
- **Primary not in the dominant slot warns**, naming the reorder: *"card N declares weight: primary but is not in "<layout>"'s dominant slot (card M) — move it first ..."* It never fires on a layout with no dominant card slot.

A storyline that declares no `weight` on any card behaves exactly as before: dominance falls back to text length.

### Worked example — the case text length got wrong

A short headline number beside a long caveat. Text length would hand the dominant slot to the caveat — the longest, least important card. Declaring `weight` fixes it:

```yaml
- id: 05-outcome
  type: slide
  layout: spotlight
  title: Revenue recovered after the checkout rebuild   # the assertion
  cards:
    - { icon: trending-up, title: "$4.2M", weight: primary,   detail: recovered this quarter }   # shortest, most important
    - { icon: gauge,       title: "2.1s",  weight: secondary, detail: median checkout }
    - { icon: shield-check, title: "The number assumes the migration cohort holds its retention through Q3, which the current sample supports but does not yet prove.", weight: tertiary, detail: caveat }
```

`$4.2M` is the shortest card and the point of the slide; the caveat is the longest and least important. With `weight: primary` on `$4.2M`, the advisor puts it in `spotlight`'s dominant slot and the arrangement points at the number. Without the weights, the caveat's length would win the dominant slot and the eye would land on the hedge.

## `cycle: true`: mark a recurring loop

Shape is a claim: `lifecycle` draws a straight rail that asserts an end, and `process-flow` a hub that asserts a centre. A genuine loop (PDCA, a retention loop) has neither. Set `cycle: true` on an entry to reach the `cycle` layout, which draws a return connector from the last stage back to the first.

`cycle` is reachable **only** via this explicit marker — never inferred from card shape — so a loop of detailed stages does not get silently drawn as a `lifecycle` rail. Setting `cycle: true` while also naming `layout: lifecycle` or `layout: process-flow` warns, because the marker says the stages recur while the layout draws a terminus: *"cycle: true declares the stages recur, but layout "<layout>" draws a terminus — use layout "cycle" so the loop claim survives."*

## `diagram:` — when the shape is the claim

Use a diagram when the arrangement *is* the argument and no card layout can draw it: order in time between actors (`sequence`), work crossing owners (`swimlane`), containment (`tree`, `nested`), layers behind a boundary (`layers`), a gate or a join (`flowchart`), a two-axis position (`quadrant`), a quantity (`bar`, `line`, …). Diagrams come from the [diagram-design](https://github.com/cathrynlavery/diagram-design) skill — any of its 45 types — drawn at authoring time and frozen under `diagrams/`. **If a set of peer cards says the same thing, keep the cards.** The claim → shape bridge, with worked examples, is in `references/slide-layouts.md`.

```yaml
- id: 08-concurrency
  type: slide
  layout: diagram            # or the dominant slot of hero / spotlight / bento-b
  title: Two people can race for the same patient; only one wins
  # sequence: the claim is order in time between actors, which side-by-side cards cannot draw
  diagram:
    kind: sequence           # a diagram-design type: references/type-<kind>.md
    actors: [Specialist A, Admissions API, Specialist B]
    messages:
      - { from: Specialist A, to: Admissions API, label: CLAIM v3, weight: primary }
      - { from: Specialist B, to: Admissions API, label: CLAIM v3 }
      - { from: Admissions API, to: Specialist B, label: 409 CONFLICT, dashed: true }
    annotations:
      - { on: 409 CONFLICT, text: the second claim is refused, never merged }
```

The spec is free-form beyond `kind` — it is a brief for the drawing, in the vocabulary of that type's reference — but these rules are enforced:

- **`kind` is a diagram-design type.** Unknown is an error. `loop` and `timeline` are errors that redirect to the `cycle` and `lifecycle` layouts, because one claim gets one implementation.
- **The diagram is the slide's primary element.** It sits on `layout: diagram` (0–2 supporting cards) or fills the dominant slot of `hero` (0 cards), `spotlight` or `bento-b` (2 cards each). A card declaring `weight: primary` beside it, or a `stat`, is an error.
- **`weight` inside the diagram is the accent.** At most one element `primary` and one `secondary`; everything else stays ink and muted.
- **At most two `annotations`**, preferred over cards when the point is about part of the drawing: a callout on the element avoids the cross-reference a card beside it demands.
- **Chart kinds carry `data:`.** A chart drawn without numbers is an error.
- **Over ~9 nodes warns** — it is probably two diagrams. Split into an overview and a detail slide yourself; an automatic split would change the scene count.

### Drawing and freezing

```bash
node $S/scripts/compile.mjs --root=presentations --presentation=<slug>        # writes diagrams/profile.<theme>.md
node $S/scripts/deck.mjs --stamp-diagrams --root=presentations --presentation=<slug>
```

`--stamp-diagrams` prints a brief for every diagram not yet drawn: the type, the exact viewBox, the profile to draw against, and the files to write (`diagrams/<id>.svg`, plus `.vertical.svg` for a vertical output and `.step-N.svg` for reveal steps, each beside the `.html` diagram-design produced). Draw each with diagram-design, using the generated profile as the style guide and the brief's size, then run `--stamp-diagrams` again: it records the hash of what each drawing was made from and runs diagram-design's `self_check.py`. Commit `diagrams/`.

A diagram whose spec, brand or slot changes after it was stamped **fails the render** until it is redrawn and re-stamped (`--allow-stale-diagrams` for a one-off). Stamping refuses an SVG whose bytes did not change when its inputs did, so a stale drawing cannot be blessed by re-running the stamp.

### Reveal in video: one scene per step

```yaml
- id: 08a-claims
  type: slide
  layout: diagram
  in: [video]
  title: Two claims arrive within a second of each other
  diagram: { ref: 08-concurrency, step: 1 }
  narration: Two specialists claim the same patient within a second of each other.
- id: 08b-refusal
  type: slide
  layout: diagram
  in: [video]
  title: The second claim is refused rather than merged
  diagram: { ref: 08-concurrency, step: 2 }
  narration: The second claim is refused, so nobody silently overwrites the first.
```

Each step frame is complete when held. Mark the defining entry `in: [deck]` so the deck shows the final frame once. At most eight steps, and give the primary element its own step — the one where the narration names it. A step scene uses the same layout and card count as the entry it references, because it reuses that entry's drawings.

## Custom slides

`layout: custom` takes your own page, for total control: `htmlPath` (relative to the presentation) or `htmlUrl`. A URL is **never fetched at build time** — freeze it once, then commit `custom/`:

```bash
node $S/scripts/deck.mjs --freeze-custom --root=presentations --presentation=<slug>
```

That records the page and every resource it loads as `custom/<id>.har` with `custom/<id>.provenance.json` (URL, fetch time, sha256); builds replay it offline. Re-run to pick up a change. Credentials never go in the URL — save an authenticated page yourself and use `htmlPath`.

JavaScript runs. Tell the renderer when the page is finished:

```js
window.__slideReady = false;            // declare early
// ... fetches, fonts, layout ...
window.__slideReady = true;             // after the final paint
```

Without the declaration, the capture waits for network idle and fonts and reports *unverified readiness*. Pages render under `video.fixedTime` (when set), a seeded `Math.random`, and `prefers-reduced-motion: reduce`, so two renders of a commit are identical. Overflow and contrast are measured but only **warn** on a custom slide — the skill does not own its CSS.

## The title is an assertion, not a topic

The title states the slide's claim; the dominant element proves it. If the two disagree, the slide is broken — a labelled topic makes the body an exhibit with no claim to prove. Two independent traditions converge here (Alley's assertion-evidence studies measured 79% vs 69% comprehension, p<0.001, for a sentence assertion over a topic phrase; McKinsey's action titles are the same instinct). So the validator warns — a heuristic, never an invariant — when:

- **The title is topic-shaped:** ≤ 3 words and no sentence punctuation. *"title "..." is topic-shaped, not an assertion — state the takeaway as a sentence ..."* Suppressed for a section opener (a `hero` carrying a `pill`) and for `statement`, where a topic label is legitimate.
- **The title is too long to read as a headline:** more than 12 words or more than 70 characters. *"title is N words / M chars — an assertion that long stops reading as a headline; tighten it to one claim."* Suppressed nowhere.

## Overflow is a hard failure

`deck.mjs` measures the DOM after render and fails when any clipping container is exceeded, reporting **every** offender in one run:

```
Error: 2 slide element(s) overflow their container:
  05-outcome (landscape) card: +223px vertical, +0px horizontal — "Zero phone callsED, BMU and ward staff..."
  05-outcome (vertical)  card: +589px vertical, +0px horizontal — "Zero phone callsED, BMU and ward staff..."
```

Clipped text is the same class of defect as a wrong-content capture — it looks fine to every automated check and only a human eye catches it. `--allow-overflow` exists for a deliberate one-off.

Only genuine clipping containers are measured. A text box with a tight line-height always reports a few pixels of scroll height from descenders, and failing a build on that would teach everyone to pass `--allow-overflow` reflexively.

**Invariants fail, heuristics warn.** Overflow is an invariant: binary, measurable, objectively broken. Narration redundancy is a heuristic with legitimate exceptions — a stat slide *should* have the narration say the number — so it warns.

## Typography and icons

The deck embeds a bundled variable font (`@font-face`, base64), so glyphs and wrapping cannot change per machine. This is the opposite of the caption decision, which had to name a system font because ASS has one `Fontname`, no fallback list, and cannot embed. HTML can embed, so the constraint that forced Arial on captions does not apply here — and extrabold headings are central to the aesthetic.

If you later convert the exported HTML to PowerPoint, ship the font file with it. PowerPoint references fonts by name, so an un-installed font substitutes and shifts the layout.

## What the skill does not emit

No `.pptx`. Marp's PPTX export is rasterised by design, and `--pptx-editable` needs LibreOffice and produces one text box per visual line. A second, native PPTX renderer would drift from the one producing the video frames — and alignment by construction is the reason the deck is the source. Export `html` and convert externally.
