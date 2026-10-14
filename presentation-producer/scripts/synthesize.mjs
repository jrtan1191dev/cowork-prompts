/**
 * presentation-producer :: speech synthesis (stage 2)
 *
 * Audio is measured, never assumed: every clip is probed with ffprobe so scene
 * timing is anchored to a real duration (D13).
 *
 * PROVIDER LANDSCAPE — verified, not assumed:
 *
 *   kokoro     local ONNX, Apache-2.0. DEFAULT: offline, deterministic,
 *              commercially unambiguous, immune to upstream blocks.
 *   gemini     Gemini API TTS (gemini-2.5-flash-preview-tts). Real capability,
 *              and uniquely lets you steer style/pace with a natural-language
 *              prompt. Needs GEMINI_API_KEY or GOOGLE_API_KEY.
 *   openai     /v1/audio/speech. Also what a `codex` user already has a key for.
 *   elevenlabs highest quality, per-character billing.
 *   edge       unofficial reverse-engineered Microsoft endpoint. Its own author
 *              says personal use only and "a very bad idea for anything
 *              serious": gated behind an explicit acknowledgement.
 *   system     macOS `say` / Linux `espeak-ng`. Zero install, offline, robotic.
 *              The floor that guarantees a first run can always produce audio.
 *
 * Agent CLIs that CANNOT do TTS, despite being coding agents: `claude`
 * (Anthropic exposes no speech-synthesis endpoint) and `kiro-cli`. Their
 * presence is reported as a hint about which API keys a user likely has, and
 * nothing more — this file never pretends they synthesise audio.
 */

import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { platform } from 'node:process';
import { promisify } from 'node:util';

import { SLIDE_ENGINES, audioCacheKey, formatRate, isMainModule, planTiming } from './lib/core.mjs';
import { Ffmpeg, atempoFilter } from './lib/ffmpeg.mjs';
import { Ledger } from './lib/ledger.mjs';
import { presentationContext, probe } from './lib/probe.mjs';

const exec = promisify(execFile);

/** Providers that accept a speech-rate parameter at synthesis time. */
const NATIVE_RATE = new Set(['edge', 'openai', 'kokoro', 'system']);

/** Only edge-tts hands back real cue timings; everything else needs synthesis. */
const NATIVE_SRT = new Set(['edge']);

/**
 * Narrator voice per provider and gender.
 *
 * Verified against each provider's own catalogue rather than guessed:
 *   kokoro      from the installed kokoro-js VOICES map — af_heart is the only
 *               grade-A voice, am_michael the best-graded male (B target).
 *   gemini      from the Gemini speech-generation voice list (Kore, Charon).
 *   openai      from the /v1/audio/speech voice list (nova, onyx).
 *   elevenlabs  the legacy premade voices Rachel and Adam.
 *   edge        Microsoft's en-US neural voice names.
 *   system      macOS `say` voices that ship by default; espeak-ng gender
 *               variants elsewhere.
 *
 * Caveat worth stating: OpenAI and Google publish *style* labels, not gender
 * labels, so those two rows are the conventional male- and female-presenting
 * picks, not a vendor claim. Override with `meta.voice.voiceId` if you disagree.
 */
export const VOICES = {
  kokoro: { female: 'af_heart', male: 'am_michael' },
  gemini: { female: 'Kore', male: 'Charon' },
  openai: { female: 'nova', male: 'onyx' },
  elevenlabs: { female: '21m00Tcm4TlvDq8ikWAM', male: 'pNInz6obpgDQGcFmaJgB' },
  edge: { female: 'en-US-AriaNeural', male: 'en-US-GuyNeural' },
  system:
    platform === 'darwin'
      ? { female: 'Samantha', male: 'Alex' }
      : { female: 'en+f3', male: 'en+m3' }, // espeak-ng voice variants
};

export const DEFAULT_VOICE_GENDER = 'female';

/**
 * Resolve the voice id for a provider.
 *
 * Requesting a gender wins over a stored `voiceId`, because otherwise a
 * storyboard that pinned a voice would silently ignore `--voice-gender` and the
 * toggle would appear broken. With no gender requested, an explicit `voiceId` is
 * honoured and only then does the default gender apply.
 */
