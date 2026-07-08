'use client';

import { useState } from 'react';
import { Settings, Trash2, AlertTriangle, Copy, Check, MessageCircle, Bell } from 'lucide-react';
import { clearAllDataAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

const INVITE_TEMPLATE = `Olá, *{nome}*! Tudo bem? 🐝
Estamos muito felizes em convidar vocês para comemorar o primeiro aninho da Zoe!
Preparamos um convite personalizado e interativo para vocês:

{link}

Esperamos vocês na nossa doce colmeia! 🍯🌼`;

const REMINDER_TEMPLATE = `Olá, *{nome}*! Passando para lembrar de confirmar a presença para o primeiro aninho da Zoe. 🌼

{link}

Se puder nos responder até dia 10 de Agosto, agradecemos muito! 🐝`;

function TemplateCard({ title, icon, template }: { title: string; icon: React.ReactNode; template: string }) {
  const [preview, setPreview] = useState('');
  const [copied, setCopied] = useState(false);

  const rendered = template
    .replace('{nome}', preview || '{nome}')
    .replace('{link}', 'https://zoe1-aninho.vercel.app/invite/TOKEN');

  const handleCopy = () => {
    navigator.clipboard.writeText(rendered);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border border-rose-cream/30 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 bg-vanilla-white/60 border-b border-rose-cream/20">
        {icon}
        <span className="text-sm font-bold text-soft-brown">{title}</span>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-soft-brown/50 uppercase tracking-wider mb-1">
            Prévia com nome do convidado:
          </label>
          <input
            type="text"
            value={preview}
            onChange={(e) => setPreview(e.target.value)}
            placeholder="Ex: Ana Silva"
            className="w-full px-3 py-2 bg-white border border-rose-cream/30 rounded-xl text-xs text-soft-brown focus:outline-none focus:border-golden-honey"
          />
        </div>
        <pre className="whitespace-pre-wrap text-xs text-soft-brown/80 bg-vanilla-white/80 border border-rose-cream/20 rounded-xl p-3 font-[inherit] leading-relaxed">
          {rendered}
        </pre>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 bg-golden-honey hover:brightness-105 text-white font-bold rounded-xl text-xs transition cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiado!' : 'Copiar mensagem'}
        </button>
      </div>
    </div>
  );
}

export default function ConfiguracoesPage() {
  const router = useRouter();
  const [clearing, setClearing] = useState(false);
  const [confirm, setConfirm] = useState('');

  const handleClearAll = async () => {
    if (confirm !== 'ZERAR') return;
    setClearing(true);
    const res = await clearAllDataAction();
    setClearing(false);
    if (res.success) {
      setConfirm('');
      alert('Todos os dados foram apagados.');
      router.refresh();
      setTimeout(() => window.location.reload(), 300);
    } else {
      alert('Erro ao zerar: ' + res.error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-title text-2xl font-bold text-soft-brown">Configurações</h2>
        <p className="text-xs text-soft-brown/65 mt-0.5">Templates de mensagem e preferências do sistema.</p>
      </div>

      {/* Templates de mensagem */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-soft-brown">Mensagens WhatsApp</h3>
          <p className="text-xs text-soft-brown/55 mt-0.5">
            Copie a mensagem e envie pelo WhatsApp. O link é gerado automaticamente na tela de Convidados ao clicar em Enviar ou Lembrar.
          </p>
        </div>
        <TemplateCard
          title="Convite"
          icon={<MessageCircle className="w-4 h-4 text-emerald-600" />}
          template={INVITE_TEMPLATE}
        />
        <TemplateCard
          title="Lembrete"
          icon={<Bell className="w-4 h-4 text-amber-500" />}
          template={REMINDER_TEMPLATE}
        />
      </div>

      {/* Zona de perigo */}
      <div className="border border-rose-200 rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 bg-rose-50 border-b border-rose-200">
          <AlertTriangle className="w-4 h-4 text-rose-500" />
          <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">Zona de Perigo</span>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-sm font-bold text-soft-brown mb-1">Zerar todos os dados</p>
            <p className="text-xs text-soft-brown/60 mb-3">
              Apaga <strong>todas</strong> as famílias, convidados e eventos de analytics. Use apenas para limpar dados de teste. Esta ação é <strong>irreversível</strong>.
            </p>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value.toUpperCase())}
                placeholder='Digite "ZERAR" para confirmar'
                className="flex-1 px-3 py-2 bg-white border border-rose-200 rounded-xl text-xs focus:outline-none focus:border-rose-400 text-soft-brown"
              />
              <button
                onClick={handleClearAll}
                disabled={confirm !== 'ZERAR' || clearing}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl text-xs transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {clearing ? 'Zerando...' : 'Zerar tudo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
