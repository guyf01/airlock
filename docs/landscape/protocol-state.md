# MCP Protocol: Current State

**Spec version referenced:** 2025-11-25 — https://modelcontextprotocol.io/specification/2025-11-25/

## What MCP Has Today

- JSON-RPC 2.0 message format with stateful connections
- Server and client capability negotiation
- Tool definitions with schemas
- Prompts (reusable prompt templates servers expose for clients to incorporate into requests)
- Resources (data blobs — files, database records, live data — servers expose for clients to read)
- Resources and sampling primitives
- Authorization via OAuth 2.0 / OpenID Connect alignment
- Progress tracking, cancellation, error reporting, logging

## What MCP Does Not Have

**No trust or provenance metadata for tool responses.**

There is no field in any MCP response that carries:
- Where the data inside the response originated
- Whether the content is operator-controlled or user/externally-submitted
- Any trust classification at the data-item level

The spec states:

> "MCP itself cannot enforce these security principles at the protocol level."

This could be read as standard protocol design philosophy — enforcement belongs at the implementation layer, not the transport. The problem is that the implementation layer has nothing to enforce against. MCP carries no trust or provenance metadata in tool responses, so there is no structured signal for a harness to act on even if it wanted to. Delegating enforcement to implementors is only sound when the protocol gives implementors the information they need. Here it does not: the delegation and the missing primitive are the same gap.

## Anthropic's Trust Hierarchy

Anthropic's documentation describes an implicit trust hierarchy across Claude's context. Operator instructions (system prompt) carry the highest trust, user messages carry medium trust, and tool results — including MCP responses — are treated with the most skepticism as potentially untrusted external data. This hierarchy is described across Anthropic's agentic security guidance but is not formally specified in a single canonical document.

Critically, this hierarchy stops at the message boundary. It does not extend into the content of tool responses. All content within a tool response is treated equally by the protocol, regardless of whether it came from the operator's own system or an externally-submitted payload.

## Relevant IETF Drafts (Proposed, Not Deployed)

- `draft-tonyai-a2a-trust-00` — Agent-to-agent identity and authorisation. Covers agent identity, not data item provenance.
- `draft-kamimura-vap-framework` — Verifiable AI Provenance. Covers decision-level audit trails, not data content classification.
- `draft-sharif-agent-audit-trail-00` — Standard logging format for autonomous AI. Audit, not prevention.

None of these address trust classification of individual data items within tool responses. All are proposals without deployed implementations.
