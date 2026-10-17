/**
 * MÓDULO COMPLETO DE MARKETING
 * Posicionamiento, Contenido y Medición
 */

import { SalesModuleContent } from './sales.module';

export const MARKETING_MODULE: SalesModuleContent = {
  moduleId: 'marketing-1',
  title: 'Posicionamiento: Diferénciate o Desaparece',
  description: 'Crea un posicionamiento tan claro que los clientes correctos te encuentren solos. Domina la propuesta de valor, el storytelling y el branding que vende.',
  objective: 'Definir posicionamiento tan diferenciado que aumentes precio 30% sin perder clientes',
  duration: '3 horas',
  difficulty: 'beginner',

  lessons: [
    {
      id: 'lesson-1',
      number: 1,
      title: 'El posicionamiento es tu arma más valiosa',
      duration: 25,
      keyPoints: [
        'El 90% de startups fracasan por ser genéricos, no por producto malo',
        'Posicionamiento no es logo ni color, es CÓMO dices por qué existes',
        'Un posicionamiento claro multiplica tu precio por 3',
        'Tus competidores NO pueden copiarlo porque es sobre ti, no sobre features'
      ],
      content: `
        Posicionamiento = En qué mente estás y por cuál razón

        PROBLEMA: Eres como todos.
        SOLUCIÓN: Sé diferente donde importa.

        Las empresas que ganan NO tienen mejor producto.
        Tienen mejor HISTORIA.

        Nike no vende zapatillas. Vende "just do it".
        Apple no vende computadoras. Vende "think different".
        Escala Digital no vende cursos. Vende "tu roadmap de crecimiento".

        En este módulo aprenderás:
        - Identificar tu posicionamiento único
        - Comunicarlo en UNA frase
        - Que clientes te encuentren porque SÍ
        - Aumentar precio sin miedo
        - Ganar contra competidores más grandes

        Resultado: Dejas de competir por precio. Compites por valor.
      `,
      caseStudy: {
        company: 'Agencia Web Colombia',
        problem: 'Hacía websites "bonitas" como 50 competidores. Cobraba $500/proyecto.',
        solution: 'Se posicionó como "webs que venden" + casos de ROI. Storytelling fuerte.',
        result: 'Clientes ahora pagan $5000+. 1 venta/mes vs 5 gratis al mes antes. Revenue 1000%.'
      },
      actionItems: [
        'Escribe TU por qué en una frase (no es sobre features)',
        'Identifica 3 características que solo TÚ tienes',
        'Busca 3 empresas con posicionamiento fuerte, analiza cómo lo comunican',
        'Define quién NOOOO es tu cliente (tan importante como quien sí)'
      ],
      resources: [
        {
          id: 'res-1-1',
          title: 'Posicionamiento Canvas 1-página',
          type: 'template',
          description: 'Define tu posición en 5 minutos'
        },
        {
          id: 'res-1-2',
          title: 'Value Proposition Statement',
          type: 'template',
          description: 'La frase que resume todo'
        },
        {
          id: 'res-1-3',
          title: 'Análisis de Posicionamiento de Competidores',
          type: 'worksheet',
          description: 'Mapa visual de quién es quién en tu mercado'
        }
      ]
    },
    {
      id: 'lesson-2',
      number: 2,
      title: 'Storytelling: Cómo contar tu historia para que la recuerden',
      duration: 30,
      keyPoints: [
        'Las personas NO compran lógica, compran EMOCIÓN',
        'Tu historia es más valiosa que tu branding',
        'El framework "Héroe" genera 5x más engagement que features',
        'Cada plataforma necesita tu historia adaptada, no copiada'
      ],
      content: `
        Las mejores marcas cuentan historias.

        ESTRUCTURA DE LA HISTORIA:
        
        Acto 1: EL PROBLEMA (del cliente, no tuyo)
        - "Yo estaba donde tú estás"
        - "Vendía webs lindas pero no vendían"
        - Cliente se identifica = atención
        
        Acto 2: EL GIRO (descubrimiento)
        - "Descubrí que no era el design, era la estrategia"
        - "Empecé a medir ROI, no validez de diseño"
        - "Cambié todo"
        
        Acto 3: LA TRANSFORMACIÓN (resultados)
        - "Hoy mis clientes ganan X dinero con sus webs"
        - "Pasé de 5 gratis/mes a 1 venta premium/mes"
        - "Ahora ayudo a otros con el mismo problema"
        
        BONUS: "Tú puedes tener el mismo resultado"
        
        DÓNDE CONTAR LA HISTORIA:
        - Website: versión completa (3-4 min lectura)
        - LinkedIn: párrafos cortos (2 párrafos)
        - Instagram: visual + caption (30 segundos)
        - Email: la razón por la que escribes (toda la lección)
        
        RESULTADO: Cliente se ve en TU historia, se imagina como protagonista.
      `,
      caseStudy: {
        company: 'SaaS B2B España',
        problem: 'Explicaban features. 2% conversion rate.',
        solution: 'Contaron historia del fundador: "Pasé 10 años desperdiciando dinero en tools inútiles"',
        result: '12% conversion rate. Mismos features. Mejor historia.'
      },
      actionItems: [
        'Escribe tu propia historia (Acto 1, 2, 3)',
        'Adapta tu historia para: Website, LinkedIn, Instagram',
        'Pide a 3 clientes que cuenten TU historia con sus propias palabras',
        'Identifica las emociones que genera tu historia'
      ],
      resources: [
        {
          id: 'res-2-1',
          title: 'Hero\'s Journey Framework',
          type: 'template',
          description: 'El patrón que todas las historias exitosas usan'
        },
        {
          id: 'res-2-2',
          title: 'Story Adaptation Guide',
          type: 'guide',
          description: 'Cómo contar la misma historia en diferentes plataformas'
        },
        {
          id: 'res-2-3',
          title: 'Emotional Triggers Checklist',
          type: 'worksheet',
          description: 'Mide qué emociones genera tu historia'
        }
      ]
    },
    {
      id: 'lesson-3',
      number: 3,
      title: 'Contenido que vende: Estrategia de contenido que atrae clientes',
      duration: 35,
      keyPoints: [
        'Contenido NO es articles aleatorios. Es sistema.',
        'El 80% de startups fallan porque no tienen content strategy',
        'Contenido correcto = clientes encontrándote cuando buscan solución',
        'Pillar content + cluster content = SEO + ventas'
      ],
      content: `
        Contenido es tu vendedor 24/7.

        TIPOS DE CONTENIDO (en orden de venta):
        
        1. AWARENESS: "No sabía que tenía este problema"
        - Blog posts en SEO
        - Videos educativos
        - Guías gratuitas
        - Objetivo: que te descubran
        
        2. CONSIDERATION: "Sé que existe, ahora qué?"
        - Case studies
        - Comparativas
        - Webinars
        - Objetivo: que sepan por qué TÚ
        
        3. DECISION: "Ya decido entre opciones"
        - Demostraciones
        - Testimonios video
        - Prueba gratis
        - Objetivo: que compren
        
        ESTRUCTURA PILLAR + CLUSTER:
        
        PILLAR: "Cómo aumentar ventas" (1 mega-artículo)
          ├─ CLUSTER: "Email marketing para ventas"
          ├─ CLUSTER: "Sales funnel B2B"
          ├─ CLUSTER: "Prospección efectiva"
          └─ CLUSTER: "Cierre de ventas"
        
        Resultado: Google te rankea como autoridad.
        
        CADENCIA:
        - 2 pillar articles / mes
        - 4 cluster articles / mes
        - 2 videos / mes
        - Daily: Social media
        
        MÉTRICA QUE IMPORTA:
        No es visits. Es leads cualificados.
        No es seguidores. Es conversiones.
      `,
      caseStudy: {
        company: 'Consultoría Tech Argentina',
        problem: 'No tenía content. Clientes llegaban por referencia (no scalable).',
        solution: 'Creó pillar content sobre "transformación digital" con 8 clusters. SEO 6 meses.',
        result: '50% nuevos clientes de Google. Mismo costo que antes, 3x clientes.'
      },
      actionItems: [
        'Define tu PILLAR topic (el tema principal que dominas)',
        'Brainstorm 8 CLUSTER topics relacionados',
        'Escribe 1 pillar article (2000+ palabras)',
        'Prepara calendario de contenido para 3 meses',
        'Setup Google Search Console para trackear'
      ],
      resources: [
        {
          id: 'res-3-1',
          title: 'Pillar + Cluster Framework',
          type: 'template',
          description: 'Estructura completa de content strategy'
        },
        {
          id: 'res-3-2',
          title: 'Content Calendar Template',
          type: 'template',
          description: '3 meses planificados'
        },
        {
          id: 'res-3-3',
          title: 'SEO Checklist por Article',
          type: 'worksheet',
          description: 'No olvides nada en tu artículo'
        }
      ]
    },
    {
      id: 'lesson-4',
      number: 4,
      title: 'Medición: Cómo saber si tu marketing REALMENTE funciona',
      duration: 30,
      keyPoints: [
        'Marketing sin medición es adivinar',
        'La mayoría mide vanity metrics (visits, likes). Debería medir ROI.',
        'Solo 3 métricas importan: CAC, LTV, y conversion rate',
        'Si tu CAC > LTV, estás quebrado aunque veas growth'
      ],
      content: `
        Las 3 métricas que importan:

        1. CAC (Customer Acquisition Cost)
        Cuánto cuesta adquirir un cliente

        Fórmula: Gasto marketing / Clientes nuevos
        Ejemplo: Gasté $1000, obtuve 5 clientes = $200 CAC
        
        ✓ Bueno: $200
        ✗ Malo: $500+
        
        2. LTV (Lifetime Value)
        Cuánto dinero ganas de un cliente en su vida

        Fórmula: (Precio * Duración promedio) - Churn
        Ejemplo: $1000/mes * 24 meses = $24,000 LTV
        
        CAC debe ser 3x menor que LTV
        Si CAC $500 y LTV $24,000 = Bueno
        Si CAC $500 y LTV $600 = Quebrado
        
        3. CONVERSION RATE
        % de visitantes que se convierten en clientes

        2-5% es normal
        10%+ es excelente
        <1% = problema
        
        VANITY METRICS (no importan):
        ✗ Visits, followers, likes
        ✓ Importa: Leads cualificados, clientes, revenue

        DASHBOARD BÁSICO:
        - Visitantes únicos → Leads → Clientes → Revenue
        - Costo por cada etapa
        - Conversión en cada etapa
      `,
      caseStudy: {
        company: 'AgenciaDigital México',
        problem: 'Reportaban "10K visitas/mes" pero no sabían si ganaban dinero',
        solution: 'Arman dashboard: CAC, LTV, conversion. Descubren que estaban quebrados.',
        result: 'Cortaron canales inútiles. Enfocaron 5x en lo que funciona. ROI positivo en 3 meses.'
      },
      actionItems: [
        'Calcula tu CAC (suma gastos marketing últimos 3 meses, divide por clientes)',
        'Calcula tu LTV (cuánto dinero gana promedio un cliente)',
        'Compara: ¿CAC es 3x menor que LTV?',
        'Setup Google Analytics 4 con conversiones reales',
        'Crea dashboard semanal: visits → leads → clientes'
      ],
      resources: [
        {
          id: 'res-4-1',
          title: 'Métricas de Marketing Dashboard',
          type: 'template',
          description: 'Google Sheets con fórmulas automáticas'
        },
        {
          id: 'res-4-2',
          title: 'CAC vs LTV Calculator',
          type: 'tool',
          description: 'Calcula en segundos'
        },
        {
          id: 'res-4-3',
          title: 'Analytics Setup Guide',
          type: 'guide',
          description: 'GA4 correctamente configurado'
        }
      ]
    },
    {
      id: 'lesson-5',
      number: 5,
      title: 'Marketing escalable: Sistema que crece sin ti',
      duration: 40,
      keyPoints: [
        'Si todo depende de ti, no es negocio, es trabajo',
        'Marketing automático = email sequences + content + ads',
        'El mejor marketing escala mientras duermes',
        'Invertir en automatización multiplica resultado 10x'
      ],
      content: `
        Marketing que no requiere tu tiempo.

        COMPONENTES DEL SISTEMA:

        1. EMAIL SEQUENCES (lo más ROI-positivo)
        - Welcome sequence (5 emails)
        - Educational sequence (10 emails)
        - Sales sequence (7 emails)
        - Retención sequence (mensual)
        
        Setup: 1 semana
        Resultado: 30-40% de tus ventas viene automático
        
        2. CONTENT AUTOMATION
        - 1 pillar + 4 clusters/mes = ciclo completo
        - Reutiliza en 6 formatos (blog, video, email, LinkedIn, Instagram, podcast)
        - 1 idea = 60 posts
        
        3. ADS AUTOMÁTICOS
        - Retargeting: 95% de gente se va sin comprar
        - Audiences similares: amplifica tu mejor cliente
        - Lookalike: encuentra clones de tu cliente ideal
        
        4. PARTNERSHIPS & REFERRAL
        - Acuerdos de comisión con complementarios
        - Sistema de referencia interna
        - Affiliate program
        
        RESULTADO:
        - Inviertes tiempo 1 vez
        - Sistema funciona 100 veces
        
        HERRAMIENTAS:
        - Email: Brevo, Mailchimp, ConvertKit
        - Content: Buffer, Later, Hootsuite
        - Ads: Facebook Ads, Google Ads
        - CRM: HubSpot, Pipedrive
      `,
      caseStudy: {
        company: 'Startup SaaS Perú',
        problem: 'Fundador 80% del tiempo en marketing táctico. No escalaba.',
        solution: 'Automatizan: email sequences, content calendar, retargeting',
        result: 'Dedica 5h/semana a marketing. Sistema genera 50% de clientes nuevos. Revenue 3x.'
      },
      actionItems: [
        'Diseña tu 5-email welcome sequence',
        'Prepara tu content calendar para auto-publicar 3 meses',
        'Setup email automation tool (Brevo es gratis)',
        'Diseña 1 landing page con email capture',
        'Crea sistema de referencia (incentivo + tracking)',
        'Prepara audiences de retargeting para ads'
      ],
      resources: [
        {
          id: 'res-5-1',
          title: 'Email Sequence Templates (5 tipos)',
          type: 'template',
          description: 'Copia, adapta, usa'
        },
        {
          id: 'res-5-2',
          title: 'Marketing Automation Stack',
          type: 'guide',
          description: 'Mejores herramientas 2024'
        },
        {
          id: 'res-5-3',
          title: 'Content Repurposing Framework',
          type: 'template',
          description: '1 idea = 6 formatos'
        },
        {
          id: 'res-5-4',
          title: 'Referral Program Setup',
          type: 'guide',
          description: 'Paso a paso'
        }
      ]
    }
  ],

  tools: [
    { id: 'tool-1', title: 'Ahrefs', type: 'tool', description: 'SEO y análisis de competencia' },
    { id: 'tool-2', title: 'Figma', type: 'tool', description: 'Diseño rápido de landing pages' },
    { id: 'tool-3', title: 'Brevo', type: 'tool', description: 'Email marketing gratis + automation' },
    { id: 'tool-4', title: 'Google Analytics 4', type: 'tool', description: 'Medición correcta' },
    { id: 'tool-5', title: 'Notion', type: 'tool', description: 'Content calendar y tracker' }
  ],

  templates: [
    { id: 'tpl-1', title: 'Posicionamiento Canvas', type: 'template', description: 'Define tu posición' },
    { id: 'tpl-2', title: 'Content Calendar 3-meses', type: 'template', description: 'Planificado' },
    { id: 'tpl-3', title: 'Email Sequences Completas', type: 'template', description: '5 tipos listos' },
    { id: 'tpl-4', title: 'Landing Page Copy', type: 'template', description: 'Alta conversión' },
    { id: 'tpl-5', title: 'Marketing Dashboard', type: 'template', description: 'Métricas que importan' }
  ],

  successMetrics: [
    'Definir posicionamiento tan claro que aumentes precio 30%',
    'Crear historia de marca que clientes compartan',
    'Generar 50+ leads cualificados mensuales desde content',
    'Convertir 5%+ de leads en clientes (vs 1-2% promedio)',
    'Reducir CAC 50% con marketing automation',
    'Sistema que genera clientes mientras duermes'
  ],

  nextModule: 'marketing-2'
};

export default MARKETING_MODULE;
