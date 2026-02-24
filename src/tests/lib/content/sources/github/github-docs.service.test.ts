import {beforeEach, describe, expect, it, vi} from 'vitest';

const {fetchJsonCachedMock, fetchTextCachedMock} = vi.hoisted(() => ({
  fetchJsonCachedMock: vi.fn(),
  fetchTextCachedMock: vi.fn(),
}));

vi.mock('@/lib/github/github-cache', () => ({
  fetchJsonCached: fetchJsonCachedMock,
  fetchTextCached: fetchTextCachedMock,
}));

const REPO_API = 'https://api.github.com/repos/mcmanussliam/brb';
const LATEST_RELEASE_API = `${REPO_API}/releases/latest`;
const SUMMARY_SRC_API = `${REPO_API}/contents/docs/src/SUMMARY.md?ref=main`;
const SUMMARY_ROOT_API = `${REPO_API}/contents/docs/SUMMARY.md?ref=main`;
const README_API = `${REPO_API}/contents/docs/src/README.md?ref=main`;
const DOC_API = `${REPO_API}/contents/docs/src/getting-started.md?ref=main`;

const RAW_SUMMARY = 'https://raw.example/summary.md';
const RAW_README = 'https://raw.example/readme.md';
const RAW_DOC = 'https://raw.example/getting-started.md';

const SUMMARY_MARKDOWN = [
  '- [Intro](README.md)',
  '- [Getting Started](getting-started.md)',
].join('\n');

const README_MARKDOWN = [
  '---',
  'title: Docs',
  '---',
  '# BRB',
  '',
  'A concise CLI for breaks.',
].join('\n');

const DOC_MARKDOWN = [
  '---',
  'title: Getting Started',
  '---',
  '# Getting Started',
  '',
  'Install it and run.',
].join('\n');

async function loadService() {
  return import('@/lib/content/sources/github/github-docs.service');
}

function installHappyPathMocks(opts?: {summaryAtRoot?: boolean;latest404?: boolean;missingDocDownloadUrl?: boolean}) {
  fetchJsonCachedMock.mockImplementation((url: string) => {
    if (url === REPO_API) {
      return {
        status: 200,
        fromCache: false,
        json: {
          html_url: 'https://github.com/mcmanussliam/brb',
          name: 'brb',
          description: null,
          pushed_at: '2026-02-20T00:00:00.000Z',
          updated_at: '2026-02-19T00:00:00.000Z',
          default_branch: 'main',
          stargazers_count: 1,
          forks_count: 1,
          open_issues_count: 0,
        },
      };
    }

    if (url === LATEST_RELEASE_API) {
      if (opts?.latest404) {
        throw new Error('HTTP 404 for latest');
      }

      return {
        status: 200,
        fromCache: false,
        json: {
          tag_name: 'v1.2.3',
          published_at: '2026-02-18T00:00:00.000Z',
          html_url: 'https://github.com/mcmanussliam/brb/releases/tag/v1.2.3',
        },
      };
    }

    if (url === SUMMARY_SRC_API) {
      if (opts?.summaryAtRoot) {
        throw new Error('missing');
      }
      return {status: 200, fromCache: false, json: {type: 'file', download_url: RAW_SUMMARY}};
    }

    if (url === SUMMARY_ROOT_API) {
      return {status: 200, fromCache: false, json: {type: 'file', download_url: RAW_SUMMARY}};
    }

    if (url === README_API) {
      return {status: 200, fromCache: false, json: {type: 'file', download_url: RAW_README}};
    }

    if (url === DOC_API) {
      return {
        status: 200,
        fromCache: false,
        json: {
          type: 'file',
          download_url: opts?.missingDocDownloadUrl ? null : RAW_DOC,
        },
      };
    }

    throw new Error(`unexpected json url: ${url}`);
  });

  fetchTextCachedMock.mockImplementation((url: string) => {
    if (url === RAW_SUMMARY) {
      return {status: 200, fromCache: false, text: SUMMARY_MARKDOWN};
    }

    if (url === RAW_README) {
      return {status: 200, fromCache: false, text: README_MARKDOWN};
    }

    if (url === RAW_DOC) {
      return {status: 200, fromCache: false, text: DOC_MARKDOWN};
    }

    throw new Error(`unexpected text url: ${url}`);
  });
}

