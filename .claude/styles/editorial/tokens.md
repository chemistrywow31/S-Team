# Editorial — Design Tokens

> 風格定位：**編輯雜誌（Editorial Magazine）** · 暖紙 + 墨黑 + 牛血紅 · 雙語並置（CJK + Latin）
> Reference mood：Offscreen Magazine · Wired long-form · The Economist 1843 · Kinfolk
> Source: adapted from `t-team/deepagents-design-tokens.md` (extracted from `deepagents-analysis.html`).

---

## 1. Concept & Mood

| Key | Value |
|---|---|
| **Aesthetic direction** | Editorial magazine, print-inspired, ink-on-cream |
| **Reference mood** | Offscreen Magazine · Wired long-form · The Economist 1843 · Kinfolk · Eye Magazine |
| **Voice** | Confident, considered, slightly literary |
| **Primary tension** | Serif display (cultured) × mono technical marks (rigorous) × CJK body (rooted) |
| **Avoid** | Tech startup gradients, hero blur, Inter / Space Grotesk, glassy neumorphism, icon rows, neon, particles |

The page should feel like a printed spread mounted on a slide — not like a website pretending to be a magazine.

---

## 2. Color Tokens

### 2.1 Palette

```css
--ink:          #1a1613;   /* Near-black with warm undertone. Primary text. */
--ink-soft:     #3a332c;   /* Secondary text, muted body. */
--paper:        #f3ecdc;   /* Warm cream. Primary background. */
--paper-deep:   #e8dfc8;   /* Coda / inset blocks, slightly deeper cream. */
--rule:         #c9bfa4;   /* Dotted / thin rules, dividers. */
--oxblood:      #8a1c1c;   /* Signature accent. Italic emphasis, drop caps, chapter numbers. */
--oxblood-soft: #a94545;   /* Lighter oxblood for hover / secondary accents. */
--marker:       #e8c454;   /* Yellow text marker highlight (simulated pen). */
--moss:         #4a5a3a;   /* "Fit" column accent (calmer positive). */
--shadow:       rgba(26, 22, 19, 0.12);
```

### 2.2 Role Mapping

| Role | Token | Usage |
|---|---|---|
| Slide background | `--paper` | Default |
| Inset / coda | `--paper-deep` | Takeaway cards, coda slides |
| Inverted plate | `--ink` | Code plate, end mark |
| Text primary | `--ink` |   |
| Text secondary | `--ink-soft` | Deck, caption, meta |
| Accent (dominant) | `--oxblood` | Italic emphasis, chapter numerals, dropcaps, bullets |
| Accent (calm) | `--moss` | Used only for one specific column theme (e.g., "fit / use") |
| Highlight | `--marker` | Pen-style underline behind 55%–88% baseline-height |
| Rule | `--rule` | Hairlines, dotted dividers |

### 2.3 Contrast (WCAG)

- `--ink` on `--paper`: **15.4:1** ✓ AAA
- `--ink-soft` on `--paper`: **10.6:1** ✓ AAA
- `--oxblood` on `--paper`: **7.9:1** ✓ AA-large — short runs (headlines, emphasis) only, never extended body
- `--paper` on `--ink`: **15.4:1** ✓ AAA

---

## 3. Typography

### 3.1 Font Families

| Role | Family | Why |
|---|---|---|
| Display serif (Latin) | **Fraunces** (variable, opsz + SOFT axes) | Optical sizing + SOFT axis lets headlines feel warm at 100px+ |
| Reading serif (Latin) | **Newsreader** (variable, opsz) | Long-form body, pairs with Fraunces |
| CJK serif | **Noto Serif TC** (200–900) | Only broadly-licensed TC serif with full weight range |
| CJK sans | **Noto Sans TC** (300–700) | Captions, chips, technical metadata |
| Sans metadata (Latin) | **Instrument Sans** | Masthead, kickers, labels — more character than Inter |
| Mono technical | **JetBrains Mono** (variable) | Code plates, chips, tool names |

Bilingual stack:

```css
body { font-family: "Newsreader", "Noto Serif TC", Georgia, serif; }
:lang(zh), .zh { font-family: "Noto Serif TC", "Newsreader", serif; }
:lang(en), .en { font-family: "Newsreader", serif; }
```

### 3.2 Type Scale

