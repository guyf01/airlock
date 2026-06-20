# Agentjacking Project

## What This Is

A two-component security tool targeting the agentjacking attack class — malicious instructions injected into external data sources that AI coding agents read via MCP and execute.

**Component 1:** MCP proxy — classifies tool responses by trust level, applies Spotlighting markers, surfaces confirmation prompts to developers before risky actions.

**Component 2:** MCP Server SDK — library for server authors to self-annotate their endpoints with trust levels natively. Proxy defers to native annotations when present.

**End goal:** Drive MCP protocol standardisation of trust provenance metadata. Proxy adoption is the path to spec contribution credibility.

**Target users:** Developers running AI coding agents (Claude Code, Cursor, Codex) who want protection today.

## Docs Structure

```
docs/
  problem/       — the attack class and why no current layer addresses it (facts)
  landscape/     — external world: MCP protocol state, market, research, codemode
  solution/      — our design choices and their rationale
  disclosures/   — known real-world instances of the attack
```

**Strict separation rules:**
- `landscape/` = facts about the world. No opinions about our solution.
- `solution/` = our design. Implications for our approach go here, not in landscape.
- If a doc analyses how the external world affects our design → `solution/`.
- If a doc describes what the external world looks like → `landscape/`.

## Trust Levels

Three levels used throughout:
- `trusted` — operator-initiated data whose origin is controlled by the developer
- `untrusted-external` — user-submitted or externally-sourced data
- `context-dependent` — provenance depends on what was written to the source, not just the server

**Known classification decisions:**
- `filesystem.read_file` → `context-dependent` (files may contain third-party content)
- `filesystem.write_file` → `context-dependent` (content being written may originate from untrusted sources)
- Unknown servers/endpoints → `untrusted-external` (conservative default)

## Key Design Decisions and Rationale

**Proxy attribution:** The proxy cannot claim "this action was triggered by untrusted content" — the causal chain passes through the model's reasoning. It can only observe "untrusted content was present this session." Confirmation prompts must reflect this.

**Local overrides:** Developers can override community registry classifications via `.agentjacking.yml` at the project root. Local overrides take precedence over the registry. They are never submitted to the community registry.

**Spotlighting numbers:** The >50% to <2% reduction figures come from arXiv:2403.14720 under controlled experimental conditions. Always cite with this caveat — do not present as a production guarantee.

**Registry governance:** Asymmetric burden — downgrading from untrusted-external requires stronger justification than upgrading toward it. Missing/disputed entries default to untrusted-external.

## Code Mode (Cloudflare)

Code mode is an MCP server pattern by Cloudflare — two tools (`search()` + `execute()`) backed by V8 isolates. Built on MCP, not a replacement.

For code mode servers, our solution adapts:
1. Trust levels are attached to `search()` results (by server natively, or by proxy from registry)
2. Proxy tracks search state and derives `execute()` trust from it — most conservative trust level among searched functions wins. No isolate instrumentation needed.
3. Without registry coverage, all `execute()` output defaults to `untrusted-external`.

If code mode becomes the dominant MCP server pattern industry-wide, the per-endpoint registry approach needs redesign. See `docs/solution/codemode-implications.md`.

## What to Avoid

- Claiming provenance is fully lost — structural provenance (response boundaries) exists; content-level provenance (which tokens are injected) does not.
- Saying "traditional controls cannot detect" — EDR does behavioural analysis. Correct claim: they lack the signal to attribute cause to injected instructions at the point of content ingestion.
- Asserting "none of these parties have moved because coordination failure" — speculative. We don't know why nothing has moved.
- Using Sentry as the example throughout docs — the attack class is general; Sentry is one disclosure.
- Claiming code mode is Anthropic's or describing it as replacing MCP — it's Cloudflare's, built on MCP.
- `write_file: trusted` — wrong. Content being written may come from untrusted sources.
