# Tech Mystery — Design Tokens

> 風格定位：**科技神秘風（Tech Mystery）** · 深夜運營中台 · 全息景深 · 節制版賽博龐克
> Reference mood：Apple Vision keynote dark · Linear dashboard · Severance title sequence · 真實機場 ATC 螢幕

---

## 1. Concept & Mood

| Key | Value |
|---|---|
| **Aesthetic direction** | Late-night ops console, holographic depth, considered cyberpunk |
| **Reference mood** | Apple Vision Pro dark UI · Linear dark dashboard · Severance opening titles · NVIDIA keynote 2024 · Devin / Cognition launch deck |
| **Voice** | Confident, technical, slightly cinematic — never playful, never garish |
| **Primary tension** | Deep midnight surfaces × electric cyan precision × magenta heat × CJK 中黑體 weighty calm |
| **Avoid** | Saturated rainbows, gritty grunge textures, Comic Sans irony, neon-overload, gaming RGB, 90s sci-fi blue/orange complementary, glass that looks like a mobile-app sticker |

The mystery comes from restraint, not from chaos. One pulse of cyan against a vast midnight field reads more "future" than ten neon signs.

---

## 2. Color Tokens

### 2.1 Palette

```css
/* Base / surface */
--bg-base:        #05070d;   /* Deepest, used for slide root */
--bg-surface:    #0b1020;   /* Default content surface, near-black with blue undertone */
--bg-elevated:   #131a30;   /* Glass card fill (used at 0.55 alpha over surface) */
--bg-trace:      #1c2647;   /* Hairline traces, subtle grid lines */

/* Text */
--text-primary:   #e7eefb;  /* High contrast against bg-base */
--text-secondary: #9aa9c7;  /* Body / metadata */
--text-muted:     #5e6c8a;  /* Captions, eyebrows, deemphasized */

/* Accents (signature) */
--accent-cyan:    #22d3ee;  /* Primary highlight, glow source */
--accent-magenta: #e879f9;  /* Secondary heat / counterpoint */
--accent-violet:  #8b5cf6;  /* Bridge between cyan and magenta in gradients */

/* Glow specifics — alpha-blended for layered light */
--glow-1:         rgba(34, 211, 238, 0.35);   /* cyan halo */
--glow-2:         rgba(139, 92, 246, 0.30);   /* violet halo */
--glow-3:         rgba(232, 121, 249, 0.28);  /* magenta halo */
--glow-rim:       rgba(168, 230, 255, 0.18);  /* Edge rim light */

/* Functional */
--border-fine:    rgba(180, 210, 255, 0.10);  /* 1px hairline on cards */
--border-glow:    rgba(34, 211, 238, 0.50);   /* highlighted edge */
--shadow-deep:    0 30px 80px rgba(0, 0, 0, 0.55);
```

### 2.2 Role Mapping

| Role | Token | Notes |
|---|---|---|
| Slide background (root) | `--bg-base` | Often combined with particle canvas at 0.4 opacity |
| Card / panel surface | `--bg-elevated` 55% over `--bg-surface` | Apply backdrop-filter: blur(18px) saturate(160%) |
| Body text | `--text-primary` on dark | Never use accent colors for body text |
| Caption / kicker | `--text-secondary` |   |
| Eyebrow / mono label | `--text-muted` + `--accent-cyan` underline glow |   |
| Primary accent | `--accent-cyan` | Stat values, key numbers, gradient origin |
| Secondary accent | `--accent-magenta` | Rare — only for contrast / emphasis pivots |
| Signature gradient | linear `--accent-cyan` → `--accent-violet` → `--accent-magenta` | Use on display titles only |
| Border (default) | `--border-fine` |   |
| Border (active / hover) | `--border-glow` |   |

### 2.3 Contrast (WCAG)

- `--text-primary` on `--bg-base`: **17.2:1** ✓ AAA
- `--text-secondary` on `--bg-base`: **8.4:1** ✓ AAA
- `--accent-cyan` on `--bg-base`: **11.1:1** ✓ AAA — safe for stat values
- `--accent-magenta` on `--bg-base`: **8.2:1** ✓ AA — short runs only (titles, callouts)
- Body text never uses accent colors. Accents are for type ≥ 24px or non-text glow.

