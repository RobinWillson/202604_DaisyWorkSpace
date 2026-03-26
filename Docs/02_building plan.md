# NextJS Second Brain Web App: 逐步建置計畫

## 步驟 1: 環境設定與初始化
1. **建立 NextJS 專案**: 使用 App Router、TypeScript 與 Tailwind CSS 初始化專案 (`npx create-next-app@latest .`)。
2. **安裝核心套件**: 
   - Markdown 處理: `react-markdown`, `remark-gfm`, `rehype-highlight`
   - UI 與動畫: `lucide-react`, `framer-motion`
   - 資料庫/搜尋 (選用): `better-sqlite3`, `sqlite-vec`
3. **設定環境變數**: 設定 `.env.local` 以配置系統路徑 (`NOTES_PATH`, `TRASH_PATH`) 與 AI 金鑰 (`OPENAI_API_KEY`)。

## 步驟 2: 後端開發 (Next.js API 路由)
1. **檔案系統操作**: 
   - `GET /api/tree`: 將本地資料夾轉換成樹狀 JSON 結構（排除隱藏資料夾）。
   - `GET / PUT / DELETE /api/file`: 提供讀取、編輯（包含時間戳衝突偵測）及將檔案移至 `.trash` 中。
2. **搜尋與收集 (Capture)**: 
   - `POST /api/search`: 提供全文搜尋功能。
   - `POST /api/capture`: 接收即時文字內容並在 Inbox 自動建立新檔案。
3. **AI 與整合**: 
   - `POST /api/copilot/ask` & `semantic-search`: 將本地文字脈絡連接至 AI 語言模型進行提問或語意搜尋。

## 步驟 3: 前端開發 (React 元件)
1. **版面架構 Layout**: 建立支援響應式設計的深色主題版面，包含可收合的側邊欄 (Sidebar，顯示檔案樹) 以及主內容區。
2. **Markdown 閱讀器與編輯器**: 實作主內容區，使用 `react-markdown` 俐落地渲染 `.md` 檔案，並能無縫切換至純文字編輯模式。
3. **全域快速收集 (Quick Capture)**: 在畫面頂部新增一個全域輸入框，用來快速儲存文字、想法或解析網址。
4. **情境互動工具**: 
   - **浮動工具列**: 在反白選取文字時自動浮出，可將文字轉為待辦事項或點子卡片。
   - **搜尋對話框**: 支援 `Cmd/Ctrl + K` 快捷鍵喚出，快速跳轉檔案。
5. **洞察面板**: 建立「每日回顧」(Daily Review) 介面以及右側拉出的 AI Copilot 對話抽屜。

## 步驟 4: 測試與本地部署
1. **功能驗證**: 準備範例 `.md` 資料夾測試跨裝置版面、解析邏輯與 Markdown 格式渲染。
2. **編譯專案**: 執行 `npm run build`。
3. **本地背景運行**: 使用 PM2 (`pm2 start npm --name "second-brain" -- start`) 讓 NextJS 伺服器在本地持續運行，確保隨時可存取。

## 步驟 5: Zeabur 雲端佈署 (Cloud Deployment)
為了解決在伺服器上檔案建立權限不足與覆蓋遺失的問題，請採用具備持久化儲存卷（Volume）的佈署方式：

1. **上傳至 GitHub**: 確保所有程式碼（包含已挪至 `second-brain-app/data` 目錄下的 `notes` 與 `.trash` 資料夾結構）已提交並 Push 至個人的 GitHub Repo。
2. **建立 Zeabur 專案**: 
   - 進入 [Zeabur 儀表板](https://dash.zeabur.com/)，建立一個新專案 (Project)。
   - 點擊 **Deploy New Service**，選擇 **Deploy from GitHub**，並授權選取你的 `202603_second_brain` 儲存庫。
   - 於設定中確保 Build Command 為 `npm run build`，Start Command 為 `npm start` (通常 Zeabur 會對 Next.js 自動辨識並套用最佳設定)。
3. **設定專案根目錄 (Root Directory)**:
   - 因為此專案架構中，Next.js App 位於次目錄。在該 Service 的 **Settings** 分頁中找到 **Root Directory**，請務必輸入：**`/second-brain-app`**。這能避免系統在根目錄找不到 `package.json` 而導致網站 404 錯誤。
4. **掛載目錄 (Volumes)**:
   - 在該 Service 的設定面板中找到 **Volumes** 分頁。
   - 新增一個 Volume，將掛載路徑 (Mount Path) 設立為：`/app/data`。這可讓該資料夾獲得伺服器寫入權限，且資料會永久保留。
5. **設定環境變數 (Environment Variables)**:
   - 切換至 **Variables** 分頁，加入以下變數來覆寫預設路徑並啟動全站基礎防護驗證：
     - `NOTES_PATH` = `/app/data/notes`
     - `TRASH_PATH` = `/app/data/.trash`
     - `AUTH_USER` = `[自訂您的登入帳號]`
     - `AUTH_PASS` = `[自訂您的登入密碼]`
     - `API_KEY` = `[自訂一把給 AI 機器人自動化串接用的通關密碼]`
6. **綁定網域 (Domain)**:
   - 服務構建與啟動完成後，在 **Networking** 分頁中點選 **Generate Domain** 生效。
   - 點擊該網域，開始享受您的雲端 Second Brain！

## 步驟 6: API 與 AI 助理串接方案 (OpenClaw)
為了避免閒雜人等偷窺您的筆記庫，本專案全站已啟用 HTTP Basic Auth 保護。若您有使用 **OpenClaw** 等自動化 AI 助理，需要程式化的讀寫權限，請選擇以下任一種方式授權：

- **方案 A (URL 直接附帶帳密)**：這通常是給瀏覽器爬蟲引擎 (如 Playwright) 最簡單的放行方式。
  - 格式: `https://[AUTH_USER]:[AUTH_PASS]@[您的網址]/`
  - 範例: `https://robin:1234@robin-second-brain.zeabur.app/api/tree`
- **方案 B (帶入 API 金鑰標頭)**：如果您是直接用 Fetch 或 Curl 打 API，只要帶入您在環境變數中所設定的 `API_KEY` 即可通過。
  - Header 設定: `x-api-key: [您在第五步設定的 API_KEY]`
