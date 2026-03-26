import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const NOTES_PATH = process.env.NOTES_PATH || '';

export async function POST(req: NextRequest) {
  try {
    const { parentPath, name } = await req.json();
    
    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
    }
    
    // Auto-generate safe folder name
    const safeName = name.replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5 ]/g, '_').trim();
    if (!safeName) {
      return NextResponse.json({ error: 'Invalid folder name' }, { status: 400 });
    }

    const absoluteParent = path.join(NOTES_PATH, parentPath || '');
    const absoluteNewFolder = path.join(absoluteParent, safeName);
    
    // Prevent traversal
    if (!absoluteNewFolder.startsWith(NOTES_PATH)) {
       return NextResponse.json({ error: 'Invalid folder path' }, { status: 400 });
    }
    
    await fs.mkdir(absoluteNewFolder, { recursive: true });
    
    return NextResponse.json({ message: 'Folder created', path: path.join(parentPath || '', safeName) });
  } catch(err: any) {
    console.error('Folder creation Error', err);
    return NextResponse.json({ error: 'Folder creation failed' }, { status: 500 });
  }
}
