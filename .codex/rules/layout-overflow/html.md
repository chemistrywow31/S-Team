---
name: Layout Overflow Prevention — HTML
description: Content containment and overflow-prevention constraints for reveal.js HTML presentations
paths:
  - "output/**/*.html"
---

# Layout Overflow Prevention — HTML

Child of `.codex/rules/layout-overflow-prevention.md` (the umbrella). Applies to reveal.js HTML presentations. You must also comply with the umbrella's cross-format mandates and enforcement.

## Applicability

- Applies to: `web-developer`, `visual-designer`, `presentation-writer`, `qa-reviewer`

## Rule Content

### Text Size Constraints

All text must use relative units (`em`) and stay within these maximums:

| Element | Maximum Size | Recommended Range |
|---------|-------------|-------------------|
| Slide title (h2) | 2.2em | 1.8–2.2em |
| Subtitle (h3) | 1.3em | 1.0–1.3em |
| Body text | 0.85em | 0.7–0.85em |
| List items | 0.78em | 0.65–0.78em |
| Table cells | 0.65em | 0.55–0.65em |
| Captions / footnotes | 0.6em | 0.5–0.6em |

### Content Container Rules

Every content section inside a slide must apply:

```css
width: 90%;
max-width: 900px;
margin: 0 auto;
box-sizing: border-box;
```

Glass cards and content blocks must include `overflow: hidden` and `min-height: 0`.

### CJK Text Handling

Chinese, Japanese, and Korean text must use `line-height: 1.6` minimum (1.8 recommended) and `word-break: break-all` on table cells to prevent horizontal overflow.

### Architecture Diagrams

Render architecture diagrams using HTML/CSS boxes with flexbox or grid layout. Do not use ASCII art or preformatted monospace text for diagrams — these overflow at smaller viewports and cannot reflow.

### Slide Dimension Baseline

Author all content against reveal.js default viewport (960×700). Verify no content clips at this resolution before applying auto-fit scaling.

### Decorative and Absolutely-Positioned Elements

Decorative and absolutely-positioned elements — SVG ornaments, glow circles, particle containers, corner flourishes — must NOT extend the slide's scrollable area. Every such element must satisfy one of:

1. Live inside a container that sets `overflow: hidden` and is itself bounded to the slide viewport, OR
2. Be explicitly dimensioned and positioned so its full bounding box stays within the slide viewport at all four gate viewports (1920×1080, 1366×768, 1280×720, 960×700).

Remedy pattern for any decoration that bleeds past an edge: wrap it in a clipped container — a full-slide `<div style="position:absolute; inset:0; overflow:hidden">` that holds the ornament — so the decoration is painted but cannot enlarge `scrollWidth`/`scrollHeight`.

Tradeoff: a full-bleed decoration that visually extends past the slide edge must be clipped rather than allowed to overflow; the clip is invisible in-frame and is the only way to keep `scrollWidth` within the viewport. Rationale — two operational incidents: a top-right decorative circle caused first-pass horizontal overflow in `qic-ai-travel-review-deck` (phase-6-5-process-review/process-review.md:23), and a decorative-element overflow was recorded in `trendmicro-visionone-edr` (phase-5-visual-build/decisions.md:4-6).

## Violation Determination

- Any text exceeds the maximum `em` size for its element type → Violation
- Content container missing `box-sizing: border-box` or `overflow: hidden` → Violation
- Decorative or absolutely-positioned element (SVG ornament, glow circle, particle container) causes `scrollWidth`/`scrollHeight` to exceed the slide viewport at any of the four gate viewports → Violation
- Decorative full-bleed element rendered without an `overflow: hidden` clipping container and not dimensioned within the viewport → Violation
- Architecture diagram rendered as ASCII art → Violation

## Exceptions

- Intentional off-slide staging elements used only by reveal.js fragment/auto-animate transitions are exempt while they remain visually off-canvas, provided they do not enlarge the deliverable's `scrollWidth`/`scrollHeight` at rest (verified by a `layout-gate-report.json` PASS).
