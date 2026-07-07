'use client';

import { motion, useReducedMotion } from 'framer-motion';

// Bee 1 — voa da esquerda para direita em arco suave (topo da tela)
function BeeTopFlight({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ top: '6vh', left: 0, width: 100, height: 100 }}
      animate={shouldReduceMotion ? {} : {
        x: ['0vw', '25vw', '55vw', '78vw', '88vw', '78vw', '55vw', '25vw', '0vw'],
        y: [0, -22, -10, -28, 0, 22, 12, 26, 0],
        rotate: [0, 6, -3, 7, -5, 4, -6, 5, 0],
        scaleX: [1, 1, 1, 1, -1, -1, -1, -1, 1],
      }}
      transition={{
        duration: 22,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 0,
        times: [0, 0.12, 0.30, 0.48, 0.52, 0.64, 0.78, 0.90, 1],
      }}
    >
      <img
        src="/bee1.png"
        alt="Abelhinha da Zoe voando"
        className="w-full h-full object-contain drop-shadow-[0_4px_16px_rgba(234,183,93,0.5)]"
        draggable={false}
      />
    </motion.div>
  );
}

// Bee 2 — voa em curva pelo meio da tela (começa da direita)
function BeeMiddleFlight({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ top: '32vh', right: 0, width: 88, height: 88 }}
      animate={shouldReduceMotion ? {} : {
        x: ['0vw', '-18vw', '-45vw', '-70vw', '-82vw', '-70vw', '-45vw', '-18vw', '0vw'],
        y: [0, 24, -12, 32, 0, -24, 12, -18, 0],
        rotate: [0, -7, 5, -6, 4, -5, 7, -4, 0],
        scaleX: [-1, -1, -1, -1, 1, 1, 1, 1, -1],
      }}
      transition={{
        duration: 26,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 6,
        times: [0, 0.12, 0.30, 0.48, 0.52, 0.64, 0.78, 0.90, 1],
      }}
    >
      <img
        src="/bee2.png"
        alt="Abelhinha com pegador de mel"
        className="w-full h-full object-contain drop-shadow-[0_4px_16px_rgba(234,183,93,0.5)]"
        draggable={false}
      />
    </motion.div>
  );
}

// Bee 3 — voa baixinho perto das flores, trajetória curta
function BeeFlowerFlight({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none"
      style={{ bottom: '28vh', left: '4vw', width: 72, height: 72 }}
      animate={shouldReduceMotion ? {} : {
        x: [0, 40, 110, 190, 240, 190, 110, 40, 0],
        y: [0, -18, 8, -14, 0, 16, -8, 14, 0],
        rotate: [0, 5, -3, 6, -4, 3, -5, 4, 0],
        scaleX: [1, 1, 1, 1, -1, -1, -1, -1, 1],
      }}
      transition={{
        duration: 18,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: 2.5,
        times: [0, 0.12, 0.30, 0.48, 0.52, 0.64, 0.78, 0.90, 1],
      }}
    >
      <img
        src="/bee3.png"
        alt="Abelhinha perto das flores"
        className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(234,183,93,0.4)]"
        draggable={false}
      />
    </motion.div>
  );
}

export default function AnimatedBees() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden select-none" style={{ zIndex: 35 }}>
      <BeeTopFlight shouldReduceMotion={shouldReduceMotion} />
      <BeeMiddleFlight shouldReduceMotion={shouldReduceMotion} />
      <BeeFlowerFlight shouldReduceMotion={shouldReduceMotion} />
    </div>
  );
}
