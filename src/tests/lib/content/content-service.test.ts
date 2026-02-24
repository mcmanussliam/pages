import {describe, expect, it, vi, beforeEach} from 'vitest';

const {readFileMock} = vi.hoisted(() => ({readFileMock: vi.fn(),}));

vi.mock('fs/promises', () => ({
  default: {readFile: readFileMock},
  readFile: readFileMock,
}));

const {
  getProjectMock,
  getProjectDocsMock,
  getDocMock,
  extractTocFromContentMock,
} = vi.hoisted(() => ({
  getProjectMock: vi.fn(),
  getProjectDocsMock: vi.fn(),
  getDocMock: vi.fn(),
  extractTocFromContentMock: vi.fn(),
}));

vi.mock('@/lib/content/content', () => ({
  contentRepository: {
    getProject: getProjectMock,
    getProjectDocs: getProjectDocsMock,
    getDoc: getDocMock,
  },
  extractTocFromContent: extractTocFromContentMock,
}));

async function loadContentService() {
  return import('@/lib/content/services/content-service');
}

function buildDoc(projectId: string, slug: string, order: number) {
  return {
    slug,
    path: slug.split('/'),
    title: slug,
    project: projectId,
    order,
    lastUpdated: '2026-02-22',
  };
}

const DOCS_BY_PROJECT = {
  brb: [
    buildDoc('brb', 'getting-started', 1),
    buildDoc('brb', 'config', 2),
  ],
  nd: [
    buildDoc('nd', 'getting-started', 1),
  ],
  'obsidian-actions': [
    buildDoc('obsidian-actions', 'getting-started', 1),
    buildDoc('obsidian-actions', 'command-types', 2),
    buildDoc('obsidian-actions', 'hooks', 3),
    buildDoc('obsidian-actions', 'examples', 4),
    buildDoc('obsidian-actions', 'env-variables', 5),
  ],
  otto: [
    buildDoc('otto', 'getting-started', 1),
    buildDoc('otto', 'task-modes', 2),
    buildDoc('otto', 'config-reference', 3),
    buildDoc('otto', 'command-reference', 4),
  ],
} as const;

