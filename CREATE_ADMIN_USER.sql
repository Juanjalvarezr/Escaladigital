-- 🔐 CREAR USUARIO ADMIN EN SUPABASE
-- =====================================

-- Insertar usuario administrador
INSERT INTO auth.users (
  id,
  email,
  email_confirmed_at,
  phone,
  phone_confirmed_at,
  created_at,
  last_sign_in_at,
  raw_user_meta_data,
  is_super_admin
) VALUES (
  gen_random_uuid(),
  'admin@escala-digital.com',
  NOW(),
  NULL,
  NULL,
  NOW(),
  NOW(),
  '{"name": "Admin User", "role": "admin"}',
  true
);

-- Crear perfil de usuario
INSERT INTO public.profiles (
  id,
  email,
  display_name,
  company,
  industry,
  interests,
  default_company_id,
  created_at,
  last_login
) VALUES (
  gen_random_uuid(),
  'admin@escala.digital.com',
  'Administrador',
  'Escala Digital',
  'Tecnología Educativa',
  ARRAY['admin', 'superadmin'],
  NULL,
  NOW(),
  NOW()
);

-- Nota: Ejecutar esto en el SQL Editor de Supabase
-- O crear el usuario manualmente desde el panel de autenticación
