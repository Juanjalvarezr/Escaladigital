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
    return 'bg-gray-300';
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
    >
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
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progreso</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`${getProgressColor()} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Lecciones</div>
            <div className="font-semibold">
              {progress.completedLessons}/{progress.totalLessons}
            </div>
          </div>
          <div>
            <div className="text-gray-600">Quizzes</div>
            <div className="font-semibold">
              {progress.completedQuizzes}/{progress.totalQuizzes}
            </div>
          </div>
        </div>

        <button className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition-colors text-sm font-medium">
          {completionPercentage > 0 ? 'Continuar' : 'Comenzar'}
        </button>
      </div>
    </div>
  );
};

export default AreaCard;
