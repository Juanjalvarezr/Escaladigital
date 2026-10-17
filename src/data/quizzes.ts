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

// 1. Quizzes para Gestión
export const managementQuizzes: Quiz[] = [
  {
    id: 'quiz-management-1',
    moduleId: 'management-1',
    title: 'Evaluación: Liderazgo Estratégico y Ejecución',
    description: 'Valida tu comprensión de prioridades, alineación de equipo y delegación.',
    questions: [
      {
        id: 'mg-q1',
        question: '¿Cuál es el objetivo principal de la gestión estratégica en una empresa en crecimiento?',
        type: 'multiple-choice',
        options: [
          'Maximizar ganancias a corto plazo sin importar el equipo',
          'Alinear prioridades, organizar recursos y lograr objetivos con consistencia y eficiencia',
          'Minimizar costos eliminando cualquier tipo de inversión',
          'Controlar cada minuto de la jornada de los empleados'
        ],
        correctAnswer: 1,
        explanation: 'La gestión empresarial busca lograr los objetivos de forma sostenible y ordenada, optimizando los recursos disponibles.',
        points: 25
      },
      {
        id: 'mg-q2',
        question: 'Tener más de 3 prioridades estratégicas en un mes suele dispersar el foco y reducir el avance real.',
        type: 'true-false',
        options: ['Verdadero', 'Falso'],
        correctAnswer: 0,
        explanation: 'Correcto. La regla de oro directiva es concentrar los recursos en un máximo de 3 metas críticas a la vez.',
        points: 25
      },
      {
        id: 'mg-q3',
        question: '¿Cuál es la habilidad más crítica de un líder para evitar el autoempleo esclavizante?',
        type: 'multiple-choice',
        options: [
          'Hacer todo el trabajo técnico personalmente',
          'Saber delegar transfiriendo contexto, criterios de éxito y autonomía al equipo',
          'Trabajar 16 horas diarias todos los fines de semana',
          'Esperar a que el equipo adivine lo que debe hacer'
        ],
        correctAnswer: 1,
        explanation: 'Delegar con criterios de éxito claros es lo que permite que la empresa funcione y crezca sin requerir al fundador en cada detalle.',
        points: 25
      },
      {
        id: 'mg-q4',
        question: 'Una reunión semanal de alineación (Weekly Sync) efectiva debe durar:',
        type: 'multiple-choice',
        options: [
          '4 horas todos los días',
          '30 a 45 minutos con agenda fija para revisar métricas y destrabar bloqueos',
          'Solo cuando haya un conflicto grave',
          'Una vez al año'
        ],
        correctAnswer: 1,
        explanation: 'Las reuniones ágiles y periódicas mantienen sincronizado al equipo sin desgastar su tiempo productivo.',
        points: 25
      }
    ],
    passingScore: 70,
    timeLimit: 15,
    attemptsAllowed: 3
  }
];

