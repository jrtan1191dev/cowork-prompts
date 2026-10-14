# Legibility floors — the hard ground under every layout

These floors are shared by every layout, so they live here rather than inside the
layout reference: they bound the whole deck, not any one arrangement.

They are derived from **visual angle, not folk point sizes.** A point size means
nothing without a viewing distance — "use 24pt" is advice for a distance nobody
states, and "body must be 40px" is the same mistake wearing a different number.
The readable floor is the 0.2-degree critical print size, the smallest size at which
reading speed does not fall off (Legge & Bigelow, *Does Print Size Matter for
Reading?*, J Vis 2011). That is an *angle*, so a pixel floor has to be derived from
a declared distance rather than imported.

## The viewing profile is the input, not the floor

Distance is declared as a ratio of viewing distance to **screen height**, which is
the only resolution-independent form — the same ratio holds for a phone and for a
projection wall.

| Profile | D / screen height | Who it is |
| --- | --- | --- |
| `phone` | 2.5 | a held phone; the default for the 1080x1920 canvas |
| `screen` | 3.5 | a laptop, a monitor; the default for 1920x1080 |
| `room` | 6 | the back row of an ordinary meeting room |
| `hall` | 8 | the back of a large hall |

`typeFloor(role, { profile, orientation })` in `scripts/lib/deck.mjs` returns the
floor:

```
required read height px = tan(0.2deg) x (D / screen height) x canvas height px
floor                   = that height / the role's em fraction
```

The em fraction is **0.55 for mixed-case** text, because the critical print size is
expressed in x-height, and **0.73 for all-caps** roles, because cap-height is what
binds them. A 19px uppercase label is a larger angular target than 19px of sentence
text, so measuring both against one number would flag a role that is in fact
legible.

The resulting body-text floors:

| Profile | Mixed-case floor | All-caps floor |
| --- | --- | --- |
| `phone` | 17 | 13 |
| `screen` | **24** | 18 |
| `room` | 41 | 31 |
| `hall` | 55 | 41 |

**The `screen` floor is 24px and the shipped `card-text` is 24px.** That is not a
coincidence arranged after the fact — it is the measurement that resolves what had
looked like a contradiction between the cited floor and the token scale. The scale
was calibrated for a laptop, a monitor or a phone, and the derivation agrees with it
to the pixel. A test asserts the equality, so if either the scale or the derivation
moves, one of them is wrong and the suite says so.

## What the profiles make sayable

- **The default landscape deck clears every floor.** A check that fired on the
  default deck would be noise, and noise teaches people to ignore checks.
- **The same deck projected into a room does not clear them** — body at 28 against
  a floor of 41. That is a true and actionable statement about the deck, not a
  defect in the check: type sized for a monitor is unreadable from the back of a
  large room. Run the report at `profile: room` before presenting to one.
- **The portrait canvas is short by about 10%.** At its `phone` default, `card-text`
  resolves to 28 against a floor of 30 and the uppercase detail role to 22 against
  23. The cause is exact: holding the same angular size on a canvas 1.78x taller
  needs a portrait scale of ~1.25, and the shipped factor is 1.15. Recorded rather
  than silently corrected, because changing the portrait scale moves every portrait
  slide and would have to be re-checked against the overflow gate.

## Which roles are measured

Only roles a viewer **reads**: body, card text, card detail, stat label, pill.

Heading roles are excluded deliberately. A title is never near the reading floor;
what governs a title is the **hierarchy step** between roles (~1.5-2x, below).
Measuring a title against a reading floor would report a hierarchy problem as a
legibility one and point the author at the wrong fix.

`legibilityFloorReport({ profile, orientation, headingMultiplier, typeScale })`
resolves the effective size per role and returns every role below its floor. The
effective size mirrors `slideCss` exactly: the portrait canvas scales every role by
1.15, and the brand's clamped heading-dominance multiplier scales heading levels
only — which, since headings are not measured here, means a brand cannot change this
report at all. It is pure and dependency-free, so it is testable with no install and
no browser.

### This check WARNS; it is not an always-on gate

Consistent with the standing decision that **brand type bends rather than fails**
(`design-token.md`, and the "Brand type" decision in `SKILL.md`): a hard floor would
silently reverse that decision, and a brand nobody can edit would then make a valid
deck unbuildable. The report is a signal, not a build-breaker.

