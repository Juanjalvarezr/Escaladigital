import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Flashcard {
  id: string;
  moduleId: string;
  areaId: string;
  question: string;
  answer: string;
  options?: string[];
  correctIndex?: number;
  explanation: string;
  intervalDays: number;
  nextReviewDate: string; // ISO date string
  repetitions: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  unlockedAt: string | null; // ISO date string, null = locked
}

export interface LearningTimeline {
  id: string;
  type: 'lesson' | 'quiz' | 'badge' | 'streak';
  label: string;
  areaId?: string;
  emoji: string;
  date: string; // ISO date string
}

export interface LearningState {
  // Gamification & Streaks
  xp: number;
  streakDays: number;
  lastActiveDate: string | null;
  freezeDaysAvailable: number;
  businessLevel: {
    level: number;
    title: string;
    nextLevelXp: number;
    badge: string;
  };

  // Business Profile (from onboarding)
  businessName: string;
  sector: string;
  mainChallenge: string;
  onboardingComplete: boolean;

  // Badges / Achievements
  badges: Badge[];
  newlyUnlockedBadge: Badge | null; // shown momentarily then cleared

  // Weekly Commitments per lesson
  weeklyCommitments: Record<string, string>; // key = lessonId, value = commitment text

  // Learning Timeline (history)
  learningTimeline: LearningTimeline[];

  // Retention & Spaced Repetition
  flashcards: Flashcard[];
  dailyChallengeCompleted: boolean;
  completedActionItems: Record<string, boolean>; // key = `${lessonId}-${itemIndex}`

  // Simulation History
  simulationScores: Record<string, number>;

  // Actions
  addXp: (amount: number, reason?: string) => void;
  recordActivity: () => void;
  toggleActionItem: (key: string) => boolean;
  saveSimulationScore: (simulatorId: string, score: number) => void;
  reviewFlashcard: (cardId: string, isCorrect: boolean) => void;
  completeDailyChallenge: () => void;
  getLevelInfo: (currentXp: number) => { level: number; title: string; nextLevelXp: number; badge: string };
  setBusinessProfile: (name: string, sector: string, challenge: string) => void;
  saveWeeklyCommitment: (lessonId: string, commitment: string) => void;
  addTimelineEvent: (event: Omit<LearningTimeline, 'id'>) => void;
  checkAndUnlockBadges: (completedLessons: number, completedAreas: number) => void;
  clearNewBadge: () => void;
}

const calculateLevel = (xp: number) => {
  if (xp < 500) {
    return { level: 1, title: 'Emprendedor Operativo', nextLevelXp: 500, badge: '🌱' };
  } else if (xp < 1500) {
    return { level: 2, title: 'Líder con Procesos', nextLevelXp: 1500, badge: '⚡' };
  } else if (xp < 3000) {
    return { level: 3, title: 'Estratega Rentable', nextLevelXp: 3000, badge: '🚀' };
  } else {
    return { level: 4, title: 'Empresa Escalable', nextLevelXp: 5000, badge: '👑' };
  }
};

