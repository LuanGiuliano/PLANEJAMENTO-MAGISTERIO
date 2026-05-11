import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Download, ShieldCheck } from "lucide-react";
import { FilterDropdown } from "@/components/dashboard/FilterDropdown";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ConformidadeChart, VinculoChart, DistribuicaoChart } from "@/components/dashboard/Charts";
import { AuditTable } from "@/components/dashboard/AuditTable";
import { kpis, filtros } from "@/lib/mockData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Auditoria Estratégica - SEDUC 2026" },
      { name: "description", content: "Dashboard executivo de auditoria de RH da SEDUC 2026." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10">
            <ShieldCheck className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-white sm:text-2xl">Auditoria Estratégica — SEDUC 2026</h1>
            <p className="text-xs text-slate-400">Visão executiva do quadro funcional · atualizado agora</p>
          </div>
        </div>
        <button className="group inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/40">
          <Download className="h-4 w-4" />
          Exportar Relatório
        </button>
      </motion.header>

      {/* Filtros */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6"
      >
        <FilterDropdown label="RI" options={filtros.ri} />
        <FilterDropdown label="Município" options={filtros.municipio} />
        <FilterDropdown label="Região" options={filtros.regiao} />
        <FilterDropdown label="Atividade" options={filtros.atividade} />
        <FilterDropdown label="Vínculo" options={filtros.vinculo} />
        <FilterDropdown label="Modalidade" options={filtros.modalidade} />
      </motion.section>

      {/* KPIs */}
      <section className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {kpis.map((k, i) => (
          <KpiCard key={k.label} {...(k as any)} index={i} />
        ))}
      </section>

      {/* Charts */}
      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-2"><ConformidadeChart /></div>
        <div className="lg:col-span-2"><VinculoChart /></div>
        <div className="lg:col-span-1"><DistribuicaoChart /></div>
      </section>

      {/* Table */}
      <AuditTable />

      <footer className="mt-8 text-center text-[11px] text-slate-500">
        SEDUC · Núcleo de Auditoria de RH · Dados simulados (mock) para visualização
      </footer>
    </main>
  );
}
