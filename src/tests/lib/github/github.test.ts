import {afterEach, describe, expect, it, vi} from 'vitest';

afterEach(() => {
  delete process.env.GITHUB_TOKEN;
});

describe('github utils', () => {
  it('parses valid GitHub repo urls', async() => {
    const {parseGitHubRepoUrl} = await import('@/lib/github/github');
    expect(parseGitHubRepoUrl('https://github.com/octocat/hello-world')).toEqual({
      owner: 'octocat',
      repo: 'hello-world',
    });
  });

  it('throws for invalid GitHub repo urls', async() => {
    const {parseGitHubRepoUrl} = await import('@/lib/github/github');
    expect(() => parseGitHubRepoUrl('https://example.com/octocat/hello-world')).toThrow(
      /Invalid GitHub repo url/
    );
  });

  it('builds api headers with optional auth token', async() => {
    const {getGitHubApiHeaders} = await import('@/lib/github/github');

    expect(getGitHubApiHeaders()).toEqual({
      Accept: 'application/vnd.github+json',
      'User-Agent': 'pages-docs',
    });

    process.env.GITHUB_TOKEN = 'secret-token';
    expect(getGitHubApiHeaders()).toEqual({
      Accept: 'application/vnd.github+json',
      'User-Agent': 'pages-docs',
      Authorization: 'Bearer secret-token',
    });
  });

  it('normalizes unknown date-like values to iso dates', async() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-24T10:11:12.000Z'));

    const {toIsoDate} = await import('@/lib/github/github');

    expect(toIsoDate('2026-02-01T00:00:00Z')).toBe('2026-02-01');
    expect(toIsoDate(undefined)).toBeNull();
    expect(toIsoDate('not-a-date')).toBeNull();
    expect(toIsoDate(new Date())).toBe('2026-02-24');

    vi.useRealTimers();
  });
});
