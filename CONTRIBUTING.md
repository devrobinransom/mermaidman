# Contributing to Mermaidman

Thanks for helping improve Mermaidman. The project is still in alpha, so small, well-tested changes that reduce architectural drift are more valuable than broad rewrites.

## Before you start

For bugs, open a bug report with a minimal Mermaid/Mermaidman input that reproduces the problem. For larger features or architectural changes, open an issue first so the source format and parser implications can be discussed before implementation.

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md). Security-sensitive reports belong in the process described in [SECURITY.md](SECURITY.md), not in a public issue.

## Development setup

### Prerequisites

- Node.js 20+
- pnpm 11 (`package.json` pins `pnpm@11.5.1`)
- Rust stable
- `wasm-pack`

Clone and install from the repository root:

```bash
git clone https://github.com/devrobinransom/mermaidman.git
cd mermaidman
corepack enable
pnpm install
pnpm wasm:build
pnpm dev
```

The web editor loads its active parser from `apps/web/public/wasm`, so a fresh clone needs a WASM build before the editor can initialize.

The root `wasm:build` command currently uses POSIX `cp`. On Windows, run `wasm-pack build --target web` in `apps/web/src/rust-engine`, then copy the generated `mermaidman_engine.js`, `mermaidman_engine_bg.wasm`, and `mermaidman_engine.d.ts` files into `apps/web/public/wasm/`.

## Optional environment variables

Copy `apps/web/.env.example` to `apps/web/.env.local` only if you need optional integrations:

```dotenv
ANTHROPIC_API_KEY=
GIPHY_API_KEY=
```

Never commit real API keys or credentials.

## Architecture you should understand first

Mermaidman currently has two Rust engine paths:

- **Active browser engine:** `apps/web/src/rust-engine/`
- **Shared desktop/core engine:** `crates/mermaidman-core/`, consumed by `src-tauri/` and wrapped by `crates/mermaidman-wasm/`

The browser engine currently supports more Mermaid flowchart syntax than the shared core. Do not assume a change to one parser automatically affects the other.

Read [`docs/PROJECT_AUDIT.md`](docs/PROJECT_AUDIT.md) before parser, reconciliation, serialization, or desktop work.

## Core invariants

Contributions should preserve these properties unless an accepted proposal explicitly changes them:

1. **Mermaid topology remains readable and portable.** Mermaidman-specific state belongs in `%%` comment directives.
2. **Text is the durable interchange representation.** Canvas gestures must round-trip to source rather than creating hidden state that cannot be serialized.
3. **Identity is stable.** Human-readable Mermaid IDs and durable `uid`/`eid` identity serve different purposes.
4. **Canvas interactions stay fast.** Avoid reparsing the entire document on hot-path operations when a deterministic source mutation is sufficient.
5. **Source mutations are deterministic and diff-friendly.** Prefer stable JSON and focused line edits.
6. **Parser changes include regression tests.** If you add syntax, add at least one parse test and one edge-case/regression test.
7. **Do not silently expand the supported Mermaid claim.** Mermaidman supports a flowchart-focused subset; unsupported grammar should fail safely rather than be advertised as complete Mermaid compatibility.

## Code map

| Path | Responsibility |
| --- | --- |
| `apps/web/src/components/MermaidEditor.tsx` | Main text/canvas orchestration |
| `apps/web/src/components/MermaidNode.tsx` | Rich node rendering |
| `apps/web/src/store/graphStore.ts` | Browser UID-first runtime model |
| `apps/web/src/store/fileStore.ts` | Local project persistence + undo/redo |
| `apps/web/src/utils/mermaidman.ts` | Deterministic Mermaidman source mutations |
| `apps/web/src/rust-engine/` | Active browser Rust/WASM parser |
| `crates/mermaidman-core/` | Shared Rust domain/parser/reconcile/write core |
| `crates/mermaidman-wasm/` | WASM binding for shared core |
| `src-tauri/` | Desktop commands, files, SQLite/FTS5 |

The `radical-ai-studio-kit` subtree contains UI primitives used by Mermaidman as well as auxiliary CRM/demo material. Avoid refactoring that subtree wholesale as part of unrelated Mermaidman changes.

## Checks

Run the checks relevant to your change before opening a PR.

### Web

```bash
pnpm lint
pnpm build
```

If the active Rust parser changed, rebuild the WASM assets before testing the UI:

```bash
pnpm wasm:build
```

### Active browser Rust engine

```bash
cargo test --manifest-path apps/web/src/rust-engine/Cargo.toml
```

### Shared Rust core

```bash
cargo test -p mermaidman-core
```

Tauri builds can require OS-specific desktop dependencies; mention in your PR when you could not run a platform-specific check.

## Pull requests

Keep PRs focused. A good PR should:

- explain the user-visible or architectural problem;
- describe the smallest chosen solution;
- include screenshots/video for visible UI changes;
- include before/after Mermaidman text for parser or serializer changes;
- add tests for parser, source-format, or reconciliation behavior;
- avoid unrelated formatting or generated-file churn;
- update README/docs when behavior or setup changes.

### Commit style

Use short imperative commit subjects when practical, for example:

```text
fix export to use active diagram
add grouped-edge parser regression test
document browser/core parser split
```

Conventional Commits are welcome but not required.

## Adding or changing directives

New directives are part of the project's interchange format. Treat them like an API:

- prefer valid JSON bodies;
- keep existing documents readable;
- define how old clients should ignore the new directive;
- use stable keys and deterministic serialization;
- add parsing and round-trip tests;
- document the directive in the root README.

## AI contributions

The `/api/ai` route is optional infrastructure. Do not make the base editor depend on an API key. Keep provider secrets server-side and avoid logging user document content or credentials.

A public deployment with AI enabled must add abuse controls such as authentication, quotas, or rate limiting before it should be considered production-ready.

## Documentation

Documentation-only PRs are welcome, especially when they correct stale architecture or setup guidance. Prefer concrete code paths and commands over aspirational roadmap language.

## License

By contributing, you agree that your contributions will be licensed under the repository's [MIT License](LICENSE).
