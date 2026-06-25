import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MermaidFile {
    id: string;
    title: string;
    content: string;
    createdAt: number;
    updatedAt: number;
}

interface FileStore {
    files: Record<string, MermaidFile>;
    activeFileId: string | null;
    history: Record<string, { past: string[]; future: string[]; lastPush: number }>;
    createFile: (title?: string, content?: string) => string;
    updateFile: (id: string, content: string) => void;
    updateFileTitle: (id: string, title: string) => void;
    deleteFile: (id: string) => void;
    setActiveFile: (id: string) => void;
    undo: () => void;
    redo: () => void;
}

const DEFAULT_CONTENT = `graph TD
    A[Start] --> B[Process]
    B --> C[End]
    %% @node: A { x: 100, y: 100 }
    %% @node: B { x: 300, y: 100 }
    %% @node: C { x: 500, y: 100 }
`;

export const useFileStore = create<FileStore>()(
    persist(
        (set, get) => ({
            files: {
                'default': {
                    id: 'default',
                    title: 'Untitled Diagram',
                    content: DEFAULT_CONTENT,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                }
            },
            activeFileId: 'default',

            history: {},

            createFile: (title = 'Untitled Diagram', content = DEFAULT_CONTENT) => {
                const id = crypto.randomUUID();
                set((state) => ({
                    files: {
                        ...state.files,
                        [id]: {
                            id,
                            title,
                            content,
                            createdAt: Date.now(),
                            updatedAt: Date.now(),
                        },
                    },
                    history: {
                        ...state.history,
                        [id]: { past: [], future: [], lastPush: Date.now() }
                    },
                    activeFileId: id,
                }));
                return id;
            },

            updateFile: (id, content) => {
                set((state) => {
                    const currentFile = state.files[id];
                    if (!currentFile) return state;

                    const history = state.history[id] || { past: [], future: [], lastPush: 0 };
                    const now = Date.now();
                    const newHistory = { ...history };

                    // Push to history if enough time passed or if it's the first edit
                    if (now - history.lastPush > 500 && currentFile.content !== content) {
                        newHistory.past = [...history.past, currentFile.content].slice(-50); // Limit 50
                        newHistory.future = []; // Clear redo on new change
                        newHistory.lastPush = now;
                    }

                    return {
                        files: {
                            ...state.files,
                            [id]: {
                                ...currentFile,
                                content,
                                updatedAt: now,
                            },
                        },
                        history: {
                            ...state.history,
                            [id]: newHistory
                        }
                    };
                });
            },

            updateFileTitle: (id, title) => {
                set((state) => ({
                    files: {
                        ...state.files,
                        [id]: {
                            ...state.files[id],
                            title,
                            updatedAt: Date.now(),
                        },
                    },
                }));
            },

            deleteFile: (id) => {
                set((state) => {
                    const newFiles = { ...state.files };
                    const newHistory = { ...state.history };
                    delete newFiles[id];
                    delete newHistory[id];

                    // If we deleted the active file, switch to another one or create default
                    let newActiveId = state.activeFileId;
                    if (state.activeFileId === id) {
                        const remainingIds = Object.keys(newFiles);
                        if (remainingIds.length > 0) {
                            newActiveId = remainingIds[0];
                        } else {
                            // Rehydrate default if everything is gone
                            const defaultId = 'default';
                            newFiles[defaultId] = {
                                id: defaultId,
                                title: 'Untitled Diagram',
                                content: DEFAULT_CONTENT,
                                createdAt: Date.now(),
                                updatedAt: Date.now(),
                            };
                            newActiveId = defaultId;
                            newHistory[defaultId] = { past: [], future: [], lastPush: Date.now() };
                        }
                    }

                    return {
                        files: newFiles,
                        history: newHistory,
                        activeFileId: newActiveId,
                    };
                });
            },

            setActiveFile: (id) => {
                set({ activeFileId: id });
            },

            undo: () => {
                set((state) => {
                    const id = state.activeFileId;
                    if (!id || !state.files[id] || !state.history[id]) return state;

                    const history = state.history[id];
                    if (history.past.length === 0) return state;

                    const previous = history.past[history.past.length - 1];
                    const newPast = history.past.slice(0, -1);
                    const newFuture = [state.files[id].content, ...history.future];

                    return {
                        files: {
                            ...state.files,
                            [id]: { ...state.files[id], content: previous, updatedAt: Date.now() }
                        },
                        history: {
                            ...state.history,
                            [id]: { ...history, past: newPast, future: newFuture }
                        }
                    };
                });
            },

            redo: () => {
                set((state) => {
                    const id = state.activeFileId;
                    if (!id || !state.files[id] || !state.history[id]) return state;

                    const history = state.history[id];
                    if (history.future.length === 0) return state;

                    const next = history.future[0];
                    const newFuture = history.future.slice(1);
                    const newPast = [...history.past, state.files[id].content];

                    return {
                        files: {
                            ...state.files,
                            [id]: { ...state.files[id], content: next, updatedAt: Date.now() }
                        },
                        history: {
                            ...state.history,
                            [id]: { ...history, past: newPast, future: newFuture }
                        }
                    };
                });
            }
        }),
        {
            name: 'mermaid-file-store',
            partialize: (state) => ({ files: state.files, activeFileId: state.activeFileId }), // Don't persist history
        }
    )
);
