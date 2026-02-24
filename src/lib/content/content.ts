import path from 'path';
import type {Doc, Project, TocEntry} from './content.types';
import {extractTocFromContent} from './rendering/toc';
import {getDocumentationSource} from './sources/docs-source';
import {githubContentSource} from './sources/github/github-content';
import {LocalMdxContentSource} from './sources/local/local-content';

class ContentRepository {
  private readonly localSource: LocalMdxContentSource;

  public constructor(localSource: LocalMdxContentSource) {
    this.localSource = localSource;
  }

  public async getProjects(): Promise<Project[]> {
    if (getDocumentationSource() === 'github') {
      return githubContentSource.getProjects();
    }

    return this.localSource.getProjects();
  }

  public async getProject(projectId: string): Promise<Project | null> {
    if (getDocumentationSource() === 'github') {
      return githubContentSource.getProject(projectId);
    }

    return this.localSource.getProject(projectId);
  }

  public async getProjectDocs(projectId: string): Promise<Doc[]> {
    if (getDocumentationSource() === 'github') {
      return githubContentSource.getProjectDocs(projectId);
    }

    return this.localSource.getProjectDocs(projectId);
  }

  public async getDoc(projectId: string, slug: string[]): Promise<Doc | null> {
    if (getDocumentationSource() === 'github') {
      const result = await githubContentSource.getDoc(projectId, slug);
      return result?.doc ?? null;
    }

    return this.localSource.getDoc(projectId, slug);
  }

  public getProjectIds(): string[] {
    if (getDocumentationSource() === 'github') {
      return githubContentSource.getProjectIdsFromConfig();
    }

    return this.localSource.getProjectIds();
  }

  public getProjectDocPaths(projectId: string): string[][] {
    if (getDocumentationSource() === 'github') {
      return [];
    }

    return this.localSource.getProjectDocPaths(projectId);
  }
}

const CONTENT_DIR = path.join(process.cwd(), 'src/content');
const localSource = new LocalMdxContentSource({contentDir: CONTENT_DIR});

export const contentRepository = new ContentRepository(localSource);

export {extractTocFromContent};

export type {TocEntry};
