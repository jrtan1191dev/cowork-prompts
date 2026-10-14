/**
 * presentation-producer :: core pure logic
 *
 * Dependency-free on purpose: every function here must be callable BEFORE
 * `bootstrap.mjs` has installed anything, and must be unit-testable with the
 * system `node` alone (no npm install, no ffmpeg).
 *
 * Design decisions encoded in this file (see SKILL.md > Design Record):
 *   D9  per-scene captureMode, screencast default
 *   D10 per-scene vertical strategy (native | reframe | letterbox)
 *   D11 declare intent, derive engine
 *   D13 the inelastic side dictates timing; tolerance bands for speech fitting
 *   D14 content-addressed cache keys
 */

import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

// ---------------------------------------------------------------------------
// CLI entry detection
// ---------------------------------------------------------------------------

/**
 * True when `metaUrl` (an `import.meta.url`) is the script node was asked to run.
 *
 * Must not be written as `metaUrl === \`file://${process.argv[1]}\``. That
 * template form compares a URL against a raw filesystem path, so it silently
 * fails wherever the two representations diverge:
 *   - Windows: argv[1] is `C:\repo\deck.mjs`, giving `file://C:\repo\deck.mjs`,
 *     while import.meta.url is `file:///C:/repo/deck.mjs`. Never equal, so the
 *     CLI body never runs and the process exits 0 having produced nothing.
 *   - Any platform: a path containing a space, `#` or `?` is percent-encoded in
 *     import.meta.url but not in the template, so a checkout under
 *     `/Users/me/My Projects/` breaks the same way.
 * pathToFileURL performs exactly the encoding import.meta.url uses.
 */
