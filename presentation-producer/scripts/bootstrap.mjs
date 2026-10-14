#!/usr/bin/env node
/**
 * presentation-producer :: bootstrap
 *
 * Creates a project-local, hermetic working directory. Nothing is installed
 * globally and nothing on the user's PATH is required beyond Node — deleting
 * the directory fully uninstalls.
 *
 * VERIFIED localisation boundaries:
 *   npm deps, Remotion, Marp, Mermaid    -> .runtime/node_modules
 *   ffmpeg + ffprobe                     -> ffmpeg-static / ffprobe-static
 *   Chromium                             -> PLAYWRIGHT_BROWSERS_PATH (must be
 *                                           set at install AND at run time)
 *   Kokoro model                         -> .runtime/models
 *   edge-tts (optional)                  -> .runtime/.venv  (also avoids the
 *                                           system-Python problem on macOS)
 *   vhs                                  -> .runtime/bin (release tarball)
 *   ttyd                                 -> NOT localisable on macOS: no usable
 *                                           upstream binary, brew only. On
 *                                           Linux/Windows it downloads.
 *
 * Written in .mjs rather than bash on purpose: the plan's bash + jq + bc
 * scripts cannot run on Windows.
 */

import { execFile } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { platform } from 'node:process';
import { promisify } from 'node:util';

import { isMainModule } from './lib/core.mjs';
import { DEFAULT_ROOT, explain, isRunnable, probe, runtimePaths } from './lib/probe.mjs';

const exec = promisify(execFile);

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Pinned versions: a stranger's run should be reproducible. */
const DEPS = {
  base: {
    playwright: '1.63.0',
    'ffmpeg-static': '5.2.0',
    'ffprobe-static': '3.1.0',
  },
  tts: {
    'kokoro-js': '1.2.1',
  },
  slides: {
    '@marp-team/marp-cli': '4.2.3',
    '@mermaid-js/mermaid-cli': '11.4.2',
  },
  /**
   * Deck layer. `yaml` is required because Node ships no YAML parser, so
   * compiling storyline.yml sits on the far side of the install boundary — while
   * storyboard.json stays JSON and its validator stays dependency-free.
   *
   * The font is installed rather than named: it is embedded into the rendered
   * HTML so glyphs and wrapping cannot vary per machine. Captions had to name a
   * system font instead, because ASS has no fallback list and cannot embed.
   */
  deck: {
    yaml: '2.9.1',
    'lucide-static': '1.47.0',
    '@fontsource-variable/inter': '5.3.0',
  },
  remotion: {
    remotion: '4.0.360',
    '@remotion/cli': '4.0.360',
    '@remotion/captions': '4.0.360',
    '@remotion/transitions': '4.0.360',
    react: '19.2.0',
    'react-dom': '19.2.0',
  },
  /**
   * Modern-web-guidance search corpus. Opt-in (--with-guidance) and never in the
   * base install: it is ~37MB unpacked and, unlike the rest, declares
   * engines.node >=20.0.0 where the skill only promises "Node" — tolerable as a
   * soft constraint precisely because a user must ask for it. It ships the
   * guides as real files, so no vendoring is needed.
   */
  guidance: {
    'modern-web-guidance': '0.0.189',
  },
};

/**
 * Work-root-relative paths to ignore, split by regenerability: anything
 * rebuildable from storyboard.json is ignored, storyboard.json itself is not.
 *
 * The glob level exists because artifacts now live inside each presentation
 * (D2): `<root>/<slug>/assets/`, not `<root>/assets/`. `footage/` is deliberately
 * absent — generated footage cannot be pinned by hash, so it is committed and
 * its prompt kept as provenance. `ledger.json` is a cache that sits with the
 * artifacts it indexes (D17), so it is ignored with them.
 */
const GITIGNORE_ENTRIES = ['.runtime/', '*/assets/', '*/output/', '*/ledger.json', '*/deck*.md', '*/*.log'];

/** Marker so re-running bootstrap refreshes its block instead of duplicating it. */
const GITIGNORE_MARKER = '# presentation-producer:';

/**
 * Merge the work-dir ignore rules into an existing .gitignore body.
 *
 * Pure so it is testable without touching a repo. A previous block for the same
 * work directory is replaced rather than appended to, which makes re-running
 * bootstrap idempotent; blocks for other work directories are left alone.
 *
 * @param {string} existing  current file contents ('' for a new file)
 * @param {string} prefix    work dir path relative to the .gitignore, '' if same dir
 */
