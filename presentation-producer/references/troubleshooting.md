# Troubleshooting

Start here, always:

```bash
node <skill-root>/scripts/bootstrap.mjs --root=presentations --presentation=<slug> --skip-install
```

That prints the capability map and per-platform remedies without installing anything.

---

## Install and environment

**"ffmpeg/ffprobe not resolved"**
Every stage depends on them — `ffprobe` is the duration prober, so nothing works without it. They are **not** system prerequisites: run the bootstrap and they install as `ffmpeg-static`/`ffprobe-static` inside `.runtime/node_modules`. If you have a system ffmpeg it will be used as a fallback, but the static build is preferred for reproducibility.

**Chromium "executable doesn't exist"**
`PLAYWRIGHT_BROWSERS_PATH` must be set at **both** install time and run time. The pipeline sets it before launching; if you invoke `capture.mjs` through your own wrapper, set it to `<workDir>/.runtime/browsers`.

**Node-only, and something still wants Python**
Two optional things do. `edge-tts` lives in `.runtime/.venv`, which also avoids installing into macOS system Python. diagram-design's `self_check.py` needs a system `python3` (standard library only); without it diagrams still render and the report says `diagram geometry unchecked`. The default TTS provider (Kokoro) is Node-native.

**VHS missing on macOS**
`brew install charmbracelet/tap/vhs ttyd`. `ttyd` has no usable prebuilt macOS binary, so it cannot be localised into `.runtime`. Without it, terminal scenes degrade to styled code slides.

**Reclaiming disk**
`rm -rf presentations/<slug>/.runtime` removes roughly 0.5–1GB and loses nothing authored. Re-run the bootstrap to restore it. Never delete `storyline.yml`, `storyboard.json`, `scenes/` or `footage/`.

---

## Deck and slides

**"the `yaml` parser is not installed"**
`compile.mjs` needs it and Node ships no YAML parser. Run the bootstrap. Note that validating an existing `storyboard.json` is still install-free — only compiling `storyline.yml` requires the runtime.

**"storyboard.json exists but carries no generated-file marker"**
The storyboard is a lockfile generated from `storyline.yml`, and it looks hand-edited. Either move your edits into `storyline.yml`, or pass `--force` to overwrite. If you are deliberately hand-authoring a storyboard with no storyline, delete `storyline.yml` so `generate.mjs` stops compiling.

**"N slide element(s) overflow their container"**
Real clipping, in the reported orientation. The message names the slide, the element and the measured pixels — shorten the text, split the slide, or move detail into a second card. `--allow-overflow` renders anyway. Note that portrait usually overflows before landscape, because the same text has less width.

**"unknown icon"**
Names come from the bundled Lucide set. Check the exact spelling in `.runtime/node_modules/lucide-static/icons/`. This is a hard error on purpose: a blank icon passes every other check.

**"layout X takes N cards"**
Each layout has a fixed card range, and content it has nowhere to put is an error rather than a silent drop. Either change layout or split the slide.

**"a vertical output is declared and layout `custom` cannot reflow"**
Arbitrary HTML has no known portrait behaviour. Supply `portraitHtmlPath` (or `portraitHtmlUrl`, then re-freeze), or drop the vertical output for that deck.

**"scene X has no rendered slide at assets/slides/…"**
`deck.mjs` has not run, or ran for a different aspect. `generate.mjs` runs it automatically before the outline gate; standalone, run `node scripts/deck.mjs --root=… --presentation=…` first.

**Slides look right but the deck PDF is missing pages**
`formats` controls what is emitted, and presentation artifacts are landscape-only — a portrait deck is a video asset, not something anyone presents from.

**A footage scene is silent**
Set `useFootageAudio: true` if the take carries its own audio; otherwise narration is synthesised. Before this was fixed, `useFootageAudio` skipped TTS *and* the audio was stripped, leaving nothing.

**Generated footage keeps being re-billed**
Its `src` is probably under `assets/`, which is gitignored, so a fresh clone has no file. Move it to `footage/` — validation now rejects this case.

---

## Diagrams

Diagrams are drawn at authoring time by the diagram-design skill and frozen under `diagrams/`. A build never draws one, so every diagram failure is fixed by redrawing or by editing the spec — never by re-running the build harder.

**"diagram frame(s) are missing or stale" — `… is stale`**
The spec, the generated brand profile or the slot (layout, card count, orientation) changed after the SVG was stamped, so the frozen drawing no longer says what `storyline.yml` says. This fails on purpose: a stale diagram passes overflow, contrast and geometry, and is wrong. Run `deck.mjs --stamp-diagrams` for the brief, redraw, and stamp again. `--allow-stale-diagrams` renders anyway, for a deliberate one-off. A diagram-design update does **not** make diagrams stale — the version is recorded, not hashed.

**`… is not drawn — expected diagrams/<id>.vertical.svg`**
Declared but never drawn, or a vertical output was added after drawing. Portrait is a separate drawing at the brief's portrait size, never a crop. With `--allow-stale-diagrams` the slide renders a magenta placeholder so the gap stays visible.

