-- Student requests remain pending until an admin issues the QR pass.
-- Pending rows therefore do not have a pass_id yet.
ALTER TABLE public.visitor_requests
  ALTER COLUMN pass_id DROP NOT NULL;
