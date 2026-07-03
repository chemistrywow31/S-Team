# Presentation Studio Codex Runtime

## Team Objective

Produce professional presentations backed by verified research, expert domain knowledge, and implementable technical solutions. Supported deliverables include HTML slides, PowerPoint (`.pptx`), PDF, and Web POC prototypes. Every presentation must pass quality review before delivery.

## Platform Doctrine

- **Canonical source design: `.claude/` and `CLAUDE.md`.** All design changes are authored there first.
- **This Codex tree is generated parity**: `AGENTS.md`, `agents/**/*.toml`, `.codex/rules/`, `.codex/skills/`, and `.agents/skills/` are regenerated from the Claude tree per `.codex/docs/format-mapping.md`. Do not hand-edit the generated surfaces to change design; change `.claude/` and regenerate.
- Codex-only additions that have no Claude source (the 7 Codex-native rules in `.codex/rules/`, including `presentation-visual-asset-standard.md`, and the Codex runtime registry `.codex/config.toml`) are preserved across regenerations.
- Mapping artifacts: `.codex/docs/format-mapping.md` and `.codex/docs/format-mapping.manifest.yaml`.

## Deployment Mode: Coordinator Dispatch (Subagent-Style)

One Coordinator orchestrates all specialists through isolated `spawn_agent` dispatches within a single Codex session. There is no shared task ledger and no peer messaging.

- **The Coordinator runs in the MAIN session.** Invoking `$boss` makes the current session adopt `agents/coordinator.toml`'s `developer_instructions` as its playbook. Never spawn the Coordinator as a subagent — a spawned coordinator cannot dispatch further agents and cannot converse with the user. Production evidence: `.worklog/202605/qic-ai-travel-review-tech-deck/phase-6-5-process-review/process-review.md` records a run degraded to single-agent mode for exactly this reason.
- **Specialists are dispatched via `spawn_agent`** from the project-local registry in `.codex/config.toml`, one dispatch per unit of work, each starting with fresh context. A specialist that needs user input ends its run with `STATUS: NEEDS_CONTEXT` and a `QUESTIONS:` block; the Coordinator relays the questions to the user, logs the exchange to the task worklog, and re-dispatches with the answers.
- **Parallel groups** run as concurrent spawns in the same Coordinator turn: Phase 2 (Investigative Researcher ∥ Domain Expert) and Phase 5 (Visual Designer ∥ Web Developer).
- **Handoffs flow through the Coordinator.** Every dispatch carries the worklog path, upstream reference paths, task scope, acceptance criteria, and a scope fence. Every return follows the EC-1 report schema in `.codex/rules/execution-contract.md`. See `.codex/rules/communication-protocol.md`.

Prerequisites: open Codex from this `presentation-studio` project root; use the project-local `.codex/config.toml` (no `~/.codex/config.toml` changes required); enter the workflow through `$boss`.

## Agent Roster

| Agent | Config | Phase | Role |
| --- | --- | --- | --- |
| Coordinator | `agents/coordinator.toml` | all | Main-session playbook; intake, dispatch, gates, routing (never spawned) |
| Investigative Researcher | `agents/research/investigative-researcher.toml` | 2 | Source discovery, credibility rating, source registry |
| Domain Expert | `agents/research/domain-expert.toml` | 2 | Domain analysis, frameworks, knowledge gaps |
| Presentation Architect | `agents/planning/presentation-architect.toml` | 3 | Narrative structure and slide-by-slide outline |
| Technical Architect | `agents/planning/technical-architect.toml` | 3 | Technical solutions, feasibility, POC specs |
| Presentation Writer | `agents/production/presentation-writer.toml` | 4 | Slide copy and speaker notes |
| Visual Designer | `agents/production/visual-designer.toml` | 5 | Style guide, effect specs, imagery, layouts |
| Web Developer | `agents/production/web-developer.toml` | 5 | HTML/PPTX/PDF/POC builds + layout and render gates |
| QA Reviewer | `agents/quality/qa-reviewer.toml` | 6 | Deliverable quality review and issue routing |
| Process Reviewer | `agents/review/process-reviewer.toml` | 6.5 | Coordination retrospective (distinct from QA) |

## Workflow Phases

