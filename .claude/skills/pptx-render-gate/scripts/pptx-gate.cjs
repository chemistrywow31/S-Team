#!/usr/bin/env node
// PPTX Render Gate — automated visual-evidence pipeline for .pptx deliverables.
//
// Replaces the manual loop (PPTX → LibreOffice → PDF → per-slide PNG → eyeball)
// that was performed by hand on qic-ai-travel-review-deck, qic-ai-travel-review-tech-deck
// and chung-hsing-ai-collaboration-proposal.
//
// Usage:
//   node pptx-gate.cjs <path-to.pptx> [--out <report.json>] [--workdir <dir>] [--dpi <n>]
//
// Pipeline:
//   1. Shape lint      — scan slide XML for preset geometries known to render broken
//                        in LibreOffice / PDF export (e.g. "arc", found on qic-tech-deck)
//   2. Convert         — soffice --headless → PDF (isolated user profile, no GUI clash)
//   3. Rasterise       — pdftoppm → one PNG per slide
//   4. Page parity     — slide count in pptx XML must equal PDF page count
//   5. Ink check       — per-slide blankness measurement (same thresholds as render-content-gate)
//   6. Contact sheet   — contact-sheet.html (+ contact-sheet.png when puppeteer available)
//                        so a reviewer audits all slides in ONE artifact
//
// Exit codes:
//   0  PASS — no lint hits, page parity holds, no blank slides
//   1  FAIL — see pptx-gate-report.json
//   2  invocation / environment error (file missing, soffice or pdftoppm absent)
//
// Known limitation (state it, don't hide it): LibreOffice rendering ≈ PowerPoint
// rendering, not ==. The gate catches structural artifact classes (unsupported shapes,
// dropped slides, blank renders); pixel-faithful PowerPoint output still needs a human
// pass over the contact sheet.

const path = require('path');
const fs = require('fs');
const { execFileSync, spawnSync } = require('child_process');

// Preset geometries that LibreOffice mis-renders in PDF export.
// Evidence: 'arc' produced a visible artifact on qic-ai-travel-review-tech-deck
// (.worklog/202605/qic-ai-travel-review-tech-deck/phase-6-quality-review/findings.md).
// Extend this list when a new artifact class is confirmed — one line per incident.
const UNSUPPORTED_PRESETS = ['arc'];

const INK_MIN = 0.004;   // foreground pixel ratio below this ⇒ blank candidate
const PIXEL_DELTA = 24;  // |dR|+|dG|+|dB| above this ⇒ pixel counts as ink

