/**
 * presentation-producer :: build ledger (D14)
 *
 * Content-addressed cache so editing one sentence in a 40-80 scene film costs
 * one scene, not a full rebuild. Correctness rules:
 *
 *   - Audio is deterministic given text+voice+rate: cache hard.
 *   - Capture is NOT deterministic across app versions. A null cache key
 *     (unknown appVersion) is always a miss, because silently reusing a clip
 *     of a UI that has since changed produces a confidently wrong video.
 *   - Every reuse is recorded and reported, so a run is never silently stale.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const LEDGER_VERSION = 1;

export class Ledger {
  /**
   * @param {string} file path to .runtime/ledger.json
   * @param {{noCache?: boolean}} options
   */
  constructor(file, { noCache = false } = {}) {
    this.file = file;
    this.noCache = noCache;
    this.data = { version: LEDGER_VERSION, entries: {} };
    this.stats = { hits: [], misses: [], writes: [] };
    this.load();
  }

  load() {
    try {
      if (!existsSync(this.file)) return;
      const parsed = JSON.parse(readFileSync(this.file, 'utf8'));
      // A version bump invalidates everything rather than risking stale shapes.
      if (parsed?.version === LEDGER_VERSION && parsed.entries) this.data = parsed;
    } catch {
      // A corrupt ledger is a cache, not a source of truth: start clean.
      this.data = { version: LEDGER_VERSION, entries: {} };
    }
  }

  save() {
    mkdirSync(path.dirname(this.file), { recursive: true });
    writeFileSync(this.file, `${JSON.stringify(this.data, null, 2)}\n`);
  }

  /**
   * Look up a cached artifact.
   * Returns null on: --no-cache, a null key, no entry, or a vanished file.
   */
  get(key, label = key) {
    if (this.noCache || !key) {
      this.stats.misses.push(label);
      return null;
    }
    const entry = this.data.entries[key];
    if (!entry) {
      this.stats.misses.push(label);
      return null;
    }
    // The ledger can outlive the artifact (assets/ is gitignored and purgeable).
    const files = [entry.path, ...(entry.extraPaths ?? [])].filter(Boolean);
    if (files.some((f) => !existsSync(f))) {
      delete this.data.entries[key];
      this.stats.misses.push(`${label} (artifact missing)`);
      return null;
    }
    this.stats.hits.push(label);
    return entry;
  }

  put(key, entry, label = key) {
    if (!key) return entry; // uncacheable (e.g. unknown appVersion) — still usable
    this.data.entries[key] = { ...entry, key, cachedAt: new Date().toISOString() };
    this.stats.writes.push(label);
    return this.data.entries[key];
  }

  /** Human-readable reuse report — a hard requirement: never silently stale. */
  report() {
    const { hits, misses } = this.stats;
    const lines = [];
    if (this.noCache) lines.push('cache disabled (--no-cache): everything rebuilt');
    else lines.push(`cache: ${hits.length} reused, ${misses.length} rebuilt`);
    if (hits.length) lines.push(`  reused: ${hits.join(', ')}`);
    if (misses.length) lines.push(`  rebuilt: ${misses.join(', ')}`);
    return lines.join('\n');
  }
}

/**
 * Resolve the app version that participates in capture cache keys (D14).
 *
 * Order: explicit flag > env > git HEAD of the target repo.
 * When it cannot be determined the decision was: prompt the user; and with no
 * TTY, fail safe by returning null, which forces a re-capture rather than
 * hanging a non-interactive run.
 */
export async function resolveAppVersion({ explicit = null, cwd = process.cwd(), interactive = process.stdin.isTTY } = {}) {
  if (explicit) return { version: explicit, source: 'flag' };
  if (process.env.PRESENTATION_APP_VERSION) return { version: process.env.PRESENTATION_APP_VERSION, source: 'env' };

  const git = await gitHead(cwd);
  if (git) return { version: git, source: 'git' };

  if (!interactive) {
    return {
      version: null,
      source: 'unresolved',
      note: 'no app version and no TTY: captures will be rebuilt (fail-safe, never stale)',
    };
  }
  return {
    version: null,
    source: 'needs-prompt',
    note: 'app version could not be determined — ask the user for a version string, or pass --app-version',
  };
}

async function gitHead(cwd) {
  try {
    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const exec = promisify(execFile);
    const { stdout } = await exec('git', ['rev-parse', '--short', 'HEAD'], { cwd, timeout: 5000 });
    const sha = stdout.trim();
    if (!sha) return null;
    // A dirty tree means HEAD does not describe what is actually running.
    const { stdout: status } = await exec('git', ['status', '--porcelain'], { cwd, timeout: 5000 });
    return status.trim() ? `${sha}-dirty-${Date.now()}` : sha;
  } catch {
    return null;
  }
}

/**
 * Scene ids whose storyboard entry changed versus git HEAD.
 * Because storyboard.json is committed source (D8), `git diff` is a free and
 * exact change detector — no heuristics required.
 */
export async function changedSceneIds(storyboardPath) {
  try {
    const { execFile } = await import('node:child_process');
    const { promisify } = await import('node:util');
    const exec = promisify(execFile);
    const cwd = path.dirname(storyboardPath);
    const { stdout } = await exec('git', ['show', `HEAD:./${path.basename(storyboardPath)}`], { cwd, timeout: 5000 });
    const before = JSON.parse(stdout);
    const after = JSON.parse(readFileSync(storyboardPath, 'utf8'));
    const { canonicalJson } = await import('./core.mjs');
    const beforeById = new Map((before.scenes ?? []).map((s) => [s.id, canonicalJson(s)]));
    return (after.scenes ?? [])
      .filter((s) => beforeById.get(s.id) !== canonicalJson(s))
      .map((s) => s.id);
  } catch {
    return null; // not a git repo, or no committed baseline yet
  }
}
