/**
 * MÓDULO COMPLETO DE OPERACIONES
 */

import { SalesModuleContent } from './sales.module';

export const OPERATIONS_MODULE: SalesModuleContent = {
  moduleId: 'operations-1',
  title: 'Procesos: De Caos a Máquina de Precisión',
  description: 'Elimina redundancia, automatiza tareas manuales y crea sistemas que funcionan sin supervisión. Operaciones que escalan.',
  objective: 'Reducir errores 80% y liberar 20+ horas semanales en operaciones',
  duration: '3 horas',
  difficulty: 'beginner',

  lessons: [
    {
      id: 'lesson-1',
      number: 1,
      title: '¿Por qué el caos operativo te impide escalar?',
      duration: 25,
      keyPoints: [
        'Sin procesos, cada persona hace lo que cree. Inconsistencia garantizada.',
        'El caos operativo cuesta 30% de tu revenue en ineficiencia',
        'Procesos no son burocracia. Son libertad para crecer.',
        'La empresa que documenta escala. La que improvisa, quiebra.'
      ],
      content: `
        Operaciones = sangre de tu empresa.

        SÍNTOMAS DE CAOS OPERATIVO:
        - Pedidos perdidos o atrasados
        - Información dispersa (no sabes dónde está)
        - Errores repetitivos
        - Nadie sabe cómo hacer X cosa
        - Dependencia en 1 persona = cuello de botella
        - Reuniones sin fin
        - No medes nada

        RESULTADO DEL CAOS:
        - Cliente molesto = churn
        - Equipo molesto = renuncia
        - Dinero perdido = ineficiencia
        - No creces = procesos rompen

        SOLUCIÓN: DOCUMENTACIÓN + AUTOMATIZACIÓN + MEDICIÓN

        En este módulo aprenderás a:
        1. Mapear procesos actuales
        2. Documentar paso a paso
        3. Automatizar tareas manuales
        4. Medir eficiencia
      `,
      caseStudy: {
        company: 'E-commerce Colombia',
        problem: 'Errores en envíos = 20% pedidos retornados. Caos total.',
        solution: 'Documentó proceso, creó checklist digital, automatizó recordatorios.',
        result: 'Errores bajan a 0.5%. Devoluciones -90%. Revenue +40% (menos fricción).'
      },
      actionItems: [
        'Mapea los 5 procesos principales de tu empresa',
        'Identifica dónde está el caos (más errores, más tiempo)',
        'Escribe paso a paso de 1 proceso (sin editar, tal cual es hoy)',
        'Identifica qué es manual que podría automatizarse'
      ],
      resources: [
        { id: 'res-1-1', title: 'Process Mapping Template', type: 'template', description: 'Diagrama visual' },
        { id: 'res-1-2', title: 'Process Audit Checklist', type: 'worksheet', description: 'Identifica ineficiencia' },
        { id: 'res-1-3', title: 'SOP Template (Standard Operating Procedure)', type: 'template', description: 'Documenta' }
      ]
    },
    {
      id: 'lesson-2',
      number: 2,
      title: 'Documentación: El manual que ejecuta tu negocio',
      duration: 30,
      keyPoints: [
        'Documentación es tu memoria del negocio',
        'Sin documentación, todo vive en 1 cabeza = riesgo',
        'Documentación correcta = cualquiera puede hacer el trabajo',
        'Toma 4 horas documentar. Ahorras 400 horas al año.'
      ],
      content: `
        SOP (Standard Operating Procedure) = la receta exacta.

        ESTRUCTURA DE UNA BUENA DOCUMENTACIÓN:

        1. OBJETIVO
        Qué intentamos lograr.
        "Procesar pedido en menos de 2 horas"

        2. DUEÑO
        Quién es responsable.
        "Juan (Operations Manager)"

        3. PRECONDICIONES
        Qué debe estar listo antes.
        "Cliente pagó" "Producto en stock"

        4. PASOS (PASO A PASO)
        1. Abrí email de pedido
        2. Copio info a Google Sheets
        3. Creo orden en sistema
        4. Imprimo etiqueta
        5. Paso a almacén
        ... (cada paso, sin suponer nada)

        5. CHECKLIST
        ☐ Email enviado al cliente confirmando recepción
        ☐ Código de rastreo asociado
        ☐ Almacén confirma entrega dentro de 4h
        ☐ Registrado en sistema

        6. TROUBLESHOOTING
        Si X pasa → haz Y
        Si "no hay stock" → notifica a compras y cliente
        Si "pago rebotó" → retén pedido 24h

        7. MÉTRICAS
        Tiempo promedio: 1h 45min
        % de error: <0.5%
        Revisión: cada mes

        HERRAMIENTAS:
        - Google Docs: texto + screenshots
        - Notion: todo centralizado
        - Loom: video tutorial
        - Figma: diagramas visuales

        CONSEJO: No documentes perfecto. Documenta hoy, mejora después.
      `,
      caseStudy: {
        company: 'SaaS México',
        problem: 'Onboarding de nuevos empleados = 3 semanas (lento)',
        solution: 'Documentó cada proceso en Notion. Nuevos se autosirven.',
        result: 'Onboarding = 3 días. Nuevos contribuyen de inmediato. Escalabilidad 5x.'
      },
      actionItems: [
        'Selecciona 1 proceso crítico',
        'Documenta paso a paso (como si le explicaras a extranjero)',
        'Incluye screenshots/videos de cada paso',
        'Crea checklist final',
        'Prueba con alguien del equipo (¿entienden sin ti?)',
        'Ajusta basado en feedback'
      ],
      resources: [
        { id: 'res-2-1', title: 'SOP Template Completo', type: 'template', description: '7 secciones' },
        { id: 'res-2-2', title: 'Notion Template para SOPs', type: 'template', description: 'Database organizado' },
        { id: 'res-2-3', title: 'Loom Video Guide', type: 'guide', description: 'Documenta en video' }
      ]
    },
    {
      id: 'lesson-3',
      number: 3,
      title: 'Automatización: El sistema que trabaja mientras duermes',
      duration: 35,
      keyPoints: [
        'Toda tarea repetitiva se puede automatizar (90% de empresa)',
        'Automatización NO es código. Es herramientas + lógica',
        'ROI de automatización: 1 hora setup = 50 horas ahorradas/año',
        'Zapier puede hacer casi todo sin que sepa programar'
      ],
      content: `
        Automatización es tu multiplicador de tiempo.

        TAREAS PARA AUTOMATIZAR:

        1. DATOS
        Form → Spreadsheet automático
        Email → Database automático
        API → Sistema automático
        
        2. COMUNICACIÓN
        Trigger → Email automático
        Evento → Slack notification
        Pedido → SMS cliente + whatsapp
        
        3. PROCESOS
        Aplicación → Folder en Drive automático
        Venta → Contrato PDF automático
        Cliente nuevo → Bienvenida automatizada
        
        4. REPORTING
        Cada lunes → Dashboard de KPIs
        Fin de mes → Reporte financiero
        Semanal → Métrica operacional

        HERRAMIENTAS (TODO SIN CÓDIGO):

        Zapier: conecta 5000+ apps
        Google Sheets: fórmulas + scripts
        Make (Integromat): workflows visuales
        N8N: open-source si quieres control total
        Airtable: base de datos + automaciones

        EJEMPLO PRÁCTICO:

        Workflow: "Nuevo cliente entra en base"
        1. Lead llena form
        2. Datos van a Spreadsheet
        3. Zapier lee Spreadsheet
        4. Crea contacto en CRM
        5. Envía email bienvenida
        6. Crea evento en Calendar
        7. Notifica a sales por Slack
        
        Setup: 2 horas
        Resultado: 0 trabajo manual
        Ahorro: 5h/semana

        FRAMEWORK:
        1. Identifica tarea manual repetitiva
        2. Dibuja el workflow
        3. Busca apps para conectar
        4. Setup en Zapier/Make
        5. Prueba 5 veces
        6. Deploy
      `,
      caseStudy: {
        company: 'Consultora Argentina',
        problem: '10 horas/semana en admin: emails, spreadsheets, reportes.',
        solution: 'Automatizó con Zapier: leads → CRM → email → reportes. 1 workspace.',
        result: 'Mismo trabajo, 0 horas manuales. Equipo hace estrategia en lugar de admin.'
      },
      actionItems: [
        'Identifica 3 tareas repetitivas que haces weekly',
        'Prioriza la que más tiempo quita',
        'Dibuja workflow: trigger → acciones → resultado',
        'Busca apps que lo conecten (Zapier directory)',
        'Setup, prueba, deploy',
        'Repite con próxima tarea'
      ],
      resources: [
        { id: 'res-3-1', title: 'Zapier Setup Guide', type: 'guide', description: 'Paso a paso' },
        { id: 'res-3-2', title: 'Workflow Template Examples', type: 'template', description: '10 workflows reales' },
        { id: 'res-3-3', title: 'Automation Audit', type: 'worksheet', description: 'Qué automatizar primero' }
      ]
    },
    {
      id: 'lesson-4',
      number: 4,
      title: 'Medición operacional: Dashboard de salud del negocio',
      duration: 30,
      keyPoints: [
        'Si no mides, no mejoras',
        'Mide lo que importa: eficiencia, calidad, velocidad',
        'Dashboard semanal toma 30 min. Te ahorra 20 horas en decisiones.',
        'Operaciones medidas = operaciones que mejoran'
      ],
      content: `
        Métricas que importan en Operaciones:

        VELOCIDAD (cycle time):
        Pedido → Entrega: ____ días (actual: ?)
        Lead → Venta: ____ días (actual: ?)
        Solicitud → Respuesta: ____ horas (actual: ?)
        
        Objetivo: reducir 50%

        CALIDAD (error rate):
        Pedidos con error: ____% (actual: ?)
        Tickets de soporte: ____ (actual: ?)
        Retornos/devoluciones: ____% (actual: ?)
        
        Objetivo: <1%

        EFICIENCIA (cost per unit):
        Costo de procesar 1 pedido: $____ (actual: ?)
        Horas trabajo por resultado: ____ (actual: ?)
        $ invertido en gano $X: ratio (actual: ?)
        
        Objetivo: mejorar 20%/trimestre

        CAPACIDAD (throughput):
        Pedidos/día que procesamos: ____ (actual: ?)
        Llamadas que manejamos: ____ (actual: ?)
        Transacciones/segundo: ____ (actual: ?)
        
        Objetivo: aumentar 10%/mes

        DASHBOARD SEMANAL (15 min de lectura):
        Métrica     | Objetivo | Actual | Status
        Cycle time  | 2 días   | 2.3    | 🟡 cerca
        Error rate  | <1%      | 0.8%   | 🟢 ok
        Cost/unit   | $5       | $5.2   | 🟡 sube
        Throughput  | 500/día  | 450    | 🟡 bajo

        Acción inmediata: ¿qué 2 cosas cambio?
      `,
      caseStudy: {
        company: 'Operaciones Perú',
        problem: 'No sabía dónde estaba el problema. "Todo está bien" decían.',
        solution: 'Implementó 5 métricas + dashboard semanal. Claridad inmediata.',
        result: 'Identifica botellas. Cycle time baja 30%. Costo por unit -15%.'
      },
      actionItems: [
        'Define 4-5 métricas clave para tu operación',
        'Crea Google Sheets con histórico (3 meses)',
        'Setup para auto-actualizar (fórmulas o Zapier)',
        'Revisa weekly: ¿arriba o abajo del objetivo?',
        'Acción: si abajo, ¿qué cambio esta semana?'
      ],
      resources: [
        { id: 'res-4-1', title: 'Operations Dashboard Template', type: 'template', description: 'Google Sheets lista' },
        { id: 'res-4-2', title: 'KPI Definition Guide', type: 'guide', description: 'Métrica por industria' },
        { id: 'res-4-3', title: 'Metrics Tracking Worksheet', type: 'worksheet', description: 'Define tuyas' }
      ]
    },
    {
      id: 'lesson-5',
      number: 5,
      title: 'Escalabilidad operacional: De 1 a 100 sin caos',
      duration: 40,
      keyPoints: [
        'Operaciones que escalan = procesos replicables',
        'Escalabilidad no es dinero, es sistema',
        'Duplicar equipo sin duplicar problema = éxito',
        'Si no escalas operaciones, escalas deuda técnica'
      ],
      content: `
        Operaciones escalables tienen 3 pilares:

        1. DOCUMENTACIÓN
        Todo está escrito. Nuevo puede auto-capacitarse.
        SOP para cada proceso.
        Reglero centralizado en Notion.
        
        2. AUTOMATIZACIÓN
        Tareas manuales son mínimas.
        Máquinas hacen 80% del trabajo.
        Humanos hacen excepciones y calidad.
        
        3. SISTEMAS
        No dependencia en personas.
        Roles claros y reemplazables.
        Redundancia en lo crítico.

        PASOS PARA ESCALAR:

        FASE 1: DOCUMENTAR (2 semanas)
        - SOP para 5 procesos principales
        - Centralizar documentación
        - Onboarding con docs
        
        FASE 2: AUTOMATIZAR (4 semanas)
        - Zapier para 5 workflows
        - Reducir trabajo manual 50%
        - Crear dashboard de control
        
        FASE 3: DUPLICAR (ongoing)
        - Contratat 2do person en rol X
        - Onboarding con docs + automation
        - 1er mes: seguimiento cercano
        - 2do mes: autonomía
        
        FASE 4: OPTIMIZAR (monthly)
        - Revisar métricas
        - Identificar botella
        - Mejora 1 cosa por mes
        - Documentar cambio

        INDICADORES DE OPERACIONES ESCALABLES:
        ✓ Cycle time consistente
        ✓ Error rate < 1%
        ✓ Documentación actualizada
        ✓ Automatización > 70%
        ✓ Equipo puede hacer trabajo sin supervisor
        ✓ Duplicar equipo no duplica problemas
      `,
      caseStudy: {
        company: 'Startup Chile 10 personas',
        problem: 'Crecer a 50 personas quebraría operaciones (era caos actual)',
        solution: '3 meses: documentó + automatizó + midió. Operaciones listas.',
        result: 'Contrató 15 personas nuevas sin que operaciones se rompiera. Crecimiento limpio.'
      },
      actionItems: [
        'Selecciona 3 procesos + documenta en Notion',
        'Automatiza 2 workflows con Zapier',
        'Crea dashboard de 5 métricas',
        'Onboarding de persona nueva solo con docs',
        '¿Funciona sin ti? Si no, repite paso 1.'
      ],
      resources: [
        { id: 'res-5-1', title: 'Operational Scaling Roadmap', type: 'template', description: '12-semanas' },
        { id: 'res-5-2', title: 'Documentation Hub Template', type: 'template', description: 'Notion setup' },
        { id: 'res-5-3', title: 'Scalability Checklist', type: 'worksheet', description: '¿Estás listo?' },
        { id: 'res-5-4', title: 'Team Duplication Plan', type: 'template', description: 'Cómo crecer sin caos' }
      ]
    }
  ],

  tools: [
    { id: 'tool-1', title: 'Zapier', type: 'tool', description: 'Automatización sin código' },
    { id: 'tool-2', title: 'Notion', type: 'tool', description: 'Wiki + SOPs centralizadas' },
    { id: 'tool-3', title: 'Google Sheets', type: 'tool', description: 'Dashboard + reports' },
    { id: 'tool-4', title: 'Loom', type: 'tool', description: 'Video documentation' },
    { id: 'tool-5', title: 'Airtable', type: 'tool', description: 'Database + workflows' }
  ],

  templates: [
    { id: 'tpl-1', title: 'SOP Template', type: 'template', description: 'Documenta procesos' },
    { id: 'tpl-2', title: 'Process Mapping', type: 'template', description: 'Visualiza flujo' },
    { id: 'tpl-3', title: 'Operations Dashboard', type: 'template', description: 'Métricas semanales' },
    { id: 'tpl-4', title: 'Zapier Workflows', type: 'template', description: '10 ejemplos' },
    { id: 'tpl-5', title: 'Escalabilidad Checklist', type: 'template', description: '¿Estás listo?' }
  ],

  successMetrics: [
    'Documentar 100% de procesos críticos',
    'Automatizar 50% de trabajo manual',
    'Reducir cycle time 50%',
    'Bajar error rate a <1%',
    'Reducir costo operativo por unidad 20%',
    'Poder contratar 2 personas sin que se rompa sistema'
  ],

  nextModule: 'operations-2'
};

export default OPERATIONS_MODULE;
