---
name: Codex Agent Config Patterns
description: Define safe TOML patterns for generated Codex subagent configs
---

# Codex Agent Config Patterns

## Applicability

- Applies to: `agent-writer`, `team-architect`, `prompt-optimizer`

## Rule Content

### Required TOML Shape

Every generated agent config must include:

```toml
name = "Process Reviewer"
description = "Audit coordination quality and produce a retrospective report."
model = "gpt-5.4"
model_reasoning_effort = "xhigh"
sandbox_mode = "read-only"

developer_instructions = """
...
"""
```

### Sandbox Defaults

- coordinators: `workspace-write` only when they create scaffolding or worklogs
- read-only auditors and researchers: `read-only` unless they must write reports
- file writers and implementers: `workspace-write`
- destructive or external-write roles: require explicit boundaries in `developer_instructions`

### Coordinator Requirements

Coordinator `developer_instructions` must include:

- `## Team Overview`
- `## Subordinate Agent List`
- `## Task Assignment Strategy`
- `## Parallelism Strategy`
- `## Quality Control Mechanism`
- `## Completion Contract`

### Specialist Requirements

Specialist `developer_instructions` must include (matching the canonical `.claude/agents/` template; `## Reasoning` and `## Self-Critique` are the structural gates required by `.codex/rules/reasoning-and-self-critique.md`, ordered Reasoning → Workflow → Self-Critique):

- `## Identity`
- `## Responsibilities`
- `## Input and Output`
- `## Reasoning`
- `## Workflow`
- `## Self-Critique`
- `## Boundaries`
- `## Uncertainty Protocol`

EC-1 return duties (the completion contract) and worklog-path write fences (file ownership) are stated in the dispatch preamble at the top of `developer_instructions` and governed by `.codex/rules/execution-contract.md`.

## Violation Determination

- generated agent TOML misses `name`, `description`, `model`, `model_reasoning_effort`, `sandbox_mode`, or `developer_instructions` -> Violation
- analysis-only agent uses `workspace-write` without report-writing justification -> Violation
- coordinator lacks required coordination sections -> Violation
- specialist lacks the Reasoning/Self-Critique gates, the EC-1 return preamble, or boundaries -> Violation

## Exceptions

If Codex runtime schema changes, update this rule and `.codex/docs/claude-to-codex-mapping.md` in the same change.
