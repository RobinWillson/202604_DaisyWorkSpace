import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'second-brain');

export async function POST(req: NextRequest) {
  try {
    const { sourcePath, targetPath, type, overwriteName } = await req.json();
    if (!sourcePath) return NextResponse.json({ error: 'Missing sourcePath' }, { status: 400 });

    // [DEV] local filesystem move
    if (process.env.NODE_ENV !== 'production' && process.env.USE_DATABASE !== 'true') {
      // Old path: file on disk always has .md
      const oldFull = type === 'file'
        ? path.join(DATA_DIR, sourcePath.endsWith('.md') ? sourcePath : sourcePath + '.md')
        : path.join(DATA_DIR, sourcePath);

      // New path: use overwriteName if provided (rename case), strip any .md then re-add for files
      const baseName = overwriteName
        ? overwriteName.replace(/\.md$/, '')   // user-typed name, strip accidental .md
        : path.basename(sourcePath).replace(/\.md$/, ''); // original name stripped
      const ext = type === 'file' ? '.md' : '';
      const newDir = targetPath ? path.join(DATA_DIR, targetPath) : DATA_DIR;
      const newFull = path.join(newDir, baseName + ext);

      await fs.mkdir(newDir, { recursive: true });
      await fs.rename(oldFull, newFull);
      return NextResponse.json({ success: true, local: true });
    }

    // [PROD] database move
    const { prisma } = await import('@/lib/prisma');

    // targetPath may be a UUID (sub-folder created in DB) or a name string (CORE_FOLDERs like '01-projects')
    // Resolve it to the actual UUID
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let newParentId: string | null = null;
    if (targetPath) {
      if (UUID_RE.test(targetPath)) {
        newParentId = targetPath; // already a UUID
      } else {
        // resolve by folder name (handles CORE_FOLDERS with static string IDs)
        const targetFolder = await prisma.folder.findFirst({ where: { name: targetPath } });
        newParentId = targetFolder?.id ?? null;
      }
    }

    if (type === 'folder') {
      await prisma.folder.update({
        where: { id: sourcePath },
        data: {
          parentId: newParentId,
          ...(overwriteName ? { name: overwriteName.replace(/\.md$/, '') } : {})
        }
      });
    } else {
      await prisma.note.update({
        where: { id: sourcePath },
        data: {
          folderId: newParentId,
          ...(overwriteName ? { title: overwriteName.replace(/\.md$/, '') } : {})
        }
      });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Move error:', error);
    return NextResponse.json({ error: 'Move failed' }, { status: 500 });
  }
}
