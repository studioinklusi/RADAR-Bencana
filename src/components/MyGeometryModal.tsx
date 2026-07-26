import React, { useState } from 'react';
import { X, Upload, FileJson, Check, AlertCircle, MapPin } from 'lucide-react';
import { AdminFeature } from '../types';

interface MyGeometryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomGeometry: (customFeature: AdminFeature) => void;
}

export const MyGeometryModal: React.FC<MyGeometryModalProps> = ({
  isOpen,
  onClose,
  onApplyCustomGeometry,
}) => {
  const [jsonText, setJsonText] = useState('');
  const [areaName, setAreaName] = useState('Custom Boundary Zone');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        JSON.parse(text); // validate JSON
        setJsonText(text);
        setErrorMsg(null);
      } catch (err) {
        setErrorMsg('File JSON tidak valid. Pastikan format GeoJSON Polygon.');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = () => {
    try {
      if (!jsonText.trim()) {
        setErrorMsg('Masukkan teks GeoJSON atau unggah file terlebih dahulu.');
        return;
      }

      const parsed = JSON.parse(jsonText);
      let geometry = parsed;

      if (parsed.type === 'Feature') {
        geometry = parsed.geometry;
      } else if (parsed.type === 'FeatureCollection') {
        geometry = parsed.features[0].geometry;
      }

      const customFeature: AdminFeature = {
        type: 'Feature',
        id: `CUSTOM-${Date.now()}`,
        properties: {
          id: `CUSTOM-${Date.now()}`,
          code: 'CUSTOM-AOI',
          name: areaName || 'Custom AOI Geometry',
          type: 'Custom Area of Interest',
          province: 'Jawa Tengah',
          population: 45000,
          area_km2: 120.5,
          total_area_ha: 12050,
          density_per_km2: 373,
          hospital_count: 2,
          school_count: 12,
          bridge_count: 5,
          primary_vulnerability: 'Custom GeoJSON Clip Area',
        },
        geometry,
      };

      onApplyCustomGeometry(customFeature);
      onClose();
    } catch (err: any) {
      setErrorMsg(`Format GeoJSON error: ${err.message}`);
    }
  };

  // Sample GeoJSON Polygon template button
  const handleLoadSample = () => {
    const sampleGeoJson = {
      type: 'Polygon',
      coordinates: [
        [
          [107.50, -6.80],
          [107.70, -6.80],
          [107.68, -6.98],
          [107.48, -6.95],
          [107.50, -6.80]
        ]
      ]
    };
    setJsonText(JSON.stringify(sampleGeoJson, null, 2));
    setAreaName('Area DAS Citarum Hulu (Custom AOI)');
    setErrorMsg(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Upload className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Geometri Saya (Custom GeoJSON Clip)</h3>
              <p className="text-xs text-slate-500 font-mono">Unggah atau tempel polygon GeoJSON untuk clipping GEE</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 font-semibold mb-1">Nama Area / AOI Custom</label>
            <input
              type="text"
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              placeholder="Contoh: DAS Citarum Hulu / Zone A"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-700 font-semibold">Teks GeoJSON (Polygon / MultiPolygon)</label>
              <button
                onClick={handleLoadSample}
                className="text-[11px] text-emerald-700 hover:underline font-mono font-bold cursor-pointer"
              >
                + Muat Contoh GeoJSON DAS
              </button>
            </div>
            <textarea
              rows={6}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='{"type": "Polygon", "coordinates": [[[107.5, -6.8], [107.7, -6.8], ...]]}'
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-emerald-800 font-mono text-[11px] focus:outline-none focus:border-emerald-500 leading-relaxed shadow-inner"
            />
          </div>

          {/* Upload Button */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2 text-slate-700">
              <FileJson className="w-4 h-4 text-emerald-600" />
              <span>Atau unggah file .geojson / .json</span>
            </div>
            <label className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold cursor-pointer border border-slate-200 transition-colors shadow-xs">
              Pilih File
              <input
                type="file"
                accept=".geojson,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors text-xs font-semibold cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Terapkan Clipping GEE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
