'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Folder, FileText, Search, PlusCircle, Trash2, Book, MoreVertical, X, BrainCircuit, ChevronLeft, Brain } from 'lucide-react';
import Link from 'next/link';

function MoveDialogFolderTree({ nodes, selectedPath, onSelect, level = 0 }: { nodes: any[], selectedPath: string, onSelect: (path: string) => void, level?: number }) {
  return (
    <ul className={ level > 0 ? "pl-3 mt-1 border-l border-white/10 ml-2 space-y-1" : "space-y-1" }>
      { nodes.filter(n => n.type === 'folder').map(node => (
        <li key={ node.id || node.path }>
          <div
            onClick={ () => onSelect(node.id || node.path) }
            className={ `flex items-center py-1.5 px-2 rounded cursor-pointer text-sm transition-colors ${selectedPath === (node.id || node.path) ? 'bg-purple-600/30 text-purple-400 font-medium' : 'text-zinc-400 hover:bg-white/5'}` }
          >
            <Folder className="w-4 h-4 mr-2" /> { node.name }
          </div>
          { node.children && node.children.length > 0 && (
            <MoveDialogFolderTree nodes={ node.children } selectedPath={ selectedPath } onSelect={ onSelect } level={ level + 1 } />
          ) }
        </li>
      )) }
    </ul>
  );
}

interface SidebarProps {
  tree: any[];
  onSelectFile: (path: string) => void;
  onCreateFile: (path: string) => void;
  onCreateFolder: (path: string) => void;
  onRenameFolder: (path: string, currentName: string) => void;
  onMoveFolder: (path: string) => void;
  onDeleteFolder: (path: string) => void;
  onRenameFile: (path: string, currentName: string) => void;
  onMoveFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
}

