# Monetisation Model

## The Model

**Individual developer tool — free.**
The proxy, the registry, the SDK. Zero cost to install and use. This is the adoption layer.

**Enterprise policy management — paid.**
Central policy console, audit log aggregation, analytics, RBAC. Sold to security teams managing AI agent usage across an organisation.

The enterprise offering is built on top of the individual tool. A CISO buys a policy console for a product their developers are already using — not before. Individual adoption comes first; enterprise revenue follows.

---

## Product Tiers

```
Free (individual developers)
  ├─ Proxy with local policy enforcement
  ├─ Community registry classifications
  ├─ Spotlighting markers applied to tool responses
  └─ Developer-facing confirmation prompts

Paid (teams and organisations)
  ├─ Central policy console (security team defines, all developers inherit)
  ├─ RBAC (who can approve which action classes)
  ├─ Audit log aggregation and analytics
  └─ Private registry entries for internal MCP servers
```

---

## Three Architectural Decisions

### 1. Policy distribution: Pull

Each developer's proxy pulls its policy set from a central policy server on startup and on a poll interval. The security team changes a policy once; it propagates to all developer proxies without requiring developer action.

**Offline behaviour:** if the policy server is unreachable, the proxy fails safe — applies the most restrictive defaults (treat all unknown tool responses as untrusted-external) rather than failing open.

The alternative — pushing config files via git or MDM — loses central control. A security team cannot respond to an incident by updating a config file and trusting it reaches everyone. Pull wins for enterprise.

### 2. Audit logs: Hosted by default, aggregation engine self-hostable

Developers' proxies emit structured audit events: which tool was called, what trust level was applied, whether a confirmation was shown, what the developer approved.

**Default:** events are sent to Airlock's hosted aggregation and analytics service. Security teams get a dashboard without running any infrastructure.

**Enterprise option:** the aggregation engine and analytics stack are deployable artifacts. Customers who cannot send audit data to a third party run the engine in their own infrastructure. Airlock defines the event schema and ships the engine; the customer owns the data and the deployment.

This is not just "forward logs to your SIEM" — it is the full analytics stack, self-hostable. The hosted and self-hosted options are functionally equivalent; the difference is where the data lives.

### 3. Policy server: Cloud-hosted, self-hosted added on demand

The policy server (the service proxies pull from) is cloud-hosted by Airlock. Customers connect their proxies to Airlock's service.

Self-hosted policy server is not built until the first enterprise customer requires it. Air-gapped or strict data-residency customers will ask for it; building it before that demand exists is premature. When the first large customer requires it, the self-hosted policy server becomes a paid tier deliverable.

---

## What This Means for Phase 1 Architecture

The individual developer proxy cannot be purely local. It needs:
- An **org ID** — ties the proxy to a team's policy set
- A **policy sync mechanism** — pull on startup, poll on interval, apply updates
- An **audit event emitter** — structured events sent to the configured destination (hosted or self-hosted aggregation engine)
- An **offline fallback** — policy cache with safe defaults when policy server is unreachable

These are not Phase 2 additions. They must be in the initial proxy design, even if Phase 1 ships with a no-op policy server (every proxy uses community defaults) and a stub event emitter. The hooks need to exist from day one.