export function isMainModule(metaUrl) {
  const entry = process.argv[1];
  if (!entry) return false;
  return metaUrl === pathToFileURL(entry).href;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Playwright's screencast is a MediaRecorder/CDP stream: ~25fps, no config. */
export const SCREENCAST_SOURCE_FPS_CEILING = 25;

/** Speech-rate tolerance bands (D13). Fractions of the visual duration. */
export const RATE_FIT = {
  /** Below this, rate adjustment is perceptually inaudible. Absorb silently. */
  INAUDIBLE: 0.07,
  /** Above INAUDIBLE and below this, adjust at a capped rate and pad the rest. */
  CAP: 0.2,
};

/** Tail buffer so a transition never clips the final word (D13). */
export const TAIL_BUFFER_MS = 400;

/** Padding beyond this means the narration is too long for the visual (D13). */
export const PAD_WARN_MS = 5000;

export const DEFAULT_FPS = 30;

export const ASPECTS = {
  landscape: { width: 1920, height: 1080 },
  vertical: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
};

// ---------------------------------------------------------------------------
// Frames & durations
// ---------------------------------------------------------------------------

/**
 * Convert milliseconds to a whole number of frames.
 * Rounds to nearest so cumulative drift stays under half a frame per scene,
 * rather than always-up (ceil) which biases every scene long.
 */
export function msToFrames(ms, fps = DEFAULT_FPS) {
  if (!Number.isFinite(ms) || ms < 0) throw new RangeError(`bad ms: ${ms}`);
  if (!Number.isFinite(fps) || fps <= 0) throw new RangeError(`bad fps: ${fps}`);
  return Math.round((ms / 1000) * fps);
}

export function framesToMs(frames, fps = DEFAULT_FPS) {
  if (!Number.isInteger(frames) || frames < 0) throw new RangeError(`bad frames: ${frames}`);
  return (frames / fps) * 1000;
}

// ---------------------------------------------------------------------------
// D13 :: timing reconciliation — the inelastic side dictates
// ---------------------------------------------------------------------------

/**
 * Decide how to reconcile narration length against visual length.
 *
 * `stills` scenes have an elastic visual (a still can be held for any
 * duration at zero cost), so audio dictates and no speech re-rating happens.
 *
 * `screencast` scenes have an inelastic visual (a real click-and-wait takes
 * the time it takes), so speech is fitted to the visual within tolerance.
 *
 * @param {object} input
 * @param {number} input.audioMs   measured narration duration
 * @param {number} input.visualMs  measured (or intended) visual duration
 * @param {'stills'|'screencast'} input.captureMode
 * @returns {{
 *   mode: 'audio-dictates'|'speech-fit'|'speech-fit-capped'|'reject',
 *   sceneMs: number,       // authoritative scene duration
 *   ratePct: number,       // speech rate delta to apply, e.g. +6 => 6% faster
 *   padVisualMs: number,   // freeze/hold to append to the visual
 *   padAudioMs: number,    // trailing silence to append to the audio
 *   warnings: string[],
 * }}
 */
export function planTiming({ audioMs, visualMs, captureMode = 'screencast' }) {
  if (!Number.isFinite(audioMs) || audioMs <= 0) throw new RangeError(`bad audioMs: ${audioMs}`);
  const warnings = [];

  // --- Elastic visual: audio wins outright, hold the still to fit. ---------
  if (captureMode === 'stills') {
    const sceneMs = Math.round(audioMs + TAIL_BUFFER_MS);
    return {
      mode: 'audio-dictates',
      sceneMs,
      ratePct: 0,
      padVisualMs: sceneMs, // a still is synthesised for the whole scene
      padAudioMs: 0,
      warnings,
    };
  }

  if (!Number.isFinite(visualMs) || visualMs <= 0) throw new RangeError(`bad visualMs: ${visualMs}`);

  // Target: speech should occupy the visual minus the tail buffer, so the
  // transition never lands on the last syllable.
  const target = Math.max(visualMs - TAIL_BUFFER_MS, visualMs * 0.5);
  const ratio = audioMs / target; // >1 => speech is too long, must speed up
  const delta = ratio - 1;
  const absDelta = Math.abs(delta);

  // --- Within the inaudible band: rate-fit exactly, nothing else. ----------
  if (absDelta <= RATE_FIT.INAUDIBLE) {
    return {
      mode: 'speech-fit',
      sceneMs: Math.round(visualMs),
      ratePct: round1(delta * 100),
      padVisualMs: 0,
      padAudioMs: 0,
      warnings,
    };
  }

  // --- Beyond the cap: refuse to mangle the speech. ------------------------
  if (absDelta > RATE_FIT.CAP) {
    warnings.push(
      `narration is ${Math.round(absDelta * 100)}% ${delta > 0 ? 'longer' : 'shorter'} than the visual ` +
        `(limit ${Math.round(RATE_FIT.CAP * 100)}%). Split the scene or rewrite the narration.`
    );
    // Still produce a usable plan: cap the rate, absorb the remainder.
    const capped = Math.sign(delta) * RATE_FIT.CAP;
    const afterRate = audioMs / (1 + capped);
    const residual = afterRate - target;
    const plan = {
      mode: 'reject',
      sceneMs: Math.round(visualMs + Math.max(residual, 0)),
      ratePct: round1(capped * 100),
      padVisualMs: Math.round(Math.max(residual, 0)),
      padAudioMs: residual < 0 ? Math.round(Math.abs(residual)) : 0,
      warnings,
    };
    return plan;
  }

  // --- Middle band: cap the rate at the inaudible edge, pad the remainder. -
  const capped = Math.sign(delta) * RATE_FIT.INAUDIBLE;
  const afterRate = audioMs / (1 + capped);
  const residual = afterRate - target; // >0 => audio still longer than visual

  const padVisualMs = residual > 0 ? residual : 0;
  const padAudioMs = residual < 0 ? Math.abs(residual) : 0;

  if (padVisualMs > PAD_WARN_MS) {
    warnings.push(
      `visual must be frozen for ${Math.round(padVisualMs)}ms to cover the narration; ` +
        `consider splitting this scene.`
    );
  }

  return {
    mode: 'speech-fit-capped',
    sceneMs: Math.round(visualMs + padVisualMs),
    ratePct: round1(capped * 100),
    padVisualMs: Math.round(padVisualMs),
    padAudioMs: Math.round(padAudioMs),
    warnings,
  };
}

/**
 * Format a rate delta for a TTS provider.
 * edge-tts wants `+6%` / `-6%`; OpenAI wants a multiplier (1.06).
 */
export function formatRate(ratePct, provider) {
  const pct = round1(ratePct);
  switch (provider) {
    case 'edge':
      return `${pct >= 0 ? '+' : ''}${Math.round(pct)}%`;
    case 'openai':
    case 'elevenlabs':
    case 'kokoro':
      return clamp(1 + pct / 100, 0.5, 2).toFixed(3);
    default:
      return String(pct);
  }
}

// ---------------------------------------------------------------------------
// D9 :: screencast frame resampling to constant frame rate
// ---------------------------------------------------------------------------

/**
 * Normalise `page.screencast` onFrame timestamps to milliseconds from zero.
 *
 * ASSUMPTION (documented in references/capture-playwright.md): the CDP
 * screencast timestamp is monotonic seconds. We detect the unit rather than
 * trust it — if the observed span is implausibly small for the frame count,
 * the values were seconds; otherwise they were already milliseconds.
 */
export function normaliseTimestamps(timestamps) {
  if (!Array.isArray(timestamps) || timestamps.length === 0) return [];
  const first = timestamps[0];
  const span = timestamps[timestamps.length - 1] - first;
  // 2 frames/sec is the floor of any plausible screencast; if the span in raw
  // units is smaller than that implies, the unit must be seconds.
  const looksLikeSeconds = span < timestamps.length / 2;
  const scale = looksLikeSeconds ? 1000 : 1;
  return timestamps.map((t) => (t - first) * scale);
}

/**
 * Build a constant-frame-rate frame plan from variable-rate captured frames.
 *
 * For each output frame at t = i/fps, choose the most recent captured frame
 * whose timestamp <= t. This is nearest-previous (zero-order hold) resampling:
 * deterministic, never invents motion, and reproduces the same output for the
 * same input — which is what makes the D14 cache meaningful.
 *
 * @param {number[]} frameTimesMs normalised, ascending
 * @param {number} durationMs desired output duration
 * @param {number} fps target constant frame rate
 * @returns {number[]} for each output frame, the index into frameTimesMs
 */
export function resampleToCfr(frameTimesMs, durationMs, fps = DEFAULT_FPS) {
  if (!Array.isArray(frameTimesMs) || frameTimesMs.length === 0) return [];
  const total = Math.max(1, msToFrames(durationMs, fps));
  const out = new Array(total);
  let cursor = 0;
  for (let i = 0; i < total; i++) {
    const t = (i / fps) * 1000;
    while (cursor + 1 < frameTimesMs.length && frameTimesMs[cursor + 1] <= t) cursor++;
    out[i] = cursor;
  }
  return out;
}

// ---------------------------------------------------------------------------
// D10 :: vertical reframing geometry
// ---------------------------------------------------------------------------

/**
 * Compute the crop window for reframing a landscape capture into a portrait
 * (or square) output, centred on a region of interest when one is known.
 *
 * ROI comes free from Playwright's `locator.boundingBox()` on the acted
 * element, so "punch in on the panel being discussed" needs no authoring.
 *
 * @returns {{x:number,y:number,width:number,height:number,scale:number}}
 */
export function computeReframe({ srcW, srcH, dstW, dstH, roi = null, minScale = 1 }) {
  assertPositive({ srcW, srcH, dstW, dstH });
  const dstAspect = dstW / dstH;

  // Largest window with the destination aspect that still fits in the source.
  let cropH = srcH;
  let cropW = cropH * dstAspect;
  if (cropW > srcW) {
    cropW = srcW;
    cropH = cropW / dstAspect;
  }

  // Tighten toward the ROI so the subject fills more of the frame, but never
  // smaller than the ROI itself plus breathing room.
  if (roi && roi.width > 0 && roi.height > 0) {
    const pad = 0.18; // 18% breathing room around the subject
    const wantW = Math.min(srcW, roi.width * (1 + pad * 2));
    const wantH = Math.min(srcH, roi.height * (1 + pad * 2));
    let tryH = Math.max(wantH, wantW / dstAspect);
    let tryW = tryH * dstAspect;
    if (tryW > srcW) {
      tryW = srcW;
      tryH = tryW / dstAspect;
    }
    if (tryH <= srcH && tryW <= srcW) {
      cropW = Math.max(tryW, dstW / Math.max(minScale, 1));
      cropH = cropW / dstAspect;
      if (cropH > srcH) {
        cropH = srcH;
        cropW = cropH * dstAspect;
      }
    }
  }

  // Quantise BEFORE positioning, otherwise rounding the size after clamping the
  // origin can push the window outside the source. Round DOWN to an even number:
  // H.264 with yuv420p requires even dimensions, and flooring can never overflow.
  const width = toEven(Math.min(cropW, srcW));
  const height = toEven(Math.min(cropH, srcH));

  const centre = roi
    ? { x: roi.x + roi.width / 2, y: roi.y + roi.height / 2 }
    : { x: srcW / 2, y: srcH / 2 };

  const x = clamp(Math.round(centre.x - width / 2), 0, Math.max(0, srcW - width));
  const y = clamp(Math.round(centre.y - height / 2), 0, Math.max(0, srcH - height));

  return { x, y, width, height, scale: round3(dstW / width) };
}

/** Largest even integer <= n, floored at 2. */
function toEven(n) {
  return Math.max(2, Math.floor(n / 2) * 2);
}

/**
 * Choose the vertical strategy for a scene (D10).
 *   native    — capture at the portrait viewport (route is mobile-capable)
 *   reframe   — capture landscape, crop toward the ROI
 *   letterbox — capture landscape, letterbox into a branded canvas
 */
export function chooseVerticalStrategy(scene, hints = {}) {
  if (scene?.vertical?.strategy) return scene.vertical.strategy;
  if (hints.mobileCapable === true) return 'native';
  if (scene?.roi || hints.hasRoi) return 'reframe';
  return 'letterbox';
}

// ---------------------------------------------------------------------------
// D11 :: declare intent, derive engine
// ---------------------------------------------------------------------------

/**
 * Narrow the storyboard's declared outputs to the aspects actually wanted.
 *
 * Rendering every declared aspect on every run doubles compose time when only
 * one is needed, so `--aspect` is a filter over `meta.outputs`. An aspect the
 * storyboard never declared is still honoured (with default framing), because
 * asking for 9:16 from a 16:9 storyboard is a legitimate one-off request.
 *
 * Returns copies, never the manifest's own output objects: compose mutates
 * `output.strategy` when it degrades a reframe, and that must not leak back into
 * the committed source.
 *
 * @param {object} manifest
 * @param {string|null} requested  e.g. 'vertical', 'landscape,vertical', 'all'
 */
export function selectOutputs(manifest, requested = null) {
  const declared = manifest?.meta?.outputs ?? [{ aspect: 'landscape' }];
  if (!requested || requested === true || requested === 'all') return declared.map((o) => ({ ...o }));

  const wanted = [...new Set(String(requested).toLowerCase().split(',').map((a) => a.trim()).filter(Boolean))];
  const unknown = wanted.filter((a) => !ASPECTS[a]);
  if (unknown.length) {
    throw new Error(
      `unknown aspect "${unknown.join('", "')}" — expected ${Object.keys(ASPECTS).join(' | ')} ` +
        '(comma-separated) or "all"'
    );
  }
  return wanted.map((aspect) => ({ ...(declared.find((o) => o.aspect === aspect) ?? { aspect }) }));
}

/**
 * Pick the composition engine from what the requested output actually needs,
 * not from user preference. Returns the chosen engine plus the reason, so the
 * pipeline can report *why* (a hard requirement from the interview).
 *
 * @param {object} manifest
 * @param {{remotion?:boolean, ffmpeg?:boolean}} capabilities
 * @param {'remotion'|'ffmpeg'|null} override
 */
export function selectEngine(manifest, capabilities = {}, override = null) {
  const outputs = manifest?.meta?.outputs ?? [{ aspect: 'landscape' }];
  const needs = [];

  const captureAspect = manifest?.meta?.captureAspect ?? 'landscape';
  const reframes = outputs.filter((o) => {
    const strategy = o.strategy ?? (o.aspect === captureAspect ? 'native' : 'reframe');
    return o.aspect !== captureAspect && strategy !== 'native';
  });
  if (reframes.length > 0) needs.push('multi-aspect reframing');
  if (manifest?.meta?.kineticCaptions) needs.push('kinetic captions');
  if (manifest?.scenes?.some((s) => s.pip)) needs.push('picture-in-picture');
  if (manifest?.scenes?.some((s) => s.visualEngine === 'remotion_motion')) {
    needs.push('remotion_motion scenes');
  }

  const remotionRequired = needs.length > 0;

  if (override) {
    const ok = capabilities[override] !== false;
    return {
      engine: override,
      reason: `explicit --engine=${override} override`,
      degraded: override === 'ffmpeg' && remotionRequired ? needs : [],
      available: ok,
    };
  }

  if (remotionRequired) {
    if (capabilities.remotion === false) {
      return {
        engine: 'ffmpeg',
        reason: `requires ${needs.join(', ')} but Remotion is unavailable`,
        degraded: needs,
        available: capabilities.ffmpeg !== false,
      };
    }
    return { engine: 'remotion', reason: `requires ${needs.join(', ')}`, degraded: [], available: true };
  }

  return {
    engine: 'ffmpeg',
    reason: 'no feature requires a React compositor (single aspect, static captions)',
    degraded: [],
    available: capabilities.ffmpeg !== false,
  };
}

// ---------------------------------------------------------------------------
// D14 :: content-addressed cache keys
// ---------------------------------------------------------------------------

/** Stable JSON: object keys sorted recursively so hashing is order-independent. */
export function canonicalJson(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value ?? null);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  const keys = Object.keys(value).filter((k) => value[k] !== undefined).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(value[k])}`).join(',')}}`;
}

