# Minimal Modern — Design Tokens

> 風格定位：**簡約現代風（Minimal Modern）** · 瑞士平面設計影響 · 高級留白 · 單一強調色
> Reference mood：Stripe.com · Linear light dashboard · Apple Newsroom · Notion · Things 3

---

## 1. Concept & Mood

| Key | Value |
|---|---|
| **Aesthetic direction** | Premium light surfaces, generous whitespace, content-led |
| **Reference mood** | Stripe documentation hero · Linear changelog · Vercel marketing pages · Apple Newsroom · Frame.io marketing · Things 3 product page |
| **Voice** | Confident, terse, well-edited — never glib, never overwritten |
| **Primary tension** | Vast quiet whitespace × one saturated accent × tight typographic hierarchy |
| **Avoid** | Glass morphism, neon glow, rotating gradients, particle backgrounds, hand-drawn doodles, stock illustrations, decorative shadows, multi-color charts — **deliberately none of the "premium effects" stack** |

The premium feel comes from restraint: a single accent color used sparingly, type that breathes, and ruthlessly edited content. If a slide tempts you toward two accent colors, split it into two slides.

---

## 2. Color Tokens

### 2.1 Palette

```css
/* Surface — warm-neutral whites */
--surface-base:    #FAFAF9;   /* Slide root */
--surface-card:    #FFFFFF;   /* Cards, raised content */
--surface-subtle:  #F4F4F5;   /* Inset, side rails */

/* Text */
--text-primary:    #18181B;   /* Headlines, body emphasis */
--text-body:       #27272A;   /* Body text */
--text-secondary:  #52525B;   /* Captions, metadata */
--text-muted:      #A1A1AA;   /* Eyebrows, deemphasized */

/* Accent — single saturated color, project-defined */
--accent:          #4F46E5;   /* Default: indigo. Override per project. */
--accent-soft:     #E0E7FF;   /* Tinted background for accent zones */
--accent-strong:   #3730A3;   /* Hover / pressed state */

/* Borders */
--border-subtle:   #E4E4E7;   /* Default 1px hairline */
--border-strong:   #D4D4D8;   /* Tables, separators */

/* Functional */
--success:         #10B981;
--warning:         #F59E0B;
--danger:          #EF4444;
--shadow-sm:       0 1px 2px rgba(24,24,27,0.04);
--shadow-md:       0 4px 12px rgba(24,24,27,0.06);
```

### 2.2 Accent Override

The accent is one color per project. Default indigo `#4F46E5`. Common overrides:

| Mood | Hex |
|---|---|
| Indigo (default) | `#4F46E5` |
| Coral | `#F97316` |
| Forest | `#059669` |
| Crimson | `#DC2626` |
| Slate | `#475569` |

**Rule**: pick exactly one. Never two. Saturation must be ≥ 65 for readability against white.

### 2.3 Role Mapping

| Role | Token |
|---|---|
| Slide background | `--surface-base` |
| Card background | `--surface-card` (with `--shadow-sm`) |
| Inset / pull-out | `--surface-subtle` |
| Body text | `--text-body` |
| Headline | `--text-primary` |
| Caption / kicker | `--text-secondary` |
| Eyebrow / mono label | `--text-muted` |
| Primary accent | `--accent` (links, key stat values, illustrative chart bars) |
| Accent zone background | `--accent-soft` |
| Default divider | `--border-subtle` |

### 2.4 Contrast (WCAG)

- `--text-primary` on `--surface-base`: **17.6:1** ✓ AAA
- `--text-body` on `--surface-base`: **14.2:1** ✓ AAA
- `--text-secondary` on `--surface-base`: **8.0:1** ✓ AAA
- `--accent` (indigo) on `--surface-base`: **6.5:1** ✓ AA — safe for body links
- `--text-secondary` on `--accent-soft`: **6.4:1** ✓ AA

---

## 3. Typography

### 3.1 Font Families

| Role | Family | Why |
|---|---|---|
| Display + body sans (Latin) | **Inter** (300, 400, 500, 600, 700) | Best general-purpose UI typeface; tight tracking at large sizes |
| Mono (Latin) | **Geist Mono** or **JetBrains Mono** | Used only for code and numeric data tables — sparingly |
| CJK | **Noto Sans TC** (300, 400, 500, 700) | Matches Inter's geometry better than serifs |
| Numerals | Inter **tabular-nums** | `font-feature-settings: "tnum"` for all stat columns |

Stack:

```css
:root {
  --font-sans: "Inter", "Noto Sans TC", system-ui, sans-serif;
  --font-mono: "Geist Mono", "JetBrains Mono", "Noto Sans TC", monospace;
}
body { font-family: var(--font-sans); }
code, .mono { font-family: var(--font-mono); }
```

