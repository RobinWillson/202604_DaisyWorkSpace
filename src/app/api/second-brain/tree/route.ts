import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'second-brain');

// ---- DEV helpers ----
async function ensureDevDirectories() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

async function buildLocalTree(dirPath: string, parentRelativePath = ''): Promise<any[]> {
  const nodes: any[] = [];
  let items: Awaited<ReturnType<typeof fs.readdir>>;
  try {
    items = await fs.readdir(dirPath, { withFileTypes: true });
  } catch {
    return nodes; // directory doesn't exist yet
  }

  for (const item of items) {
    if (item.name.startsWith('.')) continue;
    const relativePath = parentRelativePath ? `${parentRelativePath}/${item.name}` : item.name;
    const fullPath = path.join(dirPath, item.name);

    if (item.isDirectory()) {
      const children = await buildLocalTree(fullPath, relativePath);
      nodes.push({ id: relativePath, name: item.name, path: relativePath, type: 'folder', children });
    } else if (item.name.endsWith('.md')) {
      nodes.push({ id: relativePath, name: item.name.replace('.md', ''), path: relativePath, type: 'file' });
    }
  }
  return nodes;
}

// ---- Route handler ----
export async function GET() {
  // [DEV] local filesystem
  if (process.env.NODE_ENV !== 'production' && process.env.USE_DATABASE !== 'true') {
    try {
      await ensureDevDirectories();
      const localTree = await buildLocalTree(DATA_DIR);
      return NextResponse.json(localTree);
    } catch (e) {
      console.error('Local FS Error:', e);
      return NextResponse.json({ error: 'Local read failed' }, { status: 500 });
    }
  }

  // [PROD] database – lazy import so it never runs in dev
  const { prisma } = await import('@/lib/prisma');
  try {
    let folders = await prisma.folder.findMany();
    if (folders.length === 0) {
      const defaults = ['00-inbox', '01-projects', '02-areas', '03-resources', '04-archive'];
      await Promise.all(defaults.map(name => prisma.folder.create({ data: { name } })));
      folders = await prisma.folder.findMany();
    }
    const notes = await prisma.note.findMany({ where: { is_deleted: false } });

    const folderMap = new Map<string, any>();
    folders.forEach(f => folderMap.set(f.id, { id: f.id, name: f.name, path: f.id, type: 'folder', parentId: f.parentId, children: [] }));

    const rootNodes: any[] = [];
    notes.forEach(n => {
      const file = { id: n.id, name: n.title, path: n.id, type: 'file' };
      if (n.folderId && folderMap.has(n.folderId)) folderMap.get(n.folderId).children.push(file);
      else rootNodes.push(file);
    });
    folderMap.forEach(folder => {
      if (folder.parentId && folderMap.has(folder.parentId)) folderMap.get(folder.parentId).children.push(folder);
      else rootNodes.push(folder);
    });

    return NextResponse.json(rootNodes);
  } catch (error) {
    console.error('DB fetch failed:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
