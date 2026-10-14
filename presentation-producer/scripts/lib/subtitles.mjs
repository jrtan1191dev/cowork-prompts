/**
 * presentation-producer :: subtitles (burned-in, aspect-aware)
 *
 * DECISION: captions are burned into the picture, and their placement is
 * derived from the output aspect ratio and the vertical strategy — not fixed.
 *
 * Why placement must vary:
 *   - 16:9 is watched on a large screen; captions sit just above the lower edge.
 *   - 9:16 is watched on a phone where platform chrome (username, caption text,
 *     CTA buttons) occupies roughly the bottom fifth, so captions must ride
 *     higher or they are covered.
 *   - 9:16 letterbox has a genuinely better home: the empty bar *below* the
 *     footage, where captions never occlude the UI being demonstrated.
 *   - Narrow frames need shorter lines, so the cue text is re-wrapped per
 *     aspect rather than reused verbatim.
 *
 * Three correctness details this module exists to handle:
 *   1. Kokoro (the default provider) emits no SRT, so cues are synthesised
 *      from the text and the measured audio duration.
 *   2. Speech re-rating (D13) invalidates any provider-supplied SRT timings,
 *      so cues are scaled by the same factor applied to the audio.
 *   3. Burn-in is authored as ASS with an explicit script resolution, because
 *      SRT has no way to state one. See ASS_SCRIPT_RESOLUTION_NOTE below: this
 *      was a real, shipped bug, not a theoretical concern.
 */

import { ASPECTS } from './core.mjs';

// ---------------------------------------------------------------------------
// Placement
// ---------------------------------------------------------------------------

/** libass alignment (numpad layout): 2 = bottom-centre, 5 = middle-centre. */
export const ALIGN_BOTTOM_CENTRE = 2;

/**
 * ASS_SCRIPT_RESOLUTION_NOTE — why burn-in is ASS and not SRT.
 *
 * SRT carries no geometry, so ffmpeg's `subtitles` filter converts it using
 * libavcodec's default ASS header, whose script resolution is 384x288. libass
 * then scales the script to the frame, multiplying every pixel value by
 * frameHeight/288. On 1080p that is 3.75x: a FontSize of 40 renders at 150px
 * and a single word fills the frame. On 1080x1920 the multiplier is 6.67x,
 * which pushed MarginV 400 to 2667px and dropped the captions off-frame
 * entirely — captions silently absent, which no probe could see.
 *
 * Declaring PlayResX/PlayResY as the real frame size makes libass scale 1:1, so
 * every value in SUBTITLE_LAYOUTS means exactly the pixels it says.
 */
export const ASS_HEADER_WRAP_STYLE = 0; // 0 = smart wrap, lines balanced top-heavy

/**
 * Caption box fill, matching the Remotion path's rgba(15, 23, 42, 0.86).
 * ASS colours are &HAABBGGRR with alpha inverted (00 = opaque), so 0.86 opacity
 * is alpha 0x24 over slate #0F172A.
 */
export const CAPTION_BOX_COLOUR = '&H242A170F';

/** Default caption box opacity, kept as the one place the 0.86 above is stated. */
export const CAPTION_BOX_OPACITY = 0.86;

/**
 * Convert `#RRGGBB` to an ASS `&HAABBGGRR` colour.
 *
 * Exists so a brand colour can reach a burned-in caption. Three traps are
 * handled here rather than at each call site: ASS orders the channels BGR not
 * RGB, its alpha is INVERTED (0x00 is opaque, 0xFF is transparent), and every
 * field is fixed-width hex — a missing pad silently shifts the whole colour.
 *
 * Returns null for anything it cannot parse, so a brand using `oklch()` or a
 * colour keyword falls back to the slate default rather than emitting a
 * malformed style line that ffmpeg would reject mid-render. Only hex is accepted
 * because ASS cannot express a colour space and the browser is not available
 * here to compute one.
 */
