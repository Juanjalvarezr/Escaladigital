import { supabase } from '../supabase';
import { LessonContent, QuizQuestion } from './gemini';

export interface RepositoryTopic {
  id: string;
  title: string;
  niche: string;
  areaId: string;
  summary: string;
  content: LessonContent;
  quizzes?: QuizQuestion[];
  timesGenerated: number;
  timesCompleted: number;
  ratingScore: number;
  createdAt: string;
  source: 'ai_generated' | 'curated_standard';
}

const LOCAL_REPO_KEY = 'escala:ai_knowledge_repo:v1';

/**
 * Obtener todos los temas guardados en la Librería Mayor de Conocimientos (Híbrido: LocalStorage + Supabase)
 */
export const getKnowledgeRepositoryTopics = async (
  nicheFilter?: string,
  areaFilter?: string
): Promise<RepositoryTopic[]> => {
  let localTopics: RepositoryTopic[] = [];
  try {
    const raw = window.localStorage.getItem(LOCAL_REPO_KEY);
    if (raw) localTopics = JSON.parse(raw);
  } catch (e) {
    console.warn('Error al leer librería local de conocimientos', e);
  }

  try {
    let query = supabase.from('ai_knowledge_repository').select('*').order('created_at', { ascending: false });

    if (nicheFilter && nicheFilter !== 'all') {
      query = query.ilike('niche', `%${nicheFilter}%`);
    }
    if (areaFilter && areaFilter !== 'all') {
      query = query.eq('area_id', areaFilter);
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      const remoteTopics: RepositoryTopic[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        niche: item.niche || 'General',
        areaId: item.area_id || 'management',
        summary: item.summary || '',
        content: item.content || {},
        quizzes: item.quizzes || [],
        timesGenerated: item.times_generated || 1,
        timesCompleted: item.times_completed || 0,
        ratingScore: item.rating_score || 4.9,
        createdAt: item.created_at,
        source: item.source || 'ai_generated'
      }));

      // Fusionar topics locales y remotos evitando duplicados
      const mergedMap = new Map<string, RepositoryTopic>();
      localTopics.forEach(t => mergedMap.set(t.id, t));
      remoteTopics.forEach(t => mergedMap.set(t.id, t));
      const result = Array.from(mergedMap.values());

      // Actualizar caché local
      try {
        window.localStorage.setItem(LOCAL_REPO_KEY, JSON.stringify(result));
      } catch (e) {
        // ignore storage limits
      }

      return result;
    }
  } catch (e) {
    console.warn('Operando en modo offline para la Librería de Conocimientos.', e);
  }

  // Filtrar localmente si no hubo respuesta de red
  return localTopics.filter(t => {
    const matchesNiche = !nicheFilter || nicheFilter === 'all' || t.niche.toLowerCase().includes(nicheFilter.toLowerCase());
    const matchesArea = !areaFilter || areaFilter === 'all' || t.areaId === areaFilter;
    return matchesNiche && matchesArea;
  });
};

/**
 * Publicar automáticamente un tema generado por IA en la Librería Mayor (Supabase + LocalStorage)
 */
export const publishToKnowledgeRepository = async (topic: {
  title: string;
  niche: string;
  areaId: string;
  summary: string;
  content: LessonContent;
  quizzes?: QuizQuestion[];
}): Promise<RepositoryTopic> => {
  const newTopic: RepositoryTopic = {
    id: `topic-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: topic.title,
    niche: topic.niche || 'General',
    areaId: topic.areaId || 'management',
    summary: topic.summary || topic.content.summary || '',
    content: topic.content,
    quizzes: topic.quizzes || [],
    timesGenerated: 1,
    timesCompleted: 0,
    ratingScore: 5.0,
    createdAt: new Date().toISOString(),
    source: 'ai_generated'
  };

  // 1. Guardado Inmediato Local (UX Ultra Rápida)
  try {
    const raw = window.localStorage.getItem(LOCAL_REPO_KEY);
    const existing: RepositoryTopic[] = raw ? JSON.parse(raw) : [];
    existing.unshift(newTopic);
    window.localStorage.setItem(LOCAL_REPO_KEY, JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.warn('Error al guardar localmente en librería de conocimientos', e);
  }

  // 2. Sincronización Automática en Segundo Plano a Supabase
  try {
    await supabase.from('ai_knowledge_repository').insert({
      id: newTopic.id,
      title: newTopic.title,
      niche: newTopic.niche,
      area_id: newTopic.areaId,
      summary: newTopic.summary,
      content: newTopic.content,
      quizzes: newTopic.quizzes,
      times_generated: 1,
      times_completed: 0,
      rating_score: 5.0,
      source: 'ai_generated',
      created_at: newTopic.createdAt
    });
  } catch (e) {
    console.warn('No se pudo guardar remotamente en Supabase (se mantiene local)', e);
  }

  return newTopic;
};
