# Market Overview

## State of the Market (June 2026)

The MCP security market has moved from research curiosity to funded category in under 18 months. The catalyst was a wave of real incidents — 40+ CVEs filed against MCP between January and April 2026, the Sentry agentjacking disclosure confirming 85% exploitation rate across Claude Code, Cursor, and Codex, and NSA issuing formal MCP security guidance in May 2026.

The result: $3.6 billion in agentic AI security funding through RSAC 2026. Multiple acquisitions. Three major incumbents (Snyk, Palo Alto Networks, CrowdStrike) shipping MCP-specific products. Gartner Hype Cycle inclusion.

## Where Solutions Cluster

Three dominant patterns have emerged, none of which address content-level trust provenance:

**Access control** — governs which agent can call which tool. Identity-based, not content-based. (Runlayer, Keycard, Pomerium, Oasis Security)

**Threat detection** — scans MCP responses for known malicious patterns and blocks them. Binary: block or allow. Does not classify content by origin. (Pipelock, VaultMCP, Operant AI, Snyk/mcp-scan, Palo Alto Prisma AIRS, CrowdStrike Falcon AIDR)

**Audit and observability** — logs what happened. Post-hoc. Does not prevent. (Straiker, Oktsec, TrueFoundry, IBM ContextForge, Claude Code Enterprise, Cursor Enterprise)

## The Uncovered Surface

No tool in the market:
- Classifies inbound MCP response content by the trust provenance of its data source (operator-controlled vs. externally-writable)
- Injects structural trust markers into response content before the model processes it
- Surfaces developer confirmation prompts based on content trust level rather than threat detection
- Maintains a per-endpoint trust registry (tools classify at the server level, not the endpoint level)
- Reconstructs the causal chain linking "agent read source X → source was untrusted-external → agent performed action Y"

See `coverage-map.md` for the full matrix. See `competitors/` for detailed profiles.

## Acquisition Wave (Signal)

The acquisition pattern signals category maturation:
- Invariant Labs (mcp-scan creators) → Snyk (June 2025)
- Prompt Security → SentinelOne
- CalypsoAI → F5 (~$180M)
- Promptfoo → OpenAI (March 2026, ~$86M valuation)
- Astrix Security → Cisco (~$400M)

The reading: established security vendors are buying distribution into this category rather than building from scratch. The window for an independent, differentiated product is narrowing.

## Developer Sentiment

Community vocabulary is fragmented. The same attack class is called "tool poisoning," "agent hijacking," "agentjacking," "confused deputy," and "prompt injection" in different circles. Many practitioners describe it without a name: "the agent did something I didn't expect after reading [external source]."

Security researcher awareness: high. Average Cursor/Claude Code user awareness: low. The gap between incident rate and practitioner concern is large — and closing.

One notable signal from HackerNews: the developer tool that got organic traction (mcp-safe-fetch) led with 90% token reduction. Security was secondary. Developers in the coding agent workflow adopt security tooling when it also delivers a tangible performance or ergonomic win.
