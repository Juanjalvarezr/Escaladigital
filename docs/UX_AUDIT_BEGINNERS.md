# Auditoria UX independiente para principiantes

Fecha: 2026-09-08  
Alcance: onboarding, dashboard, navegacion de areas/modulos, perfil, academia de procesos, estados de datos y flujo Supabase.  
Metodo: lectura de componentes y prueba manual en Chrome local con viewport de 390 x 844 CSS px (el documento reporto 375 px de ancho util).

## Resumen ejecutivo

La experiencia tiene una ruta inicial clara y lenguaje visual consistente, pero un principiante puede quedar desorientado por tres problemas de alto impacto:

1. La interfaz comunica una aplicacion conectada aunque los datos puedan estar en modo local; con Supabase no configurado se observaron errores de red en consola antes del fallback.
2. El dashboard desborda horizontalmente en movil: `document.documentElement.scrollWidth` fue 440 frente a 375 px de ancho util.
3. Varias tarjetas se comportan como botones sin semantica de teclado y el menu de perfil presenta tres destinos visualmente distintos que navegan al mismo `/profile`.

Prioridad recomendada: corregir primero feedback de persistencia/error, responsive del dashboard y navegacion por teclado; despues unificar vocabulario y estados vacios.

## Hallazgos accionables

| ID | Severidad | Hallazgo y evidencia | Riesgo para principiantes | Accion recomendada |
| --- | --- | --- | --- | --- |
| UX-01 | P0 | El arranque intenta `signInAnonymously()` y, sin variables Supabase validas, registra `Failed to fetch`/`ERR_NAME_NOT_RESOLVED` antes de crear el usuario local. La pantalla solo muestra “Iniciando sesión anónima...” durante la espera. Ver [SupabaseAuthProvider.tsx](../src/components/SupabaseAuthProvider.tsx). | Puede parecer que la app esta rota o que los datos se perdieron; no hay decision visible entre modo local y nube. | Mostrar un estado explicito y persistente: “Modo local: tus avances quedan en este dispositivo” y una accion para reintentar conexion. Diferenciar “sin conexion” de “sesion iniciada”. |
| UX-02 | P0 | En viewport movil se midio `clientWidth=375` y `scrollWidth=440` en `/dashboard`. El header, chips de acceso y widgets compiten por ancho. | El usuario debe hacer scroll lateral para descubrir contenido; controles pueden quedar fuera de pantalla. | Usar `min-w-0`, envolver o convertir chips en menu, y comprobar cada breakpoint con overflow horizontal bloqueado (`scrollWidth <= clientWidth`). |
| UX-03 | P1 | [AreaCard.tsx](../src/components/AreaCard.tsx) y las tarjetas de [AreaPage.tsx](../src/pages/AreaPage.tsx) son `div` con `onClick` y `cursor-pointer`; solo el boton interno aparece en el arbol accesible. | Teclado y lectores de pantalla no tienen un objetivo unico; el usuario puede activar el boton interno y la tarjeta a la vez. | Convertir la tarjeta completa en `button`/enlace semantico, o eliminar el click del contenedor y dejar un unico CTA con nombre contextual. Añadir foco visible. |
| UX-04 | P1 | El menu de [ProfileMenu.tsx](../src/components/ProfileMenu.tsx) no expone `aria-expanded`, `aria-haspopup` ni etiqueta del boton; “Mi perfil”, “Configuración” y “Mi progreso” navegan los tres a `/profile`. | El usuario no sabe que cambio hizo ni como volver; teclado/lector no recibe estado del menu. | Implementar destinos reales o reducirlo a un solo enlace hasta que existan tabs/rutas separadas. Añadir `aria-expanded`, cierre con Escape y foco al abrir/cerrar. |
| UX-05 | P1 | El fallback de carga de progreso en [DashboardPage.tsx](../src/pages/DashboardPage.tsx) y [AreaPage.tsx](../src/pages/AreaPage.tsx) presenta ceros como si fueran progreso real cuando falla Supabase. | “0%” puede interpretarse como que el usuario no ha hecho nada, no como que no se pudo sincronizar. | Modelar `loading`, `ready`, `offline` y `error` por separado. Mostrar banner con “No pudimos sincronizar; mostrando datos locales” y no sobrescribir datos conocidos con ceros. |
| UX-06 | P1 | Hay estados vacios poco accionables: quiz “No se pudo cargar la evaluación” sin reintento; la academia puede quedar solo en guardado local; dashboard sin diagnóstico usa una tarjeta genérica. | El principiante llega a un callejon sin salida y no sabe si esperar, reintentar o continuar. | Cada estado vacio debe incluir causa breve, accion primaria (“Reintentar”, “Volver al área”) y alternativa local si aplica. |
| UX-07 | P1 | Spinners y mensajes (“Cargando aplicación”, “Sincronizando Torre de Control”) no usan `role="status"`/`aria-live`; varios botones no tienen estilos de foco dedicados. Ver [App.tsx](../src/App.tsx) y [DashboardPage.tsx](../src/pages/DashboardPage.tsx). | Usuarios de teclado o lector no perciben cambios de estado; el foco puede perderse durante navegacion. | Añadir regiones de estado anunciables, mantener foco tras cambios de ruta y usar `:focus-visible` con contraste suficiente. |
| UX-08 | P1 | El producto mezcla “Torre de Control”, “Pilares”, “Madurez”, “Academia”, “Horizonte 30/60/90” y “Lecciones Activas” sin glosario. El acceso “Simulador de Precios” navega a toda el area financiera. | El usuario novato no puede predecir que encontrara al hacer clic. | Preferir etiquetas concretas (“Ver finanzas”, “Lecciones”, “Progreso”), añadir una frase de ayuda la primera vez y hacer que cada CTA coincida con su destino. |
| UX-09 | P2 | Contraste potencialmente bajo en textos pequeños `text-gray-500`/`text-[10px]` sobre fondos oscuros, y etiquetas basadas en color/emoji (progreso, estado, nivel). | Lectura dificil en movil o baja vision; el color no comunica por si solo el estado. | Medir WCAG AA en texto normal y pequeño; elevar grises secundarios, no usar solo color, y añadir texto/ícono con nombre accesible. |
| UX-10 | P2 | El onboarding guarda cada campo en `localStorage`, pero no muestra “guardado” ni botón Atrás visible por paso; el indicador visual de pasos no tiene texto por segmento. Ver [UserActivityForm.tsx](../src/components/UserActivityForm.tsx). | El usuario teme perder respuestas y puede no entender cómo corregir el paso anterior. | Añadir estado “Guardado en este dispositivo”, botones Atrás/Siguiente consistentes y una lista de pasos accesible (`aria-current="step"`). |
| UX-11 | P2 | El quiz permite avanzar hasta enviar sin validar respuestas faltantes y los errores de persistencia solo van a consola. Ver [SupabaseQuizView.tsx](../src/components/SupabaseQuizView.tsx). | Puede recibir una nota inesperada o creer que el resultado se guardó cuando no fue así. | Bloquear “Siguiente/Enviar” hasta responder, indicar “Pregunta n de m”, y mostrar confirmación/error visible con reintento. |

