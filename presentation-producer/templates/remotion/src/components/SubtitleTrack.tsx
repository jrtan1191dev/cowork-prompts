import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import type { Aspect } from '../MainVideo';

/**
 * Burned-in captions with aspect-aware placement.
 *
 * Mirrors scripts/lib/subtitles.mjs so the Remotion and ffmpeg paths agree:
 *   landscape        just above the lower edge
 *   vertical         ~21% up from the bottom, clear of phone UI chrome
 *   letterbox 9:16   inside the empty bar under the footage, so captions never
 *                    cover the UI being demonstrated
 *
 * Font and box colour are kept identical to the ffmpeg path on purpose: Arial
 * resolves on Windows and macOS and substitutes to metric-compatible Liberation
 * Sans on Linux, so line wrapping does not change per machine.
 */

type Cue = { startMs: number; endMs: number; text: string };

const CAPTION_FONT = 'Arial, Helvetica, sans-serif';

const LAYOUTS: Record<Aspect, { fontSize: number; marginV: number; marginH: number; maxCharsPerLine: number; maxLines: number }> = {
  landscape: { fontSize: 44, marginV: 64, marginH: 200, maxCharsPerLine: 46, maxLines: 2 },
  vertical: { fontSize: 52, marginV: 400, marginH: 64, maxCharsPerLine: 26, maxLines: 3 },
  square: { fontSize: 46, marginV: 140, marginH: 80, maxCharsPerLine: 32, maxLines: 2 },
};

const timecodeToMs = (tc: string): number => {
  const m = /(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})/.exec(tc);
  if (!m) return 0;
  return Number(m[1]) * 3600000 + Number(m[2]) * 60000 + Number(m[3]) * 1000 + Number(m[4].padEnd(3, '0'));
};

const parseSrt = (text: string): Cue[] => {
  const cues: Cue[] = [];
  for (const block of text.replace(/\r\n/g, '\n').trim().split(/\n{2,}/)) {
    const lines = block.split('\n');
    const idx = lines.findIndex((l) => l.includes('-->'));
    if (idx === -1) continue;
    const m = /(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[,.]\d{1,3})/.exec(lines[idx]);
    if (!m) continue;
    const body = lines.slice(idx + 1).join('\n').trim();
    if (body) cues.push({ startMs: timecodeToMs(m[1]), endMs: timecodeToMs(m[2]), text: body });
  }
  return cues;
};

const greedyWrap = (words: string[], maxChars: number): string[] => {
  const lines: string[] = [];
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
  return lines;
};

/** Character-proportional cue synthesis, for providers that emit no SRT. */
const synthesiseCues = (text: string, durationMs: number, maxCharsPerLine: number, maxLines: number): Cue[] => {
  const clean = (text ?? '').replace(/\s+/g, ' ').trim();
  if (!clean || durationMs <= 0) return [];

  const boxChars = Math.max(8, maxCharsPerLine * maxLines);
  const timeChars = Math.floor(clean.length * (6000 / durationMs));
  const perCue = Math.max(12, Math.min(boxChars, timeChars || boxChars));

  const sentences = clean.match(/[^.!?]+[.!?]*\s*/g) ?? [clean];
  const segments: string[] = [];
  let buffer = '';
  for (const raw of sentences) {
    const piece = raw.trim();
    if (!piece) continue;
    if (!buffer) buffer = piece;
    else if (`${buffer} ${piece}`.length <= perCue) buffer = `${buffer} ${piece}`;
    else {
      segments.push(buffer);
      buffer = piece;
    }
  }
  if (buffer) segments.push(buffer);

  const totalChars = segments.reduce((n, s) => n + s.length, 0) || 1;
  const cues: Cue[] = [];
  let cursor = 0;
  segments.forEach((segment, i) => {
    const end = i === segments.length - 1 ? durationMs : Math.round(cursor + durationMs * (segment.length / totalChars));
    cues.push({ startMs: Math.round(cursor), endMs: end, text: segment });
    cursor = end;
  });
  return cues;
};

export const SubtitleTrack: React.FC<{
  narration: string;
  providerSrt: string | null;
  ratePct: number;
  durationMs: number;
  aspect: Aspect;
  captureAspect: Aspect;
  strategy?: 'native' | 'reframe' | 'letterbox';
  style?: Record<string, unknown>;
}> = ({ narration, providerSrt, ratePct, durationMs, aspect, captureAspect, strategy, style }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const nowMs = (frame / fps) * 1000;

  const layout = LAYOUTS[aspect] ?? LAYOUTS.landscape;

  // Letterboxed vertical: drop the captions into the lower bar.
  let marginV = layout.marginV;
  if (aspect !== captureAspect && strategy === 'letterbox') {
    const srcAspect = 1920 / 1080;
    const scaledHeight = width / srcAspect;
    const bar = Math.max(0, height - scaledHeight);
    if (bar > layout.fontSize * 2.5) {
      marginV = Math.max(48, Math.round(bar / 2 / 2 - layout.fontSize / 2));
    }
  }

  const cues = React.useMemo(() => {
    let parsed = providerSrt ? parseSrt(providerSrt) : [];
    if (parsed.length && ratePct) {
      // Re-rated speech invalidates provider timings: scale them.
      const factor = 1 / (1 + ratePct / 100);
      parsed = parsed.map((c) => ({ ...c, startMs: c.startMs * factor, endMs: c.endMs * factor }));
    }
    if (!parsed.length) parsed = synthesiseCues(narration, durationMs, layout.maxCharsPerLine, layout.maxLines);
    return parsed.filter((c) => c.startMs < durationMs).map((c) => ({ ...c, endMs: Math.min(c.endMs, durationMs) }));
  }, [providerSrt, ratePct, narration, durationMs, layout.maxCharsPerLine, layout.maxLines]);

  const active = cues.find((c) => nowMs >= c.startMs && nowMs <= c.endMs);
  if (!active) return null;

  const lines = greedyWrap(active.text.replace(/\n/g, ' ').split(' ').filter(Boolean), layout.maxCharsPerLine).slice(
    0,
    layout.maxLines
  );

  return (
    <div
      style={{
        position: 'absolute',
        left: layout.marginH,
        right: layout.marginH,
        bottom: marginV,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.86)',
          padding: `${Math.round(layout.fontSize * 0.35)}px ${Math.round(layout.fontSize * 0.7)}px`,
          borderRadius: 14,
          color: '#ffffff',
          fontSize: layout.fontSize,
          lineHeight: 1.28,
          fontWeight: 650,
          fontFamily: CAPTION_FONT,
          textAlign: 'center',
          textWrap: 'balance',
          ...style,
        }}
      >
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
};
