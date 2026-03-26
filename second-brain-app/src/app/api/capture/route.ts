import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const NOTES_PATH = process.env.NOTES_PATH || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { content, folder = '00-inbox', title } = body;
    
    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    
    // Auto-generate title if not provided
    const safeTitle = title 
      ? title.replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5]/g, '_') 
      : Date.now().toString();
    const filename = `${safeTitle}.md`;
    
    const absoluteFolder = path.join(NOTES_PATH, folder);
    
    // Prevent directory traversal
    if (!absoluteFolder.startsWith(NOTES_PATH)) {
       return NextResponse.json({ error: 'Invalid folder choice' }, { status: 400 });
    }
    
    // Ensure inbox or target directory exists
    await fs.mkdir(absoluteFolder, { recursive: true });
    
    const filePath = path.join(absoluteFolder, filename);
    await fs.writeFile(filePath, content, 'utf-8');
    
    return NextResponse.json({ message: 'Captured effectively', path: path.join(folder, filename) });
  } catch(err: any) {
    console.error('Capture Error', err);
    return NextResponse.json({ error: 'Capture failed' }, { status: 500 });
  }
}
