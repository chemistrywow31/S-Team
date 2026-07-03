---
name: Coordinator Mandate
description: Require one non-executing Coordinator running a flat architecture in the main session
---

# Coordinator Mandate

## Applicability

- Applies to: all agents (every member of the team must understand the coordination boundary)

## Rule Content

### Coordinator Must Exist and Run in the Main Session

The team has exactly one Coordinator, defined at `.claude/agents/coordinator.md` (in the `agents/` root, not a subfolder). The Coordinator runs in the MAIN session: invoking `/boss` makes the current session adopt `coordinator.md` as its playbook. The Coordinator must never be spawned as a subagent — a spawned coordinator cannot dispatch further agents and cannot converse with the user.

### Coordinator Does Not Execute

The Coordinator is responsible only for task planning, dispatch, progress tracking, and quality control. It must not perform the execution work of any specialist (research, architecture, content writing, visual design, build, or review). All execution goes through Task-tool dispatch to specialists, each in its own fresh context.

### Flat Architecture

The team uses a flat architecture: the single Coordinator directly manages all nine specialists. Sub-coordinators are prohibited — they add context-relay overhead and degrade information quality in the Task tool.

### Worktree Isolation for File-Mutating Agents

When dispatching an agent that will modify existing files, the Coordinator must decide whether to pass `isolation: "worktree"` and log the decision in `decisions.md`.

**Use worktree isolation when**: the agent runs experimental changes that may be discarded; multiple agents modify the same files in parallel (e.g., Phase 5 Visual Designer ∥ Web Developer touching shared assets); the change crosses a refactor boundary that may need rollback.

**Do not use worktree isolation when**: the output is the worklog or a single new file (no existing-file mutation); the agent must observe the latest user changes in the main worktree; the work is small and atomic.

After a worktree-isolated agent completes, the Coordinator must decide merge, discard, or hand off to review before merging, and log the decision with rationale.

## Violation Determination

- Team has no `coordinator.md` in the `agents/` root directory → Violation
- Coordinator .md lists execution work (non-coordination duties) in its Responsibilities section → Violation
- Coordinator is spawned as a subagent instead of adopted in the main session → Violation
- Team contains a sub-coordinator whose sole purpose is relaying tasks between the Coordinator and specialists → Violation
- Coordinator dispatches a file-mutating agent without considering worktree isolation and the choice is not logged in `decisions.md` → Violation
- Coordinator merges a worktree-isolated agent's changes without logging the merge decision → Violation

## Exceptions

This rule has no exceptions.
