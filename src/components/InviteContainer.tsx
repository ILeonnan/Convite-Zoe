'use client';

import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BackgroundScene from './scene/BackgroundScene';
import { EVENT } from '@/lib/eventInfo';
import InviteText from './InviteText';
import InviteButtons from './InviteButtons';
import SceneParticles from './scene/SceneParticles';
import LocationModal from './LocationModal';
import RSVPModal from './RSVPModal';
import GiftModal from './GiftModal';
import { logAnalyticsEventAction } from '@/app/actions';

interface Guest {
  id: string;
  name: string;
  type: 'adult' | 'child' | 'baby';
  status: 'confirmed' | 'declined' | 'pending';
}

interface Family {
  id: string;
  name: string;
  responsible: string;
  phone: string;
  token: string;
  status: string;
  sent_at: string | null;
}

interface InviteContainerProps {
  family: Family;
  guests: Guest[];
}

export default function InviteContainer({ family, guests }: InviteContainerProps) {
  const [showLocation, setShowLocation] = useState(false);
  const [showRSVP, setShowRSVP] = useState(false);
  const [showGifts, setShowGifts] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(() => guests.every((g) => g.status !== 'pending'));
  const introRef = useRef<HTMLDivElement>(null);
  const inviteRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const openedRef = useRef(false);

  function open() {
    if (openedRef.current) return;
    openedRef.current = true;

    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
    else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();

    const intro = introRef.current;
    const invite = inviteRef.current;

    if (intro) {
      intro.style.transition = 'opacity 1.4s ease-in-out';
      intro.style.opacity = '0';
      intro.style.pointerEvents = 'none';
      setTimeout(() => { intro.style.display = 'none'; }, 1500);
    }
    if (invite) {
      invite.style.transition = 'opacity 0.8s ease-out';
      invite.style.opacity = '1';
      // Aguarda a intro sumir antes de habilitar cliques — evita clique acidental nos botões
      setTimeout(() => { invite.style.pointerEvents = 'auto'; }, 1600);
    }
  }

  // Entra em tela cheia no primeiro toque em qualquer lugar da página
  useEffect(() => {
    const requestFS = () => {
      const el = document.documentElement;
      if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      else if ((el as any).webkitRequestFullscreen) (el as any).webkitRequestFullscreen();
    };
    document.addEventListener('touchstart', requestFS, { once: true, passive: true });
    document.addEventListener('click', requestFS, { once: true });
    return () => {
      document.removeEventListener('touchstart', requestFS);
      document.removeEventListener('click', requestFS);
    };
  }, []);

  // Adiciona listeners nativos ao botão após hidratação — fallback mais confiável no mobile
  useEffect(() => {
    const btn = btnRef.current;
    if (!btn) return;
    btn.addEventListener('touchstart', open, { passive: true });
    btn.addEventListener('click', open);
    return () => {
      btn.removeEventListener('touchstart', open);
      btn.removeEventListener('click', open);
    };
  }, []);

  return (
    <div className="w-full min-h-screen">

      {/* ── VÍDEO DE ABERTURA ─────────────────────────────────────────── */}
      <div ref={introRef} className="fixed inset-0 z-[100]">
        <video
          src="/Abertura.mp4"
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ pointerEvents: 'none' }}
        />

        <div
          className="absolute inset-x-0 bottom-0 pointer-events-none"
          style={{ height: '50%', background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)' }}
        />

        <div
          className="absolute inset-x-0 bottom-0 flex flex-col items-center"
          style={{ paddingBottom: 'calc(clamp(28px, 9vh, 56px) + env(safe-area-inset-bottom, 0px))' }}
        >
          <p
            className="font-title italic font-extrabold text-center mb-4"
            style={{ fontSize: 'clamp(20px, 6vw, 28px)', color: '#fff', textShadow: '0 2px 12px rgba(0,0,0,0.4), 0 0 40px rgba(248,214,109,0.6)', pointerEvents: 'none' }}
          >
            Olá, {family.name}!
          </p>

          {/* Data do evento */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 999,
            padding: '7px 18px',
            marginBottom: 20,
            pointerEvents: 'none',
          }}>
            <span style={{ fontSize: 15 }}>🗓️</span>
            <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 'clamp(12px, 3.5vw, 15px)', color: '#fff', letterSpacing: '0.03em' }}>
              {EVENT.dateShort}
            </span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>·</span>
            <span style={{ fontFamily: 'var(--font-outfit)', fontWeight: 700, fontSize: 'clamp(12px, 3.5vw, 15px)', color: '#FFD95A', letterSpacing: '0.03em' }}>
              {EVENT.time}
            </span>
          </div>

          <button
            ref={btnRef}
            type="button"
            onTouchEnd={open}
            onPointerUp={open}
            onClick={open}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: 'clamp(14px, 4vw, 18px) clamp(28px, 8vw, 44px)',
              background: 'linear-gradient(135deg, #FFD95A 0%, #F5A623 50%, #E8891A 100%)',
              boxShadow: '0 0 32px rgba(245,166,35,0.7), 0 8px 32px rgba(0,0,0,0.3)',
              border: '2px solid rgba(255,255,255,0.35)',
              borderRadius: 9999,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              touchAction: 'manipulation',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              position: 'relative',
              zIndex: 10,
            }}
          >
            <img src="/bee.png" alt="" draggable={false} style={{ width: 40, height: 40, objectFit: 'contain', pointerEvents: 'none' }} />
            <span style={{ fontSize: 'clamp(18px, 5vw, 22px)', color: '#5C3A0A', fontFamily: 'var(--font-outfit)', fontWeight: 600, letterSpacing: '0.04em', pointerEvents: 'none' }}>
              Abrir Convite
            </span>
          </button>

          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 14, letterSpacing: '0.08em', pointerEvents: 'none' }}>
            toque para abrir
          </p>
        </div>
      </div>

      {/* ── CENÁRIO + CONTEÚDO DO CONVITE ────────────────────────────── */}
      <div
        ref={inviteRef}
        className="relative w-full"
        style={{ opacity: 0, pointerEvents: 'none', minHeight: '100svh', overflowY: 'auto' }}
      >
        <BackgroundScene />
        <SceneParticles />

        <div
          className="relative flex flex-col items-center"
          style={{ zIndex: 50, paddingTop: 'clamp(50px, 12vh, 90px)', paddingBottom: 'clamp(24px, 6vh, 48px)', gap: 'clamp(10px, 2.5vh, 20px)' }}
        >
          <InviteText />
          <InviteButtons
            rsvpAnswered={hasAnswered}
            onLocation={() => {
              logAnalyticsEventAction(family.id, 'location_opened');
              setShowLocation(true);
            }}
            onRSVP={() => {
              logAnalyticsEventAction(family.id, 'rsvp_opened');
              setShowRSVP(true);
            }}
            onGifts={() => {
              logAnalyticsEventAction(family.id, 'gift_viewed');
              setShowGifts(true);
            }}
          />
          <LocationModal open={showLocation} onClose={() => setShowLocation(false)} />
          <GiftModal open={showGifts} onClose={() => setShowGifts(false)} />
          <RSVPModal
            open={showRSVP}
            onClose={() => setShowRSVP(false)}
            familyId={family.id}
            guests={guests}
            onComplete={() => setHasAnswered(true)}
          />
        </div>
      </div>

    </div>
  );
}
