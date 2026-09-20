import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { ADMIN_ROLE, T } from '@/constants/admin';

export type AdminProfile = { id: string; full_name: string; role: string; is_active: boolean; avatar_path: string | null };

export function useAdminGuard() {
  const [state, setState] = useState<{ loading: boolean; profile: AdminProfile | null }>({ loading: true, profile: null });

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alive && setState({ loading: false, profile: null });
      let { data } = await supabase.from(T.profiles).select('id, full_name, role, is_active, avatar_path').eq('id', user.id).single();
      if (!data) {
        const fallback = await supabase.from(T.profiles).select('id, full_name, role, is_active').eq('id', user.id).single();
        data = fallback.data ? { ...fallback.data, avatar_path: null } : null;
      }
      const ok = data?.role === ADMIN_ROLE && data.is_active;
      if (alive) setState({ loading: false, profile: ok ? (data as AdminProfile) : null });
    })();
    return () => { alive = false; };
  }, []);

  return state;
}
