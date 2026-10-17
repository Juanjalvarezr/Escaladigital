import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Lang = 'es' | 'en';

interface LanguageStore {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (es: string, en: string) => string;
}

export const useLanguageStore = create<LanguageStore>()(
  persist(
    (set, get) => ({
      lang: 'es',
      setLang: (lang) => set({ lang }),
      t: (es, en) => (get().lang === 'es' ? es : en),
    }),
    { name: 'escala-lang' }
  )
);
