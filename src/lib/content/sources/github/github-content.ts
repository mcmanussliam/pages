import {GitHubDocsService, type GitHubDocContent} from './github-docs.service';
import type {Doc, Project} from '../../content.types';

class GitHubContentSource {
  private readonly docsService: GitHubDocsService;

  public constructor(docsService: GitHubDocsService) {
    this.docsService = docsService;
  }

  public async getProjects(): Promise<Project[]> {
    return this.docsService.getProjects();
  }

  public async getProject(projectId: string): Promise<Project | null> {
    return this.docsService.getProject(projectId);
  }

  public async getProjectDocs(projectId: string): Promise<Doc[]> {
    return this.docsService.getProjectDocs(projectId);
  }

  public async getDoc(projectId: string, slug: string[]): Promise<{doc: Doc; content: GitHubDocContent} | null> {
    return this.docsService.getDoc(projectId, slug);
  }

  public async getProjectReadme(projectId: string): Promise<GitHubDocContent | null> {
    return this.docsService.getProjectReadme(projectId);
  }

  public getProjectIdsFromConfig(): string[] {
    return this.docsService.getProjectIdsFromConfig();
  }
}

const docsService = new GitHubDocsService();

export const githubContentSource = new GitHubContentSource(docsService);

export type {GitHubDocContent};
