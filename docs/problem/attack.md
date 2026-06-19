# Agentjacking: The Vulnerability

## What It Is

Agentjacking is an attack class that hijacks AI coding agents into executing attacker-controlled code by injecting malicious instructions into external data sources the agent reads. MCP is the most common delivery mechanism, as it is the primary way coding agents connect to external tools.

## The Attack Chain

1. **Discovery** — Attacker locates the target's Sentry DSN via client-side JS, GitHub, or Censys search. No breach required.
2. **Injection** — Attacker POSTs a crafted event to Sentry's public ingest endpoint using only the DSN. No authentication required.
3. **Obfuscation** — The payload embeds markdown-formatted instructions designed to appear as legitimate error context — indistinguishable to the agent from real error data.
4. **Execution trigger** — Developer asks their AI coding agent to "fix the Sentry errors." Agent reads injected events via MCP.
5. **Exploitation** — Agent cannot distinguish injected instructions from legitimate data. Executes attacker-controlled npm package with developer's full credentials.
6. **Exfiltration** — Package probes and exfiltrates environment variables, AWS keys, GitHub tokens, git credentials.

## Why Sentry Specifically

- DSNs are **public by design** — embedded in client-side JS, that is the intended behaviour
- Writing to a DSN requires **zero authentication**
- Developers **naturally ask agents** to fix errors — the injection arrives through a trusted, routine workflow
- Sentry itself declared the issue "technically not defensible" at their layer

## Why It Generalises Beyond Sentry

The Sentry DSN is the lowest-friction delivery mechanism, but the attack class applies to any MCP tool that returns user-controlled or externally-sourced content:

- GitHub issues, PR descriptions, commit messages
- Linear / Jira tickets
- Slack messages
- Log files with user-controlled entries
- Database records containing user input
- Any web page the agent browses

The attack pattern is always: **external data source → MCP tool call → agent reads response → agent cannot distinguish data from instructions → agent executes attacker intent.**

## Known Statistics

- **85%** exploitation success rate across Claude Code, Cursor, and Codex in controlled testing
- **2,388** organisations with exploitable Sentry DSNs identified at time of disclosure
- Exploitation succeeds even when agents are explicitly instructed via system prompt to ignore untrusted data
