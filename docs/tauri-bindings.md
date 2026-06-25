# TypeScript Bindings for Tauri Commands

When you run the Tauri app in development mode, **Specta** automatically generates TypeScript type definitions for all Tauri commands.

## Generated File Location

```
apps/web/src/lib/tauri-bindings.ts
```

## Available Commands

### Document Management

```typescript
import { commands } from "@/lib/tauri-bindings";

// Open a document
const result = await commands.openDoc("/path/to/file.mm");
// Returns: { doc_id: string, content: string, warnings: string[] }

// Save a document
await commands.saveDoc(docId, "/path/to/file.mm");
// Returns: { success: boolean, warnings: string[] }

// Close a document
await commands.closeDoc(docId);
```

### Reconciliation

```typescript
// Reconcile topology with existing graph
const result = await commands.reconcile(docId, topologyText);
// Returns: {
//   content: string,
//   warnings: string[],
//   orphaned_nodes: string[],
//   orphaned_edges: string[]
// }
```

### Search & Backlinks

```typescript
// Full-text search
const results = await commands.search("query text", 20);
// Returns: Array<{ doc_id: string, title: string, snippet: string }>

// Get backlinks to a node
const backlinks = await commands.getBacklinks("n_abc123");
// Returns: Array<{
//   source_doc: string,
//   source_node: string,
//   link_text: string | null
// }>
```

## Development Workflow

1. **Start Tauri in dev mode:**

   ```powershell
   cd src-tauri
   cargo tauri dev
   ```

2. **TypeScript types are auto-generated** on startup

3. **Import in your React components:**
   ```typescript
   import { commands } from "@/lib/tauri-bindings";
   ```

## Type Safety

All commands are fully type-safe thanks to Specta:

- Rust types → TypeScript interfaces
- Compile-time checking
- Auto-complete in VS Code
- No manual type definitions needed

## Storage Location

- **Database**: `~/.local/share/mermaidman/mermaidman.db` (Linux/macOS)
- **Database**: `%APPDATA%\mermaidman\mermaidman.db` (Windows)
- **Blobs**: `<data_dir>/blobs/` (future)
