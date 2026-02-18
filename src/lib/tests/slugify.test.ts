import {describe, it, expect} from 'vitest';
import {slugify} from '../slugify';

describe('slugify', () => {
  it('should convert text to lowercase', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('should replace spaces with hyphens', () => {
    expect(slugify('multiple   spaces   here')).toBe('multiple-spaces-here');
  });

  it('should remove special characters', () => {
    expect(slugify('Hello! World?')).toBe('hello-world');
    expect(slugify('Test@#$%^&*()')).toBe('test');
  });

  it('should trim whitespace', () => {
    expect(slugify('  hello world  ')).toBe('hello-world');
  });

  it('should handle mixed case and special characters', () => {
    expect(slugify('Getting Started!')).toBe('getting-started');
    expect(slugify('API Reference (v2.0)')).toBe('api-reference-v20');
  });

  it('should preserve hyphens in the input', () => {
    expect(slugify('pre-existing-hyphens')).toBe('pre-existing-hyphens');
  });

  it('should handle empty strings', () => {
    expect(slugify('')).toBe('');
  });

  it('should handle strings with only special characters', () => {
    expect(slugify('!@#$%^&*()')).toBe('');
  });

  it('should handle underscores correctly', () => {
    expect(slugify('hello_world')).toBe('hello_world');
  });
});
