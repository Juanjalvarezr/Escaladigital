import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LessonNavigationProps {
  areaId: string;
  moduleId: string;
  currentLessonId: string;
  hasNext: boolean;
  hasPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onComplete: () => void;
  progress: number;
}

const LessonNavigation: React.FC<LessonNavigationProps> = ({
  areaId,
  moduleId,
  currentLessonId,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  onComplete,
  progress
}) => {
  const navigate = useNavigate();

  const handleBackToModule = () => {
    navigate(`/area/${areaId}/module/${moduleId}`);
  };

  const handleBackToArea = () => {
    navigate(`/area/${areaId}`);
  };

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progreso de la lección</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Breadcrumb Navigation */}
          <button
            onClick={handleBackToArea}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Área
          </button>
          <span className="text-gray-400">/</span>
          <button
            onClick={handleBackToModule}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Módulo
          </button>
        </div>

        <div className="flex items-center space-x-3">
          {/* Previous Button */}
          <button
            onClick={onPrevious}
            disabled={!hasPrevious}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              hasPrevious
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                : 'bg-gray-50 text-gray-400 cursor-not-allowed'
            }`}
          >
            ← Anterior
          </button>

          {/* Complete/Next Button */}
          {hasNext ? (
            <button
              onClick={onNext}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={onComplete}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Completar Lección ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonNavigation;
