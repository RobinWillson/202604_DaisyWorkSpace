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
