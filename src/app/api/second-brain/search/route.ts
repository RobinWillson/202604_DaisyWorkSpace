import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'second-brain');

async function searchLocalFiles(dirPath: string, query: string, rootDir: string) {
  let results: any[] = [];
  const items = await fs.readdir(dirPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dirPath, item.name);
    const relativePath = path.relative(rootDir, fullPath);

    if (item.isDirectory()) {
      const subResults = await searchLocalFiles(fullPath, query, rootDir);
      results = [...results, ...subResults];
    } else if (item.name.endsWith('.md')) {
      const content = await fs.readFile(fullPath, 'utf8');
      if (content.toLowerCase().includes(query.toLowerCase()) || item.name.toLowerCase().includes(query.toLowerCase())) {
        // Simple preview logic
        const index = content.toLowerCase().indexOf(query.toLowerCase());
        const start = Math.max(0, index - 20);
        const preview = content.substring(start, start + 100).replace(/\n/g, ' ') + '...';
        
        results.push({
          name: item.name.replace('.md', ''),
          path: relativePath,
          preview: preview
        });
      }
    }
  }
  return results;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query) return NextResponse.json({ results: [] });

    // [DEV] 本地搜尋
    if (process.env.NODE_ENV !== 'production' && process.env.USE_DATABASE !== 'true') {
      const results = await searchLocalFiles(DATA_DIR, query, DATA_DIR);
      return NextResponse.json({ results });
    }

    // [PROD] 資料庫搜尋
    const notes = await prisma.note.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { content: { contains: query, mode: 'insensitive' } }
        ],
        is_deleted: false
      },
      take: 10 // 限制搜尋結果數量
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
