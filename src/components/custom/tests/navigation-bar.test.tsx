import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import NavigationBar from '../navigation-bar';

describe('NavigationBar', () => {
  it('should render all navigation links', () => {
    render(<NavigationBar />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('should have correct href attributes', () => {
    render(<NavigationBar />);

    const homeLink = screen.getByText('Home').closest('a');
    const projectsLink = screen.getByText('Projects').closest('a');
    const githubLink = screen.getByText('GitHub').closest('a');

    expect(homeLink).toHaveAttribute('href', '/');
    expect(projectsLink).toHaveAttribute('href', '/projects');
    expect(githubLink).toHaveAttribute('href', 'https://github.com/mcmanussliam');
  });

  it('should render navigation menu structure', () => {
    const {container} = render(<NavigationBar />);
    const navList = container.querySelector('ul');

    expect(navList).not.toBeNull();
  });
});
