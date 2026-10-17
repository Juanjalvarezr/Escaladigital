-- ============================================================
--  ESCALA DIGITAL — SQL MAESTRO DEFINITIVO
--  Ejecuta este archivo completo en el SQL Editor de Supabase
--  Proyecto: https://xymfoqajotosdepudonh.supabase.co
--
--  INSTRUCCIONES:
--  1. Ve a https://supabase.com/dashboard/project/xymfoqajotosdepudonh
--  2. Clic en "SQL Editor" en el menú izquierdo
--  3. Pega TODO este contenido
--  4. Clic en "Run" (o Ctrl+Enter)
--
--  SEGURO: Usa DROP IF EXISTS para limpiar tablas viejas
--  sin romper auth.users ni configuraciones del proyecto.
-- ============================================================

-- ============================================================
-- PASO 1: Limpiar tablas antiguas (en orden por dependencias)
-- ============================================================
DROP TABLE IF EXISTS business_actions CASCADE;
DROP TABLE IF EXISTS business_processes CASCADE;
DROP TABLE IF EXISTS learning_events CASCADE;
DROP TABLE IF EXISTS analytics_events CASCADE;
DROP TABLE IF EXISTS tool_clicks CASCADE;
DROP TABLE IF EXISTS saved_lessons CASCADE;
DROP TABLE IF EXISTS user_diagnostics CASCADE;
DROP TABLE IF EXISTS user_quizzes CASCADE;
DROP TABLE IF EXISTS user_lessons CASCADE;
DROP TABLE IF EXISTS user_progress CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS user_analytics CASCADE;
DROP TABLE IF EXISTS user_settings CASCADE;
DROP TABLE IF EXISTS certificates CASCADE;
DROP TABLE IF EXISTS company_members CASCADE;
DROP TABLE IF EXISTS company_profiles CASCADE;
DROP TABLE IF EXISTS companies CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;


-- ============================================================
-- PASO 2: Tabla de perfiles de usuario
-- Vinculada directamente a auth.users de Supabase Auth
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  display_name TEXT,
  company TEXT,
  industry TEXT,
  role TEXT,
  avatar_url TEXT,
  interests TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- PASO 3: Tabla de empresas
-- ============================================================
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry TEXT,
  profile_json JSONB DEFAULT '{}'::jsonb,
  profile_version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- PASO 4: Perfiles extendidos de empresa
-- ============================================================
CREATE TABLE company_profiles (
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE PRIMARY KEY,
  legal_name TEXT,
  industry TEXT,
  company_size TEXT,
  country_code TEXT,
  city TEXT,
  website TEXT,
  business_model TEXT,
  description TEXT,
  primary_challenge TEXT,
  goals JSONB DEFAULT '[]'::jsonb,
  profile_version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- PASO 5: Miembros de empresa (soporta roles)
-- ============================================================
CREATE TABLE company_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  areas TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, user_id)
);


-- ============================================================
-- PASO 6: Progreso del usuario por modulo
-- Esta es la tabla mas importante para el funcionamiento del app
-- ============================================================
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completion_percentage INTEGER DEFAULT 0,
  quiz_score INTEGER,
  lessons_completed TEXT[] DEFAULT '{}',
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);


-- ============================================================
-- PASO 7: Lecciones generadas por usuario
-- ============================================================
CREATE TABLE user_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  module_id TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  summary TEXT DEFAULT '',
  key_points TEXT[] DEFAULT '{}',
  "order" INTEGER NOT NULL DEFAULT 1,
  duration INTEGER DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);


-- ============================================================
-- PASO 8: Quizzes completados por usuario
-- ============================================================
CREATE TABLE user_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  module_id TEXT NOT NULL,
  questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  user_answers INTEGER[] DEFAULT '{}',
  score INTEGER DEFAULT 0,
  passed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id)
);


-- ============================================================
-- PASO 9: Diagnosticos del negocio
-- ============================================================
CREATE TABLE user_diagnostics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  business_type TEXT NOT NULL DEFAULT '',
  main_challenge TEXT NOT NULL DEFAULT '',
  business_description TEXT NOT NULL DEFAULT '',
  scalability_roadmap JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_modules TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- PASO 10: Lecciones guardadas para despues
-- ============================================================
CREATE TABLE saved_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);


-- ============================================================
-- PASO 11: Eventos de aprendizaje (analytics de lecciones)
-- ============================================================
CREATE TABLE learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  module_key TEXT,
  lesson_key TEXT,
  quiz_key TEXT,
  session_id TEXT,
  event_properties JSONB DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- PASO 12: Eventos de analiticas generales
-- ============================================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  session_id TEXT,
  event_name TEXT NOT NULL,
  event_properties JSONB DEFAULT '{}'::jsonb,
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- PASO 13: Clicks en herramientas
-- ============================================================
CREATE TABLE tool_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  tool_key TEXT NOT NULL,
  tool_url TEXT,
  source_type TEXT,
  source_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- PASO 14: Procesos de negocio
-- ============================================================
CREATE TABLE business_processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  process_key TEXT NOT NULL,
  name TEXT NOT NULL,
  area_key TEXT,
  description TEXT,
  owner_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'archived')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- PASO 15: Acciones de negocio (plan 30-60-90 dias)