It is also invoked **on demand rather than wired into `validateStoryline`**, because
the profile is a fact about the room you are presenting in, and the source file does
not know it. Run it when the venue is known.

## Hierarchy step between roles

Roles must be **~1.5-2x apart** in size so the hierarchy is visible from the back of
the room, not merely on a monitor at desk distance. This is the same relationship
the type step inside `weight` enforces (≥1.2x to clear the just-noticeable
difference), read across roles instead of across card weights. Legge & Bigelow's
measured newspaper size steps corroborate the range independently.

## Contrast

Gate on **WCAG 2.2**, which is stable and computable:

| Text | Minimum | Prefer |
| --- | --- | --- |
| Body text | 4.5:1 | 7:1 |
| Large text (≥ the large-text threshold) and non-text (icons, rules, chart marks) | 3:1 | — |

Prefer **7:1 for body** because a projected room and a video codec both eat
contrast that the ratio does not model — thin antialiased strokes on a tinted card
lose more than the number predicts. `design-token.md` already sets two rows
(`card-text`, `stat-label`) stricter than WCAG's size rule allows for exactly this
reason, and `card-detail` (uppercase 19px 700 accent) is the single most common
place a brand palette fails.

**APCA is advisory only and is explicitly not a gate.** WCAG 3.0 is still a draft, so
APCA is non-normative; report it if useful, never fail a build on it.

Contrast is measured in the browser from computed styles, not from the token pairs
(`design-token.md`), so a wash such as a `color-mix` icon tint is caught because the
check reads what actually rendered.

## Measure (line length)

- Landscape: **~45 characters per line.**
- Portrait: **~30 characters per line.**

The consequence for authors: **a card that fits landscape can overflow portrait**,
because the same text at ~30 chars/line takes more lines. Portrait forces shorter
text, and the overflow gate will catch the difference as a hard failure — so a slide
declared in both orientations must fit the tighter one.

## Colour

- **Never colour alone.** Pair any colour cue with a label, a position, or an icon.
- **Emphasis must survive greyscale.** Carry it with luminance, not hue — hue dies
  in greyscale, in a colour-blind viewer's perception, and in a compressed codec.
- Use a tested colour-blind-safe palette: **Okabe-Ito** (the eight-colour
  qualitative set designed for deuteranopia/protanopia), **ColorBrewer** sequential
  and diverging ramps, or **Viridis** for continuous data. Do not hand-pick a
  red/green pair and hope.
- **Dark-theme pitfalls:** avoid pure black (`#000`) — it causes halation, where
  light text bleeds and smears on an emissive screen; avoid thin weights, which
  disappear against a dark field; keep the same luminance discipline as light
  themes rather than assuming dark hides low contrast.

## Typeface selection

Choose for **distance and for video compression**, not for a designer's monitor:

- Prefer humanist or grotesque sans-serifs with open apertures and generous
  x-height; they hold their shape at distance and survive downscaling.
- Avoid thin and hairline weights, tight tracking, and high-contrast (thick/thin)
  letterforms — the thin strokes are the first thing a codec throws away.
- The deck embeds a bundled variable font so glyphs and wrapping cannot vary per
  machine (`SKILL.md`, "Deck font"); the selection guidance applies when a brand
  supplies its own family.

## Caption-safe and platform keep-out bands

In the **video path**, content must stay clear of the burned caption band and the
platform's own chrome. Concrete figures per canvas (the platform figures are
**approximate** — the platforms move their UI):

| Canvas | Caption bottom margin | Keep content out of | Notes |
| --- | --- | --- | --- |
| 16:9 landscape | ~64px (~6%) | bottom ~10-15% | Large screen; captions sit just above the edge. |
| 1:1 square | ~140px | bottom band above the caption | Between the two. |
| 9:16 vertical | ~400px (~21%) | bottom third *(approximate)* | TikTok / Reels / Shorts UI chrome eats the bottom; captions ride higher. |
| 9:16 letterbox | inside the lower bar | — | The bar is empty, so captions occupy dead space and never cover content. |

The layouts most at risk are **anything anchoring its dominant element low** —
`stat-deepdive` with a low headline metric, and any layout whose primary card lands
near the bottom in portrait. In the video path such a layout must raise its dominant
element above the keep-out band. The exact caption geometry and the ASS resolution
mechanics live in `references/composition.md`.
