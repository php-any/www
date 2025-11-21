
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Search, ChevronRight, FileText, Folder, FolderOpen, Github, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { fetchDocsTree, fetchDocContent, DocNode } from '../utils/github';
import { highlightCode } from '../utils/syntax';

const Docs: React.FC = () => {
  const [tree, setTree] = useState<DocNode[]>([]);
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const [content, setContent] = useState<string>('');
  const [loadingTree, setLoadingTree] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const { t, language } = useLanguage();

  useEffect(() => {
    const initDocs = async () => {
      setLoadingTree(true);
      const docsTree = await fetchDocsTree();
      if (docsTree.length === 0) {
        setError("Failed to load documentation structure from GitHub.");
      } else {
        setTree(docsTree);
        // Auto-select first file
        const findFirstFile = (nodes: DocNode[]): DocNode | null => {
           for (const node of nodes) {
             if (node.type === 'file') return node;
             if (node.children.length > 0) {
               const child = findFirstFile(node.children);
               if (child) return child;
             }
           }
           return null;
        };
        
        const first = findFirstFile(docsTree);
        if (first) {
          setActiveDoc(first.path);
          loadContent(first.path);
        }
        
        // Expand root folders
        const roots = new Set(docsTree.filter(n => n.type === 'folder').map(n => n.id));
        setExpandedFolders(roots);
      }
      setLoadingTree(false);
    };
    initDocs();
  }, []);

  const loadContent = async (path: string) => {
    setLoadingContent(true);
    setActiveDoc(path);
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Check for localized version if not English
    // This is a simple heuristic; real logic would depend on repo structure
    let targetPath = path;
    /* 
       Uncomment if the repo has specific localization structure like .zh.md
       if (language === 'zh' && !path.includes('.zh.')) {
          targetPath = path.replace('.md', '.zh.md');
          // Only try if we know it exists, otherwise basic fetch will fail 404
       } 
    */

    const markdown = await fetchDocContent(targetPath);
    setContent(markdown);
    setLoadingContent(false);
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderTree = (nodes: DocNode[], depth = 0) => {
    if (!nodes) return null;
    
    return nodes.map(node => {
      // Simple search filter
      if (searchQuery && node.type === 'file' && !node.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return null;
      }

      const isExpanded = expandedFolders.has(node.id);
      const isActive = activeDoc === node.path;

      if (node.type === 'folder') {
        // If searching, ensure folder shows if children match (simplified logic: show all folders if query empty)
        if (searchQuery && !node.children.some(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))) {
             return null;
        }

        return (
          <div key={node.id} className="mb-2">
            <button 
              onClick={() => toggleFolder(node.id)}
              className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest mb-1 px-2 w-full text-left hover:text-white transition-colors"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              {isExpanded ? <FolderOpen size={12} /> : <Folder size={12} />}
              {node.title}
            </button>
            {isExpanded && (
              <div className="mt-1">
                {renderTree(node.children, depth + 1)}
              </div>
            )}
          </div>
        );
      }

      return (
        <button
          key={node.id}
          onClick={() => loadContent(node.path)}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-all group ${
            isActive 
            ? 'bg-origami-blue/10 text-origami-blue font-medium' 
            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
          }`}
          style={{ paddingLeft: `${depth * 12 + 12}px` }}
        >
           <div className={`w-1 h-1 rounded-full shrink-0 ${isActive ? 'bg-origami-blue' : 'bg-gray-600 group-hover:bg-gray-400'}`}></div>
           <span className="truncate text-left">{node.title}</span>
        </button>
      );
    });
  };

  return (
    <div className="flex min-h-screen pt-16 bg-[#050505]">
        {/* Sidebar Navigation */}
        <aside className="w-72 fixed top-16 bottom-0 overflow-y-auto border-r border-gray-900 bg-[#0A0A0C] hidden lg:flex flex-col">
            <div className="p-6">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    <input 
                        type="text" 
                        placeholder={t('docs.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 text-gray-300 text-sm rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-origami-blue transition-colors placeholder:text-gray-600"
                    />
                </div>
                
                <nav className="space-y-1">
                    {loadingTree ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="animate-spin text-gray-600" />
                      </div>
                    ) : error ? (
                      <div className="text-red-400 text-sm p-4 text-center">
                         <AlertCircle className="mx-auto mb-2" size={24} />
                         {error}
                      </div>
                    ) : (
                      renderTree(tree)
                    )}
                </nav>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72 max-w-5xl mx-auto px-6 py-12 w-full min-h-[calc(100vh-64px)]">
            {/* Breadcrumbs */}
            <div className="flex items-center text-sm text-gray-500 mb-8 font-mono overflow-hidden">
                <span>docs</span>
                <ChevronRight size={14} className="mx-2 shrink-0" />
                <span className="text-gray-300 truncate">{activeDoc || '...'}</span>
            </div>

            {loadingContent ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="animate-spin text-origami-blue w-8 h-8" />
                </div>
            ) : (
                <div className="prose prose-invert prose-pre:bg-[#18181B] prose-pre:border prose-pre:border-gray-800 prose-headings:font-bold prose-headings:text-white prose-h1:text-4xl prose-h1:mb-8 prose-a:text-origami-cyan prose-strong:text-white max-w-none">
                    <ReactMarkdown 
                        components={{
                            code({node, inline, className, children, ...props}: any) {
                                const match = /language-(\w+)/.exec(className || '')
                                const codeText = String(children).replace(/\n$/, '')

                                if (!inline && match) {
                                    return (
                                        <div className="relative group my-4">
                                            <pre className="bg-[#0F0F11] border border-gray-800 p-4 rounded-lg overflow-x-auto font-mono text-sm leading-relaxed">
                                                <code 
                                                    className={className} 
                                                    dangerouslySetInnerHTML={{ __html: highlightCode(codeText) }} 
                                                    {...props}
                                                />
                                            </pre>
                                        </div>
                                    )
                                }
                                return (
                                    <code className="bg-white/10 rounded px-1.5 py-0.5 text-origami-cyan font-mono text-sm mx-0.5" {...props}>
                                        {children}
                                    </code>
                                )
                            }
                        }}
                    >
                        {content}
                    </ReactMarkdown>
                </div>
            )}

            {/* Doc Footer */}
            <div className="mt-16 pt-8 border-t border-gray-900 flex justify-between text-sm text-gray-500">
                <a 
                  href={`https://github.com/php-any/origami/blob/main/${activeDoc}`} 
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white flex items-center gap-2 transition-colors"
                >
                    <Github size={14} /> {t('docs.editOnGithub')}
                </a>
                <span className="hidden sm:inline">{t('docs.lastUpdated')}</span>
            </div>
        </main>
    </div>
  );
};

export default Docs;
