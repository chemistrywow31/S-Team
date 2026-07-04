---
name: Premium Visual Effects
description: Provides CSS animation patterns, glass morphism, SVG animation, particle systems, depth parallax, and reveal.js advanced effects for premium presentations
---

# Premium Visual Effects

Use this skill to implement premium visual effects in HTML presentations — persistent animated borders, glass morphism, neon glows, particle backgrounds, SVG artwork, and cinematic transitions.

## CSS Animation Patterns

### Rotating Border Glow

Use `@property --angle` with `conic-gradient` for a persistent glowing border:

```css
@property --angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
.glow-border { --border-width: 2px; position: relative; border-radius: 16px; padding: 2rem; background: rgba(15,15,30,0.85); }
.glow-border::before {
  content: ""; position: absolute; inset: calc(var(--border-width) * -1); border-radius: inherit;
  background: conic-gradient(from var(--angle), var(--glow-1), var(--glow-2), var(--glow-3), var(--glow-1));
  z-index: -1; animation: rotate-glow 4s linear infinite;
}
@keyframes rotate-glow { to { --angle: 360deg; } }
```

### Shimmer, Pulse, Float

```css
@keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
.shimmer-text {
  background: linear-gradient(90deg, var(--text-color) 40%, var(--accent-color) 50%, var(--text-color) 60%);
  background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  animation: shimmer 3s ease-in-out infinite;
}
@keyframes pulse-glow {
  0%,100% { box-shadow: 0 0 20px rgba(var(--accent-rgb),0.3); }
  50% { box-shadow: 0 0 40px rgba(var(--accent-rgb),0.6), 0 0 80px rgba(var(--accent-rgb),0.2); }
}
.pulse { animation: pulse-glow 2.5s ease-in-out infinite; }
@keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.float { animation: float 3s ease-in-out infinite; }
```

## Glass Morphism and Surface Effects

```css
.glass-card {
  background: rgba(255,255,255,0.08); backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 2rem;
}
.neon-text {
  color: var(--neon-color);
  text-shadow: 0 0 7px var(--neon-color), 0 0 10px var(--neon-color),
    0 0 21px var(--neon-color), 0 0 42px var(--neon-glow), 0 0 82px var(--neon-glow);
}
.gradient-text {
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.mesh-bg {
  background: radial-gradient(at 20% 30%, var(--mesh-1) 0%, transparent 50%),
    radial-gradient(at 80% 20%, var(--mesh-2) 0%, transparent 50%),
    radial-gradient(at 50% 80%, var(--mesh-3) 0%, transparent 50%), var(--bg-base);
}
```

## SVG Animation Techniques

Stroke draw: animate `stroke-dashoffset` from path length to 0. Set `--path-length` via JS: `path.getTotalLength()`.

```css
.svg-draw path { stroke-dasharray: var(--path-length); stroke-dashoffset: var(--path-length); animation: draw 2s ease-out forwards; }
@keyframes draw { to { stroke-dashoffset: 0; } }
.animated-pattern rect { animation: pattern-shift 8s linear infinite; }
@keyframes pattern-shift { to { transform: translate(20px, 20px); } }
```

## 3D Transforms and Perspective

```css
.card-3d { perspective: 1000px; }
.card-3d-inner { transition: transform 0.8s cubic-bezier(0.4,0,0.2,1); transform-style: preserve-3d; }
.card-3d:hover .card-3d-inner { transform: rotateY(180deg); }
@keyframes tilt-in {
  0% { transform: perspective(800px) rotateX(12deg) translateY(40px); opacity: 0; }
  100% { transform: perspective(800px) rotateX(0) translateY(0); opacity: 1; }
}
.tilt-entrance { animation: tilt-in 0.8s cubic-bezier(0.22,1,0.36,1) forwards; }
```

## Depth Parallax System

Multi-layer camera depth (the Active-Theory look) — a default effect category per
`rules/visual-effects-standard.md`. Each style's `motion-policy` names its own expression
(`depth-parallax`, `subtle-depth-parallax`, `paper-depth-parallax`, `geometric-layer-parallax`)
or forbids it. Two motion sources, both event-driven — zero infinite loops.

