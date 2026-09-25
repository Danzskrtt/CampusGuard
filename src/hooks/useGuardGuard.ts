import { GUARD_DB } from '@/constants/guard';
import { GUARD_ROLE } from '@/constants/admin';
import { supabase } from '@/supabase';
import { useEffect, useState } from 'react';

export type GuardProfile = {
  id: string;
  full_name: string;
  role: string;
  is_active: boolean;
  avatar_path: string | null;
  employee_id?: string | null;
};

export function useGuardGuard() {
  const [state, setState] = useState<{ loading: boolean; profile: GuardProfile | null }>({ loading: true, profile: null });

  useEffect(() => {
    let alive = true;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        if (alive) setState({ loading: false, profile: null });
        return;
      }
      const { data } = await supabase
        .from(GUARD_DB.profiles)
        .select('id, full_name, role, is_active, avatar_path, employee_id')
        .eq('id', user.id)
        .single();
      const profile = data?.role === GUARD_ROLE && data.is_active ? data as GuardProfile : null;
      if (alive) setState({ loading: false, profile });
    })();
    return () => { alive = false; };
  }, []);

  return state;
}
