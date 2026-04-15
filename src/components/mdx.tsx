import { Banner } from "fumadocs-ui/components/banner";
import { File, Files, Folder } from "fumadocs-ui/components/files";
import {
  Tab,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    Banner,
    Files,
    File,
    Folder,
    Tabs,
    Tab,
    TabsList,
    TabsTrigger,
    TabsContent,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
