# Presentation Studio

## Team Objective

Produce professional presentations backed by verified research, expert domain knowledge, and implementable technical solutions. Output formats include HTML slides, PowerPoint (PPT), PDF, and Web POC prototypes. Every presentation must pass quality review before delivery.

## Deployment Mode: Subagent

This team runs in **subagent mode**: one Coordinator orchestrates all specialist agents via Task-tool dispatch within a single Claude Code session.

- **The Coordinator runs in the MAIN session.** Invoking `/boss` makes the current session adopt `.claude/agents/coordinator.md` as its playbook. Never spawn the Coordinator as a subagent — a spawned coordinator cannot dispatch further agents and cannot converse with the user. Production evidence: `.worklog/202605/qic-ai-travel-review-tech-deck/phase-6-5-process-review/process-review.md` records a run degraded to single-agent mode for exactly this reason.
- **Specialists are dispatched via the Agent tool**, one Task per unit of work. A specialist that needs user input ends its run with `STATUS: NEEDS_CONTEXT` and a `QUESTIONS:` block; the Coordinator relays the questions to the user, logs the exchange to the task worklog, and re-dispatches with the answers.
- **Parallel groups** run as concurrent dispatches in the same message: Phase 2 (Investigative Researcher ∥ Domain Expert) and Phase 5 (Visual Designer ∥ Web Developer).
- **Handoffs flow through the Coordinator.** Every dispatch carries the worklog path, upstream reference paths, task scope, acceptance criteria, and a scope fence. Every return follows the EC-1 report schema in `rules/execution-contract.md`.

## Workflow Phases

```
Phase 1: Requirements Intake        → Coordinator
Phase 2: Research (parallel)         → Investigative Researcher ∥ Domain Expert
Phase 3: Architecture Planning       → Presentation Architect + Technical Architect
Phase 4: Content Writing             → Presentation Writer
Phase 5: Visual & Build (parallel)   → Visual Designer ∥ Web Developer
Phase 6: Quality Review              → QA Reviewer
Phase 6.5: Process Review            → Process Reviewer
Phase 7: Revision & Delivery         → Route back to relevant agent(s) based on review feedback
```

## Universal Rules

### Communication Language

Communicate in the user's language. Detect and match the language the user uses. Technical terms may remain in English.

### Output Directory Convention

All presentation deliverables are placed under a project-specific output directory. The coordinator defines this path at the start of each project. Agents must not write files outside the designated output directory.

### File Naming

Use kebab-case for all generated file and folder names. Spaces, underscores, and uppercase letters are prohibited in file names.

### Source Attribution

Every factual claim in the presentation must have a traceable source. The Investigative Researcher provides a source registry that all downstream agents reference. Unsourced claims are flagged as violations during quality review.

### Premium Visual Effects

Every HTML presentation must include premium visual effects that exceed standard AI-generated output quality. Required effect categories: glass morphism, rotating glow borders, gradient text, neon glows, SVG animations, particle backgrounds, and cinematic `data-auto-animate` transitions. Reference `skills/visual-effects/SKILL.md` for implementation patterns and `rules/visual-effects-standard.md` for quality enforcement. All effects must maintain 60fps performance and include `prefers-reduced-motion` accessibility support.

### Mandatory Layout Gate (HTML deliverables)

Every HTML presentation must pass `skills/layout-gate/scripts/layout-gate.cjs` at all four configured viewports before any agent may mark the deliverable complete. The gate produces `layout-gate-report.json` with `"status": "PASS"`. Every HTML presentation must also pass `skills/render-content-gate/scripts/render-gate.cjs`, producing `render-gate-report.json` with `"status": "PASS"` — the render-content gate catches slides that render blank, which geometry checks cannot see; a geometry PASS never substitutes for a render PASS. These two reports together are the sole evidence accepted by the Coordinator and QA Reviewer for layout and render compliance. Visual self-attestation ("I opened it in the browser") is rejected. Reference `rules/layout-gate.md` for the full mandate, `rules/responsive-auto-fit.md` for the auto-fit snippet, and `rules/layout-overflow-prevention.md` for content-density limits.

