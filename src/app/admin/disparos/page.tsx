import { getFamiliesAction } from '@/app/actions';
import { Send } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DisparosPage() {
  const res = await getFamiliesAction();
  const families = res.success && res.families ? res.families : [];

  const pending = families.filter(f => f.status === 'pending');
  const sent = families.filter(f => f.status === 'sent');
  const opened = families.filter(f => f.status === 'opened');
  const notConfirmed = families.filter(f => f.status === 'sent' || f.status === 'opened');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-title text-2xl font-bold text-soft-brown">Disparos</h2>
        <p className="text-xs text-soft-brown/65 mt-0.5">Envie convites e lembretes via WhatsApp.</p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Aguardando envio', value: pending.length, color: 'bg-vanilla-white border-rose-cream/40' },
          { label: 'Convite enviado', value: sent.length, color: 'bg-blue-50/40 border-blue-100' },
          { label: 'Convite aberto', value: opened.length, color: 'bg-amber-50/40 border-amber-100' },
          { label: 'Sem resposta', value: notConfirmed.length, color: 'bg-rose-50/40 border-rose-100' },
        ].map((s, i) => (
          <div key={i} className={`p-4 border rounded-2xl ${s.color}`}>
            <p className="text-[10px] font-bold text-soft-brown/60 uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-extrabold text-soft-brown mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Em construção */}
      <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-rose-cream/40 rounded-2xl bg-vanilla-white/30">
        <Send className="w-8 h-8 text-golden-honey/50" />
        <p className="text-sm font-bold text-soft-brown/50">Módulo de disparos em construção</p>
        <p className="text-xs text-soft-brown/40">Templates e envio em lote em breve.</p>
      </div>
    </div>
  );
}
