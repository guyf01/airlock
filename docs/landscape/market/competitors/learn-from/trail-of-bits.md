# Trail of Bits — mcp-context-protector

**Category:** Open source from an established offensive security research firm
**Stars:** 221
**Source:** https://github.com/trailofbits/mcp-context-protector, https://blog.trailofbits.com/2025/07/28/we-built-the-security-layer-mcp-always-needed/

## What It Does

Security wrapper proxying all MCP tool calls. Three mechanisms:

1. **Trust-on-first-use pinning** — captures tool descriptions and server instructions on first contact. If they change on a subsequent connection, the tool is blocked. Rug-pull detection without requiring a pre-built registry.

2. **LLM-as-judge** — scans tool responses with an LLM guardrail to detect injection patterns that heuristics miss. Ambiguous cases go to the judge rather than defaulting to block or pass.

3. **Quarantine with developer release gate** — suspicious responses are held in a local database rather than blocked outright. The developer explicitly releases a response via a `quarantine_release` tool call before the agent can use it.

## What to Learn From Them

**The quarantine release UX is a distinct pattern from Pipelock's confirmation prompt.** Pipelock asks in real time — "approve or deny?" — before the response reaches the model. Trail of Bits quarantines after detection and requires the developer to actively retrieve the response from holding. The developer's action is "I acknowledge this was flagged and I'm choosing to use it" rather than "I'm being asked in the moment." Different cognitive load, different failure mode.

**LLM-as-judge for ambiguous cases** is a pattern Airlock may want for provenance edge cases — where static endpoint classification isn't conclusive and a model pass is needed before deciding what trust level to apply.

**Credibility signal.** Trail of Bits publishing "we built the security layer MCP always needed" legitimises the problem at the security research level. Their framing and findings are worth reading as outside validation.

## What They Don't Cover

Content trust provenance classification. Their quarantine trigger is threat detection — a response is quarantined because it looks dangerous, not because of where it came from. A response from a publicly-writable external source with no detected injection pattern passes through unexamined. No Spotlighting, no per-endpoint registry.
