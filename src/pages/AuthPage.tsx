import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/SupabaseAuthProvider';
import { isSupabaseConfigured, supabase } from '../supabase';
import { signInSchema, signUpSchema } from '../schemas/auth';

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
  const hasPermanentAccount = Boolean(user?.email && !user.is_anonymous && !user.id.startsWith('guest_'));
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

  useEffect(() => {
    if (nextPath.includes('/platform-admin')) {
      setMode('signin');
    }
  }, [nextPath]);

  useEffect(() => {
    if (hasPermanentAccount) {
      navigate(nextPath, { replace: true });
    }
  }, [navigate, nextPath, hasPermanentAccount]);

  const getAuthMessage = (authError: unknown) => {
    const msg = authError instanceof Error ? authError.message : '';
    if (msg.toLowerCase().includes('rate limit')) {
      return 'Demasiados intentos. Espera unos minutos y vuelve a intentarlo.';
    }
    if (msg.toLowerCase().includes('user already registered')) {
      return 'Este correo ya tiene una cuenta. Usa "Ya tengo cuenta" para iniciar sesión.';
    }
    if (msg.toLowerCase().includes('invalid login credentials') || msg.toLowerCase().includes('invalid credentials')) {
      return 'Correo o contraseña incorrectos. Verifica tus datos o usa "¿Olvidaste tu contraseña?" para recuperarla.';
    }
    return msg || 'No se pudo completar el acceso. Intenta de nuevo.';
  };

  useEffect(() => {
    if (requestedNextPath === '/mi-ruta') {
      try {
        window.localStorage.setItem('escala:postAuthPath:v1', '/mi-ruta');
      } catch {
        // ignore
      }
    }
  }, [requestedNextPath]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  useEffect(() => {
    if (hasPermanentAccount) {
      navigate(nextPath, { replace: true });
    }
  }, [navigate, nextPath, hasPermanentAccount]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!isSupabaseConfigured) {
      setError('El sistema de acceso no está configurado. Contacta al administrador.');
      return;
    }
    setSubmitting(true);

    try {
      const schema = mode === 'signup' ? signUpSchema : signInSchema;
      const parsed = schema.safeParse({ email: email.trim(), password, displayName: name.trim() });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || 'Datos inválidos');
        setSubmitting(false);
        return;
      }
      if (mode === 'signup') {
        await signUpWithEmail(email.trim(), password, {
          email: email.trim(),
          displayName: name.trim(),
          company: company.trim()
        });
        setMessage('¡Cuenta creada! Si necesitas confirmar tu correo, revisa tu bandeja de entrada. Tu ruta quedará vinculada a esta cuenta.');
        if (inviteToken) {
          try {
            await claimCompanyInvitation(inviteToken);
            setMessage('Cuenta creada y acceso a la empresa aceptado.');
          } catch (invitationError) {
            console.error('Error claiming invitation after signup:', invitationError);
          }
        }
        if (hasPermanentAccount) navigate(nextPath, { replace: true });
      } else {
        await signInWithEmail(email.trim(), password);
        if (inviteToken) await claimCompanyInvitation(inviteToken);
      }
    } catch (authError: any) {
      const msg = authError?.message || '';
      if (mode === 'signup' && (msg.toLowerCase().includes('user already registered') || msg.toLowerCase().includes('already exists'))) {
        setMode('signin');
        setError('Este correo ya está registrado. Ingresa tu contraseña o usa el enlace mágico para acceder.');
      } else {
        setError(getAuthMessage(authError));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const sendMagicLink = async () => {
    setError(null);
    setMessage(null);
    if (!isSupabaseConfigured) {
      setError('El sistema de acceso no está configurado. Contacta al administrador.');
      return;
    }
    if (!email.trim()) {
      setError('Escribe tu correo electrónico primero para enviarte el enlace.');
      return;
    }
    setSubmitting(true);
    try {
      await signInWithMagicLink(email.trim());
      setMessage(`✅ Enlace enviado a ${email.trim()}. Revisa tu correo (y la carpeta de spam) para acceder en 1 clic.`);
    } catch (authError) {
      setError(getAuthMessage(authError));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Escribe tu correo electrónico arriba para enviarte el enlace de recuperación.');
      return;
    }
    setError(null);
    setMessage(null);
    setSubmitting(true);
    try {
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth`
      });
      if (resetErr) throw resetErr;
      setMessage(`¡Enlace de recuperación enviado! Revisa tu bandeja en ${email.trim()}.`);
    } catch (authError) {
      setError(getAuthMessage(authError));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-dark-bg text-white flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600 rounded-full mix-blend-screen filter blur-[140px] opacity-15 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 rounded-full mix-blend-screen filter blur-[140px] opacity-10" />
      </div>

      <section className="relative z-10 w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl mb-4 shadow-lg hover:opacity-90 transition"
          >
            <span className="text-2xl">🚀</span>
          </button>
          <h1 className="text-2xl font-black text-white">
            {mode === 'signup' ? 'Crea tu cuenta gratis' : 'Bienvenido de vuelta'}
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            {mode === 'signup'
              ? 'Guarda tu ruta de escalabilidad y accede al contenido completo'
              : 'Ingresa para continuar con tu plan de crecimiento'}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-700/80 bg-dark-secondary/80 backdrop-blur-xl p-6 shadow-2xl">
          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tu nombre</label>
                  <input
                    aria-label="Nombre"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Nombre completo"
                    className="w-full rounded-xl bg-dark-bg border border-gray-700 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">Tu empresa</label>
                  <input
                    aria-label="Empresa"
                    required
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="Nombre de tu empresa"
                    className="w-full rounded-xl bg-dark-bg border border-gray-700 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">Correo electrónico</label>
              <input
                aria-label="Correo electrónico"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className="w-full rounded-xl bg-dark-bg border border-gray-700 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-300">Contraseña</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={submitting}
                    className="text-xs text-violet-400 hover:text-violet-300 hover:underline transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                )}
              </div>
              <input
                aria-label="Contraseña"
                type="password"
                minLength={6}
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : 'Tu contraseña'}
                className="w-full rounded-xl bg-dark-bg border border-gray-700 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            <button
              disabled={submitting}
              className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3.5 font-bold text-white hover:opacity-95 transition disabled:opacity-50 shadow-lg mt-2"
            >
              {submitting ? 'Procesando...' : mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión'}
            </button>
          </form>

          {/* Separador */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-xs text-gray-500">o accede sin contraseña</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* Magic Link */}
          <button
            type="button"
            disabled={submitting}
            onClick={sendMagicLink}
            className="w-full rounded-xl border border-gray-600 bg-dark-bg/50 px-4 py-3 text-sm text-gray-200 hover:border-cyan-500 hover:text-cyan-300 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            <span>✉️</span>
            Enviarme un enlace mágico al correo
          </button>

          {message && (
            <p role="status" className="mt-4 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
              {message}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-4 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
              {error}
            </p>
          )}

          <div className="mt-5 pt-4 border-t border-gray-800 text-center">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'signup' ? 'signin' : 'signup');
                setError(null);
                setMessage(null);
              }}
              className="text-sm text-cyan-300 hover:text-white hover:underline transition-colors"
            >
              {mode === 'signup' ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Créala gratis'}
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-gray-600 mt-4">
          Al continuar, aceptas los términos de uso y la política de privacidad.
        </p>
      </section>
    </main>
  );
};

export default AuthPage;
