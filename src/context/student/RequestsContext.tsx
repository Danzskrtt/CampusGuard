import { RequestStatus, VisitorDraft, VisitorRequest } from '@/features/student/types';
import { supabase } from '@/supabase';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface RequestsContextValue {
  requests: VisitorRequest[];
  addRequests: (drafts: VisitorDraft[]) => Promise<void>;
  updateRequest: (id: string, draft: VisitorDraft) => Promise<void>;
  cancelRequest: (id: string) => Promise<void>;
}

const RequestsContext = createContext<RequestsContextValue | undefined>(undefined);

type RequestRow = {
  id: string;
  visitor_name: string;
  visitor_type: string | null;
  relationship: string | null;
  visitor_email: string;
  visit_date: string;
  time_window: string;
  purpose: string;
  status: RequestStatus;
  pass_id: string | null;
  qr_token: string | null;
  declined_reason: string | null;
};

const REQUEST_COLUMNS = 'id, visitor_name, visitor_type, relationship, visitor_email, visit_date, time_window, purpose, status, pass_id, qr_token, declined_reason';

function toRequest(row: RequestRow): VisitorRequest {
  return {
    id: row.id,
    visitorName: row.visitor_name,
    relationship: row.relationship ?? row.visitor_type ?? 'Other',
    email: row.visitor_email,
    visitDate: row.visit_date,
    timeWindow: row.time_window,
    purpose: row.purpose,
    status: row.status,
    passId: row.pass_id,
    qrToken: row.qr_token,
    declinedReason: row.declined_reason ?? undefined,
  };
}

export function RequestsProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<VisitorRequest[]>([]);

  const loadRequests = useCallback(async () => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) {
      setRequests([]);
      return;
    }

    const { data, error } = await supabase
      .from('visitor_requests')
      .select(REQUEST_COLUMNS)
      .eq('requester_id', authData.user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setRequests((data as RequestRow[]).map(toRequest));
  }, []);

  const addRequests = useCallback(async (drafts: VisitorDraft[]) => {
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError) throw authError;
    if (!authData.user) throw new Error('You must be signed in to submit a request.');

    const rows = drafts.map((d) => ({
      requester_id: authData.user.id,
      visitor_name: d.fullName.trim(),
      visitor_type: 'guest',
      relationship: d.relationship,
      visitor_email: d.email.trim(),
      visit_date: d.visitDate,
      time_window: d.timeWindow,
      purpose: d.purpose,
      status: 'pending',
      pass_id: null,
      qr_token: null,
      declined_reason: null,
      source: 'student',
    }));
    const { error } = await supabase.from('visitor_requests').insert(rows);
    if (error) {
      if (error.code === '42501') throw new Error('Only admins can issue visitor passes.');
      throw error;
    }
    await loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    const task = setTimeout(() => {
      void loadRequests().catch(() => setRequests([]));
    }, 0);
    const channel = supabase
      .channel('student-requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'visitor_requests' }, () => {
        void loadRequests().catch(() => undefined);
      })
      .subscribe();
    return () => { clearTimeout(task); void supabase.removeChannel(channel); };
  }, [loadRequests]);

  const updateRequest = useCallback(async (id: string, d: VisitorDraft) => {
    const { error } = await supabase.from('visitor_requests').update({
      visitor_name: d.fullName.trim(),
      relationship: d.relationship,
      visitor_email: d.email.trim(),
      visit_date: d.visitDate,
      time_window: d.timeWindow,
      purpose: d.purpose,
    }).eq('id', id).eq('status', 'pending');
    if (error) throw error;
    await loadRequests();
  }, [loadRequests]);

  const cancelRequest = useCallback(async (id: string) => {
    const { error } = await supabase.from('visitor_requests').delete().eq('id', id).eq('status', 'pending');
    if (error) throw error;
    setRequests((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const value = useMemo(
    () => ({ requests, addRequests, updateRequest, cancelRequest }),
    [requests, addRequests, updateRequest, cancelRequest],
  );

  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}

export function useRequests(): RequestsContextValue {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error('useRequests must be used inside <RequestsProvider>');
  return ctx;
}