function SubSidebar({ tree, onSelectFile, onCreateFile, onCreateFolder, onRenameFolder, onMoveFolder, onDeleteFolder, onRenameFile, onMoveFile, onDeleteFile }: SidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    const handleClick = () => setActiveDropdown(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const toggleFolder = (path: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const renderTree = (nodes: any[], level = 0) => {
    // Sort: folders first, then files, both alphabetically
    const sorted = [...nodes].sort((a, b) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'folder' ? -1 : 1;
    });
    return (
      <ul className={ level > 0 ? "pl-3 mt-1 space-y-1 border-l border-white/5 ml-2" : "mt-1 space-y-1" }>
        { sorted.map(node => {
          const isExpanded = expandedFolders.has(node.id || node.path);
          const isCoreFolder = level === 0 && ['00-inbox', '01-projects', '02-areas', '03-resources', '04-archive'].includes(node.name);
          
          return (
            <li key={ node.id || node.path } className="text-sm">
              { node.type === 'folder' ? (
                <div className="flex flex-col">
                  <div
                    onClick={ (e) => toggleFolder(node.id || node.path, e) }
                    className="group relative flex items-center justify-between text-zinc-400 font-medium py-1.5 px-2 rounded-md hover:bg-white/5 hover:text-zinc-200 cursor-pointer transition-colors select-none"
                  >
                    <div className="flex items-center">
                      <Folder className={ `w-4 h-4 mr-2 transition-colors ${isExpanded ? 'text-purple-400' : 'text-zinc-500'}` } />
                      { node.name }
                    </div>

                    <div className="hidden group-hover:flex items-center">
                      <button
                        onClick={ (e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === (node.id || node.path) ? null : (node.id || node.path));
                        } }
                        className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    { activeDropdown === (node.id || node.path) && (
                      <div className="absolute right-0 top-full mt-1 w-36 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl py-1 z-50 text-xs text-zinc-300 font-normal">
                        <div onClick={ (e) => { e.stopPropagation(); setActiveDropdown(null); onCreateFile(node.id || node.path); } } className="px-3 py-1.5 hover:bg-white/10 cursor-pointer text-left">新增檔案</div>
                        <div onClick={ (e) => { e.stopPropagation(); setActiveDropdown(null); onCreateFolder(node.id || node.path); } } className="px-3 py-1.5 hover:bg-white/10 cursor-pointer text-left">新增資料夾</div>
                        {!isCoreFolder && <div onClick={ (e) => { e.stopPropagation(); setActiveDropdown(null); onRenameFolder(node.id || node.path, node.name); } } className="px-3 py-1.5 hover:bg-white/10 cursor-pointer text-left">重新命名</div>}
                        {!isCoreFolder && <div onClick={ (e) => { e.stopPropagation(); setActiveDropdown(null); onMoveFolder(node.id || node.path); } } className="px-3 py-1.5 hover:bg-white/10 cursor-pointer text-left">移動到</div>}
                        {!isCoreFolder && <div onClick={ (e) => { e.stopPropagation(); setActiveDropdown(null); onDeleteFolder(node.id || node.path); } } className="px-3 py-1.5 hover:bg-white/10 cursor-pointer text-left text-rose-400">刪除資料夾</div>}
                      </div>
                    ) }
                  </div>
                  { isExpanded && node.children && renderTree(node.children, level + 1) }
                </div>
              ) : (
                <div
                  className="group relative flex items-center justify-between text-zinc-400 hover:bg-white/5 py-1.5 px-2 rounded-md cursor-pointer transition-colors select-none"
                  onClick={ () => onSelectFile(node.id || node.path) }
                >
                  <div className="flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-2 text-zinc-500 group-hover:text-purple-400 transition-colors" /> { node.name }
                  </div>

                  <div className="hidden group-hover:flex items-center">
                    <button
                      onClick={ (e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === (node.id || node.path) ? null : (node.id || node.path));
                      } }
                      className="p-1 hover:bg-white/10 rounded text-zinc-400 hover:text-white transition-colors"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  { activeDropdown === (node.id || node.path) && (
                    <div className="absolute right-0 top-full mt-1 w-36 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl py-1 z-50 text-xs text-zinc-300 font-normal">
                      <div onClick={ (e) => { e.stopPropagation(); setActiveDropdown(null); onRenameFile(node.id || node.path, node.name); } } className="px-3 py-1.5 hover:bg-white/10 cursor-pointer text-left">重新命名</div>
                      <div onClick={ (e) => { e.stopPropagation(); setActiveDropdown(null); onMoveFile(node.id || node.path); } } className="px-3 py-1.5 hover:bg-white/10 cursor-pointer text-left">移動到</div>
                      <div onClick={ (e) => { e.stopPropagation(); setActiveDropdown(null); onDeleteFile(node.id || node.path); } } className="px-3 py-1.5 hover:bg-white/10 cursor-pointer text-left text-rose-400">刪除檔案</div>
                    </div>
                  ) }
                </div>
              ) }
            </li>
          );
        }) }
      </ul>
    );
  };

  return (
    <div className="w-64 bg-[#141414] border-r border-white/5 h-screen overflow-x-hidden overflow-y-auto p-4 flex flex-col">
      <Link href="/" className="group flex items-center text-xs text-zinc-500 hover:text-zinc-300 font-medium mb-6 transition-colors">
        <ChevronLeft className="w-3.5 h-3.5 mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      <div className="text-sm font-semibold tracking-wide flex items-center justify-between mb-4 text-zinc-300 px-2 uppercase">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-purple-400" />
          第二大腦
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto no-scrollbar">
        { renderTree(tree) }
      </nav>
    </div>
  );
}

// 5 個固定的根目錄資料夾，永遠存在
const CORE_FOLDERS = [
  { id: '00-inbox',      name: '00-inbox',      path: '00-inbox',      type: 'folder', children: [] },
  { id: '01-projects',  name: '01-projects',  path: '01-projects',  type: 'folder', children: [] },
  { id: '02-areas',     name: '02-areas',     path: '02-areas',     type: 'folder', children: [] },
  { id: '03-resources', name: '03-resources', path: '03-resources', type: 'folder', children: [] },
  { id: '04-archive',   name: '04-archive',   path: '04-archive',   type: 'folder', children: [] },
];

