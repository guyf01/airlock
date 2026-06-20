# Problem Analysis: The Current State and What Is Wrong With It

## The Core Gap

Agentic systems lack enforcement of information flow policies.

The context window preserves structural provenance — the model receives tool responses in clearly delineated blocks and knows which tool produced which result. Provenance at the response boundary is not lost.

What is absent is content-level provenance: within a single tool response, there is no structural signal distinguishing legitimate content from injected instructions. The model cannot tell which tokens were authored by the data source and which were written by an attacker. A 2,000-token error event and an 8-token injected command inside it are indistinguishable at the token level.

What is also missing is any runtime mechanism that acts on even the structural provenance that does exist. The model can identify which tool produced a response block but has no enforced policy preventing it from treating instructions embedded within that block as actionable. Knowing the source does not stop the model from following instructions found within it.

## Why No Current Layer Addresses This

**Data source layer**
Some sources accept public writes by design — that is their purpose. You cannot make the data source responsible for how agents trust its output. A platform that accepts public writes cannot be expected to prevent those writes from being read by an AI agent that has been configured to trust it.

**The LLM model itself**
Prompt-only defences are insufficient by design. Natural language instructions ("ignore untrusted data") operate in the same medium as the attack — they are tokens in the context window, just like the injected content. A sufficiently crafted payload can contradict, dilute, or override the instruction. The model has no enforcement mechanism below the token level; it has only its training (which is fixed but imperfect against adversarial inputs) and the instructions it was given at runtime — the latter operating in the same channel as the attack and subject to being contradicted or overridden by injected content.

**The agent harness (Claude Code, Cursor, Codex)**
The harness orchestrates the model — it calls the model, receives tool-call requests in return, and decides whether to execute them. This makes it the last checkpoint before any action reaches the real world, and architecturally the correct place to enforce trust policies. However no harness currently enforces trust policies based on tool response provenance. Each vendor would need to build it independently, and no standard exists within MCP that defines what trust levels mean or how they should be communicated at the tool response level. Without that, no vendor has a shared surface to enforce against.

**MCP protocol**
MCP carries no trust or provenance metadata for tool responses. There is no field in any MCP response that indicates whether the content is operator-controlled or user/externally-submitted. The 2026 MCP spec added distributed tracing and auth hardening but did not introduce tool response provenance metadata. The harness therefore has no structured signal to enforce policy on, even if it wanted to.

## Why a Fix Requires Coordinated Change

A complete fix requires changes across multiple layers simultaneously:

- MCP would need to define what trust metadata looks like
- MCP server authors would need to annotate their responses
- Agent harnesses would need to enforce policies based on those annotations
- Models may need training to reliably respect structural trust delimiters

None of these layers has addressed this yet. Whether the reason is coordination friction, security not being a commercial priority, the attack class being underappreciated, or the ecosystem simply moving faster than security can follow — we don't know. What is observable is that all four layers remain unaddressed, and any single-layer fix is insufficient without the others.

## The Analogy That Illustrates the Gap

SQL injection persisted not because nobody understood parameterised queries, but because the structural separation of data from instructions had to become a default — enforced by frameworks, ORMs, and tooling — before it actually protected anyone. Understanding the fix and having the ecosystem enforce the fix are two different things.

The same gap exists here, with one important difference: parameterised queries required change at one layer. This problem requires coordinated change across the MCP spec, MCP server authors, and agent harnesses simultaneously — a harder coordination problem.
