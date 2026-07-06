
export type DiagramMeta = {
    title?: string;
    mermaidman?: string;
};

export type CodeMeta = {
    language?: string;
    content?: string;
};

export type MediaMeta = {
    src?: string;
    alt?: string;
    type?: 'image' | 'video' | 'embed';
};

export type NodeStyle = {
    stroke?: string;       // border color
    strokeWidth?: number;  // border width (px)
    fill?: string;         // background color
    opacity?: number;      // 0..1
    radius?: number;       // corner radius (px)
};

export type NodeMeta = {
    kind?: string;
    diagram?: DiagramMeta;
    code?: CodeMeta;
    media?: MediaMeta;
    markdown?: string; // Simple string content for now
    style?: NodeStyle;
    [key: string]: unknown;
};

export type UniversalNodeData = {
    kind: 'text' | 'diagram' | 'image' | 'embed' | 'code';
    content: string;
    metadata?: Record<string, unknown>;
};

export interface MermaidNodeData {
    label: string;
    mermaidId: string;
    hasPosition: boolean;
    meta?: NodeMeta;
    kind?: string;
    shape?: string;
    diagramPreview?: string;
    codePreview?: string;
    childItems?: string[];
    childCount?: number;
    onMetaChange?: (patch: Record<string, unknown>) => void;
    onOpenNested?: () => void;
    onCreateNested?: () => void;
}
