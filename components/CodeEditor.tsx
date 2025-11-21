
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { File as FileIcon, Play, Share2, Terminal, FilePlus, FolderPlus, Trash2, ChevronDown, ChevronRight, Folder, FolderOpen, Edit2 } from 'lucide-react';
import { Project, File } from '../types';
import { executeProject } from '../utils/mockRuntime';
import { useLanguage } from '../contexts/LanguageContext';
import { highlightCode } from '../utils/syntax';

interface CodeEditorProps {
  project?: Project;
  files?: Record<string, File>;
  codeSnippet?: string;
  onRun?: (logs: string[]) => void;
  onFileCreate?: (path: string, isFolder: boolean) => void;
  onFileDelete?: (path: string) => void;
  onFileUpdate?: (path: string, content: string) => void;
  onFileRename?: (oldPath: string, newPath: string) => void;
  onShare?: () => void;
  readOnly?: boolean;
  height?: string;
  activeFileProp?: string;
  showConsole?: boolean;
  onRunClick?: () => void;
}

// Helper to build tree structure from flat paths
interface TreeNode {
  name: string;
  path: string;
  isFolder: boolean;
  children: TreeNode[];
}

const buildFileTree = (files: Record<string, File>): TreeNode[] => {
  const root: TreeNode[] = [];
  const paths = Object.keys(files).sort();
  
  const findOrCreateNode = (nodes: TreeNode[], name: string, fullPath: string, isFolder: boolean): TreeNode => {
    let node = nodes.find(n => n.name === name);
    if (!node) {
      node = { name, path: fullPath, isFolder, children: [] };
      nodes.push(node);
      // Sort: Folders first, then files
      nodes.sort((a, b) => {
        if (a.isFolder === b.isFolder) return a.name.localeCompare(b.name);
        return a.isFolder ? -1 : 1;
      });
    }
    return node;
  };

  paths.forEach(path => {
    const isExplicitFolder = path.endsWith('/');
    const parts = path.split('/').filter(Boolean);
    
    let currentLevel = root;
    let currentPath = "";

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const isFolder = !isLast || isExplicitFolder;
      
      currentPath += part + (isFolder ? '/' : '');
      
      const node = findOrCreateNode(currentLevel, part, currentPath, isFolder);
      currentLevel = node.children;
    });
  });

  return root;
};

const SyntaxHighlighter = React.forwardRef<HTMLPreElement, { code: string }>(({ code }, ref) => {
  return (
    <pre 
        ref={ref}
        className="font-mono text-[13px] leading-6 m-0 p-4 text-gray-300 pointer-events-none absolute inset-0 whitespace-pre overflow-hidden"
        style={{ tabSize: 4 }}
    >
      <code dangerouslySetInnerHTML={{ __html: highlightCode(code) }} />
    </pre>
  );
});

