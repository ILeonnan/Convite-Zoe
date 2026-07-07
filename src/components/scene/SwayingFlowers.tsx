'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function SwayingFlowers() {
  const reduced = useReducedMotion();

  return (
    <div
      className="fixed bottom-0 left-0 w-full pointer-events-none select-none"
      style={{ zIndex: 10 }}
    >
      {/* Camada principal — balanço principal */}
      <motion.img
        src="/flower-garden-bottom.png"
        alt=""
        draggable={false}
        className="w-full h-auto block"
        style={{
          objectFit: 'cover',
          objectPosition: 'top',
          transformOrigin: 'bottom center',
        }}
        animate={reduced ? {} : {
          rotate: [-1.2, 1.2, -0.6, 1.0, -1.2],
          x: [-4, 4, -2, 3, -4],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Camada de sombra/eco — defasada, cria profundidade de vento */}
      <motion.img
        src="/flower-garden-bottom.png"
        alt=""
        draggable={false}
        className="w-full h-auto block absolute bottom-0 left-0"
        style={{
          objectFit: 'cover',
          objectPosition: 'top',
          transformOrigin: 'bottom center',
          opacity: 0.35,
          filter: 'blur(2px)',
        }}
        animate={reduced ? {} : {
          rotate: [1.0, -1.4, 0.8, -1.0, 1.0],
          x: [3, -5, 2, -3, 3],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.6,
        }}
      />
    </div>
  );
}
