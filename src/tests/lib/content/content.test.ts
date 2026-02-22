import fs from 'fs';
import path from 'path';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {
  extractTocFromContent,
  getDoc,
  getProject,
  getProjectDocPaths,
  getProjectDocs,
  getProjectIds,
  getProjects,
} from '@/lib/content/content';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');
const CREATED_DIRS: string[] = [];

vi.mock('@/content/otto/index.mdx', () => ({
  frontmatter: {
    title: 'Otto Task Runner',
    description: 'Task runner with history, retries, and notifications.',
    lastUpdated: '2026-02-22',
  },
}), {virtual: true});

vi.mock('@/content/otto/getting-started.mdx', () => ({
  frontmatter: {
    title: 'Getting Started',
    project: 'otto',
    order: 1,
    lastUpdated: '2026-02-22',
  },
}), {virtual: true});

vi.mock('@/content/otto/task-modes.mdx', () => ({
  frontmatter: {
    title: 'Task Modes',
    project: 'otto',
    order: 2,
    lastUpdated: '2026-02-22',
  },
}), {virtual: true});

vi.mock('@/content/otto/config-reference.mdx', () => ({
  frontmatter: {
    title: 'Config Reference',
    project: 'otto',
    order: 3,
    lastUpdated: '2026-02-22',
  },
}), {virtual: true});

vi.mock('@/content/otto/command-reference.mdx', () => ({
  frontmatter: {
    title: 'Command Reference',
    project: 'otto',
    order: 5,
    lastUpdated: '2026-02-22',
  },
}), {virtual: true});

vi.mock('@/content/brb/index.mdx', () => ({
  frontmatter: {
    title: 'BRB',
    description: 'BRB docs',
    lastUpdated: '2026-02-22',
  },
}), {virtual: true});

vi.mock('@/content/brb/getting-started.mdx', () => ({
  frontmatter: {
    title: 'Getting Started',
    project: 'brb',
    order: 1,
    lastUpdated: '2026-02-22',
  },
}), {virtual: true});

vi.mock('@/content/brb/config.mdx', () => ({
  frontmatter: {
    title: 'Config',
    project: 'brb',
    order: 2,
    lastUpdated: '2026-02-22',
  },
}), {virtual: true});

vi.mock('@/content/nd/index.mdx', () => ({
  frontmatter: {
    title: 'ND',
    description: 'ND docs',
    lastUpdated: '2026-02-22',
  },
}), {virtual: true});

vi.mock('@/content/nd/getting-started.mdx', () => ({
  frontmatter: {
    title: 'Getting Started',
    project: 'nd',
    order: 1,
    lastUpdated: '2026-02-22',
  },
}), {virtual: true});

vi.mock('@/content/obsidian-actions/index.mdx', () => ({
  frontmatter: {
    title: 'Obsidian Actions',
    description: 'Obsidian actions docs',
    lastUpdated: '2026-02-22',
  },
}), {virtual: true});

vi.mock('@/content/obsidian-actions/getting-started.mdx', () => ({
  frontmatter: {
    title: 'Getting Started',
    project: 'obsidian-actions',
    order: 1,
    lastUpdated: '2026-02-22',
  },
}), {virtual: true});

vi.mock('@/content/obsidian-actions/command-types.mdx', () => ({
  frontmatter: {
    title: 'Command Types',
    project: 'obsidian-actions',
    order: 2,
    lastUpdated: '2026-02-22',
  },
}), {virtual: true});

vi.mock('@/content/obsidian-actions/hooks.mdx', () => ({
  frontmatter: {
    title: 'Hooks',
    project: 'obsidian-actions',
    order: 3,
    lastUpdated: '2026-02-22',
  },
}), {virtual: true});

vi.mock('@/content/obsidian-actions/examples.mdx', () => ({
  frontmatter: {
    title: 'Examples',
    project: 'obsidian-actions',
    order: 4,
    lastUpdated: '2026-02-22',
  },
}), {virtual: true});

vi.mock('@/content/obsidian-actions/env-variables.mdx', () => ({
  frontmatter: {
    title: 'Env Variables',
    project: 'obsidian-actions',
    order: 5,
    lastUpdated: '2026-02-22',
  },
}), {virtual: true});

