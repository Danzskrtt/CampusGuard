-- Student profile avatars.
-- This migration is intentionally not applied by the coding agent.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_path text;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "avatars_admin_select" ON storage.objects;
DROP POLICY IF EXISTS "avatars_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "avatars_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "avatars_admin_delete" ON storage.objects;
DROP POLICY IF EXISTS "avatars_owner_select" ON storage.objects;

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
    AND (storage.foldername(name))[1] = 'students'
    AND (storage.foldername(name))[2] IS NOT NULL
    AND name ~ '^students/[^/]+/[0-9]+\.jpg$'
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
      AND name ~ '^students/[^/]+/[0-9]+\.jpg$'
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
      AND name ~ '^students/[^/]+/[0-9]+\.jpg$'
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
      AND name ~ '^students/[^/]+/[0-9]+\.jpg$'
  );

CREATE POLICY "avatars_owner_select"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = 'students'
    AND (storage.foldername(name))[2] = (SELECT auth.uid())::text
  );

NOTIFY pgrst, 'reload schema';
