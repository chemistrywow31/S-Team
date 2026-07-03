# Bauhaus — Design Tokens

> 風格定位：**包浩斯風（Bauhaus）** · 幾何網格 + 原色塊 + 粗黑框 · 操作介面優先
> Reference mood：Dessau school posters · Herbert Bayer diagrams · Walter Gropius typography studies · constructivist control panels

Origin: extracted from `draft-system/web/design-tokens/bauhaus-draft-system.md`. The presentation contract below preserves the draft-system's `--color-*` token names so a single CSS payload can drive both the workbench UI and the slide deck.

---

## 1. Concept & Mood

| Key | Value |
|---|---|
| **Aesthetic direction** | Bauhaus-inspired operational deck — printed module aesthetic, mechanical layout |
| **Reference mood** | Dessau school posters · Herbert Bayer diagrams · constructivist control panels · Massimo Vignelli grid systems |
| **Voice** | Direct, mechanical, confident — short labels, declarative sentences, zero marketing copy |
| **Primary tension** | Rigid grid + oversized type weight + restrained primary color accents (red / yellow / blue) over warm cream |
| **Avoid** | Gradients, glass blur, soft shadows, rounded SaaS cards, decorative illustration, photographic backgrounds, italic, uppercase auto-transform on CJK |

The premium feel comes from **structural confidence**: square corners, 2px black frames, flat offset shadows, and a four-color discipline (black / red / yellow / blue) on a warm cream field. Every slide should read as a printed module pulled from a studio drafting table — never as a "designed" slide.

---

## 2. Color Tokens

### 2.1 Palette

```css
body[data-theme="bauhaus"], :root[data-theme="bauhaus"] {
  /* Surfaces — warm cream */
  --color-bg:            #f8f5e9;   /* Slide root */
  --color-bg-warm:       #e9e3cf;   /* Inactive secondary field */
  --color-panel:         #fffdf2;   /* Card / module body */
  --color-panel-alt:     #f8f5e9;
  --color-panel-strong:  #e9e3cf;   /* Header band, grouped row */

  /* Ink */
  --color-text:          #111111;   /* Headings, controls, body */
  --color-muted:         #4a4a42;   /* Metadata, helper copy */
  --color-on-accent:     #fffdf2;   /* Text on red fill */

  /* Primary accents — Bauhaus four-color set */
  --color-accent:        #d62d20;   /* Red — selection / kicker / key action */
  --color-accent-hover:  #ae1f16;
  --color-accent-soft:   #f4d4c8;
  --color-coral:         #d62d20;
  --color-coral-soft:    #f0aaa1;
  --color-gold:          #f7c600;   /* Yellow — emphasis / highlight field */
  --color-gold-soft:     #ffe88a;
  --color-violet:        #0057b8;   /* Blue — structural counterweight, shadow direction */

  /* Functional */
  --color-error:         #d62d20;
  --color-error-bg:      #f4d4c8;
  --color-success:       #008f66;
  --color-success-bg:    #cfe9dc;
  --color-info:          #0057b8;
  --color-info-bg:       #d7e5f5;

  /* Borders */
  --color-border:        #111111;   /* 2px structural panel line */
  --color-hover-border:  #d62d20;
  --color-danger-border: #d62d20;

  /* Elevation — flat offset, never blurred */
  --color-shadow:           rgba(17, 17, 17, 0.16);
  --shadow-elevation:       8px 8px 0 rgba(0, 87, 184, 0.22);
  --shadow-elevation-hover: 8px 8px 0 rgba(214, 45, 32, 0.22);

  /* Code */
  --color-code-bg:         #111111;
  --color-code-text:       #fffdf2;
  --color-inline-code-bg:  #ffe88a;

  /* Geometry */
  --radius:                0;       /* MANDATORY — square corners only */
  --font-sans: "Arial Black", "Helvetica Neue", Arial, "Noto Sans TC", sans-serif;
  --font-mono: "Geist Mono", "JetBrains Mono", "Noto Sans TC", monospace;
}
```

### 2.2 Role Mapping

