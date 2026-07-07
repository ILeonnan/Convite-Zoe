'use client';

import { motion, useReducedMotion } from 'framer-motion';

interface BeeProps {
  src: string;
  alt: string;
  style: React.CSSProperties;
  floatY?: number;
  floatX?: number;
  rotateDeg?: number;
  duration?: number;
  delay?: number;
  blendMultiply?: boolean;
}

function Bee({ src, alt, style, floatY = 10, floatX = 4, rotateDeg = 5, duration = 4, delay = 0, blendMultiply = false }: BeeProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="fixed pointer-events-none select-none"
      style={{ ...style, ...(blendMultiply ? { mixBlendMode: 'multiply' as const } : {}) }}
      animate={reduced ? {} : {
        y: [0, -floatY, 0],
        x: [0, floatX, 0],
        rotate: [0, rotateDeg, 0],
      }}
      transition={{ duration, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        className="w-full h-full object-contain drop-shadow-lg"
      />
    </motion.div>
  );
}

export default function FloatingBees() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 40 }}>

      {/* Bee 1 — topo esquerda do céu */}
      <Bee
        src="/bee1.png"
        alt="Abelhinha Zoe"
        style={{
          top: '14vh',
          left: '6vw',
          width: 'clamp(80px, 22vw, 120px)',
          height: 'clamp(80px, 22vw, 120px)',
        }}
        floatY={14}
        floatX={8}
        rotateDeg={7}
        duration={4.2}
        delay={0}
      />

      {/* Bee 2 — meio direita do céu */}
      <Bee
        src="/bee2.png"
        alt="Abelhinha Zoe mel"
        style={{
          top: '38vh',
          right: '8vw',
          width: 'clamp(74px, 20vw, 110px)',
          height: 'clamp(74px, 20vw, 110px)',
        }}
        floatY={16}
        floatX={-8}
        rotateDeg={-7}
        duration={4.8}
        delay={1.5}
      />

      {/* Bee 3 — baixo esquerda, abelhinha espelhada (bee3.png tem fundo branco — trocar quando PNG transparente estiver pronto) */}
      <Bee
        src="/bee1.png"
        alt="Abelhinha Zoe flores"
        style={{
          top: '56vh',
          left: '5vw',
          width: 'clamp(86px, 24vw, 130px)',
          height: 'clamp(86px, 24vw, 130px)',
          transform: 'scaleX(-1)',
        }}
        floatY={12}
        floatX={6}
        rotateDeg={-5}
        duration={3.8}
        delay={2.8}
      />

    </div>
  );
}
