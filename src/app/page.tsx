import fs from 'fs';
import path from 'path';
import { HomeClient } from '@/components/file-upload/HomeClient';

export const dynamic = 'force-dynamic';

interface DataFile {
  name: string;
  size: number;
  modified: string;
}

function getDataFiles(): DataFile[] {
  const dataDir = path.join(process.cwd(), 'Data');
  if (!fs.existsSync(dataDir)) return [];

  return fs
    .readdirSync(dataDir)
    .filter((f) => f.endsWith('.json'))
    .map((name) => {
      const stat = fs.statSync(path.join(dataDir, name));
      return {
        name,
        size: stat.size,
        modified: stat.mtime.toISOString(),
      };
    })
    .sort((a, b) => b.modified.localeCompare(a.modified));
}

export default function HomePage() {
  const files = getDataFiles();

  return <HomeClient files={files} />;
}
