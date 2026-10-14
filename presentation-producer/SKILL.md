---
name: presentation-producer
description: Produce a standalone slide deck, or a narrated demo/marketing video together with the deck that carries the same argument, from a deterministic presentation-as-code pipeline. Authors an SCR narrative as storyline.yml, compiles it to a storyboard, renders bento-styled slides, and — for a video — synthesises narration, captures the UI with Playwright, burns aspect-aware subtitles and assembles a 16:9 output with FFmpeg or Remotion. Use when the user wants a presentation deck, a slide deck for a review or talk, a demo video, product walkthrough, feature announcement, tutorial, or a narrated slide deck from a running app or a repo.
argument-hint: slides|video [--root=presentations] [--presentation=<slug>] [--baseUrl=<url>] [--aspect=landscape|vertical|square] [--tts=auto|kokoro|gemini|openai|elevenlabs|edge|system] [--voice-gender=female|male] [--engine=ffmpeg|remotion] [--formats=png,pdf,html]
---

# Presentation Producer

Deterministic, re-renderable presentations. Diffusion video models cannot render exact UI text, keep layouts stable, or re-cut three seconds without redrawing everything; slide tools cannot diff a claim or rebuild a deck from source. This pipeline treats both as build artifacts: an authored narrative is the source, and the deck and the MP4 are outputs.

Resolve `<skill-root>` to the directory containing this file and substitute it in commands. Do not copy or modify this skill inside the project.

## Two modes

| | `slides` | `video` |
|---|---|---|
| Produces | PNG, PDF, HTML deck | MP4 (plus its companion deck) |
| Presenter text | `notes:` | `narration:`, which also fills the deck's notes strip |
| Entry types | `slide` | `slide`, `capture`, `footage` |
| Cost | free, offline, no app needed | TTS and capture; sometimes billable |
| Approval gate | none — nothing is spent | stops before synthesis and capture |
| Declared as | `presentation.mode: slides` | `presentation.mode: video` |

**Mode belongs to the presentation, not to the run.** The word on the command line is a guard: if it disagrees with `presentation.mode`, the run stops and says so. That is what catches "I meant the other deck".

## Dispatch

| Invocation | State | Behaviour |
|---|---|---|
| `/presentation-producer slides` \| `video` | exactly one presentation of that mode | run it |
| same | several of that mode | list them, ask which |
| same | none of that mode | offer to create one in that mode; naming it creates the slug |
| same | named presentation exists, wrong mode | stop, name the mismatch, suggest the right word |
| `/presentation-producer` | one or more exist | one prompt: all presentations grouped by mode, plus "create new" |
| `/presentation-producer` | none exist | ask the mode first, because nothing implies it, then create |
| any | no TTY | never prompt — fail printing the candidates and the exact command |

Ask for the mode only when it is genuinely unknown. Once `presentation.mode` exists, the mode is data the repo already holds, and asking first can dead-end on an empty set.

## Layout

A presentation is a **directory**; its name is its slug; everything it owns lives inside it. The installed runtime is the only shared thing.

```
presentations/                     work root (--root)
  .runtime/                        shared install; delete to uninstall
  eitri-harness/                   slug; --presentation=eitri-harness
    storyline.yml                  authored source        (committed)
    storyboard.json                generated lockfile     (committed)
    diagrams/ footage/ DESIGN.md   inputs                 (committed)
    ledger.json assets/ output/    regenerable            (ignored)
  q3-platform-review/
    storyline.yml  storyboard.json
```

Author-supplied relative paths resolve against the **presentation directory**, so `design: ../shared/DESIGN.md` is how two presentations deliberately share one brand — declared, and visible in a diff.

## Non-negotiables

1. **`storyline.yml` is source; `storyboard.json` is a generated lockfile; everything else is regenerable.** Both are committed — the storyboard because that is where cost lives (scene count, durations, capture actions), and cost belongs in a diff. The storyboard is not hand-edited; `compile.mjs` refuses to overwrite one that looks hand-authored.
2. **Never spend before the outline is approved.** Authoring is cheap; capture and TTS are slow and sometimes billable. Slides render *before* the gate, precisely so they can be fixed for free. A `slides` run has no gate because it has nothing to spend.
3. **The inelastic side dictates timing.** A still can be held for any duration, so audio wins. A real click-and-wait cannot be compressed, so speech is fitted to it.
4. **Never trim a visual mid-action.** Trailing silence is fine; a truncated interaction reads as a bug.
5. **Assert what should be on screen before recording.** A 404, a login screen or an empty table passes every downstream check. For slides the equivalent is overflow: clipped text passes every check too, so it fails the render.
6. **Invariants fail, heuristics warn.** Overflow, unknown icons and missing assertions are invariants. Narration that repeats the slide is a heuristic — it warns, because a check with legitimate exceptions that blocks a build teaches people to override it.
7. **Report degradation; never apply it silently.** A missing capability changes the output, so it must appear in the report.
8. **Generated footage never depicts UI, text or product behaviour.** Atmosphere only, frozen as a committed file with its prompt kept as provenance.

