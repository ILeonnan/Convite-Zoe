'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Plus, Upload, Trash2, Copy, Check, MessageCircle, ExternalLink, ChevronDown, ChevronUp, X } from 'lucide-react';
import { addFamilyAction, deleteFamilyAction, bulkAddFamiliesAction, updateFamilySentStatusAction } from '@/app/actions';

interface Guest {
  id: string;
  name: string;
  type: 'adult' | 'child' | 'baby';
  status: 'confirmed' | 'declined' | 'pending';
}

interface Family {
  id: string;
  name: string;
  responsible: string;
  phone: string;
  token: string;
  status: string;
  sent_at: string | null;
  guests: Guest[];
}

interface FamiliesManagerProps {
  initialFamilies: Family[];
}

export default function FamiliesManager({ initialFamilies }: FamiliesManagerProps) {
  const router = useRouter();
  const [families, setFamilies] = useState<Family[]>(initialFamilies);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [expandedFamily, setExpandedFamily] = useState<string | null>(null);
  
  // Copy state
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  
  // Add Family Form State
  const [familyName, setFamilyName] = useState('');
  const [responsible, setResponsible] = useState('');
  const [phone, setPhone] = useState('');
  const [guestInputs, setGuestInputs] = useState<{ name: string; type: 'adult' | 'child' | 'baby' }[]>([
    { name: '', type: 'adult' }
  ]);
  
  // CSV Import State
  const [csvFileContent, setCsvFileContent] = useState('');
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');

  // Handle manual guest inputs in add modal
  const handleAddGuestInput = () => {
    setGuestInputs([...guestInputs, { name: '', type: 'adult' }]);
  };

  const handleRemoveGuestInput = (index: number) => {
    setGuestInputs(guestInputs.filter((_, idx) => idx !== index));
  };

  const handleGuestInputChange = (index: number, field: 'name' | 'type', value: string) => {
    setGuestInputs(
      guestInputs.map((input, idx) =>
        idx === index ? { ...input, [field]: value } : input
      )
    );
  };

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!responsible.trim() || !phone.trim()) {
      alert('Responsável e Telefone são obrigatórios!');
      return;
    }

    const finalFamilyName = familyName.trim() || `Família de ${responsible.trim()}`;
    const validGuests = guestInputs.filter((g) => g.name.trim() !== '');

    const res = await addFamilyAction(finalFamilyName, responsible, phone, validGuests);

    if (res.success) {
      setShowAddModal(false);
      setFamilyName('');
      setResponsible('');
      setPhone('');
      setGuestInputs([{ name: '', type: 'adult' }]);
      router.refresh();
      // Wait for server to refresh, then update state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      alert(res.error || 'Erro ao adicionar família.');
    }
  };

  const handleDeleteFamily = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta família?')) return;
    const res = await deleteFamilyAction(id);
    if (res.success) {
      router.refresh();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } else {
      alert('Erro ao excluir família.');
    }
  };

  const handleCopyLink = (token: string) => {
    const origin = window.location.origin;
    const link = `${origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleOpenWhatsApp = async (family: Family, isReminder = false) => {
    const origin = window.location.origin;
    const link = `${origin}/invite/${family.token}`;
    
    // Brazilian clean phone formatting: strip everything and check for country code
    let cleanPhone = family.phone.replace(/\D/g, '');
    if (cleanPhone.length === 11 || cleanPhone.length === 10) {
      cleanPhone = '55' + cleanPhone;
    }

    const text = isReminder
      ? `Olá, *${family.responsible}*! Passando para lembrar de confirmar a presença da sua família para o primeiro aninho da Zoe. 🌼\nVocê pode acessar o convite e confirmar os nomes pelo link:\n\n${link}\n\nSe puder nos responder até dia 10 de Outubro, agradecemos muito! 🐝`
      : `Olá, *${family.responsible}*! Tudo bem? 🐝\nEstamos muito felizes em convidar vocês para comemorar o primeiro aninho da Zoe!\nPreparamos um convite personalizado e interativo. Acesse o link abaixo para ver o convite e confirmar a presença da sua família:\n\n${link}\n\nEsperamos vocês na nossa doce colmeia! 🍯🌼`;

    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(text)}`, '_blank');
    
    // Mark as sent in DB
    await updateFamilySentStatusAction(family.id, true);
    router.refresh();
  };

  // CSV parsing logic on the client
  const handleCsvImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFileContent.trim()) {
      setErrorMsg('Cole o conteúdo do CSV.');
      return;
    }

    setErrorMsg('');
    startTransition(async () => {
      try {
        const lines = csvFileContent.split('\n');
        const header = lines[0].toLowerCase();
        
        // Find indices
        const cols = header.split(/[;,]/);
        const respIdx = cols.findIndex((c) => c.includes('responsavel') || c.includes('responsável'));
        const phoneIdx = cols.findIndex((c) => c.includes('telefone') || c.includes('fone'));
        const guestsIdx = cols.findIndex((c) => c.includes('integrantes') || c.includes('convidados') || c.includes('lista'));

        if (respIdx === -1 || phoneIdx === -1 || guestsIdx === -1) {
          setErrorMsg('O cabeçalho do CSV deve conter colunas chamadas "Responsável", "Telefone" e "Integrantes".');
          return;
        }

        const parsedFamilies = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Split line respecting commas/semicolons
          const values = line.split(/[;,]/);
          const responsibleName = values[respIdx]?.trim();
          const phoneNumber = values[phoneIdx]?.trim();
          const guestsCol = values[guestsIdx]?.trim();

          if (!responsibleName || !phoneNumber) continue;

          const famName = `Família ${responsibleName.split(' ').pop() || responsibleName}`;

          // Parse members in format: "Name, Name (criança), Name (bebê)"
          const guestsList: { name: string; type: 'adult' | 'child' | 'baby' }[] = [];
          if (guestsCol) {
            // Check if string contains quotes due to CSV column formatting
            const cleanedGuests = guestsCol.replace(/^"|"$/g, '');
            const members = cleanedGuests.split('|'); // support pipe or comma
            const splitChar = cleanedGuests.includes('|') ? '|' : ',';
            
            cleanedGuests.split(splitChar).forEach((m) => {
              const cleanedName = m.trim();
              if (!cleanedName) return;

              let type: 'adult' | 'child' | 'baby' = 'adult';
              let finalName = cleanedName;

              if (/\(crian[cç]a\)/i.test(cleanedName)) {
                type = 'child';
                finalName = cleanedName.replace(/\(crian[cç]a\)/i, '').trim();
              } else if (/\(beb[eê]\)/i.test(cleanedName)) {
                type = 'baby';
                finalName = cleanedName.replace(/\(beb[eê]\)/i, '').trim();
              }

              guestsList.push({ name: finalName, type });
            });
          } else {
            // Default: add responsible as guest
            guestsList.push({ name: responsibleName, type: 'adult' });
          }

          parsedFamilies.push({
            responsible: responsibleName,
            phone: phoneNumber,
            familyName: famName,
            guests: guestsList,
          });
        }

        if (parsedFamilies.length === 0) {
          setErrorMsg('Nenhuma linha válida encontrada para importar.');
          return;
        }

        const result = await bulkAddFamiliesAction(parsedFamilies);
        if (result.success) {
          setShowImportModal(false);
          setCsvFileContent('');
          window.location.reload();
        } else {
          setErrorMsg(result.error || 'Erro ao importar convidados.');
        }
      } catch (err: any) {
        setErrorMsg('Erro de formatação no arquivo CSV: ' + err.message);
      }
    });
  };

  // Filters
  const filteredFamilies = families.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.responsible.toLowerCase().includes(search.toLowerCase()) ||
      f.guests.some((g) => g.name.toLowerCase().includes(search.toLowerCase()));

    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && f.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md uppercase">Confirmado</span>;
      case 'declined':
        return <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-md uppercase">Recusou</span>;
      case 'opened':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-md uppercase">Aberto</span>;
      case 'sent':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-md uppercase">Enviado</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-800 text-[10px] font-bold rounded-md uppercase">Pendente</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-title text-2xl font-bold text-soft-brown">Gestão de Famílias</h2>
          <p className="text-xs text-soft-brown/65 mt-0.5">Cadastre, edite e envie links de confirmação para os convidados.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-1 px-3 py-2 bg-vanilla-white border border-rose-cream/40 hover:bg-rose-cream/20 text-soft-brown font-bold rounded-xl text-xs transition cursor-pointer"
          >
            <Upload className="w-4 h-4" /> Importar CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-2 bg-golden-honey hover:bg-honey-yellow hover:text-soft-brown text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Adicionar Família
          </button>
        </div>
      </div>

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por família, responsável ou convidado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-vanilla-white/55 border border-rose-cream/35 rounded-xl text-xs focus:outline-none focus:border-golden-honey text-soft-brown font-medium"
          />
          <Search className="w-4 h-4 text-soft-brown/40 absolute left-3 top-2.5" />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-vanilla-white/55 border border-rose-cream/35 rounded-xl text-xs text-soft-brown font-semibold focus:outline-none focus:border-golden-honey"
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendentes</option>
          <option value="sent">Enviados</option>
          <option value="opened">Abertos</option>
          <option value="confirmed">Confirmados</option>
          <option value="declined">Recusados</option>
        </select>
      </div>

      {/* Families list table */}
      <div className="border border-rose-cream/25 rounded-2xl overflow-hidden bg-white/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-vanilla-white/70 text-soft-brown/65 uppercase tracking-wider font-bold border-b border-rose-cream/20">
                <th className="p-3 w-8"></th>
                <th className="p-3">Família / Responsável</th>
                <th className="p-3">Telefone</th>
                <th className="p-3">Convidados</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredFamilies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-soft-brown/50 italic">
                    Nenhuma família cadastrada ou encontrada para a busca.
                  </td>
                </tr>
              ) : (
                filteredFamilies.map((fam) => {
                  const isExpanded = expandedFamily === fam.id;
                  const confirmedGuests = fam.guests.filter((g) => g.status === 'confirmed').length;
                  const totalGuests = fam.guests.length;

                  return (
                    <>
                      <tr
                        key={fam.id}
                        className={`border-b border-rose-cream/15 hover:bg-rose-cream/5 transition-colors ${
                          isExpanded ? 'bg-rose-cream/5' : ''
                        }`}
                      >
                        <td className="p-3 text-center">
                          <button
                            onClick={() => setExpandedFamily(isExpanded ? null : fam.id)}
                            className="text-soft-brown/50 hover:text-golden-honey cursor-pointer"
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-soft-brown">{fam.name}</div>
                          <div className="text-[10px] text-soft-brown/50">Resp: {fam.responsible}</div>
                        </td>
                        <td className="p-3 text-soft-brown/85 font-semibold">{fam.phone}</td>
                        <td className="p-3 text-soft-brown/85">
                          <span className="font-bold text-golden-honey">{confirmedGuests}</span> de {totalGuests}
                        </td>
                        <td className="p-3">{getStatusBadge(fam.status)}</td>
                        <td className="p-3 text-right flex justify-end gap-1.5 pt-4">
                          <button
                            onClick={() => handleCopyLink(fam.token)}
                            title="Copiar Link"
                            className="p-1.5 bg-vanilla-white border border-rose-cream/35 hover:bg-rose-cream/20 text-soft-brown/80 rounded-lg cursor-pointer"
                          >
                            {copiedToken === fam.token ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          
                          <button
                            onClick={() => handleOpenWhatsApp(fam, false)}
                            title="Enviar Convite"
                            className="p-1.5 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          
                          {fam.status === 'pending' && (
                            <button
                              onClick={() => handleOpenWhatsApp(fam, true)}
                              title="Enviar Lembrete"
                              className="p-1.5 bg-amber-50 border border-amber-100 hover:bg-amber-100 text-amber-700 rounded-lg cursor-pointer"
                            >
                              Lembrete
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteFamily(fam.id)}
                            title="Deletar Família"
                            className="p-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-600 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-vanilla-white/20 border-b border-rose-cream/15">
                          <td colSpan={6} className="p-4 pl-12">
                            <div className="max-w-md space-y-2">
                              <h4 className="font-bold text-[10px] text-soft-brown/60 uppercase tracking-wider mb-2">
                                Lista de Integrantes:
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {fam.guests.map((g) => (
                                  <div
                                    key={g.id}
                                    className="flex justify-between items-center p-2.5 bg-daisy-white/70 border border-rose-cream/10 rounded-xl"
                                  >
                                    <div>
                                      <p className="font-semibold text-soft-brown">{g.name}</p>
                                      <p className="text-[9px] text-soft-brown/50 uppercase tracking-widest font-bold">
                                        {g.type === 'child' ? 'Criança' : g.type === 'baby' ? 'Bebê (Colo)' : 'Adulto'}
                                      </p>
                                    </div>
                                    <div>
                                      {g.status === 'confirmed' ? (
                                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">VAI</span>
                                      ) : g.status === 'declined' ? (
                                        <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-sm">NÃO VAI</span>
                                      ) : (
                                        <span className="text-[9px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded-sm">PENDENTE</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD MANUAL FAMILY */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-daisy-white border border-rose-cream/40 max-w-md w-full p-6 rounded-3xl shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-rose-cream/20 pb-3">
              <h3 className="font-title text-xl font-bold text-soft-brown">Nova Família</h3>
              <button onClick={() => setShowAddModal(false)} className="text-soft-brown/50 hover:text-soft-brown cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFamily} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-soft-brown/70 uppercase mb-1">Nome do Responsável:</label>
                <input
                  type="text"
                  required
                  value={responsible}
                  onChange={(e) => setResponsible(e.target.value)}
                  placeholder="Ex: João Silva"
                  className="w-full p-2.5 bg-vanilla-white/60 border border-rose-cream/35 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-soft-brown/70 uppercase mb-1">Telefone (DDD + Número):</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 11999998888"
                  className="w-full p-2.5 bg-vanilla-white/60 border border-rose-cream/35 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-soft-brown/70 uppercase mb-1">Apelido da Família (Opcional):</label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Ex: Família Silva (deixa vazio para padrão)"
                  className="w-full p-2.5 bg-vanilla-white/60 border border-rose-cream/35 rounded-xl"
                />
              </div>

              <div className="border-t border-rose-cream/15 pt-3 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-soft-brown/65 uppercase tracking-wide">Integrantes (Convidados):</h4>
                  <button
                    type="button"
                    onClick={handleAddGuestInput}
                    className="py-1 px-2.5 bg-vanilla-white border border-rose-cream/35 hover:bg-rose-cream/25 rounded-lg text-[10px] font-bold text-soft-brown cursor-pointer"
                  >
                    + Integrante
                  </button>
                </div>

                <div className="space-y-2">
                  {guestInputs.map((input, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        required
                        placeholder="Nome do integrante"
                        value={input.name}
                        onChange={(e) => handleGuestInputChange(idx, 'name', e.target.value)}
                        className="flex-1 p-2 bg-vanilla-white/60 border border-rose-cream/30 rounded-xl text-xs"
                      />
                      <select
                        value={input.type}
                        onChange={(e) => handleGuestInputChange(idx, 'type', e.target.value)}
                        className="p-2 bg-vanilla-white/60 border border-rose-cream/30 rounded-xl text-xs"
                      >
                        <option value="adult">Adulto</option>
                        <option value="child">Criança</option>
                        <option value="baby">Bebê</option>
                      </select>
                      {guestInputs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGuestInput(idx)}
                          className="p-1.5 bg-rose-50 border border-rose-100 hover:bg-rose-100 text-rose-500 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-golden-honey hover:bg-honey-yellow hover:text-soft-brown text-white font-bold rounded-xl transition duration-150 cursor-pointer uppercase tracking-wider text-xs"
              >
                Cadastrar Família
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT CSV */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-daisy-white border border-rose-cream/40 max-w-md w-full p-6 rounded-3xl shadow-xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-rose-cream/20 pb-3">
              <h3 className="font-title text-xl font-bold text-soft-brown">Importar CSV</h3>
              <button onClick={() => setShowImportModal(false)} className="text-soft-brown/50 hover:text-soft-brown cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-soft-brown/85 space-y-2 leading-relaxed">
              <p>Cole o conteúdo de uma planilha CSV no formato abaixo. O cabeçalho é obrigatório:</p>
              <pre className="bg-vanilla-white border border-rose-cream/25 p-2 rounded-xl text-[10px] font-mono whitespace-pre-wrap">
                Responsável,Telefone,Integrantes{"\n"}
                Maria Silva,11999998888,Maria Silva|João Silva (criança)|Pedro Silva (bebê){"\n"}
                Carlos Souza,21988887777,Carlos Souza|Ana Souza
              </pre>
              <p className="text-[10px] text-soft-brown/65 italic">
                * Nota: Separe os integrantes usando o caractere de barra vertical "|" ou vírgula se o delimitador de colunas for ponto e vírgula. Utilize os sufixos "(criança)" ou "(bebê)" se necessário.
              </p>
            </div>

            <form onSubmit={handleCsvImport} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-soft-brown/70 uppercase mb-1">Dados do CSV:</label>
                <textarea
                  rows={8}
                  required
                  value={csvFileContent}
                  onChange={(e) => setCsvFileContent(e.target.value)}
                  placeholder={`Responsável,Telefone,Integrantes\nMaria Silva,11999998888,Maria Silva|João Silva (criança)`}
                  className="w-full p-3 bg-vanilla-white/60 border border-rose-cream/35 rounded-xl font-mono text-[10px] resize-none"
                />
              </div>

              {errorMsg && (
                <p className="text-xs text-rose-500 text-center font-medium bg-rose-50 py-2 px-3 rounded-lg border border-rose-100">
                  ⚠️ {errorMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 bg-golden-honey hover:bg-honey-yellow hover:text-soft-brown text-white font-bold rounded-xl transition duration-150 cursor-pointer uppercase tracking-wider text-xs"
              >
                {isPending ? 'Processando Importação...' : 'Importar Convidados'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
