import type {HttpsUrl} from '@/types/url';
import type {ComponentType} from 'react';

export interface Link {
  key: string;

  value: HttpsUrl;

  external?: true;
}

export interface RecentRelease {
  tag: string;

  publishedAt?: string;

  url?: HttpsUrl;
}

export interface ProjectMetadata {
  title: string;

  description: string;

  lastUpdated: string;

  links?: Link[];

  repository?: HttpsUrl;

  recentRelease?: RecentRelease;
}

export interface DocMetadata {
  title: string;

  description?: string;

  project: string;

  order?: number;

  lastUpdated: string;
}

export interface Project extends ProjectMetadata {
  /** Directory name, 'obsidian-actions' */
  id: string;

  docsCount: number;
}

export interface Doc extends DocMetadata {
  /** File name without extension, 'getting-started' */
  slug: string;

  /** Full path segments, ['getting-started'] */
  path: string[];
}

export interface TocEntry {
  /** Heading slug, 'getting-started' */
  id: string;

  /** Heading text, 'Getting Started' */
  text: string;

  /** Heading level (h1, h2, h3) */
  level: 1 | 2 | 3;
}

export interface MDXDocument<T = DocMetadata | ProjectMetadata> {
  default: ComponentType;

  frontmatter: T;
}
