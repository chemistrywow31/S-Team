---
name: Execution Contract
description: Define the reporting schema, escalation ladder, verification protocol, precedence order, and context caps every agent must follow
---

# Execution Contract

## Applicability

- Applies to: all agents (Coordinator and every dispatched specialist)
- Cite clauses by number when resolving disputes or writing dispatches, e.g. "per EC-2.4"

## EC-1 Reporting Contract

- **EC-1.1** Every task return must contain exactly these six fields, in order: `STATUS:` DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT; `CONCLUSIONS:` (max 10 lines, outcomes not narrative); `EVIDENCE:` (file:line pointers or command output proving each conclusion); `ARTIFACTS:` (paths to every file produced or updated, marking new files `(new)`); `RISKS/UNKNOWNS:` (write "none" when none); `NEXT:` (exactly one recommendation).
- **EC-1.2** DONE with an empty EVIDENCE field is invalid. The Coordinator rejects any DONE report citing zero files or commands.
- **EC-1.3** Any product longer than 30 lines must be written to a file; the report carries the path plus a summary of at most 3 lines.
- **EC-1.4** Do not paste file contents, diffs, transcripts, or raw tool output into a report or dispatch. Write to a file, send the path.
- **EC-1.5** Coordinator status handling: DONE → verify per EC-3, then proceed. DONE_WITH_CONCERNS → log each concern, resolve or accept explicitly, proceed. BLOCKED → resolve the named blocker before re-dispatch; re-dispatching unchanged is forbidden. NEEDS_CONTEXT → supply the named items and re-dispatch.
- **EC-1.6** Bounce protocol: a report violating EC-1.1–EC-1.4 returns to the producer once with the schema attached. A second violation on the same task counts as a failed attempt under EC-2.4.
- **EC-1.7** NEEDS_CONTEXT is bounded: name every missing item in one return. When the missing item is user input, attach a `QUESTIONS:` block; the Coordinator relays it, logs the exchange to the task worklog, and re-dispatches with answers. More than 3 NEEDS_CONTEXT rounds on the same subtask → BLOCKED.

## EC-2 Escalation Ladder

