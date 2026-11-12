-- Restrict Facility management privileges to Facility administrators.
-- CONTENT_ADMIN and OPERATIONS_ADMIN are central Portal roles, not Facility
-- administrators. They must not inherit write access through is_manager().
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.app_role() IN (
    'SUPER_ADMIN',
    'FACILITY_ADMIN',
    'admin',
    'dean',
    'deputy_dean',
    'finance_head',
    'section_head'
  );
$function$;

COMMENT ON FUNCTION public.is_manager() IS
  'Facility domain manager check. Central roles allowed: SUPER_ADMIN and FACILITY_ADMIN only; legacy Facility operational manager roles remain supported.';
