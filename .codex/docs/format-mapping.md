# Format Mapping

## Summary

- Requested delivery format: Codex-supported conversion of `.claude/` and `CLAUDE.md`
- Canonical authored format: Codex-native
- Source conversion input: `CLAUDE.md`, `.claude/agents/`, `.claude/rules/`, `.claude/skills/`, and `.claude/styles/`
- Legacy/source retained: yes, unchanged
- Future compatibility target: Claude-compatible export can be regenerated from Codex artifacts with documented lossy cases

## Claude To Codex

| Claude Source Path | Codex Target Path | Status | Notes |
| --- | --- | --- | --- |
| `CLAUDE.md` | `AGENTS.md` | adapted | Runtime terms changed to Codex multi-agent semantics. |
| `.claude/agents/coordinator.md` | `agents/coordinator.toml` | adapted | Coordinator kept non-producing and registered in `.codex/config.toml`. |
| `.claude/agents/**/*.md` | `agents/**/*.toml` | adapted | Markdown bodies preserved and extended with Codex preflight, verification, completion, file ownership, and boundaries. |
| `.claude/rules/*.md` | `.codex/rules/*.md` | adapted | Rule semantics preserved with Codex paths and layout-gate invocation. |
| `.claude/skills/*/SKILL.md` | `.codex/skills/*/SKILL.md` and `.agents/skills/*/SKILL.md` | adapted | Authored and runtime mirrors exist. Claude-only skill frontmatter removed. |
| `.claude/skills/*/scripts/**` | `.codex/skills/*/scripts/**` and `.agents/skills/*/scripts/**` | direct/adapted | Runtime scripts preserved. Text comments use Codex paths. |
| `.claude/styles/**` | `.codex/styles/**` | direct/adapted | Style token system, README, and reference assets preserved and converted to Codex paths. |
| `.claude/settings.json` | `.codex/config.toml` + `.codex/rules/worklog.md` | lossy | Claude permissions/hooks are non-portable; portable intent captured in Codex runtime docs. |

## Codex To Claude

| Codex Path | Claude Target Path | Status | Notes |
| --- | --- | --- | --- |
| `AGENTS.md` | `CLAUDE.md` | adapted | Reverse export must restore Claude Agent Teams terminology only in compatibility output. |
| `.codex/config.toml` | `.claude/settings.json` | lossy | Agent registry, model settings, and Codex feature flags have no direct Claude settings equivalent. |
| `agents/**/*.toml` | `.claude/agents/**/*.md` | adapted | `developer_instructions` maps to Markdown body; TOML runtime fields become sidecar metadata. |
| `.codex/rules/*.md` | `.claude/rules/*.md` | adapted | Path references must be rewritten back to Claude locations. |
| `.codex/skills/*/SKILL.md` | `.claude/skills/*/SKILL.md` | adapted | Claude-only `allowed-tools` or `argument-hint` may be regenerated only for compatibility. |
| `.codex/styles/**` | `.claude/styles/**` | direct/adapted | Style tokens and reference assets round-trip directly except path text. |

## Agent Mapping

| Codex Path | Claude Source | Status |
| --- | --- | --- |
| `agents/coordinator.toml` | `.claude/agents/coordinator.md` | adapted |
| `agents/research/investigative-researcher.toml` | `.claude/agents/research/investigative-researcher.md` | adapted |
| `agents/research/domain-expert.toml` | `.claude/agents/research/domain-expert.md` | adapted |
| `agents/planning/presentation-architect.toml` | `.claude/agents/planning/presentation-architect.md` | adapted |
| `agents/planning/technical-architect.toml` | `.claude/agents/planning/technical-architect.md` | adapted |
| `agents/production/presentation-writer.toml` | `.claude/agents/production/presentation-writer.md` | adapted |
| `agents/production/visual-designer.toml` | `.claude/agents/production/visual-designer.md` | adapted |
| `agents/production/web-developer.toml` | `.claude/agents/production/web-developer.md` | adapted |
| `agents/quality/qa-reviewer.toml` | `.claude/agents/quality/qa-reviewer.md` | adapted |
| `agents/review/process-reviewer.toml` | none | codex-added |