// 2. Quizzes para Ventas
export const salesQuizzes: Quiz[] = [
  {
    id: 'quiz-sales-1',
    moduleId: 'sales-1',
    title: 'Evaluación: Prospección y Conversión B2B',
    description: 'Demuestra tu dominio sobre calificación de prospectos, valor y cierre comercial.',
    questions: [
      {
        id: 'sl-q1',
        question: '¿Cuál es el primer paso indispensable en una conversación de venta profesional?',
        type: 'multiple-choice',
        options: [
          'Presentar el catálogo de productos y dar el precio inmediatamente',
          'Escuchar activamente y hacer preguntas para entender el dolor o problema del cliente',
          'Prometer descuentos agresivos sin saber qué necesita',
          'Presionar para firmar un contrato en los primeros 5 minutos'
        ],
        correctAnswer: 1,
        explanation: 'Los clientes compran soluciones a problemas específicos. Sin diagnóstico previo, no hay valor percibido.',
        points: 25
      },
      {
        id: 'sl-q2',
        question: 'Cuando un prospecto argumenta que el precio es alto, la causa más común es:',
        type: 'multiple-choice',
        options: [
          'Que el valor percibido y el retorno de inversión aún no han quedado claros',
          'Que el vendedor debe reducir el precio a la mitad de inmediato',
          'Que el cliente no necesita ninguna solución',
          'Que la reunión debe cancelarse'
        ],
        correctAnswer: 0,
        explanation: 'El precio es relativo al beneficio. Cuando el cliente ve que recuperará 5x su inversión, el precio deja de ser una objeción.',
        points: 25
      },
      {
        id: 'sl-q3',
        question: 'El seguimiento (follow-up) estructurado y oportuno es responsable de más del 70% de los cierres.',
        type: 'true-false',
        options: ['Verdadero', 'Falso'],
        correctAnswer: 0,
        explanation: 'Correcto. La mayoría de compras B2B requieren múltiples puntos de contacto antes de que el decisor concrete el acuerdo.',
        points: 25
      },
      {
        id: 'sl-q4',
        question: 'En ventas consultivas, calificar un prospecto significa verificar:',
        type: 'multiple-choice',
        options: [
          'Presupuesto, Autoridad para decidir, Necesidad real y Plazo (BANT)',
          'El número de seguidores en redes sociales',
          'La antigüedad de su oficina física',
          'Si le cae bien el vendedor'
        ],
        correctAnswer: 0,
        explanation: 'Calificar oportunamente protege el tiempo del equipo comercial y eleva la tasa de conversión.',
        points: 25
      }
    ],
    passingScore: 70,
    timeLimit: 20,
    attemptsAllowed: 3
  }
];

// 3. Quizzes para Marketing
export const marketingQuizzes: Quiz[] = [
  {
    id: 'quiz-marketing-1',
    moduleId: 'marketing-1',
    title: 'Evaluación: Posicionamiento y Demanda Predecible',
    description: 'Valida tus conocimientos sobre diferenciación, CAC, LTV y embudos.',
    questions: [
      {
        id: 'mk-q1',
        question: '¿Qué es el posicionamiento estratégico de una marca?',
        type: 'multiple-choice',
        options: [
          'El diseño del logotipo y la selección de colores',
          'El espacio único, creíble y diferenciado que ocupas en la mente del cliente ideal frente a competidores',
          'La cantidad de publicaciones diarias en redes sociales',
          'Pagar anuncios masivos a cualquier audiencia'
        ],
        correctAnswer: 1,
        explanation: 'El posicionamiento responde a la pregunta decisiva del comprador: ¿por qué elegirte a ti y no a otra alternativa?',
        points: 25
      },
      {
        id: 'mk-q2',
        question: 'Para que un negocio sea financieramente saludable y escalable, la relación LTV : CAC ideal debe ser:',
        type: 'multiple-choice',
        options: [
          'El CAC debe ser 5 veces mayor que el LTV',
          'El LTV (Valor de vida del cliente) debe ser al menos 3 veces superior al CAC (Costo de adquisición)',
          'Ambos deben ser exactamente iguales a cero',
          'No importa la relación mientras haya facturación'
        ],
        correctAnswer: 1,
        explanation: 'Una relación LTV/CAC de 3:1 o superior asegura que adquirir nuevos clientes genere beneficios netos para reinvertir.',
        points: 25
      },
      {
        id: 'mk-q3',
        question: 'El contenido educativo que aborda los dolores del cliente genera prospectos más cualificados que las ofertas directas.',
        type: 'true-false',
        options: ['Verdadero', 'Falso'],
        correctAnswer: 0,
        explanation: 'Correcto. Educar al mercado posiciona a la empresa como autoridad confiable antes de pedir la venta.',
        points: 25
      },
      {
        id: 'mk-q4',
        question: '¿Cuál es el rol de un embudo de conversión?',
        type: 'multiple-choice',
        options: [
          'Complicar el viaje del usuario para que solo compren los más insistentes',
          'Guiar al prospecto de forma sistemática desde el descubrimiento del problema hasta la decisión de compra',
          'Aumentar el costo de los anuncios',
          'Enviar correos no deseados'
        ],
        correctAnswer: 1,
        explanation: 'El embudo nutre la confianza del prospecto en cada fase con mensajes adaptados a su nivel de conciencia.',
        points: 25
      }
    ],
    passingScore: 70,
    timeLimit: 15,
    attemptsAllowed: 3
  }
];