## Navegacion y arquitectura de informacion

- La unica navegacion global visible en dashboard es perfil/idioma; para volver se depende de botones contextuales. Añadir un camino consistente a Dashboard desde area, modulo, leccion, quiz y academia.
- “Configuración” y “Mi progreso” deben ser rutas o tabs reales. Si no existen, no deben presentarse como opciones distintas.
- Los redirects legacy en [App.tsx](../src/App.tsx) son utiles para enlaces antiguos, pero conviene mostrar breadcrumb legible en vez de depender de rutas tecnicas.
- Las acciones de “Simulador de Precios” y “Simulador de Ventas” parecen accesos directos, pero llevan a un area completa; renombrar o crear destino específico.

## Checklist de pruebas manuales de navegador

### Preparacion

- [ ] Probar en Chrome y Firefox con ventana 1440, 1024, 768, 390 y 320 px; confirmar que no existe scroll horizontal accidental.
- [ ] Probar zoom 200% y 400%; verificar que contenido y CTAs siguen siendo utilizables.
- [ ] Activar emulacion de `prefers-reduced-motion`; confirmar que spinners/animaciones no impiden leer ni navegar.
- [ ] Ejecutar solo con teclado: Tab, Shift+Tab, Enter, Space y Escape; confirmar foco visible, orden logico y ausencia de trampas.
- [ ] Usar lector de pantalla (NVDA/VoiceOver): verificar nombres de botones, estado de carga, progreso y errores.

