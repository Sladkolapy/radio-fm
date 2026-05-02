/** Имя кэша должен совпадать с `public/service-worker.js` (CACHE_NAME). */
export const OFFLINE_AUDIO_CACHE_NAME = 'music-player-v1';

export function isCacheApiAvailable(): boolean {
  return typeof window !== 'undefined' && 'caches' in window;
}

/** Абсолютный URL для запроса того же origin (нужен для Cache Storage). */
export function resolveMediaUrl(path: string | undefined): string {
  if (!path) throw new Error('Missing media path');
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${window.location.origin}${normalized}`;
}

export async function cacheAudioForOffline(filePath: string | undefined): Promise<void> {
  if (!isCacheApiAvailable()) throw new Error('Cache API не поддерживается в этом браузере');
  const url = resolveMediaUrl(filePath);
  const cache = await caches.open(OFFLINE_AUDIO_CACHE_NAME);
  const existing = await cache.match(url);
  if (existing) return;

  const res = await fetch(url, { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`Не удалось загрузить файл (${res.status})`);
  await cache.put(url, res.clone());
}

export async function removeAudioFromCache(filePath: string | undefined): Promise<void> {
  if (!isCacheApiAvailable()) return;
  const url = resolveMediaUrl(filePath);
  const cache = await caches.open(OFFLINE_AUDIO_CACHE_NAME);
  await cache.delete(url);
}

/**
 * Достаёт ответ из Cache Storage и отдаёт blob:-URL для <audio>.
 * Без этого при оффлайне элемент <audio src="/uploads/..."> не читает кэш напрямую (только через SW или blob).
 */
export async function getCachedAudioObjectUrl(filePath: string | undefined): Promise<string | null> {
  if (!filePath || !isCacheApiAvailable()) return null;
  const url = resolveMediaUrl(filePath);
  const cache = await caches.open(OFFLINE_AUDIO_CACHE_NAME);
  const res = await cache.match(url);
  if (!res) return null;
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
