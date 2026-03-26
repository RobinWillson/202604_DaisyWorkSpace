請幫我建立一個「Second Brain UI」個人知識庫系統。

### 技術棧
- Next.js 14 App Router + TypeScript ✅
- Tailwind CSS（深色主題） ✅
- react-markdown + remark-gfm + rehype-highlight（Markdown 渲染） ✅
- 資料來源：本機 Markdown 資料夾（透過環境變數 NOTES_PATH 設定路徑） ✅
- Markdown 內容格式符合 Obsidian 連結架構
- 不使用資料庫，所有資料直接讀寫檔案系統 ✅
- （選用）better-sqlite3 + sqlite-vec 做語意搜尋的向量儲存

### 核心功能

1. **檔案樹瀏覽（Sidebar）**
   - 左側側邊欄顯示完整的資料夾樹狀結構 ✅
   - 支援展開/收合資料夾 ✅
   - 點擊檔案名稱在主閱讀區開啟 ✅
   - 隱藏 .trash/ 資料夾和隱藏檔案 ✅
   - 資料夾右側，下拉式功能按鈕 ✅
     - 新增檔案 ✅
     - 新增資料夾 ✅
     - 重新命名 ✅
     - 移動到 ✅
     - 刪除資料夾 ✅
   - 檔案右側，下拉式功能按鈕 ✅
     - 重新命名 ✅
     - 移動到 ✅
     - 刪除 ✅
   - 顯示最近開啟的檔案列表 ❌
   
   1.1 **重新命名**：跳出一個視窗，預設會顯示目前的名稱，反白選取，輸入新的名稱，按下確定後，重新命名資料夾或檔案。 ✅
   1.2 **移動到**：跳出一個 dialog 視窗，顯示整個資料夾的樹狀結構，選擇目標資料夾，按下確定後，移動資料夾或檔案。 ✅
   1.3 **刪除**：跳出一個視窗，確認是否刪除，按下確定後，刪除資料夾或檔案。注意會刪除所有子資料夾與檔案。 ✅

   

2. **Markdown 閱讀器（MarkdownViewer）**
   - 支援 GFM（GitHub Flavored Markdown） ✅
   - 程式碼語法高亮 ✅
   - 自動生成大綱面板（Outline Panel），從 H1-H6 標題提取 [待實作]
   - 內部連結跳轉（`[[檔名]]` 格式）❌
   - 響應式設計（桌面/平板/手機） ✅



4. **選取文字 Quick Actions（浮動工具列）**
   - 選取任何筆記文字後，浮動工具列提供快捷操作：
     - **建 Idea 卡**：將選取文字存為新想法檔案（00-inbox/ideas/）
     - **加待辦**：將選取文字存為新待辦（格式化成 task）
     - **深度研究**：啟動研究分析流程
     - **開 Kanban 卡**：透過 API 連接到任務管理系統
   - 工具列在選取文字後自動浮現，可手動關閉

5. **全文搜尋** ✅
   - 搜尋框輸入關鍵字，即時搜尋檔名與檔案內容 ✅
   - 顯示搜尋結果列表（檔名、預覽、路徑） ✅
   - 點擊結果直接跳轉到檔案 ✅

6. **每日回顧（Daily Review）**
   - 以日期格式檔名（YYYY-MM-DD.md）自動識別
   - 隨機顯示 3-5 筆歷史筆記進行間隔回顧
   - 支援切換下一筆/上一筆

7. **Copilot 對筆記提問**
   - 右側側邊欄或浮動面板提供 Copilot 功能
   - 可對當前筆記提問，AI 基於筆記內容回答
   - 支援語意搜尋（Semantic Search）：輸入問題，找出相關筆記段落

8. **編輯與刪除**
   - 編輯模式：可直接編輯 Markdown 內容 ✅
   - 儲存前偵測是否有未儲存變更（切換檔案、重整時提醒）
   - 刪除檔案會移至 .trash/ 資料夾（可還原） ✅
   - 支援樂觀並行控制（Optimistic Concurrency）：多人同時編輯時偵測衝突 ✅

### API 端點設計

請建立以下 Next.js API Routes：

| 方法   | 端點                         | 說明                                          |
| ------ | ---------------------------- | --------------------------------------------- |
| GET    | /api/tree                    | 取得完整檔案樹結構                            | ✅ |
| GET    | /api/file?path={path}        | 讀取單一檔案內容（回傳 content + modifiedAt） | ✅ |
| PUT    | /api/file?path={path}        | 更新檔案內容（需帶 modifiedAt 做衝突偵測）    | ✅ |
| DELETE | /api/file?path={path}        | 刪除檔案（移至 .trash）                       | ✅ |
| POST   | /api/capture                 | Quick Capture 建新檔                          | ✅ |
| POST   | /api/search                  | 全文搜尋                                      | ✅ |
| GET    | /api/review                  | 每日回顧隨機筆記                              | ✅ |
| POST   | /api/actions/capture-idea    | 選取文字建 Idea                               |
| POST   | /api/actions/add-todo        | 選取文字加待辦                                |
| POST   | /api/copilot/ask             | 對筆記提問（需 OpenAI API）                   |
| POST   | /api/copilot/semantic-search | 語意搜尋（需 OpenAI API）                     |

