# IBM ContextForge

**Category:** Open source — MCP gateway, IBM-backed
**Stars:** 3.3k — highest GitHub traction of any open source MCP gateway
**Source:** https://github.com/IBM/mcp-context-forge

## What It Does

Open-source AI/MCP gateway and proxy registry. Supports MCP, A2A, REST/gRPC. 40+ plugins. OpenTelemetry observability. Enterprise SSO integration. OpenAPI support.

## What to Learn From Them

**3.3k stars is signal worth understanding.** This is the most-adopted open source MCP gateway. Something about their design, documentation, or feature set is driving real developer adoption. Before building Airlock's proxy layer, understanding what ContextForge got right — and what developers keep coming back for — is directly relevant to adoption strategy.

**Plugin architecture at 40+ plugins** is a concrete answer to the proxy extensibility problem. Airlock needs to decide how to handle extensibility: hardcoded behaviours, a plugin interface, or something else. IBM chose plugins and it scaled. Their plugin interface design is worth studying.

**They've already solved enterprise SSO and OpenTelemetry integration.** Airlock's Phase 2 enterprise features include audit logging and central policy management — both of which land in the same technical space. ContextForge's OTel implementation for MCP traffic and their SSO integration patterns are reference implementations, not reinvention targets.

**The "proxy registry" concept** — they name it a registry, meaning a managed set of MCP servers behind a central proxy point. That's structurally analogous to Airlock's registry concept, even though the content of their registry (which servers are available) differs from ours (what trust level each endpoint carries). Their design decisions around registration, discovery, and routing are relevant.

## What They Don't Cover

Trust provenance classification. ContextForge is general-purpose proxy infrastructure — no content trust model, no Spotlighting, no per-endpoint trust registry. They are the plumbing layer; Airlock's classification logic sits above it.
