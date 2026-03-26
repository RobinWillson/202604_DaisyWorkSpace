import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const NOTES_PATH = process.env.NOTES_PATH || '';
const TRASH_PATH = process.env.TRASH_PATH || '';

// Utility: Prevent directory traversal attacks
function getValidAbsolutePath(relativePath: string | null): string | null {
  if (!relativePath || !NOTES_PATH) return null;
  const targetPath = path.join(NOTES_PATH, relativePath);
  if (!targetPath.startsWith(NOTES_PATH)) {
    return null;
  }
  return targetPath;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePathParam = searchParams.get('path');
  
  const absolutePath = getValidAbsolutePath(filePathParam);
  if (!absolutePath) {
    return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
  }

  try {
    const stats = await fs.stat(absolutePath);
    if (!stats.isFile() || !absolutePath.endsWith('.md')) {
      return NextResponse.json({ error: 'Not a markdown file' }, { status: 400 });
    }

    const content = await fs.readFile(absolutePath, 'utf-8');
    return NextResponse.json({
      content,
      modifiedAt: stats.mtime.toISOString()
    });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePathParam = searchParams.get('path');
  
  const absolutePath = getValidAbsolutePath(filePathParam);
  if (!absolutePath) {
    return NextResponse.json({ error: 'Invalid file path' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { content, modifiedAt } = body;

    // Concurrency Check (Optimistic Concurrency Control)
    try {
      const stats = await fs.stat(absolutePath);
      const currentModifiedAt = stats.mtime.toISOString();
      if (modifiedAt && currentModifiedAt !== modifiedAt) {
         return NextResponse.json({ error: 'Conflict: File has been modified by another process', currentModifiedAt }, { status: 409 });
      }
    } catch (e: any) {
      if (e.code !== 'ENOENT') throw e; // New file case allows ENOENT
    }

    // Ensure the parent directory exists
    await fs.mkdir(path.dirname(absolutePath), { recursive: true });
    await fs.writeFile(absolutePath, content, 'utf-8');
    
    // Return new update time so the client remains in sync
    const newStats = await fs.stat(absolutePath);
    return NextResponse.json({ message: 'File saved', modifiedAt: newStats.mtime.toISOString() });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ error: 'Failed to save file' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filePathParam = searchParams.get('path');
  
  const absolutePath = getValidAbsolutePath(filePathParam);
  if (!absolutePath || !TRASH_PATH) {
    return NextResponse.json({ error: 'Invalid configuration or path' }, { status: 400 });
  }

  try {
    // Check if file exists
    await fs.stat(absolutePath);
    
    // Ensure .trash directory exists
    await fs.mkdir(TRASH_PATH, { recursive: true });
    
    // Move to trash with a timestamp prefix to avoid collisions
    const filename = path.basename(absolutePath);
    const timestamp = Date.now();
    const trashDest = path.join(TRASH_PATH, `${timestamp}-${filename}`);
    
    await fs.rename(absolutePath, trashDest);
    
    return NextResponse.json({ message: 'File moved to trash' });
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    console.error('Error deleting file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
