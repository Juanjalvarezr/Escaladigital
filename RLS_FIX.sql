-- Fix RLS: platform_admins (recursion) + ensure user_diagnostics insertable
-- Ejecutar en SQL Editor de Supabase (copiar desde este archivo, NO desde chat)

-- 1) Eliminar TODAS las policies existentes en platform_admins (evita recursión)
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='platform_admins' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.platform_admins', pol.policyname);
  END LOOP;
END $$;

-- 2) Policy no recursiva: cada admin solo ve su propia fila
CREATE POLICY "platform_admins self read" ON public.platform_admins
  FOR SELECT USING (auth.uid() = user_id);

-- 3) user_diagnostics: asegurar policy no recursiva (recrear limpia)
DROP POLICY IF EXISTS "Users manage own diagnostics v2" ON public.user_diagnostics;
CREATE POLICY "Users manage own diagnostics v2" ON public.user_diagnostics
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4) Verificación
SELECT 'platform_admins policies:' AS info;
SELECT policyname, cmd FROM pg_policies WHERE schemaname='public' AND tablename='platform_admins';
SELECT 'user_diagnostics policies:' AS info;
SELECT policyname, cmd FROM pg_policies WHERE schemaname='public' AND tablename='user_diagnostics';