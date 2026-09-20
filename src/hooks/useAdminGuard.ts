import { useEffect, useState } from 'react';
import { supabase } from '@/supabase';
import { ADMIN_ROLE, T } from '@/constants/admin';

export type AdminProfile = { id: string; full_name: string; role: string; is_active: boolean };

export function useAdminGuard() {
  const [state, setState] = useState<{ loading: boolean; profile: AdminProfile | null }>({ loading: true, profile: null });

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return alive && setState({ loading: false, profile: null });
      const { data } = await supabase.from(T.profiles).select('id, full_name, role, is_active').eq('id', user.id).single();
      const ok = data?.role === ADMIN_ROLE && data.is_active;
      if (alive) setState({ loading: false, profile: ok ? (data as AdminProfile) : null });
    })();
    return () => { alive = false; };
  }, []);

  return state;
}
