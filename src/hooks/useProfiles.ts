import { GUARD_ROLE, PAGE_SIZE, STUDENT_ROLE, T } from '@/constants/admin';
import { unwrap, useAsync } from '@/hooks/useAsync';
import { supabase } from '@/supabase';
import { createClient } from '@supabase/supabase-js';
import { deleteAvatar, uploadAvatar } from '@/lib/uploadAvatar';

export type Person = { id: string; full_name: string; email: string | null; student_id: string | null; employee_id: string | null; department: string | null; is_active: boolean; avatar_path: string | null };
export type Shift = { id: string; day_of_week: number; start_time: string; end_time: string; is_active: boolean };
export type Guard = Person & { shifts: Shift[] };

const COLS = 'id, full_name, email, student_id, employee_id, department, is_active, avatar_path';
const BASE_COLS = 'id, full_name, email, student_id, employee_id, department, is_active';

async function toggleActive(id: string, value: boolean) {
  const { error } = await supabase.from(T.profiles).update({ is_active: value }).eq('id', id);
  if (error) throw new Error(error.message);
}

async function updatePerson(id: string, changes: Partial<Person>) {
  const { error } = await supabase.from(T.profiles).update(changes).eq('id', id);
  if (error) throw new Error(error.message);
}

async function createPerson(role: string, details: Partial<Person>, password: string, avatarUri?: string | null) {
  const isolatedAuth = createClient(
    process.env.EXPO_PUBLIC_SUPABASE_URL as string,
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
  const email = details.email?.trim();
  if (!email) throw new Error('Email is required.');
  const { data, error } = await isolatedAuth.auth.signUp({ email, password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('The account could not be created.');
  const { error: profileError } = await supabase.from(T.profiles).insert({
    id: data.user.id,
    role,
    full_name: details.full_name?.trim() ?? '',
    email,
    student_id: details.student_id ?? null,
    employee_id: details.employee_id ?? null,
    department: details.department ?? null,
    is_active: true,
    avatar_path: null,
  });
  if (profileError) throw new Error(profileError.message);
  if (avatarUri) {
    const avatarPath = await uploadAvatar(avatarUri, data.user.id);
    const { error: avatarError } = await supabase.from(T.profiles).update({ avatar_path: avatarPath }).eq('id', data.user.id);
    if (avatarError) {
      await deleteAvatar(avatarPath).catch(() => undefined);
      throw new Error('The profile photo could not be saved.');
    }
  }
}

async function deletePerson(id: string) {
  const { error } = await supabase.from(T.profiles).delete().eq('id', id);
  if (error) throw new Error(error.message);
}

export function useGuards() {
  const q = useAsync(async () => {
    const result = await supabase.from(T.profiles)
      .select(`${COLS}, shifts:${T.shifts}!guard_id(id, day_of_week, start_time, end_time, is_active)`)
      .eq('role', GUARD_ROLE).order('full_name');
    if (!result.error) return result.data as Guard[];
    if (!result.error.message.toLowerCase().includes('avatar_path')) throw new Error(result.error.message);
    return unwrap<Guard[]>(await supabase.from(T.profiles)
      .select(`${BASE_COLS}, shifts:${T.shifts}!guard_id(id, day_of_week, start_time, end_time, is_active)`)
      .eq('role', GUARD_ROLE).order('full_name'));
  }, []);
  const setActive = async (id: string, v: boolean) => {
    const previous = q.data?.find((person) => person.id === id)?.is_active;
    q.setData((l) => l?.map((p) => (p.id === id ? { ...p, is_active: v } : p)) ?? null);
    try {
      await toggleActive(id, v);
    } catch (error) {
      q.setData((l) => l?.map((p) => (p.id === id ? { ...p, is_active: previous ?? !v } : p)) ?? null);
      throw error;
    }
  };
  const edit = async (id: string, changes: Partial<Person>) => {
    await updatePerson(id, changes);
    q.setData((list) => list?.map((person) => person.id === id ? { ...person, ...changes } : person) ?? null);
  };
  const add = (details: Partial<Person>, password: string, avatarUri?: string | null) => createPerson(GUARD_ROLE, details, password, avatarUri).then(q.refresh);
  const remove = async (id: string) => { await deletePerson(id); q.setData((list) => list?.filter((person) => person.id !== id) ?? null); };
  return { ...q, setActive, edit, add, remove };
}

export function useStudents(search: string) {
  const q = useAsync(async () => {
    let b = supabase.from(T.profiles).select(COLS).eq('role', STUDENT_ROLE).order('full_name').limit(PAGE_SIZE);
    const s = search.trim().replace(/[,()%]/g, ' ');
    if (s) b = b.or(`full_name.ilike.%${s}%,student_id.ilike.%${s}%,email.ilike.%${s}%`);
    const result = await b;
    if (!result.error) return result.data as Person[];
    if (!result.error.message.toLowerCase().includes('avatar_path')) throw new Error(result.error.message);
    let fallback = supabase.from(T.profiles).select(BASE_COLS).eq('role', STUDENT_ROLE).order('full_name').limit(PAGE_SIZE);
    if (s) fallback = fallback.or(`full_name.ilike.%${s}%,student_id.ilike.%${s}%,email.ilike.%${s}%`);
    return (await fallback).data?.map((profile) => ({ ...profile, avatar_path: null })) as Person[];
  }, [search]);
  const setActive = async (id: string, v: boolean) => {
    const previous = q.data?.find((person) => person.id === id)?.is_active;
    q.setData((l) => l?.map((p) => (p.id === id ? { ...p, is_active: v } : p)) ?? null);
    try {
      await toggleActive(id, v);
    } catch (error) {
      q.setData((l) => l?.map((p) => (p.id === id ? { ...p, is_active: previous ?? !v } : p)) ?? null);
      throw error;
    }
  };
  const edit = async (id: string, changes: Partial<Person>) => {
    await updatePerson(id, changes);
    q.setData((list) => list?.map((person) => person.id === id ? { ...person, ...changes } : person) ?? null);
  };
  const add = (details: Partial<Person>, password: string, avatarUri?: string | null) => createPerson(STUDENT_ROLE, details, password, avatarUri).then(q.refresh);
  const remove = async (id: string) => { await deletePerson(id); q.setData((list) => list?.filter((person) => person.id !== id) ?? null); };
  return { ...q, setActive, edit, add, remove };
}
