const DIAGNOSTIC_KEY = 'escala:latestDiagnosticResult:v1';
const GUEST_WORKSHOP_KEY = 'escala:guestWorkshop:v1';

export interface GuestWorkshopProgress {
  moduleId: string;
  lessonId: string;
  response: string;
  completed: boolean;
  updatedAt: string;
}

export const getDiagnosticStorageKey = (userId?: string | null) =>
  `${DIAGNOSTIC_KEY}:${userId || 'anonymous'}`;

export const readUserDiagnostic = <T,>(userId?: string | null): T | null => {
  try {
    const raw = window.localStorage.getItem(getDiagnosticStorageKey(userId));
    return raw ? JSON.parse(raw) as T : null;
  } catch (error) {
    console.warn('No se pudo leer el diagnóstico local del usuario', error);
    return null;
  }
};

export const writeUserDiagnostic = (userId: string | null | undefined, value: unknown) => {
  try {
    window.localStorage.setItem(getDiagnosticStorageKey(userId), JSON.stringify(value));
  } catch (error) {
    console.warn('No se pudo guardar el diagnóstico local del usuario', error);
  }
};

export const removeUserDiagnostic = (userId?: string | null) => {
  try {
    window.localStorage.removeItem(getDiagnosticStorageKey(userId));
  } catch (error) {
    console.warn('No se pudo limpiar el diagnóstico local del usuario', error);
  }
};

export const readGuestWorkshopProgress = (): GuestWorkshopProgress | null => {
  try {
    const raw = window.localStorage.getItem(GUEST_WORKSHOP_KEY);
    return raw ? JSON.parse(raw) as GuestWorkshopProgress : null;
  } catch (error) {
    console.warn('No se pudo leer el avance del taller visitante', error);
    return null;
  }
};

export const writeGuestWorkshopProgress = (progress: GuestWorkshopProgress) => {
  try {
    window.localStorage.setItem(GUEST_WORKSHOP_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn('No se pudo guardar el avance del taller visitante', error);
  }
};
