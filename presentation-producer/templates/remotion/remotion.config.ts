import { Config } from '@remotion/cli/config';

/**
 * `staticFile()` in the compositions resolves against this directory, and the
 * bootstrap points it at the working directory so `assets/audio/...` and
 * `assets/recordings/...` paths from the storyboard resolve without copying
 * gigabytes into the Remotion project.
 */
Config.setPublicDir(process.env.VIDEO_GEN_WORK_DIR ?? '../..');

Config.setVideoImageFormat('jpeg');
Config.setPixelFormat('yuv420p');
Config.setCodec('h264');
Config.setCrf(18);
Config.setChromiumOpenGlRenderer('angle');
Config.setOverwriteOutput(true);
