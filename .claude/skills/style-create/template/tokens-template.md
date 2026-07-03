# {Style Name} — Design Tokens

> 風格定位:**{中文風格名}({Style Name})** · {three-beat mood summary}
> Reference mood:{3–5 concrete visual references — real products, films, print work}

---

## 1. Concept & Mood

| Key | Value |
|---|---|
| **Aesthetic direction** | {one line} |
| **Reference mood** | {references again, expanded} |
| **Voice** | {adjectives — and what it is NEVER} |
| **Primary tension** | {the two or three forces whose contrast defines the style} |
| **Avoid** | {concrete list of moves that would dilute the style} |

{One paragraph: where the character of this style actually comes from.}

---

## 2. Color Tokens

### 2.1 Palette

```css
/* Base / surface */
--bg-base:        #000000;   /* {role} */

/* Text */
--text-primary:   #000000;   /* {role} */

/* Accents */
--accent:         #000000;   /* {role} */
```

### 2.2 Role Mapping

| Role | Token | Notes |
|---|---|---|
| Slide background (root) | `--bg-base` |  |
| Body text | `--text-primary` |  |
| Primary accent | `--accent` |  |

### 2.3 Contrast (WCAG)

<!-- Declare every text-bearing pair. Numbers are VERIFIED by validate-tokens.cjs —
     compute them, do not estimate. AAA ⇒ ≥ 7.0, AA ⇒ ≥ 4.5, AA-large ⇒ ≥ 3.0 -->

- `--text-primary` on `--bg-base`: **0.0:1** ✓ AAA
- `--accent` on `--bg-base`: **0.0:1** ✓ AA — {usage constraint}

---

## 3. Typography

### 3.1 Font Families

| Role | Family | Why |
|---|---|---|
| Display (Latin) | **{family}** ({weights}) | {reason} |
| Body (Latin) | **{family}** ({weights}) | {reason} |
| Display CJK | **{family}** weight {n} | {reason} |
| Body CJK | **{family}** weight {n} | {reason} |

Bilingual stack:

```css
body { font-family: "{Body}", "{CJK}", system-ui, sans-serif; }
```

### 3.2 Type Scale

| Token | Size | Line-height | Weight | Family | Notes |
|---|---|---|---|---|---|
| `display-hero` | clamp(...) | | | | |
| `body-md` | | | | | |
| `eyebrow` | | | | | |

### 3.3 Letter-spacing

| Role | letter-spacing |
|---|---|
| Display Latin large | |
| Body CJK | |

---

## 4. Spacing & Rhythm

### 4.1 Vertical Scale

| Token | Value | Role |
|---|---|---|
| `space-1` | 8px | |
| `space-4` | 32px | |

### 4.2 Slide Grid (16:9 reveal canvas, 960×700 authored)

| Token | Value |
|---|---|
| `slide-padding-x` | |
| `slide-padding-y` | |
| `content-max-w` | |

---

## 5. Surfaces & Borders

| Token | Value | Usage |
|---|---|---|
| `card-radius` | | |
| `card-bg` | | |
| `card-border` | | |

<!-- Any card spec MUST carry `min-height: 0; overflow: hidden; box-sizing: border-box;`
     per rules/responsive-auto-fit.md -->

---

## 6. Texture & Atmosphere

{Backgrounds, overlays, grain, particles, grids — whatever fills negative space in this style.
If the style's answer is "nothing, whitespace is the atmosphere", say so explicitly.}

---

## 7. Signature Components

### 7.1 Hero Title Slide
### 7.2 Chapter Divider
### 7.3 Stat Strip
### 7.4 Content Card
### 7.5 Code / Data Plate
### 7.6 End Slide

{Spec each: background, composition, type roles, effects. These become the Visual Designer's vocabulary.}

---

## 8. Motion & Effects Policy

This block is read by `rules/visual-effects-standard.md` to determine which effects are required, allowed, or forbidden for this style.

```yaml
motion-policy:
  required:
    - {effect}
  allowed:
    - {effect}
  forbidden:
    - blink                # WCAG safety — keep forbidden in every style
  density:
    continuous-animations-per-slide: 5
    slides-with-effects: 80
  reduced-motion:
    disable: [{effects}]
    keep:    [{effects}]
```

---

## 9. Slide Templates (HTML skeletons)

### 9.1 Hero

```html
<section class="slide-hero">
  <h1>{title}</h1>
  <aside class="notes">{notes}</aside>
</section>
```

### 9.2 Content

```html
<section>
  <h2>{title}</h2>
  <aside class="notes">{notes}</aside>
</section>
```

---

## 10. Don'ts

- ❌ {concrete move that breaks this style}
- ❌ {…}
- ❌ {…}
- ❌ {…}
- ❌ {at least five entries}
