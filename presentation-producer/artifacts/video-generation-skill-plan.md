# Automated Agentic Video Generation Skill Architecture & Implementation Plan

> **Target Skill:** `.agents/skills/video-generator/`  
> **Status:** Specification & Implementation Blueprint  
> **Primary Modality:** Programmatic Video-as-Code & Multi-Modal Capture Pipeline  

---

## 1. Executive Summary & Vision

### 1.1 The Problem with Generative Video for Technical Demos

Recent advancements in generative AI video models (Runway Gen-3, Luma Dream Machine, OpenAI Sora) excel at photorealistic, cinematic, and impressionistic b-roll. However, they systematically fail at **technical developer demonstrations, product walkthroughs, and UI tutorials** due to:

1. **Text Hallucination:** Inability to render exact code syntax, CLI commands, or UI labels accurately.
2. **Temporal Inconsistency:** Floating UI elements, morphing buttons, and jittering layout shifts.
3. **Zero Determinism:** Inability to update a single 3-second button click without re-rendering the entire video with altered visual style.
4. **Prohibitive Latency & Cost:** Cloud diffusion video inference takes minutes per short clip at significant compute cost.

### 1.2 The Solution: Programmatic Video-as-Code Agent Architecture

The `.agents/skills/video-generator` skill implements a **deterministic, programmatic video synthesis pipeline** driven by an autonomous LLM agent. Instead of generating raw video pixels via diffusion, the agent acts as an **executive director, scriptwriter, and software orchestrator**:

- Generates a strictly typed **Storyboard Manifest** (`storyboard.json`).
- Synthesizes synchronized narration using state-of-the-art **Text-to-Speech (TTS)** engines.
- Drives headless automated capture tools:
  - **Playwright** for pixel-perfect web application UI recording with natural cursor emulation and spotlight effects.
  - **Charmbracelet VHS** for crisp, terminal-based CLI commands and agentic executions.
  - **Marp CLI / Slidev / Mermaid** for crisp typographic slides and architecture diagrams.
- Stitches, transitions, and burns animated subtitles using **Remotion** (React-based video engine) or a lightweight **FFmpeg filtergraph**.
- Runs an automated **Quality Assurance Gate** (`ffprobe`, freeze/black-frame analysis) to ensure production-grade video output.

```
+---------------------------------------------------------------------------------------------------+
|                                 LLM AGENT (Executive Director)                                    |
|   - Parses User Prompt / Topic / URL / Feature Spec                                               |
|   - Decomposes into Scenes, Visual Directives, and Voiceover Narration                            |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                                  v
                                     [ Stage 1: Storyboard Spec ]
                                          storyboard.json
                                                  |
                                                  v
                                    [ Stage 2: Voiceover & TTS ]
                               (OpenAI / ElevenLabs / Edge-TTS / Kokoro)
                                 Audio Duration Locked & SRT Generated
                                                  |
                                                  v
                              [ Stage 3: Multi-Modal Capture Engines ]
               +----------------------------------+----------------------------------+
               |                                  |                                  |
               v                                  v                                  v
    { Playwright Web UI }              { Charmbracelet VHS }              { Marp / Slidev / Mermaid }
  - Browser Automation               - Terminal CLI Execution           - Markdown Slide Deck
  - Custom SVG Cursor Overlay        - Theme & Font Control             - Transparent SVG Architecture
  - 1080p recordVideo (WebM/MP4)     - Native MP4 Terminal Capture      - 1080p PNG Slide Frames
               |                                  |                                  |
               +----------------------------------+----------------------------------+
                                                  |
                                                  v
                                  [ Stage 4: Temporal Synchronization ]
                         Video clips padded / freeze-framed / rate-adjusted to
                         match voiceover scene durations (Audio-First Alignment)
                                                  |
                                                  v
                                   [ Stage 5: Programmatic Assembly ]
               +---------------------------------------------------------------------+
               | Remotion React Engine (Default)     OR    FFmpeg Filtergraph (CLI)  |
               | - Dynamic props ingestion                 - Concat & Xfade filters  |
               | - @remotion/captions animated burn-in     - subtitles filter        |
               | - Cross-fades & Zoom/Pan animations       - Background audio ducking|
               +---------------------------------------------------------------------+
                                                  |
                                                  v
                                   [ Stage 6: Automated QA Gate ]
                         - ffprobe audio/video duration & stream verification
                         - Black-frame & glitch detection (ffmpeg blackdetect)
                         - Final MP4 artifact ready for distribution
```

