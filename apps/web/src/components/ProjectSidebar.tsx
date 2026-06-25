import React, { useState } from 'react';
import { useFileStore } from '@/store/fileStore';
import { Card, CardHeader, CardContent } from '@/components/radical-ai-studio-kit/radical-ai-studio-kit/ui/Card';
import { Button } from '@/components/radical-ai-studio-kit/radical-ai-studio-kit/ui/Button';
import { cn } from '@/utils/cn';
import { Folder, Plus, Trash2, FileText, ChevronLeft, ChevronRight, LayoutGrid, Search, Star, Clock, Tag } from 'lucide-react';
import { Input } from '@/components/radical-ai-studio-kit/radical-ai-studio-kit/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/radical-ai-studio-kit/radical-ai-studio-kit/ui/Tabs';

export function ProjectSidebar() {
    const { files, activeFileId, createFile, deleteFile, setActiveFile, updateFileTitle } = useFileStore();
    const [isOpen, setIsOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('recent');

    const sortedFiles = Object.values(files).sort((a, b) => b.updatedAt - a.updatedAt);

    const filteredFiles = sortedFiles.filter(file => {
        if (activeTab === 'recent') return true;
        if (activeTab === 'starred') return file.title.includes('⭐');
        if (activeTab === 'shared') return file.title.includes('🔗');
        return true;
    }).filter(file => {
        if (!searchQuery) return true;
        return file.title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <>
            {/* Toggle Button */}
            <div className={cn(
                "absolute top-4 left-4 z-50 transition-all duration-300",
                isOpen ? "left-[260px]" : "left-4"
            )}>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                    className="h-9 w-9 bg-background/80 backdrop-blur-md shadow-sm border-border/50 hover:bg-muted"
                >
                    {isOpen ? <ChevronLeft className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
                </Button>
            </div>

            {/* Sidebar Panel */}
            <div className={cn(
                "absolute top-0 left-0 bottom-0 z-40 w-[250px] bg-card/95 backdrop-blur-xl border-r border-border/50 shadow-2xl transition-transform duration-300 flex flex-col pointer-events-auto",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-4 border-b border-border/50 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-semibold text-sm">
                            <Folder className="h-4 w-4 text-primary" />
                            <span>Projects</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                                createFile();
                            }}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="relative">
                        <Input
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            size="sm"
                            className="h-8 text-xs pl-8"
                        />
                        <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="text-xs">
                        <TabsList className="grid grid-cols-3 h-8">
                            <TabsTrigger value="recent" className="h-6 text-xs">
                                <Clock className="h-3 w-3 mr-1" /> Recent
                            </TabsTrigger>
                            <TabsTrigger value="starred" className="h-6 text-xs">
                                <Star className="h-3 w-3 mr-1" /> Starred
                            </TabsTrigger>
                            <TabsTrigger value="shared" className="h-6 text-xs">
                                <Tag className="h-3 w-3 mr-1" /> Shared
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {filteredFiles.map((file) => (
                        <div
                            key={file.id}
                            className={cn(
                                "group flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer",
                                activeFileId === file.id
                                    ? "bg-primary/10 text-primary font-medium"
                                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            )}
                            onClick={() => setActiveFile(file.id)}
                        >
                            <FileText className="h-4 w-4 shrink-0" />
                            {editingId === file.id ? (
                                <Input
                                    value={file.title}
                                    onChange={(e) => updateFileTitle(file.id, e.target.value)}
                                    onBlur={() => setEditingId(null)}
                                    onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                                    className="h-6 text-xs px-1 py-0"
                                    autoFocus
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <span
                                    className="flex-1 truncate"
                                    onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        setEditingId(file.id);
                                    }}
                                >
                                    {file.title}
                                </span>
                            )}

                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Delete this diagram?')) {
                                        deleteFile(file.id);
                                    }
                                }}
                            >
                                <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-border/50 text-[10px] text-muted-foreground text-center">
                    MermaidMan v0.2.0
                </div>
            </div>
        </>
    );
}