## Quick start

```bash
S=<skill-root>

# 1. hermetic, project-local install, once per root (only prerequisite: Node)
node $S/scripts/bootstrap.mjs --root=presentations --with-remotion
```

A standalone deck — no TTS, no running app, no cost:

```bash
mkdir -p presentations/q3-platform-review
cp $S/templates/storyline/slides.yml presentations/q3-platform-review/storyline.yml
node $S/scripts/generate.mjs slides --root=presentations --presentation=q3-platform-review
```

A video, with the deck that carries the same argument:

```bash
mkdir -p presentations/launch-demo
cp $S/templates/storyline/video.yml presentations/launch-demo/storyline.yml
node $S/scripts/generate.mjs video --root=presentations --presentation=launch-demo \
  --baseUrl=http://127.0.0.1:8080
```

With exactly one presentation in the root, `--presentation` is unnecessary. With several, omitting it fails with the list.

Stages are independently runnable and resumable: `compile.mjs`, `deck.mjs`, `synthesize.mjs`, `capture.mjs`, `compose.mjs`, `verify.mjs`. All take `--root` and `--presentation`. Re-running after an edit rebuilds only what changed.

Common run-time choices, none of which edit the source:

```bash
--aspect=landscape           # video: render 16:9 only, instead of every declared output
--voice-gender=male          # male narrator on whichever provider runs (default: female)
--formats=png,pdf,html       # deck artifacts to emit
--allow-overflow             # render slides despite clipped text (deliberate one-off)
--allow-low-contrast         # render despite brand colours below their contrast threshold
--allow-stale-diagrams       # render despite diagrams whose spec, brand or slot moved since drawing
--profile=room               # measure diagram text against a venue's reading floor
```

Occasional modes, deliberately not part of any build:

```bash
# Read a running app's computed CSS custom properties into a brand file. Writes
# DESIGN.md and DESIGN.dark.md into the presentation, then stops — review, commit,
# and point presentation.design at it. Extract once; later builds stay offline.
node $S/scripts/deck.mjs --extract-brand=http://127.0.0.1:8080 --root=presentations --presentation=launch-demo

# Diagrams: print the drawing brief for undrawn diagrams, then (after drawing
# with diagram-design) record what each was drawn from. Authoring time only.
node $S/scripts/deck.mjs --stamp-diagrams --root=presentations --presentation=launch-demo

# Custom slides from a URL: fetch once into custom/ (a HAR with provenance).
# Builds replay it offline and never fetch.
node $S/scripts/deck.mjs --freeze-custom --root=presentations --presentation=launch-demo

# Opt into the modern-web-guidance corpus (~37MB, Apache-2.0, needs Node >=20).
# Authoring aid only: it informs HOW a layout is implemented in CSS, never which
# layout suits the content. Telemetry is disabled on every invocation.
node $S/scripts/bootstrap.mjs --root=presentations --with-guidance
```

## Workflow

### 1. Probe, then author within the environment's limits

```bash
node $S/scripts/bootstrap.mjs --root=presentations --skip-install   # capability report
```

Only author scene types the report allows. No VHS means terminal content becomes a styled slide, not a broken scene. A `slides` presentation needs only Playwright, Chromium and the deck layer.

### 2. Gather material, in this precedence order

1. A user-supplied plan or brief — if one exists, it *is* the brief; do not re-derive it.
2. The repo: `README`, `docs/`, `specs/`, route files, package manifests. Also look for an existing `DESIGN.md` anywhere in the repository; ask the user which to use when there are several, and pin the chosen path as `presentation.design`. If none exists and a brand is wanted, create one inside the presentation.
3. The live app (video only): visit each route, take an accessibility snapshot, enumerate real affordances.
4. Ask the user only what cannot be inferred: audience, the three claims that matter, the call to action, tone, target duration or slot length.

