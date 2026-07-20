'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Plus, Upload, Trash2, Copy, Check,
  MessageCircle, Bell, ChevronDown, ChevronUp, X, Download, FileSpreadsheet, RotateCcw, Pencil,
} from 'lucide-react';
import {
  addFamilyAction, deleteFamilyAction,
  bulkAddFamiliesAction, updateFamilySentStatusAction,
  resetFamilyConfirmationAction, addGuestToFamilyAction, updateGuestAction,
} from '@/app/actions';
import { INVITE_TEMPLATE, REMINDER_TEMPLATE, fillTemplate } from '@/lib/templates';

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
  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped');
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [responsible, setResponsible] = useState('');
  const [responsibleType, setResponsibleType] = useState<'adult' | 'child' | 'baby'>('adult');
  const [phone, setPhone] = useState('');
  const [guestInputs, setGuestInputs] = useState<{ name: string; type: 'adult' | 'child' | 'baby' }[]>([]);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');
  const [addingGuestFor, setAddingGuestFor] = useState<string | null>(null);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestType, setNewGuestType] = useState<'adult' | 'child' | 'baby'>('adult');
  const [editingGuestId, setEditingGuestId] = useState<string | null>(null);
  const [editGuestName, setEditGuestName] = useState('');
  const [editGuestType, setEditGuestType] = useState<'adult' | 'child' | 'baby'>('adult');

  // Analytics lookup map
  const evMap: Record<string, Record<string, number>> = {};
  for (const ev of analyticsEvents) {
    if (!ev.family_id) continue;
    if (!evMap[ev.family_id]) evMap[ev.family_id] = {};
    evMap[ev.family_id][ev.event_type] = (evMap[ev.family_id][ev.event_type] || 0) + 1;
  }

  // Filtered list (grouped)
  const filtered = families.filter((f) => {
    const q = search.toLowerCase();
    const matchSearch = f.name.toLowerCase().includes(q) ||
      f.responsible.toLowerCase().includes(q) ||
      f.guests.some((g) => g.name.toLowerCase().includes(q));
    return matchSearch && (filterStatus === 'all' || f.status === filterStatus);
  });

  // Flat guest list
  const flatGuests = families.flatMap((f) =>
    f.guests.map((g) => ({ ...g, familyName: f.name, familyStatus: f.status, familySize: f.guests.length }))
  ).filter((g) => {
    const q = search.toLowerCase();
    const matchSearch = g.name.toLowerCase().includes(q) || g.familyName.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || g.status === filterStatus;
    return matchSearch && matchStatus;
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
    const template = isReminder ? REMINDER_TEMPLATE : INVITE_TEMPLATE;
    const text = fillTemplate(template, fam.responsible, link);
    window.open(`https://api.whatsapp.com/send?phone=${clean}&text=${encodeURIComponent(text)}`, '_blank');
    await updateFamilySentStatusAction(fam.id, true);
    // Atualiza estado local imediatamente
    setFamilies((prev) => prev.map((f) => f.id === fam.id ? { ...f, status: 'sent' } : f));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este convidado?')) return;
    const res = await deleteFamilyAction(id);
    if (res.success) {
      setFamilies((prev) => prev.filter((f) => f.id !== id));
    } else alert('Erro ao excluir.');
  };

  const handleResetConfirmation = async (id: string, name: string) => {
    if (!confirm(`Liberar reconfirmação de "${name}"?\n\nTodos voltarão para Pendente e o convidado poderá confirmar novamente.`)) return;
    const res = await resetFamilyConfirmationAction(id);
    if (res.success) {
      // Atualiza estado local imediatamente — sem depender de cache
      setFamilies((prev) => prev.map((f) =>
        f.id === id
          ? { ...f, status: 'sent', last_interaction: null, guests: f.guests.map((g) => ({ ...g, status: 'pending', confirmed_at: null })) }
          : f
      ));
    } else alert('Erro ao resetar.');
  };

  const handleAddGuestToFamily = async (familyId: string) => {
    if (!newGuestName.trim()) return;
    const res = await addGuestToFamilyAction(familyId, { name: newGuestName.trim(), type: newGuestType });
    if (res.success) {
      setFamilies((prev) => prev.map((f) => f.id === familyId
        ? { ...f, guests: [...f.guests, { id: crypto.randomUUID(), name: newGuestName.trim(), type: newGuestType, status: 'pending' }] }
        : f));
      setAddingGuestFor(null); setNewGuestName(''); setNewGuestType('adult');
    } else alert(res.error || 'Erro ao adicionar convidado.');
  };

  const handleStartEditGuest = (guest: Guest) => {
    setEditingGuestId(guest.id); setEditGuestName(guest.name); setEditGuestType(guest.type);
  };

  const handleUpdateGuest = async (familyId: string, guestId: string) => {
    if (!editGuestName.trim()) return;
    const res = await updateGuestAction(guestId, { name: editGuestName.trim(), type: editGuestType });
    if (res.success) {
      setFamilies((prev) => prev.map((f) => f.id === familyId
        ? { ...f, guests: f.guests.map((g) => g.id === guestId ? { ...g, name: editGuestName.trim(), type: editGuestType } : g) }
        : f));
      setEditingGuestId(null);
    } else alert(res.error || 'Erro ao atualizar convidado.');
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responsible.trim() || !phone.trim()) return alert('Nome e Telefone são obrigatórios!');
    const extras = guestInputs.filter((g) => g.name.trim());
    const allGuests = [{ name: responsible.trim(), type: responsibleType }, ...extras];
    const firstName = responsible.trim().split(' ')[0];
    const familyName = extras.length > 0 ? `${firstName} e Família` : responsible.trim();
    const res = await addFamilyAction(familyName, responsible.trim(), phone, allGuests);
    if (res.success) {
      setShowAddModal(false); setResponsible(''); setPhone('');
      setResponsibleType('adult'); setGuestInputs([]);
      setTimeout(() => window.location.reload(), 500);
    } else alert(res.error || 'Erro ao adicionar.');
  };

  const MAX_COMPANIONS = 9; // responsável + 9 acompanhantes = 10 pessoas por família

  const downloadTemplate = async () => {
    const XLSX = await import('xlsx');
    const headers = [
      'Nome do Convidado',
      'Tipo (Adulto / Criança / Bebê)',
      'Telefone (com DDD, somente números)',
      ...Array.from({ length: MAX_COMPANIONS }, (_, i) => [
        `Acompanhante ${i + 1} - Nome`,
        `Acompanhante ${i + 1} - Tipo (Adulto / Criança / Bebê)`,
      ]).flat(),
    ];
    const examples = [
      ['Ana Silva',    'Adulto', '21999991111', ...Array(MAX_COMPANIONS * 2).fill('')],
      ['João Souza',   'Adulto', '21988882222', 'Maria Souza', 'Adulto', 'Pedro Souza', 'Criança', ...Array((MAX_COMPANIONS - 2) * 2).fill('')],
      ['Beatriz Lima', 'Adulto', '21977773333', 'Carlos Lima', 'Adulto', 'Sofia Lima',  'Bebê',    'Lucas Lima', 'Criança', ...Array((MAX_COMPANIONS - 3) * 2).fill('')],
    ];
    const ws = XLSX.utils.aoa_to_sheet([headers, ...examples]);
    ws['!cols'] = [{ wch: 28 }, { wch: 30 }, { wch: 28 }, ...Array(MAX_COMPANIONS * 2).fill({ wch: 24 })];
    // Dropdown nas colunas de tipo (E, G, I, ...) para linhas 2-200
    const typeCols = ['B', ...Array.from({ length: MAX_COMPANIONS }, (_, i) => XLSX.utils.encode_col(4 + i * 2))];
    const typeValidation = { type: 'list', formula1: '"Adulto,Criança,Bebê"', showDropDown: false, sqref: typeCols.map((c) => `${c}2:${c}200`).join(' ') };
    ws['!dataValidations'] = [typeValidation];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Convidados');
    XLSX.writeFile(wb, 'modelo-convidados-zoe.xlsx');
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
          const rawMainType = String(row[1] ?? '').trim().toLowerCase();
          const phone       = String(row[2] ?? '').trim();
          if (!responsible || !phone) continue;

          const mainType: 'adult' | 'child' | 'baby' =
            rawMainType.includes('crian') ? 'child' : rawMainType.includes('beb') ? 'baby' : 'adult';

          // Acompanhantes: col 3+4, 5+6, 7+8, ... (MAX_COMPANIONS pares)
          const companions: { name: string; type: 'adult' | 'child' | 'baby' }[] = [];
          for (let m = 0; m < MAX_COMPANIONS; m++) {
            const name = String(row[3 + m * 2] ?? '').trim();
            const raw  = String(row[4 + m * 2] ?? '').trim().toLowerCase();
            if (!name) continue;
            const type: 'adult' | 'child' | 'baby' =
              raw.includes('crian') ? 'child' : raw.includes('beb') ? 'baby' : 'adult';
            companions.push({ name, type });
          }

          const allGuests = [{ name: responsible, type: mainType }, ...companions];
          const firstName = responsible.split(' ')[0];
          const familyName = companions.length > 0 ? `${firstName} e Família` : responsible;

          parsed.push({ responsible, phone, familyName, guests: allGuests });
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

      {/* View toggle + search + filter */}
      <div className="space-y-2">
        {/* Toggle agrupado / individual */}
        <div className="flex gap-1 p-1 bg-vanilla-white/70 border border-rose-cream/25 rounded-xl w-fit">
          <button
            onClick={() => setViewMode('grouped')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'grouped'
                ? 'bg-golden-honey text-white shadow-sm'
                : 'text-soft-brown/55 hover:text-soft-brown'
            }`}
          >
            Por convite
          </button>
          <button
            onClick={() => setViewMode('flat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              viewMode === 'flat'
                ? 'bg-golden-honey text-white shadow-sm'
                : 'text-soft-brown/55 hover:text-soft-brown'
            }`}
          >
            Individual
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-soft-brown/35 absolute left-3 top-2.5" />
            <input type="text" placeholder="Buscar por nome..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-white/60 border border-rose-cream/30 rounded-xl text-xs focus:outline-none focus:border-golden-honey text-soft-brown" />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-2 bg-white/60 border border-rose-cream/30 rounded-xl text-xs text-soft-brown font-semibold focus:outline-none focus:border-golden-honey">
            <option value="all">Todos</option>
            {viewMode === 'flat' ? (
              <>
                <option value="confirmed">Confirmados</option>
                <option value="declined">Não vão</option>
                <option value="pending">Pendentes</option>
              </>
            ) : (
              <>
                <option value="pending">Pendentes</option>
                <option value="sent">Enviados</option>
                <option value="opened">Abriram</option>
                <option value="confirmed">Confirmados</option>
                <option value="declined">Recusados</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* ── Vista Individual (flat) ── */}
      {viewMode === 'flat' && (
        <div className="border border-rose-cream/25 rounded-2xl overflow-hidden bg-white/40">
          {flatGuests.length === 0 ? (
            <p className="text-center text-soft-brown/40 italic py-10 text-sm">Nenhum convidado encontrado.</p>
          ) : (
            <>
              <div className="flex items-center justify-between px-4 py-2.5 bg-vanilla-white/70 border-b border-rose-cream/15">
                <span className="text-[10px] font-bold text-soft-brown/45 uppercase tracking-wider">
                  {flatGuests.length} convidado{flatGuests.length !== 1 ? 's' : ''}
                </span>
                <span className="text-[10px] text-soft-brown/40">
                  {flatGuests.filter(g => g.status === 'confirmed').length} confirmados ·{' '}
                  {flatGuests.filter(g => g.status === 'declined').length} não vão ·{' '}
                  {flatGuests.filter(g => g.status === 'pending').length} pendentes
                </span>
              </div>
              {flatGuests.map((g, i) => {
                const rowBg =
                  g.status === 'confirmed' ? 'bg-emerald-50/70 border-l-4 border-l-emerald-400' :
                  g.status === 'declined'  ? 'bg-rose-50/70 border-l-4 border-l-rose-400' :
                  'border-l-4 border-l-transparent';
                const nameCls =
                  g.status === 'confirmed' ? 'text-emerald-800 font-bold' :
                  g.status === 'declined'  ? 'text-rose-700 font-bold' :
                  'text-soft-brown font-semibold';
                return (
                <div key={g.id} className={`flex items-center gap-3 px-4 py-3 ${rowBg} ${i !== flatGuests.length - 1 ? 'border-b border-rose-cream/10' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm truncate ${nameCls}`}>{g.name}</p>
                    <p className="text-[10px] text-soft-brown/45 truncate">
                      {g.type === 'child' ? 'Criança' : g.type === 'baby' ? 'Bebê' : 'Adulto'}
                      {g.familySize > 1 && g.familyName !== g.name && (
                        <span className="ml-1.5">· com <span className="font-medium">{g.familyName.replace(/^famíli[ao](\s+de)?\s+/i, '')}</span></span>
                      )}
                    </p>
                  </div>
                  {g.status === 'confirmed' ? (
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full whitespace-nowrap">✓ Vai</span>
                  ) : g.status === 'declined' ? (
                    <span className="text-[11px] font-extrabold text-rose-600 bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-full whitespace-nowrap">✗ Não vai</span>
                  ) : (
                    <span className="text-[11px] font-bold text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-full whitespace-nowrap">Pendente</span>
                  )}
                </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* ── Lista Agrupada por Convite ── */}
      {viewMode === 'grouped' && <div className="space-y-2.5">
        {filtered.length === 0 && (
          <p className="text-center text-soft-brown/40 italic py-10 text-sm">Nenhum convidado encontrado.</p>
        )}
        {filtered.map((fam) => {
          const isExpanded = expandedId === fam.id;
          const ev = evMap[fam.id] || {};
          const confirmed = fam.guests.filter((g) => g.status === 'confirmed').length;
          return (
            <div key={fam.id} className="bg-white/70 border border-rose-cream/25 rounded-2xl overflow-hidden shadow-xs">

              {/* ── Linha principal ── */}
              <div className="flex items-center gap-3 px-4 py-3.5">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-soft-brown text-sm leading-tight">{fam.name}</p>
                    <StatusBadge status={fam.status} />
                  </div>
                  <p className="text-[11px] text-soft-brown/50 mt-0.5 truncate">
                    {fam.phone}
                    {fam.guests.length > 0 && (
                      <span className="ml-2 font-semibold text-soft-brown/60">
                        · {confirmed}/{fam.guests.length} {fam.guests.length === 1 ? 'confirmado' : 'confirmados'}
                      </span>
                    )}
                  </p>
                </div>

                {/* Ações rápidas */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {fam.status === 'pending' && (
                    <button onClick={() => handleWhatsApp(fam, false)} title="Enviar Convite"
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-lg text-xs transition cursor-pointer">
                      <MessageCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">Enviar</span>
                    </button>
                  )}
                  {(fam.status === 'sent' || fam.status === 'opened') && (
                    <>
                      <button onClick={() => handleWhatsApp(fam, false)} title="Reenviar Convite"
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg text-xs transition cursor-pointer">
                        <MessageCircle className="w-3 h-3" />
                        <span className="hidden sm:inline">Reenviar</span>
                      </button>
                      <button onClick={() => handleWhatsApp(fam, true)} title="Lembrete"
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-400 hover:bg-amber-500 text-white font-bold rounded-lg text-xs transition cursor-pointer">
                        <Bell className="w-3 h-3" />
                        <span className="hidden sm:inline">Lembrar</span>
                      </button>
                    </>
                  )}
                  <button onClick={() => handleCopyLink(fam.token)} title="Copiar link"
                    className="p-1.5 bg-white border border-rose-cream/30 hover:bg-rose-cream/10 text-soft-brown/60 rounded-lg cursor-pointer">
                    {copiedToken === fam.token ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  {(fam.status === 'confirmed' || fam.status === 'declined') && (
                    <button onClick={() => handleResetConfirmation(fam.id, fam.name)} title="Liberar reconfirmação"
                      className="p-1.5 bg-amber-50 border border-amber-100 hover:bg-amber-100 text-amber-600 rounded-lg cursor-pointer">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button onClick={() => handleDelete(fam.id)} title="Excluir"
                    className="p-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-500 rounded-lg cursor-pointer">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {/* Expandir */}
                  <button onClick={() => setExpandedId(isExpanded ? null : fam.id)}
                    className="p-1.5 bg-vanilla-white border border-rose-cream/30 hover:bg-rose-cream/15 text-soft-brown/40 rounded-lg cursor-pointer">
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* ── Painel expandido ── */}
              {isExpanded && (
                <div className="border-t border-rose-cream/15 bg-vanilla-white/40 divide-y divide-rose-cream/10">

                  {/* Métricas */}
                  <div className="px-4 py-3 space-y-1.5">
                    <p className="text-[10px] font-bold text-soft-brown/45 uppercase tracking-wider mb-2">Engajamento</p>
                    {METRICS.map((m) => {
                      // "Confirmou" reflete o status real atual dos guests, não o histórico de analytics
                      const isConfirmedMetric = m.key === 'confirmation_completed';
                      const count = isConfirmedMetric
                        ? (fam.guests.some((g) => g.status === 'confirmed') ? 1 : 0)
                        : (ev[m.key] || 0);
                      return (
                        <div key={m.key} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base leading-none w-5 text-center">{m.emoji}</span>
                            <span className="text-xs text-soft-brown/70">{m.label}</span>
                          </div>
                          {count === 0 ? (
                            <span className="text-[11px] text-soft-brown/25 font-semibold">–</span>
                          ) : m.binary ? (
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">✓ Sim</span>
                          ) : (
                            <span className="text-[11px] font-bold text-golden-honey bg-honey-yellow/20 px-2 py-0.5 rounded-full">
                              {count > 9 ? '9+' : count}× acessou
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Convidados */}
                  <div className="px-4 py-3 space-y-1.5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-bold text-soft-brown/45 uppercase tracking-wider">
                        Convidados ({fam.guests.length})
                      </p>
                      {addingGuestFor !== fam.id && (
                        <button type="button" onClick={() => { setAddingGuestFor(fam.id); setNewGuestName(''); setNewGuestType('adult'); }}
                          className="py-1 px-2.5 bg-vanilla-white border border-rose-cream/35 hover:bg-rose-cream/25 rounded-lg text-[10px] font-bold text-soft-brown cursor-pointer">
                          + Adicionar
                        </button>
                      )}
                    </div>
                    {fam.guests.map((g) => (
                      editingGuestId === g.id ? (
                        <div key={g.id} className="flex gap-2 items-center">
                          <input type="text" autoFocus value={editGuestName}
                            onChange={(e) => setEditGuestName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUpdateGuest(fam.id, g.id); } }}
                            className="flex-1 p-2 bg-vanilla-white/60 border border-rose-cream/30 rounded-xl text-xs" />
                          <select value={editGuestType} onChange={(e) => setEditGuestType(e.target.value as any)}
                            className="p-2 bg-vanilla-white/60 border border-rose-cream/30 rounded-xl text-xs">
                            <option value="adult">Adulto</option>
                            <option value="child">Criança</option>
                            <option value="baby">Bebê</option>
                          </select>
                          <button type="button" onClick={() => handleUpdateGuest(fam.id, g.id)}
                            className="p-2 bg-golden-honey hover:brightness-105 text-white rounded-lg cursor-pointer"><Check className="w-3.5 h-3.5" /></button>
                          <button type="button" onClick={() => setEditingGuestId(null)}
                            className="p-2 bg-vanilla-white border border-rose-cream/30 text-soft-brown/50 rounded-lg cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                        </div>
                      ) : (
                        <div key={g.id} className="flex items-center justify-between group">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] text-soft-brown/30 w-12 shrink-0">
                              {g.type === 'child' ? 'Criança' : g.type === 'baby' ? 'Bebê' : 'Adulto'}
                            </span>
                            <span className="text-xs font-semibold text-soft-brown truncate">{g.name}</span>
                            <button type="button" onClick={() => handleStartEditGuest(g)} title="Editar convidado"
                              className="p-1 text-soft-brown/30 hover:text-soft-brown shrink-0 cursor-pointer">
                              <Pencil className="w-3 h-3" />
                            </button>
                          </div>
                          {g.status === 'confirmed' ? (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full shrink-0">Vai ✓</span>
                          ) : g.status === 'declined' ? (
                            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full shrink-0">Não vai</span>
                          ) : (
                            <span className="text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full shrink-0">Pendente</span>
                          )}
                        </div>
                      )
                    ))}
                    {addingGuestFor === fam.id && (
                      <div className="flex gap-2 items-center pt-1.5 border-t border-rose-cream/10 mt-2">
                        <input type="text" autoFocus placeholder="Nome do convidado" value={newGuestName}
                          onChange={(e) => setNewGuestName(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddGuestToFamily(fam.id); } }}
                          className="flex-1 p-2 bg-vanilla-white/60 border border-rose-cream/30 rounded-xl text-xs" />
                        <select value={newGuestType} onChange={(e) => setNewGuestType(e.target.value as any)}
                          className="p-2 bg-vanilla-white/60 border border-rose-cream/30 rounded-xl text-xs">
                          <option value="adult">Adulto</option>
                          <option value="child">Criança</option>
                          <option value="baby">Bebê</option>
                        </select>
                        <button type="button" onClick={() => handleAddGuestToFamily(fam.id)}
                          className="p-2 bg-golden-honey hover:brightness-105 text-white rounded-lg cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
                        <button type="button" onClick={() => setAddingGuestFor(null)}
                          className="p-2 bg-vanilla-white border border-rose-cream/30 text-soft-brown/50 rounded-lg cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>}

      {/* ── MODAL: Adicionar ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-daisy-white border border-rose-cream/40 w-full sm:max-w-md p-6 rounded-t-3xl sm:rounded-3xl shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-rose-cream/20 pb-3">
              <h3 className="font-title text-lg font-bold text-soft-brown">Novo Convidado</h3>
              <button onClick={() => { setShowAddModal(false); setResponsible(''); setPhone(''); setResponsibleType('adult'); setGuestInputs([]); }} className="text-soft-brown/50 hover:text-soft-brown cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateFamily} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-soft-brown/60 uppercase mb-1">Nome do Convidado *</label>
                <div className="flex gap-2">
                  <input type="text" required value={responsible} onChange={(e) => setResponsible(e.target.value)} placeholder="Ana Silva"
                    className="flex-1 p-2.5 bg-vanilla-white/60 border border-rose-cream/35 rounded-xl" />
                  <select value={responsibleType} onChange={(e) => setResponsibleType(e.target.value as any)}
                    className="p-2.5 bg-vanilla-white/60 border border-rose-cream/35 rounded-xl">
                    <option value="adult">Adulto</option>
                    <option value="child">Criança</option>
                    <option value="baby">Bebê</option>
                  </select>
                </div>
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
                <button type="button" onClick={downloadTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-golden-honey/15 border border-golden-honey/30 text-golden-honey font-bold rounded-xl text-xs hover:bg-golden-honey/25 transition cursor-pointer">
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Baixar modelo (.xlsx)
                </button>
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
