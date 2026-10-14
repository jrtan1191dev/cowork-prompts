---
version: 1.0.0
name: Terracotta
description: >
  Warm, earthy and deliberately unlike the bundled slate-and-emerald default, so
  a rebranded render is obvious at a glance rather than a subtle tint shift.
colors:
  background: '#FBF7F4'
  surface: '#FFFFFF'
  surface-variant: '#F6EDE7'
  on-surface: '#2B1B14'
  on-surface-variant: '#6B584E'
  tertiary: '#B4451F'
  outline: '#E7D8CE'
  # Exercises {path.to.token} indirection: brand follows tertiary.
  brand: '{colors.tertiary}'
typography:
  body:
    fontFamily: 'Source Serif 4, Georgia, serif'
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  h1:
    fontSize: 44px
    fontWeight: 700
    letterSpacing: '-0.02em'
  h3:
    fontSize: 22px
    fontWeight: 600
  display:
    fontSize: 88px
rounded: 20px
components:
  button-primary:
    backgroundColor: '{colors.tertiary}'
    color: '#FFFFFF'
omitted:
  - spacing
---

# Terracotta

A fixture brand used by the test suite and by the end-to-end smoke run. It is
intentionally conformant to design.md rather than to this deck, so it also
serves as proof that a third-party brand file works untouched.

## Brand & Style

Warm, printed, editorial. Serif body copy, generous leading, one saturated
earth tone carrying every interactive and emphatic accent.

## Colors

`tertiary` is the sole driver for emphasis, following design.md's own worked
example. Ink is named `on-surface`, so it resolves to the deck's `--primary`
without the shadcn naming collision.

## Typography

A 16px serif base with a 44px h1 — a 2.75x ratio, flatter than the deck's
default hierarchy, so the type-ratio clamp has something real to act on.

## Elevation & Depth

Shallow. Elevation is carried by the warm surface separation rather than by
shadow, which the format cannot express as tokens anyway.
