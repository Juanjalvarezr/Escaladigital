-- Base de datos completa para Escala Digital App
-- Todas las tablas necesarias para funcionalidad completa

-- Tabla de usuarios y perfiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  company TEXT,
  industry TEXT,
  role TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de áreas de negocio
CREATE TABLE IF NOT EXISTS business_areas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de módulos
CREATE TABLE IF NOT EXISTS modules (
  id TEXT PRIMARY KEY,
  area_id TEXT REFERENCES business_areas(id),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER DEFAULT 60,
  difficulty TEXT DEFAULT 'beginner',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de lecciones
CREATE TABLE IF NOT EXISTS lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES modules(id),
  title TEXT NOT NULL,
  content TEXT, -- JSON con contenido estructurado
  type TEXT DEFAULT 'lesson', -- lesson, quiz, assignment
  duration_minutes INTEGER DEFAULT 30,
  order_index INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  module_id TEXT REFERENCES modules(id),
  title TEXT NOT NULL,
  questions JSONB NOT NULL, -- Array de preguntas
  passing_score INTEGER DEFAULT 70,
  time_limit_minutes INTEGER DEFAULT 30,
  attempts_allowed INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de progreso de usuario
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  module_id TEXT REFERENCES modules(id),
  lesson_id TEXT REFERENCES lessons(id),
  quiz_id TEXT REFERENCES quizzes(id),
  status TEXT DEFAULT 'not_started', -- not_started, in_progress, completed, failed
  completion_percentage INTEGER DEFAULT 0,
  score INTEGER, -- Para quizzes
  time_spent_minutes INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, module_id, lesson_id, quiz_id)
);

-- Tabla de respuestas de quizzes
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  quiz_id TEXT REFERENCES quizzes(id),
  answers JSONB NOT NULL, -- Respuestas del usuario
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  time_taken_minutes INTEGER,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de certificados
CREATE TABLE IF NOT EXISTS certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  module_id TEXT REFERENCES modules(id),
  certificate_url TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  certificate_code TEXT UNIQUE
);

-- Tabla de analytics
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL, -- lesson_started, lesson_completed, quiz_started, quiz_completed, module_completed
  module_id TEXT REFERENCES modules(id),
  lesson_id TEXT REFERENCES lessons(id),
  quiz_id TEXT REFERENCES quizzes(id),
  metadata JSONB, -- Datos adicionales del evento
  session_duration_minutes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de configuración de usuario
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) UNIQUE,
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  language TEXT DEFAULT 'es',
  theme TEXT DEFAULT 'light',
  daily_goal_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar datos iniciales de áreas de negocio
INSERT INTO business_areas (id, name, description, icon, color, order_index) VALUES
('management', 'Gestión', 'Herramientas de administración y gestión empresarial', 'briefcase', 'blue', 1),
('sales', 'Ventas', 'Técnicas y estrategias de venta', 'trending-up', 'green', 2),
('marketing', 'Marketing', 'Estrategias de marketing digital y tradicional', 'megaphone', 'purple', 3),
('finance', 'Finanzas', 'Gestión financiera y contabilidad', 'dollar-sign', 'yellow', 4),
('operations', 'Operaciones', 'Optimización de procesos operativos', 'cog', 'red', 5),
('hr', 'Recursos Humanos', 'Gestión del talento y cultura organizacional', 'users', 'indigo', 6),
('technology', 'Tecnología', 'Herramientas tecnológicas y digitalización', 'cpu', 'gray', 7),
('strategy', 'Estrategia', 'Planificación estratégica y desarrollo de negocio', 'target', 'orange', 8)
ON CONFLICT (id) DO NOTHING;

