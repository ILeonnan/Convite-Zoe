import { getAnalyticsEventsAction } from '@/app/actions';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  const res = await getAnalyticsEventsAction();
  const events = res.success && res.events ? res.events : [];

  const getEventBadge = (type: string) => {
    switch (type) {
      case 'invite_opened':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md uppercase border border-amber-100">Abriu Convite 🐝</span>;
      case 'location_opened':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md uppercase border border-blue-100">Ver Localização 🗺️</span>;
      case 'gift_viewed':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md uppercase border border-purple-100">Ver Presentes 🎁</span>;
      case 'confirmation_started':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md uppercase border border-orange-100">Iniciou RSVP 📝</span>;
      case 'confirmation_completed':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md uppercase border border-emerald-100">Confirmou RSVP ✅</span>;
      case 'calendar_added':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded-md uppercase border border-pink-100">Add Agenda 📅</span>;
      case 'message_sent':
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md uppercase border border-indigo-100">Cápsula Escrita ✉️</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-700 bg-gray-50 px-2 py-0.5 rounded-md uppercase border border-gray-100">{type}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-title text-2xl font-bold text-soft-brown">Fluxo de Métricas</h2>
        <p className="text-xs text-soft-brown/65 mt-0.5">Histórico de acessos e interações dos convidados na colmeia da Zoe.</p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12 text-soft-brown/50 italic border border-rose-cream/20 rounded-2xl bg-white/40">
          Nenhuma interação registrada ainda. 🍯
        </div>
      ) : (
        <div className="border border-rose-cream/25 rounded-2xl overflow-hidden bg-white/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-vanilla-white/70 text-soft-brown/65 uppercase tracking-wider font-bold border-b border-rose-cream/20">
                  <th className="p-3">Data e Hora</th>
                  <th className="p-3">Família</th>
                  <th className="p-3">Interação</th>
                  <th className="p-3">Dispositivo</th>
                  <th className="p-3">Navegador</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev: any) => (
                  <tr key={ev.id} className="border-b border-rose-cream/15 hover:bg-rose-cream/5 transition-colors">
                    <td className="p-3 text-soft-brown/60 font-medium">
                      {new Date(ev.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="p-3 font-bold text-soft-brown">
                      {ev.families?.name || 'Acesso Direto / Desconhecido'}
                    </td>
                    <td className="p-3">{getEventBadge(ev.event_type)}</td>
                    <td className="p-3 text-soft-brown/80 capitalize font-medium">{ev.device_type}</td>
                    <td className="p-3 text-soft-brown/80 font-medium">{ev.browser}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
