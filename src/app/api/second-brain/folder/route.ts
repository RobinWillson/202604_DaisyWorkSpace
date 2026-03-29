import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'second-brain');

export async function POST(req: NextRequest) {
  try {
    const { parentPath, name } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    // [DEV] local filesystem
    if (process.env.NODE_ENV !== 'production' && process.env.USE_DATABASE !== 'true') {
      const targetDir = parentPath
        ? path.join(DATA_DIR, parentPath, name)
        : path.join(DATA_DIR, name);
      await fs.mkdir(targetDir, { recursive: true });
      return NextResponse.json({ success: true, local: true, path: targetDir });
    }

    // [PROD] database – lazy import
    const { prisma } = await import('@/lib/prisma');

    // parentPath can be a UUID (user-created sub-folder) or a name string (CORE_FOLDERs)
    // Resolve to actual UUID
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let resolvedParentId: string | null = null;
    if (parentPath) {
      const parentSegment = parentPath.split('/').pop() || parentPath;
      if (UUID_RE.test(parentSegment)) {
        resolvedParentId = parentSegment; // already a UUID
      } else {
        const parentFolder = await prisma.folder.findFirst({ where: { name: parentSegment } });
        resolvedParentId = parentFolder?.id ?? null;
      }
    }

    const folder = await prisma.folder.create({
      data: { name, parentId: resolvedParentId }
    });
    return NextResponse.json(folder);
  } catch (error) {
    console.error('Folder create error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  // [DEV] local filesystem
  if (process.env.NODE_ENV !== 'production' && process.env.USE_DATABASE !== 'true') {
    try {
      const fullPath = path.join(DATA_DIR, id);
      await fs.rm(fullPath, { recursive: true, force: true });
      return NextResponse.json({ success: true, local: true });
    } catch {
      return NextResponse.json({ error: 'Local delete failed' }, { status: 500 });
    }
  }

  // [PROD] database – lazy import
  const { prisma } = await import('@/lib/prisma');
  try {
    // Recursively soft-delete all notes inside this folder (and sub-folders)
    const deleteRecursive = async (folderId: string) => {
      await prisma.note.updateMany({ where: { folderId }, data: { is_deleted: true } });
      const subFolders = await prisma.folder.findMany({ where: { parentId: folderId } });
      for (const sub of subFolders) await deleteRecursive(sub.id);
      await prisma.folder.delete({ where: { id: folderId } });
    };
    await deleteRecursive(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Folder delete error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
