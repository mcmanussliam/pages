import {githubConfig} from './github.config';

interface SiteConfig {
  name: string;
  title: string;
  description: string;
}

export const siteConfig: SiteConfig = {
  name: 'pages',
  title: `Please Star My Repos | @${githubConfig.username}`,
  description: `Documentation for projects by @${githubConfig.username}`,
};