-- Insertar módulos iniciales para cada área
INSERT INTO modules (id, area_id, title, description, duration_minutes, difficulty, order_index) VALUES
-- Gestión
('management-module-1', 'management', 'Fundamentos de Gestión', 'Conceptos básicos de administración empresarial y gestión de equipos', 120, 'beginner', 1),
('management-module-2', 'management', 'Liderazgo Efectivo', 'Desarrollo de habilidades de liderazgo y motivación de equipos', 180, 'intermediate', 2),
('management-module-3', 'management', 'Gestión de Proyectos', 'Metodologías y herramientas para gestión exitosa de proyectos', 240, 'intermediate', 3),

-- Ventas
('sales-module-1', 'sales', 'Técnicas de Venta', 'Fundamentos y técnicas modernas de venta', 90, 'beginner', 1),
('sales-module-2', 'sales', 'Venta Consultiva', 'Métodos de venta basados en consultoría y valor', 150, 'intermediate', 2),
('sales-module-3', 'sales', 'Gestión de Clientes', 'CRM y estrategias de retención de clientes', 120, 'intermediate', 3),

-- Marketing
('marketing-module-1', 'marketing', 'Marketing Digital', 'Fundamentos de marketing en canales digitales', 100, 'beginner', 1),
('marketing-module-2', 'marketing', 'Redes Sociales', 'Estrategias de marketing en redes sociales', 80, 'beginner', 2),
('marketing-module-3', 'marketing', 'SEO y SEM', 'Optimización para motores de búsqueda y publicidad pagada', 140, 'intermediate', 3),

-- Finanzas
('finance-module-1', 'finance', 'Finanzas Básicas', 'Conceptos fundamentales de gestión financiera', 110, 'beginner', 1),
('finance-module-2', 'finance', 'Presupuestos', 'Elaboración y control de presupuestos empresariales', 130, 'intermediate', 2),
('finance-module-3', 'finance', 'Análisis Financiero', 'Herramientas para análisis de estados financieros', 160, 'advanced', 3),

-- Operaciones
('operations-module-1', 'operations', 'Gestión de Procesos', 'Optimización y mejora de procesos empresariales', 100, 'beginner', 1),
('operations-module-2', 'operations', 'Lean Manufacturing', 'Principios de manufactura esbelta y eliminación de desperdicios', 140, 'intermediate', 2),
('operations-module-3', 'operations', 'Gestión de Calidad', 'Sistemas y herramientas para control de calidad', 120, 'intermediate', 3),

-- Recursos Humanos
('hr-module-1', 'hr', 'Reclutamiento', 'Procesos y mejores prácticas para atraer talento', 90, 'beginner', 1),
('hr-module-2', 'hr', 'Capacitación', 'Diseño e implementación de programas de capacitación', 110, 'intermediate', 2),
('hr-module-3', 'hr', 'Cultura Organizacional', 'Construcción y mantenimiento de cultura empresarial', 130, 'intermediate', 3),

-- Tecnología
('technology-module-1', 'technology', 'Transformación Digital', 'Fundamentos de digitalización empresarial', 120, 'beginner', 1),
('technology-module-2', 'technology', 'Herramientas SaaS', 'Selección e implementación de software como servicio', 100, 'intermediate', 2),
('technology-module-3', 'technology', 'Ciberseguridad', 'Protección de activos digitales y datos', 150, 'advanced', 3),

-- Estrategia
('strategy-module-1', 'strategy', 'Planificación Estratégica', 'Fundamentos de planificación a largo plazo', 140, 'beginner', 1),
('strategy-module-2', 'strategy', 'Análisis Competitivo', 'Herramientas para análisis de competencia', 110, 'intermediate', 2),
('strategy-module-3', 'strategy', 'Innovación', 'Procesos y cultura de innovación empresarial', 160, 'advanced', 3)
ON CONFLICT (id) DO NOTHING;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_module_id ON user_progress(module_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_status ON user_progress(status);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON user_analytics(created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own progress" ON user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON user_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own quiz attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own quiz attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own certificates" ON certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own certificates" ON certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" ON user_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON user_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own settings" ON user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own settings" ON user_settings FOR UPDATE USING (auth.uid() = user_id);
