# Mermaidman Frontend

This is the Next.js 16 App Router frontend for Mermaidman. It renders a split-pane editor (text + canvas) and uses a Rust/WASM engine for parsing Mermaidman syntax.

## Local Dev
```powershell
npm run dev
```

Open `http://localhost:3000`.

### Auto-port options
The dev script will scan for an open port (default 3000→3020) and start Next on the first available port.

```powershell
# Start scanning from 4000 up to 4010
npm run dev -- --port 4000 --max 4010
```

## WASM Engine (Asset Pattern)
The Rust engine is built with `wasm-pack` and copied into `public/wasm` to avoid Turbopack/Webpack wasm module issues.

```powershell
cd src/rust-engine
wasm-pack build --target web
Remove-Item -Recurse -Force ../public/wasm
New-Item -ItemType Directory -Force ../public/wasm
Copy-Item -Recurse -Force pkg/* ../public/wasm/
```

## Key Files
- `src/components/MermaidEditor.tsx` editor UI and canvas
- `src/hooks/useMermaidEngine.ts` WASM loader
- `src/store/graphStore.ts` UID-first runtime graph store
- `src/rust-engine/src/lib.rs` Rust parser and Mermaidman directive support

## Mermaidman Directives
Metadata is stored in comments so standard Mermaid renderers still work:

```mermaid
%% @node: A {"uid":"n_1","x":62,"y":103}
%% @edge: e1 {"eid":"e_1","source":"n_1","target":"n_2"}
```
