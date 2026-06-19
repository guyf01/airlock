# Agentjacking: The Vulnerability

## What It Is

Agentjacking is an attack class that hijacks AI coding agents into executing attacker-controlled code by injecting malicious instructions into external data sources the agent reads. MCP is the most common delivery mechanism, as it is the primary way coding agents connect to external tools.

## The General Attack Pattern

1. **Identify an injection point** — Find an external data source the target's agent reads via MCP that accepts writes from untrusted parties (publicly writable APIs, issue trackers, error monitoring, log aggregators).
2. **Inject a payload** — Write crafted content to that source, designed to appear as legitimate data while embedding instructions directed at the agent.
3. **Wait for the trigger** — The developer asks their agent to perform a routine task that causes it to read from the compromised source.
4. **Exploitation** — The agent reads the injected content and, despite knowing it came from a tool response, has no enforcement mechanism preventing it from acting on instructions embedded within it.
5. **Impact** — The agent executes attacker-controlled code with the developer's full environment access, potentially exfiltrating credentials, secrets, and source code.

## Why This Attack Class Is Effective

- The agent's tool responses come from sources developers consider part of their trusted workflow
- The attack requires no breach of the developer's systems — only write access to a source the agent reads
- Traditional security controls (WAF, EDR, IAM, firewalls) see only authorised actions taken by a legitimate tool; they cannot detect that those actions originated from injected instructions
- The attack succeeds through normal operation, not exploitation of a software bug

## Delivery Mechanisms

Any MCP tool that returns content from a source accepting untrusted writes is a potential vector:

- Error monitoring platforms (publicly writable via design)
- GitHub issues, PR descriptions, commit messages
- Linear / Jira tickets
- Slack messages in monitored channels
- Log files with user-controlled entries
- Database records containing user input
- Any web page the agent browses

The lowest-friction vectors are those where writing is unauthenticated or trivially authenticated by design.

## Known Real-World Disclosures

See `docs/disclosures/` for documented instances of this attack class demonstrated against specific platforms.
