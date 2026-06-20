# Coverage Map

What each tool category covers across the problem dimensions. Airlock column shows target state, not current implementation.

## The Matrix

| Problem Dimension | Funded Proxies | OSS Proxies | Incumbents | Enterprise Gateways | Static Scanners | Native (Claude/Cursor) | Airlock |
|---|---|---|---|---|---|---|---|
| MCP server access control | ✅ | ⚠️ partial | ✅ | ✅ | ❌ | ⚠️ allowlists only | ❌ not in scope |
| Outbound call inspection | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ not in scope |
| Inbound threat detection (known patterns) | ✅ | ✅ | ✅ | ⚠️ partial | ❌ | ❌ | ⚠️ not primary |
| Content trust provenance classification | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ core feature |
| Structural content marking (Spotlighting) | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ core feature |
| Per-endpoint trust registry | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ core feature |
| Developer confirmation prompts (trust-based) | ❌ | ⚠️ Pipelock only (threat-triggered) | ❌ | ⚠️ Peta (credential-focused) | ❌ | ❌ | ✅ core feature |
| Audit logging / observability | ✅ | ⚠️ partial | ✅ | ✅ | ❌ | ⚠️ metadata only | ✅ Phase 2 |
| Causal chain reconstruction | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ Phase 2 |
| Supply chain / rug-pull detection | ⚠️ | ✅ Pipelock, ToB | ✅ Snyk | ❌ | ✅ | ❌ | ❌ not in scope |
| Central enterprise policy management | ✅ Runlayer | ❌ | ✅ | ✅ | ❌ | ⚠️ limited | ✅ Phase 2 |

Legend: ✅ covered · ⚠️ partial or conditional · ❌ not covered

---

## Reading the Map

### The access control cluster (columns 1–2)
The most crowded area. Every funded startup and all three incumbents cover it. Runlayer, Pomerium, and Oasis Security have the most mature implementations with Okta/Entra integration and per-tool RBAC. This is not a defensible differentiation opportunity.

### The detection cluster (column 3)
Also crowded. Pipelock, VaultMCP, Palo Alto, CrowdStrike, and Snyk all do pattern-based threat detection on MCP responses. The quality varies — Pipelock uses 6-pass normalization for evasion resistance; most others use simpler regex heuristics. Detection is a commodity direction.

### The audit cluster (column 8)
Covered by incumbents and enterprise gateways. Cursor Enterprise explicitly does not log agent responses or generated code content — one of the few named gaps in native tooling. Claude Code Enterprise audit logs capture metadata, not what the agent did with tool-call results.

### The uncovered cluster (columns 4–7, rows 4–9)
Trust provenance classification, Spotlighting, per-endpoint registry, and trust-based developer confirmation prompts are uncovered by every tool in the market. These four rows are where Airlock operates. The causal chain (row 9) is a Phase 2 audit feature that follows from provenance classification.

---

## Why the Gap Persists

The tools that cover rows 1–3 and 8 (access control, detection, observability) are solving problems that were already well-understood from pre-MCP security: firewall rules, anomaly detection, audit logging. The mental models existed; MCP just needed implementations.

Rows 4–7 require a different model: that content arriving through an approved tool call can still be untrusted, depending on what wrote it. This is a trust model that doesn't exist in prior security tooling. It requires:
- A classification schema for data source trust (the registry)
- A mechanism for injecting that classification into the model's reasoning context (Spotlighting)
- A confirmation UX that reflects content trust level rather than action risk level

No prior security tool needed to solve any of these, which is why none of them do.
