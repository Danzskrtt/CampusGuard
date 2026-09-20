import { useCallback, useEffect, useRef, useState } from 'react';

export function unwrap<T>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data as T;
}

export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef(fn);
  useEffect(() => { ref.current = fn; }, [fn]);
  const run = useCallback(async () => {
    setLoading(true);
    try { setData(await ref.current()); setError(null); }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    const task = setTimeout(() => { void run(); }, 0);
    return () => clearTimeout(task);
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return { data, loading, error, refresh: run, setData };
}

export function useDebounced<T>(value: T, ms = 300) {
  const [v, setV] = useState(value);
  useEffect(() => { const t = setTimeout(() => setV(value), ms); return () => clearTimeout(t); }, [value, ms]);
  return v;
}
