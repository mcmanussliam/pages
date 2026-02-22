import type {HttpsUrl} from '@/config/url.types';
import type {ComponentType} from 'react';

/** Link metadata for external resources */
export interface Link {
  key: string;
  value: HttpsUrl;
  external?: true;
}

/** Project frontmatter metadata from index.mdx */
export interface ProjectMetadata {
  title: string;
  description: string;
  lastUpdated: string;
  links?: Link[];
}

/** Documentation frontmatter metadata */
export interface DocMetadata {
  title: string;
  description?: string;
  project: string;
  order?: number;
  lastUpdated: string;
}

/** Project with its metadata and ID */
export interface Project extends ProjectMetadata {
  id: string; // Directory name (e.g., "obsidian-actions")
  docsCount: number;
}

/** Documentation with its metadata and routing info */
export interface Doc extends DocMetadata {
  slug: string; // File name without extension (e.g., "getting-started")
  path: string[]; // Full path segments (e.g., ["getting-started"])
}

/** Table of contents entry extracted from MDX headings */
export interface TocEntry {
  id: string; // Heading slug (e.g., "getting-started")
  text: string; // Heading text (e.g., "Getting Started")
  level: 1 | 2 | 3; // Heading level (h1, h2, h3)
}

/** MDX component with frontmatter */
export interface MDXDocument<T = DocMetadata | ProjectMetadata> {
  default: ComponentType;
  frontmatter: T;
}
