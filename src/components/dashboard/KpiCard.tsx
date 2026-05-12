import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";

export function KpiCard({ 
  label, value, status, subtext, index = 0 
}: { 
  label: string; value: string | number; status: "ok" | "warn" | "crit"; subtext?: string; index?: number;
}) {
  const statusConfig = {
    ok: { icon: CheckCircle2, color: "text-[#008F72]", bg: "bg-[#008F72]/10", label: "Adequado" },
    warn: { icon: AlertTriangle, color: "text-[#F4A300]", bg: "bg-[#F4A300]/10", label: "Atenção" },
    crit: { icon: XCircle, color: "text-[#C62828]", bg: "bg-[#C62828]/10", label: "Crítico" },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="bg-[#132F4C] rounded-xl p-5 border border-white/5 shadow-sm relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest w-2/3 leading-relaxed">{label}</h3>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${config.bg} ${config.color}`}>
          <Icon className="h-3 w-3" />
          {config.label}
        </div>
      </div>
      <div className="mt-2 flex flex-col">
        <span className="text-2xl font-black text-[#F5F7FA] tracking-tighter">{value}</span>
        <span className="text-[10px] text-slate-500 mt-1 font-medium">{subtext || "Indicador Oficial"}</span>
      </div>
    </motion.div>
  );
}