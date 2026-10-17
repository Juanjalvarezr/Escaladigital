/**
 * MÓDULO COMPLETO DE VENTAS
 * Contenido real, lecciones, recursos, plantillas y herramientas
 * Integrado completamente con el flujo de la app
 */

export interface SalesLesson {
  id: string;
  number: number;
  title: string;
  duration: number; // en minutos
  keyPoints: string[];
  content: string;
  caseStudy?: {
    company: string;
    problem: string;
    solution: string;
    result: string;
  };
  actionItems: string[];
  resources: SalesResource[];
}

export interface SalesResource {
  id: string;
  title: string;
  type: 'template' | 'tool' | 'checklist' | 'guide' | 'video' | 'worksheet';
  description: string;
  downloadUrl?: string;
  content?: string;
}

export interface SalesModuleContent {
  moduleId: string;
  title: string;
  description: string;
  objective: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lessons: SalesLesson[];
  tools: SalesResource[];
  templates: SalesResource[];
  successMetrics: string[];
  nextModule: string;
}

export const SALES_MODULE: SalesModuleContent = {
  moduleId: 'sales-1',
  title: 'Prospección: Abre Oportunidades Reales',
  description: 'Aprende a identificar y contactar clientes potenciales de forma efectiva. Domina técnicas de prospe para crear un pipeline sólido que asegure el crecimiento constante de tu negocio.',
  objective: 'Generar 5x más oportunidades de venta cualificadas en los próximos 30 días',
  duration: '3 horas',
  difficulty: 'beginner',
  
  lessons: [
    {
      id: 'lesson-1',
      number: 1,
      title: '¿Por qué la prospección es tu mejor arma?',
      duration: 25,
      keyPoints: [
        'El 80% del crecimiento en ventas viene de prospectos bien identificados',
        'La prospección sistemática evita la dependencia de referencias',
        'Un buen prospecto vale 10 contactos casuales',
        'El timing correcto multiplica tus conversiones por 3'
      ],
      content: `
        La prospección no es pedir, es buscar personas que ya necesitan lo que vendes.
        
        En este módulo aprenderás a:
        - Identificar exactamente quién es tu cliente ideal
        - Dónde encontrarlo (online y offline)
        - Cómo contactarlo sin sonar como vendedor
        - Cuándo es el momento exacto para hablar
        
        Resultado esperado: Un pipeline visible, medible y predecible.
        
        La diferencia entre prosperar y desaparecer está en la prospección.
        Sin prospectos, tu negocio se muere en 90 días.
        Con sistema de prospección, crece sin depender de suerte.
      `,
      caseStudy: {
        company: 'TechSmart Solutions',
        problem: 'Vendían soluciones B2B pero solo por referencia. Sin pipeline, los meses eran impredecibles.',
        solution: 'Implementaron sistema de prospección en LinkedIn + email secuencias. 3 prospectos diarios.',
        result: '18 oportunidades calientes en 60 días. Revenue +340% sin aumentar presupuesto de marketing.'
      },
      actionItems: [
        'Descarga el ICP (Ideal Customer Profile) template',
        'Define 3 segmentos de clientes ideales',
        'Identifica 10 características que hace a un prospecto "caliente"',
        'Anota dónde están tus clientes ideales (LinkedIn, eventos, forums, etc)'
      ],
      resources: [
        {
          id: 'res-1-1',
          title: 'ICP Canvas - Define tu Cliente Ideal',
          type: 'template',
          description: 'Template visual para definir exactamente quién es tu prospecto perfecto',
          content: `
            SEGMENTO 1: Decisores técnicos
            - Industria: _______
            - Tamaño empresa: _______
            - Rol específico: _______
            - Dolor principal: _______
            - Budget anual: _______
            - Proceso de compra: _______
            
            SEGMENTO 2: Decisores económicos
            - Mismo análisis...
            
            SEGMENTO 3: Influenciadores
            - Mismo análisis...
            
            BONUS: Dónde encontrarlos digitalmente
            - LinkedIn: búsqueda __________
            - Twitter: hashtags __________
            - Forums/comunidades: __________
            - Eventos: __________
          `
        },
        {
          id: 'res-1-2',
          title: 'Matriz de Prospección',
          type: 'worksheet',
          description: 'Clasifica tus prospectos por potencial y urgencia'
        },
        {
          id: 'res-1-3',
          title: 'Guía: Los 7 lugares donde están tus clientes',
          type: 'guide',
          description: 'Dónde buscar prospectos según tu industria (online y offline)'
        }
      ]
    },
    {
      id: 'lesson-2',
      number: 2,
      title: 'Fuentes de prospectos: de 0 a 100 contactos en 24h',
      duration: 30,
      keyPoints: [
        'Hay 5 fuentes de prospectos que funcionan (y cómo usarlas)',
        'LinkedIn te da 500 contactos calientes sin pedir permiso',
        'Google Maps y directorios B2B ocultan minas de oro',
        'Los prospectos "fríos" no existen: solo contactos sin contexto'
      ],
      content: `
        No tienes prospects? Los tienes en frente tuyo.
        
        FUENTE 1: LinkedIn Search
        - Busca por ubicación, industria, rol
        - 20 minutos = 50 perfiles
        - Costo: tiempo
        
        FUENTE 2: Directorios B2B
        - Hunter.io, RocketReach, Apollo, Clearbit
        - Emails validados en segundos
        - Costo: $30-200/mes
        
        FUENTE 3: Google Maps + Web
        - Busca "plomeros en Miami" = 200 contactos
        - Extrae datos con web scraping manual
        - Costo: tiempo
        
        FUENTE 4: Eventos + Conferencias
        - Asistes, tomas 20-30 contactos
        - Contactas en 24h mientras te recuerdan
        - Costo: entrada + travel
        
        FUENTE 5: Partner + Referencia sistemática
        - Paga a partners por referencias
        - Sistema de referencia internos
        - Costo: comisión
        
        META: 100 prospectos identificados y anotados en 24 horas.
      `,
      caseStudy: {
        company: 'SaaS Startup Colombia',
        problem: 'Tenían producto pero 0 contactos en su industria target',
        solution: 'Combinaron LinkedIn + Hunter + directorios locales. 3 personas, 2 horas.',
        result: '127 emails validados. Tasa de respuesta inicial 34% (vs promedio 5%)'
      },
      actionItems: [
        'Abre LinkedIn hoy',
        'Busca 50 prospectos en 1 hora (sé específico con filtros)',
        'Crea cuenta en Hunter.io o RocketReach',
        'Exporta 50 emails validados',
        'Crea hoja de cálculo con: nombre, email, empresa, rol, LinkedIn'
      ],
      resources: [
        {
          id: 'res-2-1',
          title: 'LinkedIn Search Pro Tips (Video)',
          type: 'video',
          description: '5 filtros avanzados que 99% no conoce. +200% resultados.'
        },
        {
          id: 'res-2-2',
          title: 'Template de Prospecting List',
          type: 'template',
          description: 'Excel/Sheets con columnas: Nombre, Email, Empresa, Rol, LinkedIn, Contactado, Respuesta, Siguiente acción'
        },
        {
          id: 'res-2-3',
          title: 'Herramientas de Email Finder Comparadas',
          type: 'guide',
          description: 'Hunter vs RocketReach vs Apollo vs Clay - cuál usar según tu presupuesto'
        }
      ]
    },
    {
      id: 'lesson-3',
      number: 3,
      title: 'Primer contacto: Cómo escribir un mensaje que ABRE respuestas',
      duration: 35,
      keyPoints: [
        'El primer email determina si te responden o no',
        'La mayoría de vendedores cometen el mismo error fatal: hablar de sí mismos',
        '3 elementos = 40%+ de respuesta vs 2% del template generic',
        'La personalización toma 2 minutos y multiplica tus resultados por 5'
      ],
      content: `
        El primer contacto es decisivo. Aquí está la fórmula que funciona:
        
        ESTRUCTURA DEL PRIMER EMAIL:
        
        1. LÍNEA DE ASUNTO (65 caracteres MAX)
        - Específico, NO "marketing"
        - Evita: "Hi [name]", "Quick question"
        - Usa: "3 empresas como [Company] que crecen 40%+ con [solution]"
        - Prueba: números, específico, resultado
        
        2. ABERTURA (3 líneas)
        - Menciona algo de ELLOS, no de ti
        - "Vi que en tu blog escribiste sobre [tema]..."
        - "Trabajamos con [competidor/similar] en tu industria..."
        - Muestra que no es template
        
        3. LA RAZÓN (2 líneas)
        - Por qué los contactas AHORA
        - No es porque estés disponible
        - Es porque tienen un problema/oportunidad
        - "Porque [insight sobre su industria]"
        
        4. LA PROPUESTA (1 párrafo)
        - NO: "Somos líderes en..."
        - SÍ: "En empresas como la tuya, hemos visto que [resultado]"
        - Concreta, una promesa, una métrica
        
        5. LA LLAMADA A ACCIÓN
        - Simple y fácil
        - "¿15 minutos para hablar sobre cómo [resultado]?"
        - NO: "Espero tu contacto"
        - SÍ: Dame sí o no
        
        TOTAL: 75-100 palabras. Sin fluff.
        
        SECUENCIA: 
        Email 1 → 3 días → Email 2 (diferente ángulo)
        → 4 días → Email 3 (despedida o alternativa)
        → 7 días → Email 4 (social proof)
      `,
      caseStudy: {
        company: 'Agencia Digital Perú',
        problem: 'Enviaba 50 emails al día, 1% respuesta',
        solution: 'Cambió template genérico por formula personalizada + secuencias',
        result: '50 emails, 8-10 respuestas (18-20%). Mismos prospectos, mejor mensaje.'
      },
      actionItems: [
        'Escribe 3 variaciones de line de asunto para tu propuesta',
        'Escribe email 1 con los 5 elementos (no copiar-pegar)',
        'Escribe email 2 y 3 de follow-up (diferente ángulo cada una)',
        'Pídele feedback a colega: ¿te lo enviarías a ti mismo?',
        'Prepara 20 personalizaciones pequeñas (no templates)'
      ],
      resources: [
        {
          id: 'res-3-1',
          title: 'Template de Email con 40%+ Respuesta',
          type: 'template',
          description: 'Copia la estructura, personaliza los detalles, úsalo'
        },
        {
          id: 'res-3-2',
          title: 'Email Sequences Completas por Industria',
          type: 'guide',
          description: '4 secuencias listas: SaaS, Agencias, Consultoría, E-commerce'
        },
        {
          id: 'res-3-3',
          title: 'A/B Testing: Subject Lines que Ganan',
          type: 'worksheet',
          description: 'Registra tus intentos, mide respuestas, optimiza'
        }
      ]
    },
    {
      id: 'lesson-4',
      number: 4,
      title: 'Clasificación de prospectos: Quién es oro y quién es ruido',
      duration: 20,
      keyPoints: [
        'No todos los "sí" son iguales. Algunos valen 10x más.',
        'Clasificar mal quema tu tiempo en clientes que nunca compran',
        'La matriz de BANT te da clarity en 5 minutos',
        'Los warm leads no se tocan igual que los fríos'
      ],
      content: `
        Una vez que tienes respuesta, ¿es este un buen prospecto?
        
        Usa BANT:
        
        B - BUDGET: ¿Tienen dinero?
        Pregunta: "¿Cuál es tu presupuesto aproximado?"
        ✓ Contestan número: cualificado
        ✗ "No tenemos presupuesto ahora": descarta
        
        A - AUTHORITY: ¿Es quien decide?
        Pregunta: "¿Eres la persona que toma esta decisión?"
        ✓ Sí + tienes autoridad: avanza
        ✗ "Tengo que hablar con [otra persona]": ruta diferente
        
        N - NEED: ¿Tienen el problema que resuelves?
        Pregunta: "¿Cuál es tu mayor dolor con [tema]?"
        ✓ Identifica tu problema: oro puro
        ✗ "Todo está bien": no es ahora
        
        T - TIMELINE: ¿Cuándo decidirán?
        Pregunta: "¿Cuándo necesitarían esto resuelto?"
        ✓ "En los próximos 30 días": HOT LEAD
        ✗ "Quién sabe, en un año": COLD LEAD
        
        RESULTADO:
        - Green: BANT 4/4 = Encima inmediatamente
        - Yellow: BANT 2-3/4 = Nurture, sigue en contacto
        - Red: BANT 0-1/4 = Pausa, retoma en 6 meses
      `,
      caseStudy: {
        company: 'B2B SaaS Chile',
        problem: 'Asignan mismo esfuerzo a todos, pierden tiempo',
        solution: 'Implementan BANT en 1a call, clasifican en 3 categorías',
        result: 'Enfoque 70% del tiempo en BANT green. Closing rate 35% vs 8% antes.'
      },
      actionItems: [
        'Crea hoja de cálculo con columnas: Prospecto, B, A, N, T, Clasificación',
        'Toma tus últimos 10 prospectos, clasifica cada uno',
        'Para GREEN: agenda call de discovery en 24h',
        'Para YELLOW: agrega a secuencia de nurture',
        'Para RED: no contactes, recupera en 6 meses'
      ],
      resources: [
        {
          id: 'res-4-1',
          title: 'BANT Scoring Template',
          type: 'template',
          description: 'Hoja de cálculo con fórmula. Asigna puntos, automático resultado.'
        },
        {
          id: 'res-4-2',
          title: 'Preguntas BANT Específicas por Industria',
          type: 'guide',
          description: 'SaaS, Servicios, Productos - preguntas adaptadas'
        },
        {
          id: 'res-4-3',
          title: 'Follow-up Secuencias por Clasificación',
          type: 'worksheet',
          description: 'Qué hacer con cada tipo (Green/Yellow/Red)'
        }
      ]
    },
    {
      id: 'lesson-5',
      number: 5,
      title: 'Prospección automática: Sistema que funciona sin ti',
      duration: 40,
      keyPoints: [
        'No puedes crecer si todo depende de tu tiempo',
        'Un sistema te da 10 oportunidades mientras duermes',
        'Automatización NO es dejar trabajar solo, es enfocarte en lo que importa',
        'El ROI de un buen sistema de prospección es 300% en 6 meses'
      ],
      content: `
        Llegó el momento de escalar lo que funcionó.
        
        COMPONENTES DEL SISTEMA:
        
        1. HERRAMIENTAS
        - Hunter.io: busca y valida emails automáticamente
        - Apollo.io: prospecting + outreach centralizado
        - Lemlist: sequences personalizadas con variables dinámicas
        - Zapier: conecta todo
        
        2. FLUJO AUTOMÁTICO
        Paso 1: Base de datos de prospectos (100+ semanales)
        Paso 2: Email 1 automático (pero personalizado)
        Paso 3: Si no responden → Email 2 automático
        Paso 4: Si abre pero no responde → Email 3 + alternativa
        Paso 5: Si responden → ¡A ti, ventas entra en acción!
        
        3. TRACKING
        - Abre rate: debería ser 25%+
        - Click rate: debería ser 10%+
        - Reply rate: debería ser 8-15%
        - Meeting booked: debería ser 1-2% de enviados
        
        4. OPTIMIZACIÓN
        - Cada 2 semanas: revisa qué tipo de email genera más replies
        - Cada mes: cambio 1 elemento (subject, opening, CTA)
        - Cada trimestre: cambia completamente la estrategia si no funciona
        
        TU TIEMPO AHORA:
        - 2 horas/semana: actualizas estrategia y prospectos
        - El sistema genera 30-50 conversaciones/semana automáticamente
        - TÚ: te enfocas en cerrar, no en buscar
        
        RESULTADO: Prospección que no te quita tiempo sino que lo multiplica.
      `,
      caseStudy: {
        company: 'Consultoría México',
        problem: 'Fundador pasaba 80% del tiempo prospectando, nada cerrando',
        solution: 'Delegó prospección a sistema + asistente. Setup 2 semanas.',
        result: 'Sistema genera 20 oportunidades/semana. Fundador cierra 3-4/semana. Revenue 500% arriba.'
      },
      actionItems: [
        'Elige 1 herramienta (Apollo es la más completa)',
        'Carga 100 prospectos de tus búsquedas anteriores',
        'Prepara 3 secuencias de email (initial, follow-up, follow-up 2)',
        'Programa el primer envío',
        'Crea dashboard para monitorear abre rate y reply rate',
        'Setup Zapier para que replies se vayan a tu CRM automáticamente',
        'Deja correr 2 semanas, ajusta, repite'
      ],
      resources: [
        {
          id: 'res-5-1',
          title: 'Stack de Herramientas Recomendadas 2024',
          type: 'guide',
          description: 'Apollo vs Lemlist vs Instantly. Pros/cons y costo.'
        },
        {
          id: 'res-5-2',
          title: 'Template de Automation Workflow',
          type: 'template',
          description: 'Diagrama visual: si responde → acción, si no → sigue secuencia'
        },
        {
          id: 'res-5-3',
          title: 'Dashboard de Prospección',
          type: 'worksheet',
          description: 'Monitorea: enviados, abiertos, respuestas, meetings booked, cierre'
        },
        {
          id: 'res-5-4',
          title: 'Zapier Setup Guide: Hunter → Apollo → Gmail → CRM',
          type: 'guide',
          description: 'Paso a paso: automación total sin código'
        }
      ]
    }
  ],

  tools: [
    {
      id: 'tool-1',
      title: 'LinkedIn Pro: Búsqueda Avanzada',
      type: 'tool',
      description: 'Filtros que LinkedIn no promociona pero que triplicar tus resultados'
    },
    {
      id: 'tool-2',
      title: 'Hunter.io',
      type: 'tool',
      description: 'Encuentra emails de cualquier persona en cualquier empresa. Validado.'
    },
    {
      id: 'tool-3',
      title: 'Apollo.io',
      type: 'tool',
      description: 'La navaja suiza de prospecting. Busca, enriquece, contacta, trackea.'
    },
    {
      id: 'tool-4',
      title: 'Lemlist',
      type: 'tool',
      description: 'Envía sequences personalizadas con tracking real (quién abre, quién responde)'
    },
    {
      id: 'tool-5',
      title: 'Google Maps + Web Scraper',
      type: 'tool',
      description: 'No necesitas herramienta de pago. Con estos 2, extraes 500 contactos gratis.'
    }
  ],

  templates: [
    {
      id: 'tpl-1',
      title: 'Email 1: Contexto + Valor + CTA',
      type: 'template',
      description: 'El primer email. Simple, corto, personalizado.'
    },
    {
      id: 'tpl-2',
      title: 'Email 2: Proof Social',
      type: 'template',
      description: 'Follow-up con caso de éxito similar a su industria'
    },
    {
      id: 'tpl-3',
      title: 'Email 3: Alternativa',
      type: 'template',
      description: 'Último intento: ofrece alternativa u oferta de rescate'
    },
    {
      id: 'tpl-4',
      title: 'Prospecting List (Google Sheets)',
      type: 'template',
      description: 'Template completo con columnas, filtros automáticos, seguimiento.'
    },
    {
      id: 'tpl-5',
      title: 'BANT Discovery Call Script',
      type: 'template',
      description: 'Guión de 15 minutos. Preguntas en orden, sin frotar.'
    },
    {
      id: 'tpl-6',
      title: 'ICP Canvas',
      type: 'template',
      description: 'Define tu cliente perfecto. 1 página. Llena y pegala en tu escritorio.'
    }
  ],

  successMetrics: [
    'Identificar y contactar 100+ prospectos en 1 semana',
    'Lograr 20%+ open rate en emails',
    'Lograr 8%+ reply rate en cold email',
    'Generar 10+ oportunidades cualificadas por semana',
    'Reducir tiempo de prospección a 2 horas/semana (vs 20+ antes)',
    'Crear pipeline visible de 30+ opportunities en diferentes etapas',
    'Implementar sistema de prospección que funciona sin ti'
  ],

  nextModule: 'sales-2'
};

export default SALES_MODULE;