### Flujo de principiante

- [ ] Abrir una sesion nueva y entender en menos de 10 segundos que hace “Iniciar Diagnóstico IA” y que implica “Ir directo al Dashboard”.
- [ ] Completar los 3 pasos del onboarding con un campo invalido, volver al paso anterior y confirmar que los datos se conservan.
- [ ] Recargar durante onboarding y confirmar mensaje de datos locales/recuperacion.
- [ ] Forzar fallo de red durante generación IA: ver error visible, accion de reintento y datos no duplicados.
- [ ] Entrar a dashboard sin diagnóstico: distinguir recomendación genérica de ruta personalizada.
- [ ] Abrir un pilar con mouse y teclado; confirmar que la tarjeta no requiere hacer clic en un area no semantica.
- [ ] Completar una leccion, avanzar/anterior, volver al area y confirmar que progreso y CTA cambian.
- [ ] Completar quiz con respuesta faltante, aprobar, reprobar y reintentar; confirmar mensajes visibles y persistencia.
- [ ] Abrir menu de perfil, navegar cada opción, cerrar con Escape y hacer click fuera; confirmar destinos distintos o menu simplificado.
- [ ] En movil, rotar a horizontal/vertical y verificar que header, chips, radar, tarjetas y botones siguen accesibles.

## Checklist manual de Supabase

- [ ] Confirmar `REACT_APP_SUPABASE_URL` y `REACT_APP_SUPABASE_ANON_KEY` presentes en el entorno de prueba; registrar versión y proyecto, sin exponer claves.
- [ ] Verificar que Anonymous Sign-Ins esta habilitado o que el modo local se comunica antes de cualquier llamada fallida.
- [ ] Probar sesión nueva, recarga, cierre de sesión y sesión expirada; confirmar que no se mezclan datos entre usuarios/anónimos.
- [ ] Verificar RLS de `users`, `profiles`, `user_progress`, `user_quizzes`, `quizzes`, `user_settings`, `user_diagnostics` y `process_academy_plans`: cada usuario solo lee/escribe sus filas.
- [ ] Con Network throttling “Offline”, confirmar que el producto muestra modo local y no reemplaza progreso por ceros.
- [ ] Con una respuesta 401/403/5xx, verificar mensaje visible, reintento y que no se anuncia “Sincronizado”.
- [ ] Completar onboarding y comprobar que `profiles`/`user_diagnostics` se guardan una sola vez y con el `user_id` correcto.
- [ ] Completar leccion y quiz; comprobar actualización coherente de `user_progress`, `user_quizzes` y porcentajes del dashboard.
- [ ] Editar Academia de Procesos offline, volver online y comprobar si la sincronización remota conserva la edición más reciente sin sobrescribirla.
- [ ] Revisar errores de consola y requests duplicados tras recargar; el cliente no debe crear múltiples instancias GoTrue ni repetir inserts.
- [ ] Confirmar índices/constraints para `(user_id, module_id)` y `process_academy_plans.user_id` para que los upserts sean deterministas.

## Criterios de salida sugeridos

- `scrollWidth === clientWidth` en todos los breakpoints soportados.
- 100% de controles accionables alcanzables por teclado y con nombre accesible.
- Todo estado de carga, vacío y error tiene causa, siguiente acción y alternativa.
- Ningún mensaje dice “Sincronizado” si la última operación remota falló.
- Prueba RLS negativa confirmada: un usuario no puede leer ni modificar filas de otro usuario.