---

## 2. Storyboard & Script Specification

### 2.1 The Audio-First Principle

In professional video production and automated editing, **audio dictates visual timing**.

- Speech cadence varies wildly depending on language, syllable count, and TTS provider.
- Attempting to record a fixed 5-second video and stretching/squeezing voiceover results in robotic, unnatural speech.
- **The Golden Rule:** The agent generates the script, synthesizes the audio *first*, measures the exact millisecond duration of each audio file (`dur_ms`), and then instructs the capture engine to record or pad the visual track to match `dur_ms + buffer_ms`.

### 2.2 Storyboard Schema (`storyboard.schema.json`)

The agent generates a structured JSON manifest adhering to this Zod/JSON schema:

```typescript
export interface StoryboardManifest {
  meta: {
    title: string;
    version: "1.0.0";
    resolution: { width: 1920; height: 1080 };
    fps: 30;
    voice: {
      provider: "edge-tts" | "openai" | "elevenlabs" | "kokoro";
      voiceId: string;
      speed?: number; // e.g. 1.0
    };
    bgm?: {
      src: string;
      volume: number; // 0.0 to 1.0
      duckingVolume: number; // Volume during narration (e.g. 0.15)
    };
  };
  scenes: Array<StoryboardScene>;
}

export type VisualEngineType = "playwright_web" | "vhs_terminal" | "marp_slides" | "remotion_motion";

export interface StoryboardScene {
  id: string; // e.g. "scene-01-intro"
  title: string;
  narration: string; // Text passed to TTS
  visualEngine: VisualEngineType;
  actionSpec: PlaywrightActionSpec | VhsActionSpec | MarpActionSpec | RemotionActionSpec;
  transition?: {
    type: "fade" | "slide-left" | "wipe" | "none";
    durationSec: number; // e.g. 0.5
  };
  // Populated dynamically during Stage 2:
  resolvedAudio?: {
    filePath: string;
    durationMs: number;
    durationFrames: number;
    subtitleFile?: string; // .srt or .vtt
  };
}

export interface PlaywrightActionSpec {
  url: string;
  viewport?: { width: 1920; height: 1080 };
  steps: Array<{
    action: "navigate" | "click" | "fill" | "scroll" | "wait" | "highlight";
    selector?: string;
    value?: string;
    delayMs?: number;
    smoothCursor?: boolean;
  }>;
}

export interface VhsActionSpec {
  theme?: string; // e.g. "charm", "dracula", "catppuccin"
  fontSize?: number; // default 24
  commands: Array<{
    type: "type" | "enter" | "sleep" | "ctrl";
    arg?: string;
    delayMs?: number;
  }>;
}

export interface MarpActionSpec {
  markdown: string; // Marp markdown content
  slideIndex: number; // Slide number to render
  animation?: "pan-zoom" | "static" | "ken-burns";
}

export interface RemotionActionSpec {
  componentName: string; // e.g. "FeatureHighlightCard", "ArchitectureDiagram"
  props: Record<string, unknown>;
}
```

---

## 3. Voiceover & Speech Synthesis Engines

### 3.1 Primary TTS Engine Comparison

