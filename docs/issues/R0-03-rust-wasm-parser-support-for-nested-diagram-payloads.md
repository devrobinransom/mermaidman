# R0-03 Rust WASM parser support for nested diagram payloads

Labels: parser, wasm, phase-0
Phase: 0
Depends on: R0-01
References: docs/ai-ux-2026.md, docs/nested-diagrams.md

## Problem
The parser does not yet handle diagram.mermaidman payloads, blocking nested diagrams.

## Acceptance Criteria
System.Object[]

## Notes
- Treat nested payload as data, not as top-level topology.

