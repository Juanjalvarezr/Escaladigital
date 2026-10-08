# Auditoría de preparación para Supabase

## Estado actual

La aplicación ya tiene dos capas:

- **Demo/local:** funciona con datos locales y `/demo`, sin depender de Supabase.
- **Persistencia remota:** usa Supabase para autenticación, diagnóstico, progreso, quizzes, perfiles, Academia de Procesos y eventos de aprendizaje.

No se debe conectar el proyecto nuevo hasta completar el esquema base y probar RLS.

## Inventario de tablas usadas por el frontend

### Identidad y empresas

- `users`
- `companies`
- `company_members`
- `profiles`
- `user_settings`

### Diagnóstico y aprendizaje

- `user_diagnostics`
- `user_progress`
- `user_lessons`
- `lessons`
- `saved_lessons`
- `user_quizzes`

### Feedback y observabilidad

- `module_feedback`
- `analytics_events`
- `tool_clicks`
- `user_analytics`
- `learning_events`

### Academia y ejecución

- `process_academy_plans`
- `company_profiles`
- `business_processes`
- `business_actions`

Las migraciones nuevas cubren la arquitectura normalizada, Academia y endurecimiento de eventos, pero hay que verificar que las tablas históricas también existan en el proyecto nuevo.

## Orden seguro de conexión

1. Crear el proyecto Supabase exclusivo para Escala Digital.
2. Configurar autenticación y URL permitidas.
3. Ejecutar el esquema base/histórico de la aplicación.
4. Ejecutar, en orden, las migraciones:
   - `20260908005000_v1_core_foundation.sql`
   - `20260908030000_v1_legacy_compatibility.sql`
   - `20260908000000_data_architecture_normalization.sql`
   - `20260908010000_process_academy_company_plan.sql`
   - `20260908020000_learning_events_hardening.sql`
   - `20260908040000_auth_profile_trigger.sql`
5. Revisar errores de SQL y políticas RLS.
6. Configurar `.env.local`:

   ```env
   REACT_APP_SUPABASE_URL=https://<project-ref>.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=<publishable-anon-key>
   ```

7. Crear dos usuarios de prueba y dos empresas.
8. Verificar aislamiento entre empresas.
9. Probar registro, diagnóstico, progreso, quiz, perfil, Academia y eventos.
10. Solo después invitar usuarios beta.

## Revisión de seguridad

- No subir `.env`, `.env.local` ni claves al repositorio.
- La clave de frontend debe ser únicamente la clave pública anon/publishable.
- Rotar cualquier clave Gemini que haya estado expuesta en archivos del proyecto.
- Mantener Gemini detrás del proxy del servidor; no poner claves privadas en React.
- No registrar respuestas sensibles ni texto empresarial completo en eventos.

## Pruebas de aceptación

- [ ] Un usuario puede registrarse e iniciar sesión.
- [ ] Se crea o recupera su empresa sin duplicarla.
- [ ] El diagnóstico se guarda y reaparece tras cerrar sesión.
- [ ] El progreso de lecciones se conserva en otro navegador.
- [ ] El quiz conserva intento, puntuación y estado.
- [ ] Un miembro ve los datos de su empresa.
- [ ] Un miembro no ve datos de otra empresa.
- [ ] Los eventos incluyen empresa y usuario correctos.
- [ ] Un fallo remoto muestra estado visible y no borra datos locales.
- [ ] `/demo` no escribe datos reales.

## Decisión de despliegue

Usar un proyecto Supabase dedicado para Escala Digital. El modo local se conserva como respaldo de desarrollo, no como fuente de verdad para la beta multiusuario.
