/**
 * presentation-producer :: capability probe (D6)
 *
 * Reports, never installs. Everything is resolved against the project-local
 * runtime first (D5), so a hermetic install never depends on the user's PATH.
 *
 * Verified constraints encoded here:
 *   - ffmpeg/ffprobe come from ffmpeg-static/ffprobe-static npm packages, so
 *     they are never a system prerequisite.
 *   - VHS requires BOTH `ttyd` and `ffmpeg` on PATH, and `ttyd` has no usable
 *     upstream macOS binary (brew only). Terminal capture therefore degrades.
 *   - Playwright browsers live under PLAYWRIGHT_BROWSERS_PATH, which must be
 *     set at install time AND at run time.
 */

import { execFile } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { platform } from 'node:process';
import path from 'node:path';
import { promisify } from 'node:util';

import { findDiagramDesign, findPython } from './diagram-io.mjs';
import { guidanceInstalled } from './guidance.mjs';

const exec = promisify(execFile);

/**
 * Paths for one presentation inside a work root (D2, D17).
 *
 * The root holds exactly one shared thing — `.runtime/`, the install. Everything
 * else belongs to a single presentation and lives inside `<root>/<slug>/`, so
 * renaming or deleting that directory moves or removes the presentation whole.
 * The ledger deliberately sits WITH the artifacts it indexes rather than in
 * `.runtime/`: the index and the data then share a lifetime, `.runtime/` means
 * only "the install", and two presentations can never trade cache entries.
 *
 * `slug` is derived from the directory name and never from inside the YAML,
 * because this function is called by the bootstrap — code that runs in order to
 * CREATE `.runtime/`, where the YAML parser lives. Path resolution therefore
 * stays install-free (D5).
 *
 * `workDir` is the presentation directory. It keeps its old name because it is
 * the anchor every author-supplied relative path resolves against (htmlPath,
 * setupScript, footage src, design, fontFile).
 *
 * @param {string}      root  work root, e.g. `presentations`
 * @param {string|null} slug  presentation directory name; null addresses the root itself
 */
export function runtimePaths(root, slug = null) {
  const runtime = path.join(root, '.runtime');
  const workDir = slug ? path.join(root, slug) : root;
  return {
    root,
    slug: slug ?? null,
    workDir,
    runtime,
    nodeModules: path.join(runtime, 'node_modules'),
    browsers: path.join(runtime, 'browsers'),
    venv: path.join(runtime, '.venv'),
    bin: path.join(runtime, 'bin'),
    remotion: path.join(runtime, 'remotion'),
    authState: path.join(runtime, 'auth.json'),
    envFile: path.join(runtime, '.env'),
    ledger: path.join(workDir, 'ledger.json'),
    storyline: path.join(workDir, 'storyline.yml'),
    storyboard: path.join(workDir, 'storyboard.json'),
    scenes: path.join(workDir, 'scenes'),
    footage: path.join(workDir, 'footage'),
    assets: path.join(workDir, 'assets'),
    audio: path.join(workDir, 'assets', 'audio'),
    recordings: path.join(workDir, 'assets', 'recordings'),
    slides: path.join(workDir, 'assets', 'slides'),
    frames: path.join(workDir, 'assets', 'frames'),
    processed: path.join(workDir, 'assets', 'processed'),
    output: path.join(workDir, 'output'),
  };
}

/**
 * Presentations in a work root: a BOUNDED single-level listing (D4).
 *
 * This is deliberately not the recursive walk the brand-file decision forbids.
 * There is no recursion, no ignore semantics and no platform-dependent ordering
 * — one `readdirSync` of one known directory, sorted. A directory counts as a
 * presentation only when it holds a `storyline.yml`, so half-created folders and
 * stray output directories cannot be selected by accident. Dot-directories are
 * skipped, which is what excludes the shared `.runtime/` install.
 *
 * @returns {string[]} slugs, sorted
 */
export function presentationSlugs(root) {
  if (!existsSync(root)) return [];
  return readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'))
    .map((e) => e.name)
    .filter((name) => existsSync(path.join(root, name, 'storyline.yml')))
    .sort();
}

