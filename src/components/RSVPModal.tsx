'use client';

import { motion, AnimatePresence } from 'framer-motion';
import ConfirmationForm from './ConfirmationForm';

interface Guest {
  id: string;
  name: string;
  type: 'adult' | 'child' | 'baby';
  status: 'confirmed' | 'declined' | 'pending';
}

interface Props {
  open: boolean;
  onClose: () => void;
  familyId: string;
  guests: Guest[];
  onComplete?: () => void;
}

export default function RSVPModal({ open, onClose, familyId, guests, onComplete }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0"
            style={{ zIndex: 200, background: 'rgba(0,0,0,0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Bottom-sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 flex flex-col"
            style={{
              zIndex: 201,
              borderRadius: '24px 24px 0 0',
              background: 'rgba(255,251,234,0.88)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow: '0 -8px 40px rgba(200,120,0,0.22)',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(180,100,0,0.25)' }} />
            </div>

            {/* Header */}
            <div style={{ position: 'relative', padding: '4px 20px 10px', flexShrink: 0, textAlign: 'center' }}>
              <p style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: 'clamp(18px, 5vw, 22px)',
                fontWeight: 700,
                fontStyle: 'normal',
                color: '#3D1800',
                letterSpacing: '0.01em',
              }}>
                Confirmar Presença
              </p>
              <button
                onClick={onClose}
                style={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(200,100,0,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  cursor: 'pointer',
                  fontSize: 16,
                  color: '#7A4200',
                  touchAction: 'manipulation',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>
            </div>

            {/* Conteúdo — formulário de confirmação */}
            <div className="px-4 pb-8">
              <ConfirmationForm
                familyId={familyId}
                initialGuests={guests}
                onComplete={onComplete}
              />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
