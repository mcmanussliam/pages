import React from 'react';
import {notFound} from 'next/navigation';
import {getProject, getProjectDocs, getProjectIds} from '@/lib/content';
import {ProjectNav} from '@/components/custom/project-nav';

interface Props {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export function generateStaticParams() {
  const projectIds = getProjectIds();
  return projectIds.map((id) => ({projectId: id}));
}

export default async function Layout({children, params}: Props) {
  const {projectId} = await params;
  const project = await getProject(projectId);

  if (!project) {
    notFound();
  }

  const docs = await getProjectDocs(projectId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 lg:gap-8">
      <aside className="hidden lg:block"><ProjectNav project={project} docs={docs} /></aside>
      <main className="min-w-0">{children}</main>
    </div>
  );
}
