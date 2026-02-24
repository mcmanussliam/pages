import {notFound} from 'next/navigation';
import Link from 'next/link';
import type {Metadata} from 'next';
import {getProjectPageData} from '@/lib/content/services/content-service';
import {contentRepository} from '@/lib/content/content';
import {Badge} from '@/components/ui/badge';
import {BreadcrumbNav} from '@/components/custom/breadcrumb-nav';
import {I18nService} from '@/lib/i18n';
import {MarkdownHtml} from '@/components/custom/markdown-html';

interface Props {
  params: Promise<{projectId: string}>;
}

const t = I18nService.translator();
export const revalidate = 300;

export function generateStaticParams(): {projectId: string}[] {
  return contentRepository.getProjectIds().map(projectId => ({projectId}));
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {projectId} = await params;
  const projectPageData = await getProjectPageData(projectId);
  if (!projectPageData) {
    return {
      title: t('meta.projectNotFound.title'),
      description: t('meta.projectNotFound.description'),
    };
  }

  return {
    title: projectPageData.project.title,
    description: projectPageData.project.description,
  };
}

export default async function Root({params}: Props) {
  const {projectId} = await params;
  const projectPageData = await getProjectPageData(projectId);

  if (!projectPageData) {
    notFound();
  }

  const {project, docs, ProjectContent} = projectPageData;

  return (
    <>
      <BreadcrumbNav
        items={[
          {label: t('breadcrumbs.projects'), href: '/projects'},
          {label: project.title},
        ]}
      />

      <div className="space-y-6 lg:space-y-8 mt-6">
        <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-7">
          {projectPageData.projectHtml ? (
            <MarkdownHtml html={projectPageData.projectHtml} />
          ) : ProjectContent ? (
            <ProjectContent />
          ) : null}
        </article>

        {docs.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-3 lg:mb-4">
              {t('common.documentation')}
            </h2>
            <div className="space-y-2 lg:space-y-3">
              {docs.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/projects/${projectId}/docs/${doc.slug}`}
                  className="block group"
                >
                  <div className="p-4 rounded-lg border border-border/40 hover:border-border transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                          {doc.title}
                        </h3>
                        {doc.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {doc.description}
                          </p>
                        )}
                      </div>
                      {doc.order !== undefined && (
                        <Badge variant="outline" className="text-xs">
                          {doc.order}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
