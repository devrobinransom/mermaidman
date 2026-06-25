export type UID = `n_${string}`;
export type EID = `e_${string}`;

export type AliasMap = {
  mermaidIdToUid: Record<string, UID>;
  uidToMermaidId: Record<UID, string>;
};

export type NodeKind = "card" | "note" | "code" | "media" | "markdown" | "diagram" | "oembed";

export type Node = {
  uid: UID;
  mermaidId: string;
  label?: string;
  x?: number;
  y?: number;
  kind?: NodeKind;
  /** Mermaid topology shape (rect, round, stadium, circle, rhombus, hexagon, ...) */
  shape?: string;
  style?: {
    stroke?: string;
    fill?: string;
    border?: string;
  };
  media?: {
    kind: "image" | "video" | "audio";
    src: string;
    alt?: string;
    poster?: string;
    duration?: number;
  };
  code?: {
    language?: string;
    detectedLanguage?: string;
    content?: string;
    formatted?: string;
  };
  meta?: Record<string, unknown>;
  deleted?: boolean;
  updatedAt?: number;
};

export type Edge = {
  eid: EID;
  source: UID;
  target: UID;
  label?: string;
  /** Line style from topology: solid | dotted | thick | invisible */
  line?: string;
  /** End arrowhead: arrow | circle | cross | open */
  headEnd?: string;
  /** Start arrowhead (bidirectional links): arrow | circle | cross */
  headStart?: string;
  /** Link rank length (number of line characters) */
  length?: number;
  style?: {
    stroke?: string;
    dashed?: boolean;
    arrow?: "default" | "none";
  };
  meta?: Record<string, unknown>;
  deleted?: boolean;
  updatedAt?: number;
};

export type GraphStore = {
  nodes: Record<UID, Node>;
  edges: Record<EID, Edge>;
  alias: AliasMap;
  version: 1;
};

const now = () => Date.now();

const randomId = () => Math.random().toString(36).slice(2, 10);

export const newUid = (): UID => `n_${randomId()}`;

export const newEid = (): EID => `e_${randomId()}`;

export const createGraphStore = (): GraphStore => ({
  nodes: {},
  edges: {},
  alias: {
    mermaidIdToUid: {},
    uidToMermaidId: {},
  },
  version: 1,
});

export const ensureNodeWithUid = (
  store: GraphStore,
  uid: UID,
  mermaidId: string,
  label?: string
): Node => {
  const existing = store.nodes[uid];
  if (existing) {
    existing.mermaidId = mermaidId;
    if (label) existing.label = label;
    store.alias.mermaidIdToUid[mermaidId] = uid;
    store.alias.uidToMermaidId[uid] = mermaidId;
    return existing;
  }

  const node: Node = {
    uid,
    mermaidId,
    label,
    updatedAt: now(),
  };

  store.nodes[uid] = node;
  store.alias.mermaidIdToUid[mermaidId] = uid;
  store.alias.uidToMermaidId[uid] = mermaidId;
  return node;
};

export const ensureNode = (store: GraphStore, mermaidId: string, label?: string): Node => {
  const existingUid = store.alias.mermaidIdToUid[mermaidId];
  if (existingUid && store.nodes[existingUid]) {
    return store.nodes[existingUid];
  }

  const uid = newUid();
  const node: Node = {
    uid,
    mermaidId,
    label,
    updatedAt: now(),
  };

  store.nodes[uid] = node;
  store.alias.mermaidIdToUid[mermaidId] = uid;
  store.alias.uidToMermaidId[uid] = mermaidId;
  return node;
};

export const moveNode = (store: GraphStore, uid: UID, x: number, y: number) => {
  const node = store.nodes[uid];
  if (!node) return;
  node.x = x;
  node.y = y;
  node.updatedAt = now();
};

export const renameNode = (store: GraphStore, uid: UID, newMermaidId: string) => {
  const node = store.nodes[uid];
  if (!node) return;
  const oldMermaidId = node.mermaidId;
  if (oldMermaidId === newMermaidId) return;

  delete store.alias.mermaidIdToUid[oldMermaidId];
  store.alias.mermaidIdToUid[newMermaidId] = uid;
  store.alias.uidToMermaidId[uid] = newMermaidId;

  node.mermaidId = newMermaidId;
  node.updatedAt = now();
};

export const upsertEdge = (store: GraphStore, source: UID, target: UID, label?: string): Edge => {
  const eid = newEid();
  const edge: Edge = {
    eid,
    source,
    target,
    label,
    updatedAt: now(),
  };

  store.edges[eid] = edge;
  return edge;
};

export const upsertEdgeWithEid = (
  store: GraphStore,
  eid: EID,
  source: UID,
  target: UID,
  label?: string
): Edge => {
  const existing = store.edges[eid];
  if (existing) {
    existing.source = source;
    existing.target = target;
    if (label) existing.label = label;
    existing.updatedAt = now();
    return existing;
  }

  const edge: Edge = {
    eid,
    source,
    target,
    label,
    updatedAt: now(),
  };

  store.edges[eid] = edge;
  return edge;
};

type ParseNode = {
  id: string;
  label?: string;
  x?: number;
  y?: number;
  uid?: string;
  shape?: string;
  meta?: Record<string, unknown>;
};

type ParseEdge = {
  source: string;
  target: string;
  label?: string;
  eid?: string;
  // snake_case to match the Rust/WASM serde field names
  line?: string;
  head_end?: string;
  head_start?: string;
  length?: number;
  meta?: Record<string, unknown>;
};

export const upsertNodeFromParse = (store: GraphStore, node: ParseNode): Node => {
  const uid = node.uid as UID | undefined;
  const label = node.label ?? node.id;
  const entry = uid
    ? ensureNodeWithUid(store, uid, node.id, label)
    : ensureNode(store, node.id, label);

  if (typeof node.x === "number") entry.x = node.x;
  if (typeof node.y === "number") entry.y = node.y;
  if (typeof node.shape === "string") entry.shape = node.shape;
  if (node.meta && typeof node.meta === "object") entry.meta = node.meta;
  entry.updatedAt = now();

  return entry;
};

export const upsertEdgeFromParse = (store: GraphStore, edge: ParseEdge): Edge => {
  const sourceUid = store.alias.mermaidIdToUid[edge.source] ?? ensureNode(store, edge.source).uid;
  const targetUid = store.alias.mermaidIdToUid[edge.target] ?? ensureNode(store, edge.target).uid;

  const eid = edge.eid as EID | undefined;
  const entry = eid
    ? upsertEdgeWithEid(store, eid, sourceUid, targetUid, edge.label)
    : upsertEdge(store, sourceUid, targetUid, edge.label);

  if (typeof edge.line === "string") entry.line = edge.line;
  if (typeof edge.head_end === "string") entry.headEnd = edge.head_end;
  if (typeof edge.head_start === "string") entry.headStart = edge.head_start;
  if (typeof edge.length === "number") entry.length = edge.length;
  if (edge.meta && typeof edge.meta === "object") entry.meta = edge.meta;
  entry.updatedAt = now();

  return entry;
};

export const deleteEdge = (store: GraphStore, eid: EID) => {
  const edge = store.edges[eid];
  if (!edge) return;
  edge.deleted = true;
  edge.updatedAt = now();
};
