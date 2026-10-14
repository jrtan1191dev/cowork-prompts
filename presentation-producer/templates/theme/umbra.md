---
version: 1.0.0
name: Umbra
description: >
  A dark-first theme — near-black page, raised charcoal cards, light ink and a
  luminous teal accent. Authored as a single dark palette rather than as a mode
  toggle, since design.md has no light/dark duality.
colors:
  background: '#0B0F14'
  surface: '#151C24'
  surface-variant: '#1E2731'
  on-surface: '#EAF0F5'
  on-surface-variant: '#9FB0BF'
  outline: '#2C3742'
  # A luminous teal, bright enough to sit legibly on the dark card surface.
  # In `accent` so it drives --accent-1 only, leaving ink light.
  accent: '#39C6C0'
typography:
  body:
    fontFamily: 'Manrope, Inter, sans-serif'
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.55
  h1:
    fontSize: 46px
    fontWeight: 700
    letterSpacing: '-0.02em'
  h3:
    fontSize: 22px
    fontWeight: 600
rounded: 16px
omitted:
  - spacing
---

# Umbra

A dark-first theme built as its own conformant palette, not a dark mode of the
default. Distinct from the light slate-and-emerald default, from Terracotta's
warm paper, from Signal's white monochrome and from Civic's blue-grey page.

## Brand & Style

Low-light and calm. A near-black page with raised charcoal cards, light-grey
ink, and a single luminous teal accent for detail labels, rules and connectors.
The teal is the only bright element, so it reads as focus rather than decoration
against the dark field.

## Colors

Light ink is named `on-surface`, resolving to `--primary` — inverted from the
light presets but through the same mapping chain, since design.md carries one
palette and the built-in dark values are never reached when the brand supplies
its own. The teal sits in `accent`, driving `--accent-1` only. On a dark deck
the `.pill` inversion (dark ink on light background) is the pairing to watch;
here light ink on the page gives 16.73:1.

Computed WCAG ratios (all pass):
- `.title` / `.hero-title` light ink on page — 16.73:1 (min 3.0)
- `.body` muted on page — 8.64:1 (min 3.0)
- `.card-title` / `.stat-value` light ink on card — 14.94:1 (min 3.0)
- `.card-text` / `.stat-label` muted on card — 7.71:1 (min 4.5)
- `.card-detail` teal on card — 8.18:1 (min 4.5)
- `.pill` page on light ink — 16.73:1 (min 4.5)

## Typography

Manrope, a Fontsource-published variable family (`@fontsource-variable/manrope`),
whose slightly geometric forms hold up at small sizes on a dark ground. A 16px
body against a 46px h1 is a ~2.88x ratio, giving the heading-dominance
multiplier a real signal.

## Elevation & Depth

Carried by the charcoal cards lifting off the near-black page and by a 16px
corner radius, which the layouts honour via `--radius`. Shadow is left to the
built-in, as the format cannot express elevation as a token.