export function hexToAssColour(hex, opacity = 1) {
  if (typeof hex !== 'string') return null;
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
  const rr = h.slice(0, 2);
  const gg = h.slice(2, 4);
  const bb = h.slice(4, 6);
  const clamped = Math.min(1, Math.max(0, Number(opacity)));
  const alpha = Math.round((1 - clamped) * 255);
  const aa = alpha.toString(16).padStart(2, '0');
  return `&H${(aa + bb + gg + rr).toUpperCase()}`;
}

/**
 * Machine-agnostic caption font.
 *
 * ASS has a single Fontname field and no fallback list, so the family named
 * here must resolve on every target OS or line wrapping changes per machine.
 * Arial ships with Windows and macOS, and fontconfig substitutes the
 * metric-compatible Liberation Sans on Linux — so glyph advances, and therefore
 * wrapping, stay consistent across all three. Override via
 * `meta.subtitles.style.Fontname` when a project bundles its own font.
 */
export const CAPTION_FONT = 'Arial';

/**
 * Caption layout per aspect, in real output pixels (see
 * ASS_SCRIPT_RESOLUTION_NOTE for why "real" needs saying).
 */
export const SUBTITLE_LAYOUTS = {
  landscape: {
    fontSize: 44,      // ~4% of 1080: readable on a laptop, ~2 lines of 46 chars
    marginV: 64,       // ~6% of 1080: clear of the edge, out of the content
    marginH: 200,      // keeps the caption block over the centre third
    maxCharsPerLine: 46,
    maxLines: 2,
  },
  vertical: {
    fontSize: 52,      // larger: vertical video is watched on a small screen
    marginV: 400,      // ~21% of 1920: above TikTok/Reels/Shorts UI chrome
    marginH: 64,
    maxCharsPerLine: 26,
    maxLines: 3,
  },
  square: {
    fontSize: 46,
    marginV: 140,
    marginH: 80,
    maxCharsPerLine: 32,
    maxLines: 2,
  },
};

/**
 * Resolve the caption layout for one output.
 *
 * @param {object} output          e.g. { aspect: 'vertical', strategy: 'letterbox' }
 * @param {object} [overrides]     manifest-level meta.subtitles overrides
 * @returns {{fontSize:number, marginV:number, marginH:number,
 *            maxCharsPerLine:number, maxLines:number, alignment:number,
 *            placement:string}}
 */
export function subtitleLayoutFor(output = {}, overrides = {}) {
  const aspectName = output.aspect ?? 'landscape';
  const base = SUBTITLE_LAYOUTS[aspectName] ?? SUBTITLE_LAYOUTS.landscape;
  const dims = ASPECTS[aspectName] ?? ASPECTS.landscape;
  const layout = { ...base, alignment: ALIGN_BOTTOM_CENTRE, placement: 'over-content' };

  // Letterboxed vertical output has an empty bar under the footage. Put the
  // captions there: they never cover the UI being demonstrated.
  if (aspectName !== 'landscape' && output.strategy === 'letterbox') {
    const source = ASPECTS.landscape;
    const scaled = Math.round((dims.width / source.width) * source.height); // footage height once scaled
    const barHeight = Math.max(0, dims.height - scaled);
    if (barHeight > base.fontSize * 2.5) {
      // Centre the captions inside the lower bar.
      const lowerBar = Math.floor(barHeight / 2);
      layout.marginV = Math.max(48, Math.round(lowerBar / 2 - base.fontSize / 2));
      layout.placement = 'letterbox-bar';
    }
  }

  return { ...layout, ...stripUndefined(overrides) };
}

/**
 * Build ASS style overrides from the manifest's caption settings.
 *
 * `meta.subtitles.colours` is renderer-neutral hex (see `brandedSubtitles` in
 * lib/deck.mjs); this is the ASS edge that converts it. A colour the format
 * cannot express — `oklch()`, a keyword — yields null and is dropped, leaving
 * the slate default rather than emitting a malformed style line that would fail
 * the burn mid-render.
 *
 * An authored `meta.subtitles.style` is applied last and therefore always wins:
 * a project that has already tuned its captions in raw ASS keeps that tuning.
 */
