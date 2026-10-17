import { SALES_MODULE, SalesModuleContent, SalesLesson } from './modules/sales.module';
import { FINANCE_MODULE } from './modules/finance.module';
import { MARKETING_MODULE } from './modules/marketing.module';
import { MANAGEMENT_MODULE } from './modules/management.module';
import { OPERATIONS_MODULE } from './modules/operations.module';
import { TALENT_MODULE } from './modules/talent.module';
import { TECHNOLOGY_MODULE } from './modules/technology.module';
import { CUSTOMER_MODULE } from './modules/customer.module';

export interface EnrichedLessonData {
  title: string;
  summary: string;
  whatIs: string;
  whyItMatters: string;
  keyPoints: string[];
  caseStudy?: {
    company: string;
    problem: string;
    solution: string;
    result: string;
  };
  actionItems: string[];
  resources: Array<{
    id?: string;
    title?: string;
    name?: string;
    type: string;
    description?: string;
    url?: string;
  }>;
  checkpoint: {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
  };
}

const MODULE_REGISTRY: Record<string, SalesModuleContent> = {
  sales: SALES_MODULE,
  finance: FINANCE_MODULE,
  marketing: MARKETING_MODULE,
  management: MANAGEMENT_MODULE,
  operations: OPERATIONS_MODULE,
  talent: TALENT_MODULE,
  technology: TECHNOLOGY_MODULE,
  customer: CUSTOMER_MODULE,
};