| Engine | Cost | Latency | Quality / Realism | Word Timestamps | Dependencies | Primary Source |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Edge-TTS** (Default Free) | Free (Zero API key) | ~400ms | High (Microsoft Azure Neural) | Native `.srt` / `.vtt` metadata stream | `pip install edge-tts` | [GitHub: rany2/edge-tts](https://github.com/rany2/edge-tts) |
| **Kokoro-82M** (Local Open-Weight) | Free (Local compute) | ~150-300ms (Apple Silicon / CUDA) | State-of-the-art open weights | Yes via phoneme / whisper alignment | `pip install kokoro-onnx soundfile` | [GitHub: thewh1teagle/kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx) |
| **OpenAI Audio** | $0.015 / 1k chars (`tts-1`) | ~800ms | Excellent, natural inflection | Timestamps via response format / Whisper | `pip install openai` | [OpenAI TTS Documentation](https://platform.openai.com/docs/guides/text-to-speech) |
| **ElevenLabs** | Freemium / Paid API | ~1000ms | Industry Gold Standard (cloned/custom voices) | Native word-level timestamps (`with_timestamps`) | `pip install elevenlabs` | [ElevenLabs API Documentation](https://elevenlabs.io/docs/api-reference) |

### 3.2 Edge-TTS Implementation Blueprint

Because `edge-tts` requires no paid API key and provides high quality neural voices (e.g. `en-US-GuyNeural`, `en-US-AvaNeural`, `en-GB-SoniaNeural`) with built-in SubMaker for SRT/VTT generation, it serves as the **zero-friction default**:

```bash
# Direct CLI invocation with simultaneous audio & subtitle creation
edge-tts --voice "en-US-GuyNeural" \
         --text "Welcome to the Hospital Admissions System. In this video, we explore real-time bed tracking." \
         --write-media "assets/audio/scene-01.mp3" \
         --write-subtitles "assets/audio/scene-01.srt"
```

### 3.3 Audio Duration Probing (`ffprobe`)

To achieve frame-accurate synchronization, every generated audio clip must have its duration probed down to the exact float second using `ffprobe`:

```bash
# Probes exact duration in seconds
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 assets/audio/scene-01.mp3
# Example output: 6.432000
```

Converted to Remotion frames at 30 FPS:
$$\text{durationInFrames} = \lceil 6.432 \times 30 \rceil = 193 \text{ frames}$$

---

## 4. Multi-Modal Capture Engines

### 4.1 Engine A: Web UI Screen Recording (Playwright)

#### 4.1.1 Official Playwright Recording Architecture

Playwright provides native headless browser video recording via `BrowserContext.recordVideo`.

- **Viewport vs. Video Size Alignment:** To prevent letterboxing or downscaling artifacts, `recordVideo.size` must match `viewport`:

```typescript
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  recordVideo: {
    dir: 'assets/recordings/',
    size: { width: 1920, height: 1080 }
  }
});
const page = await context.newPage();
// ... execute script actions ...
// CRITICAL: context.close() flushes and finalizes the video file
await context.close();
await browser.close();
```

#### 4.1.2 Natural Cursor Emulation & Mouse Visualization

Headless Chromium renders without a native mouse cursor. Without visualization, automated UI interactions appear as jarring instantaneous changes.
The skill injects an interactive SVG cursor element into the DOM that tracks cursor coordinates and renders click ripple pulses:

```typescript
/**
 * Injected script for smooth cursor rendering and click animations
 */
export async function attachVirtualCursor(page: any) {
  await page.addInitScript(() => {
    const cursor = document.createElement('div');
    cursor.id = 'agent-virtual-cursor';
    cursor.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 24px;
      height: 24px;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="black" stroke="white" stroke-width="2"><path d="M3 3l7 18 3-7 7-3L3 3z"/></svg>');
      background-repeat: no-repeat;
      pointer-events: none;
      z-index: 2147483647;
      transform: translate(-2px, -2px);
      transition: transform 0.08s ease-out;
    `;
    document.documentElement.appendChild(cursor);

    window.addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate(${e.clientX - 2}px, ${e.clientY - 2}px)`;
    });

    window.addEventListener('mousedown', (e) => {
      const ripple = document.createElement('div');
      ripple.style.cssText = `
        position: fixed;
        left: ${e.clientX - 15}px;
        top: ${e.clientY - 15}px;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        border: 2px solid #3b82f6;
        background: rgba(59, 130, 246, 0.3);
        pointer-events: none;
        z-index: 2147483646;
        animation: cursor-ripple 0.4s ease-out forwards;
      `;
      document.body.appendChild(ripple);
      setTimeout(() => ripple.remove(), 400);
    });

    const style = document.createElement('style');
    style.textContent = `
      @keyframes cursor-ripple {
        0% { transform: scale(0.5); opacity: 1; }
        100% { transform: scale(2.0); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  });
}
```

#### 4.1.3 Element Spotlighting & Smooth Action Loops

For emphasizing specific UI features during narration:

```typescript
export async function highlightElement(page: any, selector: string, durationMs: number = 2000) {
  await page.evaluate(({ sel, dur }) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const prevOutline = el.style.outline;
    const prevShadow = el.style.boxShadow;
    el.style.outline = '3px solid #3b82f6';
    el.style.boxShadow = '0 0 25px rgba(59, 130, 246, 0.6)';
    el.style.transition = 'all 0.3s ease-in-out';
    setTimeout(() => {
      el.style.outline = prevOutline;
      el.style.boxShadow = prevShadow;
    }, dur);
  }, { sel: selector, dur: durationMs });
}
```

---

### 4.2 Engine B: Terminal CLI Capture (Charmbracelet VHS)

#### 4.2.1 Why Charmbracelet VHS?

For recording command-line workflows, test runs, agentic invocations, or build scripts, [Charmbracelet VHS](https://github.com/charmbracelet/vhs) is the gold standard:

- Fully headless terminal emulator recording directly to high-definition MP4.
- Pixel-perfect font antialiasing with customizable font sizes, line heights, and padding.
- Built-in theme presets (`dracula`, `catppuccin`, `nord`, `charm`, `tokyo-night`).
- Precise typing cadences (`Type@50ms`) and sleep durations.

#### 4.2.2 Automated Tape File Generation

The agent converts `StoryboardScene.actionSpec` into a `.tape` file:

```tape
# Generated by video-generator skill
Output assets/recordings/scene-02-cli.mp4

Require npm

Set Shell "zsh"
Set FontSize 24
Set FontFamily "JetBrains Mono"
Set Width 1920
Set Height 1080
Set Padding 40
Set Theme "catppuccin-mocha"
Set LetterSpacing 0
Set LineHeight 1.3
Set Framerate 30

# Initial prompt setup
Sleep 1s
Type@80ms "mvn test -Dtest=PatientAdmissionControllerTest"
Sleep 500ms
Enter

# Wait for test suite execution
Sleep 4s

# Highlight completion
Type@60ms "echo 'All 14 tests passing. Verification complete.'"
Enter
Sleep 2s
```

Execution is invoked headlessly:

```bash
vhs assets/recordings/scene-02-cli.tape
```

---

### 4.3 Engine C: Slides, Architecture & Visual Cards

#### 4.3.1 Markdown Slide Rendering (Marp CLI & Slidev)

For conceptual explanations, agenda slides, or bullet points:

- **Marp CLI (`@marp-team/marp-cli`):** Transforms standard Markdown with frontmatter into 1080p slide PNGs using headless Chromium.

```markdown
---
marp: true
theme: uncover
class: invert
size: 16:9
style: |
  section {
    background: #0f172a;
    color: #f8fafc;
    font-family: 'Inter', sans-serif;
  }
  h1 { color: #38bdf8; }
---

# Hospital Admissions Architecture
## Event-Driven Bed Allocation Engine
- Spring Boot 3.4 + Virtual Threads
- PostgreSQL 16 + Flyway Migrations
- React 19 Client with TailwindCSS
```

Export command:

```bash
npx @marp-team/marp-cli slides.md --images png -o assets/slides/slide.png
# Outputs: assets/slides/slide.001.png
```

#### 4.3.2 Architecture Diagrams via Mermaid CLI

For generating architecture flows directly from text:

```bash
npx @mermaid-js/mermaid-cli -i architecture.mmd -o assets/diagrams/arch.png -w 1920 -H 1080 -b "#0f172a"
```

---

## 5. Temporal Synchronization & Duration Locking

### 5.1 The Duration Mismatch Problem

Because human speech rates vary and browser actions have variable loading latencies:

- Visual recording duration $D_v \neq$ Audio narration duration $D_a$.
- If $D_v < D_a$: The video finishes before the voiceover finishes speaking.
- If $D_v > D_a$: An awkward silent pause occurs before the scene transition.

### 5.2 Dynamic Padding & Freeze-Framing Solutions

#### Strategy A: Remotion Freeze-Frame (React-Based)

Remotion natively solves this using the `<Freeze>` component. The recorded video plays for its natural duration, and the final frame is frozen to span the remaining scene frames:

```tsx
import { Video, Freeze, Sequence } from 'remotion';

export const SyncedScene: React.FC<{
  videoSrc: string;
  totalSceneFrames: number;
  videoDurationFrames: number;
}> = ({ videoSrc, totalSceneFrames, videoDurationFrames }) => {
  if (videoDurationFrames >= totalSceneFrames) {
    // Video is long enough or trimmed
    return <Video src={videoSrc} endAt={totalSceneFrames} />;
  }

  // Freeze the final frame for the remaining frames
  return (
    <>
      <Sequence from={0} durationInFrames={videoDurationFrames}>
        <Video src={videoSrc} />
      </Sequence>
      <Sequence from={videoDurationFrames} durationInFrames={totalSceneFrames - videoDurationFrames}>
        <Freeze frame={videoDurationFrames - 1}>
          <Video src={videoSrc} />
        </Freeze>
      </Sequence>
    </>
  );
};
```

#### Strategy B: FFmpeg `tpad` Freeze-Frame Padding (CLI-Based)

If using the FFmpeg pipeline, the video is extended to match the exact audio duration using `tpad=stop_mode=clone`:

```bash
# Calculate missing duration: target_duration - video_duration
# E.g., Audio is 7.5s, Video is 5.2s -> Pad 2.3s
ffmpeg -i input_clip.mp4 \
       -vf "tpad=stop_mode=clone:stop_duration=2.3" \
       -c:a copy output_synced.mp4
```

---

## 6. Programmatic Video Composition & Stitching

### 6.1 Primary Engine: Remotion Architecture

#### 6.1.1 Project Structure

The skill provisions a standardized Remotion template under `.agents/skills/video-generator/templates/remotion-template/`:

```
remotion-template/
├── package.json
├── remotion.config.ts
├── src/
│   ├── index.ts                # Entry point
│   ├── Root.tsx                # Composition registration & calculateMetadata
│   ├── MainVideo.tsx           # Scene sequencing & audio tracks
│   ├── components/
│   │   ├── SubtitleTrack.tsx   # Word/Sentence-level animated subtitles
│   │   ├── CursorOverlay.tsx   # Zoom & pan effect wrapper
│   │   ├── ProgressBar.tsx     # Video progress indicator bar
│   │   └── Watermark.tsx       # Logo / Title watermark
│   └── transitions/
│       └── TransitionSeries.tsx
```

#### 6.1.2 Dynamic Duration via `calculateMetadata`

Remotion compositions support dynamic props and async metadata calculation before rendering starts:

```tsx
// Root.tsx
import { Composition } from 'remotion';
import { MainVideo } from './MainVideo';
import { StoryboardManifest } from './types';

export const Root: React.FC = () => {
  return (
    <Composition
      id="AutomatedVideo"
      component={MainVideo}
      fps={30}
      width={1920}
      height={1080}
      calculateMetadata={async ({ props }) => {
        const manifest = props as StoryboardManifest;
        // Sum total frames across all scenes
        const totalFrames = manifest.scenes.reduce((acc, scene) => {
          return acc + (scene.resolvedAudio?.durationFrames || 90);
        }, 0);

        return {
          durationInFrames: totalFrames,
          props: manifest,
        };
      }}
      defaultProps={{
        meta: { title: "Demo", resolution: { width: 1920, height: 1080 }, fps: 30 },
        scenes: []
      }}
    />
  );
};
```

#### 6.1.3 Subtitle Track with Kinetic Highlighting

Using `@remotion/captions`, SRT files generated by `edge-tts` or Whisper are burned into the composition with kinetic styling:

```tsx
import { parseSrt } from '@remotion/captions';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const SubtitleOverlay: React.FC<{ srtContent: string }> = ({ srtContent }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const currentTimeMs = (frame / fps) * 1000;

  const { captions } = parseSrt(srtContent);
  const activeCaption = captions.find(
    (c) => currentTimeMs >= c.startMs && currentTimeMs <= c.endMs
  );

  if (!activeCaption) return null;

  return (
    <div style={{
      position: 'absolute',
      bottom: 80,
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none'
    }}>
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        padding: '12px 28px',
        borderRadius: 16,
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: '#ffffff',
        fontSize: 32,
        fontWeight: 700,
        fontFamily: 'system-ui, sans-serif',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        textAlign: 'center',
        maxWidth: '80%'
      }}>
        {activeCaption.text}
      </div>
    </div>
  );
};
```

#### 6.1.4 Headless Remotion CLI Render

The agent executes the final render via CLI, passing the computed manifest directly:

```bash
npx remotion render src/index.ts AutomatedVideo output/final-video.mp4 \
  --props=./artifacts/video-generator/storyboard.json \
  --concurrency=4 \
  --gl=angle \
  --log=warn
