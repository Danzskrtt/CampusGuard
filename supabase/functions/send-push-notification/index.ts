import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

type WebhookPayload = {
  type?: string;
  table?: string;
  record?: Record<string, unknown>;
  old_record?: Record<string, unknown> | null;
};

type PushMessage = {
  to: string;
  title: string;
  body: string;
  sound: string;
  data?: Record<string, string>;
};

type NotificationEvent = {
  userIds: string[];
  title: string;
  body: string;
  sound: string;
};

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

function stringValue(record: Record<string, unknown>, key: string) {
  return typeof record[key] === 'string' ? record[key] : null;
}

async function canEmitVisitorRequestEvent(
  admin: ReturnType<typeof createClient>,
  request: Request,
  payload: WebhookPayload,
): Promise<boolean> {
  const authorization = request.headers.get('Authorization');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!authorization || !anonKey) return false;

  const userClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authorization } },
  });
  const { data: authData } = await userClient.auth.getUser();
  if (!authData.user) return false;

  const record = payload.record ?? {};
  if (payload.type === 'INSERT') return stringValue(record, 'requester_id') === authData.user.id;
  if (payload.type !== 'UPDATE') return false;

  const { data: profile } = await admin.from('profiles').select('role').eq('id', authData.user.id).maybeSingle();
  return profile?.role === 'admin';
}

async function activeUserIds(admin: ReturnType<typeof createClient>, role: string) {
  const { data, error } = await admin.from('profiles').select('id').eq('role', role).eq('is_active', true);
  if (error) throw error;
  return (data ?? []).map((profile: { id: string }) => profile.id);
}

async function notificationRecipients(admin: ReturnType<typeof createClient>, payload: WebhookPayload): Promise<NotificationEvent | null> {
  const record = payload.record ?? {};
  const table = payload.table;
  const event = payload.type;

  if (table === 'messages' && event === 'INSERT') {
    const recipientId = stringValue(record, 'recipient_id');
    return recipientId ? { userIds: [recipientId], title: 'New message', body: stringValue(record, 'body') ?? 'You have a new message.', sound: 'messagesnotifsound.mp3' } : null;
  }

  if (table === 'notifications' && event === 'INSERT') {
    const userId = stringValue(record, 'user_id') ?? stringValue(record, 'recipient_id');
    const role = stringValue(record, 'role');
    const userIds = userId ? [userId] : role ? await activeUserIds(admin, role) : [];
    return userIds.length ? { userIds, title: stringValue(record, 'title') ?? 'CampusGuard notification', body: stringValue(record, 'body') ?? '', sound: 'alertandnotifstudentadmin.mp3' } : null;
  }

  if (table === 'visitor_requests') {
    const status = stringValue(record, 'status');
    const oldStatus = stringValue(payload.old_record ?? {}, 'status');
    const requesterId = stringValue(record, 'requester_id');
    const visitorName = stringValue(record, 'visitor_name') ?? 'visitor';

    if (event === 'INSERT' && status === 'pending') {
      const userIds = await activeUserIds(admin, 'admin');
      return userIds.length ? { userIds, title: 'New pass approval request', body: `${visitorName} needs a visitor pass approved.`, sound: 'pendingapprovaladmin.mp3' } : null;
    }

    if (event === 'UPDATE' && status && status !== oldStatus && ['approved', 'rejected'].includes(status) && requesterId) {
      return {
        userIds: [requesterId],
        title: status === 'approved' ? 'Visitor pass approved' : 'Visitor pass rejected',
        body: status === 'approved' ? `The pass for ${visitorName} is ready.` : `The pass request for ${visitorName} was rejected.`,
        sound: status === 'approved' ? 'studentpassapproved.wav' : 'studentpassrejected.wav',
      };
    }
  }

  if (table === 'entry_logs' && event === 'INSERT') {
    const guardId = stringValue(record, 'guard_id') ?? stringValue(record, 'created_by') ?? stringValue(record, 'user_id');
    const result = stringValue(record, 'result');
    if (guardId && (result === 'granted' || result === 'denied')) {
      return {
        userIds: [guardId],
        title: result === 'granted' ? 'QR pass valid' : 'QR pass invalid',
        body: result === 'granted' ? 'The visitor pass was verified.' : 'The visitor pass was rejected.',
        sound: 'default',
      };
    }
  }

  return null;
}

async function sendExpoMessages(messages: PushMessage[]) {
  for (let index = 0; index < messages.length; index += 100) {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(messages.slice(index, index + 100)),
    });
    if (!response.ok) throw new Error(`Expo push service returned ${response.status}.`);
  }
}

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') return json({ error: 'POST required.' }, 405);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Supabase service role is not configured.' }, 500);

    const payload = await req.json() as WebhookPayload;
    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    if (payload.table === 'visitor_requests' && !await canEmitVisitorRequestEvent(admin, req, payload)) {
      return json({ error: 'Not authorized to emit this visitor request notification.' }, 403);
    }
    const event = await notificationRecipients(admin, payload);
    if (!event) return json({ ok: true, sent: 0 });

    const { data: tokens, error: tokenError } = await admin
      .from('device_push_tokens')
      .select('user_id, expo_push_token')
      .in('user_id', event.userIds);
    if (tokenError) throw tokenError;

    const messages = (tokens ?? []).map((token: { user_id: string; expo_push_token: string }) => ({
      to: token.expo_push_token,
      title: event.title,
      body: event.body,
      sound: event.sound,
      data: { table: payload.table ?? '', type: payload.type ?? '' },
    }));
    if (messages.length) await sendExpoMessages(messages);
    return json({ ok: true, sent: messages.length });
  } catch (error) {
    console.error('send-push-notification failed', error);
    return json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, 500);
  }
});
