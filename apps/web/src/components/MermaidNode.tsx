
import React from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Card } from '@/components/radical-ai-studio-kit/radical-ai-studio-kit/ui/Card';
import { Badge } from '@/components/radical-ai-studio-kit/radical-ai-studio-kit/ui/Badge';
import { Input } from '@/components/radical-ai-studio-kit/radical-ai-studio-kit/ui/Input';
import { Button } from '@/components/radical-ai-studio-kit/radical-ai-studio-kit/ui/Button';
import { Textarea } from '@/components/radical-ai-studio-kit/radical-ai-studio-kit/ui/Textarea';
import { cn } from '@/lib/utils';
import { type NodeMeta, type DiagramMeta, type CodeMeta, type MediaMeta, type MermaidNodeData, type NodeStyle } from '@/types/mermaid';

/** Translate a node's style directive into inline CSS overrides. */
function styleToCss(style?: NodeStyle): React.CSSProperties {
    const css: React.CSSProperties = {};
    if (!style) return css;
    if (style.fill) css.background = style.fill;
    if (style.stroke) css.borderColor = style.stroke;
    if (typeof style.strokeWidth === 'number') css.borderWidth = style.strokeWidth;
    if (typeof style.opacity === 'number') css.opacity = style.opacity;
    if (typeof style.radius === 'number') css.borderRadius = style.radius;
    return css;
}

// --- Mermaid topology shapes ---------------------------------------------
// Geometric shapes are rendered as a centered-label "glyph" via clip-path
// (they can't hold rich card content). Rounded shapes use border-radius so
// borders, shadows and the selection ring still work.

const CLIP_SHAPES: Record<string, string> = {
    rhombus: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
    hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
    parallelogram: 'polygon(18% 0%, 100% 0%, 82% 100%, 0% 100%)',
    parallelogram_alt: 'polygon(0% 0%, 82% 0%, 100% 100%, 18% 100%)',
    trapezoid: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)',
    trapezoid_alt: 'polygon(0% 0%, 100% 0%, 80% 100%, 20% 100%)',
    asymmetric: 'polygon(0% 0%, 88% 0%, 100% 50%, 88% 100%, 0% 100%)',
};

const ROUNDED_SHAPES: Record<string, string> = {
    stadium: 'rounded-full px-6 py-3 min-w-[110px]',
    circle: 'rounded-full aspect-square p-4 min-w-[88px] min-h-[88px]',
    doublecircle:
        'rounded-full aspect-square p-4 min-w-[88px] min-h-[88px] ring-1 ring-foreground/25 ring-offset-2 ring-offset-background',
    subroutine: 'rounded-md px-6 py-3 border-x-4 min-w-[120px]',
    cylinder: 'px-6 pt-5 pb-3 min-w-[110px] [border-radius:40%_40%_10px_10px/18px_18px_10px_10px]',
};

const GLYPH_SHAPES = new Set([...Object.keys(CLIP_SHAPES), ...Object.keys(ROUNDED_SHAPES)]);

function GlyphNode({ shape, label, selected, style }: { shape: string; label: string; selected?: boolean; style?: NodeStyle }) {
    const clip = CLIP_SHAPES[shape];
    if (clip) {
        // Padding-gap border trick: the outer fill shows through as a 2px edge
        // (a real border/ring would be clipped away by clip-path).
        const extraPad = shape === 'rhombus' || shape === 'hexagon' ? 'px-10 py-7' : 'px-9 py-5';
        return (
            <div
                style={{ clipPath: clip, opacity: style?.opacity, background: selected ? undefined : style?.stroke }}
                className={cn(
                    'mm-node-enter p-[2px] transition-colors duration-150 ease-[cubic-bezier(0.32,0.72,0,1)]',
                    selected ? 'bg-primary' : 'bg-border'
                )}
            >
                <div
                    style={{ clipPath: clip, background: style?.fill }}
                    className={cn(
                        'flex items-center justify-center bg-card text-center text-sm font-medium text-foreground',
                        extraPad
                    )}
                >
                    <span className="max-w-[180px] break-words leading-tight">{label}</span>
                </div>
            </div>
        );
    }
    return (
        <div
            style={styleToCss(style)}
            className={cn(
                'mm-node-enter flex items-center justify-center bg-card text-center text-sm font-medium text-foreground transition-all duration-150 ease-[cubic-bezier(0.32,0.72,0,1)]',
                ROUNDED_SHAPES[shape],
                selected
                    ? 'ring-2 ring-primary/60 ring-offset-1 ring-offset-background shadow-lg shadow-primary/10'
                    : 'border border-border/60 shadow-sm'
            )}
        >
            <span className="max-w-[180px] break-words leading-tight">{label}</span>
        </div>
    );
}

