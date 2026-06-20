# MCP Guardian (eqtylab)

**Category:** Open source — desktop app + MCP proxy
**Stars:** 200, Rust + TypeScript
**Source:** https://github.com/eqtylab/mcp-guardian

## What It Does

Desktop application with a built-in MCP proxy. Logs all MCP tool calls with full traces. Real-time approve/deny UI for individual tool call messages before they reach the server.

## What to Learn From Them

**They've shipped a working developer approval UX.** MCP Guardian is a real implementation of human-in-the-loop at the tool call level. Even though they gate outbound calls and Airlock gates on inbound content trust, the UX problem is the same: how do you interrupt a developer's workflow to request a decision without making the tool so disruptive it gets uninstalled? Their choices — desktop app, Rust proxy, visual approve/deny interface — are a concrete data point on how developers respond to this interaction model.

**Desktop app as delivery mechanism** is an architectural choice worth examining. A desktop app gives them a persistent UI surface that a terminal prompt or inline injection doesn't. Understanding whether that delivery model drives adoption or adds friction is relevant to Airlock's confirmation prompt design.

**Full trace logging** of all MCP tool calls is relevant to Airlock's Phase 2 audit feature. How they structure and surface that data to developers is worth studying.

## What They Don't Cover

Inbound response content. They approve the call going out, not the data coming back. No trust provenance classification, no Spotlighting, no per-endpoint registry.
