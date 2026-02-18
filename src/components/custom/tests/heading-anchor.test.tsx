import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import HeadingWithAnchor from '../heading-anchor';

describe('HeadingWithAnchor', () => {
  it('should render heading with correct tag', () => {
    const {container} = render(
      <HeadingWithAnchor as="h2" className="">
        Test Heading
      </HeadingWithAnchor>
    );
    const heading = container.querySelector('h2');

    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Test Heading');
  });

  it('should generate id from heading text', () => {
    const {container} = render(
      <HeadingWithAnchor as="h3" className="">
        Getting Started
      </HeadingWithAnchor>
    );
    const heading = container.querySelector('h3');

    expect(heading).toHaveAttribute('id', 'getting-started');
  });

  it('should render anchor link with correct href', () => {
    render(
      <HeadingWithAnchor as="h2" className="">
        Test Heading
      </HeadingWithAnchor>
    );
    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('href', '#test-heading');
  });

  it('should have accessible aria-label', () => {
    render(
      <HeadingWithAnchor as="h2" className="">
        API Reference
      </HeadingWithAnchor>
    );
    const link = screen.getByRole('link');

    expect(link).toHaveAttribute('aria-label', 'Link to section API Reference');
  });

  it('should apply custom className', () => {
    const {container} = render(
      <HeadingWithAnchor as="h2" className="custom-class">
        Test
      </HeadingWithAnchor>
    );
    const heading = container.querySelector('h2');

    expect(heading).toHaveClass('custom-class');
  });

  it('should handle complex heading text', () => {
    const {container} = render(
      <HeadingWithAnchor as="h2" className="">
        Hello! World?
      </HeadingWithAnchor>
    );
    const heading = container.querySelector('h2');

    expect(heading).toHaveAttribute('id', 'hello-world');
  });

  it('should render link icon on hover', () => {
    const {container} = render(
      <HeadingWithAnchor as="h2" className="">
        Test
      </HeadingWithAnchor>
    );
    const icon = container.querySelector('svg');

    expect(icon).toBeInTheDocument();
  });
});
