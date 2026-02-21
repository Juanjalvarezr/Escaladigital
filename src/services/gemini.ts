import { GoogleGenerativeAI } from '@google/generative-ai';

// 🔥 SISTEMA MEJORADO DE GENERACIÓN DE CONTENIDO POR IA
// =====================================================
// CARACTERÍSTICAS PRINCIPALES:
// ✅ Generación personalizada según tipo de negocio
// ✅ Contenido adaptado al desafío específico
// ✅ Lecciones secuenciales y progresivas
// ✅ Ejemplos reales del sector
// ✅ Herramientas recomendadas por industria
// ✅ Checklist de implementación práctica

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'TU_API_KEY_REAL_AQUI'; 
const genAI = new GoogleGenerativeAI(API_KEY);

// Test de conexión mejorado
console.log('🤖 Gemini IA Status:', API_KEY && API_KEY !== 'TU_API_KEY_REAL_AQUI' ? '✅ ACTIVO' : '❌ INACTIVO');
if (API_KEY === 'TU_API_KEY_REAL_AQUI') {
  console.log('⚠️ Configura tu API Key en .env.local');
  console.log('📝 Ejemplo: REACT_APP_GEMINI_API_KEY=tu_api_key_real');
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

export interface LessonContent {
  title: string;
  content: string;
  summary: string;
  keyPoints: string[];
  // Estructura enriquecida con IA
  whatIs: string;
  whyItMatters: string;
  howToApply: string[];
  realWorldExample: {
    company: string;
    situation: string;
    solution: string;
    result: string;
  };
  tools: Array<{ 
    name: string; 
    description: string; 
    why: string; 
    link?: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    price: 'free' | 'freemium' | 'paid';
  }>;
  checklist: Array<{
    item: string;
    priority: 'critical' | 'important' | 'optional';
    timeframe: string;
  }>;
  commonMistakes: Array<{
    mistake: string;
    consequence: string;
    howToAvoid: string;
  }>;
  kpis: Array<{
    metric: string;
    target: string;
    howToMeasure: string;
  }>;
  nextSteps: string[];
  industryInsights?: {
    [industry: string]: {
      specificAdvice: string;
      localExamples: string[];
    };
  };
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export class GeminiService {
  private model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  private withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        const id = window.setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
        // In case the promise resolves/rejects earlier, we do nothing here; race handles it.
        // We avoid clearing the timeout because we don't have a handle to the original promise lifecycle.
        void id;
      })
    ]);
  }

  private readonly moduleCurriculum: Record<
    string,
    {
      name: string;
      purpose: string;
      documents: Array<{ title: string; description: string; benefit: string }>;
    }
  > = {
    management: {
      name: 'Gerencia',
      purpose:
        'Fortalecer liderazgo y dirección estratégica para alinear decisiones con objetivos de largo plazo y guiar al resto de áreas.',
      documents: [
        {
          title: 'Desarrollo de liderazgo',
          description: 'Técnicas para guiar, motivar e inspirar equipos.',
          benefit: 'Eleva el compromiso y desempeño del personal.'
        },
        {
          title: 'Toma de decisiones estratégicas',
          description: 'Métodos y herramientas para tomar decisiones efectivas.',
          benefit: 'Alinea la operación con la visión de negocio.'
        },
        {
          title: 'Gestión del cambio',
          description: 'Cómo liderar procesos de transformación.',
          benefit: 'Reduce resistencia y mejora adaptabilidad.'
        },
        {
          title: 'Comunicación efectiva',
          description: 'Estrategias para comunicarse con claridad y empatía.',
          benefit: 'Mejora el clima laboral y reduce errores.'
        }
      ]
    },
    sales: {
      name: 'Ventas',
      purpose:
        'Mejorar atención y conversión para incrementar ingresos y fidelización, coordinando con Marketing, Logística y Atención al Cliente.',
      documents: [
        {
          title: 'Técnicas de negociación',
          description: 'Herramientas para lograr acuerdos ganadores.',
          benefit: 'Aumenta cierres de ventas sin sacrificar rentabilidad.'
        },
        {
          title: 'Manejo de objeciones',
          description: 'Cómo responder dudas y resistencias del cliente.',
          benefit: 'Mejora la experiencia y tasa de conversión.'
        },
        {
          title: 'Estrategias de cierre de ventas',
          description: 'Activación de urgencia, confianza y decisión.',
          benefit: 'Impulsa ventas rápidas y sostenibles.'
        },
        {
          title: 'Análisis de mercado',
          description: 'Identificación de tendencias y públicos clave.',
          benefit: 'Optimiza el portafolio de productos.'
        }
      ]
    },
    operations: {
      name: 'Operaciones',
      purpose:
        'Aumentar eficiencia interna y calidad de ejecución para una base sólida que habilite Logística, Ventas y Atención al Cliente.',
      documents: [
        {
          title: 'Gestión de procesos',
          description: 'Diseño y documentación de procesos estándar.',
          benefit: 'Facilita la supervisión y reducción de errores.'
        },
        {
          title: 'Mejora continua',
          description: 'Evaluación constante y corrección proactiva.',
          benefit: 'Incrementa la competitividad de la empresa.'
        },
        {
          title: 'Lean Manufacturing / Six Sigma',
          description: 'Reducción de desperdicios y fallas.',
          benefit: 'Mejora la rentabilidad y calidad.'
        }
      ]
    },
    marketing: {
      name: 'Marketing',
      purpose:
        'Potenciar visibilidad y posicionamiento digital generando conexión con el cliente y alimentando a Ventas con datos e insights.',
      documents: [
        {
          title: 'Marketing digital',
          description: 'Fundamentos de redes sociales, pauta y embudos.',
          benefit: 'Genera atracción y conversiones digitales.'
        },
        {
          title: 'Análisis de datos',
          description: 'Lectura de métricas y toma de decisiones.',
          benefit: 'Optimiza campañas y retorno de inversión.'
        },
        {
          title: 'Estrategias de contenido',
          description: 'Ideas creativas con propósito.',
          benefit: 'Aumenta el alcance y conexión emocional.'
        },
        {
          title: 'Branding',
          description: 'Coherencia visual y verbal de la marca.',
          benefit: 'Refuerza la identidad y confianza.'
        }
      ]
    },
    logistics: {
      name: 'Logística',
      purpose:
        'Asegurar disponibilidad, calidad y entrega a tiempo al menor costo posible, sosteniendo promesas de Ventas y Marketing.',
      documents: [
        {
          title: 'Gestión de inventarios',
          description: 'Control de stock, rotación y abastecimiento.',
          benefit: 'Evita pérdidas y mejora la disponibilidad.'
        },
        {
          title: 'Optimización de cadena de suministro',
          description: 'Coordinación eficiente de compras a entrega.',
          benefit: 'Mejora tiempos, costos y servicio.'
        },
        {
          title: 'Transporte eficiente',
          description: 'Planificación de rutas y entregas.',
          benefit: 'Garantiza el cumplimiento y satisfacción del cliente.'
        }
      ]
    },
    customer: {
      name: 'Atención al Cliente',
      purpose:
        'Elevar la experiencia y fortalecer la relación cliente-marca, retroalimentando Marketing y coordinando con Ventas y Logística.',
      documents: [
        {
          title: 'Comunicación asertiva',
          description: 'Uso adecuado del lenguaje verbal y no verbal.',
          benefit: 'Transmite confianza y profesionalismo.'
        },
        {
          title: 'Manejo de conflictos',
          description: 'Solución empática de reclamos.',
          benefit: 'Fideliza clientes insatisfechos.'
        },
        {
          title: 'Fidelización de clientes',
          description: 'Estrategias para retener y premiar clientes.',
          benefit: 'Aumenta recompra y lealtad.'
        },
        {
          title: 'Servicio al cliente excepcional',
          description: 'Excelencia y diferenciación en la atención.',
          benefit: 'Genera promotores de marca.'
        }
      ]
    },
    finance: {
      name: 'Contabilidad / Finanzas',
      purpose:
        'Brindar control financiero, cumplimiento legal y base para decisiones económicas (márgenes, presupuestos, costos y precios).',
      documents: [
        {
          title: 'Normas contables',
          description: 'Registro correcto bajo la ley colombiana.',
          benefit: 'Evita sanciones y errores contables.'
        },
        {
          title: 'Gestión financiera',
          description: 'Análisis de ingresos, egresos y utilidades.',
          benefit: 'Mejora rentabilidad y proyección.'
        },
        {
          title: 'Auditoría',
          description: 'Revisión sistemática de procesos contables.',
          benefit: 'Aumenta el control y transparencia.'
        },
        {
          title: 'Control de costos',
          description: 'Identificación y reducción de gastos.',
          benefit: 'Maximiza la utilidad y eficiencia.'
        }
      ]
    },
    talent: {
      name: 'Recursos Humanos (RRHH)',
      purpose:
        'Gestionar talento humano para productividad, estabilidad y cumplimiento normativo, impulsando bienestar y formación.',
      documents: [
        {
          title: 'Reclutamiento y selección',
          description: 'Captación y evaluación de candidatos.',
          benefit: 'Mejora la calidad del equipo humano.'
        },
        {
          title: 'Gestión del talento',
          description: 'Desarrollo y motivación del personal.',
          benefit: 'Retiene a los mejores colaboradores.'
        },
        {
          title: 'Bienestar laboral',
          description: 'Clima organizacional saludable y positivo.',
          benefit: 'Aumenta la productividad y compromiso.'
        },
        {
          title: 'Legislación laboral',
          description: 'Cumplimiento de normas y derechos laborales.',
          benefit: 'Minimiza riesgos legales y mejora la reputación.'
        }
      ]
    },
    technology: {
      name: 'Tecnología',
      purpose:
        'Seleccionar e implementar herramientas digitales para automatizar, medir y escalar (CRM, analítica, procesos, comunicación).',
      documents: [
        {
          title: 'Herramientas digitales para la gestión',
          description: 'Selecciona herramientas simples (CRM, tableros, automatizaciones) para controlar el negocio.',
          benefit: 'Reduce tareas manuales y mejora seguimiento.'
        },
        {
          title: 'Automatización y datos',
          description: 'Estandariza medición y automatiza reportes/alertas.',
          benefit: 'Acelera decisiones y mejora productividad.'
        },
        {
          title: 'Ciberseguridad básica',
          description: 'Buenas prácticas para cuentas, backups y accesos.',
          benefit: 'Reduce riesgos operativos y pérdidas de información.'
        }
      ]
    }
  };

  private buildModuleRoadmapItem(moduleId: string, priority: 'high' | 'medium' | 'low'): DiagnosticResult['scalabilityRoadmap'][number] {
    const meta = this.moduleCurriculum[moduleId];
    const moduleName = meta?.name || moduleId;

    const docs = (meta?.documents || []).slice(0, 6);
    const docsText =
      docs.length === 0
        ? 'Temas sugeridos: (pendiente de configurar)'
        : docs
            .map((d) => `- ${d.title}: ${d.description} (Beneficio: ${d.benefit})`)
            .join('\n');

    const purposeText = meta?.purpose ? `${meta.purpose}\n\n` : '';

    return {
      phase: `Módulo: ${moduleName}`,
      description: `${purposeText}${docsText}`,
      priority
    };
  }

  private buildFallbackDiagnostic(businessDescription: string, mainChallenge: string): DiagnosticResult {
    const text = `${businessDescription} ${mainChallenge}`.toLowerCase();

    const add = (set: Set<string>, id: string) => set.add(id);
    const modules = new Set<string>();

    add(modules, 'management');
    add(modules, 'technology');

    const has = (re: RegExp) => re.test(text);

    if (has(/venta|ventas|clientes|lead|leads|prospect|conversi|cierre/)) {
      add(modules, 'sales');
      add(modules, 'customer');
    }

    if (has(/marketing|redes|facebook|instagram|tiktok|publicidad|anuncio|anuncios|seo|contenido/)) {
      add(modules, 'marketing');
    }

    if (has(/proceso|procesos|operaci|inventario|tiempo|demora|demoras|manual|errores|calidad/)) {
      add(modules, 'operations');
    }

    if (has(/logisti|entrega|env[ií]o|envios|despach|inventario|proveedor|proveedores|bodega|almac[eé]n/)) {
      add(modules, 'logistics');
    }

    if (has(/costo|costos|margen|márgen|flujo de caja|caja|presupuesto|precio|precios|finanz/)) {
      add(modules, 'finance');
    }

    if (has(/equipo|emplead|talento|contrat|rotaci|cultura|capacit/)) {
      add(modules, 'talent');
    }

    const recommendedModules = Array.from(modules);

    const isSalesHeavy = has(/venta|ventas|clientes|lead|leads|prospect|conversi|cierre/);
    const isOpsHeavy = has(/proceso|procesos|operaci|inventario|tiempo|demora|demoras|manual|errores|calidad/);
    const isMarketingHeavy = has(/marketing|redes|seo|contenido|publicidad|anuncio|anuncios/);
    const isFinanceHeavy = has(/costo|costos|margen|márgen|flujo de caja|caja|presupuesto|precio|precios|finanz/);
    const isTalentHeavy = has(/equipo|emplead|talento|contrat|rotaci|cultura|capacit/);
    const isLogisticsHeavy = has(/logisti|entrega|env[ií]o|envios|despach|proveedor|proveedores|bodega|almac[eé]n/);

    const modulePriority = (moduleId: string): 'high' | 'medium' | 'low' => {
      if (moduleId === 'management') return 'high';
      if (moduleId === 'technology') return 'high';
      if (moduleId === 'sales') return isSalesHeavy ? 'high' : 'medium';
      if (moduleId === 'customer') return isSalesHeavy ? 'high' : 'medium';
      if (moduleId === 'marketing') return isMarketingHeavy ? 'high' : 'medium';
      if (moduleId === 'operations') return isOpsHeavy ? 'high' : 'medium';
      if (moduleId === 'finance') return isFinanceHeavy ? 'high' : 'medium';
      if (moduleId === 'talent') return isTalentHeavy ? 'high' : 'low';
      if (moduleId === 'logistics') return isLogisticsHeavy ? 'high' : 'low';
      return 'medium';
    };

    const preferredOrder = [
      'management',
      'sales',
      'marketing',
      'operations',
      'logistics',
      'customer',
      'finance',
      'talent',
      'technology'
    ];

    const orderedModules = preferredOrder.filter((m) => recommendedModules.includes(m));
    const remaining = recommendedModules.filter((m) => !orderedModules.includes(m));
    const finalModules = [...orderedModules, ...remaining];

    const scalabilityRoadmap: DiagnosticResult['scalabilityRoadmap'] = finalModules.map((moduleId) =>
      this.buildModuleRoadmapItem(moduleId, modulePriority(moduleId))
    );

    return {
      businessType: 'General',
      mainChallenge: mainChallenge,
      scalabilityRoadmap,
      recommendedModules
    };
  }

  async analyzeBusiness(businessDescription: string, mainChallenge: string): Promise<DiagnosticResult> {
    const prompt = `
      Como experto en transformación digital, analiza el siguiente negocio y genera un diagnóstico completo:
      
      Descripción del negocio: ${businessDescription}
      Principal desafío: ${mainChallenge}
      
      Genera una respuesta en formato JSON con las siguientes claves:
      - businessType: tipo de industria (ej: retail, servicios, tecnología, etc)
      - mainChallenge: categorización del desafío principal
      - scalabilityRoadmap: array de fases con phase, description, priority
      - recommendedModules: array de módulos recomendados de las 8 áreas (Gerencia, Ventas, Marketing, Operaciones, Finanzas, Tecnología, Talento, Cliente)
      
      Sé específico y práctico en tus recomendaciones.
    `;

    try {
      const result = await this.withTimeout(
        this.model.generateContent(prompt),
        20_000,
        'Tiempo de espera agotado al consultar la IA (20s).'
      );
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as DiagnosticResult;
      }
      
      throw new Error('No se pudo procesar la respuesta de la IA');
    } catch (error) {
      console.error('Error en Gemini API:', error);
      return this.buildFallbackDiagnostic(businessDescription, mainChallenge);
    }
  }

  async generateLessonContent(module: string, topic: string, businessContext: string): Promise<LessonContent> {
    // 🔥 PROMPT MEJORADO PARA CONTENIDO ULTRA PERSONALIZADO
    const enhancedPrompt = `
      ERES UN EXPERTO EMPRESARIAL DE NIVEL MUNDIAL en ${module} con 15+ años de experiencia transformando negocios como "${businessContext}".
      
      CONTEXTO ESPECÍFICO:
      - Tipo de negocio: ${businessContext}
      - Módulo: ${module}
      - Tema específico: ${topic}
      - Desafío del usuario: Integrar este conocimiento en su operación real
      
      OBJETIVO: Crear contenido que el usuario pueda APLICAR HOY MISMO y genere resultados en 7 días.
      
      GENERA UNA RESPUESTA JSON con esta estructura exacta:
      
      {
        "title": "Título potente y orientado a beneficios (ej: 'Multiplica tus ventas en 30 días con esto')",
        "summary": "Resumen ejecutivo que muestre valor inmediato (2-3 líneas máximas)",
        "keyPoints": [
          "Punto clave 1 - específico y accionable",
          "Punto clave 2 - medible y práctico", 
          "Punto clave 3 - resultado garantizado"
        ],
        "content": "Contenido completo y detallado (500-800 palabras) con estructura clara",
        "whatIs": "Definición ultra simple con analogía de la vida cotidiana (3-4 líneas)",
        "whyItMatters": "Impacto directo en dinero, tiempo o tranquilidad (3-4 líneas)",
        "howToApply": [
          "Paso 1: Acción específica con resultado medible",
          "Paso 2: Herramienta o técnica concreta",
          "Paso 3: Implementación práctica",
          "Paso 4: Medición y ajuste",
          "Paso 5: Escalable y repetible"
        ],
        "realWorldExample": {
          "company": "Empresa real o reconocible del sector ${module}",
          "situation": "Situación problemática específica y medible",
          "solution": "Aplicación exacta de lo enseñado",
          "result": "Resultado concreto con números (ej: '+45% ventas en 2 meses')"
        },
        "tools": [
          {
            "name": "Herramienta específica para ${topic}",
            "description": "Qué hace y para quién es ideal",
            "why": "Por qué es la mejor opción para este negocio",
            "link": "URL real si existe",
            "difficulty": "beginner",
            "price": "free"
          },
          {
            "name": "Herramienta intermedia para ${topic}",
            "description": "Opción más avanzada con más funciones",
            "why": "Ventajas sobre la versión básica",
            "link": "URL real si existe",
            "difficulty": "intermediate", 
            "price": "freemium"
          }
        ],
        "checklist": [
          {
            "item": "Acción crítica para implementar hoy",
            "priority": "critical",
            "timeframe": "Hoy"
          },
          {
            "item": "Seguimiento y medición",
            "priority": "important", 
            "timeframe": "Esta semana"
          },
          {
            "item": "Optimización y escalado",
            "priority": "optional",
            "timeframe": "Próximo mes"
          }
        ],
        "commonMistakes": [
          {
            "mistake": "Error específico y común en ${topic}",
            "consequence": "Pérdida concreta (tiempo, dinero, clientes)",
            "howToAvoid": "Solución preventiva clara y específica"
          }
        ],
        "kpis": [
          {
            "metric": "Métrica clave de éxito para ${topic}",
            "target": "Meta específica y medible",
            "howToMeasure": "Método simple de medición"
          }
        ],
        "nextSteps": [
          "Próximo nivel 1: Tema avanzado relacionado",
          "Próximo nivel 2: Integración con otras áreas"
        ]
      }
      
      ESTILO Y REQUISITOS:
      - LENGUAJE: Directo, motivador, sin rodeos, 100% enfocado en acción y resultados
      - PERSONALIZACIÓN: Adaptado 100% a "${businessContext}" 
      - EJEMPLOS: Usar casos reales de empresas similares
      - NÚMEROS: Incluir métricas concretas siempre que sea posible
      - ACCIONABILIDAD: Cada punto debe ser aplicable inmediatamente
      - LONGITUD: Contenido completo pero conciso (500-800 palabras máximo)
      
      IMPORTANTE: El usuario debe sentir "¡Esto puedo aplicar HOY y me va a beneficiar inmediatamente!"
    `;

    try {
      const result = await this.withTimeout(
        this.model.generateContent(enhancedPrompt),
        25_000, // 25 segundos para generación ultra personalizada
        '⏰ Generando contenido personalizado... (25s máximo)'
      );
      
      const response = await result.response;
      const text = response.text();
      
      // Extraer JSON de forma más robusta
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se pudo procesar la respuesta de la IA');
      }
      
      const parsed = JSON.parse(jsonMatch[0]) as LessonContent;
      
      console.log(`✅ Contenido generado para ${module} - ${topic}:`, parsed.title);
      return parsed;
      
    } catch (error) {
      console.error(`❌ Error generando contenido para ${module} - ${topic}:`, error);
      return this.buildEnhancedFallbackLesson(module, topic, businessContext);
    }
  }

  async generateQuizQuestions(module: string, businessContext: string, difficulty: 'basic' | 'intermediate' | 'advanced'): Promise<QuizQuestion[]> {
    const prompt = `
      Como EXPERTO EN EVALUACIÓN, genera 5 preguntas desafiantes pero justas para el módulo "${module}" con dificultad ${difficulty}.
      
      Contexto del negocio: ${businessContext}
      
      OBJETIVO: Evaluar comprensión real y aplicación práctica, no solo memorización.
      
      Genera una respuesta en formato JSON con un array de objetos, cada uno con:
      - question: pregunta que requiere análisis, no solo recuerdo
      - options: array de 4 opciones plausibles
      - correctAnswer: índice de la respuesta correcta (0-3)
      - explanation: explicación clara que enseñe por qué es correcta y por qué las otras no
      
      ESTILO: Preguntas que simulen situaciones reales del negocio del usuario.
    `;

    try {
      const result = await this.withTimeout(
        this.model.generateContent(prompt),
        20_000,
        'Tiempo de espera agotado al generar el quiz (20s).'
      );
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('No se pudo generar las preguntas de evaluación');
    } catch (error) {
      console.error('Error generando quiz:', error);
      return this.buildFallbackQuiz(module, difficulty);
    }
  }

  private buildEnhancedFallbackLesson(module: string, topic: string, businessContext: string): LessonContent {
    return {
      title: `${topic} - ${module}`,
      summary: `Lección fundamental sobre ${topic.toLowerCase()} para tu negocio.`,
      content: `Contenido básico sobre ${topic.toLowerCase()} aplicado a ${businessContext}.`,
      keyPoints: [`Concepto clave de ${topic}`, `Aplicación práctica`, `Beneficios inmediatos`],
      whatIs: `${topic} es una herramienta esencial para mejorar tu negocio.`,
      whyItMatters: `Aplicar ${topic.toLowerCase()} te ayudará a optimizar procesos y aumentar resultados.`,
      howToApply: [
        'Analiza tu situación actual',
        'Identifica oportunidades de mejora',
        'Aplica los conceptos básicos',
        'Mide los resultados',
        'Ajusta según sea necesario'
      ],
      realWorldExample: {
        company: 'Empresa Local Exitosa',
        situation: `Tenía problemas con ${topic.toLowerCase()}`,
        solution: `Implementó estas técnicas de ${topic.toLowerCase()}`,
        result: 'Mejoró eficiencia en 40% en 2 meses'
      },
      tools: [
        {
          name: 'Herramienta Básica',
          description: 'Herramienta fundamental para empezar',
          why: 'Es simple y efectiva',
          difficulty: 'beginner',
          price: 'free'
        }
      ],
      checklist: [
        {
          item: 'Revisa conceptos básicos',
          priority: 'critical',
          timeframe: '30 minutos'
        },
        {
          item: 'Aplica a tu caso',
          priority: 'important',
          timeframe: '1 hora'
        }
      ],
      commonMistakes: [
        {
          mistake: 'No entender los fundamentos',
          consequence: 'Aplicación incorrecta',
          howToAvoid: 'Estudia los conceptos básicos primero'
        }
      ],
      kpis: [
        {
          metric: 'Eficiencia',
          target: '+20% en 30 días',
          howToMeasure: 'Tiempo vs resultado'
        }
      ],
      nextSteps: ['Practicar con ejercicios', 'Aplicar en negocio real'],
      industryInsights: {
        'retail': {
          specificAdvice: 'Enfócate en inventario y atención al cliente',
          localExamples: ['Tiendas de barrio', 'Supermercados locales']
        }
      }
    };
  }

  private buildFallbackQuiz(module: string, difficulty: string): QuizQuestion[] {
    return [
      {
        question: `¿Cuál es el principal beneficio de aplicar ${module} en tu negocio?`,
        options: [
          'Aumentar eficiencia operativa',
          'Reducir costos innecesarios',
          'Mejorar la satisfacción del cliente',
          'Todas las anteriores'
        ],
        correctAnswer: 3,
        explanation: `${module} impacta múltiples áreas del negocio, generando beneficios integrales.`
      }
    ];
  }
}

export const geminiService = new GeminiService();
