'use client';

import {useEffect, useState} from 'react';
import type {TocEntry} from '@/lib/content.types';
import {useI18n} from '@/i18n/i18n-provider';
import {cn} from '@/lib/utils';

interface TableOfContentsProps {
  toc: TocEntry[];
}

export function TableOfContents({toc}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const {t} = useI18n();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [firstVisibleHeading] = entries
          .filter(entry => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (firstVisibleHeading) {
          setActiveId(firstVisibleHeading.target.id);
        }
      },
      {
        // Account for sticky header and mark a heading active shortly before it reaches the top.
        threshold: 0.1,
      }
    );

    // Observe all headings
    toc.forEach(({id}) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [toc]);

  if (toc.length === 0) {
    return null;
  }

  return (
    <nav className="sticky top-20 space-y-1">
      <h4 className="text-sm font-semibold text-foreground/70 mb-3">{t('common.onThisPage')}</h4>
      <ul className="space-y-1 text-sm border-l border-border/40 pl-4">
        {toc.map((entry) => {
          const linkClass = activeId === entry.id ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground';

          return (
            <li
              key={entry.id}
              className={cn(
                'transition-all',
                entry.level === 2 && 'ml-0',
                entry.level === 3 && 'ml-3'
              )}
            >
              <a
                href={`#${entry.id}`}
                className={cn(
                  'block py-1 transition-colors',
                  linkClass
                )}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveId(entry.id);
                  document.getElementById(entry.id)?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
              >
                {entry.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
