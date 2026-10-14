---
name: presentation-designer
description: Expert UX/UI Designer and Frontend Developer. I need you to create a modern, web-like presentation deck based on the content provided.
---

# Presentation Designer

Use this skill to create modern, high-impact slide blueprints for PowerPoint. This skill act as an expert UX/UI Designer and Frontend Developer. It focuses on a "Bento Box" UI aesthetic—using clean, minimalist cards and visual components instead of traditional bulleted lists.

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

## Slide Blueprint Format

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

When dealing with complex ecosystems or data-heavy content (like the MedBuddy idea), follow these rules to ensure comprehensive coverage without clutter:

- **Ecosystems**: Map "Engines" (Data sources) to "Downstream Reactions". Use the **Process Flow** layout to show interconnectivity.
- **Lifecycle Logic**: Segment content by Time or Phase milestones. Use the **Lifecycle** layout to show progression.
- **Paradigm Shifts**: When content presents a transformation (e.g., Exclusions -> Capabilities), use the **Comparison** layout to visually signify the "Flip".
- **Nested Data**: Use **Detail Cards** (small cards inside or beside larger ones) for technical specifics (e.g., audit vectors, stock thresholds) that support a main feature.

## Usage Guidelines

1. **NO BULLETS**: Transform all lists into visual components within cards.
2. **Conciseness**: Keep text inside cards extremely short (1-2 sentences max). If content is too dense, break it into multiple cards or multiple slides.
3. **Data-Driven Visuals**: For logistics or technical features, use the **Statistics / Data** layout to highlight core metrics (e.g., "90-day expiry threshold").
4. **Icons**: Suggest specific icons (e.g., [Shield Icon], [Database Icon]) for each card title to reinforce the category.
5. **Layout Variety**: See [references/layouts.md](references/layouts.md) for available patterns. Ensure a mix of grids, flows, and hero slides to maintain engagement.
6. **Comprehensive Extraction**: Never omit a primary product capability. If a feature has multiple granular details, group them into a "Deep-Dive" card rather than deleting them.
