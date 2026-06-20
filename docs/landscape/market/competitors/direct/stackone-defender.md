# StackOne Defender

**Category:** Open source — MCP response injection detection with content marking
**Source:** https://github.com/StackOneHQ/defender, https://www.stackone.com/blog/indirect-prompt-injection-mcp-tools-defense/

## What It Does

Scans MCP tool responses for injected content in two tiers:
1. Regex pattern matching for known attack signatures
2. ML classifier that scores sentences by injection likelihood

When injection is detected, it wraps the flagged content in boundary tags (`[UD-{id}]...[/UD-{id}]`) and injects those markers into the model context before the response is processed.

## What to Learn From Them

**They've shipped the injection mechanism.** The boundary tag injection into model context is structurally the same operation as Spotlighting — insert structural markers into the content so the model sees them. The difference is what triggers the marking. StackOne marks content because it detected an attack pattern. Airlock marks content because of where it came from. Same mechanism, different trigger.

This means the technical question "can you inject trust markers into MCP response content and have the model respond to them" is already answered in production by StackOne. The injection approach works.

## Where It Diverges From Airlock

The trigger is threat detection, not source classification. A GitHub issue with no detected injection pattern passes through untagged — even though the data source is publicly writable by anyone. StackOne catches known attacks; Airlock marks all externally-writable content regardless of whether a specific attack is present.

No per-endpoint trust registry. No developer confirmation prompts. No provenance classification by data source.
