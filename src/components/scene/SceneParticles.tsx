'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  type: 'heart' | 'pollen';
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
}

export default function SceneParticles() {
  const reduced = useReducedMotion();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const list: Particle[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      type: i % 3 === 0 ? 'heart' : 'pollen',
      x: Math.random() * 90 + 5,       // 5% – 95% da largura
      y: Math.random() * 70 + 5,        // 5% – 75% da altura
      size: i % 3 === 0
        ? Math.random() * 10 + 8        // corações: 8–18px
        : Math.random() * 6 + 4,        // pólen: 4–10px
      duration: Math.random() * 6 + 5,  // 5–11s
      delay: Math.random() * 5,
      drift: (Math.random() - 0.5) * 30,
    }));
    setParticles(list);
  }, []);

  if (reduced) return null;

  return (
    <div className="fixed inset-0 pointer-events-none select-none" style={{ zIndex: 5 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: [0, -60, -120],
            x: [0, p.drift, p.drift * 0.5],
            opacity: [0, 0.85, 0],
            scale: [0.6, 1, 0.7],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        >
          {p.type === 'heart' ? (
            // Coração rosa — igual ao da imagem
            <svg width={p.size} height={p.size} viewBox="0 0 24 24" fill="none">
              <path
                d="M12 21C12 21 3 14 3 8a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 6-9 13-9 13z"
                fill="#F9A8C0"
                opacity="0.9"
              />
            </svg>
          ) : (
            // Pólen dourado — ponto com brilho
            <div
              style={{
                width: p.size,
                height: p.size,
                borderRadius: '50%',
                background: 'radial-gradient(circle, #FFE066 40%, #F5C430 100%)',
                boxShadow: `0 0 ${p.size * 0.8}px rgba(245,196,48,0.6)`,
              }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
