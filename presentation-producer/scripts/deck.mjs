#!/usr/bin/env node
/**
 * deck.mjs — render slides to pixels and to a presentable deck.
 *
 * Runs *before* the outline gate (D13). Slide rendering is in the cheap
 * category — one headless page load, no API calls — and putting it before the
 * gate buys the ability to look at the slides and fix them before spending on
 * TTS. Text overflow is the dominant slide defect and it is invisible in the
 * source; only pixels reveal that a card's third line clipped.
 *
 * Duration-independent on purpose: nothing here needs narration timing, which
 * is what lets `node deck.mjs` produce a presentable deck with zero TTS, zero
 * app and zero cost. Holding a still for its narration stays in capture.mjs.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import { brandReportLines, brandResolver, fontReportLine, loadBrandFiles, loadFontFaceCss, resolveDeckFont } from './lib/brand-io.mjs';
import { isMainModule } from './lib/core.mjs';
import { buildDesignMd } from './lib/extract-brand.mjs';
import { CANVAS, DIAGRAM_TEXT_EXPR, measureExpr, renderSlideHtml } from './lib/deck-html.mjs';
import { deckOrientations, diagramAndUrlFields, presentationMeta, slideOrientations, typeFloor } from './lib/deck.mjs';
import { customFiles, diagramCanvas, diagramFiles, diagramHash, diagramStatus } from './lib/diagram.mjs';
import { diagramProfileResolver, fileSha, findDiagramDesign, findPython, readProvenance, runSelfCheck, writeDiagramProfiles } from './lib/diagram-io.mjs';
import { MARP_MEASURE_SELECTORS, emitDeckMarkdown, isHandEdited, marpContrastRules, themeCss } from './lib/marp.mjs';
import { presentationContext, presentationPaths, probe } from './lib/probe.mjs';

const execFileAsync = promisify(execFile);

const ORIENTATIONS = { landscape: 'landscape', vertical: 'vertical', square: 'square' };

/** Load the bundled icon set as name -> inline SVG. */
function loadIcons(paths, names) {
  const dir = path.join(paths.nodeModules, 'lucide-static', 'icons');
  const icons = {};
  if (!existsSync(dir)) return icons;
  const wanted = names ? new Set(names) : null;
  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.svg')) continue;
    const name = file.replace(/\.svg$/, '');
    if (wanted && !wanted.has(name)) continue;
    icons[name] = readFileSync(path.join(dir, file), 'utf8').replace(/<\?xml[^>]*\?>/g, '').trim();
  }
  return icons;
}

/**
 * @font-face rules for the font the deck embeds.
 *
 * The font is embedded rather than named (D16) so glyphs and wrapping cannot
 * change per machine. This is the opposite of the caption decision, which had
 * to name a system font because ASS has no fallback list and cannot embed.
 *
 * Memoised per family: the light and dark brand files are separate documents and
 * may name different families, and resolving once per slide would list a
 * directory 154 times to learn the same fact.
 */
function fontLoader({ paths, workDir, fontFile }) {
  const cache = new Map();
  return (family = 'Inter') => {
    if (cache.has(family)) return cache.get(family);
    const resolved = resolveDeckFont({ paths, workDir, family, fontFile });
    const entry = { ...resolved, css: loadFontFaceCss(resolved) };
    cache.set(family, entry);
    return entry;
  };
}

/**
 * Slides in the storyboard, plus deck-only slides recovered from the source
 * storyline. A `mode: slides` presentation has no storyboard scenes at all, so
 * every slide comes from the source.
 *
 * `orientations` rides on the wrapper rather than inside `slide`, because
 * `captureCacheKey` digests `scene.slide` — putting a deck-only concern in there
 * would rebuild every capture clip for a change that cannot alter a frame.
 */
function slidesFor(manifest, storylineSource) {
  const fromStoryboard = manifest.scenes
    .filter((s) => s.slide)
    .map((s) => ({ id: s.id, slide: s.slide, order: null }));

  if (!storylineSource) return fromStoryboard;

  // Deck-only entries never reach the storyboard (D6), so the deck artifact is
  // assembled from the source to keep the authored order intact.
  const out = [];
  const meta = presentationMeta(storylineSource);
  for (const entry of storylineSource.entries ?? []) {
    if ((entry.type ?? 'slide') !== 'slide') continue;
    if (!(entry.in ?? ['deck', 'video']).includes('deck')) continue;
    const compiled = fromStoryboard.find((s) => s.id === entry.id);
    out.push({
      ...(compiled ?? {
        id: entry.id,
        slide: {
          layout: entry.layout ?? 'hero',
          theme: entry.theme ?? meta.theme ?? 'light',
          title: entry.title ?? null,
          pill: entry.pill ?? null,
          body: entry.body ?? null,
          cards: entry.cards ?? [],
          stat: entry.stat ?? null,
          image: entry.image ?? null,
          htmlPath: entry.htmlPath ?? null,
          portraitHtmlPath: entry.portraitHtmlPath ?? null,
          // Presenter text is `notes:` in a slides presentation and `narration:`
          // in a video one; validation rejects the wrong field per mode, so one
          // expression is correct in both without a mode branch (D10).
          notes: entry.notes ?? entry.narration ?? null,
          ...diagramAndUrlFields(entry, storylineSource.entries),
        },
        deckOnly: true,
      }),
      orientations: entry.orientations ?? null,
    });
  }
  return out;
}