export function sha256(input) {
  return createHash('sha256').update(typeof input === 'string' ? input : canonicalJson(input)).digest('hex');
}

/** Short, human-scannable digest for ledger keys and filenames. */
export function digest(input, length = 12) {
  return sha256(input).slice(0, length);
}

/**
 * Audio is fully deterministic given text + voice settings, so it caches hard.
 */
export function audioCacheKey(scene, voice) {
  return digest({
    kind: 'audio',
    narration: scene.narration,
    provider: voice.provider,
    voiceId: voice.voiceId,
    rate: voice.rate ?? 0,
    ratePct: scene.ratePct ?? 0,
  });
}

/**
 * Capture is NOT deterministic across app versions: the same actionSpec against
 * a changed UI yields different pixels. `appVersion` therefore participates in
 * the key, and a null appVersion must force a miss (D14) — silently reusing a
 * clip of a UI that has since changed is the worst failure this tool can have.
 */
export function captureCacheKey(scene, appVersion) {
  if (appVersion == null || appVersion === '') return null; // forces re-capture
  return digest({
    kind: 'capture',
    id: scene.id,
    captureMode: scene.captureMode ?? 'screencast',
    viewport: scene.viewport ?? null,
    actionSpec: scene.actionSpec ?? null,
    assert: scene.assert ?? null,
    // Slide content is part of the pixels, so editing a card must rebuild the
    // clip. Without this a slide edit would reuse the previous render.
    slide: scene.slide ?? null,
    appVersion,
  });
}

