# Terminal and slide scenes

## Terminal capture (VHS) — optional by design

VHS produces the best headless terminal recordings available, but it is **not** self-contained:

> VHS requires `ttyd` and `ffmpeg` to be installed and available on your PATH.

That has a platform consequence worth stating plainly: on Linux and Windows both binaries can be downloaded into `.runtime/bin`, but **on macOS `ttyd` has no usable upstream binary** — Homebrew is the only route. So terminal capture cannot be made hermetic on macOS.

```bash
# macOS
brew install charmbracelet/tap/vhs ttyd
```

The capability probe reports which piece is missing and why. Without all three, `vhs_terminal` scenes **degrade to styled code slides** rather than failing. The command text still appears, in a monospaced slide with syntax colouring; what is lost is live typing and streaming output.

### Tape generation

`actionSpec` is compiled to a `.tape`:

```jsonc
{
  "theme": "catppuccin-mocha",
  "fontSize": 24,
  "commands": [
    { "type": "type", "arg": "mvn test -Dtest=BedAllocationTest", "delayMs": 80 },
    { "type": "enter" },
    { "type": "sleep", "arg": "6s" },
    { "type": "type", "arg": "echo 'All 14 tests passing.'", "delayMs": 60 },
    { "type": "enter" },
    { "type": "sleep", "arg": "2s" }
  ]
}
```

**Fonts:** do not hardcode a font you have not bundled. A tape asking for JetBrains Mono on a machine without it silently falls back and the output looks wrong. Bundle the file (JetBrains Mono is Apache-2.0) or accept the VHS default.

**Timing:** terminal scenes are inelastic — a test suite takes as long as it takes — so narration is fitted to them, not the reverse. Budget `sleep` generously; an under-slept tape truncates the output you are narrating.

## Slides

Two renderers, chosen once per storyline with `engine:` in `storyline.yml`. You never hand-write either — both are compile targets from the structured source, which is what keeps the standalone deck and the video frames pixel-identical. Full authoring guide: `references/storyline-authoring.md`.

### `html_slides` — the bento renderer (default)

Structured content plus a layout id, rendered by the bundled Chromium into PNG (for the video), PDF and self-contained HTML (for presenting). Eight card-based layouts, a light and a dark token set, an embedded variable font, and a bundled Lucide icon set.

```jsonc
{
  "layout": "stat-deepdive",
  "theme": "light",
  "title": "How an admission is agreed today",
  "stat": { "value": "3", "unit": "doctors", "label": "must agree before a bed is released" },
  "cards": [{ "icon": "stethoscope", "title": "ED attending", "text": "Sets the acuity tier.", "detail": "Step one" }]
}
```

Rendered by `deck.mjs`, which runs **before the outline gate**: slide rendering is cheap and non-billable, and looking at the pixels is the only way to catch a clipped card before paying for TTS. Overflow is a hard failure, reported in batch.

### `marp_slides` — the Markdown engine

Set `presentation.engine: marp` in `storyline.yml`. It is a **co-equal renderer**, not a
secondary path: it shares one CSS generator and one browser binary with the HTML
engine, and it holds the same overflow and contrast gates. Pick it when you want an
editable Markdown file as an artefact; pick `html` (the default) otherwise.

**What it writes.** `deck.md` in the work directory, plus
`assets/slides/deck-theme.css`. One file per orientation (`deck.vertical.md`).

**The emitted Markdown is Markdown.** No `<div>` anywhere, because the editability
is the only thing this engine offers over the HTML path:

```md
<!-- _class: spotlight -->

###### SECTION LABEL
# Deterministic by construction

> ![](data:image/svg+xml;base64,...)
> ### Locked
> The storyboard is a lockfile.
> ###### STEP ONE

> ### Cached
> Content-addressed keys.
```

The grammar is fixed and small: `_class` selects the layout, an `h6` directly under
the section is the pill, `h1` is the title, a bare paragraph is the body, and **one
blockquote is one card** (`h3` title, paragraph text, `h6` detail). A blockquote is
the only Markdown construct that yields a single container element per item, which
is what lets the theme place cards on a grid without HTML wrappers. Icons ride as
inline `data:` URIs so `--allow-local-files`, which marp-cli flags as NOT SECURE,
stays avoidable.

**One CSS generator.** The theme is `slideCss()`'s output with each marp element
selector added alongside the class it stands in for (`.card{` becomes
`section blockquote,.card{`), from a single table in `scripts/lib/marp.mjs`, plus one
`section.<layout>` grid rule per layout. The grid rules are genuinely new CSS
because Markdown yields a flat `<section>` where the HTML path nests
`.slide > .slide-body > .grid` — everything else is shared, so a change to a card's
padding reaches both engines at once.

**The gates hold.** The marp DOM carries neither `data-measure` attributes nor the
class names, and CSS cannot add either, so the overflow selector list and the
contrast rule selectors are both widened from that same table. A gate that found
nothing and passed would be worse than no gate, because it would read as proof.

**Determinism flags, all three mandatory.** `--no-config-file` (marp otherwise reads
`marp.config.js` from the working directory, so a stray config anywhere in the repo
would silently change the render), `--browser chrome` alongside `--browser-path`
(the default `auto` could pick Firefox, whose rendering is incompatible), and
`--template bare` (the default `bespoke` wraps output in a presentation shell with
an on-screen controller, which is wrong for measurement and capture). marp-cli is
invoked through `process.execPath` with an args array and no shell.

