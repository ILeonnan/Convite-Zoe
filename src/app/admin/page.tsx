import { getDashboardStatsAction } from '@/app/actions';
import { MailOpen, UserCheck, Compass, Gift, CalendarCheck2, Users } from 'lucide-react';

export const revalidate = 30;

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-title text-3xl font-extrabold" style={{ background: 'linear-gradient(90deg, #E8891A, #F5A623)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Painel Geral
        </h2>
        <p className="text-xs text-soft-brown/65 mt-0.5">Visão consolidada da colmeia de convidados da Zoe. 🐝</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Convites */}
        <div className="relative overflow-hidden rounded-2xl p-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #FFF3DC 0%, #FFE8B2 100%)', border: '1.5px solid #F5C842' }}>
          <div className="absolute right-3 top-3 opacity-20 text-4xl">✉️</div>
          <p className="text-[10px] font-extrabold text-amber-700 uppercase tracking-wider mb-1">Convites</p>
          <p className="text-3xl font-black text-amber-900">{families.total}</p>
          <p className="text-[10px] text-amber-600 font-semibold mt-1">famílias cadastradas</p>
        </div>

        {/* Convidados */}
        <div className="relative overflow-hidden rounded-2xl p-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #FDE9FF 0%, #F0BFFD 100%)', border: '1.5px solid #E0A6F5' }}>
          <div className="absolute right-3 top-3 opacity-20 text-4xl">👥</div>
          <p className="text-[10px] font-extrabold text-fuchsia-700 uppercase tracking-wider mb-1">Convidados</p>
          <p className="text-3xl font-black text-fuchsia-900">{guests.total}</p>
          <p className="text-[10px] text-fuchsia-600 font-semibold mt-1">pessoas no total</p>
        </div>

        {/* Abriram */}
        <div className="relative overflow-hidden rounded-2xl p-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #EBF5FF 0%, #BFDBFE 100%)', border: '1.5px solid #93C5FD' }}>
          <div className="absolute right-3 top-3 opacity-20 text-4xl">💌</div>
          <p className="text-[10px] font-extrabold text-blue-700 uppercase tracking-wider mb-1">Abriram</p>
          <p className="text-3xl font-black text-blue-900">{families.opened}</p>
          <p className="text-[10px] text-blue-600 font-semibold mt-1">visualizaram o convite</p>
        </div>

        {/* Confirmados */}
        <div className="relative overflow-hidden rounded-2xl p-4 shadow-sm" style={{ background: 'linear-gradient(135deg, #DCFCE7 0%, #86EFAC 100%)', border: '1.5px solid #4ADE80' }}>
          <div className="absolute right-3 top-3 opacity-20 text-4xl">✅</div>
          <p className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider mb-1">Confirmados</p>
          <p className="text-3xl font-black text-emerald-900">{guests.confirmed}</p>
          <p className="text-[10px] text-emerald-600 font-semibold mt-1">{families.confirmed} famílias · {guests.declined} recusaram</p>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">

        {/* Cadastrados x Confirmados por categoria */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-amber-100">
          <div className="px-5 py-3" style={{ background: 'linear-gradient(90deg, #F5A623, #FFD95A)' }}>
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">🎉 Convidados por categoria</h3>
          </div>
          <div className="p-5 space-y-3 bg-white/80">
            <div className="grid grid-cols-3 gap-2 text-[9px] font-bold text-soft-brown/40 uppercase tracking-wider px-1">
              <span>Categoria</span>
              <span className="text-center">Cadastrados</span>
              <span className="text-center">Confirmados</span>
            </div>
            {[
              { label: 'Adultos', total: guests.adultsTotal, confirmed: guests.adultsConfirmed, color: 'bg-violet-100 text-violet-700' },
              { label: 'Crianças', total: guests.childrenTotal, confirmed: guests.childrenConfirmed, color: 'bg-pink-100 text-pink-700' },
              { label: 'Bebês (colo)', total: guests.babiesTotal, confirmed: guests.babiesConfirmed, color: 'bg-sky-100 text-sky-700' },
            ].map(({ label, total, confirmed, color }) => (
              <div key={label} className="grid grid-cols-3 gap-2 items-center">
                <span className={`text-xs font-bold px-3 py-1 rounded-full text-center ${color}`}>{label}</span>
                <span className="text-lg font-black text-soft-brown/70 text-center">{total}</span>
                <span className="text-lg font-black text-emerald-600 text-center">{confirmed}</span>
              </div>
            ))}
            <div className="pt-3 border-t border-amber-100 grid grid-cols-3 gap-2 items-center">
              <span className="text-sm font-extrabold text-soft-brown">Total</span>
              <span className="text-xl font-black text-soft-brown/70 text-center">{guests.total}</span>
              <span className="text-xl font-black text-emerald-600 text-center">{guests.confirmed}</span>
            </div>
            <p className="text-[10px] text-soft-brown/45 italic">
              Pendentes: {guests.pending} · Recusaram: {guests.declined}
            </p>
          </div>
        </div>

        {/* Interações */}
        <div className="rounded-2xl overflow-hidden shadow-sm border border-amber-100">
          <div className="px-5 py-3" style={{ background: 'linear-gradient(90deg, #8B5CF6, #A78BFA)' }}>
            <h3 className="font-extrabold text-white text-sm uppercase tracking-wider">📊 Interações</h3>
          </div>
          <div className="p-5 space-y-3 bg-white/80">
            {[
              { icon: <Compass className="w-4 h-4" />, label: 'Localização aberta', value: clicks.locationOpened, color: 'text-amber-500 bg-amber-50' },
              { icon: <Gift className="w-4 h-4" />, label: 'Lista de presentes', value: clicks.giftViewed, color: 'text-pink-500 bg-pink-50' },
              { icon: <CalendarCheck2 className="w-4 h-4" />, label: 'Agenda sincronizada', value: clicks.calendarAdded, color: 'text-emerald-500 bg-emerald-50' },
              { icon: <MailOpen className="w-4 h-4" />, label: 'RSVP aberto', value: clicks.rsvpOpened ?? 0, color: 'text-blue-500 bg-blue-50' },
            ].map(({ icon, label, value, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg ${color}`}>{icon}</span>
                  <span className="text-xs font-semibold text-soft-brown/80">{label}</span>
                </div>
                <span className="text-base font-black text-soft-brown">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
