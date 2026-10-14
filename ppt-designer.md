---
name: presentation-designer
description: Expert UX/UI Designer and Frontend Developer. I need you to create a modern, web-like presentation deck based on the content provided.
---

# Presentation Designer

Use this skill to create modern, high-impact slide for PowerPoint. This skill act as an expert UX/UI Designer and Frontend Developer. It focuses on a "Bento Box" UI aesthetic—using clean, minimalist cards and visual components instead of traditional bulleted lists.

## The Aesthetic ("Bento Box" UI)

- **Theme**: Minimalist, bright, and clean.
- **Background**: Soft, light colors (e.g., Hex #F1F5F9).
- **Colors**:
  - **Primary**: Deep, professional base (e.g., #0F172A).
  - **Secondary**: Softer, complementary shade (e.g., #64748B).
  - **Accent**: Vibrant highlights (e.g., #10B981 Emerald, #F59E0B Amber) for icons and buttons.
- **Shapes ("The Cards")**: PowerPoint's "Rounded Rectangles" (corner radius ~0.2) with a solid white fill, NO outline, and a subtle drop shadow.
- **Typography**: Modern sans-serif fonts (Segoe UI, Helvetica). Bold/extrabold headings.

## Core Components

- **Title**: Large, extrabold headings for high hierarchy.
- **Body**: Minimalist text, strictly for essential context.
- **Button**: A "pill-shaped" Rounded Rectangle (max corner radius) with a Primary or Accent fill and white/bold text.
- **Detail Cards**: Smaller, nested or secondary cards used for granular data or supporting evidence.

## Slide Structure

For every slide generated, output this exact structure:

- **Slide Number & Title**: [e.g., Slide 1: Introduction]
- **Layout Type**: Choose from [references/layouts.md](references/layouts.md) (e.g., 2x2 Bento Grid).
- **Visual Instructions**: Brief explanation of shape arrangement for the Bento layout.
- **Card 1 (Size/Position)**: [Icon], [Title], [Short Text].
- **Card 2 (Size/Position)**: [Icon], [Title], [Short Text].
- **More Cards**: Additional card details as needed.
- **Image/Graphic Suggestion**: Detailed image prompts or graphic ideas.
- **Speaker Notes**: Concise talking points.

## Advanced Content Mapping

When dealing with complex ecosystems or data-heavy content, follow these rules to ensure comprehensive coverage without clutter:

- **Ecosystems**: Map "Engines" (Data sources) to "Downstream Reactions". Use the **Process Flow** layout to show interconnectivity.
- **Lifecycle Logic**: Segment content by Time or Phase milestones. Use the **Lifecycle** layout to show progression.
- **Paradigm Shifts**: When content presents a transformation (e.g., Exclusions -> Capabilities), use the **Comparison** layout to visually signify the "Flip".
- **Nested Data**: Use **Detail Cards** (small cards inside or beside larger ones) for technical specifics (e.g., audit vectors, stock thresholds) that support a main feature.

## Usage Guidelines

1. **NO BULLETS**: Transform all lists into visual components within cards.
2. **Conciseness**: Keep text inside cards extremely short (1-2 sentences max). If content is too dense, break it into multiple cards or multiple slides.
3. **Data-Driven Visuals**: For logistics or technical features, use the **Statistics / Data** layout to highlight core metrics (e.g., "90-day expiry threshold").
4. **Icons**: Suggest specific icons (e.g., [Shield Icon], [Database Icon]) for each card title to reinforce the category.
5. **Layout Variety**: See [references/layouts.md](references/layouts.md) for available patterns. Ensure a mix of grids, flows, and slides to maintain engagement.
6. **Comprehensive Extraction**: Never omit a primary product capability. If a feature has multiple granular details, group them into a "Deep-Dive" card rather than deleting them.

## Slide Layout Variants

Use these layout patterns to create a modern, web-like "Bento Box" UI aesthetic in PowerPoint.

### 1. Slides

- **Visuals**: A clean introductory slide.
- **Left (50% width)**: Large **Title** with a **Button** (pill shape) above it for category or status.
- **Right (50% width)**: A high-quality image or a large illustrative icon within a subtle card container.

### 2. Bento Grid (Asymmetrical)

- **Visuals**: A grid of interlocking Rounded Rectangles of varying sizes.
- **Pattern A**: 1 large vertical card on the left (50% width, 100% height), and 2 stacked horizontal cards on the right (50% width each).
- **Pattern B**: 1 large horizontal card on top (100% width, 60% height), and 2 smaller **Detail Cards** side-by-side on the bottom (50% width each).
- **Styling**: All cards should have a solid white fill, no outline, and a subtle drop shadow.

## 3. Tiled Features

- **Visuals**: 3 or 4 equal-width vertical cards in a single row.
- **Content**: Each card contains [Icon] -> **Title** -> **Body** (1-2 sentence description).

### 5. Process Flow / Ecosystem

- **Visuals**: A central vertical or horizontal card (The Hub) with smaller **Detail Cards** (Downstream nodes) connected by simple lines or "Connector Shapes".
- **Layout**: 1 large center card, with 3-4 smaller cards arranged around it.
- **Styling**: Use "Accent" colors for the connector lines to indicate flow direction.

### 6. Lifecycle / Timeline

- **Visuals**: A horizontal row of cards representing chronological phases.
- **Layout**: 3 or 4 **Tiled Features** but with a horizontal "Connector Line" running behind or through the middle of the cards.
- **Content**: Each card represents a Phase (e.g., Phase 1 -> Phase 2 -> Phase 3).

### 7. Comparison / Matrix (Flip Paradigm)

- **Visuals**: Two side-by-side vertical cards representing a "Before/After" or "Negative/Positive" contrast.
- **Layout**: 50/50 vertical split.
- **Styling**: Use a "Secondary" color for the 'Old/Negative' side and an "Accent" color for the 'New/Positive' side to emphasize the transformation.

### 8. Data / Logistics Deep-Dive

- **Visuals**: A large horizontal card for a main metric, with a 2x1 grid of supporting **Detail Cards** below it.
- **Content**: Combines a single high-level stat with granular supporting data points.