export function composeCacheKey(scene, extras = {}) {
  return digest({
    kind: 'compose',
    id: scene.id,
    audio: scene.resolvedAudio?.hash ?? null,
    clip: scene.resolvedVisual?.hash ?? null,
    subtitle: scene.resolvedAudio?.subtitleHash ?? null,
    transition: scene.transition ?? null,
    ...extras,
  });
}

// ---------------------------------------------------------------------------
// Manifest validation (no zod: must run before any install)
// ---------------------------------------------------------------------------

const VISUAL_ENGINES = new Set([
  'playwright_web',
  'vhs_terminal',
  'marp_slides',
  'html_slides',
  'remotion_motion',
  'manual_footage',
]);
const CAPTURE_MODES = new Set(['screencast', 'stills']);
/** Engines whose pixels come from a rendered slide rather than a capture. */
export const SLIDE_ENGINES = new Set(['marp_slides', 'html_slides']);

/**
 * Validate a storyboard manifest. Returns a list of human-readable problems;
 * empty means valid. Deliberately permissive about extra fields so the schema
 * can grow without breaking older storyboards.
 */
export function validateManifest(manifest) {
  const errors = [];
  const push = (path, msg) => errors.push(`${path}: ${msg}`);

  if (!manifest || typeof manifest !== 'object') return ['manifest: not an object'];

  const meta = manifest.meta;
  if (!meta || typeof meta !== 'object') push('meta', 'missing');
  else {
    if (!meta.title) push('meta.title', 'missing');
    if (meta.fps != null && (!Number.isFinite(meta.fps) || meta.fps <= 0)) push('meta.fps', 'must be > 0');
    if (meta.captureAspect && !ASPECTS[meta.captureAspect]) {
      push('meta.captureAspect', `unknown aspect "${meta.captureAspect}" (expected ${Object.keys(ASPECTS).join('|')})`);
    }
    if (meta.outputs != null) {
      if (!Array.isArray(meta.outputs) || meta.outputs.length === 0) push('meta.outputs', 'must be a non-empty array');
      else {
        meta.outputs.forEach((o, i) => {
          if (!ASPECTS[o?.aspect]) push(`meta.outputs[${i}].aspect`, `unknown aspect "${o?.aspect}"`);
        });
      }
    }
    if (!meta.voice?.provider) push('meta.voice.provider', 'missing');
    if (meta.bgm && !meta.bgm.src) push('meta.bgm.src', 'bgm declared without a src');
  }

  // A slides presentation has no film, so it has no scenes — that is its correct
  // compiled shape, not an empty result. For a video, an empty scene list means
  // nothing would be rendered, so it stays an error.
  if (!Array.isArray(manifest.scenes) || (manifest.scenes.length === 0 && manifest.meta?.mode !== 'slides')) {
    push('scenes', 'must be a non-empty array');
    return errors;
  }

  const seen = new Set();
  manifest.scenes.forEach((scene, i) => {
    const at = `scenes[${i}]`;
    if (!scene?.id) push(`${at}.id`, 'missing');
    else if (seen.has(scene.id)) push(`${at}.id`, `duplicate id "${scene.id}"`);
    else seen.add(scene.id);

    if (!scene?.narration || !String(scene.narration).trim()) push(`${at}.narration`, 'missing');
    if (!VISUAL_ENGINES.has(scene?.visualEngine)) {
      push(`${at}.visualEngine`, `must be one of ${[...VISUAL_ENGINES].join('|')}`);
    }
    if (scene?.captureMode && !CAPTURE_MODES.has(scene.captureMode)) {
      push(`${at}.captureMode`, `must be one of ${[...CAPTURE_MODES].join('|')}`);
    }
    if (scene?.visualEngine === 'playwright_web') {
      const spec = scene.actionSpec;
      if (!spec) push(`${at}.actionSpec`, 'required for playwright_web');
      else if (spec.steps != null && !Array.isArray(spec.steps)) push(`${at}.actionSpec.steps`, 'must be an array');
    }
    if (scene?.visualEngine === 'manual_footage' && !scene?.actionSpec?.src) {
      // D8: manual footage is referenced by path and must fail loudly, not silently.
      push(`${at}.actionSpec.src`, 'manual_footage requires a src path');
    }
    if (SLIDE_ENGINES.has(scene?.visualEngine)) {
      // Slide scenes carry their content so one description drives both the
      // rendered deck and the video frame; without it there is nothing to draw.
      if (!scene?.slide && !scene?.actionSpec) {
        push(`${at}.slide`, `${scene.visualEngine} requires a slide block (compile it from storyline.yml)`);
      }
      if (scene?.captureMode && scene.captureMode !== 'stills') {
        push(`${at}.captureMode`, 'slide scenes are stills — padding a held slide is free and invisible');
      }
    }
    // Credentials must never enter committed source (D17).
    const specText = canonicalJson(scene?.actionSpec ?? {});
    if (/"(password|secret|token|apiKey|api_key)"\s*:/i.test(specText)) {
      push(`${at}.actionSpec`, 'looks like it contains a credential — use storageState or env vars instead');
    }
  });

  return errors;
}