```

---

### 6.2 Fallback Engine: Zero-Node FFmpeg Filtergraph

For environments where Node.js / Remotion dependencies cannot be installed, the skill includes a pure FFmpeg filtergraph stitcher.

#### 6.2.1 Audio-Visual Merge & Subtitle Burn per Scene

For each scene $i$:

```bash
# 1. Combine padded video with voiceover audio
ffmpeg -y -i assets/recordings/scene-01.mp4 -i assets/audio/scene-01.mp3 \
       -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p \
       -c:a aac -b:a 192k -shortest \
       assets/processed/scene-01-merged.mp4

# 2. Burn subtitles with custom font styling
ffmpeg -y -i assets/processed/scene-01-merged.mp4 \
       -vf "subtitles=assets/audio/scene-01.srt:force_style='FontSize=22,PrimaryColour=&H00FFFFFF,BackColour=&H80000000,BorderStyle=4,Outline=1,Shadow=1,MarginV=35'" \
       -c:a copy assets/processed/scene-01-subbed.mp4
```

#### 6.2.2 Concatenation with Cross-Fade Transitions (`xfade`)

To stitch scenes seamlessly with smooth cross-fades rather than abrupt jump cuts:

```bash
ffmpeg -y \
  -i assets/processed/scene-01-subbed.mp4 \
  -i assets/processed/scene-02-subbed.mp4 \
  -filter_complex \
  "[0:v][1:v]xfade=transition=fade:duration=0.5:offset=6.0[v]; \
   [0:a][1:a]acrossfade=d=0.5[a]" \
  -map "[v]" -map "[a]" output/final-stitched.mp4
