/**
 * MÓDULO COMPLETO DE FINANZAS
 */

import { SalesModuleContent } from './sales.module';

export const FINANCE_MODULE: SalesModuleContent = {
  moduleId: 'finance-1',
  title: 'Flujo de Caja: La Métrica que Mata Empresas o las Multiplica',
  description: 'Controla el dinero que entra y sale. Domina flujo de caja, presupuesto y rentabilidad. Finanzas que no duelen.',
  objective: 'Tener claridad 100% de tu salud financiera + 90 días de cash runway',
  duration: '3 horas',
  difficulty: 'beginner',

  lessons: [
    {
      id: 'lesson-1',
      number: 1,
      title: 'Por qué las empresas rentables quiebran',
      duration: 25,
      keyPoints: [
        'Rentabilidad ≠ flujo de caja. Muchas empresas mueren siendo "rentables".',
        'El cash es rey. Profit es vanidad.',
        'Sin flujo de caja visible, tomas malas decisiones',
        'El 82% de pequeñas empresas quiebran por falta de cash, no falta de producto'
      ],
      content: `
        Caso real: Empresa genera $100K/mes revenue.
        Pero cobra en 60 días.
        Gasta $80K/mes.
        Paga inmediato.
        
        Resultado: Hoy tiene -$80K en cuenta.
        En 30 días: -$80K
        En 60 días: +$20K (pero ¡hace 2 meses que pasó!)
        
        Matemáticamente rentable. Operacionalmente: QUEBRADA.
        
        Solución: Flujo de Caja Visible.

        3 CONCEPTOS:
        
        1. PROFIT (Utilidad)
        Revenue - Gastos = Profit
        "¿Gano dinero?"
        
        2. CASH FLOW (Flujo)
        Dinero que entra - dinero que sale = Cash
        "¿Tengo dinero HOY?"
        
        3. RUNWAY
        Cash ÷ Burn rate = Meses que duro
        "¿Cuándo quebro si no vendo?"
        
        En este módulo:
        - Cómo calcular flujo de caja real
        - Presupuestar sin adivinar
        - Mejorar rentabilidad (márgenes)
        - Tener 6 meses de runway de seguridad
      `,
      caseStudy: {
        company: 'E-commerce Colombia',
        problem: 'Reportaba $500K profit anual. Tenía -$50K en cuenta. Quebró.',
        solution: 'Implementó flujo de caja real. Vio que cobraba tarde.',
        result: 'Cambió términos: cobro 50% anticipo. Cash flow positive. Empresa salvada.'
      },
      actionItems: [
        'Abre última factura: cuándo facturaste vs cuándo cobraste?',
        'Suma TODOS los gastos de mes (no olvides nada)',
        'Calcula: cash today - burn rate = runway actual',
        'Contesta: ¿cuántos meses sobrevives sin ventas?'
      ],
      resources: [
        { id: 'res-1-1', title: 'Cash Flow Forecast Template', type: 'template', description: '12 meses' },
        { id: 'res-1-2', title: 'Profit vs Cash Flow Explanation', type: 'guide', description: 'Diferencia' },
        { id: 'res-1-3', title: 'Runway Calculator', type: 'tool', description: 'Calcula automático' }
      ]
    },
    {
      id: 'lesson-2',
      number: 2,
      title: 'Presupuesto: Plan que controla el dinero, no viceversa',
      duration: 30,
      keyPoints: [
        'Presupuesto no es restricción. Es brújula.',
        'Sin presupuesto: dinero se gasta mágicamente',
        'Con presupuesto: cada peso tiene misión',
        'Presupuesto que no revisas es papel mojado'
      ],
      content: `
        Presupuesto = tu plan financiero.

        ESTRUCTURA:

        A. INGRESOS (Realista)
        Producto A: $____ (base en histórico)
        Producto B: $____
        Servicios: $____
        Otros: $____
        TOTAL: $____ (CONSERVADOR, -10% del optimista)

        B. GASTOS FIJOS (igual cada mes)
        Sueldos: $____
        Rent: $____
        Seguros: $____
        Servicios (Zapier, HubSpot, etc): $____
        Total Fijos: $____

        C. GASTOS VARIABLES (depende de volumen)
        Comisiones: ____% de sales
        Hosting/infra: $____
        Materiales: $ por unidad × unidades esperadas
        Marketing: $____ (presupuesto que puedes gastar)
        Total Variables: $____

        D. CAPITAL/INVERSIÓN
        Equipo nuevo: $____
        Ofic/infraestructura: $____
        Investigación: $____
        Total Inversión: $____

        E. RESUMEN
        Ingresos - Fijos - Variables - Inversión = Profit

        REVISIÓN:
        - Mensual: ¿gasto real vs presupuesto? (80% exactitud es bueno)
        - Trimestral: ¿cambios en proyección? Ajusta.
        - Anual: ¿dónde erramos? ¿Mejor estimación próxima?

        PUNTO CRÍTICO: No es restricción sino CLARIDAD.
        Si ves que presupuesto está mal = cambias rápido.
        Si no sabes = sorpresas malas.
      `,
      caseStudy: {
        company: 'Consultora México',
        problem: 'Gastaba sin saber cuánta "caja" había. Cada mes era sorpresa.',
        solution: 'Presupuesto mensual. Revisión weekly vs real.',
        result: 'Claridad inmediata. Rentabilidad sube 15%. Menos estrés.'
      },
      actionItems: [
        'Recopila última facturación (3 meses histórico)',
        'Lista todos los gastos (no olvides nada pequeño)',
        'Estima ingresos próximos 12 meses (conservador)',
        'Crea presupuesto Google Sheets',
        'Revisa weekly: real vs presupuesto',
        'Ajusta si varia >10%'
      ],
      resources: [
        { id: 'res-2-1', title: 'Annual Budget Template', type: 'template', description: '12 meses' },
        { id: 'res-2-2', title: 'Budget vs Actual Tracker', type: 'template', description: 'Weekly check' },
        { id: 'res-2-3', title: 'Variable Cost Calculator', type: 'tool', description: 'Por volumen' }
      ]
    },
    {
      id: 'lesson-3',
      number: 3,
      title: 'Rentabilidad: Márgenes que separan ganadores de perdedores',
      duration: 35,
      keyPoints: [
        'No es cuánto vendes. Es cuánto guardas.',
        'Margen = Revenue - Costo total = Profit',
        'Margen 10% = quebrado lentamente. Margen 50% = reino.',
        'Mejorar margen 10% = 10x más profit con mismo revenue'
      ],
      content: `
        Margen es tu palanca de crecimiento.

        TIPOS DE MARGEN:

        1. MARGEN BRUTO
        Revenue - Costo de venta = Margen bruto
        % = Margen bruto ÷ Revenue

        Ejemplo: Vendo por $100, cuesta $40 hacer
        Margen bruto = $60 = 60%

        Objetivo: 50-70% (depende industria)

        2. MARGEN OPERACIONAL
        (Revenue - COGS - Gastos operacionales) ÷ Revenue

        Ejemplo: $100 revenue
        - $40 costo del bien
        - $20 gastos operacionales
        = $40 margen = 40%

        Objetivo: 20-30%

        3. MARGEN NETO
        (Profit después de TODO) ÷ Revenue

        Ejemplo: $100 revenue
        - $40 COGS
        - $20 operaciones
        - $10 impuestos
        = $30 margen neto = 30%

        Objetivo: 10-20%

        CÓMO MEJORAR MARGEN:

        OPCIÓN A: Aumentar precio
        Si subes 10% precio = +10% margen
        (asume volumen constante)
        
        OPCIÓN B: Bajar costo
        Si reduces costo 10% = +10% margen
        (asume precio constante)
        
        OPCIÓN C: Mix de productos
        Vende más alto margen
        Ejemplo: si Producto A es 30% margen
        Producto B es 50%, enfócate en B
        
        OPCIÓN D: Escala
        Mayores volúmenes = menores costos unitarios

        CÁLCULO QUICK:
        Mi revenue: $____
        Mi margen neto hoy: ____% 
        Mi margen neto meta: ____% (típico +5% anual)
        Profit extra: $____
        ¿De dónde viene? Precio/Costo/Mix/Volumen
      `,
      caseStudy: {
        company: 'Agencia Digital Perú',
        problem: 'Revenue $200K, margen solo 8%. Trabajaba mucho, ganaba poco.',
        solution: 'Subió precio 15%. Bajó costos (automatización) 20%. Mejoró mix productos.',
        result: 'Revenue $220K, margen 22%. Profit treplicado. Menos trabajo.'
      },
      actionItems: [
        'Calcula tu margen bruto actual (revenue - COGS)',
        'Calcula margen neto actual (profit final ÷ revenue)',
        'Identifica 3 formas de mejorarlo: precio/costo/mix/volumen',
        'Implementa UNA cambio este mes',
        'Mide: ¿margen mejoró?'
      ],
      resources: [
        { id: 'res-3-1', title: 'Margin Analysis Sheet', type: 'template', description: 'Por producto' },
        { id: 'res-3-2', title: 'Pricing Strategy Guide', type: 'guide', description: 'Cómo subir precio' },
        { id: 'res-3-3', title: 'Cost Reduction Checklist', type: 'worksheet', description: 'Dónde ahorrar' }
      ]
    },
    {
      id: 'lesson-4',
      number: 4,
      title: 'Métricas financieras: El dashboard que controla tu empresa',
      duration: 30,
      keyPoints: [
        'Si no mides, no controlas',
        'Dashboard financiero semanal = mejor decisor',
        'CAC, LTV, Churn, Runway son los KPIs que importan',
        'Revisar números 1 vez/semana = 90% de problemas se evitan'
      ],
      content: `
        Dashboard financiero mínimo:

        1. CASH STATUS
        Dinero en cuenta: $____
        Monthly burn: $____
        Runway (meses): ____ (cash ÷ burn)
        
        ✓ Objetivo: >3 meses runway
        🟡 Alerta: 1-3 meses
        🔴 Crisis: <1 mes

        2. INGRESOS (vs objetivo)
        MRR (Monthly Recurring Revenue): $____
        New revenue this month: $____
        % vs presupuesto: ____%

        3. GASTOS (vs presupuesto)
        Fixed costs: $____
        Variable costs: $____
        Total: $____ vs presupuesto $____
        Variancia: ____% (ideal <5%)

        4. RENTABILIDAD
        Gross margin: ____%
        Net margin: ____%
        Trend: ↑ ↓ → (mejor/peor/igual)

        5. GROWTH
        MoM growth: ____% 
        % of revenue from new vs repeat: ____%
        Churn rate: ____%

        REVISIÓN SEMANAL (30 min):
        ☐ Cash en cuenta vs semana pasada
        ☐ Revenue real vs proyectado
        ☐ Gastos vs presupuesto
        ☐ ¿Alguna alerta?
        ☐ ¿Qué cambio esta semana?

        ACCIÓN RÁPIDA:
        Si runway <3 meses: corta gastos 20%
        Si revenue bajo: vende más o cambia precio
        Si margen bajo: reduce costos o aumenta precio
      `,
      caseStudy: {
        company: 'SaaS México',
        problem: 'No revisaba números. Sorpresas cada mes.',
        solution: 'Dashboard Google Sheets. Revisión weekly.',
        result: 'Ve problemas con 4 semanas de anticipación. Actúa rápido. Crisis evitadas.'
      },
      actionItems: [
        'Crea Google Sheet con 5 métricas del dashboard',
        'Auto-alimenta con datos (fórmulas o Zapier)',
        'Revisa weekly: misma día/hora',
        'Si algo está rojo: acción inmediata',
        'Presenta a equipo weekly (transparencia)'
      ],
      resources: [
        { id: 'res-4-1', title: 'Financial Dashboard Template', type: 'template', description: 'Google Sheets lista' },
        { id: 'res-4-2', title: 'KPI Definitions', type: 'guide', description: 'Qué medir' },
        { id: 'res-4-3', title: 'Alert Thresholds', type: 'worksheet', description: 'Cuándo preocuparse' }
      ]
    },
    {
      id: 'lesson-5',
      number: 5,
      title: 'Crecimiento rentable: Escalabilidad que suma dinero',
      duration: 40,
      keyPoints: [
        'Crecer = problema si no es rentable',
        'Crecimiento rentable = márgenes sanos + costos controlados',
        'Mejor tener $100K profit seguro que $1M revenue inseguro',
        'El objetivo NO es revenue. Es profit.'
      ],
      content: `
        Crecimiento rentable tiene fórmula:

        PRINCIPIOS:

        1. PRECIO PRIMERO
        Si producto tiene margen bajo: aumenta precio ANTES de crecer
        Crecimiento no arregla margen bajo

        2. EFICIENCIA
        Duplicar equipo sin duplicar gastos
        Automatización es clave
        Más revenue, menos trabajo

        3. FOCUS
        No crezcas en TODO
        Crece en lo de alto margen
        Deja lo de bajo margen

        4. CAPITAL
        ¿Cuánto dinero necesitas para duplicar?
        ¿Cuánto revenue esperas en 12 meses?
        ¿ROI es positivo en < 12 meses?

        PLAN DE CRECIMIENTO RENTABLE:

        Año 1: Consolidate
        - Margen 30%+
        - Sistema documentado
        - Team pequeño pero alineado
        Revenue: $500K, Profit: $100K

        Año 2: Optimize
        - Margen 40%+ (automatiación + precio)
        - Duplica equipo (sin duplicar gastos)
        - Duplica systems
        Revenue: $1M, Profit: $300K

        Año 3: Scale
        - Margen 50%+ (eficiencia)
        - Nuevos productos (alto margen)
        - Partner/distribuidor
        Revenue: $2.5M, Profit: $1M+

        MÉTRICA FINAL: PROFIT POR PERSON
        $100K revenue ÷ 1 person = $100K/person
        $2.5M revenue ÷ 8 people = $312K/person

        Objetivo: Más profit per person, no más people.
      `,
      caseStudy: {
        company: 'Startup SaaS Chile',
        problem: 'Creció a $5M pero profit era 5%. "Crecía pero no ganaba".',
        solution: 'Cortó el 40% de clientes de bajo margen. Aumentó precio 30%. Automatizó.',
        result: 'Revenue $3M pero profit 35%. Ganaba 7x más con menos clientes y trabajo.'
      },
      actionItems: [
        'Define: ¿cuál es margen mínimo aceptable para tu negocio?',
        'Identifica productos/clientes por debajo',
        'Aumenta precio o elimina',
        'Plan crecimiento próx 3 años: revenue + profit esperado',
        'Cada decisión: ¿suma profit o solo revenue?'
      ],
      resources: [
        { id: 'res-5-1', title: '3-Year Growth Plan', type: 'template', description: 'Revenue + Profit' },
        { id: 'res-5-2', title: 'Unit Economics Calculator', type: 'tool', description: 'Por cliente' },
        { id: 'res-5-3', title: 'Product Mix Optimizer', type: 'worksheet', description: 'Cuál crecer' },
        { id: 'res-5-4', title: 'Profitability Analysis', type: 'template', description: 'Por producto/cliente' }
      ]
    }
  ],

  tools: [
    { id: 'tool-1', title: 'Google Sheets', type: 'tool', description: 'Dashboard financiero' },
    { id: 'tool-2', title: 'Wave', type: 'tool', description: 'Contabilidad gratis' },
    { id: 'tool-3', title: 'Stripe Dashboard', type: 'tool', description: 'Datos de ventas' },
    { id: 'tool-4', title: 'Brex', type: 'tool', description: 'Cuenta + finanzas' },
    { id: 'tool-5', title: 'LiveFlow', type: 'tool', description: 'Automation de reportes' }
  ],

  templates: [
    { id: 'tpl-1', title: 'Cash Flow Forecast', type: 'template', description: '12 meses' },
    { id: 'tpl-2', title: 'Annual Budget', type: 'template', description: 'Planificado' },
    { id: 'tpl-3', title: 'Financial Dashboard', type: 'template', description: 'Weekly check' },
    { id: 'tpl-4', title: 'Margin Analysis', type: 'template', description: 'Por producto' },
    { id: 'tpl-5', title: 'Growth Projection', type: 'template', description: '3 años' }
  ],

  successMetrics: [
    'Tener 6+ meses de runway de cash',
    'Margen neto 20%+',
    'Presupuesto vs real <10% variancia',
    'Dashboard financiero semanal',
    'Crecimiento >30% anual + rentable',
    'Profit per person aumentando cada trimestre'
  ],

  nextModule: 'finance-2'
};

export default FINANCE_MODULE;
