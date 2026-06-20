# Path to MCP Protocol Standardisation

## The Goal

Get trust provenance metadata added to the MCP protocol spec natively — so every MCP server, proxy, and agent harness handles it by default without requiring our proxy.

## Why a Working Implementation Comes First

A reference implementation with real users is a stronger argument for a protocol change than any RFC written in isolation. This is how standards get made:

- SPDY (Google's working HTTP implementation) became HTTP/2
- OAuth came from working implementations at Twitter and Flickr
- MCP itself followed this path — Anthropic built it and drove adoption before it became a standard

These are survivors. Many implementation-first projects failed to become standards. What the successful cases share: a concrete problem with no existing solution, vendor backing with genuine adoption incentive, and a neutral governance body willing to take the spec. Writing a spec proposal without a working system invites debate about whether it is necessary or correct. A proxy with adoption makes the need undeniable and the design concrete.

## The Migration Path

**Phase 1 — Proxy with registry fallback**
Proxy protects developers today. No changes required from MCP servers or agent harnesses. Registry is community-maintained and covers the top MCP servers.

**Phase 2 — SDK adoption by MCP server authors**
Server authors adopt the SDK and self-annotate their endpoints. More accurate than the registry because they know their own data provenance. Proxy defers to native annotations when present.

**Phase 3 — Spec contribution**
Once the pattern is established and adopted across multiple popular MCP servers, submit to the MCP spec. The reference implementation produces the concrete wire format — field names, schema, encoding, versioning — that becomes the actual input to the spec proposal. The principle is straightforward:

> "MCP servers MAY include trust provenance metadata in tool responses. Clients SHOULD enforce trust policies based on this metadata. When absent, clients SHOULD apply conservative defaults (treat as untrusted-external)."

But spec language without a working implementation behind it is a principle, not a standard. The schema definition is work that comes after the proxy proves the concept in production.

**Phase 4 — Native harness enforcement**
Agent harnesses (Claude Code, Cursor, Codex) enforce trust policies at the execution layer rather than the prompt layer. This moves enforcement below the model — the only path to near-zero exploitation rate. Our proxy becomes a thin pass-through or is no longer needed.

## What Makes the Spec Contribution Credible

- Real adoption data showing exploitation rate reduction
- A working registry demonstrating the classification is practical at scale
- SDK adoption by at least a few major MCP servers demonstrating server-side feasibility
- Clear, implementable spec language derived from the working system