### 3.2 Type Scale

| Token | Size | Line-height | Weight | Notes |
|---|---|---|---|---|
| `display-hero` | clamp(48px, 6.5vw, 84px) | 1.05 | 600 | Tight tracking |
| `display-hero-zh` | clamp(32px, 4.2vw, 56px) | 1.25 | 600 | 65% of Latin |
| `display-h2` | 40px | 1.15 | 600 |   |
| `display-h2-zh` | 26px | 1.4 | 600 |   |
| `stat-value` | 56px | 1.0 | 700 tnum | Use `--accent` |
| `stat-label` | 14px | 1.4 | 500 | `--text-secondary` |
| `body-lg` | 20px | 1.55 | 400 |   |
| `body-md` | 16px | 1.6 | 400 |   |
| `body-zh` | 17px | 1.85 | 400 |   |
| `eyebrow` | 12px | 1.0 | 600 uppercase | letter-spacing 0.18em, `--text-muted` |
| `caption` | 13px | 1.5 | 400 | `--text-secondary` |
| `code` | 14px | 1.65 | 400 |   |

### 3.3 Letter-spacing

| Role | letter-spacing |
|---|---|
| Display Latin | -0.022em (tight) |
| Display CJK | 0.02em |
| Body | 0 (default) |
| Body CJK | 0.02em |
| Eyebrow uppercase | 0.18em |
| Stat value | -0.015em |

### 3.4 Font Features

```css
font-feature-settings: "ss01", "cv11", "cv02";
.tnum, .stat-value { font-feature-settings: "tnum", "ss01"; }
```

---

## 4. Spacing & Rhythm

### 4.1 Vertical Scale (8-point grid)

| Token | Value | Role |
|---|---|---|
| `space-1` | 4px |   |
| `space-2` | 8px |   |
| `space-3` | 16px |   |
| `space-4` | 24px |   |
| `space-5` | 32px |   |
| `space-6` | 48px |   |
| `space-7` | 64px |   |
| `space-8` | 96px | Hero clearance |

### 4.2 Slide Grid (16:9 reveal canvas)

| Token | Value |
|---|---|
| `slide-padding-x` | 96px (large — whitespace is the feature) |
| `slide-padding-y` | 80px |
| `content-max-w` | 820px |
| `column-gap` | 64px |
| Two-column ratio | 1 / 1 |
| Three-column | 1 / 1 / 1 |

**Whitespace rule**: each slide must reserve ≥ 35% empty space. If content fills more than 65% of the slide bounding box, split into two slides.

---

## 5. Surfaces & Borders

| Token | Value |
|---|---|
| `card-radius` | 12px |
| `card-radius-sm` | 8px |
| `card-bg` | `--surface-card` |
| `card-shadow` | `--shadow-sm` (default) or `--shadow-md` (raised) |
| `card-border` | none (shadow does the work) OR 1px `--border-subtle` |
| `divider` | 1px solid `--border-subtle` |
| `divider-strong` | 1px solid `--border-strong` |
| `accent-rule` | 3px solid `--accent` (left-border on quote / callout) |

### 5.1 Card Spec

```css
.card {
  background: var(--surface-card);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  padding: 32px;
  min-height: 0; overflow: hidden; box-sizing: border-box;
}
.card.raised { box-shadow: var(--shadow-md); }
.card.bordered { box-shadow: none; border: 1px solid var(--border-subtle); }
```

(`min-height` / `overflow` required by `rules/responsive-auto-fit.md`.)

---

## 6. Texture & Atmosphere

This style explicitly rejects most atmospheric elements. The "atmosphere" is whitespace itself.

| Allowed | Forbidden |
|---|---|
| Subtle hairline grid (`--border-subtle`) | Particle backgrounds |
| One large flat-color decorative shape (a circle, a quarter arc) per hero | Glass morphism |
| 1px accent rule under section title | Rotating glow borders |
| Mono numeric label as decoration | Neon glow / drop shadow with blur > 12px |
| Inline SVG line illustration (1.5px stroke, monochromatic) | Photo backgrounds with overlay |

### 6.1 Optional Hero Decoration

A single large flat shape (circle, quarter arc, or numeric mark) in `--accent-soft`, low z-index, partially clipped by the slide edge. Reads as confident, not noisy.

```html
<svg class="hero-decoration" aria-hidden="true">
  <circle cx="92%" cy="20%" r="180" fill="var(--accent-soft)" />
</svg>
```

---

## 7. Signature Components

### 7.1 Hero Title Slide

