# NextJS Second Brain Web App: 逐步建置計畫 (Modular Monolith & PostgreSQL 版)

基於大單體 (Dashboard) 架構，Second Brain 將作為系統底下的一個核心子模組。同時，資料儲存將由原先的「本地 Markdown 檔案存取」全面轉移至線上 **PostgreSQL 資料庫**。

## 步驟 1: 環境設定與資料庫 (PostgreSQL)
1. **模組化路徑定位**: 所有的頁面開發將位於 `src/app/(dashboard)/second-brain/`，無須建立獨立專案。
2. **安裝核心套件**:
   - 資料庫工具: `npm install @prisma/client` 與 `npm install -D prisma`。
   - Markdown 處理器: `npm install react-markdown remark-gfm rehype-highlight` (保留我們先前優異的渲染體驗)。

3. **設計資料表 (Schema)**: 
   在 `database/schema.prisma` 中設計結構，取代傳統的資料夾與 `.md` 檔案：
   - `Folder` 表：包含 ID、名稱、父層 ID (自關聯)，以繪出目錄樹。
   - `Note` 表：包含 ID、標題、Markdown 內容 (String)、所屬 Folder ID、標籤陣列、軟刪除標記 (`is_deleted`) 與時間戳。
4. **設定環境變數**: 移除原有的 `NOTES_PATH`，於 `.env.local` 加上 `DATABASE_URL` 來連接 PostgreSQL。

## 步驟 2: 後端 API 重構 (資料庫化)
路由需加前綴避免與其他子系統衝突（例如 `/api/second-brain/*`），原有的檔案系統操作 (fs) 將全面改寫為資料庫查詢：
1. **結構獲取**: 
   - `GET /api/second-brain/tree`: 透過 Prisma 從 `Folder` 與 `Note` 資料表讀取所有標題，並在後端遞迴重組為「檔案樹 JSON」給前端。
2. **筆記 CRUD 操作**: 
   - `POST /api/second-brain/file`: 在 DB 建立新 Note。
   - `GET / PUT /api/second-brain/file?id=xxx`: 依照 UUID 或 ID 讀寫特定的 Note 內容。
   - `DELETE /api/second-brain/file?id=xxx`: 更新 `is_deleted = true` (軟刪除)，取代之前把實體檔案搬移至 `.trash` 的作法。
3. **搜尋與收集 (Capture)**: 
   - `POST /api/second-brain/search`: 透過 PostgreSQL 的全文檢索能力 (`@@` 運算子) 或簡單的 Prisma `contains` 進行文字比對。
   - `POST /api/second-brain/capture`: 接收到文字想法後，直接 Insert 進入指定的 Inbox Folder。

## 步驟 3: 前端開發 (React 元件)
1. **專屬側邊欄 (Sub-Sidebar)**: 在 `src/app/(dashboard)/second-brain/layout.tsx` 放入專屬於大腦的檔案樹狀結構側欄，與主系統的導覽列共存。
2. **Markdown 渲染與編輯器**: 實作主內容區，使用 `react-markdown` 渲染資料庫撈回來的 MD 字串，並能切換為 `<textarea>` 進行語法編輯。
3. **情境互動工具**: 
   - **浮動屬性面板**: 選取文章段落後自動跳出按鈕，可將字句一鍵轉為 "ToDoList" 系統內的任務 (因為在大單體內，能輕易呼叫 ToDo 的 API)。
   - **CMD+K CmdPallete**: 全域快捷鍵，用來即時 Search 資料庫內的筆記標題。

## 步驟 4: 本地測試與 DB 遷移
1. **DB 遷移 (Migration)**: 執行 `npx prisma migrate dev` 在本地 PostgreSQL 建立 Schema，並寫入幾篇初始結構 (Inbox, Archive) 的 Seed (種子資料)。
2. **模組驗證**: 在 `npm run dev` 啟動下，進入 `http://localhost:3000/second-brain` 測試 Markdown 渲染與資料庫讀取速度。

## 步驟 5: Zeabur 雲端佈署 (Cloud Deployment)
因為已經改用資料庫，我們**不再需要**替 Zeabur 設定惱人的 Volume 掛載與實體寫入權限。
1. **建立 PostgreSQL 服務**: 在您的 Zeabur 專案內新增一個 PostgreSQL 實體 (Service)。
2. **綁定大單體環境變數**: 獲取 Zeabur Postgres 的 Connection String，並將其填入主程式 Service 的 `DATABASE_URL` 環境變數中。
3. **修改 Build 指令**: 確保 `package.json` 中的 build 指令為：`prisma generate && prisma migrate deploy && next build`，讓上線時自動更新資料庫結構。
4. **Deploy**: 按下部署，筆記系統即與 Dashboard 一同上線。

## 步驟 6: OpenClaw / AI 助理串接方案
因整合在 Dashboard 架構下，API 安全機制統一。
- 您的 AI 助理 (`Daisy` 或 OpenClaw) 只要在存取 `/api/second-brain/*` 時，帶入環境變數設定的通關密鑰 (例如 Header: `x-api-key`)，便能直接對 PostgreSQL 資料庫內的筆記進行爬梳、標籤整理與問答，無需擔心本地檔案鎖死的問題。
