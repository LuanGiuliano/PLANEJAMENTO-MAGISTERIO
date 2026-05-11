import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from "recharts";
import { conformidadeModalidade, vinculoDispersao, distribuicaoGeral } from "@/lib/mockData";

const tooltipStyle = {
  contentStyle: {
    background: "rgba(10,25,47,0.95)",
    border: "1px solid rgba(245,197,66,0.4)",
    borderRadius: 8,
    color: "#fff",
  },
  labelStyle: { color: "#f5c542" },
};

function ChartCard({ title, subtitle, children, delay = 0, className = "" }: {
  title: string; subtitle?: string; children: React.ReactNode; delay?: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className={`glass rounded-xl p-5 ${className}`}
    >
      <div className="mb-4">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
}

export function ConformidadeChart() {
  return (
    <ChartCard title="Conformidade por Modalidade" subtitle="% de adequação por programa" delay={0.1} className="lg:col-span-2">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={conformidadeModalidade} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} />
          <YAxis dataKey="modalidade" type="category" stroke="#94a3b8" fontSize={11} width={120} />
          <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(245,197,66,0.05)" }} />
          <Bar dataKey="conformidade" fill="#f5c542" radius={[0, 6, 6, 0]} animationDuration={900} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function VinculoChart() {
  return (
    <ChartCard title="Vínculo vs Dispersão de Escolas" subtitle="Distribuição por nº de escolas" delay={0.2} className="lg:col-span-2">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={vinculoDispersao}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="vinculo" stroke="#94a3b8" fontSize={11} />
          <YAxis stroke="#64748b" fontSize={11} />
          <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(245,197,66,0.05)" }} />
          <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
          <Bar dataKey="umaEscola" name="1 escola" stackId="a" fill="#f5c542" animationDuration={900} />
          <Bar dataKey="duasEscolas" name="2 escolas" stackId="a" fill="#60a5fa" animationDuration={900} />
          <Bar dataKey="tresOuMais" name="3+ escolas" stackId="a" fill="#f87171" radius={[6, 6, 0, 0]} animationDuration={900} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function DistribuicaoChart() {
  const total = distribuicaoGeral.reduce((s, d) => s + d.value, 0);
  const efetivosPct = ((distribuicaoGeral[0].value / total) * 100).toFixed(0);
  return (
    <ChartCard title="Distribuição Geral" subtitle="Por tipo de vínculo" delay={0.3}>
      <div className="relative">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={distribuicaoGeral}
              dataKey="value"
              innerRadius={70}
              outerRadius={105}
              paddingAngle={3}
              animationDuration={900}
            >
              {distribuicaoGeral.map((d) => <Cell key={d.name} fill={d.color} stroke="none" />)}
            </Pie>
            <Tooltip {...tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold text-white">{efetivosPct}%</span>
          <span className="text-xs text-slate-400">Efetivos</span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        {distribuicaoGeral.map((d) => (
          <div key={d.name} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
            <span className="text-slate-300">{d.name}</span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
