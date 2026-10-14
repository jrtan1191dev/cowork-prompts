import React from 'react';
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useVideoConfig } from 'remotion';
import { SubtitleTrack } from './components/SubtitleTrack';
import { Reframe } from './components/Reframe';

export type Aspect = 'landscape' | 'vertical' | 'square';

export const ASPECT_DIMENSIONS: Record<Aspect, { width: number; height: number }> = {
  landscape: { width: 1920, height: 1080 },
  vertical: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
};

export type Scene = {
  id: string;
  title?: string;
  narration: string;
  visualEngine: string;
  captureMode?: 'screencast' | 'stills';
  roi?: { x: number; y: number; width: number; height: number } | null;
  vertical?: { strategy?: 'native' | 'reframe' | 'letterbox' };
  resolvedAudio?: { filePath: string; durationMs: number; providerSrt?: string | null };
  resolvedVisual?: { filePath: string; durationMs: number };
  resolvedTiming?: { sceneMs: number; padVisualMs: number; padAudioMs: number };
  ratePct?: number;
};

export type VideoProps = {
  meta: {
    title: string;
    fps?: number;
    captureAspect?: Aspect;
    background?: string;
    subtitles?: {
      enabled?: boolean;
      style?: Record<string, unknown>;
      /**
       * Renderer-neutral brand caption colours, written by compile.mjs. Hex
       * rather than ASS because this path styles a DOM node; the ffmpeg path
       * converts the same values to `&HAABBGGRR` at its own edge.
       */
      colours?: { box?: string; text?: string };
    };
  };
  scenes: Scene[];
  workDir: string;
  aspect: Aspect;
};

const msToFrames = (ms: number, fps: number) => Math.max(1, Math.round((ms / 1000) * fps));

/**
 * Duration is derived from measured audio, so the composition length always
 * matches the narration that actually exists.
 */
export const calculateVideoMetadata =
  (aspect: Aspect) =>
  async ({ props }: { props: VideoProps }) => {
    const fps = props.meta?.fps ?? 30;
    const total = (props.scenes ?? []).reduce(
      (acc, scene) => acc + msToFrames(scene.resolvedTiming?.sceneMs ?? scene.resolvedAudio?.durationMs ?? 3000, fps),
      0
    );
    return {
      durationInFrames: Math.max(1, total),
      fps,
      width: ASPECT_DIMENSIONS[aspect].width,
      height: ASPECT_DIMENSIONS[aspect].height,
      props: { ...props, aspect },
    };
  };

export const MainVideo: React.FC<VideoProps> = ({ meta, scenes, aspect }) => {
  const { fps } = useVideoConfig();
  const captureAspect = meta?.captureAspect ?? 'landscape';

  let cursor = 0;
  return (
    <AbsoluteFill style={{ backgroundColor: meta?.background ?? '#0f172a' }}>
      {(scenes ?? []).map((scene) => {
        const sceneMs = scene.resolvedTiming?.sceneMs ?? scene.resolvedAudio?.durationMs ?? 3000;
        const durationInFrames = msToFrames(sceneMs, fps);
        const from = cursor;
        cursor += durationInFrames;

        const videoSrc = scene.resolvedVisual?.filePath ? staticFile(scene.resolvedVisual.filePath) : null;
        const audioSrc = scene.resolvedAudio?.filePath ? staticFile(scene.resolvedAudio.filePath) : null;

        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationInFrames} name={scene.id}>
            {videoSrc ? (
              <Reframe
                aspect={aspect}
                captureAspect={captureAspect}
                roi={scene.roi ?? null}
                strategy={scene.vertical?.strategy}
                background={meta?.background ?? '#0f172a'}
              >
                {/* OffthreadVideo is the correct choice for rendering: it
                    extracts exact frames rather than relying on playback. */}
                <OffthreadVideo src={videoSrc} />
              </Reframe>
            ) : null}

            {audioSrc ? <Audio src={audioSrc} /> : null}

            {meta?.subtitles?.enabled === false ? null : (
              <SubtitleTrack
                narration={scene.narration}
                providerSrt={scene.resolvedAudio?.providerSrt ?? null}
                ratePct={scene.ratePct ?? 0}
                durationMs={sceneMs}
                aspect={aspect}
                captureAspect={captureAspect}
                strategy={scene.vertical?.strategy}
                // Brand colours first, then the authored style so an explicit
                // setting still wins. Note `meta.subtitles.style` holds ASS
                // field names (BackColour, Fontname), which React ignores as CSS
                // — it is carried through unchanged only to preserve existing
                // behaviour; the effective caption colours come from `colours`.
                style={{
                  ...(meta?.subtitles?.colours?.box
                    ? { backgroundColor: `${meta.subtitles.colours.box}DB` }
                    : {}),
                  ...(meta?.subtitles?.colours?.text
                    ? { color: meta.subtitles.colours.text }
                    : {}),
                  ...(meta?.subtitles?.style ?? {}),
                }}
              />
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
