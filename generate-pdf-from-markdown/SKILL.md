---
name: generate-pdf-from-markdown
description: "Generates high-quality, executive-styled PDF documents from any markdown files using Puppeteer and Marked. Supports frontmatter, checklists, code blocks, tables, and Mermaid diagrams."
argument-hint: "<markdown-file-or-dir> [-o output.pdf] [--no-cover]"
---

# Generate PDF From Markdown

Convert any Markdown document, directory of Markdown files, or glob pattern into professional, publication-ready A4 PDF documents.

## User Input

```text
$ARGUMENTS
```

## What This Skill Does

1. **Locates and validates** target Markdown file(s) or directories supplied in `$ARGUMENTS`.
2. **Parses document metadata**:
   - YAML frontmatter (`title`, `subtitle`, `badge`, `cover: false`, custom key-value pairs).
   - Top-level `# Document Heading` for page title, running header, and cover page.
   - Leading `> **Key:** Value` blockquote pairs for structured cover page metadata cards.
3. **Renders clean executive typography**:
   - Inter + JetBrains Mono fonts.
   - Formatted tables with subtle zebra striping.
   - Custom styled checkboxes for action checklists (`- [ ]` / `- [x]`).
   - Dark-mode syntax-highlighted code blocks (`#0f172a`).
   - Automatic client-side Mermaid flowchart & sequence diagram rendering.
4. **Outputs PDFs**:
   - Default target: `documents/generated-pdf/<filename>.pdf`.
   - Custom target: Specified via `-o` or `--out <path>`.

---

## Procedure

1. **Execute the PDF generation runner**:
   Run the CLI engine located in `.agents/skills/generate-pdf-from-markdown/scripts/generate-pdf.js`:
   ```bash
   node .agents/skills/generate-pdf-from-markdown/scripts/generate-pdf.js $ARGUMENTS
   ```

2. **Examples**:
   - Single file:
     ```bash
     node .agents/skills/generate-pdf-from-markdown/scripts/generate-pdf.js admin-instructions.md
     ```
   - Entire directory:
     ```bash
     node .agents/skills/generate-pdf-from-markdown/scripts/generate-pdf.js docs/
     ```
   - Custom output filename:
     ```bash
     node .agents/skills/generate-pdf-from-markdown/scripts/generate-pdf.js specs/login.md -o documents/generated-pdf/login-spec-v1.pdf
     ```
   - Skip cover page:
     ```bash
     node .agents/skills/generate-pdf-from-markdown/scripts/generate-pdf.js quick-guide.md --no-cover
     ```

3. **Verify output**:
   Confirm the generated PDF file(s) exist under `documents/generated-pdf/` (or the custom `--out` path) and report the clickable file link and file size to the user.

---

## Rules & Guarantees

- **Dependency Isolation**: All rendering packages (`puppeteer`, `marked`, `mermaid`) are managed inside `documents/package.json`.
- **Auto-Installation**: If `documents/node_modules/` is missing, the script automatically installs dependencies inside `documents/` on first run.
- **Fail-Safe Processing**: In batch operations, if a single file fails, the error is logged and the remaining files continue to be processed.
