import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface ProfileMenuProps {
  user: SupabaseUser | null;
  onSignOut: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const userName = user?.user_metadata?.name || user?.email || 'Usuario';
  const userAvatar = userName.charAt(0).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 text-sm rounded-lg hover:bg-gray-100 p-2 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
          {userAvatar}
        </div>
        <span className="hidden md:block text-gray-700 font-medium">
          {userName}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-3 border-b border-gray-200">
              <p className="text-sm font-medium text-gray-900">{userName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            
            <div className="py-1">
              <button
                onClick={() => {
                  navigate('/profile');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Mi perfil
              </button>
              <button
                onClick={() => {
                  navigate('/profile');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Configuración
              </button>
              <button
                onClick={() => {
                  navigate('/profile');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Mi progreso
              </button>
            </div>
            
            <div className="py-1 border-t border-gray-200">
              <button
                onClick={() => {
                  onSignOut();
                  setIsOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileMenu;
