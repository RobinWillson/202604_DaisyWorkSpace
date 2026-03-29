# Second Brain 模組移植與重構計畫 (B02a)

在分析了舊有的 `second-brain-app` 專案碼後，我們發現其中有非常大部分的前端邏輯與元件是可以直接重用 (Reuse) 或輕微改寫的。為了避免重工，以下是針對如何將它完美移植到大單體架構 (Modular Monolith) 的詳細規劃：

## 1. 前端 UI 與邏輯移植 (Frontend Migration)

在舊有的 `second-brain-app/src/app/page.tsx` 中，它是一個將所有元件（Sidebar, Editor, Search）包在一起的巨型檔案（Monolithic File）。我們將藉由這次移植進行重構拆分。

### 可直接重用的元件 (Reusable Components)
- **Markdown 渲染器**：包含 `ReactMarkdown` 搭配 `remark-gfm` 與 `rehype-highlight` 的設定，以及長達兩百字的 Tailwind 排版 CSS (如 `[&>h1]:text-2xl ...`)。這可以原封不動搬過去。
- **樹狀目錄遞迴渲染 (Tree Rendering)**：舊版的 `Sidebar` 中的 `renderTree` 函式與 `MoveDialogFolderTree` 完美處理了資料夾的摺疊、展開，這部分的 JS 邏輯完全不需要重新思考。
- **彈出式選單與搜尋對話框**：這些 HTML 結構與 Tailwind 樣式可以直接沿用。

### 需要改寫或拆分的元件 (Refactoring)
- **子側邊欄 (Sub-Sidebar)**：由於大單體架構已經有一個全域的 Sidebar，原本的 `Sidebar` 應被轉型為「第二大腦專屬的次級側邊欄」，並放進 `src/app/(dashboard)/second-brain/layout.tsx` 中（或者作為 Client Component 放在頁面左側），以處理專屬的 `tree` 狀態。
- **API 路徑修改**：所有元件內呼叫的 API（如 `fetch('/api/tree')`），需統一加上前綴修改為 `fetch('/api/second-brain/tree')`，以防與未來其他的 APP（如 ToDoList）衝突。

## 2. 後端 API 移植與資料庫化 (Backend Database Adaptation)

舊有的 API 是基於 Node.js 內建的 `fs` (File System) 對實體硬碟進行讀寫。我們要保留「介面合約 (API Contract)」，也就是說，前端呼叫 API 得到的 JSON 格式必須維持原樣，但**底層實作必須全數換成 Prisma + PostgreSQL**。

### API 轉換對照表與改寫策略

| 原始 API (檔案系統) | 移植後 API (PostgreSQL) | 底層改寫說明 |
| :--- | :--- | :--- |
| `GET /api/tree` | `GET /api/second-brain/tree` | 不再讀取硬碟目錄。改為執行 `prisma.folder.findMany()` 與 `prisma.note.findMany({ where: { is_deleted: false } })`，並在後端用 TypeScript 遞迴組裝出與舊版結構一模一樣的 JSON Tree (`{name, path, type: 'folder'|'file', children}`)。|
| `GET /api/file` | `GET /api/second-brain/file` | 不再用 `fs.readFile` 讀取 `.md`。改為從資料庫 `prisma.note.findFirst` 出對應的 `content` 欄位並回傳。 |
| `PUT /api/file` | `PUT /api/second-brain/file` | 將收到的 Markdown 字串存入資料庫：使用 `prisma.note.upsert()` 更新內容。 |
| `DELETE /api/file` | `DELETE /api/second-brain/file` | 放棄移至 `.trash` 資料夾的做法。改為加上標記 `prisma.note.update({ data: { is_deleted: true } })`。 |
| `POST /api/search` | `POST /api/second-brain/search` | 捨棄在伺服器用 Regex 爆搜所有實體檔案。改用高雅的 `prisma.note.findMany({ where: { content: { contains: query } } })` 瞬間找出結果。 |
| `POST /api/folder` | `POST /api/second-brain/folder` | 從 `fs.mkdir` 改成 `prisma.folder.create(...)` 建立資料表紀錄。 |

## 3. 執行順序建議

為了讓應用程式能順利銜接，建議採取以下順序：
1. **先造後端**：先在 `src/app/api/second-brain/` 底下建立好這些 RESTFul APIs，並把 Prisma 邏輯寫進去。用硬派的 Postman 或直接寫幾篇測試紀錄進 DB 以確保 JSON 格式與舊版一模一樣。
2. **再接前端**：將 `second-brain-app/src/app/page.tsx` 搬移到 `src/app/(dashboard)/second-brain/page.tsx`，調整樣式使其融入新版深色 Glassmorphism 風格，並替換 API endpoints。
3. **最後清理**：功能跑通後，就可以把舊的 `second-brain-app` 整個資料夾丟棄了。