export function MermaidNode({ data, selected }: NodeProps<MermaidNodeData>) {
    const kind = data.kind ?? (typeof data.meta?.kind === 'string' ? data.meta?.kind : undefined);
    const hasDiagram = Boolean(data.meta?.diagram && typeof data.meta.diagram === 'object');
    const codePreview = data.codePreview;
    const childItems = data.childItems ?? [];
    const childCount = data.childCount ?? childItems.length;

    // Use a refined palette for "Whiteboard" aesthetic
    const isSpecialKind = kind && ['note', 'diagram', 'code', 'text', 'image', 'embed'].includes(kind);

    // Rich content (media/code/nested/etc.) overrides exotic shapes — you can't
    // fit a code preview in a diamond. Plain nodes get the true topology shape.
    const shape = data.shape;
    const hasRichContent = Boolean(
        codePreview ||
        data.diagramPreview ||
        (kind && ['note', 'code', 'markdown', 'media', 'oembed', 'text', 'image', 'embed', 'diagram'].includes(kind))
    );
    const isGlyph = Boolean(shape && GLYPH_SHAPES.has(shape) && !hasRichContent);

    const nodeStyle = data.meta?.style as NodeStyle | undefined;

    const handles = (
        <>
            <Handle
                type="target"
                position={Position.Left}
                className="!h-3 !w-3 !rounded-full !border-2 !border-primary !bg-white opacity-0 group-hover:opacity-100 transition-all duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] hover:!scale-125 hover:!bg-primary"
            />
            <Handle
                type="source"
                position={Position.Right}
                className="!h-3 !w-3 !rounded-full !border-2 !border-primary !bg-white opacity-0 group-hover:opacity-100 transition-all duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] hover:!scale-125 hover:!bg-primary"
            />
        </>
    );

    if (isGlyph) {
        return (
            <div className="relative group">
                {handles}
                <GlyphNode shape={shape!} label={data.label} selected={selected} style={nodeStyle} />
            </div>
        );
    }

    return (
        <div className="relative group">
            {handles}
            <Card
                padding="none"
                style={styleToCss(nodeStyle)}
                className={cn(
                    "min-w-[180px] max-w-[320px] transition-all duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] mm-node-enter",
                    // Topology shape (rounded variants only; geometric shapes render as glyphs)
                    shape === 'round' && "rounded-2xl",
                    // Glassmorphism and specialized styles based on kind
                    kind === 'note' ? "bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800" :
                        kind === 'code' ? "bg-slate-900 text-slate-50 border-slate-700" :
                            kind === 'markdown' ? "bg-white border-border/60" :
                                kind === 'media' ? "bg-transparent border-none shadow-none" :
                                    kind === 'oembed' ? "bg-transparent border-none shadow-none" :
                                        kind === 'text' ? "bg-white border-border/60" :
                                            kind === 'image' ? "bg-transparent border-none shadow-none" :
                                                kind === 'embed' ? "bg-transparent border-none shadow-none" :
                                                    "bg-card",

                    // Selection State — soft Apple-style ring, smoothly animated
                    selected
                        ? "ring-2 ring-primary/60 ring-offset-1 ring-offset-background shadow-lg shadow-primary/10"
                        : "shadow-sm hover:shadow-md border-border/60"
                )}
            >
                {/* Node Header - Hidden for purely visual nodes like media unless selected */}
                {(!['media', 'oembed', 'image', 'embed'].includes(kind ?? '') || selected) && (
                    <div className={cn(
                        "px-4 py-3 flex items-start justify-between gap-3",
                        kind === 'code' ? "border-b border-slate-800" : "border-b border-border/40",
                        (kind === 'media' || kind === 'oembed' || kind === 'image' || kind === 'embed') && "bg-background/80 backdrop-blur-sm rounded-t-lg border-b"
                    )}>
                        <div className="font-semibold text-sm leading-tight tracking-tight break-words max-w-full">
                            {data.label}
                        </div>
                        {isSpecialKind && (
                            <Badge
                                variant={kind === 'code' ? "solid" : "outline"}
                                color={kind === 'note' ? "yellow" : kind === 'code' ? "gray" : kind === 'text' ? "black" : kind === 'image' ? "purple" : kind === 'embed' ? "blue" : "blue"}
                                size="sm"
                                className="text-[10px] uppercase tracking-wider font-bold h-5 px-1.5"
                            >
                                {kind}
                            </Badge>
                        )}
                    </div>
                )}

                {/* Content Body */}
                <div className="p-1">
                    {/* Markup content */}
                    {kind === 'markdown' && data.meta?.markdown && (
                        <div className="px-4 py-3 text-xs leading-relaxed opacity-90 prose prose-xs dark:prose-invert max-w-none whitespace-pre-wrap">
                            {data.meta?.markdown}
                        </div>
                    )}

                    {/* Media content */}
                    {kind === 'media' && (data.meta?.media as MediaMeta | undefined)?.src && (
                        <div className="overflow-hidden rounded-md">
                            <img
                                src={(data.meta?.media as MediaMeta).src}
                                alt={(data.meta?.media as MediaMeta).alt || data.label}
                                className="w-full h-auto object-cover max-h-[300px]"
                            />
                        </div>
                    )}

                    {/* Embed content */}
                    {kind === 'oembed' && (data.meta?.media as MediaMeta | undefined)?.src && (
                        <div className="overflow-hidden rounded-md w-[300px] h-[170px] bg-black">
                            <iframe
                                src={(data.meta?.media as MediaMeta).src}
                                title={data.label}
                                className="w-full h-full border-0"
                                allowFullScreen
                            />
                        </div>
                    )}

                    {/* Text content */}
                    {kind === 'text' && data.meta?.markdown && (
                        <div className="px-4 py-3 text-xs leading-relaxed opacity-90 prose prose-xs dark:prose-invert max-w-none whitespace-pre-wrap">
                            {data.meta?.markdown}
                        </div>
                    )}

                    {/* Image content */}
                    {kind === 'image' && (data.meta?.media as MediaMeta | undefined)?.src && (
                        <div className="overflow-hidden rounded-md">
                            <img
                                src={(data.meta?.media as MediaMeta).src}
                                alt={(data.meta?.media as MediaMeta).alt || data.label}
                                className="w-full h-auto object-cover max-h-[300px]"
                            />
                        </div>
                    )}

                    {/* Embed content */}
                    {kind === 'embed' && (data.meta?.media as MediaMeta | undefined)?.src && (
                        <div className="overflow-hidden rounded-md w-[300px] h-[170px] bg-black">
                            <iframe
                                src={(data.meta?.media as MediaMeta).src}
                                title={data.label}
                                className="w-full h-full border-0"
                                allowFullScreen
                            />
                        </div>
                    )}

                    {/* Diagram Preview */}
                    {data.diagramPreview && (
                        <div className="mx-3 my-2 border border-border/50 bg-muted/30 rounded-md p-2 flex flex-col items-center justify-center gap-1.5 text-center">
                            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Nested System</div>
                            <div className="text-xs font-semibold text-foreground">{data.diagramPreview}</div>
                            {childItems.length > 0 && (
                                <div className="flex flex-wrap gap-1 justify-center mt-1">
                                    {childItems.map((item) => (
                                        <div key={item} className="px-1.5 py-0.5 bg-background rounded text-[10px] border border-border/50 text-muted-foreground">
                                            {item}
                                        </div>
                                    ))}
                                    {childCount > childItems.length && (
                                        <div className="px-1.5 py-0.5 text-[10px] text-muted-foreground italic">
                                            +{childCount - childItems.length}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Code Preview - Simplified for Card */}
                    {codePreview && (
                        <div className="mx-3 my-2 rounded-md bg-black/50 p-2 font-mono text-[10px] text-green-300 overflow-x-auto">
                            <pre>{codePreview}</pre>
                        </div>
                    )}

                    {/* Actions - appear on hover or selection */}
                    {(kind === 'diagram' || hasDiagram) && (selected) && (
                        <div className="px-3 pb-3 pt-1 flex gap-2 justify-end animate-in fade-in duration-200">
                            <Button
                                size="sm"
                                variant="solid"
                                color="blue"
                                className="h-7 text-xs"
                                onClick={(e) => { e.stopPropagation(); data.onOpenNested?.(); }}
                            >
                                Open
                            </Button>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
