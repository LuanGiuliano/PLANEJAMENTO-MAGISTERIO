import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid,
  ScatterChart, Scatter, ZAxis, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from "recharts";

const tooltipStyle = {
  contentStyle: { background: "#102A43", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#F5F7FA", fontSize: "12px", fontWeight: 600 },
  labelStyle: { color: "#F4A300", fontWeight: "bold", marginBottom: "4px" },
};

function ChartCard({ title, subtitle, children, delay = 0, className = "" }: {
  title?: string; subtitle?: string; children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      className={`bg-[#132F4C] border border-white/5 rounded-xl p-6 shadow-sm ${className}`}
    >
      {(title || subtitle) && (
        <div className="mb-6 border-b border-white/5 pb-4">
          {title && <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wide">{title}</h3>}
          {subtitle && <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
      )}
      {children}
    </motion.div>
  );
}

export function ConformidadeChart({ data }: { data?: any }) {
  if (!data || !data.percentual) return null;
  const pctNum = parseFloat(data.percentual);
  const atingiuMeta = pctNum >= 61;

  return (
    <ChartCard delay={0.1} className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-[#102A43] to-[#081C2E]">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#F4A300]"></div>
      
      <div className="flex flex-col mb-8 pl-2">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-[#132F4C] border border-white/10 text-[#F4A300] text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-widest shadow-sm">Objetivo 3.3</span>
        </div>
        <h3 className="text-base font-bold text-[#F5F7FA]">Concentração de Carga Horária Docente</h3>
      </div>
      
      <div className="flex items-end justify-between py-2 mb-5 pl-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">Desempenho Atual</span>
          <span className={`text-6xl font-black leading-none tracking-tighter ${atingiuMeta ? 'text-[#008F72]' : 'text-[#F4A300]'}`}>
            {data.percentual}%
          </span>
        </div>
        <div className="flex flex-col items-end pb-1 pr-2">
           <span className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-widest">Meta Institucional</span>
           <span className="text-2xl font-bold text-[#F5F7FA]">61%</span>
        </div>
      </div>

      <div className="w-full bg-[#081C2E] rounded h-3 mb-8 relative border border-white/5 ml-2 w-[calc(100%-8px)] overflow-hidden">
        <div className={`absolute top-0 left-0 h-full ${atingiuMeta ? 'bg-[#008F72]' : 'bg-[#F4A300]'} transition-all duration-1000`} style={{ width: `${pctNum}%` }}></div>
        <div className="absolute top-0 h-full w-0.5 bg-[#F5F7FA] z-10 shadow-[0_0_5px_rgba(255,255,255,0.5)]" style={{ left: '61%' }}></div>
      </div>

      <div className="grid grid-cols-4 gap-3 text-center mt-2 pl-2">
        {[
          { label: '1 Escola', val: data.q1 },
          { label: '2 Escolas', val: data.q2 },
          { label: '3 Escolas', val: data.q3 },
          { label: '4+ Escolas', val: data.q4 }
        ].map((item, i) => (
          <div key={i} className="bg-white/5 border border-white/5 rounded-lg p-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">{item.label}</div>
            <div className="text-sm font-bold text-[#F5F7FA]">{item.val.toLocaleString('pt-BR')}</div>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export function VinculoChart({ data = [] }: { data?: any[] }) {
  return (
    <ChartCard title="Dispersão Geográfica" subtitle="Alocação por Região de Integração (RI)" delay={0.2} className="lg:col-span-2">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis dataKey="ri" stroke="#64748b" fontSize={9} interval={0} tick={{fill: '#94a3b8'}} tickMargin={8} axisLine={false} tickLine={false} />
          <YAxis stroke="#64748b" fontSize={10} tickFormatter={(val) => val.toLocaleString('pt-BR')} axisLine={false} tickLine={false} />
          <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.02)" }} />
          <Bar dataKey="quantidade" fill="#F4A300" radius={[2, 2, 0, 0]} animationDuration={900} barSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DistribuicaoChart({ data = [] }: { data?: any[] }) {
  const total = data.reduce((s: number, d: any) => s + (d.value || 0), 0);
  const efetivos = data.find(d => d.name === 'Efetivo')?.value || 0;
  const efetivosPct = total > 0 ? ((efetivos / total) * 100).toFixed(0) : "0";

  const formattedData = data.map(d => ({
    ...d,
    color: d.name === 'Efetivo' ? '#008F72' : d.name === 'Contratado' ? '#F4A300' : '#475569'
  }));

  return (
    <ChartCard title="Quadro de Servidores" subtitle="Distribuição de Vínculos" delay={0.3}>
      <div className="relative">
        <ResponsiveContainer width="100%" height={230}>
          <PieChart>
            <Pie
              data={formattedData}
              dataKey="value"
              innerRadius={75}
              outerRadius={95}
              paddingAngle={2}
              stroke="none"
              animationDuration={900}
            >
              {formattedData.map((d: any, index: number) => <Cell key={index} fill={d.color} />)}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-[#F5F7FA]">{efetivosPct}%</span>
          <span className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Efetivos</span>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-2.5 px-2">
        {formattedData.map((d: any, index: number) => (
          <div key={index} className="flex items-center justify-between border-t border-white/5 pt-2 first:border-0 first:pt-0">
            <div className="flex items-center gap-2.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color }} />
              <span className="text-xs font-bold text-[#F5F7FA] uppercase">{d.name}</span>
            </div>
            <span className="text-xs font-bold text-slate-400">{d.value.toLocaleString('pt-BR')}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}

export function IndicadoresScatterChart({ data = [] }: { data?: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <ChartCard title="Dispersão de Metas x Tamanho da Rede" subtitle="Regiões de Integração (Tamanho da bolha = Risco Logístico)" delay={0.1} className="col-span-3">
      <ResponsiveContainer width="100%" height={320}>
        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
          <XAxis 
            type="number" 
            dataKey="pct1Escola" 
            name="Meta 61%" 
            unit="%" 
            stroke="#64748b" 
            fontSize={10} 
            tickFormatter={(v) => `${v}%`} 
            domain={[0, 100]}
          />
          <YAxis 
            type="number" 
            dataKey="totalDocentes" 
            name="Total de Docentes" 
            stroke="#64748b" 
            fontSize={10} 
            tickFormatter={(v) => v.toLocaleString('pt-BR')} 
          />
          <ZAxis type="number" dataKey="riscoLogistico" range={[50, 600]} name="Risco Logístico" />
          <Tooltip 
            cursor={{ strokeDasharray: '3 3' }} 
            contentStyle={{ background: "#102A43", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#F5F7FA" }}
            formatter={(value: any, name: any) => [
              name === 'Meta 61%' ? `${value}%` : value.toLocaleString('pt-BR'), 
              name
            ]}
          />
          <ReferenceLine x={61} stroke="#008F72" strokeDasharray="3 3" label={{ position: 'top', value: 'Meta (61%)', fill: '#008F72', fontSize: 10 }} />
          <Scatter name="RIs" data={data} fill="#C62828" opacity={0.7} animationDuration={1000}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.pct1Escola >= 61 ? '#008F72' : entry.pct1Escola >= 50 ? '#F4A300' : '#C62828'} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function IndicadoresRadarChart({ data = [] }: { data?: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <ChartCard title="Mapeamento de Riscos" subtitle="Top 6 RIs com maiores redes" delay={0.2} className="col-span-2">
      <ResponsiveContainer width="100%" height={320}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis dataKey="ri" tick={{ fill: '#94a3b8', fontSize: 9 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} orientation="middle" />
          <Radar name="Risco Logístico (%)" dataKey="Risco Logístico" stroke="#C62828" fill="#C62828" fillOpacity={0.3} />
          <Radar name="S/ Foco (%)" dataKey="S/ Foco" stroke="#F4A300" fill="#F4A300" fillOpacity={0.3} />
          <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
          <Tooltip 
            contentStyle={{ background: "#102A43", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#F5F7FA" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}