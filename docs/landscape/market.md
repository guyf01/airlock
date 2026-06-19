# Market Landscape: Existing Solutions

## Where Solutions Intercept

Solutions fall into two categories based on where they sit in the agent's execution flow:

- **MCP tool response layer** — intercepts content before it enters the agent's context window
- **LLM API boundary** — intercepts prompts and completions after tool content has already entered context
- **Post-execution** — monitors or audits after the agent has acted

---

## MCP Tool Response Layer

### Bifrost (getmaxim.ai)
Open-source, Go-based MCP gateway. Sits between the agent and MCP servers. Fires guardrails at both ingress and egress. Blocks known injection patterns (hardcoded strings, hidden Unicode, imperative phrases like "ignore previous instructions"). Supports MCP tool allowlists per virtual key.

### lasso-security/mcp-gateway (GitHub)
Plugin-based proxy wrapping other MCP servers. Sanitises requests and responses, masks sensitive tokens. Lighter feature set than Bifrost.

### revsmoke/promptrejectormcp (GitHub)
An MCP server the agent calls to classify tool output for injection patterns. Detects imperative language, "ignore previous", hidden Unicode. Notable limitation: the agent must be configured to call it — it is agent-side, not proxy-side.

---

## LLM API Boundary

### Portkey, LiteLLM, Helicone
Intercept at the LLM API level — prompts sent to the model and completions returned. Tool response content has already entered the context by the time they see it. Primarily useful for observability, rate limiting, and cost management.

---

## Post-Execution Monitoring

### Straiker Defend AI
Runtime monitoring with semantic detection. Detects data exfiltration attempts (PII, secrets, source code) after actions occur. Does not intercept at the tool response layer.

### Obsidian Security, Oktsec
Governance and access control monitoring across enterprise SaaS agents. Post-execution audit focus. Not targeted at developer tooling or MCP-specific injection.

---

## Research (Not Deployed)

### NeuroTaint (arXiv 2026)
Semantic taint tracking framework for LLM agents. Tracks how untrusted data propagates through an agent's reasoning chain to its actions. Works offline on execution traces — not real-time. Not open-sourced or deployed.

---

## The Gap

All production solutions share the same underlying limitation: none classify MCP tool responses by data provenance — distinguishing operator-controlled content from user-submitted or externally-sourced content — at the endpoint level, in real-time, before that content enters the agent's context window.

Pattern matching (Bifrost, lasso) catches known payloads but not novel ones. Post-execution monitoring (Straiker, Obsidian) detects consequences but does not prevent them. Agent-side classifiers (revsmoke) depend on the compromised party to run its own security check.
