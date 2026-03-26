'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Folder, FileText, Search, PlusCircle, Trash2, Book, MoreVertical, X } from 'lucide-react';

function MoveDialogFolderTree({ nodes, selectedPath, onSelect, level = 0 }: { nodes: any[], selectedPath: string, onSelect: (path: string) => void, level?: number }) {
  return (
    <ul className={ level > 0 ? "pl-3 mt-1 border-l border-gray-700 ml-2 space-y-1" : "space-y-1" }>
      { nodes.filter(n => n.type === 'folder').map(node => (
        <li key={ node.path }>
          <div
            onClick={ () => onSelect(node.path) }
            className={ `flex items-center py-1.5 px-2 rounded cursor-pointer text-sm transition-colors ${selectedPath === node.path ? 'bg-blue-600/30 text-blue-400 font-medium' : 'text-gray-300 hover:bg-gray-700'}` }
          >
            <Folder className="w-4 h-4 mr-2" /> { node.name }
          </div>
          { node.children && (
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
  onInitFolders: () => void;
}

function Sidebar({ tree, onSelectFile, onCreateFile, onCreateFolder, onRenameFolder, onMoveFolder, onDeleteFolder, onRenameFile, onMoveFile, onDeleteFile, onInitFolders }: SidebarProps) {
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
    return (
      <ul className={ level > 0 ? "pl-3 mt-1 space-y-1 border-l border-gray-800/50 ml-2" : "mt-1 space-y-1" }>
        { nodes.map(node => {
          const isExpanded = expandedFolders.has(node.path);
          const isCoreFolder = level === 0 && ['00-inbox', '01-projects', '02-areas', '03-resources', '04-archive'].includes(node.name);
          
          return (
            <li key={ node.path } className="text-sm">
              { node.type === 'folder' ? (
                <div className="flex flex-col">
                  <div
                    onClick={ (e) => toggleFolder(node.path, e) }
                    className="group relative flex items-center justify-between text-gray-400 font-medium py-1.5 px-2 rounded-md hover:bg-gray-800 hover:text-gray-200 cursor-pointer transition-colors select-none"
                  >
                    <div className="flex items-center">
                      <Folder className={ `w-4 h-4 mr-2 transition-colors ${isExpanded ? 'text-blue-400' : 'text-gray-500'}` } />
                      { node.name }
                    </div>

                    <div className="hidden group-hover:flex items-center">
                      <button
                        onClick={ (e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === node.path ? null : node.path);
                        } }
                        className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
                        title="更多選項"
                      >
                        <MoreVertical className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    { activeDropdown === node.path && (
                      <div className="absolute right-0 top-full mt-1 w-32 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-20 text-xs text-gray-300 font-normal">
                        <div onClick={ (e) => { e.stopPropagation(); setActiveDropdown(null); onCreateFile(node.path); } } className="px-3 py-1.5 hover:bg-gray-700 cursor-pointer text-left">新增檔案</div>
                        <div onClick={ (e) => { e.stopPropagation(); setActiveDropdown(null); onCreateFolder(node.path); } } className="px-3 py-1.5 hover:bg-gray-700 cursor-pointer text-left">新增資料夾</div>
                        {!isCoreFolder && <div onClick={ (e) => { e.stopPropagation(); setActiveDropdown(null); onRenameFolder(node.path, node.name); } } className="px-3 py-1.5 hover:bg-gray-700 cursor-pointer text-left">重新命名</div>}
                        {!isCoreFolder && <div onClick={ (e) => { e.stopPropagation(); setActiveDropdown(null); onMoveFolder(node.path); } } className="px-3 py-1.5 hover:bg-gray-700 cursor-pointer text-left">移動到</div>}
                        {!isCoreFolder && <div onClick={ (e) => { e.stopPropagation(); setActiveDropdown(null); onDeleteFolder(node.path); } } className="px-3 py-1.5 hover:bg-gray-700 cursor-pointer text-left text-red-400">刪除資料夾</div>}
                      </div>
                    ) }
                  </div>
                  { isExpanded && node.children && renderTree(node.children, level + 1) }
                </div>
              ) : (
                <div
                  className="group relative flex items-center justify-between text-gray-300 hover:bg-gray-800 py-1.5 px-2 rounded-md cursor-pointer transition-colors select-none"
                  onClick={ () => onSelectFile(node.path) }
                >
                  <div className="flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-2 text-gray-500" /> { node.name }
                  </div>

                  <div className="hidden group-hover:flex items-center">
                    <button
                      onClick={ (e) => {
                        e.stopPropagation();
                        setActiveDropdown(activeDropdown === node.path ? null : node.path);
                      } }
                      className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
                      title="更多選項"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  { activeDropdown === node.path && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-gray-800 border border-gray-700 rounded-md shadow-lg py-1 z-20 text-xs text-gray-300 font-normal">
                      <div onClick={ (e) => { e.stopPropagation(); setActiveDropdown(null); onRenameFile(node.path, node.name); } } className="px-3 py-1.5 hover:bg-gray-700 cursor-pointer text-left">重新命名</div>
                      <div onClick={ (e) => { e.stopPropagation(); setActiveDropdown(null); onMoveFile(node.path); } } className="px-3 py-1.5 hover:bg-gray-700 cursor-pointer text-left">移動到</div>
                      <div onClick={ (e) => { e.stopPropagation(); setActiveDropdown(null); onDeleteFile(node.path); } } className="px-3 py-1.5 hover:bg-gray-700 cursor-pointer text-left text-red-400">刪除檔案</div>
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
    <div className="w-72 bg-[#0a0a0a] border-r border-gray-800 h-screen overflow-y-auto p-4 flex flex-col">
      <div className="text-xl font-bold tracking-tight flex items-center justify-between mb-6 text-white px-2 group">
        <div className="flex items-center gap-2">
          🧠 Second Brain
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {tree.length === 0 && (
            <button 
              onClick={onInitFolders}
              className="px-2 py-0.5 hover:bg-blue-500 rounded bg-blue-600/20 text-blue-400 hover:text-white transition-colors text-xs font-bold leading-tight border border-blue-500/30" 
              title="一鍵初始化 00~04 目錄"
            >
              Init
            </button>
          )}
        </div>
      </div>
      <nav className="flex-1">
        { renderTree(tree) }
      </nav>
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div
          onClick={ () => onSelectFile('使用原則') }
          className="flex items-center text-gray-300 hover:text-white hover:bg-gray-800 py-2 px-2 rounded-md cursor-pointer transition-colors select-none"
        >
          <Book className="w-4 h-4 mr-2 text-indigo-400" /> 使用原則 (PARA 機制)
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [tree, setTree] = useState([]);
  const [currentFilePath, setCurrentFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [moveDialogState, setMoveDialogState] = useState<{ isOpen: boolean, sourcePath: string, targetPath: string }>({ isOpen: false, sourcePath: '', targetPath: '' });

  const loadTree = async () => {
    const res = await fetch('/api/tree');
    if (res.ok) setTree(await res.json());
  };

  useEffect(() => {
    loadTree();
    // basic css for highlight parsing
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
        const res = await fetch('/api/search', {
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

  const paraDocs = `# PARA 數位大腦建立指南

歡迎來到 PARA 系統！本指南將協助你建立一套「以行動為導向」的第二大腦（Second Brain），讓你的知識不再只是囤積，而是能真正轉化為產出。

## 為什麼要使用 PARA？

PARA 是由組織學專家 Tiago Forte 提出的知識管理方法論。它的核心精神是：**「依據行動力（Actionability）來分類，而不是依據主題分類」**。

很多使用者在剛開始整理資料時，會傾向以「主題」（如「人工智慧」、「健康生活」）作為最上層的資料夾結構。這其實是傳統圖書館的分類法。在數位時代，如果採用主題分類，往往會遭遇以下問題：當你執行一個跨主題的任務（例如：「利用 AI 來分析台灣股市資料」）時，你會卡在「這到底該放在人工智慧還是股市？」的抉擇中。

PARA 系統完美解決了這個問題。它將當下最需要行動的「專案」放在最前端，並將龐雜的知識與興趣統一歸納到「資源」中。這能確保你隨時專注於當下正在執行的任務，而不是在茫茫的知識樹中迷失。

---

## PARA 的標準四層架構

在你的系統中最上層，只需要建立以下四個核心資料夾：

\`\`\`text
/01-projects (專案)
/02-areas (領域)
/03-resources (資源)
/04-archive (檔案庫)
\`\`\`

以下將透過「人工智慧、台灣股市研究、健康生活、語言學習」這四大常見主題，為你示範資料該如何在這四個層級中分佈與流動。

### 📂 01-projects (短期任務)
**定義**：有明確「截止日期」與「具體目標」的短期任務。
**任務屬性**：現在正在做、即將做的項目。有明確的截止日期（Deadline）與明確的結束點。
**做法**： 在 PARA 的 \`01-projects\` 資料夾中，要列出具體動作，如「買網域」、「畫草圖」、「寫結案報告」，而你存放的是執行這些動作所需要的**參考資料與草稿**。
**使用方式**：這是你當下行動力最高的區域。這裡不放純理論知識，只放為了完成特定專案而需要的素材與進度。

**範例**：
* \`/開發一個 AI 股票分析小工具\` (結合了 AI 與股市知識進行產出)
* \`/準備 2026 年底的多益考試\` (語言學習的具體目標)
* \`/執行三個月減脂計畫\` (健康生活的短期衝刺)

### 📂 02-areas (週期性任務)
**定義**：需要「長期維持標準」，沒有具體結束日期的生活層面或責任範圍。
**任務屬性**：持續在做、習慣養成的事情。沒有明確終點，需要長期維持標準。
**做法**： 「每週去健身房三次」、「每個月閱讀一本書」、「每週整理帳單」等任務，這些不會有「做完就結案」的一天。在 PARA 的 \`02-areas\` 中，你可以放相對應的輔助檔案，如「健身菜單」、「書摘筆記」、「年度理財報表」。

**使用方式**：這些是你需要持續關注以維持水準的領域。有別於專案，領域是持續進行式的。

**範例**：
* \`/健康與健身\` (包含你的日常運動課表、健檢紀錄)
* \`/財務投資\` (包含你的年度理財原則、記帳檔)

### 📂 03-resources (長期任務或想法)
**定義**：你感興趣的「主題」、參考資料、學習筆記與備用知識庫。
**任務屬性**：未來想做、不知道什麼時候做的項目。也是 GTD（Getting Things Done）系統中常說的**「Someday / Maybe（有一天/或許清單）」**。
**做法**：那些「等我有空想學日文」、「一年後想去歐洲玩」的項目。因為現在沒有行動力，就把這些想法當作「知識庫」存起來。在 PARA 的 \`03-resources\` 裡建立 \`日文學習\` 或 \`歐洲旅遊\` 的資料夾，平時看到不錯的資源就往裡面丟。當哪天你真的決定要執行時，它就會從 \`03-resources\` 被挪到 \`01-projects\` 裡頭。
**使用方式**：這正是存放各大主題知識的主要基地。當你在專案或領域中需要素材時，就會來這裡尋找。

**範例**：
* \`/人工智慧\` (新聞剪報、論文筆記、Prompt 技巧、工具清單)
* \`/台灣股市研究\` (產業分析報告、個股研究、總經筆記)
* \`/健康生活\` (營養學知識、食譜收集、睡眠科學)
* \`/語言學習\` (單字庫、文法觀念總整理、優質頻道連結)

### 📂 04-archive (檔案庫)
**定義**：備查用的冷庫存。
**使用方式**：當前面三個資料夾（專案、領域、資源）中有不再活躍的內容，不需要刪除，只要移到檔案庫即可，以保持工作區的整潔。

**範例**：
* 早已結案的專案（例如：\`/2025 年多益考試準備_已完成\`）
* 現階段決定不再關注的資源與領域。

---

## 結語

請謹記：**PARA 是一個動態系統**。你的資料不該永遠停留在同一個地方，而是會隨著你的生命重心在這四個資料夾之間流動。

依循這套架構，你的 Second Brain 將成為一個**推動你採取行動的數位工作站**，幫助你在紛亂的資訊中找到專注的節奏。準備好了嗎？現在就建立這四個資料夾，開啟你的高產能數位大腦吧！`;

  const loadFile = async (path: string) => {
    setCurrentFilePath(path);
    setIsEditing(false);

    if (path === '使用原則') {
      setFileContent(paraDocs);
      return;
    }

    const res = await fetch('/api/file?path=' + encodeURIComponent(path));
    if (res.ok) {
      const data = await res.json();
      setFileContent(data.content);
    }
  };

  const handleCreateFolder = async (parentPath: string) => {
    const name = prompt('請輸入子資料夾名稱：');
    if (!name) return;
    await fetch('/api/folder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ parentPath, name })
    });
    loadTree();
    // Expand the parent folder implicitly to show the new folder
    // But since state is down in Sidebar, user might need to click again unless we lift state. We'll leave it simple for now.
  };

  const handleInitFolders = async () => {
    const defaultFolders = ['00-inbox', '01-projects', '02-areas', '03-resources', '04-archive'];
    for (const folder of defaultFolders) {
      await fetch('/api/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentPath: '', name: folder })
      });
    }
    loadTree();
  };

  const handleCreateFile = async (parentPath: string) => {
    const name = prompt('請輸入新檔案名稱 (不需輸入 .md)：');
    if (!name) return;
    const fileName = name.endsWith('.md') ? name : name + '.md';
    const filePath = parentPath + '/' + fileName;

    // Create an empty file with title heading
    await fetch('/api/file?path=' + encodeURIComponent(filePath), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '# ' + name })
    });

    loadTree();
    loadFile(filePath);
  };

  const handleRenameFolder = async (path: string, currentName: string) => {
    const newName = prompt('請輸入新的資料夾名稱：', currentName);
    if (!newName || newName === currentName) return;
    await fetch('/api/folder-actions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rename', sourcePath: path, newName })
    });
    loadTree();
  };

  const handleMoveFolder = (path: string) => {
    setMoveDialogState({ isOpen: true, sourcePath: path, targetPath: '' });
  };

  const confirmMove = async () => {
    if (!moveDialogState.sourcePath) return;
    await fetch('/api/folder-actions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'move', sourcePath: moveDialogState.sourcePath, targetPath: moveDialogState.targetPath })
    });
    setMoveDialogState({ isOpen: false, sourcePath: '', targetPath: '' });
    loadTree();
  };

  const handleDeleteFolder = async (path: string) => {
    if (!confirm('確定要將此資料夾移至垃圾桶嗎？')) return;
    await fetch('/api/folder-actions?path=' + encodeURIComponent(path), { method: 'DELETE' });
    loadTree();
  };

  const handleRenameFile = async (path: string, currentName: string) => {
    let newName = prompt('請輸入新的檔案名稱：', currentName);
    if (!newName || newName === currentName) return;
    if (!newName.toLowerCase().endsWith('.md')) newName += '.md';

    await fetch('/api/folder-actions', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'rename', sourcePath: path, newName })
    });
    loadTree();
  };

  const handleMoveFile = (path: string) => {
    setMoveDialogState({ isOpen: true, sourcePath: path, targetPath: '' });
  };

  const handleDeleteFile = async (path: string) => {
    if (!confirm('確定要將此檔案移至垃圾桶嗎？')) return;
    await fetch('/api/file?path=' + encodeURIComponent(path), { method: 'DELETE' });
    if (currentFilePath === path) {
      setCurrentFilePath(null);
      setFileContent('');
    }
    loadTree();
  };

  const handleSave = async () => {
    if (!currentFilePath) return;
    await fetch('/api/file?path=' + encodeURIComponent(currentFilePath), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: fileContent })
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (!currentFilePath) return;
    if (!confirm('Move this file to trash?')) return;
    await fetch('/api/file?path=' + encodeURIComponent(currentFilePath), { method: 'DELETE' });
    setCurrentFilePath(null);
    setFileContent('');
    loadTree();
  };

  return (
    <div className="flex bg-[#111111] text-gray-200 h-screen font-sans">
      <Sidebar
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
        onInitFolders={ handleInitFolders }
      />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar / Full-text Search */ }
        <header className="h-16 border-b border-gray-800 flex items-center px-6 gap-4 bg-[#0a0a0a] relative z-40">
          <div className="flex-1 max-w-2xl relative">
            <div className="flex items-center bg-gray-900 rounded-lg px-3 py-2 border border-gray-800 focus-within:border-blue-500/50 focus-within:ring-1 ring-blue-500/50 transition-all">
              <Search className="text-gray-500 w-4 h-4 mr-2" />
              <input
                type="text"
                placeholder="搜尋筆記標題與內容... (Search notes)"
                className="bg-transparent border-none outline-none w-full text-white text-sm focus:ring-0"
                value={ searchText }
                onChange={ e => setSearchText(e.target.value) }
                onFocus={ () => searchText.trim() && setShowSearchDropdown(true) }
                onBlur={ () => setTimeout(() => setShowSearchDropdown(false), 200) }
              />
            </div>

            { showSearchDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50">
                { isSearching ? (
                  <div className="p-4 text-center text-gray-500 text-sm">搜尋中...</div>
                ) : searchResults.length > 0 ? (
                  <div className="py-2">
                    { searchResults.map((result, idx) => (
                      <div
                        key={ idx }
                        onClick={ () => {
                          loadFile(result.path);
                          setShowSearchDropdown(false);
                        } }
                        className="px-4 py-2 hover:bg-gray-800 cursor-pointer border-b border-gray-800/50 last:border-0"
                      >
                        <div className="text-sm font-medium text-blue-400 mb-1">{ result.name }</div>
                        <div className="text-xs text-gray-400 truncate">{ result.preview }</div>
                        <div className="text-[10px] text-gray-600 mt-1">{ result.path }</div>
                      </div>
                    )) }
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">找不到相關筆記</div>
                ) }
              </div>
            ) }
          </div>
        </header>

        {/* Editor / Viewer */ }
        <div className="flex-1 overflow-y-auto p-10 relative">
          { currentFilePath ? (
            <div className="max-w-4xl mx-auto pb-32">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800/80">
                <span className="text-gray-500 font-mono text-xs tracking-wide bg-gray-900 px-2 py-1 rounded">
                  { currentFilePath }
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={ () => isEditing ? handleSave() : setIsEditing(true) }
                    className="px-4 py-1.5 rounded bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 font-medium text-sm transition-colors border border-blue-500/20"
                  >
                    { isEditing ? 'Save Markdown' : 'Edit Note' }
                  </button>
                  <button onClick={ handleDelete } className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded border border-transparent hover:border-red-400/20 transition-all" title="Move to trash">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              { isEditing ? (
                <textarea
                  className="w-full min-h-[70vh] bg-transparent text-gray-300 outline-none font-mono text-sm leading-relaxed resize-y"
                  value={ fileContent }
                  onChange={ e => setFileContent(e.target.value) }
                />
              ) : (
                <div className="text-gray-300 leading-relaxed max-w-none text-[15px] [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:text-white [&>h1]:mb-6 [&>h1]:mt-8 [&>h2]:text-xl [&>h2]:font-semibold [&>h2]:text-white [&>h2]:mb-4 [&>h2]:mt-6 [&>h3]:text-lg [&>h3]:font-medium [&>h3]:text-white [&>h3]:mb-3 [&>h3]:mt-5 [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4 [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4 [&>pre]:bg-[#0d0d0d] [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:mb-4 [&>pre]:border [&>pre]:border-gray-800 [&>code]:bg-gray-800 [&>code]:px-1 [&>code]:py-0.5 [&>code]:rounded [&>code]:text-blue-300 [&>blockquote]:border-l-4 [&>blockquote]:border-gray-700 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-gray-400">
                  <ReactMarkdown
                    remarkPlugins={ [remarkGfm] }
                    rehypePlugins={ [rehypeHighlight] }
                  >
                    { fileContent }
                  </ReactMarkdown>
                </div>
              ) }
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-4 mt-[-10vh]">
              <div className="p-4 bg-gray-900/50 rounded-full">
                <Folder className="w-8 h-8 opacity-50" />
              </div>
              <p className="text-sm">Select a file from the sidebar to view its contents, or use Quick Capture above.</p>
            </div>
          ) }
        </div>
      </main>

      {/* Move Folder Modal */ }
      { moveDialogState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-md shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
              <h3 className="text-lg font-medium text-white">移動資料夾</h3>
              <button onClick={ () => setMoveDialogState({ ...moveDialogState, isOpen: false }) } className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <div className="mb-2 text-sm text-gray-400">目前選擇：<span className="text-gray-200">{ moveDialogState.sourcePath }</span></div>
              <div className="mb-4 text-sm text-gray-400">選擇目標（預設為根目錄）：</div>
              <div className="bg-gray-950 border border-gray-800 p-2 rounded-md h-64 overflow-y-auto">
                <div
                  onClick={ () => setMoveDialogState({ ...moveDialogState, targetPath: '' }) }
                  className={ `flex items-center py-1.5 px-2 rounded cursor-pointer text-sm transition-colors mb-1 ${moveDialogState.targetPath === '' ? 'bg-blue-600/30 text-blue-400 font-medium' : 'text-gray-300 hover:bg-gray-700'}` }
                >
                  <Folder className="w-4 h-4 mr-2" /> (根目錄 Root)
                </div>
                <MoveDialogFolderTree
                  nodes={ tree }
                  selectedPath={ moveDialogState.targetPath }
                  onSelect={ (path) => setMoveDialogState({ ...moveDialogState, targetPath: path }) }
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-800 flex justify-end gap-3 bg-gray-900 rounded-b-lg">
              <button
                onClick={ () => setMoveDialogState({ ...moveDialogState, isOpen: false }) }
                className="px-4 py-2 rounded-md text-gray-300 hover:bg-gray-800 transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={ confirmMove }
                className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-500 text-white transition-colors text-sm font-medium"
              >
                確定移動
              </button>
            </div>
          </div>
        </div>
      ) }
    </div>
  );
}
