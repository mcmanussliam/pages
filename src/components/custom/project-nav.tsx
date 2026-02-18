'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import type {Project, Doc} from '@/lib/content.types';
import {useI18n} from '@/i18n/i18n-provider';
import {cn} from '@/lib/utils';

interface ProjectNavProps {
  project: Project;
  docs: Doc[];
}

export function ProjectNav({project, docs}: ProjectNavProps) {
  const pathname = usePathname();
  const {t} = useI18n();
  const overviewPath = `/projects/${project.id}`;
  const isOverviewActive = pathname === overviewPath || pathname === `${overviewPath}/`;

  return (
    <nav className="sticky top-20 space-y-1">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-foreground/70 mb-3">
          {project.title}
        </h4>
      </div>

      <ul className="space-y-1 text-sm">
        <li>
          <Link
            href={overviewPath}
            className={cn(
              'block py-1.5 px-3 rounded-md transition-colors',
              isOverviewActive ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            )}
          >
            {t('common.overview')}
          </Link>
        </li>

        {docs.map((doc) => {
          const isActive = pathname === `/projects/${project.id}/docs/${doc.slug}/`;
          const linkClass = isActive ? 'bg-muted text-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50';

          return (
            <li key={doc.slug}>
              <Link
                href={`/projects/${project.id}/docs/${doc.slug}`}
                className={cn(
                  'block py-1.5 px-3 rounded-md transition-colors',
                  linkClass
                )}
              >
                {doc.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
