# Composition: engines, aspect ratios, subtitles

## Engine is derived, not chosen

The manifest declares what the output needs; the pipeline picks the engine that can deliver it and always reports why.

| Requirement in the manifest | Engine |
|---|---|
| Single aspect, static burned captions | **FFmpeg** |
| A second aspect requiring `reframe` | **Remotion** |
| `kineticCaptions: true` | **Remotion** |
| Any scene with `pip` | **Remotion** |
| Any `remotion_motion` scene | **Remotion** |

FFmpeg stays the default whenever it is sufficient: no 400MB install, much faster, and no licence condition for adopters. Remotion earns its place for **multi-format reframing from a single capture** — one composition per aspect consuming the same scene data, with a crop that follows the region of interest. The equivalent in FFmpeg is a hand-authored `crop`/`zoompan` filtergraph with animated parameters per scene, which stops being maintainable quickly.

`--engine=` overrides the decision, and degradation is still reported. If Remotion is unavailable, 16:9 succeeds and the vertical output falls back to letterbox with a warning — the reframe is skipped, never silently approximated.

## Reaching a second aspect

A dense desktop dashboard cannot simply be rendered at 1080×1920. A 12-column comparison collapses to a single-column list, and the visual argument — "three options side by side" — disappears. Rendering at a mobile viewport does not shrink the story, it changes it.

Three strategies, chosen per scene:

| Strategy | What it does | Right when |
|---|---|---|
| `native` | Capture at the target viewport, using the app's real responsive layout | The route is genuinely mobile-first (few columns, no wide tables) |
| `reframe` | Capture landscape, crop a portrait window centred on the ROI | Dense layouts — punches in on the panel under discussion |
| `letterbox` | Fit the whole landscape frame in a portrait canvas with bars | No ROI known, or full context matters more than size |

Default selection: `native` when the scene declares a mobile-capable viewport, `reframe` when an ROI exists, `letterbox` otherwise. **Slide scenes are always `native`**: we own their CSS, so each layout has a declared portrait rule and reflow preserves the argument instead of changing it. See `references/storyline-authoring.md` for the per-layout rules.

To judge a route quickly: count responsive prefixes, grid density and tables. Many `grid-cols-12`/`grid-cols-6` and horizontally scrolling tables mean `reframe`. Two-column, table-free layouts are `native` candidates.

## Density forks by target; the argument does not

One `storyline.yml` produces both a read deck and a narrated video. The argument is shared. What must not be shared is the **on-screen density budget** and the timing — a read-deck slide and a narrated video frame of the same scene are not the same density.

| | Read deck | Video landscape | Video portrait |
| --- | --- | --- | --- |
| On-screen text | full budget | ~50-60% of the deck | ~40-50% of the deck |
| Cards | catalogue range | one fewer than the deck; the top of the range is an overflow risk | headline + one card at a time |
| `process-flow` 5 nodes | shown together | revealed one per narration beat | split across scenes |
| Who carries the argument | words (no audio) | on-screen text must (much social video is watched muted) | on-screen text must |

The reasoning, named rather than hidden: reading speed and speech rate are different clocks (~238 wpm read vs ~150 wpm spoken), so a narrated viewer cannot read prose while listening — prose on the frame competes with the narration instead of reinforcing it. And a large share of social video is watched **muted**, so the on-screen text must carry the message independently. Those two pulls are in tension — "less text because it competes with audio" versus "enough text to stand alone when muted" — and the resolution is keyword-level on-screen text with the full sentence in the narration, plus a synchronised caption track (`storyline-authoring.md` covers `narration:` versus on-slide text).

**This is authoring guidance, and at most a warning — never a forked gate.** The skill has a standing decision (`SKILL.md`, "Gates across modes") that overflow, contrast, icon coverage and card dominance are identical across deck and video, and only the printed summary forks. Those gates are properties of a 1920x1080 canvas, not of a medium; forking them would create two definitions of "valid slide" and the weaker one would win. So the density budget above is a budget an author works to, still enforced by the same one overflow gate for both media — not a second gate that fires only for video. Nobody should later "fix" this by forking a gate.

In video the heaviest element is not merely the biggest: it **reveals, moves, or magnifies on the beat the narration names it** (temporal contiguity). A card that appears before its word invites reading ahead; after its word, a confused pause. Tolerance is under two seconds; aim sub-second. See `references/archetypes.md` for the per-archetype narration-and-hierarchy guidance.

## The caption band is a layout constraint in the video path

In video, the burned caption band and the platform's chrome reserve screen the deck never had. Every layout's dominant element must clear the keep-out band, and the layouts most at risk are the ones anchoring their dominant element low — `stat-deepdive` with a low headline metric, and any layout whose primary card lands near the bottom in portrait, where captions ride up and platform chrome eats the bottom third. Concrete keep-out figures per canvas, and which platform figures are approximate, are in `references/legibility.md`; the caption geometry itself is in *Subtitles* below.

## Subtitles

Captions are **burned in**, and placement is **derived from the aspect and the strategy** rather than fixed.

| Output | Font | Bottom margin | Chars/line | Reasoning |
|---|---|---|---|---|
| 16:9 landscape | 44px | 64px (~6%) | 46 | Large screen; sit just above the edge |
| 9:16 vertical | 52px | 400px (~21%) | 26 | Watched small; must clear TikTok/Reels/Shorts UI chrome |
| 1:1 square | 46px | 140px | 32 | Between the two |
| 9:16 letterbox | 52px | inside the lower bar | 26 | The bar is empty — captions never cover the UI |

