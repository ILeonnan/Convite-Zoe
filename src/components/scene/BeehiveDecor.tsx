'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function BeehiveDecor() {
  const reduced = useReducedMotion();

  // Quando beehive.png estiver disponível em /public, basta descomentar
  // Por enquanto renderiza null até o asset existir
  return null;

  /* return (
    <div
      className="fixed top-0 right-0 pointer-events-none select-none"
      style={{ zIndex: 15, width: 'clamp(80px, 24vw, 140px)', paddingTop: 'clamp(60px, 16vw, 110px)', paddingRight: 0 }}
    >
      <motion.img
        src="/beehive.png"
        alt=""
        draggable={false}
        className="w-full h-auto object-contain"
        animate={reduced ? {} : { y: [0, -5, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  ); */
}
