import React, { useMemo } from 'react';
import { BookOpen, MapPin, GraduationCap, Users, Clock, Flame, Shield, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface PoliticasIndicatorsProps {
  data: any[];
}

export function PoliticasIndicators({ data }: PoliticasIndicatorsProps) {
  const total = data.length;

  const indicators = useMemo(() => {
    if (total === 0) return [];

    let countEspecial = 0;
    let countQuilombola = 0;
    let countCampo = 0;
    let countIndigena = 0;
    let countFluxo = 0;
    let countTempoIntegral = 0;
    let countComplementar = 0;

    data.forEach(item => {
      const modalidade = String(item['MODALIDADE'] || '').toUpperCase();
      const atividade = String(item['ATIVIDADE'] || item['tipo de atividade'] || '').toUpperCase();

      if (modalidade.includes('ESPECIALIZADO') || modalidade.includes('ESPECIAL')) countEspecial++;
      if (modalidade.includes('QUILOMBOLA')) countQuilombola++;
      if (modalidade.includes('CAMPO')) countCampo++;
      if (modalidade.includes('INDIGENA')) countIndigena++;
      if (modalidade.includes('ACELERACAO') || modalidade.includes('FLUXO')) countFluxo++;
      if (modalidade.includes('TEMPO INTEGRAL')) countTempoIntegral++;
      
      if (atividade.includes('COMPLEMENTAR') || atividade.includes('COMPLEMENTACAO')) countComplementar++;
    });

    return [
      {
        id: 'especial',
        label: 'Educação Especial',
        desc: 'Atendimento do currículo',
        count: countEspecial,
        pct: (countEspecial / total) * 100,
        icon: Shield,
        color: 'text-purple-400',
        bg: 'bg-purple-400/10',
        border: 'border-purple-500/30',
        hex: '#c084fc'
      },
      {
        id: 'quilombola',
        label: 'Quilombola',
        desc: 'Atendimento do currículo',
        count: countQuilombola,
        pct: (countQuilombola / total) * 100,
        icon: Users,
        color: 'text-orange-400',
        bg: 'bg-orange-400/10',
        border: 'border-orange-500/30',
        hex: '#fb923c'
      },
      {
        id: 'campo',
        label: 'Escolas do Campo',
        desc: 'Atendimento do currículo',
        count: countCampo,
        pct: (countCampo / total) * 100,
        icon: MapPin,
        color: 'text-green-400',
        bg: 'bg-green-400/10',
        border: 'border-green-500/30',
        hex: '#4ade80'
      },
      {
        id: 'indigena',
        label: 'Educação Indígena',
        desc: 'Atendimento do currículo',
        count: countIndigena,
        pct: (countIndigena / total) * 100,
        icon: Flame,
        color: 'text-red-400',
        bg: 'bg-red-400/10',
        border: 'border-red-500/30',
        hex: '#f87171'
      },
      {
        id: 'fluxo',
        label: 'Correção de Fluxo',
        desc: 'Aceleração/Correção',
        count: countFluxo,
        pct: (countFluxo / total) * 100,
        icon: ArrowUpRight,
        color: 'text-pink-400',
        bg: 'bg-pink-400/10',
        border: 'border-pink-500/30',
        hex: '#f472b6'
      },
      {
        id: 'integral',
        label: 'Tempo Integral',
        desc: 'Turmas/Currículos TI',
        count: countTempoIntegral,
        pct: (countTempoIntegral / total) * 100,
        icon: Clock,
        color: 'text-blue-400',
        bg: 'bg-blue-400/10',
        border: 'border-blue-500/30',
        hex: '#60a5fa'
      },
      {
        id: 'complementar',
        label: 'Ativ. Complementar',
        desc: 'Ampliando matrículas',
        count: countComplementar,
        pct: (countComplementar / total) * 100,
        icon: BookOpen,
        color: 'text-cyan-400',
        bg: 'bg-cyan-400/10',
        border: 'border-cyan-500/30',
        hex: '#22d3ee'
      }
    ];
  }, [data, total]);

  if (total === 0) return null;

  return (
    <div className="mt-6">
      <div className="flex items-center gap-3 mb-4">
         <div className="h-5 w-1.5 bg-blue-500 rounded-sm"></div>
         <h2 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wide">Indicadores de Políticas Educacionais</h2>
         <span className="text-[10px] bg-[#132F4C] px-2 py-0.5 rounded text-slate-400 border border-white/5 ml-2">Baseado na visualização atual ({total.toLocaleString('pt-BR')} profs)</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {indicators.map((ind, i) => {
          const Icon = ind.icon;
          return (
            <motion.div 
              key={ind.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`bg-[#132F4C] p-4 rounded-xl border ${ind.border} flex flex-col justify-between hover:bg-white/[0.02] transition`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${ind.bg}`}>
                  <Icon size={16} className={ind.color} />
                </div>
                <div className="text-right">
                  <div className={`text-xl font-black ${ind.color}`}>
                    {ind.pct.toFixed(1).replace('.', ',')}%
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-[11px] font-bold text-[#F5F7FA] uppercase leading-tight mb-1">{ind.label}</h3>
                <p className="text-[9px] text-slate-400 leading-tight">{ind.desc}</p>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-medium">Lotações</span>
                  <span className="text-[10px] font-bold text-slate-300">{ind.count.toLocaleString('pt-BR')}</span>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-black/20 h-1 mt-3 rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min(100, Math.max(2, ind.pct))}%`, backgroundColor: ind.hex }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