SyntaxHighlighter.displayName = 'SyntaxHighlighter';

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  project: initialProject, 
  files: propFiles,
  codeSnippet, 
  height = "h-[600px]",
  onFileCreate,
  onFileDelete,
  onFileUpdate,
  onFileRename,
  onShare,
  activeFileProp,
  showConsole = true,
  onRunClick
}) => {
  const { t } = useLanguage();
  const isProjectMode = !!initialProject || !!propFiles;
  const effectiveFiles = propFiles || (initialProject ? initialProject.files : {});
  
  const getInitialFile = () => {
    if (activeFileProp) return activeFileProp;
    
    // Find explicitly marked entry point
    const entryEntry = Object.entries(effectiveFiles).find(([_, f]) => f.isEntry);
    if (entryEntry) return entryEntry[0];

    const firstFile = Object.keys(effectiveFiles).find(f => !f.endsWith('/'));
    return firstFile || '';
  };

  const [activeFile, setActiveFile] = useState(getInitialFile());
  const [code, setCode] = useState(effectiveFiles[activeFile]?.content || codeSnippet || "");
  const [terminalOutput, setTerminalOutput] = useState<string[]>(["$ Ready."]);
  const [isRunning, setIsRunning] = useState(false);
  
  // Explorer State
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src/']));
  const [selectedExplorerItem, setSelectedExplorerItem] = useState<string | null>(null);
  
  // Creation/Rename State
  const [isCreating, setIsCreating] = useState<'file' | 'folder' | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);
  const [inputName, setInputName] = useState("");

  // Refs for scrolling sync
  const preRef = useRef<HTMLPreElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fileTree = useMemo(() => buildFileTree(effectiveFiles), [effectiveFiles]);

  useEffect(() => {
    if (codeSnippet !== undefined) setCode(codeSnippet);
  }, [codeSnippet]);

  useEffect(() => {
    if (activeFileProp && effectiveFiles[activeFileProp]) {
      setActiveFile(activeFileProp);
      setCode(effectiveFiles[activeFileProp].content);
    }
  }, [activeFileProp, effectiveFiles]);

  // Scroll Sync Handler
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.currentTarget.scrollTop;
      preRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  const handleFileClick = (path: string, isFolder: boolean) => {
    setSelectedExplorerItem(path);
    
    if (isFolder) {
      setExpandedFolders(prev => {
        const next = new Set(prev);
        if (next.has(path)) next.delete(path);
        else next.add(path);
        return next;
      });
    } else {
      setActiveFile(path);
      setCode(effectiveFiles[path]?.content || "");
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setTerminalOutput(["$ Compiling...", "$ ..."]);
    
    let logs: string[] = [];
    if (isProjectMode) {
       const filesForRun = { ...effectiveFiles };
       if (activeFile && !activeFile.endsWith('/')) {
         filesForRun[activeFile] = { ...filesForRun[activeFile], content: code };
       }

       const projectToRun: Project = initialProject || {
         id: 'temp',
         name: 'Temp',
         description: '',
         files: filesForRun
       };

       logs = await executeProject(projectToRun);
    } else {
        await new Promise(r => setTimeout(r, 600));
        logs = ["> origami run main.zy", "Compiling... [0.1s]", "Program finished."];
    }

    setTerminalOutput(logs);
    setIsRunning(false);
  };

  // --- Creation Logic ---
  const startCreation = (type: 'file' | 'folder') => {
    setIsCreating(type);
    // Determine parent path based on selection
    let parentPath = "";
    if (selectedExplorerItem) {
        if (selectedExplorerItem.endsWith('/')) {
            parentPath = selectedExplorerItem;
        } else {
            const parts = selectedExplorerItem.split('/');
            parts.pop();
            parentPath = parts.join('/') + (parts.length > 0 ? '/' : '');
        }
    }
    setInputName(parentPath);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName) {
      setIsCreating(null);
      return;
    }
    
    let path = inputName.trim();
    if (isCreating === 'folder' && !path.endsWith('/')) path += '/';
    
    if (onFileCreate) onFileCreate(path, isCreating === 'folder');
    setIsCreating(null);
    setInputName("");
    
    // Auto expand parent
    const parentParts = path.split('/');
    // If folder, pop twice (once for empty string after trailing slash, once for name)
    // If file, pop once (for filename)
    parentParts.pop(); 
    if (isCreating === 'folder') parentParts.pop();
    
    const parentPath = parentParts.join('/') + '/';
    
    if (parentPath && parentPath !== '/') {
        setExpandedFolders(prev => new Set(prev).add(parentPath));
    }
  };

  // --- Rename Logic ---
  const startRename = (path: string) => {
      setRenamingPath(path);
      setInputName(path);
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (renamingPath && inputName && inputName !== renamingPath) {
          let newPath = inputName.trim();
          // Preserve folder slash if it was a folder
          if (renamingPath.endsWith('/') && !newPath.endsWith('/')) newPath += '/';
          if (!renamingPath.endsWith('/') && newPath.endsWith('/')) newPath = newPath.slice(0, -1);

          if (onFileRename) onFileRename(renamingPath, newPath);
      }
      setRenamingPath(null);
      setInputName("");
  };

  const renderTree = (nodes: TreeNode[], depth = 0) => {
    return nodes.map(node => {
      const isExpanded = expandedFolders.has(node.path);
      const isSelected = selectedExplorerItem === node.path;
      const isActive = activeFile === node.path;
      const paddingLeft = 12 + depth * 12;
      
      // Inline Rename Input
      if (renamingPath === node.path) {
         return (
             <div key={node.path} className="py-0.5" style={{ paddingLeft: `${paddingLeft}px` }}>
                 <form onSubmit={handleRenameSubmit} className="flex items-center">
                     {node.isFolder ? <Folder size={14} className="mr-1 text-origami-blue" /> : <FileIcon size={13} className="mr-1 text-gray-400" />}
                     <input 
                        autoFocus
                        className="w-full bg-[#18181B] border border-origami-blue text-xs text-white px-1 py-0.5 rounded outline-none min-w-[100px]"
                        value={inputName}
                        onChange={e => setInputName(e.target.value)}
                        onBlur={() => setRenamingPath(null)}
                        onKeyDown={(e) => {
                            if(e.key === 'Escape') setRenamingPath(null);
                        }}
                     />
                 </form>
             </div>
         );
      }

      return (
        <div key={node.path}>
          <div 
            className={`group flex items-center justify-between py-1.5 pr-2 text-xs cursor-pointer select-none transition-colors border-l-2
                ${isSelected ? 'bg-white/5 border-origami-blue' : 'border-transparent hover:bg-white/5'}
                ${isActive ? 'text-origami-cyan font-medium' : 'text-gray-400'}
            `}
            style={{ paddingLeft: `${paddingLeft}px` }}
            onClick={() => handleFileClick(node.path, node.isFolder)}
          >
            <div className="flex items-center gap-1.5 truncate flex-1">
              {node.isFolder && (
                 <span className="text-gray-500 opacity-70">
                    {isExpanded ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                 </span>
              )}
              {node.isFolder ? (
                 isExpanded ? <FolderOpen size={14} className="text-origami-blue" /> : <Folder size={14} className="text-origami-blue" />
              ) : (
                 <FileIcon size={13} className={isActive ? 'text-origami-cyan' : ''} />
              )}
              <span>{node.name}</span>
            </div>

            {/* Hover Actions */}
            <div className="hidden group-hover:flex items-center gap-1 opacity-60 hover:opacity-100">
                {onFileRename && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); startRename(node.path); }} 
                        className="p-1 hover:text-white hover:bg-white/10 rounded"
                        title={t('editor.rename')}
                    >
                        <Edit2 size={10} />
                    </button>
                )}
                {onFileDelete && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onFileDelete(node.path); }} 
                        className="p-1 hover:text-red-400 hover:bg-white/10 rounded"
                        title={t('editor.delete')}
                    >
                        <Trash2 size={10} />
                    </button>
                )}
            </div>
          </div>
          
          {/* Render Children */}
          {node.isFolder && isExpanded && (
             <div>
                {renderTree(node.children, depth + 1)}
                {node.children.length === 0 && (
                    <div className="py-1 text-[10px] text-gray-600 italic select-none" style={{ paddingLeft: `${paddingLeft + 20}px` }}>
                        {t('editor.empty')}
                    </div>
                )}
             </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className={`flex flex-col ${height} bg-[#0F0F11] border border-origami-border rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/5`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#18181B] border-b border-origami-border select-none">
        <div className="flex items-center gap-3">
            {isProjectMode && (
                 <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                 </div>
            )}
            <div className="flex items-center gap-2 text-gray-400 text-xs font-mono ml-2">
                <FileIcon size={12} />
                <span>{activeFile || 'Empty'}</span>
            </div>
        </div>
        <div className="flex items-center gap-2">
            {onShare && (
              <button onClick={onShare} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 hover:text-white transition-colors rounded border border-white/10">
                  <Share2 size={14} /> {t('editor.share')}
              </button>
            )}
            <button 
                onClick={() => onRunClick ? onRunClick() : handleRun()}
                disabled={isRunning && !onRunClick}
                className={`flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white text-xs font-bold uppercase tracking-wider rounded shadow-lg transition-all ${(isRunning && !onRunClick) ? 'opacity-70' : ''}`}
            >
                <Play size={12} fill="currentColor" />
                {(isRunning && !onRunClick) ? t('editor.running') : t('editor.run')}
            </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for Project Mode */}
        {isProjectMode && (
          <div className="w-64 flex flex-col border-r border-origami-border bg-[#0A0A0C] overflow-hidden">
            <div className="p-3 border-b border-gray-800/50 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('editor.explorer')}</span>
                <div className="flex gap-1">
                    <button onClick={() => startCreation('file')} className="p-1 text-gray-500 hover:text-white transition-colors" title={t('editor.newFile')}>
                        <FilePlus size={14} />
                    </button>
                    <button onClick={() => startCreation('folder')} className="p-1 text-gray-500 hover:text-white transition-colors" title={t('editor.newFolder')}>
                        <FolderPlus size={14} />
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto py-2">
                {isCreating && (
                    <div className="px-3 py-1">
                        <form onSubmit={handleCreateSubmit} className="flex items-center gap-1">
                             {isCreating === 'folder' ? <Folder size={14} className="text-origami-blue" /> : <FileIcon size={13} className="text-gray-400" />}
                             <input 
                                autoFocus
                                className="w-full bg-[#18181B] border border-origami-blue text-xs text-white px-1 py-0.5 rounded outline-none"
                                value={inputName}
                                onChange={e => setInputName(e.target.value)}
                                placeholder={isCreating === 'folder' ? "src/" : "main.zy"}
                                onBlur={() => {
                                    if (!inputName) setIsCreating(null);
                                }}
                             />
                        </form>
                    </div>
                )}
                {renderTree(fileTree)}
            </div>
          </div>
        )}

        {/* Editor Area */}
        <div className="flex-1 flex flex-col relative bg-[#0F0F11]">
            <div className="flex-1 relative overflow-hidden">
                {(activeFile && !activeFile.endsWith('/')) || codeSnippet ? (
                    <div className="absolute inset-0">
                       <SyntaxHighlighter ref={preRef} code={code} />
                       <textarea
                            ref={textareaRef}
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                                if (onFileUpdate && activeFile) onFileUpdate(activeFile, e.target.value);
                            }}
                            onScroll={handleScroll}
                            spellCheck={false}
                            style={{ tabSize: 4 }}
                            className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-white resize-none focus:outline-none p-4 font-mono text-[13px] leading-6 whitespace-pre overflow-auto z-10"
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                        {activeFile?.endsWith('/') ? "Folder selected" : "Select a file to edit"}
                    </div>
                )}
            </div>

            {/* Terminal / Console */}
            {showConsole && (
                <div className="h-1/3 border-t border-origami-border bg-[#0A0A0C] flex flex-col">
                    <div className="px-4 py-2 border-b border-gray-800/50 flex items-center gap-2">
                        <Terminal size={12} className="text-origami-blue" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('editor.console')}</span>
                    </div>
                    <div className="flex-1 p-4 font-mono text-xs overflow-y-auto">
                        {terminalOutput.map((line, i) => (
                            <div key={i} className="mb-1 text-gray-300">
                                {line.startsWith('>') ? (
                                    <span className="text-origami-blue">{line}</span>
                                ) : line.includes('Error') ? (
                                    <span className="text-red-400">{line}</span>
                                ) : (
                                    <span className="opacity-80">{line}</span>
                                )}
                            </div>
                        ))}
                        {terminalOutput.length === 0 && <span className="text-gray-600 italic">No output</span>}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