Pick a narrative archetype from `references/archetypes.md` rather than improvising structure. When the deck is the deliverable, use archetype 7 (SCR).

### 3. Author the storyline

Full schema and worked examples: `references/storyline-authoring.md`. Rules that matter most:

- **One action per scene** (video). Scene-level alignment then behaves like choreography — the click lands while the narrator describes it.
- **Entries are typed.** `slide` for claims, `capture` for the app doing the thing, `footage` for anything pre-made or generated. In a video, alternate them: the slide makes the claim, the capture is the evidence. A `slides` presentation has slides only.
- **`in: [deck]` / `in: [video]`** target one medium within a video presentation. This is how the deck opens answer-first while the video opens on the Situation, from a single ordering. In a slides presentation the default is `[deck]` and naming `video` is an error.
- **No bullets.** Content becomes cards in one of eleven layouts. Card text is one or two sentences, and this is enforced by the overflow check.
- **Always write `assert.visible` and `assert.notVisible`** on captures. This is the only check that catches a wrong-content capture.
- **When the shape is the claim, draw it.** A race between actors, a handoff across owners, a tree, a boundary between layers: declare `diagram:` with a diagram-design `kind`, draw it at authoring time, and stamp it (`deck.mjs --stamp-diagrams`). If peer cards say the same thing, keep the cards. Bridge and worked examples: `references/slide-layouts.md`.
- **`layout: custom` is total freedom** — your own HTML from a path, or a URL frozen once with `deck.mjs --freeze-custom`. JavaScript runs; set `window.__slideReady` when the page is finished.
- **Never put credentials in the source.** Validation rejects them. Use `storageState` or `setupScript`.

### 4. Run

A `slides` run renders, verifies geometry, and prints slide count, sections, layouts and where the artifacts landed. There is no gate: the run is free and idempotent, the PNGs are the review surface, and the one file a human may have edited is protected by its generated-file marker.

A `video` run compiles, renders every slide, then prints scene list, per-scene duration, total runtime, engine choice and reasoning, provider, and estimated cost — then waits. Look at the rendered PNGs before approving. Use `--yes` only for a re-run you have already approved.

### 5. Read the report

Every run reports what degraded and why. A `FAIL` in verification means do not ship.

## Decisions worth knowing before you change anything

