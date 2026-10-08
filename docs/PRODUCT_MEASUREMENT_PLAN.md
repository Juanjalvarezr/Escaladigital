# Plan de medicion y retroalimentacion beta

## Objetivo

Medir si Escala Digital ayuda a una empresa a pasar de **entender** un problema a **aprender**, **aplicar** una acción y **observar** un resultado.

## Embudo principal

1. **Activación:** registro -> diagnóstico terminado -> primera recomendación abierta.
2. **Aprendizaje:** primera lección iniciada -> lección completada -> quiz aprobado.
3. **Aplicación:** proceso creado -> acción con responsable -> acción completada.
4. **Impacto:** métrica definida -> valor actualizado -> autoevaluación de resultado.
5. **Retención:** regreso en 7 días y actividad en 30 días.

## Eventos canónicos

Usar nombres estables y propiedades pequeñas:

- `signup_completed`
- `diagnostic_completed`
- `roadmap_viewed`
- `lesson_started`
- `lesson_completed`
- `quiz_started`
- `quiz_completed`
- `quiz_passed`
- `process_created`
- `action_created`
- `action_completed`
- `metric_defined`
- `metric_updated`
- `feedback_submitted`
- `sync_failed`

Cada evento debe incluir, cuando exista:

- `company_id`
- `user_id`
- `session_id`
- `module_key`/`lesson_key`/`quiz_key`
- `event_properties`
- `occurred_at`

No registrar respuestas sensibles, contraseñas, claves API ni texto empresarial completo.

## Métricas semanales

| Métrica | Definición |
| --- | --- |
| Activación | Usuarios que terminan diagnóstico / usuarios registrados |
| Primera acción | Usuarios que crean una acción / usuarios activados |
| Aprendizaje | Lecciones completadas por usuario activo |
| Dominio | Quizzes aprobados / quizzes enviados |
| Aplicación | Acciones completadas / acciones creadas |
| Retención D7 | Usuarios con actividad siete días después del registro |
| Salud de sincronización | Eventos remotos exitosos / intentos remotos |
| Feedback útil | Feedback enviado con contexto / sesiones activas |

Reportar también denominadores y tamaño de muestra. Nunca mostrar porcentajes sin datos como si fueran reales.

## Cadencia de beta

- Día 0: onboarding y diagnóstico.
- Día 2: revisar si inició una lección.
- Día 7: entrevista de 15 minutos y revisión de primera acción.
- Día 14: revisar bloqueo principal y necesidad de guía.
- Día 30: medir acción completada, resultado percibido e intención de continuar.

## Checklist operativo

- [ ] Cada empresa piloto tiene un `company_id` verificable.
- [ ] Los datos demo están separados de los datos reales.
- [ ] Se registra si la sesión está sincronizada o en modo local.
- [ ] Se puede exportar el avance de una empresa antes de cambiar migraciones.
- [ ] Se prueba aislamiento RLS con dos usuarios.
- [ ] Los errores de sincronización aparecen en UI y en métricas.
- [ ] Un responsable revisa semanalmente eventos anómalos y feedback.
- [ ] Se eliminan o anonimizan datos de pilotos al cerrar la prueba si lo solicitan.

## Preguntas de entrevista

- ¿Qué esperabas que ocurriera después del diagnóstico?
- ¿Qué término o gráfico no entendiste?
- ¿Qué acción aplicaste fuera de la plataforma?
- ¿Qué te impidió completar la siguiente acción?
- ¿Qué evidencia te demostraría que la herramienta te ayudó?
- ¿Qué parte volverías a usar la próxima semana?

## Criterio para ampliar la beta

Ampliar solo cuando durante dos semanas consecutivas:

- la mayoría de usuarios activados termina una primera lección;
- existe al menos una acción creada por empresa;
- no hay pérdidas de datos confirmadas;
- los errores de sincronización son visibles y recuperables;
- el equipo puede explicar cada métrica del panel con datos reales.
