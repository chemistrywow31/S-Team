---
name: Render Content Gate
description: Automated runtime gate that screenshots every slide and fails any deck whose slides render blank, catching all-white output that the geometry layout gate cannot see
allowed-tools: ["Bash", "Read", "Write"]
argument-hint: "<path-to-deck.html>"
---

# Render Content Gate

## Purpose

The layout gate proves each slide FITS its container. It cannot prove each slide has anything VISIBLE inside it. On 2026-05 the team shipped a deck that passed the layout gate and then rendered all-white from slide 2 onward (`.worklog/202605/session-ledger.md:73` — user: "除了第一頁 全部一片白" — after a PASS at `lesson-20260506-speaking-deck/phase-6-qa/findings.md:3-7`). This gate closes that hole: it screenshots every slide and measures rendered ink, so a geometry PASS can never again substitute for proof that content actually painted.

## When to Use

- Web Developer must run this gate, alongside the layout gate, before marking any HTML deck task `completed`.
- Coordinator must confirm `render-gate-report.json` exists with `status: "PASS"` before the Phase 5 → Phase 6 transition. A layout-gate PASS is NOT sufficient — both reports must be green.
- QA Reviewer must read this report before scoring visual quality.

## Inputs

- `<path-to-deck.html>` — entry HTML of the deck. Reveal.js decks are navigated slide-by-slide; non-reveal HTML falls back to `<section>` / `[data-slide]` blocks, else the whole `<body>`.
- The project must have `puppeteer` installed (present in `presentation-studio/node_modules`; resolved from the deck dir or any ancestor).

## Invocation

```bash
node .claude/skills/render-content-gate/scripts/render-gate.cjs <path-to-deck.html>
```

Optional flags:
- `--out <path>` — override the report path (default: `<deck-dir>/render-gate-report.json`)
- `--screenshots <dir>` — override the blank-slide screenshot dir (default: `<deck-dir>/render-gate-screenshots/`)

## Blankness Threshold

For each slide the gate captures a 1920×1080 screenshot and computes two independent signals. Blankness is viewport-independent, so a single authored viewport is used.

1. `foregroundRatio` — fraction of sampled pixels that differ from the slide's own background color (background = modal color of the four screenshot corners; a pixel is ink when `|dR|+|dG|+|dB| > 24`; screenshot downsampled to 480px wide for speed).
2. `visibleTextLength` — count of painted, non-hidden characters in the slide (text under `display:none`, `visibility:hidden`, `opacity:0`, or a zero-size box is excluded — so white-on-white and hidden text count as zero).

A slide is **BLANK** when BOTH are near-zero:

```
BLANK  ⇔  foregroundRatio < 0.004  AND  visibleTextLength < 3
```

Requiring both signals prevents false positives: a single word or one image paints ink above 0.4%, so real-but-sparse slides pass. Only genuinely empty renders (the incident class) trip both thresholds. Known limitation: dark-styled text that is visible in the DOM yet painted the same color as its background (true color-on-color with no `hidden`/`opacity` flag) is counted as text and would pass — the template pipeline paints dark ink on light backgrounds, so this case does not occur in practice.

## Report Schema — render-gate-report.json

```json
{
  "file": "output/foo/index.html",
  "timestamp": "2026-07-03T00:00:00.000Z",
  "engine": "reveal.js | generic-html",
  "thresholds": { "INK_MIN": 0.004, "TEXT_MIN": 3, "PIXEL_DELTA": 24 },
  "status": "PASS | FAIL",
  "summary": { "slidesTested": 14, "slidesBlank": 0, "status": "PASS | FAIL" },
  "slides": [
    { "idx": 0, "blank": false, "foregroundRatio": 0.0731, "visibleTextLength": 214, "title": "Speaking Practice" }
  ]
}
```

Screenshots of every blank slide are written to `render-gate-screenshots/slide-NN.png` as revision evidence.

## Exit Codes

- `0` — PASS: every slide has visible rendered content.
- `1` — FAIL: at least one slide is BLANK, or the deck did not load (`reason: "deck-did-not-load"`).
- `2` — invocation error (no deck argument, file missing, puppeteer absent).

Process exit code is `0` only on PASS, so CI and the coordinator can gate on `$?`.

## Integration Point

This gate is the SECOND mandatory evidence file for any HTML deck, run in parallel with the layout gate. The layout gate answers "does it fit?"; the render gate answers "is anything there?". A geometry PASS never substitutes for a render PASS — both `layout-gate-report.json` and `render-gate-report.json` must show `status: "PASS"` before Phase 5 → Phase 6. See `rules/layout-gate.md`.

## Examples

### Normal Case (deck renders, all slides have content)

```
$ node .claude/skills/render-content-gate/scripts/render-gate.cjs output/lesson-20260506-speaking-deck/index.html
Render gate PASS — report: output/lesson-20260506-speaking-deck/render-gate-report.json
  slidesTested=14 slidesBlank=0
$ echo $?
0
```

Web Developer references the report path in the completion summary and proceeds.

### Edge Case (non-reveal HTML deck)

When the deck exposes no `Reveal` global, the gate reports `engine: "generic-html"` and scans `<section>` / `[data-slide]` blocks (or the whole `<body>` if none), applying the same blankness test. A one-page scrolling report is measured as a single slide.

```
$ node .claude/skills/render-content-gate/scripts/render-gate.cjs output/ai-progress-report/index.html
Render gate PASS — report: output/ai-progress-report/render-gate-report.json
  slidesTested=3 slidesBlank=0
```

### Rejection / Failure Case (slides 2..N render blank — the incident class)

```
$ node .claude/skills/render-content-gate/scripts/render-gate.cjs .claude/skills/render-content-gate/fixtures/blank-slides.html
Render gate FAIL — report: .../fixtures/render-gate-report.json
  slidesTested=4 slidesBlank=3
  BLANK slide 2 (foregroundRatio=0, text=0)
  BLANK slide 3 (foregroundRatio=0, text=0)
  BLANK slide 4 (foregroundRatio=0, text=0)
$ echo $?
1
```

The fixture's slides 2–4 hold well-formed, non-overflowing DOM content that never paints (`visibility:hidden`) — a case the layout gate PASSES. The deck is BLOCKED: Web Developer fixes the rendering defect and reruns until PASS. Content that only reaches exit code 1 must never ship.
