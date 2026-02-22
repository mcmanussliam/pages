import React from 'react';
import {describe, it, expect, vi, beforeEach} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';

const setThemeMock = vi.fn();

vi.mock('next-themes', () => ({useTheme: () => ({setTheme: setThemeMock}),}));

vi.mock('@/lib/i18n/i18n-provider', () => ({useI18n: () => ({t: (key: string) => key}),}));

vi.mock('@/components/ui/button', () => ({
  Button: ({children, ...props}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
  DropdownMenuTrigger: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
  DropdownMenuContent: ({children}: {children: React.ReactNode}) => <div>{children}</div>,
  DropdownMenuItem: ({
    children,
    onClick,
  }: {
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
  }) => <button onClick={onClick}>{children}</button>,
}));

import {ModeToggle} from '../mode-toggle';

describe('ModeToggle', () => {
  beforeEach(() => {
    setThemeMock.mockClear();
  });

  it('renders translated theme labels', () => {
    render(<ModeToggle />);

    expect(screen.getByText('theme.toggle')).toBeInTheDocument();
    expect(screen.getByText('theme.light')).toBeInTheDocument();
    expect(screen.getByText('theme.dark')).toBeInTheDocument();
    expect(screen.getByText('theme.system')).toBeInTheDocument();
  });

  it('sets the selected theme when menu options are clicked', () => {
    render(<ModeToggle />);

    fireEvent.click(screen.getByText('theme.light'));
    fireEvent.click(screen.getByText('theme.dark'));
    fireEvent.click(screen.getByText('theme.system'));

    expect(setThemeMock).toHaveBeenNthCalledWith(1, 'light');
    expect(setThemeMock).toHaveBeenNthCalledWith(2, 'dark');
    expect(setThemeMock).toHaveBeenNthCalledWith(3, 'system');
  });
});
