# System Architecture: Modular Monolith (My Daisy Workspace)

## 1. 系統概述 (System Overview)
My Daisy Workspace 採用 **模組化單體架構 (Modular Monolith)** 作為核心設計。它是一個基於 **Node.js** 和 **Next.js (App Router)** 所建構的大型系統。
這個系統的主要目的是作為管理多個不同應用程式的入口與基礎設施，包含：
- ToDoList
- Efficiency Review System
- Second Brain System
- Taiwan Stock System
- American Stock System
- Coaching Topic
- ECOM Marketing Analysis
- Shoppee AOI System

所有的應用程式都統一放置於同一個 Next.js 專案中，並共用底層資源。

## 2. 核心設計目標 (Core Objectives)
* **最大化伺服器資源利用率：** 減少在 Zeabur 上的記憶體佔用。將所有子系統整合為單一 Service 運行，只要啟動一次 PM2/Node.js 行程，大幅降低部署成本。
* **資源共用：** 統一管理資料庫連線、全域樣式 (CSS)、共用的 UI 元件以及 `node_modules` 依賴套件。
* **集中式權限與狀態管理：** 透過單一網域與登入機制，可以讓使用者在所有子系統之間無縫切換，不用分別在不同的 Domain 重新登入。

## 3. 系統目錄架構 (Directory Structure)
系統完全利用 Next.js App Router 的特性來組織程式碼：

```text
my-daisy-workspace/
├── package.json
├── database/            # 共用的資料庫連線設定 (PostgreSQL config, Prisma schema 等)
├── src/
│   ├── app/             # 頁面與 API 路由 (Next.js App Router)
│   │   ├── (dashboard)/ # 路由分組 (不會影響 URL，負責共享 Dashboard 佈局)
│   │   │   ├── page.tsx # 首頁：daisyWorkSpace.zeabur.com/ (或 /dashboard)
│   │   ├── second-brain/
│   │   │   ├── page.tsx # 頁面：daisyWorkSpace.zeabur.com/second-brain
│   │   │   ├── api/     # API：daisyWorkSpace.zeabur.com/second-brain/api/
│   │   ├── todo-list/
│   │   │   ├── page.tsx # 頁面：daisyWorkSpace.zeabur.com/todo-list
│   │   │   ├── api/     # API：daisyWorkSpace.zeabur.com/todo-list/api/
│   ├── components/      # UI 元件庫
│   │   ├── shared/      # 共用元件 (如：全域導覽列 Header、共用按鈕 Button)
│   │   ├── todo-list/   # 專屬於 ToDoList 的獨有元件
│   │   └── second-brain/# 專屬於 Second Brain 的獨有元件
│   ├── lib/             # 商業邏輯與工具函式 (Utilities & Business Logic)
│   │   ├── shared/      # 跨系統共用的工具 (如日期格式化、API Client)
│   │   ├── stock-api/   # 針對台/美股的爬蟲與計算邏輯
```

## 4. 架構優勢 (Advantages)
1. **開發體驗 (DX) 極佳：** 樹狀目錄結構讓各種子系統在同一程式庫內具有清晰的物理隔離，切換開發不同 APP 時非常直覺。
2. **Next.js 路由分組 (Route Groups) 的妙用：** 透過建立 `(dashboard)` 來提供最外層的共用 Layout（如側邊導覽列或頂部工具列），所有底下的子系統都可以繼承同一套風格。
3. **無痛跨模組通訊：** 若 `SecondBrain` 需要調用 `ToDoList` 的型別或模組，因為全都在同一個 Repo 中，可直接引入，免去建立私有 npm 套件或實作跨網域 API 的麻煩。

## 5. 潛在風險與預防措施 (Risks & Mitigations)
雖然整合為單體架構能節省資源，但也帶來了牽一髮而動全身的風險，必須採取以下防範措施：

