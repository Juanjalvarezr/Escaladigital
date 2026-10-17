import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { getKnowledgeRepositoryTopics, RepositoryTopic } from '../services/knowledgeRepository';

type Summary = {
  company_count: number;
  user_count: number;
  active_company_count: number;
  event_count_30d: number;
};

type CompanyInsight = {
  company_id: string;
  company_name: string;
  plan_key: string;
  seat_limit: number;
  subscription_status: string;
  member_count: number;
  pending_invitations: number;
  active_members_30d: number;
  progress_percent: number;
  completed_lessons: number;
  completed_actions: number;
  last_activity: string | null;
};

type Activity = {
  action: string;
  company_id: string;
  actor_user_id: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
};

type ContentMetrics = {
  modules_count: number;
  lessons_count: number;
  quizzes_count: number;
  processes_count: number;
  actions_completed_count: number;
  diagnostics_count: number;
};

type TabType = 'analytics' | 'repository' | 'impact' | 'companies';

const PlatformAdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [companies, setCompanies] = useState<CompanyInsight[]>([]);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [content, setContent] = useState<ContentMetrics | null>(null);
  const [topics, setTopics] = useState<RepositoryTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<RepositoryTopic | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiche, setSelectedNiche] = useState('all');
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteMessage, setInviteMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const safeRpc = async (rpcName: string) => {
          try {
            return await supabase.rpc(rpcName as any);
          } catch {
            return { data: null, error: true };
          }
        };

        const [sumRes, compRes, actRes, contRes, repoTopics] = await Promise.all([
          safeRpc('get_platform_summary'),
          safeRpc('get_platform_companies'),
          safeRpc('get_platform_activity'),
          safeRpc('get_platform_content_metrics'),
          getKnowledgeRepositoryTopics()
        ]);


        if (!mounted) return;

        if (sumRes.data?.[0]) {
          setSummary(sumRes.data[0] as Summary);
        } else {
          setSummary(null);
          if (sumRes.error) setError('No se pudieron cargar las métricas reales. Revisa que las migraciones administrativas estén aplicadas.');
        }

        if (compRes.data) setCompanies(compRes.data as CompanyInsight[]);
        if (actRes.data) setActivity(actRes.data as Activity[]);
        if (contRes.data?.[0]) setContent(contRes.data[0] as ContentMetrics);

        setTopics(repoTopics);
      } catch (loadError) {
        if (mounted) setError(loadError instanceof Error ? loadError.message : 'No se pudo cargar el panel.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void loadData();
    return () => { mounted = false; };
  }, []);

  const createCompanyLeadLink = async (event: React.FormEvent) => {
    event.preventDefault();
    setInviteMessage('Para invitar a una empresa, comparte el enlace de registro y registra el correo del responsable. La empresa se crea al completar el primer diagnóstico.');
    setInviteEmail('');
  };

  const filteredTopics = topics.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.niche.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesNiche = selectedNiche === 'all' || t.niche.toLowerCase() === selectedNiche.toLowerCase();
    return matchesSearch && matchesNiche;
  });

  const uniqueNiches = Array.from(new Set(topics.map(t => t.niche))).filter(Boolean);

  return (
    <main className="min-h-screen bg-dark-bg p-4 sm:p-6 text-white font-sans">
      <div className="mx-auto max-w-7xl">
        
        {/* Encabezado Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-electric-blue via-violet to-pink-500">
                Panel de Control Maestro
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet/20 text-violet-300 border border-violet/30">
                Admin Enterprise
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-400">
              Gestión centralizada de retención, librería de conocimientos IA, analítica de quizzes y empresas.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/dashboard"
              className="px-3.5 py-2 bg-dark-secondary hover:bg-gray-800 border border-gray-700 rounded-lg text-xs font-semibold text-gray-200 transition-all flex items-center gap-1.5"
            >
              👁️ Ver Dashboard Usuario
            </a>
            <a
              href="/academia-procesos"
              className="px-3.5 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 rounded-lg text-xs font-semibold text-violet-300 transition-all flex items-center gap-1.5"
            >
              🎓 Academia Procesos
            </a>
          </div>
        </div>


        {/* Pestañas Navegables */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 border-b border-gray-800">
          {[
            { id: 'analytics', label: '📊 Muestreo & Retención', badge: summary?.user_count ? `${summary.user_count} Usuarios` : undefined },
            { id: 'repository', label: '🧠 Librería Mayor de IA', badge: `${topics.length} Temas` },
            { id: 'impact', label: '📈 Métricas & Quizzes', badge: content?.quizzes_count ? `${content.quizzes_count} Evaluaciones` : undefined },
            { id: 'companies', label: '🏢 Empresas & Equipos', badge: summary?.company_count ? `${summary.company_count} Empresas` : undefined }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-electric-blue to-violet text-white shadow-lg shadow-electric-blue/20'
                  : 'bg-dark-secondary text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-2 py-0.5 rounded-full text-xs bg-black/30 text-white/80 font-mono">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading && (
          <div className="mt-12 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-electric-blue mx-auto mb-3"></div>
            <p className="text-gray-400 text-sm">Cargando métricas de la plataforma...</p>
          </div>
        )}

        {error && (
          <p role="alert" className="mt-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-red-300 text-sm">
            {error}
          </p>
        )}

        {!loading && (
          <div className="mt-6">

            {/* PESTAÑA 1: MUESTREO & RETENCIÓN DE USUARIOS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { title: 'Usuarios registrados', value: summary?.user_count ?? '—', detail: 'Total en Supabase', icon: '👤', color: 'from-blue-500/20 to-indigo-500/10' },
                    { title: 'Empresas', value: summary?.company_count ?? '—', detail: 'Total en Supabase', icon: '🏢', color: 'from-amber-500/20 to-orange-500/10' },
                    { title: 'Empresas activas', value: summary?.active_company_count ?? '—', detail: 'Planes activos o en prueba', icon: '⚡', color: 'from-emerald-500/20 to-teal-500/10' },
                    { title: 'Eventos de aprendizaje', value: summary?.event_count_30d ?? '—', detail: 'Últimos 30 días', icon: '📈', color: 'from-cyan-500/20 to-blue-500/10' }
                  ].map((card, i) => (
                    <div key={i} className={`rounded-xl border border-gray-800 bg-gradient-to-br ${card.color} p-5 relative overflow-hidden`}>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{card.icon}</span>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/40 text-gray-300">
                          Supabase
                        </span>
                      </div>
                      <p className="text-3xl font-extrabold mt-3 text-white">{card.value}</p>
                      <p className="text-xs text-gray-400 mt-1 font-medium">{card.title}</p>
                    </div>
                  ))}
                </div>

                {/* El desglose por área no está disponible hasta instrumentar la métrica en Supabase. */}
                <div className="rounded-xl border border-gray-800 bg-dark-secondary p-6">
                  <h3 className="text-lg font-bold text-white mb-2">Progreso Global por Áreas de Negocio</h3>
                  <p className="text-sm text-gray-400">Esta métrica todavía no está conectada a una consulta agregada de progreso por área. No se muestran datos de ejemplo.</p>
                </div>
              </div>
            )}

            {/* PESTAÑA 2: LIBRERÍA MAYOR DE CONOCIMIENTOS IA */}
            {activeTab === 'repository' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center bg-dark-secondary p-4 rounded-xl border border-gray-800">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Buscar por tema, sector o palabra clave..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-dark-bg border border-gray-700 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-electric-blue"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedNiche}
                      onChange={e => setSelectedNiche(e.target.value)}
                      className="bg-dark-bg border border-gray-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none"
                    >
                      <option value="all">Todos los Sectores ({topics.length})</option>
                      {uniqueNiches.map(niche => (
                        <option key={niche} value={niche}>{niche}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTopics.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-dark-secondary rounded-xl border border-gray-800">
                      <p className="text-gray-400">No se encontraron temas con los filtros aplicados.</p>
                      <p className="text-xs text-gray-500 mt-1">Los temas generados automáticamente por la IA al diagnosticar usuarios aparecerán aquí.</p>
                    </div>
                  ) : (
                    filteredTopics.map(t => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTopic(t)}
                        className="bg-dark-secondary border border-gray-800 hover:border-violet/50 rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-violet/5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-3">
                            <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-violet-500/10 text-violet-300 border border-violet-500/20">
                              {t.niche}
                            </span>
                            <span className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                              ★ {t.ratingScore}
                            </span>
                          </div>
                          <h4 className="font-bold text-white text-base leading-snug hover:text-electric-blue transition-colors">
                            {t.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-2 line-clamp-3 leading-relaxed">
                            {t.summary}
                          </p>
                        </div>

                        <div className="mt-5 pt-3 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
                          <span>Área: <strong className="text-gray-300 capitalize">{t.areaId}</strong></span>
                          <span className="text-electric-blue font-semibold">Ver detalle →</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* MODAL DETALLE DE TEMA EN LIBRERÍA */}
                {selectedTopic && (
                  <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-dark-secondary border border-gray-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
                      <button
                        onClick={() => setSelectedTopic(null)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg font-bold w-8 h-8 rounded-full bg-dark-bg flex items-center justify-center"
                      >
                        ✕
                      </button>

                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet/20 text-violet-300">
                          {selectedTopic.niche}
                        </span>
                        <span className="text-xs text-gray-400">Área: {selectedTopic.areaId}</span>
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-3">{selectedTopic.title}</h3>
                      <p className="text-sm text-gray-300 bg-dark-bg p-4 rounded-xl border border-gray-800 mb-6 italic">
                        "{selectedTopic.summary}"
                      </p>

                      {selectedTopic.content.whatIs && (
                        <div className="mb-4">
                          <h4 className="text-sm font-bold text-electric-blue mb-1">¿Qué es?</h4>
                          <p className="text-xs text-gray-300">{selectedTopic.content.whatIs}</p>
                        </div>
                      )}

                      {selectedTopic.content.whyItMatters && (
                        <div className="mb-4">
                          <h4 className="text-sm font-bold text-emerald-400 mb-1">¿Por qué importa?</h4>
                          <p className="text-xs text-gray-300">{selectedTopic.content.whyItMatters}</p>
                        </div>
                      )}

                      {selectedTopic.content.realWorldExample && (
                        <div className="bg-violet-950/30 border border-violet-800/40 p-4 rounded-xl mb-4 text-xs">
                          <h4 className="font-bold text-violet-300 mb-1">Ejemplo Real del Sector: {selectedTopic.content.realWorldExample.company}</h4>
                          <p className="text-gray-300"><strong>Situación:</strong> {selectedTopic.content.realWorldExample.situation}</p>
                          <p className="text-gray-300 mt-1"><strong>Solución:</strong> {selectedTopic.content.realWorldExample.solution}</p>
                          <p className="text-emerald-400 mt-1 font-semibold"><strong>Resultado:</strong> {selectedTopic.content.realWorldExample.result}</p>
                        </div>
                      )}

                      {selectedTopic.content.checklist && selectedTopic.content.checklist.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-bold text-amber-400 mb-2">Checklist de Aplicación Práctica:</h4>
                          <ul className="space-y-1.5 text-xs text-gray-300">
                            {selectedTopic.content.checklist.map((c, i) => (
                              <li key={i} className="flex items-center gap-2 bg-dark-bg p-2 rounded border border-gray-800">
                                <span>☑</span>
                                <span className="flex-1">{c.item}</span>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-gray-800 text-gray-400">{c.timeframe}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="mt-6 flex justify-end">
                        <button
                          onClick={() => setSelectedTopic(null)}
                          className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-lg text-sm"
                        >
                          Cerrar Vista Previa
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* PESTAÑA 3: MÉTRICAS DE IMPACTO & QUIZZES */}
            {activeTab === 'impact' && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="bg-dark-secondary border border-gray-800 p-5 rounded-xl">
                    <p className="text-sm text-gray-400 font-medium">Diagnósticos guardados</p>
                    <p className="text-3xl font-extrabold text-electric-blue mt-2">{content?.diagnostics_count ?? '—'}</p>
                    <p className="text-xs text-gray-500 mt-1">Total registrado en Supabase</p>
                  </div>
                  <div className="bg-dark-secondary border border-gray-800 p-5 rounded-xl">
                    <p className="text-sm text-gray-400 font-medium">Acciones completadas</p>
                    <p className="text-3xl font-extrabold text-violet-400 mt-2">{content?.actions_completed_count ?? '—'}</p>
                    <p className="text-xs text-gray-500 mt-1">Eventos registrados en Supabase</p>
                  </div>
                  <div className="bg-dark-secondary border border-gray-800 p-5 rounded-xl">
                    <p className="text-sm text-gray-400 font-medium">Cuestionarios configurados</p>
                    <p className="text-3xl font-extrabold text-emerald-400 mt-2">{content?.quizzes_count ?? '—'}</p>
                    <p className="text-xs text-gray-500 mt-1">Catálogo disponible en Supabase</p>
                  </div>
                </div>

                <div className="bg-dark-secondary border border-gray-800 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-2">Análisis de resultados de quizzes</h3>
                  <p className="text-sm text-gray-400">La aprobación y fricción por área no se reportan aún desde una métrica agregada segura. Se mostrarán cuando exista esa instrumentación; no se usan cifras de muestra.</p>
                </div>
              </div>
            )}

            {/* PESTAÑA 4: GESTIÓN DE EMPRESAS & EQUIPOS */}
            {activeTab === 'companies' && (
              <div className="space-y-6">
                <section className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-5">
                  <h2 className="text-lg font-bold text-white">Invitar Nueva Empresa B2B</h2>
                  <p className="mt-1 text-xs text-gray-300">Genera accesos corporativos para habilitar planes multi-equipo.</p>
                  <form onSubmit={createCompanyLeadLink} className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="email"
                      required
                      aria-label="Correo del responsable"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      placeholder="lider@empresa.com"
                      className="flex-1 rounded-lg border border-gray-700 bg-dark-bg px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                    />
                    <button className="rounded-lg bg-violet-600 hover:bg-violet-500 px-5 py-2 text-sm font-semibold text-white">
                      Preparar invitación
                    </button>
                  </form>
                  {inviteMessage && <p role="status" className="mt-3 text-xs text-emerald-300">{inviteMessage}</p>}
                </section>

                <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
                  <section className="rounded-xl border border-gray-800 bg-dark-secondary p-5">
                    <h2 className="text-lg font-bold text-white mb-4">Empresas Registradas</h2>
                    {companies.length === 0 ? (
                      <p className="text-xs text-gray-400">Aún no hay empresas cliente configuradas.</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="text-gray-500 uppercase border-b border-gray-800">
                            <tr>
                              <th className="pb-3">Empresa</th>
                              <th className="pb-3">Plan</th>
                              <th className="pb-3">Cupos</th>
                              <th className="pb-3">Progreso</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {companies.map(c => (
                              <tr key={c.company_id}>
                                <td className="py-3 font-semibold text-white">{c.company_name}</td>
                                <td className="py-3 text-gray-400">{c.plan_key}</td>
                                <td className="py-3 text-gray-300">{c.member_count}/{c.seat_limit}</td>
                                <td className="py-3">
                                  <div className="w-24 bg-gray-800 rounded-full h-2">
                                    <div className="bg-violet-500 h-2 rounded-full" style={{ width: `${c.progress_percent}%` }} />
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </section>

                  <section className="rounded-xl border border-gray-800 bg-dark-secondary p-5">
                    <h2 className="text-lg font-bold text-white mb-2">Auditoría de Actividad</h2>
                    {activity.length === 0 ? (
                      <p className="text-xs text-gray-400 mt-4">Sin actividad reciente registradas en la auditoría.</p>
                    ) : (
                      <ul className="space-y-2 mt-4">
                        {activity.map((item, idx) => (
                          <li key={idx} className="bg-dark-bg p-3 rounded-lg border border-gray-800 text-xs">
                            <p className="font-semibold text-gray-200">{item.action}</p>
                            <p className="text-[10px] text-gray-500 mt-1">{new Date(item.created_at).toLocaleString()}</p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </main>
  );
};

export default PlatformAdminPage;
