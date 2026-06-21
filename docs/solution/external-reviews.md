# External Reviews

Three independent reviewers evaluated Airlock with read access to all docs and web research. Summaries below. Full reasoning is in the session transcript.

---

## YC Partner / Angel Investor

**Verdict:** Pass for now. Come back in 90 days with two answers.

**What they said is real:**
- Problem is real and urgent — Tenet Security disclosure 3 weeks old (June 2026), NSA guidance May 2026, 30+ CVEs in 60 days, 85% exploitation rate in controlled testing
- Gap claim holds after independent research — no production tool does content-level trust provenance for MCP
- Positioning assessment is the best doc in the set — correctly identifies the real failure modes

**Three things that could kill this:**

1. **The registry is a company, not a feature — and it doesn't exist yet.** Not a cold-start problem that governance design solves. It's a sustained political and operational problem: who decides when a classification is wrong, who maintains it as servers change, what happens when Sentry's enterprise team calls Airlock's CEO about their `untrusted-external` classification? The SQL analogy in the docs actually argues against Airlock — parameterized queries required one layer to change; the registry requires indefinite community governance.

2. **The confirmation prompt will be turned off within two weeks of installation.** Alert fatigue is not a UX problem to solve in Phase 2. It's a fundamental tension between the security model (developer must decide) and developer behavioral model (they will not decide, they will click through). Every security tool that put friction in the developer workflow either got abandoned or automated around. This needs a design-level answer before anything is built.

3. **Spotlighting efficacy in MCP contexts is assumed, not demonstrated.** The 50%→2% figures are from controlled RAG experiments. Models have gotten significantly better at ignoring structural markers since then. FIDES chose NOT to inject into model context — storing labels in `_meta` instead — possibly because Microsoft Research evaluated injection and concluded it was unreliable. This is a signal worth taking seriously.

**Two blocking questions before funding:**
- Does Spotlighting work in MCP contexts? Run the experiment on 10 real MCP servers before anything else.
- What is the adoption mechanism that doesn't require alert-tolerant behavior? The passive model (always-on, zero friction, weekly digest) has a cleaner path than confirmation prompts.

---

## Series A VC

**Verdict:** Would take a meeting. Would not lead a Series A. This is a seed-stage company. Come back in 12 months with customers and efficacy data.

**Market size reality check:** The $3.6B cited in the docs is funding, not TAM. Actual MCP-specific security category is ~$40M in disclosed startup funding today. Feature-sized market that could become product-sized in 3–5 years, but Series A requires a credible $500M+ outcome — the math is borderline.

**Business model structural hole:** The PLG ceiling is real and the docs don't address it. Snyk's early story contains the exact failure mode: "Thousands of developers were using Snyk, but they didn't have ownership of the security strategy and budget. Security buyers had never heard of Snyk." The developer who installs Airlock is not the person who buys security software. The docs don't answer: what creates urgency at the CISO level before the incumbents add this feature?

**Moat:** The registry is the right bet but is not yet a moat. It becomes durable only if MCP server authors integrate the SDK natively or the MCP spec incorporates trust metadata citing Airlock as the reference. Neither has happened. Today it's a classification spreadsheet with governance rules — replicable in 6–12 months by a better-funded competitor.

**Competitive ranking correction:** The docs rate Microsoft as the top threat. **Snyk is more dangerous.** Snyk acquired Invariant Labs (the leading MCP security research team) and has 4,500 enterprise customers. They now have the research talent, the distribution, and the category urgency. If Snyk adds provenance classification in Q3 2026, the enterprise window closes — not because they'll be technically superior, but because the CISO will say "Snyk added it, we already have Snyk." Snyk moves faster than Microsoft. The docs underweight this.

**Distribution problem:** The product leads with security friction, not value. The mcp-safe-fetch PLG signal (90% token reduction, security secondary) is read correctly in the docs but not acted on. PLG viral adoption works when the free product delivers immediate, visible, non-security value. A security proxy that adds latency and confirmation prompts is notoriously hard to get developers to install voluntarily.

