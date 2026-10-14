/**
 * The impure half of the diagram slot: locating diagram-design, writing the
 * generated brand profile, reading frozen drawings, stamping provenance, and
 * running diagram-design's own self-check.
 *
 * Kept apart from diagram.mjs so every rule stays testable with no install, no
 * browser and no Python. Nothing here runs at build time except reads: drawing
 * and the Python check happen at authoring time, when the agent freezes a
 * diagram, so a build stays offline and Node-only.
 */

import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';

import { resolveThemeTokens } from './deck-html.mjs';
import { diagramProfile, profileThemeFor } from './diagram.mjs';

const exec = promisify(execFile);

/** Skill roots an Agent Skills host installs into, project-level first. */
const SKILL_ROOTS = ['.kiro/skills', '.agents/skills', '.claude/skills', '.cursor/skills', '.codex/skills'];

/**
 * Find an installed diagram-design skill: the nearest project install above
 * any start directory, then the user-level install. A bounded walk UP the
 * ancestors — never a recursive search down a tree — so it has no ignore lists
 * or ordering to get wrong.
 */
export function findDiagramDesign(startDirs = [process.cwd()]) {
  const tried = new Set();
  const candidates = [];
  for (const start of startDirs) {
    for (let dir = path.resolve(start); ; dir = path.dirname(dir)) {
      if (!tried.has(dir)) {
        tried.add(dir);
        for (const root of SKILL_ROOTS) candidates.push(path.join(dir, root, 'diagram-design'));
      }
      if (path.dirname(dir) === dir) break;
    }
  }
  for (const root of SKILL_ROOTS) candidates.push(path.join(os.homedir(), root, 'diagram-design'));
  const dir = candidates.find((c) => existsSync(path.join(c, 'SKILL.md')));
  if (!dir) return null;
  const skill = readFileSync(path.join(dir, 'SKILL.md'), 'utf8');
  const version = /^\s*version:\s*["']?([^"'\n]+)["']?\s*$/m.exec(skill)?.[1] ?? 'unknown';
  return { dir, version, selfCheck: path.join(dir, 'scripts', 'self_check.py') };
}

/** `python3` on the PATH, or null. diagram-design's checks need the standard library only. */
export async function findPython() {
  for (const cmd of process.platform === 'win32' ? ['python', 'py'] : ['python3']) {
    try {
      const { stdout, stderr } = await exec(cmd, ['--version'], { timeout: 10_000 });
      if (/Python 3/.test(stdout || stderr)) return cmd;
    } catch {
      // try the next name
    }
  }
  return null;
}

/**
 * A resolver from a slide's theme to the diagram profile it is drawn against.
 * `brandFor` is the deck's brand resolver, so the diagram and the slide read the
 * same resolved tokens — the profile is a fourth consumer of DESIGN.md, never a
 * second brand.
 */
export function diagramProfileResolver(brandFiles, brandFor) {
  const hasLight = Boolean(brandFiles?.light);
  const hasDark = Boolean(brandFiles?.dark);
  const memo = new Map();
  return (slideTheme = 'light') => {
    const theme = profileThemeFor(slideTheme, { hasLight, hasDark });
    if (memo.has(theme)) return memo.get(theme);
    const resolved = brandFor(theme);
    const source = theme === 'dark' && hasDark ? brandFiles.dark.rel : hasLight ? brandFiles.light.rel : 'the built-in palette';
    const text = diagramProfile({
      tokens: resolveThemeTokens(theme, resolved?.tokens ?? null),
      typeScale: resolved?.typeScale ?? {},
      fontFamily: resolved?.fontFamily ?? 'Inter',
      theme,
      source,
    });
    const entry = { theme, text, lightOnDark: slideTheme === 'dark' && theme === 'light' };
    memo.set(theme, entry);
    return entry;
  };
}

/** Write the generated profiles the agent reads before drawing. Returns the paths written. */
export function writeDiagramProfiles(workDir, profileFor, themes) {
  const dir = path.join(workDir, 'diagrams');
  mkdirSync(dir, { recursive: true });
  const written = [];
  for (const slideTheme of new Set(themes)) {
    const { theme, text } = profileFor(slideTheme);
    const file = path.join(dir, `profile.${theme}.md`);
    if (!existsSync(file) || readFileSync(file, 'utf8') !== text) writeFileSync(file, text);
    if (!written.includes(file)) written.push(file);
  }
  return written;
}

export function readProvenance(workDir, rel) {
  const file = path.join(workDir, rel);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Run diagram-design's packaged self-check on a drawn HTML file.
 * @returns {Promise<string>} `ok`, `failed: <first line>` or `unchecked: <why>`
 */
export async function runSelfCheck({ skill, python, htmlFile }) {
  if (!skill) return 'unchecked: diagram-design is not installed';
  if (!python) return 'unchecked: python3 not found';
  if (!existsSync(skill.selfCheck)) return 'unchecked: self_check.py not found in the installed skill';
  if (!existsSync(htmlFile)) return 'unchecked: no drawn .html beside the SVG';
  try {
    await exec(python, [skill.selfCheck, htmlFile], { timeout: 60_000 });
    return 'ok';
  } catch (e) {
    const first = String(e.stdout || e.stderr || e.message).split(/\r?\n/).find((l) => l.trim()) ?? 'failed';
    return `failed: ${first.trim().slice(0, 160)}`;
  }
}

/** sha256 of a file's bytes, or null when absent. */
export function fileSha(file) {
  return existsSync(file) ? createHash('sha256').update(readFileSync(file)).digest('hex') : null;
}