function which(bin) {
  const r = spawnSync('which', [bin], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}

function resolvePuppeteer(startDir) {
  let dir = path.resolve(startDir);
  while (true) {
    const p = path.join(dir, 'node_modules', 'puppeteer');
    if (fs.existsSync(path.join(p, 'package.json'))) { try { return require(p); } catch {} }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  try { return require('puppeteer'); } catch {}
  return null;
}

function parseArgs(argv) {
  const args = { file: null, out: null, workdir: null, dpi: 96 };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') args.out = argv[++i];
    else if (a === '--workdir') args.workdir = argv[++i];
    else if (a === '--dpi') args.dpi = parseInt(argv[++i], 10) || 96;
    else if (!args.file) args.file = a;
  }
  return args;
}

// --- 1. Shape lint: unzip slide XML, look for known-broken preset geometries ---
function lintShapes(pptxPath) {
  const listing = execFileSync('unzip', ['-Z1', pptxPath], { encoding: 'utf8' });
  const slideXmls = listing.split('\n')
    .filter(n => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10));
  const findings = [];
  for (const entry of slideXmls) {
    const xml = execFileSync('unzip', ['-p', pptxPath, entry], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    const slideNum = parseInt(entry.match(/slide(\d+)\.xml/)[1], 10);
    for (const preset of UNSUPPORTED_PRESETS) {
      const re = new RegExp(`<a:prstGeom[^>]*prst="${preset}"`, 'g');
      const hits = xml.match(re);
      if (hits) findings.push({ slide: slideNum, preset, count: hits.length });
    }
  }
  return { slideCount: slideXmls.length, findings };
}

// --- 5. Ink check via puppeteer canvas sampling (optional if puppeteer missing) ---
async function inkCheck(pngPaths, pup) {
  const browser = await pup.launch({ headless: 'new' });
  const page = await browser.newPage();
  const results = [];
  for (const png of pngPaths) {
    // data URL instead of file:// — file-scheme images taint the canvas and block getImageData
    const url = 'data:image/png;base64,' + fs.readFileSync(png).toString('base64');
    const ratio = await page.evaluate(async (src, delta) => {
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = src; });
      const w = 480, h = Math.round(img.height * (480 / img.width));
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      const d = ctx.getImageData(0, 0, w, h).data;
      const corner = (x, y) => { const i = (y * w + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
      const corners = [corner(0, 0), corner(w - 1, 0), corner(0, h - 1), corner(w - 1, h - 1)];
      const key = c2 => c2.map(v => Math.round(v / 8)).join(',');
      const freq = {};
      corners.forEach(c2 => { freq[key(c2)] = (freq[key(c2)] || 0) + 1; });
      const bgKey = Object.keys(freq).sort((a, b) => freq[b] - freq[a])[0];
      const bg = bgKey.split(',').map(v => v * 8);
      let ink = 0, totalPx = 0;
      for (let i = 0; i < d.length; i += 16) { // sample every 4th pixel
        totalPx++;
        const dr = Math.abs(d[i] - bg[0]) + Math.abs(d[i + 1] - bg[1]) + Math.abs(d[i + 2] - bg[2]);
        if (dr > delta) ink++;
      }
      return ink / totalPx;
    }, url, PIXEL_DELTA);
    results.push({ png, foregroundRatio: Math.round(ratio * 10000) / 10000 });
  }
  await browser.close();
  return results;
}

// --- 6. Contact sheet ---
function writeContactSheet(dir, pngPaths, pptxName) {
  const cells = pngPaths.map((p, i) =>
    `<figure><img src="${path.basename(p)}" loading="lazy"><figcaption>slide ${i + 1}</figcaption></figure>`
  ).join('\n');
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Contact sheet — ${pptxName}</title>
<style>
  body{margin:16px;font:13px/1.4 -apple-system,sans-serif;background:#222;color:#ddd}
  main{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}
  figure{margin:0}img{width:100%;border:1px solid #555;display:block}
  figcaption{padding:2px 4px;color:#aaa}
</style></head><body><h1>${pptxName} — ${pngPaths.length} slides</h1><main>${cells}</main></body></html>`;
  const out = path.join(dir, 'contact-sheet.html');
  fs.writeFileSync(out, html);
  return out;
}

async function screenshotContactSheet(htmlPath, pup) {
  const browser = await pup.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });
  await page.goto('file://' + htmlPath, { waitUntil: 'networkidle0', timeout: 60000 });
  const out = htmlPath.replace(/\.html$/, '.png');
  await page.screenshot({ path: out, fullPage: true });
  await browser.close();
  return out;
}

(async () => {
  const args = parseArgs(process.argv);
  if (!args.file) {
    console.error('Usage: node pptx-gate.cjs <file.pptx> [--out report.json] [--workdir dir] [--dpi n]');
    process.exit(2);
  }
  const absFile = path.resolve(args.file);
  if (!fs.existsSync(absFile)) { console.error(`FATAL: file not found: ${absFile}`); process.exit(2); }
  const soffice = which('soffice') || '/Applications/LibreOffice.app/Contents/MacOS/soffice';
  if (!fs.existsSync(soffice) && !which('soffice')) { console.error('FATAL: soffice (LibreOffice) not found'); process.exit(2); }
  if (!which('pdftoppm')) { console.error('FATAL: pdftoppm (poppler) not found — brew install poppler'); process.exit(2); }
  if (!which('unzip')) { console.error('FATAL: unzip not found'); process.exit(2); }

  const baseName = path.basename(absFile, '.pptx');
  const workdir = path.resolve(args.workdir || path.join(path.dirname(absFile), 'pptx-gate-renders', baseName));
  fs.mkdirSync(workdir, { recursive: true });
  const outPath = args.out || path.join(path.dirname(absFile), 'pptx-gate-report.json');

  const report = {
    file: path.relative(process.cwd(), absFile),
    timestamp: new Date().toISOString(),
    status: 'PENDING',
    renderer: 'libreoffice',
    limitations: 'LibreOffice raster is a proxy for PowerPoint rendering; contact sheet still requires reviewer eyes for style-level judgment.',
    checks: {},
    artifacts: {},
  };

  // 1. shape lint
  let lint;
  try {
    lint = lintShapes(absFile);
  } catch (e) {
    console.error(`FATAL: cannot read pptx as zip: ${e.message}`); process.exit(2);
  }
  report.checks.shapeLint = {
    status: lint.findings.length === 0 ? 'PASS' : 'FAIL',
    unsupportedPresets: UNSUPPORTED_PRESETS,
    findings: lint.findings,
  };

  // 2. convert to PDF with an isolated LO profile (parallel-safe, no first-run dialogs)
  const profileDir = path.join(workdir, '.lo-profile');
  fs.mkdirSync(profileDir, { recursive: true });
  const conv = spawnSync(soffice, [
    '--headless', `-env:UserInstallation=file://${profileDir}`,
    '--convert-to', 'pdf', '--outdir', workdir, absFile,
  ], { encoding: 'utf8', timeout: 180000 });
  const pdfPath = path.join(workdir, baseName + '.pdf');
  if (conv.status !== 0 || !fs.existsSync(pdfPath)) {
    report.checks.convert = { status: 'FAIL', reason: 'soffice-conversion-failed', stderr: (conv.stderr || '').slice(0, 500) };
    report.status = 'FAIL';
    fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`PPTX gate FAIL — report: ${outPath}`);
    console.log('  conversion: soffice failed to produce a PDF');
    process.exit(1);
  }
  report.checks.convert = { status: 'PASS', pdf: path.relative(process.cwd(), pdfPath) };
  report.artifacts.pdf = path.relative(process.cwd(), pdfPath);

  // 3. rasterise
  execFileSync('pdftoppm', ['-png', '-r', String(args.dpi), pdfPath, path.join(workdir, 'slide')], { timeout: 180000 });
  const pngPaths = fs.readdirSync(workdir)
    .filter(f => /^slide-?\d+\.png$/.test(f))
    .sort((a, b) => parseInt(a.match(/\d+/)[0], 10) - parseInt(b.match(/\d+/)[0], 10))
    .map(f => path.join(workdir, f));

  // 4. page parity
  const parityOk = pngPaths.length === lint.slideCount;
  report.checks.pageParity = {
    status: parityOk ? 'PASS' : 'FAIL',
    slidesInPptx: lint.slideCount,
    pagesRendered: pngPaths.length,
    ...(parityOk ? {} : { reason: 'LibreOffice dropped or split slides during conversion' }),
  };

  // 5. ink check (needs puppeteer; skip with explicit SKIPPED status if absent)
  const pup = resolvePuppeteer(path.dirname(absFile));
  if (pup) {
    const ink = await inkCheck(pngPaths, pup);
    const blanks = ink
      .map((r, i) => ({ slide: i + 1, ...r }))
      .filter(r => r.foregroundRatio < INK_MIN);
    report.checks.inkCheck = {
      status: blanks.length === 0 ? 'PASS' : 'FAIL',
      thresholds: { INK_MIN, PIXEL_DELTA },
      slidesTested: ink.length,
      blankSlides: blanks.map(b => ({ slide: b.slide, foregroundRatio: b.foregroundRatio })),
    };
  } else {
    report.checks.inkCheck = { status: 'SKIPPED', reason: 'puppeteer not resolvable — blank-slide detection not performed' };
  }

  // 6. contact sheet
  const sheetHtml = writeContactSheet(workdir, pngPaths, path.basename(absFile));
  report.artifacts.contactSheetHtml = path.relative(process.cwd(), sheetHtml);
  if (pup) {
    try {
      const sheetPng = await screenshotContactSheet(sheetHtml, pup);
      report.artifacts.contactSheetPng = path.relative(process.cwd(), sheetPng);
    } catch (e) {
      report.artifacts.contactSheetPng = null;
    }
  }
  report.artifacts.slidePngs = pngPaths.map(p => path.relative(process.cwd(), p));

  const failed = Object.values(report.checks).filter(c => c.status === 'FAIL');
  report.status = failed.length === 0 ? 'PASS' : 'FAIL';
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));

  console.log(`PPTX gate ${report.status} — report: ${outPath}`);
  for (const [name, c] of Object.entries(report.checks)) {
    if (c.status === 'FAIL') {
      if (name === 'shapeLint') c.findings.forEach(f => console.log(`  shapeLint: slide ${f.slide} uses unsupported preset "${f.preset}" ×${f.count}`));
      else if (name === 'pageParity') console.log(`  pageParity: ${c.slidesInPptx} slides in pptx but ${c.pagesRendered} pages rendered`);
      else if (name === 'inkCheck') c.blankSlides.forEach(b => console.log(`  inkCheck: slide ${b.slide} is BLANK (foregroundRatio=${b.foregroundRatio})`));
      else console.log(`  ${name}: FAIL`);
    }
    if (c.status === 'SKIPPED') console.log(`  ${name}: SKIPPED — ${c.reason}`);
  }
  console.log(`  contact sheet: ${report.artifacts.contactSheetHtml}`);
  process.exit(report.status === 'PASS' ? 0 : 1);
})();
