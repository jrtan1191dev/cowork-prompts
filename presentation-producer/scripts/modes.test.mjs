/**
 * presentation-producer :: mode and namespace tests
 *
 * Covers what the rename actually introduced: per-presentation namespaces, slug
 * resolution, the two declared modes and the field rules that keep a declared
 * mode from disagreeing with the body of its own storyline.
 *
 * Runs on system Node with no install, like every other tier-1 test file.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  DEFAULT_ROOT,
  presentationPaths,
  presentationSlugs,
  resolvePresentation,
  runtimePaths,
} from './lib/probe.mjs';
import {
  MODES,
  ORIENTATIONS,
  compileStoryline,
  deckOrientations,
  presentationMeta,
  slideOrientations,
  validateStoryline,
} from './lib/deck.mjs';
import { validateManifest } from './lib/core.mjs';
import { positionals } from './synthesize.mjs';
import { pngSize, verifySlides } from './verify.mjs';

// ---------------------------------------------------------------------------
// D2, D3, D17 — namespaces
// ---------------------------------------------------------------------------

test('the runtime is shared at the root while everything else is per presentation', () => {
  const p = runtimePaths('/root', 'launch');
  assert.equal(p.runtime, path.join('/root', '.runtime'), 'the install is the only shared thing');
  assert.equal(p.workDir, path.join('/root', 'launch'));
  for (const key of ['storyboard', 'storyline', 'assets', 'output', 'footage', 'slides']) {
    assert.ok(p[key].startsWith(path.join('/root', 'launch')), `${key} must live inside the presentation`);
  }
});

test('the ledger sits with the artifacts it indexes, not in the shared runtime (D17)', () => {
  // Two presentations sharing one ledger would trade cache entries: audioCacheKey
  // digests narration and voice but NOT the scene id, so an identical sentence in
  // two decks collides and the second would reference the first one's audio file.
  const p = runtimePaths('/root', 'launch');
  assert.equal(p.ledger, path.join('/root', 'launch', 'ledger.json'));
  assert.ok(!p.ledger.includes('.runtime'));
  const other = runtimePaths('/root', 'board-review');
  assert.notEqual(p.ledger, other.ledger);
});

test('paths derived from a presentation directory match the explicit form', () => {
  assert.deepEqual(presentationPaths('/root/launch'), runtimePaths('/root', 'launch'));
});

test('the default root is named for its contents, not for the tool (D7)', () => {
  assert.equal(DEFAULT_ROOT, 'presentations');
});

// ---------------------------------------------------------------------------
// D4, D5 — selection
// ---------------------------------------------------------------------------

function tempRoot(slugs) {
  const root = mkdtempSync(path.join(tmpdir(), 'pp-'));
  mkdirSync(path.join(root, '.runtime', 'node_modules'), { recursive: true });
  for (const slug of slugs) {
    mkdirSync(path.join(root, slug), { recursive: true });
    writeFileSync(path.join(root, slug, 'storyline.yml'), 'presentation:\n  mode: slides\n');
  }
  return root;
}

test('only directories holding a storyline count, and the shared runtime never does', () => {
  const root = tempRoot(['launch', 'board-review']);
  mkdirSync(path.join(root, 'not-a-presentation'), { recursive: true });
  try {
    assert.deepEqual(presentationSlugs(root), ['board-review', 'launch'], 'sorted, and half-made folders excluded');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('one presentation needs no flag; several refuse to guess', () => {
  const single = tempRoot(['launch']);
  const many = tempRoot(['launch', 'board-review']);
  try {
    assert.equal(resolvePresentation(single).slug, 'launch');

    const ambiguous = resolvePresentation(many);
    assert.equal(ambiguous.slug, null, 'silently building the wrong deck is worse than stopping');
    assert.match(ambiguous.error, /--presentation=<slug>/);
    assert.match(ambiguous.error, /board-review, launch/, 'the candidates must be listed');

    assert.equal(resolvePresentation(many, 'launch').slug, 'launch');
    assert.match(resolvePresentation(many, 'nope').error, /no presentation "nope"/);
  } finally {
    rmSync(single, { recursive: true, force: true });
    rmSync(many, { recursive: true, force: true });
  }
});

test('slugs differing only by case are a hard error, not a coin toss', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'pp-'));
  try {
    for (const slug of ['Launch', 'launch']) {
      mkdirSync(path.join(root, slug), { recursive: true });
      writeFileSync(path.join(root, slug, 'storyline.yml'), 'presentation:\n  mode: slides\n');
    }
    const found = presentationSlugs(root);
    if (found.length < 2) return; // case-insensitive filesystem collapsed them: nothing to detect
    const r = resolvePresentation(root);
    assert.equal(r.slug, null);
    assert.match(r.error, /differ only by case/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('an empty root reports that it holds nothing rather than throwing', () => {
  assert.match(resolvePresentation(path.join(tmpdir(), 'pp-does-not-exist')).error, /holds no presentations yet/);
});

// ---------------------------------------------------------------------------
// D13 — the presentation:/video: blocks
// ---------------------------------------------------------------------------

const slidesDeck = (entries, presentation = {}) => ({
  presentation: { mode: 'slides', title: 'T', engine: 'html', theme: 'light', ...presentation },
  entries,
});
const card = (over = {}) => ({ icon: 'shield', title: 'One', text: 'First', ...over });
const slide = (over = {}) => ({
  id: '01-a',
  type: 'slide',
  layout: 'spotlight',
  title: 'Title',
  cards: [card(), card({ title: 'Two' }), card({ title: 'Three' })],
  ...over,
});

test('meta is the two blocks flattened, so downstream stages read one shape', () => {
  const meta = presentationMeta({ presentation: { mode: 'video', title: 'T' }, video: { baseUrl: 'http://x' } });
  assert.deepEqual(meta, { mode: 'video', title: 'T', baseUrl: 'http://x' });
});

test('a legacy deck: block is reported, never translated (D14)', () => {
  const { errors } = validateStoryline({ deck: { title: 'T' }, entries: [slide()] });
  assert.equal(errors.length, 1, 'one actionable error beats a pile of unknown-key complaints');
  assert.match(errors[0], /legacy `deck:` block/);
  assert.match(errors[0], /references\/migration\.md/, 'the error must say where the procedure is');
});

test('mode is required and closed', () => {
  const missing = validateStoryline({ presentation: { title: 'T' }, entries: [slide()] });
  assert.ok(missing.errors.some((e) => /presentation\.mode: missing/.test(e)));
  const wrong = validateStoryline({ presentation: { mode: 'film', title: 'T' }, entries: [slide()] });
  assert.ok(wrong.errors.some((e) => /presentation\.mode: must be one of/.test(e)));
  assert.deepEqual([...MODES], ['slides', 'video']);
});

// ---------------------------------------------------------------------------
// D10 — narration is video, notes are slides
// ---------------------------------------------------------------------------

test('a slides presentation rejects narration and takes notes instead', () => {
  const withNarration = validateStoryline(slidesDeck([slide({ narration: 'spoken' })]));
  assert.ok(withNarration.errors.some((e) => /narration: is video-only/.test(e)));

  const withNotes = validateStoryline(slidesDeck([slide({ notes: 'open here' })]));
  assert.deepEqual(withNotes.errors, [], 'notes are the presenter register');
});

test('a video presentation rejects notes, because its deck reads the narration', () => {
  const storyline = {
    presentation: { mode: 'video', title: 'T' },
    entries: [slide({ narration: 'spoken', notes: 'also written' })],
  };
  assert.ok(validateStoryline(storyline).errors.some((e) => /notes: is slides-only/.test(e)));
});

test('a slides presentation refuses the whole video vocabulary', () => {
  const withBlock = validateStoryline({
    presentation: { mode: 'slides', title: 'T' },
    video: { baseUrl: 'http://x' },
    entries: [slide()],
  });
  assert.ok(withBlock.errors.some((e) => /^video: a `mode: slides` presentation has no video/.test(e)));

  const withCapture = validateStoryline(slidesDeck([{ id: '02-c', type: 'capture', url: '/x' }]));
  assert.ok(withCapture.errors.some((e) => /renders slides only/.test(e)));

  const withTarget = validateStoryline(slidesDeck([slide({ in: ['deck', 'video'] })]));
  assert.ok(withTarget.errors.some((e) => /has no video target/.test(e)));
});

test('narration stays required for a video entry and optional for a deck-only one', () => {
  const base = { presentation: { mode: 'video', title: 'T' } };
  assert.ok(
    validateStoryline({ ...base, entries: [slide()] }).errors.some((e) => /narration: required/.test(e))
  );
  assert.deepEqual(validateStoryline({ ...base, entries: [slide({ in: ['deck'] })] }).errors, []);
});

// ---------------------------------------------------------------------------
// D22 — orientation is a property of a canvas, not of a document
// ---------------------------------------------------------------------------

test('render passes are the union of the deck default and every per-slide override', () => {
  const storyline = slidesDeck(
    [slide(), slide({ id: '02-b', orientations: ['landscape', 'vertical'] })],
    { orientations: ['landscape'] }
  );
  assert.deepEqual(deckOrientations(storyline), ['landscape', 'vertical']);
  assert.deepEqual(slideOrientations(storyline.entries[0], storyline), ['landscape'], 'an undeclared slide keeps the default');
  assert.deepEqual(slideOrientations(storyline.entries[1], storyline), ['landscape', 'vertical']);
});

test('a video presentation derives deck orientations from its video outputs', () => {
  const storyline = {
    presentation: { mode: 'video', title: 'T' },
    video: { outputs: [{ aspect: 'landscape' }, { aspect: 'vertical' }] },
    entries: [slide({ narration: 'n' })],
  };
  assert.deepEqual(deckOrientations(storyline), ['landscape', 'vertical']);
  assert.deepEqual(
    slideOrientations(storyline.entries[0], storyline),
    ['landscape', 'vertical'],
    'a scene missing from one cut would desynchronise two renders of one argument'
  );
});

test('per-slide orientation and a deck-level declaration are slides-only', () => {
  const perSlide = validateStoryline({
    presentation: { mode: 'video', title: 'T' },
    entries: [slide({ narration: 'n', orientations: ['vertical'] })],
  });
  assert.ok(perSlide.errors.some((e) => /orientations: per-slide orientation is slides-only/.test(e)));

  const deckLevel = validateStoryline({
    presentation: { mode: 'video', title: 'T', orientations: ['landscape'] },
    entries: [slide({ narration: 'n' })],
  });
  assert.ok(deckLevel.errors.some((e) => /one argument two sources/.test(e)));
});

test('orientations are closed and non-empty when declared', () => {
  assert.ok(
    validateStoryline(slidesDeck([slide()], { orientations: ['sideways'] })).errors.some((e) =>
      /unknown orientation "sideways"/.test(e)
    )
  );
  assert.ok(
    validateStoryline(slidesDeck([slide({ orientations: [] })])).errors.some((e) =>
      /orientations: must be a non-empty array/.test(e)
    )
  );
  assert.deepEqual([...ORIENTATIONS], ['landscape', 'vertical', 'square']);
});

// ---------------------------------------------------------------------------
// compilation
// ---------------------------------------------------------------------------

test('a slides presentation compiles to a scene-free storyboard without warning about it', () => {
  const { manifest, warnings } = compileStoryline(slidesDeck([slide({ notes: 'n' })]), { sourceText: 'x' });
  assert.equal(manifest.meta.mode, 'slides');
  assert.deepEqual(manifest.scenes, [], 'no entry targets a video because there is no video');
  assert.deepEqual(warnings, [], 'an empty scene list is the expected shape here, not a problem');
  assert.deepEqual(manifest.meta.deck.orientations, ['landscape']);
});

test('a scene-free storyboard is valid for slides and invalid for video', () => {
  // Regression: validateManifest demanded a non-empty scenes array, which is
  // right for a film and wrong for a deck. It blocked every slides run.
  const slides = compileStoryline(slidesDeck([slide({ notes: 'n' })]), { sourceText: 'x' }).manifest;
  assert.deepEqual(validateManifest(slides), []);
  assert.ok(validateManifest({ ...slides, meta: { ...slides.meta, mode: 'video' } }).some((e) => /scenes: must be a non-empty/.test(e)));
});

test('the compiled orientation base is the declaration, never the union', () => {
  // Regression: emitting the union as the deck-level base made every slide
  // inherit a canvas that exactly one slide had opted into, so a six-slide deck
  // rendered twelve PNGs.
  const storyline = slidesDeck(
    [slide(), slide({ id: '02-b', orientations: ['landscape', 'vertical'] })],
    { orientations: ['landscape'] }
  );
  const { manifest } = compileStoryline(storyline, { sourceText: 'x' });
  assert.deepEqual(manifest.meta.deck.orientations, ['landscape'], 'the base is what a slide defaults to');
  assert.deepEqual(deckOrientations(storyline), ['landscape', 'vertical'], 'the union is what renders');
});

test('a video storyboard records no orientations, so the outputs stay the single source', () => {
  const { manifest } = compileStoryline(
    { presentation: { mode: 'video', title: 'T' }, entries: [slide({ narration: 'n' })] },
    { sourceText: 'x' }
  );
  assert.equal(manifest.meta.mode, 'video');
  assert.equal(manifest.meta.deck.orientations, undefined);
  assert.equal(manifest.scenes.length, 1);
});

test('the compiled slide carries notes from whichever field the mode allows', () => {
  const { manifest } = compileStoryline(
    { presentation: { mode: 'video', title: 'T' }, entries: [slide({ narration: 'spoken' })] },
    { sourceText: 'x' }
  );
  assert.equal(manifest.scenes[0].slide.notes, 'spoken');
});

// ---------------------------------------------------------------------------
// CLI positionals
// ---------------------------------------------------------------------------

test('the mode word is read as a positional without swallowing flag values', () => {
  assert.deepEqual(positionals(['slides']), ['slides']);
  assert.deepEqual(positionals(['--root', 'presentations', 'slides']), ['slides']);
  assert.deepEqual(positionals(['--root=presentations', 'video']), ['video']);
  assert.deepEqual(positionals(['--presentation', 'launch']), [], 'a flag value is not a positional');
  // Mirrors parseArgs exactly, including its quirk: a valueless flag written
  // before a bare word consumes it. `slides --yes` works; `--yes slides` makes
  // "slides" the value of --yes, in both parsers or neither.
  assert.deepEqual(positionals(['--yes', 'slides']), []);
  assert.deepEqual(positionals(['slides', '--yes']), ['slides']);
});

// ---------------------------------------------------------------------------
// D23 — slides verification
// ---------------------------------------------------------------------------

test('PNG dimensions are read from the IHDR header, and non-PNGs return null', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'pp-png-'));
  try {
    const png = path.join(dir, 'a.png');
    const header = Buffer.alloc(24);
    Buffer.from('89504e470d0a1a0a', 'hex').copy(header, 0);
    header.writeUInt32BE(1920, 16);
    header.writeUInt32BE(1080, 20);
    writeFileSync(png, header);
    assert.deepEqual(pngSize(png), { width: 1920, height: 1080 });

    const notPng = path.join(dir, 'b.png');
    writeFileSync(notPng, Buffer.alloc(24, 7));
    assert.equal(pngSize(notPng), null);
    assert.equal(pngSize(path.join(dir, 'missing.png')), null);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('slides verification fails on wrong geometry and on a missing artifact', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'pp-verify-'));
  try {
    const paths = { slides: dir, output: dir };
    const writePng = (name, width, height) => {
      const header = Buffer.alloc(24);
      Buffer.from('89504e470d0a1a0a', 'hex').copy(header, 0);
      header.writeUInt32BE(width, 16);
      header.writeUInt32BE(height, 20);
      writeFileSync(path.join(dir, name), header);
    };
    writePng('01-a.png', 1920, 1080);
    writePng('02-b.png', 1280, 720); // what a wrong-viewport capture looks like

    const report = {
      slides: [
        { id: '01-a', orientation: 'landscape' },
        { id: '02-b', orientation: 'landscape' },
      ],
      orientations: ['landscape'],
      formats: ['png', 'pdf'],
      artifacts: [path.join(dir, 'never-written.pdf')],
    };
    const result = verifySlides({ paths, manifest: { meta: { title: 'T' } }, deck: report });
    const failures = result.outputs[0].failures.join('\n');
    assert.equal(result.ok, false);
    assert.match(failures, /02-b\.png is 1280x720, expected 1920x1080/);
    assert.match(failures, /declared artifact was never written: never-written\.pdf/);
    assert.ok(!/01-a\.png/.test(failures), 'a correct render must not be reported');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('a portrait render is checked against the portrait canvas', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'pp-verify-'));
  try {
    const header = Buffer.alloc(24);
    Buffer.from('89504e470d0a1a0a', 'hex').copy(header, 0);
    header.writeUInt32BE(1080, 16);
    header.writeUInt32BE(1920, 20);
    writeFileSync(path.join(dir, '01-a.vertical.png'), header);

    const result = verifySlides({
      paths: { slides: dir, output: dir },
      manifest: { meta: { title: 'T' } },
      deck: { slides: [{ id: '01-a', orientation: 'vertical' }], orientations: ['vertical'], formats: ['png'], artifacts: [] },
    });
    assert.equal(result.ok, true, result.outputs[0].failures.join('\n'));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
