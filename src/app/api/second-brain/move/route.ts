import { NextRequest, NextResponse } from 'next/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  try {
    const { sourcePath, targetPath, type, overwriteName } = await req.json();
    if (!sourcePath) return NextResponse.json({ error: 'Missing sourcePath' }, { status: 400 });

    const { prisma } = await import('@/lib/prisma');

    let newParentId: string | null = null;
    if (targetPath) {
      if (UUID_RE.test(targetPath)) {
        newParentId = targetPath;
      } else {
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
