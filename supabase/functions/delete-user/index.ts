import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

const json = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
});

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const userId = typeof body?.userId === 'string' ? body.userId : null;

    if (!userId) return json({ error: 'User ID is required.' }, 400);

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const authorization = req.headers.get('Authorization');

    if (!supabaseUrl || !serviceRoleKey || !authorization) {
      return json({ error: 'The delete service is not configured.' }, 500);
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const token = authorization.replace(/^Bearer\s+/i, '');
    const { data: { user }, error: userError } = await admin.auth.getUser(token);
    if (userError || !user) return json({ error: 'You must be signed in to delete users.' }, 401);
    if (user.id === userId) return json({ error: 'You cannot delete your own account.' }, 400);

    const { data: adminProfile, error: adminProfileError } = await admin
      .from('profiles')
      .select('role, is_active')
      .eq('id', user.id)
      .single();
    if (adminProfileError || adminProfile?.role !== 'admin' || !adminProfile.is_active) {
      return json({ error: 'Only active administrators can delete users.' }, 403);
    }

    const { data: target, error: targetError } = await admin
      .from('profiles')
      .select('id, role, avatar_path')
      .eq('id', userId)
      .single();
    if (targetError || !target) return json({ error: 'User profile not found.' }, 404);
    if (!['student', 'guard'].includes(target.role)) return json({ error: 'Only students and guards can be deleted.' }, 400);

    const { error: authDeleteError } = await admin.auth.admin.deleteUser(userId);
    if (authDeleteError) return json({ error: authDeleteError.message }, 500);

    const { error: profileDeleteError } = await admin.from('profiles').delete().eq('id', userId);
    if (profileDeleteError) return json({ error: profileDeleteError.message }, 500);

    if (target.avatar_path) {
      const storagePath = target.avatar_path.startsWith('avatars/') ? target.avatar_path.slice('avatars/'.length) : target.avatar_path;
      await admin.storage.from('avatars').remove([storagePath]).catch(() => undefined);
    }

    return json({ ok: true, userId });
  } catch (error) {
    console.error('delete-user failed', error);
    return json({ error: error instanceof Error ? error.message : 'Unexpected error.' }, 500);
  }
});
