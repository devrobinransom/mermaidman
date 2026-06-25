# CLAUDE.md - Mermaidman Project Guide

## Monorepo Layout (pnpm workspace)
- `apps/web` — Next.js app (workspace package name: `web`).
- `apps/web/src/rust-engine` — the active Rust/WASM parser (standalone crate; output copied to `apps/web/public/wasm`).
- `packages/` — shared workspace packages (currently empty).
- `crates/`, `src-tauri/` — Rust Cargo workspace (independent of pnpm).
- Use **pnpm** (not npm). Root scripts delegate to the `web` package via `pnpm --filter web ...`.

## Build Commands
- **Install**: `pnpm install` (from repo root)
- **Frontend Dev**: `pnpm dev` (or `pnpm --filter web dev`)
- **Frontend Build**: `pnpm build` (or `pnpm --filter web build`)
- **Rust/WASM Engine**: `pnpm wasm:build` (builds `apps/web/src/rust-engine` and copies `pkg/` → `apps/web/public/wasm`)

## Test Commands
- **Rust Tests**: `cd apps/web/src/rust-engine && cargo test`
- **Frontend Types**: `cd apps/web && pnpm exec tsc --noEmit`

## PowerShell Utility Helpers
Use these for efficient searching and system management on Windows:

### Search & Find
- **Search Content**: `Get-ChildItem -Recurse -Include *.ts,*.tsx,*.rs | Select-String -Pattern "YourPattern" -CaseSensitive:$false`
- **Find Files**: `Get-ChildItem -Recurse -Filter "*filename*"`
- **List Large Files**: `Get-ChildItem -Recurse | Where-Object { $_.Length -gt 1MB } | Sort-Object Length -Descending`

### Process & System
- **Kill Port 3000**: `Get-NetTCPConnection -LocalPort 3000 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }`
- **Check Paths**: `$env:PATH -split ';'`

## Coding Standards
- **Rust**: Use `nom` for parsing, `regex` for surgical text manipulation.
- **WASM**: Use the "Asset Pattern" (copy `pkg/` to `public/wasm`).
- **Frontend**: Next.js 16 App Router, TypeScript, React Flow for diagrams.
- **Styles**: Neobrutalism (black borders, white backgrounds, high contrast).
