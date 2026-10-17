import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguageStore } from '../../stores/useLanguageStore';

export const LanguageToggle: React.FC = () => {
  const { lang, setLang } = useLanguageStore();

  return (
    <button
      onClick={() => setLang(lang === 'es' ? 'en' : 'es')}
      title={lang === 'es' ? 'Switch to English' : 'Cambiar a Español'}
      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-gray-700 hover:border-gray-500 bg-dark-secondary hover:bg-dark-tertiary transition-all text-xs font-bold text-gray-300 hover:text-white"
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={lang}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          className="text-sm"
        >
          {lang === 'es' ? '🇨🇴' : '🇺🇸'}
        </motion.span>
      </AnimatePresence>
      <span>{lang === 'es' ? 'ES' : 'EN'}</span>
    </button>
  );
};

export default LanguageToggle;
