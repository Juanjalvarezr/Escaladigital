import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface NavItem {
  id: string;
  label: string;
  icon: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Inicio', icon: '🏠', path: '/dashboard' },
  { id: 'modules', label: 'Módulos', icon: '📚', path: '/modules' },
  { id: 'progress', label: 'Progreso', icon: '📊', path: '/progress' },
  { id: 'profile', label: 'Perfil', icon: '👤', path: '/profile' },
];

export const MobileBottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const activePath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-dark-secondary/95 backdrop-blur-lg border-t border-gray-800 z-50 safe-area-bottom">
      <div className="flex justify-around items-center h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activePath === item.path || activePath.startsWith(item.path + '/');
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="flex flex-col items-center justify-center space-y-1 px-3 py-2 min-w-[60px] transition-all relative"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -top-0.5 w-8 h-0.5 bg-gradient-to-r from-electric-blue to-violet rounded-full"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon */}
              <span className={`text-xl transition-transform ${isActive ? 'scale-110' : 'scale-100'}`}>
                {item.icon}
              </span>

              {/* Label */}
              <span className={`text-[10px] font-medium transition-colors ${
                isActive ? 'text-white' : 'text-gray-500'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNavigation;