### UI/UX 設計要求

- 簡潔深色主題：側邊欄深色、主閱讀區中性灰背景 ✅
- 響應式設計：支援桌面、平板、手機 ✅
- 鍵盤捷徑：
  - Cmd/Ctrl + K：快速搜尋
  - Cmd/Ctrl + N：New Capture
  - Cmd/Ctrl + E：切換編輯/閱讀模式
- 動畫過渡：檔案切換、側邊欄收合要有流暢動畫

### 資料夾結構範例

```
notes/
├── 00-inbox/           # 收件匣
├── 01-projects/        # 專案
├── 02-areas/           # 責任領域
├── 03-resources/       # 參考資源
├── 04-archive/         # 歸檔
└── .trash/             # 回收桶
```

### 型別定義

```typescript
interface FileNode {
  name: string;
  path: string;
  type: 'file';
  modifiedAt?: string;
}

interface FolderNode {
  name: string;
  path: string;
  type: 'folder';
  children: (FolderNode | FileNode)[];
}

interface SearchResult {
  path: string;
  name: string;
  preview: string;
  score?: number;
}
```

### 與 AI Agent 整合

所有 API 端點都需要支援 CORS（讓 AI Agent 可以調用）。
建議新增 /api/integration 端點，提供 AI 專用的彙總操作。
設定 ALLOWED_WRITE_PATHS 環境變數，限制 AI 可寫入的路徑（例如只允許 00-inbox/）。

### 環境變數

請在 .env.local 中設定：

```
NOTES_PATH=/path/to/your/notes
TRASH_PATH=.trash
PORT=3002
HOST=127.0.0.1
OPENAI_API_KEY=sk-your-key（選用，Copilot 功能需要）
OPENAI_MODEL=gpt-4（選用）
```

### 建置優先順序

Phase 1：檔案樹 + Markdown 閱讀器 + API
Phase 2：Quick Capture
Phase 3：搜尋 + Daily Review
Phase 4：Quick Actions 浮動工具列
Phase 5：Copilot + 語意搜尋
Phase 6：編輯 + 刪除 + 衝突偵測
Phase 7：最近檔案 + 大綱面板 + 鍵盤捷徑
```

---

## 🔧 建置後設定

建置完成後，請進行以下設定：

### 1. 環境變數配置

編輯 `.env.local`，設定你的筆記路徑：

```bash
NOTES_PATH=/home/你的使用者名稱/Documents/notes
TRASH_PATH=.trash
```

### 2. （選用）設定 AI API

如果要使用 Copilot 和語意搜尋功能，填入 OpenAI API Key：

```bash
OPENAI_API_KEY=sk-your-actual-key
OPENAI_MODEL=gpt-4
```

### 3. PM2 設定（讓服務在背景持續執行）

```bash
# 安裝 PM2
npm install -g pm2

# 建置專案
npm run build

# 啟動服務
pm2 start npm --name "second-brain" -- start

# 設定開機自啟
pm2 save
pm2 startup
```

### 4. 測試各項功能

啟動後訪問 `http://127.0.0.1:3002`，測試：
- 檔案瀏覽與閱讀
- Quick Capture
- 搜尋功能
- Daily Review
- Quick Actions
- Copilot 提問（如果設定了 AI API）

## 💡 自訂建議

### 資料夾結構
用 PARA（Projects/Areas/Resources/Archive）結構

### Quick Actions 自訂
你可以修改 Quick Actions 的行為，例如：
- 加入「發到 Twitter」的動作
- 加入「建立日記條目」的動作
- 修改歸類的目標資料夾

### Copilot 模型選擇
除了 OpenAI，你也可以改用：
- Anthropic Claude API
- 本地 Ollama（完全免費）
- Google Gemini API

### 外部系統連接
Quick Actions 的「開 Kanban 卡」可以連接到你自己的 Kanban 系統（見 02-kanban-dashboard.md），只要修改 API 端點即可。

### 與 OpenClaw 整合
如果使用 OpenClaw，你的 AI Agent 可以：
- 透過 API 讀取和寫入筆記
- 自動整理 inbox
- 每天生成筆記摘要
- 回答你對筆記的提問
