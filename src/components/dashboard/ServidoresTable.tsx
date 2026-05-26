import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Search, Download } from 'lucide-react';

interface ServidoresTableProps {
  data: any[];
  title: string;
}

export function ServidoresTable({ data, title }: ServidoresTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const itemsPerPage = 50;

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const lower = searchTerm.toLowerCase();
    return data.filter((item: any) => {
      const nome = String(item['SERVIDOR'] || '').toLowerCase();
      const cargo = String(item['CARGO'] || '').toLowerCase();
      const setor = String(item['SETOR_LOT'] || item['SETOR_CARGO'] || '').toLowerCase();
      const vinculo = String(item['VINCULO'] || '').toLowerCase();
      return nome.includes(lower) || cargo.includes(lower) || setor.includes(lower) || vinculo.includes(lower);
    });
  }, [data, searchTerm]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleExport = () => {
    // Basic CSV export
    if (filteredData.length === 0) return;
    const headers = ['SERVIDOR', 'CPF', 'VINCULO', 'CARGO', 'MUNICIPIO_LOT', 'SETOR_LOT', 'SETOR_CARGO', 'ATIVIDADE'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map((row: any) => 
        headers.map(h => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maskCpf = (cpf: string) => {
    const s = String(cpf || '').trim();
    if (s.length < 11) return s;
    return `***.${s.substring(3, 6)}.${s.substring(6, 9)}-**`;
  };

  return (
    <div className="flex flex-col h-full bg-[#132F4C] rounded-xl border border-white/5 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#F5F7FA]">{title}</h2>
          <p className="text-xs text-slate-400">{filteredData.length.toLocaleString('pt-BR')} registros encontrados</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar servidor..." 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="pl-9 pr-4 py-2 bg-[#081C2E] border border-white/10 rounded-md text-sm text-[#F5F7FA] focus:outline-none focus:border-blue-500 w-64"
            />
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 px-4 py-2 text-xs font-bold hover:bg-blue-600/30 transition"
          >
            <Download size={14} /> CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs text-slate-400 uppercase bg-[#081C2E] sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Servidor</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">CPF</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Cargo</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Vínculo</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Município Lot.</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Setor Lot.</th>
              <th className="px-4 py-3 font-medium whitespace-nowrap">Setor Cargo</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length > 0 ? currentData.map((row, i) => (
              <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition">
                <td className="px-4 py-3 font-medium text-[#F5F7FA] whitespace-nowrap">
                  {String(row['SERVIDOR'] || '-').toUpperCase()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-slate-400">
                  {maskCpf(row['CPF'])}
                </td>
                <td className="px-4 py-3 text-xs">
                  <div className="max-w-[150px] truncate" title={row['CARGO'] || '-'}>
                    {row['CARGO'] || '-'}
                  </div>
                </td>
                <td className="px-4 py-3 text-[10px]">
                  <span className="bg-slate-800 px-2 py-1 rounded border border-slate-700 whitespace-nowrap">
                    {row['VINCULO'] || row['TIPO_VINCULO'] || '-'}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-xs">
                  {row['MUNICIPIO_LOT'] || '-'}
                </td>
                <td className="px-4 py-3 text-xs">
                  <div className="max-w-[200px] truncate" title={row['SETOR_LOT'] || '-'}>
                    {row['SETOR_LOT'] || '-'}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs">
                  <div className="max-w-[200px] truncate" title={row['SETOR_CARGO'] || '-'}>
                    {row['SETOR_CARGO'] || '-'}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                  Nenhum servidor encontrado com os filtros atuais.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-white/5 flex items-center justify-between bg-[#081C2E]">
          <span className="text-xs text-slate-400">
            Mostrando <span className="text-white font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> até <span className="text-white font-medium">{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> de <span className="text-white font-medium">{filteredData.length}</span>
          </span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded bg-[#132F4C] text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-slate-300 font-medium px-2">
              Página {currentPage} de {totalPages}
            </span>
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded bg-[#132F4C] text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
