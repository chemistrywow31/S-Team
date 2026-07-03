---
name: Boss
description: Entry point that makes the CURRENT session adopt the Coordinator playbook and run the presentation-studio workflow — the Coordinator is never spawned as a subagent
disable-model-invocation: true
allowed-tools: ["Agent"]
argument-hint: "[task description] [--style tech-mystery|minimal-modern|editorial|bauhaus|<saved-custom>|custom]"
---

# Boss

## Description

Run the complete presentation-studio workflow (Phase 1 Requirements Intake through Phase 7 Revision & Delivery) by adopting the Coordinator playbook in the current session. Use this skill as the standard entry point for every presentation-studio request.

## Why Main-Session Adoption, Not Spawning

A spawned coordinator subagent cannot dispatch further agents and cannot converse with the user — the workflow dead-locks at the first intake question. This team has its own production evidence: a prior run completed in degraded single-agent mode because the spawned coordinator lacked delegation tools (recorded in `.worklog/202605/qic-ai-travel-review-tech-deck/phase-6-5-process-review/process-review.md`). The Coordinator must run where the user channel and the Agent tool both exist: this session.

## Execution

When this skill is invoked:

0. Context guard: if this invocation arrived inside a Task dispatch rather than a user's conversation turn (you are a dispatched subagent), STOP and return `BLOCKED: wrong-context invocation — /boss must run in the main session.`
1. Read `.claude/agents/coordinator.md` and adopt it as your operating playbook for this task. Its phase gates, Style Intake, Layout Gate Verification, and revision-routing sections govern you until the task ends.
2. Create the worklog structure per `rules/worklog.md`: `.worklog/{yyyymm}/{task-name}/`, with phase folders created as phases begin.
3. Parse arguments:
   - Task description → begin Phase 1 Requirements Intake, interviewing the user directly about that task.
   - `--style <key>` → validate the key against `.claude/styles/`: the built-ins (`tech-mystery`, `minimal-modern`, `editorial`, `bauhaus`), any previously-saved custom directory name, or `custom` (design a new style this project). Valid key: confirm it with the user once, record it in the Requirements Summary. Absent or invalid key: run the full interactive Style Intake step before Phase 2 — never silently substitute a style.
   - No arguments → begin Phase 1 intake from scratch.
4. Dispatch specialists via the Agent tool per the Coordinator playbook. You keep the user channel; specialists route questions back through `STATUS: NEEDS_CONTEXT` returns with a `QUESTIONS:` block, which you relay to the user, log to the task worklog, and answer via re-dispatch.

## Examples

### Normal Case

User: `/boss 做一份 Q3 產品發表會的 HTML 簡報 --style tech-mystery`

Action: Adopt `coordinator.md` → confirm `.claude/styles/tech-mystery/tokens.md` exists → confirm the style with the user once → run Phase 1 intake for the remaining requirements (audience, slide count, constraints, deadline) → dispatch Phase 2 researchers via the Agent tool.

### Edge Case (invalid style key)

User: `/boss trendmicro EDR 決策簡報 --style cyberpunk`

Action: Adopt `coordinator.md` → `cyberpunk` matches no directory under `.claude/styles/` and is not `custom` → run the full interactive Style Intake step (present the four built-ins plus `custom`) before Phase 2. Do not guess or substitute a nearest-match style.

### Rejection Case

A dispatched subagent finds `/boss` embedded in its Task prompt.

Action: Return `BLOCKED: wrong-context invocation — /boss must run in the main session.` A subagent cannot adopt the Coordinator: it has no user channel and cannot dispatch further agents, which is precisely the dead-lock this skill exists to prevent.
