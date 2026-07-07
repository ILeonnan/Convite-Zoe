'use client';

import { useState } from 'react';
import { Settings, Trash2, AlertTriangle } from 'lucide-react';
import { clearAllDataAction } from '@/app/actions';
import { useRouter } from 'next/navigation';

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

      {/* Em construção */}
      <div className="flex flex-col items-center justify-center py-10 gap-3 border border-dashed border-rose-cream/40 rounded-2xl bg-vanilla-white/30">
        <Settings className="w-8 h-8 text-golden-honey/50" />
        <p className="text-sm font-bold text-soft-brown/50">Templates em construção</p>
        <p className="text-xs text-soft-brown/40">Personalização das mensagens de convite e lembrete em breve.</p>
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
