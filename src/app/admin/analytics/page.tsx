import { getAnalyticsEventsAction, getFamiliesAction } from '@/app/actions';

export const dynamic = 'force-dynamic';

const COLUMNS: { key: string; label: string; emoji: string; binary?: boolean }[] = [
  { key: 'invite_opened',         label: 'Abriu',       emoji: '📩' },
  { key: 'location_opened',       label: 'Localização', emoji: '🗺️' },
  { key: 'gift_viewed',           label: 'Presentes',   emoji: '🎁' },
  { key: 'confirmation_completed',label: 'Confirmou',   emoji: '✅', binary: true },
  { key: 'calendar_added',        label: 'Agenda',      emoji: '📅', binary: true },
];

export default async function AdminAnalyticsPage() {
  const [eventsRes, familiesRes] = await Promise.all([
    getAnalyticsEventsAction(),
    getFamiliesAction(),
  ]);

  const events = eventsRes.success && eventsRes.events ? eventsRes.events : [];
  const families = familiesRes.success && familiesRes.families ? familiesRes.families : [];

  // Agrupa eventos por família
  const byFamily: Record<string, Record<string, number>> = {};
  for (const ev of events) {
    const famId = ev.family_id || '__desconhecido__';
    if (!byFamily[famId]) byFamily[famId] = {};
    byFamily[famId][ev.event_type] = (byFamily[famId][ev.event_type] || 0) + 1;
  }

  // Junta famílias cadastradas com seus eventos
  const rows = families.map(fam => ({
    id: fam.id,
    name: fam.name,
    responsible: fam.responsible,
    status: fam.status,
    events: byFamily[fam.id] || {},
  }));

  // Famílias com eventos mas não cadastradas (edge case)
  for (const [famId, evMap] of Object.entries(byFamily)) {
    if (famId === '__desconhecido__') continue;
    if (!rows.find(r => r.id === famId)) {
      rows.push({ id: famId, name: '(removida)', responsible: '', status: '', events: evMap });
    }
  }

  // Totais por coluna
  const totals: Record<string, number> = {};
  for (const col of COLUMNS) {
    totals[col.key] = rows.reduce((acc, r) => acc + (r.events[col.key] || 0), 0);
  }

  const statusColor: Record<string, string> = {
    pending:   'bg-gray-100 text-gray-500',
    sent:      'bg-blue-50 text-blue-600',
    opened:    'bg-amber-50 text-amber-600',
    confirmed: 'bg-emerald-50 text-emerald-600',
    declined:  'bg-rose-50 text-rose-500',
  };
  const statusLabel: Record<string, string> = {
    pending: 'Pendente', sent: 'Enviado', opened: 'Aberto',
    confirmed: 'Confirmado', declined: 'Recusou',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-title text-2xl font-bold text-soft-brown">Métricas</h2>
        <p className="text-xs text-soft-brown/65 mt-0.5">Interações de cada convidado no convite.</p>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-12 text-soft-brown/50 italic border border-rose-cream/20 rounded-2xl bg-white/40">
          Nenhuma interação registrada ainda. 🍯
        </div>
      ) : (
        <div className="border border-rose-cream/25 rounded-2xl overflow-hidden bg-white/30">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-vanilla-white/80 border-b border-rose-cream/25">
                  <th className="px-4 py-3 text-soft-brown/60 font-bold uppercase tracking-wider whitespace-nowrap">Convidado</th>
                  <th className="px-3 py-3 text-soft-brown/60 font-bold uppercase tracking-wider whitespace-nowrap">Status</th>
                  {COLUMNS.map(col => (
                    <th key={col.key} className="px-3 py-3 text-center text-soft-brown/60 font-bold uppercase tracking-wider whitespace-nowrap">
                      <span className="block">{col.emoji}</span>
                      <span>{col.label}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.id} className={`border-b border-rose-cream/15 ${i % 2 === 0 ? 'bg-white/20' : ''}`}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-soft-brown">{row.name}</p>
                      {row.responsible && (
                        <p className="text-soft-brown/50 text-[10px]">{row.responsible}</p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {row.status ? (
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[row.status] || 'bg-gray-100 text-gray-500'}`}>
                          {statusLabel[row.status] || row.status}
                        </span>
                      ) : '—'}
                    </td>
                    {COLUMNS.map(col => {
                      const count = row.events[col.key] || 0;
                      return (
                        <td key={col.key} className="px-3 py-3 text-center">
                          {count > 0 ? (
                            col.binary ? (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 font-extrabold text-[13px]">✓</span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-golden-honey/15 text-golden-honey font-extrabold text-[11px]">
                                {count > 9 ? '9+' : count}
                              </span>
                            )
                          ) : (
                            <span className="text-soft-brown/20 font-bold">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-vanilla-white/60 border-t border-rose-cream/30">
                  <td className="px-4 py-3 font-bold text-soft-brown/70 text-[10px] uppercase tracking-wider" colSpan={2}>Total de interações</td>
                  {COLUMNS.map(col => {
                    const val = col.binary
                      ? rows.filter(r => (r.events[col.key] || 0) > 0).length
                      : (totals[col.key] || 0);
                    return (
                      <td key={col.key} className="px-3 py-3 text-center">
                        <span className="font-extrabold text-soft-brown">{val}</span>
                        {col.binary && <span className="text-soft-brown/40 text-[10px] ml-0.5">fam.</span>}
                      </td>
                    );
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