| Area | Decision | Why |
|---|---|---|
| Modes | `presentation.mode` declares `slides` or `video`; the CLI word must agree | A presentation is a kind of thing, not a run configuration. Making the word a guard turns "wrong deck selected" into an error instead of a wasted render. |
| Isolation | One directory per presentation, holding its sources *and* its artifacts; only `.runtime/` is shared at the root | Rename or delete moves or removes a presentation whole, with nothing orphaned. Sharing the install avoids a second Chromium, ffmpeg and the Kokoro model per deck. |
| Slug | The directory name, never a field inside the YAML | `runtimePaths()` is called by the bootstrap — code that runs in order to *create* `.runtime/`, where the YAML parser lives. A YAML-sourced slug would need the install it bootstraps. |
| Selection | A bounded single-level listing of `<root>/*/storyline.yml`, sorted; `--presentation` overrides; slugs differing only by case are a hard error | This is not the recursive walk the brand-path decision forbids: no recursion, no ignore semantics, no platform-dependent ordering. With several candidates and no flag, it reports the list rather than picking one. |
| Root name | `presentations/`, not `presentation-producer/` | Directories are named for contents, not tools. A tool-named directory reads as scratch space, so someone eventually gitignores it wholesale — taking `storyline.yml` and `storyboard.json`, the two files that must be committed, with it. |
| Cache isolation | One ledger per presentation, inside it | `audioCacheKey` digests narration and voice but **not** the scene id, so two decks sharing a sentence collide. A shared ledger would make one presentation's committed storyboard reference another's audio file. Namespacing scene ids would not fix it. |
| Source blocks | `presentation:` (mode, title, archetype, engine, theme, formats, orientations, design) and `video:` (aspect, outputs, voice, baseUrl, fixedTime) | The old single `deck:` block held video aspect ratios and TTS voices, so `deck.mode: video` would have read as nonsense and a deck carried four keys that silently did nothing. Splitting makes "a slides presentation has a `video:` block" one self-explaining error. |
| Legacy `deck:` | Detected to produce a migration error, never translated | A compatibility layer protects consumers you cannot reach; every affected storyline is in this repo and migrated by the same change. A permanent fallback could never be proven unused, so it could never be deleted. |
| Presenter text | `notes:` in a slides presentation, `narration:` in a video one; a video deck's notes strip still reads the narration | Spoken and read registers differ. Reusing `narration` would also aim the overlap heuristic at notes, where restating the slide is the entire job — a warning that fires on every slide teaches people to ignore warnings. |
| Gates across modes | Identical. Overflow, contrast, icon coverage and card dominance do not fork; only the printed summary does | Those gates are properties of a 1920×1080 canvas, not of a medium. Forking them would create two definitions of "valid slide", and the weaker one would win. |
| Slides summary | Slide count, sections, layouts and artifact paths; no runtime, cost or caption lines | Not printing facts that do not exist is not a fork of any rule. |
| Orientation | `presentation.orientations` is the deck's canvas set; a slide may declare its own; the render passes are the union, and a partial pass warns | Marp's size lives in its theme, PDFs are written per orientation, PowerPoint and Slides have one slide size per deck, and one MP4 has one resolution. So what varies per slide is *which canvases it renders onto*, not a mixed-size document. A video presentation derives this from `video.outputs`, because a scene present in one cut and absent from another would desynchronise two renders of one argument. |
| Slides verification | Artifacts exist, PNG dimensions read from the IHDR header match the canvas, expected artifact count; a tiny PDF warns | Render-time gates measure content in a browser and cannot see what landed on disk. A wrong-viewport capture and a zero-byte PDF pass every other check and fail in front of an audience. The header is read directly because the test suite must run with no install. |
| Source of truth | `storyline.yml` authored, `storyboard.json` generated and committed | One authored file makes the argument reviewable in one read; a committed lockfile puts compiled cost in the diff. Cache keys are content-addressed, not positional, so regenerating reuses the cache and reordering rebuilds nothing. |
| Slide renderer | Structured content + a fixed layout id; `engine: html \| marp` chosen per deck, both sharing one `slideCss()` generator and one Chromium | A design system is only real if the authoring surface cannot express violations. One renderer per deck means deck and video are pixel-identical by construction rather than by inspection. marp is co-equal rather than secondary: it emits real Markdown (one blockquote per card), and the overflow and contrast gates are re-pointed at its element tree from a single mapping table, because a gate that found nothing and passed would read as proof. |
| PPTX | Not emitted; export HTML and convert externally | Marp's PPTX is rasterised by design and `--pptx-editable` needs LibreOffice. A second native renderer would drift from the one producing the video frames. |
| Deck font | Bundled variable font, `@font-face`-embedded | HTML can embed, so glyphs and wrapping cannot vary per machine — and extrabold headings are central to the aesthetic. The opposite of the caption decision, which is forced to name a system font. |
| Icons | Bundled Lucide (ISC), unknown name is a hard error | Coverage matters against unpredictable content, and a blank icon passes every automated check. |
| Slide overflow | Hard fail, batch-reported, measured on clipping containers only | Clipped text is invisible to every other check. Measuring text boxes too would fire on descenders and teach everyone to pass `--allow-overflow`. |
| Slide vertical | Always `native` reflow, one declared portrait rule per layout | We own the slide CSS, so reflow preserves the argument. Cropping a bento grid cuts cards off; letterboxing wastes 60% of the frame. |
| Slide timing | Rendered duration-independently; the hold happens in capture | Lets a deck build with zero TTS, and keeps slides the elastic side that absorbs narration length. |
| Slide/capture overlay | Interleave by default, `chapter` free, `pip` escalates to Remotion and reports it | Declared need, derived engine, reported degradation — consistent with every other capability. Compositing by default would impose the Remotion licence on the common path. |
| Generated footage | Generate once, freeze as a committed file, keep the prompt as provenance | A generative API cannot be pinned by hash, so the only way to stay re-renderable is to make its output an input. |
| Capture | `page.screencast` with `showActions`/`showChapter`/`showOverlay` | First-party cursor, action labels and chapter cards. Do **not** hand-roll cursor SVGs or highlight CSS. |
| Frame rate | Frames collected via `onFrame`, resampled to exact CFR | `recordVideo` caps ~25fps and is variable-rate; Remotion rejects VFR outright. |
| Resolution | 1080-class: 1920×1080 and 1080×1920 | Screencast cannot deliver 4K60; claiming otherwise would be false. |
| Engine | Derived from required features, not preference | FFmpeg for single-aspect; Remotion when reframing, kinetic captions or PIP are needed. |
| Outputs | `video.outputs` declares what a video *can* produce; landscape only by default; `--aspect` narrows one run | Each extra aspect is a full second render plus its own subtitle burn, so rendering an aspect nobody asked for doubles compose time. The filter never rewrites the source. |
| Subtitles | Burned in as **ASS with an explicit `PlayResX`/`PlayResY`**, placement derived per aspect | SRT has no resolution, so ffmpeg converts it in a 384×288 script space and multiplies every pixel value by `frameHeight/288` — 3.75× on 1080p, and off-frame entirely on 1080×1920. Never reintroduce `force_style` over an SRT. |
| Caption font | `Arial` | ASS has one `Fontname` and no fallback list. Arial exists on Windows and macOS and maps to metric-compatible Liberation Sans on Linux, so wrapping does not change per machine. |
| Caption box | White text on an opaque `#0F172A` box | Outline-only captions disappear over a light dashboard — or a light bento slide. The box colour is also the deck's primary, so they agree. |
| TTS default | Kokoro (local, Apache-2.0) | Offline, deterministic, commercially unambiguous. `edge-tts` is gated: its maintainer says personal use only. |
| Narrator gender | `--voice-gender` / `video.voice.gender`, resolved to a voice id once per run | One resolution point means the cache key and every provider adapter agree. |
| YAML parsing | `compile.mjs` requires the runtime; `validateManifest` stays dependency-free | Node ships no YAML parser. The install-free property was earned for validating a storyboard cheaply, and that is preserved exactly where it matters — including path resolution, which is why the slug comes from a directory name. |
| IDE capture | Out of scope as an engine; record by hand into `manual_footage` | `_electron` + `screencast` is verified to work on VS Code and Antigravity, but an IDE screenshot is a function of the whole environment, so reproducibility needs a seeded profile. Documented in `capture-terminal-slides.md` so it is not re-litigated. |
| Install | Project-local `.runtime/` at the root, shared by every presentation | Deleting the directory uninstalls everything. Only Node is required. One profile, not one per mode: a slides-only install would save a few hundred MB and cost a second environment to reason about. |
| Ignore rules | Merged into the nearest existing project `.gitignore`, one glob level deep | A second `.gitignore` inside the work root is a file nobody expects. `*/footage/` is deliberately **not** ignored. |
| Cache | Content-addressed per scene, slide content included, one ledger per presentation | Editing one sentence or one card costs one scene. Unknown app version forces re-capture rather than risking a stale clip. |
| Brand source | `DESIGN.md` frontmatter in the design.md format is the authored brand IR; the CSS custom properties stay the render contract; `references/design-token.md` is the skill-owned mapping between them | Three layers keep concerns apart: the IR is portable, the variables are what the deck renders, and the mapping is not project-overridable — a project that could re-point `--accent-1` at a failing colour or bind ink to the button colour is a design system the authoring surface can violate. |
| Brand location | Declared in `storyline.yml` as `presentation.design`; the agent finds the file while reading repo material and pins the path; never a runtime filesystem walk | A declared path is visible in a diff and makes CI deterministic. A walk needs ignore lists, depth caps and cross-platform ordering code, all of which go wrong silently. `../shared/DESIGN.md` is how presentations share one brand. |
| Light and dark | Two conformant files (`presentation.design`, `presentation.designDark`); a missing dark file warns and renders on the dark built-ins | design.md has no dual-mode concept, and extending it would forfeit portability. Failing a build over a missing optional variant is the trap type-bending exists to avoid. |
| Contrast | An invariant: below threshold the render fails, batch-reported like overflow, escaped with `--allow-low-contrast` | Unreadable accent text passes overflow, passes the icon check and passes verification, and fails only in front of an audience. Thresholds are per-element and declared in `design-token.md`; ratios are measured from computed styles in the browser, so every colour format the format allows works without a colour parser. Brand colours are never auto-corrected — a nudged brand is not the brand. |
| Brand type | Bends rather than fails: one clamped heading-dominance multiplier from the brand's h1:body ratio, applied to heading levels only | Body copy keeps canvas sizes because a brand's 16px body is authored for a scrolling page, not a 1920×1080 canvas. If type failed too, adopting a brand would make a valid deck unbuildable by someone who cannot edit the corporate brand file or rewrite approved copy. |
| Brand font | Fontsource by package name derived from the family, then a declared `presentation.fontFile` (`.woff2`, embedded identically), then the machine's copy with bundled Inter behind it | Embedding is what stops glyphs and wrapping varying per machine, and Fontsource ships only OFL/Apache/MIT families, so the licence rule holds by construction. Brand fonts are frequently proprietary and can never appear on npm, which is why the explicit path exists. Every outcome is reported by provenance — `fontsource`, `file`, `local`, `fallback-inter` — and provenance joins the slide cache key, because installing the package later changes pixels without changing an authored byte. |
| Layout choice | Declared in `storyline.yml`; omitting `layout:` is a warning carrying the recommendation | An omitted layout inherits an SCR role default, so the arrangement is decided by a table nobody reads and never appears in a diff. The advisor's structural rules mirror the `slots` table so its advice can never be rejected by the validator. Its shape rules place the heaviest card in the biggest slot — but that is now the FALLBACK: declared `weight` wins, and text length ranks only when no card declares weight. The fallback is still risk reduction, not taste — overflow is a hard failure — but importance and overflow risk are different things, so a stated weight overrides it. |
| Information weight | An author declares `weight: primary\|secondary\|tertiary` on a card; ordinal, optional, card-only, exactly one primary; the advisor consumes it before text length. In the CSS, a card is stretched only where the stretch IS the dominance signal — peer layouts (`dominant: null`) hug their content, while ratio-based layouts keep their tracks | Text length is a proxy for overflow risk, not importance — a "$4.2M" headline is the shortest card and usually the most important, and ranking by length routes the eye to the longest caveat. The same mistake has a visual form: a row that fills the canvas makes a light card into a tall slab, and a tall slab READS as heavy, so visual weight stops tracking information weight. Measured on an 84-slide deck, the three no-dominant-slot layouts sat at 0.38-0.46 fill (~60% of every card empty) while every ratio-based layout was fine — because where no card outranks another, the grid allocates space equally AND maximally. Declaring rank (never pixels or colour) lets the arrangement point at what matters. The stat slot is implicitly primary, so weight stays off it. Two primaries is an error because salience is relative. |
| Layout count | Ten layouts. `bento-a` was retired into `spotlight`; the advisor no longer forks on card count, and the four track ratios stay constants | `bento-a` was `1fr 1fr` with the lead spanning both rows — the only layout with a dominant slot and no track ratio, so a card marked `weight: primary` could not be seen to dominate. That is `spotlight`'s arrangement with the dominance constant set to 1.0, and it was also both the role-less default and the advisor's answer for every three-card slide (`n === 4 ? spotlight : bento-a`) even though `spotlight` declares `cards: [3, 4]` — so three-card content was routed to the weakest dominance layout available. Three-card dominance now reaches `spotlight`'s 1.6fr and even-weight sets reach `tiled`, whose narrower columns sit closer to the ~45-character measure than two wide columns did. The ratios (1.5fr, 1.6fr, 1.1fr, 1.35fr) are deliberately NOT author-tunable: no deck has shown one is wrong, and the four peer layouts must never gain one at all, because `comparison`'s side-by-side asserts a shared scale and `tiled`/`cycle` assert peers — an unequal track there is a false claim, not a style. |
| Assertion titles | A heuristic (warn): topic-shaped titles (≤3 words, no sentence punctuation) and over-long titles (>12 words or >70 chars) warn | The title states the claim and the dominant element proves it; a topic label leaves the body with nothing to prove (Alley 79% vs 69%, p<0.001). A heuristic, not an invariant — the topic-shape warning is suppressed for a `hero`+`pill` opener and for `statement`, where a topic label is legitimate; the over-long warning is suppressed nowhere. |
| Type-size floors | A floor is DERIVED from a declared viewing profile (`phone`/`screen`/`room`/`hall`), never imported as a constant; `legibilityFloorReport` warns, and is run on demand rather than wired into the validator | A pixel has no angular size until a distance is stated, so "body must be 40px" is the same mistake as "use 24pt". Derived from the 0.2-degree critical print size, the `screen` floor is 24px and the shipped `card-text` is 24px — the scale is calibrated for monitor viewing, and a test asserts the agreement. That makes the check trustworthy: a default deck clears every floor, while the same deck at `profile: room` correctly reports that monitor-sized type is unreadable from the back of a large room. It warns rather than fails for the same reason brand type BENDS (see "Brand type"). It is on demand because the profile is a fact about the venue, which the source file does not know. |
| Shape is a claim | `cycle` is a separate layout reached only via `cycle: true`, distinct from `lifecycle` | A rail asserts an end, a hub asserts a centre, a loop asserts recurrence — the arrangement is a statement about the content, so a loop drawn on a straight rail is a false one. `cycle` is inferred from no card shape (a loop is a claim card shape cannot reveal), so it is gated on the explicit marker; setting `cycle: true` on a terminus layout warns. |
| Diagrams | Any of diagram-design's 45 types through one `diagram:` slot, drawn at authoring time by that skill and frozen under `diagrams/`; no native diagram renderers | The skill already owns the type grammars, connector rules and taste gate, and is installable directly. Re-implementing even a few types natively is a graph-layout engine with edge-routing bugs no gate here can see — so it waits until a deck proves a frozen drawing is insufficient. Freezing keeps the build offline, deterministic and Node-only, the same answer generated footage and brand extraction already gave. Embedding reuses the icon path's SVG data URI, so marp keeps parity. |
| Diagram staleness | An invariant: a drawing whose spec, generated profile or slot changed since it was stamped fails the render, batch-reported, escaped with `--allow-stale-diagrams`. The diagram-design version is recorded, not hashed | A stale drawing passes overflow, contrast and geometry and contradicts its own source, which is the wrong-content-capture failure in slide form. Hashing the upstream version would make every skill update invalidate every deck. Stamping refuses an unchanged SVG whose inputs moved, so a stale drawing cannot be blessed by re-running the stamp. |
| Diagram brand | `compile.mjs` writes `diagrams/profile.<theme>.md`, a complete diagram-design style guide from the deck's resolved tokens AND type scale; dark only when `designDark` exists | One brand source. diagram-design's own URL onboarding would be a second brand that drifts. The type scale is the point: diagram-design's presentation ramp sets 16px node names against a 24px `screen` floor, so handing it `card-text` is what clears the floor by construction. |
| Diagram weight | The diagram is the primary element, like the stat; `weight: primary` inside it is what takes the accent (one primary, one secondary); at most two annotations; at most two supporting cards | diagram-design's "accent on 1-2 elements" and the weight model are one rule in two vocabularies. A card beside a drawing asks the eye to cross-reference; a callout on the element does not. |
| Diagram reveal | One scene per step (`diagram: { ref, step }`, max 8), each a complete frame; the deck shows the final frame | Temporal contiguity is the largest effect in the evidence, and scene-level alignment already lands each frame on its sentence — with no Remotion and no word-level timing. A reader controls their own dwell, so a deck build would add slides without adding comprehension. |
| Diagram legibility | Measured, not modelled: each SVG text run's rendered size is compared with the viewing profile's floor and warns below it; over ~9 nodes warns with split advice | No capacity table can know how a particular drawing was laid out. Splitting is never automatic, because it changes the scene count, which is cost. |
| Custom slides | `htmlPath`, or `htmlUrl` frozen once as a HAR by `--freeze-custom` and replayed offline; JavaScript runs under a ready signal (`window.__slideReady`), a fixed clock, seeded randomness and reduced motion; overflow and contrast warn rather than fail | Total customisation is the job of the escape hatch, so scripts are allowed. A live URL would make one commit render differently tomorrow; a HAR from Playwright's own recorder freezes the page and its resources with no hand-rolled inliner. The ready signal is non-negotiable 5 for pages with scripts. A page the skill does not own may clip on purpose, so its invariants become heuristics. |
| Layout research | At authoring time only: `modern-web-guidance` for CSS and type quality, online references for arrangement inspiration | A build must stay offline, deterministic and free. `modern-web-guidance` is a web-platform feature corpus, so it informs *how* a layout is implemented and never *which* layout suits the content. Astryx and other design systems are read for inspiration and never made dependencies — React 19 plus a StyleX compiler, another `npx` surface on Windows, and an unverified licence for vendoring token values. |

