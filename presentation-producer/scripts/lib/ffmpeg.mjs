/**
 * presentation-producer :: ffmpeg wrapper and filtergraph builders
 *
 * The builder functions are pure string producers so they can be unit-tested
 * without ffmpeg present — which matters because ffmpeg is not a system
 * prerequisite (it is resolved from ffmpeg-static inside .runtime).
 */

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

/** Generous default: a 12-minute concat encode is legitimately slow. */
const DEFAULT_TIMEOUT_MS = 20 * 60_000;

export class Ffmpeg {
  constructor({ ffmpeg, ffprobe }) {
    if (!ffmpeg || !ffprobe) {
      throw new Error('ffmpeg/ffprobe not resolved — run bootstrap.mjs first (installs project-local static builds)');
    }
    this.ffmpegBin = ffmpeg;
    this.ffprobeBin = ffprobe;
  }

  async run(args, { timeout = DEFAULT_TIMEOUT_MS } = {}) {
    try {
      const { stdout, stderr } = await exec(this.ffmpegBin, ['-hide_banner', '-nostdin', ...args], {
        timeout,
        maxBuffer: 64 * 1024 * 1024,
      });
      return { stdout, stderr, ok: true };
    } catch (err) {
      // ffmpeg writes progress to stderr, so a failure message needs the tail.
      const tail = String(err.stderr ?? '').split(/\r?\n/).slice(-15).join('\n');
      throw new Error(`ffmpeg failed (${args.join(' ')}):\n${tail || err.message}`);
    }
  }

  /** Run an analysis pass that writes to null and returns stderr for parsing. */
  async analyse(input, filters, { audio = false } = {}) {
    const flag = audio ? '-af' : '-vf';
    try {
      const { stderr } = await exec(this.ffmpegBin, ['-hide_banner', '-nostdin', '-i', input, flag, filters, '-f', 'null', '-'], {
        timeout: DEFAULT_TIMEOUT_MS,
        maxBuffer: 64 * 1024 * 1024,
      });
      return stderr;
    } catch (err) {
      return String(err.stderr ?? '');
    }
  }

  /** Probe a media file into the shape `checkOutput()` expects. */
  async probeMedia(file) {
    const { stdout } = await exec(
      this.ffprobeBin,
      ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams', file],
      { timeout: 120_000, maxBuffer: 32 * 1024 * 1024 }
    );
    const json = JSON.parse(stdout);
    const video = (json.streams ?? []).find((s) => s.codec_type === 'video');
    const audio = (json.streams ?? []).find((s) => s.codec_type === 'audio');
    return {
      durationMs: json.format?.duration != null ? Number(json.format.duration) * 1000 : NaN,
      width: video?.width ?? null,
      height: video?.height ?? null,
      fps: video ? parseFps(video.avg_frame_rate ?? video.r_frame_rate) : null,
      hasAudio: Boolean(audio),
      hasVideo: Boolean(video),
      subtitleStreams: (json.streams ?? []).filter((s) => s.codec_type === 'subtitle').length,
      raw: json,
    };
  }

  /** Exact duration in milliseconds — the audio-first anchor for every scene. */
  async durationMs(file) {
    const { stdout } = await exec(
      this.ffprobeBin,
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', file],
      { timeout: 60_000 }
    );
    const seconds = Number(String(stdout).trim());
    if (!Number.isFinite(seconds)) throw new Error(`could not probe duration of ${file}`);
    return seconds * 1000;
  }
}