**Hand edits are detected, not clobbered.** The `.md` carries a generated-file
marker and the storyboard's own source checksum, mirroring `storyboard.json`'s trust
model. A file with no marker is treated as hand-authored and never overwritten; a
file whose checksum still matches but whose bytes differ has been edited and is
rendered as-is with a warning. **Accepted cost:** an edit made after generation is
unvalidated — add a fourth card heading to a three-card layout and it will overflow,
because the birth-time conformance guarantee only covers what the emitter produced.

**`layout: custom` has no marp emission.** Arbitrary author HTML is the HTML
engine's escape hatch; routing it through marp would need `--allow-local-files`.

**What is renderer-only.** Marp-versus-HTML parity cannot be proved by the tier-1
suite. When it is checked, it is checked on **geometry** — element boxes measured in
our Chromium — and never on a pixel baseline: a baseline image fails for
antialiasing and font hinting, gets re-baselined reflexively, and stops meaning
anything. The unit tests cover the emission, the selector aliasing, the grid rules
and the hand-edit contract; they cannot cover what marp-cli does with them.

**Deferred opportunity.** marp-cli exports PDF, HTML, PPTX and speaker notes
natively, which is roughly ninety hand-rolled lines in `writePdf()` and
`deckHtmlBundle()`. Both engines still route exports through those functions so the
artefact set is identical; adopting marp's native export is a separate decision.

Either way, slides are the canonical `stills` scene — the clip is a held PNG, so padding is free and invisible, and that is why rendering can stay duration-independent while the hold happens in `capture.mjs` once narration length is known.

**Consider whether you need a slide at all.** `page.screencast.showChapter(title, { description })` draws a centred card with a blurred backdrop over the live app, which covers most section transitions natively and keeps the app on screen. Use a designed slide when the argument has *shape* — a comparison, a flow, a number in large type — and a chapter card when the words are the whole content.

## Diagrams

Diagrams are slides: declare `diagram:` on a slide entry and draw it with the [diagram-design](https://github.com/cathrynlavery/diagram-design) skill, frozen under `diagrams/` (`storyline-authoring.md`, *`diagram:`*). That gets the brand, the overflow and contrast gates, the legibility floor, marp parity and a staleness check — none of which a standalone PNG has.

The old route — rendering a `.mmd` file with `@mermaid-js/mermaid-cli` into a PNG — is superseded. To keep an existing Mermaid source, ask diagram-design to redraw it ("redraw scenes/architecture.mmd for my deck"); its Mermaid import keeps components, relationships and direction and drops Mermaid's automatic layout. Then declare the result as a `diagram:` (`references/migration.md`, C5).

For a diagram that should *build up* progressively, use one scene per step (`diagram: { ref, step }`): each step is a complete frame held for its sentence, so the build costs no Remotion and the deck shows the final frame. Progressive reveal is worth it above about six nodes; a full diagram appearing at once is rarely read.

## Aspect ratios

Terminal and slide content is authored at the capture aspect. For a vertical output:

- Slides: always `native` — the renderer re-renders at 1080×1920 and each layout has a declared portrait rule (4 tiles → 2×2, comparison → stacked, bento → single column). Reflow is safe because we own the CSS. `layout: custom` is the exception: arbitrary HTML has no known reflow, so vertical output requires an explicit `portraitHtmlPath`.
- Terminal: prefer `letterbox`. Cropping a terminal cuts off columns, and reflowing it changes what the commands appear to output.

## Footage, including generated footage

`manual_footage` is how anything pre-made enters the timeline — a hand-recorded take, an existing marketing clip, or b-roll from a generative video API.

```jsonc
{ "src": "footage/corridor.mp4", "trim": { "in": 1.2, "out": 9.4 } }
```

- **`trim` cuts before scaling.** A screen recording is usually far longer than the beat it is needed for.
- **`useFootageAudio: true`** keeps the take's own audio and skips TTS, loudness-matched to the same EBU R128 target as narration so the cut does not jump in level.
- **A missing file fails loudly.** Footage is referenced by path, never silently skipped.
- **Generated footage is frozen as an input.** Produce it once, commit it under `footage/`, and keep the prompt in a `generate` block as provenance. A generative API cannot be pinned by hash, so freezing the output is the only way the pipeline stays re-renderable. Validation rejects a generated `src` under `assets/`, which is gitignored — a fresh clone would silently re-bill.
- **Generated footage never depicts UI, text or product behaviour.** Atmosphere and b-roll only. This skill exists because diffusion models cannot render exact UI text or keep a layout stable; generated software would make every factual claim in the video unverifiable.

## Recording an Electron IDE (VS Code, Cursor, Antigravity)

Verified viable, deliberately not implemented as an engine. Playwright's experimental `_electron` API launches VS Code and Antigravity IDE, `.monaco-workbench` is reachable, and `page.screencast` produces valid video from the renderer window — measured at VP8 1280×800 @25fps on macOS with Playwright 1.63, with `recordVideo` and `screencast` working simultaneously.

Recorded here so it is not re-litigated, along with what makes it hard:

- **The binary name differs per fork.** VS Code ships `Contents/MacOS/Code`, Antigravity ships `Contents/MacOS/Electron`. It must be discovered from the bundle.
- **Determinism is the real problem.** An IDE screenshot is a function of the whole environment — theme, font, zoom, open editors, extension state, git decorations, notification toasts. Reproducible capture needs a throwaway `--user-data-dir` seeded with pinned settings, or the same storyboard yields different pixels on every machine.
- **Only the renderer window is captured.** Native window chrome, native menus and the native file dialog are outside the DOM.

Until that is worth building, record the IDE by hand or with your own script and bring the result in as `manual_footage`.
