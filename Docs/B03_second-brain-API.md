# Second Brain API Documentation for AI Agents

This document outlines the available REST APIs for the **Second Brain** knowledge management system (Modular Monolith + PostgreSQL / DB-Only mode).

> **Base URL**: `/api/second-brain/*`
> **Auth**: `x-api-key: [Your-Assigned-API-Key]` header on all requests.
> **Storage**: Supabase PostgreSQL via Prisma (Always-on).
> **Required Env Var**: `DATABASE_URL` — Supabase connection string (internal communication between Server and DB).

---

## 🔒 Authentication & Access

Access to all APIs requires valid authentication.

1. **AI / Programmatic Access**: Provide the `x-api-key` header.
2. **Browser / UI Access**: Handled via secure HTTP-only cookies (Session-based).

### Required Environment Variables (Set in Zeabur / .env)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ Yes | Supabase PostgreSQL connection string. Internal use only. |
| `DB_API_SECRET_KEY` | ✅ Yes | The secret key to validate against the `x-api-key` header. |
| `DB_AUTH_USERNAME` | ✅ Yes | Username for Dashboard/Web login. |
| `DB_AUTH_PASSWORD` | ✅ Yes | Password for Dashboard/Web login. |
| `NODE_ENV` | Optional | Set to `production` when deploying to Zeabur. |

---

## 📁 File Tree

### `GET /api/second-brain/tree`
Returns the complete folder & file tree.

**Response**
```json
[
  {
    "id": "uuid-here",
    "name": "00-inbox",
    "type": "folder",
    "children": [
      {
        "id": "uuid-here",
        "name": "idea",
        "type": "file"
      }
    ]
  }
]
```
> In DB-only mode, `id` fields are always UUIDs.

---

## 📝 File (Note) Operations

### `GET /api/second-brain/file?path={id}`
Read a note's content.
- **`id`**: UUID of the note.

**Response**: `{ "content": "# Title\n..." }`

---

### `PUT /api/second-brain/file?path={path}`
Create or update a note.
- **`path`**: UUID to update existing, or `folderName/title` to create new.

**Body**
```json
{ "content": "# My Note\n..." }
```

**Response**: Note object (JSON)

---

### `DELETE /api/second-brain/file?path={id}`
Soft-delete a note (sets `is_deleted = true`).

**Response**: `{ "success": true }`

---

## 📂 Folder Operations

### `POST /api/second-brain/folder`
Create a new folder.

**Body**
```json
{ "parentPath": "00-inbox", "name": "my-project" }
```
> `parentPath` can be a folder name (e.g. `00-inbox`) or a UUID.

**Response**: Folder object (JSON)

---

### `DELETE /api/second-brain/folder?id={id}`
Delete a folder and all its contents recursively.
- Sets `is_deleted = true` for all nested notes.
- Removes the folder records from DB.

> ⚠️ Core folders (`00-inbox` ~ `04-archive`) cannot be deleted.

**Response**: `{ "success": true }`

---

## ✏️ Rename

### `POST /api/second-brain/rename`
Rename a file or folder.

**Body**
```json
{
  "oldPath": "uuid-of-item",
  "newName": "new-title-without-extension",
  "type": "file"
}
```
> `type`: `"file"` or `"folder"`

**Response**: `{ "success": true }`

---

## 🚚 Move

### `POST /api/second-brain/move`
Move a file or folder to a different parent.

**Body**
```json
{
  "sourcePath": "uuid-of-item",
  "targetPath": "target-folder-uuid-or-name",
  "type": "file",
  "overwriteName": "optional_new_name"
}
```
> - `targetPath`: target folder UUID or name. Empty string (`""`) = root.

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
      "id": "uuid-here",
      "title": "2026S1 財報",
      "preview": "...matching excerpt...",
      "path": "01-projects / 2026S1 財報"
    }
  ]
]
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
