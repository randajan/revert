import { promises as fs } from 'fs';
import path from 'path';

const warnPatterns = [
  { pattern: /\bPromise\b/, message: 'Contains "Promise"' },
  { pattern: /\.then\s*\(/, message: 'Contains ".then("' },
  { pattern: /\.catch\s*\(/, message: 'Contains ".catch("' },
  { pattern: /\.finally\s*\(/, message: 'Contains ".finally("' },
];

async function processJsFile(content, filePath) {
  for (const { pattern, message } of warnPatterns) {
    if (pattern.test(content)) {
      console.warn(`[WARNING] ${filePath}: ${message}`);
    }
  }

  const transformed = content
    .replace(/\basync\s+/g, '')
    .replace(/\bawait\s+/g, '');

  return `// Converted to sync\n${transformed}`;
}

export async function createSyncVersion(srcdir, destdir) {
  const stat = await fs.stat(srcdir);
  if (stat.isDirectory()) {
    await fs.mkdir(destdir, { recursive: true });
    const entries = await fs.readdir(srcdir);
    for (const entry of entries) {
      const srcdirPath = path.join(srcdir, entry);
      const destdirPath = path.join(destdir, entry);
      await createSyncVersion(srcdirPath, destdirPath);
    }
  } else {
    let content = await fs.readFile(srcdir, 'utf8');
    if (srcdir.endsWith('.js')) {
      content = await processJsFile(content, srcdir);
    }
    await fs.writeFile(destdir, content);
  }
}

createSyncVersion("./src/async", "./src/sync");