export function assStyleOverrides(subtitlesMeta) {
  const colours = subtitlesMeta?.colours ?? null;
  const authored = subtitlesMeta?.style ?? {};
  if (!colours) return authored;

  const box = hexToAssColour(colours.box, CAPTION_BOX_OPACITY);
  const text = hexToAssColour(colours.text);
  return {
    ...(box ? { BackColour: box } : {}),
    ...(text ? { PrimaryColour: text } : {}),
    ...authored,
  };
}

/**
 * Translate a layout into ASS V4+ style fields.
 *
 * BorderStyle 4 draws one opaque box behind the whole cue, painted in
 * BackColour — verified as the only variant that produces a single tidy block
 * (BorderStyle 3 pads each line separately and leaves ragged edges, and
 * BorderStyle 1 is outline-only, which disappears over a light dashboard).
 */
export function layoutToAssStyle(layout, style = {}) {
  return {
    Fontname: CAPTION_FONT,
    Fontsize: layout.fontSize,
    PrimaryColour: '&H00FFFFFF',
    OutlineColour: '&H00000000',
    BackColour: CAPTION_BOX_COLOUR,
    Bold: -1,          // ASS booleans are -1/0, not 1/0
    BorderStyle: 4,
    Outline: 0,        // with BorderStyle 4 this only adds a glyph edge
    Shadow: 0,
    Alignment: layout.alignment,
    MarginL: layout.marginH,
    MarginR: layout.marginH,
    MarginV: layout.marginV,
    ...stripUndefined(style),
  };
}

/** ASS V4+ Style field order. The Format line and every Style line must match. */
const ASS_STYLE_FIELDS = [
  'Name', 'Fontname', 'Fontsize', 'PrimaryColour', 'SecondaryColour', 'OutlineColour', 'BackColour',
  'Bold', 'Italic', 'Underline', 'StrikeOut', 'ScaleX', 'ScaleY', 'Spacing', 'Angle',
  'BorderStyle', 'Outline', 'Shadow', 'Alignment', 'MarginL', 'MarginR', 'MarginV', 'Encoding',
];

const ASS_STYLE_DEFAULTS = {
  Name: 'Default',
  Fontname: CAPTION_FONT,
  Fontsize: 44,
  PrimaryColour: '&H00FFFFFF',
  SecondaryColour: '&H000000FF',
  OutlineColour: '&H00000000',
  BackColour: CAPTION_BOX_COLOUR,
  Bold: 0, Italic: 0, Underline: 0, StrikeOut: 0,
  ScaleX: 100, ScaleY: 100, Spacing: 0, Angle: 0,
  BorderStyle: 4, Outline: 0, Shadow: 0,
  Alignment: ALIGN_BOTTOM_CENTRE,
  MarginL: 0, MarginR: 0, MarginV: 0,
  Encoding: 1,
};

/**
 * Render cues as an ASS subtitle file sized to the output frame.
 *
 * @param {Cue[]} cues
 * @param {object} style      fields from layoutToAssStyle()
 * @param {{width:number, height:number}} frame  the real output dimensions
 */
export function formatAss(cues, style, frame) {
  const merged = { ...ASS_STYLE_DEFAULTS, ...stripUndefined(style) };
  const styleLine = ASS_STYLE_FIELDS.map((f) => merged[f]).join(',');
  const events = cues.map(
    (c) =>
      `Dialogue: 0,${msToAssTime(c.startMs)},${msToAssTime(c.endMs)},${merged.Name},,0,0,0,,${escapeAssText(c.text)}`
  );

  return [
    '[Script Info]',
    'ScriptType: v4.00+',
    `PlayResX: ${frame.width}`,
    `PlayResY: ${frame.height}`,
    `WrapStyle: ${ASS_HEADER_WRAP_STYLE}`,
    'ScaledBorderAndShadow: yes',
    '',
    '[V4+ Styles]',
    `Format: ${ASS_STYLE_FIELDS.join(', ')}`,
    `Style: ${styleLine}`,
    '',
    '[Events]',
    'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
    ...events,
    '',
  ].join('\n');
}

