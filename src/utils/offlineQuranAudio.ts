// Offline Quran Audio Cache & Manager Utility
// Synchronized with Workbox 'quran-audio-cache' in vite.config.ts
// Fully supports byte-range requests for seeking and offline media playback

export const QURAN_AUDIO_CACHE_NAME = 'quran-audio-cache';
const LEGACY_CACHE_NAME = 'quran-audio-v1';

/**
 * Check if the browser supports CacheStorage
 */
export function isCacheStorageAvailable(): boolean {
  return typeof window !== 'undefined' && 'caches' in window;
}

/**
 * Check if a specific audio URL is cached in 'quran-audio-cache'
 */
export async function isAudioUrlCached(url: string): Promise<boolean> {
  if (!isCacheStorageAvailable() || !url) return false;
  try {
    // Check primary cache
    const cache = await caches.open(QURAN_AUDIO_CACHE_NAME);
    let match = await cache.match(url);
    if (!match && !url.startsWith('http')) {
      match = await cache.match(new Request(url));
    }
    if (match) return true;

    // Check legacy cache if needed
    const legacyCache = await caches.open(LEGACY_CACHE_NAME);
    const legacyMatch = await legacyCache.match(url);
    if (legacyMatch) {
      // Migrate to primary cache
      await cache.put(url, legacyMatch.clone());
      return true;
    }

    return false;
  } catch (err) {
    console.warn('Cache check error:', err);
    return false;
  }
}

/**
 * Retrieve cached audio response from 'quran-audio-cache'
 */
export async function getCachedAudioResponse(url: string): Promise<Response | null> {
  if (!isCacheStorageAvailable() || !url) return null;
  try {
    const cache = await caches.open(QURAN_AUDIO_CACHE_NAME);
    let match = await cache.match(url);
    if (!match) {
      const legacyCache = await caches.open(LEGACY_CACHE_NAME);
      match = await legacyCache.match(url);
    }
    return match || null;
  } catch (err) {
    console.warn('Failed to retrieve cached audio response:', err);
    return null;
  }
}

/**
 * Retrieve a cached audio Response as a Range-ready Blob URL with audio/mpeg MIME type
 */
export async function getCachedAudioBlobUrl(url: string): Promise<string | null> {
  if (!isCacheStorageAvailable() || !url) return null;
  try {
    const response = await getCachedAudioResponse(url);
    if (!response) return null;
    const blob = await response.blob();
    // Ensure standard audio/mpeg MIME type for broad browser media player compatibility
    const mpegBlob = blob.type === 'audio/mpeg' ? blob : new Blob([blob], { type: 'audio/mpeg' });
    return URL.createObjectURL(mpegBlob);
  } catch (err) {
    console.warn('Failed to retrieve cached audio blob:', err);
    return null;
  }
}

/**
 * Handle HTTP Range requests for an in-memory Audio Blob.
 * When media elements or audio contexts seek past buffered regions,
 * this slices the blob according to the Range header and returns a 206 Partial Content Response.
 */
export function handleBlobRangeRequest(
  blob: Blob,
  rangeHeader?: string | null,
  contentType: string = 'audio/mpeg'
): {
  slice: Blob;
  start: number;
  end: number;
  total: number;
  status: number;
  headers: Record<string, string>;
} {
  const total = blob.size;

  if (!rangeHeader || !rangeHeader.startsWith('bytes=')) {
    return {
      slice: blob,
      start: 0,
      end: total > 0 ? total - 1 : 0,
      total,
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': total.toString(),
        'Accept-Ranges': 'bytes'
      }
    };
  }

  const rangeParts = rangeHeader.replace(/bytes=/, '').split('-');
  const start = parseInt(rangeParts[0], 10) || 0;
  const rawEnd = rangeParts[1] ? parseInt(rangeParts[1], 10) : total - 1;
  const end = Math.min(rawEnd, total > 0 ? total - 1 : 0);
  const chunkSize = end - start + 1;

  const slice = blob.slice(start, end + 1, contentType);

  return {
    slice,
    start,
    end,
    total,
    status: 206,
    headers: {
      'Content-Type': contentType,
      'Content-Length': chunkSize.toString(),
      'Content-Range': `bytes ${start}-${end}/${total}`,
      'Accept-Ranges': 'bytes'
    }
  };
}

/**
 * Download and cache an audio file into 'quran-audio-cache'
 * Explicitly provides Accept-Ranges, Content-Type: audio/mpeg, and Content-Length
 * so Workbox's RangeRequestsPlugin and browser media elements can slice it offline.
 */
export async function downloadAndCacheAudio(
  url: string,
  onProgress?: (percent: number) => void
): Promise<boolean> {
  if (!isCacheStorageAvailable() || !url) return false;

  try {
    if (onProgress) onProgress(5);

    // Fetch the audio stream
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok && response.status !== 206) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    const totalBytes = contentLength ? parseInt(contentLength, 10) : 0;

    let responseToCache: Response;

    // If streaming reader is available, track progress
    if (totalBytes > 0 && response.body && onProgress) {
      const reader = response.body.getReader();
      let receivedBytes = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
          receivedBytes += value.length;
          const percent = Math.min(98, Math.round((receivedBytes / totalBytes) * 100));
          onProgress(percent);
        }
      }

      const allChunks = new Uint8Array(receivedBytes);
      let position = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, position);
        position += chunk.length;
      }

      const blob = new Blob([allChunks], { type: 'audio/mpeg' });
      responseToCache = new Response(blob, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': receivedBytes.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000'
        }
      });
    } else {
      // Direct blob fallback
      const blob = await response.blob();
      const mpegBlob = new Blob([blob], { type: 'audio/mpeg' });
      responseToCache = new Response(mpegBlob, {
        status: 200,
        statusText: 'OK',
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': mpegBlob.size.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000'
        }
      });
    }

    // Save in primary 'quran-audio-cache'
    const cache = await caches.open(QURAN_AUDIO_CACHE_NAME);
    await cache.put(url, responseToCache.clone());

    if (onProgress) onProgress(100);
    return true;
  } catch (err) {
    console.error('Failed to download & cache Quran audio:', err);
    return false;
  }
}

/**
 * Remove an audio URL from 'quran-audio-cache'
 */
export async function removeCachedAudio(url: string): Promise<boolean> {
  if (!isCacheStorageAvailable() || !url) return false;
  try {
    const cache = await caches.open(QURAN_AUDIO_CACHE_NAME);
    const deleted = await cache.delete(url);
    const legacy = await caches.open(LEGACY_CACHE_NAME);
    await legacy.delete(url);
    return deleted;
  } catch (err) {
    console.warn('Failed to delete cached audio:', err);
    return false;
  }
}

/**
 * Get all cached audio URLs in 'quran-audio-cache'
 */
export async function getAllCachedAudioUrls(): Promise<string[]> {
  if (!isCacheStorageAvailable()) return [];
  try {
    const cache = await caches.open(QURAN_AUDIO_CACHE_NAME);
    const requests = await cache.keys();
    return requests.map((req) => req.url);
  } catch {
    return [];
  }
}
