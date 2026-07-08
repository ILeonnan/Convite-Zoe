'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Plus, Upload, Trash2, Copy, Check,
  MessageCircle, Bell, ChevronDown, ChevronUp, X, Download, FileSpreadsheet, RotateCcw,
} from 'lucide-react';
import {
  addFamilyAction, deleteFamilyAction,
  bulkAddFamiliesAction, updateFamilySentStatusAction,
  resetFamilyConfirmationAction,
} from '@/app/actions';

interface Guest {
  id: string; name: string;
  type: 'adult' | 'child' | 'baby';
  status: 'confirmed' | 'declined' | 'pending';
}
interface Family {
  id: string; name: string; responsible: string;
  phone: string; token: string; status: string;
  sent_at: string | null; guests: Guest[];
}
interface AnalyticsEvent { family_id: string; event_type: string; }

interface Props {
  initialFamilies: Family[];
  analyticsEvents?: AnalyticsEvent[];
}

const METRICS = [
  { key: 'invite_opened',          emoji: '📩', label: 'Abriu',     binary: false },
  { key: 'location_opened',        emoji: '🗺️', label: 'Local',     binary: false },
  { key: 'gift_viewed',            emoji: '🎁', label: 'Presentes', binary: false },
  { key: 'confirmation_completed', emoji: '✅', label: 'Confirmou', binary: true  },
  { key: 'calendar_added',         emoji: '📅', label: 'Agenda',    binary: true  },
];

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Pendente',  cls: 'bg-gray-100 text-gray-500' },
  sent:      { label: 'Enviado',   cls: 'bg-blue-50 text-blue-600' },
  opened:    { label: 'Abriu',     cls: 'bg-amber-50 text-amber-700' },
  confirmed: { label: 'Confirmou', cls: 'bg-emerald-50 text-emerald-700' },
  declined:  { label: 'Recusou',   cls: 'bg-rose-50 text-rose-500' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.pending;
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  );
}

function MetricDot({ count, binary }: { count: number; binary: boolean }) {
  if (!count) return <span className="text-soft-brown/20 text-xs font-bold">–</span>;
  if (binary) return <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-[10px] font-extrabold">✓</span>;
  return <span className="w-4 h-4 inline-flex items-center justify-center rounded-full bg-golden-honey/15 text-golden-honey text-[10px] font-extrabold">{count > 9 ? '9+' : count}</span>;
}

