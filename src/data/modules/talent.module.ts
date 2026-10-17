/**
 * MÓDULO COMPLETO DE TALENTO
 */

import { SalesModuleContent } from './sales.module';

export const TALENT_MODULE: SalesModuleContent = {
  moduleId: 'talent-1',
  title: 'People: La gente correcta hace empresa exponencial',
  description: 'Contrata talento que multiplica resultados, desarrolla equipo alineado, crea cultura que atrae. Tu empresa = tu equipo.',
  objective: 'Equipo pequeño pero 10x más productivo + baja rotación 90%',
  duration: '3 horas',
  difficulty: 'beginner',

  lessons: [
    {
      id: 'lesson-1',
      number: 1,
      title: '¿Por qué contratas gente mediocre?',
      duration: 25,
      keyPoints: [
        'Contratas rápido porque necesitas llenar puesto = error estratégico',
        'Persona mediocre cuesta 3x más que buena (en decisiones malas)',
        'Equipo mediocre escala limitado. Equipo A+ escala exponencial.',
        'El 80% de tu éxito es QUIÉN, no QUÉ haces'
      ],
      content: `
        Dinámicas de contratación pobre:

        ESCENARIO 1: Urgencia
        "Necesito alguien YA"
        → Contratas el primero que llega
        → Es mediocre
        → Te arrepientes en 6 meses
        
        ESCENARIO 2: Precio
        "Es barato"
        → Bajo costo = baja calidad
        → Necesitas supervisar mucho
        → Ganan $ pero pierdes $ en tu tiempo
        
        ESCENARIO 3: CV
        "Tiene buena experiencia"
        → CV no es habilidad
        → No evalúas fit cultural
        → Trabajan junto pero no alineados
        
        COSTO DE MALA CONTRATACIÓN:
        Salary: $3K/mes
        Tu tiempo corrigiendo: 10h/semana = $2K/mes
        Oportunidad perdida: $5K/mes
        TOTAL: $10K/mes costo real
        
        Cuando se va: capacitar remplazo $5K, ramp 3 meses

        SOLUCIÓN:
        Ser selectivo. Mejor esperar 2 meses por A+
        que 2 años sufriendo B-
        
        Contratación es inversión, no gasto.
        Debes evaluar: Skills + Attitude + Fit + Potential
      `,
      caseStudy: {
        company: 'SaaS Argentina',
        problem: 'Contrató 5 personas mediocres para "crecer". Fue caos.',
        solution: 'Paró contrataciones. Entrevistó 50 personas. Contrató 2 A+.',
        result: 'Con 2 A+ hizo más que 5 mediocres. Revenue sube. Stress baja. Cultura mejora.'
      },
      actionItems: [
        'Honestamente: ¿quién en equipo es mediocre?',
        '¿Cuál es el costo real (no solo salary)?',
        'Define: ¿quién es "A player" en tu industria?',
        'Lista 3 habilidades non-negotiables para próximo hire'
      ],
      resources: [
        { id: 'res-1-1', title: 'Hiring Criteria Rubric', type: 'template', description: 'Skills + Attitude' },
        { id: 'res-1-2', title: 'Cost of Bad Hire Calculator', type: 'tool', description: 'Calcula real' },
        { id: 'res-1-3', title: 'Candidate Interview Guide', type: 'guide', description: 'Qué preguntar' }
      ]
    },
    {
      id: 'lesson-2',
      number: 2,
      title: 'Contratación A+: Cómo atraer talento sin suplicar',
      duration: 30,
      keyPoints: [
        'Talento A+ no busca trabajo. Tienes que seducirlo.',
        'No compites por dinero. Compites por crecimiento, autonomía, misión.',
        'Proceso de contratación es 50% atracción, 50% evaluación',
        'Mejor esperar 4 meses por A+ que 4 años con mediocre'
      ],
      content: `
        Cómo atraer A-Players:

        1. POSICIÓN DE FUERZA
        Tu empresa tiene momentum
        Cultura clara
        Misión emocionante
        Equipo fuerte
        
        → Talento quiere estar en empresas que crecen

        2. NETWORKING PROACTIVO
        NO esperes postulaciones
        Busca en:
        - LinkedIn (directo)
        - Comunidades de tu industria
        - Referrals de tu equipo (pagas bonus)
        - Universidades/bootcamps
        
        Mensaje: "Estamos construyendo X. Necesitamos talento como tú."
        Vs "Tenemos puesto vacante"

        3. ENTREVISTA ESTRUCTURADA
        
        RONDA 1 (30 min): Screen
        - Cuéntame de ti
        - ¿Por qué te interesa esto?
        - ¿Cuáles son tus expectativas?
        
        RONDA 2 (60 min): Deep dive
        - Portfolio/proyectos
        - Problema específico de tu industria
        - ¿Cómo lo resolverías?
        - Work sample (si es rol técnico)
        
        RONDA 3 (60 min): Team fit
        - Entrevista con futuros colegas
        - Lunch/coffee (ambiente relajado)
        - ¿Pueden trabajar juntos?
        
        RONDA 4 (30 min): Expectations
        - Salary/benefits/growth
        - Role clarity
        - First 90 days plan
        
        EVALUACIÓN:
        ☐ Skills: ¿sabe hacer el trabajo?
        ☐ Attitude: ¿puede aprender y crecer?
        ☐ Fit: ¿encaja en cultura?
        ☐ Potential: ¿puede ser mejor que posición?
        
        Necesita 4/4 YES

        4. OFERTA GANADORA
        NO solo dinero
        
        Paquete:
        - Salario competitivo (research el mercado)
        - Equity si es startup
        - Crecimiento claro (roles, mentorship)
        - Autonomía (confías en ellos)
        - Misión emocionante (por qué importa)
        - Beneficios (flex, learning budget, equipment)
        
        Venta pitch: "Vas a crecer 10x aquí. Misión es X.
        Equipo es A+. Autonomía es real."
      `,
      caseStudy: {
        company: 'Startup Chile',
        problem: 'No lograba atraer talento. Competía por precio vs FAANG.',
        solution: 'Vendió misión + crecimiento + equity. Networking proactivo + referrals.',
        result: 'Talento A+ eligió startup por proyecto, no dinero. Team de sueño formado.'
      },
      actionItems: [
        'Define perfil ideal para próximo hire (skills + attitude)',
        'Busca 10 candidatos en LinkedIn/referrals',
        'Entrevista con proceso estructurado (4 rondas)',
        'Crea "oferta ganadora" que no sea solo dinero',
        'Vende misión + crecimiento + autonomía'
      ],
      resources: [
        { id: 'res-2-1', title: 'Hiring Playbook', type: 'template', description: '4 rondas' },
        { id: 'res-2-2', title: 'Interview Questions Bank', type: 'guide', description: 'Qué preguntar' },
        { id: 'res-2-3', title: 'Salary Benchmarking', type: 'worksheet', description: 'Qué pagar' }
      ]
    },
    {
      id: 'lesson-3',
      number: 3,
      title: 'Onboarding: Los primeros 90 días definen todo',
      duration: 35,
      keyPoints: [
        'Onboarding es el momento de construir o destruir relación',
        'Primeros 90 días: persona decide si se queda o busca otro trabajo',
        'Malo onboarding = 50% renuncia en primer año',
        'Bueno onboarding = engaged, productivo, alineado'
      ],
      content: `
        Plan de 90 días:

        SEMANA 1: ASIMILACIÓN
        Objetivo: Se sienta bienvenido, entienda empresa y rol
        
        Día 1:
        - Bienvenida personal (no email)
        - Tour físico/virtual
        - Equipamiento (laptop, acceso, etc)
        - First week overview (qué aprenderá)
        
        Día 2-3: Contexto
        - Historia de empresa (por qué existe)
        - Visión/Misión/Valores
        - Productos/servicios
        - Clientes principales
        - Números (revenue, growth, vision)
        - Intro a cada área (5 min cada)
        
        Día 4-5: Rol
        - Qué es el rol exactamente
        - Por qué es importante
        - Success criteria (qué significa "bien")
        - Tools y sistemas (Slack, docs, etc)
        - Buddy assignment (alguien que responde preguntas)

        SEMANA 2-3: LEARNING
        Objetivo: Entienda procesos, empiece con tareas pequeñas
        
        - Shadow 3 personas del team
        - SOP reading (documentación)
        - 1-on-1 semanal con jefe
        - Primera tarea pequeña (no crítica)
        - Team lunch/coffee (social bonding)

        SEMANA 4-8: CONTRIBUTION
        Objetivo: Productivo, empiece a aportar real
        
        - Proyectos pequeños que complete
        - 1-on-1 semanal: feedback (qué va bien/qué mejorar)
        - Integración con equipo (colaboración real)
        - First win (algo que logre, celebra)

        SEMANA 9-12: RAMP
        Objetivo: Autónomo, parte del team, contribuye material
        
        - Proyectos medianos/importantes
        - Peer feedback (no solo jefe)
        - 30-60-90 day review (formal assessment)
        - Claridad: "estás en right track?" ✓ o "ajustamos"

        DAY 90 CONVERSATION:
        "¿Cómo ha sido tu primer 3 meses?
        ¿Sigues adelante o necesitas cambio de rol/empresa?"
        
        Si: dudas → clarifica, entrena más, o match
        Si: ✓ → celebra, define meta siguientes 6 meses
      `,
      caseStudy: {
        company: 'Tech México',
        problem: 'Rotación 60% primer año. Gente se iba "perdida".',
        solution: 'Plan 90 días estructurado. Buddy system. Weekly check-ins.',
        result: 'Retención año 1 = 95%. Personas productive en mes 2, no mes 4.'
      },
      actionItems: [
        'Crea plan onboarding 90 días (semana por semana)',
        'Documentar: first day, first week, first month',
        'Asigna buddy/mentor',
        'Crea SOP: cómo onboard (para que sea replicable)',
        'Revisa día 90: ¿retener o evaluar?'
      ],
      resources: [
        { id: 'res-3-1', title: '90-Day Onboarding Plan', type: 'template', description: 'Semana por semana' },
        { id: 'res-3-2', title: 'First Day Checklist', type: 'worksheet', description: 'Qué incluir' },
        { id: 'res-3-3', title: 'Buddy Guide', type: 'guide', description: 'Cómo ser mentor' }
      ]
    },
    {
      id: 'lesson-4',
      number: 4,
      title: 'Desarrollo: Gente crece o se aburre',
      duration: 30,
      keyPoints: [
        'Sin desarrollo = mejor gente busca otro trabajo',
        'Desarrollo no es solo "cursos". Es responsabilidad, mentoría, retos.',
        'Gente que crece = comprometida, productiva, leal',
        '1 hora/semana en desarrollo = reduce rotación 80%'
      ],
      content: `
        Desarrollo es inversión, no costo.

        PILARES:

        1. MENTORÍA 1-on-1
        Semanal: 30 min
        
        Tópicos:
        - Qué salió bien (celebra)
        - Qué costó (aprendizaje)
        - Retos próximos
        - Desarrollo skills
        - Carrera path (a dónde va)
        
        → Construcción de confianza

        2. DESAFÍO PROGRESIVO
        No proyectos iguales siempre
        
        Mes 1-2: small tasks (aprende)
        Mes 3-4: medium (contribuye)
        Mes 5-6: large (lidera)
        Mes 7+: stretch (crece)
        
        → Si proyecto muy fácil: aburrimiento
        → Si proyecto muy difícil: frustración
        → Balance: 70% comfortable, 30% challenge

        3. FEEDBACK CONSTANTE
        No esperes año-end review
        
        Weekly: feedback informal (QA, celebración)
        Monthly: 1-on-1 formal (desarrollo + feedback)
        Quarterly: 360 feedback (pares + jefe)
        Annual: career review (salario + promotion)
        
        Feedback es regalo, no castigo

        4. LEARNING BUDGET
        $500-1000/persona/año mínimo
        
        Puede ser:
        - Cursos online (Coursera, Platzi)
        - Conferencias
        - Libros
        - Coaching (executive)
        - Mentorship externo
        
        → Demuestra que invertes en ellos

        5. GROWTH PATH CLARO
        Qué significa promoción
        
        IC (Individual Contributor):
        L1 → L2 → L3 → L4 (especialista)
        
        Manager:
        Manager → Senior Manager → Director
        
        ¿Qué hace falta para L2?
        Skills A, B, C
        Track record X, Y
        Comportamiento Z
        
        6 meses hasta L2 es posible
        Pero debe estar claro desde inicio
      `,
      caseStudy: {
        company: 'Startup Colombia',
        problem: 'Talento se aburría, se iba a competidor.',
        solution: 'Programas de desarrollo + mentoría + clear growth path.',
        result: 'Talento se queda, crece, promueve. Cultura de learning establecida.'
      },
      actionItems: [
        'Define growth path para cada persona (IC vs Manager)',
        'Implementa 1-on-1 semanal (30 min)',
        'Crea learning budget ($500+/persona/año)',
        'Apunta en Notion: skills a desarrollar cada persona',
        'Feedback monthly (no solo anual)'
      ],
      resources: [
        { id: 'res-4-1', title: 'Growth Path Template', type: 'template', description: 'IC + Manager' },
        { id: 'res-4-2', title: '1-on-1 Agenda', type: 'template', description: 'Weekly structure' },
        { id: 'res-4-3', title: 'Feedback Guide', type: 'guide', description: 'Cómo dar feedback' }
      ]
    },
    {
      id: 'lesson-5',
      number: 5,
      title: 'Retención: Gente exitosa no se va',
      duration: 40,
      keyPoints: [
        'Cuesta 50% del salary reemplazar alguien',
        'Mejor pagar bien y retener que pagar mal y rotar',
        'Retención = paid well + growing + team + mission',
        'Si pierdes talento A+ = empresa sufre 2+ años'
      ],
      content: `
        Cómo retener A-Players:

        1. RECOMPENSA ECONÓMICA
        Salario competitivo (no máximo, pero market rate)
        Bonus por resultados
        Equity (si startup)
        Revisión anual (sube si crece empresa)
        
        "Si no puedes pagar, al menos sé honesto"

        2. RESPONSABILIDAD + AUTONOMÍA
        A-Players necesitan propiedad
        "Esto es TUYO. Yo confío en ti."
        
        Vs micromanagement
        
        Autonomía = retención

        3. MISIÓN EMOCIONANTE
        "Aquí cambias mundo"
        "Clientes nos necesitan"
        "Estamos creciendo exponencial"
        
        Dinero es baseline. Misión es diferencia.

        4. EQUIPO A+
        Trabajar con gente talentosa = motivante
        Trabajar con incompetentes = drena
        
        Si team es fuerte: quieren quedarse
        Si team es débil: se van

        5. FEEDBACK + RECONOCIMIENTO
        Pública celebración (all-hands)
        Bono por resultados
        Promoción a tiempo
        
        A+ viven de reconocimiento

        6. CRECIMIENTO
        Clear path
        Nuevas responsabilidades
        Mentorship
        
        Si estanca: se buscan opciones

        STAY INTERVIEW (cada 6 meses)
        No esperes que renuncien. Pregunta:
        
        "¿Qué te ama de trabajar aquí?"
        → Qué mantener
        
        "¿Qué cambiarías?"
        → Qué arreglar rápido
        
        "¿Qué te falta para estar 100% feliz?"
        → Qué ofrecerles
        
        Si dices SÍ a cambios: se quedan
        Si los ignoras: se van
      `,
      caseStudy: {
        company: 'Consultora Brasil',
        problem: 'Perdía 30% equipo cada año (sangrado constante)',
        solution: 'Stay interviews + aumentos competitivos + growth path claro',
        result: 'Retención sube a 95%. Continuidad = mejor resultados. Compuesta ventaja.'
      },
      actionItems: [
        'Haz stay interview: ¿qué ama? ¿Qué cambiaría?',
        'Revisa salarios vs mercado (pagas competitivo?)',
        'Define misión clara (¿por qué importa tu empresa?)',
        'Crea programa reconocimiento (público)',
        'Plan desarrollo para cada A-Player'
      ],
      resources: [
        { id: 'res-5-1', title: 'Stay Interview Template', type: 'template', description: 'Preguntas claves' },
        { id: 'res-5-2', title: 'Compensation Benchmarking', type: 'worksheet', description: 'Vs mercado' },
        { id: 'res-5-3', title: 'Recognition Program Ideas', type: 'guide', description: 'Cómo celebrar' },
        { id: 'res-5-4', title: 'Retention Checklist', type: 'worksheet', description: 'Qué mantener A+' }
      ]
    }
  ],

  tools: [
    { id: 'tool-1', title: 'LinkedIn Recruiter', type: 'tool', description: 'Busca talento' },
    { id: 'tool-2', title: 'Notion', type: 'tool', description: 'Onboarding + desarrollo' },
    { id: 'tool-3', title: 'Lattice', type: 'tool', description: 'Performance + feedback' },
    { id: 'tool-4', title: 'Lever', type: 'tool', description: 'ATS (applicant tracking)' },
    { id: 'tool-5', title: 'Guidepoint', type: 'tool', description: 'Referral tracking' }
  ],

  templates: [
    { id: 'tpl-1', title: 'Hiring Rubric', type: 'template', description: 'Skills + Attitude + Fit' },
    { id: 'tpl-2', title: '90-Day Onboarding', type: 'template', description: 'Semana a semana' },
    { id: 'tpl-3', title: 'Growth Path', type: 'template', description: 'IC vs Manager' },
    { id: 'tpl-4', title: '1-on-1 Agenda', type: 'template', description: 'Semanal' },
    { id: 'tpl-5', title: 'Stay Interview', type: 'template', description: 'Retención' }
  ],

  successMetrics: [
    'Contratar 100% A-Players (no mediocres)',
    'Retención >95% primer año',
    'Onboarding en 30 días (productivo)',
    'Growth path clara para 100% equipo',
    'NPS de equipo (satisfaction) >8/10',
    'Cero regret hires en 6 meses'
  ],

  nextModule: 'talent-2'
};

export default TALENT_MODULE;