-- ============================================================
CREATE TABLE business_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  process_id UUID REFERENCES business_processes(id) ON DELETE SET NULL,
  owner_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  horizon_days INTEGER NOT NULL CHECK (horizon_days IN (30, 60, 90)),
  action_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'in_progress', 'done', 'cancelled')),
  due_on DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- PASO 16: Indices para rendimiento
-- ============================================================
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_company_members_company_user ON company_members(company_id, user_id);
CREATE INDEX idx_user_progress_user_module ON user_progress(user_id, module_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
CREATE INDEX idx_user_lessons_user_module ON user_lessons(user_id, module_id);
CREATE INDEX idx_user_quizzes_user_module ON user_quizzes(user_id, module_id);
CREATE INDEX idx_user_diagnostics_user ON user_diagnostics(user_id);
CREATE INDEX idx_saved_lessons_user ON saved_lessons(user_id);
CREATE INDEX idx_learning_events_company ON learning_events(company_id, occurred_at);
CREATE INDEX idx_analytics_events_company ON analytics_events(company_id, created_at);
CREATE INDEX idx_tool_clicks_company ON tool_clicks(company_id, created_at);
CREATE INDEX idx_business_processes_company ON business_processes(company_id);
CREATE INDEX idx_business_actions_company ON business_actions(company_id);
CREATE INDEX idx_business_actions_status ON business_actions(status);


-- ============================================================
-- PASO 17: Habilitar Row Level Security en todas las tablas
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_actions ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- PASO 18: Politicas RLS — Perfiles
-- ============================================================
CREATE POLICY "Usuarios ven su propio perfil"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Usuarios insertan su propio perfil"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Usuarios actualizan su propio perfil"
  ON profiles FOR UPDATE USING (auth.uid() = id);


-- ============================================================
-- PASO 19: Politicas RLS — Progreso del usuario
-- ============================================================
CREATE POLICY "Usuarios ven su propio progreso"
  ON user_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios insertan su propio progreso"
  ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios actualizan su propio progreso"
  ON user_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Usuarios eliminan su propio progreso"
  ON user_progress FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- PASO 20: Politicas RLS — Lecciones de usuario
-- ============================================================
CREATE POLICY "Usuarios ven sus propias lecciones"
  ON user_lessons FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios gestionan sus propias lecciones"
  ON user_lessons FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- PASO 21: Politicas RLS — Quizzes de usuario
-- ============================================================
CREATE POLICY "Usuarios ven sus propios quizzes"
  ON user_quizzes FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios gestionan sus propios quizzes"
  ON user_quizzes FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- PASO 22: Politicas RLS — Diagnosticos
-- ============================================================
CREATE POLICY "Usuarios ven sus propios diagnosticos"
  ON user_diagnostics FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios gestionan sus propios diagnosticos"
  ON user_diagnostics FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- PASO 23: Politicas RLS — Lecciones guardadas
-- ============================================================
CREATE POLICY "Usuarios ven sus lecciones guardadas"
  ON saved_lessons FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Usuarios gestionan sus lecciones guardadas"
  ON saved_lessons FOR ALL USING (auth.uid() = user_id);


-- ============================================================
-- PASO 24: Politicas RLS — Empresas
-- ============================================================
CREATE POLICY "Usuarios crean empresas"
  ON companies FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Miembros ven sus empresas"
  ON companies FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = companies.id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners y admins gestionan sus empresas"
  ON companies FOR ALL USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = companies.id
        AND cm.user_id = auth.uid()
        AND cm.role IN ('owner', 'admin')
    )
  );


-- ============================================================
-- PASO 25: Politicas RLS — Miembros de empresa
-- ============================================================
CREATE POLICY "Usuarios crean su membresia inicial"
  ON company_members FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND user_id = auth.uid()
    AND role = 'owner'
  );

CREATE POLICY "Miembros ven membresias de su empresa"
  ON company_members FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = company_members.company_id
        AND cm.user_id = auth.uid()
    )
  );


-- ============================================================
-- PASO 26: Politicas RLS — Procesos y acciones de negocio
-- ============================================================
CREATE POLICY "Miembros ven procesos de su empresa"
  ON business_processes FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = business_processes.company_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Miembros gestionan procesos de su empresa"
  ON business_processes FOR ALL USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = business_processes.company_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Miembros ven acciones de su empresa"
  ON business_actions FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = business_actions.company_id
        AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Miembros gestionan acciones de su empresa"
  ON business_actions FOR ALL USING (
    EXISTS (
      SELECT 1 FROM company_members cm
      WHERE cm.company_id = business_actions.company_id
        AND cm.user_id = auth.uid()
    )
  );


-- ============================================================
-- PASO 27: Trigger para crear perfil automaticamente al registrarse
-- Esto es CLAVE: cuando alguien se registra con Auth,
-- se crea su fila en profiles automaticamente.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, display_name, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ============================================================
-- PASO 28: Trigger para actualizar updated_at automaticamente
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON user_progress
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_business_processes_updated_at
  BEFORE UPDATE ON business_processes
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_business_actions_updated_at
  BEFORE UPDATE ON business_actions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


-- ============================================================
-- FIN DEL SCRIPT
-- Si llegaste aqui sin errores, tu base de datos esta lista.
-- ============================================================
