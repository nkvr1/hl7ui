import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'Data');

export async function GET() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      return NextResponse.json({ files: [] });
    }

    const allFiles = fs.readdirSync(DATA_DIR);
    const jsonFiles = allFiles
      .filter((f) => f.endsWith('.json'))
      .map((name) => {
        const stat = fs.statSync(path.join(DATA_DIR, name));
        return {
          name,
          size: stat.size,
          modified: stat.mtime.toISOString(),
        };
      })
      .sort((a, b) => b.modified.localeCompare(a.modified));

    return NextResponse.json({ files: jsonFiles });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to list files' },
      { status: 500 }
    );
  }
}