### Layer Markup

Parallax layers are decorations: they live inside the gate-safe `.deco-layer` wrapper (see
Gate-Safe Decoration Containment), never in the content flow.

```html
<section>
  <div class="deco-layer parallax-scene" aria-hidden="true">
    <div class="parallax-layer" data-depth="0.15"><!-- far: full-bleed mesh, hairline grid --></div>
    <div class="parallax-layer" data-depth="0.4"><canvas class="particle-bg"></canvas></div>
    <div class="parallax-layer" data-depth="0.8"><!-- near: sparse glow orbs only --></div>
  </div>
  <div class="content">…</div>
</section>
```

```css
.reveal .slides section { height: 100%; }   /* sections span the full canvas, not content height */
.parallax-layer { position: absolute; inset: 0; will-change: transform; }
```

Never oversize layers (no negative inset): the layout gate rect-checks EVERY descendant
against the slide box — bottom/right poke > 2px fails, and the decorative exemption applies
only to the overlap check, not the overflow check (verified on parallax-pilot-deck: 7/7
slides FAILed at `inset: -8%`, PASS at `inset: 0`). Sections need explicit full height,
otherwise the content-sized section box makes even `inset: 0` layers overflow. Design fills
to fade out before the edges (radial fade, masked grid) — on dark bases, travel then exposes
nothing. Full-bleed fills belong on far layers (`data-depth` ≤ 0.4); near layers (0.6–0.9)
carry sparse shapes kept ≥ 60px from the right/bottom edges.

### Mouse Camera

Lerp toward the pointer; the rAF loop stops when settled — input-driven motion counts as
zero continuous animations and leaves gate screenshots stable.

```js
function initMouseParallax() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
  addEventListener('mousemove', e => {
    tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5;
    if (!raf) raf = requestAnimationFrame(step);
  }, { passive: true });
  function step() {
    cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
    const slide = Reveal.getCurrentSlide();
    if (slide) slide.querySelectorAll('.parallax-layer').forEach(l => {
      const d = +l.dataset.depth || 0.3;
      l.style.transform = `translate3d(${(-cx*60*d).toFixed(2)}px, ${(-cy*40*d).toFixed(2)}px, 0)`;
    });
    raf = Math.abs(tx-cx) + Math.abs(ty-cy) > 0.002 ? requestAnimationFrame(step) : null;
  }
}
```

### Slide-Transition Depth

Layers enter at depth-proportional offsets on every slide change — the depth illusion works
without scroll, which is what makes parallax fit the slide medium. Layers always enter from
the LEFT: the gate measures descendant rects 350ms after navigation (mid-animation) and only
bottom/right overflow counts, so a left-side offset can never trip it; a direction-aware
right-side entry gets caught mid-flight.

```js
Reveal.on('slidechanged', e => {
  e.currentSlide.querySelectorAll('.parallax-layer').forEach(l => {
    const d = +l.dataset.depth || 0.3;
    const a = l.animate(
      [{ transform: `translate3d(${-80*d}px,0,0)`, opacity: 0.4 },
       { transform: 'translate3d(0,0,0)', opacity: 1 }],
      { duration: 900, easing: 'cubic-bezier(0.22,1,0.36,1)' });
    a.onfinish = () => a.cancel();   // release the WAAPI override so the mouse camera regains control
  });
});
```

### Parallax Caps

- ≤ 4 layers per slide, `data-depth` 0.1–0.9, `translate3d` only.
- Mouse travel caps at ±60px × depth; transition offset at 80px × depth, entering leftward.
  The gate runs pointer-free, so mouse travel never affects measurement — but keep near-layer
  decorations ≥ 60px from right/bottom edges so travel doesn't visibly clip.
- Entrance completes in ≤ 1.5s (0.9s above) per the entrance-timing rule.
- Reduced motion: the guard clause is mandatory; layers render at rest.
- Reference implementation (both gates PASS, 6 viewports / 7 slides): `examples/parallax-pilot-deck/`
  in this skill folder — copy it into `output/<project>/` as the starting skeleton and re-run the
  gates there. Gate reports are regenerated per run and stay untracked by design.