| Token | Size (clamp) | Line-height | Weight | Family |
|---|---|---|---|---|
| `display-xl-en` | clamp(56px, 7vw, 110px) | 0.9 | 300 | Fraunces |
| `display-xl-zh` | clamp(36px, 4.5vw, 64px) | 1.15 | 300 | Noto Serif TC |
| `display-chapter` | 144px | 0.8 | 200 italic | Fraunces, oxblood |
| `display-h2-en` | 50px | 1.0 | 400 | Fraunces |
| `display-h2-zh` | 28px | 1.3 | 500 | Noto Serif TC |
| `pull-quote-zh` | 24px | 1.45 | 300 | Noto Serif TC |
| `pull-quote-en-gloss` | 16px | 1.4 | 300 italic | Fraunces |
| `deck-en` | 20px | 1.45 | 300 italic | Fraunces |
| `deck-zh` | 18px | 1.75 | 400 | Noto Serif TC |
| `body-reading-zh` | 18px | 1.85 | 400 | Noto Serif TC |
| `body-reading-en-echo` | 14px | 1.55 | 300 italic | Newsreader |
| `body-sans-zh` | 14px | 1.7 | 400 | Noto Sans TC |
| `stat-value` | 38px | 1.0 | 300 | Fraunces |
| `kicker` | 12px | 1.0 | 500 uppercase | Instrument Sans |
| `eyebrow-mono` | 10px | — | 400 uppercase | JetBrains Mono |
| `meta-label` | 11px | 2.0 | 500 uppercase | Instrument Sans |
| `code-inline` | 13px | 1.75 | 400 | JetBrains Mono |

### 3.3 Letter-spacing — critical, do not skip

| Role | letter-spacing |
|---|---|
| Large display Latin | -0.025em to -0.035em (tighten) |
| Large display CJK | 0.02em (open slightly) |
| Body CJK | 0.02em–0.05em |
| UPPERCASE meta (Latin) | 0.18em–0.35em |
| CJK meta (non-uppercase) | 0.08em–0.15em |
| Kicker | 0.35em |
| Small caps meta | 0.22em |
| Mono code | 0.02em |

**Rule**: CJK never uses `text-transform: uppercase`. Use larger tracking instead.

### 3.4 Font Variation Axes (Fraunces)

| Context | font-variation-settings |
|---|---|
| Display roman | `"SOFT" 30, "opsz" 144` |
| Display italic (oxblood) | `"SOFT" 100, "opsz" 144` (max softness) |
| Pull quote | `"SOFT" 80` |
| Stat value | `"SOFT" 50` |

**Insight**: Fraunces italic at `SOFT 100` + oxblood is the signature move. Reserve it for emphasis only.

### 3.5 Font Features

```css
font-feature-settings: "ss01", "liga", "onum";
```

`ss01` (Fraunces stylistic set), `onum` (old-style numerals — editorial), `liga` (standard ligatures).

---

## 4. Spacing & Rhythm

### 4.1 Vertical Rhythm

| Scale | Value | Role |
|---|---|---|
| `space-0` | 4px | Tight caption gaps |
| `space-1` | 8px | Label → value |
| `space-2` | 12–14px | Paragraph breaks inside a block |
| `space-3` | 20–24px | Between related blocks |
| `space-4` | 32px | Block boundaries |
| `space-5` | 56–64px | Column gutter |
| `space-6` | 72–96px | Major section internal padding |
| `space-7` | 120px | Between chapters |

### 4.2 Slide Grid (16:9 reveal canvas)

| Token | Value |
|---|---|
| `slide-padding-x` | 88px |
| `slide-padding-y` | 64px |
| `content-max-w` | 1080px |
| Hero standfirst | 280px / 1fr |
| Chapter head | 180px / 1fr |
| Two-column body | 3fr / 2fr (asymmetric) |
| Three-column scenarios | 1fr / 1fr / 1fr |
| Stats | 4 equal columns with `border-right: 1px solid var(--rule)` between |

**Principle**: Asymmetric column ratios (3:2, 5:4) are the editorial move. 1:1 only for parallel content.

---

## 5. Rules, Borders, Dividers

| Token | Value | Usage |
|---|---|---|
| `rule-hairline` | `1px solid var(--rule)` | Subtle intra-block dividers |
| `rule-solid` | `1px solid var(--ink)` | Section boundaries |
| `rule-double` | `3px double var(--ink)` | Issue head, Coda boundaries |
| `rule-dotted` | `1px dotted var(--rule)` | Between list items |
| `rule-accent` | `3px solid var(--oxblood)` | Pull quote, takeaway left border |
| `rule-thick` | `2px solid var(--ink)` | Tables, prominent separators |
| `rule-inverted-shadow` | `6px 6px 0 var(--oxblood)` | Code plate offset shadow |

