'use client';

import { motion } from 'framer-motion';

interface Props {
  onLocation: () => void;
  onRSVP: () => void;
  onGifts: () => void;
  rsvpAnswered?: boolean;
}

const floats = [
  { y: [0, -3, 0], duration: 3.2 },
  { y: [0, -3, 0], duration: 2.9 },
  { y: [0, -3, 0], duration: 3.5 },
];

const BTN_SIZE = 'clamp(110px, 36vw, 155px)';

function HexBtn({
  src, alt, onClick, floatIdx, delay, answered = false,
}: {
  src: string; alt: string;
  onClick: () => void; floatIdx: number; delay: number; answered?: boolean;
}) {
  return (
    <motion.div
      style={{ width: BTN_SIZE, flexShrink: 0, position: 'relative' }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.55, ease: [0.34, 1.3, 0.64, 1] }}
    >
      <motion.button
        onClick={onClick}
        style={{ background: 'none', border: 'none', padding: 0, width: '100%', cursor: 'pointer', position: 'relative' }}
        animate={{ y: floats[floatIdx].y }}
        transition={{ duration: floats[floatIdx].duration, repeat: Infinity, ease: 'easeInOut', delay }}
        whileTap={{ scale: 0.93 }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="w-full h-auto block"
          style={{
            filter: answered
              ? 'drop-shadow(0 6px 14px rgba(180,100,0,0.28)) grayscale(0.55) brightness(0.82)'
              : 'drop-shadow(0 6px 14px rgba(180,100,0,0.28))',
            opacity: answered ? 0.72 : 1,
            transition: 'filter 0.4s, opacity 0.4s',
          }}
        />
        {answered && (
          <div style={{
            position: 'absolute',
            top: '14%',
            right: '12%',
            width: 26,
            height: 26,
            borderRadius: '50%',
            background: '#27AE60',
            border: '2.5px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            color: '#fff',
            fontWeight: 700,
            pointerEvents: 'none',
          }}>
            ✓
          </div>
        )}
      </motion.button>
    </motion.div>
  );
}

export default function InviteButtons({ onLocation, onRSVP, onGifts, rsvpAnswered = false }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(0px, 0.5vw, 2px)', width: '100%' }}>
      {/* Linha de cima — dois botões */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(0px, 0.5vw, 4px)' }}>
        <HexBtn
          src="/btn-location.png"
          alt="Onde vai ser a Festinha?"
          onClick={onLocation}
          floatIdx={0}
          delay={0.2}
        />
        <HexBtn
          src="/btn-rsvp.png"
          alt="Confirmar Presença"
          onClick={onRSVP}
          floatIdx={1}
          delay={0.35}
          answered={rsvpAnswered}
        />
      </div>

      {/* Linha de baixo — um botão centralizado */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-28px' }}>
        <HexBtn
          src="/btn-gifts.png"
          alt="A Zoe ia Amar!"
          onClick={onGifts}
          floatIdx={2}
          delay={0.5}
        />
      </div>
    </div>
  );
}
