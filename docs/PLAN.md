# Mermaidman Plan: from flowchart editor to world runtime

**Status:** proposal, 2026-10-17
**Companion:** [`LANGUAGE.md`](LANGUAGE.md) (kernel semantics and examples)
**Supersedes in priority:** the R0–R4 backlog in [`issues/`](issues/README.md), which remains valid but is re-sequenced below

## 1. The thesis

Mermaidman is **a declarative language and runtime for describing a world, deriving knowledge from it, changing it safely, and compiling it into interactive visualizations.**

Mermaid is the human- and LLM-readable source form. Grid, form, Gantt, Sankey and the current React Flow canvas are renderers of the same world. One law governs everything: **standard Mermaid stays meaningful.** If Mermaidman vanished tomorrow, the `.mmd` file must still convey the structure in any Mermaid renderer. Mermaidman metadata enriches; it never replaces.

The end state, in order of ambition:

1. If you can describe a business as a diagram, Mermaidman turns that diagram into a working system.
2. If you can describe it in natural language, an agent writes the Mermaidman model for you.
3. As the business operates, the model stays synchronized with reality.
4. The same model lets agents understand, simulate, improve and operate the business.

## 2. Where the repo is

What exists (alpha, working): text↔canvas round-trip, drag persists layout in `%% @node:` directives, connector create/reconnect/delete, nested diagrams, undo/redo, browser-local projects, Giphy/Anthropic actions, a Tauri shell with SQLite + FTS5.

What the vision needs that does not exist: **all of the kernel.** There is no Fact, Value, Expr, Query, typed Thing, Change-as-value or Commit. The closest thing is `OpsLog` in `mermaidman-core` (NodeCreate/Move/… operations), which is a diagram-level undo log, not a world log.

Put differently: the repo is the *view layer* of the vision (`as mermaid.flowchart` plus its editor), built before the thing it is meant to render. That is a sequencing accident, not a failure, but it means the next phase is a **re-foundation under the editor**, not a feature on top of it.

Blocking debt (from [`PROJECT_AUDIT.md`](PROJECT_AUDIT.md)): two divergent Rust parsers, an unauthenticated `/api/ai` route, an export that ignores the active file, unsandboxed iframes, and a vendored UI kit carrying unrelated CRM/demo code.

## 3. Deliberate scope cuts

These are decisions, not omissions.

- **"Replace Excel" is not a goal.** The one commitment is: *grid is a view over the world, editable in both directions.* A1 compatibility, xlsx import heuristics, formatting parity and Goal Seek are Phase 6+ and may never happen.
- **Datalog engine, bitemporal store, per-field merge policy, solver** are each a multi-year subsystem. None of them is the differentiator. They enter the plan only when a phase demo requires them, and the first move is always to evaluate an existing Rust engine before writing one.
- **Branches with merge** come after Change-as-value, not before. A branch of length one (a proposed Change rendered as ghost state) delivers most of the AI value with a fraction of the semantics.
- **No general-purpose code inside the world language.** Rules, queries and views are declarative. External effects live behind Actions.
- **Nothing in the README claims "business OS" until Phase 4 ships.** Until then this is a Mermaid editor with a typed world underneath.

## 4. Architectural decisions (made now, because every phase writes to them)

### 4.1 One crate
`crates/mermaidman-core` is canonical. The parser in `apps/web/src/rust-engine/parser.rs` (currently the better one) moves into it with its tests. Web WASM and Tauri both depend on the core. `rust-engine` is deleted once parity fixtures pass. The vision needs one compiler pipeline; two is disqualifying.

### 4.2 Compiler shape
```
.mmd source
  → lexer/parser (nom)         Mermaid topology + %% directives
  → AST
  → name resolution            mermaid id → uid, type names → type refs
  → desugaring                 edges, types, annotations → Facts/Changes
  → World IR                   Value · Ref · Fact · Expr · Change
  → evaluator / query / view / action runtime
```
Mermaid is one front end. Visual editing, natural language (via agent), JSON/API and importers all compile to the same World IR.

### 4.3 Directive schema v1: `%% @mm:`
Identity and semantics belong to the world; layout and style belong to a view. Today `@node:` conflates uid, x/y, kind, style and nested payload. v1 splits them:

