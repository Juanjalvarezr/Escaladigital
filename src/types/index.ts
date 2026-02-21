export interface User {
  id: string;
  email?: string;
  displayName?: string;
  company?: string;
  industry?: string;
  interests?: string[];
  defaultCompanyId?: string;
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

export interface BusinessArea {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
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