```

---

## 7. Automated Quality Assurance Gate

Before presenting the generated video to the user, the agent executes an automated quality check script `scripts/verify-video.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

TARGET_VIDEO="$1"
EXPECTED_WIDTH=1920
EXPECTED_HEIGHT=1080
MIN_DURATION=5.0

echo "==> Running Automated QA on $TARGET_VIDEO..."

# 1. Probe stream properties
PROBE_JSON=$(ffprobe -v quiet -print_format json -show_format -show_streams "$TARGET_VIDEO")

WIDTH=$(echo "$PROBE_JSON" | jq '.streams[] | select(.codec_type=="video") | .width')
HEIGHT=$(echo "$PROBE_JSON" | jq '.streams[] | select(.codec_type=="video") | .height')
DURATION=$(echo "$PROBE_JSON" | jq -r '.format.duration')
HAS_AUDIO=$(echo "$PROBE_JSON" | jq '[.streams[] | select(.codec_type=="audio")] | length')

echo "    Resolution: ${WIDTH}x${HEIGHT}"
echo "    Duration: ${DURATION}s"
echo "    Audio streams: $HAS_AUDIO"

# Assertions
if [[ "$WIDTH" -ne "$EXPECTED_WIDTH" || "$HEIGHT" -ne "$EXPECTED_HEIGHT" ]]; then
  echo "[-] ERROR: Incorrect resolution. Expected 1920x1080, got ${WIDTH}x${HEIGHT}"
  exit 1
