
interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface DocNode {
  id: string;
  title: string;
  path: string;
  type: 'file' | 'folder';
  children: DocNode[];
}

const OWNER = 'php-any';
const REPO = 'origami';
const BRANCH = 'main';

// Cache the tree to avoid rate limits
let treeCache: DocNode[] | null = null;

const formatTitle = (filename: string): string => {
  // Remove extension
  let title = filename.replace(/\.md$/i, '');
  
  // Remove ordering prefixes like "01_", "02-"
  title = title.replace(/^[\d]+[_\-]/, '');
  
  // Replace separators with spaces
  title = title.replace(/[_\-]/g, ' ');
  
  // Capitalize words
  return title.replace(/\b\w/g, l => l.toUpperCase());
};

const buildTree = (items: GitHubTreeItem[], rootPath: string = 'docs'): DocNode[] => {
  const root: DocNode[] = [];
  const map: Record<string, DocNode> = {};

  // Filter relevant items
  const docItems = items.filter(item => 
    item.path.startsWith(rootPath) && 
    (item.type === 'tree' || item.path.endsWith('.md'))
  );

  docItems.forEach(item => {
    const relativePath = item.path.slice(rootPath.length + 1); // +1 for slash
    if (!relativePath) return; // Root folder itself

    const parts = relativePath.split('/');
    const fileName = parts[parts.length - 1];
    const parentPath = parts.slice(0, -1).join('/');

    const node: DocNode = {
      id: item.path,
      title: formatTitle(fileName),
      path: item.path,
      type: item.type === 'tree' ? 'folder' : 'file',
      children: []
    };

    map[relativePath] = node;

    if (parts.length === 1) {
      // Top level in docs/
      root.push(node);
    } else {
      const parentNode = map[parentPath];
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        // Parent might strictly be a folder that wasn't explicitly in the tree if recursive didn't catch it, 
        // but git tree recursive usually covers it. 
        // Fallback: Add to root if parent missing (shouldn't happen with valid git tree)
        root.push(node);
      }
    }
  });

  // Sort: Folders first, then files. README usually first.
  const sortNodes = (nodes: DocNode[]) => {
    nodes.sort((a, b) => {
      if (a.title.toLowerCase().includes('readme') || a.title.toLowerCase().includes('intro')) return -1;
      if (b.title.toLowerCase().includes('readme') || b.title.toLowerCase().includes('intro')) return 1;
      
      if (a.type === b.type) return a.title.localeCompare(b.title);
      return a.type === 'folder' ? 1 : -1; // Folders bottom or top? Let's put folders bottom like sections
    });
    nodes.forEach(n => sortNodes(n.children));
  };

  sortNodes(root);
  return root;
};

export const fetchDocsTree = async (): Promise<DocNode[]> => {
  if (treeCache) return treeCache;

  try {
    const response = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/git/trees/${BRANCH}?recursive=1`);
    if (!response.ok) {
      throw new Error(`GitHub API Error: ${response.statusText}`);
    }
    const data = await response.json();
    const tree = buildTree(data.tree, 'docs');
    treeCache = tree;
    return tree;
  } catch (error) {
    console.error("Failed to fetch docs tree:", error);
    return [];
  }
};

export const fetchDocContent = async (path: string): Promise<string> => {
  try {
    const response = await fetch(`https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return "# Error\nFailed to load document content.";
  }
};
