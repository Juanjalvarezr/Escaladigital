import React from 'react';
import { useAuth } from './SupabaseAuthProvider';

interface AreaModuleCardProps {
  phase: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  checklist?: Array<{ item: string; priority: string; timeframe: string }>;
  kpis?: Array<{ metric: string; target: string; howToMeasure: string }>;
  topics?: string[];
}

const priorityColors = {
  high: 'bg-red-500',
  medium: 'bg-yellow-400',
  low: 'bg-green-400',
};

const priorityLabels = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

const AreaModuleCard: React.FC<AreaModuleCardProps> = ({ phase, description, priority, checklist, kpis, topics }) => {
  const { user } = useAuth();
  const [checked, setChecked] = React.useState<boolean[]>(() => checklist ? checklist.map(() => false) : []);
  const [feedbackSent, setFeedbackSent] = React.useState(false);
  const handleCheck = (idx: number) => {
    setChecked(c => c.map((v, i) => i === idx ? !v : v));
  };
  const handleFeedback = async () => {
    // Guardar feedback en Supabase
    try {
      const { supabase } = await import('../supabase');
      // user is available from the hook at the top of the component
      const feedback = {
        module: phase,
        checked,
        user_id: user?.id || null,
      };
      const { error } = await supabase.from('module_feedback').insert([feedback]);
      if (!error) {
        setFeedbackSent(true);
      } else {
        setFeedbackSent(false);
      }
    } catch (e) {
      setFeedbackSent(false);
    }
  };
  const markCompleted = async () => {
    if (!user) return;
    try {
      const { supabase } = await import('../supabase');
      const moduleId = phase;
      const now = new Date().toISOString();
      await supabase.from('user_progress').upsert([
        {
          user_id: user.id,
          module_id: moduleId,
          status: 'completed',
          completion_percentage: 100,
          lessons_completed: topics || [],
          last_accessed: now,
          updated_at: now
        }
      ], { onConflict: 'user_id,module_id' });
    } catch (e) {
      // ignore
    }
  };
  return (
    <div className="bg-dark-secondary border border-gray-700 rounded-2xl shadow-lg shadow-black/20 p-6 flex flex-col mb-4 animate-fade-in">
      <div className="flex items-center mb-2">
        <span className={`w-4 h-4 rounded-full mr-3 ${priorityColors[priority]}`}></span>
        <h4 className="text-xl font-bold text-white">{phase}</h4>
        <span className="ml-auto px-3 py-1 text-sm rounded-full bg-electric-blue/10 text-electric-blue border border-electric-blue/30">Prioridad: {priorityLabels[priority]}</span>
      </div>
      <div className="mb-2 text-gray-300 whitespace-pre-line leading-relaxed">{description}</div>
      {topics && topics.length > 0 && (
        <div className="mt-3">
          <h5 className="text-electric-blue font-semibold mb-2">Temas (mini-cursos)</h5>
          <ol className="list-decimal list-inside text-gray-300 mb-2">
            {topics.map((t: string, i: number) => (
              <li key={i} className="mb-1">{t}</li>
            ))}
          </ol>
        </div>
      )}
      {checklist && checklist.length > 0 && (
        <div className="mt-4">
          <h5 className="text-electric-blue font-semibold mb-2">Checklist</h5>
          <ul>
            {checklist.map((c, idx) => (
              <li key={idx} className="flex items-center mb-1">
                <input type="checkbox" checked={checked[idx]} onChange={() => handleCheck(idx)} className="mr-2" />
                <span className="text-gray-300">{c.item}</span>
                <span className="ml-auto text-xs text-gray-400">{c.priority} | {c.timeframe}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {kpis && kpis.length > 0 && (
        <div className="mt-4">
          <h5 className="text-electric-blue font-semibold mb-2">KPIs</h5>
          <ul>
            {kpis.map((k, idx) => (
              <li key={idx} className="flex items-center mb-1">
                <span className="mr-2 text-green-600">📊</span>
                <span className="text-gray-300 font-medium">{k.metric}</span>
                <span className="ml-auto text-xs text-gray-400">Meta: {k.target}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        className={`mt-6 px-4 py-2.5 rounded-xl shadow text-white font-semibold ${feedbackSent ? 'bg-green-600' : 'bg-electric-blue hover:bg-blue-500'}`}
        onClick={handleFeedback}
        disabled={feedbackSent}
      >
        {feedbackSent ? '¡Retroalimentación enviada!' : 'Enviar retroalimentación'}
      </button>
      <button
        className="mt-3 px-4 py-2.5 rounded-xl shadow bg-violet text-white hover:bg-violet/90 font-semibold"
        onClick={markCompleted}
      >
        Marcar como completado
      </button>
    </div>
  );
};

export default AreaModuleCard;
