#!/usr/bin/env node
/**
 * compile.mjs — storyline.yml -> storyboard.json
 *
 * The storyline is the authored source (D1); the storyboard is a generated lockfile
 * (D2). It is committed, because that is where cost lives — scene count,
 * durations, capture actions — and cost belongs in a diff, not hidden in a
 * build directory. It is not hand-edited, because a generator that must
 * preserve human edits cannot be deterministic.
 *
 * YAML needs a parser, and Node has none (V7), so this stage sits on the far
 * side of the install boundary. `validateManifest` in lib/core.mjs stays
 * dependency-free, which is where the no-install property was actually earned.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { brandResolver, loadBrandFiles, resolveDeckFont } from './lib/brand-io.mjs';
import { digest, isMainModule, validateManifest } from './lib/core.mjs';
import { compileStoryline, presentationMeta, storylineChecksum, validateStoryline } from './lib/deck.mjs';
import { customFiles, diagramFiles } from './lib/diagram.mjs';
import { diagramProfileResolver, fileSha, readProvenance, writeDiagramProfiles } from './lib/diagram-io.mjs';
import { brandFingerprint } from './lib/design-md.mjs';
import { presentationContext, presentationPaths } from './lib/probe.mjs';

/** Load the pinned YAML parser from the project-local runtime. */
async function loadYaml(paths) {
  const entry = path.join(paths.nodeModules, 'yaml', 'dist', 'index.js');
  if (!existsSync(entry)) {
    throw new Error(
      'the `yaml` parser is not installed. Run bootstrap.mjs first:\n' +
        '  node scripts/bootstrap.mjs --workDir=<dir>\n' +
        'storyboard.json validation stays install-free, but compiling storyline.yml does not.'
    );
  }
  return import(entry);
}