// 4. Quizzes para Operaciones
export const operationsQuizzes: Quiz[] = [
  {
    id: 'quiz-operations-1',
    moduleId: 'operations-1',
    title: 'Evaluación: Eficiencia Operativa y Procesos',
    description: 'Valida tu dominio sobre documentación de procesos, cuellos de botella y calidad.',
    questions: [
      {
        id: 'op-q1',
        question: '¿Cuál es el propósito fundamental de documentar Procedimientos Operativos Estándar (SOPs)?',
        type: 'multiple-choice',
        options: [
          'Acumular archivos en la nube sin utilidad práctica',
          'Garantizar consistencia en la calidad, reducir errores y permitir la delegación efectiva',
          'Impedir que el equipo tenga creatividad',
          'Reemplazar a todo el personal con manuales'
        ],
        correctAnswer: 1,
        explanation: 'Los procesos estandarizados permiten que los resultados dependan del sistema y no exclusivamente de personas indispensables.',
        points: 25
      },
      {
        id: 'op-q2',
        question: 'El rendimiento total de una cadena operativa está determinado por su eslabón más lento (cuello de botella).',
        type: 'true-false',
        options: ['Verdadero', 'Falso'],
        correctAnswer: 0,
        explanation: 'Correcto (Teoría de Restricciones). Mejorar cualquier otra área no aumentará las entregas hasta que se destrabe el cuello de botella.',
        points: 25
      },
      {
        id: 'op-q3',
        question: '¿Cuál es la herramienta más simple y efectiva para prevenir fallos repetitivos en tareas críticas?',
        type: 'multiple-choice',
        options: [
          'Amonestar al personal tras cometer el error',
          'Checklists de verificación paso a paso antes de dar por terminada la entrega',
          'Comprar maquinaria innecesaria',
          'Ignorar las quejas de los clientes'
        ],
        correctAnswer: 1,
        explanation: 'Los checklists previenen descuidos humanos y garantizan que nada esencial se pase por alto.',
        points: 25
      },
      {
        id: 'op-q4',
        question: 'Reducir el tiempo de ciclo (Lead Time) de entrega al cliente produce:',
        type: 'multiple-choice',
        options: [
          'Mayor satisfacción del cliente, rotación de capital más rápida y ventaja competitiva',
          'Menores ventas y mayores quejas',
          'Pérdida de control interno',
          'Gastos innecesarios sin retorno'
        ],
        correctAnswer: 0,
        explanation: 'La velocidad con calidad alta es uno de los factores más valorados por clientes modernos en cualquier industria.',
        points: 25
      }
    ],
    passingScore: 70,
    timeLimit: 15,
    attemptsAllowed: 3
  }
];

