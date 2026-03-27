# PostgreSQL 雲端資料庫價格整理

這份文件整理了目前市場上最主流的 Serverless PostgreSQL 解決方案 (Neon 與 Supabase) 的免費方案與計費標準，協助評估 Second Brain 的最佳資料庫選擇。

---

## 方案總覽對比表 (免費層 / Free Tier)

| 服務提供商   | 基本費用 | 資料庫儲存空間      | 運算資源 (CPU/RAM)       | MAU (Auth) | 特色功能                                                                       |
| :----------- | :------- | :------------------ | :----------------------- | :--------- | :----------------------------------------------------------------------------- |
| **Neon**     | $0       | **0.5 GB** (每專案) | 最高支援 2 CU (8 GB RAM) | 60,000     | 包含分支 (Branching)、只讀副本 (Read Replicas)、6 小時資料庫倒轉 (Time Travel) |
| **Supabase** | $0       | **500 MB**          | 共用 CPU / 500 MB RAM    | 50,000     | 無限 API 請求、5GB 出網傳輸 (Egress)、1GB 靜態檔案儲存                         |

---

## 1. Neon 詳細方案

### 🟢 Free Tier (免費方案)
- **價格**：**$0** (免綁信用卡的永久免費計畫)
- **專案數量**：最高 100 個 Projects
- **運算時數**：每月每個專案 100 CU-hrs (讀寫時間)
- **儲存空間**：每個專案 0.5 GB (500 MB)
- **硬體效能**：支援最高 2 CU (相當於 8 GB RAM)
- **其他功能**：
  - **Neon Auth**: 支援 60K MAU (每月活躍用戶)
  - **Time Travel**: 6 小時內隨時可以將資料庫回復、倒轉
  - 無限團隊成員、支援 Autoscaling 自動擴容、分支 (Branching) 與只讀副本。

### 🔵 Launch (用多少算多少)
- **價格**：預估花費約 **$15 /月** (以間歇負載, 1 GB估算)
- **專案數量**：最高 100 個 Projects
- **計費標準**：
  - 運算：$0.106 per CU-hr
  - 儲存：$0.35 per GB/月
- **硬體升級**：支援最高 16 CU (相當於 64 GB RAM)
- **功能升級**：
  - **Neon Auth**: 支援 100 萬 MAU
  - **Time Travel**: 倒轉時間延長至 7 天
  - 擁有 3 天的介面監控儀表板 (Metrics/Logs)

---

## 2. Supabase 詳細方案

### 🟢 Free (免費方案)
- **價格**：`$0 / 月` 
- **運算與儲存**：
  - 資料庫空間：500 MB
  - 運算資源：Shared (共享) CPU • 500 MB RAM
  - 靜態檔案 (Storage)：1 GB 檔案儲存空間
- **流量限制**：
  - **API 請求**：無限 (Unlimited)
  - **網路傳輸**：5 GB 出網傳輸 (Egress) + 5 GB 快取傳輸
- **其他功能**：
  - Auth：支援 50,000 MAU
  - 僅提供社群支援 (Community support)

### 🔵 Pro (專業版方案)
- **價格**：起步價 `$25 / 月` 
- **方案內容**：包含一個執行於 Micro compute 上的專案 (包含所有 Free 的功能)。
- **升級與超額計費 (Pay as you go)**：
  - **MAU**: 基本 100,000 名，超過後每人 `$0.00325`。
  - **資料庫空間**: 基本 8 GB，超過後為 `$0.125 / GB`。
  - **靜態檔案 (Storage)**: 基本 100 GB，超過後為 `$0.021 / GB`。
  - **網路傳輸**: 基本 250 GB 出網 + 250 GB 快取，超過為 `$0.09 / GB`。
- **功能升級**：
  - 提供 Email 客服支援。
  - **自動備份**: 每日備份並保留 7 天。
  - Log 保留期延長至 7 天。
  - 支援外送日誌 (Log Drains)，每個專案額外加收 $60。

---

# Supabase 的絕對優勢與架構考量

## 為什麼網路上更推崇 Supabase？
1. **全家桶 (All-in-One)**：除了 PostgreSQL 資料庫，還內含 Auth (會員中心登入)、Storage (圖床)、Edge Functions，甚至原生支援 WebSocket 的 Realtime 即時更新功能，開發一套全端應用幾乎不需求助其他外部服務。
2. **沒有自動休眠延遲 (No Cold Start)**：相比於 Neon 的 Serverless 架構，Supabase 的免費版不會進入隨機休眠狀態，系統反應速度更直接穩定，沒有「剛喚醒時卡頓 1 秒」的無形困擾。
3. **完美相容 Prisma**：Supabase 的底層就是貨真價實的 PostgreSQL，您可以拿著它的連線字串 (`DATABASE_URL`) 直接餵給您目前專案架好的 Prisma ORM，並繼續享受您習慣的 TypeScript 型別支援與強大關聯查詢。

---

## 容量迷思與未來擴展方案 (VPS Self-Hosting)

