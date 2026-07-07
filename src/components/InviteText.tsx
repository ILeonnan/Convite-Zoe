'use client';

import { motion } from 'framer-motion';

export default function InviteText() {
  return (
    <motion.div
      className="w-full flex flex-col items-center text-center"
      style={{ paddingLeft: 'clamp(28px, 8vw, 48px)', paddingRight: 'clamp(52px, 22vw, 90px)' }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.34, 1.1, 0.64, 1] }}
    >
      <motion.p
        style={{ fontSize: 'clamp(11px, 3vw, 14px)', letterSpacing: '0.3em', color: '#B8650A', marginBottom: 'clamp(6px, 1.5vh, 10px)', fontFamily: 'var(--font-outfit)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }}
      >
        ✦ · · · ✦
      </motion.p>

      <motion.h1
        style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(26px, 7.5vw, 36px)', fontWeight: 700, fontStyle: 'italic', color: '#3D1F00', lineHeight: 1.2, marginBottom: 4, textShadow: '0 2px 12px rgba(255,190,40,0.3)' }}
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.55, duration: 0.7, ease: [0.34, 1.1, 0.64, 1] }}
      >
        Você foi convidado
      </motion.h1>

      <motion.h2
        style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(16px, 4.6vw, 21px)', fontWeight: 400, fontStyle: 'italic', color: '#7A4200', lineHeight: 1.35, marginBottom: 'clamp(10px, 2.5vh, 14px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75, duration: 0.6 }}
      >
        para celebrar o{' '}
        <span style={{ color: '#E8891A', fontWeight: 700 }}>1º Aninho</span>
        {' '}da nossa{' '}
        <span style={{ color: '#E8891A', fontWeight: 700 }}>Zoe!</span>
      </motion.h2>

      <motion.div
        style={{ width: 'clamp(50px, 16vw, 80px)', height: 1.5, background: 'linear-gradient(to right, transparent, #E8891A, transparent)', marginBottom: 'clamp(10px, 2.5vh, 14px)' }}
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.9, duration: 0.6 }}
      />

      <motion.p
        style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(15px, 4.2vw, 18px)', fontStyle: 'italic', color: '#5C3200', lineHeight: 1.7, fontWeight: 400 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0, duration: 0.7 }}
      >
        Com o coração cheio de amor e mel,{' '}
        a nossa abelhinha está fazendo um aninho{' '}
        e quer muito contar com a{' '}
        <em style={{ color: '#E8891A' }}>sua presença</em>{' '}
        para celebrar essa data tão especial 🌸
      </motion.p>
    </motion.div>
  );
}
