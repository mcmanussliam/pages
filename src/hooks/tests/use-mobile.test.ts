import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useIsMobile} from '../use-mobile';

describe('useIsMobile', () => {
  let matchMediaMock: {
    matches: boolean;
    addEventListener: ReturnType<typeof vi.fn>;
    removeEventListener: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    matchMediaMock = {
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    };

    window.matchMedia = vi.fn().mockImplementation(() => matchMediaMock);
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return false for desktop viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });

    const {result} = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);
  });

  it('should return true for mobile viewport', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 375,
    });

    const {result} = renderHook(() => useIsMobile());

    expect(result.current).toBe(true);
  });

  it('should register event listener on mount', () => {
    renderHook(() => useIsMobile());

    expect(matchMediaMock.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should cleanup event listener on unmount', () => {
    const {unmount} = renderHook(() => useIsMobile());

    unmount();

    expect(matchMediaMock.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should update when viewport changes', () => {
    const {result} = renderHook(() => useIsMobile());

    expect(result.current).toBe(false);

    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375,
      });

      // eslint-disable-next-line prefer-destructuring
      const changeCallback = matchMediaMock.addEventListener.mock.calls[0][1];

      changeCallback();
    });

    expect(result.current).toBe(true);
  });

  it('should use 768px as mobile breakpoint', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 767,
    });

    const {result: result767} = renderHook(() => useIsMobile());

    expect(result767.current).toBe(true);

    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 768,
    });

    const {result: result768} = renderHook(() => useIsMobile());

    expect(result768.current).toBe(false);
  });
});
