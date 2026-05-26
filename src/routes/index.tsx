import { useState, useMemo, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Download, Users, MapPin, Target, 
  AlertTriangle, BookOpen, Briefcase, Bell 
} from "lucide-react"; 
import { Sidebar } from "@/components/dashboard/Sidebar";
import { FilterDropdown } from "@/components/dashboard/FilterDropdown";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ConformidadeChart, VinculoChart, DistribuicaoChart, IndicadoresMetasChart, IndicadoresRiscosChart } from "@/components/dashboard/Charts";
import { MapaDispersao } from "@/components/dashboard/MapaDispersao";
import { ServidoresTable } from "@/components/dashboard/ServidoresTable";
import { PoliticasIndicators } from "@/components/dashboard/PoliticasIndicators";
import { fetchRawData, processDashboardData } from "@/lib/mockData"; 

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const [rawData, setRawData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  useEffect(() => {
    fetchRawData()
      .then(data => { setRawData(data); setLoading(false); })
      .catch(() => { setLoading(false); setErro(true); });
  }, []);
  const [activeTab, setActiveTab] = useState('executivo');
  const [filtrosAtivos, setFiltrosAtivos] = useState({
    ri: "Todas", municipio: "Todos", regiao: "Todas", atividade: "Todas", vinculo: "Todos"
  });

  // Mostra spinner enquanto carrega
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#081C2E]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#F4A300]" />
          <span className="text-slate-400 text-sm">Carregando base de dados...</span>
        </div>
      </div>
    );
  }

  if (erro || !rawData || rawData.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#081C2E]">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-10 w-10 text-[#C62828]" />
          <span className="text-slate-300 font-bold">Não foi possível carregar a base de dados.</span>
          <span className="text-slate-500 text-sm">Verifique sua conexão com a internet e recarregue a página.</span>
          <button onClick={() => window.location.reload()} className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // 1. DADOS SEGUROS DO SEU MOCKDATA (A Fonte da Verdade) - só executa quando há dados reais
  const dashboardData = processDashboardData(rawData, filtrosAtivos);

  // 2. EXTRATOR CORRIGIDO (Lê Readaptados com 'SIM' e Regência corretamente)
  const execExtras = useMemo(() => {
    if (!rawData || rawData.length === 0) return { naMatriz: 0, gestoresEmSala: 0, readaptados: 0, regencia: 0 };

    const sanitize = (s: string) => String(s || '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]/g, "");
    const colunas = Object.keys(rawData[0]);
    const findCol = (keywords: string[], avoid: string[] = []) => {
      for (const kw of keywords) {
        const found = colunas.find(c => sanitize(c).includes(sanitize(kw)) && !avoid.some(a => sanitize(c).includes(sanitize(a))));
        if (found) return found;
      }
      return keywords[0] || '';
    };

    const kCPF = findCol(['CPF', 'MATRICULA']);
    const kServ = findCol(['SERVIDOR', 'NOME']);
    const kSubcat = findCol(['SUBCATEGORIA', 'CATEGORIA', 'CARGO']);
    const kGestao = findCol(['GESTAOESCOLAR', 'GESTAO']);
    const kReadap = findCol(['READPATADO', 'READAPTADO']); // Sua Coluna AL
    const kRegencia = findCol(['REGENCIADECLASSE', 'REGENCIA']);
    const kRI = findCol(['REGIAODEINTEGRACAO', 'INTEGRACAO']);
    const kMun = findCol(['MUNICIPIOLOT', 'MUNICIPIO']);
    const kVinc = findCol(['TIPOVINCULO'], ['MATVINC']);

    const cpfsMatriz = new Set();
    const cpfsGestoresEmSala = new Set();
    const cpfsReadaptados = new Set();
    const cpfsRegencia = new Set();

    rawData.forEach((linha: any) => {
      // Aplica filtros gerais
      if (filtrosAtivos.ri !== 'Todas' && sanitize(linha[kRI] || '').replace(/^RI\s*/i, '') !== sanitize(filtrosAtivos.ri)) return;
      if (filtrosAtivos.municipio !== 'Todos' && sanitize(linha[kMun] || '') !== sanitize(filtrosAtivos.municipio)) return;
      if (filtrosAtivos.vinculo !== 'Todos' && sanitize(linha[kVinc] || '') !== sanitize(filtrosAtivos.vinculo)) return;

      let chaveUnica = (linha[kCPF] && String(linha[kCPF]).trim().length > 3) ? linha[kCPF] : linha[kServ];
      if (!chaveUnica) return;

      const colReadap = sanitize(linha[kReadap] || '');
      const colSubcat = sanitize(linha[kSubcat] || '');

      // CORREÇÃO 1: READAPTADOS (Lê a coluna AL com 'SIM' ou subcategoria *ANTES* de ignorar os não-docentes)
      if (colReadap.includes('SIM') || colSubcat.includes('READAP') || colSubcat.includes('READPATADO')) {
        cpfsReadaptados.add(chaveUnica);
      }

      // Conta Apenas Docentes para as outras métricas
      if (!colSubcat.includes('DOCENTE')) return;

      const linhaCompleta = Object.values(linha).map(v => sanitize(String(v))).join(' ');
      const colGestao = sanitize(linha[kGestao] || '');
      const colRegencia = sanitize(linha[kRegencia] || '');

      // CORREÇÃO 2: REGÊNCIA / MATRIZ
      if (linhaCompleta.includes('CURRICULA') || colRegencia.includes('SIM') || linhaCompleta.includes('MATRIZ')) {
        cpfsRegencia.add(chaveUnica);
        if (linhaCompleta.includes('MATRIZ')) {
          cpfsMatriz.add(chaveUnica);
        }
      }

      // Verifica Gestor em Sala
      if (colGestao.includes('SIM') && colRegencia.includes('SIM') && !colReadap.includes('SIM')) {
        cpfsGestoresEmSala.add(chaveUnica);
      }
    });

    return { 
      naMatriz: cpfsMatriz.size, 
      gestoresEmSala: cpfsGestoresEmSala.size,
      readaptados: cpfsReadaptados.size,
      regencia: cpfsRegencia.size
    };
  }, [rawData, filtrosAtivos]);

  if (!dashboardData) return null;
  const { kpis, conformidadeModalidade, vinculoDispersao, distribuicaoGeral, opcoesFiltros, indicadores33, dispersaoRI, radarRiscos, dispersaoMunicipios, tabelas } = dashboardData;

  // ============================================================================
  // CONSOLIDAÇÃO MATEMÁTICA COM AS CORREÇÕES
  // ============================================================================
  const totalCpfs = indicadores33?.totais?.totalDocentes || 0; 
  const totalEfetivo = distribuicaoGeral?.find((d: any) => d.name === 'Efetivo')?.value || 0; 
  const totalTemp = distribuicaoGeral?.find((d: any) => d.name === 'Contratado')?.value || 0; 
  const totalOutros = distribuicaoGeral?.find((d: any) => d.name === 'Outros')?.value || 0; 
  const totalVinculosDocs = totalEfetivo + totalTemp + totalOutros; 

  const pctEfetivos = totalVinculosDocs > 0 ? ((totalEfetivo / totalVinculosDocs) * 100).toFixed(1) : "0.0";
  const pctTemporarios = totalVinculosDocs > 0 ? ((totalTemp / totalVinculosDocs) * 100).toFixed(1) : "0.0";

  // Usando o valor corrigido da Regência
  const totalCurricular = execExtras.regencia; 
  const naMatriz = execExtras.naMatriz;
  const emCodigo = Math.max(0, totalCurricular - naMatriz); 

  const gestaoEscolar = parseInt(String(kpis?.find((k: any) => k.label.includes('Diretores'))?.value || "0").replace(/\./g, ''));
  // Usando o valor corrigido de Readaptados
  const readaptados = execExtras.readaptados; 
  const outrasAtividades = Math.max(0, totalCpfs - totalCurricular - gestaoEscolar - readaptados);
  const totalForaSala = gestaoEscolar + readaptados + outrasAtividades;

  const pctExclusiva = indicadores33?.escolasUnicas?.pct?.toFixed(1) || "0.0";
  const gestoresEmSala = execExtras.gestoresEmSala;

  // Atualizando os KPIs da Aba Estratégica para refletir a correção
  const kpisCorrigidos = kpis.map((k: any) => {
    if (k.label.includes('Readaptados')) return { ...k, value: execExtras.readaptados.toLocaleString('pt-BR') };
    if (k.label.includes('Regência')) return { ...k, value: execExtras.regencia.toLocaleString('pt-BR') };
    return k;
  });



  return (
    <div className="flex h-screen bg-[#081C2E] overflow-hidden font-sans">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 overflow-y-auto relative bg-[#081C2E]">
        <div className="h-1 w-full bg-[#C62828] sticky top-0 z-50"></div>
        
        <header className="bg-[#102A43] border-b border-white/5 px-8 py-3 flex items-center justify-between sticky top-1 z-40">
          <div className="flex items-center gap-4">
            <img src="https://www.seduc.pa.gov.br/site/public/img/brasao_horizontal_cor.png" className="h-9 w-auto" alt="Gov PA" />
            <div className="flex flex-col">
              <h1 className="text-xs font-bold text-[#F5F7FA] uppercase">Secretaria de Estado de Educação</h1>
              <span className="text-[9px] text-[#008F72] font-bold uppercase tracking-widest">Base Conectada · Ao Vivo</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="text-right">
                <div className="text-xs font-bold text-[#F5F7FA]">Gestão Estratégica</div>
                <div className="text-[10px] text-slate-400">SEDUC-PA</div>
             </div>
             <div className="h-8 w-8 rounded bg-[#132F4C] border border-white/10 flex items-center justify-center text-[#F4A300] font-bold">GE</div>
          </div>
        </header>

        <div className="p-8 max-w-[1400px] mx-auto">
          {/* OS 5 FILTROS */}
          <section className="mb-8 grid grid-cols-5 gap-3">
            <FilterDropdown label="Região de Integração" options={opcoesFiltros.ri} value={filtrosAtivos.ri} onChange={(v) => setFiltrosAtivos(p => ({...p, ri: v}))} />
            <FilterDropdown label="Município" options={opcoesFiltros.municipio} value={filtrosAtivos.municipio} onChange={(v) => setFiltrosAtivos(p => ({...p, municipio: v}))} />
            <FilterDropdown label="Geografia" options={opcoesFiltros.regiao} value={filtrosAtivos.regiao} onChange={(v) => setFiltrosAtivos(p => ({...p, regiao: v}))} />
            <FilterDropdown label="Atividade" options={opcoesFiltros.atividade} value={filtrosAtivos.atividade} onChange={(v) => setFiltrosAtivos(p => ({...p, atividade: v}))} />
            <FilterDropdown label="Vínculo" options={opcoesFiltros.vinculo} value={filtrosAtivos.vinculo} onChange={(v) => setFiltrosAtivos(p => ({...p, vinculo: v}))} />
          </section>

          <AnimatePresence mode="wait">
            
            {/* ==================================================== */}
            {/* ABA 1: DASHBOARD EXECUTIVO MACRO (NÚMEROS REAIS)     */}
            {/* ==================================================== */}
            {activeTab === 'executivo' && (
              <motion.div key="exec" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[#F5F7FA] uppercase tracking-wide">Visão Executiva Macro</h2>
                  <button className="flex items-center gap-2 rounded bg-[#132F4C] border border-white/5 px-4 py-2 text-xs font-bold text-[#F5F7FA] hover:text-[#F4A300] transition">
                    <Download size={14} /> EXPORTAR DADOS
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                  {/* CARD 1: FORÇA DE TRABALHO */}
                  <div className="bg-[#132F4C] p-5 rounded-xl border-t-4 border-t-blue-500 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Força de Trabalho</h3>
                        <Users size={16} className="text-blue-500" />
                      </div>
                      <div className="text-3xl font-black text-[#F5F7FA]">{totalCpfs.toLocaleString('pt-BR')} <span className="text-xs text-slate-400 font-normal">CPFs</span></div>
                    </div>
                    <div className="mt-4 text-[11px] text-slate-400 border-t border-white/5 pt-3 flex flex-col gap-1.5">
                       <span className="flex justify-between text-slate-300 font-bold">Total MATVINC: <span className="text-white">{totalVinculosDocs.toLocaleString('pt-BR')}</span></span>
                       <span className="flex justify-between text-slate-500">Efetivos ({pctEfetivos}%): <span className="text-white">{totalEfetivo.toLocaleString('pt-BR')}</span></span>
                       <span className="flex justify-between text-slate-500">Temporários ({pctTemporarios}%): <span className="text-white">{totalTemp.toLocaleString('pt-BR')}</span></span>
                    </div>
                  </div>

                  {/* CARD 2: ATIVIDADE CURRICULAR */}
                  <div className="bg-[#132F4C] p-5 rounded-xl border-t-4 border-t-[#008F72] shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Atividade Curricular</h3>
                        <BookOpen size={16} className="text-[#008F72]" />
                      </div>
                      <div className="text-3xl font-black text-[#F5F7FA]">{totalCurricular.toLocaleString('pt-BR')} <span className="text-xs text-slate-400 font-normal">Docs</span></div>
                    </div>
                    <div className="mt-4 text-[11px] text-slate-400 border-t border-white/5 pt-3 flex flex-col gap-1.5">
                       <span className="flex justify-between text-slate-500">Na Matriz: <span className="text-[#008F72] font-bold">{naMatriz.toLocaleString('pt-BR')}</span></span>
                       <span className="flex justify-between text-slate-500">Em Cód. Atividade: <span className="text-[#008F72] font-bold">{emCodigo.toLocaleString('pt-BR')}</span></span>
                    </div>
                  </div>

                  {/* CARD 3: FORA DE SALA */}
                  <div className="bg-[#132F4C] p-5 rounded-xl border-t-4 border-t-[#F4A300] shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fora de Sala</h3>
                        <Briefcase size={16} className="text-[#F4A300]" />
                      </div>
                      <div className="text-3xl font-black text-[#F5F7FA]">{totalForaSala.toLocaleString('pt-BR')} <span className="text-xs text-slate-400 font-normal">Docs</span></div>
                    </div>
                    <div className="mt-4 text-[11px] text-slate-400 border-t border-white/5 pt-3 flex flex-col gap-1.5">
                       <span className="flex justify-between text-slate-500">Gestão Escolar: <span className="text-[#F4A300]">{gestaoEscolar.toLocaleString('pt-BR')}</span></span>
                       <span className="flex justify-between text-slate-500">Readaptados: <span className="text-[#F4A300]">{readaptados.toLocaleString('pt-BR')}</span></span>
                       <span className="flex justify-between text-slate-500">Outras Atividades: <span className="text-[#F4A300]">{outrasAtividades.toLocaleString('pt-BR')}</span></span>
                    </div>
                  </div>

                  {/* CARD 4: CRUZAMENTOS / ALERTAS */}
                  <div className="bg-[#132F4C] p-5 rounded-xl border-t-4 border-t-[#C62828] shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alertas e Cruzamentos</h3>
                        <Target size={16} className="text-[#C62828]" />
                      </div>
                      <div className="text-3xl font-black text-[#F5F7FA]">{pctExclusiva}%</div>
                      <span className="text-slate-500 uppercase tracking-wider text-[9px] mt-1 block">Escolas c/ lotação 100% exclusiva</span>
                    </div>
                    <div className="mt-4 text-[11px] border-t border-white/5 pt-3 flex flex-col gap-1">
                       <div className="bg-[#C62828]/10 border border-[#C62828]/30 p-2 rounded flex flex-col gap-1">
                          <span className="text-slate-300 font-semibold leading-tight">Gestores em Sala (Não readap.)</span>
                          <span className="text-[#C62828] font-bold text-sm">{gestoresEmSala} detectados</span>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="col-span-1">
                    <DistribuicaoChart data={distribuicaoGeral} />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==================================================== */}
            {/* ABA 2: PLANEJAMENTO ESTRATÉGICO                      */}
            {/* ==================================================== */}
            {activeTab === 'planejamento' && (
              <motion.div key="plan" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-[#F5F7FA] uppercase tracking-wide">Indicadores Estratégicos</h2>
                  <button className="flex items-center gap-2 rounded bg-[#132F4C] border border-white/5 px-4 py-2 text-xs font-bold text-[#F5F7FA] hover:text-[#F4A300]">
                    <Download size={14} /> EXPORTAR RELATÓRIO
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-4 mb-8">
                  {/* Passando os KPIs corrigidos com Regência e Readaptados corretos! */}
                  {kpisCorrigidos.map((k: any, i: number) => <KpiCard key={k.label} {...k} index={i} />)}
                </div>

                <div className="grid grid-cols-5 gap-4 mb-8">
                  <div className="col-span-3"><ConformidadeChart data={conformidadeModalidade} /></div>
                  <div className="col-span-2"><VinculoChart data={vinculoDispersao} /></div>
                </div>

                <div className="flex items-center gap-3 mb-6 mt-10">
                  <div className="h-5 w-1.5 bg-[#C62828] rounded-sm"></div>
                  <h2 className="text-lg font-bold text-[#F5F7FA] uppercase tracking-wide">Fatores de Risco (Meta 3.3)</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#132F4C] p-6 rounded-xl border border-white/5 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 rounded bg-white/5"><Users className="text-[#F4A300]" size={16} /></div>
                      <div>
                        <h3 className="font-bold text-[#F5F7FA] uppercase text-xs">Regência de Classe Exclusiva</h3>
                        <p className="text-[10px] text-slate-400">Docentes apenas em sala de aula</p>
                      </div>
                    </div>
                    <div className="flex items-end gap-4">
                      <div className="text-4xl font-black text-[#008F72]">{indicadores33.regencia.pct}%</div>
                      <div className="mb-1 text-xs font-medium text-slate-500 border-l border-white/10 pl-4">Meta Gov: <span className="text-[#F5F7FA] font-bold">61%</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-[#132F4C] p-6 rounded-xl border border-[#C62828]/30 shadow-sm relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#C62828]"></div>
                    <div className="flex items-center gap-3 mb-6 pl-2">
                      <div className="p-2 rounded bg-[#C62828]/10"><MapPin className="text-[#C62828]" size={16} /></div>
                      <div>
                        <h3 className="font-bold text-[#F5F7FA] uppercase text-xs">Risco de Atuação Intermunicipal</h3>
                        <p className="text-[10px] text-slate-400">Impacto logístico na rede</p>
                      </div>
                    </div>
                    <div className="flex items-end gap-4 pl-2">
                      <div className="text-4xl font-black text-[#C62828]">{indicadores33.multiMunicipio.absoluto}</div>
                      <div className="mb-1 text-xs font-medium text-slate-400 border-l border-white/10 pl-4 max-w-[200px] leading-tight">Docentes lotados em municípios diferentes.</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'geral' && (
               <motion.div key="geral" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                 <div className="grid grid-cols-3 gap-6">
                    <DistribuicaoChart data={distribuicaoGeral} />
                 </div>
               </motion.div>
            )}

            {activeTab === 'indicadores' && (
               <motion.div key="indicadores" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                 <div className="flex items-center justify-between mb-6">
                   <h2 className="text-lg font-bold text-[#F5F7FA] uppercase tracking-wide">Análise Avançada e Dispersão de Metas</h2>
                 </div>
                 <div className="mb-6"><MapaDispersao data={dispersaoMunicipios} /></div>
                 <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    <IndicadoresMetasChart data={dispersaoRI} />
                    <IndicadoresRiscosChart data={radarRiscos} />
                 </div>
               </motion.div>
            )}

            {/* ABAS DE SERVIDORES (Listagens de Dados) */}
            {activeTab === 'lotacao' && (
              <motion.div key="lotacao" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-[calc(100vh-220px)] flex flex-col">
                <div className="flex-1 min-h-[300px]">
                  <ServidoresTable data={tabelas.geral} title="Lotação Geral de Servidores" />
                </div>
                <PoliticasIndicators data={tabelas.geral} />
              </motion.div>
            )}

            {activeTab === 'cedidos' && (
              <motion.div key="cedidos" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-[calc(100vh-220px)] flex flex-col">
                <div className="flex-1 min-h-[300px]">
                  <ServidoresTable data={tabelas.cedidos} title="Servidores Cedidos" />
                </div>
                <PoliticasIndicators data={tabelas.cedidos} />
              </motion.div>
            )}

            {activeTab === 'movimentacoes' && (
              <motion.div key="movimentacoes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-[calc(100vh-220px)] flex flex-col">
                <div className="flex-1 min-h-[300px]">
                  <ServidoresTable data={tabelas.movimentados} title="Movimentações (Setor de Cargo Diferente do Setor Lotado)" />
                </div>
                <PoliticasIndicators data={tabelas.movimentados} />
              </motion.div>
            )}

            {activeTab === 'readaptacoes' && (
              <motion.div key="readaptacoes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-[calc(100vh-220px)] flex flex-col">
                <div className="flex-1 min-h-[300px]">
                  <ServidoresTable data={tabelas.readaptados} title="Servidores Readaptados" />
                </div>
                <PoliticasIndicators data={tabelas.readaptados} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}