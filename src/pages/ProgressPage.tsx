import React from 'react';
import { useLearningStore } from '../stores/useLearningStore';
import { ExpandableCard } from '../components/mobile/ExpandableCard';
import { MobileBottomNavigation } from '../components/mobile/MobileBottomNavigation';
import { motion } from 'framer-motion';

const ProgressPage: React.FC = () => {
  const { 
    xp, 
    streakDays, 
    businessLevel, 
    learningTimeline, 
    badges
  } = useLearningStore();

  const unlockedBadges = badges.filter(b => b.unlockedAt);

  return (
    <div className="min-h-screen bg-dark-bg text-white pb-20 pt-4 px-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Tu Progreso</h1>
        <p className="text-gray-400 text-sm">Sigue tu evolución en el tiempo</p>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-dark-secondary border border-gray-800 rounded-2xl p-4 text-center"
        >
          <div className="text-3xl font-black text-electric-blue">{xp}</div>
          <div className="text-xs text-gray-400 mt-1">XP Total</div>
        </motion.div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-secondary border border-gray-800 rounded-2xl p-4 text-center"
        >
          <div className="text-3xl font-black text-emerald-400">{streakDays} 🔥</div>
          <div className="text-xs text-gray-400 mt-1">Días Racha</div>
        </motion.div>
      </div>

      {/* Level Card */}
      <ExpandableCard 
        title={`Nivel ${businessLevel.level}: ${businessLevel.title}`} 
        icon={businessLevel.badge}
        defaultExpanded={true}
        className="mb-4"
      >
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">XP Actual</span>
            <span className="text-white font-bold">{xp} XP</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Siguiente Nivel</span>
            <span className="text-violet font-bold">{businessLevel.nextLevelXp} XP</span>
          </div>
          <div className="bg-dark-bg rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(xp / businessLevel.nextLevelXp) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-violet to-electric-blue"
            />
          </div>
        </div>
      </ExpandableCard>

      {/* Badges */}
      <ExpandableCard 
        title={`Insignias (${unlockedBadges.length}/${badges.length})`} 
        icon="🏆"
        className="mb-4"
      >
        <div className="grid grid-cols-3 gap-3">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`flex flex-col items-center p-3 rounded-xl border text-center ${
                badge.unlockedAt
                  ? 'border-amber-400/40 bg-amber-400/10'
                  : 'border-gray-800 bg-dark-secondary opacity-40 grayscale'
              }`}
            >
              <span className="text-2xl mb-1">{badge.emoji}</span>
              <span className="text-[10px] font-bold text-gray-300">{badge.name}</span>
            </div>
          ))}
        </div>
      </ExpandableCard>

      {/* Timeline */}
      {learningTimeline.length > 0 && (
        <ExpandableCard 
          title="Timeline de Aprendizaje" 
          icon="📅"
        >
          <div className="space-y-3">
            {learningTimeline.slice(0, 10).map((event) => (
              <div key={event.id} className="flex items-center space-x-3 p-2 bg-dark-bg/50 rounded-lg">
                <span className="text-xl">{event.emoji}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">{event.label}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString('es', { day: '2-digit', month: 'short' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ExpandableCard>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNavigation />
    </div>
  );
};

export default ProgressPage;
