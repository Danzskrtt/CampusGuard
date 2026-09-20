import { AVATAR_BUCKET, AVATAR_EXPIRY_SECONDS, AVATAR_REFRESH_BUFFER_MS } from '@/constants/avatar';
import { supabase } from '@/supabase';
import { useEffect, useState } from 'react';

type CachedUrl = { url: string; expiresAt: number };
const cache = new Map<string, CachedUrl>();

function storagePath(path: string) {
  return path.startsWith(`${AVATAR_BUCKET}/`) ? path.slice(AVATAR_BUCKET.length + 1) : path;
}

export function useAvatarUrls(paths: (string | null | undefined)[]) {
  const normalized = Array.from(new Set(paths.filter((path): path is string => Boolean(path))));
  const key = normalized.join('|');
  const [urls, setUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const load = async () => {
      const now = Date.now();
      if (!normalized.length) {
        setUrls({});
        setLoading(false);
        return;
      }
      const missing = normalized.filter((path) => !cache.has(path) || cache.get(path)!.expiresAt <= now + AVATAR_REFRESH_BUFFER_MS);
      if (!missing.length) {
        setUrls(Object.fromEntries(normalized.map((path) => [path, cache.get(path)!.url])));
        const nextExpiry = Math.min(...normalized.map((path) => cache.get(path)!.expiresAt));
        timer = setTimeout(() => void load(), Math.max(AVATAR_REFRESH_BUFFER_MS, nextExpiry - Date.now() - AVATAR_REFRESH_BUFFER_MS));
        return;
      }
      setLoading(true);
      setError(null);
      const { data, error: signedError } = await supabase.storage.from(AVATAR_BUCKET).createSignedUrls(missing.map(storagePath), AVATAR_EXPIRY_SECONDS);
      if (!alive) return;
      if (signedError) {
        setError('Profile photos could not be loaded.');
        setLoading(false);
        return;
      }
      data?.forEach((item, index) => {
        const path = missing[index];
        if (path && item.signedUrl) cache.set(path, { url: item.signedUrl, expiresAt: Date.now() + AVATAR_EXPIRY_SECONDS * 1000 });
      });
      setUrls(Object.fromEntries(normalized.flatMap((path) => cache.has(path) ? [[path, cache.get(path)!.url]] : [])));
      setLoading(false);
      const nextExpiry = Math.min(...normalized.map((path) => cache.get(path)?.expiresAt ?? Date.now() + AVATAR_EXPIRY_SECONDS * 1000));
      timer = setTimeout(() => void load(), Math.max(AVATAR_REFRESH_BUFFER_MS, nextExpiry - Date.now() - AVATAR_REFRESH_BUFFER_MS));
    };
    void load();
    return () => { alive = false; if (timer) clearTimeout(timer); };
  }, [key]);

  return { urls, loading, error };
}
