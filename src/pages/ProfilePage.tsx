import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/SupabaseAuthProvider';
import { supabase } from '../supabase';
import { BUSINESS_AREAS } from '../types';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  company: string;
  industry: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  // Extended fields captured from onboarding
  employees_count?: string | number;
  learning_areas?: string[];
  goals?: string;
  business_description?: string;
  business_type?: string;
  business_stage?: string;
  niche?: string;
  offer?: string;
  ideal_client?: string;
  time_available?: string;
}

interface UserSettings {
  notifications_enabled: boolean;
  email_notifications: boolean;
  language: string;
  theme: string;
  daily_goal_minutes: number;
}

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    notifications_enabled: true,
    email_notifications: true,
    language: 'es',
    theme: 'light',
    daily_goal_minutes: 30
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'progress'>('profile');
  const [areaProgress, setAreaProgress] = useState<Record<string, number>>({});

  const readLocalBusinessProfile = () => {
    try {
      return JSON.parse(window.localStorage.getItem('escala:userProfile:v1') || '{}');
    } catch {
      return {};
    }
  };

  const saveLocalBusinessProfile = (data: Partial<UserProfile>) => {
    try {
      const current = readLocalBusinessProfile();
      window.localStorage.setItem('escala:userProfile:v1', JSON.stringify({
        ...current,
        ...data,
        businessType: data.business_type,
        businessStage: data.business_stage,
        niche: data.niche,
        offer: data.offer,
        idealClient: data.ideal_client,
        timeAvailable: data.time_available
      }));
    } catch {
      // Local persistence is optional and should not block profile editing.
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadProfile();
    loadSettings();
    loadAreaProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, navigate]);

  const loadAreaProgress = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('module_id, completion_percentage')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error loading area progress:', error);
        return;
      }

      const sums: Record<string, { total: number; count: number }> = {};
      (data || []).forEach((row: any) => {
        const moduleId = row.module_id || '';
        const areaId = moduleId.split('-')[0] || 'other';
        if (!sums[areaId]) sums[areaId] = { total: 0, count: 0 };
        const pct = typeof row.completion_percentage === 'number' ? row.completion_percentage : 0;
        sums[areaId].total += pct;
        sums[areaId].count += 1;
      });

      const result: Record<string, number> = {};
      Object.keys(sums).forEach(areaId => {
        const s = sums[areaId];
        result[areaId] = s.count ? Math.round(s.total / s.count) : 0;
      });

      // ensure all BUSINESS_AREAS present
      BUSINESS_AREAS.forEach(a => { if (result[a.id] === undefined) result[a.id] = 0; });

      setAreaProgress(result);
    } catch (err) {
      console.error('Error computing area progress:', err);
    }
  };

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        return;
      }

      if (data) {
        const local = readLocalBusinessProfile();
        setProfile({
          ...data,
          business_type: local.businessType || '',
          business_stage: local.businessStage || '',
          niche: local.niche || '',
          offer: local.offer || '',
          ideal_client: local.idealClient || '',
          time_available: local.timeAvailable || ''
        });
      } else {
        // Crear perfil inicial
        const newProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          company: user.user_metadata?.company || '',
          industry: user.user_metadata?.industry || '',
          role: user.user_metadata?.role || '',
          avatar_url: user.user_metadata?.avatar_url || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { error: insertError } = await supabase
          .from('profiles')
          .insert(newProfile);

        if (insertError) {
          console.error('Error creating profile:', insertError);
        } else {
          const local = readLocalBusinessProfile();
          setProfile({
            ...newProfile,
            business_type: local.businessType || '',
            business_stage: local.businessStage || '',
            niche: local.niche || '',
            offer: local.offer || '',
            ideal_client: local.idealClient || '',
            time_available: local.timeAvailable || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error);
        return;
      }

      if (data) {
        setSettings(data);
      } else {
        // Crear configuración inicial
        const { error: insertError } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            ...settings
          });

        if (insertError) {
          console.error('Error creating settings:', insertError);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveProfile = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      saveLocalBusinessProfile(profile);
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          company: profile.company,
          industry: profile.industry,
          role: profile.role,
          avatar_url: profile.avatar_url,
          employees_count: profile.employees_count,
          learning_areas: profile.learning_areas,
          business_description: profile.business_description,
          goals: profile.goals,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving profile:', error);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveSettings = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error saving settings:', error);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  // Persist the theme selection to localStorage and apply immediately
  useEffect(() => {
    try {
      window.localStorage.setItem('escala:theme:v1', settings.theme);
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      // ignore
    }
  }, [settings.theme]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Volver al Dashboard
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'profile'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Perfil
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Configuración
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-6 py-3 font-medium ${
                activeTab === 'progress'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Progreso
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {profile?.full_name?.charAt(0) || 'U'}
                  </span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {profile?.full_name || 'Usuario'}
                  </h2>
                  <p className="text-gray-500">{profile?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={profile?.full_name || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, full_name: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Empresa
                  </label>
                  <input
                    type="text"
                    value={profile?.company || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, company: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Industria
                  </label>
                  <select
                    value={profile?.industry || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, industry: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="retail">Retail</option>
                    <option value="servicios">Servicios</option>
                    <option value="tecnologia">Tecnología</option>
                    <option value="manufactura">Manufactura</option>
                    <option value="salud">Salud</option>
                    <option value="educacion">Educación</option>
                    <option value="consultoria">Consultoría</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rol
                  </label>
                  <input
                    type="text"
                    value={profile?.role || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, role: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de negocio
                  </label>
                  <select
                    value={profile?.business_type || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, business_type: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Producto físico">Vendo productos físicos</option>
                    <option value="Servicio">Ofrezco servicios</option>
                    <option value="Producto digital">Creo cursos o productos digitales</option>
                    <option value="Tienda o comercio">Tengo una tienda o comercio</option>
                    <option value="Aún estoy explorando">Aún estoy explorando mi idea</option>
                    <option value="Otro">Otro tipo de negocio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etapa del negocio
                  </label>
                  <select
                    value={profile?.business_stage || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, business_stage: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Idea">Tengo una idea</option>
                    <option value="Inicio">Estoy empezando</option>
                    <option value="Ventas">Ya tengo mis primeras ventas</option>
                    <option value="Crecimiento">Estoy creciendo</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Empleados</label>
                <input
                  type="text"
                  value={String(profile?.employees_count || '')}
                  onChange={(e) => setProfile(prev => prev ? {...prev, employees_count: e.target.value} : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Áreas de interés</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BUSINESS_AREAS.map(a => {
                      const checked = profile?.learning_areas?.includes(a.id) ?? false;
                      return (
                        <label key={a.id} className="inline-flex items-center p-2 border rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = profile?.learning_areas ? [...profile.learning_areas] : [] as string[];
                              if (e.target.checked) {
                                if (!next.includes(a.id)) next.push(a.id);
                              } else {
                                const idx = next.indexOf(a.id);
                                if (idx >= 0) next.splice(idx, 1);
                              }
                              setProfile(prev => prev ? {...prev, learning_areas: next} : null);
                            }}
                            className="mr-2"
                          />
                          <div>
                            <div className="font-medium">{a.name}</div>
                            <div className="text-xs text-gray-500">{a.description}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Descripción breve</label>
                  <textarea
                    value={profile?.business_description || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, business_description: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nicho</label>
                    <input
                      value={profile?.niche || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, niche: e.target.value} : null)}
                      placeholder="Ej: repostería saludable"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tiempo disponible por semana</label>
                    <select
                      value={profile?.time_available || ''}
                      onChange={(e) => setProfile(prev => prev ? {...prev, time_available: e.target.value} : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Menos de 2 horas">Menos de 2 horas</option>
                      <option value="2 a 5 horas">De 2 a 5 horas</option>
                      <option value="5 a 10 horas">De 5 a 10 horas</option>
                      <option value="Más de 10 horas">Más de 10 horas</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Oferta</label>
                  <textarea
                    value={profile?.offer || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, offer: e.target.value} : null)}
                    placeholder="¿Qué vendes o qué servicio prestas?"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cliente ideal</label>
                  <textarea
                    value={profile?.ideal_client || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, ideal_client: e.target.value} : null)}
                    placeholder="¿Quién necesita más tu oferta?"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">¿Qué buscas lograr?</label>
                  <input
                    type="text"
                    value={profile?.goals || ''}
                    onChange={(e) => setProfile(prev => prev ? {...prev, goals: e.target.value} : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Perfil'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Notificaciones</h3>
                    <p className="text-sm text-gray-500">Recibir notificaciones sobre tu progreso</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications_enabled}
                      onChange={(e) => setSettings(prev => ({...prev, notifications_enabled: e.target.checked}))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">Notificaciones por Email</h3>
                    <p className="text-sm text-gray-500">Recibir actualizaciones por correo electrónico</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.email_notifications}
                      onChange={(e) => setSettings(prev => ({...prev, email_notifications: e.target.checked}))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Meta Diaria de Aprendizaje</h3>
                  <p className="text-sm text-gray-500 mb-3">Minutos que deseas estudiar cada día</p>
                  <select
                    value={settings.daily_goal_minutes}
                    onChange={(e) => setSettings(prev => ({...prev, daily_goal_minutes: parseInt(e.target.value)}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="15">15 minutos</option>
                    <option value="30">30 minutos</option>
                    <option value="45">45 minutos</option>
                    <option value="60">1 hora</option>
                    <option value="90">1.5 horas</option>
                    <option value="120">2 horas</option>
                  </select>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Idioma</h3>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings(prev => ({...prev, language: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Tema</h3>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings(prev => ({...prev, theme: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="light">Claro</option>
                    <option value="dark">Oscuro</option>
                    <option value="auto">Automático</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={saveSettings}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Mi Progreso</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center bg-white p-4 rounded-lg shadow">
                  <div className="text-3xl font-bold text-blue-600">{Object.values(areaProgress).reduce((acc, v) => acc + v, 0)}</div>
                  <div className="text-gray-600">Progreso agregado (%)</div>
                </div>
                <div className="text-center bg-white p-4 rounded-lg shadow">
                  <div className="text-3xl font-bold text-green-600">{Object.values(areaProgress).filter(p => p >= 60).length}</div>
                  <div className="text-gray-600">Áreas con avance ≥60%</div>
                </div>
                <div className="text-center bg-white p-4 rounded-lg shadow">
                  <div className="text-3xl font-bold text-purple-600">{BUSINESS_AREAS.length}</div>
                  <div className="text-gray-600">Áreas</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Progreso por Área</h4>
                {BUSINESS_AREAS.map((area) => {
                  const pct = areaProgress[area.id] ?? 0;
                  return (
                    <div key={area.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{area.icon}</div>
                        <div>
                          <div className="font-medium text-gray-700">{area.name}</div>
                          <div className="text-xs text-gray-500">{area.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-40 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="text-sm text-gray-600">{pct}%</span>
                        <button
                          onClick={() => navigate(`/area/${area.id}`)}
                          className="ml-4 px-3 py-1 bg-blue-600 text-white rounded text-sm"
                        >
                          Ver
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
