import fs from 'fs';

function stripFrontmatter(content: string): {frontmatter: string | null; body: string} {
  const trimmed = content.startsWith('\uFEFF') ? content.slice(1) : content;
  if (!trimmed.startsWith('---\n')) {
    return {frontmatter: null, body: content};
  }

  const end = trimmed.indexOf('\n---\n', 4);
  if (end === -1) {
    return {frontmatter: null, body: content};
  }

  return {
    frontmatter: trimmed.slice(4, end),
    body: trimmed.slice(end + '\n---\n'.length),
  };
}

function parseSimpleFrontmatter<T extends object>(frontmatter: string | null): T {
  const result: Record<string, unknown> = {};
  if (!frontmatter) {
    return result as T;
  }

  function parseScalar(raw: string): unknown {
    const value = raw.trim();

    const isDoubleQuoted = value.startsWith('"') && value.endsWith('"');
    const isSingleQuoted = value.startsWith('\'') && value.endsWith('\'');
    if (isDoubleQuoted || isSingleQuoted) {
      return value.slice(1, -1);
    }

    if (/^-?\d+(\.\d+)?$/.test(value)) {
      return Number(value);
    }

    return value;
  }

  for (const rawLine of frontmatter.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    result[key] = parseScalar(rawValue);
  }

  return result as T;
}

export function readFrontmatterFromFile<T extends object>(filePath: string): T {
  const content = fs.readFileSync(filePath, 'utf8');
  const {frontmatter} = stripFrontmatter(content);
  return parseSimpleFrontmatter<T>(frontmatter);
}
