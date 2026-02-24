import {notFound} from 'next/navigation';
import type {ReactNode} from 'react';
import {getProjectPageData} from '@/lib/content/services/content-service';
import {ProjectNav} from '@/components/custom/project-nav';

interface Props {
  children: ReactNode;

params: Promise<{projectId: string}>;
}

export default async function Layout({children, params}: Props) {
  const {projectId} = await params;
  const projectPageData = await getProjectPageData(projectId);

  if (!projectPageData) {
    notFound();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 lg:gap-8">
      <aside className="hidden lg:block">
        <ProjectNav project={projectPageData.project} docs={projectPageData.docs} />
      </aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
