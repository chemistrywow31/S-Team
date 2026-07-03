#!/usr/bin/env node
// Render Content Gate — sibling of layout-gate.cjs.
//
// The layout gate proves each slide FITS its container (geometry). It cannot
// prove each slide has anything VISIBLE inside it: a deck can pass every
// overflow check and still ship all-white (production incident 2026-05,
// session-ledger.md:73 "除了第一頁 全部一片白" after a layout PASS). This gate
// closes that hole by SCREENSHOTTING every slide and measuring rendered ink.
//
// Usage:
//   node render-gate.cjs <path-to-deck.html> [--out <report.json>] [--screenshots <dir>]
//
// Exit codes:
//   0  PASS — every slide has visible rendered content
//   1  FAIL — at least one slide is BLANK (see report)
//   2  Invocation / loading error (file missing, puppeteer absent, deck never loads)
//
// Blankness definition (documented in SKILL.md): a slide is BLANK when BOTH
//   - foregroundRatio  < INK_MIN  (fraction of screenshot pixels that differ
//                                  from the slide's own background color), AND
//   - visibleTextLength < TEXT_MIN (characters of painted, non-hidden text)
// Requiring BOTH signals to be near-zero makes the gate false-positive-proof on
// sparse-but-real slides (a single word paints ink; an image paints ink) while
// still catching the incident class where slides 2..N render as empty white.

const path = require('path');
const fs = require('fs');

// --- tunable thresholds (documented in SKILL.md) ---
const INK_MIN = 0.004;   // < 0.4% non-background pixels => visually blank
const TEXT_MIN = 3;      // < 3 painted characters => textually blank
const PIXEL_DELTA = 24;  // sum |dR|+|dG|+|dB| above this counts a pixel as ink
const SAMPLE_W = 480;    // downsample screenshot width for fast pixel counting

// Resolve puppeteer from cwd, the deck's dir, or any ancestor — identical
// strategy to layout-gate.cjs so both gates run from anywhere.
function resolvePuppeteer(targetFile) {
  const candidates = [];
  const seen = new Set();
  function addAncestors(start) {
    let dir = path.resolve(start);
    while (true) {
      if (seen.has(dir)) break;
      seen.add(dir);
      candidates.push(path.join(dir, 'node_modules', 'puppeteer'));
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  addAncestors(process.cwd());
  if (targetFile) addAncestors(path.dirname(path.resolve(targetFile)));
  for (const p of candidates) {
    try { if (fs.existsSync(path.join(p, 'package.json'))) return require(p); } catch {}
  }
  try { return require('puppeteer'); } catch {}
  return null;
}
const puppeteer = resolvePuppeteer(process.argv[2]);
if (!puppeteer) {
  console.error('FATAL: puppeteer not found. Install in this project or any ancestor: npm install puppeteer');
  process.exit(2);
}

const VIEWPORT = { width: 1920, height: 1080 }; // authored render size; blankness is viewport-independent

function parseArgs(argv) {
  const args = { file: null, out: null, screenshots: null };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') args.out = argv[++i];
    else if (a === '--screenshots') args.screenshots = argv[++i];
    else if (!args.file) args.file = a;
  }
  return args;
}

// Measure painted-ink ratio by decoding the screenshot with the browser's own
// PNG decoder (Image + canvas) — no extra node dependency, and it sees actual
// paint, so white-on-white text is correctly counted as zero ink.
async function measureForeground(page, b64) {
  return page.evaluate(async (base64, sampleW, delta) => {
    return await new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const W = Math.min(img.width, sampleW);
        const H = Math.max(1, Math.round(img.height * (W / img.width)));
        const c = document.createElement('canvas');
        c.width = W; c.height = H;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, W, H);
        const data = ctx.getImageData(0, 0, W, H).data;
        const at = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
        const corners = [at(0, 0), at(W - 1, 0), at(0, H - 1), at(W - 1, H - 1)];
        const counts = {}; let bg = corners[0], best = 0;
        for (const cc of corners) { const k = cc.join(','); counts[k] = (counts[k] || 0) + 1; if (counts[k] > best) { best = counts[k]; bg = cc; } }
        let fg = 0; const tot = W * H;
        for (let p = 0; p < data.length; p += 4) {
          if (Math.abs(data[p] - bg[0]) + Math.abs(data[p + 1] - bg[1]) + Math.abs(data[p + 2] - bg[2]) > delta) fg++;
        }
        resolve({ foregroundPixels: fg, totalPixels: tot, foregroundRatio: tot ? fg / tot : 0, bg });
      };
      img.onerror = () => resolve({ foregroundPixels: 0, totalPixels: 0, foregroundRatio: 0, bg: null });
      img.src = 'data:image/png;base64,' + base64;
    });
  }, b64, sampleW = SAMPLE_W, delta = PIXEL_DELTA);
}

