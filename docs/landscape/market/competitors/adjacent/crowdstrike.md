# CrowdStrike — Falcon AIDR + Falcon Shield

**Category:** Established security incumbent — endpoint and cloud security platform
**Products:** Falcon AIDR (AI Detection and Response), Falcon Shield
**Source:** https://www.crowdstrike.com/en-us/blog/new-crowdstrike-innovations-secure-ai-agents-govern-shadow-ai/

## What It Does

**Falcon AIDR:** Blocks prompt injection attacks and jailbreaks in real time. Protects AI coding assistants — detects hardcoded secrets, blocks code injection, redacts repository references.

**Falcon Shield:** Auto-discovers and classifies AI agents across the environment. Maps permissions and data access. Flags over-permissioning. Detects MCP servers and LLM runtimes as endpoint artifacts.

## Coverage

Endpoint detection, real-time blocking of known injection patterns, AI agent discovery and governance, access risk management.

## What It Does NOT Cover

Content trust provenance classification. CrowdStrike's architecture sits at the endpoint detection layer — it detects MCP server presence as an endpoint artifact rather than sitting in the MCP data path between server responses and the coding agent.

## Relationship to Airlock

CrowdStrike is the CISO-level buyer's incumbent security vendor. Their presence in this space validates the category but their architecture is complementary to a proxy approach rather than competing directly — they see MCP as an endpoint risk signal, not a content trust problem.
