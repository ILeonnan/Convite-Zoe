'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GiftModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0"
            style={{ zIndex: 200, background: 'rgba(0,0,0,0.45)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-x-0 bottom-0 flex flex-col"
            style={{
              zIndex: 201,
              borderRadius: '14px 14px 0 0',
              background: 'linear-gradient(160deg, #FFFBEA 0%, #FFF3C4 100%)',
              boxShadow: '0 -8px 40px rgba(200,120,0,0.18)',
              border: '1px solid #FFFBEA',
              overflow: 'hidden',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1" style={{ flexShrink: 0 }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(180,100,0,0.25)' }} />
            </div>

            {/* Imagem de presentes */}
            <div style={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <img
                src="/presenteszoe.png"
                alt="Sugestões de presentes para a Zoe"
                draggable={false}
                style={{ width: '100%', display: 'block' }}
              />
            </div>

            {/* X flutuante sempre visível no topo do modal */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 10,
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.35)',
                border: '1.5px solid rgba(255,255,255,0.4)',
                cursor: 'pointer',
                fontSize: 15,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
              }}
            >
              ✕
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
