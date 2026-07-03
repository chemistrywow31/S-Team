---
name: Layout Overflow Prevention — PDF
description: Content containment and overflow-prevention constraints for reportlab PDF documents
paths:
  - "output/**/*.py"
---

# Layout Overflow Prevention — PDF

Child of `.codex/rules/layout-overflow-prevention.md` (the umbrella). Applies to reportlab-generated PDF documents. You must also comply with the umbrella's cross-format mandates and enforcement.

## Applicability

- Applies to: `web-developer`, `visual-designer`, `presentation-writer`, `qa-reviewer`

## Rule Content

### Page Dimensions and Margins

Use A4 page size (210mm × 297mm). Maintain these margins:

| Edge | Minimum Margin |
|------|---------------|
| Top | 25mm |
| Bottom | 25mm |
| Left | 30mm |
| Right | 25mm |

Effective content area: 155mm wide × 247mm tall.

### Text Size Constraints

| Element | Size | Maximum |
|---------|------|---------|
| Document title | 18pt | 22pt |
| Section title | 14–16pt | 16pt |
| Body text | 11–12pt | 12pt |
| Footnotes / captions | 9–10pt | 10pt |

### CJK Font Registration

Register a CJK-capable font before building the document. On macOS, check fonts in this order:

1. `/System/Library/Fonts/Supplemental/Songti.ttc` (Songti SC)
2. `/System/Library/Fonts/PingFang.ttc` (PingFang SC)
3. `/Library/Fonts/Arial Unicode.ttf`
4. Fall back to CID font: `UnicodeCIDFont('STSong-Light')`

### Line Spacing for CJK

CJK body text must use `leading` of at least 1.5× the font size (e.g., 12pt font → 18pt leading). This prevents characters from overlapping vertically.

### Paragraph Containment

Use `Paragraph` with `wordWrap="CJK"` for mixed Chinese/English text. This prevents reportlab from stretching word spacing to fill justified lines. Set alignment to `TA_LEFT` for body text.

### Page Break Control

Use `KeepTogether` or `CondBreak` to prevent a section title from appearing at the bottom of a page without its body content. Each major section (slide script) must not split its title from its first paragraph.

## Violation Determination

- Body text uses leading less than 1.5× font size for CJK content → Violation
- Section title split from its body content across page break → Violation
- Page margins smaller than the stated minimums (top/bottom 25mm, left 30mm, right 25mm) → Violation
- Text size exceeds the stated maximum for its element type → Violation

## Exceptions

This rule has no exceptions.
