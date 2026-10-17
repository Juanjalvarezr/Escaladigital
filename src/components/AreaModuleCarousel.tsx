import React, { useState } from 'react';
import AreaModuleCard from './AreaModuleCard';
import '../styles/mobileEducation.css';

interface AreaModuleCarouselProps {
  items: Array<{ phase: string; description: string; priority: 'high' | 'medium' | 'low'; checklist?: any[]; kpis?: any[]; topics?: string[] }>;
}

const AreaModuleCarousel: React.FC<AreaModuleCarouselProps> = ({ items }) => {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % items.length);
  const prev = () => setCurrent((c) => (c - 1 + items.length) % items.length);

  if (items.length === 0) return null;

  return (
    <div className="education-module-carousel w-full flex flex-col items-center">
      <div className="education-module-carousel__viewport w-full max-w-xs">
        <AreaModuleCard
          phase={items[current].phase}
          description={items[current].description}
          priority={items[current].priority}
          checklist={items[current].checklist}
          kpis={items[current].kpis}
          topics={items[current].topics}
        />
      </div>
      <div className="education-module-carousel__controls flex justify-between w-full max-w-xs mt-4">
        <button
          type="button"
          aria-label="Módulo anterior"
          className="education-module-carousel__button px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700 transition"
          onClick={prev}
        >
          ◀
        </button>
        <span className="education-module-carousel__status text-blue-800 font-semibold" aria-live="polite">
          {current + 1} / {items.length}
        </span>
        <button
          type="button"
          aria-label="Siguiente módulo"
          className="education-module-carousel__button px-4 py-2 bg-blue-500 text-white rounded-lg shadow hover:bg-blue-700 transition"
          onClick={next}
        >
          ▶
        </button>
      </div>
    </div>
  );
};

export default AreaModuleCarousel;