```
%% @mm v1
%% @mm:thing  A  {"uid":"n_a1","type":"consulting.Lead"}
%% @mm:fact   A  {"name":"Acme lead","owner":"robin"}
%% @mm:edge   e1 {"eid":"e_ab","source":"A","target":"B","key":"next"}
%% @mm:view   default {"renderer":"mermaid.flowchart"}
%% @mm:layout default A {"x":100,"y":120}
%% @mm:style  default A {"fill":"#fff","stroke":"#000"}
%% @mm:ai     a1 {"action":"expand","model":"…","at":"…"}
```
Rules: JSON only in new writes; `@node:`/`@edge:` and loose `{ x: 1 }` are parsed for one major version then dropped; canonical key ordering so diffs are stable (closes R0-01); a single `%% @mm v1` header line declares the schema version. Everything after `%%` is invisible to Mermaid.

### 4.4 World store ≠ `.mmd`
The `.mmd` holds structure, types, views and small worlds; it is exportable source. Live state (thousands of invoices, events, agent logs) lives in a store. Tauri already has SQLite; that is the world store on desktop. Web alpha: keep Zustand-persist and accept it is throwaway, then move to SQLite-wasm over OPFS when Phase 4 needs real tables.

### 4.5 The current graph store becomes a View
Do not rewrite the editor. The kernel goes underneath it: `graphStore` becomes the renderer state for `as mermaid.flowchart`. Every drag, connect and delete emits a `Change`; the undo stack becomes the commit log. This single refactor turns the existing editor from "the product" into "the first renderer" without discarding it.

### 4.6 One expression language
When `Expr` arrives, the same evaluator serves a derived column, a rule body, a view filter, a dashboard metric and a node badge. No "quick formula field" that is secretly a second language.

### 4.7 AI never writes the world
Agents get read/query access and produce `Change` values. Mermaidman renders the change as ghost state, rules validate it, a human accepts, an Action performs external effects, a Commit records it. Provenance (`@source`, `@confidence`, `@state`) rides on facts as metadata.

## 5. Phases

Each phase has a demo and a kill test. The next phase does not start until the demo lands. Durations assume one focused engineer plus agent assistance.

### Phase 0 — Hygiene and language spec (≈2 weeks)
- Fix P0: authenticate and rate-limit `/api/ai` before any keyed public deploy.
- Fix P1s: export uses the active file; iframe `sandbox` + provider allowlist on embed nodes; prune `radical-ai-studio-kit` to the primitives actually imported; one version string.
- Write `docs/LANGUAGE.md` with kernel semantics and the example corpus; add `fixtures/worlds/` with `xzcute.mmd` and `sar-jub.mmd`.
- **Demo:** none (hygiene). **Kill test:** if any example in LANGUAGE.md needs a primitive outside Thing / Fact / Type / Expr / Rule / Query / Action / Change / View, the kernel is wrong. Fix the spec, not the code.

### Phase 1 — One compiler (≈4–6 weeks)
- Port `rust-engine` parser + tests into `mermaidman-core`; delete `rust-engine` after parity.
- Implement `%% @mm v1` reader/writer with migration from `@node:`/`@edge:`.
- Canonical writer that round-trips byte-stably; CI runs round-trip on the fixture corpus.
- Closes R0-01, R0-03, R0-05; absorbs the audit's "consolidate parsers" P1.
- **Demo:** every existing diagram opens identically in web and Tauri from the same crate; `cargo test -p mermaidman-core` is the only Rust test command.

### Phase 2 — World kernel under the editor (≈6–8 weeks)
- `Value`, `Ref`, `Fact`, `Thing`, `Change`, `Commit` in Rust; `World(C) = apply(ancestry(C))`.
- Diagram compiles to facts: `A --> B` ⇒ `fact(A, links_to, B)`; layout becomes view facts.
- `@mm:thing … "type"` with a tiny built-in type library (`core.Thing`, `business.Organization`, `business.Person`, `consulting.Lead/Proposal/Engagement`, `finance.Invoice/Payment`, `software.Repository`).
- Editor: right-click → Set type writes the directive; node inspector shows the Thing as a record; undo/redo re-implemented over commits.
- Closes R0-02, R0-04, R4-01.
- **Demo:** open a plain Mermaid consulting flowchart, assign types, inspect any node as structured data, save, open in vanilla Mermaid and see the same diagram.

