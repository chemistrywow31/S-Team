# Tech Mystery Template — CECI-Inspired Tokens

> 風格定位：科技簡報風，參考 CECI VP pitch template；以深色科技底、gold/cyan accents、meta-bar、卡片化證據與流程圖呈現評審友善內容。

## Palette

```css
--bg-base: #0A1828;
--bg-deep: #050E1A;
--surface: #1A2744;
--surface-2: #22304F;
--text: #F1F5F9;
--text-dim: #94A3B8;
--text-soft: #CBD5E1;
--accent: #D4A574;
--accent-soft: #E8C89A;
--cyan: #0891B2;
--cyan-soft: #22D3EE;
--spark: #F59E0B;
--success: #10B981;
```

## Layout

- 1280x720 authored slide canvas.
- Top meta-bar: section label left, page count right.
- Large title block with uppercase mono kicker.
- Evidence cards use dark surfaces, subtle borders, left accent rules.
- Visuals are live text/SVG/vector shapes; raster images must not carry claims.

## Motion

- Subtle fade-up entrance only.
- No continuous animation.
- Must support `prefers-reduced-motion`.
