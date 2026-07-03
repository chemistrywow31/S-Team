---
name: Visual Effects Standard
description: Enforces minimum visual effect coverage, GPU performance, accessibility, and brand-consistent animation quality
paths:
  - "output/**/*.html"
---

# Visual Effects Standard

## Applicability

- Applies to: `visual-designer`, `web-developer`, `qa-reviewer`

## Rule Content

### Style-Aware Enforcement (read this first)

Every project locks in a style at intake (per CLAUDE.md Style System). The chosen style's `tokens.md` contains a `motion-policy:` YAML block defining `required:`, `allowed:`, `forbidden:`, `density:`, and `reduced-motion:` lists. **The style's policy overrides this rule's defaults below.** When a default in this rule conflicts with the locked-in style's policy, follow the style.

Examples:
- `tech-mystery` requires glass morphism, rotating glow, particles, gradient text, pulse glow — the defaults below apply directly.
- `minimal-modern` forbids glass / glow / particles / gradients — its policy sets `slides-with-effects: 60` and `continuous-animations-per-slide: 0`. Defaults are superseded.
- `editorial` forbids almost all effects in this rule — only entrance fades + paper grain are permitted.

QA Reviewer must read `.claude/styles/<chosen-style>/tokens.md` Section 8 (`Motion & Effects Policy`) and audit against THAT, not against the defaults in this file. Defaults below remain in force only when no style is declared (which is itself a violation per the Style System mandate).

### Default Effect Coverage (applies unless overridden by style)

At least 80% of content slides must include one or more visual effects (CSS animation, SVG animation, glass morphism, gradient, particle background, or neon glow). Count content slides only — exclude title, section divider, and closing slides.

### GPU-Accelerated Properties Only

All continuous (infinite-loop) animations must exclusively use GPU-accelerated properties: `transform`, `opacity`, `filter`, `backdrop-filter`. Animating `width`, `height`, `margin`, `padding`, `top`, `left`, `right`, `bottom`, `border`, `font-size`, or `color` in continuous animations is prohibited.

### Transition Diversity

Do not apply the same `data-transition` type to more than 3 consecutive slides. Vary transitions across the presentation. Use at least 2 distinct transition types per 10 slides.

### Auto-Animate Requirement

Every presentation must use `data-auto-animate` on at least one slide pair. Pair elements with matching `data-id` attributes to achieve morph transitions.

### Entrance Animation Timing

All entrance animations must complete within 1.5 seconds. Use easing functions (`ease-out`, `ease-in-out`, `cubic-bezier`). Using `linear` easing on entrance animations is prohibited.

### Color Compliance

All glow colors, gradient stops, and neon shadow colors must originate from the Visual Style Guide's accent palette or the Glow & Gradient Addendum. Off-palette glow or gradient colors are prohibited.

### SVG Originality

All SVG illustrations and patterns must be custom-created inline SVG. Using stock SVG icon libraries (Font Awesome, Heroicons, Material Icons) for decorative slide artwork is prohibited. Icon libraries remain acceptable for functional UI icons only.

### Reduced Motion Accessibility

Every presentation must include a `@media (prefers-reduced-motion: reduce)` block that disables or shortens all animations. Verify by enabling reduced-motion in browser settings and confirming no infinite animations remain active.

### Flash Safety (WCAG 2.3.1)

No element may flash more than 3 times per second. This applies to all blinking, strobing, or rapid-toggle animations.

### Performance Target

All slides must maintain 60fps during animations when tested in Chrome DevTools Performance panel at 1920x1080 resolution. A frame drop below 30fps on any slide is a blocking defect.

### Animation Bundle Size

Total JavaScript for animation libraries (anime.js, GSAP, custom particle code) must not exceed 100KB gzipped. Measure with `gzip -c file.js | wc -c`.

### Continuous Animation Density

Each visible slide must not have more than 5 simultaneously running continuous (infinite) animations. Exceeding this limit degrades performance and distracts the audience.

## Violation Determination

- No style key declared in the Requirements Summary → Violation (per CLAUDE.md Style System)
- Style key declared but `.claude/styles/<key>/tokens.md` missing or lacks the required Motion & Effects Policy section → Violation
- Effect category present in slide that is listed under the chosen style's `forbidden:` policy → Violation
- Effect category listed as `required:` by the chosen style is absent from all slides → Violation
- Slides-with-effects count below the chosen style's `density.slides-with-effects` threshold → Violation
- Continuous animations per slide exceed the chosen style's `density.continuous-animations-per-slide` ceiling → Violation
- A continuous animation uses `width` or `height` instead of `transform: scale()` → Violation (universal — applies to all styles)
- 4 consecutive slides use `data-transition="slide"` with no variation, where the style allows transitions → Violation
- Entrance animation takes longer than 1.5 seconds → Violation
- Accent / glow color used does not appear in the chosen style's `tokens.md` palette → Violation
- Slide artwork uses an SVG pasted from Font Awesome / Heroicons / Material Icons (decorative use) → Violation
- Presentation has no `prefers-reduced-motion` CSS block → Violation
- An element flashes more than 3 times per second → Violation (WCAG 2.3.1, universal)
- DevTools Performance panel shows < 30fps on any slide → Violation
- Animation library bundle exceeds 100KB gzipped → Violation
- QA Reviewer approves a presentation that violates any of the above → Violation
