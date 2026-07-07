'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Props {
  onOpen: () => void;
}

export default function VideoIntro({ onOpen }: Props) {
  const [buttonVisible, setButtonVisible] = useState(false);
  const [clicking, setClicking] = useState(false);

  // Botão aparece 1.5s após o vídeo começar
  useEffect(() => {
    const t = setTimeout(() => setButtonVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  function handleClick() {
    if (clicking) return;
    setClicking(true);
    onOpen();
  }

  return (
    <div className="fixed inset-0 bg-black" style={{ zIndex: 100 }}>
      {/* VIDEO */}
      <video
        src="/Abertura.mp4"
        autoPlay
        muted
        playsInline
        loop
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradiente escuro na base para o botão respirar */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '45%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)',
        }}
      />

      {/* BOTÃO "ABRIR CONVITE" */}
      <AnimatePresence>
        {buttonVisible && (
          <motion.div
            className="absolute inset-x-0 bottom-0 flex flex-col items-center"
            style={{ paddingBottom: 'clamp(40px, 12vh, 72px)' }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <button
              onClick={handleClick}
              disabled={clicking}
              className="relative overflow-hidden rounded-full select-none"
              style={{
                padding: 'clamp(14px, 4vw, 18px) clamp(36px, 12vw, 56px)',
                background: 'linear-gradient(135deg, #FFD95A 0%, #F5A623 50%, #E8891A 100%)',
                boxShadow: '0 0 32px rgba(245,166,35,0.7), 0 8px 32px rgba(0,0,0,0.3)',
                border: '2px solid rgba(255,255,255,0.35)',
              }}
            >
              {/* Shimmer sweep */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.45) 50%, transparent 65%)',
                  backgroundSize: '200% 100%',
                }}
                animate={{ backgroundPosition: ['-100% 0', '200% 0'] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.5, ease: 'easeInOut' }}
              />

              {/* Anel pulsante externo */}
              <motion.div
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ border: '2px solid rgba(255,217,90,0.6)' }}
                animate={{ scale: [1, 1.15, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              />

              {/* Layout 3 colunas: [abelha | texto central | espaço espelho] */}
              <span className="flex items-center w-full" style={{ gap: 0 }}>
                {/* Coluna esquerda: abelhinha */}
                <motion.img
                  src="/bee1.png"
                  alt=""
                  draggable={false}
                  style={{ width: 46, height: 46, objectFit: 'contain', flexShrink: 0 }}
                  animate={{ y: [0, -5, 0], rotate: [-6, 6, -6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                {/* Coluna central: texto centralizado */}
                <span
                  className="flex-1 text-center font-semibold tracking-wide"
                  style={{
                    fontSize: 'clamp(19px, 5.5vw, 24px)',
                    color: '#5C3A0A',
                    fontFamily: 'var(--font-outfit)',
                    letterSpacing: '0.04em',
                    textShadow: '0 1px 0 rgba(255,255,255,0.4)',
                  }}
                >
                  Abrir Convite
                </span>
                {/* Coluna direita: espaço espelho da abelha para balancear */}
                <span style={{ width: 46, flexShrink: 0 }} />
              </span>
            </button>

            {/* Hint sutil abaixo */}
            <motion.p
              style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 14, letterSpacing: '0.08em' }}
              animate={{ opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              toque para abrir
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
