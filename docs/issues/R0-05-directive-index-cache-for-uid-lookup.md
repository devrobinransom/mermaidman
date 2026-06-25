# R0-05 Directive index cache for uid lookup

Labels: performance, store, phase-0
Phase: 0
Depends on: R0-02
References: docs/ai-ux-2026.md

## Problem
Directive lookups are linear, causing slow operations on large graphs.

## Acceptance Criteria
System.Object[]

## Notes
- Track cache misses for instrumentation during development.