- `--surface-base` background
- Optional one accent shape (see §6.1)
- Eyebrow: 12px mono uppercase muted
- Title: display-hero, weight 600, primary color, NOT gradient
- CJK subtitle below, 65% size, weight 600, secondary color
- Bottom: thin row of date + author in caption size

### 7.2 Section Divider

- Centered slide
- Eyebrow `02 — Section title` in mono uppercase
- Big numeral (60–80px) `--accent`
- Bilingual section name beneath
- A single 64px wide accent line above the numeral

### 7.3 Stat Strip (3 or 4 columns)

- Each stat: value (56px, accent, tabular nums) + label (14px secondary, 2-line max)
- Columns separated by `--space-7` gutters, no border between
- Caption under stat strip, italic-feeling-but-upright (Inter weight 500 secondary)

### 7.4 Card (default content)

- White card with `--shadow-sm`
- Optional 3px left border in `--accent` for "callout" variant
- H3 title 22px weight 600, body text 16px weight 400

### 7.5 Quote / Pullout

- `--surface-subtle` background block, no card border
- 3px `--accent` left border
- Quote text 24px weight 500 primary, attribution 13px secondary

### 7.6 Code Block

- `--surface-subtle` fill, NO drop shadow
- Mono 14px, line-height 1.65
- Syntax: keyword `--accent`, string `--text-secondary`, comment `--text-muted` italic
- Top-right: tiny mono label with the language (`PYTHON`)

### 7.7 End Slide

- `--surface-base` background
- Centered: 64px primary text "Thank you · 謝 謝"
- Bottom: contact / next-steps in 14px secondary

---

## 8. Motion & Effects Policy

```yaml
motion-policy:
  required:
    - fade-up-entrance          # 0.8s ease-out, single layer per slide
  allowed:
    - subtle-translate-on-fragment   # 8px shift on `.fragment.fade-up`
    - underline-draw-on-link         # accent line under hovered links
    - svg-line-draw                  # only for monochromatic line illustrations
  forbidden:
    - glass-morphism
    - rotating-glow-border
    - particle-background
    - gradient-text
    - pulse-glow
    - shimmer-text
    - neon-glow
    - confetti
    - data-auto-animate-morph        # transitions kept simple
  density:
    continuous-animations-per-slide: 0   # zero infinite loops
    slides-with-effects: 60              # entrance fade only counts
  reduced-motion:
    disable: [fade-up-entrance, subtle-translate-on-fragment]
    keep:    []                           # acceptable to be totally still
```

This style overrides `rules/visual-effects-standard.md`'s default 80% effect-coverage requirement, which is calibrated for the tech-mystery / premium-effect default. Minimal modern instead requires that no continuous animations run — the discipline IS the effect.

---

## 9. Slide Templates (HTML skeletons)

### 9.1 Hero

```html
<section class="slide-hero">
  <svg class="hero-decoration" aria-hidden="true"><circle cx="92%" cy="22%" r="200" fill="var(--accent-soft)"/></svg>
  <div class="kicker">02 — Strategy Briefing</div>
  <h1>
    <span class="en">Quietly compounding bets</span>
    <span class="zh">緩慢累積的賭注</span>
  </h1>
  <div class="meta">Q2 2026 · Willy Du</div>
</section>
```

### 9.2 Content Card

```html
<section>
  <h2>The decision <small class="zh">這個決策</small></h2>
  <div class="card callout">
    <h3>One key idea</h3>
    <p>Keep the body to a single paragraph. If it grows, split the slide.</p>
  </div>
</section>
```

### 9.3 Stat Strip

```html
<section>
  <div class="kicker">Q2 RESULTS</div>
  <div class="stat-strip">
    <div class="stat"><span class="value">42%</span><span class="label">Cost down · 成本下降</span></div>
    <div class="stat"><span class="value">7.4×</span><span class="label">Throughput · 吞吐量</span></div>
    <div class="stat"><span class="value">99.9%</span><span class="label">Uptime · 可用性</span></div>
  </div>
</section>
```

---

## 10. Don'ts

- ❌ Two accent colors on one deck — pick one
- ❌ Glass / blur / particles / glow — wrong style
- ❌ Multiple drop shadows of varying blur — adds visual noise
- ❌ Stock 3D illustrations (Storyset, Humaaans, Vibrant) — looks like a SaaS landing page from 2021
- ❌ Italic on CJK
- ❌ Decorative emoji in titles
- ❌ Hard pure black `#000` text — always `#18181B` for tone
- ❌ Multi-color data charts — use one accent + grayscale variants
- ❌ Filling the slide above 65% — violates the whitespace contract
- ❌ Centering body text (alignment is left for body, center reserved for hero only)
