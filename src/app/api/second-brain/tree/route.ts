import { NextResponse } from 'next/server';

export async function GET() {
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
