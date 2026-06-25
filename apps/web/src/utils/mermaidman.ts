type PlainObject = Record<string, unknown>;

const isPlainObject = (value: unknown): value is PlainObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseLooseSpatial = (body: string): PlainObject => {
  const xMatch = body.match(/\bx\s*:\s*(-?\d+)/i);
  const yMatch = body.match(/\by\s*:\s*(-?\d+)/i);
  const result: PlainObject = {};
  if (xMatch) result.x = Number.parseInt(xMatch[1], 10);
  if (yMatch) result.y = Number.parseInt(yMatch[1], 10);
  return result;
};

const parseDirectiveBody = (body: string | undefined): PlainObject => {
  if (!body) return {};
  try {
    const parsed = JSON.parse(body);
    return isPlainObject(parsed) ? parsed : {};
  } catch {
    return parseLooseSpatial(body);
  }
};

const mergeObjects = (base: PlainObject, patch: PlainObject): PlainObject => {
  const merged: PlainObject = { ...base };
  Object.entries(patch).forEach(([key, value]) => {
    if (isPlainObject(value) && isPlainObject(merged[key])) {
      merged[key] = { ...(merged[key] as PlainObject), ...value };
      return;
    }
    merged[key] = value;
  });
  return merged;
};

export const upsertNodeDirective = (
  input: string,
  nodeId: string,
  patch: PlainObject
): string => {
  const escapedId = escapeRegExp(nodeId);
  const directiveRegex = new RegExp(
    `^%%\\s*@node:\\s*${escapedId}\\s*(\\{.*\\})\\s*$`,
    "m"
  );
  const match = input.match(directiveRegex);
  const existingBody = match?.[1];
  const mergedBody = mergeObjects(parseDirectiveBody(existingBody), patch);
  const replacement = `%% @node: ${nodeId} ${JSON.stringify(mergedBody)}`;

  if (match) {
    return input.replace(directiveRegex, replacement);
  }

  const trimmed = input.trimEnd();
  const suffix = trimmed.length > 0 ? "\n" : "";
  return `${trimmed}${suffix}${replacement}\n`;
};

// ---------------------------------------------------------------------------
// Edge + topology helpers
//
// These power FigJam-style connector creation. Every connector gesture is a
// text mutation: it writes (a) a topology edge line `A --> B` and (b) an
// `%% @edge:` directive. The live WASM parser (rust-engine/src/parser.rs)
// matches edge directives to topology lines by the (source, target) mermaid-id
// PAIR, accepts only the arrows `-->`, `---`, `-.-`, and does not read inline
// edge labels — so labels live only in the directive. Mermaid topology ids are
// `alphanumeric1` (no underscores), so generated ids stay `[A-Za-z][A-Za-z0-9]*`.
// ---------------------------------------------------------------------------

const SUPPORTED_ARROWS = ["-->", "---", "-.-"] as const;
export type MermaidArrow = (typeof SUPPORTED_ARROWS)[number];

// Optional shape-delimited label after a node id, e.g. A, A[Label], A((Label)).
const NODE_DECL = String.raw`([A-Za-z][A-Za-z0-9]*)(?:\[[^\]]*\]|\(\([^)]*\)\)|\([^)]*\)|\{[^}]*\})?`;
const ARROW_ALT = String.raw`(-->|---|-\.-)`;
const edgeLineRegex = new RegExp(
  `^\\s*${NODE_DECL}\\s*${ARROW_ALT}\\s*${NODE_DECL}\\s*$`
);

/** Parse a topology edge line into its source/target mermaid ids, or null. */
export const parseEdgeLinePair = (
  line: string
): { source: string; target: string; arrow: string } | null => {
  const m = line.match(edgeLineRegex);
  if (!m) return null;
  return { source: m[1], target: m[3], arrow: m[2] };
};

const isDirectiveLine = (line: string) => line.trim().startsWith("%%");

/** Index of the first `%%` directive line, or -1 if none. */
const firstDirectiveIndex = (lines: string[]) =>
  lines.findIndex((l) => isDirectiveLine(l));

/** Insert a line into the topology block, just before the directive block. */
const insertIntoTopology = (input: string, lineToInsert: string): string => {
  const lines = input.split("\n");
  const idx = firstDirectiveIndex(lines);
  if (idx === -1) {
    const trimmed = input.trimEnd();
    const suffix = trimmed.length > 0 ? "\n" : "";
    return `${trimmed}${suffix}${lineToInsert}\n`;
  }
  lines.splice(idx, 0, lineToInsert);
  return lines.join("\n");
};