## Progressive disclosure

| Read this | When |
|---|---|
| `references/storyline-authoring.md` | Authoring `storyline.yml`, layouts, SCR beats, overflow, footage |
| `references/migration.md` | Adopting diagrams and URL-sourced custom slides (Part C); moving a pre-rename presentation (Part A) |
| `references/storyboard-schema.md` | Inspecting or hand-authoring the compiled storyboard |
| `references/capture-playwright.md` | Web capture, auth, determinism, assertions, ROI |
| `references/composition.md` | Engine selection, aspect ratios, subtitle placement |
| `references/archetypes.md` | Choosing a narrative structure; SCR is archetype 7 |
| `references/capture-terminal-slides.md` | Terminal (VHS), slide renderers, the marp engine, footage, Electron IDEs |
| `references/slide-layouts.md` | Choosing a layout or a diagram: the catalogue, the claim → shape bridge, the advisor's rules, and where layout advice may and may not come from |
| `references/design-token.md` | Wiring a brand `DESIGN.md` into the deck: the token mapping, contrast thresholds, type dominance, and the diagram profile |
| `references/legibility.md` | The hard floors under every layout: type-size floors, contrast, line-measure, colour-blind-safe palettes, caption keep-out bands |
| `references/troubleshooting.md` | Anything failing |

