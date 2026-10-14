/**
 * Unit tests for the ffmpeg filtergraph builders, probe explanations and the
 * cache ledger. All pure or filesystem-only: no ffmpeg, no npm install.
 *
 *   node --test scripts/lib/support.test.mjs
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  atempoFilter,
  cfrEncodeArgs,
  concatArgs,
  concatListFile,
  freezePadFilter,
  letterboxFilter,
  loudnormFilter,
  mergeSceneArgs,
  normaliseClipArgs,
  parseFps,
  reframeFilter,
  silencePadFilter,
  subtitlesFilter,
  xfadeArgs,
} from './ffmpeg.mjs';
import { allowedSceneTypes, explain, isRunnable, runtimePaths } from './probe.mjs';
import { Ledger } from './ledger.mjs';
import { computeReframe } from './core.mjs';
import {
  RELEVANT_CATEGORIES,
  buildGuidanceCommand,
  guidanceCliPath,
  guidesDir,
  listRelevantGuides,
} from './guidance.mjs';

// ---------------------------------------------------------------------------
// fps parsing
// ---------------------------------------------------------------------------

test('parseFps handles ffprobe rational rates', () => {
  assert.equal(parseFps('30/1'), 30);
  assert.equal(parseFps('30000/1001'), 29.97);
  assert.equal(parseFps('25'), 25);
  assert.equal(parseFps('0/0'), null);
  assert.equal(parseFps(null), null);
});

// ---------------------------------------------------------------------------
// CFR encode — the fix for Playwright's variable-rate screencast
// ---------------------------------------------------------------------------

test('cfrEncodeArgs pins both input and output to a constant frame rate', () => {
  const args = cfrEncodeArgs({ pattern: 'f/%06d.jpg', fps: 30, out: 'o.mp4' });
  const joined = args.join(' ');
  assert.match(joined, /-framerate 30/, 'input rate must be declared');
  assert.match(joined, /fps=30/, 'output must be resampled to the target rate');
  assert.match(joined, /-fps_mode cfr/, 'Remotion rejects variable frame rate input');
  assert.match(joined, /format=yuv420p/, 'yuv420p for broad player compatibility');
  assert.equal(args.at(-1), 'o.mp4');
});

test('normaliseClipArgs letterboxes foreign footage into the timeline geometry', () => {
  const args = normaliseClipArgs({ input: 'in.mov', fps: 30, out: 'out.mp4', width: 1920, height: 1080 }).join(' ');
  assert.match(args, /force_original_aspect_ratio=decrease/);
  assert.match(args, /pad=1920:1080/);
  assert.match(args, /-an/, 'clip audio is dropped: narration is the audio source');
});

// ---------------------------------------------------------------------------
// D13 padding filters
// ---------------------------------------------------------------------------

test('freezePadFilter clones the last frame for the residual only when needed', () => {
  assert.equal(freezePadFilter(0), null);
  assert.equal(freezePadFilter(-5), null);
  assert.equal(freezePadFilter(2300), 'tpad=stop_mode=clone:stop_duration=2.300');
});

test('silencePadFilter pads audio rather than trimming the visual', () => {
  assert.equal(silencePadFilter(0), null);
  assert.equal(silencePadFilter(1400), 'apad=pad_dur=1.400');
});

test('atempoFilter stays inside the valid 0.5-2.0 range by chaining', () => {
  assert.equal(atempoFilter(0), null, 'a no-op rate must not add a filter');
  assert.equal(atempoFilter(6), 'atempo=1.06');
  assert.equal(atempoFilter(-6), 'atempo=0.94');
  // 150% faster => 2.5x, which must be split into chained stages.
  const chained = atempoFilter(150);
  assert.match(chained, /atempo=2/);
  assert.equal(chained.split(',').length, 2, `expected 2 stages, got: ${chained}`);
  for (const stage of chained.split(',')) {
    const factor = Number(stage.split('=')[1]);
    assert.ok(factor >= 0.5 && factor <= 2.0, `stage ${factor} outside atempo's valid range`);
  }
});

test('loudnormFilter targets broadcast-ish levels', () => {
  assert.equal(loudnormFilter(), 'loudnorm=I=-16:TP=-1.5:LRA=11');
  assert.equal(loudnormFilter({ i: -14 }), 'loudnorm=I=-14:TP=-1.5:LRA=11');
});

// ---------------------------------------------------------------------------
// D10 reframing filters
// ---------------------------------------------------------------------------

test('reframeFilter consumes computeReframe geometry and lands on the target size', () => {
  const crop = computeReframe({ srcW: 1920, srcH: 1080, dstW: 1080, dstH: 1920 });
  const filter = reframeFilter({ crop, dstW: 1080, dstH: 1920 });
  assert.match(filter, new RegExp(`^crop=${crop.width}:${crop.height}:${crop.x}:${crop.y},`));
  assert.match(filter, /scale=1080:1920/);
  assert.match(filter, /format=yuv420p$/);
});

test('letterboxFilter centres the frame and never crops', () => {
  const f = letterboxFilter({ dstW: 1080, dstH: 1920 });
  assert.match(f, /force_original_aspect_ratio=decrease/);
  assert.match(f, /pad=1080:1920:\(ow-iw\)\/2:\(oh-ih\)\/2/);
  assert.doesNotMatch(f, /crop=/);
});

// ---------------------------------------------------------------------------
// subtitles
// ---------------------------------------------------------------------------

test('subtitlesFilter escapes windows-style paths and colons', () => {
  const f = subtitlesFilter('C:\\videos\\scene-01.ass');
  assert.match(f, /C\\:\/videos\/scene-01\.ass/, `got ${f}`);
});

test('subtitlesFilter never emits force_style', () => {
  // force_style over an SRT is interpreted in libavcodec's 384x288 default
  // script space, which multiplied every declared pixel value by height/288.
  // Style now travels inside the ASS file, where it is resolution-correct.
  assert.ok(!subtitlesFilter('/tmp/a.ass').includes('force_style'));
});

test('subtitlesFilter passes a bundled font directory through when given one', () => {
  assert.match(subtitlesFilter('/tmp/a.ass', { fontsDir: '/tmp/fonts' }), /:fontsdir='\/tmp\/fonts'/);
  assert.ok(!subtitlesFilter('/tmp/a.ass').includes('fontsdir'), 'omitted unless asked for');
});

// ---------------------------------------------------------------------------
// scene merge and concat
// ---------------------------------------------------------------------------

test('mergeSceneArgs maps video from input 0 and narration from input 1', () => {
  const args = mergeSceneArgs({ video: 'v.mp4', audio: 'a.mp3', out: 'o.mp4', fps: 30 });
  const j = args.join(' ');
  assert.match(j, /-map 0:v:0/);
  assert.match(j, /-map 1:a:0/);
  assert.match(j, /-fps_mode cfr/);
  assert.match(j, /-c:a aac/);
});

test('mergeSceneArgs omits empty filter chains', () => {
  const args = mergeSceneArgs({ video: 'v.mp4', audio: 'a.mp3', out: 'o.mp4', fps: 30, videoFilters: [null], audioFilters: [] });
  assert.ok(!args.includes('-vf'));
  assert.ok(!args.includes('-af'));
});

test('mergeSceneArgs includes provided filters', () => {
  const args = mergeSceneArgs({
    video: 'v.mp4', audio: 'a.mp3', out: 'o.mp4', fps: 30,
    videoFilters: ['tpad=stop_mode=clone:stop_duration=1.000', null],
    audioFilters: ['atempo=1.06'],
  }).join(' ');
  assert.match(args, /-vf tpad=stop_mode=clone:stop_duration=1\.000/);
  assert.match(args, /-af atempo=1\.06/);
});

test('concatListFile quotes paths and escapes apostrophes', () => {
  const body = concatListFile(['/a/b.mp4', "/it's/here.mp4"]);
  assert.match(body, /^file '\/a\/b\.mp4'$/m);
  assert.match(body, /it'\\''s/);
  assert.ok(body.endsWith('\n'));
});

test('concatArgs stream-copies by default and re-encodes on request', () => {
  assert.match(concatArgs({ listFile: 'l.txt', out: 'o.mp4' }).join(' '), /-c copy/);
  const re = concatArgs({ listFile: 'l.txt', out: 'o.mp4', reencode: true, fps: 30 }).join(' ');
  assert.match(re, /-c:v libx264/);
  assert.match(re, /-r 30/);
});

test('xfadeArgs wires both video and audio cross-fades', () => {
  const j = xfadeArgs({ a: 'a.mp4', b: 'b.mp4', out: 'o.mp4', durationSec: 0.5, offsetSec: 6, fps: 30 }).join(' ');
  assert.match(j, /xfade=transition=fade:duration=0\.5:offset=6/);
  assert.match(j, /acrossfade=d=0\.5/);
  assert.match(j, /-map \[v\] -map \[a\]/);
});

// ---------------------------------------------------------------------------
// D6 capability probe reporting
// ---------------------------------------------------------------------------

test('runtimePaths keeps regenerable output out of the committed tree (D8)', () => {
  const p = runtimePaths('/proj/presentations', 'eitri-harness');
  assert.equal(p.storyboard, path.join('/proj/presentations/eitri-harness', 'storyboard.json'));
  assert.ok(p.nodeModules.includes(path.join('.runtime', 'node_modules')));
  assert.ok(p.browsers.includes(path.join('.runtime', 'browsers')));
  assert.ok(p.authState.includes('.runtime'), 'auth state must never be committed');
  assert.ok(!p.output.includes('.runtime'));
});

test('explain marks ffmpeg and playwright as blocking, remotion and vhs as degrading', () => {
  const notes = explain(
    { platform: 'linux', ffmpeg: false, ffprobe: false, playwright: false, remotion: false, vhs: false, tts: { kokoro: true } },
    {}
  );
  const by = (c) => notes.find((n) => n.capability === c);
  assert.equal(by('ffmpeg').severity, 'blocking');
  assert.equal(by('playwright').severity, 'blocking');
  assert.equal(by('remotion').severity, 'degrades');
  assert.equal(by('vhs').severity, 'degrades');
  assert.equal(isRunnable(notes), false);
});

test('explain gives macOS the brew remedy for ttyd, and Linux the download route', () => {
  const mac = explain({ platform: 'darwin', ffmpeg: true, ffprobe: true, playwright: true, remotion: true, vhs: false, tts: { kokoro: true } }, { vhs: '/usr/local/bin/vhs', ttyd: null });
  assert.match(mac.find((n) => n.capability === 'vhs').message, /brew install/);
  assert.match(mac.find((n) => n.capability === 'vhs').message, /ttyd missing/);

  const linux = explain({ platform: 'linux', ffmpeg: true, ffprobe: true, playwright: true, remotion: true, vhs: false, tts: { kokoro: true } }, { vhs: null, ttyd: null });
  assert.match(linux.find((n) => n.capability === 'vhs').message, /download vhs and ttyd/);
});

test('explain reports no-TTS as blocking', () => {
  const notes = explain({ platform: 'linux', ffmpeg: true, ffprobe: true, playwright: true, remotion: true, vhs: true, tts: {} }, {});
  assert.equal(notes.find((n) => n.capability === 'tts').severity, 'blocking');
  assert.equal(isRunnable(notes), false);
});

test('a fully provisioned environment is runnable with no notes', () => {
  const notes = explain(
    { platform: 'linux', ffmpeg: true, ffprobe: true, playwright: true, remotion: true, vhs: true, tts: { kokoro: true } },
    { vhs: '/v', ttyd: '/t' }
  );
  assert.deepEqual(notes, []);
  assert.equal(isRunnable(notes), true);
});

test('allowedSceneTypes gates authoring to what the environment can render', () => {
  // With nothing installed, only footage is authorable: a slide engine needs
  // either Marp or the deck layer, and both need an install to render at all.
  const minimal = allowedSceneTypes({ playwright: false, vhs: false, remotion: false, marp: false, deck: false });
  assert.deepEqual(minimal, ['manual_footage']);

  const slidesOnly = allowedSceneTypes({ playwright: true, marp: true, deck: true });
  assert.ok(slidesOnly.includes('marp_slides'));
  assert.ok(slidesOnly.includes('html_slides'));

  const full = allowedSceneTypes({ playwright: true, vhs: true, remotion: true, marp: true, deck: true });
  assert.ok(full.includes('playwright_web'));
  assert.ok(full.includes('vhs_terminal'));
  assert.ok(full.includes('remotion_motion'));
});

// ---------------------------------------------------------------------------
// D14 ledger
// ---------------------------------------------------------------------------

function withTempDir(fn) {
  const dir = mkdtempSync(path.join(tmpdir(), 'vg-ledger-'));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('ledger stores and returns an entry whose artifact still exists', () => {
  withTempDir((dir) => {
    const artifact = path.join(dir, 'a.mp3');
    writeFileSync(artifact, 'x');
    const l = new Ledger(path.join(dir, '.runtime', 'ledger.json'));
    l.put('k1', { path: artifact, durationMs: 1234 }, 'scene-01 audio');
    l.save();

    const reloaded = new Ledger(path.join(dir, '.runtime', 'ledger.json'));
    const hit = reloaded.get('k1', 'scene-01 audio');
    assert.equal(hit.durationMs, 1234);
    assert.deepEqual(reloaded.stats.hits, ['scene-01 audio']);
  });
});

test('ledger treats a vanished artifact as a miss and forgets it', () => {
  withTempDir((dir) => {
    const l = new Ledger(path.join(dir, 'ledger.json'));
    l.put('k1', { path: path.join(dir, 'gone.mp3') });
    assert.equal(l.get('k1'), null);
    assert.equal(l.get('k1'), null, 'entry is dropped, not re-reported');
    assert.ok(l.stats.misses.some((m) => /artifact missing/.test(m)));
  });
});

test('a null key is always a miss — this is what forces re-capture (D14)', () => {
  withTempDir((dir) => {
    const l = new Ledger(path.join(dir, 'ledger.json'));
    assert.equal(l.get(null, 'scene-01 capture'), null);
    const returned = l.put(null, { path: 'x' });
    assert.deepEqual(returned, { path: 'x' }, 'the artifact is still returned for use');
    assert.deepEqual(l.data.entries, {}, 'but an uncacheable artifact must never be stored');
  });
});

test('--no-cache bypasses every hit and says so', () => {
  withTempDir((dir) => {
    const file = path.join(dir, 'ledger.json');
    const warm = new Ledger(file);
    writeFileSync(path.join(dir, 'a.mp3'), 'x');
    warm.put('k1', { path: path.join(dir, 'a.mp3') });
    warm.save();

    const cold = new Ledger(file, { noCache: true });
    assert.equal(cold.get('k1'), null);
    assert.match(cold.report(), /cache disabled/);
  });
});

test('a corrupt ledger degrades to empty rather than throwing', () => {
  withTempDir((dir) => {
    const file = path.join(dir, 'ledger.json');
    writeFileSync(file, '{ not json');
    const l = new Ledger(file);
    assert.deepEqual(l.data.entries, {});
  });
});

test('a ledger from a future version is discarded, not misread', () => {
  withTempDir((dir) => {
    const file = path.join(dir, 'ledger.json');
    writeFileSync(file, JSON.stringify({ version: 99, entries: { k: { path: 'x' } } }));
    const l = new Ledger(file);
    assert.deepEqual(l.data.entries, {});
  });
});

test('ledger report names what was reused and what was rebuilt', () => {
  withTempDir((dir) => {
    writeFileSync(path.join(dir, 'a.mp3'), 'x');
    const l = new Ledger(path.join(dir, 'ledger.json'));
    l.put('k1', { path: path.join(dir, 'a.mp3') }, 'scene-01 audio');
    l.get('k1', 'scene-01 audio');
    l.get('k2', 'scene-02 capture');
    const r = l.report();
    assert.match(r, /1 reused, 1 rebuilt/);
    assert.match(r, /reused: scene-01 audio/);
    assert.match(r, /rebuilt: scene-02 capture/);
  });
});

// ---------------------------------------------------------------------------
// modern-web-guidance accessor (opt-in) — spawn shape is the security boundary
// ---------------------------------------------------------------------------

test('buildGuidanceCommand spawns via process.execPath with an args array, never a shell', () => {
  // The spawn shape IS the injection defence: the query must be one array
  // element run through execFile, so `shell` must never appear and the bin must
  // be the plain .mjs handed to Node, not npx or a shell shim.
  const paths = runtimePaths('/proj/presentations', 'eitri-harness');
  const cmd = buildGuidanceCommand(paths, 'search', 'balanced text wrapping; and $(evil)');
  assert.equal(cmd.command, process.execPath);
  assert.equal(cmd.args[0], guidanceCliPath(paths));
  assert.equal(cmd.args[1], 'search');
  assert.equal(cmd.args[2], 'balanced text wrapping; and $(evil)', 'the query travels as a single, un-split element');
  assert.equal(cmd.args.length, 3);
  assert.ok(!('shell' in cmd), 'a shell would re-open the injection channel the array closes');
});

test('buildGuidanceCommand always disables telemetry', () => {
  // Telemetry is ON by default and exfiltrates the agent's query and retrieved
  // ids to Google, so the accessor must force it off on every invocation.
  const paths = runtimePaths('/proj/presentations', 'eitri-harness');
  assert.equal(buildGuidanceCommand(paths, 'list').env.DISABLE_TELEMETRY, '1');
  assert.equal(buildGuidanceCommand(paths, 'search', 'q').env.DISABLE_TELEMETRY, '1');
});

test('buildGuidanceCommand omits the argument for list', () => {
  const paths = runtimePaths('/proj/presentations', 'eitri-harness');
  const cmd = buildGuidanceCommand(paths, 'list');
  assert.deepEqual(cmd.args, [guidanceCliPath(paths), 'list']);
});

test('guidanceCliPath and guidesDir resolve inside the hermetic runtime', () => {
  // Everything must live under .runtime/node_modules so nothing leaks onto the
  // user's PATH, matching the rest of the localisation contract.
  const paths = runtimePaths('/proj/presentations', 'eitri-harness');
  assert.ok(guidanceCliPath(paths).endsWith(path.join('modern-web-guidance', 'modern-web.mjs')));
  assert.ok(guidanceCliPath(paths).includes(path.join('.runtime', 'node_modules')));
  assert.ok(guidesDir(paths).endsWith(path.join('modern-web-guidance', 'guides')));
});

test('listRelevantGuides returns an empty list when the opt-in package is absent', () => {
  // Guidance is a best-effort enhancement: a missing install must degrade to
  // "no guides", never throw, so callers need no install to stay correct.
  const paths = runtimePaths('/proj/definitely-not-installed');
  assert.deepEqual(listRelevantGuides(paths), []);
});

test('listRelevantGuides reads real markdown files from the relevant categories only', () => {
  // Reading guides directly is the Tier 0 route (no child process); it must pick
  // up only visual-design and css, skip non-.md files, and ignore other dirs.
  withTempDir((dir) => {
    const paths = runtimePaths(dir);
    const root = path.join(paths.nodeModules, 'modern-web-guidance', 'skills', 'modern-web-guidance', 'guides');
    for (const category of RELEVANT_CATEGORIES) {
      mkdirSync(path.join(root, category), { recursive: true });
      writeFileSync(path.join(root, category, 'a.md'), '# a');
    }
    writeFileSync(path.join(root, 'css', 'notes.txt'), 'ignore me');
    mkdirSync(path.join(root, 'javascript'), { recursive: true });
    writeFileSync(path.join(root, 'javascript', 'b.md'), '# b');

    const found = listRelevantGuides(paths);
    assert.equal(found.length, 2, 'one .md per relevant category, non-.md and other dirs excluded');
    assert.deepEqual(found.map((g) => g.category).sort(), ['css', 'visual-design']);
    assert.ok(found.every((g) => g.name === 'a.md'));
  });
});

test('explain stays silent about guidance when it was never probed', () => {
  // Opt-in absence is the normal state, so a bare environment must not gain a
  // note just because guidance is off — the key is simply not present.
  const notes = explain(
    { platform: 'linux', ffmpeg: true, ffprobe: true, playwright: true, remotion: true, vhs: true, tts: { kokoro: true } },
    { vhs: '/v', ttyd: '/t' }
  );
  assert.equal(notes.find((n) => n.capability === 'guidance'), undefined);
});

test('explain flags absent guidance as degrading once it has been probed off', () => {
  const notes = explain(
    { platform: 'linux', ffmpeg: true, ffprobe: true, playwright: true, remotion: true, vhs: true, guidance: false, tts: { kokoro: true } },
    { vhs: '/v', ttyd: '/t' }
  );
  const note = notes.find((n) => n.capability === 'guidance');
  assert.equal(note.severity, 'degrades');
  assert.match(note.message, /--with-guidance/);
  assert.equal(isRunnable(notes), true, 'guidance never blocks: the deck renders without it');
});
