import React from 'react';
import { AbsoluteFill } from 'remotion';
import { ASPECT_DIMENSIONS, type Aspect } from '../MainVideo';

type Roi = { x: number; y: number; width: number; height: number } | null;

/**
 * Reframe a landscape capture into another aspect.
 *
 *   native    — already captured at the target viewport: pass through
 *   letterbox — fit the whole frame, leaving bars (nothing is ever cropped)
 *   reframe   — crop a window that follows the region of interest
 *
 * ROI comes from Playwright's boundingBox() on the acted element, so "punch in
 * on the panel being discussed" requires no manual authoring.
 */
export const Reframe: React.FC<{
  aspect: Aspect;
  captureAspect: Aspect;
  roi: Roi;
  strategy?: 'native' | 'reframe' | 'letterbox';
  background: string;
  children: React.ReactNode;
}> = ({ aspect, captureAspect, roi, strategy, background, children }) => {
  const src = ASPECT_DIMENSIONS[captureAspect];
  const dst = ASPECT_DIMENSIONS[aspect];

  if (aspect === captureAspect) {
    return <AbsoluteFill>{children}</AbsoluteFill>;
  }

  const chosen = strategy ?? (roi ? 'reframe' : 'letterbox');

  if (chosen === 'letterbox') {
    const scale = Math.min(dst.width / src.width, dst.height / src.height);
    return (
      <AbsoluteFill style={{ backgroundColor: background, justifyContent: 'center', alignItems: 'center' }}>
        <div
          style={{
            width: src.width,
            height: src.height,
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
    );
  }

  // --- ROI-following crop, mirroring computeReframe() in lib/core.mjs -----
  const dstAspect = dst.width / dst.height;
  let cropH = src.height;
  let cropW = cropH * dstAspect;
  if (cropW > src.width) {
    cropW = src.width;
    cropH = cropW / dstAspect;
  }

  if (roi && roi.width > 0 && roi.height > 0) {
    const pad = 0.18;
    const wantW = Math.min(src.width, roi.width * (1 + pad * 2));
    const wantH = Math.min(src.height, roi.height * (1 + pad * 2));
    let tryH = Math.max(wantH, wantW / dstAspect);
    let tryW = tryH * dstAspect;
    if (tryW > src.width) {
      tryW = src.width;
      tryH = tryW / dstAspect;
    }
    if (tryH <= src.height && tryW <= src.width) {
      cropW = tryW;
      cropH = tryH;
    }
  }

  const centreX = roi ? roi.x + roi.width / 2 : src.width / 2;
  const centreY = roi ? roi.y + roi.height / 2 : src.height / 2;
  const x = Math.min(Math.max(centreX - cropW / 2, 0), Math.max(0, src.width - cropW));
  const y = Math.min(Math.max(centreY - cropH / 2, 0), Math.max(0, src.height - cropH));
  const scale = dst.width / cropW;

  return (
    <AbsoluteFill style={{ backgroundColor: background, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          width: src.width,
          height: src.height,
          transform: `scale(${scale}) translate(${-x}px, ${-y}px)`,
          transformOrigin: 'top left',
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
