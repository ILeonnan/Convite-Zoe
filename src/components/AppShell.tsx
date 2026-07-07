'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import VideoIntro from './VideoIntro';
import BackgroundScene from './scene/BackgroundScene';
import SceneParticles from './scene/SceneParticles';

export default function AppShell() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <div className="relative w-full min-h-screen overflow-hidden" style={{ backgroundColor: '#FFFBEA' }}>

      {/* CONVITE — sempre montado por baixo */}
      <BackgroundScene />
      <SceneParticles />
      <div
        className="relative min-h-screen flex flex-col items-center justify-center"
        style={{ zIndex: 50 }}
      >
        {/* conteúdo do convite virá aqui */}
      </div>

      {/* VÍDEO — sobreposto, some suavemente ao clicar */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro"
            className="fixed inset-0"
            style={{ zIndex: 100 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: 'easeInOut' }}
          >
            <VideoIntro onOpen={() => setShowIntro(false)} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