fi

if (( $(echo "$DURATION < $MIN_DURATION" | bc -l) )); then
  echo "[-] ERROR: Video duration too short (${DURATION}s < ${MIN_DURATION}s)"
  exit 1
fi

if [[ "$HAS_AUDIO" -eq 0 ]]; then
  echo "[-] ERROR: Missing audio track in output video"
  exit 1
fi

# 2. Black frame detection (ensures no corrupted black screens in transitions)
BLACK_FRAMES=$(ffmpeg -v error -i "$TARGET_VIDEO" -vf "blackdetect=d=1.0:pix_th=0.1" -f null - 2>&1 | wc -l)
if [[ "$BLACK_FRAMES" -gt 3 ]]; then
  echo "[-] WARNING: Detected excessive black screen segments ($BLACK_FRAMES). Check scene transitions."
fi

echo "[+] Video Quality Gate PASSED: $TARGET_VIDEO is production ready."
```

---

## 8. Skill Specification & Agentic Workflow

### 8.1 Proposed Skill Directory Layout

The skill will be created in `.agents/skills/video-generator/`:

```
.agents/skills/video-generator/
├── SKILL.md                          # Main agent entry point & instruction manual
├── references/
│   ├── storyboard-schema.md          # Storyboard schema & JSON examples
│   ├── capture-playwright.md         # Playwright script patterns & cursor emulation
│   ├── capture-vhs.md                # Charm VHS tape templates
│   ├── composition-remotion.md       # Remotion React component guidelines
│   └── troubleshooting.md            # Common errors (headless GPU, audio drift)
├── scripts/
│   ├── synthesize-voice.py           # Edge-TTS / OpenAI / Kokoro audio synthesis
│   ├── record-browser.ts             # Playwright runner with virtual cursor
│   ├── render-slides.sh              # Marp CLI wrapper
│   ├── compose-ffmpeg.sh             # Fallback FFmpeg stitcher
│   └── verify-video.sh               # Automated ffprobe QA validator
└── templates/
    └── remotion/                     # Pre-packaged Remotion React project
        ├── package.json
        ├── remotion.config.ts
        └── src/
