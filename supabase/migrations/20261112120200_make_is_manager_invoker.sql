-- is_manager() only evaluates the result of app_role(); it does not need
-- elevated table privileges. Run as the caller and let app_role() perform
-- its narrowly scoped profile lookup.
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
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
