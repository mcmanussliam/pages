import path from 'path';

export interface MdBookEntry {
  title: string;

mdPath: string;
}

export function parseMdBookSummary(summaryMarkdown: string): MdBookEntry[] {
  const lines = summaryMarkdown.split('\n');
  const entries: MdBookEntry[] = [];

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');
    const match = line.match(/^\s*-\s+\[([^\]]+)\]\(([^)]+)\)/);
    if (!match) {
      continue;
    }

    const title = match[1].trim();
    const link = match[2].trim();
    if (!link || link.startsWith('http://') || link.startsWith('https://') || link.startsWith('#')) {
      continue;
    }

    const [linkPath] = link.split('#');
    if (!linkPath?.toLowerCase().endsWith('.md')) {
      continue;
    }

    entries.push({title, mdPath: linkPath});
  }

  return entries;
}

export function mdPathToSlug(mdPath: string): string {
  return mdPath.replace(/\.md$/i, '');
}

export function resolveRelativeMdLink(currentSlug: string, url: string): string | null {
  if (!url) {
    return null;
  }

  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('#')) {
    return null;
  }

  const [rawPath, rawHash] = url.split('#');
  if (!rawPath?.toLowerCase().endsWith('.md')) {
    return null;
  }

  const baseDir = path.posix.dirname(`${currentSlug}.md`);
  const resolved = path.posix.normalize(path.posix.join(baseDir, rawPath));
  const slug = mdPathToSlug(resolved);
  const hash = rawHash ? `#${rawHash}` : '';

  return `${slug}${hash}`;
}
