# Second Brain API Documentation for AI Agents

Welcome, AI Agent! This document outlines the available REST APIs for the **Second Brain** knowledge management system. You can use these endpoints to perform Create, Read, Update, and Delete (CRUD) operations on folders and Markdown files.

## 🔐 Authentication (Required)

All API endpoints are protected by HTTP Basic Auth. You MUST authenticate yourself on **every** request. 

### HTTP Header `x-api-key` 
Include the custom API key header in your HTTP requests.
```http
x-api-key: [Your-Assigned-API-Key]
```

---

## 🚀 Available API Endpoints

### 1. File Tree Management
#### `GET /api/tree`
- **Description**: Retrieves the complete folder and file tree structure.
- **Query Params**: None
- **Response**: `Array<FileNode | FolderNode>`
  ```json
  [
    {
      "name": "00-inbox",
      "path": "00-inbox",
      "type": "folder",
      "children": [
        { "name": "idea.md", "path": "00-inbox/idea.md", "type": "file", "modifiedAt": "..." }
      ]
    }
  ]
  ```

### 2. File Operations (Markdown)
#### `GET /api/file?path={path}`
- **Description**: Reads the content of a specific markdown file.
- **Query Params**: `path` (e.g., `path=01-projects/alpha.md`)
- **Response**: `{ "content": "# Hello World...", "modifiedAt": "..." }`

#### `PUT /api/file?path={path}`
- **Description**: Creates or updates a Markdown file. Parent directories are auto-created if they do not exist.
- **Query Params**: `path` (e.g., `path=00-inbox/new.md`)
- **Body**: 
  ```json
  { 
    "content": "# New Markdown Content",
    "modifiedAt": "Optional for concurrency control" 
  }
  ```
- **Response**: `{ "message": "File saved", "modifiedAt": "..." }`

#### `DELETE /api/file?path={path}`
- **Description**: Deletes a file (Safely moves it to `.trash/`).
- **Query Params**: `path` (e.g., `path=00-inbox/old.md`)
- **Response**: `{ "message": "File moved to trash" }`

### 3. Folder Operations
#### `POST /api/folder`
- **Description**: Creates a new folder.
- **Body**:
  ```json
  { 
    "parentPath": "01-projects", 
    "name": "project_alpha" 
  }
  ```
- **Response**: `{ "message": "Folder created successfully" }`

#### `PUT /api/folder-actions`
- **Description**: Renames or moves an existing folder. **Note: Core folders (00-inbox, 01-projects, etc.) are protected and cannot be modified.**
- **Body (Rename)**:
  ```json
  { "action": "rename", "sourcePath": "01-projects/old_name", "newName": "new_name" }
  ```
- **Body (Move)**:
  ```json
  { "action": "move", "sourcePath": "01-projects/child", "targetPath": "04-archive" }
  ```
- **Response**: `{ "message": "Renamed/Moved successfully" }`

#### `DELETE /api/folder-actions?path={path}`
- **Description**: Deletes a directory recursively (moves to `.trash/`). **Note: Core folders are protected and will return an error.**
- **Query Params**: `path` (e.g., `path=03-resources/old_folder`)
- **Response**: `{ "message": "Folder moved to trash" }`

### 4. Search & Utilities
#### `GET /api/search?q={query}`
- **Description**: Performs full-text search across all markdown files and filenames.
- **Query Params**: `q` (The search keyword)
- **Response**: 
  ```json
  [
    {
      "path": "01-projects/alpha.md",
      "name": "alpha.md",
      "preview": "...matching text context..."
    }
  ]
  ```

#### `POST /api/capture`
- **Description**: Quick Capture endpoint for instantly appending or creating a new thought/idea note in `00-inbox`.
- **Note**: Subject to specific app configuration. Use `PUT /api/file` for standard file creation if this is unavailable.