**"REFUSED <id>: the spec … changed but the SVG bytes did not"**
`--stamp-diagrams` will not bless a drawing that was not redrawn after its inputs moved. Redraw, then stamp.

**"unknown diagram kind"**
The `kind` is not one of diagram-design's types; it must name a `references/type-<kind>.md` file. `loop` and `timeline` are rejected with a redirect to the `cycle` and `lifecycle` layouts, which already make those claims.

**"a card declares weight: primary on a diagram slide"**
The diagram is already the primary element. Remove the card's `weight`, or mark a node, message or lane `weight: primary` inside the diagram instead.

**"chart <id> carries no data"**
Bar, line, scatter, waterfall and the other chart kinds are drawn from numbers in the spec. A hand-placed bar is a claim nothing can check, so a chart without data is an error.

**"diagram <id> exceeds its node budget"**
A warning. The diagram has more nodes than diagram-design's budget, so it is probably two diagrams. Split it into an overview plus a detail — a split you make, because it changes the scene count.

**"diagram text run(s) below the <profile> floor"**
A warning. Rendered SVG text, measured in the browser at its embedded scale, is smaller than the viewing profile allows (`screen` for landscape, `phone` for vertical; `--profile=room` for a venue). Cut nodes, give the diagram the full `diagram` layout instead of a dominant slot, or split it. If it appears on every diagram, the drawing ignored the profile's sizes or the brief's viewBox — redraw at the brief's size.

**"diagram geometry unchecked" / "diagram geometry failed: …"**
Recorded when the diagram was stamped. *Unchecked*: `python3` was missing, diagram-design was not installed, or no `.html` sat beside the SVG, so `self_check.py` could not run — the build continues and reports it. *Failed*: diagram-design's own check found a defect; redraw and re-stamp.

