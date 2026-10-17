import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BUSINESS_AREAS } from '../types';
import { motion } from 'framer-motion';
import { MobileBottomNavigation } from '../components/mobile/MobileBottomNavigation';

const ModulesPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-20 pt-4 px-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Módulos de Aprendizaje</h1>
        <p className="text-gray-400 text-sm">Explora los 8 pilares de escalamiento</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {BUSINESS_AREAS.map((area, idx) => (
          <motion.div
            key={area.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => navigate(`/area/${area.id}`)}
            className="bg-dark-secondary border border-gray-800 rounded-2xl p-4 hover:border-violet/50 transition-all cursor-pointer"
          >
            <div className="text-3xl mb-3">{area.icon}</div>
            <h3 className="font-bold text-white mb-1">{area.name}</h3>
            <p className="text-xs text-gray-400 mb-3">{area.description}</p>
            
            <div className="text-xs text-violet font-medium">
              Ver módulos →
            </div>
          </motion.div>
        ))}
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation />
    </div>
  );
};

export default ModulesPage;
