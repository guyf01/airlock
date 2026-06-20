# Positioning Assessment

## The Precise Claim

No generally-available production tool does all four of:
1. Classify inbound MCP response content by data source trustworthiness (operator-controlled vs. externally-writable)
2. Inject Spotlighting-style structural markers into that content before the model processes it
3. Maintain a per-endpoint trust registry covering MCP servers broadly
4. Surface developer confirmation prompts triggered by content trust level, not threat detection

This is a narrower claim than "nobody sees this problem." Microsoft Research sees it — FIDES shares Airlock's exact mental model and is partially deployed in GitHub Copilot CLI behind a feature flag. StackOne ships the injection mechanism. The gap is specifically: **nobody has shipped this as a generally-available, production-grade product.** Every reason below is a reason the gap persists at the productization layer, not a reason the idea is invisible.

---

## Reason 1: The security community and the NLP community don't read each other's papers

**Why the gap exists:** The academic basis for content marking (Spotlighting, arXiv:2403.14720) came from the RAG research community. Security practitioners are not reading NLP papers. The people who understand prompt injection mitigation and the people who understand structural content marking are in different research communities. FIDES bridged this — which is why Microsoft Research, not a security startup, is the closest existing implementation.

**Opportunity:** Airlock is positioned at the intersection. The insight is not widely held in the practitioner security market. The window between "Microsoft Research paper" and "enterprise product teams productizing this" is where Airlock can move.

**Failure mode:** The gap is closing. Microsoft FIDES is already behind a Copilot CLI feature flag. Snyk acquired the Invariant Labs research team. Once either of them makes the same cross-community connection — or simply extends their existing gateway with Spotlighting — the practitioner window closes.

---

## Reason 2: Threat detection is the obvious first step, and it works well enough for now

**Why the gap exists:** Pattern matching is what security people reach for first. It catches known attacks. The residual risk — novel attacks, sophisticated adversaries who avoid known patterns, context-manipulation that looks like legitimate data — is not yet costing enterprises enough pain to force a second-order solution. The market is still in "stop the obvious attacks" mode.

**Opportunity:** Threat detection fails against sophisticated attackers by design. An attacker who knows the detection rules writes content that passes them. Provenance classification doesn't care about content shape — a publicly-writable source is untrusted regardless of how the payload is constructed. This is a structural advantage that becomes more valuable as attackers get more sophisticated.

**Failure mode:** Threat detection may get good enough. Model robustness to injection is improving. If the residual risk from undetected novel attacks stays low enough that enterprises accept it, the marginal value of provenance classification never justifies the switching cost. The market settles on "good enough" before reaching Airlock.

---

## Reason 3: Per-endpoint classification looks intractable at first glance

**Why the gap exists:** The obvious objection when you first hear the idea: "you'd need to classify every endpoint of every MCP server, and there are thousands." Most people stop there. The registry + community governance model — where classification is a crowd-sourced, asymmetric-burden, fails-to-untrusted system — is the answer, but you have to get past the initial reaction first. Incumbents evaluating roadmap additions likely dismissed it here.

**Opportunity:** The cold-start problem is solvable with the right governance design. Classification of the top 50 MCP servers covers the vast majority of actual developer usage. The asymmetric default (unknown = untrusted-external) means partial coverage is still useful.

**Failure mode:** The registry is the hardest problem Airlock has to solve, and it's not a code problem. It requires community coordination, ongoing maintenance, and trust that the classifications are accurate. If the registry has poor coverage, the proxy provides little value over a simple deny-unknown policy. This is the primary execution risk, not the technical implementation.

---

## Reason 4: Funded startups optimise for what the enterprise buyer is asking for today

**Why the gap exists:** CISOs in 2025/2026 are asking "what are my agents doing?" — visibility, access control, audit logs. That's what closes deals. Runlayer, Helmet, Operant, and Geordie all built what the buyer articulated. The content provenance problem is one mental model shift away from where enterprise buyers currently are — they frame AI agent risk as "data going out" not "malicious instructions coming in." Nobody raises $11M solving a problem the buyer hasn't put in a budget line.

**Opportunity:** Enterprise buyers are one incident away from the right mental model. The Tenet Security disclosure (85% exploitation rate, Fortune 100 company confirmed affected) is the kind of event that shifts CISO thinking from "data egress" to "instruction ingress." Being positioned with a solution before that shift completes is the right timing.

**Failure mode:** The shift may take longer than Airlock's runway. If enterprise buyers don't converge on provenance classification as the right mental model within 12–18 months, Airlock is selling a solution to a problem buyers haven't articulated yet — a very hard sales motion.

---

## Reason 5: Making a trust assertion is a liability

**Why the gap exists:** A tool that marks content as "trusted" owns the blame when it is wrong. If Airlock classifies a source as `trusted` and an attack comes through it, Airlock is the proximate cause of the incident. Incumbents with enterprise customers may be deliberately avoiding this liability. No existing tool makes affirmative trust claims — they only flag threats. That asymmetry is not an accident.

