-- V1 health check: execute in Supabase SQL Editor.

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'users', 'companies', 'company_members',
    'user_diagnostics', 'user_progress', 'user_lessons', 'user_quizzes',
    'profiles', 'user_settings', 'module_feedback',
    'learning_events', 'process_academy_plans', 'company_profiles',
    'business_processes', 'business_actions'
  )
ORDER BY table_name;

SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'companies', 'company_members',
    'user_diagnostics', 'user_progress', 'user_lessons', 'user_quizzes',
    'profiles', 'user_settings', 'module_feedback',
    'learning_events', 'process_academy_plans', 'company_profiles',
    'business_processes', 'business_actions'
  )
ORDER BY tablename;

SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 'companies', 'company_members',
    'user_diagnostics', 'user_progress', 'user_lessons', 'user_quizzes',
    'profiles', 'user_settings', 'module_feedback',
    'learning_events', 'process_academy_plans', 'company_profiles',
    'business_processes', 'business_actions'
  )
ORDER BY tablename, policyname;

SELECT
  'auth_users' AS source,
  COUNT(*)::INTEGER AS total
FROM auth.users
UNION ALL
SELECT 'app_users', COUNT(*)::INTEGER FROM public.users
UNION ALL
SELECT 'companies', COUNT(*)::INTEGER FROM public.companies
UNION ALL
SELECT 'memberships', COUNT(*)::INTEGER FROM public.company_members
UNION ALL
SELECT 'learning_events', COUNT(*)::INTEGER FROM public.learning_events;
