'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function FlowerGardenBottom() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="absolute bottom-0 left-0 w-full pointer-events-none overflow-hidden z-25 select-none">
      <motion.div
        animate={shouldReduceMotion ? {} : {
          y: [0, 4, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
        className="w-full"
      >
        <img
          src="/flower-garden-bottom.png"
          alt="Jardim em Aquarela da Zoe no Rodapé"
          className="w-full h-auto object-contain"
        />
      </motion.div>
    </div>
  );
}