**Opportunity:** The liability is manageable with the right framing. Airlock classifies by provenance (who can write to this source), not by content safety (this content is safe). The confirmation prompt is explicit: "untrusted external content was read this session" — not "this content is safe." The classification is structural, not a safety guarantee.

**Failure mode:** Enterprise legal teams may reject the framing regardless. If a CISO's counsel reads "trusted" anywhere in Airlock's classification output and interprets it as a safety certification, the liability concern blocks enterprise sales. The language and UX of trust classification needs to be defensively scoped from day one.

---

## Reason 6: Spotlighting efficacy in MCP contexts is unproven

**Why the gap exists:** The >50% to <2% injection rate reduction figures from arXiv:2403.14720 are from controlled RAG pipeline experiments. Transfer to MCP contexts has not been demonstrated empirically. Serious players may be waiting for evidence before building products on this assumption. Microsoft FIDES notably diverges from Spotlighting — storing labels in `_meta` protocol fields rather than injecting into model context — possibly because they evaluated the evidence and weren't confident in the transfer.

**Opportunity:** Being first to empirically test Spotlighting effectiveness in MCP contexts is both a technical task and a research contribution. If Airlock demonstrates the efficacy empirically, that data becomes the foundation for the spec contribution argument and a competitive moat.

**Failure mode:** Spotlighting may not transfer well to MCP contexts. Models with longer context windows, multiple competing trust signals, or adversarially crafted surrounding context may not respond to structural markers reliably. If the core efficacy assumption is wrong, the mechanism Airlock is built on doesn't deliver the protection it promises. This needs to be tested early, not assumed.

---

## Reason 7: The attack class is too new for the second-order solution

**Why the gap exists:** Agentjacking at MCP scale only became a documented, production-real attack class in 2025. The security community is still in the "understand and document" phase — OWASP Top 10 for agents, CVE filing, incident disclosure. The market pattern is: document the attack → deploy first-order defenses (detection, access control) → identify their limits → deploy structural solutions. Airlock is proposing the structural solution before the market has finished with first-order defenses.

**Opportunity:** Entering before the market is fully ready means lower competition, more room to define the category, and time to build registry coverage before it's urgently needed. The best time to build the water system is before the drought.

**Failure mode:** Being too early is equivalent to being wrong. If Airlock reaches the market before enterprise buyers have finished with first-order defenses, the sales cycle is an education motion, not a procurement motion. That is slow, expensive, and dependent on staying alive long enough for the market to catch up.

---

## Reason 8: Microsoft FIDES exists but hasn't shipped

**Why the gap exists:** This is the most clarifying data point. Microsoft Research has the right mental model (arXiv:2505.23643, May 2025). They've partially deployed it in GitHub Copilot CLI behind a feature flag. They haven't shipped it as a generally-available product. The reasons are likely: experimental status, incomplete coverage (GitHub MCP server only), no developer UX, and the productization gap between "research prototype that works" and "enterprise product with registry, UX, and support."

**Opportunity:** Microsoft moves slowly on experimental research features. The gap between feature flag and GA product at Microsoft is typically 12–24 months minimum. That is Airlock's window. The fact that FIDES exists validates the approach — if Microsoft Research got to the same mental model independently, the insight is real, not idiosyncratic.

**Failure mode:** Microsoft ships FIDES as a general product and adds the missing pieces (Spotlighting injection, per-endpoint registry, developer UX). They have GitHub Copilot Enterprise distribution — Fortune 500 install base. If that happens, Airlock's differentiation window closes faster than its adoption can build. This is the highest-probability existential risk in the competitive landscape.

---

## Summary: Where Airlock Is Positioned

| Reason gap exists | Our window | Primary risk |
|---|---|---|
| NLP/security community divide | Right mental model, earlier | FIDES graduates from flag to product |
| Threat detection is good enough for now | Structural advantage as attacks sophisticate | Model robustness improves faster |
| Per-endpoint looks intractable | Solvable with registry governance | Registry cold-start kills adoption |
| Enterprise buyers haven't articulated it yet | Positioned before the shift | Shift takes longer than our runway |
| Trust assertion is a liability | Scoped language mitigates it | Legal blocks enterprise sales |
| Spotlighting efficacy unproven in MCP | First to demonstrate it | Core assumption is wrong |
| Attack class too new for structural solution | Lower competition, category definition | Too early = equivalent to wrong |
| FIDES not yet shipped as GA product | 12–24 month Microsoft lag | Microsoft ships it with Copilot distribution |

The honest read: Airlock is in a real window, with a validated mental model, against a gap that is closing from multiple directions simultaneously. The question is not whether the window exists — it does. The question is whether Airlock can reach meaningful adoption before FIDES ships as a GA product, Snyk adds provenance classification, or threat detection improves enough that the structural solution stops mattering.

That is a timing and execution bet, not a problem validity bet.
