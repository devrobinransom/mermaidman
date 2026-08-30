import { type MermaidFile, useFileStore } from '@/store/fileStore';

function getActiveFile(files: Record<string, MermaidFile>): MermaidFile | undefined {
    const activeFileId = useFileStore.getState().activeFileId;
    if (activeFileId && files[activeFileId]) {
        return files[activeFileId];
    }
    return Object.values(files)[0];
}

export function exportToMermaid(files: Record<string, MermaidFile>): string {
    return getActiveFile(files)?.content ?? '';
}

export function exportToJSON(files: Record<string, MermaidFile>): string {
    return JSON.stringify(files, null, 2);
}

export function exportToMarkdown(files: Record<string, MermaidFile>): string {
    const activeFile = getActiveFile(files);
    if (!activeFile) return '';

    return '```mermaid\n' + activeFile.content + '\n```';
}
