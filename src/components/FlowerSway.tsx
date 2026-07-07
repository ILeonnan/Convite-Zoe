'use client';

import { motion, useReducedMotion } from 'framer-motion';

export default function FlowerSway() {
  const shouldReduceMotion = useReducedMotion();

  const swayTransition = {
    duration: 7,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut" as const,
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {/* Top Left Daisy */}
      <motion.div
        className="absolute -top-6 -left-6 w-24 h-24 origin-top-left"
        animate={shouldReduceMotion ? {} : { rotate: [0, 5, 0, -3, 0] }}
        transition={swayTransition}
      >
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full opacity-60">
          <circle cx="50" cy="50" r="15" fill="#EAB75D" />
          <circle cx="50" cy="25" r="12" fill="#FFFCF7" stroke="#F8C9D8" strokeWidth="1" />
          <circle cx="50" cy="75" r="12" fill="#FFFCF7" stroke="#F8C9D8" strokeWidth="1" />
          <circle cx="25" cy="50" r="12" fill="#FFFCF7" stroke="#F8C9D8" strokeWidth="1" />
          <circle cx="75" cy="50" r="12" fill="#FFFCF7" stroke="#F8C9D8" strokeWidth="1" />
          <circle cx="32" cy="32" r="12" fill="#FFFCF7" stroke="#F8C9D8" strokeWidth="1" />
          <circle cx="68" cy="68" r="12" fill="#FFFCF7" stroke="#F8C9D8" strokeWidth="1" />
          <circle cx="32" cy="68" r="12" fill="#FFFCF7" stroke="#F8C9D8" strokeWidth="1" />
          <circle cx="68" cy="32" r="12" fill="#FFFCF7" stroke="#F8C9D8" strokeWidth="1" />
          <circle cx="50" cy="50" r="10" fill="#F8D66D" />
        </svg>
      </motion.div>

      {/* Bottom Right Daisy */}
      <motion.div
        className="absolute -bottom-6 -right-6 w-28 h-28 origin-bottom-right"
        animate={shouldReduceMotion ? {} : { rotate: [0, -6, 0, 4, 0] }}
        transition={{ ...swayTransition, delay: 1 }}
      >
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full opacity-60">
          <circle cx="50" cy="50" r="15" fill="#EAB75D" />
          <circle cx="50" cy="25" r="12" fill="#FFFCF7" stroke="#F8C9D8" strokeWidth="1" />
          <circle cx="50" cy="75" r="12" fill="#FFFCF7" stroke="#F8C9D8" strokeWidth="1" />
          <circle cx="25" cy="50" r="12" fill="#FFFCF7" stroke="#F8C9D8" strokeWidth="1" />
          <circle cx="75" cy="50" r="12" fill="#FFFCF7" stroke="#F8C9D8" strokeWidth="1" />
          <circle cx="32" cy="32" r="12" fill="#FFFCF7" stroke="#F8C9D8" strokeWidth="1" />
          <circle cx="68" cy="68" r="12" fill="#FFFCF7" stroke="#F8C9D8" strokeWidth="1" />
          <circle cx="32" cy="68" r="12" fill="#FFFCF7" stroke="#F8C9D8" strokeWidth="1" />
          <circle cx="68" cy="32" r="12" fill="#FFFCF7" stroke="#F8C9D8" strokeWidth="1" />
          <circle cx="50" cy="50" r="10" fill="#F8D66D" />
        </svg>
      </motion.div>
    </div>
  );
}
