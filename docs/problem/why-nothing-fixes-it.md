# Problem Analysis: The Current State and What Is Wrong With It

## The Core Gap

Agentic systems lack enforcement of information flow policies.

The context window preserves structural provenance — the model receives tool responses in clearly delineated blocks and knows which tool produced which result (e.g. `sentry.get_issue_events`). Provenance is not lost.

What is missing is any runtime mechanism that *acts on* that provenance. The model can distinguish where data came from but has no enforced policy preventing it from treating instructions embedded within untrusted content as actionable. Knowing the source does not stop the model from following instructions found within it.

## Why No Current Layer Addresses This

**Data source (Sentry, GitHub, etc.)**
Some sources accept public writes by design — that is their purpose. You cannot make the data source responsible for how agents trust its output. A platform that accepts public writes cannot be expected to prevent those writes from being read by an AI agent that has been configured to trust it.

**The LLM model itself**
Prompt-only defences are insufficient by design. Natural language instructions ("ignore untrusted data") operate in the same medium as the attack — they are tokens in the context window, just like the injected content. A sufficiently crafted payload can contradict, dilute, or override the instruction. The model has no enforcement mechanism below the token level; it has only its training and the instructions it was given, both of which can be manipulated through the same channel being attacked.

**The agent harness (Claude Code, Cursor, Codex)**
The harness sits at the execution layer, below the model, and is architecturally the correct place to enforce trust policies — it decides which tool calls actually execute. However no harness currently does this. Each vendor would need to build it independently, and no standard exists that defines what trust levels mean or how they should be communicated. Without a shared standard, no vendor has a surface to enforce against.

**MCP protocol**
MCP carries no trust or provenance metadata for tool responses. There is no field in any MCP response that indicates whether the content is operator-controlled or user/externally-submitted. The 2026 MCP spec added distributed tracing and auth hardening but explicitly did not address tool response provenance. The harness therefore has no structured signal to enforce policy on, even if it wanted to.

## Why This Is Structurally Hard

The difficulty is not identifying the problem — it is that fixing it requires coordination across multiple parties simultaneously:

- MCP would need to define what trust metadata looks like
- MCP server authors would need to annotate their responses
- Agent harnesses would need to enforce policies based on those annotations
- The model may need training changes to respect structural trust delimiters reliably

None of these parties have moved because none of the others have moved first. The problem is in the gap between them.

## The Analogy That Illustrates the Gap

SQL injection persisted not because nobody understood parameterised queries, but because the structural separation of data from instructions had to become a default — enforced by frameworks, ORMs, and tooling — before it actually protected anyone. Understanding the fix and having the ecosystem enforce the fix are two different things.

The same gap exists here. The correct fix is understood. The enforcement infrastructure does not exist yet.
