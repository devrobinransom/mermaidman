import React, { useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import {
    LayoutTemplate, Shapes, Square, StickyNote, Code2, FileText,
    Image as ImageIcon, Network, X, Diamond, Circle, Hexagon, Cylinder,
    Search, Loader2, Plus,
} from 'lucide-react';

export type InsertNodeOpts = { kind?: string; shape?: string; label?: string };

interface CreationDrawerProps {
    open: boolean;
    onClose: () => void;
    onInsertSnippet: (text: string) => void;
    onInsertNode: (opts: InsertNodeOpts) => void;
    onInsertMedia: (src: string, alt?: string) => void;
}

type GiphyResult = { id: string; title: string; preview?: string; full?: string };

// Templates are just mermaidman text — topology + position directives. Node ids
// are remapped to fresh ones on insert, so any starting letters are fine.
const TEMPLATES: { name: string; desc: string; text: string }[] = [
    {
        name: 'Linear flow',
        desc: '3-step process',
        text: `graph TD
A[Start] --> B[Process] --> C[Done]
%% @node: A { x: 0, y: 0 }
%% @node: B { x: 200, y: 0 }
%% @node: C { x: 400, y: 0 }`,
    },
    {
        name: 'Decision',
        desc: 'Yes / No branch',
        text: `graph TD
A[Input] --> B{OK?}
B -->|Yes| C[Accept]
B -->|No| D[Reject]
%% @node: A { x: 0, y: 0 }
%% @node: B { x: 220, y: 0 }
%% @node: C { x: 460, y: -70 }
%% @node: D { x: 460, y: 70 }`,
    },
    {
        name: 'Org chart',
        desc: 'Root + 3 reports',
        text: `graph TD
A([Lead]) --> B[Member 1]
A --> C[Member 2]
A --> D[Member 3]
%% @node: A { x: 200, y: 0 }
%% @node: B { x: 0, y: 140 }
%% @node: C { x: 200, y: 140 }
%% @node: D { x: 400, y: 140 }`,
    },
    {
        name: 'Pipeline',
        desc: '4-stage pipeline',
        text: `graph TD
A[(Source)] --> B[Transform] --> C[Validate] --> D[(Sink)]
%% @node: A { x: 0, y: 0 }
%% @node: B { x: 190, y: 0 }
%% @node: C { x: 380, y: 0 }
%% @node: D { x: 570, y: 0 }`,
    },
];

const SHAPES: { value: string; label: string; icon: React.ReactNode }[] = [
    { value: 'rect', label: 'Rectangle', icon: <Square className="h-4 w-4" /> },
    { value: 'rhombus', label: 'Diamond', icon: <Diamond className="h-4 w-4" /> },
    { value: 'circle', label: 'Circle', icon: <Circle className="h-4 w-4" /> },
    { value: 'hexagon', label: 'Hexagon', icon: <Hexagon className="h-4 w-4" /> },
    { value: 'stadium', label: 'Stadium', icon: <Square className="h-4 w-4 rounded-full" /> },
    { value: 'cylinder', label: 'Cylinder', icon: <Cylinder className="h-4 w-4" /> },
];

const KINDS: { value: string; label: string; icon: React.ReactNode }[] = [
    { value: '', label: 'Card', icon: <Square className="h-4 w-4" /> },
    { value: 'note', label: 'Note', icon: <StickyNote className="h-4 w-4" /> },
    { value: 'code', label: 'Code', icon: <Code2 className="h-4 w-4" /> },
    { value: 'markdown', label: 'Markdown', icon: <FileText className="h-4 w-4" /> },
    { value: 'media', label: 'Image', icon: <ImageIcon className="h-4 w-4" /> },
    { value: 'diagram', label: 'Nested', icon: <Network className="h-4 w-4" /> },
];

type Tab = 'templates' | 'shapes' | 'nodes' | 'media';

export function CreationDrawer({ open, onClose, onInsertSnippet, onInsertNode, onInsertMedia }: CreationDrawerProps) {
    const [tab, setTab] = useState<Tab>('templates');
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<GiphyResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [mediaError, setMediaError] = useState<string | null>(null);
    const [urlInput, setUrlInput] = useState('');

    // Debounced Giphy search (trending when query is empty). Only runs on the
    // media tab so we don't hit the proxy needlessly.
    useEffect(() => {
        if (!open || tab !== 'media') return;
        let cancelled = false;
        setLoading(true);
        const handle = setTimeout(async () => {
            try {
                const res = await fetch(`/api/giphy?q=${encodeURIComponent(query)}`);
                const json = (await res.json()) as { data?: GiphyResult[]; error?: string };
                if (cancelled) return;
                setResults(json.data ?? []);
                setMediaError(json.error ?? null);
            } catch {
                if (!cancelled) setMediaError('Could not reach the media service.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        }, 350);
        return () => {
            cancelled = true;
            clearTimeout(handle);
        };
    }, [open, tab, query]);

    if (!open) return null;

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'templates', label: 'Templates', icon: <LayoutTemplate className="h-3.5 w-3.5" /> },
        { id: 'shapes', label: 'Shapes', icon: <Shapes className="h-3.5 w-3.5" /> },
        { id: 'nodes', label: 'Nodes', icon: <Square className="h-3.5 w-3.5" /> },
        { id: 'media', label: 'Media', icon: <ImageIcon className="h-3.5 w-3.5" /> },
    ];

    const itemClass =
        'flex flex-col items-start gap-1 rounded-lg border border-border/60 bg-background p-3 text-left transition-all duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-primary/50 hover:bg-muted active:scale-[0.98]';

    return (
        <div className="absolute bottom-24 left-1/2 z-50 w-[460px] -translate-x-1/2 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="panel-base flex flex-col overflow-hidden">
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                    <div className="flex items-center gap-1">
                        {tabs.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                onClick={() => setTab(t.id)}
                                className={cn(
                                    'flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                                    tab === t.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                                )}
                            >
                                {t.icon}
                                {t.label}
                            </button>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        aria-label="Close insert panel"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="max-h-[320px] overflow-y-auto p-3">
                    {tab === 'templates' && (
                        <div className="grid grid-cols-2 gap-2">
                            {TEMPLATES.map((tpl) => (
                                <button key={tpl.name} type="button" className={itemClass} onClick={() => onInsertSnippet(tpl.text)}>
                                    <div className="flex items-center gap-1.5 text-sm font-semibold">
                                        <LayoutTemplate className="h-4 w-4 text-primary" />
                                        {tpl.name}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground">{tpl.desc}</div>
                                </button>
                            ))}
                        </div>
                    )}

                    {tab === 'shapes' && (
                        <div className="grid grid-cols-3 gap-2">
                            {SHAPES.map((s) => (
                                <button
                                    key={s.value}
                                    type="button"
                                    className={cn(itemClass, 'items-center')}
                                    onClick={() => onInsertNode({ shape: s.value, label: s.label })}
                                >
                                    <span className="text-primary">{s.icon}</span>
                                    <span className="text-[11px] font-medium">{s.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {tab === 'nodes' && (
                        <div className="grid grid-cols-3 gap-2">
                            {KINDS.map((k) => (
                                <button
                                    key={k.label}
                                    type="button"
                                    className={cn(itemClass, 'items-center')}
                                    onClick={() => onInsertNode({ kind: k.value || undefined, label: k.label })}
                                >
                                    <span className="text-primary">{k.icon}</span>
                                    <span className="text-[11px] font-medium">{k.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {tab === 'media' && (
                        <div className="space-y-3">
                            {/* Paste-a-URL — works with no API key */}
                            <form
                                className="flex items-center gap-2"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const src = urlInput.trim();
                                    if (src) {
                                        onInsertMedia(src);
                                        setUrlInput('');
                                    }
                                }}
                            >
                                <input
                                    value={urlInput}
                                    onChange={(e) => setUrlInput(e.target.value)}
                                    placeholder="Paste an image / GIF URL…"
                                    className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
                                />
                                <button
                                    type="submit"
                                    className="flex h-8 items-center gap-1 rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground active:scale-[0.98] transition-transform"
                                >
                                    <Plus className="h-3.5 w-3.5" /> Add
                                </button>
                            </form>

                            {/* Giphy search */}
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search GIFs (Giphy)…"
                                    className="h-8 w-full rounded-md border border-input bg-background pl-8 pr-2 text-xs outline-none focus:ring-1 focus:ring-ring"
                                />
                            </div>

                            {loading && (
                                <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                                </div>
                            )}

                            {!loading && mediaError && (
                                <div className="rounded-md border border-border/60 bg-muted/40 p-3 text-[11px] text-muted-foreground">
                                    {mediaError.includes('GIPHY_API_KEY')
                                        ? 'GIF search needs a Giphy key — set GIPHY_API_KEY in apps/web/.env.local. Pasting a URL above works without one.'
                                        : `Couldn't load GIFs: ${mediaError}. You can still paste a URL above.`}
                                </div>
                            )}

                            {!loading && !mediaError && results.length > 0 && (
                                <div className="grid grid-cols-3 gap-2">
                                    {results.map((g) => (
                                        <button
                                            key={g.id}
                                            type="button"
                                            title={g.title}
                                            className="group relative aspect-square overflow-hidden rounded-md border border-border/60 bg-muted active:scale-[0.98] transition-transform"
                                            onClick={() => onInsertMedia(g.full ?? g.preview ?? '', g.title)}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={g.preview}
                                                alt={g.title}
                                                className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