export async function compile({ workDir, storylineFile, force = false, engine = null }) {
  const paths = presentationPaths(workDir);
  const source = storylineFile ?? path.join(workDir, 'storyline.yml');
  if (!existsSync(source)) throw new Error(`no storyline source at ${source}`);

  const sourceText = readFileSync(source, 'utf8');
  const YAML = await loadYaml(paths);
  let storyline;
  try {
    storyline = YAML.parse(sourceText, { prettyErrors: true });
  } catch (e) {
    throw new Error(`storyline.yml failed to parse: ${e.message}`);
  }

  let iconNames = null;
  try {
    const { readdirSync } = await import('node:fs');
    const dir = path.join(paths.nodeModules, 'lucide-static', 'icons');
    if (existsSync(dir)) {
      iconNames = new Set(readdirSync(dir).filter((f) => f.endsWith('.svg')).map((f) => f.replace(/\.svg$/, '')));
    }
  } catch {
    iconNames = null;
  }

  const { errors, warnings } = validateStoryline(storyline, iconNames ? { iconNames } : {});
  if (errors.length) {
    throw new Error(`storyline.yml is invalid:\n  ${errors.join('\n  ')}`);
  }

  const target = paths.storyboard;
  if (existsSync(target) && !force) {
    const existing = JSON.parse(readFileSync(target, 'utf8'));
    if (!existing.$generated) {
      throw new Error(
        `${target} exists but carries no generated-file marker — it looks hand-authored.\n` +
          'Move it aside, or pass --force to overwrite.'
      );
    }
  }

  // The brand is resolved here, before compiling, so its surface and ink can be
  // baked into the manifest. Downstream stages (letterbox bars, burned-in
  // captions, the Remotion stage) then read colours from the storyboard alone
  // and never need to locate or parse DESIGN.md.
  const brandWarnings = [];
  const brandFiles = await loadBrandFiles({
    workDir,
    paths,
    // The brand is declared in `presentation:` (design, designDark). Reading the
    // retired `deck:` block here silently compiled every branded storyline as
    // unbranded — captions and letterbox bars kept the built-in colours.
    deck: presentationMeta(storyline),
    warn: (w) => brandWarnings.push(w),
  });
  const resolvedBrand = brandResolver(brandFiles, (w) => brandWarnings.push(w))(
    presentationMeta(storyline).theme ?? 'light'
  );
  const brandPalette = resolvedBrand
    ? { background: resolvedBrand.tokens['--bg'], ink: resolvedBrand.tokens['--primary'] }
    : null;

  const { manifest, warnings: compileWarnings } = compileStoryline(storyline, {
    sourceText,
    engineOverride: engine,
    brandPalette,
  });
  manifest.$source.file = path.relative(workDir, source);

  // Brand files are inputs, so they belong in $source next to the storyline.
  //
  // Two different digests, deliberately:
  //   - `$source.brand[].checksum` is the exact file bytes, which is what drift
  //     detection needs — "has this input changed at all?".
  //   - `scene.slide.brand` is the SEMANTIC fingerprint of the resolved brand,
  //     because captureCacheKey digests `scene.slide` and would otherwise reuse a
  //     clip rendered with the previous palette. Using the fingerprint rather
  //     than the file bytes means editing a brand's name, description or prose
  //     rationale does not invalidate every cached clip, while changing a colour,
  //     a font or the radius does.
  //
  // Both are stamped only when a brand is declared, so a storyboard compiled
  // before brands existed keeps byte-identical cache keys.
  const brandPaths = [manifest.meta?.deck?.design, manifest.meta?.deck?.designDark].filter(Boolean);
  const fontFile = manifest.meta?.deck?.fontFile ?? null;
  if (brandPaths.length) {
    const provenance = [];
    for (const rel of brandPaths) {
      const abs = path.resolve(workDir, rel);
      if (!existsSync(abs)) throw new Error(`deck.design declares "${rel}" but no file exists at ${abs}`);
      provenance.push({ file: rel, checksum: storylineChecksum(readFileSync(abs, 'utf8')) });
    }
    manifest.$source.brand = provenance;
  }

  if (brandPaths.length || fontFile) {
    // Both themes contribute when both are declared, so editing only the dark
    // file still invalidates the renders that depend on it. `digest` is used
    // rather than joining: the fingerprints are objects, and it routes them
    // through canonicalJson so key order cannot change the result.
    const resolve = brandResolver(brandFiles);
    const fingerprints = (brandFiles.dark ? ['light', 'dark'] : ['light'])
      .map((t) => resolve(t))
      .filter(Boolean)
      .map((r) => brandFingerprint(r));

    // Font PROVENANCE joins the digest, not just the family name. The family is
    // already inside the fingerprint, but whether it was embedded from a package,
    // embedded from a supplied file, or left to the machine is an environment
    // fact that changes pixels without changing a single authored byte — so
    // installing the brand's Fontsource package must invalidate clips rendered
    // before it was there.
    const font = resolveDeckFont({
      paths,
      workDir,
      family: resolvedBrand?.fontFamily ?? 'Inter',
      fontFile,
    });
    const brand = digest([...fingerprints, { font: font.provenance, family: font.family, axis: font.axis }]);
    for (const scene of manifest.scenes) {
      if (scene.slide) scene.slide.brand = brand;
    }
  }

  // Diagrams: write the generated diagram-design profile the agent draws against,
  // and fold each frozen drawing's bytes into its slide, so redrawing a diagram
  // rebuilds exactly the clips that show it. URL-sourced custom pages do the same
  // with their frozen HAR. Stamped only when present, so other storyboards keep
  // byte-identical cache keys.
  const diagramEntries = (storyline.entries ?? []).filter((e) => e?.diagram && !e.diagram.ref);
  if (diagramEntries.length) {
    const profileFor = diagramProfileResolver(brandFiles, brandResolver(brandFiles));
    writeDiagramProfiles(workDir, profileFor, diagramEntries.map((e) => e.theme ?? presentationMeta(storyline).theme ?? 'light'));
  }
  for (const scene of manifest.scenes) {
    const slide = scene.slide;
    if (slide?.diagram) {
      const prov = readProvenance(workDir, diagramFiles(slide.diagram.id).provenance);
      if (prov?.frames) slide.diagram.frozen = digest(prov.frames);
      else brandWarnings.push(`${scene.id}: diagram "${slide.diagram.id}" is not drawn yet — run deck.mjs --stamp-diagrams for the drawing brief`);
    }
    if (slide?.htmlUrl || slide?.portraitHtmlUrl) {
      const shas = ['landscape', 'vertical'].map((o) => fileSha(path.join(workDir, customFiles(scene.id, o).har)));
      if (shas.some(Boolean)) slide.customFrozen = digest(shas);
    }
  }

  const manifestErrors = validateManifest(manifest);
  if (manifestErrors.length) {
    // A compiler that emits an invalid storyboard is a compiler bug, and saying
    // so is more useful than blaming the storyline.
    throw new Error(`compiled storyboard is invalid (compiler bug):\n  ${manifestErrors.join('\n  ')}`);
  }

  writeFileSync(target, `${JSON.stringify(manifest, null, 2)}\n`);

  return {
    manifest,
    target,
    checksum: storylineChecksum(sourceText),
    warnings: [...warnings, ...compileWarnings, ...brandWarnings],
    counts: {
      entries: (storyline.entries ?? []).length,
      scenes: manifest.scenes.length,
      deckOnly: (storyline.entries ?? []).filter((e) => !(e.in ?? ['deck', 'video']).includes('video')).length,
    },
  };
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (isMainModule(import.meta.url)) {
  const { parseArgs } = await import('./synthesize.mjs');
  const args = parseArgs(process.argv.slice(2));
  const workDir = presentationContext({ root: args.root, presentation: args.presentation }).paths.workDir;

  const result = await compile({
    workDir,
    storylineFile: args.storyline ? path.resolve(args.storyline) : undefined,
    force: Boolean(args.force),
    engine: args.engine ?? null,
  });

  console.log(`compiled ${result.counts.entries} entries -> ${result.counts.scenes} scenes`);
  if (result.counts.deckOnly) console.log(`  ${result.counts.deckOnly} deck-only entr${result.counts.deckOnly === 1 ? 'y' : 'ies'} excluded from the video`);
  console.log(`  wrote ${path.relative(process.cwd(), result.target)}`);
  for (const w of result.warnings) console.log(`  warning: ${w}`);
}
