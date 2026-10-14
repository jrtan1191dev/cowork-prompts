/**
 * presentation-producer :: modern-web-guidance accessor (opt-in)
 *
 * `modern-web-guidance` motivated the four modern CSS features already baked
 * into deck-html.mjs's slideCss (text-wrap balance/pretty, text-box trim-both,
 * font-size-adjust). It is wired in as an opt-in group behind --with-guidance,
 * never a hard dependency: its engines.node is >=20.0.0 while the skill only
 * promises "Node", so the constraint is acceptable solely because nothing runs
 * unless a user asks for it.
 *
 * Two access routes, cheapest first (Tier 0):
 *   - guides ship as real markdown files under the pinned install, so reading a
 *     guide is just readFileSync — no child process at all.
 *   - the CLI is only for `search`, which needs the package's embeddings.
 *
 * The CLI bin is a plain .mjs with a shebang, not a shell shim, so it is spawned
 * as `process.execPath <abs path> <args...>` with an args ARRAY and no shell —
 * the same idiom bootstrap uses for the Playwright CLI. That is what makes it
 * Windows-safe and, crucially, makes an LLM-generated query string un-injectable.
 */

import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

/** Package layout inside node_modules: name/<bin dir>/... per its bin entry. */
const PKG = 'modern-web-guidance';
const PKG_ROOT_REL = path.join(PKG, 'skills', 'modern-web-guidance');
const CLI_REL = path.join(PKG_ROOT_REL, 'modern-web.mjs');

/** Only these categories bear on this skill's decks; the rest are noise here. */
export const RELEVANT_CATEGORIES = ['visual-design', 'css'];

/** Absolute path to the pinned CLI entry for a given runtime paths object. */
export function guidanceCliPath(paths) {
  return path.join(paths.nodeModules, CLI_REL);
}

/** Absolute path to the shipped guides directory. */
export function guidesDir(paths) {
  return path.join(paths.nodeModules, PKG_ROOT_REL, 'guides');
}

/**
 * Build the spawn shape for a guidance subcommand.
 *
 * Pure on purpose: the spawn shape is the security boundary, so it must be
 * assertable without an install or a child process. The query travels as a
 * single array element — never concatenated into a command line — and telemetry
 * is force-disabled here because it is ON by default and would otherwise ship
 * the agent's query and retrieved ids to Google.
 *
 * @param {object} paths       runtime paths object from runtimePaths()
 * @param {string} subcommand  'search' | 'retrieve' | 'list'
 * @param {string} [arg]       free-text query for search, comma-separated ids
 *                             for retrieve; omitted for list
 */
export function buildGuidanceCommand(paths, subcommand, arg) {
  const args = [guidanceCliPath(paths), subcommand];
  if (arg !== undefined) args.push(arg);
  return {
    command: process.execPath,
    args,
    env: { ...process.env, DISABLE_TELEMETRY: '1' },
  };
}

/** True when the pinned package (and its CLI) is present under the runtime. */
export function guidanceInstalled(paths) {
  return existsSync(guidanceCliPath(paths));
}

/**
 * List the shipped guide files in the categories relevant to this skill.
 *
 * Returns [] when the package is absent so callers can treat guidance as a
 * best-effort enhancement rather than a precondition. Reading these directly is
 * preferred over `retrieve`: the cheapest way to read a markdown file is to read
 * the markdown file.
 */
export function listRelevantGuides(paths) {
  const root = guidesDir(paths);
  const out = [];
  for (const category of RELEVANT_CATEGORIES) {
    const dir = path.join(root, category);
    if (!existsSync(dir)) continue;
    for (const name of readdirSync(dir)) {
      if (name.endsWith('.md')) out.push({ category, name, path: path.join(dir, name) });
    }
  }
  return out;
}