The ladder is keyed to the model actually running the task (dispatch-time override if present, else the agent's `model:` frontmatter): SMALL = `haiku`, MID = `sonnet`, STRONG = `opus`.

- **EC-2.1** A haiku-tier task that fails its acceptance check gets zero retries at haiku — escalate to the next tier immediately (haiku → sonnet → opus), attaching the task, the failed check output, and artifact paths.
- **EC-2.2** A sonnet-tier task that fails gets one retry with a changed approach only; re-running the same approach is forbidden. A second consecutive failure → escalate to opus.
- **EC-2.3** Every escalation carries the full failure trace: goal, each attempt with its exact error or diff path, hypotheses eliminated, current file state. The receiving tier rejects escalations whose trace lists zero prior attempts.
- **EC-2.4** Global cap: one initial attempt plus at most two retries = three total per subtask, across all tiers. One exception: when the cap is consumed and a higher tier has not yet attempted, that tier gets exactly one escalation attempt with the full trace; after it fails, BLOCKED per EC-2.7.
- **EC-2.5** "Same subtask" = same acceptance criteria. Shrinking the goal to reset the counter is a violation. Criteria may be corrected at most once per deliverable, only with external evidence (a rule, spec, or user statement) recorded in the task worklog.
- **EC-2.6** When opus solves an escalated task, write a reusable recipe (preconditions, steps, verification command) to the task worklog before closing; remaining instances are then batch-applied at a lower tier.
- **EC-2.7** Cap exhausted: if a higher tier remains, escalate. If none remains, report BLOCKED and stop for user input.

## EC-3 Verification Protocol

- **EC-3.1** No self-verification. The agent that produced an artifact must not perform its acceptance, and the dispatching Coordinator must not be the sole acceptor. Producer Self-Critique remains mandatory but never counts toward acceptance.
- **EC-3.2** Acceptance is performed by a fresh-context verifier dispatched via Task, receiving only the acceptance criteria and the artifact paths — never the producer's reasoning, drafts, or history.
- **EC-3.3** Files: the verifier opens the actual file and checks each criterion, citing file:line evidence per criterion. A criterion with no cited evidence is FAIL.
- **EC-3.4** Executable artifacts (scripts, code, JSON): the verifier executes them (`jq` parse, run the script, run the test). For HTML deliverables, the layout-gate JSON report (`"status": "PASS"` at all four viewports) is the sole accepted layout evidence — visual self-attestation is rejected. A pass claim without execution output is FAIL.
- **EC-3.5** A judgment is high-risk when it matches ANY of: charter or rule amendment, deployment-mode choice, deleting or overwriting a file the current task did not create, external network write. Every high-risk judgment requires a second independent opinion from a separate judge agent. A file counts as task-created only when a prior EC-1 ARTIFACTS entry of this task marked it `(new)`; when ambiguous, treat it as NOT task-created (second opinion required).
- **EC-3.6** Verifier verdict format: one line per criterion — `{criterion} | PASS or FAIL | {evidence}` — then an overall verdict. Overall PASS requires every criterion PASS.

## EC-4 Precedence Order

When two instructions conflict, the higher source wins — resolve by citing this order, never by judgment:

1. Safety: `.claude/settings.json` deny rules and destructive-action guards
2. Charter: `CLAUDE.md` and this contract
3. EC-3 verification requirements
4. EC-1 reporting requirements
5. EC-2 escalation requirements
6. Other rules in `rules/`
7. Task-specific dispatch instructions
8. Style preferences (tone, formatting, length aesthetics)

Two conflicting rules at the same level: the rule with the narrower Applicability wins. Still tied → report BLOCKED and ask the Coordinator (specialists) or the user (Coordinator).

## EC-5 Context Economy

- **EC-5.1** The Coordinator creates one BRIEF file per task at `.worklog/{yyyymm}/{task-name}/brief.md` before the first dispatch (goal max 5 lines, constraints, key paths, pointers to each phase's `decisions.md`), updates it at every phase boundary, and passes its path — never its contents — in every dispatch.
- **EC-5.2** Dispatches follow the same path rule as reports (EC-1.4): paths in, paths out.
- **EC-5.3** Two caps, stricter wins: task reports max 40 lines; all other output max 60 lines per message per agent. A dispatch may raise either cap only by stating the new number explicitly.
- **EC-5.4** Coordinator session only: before re-reading a file over 200 lines already read this task, read its worklog summary instead; if none exists, write one after this read.

## Violation Determination

- Task return missing any EC-1.1 field, or fields out of order → Violation (bounce per EC-1.6)
- DONE status with empty EVIDENCE → Violation
- File contents, diffs, or transcripts pasted into a report or dispatch → Violation
- Retry of the same approach after failure at sonnet tier, or any retry at haiku tier → Violation
- Fourth attempt on the same acceptance criteria (excepting the single EC-2.4 higher-tier attempt) → Violation
- Escalation delivered without the failure trace → Violation
- Artifact accepted with no fresh-context verifier verdict, or producer/dispatching Coordinator acting as sole acceptor → Violation
- Dispatch missing the BRIEF path once the task's BRIEF exists → Violation
- Message exceeding 60 lines or task report exceeding 40 lines without a dispatch-raised cap → Violation

## Exceptions

- Phase 1 interactive conversation turns with the user are conversation, not task returns; EC-1 format does not apply to them.
- Micro-dispatches whose full context is under 200 words may pass context inline; the report format still applies.
- The BRIEF file is not required for single-dispatch tasks with no phases; the dispatch then carries the goal and paths directly.

Tradeoff: EC-3 adds one verifier dispatch per accepted deliverable and EC-5.1 adds one file per task — roughly one extra invocation per deliverable — which buys detection of false "done" claims before they propagate downstream.
