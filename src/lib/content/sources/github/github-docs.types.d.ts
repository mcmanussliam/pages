export interface GitHubRepoInfo {
  html_url: string;

name: string;

description: string | null;

pushed_at?: string;

updated_at?: string;

default_branch: string;

stargazers_count: number;

forks_count: number;

open_issues_count: number;

license?: {spdx_id?: string | null} | null;
}

export interface GitHubRelease {
  tag_name: string;

published_at?: string;

html_url?: string;
}

export type GitHubContentsFile = {
  type: 'file';
  download_url: string | null;
};
