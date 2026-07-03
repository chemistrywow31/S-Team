#!/usr/bin/env node
// bundle-deck.cjs — make an HTML deck folder-portable and offline-safe.
//
// Downloads every CDN reference (reveal.js, Google Fonts, any http(s) css/js/img)
// into <deck-dir>/vendor/, rewrites the HTML/CSS to relative paths, then verifies
// zero external references remain and every local reference resolves.
//
// Why: HTML decks delivered as folder bundles broke offline — CDN reveal.js and
// Google Fonts require network (trendmicro FINDING-P5-004; lesson-20260506
// delivery decision: "local reveal vendor files + relative asset paths").
//
// Usage:
//   node bundle-deck.cjs <path-to-index.html> [--check] [--no-backup]
//
//   --check      verify-only: report external/broken references, download nothing
//   --no-backup  skip writing index.html.orig before rewriting
//
// Exit codes:
//   0  PASS — deck is offline-safe (no external refs, all local refs resolve)
//   1  FAIL — externals remain (download failed) or local refs are broken
//   2  invocation error
//
// Report: <deck-dir>/bundle-report.json

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Chrome UA so Google Fonts serves woff2 (default UA gets legacy ttf CSS)
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36';

const EXT_RE = /https?:\/\/[^\s"'()<>]+/g;

function parseArgs(argv) {
  const a = { file: null, check: false, backup: true };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === '--check') a.check = true;
    else if (argv[i] === '--no-backup') a.backup = false;
    else if (!a.file) a.file = argv[i];
  }
  return a;
}

function vendorNameFor(url) {
  const u = new URL(url);
  let base = path.basename(u.pathname) || 'index';
  base = base.split('?')[0].replace(/[^\w.-]/g, '_');
  if (!/\.[a-z0-9]{2,5}$/i.test(base)) {
    // extension-less (e.g. fonts.googleapis.com/css2?family=...) — assume css
    base += '.css';
  }
  const hash = crypto.createHash('sha1').update(url).digest('hex').slice(0, 8);
  return `${hash}-${base}`;
}

