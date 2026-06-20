# Endor Labs — Agent Governance

**Category:** Commercial — AI coding agent governance
**Source:** https://www.endorlabs.com/agent-governance

## What It Does

Specifically targets AI coding agents — Cursor and Claude Code. Uses pre-execution hooks to govern: shell commands, file access, MCP tool calls, and prompts. Can block `rm -rf` style commands, restrict `.env`/`.pem` file reads, prevent dangerous database queries via MCP. Traces MCP calls, prompts, and skills back to agent and user.

## Coverage

Pre-execution blocking of dangerous outbound actions, access governance, per-agent audit trails in AI coding contexts.

## What It Does NOT Cover

Inbound response content trust. Endor governs what the agent is about to *do* (outbound) rather than what it is *reading* (inbound). No provenance classification of MCP responses.

## Relationship to Airlock

Most directly relevant commercial product for the agentjacking attack class among non-proxy tools. Same target user (developers running Claude Code / Cursor). Complementary position: Endor blocks dangerous actions after the agent has decided to take them; Airlock classifies the content that influenced the decision before it is made.
