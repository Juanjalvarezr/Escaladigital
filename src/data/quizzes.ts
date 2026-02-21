// Quizzes funcionales para cada módulo con evaluación y calificación

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'text';
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  points: number;
}

export interface Quiz {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit: number; // minutos
  attemptsAllowed: number;
}

// Quizzes para Gestión
export const managementQuizzes: Quiz[] = [
  {
    id: 'management-quiz-1',
    moduleId: 'management-module-1',
    title: 'Fundamentos de Gestión Empresarial',
    description: 'Evalúa tu comprensión de los conceptos básicos de gestión empresarial',
    questions: [
      {
        id: 'mg-q1',
        question: '¿Cuál es el objetivo principal de la gestión empresarial?',
        type: 'multiple-choice',
        options: [
          'Maximizar ganancias a corto plazo',
          'Lograr objetivos de manera eficiente y efectiva',
          'Minimizar costos sin importar la calidad',
          'Contratar más empleados'
        ],
        correctAnswer: 1,
        explanation: 'La gestión empresarial busca lograr los objetivos organizacionales de manera eficiente y efectiva, optimizando el uso de recursos.',
        points: 10
      },
      {
        id: 'mg-q2',
        question: 'La planificación es el primer paso del proceso de gestión.',
        type: 'true-false',
        correctAnswer: 'true',
        explanation: 'Correcto. El proceso de gestión tradicionalmente sigue: Planificar → Organizar → Dirigir → Controlar.',
        points: 10
      },
      {
        id: 'mg-q3',
        question: '¿Qué habilidad es más importante para un gestor efectivo?',
        type: 'multiple-choice',
        options: [
          'Conocimiento técnico profundo',
          'Capacidad de comunicación y liderazgo',
          'Habilidad para trabajar solo',
          'Experiencia en finanzas'
        ],
        correctAnswer: 1,
        explanation: 'La comunicación y el liderazgo son fundamentales para coordinar equipos y lograr objetivos organizacionales.',
        points: 15
      }
    ],
    passingScore: 70,
    timeLimit: 15,
    attemptsAllowed: 3
  }
];

// Quizzes para Ventas
export const salesQuizzes: Quiz[] = [
  {
    id: 'sales-quiz-1',
    moduleId: 'sales-module-1',
    title: 'Técnicas de Venta Efectivas',
    description: 'Evalúa tu conocimiento sobre las mejores prácticas de venta',
    questions: [
      {
        id: 'sl-q1',
        question: '¿Cuál es el paso más importante en el proceso de venta?',
        type: 'multiple-choice',
        options: [
          'Presentar el producto inmediatamente',
          'Escuchar y entender las necesidades del cliente',
          'Negociar el precio desde el inicio',
          'Cerrar la venta rápidamente'
        ],
        correctAnswer: 1,
        explanation: 'Escuchar activamente para entender las necesidades del cliente es fundamental para ofrecer soluciones adecuadas.',
        points: 15
      },
      {
        id: 'sl-q2',
        question: 'En la venta consultiva, el vendedor actúa como:',
        type: 'multiple-choice',
        options: [
          'Un simple vendedor de productos',
          'Un asesor que ayuda a resolver problemas',
          'Un experto en precios',
          'Un recolector de pedidos'
        ],
        correctAnswer: 1,
        explanation: 'La venta consultiva se enfoca en actuar como un asesor que ayuda al cliente a resolver sus problemas.',
        points: 15
      },
      {
        id: 'sl-q3',
        question: 'El seguimiento post-venta es crucial para la retención de clientes.',
        type: 'true-false',
        correctAnswer: 'true',
        explanation: 'Correcto. El seguimiento post-venta fortalece la relación y aumenta la probabilidad de compras futuras.',
        points: 10
      }
    ],
    passingScore: 75,
    timeLimit: 20,
    attemptsAllowed: 3
  }
];

