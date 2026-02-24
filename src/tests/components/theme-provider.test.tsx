import React from 'react';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {render, screen} from '@testing-library/react';

const {nextThemeProviderMock} = vi.hoisted(() => ({
  nextThemeProviderMock: vi.fn(({children}: {
    children: React.ReactNode;
    attribute?: string;
    defaultTheme?: string;
  }) => (
    <div data-testid="next-themes-provider">{children}</div>
  )),
}));

vi.mock('next-themes', () => ({ThemeProvider: nextThemeProviderMock,}));

import {ThemeProvider} from '@/components/theme-provider';

describe('ThemeProvider', () => {
  beforeEach(() => {
    nextThemeProviderMock.mockClear();
  });

  it('forwards props to next-themes ThemeProvider and renders children', () => {
    render(
      <ThemeProvider attribute="class" defaultTheme="system">
        <span>Theme child</span>
      </ThemeProvider>
    );

    expect(screen.getByText('Theme child')).toBeInTheDocument();
    expect(nextThemeProviderMock).toHaveBeenCalled();

    const [[firstCallProps]] = nextThemeProviderMock.mock.calls;
    expect(firstCallProps.attribute).toBe('class');
    expect(firstCallProps.defaultTheme).toBe('system');
  });
});