## Reveal.js Advanced Features

### Auto-Animate

Pair elements across slides with matching `data-id`. Configure: `autoAnimateEasing: 'cubic-bezier(0.22,1,0.36,1)', autoAnimateDuration: 0.8, autoAnimateUnmatched: true`.

```html
<section data-auto-animate>
  <h2 data-id="title" style="font-size:1.5em;">Architecture</h2>
</section>
<section data-auto-animate>
  <h2 data-id="title" style="font-size:2.5em;">Architecture</h2>
</section>
```

### Transitions, Backgrounds, Fragments

```html
<section data-transition="zoom-in fade-out">...</section>
<section data-background-gradient="radial-gradient(circle, var(--bg-accent), var(--bg-base))">...</section>
<li class="fragment fade-up" data-fragment-index="1">Point A</li>
```

Do not repeat the same transition type on more than 3 consecutive slides.

## Animation Libraries

### anime.js Staggered Entrance

```js
import anime from 'animejs';
Reveal.on('slidechanged', event => {
  const items = event.currentSlide.querySelectorAll('.animate-item');
  if (!items.length) return;
  anime({ targets: items, translateY: [30,0], opacity: [0,1], easing: 'easeOutExpo', duration: 800, delay: anime.stagger(120) });
});
```

### Canvas Particle System

Limit to 60 particles per slide for 60fps. Initialize on `slidechanged`; pause on hidden slides.

```js
function initParticles(canvas, count = 40) {
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
  const ps = Array.from({length: count}, () => ({
    x: Math.random()*canvas.width, y: Math.random()*canvas.height,
    vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4, r: Math.random()*2+1
  }));
  (function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'rgba(var(--particle-rgb),0.6)';
    ps.forEach(p => {
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>canvas.width) p.vx*=-1; if(p.y<0||p.y>canvas.height) p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }); requestAnimationFrame(draw);
  })();
}
```

### Particle Converge Glyph (cover & section slides, opt-in)

The "particles assemble into a mark" moment in plain 2D canvas — no WebGL, no library,
headless-gate-safe. Draw the glyph offscreen, sample opaque pixels, fly particles home.
The real heading stays HTML text in `.content`; the canvas is pure decoration inside
`.deco-layer`, so reduced-motion and the render gate never depend on it.

```js
function particleGlyph(canvas, glyph, opts = {}) {
  const { color = '#22d3ee', count = 1600, dur = 1800,
          font = `300 ${Math.floor(canvas.offsetHeight * 0.55)}px "Space Grotesk", sans-serif` } = opts;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = canvas.offsetWidth, H = canvas.height = canvas.offsetHeight;
  const off = document.createElement('canvas'); off.width = W; off.height = H;
  const o = off.getContext('2d');
  o.font = font; o.textAlign = 'center'; o.textBaseline = 'middle';
  o.fillText(glyph, W / 2, H / 2);
  const px = o.getImageData(0, 0, W, H).data;
  let targets = [];
  for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4)
    if (px[(y * W + x) * 4 + 3] > 128) targets.push({ x, y });
  const keep = Math.max(1, Math.ceil(targets.length / count));
  targets = targets.filter((_, i) => i % keep === 0);   // decimate to ≤ count
  const ps = targets.map(t => ({ t,
    x: W / 2 + (Math.random() - 0.5) * W * 1.4,
    y: H / 2 + (Math.random() - 0.5) * H * 1.4 }));
  ctx.fillStyle = color;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    ps.forEach(p => ctx.fillRect(p.t.x, p.t.y, 1.8, 1.8));   // static end state, single frame
    return;
  }
  let start = null;
  function step(ts) {
    start ??= ts;
    const k = Math.min(1, (ts - start) / dur), e = 1 - (1 - k) ** 3;
    ctx.clearRect(0, 0, W, H); ctx.fillStyle = color;
    ps.forEach(p => {
      ctx.globalAlpha = 0.3 + 0.7 * e;
      ctx.fillRect(p.x + (p.t.x - p.x) * e, p.y + (p.t.y - p.y) * e, 1.8, 1.8);
    });
    if (k < 1) requestAnimationFrame(step);   // the loop TERMINATES at convergence — mandatory
  }
  requestAnimationFrame(step);
}
```

