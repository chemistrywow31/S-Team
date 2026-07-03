---
name: Layout Gate Mandate
description: Every HTML presentation must pass the automated layout-gate runtime check before delivery; agents may not self-attest layout compliance
paths:
  - "output/**/*.html"
---

# Layout Gate Mandate

## Applicability

- Applies to: `web-developer`, `qa-reviewer`, `coordinator`

## Rule Content

### The Gate Is Mandatory

Every HTML presentation deliverable must pass `skills/layout-gate/scripts/layout-gate.cjs` at all configured viewports — currently six: four landscape (1920×1080, 1366×768, 1280×720, 960×700) and two portrait (768×1024, 390×844) — before any agent may mark the deliverable's task `completed`. Self-attestation ("I opened it in the browser and it looked fine") is not accepted as evidence and is explicitly distrusted by this rule.

### Required Artifacts

For every HTML deliverable, the working tree must contain:

1. `<deliverable-dir>/layout-gate-report.json` — geometry gate, produced by the gate script with top-level `"status": "PASS"`
2. `<deliverable-dir>/render-gate-report.json` — content gate, produced by `skills/render-content-gate/scripts/render-gate.cjs` with top-level `"status": "PASS"`, proving rendered slide content (not just geometry) is present and correct
3. `<deliverable-dir>/layout-gate-screenshots/` — empty if PASS, or per-viewport PNGs of every failing slide if FAIL was ever recorded during iteration (the directory may be deleted only after a clean PASS run)

Geometry and content are two independent, both-mandatory gates. A `layout-gate-report.json` PASS does NOT satisfy this rule on its own: if `render-gate-report.json` is missing or its `status` is `FAIL`, the overall gate is FAIL and the deliverable may not be marked complete. Visual self-attestation is rejected for both gates.

Each report's timestamp must be newer than the most recent modification time of any file in the deliverable directory. Stale reports do not count.

### Web Developer Obligations

Before sending the Phase 5 completion summary to the Coordinator, the Web Developer must:

1. Install the canonical Layer 3 auto-fit JS by copying `skills/layout-gate/scripts/auto-fit-snippet.html` verbatim into `index.html` immediately after `Reveal.initialize()`. Do not write a custom variant.
2. Run `node .claude/skills/layout-gate/scripts/layout-gate.cjs <deliverable>/index.html`.
3. If the gate exits non-zero, revise the offending slides (use `glass-sm` compaction per `rules/presentation-quality.md` Dense Content Compaction, split overflowing slides, or shrink content) and re-run until it exits zero.
4. Cite the report path in the completion summary with the line `Layout gate: PASS (report: <path>)`.

### QA Reviewer Obligations

The QA Reviewer must read `layout-gate-report.json` as the sole source of truth for the Visual Quality category's overflow check. Specifically:

1. If the report file is missing → assign a Critical severity issue to the Web Developer with description "Layout gate report absent — deliverable cannot be reviewed".
2. If `status` is `FAIL` → assign a Critical severity issue per failing viewport, listing each failing slide's `idx` and `title` from the JSON.
3. If the report timestamp is older than any source file in the deliverable directory → treat as missing (Critical).
4. The QA Reviewer must not visually inspect slides instead of reading the report. The critical purpose of this rule is to remove visual self-attestation from the review surface.

### Coordinator Obligations

The Coordinator must not transition Phase 5 → Phase 6 until:

1. The Web Developer's completion summary cites BOTH a `layout-gate-report.json` path AND a `render-gate-report.json` path
2. The Coordinator has read both files and confirmed `"status": "PASS"` in each. A geometry PASS combined with a missing or failing `render-gate-report.json` is a gate FAIL — do not transition.

If the Web Developer reports completion without both reports, the Coordinator must respond with `BLOCKED` and request the missing gate output. Do not advance the workflow on faith.

### What the Gate Does Not Cover

The gate measures runtime overflow and text/media collision at six viewports against `<section>` bounds. It does not catch:

- Content density violations (still enforced by `rules/presentation-quality.md`)
- Text size violations (still enforced by `rules/layout-overflow-prevention.md`)
- Visual effect quality (still enforced by `rules/visual-effects-standard.md`)
- PPTX or PDF deliverables (the gate is HTML-only; PPTX/PDF agents must follow `rules/layout-overflow-prevention.md` text/box constraints and generate at least one full-deck PNG export for QA inspection)

These remain in force. The gate is added to, not replacing, existing rules.

### Tier 1 Carve-Out

A single-page HTML deliverable that does not use reveal.js (e.g., a static landing page POC) is exempt from this rule. The exemption must be declared explicitly in the Web Developer's completion summary with the reason "Not a reveal.js presentation". Any deliverable that loads `reveal.js` is subject to the gate without exception.

## Violation Determination

- HTML presentation deliverable submitted without `layout-gate-report.json` in its directory → Violation
- `layout-gate-report.json` exists but `status` is `FAIL` and the deliverable was nevertheless marked complete → Violation
- HTML deliverable marked complete with `layout-gate-report.json` PASS but no `render-gate-report.json` in its directory → Violation
- `render-gate-report.json` exists but `status` is `FAIL` and the deliverable was nevertheless marked complete → Violation
- Web Developer's completion summary lacks the `Layout gate: PASS (report: ...)` line for an HTML deliverable → Violation
- QA Reviewer scores Visual Quality without reading `layout-gate-report.json` → Violation
- Coordinator advances to Phase 6 without confirming `"status": "PASS"` in the report → Violation
- Web Developer copies a hand-rolled auto-fit JS variant instead of `auto-fit-snippet.html` and the gate's `autoFitDetected` field is `false` → Violation
- Report timestamp predates any source file in the deliverable directory (stale evidence) → Violation

## Exceptions

- Tier 1 carve-out (non-reveal single-page HTML) per the section above.
- During emergency hotfix delivery explicitly authorized by the user, the Coordinator may waive the gate but must (a) record the waiver in the worklog `decisions.md` with the user's authorization quoted verbatim, and (b) re-run the gate within 24 hours and ship a follow-up revision if it fails.

Tradeoff: Running the gate adds 30–90s to every HTML delivery cycle and requires `puppeteer` to be installed in the project (~150MB). The cost is justified because automated measurement is the only mechanism that has actually caught overflow defects in this team's history — three of the last three audited deliverables had gate-detectable issues that visual inspection had missed.
