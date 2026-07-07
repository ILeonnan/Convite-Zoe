import { getDashboardStatsAction } from '@/app/actions';
import { MailOpen, UserCheck, Compass, Gift, CalendarCheck2, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const res = await getDashboardStatsAction();

  if (!res.success || !res.stats) {
    return (
      <div className="space-y-4">
        <h2 className="font-title text-2xl font-bold text-soft-brown">Painel Geral</h2>
        <p className="text-sm text-rose-500 font-semibold bg-rose-50 p-4 border border-rose-100 rounded-2xl">
          Erro ao carregar dados do banco de dados: {res.error}
        </p>
      </div>
    );
  }

  const { families, guests, clicks } = res.stats;

  const kpis = [
    {
      label: 'Famílias Convidadas',
      value: families.total,
      icon: <Users className="w-5 h-5 text-soft-brown/70" />,
      color: 'bg-vanilla-white border-rose-cream/40',
    },
    {
      label: 'Convites Abertos',
      value: families.opened,
      icon: <MailOpen className="w-5 h-5 text-golden-honey" />,
      color: 'bg-rose-cream/25 border-rose-cream/35',
    },
    {
      label: 'Famílias Confirmadas',
      value: families.confirmed,
      icon: <UserCheck className="w-5 h-5 text-emerald-500" />,
      color: 'bg-emerald-50/20 border-emerald-100',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-title text-2xl font-bold text-soft-brown">Painel Geral</h2>
        <p className="text-xs text-soft-brown/65 mt-0.5">Visão consolidada da colmeia de convidados da Zoe.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`p-4 border rounded-2xl flex items-center justify-between shadow-xs ${kpi.color}`}
          >
            <div>
              <p className="text-[10px] font-bold text-soft-brown/60 uppercase tracking-wider">{kpi.label}</p>
              <p className="text-2xl font-extrabold text-soft-brown mt-1">{kpi.value}</p>
            </div>
            <div className="shrink-0 p-2 bg-white/70 rounded-xl shadow-xs">
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Guest RSVPs summary */}
        <div className="bg-vanilla-white/30 border border-rose-cream/30 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-soft-brown text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-rose-cream/20 pb-2">
            Confirmados por Categoria
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-soft-brown/80 font-medium">Adultos Confirmados</span>
              <span className="font-bold text-soft-brown">{guests.adultsConfirmed}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-soft-brown/80 font-medium">Crianças Confirmadas</span>
              <span className="font-bold text-soft-brown">{guests.childrenConfirmed}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-soft-brown/80 font-medium">Bebês Confirmados</span>
              <span className="font-bold text-soft-brown">{guests.babiesConfirmed}</span>
            </div>
            <div className="pt-2 border-t border-rose-cream/15 flex justify-between items-center text-sm font-bold">
              <span className="text-soft-brown">Total Geral Confirmado</span>
              <span className="text-golden-honey">{guests.confirmed} pessoas</span>
            </div>
            <div className="flex justify-between items-center text-[10px] text-soft-brown/50 italic pt-1">
              <span>Recusaram: {guests.declined} • Pendentes: {guests.pending}</span>
              <span>Total na lista: {guests.total}</span>
            </div>
          </div>
        </div>

        {/* Analytics events summary */}
        <div className="bg-vanilla-white/30 border border-rose-cream/30 p-5 rounded-2xl space-y-4">
          <h3 className="font-bold text-soft-brown text-sm uppercase tracking-wider flex items-center gap-1.5 border-b border-rose-cream/20 pb-2">
            Interações no Convite
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-golden-honey" />
                <span className="text-soft-brown/80 font-medium">Aberturas de Localização (Mapas)</span>
              </div>
              <span className="font-bold text-soft-brown">{clicks.locationOpened} cliques</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-golden-honey" />
                <span className="text-soft-brown/80 font-medium">Visualizações de Presentes</span>
              </div>
              <span className="font-bold text-soft-brown">{clicks.giftViewed} visualizações</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-golden-honey" />
                <span className="text-soft-brown/80 font-medium">Sincronizações com Agenda</span>
              </div>
              <span className="font-bold text-soft-brown">{clicks.calendarAdded} cliques</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