// 5. Quizzes para Finanzas
export const financeQuizzes: Quiz[] = [
  {
    id: 'quiz-finance-1',
    moduleId: 'finance-1',
    title: 'Evaluación: Flujo de Caja y Rentabilidad Real',
    description: 'Evalúa tu comprensión de liquidez, márgenes, runway y salud financiera empresarial.',
    questions: [
      {
        id: 'fn-q1',
        question: '¿Por qué una empresa con utilidades en su balance contable puede quebrar repentinamente?',
        type: 'multiple-choice',
        options: [
          'Porque facturar no es cobrar: si el efectivo en banco se agota para cubrir nóminas o deudas, se detiene la operación',
          'Porque tener ganancias siempre atrae auditorías fiscales negativas',
          'Porque las utilidades no tienen valor financiero',
          'Porque los bancos cancelan las cuentas de empresas rentables'
        ],
        correctAnswer: 0,
        explanation: 'La liquidez es el oxígeno. Si cobras a 90 días y pagas a 15, la falta de efectivo puede forzar el cierre aunque seas rentable en papel.',
        points: 25
      },
      {
        id: 'fn-q2',
        question: 'El "Cash Runway" de una empresa representa:',
        type: 'multiple-choice',
        options: [
          'El total de préstamos bancarios solicitados',
          'Los meses de supervivencia que tiene la empresa con su saldo actual si los ingresos se detuvieran',
          'La proyección de ventas a 5 años',
          'El monto pagado en dividendos'
        ],
        correctAnswer: 1,
        explanation: 'Runway = Saldo en banco ÷ Gastos operativos mensuales netos. Da el horizonte de tranquilidad operativa.',
        points: 25
      },
      {
        id: 'fn-q3',
        question: 'Separar las cuentas bancarias personales del dueño de las cuentas del negocio es una regla innegociable.',
        type: 'true-false',
        options: ['Verdadero', 'Falso'],
        correctAnswer: 0,
        explanation: 'Correcto. Mezclar finanzas distorsiona la realidad de costos del negocio y pone en riesgo el patrimonio del fundador.',
        points: 25
      },
      {
        id: 'fn-q4',
        question: 'Un aumento del 10% en precios con una propuesta de valor sólida suele ser más rentable que duplicar clientes porque:',
        type: 'multiple-choice',
        options: [
          'El incremento va 100% al margen neto sin duplicar nómina, soporte ni capacidad productiva',
          'Vender más barato siempre es ilegal',
          'Los clientes solo respetan productos caros',
          'No es más rentable, siempre es mejor bajar precios'
        ],
        correctAnswer: 0,
        explanation: 'El precio impacta directamente la última línea del estado de resultados sin añadir fricción operativa.',
        points: 25
      }
    ],
    passingScore: 70,
    timeLimit: 20,
    attemptsAllowed: 3
  }
];

// 6. Quizzes para Tecnología
export const technologyQuizzes: Quiz[] = [
  {
    id: 'quiz-technology-1',
    moduleId: 'technology-1',
    title: 'Evaluación: Herramientas Digitales y Automatización',
    description: 'Valida tu criterio para seleccionar herramientas, integrar sistemas y proteger datos.',
    questions: [
      {
        id: 'tc-q1',
        question: 'Al seleccionar un software para tu empresa, el criterio primordial debe ser:',
        type: 'multiple-choice',
        options: [
          'Adquirir el sistema más costoso y con mayor cantidad de funciones posibles',
          'Elegir la solución que resuelva el dolor actual con la menor fricción de adopción para el equipo',
          'Contratar programadores para crear todo desde cero',
          'Elegir el software que use la empresa más grande del mundo sin importar tu contexto'
        ],
        correctAnswer: 1,
        explanation: 'La mejor tecnología es aquella que tu equipo efectivamente utiliza y que destraba valor de inmediato.',
        points: 25
      },
      {
        id: 'tc-q2',
        question: 'Las integraciones no-code o mediante APIs eliminan el error humano y ahorran horas semanales de trabajo manual.',
        type: 'true-false',
        options: ['Verdadero', 'Falso'],
        correctAnswer: 0,
        explanation: 'Correcto. Automatizar el traspaso de información entre CRM, pagos y soporte acelera los tiempos y evita descuidos.',
        points: 25
      },
      {
        id: 'tc-q3',
        question: '¿Cuál es la función de una "Torre de Control" o Dashboard de métricas?',
        type: 'multiple-choice',
        options: [
          'Mostrar gráficos decorativos para impresionar visitas',
          'Proporcionar visibilidad en tiempo real de los 5-10 indicadores críticos para tomar decisiones con datos y no suposiciones',
          'Controlar el tiempo de descanso de los colaboradores',
          'Reemplazar la contabilidad'
        ],
        correctAnswer: 1,
        explanation: 'Un tablero de control anticipa problemas antes de que se conviertan en crisis operativas o financieras.',
        points: 25
      },
      {
        id: 'tc-q4',
        question: 'La seguridad digital básica en una pyme incluye:',
        type: 'multiple-choice',
        options: [
          'Autenticación de dos pasos (2FA), gestión de contraseñas seguras y permisos basados en roles',
          'Compartir contraseñas por correo en texto plano',
          'Usar la misma clave para todas las plataformas bancarias',
          'Desactivar las copias de seguridad para ahorrar espacio'
        ],
        correctAnswer: 0,
        explanation: 'Implementar 2FA y roles de acceso previene el 99% de las brechas de seguridad comunes en empresas.',
        points: 25
      }
    ],
    passingScore: 70,
    timeLimit: 15,
    attemptsAllowed: 3
  }
];

