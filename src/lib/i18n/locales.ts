import {type StructuredI18n} from './i18n-config';

export const i18n = {
  en: {
    meta: {
      site: {
        title: 'Portfolio',
        description: 'Documentation for projects by {username}.',
      },
      home: {
        title: 'Home',
        description: 'Browse active projects and their docs.',
      },
      projects: {
        title: 'Projects',
        description: 'Project index including docs and external links.',
      },
      projectNotFound: {
        title: 'Project Not Found',
        description: 'The requested project does not exist on this site.',
      },
      docNotFound: {
        title: 'Doc Not Found',
        description: 'The requested documentation page does not exist.',
      },
      doc: {fallbackDescription: 'Documentation for {project}.',},
      notFound: {
        title: '404',
        description: 'The page you requested could not be found.',
      },
    },
    nav: {
      home: 'Home',
      projects: 'Projects',
      github: 'GitHub',
    },
    common: {
      updatedOn: 'Updated {date}',
      docsSingle: 'doc',
      docsPlural: 'docs',
      overview: 'Overview',
      onThisPage: 'On this page',
      documentation: 'Documentation',
    },
    footer: {
      builtByPrefix: 'Built by',
      sourceAvailable: 'The source code is available on',
      github: 'GitHub',
    },
    home: {
      title: 'Home',
      message: 'Hello, welcome to website',
    },
    projects: {
      title: 'Projects',
      empty: 'No projects yet. Check back soon!',
    },
    notFound: {message: 'These are not the pages you\'re looking for.',},
    theme: {
      toggle: 'Toggle theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
    breadcrumbs: {projects: 'Projects',},
  }
} as const satisfies StructuredI18n;

export type I18n = typeof i18n;
export type TokenNamespaces = I18n[keyof I18n];

type WidenMessages<T> = T extends string
  ? string
  : T extends object
    ? {[K in keyof T]: WidenMessages<T[K]>}
    : T;

export type Messages = WidenMessages<TokenNamespaces>;