### Phase 3 — Change-as-value and the agent loop (≈4 weeks)
- `/api/ai` returns a `Change` (JSON) rather than text; the route is authenticated and quota'd.
- Ghost rendering of a pending Change on the canvas; Accept → commit, Reject → discard.
- Provenance metadata written on every AI-originated fact.
- Closes R1-05.
- **Demo:** "add an Invoice stage between Engagement and Payment" → ghost nodes/edges → accept → entry in history with source `ai`.

### Phase 4 — Expr and the grid view (≈6–8 weeks)
- Expression evaluator with typed values: `Number, Text, Bool, Date, Duration, Money<INR>, Quantity<unit>, Ref, List, Set, Record, Table`. `Money<INR> + Money<USD>` is a type error.
- `derive` on a type; dependency graph with incremental recomputation.
- Grid renderer: `view clients { from business.Organization as grid }` with stored, derived, relationship and action columns. Grid edits emit Changes; graph updates live.
- Web world store moves to SQLite-wasm/OPFS if Zustand cannot carry the tables.
- **Demo:** xZcute clients as grid ↔ graph with an `outstanding` derived column and no export step between views. This is the first moment the product is not a diagram tool.

### Phase 5 — Rules, queries, views, drill (≈8 weeks)
- Datalog-subset rule engine with semi-naive evaluation. Evaluate existing Rust engines first (`datafrog`-style runtime engines fit user-authored rules; compile-time macro engines such as `ascent` likely do not); write one only if none fits.
- `query` and `view name { from … as grid | graph | mermaid.flowchart | gantt }`.
- Drill-through as view routing (`drill Engagement -> engagement_home`); subgraphs as scopes with their own views.
- Closes R1-01..03, R2-05.
- **Demo:** `Build --> Sell --> Deliver --> Collect`, drillable three levels, every level a view over the same world.

### Phase 6+ — deferred on purpose
Branches with merge semantics (type-declared merge policy: `conflict` / `union` / `lww`); Actions with effect annotations and approval guards; bindings (`@mm:bind Repo github.repository`, GitHub first); xlsx/CSV import and export; packs/modules (`use consulting`); `goal … subject to …` with a solver; event Things (`PaymentReceived`). Each is real. None touches the codebase before the Phase 5 demo.

## 6. Dogfood

Primary world: the **xZcute Technologies org map** (companies, products, repositories, IP ownership, client engagements, retainers). Stress test: **SAR JUB-018 procurement** (BOM, suppliers, RFQ, PO, fabrication jobs, inspections, invoices; exercises Money, units, dates and cross-view consistency). Both live in `fixtures/worlds/` from Phase 0 and are the acceptance suite for every phase. No hypothetical verticals until these two are boring.

## 7. Agent competence ladder (for evals, later)

| Level | Output |
| --- | --- |
| 0 | valid Mermaid |
| 1 | correct diagram type |
| 2 | good information architecture |
| 3 | semantic `@mm:thing` types |
| 4 | correct rules / actions / views |
| 5 | operational integration (bindings) |
| 6 | proposes improvements to the model |

"Build me a 10-person architecture firm" becomes a benchmark once Phase 5 exists.

## 8. Open decisions

1. Web world store for alpha: SQLite-wasm/OPFS now (correct, slower) or Zustand until Phase 4 (fast, throwaway)? Plan assumes the latter.
2. Migration window for `@node:`/`@edge:`: parse-only for one major version, then drop. Confirm.
3. Rule syntax: block form (`rule x(a) if { … }`) or Datalog form (`x(A) :- …`)? Plan recommends block form for users, Datalog semantics underneath.

## 9. Backlog re-mapping

| Backlog item | Phase |
| --- | --- |
| R0-01 directive versioning | 1 |
| R0-02 node kind registry | 2 (becomes types) |
| R0-03 nested payload parsing | 1 |
| R0-04 AI provenance | 2–3 |
| R0-05 uid index | 1 |
| R1-01..03 nested editor UX | 5 (drill) |
| R1-04 code node | unchanged, any time |
| R1-05 AI selection actions | 3 |
| R2-* explorer/windows/views | 5+ |
| R3-01..04 media nodes | unchanged, any time |
| R3-05 semantic zoom | 5+ |
| R4-01 event log | 2 |
| R4-02 CRDT merge | 6+ (type-declared merge instead) |
| R4-03/04 doc↔graph | 6+ |
| R4-05 trial/analytics | out of scope for now |
