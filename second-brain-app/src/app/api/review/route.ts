import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const NOTES_PATH = process.env.NOTES_PATH || '';

async function gatherAllFiles(dir: string, relativePath = ''): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files: string[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === '.trash') continue;
    
    const fullPath = path.join(dir, entry.name);
    const nodeRelativePath = path.join(relativePath, entry.name);
    
    if (entry.isDirectory()) {
      files = files.concat(await gatherAllFiles(fullPath, nodeRelativePath));
    } else if (entry.name.endsWith('.md')) {
      files.push(nodeRelativePath);
    }
  }
  return files;
}

export async function GET(req: NextRequest) {
  try {
     const allFiles = await gatherAllFiles(NOTES_PATH);
     // Pick up to 5 random files
     const shuffled = allFiles.sort(() => 0.5 - Math.random());
     const selected = shuffled.slice(0, 5);
     return NextResponse.json({ reviewFiles: selected });
  } catch (err: any) {
     return NextResponse.json({ error: 'Failed to generate review set' }, { status: 500 });
  }
}
