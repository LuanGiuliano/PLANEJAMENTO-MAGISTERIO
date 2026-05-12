import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const statusStyles: Record<string, string> = {
  Adequado: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  Pendente: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  Crítico: "bg-rose-500/10 text-rose-300 border-rose-500/30",
};

// 1. Ensinamos o componente a receber o "data" que vem do index.tsx
export function AuditTable({ data = [] }: { data?: any[] }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  // 2. Mapeamento Inteligente: Converte as colunas maiúsculas do CSV para a tabela
  const safeData = useMemo(() => {
    return data.map((item) => ({
      nome: item.nome || item.SERVIDOR || item.NOME || "Não informado",
      cpf: String(item.cpf || item.CPF || "---"),
      municipio: item.municipio || item.MUNICIPIO_LOT || "---",
      vinculo: item.vinculo || item.TIPO_VINCULO || "---",
      modalidade: item.modalidade || item.MODALIDADE || "---",
      // Calcula o status na hora baseado na quantidade de escolas!
      status: item.status || (parseInt(item['QTD ESCOLAS'] || item.QTD_ESCOLAS) > 1 ? "Crítico" : "Adequado"),
    }));
  }, [data]);

  // 3. O filtro agora busca no nosso safeData
  const filtered = useMemo(() =>
    safeData.filter(r => 
      r.nome.toLowerCase().includes(q.toLowerCase()) || 
      r.cpf.includes(q)
    ),
  [q, safeData]);

  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="glass rounded-xl p-5"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Auditoria de Servidores</h3>
          <p className="text-xs text-slate-400">{filtered.length} registros encontrados</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Buscar por nome ou CPF..."
            className="w-full rounded-lg border border-amber-500/20 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/60 focus:outline-none sm:w-72"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-amber-500/10 text-left text-[11px] uppercase tracking-wider text-slate-400">
              <th className="px-3 py-2 font-medium">Nome</th>
              <th className="px-3 py-2 font-medium">CPF</th>
              <th className="px-3 py-2 font-medium">Município</th>
              <th className="px-3 py-2 font-medium">Vínculo</th>
              <th className="px-3 py-2 font-medium">Modalidade</th>
              <th className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((r, idx) => (
              <tr key={r.cpf + idx} className="border-b border-white/5 text-slate-200 transition-colors hover:bg-amber-500/5">
                <td className="px-3 py-3 font-medium text-white">{r.nome}</td>
                <td className="px-3 py-3 text-slate-400 tabular-nums">{r.cpf}</td>
                <td className="px-3 py-3">{r.municipio}</td>
                <td className="px-3 py-3">{r.vinculo}</td>
                <td className="px-3 py-3">{r.modalidade}</td>
                <td className="px-3 py-3">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${statusStyles[r.status] || statusStyles['Pendente']}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {pageData.length === 0 && (
              <tr><td colSpan={6} className="px-3 py-8 text-center text-slate-500">Nenhum registro encontrado</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
        <span>Página {page} de {totalPages}</span>
        <div className="flex gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-md border border-amber-500/20 p-1.5 text-slate-300 transition-colors hover:bg-amber-500/10 disabled:opacity-30"
          ><ChevronLeft className="h-4 w-4" /></button>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-md border border-amber-500/20 p-1.5 text-slate-300 transition-colors hover:bg-amber-500/10 disabled:opacity-30"
          ><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
    </motion.div>
  );
}