* **避免單點故障 (Single Point of Failure)：** 
  * 任何一個子系統引發了導致 Node 程序 Crash 的錯誤 (例如：Uncaught Exceptions)，都會讓所有系統一起癱瘓。
  * **解法：** 必須大量且嚴格地設定 Next.js 的 [Error Boundaries (`error.tsx`)](https://nextjs.org/docs/app/building-your-application/routing/error-handling)，捕捉 Client-side 和 Server-side 錯誤。API Route 內也必須有完整的 `try-catch` 防止後端崩潰。
* **狀態或變數污染 (State Pollution)：**
  * **解法：** 盡量別依賴過多的 Global State。如果需要，應明確定義好業務邏輯的 Namespace。
* **型別安全 (Type Safety)：**
  * **解法：** 專案全面導入 TypeScript，並善用 ESLint 避免不同 `components/` 模組間不可控的耦合干擾。

## 6. 資料庫存取層 (Database Layer)
* 此專案主要對接的是外部的 **PostgreSQL** 與未來可能獨立的 **RAG Vector Database**。
* 不管子系統有多少個，皆讀取 `database/` 內的同一組設定，統整資料庫連接池 (Connection Pool) 的管理（例如：設定 Prisma Client 的單例模式 Singletons），防止連線數因多個 APP 請求而爆掉。

# 開始建置 (Implementation Plan)

以下是落實 Modular Monolith 架構與 Dashboard 首頁的 Step-by-Step 計畫。我們將分為幾個階段來逐步推進：

## Phase 1: 專案基礎建設與依賴清理 (Foundation Setup)
目前您已經將所有的子應用檔案放入，我們需要將其整理成單一 Next.js 專案規格。
1. **目錄結構重構：** 根目錄重新建立標準的 Next.js 檔案結構
2. **安裝共用依賴：** 設定全域的 TailwindCSS、字體、Icon (例如 `lucide-react`)。
3. **設定 `src/app/(dashboard)` 路由分組：** 建立專屬於 Dashboard 總覽的資料夾結構。

## Phase 2: 共用版面開發 (Core Layout Implementation)
這是讓所有子 APP 看起來像是一個整體系統的關鍵步驟。
1. **建立全域側邊欄 (`Sidebar` Component)：** 包含前往「首頁、ToDoList、第二大腦、股票觀測」等導覽按鈕。
2. **建立全域頂部列 (`Header` Component)：** 包含麵包屑導航 (Breadcrumbs)、目前的使用者登入狀態或全域搜尋列。
3. **套用 Layout：** 在 `src/app/layout.tsx` (或 `(dashboard)/layout.tsx`) 中套用 `Sidebar` 與 `Header`，這樣切換不同系統時，共用元件就不會重新渲染。

## Phase 3: Dashboard 首頁實作 (Dashboard Entry Page)
開發使用者登入後看見的第一個畫面 (`src/app/(dashboard)/page.tsx`)。
1. **歡迎面版與統計資訊：** 快速顯示來自不同 APP 的摘要 (例如本週待辦任務數量、今日股票大盤、目前筆記數量)。
2. **快速入口 (Quick Links)：** 設計美觀的卡片，點擊可直接進入各個子系統。

## Phase 4: 子系統路由佔位與 Error 防護 (Infrastructure & Boundaries)
1. **建立佔位路由：** 建立 `src/app/todo-list/page.tsx`、`src/app/second-brain/page.tsx` 作為接入子系統的前處理。
2. **實作 Error Boundary：** 在各個系統的根目錄建立 `error.tsx`，捕捉各自的錯誤，確保即使 `todo-list` 壞了，`dashboard` 與 `second-brain` 仍可正常運作。
3. **定義資料庫層：** 在 `database/` 目錄建立 Prisma configuration 與 Schema 檔案，完成與 PostgreSQL 的初始連線。

---

如果計畫沒問題，我們可以先從 **Phase 1** 開始進行。您現有的檔案似乎還偏向把 `.next` 等設定檔放在特定子目錄，我們需要先決定是要在 `my-daisy-workspace` (您目前的目錄) 根目錄直接作為 Next.js 根目錄，還是有一個特定的入口？
