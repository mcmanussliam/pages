type GitHubProfileUrl = `https://github.com/${string}`;

type GitHubRepoUrl = `https://github.com/${string}/${string}`;

/** Config for GitHub profiles and references in the site. */
interface GitHubConfig {
  /** Username for the my GitHub */
  username: string;

  /** Profile url for GitHub account */
  profileUrl: GitHubProfileUrl;

  /** GitHub url for the current repository */
  repositoryUrl: GitHubRepoUrl;
}

export const githubConfig: GitHubConfig = {
  username: 'mcmanussliam',
  profileUrl: 'https://github.com/mcmanussliam',
  repositoryUrl: 'https://github.com/mcmanussliam/pages',
};