---

## 3. Typography

### 3.1 Font Families

| Role | Family | Why |
|---|---|---|
| Display sans (Latin) | **Space Grotesk** (300, 500, 700) | Geometric warmth at large sizes, distinct enough to feel custom |
| Body sans (Latin) | **Inter** (400, 500, 600) | Workhorse readability for body and metadata |
| Mono / data (Latin) | **JetBrains Mono** (variable) | Used heavily — eyebrows, stats unit suffix, code, terminal labels |
| Display CJK | **Noto Sans TC** weight 300 | Light weight reads as architectural, not editorial |
| Body CJK | **Noto Sans TC** weight 400-500 |   |
| Numerals (display) | Space Grotesk **tabular nums** | `font-feature-settings: "tnum"` for stat strips |

Bilingual stack:

```css
body { font-family: "Inter", "Noto Sans TC", system-ui, sans-serif; }
.display, h1, h2 { font-family: "Space Grotesk", "Noto Sans TC", sans-serif; }
.mono, code, .eyebrow { font-family: "JetBrains Mono", "Noto Sans TC", monospace; }
```

### 3.2 Type Scale

| Token | Size | Line-height | Weight | Family | Notes |
|---|---|---|---|---|---|
| `display-hero` | clamp(56px, 7vw, 96px) | 0.95 | 300 | Space Grotesk | Apply gradient text |
| `display-hero-zh` | clamp(38px, 4.5vw, 60px) | 1.2 | 300 | Noto Sans TC | 60–65% of Latin pair |
| `display-h2` | 48px | 1.05 | 500 | Space Grotesk |   |
| `display-h2-zh` | 28px | 1.3 | 400 | Noto Sans TC |   |
| `stat-value` | 64px | 1.0 | 300 | Space Grotesk tnum | Use cyan |
| `stat-unit` | 18px | 1.0 | 400 | JetBrains Mono | `--text-muted` |
| `body-lg` | 22px | 1.55 | 400 | Inter |   |
| `body-md` | 17px | 1.65 | 400 | Inter |   |
| `body-zh` | 18px | 1.85 | 400 | Noto Sans TC |   |
| `eyebrow` | 11px | 1.0 | 500 | JetBrains Mono uppercase | letter-spacing 0.32em, cyan |
| `meta` | 12px | 1.4 | 500 | Inter | `--text-secondary` |
| `code` | 14px | 1.7 | 400 | JetBrains Mono |   |

### 3.3 Letter-spacing

| Role | letter-spacing |
|---|---|
| Display Latin large | -0.02em |
| Display CJK | 0.04em |
| Body CJK | 0.02–0.04em |
| Eyebrow uppercase Latin | 0.32em |
| Stat value | -0.01em |
| Mono code | 0 |

### 3.4 Font Features

```css
font-feature-settings: "ss01", "ss02", "tnum", "cv11";
```

- `tnum` — tabular numerals for stat alignment
- `ss01`, `ss02` — Inter stylistic sets (alternate `a`, `g`)
- `cv11` — Inter alternate `1`

---

## 4. Spacing & Rhythm

### 4.1 Vertical Scale

| Token | Value | Role |
|---|---|---|
| `space-0` | 4px | Inline label gap |
| `space-1` | 8px | Tight inline rhythm |
| `space-2` | 16px | Paragraph break |
| `space-3` | 24px | Card internal padding (small) |
| `space-4` | 32px | Card internal padding (default) |
| `space-5` | 48px | Block separation |
| `space-6` | 64px | Slide vertical gutter (top/bottom) |
| `space-7` | 96px | Hero clearance |

### 4.2 Slide Grid (16:9 reveal canvas, 960×700 authored)

