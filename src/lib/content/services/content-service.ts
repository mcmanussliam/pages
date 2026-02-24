import path from 'path';
import {readFile} from 'fs/promises';
import {cache, type ComponentType} from 'react';
import {contentRepository, extractTocFromContent} from '../content';
import type {Doc, Project, TocEntry} from '../content.types';
import {githubContentSource} from '../sources/github/github-content';
import {renderMarkdownToHtml} from '../rendering/markdown-render';
import {getDocumentationSource} from '../sources/docs-source';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');

interface ProjectPageData {
  project: Project;

  docs: Doc[];

  // Legacy MDX fallback path if HTML rendering is not used.
  ProjectContent?: ComponentType;

  // Server-rendered HTML from markdown for the project landing page.
  projectHtml?: string;
}

interface DocNavigation {
  prevDoc: Doc | null;

  nextDoc: Doc | null;
}

interface DocPageData {
  project: Project | null;

  docs: Doc[];

  doc: Doc;

  // Legacy MDX fallback path if HTML rendering is not used.
  Content?: ComponentType;

  // Server-rendered HTML from markdown for docs content.
  html?: string;

  toc: TocEntry[];

  prevDoc: Doc | null;

  nextDoc: Doc | null;
}

function stripFrontmatter(markdown: string): string {
  const trimmed = markdown.startsWith('\uFEFF') ? markdown.slice(1) : markdown;
  if (!trimmed.startsWith('---\n')) {
    return markdown;
  }

  const end = trimmed.indexOf('\n---\n', 4);
  if (end === -1) {
    return markdown;
  }

  return trimmed.slice(end + '\n---\n'.length);
}

export const getProjectPageData = cache(async(projectId: string): Promise<ProjectPageData | null> => {
  const [project, docs] = await Promise.all([
    contentRepository.getProject(projectId),
    contentRepository.getProjectDocs(projectId),
  ]);

  if (!project) {
    return null;
  }

  if (getDocumentationSource() === 'github') {
    const readme = await githubContentSource.getProjectReadme(projectId);
    const markdown = readme?.markdown ?? `# ${project.title}\n\n${project.description}\n`;
    const rawBaseUrl = readme?.rawBaseUrl ?? '';
    const projectHtml = await renderMarkdownToHtml({
      markdown,
      projectId,
      currentSlug: 'README',
      rawBaseUrl,
    });
    return {project, docs, projectHtml};
  }

  if (process.env.NODE_ENV === 'test') {
    return {project, docs, ProjectContent: () => null};
  }

  const indexPath = path.join(CONTENT_DIR, projectId, 'index.mdx');
  const markdownWithFrontmatter = await readFile(indexPath, 'utf-8');
  const markdown = stripFrontmatter(markdownWithFrontmatter);
  const projectHtml = await renderMarkdownToHtml({
    markdown,
    projectId,
    currentSlug: 'README',
    rawBaseUrl: '',
  });

  return {project, docs, projectHtml};
});

function getDocNavigation(docs: Doc[], currentSlug: string): DocNavigation {
  const currentIndex = docs.findIndex(doc => doc.slug === currentSlug);
  if (currentIndex < 0) {
    return {prevDoc: null, nextDoc: null};
  }

  return {
    prevDoc: currentIndex > 0 ? docs[currentIndex - 1] : null,
    nextDoc: currentIndex < docs.length - 1 ? docs[currentIndex + 1] : null,
  };
}

async function loadDocContent(
  projectId: string,
  slug: string
): Promise<{Content: ComponentType; html?: string; toc: TocEntry[]}> {
  const filePath = path.join(CONTENT_DIR, projectId, `${slug}.mdx`);
  const fileContentPromise = readFile(filePath, 'utf-8');
  const fileContent = await fileContentPromise;

  if (process.env.NODE_ENV === 'test') {
    return {
      Content: () => null,
      toc: extractTocFromContent(fileContent),
    };
  }

  const markdown = stripFrontmatter(fileContent);
  const html = await renderMarkdownToHtml({
    markdown,
    projectId,
    currentSlug: slug,
    rawBaseUrl: '',
  });

  return {
    Content: () => null,
    toc: extractTocFromContent(markdown),
    html,
  };
}

export const getDocPageData = cache(async(projectId: string, docSlug: string): Promise<DocPageData | null> => {
  const slugSegments = docSlug.split('/');
  const [project, docs] = await Promise.all([
    contentRepository.getProject(projectId),
    contentRepository.getProjectDocs(projectId),
  ]);

  if (getDocumentationSource() === 'github') {
    const result = await githubContentSource.getDoc(projectId, slugSegments);
    if (!result) {
      return null;
    }

    const {doc, content} = result;
    const html = await renderMarkdownToHtml({
      markdown: content.markdown,
      projectId,
      currentSlug: doc.slug,
      rawBaseUrl: content.rawBaseUrl,
    });
    const toc = extractTocFromContent(content.markdown);
    const {prevDoc, nextDoc} = getDocNavigation(docs, doc.slug);

    return {
      project,
      docs,
      doc,
      html,
      toc,
      prevDoc,
      nextDoc,
    };
  }

  const doc = await contentRepository.getDoc(projectId, slugSegments);

  if (!doc) {
    return null;
  }

  const {Content, html, toc} = await loadDocContent(projectId, doc.slug);
  const {prevDoc, nextDoc} = getDocNavigation(docs, doc.slug);

  return {
    project,
    docs,
    doc,
    Content,
    html,
    toc,
    prevDoc,
    nextDoc,
  };
});
