# Ideal State: What We Are Striving For

## The Target

An agentic system where an agent can freely observe any data from any source, but cannot take actions that were causally triggered by instructions embedded in untrusted content — without a human explicitly approving that action first.

## The Enforcement Boundary

Taint tracking names what we are trying to approximate: an action should be gated if it was causally downstream of untrusted content. The ideal system would track that causal ancestry precisely. The practical constraint is that the causal chain passes through the model's implicit reasoning — there is no explicit data flow graph to instrument. What we can do is structurally mark untrusted content at ingress and enforce policy at the action layer — an approximation of taint tracking, not a full implementation of it.

This defines three distinct zones:

- **Passive observation** — reading and analysing content within the current context, regardless of trust level. Unrestricted. Agents need to read untrusted data to do their job.
- **Active propagation** — summarising into output, passing content forward to other tools or turns. Should preserve trust attribution so downstream consumers know the content originated from an untrusted source. Summarisation is not neutral: an agent that summarises a prompt-injected event may carry the injected instruction forward into the next context window.
- **Action** — executing code, installing packages, writing files, pushing to remotes, accessing credentials. Requires a gate when the triggering instruction originated from untrusted content.

## What "Fully Solved" Looks Like

- Every piece of data flowing through an agentic system carries a trust classification reflecting its origin
- That classification is enforced at the execution layer — not in the model's reasoning, not in natural language instructions, but structurally, below the model
- Actions triggered by untrusted content either require explicit human confirmation or are blocked entirely
- Agents that read a Sentry event containing "run npm install attacker/pkg" summarise the error and propose a fix — they do not execute the instruction

## Informed Confirmation, Not Blind Confirmation

Requiring confirmation before acting is not sufficient on its own. A user who sees "should I run this?" with no context will approve it out of habit. That is security theatre, not security.

In the ideal state, when an agent is about to take an action triggered by untrusted content, the user sees that fact explicitly and prominently:

> "This action was suggested by content from an untrusted external source (Sentry event). Review it carefully before approving."

Critically, this attribution must come from the infrastructure layer — the proxy or harness knows which tool responses were classified as untrusted and surfaces that at the confirmation step independently of what the model says. Asking the model to self-report whether it was influenced by injected content is circular: a model acting under injection will not reliably disclose it. The confirmation is only meaningful when the provenance signal comes from outside the model's own reasoning.

## Why Full Taint Tracking Is Not Yet Possible

The causal connection between "read a Sentry event" and "run npm install" passes through the model's implicit reasoning. There is no explicit data flow graph. Unlike traditional taint tracking in compiled code, there is no AST or IR to instrument. The model synthesises a response from everything in its context window simultaneously — attributing a specific action to a specific input is probabilistic, not deterministic.

The structural marking approach (marking untrusted content at ingress, enforcing at the action layer) is an approximation: it catches the case where injected instructions directly trigger an action, but cannot trace more subtle causal paths where untrusted content influences reasoning across multiple turns. Closing that gap fully requires either interpretability advances that can trace causal influence inside model weights, or architectural changes that keep untrusted data in a structurally isolated channel the model cannot act on directly.
