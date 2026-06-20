# Cloudflare Code Mode

## What It Is

Code mode is an MCP server design pattern introduced by Cloudflare that solves a token scaling problem. Large APIs can have thousands of endpoints. A traditional MCP server exposes each endpoint as a named tool — the Cloudflare API has 2,500+ endpoints, which would consume ~1.17 million tokens just in tool definitions, exceeding most models' context windows entirely. (Figures from Cloudflare's code mode announcement: https://blog.cloudflare.com/code-mode-mcp/)

Code mode's solution: collapse the entire API surface to two tools.

## The Two Tools

- **`search(query)`** — the model discovers which API functions exist and what their parameters look like, at runtime, rather than loading all definitions upfront
- **`execute(code)`** — the model submits a JavaScript snippet; it runs inside a secure V8 isolate and returns only the final output

The model's workflow:
1. Call `search()` to find the relevant API functions for the task
2. Write a JavaScript snippet that chains those functions together
3. Call `execute()` with that snippet
4. Receive the result; make next decisions from it

## What Runs the Code

The JavaScript runs inside a **V8 isolate** — the same sandboxing technology behind Chrome's JS engine. Isolates start in milliseconds, use a few megabytes of memory, have no file system access, no environment variable exposure, and outbound requests go through explicit handlers. The code runs in a Dynamic Worker. It does not execute on the developer's machine or in the agent's process.

## What It Is Built On

Code mode is an MCP server — `execute()` and `search()` are standard MCP tool calls. The transport, session management, and tool invocation protocol are all MCP. Code mode changes the architecture of what sits behind those tool calls, not the protocol layer itself.

```
Agent (Claude Code, Cursor, etc.)
  ↕ MCP (tool calls: search, execute)
Cloudflare Code Mode MCP Server
  └─ V8 isolate (Dynamic Worker)
       └─ Generated JS → Cloudflare API
```

## Current State (2026)

- Closed beta as of early 2026 (per https://blog.cloudflare.com/code-mode-mcp/)
- Currently deployed only for the Cloudflare API
- Not yet a general-purpose pattern adopted by other MCP server authors
- The architectural pattern is public; others could implement a structurally similar approach using equivalent sandboxing infrastructure

## Why It Matters

For large APIs, code mode is architecturally superior to per-tool MCP servers on the token dimension. Whether it becomes the dominant pattern for MCP servers industry-wide — replacing named per-endpoint tools — is an open question with real implications for any system that relies on per-endpoint tool classification.

See `docs/solution/codemode-implications.md` for what this means for this project.
