type GitHubRepoUrl = `https://github.com/${string}/${string}`;

/**
 * Config for fetching data from repositories, all data is resolved from the repository itself,
 * no need to spread documentation across a bunch of different platforms.
 */
interface ProjectsConfig {
  /** GitHub url for the associated repository */
  repository: GitHubRepoUrl;

  /** Url for the associated release platform e.g. crates.io, brew */
  release?: string;

  /**
   * Directory for the documentation for this project. This directory **must** follow the
   * standard laid out in the spec.
   */
  documentation: string;
}

export const projectsConfig: readonly ProjectsConfig[] = [
  {
    repository: 'https://github.com/mcmanussliam/brb',
    release: 'https://crates.io/crates/brb-cli',
    documentation: 'docs'
  },
  {
    repository: 'https://github.com/mcmanussliam/nd',
    release: 'https://crates.io/crates/nd-cli',
    documentation: 'docs'
  },
  // {
  //   repository: 'https://github.com/mcmanussliam/obsidian-actions',
  //   documentation: 'docs'
  // },
  // {
  //   repository: 'https://github.com/mcmanussliam/otto',
  //   release: 'https://crates.io/otto-cli',
  //   documentation: 'docs'
  // },
  // {
  //   repository: 'https://github.com/mcmanussliam/pages',
  //   documentation: 'docs'
  // },
];