| Token | Value |
|---|---|
| `slide-padding-x` | 80px |
| `slide-padding-y` | 64px |
| `content-max-w` | 880px |
| `column-gap` | 48px |
| Two-column ratio | 5 / 4 (asymmetric for tension) |
| Three-column | 1 / 1 / 1 |
| Hero left band | 120px reserved for kicker + numeral |

---

## 5. Surfaces & Borders

| Token | Value | Usage |
|---|---|---|
| `card-radius` | 18px |   |
| `card-radius-sm` | 12px | Chip / badge |
| `card-bg` | `var(--bg-elevated)` 55% alpha + blur(18px) saturate(160%) | Glass card |
| `card-border` | 1px solid `var(--border-fine)` |   |
| `card-border-active` | 1px solid `var(--border-glow)` + 0 0 24px `var(--glow-1)` |   |
| `divider-fine` | 1px solid `rgba(180,210,255,0.06)` |   |
| `divider-glow` | linear-gradient 90deg, transparent → cyan@0.4 → transparent | Section breaks |
| `glow-border` | conic-gradient using `--glow-1/2/3` rotating via `@property --angle` | Reserved for hero / title cards |

### 5.1 Glass Card Spec

```css
.glass-card {
  background: linear-gradient(180deg, rgba(19,26,48,0.65), rgba(11,16,32,0.55));
  backdrop-filter: blur(18px) saturate(160%);
  -webkit-backdrop-filter: blur(18px) saturate(160%);
  border: 1px solid var(--border-fine);
  border-radius: 18px;
  padding: 32px;
  min-height: 0; overflow: hidden; box-sizing: border-box;
}
```

(`min-height` / `overflow` required by `rules/responsive-auto-fit.md` — do not remove.)

---

## 6. Texture & Atmosphere

### 6.1 Particle Field (default background layer)

Canvas particle layer behind every content slide:
- Particle count: 40–60 per visible slide
- Color mix: 70% cyan @ 0.2 alpha, 25% violet @ 0.18, 5% magenta @ 0.15
- Movement: drift 0.2–0.5 px/frame, slow Brownian
- Pause on slide leave (resource discipline)

### 6.2 Hairline Grid

Optional subtle grid behind hero slides:
```css
background-image:
  linear-gradient(var(--bg-trace) 1px, transparent 1px),
  linear-gradient(90deg, var(--bg-trace) 1px, transparent 1px);
background-size: 64px 64px;
opacity: 0.20;
mask-image: radial-gradient(ellipse at center, black 30%, transparent 75%);
```

### 6.3 Vignette

```css
background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%);
```

Applied as fixed overlay via `body::after`. Pulls focus to slide center.

### 6.4 Scanline (optional, opt-in per slide)

For slides with terminal / log content. Subtle horizontal scanline at 2px gap, 1% opacity. Use sparingly.

---

## 7. Signature Components

### 7.1 Hero Title Slide

- Background: `--bg-base` + hairline grid + particle canvas
- Numeral / kicker: top-left, JetBrains Mono 11px uppercase cyan
- Title: gradient text (cyan → violet → magenta), display-hero
- CJK subtitle: 60% size, weight 300, secondary text
- Date / author: bottom-left, mono 12px muted
- Optional rotating glow border on a thin frame

### 7.2 Chapter Divider

- Solid `--bg-base`
- Centered: `<small kicker> CHAPTER 02 · 章 二 </small>` then large numeral, then bilingual title
- One pulse glow on the numeral (cyan halo, 4s breathing cycle)

### 7.3 Stat Strip

- 3 or 4 columns equal width
- Each column: stat-value (cyan, tabular nums) + stat-unit (mono muted) + label (CJK weight 400 secondary)
- Border-right: 1px `var(--border-fine)` between columns; last column omits

### 7.4 Glass Content Card

- Standard `.glass-card`
- Optional rotating glow border for "key takeaway" cards (reserve to ≤ 2 per deck)
- Eyebrow at top: cyan mono uppercase
- H2 title (Space Grotesk 500)
- Body: Inter 17px or Noto Sans TC 18px

### 7.5 Code / Terminal Plate