export async function renderDeck({ workDir, manifest, storylineSource = null, options = {} }) {

  const { paths, capabilities } = await probe(workDir);
  if (!capabilities.playwright) {
    throw new Error('Playwright/Chromium missing — run bootstrap.mjs before rendering slides');
  }

  const baseOrientations = options.orientations ?? deriveOrientations(manifest);
  const formats = options.formats ?? manifest.meta?.deck?.formats ?? ['png', 'pdf'];
  const slides = slidesFor(manifest, storylineSource);
  // Passes are the UNION of the deck default and every per-slide override: a
  // slide can be added to a canvas nobody else uses (a portrait social card)
  // without dragging the whole deck onto it (D22).
  const orientations = [...new Set([...baseOrientations, ...slides.flatMap((s) => s.orientations ?? [])])];
  const report = { slides: [], overflow: [], contrast: [], warnings: [], diagrams: [], formats, orientations, artifacts: [] };

  if (slides.length === 0) {
    report.warnings.push('no slide entries — nothing to render');
    return { report };
  }

  const iconNames = new Set();
  for (const { slide } of slides) for (const c of slide.cards ?? []) if (c.icon) iconNames.add(c.icon);
  if (slides.some((s) => s.slide.stat?.icon)) for (const s of slides) if (s.slide.stat?.icon) iconNames.add(s.slide.stat.icon);

  const icons = loadIcons(paths, iconNames);
  // Brand resolution happens once per theme, not once per slide: a deck carries
  // one brand, and resolving per slide would invite per-slide drift. The loader
  // is shared with compile.mjs so the mapping path, the error wording and the
  // dark-fallback rule have exactly one definition.
  const brandFiles = await loadBrandFiles({
    workDir,
    paths,
    deck: manifest?.meta?.deck,
    warn: (w) => report.warnings.push(w),
  });
  const brandFor = brandResolver(brandFiles, (w) => report.warnings.push(w));
  const fontFor = fontLoader({ paths, workDir, fontFile: manifest?.meta?.deck?.fontFile ?? null });
  // Which themes actually rendered. The report is built from this rather than
  // from the resolver's internal memo, so the resolver keeps a single-function
  // API that compile.mjs shares.
  const themesRendered = new Set();
  const fontsUsed = new Set();
  const contrastRules = brandFiles.mapping?.contrast ?? [];
  const reportedFontMiss = new Set();
  // Diagrams are drawn against a profile derived from the SAME resolved brand,
  // so the hash a frozen drawing must match is recomputed here rather than read
  // from a file: a brand edit marks diagrams stale even if nobody recompiled.
  const profileFor = diagramProfileResolver(brandFiles, brandFor);
  const fixedTime = manifest.meta?.fixedTime ?? null;

  process.env.PLAYWRIGHT_BROWSERS_PATH = paths.browsers;
  const { chromium } = await import(path.join(paths.nodeModules, 'playwright', 'index.mjs'));
  const browser = await chromium.launch({ headless: true });

  mkdirSync(paths.slides, { recursive: true });
  mkdirSync(paths.output, { recursive: true });

  // The engine is a deck-wide choice compiled from storyline.yml. `marp` selects
  // a Markdown-native source rendered by marp-cli; `html` is the default bento
  // renderer. Both share slideCss and are rasterised by the SAME project-local
  // Chromium, so overflow, contrast and font resolution behave identically — an
  // engine that quietly lost those gates would be a downgrade, not a choice.
  const engine = manifest.meta?.deck?.engine ?? 'html';
  if (engine === 'marp' && !capabilities.marp) {
    throw new Error('engine is "marp" but @marp-team/marp-cli is not installed — run bootstrap.mjs (the deck layer installs it), or set deck.engine to "html"');
  }

  try {
    for (const orientation of orientations) {
      // Which slides this canvas actually carries. A subset is usually a mistake
      // and occasionally the entire point — three portrait cards out of a
      // landscape deck — so it warns rather than fails (non-negotiable 6).
      const inPassCount = slides.filter((s) => (s.orientations ?? baseOrientations).includes(orientation)).length;
      if (inPassCount === 0) continue;
      if (inPassCount < slides.length) {
        report.warnings.push(
          `${orientation}: ${inPassCount} of ${slides.length} slides declare this orientation — that artifact is a partial deck`
        );
      }
      const { width, height } = CANVAS[orientation] ?? CANVAS.landscape;
      // reducedMotion and the seeded Math.random exist for custom pages, which may
      // run JavaScript: two renders of one commit must produce the same pixels, or
      // the content-addressed cache serves a mismatched PNG. Native slides have no
      // motion and no script, so both are inert for them.
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      await context.addInitScript(SEEDED_RANDOM);
      const page = await context.newPage();
      if (fixedTime) await page.clock.setFixedTime(new Date(fixedTime));
      const pages = [];
      // Frozen diagrams are attached per orientation BEFORE either engine emits,
      // because the marp path emits the whole deck in one pass.
      const prepared = slides
        .filter((s) => (s.orientations ?? baseOrientations).includes(orientation))
        .map((s) => ({ ...s, slide: attachDiagram({ workDir, id: s.id, slide: s.slide, orientation, profileFor, report }) }));

      // For the marp engine, marp-cli renders the whole deck to HTML in ONE pass
      // per orientation; the per-slide loop below then MEASURES that HTML in our
      // Chromium (overflow + contrast) before rasterising, so the gates hold on
      // both engines. Mapped to slide ids by page order, exactly as marp numbers
      // its output.
      const marpHtml = engine === 'marp'
        ? await renderMarpHtml({ paths, workDir, orientation, slides: prepared, icons, deck: manifest.meta?.deck ?? {}, brandFor, fontFor, report, checksum: manifest.$source?.checksum ?? null })
        : null;

      for (let idx = 0; idx < prepared.length; idx += 1) {
        const { id, slide, deckOnly } = prepared[idx];
        const theme = slide.theme ?? 'light';
        const resolved = brandFor(theme);
        themesRendered.add(theme);
        const font = fontFor(resolved?.fontFamily ?? 'Inter');
        fontsUsed.add(font.family);
        const custom = slide.layout === 'custom' && engine !== 'marp';
        let html = engine === 'marp'
          ? marpHtml[idx]
          : custom
          ? null
          : renderSlideHtml({
              slide,
              orientation,
              icons,
              fontCss: font.css,
              fontFamily: font.family,
              themeTokens: resolved?.tokens ?? null,
              // fontFallback is a render-time fact — it depends on what is
              // installed — so it is layered onto the resolved brand here
              // rather than inside the pure resolver.
              brand: resolved ? { ...resolved, fontFallback: font.fallbackFamily } : null,
            });

        if (custom) {
          html = await loadCustomPage({ page, workDir, id, slide, orientation, report });
        } else {
          await page.setContent(html, { waitUntil: 'load' });
          await page.evaluate('document.fonts ? document.fonts.ready.then(() => true) : true');
        }

        // One evaluate per slide covers overflow, icons, contrast and font
        // resolution. Contrast rides the existing call rather than adding a
        // round trip, and is read from computed styles so every colour format
        // design.md allows is handled without a parser.
        //
        // Both gates must fire on BOTH engines, and the marp DOM carries neither
        // the data-measure attributes nor the class names — CSS cannot add
        // either — so the selector list and the contrast selectors are widened
        // from the one aliasing table in lib/marp.mjs. A gate that finds nothing
        // and passes is worse than no gate, because it reads as proof.
        const marp = engine === 'marp';
        const measured = await page.evaluate(
          measureExpr({
            contrast: marp ? marpContrastRules(contrastRules) : contrastRules,
            fontFamily: resolved?.fontFamily ?? null,
            selectors: marp ? MARP_MEASURE_SELECTORS : custom ? CUSTOM_MEASURE_SELECTORS : null,
          })
        );
        if (custom) {
          // A page the skill does not own may clip on purpose, so its invariants
          // become heuristics: measured, reported, never fatal.
          if (measured.overflow.length || (measured.contrast ?? []).length) {
            report.warnings.push(
              `${id} (${orientation}): custom slide, outside the design system — ${measured.overflow.length} clipped element(s), ` +
                `${(measured.contrast ?? []).length} below contrast (warning only)`
            );
          }
        } else {
          for (const o of measured.overflow) report.overflow.push({ id, orientation, ...o });
          for (const c of measured.contrast ?? []) report.contrast.push({ id, orientation, ...c });
        }
        if (slide.diagram && !marp) checkDiagramText(await page.evaluate(DIAGRAM_TEXT_EXPR), { id, orientation, profile: options.profile, report });
        if (resolved && measured.fontResolved === false && font.provenance !== 'local' && !reportedFontMiss.has(resolved.fontFamily)) {
          reportedFontMiss.add(resolved.fontFamily);
          report.warnings.push(
            `brand font "${resolved.fontFamily}" did not resolve in the renderer — falling back, so wrapping may differ per machine`
          );
        }
        for (const name of measured.missingIcons ?? []) {
          report.warnings.push(`${id}: icon "${name}" resolved to nothing at render time`);
        }

        const suffix = orientation === 'landscape' ? '' : `.${orientation}`;
        const png = path.join(paths.slides, `${id}${suffix}.png`);
        if (formats.includes('png')) await page.screenshot({ path: png, animations: 'disabled' });
        pages.push({ id, html, png, notes: slide.notes ?? null, deckOnly: Boolean(deckOnly) });

        report.slides.push({
          id, orientation, layout: slide.layout, cards: measured.cards,
          columns: measured.columns, overflow: measured.overflow.length, deckOnly: Boolean(deckOnly),
        });
      }

      // Presentation artifacts per orientation, suffixed exactly like the PNGs.
      // This used to be landscape-only on the reasoning that a portrait deck is
      // a video asset; a slides presentation can now declare portrait outright
      // (D22), so refusing to emit its PDF would make a declared output silently
      // unobtainable.
      {
        const suffix = orientation === 'landscape' ? '' : `.${orientation}`;
        if (formats.includes('pdf')) {
          const pdf = path.join(paths.output, `${slug(manifest.meta?.title)}${suffix}.pdf`);
          await writePdf(page, pages, { width, height, out: pdf });
          report.artifacts.push(pdf);
        }
        if (formats.includes('html')) {
          const out = path.join(paths.output, `${slug(manifest.meta?.title)}${suffix}.html`);
          writeFileSync(
            out,
            deckHtmlBundle(manifest, pages, {
              width,
              height,
              brand: brandFor(manifest.meta?.deck?.theme ?? 'light'),
            })
          );
          report.artifacts.push(out);
        }
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  // Report what the brand actually did: which variables came from the file,
  // which fell back, what the format cannot express, and where a ratio was
  // clamped. A partial brand must never look like a rendering bug.
  report.brand = brandReportLines(themesRendered, brandFor, brandFiles);

  // Fonts are reported on the same principle. An embedded family is provenance
  // worth stating; a family that could not be embedded is the one render path
  // whose output depends on the machine, so it is a warning rather than a note.
  for (const family of fontsUsed) {
    const font = fontFor(family);
    if (font.provenance === 'fontsource' || font.provenance === 'file') {
      const line = fontReportLine(font);
      if (line) report.brand.push(line);
    } else if (font.provenance === 'local') {
      report.warnings.push(`brand font "${font.family}" ${font.note}, so wrapping may differ per machine`);
    } else if (!font.file) {
      report.warnings.push('bundled Inter font not found — rendering with a system fallback, so wrapping may differ per machine');
    }
  }

  for (const d of report.diagrams) {
    if (d.lightOnDark) report.warnings.push(`${d.id}: theme is dark but no designDark is declared, so diagram "${d.diagram}" is drawn on the light profile (a light panel)`);
    if (d.status === 'ok' && d.selfCheck !== 'ok') report.warnings.push(`${d.id} (${d.orientation}): diagram geometry ${d.selfCheck.startsWith('failed') ? d.selfCheck : 'unchecked'} (diagram-design self_check.py)`);
  }

  // A frozen drawing that no longer matches its spec, brand or slot passes every
  // other gate and is wrong, so staleness is an invariant: batch-reported, fatal.
  const badDiagrams = report.diagrams.filter((d) => d.status !== 'ok');
  if (badDiagrams.length && !options.allowStaleDiagrams) {
    const lines = badDiagrams
      .map((d) => `  ${d.id} (${d.orientation}) diagram "${d.diagram}" is ${d.status === 'missing' ? `not drawn — expected ${d.file}` : 'stale — its spec, brand profile or slot changed after it was drawn'}`)
      .join('\n');
    throw new Error(
      `${badDiagrams.length} diagram frame(s) are missing or stale:\n${lines}\n` +
        'Draw them with diagram-design (deck.mjs --stamp-diagrams prints the brief), then stamp; or pass --allow-stale-diagrams to render anyway.'
    );
  }

  // D14: hard fail, batch-reported, so one run tells you everything to fix.
  if (report.overflow.length && !options.allowOverflow) {
    const lines = report.overflow
      .map((o) => `  ${o.id} (${o.orientation}) ${o.kind}: +${o.overflowY}px vertical, +${o.overflowX}px horizontal — "${o.text}"`)
      .join('\n');
    throw new Error(
      `${report.overflow.length} slide element(s) overflow their container:\n${lines}\n` +
        'Shorten the text, split the slide, or pass --allow-overflow to render anyway.'
    );
  }

  // Contrast is an invariant, not a heuristic: unreadable text passes overflow,
  // passes the icon check and passes verification, then fails in front of an
  // audience. Brand colours are never auto-corrected — a nudged brand is not
  // the brand — so the only honest options are fix the palette or say so.
  if (report.contrast.length && !options.allowLowContrast) {
    const lines = report.contrast
      .map((c) => `  ${c.id} (${c.orientation}) ${c.selector}: ${c.ratio}:1, needs ${c.min}:1 — "${c.text}"`)
      .join('\n');
    throw new Error(
      `${report.contrast.length} slide element(s) fall below their contrast threshold:\n${lines}\n` +
        'Adjust the brand palette, or pass --allow-low-contrast to render anyway.'
    );
  }

  return { report };
}

/** Overflow on a custom page is measured on every element: there are no data-measure marks. */
const CUSTOM_MEASURE_SELECTORS = ['body *'];

/** How long a page that declared window.__slideReady may take to set it. */
const READY_TIMEOUT_MS = 15_000;

/**
 * A seeded Math.random (mulberry32), installed before any page script runs, so a
 * custom page that randomises renders identically every time. Re-seeded per
 * document, so slide order cannot change a slide's pixels.
 */
const SEEDED_RANDOM = `(() => { let s = 0x2545F491; Math.random = () => { s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();`;

/**
 * Which source a custom slide renders from for one orientation: the portrait
 * file when declared, else the landscape one. A path wins over a URL only by
 * being the portrait declaration; validation forbids declaring both per slot.
 */
function customSource(slide, orientation) {
  if (orientation === 'vertical' && (slide.portraitHtmlPath || slide.portraitHtmlUrl)) {
    return slide.portraitHtmlPath ? { path: slide.portraitHtmlPath } : { url: slide.portraitHtmlUrl, frozenAs: 'vertical' };
  }
  return slide.htmlPath ? { path: slide.htmlPath } : { url: slide.htmlUrl, frozenAs: 'landscape' };
}

/**
 * Wait until a JavaScript page says it is finished.
 *
 * A page opts in by declaring `window.__slideReady = false` early and setting it
 * true after its last fetch, font load and layout pass. Without the declaration
 * the capture falls back to network idle plus fonts and SAYS so, because a
 * half-drawn slide passes every other check.
 */
async function waitForSlideReady(page, { id, orientation, report }) {
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
  await page.evaluate('document.fonts ? document.fonts.ready.then(() => true) : true');
  const declared = await page.evaluate("'__slideReady' in window");
  if (!declared) {
    report.warnings.push(`${id} (${orientation}): unverified readiness — the page never declared window.__slideReady, so it was captured after network idle and fonts`);
    return;
  }
  try {
    await page.waitForFunction('window.__slideReady === true', null, { timeout: READY_TIMEOUT_MS });
  } catch {
    report.warnings.push(`${id} (${orientation}): window.__slideReady was declared but never set true within ${READY_TIMEOUT_MS / 1000}s — captured as-is`);
  }
}

/**
 * Load a custom slide into the page and return its rendered HTML.
 *
 * A path is NAVIGATED to (file://), not injected, so the author's relative CSS,
 * scripts and images resolve. A URL is replayed from the HAR frozen by
 * --freeze-custom with every unrecorded request aborted, so a build never
 * reaches the network and the same commit renders the same page.
 */
async function loadCustomPage({ page, workDir, id, slide, orientation, report }) {
  const source = customSource(slide, orientation);
  if (source.path) {
    const file = path.resolve(workDir, source.path);
    if (!existsSync(file)) throw new Error(`custom slide references missing HTML: ${source.path}`);
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' });
  } else {
    const har = path.join(workDir, customFiles(id, source.frozenAs).har);
    if (!existsSync(har)) {
      throw new Error(`custom ${id} has an htmlUrl but no frozen copy at ${path.relative(workDir, har)} — run deck.mjs --freeze-custom and commit custom/`);
    }
    // The HAR keeps serving while the page settles, so it is removed only after
    // the ready wait and the capture of the rendered HTML, below.
    await page.routeFromHAR(har, { notFound: 'abort', url: '**/*' });
    await page.goto(source.url, { waitUntil: 'load' });
  }
  await waitForSlideReady(page, { id, orientation, report });
  const html = await page.content();
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  return html;
}

/** Strip the XML prolog and doctype so a frozen SVG can be inlined in HTML. */
function inlineSvg(text) {
  return text.replace(/<\?xml[^>]*\?>/g, '').replace(/<!DOCTYPE[^>]*>/gi, '').trim();
}

/**
 * Attach a slide's frozen diagram for one orientation, recording its status.
 * Pure aside from reading the frozen files; the verdict is applied at the end of
 * the render so one run reports every stale diagram at once.
 */
function attachDiagram({ workDir, id, slide, orientation, profileFor, report }) {
  const d = slide.diagram;
  if (!d) return slide;
  const profile = profileFor(slide.theme ?? 'light');
  const size = diagramCanvas(d.placement?.layout ?? slide.layout, orientation, d.placement?.cards ?? 0);
  const files = diagramFiles(d.id, orientation, d.step);
  const svgFile = path.join(workDir, files.svg);
  const svgExists = existsSync(svgFile);
  const provenance = readProvenance(workDir, files.provenance);
  const status = diagramStatus({ provenance, orientation, expectedHash: diagramHash({ spec: d.spec, profileText: profile.text, size }), svgExists });
  report.diagrams.push({
    id, diagram: d.id, kind: d.kind, step: d.step, orientation, status, size, file: files.svg,
    selfCheck: provenance?.frames?.[orientation]?.selfCheck ?? 'unchecked', lightOnDark: profile.lightOnDark,
  });
  return { ...slide, diagramSvg: svgExists ? inlineSvg(readFileSync(svgFile, 'utf8')) : null };
}

/**
 * Diagram text against the viewing profile's reading floor. Warns, like the
 * legibility report: the venue is a fact the source does not know. The default
 * profile follows the canvas (a 9:16 frame is a phone).
 */
function checkDiagramText(runs, { id, orientation, profile, report }) {
  const resolved = profile ?? (orientation === 'vertical' ? 'phone' : 'screen');
  const mixed = typeFloor('card-text', { profile: resolved, orientation });
  const caps = typeFloor('card-detail', { profile: resolved, orientation });
  const below = runs.filter((r) => r.px + 0.5 < (r.caps ? caps : mixed));
  if (!below.length) return;
  const worst = below.reduce((a, b) => (b.px < a.px ? b : a));
  report.warnings.push(
    `${id} (${orientation}): ${below.length} diagram text run(s) below the ${resolved} floor (${mixed}px, caps ${caps}px) — smallest ${worst.px}px "${worst.text}"; ` +
      'cut nodes, give it the full diagram layout, or split it'
  );
}

/**
 * Render the marp deck to per-slide HTML for one orientation.
 *
 * marp-cli renders the whole .md in a single pass, so this returns an array of
 * standalone HTML documents in page order — the caller measures each in our
 * Chromium (the shared overflow/contrast gates) and rasterises it there, which
 * is what makes marp a co-equal renderer rather than a second, ungated one.
 *
 * The emitted .md is a generated artefact with a source checksum: a hand edit
 * made after generation is detected and NOT clobbered (mirrors lockfileStatus).
 * The theme is slideCss({scoped}) written to a file and passed via --theme, so
 * brand tokens resolve through the one generator.
 *
 * VERIFIED marp-cli 4.2.3 flags, three of them determinism hazards:
 *   --no-config-file  MANDATORY: marp reads marp.config.js from the cwd by
 *                     default, so a stray config anywhere in the user's repo
 *                     would silently change the render.
 *   --browser chrome  + --browser-path pins marp to OUR Chromium; the default
 *                     `auto` could pick Firefox, whose rendering is incompatible.
 *   --template bare   the default `bespoke` wraps output in a presentation shell
 *                     with an on-screen controller, wrong for measurement.
 *   --html            deliberately NOT set: the emission is markdown-native, so
 *                     marp's default of stripping inline HTML is both sufficient
 *                     and the safer setting.
 * FUTURE OPPORTUNITY: marp-cli exports PDF/HTML/PPTX/notes natively (--pdf,
 * --pptx, --notes). The deck keeps routing those through writePdf() and
 * deckHtmlBundle() so both engines emit one identical artefact set; adopting
 * marp's native export is a later, separate decision.
 */
async function renderMarpHtml({ paths, workDir, orientation, slides, icons, deck, brandFor, fontFor, report, checksum }) {
  const { chromium } = await import(path.join(paths.nodeModules, 'playwright', 'index.mjs'));
  const chromiumPath = chromium.executablePath();

  const theme = deck.theme ?? 'light';
  const resolved = brandFor(theme);
  const font = fontFor(resolved?.fontFamily ?? 'Inter');
  const brand = resolved ? { ...resolved, fontFallback: font.fallbackFamily } : null;

  // The theme file: one @font-face (so the font is base64-embedded and
  // --allow-local-files is avoidable, per the verified flag notes) plus the
  // scoped slideCss. `@theme` names it so marp's --theme path binds cleanly.
  const css = `/* @theme deck-${theme} */\n${font.css}\n${themeCss({ orientation, theme, fontFamily: font.family, themeTokens: resolved?.tokens ?? null, brand })}`;
  const suffix = orientation === 'landscape' ? '' : `.${orientation}`;
  const themeFile = path.join(paths.slides, `deck-theme${suffix}.css`);
  writeFileSync(themeFile, css);

  // Emit the deck .md, honouring the generated-file contract: a file hand-edited
  // after generation is rendered as-is and never overwritten; otherwise the
  // fresh emission is written. Mirrors lockfileStatus()'s trust model. The
  // checksum is the storyboard's own $source.checksum so the .md and the
  // storyboard lockfile agree on one source-of-truth.
  const mdFile = path.join(workDir, `deck${suffix}.md`);
  const { markdown: fresh, missingIcons } = emitDeckMarkdown({ deck, slides, icons, checksum });
  for (const name of missingIcons) {
    report.warnings.push(`icon "${name}" is unknown, so the marp deck renders that card without one`);
  }
  const existing = existsSync(mdFile) ? readFileSync(mdFile, 'utf8') : null;
  const handEdited = isHandEdited(existing, fresh);
  if (handEdited) {
    report.warnings.push(`${path.basename(mdFile)} was hand-edited after generation — rendering it as-is and not regenerating (its edits are unvalidated)`);
  } else if (existing == null || existing.trim() !== fresh.trim()) {
    writeFileSync(mdFile, fresh);
  }

  const htmlOut = path.join(paths.slides, `deck${suffix}.marp.html`);
  // No --html flag: the emission is markdown-native, so marp's default of
  // stripping inline HTML is both sufficient and the safer setting.
  const args = [
    path.join(paths.nodeModules, '@marp-team', 'marp-cli', 'marp-cli.js'),
    mdFile,
    '--no-config-file',
    '--template', 'bare',
    '--theme', themeFile,
    '--browser', 'chrome',
    '--browser-path', chromiumPath,
    '-o', htmlOut,
  ];
  await execFileAsync(process.execPath, args, {
    cwd: workDir,
    env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: paths.browsers },
    timeout: 5 * 60_000,
    maxBuffer: 64 * 1024 * 1024,
  });

  // Split marp's single HTML into one standalone document per <section>, in page
  // order, so the existing per-slide measure+screenshot loop consumes them
  // unchanged. Each keeps the deck's own <style> so the theme travels with it.
  return splitMarpSections(readFileSync(htmlOut, 'utf8'), slides.length);
}

/**
 * Split marp's bare-template HTML into per-slide standalone documents.
 *
 * marp emits `<style>` blocks in the <head> and one `<section>` per slide in the
 * <body>. Each returned document carries the shared styles plus one section, so
 * measuring or screenshotting it in our Chromium reproduces exactly what that
 * page renders — mapped to slide ids by order, as marp numbers its pages.
 */
function splitMarpSections(html, expected) {
  const styles = [...html.matchAll(/<style[\s\S]*?<\/style>/gi)].map((m) => m[0]).join('\n');
  const sections = [...html.matchAll(/<section[\s\S]*?<\/section>/gi)].map((m) => m[0]);
  if (sections.length !== expected) {
    throw new Error(`marp rendered ${sections.length} slide(s) but the deck has ${expected} — page-to-id mapping is by order and cannot recover`);
  }
  return sections.map(
    (section) => `<!doctype html><html lang="en"><head><meta charset="utf-8">${styles}</head><body>${section}</body></html>`
  );
}

/**
 * The deck-level canvas set: what a slide renders onto unless it says otherwise.
 *
 * A slides presentation declares it (`presentation.orientations`, compiled to
 * `meta.deck.orientations`); a video presentation derives it from the video
 * outputs, so the deck and the film stay two renders of one argument (D22).
 */
function deriveOrientations(manifest) {
  const declared = manifest.meta?.deck?.orientations;
  if (Array.isArray(declared) && declared.length) return declared.filter((a) => ORIENTATIONS[a]);
  const aspects = (manifest.meta?.outputs ?? [{ aspect: 'landscape' }]).map((o) => o.aspect);
  return [...new Set(aspects)].filter((a) => ORIENTATIONS[a]);
}

/** One PDF page per slide, at the slide's exact pixel size so nothing rescales. */
async function writePdf(page, pages, { width, height, out }) {
  // Inline each PNG as a data URI rather than a file:// reference. A document
  // installed via setContent lives at about:blank, and Chromium routinely
  // refuses to load file:// sub-resources from it, producing a tiny PDF of
  // blank pages with unresolved image links. Embedding the bytes removes the
  // fetch entirely and makes the PDF self-contained.
  const body = pages
    .map((p) => {
      const data = readFileSync(p.png).toString('base64');
      return `<section style="width:${width}px;height:${height}px;overflow:hidden;page-break-after:always">
<img src="data:image/png;base64,${data}" width="${width}" height="${height}" alt=""></section>`;
    })
    .join('');
  await page.setContent(
    `<!doctype html><html><head><style>@page{size:${width}px ${height}px;margin:0}
body{margin:0}section{display:block}</style></head><body>${body}</body></html>`,
    { waitUntil: 'load' }
  );
  // Guarantee every image has decoded before printing; load can fire first.
  await page.evaluate(async () => {
    await Promise.all(
      [...document.images].map((img) => (img.complete ? Promise.resolve() : img.decode().catch(() => {})))
    );
  });
  await page.pdf({ path: out, width: `${width}px`, height: `${height}px`, printBackground: true, pageRanges: `1-${pages.length}` });
}

/**
 * Self-contained HTML deck: arrow-key navigation and speaker notes.
 *
 * This is also the hand-off format for producing PowerPoint externally (D15) —
 * the skill does not emit .pptx, because a second renderer would drift from the
 * one that produces the video frames.
 */
/**
 * The shipped presentation shell.
 *
 * `brand` colours the chrome around the slides — the surround, the notes strip
 * and the hint. Unlike the slides themselves this is the one artefact recipients
 * open in an arbitrary browser, so the chrome deliberately stays plain CSS.
 *
 * The surround is derived from the brand's ink rather than its background: the
 * shell sits *behind* the slides and needs to recede, and reusing `--bg` here
 * would make a light deck's edges vanish against it.
 */
function deckHtmlBundle(manifest, pages, { width, height, brand = null }) {
  const surround = brand?.tokens?.['--primary'] ?? '#0b1220';
  const notesText = brand?.tokens?.['--bg'] ?? '#cbd5e1';
  // 8-digit hex rather than color-mix(): this is the one artefact opened in
  // arbitrary browsers, and #RRGGBBAA has been supported far longer. 0xDB ≈ 86%,
  // matching the slate default it replaces. Falls back to the literal when the
  // brand colour is not hex, since appending alpha to `oklch(...)` is invalid.
  const brandInk = brand?.tokens?.['--primary'];
  const notesBg = /^#[0-9a-fA-F]{6}$/.test(brandInk ?? '') ? `${brandInk}DB` : 'rgba(2,6,23,.86)';
  const hint = brand?.tokens?.['--secondary'] ?? '#64748b';
  const slidesHtml = pages
    .map(
      (p, i) => `<section class="s" data-i="${i}" data-notes="${(p.notes ?? '').replace(/"/g, '&quot;')}">
<div class="frame"><iframe srcdoc="${p.html.replace(/"/g, '&quot;')}" width="${width}" height="${height}" frameborder="0" scrolling="no" tabindex="-1"></iframe></div>
</section>`
    )
    .join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>${(manifest.meta?.title ?? 'Deck').replace(/</g, '&lt;')}</title>
<style>
html,body{margin:0;background:${surround};height:100%;font-family:system-ui,sans-serif}
#stage{position:fixed;inset:0;display:grid;place-items:center}
.s{display:none}.s.on{display:block}
/* transform:scale() shrinks the visual but not the layout box, so the scaled
   frame is wrapped in a .frame whose size fit() sets to the *scaled* pixels.
   That is the box #stage centers; the iframe scales from its top-left corner
   to fill it exactly. Scaling the iframe alone leaves a 1920x1080 layout box
   that overflows a smaller window and lands the visible content off-centre. */
.frame{box-shadow:0 30px 80px rgba(0,0,0,.5);overflow:hidden}
/* pointer-events:none keeps the iframe from capturing focus or clicks, which
   would otherwise divert arrow-key keydown events into the iframe document and
   break parent-window navigation. */
iframe{transform-origin:top left;border:0;display:block;pointer-events:none}
#nav{position:fixed;inset:0;display:flex;z-index:5}
#nav .zone{flex:1;cursor:pointer}
#nav .zone.prev{flex:0 0 22%}
#nav .zone.next{flex:0 0 22%}
#notes{position:fixed;left:0;right:0;bottom:0;color:${notesText};background:${notesBg};
  padding:14px 22px;font-size:15px;line-height:1.45;display:none}
#notes.on{display:block}
#hint{position:fixed;top:12px;right:16px;color:${hint};font-size:12px}
</style></head><body>
<div id="stage">${slidesHtml}</div>
<div id="nav"><div class="zone prev" data-nav="prev"></div><div class="zone mid" data-nav="next"></div><div class="zone next" data-nav="next"></div></div>
<div id="notes"></div><div id="hint">&larr; &rarr; / click navigate &middot; N notes</div>
<script>
const W=${width},H=${height};
const S=[...document.querySelectorAll('.s')];let i=0,notes=false;
const notesEl=document.getElementById('notes');
function fit(){const s=Math.min(innerWidth/W,(innerHeight-(notes?90:0))/H);
  S.forEach(x=>{const f=x.querySelector('.frame');
    f.style.width=(W*s)+'px';f.style.height=(H*s)+'px';
    f.querySelector('iframe').style.transform='scale('+s+')';});}
function show(n){i=(n+S.length)%S.length;S.forEach((x,k)=>x.classList.toggle('on',k===i));
  notesEl.textContent=S[i].dataset.notes||'';fit();}
addEventListener('keydown',e=>{
  if(e.key==='ArrowRight'||e.key===' ')show(i+1);
  else if(e.key==='ArrowLeft')show(i-1);
  else if(e.key.toLowerCase()==='n'){notes=!notes;notesEl.classList.toggle('on',notes);fit();}});
document.getElementById('nav').addEventListener('click',e=>{
  const z=e.target.closest('[data-nav]');if(!z)return;
  show(z.dataset.nav==='prev'?i-1:i+1);});
addEventListener('resize',fit);show(0);
</script></body></html>`;
}

function slug(title) {
  return String(title ?? 'deck').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'deck';
}

// ---------------------------------------------------------------------------
// Brand extraction (occasional, never part of a build — phase-2-plan.md D2)
// ---------------------------------------------------------------------------

/**
 * Read a live app's computed custom properties and write DESIGN.md +
 * DESIGN.dark.md. This is the impure half of the extractor: the pure mapping is
 * in extract-brand.mjs. It launches Chromium exactly as renderDeck does, but is
 * a DISTINCT mode guarded by the flag — it must never run inside the render
 * path, which is what keeps a deck build offline and free of a running app.
 *
 * Two passes give two standalone files: emulateMedia({ colorScheme }) covers
 * prefers-color-scheme themes, and adding a `.dark` class to the root covers
 * shadcn's class-based default. Both are attempted; whichever the app honours
 * yields the dark palette.
 */
async function extractBrandToFiles({ url, outDir, paths }) {
  process.env.PLAYWRIGHT_BROWSERS_PATH = paths.browsers;
  const { chromium } = await import(path.join(paths.nodeModules, 'playwright', 'index.mjs'));
  const browser = await chromium.launch({ headless: true });
  const written = [];
  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    // One evaluate resolves every custom property plus the type and radius the
    // format needs. Runs in the page, so it reads what actually rendered — the
    // format-agnostic property phase-2-plan.md relies on.
    const readComputed = () =>
      page.evaluate(() => {
        const root = getComputedStyle(document.documentElement);
        const props = {};
        for (let i = 0; i < root.length; i++) {
          const name = root[i];
          if (name.startsWith('--')) props[name] = root.getPropertyValue(name).trim();
        }
        const bodyStyle = getComputedStyle(document.body);
        const h1 = document.querySelector('h1, [role="heading"]');
        const rounded = document.querySelector('[class*="card"], button, input, .rounded');
        return {
          props,
          fontFamily: bodyStyle.fontFamily || null,
          bodyFontSize: bodyStyle.fontSize || null,
          h1FontSize: h1 ? getComputedStyle(h1).fontSize : null,
          radius: rounded ? getComputedStyle(rounded).borderRadius : null,
        };
      });

    for (const theme of ['light', 'dark']) {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto(url, { waitUntil: 'load' });
      if (theme === 'dark') {
        // Cover shadcn's class-based default in addition to the media query.
        await page.evaluate(() => document.documentElement.classList.add('dark'));
      }
      const measured = await readComputed();
      const built = buildDesignMd({ ...measured, theme, url });
      const file = path.join(outDir, theme === 'dark' ? 'DESIGN.dark.md' : 'DESIGN.md');
      writeFileSync(file, built.text);
      written.push({ file, theme, missing: built.missing, audit: built.audit });
    }
    await context.close();
  } finally {
    await browser.close();
  }
  return written;
}

// ---------------------------------------------------------------------------
// Diagrams: brief, stamp (authoring time, never part of a build)
// ---------------------------------------------------------------------------

/**
 * Stamp frozen diagrams with the hash of what they were drawn from.
 *
 * The agent draws with diagram-design and writes the SVGs; this records, per
 * orientation, the content hash (spec + profile + slot), each frame's bytes and
 * the result of diagram-design's own self_check.py. For anything not yet drawn
 * it prints the drawing brief instead — what to draw, at what size, against
 * which profile, into which file — so the agent never computes a hash or a path.
 *
 * It refuses to bless a stale drawing: if a frame's bytes are unchanged since the
 * last stamp but its expected hash moved, the spec changed and nobody redrew it.
 */
export async function stampDiagrams({ workDir, storyline, manifest }) {
  const paths = presentationPaths(workDir);
  const warnings = [];
  const brandFiles = await loadBrandFiles({ workDir, paths, deck: manifest?.meta?.deck, warn: (w) => warnings.push(w) });
  const brandFor = brandResolver(brandFiles, (w) => warnings.push(w));
  const profileFor = diagramProfileResolver(brandFiles, brandFor);
  const meta = presentationMeta(storyline);
  const entries = storyline.entries ?? [];
  const skill = findDiagramDesign([workDir, process.cwd()]);
  const python = await findPython();
  const defining = entries.filter((e) => e?.diagram && !e.diagram.ref);
  const result = { stamped: [], briefs: [], refused: [], warnings, skill, python, profiles: [] };
  if (!defining.length) return result;

  const themes = defining.map((e) => e.theme ?? meta.theme ?? 'light');
  result.profiles = writeDiagramProfiles(workDir, profileFor, themes);

  for (const entry of defining) {
    const id = entry.id;
    const spec = diagramAndUrlFields(entry, entries).diagram.spec;
    const steps = [...new Set(entries.filter((e) => e?.diagram?.ref === id && e.diagram.step).map((e) => e.diagram.step))].sort((a, b) => a - b);
    const orientations = (meta.mode ?? 'video') === 'video' ? deckOrientations(storyline) : slideOrientations(entry, storyline);
    const profile = profileFor(entry.theme ?? meta.theme ?? 'light');
    const provFile = diagramFiles(id).provenance;
    const previous = readProvenance(workDir, provFile);
    const frames = {};
    const missing = [];
    const fresh = [];
    for (const orientation of orientations) {
      const size = diagramCanvas(entry.layout ?? 'diagram', orientation, (entry.cards ?? []).length);
      const hash = diagramHash({ spec, profileText: profile.text, size });
      const final = diagramFiles(id, orientation);
      const stepFiles = Object.fromEntries(steps.map((n) => [n, diagramFiles(id, orientation, n).svg]));
      const absent = [final.svg, ...Object.values(stepFiles)].filter((f) => !existsSync(path.join(workDir, f)));
      if (absent.length) {
        missing.push({ orientation, size, files: absent });
        continue;
      }
      const svg = fileSha(path.join(workDir, final.svg));
      const prev = previous?.frames?.[orientation];
      if (prev && prev.svg === svg && prev.hash !== hash) {
        result.refused.push({ id, orientation, size, reason: `the spec, brand profile or slot changed but the SVG bytes did not — redraw at ${size.width}x${size.height} before stamping` });
        frames[orientation] = prev;
        continue;
      }
      fresh.push(orientation);
      frames[orientation] = {
        hash,
        size,
        svg,
        steps: Object.fromEntries(Object.entries(stepFiles).map(([n, f]) => [n, fileSha(path.join(workDir, f))])),
        selfCheck: await runSelfCheck({ skill, python, htmlFile: path.join(workDir, final.html) }),
      };
    }
    if (missing.length) {
      result.briefs.push({ id, kind: spec.kind, profile: path.relative(workDir, path.join(workDir, 'diagrams', `profile.${profile.theme}.md`)), steps, missing, spec });
    }
    if (fresh.length) {
      writeFileSync(
        path.join(workDir, provFile),
        `${JSON.stringify({ $generated: 'GENERATED by deck.mjs --stamp-diagrams — do not edit', kind: spec.kind, drawnWith: { skill: 'diagram-design', version: skill?.version ?? 'unknown' }, profile: profile.theme, frames }, null, 2)}\n`
      );
      result.stamped.push({ id, orientations: fresh });
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Custom slides from a URL: freeze once (never part of a build)
// ---------------------------------------------------------------------------

/**
 * Fetch every `htmlUrl` / `portraitHtmlUrl` once and freeze it as a HAR with
 * embedded bodies — the document AND every sub-resource it loaded — plus a
 * provenance record. The build replays the HAR offline. Playwright's own HAR
 * recorder does this, so there is no hand-rolled asset inliner to get wrong.
 */
export async function freezeCustom({ workDir, storyline }) {
  const { paths, capabilities } = await probe(workDir);
  if (!capabilities.playwright) throw new Error('Playwright/Chromium missing — run bootstrap.mjs before freezing custom slides');
  const targets = [];
  for (const e of storyline.entries ?? []) {
    if (e?.htmlUrl) targets.push({ id: e.id, url: e.htmlUrl, orientation: 'landscape' });
    if (e?.portraitHtmlUrl) targets.push({ id: e.id, url: e.portraitHtmlUrl, orientation: 'vertical' });
  }
  if (!targets.length) return [];
  mkdirSync(path.join(workDir, 'custom'), { recursive: true });
  process.env.PLAYWRIGHT_BROWSERS_PATH = paths.browsers;
  const { chromium } = await import(path.join(paths.nodeModules, 'playwright', 'index.mjs'));
  const browser = await chromium.launch({ headless: true });
  const written = [];
  try {
    for (const t of targets) {
      const files = customFiles(t.id, t.orientation);
      const har = path.join(workDir, files.har);
      const { width, height } = CANVAS[t.orientation] ?? CANVAS.landscape;
      const context = await browser.newContext({ viewport: { width, height }, reducedMotion: 'reduce' });
      await context.addInitScript(SEEDED_RANDOM);
      await context.routeFromHAR(har, { update: true, updateContent: 'embed', url: '**/*' });
      const page = await context.newPage();
      const report = { warnings: [] };
      await page.goto(t.url, { waitUntil: 'load' });
      await waitForSlideReady(page, { id: t.id, orientation: t.orientation, report });
      await context.close(); // the HAR is written on close
      const provenance = { url: t.url, fetchedAt: new Date().toISOString(), sha256: fileSha(har), orientation: t.orientation };
      writeFileSync(path.join(workDir, files.provenance), `${JSON.stringify(provenance, null, 2)}\n`);
      written.push({ ...t, har: files.har, warnings: report.warnings });
    }
  } finally {
    await browser.close();
  }
  return written;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

if (isMainModule(import.meta.url)) {
  const { parseArgs } = await import('./synthesize.mjs');
  const args = parseArgs(process.argv.slice(2));
  const workDir = presentationContext({ root: args.root, presentation: args.presentation }).paths.workDir;

  // Extraction is a distinct, occasional mode — never part of a build (D2). It
  // writes to the work dir (or --out) and leaves committing to the user, per the
  // skill's "never write outside the work directory by default" rule.
  const loadStoryline = async () => {
    const { presentationPaths } = await import('./lib/probe.mjs');
    const yamlEntry = path.join(presentationPaths(workDir).nodeModules, 'yaml', 'dist', 'index.js');
    if (!existsSync(yamlEntry)) throw new Error('the `yaml` parser is not installed — run bootstrap.mjs first');
    const YAML = await import(yamlEntry);
    return YAML.parse(readFileSync(path.join(workDir, 'storyline.yml'), 'utf8'));
  };

  if (args['stamp-diagrams']) {
    const storyline = await loadStoryline();
    const manifest = JSON.parse(readFileSync(path.join(workDir, 'storyboard.json'), 'utf8'));
    const r = await stampDiagrams({ workDir, storyline, manifest });
    console.log(`diagram-design: ${r.skill ? `${r.skill.dir} (v${r.skill.version})` : 'NOT FOUND — install it (references/migration.md, C1)'}`);
    console.log(`python3: ${r.python ?? 'not found — geometry will be reported unchecked'}`);
    for (const p of r.profiles) console.log(`profile: ${path.relative(process.cwd(), p)}`);
    for (const s of r.stamped) console.log(`stamped ${s.id} (${s.orientations.join(', ')})`);
    for (const x of r.refused) console.log(`  REFUSED ${x.id} (${x.orientation}): ${x.reason}`);
    for (const b of r.briefs) {
      console.log(`\nDRAW ${b.id} — diagram-design type "${b.kind}", style guide ${b.profile}`);
      for (const m of b.missing) console.log(`  ${m.orientation}: ${m.size.width}x${m.size.height} viewBox -> ${m.files.join(', ')}`);
      if (b.steps.length) console.log(`  steps ${b.steps.join(', ')}: each step file is a complete frame showing elements up to that step; the plain file is the final frame`);
      console.log(`  spec: ${JSON.stringify(b.spec)}`);
    }
    for (const w of r.warnings) console.log(`  warning: ${w}`);
    if (r.briefs.length || r.refused.length) process.exitCode = 1;
  } else if (args['freeze-custom']) {
    const written = await freezeCustom({ workDir, storyline: await loadStoryline() });
    if (!written.length) console.log('no custom slide declares an htmlUrl — nothing to freeze');
    for (const w of written) {
      console.log(`froze ${w.id} (${w.orientation}) ${w.url} -> ${w.har}`);
      for (const x of w.warnings) console.log(`  warning: ${x}`);
    }
    if (written.length) console.log('commit custom/ — builds replay it offline');
  } else if (args['extract-brand']) {
    const url = String(args['extract-brand']);
    const { probe } = await import('./lib/probe.mjs');
    const { paths, capabilities } = await probe(workDir);
    if (!capabilities.playwright) {
      throw new Error('Playwright/Chromium missing — run bootstrap.mjs before extracting a brand');
    }
    const outDir = args.out ? path.resolve(args.out) : workDir;
    mkdirSync(outDir, { recursive: true });
    const written = await extractBrandToFiles({ url, outDir, paths });
    for (const w of written) {
      console.log(`wrote ${path.relative(process.cwd(), w.file)} (${w.theme})`);
      // Report every gap — non-negotiable 7: never apply a substitution silently.
      for (const m of w.missing) console.log(`  missing: ${m}`);
    }
    console.log('review the files, then commit them and point deck.design at DESIGN.md');
  } else {
  const manifest = JSON.parse(readFileSync(path.join(workDir, 'storyboard.json'), 'utf8'));

  // The source storyline is optional here: without it, deck-only slides are absent
  // from the artifact but every video slide still renders.
  let storylineSource = null;
  const storylineFile = args.storyline ? path.resolve(args.storyline) : path.join(workDir, 'storyline.yml');
  if (existsSync(storylineFile)) {
    const { presentationPaths } = await import('./lib/probe.mjs');
    const yamlEntry = path.join(presentationPaths(workDir).nodeModules, 'yaml', 'dist', 'index.js');
    if (existsSync(yamlEntry)) {
      const YAML = await import(yamlEntry);
      storylineSource = YAML.parse(readFileSync(storylineFile, 'utf8'));
    }
  }

  const { report } = await renderDeck({
    workDir,
    manifest,
    storylineSource,
    options: {
      formats: args.formats ? String(args.formats).split(',') : undefined,
      orientations: args.aspect ? String(args.aspect).split(',') : undefined,
      allowOverflow: Boolean(args['allow-overflow']),
      allowLowContrast: Boolean(args['allow-low-contrast']),
      allowStaleDiagrams: Boolean(args['allow-stale-diagrams']),
      profile: args.profile ? String(args.profile) : undefined,
    },
  });

  const byOrientation = report.orientations.map((o) => `${o}: ${report.slides.filter((s) => s.orientation === o).length}`).join(', ');
  console.log(`rendered slides (${byOrientation})`);
  for (const a of report.artifacts) console.log(`  ${path.relative(process.cwd(), a)}`);
  // Brand provenance before warnings: which variables came from the brand file,
  // which fell back, what the format cannot express, where a ratio was clamped.
  // Collecting this and not printing it would defeat the whole point of
  // reporting substitutions — a 60%-branded deck must not look like a bug.
  for (const line of report.brand ?? []) console.log(`  ${line}`);
  // Every diagram choice in one read, so the agent's routing is reviewable.
  for (const d of report.diagrams) {
    console.log(`  diagram ${d.id} (${d.orientation}): ${d.kind}${d.step ? ` step ${d.step}` : ''} -> ${d.status}, geometry ${d.selfCheck}`);
  }
  for (const w of report.warnings) console.log(`  warning: ${w}`);
  if (report.overflow.length) console.log(`  overflow tolerated on ${report.overflow.length} element(s) (--allow-overflow)`);
  if (report.contrast.length) console.log(`  low contrast tolerated on ${report.contrast.length} element(s) (--allow-low-contrast)`);
  }
}
