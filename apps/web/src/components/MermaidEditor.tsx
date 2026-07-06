"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Background,
    BackgroundVariant,
    Controls,
    Handle,
    Position,
    type NodeProps,
    type Connection,
    type OnConnectStartParams,
    useNodesState,
    useEdgesState,
    ReactFlowProvider,
    useReactFlow,
    ConnectionMode,
    addEdge,
    updateEdge,
    MarkerType,
} from 'reactflow';
import { SmoothConnectionLine } from './SmoothConnectionLine';
import { CreationDrawer, type InsertNodeOpts } from './CreationDrawer';
import { MousePointer2, Square, Type, Spline, Plus, Sparkles, Loader2, ListTree, Network } from 'lucide-react';
import { MermaidNode } from './MermaidNode';
import { type NodeMeta, type DiagramMeta, type CodeMeta, type MediaMeta, type MermaidNodeData, type NodeStyle } from '@/types/mermaid';
import 'reactflow/dist/style.css';
import { useMermaidEngine } from '@/hooks/useMermaidEngine';
import { getLayoutedNodes } from '@/utils/layout';
import { upsertNodeDirective } from '@/utils/mermaidman';
import { cn } from '@/utils/cn';
import { Badge } from '@/components/radical-ai-studio-kit/radical-ai-studio-kit/ui/Badge';
import { ProjectSidebar } from './ProjectSidebar';
import { useFileStore } from '@/store/fileStore';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/radical-ai-studio-kit/radical-ai-studio-kit/ui/Breadcrumbs';
import { Button } from '@/components/radical-ai-studio-kit/radical-ai-studio-kit/ui/Button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/radical-ai-studio-kit/radical-ai-studio-kit/ui/Card';
import { Divider } from '@/components/radical-ai-studio-kit/radical-ai-studio-kit/ui/Divider';
import { Input } from '@/components/radical-ai-studio-kit/radical-ai-studio-kit/ui/Input';
import { Textarea } from '@/components/radical-ai-studio-kit/radical-ai-studio-kit/ui/Textarea';
import {
    createGraphStore,
    moveNode,
    upsertEdgeFromParse,
    upsertNodeFromParse,
    ensureNodeWithUid,
    upsertEdgeWithEid,
    deleteEdge,
    newUid,
    newEid,
    type GraphStore,
    type UID,
    type EID,
} from '@/store/graphStore';
import {
    insertTopologyEdgeLine,
    insertNodeDeclaration,
    replaceTopologyEdgeLine,
    removeTopologyEdgeLine,
    upsertEdgeDirective,
    removeEdgeDirective,
    removeNodeDirective,
    removeNodeDeclaration,
    hasTopologyEdge,
    nextMermaidId,
    setNodeShape,
    upsertAiDirective,
} from '@/utils/mermaidman';
import { exportToMermaid } from '@/utils/export';

const INITIAL_CODE = `graph TD
A[Start] --> B[Processing]
B --> C[End]
%% @node: A { x: 100, y: 100 }
%% @node: B { x: 300, y: 100 }
%% @node: C { x: 500, y: 100 }
`;

const NODE_TYPES = { mermaidNode: MermaidNode };

const SHAPE_OPTIONS: { value: string; label: string }[] = [
    { value: 'rect', label: 'Rectangle' },
    { value: 'round', label: 'Rounded' },
    { value: 'stadium', label: 'Stadium' },
    { value: 'subroutine', label: 'Subroutine' },
    { value: 'cylinder', label: 'Cylinder / DB' },
    { value: 'circle', label: 'Circle' },
    { value: 'doublecircle', label: 'Double circle' },
    { value: 'rhombus', label: 'Diamond' },
    { value: 'hexagon', label: 'Hexagon' },
    { value: 'parallelogram', label: 'Parallelogram' },
    { value: 'parallelogram_alt', label: 'Parallelogram (alt)' },
    { value: 'trapezoid', label: 'Trapezoid' },
    { value: 'trapezoid_alt', label: 'Trapezoid (alt)' },
    { value: 'asymmetric', label: 'Asymmetric' },
];

const EDGE_STROKE = '#94a3b8';

// Map the engine's line/arrowhead info to React Flow edge styling + markers.
// Circle/cross heads use custom SVG markers injected once into the canvas.
function edgeVisuals(line?: string, headEnd?: string, headStart?: string) {
    const style: React.CSSProperties = { stroke: EDGE_STROKE, strokeWidth: 1.5 };
    if (line === 'thick') style.strokeWidth = 3;
    if (line === 'dotted') style.strokeDasharray = '6 4';
    if (line === 'invisible') style.opacity = 0;

    const marker = (head?: string) => {
        switch (head) {
            case 'arrow':
                return { type: MarkerType.ArrowClosed, color: EDGE_STROKE };
            case 'circle':
                return 'url(#mm-marker-circle)';
            case 'cross':
                return 'url(#mm-marker-cross)';
            default:
                return undefined;
        }
    };

    return { style, markerEnd: marker(headEnd), markerStart: marker(headStart) };
}

