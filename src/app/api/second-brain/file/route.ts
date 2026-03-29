import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'second-brain');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idPath = searchParams.get('path');
  if (!idPath) return NextResponse.json({ error: 'Missing path' }, { status: 400 });

  if (process.env.NODE_ENV !== 'production' && process.env.USE_DATABASE !== 'true') {
    try {
      const decoded = decodeURIComponent(idPath);
      const ext = decoded.endsWith('.md') ? '' : '.md';
      const fullPath = path.join(DATA_DIR, decoded + ext);
      const content = await fs.readFile(fullPath, 'utf8');
      return NextResponse.json({ content });
    } catch {
      return NextResponse.json({ error: 'File not found locally' }, { status: 404 });
    }
  }

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

  if (process.env.NODE_ENV !== 'production' && process.env.USE_DATABASE !== 'true') {
    try {
      const decoded = decodeURIComponent(idPath);
      const ext = decoded.endsWith('.md') ? '' : '.md';
      const fullPath = path.join(DATA_DIR, decoded + ext);
      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, content, 'utf8');
      return NextResponse.json({ success: true, local: true });
    } catch (e) {
      console.error('Local write error:', e);
      return NextResponse.json({ error: 'Local write failed' }, { status: 500 });
    }
  }

  const { prisma } = await import('@/lib/prisma');
  try {
    // Try to update existing note by UUID first
    // UUID format: contains multiple hyphens and is longer than 30 chars
    const looksLikeUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idPath);

    if (looksLikeUUID) {
      // Update existing note
      const note = await prisma.note.update({ where: { id: idPath }, data: { content } });
      return NextResponse.json(note);
    }

    // Create new note — path format is like "folderName/title" or "uuid/title"
    const segments = decodeURIComponent(idPath).split('/');
    const rawTitle = (segments.pop() || 'Untitled').replace(/\.md$/, '');
    const folderSegment = segments[segments.length - 1] || null;

    // Determine folderId: if folderSegment is a UUID, use it directly;
    // otherwise look up by name.
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    let folderId: string | null = null;
    if (folderSegment) {
      if (UUID_RE.test(folderSegment)) {
        folderId = folderSegment; // already a UUID
      } else {
        const folder = await prisma.folder.findFirst({ where: { name: folderSegment } });
        folderId = folder?.id ?? null;
      }
    }

    const note = await prisma.note.create({
      data: { title: rawTitle, content, folderId }
    });
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

  if (process.env.NODE_ENV !== 'production' && process.env.USE_DATABASE !== 'true') {
    try {
      const decoded = decodeURIComponent(idPath);
      const ext = decoded.endsWith('.md') ? '' : '.md';
      const fullPath = path.join(DATA_DIR, decoded + ext);
      await fs.unlink(fullPath);
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: 'Local delete failed' }, { status: 500 });
    }
  }

  const { prisma } = await import('@/lib/prisma');
  try {
    await prisma.note.update({ where: { id: idPath }, data: { is_deleted: true } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