Rules: ≤ 2000 particles; run once per slide entry (`slidechanged`); dissolve-out is the same
interpolation reversed. WebGL / three.js particle systems are an escalation, not a default —
they require explicit user approval, deck-bundle vendoring, and a render-gate pilot first
(headless Chrome renders GL via SwiftShader: slow screenshots and blank-canvas false FAILs
are real risks).

### Animated Gradient Background

```css
@keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
.animated-gradient {
  background: linear-gradient(135deg, var(--grad-1), var(--grad-2), var(--grad-3));
  background-size: 200% 200%; animation: gradient-shift 8s ease infinite;
}
```

## Gate-Safe Decoration Containment

Absolutely-positioned decorations (corner circles, floating SVG shapes, glow orbs) are the #1
recurring layout-gate failure: Puppeteer measures the geometric bounding box, so a decoration
poking past the slide edge fails the gate even when `clip-path` hides it visually. This exact
root cause was fixed independently on qic-ai-travel-review-deck (top-right circle, horizontal
overflow) and trendmicro-visionone-edr (FINDING-P5-001 / DECISION-P5-001: SVG deco,
scrollW 2000 > clientW 1920). Do not rediscover it a third time — wrap every decoration layer:

```html
<section>
  <!-- decoration layer: clipped wrapper, marked decorative -->
  <div class="deco-layer" aria-hidden="true">
    <svg class="corner-orb">…</svg>
  </div>
  <div class="content">…</div>
</section>
```

```css
.deco-layer {
  position: absolute; inset: 0;
  overflow: hidden;        /* kills the geometric-bbox overflow the gate measures */
  pointer-events: none;
  z-index: 0;
}
.deco-layer > * { position: absolute; }  /* decorations position freely INSIDE the clipped layer */
section > .content { position: relative; z-index: 1; }
```

Two rules, both mandatory:

1. **Clip at the layer, not the shape.** `overflow: hidden` on the wrapper is what the gate
   measures; `clip-path` on the shape itself is invisible to `scrollWidth`/bbox math and will
   still FAIL.
2. **Mark it decorative.** `aria-hidden="true"` (or a class matching
   `deco|background|bg-|overlay|particle|vignette|grid`) exempts the layer from the gate's
   text/media overlap check. An unmarked background SVG under live text is flagged as a collision
   — the gate cannot tell intent, only markup.
3. **Fit inside the slide box anyway.** The wrapper's `overflow: hidden` kills scroll-metric
   inflation, but the gate ALSO rect-checks every descendant with NO decorative exemption —
   bottom/right poke > 2px fails (left/top poke is not measured). Decorations must genuinely
   rest within the slide box; give sections `height: 100%` so that box is the full canvas.
   Anything that must bleed past the canvas belongs on reveal's `data-background-*` layer,
   which the gate does not measure.

## Performance Guidelines

- Use only GPU-accelerated properties for continuous animations: `transform`, `opacity`, `filter`, `backdrop-filter`.
- Set `will-change: transform` on persistent animation elements. Remove from non-animating elements.
- Limit continuous animations to 5 per visible slide. Total animation JS must not exceed 100KB gzipped.
- Include reduced-motion fallback in every presentation:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
```

## Example

**Input**: "Glass-card slide with rotating glow border and particle background for Architecture Overview."

**Output**:
```html
<section data-auto-animate data-background-color="#0a0a1a">
  <canvas class="particle-bg" data-particle-count="40"></canvas>
  <div class="glass-card glow-border" data-id="arch-card" style="--glow-1:#00d4ff;--glow-2:#7b2ff7;--glow-3:#ff2d95;">
    <h2 class="gradient-text" data-id="arch-title" style="--gradient-start:#00d4ff;--gradient-end:#7b2ff7;">Architecture Overview</h2>
    <ul>
      <li class="fragment fade-up animate-item">Microservices with event-driven mesh</li>
      <li class="fragment fade-up animate-item">Zero-trust security at every boundary</li>
    </ul>
  </div>
</section>
```