// 7. Quizzes para Talento
export const talentQuizzes: Quiz[] = [
  {
    id: 'quiz-talent-1',
    moduleId: 'talent-1',
    title: 'Evaluación: Cultura, Atracción y Liderazgo de Equipo',
    description: 'Valida tu comprensión de selección por resultados, alineación cultural y retención.',
    questions: [
      {
        id: 'tl-q1',
        question: '¿Por qué contratar a la persona equivocada resulta tan costoso para una pyme?',
        type: 'multiple-choice',
        options: [
          'Únicamente por el salario del primer mes',
          'Por el costo acumulado de errores, fricción con el equipo, clientes insatisfechos y el tiempo invertido en reiniciar el proceso',
          'No tiene ningún costo relevante',
          'Porque los contratos de trabajo no se pueden terminar'
        ],
        correctAnswer: 1,
        explanation: 'Un mal fichaje drena energía directiva y desacelera el ritmo de entrega de todo el equipo.',
        points: 25
      },
      {
        id: 'tl-q2',
        question: 'Un Scorecard de puesto de trabajo define:',
        type: 'multiple-choice',
        options: [
          'La misión del rol, los resultados clave medibles esperados y las competencias necesarias',
          'El horario estricto de entrada y salida',
          'El historial académico sin importar resultados',
          'Las vacaciones acumuladas del colaborador'
        ],
        correctAnswer: 0,
        explanation: 'El Scorecard clarifica desde el día uno cómo se medirá el éxito en el puesto de manera objetiva.',
        points: 25
      },
      {
        id: 'tl-q3',
        question: 'Las reuniones 1 a 1 (1-on-1) periódicas entre líder y miembro de equipo son el mejor canal para retener talento.',
        type: 'true-false',
        options: ['Verdadero', 'Falso'],
        correctAnswer: 0,
        explanation: 'Correcto. Permiten escuchar retroalimentación, destrabar bloqueos y alinear desarrollo profesional a tiempo.',
        points: 25
      },
      {
        id: 'tl-q4',
        question: 'Una cultura de responsabilidad (Accountability) se construye cuando:',
        type: 'multiple-choice',
        options: [
          'Se castiga públicamente a quien se equivoca',
          'Las metas son transparentes, los acuerdos son claros y cada colaborador es dueño de su resultado',
          'El fundador supervisa cada clic en pantalla',
          'No se establecen metas para evitar presión'
        ],
        correctAnswer: 1,
        explanation: 'La autonomía con métricas transparentes genera compromiso y madurez en el equipo.',
        points: 25
      }
    ],
    passingScore: 70,
    timeLimit: 15,
    attemptsAllowed: 3
  }
];

