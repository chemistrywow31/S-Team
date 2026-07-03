---
name: Deck Bundle
description: Makes an HTML deck folder-portable and offline-safe — vendors every CDN asset (reveal.js, Google Fonts) locally, rewrites to relative paths, and verifies zero external references remain
allowed-tools: ["Bash", "Read", "Write"]
argument-hint: "<path-to-index.html>"
---

# Deck Bundle

## Purpose

Decks delivered as folder bundles kept breaking offline: CDN reveal.js and Google Fonts need
network (trendmicro FINDING-P5-003/P5-004), and the lesson-20260506 delivery decision already
mandated "local reveal vendor files + relative-path assets" — but it was applied by hand each
time. This skill scripts it: download every external asset into `vendor/`, rewrite references
(including `url(...)` inside downloaded CSS — Google Fonts CSS pulls woff2 files that must be
vendored too), and produce machine evidence that the deck opens with the network cable unplugged.

## When to Use

- Web Developer: before delivering any HTML deck as a folder/zip, or generating a PDF from it
  (Puppeteer PDF generation with unreachable Google Fonts silently falls back to system fonts).
- QA Reviewer / Coordinator: run `--check` to verify a deck claimed offline-safe actually is.
- Not needed when the deck is built from `node_modules/reveal.js` with relative paths and no
  webfont CDN — run `--check` once to prove it, then cite the report.

## Invocation

```bash
# bundle: download externals to vendor/, rewrite refs, verify
node .claude/skills/deck-bundle/scripts/bundle-deck.cjs output/foo/index.html

# verify-only: no downloads, no rewrites — just evidence
node .claude/skills/deck-bundle/scripts/bundle-deck.cjs output/foo/index.html --check
```

Flags: `--check` (verify-only), `--no-backup` (skip `index.html.orig`).

## What It Does

1. Scans the entry HTML plus every local CSS/JS it references for `http(s)://` URLs.
2. Downloads each to `<deck-dir>/vendor/<hash>-<name>` (Chrome UA, so Google Fonts serves woff2).
3. Rewrites references to relative paths. Downloaded CSS re-enters the queue so its own
   `url(...)` references (font binaries, images) get vendored and rewritten as well.
4. Verifies — this pass always runs, also under `--check`:
   - zero load-bearing external references remain (`href=`/`src=`/`url()`/`@import`;
     URLs inside comments/licenses are ignored)
   - every local reference resolves to an existing file (catches the broken-relative-path
     class of folder-bundle breakage)
5. Writes `bundle-report.json`; `"status": "PASS"` is the delivery evidence.

## Report Schema — bundle-report.json

```json
{
  "file": "output/foo/index.html",
  "mode": "bundle | check",
  "status": "PASS | FAIL",
  "downloaded": [{ "url": "https://…", "local": "vendor/ab12cd34-reveal.css", "bytes": 12345 }],
  "rewrites": 6,
  "failedDownloads": [],
  "remainingExternal": [{ "file": "index.html", "url": "https://…" }],
  "brokenLocalRefs": [{ "file": "local.css", "ref": "missing-asset.png" }]
}
```

## Exit Codes

- `0` — PASS: offline-safe (no external refs, no broken local refs, no failed downloads)
- `1` — FAIL: see report
- `2` — invocation error

## Order of Operations

Bundle BEFORE the layout/render gates' final run and before PDF export: vendoring changes which
font files actually load, which changes text metrics, which can change overflow results. The
mandatory gate reports must be produced from the deck as delivered — i.e., after bundling. Reports
whose timestamps predate the bundle rewrite are stale evidence under `rules/layout-gate.md`.

## Limitations

- No font subsetting — CJK families (Noto Sans TC) vendor all unicode-range woff2 slices, a few
  MB. Acceptable for folder delivery; do not ship over email without zipping.
- PPTX font portability is NOT covered: a .pptx references installed fonts by name and cannot
  bundle them this way (trendmicro FINDING-P5-003 — CJK needs viewer-side fonts). State the font
  requirement in the delivery notes instead.
- Requires network at bundle time, obviously; `--check` never needs it.

## Examples

### Normal Case

```
$ node .claude/skills/deck-bundle/scripts/bundle-deck.cjs output/foo/index.html
Deck bundle PASS — report: output/foo/bundle-report.json
  vendored: 14 assets (2311 KB) → vendor/
$ echo $?
0
```

Re-run both HTML gates after bundling, then deliver the folder.

### Rejection Case (broken local ref found during verify)

```
$ node .claude/skills/deck-bundle/scripts/bundle-deck.cjs output/foo/index.html --check
Deck bundle FAIL — report: output/foo/bundle-report.json
  BROKEN local.css: missing-asset.png
$ echo $?
1
```

Fix the reference (or add the asset), re-run until PASS.
