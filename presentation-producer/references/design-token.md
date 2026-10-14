---
version: 1
spec: design.md@alpha
# ---------------------------------------------------------------------------
# NORMATIVE. scripts/lib/design-md.mjs reads this frontmatter. The prose below
# is for humans and is never parsed. Keep the two in agreement.
#
# Every design.md token path appears in exactly ONE variable's `sources` list.
# That is enforced by a test: a path claimed twice would make resolution depend
# on evaluation order, which is how `primary` ends up painting both the ink and
# the accent depending on which chain ran first.
# ---------------------------------------------------------------------------

variables:
  # Page background. `background` is not in design.md's recommended set but is
  # what extraction from a real app most often yields, so it leads.
  --bg:
    role: page background
    sources: [colors.background, colors.neutral, colors.base]
    builtin: { light: '#F1F5F9', dark: '#0F172A' }

  --card:
    role: raised card surface
    sources: [colors.surface, colors.card, colors.elevated]
    builtin: { light: '#FFFFFF', dark: '#1E293B' }

  --card-alt:
    role: secondary card surface, used to separate adjacent cards
    sources: [colors.surface-variant, colors.surface-alt, colors.card-alt, colors.muted]
    # Falls back to whatever --card resolved to rather than to the built-in, so
    # a brand that declares one surface gets a coherent deck instead of one
    # branded card beside one slate card.
    inherits: --card
    builtin: { light: '#F8FAFC', dark: '#243044' }

  # INK. Not the brand action colour. See "The --primary trap" below.
  --primary:
    role: primary text ink, headings and body
    sources: [colors.on-surface, colors.on-background, colors.foreground, colors.ink, colors.primary]
    builtin: { light: '#0F172A', dark: '#F1F5F9' }

  --secondary:
    role: muted text, supporting copy
    sources: [colors.on-surface-variant, colors.muted-foreground, colors.secondary]
    builtin: { light: '#64748B', dark: '#94A3B8' }

  # The real brand accent: icon washes, detail labels, connectors, outlines.
  # `colors.primary` is deliberately ABSENT here even though shadcn would put
  # the action colour there — see "The --primary trap".
  --accent-1:
    role: brand accent and interaction colour
    sources: [colors.tertiary, colors.accent, colors.brand, colors.action]
    builtin: { light: '#10B981', dark: '#34D399' }

  --rule:
    role: hairline dividers
    sources: [colors.outline, colors.border, colors.divider]
    builtin: { light: '#E2E8F0', dark: '#334155' }

  --shadow:
    role: card elevation
    # design.md's "Elevation & Depth" section is prose-only with no token
    # subsection, so a conformant file CANNOT express this. Always built-in.
    # Declared here with an empty source list so the omission is data rather
    # than an absence someone later mistakes for an oversight.
    sources: []
    omitted: true
    builtin:
      light: '0 1px 2px rgba(15,23,42,.04), 0 12px 32px rgba(15,23,42,.08)'
      dark: '0 1px 2px rgba(0,0,0,.25), 0 12px 32px rgba(0,0,0,.35)'

typography:
  # Resolved to a family name only. The file is located and embedded by
  # deck.mjs; this layer never touches disk.
  fontFamily:
    sources: [typography.body.fontFamily, typography.base.fontFamily, typography.p.fontFamily, typography.default.fontFamily]
    builtin: Inter

  # Brand type is read as ONE hierarchy signal, not as a per-level size table.
  #
  # An earlier per-level mapping collapsed `title` and `hero-title` onto the
  # same pixel size, because both derive from `h1` and the formula reduced to
  # brandRatio x canvasBody. The brand must set how dominant headings are; it
  # must not flatten the canvas's own relationships between heading levels.
  #
  # So: one multiplier from the brand's h1:body ratio measured against the
  # canvas's title:body ratio, applied to heading levels only. Body copy keeps
  # canvas sizes exactly — a brand's 16px body is authored for a scrolling page
  # and means nothing on a 1920x1080 canvas read from across a room.
  base: typography.body.fontSize
  headingDominance:
    source: typography.h1.fontSize
    canvasHeading: 64
    canvasBody: 28
  # Scaled by the multiplier, preserving their ratios to one another.
  scaled:
    title: 64
    hero-title: 96
    card-title: 34
    stat-value: 140
  # Never scaled.
  fixed:
    body: 28
    card-text: 24
    card-detail: 19
    stat-label: 28
    pill: 20
  # Kept deliberately narrow. The multiplier exists to make a brand's voice
  # recognisable, not to let it resize the canvas: overflow is a hard failure,
  # and a wide bound would turn "adopt a brand" into "rewrite approved copy".
  # Hitting the bound is reported, never silent.
  clamp: { min: 0.85, max: 1.15 }
  # Passed through literally: these change voice without changing the box.
  passthrough:
    title:      [fontWeight, letterSpacing, lineHeight, fontFeature, fontVariation]
    body:       [fontWeight, letterSpacing, lineHeight]
    card-title: [fontWeight, letterSpacing, lineHeight]

