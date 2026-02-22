import fs from 'fs';
import path from 'path';
import {slugify} from '../utils/slugify';
import type {
  Project,
  Doc,
  ProjectMetadata,
  DocMetadata,
  MDXDocument,
  TocEntry,
} from './content.types';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');
const INDEX_FILE_NAME = 'index.mdx';
const MDX_FILE_EXTENSION = '.mdx';

function isDirectory(entryPath: string) {
  return fs.statSync(entryPath).isDirectory();
}

function getMdxDocRelativePaths(projectDir: string, currentRelativeDir = ''): string[] {
  const currentDir = path.join(projectDir, currentRelativeDir);
  const entries = fs.readdirSync(currentDir, {withFileTypes: true});
  const docs: string[] = [];

  for (const entry of entries) {
    const entryRelativePath = path.join(currentRelativeDir, entry.name);

    if (entry.isDirectory()) {
      docs.push(...getMdxDocRelativePaths(projectDir, entryRelativePath));
      continue;
    }

    if (
      entry.isFile() &&
      entry.name.endsWith(MDX_FILE_EXTENSION) &&
      entry.name !== INDEX_FILE_NAME
    ) {
      docs.push(entryRelativePath.slice(0, -MDX_FILE_EXTENSION.length));
    }
  }

  return docs;
}

function sortDocsByOrderThenTitle(a: Doc, b: Doc): number {
  if (a.order !== undefined && b.order !== undefined) {
    return a.order - b.order;
  }

  if (a.order !== undefined) {
    return -1;
  }

  if (b.order !== undefined) {
    return 1;
  }

  return a.title.localeCompare(b.title);
}

export async function getProjects(): Promise<Project[]> {
  const projectDirs = fs.readdirSync(CONTENT_DIR);

  const projects = await Promise.all(
    projectDirs
      .filter(dir => {
        const dirPath = path.join(CONTENT_DIR, dir);
        return isDirectory(dirPath);
      })
      .map(async dir => {
        const projectDir = path.join(CONTENT_DIR, dir);
        const indexPath = path.join(projectDir, INDEX_FILE_NAME);
        if (!fs.existsSync(indexPath)) {
          throw new Error(`Project ${dir} missing ${INDEX_FILE_NAME}`);
        }

        const docsCount = getMdxDocRelativePaths(projectDir).length;

        const mdxModule: MDXDocument<ProjectMetadata> = await import(
          `@/content/${dir}/index.mdx`
        );

        return {
          id: dir,
          ...mdxModule.frontmatter,
          docsCount,
        };
      })
  );

  return projects.sort((a, b) => a.title.localeCompare(b.title));
}

export async function getProject(projectId: string): Promise<Project | null> {
  const projectDir = path.join(CONTENT_DIR, projectId);
  const indexPath = path.join(projectDir, INDEX_FILE_NAME);

  if (!fs.existsSync(projectDir) || !fs.existsSync(indexPath)) {
    return null;
  }

  const docsCount = getMdxDocRelativePaths(projectDir).length;

  const mdxModule: MDXDocument<ProjectMetadata> = await import(
    `@/content/${projectId}/index.mdx`
  );

  return {
    id: projectId,
    ...mdxModule.frontmatter,
    docsCount,
  };
}

export async function getProjectDocs(projectId: string): Promise<Doc[]> {
  const projectDir = path.join(CONTENT_DIR, projectId);
  if (!fs.existsSync(projectDir)) {
    return [];
  }

  const docFiles = getMdxDocRelativePaths(projectDir);

  const docs = await Promise.all(
    docFiles.map(async file => {
      const slug = file;

      const mdxModule: MDXDocument<DocMetadata> = await import(`@/content/${projectId}/${file}.mdx`);

      return {
        slug,
        path: slug.split('/'),
        ...mdxModule.frontmatter,
      };
    })
  );

  return docs.sort(sortDocsByOrderThenTitle);
}

export async function getDoc(
  projectId: string,
  slug: string[]
): Promise<Doc | null> {
  const slugStr = slug.join('/');
  const filePath = path.join(CONTENT_DIR, projectId, `${slugStr}${MDX_FILE_EXTENSION}`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const mdxModule: MDXDocument<DocMetadata> = await import(`@/content/${projectId}/${slugStr}.mdx`);

  return {
    slug: slugStr,
    path: slug,
    ...mdxModule.frontmatter,
  };
}

export function extractTocFromContent(content: string): TocEntry[] {
  const toc: TocEntry[] = [];
  const lines = content.split('\n');
  let activeFenceMarker: '```' | '~~~' | null = null;

  for (const line of lines) {
    const fenceMatch = line.trim().match(/^(```+|~~~+)/);
    if (fenceMatch) {
      const marker = fenceMatch[1].startsWith('`') ? '```' : '~~~';

      if (!activeFenceMarker) {
        activeFenceMarker = marker;
        continue;
      }

      if (activeFenceMarker === marker) {
        activeFenceMarker = null;
      }

      continue;
    }

    if (activeFenceMarker) {
      continue;
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (!headingMatch) {
      continue;
    }

    const level = headingMatch[1].length as 1 | 2 | 3;
    const text = headingMatch[2].trim();

    const cleanText = text
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
      .replace(/`([^`]+)`/g, '$1') // Remove code formatting
      .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
      .replace(/\*([^*]+)\*/g, '$1'); // Remove italic

    const id = slugify(cleanText);

    toc.push({id, text: cleanText, level});
  }

  return toc;
}

export function getProjectIds(): string[] {
  return fs
    .readdirSync(CONTENT_DIR)
    .filter(dir => isDirectory(path.join(CONTENT_DIR, dir)));
}

export function getProjectDocPaths(projectId: string): string[][] {
  const projectDir = path.join(CONTENT_DIR, projectId);
  if (!fs.existsSync(projectDir)) {
    return [];
  }

  return getMdxDocRelativePaths(projectDir).map(file => file.split('/'));
}
