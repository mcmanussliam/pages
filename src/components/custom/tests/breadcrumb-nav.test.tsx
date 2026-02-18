import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import {BreadcrumbNav} from '../breadcrumb-nav';

describe('BreadcrumbNav', () => {
  it('should render breadcrumb items', () => {
    const items = [
      {label: 'Home', href: '/'},
      {label: 'Projects', href: '/projects'},
      {label: 'Current Page'},
    ];

    render(<BreadcrumbNav items={items} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Current Page')).toBeInTheDocument();
  });

  it('should render links for items with href', () => {
    const items = [
      {label: 'Home', href: '/'},
      {label: 'Current'},
    ];

    render(<BreadcrumbNav items={items} />);

    const homeLink = screen.getByText('Home').closest('a');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('should not render link for last item', () => {
    const items = [
      {label: 'Home', href: '/'},
      {label: 'Current'},
    ];

    render(<BreadcrumbNav items={items} />);

    const currentPage = screen.getByText('Current');
    expect(currentPage.closest('a')).toBeNull();
  });

  it('should handle single item', () => {
    const items = [{label: 'Home'}];

    render(<BreadcrumbNav items={items} />);

    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('should render separators between items', () => {
    const items = [
      {label: 'Home', href: '/'},
      {label: 'Projects', href: '/projects'},
      {label: 'Current'},
    ];

    const {container} = render(<BreadcrumbNav items={items} />);
    const separators = container.querySelectorAll('[role="presentation"]');
    expect(separators.length).toBeGreaterThan(0);
  });
});
