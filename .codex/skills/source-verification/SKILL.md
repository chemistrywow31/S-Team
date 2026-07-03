---
name: Source Verification
description: Verifies web source credibility and produces structured Source Registry entries with reliability ratings
---

# Source Verification

Use this skill to evaluate the credibility of web sources and produce structured Source Registry entries. Apply this skill to every source discovered during research before including it in any presentation content.

## Credibility Assessment Criteria

Evaluate each source against these four dimensions:

### 1. Author Authority

| Score | Definition |
|---|---|
| 5 | Recognized expert with peer-reviewed publications or senior role at a leading institution in the field |
| 4 | Professional with demonstrated experience and public track record in the domain |
| 3 | Credentialed professional or journalist at a reputable outlet covering the topic |
| 2 | Anonymous author, self-published, or author with no verifiable credentials |
| 1 | Known unreliable author, previously retracted work, or clear conflict of interest |

### 2. Publication Reputation

| Score | Definition |
|---|---|
| 5 | Tier-1 academic journal, official government data source, or established industry authority (e.g., Nature, IEEE, WHO) |
| 4 | Major news outlet with editorial standards, well-known industry publication (e.g., Reuters, Wired, Harvard Business Review) |
| 3 | Reputable blog, mid-tier publication, or company engineering blog with editorial review |
| 2 | Personal blog, forum post, or publication with no editorial process |
| 1 | Known misinformation source, content farm, or site with a history of retractions |

### 3. Recency

| Score | Definition |
|---|---|
| 5 | Published within the last 6 months |
| 4 | Published within the last 1 year |
| 3 | Published within the last 2 years |
| 2 | Published within the last 5 years |
| 1 | Published more than 5 years ago, or no publication date available |

Adjust recency expectations based on topic: for fast-moving fields (AI, cybersecurity), prioritize sources within the last 12 months. For stable domains (mathematics, established engineering principles), older sources remain valid.

### 4. Corroboration

| Score | Definition |
|---|---|
| 5 | Core claims confirmed by 3 or more independent sources |
| 4 | Core claims confirmed by 2 independent sources |
| 3 | Core claims confirmed by 1 independent source |
| 2 | No corroboration found, but claims are plausible and consistent with domain knowledge |
| 1 | Claims contradict multiple reliable sources |

## Overall Credibility Score

Calculate the overall credibility score as the average of the four dimension scores, rounded to one decimal place.

| Overall Score | Rating | Usage Guidance |
|---|---|---|
| 4.0 - 5.0 | High | Use freely as a primary source |
| 3.0 - 3.9 | Medium | Use with attribution; pair with a higher-rated corroborating source when possible |
| 2.0 - 2.9 | Low | Do not use as a primary source; use only for background context with explicit caveat |
| 1.0 - 1.9 | Reject | Do not include in the presentation under any circumstance |

## Verification Process

Follow these steps for each source:

1. **Identify the source URL and retrieve the content** using web.run open.
2. **Determine the author**: Find the author name, bio, and affiliations. Search for the author's other publications and credentials using web.run search_query.
3. **Assess the publication**: Identify the publishing outlet. Check its reputation, editorial policies, and history.
4. **Check recency**: Find the publication date. Calculate the age relative to today.
5. **Corroborate claims**: Extract the 2-3 core factual claims from the source. Search for each claim independently using web.run search_query to find confirming or contradicting sources.
6. **Score each dimension** using the rubrics above.
7. **Calculate the overall score** and determine the rating.
8. **Produce the Source Registry entry** in the format below.

## Source Registry Entry Format

```yaml
source_id: SRC-{sequential_number}
url: "{full URL}"
title: "{article or page title}"
author: "{author name or 'Unknown'}"
publication: "{outlet name}"
date_published: "{YYYY-MM-DD or 'Unknown'}"
date_accessed: "{YYYY-MM-DD}"
credibility:
  author_authority: {1-5}
  publication_reputation: {1-5}
  recency: {1-5}
  corroboration: {1-5}
  overall: {calculated average, 1 decimal}
  rating: "{High|Medium|Low|Reject}"
key_claims:
  - claim: "{factual claim extracted from source}"
    corroborated_by: ["{SRC-xxx}", "{SRC-yyy}"]  # or [] if none
notes: "{any caveats, biases, or context relevant to using this source}"
```

## Example

### Input

Verify the credibility of this source for a presentation on "AI in Healthcare":
- URL: `https://www.nature.com/articles/s41591-023-02448-8`

### Verification Process

1. **Retrieve content**: Fetch the article via web.run open. Title: "Large language models in medicine: opportunities and challenges." Authors: Dr. Anil Agrawal et al., affiliated with Stanford University School of Medicine.

2. **Author authority assessment**: Search "Anil Agrawal Stanford medicine publications" via web.run search_query. Result: 47 peer-reviewed publications, h-index 32, associate professor at Stanford. Score: **5**.

3. **Publication reputation**: Nature Medicine is a Tier-1 peer-reviewed journal with rigorous editorial standards and an impact factor above 80. Score: **5**.

4. **Recency**: Published 2023-07-15. Within the last 2 years. For AI (fast-moving field), this is acceptable but not the latest. Score: **3**.

5. **Corroboration**: Core claim: "LLMs achieve physician-level performance on medical licensing exams." Corroborated by: (a) Google Research paper on Med-PaLM 2 (SRC-003), (b) Microsoft Research evaluation of GPT-4 on USMLE (SRC-007), (c) NEJM editorial on AI diagnostic accuracy (SRC-012). Score: **5**.

6. **Calculate overall**: (5 + 5 + 3 + 5) / 4 = **4.5**. Rating: **High**.

### Output

```yaml
source_id: SRC-001
url: "https://www.nature.com/articles/s41591-023-02448-8"
title: "Large language models in medicine: opportunities and challenges"
author: "Anil Agrawal et al."
publication: "Nature Medicine"
date_published: "2023-07-15"
date_accessed: "2026-02-10"
credibility:
  author_authority: 5
  publication_reputation: 5
  recency: 3
  corroboration: 5
  overall: 4.5
  rating: "High"
key_claims:
  - claim: "LLMs achieve physician-level performance on medical licensing exams"
    corroborated_by: ["SRC-003", "SRC-007", "SRC-012"]
  - claim: "Clinical deployment requires validation on diverse patient populations"
    corroborated_by: ["SRC-012"]
notes: "Strong academic source. Recency score reflects the fast pace of AI research; check for newer follow-up studies."
```

## Edge Cases

- **Paywalled content**: If the full article is behind a paywall and web.run open cannot retrieve it, score based on the abstract, author credentials, and publication reputation. Add a note: "Full text not accessible; scored based on metadata and abstract."
- **Social media posts**: Cap publication reputation at 2 for social media sources (Twitter/X, LinkedIn, Reddit). Author authority may still score high if the poster is a verified domain expert.
- **Pre-print servers** (arXiv, medRxiv): Cap publication reputation at 3. Note that the work has not undergone peer review.
- **Company blogs and whitepapers**: Cap publication reputation at 3. Check for commercial bias and note it.
