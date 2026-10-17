export interface YouTubeResource {
  title: string;
  description: string;
  searchUrl: string;
  channelHint: string;
}

const resource = (
  title: string,
  description: string,
  query: string,
  channelHint: string
): YouTubeResource => ({
  title,
  description,
  searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
  channelHint
});

export const YOUTUBE_RESOURCES: Record<string, YouTubeResource[]> = {
  management: [
    resource('Liderazgo y visión', 'Cómo comunicar una visión que mueva al equipo.', 'liderazgo vision empresarial Simon Sinek español', 'Simon Sinek / contenido en español'),
    resource('Delegar para escalar', 'Principios prácticos para dejar de ser el cuello de botella.', 'delegar tareas emprendedor escalar negocio', 'Emprendimiento y gestión')
  ],
  sales: [
    resource('Prospección efectiva', 'Cómo encontrar clientes ideales sin depender de la suerte.', 'prospección ventas cliente ideal español', 'Ventas B2B'),
    resource('Manejo de objeciones', 'Estructura una conversación comercial orientada al problema.', 'manejo objeciones ventas método español', 'Ventas consultivas')
  ],
  marketing: [
    resource('Propuesta de valor', 'Explica con claridad por qué tu cliente debería elegirte.', 'propuesta de valor marketing canvas español', 'Marketing para emprendedores'),
    resource('Contenido que atrae', 'Ideas para crear contenido útil y generar demanda.', 'marketing de contenidos estrategia español', 'Marketing digital')
  ],
  operations: [
    resource('Documentar procesos', 'Convierte tareas repetibles en procesos fáciles de delegar.', 'documentar procesos negocio SOP español', 'Operaciones y productividad'),
    resource('Mejora continua', 'Detecta desperdicios y mejora una operación cada semana.', 'mejora continua kaizen pequeñas empresas español', 'Lean / Kaizen')
  ],
  finance: [
    resource('Flujo de caja', 'Diferencia utilidad, facturación y dinero disponible.', 'flujo de caja pequeños negocios español', 'Finanzas para emprendedores'),
    resource('Márgenes y precios', 'Calcula un precio que proteja la rentabilidad.', 'margen de ganancia fijar precios negocio español', 'Finanzas empresariales')
  ],
  technology: [
    resource('Automatización simple', 'Encuentra tareas repetitivas que puedes automatizar.', 'automatización procesos pequeñas empresas español', 'Productividad digital'),
    resource('Decisiones basadas en datos', 'Empieza a medir lo importante sin complicar tu operación.', 'indicadores KPI negocio dashboard español', 'Analítica para negocios')
  ],
  talent: [
    resource('Contratación por competencias', 'Define el perfil correcto antes de publicar una vacante.', 'contratación por competencias pequeñas empresas español', 'Recursos humanos'),
    resource('Cultura y feedback', 'Crea conversaciones que mejoren el desempeño del equipo.', 'feedback cultura organizacional equipos español', 'Liderazgo de equipos')
  ],
  customer: [
    resource('Experiencia del cliente', 'Diseña una experiencia consistente en cada punto de contacto.', 'experiencia del cliente customer journey español', 'Customer experience'),
    resource('Fidelización', 'Aumenta recompra y recomendaciones con acciones concretas.', 'fidelización clientes retención pequeñas empresas español', 'Servicio al cliente')
  ]
};

export const getYouTubeResources = (areaId: string): YouTubeResource[] =>
  YOUTUBE_RESOURCES[areaId] || YOUTUBE_RESOURCES.management;
