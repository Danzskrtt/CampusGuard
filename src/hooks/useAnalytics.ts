import { supabase } from '@/supabase';
import { RPC } from '@/constants/admin';
import { unwrap, useAsync } from '@/hooks/useAsync';
import { daysAgo, isoDay } from '@/utils/dates';

export type DailyStat = { day: string; requests_submitted: number; passes_approved: number; passes_rejected: number; entries: number; denied_scans: number };
export type PeakHour = { hour_of_day: number; entries: number };
export type Purpose = { visit_purpose: string; total: number };

export function useAnalytics(days: number) {
  return useAsync(async () => {
    const range = { p_from: isoDay(daysAgo(days - 1)), p_to: isoDay(new Date()) };
    const [daily, peak, purposes] = await Promise.all([
      supabase.rpc(RPC.dailyStats, range), supabase.rpc(RPC.peakHours, range), supabase.rpc(RPC.purposes, range),
    ]);
    return { daily: unwrap<DailyStat[]>(daily), peak: unwrap<PeakHour[]>(peak), purposes: unwrap<Purpose[]>(purposes) };
  }, [days]);
}
