# Mermaidman Development Guide & Best Practices

## Next.js 16 + Rust WASM Integration

### The Problem
Next.js 16 (App Router) with Webpack 5's `asyncWebAssembly` experiment can be unstable, often resulting in `WorkerError`. **Turbopack** (the default in Next.js 16) currently lacks native, first-class support for `.wasm` imports as modules. 

### Recommended Pattern: "The Asset Pattern"
Instead of relying on Webpack to bundle the `.wasm` file:
1.  **Build** the Rust project with `wasm-pack build --target web`.
2.  **Copy** the output (`pkg/`) to the Next.js `public/wasm/` directory.
3.  **Load** the WASM module dynamically in the client, bypassing Webpack.

#### Implementation Details
- **Hook**: Create a `useMermaidEngine` hook.
- **Import**: Use a dynamic import with `/* webpackIgnore: true */`.
- **Path**: Refer to the file by its public URL (e.g., `/wasm/my_lib.js`).

```typescript
// hooks/useMermaidEngine.ts
useEffect(() => {
  async function load() {
    // @ts-ignore
    const wasm = await import(/* webpackIgnore: true */ '/wasm/rust_mermaidman_engine.js');
    await wasm.default(); // Initialize
    // ...
  }
  load();
}, []);
```

## Agent Helper Commands (PowerShell)
Use these for robust searching across the codebase:

```powershell
# Robust search across TypeScript & Rust files
Get-ChildItem -Recurse -Include *.ts,*.tsx,*.rs | Select-String -Pattern "YourPattern" -CaseSensitive:$false

# Find files by name
Get-ChildItem -Recurse -Filter "*Parser*"

# Quick build and sync WASM (PowerShell)
cd apps/web/src/rust-engine; wasm-pack build --target web; Copy-Item -Recurse -Force pkg/* ../../public/wasm/
```

## Monorepo & package manager
This is a **pnpm workspace**. The Next.js app lives at `apps/web` (package name `web`).
From the repo root: `pnpm install`, `pnpm dev`, `pnpm build`, and `pnpm wasm:build`
(builds the engine and copies `pkg/` → `apps/web/public/wasm`). Use pnpm, not npm.