describe('content-service', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('loads every project/doc dynamic import variant', async() => {
    const {getDocPageData, getProjectPageData} = await loadContentService();

    getProjectMock.mockImplementation((projectId: string) => Promise.resolve({
      id: projectId,
      title: `${projectId} title`,
      description: `${projectId} description`,
      lastUpdated: '2026-02-22',
      docsCount: DOCS_BY_PROJECT[projectId as keyof typeof DOCS_BY_PROJECT]?.length ?? 0,
    }));
    getProjectDocsMock.mockImplementation((projectId: string) => Promise.resolve(
      DOCS_BY_PROJECT[projectId as keyof typeof DOCS_BY_PROJECT] ?? []
    ));
    getDocMock.mockImplementation((projectId: string, slugParts: string[]) => {
      const slug = slugParts.join('/');
      const docs = DOCS_BY_PROJECT[projectId as keyof typeof DOCS_BY_PROJECT] ?? [];
      return Promise.resolve(docs.find(doc => doc.slug === slug) ?? null);
    });
    readFileMock.mockResolvedValue('# Intro');
    extractTocFromContentMock.mockReturnValue([{id: 'intro', text: 'Intro', level: 1}]);

    const projectIds = Object.keys(DOCS_BY_PROJECT);
    for (const projectId of projectIds) {
      const projectPageData = await getProjectPageData(projectId);
      expect(projectPageData?.project.id).toBe(projectId);

      for (const doc of DOCS_BY_PROJECT[projectId as keyof typeof DOCS_BY_PROJECT]) {
        const docPageData = await getDocPageData(projectId, doc.slug);
        expect(docPageData?.doc.slug).toBe(doc.slug);
      }
    }
  });

  it('returns null when project metadata is missing for project pages', async() => {
    const {getProjectPageData} = await loadContentService();

    getProjectMock.mockResolvedValue(null);
    getProjectDocsMock.mockResolvedValue([]);

    await expect(getProjectPageData('missing-service-project')).resolves.toBeNull();
  });

  it('returns project page data when project exists', async() => {
    const {getProjectPageData} = await loadContentService();

    const project = {
      id: 'otto',
      title: 'Mock Service Project',
      description: 'Used by content service tests',
      lastUpdated: '2026-02-22',
      docsCount: 2,
    };
    const docs = [
      {
        slug: 'getting-started',
        path: ['getting-started'],
        title: 'Getting Started',
        project: 'otto',
        order: 1,
        lastUpdated: '2026-02-22',
      },
    ];

    getProjectMock.mockResolvedValue(project);
    getProjectDocsMock.mockResolvedValue(docs);

    const result = await getProjectPageData('otto');
    expect(result).not.toBeNull();
    expect(result?.project).toEqual(project);
    expect(result?.docs).toEqual(docs);
    expect(typeof result?.ProjectContent).toBe('function');
  });

  it('returns doc page data with toc and previous/next navigation', async() => {
    const {getDocPageData} = await loadContentService();

    const project = {
      id: 'otto',
      title: 'Mock Service Project',
      description: 'Used by content service tests',
      lastUpdated: '2026-02-22',
      docsCount: 2,
    };
    const docs = [
      {
        slug: 'getting-started',
        path: ['getting-started'],
        title: 'Getting Started',
        project: 'otto',
        order: 1,
        lastUpdated: '2026-02-22',
      },
      {
        slug: 'config',
        path: ['config'],
        title: 'Config',
        project: 'otto',
        order: 2,
        lastUpdated: '2026-02-22',
      },
    ];
    const [doc] = docs;
    const toc = [{id: 'intro', text: 'Intro', level: 1 as const}];

    getProjectMock.mockResolvedValue(project);
    getProjectDocsMock.mockResolvedValue(docs);
    getDocMock.mockResolvedValue(doc);
    readFileMock.mockResolvedValue('# Intro');
    extractTocFromContentMock.mockReturnValue(toc);

    const result = await getDocPageData('otto', 'getting-started');
    expect(result).not.toBeNull();
    expect(result?.project).toEqual(project);
    expect(result?.doc).toEqual(doc);
    expect(result?.docs).toEqual(docs);
    expect(result?.toc).toEqual(toc);
    expect(result?.prevDoc).toBeNull();
    expect(result?.nextDoc).toEqual(docs[1]);
    expect(typeof result?.Content).toBe('function');
  });

  it('returns null when doc is missing for doc pages', async() => {
    const {getDocPageData} = await loadContentService();

    getProjectMock.mockResolvedValue(null);
    getProjectDocsMock.mockResolvedValue([]);
    getDocMock.mockResolvedValue(null);

    await expect(getDocPageData('missing-service-project', 'missing-doc')).resolves.toBeNull();
  });

  it('returns null previous/next docs when the current slug is not in the docs list', async() => {
    const {getDocPageData} = await loadContentService();

    const docs = [
      buildDoc('otto', 'config-reference', 1),
    ];
    const doc = buildDoc('otto', 'getting-started', 2);

    getProjectMock.mockResolvedValue({
      id: 'otto',
      title: 'Otto',
      description: 'Otto project',
      lastUpdated: '2026-02-22',
      docsCount: 2,
    });
    getProjectDocsMock.mockResolvedValue(docs);
    getDocMock.mockResolvedValue(doc);
    readFileMock.mockResolvedValue('# Intro');
    extractTocFromContentMock.mockReturnValue([{id: 'intro', text: 'Intro', level: 1}]);

    const result = await getDocPageData('otto', 'getting-started');
    expect(result?.prevDoc).toBeNull();
    expect(result?.nextDoc).toBeNull();
  });
});