async function measureText(page, useReveal) {
  return page.evaluate(reveal => {
    const root = reveal ? Reveal.getCurrentSlide() : document.body;
    if (!root) return { len: 0, title: '' };
    let len = 0;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      const t = (n.textContent || '').trim();
      if (!t) continue;
      const el = n.parentElement; if (!el) continue;
      const cs = getComputedStyle(el);
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) === 0) continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) continue;
      len += t.length;
    }
    const title = (root.querySelector && (root.querySelector('h1,h2,h3')?.textContent || '') || '').trim().slice(0, 60);
    return { len, title };
  }, useReveal);
}

(async () => {
  const args = parseArgs(process.argv);
  if (!args.file) { console.error('Usage: node render-gate.cjs <deck.html> [--out report.json] [--screenshots dir]'); process.exit(2); }
  const absFile = path.resolve(args.file);
  if (!fs.existsSync(absFile)) { console.error(`FATAL: file not found: ${absFile}`); process.exit(2); }
  const fileURL = 'file://' + absFile;
  const outPath = args.out || path.join(path.dirname(absFile), 'render-gate-report.json');
  const shotsDir = args.screenshots || path.join(path.dirname(absFile), 'render-gate-screenshots');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  try {
    await page.goto(fileURL, { waitUntil: 'networkidle0', timeout: 30000 });
  } catch (e) {
    await browser.close();
    const rpt = { file: path.relative(process.cwd(), absFile), timestamp: new Date().toISOString(), status: 'FAIL', reason: 'deck-did-not-load', error: String(e).slice(0, 200), summary: { slidesTested: 0, slidesBlank: 0, status: 'FAIL' }, slides: [] };
    fs.writeFileSync(outPath, JSON.stringify(rpt, null, 2));
    console.log(`Render gate FAIL — deck did not load — report: ${outPath}`);
    process.exit(1);
  }

  // Reveal-aware, with a graceful fallback for non-reveal HTML decks.
  const useReveal = await page.evaluate(async () => {
    if (typeof Reveal === 'undefined') return false;
    try { for (let i = 0; i < 40 && !Reveal.isReady(); i++) await new Promise(r => setTimeout(r, 200)); } catch {}
    return typeof Reveal !== 'undefined' && Reveal.isReady && Reveal.isReady();
  });

  let sections = [];
  if (useReveal) {
    const total = await page.evaluate(() => Reveal.getTotalSlides());
    sections = Array.from({ length: total }, (_, i) => i);
  } else {
    const count = await page.evaluate(() => {
      const els = document.querySelectorAll('.slides > section, section, [data-slide]');
      window.__rgSlides = els.length ? Array.from(els) : [document.body];
      return window.__rgSlides.length;
    });
    sections = Array.from({ length: count }, (_, i) => i);
  }

  const slides = [];
  for (let i = 0; i < sections.length; i++) {
    if (useReveal) { await page.evaluate(idx => Reveal.slide(idx), i); }
    else { await page.evaluate(idx => window.__rgSlides[idx].scrollIntoView({ block: 'start' }), i); }
    await new Promise(r => setTimeout(r, 400)); // let transitions / lazy content settle

    const b64 = await page.screenshot({ encoding: 'base64', fullPage: false });
    const fg = await measureForeground(page, b64);
    const txt = await measureText(page, useReveal);

    const blank = fg.foregroundRatio < INK_MIN && txt.len < TEXT_MIN;
    slides.push({ idx: i, blank, foregroundRatio: +fg.foregroundRatio.toFixed(5), visibleTextLength: txt.len, title: txt.title });

    if (blank) {
      fs.mkdirSync(shotsDir, { recursive: true });
      await page.screenshot({ path: path.join(shotsDir, `slide-${String(i + 1).padStart(2, '0')}.png`), fullPage: false });
    }
  }

  await browser.close();

  const slidesBlank = slides.filter(s => s.blank).length;
  const status = slidesBlank === 0 ? 'PASS' : 'FAIL';
  const report = {
    file: path.relative(process.cwd(), absFile),
    timestamp: new Date().toISOString(),
    engine: useReveal ? 'reveal.js' : 'generic-html',
    thresholds: { INK_MIN, TEXT_MIN, PIXEL_DELTA },
    status,
    summary: { slidesTested: slides.length, slidesBlank, status },
    slides,
  };
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`Render gate ${status} — report: ${outPath}`);
  console.log(`  slidesTested=${slides.length} slidesBlank=${slidesBlank}`);
  if (status === 'FAIL') {
    for (const s of slides.filter(s => s.blank)) console.log(`  BLANK slide ${s.idx + 1} (foregroundRatio=${s.foregroundRatio}, text=${s.visibleTextLength})`);
    process.exit(1);
  }
  process.exit(0);
})();