/** Total runtime implied by resolved scene durations, for the outline gate. */
export function estimateRuntimeMs(manifest) {
  return (manifest?.scenes ?? []).reduce((acc, s) => {
    const ms = s.resolvedTiming?.sceneMs ?? s.estimatedMs ?? estimateNarrationMs(s.narration);
    return acc + ms;
  }, 0);
}

/**
 * Rough narration length before any TTS call, for the pre-spend outline gate.
 * 150 wpm is a common technical-narration pace; this is an estimate, not a
 * measurement, and is replaced by the probed duration after synthesis.
 */
export function estimateNarrationMs(text, wordsPerMinute = 150) {
  const words = String(text ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.round((words / wordsPerMinute) * 60_000);
}

// ---------------------------------------------------------------------------
// ffmpeg log parsers (D18) — pure, so they are unit-testable
// ---------------------------------------------------------------------------

/** Parse `-vf blackdetect` output into {start,end,duration} segments. */
export function parseBlackdetect(stderr) {
  const out = [];
  const re = /black_start:([\d.]+)\s+black_end:([\d.]+)\s+black_duration:([\d.]+)/g;
  let m;
  while ((m = re.exec(String(stderr ?? ''))) !== null) {
    out.push({ start: Number(m[1]), end: Number(m[2]), duration: Number(m[3]) });
  }
  return out;
}

/** Parse `-af silencedetect` output into {start,end,duration} segments. */
export function parseSilencedetect(stderr) {
  const text = String(stderr ?? '');
  const out = [];
  const re = /silence_start:\s*(-?[\d.]+)[\s\S]*?silence_end:\s*([\d.]+)\s*\|\s*silence_duration:\s*([\d.]+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    out.push({ start: Number(m[1]), end: Number(m[2]), duration: Number(m[3]) });
  }
  // A trailing silence_start with no matching end means silence to EOF.
  const dangling = /silence_start:\s*(-?[\d.]+)(?![\s\S]*silence_end)/.exec(text);
  if (dangling) out.push({ start: Number(dangling[1]), end: null, duration: null });
  return out;
}

/** Parse `-vf freezedetect` output into {start,end,duration} segments. */
export function parseFreezedetect(stderr) {
  const text = String(stderr ?? '');
  const out = [];
  const re = /freeze_start:\s*([\d.]+)/g;
  let m;
  while ((m = re.exec(text)) !== null) out.push({ start: Number(m[1]) });
  const ends = [...text.matchAll(/freeze_end:\s*([\d.]+)/g)].map((x) => Number(x[1]));
  ends.forEach((end, i) => {
    if (out[i]) {
      out[i].end = end;
      out[i].duration = round3(end - out[i].start);
    }
  });
  return out;
}

/** Parse the summary block emitted by `-af loudnorm=print_format=json`. */
export function parseLoudnorm(stderr) {
  const text = String(stderr ?? '');
  const start = text.lastIndexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return {
      inputI: Number(parsed.input_i),
      inputTp: Number(parsed.input_tp),
      inputLra: Number(parsed.input_lra),
      targetOffset: Number(parsed.target_offset),
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// D18 :: artifact assertions derived from the manifest, never hardcoded
// ---------------------------------------------------------------------------

/**
 * Build the expected-output assertions for one rendered file from the manifest.
 * The plan's hardcoded 1920x1080/>=5s is wrong now that 9:16 and 10-12min
 * outputs are supported, so every expectation is derived.
 */
export function expectationsFor(manifest, output) {
  const aspect = ASPECTS[output.aspect] ?? ASPECTS.landscape;
  const fps = manifest?.meta?.fps ?? DEFAULT_FPS;
  const expectedMs = estimateRuntimeMs(manifest);
  return {
    width: aspect.width,
    height: aspect.height,
    fps,
    // 2% + one second of slack absorbs encoder rounding and transition overlap.
    durationMs: expectedMs,
    durationToleranceMs: Math.max(1000, expectedMs * 0.02),
    requireAudio: true,
    requireSubtitleTrack: Boolean(manifest?.meta?.subtitles?.sidecar),
  };
}

/**
 * Compare a probed video against derived expectations.
 * @returns {{ok:boolean, failures:string[], warnings:string[]}}
 */
export function checkOutput(probe, expect) {
  const failures = [];
  const warnings = [];

  if (probe.width !== expect.width || probe.height !== expect.height) {
    failures.push(`resolution ${probe.width}x${probe.height}, expected ${expect.width}x${expect.height}`);
  }
  if (!probe.hasAudio && expect.requireAudio) failures.push('no audio stream');

  if (Number.isFinite(probe.durationMs) && Number.isFinite(expect.durationMs)) {
    const drift = Math.abs(probe.durationMs - expect.durationMs);
    if (drift > expect.durationToleranceMs) {
      warnings.push(
        `duration ${Math.round(probe.durationMs)}ms drifts ${Math.round(drift)}ms from the ` +
          `expected ${Math.round(expect.durationMs)}ms (tolerance ${Math.round(expect.durationToleranceMs)}ms)`
      );
    }
  }
  if (Number.isFinite(probe.fps) && Math.abs(probe.fps - expect.fps) > 0.5) {
    failures.push(`frame rate ${probe.fps}, expected ${expect.fps}`);
  }
  return { ok: failures.length === 0, failures, warnings };
}

/**
 * Per-scene audio/video drift check — the pipeline's core risk, and something
 * the plan's QA gate could not see.
 */
export function checkSceneSync(scenes, toleranceMs = 120) {
  const problems = [];
  for (const s of scenes) {
    const a = s.resolvedAudio?.durationMs;
    const v = s.resolvedVisual?.durationMs;
    if (!Number.isFinite(a) || !Number.isFinite(v)) continue;
    const expected = s.resolvedTiming?.sceneMs ?? Math.max(a, v);
    if (Math.abs(v - expected) > toleranceMs) {
      problems.push(
        `${s.id}: visual ${Math.round(v)}ms vs planned scene ${Math.round(expected)}ms ` +
          `(drift ${Math.round(v - expected)}ms)`
      );
    }
  }
  return problems;
}

// ---------------------------------------------------------------------------
// small helpers
// ---------------------------------------------------------------------------

export function clamp(n, lo, hi) {
  return Math.min(Math.max(n, lo), hi);
}
function round1(n) {
  return Math.round(n * 10) / 10;
}
function round3(n) {
  return Math.round(n * 1000) / 1000;
}
function assertPositive(obj) {
  for (const [k, v] of Object.entries(obj)) {
    if (!Number.isFinite(v) || v <= 0) throw new RangeError(`${k} must be > 0, got ${v}`);
  }
}
