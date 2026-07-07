'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function FlyingBee() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="fixed pointer-events-none select-none"
      style={{
        top: 'clamp(60px, 14vh, 120px)',
        left: 'clamp(8px, 3vw, 24px)',
        width: 'clamp(80px, 22vw, 120px)',
        height: 'clamp(80px, 22vw, 120px)',
        zIndex: 45,
      }}
      animate={reduced ? {} : {
        x: [0, 14, 6, -8, 0],
        y: [0, -18, -8, 6, 0],
        rotate: [-4, 4, -2, 3, -4],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <img
        src="/bee.png"
        alt="Abelhinha voando"
        draggable={false}
        className="w-full h-full object-contain"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(234,183,93,0.5))' }}
      />
    </motion.div>
  );
}
