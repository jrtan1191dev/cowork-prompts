const fs = require('fs');
const path = require('path');

/**
 * Renders HTML string into a PDF file using Puppeteer
 */
async function renderHtmlToPdf(html, outputPath, metadata, puppeteer) {
  const { pageTitle, headerText, footerLeftText } = metadata;

  // Ensure output parent directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 1600, deviceScaleFactor: 2 });

    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Wait for Mermaid SVGs to finish rendering if present
    await page.waitForFunction(() => {
      const mermaids = document.querySelectorAll('.mermaid');
      if (mermaids.length === 0) return true;
      return Array.from(mermaids).every(m => m.querySelector('svg') !== null);
    }, { timeout: 15000 }).catch(err => {
      // Soft timeout warn for non-critical diagrams
    });

    // Brief stabilization pause for custom font and layout settling
    await new Promise(r => setTimeout(r, 600));

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '16mm',
        bottom: '18mm',
        left: '14mm',
        right: '14mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 8px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #94a3b8; width: 100%; text-align: right; padding-right: 14mm;">
          ${headerText || pageTitle}
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 8px; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; padding: 0 14mm;">
          <span>${footerLeftText || pageTitle}</span>
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `
    });
  } finally {
    await browser.close();
  }
}

module.exports = {
  renderHtmlToPdf
};
