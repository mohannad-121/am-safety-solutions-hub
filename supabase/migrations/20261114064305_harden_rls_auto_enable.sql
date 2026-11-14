-- Event trigger functions do not need to be callable through the Data API.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
