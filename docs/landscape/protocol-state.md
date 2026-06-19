# MCP Protocol: Current State

## What MCP Has Today (2026 Spec)

- Distributed tracing via W3C Trace Context
- Authorization hardening
- Tool definitions with schemas
- Prompt resources (servers can suggest system prompt additions to clients)
- Sampling / LLM interaction primitives

## What MCP Explicitly Does Not Have

**No trust or provenance metadata for tool responses.**

There is no field in any MCP response that carries:
- Where the data inside the response originated
- Whether the content is operator-controlled or user/externally-submitted
- Any trust classification at the data-item level

The MCP 2026 spec release candidate explicitly does not address tool response provenance.

## Anthropic's Trust Hierarchy

Anthropic defines trust levels for Claude at the message level:

| Level | Source | Trust |
|---|---|---|
| Operator | System prompt | Highest |
| User | Human turn | Medium |
| Tool results | MCP responses | Lower |

**This hierarchy stops at the message boundary.** It does not extend into the content of tool responses. All content within a tool response is treated equally, regardless of whether it came from the operator's own system or an attacker who posted to a public endpoint.

## Relevant IETF Drafts (Proposed, Not Deployed)

- `draft-tonyai-a2a-trust-00` — Agent-to-agent identity and authorisation. Covers agent identity, not data item provenance.
- `draft-kamimura-vap-framework` — Verifiable AI Provenance. Covers decision-level audit trails, not data content classification.
- `draft-sharif-agent-audit-trail-00` — Standard logging format for autonomous AI. Audit, not prevention.

None of these address trust classification of individual data items within tool responses.
