import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/SupabaseAuthProvider';
import { supabase } from '../supabase';
import { BUSINESS_AREAS } from '../types';
import AreaCard from '../components/AreaCard';
import ProfileMenu from '../components/ProfileMenu';

interface ProgressData {
  [areaId: string]: {
    completedLessons: number;
    totalLessons: number;
    completedQuizzes: number;
    totalQuizzes: number;
  };
}

const DashboardPage: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [progress, setProgress] = useState<ProgressData>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar progreso REAL desde Supabase
    const loadRealProgress = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // Obtener todo el progreso del usuario
        const { data: progressData, error } = await supabase
          .from('user_progress')
          .select('module_id, completion_percentage, lessons_completed, status');

        if (error) {
          console.error('Error loading progress:', error);
          // Si hay error, mostrar progreso en cero
          const zeroProgress: ProgressData = {};
          BUSINESS_AREAS.forEach(area => {
            zeroProgress[area.id] = {
              completedLessons: 0,
              totalLessons: 8,
              completedQuizzes: 0,
              totalQuizzes: 4,
            };
          });
          setProgress(zeroProgress);
          return;
        }

        // Mapear progreso real por área
        const realProgress: ProgressData = {};
        
        // Inicializar todas las áreas con cero
        BUSINESS_AREAS.forEach(area => {
          realProgress[area.id] = {
            completedLessons: 0,
            totalLessons: 8,
            completedQuizzes: 0,
            totalQuizzes: 4,
          };
        });

        // Agregar progreso real si existe
        progressData?.forEach(progress => {
          const areaId = progress.module_id.split('-')[0]; // Extraer areaId de moduleId
          if (realProgress[areaId]) {
            realProgress[areaId].completedLessons = progress.lessons_completed?.length || 0;
            realProgress[areaId].completedQuizzes = progress.completion_percentage >= 60 ? 1 : 0;
          }
        });

        setProgress(realProgress);
      } catch (error) {
        console.error('Error loading progress:', error);
        // Fallback a cero
        const zeroProgress: ProgressData = {};
        BUSINESS_AREAS.forEach(area => {
          zeroProgress[area.id] = {
            completedLessons: 0,
            totalLessons: 8,
            completedQuizzes: 0,
            totalQuizzes: 4,
          };
        });
        setProgress(zeroProgress);
      } finally {
        setLoading(false);
      }
    };

    loadRealProgress();
  }, [user]);

  const handleAreaClick = (areaId: string) => {
    navigate(`/area/${areaId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu progreso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Escala Digital</h1>
            </div>
            <ProfileMenu user={user} onSignOut={signOut} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido de nuevo, {user?.user_metadata?.name || user?.email || 'Usuario'}!
          </h2>
          <p className="text-gray-600">
            Continúa tu aprendizaje y escala tu negocio al siguiente nivel.
          </p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tu progreso general</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {Object.values(progress).reduce((acc, area) => acc + area.completedLessons, 0)}
              </div>
              <div className="text-gray-600">Lecciones completadas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {Object.values(progress).reduce((acc, area) => acc + area.completedQuizzes, 0)}
              </div>
              <div className="text-gray-600">Quizzes aprobados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {BUSINESS_AREAS.length}
              </div>
              <div className="text-gray-600">Áreas de negocio</div>
            </div>
          </div>
        </div>

        {/* Business Areas Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Áreas de negocio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {BUSINESS_AREAS.map((area) => (
              <AreaCard
                key={area.id}
                area={area}
                progress={progress[area.id]}
                onClick={() => handleAreaClick(area.id)}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