# Measured in-browser on computed styles, never computed from these pairs -
# the `bg` column names the EXPECTED backdrop for reporting only. A wash such
# as .card-icon's color-mix is caught because the check reads what actually
# rendered.
contrast:
  - { selector: '.title',      fg: --primary,   bg: --bg,   min: 3.0,  note: '64px 800 - WCAG large text' }
  - { selector: '.hero-title', fg: --primary,   bg: --bg,   min: 3.0,  note: '96px' }
  - { selector: '.body',       fg: --secondary, bg: --bg,   min: 3.0,  note: '28px regular' }
  - { selector: '.card-title', fg: --primary,   bg: --card, min: 3.0,  note: '34px 700' }
  - { selector: '.card-text',  fg: --secondary, bg: --card, min: 4.5,  note: 'stricter than WCAG size rules on purpose - see Thresholds' }
  - { selector: '.card-detail', fg: --accent-1, bg: --card, min: 4.5,  note: '19px 700 uppercase - the most common brand failure' }
  - { selector: '.stat-value', fg: --primary,   bg: --card, min: 3.0,  note: '140px' }
  - { selector: '.stat-label', fg: --secondary, bg: --card, min: 4.5,  note: '28px on a busy card' }
  - { selector: '.pill',       fg: --bg,        bg: --primary, min: 4.5, note: 'inverted: ink is the background here' }

# Surfaces outside the slide that must agree with it, or the same frame shows
# two different brands. Derived, never separately declared - a brand cannot be
# inconsistent with itself.
propagation:
  caption-box: --primary
  caption-text: --bg
  letterbox: --bg
  deck-chrome:
    stage: --bg
    notes-bar: --primary
    notes-text: --secondary
  # EXCLUDED: caption font. ASS carries a single Fontname with no fallback
  # list, so a brand family there resolves per machine. Arial stays.
  excluded: [caption-font]
---

# design-token.md — how a brand becomes a deck

This file is **skill-owned and not project-overridable**. Projects supply brand
data in `DESIGN.md`; they do not get to rewire what the variables mean. A
project-supplied mapping could re-point `--accent-1` at a colour that fails
contrast, or bind ink to the button colour, and at that point the deck's design
system stops being something the authoring surface cannot violate.

It is versioned with the layout catalogue, because it is only correct for
them. Change a layout's colour semantics and this file changes with it.

## The `--primary` trap

`--primary` in this deck is **ink**, not the brand's action colour:

```css
body      { color: var(--primary) }
.pill     { background: var(--primary); color: var(--bg) }
```

The brand accent is `--accent-1`, which drives the card icon wash, the
`.card-detail` label, the lifecycle rail, the `.flow-hub` connector and the
`.side-new` outline.

Three naming conventions collide here:

| System | Ink | Action colour |
| --- | --- | --- |
| this deck | `--primary` | `--accent-1` |
| design.md's own example | `primary` ("deep ink for headlines") | `tertiary` ("sole driver for interaction") |
| shadcn | `--foreground` | `--primary` |

So `colors.primary` means opposite things depending on who wrote the file. The
mapping resolves this by **ordering**, not by guessing: every ink-specific name
(`on-surface`, `on-background`, `foreground`, `ink`) is tried before
`colors.primary`, and `colors.primary` is absent from `--accent-1`'s chain
entirely. A design.md-conventioned file therefore lands correctly, and a
shadcn-conventioned file must name ink explicitly — which is the extractor's
job, not the renderer's guesswork.

Without this written down, the failure is silent and total: every headline in
the deck painted the brand's button colour, on a deck that still passes
overflow, contrast and verification.

## Why the mapping is data and not code

The frontmatter above is parsed. Had this been prose only, nothing would stop
the renderer and the document disagreeing, and no test could assert that each
variable has exactly one documented source. Two properties are enforced by
tests rather than by review:

1. No design.md token path is claimed by two variables.
2. Every variable the renderer emits has an entry here.

## Thresholds

Contrast is an **invariant**: below threshold the render fails, batch-reported
like overflow, escapable with `--allow-low-contrast`. It earns that status
because it is objective, cheap, and invisible to every other check — unreadable
accent text passes overflow, passes the icon check, passes verification, and
fails only in front of an audience.

Thresholds are per-element because the deck is projected. WCAG exempts large
text at 3:1, which legitimately covers `.title` at 64px and `.stat-value` at
140px. Two rows are **deliberately stricter than WCAG's size rule**:
`.card-text` at 24px regular and `.stat-label` at 28px would both qualify as
large text and so be allowed 3:1, but they are the rows most often read from
the back of a room through video compression, where thin antialiased strokes on
a tinted card lose contrast that the ratio does not model. `.card-detail` is
uppercase 19px 700 in the accent colour and is the single most common place a
brand palette fails.

Type, by contrast, **bends**. If type failed too, adopting a brand would make a
previously-valid deck unbuildable, and the person hitting that failure cannot
fix it — they would have to edit the corporate brand file or rewrite approved
copy.

