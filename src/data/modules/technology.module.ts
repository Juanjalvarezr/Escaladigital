/**
 * MÓDULO COMPLETO DE TECNOLOGÍA
 */

import { SalesModuleContent } from './sales.module';

export const TECHNOLOGY_MODULE: SalesModuleContent = {
  moduleId: 'technology-1',
  title: 'Herramientas Digitales: Multiplicar Negocio con Tecnología',
  description: 'Elige herramientas que automatizan. Integra sistemas para flujo. Datos que guían decisiones. Tecnología que acelera, no ralentiza.',
  objective: 'Stack tech limpio + 80% tareas automatizadas + datos accionables',
  duration: '3 horas',
  difficulty: 'beginner',

  lessons: [
    {
      id: 'lesson-1',
      number: 1,
      title: '¿Por qué más herramientas = más caos?',
      duration: 25,
      keyPoints: [
        'La mayoría empresas tienen 30+ herramientas desconectadas',
        'Herramientas que no hablan entre sí = datos duplicados y conflicto',
        'Menos herramientas bien elegidas > 50 herramientas desconectadas',
        'Tech debe simplificar, no complicar'
      ],
      content: `
        El problema de la mayoría:

        Herramientas caóticas:
        - Email + Slack + WhatsApp (3 canales de comunicación)
        - Google Sheets + Excel + Airtable (3 bases de datos)
        - Jira + Asana + Notion (3 project managers)
        - Salesforce + HubSpot + Pipedrive (3 CRMs)
        
        Resultado:
        - Datos duplicados (versiones diferentes)
        - Tiempo perdido buscando info
        - Integraciones rotas (sync manual)
        - Equipos en sistemas diferentes
        - Decisiones con data incompleta

        SOLUCIÓN:
        Elegir stack de 5-7 herramientas core que hablen entre sí.

        En este módulo:
        - Cómo elegir herramientas
        - Stack recomendado por tipo empresa
        - Cómo conectar (integraciones)
        - Datos centralizados + decisiones mejores
      `,
      caseStudy: {
        company: 'SaaS Perú',
        problem: '18 herramientas. Datos en 5 lugares. Reportes manuales 8h/semana.',
        solution: 'Redujo a 6 herramientas core. Integró con Zapier.',
        result: 'Reportes automáticos. Datos centralizados. Decisiones 10x más rápidas.'
      },
      actionItems: [
        'Lista TODAS las herramientas que usas hoy',
        'Marca: cuál es core vs cuál es duplicada',
        'Identifica data que está en múltiples lugares',
        'Prioriza: cuál tool es problema #1 hoy?'
      ],
      resources: [
        { id: 'res-1-1', title: 'Tech Stack Audit', type: 'worksheet', description: 'Qué tienes' },
        { id: 'res-1-2', title: 'Integration Map', type: 'template', description: 'Cómo conectar' },
        { id: 'res-1-3', title: 'Tool Comparison Guide', type: 'guide', description: 'Comparador' }
      ]
    },
    {
      id: 'lesson-2',
      number: 2,
      title: 'Stack recomendado: 5 herramientas que hacen 95% del trabajo',
      duration: 30,
      keyPoints: [
        'No existe stack perfecto. Existe stack que funciona PARA TI.',
        'Stack pequeña es mejor que stack perfecta',
        'Criterio: simplicity > features. Usable > powerful.',
        'Elije cloud-first (no instalables), integrable, automatizable'
      ],
      content: `
        STACK CORE RECOMENDADO:

        1. CRM (Customer Relationship Management)
        Opciones: HubSpot, Pipedrive, Salesforce, Close
        Función: Pipeline de ventas, clientes, seguimiento
        Esencial para: Cualquier empresa con sales

        Qué buscar:
        - Interfaz simple (no Salesforce overpower)
        - API para integrar
        - Email integration
        - Reportes útiles
        - <$500/mes para startup

        2. PROYECTO/TAREAS
        Opciones: Asana, Monday, Notion, Linear (dev)
        Función: Tasks, sprints, roadmap, accountability
        Esencial para: Cualquier equipo > 2 personas

        Qué buscar:
        - Gantt view
        - Calendar view
        - Automations
        - Zapier integration
        - <$200/mes

        3. COMUNICACIÓN
        Opciones: Slack (chat) + Loom (video async)
        Función: Comunicación rápida + documentación
        Esencial para: Cualquier remote/async

        Qué buscar:
        - Channels por tema
        - Searchable history
        - Bot integrations
        - <$200/mes combinado

        4. DATOS/ANALYTICS
        Opciones: Google Sheets (simple) + Metabase (avanzado)
        Función: Dashboard, reportes, KPIs
        Esencial para: Decisiones basadas en datos

        Qué buscar:
        - Real-time data
        - Custom dashboards
        - Automated reports
        - Integrable con tus datos

        5. AUTOMATIZACIÓN
        Opciones: Zapier, Make, N8N
        Función: Conecta tools, automatiza workflows
        Esencial para: Menos trabajo manual

        Qué buscar:
        - 5000+ app integrations
        - Visual workflow builder
        - Reliable
        - <$100/mes

        STACK MÍNIMO:
        HubSpot (CRM) + Asana (Tasks) + Slack + Google Sheets + Zapier
        Total: ~$300/mes
        Coverage: 95% de funcionalidad necesaria

        STACK EXPANDIDO (después):
        + Notion (wiki)
        + Stripe (payments)
        + Loom (video)
        + Amplitude (analytics avanzado)
        Total: ~$600/mes
      `,
      caseStudy: {
        company: 'Startup Colombia',
        problem: 'Equipo descontrolado con 12 tools diferentes',
        solution: 'Implementó stack mínimo: HubSpot + Asana + Slack + Sheets + Zapier',
        result: 'Alineamiento inmediato. Eficiencia sube. Costo baja. Decisiones mejores.'
      },
      actionItems: [
        'Elige CRM: HubSpot gratis para empezar',
        'Elige Tasks: Asana (completo) o Notion (flexible)',
        'Asegura Slack + email integrado',
        'Setup Google Sheets para dashboard',
        'Integra Zapier para conectar todo'
      ],
      resources: [
        { id: 'res-2-1', title: 'Stack Comparison', type: 'guide', description: 'Precios + features' },
        { id: 'res-2-2', title: 'Integration Blueprint', type: 'template', description: 'Cómo conectar' },
        { id: 'res-2-3', title: 'Setup Checklist', type: 'worksheet', description: 'Qué configurar' }
      ]
    },
    {
      id: 'lesson-3',
      number: 3,
      title: 'Integración: Datos que fluyen, trabajo que desaparece',
      duration: 35,
      keyPoints: [
        'Integración = información en una sola versión de la verdad',
        'Una vez conectado, no hay trabajo manual',
        'Integración bien hecha ahorra 20+ horas/semana',
        'Zapier + Webhooks = 80% integración que necesitas'
      ],
      content: `
        Cómo conectar todo:

        FLUJO TÍPICO:

        Cliente completa form
        ↓ (Zapier)
        Crea contacto en HubSpot
        ↓ (HubSpot API)
        Envía email bienvenida
        ↓ (Zapier)
        Crea task en Asana "Follow up con [cliente]"
        ↓ (Zapier)
        Notifica por Slack
        ↓ (Zapier)
        Agrega a Google Sheets para tracking
        
        Resultado: CERO trabajo manual. Todo automático.

        PASO 1: IDENTIFY WORKFLOWS
        ¿Qué procesos son repetitivos?
        - Lead → seguimiento → venta → onboarding
        - Invoice → pago → confirmación
        - Customer support → ticket → resolución
        - Team → task → completar → report

        PASO 2: MAP INTEGRATION
        Dibuja: Trigger → Acción 1 → Acción 2 → Acción 3

        Ejemplo:
        [New lead in Zapier] → 
        [Create contact in HubSpot] → 
        [Send email] → 
        [Create task in Asana] → 
        [Slack notification]

        PASO 3: BUILD IN ZAPIER
        UI visual:
        1. Choose trigger (event que inicia)
        2. Connect to app 1
        3. Add action 1 (what to do)
        4. Add action 2
        5. Add action 3
        6. Test
        7. Enable

        PASO 4: TEST & REFINE
        5 pruebas antes de live
        ¿Todos datos llegan correcto?
        ¿Orden es correcto?
        ¿Errores se manejan?

        PASO 5: MONITOR
        Zapier dashboard:
        - Qué integraciones funcionan
        - Cuál falló (y por qué)
        - Logs para debugging

        HERRAMIENTAS:
        Zapier: UI simple, 5000+ integraciones
        Make: Más poderoso, visual
        N8N: Open source, control total
      `,
      caseStudy: {
        company: 'Consultora Argentina',
        problem: '10 horas/semana en trabajo manual: emails, sheets, tracking',
        solution: 'Integró Zapier: lead → CRM → email → tasks → reportes',
        result: 'Cero trabajo manual. Equipo hace estrategia. Eficiencia +300%.'
      },
      actionItems: [
        'Identifica 3 workflows repetitivos',
        'Dibuja: trigger → acciones',
        'Busca conexión en Zapier (probablemente existe)',
        'Setup, test 5 veces, enable',
        'Monitor: ¿funciona bien?'
      ],
      resources: [
        { id: 'res-3-1', title: 'Zapier Setup Guide', type: 'guide', description: 'Paso a paso' },
        { id: 'res-3-2', title: 'Workflow Templates', type: 'template', description: '10 workflows reales' },
        { id: 'res-3-3', title: 'Integration Testing Checklist', type: 'worksheet', description: 'QA' }
      ]
    },
    {
      id: 'lesson-4',
      number: 4,
      title: 'Data: Decisiones que ves vs que adivinas',
      duration: 30,
      keyPoints: [
        'Data es tu arma competitiva',
        'Sin data: compites por suerte. Con data: compites con certeza.',
        'Dashboard semanal te da visibilidad total en 30 minutos',
        'Métrica que ves = métrica que mejoras'
      ],
      content: `
        Cómo construir "data culture":

        PASO 1: CENTRALIZAR
        Todos tus datos en UN lugar
        Google Sheets (simple)
        o Metabase (avanzado)
        
        Fuentes:
        - CRM (HubSpot data)
        - Stripe (payment data)
        - Google Analytics (website)
        - Email (open rates, click rates)
        - Custom database
        
        Integración: Zapier trae automático

        PASO 2: DASHBOARDS
        
        EXECUTIVE DASHBOARD (para CEO):
        - Revenue MoM
        - Customers active
        - Churn rate
        - Cash runway
        - Top 3 KPIs
        
        Actualización: Weekly

        SALES DASHBOARD (para sales):
        - Pipeline ($)
        - Close rate %
        - Deal stage
        - Top performers
        - Forecast vs actual
        
        Actualización: Daily

        OPERATIONS DASHBOARD:
        - Cycle time
        - Error rate
        - Cost per unit
        - Throughput
        - Automation %
        
        Actualización: Weekly

        PASO 3: ACCIÓN
        Data = inútil si no actúas
        
        Dashboard dice:
        "Churn sube a 8% (era 5%)"
        
        Acción:
        ¿Por qué? Investigar
        Qué cambió? Reciente update?
        Qué hacemos? Customer success program?
        Métrica objetivo: Reducir a 5% en 30 días

        HERRAMIENTAS:
        Google Sheets: 80% de casos
        Metabase: Analytics avanzado
        Amplitude: Product analytics
        Looker: Enterprise BI
      `,
      caseStudy: {
        company: 'E-commerce Chile',
        problem: 'Vendía pero no sabía qué funcionaba. Decisiones en la oscuridad.',
        solution: 'Dashboard Google Sheets con datos Stripe + GA + CRM',
        result: 'Ve patrones. Optimiza lo que funciona. Revenue +50% en 6 meses.'
      },
      actionItems: [
        'Centraliza datos de CRM + Stripe + Analytics en Sheets',
        'Crea 3 dashboards: Executive + Sales + Operations',
        'Setup auto-update con Zapier o Google Sheets formulas',
        'Revisa weekly: ¿qué cambió? ¿Qué hacer?',
        'Comparte con equipo: transparencia total'
      ],
      resources: [
        { id: 'res-4-1', title: 'Dashboard Templates', type: 'template', description: 'Google Sheets listos' },
        { id: 'res-4-2', title: 'KPI Definitions', type: 'guide', description: 'Qué medir' },
        { id: 'res-4-3', title: 'Data Integration Guide', type: 'guide', description: 'Cómo traer datos' }
      ]
    },
    {
      id: 'lesson-5',
      number: 5,
      title: 'Escalabilidad tech: De laptop a infraestructura',
      duration: 40,
      keyPoints: [
        'Tech que no escala = bottleneck de crecimiento',
        'Infraestructura robusta es invisible hasta que falla',
        'Plan para 10x desde inicio (migrar es costoso)',
        'Cloud-first = escalable by default'
      ],
      content: `
        Escalabilidad es por capas:

        CAPA 1: DATOS
        Inicio: Google Sheets (suficiente para $1M revenue)
        Después: Database (PostgreSQL en Heroku, AWS RDS)
        Escala: Data warehouse (Snowflake, Bigquery)
        
        Pregunta: ¿Mi data cabe en Sheets?
        SÍ → Usa Sheets
        NO → Base de datos

        CAPA 2: APLICACIONES
        Inicio: No-code tools (Zapier, Airtable)
        Después: Low-code (Bubble, FlutterFlow)
        Escala: Full-stack (React + Node)
        
        Pregunta: ¿Necesito custom app?
        NO → No-code es suficiente
        SÍ → Desarrolla

        CAPA 3: INFRAESTRUCTURA
        Inicio: Shared hosting (Namecheap $5/mes)
        Después: VPS (Linode, DigitalOcean $10-50/mes)
        Escala: Kubernetes (AWS, GCP, Vercel)
        
        Pregunta: ¿Cuánto traffic?
        <1M visitors/mes → Shared hosting
        1-10M → VPS
        10M+ → Kubernetes

        CAPA 4: SEGURIDAD
        Inicio: Password manager (1Password)
        Después: SSO + 2FA (Auth0, Okta)
        Escala: SOC2 compliance
        
        Checklist básico:
        ✓ HTTPS only
        ✓ Backups automatizadas
        ✓ 2FA para admin
        ✓ Password manager
        ✓ VPN para team

        PLAN 12 MESES:

        Mes 0-3: Build
        - No-code stack
        - Google Sheets
        - Basic security

        Mes 3-6: Growth
        - Monitor performance
        - Add database si necesario
        - Backup automation

        Mes 6-12: Scale
        - Upgrade si <1 sec load time
        - Security hardening
        - Plan siguiente año

        INDICADORES DE "NECESITAMOS MEJORAR TECH":
        - Load time > 3 segundos
        - Zapier hits rate limits
        - Database queries lentos
        - Security = preocupación
        - Equipo = frustrated con tools
      `,
      caseStudy: {
        company: 'SaaS México 10M revenue',
        problem: 'Built en Bubble (no-code). Ahora slow + costly.',
        solution: 'Migraron a React + Node. Infraestructura escalable.',
        result: 'Performance 10x. Costos 50% menos. Capacidad para crecer 100x.'
      },
      actionItems: [
        'Audita tech stack actual (Data + Apps + Infraestructura)',
        'Identifica bottlenecks (lento? frágil? inseguro?)',
        'Plan escala: qué cambiaría en 12 meses?',
        'Presupuesta tech (% de revenue)',
        'Documenta: "Tech strategy" para próximos años'
      ],
      resources: [
        { id: 'res-5-1', title: 'Tech Stack Roadmap', type: 'template', description: '3 años' },
        { id: 'res-5-2', title: 'Infrastructure Checklist', type: 'worksheet', description: 'Security + Performance' },
        { id: 'res-5-3', title: 'Migration Guide', type: 'guide', description: 'Cómo crecer sin romper' },
        { id: 'res-5-4', title: 'Tech Budget Template', type: 'template', description: '% de revenue' }
      ]
    }
  ],

  tools: [
    { id: 'tool-1', title: 'HubSpot', type: 'tool', description: 'CRM para sales' },
    { id: 'tool-2', title: 'Asana', type: 'tool', description: 'Gestión de proyectos' },
    { id: 'tool-3', title: 'Zapier', type: 'tool', description: 'Integración + automatización' },
    { id: 'tool-4', title: 'Google Sheets', type: 'tool', description: 'Dashboard + datos' },
    { id: 'tool-5', title: 'Slack', type: 'tool', description: 'Comunicación' }
  ],

  templates: [
    { id: 'tpl-1', title: 'Tech Stack Audit', type: 'template', description: 'Qué tienes' },
    { id: 'tpl-2', title: 'Integration Blueprint', type: 'template', description: 'Cómo conectar' },
    { id: 'tpl-3', title: 'Zapier Workflows', type: 'template', description: '10 ejemplos' },
    { id: 'tpl-4', title: 'Dashboard Templates', type: 'template', description: 'Executive + Sales + Ops' },
    { id: 'tpl-5', title: 'Tech Roadmap', type: 'template', description: '12 meses' }
  ],

  successMetrics: [
    'Stack reducido a 5-7 herramientas (vs 15+)',
    'Data centralizada en un lugar (Single source of truth)',
    'Automatización 80% (vs 20% manual)',
    'Dashboard semanal con KPIs actualizado automático',
    'Load time <2 segundos (performance)',
    'Security audit passed (backups + 2FA)'
  ],

  nextModule: 'technology-2'
};

export default TECHNOLOGY_MODULE;