const AREA_CHECKPOINTS: Record<string, Record<number, { question: string; options: string[]; correct: number; explanation: string }>> = {
  finance: {
    1: {
      question: 'Si un cliente te compra un proyecto de $10,000 USD pero te paga en 90 días, ¿cómo afecta a tu negocio hoy?',
      options: [
        'Tu empresa tiene $10,000 más en caja inmediatamente para gastar.',
        'Tienes una ganancia en papel, pero tu caja está en cero y podrías tener problemas de liquidez hoy.',
        'No tiene ningún efecto contable ni operativo.',
        'El banco te aumenta el crédito de inmediato.'
      ],
      correct: 1,
      explanation: 'Facturar no es cobrar. La liquidez manda. Si gastas antes de recibir el efectivo, quiebras siendo rentable en papel.'
    },
    2: {
      question: '¿Cuál es el objetivo principal de un presupuesto con visión de flujo de caja?',
      options: [
        'Limitar cualquier inversión e impedir que el equipo gaste.',
        'Asignar a cada peso una misión antes de que empiece el mes y proyectar contingencias.',
        'Cumplir un requisito de los inversionistas sin mirarlo después.',
        'Calcular los impuestos del año pasado.'
      ],
      correct: 1,
      explanation: 'El presupuesto es una brújula de control proactivo, no un candado ciego.'
    },
    3: {
      question: '¿Qué es el "Cash Runway" de una empresa?',
      options: [
        'La pista de aterrizaje donde viajan los directivos.',
        'El total de facturas emitidas en el último trimestre.',
        'Los meses que la empresa puede sobrevivir sin ventas con el efectivo actual en banco.',
        'El interés que cobra el banco por un sobregiro.'
      ],
      correct: 2,
      explanation: 'Runway = Efectivo en banco ÷ Quema mensual (Burn rate). Te da tranquilidad o alerta de emergencia.'
    },
    4: {
      question: '¿Por qué aumentar precios puede ser más rentable que duplicar clientes?',
      options: [
        'Porque vender más barato siempre destruye la reputación.',
        'Porque un aumento de precio va directo al margen neto sin incrementar costos operativos ni capacidad del equipo.',
        'Porque los clientes pagan más solo si los obligas.',
        'No es más rentable, siempre es mejor tener más clientes a cualquier precio.'
      ],
      correct: 1,
      explanation: 'El precio es la palanca financiera más directa al beneficio neto. Duplicar clientes duplica soporte y costos.'
    },
    5: {
      question: '¿Cuál es la diferencia entre margen bruto y margen neto?',
      options: [
        'No hay diferencia, son sinónimos.',
        'El bruto resta costos directos de entrega; el neto resta costos directos, gastos operativos, nóminas e impuestos.',
        'El margen neto siempre es más alto que el bruto.',
        'El margen bruto solo aplica a empresas que venden productos físicos.'
      ],
      correct: 1,
      explanation: 'El margen bruto te dice si tu producto es viable; el margen neto te dice si tu empresa es rentable en su conjunto.'
    }
  },
  sales: {
    1: {
      question: '¿Cuál es el error número 1 al iniciar una conversación con un prospecto?',
      options: [
        'Presentar el catálogo técnico de inmediato sin descubrir su dolor o necesidad real.',
        'Saludar educadamente y preguntar cómo está.',
        'Saber el nombre de la empresa del prospecto.',
        'Dar un precio por escrito tras entender su problema.'
      ],
      correct: 0,
      explanation: 'Los clientes no compran características; compran soluciones a problemas que les duelen o les cuestan dinero.'
    },
    2: {
      question: 'Cuando un cliente dice "tu precio es muy caro", ¿qué significa realmente?',
      options: [
        'Que no tiene dinero en lo absoluto.',
        'Que el valor percibido de la solución aún no supera el riesgo o costo del dinero solicitado.',
        'Que te odia y debes terminar la reunión inmediatamente.',
        'Que debes hacer un 50% de descuento de inmediato.'
      ],
      correct: 1,
      explanation: 'El precio es relativo al valor. Cuando el cliente entiende que tu solución le ahorrará $10,000, pagar $2,000 es una ganga.'
    },
    3: {
      question: '¿En qué etapa de la venta se pierden más oportunidades por falta de sistema?',
      options: [
        'En la primera llamada de prospección.',
        'En el saludo inicial.',
        'En el seguimiento (follow-up) después de enviar la propuesta.',
        'Al momento de emitir la factura.'
      ],
      correct: 2,
      explanation: 'El 80% de las ventas se cierran entre el 5to y 12vo contacto, pero la mayoría de vendedores se rinden tras el primero.'
    },
    4: {
      question: '¿Qué es una pregunta de calificación en ventas B2B?',
      options: [
        'Una pregunta para saber el signo zodiacal del cliente.',
        'Una pregunta para validar si tiene presupuesto, autoridad para decidir, necesidad real y plazo claro (BANT).',
        'Una pregunta para calificar del 1 al 10 el servicio del mes pasado.',
        'Una encuesta genérica de satisfacción.'
      ],
      correct: 1,
      explanation: 'Calificar a tiempo te evita invertir horas en prospectos que no tienen poder de decisión ni presupuesto.'
    },
    5: {
      question: '¿Cuál es la mejor manera de cerrar una venta con indecisión?',
      options: [
        'Presionar y llamar 10 veces al día.',
        'Definir un siguiente paso concreto con fecha, hora y compromiso mutuo.',
        'Esperar semanas a que el cliente te busque solo.',
        'Bajar el precio a la mitad sin que lo hayan pedido.'
      ],
      correct: 1,
      explanation: 'Un cierre profesional no es truco mágico; es acordar el siguiente paso natural en la conversación.'
    }
  },
  marketing: {
    1: {
      question: '¿Qué es un posicionamiento de marca efectivo?',
      options: [
        'Tener un logotipo bonito con colores llamativos.',
        'El lugar específico y diferenciado que ocupas en la mente del cliente ideal frente a tu competencia.',
        'Pagar anuncios en todas las redes sociales sin segmentar.',
        'Tener más de 10,000 seguidores en Instagram.'
      ],
      correct: 1,
      explanation: 'El posicionamiento responde con claridad: ¿por qué debería comprarte a ti y no a cualquier otra alternativa?'
    },
    2: {
      question: '¿Cuál es la regla de oro para crear contenido que genere clientes reales?',
      options: [
        'Publicar bailes virales y memes sin relación con tu negocio.',
        'Resolver dudas frecuentes y dolores específicos de tu cliente ideal para demostrar autoridad.',
        'Publicar únicamente promociones y descuentos diarios.',
        'Copiar palabra por palabra a la competencia más grande.'
      ],
      correct: 1,
      explanation: 'El contenido educativo orientado al problema genera confianza y atrae a prospectos calificados listos para comprar.'
    },
    3: {
      question: '¿Qué mide el Costo de Adquisición de Clientes (CAC)?',
      options: [
        'Cuánto cuesta producir tu producto.',
        'La inversión total en marketing y ventas dividida entre los nuevos clientes obtenidos.',
        'El salario del gerente de marketing.',
        'El precio de los anuncios de Google.'
      ],
      correct: 1,
      explanation: 'Si tu CAC es mayor que el valor de vida de tu cliente (LTV), tu negocio pierde dinero con cada venta.'
    },
    4: {
      question: '¿Qué significa la métrica LTV (Life Time Value)?',
      options: [
        'El tiempo que dura un empleado en la empresa.',
        'El valor total en ingresos o margen que un cliente genera a lo largo de toda su relación comercial con tu empresa.',
        'La velocidad de carga de tu sitio web.',
        'El número de visualizaciones de un video.'
      ],
      correct: 1,
      explanation: 'Un LTV alto te permite invertir con agresividad y rentabilidad en adquirir más clientes que tu competencia.'
    },
    5: {
      question: '¿Por qué un embudo de conversión necesita diferentes etapas (Top, Middle, Bottom)?',
      options: [
        'Porque un cliente desconocido no está listo para comprar en el primer segundo.',
        'Para complicar el proceso de compra de los usuarios.',
        'Porque las redes sociales lo exigen obligatoriamente.',
        'Solo aplica para empresas que venden en Amazon.'
      ],
      correct: 0,
      explanation: 'Las personas primero descubren su problema, luego evalúan opciones y finalmente eligen al proveedor de mayor confianza.'
    }
  },
  operations: {
    1: {
      question: '¿Qué es un Procedimiento Operativo Estándar (SOP o Proceso)?',
      options: [
        'Un documento aburrido que se guarda en una carpeta y nunca se abre.',
        'Una guía paso a paso clara que permite que cualquier persona del equipo ejecute una tarea con calidad uniforme.',
        'Una ley gubernamental para cobrar impuestos.',
        'Un contrato de despido laboral.'
      ],
      correct: 1,
      explanation: 'Los procesos documentados son los que permiten que el dueño delegue y la empresa funcione sin su presencia continua.'
    },
    2: {
      question: '¿Cuál es el principal síntoma de una operación con "cuello de botella"?',
      options: [
        'Todos los empleados salen a tiempo sin estrés.',
        'Un paso del flujo acumula trabajo pendiente y detiene todo el ritmo de entrega al cliente.',
        'Las ventas superan la capacidad de cobro del banco.',
        'Se compran demasiadas computadoras.'
      ],
      correct: 1,
      explanation: 'El rendimiento de un sistema está determinado por su eslabón más lento. Optimizar el cuello de botella acelera todo.'
    },
    3: {
      question: '¿Cómo reduce una empresa sus errores repetitivos más costosos?',
      options: [
        'Regañando al equipo en público.',
        'Implementando checklists de verificación antes de cada entrega crítica.',
        'Esperando a que el cliente se queje para actuar.',
        'Cambiando de personal cada mes.'
      ],
      correct: 1,
      explanation: 'Los checklists simples previenen el 90% de los descuidos operativos en aviación, medicina y empresas de alto rendimiento.'
    },
    4: {
      question: '¿Qué significa el principio de "Automatizar lo repetitivo"?',
      options: [
        'Despedir a todo el equipo humano.',
        'Usar software o integraciones para tareas mecánicas para que las personas se enfoquen en tareas de alto valor.',
        'Comprar robots industriales costosos para una oficina.',
        'Enviar correos masivos a listas compradas.'
      ],
      correct: 1,
      explanation: 'Automatizar tareas mecánicas ahorra horas semanales y elimina errores de digitación o traspaso de datos.'
    },
    5: {
      question: '¿Cuál es el objetivo de medir los tiempos de ciclo (Lead Time)?',
      options: [
        'Cronometrar a los empleados cuando van al baño.',
        'Reducir el tiempo total desde que el cliente pide un servicio hasta que lo recibe con satisfacción.',
        'Aumentar los días de vacaciones del gerente.',
        'Demorar los envíos a propósito.'
      ],
      correct: 1,
      explanation: 'Entregar más rápido y con máxima calidad es una de las ventajas competitivas más difíciles de copiar.'
    }
  },
  management: {
    1: {
      question: '¿Qué ocurre cuando un líder define 10 prioridades para el mes?',
      options: [
        'El equipo trabaja con un 100% de motivación.',
        'Al haber tantas prioridades, ninguna es prioridad real y la ejecución se dispersa.',
        'Se logran todos los objetivos en la mitad del tiempo.',
        'La empresa escala automáticamente.'
      ],
      correct: 1,
      explanation: 'Tener más de 3 prioridades equivale a no tener ninguna. La claridad de enfoque es la principal labor directiva.'
    },
    2: {
      question: '¿Qué diferencia a un negocio que escala de un autoempleo esclavizante?',
      options: [
        'El tamaño de la oficina.',
        'Tener sistemas y líderes capacitados que toman decisiones sin requerir la aprobación del fundador en cada detalle.',
        'Facturar con facturación electrónica.',
        'Trabajar 16 horas diarias todos los días.'
      ],
      correct: 1,
      explanation: 'Si el negocio depende de ti para abrir la puerta y contestar cada duda, tienes un empleo exigente, no una empresa.'
    },
    3: {
      question: '¿Cuál es la frecuencia ideal para una reunión de alineación semanal (Weekly Sprint)?',
      options: [
        '4 horas todos los días.',
        '30 a 45 minutos semanales para revisar métricas, avances contra metas del mes y destrabar bloqueos.',
        'Una vez al año en diciembre.',
        'Solo cuando haya una crisis o discusión.'
      ],
      correct: 1,
      explanation: 'Reuniones cortas, estructuradas y con agenda fija mantienen al equipo sincronizado sin robar tiempo productivo.'
    },
    4: {
      question: '¿Cómo debe estructurarse un OKR (Objective & Key Result)?',
      options: [
        'Una lista interminable de tareas pendientes.',
        'Un Objetivo cualitativo inspirador acompañado de 2 o 3 Resultados Clave numéricos y medibles.',
        'Un resumen de gastos contables.',
        'Una opinión del gerente general.'
      ],
      correct: 1,
      explanation: 'Los OKRs vinculan la visión estratégica con indicadores numéricos concretos que todos pueden medir.'
    },
    5: {
      question: '¿Cuál es el rol de un dueño de negocio al delegar una responsabilidad?',
      options: [
        'Abandonar la tarea y culpar al empleado si sale mal.',
        'Definir el resultado esperado, dar recursos, acordar puntos de control y permitir autonomía en la ejecución.',
        'Estar encima cada 5 minutos revisando la pantalla.',
        'Hacer la tarea uno mismo en secreto.'
      ],
      correct: 1,
      explanation: 'Delegar con éxito exige transferir contexto y criterios de éxito, no micromanagear la actividad.'
    }
  },
  technology: {
    1: {
      question: '¿Cuál es la regla principal al elegir una herramienta digital para tu empresa?',
      options: [
        'Comprar el software más costoso y complejo del mercado.',
        'Elegir la herramienta más simple que resuelva el problema actual y que el equipo realmente vaya a usar a diario.',
        'Desarrollar todo el software desde cero internamente.',
        'No usar ninguna herramienta digital.'
      ],
      correct: 1,
      explanation: 'La mejor herramienta no es la más sofisticada; es la que se adopta con menor fricción y resuelve el cuello de botella.'
    },
    2: {
      question: '¿Por qué un CRM centralizado supera a las hojas de cálculo en ventas?',
      options: [
        'Porque es más difícil de usar.',
        'Porque evita prospectos olvidados, guarda el historial de llamadas y permite automatizar recordatorios en equipo.',
        'Porque solo funciona en teléfonos de última generación.',
        'No lo supera, el papel siempre es mejor.'
      ],
      correct: 1,
      explanation: 'Las hojas de cálculo se desactualizan y desordenan rápido; el CRM otorga trazabilidad y alertas automáticas.'
    },
    3: {
      question: '¿Qué ventaja tiene conectar herramientas mediante APIs o plataformas no-code (como Zapier o Make)?',
      options: [
        'Aumenta el consumo de luz de la oficina.',
        'Permite sincronizar datos entre ventas, marketing y facturación en tiempo real sin contratar programadores.',
        'Elimina la necesidad de tener internet.',
        'Sirve para jugar en horario laboral.'
      ],
      correct: 1,
      explanation: 'Las integraciones eliminan el trabajo repetitivo de copiar y pegar información entre diferentes sistemas.'
    },
    4: {
      question: '¿Cuál es la mejor práctica para proteger los datos de clientes y la operación de tu empresa?',
      options: [
        'Compartir la misma contraseña entre todos los empleados en un post-it.',
        'Usar contraseñas seguras, autenticación de dos pasos (2FA) y permisos de acceso según el rol del usuario.',
        'Guardar todos los datos en una memoria USB.',
        'No pedir contraseñas para entrar al sistema.'
      ],
      correct: 1,
      explanation: 'La seguridad digital protege la continuidad de tu negocio y la confianza indispensable de tus clientes.'
    },
    5: {
      question: '¿Qué es una Torre de Control o Dashboard de datos?',
      options: [
        'Una pantalla con gráficos decorativos sin utilidad.',
        'Una vista única con los 5 a 10 indicadores vitales de la empresa para tomar decisiones basadas en números reales.',
        'Un protector de pantalla.',
        'Una hoja de cálculo impresa en la pared.'
      ],
      correct: 1,
      explanation: 'Lo que no se mide no se puede mejorar. Un dashboard te avisa antes de que un problema se convierta en crisis.'
    }
  },
  talent: {
    1: {
      question: '¿Cuál es el costo real de contratar a la persona equivocada?',
      options: [
        'Solo el salario del primer mes.',
        'Hasta 3 o 5 veces su salario anual en tiempo perdido, clientes insatisfechos, fricción de equipo y nueva contratación.',
        'Cero, porque se puede despedir fácilmente.',
        'El costo del anuncio de empleo únicamente.'
      ],
      correct: 1,
      explanation: 'Contratar despacio y con rigor técnico y cultural ahorra miles de dólares y meses de desgaste al equipo.'
    },
    2: {
      question: '¿Qué es un Scorecard de puesto de trabajo?',
      options: [
        'Un juego de cartas para recursos humanos.',
        'Un documento que define la misión del rol, los 3 resultados numéricos esperados y las competencias requeridas.',
        'Una lista vaga de tareas genéricas como "ser proactivo".',
        'El comprobante de pago de nómina.'
      ],
      correct: 1,
      explanation: 'Tener claridad de los resultados específicos esperados permite evaluar el desempeño de forma objetiva.'
    },
    3: {
      question: '¿Cuál es la función principal de una reunión 1 a 1 (1-on-1) mensual entre líder y colaborador?',
      options: [
        'Regañar al colaborador por llegar 5 minutos tarde.',
        'Escuchar sus desafíos, alinear expectativas, destrabar bloqueos y apoyar su desarrollo profesional.',
        'Revisar facturas de gastos.',
        'Hablar del clima durante una hora.'
      ],
      correct: 1,
      explanation: 'El 1-on-1 es el espacio de confianza para retener a los mejores talentos y anticipar problemas de clima laboral.'
    },
    4: {
      question: '¿Qué motiva a los profesionales de alto rendimiento más allá del salario?',
      options: [
        'Tener una cafetera nueva.',
        'Autonomía, maestría (aprender habilidades valiosas) y un propósito claro donde su trabajo tenga impacto real.',
        'Tener muchas reglas y horarios rígidos.',
        'Trabajar sin saber si la empresa va bien o mal.'
      ],
      correct: 1,
      explanation: 'El talento sobresaliente busca entornos de reto, confianza y crecimiento profesional continuo.'
    },
    5: {
      question: '¿Cómo se construye una cultura de rendición de cuentas (Accountability)?',
      options: [
        'Con castigos y miedo a equivocarse.',
        'Con metas transparentes, acuerdos claros y seguimiento periódico donde cada quien es dueño de su resultado.',
        'Haciendo que el dueño revise todo personalmente.',
        'Dejando que cada quien haga lo que quiera sin metas.'
      ],
      correct: 1,
      explanation: 'La responsabilidad florece cuando las metas son públicas y cada persona tiene la propiedad de su indicador.'
    }
  },
  customer: {
    1: {
      question: '¿Por qué la retención de clientes es más rentable que la adquisición constante?',
      options: [
        'Retener un cliente cuesta hasta 5 veces menos que conseguir uno nuevo y suele comprar con mayor frecuencia.',
        'Porque no hay que pagar impuestos por clientes antiguos.',
        'Porque los clientes antiguos nunca piden soporte.',
        'No es más rentable; siempre hay que cambiar de clientes.'
      ],
      correct: 0,
      explanation: 'Aumentar la retención de clientes en solo un 5% puede incrementar los beneficios entre un 25% y un 95%.'
    },
    2: {
      question: '¿Qué mide el Net Promoter Score (NPS)?',
      options: [
        'El número de seguidores en redes sociales.',
        'La probabilidad de que tus clientes recomienden tu producto o servicio a un amigo o colega.',
        'El costo de los servidores.',
        'La cantidad de llamadas de soporte contestadas.'
      ],
      correct: 1,
      explanation: 'El NPS es el termómetro más directo de la lealtad y la satisfacción real de tus usuarios.'
    },
    3: {
      question: 'Cuando un cliente insatisfecho se queja, ¿cómo debe verse esa situación?',
      options: [
        'Como un ataque personal que hay que ignorar.',
        'Como una oportunidad invaluable para corregir un fallo operativo y convertir a un crítico en un cliente fiel.',
        'Como un motivo para bloquear su número.',
        'Como una pérdida inevitable.'
      ],
      correct: 1,
      explanation: 'Un cliente que se queja te está dando la oportunidad de mejorar antes de irse en silencio a la competencia.'
    },
    4: {
      question: '¿Qué es el proceso de Onboarding de clientes?',
      options: [
        'Cobrar la primera factura.',
        'La experiencia guiada de los primeros días donde el cliente experimenta el primer momento de valor ("Aha! moment").',
        'Enviar un correo de términos y condiciones de 20 páginas.',
        'La fiesta de bienvenida anual.'
      ],
      correct: 1,
      explanation: 'Un onboarding impecable reduce el churn de los primeros 90 días y asegura que el cliente adopte tu solución.'
    },
    5: {
      question: '¿Cómo se incentiva un sistema predecible de referidos boca a boca?',
      options: [
        'Esperar sentados a que ocurra por milagro.',
        'Pedir activamente una recomendación en el momento cumbre de satisfacción (cuando el cliente acaba de recibir su resultado).',
        'Ofrecer descuentos a clientes que no están contentos.',
        'Enviar spam a los contactos de tus clientes.'
      ],
      correct: 1,
      explanation: 'El mejor momento para pedir una recomendación es cuando el cliente acaba de celebrar una victoria con tu producto.'
    }
  }
};

