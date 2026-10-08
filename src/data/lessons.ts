// Lecciones reales para cada módulo con contenido estructurado

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  content: {
    whatIs: string;
    whyItMatters: string;
    howToApply: string;
    examples: string[];
    keyPoints: string[];
    resources: Array<{
      name: string;
      type: 'article' | 'video' | 'tool' | 'template';
      url?: string;
    }>;
  };
  duration: number;
  order: number;
}

// Lecciones para Gestión
export const managementLessons: Lesson[] = [
  {
    id: 'management-lesson-1',
    moduleId: 'management-module-1',
    title: 'Introducción a la Gestión Empresarial',
    content: {
      whatIs: 'La gestión empresarial es el proceso de planificar, organizar, dirigir y controlar los recursos de una organización para lograr sus objetivos de manera eficiente y efectiva.',
      whyItMatters: 'Una buena gestión es fundamental para el éxito sostenible de cualquier negocio, optimiza recursos, mejora la productividad y reduce riesgos operativos.',
      howToApply: '1. Define objetivos claros\n2. Organiza recursos humanos y materiales\n3. Establece sistemas de control\n4. Mide y ajusta continuamente',
      examples: [
        'Una pequeña tienda implementa un sistema de inventario que reduce pérdidas en 30%',
        'Una startup tecnológica usa metodologías ágiles para gestionar proyectos',
        'Un restaurante crea turnos eficientes que mejoran el servicio al cliente'
      ],
      keyPoints: [
        'La gestión es un proceso continuo',
        'Debe adaptarse a cada tipo de negocio',
        'La comunicación es clave para el éxito',
        'La medición de resultados es fundamental'
      ],
      resources: [
        { name: 'Plantilla de Plan de Negocio', type: 'template' },
        { name: 'Guía de Gestión de Proyectos', type: 'article' },
        { name: 'Herramientas de Productividad', type: 'tool' }
      ]
    },
    duration: 45,
    order: 1
  },
  {
    id: 'management-lesson-2',
    moduleId: 'management-module-1',
    title: 'Organización y Estructura',
    content: {
      whatIs: 'La organización empresarial se refiere a cómo se estructura una empresa para lograr sus objetivos, incluyendo la división del trabajo, jerarquías y sistemas de coordinación.',
      whyItMatters: 'Una estructura organizacional adecuada mejora la eficiencia, clarifica responsabilidades y facilita la toma de decisiones.',
      howToApply: '1. Analiza tu negocio actual\n2. Define roles y responsabilidades\n3. Crea flujos de trabajo\n4. Establece canales de comunicación',
      examples: [
        'Empresa de servicios crea departamentos por especialidad',
        'Negocio online organiza equipos por proyectos',
        'Tienda familiar establece roles claros para cada miembro'
      ],
      keyPoints: [
        'La estructura debe ser flexible',
        'Los roles deben estar claramente definidos',
        'La comunicación fluye mejor con estructura adecuada',
        'La organización evoluciona con el negocio'
      ],
      resources: [
        { name: 'Organigrama Interactivo', type: 'template' },
        { name: 'Guía de Diseño Organizacional', type: 'article' }
      ]
    },
    duration: 40,
    order: 2
  }
];

// Lecciones para Ventas
export const salesLessons: Lesson[] = [
  {
    id: 'sales-lesson-1',
    moduleId: 'sales-module-1',
    title: 'Fundamentos de la Venta',
    content: {
      whatIs: 'La venta es el proceso de persuadir a un cliente para que compre un producto o servicio, creando valor mutuo entre ambas partes.',
      whyItMatters: 'Las ventas son el motor de ingresos de cualquier negocio. Sin ventas efectivas, no hay crecimiento ni sostenibilidad.',
      howToApply: '1. Conoce profundamente tu producto\n2. Entiende las necesidades del cliente\n3. Presenta soluciones, no solo productos\n4. Cierra con seguimiento',
      examples: [
        'Vendedor de software descubre el problema real del cliente antes de presentar',
        'Tienda de ropa asesora sobre combinaciones en lugar de solo vender prendas',
        'Consultor vende soluciones integrales en lugar de servicios individuales'
      ],
      keyPoints: [
        'Escuchar es más importante que hablar',
        'Cada cliente es único',
        'El valor supera al precio',
        'El seguimiento es crucial'
      ],
      resources: [
        { name: 'Script de Venta Efectivo', type: 'template' },
        { name: 'Técnicas de Cierre', type: 'video' },
        { name: 'CRM Gratuito', type: 'tool' }
      ]
    },
    duration: 50,
    order: 1
  }
];

