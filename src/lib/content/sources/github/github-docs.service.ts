import path from 'path';
import {projectsConfig} from '@/config/projects.config';
import type {Doc, DocMetadata, Project, ProjectMetadata} from '../../content.types';
import {fetchJsonCached, fetchTextCached} from '@/lib/github/github-cache';
import {getGitHubApiHeaders, parseGitHubRepoUrl, toIsoDate} from '@/lib/github/github';
import {mdPathToSlug, parseMdBookSummary} from '../../rendering/mdbook';
import type {HttpsUrl} from '@/types/url';
import type {GitHubContentsFile, GitHubRelease, GitHubRepoInfo} from './github-docs.types';
import {extractFirstH1, extractFirstParagraph, stripFrontmatter} from './github-docs.utils';

export interface GitHubDocContent {
  markdown: string;

  rawBaseUrl: string;
}

interface MdBookSummaryResult {
  summaryText: string;

  srcDir: string;
}

export class GitHubDocsService {
  private readonly ttlMs: number;

  public constructor(opts?: {ttlMs?: number}) {
    this.ttlMs = opts?.ttlMs ?? Number(process.env.PAGES_DOCS_TTL_MS || 5 * 60_000);
  }

  /** Returns all project IDs derived from `projects.config.ts`. */
  public getProjectIdsFromConfig(): string[] {
    return projectsConfig.map((p) => this.getProjectIdFromRepoUrl(p.repository));
  }

  /** Fetches all projects from GitHub and returns normalized metadata for the UI. */
  public async getProjects(): Promise<Project[]> {
    const projects = await Promise.all(projectsConfig.map((cfg) => this.buildProject(cfg)));
    return projects.sort((a, b) => a.title.localeCompare(b.title));
  }

  /** Fetches a single project's metadata by projectId. */
  public async getProject(projectId: string): Promise<Project | null> {
    const cfg = this.getProjectConfig(projectId);
    if (!cfg) {
      return null;
    }

    const {owner, repo} = parseGitHubRepoUrl(cfg.repository);
    const repoInfo = await this.getRepoInfo(owner, repo);
    const latest = await this.getLatestRelease(owner, repo);

    const lastUpdated = this.getLastUpdated(repoInfo);
    const {summaryText} = await this.getMdBookSummary(owner, repo, cfg.documentation, repoInfo.default_branch);
    const docsCount = this.countDocs(summaryText);

    const links = this.buildProjectLinks({
      repoHtmlUrl: repoInfo.html_url,
      releaseUrl: cfg.release,
      latestReleaseUrl: latest?.html_url ?? null,
    });

    const projectMetadata: ProjectMetadata = {
      title: repoInfo.name || repo,
      description: repoInfo.description || `Documentation for ${repo}.`,
      lastUpdated,
      links,
      repository: repoInfo.html_url as HttpsUrl,
      recentRelease: this.buildRecentRelease(latest),
    };

    return {id: projectId, ...projectMetadata, docsCount};
  }

  /** Returns the list of docs for a project (from mdBook SUMMARY ordering). */
  public async getProjectDocs(projectId: string): Promise<Doc[]> {
    const cfg = this.getProjectConfig(projectId);
    if (!cfg) {
      return [];
    }

    const {owner, repo} = parseGitHubRepoUrl(cfg.repository);
    const repoInfo = await this.getRepoInfo(owner, repo);

    const lastUpdated = this.getLastUpdated(repoInfo);
    const {summaryText} = await this.getMdBookSummary(owner, repo, cfg.documentation, repoInfo.default_branch);
    const entries = parseMdBookSummary(summaryText);

    let order = 0;
    const docs: Doc[] = [];
    for (const entry of entries) {
      if (entry.mdPath.toLowerCase() === 'readme.md') {
        continue;
      }

      order += 1;
      const slug = mdPathToSlug(entry.mdPath);

      const docMetadata: DocMetadata = {
        title: entry.title,
        description: undefined,
        project: projectId,
        order,
        lastUpdated,
      };

      docs.push({
        slug,
        path: slug.split('/'),
        ...docMetadata,
      });
    }

    return docs;
  }