// Quizzes para Marketing
export const marketingQuizzes: Quiz[] = [
  {
    id: 'marketing-quiz-1',
    moduleId: 'marketing-module-1',
    title: 'Marketing Digital Fundamentals',
    description: 'Evalúa tus conocimientos sobre marketing digital',
    questions: [
      {
        id: 'mk-q1',
        question: '¿Qué significa SEO en marketing digital?',
        type: 'multiple-choice',
        options: [
          'Search Engine Optimization',
          'Social Media Engagement',
          'Sales Effectiveness Optimization',
          'Strategic Email Outreach'
        ],
        correctAnswer: 0,
        explanation: 'SEO significa Search Engine Optimization (Optimización para Motores de Búsqueda), fundamental para visibilidad orgánica.',
        points: 10
      },
      {
        id: 'mk-q2',
        question: 'El content marketing se enfoca en crear contenido valioso y relevante.',
        type: 'true-false',
        correctAnswer: 'true',
        explanation: 'Correcto. El content marketing se basa en crear y distribuir contenido valioso para atraer y retener clientes.',
        points: 10
      },
      {
        id: 'mk-q3',
        question: '¿Cuál es la métrica más importante para medir el éxito de redes sociales?',
        type: 'multiple-choice',
        options: [
          'Número de publicaciones',
          'Engagement y conversiones',
          'Cantidad de seguidores',
          'Frecuencia de publicación'
        ],
        correctAnswer: 1,
        explanation: 'El engagement y las conversiones son las métricas que realmente muestran el impacto comercial de las redes sociales.',
        points: 15
      }
    ],
    passingScore: 70,
    timeLimit: 18,
    attemptsAllowed: 3
  }
];

// Quizzes para Finanzas
export const financeQuizzes: Quiz[] = [
  {
    id: 'finance-quiz-1',
    moduleId: 'finance-module-1',
    title: 'Gestión Financiera Básica',
    description: 'Evalúa tu comprensión de los fundamentos financieros empresariales',
    questions: [
      {
        id: 'fn-q1',
        question: '¿Qué es el flujo de caja (cash flow)?',
        type: 'multiple-choice',
        options: [
          'El total de ventas del mes',
          'El movimiento de dinero entrando y saliendo del negocio',
          'Las ganancias netas anuales',
          'El valor de los activos fijos'
        ],
        correctAnswer: 1,
        explanation: 'El flujo de caja registra todo el movimiento de dinero que entra y sale del negocio en un período determinado.',
        points: 15
      },
      {
        id: 'fn-q2',
        question: 'Separar las finanzas personales de las empresariales es obligatorio.',
        type: 'true-false',
        correctAnswer: 'true',
        explanation: 'Correcto. Es fundamental mantener finanzas separadas para una gestión clara y cumplimiento legal.',
        points: 10
      },
      {
        id: 'fn-q3',
        question: '¿Cuál es la primera regla de la gestión financiera?',
        type: 'multiple-choice',
        options: [
          'Maximizar ingresos',
          'Minimizar todos los costos',
          'Registrar y controlar cada transacción',
          'Invertir en crecimiento inmediatamente'
        ],
        correctAnswer: 2,
        explanation: 'La base de toda gestión financiera es el registro y control preciso de todas las transacciones.',
        points: 15
      }
    ],
    passingScore: 75,
    timeLimit: 25,
    attemptsAllowed: 3
  }
];

// Todos los quizzes por área
export const allQuizzes = {
  management: managementQuizzes,
  sales: salesQuizzes,
  marketing: marketingQuizzes,
  finance: financeQuizzes,
  operations: [], // Por implementar
  hr: [], // Por implementar
  technology: [], // Por implementar
  strategy: [] // Por implementar
};

// Función para obtener quizzes por módulo
export const getQuizzesByModule = (moduleId: string): Quiz[] => {
  const areaId = moduleId.split('-')[0];
  return allQuizzes[areaId as keyof typeof allQuizzes] || [];
};

// Función para obtener quiz específico
export const getQuizById = (quizId: string): Quiz | null => {
  for (const areaQuizzes of Object.values(allQuizzes)) {
    const quiz = areaQuizzes.find(q => q.id === quizId);
    if (quiz) return quiz;
  }
  return null;
};

// Función para calcular puntaje
export const calculateScore = (quiz: Quiz, answers: Record<string, string | number>): number => {
  let totalPoints = 0;
  let earnedPoints = 0;

  quiz.questions.forEach(question => {
    totalPoints += question.points;
    if (answers[question.id] === question.correctAnswer) {
      earnedPoints += question.points;
    }
  });

  return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
};

// Función para verificar si pasó el quiz
export const hasPassedQuiz = (score: number, passingScore: number): boolean => {
  return score >= passingScore;
};
