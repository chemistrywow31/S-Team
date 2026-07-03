---
name: HTML Presentation Creation
description: Creates HTML-based slide presentations using reveal.js or Slidev with theming and responsive design
---

# HTML Presentation Creation

Use this skill to build HTML-based presentations from slide outlines. Select reveal.js for broad compatibility and speaker-focused features, or Slidev for developer-oriented presentations with live code and Markdown authoring. Default to reveal.js when no specific preference is stated.

## Framework Selection

| Criterion | reveal.js | Slidev |
|---|---|---|
| Best for | Business presentations, conferences | Developer talks, code-heavy content |
| Authoring format | HTML sections | Markdown with YAML frontmatter |
| Code highlighting | Built-in highlight.js | Built-in Shiki with line highlighting |
| Export | PDF via print-css or Puppeteer | PDF and SPA via CLI |

## reveal.js Project Scaffold

```
{output_dir}/html-presentation/
├── index.html          ← Main presentation file
├── css/
│   └── custom.css      ← Theme overrides and custom styles
├── images/             ← Slide images
└── js/
    └── custom.js       ← Custom plugins or interactions
```

## Base HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{presentation_title}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/theme/{theme}.css">
    <link rel="stylesheet" href="css/custom.css">
</head>
<body>
    <div class="reveal">
        <div class="slides">
            <!-- Slide content here -->
        </div>
    </div>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@5/dist/reveal.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@5/plugin/highlight/highlight.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/reveal.js@5/plugin/notes/notes.js"></script>
    <script>
        Reveal.initialize({
            hash: true, slideNumber: true,
            transition: '{transition}',
            plugins: [RevealHighlight, RevealNotes]
        });
    </script>
</body>
</html>
```

## Slide Type Templates

**Title**: `<section data-background-color="{color}"><h1>{title}</h1><h3>{subtitle}</h3><p><small>{author} | {date}</small></p><aside class="notes">{notes}</aside></section>`

**Bullets**: `<section><h2>{title}</h2><ul><li class="fragment">{point}</li></ul><aside class="notes">{notes}</aside></section>`

**Image**: `<section data-background-image="images/{file}" data-background-size="cover"><h2 style="color:white;text-shadow:2px 2px 4px rgba(0,0,0,0.7);">{title}</h2><aside class="notes">{notes}</aside></section>`

**Code**: `<section><h2>{title}</h2><pre><code class="language-{lang}" data-trim data-line-numbers="{lines}">{code}</code></pre><aside class="notes">{notes}</aside></section>`

**Two-Column**: `<section><h2>{title}</h2><div style="display:flex;gap:2rem;"><div style="flex:1;">{left}</div><div style="flex:1;">{right}</div></div><aside class="notes">{notes}</aside></section>`

## Theme, Transition, and Effect Mapping

| Style Preference | Theme | Transition | Recommended Effects |
|---|---|---|---|
| Corporate / Professional | `white` or `simple` | `slide` | Subtle glass cards, gradient text headings, fade-up fragments |
| Creative / Bold | `moon` or `blood` | `convex` | Rotating glow borders, neon text, particle backgrounds, auto-animate morphs |
| Minimal / Clean | `white` | `fade` | Gradient text only, shimmer on key headings, float on icons |
| Dark / Technical | `black` or `night` | `slide` | Glass morphism cards, glow borders, SVG line-draw diagrams, pulse accents |
| Data-heavy | `white` | `none` | Subtle entrance animations, gradient accent bars, no continuous effects |

## Advanced Reveal.js Configuration

Add these settings to `Reveal.initialize()` for premium effect support:

```js
Reveal.initialize({
  hash: true,
  slideNumber: true,
  transition: '{transition}',
  autoAnimateEasing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  autoAnimateDuration: 0.8,
  autoAnimateUnmatched: true,
  backgroundTransition: 'fade',
  plugins: [RevealHighlight, RevealNotes]
});
```

## Responsive Design Requirements

1. Set `<meta name="viewport" content="width=device-width, initial-scale=1.0">`.
2. Use relative units (`em`, `rem`, `%`, `vw`, `vh`) in custom CSS.
3. Set maximum image width to `90%` of the slide area.
4. Set `minScale: 0.1, maxScale: 2.0` in `Reveal.initialize()`.
5. **Install the canonical Layer 3 auto-fit JS verbatim** by copying `.agents/skills/layout-gate/scripts/auto-fit-snippet.html` immediately after `Reveal.initialize()`. Do not write a custom variant — the layout-gate's `autoFitDetected` regex looks for the exact patterns this snippet emits.
6. **Run the layout gate** before declaring done:
   ```bash
   node .agents/skills/layout-gate/scripts/layout-gate.cjs <output>/index.html
   ```
   Exit code must be `0`. See `.codex/rules/layout-gate.md` for the full mandate. Tests at 1920×1080, 1366×768, 1280×720, and 960×700 (authored viewport) are run automatically by the gate.

## Example

### Input

Slide outline with 3 slides for "Microservices Architecture":
1. Title slide by Jane Doe, 2026-02-10
2. Content slide: "Why Microservices?" with 3 benefits
3. Code slide: "Service Communication" with Python REST example

### Output

A reveal.js presentation using `white` theme with `slide` transition. Title slide uses `data-background-color="#1a365d"`. Content slides use `fragment` for progressive reveal. Code slide uses `data-line-numbers` for step-through highlighting. See the Base HTML Template above for the full document structure. Key slides:

```html
<section data-background-color="#1a365d">
  <h1>Microservices Architecture</h1><h3>Designing Scalable Distributed Systems</h3>
  <p><small>Jane Doe | 2026-02-10</small></p>
