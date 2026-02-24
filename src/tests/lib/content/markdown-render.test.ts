import {describe, expect, it} from 'vitest';
import {renderMarkdownToHtml} from '@/lib/content/rendering/markdown-render';

describe('markdown-render', () => {
  it('rewrites relative doc links and image urls', async() => {
    const html = await renderMarkdownToHtml({
      markdown: [
        '# Intro',
        '',
        '[Guide](./guide.md#part)',
        '',
        '![Logo](./images/logo.png)',
      ].join('\n'),
      projectId: 'otto',
      currentSlug: 'docs/intro',
      rawBaseUrl: 'https://raw.example.com/repo/',
    });

    expect(html).toContain('href="/projects/otto/docs/docs/guide#part"');
    expect(html).toContain('src="https://raw.example.com/repo/docs/images/logo.png"');
  });

  it('applies heading and inline style classes', async() => {
    const html = await renderMarkdownToHtml({
      markdown: [
        '# Intro Heading',
        '',
        'Paragraph with `inline` code and [link](https://example.com).',
      ].join('\n'),
      projectId: 'otto',
      currentSlug: 'README',
      rawBaseUrl: '',
    });

    expect(html).toContain('id="intro-heading"');
    expect(html).toContain('class="mt-10 mb-4 text-2xl font-black tracking-tight"');
    expect(html).toContain('class="leading-7 text-sm mt-4 first:mt-0"');
    expect(html).toContain('class="px-1.5 py-0.5 font-mono bg-muted text-sm"');
    expect(html).toContain('class="font-medium link-foreground underline underline-offset-4"');
  });

  it('adds lazy-loading defaults to images', async() => {
    const html = await renderMarkdownToHtml({
      markdown: '![Logo](./logo.png)',
      projectId: 'otto',
      currentSlug: 'README',
      rawBaseUrl: 'https://raw.example.com/repo/',
    });

    expect(html).toContain('loading="lazy"');
    expect(html).toContain('decoding="async"');
    expect(html).toContain('class="my-6 w-full border dim"');
  });
});
