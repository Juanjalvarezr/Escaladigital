import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/SupabaseAuthProvider';
import { isSupabaseConfigured } from '../supabase';

const readPendingPath = () => {
  try {
    return window.localStorage.getItem('escala:postAuthPath:v1');
  } catch {
    return null;
  }
};

const readGuestProfile = () => {
  try {
    return JSON.parse(window.localStorage.getItem('escala:userProfile:v1') || '{}') as { nombre?: string; companyName?: string };
  } catch {
    return {};
  }
};

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signInWithEmail, signUpWithEmail, signInWithMagicLink, claimCompanyInvitation } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(() => readGuestProfile().nombre || '');
  const [company, setCompany] = useState(() => readGuestProfile().companyName || '');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const requestedNextPath = new URLSearchParams(location.search).get('next');
  const nextCandidate = requestedNextPath || readPendingPath() || '/dashboard';
  const nextPath = nextCandidate.startsWith('/') ? nextCandidate : '/dashboard';
  const inviteToken = new URLSearchParams(location.search).get('invite');
  const getAuthMessage = (authError: unknown) => {
    const message = authError instanceof Error ? authError.message : '';
    if (message.toLowerCase().includes('rate limit')) {
      return 'Supabase bloqueó temporalmente los correos por límite de envío. Espera y vuelve a intentar, o crea el usuario manualmente en Authentication > Users.';
    }
    if (message.toLowerCase().includes('user already registered')) {
      return 'Este correo ya tiene una cuenta. Cambia a “Ya tengo una cuenta” e inicia sesión.';
    }
    return message || 'No se pudo completar el acceso.';
  };

  useEffect(() => {
    if (requestedNextPath === '/mi-ruta') {
      try {
        window.localStorage.setItem('escala:postAuthPath:v1', '/mi-ruta');
      } catch {
        // The current session can still navigate directly after authentication.
      }
    }
  }, [requestedNextPath]);

  useEffect(() => {
    if (user) {
      navigate(nextPath, { replace: true });
    }
  }, [navigate, nextPath, user]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!isSupabaseConfigured) {
      setError('El acceso todavía no está conectado. Configura REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY en Vercel y vuelve a desplegar.');
      return;
    }
    setSubmitting(true);

    try {
      if (mode === 'signup') {
        await signUpWithEmail(email.trim(), password, {
          email: email.trim(),
          displayName: name.trim(),
          company: company.trim()
        });
        if (inviteToken) {
          try {
            await claimCompanyInvitation(inviteToken);
            setMessage('Cuenta creada y acceso a la empresa aceptado.');
          } catch (invitationError) {
            setMessage('Cuenta creada. No pudimos aceptar la invitación todavía; inicia sesión con este mismo correo para reintentarlo.');
            console.error('Error claiming invitation after signup:', invitationError);
          }
        }
        if (!inviteToken) setMessage('Cuenta creada. Revisa tu correo si Supabase solicita confirmación.');
      } else {
        await signInWithEmail(email.trim(), password);
        if (inviteToken) await claimCompanyInvitation(inviteToken);
        navigate(nextPath, { replace: true });
      }
    } catch (authError) {
      setError(getAuthMessage(authError));
    } finally {
      setSubmitting(false);
    }
  };

  const sendMagicLink = async () => {
    setError(null);
    setMessage(null);
    if (!isSupabaseConfigured) {
      setError('El acceso todavía no está conectado. Configura REACT_APP_SUPABASE_URL y REACT_APP_SUPABASE_ANON_KEY en Vercel y vuelve a desplegar.');
      return;
    }
    setSubmitting(true);
    try {
      await signInWithMagicLink(email.trim());
      setMessage('Enlace enviado. Revisa tu correo para continuar.');
    } catch (authError) {
      setError(getAuthMessage(authError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-dark-bg text-white flex items-center justify-center p-4">
      <section className="w-full max-w-md rounded-2xl border border-gray-700 bg-dark-secondary p-6 shadow-xl">
        <h1 className="text-2xl font-bold mb-2">{mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
        <p className="text-sm text-gray-400 mb-6">Tu progreso y el de tu empresa se guardarán de forma segura.</p>
        <form onSubmit={submit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <input aria-label="Nombre" required value={name} onChange={(event) => setName(event.target.value)} placeholder="Nombre" className="w-full rounded-lg bg-dark-bg border border-gray-700 px-3 py-2" />
              <input aria-label="Empresa" required value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Empresa" className="w-full rounded-lg bg-dark-bg border border-gray-700 px-3 py-2" />
            </>
          )}
          <input aria-label="Correo electrónico" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Correo electrónico" className="w-full rounded-lg bg-dark-bg border border-gray-700 px-3 py-2" />
          <input aria-label="Contraseña" type="password" minLength={6} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Contraseña (mínimo 6 caracteres)" className="w-full rounded-lg bg-dark-bg border border-gray-700 px-3 py-2" />
          <button disabled={submitting} className="w-full rounded-lg bg-violet-600 px-4 py-3 font-semibold disabled:opacity-50">
            {submitting ? 'Procesando...' : mode === 'signup' ? 'Crear cuenta' : 'Entrar'}
          </button>
        </form>
        <button type="button" disabled={submitting || !email.trim()} onClick={sendMagicLink} className="w-full mt-3 rounded-lg border border-gray-600 px-4 py-3 text-sm text-gray-200 disabled:opacity-50">
          Enviarme un enlace mágico
        </button>
        {message && <p role="status" className="mt-4 text-sm text-emerald-300">{message}</p>}
        {error && <p role="alert" className="mt-4 text-sm text-red-300">{error}</p>}
        <div className="mt-6 pt-4 border-t border-gray-700 flex flex-col gap-2">
          <button type="button" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} className="text-sm text-cyan-300 hover:underline text-center">
            {mode === 'signup' ? 'Ya tengo una cuenta' : 'Crear una cuenta nueva'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/platform-admin')}
            className="w-full mt-2 py-2 px-3 bg-violet-500/10 border border-violet-500/30 rounded-lg text-xs font-semibold text-violet-300 hover:bg-violet-500/20 transition-all text-center"
          >
            ⚡ Acceder directamente al Panel de Control Maestro (Admin)
          </button>
        </div>
      </section>
    </main>
  );
};


export default AuthPage;
