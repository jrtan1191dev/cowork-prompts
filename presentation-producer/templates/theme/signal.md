---
version: 1.0.0
name: Signal
description: >
  Near-black ink on white with a single amber signal colour and nothing else.
  A deliberately austere, technical register — the opposite of a tinted
  gradient — so a Signal render reads as documentation, not marketing.
colors:
  background: '#FFFFFF'
  surface: '#F4F4F5'
  surface-variant: '#E9E9EC'
  on-surface: '#0A0A0A'
  on-surface-variant: '#52525B'
  outline: '#D4D4D8'
  # One saturated amber carries every accent. Darkened well past a pure
  # #F59E0B so it clears 4.5:1 on the card surface, where a bright amber fails.
  accent: '#8A5A00'
typography:
  body:
    fontFamily: 'IBM Plex Sans, Inter, sans-serif'
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
  h1:
    fontSize: 40px
    fontWeight: 700
    letterSpacing: '-0.015em'
  h3:
    fontSize: 21px
    fontWeight: 600
omitted:
  - spacing
  - rounded
---

# Signal

A high-contrast technical theme: monochrome ink with exactly one signal
colour. Chosen to be unmistakably distinct from the slate-and-emerald default,
from Terracotta's warm serif, and from the two sibling presets — flat, sharp
and colour-frugal by intent.

## Brand & Style

Documentation register. Near-black ink, neutral grey surfaces, and a single
amber accent reserved for detail labels, rules and interactive emphasis.
Nothing decorative competes with it, so the one colour reads as meaning rather
than styling.

## Colors

Ink is named `on-surface` so it resolves to `--primary` without colliding with
the shadcn action-colour convention. The amber is placed in `accent` — not in
`colors.primary` — so it drives `--accent-1` alone and never repaints every
headline in the signal colour. The amber is deliberately dark (`#8A5A00`): a
brighter amber is the classic `.card-detail` failure, and this one clears the
4.5:1 bar on the card surface with margin.

Computed WCAG ratios (all pass):
- `.title` / `.hero-title` ink on background — 19.80:1 (min 3.0)
- `.body` muted on background — 7.73:1 (min 3.0)
- `.card-title` / `.stat-value` ink on card — 18.01:1 (min 3.0)
- `.card-text` / `.stat-label` muted on card — 7.03:1 (min 4.5)
- `.card-detail` amber on card — 5.39:1 (min 4.5)
- `.pill` background on ink — 19.80:1 (min 4.5)

## Typography

IBM Plex Sans, a Fontsource-published variable family (`@fontsource-variable/ibm-plex-sans`),
for a plainer, more mechanical voice than Inter. A 16px body against a 40px h1
is a 2.5x ratio — flatter than the canvas default — so the heading-dominance
multiplier has a real, modest signal to act on rather than a fabricated one.

## Elevation & Depth

None. The theme leans on the grey surface separation and hairline outlines;
shadow cannot be expressed as a design.md token in any case, and `rounded` is
omitted so corners stay square, reinforcing the technical register.
