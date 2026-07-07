'use client';

import { motion } from 'framer-motion';

interface Props {
  onLocation: () => void;
  onRSVP: () => void;
  onGifts: () => void;
  rsvpAnswered?: boolean;
}

// Tamanho de cada hexágono (largura da imagem PNG)
const W = 40; // vw
const H = W * 0.88; // vw  — proporção aproximada para hexágono flat-top com efeito mel

// Posicionamento honeycomb:
// Coluna direita deslocada 68% da largura do hex (hexágonos quase se encostando)
const X_RIGHT = W * 0.68; // vw
// Hex direito inferior começa a 82% da altura do hex acima (leve sobreposição do transparent)
const Y_BOTTOM = H * 0.95; // vw
// Hex esquerdo centralizado verticalmente entre os dois da direita
const Y_LEFT = Y_BOTTOM / 2; // vw

// Container
const C_W = X_RIGHT + W;       // vw
const C_H = Y_BOTTOM + H;      // vw

// Flutuação dessincronizada por botão
const floats = [
  { y: [0, -2, 0], duration: 3.2 },
  { y: [0, -2, 0], duration: 2.9 },
  { y: [0, -2, 0], duration: 3.5 },
];

function HexBtn({
  src, alt, x, y, onClick, floatIdx, delay, zIndex = 1, answered = false,
}: {
  src: string; alt: string; x: string; y: string;
  onClick: () => void; floatIdx: number; delay: number; zIndex?: number; answered?: boolean;
}) {
  return (
    <motion.div
      style={{ position: 'absolute', left: x, top: y, width: `${W}vw`, maxWidth: 155, zIndex }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.55, ease: [0.34, 1.3, 0.64, 1] }}
    >
      <motion.button
        onClick={onClick}
        style={{ background: 'none', border: 'none', padding: 0, width: '100%', cursor: 'pointer', position: 'relative' }}
        animate={{ y: floats[floatIdx].y }}
        transition={{ duration: floats[floatIdx].duration, repeat: Infinity, ease: 'easeInOut', delay }}
        whileTap={{ scale: 0.94 }}
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
    <div
      style={{
        position: 'relative',
        width: `min(${C_W}vw, ${155 * (C_W / W)}px)`,
        height: `${C_H}vw`,
        maxHeight: `${155 * 0.88 * (C_H / H)}px`,
      }}
    >
      {/* Esquerda — Localização (centralizado verticalmente) */}
      <HexBtn
        src="/btn-location.png"
        alt="Onde vai ser a Festinha?"
        x="0"
        y={`${Y_LEFT}vw`}
        onClick={onLocation}
        floatIdx={0}
        delay={0.2}
      />

      {/* Direita topo — Confirmar Presença (na frente) */}
      <HexBtn
        src="/btn-rsvp.png"
        alt="Confirmar Presença"
        x={`${X_RIGHT}vw`}
        y="0"
        onClick={onRSVP}
        floatIdx={1}
        delay={0.35}
        zIndex={3}
        answered={rsvpAnswered}
      />

      {/* Direita base — O que a Zoe Ama */}
      <HexBtn
        src="/btn-gifts.png"
        alt="O que a Zoe Ama"
        x={`${X_RIGHT}vw`}
        y={`${Y_BOTTOM}vw`}
        onClick={onGifts}
        floatIdx={2}
        delay={0.5}
      />
    </div>
  );
}
