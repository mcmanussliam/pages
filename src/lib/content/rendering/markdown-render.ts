import path from 'path';
import {resolveRelativeMdLink} from './mdbook';
import {slugify} from '@/lib/utils/slugify';

type UnifiedProcessor = {
  use: (...args: unknown[]) => UnifiedProcessor;
  process: (input: string) => Promise<unknown>;
};

type UnifiedFactory = () => UnifiedProcessor;
type VisitFn = (tree: unknown, visitor: (node: unknown, index: number | null, parent: unknown) => void) => void;
type LinkVisitorFn = (tree: unknown, visitor: (node: unknown) => void) => void;

type MarkdownRenderModules = {
  unified: UnifiedFactory;
  remarkParse: unknown;
  remarkGfm: unknown;
  remarkRehype: unknown;
  rehypePrettyCode: unknown;
  rehypeStringify: unknown;
  visit: VisitFn;
};

type HastElement = {
  type: 'element';
  tagName: string;
  properties?: Record<string, unknown>;
  children?: unknown[];
};

class MarkdownRenderer {
  static readonly #headingClassNames: Record<string, string> = {
    h1: 'mt-10 mb-4 text-2xl font-black tracking-tight',
    h2: 'mt-6 mb-2 text-xl font-extrabold tracking-tight',
    h3: 'mt-6 mb-2 text-lg font-extrabold tracking-tight',
    h4: 'mt-6 mb-2 text-lg font-bold tracking-tight',
    h5: 'mt-5 mb-1 text-base font-semibold tracking-tight',
    h6: 'mt-4 mb-1 text-sm font-semibold tracking-tight',
  };

  static readonly #elementClassNames: Record<string, string> = {
    p: 'leading-7 text-sm mt-4 first:mt-0',
    ul: 'mt-4 mb-6 ml-6 list-disc space-y-2 text-sm',
    ol: 'mt-4 mb-6 ml-6 list-decimal space-y-2 text-sm',
    li: 'leading-6',
    blockquote: 'mt-6 mb-6 border-l-2 pl-6 italic text-sm',
    img: 'my-6 w-full border dim',
    table: 'my-6 w-full caption-bottom text-sm',
    thead: '[&_tr]:border-b',
    tbody: '[&_tr:last-child]:border-0',
    tr: 'hover:bg-muted/50 border-b transition-colors',
    th: 'text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap',
    td: 'p-2 align-middle whitespace-normal wrap-break-word',
    pre: 'my-6 border p-4 text-sm code-block max-w-full whitespace-pre-wrap break-words',
    a: 'font-medium link-foreground underline underline-offset-4',
    hr: 'my-8',
  };

  static #modulesPromise: Promise<MarkdownRenderModules> | null = null;

  public static async render(input: {
    markdown: string;
    projectId: string;
    currentSlug: string;
    rawBaseUrl: string;
  }): Promise<string> {
    const modules = await MarkdownRenderer.#loadModules();

    const file = await modules.unified()
      .use(modules.remarkParse)
      .use(modules.remarkGfm, {strict: true, throwOnError: true})
      .use(MarkdownRenderer.#rewriteLinksPlugin, modules.visit, {
        projectId: input.projectId,
        currentSlug: input.currentSlug,
        rawBaseUrl: input.rawBaseUrl,
      })
      .use(modules.remarkRehype, {allowDangerousHtml: true})
      .use(modules.rehypePrettyCode)
      .use(MarkdownRenderer.#applyMdxStylingPlugin, modules.visit)
      .use(modules.rehypeStringify, {allowDangerousHtml: true})
      .process(input.markdown);

    return String(file);
  }

  static #isRelativeUrl(url: string): boolean {
    return !(
      url.startsWith('http://') ||
      url.startsWith('https://') ||
      url.startsWith('/') ||
      url.startsWith('#')
    );
  }

  static #rewriteLinksPlugin(
    visit: LinkVisitorFn,
    opts: {projectId: string; currentSlug: string; rawBaseUrl: string}
  ) {
    return (tree: unknown) => {
      visit(tree, (node: unknown) => {
        if (!node || typeof node !== 'object') {
          return;
        }

        const {type} = node as {type?: string};
        if (type === 'link') {
          MarkdownRenderer.#rewriteLink(node as {url?: string}, opts);
          return;
        }

        if (type === 'image') {
          MarkdownRenderer.#rewriteImage(node as {url?: string}, opts);
        }
      });
    };
  }

  static #rewriteLink(node: {url?: string}, opts: {projectId: string; currentSlug: string}): void {
    const {url} = node;
    if (!url || !MarkdownRenderer.#isRelativeUrl(url)) {
      return;
    }

    const resolved = resolveRelativeMdLink(opts.currentSlug, url);
    if (!resolved) {
      return;
    }

    const [resolvedSlug, hash] = resolved.split('#');
    node.url = `/projects/${opts.projectId}/docs/${resolvedSlug}${hash ? `#${hash}` : ''}`;
  }

  static #rewriteImage(node: {url?: string}, opts: {currentSlug: string; rawBaseUrl: string}): void {
    const {url} = node;
    if (!url || !MarkdownRenderer.#isRelativeUrl(url)) {
      return;
    }

    const baseDir = path.posix.dirname(`${opts.currentSlug}.md`);
    const resolved = path.posix.normalize(path.posix.join(baseDir, url));
    node.url = `${opts.rawBaseUrl}${resolved.replace(/^\/+/, '')}`;
  }

  static #applyMdxStylingPlugin(visit: VisitFn) {
    return (tree: unknown) => {
      visit(tree, (node: unknown, _index: number | null, parent: unknown) => {
        if (!node || typeof node !== 'object') {
          return;
        }

        const elementNode = node as Partial<HastElement>;
        if (elementNode.type !== 'element' || typeof elementNode.tagName !== 'string') {
          return;
        }

        MarkdownRenderer.#applyTagStyles(elementNode as HastElement, parent);
      });
    };
  }

  static #applyTagStyles(node: HastElement, parent: unknown): void {
    if (MarkdownRenderer.#applyHeadingStyles(node)) {
      return;
    }

    if (MarkdownRenderer.#applyCodeStyles(node, parent)) {
      return;
    }

    MarkdownRenderer.#applyElementStyles(node);
  }

  static #applyHeadingStyles(node: HastElement): boolean {
    const headingClassNames = MarkdownRenderer.#headingClassNames[node.tagName];
    if (!headingClassNames) {
      return false;
    }

    MarkdownRenderer.#ensureHeadingId(node);
    MarkdownRenderer.#ensureClass(node, headingClassNames);
    return true;
  }

  static #applyCodeStyles(node: HastElement, parent: unknown): boolean {
    if (node.tagName !== 'code') {
      return false;
    }

    const parentTagName = typeof parent === 'object' && parent !== null ? (parent as {tagName?: unknown}).tagName : undefined;
    if (parentTagName === 'pre') {
      MarkdownRenderer.#stripBlockCodeStyles(node);
      MarkdownRenderer.#ensureClass(node, 'font-mono text-sm');
      return true;
    }

    MarkdownRenderer.#ensureClass(node, 'px-1.5 py-0.5 font-mono bg-muted text-sm');
    return true;
  }

  static #applyElementStyles(node: HastElement): void {
    const classNames = MarkdownRenderer.#elementClassNames[node.tagName];
    if (classNames) {
      if (node.tagName === 'pre') {
        MarkdownRenderer.#stripBlockCodeStyles(node);
      }

      MarkdownRenderer.#ensureClass(node, classNames);
    }

    if (node.tagName === 'img') {
      MarkdownRenderer.#applyImageDefaults(node);
    }
  }

  static #applyImageDefaults(node: HastElement): void {
    if (!node.properties) {
      node.properties = {};
    }

    if (!node.properties.loading) {
      node.properties.loading = 'lazy';
    }

    if (!node.properties.decoding) {
      node.properties.decoding = 'async';
    }
  }

  static #stripBlockCodeStyles(node: HastElement): void {
    if (!node.properties) {
      return;
    }

    const {style} = node.properties;
    if (typeof style !== 'string' || !style) {
      return;
    }

    const stripped = style
      .split(';')
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .filter((declaration) => {
        const [prop] = declaration.split(':', 1);
        const key = prop?.trim().toLowerCase();
        return key !== 'background' && key !== 'background-color' && key !== 'color';
      })
      .join('; ');

    if (!stripped) {
      delete node.properties.style;
      return;
    }

    node.properties.style = `${stripped};`;
  }

  static #ensureClass(node: HastElement, className: string): void {
    if (!node.properties) {
      node.properties = {};
    }

    node.properties.className = MarkdownRenderer.#mergeClassNames(node.properties.className, className);
  }

  static #mergeClassNames(existing: unknown, className: string): string | string[] {
    if (!existing) {
      return className;
    }

    const additions = className.split(/\s+/).filter(Boolean);

    if (typeof existing === 'string') {
      const classSet = new Set(existing.split(/\s+/).filter(Boolean));
      additions.forEach((nextClass) => classSet.add(nextClass));
      return Array.from(classSet).join(' ');
    }

    if (Array.isArray(existing)) {
      const classSet = new Set(existing.filter((value) => typeof value === 'string') as string[]);
      additions.forEach((nextClass) => classSet.add(nextClass));
      return Array.from(classSet);
    }

    return className;
  }

  static #ensureHeadingId(node: HastElement): void {
    if (!node.properties) {
      node.properties = {};
    }

    if (typeof node.properties.id === 'string' && node.properties.id) {
      return;
    }

    const headingText = MarkdownRenderer.#textContent(node).trim();
    if (!headingText) {
      return;
    }

    node.properties.id = slugify(headingText);
  }

  static #textContent(node: unknown): string {
    if (!node || typeof node !== 'object') {
      return '';
    }

    const maybeNode = node as {type?: unknown; value?: unknown; children?: unknown[]};

    if (maybeNode.type === 'text') {
      return typeof maybeNode.value === 'string' ? maybeNode.value : '';
    }

    if (maybeNode.type === 'element' && Array.isArray(maybeNode.children)) {
      return maybeNode.children.map((child) => MarkdownRenderer.#textContent(child)).join('');
    }

    return '';
  }

  static async #loadModules(): Promise<MarkdownRenderModules> {
    if (MarkdownRenderer.#modulesPromise) {
      return MarkdownRenderer.#modulesPromise;
    }

    MarkdownRenderer.#modulesPromise = (async() => {
      const [
        unifiedModule,
        remarkParseModule,
        remarkGfmModule,
        remarkRehypeModule,
        rehypePrettyCodeModule,
        rehypeStringifyModule,
        visitModule,
      ] = await Promise.all([
        import('unified'),
        import('remark-parse'),
        import('remark-gfm'),
        import('remark-rehype'),
        import('rehype-pretty-code'),
        import('rehype-stringify'),
        import('unist-util-visit'),
      ]);

      return {
        unified: (unifiedModule as {unified: UnifiedFactory}).unified,
        remarkParse: (remarkParseModule as {default: unknown}).default,
        remarkGfm: (remarkGfmModule as {default: unknown}).default,
        remarkRehype: (remarkRehypeModule as {default: unknown}).default,
        rehypePrettyCode: (rehypePrettyCodeModule as {default: unknown}).default,
        rehypeStringify: (rehypeStringifyModule as {default: unknown}).default,
        visit: (visitModule as {visit: VisitFn}).visit,
      };
    })();

    return MarkdownRenderer.#modulesPromise;
  }
}

export async function renderMarkdownToHtml(input: {
  markdown: string;
  projectId: string;
  currentSlug: string;
  rawBaseUrl: string;
}): Promise<string> {
  return MarkdownRenderer.render(input);
}
