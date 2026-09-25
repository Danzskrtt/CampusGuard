import { supabase } from '@/supabase';

export type PasswordTargetRole = 'student' | 'guard';

export async function updateCurrentUserPassword(password: string) {
  const trimmed = password.trim();
  if (trimmed.length < 8) throw new Error('Password must be at least 8 characters long.');

  const { error } = await supabase.auth.updateUser({ password: trimmed });
  if (error) throw new Error(error.message);
}

export async function setTemporaryPasswordsForRole(role: PasswordTargetRole, password: string) {
  const trimmed = password.trim();
  if (trimmed.length < 8) throw new Error('Password must be at least 8 characters long.');

  const { data, error } = await supabase.functions.invoke('bulk-set-temporary-passwords', {
    body: { role, password: trimmed },
  });

  if (error) {
    const message = typeof error === 'object' && error && 'message' in error ? String((error as { message?: string }).message) : 'Could not set temporary passwords.';
    throw new Error(message);
  }

  return data as { updated: number; role: PasswordTargetRole } | null;
}
