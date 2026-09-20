import { supabase } from '@/supabase';
import { PAGE_SIZE, T } from '@/constants/admin';
import { unwrap, useAsync } from '@/hooks/useAsync';
import type { PassInput } from '@/features/admin/components/PassForm';
import { generatePassId, generateQrToken } from '@/utils/pass';

export type Pass = {
  id: string; visitor_name: string; visitor_type: string; company: string | null; host_name: string | null;
  visit_date: string; valid_until: string | null; time_window: string; purpose: string; status: string; pass_id: string; qr_token: string;
};

export function usePasses() {
  const q = useAsync(async () => unwrap<Pass[]>(await supabase.from(T.requests)
    .select('id, visitor_name, visitor_type, company, host_name, visit_date, valid_until, time_window, purpose, status, pass_id, qr_token')
    .eq('source', 'admin').order('created_at', { ascending: false }).limit(PAGE_SIZE)), []);

  // The database trigger approves admin-issued passes and stamps issued_by.
  const issue = async (v: PassInput) => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) throw new Error('You must be signed in to issue a pass.');
    const row = {
      source: 'admin',
      requester_id: authData.user.id,
      issued_by: authData.user.id,
      status: 'approved',
      pass_id: generatePassId(),
      qr_token: generateQrToken(),
      ...v,
      visitor_name: v.visitor_name.trim(),
      company: v.company.trim() || null,
      host_name: v.host_name.trim() || null,
      valid_until: v.valid_until || null,
    };
    const created = unwrap<Pass>(await supabase.from(T.requests).insert(row).select().single());
    q.setData((l) => [created, ...(l ?? [])]);
  };
  return { ...q, issue };
}
