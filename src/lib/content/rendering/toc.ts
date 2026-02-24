import {slugify} from '@/lib/utils/slugify';
import type {TocEntry} from '../content.types';

export function extractTocFromContent(content: string): TocEntry[] {
  const toc: TocEntry[] = [];
  const lines = content.split('\n');
  let activeFenceMarker: '```' | '~~~' | null = null;

  for (const line of lines) {
    const fenceMatch = line.trim().match(/^(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1].startsWith('`') ? '```' : '~~~';

      if (!activeFenceMarker) {
        activeFenceMarker = marker;
        continue;
      }

      if (activeFenceMarker === marker) {
        activeFenceMarker = null;
      }

      continue;
    }

    if (activeFenceMarker) {
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (!headingMatch) {
      continue;
    }

    const level = headingMatch[1].length as 1 | 2 | 3;
    const text = headingMatch[2].trim();

    const cleanText = text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*]+)\*/g, '$1');

    const id = slugify(cleanText);
    toc.push({id, text: cleanText, level});
  }

  return toc;
}
