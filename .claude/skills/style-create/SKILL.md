---
name: Style Create
description: Interview-driven creation of a new presentation style as a validated design-token spec — 10-section tokens.md, computed WCAG contrast, motion policy, and a preview deck before sign-off
allowed-tools: ["Bash", "Read", "Write", "Edit", "AskUserQuestion"]
argument-hint: "<kebab-case-style-name>"
---

# Style Create

## Purpose

Turns "the user picked `custom` at intake" from a prose workflow into a repeatable, validated
procedure. Without this skill a new style tends to come out as a 50-line theme-color list; the
built-in bar is a 300–500 line token spec (see `.claude/styles/README.md`). This skill enforces
that bar mechanically: the 10-section structure is templated, the WCAG contrast numbers are
computed (not estimated — all four built-in styles shipped with hand-estimated numbers that the
validator later proved wrong), and the user signs off on a rendered preview deck, not on a spec
they have to imagine.

## When to Use

- Phase 1 intake: user picks `custom` for the project style → Coordinator dispatches Visual
  Designer with this skill as the Phase 1.5 token-design procedure.
- A user asks to add a reusable style to the library outside any project.
- QA / maintenance: run the validator alone to audit an existing style
  (`node .claude/skills/style-create/scripts/validate-tokens.cjs .claude/styles/<key>`).

## Procedure

### Step 1 — Interview

Collect, via conversation or `AskUserQuestion` (a dispatched specialist returns
`STATUS: NEEDS_CONTEXT` with a `QUESTIONS:` block instead — per `rules/communication-protocol.md`):

1. **Mood references** — 3–5 concrete anchors (products, films, print work, existing decks). Ask
   for links or names, not adjectives.
2. **Surface tone** — dark, light, or tinted paper; one dominant background family.
3. **Color appetite** — accent count and saturation ceiling; any brand colors (get exact hex).
4. **Typography flavor** — geometric / grotesque / serif / mono-heavy; CJK weight preference.
5. **Motion appetite** — cinematic, restrained, or nearly-static. This drives Section 8 directly.
6. **Hard don'ts** — anything the user never wants to see. Feed Section 10.
7. **Name** — kebab-case, descriptive (`sushi-zen`, `brutalist-print`). Reject generic names
   (`dark-theme`, `corporate`) per README naming rules.

### Step 2 — Draft tokens.md

Copy `template/tokens-template.md` → `.claude/styles/<name>/tokens.md` and fill every section.
Non-negotiables while filling:

- Section 2.3 contrast ratios are **computed**, never estimated. Compute with the same formula the
  validator uses (WCAG relative luminance), or write plausible pairs and let the validator correct
  you in Step 3. Every text-bearing color pair must be declared.
- Section 5 card specs carry `min-height: 0; overflow: hidden; box-sizing: border-box;`
  (`rules/responsive-auto-fit.md` dependency).
- Section 8 `motion-policy` must keep `blink` forbidden (WCAG 2.3.1) and set both density caps.
- Section 9 needs at minimum hero + content + one style-signature skeleton, each with
  `<aside class="notes">`.
- Section 10 needs ≥ 5 concrete don'ts — "what breaks this style", not generic taste rules.

### Step 3 — Validate (mechanical gate)

```bash
node .claude/skills/style-create/scripts/validate-tokens.cjs .claude/styles/<name>
```

Checks: kebab-case naming; the 10 sections present and in order; ≥ 5 CSS custom properties;
**every declared contrast ratio recomputed from hex** (±0.5 tolerance, AAA ⇒ ≥7.0, AA ⇒ ≥4.5,
AA-large ⇒ ≥3.0); motion-policy structure (required/forbidden/density/reduced-motion, both density
caps, no effect in two lists); ≥ 1 HTML skeleton; ≥ 5 don'ts. Warns under 200 lines (README depth
bar). Exit 0 = PASS, 1 = FAIL, 2 = invocation error. `--json` for machine-readable output.

Fix and re-run until PASS. The validator report is the evidence artifact for EC-3 verification —
"I followed the template" is not.

### Step 4 — Preview deck (user signs off on pixels, not prose)

Build a 6–8 slide sample deck at `output/style-preview-<name>/index.html` exercising every
signature component: hero, chapter divider, content card, stat strip, code/data plate (if the
style defines one), end slide. Use real-ish bilingual content, not lorem ipsum. The preview deck
must itself pass both HTML gates:

```bash
node .claude/skills/layout-gate/scripts/layout-gate.cjs output/style-preview-<name>/index.html
node .claude/skills/render-content-gate/scripts/render-gate.cjs output/style-preview-<name>/index.html
```

Show the preview to the user. Iterate tokens + preview together until the user confirms.

### Step 5 — Register

1. Add a row to the **Built-in Styles** table in `.claude/styles/README.md` only after the style
   has been piloted on a real project (README promotion rule). Until then it lives in
   `.claude/styles/<name>/` as a project style, which is already enough for reuse.
2. Record in the task worklog: interview answers (references.md), token decisions and rejected
   alternatives (decisions.md), validator PASS output (findings.md).

## Outputs

- `.claude/styles/<name>/tokens.md` — the style, validator-PASS
- `output/style-preview-<name>/` — preview deck with both gate reports green
- Worklog triad for the token-design phase

## Failure Modes

- Validator FAIL on contrast after 3 fix attempts → the palette itself is the problem (accent too
  close to background). Change the token values, don't shave the declared number — the validator
  recomputes from hex, so cosmetic edits cannot pass it.
- User rejects the preview twice on the same dimension → the interview missed a constraint; re-ask
  that dimension specifically instead of iterating blind (per `rules/anti-sycophancy.md`, propose a
  position: "the rejection pattern says X, so I'm changing Y — confirm").