/** True if a topology edge line already connects this exact ordered pair. */
export const hasTopologyEdge = (
  input: string,
  source: string,
  target: string
): boolean =>
  input.split("\n").some((line) => {
    const pair = parseEdgeLinePair(line);
    return pair?.source === source && pair?.target === target;
  });

/**
 * Insert `A --> B` (optionally `A --> B[Label]` for a freshly created target)
 * into the topology block. No-op if the ordered pair already exists.
 */
export const insertTopologyEdgeLine = (
  input: string,
  source: string,
  target: string,
  arrow: MermaidArrow = "-->",
  targetLabel?: string
): string => {
  if (hasTopologyEdge(input, source, target)) return input;
  const targetDecl = targetLabel ? `${target}[${targetLabel}]` : target;
  return insertIntoTopology(input, `${source} ${arrow} ${targetDecl}`);
};

/** Insert a standalone `A[Label]` declaration. No-op if id already declared. */
export const insertNodeDeclaration = (
  input: string,
  mermaidId: string,
  label?: string
): string => {
  const declRegex = new RegExp(
    `^\\s*${escapeRegExp(mermaidId)}(?:\\[|\\(|\\{|\\s*(?:-->|---|-\\.-)|\\s*$)`,
    "m"
  );
  if (declRegex.test(input)) return input;
  const decl = label ? `${mermaidId}[${label}]` : mermaidId;
  return insertIntoTopology(input, decl);
};

/** Rewrite the topology line matching the old pair to the new pair. */
export const replaceTopologyEdgeLine = (
  input: string,
  oldSource: string,
  oldTarget: string,
  newSource: string,
  newTarget: string,
  arrow: MermaidArrow = "-->"
): string => {
  const lines = input.split("\n");
  const idx = lines.findIndex((line) => {
    const pair = parseEdgeLinePair(line);
    return pair?.source === oldSource && pair?.target === oldTarget;
  });
  if (idx === -1) {
    return insertTopologyEdgeLine(input, newSource, newTarget, arrow);
  }
  lines[idx] = `${newSource} ${arrow} ${newTarget}`;
  return lines.join("\n");
};

/** Remove the topology line matching this ordered pair. */
export const removeTopologyEdgeLine = (
  input: string,
  source: string,
  target: string
): string =>
  input
    .split("\n")
    .filter((line) => {
      const pair = parseEdgeLinePair(line);
      return !(pair?.source === source && pair?.target === target);
    })
    .join("\n");

/**
 * Upsert an `%% @edge: <eid> {...}` directive. Body uses mermaid ids for
 * source/target (the live parser matches by pair, not by uid).
 */
export const upsertEdgeDirective = (
  input: string,
  eid: string,
  patch: { source: string; target: string; label?: string } & PlainObject
): string => {
  const escapedId = escapeRegExp(eid);
  const directiveRegex = new RegExp(
    `^%%\\s*@edge:\\s*${escapedId}\\s*(\\{.*\\})\\s*$`,
    "m"
  );
  const match = input.match(directiveRegex);
  const mergedBody = mergeObjects(parseDirectiveBody(match?.[1]), {
    eid,
    ...patch,
  });
  const replacement = `%% @edge: ${eid} ${JSON.stringify(mergedBody)}`;

  if (match) {
    return input.replace(directiveRegex, replacement);
  }
  const trimmed = input.trimEnd();
  const suffix = trimmed.length > 0 ? "\n" : "";
  return `${trimmed}${suffix}${replacement}\n`;
};

/** Remove the `%% @edge: <eid> {...}` directive line. */
export const removeEdgeDirective = (input: string, eid: string): string => {
  const directiveRegex = new RegExp(
    `^%%\\s*@edge:\\s*${escapeRegExp(eid)}\\s*\\{.*\\}\\s*$\\n?`,
    "m"
  );
  return input.replace(directiveRegex, "");
};

/** Remove the `%% @node: <id> {...}` directive line. */
export const removeNodeDirective = (input: string, nodeId: string): string => {
  const directiveRegex = new RegExp(
    `^%%\\s*@node:\\s*${escapeRegExp(nodeId)}\\s*\\{.*\\}\\s*$\\n?`,
    "m"
  );
  return input.replace(directiveRegex, "");
};

