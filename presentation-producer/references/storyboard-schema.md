# Storyboard schema

`storyboard.json` is a **committed lockfile, generated from `storyline.yml`**. It is regenerable and diffable, and it is not hand-edited — `compile.mjs` refuses to overwrite a storyboard carrying no `$generated` marker unless you pass `--force`. Author the storyline instead: `references/storyline-authoring.md`.

Two fields record its provenance:

```jsonc
{
  "$generated": "GENERATED FILE — do not edit. Source: storyline.yml. Regenerate with: node scripts/compile.mjs",
  "$source": { "file": "storyline.yml", "checksum": "…" }
}
```

It stays committed because that is where **cost** lives — scene count, durations, capture actions, total render time — and cost belongs in a pull request rather than a build directory. `git diff` on this file is still the change detector that decides which scenes get rebuilt.

Hand-authoring a storyboard remains supported for one-off videos with no deck. In that case, omit `$generated` and skip `compile.mjs`; every rule below still applies.

Validate before running anything (no install required — this is the one place the dependency-free validator earns its keep):

```bash
node -e "import('./<skill-root>/scripts/lib/core.mjs').then(async m => {
  const s = JSON.parse(require('fs').readFileSync('presentations/<slug>/storyboard.json','utf8'));
  const e = m.validateManifest(s); console.log(e.length ? e.join('\n') : 'valid');
})"
```

## Top level

```jsonc
{
  "meta": { /* … */ },
  "scenes": [ /* … */ ]
}
```

## `meta`

| Field | Type | Default | Notes |
|---|---|---|---|
| `title` | string | **required** | Also the output filename slug. |
| `fps` | number | `30` | Timeline frame rate. Screencast source is ~25fps and is resampled up to this. |
| `captureAspect` | `landscape` \| `vertical` \| `square` | `landscape` | The aspect actually recorded. Other outputs are derived from it. |
| `outputs` | array | `[{aspect:"landscape"}]` | One entry per file to produce. |
| `outputs[].aspect` | `landscape` \| `vertical` \| `square` | — | 1920×1080 / 1080×1920 / 1080×1080. |
| `outputs[].strategy` | `native` \| `reframe` \| `letterbox` | auto | How to reach this aspect from `captureAspect`. See `composition.md`. |
| `voice.provider` | `auto` \| `kokoro` \| `gemini` \| `openai` \| `elevenlabs` \| `edge` \| `system` | `auto` | `auto` prefers local Kokoro. |
| `voice.gender` | `female` \| `male` | `female` | Picks the narrator voice for whichever provider runs. Overrides `voiceId`, and `--voice-gender` overrides this. |
| `voice.voiceId` | string | resolved from `gender` | Escape hatch for a specific voice, e.g. `af_bella` (Kokoro), `Charon` (Gemini), `sage` (OpenAI). Ignored when a gender is requested. |
| `voice.model` | string | provider default | e.g. `gemini-2.5-flash-preview-tts`. |
| `subtitles.enabled` | boolean | `true` | Captions are burned in. |
| `subtitles.sidecar` | boolean | `false` | Also emit a whole-video `.srt` next to the MP4. |
| `subtitles.style` | object | — | Overrides derived placement. camelCase keys are layout (`fontSize`, `marginV`, `marginH`, `maxCharsPerLine`, `maxLines`); PascalCase keys are raw ASS style fields (`Fontname`, `PrimaryColour`, `BackColour`). Use sparingly; the defaults are aspect-aware. |
| `subtitles.fontsDir` | string | — | Directory of bundled fonts, handed to ffmpeg as `fontsdir`. Pair with `subtitles.style.Fontname`. |
| `kineticCaptions` | boolean | `false` | Forces the Remotion engine. |
| `fixedTime` | ISO string | — | Freezes the page clock so relative timestamps are reproducible. |
| `background` | CSS colour | `#0f172a` | Letterbox bars and Remotion backdrop. |
| `baseUrl` | string | — | Default target; `--baseUrl` overrides. |
| `bgm.src` | path | — | Never bundled. Check your rights; platforms fingerprint audio. |
| `mode` | `slides` \| `video` | `video` | Which kind of presentation compiled this storyboard. A `slides` storyboard has an empty `scenes` array by design. |
| `deck.archetype` | string | — | `scr` when the presentation declares it. Written by `compile.mjs`. |
| `deck.engine` | `html` \| `marp` | `html` | Which renderer produced the slide PNGs. |
| `deck.theme` | `light` \| `dark` | `light` | Also drives the `background` default, so letterbox bars match the deck. |
| `deck.formats` | array | `[png, pdf]` | Deck artifacts to emit. `html` is the hand-off for external PowerPoint conversion. |
| `deck.orientations` | array | — | **Slides only.** The deck-level canvas set, compiled from `presentation.orientations`. Absent for a video presentation, whose deck follows `outputs`. |

