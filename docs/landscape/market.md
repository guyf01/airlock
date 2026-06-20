# Market Landscape: Existing Solutions

## Where Solutions Intercept

Solutions fall into three categories based on where they sit in the agent's execution flow:

- **MCP tool response layer** — intercepts content before it enters the agent's context window
- **LLM API boundary** — intercepts prompts and completions after tool content has already entered context
- **Post-execution** — monitors or audits after the agent has acted

---

## MCP Tool Response Layer

### Bifrost (getmaxim.ai)
Open-source, Go-based MCP gateway. Sits between the agent and MCP servers. Fires guardrails at both ingress and egress. Blocks known injection patterns (hardcoded strings, hidden Unicode, imperative phrases like "ignore previous instructions"). Supports MCP tool allowlists per virtual key. ([GitHub](https://github.com/maximai/bifrost))

### lasso-security/mcp-gateway (GitHub)
Plugin-based proxy wrapping other MCP servers. Sanitises requests and responses, masks sensitive tokens. ([GitHub](https://github.com/lasso-security/mcp-gateway))

### revsmoke/promptrejectormcp (GitHub)
An MCP server the agent calls to classify tool output for injection patterns. Detects imperative language, "ignore previous", hidden Unicode. Fatal design flaw: the agent must be configured to call it — a compromised agent will not call its own injection checker. This design cannot defend against the attack class it targets.

---

## LLM API Boundary

### Portkey, LiteLLM, Helicone
Intercept at the LLM API level — prompts sent to the model and completions returned. Tool response content has already entered the context by the time they see it. LiteLLM is an open-source routing and cost-management proxy; Portkey adds semantic guardrails and observability; Helicone focuses on logging and analytics. All are primarily useful for observability, rate limiting, and cost management — not injection prevention.

---

## Post-Execution Monitoring

### Straiker Defend AI
Runtime monitoring with semantic detection. Detects data exfiltration attempts (PII, secrets, source code) after actions occur. Does not intercept at the tool response layer.

### Obsidian Security
Governance and access control monitoring across enterprise SaaS agents. Post-execution audit focus. Not targeted at developer tooling or MCP-specific injection.

### Oktsec (oktsec.com)
Open-source AI agent runtime security. Captures tool calls, bash commands, API calls, and MCP tool executions. 268 detection rules across categories including prompt injection, data exfiltration, and credential leaks. Post-execution detection — monitors what happened, does not intercept tool responses before they enter context.

---

## Research (Not Deployed)

### NeuroTaint (arXiv 2026)
Semantic taint tracking framework for LLM agents. Tracks how untrusted data propagates through an agent's reasoning chain to its actions. Works offline on execution traces — not real-time. Not open-sourced or deployed.

---

## The Gap

This is a representative survey, not an exhaustive one. All production solutions reviewed share the same underlying limitation: none classify MCP tool responses by data provenance — distinguishing operator-controlled content from user-submitted or externally-sourced content — at the endpoint level, in real-time, before that content enters the agent's context window.

Pattern matching (Bifrost, lasso) catches known payloads but not novel ones. Post-execution monitoring (Straiker, Obsidian) detects consequences but does not prevent them. Agent-side classifiers (revsmoke) depend on the compromised party to run its own security check.
