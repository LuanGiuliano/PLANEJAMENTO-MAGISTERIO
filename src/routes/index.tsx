import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
// 👇 AQUI ESTÁ O SEGREDO: O 'Target' foi adicionado no final desta linha! 👇
import { Loader2, Download, Users, MapPin, GitBranch, School, Bell, Target } from "lucide-react"; 
import { Sidebar } from "@/components/dashboard/Sidebar";
import { FilterDropdown } from "@/components/dashboard/FilterDropdown";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ConformidadeChart, VinculoChart, DistribuicaoChart } from "@/components/dashboard/Charts";
import { fetchRawData, processDashboardData } from "@/lib/mockData"; 

export const Route = createFileRoute("/")({
  loader: async () => await fetchRawData(),
  pendingComponent: () => (
    <div className="flex min-h-screen items-center justify-center bg-[#081C2E]">
      <Loader2 className="h-10 w-10 animate-spin text-[#F4A300]" />
    </div>
  ),
  component: Dashboard,
});

function Dashboard() {
  const rawData = Route.useLoaderData();
  const [activeTab, setActiveTab] = useState('planejamento');
  const [filtrosAtivos, setFiltrosAtivos] = useState({
    ri: "Todas", municipio: "Todos", regiao: "Todas", atividade: "Todas", vinculo: "Todos"
  });

  const dashboardData = useMemo(() => processDashboardData(rawData, filtrosAtivos), [rawData, filtrosAtivos]);
  if (!dashboardData) return null;

  const { kpis, conformidadeModalidade, vinculoDispersao, distribuicaoGeral, opcoesFiltros, indicadores33 } = dashboardData;

  return (
    <div className="flex h-screen bg-[#081C2E] overflow-hidden font-sans selection:bg-[#C62828] selection:text-white">
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-y-auto relative bg-[#081C2E]">
        {/* FAIXA VERMELHA INSTITUCIONAL */}
        <div className="h-1 w-full bg-[#C62828] sticky top-0 z-50"></div>
        
        {/* HEADER GOVTECH EXECUTIVO */}
        <header className="bg-[#102A43] border-b border-white/5 px-8 py-3 flex items-center justify-between sticky top-1 z-40 shadow-sm relative overflow-hidden">
          {/* Diagonal sutil do header */}
          <div className="absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-bl from-[#C62828]/5 to-transparent pointer-events-none"></div>

          <div className="flex items-center gap-4 relative z-10">
            <img src="https://www.seduc.pa.gov.br/site/public/img/brasao_horizontal_cor.png" className="h-9 w-auto drop-shadow-md" alt="Gov PA" />
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <div className="flex flex-col">
              <h1 className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wide">Secretaria de Estado de Educação</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-[#008F72] animate-pulse"></div>
                <span className="text-[9px] text-[#008F72] font-bold uppercase tracking-widest">Base Conectada · Ao Vivo</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 relative z-10">
            <button className="text-slate-400 hover:text-[#F4A300] transition-colors relative">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#C62828]"></span>
            </button>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-bold text-[#F5F7FA]">Gestão Estratégica</div>
                <div className="text-[10px] text-slate-400 font-medium">SEDUC-PA</div>
              </div>
              <div className="h-8 w-8 rounded bg-[#132F4C] border border-white/10 flex items-center justify-center text-xs font-bold text-[#F4A300]">
                GE
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1400px] mx-auto">
          {/* BARRA DE FILTROS */}
          <section className="mb-8 grid grid-cols-5 gap-3">
            <FilterDropdown label="Região de Integração" options={opcoesFiltros.ri} value={filtrosAtivos.ri} onChange={(v) => setFiltrosAtivos(p => ({...p, ri: v}))} />
            <FilterDropdown label="Município" options={opcoesFiltros.municipio} value={filtrosAtivos.municipio} onChange={(v) => setFiltrosAtivos(p => ({...p, municipio: v}))} />
            <FilterDropdown label="Geografia" options={opcoesFiltros.regiao} value={filtrosAtivos.regiao} onChange={(v) => setFiltrosAtivos(p => ({...p, regiao: v}))} />
            <FilterDropdown label="Atividade" options={opcoesFiltros.atividade} value={filtrosAtivos.atividade} onChange={(v) => setFiltrosAtivos(p => ({...p, atividade: v}))} />
            <FilterDropdown label="Vínculo" options={opcoesFiltros.vinculo} value={filtrosAtivos.vinculo} onChange={(v) => setFiltrosAtivos(p => ({...p, vinculo: v}))} />
          </section>

          <AnimatePresence mode="wait">
            {activeTab === 'planejamento' && (
              <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[#F5F7FA] uppercase tracking-wide">Indicadores Estratégicos</h2>
                  <button className="flex items-center gap-2 rounded bg-[#132F4C] border border-white/5 px-4 py-2 text-xs font-bold text-[#F5F7FA] hover:text-[#F4A300] transition-colors">
                    <Download size={14} /> EXPORTAR RELATÓRIO
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-4 mb-8">
                  {kpis.map((k: any, i: number) => <KpiCard key={k.label} {...k} index={i} />)}
                </div>

                <div className="grid grid-cols-5 gap-4 mb-8">
                  <div className="col-span-3"><ConformidadeChart data={conformidadeModalidade} /></div>
                  <div className="col-span-2"><VinculoChart data={vinculoDispersao} /></div>
                </div>

                <div className="flex items-center gap-3 mb-6 mt-10">
                  <div className="h-5 w-1.5 bg-[#C62828] rounded-sm"></div>
                  <h2 className="text-lg font-bold text-[#F5F7FA] uppercase tracking-wide">Análise de Fatores de Risco</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#132F4C] p-6 rounded-xl border border-white/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded bg-white/5"><Users className="text-[#F4A300]" size={16} /></div>
                      <div>
                        <h3 className="font-bold text-[#F5F7FA] uppercase text-xs tracking-wide">Regência de Classe Exclusiva</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Docentes apenas em sala de aula</p>
                      </div>
                    </div>
                    <div className="flex items-end gap-4">
                      <div className="text-4xl font-black text-[#008F72] tracking-tighter">{indicadores33.regencia.pct}%</div>
                      <div className="mb-1 text-xs font-medium text-slate-500 border-l border-white/10 pl-4">
                        Meta Gov: <span className="text-[#F5F7FA] font-bold">61%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-[#132F4C] p-6 rounded-xl border border-[#C62828]/30 shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C62828]"></div>
                    <div className="flex items-center gap-3 mb-6 pl-2">
                      <div className="p-2 rounded bg-[#C62828]/10"><MapPin className="text-[#C62828]" size={16} /></div>
                      <div>
                        <h3 className="font-bold text-[#F5F7FA] uppercase text-xs tracking-wide">Risco de Atuação Intermunicipal</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5">Impacto logístico na rede</p>
                      </div>
                    </div>
                    <div className="flex items-end gap-4 pl-2">
                      <div className="text-4xl font-black text-[#C62828] tracking-tighter">{indicadores33.multiMunicipio.absoluto.toLocaleString('pt-BR')}</div>
                      <div className="mb-1 text-xs font-medium text-slate-400 border-l border-white/10 pl-4 max-w-[200px] leading-tight">
                        Docentes lotados em municípios diferentes.
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Outras Abas mantidas limpas */}
            {activeTab === 'geral' && (
               <motion.div key="geral" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                 <div className="grid grid-cols-3 gap-6">
                    <DistribuicaoChart data={distribuicaoGeral} />
                 </div>
               </motion.div>
            )}

            {(activeTab !== 'planejamento' && activeTab !== 'geral') && (
              <motion.div key="empty" className="flex flex-col items-center justify-center py-32 text-center">
                <div className="p-5 rounded bg-[#132F4C] border border-white/5 mb-6"><Target className="text-[#F4A300]" size={32} /></div>
                <h2 className="text-xl font-bold text-[#F5F7FA] uppercase tracking-wide">Módulo Operacional em Construção</h2>
                <p className="text-sm text-slate-400 max-w-md mt-3">As diretrizes e relatórios deste módulo estão sendo homologados conforme as normativas do Governo do Estado.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}