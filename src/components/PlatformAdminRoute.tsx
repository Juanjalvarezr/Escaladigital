import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './SupabaseAuthProvider';
import { isSupabaseConfigured, supabase } from '../supabase';

const PlatformAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [access, setAccess] = useState<'checking' | 'allowed' | 'denied' | 'unavailable'>('checking');

  useEffect(() => {
    let active = true;
    if (loading) return;
    if (!user || !user.email || user.id.startsWith('guest_')) {
      setAccess('denied');
      return;
    }
    if (!isSupabaseConfigured) {
      setAccess('unavailable');
      return;
    }

    setAccess('checking');
    void (async () => {
      try {
        const { data, error } = await supabase
          .from('platform_admins')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle();
        console.log('PlatformAdminRoute check', { userId: user.id, data, error });
        if (!active) return;
        if (error || !data) {
          setAccess('denied');
          return;
        }
        setAccess('allowed');
      } catch (e) {
        console.error('PlatformAdminRoute exception', e);
        if (active) setAccess('unavailable');
      }
    })();

    return () => { active = false; };
  }, [loading, user]);

  if (loading || access === 'checking') {
    return <main className="min-h-screen bg-dark-bg text-white flex items-center justify-center">Verificando acceso administrativo...</main>;
  }
  if (access === 'denied') {
    return user ? <main className="min-h-screen bg-dark-bg text-white flex items-center justify-center p-6"><p role="alert">Esta cuenta no tiene permisos de administración.</p></main> : <Navigate to="/auth?next=%2Fplatform-admin" replace />;
  }
  if (access === 'unavailable') {
    return <main className="min-h-screen bg-dark-bg text-white flex items-center justify-center p-6"><p role="alert">No se pudo verificar el acceso con Supabase. Comprueba la configuración y las migraciones administrativas.</p></main>;
  }

  return <>{children}</>;
};

export default PlatformAdminRoute;
