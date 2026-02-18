import {describe, it, expect, vi} from 'vitest';
import {render, screen} from '@testing-library/react';
import {ProjectNav} from '../project-nav';
import type {Project, Doc} from '@/lib/content.types';

vi.mock('next/navigation', () => ({usePathname: vi.fn(() => '/projects/test-project'),}));

describe('ProjectNav', () => {
  const mockProject: Project = {
    id: 'test-project',
    title: 'Test Project',
    description: 'A test project',
    lastUpdated: '2024-01-01',
    docsCount: 2,
  };

  const mockDocs: Doc[] = [
    {
      slug: 'getting-started',
      title: 'Getting Started',
      project: 'test-project',
      lastUpdated: '2024-01-01',
    },
    {
      slug: 'api-reference',
      title: 'API Reference',
      project: 'test-project',
      lastUpdated: '2024-01-01',
    },
  ] as unknown as Doc[];

  it('should render project title', () => {
    render(<ProjectNav project={mockProject} docs={mockDocs} />);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
  });

  it('should render Overview link', () => {
    render(<ProjectNav project={mockProject} docs={mockDocs} />);

    const overviewLink = screen.getByText('Overview').closest('a');

    expect(overviewLink).toHaveAttribute('href', '/projects/test-project');
  });

  it('should render all documentation links', () => {
    render(<ProjectNav project={mockProject} docs={mockDocs} />);

    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('API Reference')).toBeInTheDocument();
  });

  it('should have correct href for doc links', () => {
    render(<ProjectNav project={mockProject} docs={mockDocs} />);

    const gettingStartedLink = screen.getByText('Getting Started').closest('a');
    const apiRefLink = screen.getByText('API Reference').closest('a');

    expect(gettingStartedLink).toHaveAttribute('href', '/projects/test-project/docs/getting-started');
    expect(apiRefLink).toHaveAttribute('href', '/projects/test-project/docs/api-reference');
  });

  it('should handle empty docs array', () => {
    render(<ProjectNav project={mockProject} docs={[]} />);

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.queryByText('Getting Started')).not.toBeInTheDocument();
  });

  it('should render as a nav element', () => {
    const {container} = render(<ProjectNav project={mockProject} docs={mockDocs} />);
    const nav = container.querySelector('nav');

    expect(nav).toBeInTheDocument();
  });
});