- Fill: `--bg-base` (deeper than surface, signals "exposed terminal")
- Border: 1px solid `--border-glow` cyan
- Top tab: `[ trace.log · TERMINAL ]` mono 11px uppercase, cyan
- Syntax: keyword cyan, string magenta-soft, comment muted, function violet

### 7.6 Architecture Diagram

- Inline SVG, all strokes 1.5px `--accent-cyan` at 0.7 alpha
- Nodes: rounded rect (radius 12), fill `--bg-elevated`, stroke cyan
- Animated: `stroke-dasharray` line-draw on slide enter
- Labels: JetBrains Mono 12px

### 7.7 End Slide

- Solid `--bg-base`
- Centered: `「 END · 終 」` Space Grotesk 300 + Noto Sans TC 300
- Single pulse glow underline

---

## 8. Motion & Effects Policy

This block is read by `rules/visual-effects-standard.md` to determine which effects are required, allowed, or forbidden for this style.

```yaml
motion-policy:
  required:
    - glass-morphism            # at least on content cards
    - rotating-glow-border      # ≥ 1 hero / takeaway slide pair
    - particle-background       # all content slides
    - gradient-text             # hero + chapter dividers
    - pulse-glow                # stat values, key numerals
  allowed:
    - svg-line-draw             # diagrams
    - auto-animate-morph        # section transitions
    - scanline-overlay          # opt-in for terminal slides
    - shimmer-text              # ≤ 1 per deck, key insight only
  forbidden:
    - blink                     # WCAG safety
    - infinite-color-cycle      # reads as gimmicky
    - confetti
    - skeuomorphic-shadow
  density:
    continuous-animations-per-slide: 5  # absolute max
    slides-with-effects: 100            # all content slides
  reduced-motion:
    disable: [particle-background, rotating-glow-border, pulse-glow, shimmer-text]
    keep:    [gradient-text, fade-up entrance, glass-morphism]
```

---

## 9. Slide Templates (HTML skeletons)

### 9.1 Hero

```html
<section data-auto-animate class="slide-hero">
  <div class="kicker">PRODUCT BRIEFING · 產 品 簡 報</div>
  <h1 class="gradient-text" data-id="title">
    <span class="en">Operator Console</span>
    <span class="zh">運 營 控 制 台</span>
  </h1>
  <div class="meta">2026 · Q2 · Willy Du</div>
  <aside class="notes">{notes}</aside>
</section>
```

### 9.2 Glass Content

```html
<section>
  <div class="glass-card glow-border" data-id="card">
    <div class="eyebrow">SECTION 02 · 第 二 章</div>
    <h2>{title-en}<br><small class="zh">{title-zh}</small></h2>
    <ul class="body">
      <li class="fragment fade-up">{point}</li>
    </ul>
  </div>
  <aside class="notes">{notes}</aside>
</section>
```

### 9.3 Stat Strip

```html
<section>
  <h2>Key Numbers · 關鍵數字</h2>
  <div class="stat-strip">
    <div class="stat"><span class="value">42<small>%</small></span><span class="label">Cost reduction · 成 本 下 降</span></div>
    <div class="stat"><span class="value">7.4<small>×</small></span><span class="label">Throughput · 吞 吐 量</span></div>
    <div class="stat"><span class="value">99.9<small>%</small></span><span class="label">Uptime · 可 用 性</span></div>
  </div>
</section>
```

---

## 10. Don'ts

- ❌ Bright pure white background — breaks the mystery
- ❌ Saturated rainbow gradients — pick cyan→violet→magenta only
- ❌ Drop shadows with blur > 30px — reads as "PowerPoint glow", not console
- ❌ Comic-book outlines on icons
- ❌ Stock 3D illustration (Storyset, Humaaans) — never on this style
- ❌ Auto-playing colored video backgrounds
- ❌ Italic on CJK (no glyphs; use weight 300 + cyan instead)
- ❌ More than 5 simultaneous continuous animations on one slide
- ❌ Pure black `#000000` — always tinted toward `#05070d` for warmth-of-deep
- ❌ Decorative emoji in slide content (reserved for chat surfaces, not tech-mystery)
