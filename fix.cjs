const fs = require('fs');

const filePath = 'src/lib/mockData.ts';
let content = fs.readFileSync(filePath, 'utf-8');

const startIdx = content.indexOf('<<<<<<< Updated upstream');
const endIdx = content.indexOf('>>>>>>> Stashed changes') + '>>>>>>> Stashed changes'.length;

if (startIdx === -1 || endIdx === -1) {
    console.error('Conflict markers not found');
    process.exit(1);
}

const mergedContent = `  atividadeCurricular: totalCurricular,

  foraSala:
    cpfsGestao.size +
    cpfsReadaptado.size,

  gestaoEscolar:
    cpfsGestao.size,

  readaptados:
    cpfsReadaptado.size,

  escolasExclusivas:
    pct_escolas_100,

  gestoresEmSala:
    docs.filter((d: any) =>
      String(d[kGestao] || '')
        .toUpperCase()
        .includes('SIM') &&
      !String(d[kReadap] || '')
        .toUpperCase()
        .includes('SIM')
    ).length,

  totalEfetivos:
    vinculoCounts['Efetivo'] || 0,

  totalTemporarios:
    vinculoCounts['Contratado'] || 0,
};

  // --- NOVOS DADOS PARA A ABA DE INDICADORES ---
  const dispersaoRI = Array.from(uniqueRIs).map(riStr => {
     const docsRI = docs.filter(d => {
         let r = String(d[kRI] || '').toUpperCase().replace(/^RI\\s*/i, '').trim();
         return r === riStr;
     });
     const total = docsRI.length;
     const docsCurr = docsRI.filter(d => d._isCurricular);
     const totalCurr = docsCurr.length;
     const curr1 = docsCurr.filter(d => d._qtdEscolas === 1).length;
     const pct1 = totalCurr > 0 ? (curr1 / totalCurr) * 100 : 0;
     const multiMun = docsRI.filter(d => d._municipios.size > 1).length;
     const duploVinc = docsRI.filter(d => d._qtdVinculos >= 2).length;

     return {
        ri: riStr,
        totalDocentes: total,
        pct1Escola: parseFloat(pct1.toFixed(1)),
        riscoLogistico: multiMun + duploVinc
     };
  }).filter(d => d.totalDocentes > 0);

  const topRIsRadar = [...dispersaoRI].sort((a, b) => b.totalDocentes - a.totalDocentes).slice(0, 6);
  const radarRiscos = topRIsRadar.map(riData => {
     const docsRI = docs.filter(d => String(d[kRI] || '').toUpperCase().replace(/^RI\\s*/i, '').trim() === riData.ri);
     const total = docsRI.length || 1;
     const readaptados = docsRI.filter(d => String(d[kReadap] || '').toUpperCase().includes('SIM')).length;
     return {
         ri: riData.ri.substring(0, 10) + (riData.ri.length > 10 ? "..." : ""),
         "Risco Logístico": parseFloat(((riData.riscoLogistico / total) * 100).toFixed(1)),
         "S/ Foco": parseFloat(((100 - riData.pct1Escola)).toFixed(1)),
         "Afastamentos": parseFloat(((readaptados / total) * 100).toFixed(1)),
     };
  });

  const dispersaoMunicipios = Array.from(uniqueMunicipios).map(munStr => {
     const docsMun = docs.filter(d => {
         let m = String(d[kMun] || '').toUpperCase().trim();
         return m === munStr;
     });
     const total = docsMun.length;
     const docsCurr = docsMun.filter(d => d._isCurricular);
     const totalCurr = docsCurr.length;
     const curr1 = docsCurr.filter(d => d._qtdEscolas === 1).length;
     const pct1 = totalCurr > 0 ? (curr1 / totalCurr) * 100 : 0;
     const multiMun = docsMun.filter(d => d._municipios.size > 1).length;
     const duploVinc = docsMun.filter(d => d._qtdVinculos >= 2).length;

     return {
        municipio: munStr,
        totalDocentes: total,
        pct1Escola: parseFloat(pct1.toFixed(1)),
        riscoLogistico: multiMun + duploVinc
     };
  }).filter(d => d.totalDocentes > 0);

 return {
  executivo,
  dispersaoRI,
  radarRiscos,
  dispersaoMunicipios,

  kpis: [
    {
      label: "Total Docentes na Rede",
      value: totalLotados.toLocaleString('pt-BR'),
      status: "ok",
      subtext: "Filtro Selecionado"
    },
    {
      label: "Docentes em Regência",
      value: cpfsAtivCurricular.size.toLocaleString('pt-BR'),
      status: "ok",
      subtext: "Atividade Curricular"
    },
    {
      label: "Diretores/Coordenadores",
      value: cpfsGestao.size.toLocaleString('pt-BR'),
      status: "warn",
      subtext: "Gestão Escolar"
    },
    {
      label: "Servidores Readaptados",
      value: cpfsReadaptado.size.toLocaleString('pt-BR'),
      status: "crit",
      subtext: "Afastamento/Saúde"
    },
    {
      label: "Risco Logístico Alto",
      value: multiMunicipioCount.toLocaleString('pt-BR'),
      status: multiMunicipioCount > 0 ? "crit" : "ok",
      subtext: "Atuam em múltiplos municípios"
    },
  ],

  conformidadeModalidade: {
    percentual: percent1.toFixed(1),
    q1,
    q2,
    q3,
    q4
  },

  vinculoDispersao: Object.entries(riCounts)
    .map(([ri, quantidade]) => ({
      ri,
      quantidade: quantidade as number
    }))
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 8),

  distribuicaoGeral: [
    {
      name: "Efetivo",
      value: vinculoCounts['Efetivo'] || 0,
      color: "#10b981"
    },
    {
      name: "Contratado",
      value: vinculoCounts['Contratado'] || 0,
      color: "#f59e0b"
    },
    {
      name: "Outros",
      value: vinculoCounts['Outros'] || 0,
      color: "#64748b"
    },
  ],

  opcoesFiltros,

  indicadores33: {
    meta: {
      objetivo: 'Concentrar a carga horária em 1 escola',
      formula: '(Nº em ≤1 escola / Rede) × 100',
      meta2025: 61,
      meta2026: 61,
      realizado: parseFloat(pct_1escola.toFixed(1)),
      status:
        pct_1escola >= 61
          ? 'atingido'
          : pct_1escola >= 55
          ? 'alerta'
          : 'critico',
    },

    lotacao: [
      {
        label: 'Lotados em 1 escola',
        formula: '(Nº 1 escola / Nº curriculares)',
        absoluto: curr_q1,
        pct: parseFloat(pct_1escola.toFixed(1)),
        meta: 61,
        status: pct_1escola >= 61 ? 'atingido' : 'alerta'
      },
      {
        label: 'Lotados em 2 escolas',
        formula: '(Nº 2 escolas / Nº curriculares)',
        absoluto: curr_q2,
        pct: parseFloat(pct_2escolas.toFixed(1)),
        meta: null,
        status: 'informativo'
      },
      {
        label: 'Lotados em 3 escolas',
        formula: '(Nº 3 escolas / Nº curriculares)',
        absoluto: curr_q3,
        pct: parseFloat(pct_3escolas.toFixed(1)),
        meta: null,
        status: 'informativo'
      },
      {
        label: 'Lotados em 4+ escolas',
        formula: '(Nº 4+ / Nº curriculares)',
        absoluto: curr_q4mais,
        pct: parseFloat(pct_mais3escolas.toFixed(1)),
        meta: null,
        status: curr_q4mais > 0 ? 'alerta' : 'ok'
      },
    ],

    regencia: {
      label: 'Professores em regência em 1 única escola',
      formula:
        '(Nº em regência em 1 escola / Nº em regência) × 100',
      absoluto: reg_q1,
      total: totalRegencia,
      pct: parseFloat(pct_reg_1escola.toFixed(1)),
      meta: 61,
      status:
        pct_reg_1escola >= 61
          ? 'atingido'
          : 'alerta',
    },

    multiMunicipio: {
      label: 'Docentes em municípios diferentes',
      formula: '(Nº em 2+ municípios / Total) × 100',
      absoluto: multiMunicipioCount,
      pct: parseFloat(pct_multi_municipio.toFixed(2)),
      status:
        multiMunicipioCount > 0
          ? 'critico'
          : 'ok',
    },

    duploVinculo: {
      label: 'Duplo vínculo',
      formula:
        '(Nº com 2+ vínculos em 2+ escolas / Total) × 100',
      total: duploVinculoTotal,
      impacto: duploVinculoImpacto,
      pctImpacto: parseFloat(
        pct_duplo_vinculo_impacto.toFixed(2)
      ),
      status:
        duploVinculoImpacto > 0
          ? 'alerta'
          : 'ok',
    },

    escolasUnicas: {
      label: '% Escolas exclusivas (100% profs.)',
      formula: '(Nº escolas 100% / Total) × 100',
      totalEscolas,
      escolasCom100pct,
      pct: parseFloat(pct_escolas_100.toFixed(1)),
      meta: null,
      status: 'informativo',
    },

    totais: {
      totalDocentes: totalLotados,
      totalCurricular,
      totalRegencia
    },
  }
};
};`;

const newContent = content.substring(0, startIdx) + mergedContent + content.substring(endIdx);
fs.writeFileSync(filePath, newContent, 'utf-8');
console.log('Conflict resolved in mockData.ts');