export function mergeGitignore(existing, prefix) {
  const label = prefix || '.';
  const header = `${GITIGNORE_MARKER} ${label}`;
  const body = GITIGNORE_ENTRIES.map((entry) => (prefix ? `${prefix}/${entry}` : entry));
  const block = [header, ...body].join('\n');

  // Drop any prior block for this same work dir: from its header to the blank
  // line or next comment that follows it.
  const previous = new RegExp(`(^|\\n)${escapeRegex(header)}\\n(?:[^\\n#][^\\n]*\\n?)*`, 'g');
  const cleaned = existing.replace(previous, '$1').replace(/\n{3,}/g, '\n\n');

  if (!cleaned.trim()) return `${block}\n`;
  return `${cleaned.replace(/\n*$/, '')}\n\n${block}\n`;
}

/**
 * Nearest existing .gitignore at or above the work directory's parent.
 *
 * Rules belong in the project's own .gitignore, not in a second file inside the
 * work dir that nobody expects to find. The search deliberately starts at the
 * parent: a .gitignore inside the work dir is bootstrap's own past output, not
 * "an existing file in the codebase". The climb stops at the repository root so
 * a bootstrap can never reach a .gitignore outside the project.
 */
export function findGitignore(workDir) {
  let dir = path.dirname(path.resolve(workDir));
  for (;;) {
    const candidate = path.join(dir, '.gitignore');
    if (existsSync(candidate)) return candidate;
    if (existsSync(path.join(dir, '.git'))) return null; // repo root, no .gitignore yet
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** True when a .gitignore contains nothing but rules bootstrap itself wrote. */
function isOurOwnGitignore(contents) {
  const meaningful = contents.split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  return meaningful.length > 0 && meaningful.every((line) => GITIGNORE_ENTRIES.includes(line));
}

/**
 * Write the ignore rules to the nearest project .gitignore, creating one inside
 * the work dir only when the project has none at all.
 */
function writeGitignore(workDir) {
  const outer = findGitignore(workDir);
  const target = outer ?? path.join(workDir, '.gitignore');
  const existing = existsSync(target) ? readFileSync(target, 'utf8') : '';
  const prefix = path.relative(path.dirname(target), workDir).split(path.sep).join('/');
  const merged = mergeGitignore(existing, prefix);
  const result = { target, changed: merged !== existing, created: !existing, superseded: null };
  if (result.changed) writeFileSync(target, merged);

  // A .gitignore bootstrap wrote inside the work dir on an earlier run is now
  // redundant. Remove it only when it holds nothing but our own rules.
  const inner = path.join(workDir, '.gitignore');
  if (outer && existsSync(inner) && isOurOwnGitignore(readFileSync(inner, 'utf8'))) {
    rmSync(inner);
    result.superseded = inner;
  }
  return result;
}

export async function bootstrap(workDir, options = {}) {
  const paths = runtimePaths(path.resolve(workDir));
  const log = [];

  // --- directory skeleton (D8: committed source vs regenerable artifacts) --
  for (const dir of [
    paths.workDir, paths.runtime, paths.scenes, paths.footage,
    paths.audio, paths.recordings, paths.slides, paths.frames, paths.processed,
    paths.output, paths.bin,
  ]) {
    mkdirSync(dir, { recursive: true });
  }
  const ignore = writeGitignore(paths.workDir);
  log.push(
    `created ${path.relative(process.cwd(), paths.workDir)}/; ` +
      `${ignore.changed ? (ignore.created ? 'created' : 'updated') : 'already current'} ` +
      `${path.relative(process.cwd(), ignore.target)}`
  );
  if (ignore.superseded) {
    log.push(`removed the redundant ${path.relative(process.cwd(), ignore.superseded)} (its rules now live in the project .gitignore)`);
  }

  // --- node dependencies --------------------------------------------------
  const deps = {
    ...DEPS.base,
    ...(options.withTts === false ? {} : DEPS.tts),
    ...(options.withSlides === false ? {} : DEPS.slides),
    ...(options.withDeck === false ? {} : DEPS.deck),
    // Opt-in: pulled only when explicitly requested, mirroring --with-remotion.
    ...(options.withGuidance ? DEPS.guidance : {}),
  };
  writeFileSync(
    path.join(paths.runtime, 'package.json'),
    `${JSON.stringify({ name: 'presentation-producer-runtime', private: true, type: 'module', dependencies: deps }, null, 2)}\n`
  );

  if (!options.skipInstall) {
    log.push('installing node dependencies (this is the slow part; ~300-500MB)');
    await npmInstall(paths.runtime);

    // Chromium into the project, not the shared OS cache.
    log.push('installing Chromium into .runtime/browsers');
    await run(process.execPath, [path.join(paths.nodeModules, 'playwright', 'cli.js'), 'install', 'chromium'], {
      cwd: paths.runtime,
      env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: paths.browsers },
    });
  }

  // --- Remotion project (needed for reframing / kinetic captions / PIP) ---
  if (options.withRemotion) {
    const templateDir = path.resolve(import.meta.dirname, '..', 'templates', 'remotion');
    await copyDir(templateDir, paths.remotion);
    writeFileSync(
      path.join(paths.remotion, 'package.json'),
      `${JSON.stringify(
        {
          name: 'presentation-producer-remotion',
          private: true,
          version: '1.0.0',
          scripts: { render: 'remotion render' },
          dependencies: DEPS.remotion,
        },
        null,
        2
      )}\n`
    );
    if (!options.skipInstall) {
      log.push('installing Remotion (React compositor)');
      await npmInstall(paths.remotion);
    }
    log.push('NOTE: Remotion is free for individuals and organisations of up to 3 people. Larger companies need a Remotion Company Licence.');
  }

  // --- optional edge-tts venv --------------------------------------------
  if (options.withEdgeTts && !options.skipInstall) {
    try {
      await run('python3', ['-m', 'venv', paths.venv]);
      const pip = path.join(paths.venv, platform === 'win32' ? 'Scripts' : 'bin', 'pip');
      await run(pip, ['install', '--quiet', 'edge-tts']);
      log.push('installed edge-tts into .runtime/.venv (unofficial endpoint; personal use per its maintainer)');
    } catch (err) {
      log.push(`edge-tts install skipped: ${err.message.split('\n')[0]}`);
    }
  }

  // --- optional VHS ------------------------------------------------------
  if (options.withVhs) {
    if (platform === 'darwin') {
      log.push(
        'VHS on macOS: `brew install charmbracelet/tap/vhs ttyd` — ttyd has no usable prebuilt macOS binary, ' +
          'so it cannot be installed into .runtime. Terminal scenes degrade to styled code slides without it.'
      );
    } else {
      log.push('VHS/ttyd release binaries can be downloaded into .runtime/bin on this platform — see references/capture-terminal.md');
    }
  }

  const { capabilities, bins } = await probe(paths.workDir, paths);
  const notes = explain(capabilities, bins);
  return { paths, capabilities, bins, notes, runnable: isRunnable(notes), log };
}

async function run(cmd, args, opts = {}) {
  try {
    await exec(cmd, args, { timeout: 30 * 60_000, maxBuffer: 64 * 1024 * 1024, ...opts });
  } catch (err) {
    const tail = String(err.stderr ?? err.message).split('\n').slice(-8).join('\n');
    throw new Error(`${cmd} ${args.slice(0, 2).join(' ')} failed:\n${tail}`);
  }
}

/**
 * `npm install` in `cwd`, on every platform.
 *
 * Two Windows facts make the naive `run('npm', …)` unrunnable there:
 *   1. npm is `npm.cmd`, and execFile does no PATHEXT resolution, so the bare
 *      name is never found.
 *   2. Since Node 18.20 / 20.12 (the CVE-2024-27980 mitigation) passing a
 *      `.cmd` or `.bat` to spawn without `shell: true` fails with EINVAL.
 * So Windows needs both the extension and a shell. Enabling the shell is safe
 * here only because every argument below is a hardcoded literal and `cwd` is
 * passed as an option rather than interpolated into the command line — do not
 * extend this helper to take caller-supplied arguments.
 */
async function npmInstall(cwd) {
  const isWindows = platform === 'win32';
  await run(isWindows ? 'npm.cmd' : 'npm', ['install', '--no-audit', '--no-fund', '--loglevel=error'], {
    cwd,
    ...(isWindows ? { shell: true } : {}),
  });
}

async function copyDir(from, to) {
  const { cp } = await import('node:fs/promises');
  if (!existsSync(from)) throw new Error(`template not found: ${from}`);
  mkdirSync(to, { recursive: true });
  await cp(from, to, { recursive: true, force: true });
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (isMainModule(import.meta.url)) {
  const { parseArgs } = await import('./synthesize.mjs');
  const args = parseArgs(process.argv.slice(2));
  const result = await bootstrap(args.root ?? DEFAULT_ROOT, {
    withRemotion: args['with-remotion'] !== undefined ? args['with-remotion'] !== 'false' : true,
    withEdgeTts: Boolean(args['with-edge-tts']),
    // Opt-in: absence means off, unlike the default-on groups above.
    withGuidance: Boolean(args['with-guidance']),
    withVhs: Boolean(args['with-vhs']),
    withSlides: args['with-slides'] !== 'false',
    withDeck: args['with-deck'] !== 'false',
    withTts: args['with-tts'] !== 'false',
    skipInstall: Boolean(args['skip-install']),
  });

  for (const line of result.log) console.log(`  ${line}`);
  console.log('\ncapabilities:');
  for (const [k, v] of Object.entries(result.capabilities)) {
    console.log(`  ${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`);
  }
  if (result.notes.length) {
    console.log('\nnotes:');
    for (const n of result.notes) console.log(`  [${n.severity}] ${n.capability}: ${n.message}`);
  }
  console.log(result.runnable ? '\nready' : '\nNOT ready — resolve the blocking notes above');
  process.exitCode = result.runnable ? 0 : 1;
}
