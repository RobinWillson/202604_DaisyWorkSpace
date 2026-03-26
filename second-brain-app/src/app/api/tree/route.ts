import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

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

const NOTES_PATH = process.env.NOTES_PATH || '';

async function buildTree(dir: string, relativePath = ''): Promise<(FolderNode | FileNode)[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const nodes = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === '.trash') continue;

    const fullPath = path.join(dir, entry.name);
    const nodeRelativePath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      const children = await buildTree(fullPath, nodeRelativePath);
      nodes.push({
        name: entry.name,
        path: nodeRelativePath,
        type: 'folder',
        children
      } as FolderNode);
    } else if (entry.name.endsWith('.md')) {
      const stats = await fs.stat(fullPath);
      nodes.push({
        name: entry.name,
        path: nodeRelativePath,
        type: 'file',
        modifiedAt: stats.mtime.toISOString()
      } as FileNode);
    }
  }

  // Sort folders first, then files alphabetically
  nodes.sort((a, b) => {
    if (a.type === b.type) return a.name.localeCompare(b.name);
    return a.type === 'folder' ? -1 : 1;
  });

  return nodes;
}

export async function GET() {
  if (!NOTES_PATH) {
    return NextResponse.json({ error: 'NOTES_PATH is not defined in environment variables' }, { status: 500 });
  }

  try {
    try {
      await fs.access(NOTES_PATH);
    } catch {
      await fs.mkdir(NOTES_PATH, { recursive: true });
    }

    const tree = await buildTree(NOTES_PATH);
    return NextResponse.json(tree);
  } catch (error) {
    console.error('Error building file tree:', error);
    return NextResponse.json({ error: 'Failed to read notes directory' }, { status: 500 });
  }
}
