import path from 'path';
import {readFile} from 'fs/promises';
import {cache, type ComponentType} from 'react';
import {extractTocFromContent, getDoc, getProject, getProjectDocs} from './content';
import type {Doc, Project, TocEntry} from './content.types';

const CONTENT_DIR = path.join(process.cwd(), 'src/content');

interface ProjectPageData {
  project: Project;
  docs: Doc[];
  ProjectContent: ComponentType;
}

interface DocNavigation {
  prevDoc: Doc | null;
  nextDoc: Doc | null;
}

interface DocPageData {
  project: Project | null;
  docs: Doc[];
  doc: Doc;
  Content: ComponentType;
  toc: TocEntry[];
  prevDoc: Doc | null;
  nextDoc: Doc | null;
}

export const getProjectPageData = cache(async(projectId: string): Promise<ProjectPageData | null> => {
  const [project, docs] = await Promise.all([
    getProject(projectId),
    getProjectDocs(projectId),
  ]);

  if (!project) {
    return null;
  }

  const ProjectContent = (await import(`@/content/${projectId}/index.mdx`)).default;
  return {project, docs, ProjectContent};
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

async function loadDocContent(projectId: string, slug: string): Promise<{Content: ComponentType; toc: TocEntry[]}> {
  const docModulePromise = import(`@/content/${projectId}/${slug}.mdx`);
  const filePath = path.join(CONTENT_DIR, projectId, `${slug}.mdx`);
  const fileContentPromise = readFile(filePath, 'utf-8');
  const [docModule, fileContent] = await Promise.all([docModulePromise, fileContentPromise]);

  return {
    Content: docModule.default,
    toc: extractTocFromContent(fileContent),
  };
}

export const getDocPageData = cache(async(projectId: string, docSlug: string): Promise<DocPageData | null> => {
  const slugSegments = docSlug.split('/');
  const [project, docs, doc] = await Promise.all([
    getProject(projectId),
    getProjectDocs(projectId),
    getDoc(projectId, slugSegments),
  ]);

  if (!doc) {
    return null;
  }

  const {Content, toc} = await loadDocContent(projectId, doc.slug);
  const {prevDoc, nextDoc} = getDocNavigation(docs, doc.slug);

  return {
    project,
    docs,
    doc,
    Content,
    toc,
    prevDoc,
    nextDoc,
  };
});
