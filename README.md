# Escala Digital - Super App de Aprendizaje Adaptativo

Una Súper App de aprendizaje adaptativo y diagnóstico empresarial diseñada para transformar negocios tradicionales en entidades digitales altamente rentables.

## 🚀 Características Principales

- **Diagnóstico Inteligente**: IA que analiza tu negocio y genera una hoja de ruta personalizada
- **8 Áreas de Crecimiento**: Gerencia, Ventas, Marketing, Operaciones, Finanzas, Tecnología, Talento y Cliente
- **Lecciones Dinámicas**: Contenido generado por IA adaptado a tu contexto empresarial
- **Evaluaciones Adaptativas**: Quizzes personalizados que evalúan comprensión práctica
- **Gamificación**: Sistema de progreso, insignias y desbloqueo de niveles
- **Conversión Inteligente**: Triggers automáticos para servicios premium

## 🛠️ Stack Tecnológico

- **Frontend**: React.js + TypeScript + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth)
- **IA**: Google Gemini (modelo configurado en `src/services/gemini.ts`)
- **PWA**: Instalable sin App Store
- **Diseño**: Dark Mode con acentos en azul eléctrico y violeta

## 🎯 Alcance MVP (producto mínimo viable)

- **Flujo 1: Diagnóstico**
  - Formulario (nombre contacto, empresa, industria, descripción, desafío, intereses)
  - Generación de ruta (Gemini + fallback determinístico si falla)
  - Persistencia: se guarda en `user_diagnostics` (si hay sesión) y en `localStorage` (para no repetir al recargar)

- **Flujo 2: Ruta + Dashboard**
  - Mostrar ruta y módulos recomendados
  - Progreso por áreas con porcentajes
  - Acción "Rehacer diagnóstico" para regenerar ruta

- **Flujo 3: Módulos / Lecciones / Quiz**
  - Lecciones y quizzes guardados en Supabase (`user_lessons`, `user_quizzes`, `user_progress`)
  - Evitar cargas infinitas (timeouts en IA)

- **Flujo 4: Base para escalamiento (empresa + equipo + analítica)**
  - Modelo `companies` + `company_members` (roles: owner/admin/member)
  - Eventos de analítica (seguimiento de uso) en `analytics_events`
  - Señales de herramientas (clics/testigos) en `tool_clicks`

## 📋 Configuración Inicial

### 1. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com/dashboard)
2. Ve a Settings > Database para crear las tablas usando el SQL proporcionado
3. Copia el archivo `database-setup.sql` en el SQL Editor de Supabase
4. Ve a Settings > API para obtener tus credenciales
5. Copia las credenciales en `src/supabase.ts`

Notas:
- El esquema incluye soporte para **empresa** y **múltiples usuarios por empresa** (roles y áreas).
- El esquema incluye tablas de **analítica** para entender: cuántos usuarios, de dónde vienen, qué ven, cuánto duran, y qué herramientas clican.

### 2. Configurar Gemini AI

