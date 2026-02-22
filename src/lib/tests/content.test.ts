import fs from 'fs';
import path from 'path';
import {afterEach, describe, expect, it} from 'vitest';
import {extractTocFromContent, getProjectDocPaths} from '../content';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');
const CREATED_DIRS: string[] = [];

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