const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-sales-1',
    moduleId: 'sales-1',
    areaId: 'sales',
    question: '¿Qué debes presentar siempre ANTES de mencionar el precio de tu producto o servicio?',
    answer: 'El valor y la transformación concreta que resuelve el problema del cliente.',
    options: [
      'El descuento disponible',
      'El valor y la transformación concreta que resuelve su problema',
      'Las condiciones de pago a cuotas',
      'La historia de fundación de tu empresa'
    ],
    correctIndex: 1,
    explanation: 'El precio solo se percibe como "caro" cuando el cliente aún no tiene clara la magnitud del beneficio o del problema que le resuelves.',
    intervalDays: 1,
    nextReviewDate: new Date().toISOString(),
    repetitions: 0
  },
  {
    id: 'fc-finance-1',
    moduleId: 'finance-1',
    areaId: 'finance',
    question: '¿Cuál es la diferencia fundamental entre Facturación y Flujo de Caja?',
    answer: 'La facturación es lo que vendes en papel; el flujo de caja es el dinero real y disponible en tu banco hoy.',
    options: [
      'Son exactamente lo mismo con diferente nombre',
      'La facturación es el dinero en banco y el flujo de caja son las deudas',
      'La facturación es lo vendido en papel; el flujo de caja es el dinero real disponible hoy',
      'El flujo de caja solo aplica para empresas multinacionales'
    ],
    correctIndex: 2,
    explanation: 'Muchas empresas quiebran siendo rentables en papel simplemente porque se quedan sin liquidez inmediata para pagar nómina o proveedores.',
    intervalDays: 1,
    nextReviewDate: new Date().toISOString(),
    repetitions: 0
  },
  {
    id: 'fc-ops-1',
    moduleId: 'operations-1',
    areaId: 'operations',
    question: '¿Qué síntoma indica claramente un "cuello de botella" en tus operaciones?',
    answer: 'Una etapa del proceso donde el trabajo se acumula constantemente y retrasa la entrega final.',
    options: [
      'Tener demasiados clientes nuevos solicitando cotizaciones',
      'Una etapa del proceso donde el trabajo se acumula y frena las entregas',
      'Comprar herramientas de software más avanzadas',
      'Hacer reuniones semanales de 15 minutos'
    ],
    correctIndex: 1,
    explanation: 'El rendimiento total de una empresa nunca supera la velocidad de su cuello de botella más lento.',
    intervalDays: 1,
    nextReviewDate: new Date().toISOString(),
    repetitions: 0
  },
  {
    id: 'fc-management-1',
    moduleId: 'management-1',
    areaId: 'management',
    question: 'En liderazgo estratégico, ¿qué regla de oro evita la dispersión del equipo?',
    answer: 'Tener máximo 3 prioridades críticas de impacto por mes comunicadas con claridad.',
    options: [
      'Asignar 15 tareas diarias a cada colaborador',
      'Cambiar de estrategia cada semana según las tendencias de redes',
      'Tener máximo 3 prioridades críticas por mes bien comunicadas',
      'Evitar que el equipo tome cualquier decisión sin autorización previa'
    ],
    correctIndex: 2,
    explanation: 'Cuando todo es prioridad, nada es prioridad. 3 objetivos claros alinean la energía colectiva hacia resultados reales.',
    intervalDays: 1,
    nextReviewDate: new Date().toISOString(),
    repetitions: 0
  }
];

