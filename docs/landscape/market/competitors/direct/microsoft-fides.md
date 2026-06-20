# Microsoft FIDES

**Category:** Research prototype — same mental model as Airlock, partially shipped
**Paper:** arXiv:2505.23643 (May 2025)
**Code:** https://github.com/microsoft/fides
**Partial deployment:** GitHub Copilot CLI (behind `FIDES_IFC` feature flag), Microsoft Agent Framework Python package
**Source:** https://commandline.microsoft.com/information-flow-control-moving-toward-secure-autonomous-agents/

## What It Does

FIDES applies information-flow control (IFC) to MCP tool responses. It assigns integrity labels to responses based on data source characteristics — the documented example: files and issues from public GitHub repos are labeled `untrusted`, files from private repos are labeled `trusted`. This is explicitly source-trustworthiness classification, not pattern detection.

The system includes an MCP gateway component that applies labels to off-the-shelf MCP servers that don't natively support IFC. It then blocks agent actions (outbound tool calls) when the accumulated context label exceeds policy — if untrusted content has entered context, certain high-impact actions are gated.

## Where It Overlaps With Airlock

**Classify by source, not by pattern.** FIDES shares Airlock's core mental model: the question is "where did this data come from and who can write to it?" not "does this data contain a known attack pattern." This is the same insight. Microsoft Research arrived at it independently.

**Per-endpoint label policy.** FIDES maintains label assignments at the tool level for the GitHub MCP server — structurally analogous to Airlock's per-endpoint trust registry, but currently limited to one server.

**MCP gateway component.** FIDES includes a proxy layer that applies labels to MCP servers without native IFC support — the same proxy architecture Airlock uses.

## Where It Diverges

**No Spotlighting.** Labels live in the `_meta` field on MCP protocol messages — the orchestrator's accounting layer. The model never sees `[UNTRUSTED]...[/UNTRUSTED]` in its context. The model cannot reason about trust provenance from its own context window. This is the opposite of Airlock's Spotlighting approach.

**No developer UX.** Enforcement is policy-based flow control — certain actions are blocked when untrusted content is present. There are no developer-facing confirmation prompts, no "untrusted content was read this session" surfacing.

**Single server coverage.** Per-endpoint label assignments currently cover only the GitHub MCP server. No general-purpose community registry exists.

**Research prototype.** The `FIDES_IFC` feature flag in GitHub Copilot CLI is experimental opt-in. Not generally available, not documented as a shipping product feature.

## Strategic Risk

FIDES is the highest-risk research threat in the competitive landscape. Microsoft Research has:
- The right mental model (classify by source)
- A working implementation
- A partial GitHub Copilot CLI deployment
- Distribution via GitHub Copilot Enterprise (Fortune 500 install base)

If Microsoft adds Spotlighting-style injection into model context, expands the label registry beyond GitHub, and ships a developer-facing confirmation UX, they would cover all five Airlock differentiators with enterprise distribution Airlock cannot match.

The window risk: FIDES was published May 2025 and is already behind a feature flag 12 months later. Microsoft moves slowly on experimental research features. But this is the company to watch, not any of the funded startups.
