import {LinkIcon} from 'lucide-react';
import {slugify} from '@/lib/slugify';
import {JSX, Children, ReactNode} from 'react';

interface HeadingWithAnchorProps {
  as: keyof JSX.IntrinsicElements;

  children: ReactNode;

  className: string;
}

function getText(children: ReactNode): string {
  return Children.toArray(children)
    .map((child) => typeof child === 'string' ? child : '')
    .join('');
}

export default function HeadingWithAnchor({as: Tag, children, className}: HeadingWithAnchorProps) {
  const text = getText(children);
  const id = slugify(text);

  return (
    <Tag id={id} className={`group scroll-mt-20 ${className}`}>
      <a href={`#${id}`} aria-label={`Link to section ${text}`} className="flex items-start align-center gap-2 no-underline text-inherit">
        <span>{children}</span>
        <span className="my-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"><LinkIcon size={14}/></span>
      </a>
    </Tag>
  );
}