```text
Phase 1: Requirements Intake        -> Coordinator
Phase 2: Research (parallel)         -> Investigative Researcher || Domain Expert
Phase 3: Architecture Planning       -> Presentation Architect + Technical Architect
Phase 4: Content Writing             -> Presentation Writer
Phase 5: Visual & Build (parallel)   -> Visual Designer || Web Developer
Phase 6: Quality Review              -> QA Reviewer
Phase 6.5: Process Review            -> Process Reviewer
Phase 7: Revision & Delivery         -> Route back to relevant agent(s) based on review feedback
```

## Universal Rules

### Communication Language

Communicate in the user's language. Detect and match the language the user uses. Technical terms may remain in English.

### Output Directory Convention

All presentation deliverables are placed under a project-specific output directory. The Coordinator defines this path at the start of each project. Agents must not write files outside the designated output directory.

### File Naming

Use kebab-case for all generated file and folder names. Spaces, underscores, and uppercase letters are prohibited in file names.

### Source Attribution

Every factual claim in the presentation must have a traceable source. The Investigative Researcher provides a source registry that all downstream agents reference. Unsourced claims are flagged as violations during quality review.

### Premium Visual Effects

Every HTML presentation must include premium visual effects that exceed standard AI-generated output quality, subject to the selected style's Motion & Effects Policy. Reference `.agents/skills/visual-effects/SKILL.md` for implementation patterns and `.codex/rules/visual-effects-standard.md` for quality enforcement. All effects must maintain 60fps performance and include `prefers-reduced-motion` accessibility support.

### Mandatory Layout Gate (HTML deliverables)

Every HTML presentation must pass `.agents/skills/layout-gate/scripts/layout-gate.cjs` at all four configured viewports before any agent may mark the deliverable complete. The gate produces `layout-gate-report.json` with `"status": "PASS"`. Every HTML presentation must also pass `.agents/skills/render-content-gate/scripts/render-gate.cjs`, producing `render-gate-report.json` with `"status": "PASS"` — the render-content gate catches slides that render blank, which geometry checks cannot see; a geometry PASS never substitutes for a render PASS. These two reports together are the sole evidence accepted by the Coordinator and QA Reviewer for layout and render compliance. Visual self-attestation ("I opened it in the browser") is rejected. Reference `.codex/rules/layout-gate.md` for the full mandate, `.codex/rules/responsive-auto-fit.md` for the auto-fit snippet, and `.codex/rules/layout-overflow-prevention.md` (plus its children under `.codex/rules/layout-overflow/`) for content-density limits.

### Presentation Visual Asset Standard

Every presentation that uses selected, user-provided, or edited raster images must enforce `.codex/rules/presentation-visual-asset-standard.md`: raster visuals come from existing project assets or user-provided files — the team runs no external or built-in image APIs (when no raster asset fits, compose the visual from CSS/SVG/icon/typographic elements); core slide content stays live HTML/PPTX text, explicit non-overlapping text/image zones, and visual QA beyond the automated gates.

### Style System (Mandatory Intake Step)

Every presentation must declare a style at intake — before Phase 2 research begins. Codex-native styles live in `.codex/styles/<key>/tokens.md`:

- `tech-mystery` (科技神秘風) — late-night ops console, holographic depth, restrained cyberpunk
- `minimal-modern` (簡約現代風) — Swiss-design influenced, premium light surfaces, generous whitespace
- `editorial` (編輯風) — editorial magazine, ink-on-cream, bilingual CJK + Latin
- `bauhaus` (包浩斯風) — Bauhaus operational deck, square corners, black/red/yellow/blue on cream, flat offset shadows

The Coordinator must ask the user to pick one of the built-ins or `custom` (define a new style for this project, saved to `.codex/styles/<custom-name>/tokens.md` for reuse). The chosen style key flows into the Requirements Summary and is consumed by the Visual Designer at Phase 5 as the visual ground truth, propagated inside `<style_key>` tags. Each style's `tokens.md` declares its own Motion & Effects Policy, which overrides the default coverage requirement in `.codex/rules/visual-effects-standard.md`. Reference `.codex/styles/README.md` for the full system specification.

## Worklog and Context Management

Every task maintains a worklog at `.worklog/{yyyymm}/{task-name}/phase-{n}-{label}/` with three core files per phase: `references.md` (sources consulted), `findings.md` (key discoveries and analysis), `decisions.md` (decisions with rationale, alternatives, and evidence). The evidence chain references → findings → decisions must hold. See `.codex/rules/worklog.md` and `.codex/rules/context-management.md`.

