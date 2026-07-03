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
//   - No non-decorative text block visually intersects a non-decorative media element
//     (img/svg/canvas/video/figure) by more than 8px in both axes
//   - Reveal.js initialised within 8s
//   - One of: per-slide auto-fit JS detected OR Reveal minScale/maxScale set OR every slide already fits
//
// Viewports: 4 landscape + 2 portrait (768x1024, 390x844 — added after the
// lesson-20260506 phone-rendering incident).
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
  // Portrait viewports — added after lesson-20260506 shipped a deck that broke on
  // phones and needed ad-hoc Puppeteer checks in Phase 7 (see that task's decisions.md).
  { name: '768x1024',  width: 768,  height: 1024 }, // tablet portrait
  { name: '390x844',   width: 390,  height: 844  }, // phone portrait
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

    // Reveal ≥5 flips to scroll view below scrollActivationWidth (default 435px viewport
    // width). In scroll view Reveal.slide() navigation no-ops and getCurrentSlide() keeps
    // returning slide 0, so every measurement silently reads the first slide — a false
    // PASS. Force classic slide view for measurement at portrait/phone viewports.
    const scrollViewDisabled = await page.evaluate(() => {
      if (typeof Reveal.isScrollView === 'function' && Reveal.isScrollView()) {
        Reveal.configure({ scrollActivationWidth: 0 });
        return true;
      }
      return false;
    });
    if (scrollViewDisabled) await new Promise(r => setTimeout(r, 600));

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

    // Resolve every slide's (h, v) coordinate up front — flat h-only navigation skips
    // or mismeasures vertical stacks.
    const slideCoords = await page.evaluate(() =>
      Reveal.getSlides().map(s => {
        const ix = Reveal.getIndices(s);
        return { h: ix.h, v: ix.v ?? 0 };
      })
    );
    const total = slideCoords.length;
    const slides = [];
    let navigationBroken = false;
    for (let i = 0; i < total; i++) {
      await page.evaluate(c => Reveal.slide(c.h, c.v), slideCoords[i]);
      // wait for any slidechanged-driven auto-fit
      await new Promise(r => setTimeout(r, 350));

      // Navigation integrity: if the deck ignored Reveal.slide() (e.g. scroll view still
      // active), every measurement would silently read the same slide — fail loudly.
      const at = await page.evaluate(() => { const ix = Reveal.getIndices(); return { h: ix.h, v: ix.v ?? 0 }; });
      if (at.h !== slideCoords[i].h || at.v !== slideCoords[i].v) { navigationBroken = true; break; }

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
        // Text/media overlap check — institutionalizes the ad-hoc Phase 7 script from
        // lesson-20260506. Elements marked decorative (aria-hidden, or class/data matching
        // deco|background|bg-|overlay|particle|vignette|grid) are exempt: they legitimately
        // sit behind content. Ancestor/descendant pairs are exempt (nesting ≠ collision).
        const isExempt = el => {
          for (let n = el; n && n !== cur; n = n.parentElement) {
            if (n.getAttribute && n.getAttribute('aria-hidden') === 'true') return true;
            const cd = (n.className || '').toString() + ' ' + (n.dataset ? Object.keys(n.dataset).join(' ') : '');
            if (/deco|background|bg-|overlay|particle|vignette|grid/i.test(cd)) return true;
          }
          return false;
        };
        const textBlocks = [];
        cur.querySelectorAll('h1,h2,h3,h4,p,li,blockquote,figcaption,td,th,dt,dd').forEach(el => {
          const ownText = Array.from(el.childNodes)
            .filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
          if (ownText.length < 3 || isExempt(el)) return;
          const tr = el.getBoundingClientRect();
          if (tr.width < 4 || tr.height < 4) return;
          textBlocks.push({ el, rect: tr, text: ownText.slice(0, 30) });
        });
        const mediaEls = [];
        cur.querySelectorAll('img,svg,canvas,video,figure').forEach(el => {
          if (isExempt(el)) return;
          const mr = el.getBoundingClientRect();
          if (mr.width < 12 || mr.height < 12) return;
          mediaEls.push({ el, rect: mr });
        });
        const overlaps = [];
        for (const t of textBlocks) {
          for (const md of mediaEls) {
            if (md.el.contains(t.el) || t.el.contains(md.el)) continue;
            const ix = Math.min(t.rect.right, md.rect.right) - Math.max(t.rect.left, md.rect.left);
            const iy = Math.min(t.rect.bottom, md.rect.bottom) - Math.max(t.rect.top, md.rect.top);
            if (ix > 8 && iy > 8) {
              overlaps.push({
                text: t.text,
                media: md.el.tagName.toLowerCase(),
                mediaCls: (md.el.className || '').toString().slice(0, 60),
                overlapW: Math.round(ix), overlapH: Math.round(iy),
              });
            }
          }
        }

        return {
          scrollH: sh, clientH: ch, scrollW: sw, clientW: cw,
          slideOverflowsContainer: (sh - ch > 2) || (sw - cw > 2),
          overflowingChildren: overflowingChildren.slice(0, 8),
          overflowCount: overflowingChildren.length,
          overlaps: overlaps.slice(0, 6),
          overlapCount: overlaps.length,
          title: (cur.querySelector('h1,h2,h3')?.textContent || '').trim().slice(0, 60),
        };
      });

      const slideFailed = !!m && (m.slideOverflowsContainer || m.overflowCount > 0 || m.overlapCount > 0);
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
    const vpFailed = slidesFailed > 0 || navigationBroken;
    report.viewports[vp.name] = {
      status: vpFailed ? 'FAIL' : 'PASS',
      ...(navigationBroken ? { reason: 'navigation-broken — Reveal.slide() did not land on the requested slide; measurements would be invalid' } : {}),
      ...(scrollViewDisabled ? { scrollViewDisabled: true } : {}),
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
