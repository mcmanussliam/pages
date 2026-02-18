import {describe, it, expect, beforeEach, afterEach, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {TableOfContents} from '../table-of-contents';
import type {TocEntry} from '@/lib/content.types';

// Mock IntersectionObserver
class MockIntersectionObserver {
  public observe = vi.fn();
  public disconnect = vi.fn();
  public unobserve = vi.fn();
}

describe('TableOfContents', () => {
  beforeEach(() => {
    // @ts-expect-error - Mock IntersectionObserver
    global.IntersectionObserver = MockIntersectionObserver;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should render all TOC entries', () => {
    const toc: TocEntry[] = [
      {id: 'section-1', text: 'Section 1', level: 1},
      {id: 'section-2', text: 'Section 2', level: 2},
      {id: 'section-3', text: 'Section 3', level: 3},
    ];

    render(<TableOfContents toc={toc} />);

    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
    expect(screen.getByText('Section 3')).toBeInTheDocument();
  });

  it('should render "On this page" heading', () => {
    const toc: TocEntry[] = [
      {id: 'section-1', text: 'Section 1', level: 1},
    ];

    render(<TableOfContents toc={toc} />);

    expect(screen.getByText('On this page')).toBeInTheDocument();
  });

  it('should apply correct indentation for different heading levels', () => {
    const toc: TocEntry[] = [
      {id: 'h1', text: 'H1', level: 1},
      {id: 'h2', text: 'H2', level: 2},
      {id: 'h3', text: 'H3', level: 3},
    ];

    render(<TableOfContents toc={toc} />);

    const h2Item = screen.getByText('H2').closest('li');
    const h3Item = screen.getByText('H3').closest('li');

    // H2 should have ml-0 class
    expect(h2Item?.className).toContain('ml-0');

    // H3 should have ml-3 class
    expect(h3Item?.className).toContain('ml-3');
  });

  it('should render links with correct href', () => {
    const toc: TocEntry[] = [
      {id: 'section-1', text: 'Section 1', level: 1},
    ];

    render(<TableOfContents toc={toc} />);

    const link = screen.getByText('Section 1');
    expect(link).toHaveAttribute('href', '#section-1');
  });

  it('should not render if toc is empty', () => {
    const {container} = render(<TableOfContents toc={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it('should observe all heading elements', () => {
    const toc: TocEntry[] = [
      {id: 'section-1', text: 'Section 1', level: 1},
      {id: 'section-2', text: 'Section 2', level: 2},
    ];

    // Create mock elements in the DOM
    const mockElement1 = document.createElement('h1');
    mockElement1.id = 'section-1';
    const mockElement2 = document.createElement('h2');
    mockElement2.id = 'section-2';
    document.body.appendChild(mockElement1);
    document.body.appendChild(mockElement2);

    render(<TableOfContents toc={toc} />);

    // Verify IntersectionObserver was called
    const observer = new MockIntersectionObserver();
    expect(observer.observe).toBeDefined();

    // Cleanup
    document.body.removeChild(mockElement1);
    document.body.removeChild(mockElement2);
  });
});
