import Papa from 'papaparse';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQAI0FDRMihZS_M-_PgPrwP6Govd2lnuuqeiq3b25tRAFiLkSktXObX030WcPV25xuImAH-ipaohoLV/pub?output=csv';

const sanitize = (s: string) => String(s || '').toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z0-9]/g, "");

export const fetchRawData = async () => {
  const response = await fetch(CSV_URL);
  const csv = await response.text(); 
  const { data } = Papa.parse(csv, { header: true, skipEmptyLines: true });
  return data;
};

export const processDashboardData = (rawData: any[], filtrosAtivos: any = {}) => {
  if (!rawData || rawData.length === 0) return null;

  const colunas = Object.keys(rawData[0]);

  // RADAR BLINDADO
  const findCol = (keywords: string[], avoid: string[] = []) => {
    for (const kw of keywords) {
      const cleanKw = sanitize(kw);
      const found = colunas.find(c => {
        const cleanC = sanitize(c);
        if (cleanC.includes(cleanKw)) {
          if (avoid.some(a => cleanC.includes(sanitize(a)))) return false;
          return true;
        }
        return false;
      });
      if (found) return found;
    }
    return keywords[0]; 
  };

  const kMun = findCol(['MUNICIPIOCARGO', 'MUNICIPIO']);
  const kRI = findCol(['REEGIAODEINTEGRACAO', 'REGIAODEINTEGRACAO', 'INTEGRACAO']); 
  const kReg = findCol(['REGIAOMETROPOLITANA', 'METROPOLITANA']); 
  const kVinc = findCol(['TIPOVINCULO'], ['MATVINC', 'VINCULOLOT']); 
  const kAtivFiltro = findCol(['TIPODEATIVIDADE']); 
  const kAgrup = findCol(['AGRUPAMENTODEATIVIDADES', 'AGRUPAMENTO']); 
  const kLotado = findCol(['LOTADO']);
  const kGestao = findCol(['GESTAOESCOLAR', 'GESTAO']);
  const kReadap = findCol(['READAPTADO', 'READPATADO']);
  const kSubcat = findCol(['SUBCATEGORIA', 'CATEGORIA', 'CARGO']);
  const kQtdEscolas = findCol(['QTDESCOLAS']);
  
  // Colunas para indicadores avançados (Meta 3.3)
  const kRegencia = findCol(['REGENCIADECLASSE', 'REGENCIA']);
  const kQtdVinculos = findCol(['QUANTDEVINCULOS', 'QUANTIDADEDEVINCULOS']);
  const kEscola = findCol(['ESCOLA'], ['GESTAO', 'AGRUPAMENTO', 'QTD']);
  const kVinculo = findCol(['VINCULO'], ['TIPO', 'MATVINC']);
  const kAtivCurr = findCol(['ATIVIDADECURRICULA', 'ATIVIDADECURRICULAR']);
  const kSetorCargo = findCol(['SETORCARGO'], ['COD']);
  const kSetorLot = findCol(['SETORLOT'], ['COD']);
  const kMunLot = findCol(['MUNICIPIOLOT']);

  const uniqueMunicipios = new Set<string>();
  const uniqueRIs = new Set<string>();
  const uniqueRegioes = new Set<string>();
  const uniqueVinculos = new Set<string>();
  const uniqueAtividades = new Set<string>();

  rawData.forEach(linha => {
    const mun = String(linha[kMun] || '').toUpperCase().trim();
    if (mun && mun.length > 2 && mun !== 'UNDEFINED' && mun !== '-') uniqueMunicipios.add(mun);
    let ri = String(linha[kRI] || '').toUpperCase().trim().replace(/^RI\s*/i, '').trim();
    if (ri && ri.length > 2 && ri !== 'UNDEFINED' && ri !== '-') uniqueRIs.add(ri);
    const reg = String(linha[kReg] || '').toUpperCase().trim();
    if (reg && reg.length > 2 && reg !== 'UNDEFINED' && reg !== '-') uniqueRegioes.add(reg);
    const vinc = String(linha[kVinc] || '').toUpperCase().trim();
    if (vinc && vinc.length > 2 && vinc !== 'UNDEFINED' && vinc !== '-') uniqueVinculos.add(vinc);
    const ativ = String(linha[kAtivFiltro] || '').toUpperCase().trim();
    if (ativ && ativ.length > 2 && ativ !== 'UNDEFINED' && ativ !== '-') uniqueAtividades.add(ativ);
  });

  const opcoesFiltros = {
    municipio: ["Todos", ...Array.from(uniqueMunicipios).sort()],
    ri: ["Todas", ...Array.from(uniqueRIs).sort()],
    regiao: ["Todas", ...Array.from(uniqueRegioes).sort()],
    atividade: ["Todas", ...Array.from(uniqueAtividades).sort()],
    vinculo: ["Todos", ...Array.from(uniqueVinculos).sort()],
  };

  let baseFiltrada = rawData.filter((linha: any) => {
    if (filtrosAtivos.ri && filtrosAtivos.ri !== 'Todas') {
        const val = String(linha[kRI] || '').toUpperCase().trim().replace(/^RI\s*/i, '').trim();
        if (val !== filtrosAtivos.ri) return false;
    }
    if (filtrosAtivos.municipio && filtrosAtivos.municipio !== 'Todos') {
        if (String(linha[kMun] || '').toUpperCase().trim() !== filtrosAtivos.municipio) return false;
    }
    if (filtrosAtivos.regiao && filtrosAtivos.regiao !== 'Todas') {
        if (String(linha[kReg] || '').toUpperCase().trim() !== filtrosAtivos.regiao) return false;
    }
    if (filtrosAtivos.vinculo && filtrosAtivos.vinculo !== 'Todos') {
        if (String(linha[kVinc] || '').toUpperCase().trim() !== filtrosAtivos.vinculo) return false;
    }
    if (filtrosAtivos.atividade && filtrosAtivos.atividade !== 'Todas') {
        if (String(linha[kAtivFiltro] || '').toUpperCase().trim() !== filtrosAtivos.atividade) return false;
    }
    return true;
  });

  const mapDocentes = new Map();
  const cpfsAtivCurricular = new Set();
  const cpfsGestao = new Set();
  const cpfsReadaptado = new Set();
  const escolaMap = new Map<string, { total: number; apenas1: number }>(); // Para o cálculo de 100% nas escolas

  baseFiltrada.forEach((linha: any) => {
    let cpf = linha.CPF || linha.cpf;
    let chaveUnica = (cpf && String(cpf).trim().length > 3) ? cpf : linha.SERVIDOR;
    if (!chaveUnica) return;

    const colAgrup = String(linha[kAgrup] || '').toUpperCase();
    const colLot = String(linha[kLotado] || '').toUpperCase();
    const colGest = String(linha[kGestao] || '').toUpperCase();
    const colRead = String(linha[kReadap] || '').toUpperCase();
    
    if (colAgrup.includes('CURRICULAR')) cpfsAtivCurricular.add(chaveUnica);
    if (colLot.includes('SIM') && colGest.includes('SIM')) cpfsGestao.add(chaveUnica);
    if (colRead.includes('SIM')) cpfsReadaptado.add(chaveUnica);

    const strEscolas = String(linha[kQtdEscolas] || '0');
    const qtdEscolas = parseInt(strEscolas.replace(/\D/g, '') || '0'); 
    const isDocente = String(linha[kSubcat] || '').toUpperCase().includes('DOCENTE');
    const municipioAtual = String(linha[kMun] || '').toUpperCase().trim();
    
    // Cálculo de Escolas 100% unicas
    const escolaNome = String(linha[kEscola] || '').toUpperCase();
    if (escolaNome && escolaNome !== '-' && escolaNome !== 'UNDEFINED' && isDocente) {
      if (!escolaMap.has(escolaNome)) escolaMap.set(escolaNome, { total: 0, apenas1: 0 });
      const e = escolaMap.get(escolaNome)!;
      e.total++;
      if (qtdEscolas === 1) e.apenas1++;
    }

    const colSubcat = String(linha[kSubcat] || '').toUpperCase();
    const ehCurricular = ['PROFESSOR', 'ESPECIAL', 'SALA DE LEITURA'].some(s => colSubcat.includes(s)) && !colSubcat.includes('READAPTADO');

    if (isDocente && qtdEscolas >= 1) {
      if (!mapDocentes.has(chaveUnica)) {
        linha._qtdEscolas = qtdEscolas; 
        linha._municipios = new Set();
        const colAtivCurr = String(linha[kAtivCurr] || '').toUpperCase();
        linha._isCurricular = ehCurricular || colAgrup.includes('CURRICULAR') || colAtivCurr === 'SIM';
        linha._isRegencia = String(linha[kRegencia] || '').toUpperCase().includes('SIM');
        
        // Quantidade de Vínculos (Duplo Vínculo)
        const qvStr = String(linha[kQtdVinculos] || '0').replace(',', '.');
        linha._qtdVinculos = parseFloat(qvStr || '0');

        if(municipioAtual && municipioAtual !== 'UNDEFINED' && municipioAtual !== '-') linha._municipios.add(municipioAtual);
        mapDocentes.set(chaveUnica, linha);
      } else {
         const existente = mapDocentes.get(chaveUnica);
         if(municipioAtual && municipioAtual !== 'UNDEFINED' && municipioAtual !== '-') existente._municipios.add(municipioAtual);
         if (qtdEscolas > existente._qtdEscolas) existente._qtdEscolas = qtdEscolas;
         // Preserva se já encontrou Regência em alguma outra linha deste CPF
         if(String(linha[kRegencia] || '').toUpperCase().includes('SIM')) existente._isRegencia = true;
         mapDocentes.set(chaveUnica, existente);
      }
    }
  });

  const docs = Array.from(mapDocentes.values());
  const totalLotados = docs.length;

  const q1 = docs.filter(d => d._qtdEscolas === 1).length;
  const q2 = docs.filter(d => d._qtdEscolas === 2).length;
  const q3 = docs.filter(d => d._qtdEscolas === 3).length;
  const q4 = docs.filter(d => d._qtdEscolas >= 4).length;
  const percent1 = totalLotados > 0 ? ((q1 / totalLotados) * 100) : 0;

  const vinculoCounts: Record<string, number> = {};
  docs.forEach((d: any) => {
    let v = String(d[kVinc] || 'Outros').toUpperCase().trim();
    if(v.includes('EFETIVO')) v = 'Efetivo';
    else if(v.includes('TEMPORARIO') || v.includes('CONTRATO') || v.includes('TEMP')) v = 'Contratado';
    else v = 'Outros';
    vinculoCounts[v] = (vinculoCounts[v] || 0) + 1;
  });

  const riCounts: Record<string, number> = {};
  docs.forEach((d: any) => {
    let ri = String(d[kRI] || 'Outros').toUpperCase().replace(/^RI\s*/i, '').trim();
    if (!ri || ri === 'UNDEFINED' || ri === '') ri = 'Outros';
    riCounts[ri] = (riCounts[ri] || 0) + 1;
  });
  delete riCounts['Outros'];

  // --------------------------------------------------------------------------------
  // O CÁLCULO PROFUNDO DO CLAUDE ADAPTADO AO NOSSO MOTOR RÁPIDO
  // --------------------------------------------------------------------------------
  const docsCurricular = docs.filter(d => d._isCurricular);
  const totalCurricular = docsCurricular.length;

  const docsRegencia = docs.filter(d => d._isRegencia);
  const totalRegencia = docsRegencia.length;

  const curr_q1 = docsCurricular.filter(d => d._qtdEscolas === 1).length;
  const curr_q2 = docsCurricular.filter(d => d._qtdEscolas === 2).length;
  const curr_q3 = docsCurricular.filter(d => d._qtdEscolas === 3).length;
  const curr_q4mais = docsCurricular.filter(d => d._qtdEscolas >= 4).length;

  const pct_1escola = totalCurricular > 0 ? (curr_q1 / totalCurricular) * 100 : 0;
  const pct_2escolas = totalCurricular > 0 ? (curr_q2 / totalCurricular) * 100 : 0;
  const pct_3escolas = totalCurricular > 0 ? (curr_q3 / totalCurricular) * 100 : 0;
  const pct_mais3escolas = totalCurricular > 0 ? (curr_q4mais / totalCurricular) * 100 : 0;

  const reg_q1 = docsRegencia.filter(d => d._qtdEscolas === 1).length;
  const pct_reg_1escola = totalRegencia > 0 ? (reg_q1 / totalRegencia) * 100 : 0;

  const multiMunicipioCount = docs.filter(d => d._municipios.size > 1).length;
  const pct_multi_municipio = totalLotados > 0 ? (multiMunicipioCount / totalLotados) * 100 : 0;

  const duploVinculoTotal = docs.filter(d => d._qtdVinculos >= 2).length;
  const duploVinculoImpacto = docs.filter(d => d._qtdVinculos >= 2 && d._qtdEscolas > 1).length;
  const pct_duplo_vinculo_impacto = totalLotados > 0 ? (duploVinculoImpacto / totalLotados) * 100 : 0;

  const totalEscolas = escolaMap.size;
  const escolasCom100pct = Array.from(escolaMap.values()).filter(e => e.total > 0 && e.apenas1 === e.total).length;
  const pct_escolas_100 = totalEscolas > 0 ? (escolasCom100pct / totalEscolas) * 100 : 0;
const executivo = {
  professoresLotados: totalLotados,

  atividadeCurricular: totalCurricular,

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
         let r = String(d[kRI] || '').toUpperCase().replace(/^RI\s*/i, '').trim();
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
     const docsRI = docs.filter(d => String(d[kRI] || '').toUpperCase().replace(/^RI\s*/i, '').trim() === riData.ri);
     const total = docsRI.length || 1;
     const readaptados = docsRI.filter(d => String(d[kReadap] || '').toUpperCase().includes('SIM')).length;
     return {
         ri: riData.ri.substring(0, 10) + (riData.ri.length > 10 ? "..." : ""),
         "Risco Logístico": parseFloat(((riData.riscoLogistico / total) * 100).toFixed(1)),
         "Múltiplas Escolas": parseFloat(((100 - riData.pct1Escola)).toFixed(1)),
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
      label: "Atividade Curricular",
      value: cpfsAtivCurricular.size.toLocaleString('pt-BR'),
      status: "ok",
      subtext: "Agrupamento Curricular"
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
  },

  tabelas: {
    geral: baseFiltrada,
    cedidos: baseFiltrada.filter((l: any) => String(l[kVinculo] || '').toUpperCase().includes('CEDIDO')),
    movimentados: baseFiltrada.filter((l: any) => {
      const c = String(l[kSetorCargo] || '').toUpperCase().trim();
      const lot = String(l[kSetorLot] || '').toUpperCase().trim();
      return c && lot && c !== lot;
    }),
    readaptados: baseFiltrada.filter((l: any) => String(l[kReadap] || '').toUpperCase().includes('SIM'))
  }
};
};
