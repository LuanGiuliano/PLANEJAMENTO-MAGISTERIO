// Serviço para buscar dados geográficos do IBGE

export const normalizeCityName = (name: string): string => {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/'/g, ''); // Remove apóstrofos que podem causar problemas (ex: PAU D'ARCO)
};

export const fetchGeoJsonPara = async () => {
  try {
    // Código do estado do Pará é 15. Usamos intrarregiao=municipio para pegar todas as subdivisões
    const response = await fetch('https://servicodados.ibge.gov.br/api/v3/malhas/estados/PA?formato=application/vnd.geo+json&intrarregiao=municipio');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar a malha geográfica do Pará:", error);
    return null;
  }
};

export const fetchMunicipiosPara = async () => {
  try {
    // Busca a lista de municípios com seus nomes oficiais para cruzar com a malha
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/15/municipios');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Cria um dicionário para busca rápida: { "id_municipio": "NOME NORMALIZADO" }
    const mapMunicipios: Record<string, string> = {};
    data.forEach((mun: any) => {
      mapMunicipios[mun.id] = normalizeCityName(mun.nome);
    });
    
    return mapMunicipios;
  } catch (error) {
    console.error("Erro ao buscar lista de municípios do Pará:", error);
    return {};
  }
};
