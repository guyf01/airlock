# MCP Protocol: Current State

**Spec version referenced:** 2025-11-25 — https://modelcontextprotocol.io/specification/2025-11-25/

## What MCP Has Today

- JSON-RPC 2.0 message format with stateful connections
- Server and client capability negotiation
- Tool definitions with schemas
- Prompt resources (servers can suggest system prompt additions to clients)
- Resources and sampling primitives
- Authorization via OAuth 2.0 / OpenID Connect alignment
- Progress tracking, cancellation, error reporting, logging

## What MCP Does Not Have

**No trust or provenance metadata for tool responses.**

There is no field in any MCP response that carries:
- Where the data inside the response originated
- Whether the content is operator-controlled or user/externally-submitted
- Any trust classification at the data-item level

The spec acknowledges this gap directly:

> "MCP itself cannot enforce these security principles at the protocol level."

It delegates security enforcement to implementors via SHOULD-level guidelines, with no protocol primitive to carry the information those implementors would need.

## Anthropic's Trust Hierarchy

Anthropic's documentation describes trust levels for Claude at the message level:

| Level | Source | Trust |
|---|---|---|
| Operator | System prompt | Highest |
| User | Human turn | Medium |
| Tool results | MCP responses | Lower |

This hierarchy stops at the message boundary. It does not extend into the content of tool responses. All content within a tool response is treated equally by the protocol, regardless of whether it came from the operator's own system or an externally-submitted payload.

## Relevant IETF Drafts (Proposed, Not Deployed)

- `draft-tonyai-a2a-trust-00` — Agent-to-agent identity and authorisation. Covers agent identity, not data item provenance.
- `draft-kamimura-vap-framework` — Verifiable AI Provenance. Covers decision-level audit trails, not data content classification.
- `draft-sharif-agent-audit-trail-00` — Standard logging format for autonomous AI. Audit, not prevention.

None of these address trust classification of individual data items within tool responses. All are proposals without deployed implementations.
