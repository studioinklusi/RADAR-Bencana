import React, { useState } from 'react';
import { X, Copy, Check, Download, FileCode, Server, Map, Sparkles, Terminal } from 'lucide-react';
import { PythonCodeTab } from '../types';

interface CodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeViewerModal: React.FC<CodeViewerModalProps> = ({ isOpen, onClose }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);

  if (!isOpen) return null;

  const codeTabs: PythonCodeTab[] = [
    {
      filename: 'gee_service.py',
      language: 'python',
      description: 'Module Python GEE untuk inisialisasi Service Account, clipping raster .tif hazard, dan kalkulasi zonal statistics dengan reduceRegion.',
      code: `"""
Google Earth Engine (GEE) Service Module for Disaster Hazard Mapping
Handles GEE initialization, Image asset loading, geometry clipping, and zonal statistics via reduceRegion.
"""

import os
import json
import logging
from typing import Optional, Dict, Any

try:
    import ee
    GEE_AVAILABLE = True
except ImportError:
    GEE_AVAILABLE = False

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("GEEService")


class GEEDisasterService:
    def __init__(self, service_account: Optional[str] = None, key_file: Optional[str] = None):
        self.initialized = False
        self._init_gee(service_account, key_file)

    def _init_gee(self, service_account: Optional[str], key_file: Optional[str]):
        """Initialize Google Earth Engine API using Service Account or default credentials."""
        if not GEE_AVAILABLE:
            logger.warning("Google Earth Engine ('ee') Python library is not installed.")
            return

        try:
            if service_account and key_file and os.path.exists(key_file):
                logger.info(f"Initializing GEE with Service Account: {service_account}")
                credentials = ee.ServiceAccountCredentials(service_account, key_file)
                ee.Initialize(credentials)
            else:
                logger.info("Initializing GEE with default application credentials / project...")
                ee.Initialize(project=os.getenv("GEE_PROJECT_ID", "ee-disaster-hazard-mapping"))
            self.initialized = True
            logger.info("GEE successfully initialized.")
        except Exception as e:
            logger.error(f"Failed to initialize GEE: {str(e)}")
            self.initialized = False

    def get_hazard_image(self, hazard_type: str = "flood") -> Any:
        """
        Loads a hazard raster dataset from GEE Assets or standard datasets.
        In production, replace asset IDs with your custom .tif Asset paths.
        """
        if hazard_type == "flood":
            water = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").select("occurrence")
            dem = ee.Image("USGS/SRTMGL1_003")
            hazard = ee.Image(0) \\
                .where(water.gt(20).And(dem.lt(100)), 1) \\
                .where(water.gt(50).And(dem.lt(50)), 2) \\
                .where(water.gt(80).And(dem.lt(20)), 3)
            return hazard.rename("hazard_class")
        else:
            asset_path = f"projects/gee-disaster-mapping/assets/{hazard_type}_raster"
            return ee.Image(asset_path).select(0).rename("hazard_class")

    def get_map_tile_url(self, hazard_type: str, geometry_geojson: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Clips the hazard image to administrative geometry (if provided) and gets map tile URL (MapID).
        """
        image = self.get_hazard_image(hazard_type)

        if geometry_geojson:
            ee_geometry = ee.Geometry(geometry_geojson)
            image = image.clip(ee_geometry)

        vis_params = {
            "min": 0,
            "max": 3,
            "palette": ["93c5fd", "3b82f6", "1d4ed8", "1e1b4b"]
        }

        map_id_dict = image.getMapId(vis_params)
        return {
            "tile_url": map_id_dict["tile_fetcher"].url_format,
            "mapid": map_id_dict["mapid"]
        }

    def compute_zonal_statistics(self, hazard_type: str, geometry_geojson: Dict[str, Any]) -> Dict[str, Any]:
        """
        Computes zonal area statistics (in hectares) for high, medium, and low risk classes.
        """
        if not self.initialized:
            raise RuntimeError("GEE is not initialized.")

        image = self.get_hazard_image(hazard_type)
        ee_geometry = ee.Geometry(geometry_geojson)

        # Pixel area image in square meters
        pixel_area = ee.Image.pixelArea()

        # Mask for each hazard class
        high_mask = image.eq(3).multiply(pixel_area)
        med_mask = image.eq(2).multiply(pixel_area)
        low_mask = image.eq(1).multiply(pixel_area)

        combined = ee.Image.cat([high_mask, med_mask, low_mask]).rename(["high_m2", "med_m2", "low_m2"])

        stats = combined.reduceRegion(
            reducer=ee.Reducer.sum(),
            geometry=ee_geometry,
            scale=30,
            maxPixels=1e9
        ).getInfo()

        high_ha = round((stats.get("high_m2", 0) or 0) / 10000.0, 2)
        med_ha = round((stats.get("med_m2", 0) or 0) / 10000.0, 2)
        low_ha = round((stats.get("low_m2", 0) or 0) / 10000.0, 2)
        total_ha = round(high_ha + med_ha + low_ha, 2)

        high_pct = round((high_ha / total_ha * 100), 1) if total_ha > 0 else 0

        return {
            "totalAreaHa": total_ha,
            "highRiskHa": high_ha,
            "highRiskPct": high_pct,
            "mediumRiskHa": med_ha,
            "mediumRiskPct": round((med_ha / total_ha * 100), 1) if total_ha > 0 else 0,
            "lowRiskHa": low_ha,
            "lowRiskPct": round((low_ha / total_ha * 100), 1) if total_ha > 0 else 0,
            "riskCategory": "Critical" if high_pct > 30 else ("High" if high_pct > 15 else "Moderate")
        }
`,
    },
    {
      filename: 'app.py',
      language: 'python',
      description: 'Flask REST API Server yang menghubungkan Frontend React Leaflet dengan Backend Python GEE dan Gemini AI API.',
      code: `"""
Flask REST API Backend Server for RADAR Bencana Web GIS.
Provides endpoints for tile layers, zonal statistics, and AI risk reports.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from gee_service import GEEDisasterService
import os

app = Flask(__name__)
CORS(app)

gee_service = GEEDisasterService()

@app.route("/api/get-map-layer", methods=["POST"])
def get_map_layer():
    data = request.json or {}
    hazard_type = data.get("hazardType", "flood")
    geometry = data.get("geometry")

    try:
        result = gee_service.get_map_tile_url(hazard_type, geometry)
        return jsonify({"status": "success", "tileUrl": result["tile_url"]})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/api/get-statistics", methods=["POST"])
def get_statistics():
    data = request.json or {}
    hazard_type = data.get("hazardType", "flood")
    geometry = data.get("geometry")

    if not geometry:
        return jsonify({"error": "Geometry payload is required"}), 400

    try:
        stats = gee_service.compute_zonal_statistics(hazard_type, geometry)
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
`,
    },
    {
      filename: 'LeafletGEELayer.ts',
      language: 'typescript',
      description: 'Custom React Leaflet TileLayer integration for GEE tile URLs with dynamic opacity and error fallback.',
      code: `import React from 'react';
import { TileLayer } from 'react-leaflet';

interface LeafletGEELayerProps {
  tileUrl: string | null;
  opacity: number;
}

export const LeafletGEELayer: React.FC<LeafletGEELayerProps> = ({ tileUrl, opacity }) => {
  if (!tileUrl) return null;

  return (
    <TileLayer
      url={tileUrl}
      opacity={opacity}
      maxZoom={19}
      tileSize={256}
      zIndex={400}
    />
  );
};
`,
    },
  ];

  const handleCopyCode = (index: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleDownloadFile = (filename: string, code: string) => {
    const element = document.createElement('a');
    const file = new Blob([code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Terminal className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Python GEE &amp; Backend Code Inspector
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Kode integrasi Google Earth Engine API &amp; Service Layer
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="px-6 pt-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          {codeTabs.map((tab, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 text-xs font-semibold font-mono rounded-t-lg transition-all flex items-center gap-2 border-t border-x cursor-pointer ${
                activeTab === idx
                  ? 'bg-slate-900 text-emerald-400 border-slate-800 border-b-transparent shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{tab.filename}</span>
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 font-mono text-xs">
          <div className="mb-4 p-3 bg-slate-900 border border-slate-800 rounded-lg flex items-center justify-between text-slate-300">
            <span className="text-xs text-slate-400">{codeTabs[activeTab].description}</span>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleCopyCode(activeTab, codeTabs[activeTab].code)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              >
                {copiedIndex === activeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>
              <button
                onClick={() => handleDownloadFile(codeTabs[activeTab].filename, codeTabs[activeTab].code)}
                className="px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 rounded text-xs flex items-center gap-1.5 transition-colors border border-emerald-800 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh File</span>
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-900/90 rounded-xl border border-slate-800/80 text-emerald-300/90 overflow-x-auto leading-relaxed selection:bg-emerald-900 selection:text-emerald-100">
            <code>{codeTabs[activeTab].code}</code>
          </pre>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
          >
            Tutup Code Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