export function resolveVoiceId({ provider, gender = null, voiceId = null }) {
  const catalogue = VOICES[provider] ?? {};
  if (!gender) return voiceId ?? catalogue[DEFAULT_VOICE_GENDER] ?? null;

  const wanted = String(gender).toLowerCase();
  if (!catalogue[wanted]) {
    throw new Error(
      `voice gender "${gender}" is not mapped for provider "${provider}" — expected ` +
        `${Object.keys(catalogue).join(' | ') || 'male | female'}, or set meta.voice.voiceId directly`
    );
  }
  return catalogue[wanted];
}

// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Kokoro token-limit handling
// ---------------------------------------------------------------------------

/**
 * Kokoro's model accepts at most 512 phoneme tokens and kokoro-js tokenises
 * with `truncation: true`, so anything longer is silently cut mid-sentence.
 * 480 leaves headroom for the two boundary tokens the tokeniser adds plus any
 * difference between this phonemiser call and the one inside kokoro-js.
 */
const KOKORO_PHONEME_BUDGET = 480;

/** Phoneme length of a string, using the same backend kokoro-js uses. */
async function phonemeLength(text, nodeModules = null) {
  // phonemizer lives in the project-local runtime, not next to this script, so
  // it is resolved by path the same way the kokoro entry point is. A bare
  // import would fail here and silently fall back to the estimate below.
  const candidates = [];
  if (nodeModules) {
    candidates.push(path.join(nodeModules, 'phonemizer', 'dist', 'phonemizer.js'));
  }
  candidates.push('phonemizer');
  for (const specifier of candidates) {
    if (specifier !== 'phonemizer' && !existsSync(specifier)) continue;
    try {
      const { phonemize } = await import(specifier);
      const out = await phonemize(text, 'en-us');
      return (Array.isArray(out) ? out.join(' ') : String(out)).length;
    } catch {
      /* try the next candidate */
    }
  }
  // Without the phonemiser, over-estimate rather than under-estimate: measured
  // phoneme-per-character ratios reach ~1.15 on this narration, so a ratio
  // below that would let a truncating chunk through, which is the whole bug.
  return Math.ceil(text.length * 1.2);
}

/**
 * Split narration into the fewest chunks that each stay inside the phoneme
 * budget, breaking only at sentence boundaries so prosody stays natural. A
 * single sentence that is itself over budget is split at clause boundaries,
 * and failing that returned whole — one over-long chunk that Kokoro will clip
 * is still better than silently dropping every sentence after it.
 */
