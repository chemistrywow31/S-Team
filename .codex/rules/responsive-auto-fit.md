---
name: Responsive Auto-Fit
description: Every HTML presentation must include a three-layer responsive mechanism to prevent content clipping at any resolution
paths:
  - "output/**/*.html"
---

# Responsive Auto-Fit

## Applicability

- Applies to: `web-developer`, `qa-reviewer`

## Rule Content

### Layer 1 — CSS Overflow Prevention

Apply these global CSS rules to prevent child elements from pushing containers beyond viewport bounds:

- All card containers (glass, glass-sm, or equivalent): `min-height: 0; overflow: hidden;`
- All grid and flex children: `min-height: 0; min-width: 0; overflow: hidden;`
- All inline SVGs inside flex or grid containers: `max-width: 100%; height: auto;`
- All glow-border or decorated containers: `min-height: 0;`

### Layer 2 — Reveal.js Scale Range

Set `minScale` and `maxScale` in the reveal.js `Reveal.initialize()` config:

```javascript
minScale: 0.1,
maxScale: 2.0
```

These values allow the framework to scale the entire deck for screens smaller or larger than the authored resolution.

### Layer 3 — Per-Slide Auto-Fit JavaScript

Include a JavaScript function that detects per-slide content overflow and applies `transform: scale()` to shrink overflowing content into the visible area.

The function must:
1. Iterate all `section` elements inside `.reveal .slides`.
2. Reset any previous `transform` before measuring to avoid compounding.
3. Compare `scrollHeight` against `clientHeight` for each section.
4. When `scrollHeight > clientHeight`, compute `ratio = clientHeight / scrollHeight` and apply `transform: scale(ratio)` with a minimum floor of `0.55`.
5. Set `transform-origin: center center` on every scaled section.

The function must execute on all three of these events:
- `Reveal.on('ready')` — initial layout (use a 200ms delay for browser layout settlement).
- `Reveal.on('slidechanged')` — each slide transition (use `requestAnimationFrame`).
- `window resize` — viewport changes (debounce at 150ms).

### Integration Checklist (Enforced by Layout Gate)

This rule's compliance is enforced by `.codex/rules/layout-gate.md`. Visual self-attestation is no longer accepted. Web Developer must:

1. Copy `.agents/skills/layout-gate/scripts/auto-fit-snippet.html` verbatim into `index.html` immediately after `Reveal.initialize()`.
2. Run `node .agents/skills/layout-gate/scripts/layout-gate.cjs <output>/index.html` and confirm exit code `0`.
3. Cite `layout-gate-report.json` in the completion summary per `.codex/rules/layout-gate.md`.

The gate iterates 1920×1080, 1366×768, 1280×720, and 960×700 (authored) viewports, navigates every slide, and measures container overflow + descendant overflow against the slide bounding box. Manual viewport-resize verification is redundant once the gate passes.

## Violation Determination

- HTML presentation has no auto-fit JavaScript function → Violation
- `minScale` or `maxScale` missing from reveal.js config → Violation
- Card/grid/flex containers lack `min-height: 0; overflow: hidden` → Violation
- Auto-fit function does not fire on all three required events (`ready`, `slidechanged`, `resize`) → Violation
- Auto-fit function does not reset previous transforms before recalculating → Violation
- QA Reviewer approves a presentation where the layout gate has not been run or has not produced `"status": "PASS"` (per `.codex/rules/layout-gate.md`) → Violation
- Web Developer writes a custom auto-fit variant instead of copying `auto-fit-snippet.html`, causing the gate's `autoFitDetected` field to be `false` → Violation