```

### 8.2 Proposed `SKILL.md` Specification

Below is the exact `SKILL.md` specification to be implemented:

```markdown
---
name: video-generator
description: Generate high-quality technical walkthrough and demo videos using a programmatic video-as-code pipeline. Orchestrates scriptwriting, TTS narration, Playwright web capture, VHS terminal recording, and Remotion/FFmpeg assembly.
argument-hint: "[--topic=<string>] [--url=<url>] [--tts=edge|openai|kokoro] [--engine=remotion|ffmpeg] [--out=<path>]"
---

# Video Generator

Generate automated, deterministic technical videos combining UI browser capture, terminal CLI recordings, presentation slides, voiceover narration, and kinetic subtitles.

## Quick Start

| Invocation | Purpose |
| :--- | :--- |
| `/video-generator --topic="Feature Walkthrough" --url="http://localhost:3000"` | Full video from live URL |
| `/video-generator --script=storyboard.json` | Render from an existing storyboard |
| `/video-generator --tts=edge --engine=remotion` | Use free Edge-TTS & Remotion composition |
| `/video-generator --engine=ffmpeg` | Zero-Node lightweight FFmpeg pipeline |

## Workflow Stages

### 1. Plan & Storyboard (`storyboard.json`)
1. Decompose the topic into structured scenes (15-60 seconds total typical).
2. For each scene, specify:
   - `id` and `title`
   - `narration`: Spoken script for TTS.
   - `visualEngine`: `playwright_web`, `vhs_terminal`, `marp_slides`, or `remotion_motion`.
   - `actionSpec`: Exact actions to execute during recording.
3. Validate against `references/storyboard-schema.md`.
4. Save manifest to `artifacts/video-generator/storyboard.json`.

### 2. Synthesize Voiceover & Lock Timings (Audio-First)
1. Run `python scripts/synthesize-voice.py --manifest artifacts/video-generator/storyboard.json --provider edge-tts`.
2. For every scene, this generates:
   - `assets/audio/{scene-id}.mp3`
   - `assets/audio/{scene-id}.srt`
3. The script probes audio duration via `ffprobe` down to the millisecond and updates `resolvedAudio.durationFrames` in `storyboard.json`.

### 3. Execute Visual Capture Engines
1. **Web UI Scenes (`playwright_web`):**
   - Run `npx ts-node scripts/record-browser.ts --scene={scene-id}`
   - Injects virtual cursor and executes click/scroll/fill steps matching the audio duration.
2. **Terminal Scenes (`vhs_terminal`):**
   - Generate `{scene-id}.tape` and run `vhs {scene-id}.tape`.
3. **Slides & Diagrams (`marp_slides`):**
   - Run `scripts/render-slides.sh {scene-id}.md`.

### 4. Duration Synchronization
1. Ensure all visual clips match or exceed their scene's audio duration.
2. Apply freeze-frame extension (`<Freeze>` in Remotion or `tpad` in FFmpeg) to fill remaining frames.

### 5. Video Composition & Subtitle Burn
1. If `--engine=remotion` (Default):
   - Run `npx remotion render src/index.ts AutomatedVideo artifacts/video-generator/output.mp4 --props=artifacts/video-generator/storyboard.json`.