**Diagram colours do not match the slides**
The diagram was drawn against a different profile — usually one onboarded from a URL, or a default skin. Diagrams must use the profile `compile.mjs` generates from `presentation.design`. If no `DESIGN.md` exists, extract one from the running app with `deck.mjs --extract-brand=<url>` (it maps shadcn's `--primary`, not its pale `--accent`, to the brand accent), commit it, and declare it. On a `theme: dark` deck without `designDark`, light diagrams on dark slides are expected and reported; supply `designDark` to change it.

**A revealed diagram shows the wrong step**
Each step scene names `diagram: { ref, step }` and renders `diagrams/<ref>.step-N.svg`. Check the step numbers run 1..N in narration order and that N is at most 8. Mark the defining entry `in: [deck]` so the deck shows the final frame once.

**"a step reuses … frames, which were drawn for its slot"**
A step scene must use the same layout and card count as the entry it references, because it reuses that entry's drawings.

---

## Custom slides

**"custom <id> has an htmlUrl but no frozen copy"**
Builds never fetch. Run `deck.mjs --freeze-custom` and commit `custom/` (the `.har` and its provenance). Re-run it to pick up a change to the remote page.

**A frozen custom page renders with missing images or styles**
A resource the page requested only after the freeze-time ready signal was never recorded, and replay aborts unrecorded requests. Set `window.__slideReady = true` later — after the final load — and re-freeze.

**A custom slide captured half-drawn, or mid-animation**
The page did not signal readiness, or signalled too early. Declare `window.__slideReady = false` early and set it `true` after the last fetch, font load and layout pass. Without the declaration the renderer falls back to network idle plus fonts and reports `unverified readiness`.

**A custom slide shows a fixed date, or no animation**
Expected. Custom pages render under `video.fixedTime`, seeded randomness and `prefers-reduced-motion: reduce`, so two renders of one commit are identical. Design the page's final state to be the one you want captured.

**Overflow or contrast on a custom slide only warns**
Expected. The skill does not own a custom page's CSS, which may clip on purpose, so its gates warn and the report marks the slide as outside the design system.

---

## Capture

**`SceneAssertionError: expected text "…" to be visible`**
Working as intended: the page was not showing what the storyboard claims. Check for an expired `storageState` (log in again and re-save), a wrong `baseUrl`, or content that needs a `waitForText` step before recording. This error exists to stop a video of a login screen from shipping.

**`scene "…" produced no frames`**
The screencast never started. Usually the page crashed or navigation failed. Re-run that scene with `--headed` and watch.

**Everything looks slightly stuttery**
Expected. The screencast source is ~25fps and the timeline is 30fps, so about one frame in five is duplicated. The capture report prints the measured source rate. Use `captureMode: "stills"` for scenes that do not need real motion.

**Stills differ between runs**
Something is animating. Confirm the scene is `captureMode: "stills"` so `animations: 'disabled'` applies, and set `meta.fixedTime` if the UI renders relative timestamps.

**"substituted locator" warnings**
A stored locator stopped matching and the target description was resolved instead. The storyboard was rewritten with what actually matched — review the diff. Frequent substitutions mean the selectors were too brittle; prefer `role` + `name`.

**Captures rebuild every run**
The app version could not be resolved. Pass `--app-version=<sha>`, or run from inside the app's git repo. A dirty working tree deliberately counts as its own version. This is fail-safe behaviour: a stale clip of a changed UI is worse than a slow rebuild.

---

## Audio and captions

**"no speech provider available"**
Run the bootstrap to install Kokoro, or set `GEMINI_API_KEY`, `OPENAI_API_KEY` or `ELEVENLABS_API_KEY`. Note that `claude` and `kiro-cli` cannot synthesise speech — no speech endpoint exists for them.

**edge-tts refuses to run**
By design. It is an unofficial reverse-engineered Microsoft endpoint whose maintainer states it is for personal use and unsuitable for anything mission-critical. Pass `--acknowledge-edge-tts`, or use `--tts=kokoro` for commercial work.

**"narration is N% longer than the visual"**
The scene needs splitting or the narration needs shortening. The pipeline refuses to stretch speech past 20% because it would sound wrong. Splitting is almost always the better fix — it also improves pacing.

**"speech time-stretched with atempo"**
A paid or rate-less provider was used, so existing audio was stretched instead of re-synthesised, to avoid billing twice. Fine at small ratios; if it appears with a large percentage, shorten the narration.

**Captions out of sync**
Usually a hand-edited SRT combined with re-rated speech. The pipeline scales provider cues by `1/(1 + ratePct/100)` automatically; a manually supplied SRT bypasses that. Delete it and let cues be synthesised.

**Captions are enormous, or wrap to one word per line**
The burn-in file lost its script resolution. Captions must be burned from the `.ass` written by `lib/subtitles.mjs`, which declares `PlayResX`/`PlayResY` as the output frame. Burning an SRT instead — or reintroducing `force_style` — makes libass interpret every value in libavcodec's 384×288 default script space and scale it by `frameHeight/288`: 3.75× on 1080p. Check that `assets/processed/<scene>.<aspect>.ass` exists and its `PlayResY` matches the output height.

**Vertical captions missing entirely**
The same root cause with a different symptom: at 1080×1920 the multiplier is 6.67×, which pushes a 400px bottom margin to 2667px — past the top of the frame, so nothing renders and no probe can see it. Verify by burning one cue over a solid colour and looking at the frame (see SKILL.md > Verification).

**Captions look different on another machine**
A font substitution. ASS has a single `Fontname` field and no fallback list, so if the named family is missing libass picks its own and wrapping changes. The default is Arial precisely because Windows and macOS ship it and Linux substitutes the metric-compatible Liberation Sans. To guarantee identical output everywhere, bundle a font and set `subtitles.fontsDir` plus `subtitles.style.Fontname`.

**Captions covering the UI in vertical output**
Switch that output to `strategy: "letterbox"` — captions then move into the empty bar below the footage. Or override `meta.subtitles.style.marginV`.

**Wrong narrator gender, or `--voice-gender` seems ignored**
`--voice-gender` beats `meta.voice.gender`, which beats a pinned `meta.voice.voiceId`. If the voice still sounds wrong, the audio came from cache: the resolved voice id is part of the cache key, so a genuinely new voice re-synthesises. Check the reported `voice: <provider> / <voiceId>` line first.

**Silence warnings from verification**
A TTS call probably returned empty audio for one scene. Find it in the synthesis report, delete that scene's cached audio, and re-run.

---

## Composition

**Vertical output is letterboxed when reframing was requested**
Remotion is unavailable. FFmpeg cannot do animated ROI crops maintainably, so it degrades and warns. Run the bootstrap with `--with-remotion`.

**Remotion render fails to start**
Confirm `.runtime/remotion/node_modules/remotion` exists. The template needs its own `npm install`; the compositor cannot run as a loose script.

**Output is shorter than the sum of the scenes**
Cross-fades. Each `xfade` overlaps two scenes and removes the fade duration from the total. Hard cuts are the default for exactly this reason.

**Concat fails or output stutters at joins**
Every scene must be encoded identically for stream-copy concat. If you hand-edited a clip, re-encode it through `normaliseClipArgs`, or re-run compose with the cache disabled.

---

## Verification

**"resolution 1920x1080, expected 1080x1920"**
The output was rendered at the wrong aspect. Check `meta.outputs` and that the compositor produced a file per aspect.

**"duration drifts …"**
A warning, not a failure. Small drift is encoder rounding. Large drift means a scene padded far more than planned — check the freeze warnings.

**"a caption cue ends past the video"**
A cue outlasted its scene. Regenerate captions by re-running compose with `--no-cache`.

**Scene drift failures**
Per-scene visual duration diverged from the plan. Almost always a capture that ran long; re-capture that scene.

---

## When to disable the cache

`--no-cache` rebuilds everything. Reach for it when output contradicts the storyboard, after upgrading the skill, or when debugging a stage in isolation. Do not use it routinely — it discards the property that makes iteration affordable.
