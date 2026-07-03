---
name: Reasoning and Self-Critique
description: Require a Reasoning gate before every workflow and a Self-Critique gate after it in every agent
---

# Reasoning and Self-Critique

## Applicability

- Applies to: all agents (every agent's `developer_instructions` must contain a `## Reasoning` section and a `## Self-Critique` section)

## Rule Content

### Two Structural Gates Around Every Workflow

Every agent must enforce two structural gates: a `## Reasoning` gate that runs before the workflow (think before acting) and a `## Self-Critique` gate that runs after the workflow produces a draft, before submission (challenge before submitting). Both are structural sections in the agent's `developer_instructions`, not instructional sentences — the model reliably follows structural boundaries.

### Section Ordering in the Agent Template

Every agent's `developer_instructions` must order these three sections as: `## Reasoning` → `## Workflow` → `## Self-Critique`. This creates a tight think → act → verify triad. Do not separate them; do not place Skills or Rules sections between them.

### Canonical Reasoning Block

The `## Reasoning` section must contain four labeled slots, filled before the workflow starts and written to the worklog or the task return:

- `### Knowns` — confirmed inputs and available information
- `### Unknowns` — missing data, assumptions being made, what must be verified
- `### Plan` — the chosen approach and why it beats alternatives
- `### Risks` — what could go wrong, which assumption if false invalidates the plan, the falsification condition

### Canonical Self-Critique Block

The `## Self-Critique` section must contain five labeled checks, run against the draft before submission. If any check exposes a gap, revise and re-run all five:

- `### Evidence Check` — every claim traces to a source, finding, or upstream worklog entry
- `### Position Check` — conclusions are explicit positions with evidence, not hedges
- `### Counterexample Check` — the strongest counterargument is addressed, not avoided
- `### Completeness Check` — the output answers the full task scope, not only the easy parts
- `### Failure Mode Check` — the predicted first break point under downstream use is named or fixed

### When the Gates Apply

Both gates apply to every output crossing an agent boundary: decisions written to `decisions.md`, files generated, reports returned to the Coordinator, and recommendations delivered to the user. They do not apply to internal scratch work that never leaves the agent.

### Coordinator Runs a Pre-Dispatch Variant

The Coordinator must additionally run a `## Pre-Dispatch Reasoning` gate before each `spawn_agent` dispatch, with four slots: `### What This Dispatch Must Achieve`, `### Why This Agent`, `### Inputs the Agent Needs`, `### Predicted Failure Modes`.

### Self-Critique Cannot Be Outsourced

The agent that produces the output runs its own Self-Critique. The QA Reviewer and Process Reviewer are additional layers, not replacements. Submitting without Self-Critique — expecting downstream review to catch errors — is a violation regardless of whether review later catches the issue.

### Failure Recovery

If Self-Critique exposes a gap that revision cannot close after 3 attempts, escalate rather than submit known-flawed output: return `STATUS: NEEDS_CONTEXT` (naming the missing information) when the gap is informational, or `STATUS: BLOCKED` otherwise.

## Violation Determination

- Agent config missing `## Reasoning` or `## Self-Critique` section → Violation
- `## Reasoning` placed after `## Workflow`, or `## Self-Critique` placed before it → Violation
- `## Reasoning` missing any of the four slots (Knowns / Unknowns / Plan / Risks) → Violation
- `## Self-Critique` missing any of the five checks (Evidence / Position / Counterexample / Completeness / Failure Mode) → Violation
- Coordinator agent missing `## Pre-Dispatch Reasoning` in addition to `## Reasoning` → Violation
- Agent submits output with no Knowns/Unknowns/Plan/Risks record in the worklog or task return → Violation

## Exceptions

- Deterministic Tier 1 utilities (single-lookup, zero judgment calls) may use a reduced 2-check Self-Critique (`### Format Check`, `### Input Coverage Check`) and may omit `## Reasoning` when the agent config states the Tier 1 justification.
- During Phase 1 Requirements Intake, an agent asking the user a single clarification question may complete the question without the full Self-Critique — but must run both gates before producing any artifact (Requirements Summary, research note, architecture plan).

Tradeoff: both gates add 30–60 seconds of structured reasoning per dispatch; skipping them produces faster output whose downstream failure costs (re-dispatch, rework, review findings) exceed the gate cost.
