'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, Sparkles, Heart } from 'lucide-react';
import { submitTimeCapsuleMessageAction } from '@/app/actions';

interface TimeCapsuleProps {
  familyId: string | null;
  familyName: string;
}

export default function TimeCapsule({ familyId, familyName }: TimeCapsuleProps) {
  const [author, setAuthor] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'animating' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const prompts = [
    "O que você deseja para a Zoe quando crescer?",
    "Que conselho gostaria de deixar para ela?",
    "Como você imagina a Zoe no futuro?",
    "Que lembrança especial gostaria de compartilhar?"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim()) {
      setErrorMsg('Por favor, informe quem está escrevendo a mensagem.');
      return;
    }
    if (!message.trim()) {
      setErrorMsg('Por favor, escreva sua mensagem.');
      return;
    }

    setStatus('animating');
    setErrorMsg('');

    const [result] = await Promise.all([
      submitTimeCapsuleMessageAction(familyId, author, message),
      new Promise((resolve) => setTimeout(resolve, 2000))
    ]);

    if (result.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMsg(result.error || 'Erro ao salvar sua mensagem. Tente novamente.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="bg-daisy-white border border-rose-cream/40 p-6 md:p-8 rounded-3xl shadow-sm space-y-6 relative overflow-hidden"
    >
      <div className="text-center space-y-2">
        <span className="text-xs font-bold tracking-widest text-golden-honey uppercase block">
          Memória para o Futuro
        </span>
        <h2 className="font-title text-2xl text-soft-brown font-bold">
          Cápsula do Tempo da Zoe
        </h2>
        <p className="text-xs text-soft-brown/70 leading-relaxed max-w-sm mx-auto">
          A Zoe ainda é muito pequena e talvez não se lembre de todos os detalhes deste momento tão especial. 
          Deixe uma mensagem, um conselho ou um carinho para ela ler no futuro (quem sabe aos 15 anos... ou quando já for adulta).
        </p>
      </div>

      <AnimatePresence mode="wait">
        {status === 'idle' || status === 'error' ? (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Prompts Suggester */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-soft-brown/65 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-golden-honey" /> Ideias para inspirar:
              </span>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
                {prompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessage(p + " ")}
                    className="shrink-0 snap-center bg-vanilla-white/60 hover:bg-rose-cream/20 border border-rose-cream/25 text-[10px] text-soft-brown/85 font-bold px-3 py-2 rounded-xl transition duration-150 cursor-pointer text-left max-w-xs"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Author input */}
            <div>
              <label htmlFor="author" className="block text-xs font-bold text-soft-brown/75 uppercase tracking-wider mb-1">
                Quem está escrevendo:
              </label>
              <input
                id="author"
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Ex: Titia Maria, Primo João, Família Silva..."
                className="w-full p-3 bg-vanilla-white/65 border border-rose-cream/35 rounded-xl text-sm focus:outline-none focus:border-golden-honey text-soft-brown font-medium"
              />
            </div>

            {/* Message input */}
            <div>
              <label htmlFor="message" className="block text-xs font-bold text-soft-brown/75 uppercase tracking-wider mb-1">
                Mensagem para a Zoe:
              </label>
              <textarea
                id="message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escreva aqui seu carinho para a Zoe do futuro..."
                className="w-full p-3 bg-vanilla-white/65 border border-rose-cream/35 rounded-xl text-sm focus:outline-none focus:border-golden-honey text-soft-brown font-medium resize-none"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-500 text-center font-medium bg-rose-50 py-2 px-3 rounded-lg border border-rose-100">
                ⚠️ {errorMsg}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-golden-honey hover:bg-honey-yellow hover:text-soft-brown text-white font-bold rounded-2xl shadow-xs transition duration-200 cursor-pointer flex items-center justify-center gap-2 text-sm uppercase tracking-wider"
            >
              <Send className="w-4 h-4" /> Guardar na Cápsula
            </button>
          </motion.form>
        ) : status === 'animating' ? (
          <motion.div
            key="animating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-64 flex flex-col items-center justify-center relative"
          >
            <div className="absolute top-4 flex flex-col items-center">
              <motion.div
                animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-6xl text-golden-honey select-none filter drop-shadow-sm"
              >
                🍯
              </motion.div>
              <span className="text-[10px] font-bold text-soft-brown/50 uppercase tracking-widest mt-2">Cápsula</span>
            </div>

            <motion.div
              initial={{ y: 80, x: 0, scale: 0.8, opacity: 0 }}
              animate={{
                y: [80, 20, -25],
                x: [0, -35, 0],
                scale: [0.8, 1.2, 0.4],
                opacity: [0, 1, 1, 0],
              }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
              className="absolute text-golden-honey"
            >
              <Mail className="w-10 h-10 stroke-[1.5]" />
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.5, 0.8], opacity: [0, 0.5, 0] }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="absolute top-2 w-16 h-16 bg-honey-yellow/30 rounded-full filter blur-md"
            />

            <p className="text-xs text-soft-brown/60 font-semibold absolute bottom-4 animate-pulse uppercase tracking-wider">
              Enviando carta para a colmeia...
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-4"
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="w-16 h-16 bg-honey-yellow/20 rounded-full flex items-center justify-center mx-auto"
            >
              <Heart className="w-8 h-8 text-golden-honey fill-golden-honey" />
            </motion.div>

            <div className="space-y-1">
              <h3 className="font-title text-xl text-golden-honey font-bold">Mensagem Guardada!</h3>
              <p className="text-xs text-soft-brown/85 max-w-sm mx-auto leading-relaxed">
                Sua mensagem foi guardada com carinho na Cápsula do Tempo da Zoe. 🍯
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setMessage('');
                setStatus('idle');
              }}
              className="text-xs text-golden-honey hover:text-soft-brown underline font-semibold cursor-pointer"
            >
              Escrever outra mensagem?
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