/**
 * Resolve which presentation a run addresses (D4, D5).
 *
 * Never guesses. With no request and several candidates it reports ambiguity
 * rather than picking the first, because silently building the wrong deck is
 * worse than stopping. Slugs differing only by case are a hard error: on a
 * case-insensitive filesystem they address one directory under two identities,
 * and the requirement was zero conflicts.
 *
 * @returns {{slug: string|null, dir: string|null, candidates: string[], error: string|null}}
 */
export function resolvePresentation(root, requested = null) {
  const candidates = presentationSlugs(root);
  const found = new Map();
  for (const name of candidates) {
    const key = name.toLowerCase();
    if (found.has(key)) {
      return {
        slug: null, dir: null, candidates,
        error:
          `presentation slugs "${found.get(key)}" and "${name}" differ only by case — ` +
          'on a case-insensitive filesystem they address the same directory. Rename one.',
      };
    }
    found.set(key, name);
  }

  const chosen = requested ?? (candidates.length === 1 ? candidates[0] : null);
  if (chosen && candidates.includes(chosen)) {
    return { slug: chosen, dir: path.join(root, chosen), candidates, error: null };
  }

  const known = candidates.length ? `found: ${candidates.join(', ')}` : `${root} holds no presentations yet`;
  return {
    slug: null, dir: null, candidates,
    error: requested
      ? `no presentation "${requested}" in ${root} — ${known}`
      : `pass --presentation=<slug> — ${known}`,
  };
}

/**
 * Same paths, derived from a presentation directory.
 *
 * A presentation directory always sits DIRECTLY inside its root (D2, D3), so the
 * root is its parent and the slug is its basename. Every stage already receives
 * the presentation directory, which is why they keep their single-argument
 * signatures instead of threading a root and a slug through six call sites.
 */
export function presentationPaths(workDir) {
  return runtimePaths(path.dirname(workDir), path.basename(workDir));
}

/** Default work root. Named for what it contains, never for the tool (D7). */
export const DEFAULT_ROOT = 'presentations';

/**
 * Resolve the presentation a CLI invocation addresses, or fail with a message
 * that lists the candidates.
 *
 * Throwing rather than returning keeps every entry point to one line: the
 * failure is always "say which presentation", and there is nothing useful a
 * stage can do with a partial answer. Non-interactive runs therefore fail loudly
 * with the candidate list instead of picking the first slug alphabetically (D15).
 */
export function presentationContext({ root, presentation } = {}) {
  const resolvedRoot = path.resolve(root ?? DEFAULT_ROOT);
  const { slug, error, candidates } = resolvePresentation(resolvedRoot, presentation ?? null);
  if (error) throw new Error(error);
  return { root: resolvedRoot, slug, candidates, paths: runtimePaths(resolvedRoot, slug) };
}

