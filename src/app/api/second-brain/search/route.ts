import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ results: [] });

    const { prisma } = await import('@/lib/prisma');
    const notes = await prisma.note.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } }
        ],
        is_deleted: false
      },
      take: 10
    });

    const results = notes.map(n => ({
      id: n.id,
      name: n.title,
      path: n.id,
      preview: n.content.substring(0, 100).replace(/\n/g, ' ') + '...'
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Search failed:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
