import { Composition } from 'remotion';
import { MainVideo, calculateVideoMetadata } from './MainVideo';

/**
 * One storyboard, three registered aspects.
 *
 * This is why Remotion is in the project at all: the same scene data is
 * reframed per output declaratively, which an ffmpeg filtergraph cannot do
 * maintainably once the crop window has to follow a per-scene region of
 * interest.
 */
const DEFAULT_PROPS = {
  meta: {
    title: 'Demo',
    fps: 30,
    captureAspect: 'landscape',
    outputs: [{ aspect: 'landscape' }],
    voice: { provider: 'kokoro' },
  },
  scenes: [],
  workDir: '',
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="VideoLandscape"
        component={MainVideo}
        width={1920}
        height={1080}
        fps={30}
        durationInFrames={300}
        defaultProps={{ ...DEFAULT_PROPS, aspect: 'landscape' as const }}
        calculateMetadata={calculateVideoMetadata('landscape')}
      />
      <Composition
        id="VideoVertical"
        component={MainVideo}
        width={1080}
        height={1920}
        fps={30}
        durationInFrames={300}
        defaultProps={{ ...DEFAULT_PROPS, aspect: 'vertical' as const }}
        calculateMetadata={calculateVideoMetadata('vertical')}
      />
      <Composition
        id="VideoSquare"
        component={MainVideo}
        width={1080}
        height={1080}
        fps={30}
        durationInFrames={300}
        defaultProps={{ ...DEFAULT_PROPS, aspect: 'square' as const }}
        calculateMetadata={calculateVideoMetadata('square')}
      />
    </>
  );
};
