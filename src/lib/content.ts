import fs from 'fs';
import path from 'path';
import {slugify} from './slugify';
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

function getProjectDocFiles(projectDir: string): string[] {
  return fs
    .readdirSync(projectDir)
    .filter(file => file.endsWith(MDX_FILE_EXTENSION) && file !== INDEX_FILE_NAME);
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

        const docsCount = getProjectDocFiles(projectDir).length;

        const mdxModule: MDXDocument<ProjectMetadata> = await import(
          `@/content/${dir}/${INDEX_FILE_NAME}`
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

  const docsCount = getProjectDocFiles(projectDir).length;

  const mdxModule: MDXDocument<ProjectMetadata> = await import(
    `@/content/${projectId}/${INDEX_FILE_NAME}`
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

  const docFiles = getProjectDocFiles(projectDir);

  const docs = await Promise.all(
    docFiles.map(async file => {
      const slug = file.replace(MDX_FILE_EXTENSION, '');

      const mdxModule: MDXDocument<DocMetadata> = await import(`@/content/${projectId}/${file}`);

      return {
        slug,
        path: [slug],
        ...mdxModule.frontmatter,
      };
    })
  );

  return docs.sort((a, b) => {
    // If both have order, sort by order
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }

    // If only a has order, it comes first
    if (a.order !== undefined) {
      return -1;
    }

    // If only b has order, it comes first
    if (b.order !== undefined) {
      return 1;
    }

    // Otherwise, sort alphabetically by title
    return a.title.localeCompare(b.title);
  });
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
  const headingRegex = /^(#{1,3})\s+(.+)$/gm;
  const toc: TocEntry[] = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length as 1 | 2 | 3;
    const text = match[2].trim();

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
    .filter((dir) => isDirectory(path.join(CONTENT_DIR, dir)));
}

export function getProjectDocPaths(projectId: string): string[][] {
  const projectDir = path.join(CONTENT_DIR, projectId);
  if (!fs.existsSync(projectDir)) {
    return [];
  }

  return getProjectDocFiles(projectDir).map(file => [file.replace(MDX_FILE_EXTENSION, '')]);
}
