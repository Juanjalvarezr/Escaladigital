import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SupabaseAuthProvider, useAuth } from './components/SupabaseAuthProvider';
import SupabaseDiagnostic from './components/SupabaseDiagnostic';
import SupabaseModulePage from './pages/SupabaseModulePage';
import SupabaseLessonView from './components/SupabaseLessonView';
import SupabaseQuizView from './components/SupabaseQuizView';
import DashboardPage from './pages/DashboardPage';
import AreaPage from './pages/AreaPage';
import ProfilePage from './pages/ProfilePage';
import IntroPage from './pages/IntroPage';
import { ToastContainer, useToast } from './components/ToastNotification';
import { cache, preloadCriticalRoutes, measurePerformance } from './utils/performance';
import { DiagnosticResult } from './services/gemini';

const AppContent: React.FC = () => {
  const { user, loading, signInAnonymous, authError, clearAuthError } = useAuth();
  const { success, error, warning } = useToast();
  const [showDiagnostic, setShowDiagnostic] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('diagnostic') === '1') return true;
      return !window.localStorage.getItem('escala:latestDiagnosticResult:v1');
    } catch {
      return true;
    }
  });
  const [, setDiagnosticResult] = useState<DiagnosticResult | null>(null);

  // Optimización: Preload rutas críticas
  useEffect(() => {
    measurePerformance('preload-routes', preloadCriticalRoutes);
  }, []);

  // Manejo de errores de autenticación con toast
  useEffect(() => {
    if (authError) {
      error('Error de autenticación', 'No se pudo conectar con el servidor', {
        showRetry: true,
        onRetry: () => {
          clearAuthError();
          signInAnonymous();
        }
      });
    }
  }, [authError, error, clearAuthError, signInAnonymous]);

  // Limpiar caché periódicamente
  useEffect(() => {
    const cleanup = setInterval(() => {
      cache.cleanup();
    }, 10 * 60 * 1000); // Cada 10 minutos

    return () => clearInterval(cleanup);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      signInAnonymous();
    }
  }, [user, loading, signInAnonymous]);

  const handleDiagnosticComplete = (result: DiagnosticResult) => {
    measurePerformance('diagnostic-complete', () => {
      setDiagnosticResult(result);
      setShowDiagnostic(false);
      
      try {
        window.localStorage.setItem('escala:latestDiagnosticResult:v1', JSON.stringify(result));
        success('¡Diagnóstico completado!', 'Tu plan personalizado ha sido generado exitosamente');
      } catch (error) {
        warning('No se pudo guardar el diagnóstico localmente', 'Podrás volver a hacerlo cuando quieras');
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Iniciando sesión anónima...</p>
        </div>
      </div>
    );
  }

  if (showDiagnostic) {
    return <SupabaseDiagnostic onComplete={handleDiagnosticComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/diagnostic" element={
          user ? <SupabaseDiagnostic onComplete={() => {}} /> : <Navigate to="/" />
        } />
        <Route path="/dashboard" element={
          user ? <DashboardPage /> : <Navigate to="/" />
        } />
        <Route path="/area/:areaId" element={
          user ? <AreaPage /> : <Navigate to="/" />
        } />
        <Route path="/area/:areaId/module/:moduleId" element={
          user ? <SupabaseModulePage /> : <Navigate to="/" />
        } />
        <Route path="/area/:areaId/module/:moduleId/lesson/:lessonId" element={
          <SupabaseLessonView
            moduleId=""
            lessonId=""
            onComplete={() => {}}
            onNext={() => {}}
            onPrevious={() => {}}
            hasNext={false}
            hasPrevious={false}
          />
        } />
        <Route path="/area/:areaId/module/:moduleId/quiz" element={
          <SupabaseQuizView
            moduleId=""
            onComplete={() => {}}
            onRetry={() => {}}
          />
        } />
        <Route path="/profile" element={
          user ? <ProfilePage /> : <Navigate to="/" />
        } />
        <Route path="/" element={
          loading ? (
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : user ? (
            <Navigate to="/dashboard" />
          ) : (
            <IntroPage />
          )
        } />
      </Routes>
      
      {/* Contenedor de notificaciones toast */}
      <ToastContainer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <SupabaseAuthProvider>
        <AppContent />
      </SupabaseAuthProvider>
    </Router>
  );
};

export default App;
