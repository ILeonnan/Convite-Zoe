import { Settings } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-title text-2xl font-bold text-soft-brown">Configurações</h2>
        <p className="text-xs text-soft-brown/65 mt-0.5">Templates de mensagem e preferências do sistema.</p>
      </div>

      {/* Em construção */}
      <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-rose-cream/40 rounded-2xl bg-vanilla-white/30">
        <Settings className="w-8 h-8 text-golden-honey/50" />
        <p className="text-sm font-bold text-soft-brown/50">Configurações em construção</p>
        <p className="text-xs text-soft-brown/40">Templates de convite e lembrete em breve.</p>
      </div>
    </div>
  );
}
