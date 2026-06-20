# Known Disclosure: Tenet Security — Agentjacking via Sentry

**Source:** https://tenetsecurity.ai/blog/agentjacking-coding-agents-with-fake-sentry-errors/
**Published:** April 2025 (Tenet Security blog)
**Status:** Public disclosure. All claims are sourced from Tenet Security's disclosure and have not been independently replicated or verified.

---

## What They Reported

Tenet Security demonstrated a concrete instance of the agentjacking attack class using Sentry as the injection vector.

### The Attack They Demonstrated

1. Locate a target's Sentry DSN via client-side JS, GitHub, or Censys search
2. POST a crafted event to Sentry's public ingest endpoint using only the DSN — no authentication required
3. Embed markdown-formatted instructions in the event payload designed to look like legitimate error context
4. When the developer asks their AI coding agent to fix Sentry errors, the agent reads the injected event and executes the embedded instructions
5. The executed payload exfiltrates environment variables, AWS keys, GitHub tokens, and git credentials

### Figures They Reported

- **85%** exploitation success rate across Claude Code, Cursor, and Codex in their controlled testing
- **2,388** organizations with publicly exposed Sentry DSNs identified at time of disclosure
- Exploitation succeeded even when agents were explicitly instructed via system prompt to ignore untrusted data

### Sentry's Response

Sentry declined to fix the vulnerability at the source, describing it as "technically not defensible" at their layer.

---

## How This Relates to the Broader Problem

The Sentry DSN is one specific delivery mechanism for the agentjacking attack class. It is notable because DSNs are necessarily embedded in client-side JS and therefore publicly exposed, require only the DSN itself as a write token — making the authentication barrier effectively zero once the DSN is known — and are consumed through a routine developer workflow (asking an agent to fix errors). It is not the only delivery mechanism — see `problem/attack.md` for the general attack class.
