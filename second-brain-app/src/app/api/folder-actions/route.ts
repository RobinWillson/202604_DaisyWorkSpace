import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const NOTES_PATH = process.env.NOTES_PATH || '';
const TRASH_PATH = process.env.TRASH_PATH || '';

// Prevent path traversal
function getValidAbsolutePath(relPath: string | null): string | null {
  if (!relPath || !NOTES_PATH) return null;
  const targetPath = path.join(NOTES_PATH, relPath);
  if (!targetPath.startsWith(NOTES_PATH)) return null;
  return targetPath;
}

export async function PUT(req: NextRequest) {
  try {
    const { action, sourcePath, targetPath, newName } = await req.json();
    const absoluteSource = getValidAbsolutePath(sourcePath);
    if (!absoluteSource) return NextResponse.json({ error: 'Invalid source' }, { status: 400 });

    if (action === 'rename') {
       if (!newName) return NextResponse.json({ error: 'newName required' }, { status: 400 });
       const absoluteNew = path.join(path.dirname(absoluteSource), newName);
       if (!absoluteNew.startsWith(NOTES_PATH)) return NextResponse.json({ error: 'Invalid name/path' }, { status: 400 });
       await fs.rename(absoluteSource, absoluteNew);
       return NextResponse.json({ message: 'Renamed successfully' });
    } else if (action === 'move') {
       if (!targetPath) return NextResponse.json({ error: 'targetPath required' }, { status: 400 });
       const absoluteTarget = getValidAbsolutePath(targetPath);
       if (!absoluteTarget) return NextResponse.json({ error: 'Invalid target' }, { status: 400 });
       const baseName = path.basename(absoluteSource);
       const dest = path.join(absoluteTarget, baseName);
       await fs.rename(absoluteSource, dest);
       return NextResponse.json({ message: 'Moved successfully' });
    }
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Folder operation failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetPath = searchParams.get('path');
  const absoluteTarget = getValidAbsolutePath(targetPath);

  if (!absoluteTarget || !TRASH_PATH) return NextResponse.json({ error: 'Invalid config/path' }, { status: 400 });

  try {
    await fs.stat(absoluteTarget);
    await fs.mkdir(TRASH_PATH, { recursive: true });
    
    // Trash safely
    const folderName = path.basename(absoluteTarget);
    const timestamp = Date.now();
    const trashDest = path.join(TRASH_PATH, `${timestamp}-dir-${folderName}`);
    
    await fs.rename(absoluteTarget, trashDest);
    return NextResponse.json({ message: 'Folder moved to trash' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
