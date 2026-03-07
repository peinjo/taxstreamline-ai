REVOKE EXECUTE ON FUNCTION public.get_internal_service_key() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_internal_service_key() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_internal_service_key() FROM authenticated;