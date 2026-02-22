import {notFound} from 'next/navigation';
import Link from 'next/link';
import type {Metadata} from 'next';
import {
  getProjectIds,
  getProjectDocPaths,
} from '@/lib/content/content';
import {getDocPageData} from '@/lib/content/content-service';
import {TableOfContents} from '@/components/custom/table-of-contents';
import {BreadcrumbNav, type BreadcrumbNavItemProps} from '@/components/custom/breadcrumb-nav';
import {Button} from '@/components/ui/button';
import {getTranslator} from '@/lib/i18n/server';
import {ChevronLeft, ChevronRight} from 'lucide-react';

interface Props {
  params: Promise<{projectId: string; slug: string[] }>;
}
const t = getTranslator();

export function generateStaticParams() {
  const projectIds = getProjectIds();
  const paths: {projectId: string; slug: string[]}[] = [];

  for (const projectId of projectIds) {
    const docPaths = getProjectDocPaths(projectId);
    for (const slug of docPaths) {
      paths.push({projectId, slug});
    }
  }

  return paths;
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {projectId, slug} = await params;
  const docPageData = await getDocPageData(projectId, slug.join('/'));

  if (!docPageData) {
    return {
      title: t('meta.docNotFound.title'),
      description: t('meta.docNotFound.description'),
    };
  }

  const {doc, project} = docPageData;

  return {
    title: project ? `${doc.title} (${project.title})` : doc.title,
    description:
      doc.description ??
      t('meta.doc.fallbackDescription', {project: project?.title ?? projectId}),
  };
}

export default async function Root({params}: Props) {
  const {projectId, slug} = await params;
  const docPageData = await getDocPageData(projectId, slug.join('/'));
  if (!docPageData) {
    notFound();
  }

  const {doc, project, Content, toc, prevDoc, nextDoc} = docPageData;

  const breadcrumbItems: readonly BreadcrumbNavItemProps[] = [
    {label: t('breadcrumbs.projects'), href: '/projects'},
    {label: project?.title || projectId, href: `/projects/${projectId}`},
    {label: doc.title},
  ];

  return (
    <>
      <BreadcrumbNav items={breadcrumbItems}/>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_200px] gap-6 xl:gap-8">
        <div className="min-w-0">
          <article className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-7">
            <Content/>
          </article>

          {(prevDoc || nextDoc) && (
            <div className="mt-8 xl:mt-10 flex flex-col sm:flex-row justify-between gap-4">
              {
                prevDoc ? (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/projects/${projectId}/docs/${prevDoc.slug}`}>
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      {prevDoc.title}
                    </Link>
                  </Button>
                ) : (
                  <div/>
                )
              }
              {
                nextDoc && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/projects/${projectId}/docs/${nextDoc.slug}`}>
                      {nextDoc.title}
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )
              }
            </div>
          )}
        </div>

        <aside className="hidden xl:block">
          <TableOfContents toc={toc} />
        </aside>
      </div>
    </>
  );
}
