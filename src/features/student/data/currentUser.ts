import { supabase } from '@/supabase';
import { useEffect, useState } from 'react';

export type CurrentUser = {
  name: string;
  studentId: string;
};

const emptyUser: CurrentUser = { name: '', studentId: '' };

export function useCurrentUser(): CurrentUser {
  const [user, setUser] = useState<CurrentUser>(emptyUser);

  useEffect(() => {
    let active = true;

    const loadUser = async () => {
      const { data: authData } = await supabase.auth.getUser();
      const authUser = authData.user;
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const metadata = authUser.user_metadata as Record<string, unknown> | undefined;
      const profileData = profile as Record<string, unknown> | null;
      const name = String(
        profileData?.full_name ??
          profileData?.name ??
          metadata?.full_name ??
          metadata?.name ??
          authUser.email?.split('@')[0] ??
          '',
      );
      const studentId = String(profileData?.student_id ?? metadata?.student_id ?? '');

      if (active) setUser({ name, studentId });
    };

    void loadUser();
    return () => {
      active = false;
    };
  }, []);

  return user;
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

// "Danz Colibao" -> "Danz C."
export function getShortName(name: string): string {
  const [first, last] = name.split(' ');
  return last ? `${first} ${last[0]}.` : first;
}
