import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const NOTES_PATH = process.env.NOTES_PATH || '';

interface SearchResult {
  path: string;
  name: string;
  preview: string;
}

// Simple recursive search
async function searchFiles(dir: string, query: string, relativePath = ''): Promise<SearchResult[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let results: SearchResult[] = [];

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === '.trash') continue;

    const fullPath = path.join(dir, entry.name);
    const nodeRelativePath = path.join(relativePath, entry.name);

    if (entry.isDirectory()) {
      results = results.concat(await searchFiles(fullPath, query, nodeRelativePath));
    } else if (entry.name.endsWith('.md')) {
      const content = await fs.readFile(fullPath, 'utf-8');
      const lowerQuery = query.toLowerCase();
      
      const isNameMatch = entry.name.toLowerCase().includes(lowerQuery);
      const isContentMatch = content.toLowerCase().includes(lowerQuery);
      
      if (isNameMatch || isContentMatch) {
         let preview = '(Title match)';
         if (isContentMatch) {
           const index = content.toLowerCase().indexOf(lowerQuery);
           const start = Math.max(0, index - 20);
           const end = Math.min(content.length, index + query.length + 20);
           let snippet = content.substring(start, end).replace(/\n/g, ' ');
           if (start > 0) snippet = '...' + snippet;
           if (end < content.length) snippet = snippet + '...';
           preview = snippet;
         }
         
         results.push({
           path: nodeRelativePath,
           name: entry.name,
           preview
         });
      }
    }
  }

  return results;
}

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Valid query required' }, { status: 400 });
    }

    if (!NOTES_PATH) throw new Error('NOTES_PATH not set');
    
    const results = await searchFiles(NOTES_PATH, query);
    return NextResponse.json({ results });
  } catch (err: any) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