That last row is the nicest consequence of letterboxing: there is dead space below the footage, so captions occupy it instead of the demo.

Ordering matters in the filter chain: **captions are burned after the reframe**, otherwise a crop would slice them and a scale would distort them. That ordering is what allows per-aspect placement from a single capture.

### Burn-in is ASS, and why that is not a style preference

Those pixel values only mean pixels if the subtitle file states its own resolution, so the compose stage writes **ASS with `PlayResX`/`PlayResY` set to the output frame**, and passes no `force_style`.

SRT carries no geometry. ffmpeg's `subtitles` filter therefore converts an SRT using libavcodec's default ASS header, whose script resolution is **384×288**, and libass scales that script up to the frame — multiplying every value by `frameHeight / 288`. Measured consequences of getting this wrong:

- On 1920×1080 the multiplier is **3.75×**: a declared 40px font renders at 150px, horizontal margins consume the frame, and captions wrap to one word per line covering the whole picture.
- On 1080×1920 the multiplier is **6.67×**: a declared `MarginV` of 400 becomes 2667px, which is off-frame — the captions disappear entirely, silently, with nothing for a probe to detect.

The Remotion path lays out in real CSS pixels already, and its `LAYOUTS` table mirrors `scripts/lib/subtitles.mjs` so the two engines agree.

### Font

`Arial`, and the choice is about determinism rather than taste: ASS has a single `Fontname` field and no fallback list, so an unavailable family makes libass substitute something of its own choosing and line wrapping then differs per machine. Arial ships with Windows and macOS, and fontconfig maps it to the metric-compatible Liberation Sans on Linux, so advances — and therefore wrapping — hold across all three.

To bundle a font instead, set `subtitles.fontsDir` to a directory of OFL/Apache-licensed fonts and `subtitles.style.Fontname` to its family name; the directory is handed to ffmpeg as `fontsdir`.

### Where the cues come from

Only `edge-tts` returns real cue timings. Everything else — including the Kokoro default — needs cues synthesised: the narration is split on sentence and clause boundaries, then the **measured** audio duration is apportioned by character count. Mid-sentence drift is a few hundred milliseconds, well inside reading tolerance, and segment boundaries never drift because they are apportioned from the true total.

Two correctness rules the implementation enforces:

1. **Re-rated speech invalidates provider timings.** When narration is re-synthesised or stretched to fit an inelastic visual, cues are scaled by `1 / (1 + ratePct/100)`. Skipping this desynchronises captions by exactly the amount the speech moved.
2. **No cue may outlast its scene.** Cues are clamped, and verification fails a build where one extends past the video.

Captions are also bounded in on-screen duration, so a long sentence in a long scene becomes several readable cues instead of one static block.

`subtitles.sidecar: true` additionally writes a whole-video `.srt` with cues offset onto the global timeline, for platforms that prefer uploaded captions.

## Choosing which aspects to render

`meta.outputs` declares every aspect a storyboard *can* produce. `--aspect` narrows a single run to what you actually want:

```bash
node $S/scripts/generate.mjs --aspect=landscape          # 16:9 only
node $S/scripts/generate.mjs --aspect=vertical           # 9:16 only
node $S/scripts/generate.mjs --aspect=landscape,vertical # both (also the default)
```

Two things follow from it being a filter rather than an edit:

- **The storyboard is not rewritten.** A one-off `--aspect` never drops an output from the committed source.
- **The engine decision follows.** Narrowing to the captured aspect removes the reframing requirement, so `--aspect=landscape` on a landscape capture drops from Remotion to FFmpeg by itself.

An aspect the storyboard never declared is still accepted and gets default framing, because asking for a vertical cut of a 16:9 storyboard is a legitimate one-off.

## Timing reconciliation

Whichever side is inelastic dictates:

- **`stills`** — the visual can be held for any duration, so **audio dictates**. Padding is invisible.
- **`screencast`** — a real click-and-wait cannot be compressed, so **speech is fitted** to it.

| Mismatch | Action |
|---|---|
| ≤ 7% | Re-synthesise at an adjusted rate — perceptually inaudible, exact fit |
| 7–20% | Re-rate at the capped edge, absorb the remainder as freeze/silence |
| > 20% | Refuse; report that the scene needs splitting or rewriting |

Free providers are re-synthesised (`edge --rate`, OpenAI `speed`, Kokoro `speed`). Paid providers are `atempo`-stretched instead, to avoid billing twice; `atempo` is chained so each stage stays inside its valid 0.5–2.0 range.

A visual longer than its narration gets **trailing silence**, never a trim. Truncating a half-finished interaction reads as a bug, and silence costs nothing.

## Assembly

Scenes are encoded identically and joined with the concat demuxer using stream copy — fast and lossless. Cross-fades are opt-in per scene because `xfade` forces a full re-encode and shortens total runtime by the fade duration at every join.

Narration is loudness-normalised (EBU R128, −16 LUFS) so scenes recorded with different providers match in level. Background music, if supplied, is ducked under the narration via sidechain compression — and is never bundled with the skill.
