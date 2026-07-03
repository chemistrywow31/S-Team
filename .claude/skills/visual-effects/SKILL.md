---
name: Premium Visual Effects
description: Provides CSS animation patterns, glass morphism, SVG animation, particle systems, and reveal.js advanced effects for premium presentations
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
