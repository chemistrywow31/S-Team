#!/usr/bin/env node
// Layout Gate — automated runtime measurement of slide overflow & auto-fit presence.
//
// Usage:
//   node layout-gate.cjs <path-to-index.html> [--out <report.json>] [--screenshots <dir>]
//
// Exit codes:
//   0  All viewports PASS (no slide overflows its container, auto-fit detected)
//   1  At least one FAIL — see report
//   2  Invocation / loading error (file missing, Reveal never ready, etc.)
//
// What "PASS" means per slide × viewport:
//   - Slide <section> scrollHeight ≤ clientHeight + 2px AND scrollWidth ≤ clientWidth + 2px
//   - No descendant element extends > 2px past the slide bounding rect
//   - Reveal.js initialised within 8s
//   - One of: per-slide auto-fit JS detected OR Reveal minScale/maxScale set OR every slide already fits
//
// Produces:
//   layout-gate-report.json — machine-readable evidence
//   screenshots/<viewport>/slide-<idx>.png — screenshot of every FAIL slide

const path = require('path');
const fs = require('fs');

// Resolve puppeteer from cwd, target file dir, or any ancestor — so the gate can
// be invoked from the team root while puppeteer lives in an output project's node_modules.
function resolvePuppeteer(targetFile) {
  const candidates = [];
  const seenDirs = new Set();
  function addAncestors(start) {
    let dir = path.resolve(start);
    while (true) {
      if (seenDirs.has(dir)) break;
      seenDirs.add(dir);
      candidates.push(path.join(dir, 'node_modules', 'puppeteer'));
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  addAncestors(process.cwd());
  if (targetFile) addAncestors(path.dirname(path.resolve(targetFile)));
  for (const p of candidates) {
    try {
      if (fs.existsSync(path.join(p, 'package.json'))) return require(p);
    } catch {}
  }
  try { return require('puppeteer'); } catch {}
  return null;
}
const puppeteer = resolvePuppeteer(process.argv[2]);
if (!puppeteer) {
  console.error('FATAL: puppeteer not found. Install in this project or any ancestor: npm install puppeteer');
  process.exit(2);
}

const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080 },
  { name: '1366x768',  width: 1366, height: 768  },
  { name: '1280x720',  width: 1280, height: 720  },
  { name: '960x700',   width: 960,  height: 700  }, // reveal.js authored default
];

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

