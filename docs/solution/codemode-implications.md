# Code Mode: Implications and How Our Solution Adapts

## The Challenge

This project's solution is built on per-endpoint trust classification: each named MCP tool call is classified by trust level and the proxy applies policy based on which tool was called.

Code mode removes the named tools. There is only `execute()`. The proxy sees one tool call regardless of which underlying API functions the generated code touches inside the isolate. Per-endpoint classification, applied naively, breaks.

**But the fundamental unit of trust does not change.** It is still the function call — the question of whether a specific function returns user-controlled content. In code mode those function calls happen inside an isolate rather than as named MCP tool invocations. The abstraction holds; the implementation point moves inward.

---

## How the Attack Surface Shifts

The injection attack does not disappear under code mode — its location moves.

Under traditional MCP:
```
Agent calls named tool → tool response contains injected instructions → agent acts on them
```

Under code mode:
```
Agent calls execute() → code runs inside isolate, calls external API → output returned to agent → injected instructions in output → agent generates next code snippet based on them
```

The V8 isolate prevents generated *code* from escaping its sandbox. It does not prevent the *output* of that code from containing injected instructions that influence the model's next decision. The sandbox is a code execution boundary, not a content trust boundary. Content retrieved inside an isolate is still authored by whoever controls the upstream data source.

---

## How Our Solution Adapts

Code mode's two-tool interface (`search()` and `execute()`) maps onto our architecture at two interception points.

### Interception Point 1: search()

When the model calls `search()` to discover available functions, trust levels are attached to the results. There are two paths:

**Native path (server supports the SDK):**
The server enriches its own `search()` results directly — it knows its own functions and their data provenance better than any external registry. Trust levels are returned alongside function signatures.

**Registry fallback (no server support):**
The proxy intercepts the `search()` response and enriches it from the registry, keyed by function name rather than MCP tool name. Same mechanism as traditional MCP, different key structure.

Either way, by the time the model writes its `execute()` code, it has seen trust levels for the functions it discovered.

```
search("get error events")
→ [native or proxy] enriches: getErrorEvents: untrusted-external, getDSN: trusted
→ model sees trust levels when writing its code
```

### Interception Point 2: execute()

The proxy does not need isolate instrumentation to classify `execute()` output. It already has the trust state from the preceding `search()` call.

The proxy tracks which functions were returned in `search()` results and their trust levels. When `execute()` returns, it applies the most conservative trust level from the functions the model had available — without parsing the generated code or requiring server-side instrumentation.

```
search() → proxy records: {getErrorEvents: untrusted-external, getDSN: trusted}
execute(generated code)
→ proxy derives: most conservative trust = untrusted-external
→ applies Spotlighting markers to execute() output
→ model receives trust-annotated output
```

This works entirely at the proxy layer. The server does not need to instrument its isolate or track internal calls.

---

## Registry Structure

The registry extends naturally. Instead of `server.tool_name → trust_level`, code mode entries classify at the function name level:

```yaml
cloudflare_code_mode:
  getZone: trusted              # operator's own config
  listWorkers: trusted          # operator's own resources
  getAnalytics: trusted         # operator's own metrics
  getLogs: context-dependent    # may contain user-controlled request data
```

Same governance model, same asymmetric burden, same conservative default for unknown entries.

---

## Degradation Table

| Server support | search() enrichment | execute() trust derivation |
|---|---|---|
| SDK adopted | Server enriches natively | Proxy derives from search state (or server can annotate directly) |
| No SDK, registry coverage | Proxy enriches from registry | Proxy derives from search state — most conservative function trust wins |
| No SDK, no registry | No per-function trust data | Proxy defaults all execute() output to untrusted-external |

---

## The Remaining Hard Problem: Mixed-Trust Outputs

A single `execute()` call may internally invoke both trusted and untrusted functions. The output is one blob. With native annotation the server declares the aggregate trust level (most conservative wins) and the proxy marks the whole output accordingly. This loses inline granularity — the model cannot distinguish which parts of the output originated from untrusted calls.

Full inline granularity would require the server to structure its execute output so untrusted portions are separately delimited. This is architecturally possible but imposes significant constraints on what generated code can return. It is the right direction for a future version of the SDK, not a day-one requirement.

---

## Current State

Code mode is in closed beta as of early 2026, specific to the Cloudflare API. The MCP ecosystem is built around named per-endpoint tools. Every server this project currently addresses uses the traditional model.

Code mode adoption is worth watching:
- Whether Cloudflare open-sources the server pattern for others to implement
- Whether major MCP servers adopt it to handle large API surfaces
- Whether the MCP spec adds an `execute()` convention, signalling protocol-level adoption

If adoption accelerates, the adaptation described above is the path forward — not a redesign.