| Role | Token |
|---|---|
| Slide background | `--color-bg` |
| Card / module body | `--color-panel` |
| Header band, grouped row | `--color-panel-strong` |
| Body text | `--color-text` |
| Caption / metadata | `--color-muted` |
| Selection / primary action | `--color-accent` (red) |
| Emphasis field / inline highlight | `--color-gold` (yellow) |
| Structural counterweight / shadow direction | `--color-violet` (blue) |
| Default offset shadow | `--shadow-elevation` |
| Border on every panel | 2px solid `--color-border` |
| Code plate | `--color-code-bg` + `--color-code-text` |
| Inline code background | `--color-inline-code-bg` (yellow) |

### 2.3 Color Discipline (the four-color rule)

Every slide must visibly use **at least three** of the four primaries (black, red, yellow, blue) on the cream field. A slide that uses only black on cream reads as flat; a slide that uses red + yellow without a blue counterweight loses the constructivist tension. Use yellow as emphasis (small areas), red as kicker / action, blue as shadow direction or structural fill, black as frame and ink.

### 2.4 Contrast (WCAG)

- `--color-text` (#111) on `--color-bg` (#f8f5e9): **17.2:1** ✓ AAA
- `--color-muted` (#4a4a42) on `--color-bg`: **8.4:1** ✓ AAA
- `--color-on-accent` (#fffdf2) on `--color-accent` (#d62d20): **4.9:1** ✓ AA
- `--color-violet` (#0057b8) on `--color-bg`: **6.3:1** ✓ AA — large text and short runs; not AAA
- `--color-text` on `--color-gold` (#f7c600): **11.4:1** ✓ AAA — yellow is safe as text background
- `--color-accent` (red) on `--color-bg` text: **4.6:1** ✓ AA at large display sizes only — never on body copy

---

## 3. Typography

### 3.1 Font Families

| Role | Family | Why |
|---|---|---|
| Display + body sans | **Arial Black** → Helvetica Neue → Arial | Heavy geometric Latin grotesque; system-safe; matches Bauhaus poster weight |
| CJK | **Noto Sans TC** (700, 900) | Geometric stroke matches Arial Black's weight; no italic, no light weights |
| Mono | **Geist Mono** or **JetBrains Mono** | Mechanical badges, paths, technical labels |
| Decorative | (none) — Bauhaus rejects display fonts |   |

```css
:root {
  --font-sans: "Arial Black", "Helvetica Neue", Arial, "Noto Sans TC", sans-serif;
  --font-mono: "Geist Mono", "JetBrains Mono", "Noto Sans TC", monospace;
}
body { font-family: var(--font-sans); font-weight: 700; }
```

### 3.2 Type Scale

| Token | Size | Line-height | Weight | Notes |
|---|---|---|---|---|
| `display-hero` | clamp(56px, 7.5vw, 104px) | 0.95 | 900 | letter-spacing -0.04em |
| `display-hero-zh` | clamp(40px, 5vw, 72px) | 1.1 | 900 | 70% of Latin |
| `display-h2` | 48px | 1.05 | 900 | -0.04em |
| `display-h2-zh` | 32px | 1.25 | 900 |   |
| `kicker` | 14px | 1.0 | 900 uppercase | letter-spacing 0.04em |
| `stat-value` | 96px | 0.9 | 900 tnum | red or black |
| `stat-label` | 13px | 1.3 | 700 uppercase | 0.04em, muted |
| `body-lg` | 22px | 1.5 | 700 |   |
| `body-md` | 17px | 1.55 | 700 |   |
| `body-zh` | 18px | 1.75 | 700 |   |
| `caption` | 13px | 1.4 | 700 | muted |
| `code` | 14px | 1.6 | 400 | mono |

### 3.3 Type Rules

- Headings use `font-weight: 900` (Arial Black is the natural 900).
- Large headings use `letter-spacing: -0.04em`.
- Section kickers use `letter-spacing: 0.04em` and uppercase.
- Body weight stays at 700 — anything lighter loses the Bauhaus voice.
- **No italic anywhere.** Italic is forbidden in this style.
- **No CSS uppercase transform on CJK.** Apply uppercase only to Latin.
- Numerals use tabular figures: `font-feature-settings: "tnum"` on every stat / table.

---

## 4. Spacing & Rhythm

### 4.1 Vertical Scale (8-point grid)

| Token | Value | Role |
|---|---|---|
| `space-1` | 4px |   |
| `space-2` | 8px | Strip width, hairline gutter |
| `space-3` | 16px |   |
| `space-4` | 24px | Module inner padding |
| `space-5` | 32px |   |
| `space-6` | 48px | Hero clearance |
| `space-7` | 64px | Section divider gap |
| `space-8` | 96px | Reserved (rare) |

### 4.2 Slide Grid (16:9 reveal canvas)

| Token | Value |
|---|---|
| `slide-padding-x` | 64px |
| `slide-padding-y` | 56px |
| `content-max-w` | 1080px |
| `column-gap` | 32px |
| Two-column ratio | 1 / 1, or 2 / 1 (asymmetric Bayer-style) |
| Three-column | 1 / 1 / 1 |
| Module gap | 16px (gridlines stay legible at gap) |

**Density rule**: unlike minimal-modern, Bauhaus deliberately fills the slide. Aim for **55–80% content density**. Empty cream is allowed but it must read as a *deliberate block*, not as default whitespace. Below 50% density a slide loses constructivist weight.

---

## 5. Surfaces & Borders

| Token | Value |
|---|---|
| `card-radius` | **0** — square corners are mandatory |
| `card-bg` | `--color-panel` |
| `card-border` | **2px solid `--color-border`** (always present) |
| `card-shadow` | `--shadow-elevation` (8px 8px 0 blue, no blur) |
| `card-hover-shadow` | `--shadow-elevation-hover` (red tint) |
| `module-strip` | 8px solid bar in `--color-accent` or `--color-gold` along left edge |
| `divider` | 2px solid `--color-border` |
| `accent-rule` | 8px solid `--color-accent` (left bar on quote / callout) |

### 5.1 Module Spec

```css
.module {
  background: var(--color-panel);
  border: 2px solid var(--color-border);
  border-radius: 0;
  box-shadow: var(--shadow-elevation);
  padding: 32px;
  min-height: 0; overflow: hidden; box-sizing: border-box;
}
.module--accented::before {
  content: "";
  position: absolute; inset: 0 auto 0 0; width: 8px;
  background: var(--color-accent);
}
.module:hover { box-shadow: var(--shadow-elevation-hover); }
```

(`min-height` / `overflow` required by `rules/responsive-auto-fit.md`. The `position: relative` on the parent is required for the `::before` strip.)

### 5.2 Forbidden Surface Treatments

- ❌ `border-radius` > 0
- ❌ `box-shadow` with non-zero blur radius
- ❌ Multiple stacked drop shadows
- ❌ Gradient backgrounds on cards
- ❌ Semi-transparent glass blur (`backdrop-filter: blur`)

---

## 6. Texture & Atmosphere

Bauhaus atmosphere is **structural, not ambient**. The page texture is a printed-grid feel, not a glow.

### 6.1 Page Texture

```css
body {
  background: var(--color-bg);
  background-image:
    linear-gradient(90deg, rgba(17, 17, 17, 0.06) 1px, transparent 1px),
    linear-gradient(rgba(17, 17, 17, 0.06) 1px, transparent 1px),
    linear-gradient(135deg, transparent 0 72%, rgba(0, 87, 184, 0.12) 72% 86%, transparent 86%);
  background-size: 32px 32px, 32px 32px, 100% 100%;
}
```

- Two crossed hairline grids → drafting-table feel
- A single diagonal blue band → Bauhaus poster motion without becoming illustration
- The diagonal band MUST sit behind content; never overlap text legibility zone

### 6.2 Allowed Decoration

| Allowed | Forbidden |
|---|---|
| Solid colored geometric shape (circle / triangle / square) in red, yellow, or blue | Glass morphism / backdrop-filter blur |
| 8px-wide colored strip along a panel edge | Particle backgrounds |
| Number / letter set as a giant graphic mark (e.g., `01` at 220px in cream-on-blue) | Rotating glow borders |
| Hairline grid overlay | Neon glow / pulse |
| Black-and-cream halftone block | Photo backgrounds |
|   | Hand-drawn doodles |

### 6.3 Geometric Shape Library

```html
<!-- circle (red) -->
<div style="width:160px;height:160px;background:var(--color-accent);"></div>

<!-- triangle (yellow) -->
<div style="width:0;height:0;border-left:80px solid transparent;border-right:80px solid transparent;border-bottom:140px solid var(--color-gold);"></div>

<!-- quarter-arc (blue) -->
<svg width="200" height="200" aria-hidden="true">
  <path d="M0,200 A200,200 0 0,1 200,0 L0,0 Z" fill="var(--color-violet)"/>
</svg>
```

Place one or two such shapes per slide as **structural counterweights** to the text block. Anchor them to slide edges; never float them in the middle.

---

## 7. Signature Components

### 7.1 Hero Title Slide

- `--color-bg` background with grid texture and diagonal blue band
- Anchored geometric shape (red circle or yellow triangle) clipped by slide edge
- Kicker: 14px Arial Black uppercase red `01 — KEYNOTE` with 0.04em tracking
- Title: `display-hero`, weight 900, black ink, **never** gradient
- CJK subtitle: 70% size, weight 900, muted ink
- Bottom strip: thin 2px black rule + caption row (date · author)

### 7.2 Section Divider

- Cream field with one giant numeric mark (e.g., `02`) at 220px in `--color-violet`
- 2px black rule above bilingual section name
- Section name: bilingual stack (Latin display-h2 + CJK display-h2-zh)
- Optional 8px red strip running the full slide width along the bottom

### 7.3 Stat Strip (3 or 4 columns)

- Each stat sits inside a 2px-bordered black-frame module
- Stat value at 96px Arial Black 900, color alternates **red → black → blue → black** across columns
- Stat label below in 13px uppercase muted with 0.04em tracking
- Modules separated by 16px gutter (the gap shows the cream grid through)
- Optional yellow `--color-gold` fill on one of the stat modules to break symmetry

### 7.4 Content Module (default)

- White cream module (`--color-panel`) with 2px black border and blue offset shadow
- Optional 8px left strip in `--color-accent` for "kicker" variant
- H3 title: 22px Arial Black 900 black ink
- Body: 17px weight 700, paragraph max 3 lines

### 7.5 Quote / Callout

- `--color-panel-strong` background (warmer cream)
- 8px `--color-accent` left strip
- Quote: 26px weight 900 black ink
- Attribution: 13px uppercase muted with 0.04em tracking
- No quotation-mark glyph decoration — the strip is the mark

### 7.6 Code Block

- Fill: `--color-code-bg` (#111)
- Text: `--color-code-text` (cream) at 14px mono
- Top-right tag: 13px uppercase mono in `--color-gold` showing the language (`PYTHON`)
- Inline code uses `--color-inline-code-bg` (yellow) over black text
- 2px black border, 8px blue offset shadow, 0 radius

### 7.7 Diagram / Schematic

- Bauhaus excels at **labeled diagrams**. Use them.
- Stroke: 2px solid black
- Fill: red, yellow, blue, or cream — never gradient
- Labels: 13px uppercase mono, leader lines 1px black with no arrowhead
- Place a single thin blue rule under the diagram caption

### 7.8 End Mark

- Cream field with one large geometric assembly (e.g., red circle + black square + yellow triangle stacked at 1/3 alignment)
- Centered: "Ende · 結 束" at 64px Arial Black 900 black
- Bottom: contact / next-steps in 13px uppercase muted

---

## 8. Motion & Effects Policy

```yaml
motion-policy:
  required:
    - block-slide-entrance         # 0.4s ease-out, geometric block slides in from edge, no fade
  allowed:
    - grid-snap-fragment           # fragment appears as if snapping into a grid cell, 0.25s step()
    - color-flip-on-hover          # red ↔ black ↔ yellow swap, 0.15s, no blur
    - stripe-draw-in               # 8px colored strip animates from 0 to full width, 0.5s
    - svg-shape-build              # geometric shapes appear sequentially, 0.3s each
  forbidden:
    - glass-morphism
    - rotating-glow-border
    - particle-background
    - gradient-text
    - pulse-glow
    - shimmer-text
    - neon-glow
    - confetti
    - blur-fade                    # all blur is forbidden
    - bezier-ease-out-curve        # only step() or linear timing — Bauhaus is mechanical
  density:
    continuous-animations-per-slide: 0   # zero infinite loops; mechanical motion is event-driven
    slides-with-effects: 100             # every slide may use entrance motion (it is structural)
  reduced-motion:
    disable: [block-slide-entrance, grid-snap-fragment, stripe-draw-in, svg-shape-build]
    keep:    []                           # entirely still is acceptable for this style
```

This style overrides the default 80% effect-coverage requirement in `rules/visual-effects-standard.md`. Bauhaus motion is mechanical and event-driven — `step()` and short linear transitions only. **No blur, no glow, no infinite loops.** The discipline of square corners and flat shadows IS the visual signature; motion exists to reinforce structure, not to seduce.

---

## 9. Slide Templates (HTML skeletons)

### 9.1 Hero

```html
<section class="slide-hero" data-theme="bauhaus">
  <div class="hero-shape hero-shape--circle"></div>
  <div class="kicker">01 — KEYNOTE</div>
  <h1>
    <span class="en">Mechanical clarity</span>
    <span class="zh">機械式的清晰</span>
  </h1>
  <div class="meta">Q2 2026 · WILLY DU</div>
  <div class="hero-rule"></div>
</section>
```

### 9.2 Content Module

```html
<section>
  <div class="kicker">02 — DECISION</div>
  <h2>The position <span class="zh">立 場</span></h2>
  <article class="module module--accented">
    <h3>One position per slide</h3>
    <p>If a second position appears, split into a second module.</p>
  </article>
</section>
```

### 9.3 Stat Strip

```html
<section>
  <div class="kicker">Q2 RESULTS</div>
  <div class="stat-strip">
    <div class="stat module">
      <span class="value" style="color:var(--color-accent)">42%</span>
      <span class="label">COST DOWN · 成本下降</span>
    </div>
    <div class="stat module">
      <span class="value">7.4×</span>
      <span class="label">THROUGHPUT · 吞吐量</span>
    </div>
    <div class="stat module" style="background:var(--color-gold)">
      <span class="value">99.9%</span>
      <span class="label">UPTIME · 可用性</span>
    </div>
  </div>
</section>
```

### 9.4 Section Divider

```html
<section class="slide-section-divider">
  <div class="big-numeral" aria-hidden="true">02</div>
  <div class="rule rule--top"></div>
  <h2>
    <span class="en">Architecture</span>
    <span class="zh">架 構</span>
  </h2>
  <div class="strip strip--bottom"></div>
</section>
```

### 9.5 Code

```html
<pre class="code-plate">
<span class="lang-tag">PYTHON</span>
<code>def commit(state):
    return state.persist()</code>
</pre>
```

---

## 10. Don'ts

- ❌ Any `border-radius > 0` — square corners are non-negotiable
- ❌ Any `box-shadow` with non-zero blur radius — flat offset only
- ❌ Glass morphism / `backdrop-filter: blur` anywhere
- ❌ Gradient backgrounds, gradient text, gradient borders
- ❌ Italic on Latin or CJK
- ❌ CSS `text-transform: uppercase` on CJK (apply uppercase only to Latin via `lang="en"` scoping)
- ❌ More than two saturated accent colors visible at once on one slide outside the four-color set (red / yellow / blue + black on cream)
- ❌ A single color across the whole deck — Bauhaus needs the **black + at least three** of red / yellow / blue / cream tension
- ❌ Drop shadows with blur on type ("neon glow" titles)
- ❌ Photographic backgrounds — replace with monochromatic halftone or geometric block
- ❌ Pure black `#000` — always `#111111` so the cream field reads as paper, not screen
- ❌ Decorative emoji or icon glyphs in headings — icons must encode an action, never decoration
- ❌ Centered body copy (alignment is left for body, center reserved for hero numerals and end mark)
- ❌ Continuous loops / pulses / shimmer — all motion must be event-driven (entrance, hover, fragment)

---

Extracted and adapted from `draft-system/web/design-tokens/bauhaus-draft-system.md`. The `--color-*` token names match the draft-system source so a single CSS payload drives both surfaces.