### 關於「免費版 500MB 空間很少」的誤區：
1 個中文字約佔 3 Bytes，而 **500MB 足以容納高達 1.6 億個中文字的純文字 Markdown 筆記**。這意味著您就算每天高強度寫入 1 萬字的筆記，也要連續寫上 43 年才會塞滿 500MB，對個人的第二大腦 (Second Brain) 與 To-Do List 而言，空間是極度夠用的。

⚠️ **千萬不要註冊多個免費帳號來規避容量限制！**
除了會被 Supabase 的反濫用檢測系統（偵測同 IP 排列）永久連坐封鎖外；如果將「待辦事項」和「第二大腦」切分到不同的跨帳號資料庫中，將完全無法使用資料庫的 `JOIN` 關聯檢索，這直接毀滅了我們好不容易建立的大單體 (Modular Monolith) 架構的優點。

### 正規擴展方案：VPS 零租金自架 (Self-Host)
如果未來您的系統包含了大量會快速膨脹的「股票大盤歷史演算法」，導致免費的 500MB 無法負荷，**您完全不必付給 Supabase 每個月 $25 的 Pro 授權費**，因為 Supabase 整體服務是 100% 完全開源免費的：
1. **遷移到個人 VPS**：花費最低 $5~$6/月 租用一台平價的 Linux 虛擬主機 (VPS，如 DigitalOcean, Linode 或 Hetzner)。
2. **使用 Docker 部署**：只需透過官方提供的 docker-compose，就能跑起一套屬於您自己的 Supabase 後台，空間無上限，且無 MAU 人數限制 (完全取決於您買的 VPS 硬碟大小)。
3. **無痛搬移**：無須大改原本寫好的 Next.js + Prisma 程式碼，只要抽換 `.env` 的 `DATABASE_URL` 連線字串指向您自己的主機，系統就能順利無痛遷移到擁有數十 GB 空間的廉價新家！

# Supabase 實戰部署筆記


1. Install package
Run this command to install the required dependencies.
Details:
npm install @supabase/supabase-js
Code:
File: Code
```
npm install @supabase/supabase-js
```

2. Add files
Add env variables, create Supabase client helpers, and set up middleware to keep sessions refreshed.
Code:
File: .env.local
```
NEXT_PUBLIC_SUPABASE_URL=https://qrydooeraslchtqhyfme.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_uBB5S3k7aR4hIXK8ZPsWRw_hs-Vs3Vd
```

File: page.tsx
```
1import { createClient } from '@/utils/supabase/server'
2import { cookies } from 'next/headers'
3
4export default async function Page() {
5  const cookieStore = await cookies()
6  const supabase = createClient(cookieStore)
7
8  const { data: todos } = await supabase.from('todos').select()
9
10  return (
11    <ul>
12      {todos?.map((todo) => (
13        <li key={todo.id}>{todo.name}</li>
14      ))}
15    </ul>
16  )
17}
```

File: utils/supabase/server.ts
```
1import { createServerClient } from "@supabase/ssr";
2import { cookies } from "next/headers";
3
4const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
5const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
6
7export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
8  return createServerClient(
9    supabaseUrl!,
10    supabaseKey!,
11    {
12      cookies: {
13        getAll() {
14          return cookieStore.getAll()
15        },
16        setAll(cookiesToSet) {
17          try {
18            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
19          } catch {
20            // The `setAll` method was called from a Server Component.
21            // This can be ignored if you have middleware refreshing
22            // user sessions.
23          }
24        },
25      },
26    },
27  );
28};
```

File: utils/supabase/client.ts
```
1import { createBrowserClient } from "@supabase/ssr";
2
3const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
4const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
5
6export const createClient = () =>
7  createBrowserClient(
8    supabaseUrl!,
9    supabaseKey!,
10  );
```

File: utils/supabase/middleware.ts
```
1import { createServerClient } from "@supabase/ssr";
2import { type NextRequest, NextResponse } from "next/server";
3
4const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
5const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
6
7export const createClient = (request: NextRequest) => {
8  // Create an unmodified response
9  let supabaseResponse = NextResponse.next({
10    request: {
11      headers: request.headers,
12    },
13  });
14
15  const supabase = createServerClient(
16    supabaseUrl!,
17    supabaseKey!,
18    {
19      cookies: {
20        getAll() {
21          return request.cookies.getAll()
22        },
23        setAll(cookiesToSet) {
24          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
25          supabaseResponse = NextResponse.next({
26            request,
27          })
28          cookiesToSet.forEach(({ name, value, options }) =>
29            supabaseResponse.cookies.set(name, value, options)
30          )
31        },
32      },
33    },
34  );
35
36  return supabaseResponse
37};
```

3. Install Agent Skills (Optional)
Agent Skills give AI coding tools ready-made instructions, scripts, and resources for working with Supabase more accurately and efficiently.
Details:
npx skills add supabase/agent-skills
Code:
File: Code
```
npx skills add supabase/agent-skills
```