(async () => {
  const args = parseArgs(process.argv);
  if (!args.file) {
    console.error('Usage: node layout-gate.cjs <html-file> [--out report.json] [--screenshots dir]');
    process.exit(2);
  }
  const absFile = path.resolve(args.file);
  if (!fs.existsSync(absFile)) {
    console.error(`FATAL: file not found: ${absFile}`); process.exit(2);
  }
  const fileURL = 'file://' + absFile;
  const outPath = args.out || path.join(path.dirname(absFile), 'layout-gate-report.json');
  const shotsDir = args.screenshots || path.join(path.dirname(absFile), 'layout-gate-screenshots');

  const browser = await puppeteer.launch({ headless: 'new' });
  const report = {
    file: path.relative(process.cwd(), absFile),
    timestamp: new Date().toISOString(),
    status: 'PENDING',
    summary: { viewportsTested: VIEWPORTS.length, viewportsFailed: 0, totalOverflowingSlides: 0 },
    viewports: {},
  };

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });

    let revealReady = true;
    try {
      await page.goto(fileURL, { waitUntil: 'networkidle0', timeout: 30000 });
      await page.waitForFunction(
        () => typeof Reveal !== 'undefined' && Reveal.isReady(),
        { timeout: 8000 }
      );
    } catch (e) {
      revealReady = false;
    }

    if (!revealReady) {
      report.viewports[vp.name] = {
        status: 'FAIL',
        reason: 'reveal-not-ready',
        slides: [],
      };
      report.summary.viewportsFailed += 1;
      await page.close();
      continue;
    }

    // Allow per-slide auto-fit JS (if any) to run after `ready`.
    await new Promise(r => setTimeout(r, 800));

    const config = await page.evaluate(() => ({
      minScale: Reveal.getConfig().minScale ?? null,
      maxScale: Reveal.getConfig().maxScale ?? null,
      width:    Reveal.getConfig().width    ?? null,
      height:   Reveal.getConfig().height   ?? null,
    }));
    const autoFitDetected = await page.evaluate(() =>
      Array.from(document.scripts).some(s =>
        /scrollHeight\s*>\s*clientHeight|scale\([^)]*ratio|transform\s*=\s*['"]?scale/.test(s.textContent)
      )
    );

    const total = await page.evaluate(() => Reveal.getTotalSlides());
    const slides = [];
    for (let i = 0; i < total; i++) {
      await page.evaluate(idx => Reveal.slide(idx), i);
      // wait for any slidechanged-driven auto-fit
      await new Promise(r => setTimeout(r, 350));

      const m = await page.evaluate(() => {
        const cur = Reveal.getCurrentSlide();
        if (!cur) return null;
        const r = cur.getBoundingClientRect();
        const sh = cur.scrollHeight, ch = cur.clientHeight;
        const sw = cur.scrollWidth,  cw = cur.clientWidth;
        const overflowingChildren = [];
        cur.querySelectorAll('*').forEach(el => {
          const er = el.getBoundingClientRect();
          if (er.width === 0 && er.height === 0) return;
          const overV = er.bottom - r.bottom;
          const overH = er.right  - r.right;
          if (overV > 2 || overH > 2) {
            overflowingChildren.push({
              tag: el.tagName.toLowerCase(),
              cls: (el.className || '').toString().slice(0, 80),
              text: (el.textContent || '').trim().slice(0, 40),
              overV: Math.round(overV),
              overH: Math.round(overH),
            });
          }
        });
        return {
          scrollH: sh, clientH: ch, scrollW: sw, clientW: cw,
          slideOverflowsContainer: (sh - ch > 2) || (sw - cw > 2),
          overflowingChildren: overflowingChildren.slice(0, 8),
          overflowCount: overflowingChildren.length,
          title: (cur.querySelector('h1,h2,h3')?.textContent || '').trim().slice(0, 60),
        };
      });

      const slideFailed = !!m && (m.slideOverflowsContainer || m.overflowCount > 0);
      slides.push({ idx: i, failed: slideFailed, ...m });

      if (slideFailed) {
        const sdir = path.join(shotsDir, vp.name);
        fs.mkdirSync(sdir, { recursive: true });
        await page.screenshot({
          path: path.join(sdir, `slide-${String(i + 1).padStart(2, '0')}.png`),
          fullPage: false,
        });
      }
    }

    const slidesFailed = slides.filter(s => s.failed).length;
    const vpFailed = slidesFailed > 0;
    report.viewports[vp.name] = {
      status: vpFailed ? 'FAIL' : 'PASS',
      revealConfig: config,
      autoFitDetected,
      totalSlides: total,
      slidesFailed,
      slides,
    };
    if (vpFailed) report.summary.viewportsFailed += 1;
    report.summary.totalOverflowingSlides += slidesFailed;
    await page.close();
  }

  await browser.close();

  // Auto-fit advisory: every viewport must have either auto-fit JS detected, OR zero failures.
  // If a viewport fails AND has no auto-fit JS, that is a structural defect, not just data overflow.
  for (const [vp, r] of Object.entries(report.viewports)) {
    if (r.status === 'FAIL' && r.autoFitDetected === false) {
      r.advisory = 'No per-slide auto-fit JS detected — install rules/responsive-auto-fit.md Layer 3 snippet.';
    }
  }

  report.status = report.summary.viewportsFailed === 0 ? 'PASS' : 'FAIL';
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(`Layout gate ${report.status} — report: ${outPath}`);
  if (report.status === 'FAIL') {
    for (const [vp, r] of Object.entries(report.viewports)) {
      if (r.status === 'FAIL') {
        console.log(`  ${vp}: ${r.slidesFailed}/${r.totalSlides ?? '?'} slides overflow${r.advisory ? ' — ' + r.advisory : ''}`);
      }
    }
    process.exit(1);
  }
  process.exit(0);
})();