/** Resolve ffmpeg/ffprobe: project-local static builds first, PATH as fallback. */
export async function resolveFfmpeg(paths) {
  const candidates = {
    ffmpeg: [
      path.join(paths.nodeModules, 'ffmpeg-static', platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'),
      path.join(paths.bin, platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'),
    ],
    ffprobe: [
      path.join(paths.nodeModules, 'ffprobe-static', 'bin', platform, process.arch, platform === 'win32' ? 'ffprobe.exe' : 'ffprobe'),
      path.join(paths.bin, platform === 'win32' ? 'ffprobe.exe' : 'ffprobe'),
    ],
  };

  const out = {};
  for (const [tool, list] of Object.entries(candidates)) {
    out[tool] = list.find((p) => existsSync(p)) ?? (await onPath(tool));
  }
  return out;
}

async function onPath(cmd) {
  try {
    const which = platform === 'win32' ? 'where' : 'which';
    const { stdout } = await exec(which, [cmd]);
    const first = stdout.split(/\r?\n/).find(Boolean);
    return first ? first.trim() : null;
  } catch {
    return null;
  }
}

async function version(bin, args = ['--version']) {
  if (!bin) return null;
  try {
    const { stdout, stderr } = await exec(bin, args, { timeout: 15_000 });
    return (stdout || stderr).split(/\r?\n/)[0]?.trim() ?? 'present';
  } catch {
    return null;
  }
}

/**
 * Build the capability map that gates storyboard authoring (D6).
 * The agent must only author scene types the environment can actually render.
 *
 * `paths` is injectable because the bootstrap probes the ROOT — where `.runtime`
 * lives — while every other caller probes a presentation directory inside it.
 */
export async function probe(workDir, paths = presentationPaths(workDir)) {
  const { ffmpeg, ffprobe } = await resolveFfmpeg(paths);

  const playwrightInstalled = existsSync(path.join(paths.nodeModules, 'playwright'));
  const browsersInstalled = existsSync(paths.browsers);
  const remotionInstalled = existsSync(path.join(paths.remotion, 'node_modules', 'remotion'));
  const kokoroInstalled = existsSync(path.join(paths.nodeModules, 'kokoro-js'));
  const marpInstalled = existsSync(path.join(paths.nodeModules, '@marp-team', 'marp-cli'));
  const mermaidInstalled = existsSync(path.join(paths.nodeModules, '@mermaid-js', 'mermaid-cli'));
  const yamlInstalled = existsSync(path.join(paths.nodeModules, 'yaml'));
  const iconsInstalled = existsSync(path.join(paths.nodeModules, 'lucide-static', 'icons'));
  const deckFontInstalled = existsSync(path.join(paths.nodeModules, '@fontsource-variable', 'inter'));

  const vhsBin =
    [path.join(paths.bin, platform === 'win32' ? 'vhs.exe' : 'vhs')].find((p) => existsSync(p)) ??
    (await onPath('vhs'));
  const ttydBin =
    [path.join(paths.bin, platform === 'win32' ? 'ttyd.exe' : 'ttyd')].find((p) => existsSync(p)) ??
    (await onPath('ttyd'));

  const venvPython = path.join(paths.venv, platform === 'win32' ? 'Scripts' : 'bin', platform === 'win32' ? 'python.exe' : 'python');
  const edgeTtsBin = path.join(paths.venv, platform === 'win32' ? 'Scripts' : 'bin', platform === 'win32' ? 'edge-tts.exe' : 'edge-tts');

  const diagramSkill = findDiagramDesign([paths.workDir, process.cwd()]);
  const python3 = await findPython();

  const capabilities = {
    node: process.version,
    platform,
    ffmpeg: Boolean(ffmpeg),
    ffprobe: Boolean(ffprobe),
    playwright: playwrightInstalled && browsersInstalled,
    remotion: remotionInstalled,
    marp: marpInstalled,
    mermaid: mermaidInstalled,
    // The deck layer needs a YAML parser to compile storyline.yml, plus the icon
    // set and font it embeds. Rendering itself reuses the Playwright browser.
    deck: yamlInstalled && iconsInstalled && browsersInstalled && playwrightInstalled,
    deckParts: { yaml: yamlInstalled, icons: iconsInstalled, font: deckFontInstalled },
    // VHS needs itself AND ttyd AND ffmpeg. Any missing piece disables it.
    vhs: Boolean(vhsBin && ttydBin && ffmpeg),
    // Opt-in search corpus (--with-guidance): a soft enhancement, never gating.
    guidance: guidanceInstalled(paths),
    // Diagrams are drawn at authoring time by the diagram-design skill and frozen;
    // a build only reads them. Its self_check.py needs a system python3. Both are
    // soft: without them a build still runs and reports what went unchecked.
    diagramDesign: diagramSkill ? diagramSkill.version : false,
    python3: Boolean(python3),
    tts: {
      kokoro: kokoroInstalled,
      edge: existsSync(edgeTtsBin),
      openai: Boolean(process.env.OPENAI_API_KEY),
      elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
    },
  };

  const bins = { ffmpeg, ffprobe, vhs: vhsBin, ttyd: ttydBin, python: existsSync(venvPython) ? venvPython : null, edgeTts: existsSync(edgeTtsBin) ? edgeTtsBin : null };

  return { paths, capabilities, bins, notes: explain(capabilities, bins) };
}

/**
 * Turn a capability map into actionable guidance. Per-platform, because the
 * remedies genuinely differ — notably ttyd on macOS.
 */
export function explain(capabilities, bins = {}) {
  const notes = [];

  if (!capabilities.ffmpeg || !capabilities.ffprobe) {
    notes.push({
      capability: 'ffmpeg',
      severity: 'blocking',
      message:
        'ffmpeg/ffprobe unavailable. Every stage needs them (ffprobe is the duration prober). ' +
        'Run the bootstrap to install the project-local static builds — no system install required.',
    });
  }
  if (!capabilities.playwright) {
    notes.push({
      capability: 'playwright',
      severity: 'blocking',
      message: 'Playwright or its Chromium build is missing. Run the bootstrap; browsers install into .runtime/browsers.',
    });
  }
  if (!capabilities.remotion) {
    notes.push({
      capability: 'remotion',
      severity: 'degrades',
      message:
        'Remotion is not installed: 16:9 output still works via ffmpeg, but vertical reframing, ' +
        'kinetic captions and picture-in-picture will be skipped and reported.',
    });
  }
  if (!capabilities.vhs) {
    const why = !bins.vhs ? 'vhs binary missing' : !bins.ttyd ? 'ttyd missing (VHS requires it)' : 'ffmpeg missing';
    const remedy =
      capabilities.platform === 'darwin'
        ? 'brew install charmbracelet/tap/vhs ttyd — ttyd has no usable prebuilt macOS binary, so brew is the only route.'
        : 'the bootstrap can download vhs and ttyd release binaries into .runtime/bin on this platform.';
    notes.push({
      capability: 'vhs',
      severity: 'degrades',
      message: `Terminal capture unavailable (${why}). ${remedy} Terminal scenes will fall back to styled code slides.`,
    });
  }
  // Only fire once guidance has actually been probed (=== false), not when the
  // key is simply absent: it is opt-in, so its normal state is "not requested",
  // which must stay silent and keep a bare environment noteless.
  if (capabilities.diagramDesign === false) {
    notes.push({
      capability: 'diagramDesign',
      severity: 'degrades',
      message:
        'diagram-design is not installed, so `diagram:` slides cannot be drawn. Import ' +
        'https://github.com/cathrynlavery/diagram-design/tree/main/skills/diagram-design into .kiro/skills/ (or `npx skills add cathrynlavery/diagram-design`). Already-frozen diagrams still render.',
    });
  }
  if (capabilities.python3 === false) {
    notes.push({
      capability: 'python3',
      severity: 'degrades',
      message: "python3 not found: diagram-design's self_check.py cannot run, so diagram geometry is reported unchecked. Diagrams still render.",
    });
  }
  if (capabilities.guidance === false) {
    notes.push({
      capability: 'guidance',
      severity: 'degrades',
      message:
        'modern-web-guidance is not installed: the deck still renders with the modern CSS it motivated, ' +
        'but its searchable design/CSS guides are unavailable. Bootstrap with --with-guidance to add them ' +
        '(opt-in; ~37MB, and it requires Node >=20).',
    });
  }
  const anyTts = Object.values(capabilities.tts ?? {}).some(Boolean);
  if (!anyTts) {
    notes.push({
      capability: 'tts',
      severity: 'blocking',
      message:
        'No speech provider available. Kokoro (local, Apache-2.0) is the default and installs with the bootstrap. ' +
        'Alternatively set OPENAI_API_KEY or ELEVENLABS_API_KEY.',
    });
  }
  return notes;
}

/** True when nothing blocking is missing. */
export function isRunnable(notes) {
  return !notes.some((n) => n.severity === 'blocking');
}

/**
 * Which scene types may the agent author in this environment (D6)?
 * Authoring is gated so the pipeline never plans something it cannot render.
 */
export function allowedSceneTypes(capabilities) {
  const allowed = ['manual_footage'];
  if (capabilities.marp) allowed.push('marp_slides');
  if (capabilities.deck) allowed.push('html_slides');
  if (capabilities.playwright) allowed.push('playwright_web');
  if (capabilities.vhs) allowed.push('vhs_terminal');
  if (capabilities.remotion) allowed.push('remotion_motion');
  return allowed;
}
