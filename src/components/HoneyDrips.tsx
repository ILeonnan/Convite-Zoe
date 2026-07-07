'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function HoneyDrips() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="absolute top-0 left-0 w-full pointer-events-none overflow-hidden z-20 select-none">
      <motion.div
        animate={shouldReduceMotion ? {} : {
          y: [0, -3, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="w-full"
      >
        <img
          src="/honey-top.png"
          alt="Mel escorrendo do topo em Aquarela"
          className="w-full h-auto object-contain drop-shadow-[0_4px_12px_rgba(234,183,93,0.15)]"
          style={{ mixBlendMode: "multiply" }}
        />
      </motion.div>
    </div>
  );
}