export async function splitForKokoro(text, { budget = KOKORO_PHONEME_BUDGET, nodeModules = null } = {}) {
  const len = (t) => phonemeLength(t, nodeModules);
  if ((await len(text)) <= budget) return [text];

  const sentences = String(text).match(/[^.!?]+[.!?]+[\s]*|[^.!?]+$/g) ?? [text];
  const chunks = [];
  let current = '';
  for (const sentence of sentences) {
    const candidate = current ? current + sentence : sentence;
    if (current && (await len(candidate)) > budget) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = candidate;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  // A lone sentence over budget still needs breaking, or it would be clipped.
  const final = [];
  for (const chunk of chunks) {
    if ((await len(chunk)) <= budget) {
      final.push(chunk);
      continue;
    }
    const clauses = chunk.split(/(?<=[,;:—])\s+/);
    let buf = '';
    for (const clause of clauses) {
      const candidate = buf ? `${buf} ${clause}` : clause;
      if (buf && (await len(candidate)) > budget) {
        final.push(buf.trim());
        buf = clause;
      } else {
        buf = candidate;
      }
    }
    if (buf.trim()) final.push(buf.trim());
  }
  return final;
}

/** Concatenate kokoro-js RawAudio results into one, preserving sample rate. */
function concatRawAudio(parts) {
  if (parts.length === 1) return parts[0];
  const rate = parts[0].sampling_rate;
  const total = parts.reduce((n, p) => n + p.audio.length, 0);
  const merged = new Float32Array(total);
  let offset = 0;
  for (const p of parts) {
    merged.set(p.audio, offset);
    offset += p.audio.length;
  }
  const out = Object.create(Object.getPrototypeOf(parts[0]));
  return Object.assign(out, parts[0], { audio: merged, sampling_rate: rate });
}

// ---------------------------------------------------------------------------
// Provider adapters. Each returns { file, srt?: string }.
// ---------------------------------------------------------------------------

const providers = {
  /** Local Kokoro via kokoro-js (ONNX). Default: offline and deterministic. */
  async kokoro({ text, outFile, voice, ratePct, paths }) {
    const entry = path.join(paths.nodeModules, 'kokoro-js', 'dist', 'kokoro.js');
    const specifier = existsSync(entry) ? entry : 'kokoro-js';
    const { KokoroTTS } = await import(specifier);
    const modelDir = path.join(paths.runtime, 'models', 'kokoro');
    const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
      dtype: 'q8',
      cache_dir: modelDir,
    });
    const speed = Number(formatRate(ratePct, 'kokoro'));

    // Kokoro's tokeniser is configured with `truncation: true` and the model
    // takes at most 512 phoneme tokens, so a single long narration is cut off
    // MID-SENTENCE with no error and no warning — the audio simply ends early
    // and the tail of the script is never spoken. That silent data loss is
    // exactly what non-negotiable #7 forbids, so long text is split on sentence
    // boundaries and the resulting audio is concatenated.
    const chunks = await splitForKokoro(text, { nodeModules: paths.nodeModules });
    const wav = outFile.replace(/\.\w+$/, '.wav');

    if (chunks.length === 1) {
      const audio = await tts.generate(text, { voice: voice.voiceId, speed });
      await audio.save(wav);
      return { file: wav };
    }

    const parts = [];
    for (const chunk of chunks) {
      parts.push(await tts.generate(chunk, { voice: voice.voiceId, speed }));
    }
    const merged = concatRawAudio(parts);
    await merged.save(wav);
    return { file: wav, note: `split into ${chunks.length} chunks to stay inside Kokoro's token limit` };
  },

  /**
   * Gemini TTS. Returns raw PCM in a base64 inlineData part, so it is wrapped
   * into a WAV container here rather than written straight to disk.
   */
  async gemini({ text, outFile, voice, ratePct }) {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!key) throw new Error('GEMINI_API_KEY (or GOOGLE_API_KEY) is not set');
    const model = voice.model || 'gemini-2.5-flash-preview-tts';

    // Gemini has no numeric rate parameter, but style IS steerable in prose —
    // so the requested rate becomes an instruction, and any residual mismatch
    // is corrected by atempo afterwards.
    const pace =
      ratePct > 1 ? 'Speak slightly faster than normal. ' : ratePct < -1 ? 'Speak slightly slower than normal. ' : '';
    const prompt = `${pace}Narrate this in a clear, confident, professional documentary voice: ${text}`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName: voice.voiceId } },
            },
          },
        }),
      }
    );
    if (!res.ok) throw new Error(`Gemini TTS ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const json = await res.json();
    const part = json?.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
    if (!part) throw new Error('Gemini TTS returned no audio part');
    const pcm = Buffer.from(part.inlineData.data, 'base64');
    const rate = Number(/rate=(\d+)/.exec(part.inlineData.mimeType ?? '')?.[1] ?? 24_000);
    const wav = outFile.replace(/\.\w+$/, '.wav');
    writeFileSync(wav, wrapPcmAsWav(pcm, { sampleRate: rate }));
    return { file: wav };
  },

  async openai({ text, outFile, voice, ratePct }) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) throw new Error('OPENAI_API_KEY is not set');
    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        model: voice.model || 'gpt-4o-mini-tts',
        voice: voice.voiceId,
        input: text,
        speed: Number(formatRate(ratePct, 'openai')),
        response_format: 'mp3',
      }),
    });
    if (!res.ok) throw new Error(`OpenAI TTS ${res.status}: ${(await res.text()).slice(0, 300)}`);
    writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
    return { file: outFile };
  },

  async elevenlabs({ text, outFile, voice }) {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) throw new Error('ELEVENLABS_API_KEY is not set');
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice.voiceId}`, {
      method: 'POST',
      headers: { 'xi-api-key': key, 'content-type': 'application/json' },
      body: JSON.stringify({ text, model_id: voice.model || 'eleven_multilingual_v2' }),
    });
    if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text()).slice(0, 300)}`);
    writeFileSync(outFile, Buffer.from(await res.arrayBuffer()));
    return { file: outFile };
  },

  /** edge-tts CLI from the project-local venv. Also emits a real SRT. */
  async edge({ text, outFile, voice, ratePct, bins }) {
    if (!bins.edgeTts) throw new Error('edge-tts is not installed in .runtime/.venv');
    const srtFile = outFile.replace(/\.\w+$/, '.srt');
    await exec(
      bins.edgeTts,
      [
        '--voice', voice.voiceId,
        '--rate', formatRate(ratePct, 'edge'),
        '--text', text,
        '--write-media', outFile,
        '--write-subtitles', srtFile,
      ],
      { timeout: 180_000 }
    );
    return { file: outFile, srt: existsSync(srtFile) ? readFileSync(srtFile, 'utf8') : null };
  },

  /** OS voice: always available, never good. The guaranteed floor. */
  async system({ text, outFile, voice, ratePct }) {
    if (platform === 'darwin') {
      const aiff = outFile.replace(/\.\w+$/, '.aiff');
      const wpm = Math.round(180 * (1 + ratePct / 100));
      const args = ['-o', aiff, '-r', String(wpm)];
      if (voice.voiceId) args.push('-v', voice.voiceId);
      await exec('/usr/bin/say', [...args, text], { timeout: 300_000 });
      return { file: aiff };
    }
    const wav = outFile.replace(/\.\w+$/, '.wav');
    // espeak-ng takes the gender variant as part of the voice name (en+f3).
    const args = ['-w', wav, '-s', String(Math.round(175 * (1 + ratePct / 100)))];
    if (voice.voiceId) args.push('-v', voice.voiceId);
    await exec('espeak-ng', [...args, text], { timeout: 300_000 });
    return { file: wav };
  },
};

// ---------------------------------------------------------------------------
// Provider availability & selection
// ---------------------------------------------------------------------------

/**
 * Which providers can actually run here, and which agent CLIs hint at keys the
 * user may already have. Reported honestly: a CLI's presence is a hint, not a
 * capability.
 */
export async function availableProviders({ capabilities, bins }) {
  const hints = [];
  for (const [cli, meaning] of Object.entries({
    gemini: 'gemini — Gemini API TTS is available if GEMINI_API_KEY is set',
    codex: 'codex — OpenAI TTS is available if OPENAI_API_KEY is set',
    claude: 'claude — Anthropic exposes NO speech-synthesis endpoint; cannot be used for TTS',
    'kiro-cli': 'kiro-cli — no speech-synthesis capability; cannot be used for TTS',
  })) {
    if (await onPath(cli)) hints.push(meaning);
  }

  const available = {
    kokoro: Boolean(capabilities.tts?.kokoro),
    gemini: Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY),
    openai: Boolean(process.env.OPENAI_API_KEY),
    elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
    edge: Boolean(bins.edgeTts),
    system: platform === 'darwin' ? existsSync('/usr/bin/say') : Boolean(await onPath('espeak-ng')),
  };
  return { available, hints };
}

/** Preference order for `--tts=auto`: quality and licence-cleanliness first. */
export const AUTO_ORDER = ['kokoro', 'gemini', 'openai', 'elevenlabs', 'system', 'edge'];

export function resolveProvider(requested, available, { acknowledgeEdge = false } = {}) {
  if (requested && requested !== 'auto') {
    if (!available[requested]) throw new Error(`TTS provider "${requested}" is not available here`);
    if (requested === 'edge' && !acknowledgeEdge) {
      throw new Error(
        'edge-tts is an unofficial reverse-engineered Microsoft endpoint. Its maintainer states it is for ' +
          'personal use and unsuitable for anything mission-critical. Re-run with --acknowledge-edge-tts to proceed, ' +
          'or use --tts=kokoro (local, Apache-2.0) for commercial work.'
      );
    }
    return requested;
  }
  const pick = AUTO_ORDER.find((p) => available[p] && (p !== 'edge' || acknowledgeEdge));
  if (!pick) throw new Error('no speech provider available — run bootstrap.mjs to install Kokoro, or set an API key');
  return pick;
}

// ---------------------------------------------------------------------------
// Stage entry point
// ---------------------------------------------------------------------------

/**
 * Synthesise narration for every scene, probe true durations, and write the
 * timing plan back into the manifest.
 *
 * Two-pass per scene where the visual is inelastic (D13): synthesise flat,
 * measure, compute the rate needed to fit, then re-synthesise (free providers)
 * or atempo-stretch (paid providers, to avoid double billing).
 */
export async function synthesise({ workDir, manifest, options = {} }) {
  const { paths, capabilities, bins } = await probe(workDir);
  const ff = new Ffmpeg(bins);
  const ledger = new Ledger(paths.ledger, { noCache: options.noCache });
  const { available, hints } = await availableProviders({ capabilities, bins });

  const provider = resolveProvider(options.tts ?? manifest.meta?.voice?.provider ?? 'auto', available, {
    acknowledgeEdge: options.acknowledgeEdgeTts,
  });
  // Resolved once, here, so the cache key and every provider adapter see the
  // same voice id — no adapter carries its own default.
  const voice = {
    ...(manifest.meta?.voice ?? {}),
    provider,
    voiceId: resolveVoiceId({
      provider,
      gender: options.voiceGender ?? manifest.meta?.voice?.gender ?? null,
      voiceId: manifest.meta?.voice?.voiceId ?? null,
    }),
  };
  const paid = provider === 'openai' || provider === 'elevenlabs';

  mkdirSync(paths.audio, { recursive: true });
  const report = { provider, voiceId: voice.voiceId, hints, scenes: [], warnings: [] };

  for (const scene of manifest.scenes) {
    if (scene.visualEngine === 'manual_footage' && scene.useFootageAudio) {
      report.scenes.push({ id: scene.id, skipped: 'uses its own footage audio' });
      continue;
    }

    const ext = provider === 'kokoro' || provider === 'gemini' || provider === 'system' ? 'wav' : 'mp3';
    const outFile = path.join(paths.audio, `${scene.id}.${ext}`);

    // --- pass 1: flat synthesis (cached) ---------------------------------
    const flatKey = audioCacheKey({ narration: scene.narration }, voice);
    let entry = ledger.get(flatKey, `${scene.id} audio`);
    let file = entry?.path;
    let srt = entry?.srt ?? null;

    if (!file) {
      const result = await providers[provider]({
        text: scene.narration, outFile, voice, ratePct: 0, paths, bins,
      });
      file = result.file;
      srt = result.srt ?? null;
      const durationMs = await ff.durationMs(file);
      entry = ledger.put(flatKey, { path: file, srt, durationMs }, `${scene.id} audio`);
    }
    let durationMs = entry?.durationMs ?? (await ff.durationMs(file));

    // --- timing plan ------------------------------------------------------
    const captureMode = scene.captureMode ?? (SLIDE_ENGINES.has(scene.visualEngine) ? 'stills' : 'screencast');
    const visualMs = scene.resolvedVisual?.durationMs ?? scene.expectedVisualMs ?? null;

    let timing;
    if (captureMode === 'stills' || !visualMs) {
      // Elastic visual (or visual not captured yet): audio dictates.
      timing = planTiming({ audioMs: durationMs, visualMs: durationMs, captureMode: 'stills' });
    } else {
      timing = planTiming({ audioMs: durationMs, visualMs, captureMode: 'screencast' });

      // --- pass 2: fit the speech to the inelastic visual ---------------
      if (Math.abs(timing.ratePct) >= 0.5) {
        if (NATIVE_RATE.has(provider) && !paid) {
          const ratedKey = audioCacheKey({ narration: scene.narration, ratePct: timing.ratePct }, voice);
          const cached = ledger.get(ratedKey, `${scene.id} audio@${timing.ratePct}%`);
          if (cached) {
            file = cached.path;
            srt = cached.srt ?? null;
            durationMs = cached.durationMs;
          } else {
            const rated = await providers[provider]({
              text: scene.narration,
              outFile: outFile.replace(/(\.\w+)$/, `.r$1`),
              voice, ratePct: timing.ratePct, paths, bins,
            });
            file = rated.file;
            srt = rated.srt ?? null;
            durationMs = await ff.durationMs(file);
            ledger.put(ratedKey, { path: file, srt, durationMs }, `${scene.id} audio@${timing.ratePct}%`);
          }
        } else {
          // Paid or rate-less provider: stretch the existing audio instead of
          // paying for a second synthesis.
          const stretched = outFile.replace(/(\.\w+)$/, '.fit$1');
          const filter = atempoFilter(timing.ratePct);
          if (filter) {
            await ff.run(['-y', '-i', file, '-af', filter, stretched]);
            file = stretched;
            durationMs = await ff.durationMs(file);
            report.warnings.push(
              `${scene.id}: speech time-stretched ${timing.ratePct}% with atempo (provider "${provider}" ` +
                `${paid ? 'is billed per request' : 'has no rate parameter'})`
            );
          }
        }
      }
    }

    scene.resolvedAudio = {
      filePath: path.relative(workDir, file),
      durationMs,
      subtitleSource: srt ? 'provider' : 'synthesised',
      providerSrt: srt ?? null,
      hasNativeSrt: NATIVE_SRT.has(provider),
      hash: flatKey,
    };
    scene.resolvedTiming = timing;
    scene.ratePct = timing.ratePct;
    report.scenes.push({ id: scene.id, durationMs, ratePct: timing.ratePct, mode: timing.mode });
    report.warnings.push(...timing.warnings.map((w) => `${scene.id}: ${w}`));
  }

  ledger.save();
  report.cache = ledger.report();
  return { manifest, report };
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

async function onPath(cmd) {
  try {
    await exec(platform === 'win32' ? 'where' : 'which', [cmd]);
    return true;
  } catch {
    return false;
  }
}

/** Wrap raw little-endian PCM (Gemini's output) in a minimal WAV container. */
export function wrapPcmAsWav(pcm, { sampleRate = 24_000, channels = 1, bitsPerSample = 16 } = {}) {
  const blockAlign = (channels * bitsPerSample) / 8;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(channels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * blockAlign, 28);
  header.writeUInt16LE(blockAlign, 32);
  header.writeUInt16LE(bitsPerSample, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (isMainModule(import.meta.url)) {
  const args = parseArgs(process.argv.slice(2));
  const workDir = presentationContext({ root: args.root, presentation: args.presentation }).paths.workDir;
  const manifestPath = path.join(workDir, 'storyboard.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const { manifest: updated, report } = await synthesise({
    workDir,
    manifest,
    options: {
      tts: args.tts,
      voiceGender: args['voice-gender'],
      noCache: Boolean(args['no-cache']),
      acknowledgeEdgeTts: Boolean(args['acknowledge-edge-tts']),
    },
  });
  writeFileSync(manifestPath, `${JSON.stringify(updated, null, 2)}\n`);
  console.log(`provider: ${report.provider} / voice: ${report.voiceId ?? '(provider default)'}`);
  for (const hint of report.hints) console.log(`  hint: ${hint}`);
  for (const s of report.scenes) {
    console.log(`  ${s.id}: ${s.skipped ?? `${Math.round(s.durationMs)}ms (${s.mode}, rate ${s.ratePct}%)`}`);
  }
  for (const w of report.warnings) console.warn(`  warning: ${w}`);
  console.log(report.cache);
}

export function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const [key, inline] = a.slice(2).split('=');
    if (inline !== undefined) out[key] = inline;
    else if (argv[i + 1] && !argv[i + 1].startsWith('--')) out[key] = argv[++i];
    else out[key] = true;
  }
  return out;
}

/**
 * Bare words, with flag values skipped exactly as parseArgs consumes them.
 *
 * Needed because the mode is a positional (`generate.mjs slides`), and a naive
 * scan would mistake `--presentation slides` for one.
 */
export function positionals(argv) {
  const out = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      out.push(a);
      continue;
    }
    if (!a.includes('=') && argv[i + 1] && !argv[i + 1].startsWith('--')) i += 1;
  }
  return out;
}
