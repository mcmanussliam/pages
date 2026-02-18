export type HttpsUrl = `https://${string}`;

export type GitHubProfileUrl<Username extends string = string> =
  `https://github.com/${Username}`;

export type GitHubRepoUrl<
  Username extends string = string,
  Repo extends string = string,
> = `https://github.com/${Username}/${Repo}`;

export type GitHubRemoteUrl<
  Username extends string = string,
  Repo extends string = string,
> = `${GitHubRepoUrl<Username, Repo>}.git`;
