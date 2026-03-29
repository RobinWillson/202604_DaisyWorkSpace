import { NextRequest, NextResponse } from 'next/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(req: NextRequest) {
  try {
    const { parentPath, name } = await req.json();
    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

    const { prisma } = await import('@/lib/prisma');

    let resolvedParentId: string | null = null;
    if (parentPath) {
      const parentSegment = parentPath.split('/').pop() || parentPath;
      if (UUID_RE.test(parentSegment)) {
        resolvedParentId = parentSegment;
      } else {
        const parentFolder = await prisma.folder.findFirst({ where: { name: parentSegment } });
        resolvedParentId = parentFolder?.id ?? null;
      }
    }

    const folder = await prisma.folder.create({ data: { name, parentId: resolvedParentId } });
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

  const { prisma } = await import('@/lib/prisma');
  try {
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
