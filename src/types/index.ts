export interface User {
  id: string;
  email?: string;
  displayName?: string;
  company?: string;
  industry?: string;
  interests?: string[];
  defaultCompanyId?: string;
  business_description?: string;
  main_challenge?: string;
  createdAt: Date;
  lastLogin: Date;
}

export interface ModuleProgress {
  userId: string;
  moduleId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercentage: number;
  quizScore?: number;
  lessonsCompleted: string[];
  lastAccessed: Date;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: string;
  summary: string;
  keyPoints: string[];
  order: number;
  duration: number; // in minutes
  created_at?: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  order: number;
  lessons: Lesson[];
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // in minutes
  attemptsAllowed?: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface DiagnosticResult {
  businessType: string;
  mainChallenge: string;
  scalabilityRoadmap: {
    phase: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  recommendedModules: string[];
}

export interface ConversionTrigger {
  type: 'module_completion' | 'quiz_passed' | 'time_spent' | 'score_achievement';
  condition: any;
  action: 'show_vip_button' | 'send_notification' | 'highlight_cta';
  triggered: boolean;
}

export type AreaId =
  | 'management'
  | 'sales'
  | 'marketing'
  | 'operations'
  | 'finance'
  | 'technology'
  | 'talent'
  | 'customer';

export interface BusinessArea {
  id: AreaId;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface ModuleDefinition {
  id: string;
  areaId: AreaId;
  name: string;
  description: string;
  objective: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export const BUSINESS_AREAS: BusinessArea[] = [
  { id: 'management', name: 'Gerencia', icon: '👔', color: '#8B5CF6', description: 'Liderazgo y estrategia' },
  { id: 'sales', name: 'Ventas', icon: '💰', color: '#0080FF', description: 'Procesos de venta' },
  { id: 'marketing', name: 'Marketing', icon: '📢', color: '#10B981', description: 'Promoción y publicidad' },
  { id: 'operations', name: 'Operaciones', icon: '⚙️', color: '#F59E0B', description: 'Eficiencia operativa' },
  { id: 'finance', name: 'Finanzas', icon: '📊', color: '#EF4444', description: 'Gestión financiera' },
  { id: 'technology', name: 'Tecnología', icon: '💻', color: '#3B82F6', description: 'Herramientas digitales' },
  { id: 'talent', name: 'Talento', icon: '👥', color: '#8B5CF6', description: 'Gestión humana' },
  { id: 'customer', name: 'Cliente', icon: '🎯', color: '#10B981', description: 'Experiencia cliente' }
];

export const MODULE_CATALOG: Record<AreaId, ModuleDefinition[]> = {
  management: [
    { id: 'management-1', areaId: 'management', name: 'Liderazgo estratégico', description: 'Cómo alinear decisiones, objetivos y equipo.', objective: 'Mejorar dirección y ejecución', difficulty: 'beginner' },
    { id: 'management-2', areaId: 'management', name: 'Comunicación efectiva', description: 'Clarity, feedback y comunicación a equipos y aliados.', objective: 'Reducir fricción y mejorar coordinación', difficulty: 'intermediate' },
    { id: 'management-3', areaId: 'management', name: 'Gestión del cambio', description: 'Cómo liderar transformación y adaptación ordenada.', objective: 'Acelerar adaptación sin caos', difficulty: 'advanced' }
  ],
  sales: [
    { id: 'sales-1', areaId: 'sales', name: 'Prospección', description: 'Identificar y abrir oportunidades reales.', objective: 'Generar más pipeline', difficulty: 'beginner' },
    { id: 'sales-2', areaId: 'sales', name: 'Manejo de objeciones', description: 'Resolver dudas y convertir más conversaciones.', objective: 'Mejorar tasa de cierre', difficulty: 'intermediate' },
    { id: 'sales-3', areaId: 'sales', name: 'Cierre y seguimiento', description: 'Convencer, cerrar y mantener la relación.', objective: 'Aumentar conversiones y retención', difficulty: 'advanced' }
  ],
  marketing: [
    { id: 'marketing-1', areaId: 'marketing', name: 'Posicionamiento', description: 'Cómo comunicar valor para diferenciarte.', objective: 'Aumentar visibilidad de marca', difficulty: 'beginner' },
    { id: 'marketing-2', areaId: 'marketing', name: 'Contenido y demanda', description: 'Crear mensajes orientados a problema y solución.', objective: 'Attract more qualified leads', difficulty: 'intermediate' },
    { id: 'marketing-3', areaId: 'marketing', name: 'Medición y optimización', description: 'Cuándo ajustar campañas y mensajes.', objective: 'Mejorar retorno de inversión', difficulty: 'advanced' }
  ],
  operations: [
    { id: 'operations-1', areaId: 'operations', name: 'Procesos', description: 'Documentar y optimizar tareas clave.', objective: 'Reducir errores y desperdicio', difficulty: 'beginner' },
    { id: 'operations-2', areaId: 'operations', name: 'Productividad', description: 'Cómo ordenar flujo de trabajo y tiempos.', objective: 'Mejorar productividad', difficulty: 'intermediate' },
    { id: 'operations-3', areaId: 'operations', name: 'Mejora continua', description: 'Métodos para detectar y resolver fricción.', objective: 'Acelerar rendimiento operativo', difficulty: 'advanced' }
  ],
  finance: [
    { id: 'finance-1', areaId: 'finance', name: 'Flujo de caja', description: 'Control del dinero que entra y sale.', objective: 'Mantener liquidez', difficulty: 'beginner' },
    { id: 'finance-2', areaId: 'finance', name: 'Presupuesto', description: 'Planear gastos e inversiones con criterio.', objective: 'Tomar decisiones con previsión', difficulty: 'intermediate' },
    { id: 'finance-3', areaId: 'finance', name: 'Rentabilidad', description: 'Medir margen, costos y variables clave.', objective: 'Incrementar utilidad', difficulty: 'advanced' }
  ],
  technology: [
    { id: 'technology-1', areaId: 'technology', name: 'Herramientas digitales', description: 'Elegir sistemas simples y útiles.', objective: 'Reducir trabajo manual', difficulty: 'beginner' },
    { id: 'technology-2', areaId: 'technology', name: 'Automatización', description: 'Guardar tiempo con procesos repetitivos.', objective: 'Acelerar tareas de operación', difficulty: 'intermediate' },
    { id: 'technology-3', areaId: 'technology', name: 'Datos y seguimiento', description: 'Medir métricas y decisiones basadas en evidencia.', objective: 'Tomar decisiones más precisas', difficulty: 'advanced' }
  ],
  talent: [
    { id: 'talent-1', areaId: 'talent', name: 'Contratación', description: 'Seleccionar personas con mejor fit.', objective: 'Fortalecer el equipo', difficulty: 'beginner' },
    { id: 'talent-2', areaId: 'talent', name: 'Motivación y cultura', description: 'Crear clima y compromiso real.', objective: 'Retener talento', difficulty: 'intermediate' },
    { id: 'talent-3', areaId: 'talent', name: 'Desarrollo', description: 'Cómo entrenar y potenciar al equipo.', objective: 'Aumentar desempeño', difficulty: 'advanced' }
  ],
  customer: [
    { id: 'customer-1', areaId: 'customer', name: 'Experiencia', description: 'Cómo generar confianza y trato memorable.', objective: 'Mejorar percepción de marca', difficulty: 'beginner' },
    { id: 'customer-2', areaId: 'customer', name: 'Fidelización', description: 'Mantener relación y recompra.', objective: 'Aumentar retención', difficulty: 'intermediate' },
    { id: 'customer-3', areaId: 'customer', name: 'Servicio y escalamiento', description: 'Cómo resolver incidencias sin perder calidad.', objective: 'Aumentar satisfacción y confianza', difficulty: 'advanced' }
  ]
};

export const getAreaById = (areaId?: string): BusinessArea | undefined =>
  BUSINESS_AREAS.find(area => area.id === areaId);
