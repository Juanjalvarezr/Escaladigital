import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  color: string;
  shape: 'square' | 'circle' | 'star';
}

interface ConfettiCelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
  message?: string;
  submessage?: string;
}

const COLORS = ['#00C3FF', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899', '#3B82F6'];

export const ConfettiCelebration: React.FC<ConfettiCelebrationProps> = ({
  trigger,
  onComplete,
  message = '¡Objetivo Desbloqueado!',
  submessage = '+50 XP sumados a tu perfil de líder'
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!trigger) return;

    const generated: Particle[] = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.7) * 500,
      scale: Math.random() * 0.8 + 0.4,
      rotation: Math.random() * 360,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: Math.random() > 0.5 ? 'square' : Math.random() > 0.5 ? 'circle' : 'star'
    }));

    setParticles(generated);
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 2800);

    return () => clearTimeout(timer);
  }, [trigger, onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
          {/* Confetti Particles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0, rotate: 0 }}
                animate={{
                  x: p.x,
                  y: p.y,
                  opacity: 0,
                  scale: p.scale,
                  rotate: p.rotation + 360
                }}
                transition={{
                  duration: 2.2,
                  ease: [0.25, 1, 0.5, 1]
                }}
                style={{
                  position: 'absolute',
                  backgroundColor: p.color,
                  width: p.shape === 'square' ? '12px' : '10px',
                  height: p.shape === 'square' ? '12px' : '10px',
                  borderRadius: p.shape === 'circle' ? '50%' : '2px',
                  boxShadow: `0 0 10px ${p.color}`
                }}
              />
            ))}
          </div>

          {/* Banner central de celebración */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200 }}
            className="bg-dark-secondary/90 backdrop-blur-xl border border-electric-blue/40 shadow-[0_0_50px_rgba(0,195,255,0.3)] rounded-2xl p-6 text-center max-w-sm mx-4 relative pointer-events-auto"
          >
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-tr from-electric-blue to-violet rounded-full flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(139,92,246,0.5)]">
              🎉
            </div>
            <h4 className="text-xl font-extrabold text-white mb-1">{message}</h4>
            <p className="text-sm text-gray-300">{submessage}</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfettiCelebration;
