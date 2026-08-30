# Mermaidman Project Audit

**Audit date:** 2026-08-30  
**Repository:** `devrobinransom/mermaidman`  
**Status reviewed:** `main`

This document records a code-level audit performed to prepare Mermaidman for clearer public/open-source development. It is intentionally more concrete than a roadmap: findings are based on the code that exists today.

## Scope and coverage

The audit reviewed **90%+ of the first-party application/runtime code by practical surface area**, including the full primary editor path and the Rust engines that define the document model.

### Reviewed in depth

- Main Next.js/React Flow editor orchestration
- Rich node renderer, creation drawer, project sidebar, connector UI
- Browser graph store, local file/history store, Mermaidman source mutators
- Export helper, layout fallback, shared types and WASM loader
- Anthropic and Giphy server routes
- Active browser Rust/WASM parser, models, directives and tests
- Shared Rust core types, parser/directives/topology, graph store, reconciliation, canonical serialization, document generation and operation log
- Shared-core WASM bindings
- Tauri entrypoint, app state, document commands, reconcile commands, SQLite/FTS5 search/backlink layer
- Root/app package metadata and contributor setup documentation

### Intentionally excluded from the coverage percentage

- Generated WASM glue/binaries and other generated artifacts
- Lockfiles
- Static assets
- Generated CRM typings
- Most auxiliary demo/CRM code bundled inside `radical-ai-studio-kit`

The UI primitives from that kit that Mermaidman actually imports were treated as dependencies of the editor; the unrelated demo/CRM surface was not treated as Mermaidman core code.

## Executive summary

Mermaidman has a strong underlying idea and a surprisingly complete editor loop for an alpha: text and canvas round-trip, connectors mutate source, layout persists in comments, nested diagrams work, local projects and undo/redo exist, and AI actions write provenance back into the document.

The biggest engineering issue is **not missing UI**. It is architectural divergence: the web app runs a newer embedded Rust parser while the Tauri/shared path runs an older `mermaidman-core` parser and serializer. The two implementations already disagree on syntax coverage and some data conventions. Consolidating them should come before major collaboration or plugin work.

The biggest deployment/security issue is the **unauthenticated AI proxy**. A public deployment with a funded Anthropic key can currently be used by anyone who can reach the route.

## What is solid today

### 1. Source-native editing model

Canvas changes are represented as deterministic text mutations instead of hidden editor-only state. This is the right foundation for version control, portability and future collaboration.

### 2. Active browser parser is materially capable

The web Rust parser supports:

- common Mermaid flowchart node shapes;
- solid, dotted, thick and invisible links;
- arrow/circle/cross heads;
- bidirectional heads;
- pipe labels and normalized middle labels;
- chained links;
- grouped endpoints;
- legacy loose spatial directives;
- regression tests for known chain/label ambiguity.

### 3. UID-first runtime model

The browser store separates durable `uid`/`eid` identity from Mermaid IDs. That is a useful prerequisite for safe renames, richer metadata, event logs and eventual collaborative operations.

### 4. Nested diagrams are implemented, not merely planned

Nodes can hold a Mermaidman payload and open into a nested editing context with breadcrumbs and previews.

### 5. Optional integrations degrade gracefully

The editor remains usable without Anthropic or Giphy credentials. Both keys are read on the server side.

### 6. Desktop foundation has real substance

The Tauri path includes local document open/save, in-memory graph state, SQLite indexing, FTS5 search and backlink-oriented schema/commands.

## Priority findings

### P0 — protect the AI proxy before public keyed deployment

**Area:** `apps/web/src/app/api/ai/route.ts`

The route accepts requests without authentication, per-user quotas, rate limiting or origin-level abuse controls. If a production deployment includes `ANTHROPIC_API_KEY`, any reachable client can invoke the configured model and consume the server's API budget.

**Recommendation:** require authentication or a deployment-specific access gate and add rate/quota limiting before treating hosted AI as production-ready. Consider a cheap-model/default policy and explicit per-action token/cost ceilings as well.

### P1 — export currently ignores the active diagram

**Area:** `apps/web/src/utils/export.ts` and `MermaidEditor.tsx`

The Export button names the file using the active project, but `exportToMermaid(files)` selects the `default` file first (or the first object value) and receives no `activeFileId`. A user working in another project can therefore download the wrong content under the active project's filename.

**Recommendation:** pass `activeFileId` or the active file itself into export helpers. Add a regression test covering two projects where the non-default project is active.

### P1 — consolidate the two Rust parser/serializer paths

**Areas:**

- `apps/web/src/rust-engine/`
- `crates/mermaidman-core/`
- `crates/mermaidman-wasm/`
- `src-tauri/`

The browser uses the embedded web engine, while Tauri and the alternate WASM crate use `mermaidman-core`. The browser parser already supports substantially more flowchart syntax than the shared parser. The shared serializer also emits conventions that differ from the web source-mutator path.

**Recommendation:** make one Rust crate the canonical grammar/model. Port the newer browser parser tests into that crate, then have both web WASM and Tauri depend on it. Delete the duplicate implementation only after parity tests pass.

### P1 — sandbox or constrain arbitrary embeds

**Area:** `apps/web/src/components/MermaidNode.tsx`

