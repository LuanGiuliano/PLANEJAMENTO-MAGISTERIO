import { motion } from "framer-motion";
import { TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

const statusMap = {
  ok: { color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30", icon: CheckCircle2, label: "Adequado" },
  warn: { color: "text-amber-400 bg-amber-500/10 border-amber-500/30", icon: TrendingUp, label: "Atenção" },
  crit: { color: "text-rose-400 bg-rose-500/10 border-rose-500/30", icon: AlertTriangle, label: "Crítico" },
};

export function KpiCard({ label, value, status, delta, suffix, index }: {
  label: string; value: number; status: "ok" | "warn" | "crit"; delta: string; suffix?: string; index: number;
}) {
  const s = statusMap[status];
  const Icon = s.icon;
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="glass rounded-xl p-5"
    >
      <div className="flex items-start justify-between">
        <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>
        <div className={`flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] ${s.color}`}>
          <Icon className="h-3 w-3" />
          {s.label}
        </div>
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-3xl font-semibold text-white tabular-nums">
          {value.toLocaleString("pt-BR")}
        </span>
        {suffix && <span className="text-sm text-slate-400">{suffix}</span>}
      </div>
      <div className="mt-2 text-xs text-slate-500">
        <span className="text-amber-400">{delta}</span> vs. último ciclo
      </div>
    </motion.div>
  );
}