export function getModuleContent(areaId: string, moduleId?: string): SalesModuleContent {
  const cleanArea = areaId?.toLowerCase().trim();
  if (cleanArea && MODULE_REGISTRY[cleanArea]) {
    return MODULE_REGISTRY[cleanArea];
  }

  // Si se pasa un moduleId como 'finance-1' o 'operations-2'
  if (moduleId) {
    const inferredArea = moduleId.split('-')[0].toLowerCase();
    if (MODULE_REGISTRY[inferredArea]) {
      return MODULE_REGISTRY[inferredArea];
    }
  }

  return MODULE_REGISTRY.management;
}

export function getLessonData(
  areaId: string,
  moduleId: string,
  lessonId: string
): EnrichedLessonData {
  const moduleContent = getModuleContent(areaId, moduleId);
  const cleanArea = (areaId || moduleId?.split('-')[0] || 'management').toLowerCase();
  
  // Extraer número de lección
  const match = lessonId.match(/\d+/);
  const lessonNum = match ? parseInt(match[0], 10) : 1;

  // Buscar lección en el módulo
  const foundLesson: SalesLesson | undefined = moduleContent.lessons.find(
    (l) => l.number === lessonNum || l.id === lessonId || l.id === `lesson-${lessonNum}`
  ) || moduleContent.lessons[0];

  const contentText = foundLesson?.content || '';
  const lines = contentText.split('\n').map(l => l.trim()).filter(Boolean);

  const whatIs = lines.slice(0, 3).join(' ') ||
    `Domina los principios esenciales de ${moduleContent.title} para tu empresa.`;

  const whyItMatters = foundLesson?.keyPoints?.slice(0, 2).join(' ') ||
    `Implementar este método reduce costos, optimiza tiempos y protege los ingresos de tu negocio.`;

  // Obtener checkpoint del área y lección o default
  const areaCheckpoints = AREA_CHECKPOINTS[cleanArea] || AREA_CHECKPOINTS.management;
  const checkpoint = areaCheckpoints[lessonNum] || areaCheckpoints[1] || {
    question: `¿Cuál es el beneficio primordial de implementar ${foundLesson?.title || 'este proceso'}?`,
    options: [
      'Reducir fricción operativa y mejorar la predictibilidad de los resultados.',
      'Aumentar la burocracia sin beneficio medible.',
      'Trabajar más horas sin descanso.',
      'Ignorar las métricas del negocio.'
    ],
    correct: 0,
    explanation: 'La sistematización busca resultados consistentes y sostenibles con el menor esfuerzo operativo.'
  };

  return {
    title: foundLesson?.title || `Lección ${lessonNum}: ${moduleContent.title}`,
    summary: moduleContent.description || 'Optimiza tu gestión para escalar con solidez.',
    whatIs,
    whyItMatters,
    keyPoints: foundLesson?.keyPoints || [
      'Medir antes de decidir.',
      'Enfocarse en las 3 prioridades del mes.',
      'Documentar procesos para delegar con confianza.'
    ],
    caseStudy: foundLesson?.caseStudy,
    actionItems: foundLesson?.actionItems || [
      'Revisa tu métrica principal de esta semana.',
      'Alinea una acción concreta con tu equipo.',
      'Elimina un bloqueo operativo antes de que termine el día.'
    ],
    resources: (foundLesson?.resources || []).map((r) => ({
      id: r.id,
      title: r.title,
      name: r.title,
      type: r.type,
      description: r.description,
      url: r.downloadUrl
    })),
    checkpoint
  };
}
