import { type MermaidFile } from '@/store/fileStore';

export function exportToMermaid(files: Record<string, MermaidFile>): string {
    const activeFile = Object.values(files).find(file => file.id === 'default') || Object.values(files)[0];
    if (!activeFile) return '';

    return activeFile.content;
}

export function exportToJSON(files: Record<string, MermaidFile>): string {
    return JSON.stringify(files, null, 2);
}

export function exportToMarkdown(files: Record<string, MermaidFile>): string {
    const activeFile = Object.values(files).find(file => file.id === 'default') || Object.values(files)[0];
    if (!activeFile) return '';

    return '```mermaid\n' + activeFile.content + '\n```';
}