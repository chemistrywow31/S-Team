# Presentation Style System

Every presentation must declare a style at intake. The chosen style's `tokens.md` is the visual ground truth for that project — Visual Designer extends it; QA Reviewer audits against it.

## Why a Style System

Without a chosen style, agents drift toward "generic AI gradient + glass card" output. Each style here defines a complete visual contract — palette, typography, spacing, motion, signature components, what to avoid — so that the Visual Designer starts from a coherent vocabulary rather than improvising.

A style is not a theme color. It is a position about what the presentation should feel like, expressed in measurable tokens and structural don'ts.

## Built-in Styles

| Style | Key | Mood | Use When |
|---|---|---|---|
| 科技神秘風 | `tech-mystery` | Late-night ops console, holographic depth, restrained cyberpunk | Product launches, technical keynotes, AI / R&D narratives, anything that benefits from "futuristic but considered" |
| 簡約現代風 | `minimal-modern` | Swiss-design influenced, premium light surfaces, generous whitespace | Strategy briefings, investor decks, executive reports, anything that needs to read as confident and uncluttered |
| 編輯風 | `editorial` | Editorial magazine, ink-on-cream, bilingual CJK + Latin | Long-form analysis, retrospectives, written-content adaptations, anything where the slide should feel like a print spread |
| 包浩斯風 | `bauhaus` | Bauhaus-inspired operational deck, square corners, black/red/yellow/blue on cream, flat offset shadows | Operational reviews, technical briefings, schematic-heavy decks, anything that benefits from "constructivist control panel" weight |

## Folder Layout

```
.codex/styles/
├── README.md                    ← this file
├── tech-mystery/
│   └── tokens.md
├── minimal-modern/
│   └── tokens.md
├── editorial/
│   └── tokens.md
├── bauhaus/
│   └── tokens.md
└── <custom-name>/               ← created at intake when user defines a new style
    └── tokens.md
```

## tokens.md — Required Sections

Every `tokens.md` (built-in or custom) must include all of these sections, in this order. Visual Designer cannot start work if any are missing.

1. **Concept & Mood** — direction, references, voice, "avoid" list
2. **Color Tokens** — CSS custom property table + role mapping + WCAG contrast results
3. **Typography** — families, weight/size/leading scale, letter-spacing, font-feature settings, language-stack rules
4. **Spacing & Rhythm** — vertical scale, grid columns, gutters
5. **Surfaces & Borders** — card / panel / divider / shadow specifications
6. **Texture & Atmosphere** — backgrounds, overlays, particles, glow — anything that fills negative space
7. **Signature Components** — slide-type templates (title, chapter divider, content, code, stat strip, takeaway, end mark)
8. **Motion & Effects Policy** — declares which `.codex/rules/visual-effects-standard.md` categories are required, allowed, or forbidden for this style
9. **Slide Templates** — concrete HTML structure per slide type
10. **Don'ts** — bullet list of moves that break this style

The Motion & Effects Policy section is what gives `.codex/rules/visual-effects-standard.md` its style-aware enforcement — see that rule for how the policy block is consumed.

## Workflow

### At Intake (Phase 1)

The Coordinator asks the user to pick a style **before** Phase 2 research starts. Options:

1. One of the built-in styles by key (`tech-mystery`, `minimal-modern`, `editorial`, `bauhaus`)
2. `custom` — define a new style for this project. Coordinator routes to Visual Designer for an interactive token-design session; the resulting tokens are saved at `.codex/styles/<custom-name>/tokens.md` for reuse on future projects.

The chosen style key is recorded in the Coordinator's Requirements Summary and propagated as `--style <key>` context to every downstream agent.

### At Phase 5 (Visual Design)

Visual Designer reads `.codex/styles/<chosen-style>/tokens.md` as the first action of Phase 5. The Visual Style Guide for the project is a per-project specialization of these tokens — extending palette names with semantic role mappings for the project content, but never overriding token values without a documented reason.

### At Phase 6 (QA)

QA Reviewer cross-references the chosen style's `tokens.md` against the rendered slides. Specifically:

- Every color used in CSS must trace to a token
- Every font family must be declared in the typography stack
- Every motion / effect must comply with the style's Motion & Effects Policy
- Every "Don't" entry must be checked and flagged if violated

## Custom Style Workflow

When the user picks `custom` at intake:

1. Coordinator dispatches Visual Designer with a Phase 1.5 token-design task
2. Visual Designer interviews the user (mood references, color preferences, typography flavor, motion appetite)
3. Visual Designer drafts `tokens.md` following the 10-section structure
4. User confirms; Coordinator saves to `.codex/styles/<chosen-name>/tokens.md`
5. The custom style is now available for future projects

Naming: kebab-case, descriptive (e.g., `sushi-zen`, `brutalist-print`, `aurora-dreamscape`). Avoid generic names like `dark-theme` or `corporate`.

## Adding a Built-in Style

To promote a custom style to built-in status:

1. Author its `tokens.md` to the same depth as the existing built-ins (this is non-trivial; expect 200+ lines of token specification)
2. Add a row to the **Built-in Styles** table above
3. Pilot it on at least one real project
4. Have QA Reviewer audit token compliance; address gaps before declaring stable
