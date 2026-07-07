'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  onClose: () => void;
}

const ADDRESS = 'Rua Juruena, 170 - Senador Vasconcelos, Rio de Janeiro - RJ, 23013-510';
const MAPS_EMBED = `https://maps.google.com/maps?q=Rua+Juruena,+170,+Senador+Vasconcelos,+Rio+de+Janeiro,+RJ,+23013-510&output=embed&z=16`;
const MAPS_NAV = `https://www.google.com/maps/dir/?api=1&destination=Rua+Juruena+170+Senador+Vasconcelos+Rio+de+Janeiro+RJ+23013-510`;

export default function LocationModal({ open, onClose }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0"
            style={{ zIndex: 200, background: 'rgba(0,0,0,0.45)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Sheet */}
          <motion.div
            className="fixed inset-x-0 bottom-0 flex flex-col"
            style={{
              zIndex: 201,
              borderRadius: '24px 24px 0 0',
              background: 'linear-gradient(160deg, #FFFBEA 0%, #FFF3C4 100%)',
              boxShadow: '0 -8px 40px rgba(200,120,0,0.18)',
              maxHeight: '88vh',
              overflow: 'hidden',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'rgba(180,100,0,0.25)' }} />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 pt-1">
              <div>
                <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(16px, 4.5vw, 20px)', fontWeight: 700, fontStyle: 'italic', color: '#3D1800' }}>
                  🐝 Siga as abelhinhas!
                </p>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'rgba(200,100,0,0.1)', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', fontSize: 16, color: '#7A4200' }}
              >
                ✕
              </button>
            </div>

            {/* Venue info */}
            <div
              className="mx-4 mb-3 px-4 py-3 flex flex-col items-center gap-1 text-center"
              style={{ background: 'rgba(245,166,35,0.12)', borderRadius: 14, border: '1px solid rgba(245,166,35,0.3)' }}
            >
              <p style={{ fontFamily: 'var(--font-playfair)', fontSize: 'clamp(15px, 4.2vw, 18px)', fontWeight: 700, color: '#3D1800' }}>
                Casa de Festas Mariana
              </p>
              <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 'clamp(12px, 3.3vw, 14px)', color: '#7A4200', lineHeight: 1.5 }}>
                {ADDRESS}
              </p>
            </div>

            {/* Map */}
            <div className="mx-4 mb-4" style={{ borderRadius: 16, overflow: 'hidden', flex: 1, minHeight: 220 }}>
              <iframe
                src={MAPS_EMBED}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: 220, display: 'block' }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização Casa de Festas Mariana"
              />
            </div>

            {/* Navigation button */}
            <div className="px-4 pb-8">
              <a
                href={MAPS_NAV}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full"
                style={{
                  padding: 'clamp(14px, 4vw, 18px)',
                  borderRadius: 16,
                  background: 'linear-gradient(135deg, #FFE07A 0%, #F5A623 55%, #E8891A 100%)',
                  boxShadow: '0 4px 20px rgba(232,137,26,0.4)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-outfit)',
                  fontSize: 'clamp(15px, 4.2vw, 17px)',
                  fontWeight: 700,
                  color: '#3D1800',
                  letterSpacing: '0.02em',
                }}
              >
                🗺️ Traçar Rota no Google Maps
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
