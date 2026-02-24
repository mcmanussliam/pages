/**
 * Strips YAML frontmatter (`--- ... ---`) from markdown.
 *
 * @example
 * stripFrontmatter('---\\ntitle: Test\\n---\\n# Heading')
 * // => '# Heading'
 */
export function stripFrontmatter(markdown: string): string {
  const trimmed = markdown.startsWith('\uFEFF') ? markdown.slice(1) : markdown;
  if (!trimmed.startsWith('---\n')) {
    return markdown;
  }

  const end = trimmed.indexOf('\n---\n', 4);
  if (end === -1) {
    return markdown;
  }

  return trimmed.slice(end + '\n---\n'.length);
}

/**
 * Extracts the first H1 (`# ...`) from markdown.
 *
 * @example
 * extractFirstH1('# Hello\\n\\nText')
 * // => 'Hello'
 */
export function extractFirstH1(markdown: string): string | null {
  for (const line of markdown.split('\n')) {
    const match = line.match(/^#\s+(.+)\s*$/);
    if (match) {
      return match[1].trim();
    }
  }

  return null;
}

/**
 * Extracts a short description from the first non-heading paragraph.
 *
 * @example
 * extractFirstParagraph('# Title\\n\\nThis is the first paragraph.\\n\\nSecond.')
 * // => 'This is the first paragraph.'
 */
export function extractFirstParagraph(markdown: string): string | null {
  const lines = markdown.split('\n');
  let inFence = false;
  const paragraph: string[] = [];

  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('```') || t.startsWith('~~~')) {
      inFence = !inFence;
      continue;
    }

    if (inFence) {
      continue;
    }

    if (t.startsWith('#')) {
      continue;
    }

    if (!t) {
      if (paragraph.length) {
        break;
      }
      continue;
    }

    paragraph.push(t);
  }

  const text = paragraph.join(' ').trim();
  if (!text) {
    return null;
  }

  return text.length > 200 ? `${text.slice(0, 197)}...` : text;
}

