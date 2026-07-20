'use client';

import { useEffect, useRef } from 'react';

interface Props {
  src: string;
  onEnded?: () => void;
  loop?: boolean;
  style?: React.CSSProperties;
}

export default function ChromaKeyVideo({ src, onEnded, loop = false, style }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const endedRef = useRef(false);
  // Guarda o callback em ref para não re-disparar o effect quando a função muda de referência
  const onEndedRef = useRef(onEnded);
  useEffect(() => { onEndedRef.current = onEnded; }, [onEnded]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    endedRef.current = false;

    function finish() {
      if (endedRef.current) return;
      endedRef.current = true;
      cancelAnimationFrame(rafRef.current);
      onEndedRef.current?.();
    }

    let frameTick = 0;
    function tick() {
      if (!video || !canvas || !ctx) return;
      if (video.paused || (!loop && video.ended)) { finish(); return; }
      if (loop && video.ended) { rafRef.current = requestAnimationFrame(tick); return; }

      // Processa em meia resolução e pula frames alternados para economizar CPU
      frameTick++;
      if (frameTick % 2 !== 0) { rafRef.current = requestAnimationFrame(tick); return; }

      if (video.videoWidth > 0) {
        const maxW = 640;
        const scale = Math.min(1, maxW / video.videoWidth);
        const tw = Math.round(video.videoWidth * scale);
        const th = Math.round(video.videoHeight * scale);
        if (canvas.width !== tw) { canvas.width = tw; canvas.height = th; }
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const id = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const d = id.data;

      for (let i = 0; i < d.length; i += 4) {
        const r = d[i], g = d[i + 1], b = d[i + 2];
        // Greenness: quanto o verde domina sobre vermelho e azul
        const greenness = 2 * g - r - b;
        // g > r garante que só pixels onde o verde domina o vermelho são removidos
        // protege as cores quentes da abelha (amarelo/laranja onde r ≈ g ou r > g)
        if (greenness > 40 && g > 50 && g > r) {
          const strength = Math.min(1, (greenness - 40) / 70);
          d[i + 3] = Math.round((1 - strength) * 255);
          if (strength < 1) {
            d[i + 1] = Math.round(g * (1 - strength * 0.5));
          }
        }
      }

      ctx.putImageData(id, 0, 0);
      rafRef.current = requestAnimationFrame(tick);
    }

    function onPlay() {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }

    // Fallback: se o vídeo não carregar, avança após 60s
    const timeout = setTimeout(finish, 60000);

    video.addEventListener('play', onPlay);
    video.addEventListener('ended', finish);
    video.addEventListener('error', finish);

    video.play().catch(finish);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('ended', finish);
      video.removeEventListener('error', finish);
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeout);
    };
  }, [src]);

  return (
    <div style={style}>
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        preload="auto"
        loop={loop}
        style={{ display: 'none' }}
      />
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: 'auto' }}
      />
    </div>
  );
}
