const path = require('path');

/**
 * Configure and return a marked renderer with Mermaid, Code block, and Table customizations
 */
function configureMarked(marked) {
  const renderer = new marked.Renderer();

  renderer.code = function(code, language, escaped) {
    if (typeof code === 'object') {
      language = code.lang;
      code = code.text;
    }
    if (language === 'mermaid') {
      return `<div class="mermaid-container"><div class="mermaid">${code}</div></div>`;
    }
    const escapedCode = (code || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre><code class="language-${language || 'text'}">${escapedCode}</code></pre>`;
  };

  marked.use({ renderer });
  return marked;
}

/**
 * Parses markdown content, extracting frontmatter, document title, and metadata
 */
function parseMarkdownDocument(rawContent, filePath, marked, options = {}) {
  let content = rawContent;
  const fileName = path.basename(filePath);
  const baseName = path.basename(filePath, path.extname(filePath));

  let pageTitle = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  let coverBadge = 'Technical Documentation';
  let coverTitle = pageTitle;
  let coverSubtitle = '';
  let metaItems = [];
  let hasCoverPage = options.noCover ? false : true;

  // 1. Parse YAML Frontmatter (--- ... ---)
  const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/);
  if (frontmatterMatch) {
    const frontmatterStr = frontmatterMatch[1];
    content = content.slice(frontmatterMatch[0].length);

    frontmatterStr.split(/\r?\n/).forEach(line => {
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        const key = line.slice(0, colonIdx).trim().toLowerCase();
        const val = line.slice(colonIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (key === 'title') {
          pageTitle = val;
          coverTitle = val;
        } else if (key === 'subtitle') {
          coverSubtitle = val;
        } else if (key === 'badge') {
          coverBadge = val;
        } else if (key === 'cover') {
          if (val === 'false' || val === 'no' || val === '0') {
            hasCoverPage = false;
          }
        } else if (val) {
          const formattedKey = key.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
          metaItems.push({ label: formattedKey, value: val });
        }
      }
    });
  }

  // 2. Extract Top Level Heading (# Title)
  const topHeadingMatch = content.match(/^#\s+(.+)$/m);
  if (topHeadingMatch) {
    const rawHeading = topHeadingMatch[1].trim();
    coverTitle = rawHeading;
    // Clean emojis/symbols from running header/title if any
    pageTitle = rawHeading.replace(/^[^\w\s]+/, '').trim() || rawHeading;

    if (hasCoverPage) {
      // Strip top # heading from the body to avoid duplication on page 2
      content = content.replace(/^#\s+[^\n]+\r?\n+/, '');
    }
  }

  // 3. Extract Top Blockquote Metadata (> **Key:** Value)
  const topBlockquoteMatch = content.match(/^(?:>[^\n]*\r?\n)+/);
  if (topBlockquoteMatch) {
    const blockquoteText = topBlockquoteMatch[0];
    const lines = blockquoteText.split(/\r?\n/).filter(l => l.startsWith('>'));

    lines.forEach(line => {
      const cleaned = line.replace(/^>\s*/, '').trim();
      // Match pattern: **Key:** Value or **Icon Key:** Value
      const kvMatch = cleaned.match(/^\*{0,2}(?:[^\w\s]*\s*)?([^*:]+)[:*]+\s*(.+)$/);
      if (kvMatch) {
        const label = kvMatch[1].replace(/^[^\w\s]+/, '').trim();
        let value = kvMatch[2].trim();
        // Render inline links or markdown inside metadata value
        if (marked.parseInline) {
          value = marked.parseInline(value);
        }
        metaItems.push({ label, value });
      } else if (cleaned && !coverSubtitle) {
        coverSubtitle = cleaned;
      }
    });

    if (hasCoverPage) {
      // Strip top blockquote and any trailing horizontal rule from the body
      content = content.slice(topBlockquoteMatch[0].length).replace(/^---\r?\n+/, '');
    }
  }

  // Fallback metadata if none was found
  if (metaItems.length === 0) {
    metaItems.push({ label: 'Document Source', value: fileName });
    metaItems.push({
      label: 'Generated Date',
      value: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    });
  }

  const rawHtml = marked.parse(content);

  return {
    rawHtml,
    metadata: {
      pageTitle,
      coverBadge,
      coverTitle,
      coverSubtitle,
      metaItems,
      hasCoverPage,
      headerText: pageTitle,
      footerLeftText: `${pageTitle} • Internal & Confidential`
    }
  };
}

module.exports = {
  configureMarked,
  parseMarkdownDocument
};
