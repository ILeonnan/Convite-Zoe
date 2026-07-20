'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { updateConfirmationAction, logAnalyticsEventAction } from '@/app/actions';
import ChromaKeyVideo from './ChromaKeyVideo';
import { EVENT } from '@/lib/eventInfo';

interface Guest {
  id: string;
  name: string;
  type: 'adult' | 'child' | 'baby';
  status: 'confirmed' | 'declined' | 'pending';
}

interface ConfirmationFormProps {
  familyId: string;
  initialGuests: Guest[];
  onComplete?: (responses: Record<string, 'confirmed' | 'declined'>) => void;
}

const typeLabel: Record<string, string> = {
  adult: 'Adulto',
  child: 'Criança',
  baby: 'Bebê (colo)',
};

function buildGoogleCalendarUrl() {
  return (
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + encodeURIComponent('🐝 1º Aninho da Zoe') +
    `&dates=${EVENT.calendarStart}/${EVENT.calendarEnd}` +
    '&ctz=America/Sao_Paulo' +
    '&location=' + encodeURIComponent(`${EVENT.venue}, ${EVENT.address}`) +
    '&details=' + encodeURIComponent('Venha celebrar o primeiro aniversário da Zoe! 🍯')
  );
}

function downloadICS() {
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Zoe1Birthday//PT',
    'BEGIN:VEVENT',
    `DTSTART;TZID=America/Sao_Paulo:${EVENT.calendarStart}`,
    `DTEND;TZID=America/Sao_Paulo:${EVENT.calendarEnd}`,
    'SUMMARY:🐝 1º Aninho da Zoe',
    `LOCATION:${EVENT.venue}\\, ${EVENT.address}`,
    'DESCRIPTION:Venha celebrar o primeiro aniversário da Zoe! 🍯',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'aniversario-zoe.ics';
  a.click();
  URL.revokeObjectURL(url);
}

