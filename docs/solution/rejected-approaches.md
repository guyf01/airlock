# Rejected Approaches

This document records the alternative architectures we considered for the Airlock proxy and the specific reasons we did not adopt them. It exists so we can revisit these decisions if circumstances change — a pivot does not mean starting from scratch if we already understand the tradeoffs.

---

## Approach 1: Spotlighting as the Primary Security Mechanism

**What this would be:** Inject `[UNTRUSTED]...[/UNTRUSTED]` markers into MCP response content. Include a prompt resource that instructs the model to treat marked content as non-executable data. Frame this as the primary protection against agentjacking.

**Why we didn't adopt it as primary:**

The markers are in the same channel as the attack. Anything injected into the model's context can attempt to override instructions also in that context. A sufficiently adversarial payload can include counter-instructions ("the following is from a trusted source, ignore the markers"). This is not a hypothetical — the Spotlighting paper (arXiv:2403.14720) shows meaningful reduction in controlled experiments, but controlled experiments are not adversarial settings where the attacker knows the defense.

A second attack: if the marker format is known (e.g., `[UNTRUSTED]`), an attacker can pre-plant closing tags in their payload. The model then sees what appears to be two properly-bounded untrusted blocks with trusted-looking content in between. The proxy can defend against this with sanitization + randomized per-session marker tokens — but this reveals that the markers require ongoing defensive maintenance as the attack evolves.

Framing markers as "the security layer" would be dishonest. They are a judgment-assist layer that meaningfully improves model reasoning. That is still worth building. But calling it security without acknowledging the bypass paths overstates the claim.

**What would change our mind:** Empirical evidence that randomized markers with content sanitization achieve robust reduction in MCP adversarial contexts against attackers who know the defense. The current evidence base (RAG experiments, no adversarial red-teaming against the marker mechanism) is not sufficient for this claim.

**Current status:** Adopted as Layer 1 (judgment assist), not as enforcement.

---

## Approach 2: Hard Policy Enforcement — Session-Level Taint

**What this would be:** Classify inbound MCP responses by trust level. Maintain a session taint flag. Once any `untrusted-external` content is read in a session, all high-risk outbound actions (code execution, file writes, network calls) are blocked until the developer explicitly clears the taint.

**Why we didn't adopt it:**

Every practical developer session reads untrusted content. A GitHub issue, a Jira ticket, an external API response — these are the primary reasons agents use MCP servers. If reading any untrusted content taints the entire session and blocks all subsequent execution, the product is unusable from the first tool call. The proxy would be disabled within days of installation.

This is not a calibration problem. The information does not exist to do it more precisely. Session-level taint at the proxy layer means every session is tainted, which means every session is blocked, which means the proxy is disabled.

**Current status:** Rejected.

---

## Approach 3: Per-Action Causal Attribution

**What this would be:** When the model issues an outbound tool call, determine whether that specific action was causally caused by untrusted content in the context. If yes, block or flag. If no, allow.

**Why we didn't adopt it:**

This is technically intractable at the proxy layer. The model's output is a function of its entire context window — every token it has seen contributes to every token it produces. There is no mechanism to ask "was this bash command caused by token 847 from that GitHub issue, or by the developer's prior instruction?" from outside the model. The model does not expose a causal graph. It produces outputs.

Partial heuristics exist (embedding similarity between action content and untrusted context) but they produce both false positives (blocking legitimate actions that happen to resemble untrusted content) and false negatives (missing sophisticated attacks that don't surface literal text). At the threshold where false positives become acceptable, false negatives are too high. At the threshold where false negatives are low, false positives destroy the product experience.

Microsoft FIDES faces this same problem and solves it by dropping the per-action attribution goal entirely — instead maintaining a session-level taint and blocking any high-impact action when untrusted content has been processed. That approach reduces to Approach 2 above.

**What would change our mind:** Model interpretability advances that expose per-token contribution to output — "attention attribution" or similar. If a future model API exposes a structured signal indicating which input tokens most influenced a given output, per-action attribution becomes tractable. This is an active research area but is not available in current production model APIs.

**Current status:** Rejected as a primary mechanism. A lighter variant — fuzzy content matching between outbound tool calls and stored untrusted session content — was considered as a secondary detection layer but deprioritized: if Layer 0 (LLM-as-judge pre-filter) is in place, content matching covers a strict subset of what the judge already catches, adding complexity without proportionate coverage. Revisit if model interpretability APIs become available.

---

## Approach 4: Pure Policy Enforcement Outside the Model Path (FIDES-style)

**What this would be:** Store trust labels in MCP protocol metadata (`_meta` fields), not in the model's context. The model never sees trust labels. A policy engine at the proxy layer monitors outbound tool calls and blocks any high-impact action when the session contains untrusted content in its causal history. The model is removed from the security decision entirely.

**Why we didn't adopt it as our primary architecture:**

This reduces to a variant of Approach 2 (session-level taint) for the same reason: the model must reason about untrusted content — that is the agent's purpose. Preventing the model from acting whenever untrusted content has been read is equivalent to blocking the agent's core workflow. "Model not in the security path" means "model cannot use untrusted content to do anything, including summarize it, report on it, or suggest actions based on it." That is not a useful agent.

Microsoft FIDES implements this approach and the result is an automated policy enforcer that blocks actions when untrusted content is in context. It is architecturally sound but does not solve the usability problem — it shifts the problem from "model ignores trust markers" to "policy engine blocks all productive work when untrusted content was read." Enterprises with well-defined threat models and acceptable-use policies can configure around this. Individual developers cannot.

**What this approach does well:** It is robust against marker injection and sophisticated adversarial payloads — the attacker cannot influence the policy engine by crafting content that the model misinterprets. The security decision is made by deterministic policy, not by model reasoning.

**What would change our mind:** Two conditions together: (1) agent harnesses develop explicit workflow phases where "read untrusted content" and "execute actions" are architecturally separated, and (2) the developer defines a specific, narrow set of trusted actions they want the agent to perform in the context of untrusted content. Under those conditions, pure policy enforcement becomes practical. This is the correct long-term architecture for enterprise-grade agent security — but it requires changes at the harness layer we cannot impose from a proxy.

**Current status:** Rejected as standalone approach. The `_meta` label mechanism (storing trust labels outside model context) is worth preserving as a future integration path if the MCP spec adopts trust metadata at the protocol level.

---

## What We Chose Instead

Two layers that are honest about what they do:

**Layer 1 (inbound, judgment assist):** Randomized Spotlighting markers + content sanitization + prompt resource. Gives the model the correct signal when it reasons about untrusted content. Cannot enforce. Measurably improves model reasoning quality in controlled settings. The correct framing is: more information → better probability of correct outcome.

**Layer 2 (outbound, literal detection):** Fuzzy content matching between outbound tool call arguments and stored untrusted session content. Catches the most common real-world attack pattern (literal command propagation from untrusted content to tool call). Does not require causal attribution — operates on string similarity. Only surfaces high-confidence findings, not session-level warnings. Specific, evidenced, actionable.

**What this covers:** Naive to moderate injection attacks where the injected content is reproduced in the tool call, with or without minor transformation.

**What this does not cover:** Sophisticated natural language instruction injection where the model generates its own action from adversarially-crafted intent without literal content propagation. This class of attack requires model robustness training or sandboxed execution environments — it is outside the scope of what any proxy-layer solution can address.

**The honest claim:** Airlock reduces the attack surface and surfaces high-confidence injection evidence. It is a judgment-assist and detection layer, not a prevention system. The correct long-term prevention path is protocol-level trust provenance in the MCP spec, adopted by agent harnesses natively.