// Lecciones para Marketing
export const marketingLessons: Lesson[] = [
  {
    id: 'marketing-lesson-1',
    moduleId: 'marketing-module-1',
    title: 'Introducción al Marketing Digital',
    content: {
      whatIs: 'El marketing digital es el uso de canales digitales para promover productos y servicios, conectando con clientes a través de internet y dispositivos electrónicos.',
      whyItMatters: 'En la era digital, el 80% de los consumidores investigan online antes de comprar. El marketing digital es esencial para llegar a ellos.',
      howToApply: '1. Identifica tu público objetivo\n2. Elige canales digitales adecuados\n3. Crea contenido valioso\n4. Mide y optimiza resultados',
      examples: [
        'Restaurante usa Instagram para mostrar platos diarios',
        'Tienda online usa email marketing para recuperar carritos abandonados',
        'Servicio profesional usa LinkedIn para atraer clientes B2B'
      ],
      keyPoints: [
        'El contenido debe ser relevante y valioso',
        'La consistencia es clave en redes sociales',
        'El SEO mejora visibilidad orgánica',
        'Los analytics guían las decisiones'
      ],
      resources: [
        { name: 'Guía de Redes Sociales', type: 'article' },
        { name: 'Plantilla de Content Marketing', type: 'template' },
        { name: 'Herramientas de SEO', type: 'tool' }
      ]
    },
    duration: 55,
    order: 1
  }
];

// Lecciones para Finanzas
export const financeLessons: Lesson[] = [
  {
    id: 'finance-lesson-1',
    moduleId: 'finance-module-1',
    title: 'Gestión Financiera Básica',
    content: {
      whatIs: 'La gestión financiera es el proceso de planificar, organizar, dirigir y controlar las actividades financieras de una empresa para asegurar su viabilidad y crecimiento.',
      whyItMatters: 'Sin control financiero, incluso el mejor negocio puede fracasar. La gestión financiera asegura sostenibilidad y toma de decisiones informadas.',
      howToApply: '1. Lleva registro de todos los ingresos y egresos\n2. Crea presupuestos mensuales\n3. Separa finanzas personales y empresariales\n4. Revisa y ajusta periódicamente',
      examples: [
        'Pequeña empresa usa software de contabilidad para controlar flujo de caja',
        'Freelancer crea fondo de emergencia para meses sin ingresos',
        'Tienda implementa sistema de control de gastos diarios'
      ],
      keyPoints: [
        'El flujo de caja es vital',
        'Las reservas protegen contra imprevistos',
        'Las decisiones deben basarse en datos',
        'La planificación previene crisis'
      ],
      resources: [
        { name: 'Plantilla de Presupuesto', type: 'template' },
        { name: 'Software de Contabilidad Gratuito', type: 'tool' },
        { name: 'Guía de Flujo de Caja', type: 'article' }
      ]
    },
    duration: 60,
    order: 1
  }
];

// Todas las lecciones por área
export const allLessons = {
  management: managementLessons,
  sales: salesLessons,
  marketing: marketingLessons,
  finance: financeLessons,
  operations: [], // Por implementar
  hr: [], // Por implementar
  technology: [], // Por implementar
  strategy: [] // Por implementar
};

// Función para obtener lecciones por módulo
export const getLessonsByModule = (moduleId: string): Lesson[] => {
  const areaId = moduleId.split('-')[0];
  return allLessons[areaId as keyof typeof allLessons] || [];
};

// Función para obtener lección específica
export const getLessonById = (lessonId: string): Lesson | null => {
  for (const areaLessons of Object.values(allLessons)) {
    const lesson = areaLessons.find(l => l.id === lessonId);
    if (lesson) return lesson;
  }
  return null;
};
