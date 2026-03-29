import { NextRequest, NextResponse } from 'next/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idPath = searchParams.get('path');
  if (!idPath) return NextResponse.json({ error: 'Missing path' }, { status: 400 });

  const { prisma } = await import('@/lib/prisma');
  try {
    const note = await prisma.note.findUnique({ where: { id: idPath } });
    if (!note || note.is_deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ content: note.content });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idPath = searchParams.get('path');
  const { content } = await req.json();
  if (!idPath || typeof content !== 'string') return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const { prisma } = await import('@/lib/prisma');
  try {
    if (UUID_RE.test(idPath)) {
      const note = await prisma.note.update({ where: { id: idPath }, data: { content } });
      return NextResponse.json(note);
    }

    const segments = decodeURIComponent(idPath).split('/');
    const rawTitle = (segments.pop() || 'Untitled').replace(/\.md$/, '');
    const folderSegment = segments[segments.length - 1] || null;

    let folderId: string | null = null;
    if (folderSegment) {
      if (UUID_RE.test(folderSegment)) {
        folderId = folderSegment;
      } else {
        const folder = await prisma.folder.findFirst({ where: { name: folderSegment } });
        folderId = folder?.id ?? null;
      }
    }

    const note = await prisma.note.create({ data: { title: rawTitle, content, folderId } });
    return NextResponse.json(note);
  } catch (error) {
    console.error('DB file PUT error:', error);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idPath = searchParams.get('path');
  if (!idPath) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { prisma } = await import('@/lib/prisma');
  try {
    await prisma.note.update({ where: { id: idPath }, data: { is_deleted: true } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
