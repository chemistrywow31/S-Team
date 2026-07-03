---
name: Communication Protocol
description: All task routing goes through the Coordinator; specialists have no peer messaging and communicate through dispatches, EC-1 returns, and the worklog
---

# Communication Protocol

## Applicability

- Applies to: All agents (`coordinator`, `investigative-researcher`, `domain-expert`, `presentation-architect`, `technical-architect`, `presentation-writer`, `visual-designer`, `web-developer`, `qa-reviewer`, `process-reviewer`)

## Rule Content

### Task Assignment Authority

All task assignments go through the Coordinator. Only the Coordinator dispatches work, via the Task tool from within the main session. Specialists must not assign work to each other, spawn other agents, or re-scope their own dispatch.

### No Peer Messaging

Specialists run in isolated Task-dispatched contexts and have no direct-messaging, shared-task-ledger, or team-wide announcement primitives. All inter-agent information flow uses exactly two channels:

- **Worklog**: an agent writes findings, hand-off notes, and artifacts to its dispatched worklog path; downstream agents read those paths from their own dispatch.
- **Coordinator relay**: anything a same-phase peer needs mid-run (e.g., the Presentation Architect's `[TECH]` slide list for the Technical Architect, or a source-conflict flag for the Domain Expert) is written to the worklog and relayed by the Coordinator in a dispatch or re-dispatch.

Parallel groups (Phase 2: Investigative Researcher ∥ Domain Expert; Phase 5: Visual Designer ∥ Web Developer) are concurrent Task dispatches in the same Coordinator turn — parallelism never implies direct peer contact.

### Task Completion Protocol

Every agent ends its run with exactly one EC-1 six-field report to the Coordinator per `rules/execution-contract.md`: `STATUS` / `CONCLUSIONS` / `EVIDENCE` / `ARTIFACTS` / `RISKS/UNKNOWNS` / `NEXT`. Deliverable locations go in ARTIFACTS; blockers discovered for downstream tasks go in RISKS/UNKNOWNS. There is no separate task-ledger update step — the EC-1 return is the completion signal.

### Questions Route Through the Coordinator

A specialist that needs user input or peer information ends its run with `STATUS: NEEDS_CONTEXT` and a `QUESTIONS:` block. The Coordinator relays user questions to the user, appends the exchange to the task's `dialogue-log.md`, and re-dispatches with the answers. Specialists never converse with the user directly.

### No Premature Work

Agents work only on what their dispatch scopes. A Task-dispatched agent that identifies adjacent work outside its scope fence records it in RISKS/UNKNOWNS or NEXT for the Coordinator to dispatch — it does not perform the work.

### Phase Transition Control

The Coordinator must hold every phase gate: all agents in a phase (including both members of a parallel group) must return EC-1 reports and pass EC-3 fresh-context verification before any Phase N+1 dispatch. Do not dispatch Phase N+1 work while any Phase N dispatch is outstanding.

## Violation Determination

- A specialist attempts to message, spawn, or assign work to another agent → Violation (all routing goes through the Coordinator)
- A specialist asks the user a question directly instead of returning `NEEDS_CONTEXT` with a `QUESTIONS:` block → Violation
- A specialist performs work outside its dispatched scope fence instead of reporting it → Violation
- An agent completes work without returning the EC-1 six-field report → Violation
- Coordinator dispatches Phase N+1 while a Phase N dispatch is outstanding or unverified → Violation

## Exceptions

This rule has no exceptions.