1. Obtén tu API key en [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Reemplaza la API key en `src/services/gemini.ts`

### 3. Instalar Dependencias

```bash
npm install
```

### 4. Ejecutar la Aplicación

```bash
npm start
```

Abre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

## 📱 PWA - Instalación

La aplicación es una Progressive Web App (PWA). Para instalarla:

1. Abre la aplicación en Chrome/Safari
2. Busca el ícono de "Agregar a pantalla de inicio"
3. Sigue las instrucciones

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── SupabaseAuthProvider.tsx # Gestión de autenticación (Supabase)
│   ├── SupabaseDiagnosticEnhanced.tsx   # Diagnóstico (Supabase)
│   ├── SupabaseLessonView.tsx   # Vista de lecciones (Supabase)
│   ├── SupabaseQuizView.tsx     # Sistema de evaluaciones (Supabase)
│   └── ModuleNavigation.tsx # Navegación de módulos
├── pages/              # Páginas principales
│   ├── SupabaseDashboard.tsx    # Panel principal
│   └── SupabaseModulePage.tsx   # Página de módulos
├── services/           # Servicios externos
│   └── gemini.ts       # Integración con Gemini AI
├── types/              # Definiciones TypeScript
│   └── index.ts
├── supabase.ts         # Configuración Supabase
└── App.tsx            # Componente principal
```

## 🔥 Funcionalidades Detalladas

### Diagnóstico de Entrada
- Formulario inteligente que captura información del negocio
- IA analiza y genera hoja de ruta escalable
- Recomendaciones personalizadas por área

## ✅ Implementado recientemente

- **No repetir diagnóstico al recargar**
  - Persistencia del formulario en `localStorage` (`escala:diagnosticForm:v1`)
  - Persistencia del último resultado en `localStorage` (`escala:latestDiagnosticResult:v1`)
  - El dashboard rehidrata y guarda el último diagnóstico al cargar
  - Botón "Rehacer diagnóstico" para limpiar y volver al formulario

- **Ruta basada en malla de 8 módulos (fallback)**
  - Si Gemini falla (404 u otros), se genera una ruta por módulos con temas y beneficios

- **Mitigación de spinners infinitos (IA)**
  - Timeouts en `analyzeBusiness`, `generateLessonContent` y `generateQuizQuestions`

- **Módulos usando componentes Supabase**
  - `SupabaseModulePage` utiliza `SupabaseLessonView` / `SupabaseQuizView`

## 🧠 Backlog de ideas (producto)

- **UI/UX mobile-first**
  - Tarjetas grandes por módulo
  - Header sticky con "Volver" y accesos rápidos
  - Barra inferior (Inicio / Ruta / Progreso / Perfil)

- **Lecciones en formato tarjetas (claridad extrema)**
  - Tarjeta "Qué es" (definición simple)
  - Tarjeta "Por qué importa" (impacto)
  - Tarjeta "Cómo aplicarlo" (pasos)
  - Tarjeta "Ejemplo" (como para niños, con analogías)
  - Tarjeta "Errores comunes"
  - Tarjeta "Checklist" / "Plantilla" descargable
  - Tarjeta "Herramientas recomendadas" según necesidad

- **Herramientas internas (mini-apps) según la empresa**
  - Calculadora de costos y margen
  - Calculadora de punto de equilibrio
  - Plantilla de guión de ventas y manejo de objeciones
  - Checklist de inventario / logística
  - Plantilla de presupuesto de marketing

- **Aprendizaje adaptativo y gamificación**
  - Recomendación de "siguiente tema" y "repaso" según rendimiento
  - "Tema aleatorio" para explorar áreas nuevas sin aburrimiento
  - Rachas (streaks) y micro-retos semanales

### Sistema de Aprendizaje
- 5 lecciones por módulo con contenido dinámico
- Progresión bloqueada por completitud
- Opción de "Guardar para después"

### Evaluaciones Adaptativas
- 5 preguntas por módulo generadas por IA
- Contextualizadas al tipo de negocio
- Sistema de aprobación con 70% mínimo

### Gamificación
- Barras de progreso por módulo
- Insignias de completamiento
- Niveles: Principiante → Intermedio → Avanzado → Experto

### Embudo de Conversión
- Trigger VIP al completar 3+ módulos
- CTAs estratégicos en lecciones técnicas
- Reportes de valor por email

## 🎨 Diseño y UX

- **Dark Mode**: Fondo #0F0F23 para reducir fatiga visual
- **Acentos**: Azul eléctrico (#0080FF) y Violeta (#8B5CF6)
- **Tipografía**: Inter para legibilidad óptima
- **Responsive**: Adaptado a móviles y tablets
- **Minimalista**: Enfoque en contenido y acción

## 📊 Estructura de Datos (Supabase)

```
companies - Perfil de empresa (contexto para personalización)
├── id: UUID primario
├── name: nombre de empresa
├── industry: industria
├── profile_json: JSON con contexto (precios, procesos, etc.)
├── profile_version: versión para invalidar caché de personalización
└── created_at / updated_at

users - Perfiles de usuario
├── id: UUID primario
├── email: correo electrónico
├── display_name: nombre visible
├── company: empresa del usuario
├── industry: industria/categoría
├── interests: áreas de interés
├── default_company_id: empresa actual por defecto
├── created_at: fecha de creación
└── last_login: último acceso

company_members - Miembros de empresa (equipo)
├── company_id: referencia a companies
├── user_id: referencia a users
├── role: owner | admin | member
└── areas: array de áreas (Ventas, Operaciones, etc.)

user_progress - Progreso por módulo
├── user_id: referencia a users
├── module_id: ID del módulo (management, sales, etc.)
├── status: not_started | in_progress | completed
├── completion_percentage: 0-100
├── quiz_score: puntaje del quiz
├── lessons_completed: array de lecciones completadas
└── last_accessed: último acceso al módulo

user_lessons - Lecciones generadas por IA
├── user_id: referencia a users
├── lesson_id: ID único de lección
├── module_id: módulo al que pertenece
├── title: título de la lección
├── content: contenido completo
├── summary: resumen ejecutivo
├── key_points: puntos clave
├── order: orden en el módulo
└── duration: duración en minutos

user_quizzes - Evaluaciones
├── user_id: referencia a users
├── module_id: módulo evaluado
├── questions: array de preguntas
├── user_answers: respuestas del usuario
├── score: puntaje obtenido
├── passed: si aprobó o no
└── completed_at: fecha de completación

user_diagnostics - Diagnósticos iniciales
├── user_id: referencia a users
├── business_type: tipo de negocio
├── main_challenge: desafío principal
├── business_description: descripción del negocio
├── scalability_roadmap: hoja de ruta JSON
└── recommended_modules: módulos recomendados

saved_lessons - Lecciones guardadas para después
├── user_id: referencia a users
├── lesson_id: ID de la lección
└── saved_at: fecha de guardado

analytics_events - Eventos de analítica (company-scoped)
├── company_id: empresa
├── user_id: usuario (opcional)
├── event_name: nombre del evento (page_view, lesson_open, quiz_start, etc.)
├── event_properties: JSONB con datos del evento
└── created_at: fecha

tool_clicks - Clics/señales de herramientas
├── company_id: empresa
├── user_id: usuario (opcional)
├── tool_key: identificador de herramienta (ej: "calc_margen")
├── tool_url: URL si aplica
├── source_type/source_id: referencia a la lección/módulo que lo mostró
└── created_at: fecha
```

## 📈 Analítica (control de data)

- Inserción:
  - Cualquier miembro puede insertar eventos/clics (`INSERT`) para registrar actividad.
- Lectura:
  - Solo `owner/admin` puede consultar analítica (`SELECT`) para control y seguimiento.

Ejemplos de eventos recomendados:
- `page_view` (con `page_path`)
- `diagnostic_submit`
- `module_open`
- `lesson_open`
- `lesson_complete`
- `quiz_start`
- `quiz_submit`

Ejemplos de tool clicks:
- `tool_key`: `calc_margen`, `calc_punto_equilibrio`, `plantilla_script_ventas`
- `metadata`: `{ "cta": "Ver calculadora", "position": "lesson_card_tools" }`

## 🚀 Despliegue

### Build para Producción
```bash
npm run build
```

### Deploy Sugerido
- **Supabase Hosting**: `supabase link` (para desarrollo)
- **Vercel**: Conecta tu repositorio GitHub
- **Netlify**: Arrastra y suelta la carpeta build

## 🔧 Configuración Avanzada

### Variables de Entorno
Crea `.env.local` para configuración sensible:
```
REACT_APP_SUPABASE_URL=tu_supabase_url
REACT_APP_SUPABASE_ANON_KEY=tu_supabase_anon_key
REACT_APP_GEMINI_API_KEY=tu_gemini_key
```

### Reglas RLS (Row Level Security)
Las políticas de seguridad ya están configuradas en el SQL:
- Los usuarios solo pueden acceder a sus propios datos
- RLS habilitado en todas las tablas
- Índices optimizados para rendimiento

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu feature branch (`git checkout -b feature/amazing-feature`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push al branch (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es propiedad de Agencia Deseo Digital.

## 🆘 Soporte

Para soporte técnico, contacta al equipo de desarrollo de Agencia Deseo Digital.