## `scenes[]`

| Field | Type | Notes |
|---|---|---|
| `id` | string | **required, unique.** Used for filenames and cache keys. Keep it stable — renaming forces a rebuild. |
| `title` | string | Human label; also the default chapter card title. |
| `narration` | string | **required.** Spoken text. One idea per scene. |
| `visualEngine` | `playwright_web` \| `vhs_terminal` \| `marp_slides` \| `html_slides` \| `remotion_motion` \| `manual_footage` | **required.** |
| `captureMode` | `screencast` \| `stills` | Default `screencast`; slide engines are always `stills`. |
| `viewport` | `{width,height}` | Overrides the capture aspect — this is how `strategy:"native"` vertical works. |
| `roiSelector` | string | Element whose bounding box drives vertical reframing. |
| `roi` | `{x,y,width,height}` | Written back automatically from the last acted element. |
| `vertical.strategy` | `native` \| `reframe` \| `letterbox` | Per-scene override. |
| `chapter` | `{title,description,durationMs}` | Native chapter card — replaces a separate title slide. |
| `assert` | object | **Write this.** See below. |
| `pip` | `{src,position,scale}` | Picture-in-picture. Forces Remotion. |
| `useFootageAudio` | boolean | For `manual_footage` that carries its own audio; skips TTS and keeps the take's audio, loudness-matched to the narration target. |
| `slide` | object | Slide content for `html_slides` / `marp_slides`: `layout`, `theme`, `title`, `pill`, `body`, `cards[]`, `stat`, `notes`. Compiled from `storyline.yml`; participates in the capture cache key, so editing a card rebuilds that clip. |
| `role` | `situation` \| `complication` \| `resolution` | Carried through from the deck when the SCR archetype is active. |
| `actionSpec.trim` | `{in,out}` seconds | `manual_footage` only. Cuts before scaling, so a long recording can be used for the beat it is needed for. |
| `actionSpec.generate` | object | `manual_footage` provenance: `provider`, `prompt`, `seed`, `durationSec`. Documentation, not a per-run instruction — the file is the input. |
| `actionSpec` | object | Engine-specific; see below. |
| `transition` | `{type,durationSec}` | Optional. Default is a hard cut — cross-fades force a full re-encode and shorten total runtime. |

Fields the pipeline writes back (do not hand-edit): `resolvedAudio`, `resolvedVisual`, `resolvedTiming`, `ratePct`, `roi`.

### `assert` — the highest-value four lines in the file

```jsonc
"assert": {
  "visible":          ["Bed Allocation Queue", "P101"],
  "visibleSelectors": ["#queue-table tbody tr"],
  "notVisible":       ["Something went wrong", "Sign in"]
}
```

Checked **before** recording. Without it, a capture of a 404, a login screen, a stuck spinner or an empty table passes every downstream check — correct resolution, has audio, not black. A failed assertion aborts the run; with the per-scene cache, the re-run after a fix costs only that scene.

### `actionSpec` for `playwright_web`

