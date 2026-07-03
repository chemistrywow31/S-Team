---
name: Fact Check Standard
description: Every factual claim in the presentation must have a verified source from the Source Registry
---

# Fact Check Standard

## Applicability

- Applies to: `investigative-researcher`, `presentation-writer`, `qa-reviewer`

## Rule Content

### Source Registry Requirements

The Investigative Researcher must produce a Source Registry as a structured document containing:
- Source identifier (unique ID per source)
- Source URL or citation
- Credibility rating on a 1–5 scale (1 = unreliable, 5 = highly authoritative)
- Date accessed
- Brief description of what the source substantiates

### Credibility Threshold

Sources rated below 3 must not be used in the presentation unless corroborated by at least one source rated 3 or higher that supports the same claim. When corroboration is used, reference both source IDs in the slide's source annotation.

### Presentation Writer Obligations

The Presentation Writer must:
- Reference at least one Source Registry entry for every factual claim (statistics, dates, quotes, named findings)
- Include source IDs in speaker notes for each slide containing factual claims
- Omit any claim that lacks a valid Source Registry entry rather than presenting it unsourced

### QA Reviewer Obligations

The QA Reviewer must:
- Cross-check every factual claim in the presentation against the Source Registry
- Flag any claim that has no corresponding Source Registry entry
- Flag any claim that relies solely on a source rated below 3 without corroboration
- Reject the presentation if any unsourced factual claims remain after review

## Violation Determination

- A slide states a statistic without a Source Registry reference → Violation
- Source Registry contains a source rated 2 with no corroboration by a source rated 3+, but the presentation uses it → Violation
- QA Reviewer approves a presentation that contains unsourced factual claims → Violation
- Presentation Writer includes a factual claim and marks it as "source pending" in the final deliverable → Violation
- Investigative Researcher delivers a Source Registry with entries missing credibility ratings → Violation
