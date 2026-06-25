# R0-02 Node kind registry for diagram, media, oembed, and code

Labels: architecture, store, phase-0
Phase: 0
Depends on: R0-01
References: docs/ai-ux-2026.md

## Problem
GraphStore does not yet treat new node kinds as first-class types with shared validation and serialization.

## Acceptance Criteria
System.Object[]

## Notes
- Keep node kind handling centralized to avoid scattered conditionals.

