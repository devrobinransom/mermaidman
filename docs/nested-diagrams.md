# Nested Mermaidman Diagrams

This spec defines how Mermaidman supports diagrams embedded inside nodes. The goal is infinite nesting while keeping the outer file Mermaid-compatible.

## Goals
- Embed full Mermaidman diagrams inside node metadata.
- Keep the outer file valid Mermaid.
- Enable fast editing: open nested diagrams without reparsing the entire parent graph.

## Data Model
Nested diagrams are stored inside `%% @node:` JSON as a `diagram` object:

```text
graph TD
A[Subflow]

%% @node: A {
%%   "uid":"n_1",
%%   "x":120,
%%   "y":80,
%%   "kind":"diagram",
%%   "diagram":{
%%     "title":"Subflow",
%%     "mermaidman":"graph TD\nX-->Y\n%% @node: X {\"x\":50,\"y\":40}\n"
%%   }
%% }
```

### Fields
- `kind: "diagram"` signals a nested diagram node.
- `diagram.title` optional display title.
- `diagram.mermaidman` is a full Mermaidman document stored as a string.

## UX Behavior
- **Open**: double-click the node to enter the nested diagram.
- **Breadcrumbs**: show navigation stack (`Main > Subflow > ...`).
- **Preview**: parent node renders a thumbnail snapshot of the nested diagram.

## Serialization Rules
- The outer Mermaid topology remains unchanged.
- Nested diagrams are stored only in directives.
- When saving, stringify nested Mermaidman with `\n` newlines and escaped quotes.

## Performance Notes
- Nested graphs load on demand.
- Cache parsed nested graphs separately from the parent graph.
- Editing a nested diagram updates only its own payload.

## Compatibility
- Standard Mermaid ignores directives, so the outer file remains readable.
- Nested diagram payloads are opaque to Mermaid and ignored unless interpreted by Mermaidman.

## Open Questions
- Should nested diagrams have independent UID namespaces or reuse a global UID generator?
- Should thumbnails be stored as data URLs in metadata or generated on the fly?
