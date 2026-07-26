import React, { useState } from 'react';
import { X, UploadCloud, Check, FileJson, AlertCircle } from 'lucide-react';
import { AdminFeature } from '../types';

interface CustomGeoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomGeometry: (customFeature: AdminFeature) => void;
  lang: 'id' | 'en';
}

export const CustomGeoModal: React.FC<CustomGeoModalProps> = ({
  isOpen,
  onClose,
  onApplyCustomGeometry,
  lang
}) => {
  const [geoJsonInput, setGeoJsonInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParseGeoJson = () => {
    setErrorMsg(null);
    try {
      const parsed = JSON.parse(geoJsonInput);
      let feature: any = null;

      if (parsed.type === 'FeatureCollection' && parsed.features?.length > 0) {
        feature = parsed.features[0];
      } else if (parsed.type === 'Feature') {
        feature = parsed;
      } else if (parsed.type === 'Polygon' || parsed.type === 'MultiPolygon') {
        feature = {
          type: 'Feature',
          id: `CUSTOM-${Date.now()}`,
          properties: {
            id: `CUSTOM-${Date.now()}`,
            name: 'Kustom Poligon Area',
            province: 'Kustom Upload',
            type: 'Custom GeoJSON',
            population: 50000,
            hospital_count: 2,
            school_count: 10,
            bridge_count: 4,
            primary_vulnerability: 'Kustom Area Analisis'
          },
          geometry: parsed
        };
      }

      if (!feature || !feature.geometry) {
        throw new Error('GeoJSON tidak valid. Pastikan tipe Feature atau FeatureCollection.');
      }

      const customAdminFeature: AdminFeature = {
        type: 'Feature',
        id: feature.id || `CUSTOM-${Date.now()}`,
        properties: {
          id: feature.id || `CUSTOM-${Date.now()}`,
          code: 'CUSTOM',
          name: feature.properties?.name || 'Kustom Poligon Area',
          type: 'Custom Geometry',
          province: 'Jawa Tengah',
          population: feature.properties?.population || 120000,
          area_km2: 150,
          total_area_ha: 15000,
          density_per_km2: 800,
          hospital_count: 3,
          school_count: 15,
          bridge_count: 5,
          primary_vulnerability: 'Wilayah Kustom Upload',
        },
        geometry: feature.geometry
      };

      onApplyCustomGeometry(customAdminFeature);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'GeoJSON Syntax Error');
    }
  };

  const sampleGeoJson = `{
  "type": "Feature",
  "properties": {
    "name": "Area Waduk Jatigede Sumedang"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": [
      [
        [108.05, -6.80],
        [108.20, -6.80],
        [108.20, -6.95],
        [108.05, -6.95],
        [108.05, -6.80]
      ]
    ]
  }
}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-xl overflow-hidden text-slate-800">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <UploadCloud className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {lang === 'id' ? 'Upload Geometri Saya (GeoJSON)' : 'Upload My Geometry (GeoJSON)'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-xs text-slate-500 space-y-1">
            <p>{lang === 'id' ? 'Tempelkan string GeoJSON Polygon atau FeatureCollection di bawah ini:' : 'Paste your GeoJSON Polygon or FeatureCollection string below:'}</p>
            <button 
              onClick={() => setGeoJsonInput(sampleGeoJson)} 
              className="text-emerald-700 underline font-mono font-bold text-[11px] hover:text-emerald-800 cursor-pointer"
            >
              {lang === 'id' ? '+ Gunakan contoh GeoJSON Jatigede' : '+ Use sample Jatigede GeoJSON'}
            </button>
          </div>

          <textarea
            value={geoJsonInput}
            onChange={(e) => setGeoJsonInput(e.target.value)}
            placeholder={sampleGeoJson}
            rows={8}
            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-mono text-emerald-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition shadow-inner"
          />

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer shadow-xs"
            >
              {lang === 'id' ? 'Batal' : 'Cancel'}
            </button>
            <button
              onClick={handleParseGeoJson}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'id' ? 'Terapkan pada Peta' : 'Apply to Map'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