### Style System (Mandatory Intake Step)

Every presentation must declare a style at intake — before Phase 2 research begins. Built-in styles live in `.claude/styles/<key>/tokens.md`:

- `tech-mystery` (科技神秘風) — late-night ops console, holographic depth, restrained cyberpunk
- `minimal-modern` (簡約現代風) — Swiss-design influenced, premium light surfaces, generous whitespace
- `editorial` (編輯風) — editorial magazine, ink-on-cream, bilingual CJK + Latin
- `bauhaus` (包浩斯風) — Bauhaus operational deck, square corners, black/red/yellow/blue on cream, flat offset shadows

The Coordinator must ask the user to pick one of the built-ins or `custom` (define a new style for this project, saved to `.claude/styles/<custom-name>/tokens.md` for reuse). The chosen style key flows into the Requirements Summary and is consumed by the Visual Designer at Phase 5 as the visual ground truth. Each style's `tokens.md` declares its own Motion & Effects Policy, which overrides the default coverage requirement in `rules/visual-effects-standard.md`.

Reference `.claude/styles/README.md` for the full system specification and the 10 required sections in any `tokens.md`.

## Worklog and Context Management

Every task maintains a worklog at `.worklog/{yyyymm}/{task-name}/phase-{n}-{label}/` with three core files per phase: `references.md` (sources consulted), `findings.md` (key discoveries and analysis), `decisions.md` (decisions with rationale, alternatives, and evidence). The evidence chain references → findings → decisions must hold. See `rules/worklog.md` and `rules/context-management.md`.

- **Dispatch rules**: every Coordinator dispatch includes the worklog path, upstream `decisions.md` paths, a task scope summary, 1–5 mechanically checkable acceptance criteria, and a scope fence. Pass paths, never pasted contents.
- **Return format**: every specialist return uses the six-field EC-1 schema in `rules/execution-contract.md` — STATUS / CONCLUSIONS / EVIDENCE / ARTIFACTS / RISKS-UNKNOWNS / NEXT. Valid statuses: DONE, DONE_WITH_CONCERNS, BLOCKED, NEEDS_CONTEXT. Products over 30 lines go to files; reports carry paths.
- **Verification**: DONE is accepted only after fresh-context verification per EC-3 — a producer never accepts its own work. For HTML deliverables the layout gate JSON report is the sole layout evidence (see Mandatory Layout Gate).
- **Phase-end archival**: the Coordinator verifies the worklog triad is complete before any phase transition; downstream phases read the worklog, not conversation memory.

## Precedence Order

When two instructions conflict, the higher source wins — resolve by citing this order, never by judgment:

1. Safety: `.claude/settings.json` deny rules and destructive-action guards
2. Charter: this CLAUDE.md and `rules/execution-contract.md`
3. Verification requirements (EC-3)
4. Reporting requirements (EC-1)
5. Escalation requirements (EC-2)
6. Other rules in `rules/`
7. Task-specific dispatch instructions
8. Style preferences (tone, formatting, length aesthetics)

Two conflicting rules at the same level: the rule with the narrower Applicability wins. Still tied → report BLOCKED and ask the Coordinator (specialists) or the user (Coordinator).

## Tech Stack

| Capability | Tools / Libraries | Skill Reference |
|---|---|---|
| HTML Presentations | reveal.js, Slidev, or plain HTML/CSS/JS | `skills/html-presentation/` |
| PowerPoint (.pptx) | PptxGenJS (create), python-pptx + XML editing (template) | `skills/pptx/` — see editing.md, pptxgenjs.md |
| PDF Processing | pypdf, pdfplumber, reportlab, qpdf, Puppeteer | `skills/pdf/` — see reference.md, forms.md |
| Web POC | HTML/CSS/JS, React (if needed), Node.js backend (if needed) | `skills/web-poc/` |
| Source Verification | WebSearch, WebFetch tools | `skills/source-verification/` |
| Visual Effects | CSS animations, anime.js, Canvas particles, SVG animation | `skills/visual-effects/` |

---

Generated by A-Team on 2026-07-03 (Phase 7 restructuring; original generation 2026-05, pre-stamp)
