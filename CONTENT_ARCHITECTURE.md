# Arquitectura de contenido para Escala Digital

## Objetivo
Convertir la app de diagnóstico + aprendizaje en una plataforma útil para negocio real, con:
- contenido pedagógico
- plantillas prácticas
- herramientas recomendadas
- recursos descargables
- progreso real por usuario
- escalabilidad en Supabase

## Principio base
No se debe guardar contenido disperso en archivos sueltos ni como texto rígido dentro del frontend.
Lo ideal es:
1. mantener estructura de contenido en Supabase
2. guardar archivos pesados en Storage de Supabase o Drive
3. dejar el frontend consumiendo registros estructurados
4. mantener el contenido editable y reutilizable

## Estructura recomendada

### 1. Areas
Cada área representa un pilar de crecimiento del negocio.

Campos sugeridos:
- id
- slug
- name
- description
- icon
- color
- order_index
- created_at

### 2. Modules
Cada módulo representa una habilidad o bloque concreto dentro del área.

Campos sugeridos:
- id
- area_id
- slug
- title
- description
- objective
- difficulty
- estimated_duration
- order_index
- created_at

### 3. Lessons
Cada lección es un tema concreto dentro del módulo.

Campos sugeridos:
- id
- module_id
- slug
- title
- summary
- content
- key_points
- learning_objectives
- practical_steps
- example_case
- common_mistakes
- created_at

### 4. Resources
Recursos de apoyo para cada lección o módulo.

Campos sugeridos:
- id
- module_id
- lesson_id (nullable)
- type
- title
- description
- url
- file_name
- file_type
- is_downloadable
- created_at

Tipos posibles:
- article
- video
- template
- pdf
- checklist
- spreadsheet
- guide

### 5. Templates
Herramientas y plantillas muy prácticas para ejecutar.

Campos sugeridos:
- id
- module_id
- name
- description
- type
- file_url
- is_public
- created_at

### 6. Tools
Herramientas recomendadas para aplicar el conocimiento.

Campos sugeridos:
- id
- module_id
- name
- description
- why_it_matters
- difficulty
- price
- url
- created_at

## Estructura útil por módulo
Cada módulo debe tener estas 5 piezas:
1. Concepto base
2. Explicación práctica
3. Checklist
4. Plantilla
5. Herramienta recomendada

## Ejemplo de contenido por área

### Gerencia
- liderazgo estratégico
- toma de decisiones
- comunicación efectiva
- gestión del cambio
- KPI y seguimiento

### Ventas
- prospección
- manejo de objeciones
- cierre de ventas
- seguimiento post-venta
- indicadores de venta

### Marketing
- posicionamiento
- contenido
- ventas digitales
- analítica
- branding

### Operaciones
- procesos
- productividad
- mejora continua
- control de calidad
- tiempos y costos

### Finanzas
- flujo de caja
- presupuesto
- costos y margen
- rentabilidad
- decisiones financieras

### Tecnología
- herramientas digitales
- automatización
- CRM
- analítica
- seguridad básica

### Talento
- liderazgo humano
- onboarding
- motivación
- evaluación y desarrollo
- cultura y procesos

### Cliente
- atención
- experiencia
- seguimiento
- feedback
- lealtad

## Recomendación de integración con Supabase
Trabaja con estas tablas básicas:
- areas
- modules
- lessons
- resources
- templates
- tools
- user_progress
- user_resource_access

## Regla importante
No conviertas cada documento en un archivo suelto y sin estructura. Debe existir siempre:
- nombre
- tipo
- categoría
- objetivo
- área o módulo asociado
- estado
- fecha de actualización

## Prioridad recomendada

### Fase 1
- crear estructura base de areas y modules
- crear 2-3 lecciones por área
- crear 1 plantilla por área
- crear 1 herramienta por área

### Fase 2
- agregar recursos descargables
- habilitar acceso por usuario
- registrar progresos y completados

### Fase 3
- analytics por módulo
- recomendación por comportamiento
- contenido inteligente y adaptativo

## Enfoque final
La app debe dar al usuario tres cosas:
- conocimiento
- acción
- herramientas

Cuando eso ocurre, la app deja de ser un curso y se convierte en una experiencia útil para crecer un negocio.
