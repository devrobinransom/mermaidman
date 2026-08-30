# Mermaidman Web

The web application is the current primary Mermaidman editor: Next.js 16 + React 19 + React Flow, backed by an embedded Rust parser compiled to WebAssembly.

For project-wide architecture, contribution rules, and open-source policy, start with the [root README](../../README.md) and [CONTRIBUTING.md](../../CONTRIBUTING.md).

## Run locally

Run commands from the repository root:

```bash
corepack enable
pnpm install
pnpm wasm:build
pnpm dev
```

`pnpm wasm:build` is required on a fresh clone. It compiles `src/rust-engine` with `wasm-pack` and copies the browser assets into `public/wasm/`, where `useMermaidEngine` loads them at runtime.

The custom dev launcher starts on port 3000 and scans upward when a port is occupied.

```bash
pnpm --filter web dev -- --port 4000 --max 4010
```

## Optional integrations

Copy `.env.example` to `.env.local` when needed:

```dotenv
ANTHROPIC_API_KEY=
GIPHY_API_KEY=
```

- `ANTHROPIC_API_KEY` enables Summarize / Expand / Diagram node actions through `/api/ai`.
- `GIPHY_API_KEY` enables GIF search through `/api/giphy`.
- The editor, pasted media URLs, local projects, and core Mermaidman editing work without either key.

Do not expose a funded Anthropic key on a public deployment until the AI route has authentication and/or rate limiting.

## Important code paths

| Path | Purpose |
| --- | --- |
| `src/components/MermaidEditor.tsx` | Main text/canvas orchestration |
| `src/components/MermaidNode.tsx` | Rich node and Mermaid shape rendering |
| `src/components/CreationDrawer.tsx` | Templates, shapes, rich nodes, media |
| `src/components/ProjectSidebar.tsx` | Browser-local project UI |
| `src/store/graphStore.ts` | UID-first runtime graph store |
| `src/store/fileStore.ts` | Persisted projects + undo/redo |
| `src/utils/mermaidman.ts` | Source mutation helpers |
| `src/hooks/useMermaidEngine.ts` | Runtime WASM loader |
| `src/rust-engine/` | Active browser Rust parser |
| `src/app/api/ai/route.ts` | Optional Anthropic proxy |
| `src/app/api/giphy/route.ts` | Optional Giphy proxy |

## Active WASM engine

The browser does **not** currently load `crates/mermaidman-wasm`. Its active engine is `apps/web/src/rust-engine` and is loaded using the asset pattern:

1. `wasm-pack build --target web`
2. copy generated JS/WASM/types into `apps/web/public/wasm`
3. dynamically import `/wasm/mermaidman_engine.js`
4. initialize it with `/wasm/mermaidman_engine_bg.wasm`

This avoids bundler-specific `.wasm` module handling.

There is a second shared Rust parser in `crates/mermaidman-core` used by the Tauri path. The engines are not yet at feature parity; see [`../../docs/PROJECT_AUDIT.md`](../../docs/PROJECT_AUDIT.md).

## Mermaidman directives

Prefer valid JSON for new directives:

```text
graph TD
A[Start] --> B[End]

%% @node: A {"uid":"n_a","x":100,"y":100}
%% @node: B {"uid":"n_b","x":320,"y":100}
%% @edge: e_ab {"eid":"e_ab","source":"A","target":"B"}
```

The active parser also recognizes the legacy loose spatial form:

```text
%% @node: A { x: 100, y: 100 }
```

## Checks

```bash
pnpm lint
pnpm build
cargo test --manifest-path apps/web/src/rust-engine/Cargo.toml
```

When parser code changes, rebuild the WASM assets before manually exercising the editor.
