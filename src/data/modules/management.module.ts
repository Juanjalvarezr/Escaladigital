/**
 * MÓDULO COMPLETO DE GERENCIA
 */

import { SalesModuleContent } from './sales.module';

export const MANAGEMENT_MODULE: SalesModuleContent = {
  moduleId: 'management-1',
  title: 'Liderazgo Estratégico: De Fundador a Líder',
  description: 'Aprende a dirigir gente, tomar decisiones bajo presión y crear una visión que inspire. Transforma tu carisma en autoridad.',
  objective: 'Pasar de emprendedor individual a líder de equipo que escala sin depender de ti',
  duration: '3 horas',
  difficulty: 'beginner',

  lessons: [
    {
      id: 'lesson-1',
      number: 1,
      title: '¿Por qué los fundadores se convierten en cuello de botella?',
      duration: 25,
      keyPoints: [
        'Haces TODO porque nadie entiende como tú. Eso es debilidad, no fortaleza.',
        'Cuando tu empresa crece = tu tiempo no escala. Crisis.',
        'El mejor líder es el que logra resultados SIN estar presente',
        'Delegar no es perder control. Es multiplicar impacto.'
      ],
      content: `
        El problema del crecimiento inicial:

        ETAPA 1: Tú haces todo
        - Ventas, producto, admin, finanzas
        - Funciona porque le dedicas 80 horas/semana
        - Revenue $100K/año

        ETAPA 2: Crecimiento lento
        - Revenue crece a $500K pero tú no
        - Trabajas 120 horas/semana (insostenible)
        - Prefieres hacer que delegar (es más rápido ahora)
        - Crisis: producto sufre o ventas caen

        ETAPA 3: Escalamiento (o fracaso)
        - Tienes que elegir: crecer a través de gente O quedarte pequeño
        - Si no aprendes a liderar = tu empresa muere
        - Si aprendes = revenue escala 10x sin que trabajes más

        LA SOLUCIÓN: VISIÓN + CLARIDAD + CONFIANZA

        1. VISIÓN: ¿A dónde vamos?
        2. CLARIDAD: ¿Quién hace qué?
        3. CONFIANZA: ¿Confío en que lo harán bien?

        En este módulo aprenderás las 3.
      `,
      caseStudy: {
        company: 'Startup Tech Chile',
        problem: 'CEO hacía TODA la prospección. No escalaba porque no había tiempo.',
        solution: 'Contrató sales person. CEO tenía miedo de soltarla. Entrenamiento 4 semanas.',
        result: 'Sales person cierra 20 deals/mes (CEO cerraba 5). CEO ahora hace estrategia + operaciones.'
      },
      actionItems: [
        'Honestamente: ¿cuántas horas trabaja tu rol que NO te corresponde?',
        'Identifica 3 tareas que otro podría hacer 80% bien',
        'Calcula cuánto cuesta tu tiempo (revenue/horas trabajadas)',
        'Define qué solo TÚ puedes hacer (estrategia, visión, principales decisiones)'
      ],
      resources: [
        { id: 'res-1-1', title: 'CEO Time Audit', type: 'worksheet', description: 'Dónde se va tu tiempo' },
        { id: 'res-1-2', title: 'Delegation Matrix', type: 'template', description: 'Qué delegar' },
        { id: 'res-1-3', title: 'Role Definition Canvas', type: 'template', description: 'Tu rol vs otros' }
      ]
    },
    {
      id: 'lesson-2',
      number: 2,
      title: 'Comunicación efectiva: Cómo tu mensaje penetra en la gente',
      duration: 30,
      keyPoints: [
        'La mayoría de conflictos vienen de mala comunicación, no mala gente',
        'Tu verdad NO es LA verdad. Necesitas traducirla para cada persona',
        'El feedback constructivo multiplica productividad 3x',
        'Comunicación + feedback = el 80% del liderazgo'
      ],
      content: `
        Comunicación es tu herramienta más poderosa.

        PRINCIPIOS:

        1. CLARIDAD
        - Sé tan específico que no haya dudas
        - NO: "Queremos crecer"
        - SÍ: "Q3 objetivo es 50 clientes nuevos, +$200K revenue"
        
        2. CONTEXTO
        - Por qué es importante
        - Cómo afecta al negocio y a ellos
        - Qué sucede si no lo logramos
        
        3. EMPATHY
        - Entiende por qué pueden no querer hacerlo
        - Dirígete a motivaciones (dinero, reconocimiento, growth, estabilidad)
        - "Esto te ayudará a..." vs "necesito que..."
        
        4. FEEDBACK LOOP
        - No es crítica. Es crecimiento.
        - "Vi que X resultado. Observé Y. ¿Qué pasó? ¿Cómo podemos mejorar?"
        - Vs "Hiciste mal"
        
        5. ESCUCHA ACTIVA
        - Pregunta más de lo que hablas
        - "¿Qué necesitas de mí?" > cualquier orden
        - Silencio en conversación = espacio para verdad

        FORMULA 1-ON-1 MENSUAL:
        - 15 min: resultados (qué logró)
        - 15 min: retos (qué dificultades)
        - 10 min: desarrollo (cómo crecer)
        - 10 min: alineamiento (próximos 30 días)
        
        RESULTADO: Equipo sabe qué esperas. Tú sabes qué necesitan.
      `,
      caseStudy: {
        company: 'Agencia Buenos Aires',
        problem: 'CEO dicta órdenes. Equipo "no entiende". Rotación 80% anual.',
        solution: 'Implementa 1-on-1 semanal. Crea documento de "valores y principios".',
        result: 'Rotación baja a 10%. Productividad +40%. Equipo pide quedarse.'
      },
      actionItems: [
        'Prepara 1-on-1 semanal con cada directo (30 min mínimo)',
        'Define "valores del equipo" en 1 página',
        'Practica feedback constructivo con próximo error (no crítica)',
        'Documenta decisiones importantes + razón (contexto)'
      ],
      resources: [
        { id: 'res-2-1', title: '1-on-1 Meeting Template', type: 'template', description: 'Estructura' },
        { id: 'res-2-2', title: 'Feedback Framework SBI', type: 'guide', description: 'Situation-Behavior-Impact' },
        { id: 'res-2-3', title: 'Team Values Canvas', type: 'template', description: 'Define principios' }
      ]
    },
    {
      id: 'lesson-3',
      number: 3,
      title: 'Decisiones bajo presión: Cómo elegir bien cuando no tienes 100% info',
      duration: 35,
      keyPoints: [
        'Nunca tendrás 100% de información. Tendrás 70% y deberás decidir.',
        'Parálisis por análisis mata empresas. Velocidad mata competencia.',
        '90% de decisiones son reversibles. Actúa rápido.',
        'El mejor líder decide rápido. El malo no decide.'
      ],
      content: `
        Decisiones = 70% información + 30% intuición.

        PROCESO RÁPIDO:

        1. DIAGNÓSTICO (15 min máx)
        - ¿Qué pasa?
        - ¿Por qué importa?
        - ¿Quiénes afecta?
        - ¿Qué pasaría si no decidimos?

        2. OPCIONES (15 min)
        - 3 opciones mínimo
        - Rápido, no perfecto
        - Cada opción con: beneficios + costos + timeline

        3. DECISIÓN (5 min)
        - Elige la mejor información disponible
        - Si tie empate = opta por rápido + reversible
        - COMUNICA: decisión, razón, cómo medir

        4. EJECUCIÓN (acción)
        - Asigna dueño de resultado
        - Define métrica de éxito
        - Revisa en 30 días

        5. APRENDIZAJE
        - ¿Resultó? ¿Mejor o peor?
        - ¿Qué harías diferente?
        - Documenta para próxima vez similar

        TIPO DE DECISIONES:

        REVERSIBLES (la mayoría):
        - Cambiar herramienta
        - Ajustar proceso
        - Cambiar hire
        Tiempo: decide en horas

        IRREVERSIBLES (pocas):
        - Vender empresa
        - Cambio de negocio
        - Hire leadership
        Tiempo: decide en días

        HEURÍSTICA: "¿Puedo revertirlo?"
        SÍ = decide hoy
        NO = tómate tiempo
      `,
      caseStudy: {
        company: 'Startup México',
        problem: 'CEO paralizado. "Necesito más datos". Competidor decide rápido y gana.',
        solution: 'Implementa proceso de decisión 1 hora. Más acción, menos análisis.',
        result: 'Iteración 4x más rápida. Market share pasa de 5% a 20% en 1 año.'
      },
      actionItems: [
        'Toma la próxima decisión importante con proceso 1-hora',
        'Documenta: opción elegida + razón + métrica de éxito',
        'Revisa en 30 días: resultó bien o no?',
        'Antidoto: "70% información es suficiente"'
      ],
      resources: [
        { id: 'res-3-1', title: 'Decision Framework Template', type: 'template', description: '1-hora process' },
        { id: 'res-3-2', title: 'Reversible vs Irreversible', type: 'worksheet', description: 'Clasificador' },
        { id: 'res-3-3', title: 'Decision Log Template', type: 'template', description: 'Aprende de cada decisión' }
      ]
    },
    {
      id: 'lesson-4',
      number: 4,
      title: 'Gestión del cambio: Cómo tu equipo NO te mata cuando cambias de dirección',
      duration: 30,
      keyPoints: [
        'El 90% de transformaciones fallan porque la gente no quiere',
        'El cambio bien comunicado = oportunidad. Mal comunicado = caos.',
        'Tu equipo necesita VER el futuro antes de correr hacia él',
        'Resistencia no es mala. Es feedback. Escúchala.'
      ],
      content: `
        Cambio es inevitable. Gestión del cambio es arte.

        RESISTENCIA A CAMBIO:

        ¿Por qué tu equipo resiste?
        - Miedo a perder (status, estabilidad, competencia)
        - Falta de entendimiento (qué cambia y por qué)
        - Inercia (siempre hicimos así)
        - Desconfianza (¿en verdad será mejor?)

        SOLUCIÓN = COMUNICACIÓN + CLARIDAD

        FÓRMULA PARA COMUNICAR CAMBIO:

        1. CONTEXTO (qué está pasando)
        - Mercado está cambiando
        - Competidor hace X
        - Clientes demandan Y
        - "Si no cambiamos, en 18 meses estaremos out of business"

        2. VISIÓN (a dónde vamos)
        - Pintura clara del futuro
        - Positiva y emocionante
        - Específica, no genérica
        - "Seremos la referencia en [industria]"

        3. IMPACTO EN ELLOS
        - Qué cambia para cada persona
        - Qué aprenderán
        - Qué oportunidades
        - "Tendrás que aprender X, a cambio ganarás Y"

        4. PLAN (cómo y cuándo)
        - Hitos claros
        - Etapas (no todo de golpe)
        - Apoyo disponible (entrenamiento, recursos)
        - Timeline realista

        5. ESCUCHA (sus miedos)
        - "¿Qué te preocupa?"
        - "¿Qué necesitas para tener confianza?"
        - Ajusta plan según feedback
        - No todos se convencerán. Acepta.

        TIMELINE TÍPICO:
        Semana 1: Comunicación visión
        Semana 2-3: Entrenamiento + questions
        Semana 4: Piloto con early adopters
        Semana 5-6: Rollout completo
        Semana 7-8: Estabilización + ajustes
      `,
      caseStudy: {
        company: 'Consultora Tradicional Perú',
        problem: 'Necesitaba digitalizarse. Equipo senior resistía. "Esto nunca funcionó".',
        solution: 'Comunicó cambio + mostró casos exitosos + entrenamiento + reconoció miedos',
        result: 'Equipo capaz y dispuesto. Transformación tomó 6 meses. Revenue +60% post-cambio.'
      },
      actionItems: [
        'Identifica cambio que necesita tu empresa',
        'Escribe: contexto + visión + impacto en cada rol + plan',
        'Comunica a equipo (no es anuncio, es conversación)',
        'Escucha resistencia = feedback invaluable',
        'Ajusta plan según input'
      ],
      resources: [
        { id: 'res-4-1', title: 'Change Communication Template', type: 'template', description: '5 partes' },
        { id: 'res-4-2', title: 'Resistance Assessment', type: 'worksheet', description: 'Quién apoya y quién resiste' },
        { id: 'res-4-3', title: 'Change Management Timeline', type: 'template', description: '8-semana plan' }
      ]
    },
    {
      id: 'lesson-5',
      number: 5,
      title: 'Construcción de cultura: El sistema que multiplica talento',
      duration: 40,
      keyPoints: [
        'Cultura no es "ping pong en office". Es sistema de valores en acción.',
        'Mejor cultura = mejor gente + mejor retenção + mejor resultados',
        'Si no defines cultura, tu gente crea anarquía',
        'Cultura es el 80% de por qué tu empresa crece o fracasa'
      ],
      content: `
        Cultura = el aire que se respira en tu empresa.

        CONSTRUCCIÓN:

        1. VALORES (qué creemos)
        - No son placa en pared
        - Son decisión, práctica, recompensa
        - 3-5 máximo
        - Ejemplos: Velocidad, Integridad, Crecimiento, Clientes, Autonomía

        2. COMPORTAMIENTOS (cómo actuamos)
        Cada valor tiene comportamientos
        
        Valor: Velocidad
        - Decidimos rápido > perfección
        - Acción > análisis parálisis
        - "Hablaremos en 1 hora, no 1 semana"
        
        3. SISTEMAS
        - Hiring: buscas gente alineada
        - Onboarding: enseñas cultura día 1
        - Recognition: celebras gente que vive valores
        - Correction: removes gente que no alinea
        - Promotion: asciendes gente que ejemplifica cultura
        
        4. RITUALS (cómo lo vivimos)
        - All-hands weekly (transparencia + alineamiento)
        - Retrospectives (aprendemos juntos)
        - Celebrations (ganamos juntos)
        - Defaults (cómo trabajamos por default)
        
        5. DOCUMENTO
        Un documento que define TODO:
        - Values
        - Behaviors
        - Hiring criteria
        - Cómo decimos no
        - Remote/office policy
        - Salario ranges
        - Growth path
        
        RESULTADO: Equipo alinead, autónomo, comprometido.
        Rotación baja, productividad alta, resultados consistentes.
      `,
      caseStudy: {
        company: 'Tech Startup Brasil',
        problem: 'Creció rápido. Cultura diluyó. Equipo desalineado. Conflictos diarios.',
        solution: 'Paró y definió: 4 valores + behaviors + documento cultural',
        result: 'Claridad inmediata. Rotación baja. Equipo se ama. Revenue sigue creciendo.'
      },
      actionItems: [
        'Define 3-5 valores core de tu empresa',
        'Escribe 2-3 comportamientos para cada valor',
        'Crea documento cultural (1-2 páginas)',
        'Comunica a equipo, pide feedback',
        'Implementa en hiring, onboarding, recognition',
        'Revisa trimestralmente si se vive'
      ],
      resources: [
        { id: 'res-5-1', title: 'Culture Document Template', type: 'template', description: 'Estructura completa' },
        { id: 'res-5-2', title: 'Values + Behaviors Framework', type: 'template', description: 'Define cada uno' },
        { id: 'res-5-3', title: 'Hiring Rubric for Culture Fit', type: 'worksheet', description: 'Evalúa alineamiento' },
        { id: 'res-5-4', title: 'All-Hands Agenda Template', type: 'template', description: 'Reunion semanal' }
      ]
    }
  ],

  tools: [
    { id: 'tool-1', title: 'Lattice', type: 'tool', description: 'OKRs + performance management' },
    { id: 'tool-2', title: 'Loom', type: 'tool', description: 'Video comunicación asíncrona' },
    { id: 'tool-3', title: 'Retool', type: 'tool', description: 'Dashboards de decisión' },
    { id: 'tool-4', title: 'Slido', type: 'tool', description: 'Feedback anónimo en reuniones' },
    { id: 'tool-5', title: 'Miro', type: 'tool', description: 'Whiteboard para decisiones colaborativas' }
  ],

  templates: [
    { id: 'tpl-1', title: 'CEO Time Audit', type: 'template', description: 'Dónde va tu tiempo' },
    { id: 'tpl-2', title: 'Culture Document', type: 'template', description: 'Define tu cultura' },
    { id: 'tpl-3', title: '1-on-1 Template', type: 'template', description: 'Estructura reunión semanal' },
    { id: 'tpl-4', title: 'Decision Framework', type: 'template', description: 'Elige rápido' },
    { id: 'tpl-5', title: 'Change Management Plan', type: 'template', description: '8-semanas' }
  ],

  successMetrics: [
    'Reducir 50% del tiempo que dedicas a operacional',
    'Crear equipo que funciona sin ti 80% del tiempo',
    'Implementar comunicación semanal efectiva',
    'Hacer decisiones importantes en 1-3 horas vs 1-3 semanas',
    'Bajar rotación de equipo 50%',
    'Documentar cultura que atrae talento alineado'
  ],

  nextModule: 'management-2'
};

export default MANAGEMENT_MODULE;
