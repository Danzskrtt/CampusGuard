import { GUARD_ROLE, T } from '@/constants/admin';
import { useAsync } from '@/hooks/useAsync';
import { supabase } from '@/supabase';
import { useEffect } from 'react';

export type MessageContact = { id: string; full_name: string; role: string; phone: string | null; avatar_path: string | null };
export type DirectMessage = { id: string; sender_id: string; recipient_id: string; body: string; is_read: boolean; created_at: string };
type MessageData = { userId: string; contacts: MessageContact[]; messages: DirectMessage[] };

export function useMessages() {
  const q = useAsync(async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) throw new Error('Your session has expired. Please sign in again.');
    const { data: profile, error: profileError } = await supabase.from(T.profiles).select('role').eq('id', authData.user.id).single();
    if (profileError) throw new Error(profileError.message);
    const otherRole = profile.role === 'admin' ? GUARD_ROLE : 'admin';
    const [contactsResult, messagesResult] = await Promise.all([
      supabase.from(T.profiles).select('id, full_name, role, phone, avatar_path').eq('role', otherRole).eq('is_active', true).order('full_name'),
      supabase.from(T.messages).select('id, sender_id, recipient_id, body, is_read, created_at').or(`sender_id.eq.${authData.user.id},recipient_id.eq.${authData.user.id}`).order('created_at'),
    ]);
    if (contactsResult.error) throw new Error(contactsResult.error.message);
    if (messagesResult.error) throw new Error(messagesResult.error.message);
    return { userId: authData.user.id, contacts: (contactsResult.data ?? []) as MessageContact[], messages: (messagesResult.data ?? []) as DirectMessage[] };
  }, []);

  useEffect(() => {
    const channel = supabase.channel('direct-messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: T.messages }, () => void q.refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [q.refresh]);

  const sendMessage = async (recipientId: string, body: string) => {
    const text = body.trim();
    if (!text || !q.data?.userId) return;
    const { error } = await supabase.from(T.messages).insert({ sender_id: q.data.userId, recipient_id: recipientId, body: text });
    if (error) throw new Error(error.message);
    await q.refresh();
  };

  const markConversationRead = async (senderId: string) => {
    if (!q.data?.userId) return;
    const { error } = await supabase.from(T.messages).update({ is_read: true }).eq('sender_id', senderId).eq('recipient_id', q.data.userId).eq('is_read', false);
    if (error) throw new Error(error.message);
    q.setData((current) => current ? { ...current, messages: current.messages.map((message) => message.sender_id === senderId && message.recipient_id === current.userId ? { ...message, is_read: true } : message) } : current);
  };

  return { ...q, sendMessage, markConversationRead };
}
