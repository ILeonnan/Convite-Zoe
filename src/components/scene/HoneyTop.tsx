'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function HoneyTop() {
  const reduced = useReducedMotion();

  return (
    <div
      className="fixed top-0 left-0 w-full pointer-events-none select-none"
      style={{ zIndex: 20 }}
    >
      <motion.img
        src="/honey-top.png"
        alt=""
        draggable={false}
        className="w-full h-auto object-cover object-bottom"
        style={{ display: 'block' }}
        animate={reduced ? {} : { y: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
