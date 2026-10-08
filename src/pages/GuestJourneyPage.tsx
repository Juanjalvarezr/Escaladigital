import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/SupabaseAuthProvider';
import { supabase } from '../supabase';
import { BUSINESS_AREAS } from '../types';
import { DiagnosticResult } from '../services/gemini';
import {
  GuestWorkshopProgress,
  readGuestWorkshopProgress,
  readUserDiagnostic,
  writeGuestWorkshopProgress
} from '../utils/userScopedStorage';

const readProfile = () => {
  try {
    return JSON.parse(window.localStorage.getItem('escala:userProfile:v1') || '{}') as { nombre?: string };
  } catch {
    return {};
  }
};

const GuestJourneyPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(() =>
    readUserDiagnostic<DiagnosticResult>(user?.id) || readUserDiagnostic<DiagnosticResult>(null)
  );
  const [profile] = useState(readProfile);
  const [progress, setProgress] = useState<GuestWorkshopProgress | null>(readGuestWorkshopProgress);
  const [syncMessage, setSyncMessage] = useState('');

  useEffect(() => {
    setDiagnostic(readUserDiagnostic<DiagnosticResult>(user?.id) || readUserDiagnostic<DiagnosticResult>(null));
  }, [user?.id]);

  const firstPhase = diagnostic?.scalabilityRoadmap?.[0];
  const areaId = firstPhase?.moduleId || diagnostic?.recommendedModules?.[0] || 'management';
  const area = BUSINESS_AREAS.find((item) => item.id === areaId);
  const usedFallback = diagnostic?.generationSource === 'fallback'
    || diagnostic?.executiveSummary?.toLowerCase().includes('no se pudo generar') === true;
  const workshopModuleId = `${areaId}-guest-workshop`;
  const workshopLessonId = `first-workshop:${areaId}`;
  const currentProgress = progress?.moduleId === workshopModuleId ? progress : null;
  const [response, setResponse] = useState(currentProgress?.response || '');
  const hasRegisteredAccount = Boolean(user?.email && !user.id.startsWith('guest_'));

  useEffect(() => {
    if (progress?.moduleId === workshopModuleId) setResponse(progress.response);
  }, [progress?.moduleId, progress?.response, progress?.updatedAt, workshopModuleId]);

  const saveProgress = async (completed: boolean) => {
    const nextProgress: GuestWorkshopProgress = {
      moduleId: workshopModuleId,
      lessonId: workshopLessonId,
      response,
      completed,
      updatedAt: new Date().toISOString()
    };
    writeGuestWorkshopProgress(nextProgress);
    setProgress(nextProgress);

    if (user?.email && !user.id.startsWith('guest_')) {
      const { error } = await supabase.from('user_progress').upsert({
        user_id: user.id,
        module_id: workshopModuleId,
        status: completed ? 'completed' : 'in_progress',
        completion_percentage: completed ? 100 : 25,
        lessons_completed: completed ? [workshopLessonId] : [],
        last_accessed: nextProgress.updatedAt,
        updated_at: nextProgress.updatedAt
      }, { onConflict: 'user_id,module_id' });
      setSyncMessage(error ? 'Tu avance quedó guardado en este dispositivo; no se pudo sincronizar todavía.' : 'Avance guardado en tu cuenta.');
    } else {
      setSyncMessage('Avance guardado en este dispositivo. Crea una cuenta al terminar para sincronizarlo.');
    }
  };

  if (!diagnostic) {
    return (
      <main className="min-h-screen bg-dark-bg text-white flex items-center justify-center p-6">
        <section className="max-w-lg text-center">
          <h1 className="text-2xl font-bold">Tu ruta todavía no aparece</h1>
          <p className="mt-3 text-gray-400">El borrador sigue en este dispositivo. Vuelve al diagnóstico para generar tu plan.</p>
          <button onClick={() => navigate('/')} className="mt-6 rounded-lg bg-electric-blue px-5 py-3 font-semibold">Volver al diagnóstico</button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-dark-bg text-white">
      <header className="border-b border-gray-800 bg-dark-secondary">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-5">
          <div>
            <p className="text-sm text-electric-blue">Tu plan de crecimiento</p>
            <h1 className="mt-1 text-2xl font-bold">{profile.nombre ? `Ruta para ${profile.nombre}` : 'Tu ruta personalizada'}</h1>
          </div>
          <button onClick={() => navigate('/')} className="text-sm text-gray-300 hover:text-white">Editar diagnóstico</button>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="space-y-5">
          <div className="rounded-xl border border-gray-800 bg-dark-secondary p-5">
            <p className="text-xs font-semibold uppercase text-gray-400">Punto de partida</p>
            <h2 className="mt-2 text-xl font-bold">{diagnostic.businessType}</h2>
            <p className="mt-2 text-gray-300">{diagnostic.executiveSummary || diagnostic.mainChallenge}</p>
            {usedFallback && (
              <p role="status" className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
                Preparé esta ruta con el respaldo local porque la IA no respondió. Tu diagnóstico no se perdió.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-gray-800 p-5">
            <h2 className="font-bold">Tu ruta inicial</h2>
            <ol className="mt-4 space-y-3">
              {diagnostic.scalabilityRoadmap.map((phase, index) => (
                <li key={`${phase.phase}-${index}`} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-electric-blue/15 text-sm font-bold text-electric-blue">{index + 1}</span>
                  <div>
                    <p className="font-semibold">{phase.phase}</p>
                    <p className="mt-1 text-sm text-gray-400">{phase.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rounded-xl border border-electric-blue/30 bg-dark-secondary p-5 sm:p-7">
          <p className="text-sm font-semibold text-electric-blue">Primer taller · {area?.name || 'Gestión'}</p>
          <h2 className="mt-2 text-2xl font-bold">{firstPhase?.phase || 'Define tu primer paso'}</h2>
          <p className="mt-3 text-gray-300">{firstPhase?.description || diagnostic.mainChallenge}</p>

          <div className="mt-6 rounded-lg bg-dark-bg p-4">
            <h3 className="font-semibold">Tu acción para esta semana</h3>
            <p className="mt-1 text-sm text-gray-400">Escribe una acción concreta que puedas completar en los próximos siete días. Se guarda mientras avanzas.</p>
            <textarea
              value={response}
              onChange={(event) => {
                setResponse(event.target.value);
                writeGuestWorkshopProgress({
                  moduleId: workshopModuleId,
                  lessonId: workshopLessonId,
                  response: event.target.value,
                  completed: currentProgress?.completed || false,
                  updatedAt: new Date().toISOString()
                });
              }}
              rows={5}
              placeholder={`Ejemplo: ${firstPhase?.description || 'Dedicar 30 minutos a mejorar un proceso de mi negocio.'}`}
              className="mt-3 w-full resize-y rounded-lg border border-gray-700 bg-dark-secondary p-3 text-white outline-none focus:border-electric-blue"
            />
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={response.trim().length < 10}
                onClick={() => void saveProgress(true)}
                className="rounded-lg bg-electric-blue px-4 py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {currentProgress?.completed ? 'Taller completado' : 'Completar primer taller'}
              </button>
              {currentProgress?.completed && <span className="text-sm text-emerald-300">Acción guardada</span>}
            </div>
            {syncMessage && <p role="status" className="mt-3 text-sm text-gray-400">{syncMessage}</p>}
          </div>

          <div className="mt-6 border-t border-gray-700 pt-5">
            <p className="text-sm text-gray-300">Tu ruta y este avance permanecen en este dispositivo. Regístrate para guardarlos en tu cuenta y continuar desde cualquier lugar.</p>
            <button
              type="button"
              onClick={() => navigate(hasRegisteredAccount ? '/dashboard' : '/auth?next=%2Fmi-ruta')}
              className="mt-4 w-full rounded-lg border border-gray-600 px-4 py-3 text-center font-semibold hover:border-electric-blue hover:text-electric-blue"
            >
              {hasRegisteredAccount ? 'Ir a mi dashboard' : 'Crear cuenta y guardar mi avance'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

export default GuestJourneyPage;