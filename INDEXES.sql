-- Indices para escalabilidad (Escala Digital)
CREATE INDEX IF NOT EXISTS idx_company_members_company_user ON public.company_members(company_id, user_id);
CREATE INDEX IF NOT EXISTS idx_company_members_user ON public.company_members(user_id);
CREATE INDEX IF NOT EXISTS idx_user_diagnostics_user_created ON public.user_diagnostics(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_module ON public.user_progress(user_id, module_id);
EOF