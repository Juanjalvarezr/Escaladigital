/**
 * MÓDULO COMPLETO DE CLIENTE
 */

import { SalesModuleContent } from './sales.module';

export const CUSTOMER_MODULE: SalesModuleContent = {
  moduleId: 'customer-1',
  title: 'Experiencia de Cliente: De Transacción a Relación',
  description: 'Clientes satisfechos compran más, vuelven, refieren. Experiencia impeccable es tu multiplicador. Sistema que genera fans.',
  objective: 'NPS 50+, Churn <5%, Referral 30% de nuevos clientes',
  duration: '3 horas',
  difficulty: 'beginner',

  lessons: [
    {
      id: 'lesson-1',
      number: 1,
      title: 'Experiencia de cliente: El 80% de tu crecimiento',
      duration: 25,
      keyPoints: [
        'Experiencia excelente = cliente que compra 3x más y refiere',
        'Mala experiencia = marketing budget tirado a basura',
        '5% aumento en retención = 25% aumento en profitabilidad',
        'El mejor marketing es cliente que refiere'
      ],
      content: `
        Matemática de experiencia:

        ESCENARIO 1: Mala experiencia
        Cliente compra → problema → soporte lento → frustrado → se va
        LTV: $1000 (1 compra)
        Referral: 0
        Revenue: $1000

        ESCENARIO 2: Buena experiencia
        Cliente compra → resuelto rápido → satisfecho → compra más
        LTV: $3000 (3 compras)
        Referral: 30% (refiere 2, compran 1)
        Revenue: $3000 + $1000 referral = $4000
        
        DIFERENCIA: 4x
        
        COMPONENTES DE EXPERIENCIA:

        1. ONBOARDING
        Primeros días = primera impresión
        Si frustran ahora, se van antes de usar
        
        2. PRODUCTO/SERVICIO
        ¿Funciona? ¿Es fácil?
        Si no, experiencia falla en inicio

        3. SOPORTE
        Problema inevitablemente ocurre
        Respuesta rápida + solución = confianza
        Respuesta lenta = frustración

        4. PROACTIVIDAD
        "¿Cómo va?" → cliente se siente cuidado
        Vs transaccional puro

        5. DELIGHT
        Sorpresa pequeña (bonus, nota personal)
        Crea emoción positiva
      `,
      caseStudy: {
        company: 'SaaS Colombia',
        problem: 'Churn 15%. Clientes se iban en 3 meses.',
        solution: 'Implementó onboarding + proactive support + monthly check-in',
        result: 'Churn baja a 5%. LTV triplica. 40% de nuevos clientes vienen por referral.'
      },
      actionItems: [
        'Mapa experiencia actual: cliente nuevo hasta año 1',
        'Identifica: ¿dónde duele?',
        'NPS actual: (0-10 scale, qué % son 9-10)',
        'Pregunta a 5 clientes: ¿qué mejoraría?',
        'Prioriza: 1 mejora que haces este mes'
      ],
      resources: [
        { id: 'res-1-1', title: 'Customer Journey Map', type: 'template', description: 'Visualiza flujo' },
        { id: 'res-1-2', title: 'NPS Survey Template', type: 'template', description: 'Mide satisfacción' },
        { id: 'res-1-3', title: 'Experience Audit', type: 'worksheet', description: 'Dónde duele' }
      ]
    },
    {
      id: 'lesson-2',
      number: 2,
      title: 'Onboarding: Los primeros 30 días son determinantes',
      duration: 30,
      keyPoints: [
        'Onboarding = momento crítico donde cliente decide si quedarse',
        '90% de churn ocurre en primeros 30 días',
        'Onboarding bien hecho multiplica LTV 3x',
        'Onboarding es tarea CEO, no delegable'
      ],
      content: `
        Plan de 30 días:

        DAY 1: BIENVENIDA
        - Email personal (no automático) CEO/founder
        - "Bienvenido. Estamos aquí para garantizar éxito."
        - Video de 2 min: "Aquí está cómo empezar"
        - Primer recurso: Quick start guide
        
        Objetivo: Se siente bienvenido y cuidado

        DAY 2-3: ACTIVACIÓN
        - Envía checklist: "5 pasos en primeras 24h"
        - Chat support disponible (no email solo)
        - Respuesta <1 hora si pregunta
        - Onboarding call (30 min) si enterprise
        
        Objetivo: Cliente activa producto/servicio

        DAY 5: CHECK-IN
        - "¿Cómo va? ¿Dudas?"
        - Respuesta a preguntas específicas
        - Recursos adicionales según progreso
        
        Objetivo: Cliente sigue adelante

        DAY 10: MILESTONE
        - "¡Veo que ya [completó X]!"
        - Siguiente paso claro
        - Oferta: bonus feature o consultoría gratis
        
        Objetivo: Cliente ve progreso

        DAY 20: WINS
        - "Clientes como tú logran [resultado]"
        - Case study similar al suyo
        - "¿Cómo va tu progreso?"
        
        Objetivo: Cliente inspira en éxito

        DAY 30: EVALUATION
        - Call formal: "¿Estás en buen camino?"
        - ¿Ha alcanzado objetivos? SÍ → expandir, NO → ajustar
        - Propuesta: si es NO, plan remedial
        
        Objetivo: Cliente comprometido para meses 2+

        HERRAMIENTAS:
        Email: Personalizadas
        Slack/WhatsApp: Respuesta rápida
        Loom: Videos tutorial
        Calendly: Scheduling calls
      `,
      caseStudy: {
        company: 'SaaS México',
        problem: '50% churn mes 1-3. Clientes no sabían usar.',
        solution: 'Plan 30 días: check-ins, videos, support proactivo',
        result: 'Churn mes 1-3 baja a 10%. Clientes activos desde día 5.'
      },
      actionItems: [
        'Documenta experiencia actual (días 1-30)',
        'Diseña plan 30 días ideal (5 touchpoints)',
        'Automatiza emails (pero personaliza CTA)',
        'Setup Loom videos para cada paso',
        'Assign dueño: quién hace follow-up?'
      ],
      resources: [
        { id: 'res-2-1', title: '30-Day Onboarding Plan', type: 'template', description: 'Día por día' },
        { id: 'res-2-2', title: 'Welcome Email Template', type: 'template', description: 'Día 1' },
        { id: 'res-2-3', title: 'Quick Start Guide', type: 'guide', description: 'Primeros pasos' }
      ]
    },
    {
      id: 'lesson-3',
      number: 3,
      title: 'Soporte que sorprende: Problema resuelto = cliente enamorado',
      duration: 35,
      keyPoints: [
        'Soporte NO es centro de costos. Es centro de diferenciación.',
        'Problema + respuesta rápida = cliente más leal que nunca',
        'Problema + respuesta lenta = cliente se va',
        'Soporte es tu mejor ventas channel (refieren)'
      ],
      content: `
        Sistema de soporte de clase mundial:

        PRINCIPIOS:

        1. VELOCIDAD
        Respuesta SLA (Service Level Agreement):
        - Crítico: <1 hora
        - Alto: <4 horas
        - Normal: <24 horas
        - Bajo: <48 horas
        
        Si no puedes cumplir = aumenta personal

        2. CLARIDAD
        NO: "Vamos a revisar"
        SÍ: "Vamos a revisar, te actualizo en 2h"
        
        Transparencia reduce frustración

        3. OWNERSHIP
        Una persona = responsable de ticket
        No ping-pong entre equipos
        "Yo resuelvo esto, cuente con migo"

        4. EMPATÍA
        "Entiendo que es frustrante"
        "Aquí está la solución rápida"
        "Aquí está la prevención para futuro"
        
        Vs mecánico/robótico

        5. BONUS
        Si problema fue culpa nuestra:
        - Disculpa genuina
        - Descuento/crédito
        - Bonus feature/mes gratis
        
        Convierte frustración en lealtad

        ESTRUCTURA:

        Tier 1: Chatbot (respuesta instantánea)
        "Escriba 'problema' o 'factura' o 'técnico'"
        
        Tier 2: Email/Slack (si chatbot no resuelve)
        "Respuesta garantizada en 4h"
        
        Tier 3: Phone (si es crítico)
        "Hablar con humano en vivo"
        
        Tier 4: CEO (si cliente es grande)
        "Escalación si Tier 3 no resuelve"

        HERRAMIENTAS:
        Zendesk: Full support platform
        Intercom: Chat + email + chatbot
        Drift: Conversational support
        Help Scout: Email-based support

        MÉTRICA:
        - CSAT (Customer Satisfaction): >80%
        - NPS (Net Promoter Score): >50
        - Resolution time: <24h promedio
      `,
      caseStudy: {
        company: 'E-commerce Perú',
        problem: 'Soporte lento = churn 20%. Clientes frustrados.',
        solution: 'Implementó Zendesk + SLAs + empowerment team',
        result: 'Resolution time 4h promedio. CSAT 95%. Referral rate 35%.'
      },
      actionItems: [
        'Define SLAs (response times por criticidad)',
        'Elige tool (Zendesk/Intercom/Help Scout)',
        'Documenta: respuestas a FAQ top 10',
        'Train team: empatía + velocidad + ownership',
        'Monitor: CSAT weekly. Si <80%, acción'
      ],
      resources: [
        { id: 'res-3-1', title: 'Support SLA Template', type: 'template', description: 'Response times' },
        { id: 'res-3-2', title: 'FAQ & Solutions', type: 'guide', description: 'Respuestas rápidas' },
        { id: 'res-3-3', title: 'Support Training Guide', type: 'guide', description: 'Empatía + velocidad' }
      ]
    },
    {
      id: 'lesson-4',
      number: 4,
      title: 'Medición: NPS y metrics que predicen futuro',
      duration: 30,
      keyPoints: [
        'NPS = predictor #1 de crecimiento',
        'Medir es requisito. Actuar es éxito.',
        'Small improvements compuestos = 10x LTV',
        'Dashboard de customer health = early warning system'
      ],
      content: `
        Métricas que importan:

        1. NPS (Net Promoter Score)
        Pregunta: "¿Qué tan probable es que refiera?"
        Escala: 0-10
        
        Cálculo:
        % Promoters (9-10) - % Detractors (0-6)
        
        Ejemplo: 60% promoters, 10% detractors = NPS 50
        
        Benchmark:
        <0: Crítico (arreglá ya)
        0-30: Mejorando
        30-50: Bueno
        50+: Excelente

        2. CHURN RATE
        Clientes que se van cada mes
        
        Formula: Clientes que salieron / clientes inicio mes
        
        Ejemplo: 50 clientes inicio, 3 se van
        Churn = 6%
        
        Objetivo: <5%

        3. LTV (Lifetime Value)
        Dinero total que cliente gasta con tigo
        
        Formula: ARPU × Customer lifetime
        
        Ejemplo:
        Cliente paga $100/mes
        Promedio dura 24 meses
        LTV = $2400
        
        Objetivo: Aumentar 10% anual

        4. CAC (Customer Acquisition Cost)
        Cuánto cuesta traer 1 cliente
        
        Formula: Marketing spend / Nuevos clientes
        
        Ejemplo: Gastas $10K en marketing
        Traes 50 clientes nuevos
        CAC = $200
        
        Objetivo: CAC < LTV/3

        5. PAYBACK PERIOD
        Cuánto tiempo para recuperar CAC
        
        Formula: CAC / Monthly profit per customer
        
        Ejemplo: CAC $200, profit/mes $50
        Payback = 4 meses
        
        Objetivo: <12 meses

        DASHBOARD CUSTOMER:
        Métrica       | Objetivo | Actual | Trend
        NPS           | 50       | 48     | ↑
        Churn %       | <5%      | 6%     | ↓ (alerta)
        LTV           | $3K      | $2.5K  | ↑
        CAC           | $200     | $250   | ↓ (alerta)
        Payback       | <12mo    | 10mo   | ✓

        Revisión: Monthly
        Si algo rojo: investigar + acción inmediata
      `,
      caseStudy: {
        company: 'SaaS Chile',
        problem: 'No medía NPS. "Creíamos que estaba bien".',
        solution: 'Implementó dashboard: NPS + Churn + LTV + CAC',
        result: 'NPS era 25 (no 50). Churn era 10% (no 5%). Descubrió problemas antes de ser crisis.'
      },
      actionItems: [
        'Envía NPS survey a 100+ clientes (Typeform/Intercom)',
        'Calcula NPS actual',
        'Calcula: Churn, LTV, CAC',
        'Crea dashboard con 5 métricas',
        'Acción: ¿qué cambio para mejorar NPS 5 puntos?'
      ],
      resources: [
        { id: 'res-4-1', title: 'NPS Survey Template', type: 'template', description: 'Typeform ready' },
        { id: 'res-4-2', title: 'Customer Metrics Dashboard', type: 'template', description: 'Google Sheets' },
        { id: 'res-4-3', title: 'Metric Definitions', type: 'guide', description: 'Cómo calcular cada una' }
      ]
    },
    {
      id: 'lesson-5',
      number: 5,
      title: 'Crecimiento viral: Sistema de referral exponencial',
      duration: 40,
      keyPoints: [
        'Mejor cliente es cliente que refiere (LTV +500%)',
        'Referral rate 30%+ = crecimiento exponencial',
        'Referral programa correcta = costo cero',
        'Happy customer es tu mejor advertencia'
      ],
      content: `
        Programa de referral:

        PASO 1: BASE
        Solo clientes FELICES refieren
        
        ¿Tu NPS es <30? STOP. Arregla primero.
        ¿Tu NPS es >40? Lanza referral.

        PASO 2: INCENTIVO
        Qué ofreces por referral exitosa?
        
        Opción A: Dinero
        "$200 por cliente que se convierta"
        ✓ Simple
        ✓ Motivante
        ✗ Costly

        Opción B: Crédito
        "Mes gratis si refieren + convierten"
        ✓ Menos costly
        ✓ Beneficio claro

        Opción C: Exclusiva
        "Features premium gratis 6mo"
        ✓ Low cost
        ✓ Valuable

        Opción D: Comisión
        "20% de primer año del cliente referido"
        ✓ Scalable
        ✓ Motivante para B2B

        Recomendación: Opción B o C (bajo costo, alto impacto)

        PASO 3: FACILIDAD
        Haz referral super fácil
        
        En app:
        [Share] button → URL único
        → Copiable o shareable
        
        Email:
        "Invita amigos" link automático
        
        Tracking:
        Zapier → cuando URL se cliquea → email al referrer

        PASO 4: COMUNICACIÓN
        Recuerda a clientes que pueden referir
        
        Cada 6 meses email:
        "Ama [producto]? Refiera 3, gana [incentivo]"
        
        In app: reminder pequeño
        
        No spam, pero recordatorio

        PASO 5: CELEBRACIÓN
        Refiere + amigo convierte = celebra
        
        Publicamente: "Gracias [nombre], ganaste [incentivo]"
        Emocionalmente: email personal
        
        Convierte en "hero" de comunidad

        METRÍA REFERRAL:
        - % de clientes que refieren (meta 30%)
        - % de referrals que convierten (típico 30-50%)
        - LTV de cliente referido (típicamente +300%)
        
        Ejemplo:
        100 clientes
        30% refieren (30 personas)
        40% conversion (12 nuevos clientes)
        LTV referral +300% vs normal
        
        12 clientes × LTV 3x = crecimiento exponencial
      `,
      caseStudy: {
        company: 'SaaS Latinoamérica',
        problem: 'Crecimiento lento. Sales cost alto.',
        solution: 'Programa referral: "Refiere 1, gana 1 mes gratis"',
        result: '40% de nuevos clientes vienen por referral. CAC cero. Crecimiento 3x.'
      },
      actionItems: [
        'Mide NPS actual: ¿listo para referral? (>40)',
        'Define incentivo (crédito, features, dinero)',
        'Build: share link + tracking en app',
        'Launch: email a mejores clientes',
        'Track: % referrals, % conversion, LTV vs normal'
      ],
      resources: [
        { id: 'res-5-1', title: 'Referral Program Template', type: 'template', description: 'Estructura' },
        { id: 'res-5-2', title: 'Incentive Ideas by Industry', type: 'guide', description: 'Inspiración' },
        { id: 'res-5-3', title: 'Referral Tracking Sheet', type: 'template', description: 'Metrics' },
        { id: 'res-5-4', title: 'Email Sequences', type: 'template', description: 'Pedir referrals' }
      ]
    }
  ],

  tools: [
    { id: 'tool-1', title: 'Intercom', type: 'tool', description: 'Chat + email + support' },
    { id: 'tool-2', title: 'Typeform', type: 'tool', description: 'NPS surveys' },
    { id: 'tool-3', title: 'Calendly', type: 'tool', description: 'Scheduling calls' },
    { id: 'tool-4', title: 'Loom', type: 'tool', description: 'Video onboarding' },
    { id: 'tool-5', title: 'Referral Rock', type: 'tool', description: 'Programa de referrals' }
  ],

  templates: [
    { id: 'tpl-1', title: 'Customer Journey Map', type: 'template', description: 'Experiencia visual' },
    { id: 'tpl-2', title: '30-Day Onboarding', type: 'template', description: 'Día por día' },
    { id: 'tpl-3', title: 'Support SLA', type: 'template', description: 'Response times' },
    { id: 'tpl-4', title: 'Customer Health Dashboard', type: 'template', description: 'NPS + Churn + LTV' },
    { id: 'tpl-5', title: 'Referral Program', type: 'template', description: 'Setup completo' }
  ],

  successMetrics: [
    'NPS 50+ (vs industry average 30)',
    'Churn <5% (vs industry average 10%)',
    'LTV aumentado 50% vs baseline',
    'Customer satisfaction CSAT >90%',
    'Referral rate 30% de nuevos clientes',
    'Customer lifetime >24 meses'
  ],

  nextModule: 'customer-2'
};

export default CUSTOMER_MODULE;
