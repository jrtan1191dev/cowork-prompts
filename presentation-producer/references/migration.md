# Migration guide

Three upgrades are documented here, newest first:

- **[Part C — diagrams and frozen custom slides](#part-c--diagrams-and-frozen-custom-slides)**: the `diagram:` slot backed by the diagram-design skill, URL-sourced `custom` slides, and the retired layout rejections. **Opt-in, with one behaviour change for existing `layout: custom` slides.**
- **[Part A — `presentation-producer` → `presentation-producer`](#part-a--presentation-producer--presentation-producer)**: the rename, the two declared modes, per-presentation namespaces, and the `presentation:`/`video:` source blocks. **This one has breaking changes and requires action.**
- **[Part B — the brand and CSS upgrade](#part-b--the-brand-and-css-upgrade)**: earlier, and almost entirely opt-in.

Throughout, `$S` is the skill directory (resolve `<skill-root>` to wherever this skill is installed — there is deliberately no hardcoded path, because two installs of the same skill are normal).

---

# Part C — diagrams and frozen custom slides

## C0. What changed, and what you must do

| Change | Before | After | Action |
| --- | --- | --- | --- |
| Diagrams | Mermaid PNGs or hand-written `custom` HTML, ungated | `diagram:` on a slide entry, any of diagram-design's 44 types, drawn at authoring time and frozen under `diagrams/` | Optional: convert (C2) |
| Diagram engine | none | the [diagram-design](https://github.com/cathrynlavery/diagram-design) skill (MIT), used directly, never vendored | Install it once (C1) |
| Rejected shapes | `pyramid`, `funnel`, charts, `quadrant` rejected or held in `slide-layouts.md` | Available as `diagram.kind` values; the rejections are retired | None |
| Overlapping shapes | n/a | `kind: loop` and `kind: timeline` are errors that redirect to the `cycle` and `lifecycle` layouts | None — one claim, one implementation |
| `custom` source | `htmlPath` only, injected as a string | also `htmlUrl` / `portraitHtmlUrl`, frozen once into `custom/`; `htmlPath` is now opened as a file, so its relative CSS, scripts and images resolve | Optional (C3) |
| `custom` JavaScript | ran, screenshot timing undefined | runs; screenshot waits for `window.__slideReady`, under a frozen clock, seeded randomness and reduced motion | **Check JS-driven custom slides (C4)** |
| Gates on `custom` | overflow and contrast fail the render | overflow and contrast **warn**; the report marks the slide as outside the design system | None — a page the skill does not own cannot hold an invariant |
| Stale diagrams | n/a | a `diagram:` whose spec, brand or size no longer matches its frozen SVG **fails** the render | Redraw (C2, step 4) |

Nothing existing breaks without the C4 check: a storyline with no `diagram:` and no `htmlUrl` compiles and renders as before, and its cache keys are unchanged.

## C1. Install diagram-design once

Kiro imports a skill from its repository subdirectory and copies it into `.kiro/skills/`:

```
https://github.com/cathrynlavery/diagram-design/tree/main/skills/diagram-design
```

Re-import the URL to update it. A re-import never changes a committed diagram — frozen SVGs are inputs — but the next redraw uses the new version, which is recorded in each diagram's provenance.

`python3` is a **soft** prerequisite: diagram-design's `scripts/self_check.py` (standard library only) is the geometry and taste gate for frozen SVGs. Without it the build still runs and the report says `diagram geometry unchecked`. Confirm with:

```bash
node $S/scripts/bootstrap.mjs --root=presentations --skip-install   # reports diagram-design and python3
```

## C2. Convert a mismatched slide to a diagram

Convert a slide when its **shape is the claim** and the current layout asserts the wrong shape — a race drawn as `comparison`, a handoff across owners drawn as a `lifecycle` rail. If a set of peer cards says the same thing, keep the cards. The claim → shape bridge in `slide-layouts.md` names the type.

### Step 1 — declare the diagram

Before (`technical-design`, `08-concurrency`):

```yaml
- id: 08-concurrency
  type: slide
  layout: comparison
  title: Two people can race for the same thing; only one wins
  cards:
    - { title: The alternative, text: … }
    - { title: What it does instead, text: … }
```

After:

```yaml
- id: 08-concurrency
  type: slide
  layout: diagram            # or a dominant slot: hero visual, spotlight lead, bento-b wide
  title: Two people can race for the same thing; only one wins
  # sequence: the claim is order in time between actors, which a side-by-side cannot draw
  diagram:
    kind: sequence
    actors: [Specialist A, API, Specialist B]
    messages:
      - { from: Specialist A, to: API, label: CLAIM, weight: primary }
      - { from: Specialist B, to: API, label: CLAIM }
      - { from: API, to: Specialist B, label: "409", dashed: true }
```

Rules the validator enforces:

- The diagram is the slide's primary element. A card declaring `weight: primary` beside it is an error, and at most two supporting cards are allowed.
- Inside the diagram, `weight: primary` is what receives the accent: at most one primary and one secondary accent.
- `kind` must be one of diagram-design's types; an unknown kind is an error, exactly like an unknown layout.
- Chart kinds (bar, line, scatter, waterfall, …) carry their numbers in the spec. A chart drawn without data is an error.
- `step:` (video, see step 3) is at most 8.

### Step 2 — generate the brand profile

If the presentation declares no `presentation.design`, find the brand first, in this order:

1. A `DESIGN.md` already in the repository. Pin its path as `presentation.design`; when there are several, choose one explicitly.
2. The app's own design tokens. Run the app and extract them once — `extract-brand` reads the computed CSS custom properties and already knows shadcn semantics (`--primary` is the brand action colour and becomes the accent; shadcn's `--accent` is a pale surface variant and does **not**). A `.dark` block produces `DESIGN.dark.md` as well:

   ```bash
   node $S/scripts/deck.mjs --extract-brand=http://127.0.0.1:3000 --root=presentations --presentation=technical-design
   ```

   Review both files, commit them, and point `presentation.design` (and `designDark`) at them.
3. Neither: diagrams and slides use the built-in palette, and the report says so.

Never point diagram-design at the app's CSS directly. `DESIGN.md` stays the one brand source; the diagram profile is derived from it.

`compile.mjs` then maps `presentation.design` onto a diagram-design profile inside the presentation, carrying your palette **and** your type scale, so diagram text lands on the deck's roles rather than diagram-design's 16px ramp. `presentation.designDark`, when declared, produces a dark profile; when it is absent, diagrams use the light profile — including on a `theme: dark` deck, where each diagram then reads as a light panel and the report says so.

```bash
node $S/scripts/compile.mjs --root=presentations --presentation=technical-design
```

The profile is regenerated whenever `DESIGN.md` changes. Never edit it, and never onboard diagram-design from a URL for a presentation: that creates a second brand source that drifts from `DESIGN.md`.

Run `compile.mjs` after any `DESIGN.md` change: the profile moves, and every diagram drawn against the old one becomes stale.

### Step 3 — split a reveal into scenes (video only)

A diagram that builds as the narration names each part is one scene per step, all pointing at the same diagram:

```yaml
- id: 08a-race-claim
  type: slide
  layout: diagram
  diagram: { ref: 08-concurrency, step: 1 }
  narration: Two specialists claim the same patient within a second of each other.
- id: 08b-race-conflict
  type: slide
  layout: diagram
  diagram: { ref: 08-concurrency, step: 2 }
  narration: The second claim is refused, so nobody silently overwrites the first.
```

Mark the defining entry (`08-concurrency`) `in: [deck]` and the step scenes `in: [video]`, so the deck carries the final frame once and the video carries the build. Give the primary element its own step — the one where the narration names it.

### Step 4 — draw, then stamp

```bash
node $S/scripts/deck.mjs --stamp-diagrams --root=presentations --presentation=technical-design
```

For each diagram not yet drawn this prints a brief: the diagram-design type, the exact viewBox for its slot, the generated profile to use as the style guide, and the files to write — `diagrams/<id>.svg`, `diagrams/<id>.vertical.svg` for a vertical output, `diagrams/<id>[.vertical].step-N.svg` for reveal steps, each beside the `.html` diagram-design produced. Ask the agent to draw them ("draw the diagrams for technical-design"), then run `--stamp-diagrams` again. It writes `diagrams/<id>.provenance.json` (per-orientation content hash, frame checksums, diagram-design version, `self_check.py` result) and refuses to stamp an SVG whose bytes did not change when its spec did.

Commit `diagrams/`. It is source, like `footage/`, and is deliberately not ignored.

### Step 5 — render and read the report

```bash
node $S/scripts/generate.mjs slides --root=presentations --presentation=technical-design
```

Check, per diagram: embedded, `self_check.py` OK, rendered text at or above the `screen` floor, contrast passing. A diagram over diagram-design's node budget warns with split advice; the split is yours to make, because it changes the scene count.

## C3. Source a custom slide from a URL

```yaml
- id: 07-custom-board
  type: slide
  layout: custom
  htmlUrl: https://example.test/board.html
  portraitHtmlUrl: https://example.test/board-portrait.html   # required with a vertical output
```

Freeze it, once, then commit `custom/`:

```bash
node $S/scripts/deck.mjs --freeze-custom --root=presentations --presentation=<slug>
```

This records the page and every resource it loads as `custom/<id>.har` (`custom/<id>.portrait.har` for the portrait URL), with `custom/<id>.provenance.json` (URL, fetch time, sha256). Builds replay the HAR with every unrecorded request aborted, so they never reach the network. To pick up a change, re-run `--freeze-custom`; the update appears in the diff.

Credentials never go in the URL or the storyline. For a page behind a login, save it yourself and use `htmlPath`.

## C4. Check JavaScript-driven custom slides

A custom page is now screenshotted when it signals it is finished. Declare the flag early, set it last:

```js
window.__slideReady = false;  // at the top of the page's script
window.__slideReady = true;   // after the last fetch, font load and layout pass
```

Without the signal the renderer falls back to network idle plus `document.fonts.ready` and the report flags `unverified readiness`. The page also renders under `video.fixedTime` (when set), seeded `Math.random`, and `prefers-reduced-motion: reduce` — so a page that animated into its final state now shows the final state, and a page that printed the real date now prints the fixed one. Re-render and look at the PNGs; add the ready signal to any page that still captures early.

## C5. Converting existing Mermaid slides

The Mermaid route in `capture-terminal-slides.md` is superseded for new work. Redraw with diagram-design's Mermaid import, then declare it as in C2 — the import keeps components, relationships and direction and drops Mermaid's automatic layout:

```
redraw scenes/architecture.mmd for my deck at slide-16x9
```

An existing Mermaid PNG keeps rendering as an image until you convert it.

## C6. Troubleshooting this upgrade

| Symptom | Cause | Fix |
| --- | --- | --- |
| `diagram "<id>" is stale` | Spec, brand profile or slot changed after the SVG was stamped | Redraw and re-stamp (C2, step 4); `--allow-stale-diagrams` for a deliberate one-off |
| `diagram "<id>" is not drawn` | Declared but never drawn | Draw and stamp it (C2, step 4) |
| `unknown diagram kind` | Typo, or a type diagram-design does not have | Use a kind from diagram-design's selection guide |
| `diagram geometry unchecked` | `python3` missing | Install Python 3, or accept and review the PNG yourself |
| `custom <id> has an htmlUrl but no frozen copy` | `--freeze-custom` not run | Run it (C3) |
| `REFUSED <id>: … the SVG bytes did not` | Stamping a drawing that was not redrawn after its spec changed | Redraw, then stamp |
| A custom slide captured half-drawn | No ready signal, or it fires too early | Set `window.__slideReady` after the final paint (C4) |

---

# Part A — `presentation-producer` → `presentation-producer`

## A0. What changed, and why you cannot skip it

| Change | Before | After |
| --- | --- | --- |
| Skill name | `presentation-producer` | `presentation-producer` |
| Invocation | `/presentation-producer` | `/presentation-producer slides` or `/presentation-producer video` |
| Work directory | one `presentations/<slug>/` | one `presentations/` root holding a directory per presentation |
| CLI flags | `--root=presentations --presentation=<slug>` | `--root=presentations --presentation=<slug>` |
| Source meta block | `deck:` | `presentation:` + `video:` |
| Mode | implicit (always a video) | declared: `presentation.mode: slides \| video` |
| Presenter text | `narration:` only | `notes:` for slides, `narration:` for video |
| Deck orientations | derived from `video.outputs` | `presentation.orientations`, plus a per-slide override in slides mode |
| Cache ledger | one `.runtime/ledger.json` per work dir | one `ledger.json` per presentation |

**There is no compatibility shim.** A storyline carrying a `deck:` block now fails with one actionable error:

```
deck: this storyline uses the legacy `deck:` block. Split it into `presentation:`
(mode, title, archetype, engine, theme, formats, orientations, design) and
`video:` (aspect, outputs, voice, baseUrl, fixedTime), and declare
`presentation.mode`. Step-by-step: references/migration.md
```

That is deliberate. A permanent `presentation ?? deck` fallback would protect consumers that do not exist — every storyline written against the old block is in the repository being migrated — and could never be proven unused, so it could never be removed. An explicit error that names the procedure is cheaper to live with than a translation layer that lives forever.

## A1. Migrate one presentation, step by step

Worked with the real example from this repository: `presentations/<slug>/` containing one video presentation, migrated to `presentations/eitri-harness/`.

### Step 1 — choose a slug

The directory name **is** the presentation's identity: it names the namespace, and `--presentation` takes it. Pick lower-kebab-case. Two slugs differing only by case are a hard error, because on macOS and Windows they address one directory.

```bash
ROOT=presentations
SLUG=eitri-harness
```

### Step 2 — move the presentation, sources and all

Artifacts live *inside* the presentation now, so a later rename or delete moves or removes it whole. Use `git mv` for anything tracked so history follows.

```bash
mkdir -p $ROOT/$SLUG
git mv presentations/<slug>/storyline.yml    $ROOT/$SLUG/storyline.yml
git mv presentations/<slug>/storyboard.json  $ROOT/$SLUG/storyboard.json
git mv presentations/<slug>/diagrams         $ROOT/$SLUG/diagrams     # if you have any
git mv presentations/<slug>/footage          $ROOT/$SLUG/footage      # committed on purpose
git mv presentations/<slug>/DESIGN.md        $ROOT/$SLUG/DESIGN.md    # if it lived in the work dir
```

Then delete what was always regenerable:

```bash
rm -rf presentations/<slug>/assets presentations/<slug>/output presentations/<slug>/.runtime
rmdir video-generation 2>/dev/null || true
```

**Do not move `.runtime/`.** It is reinstalled once per root in Step 6, and it is now the only thing presentations share.

### Step 3 — fix relative paths

Author-supplied relative paths (`htmlPath`, `portraitHtmlPath`, `setupScript`, footage `src`, `design`, `designDark`, `fontFile`) resolve against the **presentation directory**. Because Step 2 moved those inputs *into* it, paths like `diagrams/01-workflow.html` keep working unchanged.

Two things do need attention:

- **Anything outside the presentation** now needs a `../` hop. This is the supported way to share one brand between presentations, and it is visible in a diff:

  ```yaml
  presentation:
    design: ../shared/DESIGN.md
  ```

- **Scripts that generate those inputs.** If you have a builder like `diagrams/build-diagrams.mjs`, update the paths it writes to. Find them with:

  ```bash
  grep -rn "video-generation" --include='*.mjs' --include='*.json' --include='*.md' .
  ```

### Step 4 — split `deck:` into `presentation:` and `video:`

Mechanical. Video keys go to `video:`, everything else to `presentation:`, and `mode` is added.

Before:

```yaml
deck:
  title: Eitri — the agentic developer harness
  archetype: scr
  engine: html
  theme: light
  formats: [png, pdf]
  design: ../DESIGN.md
  aspect: landscape
  outputs:
    - aspect: landscape
  voice:
    provider: auto
    gender: female
  baseUrl: http://127.0.0.1:8080
  fixedTime: '2026-01-15T09:00:00.000Z'
```

After:

```yaml
presentation:
  mode: video
  title: Eitri — the agentic developer harness
  archetype: scr
  engine: html
  theme: light
  formats: [png, pdf]
  design: ../shared/DESIGN.md      # note the extra hop if the brand is outside

video:
  aspect: landscape
  outputs:
    - aspect: landscape
  voice:
    provider: auto
    gender: female
  baseUrl: http://127.0.0.1:8080
  fixedTime: '2026-01-15T09:00:00.000Z'
```

Which key goes where:

| `presentation:` | `video:` |
| --- | --- |
| `mode`, `title`, `archetype`, `engine`, `theme`, `formats`, `orientations` | `aspect` (or `captureAspect`), `outputs`, `voice`, `baseUrl`, `fixedTime`, `fps` |
| `design`, `designDark`, `fontFile` | `subtitles`, `background`, `bgm` |

Two rules the validator enforces, so you cannot get this half-done:

- a `mode: slides` presentation must have **no** `video:` block at all;
- a `mode: video` presentation must **not** declare `presentation.orientations` — its deck follows `video.outputs`, and two sources for one fact is how they disagree.

### Step 5 — reconcile entry fields with the mode

| If the presentation is | Then | Because |
| --- | --- | --- |
| `mode: video` | keep `narration:` on every entry that reaches the video; **remove any `notes:`** | the deck's notes strip still reads the narration, so `notes:` would be a second source |
| `mode: slides` | **replace `narration:` with `notes:`**; delete every `capture` and `footage` entry; drop `video` from any `in:` list | a deck has no film to feed, and a note that restates the slide is correct while a narration line that restated it would be dead air |

Scene ids are **untouched** by this migration. They were never the thing that collided — directories isolate the files, and the cache is isolated by giving each presentation its own ledger. Renaming 84 ids would have been churn with no effect.

### Step 6 — reinstall the runtime at the root

```bash
node $S/scripts/bootstrap.mjs --root=$ROOT --with-remotion
```

This creates `$ROOT/.runtime/` once, shared by every presentation in the root. It also rewrites the ignore block in your nearest `.gitignore` (Step 8).

### Step 7 — recompile and rebuild

```bash
node $S/scripts/compile.mjs --root=$ROOT --presentation=$SLUG --force
node $S/scripts/generate.mjs video --root=$ROOT --presentation=$SLUG --baseUrl=http://127.0.0.1:8080
```

The recompiled `storyboard.json` gains `meta.mode`. Scene content is otherwise unchanged, so `captureCacheKey` still matches — but see A3 on the cache.

For a slides presentation:

```bash
node $S/scripts/generate.mjs slides --root=$ROOT --presentation=$SLUG
```

### Step 8 — fix `.gitignore` by hand, once

`bootstrap.mjs` writes its block behind a marker comment, and the marker changed from `# presentation-producer:` to `# presentation-producer:`. It replaces its **own** marker only, so the old block is left behind as an orphan pointing at a directory that no longer exists. Delete it.

Old (delete):

```gitignore
# presentation-producer: video-generation
presentations/<slug>/.runtime/
presentations/<slug>/assets/
presentations/<slug>/output/
presentations/<slug>/*.log
```

New (bootstrap writes this):

```gitignore
# presentation-producer: presentations
presentations/.runtime/
presentations/*/assets/
presentations/*/output/
presentations/*/ledger.json
presentations/*/deck*.md
presentations/*/*.log
```

Note the glob level: artifacts are inside each presentation. And note what is **absent** — `*/footage/` is not ignored, because generated footage cannot be pinned by hash, so it is committed with its prompt kept as provenance.

If your repo also had a standalone `presentations/<slug>/output/` rule written by hand, remove that too.

### Step 9 — verify

```bash
cd $S/scripts && node --test          # 377 tests, no install needed
```

Then confirm the presentation resolves and the artifacts are real:

```bash
node $S/scripts/verify.mjs --root=$ROOT --presentation=$SLUG
```

## A2. Splitting a video presentation into two

If you previously used one storyline for both a film and a deck-for-humans, and the deck deserves its own editorial treatment, make a second presentation rather than bending the first:

```bash
mkdir -p $ROOT/launch-review
cp $S/templates/storyline/slides.yml $ROOT/launch-review/storyline.yml
```

Then move the deck-only entries across, convert their `narration:` to `notes:`, and remove `in: [deck]` (redundant in slides mode, where the default target is the deck). The two presentations are independent from that point: separate ledgers, separate artifacts, no shared cache.

This is the supported direction. There is **no automatic promotion** the other way — turning a slides presentation into a video means declaring `mode: video`, adding a `video:` block, and adding narration and captures, at which point the validator tells you exactly what is missing. That is better than an upgrade that silently produces a narrated slideshow.

## A3. What happens to the cache

| Cache | Survives the migration | Why |
| --- | --- | --- |
| Audio (`audioCacheKey`) | **No** | The ledger moved from `.runtime/ledger.json` to `<presentation>/ledger.json`, so the new ledger starts empty. Narration is re-synthesised once. |
| Captures (`captureCacheKey`) | **No, on the first run** | Same reason. Content keys are unchanged, so a second run reuses everything. |
| Slide PNGs | N/A | Re-rendered every run by design; they self-heal. |

The one-time re-synthesis is the price of cache isolation, and it is deliberate. A shared ledger would have let two presentations trade artifacts: `audioCacheKey` digests narration, provider, voice and rate but **not** the scene id, so the same sentence in two decks produces the same key — and the second presentation's committed `storyboard.json` would then point at the first one's audio file. On a local Kokoro default the cost is CPU time; on a metered provider, budget for one full pass.

## A4. Reference: every flag that changed

| Old | New |
| --- | --- |
| `--root=presentations --presentation=<slug>` | `--root=presentations --presentation=<slug>` |
| (n/a) | positional `slides` \| `video` on `generate.mjs` |
| `VIDEO_GEN_APP_VERSION` | `PRESENTATION_APP_VERSION` |
| `$S=<skill-root>` | resolve `<skill-root>`; no hardcoded install path |
| `presentation.design`, `presentation.formats`, … | `presentation.design`, `presentation.formats`, … |
| `video.outputs`, `video.voice`, `video.baseUrl`, … | `video.outputs`, `video.voice`, `video.baseUrl`, … |

`--workDir` is still accepted by `generate.mjs` as a direct presentation-directory path, which is useful in scripts that already computed one. It does no resolution and no listing, so prefer `--root` + `--presentation`.

## A5. Troubleshooting the migration

| Symptom | Cause | Fix |
| --- | --- | --- |
| `this storyline uses the legacy deck: block` | Step 4 not done | Split the block; declare `presentation.mode` |
| `presentation.mode: missing` | Block split, mode forgotten | Add `mode: slides` or `mode: video` |
| `pass --presentation=<slug> — found: a, b` | Several presentations, none named | Pass `--presentation`; runs never guess |
| `presentations holds no presentations yet` | `storyline.yml` not inside `<root>/<slug>/` | A directory counts only when it holds `storyline.yml` |
| `slugs "X" and "x" differ only by case` | Two directories collide on a case-insensitive filesystem | Rename one |
| `X is a video presentation, but you asked for slides` | Mode word disagrees with the declaration | Use the declared word, or pick another presentation |
| `entries[n].narration: is video-only` | A slides presentation kept its narration | Rename the field to `notes:` |
| `entries[n].notes: is slides-only` | A video presentation gained `notes:` | Delete it; the deck reads `narration:` |
| `a mode: slides presentation renders slides only` | A `capture` or `footage` entry survived | Delete it, or make the presentation `mode: video` |
| `video: a mode: slides presentation has no video` | The `video:` block survived | Delete the block |
| `per-slide orientation is slides-only` | `orientations:` on a video entry | Remove it; use `video.outputs` |
| Everything re-synthesises | Expected once (A3) | Run again; the second run reuses the new ledger |
| `Playwright/Chromium missing` | `.runtime/` was moved instead of reinstalled | Re-run `bootstrap.mjs --root=<root>` |

---

# Part B — the brand and CSS upgrade

Earlier upgrade, kept for projects that have not adopted a brand yet. **Your existing work still runs.** A storyboard compiled before brand support existed loads unchanged, nothing is regenerated to make it valid, and cached renders stay valid. There is exactly one genuine breaking change, and it only bites hand-written `layout: custom` slide HTML.

Commands below assume the post-rename layout: `ROOT=presentations` and `SLUG=<your presentation>`.

## B1. What still works

| Artefact | Still works | Action needed |
| --- | --- | --- |
| `storyline.yml` (authored source) | Yes | None. Recompile only if you want the new CSS in fresh PNGs. |
| `storyboard.json` (committed lockfile) | Yes — `validateManifest` returns `[]` on it | None. No regeneration needed to load it. |
| Cached video clips | Yes — cache keys are unchanged unless a brand is declared | None |
| Deck PNGs / PDF / HTML | Re-rendered every `deck.mjs` run, so they self-heal | None |
| Built-in palettes (no brand) | Yes — pre-existing behaviour, nothing reported | None |
| `layout: custom` HTML using `--on-accent` or `--accent-2` | No — both variables were deleted | Update the HTML (B3) |
| Output aspects (landscape/vertical) | Yes — whatever your `outputs:` block declares | Optional edit (B5) |
| CLI entry points on Windows / spaced paths | Now fixed; previously silently no-op | None — the fix is automatic |

## B2. The nothing-to-do path

For a project with no brand and no custom-HTML slides, this upgrade changes nothing you must act on. A pre-brand `storyboard.json` carries `$source.checksum`, every `slide.theme` as the bare string `light`, and no `design`/`designDark`. `compile.mjs` stamps `$source.brand` and `scene.slide.brand` **only when a brand is declared**, so such a storyboard keeps byte-identical cache keys and its clips are reused as-is.

```bash
node $S/scripts/verify.mjs   --root=$ROOT --presentation=$SLUG
node $S/scripts/generate.mjs video --root=$ROOT --presentation=$SLUG --baseUrl=http://127.0.0.1:8080
```

## B3. The one breaking change

Two CSS custom properties were deleted from the slide theme:

| Variable | Why it went | Impact |
| --- | --- | --- |
| `--on-accent` | Never used anywhere | None on generated slides |
| `--accent-2` | Only coloured the missing-icon marker | Marker is now a fixed unbranded magenta (`#FF00FF`) so a wiring bug stays conspicuous |

Generated (non-custom) slides never referenced either variable. The only thing that can break is **hand-written `layout: custom` slide HTML**:

```bash
grep -rn --include='*.html' -e '--on-accent' -e '--accent-2' $ROOT/$SLUG
```

Replace hits with a literal colour or a surviving token (`--accent-1` is the brand accent; `--primary` is ink).

## B4. Refreshing renders after the CSS change

Slide CSS now always emits four modern web-platform features:

| Feature | Applied to | Effect |
| --- | --- | --- |
| `text-wrap: balance` | `.title`, `.hero-title` | Evens out heading line breaks |
| `text-wrap: pretty` | `.body`, `.card-text` | Orphan control on body copy |
| `text-box: trim-both cap alphabetic` | `.card-title` | Trims to cap height |
| `font-size-adjust` | fallback families only | Holds x-height stable — emitted **only** when a brand font could not be embedded |

Because heading line breaking changes, **old PNGs and old slide video clips will not match a fresh render.** `deck.mjs` re-renders every PNG on every run, so the deck self-heals; video slide clips are governed by `captureCacheKey`, which digests `scene.slide`, so a clip is rebuilt only when its content changes. If you splice a fresh clip alongside pre-change clips in one video, heading wrapping will look inconsistent — re-render the whole video, not a subset.

## B5. Switching an existing project to landscape only

Outputs are landscape only **by default**, and the code default always was. What changed is the template. An existing storyline that declares `- aspect: vertical` keeps producing both aspects, so nothing changes silently.

```yaml
video:
  outputs:
    - aspect: landscape
    - aspect: vertical    # <- delete this line for landscape only
```

```bash
node $S/scripts/compile.mjs --root=$ROOT --presentation=$SLUG --force
```

## B6. Adopting a brand (opt-in)

Provide brand data in a `DESIGN.md`. It may live anywhere in the repository (it is the same file an application's own agents read); a presentation-local `DESIGN.md` gives one presentation its own look, and `../shared/DESIGN.md` is how several share one.

```yaml
presentation:
  design: DESIGN.md                 # light palette, relative to the presentation
  designDark: DESIGN.dark.md        # optional dark palette
```

```bash
node $S/scripts/compile.mjs --root=$ROOT --presentation=$SLUG --force
node $S/scripts/deck.mjs    --root=$ROOT --presentation=$SLUG --formats=png,pdf,html
```

When a brand is declared, `compile.mjs` records the brand file checksum in `$source.brand` and stamps `scene.slide.brand`, so `captureCacheKey` correctly rebuilds clips against the new palette. A declared-but-missing file is a hard error.

Every variable that lands on its built-in is a reported substitution, brand provenance is summarised, and any clamped type ratio is noted. The **contrast gate** is an invariant — any element below its per-element threshold fails the render, batch-reported in the same shape as overflow. Colours are never auto-corrected. For a deliberate one-off:

```bash
node $S/scripts/deck.mjs --root=$ROOT --presentation=$SLUG --allow-low-contrast
```

## B7. What a brand does not change

| Aspect | Behaviour with a brand |
| --- | --- |
| Caption typeface | Stays `Arial`. ASS carries a single `Fontname` with no fallback list, so a brand family would resolve per machine. |
| `components:` in `DESIGN.md` | Parsed and preserved, but never consumed — the deck has no buttons, chips or inputs. |
| `spacing:` in `DESIGN.md` | Parsed but not consumed — the layouts derive gaps from the fixed canvas. |
| `--shadow` | Cannot be branded — `design.md` has no elevation token subsection, so it is always the built-in. |

## B8. Windows and cross-platform notes

Long-standing portability bugs are fixed; nothing to do.

| Fix | Detail |
| --- | --- |
| CLI entry guards | Every entry point uses `pathToFileURL` via `isMainModule` in `scripts/lib/core.mjs`. |
| npm invocation | `npm` is spawned as `npm.cmd` with `shell: true` on `win32`. |
| Remotion CLI | The `npx` fallback was removed in favour of the pinned CLI in the project's `node_modules`. |

Previously on Windows the scripts exited `0` doing nothing, and `bootstrap.mjs` could not run at all because `npm` was not resolvable. On **any** platform, a checkout path containing a space hit the same guard bug.
