---
name: PPTX Render Gate
description: Automated visual-evidence gate for .pptx deliverables — LibreOffice render pipeline, unsupported-shape lint, blank-slide detection, and a one-artifact contact sheet
allowed-tools: ["Bash", "Read", "Write"]
argument-hint: "<path-to.pptx>"
---

# PPTX Render Gate

## Purpose

HTML decks have two mechanical gates (layout, render-content). PPTX deliverables had none — on
qic-ai-travel-review-deck, qic-ai-travel-review-tech-deck and chung-hsing-ai-collaboration-proposal
the team ran the same manual loop each time: PPTX → LibreOffice → PDF → per-slide PNG → eyeball
(`.worklog/202605/qic-ai-travel-review-deck/phase-6-5-process-review/process-review.md`). The artifact
classes found were also recurring: an unsupported `arc` preset shape rendered broken
(qic-tech-deck Phase 6 findings), diagram nodes escaping their cards, and generic fallback layouts.
This gate scripts the render pipeline, lints for known-broken shapes, detects blank renders, and
produces a single contact sheet so the review is one look instead of N file-opens.

## When to Use

- Web Developer must run this gate before marking any `.pptx` deliverable task `completed`.
- Coordinator must confirm `pptx-gate-report.json` exists with `status: "PASS"` before the
  Phase 5 → Phase 6 transition for any project that ships a PPTX format.
- QA Reviewer starts the PPTX visual pass from `contact-sheet.html` / `contact-sheet.png`,
  not from opening slide PNGs one by one.

## Inputs

- `<path-to.pptx>` — the deliverable
- Environment: LibreOffice (`soffice`), poppler (`pdftoppm`), `unzip`. Puppeteer optional —
  without it the blank-slide ink check is reported `SKIPPED` (the gate still converts, lints,
  checks page parity, and builds the HTML contact sheet).

## Invocation

```bash
node .claude/skills/pptx-render-gate/scripts/pptx-gate.cjs output/foo/deck.pptx
```

Optional flags:
- `--out <path>` — report path (default: `<pptx-dir>/pptx-gate-report.json`)
- `--workdir <dir>` — render workspace (default: `<pptx-dir>/pptx-gate-renders/<name>/`)
- `--dpi <n>` — raster resolution (default 96; raise to 150 for fine-detail review)

## What the Gate Checks

1. **Shape lint** — scans `ppt/slides/slide*.xml` for preset geometries known to render broken
   in LibreOffice/PDF export. Current list: `arc` (evidence: qic-tech-deck artifact). When a new
   artifact class is confirmed, add its preset to `UNSUPPORTED_PRESETS` in the script — one line
   per incident.
2. **Conversion** — `soffice --headless` with an isolated user profile (parallel-safe). A failed
   conversion is an immediate FAIL.
3. **Page parity** — slide count in the pptx XML must equal rendered PDF page count; a mismatch
   means LibreOffice dropped or split slides.
4. **Ink check** — per-slide blankness measurement using the same thresholds as the
   render-content-gate (`foregroundRatio < 0.004` against the corner-modal background ⇒ BLANK).
5. **Contact sheet** — `contact-sheet.html` (+ `contact-sheet.png` when puppeteer is available)
   grids every slide into one reviewable artifact.

## What the Gate Does NOT Prove

LibreOffice rendering approximates PowerPoint rendering; it is not pixel-identical (fonts
especially — PPTX CJK relies on viewer-side fonts, see trendmicro FINDING-P5-003). The gate
catches structural artifact classes; style-level judgment (node-inside-card containment, layout
quality) still requires the QA Reviewer to look at the contact sheet. A gate PASS plus a contact
sheet review is the acceptance standard — a gate PASS alone is not.

## Report Schema — pptx-gate-report.json

```json
{
  "file": "output/foo/deck.pptx",
  "timestamp": "2026-07-03T12:00:00.000Z",
  "status": "PASS | FAIL",
  "renderer": "libreoffice",
  "checks": {
    "shapeLint":  { "status": "PASS|FAIL", "findings": [{ "slide": 2, "preset": "arc", "count": 1 }] },
    "convert":    { "status": "PASS|FAIL", "pdf": "..." },
    "pageParity": { "status": "PASS|FAIL", "slidesInPptx": 20, "pagesRendered": 20 },
    "inkCheck":   { "status": "PASS|FAIL|SKIPPED", "blankSlides": [{ "slide": 3, "foregroundRatio": 0 }] }
  },
  "artifacts": { "pdf": "...", "contactSheetHtml": "...", "contactSheetPng": "...", "slidePngs": ["..."] }
}
```

## Exit Codes

- `0` — PASS (all checks green; SKIPPED ink check does not fail the gate but is visible in the report)
- `1` — FAIL (lint hit, conversion failure, page mismatch, or blank slide)
- `2` — invocation / environment error (file missing, soffice/pdftoppm/unzip absent)

## Examples

### Normal Case

```
$ node .claude/skills/pptx-render-gate/scripts/pptx-gate.cjs output/foo/deck.pptx
PPTX gate PASS — report: output/foo/pptx-gate-report.json
  contact sheet: output/foo/pptx-gate-renders/deck/contact-sheet.html
$ echo $?
0
```

Web Developer references the report path in the completion summary; QA Reviewer opens the contact sheet.

### Rejection Case (fixtures)

```
$ node .claude/skills/pptx-render-gate/scripts/pptx-gate.cjs .claude/skills/pptx-render-gate/fixtures/bad-deck.pptx
PPTX gate FAIL — report: .../fixtures/pptx-gate-report.json
  shapeLint: slide 2 uses unsupported preset "arc" ×1
  inkCheck: slide 3 is BLANK (foregroundRatio=0)
$ echo $?
1
```

The producer replaces the arc with a supported shape (e.g. a custom freeform or a pie segment),
fills or deletes the blank slide, and reruns until PASS. `fixtures/good-deck.pptx` and
`fixtures/bad-deck.pptx` are the gate's own regression fixtures — rerun both after editing the script.

### Edge Case (no puppeteer in environment)

The gate still converts, lints, checks parity, and writes the HTML contact sheet; the report shows
`inkCheck: SKIPPED` with the reason. Treat SKIPPED as "blank detection not performed", not as PASS —
QA must then check for blank slides on the contact sheet manually.
