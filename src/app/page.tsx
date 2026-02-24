import Link from 'next/link';
import type {Metadata} from 'next';
import {Badge} from '@/components/ui/badge';
import {contentRepository} from '@/lib/content/content';
import {I18nService} from '@/lib/i18n';

const t = I18nService.translator();

export const revalidate = 300;

export const metadata: Metadata = {
  title: t('meta.projects.title'),
  description: t('meta.projects.description'),
};

export default async function Page() {
  const projects = await contentRepository.getProjects();

  return (
    <>
      <h1 className='heading'>{t('projects.title')}</h1>
      <div className="space-y-6 lg:space-y-8">
        {projects.map((project) => (
          <div key={project.id} className="group">
            <div className="space-y-2 lg:space-y-3">
              <div className="flex items-start justify-between gap-4">
                <Link
                  href={`/projects/${project.id}`}
                  className="transition-colors hover:text-primary hover:underline underline-offset-4 decoration-muted-foreground/60"
                >
                  <h2 className="text-lg font-semibold transition-colors">
                    {project.title}
                  </h2>
                </Link>
                {project.docsCount > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {project.docsCount}{' '}
                    {project.docsCount === 1 ? t('common.docsSingle') : t('common.docsPlural')}
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {project.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>
                  {t('common.updatedOn', {
                    date: new Date(project.lastUpdated).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }),
                  })}
                </span>

                {project.recentRelease?.tag ? (
                  <>
                    <span>-</span>
                    {project.recentRelease.url ? (
                      <Link
                        href={project.recentRelease.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-primary underline-offset-4 hover:underline"
                      >
                        {project.recentRelease.tag}
                      </Link>
                    ) : (
                      <span>{project.recentRelease.tag}</span>
                    )}
                  </>
                ) : null}

                {project.links?.length ? (
                  <>
                    <span>-</span>
                    <div className="flex flex-wrap gap-3">
                      {project.links.map((projectLink) => (
                        <Link
                          key={`${project.id}-${projectLink.key}-${projectLink.value}`}
                          href={projectLink.value}
                          target={projectLink.external ? '_blank' : undefined}
                          rel={projectLink.external ? 'noreferrer noopener' : undefined}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {projectLink.key}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
            <div className="mt-4 border-b border-border/40" />
          </div>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            {t('projects.empty')}
          </p>
        </div>
      )}
    </>
  );
}
