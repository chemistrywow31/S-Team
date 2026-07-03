---
name: Presentation Quality Standard
description: Every slide must meet strict content density, visual coverage, accessibility, and speaker notes requirements
paths:
  - "output/**/*.html"
---

# Presentation Quality Standard

## Applicability

- Applies to: `presentation-writer`, `visual-designer`, `web-developer`, `qa-reviewer`

## Rule Content

### Single Message Per Slide

Each slide must convey exactly one key message. Do not combine multiple topics or arguments on a single slide. State the key message in the slide title or as the first line of body text.

### Content Density Limits

- Each slide must not exceed 6 bullet points of body text.
- Each slide must not exceed 50 words of body text (excluding the slide title and speaker notes).
- If content exceeds these limits, split it across multiple slides.

### Speaker Notes Requirement

Every content slide must have speaker notes. Speaker notes must:
- Expand on the slide's key message with supporting detail
- Contain at least 30 words per slide
- Not duplicate the slide body text verbatim

Title slides, section divider slides, and closing/Q&A slides are exempt from speaker notes.

### Visual Element Coverage

Visual elements (images, diagrams, charts, icons) must be present on at least 60% of all content slides. Count content slides only (exclude title, divider, and closing slides).

### Image Relevance

All generated or selected images must directly support the slide's key message. Decorative-only stock imagery that has no connection to the slide content is prohibited.

### Accessibility — Color Contrast

All text in the presentation must meet WCAG AA contrast ratio: 4.5:1 minimum for normal text, 3:1 minimum for large text (18px+ or 14px+ bold).

### Layout Consistency

All slides of the same type must use the same layout structure. Specifically:
- Product introduction slides must share a single unified header format (icon + title on one line, subtitle on one line below).
- Section divider slides must use the same typographic hierarchy.
- Grid-based slides (e.g., 3-column comparison) must use the same column widths, gap sizes, and card styles.

Do not mix one-line and two-element-per-line headers across slides of the same category. Define a reusable CSS class for each slide type and apply it consistently.

### SVG Diagram Sizing

All inline SVG diagrams must use responsive width. Set `width="100%"` with an optional `max-width` constraint on the SVG element. Fixed pixel widths below 300px on SVG elements are prohibited.

Minimum font sizes inside SVG diagrams:
- Primary labels (node names, titles): `font-size` 14 or above
- Secondary labels (subtitles, annotations): `font-size` 12 or above
- Tertiary labels (captions): `font-size` 11 or above

SVG circle and rect node sizes must be proportional to the viewBox — a node must occupy at least 8% of the viewBox width. If a diagram appears small within its container, increase the viewBox element sizes rather than shrinking the viewBox.

### Dense Content Compaction

When a slide contains 3 or more stacked card elements (glass panels, list items with boxes), apply compact styling to prevent bottom clipping:
- Use `glass-sm` (padding 14–16px) instead of `glass` (padding 28px)
- Set gap between cards to 10–12px (not 16px+)
- Reduce body font size to 0.85–0.88em
- Convert multi-line secondary text to single-line using delimiters (e.g., `｜`) when each line is short
- Verify the last card is fully visible at 1920×1080 before marking the task complete

### Viewport Containment

All slide content must fit within the visible viewport (the reveal.js configured `width` × `height`) without scrolling or clipping. Apply the following CSS to every `section`:
- `height: 100%; overflow: hidden;`
- `display: flex; flex-direction: column; justify-content: center;`
- Use `flex: 1; min-height: 0;` on scrollable child containers (grids, tables) to prevent overflow.

If content exceeds the viewport after applying density limits, split it into multiple slides. The Web Developer must visually verify every slide at the configured resolution before marking the task complete.

### Responsive Auto-Fit

Every HTML presentation must include a responsive auto-fit mechanism. Reference `rules/responsive-auto-fit.md` for the complete three-layer specification (CSS overflow prevention, reveal.js scale range, per-slide auto-fit JavaScript). Compliance is enforced automatically by `rules/layout-gate.md` — Web Developer must run the gate and produce a PASS report before any HTML deliverable can be marked complete. Manual viewport-resize self-checks are not accepted as evidence.

### Brand Name Case Sensitivity

All company names, product names, and brand names must use their official casing exactly. Examples: "TutorABC" (not "tutorABC", "TUTORABC", or "Tutorabc"). The Coordinator must provide a brand name reference list at project start. The QA Reviewer must verify every occurrence of brand names in the final deliverable.

### HTML Presentation Compatibility

HTML-format presentations must be responsive and render correctly in the latest stable versions of Chrome and Firefox. The Web Developer must test in both browsers before marking the task complete.

### Visual Effects Quality

All HTML presentations must comply with `rules/visual-effects-standard.md`. Key requirements: 80%+ effect coverage, GPU-only continuous animations, palette-compliant glow colors, transition diversity, `data-auto-animate`, `prefers-reduced-motion`, 60fps target, WCAG 2.3.1 flash safety. The QA Reviewer must verify each item.

## Violation Determination

- A slide has more than 6 bullet points → Violation
- A slide body text exceeds 50 words → Violation
- A content slide has no speaker notes → Violation
- 3 or more consecutive content slides have no visual elements → Violation
- Visual element coverage across all content slides falls below 60% → Violation
- A slide uses a decorative stock image unrelated to its key message → Violation
- Text contrast ratio is below 4.5:1 for normal text → Violation
- HTML presentation fails to render in Chrome or Firefox → Violation
- Any visual effects violation defined in `rules/visual-effects-standard.md` → Violation
- Two product introduction slides use different header layouts → Violation
- An inline SVG uses a fixed `width` below 300px (e.g., `width="180"`) instead of responsive `width="100%"` → Violation
- SVG primary label font-size is below 14 → Violation
- A slide with 3+ stacked cards uses `glass` (28px padding) instead of `glass-sm` with compact spacing → Violation
- The bottom card on any slide is partially or fully clipped at 1920×1080 → Violation
- Any slide content extends beyond the configured viewport and requires scrolling or is clipped → Violation
- HTML presentation missing responsive auto-fit mechanism (see `rules/responsive-auto-fit.md`) → Violation
- A brand name appears with incorrect casing (e.g., "tutorABC" instead of "TutorABC") → Violation
- QA Reviewer approves a presentation that violates any of the above → Violation