</section>
<section>
  <h2>Why Microservices?</h2>
  <ul>
    <li class="fragment"><strong>Independent deployment</strong> — Ship without full redeploy</li>
    <li class="fragment"><strong>Technology diversity</strong> — Best language per service</li>
    <li class="fragment"><strong>Fault isolation</strong> — Failures do not cascade</li>
  </ul>
</section>
<section>
  <h2>Service Communication</h2>
  <pre><code class="language-python" data-trim data-line-numbers="1-3|5-8">
import requests
BASE_URL = "http://order-service:8080"
def get_order(order_id: str) -> dict:
    response = requests.get(f"{BASE_URL}/orders/{order_id}")
    response.raise_for_status()
    return response.json()
  </code></pre>
</section>
```

## Effect-Enhanced Slide Template

Use this template for content slides that require glass morphism, gradient text, and auto-animate:

```html
<section data-auto-animate data-background-color="var(--bg-base)">
  <div class="glass-card glow-border" data-id="content-card"
       style="--glow-1: var(--glow-accent-1); --glow-2: var(--glow-accent-2); --glow-3: var(--glow-accent-3);">
    <h2 class="gradient-text" data-id="slide-title"
        style="--gradient-start: var(--grad-start); --gradient-end: var(--grad-end);">
      {title}
    </h2>
    <ul>
      <li class="fragment fade-up animate-item">{point_1}</li>
      <li class="fragment fade-up animate-item">{point_2}</li>
      <li class="fragment fade-up animate-item">{point_3}</li>
    </ul>
  </div>
  <aside class="notes">{notes}</aside>
</section>
```

Reference `.agents/skills/visual-effects/SKILL.md` for all effect CSS patterns and JS code.

## Custom CSS Baseline

Include this baseline in every `custom.css` and extend with brand overrides. The `min-height: 0; overflow: hidden;` rules on cards, grids, and flex children are required by `.codex/rules/responsive-auto-fit.md` Layer 1 — without them the layout-gate fails on small viewports:

```css
.reveal h1 { font-size: 2.5em; }
.reveal h2 { font-size: 1.8em; }
.reveal p, .reveal li { font-size: 1.1em; line-height: 1.6; }
.reveal pre code { font-size: 0.85em; max-height: 500px; }
.reveal img { max-width: 90%; border-radius: 4px; }

/* Required by .codex/rules/responsive-auto-fit.md Layer 1 — overflow prevention */
.reveal .slides section { overflow: hidden; }
.glass-card, .glass-sm, .glow-border { min-height: 0; overflow: hidden; box-sizing: border-box; }
.reveal section [style*="grid"], .reveal section [style*="flex"] { min-width: 0; min-height: 0; }
.reveal section svg { max-width: 100%; height: auto; }

.glass-card {
  background: rgba(255,255,255,0.08); backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; padding: 2rem;
}
.glass-sm {
  background: rgba(255,255,255,0.08); backdrop-filter: blur(12px) saturate(150%);
  -webkit-backdrop-filter: blur(12px) saturate(150%);
  border: 1px solid rgba(255,255,255,0.10); border-radius: 12px; padding: 14px;
}
.gradient-text {
  background: linear-gradient(135deg, var(--gradient-start), var(--gradient-end));
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.animate-item { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
  .animate-item { opacity: 1; }
}
```
