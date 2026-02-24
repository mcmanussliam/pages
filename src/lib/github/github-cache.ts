import path from 'path';
import {FileJsonStore} from '@/lib/cache/stores/json-store';
import {FileTextStore} from '@/lib/cache/stores/txt-store';
import {KeyValueCache, type CacheEnvelope} from '@/lib/cache/key-value-cache';

export interface CachedHttpMeta {
  url: string;

  status: number;

  etag?: string;

  lastModified?: string;

  headers?: Record<string, string>;
}

function isStringRecord(value: unknown): value is Record<string, string> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  for (const entry of Object.values(value as Record<string, unknown>)) {
    if (typeof entry !== 'string') {
      return false;
    }
  }

  return true;
}

function migrateLegacyHttpMeta(raw: unknown): CacheEnvelope<CachedHttpMeta> | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const maybe = raw as Record<string, unknown>;
  const {fetchedAt, ttlMs, url, status} = maybe;

  if (typeof fetchedAt !== 'number' || typeof ttlMs !== 'number') {
    return null;
  }

  if (typeof url !== 'string' || typeof status !== 'number') {
    return null;
  }

  const {etag, lastModified, headers} = maybe;

  return {
    value: {
      url,
      status,
      etag: typeof etag === 'string' ? etag : undefined,
      lastModified: typeof lastModified === 'string' ? lastModified : undefined,
      headers: isStringRecord(headers) ? headers : undefined,
    },
    createdAt: fetchedAt,
    expiresAt: fetchedAt + ttlMs,
  };
}

/** Disk-backed HTTP cache used to reduce GitHub/API fetch load. */
export class HttpFileCache {
  private readonly cacheDir: string;
  private readonly metaCache: KeyValueCache<CachedHttpMeta>;
  private readonly bodyStore: FileTextStore;

  public constructor(opts?: {cacheDir?: string}) {
    this.cacheDir = opts?.cacheDir ?? process.env.PAGES_DOCS_CACHE_DIR ?? path.join('/tmp', 'pages-docs-cache');
    const metaStore = new FileJsonStore({dir: this.cacheDir, namespace: 'http', extension: '.json'});
    this.metaCache = new KeyValueCache<CachedHttpMeta>({store: metaStore, migrate: migrateLegacyHttpMeta});
    this.bodyStore = new FileTextStore({dir: this.cacheDir, namespace: 'http', extension: '.body'});
  }

  /** Fetches a URL as text with disk caching and conditional requests. */
  public async fetchText(
    url: string,
    opts: {
      ttlMs: number;
      headers?: Record<string, string>;
    }
  ): Promise<{status: number; text: string; fromCache: boolean}> {
    const now = Date.now();

    const existing = await this.metaCache.getEnvelope(url);
    if (existing && this.metaCache.isFresh(existing, now)) {
      const text = await this.bodyStore.read(url);
      if (text !== null) {
        return {status: existing.value.status, text, fromCache: true};
      }
    }

    const headers = this.buildConditionalHeaders(existing?.value ?? null, opts.headers);
    const res = await fetch(url, {headers});

    if (res.status === 304 && existing) {
      const text = await this.bodyStore.read(url);
      if (text === null) {
        const retry = await fetch(url, {headers: {...(opts.headers || {})}});
        const retryText = await retry.text();
        await this.writeCache(url, retry, retryText, opts.ttlMs, now);
        return {status: retry.status, text: retryText, fromCache: false};
      }

      const updated: CacheEnvelope<CachedHttpMeta> = {
        ...existing,
        expiresAt: now + opts.ttlMs,
      };

      await this.metaCache.setEnvelope(url, updated);
      return {status: existing.value.status, text, fromCache: true};
    }

    const text = await res.text();
    await this.writeCache(url, res, text, opts.ttlMs, now);

    return {status: res.status, text, fromCache: false};
  }

  /** Fetches a URL as JSON with disk caching and conditional requests. */
  public async fetchJson<T>(
    url: string,
    opts: {
      ttlMs: number;
      headers?: Record<string, string>;
    }
  ): Promise<{status: number; json: T; fromCache: boolean}> {
    const {status, text, fromCache} = await this.fetchText(url, opts);
    if (status < 200 || status >= 300) {
      throw new Error(`HTTP ${status} for ${url}`);
    }

    return {status, json: JSON.parse(text) as T, fromCache};
  }

  private buildConditionalHeaders(
    existing: CachedHttpMeta | null,
    extra: Record<string, string> | undefined
  ): Record<string, string> {
    const headers: Record<string, string> = {...(extra || {})};

    if (existing?.etag) {
      headers['If-None-Match'] = existing.etag;
    }

    if (existing?.lastModified) {
      headers['If-Modified-Since'] = existing.lastModified;
    }

    return headers;
  }

  private async writeCache(url: string, res: Response, text: string, ttlMs: number, now: number): Promise<void> {
    const meta: CachedHttpMeta = {
      url,
      status: res.status,
      etag: res.headers.get('etag') || undefined,
      lastModified: res.headers.get('last-modified') || undefined,
    };

    await this.bodyStore.write(url, text);
    await this.metaCache.setEnvelope(url, this.metaCache.buildEnvelope(meta, ttlMs, now));
  }
}

const defaultCache = new HttpFileCache();

export async function fetchTextCached(
  url: string,
  opts: {
    ttlMs: number;
    headers?: Record<string, string>;
  }
): Promise<{status: number; text: string; fromCache: boolean}> {
  return defaultCache.fetchText(url, opts);
}

export async function fetchJsonCached<T>(
  url: string,
  opts: {
    ttlMs: number;
    headers?: Record<string, string>;
  }
): Promise<{status: number; json: T; fromCache: boolean}> {
  return defaultCache.fetchJson<T>(url, opts);
}
