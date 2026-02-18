import type {MDXComponents} from 'mdx/types';
import {ReactNode} from 'react';

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import HeadingWithAnchor from './src/components/custom/heading-anchor';
import {ArrowUpRight} from 'lucide-react';

function isInlineCode(children: ReactNode) {
  return typeof children === 'string' && !children.includes('\n');
}

export const mdxComponents: MDXComponents = {
  h1: ({children}) => <HeadingWithAnchor as="h1" className="mt-10 mb-4 text-2xl font-black tracking-tight">{children}</HeadingWithAnchor>,
  h2: ({children}) => <HeadingWithAnchor as="h2" className="mt-6 mb-2 text-xl font-extrabold tracking-tight">{children}</HeadingWithAnchor>,
  h3: ({children}) => <HeadingWithAnchor as="h3" className="mt-6 mb-2 text-lg font-extrabold tracking-tight">{children}</HeadingWithAnchor>,
  h4: ({children}) => <HeadingWithAnchor as="h4" className="mt-6 mb-2 text-lg font-bold tracking-tight">{children}</HeadingWithAnchor>,
  h5: ({children}) => <HeadingWithAnchor as="h5" className="mt-5 mb-1 text-base font-semibold tracking-tight">{children}</HeadingWithAnchor>,
  h6: ({children}) => <HeadingWithAnchor as="h6" className="mt-4 mb-1 text-sm font-semibold tracking-tight">{children}</HeadingWithAnchor>,

  p: ({children}) => <p className="leading-7 text-sm mt-4 first:mt-0">{children}</p>,

  ul: ({children}) => <ul className="mt-4 mb-6 ml-6 list-disc space-y-2 text-sm">{children}</ul>,
  ol: ({children}) => <ol className="mt-4 mb-6 ml-6 list-decimal space-y-2 text-sm">{children}</ol>,
  li: ({children}) => <li className="leading-6">{children}</li>,

  blockquote: ({children}) => <blockquote className="mt-6 mb-6 border-l-2 pl-6 italic text-sm">{children}</blockquote>,

  // eslint-disable-next-line @next/next/no-img-element
  img: ({alt, ...props}) => <img {...props} alt={alt ?? ''} loading="lazy" decoding="async" className="my-6 w-1/1 border dim"/>,

  table: ({children}) => <Table className="my-6">{children}</Table>,
  thead: ({children}) => <TableHeader>{children}</TableHeader>,
  tbody: ({children}) => <TableBody>{children}</TableBody>,
  tr: ({children}) => <TableRow>{children}</TableRow>,
  th: ({children}) => <TableHead>{children}</TableHead>,
  td: ({children}) => <TableCell className="whitespace-normal wrap-break-word">{children}</TableCell>,

  pre: ({children}) => <pre className="my-6 border p-4 text-sm code-block max-w-full whitespace-pre-wrap break-words">{children}</pre>,
  code: ({children}) => {
    if (isInlineCode(children)) {
      return <code className="px-1.5 py-0.5 font-mono bg-muted text-sm">{children}</code>;
    }

    return <code className="font-mono text-sm">{children}</code>;
  },

  a: ({children, ...props}) => <a className="font-medium link-foreground underline underline-offset-4" {...props}>{children}<ArrowUpRight size='16' className='inline-block'/></a>,
  hr: () => <hr className="my-8" />,
};


export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    ...mdxComponents
  };
}
