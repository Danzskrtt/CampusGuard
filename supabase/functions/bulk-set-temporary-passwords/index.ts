import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.54.0';

Deno.serve(async (req) => {
  try {
    const body = await req.json().catch(() => ({}));
    const role = typeof body?.role === 'string' ? body.role : null;
    const password = typeof body?.password === 'string' ? body.password : null;

    if (!role || !password) {
      return new Response(JSON.stringify({ error: 'Role and password are required.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!['student', 'guard'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Role must be student or guard.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters long.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Supabase service role is not configured for this function.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const { data: profiles, error: profileError } = await admin
      .from('profiles')
      .select('id')
      .eq('role', role)
      .eq('is_active', true);

    if (profileError) {
      return new Response(JSON.stringify({ error: profileError.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userIds = (profiles ?? []).map((profile: { id: string }) => profile.id).filter(Boolean);
    let updated = 0;

    for (const userId of userIds) {
      const { error: updateError } = await admin.auth.admin.updateUserById(userId, { password });
      if (updateError) {
        console.error('Password update failed for user', userId, updateError.message);
        continue;
      }
      updated += 1;
    }

    return new Response(JSON.stringify({ ok: true, role, updated }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('bulk-set-temporary-passwords failed', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
