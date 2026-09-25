DROP POLICY IF EXISTS "avatars_admin_select" ON storage.objects;
DROP POLICY IF EXISTS "avatars_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_admin_delete" ON storage.objects;

CREATE POLICY "avatars_admin_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
        AND profiles.is_active = true
    )
    AND name ~ '^(students|admins)/[^/]+/[0-9]+\.jpg$'
  );

CREATE POLICY "avatars_admin_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
        AND profiles.is_active = true
    )
    AND name ~ '^(students|admins)/[^/]+/[0-9]+\.jpg$'
  );

CREATE POLICY "avatars_admin_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
        AND profiles.is_active = true
    )
    AND name ~ '^(students|admins)/[^/]+/[0-9]+\.jpg$'
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
        AND profiles.is_active = true
    )
    AND name ~ '^(students|admins)/[^/]+/[0-9]+\.jpg$'
  );

CREATE POLICY "avatars_admin_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'admin'
        AND profiles.is_active = true
    )
    AND name ~ '^(students|admins)/[^/]+/[0-9]+\.jpg$'
  );
