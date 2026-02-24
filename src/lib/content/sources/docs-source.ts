const DOCUMENTATION_SOURCE = ['local', 'github'] as const;
export type DocumentationSource = typeof DOCUMENTATION_SOURCE[number];

const DOCUMENTATION_SOURCE_SET: Set<string> = new Set(DOCUMENTATION_SOURCE);

export function getDocumentationSource(): DocumentationSource {
  const env = process.env.PAGES_DOCS_SOURCE;
  if (env && DOCUMENTATION_SOURCE_SET.has(env)) {
    return env as DocumentationSource;
  }

  if (process.env.NODE_ENV === 'test') {
    return 'local';
  }

  return 'github';
}
