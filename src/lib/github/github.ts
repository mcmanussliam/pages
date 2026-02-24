function getGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'pages-docs',
  };

  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

export function parseGitHubRepoUrl(repoUrl: string): {owner: string; repo: string} {
  const match = repoUrl.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/?$/);
  if (!match) {
    throw new Error(`Invalid GitHub repo url: ${repoUrl}`);
  }

  return {owner: match[1], repo: match[2]};
}

export function getGitHubApiHeaders(): Record<string, string> {
  return getGitHubHeaders();
}

export function toIsoDate(value: unknown): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