`oembed`/`embed` nodes render a user-provided URL directly in an iframe without a `sandbox` policy or provider allowlist.

**Recommendation:** normalize supported embed providers, reject unsafe schemes, and use the narrowest practical iframe `sandbox`/`allow` capabilities. Treat arbitrary external embeds as untrusted content.

### P1 — add automated CI before accepting outside contributions

There is no repository CI enforcing the existing lint/build/Rust checks.

**Recommendation:** add a lightweight GitHub Actions workflow for:

1. pnpm install + lint;
2. production web build after WASM assets are built;
3. active web-engine Rust tests;
4. `mermaidman-core` tests.

Keep Tauri platform builds separate because they require OS-specific dependencies.

## P2 findings / product clarity

### Share is a placeholder

The top-bar Share button has no action. Do not advertise collaboration/sharing as implemented yet.

### Several bottom toolbar controls are visual placeholders

Rectangle/Text/Connect affordances are displayed but currently lack click handlers. The insert drawer and connector gestures are the implemented creation paths.

### "Starred" and "Shared" project tabs are title conventions, not data models

The sidebar infers starred/shared files from `⭐` / `🔗` characters in a file title. This is acceptable as temporary UI scaffolding but should not be described as real sharing or project metadata.

### Version strings disagree

Root package metadata reports `0.1.0`, while the sidebar displays `MermaidMan v0.2.0`.

**Recommendation:** derive the displayed version from one source at build time or remove it until releases are formalized.

### Web project storage is browser-local

The Zustand project store persists to browser storage. This is appropriately local-first for the alpha, but it is different from the Tauri document/file model. Users should not assume web projects are synced or backed up remotely.

### Backlink infrastructure is ahead of backlink population

The Tauri SQLite schema and query command can represent backlinks, but the reviewed code does not yet show the pipeline that populates the `backlinks` table from document graph relationships.

### Layout is a fallback, not graph-aware auto-layout

Nodes without coordinates receive a simple waterfall layout. There is no Dagre/ELK-style topology-aware layout yet.

## Format and parser observations

### Prefer canonical JSON directives

The web parser intentionally preserves compatibility with old spatial directives such as:

```text
%% @node: A { x: 100, y: 100 }
```

New writes should prefer:

```text
%% @node: A {"uid":"n_1","x":100,"y":100}
```

This reduces parser ambiguity and makes external tooling simpler.

### Edge directives should consistently use Mermaid IDs for pairing

The active web parser attaches edge directives by `(source, target)` Mermaid ID pair. Public examples and future shared-core work should use the same convention until/unless the format is deliberately versioned.

### Treat the supported grammar as a Mermaid subset

The active browser parser is good for flowcharts but is not the complete Mermaid grammar. Do not claim sequence/class/state/ER/etc. support until those languages are explicitly implemented or delegated to Mermaid's own parser.

## Open-source readiness changes recommended by this audit

The repository should have, at minimum:

- clear root README with alpha status and architecture;
- MIT `LICENSE` matching Cargo workspace metadata;
- `CONTRIBUTING.md`;
- `CODE_OF_CONDUCT.md`;
- `SECURITY.md`;
- `SUPPORT.md`;
- issue forms and pull-request template;
- explicit setup instructions including the required WASM build;
- optional environment-variable documentation;
- project audit / technical-debt record.

## Recommended engineering sequence

### 1. Stabilize public alpha

- Fix active-file export.
- Gate/rate-limit AI route for public deployments.
- Sandbox embeds.
- Make version metadata consistent.
- Add CI.
- Remove or label placeholder controls.

### 2. Unify the engine

- Move the newer parser behavior and tests into `mermaidman-core`.
- Define one canonical directive schema.
- Make browser WASM and Tauri use the same core.
- Add golden round-trip fixtures shared by Rust and TypeScript-facing behavior.

### 3. Harden the document model

- Version the Mermaidman directive schema.
- Define migration behavior.
- Define stable ordering/canonical serialization.
- Add property/fuzz tests for parse → mutate → serialize → parse.

### 4. Finish local-first desktop/web parity

- Define how browser projects map to files.
- Complete backlink extraction/index updates.
- Add import/export flows that preserve Mermaidman metadata.
- Decide whether Tauri or web is the reference persistence implementation.

### 5. Only then add collaboration

The UID/EID model is a promising base for event sourcing/CRDT work, but collaboration should build on one canonical parser and serializer rather than multiplying divergent representations.

## Suggested GitHub repository metadata

The connected repository currently has no public description or topics. Recommended values:

**Description**

> Local-first visual Mermaid editor with a React Flow canvas, Rust/WASM parser, nested diagrams, and AI-assisted graph editing.

**Topics**

`mermaid`, `diagram-editor`, `visual-editor`, `react-flow`, `rust`, `webassembly`, `nextjs`, `tauri`, `local-first`, `ai`

## Definition of done for beta

A reasonable beta bar would be:

- one parser/core used by web and desktop;
- authenticated or safely disabled hosted AI;
- no misleading placeholder primary controls;
- correct active-file import/export;
- documented format version/migrations;
- CI on every PR;
- repeatable web build from a fresh clone;
- core parser/source-mutation regression suite;
- basic embed security policy;
- first tagged release and changelog.
