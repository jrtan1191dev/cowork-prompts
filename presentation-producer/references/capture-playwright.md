# Web capture with Playwright

## Use the first-party screencast API

Playwright 1.63.0 ships `page.screencast`, which supersedes the custom cursor injection, ripple keyframes and highlight helpers that older guides recommend. Verified surface:

| API | Purpose |
|---|---|
| `start({ path, onFrame, size, quality })` | Record to file, or receive JPEG frames **with timestamps**, or both |
| `stop()` | Finalise |
| `showActions({ cursor, duration, fontSize, position })` | Animated pointer that travels **from the previous action point to the next**, plus an action-title label |
| `showChapter(title, { description, duration })` | Centred chapter card with blurred backdrop |
| `showOverlay(html, { duration })` | Arbitrary HTML callout; returns a disposable |
| `hideOverlays()` / `hideActions()` | Temporarily suppress |

Overlays are `pointer-events: none`, so they never block the clicks happening underneath. `locator.pressSequentially(text, { delay })` gives natural typing without a bespoke loop.

Do not reimplement any of this. Custom cursor code was the single largest block of avoidable work in the original plan.

## Frame rate: why frames, not `recordVideo`

`recordVideo` is a MediaRecorder screencast. It **caps near 25fps with no configuration option** and is variable-rate. Remotion refuses variable frame rate outright: "you must specify a constant frame rate for your composition." Feeding a VFR WebM into a 30fps timeline produces judder or rejection.

So capture collects frames via `onFrame` and resamples them:

1. Normalise timestamps to milliseconds from zero (the unit is detected, not assumed).
2. For each output frame at `t = i/fps`, pick the most recent captured frame with `timestamp <= t` — zero-order hold. It never invents motion and is deterministic, which is what makes the content-addressed cache meaningful.
3. Encode the resampled sequence at exactly `fps` with `-fps_mode cfr`.

A ~25fps source at a 30fps timeline duplicates roughly one frame in five. That is correct and unavoidable; the alternative is drift.

If you genuinely need smoother motion than the source allows, the known technique is to slow the application down, record longer, and speed up in post with `setpts`. That works for a self-contained animation loop but not for an app whose real network latency does not slow with it.

## Authentication

Credentials must never enter `storyboard.json` — it is committed, and validation rejects credential-looking fields.

**Preferred: `storageState`.** Capture it once by hand into `.runtime/auth.json` (gitignored), and every context loads it. Covers form login, OAuth and cookie sessions:

```js
// one-off, run headed, log in manually, then save
const ctx = await browser.newContext();
await ctx.newPage().goto('http://localhost:8080');
// …log in by hand…
await ctx.storageState({ path: 'presentations/<slug>/.runtime/auth.json' });
```

**When state must exist before the app bootstraps**, `storageState` is not enough — an SPA that reads `localStorage` during its first render needs the value present beforehand. That is what `setupScript` is for:

```js
export default async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('role', 'BMU_COORDINATOR'));
};
```

This is a real pattern, not a hypothetical: header- or storage-driven role switching is common in prototypes, and no combination of `navigate`/`click`/`fill` steps can express it.

## Determinism

Three things make two runs produce the same pixels:

1. **`fixedTime`** installs a fixed page clock. Without it, any relative timestamp ("waiting 45 min", "2 minutes ago") differs every run, so you can never diff two outputs to confirm a change. This is what makes the output a build artifact rather than a recording.
2. **`animations: 'disabled'`** on stills stops CSS animations and transitions and fast-forwards them. Any looping `animate-pulse`/`animate-ping`/`animate-spin` element otherwise gets captured at a random phase.
3. **`appVersion`** participates in the capture cache key. When it cannot be resolved from git, the pipeline asks; with no TTY it re-captures. Reusing a clip of a UI that has since changed is the worst failure available to this tool, because the result is confidently wrong.

A dirty git tree is treated as its own version, since `HEAD` no longer describes what is running.

## Preconditions

```jsonc
"assert": {
  "visible":    ["Bed Allocation Queue", "P101"],
  "notVisible": ["Something went wrong", "Sign in"]
}
```

This is the only layer that can catch a wrong-content capture. `ffprobe` sees resolution, duration and streams; `blackdetect` sees black frames. None of them see a white error page, an expired session redirect, an empty table, or a spinner that never resolved.

A failed assertion **aborts the run** rather than skipping the scene: a missing scene silently changes the narrative, and the cache makes the re-run cheap.

## Region of interest

`roiSelector`, or the last acted element, provides a bounding box that drives vertical reframing. This is why "punch in on the panel being discussed" needs no manual authoring — the crop window follows what the narration is about.

## App lifecycle

The skill does **not** assume it knows how to start your app. Default: point `--baseUrl` at something already running. Optionally supply a start command and health URL and the skill will manage the lifecycle.

Note that `webServer` is a feature of `@playwright/test`, the test runner — not of the `playwright` library this pipeline uses. Lifecycle is therefore the skill's own concern.

A fresh boot is worth preferring when your app seeds deterministic data at startup: it gives every run the same baseline.

## Selector durability

Order of preference:

1. `role` + `name` — survives restyling, reads like the UI.
2. `label`, `text` — fine, but breaks when copy changes and is language-dependent.
3. `testId` — most stable, but requires changing the app, which most users will decline.
4. `target` description — the fallback, resolved against the live accessibility tree when the stored locator misses.

The fallback **reports** every substitution and rewrites the storyboard with what actually matched, so drift is visible in a diff rather than silent.
