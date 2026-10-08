export type ResourceType = 'article' | 'video' | 'template' | 'pdf' | 'checklist' | 'spreadsheet' | 'guide';

export interface ContentResource {
  id: string;
  title: string;
  type: ResourceType;
  description: string;
  url?: string;
  isDownloadable?: boolean;
}

export interface LessonTemplate {
  id: string;
  title: string;
  summary: string;
  content: string;
  keyPoints: string[];
  practicalSteps: string[];
  example: string;
  checklist: string[];
}

export interface ToolRecommendation {
  id: string;
  name: string;
  description: string;
  whyItMatters: string;
  price: 'free' | 'freemium' | 'paid';
  url?: string;
}

export interface ContentModule {
  id: string;
  areaId: string;
  title: string;
  objective: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lessons: LessonTemplate[];
  resources: ContentResource[];
  tools: ToolRecommendation[];
  templateName?: string;
}

export interface ContentArea {
  id: string;
  name: string;
  description: string;
  modules: ContentModule[];
}

export const contentLibrary: ContentArea[] = [
  {
    id: 'management',
    name: 'Gerencia',
    description: 'Liderazgo, estrategia y ejecución.',
    modules: [
      {
        id: 'management-1',
        areaId: 'management',
        title: 'Liderazgo estratégico',
        objective: 'Alinear decisiones, prioridades y equipos hacia resultados medibles.',
        difficulty: 'beginner',
        lessons: [
          {
            id: 'management-1-lesson-1',
            title: 'Qué es liderazgo estratégico',
            summary: 'El liderazgo estratégico permite tener claridad en dirección, prioridades y decisiones.',
            content: 'Un líder estratégico no solo maneja tareas, sino que define rumbo, prioriza y conecta la operación con la visión del negocio. Esto evita improvisación, fricción operativa y decisiones aisladas.',
            keyPoints: [
              'El liderazgo estratégico tiene visión y dirección.',
              'Debe conectar objetivos con ejecución real.',
              'La claridad reduce desgaste y mejora ejecución.'
            ],
            practicalSteps: [
              'Define 3 prioridades del mes.',
              'Revisa si el equipo entiende el objetivo final.',
              'Ajusta indicadores para medir progreso.'
            ],
            example: 'Un negocio que quiere crecer sin perder rentabilidad puede priorizar ventas, flujo de caja y atención al cliente como pilares del mes.',
            checklist: [
              '¿Qué queremos lograr en 90 días?',
              '¿Qué decisiones no pueden esperar?',
              '¿Qué indicadores miden avance?' 
            ]
          },
          {
            id: 'management-1-lesson-2',
            title: 'Cómo crear un plan operativo claro',
            summary: 'Un plan operativo ayuda a convertir estrategia en acciones concretas.',
            content: 'La estrategia se vuelve útil cuando se transforma en objetivos, responsables, tiempos y métricas. Esta práctica evita que el equipo actúe solo por urgencia.',
            keyPoints: [
              'Los objetivos deben ser medibles.',
              'Todo debe tener responsable y fecha.',
              'La operación debe seguir la estrategia.'
            ],
            practicalSteps: [
              'Divide metas por semana.',
              'Asigna dueño de cada objetivo.',
              'Monitorea resultados con métricas simples.'
            ],
            example: 'Una empresa quiere mejorar la atención al cliente; define una meta semanal, un responsable, una herramienta de seguimiento y métricas de satisfacción.',
            checklist: [
              '¿Existe responsable por tarea?',
              '¿Hay fechas de revisión?',
              '¿Hay señal si no se cumple?'
            ]
          }
        ],
        resources: [
          { id: 'management-1-resource-1', title: 'Checklist de dirección estratégica', type: 'checklist', description: 'Guía práctica para alinear objetivos y ejecución.' },
          { id: 'management-1-resource-2', title: 'Plan operativo mensual', type: 'template', description: 'Plantilla para planificar prioridades y seguimiento.', isDownloadable: true }
        ],
        tools: [
          { id: 'tool-okrs', name: 'OKR template', description: 'Estructura objetivos y métricas clave.', whyItMatters: 'Ayuda a conectar meta grande con ejecución diaria.', price: 'free' },
          { id: 'tool-kanban', name: 'Tablero Kanban', description: 'Organiza tareas por prioridad y estado.', whyItMatters: 'Reduce caos y mejora seguimiento.', price: 'freemium' }
        ],
        templateName: 'Plan operativo mensual'
      },
      {
        id: 'management-2',
        areaId: 'management',
        title: 'Comunicación efectiva',
        objective: 'Mejorar la claridad, el feedback y la coordinación del equipo.',
        difficulty: 'intermediate',
        lessons: [
          {
            id: 'management-2-lesson-1',
            title: 'La claridad cambia el rendimiento',
            summary: 'Las decisiones se ejecutan mejor cuando todos entienden el rumbo.',
            content: 'Muchas veces los problemas no son de talento, sino de comunicación. Cuando no hay claridad, cada persona interpreta de forma distinta y la ejecución se vuelve lenta.',
            keyPoints: [
              'La comunicación debe ser simple.',
              'El equipo necesita contexto y prioridad.',
              'El feedback acelera aprendizaje.'
            ],
            practicalSteps: [
              'Define lo que sí importa hoy.',
              'Comenta prioridades una sola vez y vuelve a reforzarlas.',
              'Haz seguimiento con métricas ligeras.'
            ],
            example: 'Un equipo que recibe un objetivo sin contexto interpreta tareas diferentes. Una reunión de 15 minutos con claridad evita errores de dirección.',
            checklist: [
              '¿Se entiende el objetivo?',
              '¿Existe una prioridad clara?',
              '¿El equipo sabe qué éxito se espera?'
            ]
          }
        ],
        resources: [
          { id: 'management-2-resource-1', title: 'Formato de reunión semanal', type: 'guide', description: 'Guía para reuniones más efectivas y enfocadas.' },
          { id: 'management-2-resource-2', title: 'Plantilla de feedback', type: 'template', description: 'Formato breve para retroalimentación útil.', isDownloadable: true }
        ],
        tools: [
          { id: 'tool-trello', name: 'Trello', description: 'Organiza tareas y prioridades del equipo.', whyItMatters: 'Mejora coordinación sin complejidad.', price: 'freemium' },
          { id: 'tool-slack', name: 'Slack', description: 'Comunicación rápida y clara.', whyItMatters: 'Reduce saturación de correo y acelera decisiones.', price: 'free' }
        ],
        templateName: 'Formato de reunión semanal'
      }
    ]
  },
  {
    id: 'sales',
    name: 'Ventas',
    description: 'Prospección, cierre y relación con clientes.',
    modules: [
      {
        id: 'sales-1',
        areaId: 'sales',
        title: 'Prospección efectiva',
        objective: 'Abrir oportunidades y mejorar la calidad de contacto.',
        difficulty: 'beginner',
        lessons: [
          {
            id: 'sales-1-lesson-1',
            title: 'Qué hace una buena prospección',
            summary: 'La prospección efectiva llega con criterio, relevancia y valor.',
            content: 'La prospección no es lanzar mensajes a cualquier persona; es construir una conversación con un problema claro y una propuesta útil.',
            keyPoints: [
              'Hay que entender al cliente antes de vender.',
              'La propuesta debe resolver un problema real.',
              'No todo contacto debe convertirse en venta inmediata.'
            ],
            practicalSteps: [
              'Define tu buyer persona.',
              'Identifica señales de necesidad.',
              'Presenta valor antes de precio.'
            ],
            example: 'Una empresa B2B busca clientes con problema de gestión operativa y presenta un diagnóstico gratuito como punto de entrada.',
            checklist: [
              '¿Quién es el cliente ideal?',
              '¿Qué problema resuelve?',
              '¿Qué mensaje hace sentido para esa persona?'
            ]
          }
        ],
        resources: [
          { id: 'sales-1-resource-1', title: 'Lista de prospección', type: 'checklist', description: 'Checklist para identificar clientes potenciales.' },
          { id: 'sales-1-resource-2', title: 'Plantilla de outreach', type: 'template', description: 'Mensaje de contacto inicial para ventas.', isDownloadable: true }
        ],
        tools: [
          { id: 'tool-crm', name: 'CRM simple', description: 'Guarda contacto y seguimiento para cada oportunidad.', whyItMatters: 'Evita perder leads y mejora seguimiento.', price: 'freemium' }
        ],
        templateName: 'Plantilla de outreach'
      }
    ]
  }
];
