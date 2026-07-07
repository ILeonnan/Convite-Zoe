'use client';

import { motion } from 'framer-motion';
import { EVENT } from '@/lib/eventInfo';

export default function InviteText() {
  return (
    <motion.div
      className="w-full flex flex-col items-center text-center"
      style={{ paddingLeft: 'clamp(24px, 7vw, 44px)', paddingRight: 'clamp(24px, 7vw, 44px)' }}
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
        <span style={{ color: '#E8891A', fontWeight: 800, fontSize: 'clamp(44px, 13vw, 64px)', lineHeight: 1, letterSpacing: '-0.01em' }}>Zoe.</span>
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

      {/* Data e hora do evento */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        style={{
          marginTop: 'clamp(14px, 3.5vh, 22px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          whiteSpace: 'nowrap',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'linear-gradient(135deg, rgba(255,217,90,0.22) 0%, rgba(232,137,26,0.15) 100%)',
          border: '1.5px solid rgba(232,137,26,0.38)',
          borderRadius: 999,
          padding: '10px 20px',
          boxShadow: '0 2px 12px rgba(232,137,26,0.1)',
        }}>
          <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 'clamp(13px, 3.8vw, 15px)', color: '#3D1800' }}>
            {EVENT.dateShort}
          </span>
          <span style={{ color: 'rgba(184,101,10,0.4)', fontWeight: 300, fontSize: 14 }}>·</span>
          <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 600, fontSize: 'clamp(12px, 3.4vw, 14px)', color: '#B8650A' }}>
            {EVENT.weekday}
          </span>
          <span style={{ color: 'rgba(184,101,10,0.4)', fontWeight: 300, fontSize: 14 }}>·</span>
          <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(13px, 3.8vw, 15px)', color: '#E8891A' }}>
            {EVENT.time}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
