'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function BackgroundScene() {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none select-none"
      style={{ zIndex: 0, transformOrigin: 'center center', overflow: 'hidden' }}
      animate={reduced ? {} : {
        scale: [1, 1.018, 1],
      }}
      transition={{
        duration: 9,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <img
        src="/background-sky.png"
        alt=""
        draggable={false}
        className="w-full h-full object-cover"
        style={{ objectPosition: '75% top' }}
      />
    </motion.div>
  );
}
