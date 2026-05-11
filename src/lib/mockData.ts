export const kpis = [
  { label: "Efetivos", value: 8420, status: "ok", delta: "+2.3%" },
  { label: "Contratados", value: 3160, status: "warn", delta: "+8.1%" },
  { label: "Cedidos", value: 412, status: "ok", delta: "-1.2%" },
  { label: "Duplo Vínculo", value: 287, status: "crit", delta: "+5.4%" },
  { label: "Média de Escolas", value: 1.7, status: "ok", delta: "0.0%", suffix: " esc." },
];

export const conformidadeModalidade = [
  { modalidade: "Ensino Médio", conformidade: 92 },
  { modalidade: "EJA", conformidade: 78 },
  { modalidade: "Técnico", conformidade: 85 },
  { modalidade: "Profissionalizante", conformidade: 70 },
  { modalidade: "Indígena", conformidade: 64 },
  { modalidade: "Quilombola", conformidade: 58 },
];

export const vinculoDispersao = [
  { vinculo: "Efetivo", umaEscola: 6200, duasEscolas: 1800, tresOuMais: 420 },
  { vinculo: "Contratado", umaEscola: 2100, duasEscolas: 850, tresOuMais: 210 },
  { vinculo: "Cedido", umaEscola: 320, duasEscolas: 70, tresOuMais: 22 },
];

export const distribuicaoGeral = [
  { name: "Efetivos", value: 8420, color: "#f5c542" },
  { name: "Contratados", value: 3160, color: "#60a5fa" },
  { name: "Cedidos", value: 412, color: "#34d399" },
  { name: "Duplo Vínculo", value: 287, color: "#f87171" },
];

export const auditoria = [
  { nome: "Ana Beatriz Souza", cpf: "***.234.567-**", municipio: "Belém", vinculo: "Efetivo", modalidade: "Ensino Médio", status: "Adequado" },
  { nome: "Carlos Henrique Lima", cpf: "***.876.543-**", municipio: "Ananindeua", vinculo: "Contratado", modalidade: "EJA", status: "Pendente" },
  { nome: "Daniela Ribeiro", cpf: "***.111.222-**", municipio: "Marabá", vinculo: "Efetivo", modalidade: "Técnico", status: "Adequado" },
  { nome: "Eduardo Tavares", cpf: "***.555.666-**", municipio: "Santarém", vinculo: "Duplo Vínculo", modalidade: "Ensino Médio", status: "Crítico" },
  { nome: "Fernanda Castro", cpf: "***.777.888-**", municipio: "Castanhal", vinculo: "Cedido", modalidade: "Profissionalizante", status: "Adequado" },
  { nome: "Gabriel Moura", cpf: "***.999.000-**", municipio: "Altamira", vinculo: "Efetivo", modalidade: "Indígena", status: "Pendente" },
  { nome: "Helena Cardoso", cpf: "***.123.789-**", municipio: "Belém", vinculo: "Contratado", modalidade: "Quilombola", status: "Crítico" },
  { nome: "Igor Pacheco", cpf: "***.456.123-**", municipio: "Bragança", vinculo: "Efetivo", modalidade: "Ensino Médio", status: "Adequado" },
  { nome: "Juliana Mendes", cpf: "***.654.321-**", municipio: "Parauapebas", vinculo: "Duplo Vínculo", modalidade: "EJA", status: "Crítico" },
  { nome: "Kauã Nogueira", cpf: "***.321.654-**", municipio: "Tucuruí", vinculo: "Efetivo", modalidade: "Técnico", status: "Adequado" },
  { nome: "Larissa Pinto", cpf: "***.852.741-**", municipio: "Belém", vinculo: "Contratado", modalidade: "Ensino Médio", status: "Pendente" },
  { nome: "Marcos Aurélio", cpf: "***.963.852-**", municipio: "Abaetetuba", vinculo: "Efetivo", modalidade: "Profissionalizante", status: "Adequado" },
];

export const filtros = {
  ri: ["Todas RIs", "RI 1", "RI 2", "RI 3", "RI 4", "RI 5"],
  municipio: ["Todos", "Belém", "Ananindeua", "Marabá", "Santarém", "Castanhal"],
  regiao: ["Todas", "Metropolitana", "Interior"],
  atividade: ["Todas", "Docência", "Gestão", "Apoio"],
  vinculo: ["Todos", "Efetivo", "Contratado", "Cedido", "Duplo Vínculo"],
  modalidade: ["Todas", "Ensino Médio", "EJA", "Técnico", "Profissionalizante", "Indígena", "Quilombola"],
};
