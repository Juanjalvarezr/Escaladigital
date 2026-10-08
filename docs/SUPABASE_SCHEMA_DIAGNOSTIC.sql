-- Run this in Supabase SQL Editor and inspect every result before migrations.

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN (
    'users', 'companies', 'company_members', 'profiles',
    'user_progress', 'user_lessons', 'user_quizzes', 'user_diagnostics',
    'saved_lessons', 'user_settings', 'module_feedback',
    'analytics_events', 'tool_clicks', 'learning_events',
    'process_academy_plans', 'company_profiles',
    'business_processes', 'business_actions'
  )
ORDER BY table_name, ordinal_position;

SELECT
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_name AS referenced_table,
  ccu.column_name AS referenced_column
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON kcu.constraint_name = tc.constraint_name
 AND kcu.table_schema = tc.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
 AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name IN (
    'users', 'companies', 'company_members', 'user_progress',
    'user_lessons', 'user_quizzes', 'user_diagnostics',
    'learning_events', 'process_academy_plans',
    'business_processes', 'business_actions'
  )
ORDER BY tc.table_name, tc.constraint_name;

SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