/** Remove a standalone `A[Label]` declaration line (not an edge line). */
export const removeNodeDeclaration = (input: string, nodeId: string): string => {
  const declRegex = new RegExp(
    `^\\s*${escapeRegExp(nodeId)}(?:\\[[^\\]]*\\]|\\(\\([^)]*\\)\\)|\\([^)]*\\)|\\{[^}]*\\})?\\s*$\\n?`,
    "m"
  );
  return input.replace(declRegex, "");
};

// ---------------------------------------------------------------------------
// Node shape editing — rewrites the topology declaration delimiters in place
// (e.g. `A[label]` -> `A{label}`). Shape lives in topology, not a directive.
// ---------------------------------------------------------------------------

/** Opening/closing delimiters for each Mermaid shape. */
export const SHAPE_DELIMS: Record<string, [string, string]> = {
  rect: ["[", "]"],
  round: ["(", ")"],
  stadium: ["([", "])"],
  subroutine: ["[[", "]]"],
  cylinder: ["[(", ")]"],
  circle: ["((", "))"],
  doublecircle: ["(((", ")))"],
  asymmetric: [">", "]"],
  rhombus: ["{", "}"],
  hexagon: ["{{", "}}"],
  parallelogram: ["[/", "/]"],
  parallelogram_alt: ["[\\", "\\]"],
  trapezoid: ["[/", "\\]"],
  trapezoid_alt: ["[\\", "/]"],
};

// Any existing shape group following a node id (ordered longest-first).
const SHAPE_GROUP =
  String.raw`\(\(\([^)]*\)\)\)` +
  String.raw`|\(\([^)]*\)\)` +
  String.raw`|\(\[[^\]]*\]\)` +
  String.raw`|\[\[[^\]]*\]\]` +
  String.raw`|\[\([^)]*\)\]` +
  String.raw`|\[/[^\]]*?/\]` +
  String.raw`|\[/[^\]]*?\\\]` +
  String.raw`|\[\\[^\]]*?\\\]` +
  String.raw`|\[\\[^\]]*?/\]` +
  String.raw`|\{\{[^}]*\}\}` +
  String.raw`|\{[^}]*\}` +
  String.raw`|>[^\]]*\]` +
  String.raw`|\[[^\]]*\]` +
  String.raw`|\([^)]*\)`;

/**
 * Set a node's shape by rewriting its topology declaration delimiters,
 * preserving the label. Rewrites every shaped occurrence of the id (so a later
 * declaration can't override the change); if the id appears only bare, adds the
 * shape to its first token occurrence.
 */
export const setNodeShape = (
  input: string,
  nodeId: string,
  shape: string,
  label: string
): string => {
  const delims = SHAPE_DELIMS[shape];
  if (!delims) return input;
  const [open, close] = delims;
  const id = escapeRegExp(nodeId);
  const safeLabel = label.length > 0 ? label : nodeId;
  const replacement = `$1${nodeId}${open}${safeLabel}${close}`;

  // Pass 1: rewrite occurrences that already carry a shape group.
  const shapedRe = new RegExp(`(^|[\\s&>])${id}(?:${SHAPE_GROUP})`, "gm");
  if (shapedRe.test(input)) {
    return input.replace(new RegExp(`(^|[\\s&>])${id}(?:${SHAPE_GROUP})`, "gm"), replacement);
  }

  // Pass 2: no shaped occurrence — add the shape to the first bare token.
  const bareRe = new RegExp(`(^|[\\s&>])${id}(?![A-Za-z0-9_\\[({>])`, "m");
  if (bareRe.test(input)) {
    return input.replace(bareRe, replacement);
  }
  return input;
};

/**
 * Allocate the next unused mermaid id: A..Z, then N1, N2, … (always
 * `[A-Za-z][A-Za-z0-9]*`, never an underscore, per the topology grammar).
 */
export const nextMermaidId = (existingIds: Iterable<string>): string => {
  const taken = new Set(existingIds);
  for (let i = 0; i < 26; i += 1) {
    const id = String.fromCharCode(65 + i);
    if (!taken.has(id)) return id;
  }
  let n = 1;
  while (taken.has(`N${n}`)) n += 1;
  return `N${n}`;
};
