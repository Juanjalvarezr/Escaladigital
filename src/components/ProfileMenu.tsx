import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileMenuProps {
  user: SupabaseUser | null;
  onSignOut: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Usuario';
  const userAvatar = userName.charAt(0).toUpperCase();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Menú de usuario: ${userName}`}
        className="flex items-center space-x-2 text-sm rounded-xl p-1.5 hover:bg-dark-tertiary transition-colors border border-transparent hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-violet"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-violet to-electric-blue rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
          {userAvatar}
        </div>
        <span className="hidden md:block text-gray-300 font-semibold text-xs max-w-[120px] truncate">
          {userName}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          ></div>
          <div
            role="menu"
            aria-label="Opciones de perfil"
            className="absolute right-0 mt-2 w-52 bg-dark-secondary rounded-xl shadow-2xl border border-gray-700/80 z-40 overflow-hidden divide-y divide-gray-800"
          >
            <div className="p-3 bg-dark-bg/50">
              <p className="text-xs font-bold text-white truncate">{userName}</p>
              <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
            </div>
            
            <div className="py-1">
              <button
                onClick={() => handleNavigate('/profile?tab=profile')}
                role="menuitem"
                className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-violet/15 transition-colors flex items-center space-x-2"
              >
                <span>👤</span>
                <span>Mi perfil</span>
              </button>
              <button
                onClick={() => handleNavigate('/profile?tab=settings')}
                role="menuitem"
                className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-violet/15 transition-colors flex items-center space-x-2"
              >
                <span>⚙️</span>
                <span>Configuración</span>
              </button>
              <button
                onClick={() => handleNavigate('/progress')}
                role="menuitem"
                className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-violet/15 transition-colors flex items-center space-x-2"
              >
                <span>📊</span>
                <span>Mi progreso</span>
              </button>
              <button
                onClick={() => handleNavigate('/team')}
                role="menuitem"
                className="w-full text-left px-3.5 py-2 text-xs font-medium text-gray-300 hover:text-white hover:bg-violet/15 transition-colors flex items-center space-x-2"
              >
                <span>👥</span>
                <span>Equipo y accesos</span>
              </button>
            </div>
            
            <div className="py-1">
              <button
                onClick={() => {
                  onSignOut();
                  setIsOpen(false);
                }}
                role="menuitem"
                className="w-full text-left px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors flex items-center space-x-2"
              >
                <span>🚪</span>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileMenu;
