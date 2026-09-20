-- Student requests receive a QR token only after admin approval.
ALTER TABLE public.visitor_requests
  ALTER COLUMN qr_token DROP NOT NULL;
