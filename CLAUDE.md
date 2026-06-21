# Airlock

## What This Is

A two-component security tool targeting the agentjacking attack class (prompt injection via MCP) — malicious instructions injected into external data sources that AI coding agents read via MCP and execute.

**Component 1:** MCP proxy — classifies tool responses by source trust level, wraps untrusted content in randomized per-session Spotlighting markers, and injects a prompt resource at session start that gives the model a baseline posture of skepticism toward all external data with heightened scrutiny for marked content. Only untrusted content is marked — trusted content passes through without annotation, making no positive safety claim about it.

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

**Proxy attribution:** The proxy cannot claim "this action was triggered by untrusted content" — the causal chain passes through the model's reasoning, which is not attributable from the outside. Layer 2 (content matching) makes a narrower, honest claim: "this action content has high string similarity to known untrusted content." That is a finding, not a causal proof.

**Spotlighting is judgment assist, not enforcement:** Markers give the model the correct signal to reason about trust. A well-reasoning model with markers performs better than without. But the model's compliance is not guaranteed — a sufficiently adversarial payload can attempt to override the trust instruction in the same context channel. Markers are randomized per-session and content is sanitized before wrapping to prevent attacker marker injection. Do not describe Spotlighting as preventing agentjacking — it reduces its probability.

**Content matching scope:** Layer 2 catches literal injection (attacker content reproduced verbatim or near-verbatim in a tool call). It does not catch natural language instruction injection (attacker writes in natural language, model generates its own action). The latter class has no proxy-level defense.

**Local overrides:** Developers can override community registry classifications via `.airlock.yml` at the project root. Local overrides take precedence over the registry. They are never submitted to the community registry.

**Spotlighting numbers:** The >50% to <2% reduction figures come from arXiv:2403.14720 under controlled RAG pipeline experimental conditions. Transfer to MCP contexts is unverified. Always cite with this caveat — do not present as a production guarantee.

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
- Claiming Airlock prevents agentjacking — it does not enforce. Correct claim: reduces exploitation probability (Layer 1) and surfaces high-confidence injection evidence (Layer 2).
- Describing Spotlighting markers as enforcement — they are structural signals that assist model reasoning. A sufficiently adversarial payload can attempt to override them.
- Claiming Layer 2 content matching catches all injection — it catches literal propagation only. Natural language instruction injection (model generates its own actions from injected intent) is outside the scope of what a proxy can catch.