- **Dispatch rules**: every Coordinator dispatch includes the worklog path, upstream `decisions.md` paths, a task scope summary, 1–5 mechanically checkable acceptance criteria, and a scope fence. Pass paths, never pasted contents.
- **Return format**: every specialist return uses the six-field EC-1 schema in `.codex/rules/execution-contract.md` — STATUS / CONCLUSIONS / EVIDENCE / ARTIFACTS / RISKS-UNKNOWNS / NEXT. Valid statuses: DONE, DONE_WITH_CONCERNS, BLOCKED, NEEDS_CONTEXT. Products over 30 lines go to files; reports carry paths.
- **Verification**: DONE is accepted only after fresh-context verification per EC-3 — a producer never accepts its own work. For HTML deliverables the two gate JSON reports are the sole layout/render evidence (see Mandatory Layout Gate).
- **Phase-end archival**: the Coordinator verifies the worklog triad is complete before any phase transition; downstream phases read the worklog, not conversation memory.

## Precedence Order

When two instructions conflict, the higher source wins — resolve by citing this order, never by judgment:

1. Safety: the Codex sandbox policy (`sandbox_mode` in the agent TOMLs and `.codex/config.toml`) and destructive-action guards
2. Charter: this AGENTS.md and `.codex/rules/execution-contract.md`
3. Verification requirements (EC-3)
4. Reporting requirements (EC-1)
5. Escalation requirements (EC-2)
6. Other rules in `.codex/rules/`
7. Task-specific dispatch instructions
8. Style preferences (tone, formatting, length aesthetics)

Two conflicting rules at the same level: the rule with the narrower Applicability wins. Still tied → report BLOCKED and ask the Coordinator (specialists) or the user (Coordinator).

## Tech Stack

| Capability | Tools / Libraries | Skill Reference |
|---|---|---|
| HTML Presentations | reveal.js, Slidev, or plain HTML/CSS/JS | `.agents/skills/html-presentation/` |
| PowerPoint (.pptx) | PptxGenJS (create), python-pptx + XML editing (template) | `.agents/skills/pptx/` — see editing.md, pptxgenjs.md |
| PDF Processing | pypdf, pdfplumber, reportlab, qpdf, Puppeteer | `.agents/skills/pdf/` — see reference.md, forms.md |
| Web POC | HTML/CSS/JS, React (if needed), Node.js backend (if needed) | `.agents/skills/web-poc/` |
| Source Verification | `web.run` search/open with source registry | `.agents/skills/source-verification/` |
| Visual Effects | CSS animations, anime.js, Canvas particles, SVG animation | `.agents/skills/visual-effects/` |
| Layout Gate | Puppeteer geometry gate (4 viewports) | `.agents/skills/layout-gate/` |
| Render Content Gate | Puppeteer blank-slide gate (screenshot + ink measurement) | `.agents/skills/render-content-gate/` |

## Codex Runtime Layout

- `AGENTS.md`: Codex runtime contract, generated from `CLAUDE.md`.
- `.codex/config.toml`: project-local model and agent registry (Codex-native, preserved).
- `agents/`: Codex TOML agent configs, generated from `.claude/agents/`.
- `.codex/rules/`: hard-constraint library — generated counterparts of `.claude/rules/` plus 7 preserved Codex-native rules.
- `.codex/skills/`: authored skill mirror, generated from `.claude/skills/`.
- `.agents/skills/`: runtime-discoverable skill surface, identical mirror of `.codex/skills/`.
- `.codex/styles/`: Codex style token system, mirrored from `.claude/styles/`.
- `.claude/` and `CLAUDE.md`: the canonical source design this tree is generated from.

## Quality Contract

A deliverable is not complete until:

- the required output formats exist in the project output directory;
- every factual claim traces to the source registry;
- HTML decks have a fresh `layout-gate-report.json` AND a fresh `render-gate-report.json`, each with `status: PASS`;
- decks with raster images satisfy `.codex/rules/presentation-visual-asset-standard.md`;
- PPTX/PDF outputs include rendered inspection samples;
- QA Reviewer returns `PASS` or all blocking issues are resolved;
- Process Reviewer records a coordination retrospective per `.codex/rules/reviewer-mandate.md`.

---

Generated by A-Team on 2026-07-03 (Phase 7 restructuring: Codex tree regenerated from the canonical `.claude/` source design; original Codex conversion 2026-05)
