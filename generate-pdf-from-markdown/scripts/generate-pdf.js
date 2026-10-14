#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { createRequire } = require('module');

const { configureMarked, parseMarkdownDocument } = require('./lib/parser');
const { buildHtmlDocument } = require('./lib/template');
const { renderHtmlToPdf } = require('./lib/renderer');

// Locate repo root and documents directory
function findProjectRoot(startDir) {
  let curr = startDir;
  while (curr !== path.dirname(curr)) {
    if (fs.existsSync(path.join(curr, 'documents')) || fs.existsSync(path.join(curr, '.git'))) {
      return curr;
    }
    curr = path.dirname(curr);
  }
  return startDir;
}

const repoRoot = findProjectRoot(__dirname);
const documentsDir = path.join(repoRoot, 'documents');
const defaultOutputDir = path.join(documentsDir, 'generated-pdf');

// Ensure documents directory exists
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

// Auto-install dependencies in documents folder if missing
const nodeModulesDir = path.join(documentsDir, 'node_modules');
if (!fs.existsSync(nodeModulesDir)) {
  console.log('📦 Missing dependencies in documents/node_modules. Installing...');
  try {
    execSync('npm install', { cwd: documentsDir, stdio: 'inherit' });
  } catch (err) {
    console.error('❌ Failed to install dependencies inside documents directory:', err.message);
    process.exit(1);
  }
}

// Dynamically require packages from documents/package.json
const docRequire = createRequire(path.join(documentsDir, 'package.json'));
let marked, puppeteer;

try {
  const markedModule = docRequire('marked');
  marked = markedModule.marked || markedModule;
  puppeteer = docRequire('puppeteer');
} catch (err) {
  console.error('❌ Could not load puppeteer or marked from documents/node_modules:', err.message);
  console.error('   Please run: cd documents && npm install');
  process.exit(1);
}

// Configure Marked with custom renderers
configureMarked(marked);

// Parse CLI Arguments
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(`
📄 generate-pdf-from-markdown

Usage:
  node generate-pdf.js <file-or-dir ...> [options]

Arguments:
  <file-or-dir>          One or more markdown files, directories, or patterns.

Options:
  -o, --out <path>       Specify custom output directory or file path.
                         (Default: documents/generated-pdf/<filename>.pdf)
  --no-cover             Skip generation of the executive cover page.
  -h, --help             Display this help message.

Examples:
  node generate-pdf.js admin-instructions.md
  node generate-pdf.js docs/
  node generate-pdf.js spec.md -o custom-name.pdf
  node generate-pdf.js notes.md --no-cover
`);
  process.exit(0);
}

let customOut = null;
let noCover = false;
const targetInputs = [];

for (let i = 0; i < args.length; i++) {
  const arg = args[i];
  if (arg === '-o' || arg === '--out') {
    customOut = args[++i];
  } else if (arg === '--no-cover') {
    noCover = true;
  } else if (!arg.startsWith('-')) {
    targetInputs.push(arg);
  }
}

if (targetInputs.length === 0) {
  console.error('❌ Error: No markdown files specified.');
  process.exit(1);
}

// Expand target inputs (files & directories)
function resolveMarkdownFiles(inputs) {
  const files = [];

  inputs.forEach(input => {
    const fullPath = path.isAbsolute(input) ? input : path.resolve(process.cwd(), input);

    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ Warning: Path not found: ${input}`);
      return;
    }

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      const dirFiles = fs.readdirSync(fullPath)
        .filter(f => f.endsWith('.md') || f.endsWith('.markdown'))
        .map(f => path.join(fullPath, f));
      files.push(...dirFiles);
    } else if (stat.isFile()) {
      files.push(fullPath);
    }
  });

  return files;
}

const markdownFiles = resolveMarkdownFiles(targetInputs);

if (markdownFiles.length === 0) {
  console.error('❌ Error: No valid markdown files found to process.');
  process.exit(1);
}

// Ensure default output directory exists
if (!fs.existsSync(defaultOutputDir)) {
  fs.mkdirSync(defaultOutputDir, { recursive: true });
}

// Main execution loop
async function run() {
  console.log(`\n🚀 Processing ${markdownFiles.length} markdown file(s)...\n`);

  for (const filePath of markdownFiles) {
    const fileName = path.basename(filePath);
    const baseName = path.basename(filePath, path.extname(filePath));

    let outputPath;
    if (customOut) {
      if (customOut.endsWith('.pdf')) {
        outputPath = path.isAbsolute(customOut) ? customOut : path.resolve(process.cwd(), customOut);
      } else {
        outputPath = path.isAbsolute(customOut)
          ? path.join(customOut, `${baseName}.pdf`)
          : path.resolve(process.cwd(), customOut, `${baseName}.pdf`);
      }
    } else {
      outputPath = path.join(defaultOutputDir, `${baseName}.pdf`);
    }

    console.log(`📄 Converting: ${path.relative(repoRoot, filePath)}`);
    console.log(`   ➔ Output:  ${path.relative(repoRoot, outputPath)}`);

    try {
      const rawContent = fs.readFileSync(filePath, 'utf-8');
      const parsedData = parseMarkdownDocument(rawContent, filePath, marked, { noCover });
      const fullHtml = buildHtmlDocument(parsedData, documentsDir);

      await renderHtmlToPdf(fullHtml, outputPath, parsedData.metadata, puppeteer);
      console.log(`   ✅ Successfully generated: ${path.basename(outputPath)}\n`);
    } catch (err) {
      console.error(`   ❌ Failed to generate PDF for ${fileName}:`, err.message, '\n');
    }
  }

  console.log('🎉 Done!');
}

run().catch(err => {
  console.error('Fatal error during PDF generation:', err);
  process.exit(1);
});
