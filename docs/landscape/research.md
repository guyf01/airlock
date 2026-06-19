# Relevant Research

## Microsoft Spotlighting

**Paper:** "Defending Against Indirect Prompt Injection Attacks with Spotlighting"

**Technique:** Structurally marks untrusted data in prompts using delimiters, encoding (e.g. base64), or special tokens so the model can distinguish data from instructions at a structural level — not just from natural language instruction.

**Result:** Reduces indirect prompt injection success rate from **>50% to <2%**.

**Current limitation:** Applied at prompt construction time for untrusted text in the input. Not applied to MCP tool responses. Does not classify *which* data is untrusted — only marks that it came from an external source.

**Relevance:** Demonstrates that structural marking of untrusted content is highly effective. The technique is directly applicable to MCP tool responses if applied at the proxy layer.

---

## Google DeepMind: Defending Gemini Against Indirect Prompt Injections

**Finding:** Adversarial training improves robustness against prompt injection.

**Approach:** Instruction hierarchy (system prompt > user turn > tool output). Model is trained to follow higher-priority instructions over lower-priority ones.

**Limitation:** Still a model-level defence — does not classify data provenance within tool responses. Injection success can still occur with sufficiently crafted payloads.

---

## NeuroTaint (arXiv 2026)

**Paper:** "Ghost in the Agent: Redefining Information Flow Tracking for LLM Agents"

**Technique:** Semantic taint tracking — follows untrusted data as it propagates through an agent's reasoning chain to its actions.

**Limitation:** Offline analysis of execution traces. Not real-time. Not deployed or open-sourced.

**Relevance:** Confirms that taint tracking is the correct CS framing for this problem. The unsolved version of this in real-time is the gap we are building toward.

---

## Key Empirical Finding

System prompt instructions alone do not prevent exploitation. The 85% exploitation rate across Claude Code, Cursor, and Codex was measured in controlled testing where agents were explicitly instructed to ignore untrusted data. Natural language instruction is insufficient — structural separation is required (Spotlighting finding).