/** ASS timecode: h:mm:ss.cc, centiseconds, single-digit hour. */
export function msToAssTime(ms) {
  const cs = Math.max(0, Math.round(ms / 10));
  const h = Math.floor(cs / 360_000);
  const min = Math.floor((cs % 360_000) / 6000);
  const s = Math.floor((cs % 6000) / 100);
  return `${h}:${pad(min, 2)}:${pad(s, 2)}.${pad(cs % 100, 2)}`;
}

/** Braces open an override block in ASS, so narration must never emit them raw. */
function escapeAssText(text) {
  return String(text ?? '').replace(/[{}]/g, '').replace(/\r?\n/g, '\\N');
}

// ---------------------------------------------------------------------------
// SRT parse / format
// ---------------------------------------------------------------------------

/** @typedef {{index:number, startMs:number, endMs:number, text:string}} Cue */

export function parseSrt(text) {
  const cues = [];
  const blocks = String(text ?? '').replace(/\r\n/g, '\n').trim().split(/\n{2,}/);
  for (const block of blocks) {
    if (!block.trim()) continue;
    const lines = block.split('\n');
    // The index line is optional in the wild; detect the timing line instead.
    const timingIdx = lines.findIndex((l) => /-->/.test(l));
    if (timingIdx === -1) continue;
    const m = /(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})/.exec(lines[timingIdx]);
    if (!m) continue;
    const body = lines.slice(timingIdx + 1).join('\n').trim();
    if (!body) continue;
    cues.push({
      index: cues.length + 1,
      startMs: timecodeToMs(m[1]),
      endMs: timecodeToMs(m[2]),
      text: body,
    });
  }
  return cues;
}

export function formatSrt(cues) {
  return `${cues
    .map((c, i) => `${i + 1}\n${msToTimecode(c.startMs)} --> ${msToTimecode(c.endMs)}\n${c.text}`)
    .join('\n\n')}\n`;
}

export function timecodeToMs(tc) {
  const m = /(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})/.exec(String(tc));
  if (!m) return NaN;
  const ms = m[4].padEnd(3, '0');
  return Number(m[1]) * 3_600_000 + Number(m[2]) * 60_000 + Number(m[3]) * 1000 + Number(ms);
}

export function msToTimecode(ms) {
  const clamped = Math.max(0, Math.round(ms));
  const h = Math.floor(clamped / 3_600_000);
  const min = Math.floor((clamped % 3_600_000) / 60_000);
  const s = Math.floor((clamped % 60_000) / 1000);
  const rest = clamped % 1000;
  return `${pad(h, 2)}:${pad(min, 2)}:${pad(s, 2)},${pad(rest, 3)}`;
}

// ---------------------------------------------------------------------------
// Cue transforms
// ---------------------------------------------------------------------------

/**
 * Scale cue timings by a factor.
 *
 * Needed because D13 re-rates speech to fit an inelastic visual: a provider's
 * SRT describes the *unrated* audio, so reusing it desynchronises the captions.
 * factor = 1 / (1 + ratePct/100) — faster speech means earlier cues.
 */
export function scaleCues(cues, factor) {
  if (!Number.isFinite(factor) || factor <= 0) throw new RangeError(`bad factor: ${factor}`);
  return cues.map((c) => ({ ...c, startMs: Math.round(c.startMs * factor), endMs: Math.round(c.endMs * factor) }));
}

/** Convert a speech rate delta into the cue-scaling factor. */
export function rateToCueFactor(ratePct) {
  return 1 / (1 + (ratePct ?? 0) / 100);
}

/** Offset cues, for assembling a whole-video sidecar from per-scene SRTs. */
export function shiftCues(cues, offsetMs) {
  return cues.map((c) => ({ ...c, startMs: c.startMs + offsetMs, endMs: c.endMs + offsetMs }));
}

