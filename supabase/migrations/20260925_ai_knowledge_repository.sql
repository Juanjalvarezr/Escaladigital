-- Tabla para la Librería Mayor de Conocimientos IA
CREATE TABLE IF NOT EXISTS public.ai_knowledge_repository (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  niche TEXT NOT NULL DEFAULT 'General',
  area_id TEXT NOT NULL DEFAULT 'management',
  summary TEXT,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  quizzes JSONB DEFAULT '[]'::jsonb,
  times_generated INT DEFAULT 1,
  times_completed INT DEFAULT 0,
  rating_score NUMERIC(3,2) DEFAULT 5.0,
  source TEXT DEFAULT 'ai_generated',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Políticas RLS para lectura pública y escritura autenticada
ALTER TABLE public.ai_knowledge_repository ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura publica de la libreria de conocimientos"
  ON public.ai_knowledge_repository FOR SELECT
  USING (true);

CREATE POLICY "Permitir insercion autenticada en la libreria"
  ON public.ai_knowledge_repository FOR INSERT
  WITH CHECK (true);

-- Indices para búsqueda rápida por nicho y área
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_niche ON public.ai_knowledge_repository(niche);
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_area ON public.ai_knowledge_repository(area_id);
