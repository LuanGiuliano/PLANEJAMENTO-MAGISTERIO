import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Tooltip } from 'react-leaflet';
import centroid from '@turf/centroid';
import { fetchGeoJsonPara, fetchMunicipiosPara, normalizeCityName } from '@/lib/geoService';

import 'leaflet/dist/leaflet.css';

interface MapaDispersaoProps {
  data: any[];
}

export function MapaDispersao({ data = [] }: MapaDispersaoProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [mapMunicipios, setMapMunicipios] = useState<Record<string, string>>({});
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const loadGeoData = async () => {
      const geoJson = await fetchGeoJsonPara();
      const municipios = await fetchMunicipiosPara();
      setGeoData(geoJson);
      setMapMunicipios(municipios);
    };
    loadGeoData();
  }, []);

  const markers = useMemo(() => {
    if (!geoData || !geoData.features || !data || Object.keys(mapMunicipios).length === 0) return [];

    const computedMarkers: any[] = [];
    const dataByCity: Record<string, any> = {};
    data.forEach(d => {
      dataByCity[normalizeCityName(d.municipio)] = d;
    });

    geoData.features.forEach((feat: any) => {
      const ibgeId = feat.properties.codarea;
      const cityName = mapMunicipios[ibgeId];
      if (!cityName) return;

      const cityData = dataByCity[cityName] || dataByCity[normalizeCityName(cityName)];
      
      if (cityData && cityData.totalDocentes > 0) {
        const c = centroid(feat);
        const [lng, lat] = c.geometry.coordinates;

        let radius = Math.sqrt(cityData.totalDocentes) * 0.8;
        if (radius < 4) radius = 4;
        if (radius > 40) radius = 40;
        
        const riscoRatio = cityData.riscoLogistico / cityData.totalDocentes;
        const color = riscoRatio > 0.2 ? '#C62828' : '#008F72';

        computedMarkers.push({
          id: ibgeId,
          name: cityName,
          lat,
          lng,
          radius,
          color,
          data: cityData
        });
      }
    });

    return computedMarkers;
  }, [geoData, data, mapMunicipios]);

  if (!geoData) {
    return (
      <div className="bg-[#132F4C] border border-white/5 rounded-xl p-6 h-[500px] flex items-center justify-center w-full">
        <div className="text-slate-400 font-medium text-sm animate-pulse">Carregando Malha Geográfica do Pará (IBGE)...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#132F4C] border border-white/5 rounded-xl overflow-hidden relative shadow-sm h-[500px] w-full">
      <div className="absolute top-4 left-4 z-[400] pointer-events-none">
        <h3 className="text-sm font-bold text-[#F5F7FA] uppercase tracking-wide bg-[#102A43]/80 px-3 py-1.5 rounded border border-white/5 backdrop-blur-sm">Distribuição Geográfica (Concentração)</h3>
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-1 bg-[#102A43]/80 px-3 py-1 rounded inline-block border border-white/5 backdrop-blur-sm">Zonas de Dispersão Logística</p>
      </div>
      
      <style>{`
        .leaflet-container {
          height: 100%;
          width: 100%;
          z-index: 1;
          background-color: #081C2E !important;
        }
        .leaflet-tooltip {
          background: #102A43 !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 6px !important;
          color: #F5F7FA !important;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
        }
        .leaflet-tooltip-top:before { border-top-color: #102A43 !important; }
        .leaflet-tooltip-bottom:before { border-bottom-color: #102A43 !important; }
        .leaflet-tooltip-left:before { border-left-color: #102A43 !important; }
        .leaflet-tooltip-right:before { border-right-color: #102A43 !important; }
      `}</style>
      
      <MapContainer 
        center={[-4.0, -52.5]} 
        zoom={5} 
        style={{ height: '500px', width: '100%', minHeight: '500px', zIndex: 1 }}
        scrollWheelZoom={false}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        <GeoJSON 
          data={geoData} 
          style={{
            fillColor: "#102A43",
            fillOpacity: 0.2,
            color: "rgba(255,255,255,0.1)",
            weight: 1
          }} 
        />

        {markers.map((marker, i) => (
          <CircleMarker
            key={i}
            center={[marker.lat, marker.lng]}
            radius={marker.radius}
            pathOptions={{
              color: marker.color,
              fillColor: marker.color,
              fillOpacity: 0.6,
              weight: 1
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
              <div className="flex flex-col gap-1 min-w-[140px]">
                <span className="text-[10px] font-bold text-[#F4A300] uppercase tracking-widest border-b border-white/10 pb-1 mb-1">{marker.name}</span>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Total Docentes:</span>
                  <span className="text-xs font-bold text-white">{marker.data.totalDocentes.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Risco Logístico:</span>
                  <span className="text-xs font-bold text-[#C62828]">{marker.data.riscoLogistico.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Meta (1 Esc.):</span>
                  <span className="text-xs font-bold text-[#008F72]">{marker.data.pct1Escola}%</span>
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