function createProjectFixture(structure: Record<string, string>): string {
  const projectId = `test-project-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const projectDir = path.join(CONTENT_DIR, projectId);
  fs.mkdirSync(projectDir, {recursive: true});

  for (const [relativePath, fileContent] of Object.entries(structure)) {
    const filePath = path.join(projectDir, relativePath);
    fs.mkdirSync(path.dirname(filePath), {recursive: true});
    fs.writeFileSync(filePath, fileContent, 'utf8');
  }

  CREATED_DIRS.push(projectDir);
  return projectId;
}

afterEach(() => {
  vi.restoreAllMocks();

  for (const projectDir of CREATED_DIRS.splice(0)) {
    fs.rmSync(projectDir, {recursive: true, force: true});
  }
});

describe('getProjectDocPaths', () => {
  it('returns nested doc paths and excludes index.mdx', () => {
    const projectId = createProjectFixture({
      'index.mdx': '# Project Home',
      'getting-started.mdx': '# Getting Started',
      'guides/install.mdx': '# Install',
      'guides/index.mdx': '# Guides Home',
    });

    expect(getProjectDocPaths(projectId)).toEqual(
      expect.arrayContaining([
        ['getting-started'],
        ['guides', 'install'],
      ])
    );
    expect(getProjectDocPaths(projectId)).not.toEqual(
      expect.arrayContaining([
        ['index'],
        ['guides', 'index'],
      ])
    );
  });
});

describe('extractTocFromContent', () => {
  it('extracts headings and strips markdown formatting', () => {
    const content = `
# Welcome
## [Install](#install) \`quickly\`
### **Bold** *Text*
#### Ignored Heading
`;

    expect(extractTocFromContent(content)).toEqual([
      {id: 'welcome', text: 'Welcome', level: 1},
      {id: 'install-quickly', text: 'Install quickly', level: 2},
      {id: 'bold-text', text: 'Bold Text', level: 3},
    ]);
  });

  it('ignores heading-like lines inside fenced code blocks', () => {
    const content = `
# Real Heading
\`\`\`ts
# not-a-heading
## also-not-a-heading
\`\`\`
## Another Heading
~~~python
### not-a-heading-either
~~~
`;

    expect(extractTocFromContent(content)).toEqual([
      {id: 'real-heading', text: 'Real Heading', level: 1},
      {id: 'another-heading', text: 'Another Heading', level: 2},
    ]);
  });
});

describe('project discovery helpers', () => {
  it('loads projects and project docs metadata', async() => {
    const originalReaddirSync = fs.readdirSync.bind(fs);
    vi.spyOn(fs, 'readdirSync').mockImplementation(((target: fs.PathLike, options?: unknown) => {
      if (String(target) === CONTENT_DIR && options === undefined) {
        return ['otto'] as unknown as ReturnType<typeof fs.readdirSync>;
      }

      return originalReaddirSync(target, options as never);
    }) as typeof fs.readdirSync);

    const projects = await getProjects();
    expect(projects).toHaveLength(1);
    expect(projects[0]?.id).toBe('otto');
    expect(projects[0]?.docsCount).toBe(4);

    const project = await getProject('otto');
    expect(project?.id).toBe('otto');
    expect(project?.docsCount).toBe(4);
    expect(project?.title).toBe('Otto Task Runner');

    const docs = await getProjectDocs('otto');
    expect(docs.map(doc => doc.slug)).toEqual([
      'getting-started',
      'task-modes',
      'config-reference',
      'command-reference',
    ]);
    expect(docs[0]?.path).toEqual(['getting-started']);

    const doc = await getDoc('otto', ['getting-started']);
    expect(doc).toEqual({
      slug: 'getting-started',
      path: ['getting-started'],
      title: 'Getting Started',
      project: 'otto',
      order: 1,
      lastUpdated: '2026-02-22',
    });
  });

  it('loads all known project and doc module variants', async() => {
    const projectIds = ['brb', 'nd', 'obsidian-actions', 'otto'];
    const originalReaddirSync = fs.readdirSync.bind(fs);
    vi.spyOn(fs, 'readdirSync').mockImplementation(((target: fs.PathLike, options?: unknown) => {
      if (String(target) === CONTENT_DIR && options === undefined) {
        return projectIds as unknown as ReturnType<typeof fs.readdirSync>;
      }

      return originalReaddirSync(target, options as never);
    }) as typeof fs.readdirSync);

    const projects = await getProjects();
    expect(projects.map(project => project.id)).toEqual(projectIds);

    for (const projectId of projectIds) {
      const project = await getProject(projectId);
      expect(project?.id).toBe(projectId);

      const docs = await getProjectDocs(projectId);
      expect(docs.length).toBeGreaterThan(0);

      for (const doc of docs) {
        const loadedDoc = await getDoc(projectId, doc.path);
        expect(loadedDoc?.slug).toBe(doc.slug);
      }
    }
  });

  it('throws when a discovered project is missing index.mdx', async() => {
    const brokenProjectId = createProjectFixture({'getting-started.mdx': '# Missing Index',});
    const originalReaddirSync = fs.readdirSync.bind(fs);
    vi.spyOn(fs, 'readdirSync').mockImplementation(((target: fs.PathLike, options?: unknown) => {
      if (String(target) === CONTENT_DIR && options === undefined) {
        return [brokenProjectId] as unknown as ReturnType<typeof fs.readdirSync>;
      }

      return originalReaddirSync(target, options as never);
    }) as typeof fs.readdirSync);

    await expect(getProjects()).rejects.toThrow(`Project ${brokenProjectId} missing index.mdx`);
  });

  it('returns safe fallbacks for missing project and doc paths', async() => {
    await expect(getProject('missing-project')).resolves.toBeNull();
    await expect(getProjectDocs('missing-project')).resolves.toEqual([]);
    await expect(getDoc('missing-project', ['unknown-doc'])).resolves.toBeNull();
  });

  it('returns project IDs for directories only', () => {
    const ids = getProjectIds();

    expect(ids).toEqual(expect.arrayContaining(['brb', 'nd', 'obsidian-actions', 'otto']));
  });

  it('returns no doc paths for missing projects', () => {
    expect(getProjectDocPaths('missing-project')).toEqual([]);
  });
});
