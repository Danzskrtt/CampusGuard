DO $$
DECLARE
  function_record record;
BEGIN
  FOR function_record IN
    SELECT
      p.oid,
      p.proname,
      pg_get_function_identity_arguments(p.oid) AS identity_arguments
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'get_dashboard_summary',
        'get_visitor_log',
        'get_daily_stats',
        'get_peak_hours',
        'get_purpose_breakdown',
        'send_announcement'
      )
  LOOP
    EXECUTE format(
      'GRANT EXECUTE ON FUNCTION public.%I(%s) TO authenticated',
      function_record.proname,
      function_record.identity_arguments
    );
  END LOOP;
END
$$;