## Style Mapping

| Codex Style Path | Claude Source | Status | Notes |
| --- | --- | --- | --- |
| `.codex/styles/README.md` | `.claude/styles/README.md` | adapted | Active Codex style-system spec. |
| `.codex/styles/tech-mystery/tokens.md` | `.claude/styles/tech-mystery/tokens.md` | adapted | Built-in style preserved. |
| `.codex/styles/minimal-modern/tokens.md` | `.claude/styles/minimal-modern/tokens.md` | adapted | Built-in style preserved. |
| `.codex/styles/editorial/tokens.md` | `.claude/styles/editorial/tokens.md` | adapted | Built-in style and reference asset preserved. |
| `.codex/styles/bauhaus/tokens.md` | `.claude/styles/bauhaus/tokens.md` | adapted | Built-in style preserved. |

## Lossy Or Unsupported Areas

- Claude permission allowlists, ask/deny policy, and hook events are not Codex runtime requirements.
- Claude-only skill frontmatter (`allowed-tools`, `disable-model-invocation`, `argument-hint`) is not canonical in Codex skills.
- Codex agent `model`, `model_reasoning_effort`, and `sandbox_mode` are runtime defaults injected during conversion.

## Round-Trip Notes

- Treat Codex artifacts as the active source of truth.
- Keep `.claude/` unchanged unless explicitly reverse-exporting.
- Preserve style folder names and token section order to avoid design drift.
- Keep `config_file` paths relative to `.codex/`; standard entries point to `../agents/...`.

## Doctrine Update — 2026-07-03 (supersedes conflicting statements above)

Phase 7 restructuring flipped the platform doctrine. Where this section conflicts with the Summary or Round-Trip Notes above, this section wins:

- Canonical authored format: **Claude** (`.claude/` + `CLAUDE.md`), fully restructured to subagent mode (coordinator main-session adoption via `$boss`; specialists dispatched with fresh context; EC-1 six-field returns; no shared task ledger, no peer messaging).
- The Codex tree (`AGENTS.md`, `agents/**/*.toml`, `.codex/rules/`, `.codex/skills/`, `.agents/skills/`) is **generated parity**, regenerated from the Claude tree. Treat `.claude/` as the source of truth; hand-edits to generated Codex surfaces will be overwritten at the next regeneration.
- Conversion additions since the original mapping: `.claude/rules/execution-contract.md` → `.codex/rules/execution-contract.md` (EC-1..EC-5, escalation tiers mapped haiku/sonnet/opus → `medium`/`high`/`xhigh` reasoning effort); `.claude/rules/layout-overflow/{html,pptx,pdf}.md` → `.codex/rules/layout-overflow/*` (umbrella + children); `.claude/skills/render-content-gate/` → `.codex/skills/render-content-gate/` + `.agents/skills/render-content-gate/` (script and fixtures copied verbatim).
- Claude agent frontmatter model mapping: `opus` → `gpt-5.4`; effort `max`/`xhigh` → `model_reasoning_effort = "xhigh"` (Codex ceiling), `high` → `"high"`.
- The 7 Codex-native rules with no Claude source remain preserved across regenerations: codex-runtime-config, codex-agent-config-patterns, context-isolation, yaml-frontmatter, prompt-engineering-patterns, writing-quality-standard, presentation-visual-asset-standard.
- `agents/review/process-reviewer.toml` is no longer codex-added: its Claude source is `.claude/agents/review/process-reviewer.md` (status: adapted).

## Removal Note — 2026-07-03 (image generation)

API-based image generation was removed from the team (user-approved). The former image-generation skill and its config mapping rows are deleted from this document: the skill no longer exists on either platform (former paths, for the record: the image-generation skill under the Claude skills tree and its Codex/`.agents` mirrors, including the sanitized config.json pair). Raster visuals are now sourced from existing project assets and user-provided images only; when no raster asset fits, visuals are composed from CSS/SVG/icon/typographic elements. `.codex/rules/presentation-visual-asset-standard.md` remains in force for selected/user-provided/edited images.
