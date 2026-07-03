---
name: Reviewer Mandate
description: Require a dedicated Process Reviewer distinct from the QA Reviewer, with defined dimensions and report format
---

# Reviewer Mandate

## Applicability

- Applies to: all agents (every member of the team must understand this separation of duties)

## Rule Content

### Process Reviewer Must Exist

The team must contain a dedicated Process Reviewer role. The Process Reviewer runs at Phase 6.5, after the QA Reviewer's Phase 6 quality pass, and evaluates how the team collaborated across the whole project cycle.

### Process Reviewer Does Not Overlap with QA

The QA Reviewer and the Process Reviewer are distinct roles and must not be merged:

- **QA Reviewer (Phase 6)** checks whether deliverables meet quality standards — correctness, completeness, source attribution, layout-gate pass, visual-effects compliance, format.
- **Process Reviewer (Phase 6.5)** checks how the team worked — communication quality, handoff efficiency, information flow, workflow adherence, and missed opportunities.

The two must not be collapsed into one agent, even when convenient.

### Process Reviewer Scope

The Process Reviewer must evaluate at minimum these dimensions:

1. **Inter-agent communication quality** — Were handoff messages clear and complete? Was critical information lost between agents?
2. **Workflow adherence** — Did agents follow the 7+6.5 phase order? Were steps skipped or run out of order?
3. **Collaboration efficiency** — Were there unnecessary back-and-forth cycles? Were blockers surfaced and resolved promptly?
4. **Information completeness** — Did downstream agents receive all context they needed from upstream (e.g., the source registry, the style key, architecture decisions)?
5. **Missed opportunities** — Were risks or improvements that no agent surfaced during execution?
6. **Scope drift detection** — Did each phase produce exactly what was requested? Flag both scope creep (unrequested additions) and requirements gaps (stated work not addressed). This dimension is informational, not blocking.

### Process Reviewer Output

The Process Reviewer must produce a structured retrospective report per cycle containing:

- A rating for each evaluation dimension above
- Specific evidence (worklog paths, task IDs, deliverable references) for every identified issue
- A scope-drift summary tagged `[CLEAN / DRIFT DETECTED / REQUIREMENTS MISSING]` with specific items
- Actionable recommendations for process improvement
- Positive highlights of what worked well

### Placement

The Process Reviewer must have its own agent config file in a dedicated review group folder (e.g., `agents/review/`). It must not share a group folder with the execution agents whose work it reviews.

## Violation Determination

- Team has no Process Reviewer agent → Violation
- Process Reviewer checks deliverable correctness (QA duties) instead of process quality → Violation
- QA Reviewer and Process Reviewer merged into one agent → Violation
- Process Reviewer placed in the same group folder as execution agents it reviews → Violation
- Process Reviewer config missing the six evaluation dimensions → Violation
- Process Reviewer config missing the retrospective report format → Violation

## Exceptions

This rule has no exceptions.
