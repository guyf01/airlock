# Market Landscape: Existing Solutions

## The Critical Architectural Distinction

Solutions fall into two categories based on where they intercept:

- **MCP tool response layer** — intercepts content before it enters the agent's context window. This is the correct layer.
- **LLM API boundary** — intercepts prompts and completions after tool content has already entered context. Too late.

---

## Solutions at the Correct Layer (MCP Tool Response)

### Bifrost (getmaxim.ai)
- Open-source, Go-based MCP gateway
- Sits between agent and MCP servers
- Dual-stage guardrails: fires at both ingress and egress
- Blocks known injection patterns (hardcoded strings, hidden Unicode, "ignore previous instructions")
- Supports MCP tool allowlists per virtual key
- **Gap:** Pattern matching only. Does not semantically classify which tool endpoints return user-controlled content vs operator-controlled content. A novel payload that doesn't match known patterns passes through undetected.

### lasso-security/mcp-gateway (GitHub)
- Plugin-based proxy wrapping other MCP servers
- Sanitises requests and responses, masks sensitive tokens
- Lighter than Bifrost
- **Gap:** Same as Bifrost — no semantic trust classification.

### revsmoke/promptrejectormcp (GitHub)
- MCP server that classifies tool output for injection patterns
- Detects imperative language, "ignore previous", hidden Unicode
- **Fundamental flaw:** Agent-side — the agent must be configured to call it. A hijacked agent will not call its own security check.

---

## Solutions at the Wrong Layer (LLM API Boundary)

### Portkey, LiteLLM, Helicone
- Intercept at the LLM API level (prompts and completions)
- MCP tool content has already entered the context by the time they see it
- Useful for observability and rate limiting, not for preventing MCP injection

### Straiker Defend AI
- Runtime monitoring with semantic detection
- Post-execution anomaly detection
- Catches data exfiltration after the fact
- Does not prevent agent from being instructed by injected content

### Obsidian Security, Oktsec
- Governance and access control focused
- Post-execution monitoring
- Enterprise SaaS, not developer tooling

---

## Research (Not Deployed)

### NeuroTaint (arXiv 2026)
- First taint tracking framework for LLM agents
- Tracks semantic propagation of untrusted data through reasoning chains
- **Not real-time:** works offline on execution traces after the fact
- Not open-sourced or deployed anywhere

---

## The Gap Nobody Has Filled

No production system:
1. Classifies MCP tool responses by data provenance (operator-controlled vs user/externally-submitted) at the endpoint level
2. Communicates that classification to agents in a structured, protocol-level way
3. Does this in real-time, before content enters the agent's context window