const DEFAULT_BADGES: Badge[] = [
  { id: 'first-step', name: 'Primer Paso', description: 'Completaste tu primera lección', emoji: '🔥', unlockedAt: null },
  { id: 'agile-mind', name: 'Mente Ágil', description: 'Superaste 5 checkpoints seguidos', emoji: '🧠', unlockedAt: null },
  { id: 'fire-streak', name: 'Racha de Fuego', description: '7 días de aprendizaje consecutivos', emoji: '⚡', unlockedAt: null },
  { id: 'scaler', name: 'Escalador', description: 'Completaste 3 áreas de negocio', emoji: '🚀', unlockedAt: null },
  { id: 'financier', name: 'Financiero', description: 'Dominaste el área de Finanzas', emoji: '💰', unlockedAt: null },
  { id: 'scalable-biz', name: 'Empresa Escalable', description: 'Completaste las 8 áreas', emoji: '👑', unlockedAt: null },
];

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      xp: 0,
      streakDays: 0,
      lastActiveDate: null,
      freezeDaysAvailable: 1,
      businessLevel: calculateLevel(0),
      flashcards: DEFAULT_FLASHCARDS,
      dailyChallengeCompleted: false,
      completedActionItems: {},
      simulationScores: {},
      businessName: '',
      sector: '',
      mainChallenge: '',
      onboardingComplete: false,
      badges: DEFAULT_BADGES,
      newlyUnlockedBadge: null,
      weeklyCommitments: {},
      learningTimeline: [],

      addXp: (amount: number, reason?: string) => {
        set((state) => {
          const newXp = Math.max(0, state.xp + amount);
          return {
            xp: newXp,
            businessLevel: calculateLevel(newXp)
          };
        });
      },

      recordActivity: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        
        if (state.lastActiveDate === today) {
          return;
        }

        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let newStreak = state.streakDays;

        if (state.lastActiveDate === yesterday) {
          newStreak += 1;
        } else if (!state.lastActiveDate) {
          newStreak = 1;
        } else {
          if (state.freezeDaysAvailable > 0) {
            newStreak += 1;
            set({ freezeDaysAvailable: state.freezeDaysAvailable - 1 });
          } else {
            newStreak = 1;
          }
        }

        set({
          streakDays: newStreak,
          lastActiveDate: today,
          dailyChallengeCompleted: false
        });
        
        get().addXp(30, 'Racha diaria mantenida');
      },

      toggleActionItem: (key: string) => {
        const state = get();
        const current = !!state.completedActionItems[key];
        const next = !current;
        
        set((s) => ({
          completedActionItems: {
            ...s.completedActionItems,
            [key]: next
          }
        }));

        if (next) {
          get().addXp(20, 'Acción práctica ejecutada');
        }
        return next;
      },

      saveSimulationScore: (simulatorId: string, score: number) => {
        set((state) => ({
          simulationScores: {
            ...state.simulationScores,
            [simulatorId]: Math.max(state.simulationScores[simulatorId] || 0, score)
          }
        }));
        get().addXp(score, `Simulador completado: ${simulatorId}`);
      },

      reviewFlashcard: (cardId: string, isCorrect: boolean) => {
        set((state) => {
          const updatedCards = state.flashcards.map((card) => {
            if (card.id !== cardId) return card;

            let nextInterval = 1;
            if (isCorrect) {
              nextInterval = card.repetitions === 0 ? 1 : card.repetitions === 1 ? 3 : card.intervalDays * 2;
            }

            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + nextInterval);

            return {
              ...card,
              repetitions: isCorrect ? card.repetitions + 1 : 0,
              intervalDays: nextInterval,
              nextReviewDate: nextDate.toISOString()
            };
          });

          return { flashcards: updatedCards };
        });

        if (isCorrect) {
          get().addXp(25, 'Repaso espaciado acertado');
        }
      },

      completeDailyChallenge: () => {
        set({ dailyChallengeCompleted: true });
        get().addXp(50, 'Reto del día completado');
        get().recordActivity();
      },

      getLevelInfo: (currentXp: number) => calculateLevel(currentXp),

      setBusinessProfile: (name: string, sector: string, challenge: string) => {
        set({ businessName: name, sector, mainChallenge: challenge, onboardingComplete: true });
      },

      saveWeeklyCommitment: (lessonId: string, commitment: string) => {
        set((state) => ({
          weeklyCommitments: { ...state.weeklyCommitments, [lessonId]: commitment }
        }));
      },

      addTimelineEvent: (event: Omit<LearningTimeline, 'id'>) => {
        const newEvent: LearningTimeline = {
          ...event,
          id: `${event.type}-${Date.now()}`
        };
        set((state) => ({
          learningTimeline: [newEvent, ...state.learningTimeline].slice(0, 20) // keep last 20
        }));
      },

      checkAndUnlockBadges: (completedLessons: number, completedAreas: number) => {
        const state = get();
        const now = new Date().toISOString();
        let newlyUnlocked: Badge | null = null;

        const updatedBadges = state.badges.map((badge) => {
          if (badge.unlockedAt) return badge; // already unlocked
          let shouldUnlock = false;

          if (badge.id === 'first-step' && completedLessons >= 1) shouldUnlock = true;
          if (badge.id === 'agile-mind' && completedLessons >= 5) shouldUnlock = true;
          if (badge.id === 'fire-streak' && state.streakDays >= 7) shouldUnlock = true;
          if (badge.id === 'scaler' && completedAreas >= 3) shouldUnlock = true;
          if (badge.id === 'scalable-biz' && completedAreas >= 8) shouldUnlock = true;

          if (shouldUnlock) {
            newlyUnlocked = { ...badge, unlockedAt: now };
            return newlyUnlocked;
          }
          return badge;
        });

        set({ badges: updatedBadges, newlyUnlockedBadge: newlyUnlocked });

        if (newlyUnlocked) {
          get().addXp(150, `Insignia desbloqueada: ${(newlyUnlocked as Badge).name}`);
        }
      },

      clearNewBadge: () => set({ newlyUnlockedBadge: null })
    }),
    {
      name: 'escala:learning-state:v1'
    }
  )
);
