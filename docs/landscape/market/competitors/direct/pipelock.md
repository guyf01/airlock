# Pipelock

**Category:** Open source — AI agent firewall
**Stars:** 724, 83 forks, v2.8.0 (June 18 2026) — actively maintained
**Source:** https://github.com/luckyPipewrench/pipelock

## What It Does

AI agent firewall. Intercepts MCP stdio, HTTP, WebSocket, and A2A traffic. Scans tool responses for 29 prompt injection patterns using 6-pass normalization to catch evasion attempts. Scans tool arguments for 62 credential patterns. SHA-256 fingerprints tool descriptions for rug-pull detection. Emits cryptographically signed mediator action receipts as verifiable audit proof.

Has an `ask` mode that surfaces an interactive terminal approval prompt — the developer must approve or deny before the response reaches the model.

## Coverage

Threat detection (strong evasion resistance), rug-pull detection, outbound credential scanning, human-in-the-loop via `ask` mode, cryptographic audit receipts.

## What It Does NOT Cover

`ask` mode triggers on threat detection, not on trust level of the data source. A response from a publicly-writable external source with no detected injection pattern passes through without confirmation. No provenance classification by data source origin. No Spotlighting. No per-endpoint trust registry.

## Relationship to Airlock

Closest UX overlap in the market. The `ask` mode makes it the nearest conceptual equivalent to Airlock's developer confirmation prompt. The fundamental difference: Pipelock asks "did we detect a threat?" whereas Airlock asks "what is the trust level of this data source?" — two different questions with different answers for sophisticated attacks that don't match known patterns.