  /** Fetches a specific doc's markdown from GitHub (as specified in mdBook SUMMARY). */
  public async getDoc(
    projectId: string,
    slug: string[]
  ): Promise<{doc: Doc; content: GitHubDocContent} | null> {
    const cfg = this.getProjectConfig(projectId);
    if (!cfg) {
      return null;
    }

    const {owner, repo} = parseGitHubRepoUrl(cfg.repository);
    const repoInfo = await this.getRepoInfo(owner, repo);

    const {summaryText, srcDir} = await this.getMdBookSummary(owner, repo, cfg.documentation, repoInfo.default_branch);
    const entries = parseMdBookSummary(summaryText);

    const slugStr = slug.join('/');
    const entry = entries.find((e) => mdPathToSlug(e.mdPath) === slugStr);
    if (!entry) {
      return null;
    }

    const lastUpdated = this.getLastUpdated(repoInfo);

    const filePath = path.posix.join(srcDir, entry.mdPath);
    const file = await this.getContentsFile(owner, repo, filePath, repoInfo.default_branch);
    if (!file.download_url) {
      return null;
    }

    const rawBaseUrl = this.buildRawBaseUrl(owner, repo, repoInfo.default_branch, srcDir);
    const markdown = stripFrontmatter(await this.githubRawGetText(file.download_url));

    const docMetadata: DocMetadata = {
      title: entry.title,
      description: extractFirstParagraph(markdown) ?? undefined,
      project: projectId,
      order: undefined,
      lastUpdated,
    };

    const doc: Doc = {
      slug: slugStr,
      path: slug,
      ...docMetadata,
    };

    return {doc, content: {markdown, rawBaseUrl}};
  }

  /** Fetches `README.md` from the mdBook source folder for a project, when present. */
  public async getProjectReadme(projectId: string): Promise<GitHubDocContent | null> {
    const cfg = this.getProjectConfig(projectId);
    if (!cfg) {
      return null;
    }

    const {owner, repo} = parseGitHubRepoUrl(cfg.repository);
    const repoInfo = await this.getRepoInfo(owner, repo);
    const {srcDir} = await this.getMdBookSummary(owner, repo, cfg.documentation, repoInfo.default_branch);

    const readmePath = path.posix.join(srcDir, 'README.md');

    try {
      const file = await this.getContentsFile(owner, repo, readmePath, repoInfo.default_branch);
      if (!file.download_url) {
        return null;
      }

      const rawBaseUrl = this.buildRawBaseUrl(owner, repo, repoInfo.default_branch, srcDir);
      const markdown = stripFrontmatter(await this.githubRawGetText(file.download_url));
      return {markdown, rawBaseUrl};
    } catch {
      return null;
    }
  }

  private getProjectConfig(projectId: string) {
    const match = projectsConfig.find((p) => this.getProjectIdFromRepoUrl(p.repository) === projectId);
    return match ?? null;
  }

  private getProjectIdFromRepoUrl(repoUrl: string): string {
    const {repo} = parseGitHubRepoUrl(repoUrl);
    return repo;
  }

  private getLastUpdated(repoInfo: GitHubRepoInfo): string {
    return (
      toIsoDate(repoInfo.pushed_at || repoInfo.updated_at) ||
      toIsoDate(new Date()) ||
      '1970-01-01'
    );
  }

  private countDocs(summaryText: string): number {
    return parseMdBookSummary(summaryText).filter((e) => e.mdPath.toLowerCase() !== 'readme.md').length;
  }

  private buildRecentRelease(latest: GitHubRelease | null | undefined): ProjectMetadata['recentRelease'] {
    if (!latest?.tag_name) {
      return undefined;
    }

    return {
      tag: latest.tag_name,
      publishedAt: toIsoDate(latest.published_at) ?? undefined,
      url: (latest.html_url || undefined) as HttpsUrl | undefined,
    };
  }

  private buildProjectLinks(input: {
    repoHtmlUrl: string;
    releaseUrl?: string;
    latestReleaseUrl?: string | null;
  }): ProjectMetadata['links'] {
    const links: ProjectMetadata['links'] = [
      {key: 'Repository', value: input.repoHtmlUrl as HttpsUrl, external: true},
    ];

    if (input.releaseUrl) {
      links.push({key: 'Release', value: input.releaseUrl as HttpsUrl, external: true});
    }

    if (input.latestReleaseUrl) {
      links.push({key: 'Latest Tag', value: input.latestReleaseUrl as HttpsUrl, external: true});
    }

    return links;
  }

  private async githubApiGetJson<T>(url: string): Promise<T> {
    const {json} = await fetchJsonCached<T>(url, {ttlMs: this.ttlMs, headers: getGitHubApiHeaders()});
    return json;
  }

