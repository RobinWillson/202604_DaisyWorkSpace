# Second Brain API Documentation for AI Agents

This document outlines the available REST APIs for the **Second Brain** knowledge management system (Modular Monolith + PostgreSQL / Hybrid Local-FS mode).

> **Base URL**: `/api/second-brain/*`
> **Auth**: `x-api-key: [Your-Assigned-API-Key]` header on all requests.
> **Storage Mode**: Controlled by `USE_DATABASE` env var.
> - `USE_DATABASE=false` (or unset) + `NODE_ENV=development` → **Local filesystem** (`data/second-brain/`)
> - `USE_DATABASE=true` or `NODE_ENV=production` → **Supabase PostgreSQL** via Prisma

---

## 📁 File Tree

### `GET /api/second-brain/tree`
Returns the complete folder & file tree.

**Response**
```json
[
  {
    "id": "00-inbox",
    "name": "00-inbox",
    "type": "folder",
    "children": [
      {
        "id": "00-inbox/idea.md",
        "name": "idea",
        "type": "file"
      }
    ]
  }
]
```
> In DB mode, `id` fields are UUIDs. In local mode, `id` is the relative path (e.g. `00-inbox/idea.md`).

---

## 📝 File (Note) Operations

### `GET /api/second-brain/file?path={id}`
Read a note's content.
- **`id`**: UUID (DB mode) or relative path like `00-inbox/idea.md` (local mode)

**Response**: `{ "content": "# Title\n..." }`

---

### `PUT /api/second-brain/file?path={path}`
Create or update a note.
- **`path`**: UUID to update existing, or `folderName/title` to create new.

**Body**
```json
{ "content": "# My Note\n..." }
```

**Response**: Note object (DB) or `{ "success": true }` (local)

---

### `DELETE /api/second-brain/file?path={id}`
Soft-delete a note.
- DB mode: sets `is_deleted = true`
- Local mode: physically removes the file

**Response**: `{ "success": true }`

---

## 📂 Folder Operations

### `POST /api/second-brain/folder`
Create a new folder.

**Body**
```json
{ "parentPath": "00-inbox", "name": "my-project" }
```
> `parentPath` can be a folder name (e.g. `00-inbox`) or a UUID (sub-folders in DB mode).

**Response**: Folder object (DB) or `{ "success": true }` (local)

---

### `DELETE /api/second-brain/folder?id={id}`
Delete a folder and all its contents recursively.
- DB mode: recursively soft-deletes all notes, then hard-deletes the folder chain.
- Local mode: `rm -rf`

> ⚠️ Core folders (`00-inbox` ~ `04-archive`) should be skipped by convention — UI enforces this.

**Response**: `{ "success": true }`

---

## ✏️ Rename

### `POST /api/second-brain/rename`
Rename a file or folder.

**Body**
```json
{
  "oldPath": "00-inbox/old-name.md",
  "newName": "new-name",
  "type": "file"
}
```
> `type`: `"file"` or `"folder"`
> In DB mode, `oldPath` is a UUID; in local mode, it's a relative path.
> The `.md` extension is handled automatically — do not include it in `newName`.

**Response**: `{ "success": true }`

---

## 🚚 Move

### `POST /api/second-brain/move`
Move a file or folder to a different parent.

**Body**
```json
{
  "sourcePath": "00-inbox/idea.md",
  "targetPath": "01-projects",
  "type": "file",
  "overwriteName": "idea_copy"
}
```
> - `targetPath`: folder name or UUID. Empty string (`""`) = root.
> - `overwriteName` *(optional)*: if provided, the item is renamed during the move (used for conflict resolution).

**Response**: `{ "success": true }`

---

## 🔍 Search

### `POST /api/second-brain/search`
Full-text search across all notes.

**Body**
```json
{ "query": "台積電" }
```

**Response**
```json
{
  "results": [
    {
      "id": "uuid-or-path",
      "title": "2026S1 財報",
      "preview": "...matching excerpt...",
      "path": "01-projects/台積電"
    }
  ]
}
```

---

## 📌 Core Folders (PARA)

The five PARA root folders are **always present** and **cannot be deleted or moved**:

| Folder | Purpose |
|---|---|
| `00-inbox` | 快速收集，未分類想法 |
| `01-projects` | 進行中的專案 |
| `02-areas` | 長期維護的領域知識 |
| `03-resources` | 參考資料庫 |
| `04-archive` | 已完成或封存內容 |

---

## 🔄 Storage Mode Summary

| Scenario | Config | Storage |
|---|---|---|
| Local dev (fast) | `NODE_ENV=development`, no `USE_DATABASE` | Local `data/second-brain/` |
| DB dev (test cloud) | `USE_DATABASE=true` | Supabase PostgreSQL |
| Production | `NODE_ENV=production` | Supabase PostgreSQL |