function GuestRoster({ guests }: { guests: Guest[] }) {
  const confirmed = guests.filter((g) => g.status === 'confirmed');
  const declined  = guests.filter((g) => g.status === 'declined');
  const pending   = guests.filter((g) => g.status === 'pending');
  if (!guests.length) return null;
  return (
    <div className="space-y-1.5">
      {confirmed.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {confirmed.map((g) => (
            <span key={g.id} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold">
              ✓ {g.name}
              <span className="text-emerald-400 font-normal">{g.type === 'child' ? ' (criança)' : g.type === 'baby' ? ' (bebê)' : ''}</span>
            </span>
          ))}
        </div>
      )}
      {declined.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {declined.map((g) => (
            <span key={g.id} className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-500 rounded-full text-[10px] font-bold line-through decoration-rose-300">
              {g.name}
            </span>
          ))}
        </div>
      )}
      {pending.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {pending.map((g) => (
            <span key={g.id} className="px-2 py-0.5 bg-gray-50 border border-gray-100 text-gray-400 rounded-full text-[10px]">
              ? {g.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FamiliesManager({ initialFamilies, analyticsEvents = [] }: Props) {
  const router = useRouter();
  const [families, setFamilies] = useState<Family[]>(initialFamilies);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [responsible, setResponsible] = useState('');
  const [phone, setPhone] = useState('');
  const [guestInputs, setGuestInputs] = useState<{ name: string; type: 'adult' | 'child' | 'baby' }[]>([]);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');

  // Analytics lookup map
  const evMap: Record<string, Record<string, number>> = {};
  for (const ev of analyticsEvents) {
    if (!ev.family_id) continue;
    if (!evMap[ev.family_id]) evMap[ev.family_id] = {};
    evMap[ev.family_id][ev.event_type] = (evMap[ev.family_id][ev.event_type] || 0) + 1;
  }

  // Filtered list
  const filtered = families.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch = f.name.toLowerCase().includes(q) ||
      f.responsible.toLowerCase().includes(q) ||
      f.guests.some((g) => g.name.toLowerCase().includes(q));
    return matchSearch && (filterStatus === 'all' || f.status === filterStatus);
  });

  // Handlers
  const handleCopyLink = (token: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/invite/${token}`);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleWhatsApp = async (fam: Family, isReminder = false) => {
    let clean = fam.phone.replace(/\D/g, '');
    if (clean.length === 10 || clean.length === 11) clean = '55' + clean;
    const link = `${window.location.origin}/invite/${fam.token}`;
    const text = isReminder
      ? `Olá, *${fam.responsible}*! Passando para lembrar de confirmar a presença para o primeiro aninho da Zoe. 🌼\n\n${link}\n\nSe puder nos responder até dia 10 de Agosto, agradecemos muito! 🐝`
      : `Olá, *${fam.responsible}*! Tudo bem? 🐝\nEstamos muito felizes em convidar vocês para comemorar o primeiro aninho da Zoe!\nPreparamos um convite personalizado e interativo para vocês:\n\n${link}\n\nEsperamos vocês na nossa doce colmeia! 🍯🌼`;
    window.open(`https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(text)}`, '_blank');
    await updateFamilySentStatusAction(fam.id, true);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta família?')) return;
    const res = await deleteFamilyAction(id);
    if (res.success) { router.refresh(); setTimeout(() => window.location.reload(), 500); }
    else alert('Erro ao excluir.');
  };

  const handleResetConfirmation = async (id: string, name: string) => {
    if (!confirm(`Resetar confirmação de "${name}"?\n\nTodos os integrantes voltarão para Pendente e o convidado poderá confirmar novamente.`)) return;
    const res = await resetFamilyConfirmationAction(id);
    if (res.success) { router.refresh(); setTimeout(() => window.location.reload(), 500); }
    else alert('Erro ao resetar.');
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responsible.trim() || !phone.trim()) return alert('Nome e Telefone são obrigatórios!');
    const extras = guestInputs.filter((g) => g.name.trim());
    // O responsável é automaticamente o primeiro convidado adulto
    const allGuests = [{ name: responsible.trim(), type: 'adult' as const }, ...extras];
    const res = await addFamilyAction(responsible.trim(), responsible.trim(), phone, allGuests);
    if (res.success) {
      setShowAddModal(false); setResponsible(''); setPhone('');
      setGuestInputs([]);
      setTimeout(() => window.location.reload(), 500);
    } else alert(res.error || 'Erro ao adicionar.');
  };

  const handleExcelImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!excelFile) return setErrorMsg('Selecione um arquivo .xlsx.');
    setErrorMsg('');
    startTransition(async () => {
      try {
        const XLSX = await import('xlsx');
        const buffer = await excelFile.arrayBuffer();
        const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

        const parsed: { responsible: string; phone: string; familyName: string; guests: { name: string; type: 'adult' | 'child' | 'baby' }[] }[] = [];

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          const responsible = String(row[0] ?? '').trim();
          const phone       = String(row[1] ?? '').trim();
          const groupName   = String(row[2] ?? '').trim();
          if (!responsible || !phone) continue;

          const guests: { name: string; type: 'adult' | 'child' | 'baby' }[] = [];
          for (let m = 0; m < 5; m++) {
            const name = String(row[3 + m * 2] ?? '').trim();
            const raw  = String(row[4 + m * 2] ?? '').trim().toLowerCase();
            if (!name) continue;
            const type: 'adult' | 'child' | 'baby' =
              raw.includes('crian') ? 'child' : raw.includes('beb') ? 'baby' : 'adult';
            guests.push({ name, type });
          }
          if (!guests.length) guests.push({ name: responsible, type: 'adult' });

          parsed.push({
            responsible,
            phone,
            familyName: groupName || `Família ${responsible.split(' ').pop()}`,
            guests,
          });
        }

        if (!parsed.length) return setErrorMsg('Nenhuma linha válida encontrada. Verifique se usou o modelo correto.');
        const result = await bulkAddFamiliesAction(parsed);
        if (result.success) { setShowImportModal(false); setExcelFile(null); window.location.reload(); }
        else setErrorMsg(result.error || 'Erro ao importar.');
      } catch (err: any) { setErrorMsg('Erro ao ler planilha: ' + err.message); }
    });
  };

  const exportCSV = () => {
    const rows = families.map((f) => {
      const confirmed = f.guests.filter((g) => g.status === 'confirmed').map((g) => g.name).join(' | ');
      const pending   = f.guests.filter((g) => g.status === 'pending').map((g) => g.name).join(' | ');
      return [f.name, f.responsible, f.phone, STATUS_MAP[f.status]?.label ?? f.status, confirmed, pending].map((v) => `"${v}"`).join(',');
    });
    const csv = ['﻿' + 'Família,Responsável,Telefone,Status,Confirmados,Pendentes', ...rows].join('\n');
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })), download: 'convidados-zoe.csv' });
    a.click();
  };

  const exportBuffet = async () => {
    const XLSXStyle = (await import('xlsx-js-style')).default;
    const typeLabel: Record<string, string> = { adult: 'Adulto', child: 'Criança', baby: 'Bebê (colo)' };

    const golden = { patternType: 'solid', fgColor: { rgb: 'E8891A' } };
    const hFont  = { bold: true, color: { rgb: 'FFFFFF' }, sz: 12, name: 'Arial' };
    const hAlign = { horizontal: 'center', vertical: 'center' };
    const dFont  = { sz: 11, name: 'Arial' };
    const altFill = { patternType: 'solid', fgColor: { rgb: 'FFF8EC' } };

    const ws: Record<string, any> = {};

    // Title merged header
    ws['A1'] = { v: '🐝  Lista de Convidados Confirmados — Aniversário da Zoe', t: 's', s: { fill: golden, font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 14, name: 'Arial' }, alignment: hAlign } };
    ws['B1'] = { v: '', t: 's', s: { fill: golden, font: hFont, alignment: hAlign } };
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

    // Column headers
    ws['A2'] = { v: 'Nome do Convidado', t: 's', s: { fill: { patternType: 'solid', fgColor: { rgb: 'FFF3C4' } }, font: { bold: true, sz: 11, name: 'Arial', color: { rgb: '5C3200' } }, alignment: hAlign } };
    ws['B2'] = { v: 'Categoria',         t: 's', s: { fill: { patternType: 'solid', fgColor: { rgb: 'FFF3C4' } }, font: { bold: true, sz: 11, name: 'Arial', color: { rgb: '5C3200' } }, alignment: hAlign } };

    let row = 3;
    const confirmed = families.flatMap((f) => f.guests.filter((g) => g.status === 'confirmed').map((g) => ({ ...g, family: f.name })));
    for (const g of confirmed) {
      const even = row % 2 === 0;
      const fill = even ? altFill : { patternType: 'solid', fgColor: { rgb: 'FFFFFF' } };
      ws[`A${row}`] = { v: g.name,                     t: 's', s: { fill, font: dFont, alignment: { vertical: 'center' } } };
      ws[`B${row}`] = { v: typeLabel[g.type] ?? g.type, t: 's', s: { fill, font: dFont, alignment: { horizontal: 'center', vertical: 'center' } } };
      row++;
    }

    // Totals row
    const adults   = confirmed.filter((g) => g.type === 'adult').length;
    const children = confirmed.filter((g) => g.type === 'child').length;
    const babies   = confirmed.filter((g) => g.type === 'baby').length;
    ws[`A${row}`] = { v: `Total: ${confirmed.length} confirmado${confirmed.length !== 1 ? 's' : ''}`, t: 's', s: { fill: golden, font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 11, name: 'Arial' }, alignment: { vertical: 'center' } } };
    ws[`B${row}`] = { v: `${adults} adulto${adults !== 1 ? 's' : ''} · ${children} criança${children !== 1 ? 's' : ''} · ${babies} bebê${babies !== 1 ? 's' : ''}`, t: 's', s: { fill: golden, font: { bold: true, color: { rgb: 'FFFFFF' }, sz: 10, name: 'Arial' }, alignment: { horizontal: 'center', vertical: 'center' } } };

    ws['!ref']  = XLSXStyle.utils.encode_range({ s: { c: 0, r: 0 }, e: { c: 1, r: row } });
    ws['!cols'] = [{ wch: 36 }, { wch: 18 }];
    ws['!rows'] = [{ hpt: 30 }, { hpt: 22 }, ...Array(row - 2).fill({ hpt: 20 })];

    const wb = XLSXStyle.utils.book_new();
    XLSXStyle.utils.book_append_sheet(wb, ws, 'Lista Buffet');
    XLSXStyle.writeFile(wb, 'lista-buffet-zoe.xlsx');
  };

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-title text-xl font-bold text-soft-brown">Convidados</h2>
            <p className="text-[11px] text-soft-brown/55 mt-0.5">Lista, disparos e métricas em um só lugar.</p>
          </div>
          {/* Icon-only group — always fits */}
          <div className="flex gap-1.5 shrink-0">
            <button onClick={exportBuffet} title="Exportar para Buffet"
              className="flex items-center gap-1 px-2.5 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl text-xs transition cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buffet</span>
            </button>
            <button onClick={exportCSV} title="Exportar CSV"
              className="p-2 bg-vanilla-white border border-rose-cream/40 hover:bg-rose-cream/15 text-soft-brown/70 rounded-xl transition cursor-pointer">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={() => setShowImportModal(true)} title="Importar Planilha"
              className="p-2 bg-vanilla-white border border-rose-cream/40 hover:bg-rose-cream/15 text-soft-brown/70 rounded-xl transition cursor-pointer">
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Add button — full width on mobile, auto on desktop */}
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-1.5 w-full sm:w-auto sm:inline-flex px-4 py-2.5 bg-golden-honey hover:brightness-105 text-white font-bold rounded-xl text-sm transition cursor-pointer">
          <Plus className="w-4 h-4" /> Adicionar Convidado
        </button>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-soft-brown/35 absolute left-3 top-2.5" />
          <input type="text" placeholder="Buscar família ou pessoa..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 bg-white/60 border border-rose-cream/30 rounded-xl text-xs focus:outline-none focus:border-golden-honey text-soft-brown" />
        </div>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
          className="px-2.5 py-2 bg-white/60 border border-rose-cream/30 rounded-xl text-xs text-soft-brown font-semibold focus:outline-none focus:border-golden-honey">
          <option value="all">Todos</option>
          <option value="pending">Pendentes</option>
          <option value="sent">Enviados</option>
          <option value="opened">Abriram</option>
          <option value="confirmed">Confirmados</option>
          <option value="declined">Recusados</option>
        </select>
      </div>

      {/* ── MOBILE: Cards ── */}
      <div className="md:hidden space-y-3">
        {filtered.length === 0 && (
          <p className="text-center text-soft-brown/40 italic py-10 text-sm">Nenhuma família encontrada.</p>
        )}
        {filtered.map((fam) => {
          const isExpanded = expandedId === fam.id;
          const ev = evMap[fam.id] || {};
          const confirmed = fam.guests.filter((g) => g.status === 'confirmed').length;
          const canRemind = fam.status === 'sent' || fam.status === 'opened';

          return (
            <div key={fam.id} className="bg-white/70 border border-rose-cream/25 rounded-2xl overflow-hidden shadow-xs">
              {/* Top row */}
              <div className="flex items-center justify-between px-4 pt-3.5 pb-2 gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-soft-brown text-sm truncate">{fam.name}</p>
                  <p className="text-[11px] text-soft-brown/50 truncate">{fam.responsible} · {fam.phone}</p>
                </div>
                <StatusBadge status={fam.status} />
              </div>

              {/* Metrics row */}
              <div className="flex items-center gap-3 px-4 py-2 border-t border-rose-cream/15">
                {METRICS.map((m) => (
                  <div key={m.key} className="flex flex-col items-center gap-0.5">
                    <span className="text-sm leading-none">{m.emoji}</span>
                    <MetricDot count={ev[m.key] || 0} binary={m.binary} />
                  </div>
                ))}
                <div className="ml-auto text-[11px] text-soft-brown/50 font-semibold whitespace-nowrap">
                  {confirmed}/{fam.guests.length} ✓
                </div>
              </div>

              {/* Guest roster */}
              <div className="px-4 py-2.5 border-t border-rose-cream/15">
                <GuestRoster guests={fam.guests} />
              </div>

              {/* Actions row */}
              <div className="flex items-center gap-2 px-4 py-2.5 border-t border-rose-cream/15 bg-vanilla-white/30">
                <button onClick={() => handleWhatsApp(fam, false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs transition cursor-pointer">
                  <MessageCircle className="w-3.5 h-3.5" /> Enviar
                </button>
                {canRemind && (
                  <button onClick={() => handleWhatsApp(fam, true)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition cursor-pointer">
                    <Bell className="w-3.5 h-3.5" /> Lembrar
                  </button>
                )}
                <button onClick={() => handleCopyLink(fam.token)}
                  className="p-2 bg-white border border-rose-cream/30 hover:bg-rose-cream/10 text-soft-brown/70 rounded-xl cursor-pointer">
                  {copiedToken === fam.token ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => handleDelete(fam.id)}
                  className="p-2 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-500 rounded-xl cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                {(fam.status === 'confirmed' || fam.status === 'declined') && (
                  <button onClick={() => handleResetConfirmation(fam.id, fam.name)} title="Liberar reconfirmação"
                    className="p-2 bg-amber-50 border border-amber-100 hover:bg-amber-100 text-amber-600 rounded-xl cursor-pointer">
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
                <button onClick={() => setExpandedId(isExpanded ? null : fam.id)}
                  className="p-2 bg-white border border-rose-cream/30 text-soft-brown/50 rounded-xl cursor-pointer">
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Expandable guests */}
              {isExpanded && (
                <div className="px-4 py-3 bg-vanilla-white/50 border-t border-rose-cream/15 space-y-2">
                  <p className="text-[10px] font-bold text-soft-brown/50 uppercase tracking-wider">Integrantes</p>
                  {fam.guests.map((g) => (
                    <div key={g.id} className="flex justify-between items-center py-1.5 border-b border-rose-cream/10 last:border-0">
                      <div>
                        <p className="text-xs font-semibold text-soft-brown">{g.name}</p>
                        <p className="text-[9px] text-soft-brown/40 uppercase tracking-widest">
                          {g.type === 'child' ? 'Criança' : g.type === 'baby' ? 'Bebê' : 'Adulto'}
                        </p>
                      </div>
                      {g.status === 'confirmed' ? (
                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Vai ✓</span>
                      ) : g.status === 'declined' ? (
                        <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">Não vai</span>
                      ) : (
                        <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">Pendente</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP: Table ── */}
      <div className="hidden md:block border border-rose-cream/25 rounded-2xl overflow-hidden bg-white/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-vanilla-white/70 text-soft-brown/55 uppercase tracking-wider font-bold border-b border-rose-cream/20">
                <th className="p-3 w-8"></th>
                <th className="p-3">Família / Responsável</th>
                <th className="p-3">Telefone</th>
                <th className="p-3">Status</th>
                {METRICS.map((m) => (
                  <th key={m.key} className="p-3 text-center whitespace-nowrap">
                    <span className="block">{m.emoji}</span>
                    <span className="text-[9px]">{m.label}</span>
                  </th>
                ))}
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="p-8 text-center text-soft-brown/40 italic">Nenhuma família encontrada.</td></tr>
              ) : filtered.map((fam) => {
                const isExpanded = expandedId === fam.id;
                const ev = evMap[fam.id] || {};
                const confirmed = fam.guests.filter((g) => g.status === 'confirmed').length;
                const canRemind = fam.status === 'sent' || fam.status === 'opened';

                return (
                  <>
                    <tr key={fam.id} className={`border-b border-rose-cream/15 hover:bg-rose-cream/5 transition-colors ${isExpanded ? 'bg-rose-cream/5' : ''}`}>
                      <td className="p-3 text-center">
                        <button onClick={() => setExpandedId(isExpanded ? null : fam.id)} className="text-soft-brown/40 hover:text-golden-honey cursor-pointer">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-soft-brown">{fam.name}</p>
                        <p className="text-[10px] text-soft-brown/45">{fam.responsible} · {confirmed}/{fam.guests.length} confirmados</p>
                      </td>
                      <td className="p-3 text-soft-brown/80 font-semibold">{fam.phone}</td>
                      <td className="p-3"><StatusBadge status={fam.status} /></td>
                      {METRICS.map((m) => (
                        <td key={m.key} className="p-3 text-center">
                          <MetricDot count={ev[m.key] || 0} binary={m.binary} />
                        </td>
                      ))}
                      <td className="p-3">
                        <div className="flex justify-end gap-1.5">
                          <button onClick={() => handleWhatsApp(fam, false)} title="Enviar Convite"
                            className="p-1.5 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          {canRemind && (
                            <button onClick={() => handleWhatsApp(fam, true)} title="Enviar Lembrete"
                              className="p-1.5 bg-amber-50 border border-amber-100 hover:bg-amber-100 text-amber-700 rounded-lg cursor-pointer">
                              <Bell className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button onClick={() => handleCopyLink(fam.token)} title="Copiar Link"
                            className="p-1.5 bg-vanilla-white border border-rose-cream/35 hover:bg-rose-cream/20 text-soft-brown/70 rounded-lg cursor-pointer">
                            {copiedToken === fam.token ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => handleDelete(fam.id)} title="Excluir"
                            className="p-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-500 rounded-lg cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {(fam.status === 'confirmed' || fam.status === 'declined') && (
                            <button onClick={() => handleResetConfirmation(fam.id, fam.name)} title="Liberar reconfirmação"
                              className="p-1.5 bg-amber-50 border border-amber-100 hover:bg-amber-100 text-amber-600 rounded-lg cursor-pointer">
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-vanilla-white/20 border-b border-rose-cream/15">
                        <td colSpan={10} className="p-4 pl-10">
                          <GuestRoster guests={fam.guests} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL: Adicionar ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-daisy-white border border-rose-cream/40 w-full sm:max-w-md p-6 rounded-t-3xl sm:rounded-3xl shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-rose-cream/20 pb-3">
              <h3 className="font-title text-lg font-bold text-soft-brown">Novo Convidado</h3>
              <button onClick={() => setShowAddModal(false)} className="text-soft-brown/50 hover:text-soft-brown cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateFamily} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-soft-brown/60 uppercase mb-1">Nome do Convidado *</label>
                <input type="text" required value={responsible} onChange={(e) => setResponsible(e.target.value)} placeholder="Ana Silva"
                  className="w-full p-2.5 bg-vanilla-white/60 border border-rose-cream/35 rounded-xl" />
              </div>
              <div>
                <label className="block font-bold text-soft-brown/60 uppercase mb-1">Telefone *</label>
                <input type="text" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="21999998888"
                  className="w-full p-2.5 bg-vanilla-white/60 border border-rose-cream/35 rounded-xl" />
              </div>
              <div className="border-t border-rose-cream/15 pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold text-soft-brown/60 uppercase tracking-wide">Acompanhantes</span>
                    <span className="ml-1.5 text-soft-brown/35 normal-case font-normal">(opcional)</span>
                  </div>
                  <button type="button" onClick={() => setGuestInputs([...guestInputs, { name: '', type: 'adult' }])}
                    className="py-1 px-2.5 bg-vanilla-white border border-rose-cream/35 hover:bg-rose-cream/25 rounded-lg text-[10px] font-bold text-soft-brown cursor-pointer">
                    + Adicionar
                  </button>
                </div>
                {guestInputs.map((g, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input type="text" placeholder="Nome" value={g.name}
                      onChange={(e) => setGuestInputs(guestInputs.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                      className="flex-1 p-2 bg-vanilla-white/60 border border-rose-cream/30 rounded-xl" />
                    <select value={g.type} onChange={(e) => setGuestInputs(guestInputs.map((x, j) => j === i ? { ...x, type: e.target.value as any } : x))}
                      className="p-2 bg-vanilla-white/60 border border-rose-cream/30 rounded-xl">
                      <option value="adult">Adulto</option>
                      <option value="child">Criança</option>
                      <option value="baby">Bebê</option>
                    </select>
                    <button type="button" onClick={() => setGuestInputs(guestInputs.filter((_, j) => j !== i))}
                      className="p-1.5 bg-rose-50 border border-rose-100 text-rose-500 rounded-lg cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
              <button type="submit"
                className="w-full py-3 bg-golden-honey text-white font-bold rounded-xl text-xs uppercase tracking-wider cursor-pointer">
                Cadastrar Convidado
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Importar Excel ── */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-daisy-white border border-rose-cream/40 w-full sm:max-w-md p-6 rounded-t-3xl sm:rounded-3xl shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-rose-cream/20 pb-3">
              <h3 className="font-title text-lg font-bold text-soft-brown">Importar Planilha</h3>
              <button onClick={() => { setShowImportModal(false); setExcelFile(null); setErrorMsg(''); }} className="text-soft-brown/50 hover:text-soft-brown cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            {/* Step 1: download template */}
            <div className="flex items-start gap-3 bg-vanilla-white/60 border border-rose-cream/25 rounded-2xl p-4">
              <span className="text-2xl mt-0.5">1️⃣</span>
              <div>
                <p className="text-xs font-bold text-soft-brown mb-1">Baixe o modelo de planilha</p>
                <p className="text-[11px] text-soft-brown/60 mb-2">Preencha com os convidados e salve como .xlsx</p>
                <a href="/modelo-convidados.xlsx" download
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-golden-honey/15 border border-golden-honey/30 text-golden-honey font-bold rounded-xl text-xs hover:bg-golden-honey/25 transition">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Baixar modelo (.xlsx)
                </a>
              </div>
            </div>

            {/* Step 2: upload */}
            <div className="flex items-start gap-3 bg-vanilla-white/60 border border-rose-cream/25 rounded-2xl p-4">
              <span className="text-2xl mt-0.5">2️⃣</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-soft-brown mb-1">Envie a planilha preenchida</p>
                <label htmlFor="excel-upload"
                  className={`flex flex-col items-center gap-2 py-5 border-2 border-dashed rounded-2xl cursor-pointer transition text-center ${
                    excelFile ? 'border-emerald-300 bg-emerald-50/50' : 'border-rose-cream/40 bg-vanilla-white/40 hover:border-golden-honey/40'
                  }`}>
                  <FileSpreadsheet className={`w-7 h-7 ${excelFile ? 'text-emerald-500' : 'text-soft-brown/30'}`} />
                  {excelFile ? (
                    <>
                      <span className="text-xs font-bold text-emerald-600">{excelFile.name}</span>
                      <span className="text-[10px] text-emerald-400">Clique para trocar</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-semibold text-soft-brown/60">Clique para selecionar</span>
                      <span className="text-[10px] text-soft-brown/40">Somente arquivos .xlsx</span>
                    </>
                  )}
                  <input id="excel-upload" type="file" accept=".xlsx" className="hidden"
                    onChange={(e) => { setExcelFile(e.target.files?.[0] ?? null); setErrorMsg(''); }} />
                </label>
              </div>
            </div>

            {errorMsg && <p className="text-xs text-rose-500 bg-rose-50 py-2 px-3 rounded-lg border border-rose-100">⚠️ {errorMsg}</p>}

            <form onSubmit={handleExcelImport}>
              <button type="submit" disabled={isPending || !excelFile}
                className="w-full py-3 bg-golden-honey text-white font-bold rounded-xl text-sm uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition">
                {isPending ? 'Importando...' : 'Importar Convidados'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
