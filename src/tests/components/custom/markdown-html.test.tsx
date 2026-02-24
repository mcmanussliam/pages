import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';
import {MarkdownHtml} from '@/components/custom/markdown-html';

describe('MarkdownHtml', () => {
  it('renders raw html content', () => {
    render(<MarkdownHtml html="<h1>Hello</h1><p>World</p>" />);
    expect(screen.getByRole('heading', {name: 'Hello'})).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });
});
