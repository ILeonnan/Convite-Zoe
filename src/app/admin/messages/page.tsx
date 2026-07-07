import { getMessagesAction } from '@/app/actions';
import { Calendar } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminMessagesPage() {
  const res = await getMessagesAction();
  const messages = res.success && res.messages ? res.messages : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-title text-2xl font-bold text-soft-brown">Cápsula do Tempo</h2>
        <p className="text-xs text-soft-brown/65 mt-0.5">Mensagens escritas pelos convidados para a Zoe ler no futuro.</p>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-12 text-soft-brown/50 italic border border-rose-cream/20 rounded-2xl bg-white/40">
          Nenhuma mensagem guardada na cápsula ainda. 🍯
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {messages.map((msg: any) => (
            <div
              key={msg.id}
              className="bg-vanilla-white border border-rose-cream/35 p-5 rounded-2xl shadow-xs relative overflow-hidden flex flex-col justify-between"
            >
              <div className="absolute top-2 right-2 text-lg opacity-40 select-none">🐝</div>
              
              <div className="space-y-3">
                <p className="text-xs text-soft-brown/85 font-medium leading-relaxed italic">
                  "{msg.message}"
                </p>
              </div>
              
              <div className="pt-4 border-t border-rose-cream/10 mt-4 flex justify-between items-center text-[10px] text-soft-brown/50 font-bold uppercase tracking-wider">
                <div>
                  Por: <span className="text-golden-honey">{msg.author_name}</span>
                  {msg.families?.name && <span className="text-soft-brown/40"> ({msg.families.name})</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-soft-brown/30" />
                  {new Date(msg.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