function MermaidEditorContent() {
    const { isReady, parse_mermaidman } = useMermaidEngine();
    const { files, activeFileId, updateFile, undo, redo, history } = useFileStore();
    const activeFile = activeFileId ? files[activeFileId] : null;

    // Local code state for the current view (root or nested)
    const [code, setCode] = useState(activeFile?.content || '');

    // Always-current `code` (for effects that must compare without depending on
    // it) and a guard so a store->code pull doesn't bounce back as a code->store
    // push (the two would otherwise oscillate; see the sync effects below).
    const codeRef = useRef(code);
    codeRef.current = code;
    const pullingRef = useRef(false);

    // Nested-diagram navigation + selection state (declared before the sync
    // effects below, which read diagramStack.length in their dependency arrays).
    const [diagramStack, setDiagramStack] = useState<
        { title: string; code: string; parentNodeId?: string }[]
    >([]);
    const [currentTitle, setCurrentTitle] = useState('Main');
    const [currentParentNodeId, setCurrentParentNodeId] = useState<string | undefined>(undefined);
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    // Keyboard Shortcuts for Undo/Redo
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo]);

    // Sync 1: Reset the view ONLY when the active file changes (a switch).
    // Keyed on activeFileId, not `files` — depending on `files` would re-run on
    // every content write and fight Sync 3 (infinite update loop).
    useEffect(() => {
        if (activeFileId && files[activeFileId]) {
            pullingRef.current = true; // this is a store->code load, not a user edit
            setDiagramStack([]);
            setCurrentTitle(files[activeFileId].title);
            setCurrentParentNodeId(undefined);
            setCode(files[activeFileId].content);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeFileId]);

    // Sync 2: Pull external content changes (Undo/Redo) into local code.
    // Compares via codeRef so it doesn't need `code` in deps (which would make
    // it fire on user typing and bounce against Sync 3).
    useEffect(() => {
        if (activeFileId && files[activeFileId] && diagramStack.length === 0) {
            const storeContent = files[activeFileId].content;
            if (codeRef.current !== storeContent) {
                pullingRef.current = true; // store->code pull
                setCode(storeContent);
            }
        }
    }, [files, activeFileId, diagramStack.length]);

    // Sync 3: Push local code changes back to the store. Keyed on `code` (a user
    // edit), NOT `files` — and skips the cycle right after a pull so the value
    // doesn't ping-pong. Reads the latest store content via getState.
    useEffect(() => {
        if (!activeFileId || diagramStack.length > 0) return;
        if (pullingRef.current) {
            pullingRef.current = false; // this code change came from a pull; don't echo it back
            return;
        }
        const stored = useFileStore.getState().files[activeFileId];
        if (stored && code !== stored.content) {
            updateFile(activeFileId, code);
        }
    }, [code, activeFileId, diagramStack.length, updateFile]);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const storeRef = useRef<GraphStore>(createGraphStore());
    const editSourceRef = useRef<'text' | 'graph'>('text');
    const connectStartRef = useRef<OnConnectStartParams | null>(null);
    const insertCountRef = useRef(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [aiBusy, setAiBusy] = useState<string | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);
    const { project } = useReactFlow();
    const selectedNode = useMemo(
        () => nodes.find((node) => node.id === selectedNodeId) as Node<MermaidNodeData> | undefined,
        [nodes, selectedNodeId]
    );

    // Sync: Text -> GUI
    useEffect(() => {
        if (!isReady) return;
        if (editSourceRef.current === 'graph') {
            editSourceRef.current = 'text';
            return;
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        timeoutRef.current = setTimeout(() => {
            try {
                const result = parse_mermaidman(code);
                const store = createGraphStore();

                result.nodes.forEach((n: any) => {
                    upsertNodeFromParse(store, {
                        id: n.id,
                        label: n.label,
                        x: n.x,
                        y: n.y,
                        uid: n.uid,
                        shape: n.shape,
                        meta: n.meta,
                    });
                });

                result.edges.forEach((e: any) => {
                    upsertEdgeFromParse(store, {
                        source: e.source,
                        target: e.target,
                        label: e.label,
                        eid: e.eid,
                        line: e.line,
                        head_end: e.head_end,
                        head_start: e.head_start,
                        length: e.length,
                        meta: e.meta,
                    });
                });

                storeRef.current = store;

                const flowNodes: Node<MermaidNodeData>[] = Object.values(store.nodes).map((n) => {
                    const hasPosition = typeof n.x === 'number' && typeof n.y === 'number';
                    const meta = (n.meta ?? {}) as NodeMeta;
                    const kind = typeof meta.kind === 'string' ? meta.kind : undefined;
                    const diagram = meta.diagram as DiagramMeta | undefined;
                    const diagramSource =
                        diagram && typeof diagram.mermaidman === 'string' ? diagram.mermaidman : undefined;
                    let diagramPreview: string | undefined;
                    let childItems: string[] | undefined;
                    let childCount: number | undefined;

                    if (diagramSource) {
                        if (parse_mermaidman) {
                            try {
                                const nested = parse_mermaidman(diagramSource) as any;
                                const nodeCount = Array.isArray(nested?.nodes) ? nested.nodes.length : 0;
                                const edgeCount = Array.isArray(nested?.edges) ? nested.edges.length : 0;
                                diagramPreview = `${nodeCount} nodes, ${edgeCount} edges`;
                                if (Array.isArray(nested?.nodes)) {
                                    childCount = nested.nodes.length;
                                    childItems = nested.nodes
                                        .slice(0, 4)
                                        .map((child: { label?: string; id?: string }) => child.label || child.id)
                                        .filter(Boolean);
                                }
                            } catch {
                                diagramPreview = 'Nested diagram';
                            }
                        } else {
                            diagramPreview = 'Nested diagram';
                        }
                    }

                    const code = meta.code as CodeMeta | undefined;
                    const codePreview =
                        typeof code?.content === 'string'
                            ? code.content.split('\n').slice(0, 6).join('\n')
                            : undefined;

                    return {
                        id: n.uid,
                        type: 'mermaidNode',
                        position: { x: hasPosition ? (n.x ?? 0) : 0, y: hasPosition ? (n.y ?? 0) : 0 },
                        data: {
                            label: n.label || n.mermaidId,
                            hasPosition,
                            mermaidId: n.mermaidId,
                            meta,
                            kind,
                            shape: n.shape,
                            diagramPreview,
                            codePreview,
                            childItems,
                            childCount,
                            onMetaChange: (patch: Record<string, unknown>) =>
                                applyNodePatch(n.mermaidId, patch),
                            onOpenNested: () =>
                                openNestedDiagram(n.label || n.mermaidId, n.mermaidId, diagram),
                            onCreateNested: () =>
                                createAndOpenNestedDiagram(n.label || n.mermaidId, n.mermaidId),
                        },
                    };
                });

                const flowEdges: Edge[] = Object.values(store.edges).map((e) => ({
                    id: e.eid,
                    source: e.source,
                    target: e.target,
                    label: e.label,
                    type: 'default',
                    ...edgeVisuals(e.line, e.headEnd, e.headStart),
                }));

                const layoutedNodes = getLayoutedNodes(flowNodes, flowEdges);

                setNodes(layoutedNodes);
                setEdges(flowEdges);
            } catch (e) {
                console.error("Parse error:", e);
            }
        }, 300);

        return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
    }, [code, isReady, setNodes, setEdges, parse_mermaidman]);

    // Sync: GUI -> Text
    const onNodeDragStop = useCallback((_event: any, node: Node) => {
        if (!isReady) return;

        const store = storeRef.current;
        const uid = node.id as UID;
        moveNode(store, uid, Math.round(node.position.x), Math.round(node.position.y));

        const mermaidId = store.alias.uidToMermaidId[uid] ?? node.data?.mermaidId ?? node.id;
        const newCode = upsertNodeDirective(code, mermaidId, {
            x: Math.round(node.position.x),
            y: Math.round(node.position.y),
        });

        editSourceRef.current = 'graph';
        setCode(newCode);
    }, [isReady, code]);

    const breadcrumbs = useMemo(
        () => [...diagramStack.map((entry) => entry.title), currentTitle],
        [diagramStack, currentTitle]
    );

    const navigateToBreadcrumb = useCallback((index: number) => {
        if (index < 0 || index >= breadcrumbs.length - 1) return;
        let nextCode = code;
        let nextParentNodeId = currentParentNodeId;
        let nextTitle = currentTitle;
        let nextStack = [...diagramStack];

        while (nextStack.length > index) {
            const parent = nextStack[nextStack.length - 1];
            if (!nextParentNodeId) break;
            nextCode = upsertNodeDirective(parent.code, nextParentNodeId, {
                diagram: { mermaidman: nextCode },
            });
            nextParentNodeId = parent.parentNodeId;
            nextTitle = parent.title;
            nextStack = nextStack.slice(0, -1);
        }

        setDiagramStack(nextStack);
        setCurrentTitle(nextTitle);
        setCurrentParentNodeId(nextParentNodeId);
        setSelectedNodeId(null);
        setCode(nextCode);
    }, [breadcrumbs.length, code, currentParentNodeId, currentTitle, diagramStack]);

    const openNestedDiagram = useCallback(
        (nodeLabel: string | undefined, mermaidId: string, diagram?: DiagramMeta) => {
            if (!diagram?.mermaidman) return;

            const title = diagram.title || nodeLabel || mermaidId || 'Nested';
            setDiagramStack((prev) => [
                ...prev,
                { title: currentTitle, code, parentNodeId: currentParentNodeId },
            ]);
            setCurrentTitle(title);
            setCurrentParentNodeId(mermaidId);
            setSelectedNodeId(null);
            setCode(diagram.mermaidman);
        },
        [code, currentTitle, currentParentNodeId]
    );

    const createAndOpenNestedDiagram = useCallback(
        (nodeLabel: string | undefined, mermaidId: string) => {
            const title = nodeLabel || mermaidId;
            const seedDiagram = `graph TD\nA[${title}]\n`;
            const updatedParent = upsertNodeDirective(code, mermaidId, {
                kind: 'diagram',
                diagram: { title, mermaidman: seedDiagram },
            });

            setDiagramStack((prev) => [
                ...prev,
                { title: currentTitle, code: updatedParent, parentNodeId: currentParentNodeId },
            ]);
            setCurrentTitle(title);
            setCurrentParentNodeId(mermaidId);
            setSelectedNodeId(null);
            setCode(seedDiagram);
        },
        [code, currentTitle, currentParentNodeId]
    );

    const navigateUp = useCallback(() => {
        if (diagramStack.length === 0) return;
        navigateToBreadcrumb(diagramStack.length - 1);
    }, [diagramStack.length, navigateToBreadcrumb]);

    const applyNodePatch = useCallback((mermaidId: string, patch: Record<string, unknown>) => {
        editSourceRef.current = 'text';
        setCode((prev) => upsertNodeDirective(prev, mermaidId, patch));
    }, []);

    const updateSelectedNodeMeta = useCallback(
        (patch: Record<string, unknown>) => {
            if (!selectedNode) return;
            const mermaidId = selectedNode.data?.mermaidId ?? selectedNode.id;
            applyNodePatch(mermaidId, patch);
        },
        [selectedNode, applyNodePatch]
    );

    // Shape lives in the topology declaration, so this rewrites text and lets
    // the parse effect re-render the node (editSourceRef stays 'text').
    const updateSelectedNodeShape = useCallback(
        (shape: string) => {
            if (!selectedNode) return;
            const mermaidId = selectedNode.data?.mermaidId ?? selectedNode.id;
            const label = selectedNode.data?.label ?? mermaidId;
            editSourceRef.current = 'text';
            setCode((prev) => setNodeShape(prev, mermaidId, shape, label));
        },
        [selectedNode]
    );

    // Node styling. A local draft makes the controls feel instant; each change
    // also writes the `style` object into the @node directive (round-trips).
    const [styleDraft, setStyleDraft] = useState<NodeStyle>({});
    useEffect(() => {
        const meta = (selectedNode?.data?.meta ?? {}) as NodeMeta;
        setStyleDraft((meta.style ?? {}) as NodeStyle);
        // Resync only when the selected node changes, not on every reparse.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedNodeId]);

    const applyStyle = useCallback(
        (patch: Partial<NodeStyle>) => {
            const next: NodeStyle = { ...styleDraft, ...patch };
            setStyleDraft(next);
            updateSelectedNodeMeta({ style: next });
        },
        [styleDraft, updateSelectedNodeMeta]
    );

    // --- Connectors: every gesture round-trips to mermaidman text ---

    // Resolve a flow-node UID to its current mermaid id (alias), with fallbacks.
    const mermaidIdOf = useCallback(
        (uid: string): string =>
            storeRef.current.alias.uidToMermaidId[uid as UID] ??
            (nodes.find((n) => n.id === uid)?.data as MermaidNodeData | undefined)?.mermaidId ??
            uid,
        [nodes]
    );

    const flowEdgeProps = useMemo(
        () => ({
            type: 'default',
            style: { stroke: '#94a3b8', strokeWidth: 1.5 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
        }),
        []
    );

    // Reject self-loops and parallel edges (the live parser keys edges by pair).
    const isValidConnection = useCallback(
        (conn: Connection) => {
            if (!conn.source || !conn.target || conn.source === conn.target) return false;
            return !hasTopologyEdge(code, mermaidIdOf(conn.source), mermaidIdOf(conn.target));
        },
        [code, mermaidIdOf]
    );

    // Drag handle -> handle between two existing nodes.
    const onConnect = useCallback(
        (conn: Connection) => {
            if (!conn.source || !conn.target || conn.source === conn.target) return;
            const store = storeRef.current;
            const srcUid = conn.source as UID;
            const tgtUid = conn.target as UID;
            const srcMid = mermaidIdOf(srcUid);
            const tgtMid = mermaidIdOf(tgtUid);
            if (hasTopologyEdge(code, srcMid, tgtMid)) return;

            const eid = newEid();
            upsertEdgeWithEid(store, eid, srcUid, tgtUid);
            setEdges((eds) => addEdge({ id: eid, source: srcUid, target: tgtUid, ...flowEdgeProps }, eds));

            let next = insertTopologyEdgeLine(code, srcMid, tgtMid, '-->');
            next = upsertEdgeDirective(next, eid, { source: srcMid, target: tgtMid });

            editSourceRef.current = 'graph';
            setCode(next);
        },
        [code, mermaidIdOf, setEdges, flowEdgeProps]
    );

    const onConnectStart = useCallback(
        (_event: React.MouseEvent | React.TouchEvent, params: OnConnectStartParams) => {
            connectStartRef.current = params;
        },
        []
    );

    // Drop a connector on empty canvas -> spawn a connected node (node + edge + text).
    const onConnectEnd = useCallback(
        (event: MouseEvent | TouchEvent) => {
            const start = connectStartRef.current;
            connectStartRef.current = null;
            if (!start?.nodeId) return;

            const targetEl = event.target as HTMLElement | null;
            if (!targetEl?.classList?.contains('react-flow__pane')) return;

            const store = storeRef.current;
            const point =
                'changedTouches' in event ? event.changedTouches[0] : (event as MouseEvent);
            const pos = project({ x: point.clientX, y: point.clientY });

            const srcUid = start.nodeId as UID;
            const srcMid = mermaidIdOf(srcUid);
            const uid = newUid();
            const newMid = nextMermaidId(Object.values(store.alias.uidToMermaidId));
            const eid = newEid();
            const label = 'Node';
            const x = Math.round(pos.x);
            const y = Math.round(pos.y);

            ensureNodeWithUid(store, uid, newMid, label);
            moveNode(store, uid, x, y);
            upsertEdgeWithEid(store, eid, srcUid, uid);

            setNodes((nds) =>
                nds.concat({
                    id: uid,
                    type: 'mermaidNode',
                    position: { x, y },
                    data: {
                        label,
                        mermaidId: newMid,
                        hasPosition: true,
                        meta: {},
                        onMetaChange: (patch: Record<string, unknown>) => applyNodePatch(newMid, patch),
                        onCreateNested: () => createAndOpenNestedDiagram(label, newMid),
                    },
                })
            );
            setEdges((eds) => addEdge({ id: eid, source: srcUid, target: uid, ...flowEdgeProps }, eds));

            let next = insertTopologyEdgeLine(code, srcMid, newMid, '-->', label);
            next = upsertNodeDirective(next, newMid, { uid, x, y });
            next = upsertEdgeDirective(next, eid, { source: srcMid, target: newMid });

            editSourceRef.current = 'graph';
            setCode(next);
        },
        [code, project, mermaidIdOf, setNodes, setEdges, applyNodePatch, createAndOpenNestedDiagram, flowEdgeProps]
    );

    // Drag an existing edge endpoint onto a different node.
    const onEdgeUpdate = useCallback(
        (oldEdge: Edge, conn: Connection) => {
            if (!conn.source || !conn.target || conn.source === conn.target) return;
            const store = storeRef.current;
            const eid = oldEdge.id as EID;
            const oldSrc = mermaidIdOf(oldEdge.source);
            const oldTgt = mermaidIdOf(oldEdge.target);
            const newSrc = mermaidIdOf(conn.source);
            const newTgt = mermaidIdOf(conn.target);

            // The live parser keys edges by pair, so it cannot hold a parallel
            // edge. If the destination pair is already connected, reject the
            // reconnect (no-op) rather than create an unrepresentable duplicate.
            if ((newSrc !== oldSrc || newTgt !== oldTgt) && hasTopologyEdge(code, newSrc, newTgt)) {
                return;
            }

            upsertEdgeWithEid(store, eid, conn.source as UID, conn.target as UID);
            setEdges((eds) => updateEdge(oldEdge, conn, eds));

            let next = replaceTopologyEdgeLine(code, oldSrc, oldTgt, newSrc, newTgt, '-->');
            next = upsertEdgeDirective(next, eid, { source: newSrc, target: newTgt });

            editSourceRef.current = 'graph';
            setCode(next);
        },
        [code, mermaidIdOf, setEdges]
    );

    // Delete an edge (React Flow already removed it from flow state).
    const onEdgesDelete = useCallback(
        (deleted: Edge[]) => {
            const store = storeRef.current;
            let next = code;
            for (const e of deleted) {
                next = removeTopologyEdgeLine(next, mermaidIdOf(e.source), mermaidIdOf(e.target));
                next = removeEdgeDirective(next, e.id);
                deleteEdge(store, e.id as EID);
            }
            editSourceRef.current = 'graph';
            setCode(next);
        },
        [code, mermaidIdOf]
    );

    // Delete a node: drop its standalone declaration + @node directive.
    // (React Flow removes connected edges and fires onEdgesDelete separately.)
    const onNodesDelete = useCallback(
        (deleted: Node[]) => {
            let next = code;
            for (const n of deleted) {
                const mid = mermaidIdOf(n.id);
                next = removeNodeDeclaration(next, mid);
                next = removeNodeDirective(next, mid);
            }
            editSourceRef.current = 'graph';
            setCode(next);
        },
        [code, mermaidIdOf]
    );

    // --- Creation drawer (P3): everything inserted is just mermaidman text ---

    // A flow-space point near the viewport center, nudged each call so repeated
    // inserts don't stack exactly on top of one another.
    const nextInsertOrigin = useCallback(() => {
        const n = insertCountRef.current++;
        const base = project({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        const jitter = (n % 6) * 28;
        return { x: Math.round(base.x - 90 + jitter), y: Math.round(base.y - 40 + jitter) };
    }, [project]);

    // Insert a single node (from the Shapes / Nodes tabs).
    const insertNode = useCallback(
        (opts: InsertNodeOpts) => {
            const store = storeRef.current;
            const uid = newUid();
            const mid = nextMermaidId(Object.values(store.alias.uidToMermaidId));
            const label = opts.label ?? 'Node';
            const { x, y } = nextInsertOrigin();

            let next = insertNodeDeclaration(code, mid, label);
            next = upsertNodeDirective(next, mid, {
                uid,
                x,
                y,
                ...(opts.kind ? { kind: opts.kind } : {}),
            });
            if (opts.shape && opts.shape !== 'rect') {
                next = setNodeShape(next, mid, opts.shape, label);
            }
            editSourceRef.current = 'text';
            setCode(next);
        },
        [code, nextInsertOrigin]
    );

    // Insert a template (multi-node snippet). Parse it, remap its ids to fresh
    // ones, offset to the viewport, and write nodes + edges as new text.
    const insertSnippet = useCallback(
        (snippet: string) => {
            if (!parse_mermaidman) return;
            let parsed: { nodes?: any[]; edges?: any[] };
            try {
                parsed = parse_mermaidman(snippet) as any;
            } catch {
                return;
            }
            const store = storeRef.current;
            const taken = new Set(Object.values(store.alias.uidToMermaidId));
            const remap: Record<string, string> = {};
            const origin = nextInsertOrigin();
            let next = code;

            (parsed.nodes ?? []).forEach((n: any, i: number) => {
                const mid = nextMermaidId([...taken]);
                taken.add(mid);
                remap[n.id] = mid;
                const label = n.label ?? mid;
                const x = Math.round(origin.x + (typeof n.x === 'number' ? n.x : i * 180));
                const y = Math.round(origin.y + (typeof n.y === 'number' ? n.y : 0));
                next = insertNodeDeclaration(next, mid, label);
                next = upsertNodeDirective(next, mid, { uid: newUid(), x, y });
                if (n.shape && n.shape !== 'rect') {
                    next = setNodeShape(next, mid, n.shape, label);
                }
            });

            (parsed.edges ?? []).forEach((e: any) => {
                const s = remap[e.source];
                const t = remap[e.target];
                if (!s || !t) return;
                next = insertTopologyEdgeLine(next, s, t, '-->');
                next = upsertEdgeDirective(next, newEid(), {
                    source: s,
                    target: t,
                    ...(e.label ? { label: e.label } : {}),
                });
            });

            editSourceRef.current = 'text';
            setCode(next);
            setDrawerOpen(false);
        },
        [code, parse_mermaidman, nextInsertOrigin]
    );

    // Insert a media node (from a pasted URL or a Giphy result).
    const insertMedia = useCallback(
        (src: string, alt?: string) => {
            if (!src) return;
            const store = storeRef.current;
            const uid = newUid();
            const mid = nextMermaidId(Object.values(store.alias.uidToMermaidId));
            const label = alt || 'Image';
            const { x, y } = nextInsertOrigin();
            let next = insertNodeDeclaration(code, mid, label);
            next = upsertNodeDirective(next, mid, {
                uid,
                x,
                y,
                kind: 'media',
                media: { src, alt: alt || '' },
            });
            editSourceRef.current = 'text';
            setCode(next);
            setDrawerOpen(false);
        },
        [code, nextInsertOrigin]
    );

    // --- AI co-authoring (P5): results round-trip to text + @ai provenance ---
    const runAi = useCallback(
        async (action: 'summarize' | 'expand' | 'todiagram') => {
            if (!selectedNode) return;
            const store = storeRef.current;
            const srcUid = selectedNode.id as UID;
            const srcMid = selectedNode.data?.mermaidId ?? selectedNode.id;
            const label = selectedNode.data?.label ?? srcMid;
            const meta = (selectedNode.data?.meta ?? {}) as NodeMeta;
            const content = [
                typeof meta.markdown === 'string' ? meta.markdown : '',
                typeof (meta.code as CodeMeta | undefined)?.content === 'string'
                    ? (meta.code as CodeMeta).content
                    : '',
            ]
                .filter(Boolean)
                .join('\n');

            setAiError(null);
            setAiBusy(action);
            try {
                const res = await fetch('/api/ai', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ action, label, content }),
                });
                const json = (await res.json()) as { result?: any; model?: string; error?: string };
                if (json.error) {
                    setAiError(json.error);
                    return;
                }
                const model = json.model ?? 'claude';
                const ts = Date.now();
                const origin = nextInsertOrigin();
                let next = code;

                if (action === 'summarize') {
                    const summary: string = json.result?.summary ?? '';
                    if (!summary) { setAiError('Empty summary.'); return; }
                    const uid = newUid();
                    const mid = nextMermaidId(Object.values(store.alias.uidToMermaidId));
                    const eid = newEid();
                    next = insertNodeDeclaration(next, mid, 'Summary');
                    next = upsertNodeDirective(next, mid, {
                        uid, x: origin.x, y: origin.y, kind: 'note', markdown: summary,
                    });
                    next = insertTopologyEdgeLine(next, srcMid, mid, '-->');
                    next = upsertEdgeDirective(next, eid, { source: srcMid, target: mid });
                    next = upsertAiDirective(next, mid, { action, model, ts, of: srcMid });
                } else if (action === 'expand') {
                    const items: string[] = Array.isArray(json.result?.items) ? json.result.items : [];
                    if (!items.length) { setAiError('No sub-topics returned.'); return; }
                    const taken = new Set(Object.values(store.alias.uidToMermaidId));
                    items.slice(0, 6).forEach((item, i) => {
                        const lbl = String(item).slice(0, 60) || 'Topic';
                        const mid = nextMermaidId([...taken]);
                        taken.add(mid);
                        const uid = newUid();
                        const eid = newEid();
                        next = insertNodeDeclaration(next, mid, lbl);
                        next = upsertNodeDirective(next, mid, {
                            uid, x: origin.x + 200, y: origin.y + (i - items.length / 2) * 90,
                        });
                        next = insertTopologyEdgeLine(next, srcMid, mid, '-->');
                        next = upsertEdgeDirective(next, eid, { source: srcMid, target: mid });
                    });
                    next = upsertAiDirective(next, srcMid, { action, model, ts, count: items.length });
                } else {
                    // todiagram: attach the generated flowchart as the node's nested diagram
                    const mermaid: string = json.result?.mermaid ?? '';
                    if (!mermaid) { setAiError('No diagram returned.'); return; }
                    next = upsertNodeDirective(next, srcMid, {
                        kind: 'diagram',
                        diagram: { title: label, mermaidman: mermaid },
                    });
                    next = upsertAiDirective(next, srcMid, { action, model, ts });
                }

                editSourceRef.current = 'text';
                setCode(next);
            } catch {
                setAiError('Could not reach the AI service.');
            } finally {
                setAiBusy(null);
            }
        },
        [selectedNode, code, nextInsertOrigin]
    );

    const selectedMeta = (selectedNode?.data?.meta ?? {}) as NodeMeta;
    const selectedKind =
        typeof selectedMeta.kind === 'string' ? selectedMeta.kind : selectedNode?.data?.kind;
    const selectedDiagram = selectedMeta.diagram as DiagramMeta | undefined;
    const selectedCode = selectedMeta.code as CodeMeta | undefined;
    const selectedMedia = selectedMeta.media as MediaMeta | undefined;
    const selectedMarkdown = selectedMeta.markdown as string | undefined;

    const breadcrumbItems = useMemo<BreadcrumbItem[]>(
        () =>
            breadcrumbs.map((label, index) => ({
                label,
                onClick: index < breadcrumbs.length - 1 ? () => navigateToBreadcrumb(index) : undefined,
            })),
        [breadcrumbs, navigateToBreadcrumb]
    );

    if (!isReady) {
        return (
            <div className="flex items-center justify-center h-screen bg-white">
                <div className="animate-pulse font-mono text-lg">Initializing Rust Engine...</div>
            </div>
        );
    }

    const canNavigateUp = diagramStack.length > 0;

    return (
        <div className="relative h-screen w-full overflow-hidden bg-background text-foreground font-sans">
            <ProjectSidebar />
            {/* Top Bar (Floating) */}
            <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2 panel-base px-4 py-2">
                    <Button
                        type="button"
                        onClick={navigateUp}
                        disabled={!canNavigateUp}
                        size="sm"
                        variant="ghost"
                        color="black"
                        className="!p-1"
                    >
                        ←
                    </Button>
                    <Breadcrumbs items={breadcrumbItems} className="text-sm font-medium" />
                    <div className="h-4 w-[1px] bg-border mx-2" />
                    <Badge variant="outline" color="blue" size="sm">
                        {canNavigateUp ? "Sub-graph" : "Root"}
                    </Badge>
                </div>

                <div className="pointer-events-auto flex items-center gap-2 panel-base px-2 py-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={undo}
                        disabled={!activeFileId || !history[activeFileId]?.past?.length}
                        title="Undo (Ctrl+Z)"
                    >
                        ↶
                    </Button>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={redo}
                        disabled={!activeFileId || !history[activeFileId]?.future?.length}
                        title="Redo (Ctrl+Shift+Z)"
                    >
                        ↷
                    </Button>
                    <div className="h-4 w-[1px] bg-border mx-1" />
                    <Button size="sm" variant="ghost">Share</Button>
                    <Button size="sm" variant="solid" color="blue" onClick={() => {
                        const content = exportToMermaid(files);
                        const blob = new Blob([content], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${activeFile?.title || 'diagram'}.mmd`;
                        a.click();
                        URL.revokeObjectURL(url);
                    }}>Export</Button>
                </div>
            </div>

            {/* Main Canvas */}
            <div className="absolute inset-0 z-0 bg-background canvas-grid">
                {/* Custom edge markers for circle/cross arrowheads */}
                <svg className="absolute h-0 w-0" aria-hidden="true">
                    <defs>
                        <marker
                            id="mm-marker-circle"
                            viewBox="0 0 10 10"
                            refX="5"
                            refY="5"
                            markerWidth="6"
                            markerHeight="6"
                            orient="auto-start-reverse"
                        >
                            <circle cx="5" cy="5" r="3.5" fill={EDGE_STROKE} />
                        </marker>
                        <marker
                            id="mm-marker-cross"
                            viewBox="0 0 10 10"
                            refX="5"
                            refY="5"
                            markerWidth="7"
                            markerHeight="7"
                            orient="auto-start-reverse"
                        >
                            <path
                                d="M2,2 L8,8 M8,2 L2,8"
                                stroke={EDGE_STROKE}
                                strokeWidth="1.6"
                                strokeLinecap="round"
                            />
                        </marker>
                    </defs>
                </svg>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={NODE_TYPES}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeDragStop={onNodeDragStop}
                    onConnect={onConnect}
                    onConnectStart={onConnectStart}
                    onConnectEnd={onConnectEnd}
                    onEdgeUpdate={onEdgeUpdate}
                    onEdgesDelete={onEdgesDelete}
                    onNodesDelete={onNodesDelete}
                    isValidConnection={isValidConnection}
                    connectionMode={ConnectionMode.Loose}
                    connectionLineComponent={SmoothConnectionLine}
                    onNodeClick={(_event, node) => setSelectedNodeId(node.id)}
                    onNodeDoubleClick={(_event, node) => {
                        const data = (node as Node<MermaidNodeData>).data;
                        if (data?.meta?.diagram) {
                            openNestedDiagram(data.label, data.mermaidId, data.meta.diagram as DiagramMeta);
                        }
                    }}
                    onPaneClick={() => setSelectedNodeId(null)}
                    fitView
                    minZoom={0.1}
                    maxZoom={4}
                >
                    <Background color="var(--color-canvas-dot)" gap={20} size={1} variant={BackgroundVariant.Dots} />
                    <Controls className="!m-4 !panel-base !border-none !text-foreground !fill-foreground" />
                </ReactFlow>
            </div>

            {/* Creation drawer (Insert panel) */}
            <CreationDrawer
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onInsertSnippet={insertSnippet}
                onInsertNode={insertNode}
                onInsertMedia={insertMedia}
            />

            {/* Bottom Toolbar (Floating) */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                <div className="panel-base px-2 py-2 flex items-center gap-1">
                    <Button
                        variant={drawerOpen ? 'solid' : 'ghost'}
                        color="blue"
                        size="icon"
                        className="rounded-md active:scale-95 transition-transform duration-150 ease-[cubic-bezier(0.32,0.72,0,1)]"
                        title="Insert (templates, shapes, nodes)"
                        onClick={() => setDrawerOpen((v) => !v)}
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    <div className="h-6 w-[1px] bg-border mx-1" />
                    <Button variant="ghost" size="icon" className="rounded-md hover:bg-muted active:scale-95 transition-transform duration-150 ease-[cubic-bezier(0.32,0.72,0,1)]" title="Select (V)">
                        <MousePointer2 className="h-4 w-4" />
                    </Button>
                    <div className="h-6 w-[1px] bg-border mx-1" />
                    <Button variant="ghost" size="icon" className="rounded-md hover:bg-muted active:scale-95 transition-transform duration-150 ease-[cubic-bezier(0.32,0.72,0,1)]" title="Rectangle (R)">
                        <Square className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-md hover:bg-muted active:scale-95 transition-transform duration-150 ease-[cubic-bezier(0.32,0.72,0,1)]" title="Text (T)">
                        <Type className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-md hover:bg-muted active:scale-95 transition-transform duration-150 ease-[cubic-bezier(0.32,0.72,0,1)]" title="Connect (C)">
                        <Spline className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Left Drawer (Code) - Collapsible/Floating */}
            <div className="absolute top-20 left-4 bottom-20 z-40 pointer-events-auto w-[350px] flex flex-col gap-2 transition-transform duration-200">
                <Card padding="none" className="flex-1 flex flex-col shadow-overlay border-border/50 bg-card/95 backdrop-blur-xl">
                    <CardHeader className="border-b border-border px-4 py-3 flex flex-row items-center justify-between">
                        <div className="text-sm font-semibold tracking-tight">Source</div>
                        <Badge variant="outline" size="sm" className="font-mono text-[10px]">{isReady ? 'WASM Ready' : 'Loading...'}</Badge>
                    </CardHeader>
                    <CardContent className="flex-1 p-0 relative group">
                        <textarea
                            value={code}
                            onChange={(e) => {
                                editSourceRef.current = 'text';
                                setCode(e.target.value);
                            }}
                            className="absolute inset-0 w-full h-full resize-none bg-transparent p-4 font-mono text-xs leading-relaxed outline-none text-foreground/90 selection:bg-primary/20"
                            spellCheck={false}
                            placeholder="graph TD..."
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Right Panel (Inspector) - Context Aware */}
            {selectedNode && (
                <div className="absolute top-20 right-4 w-[300px] z-40 pointer-events-auto animate-in slide-in-from-right-4 fade-in duration-200">
                    <Card padding="none" className="shadow-overlay border-border/50 bg-card/95 backdrop-blur-xl">
                        <CardHeader className="border-b border-border px-4 py-3">
                            <CardTitle className="text-sm font-semibold">Properties</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <span>ID</span>
                                    <span className="font-mono text-foreground truncate text-right">{selectedNode?.data?.mermaidId}</span>
                                </div>
                                <Divider />
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Type</label>
                                    <select
                                        value={selectedKind ?? ''}
                                        onChange={(e) => {
                                            const value = e.target.value || undefined;
                                            updateSelectedNodeMeta({ kind: value });
                                        }}
                                        className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-ring"
                                    >
                                        <option value="">Default</option>
                                        <option value="card">Card</option>
                                        <option value="note">Note</option>
                                        <option value="code">Code Block</option>
                                        <option value="markdown">Markdown</option>
                                        <option value="media">Image</option>
                                        <option value="oembed">Embed/Video</option>
                                        <option value="diagram">Nested Diagram</option>
                                        <option value="text">Text</option>
                                        <option value="image">Image</option>
                                        <option value="embed">Embed</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground">Shape</label>
                                    <select
                                        value={(selectedNode?.data?.shape as string) ?? 'rect'}
                                        onChange={(e) => updateSelectedNodeShape(e.target.value)}
                                        className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs focus:ring-1 focus:ring-ring"
                                    >
                                        {SHAPE_OPTIONS.map((opt) => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Divider />

                                {/* Style — round-trips into the @node `style` directive */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-medium text-muted-foreground">Style</label>
                                        <button
                                            type="button"
                                            className="text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                                            onClick={() => {
                                                setStyleDraft({});
                                                // Explicit undefined per key — the directive merge is a
                                                // deep merge, so an empty object would keep old values.
                                                updateSelectedNodeMeta({
                                                    style: {
                                                        fill: undefined,
                                                        stroke: undefined,
                                                        strokeWidth: undefined,
                                                        opacity: undefined,
                                                        radius: undefined,
                                                    },
                                                });
                                            }}
                                        >
                                            Reset
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                            Fill
                                            <input
                                                type="color"
                                                value={styleDraft.fill ?? '#ffffff'}
                                                onChange={(e) => applyStyle({ fill: e.target.value })}
                                                className="h-6 w-8 cursor-pointer rounded border border-input bg-transparent p-0"
                                            />
                                        </label>
                                        <label className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                            Border
                                            <input
                                                type="color"
                                                value={styleDraft.stroke ?? '#e4e4e7'}
                                                onChange={(e) => applyStyle({ stroke: e.target.value })}
                                                className="h-6 w-8 cursor-pointer rounded border border-input bg-transparent p-0"
                                            />
                                        </label>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                            <span>Border width</span><span>{styleDraft.strokeWidth ?? 1}px</span>
                                        </div>
                                        <input
                                            type="range" min={0} max={6} step={1}
                                            value={styleDraft.strokeWidth ?? 1}
                                            onChange={(e) => applyStyle({ strokeWidth: Number(e.target.value) })}
                                            className="w-full accent-primary"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                            <span>Corner radius</span><span>{styleDraft.radius ?? 8}px</span>
                                        </div>
                                        <input
                                            type="range" min={0} max={28} step={1}
                                            value={styleDraft.radius ?? 8}
                                            onChange={(e) => applyStyle({ radius: Number(e.target.value) })}
                                            className="w-full accent-primary"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                            <span>Opacity</span><span>{Math.round((styleDraft.opacity ?? 1) * 100)}%</span>
                                        </div>
                                        <input
                                            type="range" min={20} max={100} step={1}
                                            value={Math.round((styleDraft.opacity ?? 1) * 100)}
                                            onChange={(e) => applyStyle({ opacity: Number(e.target.value) / 100 })}
                                            className="w-full accent-primary"
                                        />
                                    </div>
                                </div>

                                <Divider />

                                {/* AI co-authoring — results write back to text + @ai provenance */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                        <Sparkles className="h-3.5 w-3.5 text-primary" /> AI
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {([
                                            { action: 'summarize', label: 'Summarize', icon: <Sparkles className="h-3.5 w-3.5" /> },
                                            { action: 'expand', label: 'Expand', icon: <ListTree className="h-3.5 w-3.5" /> },
                                            { action: 'todiagram', label: 'Diagram', icon: <Network className="h-3.5 w-3.5" /> },
                                        ] as const).map((a) => (
                                            <button
                                                key={a.action}
                                                type="button"
                                                disabled={aiBusy !== null}
                                                onClick={() => runAi(a.action)}
                                                className="flex flex-col items-center gap-1 rounded-md border border-border/60 bg-background px-1.5 py-2 text-[10px] font-medium text-foreground transition-all duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-primary/50 hover:bg-muted active:scale-[0.97] disabled:opacity-50"
                                            >
                                                {aiBusy === a.action ? <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> : <span className="text-primary">{a.icon}</span>}
                                                {a.label}
                                            </button>
                                        ))}
                                    </div>
                                    {aiError && (
                                        <div className="rounded-md border border-border/60 bg-muted/40 p-2 text-[10px] text-muted-foreground">
                                            {aiError.includes('ANTHROPIC_API_KEY')
                                                ? 'AI needs an Anthropic key — set ANTHROPIC_API_KEY in apps/web/.env.local.'
                                                : aiError}
                                        </div>
                                    )}
                                </div>

                                {/* Dynamic Inspector Content based on Kind */}
                                {selectedKind === 'markdown' && (
                                    <div className="space-y-3 pt-2">
                                        <label className="text-xs font-medium text-muted-foreground">Markdown Content</label>
                                        <Textarea
                                            value={selectedMarkdown ?? ''}
                                            onChange={(e) =>
                                                updateSelectedNodeMeta({ kind: 'markdown', markdown: e.target.value })
                                            }
                                            className="min-h-[120px] text-xs font-mono"
                                            placeholder="# Heading&#10;Content..."
                                        />
                                    </div>
                                )}

                                {(selectedKind === 'media' || selectedKind === 'oembed') && (
                                    <div className="space-y-3 pt-2">
                                        <label className="text-xs font-medium text-muted-foreground">Source URL</label>
                                        <Input
                                            value={selectedMedia?.src ?? ''}
                                            onChange={(e) =>
                                                updateSelectedNodeMeta({
                                                    kind: selectedKind,
                                                    media: { ...selectedMedia, src: e.target.value }
                                                })
                                            }
                                            size="sm"
                                            placeholder="https://..."
                                            className="h-8 text-xs font-mono"
                                        />
                                        <label className="text-xs font-medium text-muted-foreground">Alt Text / Title</label>
                                        <Input
                                            value={selectedMedia?.alt ?? ''}
                                            onChange={(e) =>
                                                updateSelectedNodeMeta({
                                                    kind: selectedKind,
                                                    media: { ...selectedMedia, alt: e.target.value }
                                                })
                                            }
                                            size="sm"
                                            placeholder="Description..."
                                            className="h-8 text-xs"
                                        />
                                    </div>
                                )}
                                {(selectedKind === 'diagram' || selectedDiagram?.mermaidman) && (
                                    <div className="space-y-3 pt-2">
                                        <label className="text-xs font-medium text-muted-foreground">Diagram Settings</label>
                                        <Input
                                            value={selectedDiagram?.title ?? ''}
                                            onChange={(e) => updateSelectedNodeMeta({ diagram: { title: e.target.value } })}
                                            size="sm"
                                            placeholder="Title"
                                            className="h-8 text-xs"
                                        />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => selectedDiagram?.mermaidman && openNestedDiagram(selectedNode?.data?.label, selectedNode?.data?.mermaidId ?? selectedNode?.id, selectedDiagram)}
                                                disabled={!selectedDiagram?.mermaidman}
                                            >
                                                Open
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => createAndOpenNestedDiagram(selectedNode?.data?.label, selectedNode?.data?.mermaidId ?? selectedNode?.id)}
                                            >
                                                New
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}

export default function MermaidEditor() {
    return (
        <ReactFlowProvider>
            <MermaidEditorContent />
        </ReactFlowProvider>
    );
}
