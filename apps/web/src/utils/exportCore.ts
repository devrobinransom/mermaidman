export type ExportableMermaidFile = {
  id: string;
  content: string;
};

export function selectActiveFile<T extends ExportableMermaidFile>(
  files: Record<string, T>,
  activeFileId: string | null
): T | undefined {
  if (activeFileId && files[activeFileId]) {
    return files[activeFileId];
  }
  return Object.values(files)[0];
}

export function mermaidContentForExport<T extends ExportableMermaidFile>(
  files: Record<string, T>,
  activeFileId: string | null
): string {
  return selectActiveFile(files, activeFileId)?.content ?? '';
}

export function markdownContentForExport<T extends ExportableMermaidFile>(
  files: Record<string, T>,
  activeFileId: string | null
): string {
  const activeFile = selectActiveFile(files, activeFileId);
  if (!activeFile) return '';
  return `\`\`\`mermaid\n${activeFile.content}\n\`\`\``;
}
