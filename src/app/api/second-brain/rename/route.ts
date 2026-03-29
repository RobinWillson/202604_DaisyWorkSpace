import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { oldPath, newName, type } = await req.json();
    if (!oldPath || !newName) return NextResponse.json({ error: 'Missing oldPath or newName' }, { status: 400 });

    const { prisma } = await import('@/lib/prisma');
    if (type === 'folder') {
      await prisma.folder.update({ where: { id: oldPath }, data: { name: newName } });
    } else {
      await prisma.note.update({ where: { id: oldPath }, data: { title: newName.replace(/\.md$/, '') } });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rename error:', error);
    return NextResponse.json({ error: 'Rename failed' }, { status: 500 });
  }
}
