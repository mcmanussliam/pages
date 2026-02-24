import crypto from 'crypto';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const tempDirs: string[] = [];

function bodyPath(cacheDir: string, key: string): string {
  const hash = crypto.createHash('sha1').update(key).digest('hex');
  return path.join(cacheDir, 'http', `${hash}.body`);
}

async function makeTempDir(): Promise<string> {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'pages-cache-test-'));
  tempDirs.push(dir);
  return dir;
}

describe('github-cache', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(async() => {
    delete process.env.PAGES_DOCS_CACHE_DIR;
    for (const dir of tempDirs.splice(0)) {
      await fs.rm(dir, {recursive: true, force: true});
    }
  });

  it('caches text responses and serves fresh entries from disk', async() => {
    const cacheDir = await makeTempDir();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response('hello world', {status: 200, headers: {etag: '"v1"', 'last-modified': 'Mon'}})
    );
    vi.stubGlobal('fetch', fetchMock);

    const {HttpFileCache} = await import('@/lib/github/github-cache');
    const cache = new HttpFileCache({cacheDir});
    const url = 'https://api.example.com/doc';

    const first = await cache.fetchText(url, {ttlMs: 60_000});
    const second = await cache.fetchText(url, {ttlMs: 60_000});

    expect(first).toEqual({status: 200, text: 'hello world', fromCache: false});
    expect(second).toEqual({status: 200, text: 'hello world', fromCache: true});
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('uses conditional headers and refreshes ttl on 304 when body exists', async() => {
    const cacheDir = await makeTempDir();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('cached body', {status: 200, headers: {etag: '"abc"', 'last-modified': 'Tue'}}))
      .mockResolvedValueOnce(new Response(null, {status: 304}));
    vi.stubGlobal('fetch', fetchMock);

    const {HttpFileCache} = await import('@/lib/github/github-cache');
    const cache = new HttpFileCache({cacheDir});
    const url = 'https://api.example.com/etag';

    await cache.fetchText(url, {ttlMs: 0});
    const result = await cache.fetchText(url, {ttlMs: 60_000});

    expect(result).toEqual({status: 200, text: 'cached body', fromCache: true});
    const secondCallHeaders = fetchMock.mock.calls[1]?.[1]?.headers as Record<string, string>;
    expect(secondCallHeaders['If-None-Match']).toBe('"abc"');
    expect(secondCallHeaders['If-Modified-Since']).toBe('Tue');
  });

  it('retries with a full fetch when 304 is returned but body is missing', async() => {
    const cacheDir = await makeTempDir();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('seed body', {status: 200, headers: {etag: '"abc"'}}))
      .mockResolvedValueOnce(new Response(null, {status: 304}))
      .mockResolvedValueOnce(new Response('retried body', {status: 200}));
    vi.stubGlobal('fetch', fetchMock);

    const {HttpFileCache} = await import('@/lib/github/github-cache');
    const cache = new HttpFileCache({cacheDir});
    const url = 'https://api.example.com/retry';

    await cache.fetchText(url, {ttlMs: 0});
    await fs.rm(bodyPath(cacheDir, url), {force: true});
    const result = await cache.fetchText(url, {ttlMs: 0, headers: {'X-Test': '1'}});

    expect(result).toEqual({status: 200, text: 'retried body', fromCache: false});
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('fetches json and throws on non-2xx responses', async() => {
    const cacheDir = await makeTempDir();
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ok: true}), {status: 200}))
      .mockResolvedValueOnce(new Response('server error', {status: 500}));
    vi.stubGlobal('fetch', fetchMock);

    const {HttpFileCache} = await import('@/lib/github/github-cache');
    const cache = new HttpFileCache({cacheDir});

    await expect(cache.fetchJson<{ok: boolean}>('https://api.example.com/json-ok', {ttlMs: 0}))
      .resolves.toEqual({status: 200, json: {ok: true}, fromCache: false});

    await expect(cache.fetchJson('https://api.example.com/json-fail', {ttlMs: 0}))
      .rejects.toThrow('HTTP 500');
  });

  it('exposes default cache wrapper helpers', async() => {
    const cacheDir = await makeTempDir();
    process.env.PAGES_DOCS_CACHE_DIR = cacheDir;

    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response('text payload', {status: 200}))
      .mockResolvedValueOnce(new Response(JSON.stringify({value: 42}), {status: 200}));
    vi.stubGlobal('fetch', fetchMock);

    const {fetchTextCached, fetchJsonCached} = await import('@/lib/github/github-cache');

    await expect(fetchTextCached('https://api.example.com/text', {ttlMs: 0}))
      .resolves.toEqual({status: 200, text: 'text payload', fromCache: false});

    await expect(fetchJsonCached<{value: number}>('https://api.example.com/json', {ttlMs: 0}))
      .resolves.toEqual({status: 200, json: {value: 42}, fromCache: false});
  });
});
