'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function FlowersBottom() {
  const reduced = useReducedMotion();

  return (
    <div
      className="fixed bottom-0 left-0 w-full pointer-events-none select-none"
      style={{ zIndex: 20 }}
    >
      <motion.img
        src="/flower-garden-bottom.png"
        alt=""
        draggable={false}
        className="w-full h-auto object-cover object-top"
        style={{ display: 'block' }}
        animate={reduced ? {} : { y: [0, 4, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </div>
  );
}