export default function ConfirmationForm({ familyId, initialGuests, onComplete }: ConfirmationFormProps) {
  const alreadyAnswered = initialGuests.length > 0 && initialGuests.every((g) => g.status !== 'pending');

  const [responses, setResponses] = useState<Record<string, 'confirmed' | 'declined'>>(
    alreadyAnswered
      ? Object.fromEntries(initialGuests.map((g) => [g.id, g.status as 'confirmed' | 'declined']))
      : {}
  );
  const [currentIndex, setCurrentIndex] = useState(alreadyAnswered ? initialGuests.length : 0);
  const [step, setStep] = useState<'intro' | 'answering' | 'summary' | 'success'>(
    alreadyAnswered ? 'success' : 'intro'
  );
  const [showCelebration, setShowCelebration] = useState(false);
  // Agenda aparece imediatamente se o convidado já havia confirmado antes
  const [showCalendar, setShowCalendar] = useState(() =>
    alreadyAnswered && initialGuests.some((g) => g.status === 'confirmed')
  );
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const totalGuests = initialGuests.length;
  const currentGuest = initialGuests[currentIndex];
  const confirmedGuests = initialGuests.filter((g) => responses[g.id] === 'confirmed');
  const declinedGuests = initialGuests.filter((g) => responses[g.id] === 'declined');

  function handleAnswer(choice: 'confirmed' | 'declined') {
    if (!currentGuest) return;
    const newResponses = { ...responses, [currentGuest.id]: choice };
    setResponses(newResponses);
    setDirection(1);
    if (currentIndex + 1 >= totalGuests) {
      if (totalGuests === 1) {
        // Convite individual: pula o resumo e confirma direto
        setTimeout(() => submitConfirmation(newResponses), 250);
      } else {
        setTimeout(() => setStep('summary'), 250);
      }
    } else {
      setTimeout(() => setCurrentIndex((i) => i + 1), 250);
    }
  }

  function handleBack() {
    if (currentIndex === 0) return;
    setDirection(-1);
    setTimeout(() => setCurrentIndex((i) => i - 1), 50);
  }

  async function submitConfirmation(responsesMap: Record<string, 'confirmed' | 'declined'>) {
    setIsSubmitting(true);
    setError('');
    const payload = initialGuests.map((g) => ({
      id: g.id,
      status: responsesMap[g.id] ?? 'declined',
    }));
    const result = await updateConfirmationAction(familyId, payload);
    setIsSubmitting(false);
    if (result.success) {
      const anyoneConfirmed = Object.values(responsesMap).some((s) => s === 'confirmed');
      onComplete?.(responsesMap);
      setStep('success');
      if (anyoneConfirmed) {
        setShowCelebration(true);
        confetti({ particleCount: 160, spread: 80, origin: { y: 0.5 }, colors: ['#F8D66D', '#EAB75D', '#F8C9D8', '#FFF9F1', '#FFB347'] });
      } else {
        // No celebration video — show calendar immediately
        setTimeout(() => setShowCalendar(true), 600);
      }
    } else {
      setError(result.error || 'Erro ao salvar. Tente novamente.');
    }
  }

  async function handleConfirm() {
    await submitConfirmation(responses);
  }

  function handleRestart() {
    setResponses({});
    setCurrentIndex(0);
    setStep('answering');
    setDirection(1);
    setError('');
  }

  /* ── TELA: INTRODUÇÃO ────────────────────────────────────────── */
  if (step === 'intro') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ padding: '8px 0', textAlign: 'center' }}
      >
        <div style={{ width: 110, margin: '0 auto 12px' }}>
          <ChromaKeyVideo
            src="/BeerAtencion.mp4"
            loop
            style={{ width: '100%' }}
          />
        </div>

        <p style={{
          fontFamily: 'var(--font-playfair)',
          fontStyle: 'italic',
          fontWeight: 700,
          fontSize: 'clamp(18px, 5vw, 22px)',
          color: '#3D1800',
          marginBottom: 16,
        }}>
          Antes de confirmar, leia com atenção:
        </p>

        <div style={{
          background: 'rgba(245,166,35,0.12)',
          border: '1.5px solid rgba(232,137,26,0.4)',
          borderRadius: 16,
          padding: '18px 20px',
          marginBottom: 28,
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-outfit)',
            fontSize: 'clamp(13px, 3.8vw, 15px)',
            color: '#5C3200',
            lineHeight: 1.7,
            margin: 0,
          }}>
            🐝 Os nomes confirmados aqui entrarão na <strong>listinha da portinha da colmeia</strong>. Não será possível trocar ou substituir um convidado por outro — confirme com carinho quem realmente poderá comparecer. 🍯

          {/* Data e hora */}
          <div style={{
            marginTop: 14,
            paddingTop: 14,
            borderTop: '1px solid rgba(232,137,26,0.25)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>🗓️</span>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontFamily: 'var(--font-outfit)', fontWeight: 800, fontSize: 'clamp(13px, 3.8vw, 15px)', color: '#3D1800' }}>
                {EVENT.dateShort}
              </p>
              <p style={{ margin: 0, fontFamily: 'var(--font-outfit)', fontWeight: 600, fontSize: 12, color: '#B8650A' }}>
                {EVENT.weekday} · às {EVENT.time}
              </p>
            </div>
          </div>
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          {/* Abelha sentada na borda do botão */}
          <div style={{
            position: 'absolute',
            width: 130,
            right: 4,
            bottom: 'calc(100% - 14px)',
            zIndex: 2,
            pointerEvents: 'none',
          }}>
            <ChromaKeyVideo src="/Beersentada.mp4" loop style={{ width: '100%' }} />
          </div>

          <button
            type="button"
            onClick={() => setStep('answering')}
            style={{
              width: '100%',
              padding: '18px',
              borderRadius: 16,
              border: 'none',
              background: 'linear-gradient(135deg, #FFD95A 0%, #F5A623 50%, #E8891A 100%)',
              color: '#3D1800',
              fontFamily: 'var(--font-outfit)',
              fontWeight: 800,
              fontSize: 'clamp(15px, 4vw, 17px)',
              cursor: 'pointer',
              touchAction: 'manipulation',
              WebkitTapHighlightColor: 'transparent',
              boxShadow: '0 4px 20px rgba(232,137,26,0.4)',
              letterSpacing: '0.02em',
            }}
          >
            Entendi, vamos confirmar!
          </button>
        </div>
      </motion.div>
    );
  }

  /* ── TELA: UM POR UM ──────────────────────────────────────────── */
  if (step === 'answering' && currentGuest) {
    const progress = (currentIndex / totalGuests) * 100;

    return (
      <div style={{ padding: '4px 0' }}>

        {/* Progresso */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: '#B8650A', fontFamily: 'var(--font-outfit)', fontWeight: 600 }}>
              {currentIndex + 1} de {totalGuests}
            </span>
            <span style={{ fontSize: 12, color: '#B8650A', fontFamily: 'var(--font-outfit)' }}>
              {Math.round(progress)}%
            </span>
          </div>
          <div style={{ height: 5, background: 'rgba(180,100,0,0.12)', borderRadius: 99, overflow: 'hidden' }}>
            <motion.div
              style={{ height: '100%', background: 'linear-gradient(90deg, #F5A623, #FFD95A)', borderRadius: 99 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Card do convidado */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={currentGuest.id}
            initial={{ opacity: 0, x: direction * 70 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -70 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {/* Moldura dourada — wrapper com gradiente como borda */}
            <div style={{
              position: 'relative',
              padding: 3,
              borderRadius: 26,
              background: 'linear-gradient(135deg, #F0C040 0%, #C8860A 25%, #FFE066 50%, #C8860A 75%, #F0C040 100%)',
              boxShadow: '0 0 0 1px rgba(255,215,0,0.25), 0 12px 40px rgba(140,70,0,0.22)',
              marginBottom: 16,
            }}>
              {/* Card interno */}
              <div style={{
                position: 'relative',
                borderRadius: 24,
                background: 'linear-gradient(160deg, #FFFEF8 0%, #FFFAEC 50%, #FFF6DA 100%)',
                overflow: 'hidden',
                padding: '22px 20px 24px',
                textAlign: 'center',
              }}>

                {/* Ornamentos de canto — topo esquerdo */}
                <svg style={{ position: 'absolute', top: 6, left: 6 }} width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <path d="M2 42 Q2 2 42 2" stroke="#C8860A" strokeWidth="1.2" fill="none" opacity="0.55"/>
                  <circle cx="6" cy="38" r="2.2" fill="#D4A017" opacity="0.5"/>
                  <circle cx="38" cy="6" r="2.2" fill="#D4A017" opacity="0.5"/>
                  <circle cx="13" cy="31" r="1.4" fill="#D4A017" opacity="0.35"/>
                  <circle cx="31" cy="13" r="1.4" fill="#D4A017" opacity="0.35"/>
                  {/* Mini flor */}
                  <circle cx="6" cy="6" r="3" fill="#F5C842" opacity="0.45"/>
                  <circle cx="6" cy="2" r="1.6" fill="#E8A020" opacity="0.4"/>
                  <circle cx="10" cy="6" r="1.6" fill="#E8A020" opacity="0.4"/>
                  <circle cx="6" cy="10" r="1.6" fill="#E8A020" opacity="0.4"/>
                  <circle cx="2" cy="6" r="1.6" fill="#E8A020" opacity="0.4"/>
                </svg>

                {/* Ornamentos de canto — topo direito */}
                <svg style={{ position: 'absolute', top: 6, right: 6 }} width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <path d="M42 42 Q42 2 2 2" stroke="#C8860A" strokeWidth="1.2" fill="none" opacity="0.55"/>
                  <circle cx="38" cy="38" r="2.2" fill="#D4A017" opacity="0.5"/>
                  <circle cx="6" cy="6" r="2.2" fill="#D4A017" opacity="0.5"/>
                  <circle cx="31" cy="31" r="1.4" fill="#D4A017" opacity="0.35"/>
                  <circle cx="13" cy="13" r="1.4" fill="#D4A017" opacity="0.35"/>
                  {/* Mini flor */}
                  <circle cx="38" cy="6" r="3" fill="#F5C842" opacity="0.45"/>
                  <circle cx="38" cy="2" r="1.6" fill="#E8A020" opacity="0.4"/>
                  <circle cx="42" cy="6" r="1.6" fill="#E8A020" opacity="0.4"/>
                  <circle cx="38" cy="10" r="1.6" fill="#E8A020" opacity="0.4"/>
                  <circle cx="34" cy="6" r="1.6" fill="#E8A020" opacity="0.4"/>
                </svg>

                {/* Ornamentos de canto — baixo esquerdo */}
                <svg style={{ position: 'absolute', bottom: 6, left: 6 }} width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <path d="M2 2 Q2 42 42 42" stroke="#C8860A" strokeWidth="1.2" fill="none" opacity="0.55"/>
                  <circle cx="6" cy="6" r="2.2" fill="#D4A017" opacity="0.5"/>
                  <circle cx="38" cy="38" r="2.2" fill="#D4A017" opacity="0.5"/>
                  <circle cx="6" cy="38" r="3" fill="#F5C842" opacity="0.45"/>
                  <circle cx="6" cy="42" r="1.6" fill="#E8A020" opacity="0.4"/>
                  <circle cx="10" cy="38" r="1.6" fill="#E8A020" opacity="0.4"/>
                  <circle cx="6" cy="34" r="1.6" fill="#E8A020" opacity="0.4"/>
                  <circle cx="2" cy="38" r="1.6" fill="#E8A020" opacity="0.4"/>
                </svg>

                {/* Ornamentos de canto — baixo direito */}
                <svg style={{ position: 'absolute', bottom: 6, right: 6 }} width="44" height="44" viewBox="0 0 44 44" fill="none">
                  <path d="M42 2 Q42 42 2 42" stroke="#C8860A" strokeWidth="1.2" fill="none" opacity="0.55"/>
                  <circle cx="38" cy="6" r="2.2" fill="#D4A017" opacity="0.5"/>
                  <circle cx="6" cy="38" r="2.2" fill="#D4A017" opacity="0.5"/>
                  <circle cx="38" cy="38" r="3" fill="#F5C842" opacity="0.45"/>
                  <circle cx="38" cy="42" r="1.6" fill="#E8A020" opacity="0.4"/>
                  <circle cx="42" cy="38" r="1.6" fill="#E8A020" opacity="0.4"/>
                  <circle cx="38" cy="34" r="1.6" fill="#E8A020" opacity="0.4"/>
                  <circle cx="34" cy="38" r="1.6" fill="#E8A020" opacity="0.4"/>
                </svg>

                {/* Ornamento central topo */}
                <svg width="120" height="22" viewBox="0 0 120 22" fill="none" style={{ display: 'block', margin: '0 auto 14px' }}>
                  <line x1="0" y1="11" x2="44" y2="11" stroke="#C8860A" strokeWidth="0.8" opacity="0.4"/>
                  <path d="M48 11 Q54 3 60 11 Q66 19 72 11" stroke="#C8860A" strokeWidth="1" fill="none" opacity="0.65"/>
                  <line x1="76" y1="11" x2="120" y2="11" stroke="#C8860A" strokeWidth="0.8" opacity="0.4"/>
                  <circle cx="60" cy="11" r="2.5" fill="#D4A017" opacity="0.7"/>
                  <circle cx="48" cy="11" r="1.5" fill="#D4A017" opacity="0.4"/>
                  <circle cx="72" cy="11" r="1.5" fill="#D4A017" opacity="0.4"/>
                </svg>

                {/* Nome */}
                <p style={{
                  fontFamily: 'var(--font-playfair)',
                  fontStyle: 'italic',
                  fontSize: 'clamp(26px, 7.5vw, 38px)',
                  fontWeight: 700,
                  color: '#2C1000',
                  lineHeight: 1.15,
                  marginBottom: 14,
                  letterSpacing: '-0.01em',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {currentGuest.name}
                </p>

                {/* Linha decorativa */}
                <svg width="100" height="10" viewBox="0 0 100 10" fill="none" style={{ display: 'block', margin: '0 auto 14px' }}>
                  <line x1="0" y1="5" x2="38" y2="5" stroke="#C8860A" strokeWidth="0.7" opacity="0.35"/>
                  <path d="M42 5 L46 1 L50 5 L54 9 L58 5" stroke="#C8860A" strokeWidth="0.9" fill="none" opacity="0.6"/>
                  <line x1="62" y1="5" x2="100" y2="5" stroke="#C8860A" strokeWidth="0.7" opacity="0.35"/>
                </svg>

                {/* Pergunta */}
                <p style={{
                  fontFamily: 'var(--font-playfair)',
                  fontStyle: 'italic',
                  fontSize: 'clamp(14px, 4vw, 17px)',
                  color: '#5C3200',
                  lineHeight: 1.55,
                  opacity: 0.9,
                  position: 'relative',
                  zIndex: 1,
                }}>
                  Vai comparecer à festinha da Zoe?
                </p>
              </div>
            </div>

            {/* Botões SIM / NÃO — estilo iOS */}
            <div style={{ display: 'flex', gap: 12, alignItems: 'stretch' }}>

              {/* NÃO */}
              <button
                type="button"
                onClick={() => handleAnswer('declined')}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px 10px 0',
                  borderRadius: 20,
                  border: '1.5px solid rgba(192,57,43,0.22)',
                  background: 'rgba(255,210,200,0.42)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  minHeight: 195,
                  overflow: 'hidden',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
              >
                {/* Ícone X */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(192,57,43,0.12)',
                  border: '1.5px solid rgba(192,57,43,0.35)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 8, flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line x1="5" y1="5" x2="19" y2="19" stroke="#C0392B" strokeWidth="2.5" strokeLinecap="round"/>
                    <line x1="19" y1="5" x2="5" y2="19" stroke="#C0392B" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <span style={{
                  fontFamily: 'var(--font-outfit)',
                  fontWeight: 700,
                  fontSize: 'clamp(12px, 3.5vw, 14px)',
                  color: '#C0392B',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  flexShrink: 0,
                }}>
                  Não poderei ir
                </span>
                {/* Spacer empurra abelha para o fundo */}
                <div style={{ flex: 1 }} />
                <img
                  src="/Beetriste.png"
                  alt="Abelha triste"
                  draggable={false}
                  style={{ width: 'clamp(130px, 36vw, 170px)', objectFit: 'contain', display: 'block', flexShrink: 0 }}
                />
              </button>

              {/* SIM */}
              <button
                type="button"
                onClick={() => handleAnswer('confirmed')}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '16px 10px 0',
                  borderRadius: 20,
                  border: '1.5px solid rgba(39,174,96,0.25)',
                  background: 'rgba(195,240,215,0.42)',
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  cursor: 'pointer',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  minHeight: 195,
                  overflow: 'hidden',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
              >
                {/* Ícone ✓ */}
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'rgba(39,174,96,0.12)',
                  border: '1.5px solid rgba(39,174,96,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 8, flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polyline points="4,12 9,18 20,6" stroke="#27AE60" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span style={{
                  fontFamily: 'var(--font-outfit)',
                  fontWeight: 700,
                  fontSize: 'clamp(12px, 3.5vw, 14px)',
                  color: '#1E8449',
                  textAlign: 'center',
                  lineHeight: 1.3,
                  flexShrink: 0,
                }}>
                  Vou com certeza!
                </span>
                {/* Spacer empurra abelha para o fundo */}
                <div style={{ flex: 1 }} />
                <img
                  src="/Beefeliz.png"
                  alt="Abelha feliz"
                  draggable={false}
                  style={{ width: 'clamp(130px, 36vw, 170px)', objectFit: 'contain', display: 'block', flexShrink: 0 }}
                />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Botão voltar */}
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={handleBack}
            style={{
              display: 'block',
              margin: '18px auto 0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              color: 'rgba(180,100,0,0.55)',
              fontFamily: 'var(--font-outfit)',
              touchAction: 'manipulation',
            }}
          >
            ← Voltar ao anterior
          </button>
        )}
      </div>
    );
  }

  /* ── TELA: RESUMO ─────────────────────────────────────────────── */
  if (step === 'summary') {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '4px 0' }}>
        <p style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: 'clamp(17px, 4.5vw, 20px)',
          color: '#3D1800',
          textAlign: 'center',
          marginBottom: 18,
          letterSpacing: '0.01em',
        }}>
          Confira antes de confirmar:
        </p>

        {/* Grid 2×N de cards — último ocupa 2 colunas se total for ímpar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 22 }}>
          {initialGuests.map((g, idx) => {
            const ok = responses[g.id] === 'confirmed';
            const isLastOdd = initialGuests.length % 2 !== 0 && idx === initialGuests.length - 1;

            return (
              <div key={g.id} style={{
                position: 'relative',
                borderRadius: 22,
                overflow: 'hidden',
                border: `1.5px solid ${ok ? 'rgba(39,174,96,0.35)' : 'rgba(192,57,43,0.28)'}`,
                background: ok
                  ? 'linear-gradient(160deg, #EBF9F1 0%, #C8F0DA 100%)'
                  : 'linear-gradient(160deg, #FFF0EE 0%, #F8D8D2 100%)',
                boxShadow: ok
                  ? '0 6px 18px rgba(39,174,96,0.14)'
                  : '0 6px 18px rgba(192,57,43,0.1)',
                // Card ímpar final: horizontal (span 2 colunas)
                ...(isLastOdd ? {
                  gridColumn: 'span 2',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: '14px 20px',
                  gap: 14,
                } : {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 10px 0',
                  minHeight: 150,
                }),
              }}>

                {/* Badge de status */}
                {isLastOdd ? (
                  /* Layout horizontal para card final ímpar */
                  <>
                    <img
                      src={ok ? '/Beefeliz.png' : '/Beetriste.png'}
                      alt=""
                      draggable={false}
                      style={{ width: 64, height: 64, objectFit: 'contain', flexShrink: 0, filter: ok ? 'none' : 'grayscale(15%)' }}
                    />
                    <div style={{ flex: 1 }}>
                      <span style={{
                        fontSize: 10, fontFamily: 'var(--font-outfit)', fontWeight: 700,
                        letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                        color: ok ? '#1A7A40' : '#A02020',
                        background: ok ? 'rgba(39,174,96,0.15)' : 'rgba(192,57,43,0.12)',
                        borderRadius: 99, padding: '3px 10px', display: 'inline-block', marginBottom: 6,
                      }}>
                        {ok ? 'Confirmado' : 'Não vai'}
                      </span>
                      <p style={{
                        fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontWeight: 700,
                        fontSize: 'clamp(15px, 4vw, 18px)', color: ok ? '#1A5E34' : '#7A2515',
                        lineHeight: 1.3,
                        textDecoration: ok ? 'none' : 'line-through',
                        textDecorationColor: 'rgba(192,57,43,0.5)',
                      }}>
                        {g.name}
                      </p>
                    </div>
                  </>
                ) : (
                  /* Layout vertical para cards normais */
                  <>
                    <div style={{ alignSelf: 'stretch', display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
                      <span style={{
                        fontSize: 10, fontFamily: 'var(--font-outfit)', fontWeight: 700,
                        letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                        color: ok ? '#1A7A40' : '#A02020',
                        background: ok ? 'rgba(39,174,96,0.15)' : 'rgba(192,57,43,0.12)',
                        borderRadius: 99, padding: '3px 10px',
                      }}>
                        {ok ? 'Confirmado' : 'Não vai'}
                      </span>
                    </div>

                    <p style={{
                      fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontWeight: 700,
                      fontSize: 'clamp(13px, 3.8vw, 16px)', color: ok ? '#1A5E34' : '#7A2515',
                      textAlign: 'center', lineHeight: 1.3,
                      textDecoration: ok ? 'none' : 'line-through',
                      textDecorationColor: 'rgba(192,57,43,0.5)',
                      paddingLeft: 4, paddingRight: 4,
                    }}>
                      {g.name}
                    </p>

                    <img
                      src={ok ? '/Beefeliz.png' : '/Beetriste.png'}
                      alt=""
                      draggable={false}
                      style={{
                        width: 'clamp(60px, 16vw, 80px)', objectFit: 'contain',
                        display: 'block', filter: ok ? 'none' : 'grayscale(15%)', marginTop: 'auto',
                      }}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <p style={{ fontSize: 13, color: '#C0392B', textAlign: 'center', marginBottom: 14 }}>⚠️ {error}</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Moldura dourada igual ao card do convidado */}
          <motion.div
            whileTap={{ scale: 0.975 }}
            style={{
              padding: 2.5,
              borderRadius: 18,
              background: 'linear-gradient(135deg, #F0C040 0%, #C8860A 25%, #FFE066 50%, #C8860A 75%, #F0C040 100%)',
              boxShadow: '0 4px 22px rgba(180,110,0,0.2), 0 1px 0 rgba(255,240,160,0.5) inset',
              opacity: isSubmitting ? 0.7 : 1,
            }}
          >
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: 16,
                border: 'none',
                background: 'linear-gradient(160deg, #FFFEF4 0%, #FFF6D6 50%, #FFEDB0 100%)',
                color: '#3D1800',
                fontFamily: 'var(--font-playfair)',
                fontStyle: 'italic',
                fontWeight: 700,
                fontSize: 'clamp(16px, 4.5vw, 19px)',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                touchAction: 'manipulation',
                WebkitTapHighlightColor: 'transparent',
                letterSpacing: '0.01em',
                display: 'block',
              }}
            >
              {isSubmitting ? 'Salvando...' : 'Enviar respostas'}
            </button>
          </motion.div>
          <button
            type="button"
            onClick={handleRestart}
            style={{
              padding: '14px',
              borderRadius: 16,
              border: '1.5px solid rgba(180,100,0,0.2)',
              background: 'transparent',
              color: '#7A4200',
              fontFamily: 'var(--font-outfit)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              touchAction: 'manipulation',
            }}
          >
            ← Refazer as respostas
          </button>
        </div>
      </motion.div>
    );
  }

  /* ── TELA: SUCESSO ────────────────────────────────────────────── */
  return (
    <>
      {/* Overlay do vídeo chroma key — renderizado fora do modal via portal */}
      {showCelebration && typeof window !== 'undefined' && createPortal(
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 500,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}>
          <ChromaKeyVideo
            src="/BeeComemora.mp4"
            onEnded={() => { setShowCelebration(false); setShowCalendar(true); }}
            style={{ width: 'min(100vw, 480px)' }}
          />
        </div>,
        document.body
      )}

    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ padding: '16px 0', textAlign: 'center' }}>
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ marginBottom: 16 }}
      >
        <img
          src={confirmedGuests.length > 0 ? '/Beefeliz.png' : '/Beetriste.png'}
          alt=""
          draggable={false}
          style={{ width: 110, height: 110, objectFit: 'contain', margin: '0 auto', display: 'block' }}
        />
      </motion.div>

      <p style={{ fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontSize: 'clamp(19px, 5.5vw, 24px)', fontWeight: 700, color: '#3D1800', marginBottom: 8 }}>
        {confirmedGuests.length > 0 ? 'Presença confirmada!' : 'Resposta enviada!'}
      </p>
      <p style={{ fontFamily: 'var(--font-outfit)', fontSize: 14, color: '#7A4200', marginBottom: 24, lineHeight: 1.6 }}>
        {confirmedGuests.length > 0
          ? 'A Zoe ficou feliz em saber que vai ter a sua companhia nessa data especial. 🌸'
          : 'Obrigada por nos avisar! Sentiremos sua falta e esperamos te ver em breve. 🍯'}
      </p>

      {/* Confirmados */}
      {confirmedGuests.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#27AE60', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', marginBottom: 10 }}>
            ✓ Confirmados
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {confirmedGuests.map((g) => (
              <span key={g.id} style={{
                padding: '7px 16px', borderRadius: 99,
                background: 'rgba(39,174,96,0.1)', border: '1.5px solid rgba(39,174,96,0.3)',
                fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontWeight: 700,
                fontSize: 'clamp(13px, 3.8vw, 15px)', color: '#1A5E34',
              }}>
                {g.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Não vão */}
      {declinedGuests.length > 0 && (
        <div style={{ marginBottom: 8 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#C0392B', letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: 'var(--font-outfit)', marginBottom: 10 }}>
            ✗ Não poderão ir
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {declinedGuests.map((g) => (
              <span key={g.id} style={{
                padding: '7px 16px', borderRadius: 99,
                background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.25)',
                fontFamily: 'var(--font-playfair)', fontStyle: 'italic', fontWeight: 700,
                fontSize: 'clamp(13px, 3.8vw, 15px)', color: '#922B21',
                textDecoration: 'line-through', textDecorationColor: 'rgba(192,57,43,0.5)',
              }}>
                {g.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Salvar na Agenda */}
      <AnimatePresence>
        {showCalendar && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.34, 1.1, 0.64, 1] }}
            style={{ marginTop: 24 }}
          >
            {/* Divisor */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(232,137,26,0.3))' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#B8650A', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-outfit)' }}>Não esqueça!</span>
              <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(232,137,26,0.3))' }} />
            </div>

            <div style={{
              background: 'linear-gradient(135deg, rgba(255,217,90,0.18) 0%, rgba(232,137,26,0.12) 100%)',
              border: '1.5px solid rgba(232,137,26,0.32)',
              borderRadius: 20,
              padding: '18px 18px 16px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 24, marginBottom: 8 }}>🗓️</p>
              <p style={{
                fontFamily: 'var(--font-playfair)',
                fontStyle: 'italic',
                fontWeight: 700,
                fontSize: 'clamp(15px, 4.2vw, 18px)',
                color: '#3D1800',
                marginBottom: 6,
              }}>
                Salve na sua agenda!
              </p>
              <p style={{
                fontFamily: 'var(--font-outfit)',
                fontSize: 12,
                color: '#7A4200',
                marginBottom: 16,
                lineHeight: 1.5,
              }}>
                {EVENT.dateShort} · {EVENT.weekday} · {EVENT.time}
              </p>

              {/* Botões */}
              <div style={{ display: 'flex', gap: 10 }}>
                {/* Google Calendar */}
                <a
                  href={buildGoogleCalendarUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => logAnalyticsEventAction(familyId, 'calendar_added')}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    padding: '13px 10px',
                    borderRadius: 14,
                    background: 'linear-gradient(135deg, #FFD95A 0%, #F5A623 100%)',
                    border: 'none',
                    textDecoration: 'none',
                    fontFamily: 'var(--font-outfit)',
                    fontWeight: 700,
                    fontSize: 13,
                    color: '#3D1800',
                    boxShadow: '0 3px 14px rgba(232,137,26,0.35)',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="16" rx="2" stroke="#3D1800" strokeWidth="1.8"/>
                    <line x1="3" y1="9" x2="21" y2="9" stroke="#3D1800" strokeWidth="1.8"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="#3D1800" strokeWidth="1.8" strokeLinecap="round"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="#3D1800" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                  Google
                </a>

                {/* Apple / ICS */}
                <button
                  type="button"
                  onClick={() => { logAnalyticsEventAction(familyId, 'calendar_added'); downloadICS(); }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 7,
                    padding: '13px 10px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.7)',
                    border: '1.5px solid rgba(232,137,26,0.3)',
                    fontFamily: 'var(--font-outfit)',
                    fontWeight: 700,
                    fontSize: 13,
                    color: '#5C3200',
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                    WebkitBackdropFilter: 'blur(4px)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" stroke="#5C3200" strokeWidth="1.8" fill="none"/>
                    <circle cx="12" cy="9" r="2.5" stroke="#5C3200" strokeWidth="1.8"/>
                  </svg>
                  Apple / ICS
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </>
  );
}
