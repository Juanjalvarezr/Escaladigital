import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SupabaseAuthProvider, useAuth } from './components/SupabaseAuthProvider';
import { SupabaseDiagnostic } from './components/SupabaseDiagnostic';
import { ToastContainer, useToast } from './components/ToastNotification';
import { cache, preloadCriticalRoutes, measurePerformance } from './utils/performance';
import { DiagnosticResult } from './services/gemini';

// Lazy loading de componentes pesados
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AreaPage = lazy(() => import('./pages/AreaPage'));
const SupabaseModulePage = lazy(() => import('./pages/SupabaseModulePage'));
const SupabaseLessonView = lazy(() => import('./components/SupabaseLessonView'));
const SupabaseQuizView = lazy(() => import('./components/SupabaseQuizView'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

// Componente de carga optimizado
const OptimizedLoading = ({ message }: { message: string }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
    <div className="text-center">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mx-auto mb-4"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-8 w-8 bg-blue-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="text-gray-600 font-medium animate-pulse">{message}</p>
    </div>
  </div>
);

// Componente de Suspense con fallback personalizado
const SuspenseWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <React.Suspense fallback={<OptimizedLoading message="Cargando componente..." />}>
    {children}
  </React.Suspense>
);

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
    return <OptimizedLoading message="Iniciando aplicación..." />;
  }

  if (!user) {
    return <OptimizedLoading message="Conectando con el servidor..." />;
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
          <SuspenseWrapper>
            {user ? <DashboardPage /> : <Navigate to="/" />}
          </SuspenseWrapper>
        } />
        <Route path="/area/:areaId" element={
          <SuspenseWrapper>
            {user ? <AreaPage /> : <Navigate to="/" />}
          </SuspenseWrapper>
        } />
        <Route path="/area/:areaId/module/:moduleId" element={
          <SuspenseWrapper>
            {user ? <SupabaseModulePage /> : <Navigate to="/" />}
          </SuspenseWrapper>
        } />
        <Route path="/area/:areaId/module/:moduleId/lesson/:lessonId" element={
          <SuspenseWrapper>
            <SupabaseLessonView
              moduleId=""
              lessonId=""
              onComplete={() => {}}
              onNext={() => {}}
              onPrevious={() => {}}
              hasNext={false}
              hasPrevious={false}
            />
          </SuspenseWrapper>
        } />
        <Route path="/area/:areaId/module/:moduleId/quiz" element={
          <SuspenseWrapper>
            <SupabaseQuizView
              moduleId=""
              onComplete={() => {}}
              onRetry={() => {}}
            />
          </SuspenseWrapper>
        } />
        <Route path="/profile" element={
          <SuspenseWrapper>
            {user ? <ProfilePage /> : <Navigate to="/" />}
          </SuspenseWrapper>
        } />
        <Route path="/" element={
          loading ? (
            <OptimizedLoading message="Verificando sesión..." />
          ) : user ? (
            <Navigate to="/dashboard" />
          ) : (
            <SupabaseDiagnostic onComplete={() => {}} />
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