describe('GitHubDocsService', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('derives project ids from config', async() => {
    const {GitHubDocsService} = await loadService();
    const service = new GitHubDocsService();
    expect(service.getProjectIdsFromConfig()).toEqual(['brb']);
  });

  it('returns null for unknown projects', async() => {
    const {GitHubDocsService} = await loadService();
    const service = new GitHubDocsService();
    await expect(service.getProject('missing')).resolves.toBeNull();
    await expect(service.getDoc('missing', ['a'])).resolves.toBeNull();
    await expect(service.getProjectReadme('missing')).resolves.toBeNull();
    await expect(service.getProjectDocs('missing')).resolves.toEqual([]);
  });

  it('builds a single project with fallback description and no latest release on 404', async() => {
    installHappyPathMocks({latest404: true});
    const {GitHubDocsService} = await loadService();
    const service = new GitHubDocsService({ttlMs: 1000});

    const project = await service.getProject('brb');
    expect(project).not.toBeNull();
    expect(project?.id).toBe('brb');
    expect(project?.title).toBe('brb');
    expect(project?.description).toBe('Documentation for brb.');
    expect(project?.lastUpdated).toBe('2026-02-20');
    expect(project?.docsCount).toBe(1);
    expect(project?.recentRelease).toBeUndefined();
    expect(project?.links?.map(link => link.key)).toEqual(['Repository', 'Release']);
  });

  it('builds project lists using README title and paragraph', async() => {
    installHappyPathMocks();
    const {GitHubDocsService} = await loadService();
    const service = new GitHubDocsService({ttlMs: 1000});

    const projects = await service.getProjects();
    expect(projects).toHaveLength(1);
    expect(projects[0]).toMatchObject({
      id: 'brb',
      title: 'BRB',
      description: 'A concise CLI for breaks.',
      docsCount: 1,
    });

    expect(projects[0].recentRelease?.tag).toBe('v1.2.3');
  });

  it('builds ordered project docs from mdbook summary and skips README', async() => {
    installHappyPathMocks({summaryAtRoot: true});
    const {GitHubDocsService} = await loadService();
    const service = new GitHubDocsService();

    const docs = await service.getProjectDocs('brb');
    expect(docs).toEqual([
      {
        slug: 'getting-started',
        path: ['getting-started'],
        title: 'Getting Started',
        description: undefined,
        project: 'brb',
        order: 1,
        lastUpdated: '2026-02-20',
      },
    ]);
  });

  it('returns doc payload with stripped markdown and raw base url', async() => {
    installHappyPathMocks();
    const {GitHubDocsService} = await loadService();
    const service = new GitHubDocsService();

    const result = await service.getDoc('brb', ['getting-started']);
    expect(result).not.toBeNull();
    expect(result?.doc).toMatchObject({
      slug: 'getting-started',
      title: 'Getting Started',
      description: 'Install it and run.',
      project: 'brb',
      lastUpdated: '2026-02-20',
    });

    expect(result?.content).toEqual({
      markdown: '# Getting Started\n\nInstall it and run.',
      rawBaseUrl: 'https://raw.githubusercontent.com/mcmanussliam/brb/main/docs/src/',
    });
  });

  it('returns null when doc slug cannot be matched or file has no download url', async() => {
    installHappyPathMocks();
    const {GitHubDocsService} = await loadService();
    const service = new GitHubDocsService();
    await expect(service.getDoc('brb', ['missing'])).resolves.toBeNull();

    installHappyPathMocks({missingDocDownloadUrl: true});
    await expect(service.getDoc('brb', ['getting-started'])).resolves.toBeNull();
  });

  it('returns null when README lookup fails', async() => {
    installHappyPathMocks();
    const baseImpl = fetchJsonCachedMock.getMockImplementation();
    fetchJsonCachedMock.mockImplementation((url: string) => {
      if (url === README_API) {
        throw new Error('missing readme');
      }

      if (!baseImpl) {
        throw new Error('missing base mock implementation');
      }

      return baseImpl(url);
    });

    const {GitHubDocsService} = await loadService();
    const service = new GitHubDocsService();
    await expect(service.getProjectReadme('brb')).resolves.toBeNull();
  });
});
