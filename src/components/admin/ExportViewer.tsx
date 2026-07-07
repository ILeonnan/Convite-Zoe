'use client';

import { FileSpreadsheet, Printer } from 'lucide-react';

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

interface ExportViewerProps {
  families: Family[];
}

export default function ExportViewer({ families }: ExportViewerProps) {
  const allGuests: { familyName: string; name: string; type: string; status: string }[] = [];
  families.forEach((fam) => {
    fam.guests.forEach((g) => {
      allGuests.push({
        familyName: fam.name,
        name: g.name,
        type: g.type,
        status: g.status,
      });
    });
  });

  const confirmedGuests = allGuests.filter((g) => g.status === 'confirmed');
  const adultsCount = confirmedGuests.filter((g) => g.type === 'adult').length;
  const childrenCount = confirmedGuests.filter((g) => g.type === 'child').length;
  const babiesCount = confirmedGuests.filter((g) => g.type === 'baby').length;

  const downloadCSV = () => {
    const headers = ['Família', 'Nome', 'Categoria', 'Status'];
    const rows = allGuests.map((g) => [
      g.familyName,
      g.name,
      g.type === 'child' ? 'Criança' : g.type === 'baby' ? 'Bebê' : 'Adulto',
      g.status === 'confirmed' ? 'Confirmado' : g.status === 'declined' ? 'Recusou' : 'Pendente',
    ]);

    const csvContent = [
      headers.join(';'),
      ...rows.map((r) => r.join(';')),
    ].join('\r\n');

    // UTF-8 BOM helps Excel open Portuguese accents correctly
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'lista_convidados_buffet_zoe.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Hide controls during standard document printing */}
      <style>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
          }
          header, aside, .no-print {
            display: none !important;
          }
          main {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            background: transparent !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          .print-header {
            display: block !important;
          }
        }
        .print-header {
          display: none;
        }
      `}</style>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="font-title text-2xl font-bold text-soft-brown">Exportar para o Buffet</h2>
          <p className="text-xs text-soft-brown/65 mt-0.5">Baixe a lista de convidados ou imprima o relatório consolidado para o buffet.</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={downloadCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-vanilla-white border border-rose-cream/40 hover:bg-rose-cream/20 text-soft-brown font-bold rounded-xl text-xs transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Exportar CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-golden-honey hover:bg-honey-yellow hover:text-soft-brown text-white font-bold rounded-xl text-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Print-only header metadata */}
      <div className="print-header space-y-2 border-b border-gray-300 pb-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Relatório Oficial de Convidados - Aniversário de Zoe</h1>
        <p className="text-xs text-gray-500 font-semibold">Gerado em: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-vanilla-white border border-rose-cream/40 rounded-2xl">
          <p className="text-[10px] font-bold text-soft-brown/60 uppercase tracking-wider">Confirmados (Geral)</p>
          <p className="text-2xl font-extrabold text-golden-honey mt-1">{confirmedGuests.length}</p>
        </div>
        <div className="p-4 bg-vanilla-white border border-rose-cream/40 rounded-2xl">
          <p className="text-[10px] font-bold text-soft-brown/60 uppercase tracking-wider">Adultos Confirmados</p>
          <p className="text-2xl font-extrabold text-soft-brown mt-1">{adultsCount}</p>
        </div>
        <div className="p-4 bg-vanilla-white border border-rose-cream/40 rounded-2xl">
          <p className="text-[10px] font-bold text-soft-brown/60 uppercase tracking-wider">Crianças Confirmadas</p>
          <p className="text-2xl font-extrabold text-soft-brown mt-1">{childrenCount}</p>
        </div>
        <div className="p-4 bg-vanilla-white border border-rose-cream/40 rounded-2xl">
          <p className="text-[10px] font-bold text-soft-brown/60 uppercase tracking-wider">Bebês Confirmados</p>
          <p className="text-2xl font-extrabold text-soft-brown mt-1">{babiesCount}</p>
        </div>
      </div>

      {/* Printable Guest Table */}
      <div className="border border-rose-cream/25 rounded-2xl overflow-hidden bg-white/40">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-vanilla-white/70 text-soft-brown/65 uppercase tracking-wider font-bold border-b border-rose-cream/20">
              <th className="p-3">Família</th>
              <th className="p-3">Nome do Convidado</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {allGuests.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-soft-brown/50 italic">
                  Nenhum convidado na lista.
                </td>
              </tr>
            ) : (
              allGuests.map((g, idx) => (
                <tr key={idx} className="border-b border-rose-cream/15 hover:bg-rose-cream/5 transition-colors">
                  <td className="p-3 font-bold text-soft-brown">{g.familyName}</td>
                  <td className="p-3 text-soft-brown/85 font-medium">{g.name}</td>
                  <td className="p-3 text-soft-brown/80 font-medium capitalize">
                    {g.type === 'child' ? 'Criança' : g.type === 'baby' ? 'Bebê (Colo)' : 'Adulto'}
                  </td>
                  <td className="p-3 font-bold">
                    {g.status === 'confirmed' ? (
                      <span className="text-emerald-600">Confirmado</span>
                    ) : g.status === 'declined' ? (
                      <span className="text-rose-600">Recusou</span>
                    ) : (
                      <span className="text-gray-500">Pendente</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
