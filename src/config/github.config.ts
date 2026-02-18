type GitHubProfileUrl<Username extends string = string> = `https://github.com/${Username}`;

interface GitHubConfig {
  username: string;
  profileUrl: GitHubProfileUrl;
}

export const githubConfig: GitHubConfig = {
  username: 'mcmanussliam',
  profileUrl: 'https://github.com/mcmanussliam',
};
