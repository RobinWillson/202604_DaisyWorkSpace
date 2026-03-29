import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'second-brain');

export async function POST(req: NextRequest) {
  try {
    const { oldPath, newName, type } = await req.json();
    if (!oldPath || !newName) return NextResponse.json({ error: 'Missing oldPath or newName' }, { status: 400 });

    // [DEV] local filesystem rename
    if (process.env.NODE_ENV !== 'production' && process.env.USE_DATABASE !== 'true') {
      const parentDir = path.dirname(path.join(DATA_DIR, oldPath));

      if (type === 'file') {
        // old path: stored without .md extension in tree ID, actual file has .md
        const oldFull = path.join(DATA_DIR, oldPath.endsWith('.md') ? oldPath : oldPath + '.md');
        const newFull = path.join(parentDir, newName.endsWith('.md') ? newName : newName + '.md');
        await fs.rename(oldFull, newFull);
      } else {
        // folder: no extension needed
        const oldFull = path.join(DATA_DIR, oldPath);
        const newFull = path.join(parentDir, newName);
        await fs.rename(oldFull, newFull);
      }

      return NextResponse.json({ success: true, local: true });
    }

    // [PROD] database rename
    const { prisma } = await import('@/lib/prisma');
    if (type === 'folder') {
      await prisma.folder.update({ where: { id: oldPath }, data: { name: newName } });
    } else {
      await prisma.note.update({ where: { id: oldPath }, data: { title: newName } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rename error:', error);
    return NextResponse.json({ error: 'Rename failed' }, { status: 500 });
  }
}