  private async githubRawGetText(url: string): Promise<string> {
    const {text} = await fetchTextCached(url, {ttlMs: this.ttlMs, headers: getGitHubApiHeaders()});
    return text;
  }

  private async getRepoInfo(owner: string, repo: string): Promise<GitHubRepoInfo> {
    return this.githubApiGetJson<GitHubRepoInfo>(`https://api.github.com/repos/${owner}/${repo}`);
  }

  private async getLatestRelease(owner: string, repo: string): Promise<GitHubRelease | null> {
    try {
      return await this.githubApiGetJson<GitHubRelease>(
        `https://api.github.com/repos/${owner}/${repo}/releases/latest`
      );
    } catch (err) {
      const message = String((err as Error)?.message || err);
      if (message.includes('HTTP 404')) {
        return null;
      }

      return null;
    }
  }

  private async getContentsFile(
    owner: string,
    repo: string,
    contentPath: string,
    ref?: string
  ): Promise<GitHubContentsFile> {
    const encodedPath = encodeURIComponent(contentPath).replace(/%2F/g, '/');
    const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}${ref ? `?ref=${encodeURIComponent(ref)}` : ''}`;

    const data = await this.githubApiGetJson<GitHubContentsFile>(url);
    if (!data || (data as {type?: string}).type !== 'file') {
      throw new Error(`Expected file content for ${owner}/${repo}:${contentPath}`);
    }

    return data;
  }

  private buildRawBaseUrl(owner: string, repo: string, ref: string, srcDir: string): string {
    return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${srcDir.replace(/^\/+|\/+$/g, '')}/`;
  }

  private computeProjectTitle(repoInfo: GitHubRepoInfo, repo: string, readmeText: string | null): string {
    return (readmeText ? extractFirstH1(readmeText) : null) || repoInfo.name || repo;
  }

  private computeProjectDescription(repoInfo: GitHubRepoInfo, repo: string, readmeText: string | null): string {
    const readmeBody = readmeText ? stripFrontmatter(readmeText) : null;

    return (
      repoInfo.description ||
      (readmeBody ? extractFirstParagraph(readmeBody) : null) ||
      `Documentation for ${repo}.`
    );
  }

  private async buildProject(cfg: (typeof projectsConfig)[number]): Promise<Project> {
    const {owner, repo} = parseGitHubRepoUrl(cfg.repository);
    const repoInfo = await this.getRepoInfo(owner, repo);
    const latest = await this.getLatestRelease(owner, repo);
    const lastUpdated = this.getLastUpdated(repoInfo);

    const {summaryText} = await this.getMdBookSummary(owner, repo, cfg.documentation, repoInfo.default_branch);
    const docsCount = this.countDocs(summaryText);

    const links = this.buildProjectLinks({
      repoHtmlUrl: repoInfo.html_url,
      releaseUrl: cfg.release,
      latestReleaseUrl: latest?.html_url ?? null,
    });

    const readmeText = (await this.getProjectReadme(repo))?.markdown ?? null;
    const title = this.computeProjectTitle(repoInfo, repo, readmeText);
    const description = this.computeProjectDescription(repoInfo, repo, readmeText);

    const projectMetadata: ProjectMetadata = {
      title,
      description,
      lastUpdated,
      links,
      repository: repoInfo.html_url as HttpsUrl,
      recentRelease: this.buildRecentRelease(latest),
    };

    return {
      id: repo,
      ...projectMetadata,
      docsCount,
    };
  }

  private async getMdBookSummary(
    owner: string,
    repo: string,
    docsRoot: string,
    ref: string
  ): Promise<MdBookSummaryResult> {
    const root = docsRoot.replace(/^\/+|\/+$/g, '');
    const tryPaths = [`${root}/src/SUMMARY.md`, `${root}/SUMMARY.md`];

    for (const summaryPath of tryPaths) {
      try {
        const file = await this.getContentsFile(owner, repo, summaryPath, ref);
        if (!file.download_url) {
          continue;
        }

        const summaryText = await this.githubRawGetText(file.download_url);
        const srcDir = summaryPath.endsWith('/src/SUMMARY.md') ? `${root}/src` : root;
        return {summaryText, srcDir};
      } catch {
        // keep trying
      }
    }

    throw new Error(`Could not locate mdBook SUMMARY.md in ${owner}/${repo} at ${docsRoot}`);
  }
}