export function parseFps(rate) {
  if (!rate) return null;
  const parts = String(rate).split('/');
  const num = Number(parts[0]);
  // A bare rate ("25") has no denominator.
  if (parts.length === 1) return Number.isFinite(num) ? num : null;
  const den = Number(parts[1]);
  // ffprobe reports "0/0" for streams with no meaningful rate.
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return null;
  return Math.round((num / den) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Filtergraph builders (pure)
// ---------------------------------------------------------------------------

/**
 * Encode a directory of resampled JPEG frames into a constant-frame-rate clip.
 * This is the fix for Playwright's variable-rate screencast: we control the
 * encode, so the output is exactly `fps` and Remotion will accept it.
 */
export function cfrEncodeArgs({ pattern, fps, out, crf = 18 }) {
  return [
    '-y',
    '-framerate', String(fps),
    '-i', pattern,
    '-vf', `fps=${fps},format=yuv420p`,
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', String(crf),
    '-fps_mode', 'cfr',
    '-movflags', '+faststart',
    out,
  ];
}

/**
 * Normalise an externally supplied clip (manual footage, VHS output) to CFR.
 *
 * `keepAudio` exists because `useFootageAudio` used to be honoured in
 * synthesize.mjs — which skipped TTS — while this function stripped audio
 * unconditionally, so the scene rendered completely silent (F2). When audio is
 * kept it is loudness-matched to the narration target so a cut between a take
 * and a narrated scene does not jump in level.
 *
 * `trim` cuts before scaling: a screen recording is usually far longer than the
 * beat it is needed for, and without an in/out point it cannot be used at all (F3).
 */
export function normaliseClipArgs({ input, fps, out, width, height, crf = 18, keepAudio = false, trim = null }) {
  const scale = width && height
    ? `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:-1:-1:color=black,`
    : '';
  const seek = [];
  if (trim?.in != null) seek.push('-ss', String(Number(trim.in)));
  if (trim?.out != null) {
    const start = Number(trim.in ?? 0);
    seek.push('-t', String(Math.max(0, Number(trim.out) - start)));
  }
  return [
    '-y',
    ...seek,
    '-i', input,
    '-vf', `${scale}fps=${fps},format=yuv420p`,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(crf),
    '-fps_mode', 'cfr',
    ...(keepAudio
      ? ['-af', loudnormFilter(), '-c:a', 'aac', '-b:a', '160k', '-ar', '48000']
      : ['-an']),
    out,
  ];
}

/**
 * Hold a rendered slide for a known duration.
 *
 * Slides are the canonical elastic visual, so padding is free and invisible —
 * which is why slide rendering can stay duration-independent (D13) and the hold
 * happens here, once the narration length is known.
 */
export function stillClipArgs({ image, fps, durationMs, out, width, height, crf = 18 }) {
  const scale = width && height
    ? `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:-1:-1:color=black,`
    : '';
  return [
    '-y',
    '-loop', '1',
    '-framerate', String(fps),
    '-t', (Math.max(1, durationMs) / 1000).toFixed(3),
    '-i', image,
    '-vf', `${scale}fps=${fps},format=yuv420p`,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(crf),
    '-fps_mode', 'cfr',
    '-an',
    out,
  ];
}

/** Hold the final frame to cover narration that outlasts the visual (D13). */
export function freezePadFilter(padMs) {
  if (!padMs || padMs <= 0) return null;
  return `tpad=stop_mode=clone:stop_duration=${(padMs / 1000).toFixed(3)}`;
}

/** Append trailing silence so a scene can end on a held visual (D13). */
export function silencePadFilter(padMs) {
  if (!padMs || padMs <= 0) return null;
  return `apad=pad_dur=${(padMs / 1000).toFixed(3)}`;
}

/** Pitch-preserving speech stretch, used for paid providers to avoid re-billing. */
export function atempoFilter(ratePct) {
  const factor = 1 + ratePct / 100;
  if (Math.abs(ratePct) < 0.05) return null;
  // atempo is only valid in [0.5, 2.0]; chain stages for anything beyond.
  const stages = [];
  let remaining = Math.min(Math.max(factor, 0.25), 4);
  while (remaining > 2.0001) {
    stages.push(2);
    remaining /= 2;
  }
  while (remaining < 0.4999) {
    stages.push(0.5);
    remaining /= 0.5;
  }
  stages.push(Math.round(remaining * 1000) / 1000);
  return stages.map((s) => `atempo=${s}`).join(',');
}

/** EBU R128 loudness normalisation so scenes and providers match in level. */
export function loudnormFilter({ i = -16, tp = -1.5, lra = 11 } = {}) {
  return `loudnorm=I=${i}:TP=${tp}:LRA=${lra}`;
}

/** Analysis-only loudness pass that prints a JSON summary for parseLoudnorm. */
export function loudnormAnalyseFilter() {
  return 'loudnorm=print_format=json';
}

/**
 * Vertical/square reframe: crop the ROI window, scale to the target, and pad
 * if the crop could not fill it. Consumes computeReframe() geometry.
 */
export function reframeFilter({ crop, dstW, dstH }) {
  return [
    `crop=${crop.width}:${crop.height}:${crop.x}:${crop.y}`,
    `scale=${dstW}:${dstH}:flags=lanczos`,
    'format=yuv420p',
  ].join(',');
}

/** Letterbox: fit the whole landscape frame inside a portrait canvas. */
export function letterboxFilter({ dstW, dstH, background = '#0f172a' }) {
  return [
    `scale=${dstW}:${dstH}:force_original_aspect_ratio=decrease`,
    `pad=${dstW}:${dstH}:(ow-iw)/2:(oh-ih)/2:color=${background}`,
    'format=yuv420p',
  ].join(',');
}

/**
 * Burn a subtitle file into the picture.
 *
 * The file must be ASS carrying its own PlayResX/PlayResY (lib/subtitles.mjs
 * writes it): there is deliberately no `force_style` here, because force_style
 * over an SRT is interpreted in libavcodec's 384x288 default script space and
 * silently multiplies every pixel value by frameHeight/288.
 *
 * `fontsdir` is passed through for projects that bundle their own font.
 */
export function subtitlesFilter(assPath, { fontsDir = null } = {}) {
  const escape = (p) => String(p).replace(/\\/g, '/').replace(/:/g, '\\:').replace(/'/g, "\\'");
  const options = [`subtitles='${escape(assPath)}'`];
  if (fontsDir) options.push(`fontsdir='${escape(fontsDir)}'`);
  return options.join(':');
}

/** Combine one scene's video and narration into a single encoded clip. */
export function mergeSceneArgs({ video, audio, out, videoFilters = [], audioFilters = [], fps, crf = 18 }) {
  const args = ['-y', '-i', video, '-i', audio];
  if (videoFilters.filter(Boolean).length) args.push('-vf', videoFilters.filter(Boolean).join(','));
  if (audioFilters.filter(Boolean).length) args.push('-af', audioFilters.filter(Boolean).join(','));
  args.push(
    '-map', '0:v:0',
    '-map', '1:a:0',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(crf),
    '-r', String(fps),
    '-fps_mode', 'cfr',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    out
  );
  return args;
}

/** concat demuxer list file contents. Safest way to join same-codec clips. */
export function concatListFile(paths) {
  return `${paths.map((p) => `file '${String(p).replace(/'/g, "'\\''")}'`).join('\n')}\n`;
}

export function concatArgs({ listFile, out, reencode = false, fps }) {
  const args = ['-y', '-f', 'concat', '-safe', '0', '-i', listFile];
  if (reencode) {
    args.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-r', String(fps), '-fps_mode', 'cfr', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '192k');
  } else {
    args.push('-c', 'copy');
  }
  args.push('-movflags', '+faststart', out);
  return args;
}

/**
 * Cross-fade two clips. Kept for explicit transitions; the default path is a
 * hard cut via concat, because xfade requires re-encoding everything and
 * shortens total runtime by the fade duration on every join.
 */
export function xfadeArgs({ a, b, out, durationSec, offsetSec, transition = 'fade', fps }) {
  return [
    '-y', '-i', a, '-i', b,
    '-filter_complex',
    `[0:v][1:v]xfade=transition=${transition}:duration=${durationSec}:offset=${offsetSec}[v];` +
      `[0:a][1:a]acrossfade=d=${durationSec}[a]`,
    '-map', '[v]', '-map', '[a]',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18',
    '-r', String(fps), '-fps_mode', 'cfr', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k',
    out,
  ];
}

/** Mix background music under the narration with ducking (D17: never bundled). */
export function bgmMixFilter({ volume = 0.12, duckVolume = 0.05 } = {}) {
  // sidechaincompress ducks the music whenever narration is present.
  return (
    `[1:a]volume=${volume}[music];` +
    `[0:a]asplit=2[voice][key];` +
    `[music][key]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400:makeup=1[ducked];` +
    `[voice][ducked]amix=inputs=2:duration=first:dropout_transition=0:weights=1 ${duckVolume ? 1 : 1}[a]`
  );
}
