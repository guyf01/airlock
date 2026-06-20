# Agentjacking: The Vulnerability

## What It Is

Agentjacking is an attack class that hijacks AI coding agents into executing attacker-controlled code by injecting malicious instructions into external data sources the agent reads. MCP is the dominant delivery mechanism for coding agents, as it is the primary way coding agents connect to external tools.

## Threat Model

**Attacker:** Anyone who can write to a data source the target's agent reads. No access to the developer's systems, credentials, or network is required. No exploitation of a software vulnerability is required.

**Capability required:** Write access to one external source — a public issue tracker, an error monitoring platform, a shared log, a database accepting user input. Many such sources accept writes from unauthenticated parties by design.

**Target:** Any developer running an AI coding agent connected to external tools via MCP.

**Goal:** Cause the agent to execute attacker-chosen operations with the developer's full environment access — exfiltrating credentials, modifying code, installing packages, or interacting with external services.

## The General Attack Pattern

1. **Identify an injection point** — Find an external data source the target's agent reads via MCP that accepts writes from untrusted parties (publicly writable APIs, issue trackers, error monitoring, log aggregators).
2. **Inject a payload** — Write crafted content to that source, designed to appear as legitimate data while embedding instructions directed at the agent.
3. **Wait for the trigger** — The developer asks their agent to perform a routine task that causes it to read from the compromised source.
4. **Exploitation** — The agent reads the injected content and, despite receiving it through a delineated tool response block, has no enforcement mechanism preventing it from acting on instructions embedded within it.
5. **Impact** — The agent executes attacker-controlled code with the developer's full environment access, potentially exfiltrating credentials, secrets, and source code.

## Why This Attack Class Is Effective

- The agent's tool responses come from sources developers consider part of their trusted workflow
- The attack requires no breach of the developer's systems — only write access to a source the agent reads
- Traditional security controls (WAF, EDR, IAM, firewalls) see authorised actions taken by a legitimate tool; they lack the signal to attribute those actions to injected instructions at the point of content ingestion, where the attack actually occurs
- The attack succeeds through normal operation, not exploitation of a software bug

## Delivery Mechanisms

Any MCP tool that returns content from a source accepting untrusted writes is a potential vector:

- Error monitoring platforms (writable by application code that processes user input — the injection travels through the application, not directly to the platform)
- GitHub issues, PR descriptions, commit messages
- Linear / Jira tickets
- Slack messages in monitored channels
- Log files with user-controlled entries
- Database records containing user input
- Any web page the agent browses

The lowest-friction vectors are those where writing is unauthenticated or trivially authenticated by design.

## Known Real-World Disclosures

See `docs/disclosures/` for documented instances of this attack class demonstrated against specific platforms.