**Principle**: Flat offset shadows. Never `box-shadow: 0 4px 16px blur` (that's screen-era).

---

## 6. Texture & Atmosphere

### 6.1 Paper Grain (required)

Fixed overlay on `body::before`, mix-blend-mode: multiply.

```css
background-image:
  radial-gradient(rgba(40, 30, 15, 0.08) 1px, transparent 1px),
  radial-gradient(rgba(80, 60, 30, 0.04) 1px, transparent 1px);
background-size: 3px 3px, 7px 7px;
background-position: 0 0, 1px 1px;
opacity: 0.6;
mix-blend-mode: multiply;
```

Without the grain, the design flattens to "white slide with serif text". This is the difference between print-feel and web-mimic.

### 6.2 Vignette (optional)

`body::after` radial gradient pulling slight shadow from edges. Adds book-spread feel. Drop if budget-constrained.

### 6.3 Marker Highlight (signature)

Half-height yellow highlight simulating pen marker:

```css
.marker {
  background: linear-gradient(to bottom,
    transparent 55%, var(--marker) 55%, var(--marker) 88%, transparent 88%);
  padding: 0 2px;
}
```

Reserve for one or two highlighted phrases per slide. Overuse breaks the metaphor.

---

## 7. Signature Components

### 7.1 Drop Cap (chapter / section opener)

```css
.drop {
  float: left;
  font-family: "Noto Serif TC", serif;
  font-weight: 700;
  font-size: 72px;     /* EN variant: 92px Fraunces italic */
  line-height: 0.85;
  color: var(--oxblood);
  padding: 6px 14px 0 0;
}
```

### 7.2 Chapter Numeral

168px on a print spread; on slides scale down to 96–120px due to viewport constraints. Fraunces italic 200, `SOFT 100`, oxblood. Three-part label: `I · PURPOSE · 用 題`.

### 7.3 Code Plate

```css
.code-plate {
  background: var(--ink);
  color: var(--paper);
  padding: 28px 32px;
  box-shadow: 6px 6px 0 var(--oxblood);
}
.code-plate::before {
  content: "CODE · PYTHON · 三 行";
  position: absolute; top: -10px; left: 20px;
  background: var(--paper); color: var(--oxblood);
  font: 10px "Instrument Sans"; padding: 2px 8px; letter-spacing: 0.2em;
}
```

Syntax (dark plate): keyword `#e8b870`, function `#a4c8a0`, string `#d4a0a0`, comment `#7a7466` italic.

### 7.4 Pull Quote

```css
.pull-quote {
  border-left: 3px solid var(--oxblood);
  padding-left: 40px;
}
.pull-quote::before { content: "「"; font-size: 60px; color: var(--oxblood); }
.pull-quote .en-gloss {
  padding-top: 14px;
  border-top: 1px dotted var(--rule);
  font-style: italic;
}
```

### 7.5 Chip / Tag

```css
.chip {
  font: 11px "JetBrains Mono", monospace;
  padding: 3px 10px;
  border: 1px solid var(--ink);
}
.chip.accent { background: var(--oxblood); color: var(--paper); }
```

### 7.6 Takeaway Card

```css
.takeaway {
  padding: 16px 20px;
  background: var(--paper-deep);
  border-left: 3px solid var(--oxblood);
}
.takeaway::before {
  content: "學 習 重 點 · Takeaway";
  color: var(--oxblood);
  font: 10px "Instrument Sans", "Noto Sans TC";
  letter-spacing: 0.3em;
}
```

### 7.7 End Mark

```
· · ·
```

Centered, 22px CJK serif, letter-spacing 1em, oxblood.

---

## 8. Motion & Effects Policy

```yaml
motion-policy:
  required:
    - fade-up-entrance         # 0.8s ease-out, staggered for hero lines
    - intersection-reveal      # IntersectionObserver, threshold 0.08, on chapter enter
    - paper-grain-overlay      # always-on body::before (counts as "atmosphere")
  allowed:
    - dotted-rule-draw         # one-time line-draw on chapter divider
    - drop-cap-fade            # 1s opacity from 0 → 1 on slide enter
    - paper-depth-parallax     # ≤ 2 print layers, ≤ 8px offset on slide enter — layered paper collage, not web depth
  forbidden:
    - mouse-tracked-parallax   # cursor-reactive depth is web-era; the page is print
    - particle-converge-glyph
    - glass-morphism
    - rotating-glow-border
    - particle-background
    - gradient-text
    - pulse-glow
    - shimmer-text
    - neon-glow
    - data-auto-animate-morph
    - any-gradient-fill        # gradients are fundamentally web-era
  density:
    continuous-animations-per-slide: 0
    slides-with-effects: 30        # only entrance reveals + paper grain
  reduced-motion:
    disable: [fade-up-entrance, intersection-reveal, dotted-rule-draw, drop-cap-fade, paper-depth-parallax]
    keep:    [paper-grain-overlay]
```

---

## 9. Slide Templates (HTML skeletons)

### 9.1 Issue Head / Cover

```html
<section class="issue-head">
  <div class="masthead">A-TEAM <span class="zh">編 輯 室</span> · ISSUE 04 · 2026 SPRING</div>
  <h1>
    <span class="en">The compounding agency</span>
    <span class="zh">代 理 之 複 利</span>
  </h1>
  <p class="deck-en">A field study of slow systems that win.</p>
  <p class="deck-zh">關於慢系統如何最終勝出的田野觀察。</p>
</section>
```

### 9.2 Chapter Divider

```html
<section class="chapter-head">
  <div class="numeral">I</div>
  <div class="chapter-meta">PURPOSE · 用 題</div>
  <h2><span class="en">Why slowness compounds</span><br><span class="zh">慢 為 何 會 複 利</span></h2>
</section>
```

### 9.3 Body Slide (parallel column)

```html
<section class="body-spread">
  <article class="zh-lead">
    <span class="drop">這</span>
    本書談的不是速度，而是節律。
  </article>
  <aside class="en-echo">
    <p><em>Not about speed, but about cadence.</em></p>
  </aside>
</section>
```

### 9.4 Stat Strip (4 columns)

```html
<section class="stat-strip">
  <div class="stat"><span class="value">42</span><span class="label en">Cost reduction</span><span class="label zh">成 本 下 降</span></div>
  <!-- × 4, each separated by border-right hairline -->
</section>
```

### 9.5 Takeaway / Coda

```html
<section class="coda">
  <div class="takeaway">
    <p>慢系統不是反對快，而是相信複利。</p>
    <p class="en-gloss"><em>Not anti-fast — pro-compound.</em></p>
  </div>
</section>
```

### 9.6 End Slide

```html
<section class="end-mark">
  <div class="dots">·  ·  ·</div>
</section>
```

---

## 10. Don'ts (preserve at all costs)

- ❌ `text-transform: uppercase` on CJK
- ❌ `letter-spacing: 0` on CJK body (always ≥ 0.02em)
- ❌ Italic on CJK runs (no italic glyphs — use weight or color)
- ❌ Mixing CJK + Latin in the same display font (let stack fall through)
- ❌ Same size for CJK and Latin in parallel headlines (CJK ~50–65% of Latin)
- ❌ Inter, Space Grotesk, Poppins — wrong style; use Fraunces / Newsreader / Noto Serif TC
- ❌ Glass morphism, neon glow, particle backgrounds — wrong style; this is editorial
- ❌ Drop shadows with blur > 0 — only flat offset shadows
- ❌ Gradients of any kind (text, background, border) — flat color only
- ❌ Multi-emoji decoration (one paragraph mark `¶` is fine; emoji is not)
- ❌ More than ~10% surface in oxblood — accent reads only because it's rare

---

## 11. Slide-Specific Adaptations from the Web Original

The source `t-team/deepagents-design-tokens.md` is calibrated for a long-form web spread. For slides:

- **Reduce display sizes ~20%** to fit the 16:9 reveal canvas (e.g., `display-xl-en` from 136px → 110px)
- **Drop body block height** — body slides should hold 2-3 paragraphs, not the full essay
- **Chapter divider becomes its own slide** rather than an inline section heading
- **Coda becomes the end of each chapter** rather than appearing only once at article end
- **End mark becomes the final slide** (`· · ·`)
- All other tokens transfer 1:1 from the web source

The full web spread tokens remain authoritative for any web-format deliverable produced by this team using the editorial style.
