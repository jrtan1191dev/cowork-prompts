---
version: 1.0.0
name: Civic
description: >
  A cool, institutional palette — deep navy ink on pale blue-grey, with a
  muted teal-blue accent. Reads as public-sector and considered rather than
  commercial, and is plainly distinct from the warm default and its siblings.
colors:
  background: '#EEF2F6'
  surface: '#FFFFFF'
  surface-variant: '#E1E8F0'
  on-surface: '#132A43'
  on-surface-variant: '#4A5B70'
  outline: '#C7D3E0'
  # A restrained teal-blue for accents — institutional, not vivid. Placed in
  # `accent` so it drives --accent-1, never the headline ink.
  accent: '#155E75'
typography:
  body:
    fontFamily: 'Source Sans 3, Inter, sans-serif'
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.6
  h1:
    fontSize: 42px
    fontWeight: 700
    letterSpacing: '-0.01em'
  h3:
    fontSize: 22px
    fontWeight: 600
omitted:
  - spacing
---

# Civic

A cool institutional theme for public-sector and reference material. Distinct
from the slate-and-emerald default (cooler and bluer), from Terracotta (which
is warm and serif), and from the Signal and Umbra siblings.

## Brand & Style

Measured and impersonal. A pale blue-grey page sets white cards apart cleanly,
deep navy carries the ink, and a single muted teal-blue accent handles detail
labels, rules and connectors. The palette avoids saturation on purpose — the
register is trustworthy, not promotional.

## Colors

Navy ink is named `on-surface`, resolving to `--primary`. The teal-blue sits in
`accent`, driving `--accent-1` only, so headlines stay navy rather than
adopting the accent. The accent is dark enough (`#155E75`) to clear 4.5:1 on
white — the `.card-detail` row that a lighter institutional blue would fail.

Computed WCAG ratios (all pass):
- `.title` / `.hero-title` navy on page — 12.96:1 (min 3.0)
- `.body` muted on page — 6.18:1 (min 3.0)
- `.card-title` / `.stat-value` navy on card — 14.58:1 (min 3.0)
- `.card-text` / `.stat-label` muted on card — 6.95:1 (min 4.5)
- `.card-detail` teal-blue on card — 7.27:1 (min 4.5)
- `.pill` page on navy — 12.96:1 (min 4.5)

## Typography

Source Sans 3, a Fontsource-published variable family
(`@fontsource-variable/source-sans-3`), a neutral humanist sans suited to
dense official copy. A 17px body against a 42px h1 is a ~2.47x ratio, giving
the heading-dominance multiplier a genuine, restrained signal.

## Elevation & Depth

Shallow. Depth comes from the white-card-on-blue-grey separation and hairline
outlines, not shadow — which the format cannot express as tokens anyway.