// 遞迴搜尋指定 id/path 的節點
function findNodeById(nodes: any[], targetId: string): any | null {
  for (const node of nodes) {
    if ((node.id || node.path) === targetId) return node;
    if (node.children?.length) {
      const found = findNodeById(node.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

// 取得某節點的兄弟節點列表（用於重複名稱檢查）
function findSiblingsOf(allNodes: any[], targetId: string): any[] {
  // 根層
  if (allNodes.some(n => (n.id || n.path) === targetId)) return allNodes;
  for (const node of allNodes) {
    if (node.children?.length) {
      if (node.children.some((c: any) => (c.id || c.path) === targetId)) return node.children;
      const result = findSiblingsOf(node.children, targetId);
      if (result.length >= 0 && result !== allNodes) return result;
    }
  }
  return [];
}

export default function SecondBrainPage() {
  const [tree, setTree] = useState<any[]>(CORE_FOLDERS);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [moveDialog, setMoveDialog] = useState<{ open: boolean; sourcePath: string; sourceType: 'file' | 'folder'; targetPath: string }>({
    open: false, sourcePath: '', sourceType: 'file', targetPath: ''
  });
  const [conflictDialog, setConflictDialog] = useState<{ open: boolean; sourcePath: string; sourceType: 'file'|'folder'; targetPath: string; conflictingName: string } | null>(null);
  const [renameDialog, setRenameDialog] = useState<{ open: boolean; type: 'file'|'folder'; id: string; newName: string; error: string } | null>(null);

  const loadTree = async () => {
    try {
      const res = await fetch('/api/second-brain/tree');
      if (!res.ok) return; // If API fails, keep showing the hardcoded core folders
      const apiNodes: any[] = await res.json();

      // Merge API children into their matching core folder
      const merged = CORE_FOLDERS.map(coreFolderDef => {
        const fromApi = apiNodes.find(n => n.name === coreFolderDef.name && n.type === 'folder');
        return fromApi ? { ...coreFolderDef, children: fromApi.children || [] } : { ...coreFolderDef, children: [] };
      });

      // Also include any extra root-level items from the API (extra folders / orphan notes)
      const coreNames = CORE_FOLDERS.map(f => f.name);
      const extras = apiNodes.filter(n => !coreNames.includes(n.name));

      setTree([...merged, ...extras]);
    } catch (e) {
      console.error('Tree API unavailable, showing core folders only.');
      setTree(CORE_FOLDERS);
    }
  };

  useEffect(() => {
    loadTree();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (!searchText.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    const delay = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch('/api/second-brain/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: searchText })
        });
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.results || []);
          setShowSearchDropdown(true);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchText]);

  const loadFile = async (path: string) => {
    setCurrentFilePath(path);
    setIsEditing(false);
    const res = await fetch('/api/second-brain/file?path=' + encodeURIComponent(path));
    if (res.ok) {
      const data = await res.json();
      setFileContent(data.content);
    }
  };

  const handleCreateFolder = async (parentPath: string) => {
    const name = prompt('請輸入子資料夾名稱：');
    if (!name) return;

    // 遞迴搜尋相同名稱檢查
    const parentNode = findNodeById(tree, parentPath);
    const siblings = parentNode?.children || [];
    if (siblings.some((n: any) => n.type === 'folder' && n.name === name)) {
      alert(`資料夾「${name}」已存在於此目錄下！請改用其他名稱。`);
      return;
    }

    await fetch('/api/second-brain/folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentPath: parentPath === 'root' ? null : parentPath, name })
    });
    loadTree();
  };

  const handleCreateFile = async (parentPath: string) => {
    const name = prompt('請輸入新檔案名稱 (不需輸入 .md)：');
    if (!name) return;

    // 遞迴搜尋相同名稱檢查
    const parentNode = findNodeById(tree, parentPath);
    const siblings = parentNode?.children || [];
    if (siblings.some((n: any) => n.type === 'file' && n.name === name)) {
      alert(`檔案「${name}」已存在於此資料夾下！請改用其他名稱。`);
      return;
    }

    const filePath = parentPath + '/' + name;
    await fetch('/api/second-brain/file?path=' + encodeURIComponent(filePath), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '# ' + name })
    });
    loadTree();
  };

  const handleRenameFolder = (oldPath: string, currentName: string) => {
    setRenameDialog({ open: true, type: 'folder', id: oldPath, newName: currentName, error: '' });
  };

  const handleRenameFile = (oldPath: string, currentName: string) => {
    setRenameDialog({ open: true, type: 'file', id: oldPath, newName: currentName, error: '' });
  };

  const submitRename = async () => {
    if (!renameDialog || renameDialog.error) return;
    const { id, type, newName } = renameDialog;
    await fetch('/api/second-brain/rename', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPath: id, newName, type })
    });
    setRenameDialog(null);
    loadTree();
  };

  const handleRenameInputChange = (value: string) => {
    if (!renameDialog) return;
    // 檢查同層是否已有相同名稱
    const siblings = findSiblingsOf(tree, renameDialog.id);
    const isDuplicate = siblings.some(
      (n: any) => (n.id || n.path) !== renameDialog.id &&
        n.name.replace(/\.md$/, '') === value.replace(/\.md$/, '') &&
        n.type === renameDialog.type
    );
    setRenameDialog({
      ...renameDialog,
      newName: value,
      error: isDuplicate ? `名稱「${value}」在此資料夾中已存在，請改用其他名稱` : ''
    });
  };

  const handleMoveFolder = (sourcePath: string) =>
    setMoveDialog({ open: true, sourcePath, sourceType: 'folder', targetPath: '' });

  const handleMoveFile = (sourcePath: string) =>
    setMoveDialog({ open: true, sourcePath, sourceType: 'file', targetPath: '' });

  const doMove = async (sourcePath: string, sourceType: 'file'|'folder', targetPath: string, overwriteName?: string) => {
    await fetch('/api/second-brain/move', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourcePath, targetPath, type: sourceType, overwriteName })
    });
    loadTree();
  };

  const confirmMove = async () => {
    const { sourcePath, sourceType, targetPath } = moveDialog;
    if (!sourcePath) return;

    // 檢查目標資料夾是否已有同名項目
    // 在 DB 模式下 sourcePath 可能是 UUID，用 tree 找到實際的 name
    const sourceNode = findNodeById(tree, sourcePath);
    const sourceName = (sourceNode?.name || sourcePath.split('/').pop() || '').replace(/\.md$/, '');
    const targetNode = targetPath ? findNodeById(tree, targetPath) : { children: tree };
    const siblings: any[] = targetNode?.children || [];
    const conflict = siblings.find((n: any) => n.name.replace(/\.md$/, '') === sourceName && (n.id || n.path) !== sourcePath);

    setMoveDialog({ ...moveDialog, open: false });

    if (conflict) {
      // 發現衝突，展示三選一對話框
      setConflictDialog({ open: true, sourcePath, sourceType, targetPath, conflictingName: sourceName });
    } else {
      await doMove(sourcePath, sourceType, targetPath);
    }
  };

  const handleConflictOverwrite = async () => {
    if (!conflictDialog) return;
    const { sourcePath, sourceType, targetPath, conflictingName } = conflictDialog;
    // 先刪除目標衝突檔，再移動
    const conflictNode = (findNodeById(tree, targetPath)?.children || tree).find((n: any) => n.name === conflictingName);
    if (conflictNode) {
      await fetch('/api/second-brain/file?path=' + encodeURIComponent(conflictNode.id || conflictNode.path), { method: 'DELETE' });
    }
    await doMove(sourcePath, sourceType, targetPath);
    setConflictDialog(null);
  };

  const handleConflictRename = async () => {
    if (!conflictDialog) return;
    const newName = prompt('請輸入新名稱：', conflictDialog.conflictingName + '_copy');
    if (!newName) return;
    const { sourcePath, sourceType, targetPath } = conflictDialog;
    await doMove(sourcePath, sourceType, targetPath, newName);
    setConflictDialog(null);
  };

  const handleDeleteFolder = async (id: string) => {
    if (!confirm('確定要刪除此資料夾及其所有內容嗎？')) return;
    await fetch('/api/second-brain/folder?id=' + encodeURIComponent(id), { method: 'DELETE' });
    loadTree();
  };

  const handleDeleteFile = async (path: string) => {
    if (!confirm('確定要將此檔案刪除嗎？')) return;
    await fetch('/api/second-brain/file?path=' + encodeURIComponent(path), { method: 'DELETE' });
    if (currentFilePath === path) {
      setCurrentFilePath(null);
      setFileContent('');
    }
    loadTree();
  };

  const handleSave = async () => {
    if (!currentFilePath) return;
    await fetch('/api/second-brain/file?path=' + encodeURIComponent(currentFilePath), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: fileContent })
    });
    setIsEditing(false);
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-200 overflow-hidden font-sans">
      <SubSidebar
        tree={ tree }
        onSelectFile={ loadFile }
        onCreateFile={ handleCreateFile }
        onCreateFolder={ handleCreateFolder }
        onRenameFolder={ handleRenameFolder }
        onMoveFolder={ handleMoveFolder }
        onDeleteFolder={ handleDeleteFolder }
        onRenameFile={ handleRenameFile }
        onMoveFile={ handleMoveFile }
        onDeleteFile={ handleDeleteFile }
      />

      <main className="flex-1 flex flex-col h-full bg-[#0a0a0a] relative">
        {/* Isolated Search Header */}
        <header className="h-16 border-b border-white/5 flex items-center px-8 gap-6 bg-[#0a0a0a] relative z-40">
          <div className="flex-1 max-w-3xl relative">
            <div className="flex items-center bg-white/5 rounded-full px-4 py-2 border border-white/10 focus-within:border-purple-500/50 focus-within:ring-1 ring-purple-500/50 transition-all">
              <Search className="text-zinc-500 w-4 h-4 mr-3" />
              <input
                type="text"
                placeholder="搜尋筆記內容或標題..."
                className="bg-transparent border-none outline-none w-full text-white text-sm focus:ring-0 placeholder:text-zinc-600"
                value={ searchText }
                onChange={ e => setSearchText(e.target.value) }
                onFocus={ () => searchText.trim() && setShowSearchDropdown(true) }
              />
            </div>

            { showSearchDropdown && (
              <div 
                className="absolute top-full left-0 right-0 mt-3 bg-[#111111] border border-white/10 rounded-2xl shadow-2xl max-h-[70vh] overflow-y-auto z-50 p-2 backdrop-blur-xl"
                onMouseLeave={() => setShowSearchDropdown(false)}
              >
                { isSearching ? (
                  <div className="p-8 text-center text-zinc-500 text-sm animate-pulse">Searching through your brain...</div>
                ) : searchResults.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    { searchResults.map((result, idx) => (
                      <div
                        key={ idx }
                        onClick={ () => {
                          loadFile(result.path);
                          setShowSearchDropdown(false);
                        } }
                        className="p-3 hover:bg-white/5 rounded-xl cursor-pointer transition-colors group"
                      >
                        <div className="text-sm font-medium text-purple-400 group-hover:text-purple-300 mb-1">{ result.name }</div>
                        <div className="text-xs text-zinc-500 truncate italic">"{ result.preview }"</div>
                        <div className="text-[10px] text-zinc-700 mt-2 font-mono uppercase tracking-tighter">{ result.path }</div>
                      </div>
                    )) }
                  </div>
                ) : (
                  <div className="p-8 text-center text-zinc-500 text-sm">No notes found matching your thoughts.</div>
                ) }
              </div>
            ) }
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-12 relative no-scrollbar">
          { currentFilePath ? (
            <div className="max-w-4xl mx-auto pb-40">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-white/5">
                <div className="flex flex-col gap-1">
                  <h1 className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em]">Active Memory Path</h1>
                  <span className="text-zinc-300 font-medium text-sm">{ currentFilePath }</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={ () => isEditing ? handleSave() : setIsEditing(true) }
                    className="px-6 py-2 rounded-full bg-white text-black hover:bg-zinc-200 font-bold text-xs transition-all shadow-xl active:scale-95"
                  >
                    { isEditing ? '儲存修改' : '修改文章' }
                  </button>
                  <button
                    onClick={ () => {
                      const titleMatch = fileContent.match(/^#\s+(.+)$/m);
                      const title = titleMatch ? titleMatch[1].trim() : (currentFilePath?.split('/').pop() || 'note').replace(/\.md$/, '');
                      const fileName = title + '.md';
                      const blob = new Blob([fileContent], { type: 'text/markdown;charset=utf-8' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url; a.download = fileName; a.click();
                      URL.revokeObjectURL(url);
                    }}
                    title="下載 .md 檔"
                    className="p-2.5 text-zinc-500 hover:text-purple-400 hover:bg-purple-400/10 rounded-full border border-white/5 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                  <button onClick={ () => handleDeleteFile(currentFilePath) } className="p-2.5 text-zinc-600 hover:text-rose-400 hover:bg-rose-400/5 rounded-full border border-white/5 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              { isEditing ? (
                <textarea
                  className="w-full min-h-[75vh] bg-transparent text-zinc-300 outline-none font-mono text-sm leading-relaxed resize-none selection:bg-purple-500/40"
                  value={ fileContent }
                  onChange={ e => setFileContent(e.target.value) }
                  autoFocus
                />
              ) : (
                <div className="text-zinc-300 leading-relaxed max-w-none text-[16px] selection:bg-white/10 
                [&>h1]:text-4xl [&>h1]:font-black [&>h1]:text-white [&>h1]:mb-8 [&>h1]:mt-4
                [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-zinc-100 [&>h2]:mb-6 [&>h2]:mt-12 [&>h2]:border-b [&>h2]:border-white/5 [&>h2]:pb-2
                [&>p]:mb-6 [&>p]:leading-8 [&>p]:text-zinc-400
                [&>ul]:list-disc [&>ul]:pl-8 [&>ul]:mb-6 [&>ul]:space-y-3
                [&>pre]:bg-[#0c0c0c] [&>pre]:p-6 [&>pre]:rounded-2xl [&>pre]:mb-8 [&>pre]:border [&>pre]:border-white/5 [&>pre]:shadow-2xl
                [&>code]:bg-white/5 [&>code]:px-1.5 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-purple-400 [&>code]:text-sm
                [&>blockquote]:border-l-2 [&>blockquote]:border-white/20 [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:text-zinc-500 [&>blockquote]:my-8">
                  <ReactMarkdown
                    remarkPlugins={ [remarkGfm] }
                    rehypePlugins={ [rehypeHighlight] }
                  >
                    { fileContent || '# Thinking Space\nStart writing your thoughts here...' }
                  </ReactMarkdown>
                </div>
              ) }
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-6 mt-[-5vh]">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <div className="relative p-8 bg-zinc-900/50 rounded-full ring-1 ring-white/10 backdrop-blur-3xl shadow-2xl">
                  <Brain className="w-12 h-12 text-zinc-400" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-white font-medium text-lg mb-2">Second Brain is Ready</h3>
                <p className="text-sm text-zinc-500 max-w-xs leading-relaxed">Select a note from the tree or use the cosmic search above to access your knowledge base.</p>
              </div>
            </div>
          ) }
        </div>
      </main>

      {/* Move Dialog Modal */}
      { moveDialog.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">移動到...</h3>
              <button onClick={ () => setMoveDialog({ ...moveDialog, open: false }) } className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              <div className="text-xs text-zinc-500 mb-1">來源：<span className="text-zinc-300">{ moveDialog.sourcePath }</span></div>
              <div className="text-xs text-zinc-500 mb-4">選擇目標資料夾：</div>
              <div className="bg-white/3 border border-white/10 rounded-xl p-3" style={{minHeight: '180px'}}>
                <div
                  onClick={ () => setMoveDialog({ ...moveDialog, targetPath: '' }) }
                  className={ `flex items-center py-1.5 px-2 rounded cursor-pointer text-sm mb-1 transition-colors ${moveDialog.targetPath === '' ? 'bg-purple-600/30 text-purple-400' : 'text-zinc-300 hover:bg-white/5'}` }
                >
                  <Folder className="w-4 h-4 mr-2" /> (根目錄 Root)
                </div>
                <MoveDialogFolderTree
                  nodes={ tree }
                  selectedPath={ moveDialog.targetPath }
                  onSelect={ (path) => setMoveDialog({ ...moveDialog, targetPath: path }) }
                />
              </div>
            </div>
            <div className="p-5 border-t border-white/10 flex justify-end gap-3">
              <button onClick={ () => setMoveDialog({ ...moveDialog, open: false }) } className="px-4 py-2 rounded-lg text-zinc-400 hover:bg-white/5 transition-colors text-sm">取消</button>
              <button onClick={ confirmMove } className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors">確定移動</button>
            </div>
          </div>
        </div>
      ) }

      {/* 衝突解決對話框 */}
      {/* Rename Dialog Modal */}
      { renameDialog?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="bg-[#111111] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-4">
              { renameDialog.type === 'folder' ? '重新命名資料夾' : '重新命名檔案' }
            </h3>
            <input
              autoFocus
              type="text"
              value={ renameDialog.newName }
              onChange={ e => handleRenameInputChange(e.target.value) }
              onKeyDown={ e => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') setRenameDialog(null); } }
              className={ `w-full bg-white/5 border rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:ring-1 transition-all ${renameDialog.error ? 'border-rose-500 focus:ring-rose-500/50' : 'border-white/10 focus:ring-purple-500/50 focus:border-purple-500/50'}` }
            />
            { renameDialog.error && (
              <p className="text-rose-400 text-xs mt-2">{ renameDialog.error }</p>
            ) }
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={ () => setRenameDialog(null) } className="px-4 py-2 rounded-lg text-zinc-400 hover:bg-white/5 transition-colors text-sm">取消</button>
              <button
                onClick={ submitRename }
                disabled={ !!renameDialog.error || !renameDialog.newName.trim() }
                className="px-5 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
              >確定</button>
            </div>
          </div>
        </div>
      ) }

      { conflictDialog?.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="bg-[#111111] border border-amber-500/30 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-start gap-3 mb-5">
              <div className="text-amber-400 text-2xl mt-0.5">⚠️</div>
              <div>
                <h3 className="text-base font-semibold text-white mb-1">名稱衝突</h3>
                <p className="text-sm text-zinc-400">
                  目標資料夾中已存在「<span className="text-amber-300 font-medium">{ conflictDialog.conflictingName }</span>」，請選擇處理方式：
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={ handleConflictOverwrite }
                className="w-full px-4 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 border border-rose-500/30 text-rose-300 text-sm font-medium transition-colors text-left flex items-center gap-2"
              >
                <span className="text-base">🗑️</span> 覆蓋 — 刪除目標並取代
              </button>
              <button
                onClick={ handleConflictRename }
                className="w-full px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 text-purple-300 text-sm font-medium transition-colors text-left flex items-center gap-2"
              >
                <span className="text-base">✏️</span> 重新命名 — 移動並使用新名稱
              </button>
              <button
                onClick={ () => setConflictDialog(null) }
                className="w-full px-4 py-2.5 rounded-xl hover:bg-white/5 border border-white/10 text-zinc-400 text-sm font-medium transition-colors text-left flex items-center gap-2"
              >
                <span className="text-base">❌</span> 取消 — 不要移動
              </button>
            </div>
          </div>
        </div>
      ) }
    </div>
  );
}
