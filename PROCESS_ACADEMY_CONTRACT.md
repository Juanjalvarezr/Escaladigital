# Contrato de persistencia: Academia de Procesos

La primera versión funciona sin cambios de configuración: guarda el plan en `localStorage` con la clave `escala:processAcademy:v1`. Cuando existe sesión, intenta sincronizar con Supabase en `process_academy_plans`; si la tabla aún no existe, conserva el plan local y muestra el estado al usuario.

## Tabla esperada en Supabase

```sql
create table public.process_academy_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  plan jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.process_academy_plans enable row level security;
create policy "Users manage their process academy plan"
  on public.process_academy_plans for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

`plan` conserva el contrato `ProcessAcademyPlan` versión `1`: procesos por `areaId`, `maturity` (1-5), `status`, `responsible`, `metric` y acciones con `dueDate`, `horizon` (30/60/90) y `status`.

Este archivo documenta el contrato esperado; no modifica la configuración ni el esquema actual de Supabase.