## Verification

```bash
cd <skill-root>/scripts && node --test          # every tier-1 test file, discovered automatically
```

**442 tests, no install required** — they run with system Node alone. Run them after any change to `scripts/`. Per file: `core` 62, `subtitles` 43, `support` 39, `deck` 102, `diagram` 25, `design-md` 38, `propagation` 13, `fontsource` 24, `extract-brand` 10, `marp` 22, `pipeline` 36, `modes` 28. The byte-identity guard in `lib/deck.test.mjs` proves the brand and marp seams stay inert until used; do not disable it.

Four things unit tests cannot prove, because all depend on a renderer:

**Slide layout** — render a deck and look at the PNGs. Assert *geometry*, never pixels: a baseline image fails for antialiasing and font hinting, gets re-baselined reflexively, and stops meaning anything.

```bash
mkdir -p presentations/fixture-deck
cp $S/templates/storyline/slides.yml presentations/fixture-deck/storyline.yml
node $S/scripts/generate.mjs slides --root=presentations --presentation=fixture-deck
open presentations/fixture-deck/assets/slides/
```

**Caption geometry** (video) — burn one cue over a solid frame and look at it:

```bash
FF=presentations/.runtime/node_modules/ffmpeg-static/ffmpeg
$FF -f lavfi -i color=0xF8FAFC:s=1920x1080:d=0.2 \
    -vf "subtitles='presentations/launch-demo/assets/processed/01-intro.landscape.ass'" \
    -frames:v 1 -update 1 /tmp/caption-check.png
```

