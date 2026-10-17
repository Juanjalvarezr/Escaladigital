import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLearningStore } from '../../stores/useLearningStore';

/* ────────────────────────────────────────────────────────────────────────── */
/*  TYPES                                                                      */
/* ────────────────────────────────────────────────────────────────────────── */
interface WorkshopConfig {
  title: string;
  emoji: string;
  accent: string;
  /** YouTube video ID */
  videoId: string;
  videoTitle: string;
  exercise: {
    prompt: string;
    placeholder: string;
    steps: string[];
  };
  template: {
    name: string;
    sections: { title: string; content: string }[];
  };
  resources: { label: string; url: string; icon: string }[];
}

interface MicroWorkshopViewProps {
  areaId: string;
  lessonId: string;
  onComplete: () => void;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  WORKSHOP DATA POR ÁREA                                                     */
/* ────────────────────────────────────────────────────────────────────────── */
const WORKSHOP_CONFIG: Record<string, WorkshopConfig> = {
  finance: {
    title: 'Taller: Construye tu Tablero de Flujo de Caja',
    emoji: '💰',
    accent: '#00c3ff',
    videoId: 'N_h7g5jtf0I',
    videoTitle: 'Flujo de Caja para Emprendedores — Explicado en 10 min',
    exercise: {
      prompt:
        '¿Cuál es la situación real de liquidez en tu negocio HOY? Escribe los ingresos esperados del mes y los pagos comprometidos, y calcula si hay superávit o déficit:',
      placeholder:
        'Ejemplo:\n- Ingresos esperados este mes: $5,200\n- Pagos comprometidos: $4,800\n- Saldo neto: +$400\n- Mi próximo riesgo de liquidez es...\n\nEscribe tu análisis real aquí...',
      steps: [
        'Abre la plantilla descargable (botón abajo)',
        'Llena la columna "Ingresos Esperados" con clientes/contratos actuales',
        'Llena "Egresos Comprometidos" (nómina, arriendo, proveedores, préstamos)',
        'Calcula el saldo neto semana a semana',
        'Escribe abajo qué semana tienes riesgo de quedarte sin caja',
      ],
    },
    template: {
      name: 'Tablero de Flujo de Caja — Escala Digital',
      sections: [
        {
          title: 'SEMANA 1 — Ingresos Esperados',
          content:
            'Cliente A: $____\nCliente B: $____\nOtros: $____\nTOTAL INGRESOS: $____',
        },
        {
          title: 'SEMANA 1 — Egresos Comprometidos',
          content:
            'Nómina: $____\nArriendo/alquiler: $____\nProveedores: $____\nOtros: $____\nTOTAL EGRESOS: $____',
        },
        {
          title: 'SALDO NETO SEMANAL',
          content:
            'Semana 1: $____\nSemana 2: $____\nSemana 3: $____\nSemana 4: $____\n\nALERTA ROJA si alguna semana es negativa → plan de contingencia inmediato.',
        },
        {
          title: 'ACCIONES SI HAY DÉFICIT',
          content:
            '1. Cobrar anticipos a clientes actuales\n2. Negociar plazo con proveedores\n3. Reducir un egreso no crítico\n4. Buscar financiamiento a corto plazo',
        },
      ],
    },
    resources: [
      {
        label: 'Google Sheets – Template flujo de caja',
        url: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/view',
        icon: '📊',
      },
      {
        label: 'Wave – Contabilidad gratis para pymes',
        url: 'https://www.waveapps.com/',
        icon: '🌊',
      },
      {
        label: 'Guía: ¿Cómo proyectar flujo de caja a 13 semanas?',
        url: 'https://www.entrepreneur.com/es/finanzas/que-es-el-flujo-de-caja/309042',
        icon: '📖',
      },
    ],
  },

  sales: {
    title: 'Taller: Sistema de Seguimiento y Cierre de Ventas',
    emoji: '🤝',
    accent: '#7c3aed',
    videoId: 'PEDc4-X2EKk',
    videoTitle: 'El Sistema de Ventas B2B que Duplica tu Tasa de Cierre',
    exercise: {
      prompt:
        '¿Cuántos prospectos tienes activos ahora mismo? Escribe tu pipeline real: qué etapa tienen, cuándo harás el próximo seguimiento y cuál es el próximo paso concreto con cada uno:',
      placeholder:
        'Prospecto 1 — [Empresa/Persona]: ______\nEtapa: Propuesta enviada | Cotizado\nNext step: Llamar el martes a las 10am\n\nProspecto 2 — ______\nEtapa: Primer contacto\nNext step: Enviar caso de éxito esta tarde\n\nEscribe tu pipeline real aquí...',
      steps: [
        'Descarga la plantilla de seguimiento de ventas',
        'Lista a todos los prospectos que tienes ahora, aunque sean 3',
        'Asigna a cada uno una "etapa" del embudo: Contacto / Propuesta / Negociación / Cerrado',
        'Define el "siguiente paso concreto" de cada uno (fecha + acción específica)',
        'Escribe tu análisis y compromisos abajo',
      ],
    },
    template: {
      name: 'Pipeline de Ventas — Escala Digital',
      sections: [
        {
          title: 'TABLA DE PROSPECTOS ACTIVOS',
          content:
            'Nombre | Empresa | Etapa | Valor estimado | Próxima acción | Fecha límite\n---|---|---|---|---|---\n[Cliente 1] | [Empresa] | Cotización enviada | $____ | Seguimiento call | DD/MM\n[Cliente 2] | [Empresa] | Primer contacto | $____ | Enviar propuesta | DD/MM',
        },
        {
          title: 'MÉTRICAS CLAVE DE MI EMBUDO',
          content:
            'Total prospectos: ____\nTasa de conversión actual: ____% \nTicket promedio: $____\nCiclo de venta promedio: ____ días',
        },
        {
          title: 'SCRIPT DE SEGUIMIENTO (3 preguntas clave)',
          content:
            '1. "¿Qué quedó pendiente desde nuestra última conversación?"\n2. "¿Qué necesitas para tomar una decisión esta semana?"\n3. "Si resolvemos [objeción], ¿podemos avanzar el [fecha]?"',
        },
        {
          title: 'MI META DE VENTAS ESTE MES',
          content:
            'Meta de ingresos: $____\nCierres necesarios: ____\nProspectos que debo contactar: ____\nActividades de prospección diarias: ____',
        },
      ],
    },
    resources: [
      {
        label: 'HubSpot CRM gratuito',
        url: 'https://www.hubspot.com/products/crm',
        icon: '🔧',
      },
      {
        label: 'Notion – Template CRM pyme',
        url: 'https://www.notion.so/templates/sales-crm',
        icon: '🗂️',
      },
      {
        label: 'Guía: Cómo estructurar un embudo de ventas B2B',
        url: 'https://blog.hubspot.es/sales/embudo-de-ventas',
        icon: '📖',
      },
    ],
  },

  marketing: {
    title: 'Taller: Posicionamiento y Propuesta de Valor Diferenciada',
    emoji: '📢',
    accent: '#10B981',
    videoId: '3MHjq3oIMi0',
    videoTitle: 'Cómo construir una propuesta de valor irresistible',
    exercise: {
      prompt:
        '¿Cuál es la razón principal por la que un cliente ideal debería comprarte a ti y no a tu competidor más cercano? Define tu mensaje central:',
      placeholder:
        '1. Mi cliente ideal es: [Perfil específico]\n2. Su problema más urgente es: [Dolor real]\n3. Mi solución única es: [Qué te hace diferente]\n4. El resultado cuantificable que prometemos es: [Beneficio claro]\n\nEscribe tu propuesta aquí...',
      steps: [
        'Identifica los 3 competidores más comunes con los que te comparan',
        'Detecta qué prometen todos que suena idéntico (el cliché del sector)',
        'Escribe en una frase cuál es tu ventaja injusta o especialidad real',
        'Valida que no uses palabras huecas como "calidad" o "buen servicio"',
      ],
    },
    template: {
      name: 'Matriz de Posicionamiento — Escala Digital',
      sections: [
        {
          title: 'DECLARACIÓN DE POSICIONAMIENTO',
          content:
            'Para [Cliente Ideal] que sufren de [Dolor Principal],\n[Tu Empresa] ofrece [Solución Específica]\nque a diferencia de [Competencia],\npermite [Resultado Medible].',
        },
        {
          title: 'CANALES Y MENSAJES PRIORITARIOS',
          content:
            'Canal 1: ___________ | Mensaje principal: ___________\nCanal 2: ___________ | Mensaje principal: ___________',
        },
      ],
    },
    resources: [
      {
        label: 'Google Analytics 4',
        url: 'https://analytics.google.com/',
        icon: '📊',
      },
      {
        label: 'Meta Business Suite',
        url: 'https://business.facebook.com/',
        icon: '📱',
      },
    ],
  },

  operations: {
    title: 'Taller: Mapeo de Proceso Clave y Eliminación de Desperdicio',
    emoji: '⚙️',
    accent: '#F59E0B',
    videoId: 'N_h7g5jtf0I',
    videoTitle: 'Optimización de Procesos y Cuellos de Botella',
    exercise: {
      prompt:
        'Elige el proceso que más tiempo te quita o más quejas genera. Desglosa los 5 pasos esenciales desde el pedido del cliente hasta la entrega final:',
      placeholder:
        'Paso 1: [Recepción y registro del pedido] → Responsable: ___\nPaso 2: [Preparación / Ejecución del servicio] → Responsable: ___\nPaso 3: [Revisión de control de calidad] → Responsable: ___\nPaso 4: [Entrega al cliente] → Responsable: ___\nPaso 5: [Facturación y cobro] → Responsable: ___\n\n¿Dónde está el cuello de botella actual?',
      steps: [
        'Escribe los pasos en orden cronológico real (no ideal)',
        'Marca con un círculo rojo el paso que siempre tarda más de lo previsto',
        'Define una regla o checklist simple para evitar repetir el error común',
      ],
    },
    template: {
      name: 'Ficha de Proceso Estándar (SOP) — Escala Digital',
      sections: [
        {
          title: 'NOMBRE DEL PROCESO',
          content: 'Nombre: ______________\nObjetivo: ______________\nResponsable principal: ______________',
        },
        {
          title: 'PASOS ESTÁNDAR Y CHECKLIST',
          content:
            '1. [ ] Paso inicial de validación\n2. [ ] Ejecución del trabajo según estándar\n3. [ ] Control de calidad previo a entrega\n4. [ ] Notificación y confirmación de recepción',
        },
      ],
    },
    resources: [
      {
        label: 'Trello – Tableros Kanban para operaciones',
        url: 'https://trello.com/',
        icon: '📋',
      },
      {
        label: 'Loom – Grabar procesos en video en 2 min',
        url: 'https://www.loom.com/',
        icon: '🎥',
      },
    ],
  },

  technology: {
    title: 'Taller: Auditoría de Herramientas y Automatización Simple',
    emoji: '💻',
    accent: '#3B82F6',
    videoId: 'PEDc4-X2EKk',
    videoTitle: 'Cómo automatizar tu negocio sin saber programar',
    exercise: {
      prompt:
        'Lista las herramientas de software que pagas actualmente en tu empresa. ¿Cuáles se usan realmente y qué tarea manual repetitiva consume más de 3 horas por semana?',
      placeholder:
        'Herramientas activas: [Excel, WhatsApp, CRM, Software contable...]\nTarea repetitiva candidata a automatizar: [Copiar datos de ventas a contabilidad / Enviar correos de bienvenida...]\nHerramienta sugerida para conectar: [Make / Zapier / Formularios automáticos]',
      steps: [
        'Cancela de inmediato suscripciones de software que nadie haya usado en 60 días',
        'Identifica un traspaso manual de datos entre dos programas',
        'Plantea una integración sencilla para que los datos fluyan solos',
      ],
    },
    template: {
      name: 'Mapa Tecnológico y Automatización — Escala Digital',
      sections: [
        {
          title: 'INVENTARIO DE HERRAMIENTAS',
          content:
            'Software | Costo Mensual | Nivel de Uso (Alto/Medio/Bajo) | Decisión\n---|---|---|---\nHerramienta 1 | $____ | Alto | Mantener\nHerramienta 2 | $____ | Bajo | Cancelar',
        },
        {
          title: 'PRIMERA AUTOMATIZACIÓN A IMPLEMENTAR',
          content:
            'Disparador (Trigger): Cuando ocurra [X] en [App A]...\nAcción (Action): Crear o actualizar [Y] en [App B] automáticamente.',
        },
      ],
    },
    resources: [
      {
        label: 'Make (Integromat) – Automatizaciones',
        url: 'https://www.make.com/',
        icon: '⚡',
      },
      {
        label: 'Zapier – Conecta tus aplicaciones',
        url: 'https://zapier.com/',
        icon: '🔗',
      },
    ],
  },

  talent: {
    title: 'Taller: Scorecard de Puesto y Alineación de Equipo',
    emoji: '👥',
    accent: '#8B5CF6',
    videoId: '3MHjq3oIMi0',
    videoTitle: 'Cómo contratar y liderar talento sobresaliente',
    exercise: {
      prompt:
        'Diseña el Scorecard de tu próxima contratación o de tu rol más crítico actual. ¿Cuáles son los 3 resultados numéricos indispensables que debe entregar?',
      placeholder:
        'Rol analizado: [Ej. Ejecutivo de Ventas / Encargado de Operaciones]\nMisión del puesto: [Por qué existe este rol en una frase]\nResultado esperado 1: [Métrica concreta]\nResultado esperado 2: [Métrica concreta]\nResultado esperado 3: [Métrica concreta]',
      steps: [
        'Deja de hacer descripciones de tareas vagas ("ser puntual, ser proactivo")',
        'Define el éxito con números medibles al final del mes',
        'Agenda una sesión 1-on-1 para alinear expectativas',
      ],
    },
    template: {
      name: 'Scorecard de Puesto — Escala Digital',
      sections: [
        {
          title: 'MISIÓN DEL ROL',
          content: 'El rol de [Puesto] existe para lograr [Resultado Clave] sin generar cuellos de botella.',
        },
        {
          title: 'LOS 3 RESULTADOS CLAVE DEL TRIMESTRE',
          content:
            '1. [Métrica 1]: De ____ a ____ antes de [Fecha]\n2. [Métrica 2]: Mantener [Indicador] por encima de ____%\n3. [Métrica 3]: Reducir [Fricción] a menos de ____ horas',
        },
      ],
    },
    resources: [
      {
        label: 'Guía de preguntas de entrevista estructurada',
        url: 'https://www.shrm.org/',
        icon: '🎯',
      },
    ],
  },

  customer: {
    title: 'Taller: Sistema de Onboarding y Retención de Clientes',
    emoji: '🎯',
    accent: '#10B981',
    videoId: 'PEDc4-X2EKk',
    videoTitle: 'Experiencia de Cliente: Retención y Fans Incondicionales',
    exercise: {
      prompt:
        'Diseña los primeros 7 días de la experiencia de un cliente nuevo. ¿Cómo garantizas que sienta que tomó la mejor decisión de compra en las primeras 48 horas?',
      placeholder:
        'Hora 0: [Mensaje de bienvenida personalizado e instrucciones de acceso]\nDía 1: [Llamada de inicio o primer entregable]\nDía 3: [Primer resultado rápido (Aha! Moment)]\nDía 7: [Encuesta breve de 1 pregunta: ¿cómo calificarías tu primera semana?]',
      steps: [
        'Reduce el tiempo entre el pago y el primer momento de valor',
        'Elimina cualquier término confuso o contrato innecesariamente largo',
        'Pide retroalimentación proactivamente antes de que surja una queja',
      ],
    },
    template: {
      name: 'Protocolo de Onboarding y Fidelización — Escala Digital',
      sections: [
        {
          title: 'CHECKLIST PRIMERAS 48 HORAS',
          content:
            '[ ] Confirmación inmediata con resumen de siguientes pasos\n[ ] Acceso guiado a la solución\n[ ] Asignación de canal de comunicación rápido\n[ ] Contacto humano de bienvenida',
        },
        {
          title: 'MOMENTO DE SOLICITUD DE RECOMENDACIÓN',
          content:
            'Cuando el cliente exprese satisfacción o complete su hito número 1:\n"Nos alegra mucho que hayas logrado [Resultado]. ¿Conoces a alguien más en tu sector que se beneficiaría de esto?"',
        },
      ],
    },
    resources: [
      {
        label: 'Typeform – Encuestas de satisfacción elegantes',
        url: 'https://www.typeform.com/',
        icon: '📝',
      },
    ],
  },

  default: {
    title: 'Taller: Plan de Acción Estratégico',
    emoji: '🚀',
    accent: '#10b981',
    videoId: '3MHjq3oIMi0',
    videoTitle: 'Cómo construir un equipo de alto rendimiento',
    exercise: {
      prompt:
        '¿Cuáles son las 3 prioridades más críticas de tu empresa para los próximos 30 días? Escribe qué resultado esperas de cada una y quién es responsable:',
      placeholder:
        'Prioridad 1: [Qué lograremos] → Responsable: [Nombre] → Fecha límite: DD/MM\n\nPrioridad 2: [Qué lograremos] → Responsable: [Nombre] → Fecha límite: DD/MM\n\nPrioridad 3: [Qué lograremos] → Responsable: [Nombre] → Fecha límite: DD/MM\n\nEscribe tu plan real aquí...',
      steps: [
        'Descarga la plantilla de plan de acción',
        'Define las 3 prioridades del mes (no más, no menos)',
        'Asigna un responsable claro a cada una',
        'Establece una fecha límite y un indicador de éxito medible',
        'Escribe tu plan abajo y comparte un resumen con tu equipo',
      ],
    },
    template: {
      name: 'Plan de Acción 30 Días — Escala Digital',
      sections: [
        {
          title: 'LAS 3 PRIORIDADES DEL MES',
          content:
            '1. _______________________ | Responsable: ____ | Fecha: __/__ | KPI: ____\n2. _______________________ | Responsable: ____ | Fecha: __/__ | KPI: ____\n3. _______________________ | Responsable: ____ | Fecha: __/__ | KPI: ____',
        },
        {
          title: 'TAREA QUE DEBO ELIMINAR/DELEGAR',
          content:
            'Tarea 1: ______________ → Delego a: ______________\nTarea 2: ______________ → Elimino porque: ______________',
        },
        {
          title: 'REVISIÓN SEMANAL (cada lunes 30 min)',
          content:
            '¿Avanzamos en la Prioridad 1? Sí / No → Por qué: ____\n¿Avanzamos en la Prioridad 2? Sí / No → Por qué: ____\n¿Avanzamos en la Prioridad 3? Sí / No → Por qué: ____',
        },
        {
          title: 'RESULTADO ESPERADO AL DÍA 30',
          content:
            'Si lo logramos, nuestro negocio tendrá: ______________________\nEl mayor riesgo que debemos evitar es: ______________________',
        },
      ],
    },
    resources: [
      {
        label: 'Notion – Template OKRs gratis',
        url: 'https://www.notion.so/templates/okr-planner',
        icon: '🗂️',
      },
      {
        label: 'Asana – Gestión de proyectos gratuito',
        url: 'https://asana.com/',
        icon: '✅',
      },
      {
        label: 'Libro: Traction — El sistema EOS para pymes',
        url: 'https://www.amazon.com/Traction-Get-Grip-Business-Spanish/dp/194985330X',
        icon: '📚',
      },
    ],
  },
};

/* ────────────────────────────────────────────────────────────────────────── */
/*  HELPER — Genera HTML de plantilla para imprimir                           */
/* ────────────────────────────────────────────────────────────────────────── */
function generateTemplateHTML(cfg: WorkshopConfig): string {
  const rows = cfg.template.sections
    .map(
      (s) => `
    <div class="section">
      <h3>${s.title}</h3>
      <pre>${s.content}</pre>
    </div>
  `
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <title>${cfg.template.name}</title>
  <style>
    body { font-family: 'Segoe UI', sans-serif; margin: 40px; color: #111; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .subtitle { font-size: 12px; color: #666; margin-bottom: 32px; }
    .section { border: 1px solid #ddd; border-radius: 10px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
    h3 { font-size: 14px; font-weight: 700; text-transform: uppercase; color: #4f46e5; margin: 0 0 12px; }
    pre { font-size: 13px; white-space: pre-wrap; color: #333; font-family: inherit; margin: 0; line-height: 1.8; }
    .footer { font-size: 11px; color: #999; text-align: center; margin-top: 40px; }
  </style>
</head>
<body>
  <h1>${cfg.emoji} ${cfg.template.name}</h1>
  <div class="subtitle">Generado por Escala Digital — Tu plataforma de formación empresarial</div>
  ${rows}
  <div class="footer">Escala Digital · escalad.co · Úsala, complétala y escala tu negocio hoy.</div>
</body>
</html>`;
}

/* ────────────────────────────────────────────────────────────────────────── */
/*  COMPONENT                                                                  */
/* ────────────────────────────────────────────────────────────────────────── */
export const MicroWorkshopView: React.FC<MicroWorkshopViewProps> = ({
  areaId,
  lessonId,
  onComplete,
}) => {
  const { addXp } = useLearningStore();
  const cfg = WORKSHOP_CONFIG[areaId] || WORKSHOP_CONFIG['default'];

  const [tab, setTab] = useState<'guide' | 'video' | 'exercise' | 'resources'>('guide');
  const [exerciseText, setExerciseText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Restore saved exercise from localStorage
  const storageKey = `workshop-${lessonId}`;
  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setExerciseText(saved);
      setWordCount(saved.trim().split(/\s+/).filter(Boolean).length);
    }
  }, [storageKey]);

  const handleExerciseChange = (v: string) => {
    setExerciseText(v);
    setWordCount(v.trim().split(/\s+/).filter(Boolean).length);
    localStorage.setItem(storageKey, v);
  };

  const handleDownloadTemplate = () => {
    const html = generateTemplateHTML(cfg);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cfg.template.name.replace(/\s+/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    addXp(10, 'Plantilla del taller descargada');
  };

  const handlePrintTemplate = () => {
    const html = generateTemplateHTML(cfg);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      win.print();
    }
    addXp(10, 'Plantilla impresa');
  };

  const handleSubmitExercise = () => {
    if (wordCount < 15) return;
    setSubmitted(true);
    addXp(80, 'Ejercicio del MicroTaller completado');
    localStorage.setItem(`${storageKey}-done`, 'true');
    setTimeout(() => {
      onComplete();
    }, 2800);
  };

  const alreadyDone = localStorage.getItem(`${storageKey}-done`) === 'true';

  const TABS = [
    { id: 'guide' as const, label: 'Guía Paso a Paso', icon: '📋' },
    { id: 'video' as const, label: 'Video del Taller', icon: '▶️' },
    { id: 'exercise' as const, label: 'Tu Ejercicio Real', icon: '✏️' },
    { id: 'resources' as const, label: 'Recursos', icon: '📚' },
  ];

  return (
    <div className="bg-dark-secondary border border-gray-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="p-6 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${cfg.accent}18, transparent)` }}
      >
        <div
          className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none"
          style={{ background: `${cfg.accent}20` }}
        />
        <div className="relative z-10 flex items-start justify-between">
          <div>
            <span
              className="inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border mb-3"
              style={{ color: cfg.accent, borderColor: `${cfg.accent}40`, background: `${cfg.accent}10` }}
            >
              <span>🛠️</span>
              <span>MicroTaller Práctico</span>
            </span>
            <h2 className="text-xl font-black text-white">{cfg.title}</h2>
            <p className="text-xs text-gray-400 mt-1">
              Aplica lo aprendido con plantillas reales y ejercicios de tu negocio
            </p>
          </div>
          {alreadyDone && (
            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20 flex-shrink-0">
              ✓ Completado
            </span>
          )}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mt-5 overflow-x-auto hide-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                tab === t.id
                  ? 'bg-dark-bg text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* ── GUIDE TAB ── */}
          {tab === 'guide' && (
            <motion.div
              key="guide"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
            >
              <p className="text-sm text-gray-300 leading-relaxed">
                Sigue este proceso probado paso a paso para transformar el conocimiento en acción real en tu negocio:
              </p>
              <ol className="space-y-3">
                {cfg.exercise.steps.map((step, i) => (
                  <li
                    key={i}
                    className="flex items-start space-x-3 p-3 bg-dark-tertiary/50 rounded-xl border border-gray-700/60"
                  >
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                      style={{ background: cfg.accent }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-200">{step}</span>
                  </li>
                ))}
              </ol>

              {/* Download / print template buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDownloadTemplate}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold text-white border transition-all"
                  style={{ borderColor: `${cfg.accent}60`, background: `${cfg.accent}18` }}
                >
                  <span>⬇️</span>
                  <span>Descargar Plantilla</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePrintTemplate}
                  className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-sm font-bold text-gray-300 border border-gray-700 hover:border-gray-500 hover:text-white transition-all"
                >
                  <span>🖨️</span>
                  <span>Imprimir / PDF</span>
                </motion.button>
              </div>

              <button
                onClick={() => setTab('exercise')}
                className="w-full py-3 bg-gradient-to-r from-dark-bg to-dark-tertiary border border-gray-700 hover:border-gray-500 text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2"
              >
                <span>Ir a tu Ejercicio Real</span>
                <span>✏️</span>
              </button>
            </motion.div>
          )}

          {/* ── VIDEO TAB ── */}
          {tab === 'video' && (
            <motion.div
              key="video"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-4"
            >
              <p className="text-xs text-gray-400">{cfg.videoTitle}</p>
              <div className="relative w-full rounded-2xl overflow-hidden border border-gray-700 shadow-xl" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${cfg.videoId}?rel=0&modestbranding=1`}
                  title={cfg.videoTitle}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="text-xs text-gray-500">
                💡 Mira el video y luego ve a "Tu Ejercicio Real" para aplicar lo que aprendiste.
              </p>
              <button
                onClick={() => setTab('exercise')}
                className="w-full py-3 text-sm font-bold text-white rounded-xl transition-all flex items-center justify-center space-x-2"
                style={{ background: `linear-gradient(90deg, ${cfg.accent}, ${cfg.accent}99)` }}
              >
                <span>Ahora: Completar el Ejercicio</span>
                <span>→</span>
              </button>
            </motion.div>
          )}

          {/* ── EXERCISE TAB ── */}
          {tab === 'exercise' && (
            <motion.div
              key="exercise"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-5"
            >
              <div className="p-4 rounded-xl border border-gray-700 bg-dark-tertiary/50">
                <p className="text-sm text-gray-200 leading-relaxed font-medium">
                  {cfg.exercise.prompt}
                </p>
              </div>

              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={exerciseText}
                  onChange={(e) => handleExerciseChange(e.target.value)}
                  placeholder={cfg.exercise.placeholder}
                  rows={10}
                  disabled={submitted || alreadyDone}
                  className="w-full bg-dark-bg border border-gray-700 focus:border-gray-500 text-gray-200 placeholder-gray-600 text-sm rounded-xl p-4 resize-none focus:outline-none focus:ring-1 focus:ring-gray-500 transition-all leading-relaxed font-mono"
                />
                <div className="absolute bottom-3 right-3 text-xs text-gray-600">
                  {wordCount} palabras {wordCount >= 15 ? '✓' : `(mín. 15)`}
                </div>
              </div>

              {!submitted && !alreadyDone ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSubmitExercise}
                  disabled={wordCount < 15}
                  className="w-full py-3.5 text-white font-black rounded-xl text-sm transition-all flex items-center justify-center space-x-2 shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background:
                      wordCount >= 15
                        ? `linear-gradient(135deg, ${cfg.accent}, #10b981)`
                        : '#374151',
                  }}
                >
                  <span>Guardar mi Ejercicio y Completar Taller (+80 XP)</span>
                  <span>🎯</span>
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center"
                >
                  <div className="text-2xl mb-1">🏆</div>
                  <p className="text-emerald-400 font-bold text-sm">
                    ¡Ejercicio guardado! +80 XP
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Tu análisis queda guardado. Puedes volver a consultarlo en cualquier momento.
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── RESOURCES TAB ── */}
          {tab === 'resources' && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              <p className="text-xs text-gray-400">
                Herramientas y guías curadas para que apliques lo aprendido hoy:
              </p>
              {cfg.resources.map((r, i) => (
                <motion.a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ x: 4 }}
                  className="flex items-center space-x-3 p-4 bg-dark-tertiary/40 hover:bg-dark-tertiary border border-gray-700 hover:border-gray-500 rounded-xl text-sm text-gray-200 hover:text-white transition-all group"
                >
                  <span className="text-xl flex-shrink-0">{r.icon}</span>
                  <span className="flex-1 font-medium">{r.label}</span>
                  <span className="text-gray-500 group-hover:text-gray-300 transition-colors">↗</span>
                </motion.a>
              ))}

              <div className="pt-2">
                <button
                  onClick={() => setTab('exercise')}
                  className="w-full py-3 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-bold rounded-xl text-sm transition-all flex items-center justify-center space-x-2"
                >
                  <span>✏️</span>
                  <span>Ir a completar mi Ejercicio</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MicroWorkshopView;
