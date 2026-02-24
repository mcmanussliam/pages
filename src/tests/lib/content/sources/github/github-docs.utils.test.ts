import {describe, expect, it} from 'vitest';
import {extractFirstH1, extractFirstParagraph, stripFrontmatter} from '@/lib/content/sources/github/github-docs.utils';

describe('github-docs.utils', () => {
  it('strips frontmatter and preserves markdown when no frontmatter exists', () => {
    const input = '---\ntitle: Test\n---\n# Heading\n\nBody';
    expect(stripFrontmatter(input)).toBe('# Heading\n\nBody');
    expect(stripFrontmatter('# No Frontmatter')).toBe('# No Frontmatter');
  });

  it('extracts first h1 heading text', () => {
    expect(extractFirstH1('## H2\n# Hello World\nText')).toBe('Hello World');
    expect(extractFirstH1('## No H1')).toBeNull();
  });

  it('extracts first non-heading paragraph and truncates long text', () => {
    const short = '# Title\n\nFirst paragraph.\n\nSecond paragraph.';
    expect(extractFirstParagraph(short)).toBe('First paragraph.');

    const longBody = `# Title\n\n${'a'.repeat(220)}\n`;
    const desc = extractFirstParagraph(longBody);
    expect(desc).toBe(`${'a'.repeat(197)}...`);
  });

  it('ignores fenced code blocks and returns null when no paragraph exists', () => {
    const onlyCode = '# Title\n\n```ts\nconst a = 1\n```\n';
    expect(extractFirstParagraph(onlyCode)).toBeNull();
  });
});
