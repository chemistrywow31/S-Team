---
name: Layout Gate
description: Automated runtime gate that measures per-slide overflow across multiple viewports and produces machine-readable evidence
allowed-tools: ["Bash", "Read", "Write"]
argument-hint: "<path-to-index.html>"
---

# Layout Gate

## Purpose

Replace self-reported "I checked the browser" claims with automated runtime measurement. This gate is the only way to mark `rules/responsive-auto-fit.md` and `rules/layout-overflow-prevention.md` as passed for any HTML deliverable.

## When to Use

- Web Developer must run the gate before marking any HTML deliverable task `completed`.
- QA Reviewer must read the gate's `layout-gate-report.json` before scoring Visual Quality.
- Coordinator must verify the report file exists and has `status: "PASS"` before transitioning Phase 5 → Phase 6.

## Inputs

- `<path-to-index.html>` — the entry HTML file of a reveal.js presentation
- The presentation directory must have `puppeteer` available (run `npm install puppeteer` once per project)

## Invocation

```bash
node .claude/skills/layout-gate/scripts/layout-gate.cjs <path-to-index.html>
```

Optional flags:
- `--out <path>` — override the JSON report path (default: `<index-dir>/layout-gate-report.json`)
- `--screenshots <dir>` — override the FAIL-screenshot directory (default: `<index-dir>/layout-gate-screenshots/`)

## Outputs

### layout-gate-report.json

```json
{
  "file": "output/example/index.html",
  "timestamp": "2026-04-28T12:34:56.000Z",
  "status": "PASS | FAIL",
  "summary": {
    "viewportsTested": 4,
    "viewportsFailed": 0,
    "totalOverflowingSlides": 0
  },
  "viewports": {
    "1920x1080": { "status": "PASS|FAIL", "autoFitDetected": true, "slidesFailed": 0, "slides": [...] }
  }
}
```

### layout-gate-screenshots/

Per-viewport directory containing PNG screenshots of every FAIL slide. Reviewers attach these to revision tickets.

## What the Gate Checks

For each of four viewports (1920×1080, 1366×768, 1280×720, 960×700 authored), iterate every slide and verify:

1. `scrollHeight ≤ clientHeight + 2px` (no vertical clipping)
2. `scrollWidth ≤ clientWidth + 2px` (no horizontal clipping)
3. No descendant element extends > 2px past the slide bounding box
4. `Reveal.isReady()` resolves within 8s (presentation actually loads)
5. Either per-slide auto-fit JS is installed, OR every slide already fits — if a viewport fails AND auto-fit is missing, advisory points at `rules/responsive-auto-fit.md` Layer 3

## Exit Codes

- `0` — every viewport PASS (deliverable is shippable on layout grounds)
- `1` — at least one FAIL (deliverable is blocked; read report and revise)
- `2` — invocation error (missing file, puppeteer absent, etc.)

## Companion Snippet

`scripts/auto-fit-snippet.html` contains the canonical Layer 3 auto-fit `<script>` block. Web Developer copies it directly into `index.html` after `Reveal.initialize()`. Do not write a custom variant — variants drift and the gate's detection regex may miss them.

## Examples

### Normal Case (Web Developer runs gate, all PASS)

```
$ node .claude/skills/layout-gate/scripts/layout-gate.cjs output/foo/index.html
Layout gate PASS — report: output/foo/layout-gate-report.json
$ echo $?
0
```

Web Developer marks task complete and references the report path in the completion summary.

### Edge Case (one viewport overflows by a few pixels)

```
$ node .claude/skills/layout-gate/scripts/layout-gate.cjs output/foo/index.html
Layout gate FAIL — report: output/foo/layout-gate-report.json
  1280x720: 2/15 slides overflow
$ jq '.viewports["1280x720"].slides[] | select(.failed) | {idx, title, overflowCount}' output/foo/layout-gate-report.json
{ "idx": 7, "title": "Architecture Overview", "overflowCount": 3 }
```

Web Developer revises the offending slide using `glass-sm` compaction (per `rules/presentation-quality.md` Dense Content Compaction), reruns gate, only ships when all PASS.

### Rejection Case (presentation never loads)

```
$ node .claude/skills/layout-gate/scripts/layout-gate.cjs output/broken/index.html
Layout gate FAIL — report: output/broken/layout-gate-report.json
  1920x1080: ?/? slides overflow
$ jq '.viewports["1920x1080"].reason' output/broken/layout-gate-report.json
"reveal-not-ready"
```

Web Developer must fix the JS / module / network error before any layout work. This is a P0 defect — Reveal didn't initialise.
