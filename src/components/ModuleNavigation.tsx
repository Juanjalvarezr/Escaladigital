import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BUSINESS_AREAS } from '../types';

interface ModuleNavigationProps {
  completedModules: string[];
  currentModule?: string;
}

export const ModuleNavigation: React.FC<ModuleNavigationProps> = ({ 
  completedModules, 
  currentModule 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleModuleClick = (moduleId: string) => {
    const areaId = moduleId.includes('-') ? moduleId.split('-')[0] : moduleId;
    navigate(`/area/${areaId}`);
  };

  return (
    <nav className="bg-dark-secondary border-t border-gray-700">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-4 gap-2 py-4">
          {BUSINESS_AREAS.map((area) => {
            const isCompleted = completedModules.includes(area.id);
            const isCurrent = currentModule === area.id || location.pathname.includes(area.id);
            
            return (
              <button
                key={area.id}
                onClick={() => handleModuleClick(area.id)}
                className={`
                  relative p-3 rounded-lg transition-all duration-200 flex flex-col items-center space-y-2
                  ${isCurrent 
                    ? 'bg-violet/20 border-2 border-violet shadow-lg shadow-violet/20' 
                    : isCompleted
                    ? 'bg-green-500/10 border-2 border-green-500/30 hover:bg-green-500/20'
                    : 'bg-dark-tertiary border-2 border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                  }
                `}
              >
                <div className="relative">
                  <span className="text-2xl">{area.icon}</span>
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-300 text-center leading-tight">
                  {area.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export const ModuleSidebar: React.FC<ModuleNavigationProps> = ({ 
  completedModules, 
  currentModule 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleModuleClick = (moduleId: string) => {
    const areaId = moduleId.includes('-') ? moduleId.split('-')[0] : moduleId;
    navigate(`/area/${areaId}`);
  };

  return (
    <aside className="w-64 bg-dark-secondary border-r border-gray-700 min-h-screen">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-white mb-6">Áreas de Crecimiento</h2>
        
        <div className="space-y-2">
          {BUSINESS_AREAS.map((area) => {
            const isCompleted = completedModules.includes(area.id);
            const isCurrent = currentModule === area.id || location.pathname.includes(area.id);
            
            return (
              <button
                key={area.id}
                onClick={() => handleModuleClick(area.id)}
                className={`
                  w-full p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 text-left
                  ${isCurrent 
                    ? 'bg-violet/20 border-2 border-violet shadow-lg shadow-violet/20' 
                    : isCompleted
                    ? 'bg-green-500/10 border-2 border-green-500/30 hover:bg-green-500/20'
                    : 'bg-dark-tertiary border-2 border-gray-600 hover:border-gray-500 hover:bg-gray-700/50'
                  }
                `}
              >
                <span className="text-xl">{area.icon}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{area.name}</div>
                  {isCompleted && (
                    <div className="text-xs text-green-400">Completado</div>
                  )}
                </div>
                {isCompleted && (
                  <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
