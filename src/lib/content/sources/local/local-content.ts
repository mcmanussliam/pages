import fs from 'fs';
import path from 'path';
import type {Doc, DocMetadata, Project, ProjectMetadata} from '../../content.types';
import {readFrontmatterFromFile} from '../../rendering/frontmatter';

interface LocalMdxContentSourceOptions {
  contentDir: string;
}

export class LocalMdxContentSource {
  private readonly contentDir: string;

  private readonly indexFileName = 'index.mdx';

  private readonly mdxExtension = '.mdx';

  public constructor(opts: LocalMdxContentSourceOptions) {
    this.contentDir = opts.contentDir;
  }

  public getProjects(): Project[] {
    const projectDirs = fs.existsSync(this.contentDir) ? fs.readdirSync(this.contentDir) : [];

    const projects = projectDirs
      .filter((dir) => this.isProjectDirectory(dir))
      .map((dir) => this.readProject(dir));

    return projects.sort((a, b) => a.title.localeCompare(b.title));
  }

  public getProject(projectId: string): Project | null {
    const projectDir = this.projectDir(projectId);
    const indexPath = path.join(projectDir, this.indexFileName);

    if (!fs.existsSync(projectDir) || !fs.existsSync(indexPath)) {
      return null;
    }

    const docsCount = this.getMdxDocRelativePaths(projectDir).length;
    const metadata = readFrontmatterFromFile<ProjectMetadata>(indexPath);

    return {
      id: projectId,
      ...metadata,
      docsCount,
    };
  }

  public getProjectDocs(projectId: string): Doc[] {
    const projectDir = this.projectDir(projectId);
    if (!fs.existsSync(projectDir)) {
      return [];
    }

    const docFiles = this.getMdxDocRelativePaths(projectDir);

    const docs = docFiles.map((file) => {
      const slug = file;
      const metadata = readFrontmatterFromFile<DocMetadata>(path.join(projectDir, `${file}${this.mdxExtension}`));

      return {
        slug,
        path: slug.split('/'),
        ...metadata,
      };
    });

    return docs.sort(LocalMdxContentSource.sortDocsByOrderThenTitle);
  }

  public getDoc(projectId: string, slug: string[]): Doc | null {
    const slugStr = slug.join('/');
    const filePath = path.join(this.contentDir, projectId, `${slugStr}${this.mdxExtension}`);

    if (!fs.existsSync(filePath)) {
      return null;
    }

    const metadata = readFrontmatterFromFile<DocMetadata>(filePath);
    return {slug: slugStr, path: slug, ...metadata};
  }

  public getProjectIds(): string[] {
    if (!fs.existsSync(this.contentDir)) {
      return [];
    }

    return fs.readdirSync(this.contentDir).filter((dir) => this.isProjectDirectory(dir));
  }

  public getProjectDocPaths(projectId: string): string[][] {
    const projectDir = this.projectDir(projectId);
    if (!fs.existsSync(projectDir)) {
      return [];
    }

    return this.getMdxDocRelativePaths(projectDir).map((file) => file.split('/'));
  }

  private isProjectDirectory(entryName: string): boolean {
    const entryPath = path.join(this.contentDir, entryName);
    try {
      return fs.statSync(entryPath).isDirectory();
    } catch {
      return false;
    }
  }

  private readProject(projectId: string): Project {
    const projectDir = this.projectDir(projectId);
    const indexPath = path.join(projectDir, this.indexFileName);
    if (!fs.existsSync(indexPath)) {
      throw new Error(`Project ${projectId} missing ${this.indexFileName}`);
    }

    const docsCount = this.getMdxDocRelativePaths(projectDir).length;
    const metadata = readFrontmatterFromFile<ProjectMetadata>(indexPath);

    return {
      id: projectId,
      ...metadata,
      docsCount,
    };
  }

  private projectDir(projectId: string): string {
    return path.join(this.contentDir, projectId);
  }

  private getMdxDocRelativePaths(projectDir: string, currentRelativeDir = ''): string[] {
    const currentDir = path.join(projectDir, currentRelativeDir);
    const entries = fs.readdirSync(currentDir, {withFileTypes: true});
    const docs: string[] = [];

    for (const entry of entries) {
      const entryRelativePath = path.join(currentRelativeDir, entry.name);

      if (entry.isDirectory()) {
        docs.push(...this.getMdxDocRelativePaths(projectDir, entryRelativePath));
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (!entry.name.endsWith(this.mdxExtension)) {
        continue;
      }

      if (entry.name === this.indexFileName) {
        continue;
      }

      docs.push(entryRelativePath.slice(0, -this.mdxExtension.length));
    }

    return docs;
  }

  private static sortDocsByOrderThenTitle(a: Doc, b: Doc): number {
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
}
