---
name: Layout Overflow Prevention
description: Umbrella rule enforcing content containment across output formats; indexes per-format child rules and defines cross-format mandates
paths:
  - "output/**/*.html"
  - "output/**/*.js"
  - "output/**/*.py"
---

# Layout Overflow Prevention

## Applicability

- Applies to: `web-developer`, `visual-designer`, `presentation-writer`, `qa-reviewer`

## Scope

This umbrella rule defines the mandates that apply to every output format (HTML, PPTX, PDF) and indexes the format-specific child rules. Format-specific containment constraints (text sizes, margins, containers, decoration) live in the child rules; read the child for the format you are producing. You must comply with BOTH this umbrella rule and the child rule for your format.

## Child Rule Index

| Format | Child Rule | Covers |
|--------|-----------|--------|
| HTML (reveal.js) | `rules/layout-overflow/html.md` | em text sizes, content containers, CJK, architecture diagrams, slide baseline, decorative/absolutely-positioned element containment |
| PPTX (PptxGenJS) | `rules/layout-overflow/pptx.md` | safe content area, pt text sizes, table colW, text-box containment, color format, object-reuse prohibition |
| PDF (reportlab) | `rules/layout-overflow/pdf.md` | page dimensions/margins, pt text sizes, CJK font registration, CJK leading, paragraph containment, page-break control |

## Cross-Format Mandates

### Maximum Content Per Slide/Section

Regardless of output format, each slide (or corresponding PDF section) must not exceed:

- 6 bullet points of body text
- 50 words of body text (CJK characters count as 1 word per 2 characters for this rule)
- 1 key message per slide

### Platform Table Standard

When presenting platform comparison data (common in tech bid presentations), use a consistent table structure across all formats:

- Column 1: Platform name (fixed width, ~15% of content width)
- Remaining columns: equal width distribution
- Header row: bold, contrasting background
- Body rows: alternating subtle background for readability

### Consistent Color Palette

All three output formats must use the same color palette. Define colors once in the project specification and reference by name:

| Name | Hex | Usage |
|------|-----|-------|
| Primary | 1A2744 | Backgrounds, titles |
| Secondary | 0891B2 | Accents, highlights |
| Accent | 06B6D4 | Interactive elements, links |
| Light BG | F0F9FF | Card backgrounds |
| Dark Text | 1E293B | Headings |
| Body Text | 475569 | Paragraphs |
| Border | E2E8F0 | Table borders, dividers |

### Enforcement

For HTML deliverables, compliance with the overflow constraints is enforced automatically by `rules/layout-gate.md`. The gate's `layout-gate-report.json` is the source of truth — Web Developer cannot mark complete and QA Reviewer cannot mark PASS without it. PPTX and PDF deliverables remain enforced by manual inspection until format-specific gates exist; agents producing them must include rendered samples (PNG export of every slide / page) in the deliverable for QA inspection.

## Violation Determination

Cross-format and index-level conditions (format-specific violations live in each child rule):

- Any slide exceeds 6 bullet points or 50 words of body text → Violation
- Output formats use different color palettes within the same project → Violation
- QA Reviewer approves a deliverable where any content is clipped, truncated, or overflows its container → Violation
- HTML deliverable shipped without `layout-gate-report.json` showing `"status": "PASS"` (see `rules/layout-gate.md`) → Violation
- PPTX or PDF deliverable shipped without per-slide PNG samples for QA inspection → Violation
- A deliverable produced without consulting the format's child rule under `rules/layout-overflow/` → Violation

## Exceptions

- Format-specific exceptions are defined in each child rule under `rules/layout-overflow/`.
- This umbrella defines no cross-format exceptions beyond those.