**Marp-versus-HTML parity** — the emission, the selector aliasing and the grid rules are unit-tested, but what marp-cli does with them is not. Render the same deck under both engines and compare *geometry*: element boxes measured in our Chromium, never a pixel baseline.

```bash
node $S/scripts/compile.mjs --root=presentations --presentation=fixture-deck --engine=marp
node $S/scripts/deck.mjs    --root=presentations --presentation=fixture-deck --formats=png
open presentations/fixture-deck/deck.md          # the editable artefact the engine exists for
```

**Diagram embedding and the text floor** — a frozen SVG's rendered text size depends on the scale it is embedded at, so it holds only under a renderer. Render a deck with a stamped diagram and read the per-diagram lines in the summary (`diagram <id>: <kind> -> ok, geometry ok`) and any floor warning.

**Contrast measurement** — measured in the browser from computed styles, not from the token pairs, so it holds only under a renderer. Render a branded deck and read the report: any element below its per-element threshold is listed, and the render fails unless `--allow-low-contrast` is passed.

End-to-end smoke against the bundled web fixture (needs the bootstrap):

```bash
mkdir -p presentations/smoke && cp -r $S/templates/fixture/* presentations/smoke/
npx --yes serve presentations/smoke -l 4173 &      # or any static server
node $S/scripts/generate.mjs video --root=presentations --presentation=smoke --baseUrl=http://127.0.0.1:4173 --yes
```

## Licence notices

- **Remotion** is free for individuals and organisations up to 3 people. Larger companies need a Remotion Company Licence. The FFmpeg path has no such condition, which is why it stays the default whenever it is sufficient.
- **Background music is never bundled.** Default is silent; supply your own and check your rights — platforms fingerprint audio.
- **Bundle only OFL/Apache/MIT/ISC-licensed fonts and icons.** The deck installs Inter (OFL) and Lucide (ISC) as pinned dependencies.
- **`edge-tts`** is an unofficial reverse-engineered Microsoft endpoint, gated behind `--acknowledge-edge-tts`.
- **`claude` and `kiro-cli` cannot synthesise speech** — no speech endpoint exists. `gemini` and `codex` imply API keys that this skill can use.
- **Generative video APIs are the user's contract, not this skill's.** Check the provider's terms for commercial use and output ownership before shipping generated footage.