The minimum-readable **type-size floors** and their derivation live in
`references/legibility.md`, alongside contrast preferences, line-measure,
colour-blind-safe palettes and the video caption keep-out bands. There is no fixed
floor table to quote here, and that is the point: a floor is derived from a declared
viewing distance, so the same role has a different floor on a phone (17px) than at
the back of a hall (55px). The shipped `card-text` 24 is exactly the floor for
monitor viewing, which is what the scale is calibrated for. That check WARNS and is
deliberately not an always-on gate — for the same reason type bends here: a hard
floor would silently reverse the type-bending decision.

Brand colours are **never auto-corrected**. A nudged brand is not the brand,
which defeats brand fidelity more thoroughly than refusing would.

## What is ignored, and why

`components:` is parsed and preserved but never consumed. The deck has no
buttons, chips or inputs; its only component-like atoms are the card, the pill
and the stat block. Wiring `components.button-primary.backgroundColor` into
`.pill` would reintroduce the `--primary` confusion from a new direction.

`spacing:` and `rounded:` are parsed. `rounded` is applied to `--radius` when
present; `spacing` is not consumed, because the layouts derive their gaps
from the canvas and a brand spacing scale authored for a scrolling page has no
meaning inside a fixed 1080-tall grid.

`--shadow` cannot be branded at all: design.md's Elevation & Depth section is
prose with no token subsection. It is recorded above as `omitted: true` so the
gap is data, not an absence someone later reads as an oversight.

## Modern web platform features applied

Four features from GoogleChrome/modern-web-guidance are applied to the slide
CSS. They are unconditional: slides are rasterised by one pinned Chromium in
`.runtime/browsers`, so Baseline compatibility data does not constrain them.
Baseline matters only for the shipped HTML deck bundle, which recipients open
in arbitrary browsers.

| Feature | Applied to | Why |
| --- | --- | --- |
| `text-wrap: balance` | `.title`, `.hero-title` | 64px and 96px headings otherwise wrap arbitrarily — the main source of ugly-but-passing slides |
| `text-box: trim-both cap alphabetic` | `.card-icon`, `.card-title` | aligns cap height to the adjacent icon instead of the font's line box |
| `text-wrap: pretty` | `.body`, `.card-text` | orphan control |
| `font-size-adjust` | fallback families | holds x-height stable when a brand family is unavailable, which directly mitigates the one machine-dependent path in font resolution |

## Fallback reporting

Any variable that lands on its built-in is a **reported substitution**, never a
silent default — with one exception: when no brand is declared at all, the
built-ins are simply the theme and nothing is reported, because that is the
skill's pre-existing behaviour rather than a degradation.

A declared brand file that is missing or unparseable is a hard error. An
unbranded deck passes every automated check and fails only in front of the
audience, so a brand that was asked for and did not arrive must stop the build.

## Diagrams: the fourth consumer of the brand

A `diagram:` slide is drawn by the diagram-design skill, which has its own token
system (`style-guide.md`: `paper`, `ink`, `muted`, `accent`, …). It never gets a
second brand. `compile.mjs` writes `diagrams/profile.<theme>.md` — a complete
diagram-design style guide generated from the deck's RESOLVED tokens, so it
inherits every mapping and substitution above — and the agent draws against it as
the effective style guide. Never onboard diagram-design from a URL for a
presentation: that creates a brand that drifts from `DESIGN.md`.

| diagram-design role | Deck variable |
| --- | --- |
| `paper` | `--bg` |
| `paper-2` | `--card-alt` |
| `ink`, `ink-strong` | `--primary` |
| `muted`, `soft`, `link` | `--secondary` |
| `rule`, `rule-solid` | `--rule` |
| `accent` | `--accent-1` (the element declared `weight: primary`) |
| `accent-tint` | `--accent-1` at 12% |
| `node-name`, `callout` | the deck family at `card-text` size |
| `sublabel`, `eyebrow`, `arrow-label` | monospace at `card-detail` size |

The type sizes are the reason the profile exists. diagram-design's presentation
ramp sets node names at 16px; this deck's `screen` floor for card text is 24px.
Handing it the deck's own roles is what makes a drawing at the brief's size clear
the floor by construction. Font source is `system`: the slide already embeds the
deck font, and inline SVG text inherits it.

**Dark is optional.** With `designDark`, a dark profile is generated and dark
slides draw on it. Without it, diagrams on a dark slide use the light profile —
a light panel on a dark slide, reported in the run summary. With no brand at all,
the built-in palette for the slide's theme applies.

The profile is part of each diagram's staleness hash, so a brand edit marks every
diagram drawn against the old profile stale until it is redrawn.

**When the repository has no `DESIGN.md`**, look for the app's own tokens before
falling back to the built-ins: run the app and use `deck.mjs --extract-brand=<url>`.
It reads computed custom properties and already knows shadcn's semantics — shadcn
`--primary` is the brand action colour and becomes `--accent-1`, while shadcn
`--accent` is a pale surface and does not. Commit the result and declare it as
`presentation.design`.
