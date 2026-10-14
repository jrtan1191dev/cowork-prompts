# Evidence on slides, and the legibility/accessibility thresholds that bound every layout

Track: **Presenting evidence (numbers, data, comparisons)** and the **hard legibility
and accessibility thresholds** that every layout must clear.

The central question this track serves: *information weight should map onto layout, so
the layout directs the viewer to the right thing*. For evidence, "weight" is literal —
a number, a delta, a comparison — and the layout's job is to make the one figure that
carries the argument the first thing the eye lands on, whether the viewer is following
a narration or reading the slide alone. Part B then bounds that: no amount of good
composition survives type that is too small to read or contrast too low to see.

Every numeric claim carries a source URL. Where I could not verify something from a
primary source, it is flagged **[ASSUMPTION]**. Where sources conflict, both are
reported.

A note on how this maps to the skill. The current content model is **cards + one
`stat` slot**, bullet lists forbidden, ten layouts, text overflow a hard pixel-measured
build failure, and no per-slide SVG (the reason `funnel`/`map`/`quadrant` were rejected).
Several findings below (annotated charts, honest big-numbers, tables, non-text contrast
for any chart the pipeline ever renders) point at capabilities the current model does
not have. Those are called out as **proposed changes** rather than smoothed over, per
the brief.

---

## PART A — Evidence and data on slides

### A0. The one idea that unifies Part A: a presentation chart is not an analytical chart

