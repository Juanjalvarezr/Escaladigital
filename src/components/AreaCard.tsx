import React from 'react';
import { BusinessArea } from '../types';

interface AreaCardProps {
  area: BusinessArea;
  progress: {
    completedLessons: number;
    totalLessons: number;
    completedQuizzes: number;
    totalQuizzes: number;
  };
  onClick: () => void;
}

const AreaCard: React.FC<AreaCardProps> = ({ area, progress, onClick }) => {
  const completionPercentage = Math.round(
    ((progress.completedLessons + progress.completedQuizzes) / 
     (progress.totalLessons + progress.totalQuizzes)) * 100
  );

  const getProgressColor = () => {
    if (completionPercentage >= 75) return 'bg-green-500';
    if (completionPercentage >= 50) return 'bg-blue-500';
    if (completionPercentage >= 25) return 'bg-yellow-500';
    return 'bg-gray-600';
  };

  return (
    <article className="bg-dark-secondary border border-gray-800 rounded-2xl shadow-lg shadow-black/20 hover:border-violet/50 hover:shadow-violet/10 hover:shadow-xl transition-all overflow-hidden group">
      {/* Header */}
      <div className={`${area.color} p-4`}>
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h3 className="font-bold text-lg">{area.name}</h3>
            <p className="text-sm opacity-90">{area.description}</p>
          </div>
          <div className="text-white text-2xl">
            {area.icon}
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="p-4">
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>Progreso del pilar</span>
            <span className="text-white font-semibold">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-dark-bg rounded-full h-2 border border-gray-800">
            <div
              className={`${getProgressColor()} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-400">Lecciones</div>
            <div className="font-semibold text-white">
              {progress.completedLessons}/{progress.totalLessons}
            </div>
          </div>
          <div>
            <div className="text-gray-400">Quizzes</div>
            <div className="font-semibold text-white">
              {progress.completedQuizzes}/{progress.totalQuizzes}
            </div>
          </div>
        </div>

        <button onClick={onClick} className="mt-4 w-full bg-dark-tertiary hover:bg-violet/20 text-gray-200 hover:text-white border border-gray-700 hover:border-violet/50 py-2.5 px-4 rounded-xl transition-colors text-sm font-semibold">
          {completionPercentage > 0 ? 'Continuar' : 'Comenzar'}
        </button>
      </div>
      </article>
  );
};

export default AreaCard;