// 8. Quizzes para Cliente
export const customerQuizzes: Quiz[] = [
  {
    id: 'quiz-customer-1',
    moduleId: 'customer-1',
    title: 'Evaluación: Experiencia de Cliente y Fidelización',
    description: 'Valida tu dominio sobre retención, NPS, reducción de churn y recomendaciones.',
    questions: [
      {
        id: 'cs-q1',
        question: '¿Por qué la retención de clientes existentes es el mayor acelerador de beneficios?',
        type: 'multiple-choice',
        options: [
          'Retener cuesta sustancialmente menos que captar, y los clientes habituales compran con mayor frecuencia y margen',
          'Porque no requiere dar soporte de servicio',
          'Porque los clientes nuevos siempre pagan con retraso',
          'No es más rentable, siempre es preferible cambiar de cartera'
        ],
        correctAnswer: 0,
        explanation: 'Un aumento modesto en retención eleva drásticamente el beneficio acumulado por cliente.',
        points: 25
      },
      {
        id: 'cs-q2',
        question: 'El Net Promoter Score (NPS) mide:',
        type: 'multiple-choice',
        options: [
          'El balance bancario al final del mes',
          'La probabilidad de que un cliente recomiende tu empresa a un colega o conocido',
          'El número de llamadas de ventas realizadas',
          'La cantidad de seguidores ganados'
        ],
        correctAnswer: 1,
        explanation: 'El NPS es el termómetro más fiable de la lealtad y satisfacción genuina del usuario.',
        points: 25
      },
      {
        id: 'cs-q3',
        question: 'Un cliente que expresa una queja representa una oportunidad para corregir un proceso y fortalecer su lealtad.',
        type: 'true-false',
        options: ['Verdadero', 'Falso'],
        correctAnswer: 0,
        explanation: 'Correcto. Quien se queja te brinda la oportunidad de solucionar el fallo; la mayoría de clientes insatisfechos simplemente se va en silencio.',
        points: 25
      },
      {
        id: 'cs-q4',
        question: '¿Cuál es el mejor momento para solicitar un testimonio o referido comercial?',
        type: 'multiple-choice',
        options: [
          'En el momento exacto en que el cliente experimenta su primer éxito o resultado tangible con tu solución',
          'Antes de que haya probado tu servicio',
          'Cuando el cliente expresa una duda técnica',
          'Nunca se deben pedir recomendaciones'
        ],
        correctAnswer: 0,
        explanation: 'Aprovechar el punto más alto de satisfacción multiplica la disposición a recomendar tu negocio.',
        points: 25
      }
    ],
    passingScore: 70,
    timeLimit: 15,
    attemptsAllowed: 3
  }
];

// Registro consolidado de todos los quizzes por área
export const allQuizzes: Record<string, Quiz[]> = {
  management: managementQuizzes,
  sales: salesQuizzes,
  marketing: marketingQuizzes,
  operations: operationsQuizzes,
  finance: financeQuizzes,
  technology: technologyQuizzes,
  talent: talentQuizzes,
  customer: customerQuizzes
};

// Función para obtener quizzes por módulo
export const getQuizzesByModule = (moduleId: string): Quiz[] => {
  const cleanId = moduleId.toLowerCase().replace(/^quiz-/, '');
  const areaId = cleanId.split('-')[0];
  return allQuizzes[areaId] || [];
};

// Función inteligente para obtener quiz específico con tolerancia a prefijos y formatos
export const getQuizById = (quizId: string): Quiz | null => {
  if (!quizId) return null;
  const normalizedId = quizId.toLowerCase().trim();
  const withoutQuizPrefix = normalizedId.replace(/^quiz-/, '');
  const areaId = withoutQuizPrefix.split('-')[0];

  // 1. Búsqueda exacta en todas las áreas
  for (const areaQuizzes of Object.values(allQuizzes)) {
    const quiz = areaQuizzes.find(
      q => q.id.toLowerCase() === normalizedId ||
           q.moduleId.toLowerCase() === withoutQuizPrefix ||
           q.id.toLowerCase() === `quiz-${withoutQuizPrefix}` ||
           q.moduleId.toLowerCase() === normalizedId
    );
    if (quiz) return quiz;
  }

  // 2. Coincidencia por área si existe
  if (allQuizzes[areaId] && allQuizzes[areaId].length > 0) {
    return allQuizzes[areaId][0];
  }

  // 3. Respaldo por defecto
  return managementQuizzes[0] || null;
};

// Función para calcular puntaje
export const calculateScore = (quiz: Quiz, answers: Record<string, string | number>): number => {
  let totalPoints = 0;
  let earnedPoints = 0;

  quiz.questions.forEach(question => {
    totalPoints += question.points;
    const given = answers[question.id];
    // Comparación tolerante numérica o booleana/string
    if (
      given !== undefined &&
      (given === question.correctAnswer ||
       String(given).toLowerCase() === String(question.correctAnswer).toLowerCase())
    ) {
      earnedPoints += question.points;
    }
  });

  return totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
};

// Función para verificar si pasó el quiz
export const hasPassedQuiz = (score: number, passingScore: number): boolean => {
  return score >= passingScore;
};
