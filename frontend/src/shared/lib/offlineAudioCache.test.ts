import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  OFFLINE_AUDIO_CACHE_NAME,
  isCacheApiAvailable,
  resolveMediaUrl,
  cacheAudioForOffline,
  getCachedAudioObjectUrl,
  removeAudioFromCache,
} from './offlineAudioCache';

function createCacheMock() {
  const store = new Map<string, Response>();
  return {
    store,
    match: vi.fn(async (url: string) => store.get(url) ?? null),
    put: vi.fn(async (url: string, res: Response) => {
      store.set(url, res);
    }),
    delete: vi.fn(async (url: string) => store.delete(url)),
  };
}

function stubCachesOnWindow(caches: Record<string, unknown>) {
  Object.defineProperty(window, 'caches', {
    value: caches,
    configurable: true,
    writable: true,
  });
}

describe('offlineAudioCache', () => {
  beforeEach(() => {
    delete (window as unknown as { caches?: unknown }).caches;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    delete (window as unknown as { caches?: unknown }).caches;
  });

  it('isCacheApiAvailable reflects caches presence on window', () => {
    stubCachesOnWindow({});
    expect(isCacheApiAvailable()).toBe(true);
    delete (window as unknown as { caches?: unknown }).caches;
    expect(isCacheApiAvailable()).toBe(false);
  });

  it('resolveMediaUrl handles absolute URLs and paths', () => {
    expect(resolveMediaUrl('https://cdn.example/a.mp3')).toBe('https://cdn.example/a.mp3');
    expect(resolveMediaUrl('/uploads/x.mp3')).toBe(`${window.location.origin}/uploads/x.mp3`);
    expect(resolveMediaUrl('uploads/x.mp3')).toBe(`${window.location.origin}/uploads/x.mp3`);
    expect(() => resolveMediaUrl(undefined)).toThrow('Missing media path');
  });

  it('cacheAudioForOffline skips fetch when already cached', async () => {
    const cache = createCacheMock();
    const url = `${window.location.origin}/uploads/a.mp3`;
    const existing = new Response('x', { status: 200 });
    cache.store.set(url, existing);
    const open = vi.fn().mockResolvedValue(cache);
    stubCachesOnWindow({ open });
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await cacheAudioForOffline('/uploads/a.mp3');

    expect(open).toHaveBeenCalledWith(OFFLINE_AUDIO_CACHE_NAME);
    expect(cache.match).toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('cacheAudioForOffline fetches and puts on cache miss', async () => {
    const cache = createCacheMock();
    stubCachesOnWindow({ open: vi.fn().mockResolvedValue(cache) });
    const body = new Response('ok', { status: 200 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(body));

    await cacheAudioForOffline('/uploads/b.mp3');

    expect(cache.put).toHaveBeenCalled();
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(`${window.location.origin}/uploads/b.mp3`, {
      credentials: 'same-origin',
    });
  });

  it('cacheAudioForOffline throws when fetch is not ok', async () => {
    const cache = createCacheMock();
    stubCachesOnWindow({ open: vi.fn().mockResolvedValue(cache) });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 404 })));

    await expect(cacheAudioForOffline('/uploads/missing.mp3')).rejects.toThrow(/404/);
    expect(cache.put).not.toHaveBeenCalled();
  });

  it('getCachedAudioObjectUrl returns null without match', async () => {
    const cache = createCacheMock();
    stubCachesOnWindow({ open: vi.fn().mockResolvedValue(cache) });
    await expect(getCachedAudioObjectUrl('/uploads/nothing.mp3')).resolves.toBeNull();
  });

  it('getCachedAudioObjectUrl returns blob URL when cached', async () => {
    if (typeof URL.createObjectURL !== 'function') {
      Object.defineProperty(URL, 'createObjectURL', {
        value: () => 'blob:http://localhost/mock',
        configurable: true
      });
    }
    if (typeof URL.revokeObjectURL !== 'function') {
      Object.defineProperty(URL, 'revokeObjectURL', {
        value: () => {},
        configurable: true
      });
    }
    const cache = createCacheMock();
    const url = `${window.location.origin}/uploads/c.mp3`;
    cache.store.set(url, new Response(new Blob(['abc']), { status: 200 }));
    stubCachesOnWindow({ open: vi.fn().mockResolvedValue(cache) });
    const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const blobUrl = await getCachedAudioObjectUrl('/uploads/c.mp3');
    expect(typeof blobUrl === 'string' && blobUrl.startsWith('blob:')).toBe(true);

    if (typeof blobUrl === 'string') URL.revokeObjectURL(blobUrl);
    revoke.mockRestore();
  });

  it('removeAudioFromCache deletes key', async () => {
    const cache = createCacheMock();
    stubCachesOnWindow({ open: vi.fn().mockResolvedValue(cache) });
    await removeAudioFromCache('/uploads/d.mp3');
    expect(cache.delete).toHaveBeenCalledWith(`${window.location.origin}/uploads/d.mp3`);
  });
});
