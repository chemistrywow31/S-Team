---
name: Layout Overflow Prevention — PPTX
description: Content containment and overflow-prevention constraints for PptxGenJS PPTX presentations
paths:
  - "output/**/*.js"
---

# Layout Overflow Prevention — PPTX

Child of `rules/layout-overflow-prevention.md` (the umbrella). Applies to PptxGenJS-generated PPTX presentations. You must also comply with the umbrella's cross-format mandates and enforcement.

## Applicability

- Applies to: `web-developer`, `visual-designer`, `presentation-writer`, `qa-reviewer`

## Rule Content

### Safe Content Area

Slide layout is 10" × 5.625" (LAYOUT_16x9). Maintain these minimum margins:

| Edge | Minimum Margin |
|------|---------------|
| Left | 0.5" |
| Right | 0.5" |
| Top | 0.5" (0.8" if slide has a title row) |
| Bottom | 0.4" |

Effective content area: 9.0" wide × 4.425" tall (with title) or 4.725" tall (without title).

### Text Size Constraints

| Element | Size Range | Maximum |
|---------|-----------|---------|
| Slide title | 32–44pt | 44pt |
| Section header | 20–24pt | 24pt |
| Body text | 13–16pt | 16pt |
| Table header | 11–13pt | 13pt |
| Table body | 9–11pt | 11pt |
| Caption / footnote | 8–10pt | 10pt |

CJK fonts (Microsoft JhengHei, PingFang TC) render wider than Latin fonts. When mixing CJK and Latin text, reduce font size by 1–2pt from the maximum to prevent overflow.

### Table Column Width Rules

Every `addTable` call must specify `colW` explicitly. The sum of all column widths must not exceed the content area width (9.0"). Verify this constraint before generating:

```javascript
const totalW = colWidths.reduce((a, b) => a + b, 0);
if (totalW > 9.0) throw new Error(`Table too wide: ${totalW}" > 9.0"`);
```

### Text Box Containment

Every `addText` call must specify both `w` (width) and `h` (height). The text box must not extend beyond the safe content area:

- `x + w ≤ 9.5` (0.5" right margin)
- `y + h ≤ 5.225` (0.4" bottom margin)

When text overflows the box, PptxGenJS silently clips it. Prevent this by keeping text concise and verifying visually.

### Color Format

Use 6-character hex without `#` prefix. Do not encode opacity in the hex string. Use the `opacity` or `transparency` property instead.

### Object Reuse Prohibition

Never reuse option objects (especially shadow, fill) across multiple `addShape` or `addText` calls. PptxGenJS mutates objects in-place. Create factory functions that return fresh objects for each call.

## Violation Determination

- Table missing explicit `colW` specification → Violation
- Table `colW` sum exceeds 9.0" → Violation
- Text box extends beyond safe content area (`x+w > 9.5` or `y+h > 5.225`) → Violation
- Uses `#` prefix in hex colors → Violation
- Reuses option objects across calls → Violation

## Exceptions

This rule has no exceptions.