/** Clamp cues so none outlast the scene (a check the QA gate also asserts). */
export function clampCues(cues, durationMs) {
  return cues
    .filter((c) => c.startMs < durationMs)
    .map((c) => ({ ...c, endMs: Math.min(c.endMs, durationMs) }));
}

/**
 * Re-wrap cue text for a narrower frame. Greedy word wrap, then if the result
 * exceeds maxLines the cue is split in time proportionally to text length —
 * so a long sentence becomes two readable cues instead of one wall of text.
 */
export function rewrapCues(cues, { maxCharsPerLine, maxLines }) {
  const out = [];
  for (const cue of cues) {
    const words = cue.text.replace(/\s+/g, ' ').trim().split(' ').filter(Boolean);
    const lines = greedyWrap(words, maxCharsPerLine);
    if (lines.length <= maxLines) {
      out.push({ ...cue, text: lines.join('\n') });
      continue;
    }
    // Split into chunks of maxLines, apportioning time by character count.
    const chunks = [];
    for (let i = 0; i < lines.length; i += maxLines) chunks.push(lines.slice(i, i + maxLines));
    const totalChars = chunks.reduce((n, c) => n + c.join(' ').length, 0) || 1;
    let cursor = cue.startMs;
    const span = Math.max(1, cue.endMs - cue.startMs);
    chunks.forEach((chunk, i) => {
      const share = chunk.join(' ').length / totalChars;
      const end = i === chunks.length - 1 ? cue.endMs : Math.round(cursor + span * share);
      out.push({ index: out.length + 1, startMs: cursor, endMs: Math.max(end, cursor + 200), text: chunk.join('\n') });
      cursor = end;
    });
  }
  return out.map((c, i) => ({ ...c, index: i + 1 }));
}

function greedyWrap(words, maxChars) {
  const lines = [];
  let line = '';
  for (const word of words) {
    if (!line) line = word;
    else if (`${line} ${word}`.length <= maxChars) line = `${line} ${word}`;
    else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines.length ? lines : [''];
}

// ---------------------------------------------------------------------------
// Cue synthesis (for providers with no SRT — including the Kokoro default)
// ---------------------------------------------------------------------------

/**
 * Build cues from narration text and a measured audio duration.
 *
 * Splits on sentence/clause boundaries, then distributes the measured duration
 * proportionally to character count. Character-proportional timing is a
 * documented approximation: it drifts a few hundred milliseconds mid-sentence,
 * which is well within reading tolerance for captions, and it never drifts at
 * segment boundaries because the segments are apportioned from the true total.
 */
export function synthesiseCues(
  text,
  durationMs,
  { maxCharsPerLine = 46, maxLines = 2, minCueMs = 700, maxCueMs = 6000 } = {}
) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (!clean || !Number.isFinite(durationMs) || durationMs <= 0) return [];

  // Two independent bounds on segment size:
  //   - the caption box: maxCharsPerLine * maxLines characters
  //   - reading comfort: a caption should not sit on screen longer than
  //     maxCueMs. Because time is apportioned by character count, bounding
  //     characters bounds on-screen duration.
  const boxChars = Math.max(8, maxCharsPerLine * maxLines);
  const timeChars = Math.floor(clean.length * (maxCueMs / durationMs));
  const perCue = Math.max(12, Math.min(boxChars, timeChars || boxChars));

  const segments = segmentText(clean, perCue, minCueMs, durationMs);
  const totalChars = segments.reduce((n, s) => n + s.length, 0) || 1;

  const cues = [];
  let cursor = 0;
  segments.forEach((segment, i) => {
    const share = segment.length / totalChars;
    const end = i === segments.length - 1 ? durationMs : Math.round(cursor + durationMs * share);
    cues.push({ index: i + 1, startMs: Math.round(cursor), endMs: end, text: segment });
    cursor = end;
  });

  return rewrapCues(cues, { maxCharsPerLine, maxLines });
}

