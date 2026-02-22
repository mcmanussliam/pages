import NavigationBar from '@/components/custom/navigation-bar';
import {ThemeProvider} from '@/components/theme-provider';
import {githubConfig} from '@/config/github.config';
import {defaultLocale} from '@/i18n/config';
import {I18nProvider} from '@/i18n/i18n-provider';
import {getMessages} from '@/i18n/index';
import {getTranslator} from '@/i18n/server';
import {JetBrains_Mono} from 'next/font/google';
import type {Metadata} from 'next';
import type {ReactNode} from 'react';
import Link from 'next/link';

import './globals.css';

const jetbrainsMono = JetBrains_Mono({subsets: ['latin'], variable: '--font-sans'});
const t = getTranslator();
const messages = getMessages(defaultLocale);

export const metadata: Metadata = {
  title: {
    default: t('meta.site.title'),
    template: `%s | @${githubConfig.username}`,
  },
  description: t('meta.site.description', {username: `@${githubConfig.username}`}),
};

function Content({children}: Readonly<{children: ReactNode}>) {
  return (
    <div className="min-h-screen w-full lg:w-4/5 flex flex-col">
      <nav className='w-full'>
        <NavigationBar/>
      </nav>

      <main className="p-7 flex-1">
        {children}
      </main>

      <footer className="p-7 text-muted-foreground text-xs text-center">
        {t('footer.builtByPrefix')} <Link href={githubConfig.profileUrl} className="underline">{githubConfig.username}</Link>. {t('footer.sourceAvailable')} <Link href={githubConfig.repositoryUrl} className="underline">{t('footer.github')}</Link>.
      </footer>
    </div>
  );
}

export default function Root({children}: Readonly<{children: ReactNode}>) {
  return (
    <html lang="en" className={jetbrainsMono.variable} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider locale={defaultLocale} messages={messages}>
            <div className='flex justify-center'>
              <Content>{children}</Content>
            </div>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
