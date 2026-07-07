'use client';

import { motion } from 'framer-motion';

interface InviteHeroProps {
  familyName: string;
}

export default function InviteHero({ familyName }: InviteHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="bg-daisy-white border border-rose-cream/40 p-8 rounded-3xl shadow-sm text-center space-y-4"
    >
      <span className="text-xs font-bold tracking-widest text-golden-honey uppercase block">
        DOCE COLMEIA DA ZOE
      </span>
      <h1 className="font-title text-4xl text-soft-brown font-bold leading-tight">
        Zoe Faz 1 Aninho! 🐝
      </h1>
      <p className="text-soft-brown/80 leading-relaxed text-sm md:text-base">
        A pequena Zoe está prestes a completar seu primeiro aninho, e sua família foi convidada para celebrar esse momento tão especial conosco.
      </p>
      <div className="pt-4 border-t border-rose-cream/20">
        <h2 className="font-title text-2xl text-golden-honey font-semibold">
          Olá, {familyName}!
        </h2>
      </div>
    </motion.div>
  );
}