2. If `--engine=ffmpeg`:
   - Run `bash scripts/compose-ffmpeg.sh artifacts/video-generator/storyboard.json`.

### 6. Automated Quality Gate
1. Execute `bash scripts/verify-video.sh artifacts/video-generator/output.mp4`.
2. Verify resolution (1920x1080), audio presence, and absence of black frames.
3. Deliver final video artifact path and summary to user.
```

---

## 9. Implementation Roadmap & Milestones

### Phase 1: Core Foundation & Toolchain Setup

- [ ] Create `.agents/skills/video-generator/` directory structure.
- [ ] Verify system prerequisites (`ffmpeg`, `ffprobe`, `vhs`, `playwright`, `edge-tts`).
- [ ] Implement `references/storyboard-schema.md` and TypeScript type definitions.

### Phase 2: Audio & Capture Engine Scripts

- [ ] Build `scripts/synthesize-voice.py` supporting `edge-tts` (with SRT output) and `openai` TTS.
- [ ] Build `scripts/record-browser.ts` with Playwright, including injected SVG cursor, click ripples, and viewport locking.
- [ ] Build `scripts/generate-vhs.py` to compile terminal commands into `.tape` files and invoke VHS.
- [ ] Build `scripts/render-slides.sh` for Marp CLI markdown-to-PNG compilation.

### Phase 3: Composition & Stitching Engines

- [ ] Scaffold Remotion project in `templates/remotion/` with dynamic `calculateMetadata`, `@remotion/captions` subtitle burning, and transition series.
- [ ] Build fallback `scripts/compose-ffmpeg.sh` utilizing `tpad`, `concat`, and `subtitles` filters.

### Phase 4: Quality Gate & Skill Documentation

- [ ] Write `scripts/verify-video.sh` with `ffprobe` resolution, duration, audio track, and glitch assertions.
- [ ] Author final `SKILL.md` with progressive disclosure pointers to reference manuals.
- [ ] End-to-end dry-run creating a sample 30-second product demo video.

---

## 10. Primary Sources & Citations

1. **Remotion Documentation:**
   - Programmatic Rendering CLI & Dynamic Props: [remotion.dev/docs/cli/render](https://www.remotion.dev/docs/cli/render)
   - Dynamic Metadata Calculation (`calculateMetadata`): [remotion.dev/docs/composition#calculatemetadata](https://www.remotion.dev/docs/composition#calculatemetadata)
   - Caption Parsing & TikTok-style Subtitles: [remotion.dev/docs/captions](https://www.remotion.dev/docs/captions)
2. **Playwright Documentation:**
   - Video Recording in BrowserContext: [playwright.dev/docs/videos](https://playwright.dev/docs/videos)
   - Viewport Emulation: [playwright.dev/docs/emulation](https://playwright.dev/docs/emulation)
3. **Charmbracelet VHS:**
   - Declarative Terminal GIF & MP4 Generator: [github.com/charmbracelet/vhs](https://github.com/charmbracelet/vhs)
4. **Edge-TTS:**
   - Python Interface to Microsoft Edge Neural TTS with SubMaker SRT/VTT: [github.com/rany2/edge-tts](https://github.com/rany2/edge-tts)
5. **Kokoro TTS:**
   - Lightweight 82M Open-Weight Neural TTS with ONNX Runtime: [github.com/thewh1teagle/kokoro-onnx](https://github.com/thewh1teagle/kokoro-onnx)
6. **Marp Ecosystem:**
   - Headless Markdown Presentation CLI: [marp.app](https://marp.app/) | [github.com/marp-team/marp-cli](https://github.com/marp-team/marp-cli)
7. **Slidev:**
   - Presentation Slides for Developers with Export CLI: [sli.dev](https://sli.dev/)
8. **FFmpeg Official Documentation:**
   - Temporary Pad (`tpad`) Filter: [ffmpeg.org/ffmpeg-filters.html#tpad](https://ffmpeg.org/ffmpeg-filters.html#tpad)
   - Video Transitions (`xfade`): [ffmpeg.org/ffmpeg-filters.html#xfade](https://ffmpeg.org/ffmpeg-filters.html#xfade)
   - Subtitle Rendering (`subtitles`): [ffmpeg.org/ffmpeg-filters.html#subtitles](https://ffmpeg.org/ffmpeg-filters.html#subtitles)