Every author in this space converges on the same distinction, and it is the hinge for
the whole track. An analytical (exploratory) chart is a tool the *author* uses to find
what is true; it can be dense, unlabelled, and read slowly. A presentation
(explanatory) chart is a claim the *author has already reached* and is now handing to an
audience who will look at it for seconds. The FT frames the entire Visual Vocabulary as
"not an attempt to teach everyone how to make charts, but how to recognise the
opportunities to use them effectively **alongside words**"
(https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md).
Knaflic frames the same move as: decide the *one* thing the audience should take away,
then use preattentive attributes to push everything else back
(https://storytellingwithdata.com/blog/two-tips-for-better-graphs).

Consequence for a deck generator: the unit is not "a chart" but "a chart **plus its
conclusion**". A pipeline that can place a chart but cannot place its headline
conclusion and one annotation has built the analytical tool, not the explanatory one.

---

### A1. Message-type → chart-type mapping (consolidated)

Four primary/authoritative frameworks were consulted. They agree far more than they
differ; the differences are in granularity and vocabulary, not in substance.

**Abela's *Chart Suggestions — A Thought-Starter* (2009).** Starts from the question
"What would you like to show?" and routes to **four** intents: **Comparison,
Composition, Distribution, Relationship**. Abela's own observation, reported by
Sandberg: most real questions are Comparison or Composition; bar and line and their
variants cover most cases; "When a high degree of detail is required, the data table is
generally used."
(https://datavizblog.com/2023/03/26/choosing-the-right-chart-when-creating-a-data-visualization-part-1-of-a-series/;
origin FlowingData https://flowingdata.com/2009/01/15/flow-chart-shows-you-what-chart-to-use/).

**FT Visual Vocabulary (Financial Times Visual Journalism Team).** Refines the intent
list to **nine** categories, each with a one-line "when to use". Verbatim intents from
the source
(https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md):

| FT category | When to use (FT's own words, condensed) | Presentation-safe forms |
| --- | --- | --- |
| **Deviation** | variation +/- from a fixed reference (zero, target, average); sentiment | diverging bar, diverging stacked bar, surplus/deficit line |
| **Correlation** | relationship between 2+ variables (readers will assume causation unless told) | scatterplot, bubble, connected scatterplot, line+column |
| **Ranking** | position in an ordered list matters more than the value | ordered bar/column, dot-strip, lollipop, slope |
| **Distribution** | values and how often they occur; the "shape"/skew | histogram, boxplot, population pyramid, dot plot |
| **Change over time** | changing trends; choosing the time window matters | line, column, area (with care), slope, calendar heatmap |
| **Part-to-whole** | one entity broken into components (if only size matters, use magnitude) | stacked/proportional bar, pie (with caveats), donut, waterfall |
| **Magnitude** | size comparisons, relative or absolute; usually counted numbers | column, bar, paired bar/column, lollipop |
| **Spatial** | only when precise location/geographic pattern matters most | choropleth (rates not totals), proportional-symbol map, cartogram |
| **Flow** | volume/intensity of movement between states | Sankey, chord, network, waterfall |

**Zelazny, *Say It With Charts*.** Zelazny's contribution — reported consistently but I
could **not** verify the exact wording from a primary scan **[ASSUMPTION on exact
phrasing]** — is the strongest statement of the presentation-first idea: you start from
the **message** (the sentence you want to say), not the data, and the *comparison in the
message* (component, item, time-series, frequency, correlation) dictates the chart. His
five comparison types map cleanly onto Abela/FT: component→part-to-whole/pie;
item→ranking/bar; time-series→change-over-time/line-column; frequency→distribution;
correlation→relationship/scatter.

**Knaflic, *Storytelling with Data*.** Deliberately narrows the working set to a short
list she will actually recommend — lines, bars (vertical/horizontal/stacked), slopegraph,
the single big number, and the table — and treats pies and 3-D and secondary axes as
things to avoid
(https://storytellingwithdata.com/blog and book, ch. "choosing an effective visual").

**Consolidated mapping (the thing to encode).** Message → intent → default form,
narrowed to what reads in seconds:

| The sentence you want to say | Intent | Default presentation form | Notes for a deck |
| --- | --- | --- | --- |
| "X is bigger/smaller than Y" | Magnitude / Comparison | horizontal bar (sorted) | bars **must** baseline at 0 (FT, Magnitude) |
| "A ranks above B above C" | Ranking | ordered bar or dot/lollipop | sort by value, not alphabet |
| "It rose/fell over time" | Change over time | line (one emphasised series) | column only for a single series |
| "It's above/below target" | Deviation | diverging bar from the reference line | reference line is the anchor |
| "It splits into these parts" | Part-to-whole | stacked bar; pie only if ≤3 slices | pie is hard to compare (FT + Kosara) |
| "These two move together" | Correlation | scatter (annotate the outlier) | say if you don't mean causation |
| "The distribution is skewed" | Distribution | histogram / population pyramid | rarely a good glance-slide |
| "One number is the story" | (headline metric) | **big number + context** (see A3) | this is the `stat` slot |
| "Compare on many attributes" | Comparison at detail | **table** (see A5) | when precision beats shape |

**Where they conflict.** Pie charts are the live disagreement. FT lists pie under
part-to-whole but immediately warns "it's difficult to accurately compare the size of
the segments" and links Kosara's and Few's critiques
(https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md;
Few "Save the Pies for Dessert" https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf).
Knaflic effectively bans them. The defensible synthesis: a pie is acceptable **only** for
a single part-of-whole with ≤3 slices where "roughly this fraction" is the whole
message; anything requiring segment-to-segment comparison should be a bar.

---

### A2. The annotated chart is the presentation default

This is the single most important Part-A finding for a narrated/standalone deck, and it
is where the tools agree most sharply.

**Carry the conclusion as text on the chart.** Knaflic's practice is to title the chart
with the *takeaway sentence*, not the *topic*: not "Revenue by quarter" but "Revenue
fell 12% after the Q3 price change". The chart then merely *supports* a claim the viewer
has already read (https://storytellingwithdata.com/blog/annotate-with-text). For a
narrated video this is doubly load-bearing: the narration says the sentence, the slide
shows the same sentence as the chart title, and the two reinforce rather than compete.

**Direct-label; kill the legend.** Knaflic, repeatedly and from primary posts: label the
series directly at the end of the line and push axis furniture to grey, because a legend
forces the eye to "go back and forth between a legend and the data"
(https://cole-knaflic.squarespace.com/blog/2012/06/drawing-attention-with-data-labels;
https://www.storytellingwithdata.com/blog/2017/8/2/axis-vs-data-labels). Data labels are
"added marks" — preattentive cues that say *this* number matters.

**Direct attention with preattentive attributes: highlight one, grey the rest.** The
mechanism is *preattentive processing* — colour, size, position are picked up by iconic
memory before conscious attention
(https://cole-knaflic.squarespace.com/blog/2011/10/google-example-preattentive-attributes).
The technique: one series in a saturated brand colour, every other series in a single
neutral grey. Knaflic's self-test — "look away, look back, note where your eyes land
first" — is the acceptance test
(https://storytellingwithdata.com/blog/whereareyoureyesdrawn). FT's own guidance echoes
it: "Don't be afraid to highlight the points of interest" (Ranking) and "make sure to
annotate any patterns the reader should see" (Spatial/dot-density) (FT README, ibid.).

**Why this is a layout finding, not a chart-styling aside.** It means an evidence slide
has a *fixed information hierarchy* the layout must honour: (1) takeaway sentence
[heaviest], (2) the emphasised mark/number, (3) the supporting chart body, (4) axis and
source furniture [lightest]. That is exactly the weight-to-layout mapping the brief asks
for, applied to charts. **Proposed:** any chart-bearing slide should have a title slot
that expects a *sentence* (the conclusion) and treat a topic-only title as a warning,
mirroring how the skill already warns on an omitted `layout:`.

---

### A3. Big-number / headline-metric design

This maps directly to the existing `stat` slot and `stat-deepdive` layout, so it is the
most immediately actionable section.

**When a single big figure is the right choice.** When the entire message is one number
and the audience needs to *remember* it, not analyse it. Knaflic treats the single bold
number as a first-class visual, reserved for "when you have just a number or two to
share" — the point being emotional/mnemonic weight, achieved by size and by removing
everything that competes with it (Knaflic, *Storytelling with Data*, "big number"
discussion, summarised at https://storytellingwithdata.com/blog).

**How to give it context without diluting it.** A bare number is not evidence; it is
trivia. The honest minimum context is: **baseline** (from what?), **comparator**
(target, prior period, or peer), **direction+magnitude of change** (the delta), and the
**time period / unit**. The dashboard-design canon calls this giving a KPI its
"comparative context" — Few's work on dashboards argues a number without a point of
comparison cannot be judged good or bad (Stephen Few, *Information Dashboard Design*;
Perceptual Edge, https://www.perceptualedge.com). **[ASSUMPTION: I am citing Few's
general dashboard principle from the Perceptual Edge body of work rather than a single
verified page.]**

The design discipline is that the context must be *subordinate* — smaller, greyer, below
or beside — so it informs without competing. This is the same preattentive move as A2:
the absolute figure gets the size, the context gets the neutral treatment.

**Weighting the delta against the absolute.** Which is "the number" depends on the
message: for "we grew", the **delta** (+18%) is the hero and the absolute is context;
for "we crossed a threshold", the **absolute** ($1.0M ARR) is the hero and the delta is
context. The layout must let *either* be the dominant slot. The current single `stat`
slot cannot express "hero delta + subordinate absolute" vs the reverse. **Proposed:** the
`stat` model should carry an explicit primary/secondary pair (value + comparator +
delta + period), and the layout should size the one marked primary.

**Honest-scaling issues that make a metric misleading.** These are checkable and belong
in the pipeline as warnings:
- **Truncated bar axes.** Bars encode magnitude by length, so a bar chart axis **must**
  start at zero — FT states it flatly for Magnitude ("Must always start at 0 on the
  axis") (FT README). Line charts are the contested exception: FT links both "does the
  axis have to start at zero" (ONS) and Vox's "it's OK not to start your y-axis at zero",
  i.e. for lines a non-zero baseline can be legitimate but must be signalled (FT README,
  Change-over-time links). **Report the conflict rather than banning either.**
- **Percentages without a base.** "+200%" off a base of 3 is 6. A big-number slide that
  shows a percentage must be able to show n.
- **Cherry-picked periods.** A delta is only honest against a *representative* window;
  the layout should have a place for the period so the viewer can judge it.
- **Ratio/area distortion.** If a metric is shown as a scaled icon or circle, area (not
  radius) must encode the value or the eye over-reads it (FT proportional-symbol notes).

---

### A4. Comparison structures, and when a comparison becomes a table

The skill already has `comparison` (exactly 2 cards) as its only two-card layout. The
evidence bounds how far that can stretch.

**The discipline of an honest comparison** (before/after, us/them, A/B): **same axis,
same scale, same time period, same definition, no strawman.** FT's causation caveat
under Correlation is the general warning — viewers infer more than you showed unless you
constrain it (FT README, Correlation). The specific failure modes: comparing a cherry
period against a full period; putting two series on two differently-scaled axes (FT links
multiple "be careful with dual-axis" critiques); or comparing your best case against a
competitor's worst.

**How many alternatives before it stops being a comparison.** The perceptual limit is
not arbitrary. Two options is a *contrast* (the eye compares directly). Three is still a
comparison but the eye now scans. **Four or more parallel options with multiple
attributes each is a matrix, and a matrix is a table** — at that point you are asking the
viewer to read cells, not perceive a shape, which is Abela's own trigger ("When a high
degree of detail is required, the data table is generally used", A1). Practical rule:
**≤3 alternatives → cards/columns; ≥4 alternatives, or any number compared on ≥3
attributes → table.** **[ASSUMPTION: the exact "3" cutover is a synthesis of Abela's
"detail → table" rule and Miller-style span-of-attention lore, not a single measured
threshold.]**

**When a table is genuinely the right answer** (A5 expands): when the audience needs to
look up a *specific* value, when precision matters more than shape, and when the
comparison is across several attributes at once. Knaflic explicitly rehabilitates the
table for these cases rather than treating it as a failure.

**Proposed:** `comparison` at 2 is correct and should stay capped at 2 for the
direct-contrast case. A genuine 3-option comparison is served by `tiled`/`spotlight`
already. The real gap is the **table** (A5) — the skill currently has no honest home for
"4+ options × several attributes", and forcing it into cards is exactly the reasoning
error the sources warn against.

---

### A5. Tables on slides

**When a table beats cards.** When the cell *values* are the message. Cards encode a
short label + a bit of prose and are read as gestalt tiles; a table encodes a grid of
values read by row/column lookup. If the viewer's question is "what is the value at
(row, column)?" a table wins; if it is "what's the overall shape?" a chart or cards win.
Knaflic's rule of thumb: use a table when the audience will *interact with specific
values* (look them up, compare a particular pair), and note that in a **live/read**
setting the table lets each reader find their own row — a property a chart loses
(Knaflic, *Storytelling with Data*, "tables" section, summarised at
https://storytellingwithdata.com/blog).

**Maximum rows/columns for a *glanced* table.** No single vision study gives a hard cap,
so this is bounded by two things I *can* source and one I flag:
- Legge & Bigelow give the reading-speed penalty for small type (A7): the more rows you
  add, the smaller each row must be to fit 1080px of height, and below the critical print
  size reading slows sharply
  (https://pmc.ncbi.nlm.nih.gov/articles/PMC3428264/). So the *row* cap is really a
  *type-size* cap: at the body minimums derived in B7, a 1920×1080 slide with title +
  source furniture leaves room for roughly **6–8 body rows** before the row text drops
  under the fluent range. **[ASSUMPTION: the 6–8 figure is derived from the B7 minimums
  and a ~700px content band, not measured on real decks.]**
- Columns are bounded by measure (B8): each column is its own text block and needs
  legible width; **4–5 columns** is the practical ceiling on a 1920px canvas, fewer in
  portrait 1080px.
- Conflict/caveat: dashboard-design sources (Few) tolerate denser tables because those
  are *read at a desk*, not glanced in a room or a video — do not import desk-density
  tables onto a slide.

**How to weight a table's most important cell.** Same preattentive logic as A2: the hero
cell gets colour/weight/a single-cell fill; all other cells stay neutral; column headers
are grey and small; the row that matters can be given a subtle background band. A table
is not exempt from the weight-to-layout rule — one cell should still win the eye.

**Proposed:** add a `table` layout (rows × columns, a marked hero cell, small grey
headers), reflowing in portrait by dropping to the 2–3 most important columns or
transposing. This is materially different from the rejected `metric-row` (which was
rejected because the model carries one stat, not a list) — a table is a *grid of values
with lookup semantics*, which no current layout provides, and it is the honest
destination for the "4+ options" case A4 pushes out of `comparison`.

---

## PART B — Legibility and accessibility thresholds, as checkable numbers

These are the hard floor. They bound every layout regardless of composition, and most
are machine-checkable at build time — which matters because the pipeline already fails
the build on pixel-measured overflow, so it has precedent for hard legibility gates.

### B6. Contrast: WCAG 2.2 requirements, and where APCA stands

**1.4.3 Contrast (Minimum), Level AA** — text and images of text must have a contrast
ratio of at least **4.5:1**, except **large-scale text** which needs **3:1**. Large-scale
is defined as **≥18pt, or ≥14pt bold** (equivalently ≈**24px** and ≈**18.5px**, since the
spec fixes **1pt = 1.333px**). The ratios are thresholds — do **not** round (4.499:1
fails)
(https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

The rationale is quantitative and worth keeping because it justifies the numbers: 3:1 is
the ISO-9241-3 / ANSI-HFES-100-1988 minimum for *normal* vision; 4.5:1 accounts for
~20/40 acuity (a contrast-sensitivity loss factor of ~1.5, so 3 × 1.5); 7:1 accounts for
~20/80 (ibid.). This is why large text gets 3:1 — larger, thicker strokes are readable at
lower contrast.

**1.4.6 Contrast (Enhanced), Level AAA** — **7:1** for normal text, **4.5:1** for large
text (same source; the 7:1 corresponds to 20/80 vision). A deck that wants to be robust
in a bright room or after video compression should target **AAA/7:1 for body text**, not
merely AA — the room and the codec both eat contrast.

**1.4.11 Non-text Contrast, Level AA** — **3:1** against adjacent colours for (a) visual
information needed to identify UI components and their states, and (b) **"parts of
graphics required to understand the content"**
(https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). This is the one
that governs **charts**: the WCAG worked example is explicit that "a graph uses a light
background and ensures that the colors for each line have a 3:1 contrast ratio against
the background", and that pie slices are graphical objects needing 3:1 *unless* labels +
values convey the same information (ibid., Pie Charts and Infographics examples). So a
chart's bars/lines/slices must clear 3:1 vs background; the exception is precisely the
annotated/directly-labelled chart from A2 — if the value is printed as text, the shape no
longer has to carry understanding alone. A2 and B6 reinforce each other.

**What applies to text rendered into an image or video.** WCAG is explicit: the text
contrast rules **apply to images of text** (1.4.5), and evaluation uses the *authored*
foreground/background colours from the markup, not the anti-aliased pixels on screen —
because thin/unusual fonts can render fainter than specified and nominally-passing text
can be effectively lower-contrast (1.4.3 Understanding, notes on anti-aliasing). Two
implications for a rasterising/video pipeline: (1) compute contrast from the CSS colours
*before* rasterisation — this is fully automatable and belongs in the build; (2) prefer
fonts with real stroke weight and add margin above the threshold, because compression
and projection erode it (see B10).

**What an automated checker can verify** (build-time, offline, deterministic — fits the
skill's constraints): text-vs-background ratio for every text token against 4.5:1
(body) / 3:1 (large) or the stricter 7:1; and, if the pipeline ever emits real charts,
each graphical mark vs its background against 3:1. What a checker **cannot** verify:
whether a low-contrast element was "decorative" (exempt) or meaningful — that is a human
judgement the model must make while authoring.

**APCA's current standing (report honestly).** APCA (Advanced Perceptual Contrast
Algorithm) is a *perceptual* model designed to fix a real WCAG-2 flaw: the L1/L2 ratio
can score some high-contrast pairs lower than some lower-contrast pairs because it does
not match perception, and it handles dark-mode poorly
(https://github.com/Myndex/SAPC-APCA/blob/master/documentation/WhyAPCA.md;
https://data.europa.eu/apps/data-visualisation-guide/colour-contrast). **Status: not
normative.** It is being explored for **WCAG 3.0 ("Silver")**, which as of the current
W3C Working Draft is explicitly *informative, not expected to become a Recommendation in
its present form*, with a Bronze/Silver/Gold model still in flux
(https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/;
https://w3c.github.io/silver/explainer/). **Recommendation for the skill:** gate the
build on **WCAG 2.2 ratios** (stable, normative, trivially computable) and *optionally*
report APCA as advisory, since it better predicts real legibility especially on dark
themes (B9) — but do not fail a build on APCA while it is non-normative.

---

### B7. Minimum legible type size, derived from vision science (not "use 24pt")

The folk rule "use ≥24pt" has no vision-science content because a point size means
nothing without a viewing distance. The correct variable is **visual angle** — the size
of the letter on the retina — because that is what the visual system actually resolves.

**The governing numbers, from Legge & Bigelow, *Does Print Size Matter for Reading?*
(J Vis 2011)** (https://pmc.ncbi.nlm.nih.gov/articles/PMC3428264/):
- **Fluent range:** text is read at *maximum speed* over a 10× range of angular
  x-height, **~0.2° to ~2°**.
- **Critical Print Size (CPS):** the smallest x-height that still gives max speed;
  **consensus 0.2° x-height** for normal vision (below it, reading speed falls sharply).
- **Conversion (their Eq.):** `Angular size (°) = 57.3 × physical size / viewing
  distance` (same units). Equivalently the paper's rule of thumb at a 40cm reading
  distance: `VA° = point size / 20`.
- **x-height vs body size:** x-height averages ~**0.46–0.52** of body/font-size for
  screen faces (their Table 5; digital screen fonts mean 0.52). So to hit a target
  *x-height* angle you divide by the x-height fraction to get the font-size.

**Deriving concrete pixel minimums.** The angle depends on distance, which differs by
scenario, so I derive both cases the brief asks for. Method: pick the scenario's viewing
distance and the physical screen size that a 1920px (or 1080px) canvas maps to, convert
the CPS x-height (0.2°, the absolute floor) and a comfortable body target (~0.3°, mid
fluent range) to a physical x-height, then to px, then to font-size via the x-height
fraction (~0.5).

*Case 1 — projected in a room.* Take a 3m-wide projected image viewed from ~6m (a
typical mid-room seat) **[ASSUMPTION: representative room geometry; real rooms vary
widely]**. A 1920px-wide canvas → 3000mm, so **1px ≈ 1.5625mm** on the wall. Physical
x-height for 0.2° at 6000mm: `mm = (0.2/57.3) × 6000 = 20.9mm` → **≈13.4px x-height** →
at x-height fraction 0.5, **≈27px font-size** as the absolute floor; the comfortable
0.3° target → **≈40px font-size**. The back row (say 12m) doubles those: floor ~54px,
comfortable ~80px. This is why room decks use very large type — and why "24pt" (≈32px)
is marginal even mid-room and fails at the back.

*Case 2 — watched on a phone.* A 1080×1920 portrait video on a ~6.5" phone (~150mm tall
screen showing the 1920px dimension) viewed at ~35cm (350mm) **[ASSUMPTION: typical
handheld video distance; Shieh & Lee report ~36cm for handheld/paper, cited within
Legge & Bigelow]**. The 1920px maps to ~150mm, so **1px ≈ 0.078mm**. Physical x-height
for 0.2° at 350mm: `mm = (0.2/57.3) × 350 = 1.22mm` → **≈15.6px x-height** → **≈31px
font-size** floor on the 1080×1920 canvas; comfortable 0.3° → **≈47px font-size**.

**Consolidated minimum-size table** (px on the *canvas*, not the device; floor = 0.2°
CPS, comfortable = 0.3°). The room case dominates, so a deck that must work *both*
projected and on a phone should use the larger (room) numbers:

| Role | Angular target | 1920×1080 (room, ~6m) floor / comfortable | 1080×1920 (phone, ~35cm) floor / comfortable | Design recommendation (canvas px) |
| --- | --- | --- | --- | --- |
| Body / card text | ≥ CPS 0.2°, aim 0.3° | 27 / 40 | 31 / 47 | **≥ 40px**, prefer 44–48px |
| Caption / source | ~0.2° (skim-only) | 27 / — | 31 / — | **≥ 30px**, never below 27px |
| Card title | ~0.35–0.4° | ~47 / 54 | ~55 / 63 | **≥ 56px** |
| Slide title | ≥ 0.6° (headline) | ~80+ | ~94+ | **≥ 90px** |

These agree with the observed *ratios* Legge & Bigelow measured in real publications:
newspaper text→subhead→small-headline→large-headline steps are ~**2× each** (Table 3,
ibid.). That is independent evidence for a **type scale with ~1.5–2× steps between
roles** — which is also exactly what makes the weight hierarchy *visible*: title,
card-title, body, caption should be perceptibly different sizes, not fine gradations.

**Caveats worth stating:** these floors are for *normal* vision; low-vision viewers need
more (the same reason WCAG uses 4.5:1 not 3:1). And CPS is a *max-speed* floor, not a
*can-be-seen-at-all* floor — a very short headline can go slightly under CPS because a
few words read slowly is fine (Legge & Bigelow explain newspaper headlines and web
skim-text sometimes sit just below CPS for exactly this reason).

---

### B8. Line length / measure

**The prose evidence.** The classic typographic target for continuous reading is
**~45–75 characters per line, ~66 ideal** for single-column text (Bringhurst, *The
Elements of Typographic Style*) **[ASSUMPTION: Bringhurst's 45–75/66 figures are cited
from the widely-reported primary text but not verified against the page in this
session]**. Below ~45 the eye makes too many return sweeps; above ~75 it loses the start
of the next line.

**Why a slide is different.** A slide card is *glanced*, not read as prose — it is closer
to a headline or a label. Legge & Bigelow's crowding/visual-span work explains the
mechanism: the visual span (letters recognised per fixation) is ~**9–10 characters** and
crowding, not letter size per se, limits it
(https://pmc.ncbi.nlm.nih.gov/articles/PMC3428264/, "Visual Span and Crowding"). For a
glance, you want text that can be taken in **few fixations** — i.e. *short*, well under
the prose maximum.

**Implied maximum card width.** For a glanced card, target **~30–45 characters per
line** (a headline measure, not a prose measure) so most cards resolve in a handful of
fixations. Converting to px at the body minimums from B7 (mean lower-case width ≈
x-height, per Legge & Bigelow's 0.94 correlation and ~1.0 width-to-x-height ratio):
- 1920×1080, body ≈44px font → x-height ≈22px ≈ mean char width → **45 chars ≈ 990px**
  max text column; comfortable card text column **~600–900px**.
- 1080×1920 portrait, body ≈44px → **45 chars ≈ 990px** exceeds the 1080 width minus
  margins, so portrait cards should cap nearer **~30 chars (~660px)** or the text wraps
  awkwardly. This is a concrete reflow constraint: **portrait forces shorter card text
  than landscape**, and a card that fits landscape can overflow portrait — which is
  exactly the pixel-overflow failure the build already guards. Encoding a char-count
  soft-limit per canvas would catch it *before* render.

**Proposed:** add a per-canvas character-count advisory (warn ~>45 landscape, ~>30
portrait per card line) as a cheaper early signal than full pixel measurement.

---

### B9. Colour

**1.4.1 Use of Colour (Level AA): never colour-alone.** Information must not be conveyed
by colour as the *only* visual means
(https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html cross-refs
Use-of-Color). For a deck: before/after, us/them, pass/fail must *also* differ by
label, position, icon, or pattern — not just red/green. ~8% of men have a colour-vision
deficiency; red/green is the common confusion.

**Colour-blind-safe palettes (tested, cited).**
- **Okabe–Ito Color Universal Design palette** — the most-cited CVD-safe qualitative
  palette, 8 colours chosen to stay distinguishable under protan/deutan/tritan vision.
  Hex: `#000000` black, `#E69F00` orange, `#56B4E9` sky blue, `#009E73` bluish green,
  `#F0E442` yellow, `#0072B2` blue, `#D55E00` vermilion, `#CC79A7` reddish purple (plus
  `#999999` grey in the extended set). Origin: Okabe & Ito, *Color Universal Design*
  (2008) (https://jfly.uni-koeln.de/color/ per the CUD project; palette + hex confirmed
  at https://siegal.bio.nyu.edu/color-palette/ and base-R `palette.colors("Okabe-Ito")`).
  This is the right **categorical** palette for distinguishing cards / series / states.
- **ColorBrewer** (Cynthia Brewer) — the standard for *sequential* and *diverging*
  scales (e.g. deviation charts), with explicit "colorblind safe" filtering
  (https://colorbrewer2.org). Use diverging schemes (e.g. RdBu, BrBG) for
  above/below-reference data (FT "Deviation").

**Dark-theme issues (well-attested).**
- **Pure black (#000) backgrounds cause halation** — bright text on pure black smears/
  vibrates for many readers, especially with astigmatism; use a dark grey (e.g. #121212-
  ish) instead of #000. This is the documented reason APCA and dark-mode guidance avoid
  pure black (https://github.com/Myndex/SAPC-APCA/blob/master/documentation/WhyAPCA.md,
  dark-mode discussion). **[ASSUMPTION: halation is well-documented in dark-mode design
  literature; the specific #121212 value is a common convention, not a measured
  threshold.]**
- **Thin weights fail on dark.** Light text on dark appears to "bloom", eroding thin
  strokes; on dark themes prefer **heavier weights** and avoid hairline fonts (WCAG
  1.4.3 anti-aliasing note about thin fonts rendering fainter applies doubly on dark).
- **WCAG's ratio is symmetric but perception is not** — this is APCA's core complaint;
  a pair that passes 4.5:1 on light may look weaker inverted on dark. Practically: give
  dark-theme text extra contrast margin.

**Keeping the dominant element distinguishable in greyscale.** The A2 "highlight one,
grey the rest" technique must survive desaturation, or it fails 1.4.1. Test: convert the
slide to greyscale; the hero element must still stand out by **luminance** (not just
hue). Okabe–Ito is partly designed for this — its colours differ in luminance, not only
hue. So the honest emphasis is *luminance + hue + one more channel* (size/position/
label), never hue alone.

---

### B10. Typography for legibility at distance and small size

The vision-science reason some good fonts fail on a projector or in compressed video:
- **x-height fraction.** Larger x-height = larger effective letters at a given font-size,
  and Legge & Bigelow report screen legibility tracks x-height fraction: Verdana (0.55) >
  Georgia (0.48) > Arial (0.52 but…) > Times New Roman (0.45) in threshold legibility
  (Sheedy et al. 2005, reported in
  https://pmc.ncbi.nlm.nih.gov/articles/PMC3428264/). **Choose faces with x-height
  fraction ≥ ~0.5 for slides.** This also feeds B7: a low-x-height face needs a bigger
  font-size to hit the same angular x-height.
- **Counters and apertures.** Open counters (the enclosed/partly-enclosed white spaces)
  survive blur and small size; closed/tight counters fill in when the image is
  compressed or projected. This is the spatial-frequency argument in Legge & Bigelow:
  small/blurred letters are recognised by *low* spatial frequencies (coarse features), so
  fine detail is lost first (ibid., "Spatial-Frequency Representation").
- **Weight contrast (thick/thin stroke modulation).** High-contrast faces (Didone
  display types — thin hairlines against thick stems) lose the hairlines to projector
  glare and video compression; the anti-aliasing note in WCAG 1.4.3 is the same failure
  in text-contrast terms. **Prefer low-to-moderate stroke-contrast faces** for both
  projected and compressed-video decks.
- **Letter-spacing for uppercase.** All-caps and small-caps need positive tracking
  because caps were spaced for mixed-case; tight all-caps crowds (the crowding mechanism
  of B7/B8). Add letter-spacing to any uppercase pill/label.
- **Line-height (leading).** Comfortable body leading is **~1.4–1.6× font-size** for
  screen/multi-line text; large display headlines can go tighter (~1.05–1.2×). Too tight
  and adjacent lines crowd vertically; too loose and lines stop reading as a block.
  **[ASSUMPTION: the 1.4–1.6 body / 1.05–1.2 display ranges are the widely-used web-
  typography conventions (e.g. WCAG 1.4.12 Text Spacing sets a 1.5 line-height *minimum
  requirement* for user-overridable text), not a single measured optimum.]** (WCAG
  1.4.12 line-height ≥1.5: https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html)

**Net rule for the skill's font choice:** high x-height fraction (≥0.5), open counters,
low stroke-contrast, moderate weight (heavier on dark). These are *why* a body font that
looks fine in a browser preview can still fail in the room or the encode.

---

### B11. Accessibility of the artefacts themselves

This is the part most decks ignore and where a *deterministic pipeline* can do something
a human designer usually won't.

**The accessibility gap: HTML slide vs rasterised/PDF slide.** An HTML slide can expose
real text, headings, and structure to a screen reader. A **rasterised** slide (PNG) or a
**video frame** is, to assistive tech, an opaque picture — *all* semantic structure is
lost, and only an alt text / long description recovers it. A tagged PDF sits in between:
it *can* carry a reading order and alt text, but only if tagged; an untagged
export-to-PDF is nearly as opaque as an image. WCAG's own framing: images of text
"don't scale as well… harder to change contrast… use text wherever possible" (1.4.3
notes), and for graphics, "the information is available in another form, such as in a
table… or a Long Description" satisfies non-text contrast (1.4.11, "Required for
Understanding"). So the spec itself points at **emit-the-text-alongside** as the
mitigation.

**What a pipeline should emit so a non-visual reader gets the argument** (all
deterministic, offline, free — fits the skill):
1. **Per-slide alt text / structured text.** Since the author already writes structured
   content (title, pill, cards, stat), the pipeline *already has* the semantic text — it
   should emit it as a machine-readable sidecar (the slide's title + card labels + the
   stat + its context), not just bake pixels. This is nearly free given the content
   model.
2. **A full structured-text transcript of the deck** — the argument in reading order,
   which doubles as the narration script for the video and as the screen-reader path for
   the slides. For a *narrated* deck the narration text **is** the alt text; emit it as
   captions (WebVTT) on the video and as the slide transcript.
3. **Chart/figure long descriptions.** Any chart or image slot should carry a required
   text description of *what it shows and concludes* (the A2 takeaway sentence is most of
   it) — and per 1.4.11, printing the values as text can exempt the graphic from the 3:1
   graphical-object rule while also serving the non-visual reader.
4. **Captions on the video, not burned-in-only.** Burned-in subtitles help some viewers
   but are invisible to screen readers and untranslatable; emit a real caption track as
   well.

**Proposed (strong):** the pipeline should treat "structured-text output alongside the
rasterised deck/video" as a first-class artefact, not an afterthought. It is uniquely
cheap here because the author never writes HTML — the structured `storyline.yml` content
is *already* the accessible text, so emitting a transcript + per-slide alt + caption
track is close to free and closes the exact gap that rasterisation opens.

---

## Summary of proposed changes to the skill (from this track)

1. **Chart-bearing content is "chart + conclusion + one annotation", not "chart".**
   Expect a *sentence* title on evidence slides; warn on topic-only titles. (A2)
2. **Enrich the `stat` model** to primary/secondary (value + comparator + delta +
   period) so either the delta or the absolute can be the dominant slot; add honest-
   scaling warnings (bar axis must be 0-based; percentages need n; area encodes value).
   (A3)
3. **Add a `table` layout** (rows × cols, one hero cell, small grey headers, portrait
   reflow by dropping to top columns). It is the honest home for "4+ options × several
   attributes" that `comparison` (cap 2) must reject, and is *not* the rejected
   `metric-row` (grid-with-lookup ≠ list-of-stats). (A4, A5)
4. **Hard build-time legibility gates** (deterministic, offline, precedent = overflow
   gate): text contrast ≥4.5:1 body / ≥3:1 large (prefer 7:1 body for room+video);
   minimum canvas px per role (body ≥40px, caption ≥30px, card-title ≥56px, title
   ≥90px), derived from the 0.2° CPS floor; a type scale with ~1.5–2× steps between
   roles so the weight hierarchy is visible. (B6, B7)
5. **Per-canvas character-count advisory** per card line (~≤45 landscape, ~≤30 portrait)
   as an early, cheap overflow/legibility signal. (B8)
6. **Colour rules:** default categorical palette = Okabe–Ito; sequential/diverging =
   ColorBrewer colorblind-safe; never colour-alone (add label/position/icon);
   emphasis must survive greyscale (luminance, not hue); on dark themes avoid pure black
   and thin weights. (B9)
7. **Font selection rule:** x-height fraction ≥0.5, open counters, low stroke-contrast,
   moderate weight; heavier on dark. (B10)
8. **Emit structured-text artefacts alongside the raster/video** — per-slide alt text,
   a full reading-order transcript (= narration script), chart long-descriptions, and a
   real caption track (WebVTT). Nearly free given the structured content model; closes
   the rasterisation accessibility gap. (B11)

## Sources (primary / authoritative)

- WCAG 2.2 Understanding 1.4.3 Contrast (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html
- WCAG 2.2 Understanding 1.4.11 Non-text Contrast: https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html
- WCAG 2.2 Understanding 1.4.12 Text Spacing: https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html
- Legge & Bigelow, *Does Print Size Matter for Reading?* (J Vis 2011): https://pmc.ncbi.nlm.nih.gov/articles/PMC3428264/
- FT Visual Vocabulary (nine categories): https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md and repo https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary
- Abela Chart Chooser (four intents), via Sandberg: https://datavizblog.com/2023/03/26/choosing-the-right-chart-when-creating-a-data-visualization-part-1-of-a-series/ ; origin FlowingData: https://flowingdata.com/2009/01/15/flow-chart-shows-you-what-chart-to-use/
- Knaflic, Storytelling with Data — direct labels vs legends: https://cole-knaflic.squarespace.com/blog/2012/06/drawing-attention-with-data-labels ; axis vs data labels: https://www.storytellingwithdata.com/blog/2017/8/2/axis-vs-data-labels ; annotate with text: https://storytellingwithdata.com/blog/annotate-with-text ; preattentive attributes: https://cole-knaflic.squarespace.com/blog/2011/10/google-example-preattentive-attributes ; where are your eyes drawn: https://storytellingwithdata.com/blog/whereareyoureyesdrawn ; declutter: https://storytellingwithdata.com/blog/two-tips-for-better-graphs
- Okabe & Ito Color Universal Design palette: https://siegal.bio.nyu.edu/color-palette/ (hex confirmed; base-R `palette.colors("Okabe-Ito")`)
- ColorBrewer (sequential/diverging, colorblind-safe): https://colorbrewer2.org
- Few, *Save the Pies for Dessert*: https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf
- APCA / WhyAPCA: https://github.com/Myndex/SAPC-APCA/blob/master/documentation/WhyAPCA.md ; EU data-viz guide on WCAG contrast criticism: https://data.europa.eu/apps/data-visualisation-guide/colour-contrast
- WCAG 3.0 status (non-normative draft): https://www.w3.org/WAI/standards-guidelines/wcag/wcag3-intro/ ; https://w3c.github.io/silver/explainer/