```jsonc
{
  "url": "/bmu",
  "waitUntil": "networkidle",
  "setupScript": "scenes/seed-bmu.mjs",
  "roiSelector": "#recommendations",
  "showActions": true,
  "actionLabelPosition": "top-right",
  "tailMs": 700,
  "steps": [
    { "action": "fill", "label": "Override reason", "target": "Override reason",
      "value": "Telemetry capacity", "typeDelayMs": 55 },
    { "action": "click", "role": "button", "name": "Approve",
      "target": "Approve", "delayMs": 600 },
    { "action": "waitForText", "value": "Allocation approved" },
    { "action": "highlight", "selector": "#status", "target": "Allocation approved", "delayMs": 1800 }
  ]
}
```

Step actions: `navigate`, `click`, `fill`, `press`, `scroll`, `wait`, `waitForText`, `highlight`, `callout`.

**Targeting.** Give a semantic locator (`role`+`name`, `text`, `label`, `testId`) *and* a human `target` description. The locator is tried first; if it no longer matches, the description is resolved against the live accessibility tree, the substitution is **reported**, and the storyboard is rewritten. A renamed button therefore degrades gracefully without drifting silently.

**`setupScript`** receives `{ page, context, scene }` before navigation — the only way to express state an SPA reads at bootstrap:

```js
export default async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('role', 'BMU_COORDINATOR'));
};
```

It executes arbitrary code, so treat a storyboard from an untrusted source the way you would treat any script.

### Other engines

```jsonc
// vhs_terminal — degrades to a styled code slide when VHS is unavailable
{ "theme": "catppuccin-mocha", "fontSize": 24,
  "commands": [{ "type": "type", "arg": "mvn test", "delayMs": 80 }, { "type": "enter" }, { "type": "sleep", "arg": "4s" }] }

// marp_slides / html_slides — compiled from storyline.yml, not hand-written
{ "layout": "comparison", "theme": "light", "title": "The agreement is the bottleneck",
  "cards": [{ "icon": "phone-off", "title": "Today", "text": "Coordinators chase consensus." },
            { "icon": "gauge", "title": "What it costs", "text": "Beds sit empty." }] }

// manual_footage — referenced by path; a missing file fails loudly
{ "src": "footage/founder-intro.mov", "trim": { "in": 1.2, "out": 9.4 } }

// remotion_motion
{ "componentName": "FeatureCard", "props": { "headline": "Zero phone calls" } }
```

## Minimal working example

```jsonc
{
  "meta": {
    "title": "Bed Allocation Walkthrough",
    "fps": 30,
    "captureAspect": "landscape",
    "outputs": [{ "aspect": "landscape" }, { "aspect": "vertical", "strategy": "reframe" }],
    "voice": { "provider": "auto" },
    "subtitles": { "enabled": true },
    "fixedTime": "2026-01-15T09:00:00.000Z",
    "baseUrl": "http://127.0.0.1:8080"
  },
  "scenes": [
    {
      "id": "01-queue",
      "narration": "The coordinator sees every waiting patient ranked by severity.",
      "visualEngine": "playwright_web",
      "captureMode": "stills",
      "actionSpec": { "url": "/bmu", "roiSelector": "#queue" },
      "assert": { "visible": ["Bed Allocation"], "notVisible": ["Sign in"] }
    },
    {
      "id": "02-approve",
      "narration": "Approving an allocation takes one click, and the ward is notified immediately.",
      "visualEngine": "playwright_web",
      "captureMode": "screencast",
      "roiSelector": "#recommendations",
      "actionSpec": {
        "url": "/bmu",
        "steps": [{ "action": "click", "role": "button", "name": "Approve", "target": "Approve", "delayMs": 800 }]
      },
      "assert": { "visible": ["Approve"], "notVisible": ["Something went wrong"] }
    }
  ]
}
```

## Authoring rules that materially change quality

1. **One action per scene.** With scene-level alignment, this is what makes the click land on the word describing it.
2. **Write narration for the ear.** Short sentences. No parentheticals. Numbers as words when spoken.
3. **10–20 seconds per scene.** If narration needs a >20% speech-rate change to fit the visual, the pipeline refuses and tells you to split the scene.
4. **Stable ids.** They are cache keys; renaming rebuilds.
5. **Reserve `screencast` for real motion.** Content that updates by itself is the one thing stills genuinely cannot show.
