const fs = require('fs');
const path = require('path');

/**
 * Builds the full HTML document string with styles, cover page, and scripts
 */
function buildHtmlDocument(parsedData, documentsDir) {
  const { rawHtml, metadata } = parsedData;
  const {
    pageTitle,
    coverBadge,
    coverTitle,
    coverSubtitle,
    metaItems,
    hasCoverPage,
    footerLeftText
  } = metadata;

  // Resolve local mermaid.min.js if available in documents/node_modules
  const localMermaidPath = path.join(documentsDir, 'node_modules', 'mermaid', 'dist', 'mermaid.min.js');
  let mermaidScriptTag = '<script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>';
  if (fs.existsSync(localMermaidPath)) {
    try {
      mermaidScriptTag = `<script>${fs.readFileSync(localMermaidPath, 'utf-8')}</script>`;
    } catch (e) {
      // Fallback to CDN script tag
    }
  }

  const coverMetaHtml = metaItems.map(item => `
    <div class="meta-item">
      <span class="meta-label">${item.label}</span>
      <span class="meta-value">${item.value}</span>
    </div>
  `).join('');

  const coverPageHtml = hasCoverPage ? `
    <!-- Cover Page -->
    <div class="cover-page">
      <div>
        <div class="cover-badge">${coverBadge}</div>
        <div class="cover-header">
          <h1 class="cover-title">${coverTitle}</h1>
          ${coverSubtitle ? `<div class="cover-subtitle">${coverSubtitle}</div>` : ''}
        </div>
      </div>

      <div class="cover-divider"></div>

      <div class="cover-meta">
        ${coverMetaHtml}
      </div>

      <div class="cover-footer">
        ${footerLeftText}
      </div>
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${pageTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    @page {
      size: A4;
      margin: 16mm 14mm 18mm 14mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      line-height: 1.55;
      font-size: 12px;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    /* Cover Page */
    .cover-page {
      page-break-after: always;
      break-after: page;
      height: 90vh;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 30px 10px 10px 10px;
    }

    .cover-badge {
      display: inline-block;
      background: linear-gradient(135deg, #312e81, #4f46e5);
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      padding: 6px 14px;
      border-radius: 20px;
      margin-bottom: 24px;
    }

    .cover-header {
      border-left: 6px solid #4f46e5;
      padding-left: 24px;
      margin-top: 36px;
    }

    .cover-title {
      font-size: 32px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.25;
      margin: 0 0 16px 0;
      letter-spacing: -0.5px;
    }

    .cover-subtitle {
      font-size: 16px;
      font-weight: 400;
      color: #475569;
      margin: 0;
      font-style: italic;
    }

    .cover-divider {
      height: 2px;
      background: linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 50%, #e2e8f0 100%);
      margin: 32px 0;
    }

    .cover-meta {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 22px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
    }

    .meta-label {
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #64748b;
      font-weight: 700;
      margin-bottom: 4px;
    }

    .meta-value {
      font-size: 13px;
      color: #0f172a;
      font-weight: 600;
      word-break: break-word;
    }

    .meta-value a {
      color: #4f46e5;
      text-decoration: none;
    }

    .cover-footer {
      margin-top: auto;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 16px;
    }

    /* Headings */
    h1 {
      font-size: 19px;
      font-weight: 700;
      color: #0f172a;
      margin-top: 24px;
      margin-bottom: 12px;
      padding-bottom: 6px;
      border-bottom: 2px solid #e2e8f0;
      page-break-after: avoid;
      break-after: avoid;
      letter-spacing: -0.3px;
    }

    .section-h1 {
      page-break-before: always;
      break-before: page;
      margin-top: 0;
      padding-top: 0;
      color: #1e1b4b;
      border-bottom: 3px solid #4f46e5;
    }

    h2 {
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
      margin-top: 22px;
      margin-bottom: 10px;
      padding-bottom: 4px;
      border-bottom: 1px solid #f1f5f9;
      page-break-after: avoid;
      break-after: avoid;
    }

    h3 {
      font-size: 13px;
      font-weight: 600;
      color: #334155;
      margin-top: 16px;
      margin-bottom: 8px;
      page-break-after: avoid;
      break-after: avoid;
    }

    h4 {
      font-size: 12px;
      font-weight: 600;
      color: #475569;
      margin-top: 12px;
      margin-bottom: 6px;
      page-break-after: avoid;
      break-after: avoid;
    }

    p {
      margin-top: 0;
      margin-bottom: 10px;
      color: #334155;
    }

    ul, ol {
      margin-top: 0;
      margin-bottom: 12px;
      padding-left: 20px;
      color: #334155;
    }

    li {
      margin-bottom: 5px;
    }

    li strong {
      color: #0f172a;
    }

    /* Checkbox list styling */
    ul:has(input[type="checkbox"]) {
      list-style: none;
      padding-left: 4px;
    }

    li:has(input[type="checkbox"]) {
      display: flex;
      align-items: flex-start;
      margin-bottom: 7px;
    }

    input[type="checkbox"] {
      appearance: none;
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      border: 1.5px solid #64748b;
      border-radius: 3px;
      margin-right: 8px;
      margin-top: 2px;
      flex-shrink: 0;
      position: relative;
    }

    input[type="checkbox"]:checked {
      background-color: #4f46e5;
      border-color: #4f46e5;
    }

    input[type="checkbox"]:checked::after {
      content: '';
      position: absolute;
      left: 3.5px;
      top: 1px;
      width: 4px;
      height: 7px;
      border: solid white;
      border-width: 0 1.5px 1.5px 0;
      transform: rotate(45deg);
    }

    hr {
      border: none;
      height: 1px;
      background: #e2e8f0;
      margin: 20px 0;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 14px 0;
      font-size: 11px;
      page-break-inside: avoid;
      break-inside: avoid;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.03);
      border: 1px solid #cbd5e1;
    }

    th {
      background-color: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      text-align: left;
      padding: 8px 10px;
      border-bottom: 2px solid #cbd5e1;
      font-size: 10.5px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #334155;
      vertical-align: top;
      line-height: 1.45;
    }

    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    /* Links */
    a {
      color: #4f46e5;
      text-decoration: none;
      font-weight: 500;
    }

    /* Code & Blueprints */
    pre {
      background-color: #0f172a;
      color: #f8fafc;
      padding: 12px 14px;
      border-radius: 8px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      line-height: 1.45;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-x: auto;
      margin: 12px 0;
      page-break-inside: avoid;
      break-inside: avoid;
      border: 1px solid #1e293b;
    }

    code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 10.5px;
      background-color: #f1f5f9;
      color: #475569;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    pre code {
      background-color: transparent;
      color: inherit;
      padding: 0;
      border: none;
    }

    /* Mermaid Diagrams */
    .mermaid-container {
      display: flex;
      justify-content: center;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 14px 8px;
      margin: 16px 0;
      page-break-inside: avoid;
      break-inside: avoid;
      max-width: 100%;
      overflow: hidden;
    }

    .mermaid {
      width: 100%;
      text-align: center;
      display: flex;
      justify-content: center;
    }

    .mermaid svg {
      max-width: 100% !important;
      max-height: 380px !important;
      height: auto !important;
      width: auto !important;
    }

    blockquote {
      border-left: 4px solid #4f46e5;
      background-color: #f8fafc;
      margin: 14px 0;
      padding: 10px 16px;
      color: #475569;
      border-radius: 0 8px 8px 0;
    }
  </style>
  ${mermaidScriptTag}
</head>
<body>

  ${coverPageHtml}

  <!-- Content Body -->
  <div class="content-body">
    ${rawHtml}
  </div>

  <script>
    document.addEventListener("DOMContentLoaded", function() {
      // Add section styling for main section h1 headings
      const h1s = document.querySelectorAll('h1');
      h1s.forEach((h1) => {
        if (h1.textContent.includes('Section')) {
          h1.classList.add('section-h1');
        }
      });

      // Initialize mermaid with optimal neutral styling
      if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
          startOnLoad: true,
          theme: 'neutral',
          securityLevel: 'loose',
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: 'basis'
          },
          themeVariables: {
            primaryColor: '#e0e7ff',
            primaryTextColor: '#1e1b4b',
            primaryBorderColor: '#6366f1',
            lineColor: '#4f46e5',
            secondaryColor: '#f1f5f9',
            tertiaryColor: '#ffffff',
            fontSize: '11px'
          }
        });
      }
    });
  </script>
</body>
</html>`;
}

module.exports = {
  buildHtmlDocument
};
