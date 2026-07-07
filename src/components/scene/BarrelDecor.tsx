'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function BarrelDecor() {
  const reduced = useReducedMotion();

  return (
    <div
      className="fixed bottom-0 right-0 pointer-events-none select-none"
      style={{ zIndex: 30 }}
    >
      <motion.img
        src="/honey-jar.png"
        alt=""
        draggable={false}
        // clamp garante escala proporcional em qualquer tela
        style={{
          width: 'clamp(80px, 22vw, 130px)',
          marginBottom: 'clamp(52px, 15vw, 110px)',
          marginRight: 'clamp(6px, 3vw, 18px)',
          display: 'block',
        }}
        className="h-auto object-contain"
        animate={reduced ? {} : { y: [0, -5, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
      />
    </div>
  );
}
