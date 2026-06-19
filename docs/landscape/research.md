# Relevant Research

## Microsoft Spotlighting

**Paper:** "Defending Against Indirect Prompt Injection Attacks with Spotlighting"

**Technique:** Structurally marks untrusted data in prompts using delimiters, encoding (e.g. base64), or special tokens so the model can distinguish data from instructions at a structural level — not just from natural language instruction.

**Result:** Significantly reduces indirect prompt injection success rates compared to unprotected baselines, per the paper's reported figures.

**What it actually does:** Spotlighting marks content as coming from an external source — this is itself a trust classification. What it does not do is carry fine-grained provenance: which server, which endpoint, which specific data items within a response. It treats all external content as a single category.

**Current limitation:** Applied at prompt construction time for untrusted text in the input. Not designed for MCP tool responses specifically. Does not classify *which* data is untrusted — only marks that it came from an external source.

**Relevance:** Demonstrates that structural marking of untrusted content is more effective than natural language instruction alone. The core technique is potentially applicable to MCP tool responses.

---

## Google DeepMind: Defending Gemini Against Indirect Prompt Injections

**Finding:** Adversarial training improves robustness against prompt injection.

**Approach:** Instruction hierarchy (system prompt > user turn > tool output). Model is trained to follow higher-priority instructions over lower-priority ones.

**Limitation:** Model-level defense — does not classify data provenance within tool responses. Does not prevent injection from succeeding against a sufficiently crafted payload targeting the model's instruction-following behavior.

---

## NeuroTaint (arXiv 2026)

**Paper:** "Ghost in the Agent: Redefining Information Flow Tracking for LLM Agents"

**Technique:** Semantic taint tracking — follows untrusted data as it propagates through an agent's reasoning chain to its actions.

**Limitation:** Offline analysis of execution traces. Not real-time. Not deployed or open-sourced.

**Relevance:** Proposes taint tracking as a framing for this problem class. The real-time equivalent of what NeuroTaint does offline is the unsolved version of the enforcement problem.