**What's missing for a Series A check:**
1. Traction that proves conversion — not GitHub stars; enterprise LOIs or paid pilots with security teams engaged
2. Spotlighting efficacy data from your own testing — not arXiv citations, your empirical MCP data
3. A clear answer to "what happens when Snyk ships this?" — the docs treat this as a risk with no response

**Series A conditions (12 months out):** 3–5 paying enterprise pilots at $50–150K ACV, empirical Spotlighting efficacy data, registry covering top 100 MCP servers, Snyk hasn't shipped provenance classification.

---

## Successful Founder

**Verdict:** The window is real. Stop documenting it and jump through it.

**The doc trap is real and you're in it.** Test: foundation reduces the cost of a build decision you're about to make. Most of what's in these docs reduces the cost of a board conversation you haven't had yet. That's the wrong thing to be reducing right now. The attack class is publicly demonstrated. You don't need more validation. You need a working proxy.

**The FIDES window is not what you think.** FIDES is already shipping in the Microsoft Agent Framework Python core package. The "12-24 month Microsoft lag" framing is probably wrong. The real clock is **before Runlayer or Snyk adds Spotlighting + confirmation prompts to their existing proxy** — that's 6–8 weeks of engineering on top of infrastructure they already have. The real differentiation from FIDES is Spotlighting injection into model context + developer-facing confirmation prompts. FIDES is an automated policy enforcer. Airlock is a developer trust tool. Protect that gap.

**What to build in 90 days, in order:**

1. **Day 0–30: Working proxy.** Intercepts MCP responses, classifies by hardcoded list of 20–30 well-known servers (GitHub issues = untrusted-external, filesystem read = context-dependent), injects `[UNTRUSTED]...[/UNTRUSTED]` before model context, shows confirmation prompt when untrusted content is present and action is pending. No registry governance. No policy server. No audit log aggregation. Hardcoded classifications for the top 30 servers covering 80% of developer usage.

2. **In parallel: Empirically test Spotlighting in MCP contexts.** Build a controlled test harness. Inject payloads with and without markers. Measure model compliance rate across Claude, GPT-4o, Gemini. Publish results. If efficacy transfers — research contribution that builds credibility. If it doesn't — pivot to FIDES-style pure policy enforcement now, not after 500 installs depend on the assumption.

3. **Day 30–60: Get 50 real developers using it.** Not 500. Fifty. Watch 5–10 use it in their real workflow. The failure mode of confirmation prompts is alert fatigue — you need behavioral evidence before you know if the UX works or kills adoption.

4. **Day 60–90: The enterprise pitch is now a demonstration.** "50 developers used this, here's what the prompts surfaced, here's the classification accuracy, here's the Spotlighting efficacy data." Solves the education problem by showing CISOs what their developers already saw.

**Long-term:** Acquisition at $50–150M is the most realistic outcome. Buyers: Snyk (needs the provenance layer), Palo Alto Prisma AIRS (missing the developer tool layer), IDE players (Cursor, Replit wanting trust as a product differentiator). Spec contribution is the best outcome for the industry and the worst outcome commercially unless you've already built the tooling that benefits from the standard. Don't let spec contribution become the north star — it's a credibility builder that comes after adoption, not before.

---

## Consensus Across All Three

| Point | Consensus |
|---|---|
| Problem is real | Yes — NSA guidance, 40+ CVEs, 85% exploitation rate |
| You're in the doc trap | Yes — the working proxy hasn't been built |
| Spotlighting efficacy is unproven in MCP | Yes — test this before anything depends on it |
| Confirmation prompts risk alert fatigue | Yes — behavioral evidence needed before scaling |
| Snyk is underweighted as a threat | Yes (VC + founder) — moves faster than Microsoft |
| Seed stage, not Series A | Yes — no product, no users, no revenue |
| 90-day priority: working proxy + real users | Yes — in that order |

**Where they diverge:** YC/Angel says design the confirmation prompt UX before building; founder says ship it and watch 10 developers use it to get real behavioral data. Founder is probably right — you can't redesign something you've never watched anyone use.