async function download(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

function isTextAsset(name) { return /\.(css|js|mjs|svg|html)$/i.test(name); }

// Load-bearing external URLs only — href=/src=/url()/@import. A blanket http(s) scan
// would also download license/comment URLs (e.g. revealjs.com in the reveal.css header)
// and then crawl whatever HTML page came back.
function extractLoadBearingUrls(content) {
  const urls = new Set();
  for (const re of [
    /(?:href|src)\s*=\s*["'](https?:[^"']+)["']/g,
    /url\(\s*['"]?(https?:[^'")]+)['"]?\s*\)/g,
    /@import\s+["'](https?:[^"']+)["']/g,
  ]) {
    for (const m of content.matchAll(re)) urls.add(m[1]);
  }
  return [...urls];
}

(async () => {
  const args = parseArgs(process.argv);
  if (!args.file) { console.error('Usage: node bundle-deck.cjs <index.html> [--check] [--no-backup]'); process.exit(2); }
  const absFile = path.resolve(args.file);
  if (!fs.existsSync(absFile)) { console.error(`FATAL: not found: ${absFile}`); process.exit(2); }
  const deckDir = path.dirname(absFile);
  const vendorDir = path.join(deckDir, 'vendor');
  const reportPath = path.join(deckDir, 'bundle-report.json');

  const report = {
    file: path.relative(process.cwd(), absFile),
    timestamp: new Date().toISOString(),
    mode: args.check ? 'check' : 'bundle',
    status: 'PENDING',
    downloaded: [],
    rewrites: 0,
    failedDownloads: [],
    remainingExternal: [],
    brokenLocalRefs: [],
  };

  // Collect text files to scan/rewrite: the entry HTML + any local css/js it references
  // + everything we download into vendor/. Processed as a work queue so CSS pulled from
  // a CDN gets ITS url(...) references (font files, images) localized too.
  const textFiles = new Set([absFile]);
  const localRefRe = /(?:href|src)\s*=\s*["']([^"']+)["']|url\(\s*['"]?([^'")]+)['"]?\s*\)/g;

  function collectLocalTextRefs(fromFile, content) {
    for (const m of content.matchAll(localRefRe)) {
      const ref = (m[1] || m[2] || '').trim();
      if (!ref || /^(https?:|data:|#|mailto:)/i.test(ref)) continue;
      const target = path.resolve(path.dirname(fromFile), ref.split('?')[0].split('#')[0]);
      if (fs.existsSync(target) && isTextAsset(target)) textFiles.add(target);
    }
  }
  collectLocalTextRefs(absFile, fs.readFileSync(absFile, 'utf8'));
  for (const f of [...textFiles]) collectLocalTextRefs(f, fs.readFileSync(f, 'utf8'));

  if (!args.check) {
    fs.mkdirSync(vendorDir, { recursive: true });
    const urlToLocal = new Map();
    const queue = [...textFiles];
    const processed = new Set();

    while (queue.length) {
      const file = queue.shift();
      if (processed.has(file)) continue;
      processed.add(file);
      let content = fs.readFileSync(file, 'utf8');
      const urls = extractLoadBearingUrls(content);
      for (const url of urls) {
        if (!urlToLocal.has(url)) {
          try {
            const buf = await download(url);
            const name = vendorNameFor(url);
            const localPath = path.join(vendorDir, name);
            fs.writeFileSync(localPath, buf);
            urlToLocal.set(url, localPath);
            report.downloaded.push({ url, local: path.relative(deckDir, localPath), bytes: buf.length });
            // only CSS recurses: its url()/@import refs (font binaries, images) need vendoring;
            // recursing into JS/HTML would crawl unrelated pages
            if (/\.css$/i.test(name)) queue.push(localPath);
          } catch (e) {
            urlToLocal.set(url, null);
            report.failedDownloads.push({ url, error: e.message });
          }
        }
        const local = urlToLocal.get(url);
        if (local) {
          const rel = path.relative(path.dirname(file), local).split(path.sep).join('/');
          const before = content;
          content = content.split(url).join(rel);
          if (content !== before) report.rewrites++;
        }
      }
      if (file === absFile && args.backup && !fs.existsSync(absFile + '.orig')) {
        fs.writeFileSync(absFile + '.orig', fs.readFileSync(absFile));
      }
      fs.writeFileSync(file, content);
      textFiles.add(file);
    }
  }

  // --- Verification pass (always runs; the whole point is machine evidence) ---
  const verifyFiles = new Set(textFiles);
  if (fs.existsSync(vendorDir)) {
    for (const f of fs.readdirSync(vendorDir)) {
      const p = path.join(vendorDir, f);
      if (isTextAsset(f)) verifyFiles.add(p);
    }
  }
  for (const f of verifyFiles) {
    if (!fs.existsSync(f)) continue;
    const content = fs.readFileSync(f, 'utf8');
    for (const m of content.matchAll(EXT_RE)) {
      const url = m[0].replace(/[),.;]+$/, '');
      // license/comment URLs are inert; flag only load-bearing references
      const idx = m.index;
      const before = content.slice(Math.max(0, idx - 40), idx);
      if (/(?:href|src)\s*=\s*["']$|url\(\s*['"]?$|@import\s+["']$/.test(before)) {
        report.remainingExternal.push({ file: path.relative(deckDir, f), url: url.slice(0, 120) });
      }
    }
    // broken-local-ref check only for markup/stylesheets — JS is full of dynamic
    // src assignments and template literals that are not static references
    if (/\.(js|mjs)$/i.test(f)) continue;
    for (const m of content.matchAll(localRefRe)) {
      const ref = (m[1] || m[2] || '').trim();
      if (!ref || ref.includes('${') || /^(https?:|data:|#|mailto:|javascript:|\/\/)/i.test(ref)) continue;
      const target = path.resolve(path.dirname(f), ref.split('?')[0].split('#')[0]);
      if (!fs.existsSync(target)) {
        report.brokenLocalRefs.push({ file: path.relative(deckDir, f), ref });
      }
    }
  }

  report.status = (report.remainingExternal.length === 0 && report.brokenLocalRefs.length === 0 && report.failedDownloads.length === 0)
    ? 'PASS' : 'FAIL';
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log(`Deck bundle ${report.status} — report: ${reportPath}`);
  if (report.downloaded.length) console.log(`  vendored: ${report.downloaded.length} assets (${Math.round(report.downloaded.reduce((s, d) => s + d.bytes, 0) / 1024)} KB) → vendor/`);
  report.failedDownloads.forEach(d => console.log(`  DOWNLOAD FAIL ${d.url} — ${d.error}`));
  report.remainingExternal.slice(0, 10).forEach(r => console.log(`  EXTERNAL ${r.file}: ${r.url}`));
  report.brokenLocalRefs.slice(0, 10).forEach(r => console.log(`  BROKEN ${r.file}: ${r.ref}`));
  process.exit(report.status === 'PASS' ? 0 : 1);
})();
