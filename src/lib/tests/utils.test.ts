import {describe, it, expect} from 'vitest';
import {cn} from '../utils';

describe('cn', () => {
  it('should merge class names', () => {
    const result = cn('class1', 'class2');

    expect(result).toContain('class1');
    expect(result).toContain('class2');
  });

  it('should handle conditional classes', () => {
    const result = cn('base', true && 'conditional', false && 'excluded');

    expect(result).toContain('base');
    expect(result).toContain('conditional');
    expect(result).not.toContain('excluded');
  });

  it('should handle Tailwind merge conflicts', () => {
    const result = cn('p-4', 'p-2');

    expect(result).toBe('p-2');
  });

  it('should handle arrays of classes', () => {
    const result = cn(['class1', 'class2'], 'class3');

    expect(result).toContain('class1');
    expect(result).toContain('class2');
    expect(result).toContain('class3');
  });

  it('should handle objects with boolean values', () => {
    const result = cn({
      active: true,
      inactive: false,
      enabled: true,
    });

    expect(result).toContain('active');
    expect(result).toContain('enabled');
    expect(result).not.toContain('inactive');
  });

  it('should handle undefined and null values', () => {
    const result = cn('class1', undefined, null, 'class2');

    expect(result).toContain('class1');
    expect(result).toContain('class2');
  });

  it('should handle empty input', () => {
    const result = cn();

    expect(result).toBe('');
  });
});