/** Split into caption-sized segments, preferring sentence then clause breaks. */
function segmentText(text, targetChars, minCueMs, durationMs) {
  const sentences = text.match(/[^.!?]+[.!?]*\s*/g) ?? [text];
  const segments = [];
  let buffer = '';

  const flush = () => {
    const trimmed = buffer.trim();
    if (trimmed) segments.push(trimmed);
    buffer = '';
  };

  for (const sentence of sentences) {
    const piece = sentence.trim();
    if (!piece) continue;
    if (piece.length > targetChars * 1.6) {
      flush();
      // Long sentence: break at clause boundaries, then hard-wrap the remainder.
      for (const clause of splitLongSentence(piece, targetChars)) segments.push(clause);
      continue;
    }
    if (!buffer) buffer = piece;
    else if (`${buffer} ${piece}`.length <= targetChars) buffer = `${buffer} ${piece}`;
    else {
      flush();
      buffer = piece;
    }
  }
  flush();

  // Merge any segment too short to be readable into its neighbour.
  const minChars = Math.max(1, Math.round((minCueMs / durationMs) * text.length));
  const merged = [];
  for (const segment of segments) {
    if (merged.length && segment.length < minChars) merged[merged.length - 1] += ` ${segment}`;
    else merged.push(segment);
  }
  return merged.length ? merged : [text];
}

function splitLongSentence(sentence, targetChars) {
  const parts = sentence.split(/(?<=[,;:—–])\s+/);
  const out = [];
  let buffer = '';
  for (const part of parts) {
    if (!buffer) buffer = part;
    else if (`${buffer} ${part}`.length <= targetChars) buffer = `${buffer} ${part}`;
    else {
      out.push(buffer.trim());
      buffer = part;
    }
  }
  if (buffer.trim()) out.push(buffer.trim());

  // Anything still oversized is hard-wrapped on word boundaries.
  const final = [];
  for (const chunk of out) {
    if (chunk.length <= targetChars * 1.6) {
      final.push(chunk);
      continue;
    }
    const words = chunk.split(' ');
    let line = '';
    for (const word of words) {
      if (!line) line = word;
      else if (`${line} ${word}`.length <= targetChars) line = `${line} ${word}`;
      else {
        final.push(line);
        line = word;
      }
    }
    if (line) final.push(line);
  }
  return final;
}

/**
 * Prepare the burn-in subtitles for one scene and one output aspect.
 * This is the single entry point the compose stage calls.
 *
 * Returns both formats deliberately: `ass` is what gets burned in (it is the
 * only one that can state its own resolution), `srt` is what a sidecar upload
 * needs.
 *
 * @returns {{ass:string, srt:string, cues:Cue[], layout:object, style:object}}
 */
export function prepareSceneSubtitles({ scene, output, durationMs, providerSrt = null, ratePct = 0, overrides = {} }) {
  const layout = subtitleLayoutFor(output, overrides);
  const frame = ASPECTS[output.aspect ?? 'landscape'] ?? ASPECTS.landscape;

  let cues = providerSrt ? parseSrt(providerSrt) : [];
  if (cues.length && ratePct) cues = scaleCues(cues, rateToCueFactor(ratePct));
  if (!cues.length) {
    cues = synthesiseCues(scene.narration, durationMs, {
      maxCharsPerLine: layout.maxCharsPerLine,
      maxLines: layout.maxLines,
    });
  } else {
    cues = rewrapCues(cues, { maxCharsPerLine: layout.maxCharsPerLine, maxLines: layout.maxLines });
  }

  cues = clampCues(cues, durationMs);
  // `overrides` is one flat dict serving both layers: camelCase keys are layout
  // (fontSize, marginV), PascalCase keys are raw ASS style fields (Fontname,
  // PrimaryColour). Each layer reads only the keys it knows.
  const style = layoutToAssStyle(layout, overrides);
  return { ass: formatAss(cues, style, frame), srt: formatSrt(cues), cues, layout, style };
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function pad(n, width) {
  return String(n).padStart(width, '0');
}
function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj ?? {}).filter(([, v]) => v !== undefined));
}
