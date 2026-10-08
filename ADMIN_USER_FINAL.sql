-- 🔐 CREAR USUARIO ADMIN ESPECÍFICO
-- =====================================

-- Insertar usuario administrador único
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
  '550e8400-e29b-41d4-a716-446655440000'::uuid_generate_v4(),
  'admin@escala.digitial.com',
  NOW(),
  NULL,
  NULL,
  NOW(),
  NOW(),
  '{"name": "Administrador Principal", "role": "admin", "level": "super"}',
  true
);

-- Crear perfil completo del admin
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
  '550e8400-e29b-41d4-a716-446655440000',
  'admin@escala.digitial.com',
  'Administrador Principal',
  'Escala Digital Platform',
  'Educación Tecnológica',
  ARRAY['administración', 'educación', 'tecnología'],
  NULL,
  NOW(),
  NOW()
);

-- Nota: Ejecutar en SQL Editor de Supabase
-- Usuario: admin@escala.digitial.com
-- Contraseña: escala2024
