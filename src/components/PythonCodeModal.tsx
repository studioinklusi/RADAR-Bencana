import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode2, ExternalLink } from 'lucide-react';

interface PythonCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'id' | 'en';
}

export const PythonCodeModal: React.FC<PythonCodeModalProps> = ({
  isOpen,
  onClose,
  lang
}) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeCodeTab, setActiveCodeTab] = useState<'fastapi' | 'gee' | 'requirements'>('fastapi');

  if (!isOpen) return null;

  const fastapiCode = `"""
FastAPI + Google Earth Engine (GEE) Disaster Hazard Mapping Backend
Step 1: Backend Development
"""

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
import ee
import os

app = FastAPI(
    title="GEE Web GIS Disaster Hazard Mapping API",
    description="Backend service for raster visualization, polygon clipping, and reduceRegion zonal statistics.",
    version="1.0.0"
)

# 1. Initialize Google Earth Engine Service Account
try:
    # Use Service Account JSON or High-Volume Cloud Project Credentials
    service_account = os.getenv("GEE_SERVICE_ACCOUNT")
    key_file = os.getenv("GEE_KEY_FILE")
    
    if service_account and key_file and os.path.exists(key_file):
        credentials = ee.ServiceAccountCredentials(service_account, key_file)
        ee.Initialize(credentials)
    else:
        ee.Initialize(project=os.getenv("GEE_PROJECT_ID", "ee-disaster-hazard-mapping"))
    print("Google Earth Engine initialized successfully.")
except Exception as e:
    print(f"GEE Initialization Warning: {str(e)}")


class MapLayerRequest(BaseModel):
    hazard_type: str = "flood" # 'flood', 'landslide', 'wildfire'
    geometry: Optional[Dict[str, Any]] = None # GeoJSON polygon from clicked administrative area

class StatisticsRequest(BaseModel):
    hazard_type: str = "flood"
    geometry: Dict[str, Any] # GeoJSON polygon
    scale_meters: int = 30


@app.post("/get-map-layer")
def get_map_layer(req: MapLayerRequest):
    """
    Loads hazard raster image (e.g., .tif asset in GEE),
    clips to administrative boundary if provided, and returns map tile URL (MapID).
    """
    try:
        # Load Hazard Image Asset (replace with your custom .tif asset ID)
        if req.hazard_type == "flood":
            # Example: 100-Year Flood Inundation Depth Model
            image = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").select("occurrence")
            dem = ee.Image("USGS/SRTMGL1_003")
            # Classify into 4 hazard levels (0=Low, 1=Medium, 2=High, 3=Extreme)
            hazard_image = ee.Image(0)\\
                .where(image.gt(20).And(dem.lt(100)), 1)\\
                .where(image.gt(50).And(dem.lt(50)), 2)\\
                .where(image.gt(80).And(dem.lt(20)), 3)
        else:
            # Custom Asset Fallback
            asset_path = f"projects/gee-disaster-mapping/assets/{req.hazard_type}_raster"
            hazard_image = ee.Image(asset_path).select(0)

        # Dynamic Clipping to Administrative Polygon
        if req.geometry:
            ee_geom = ee.Geometry(req.geometry)
            hazard_image = hazard_image.clip(ee_geom)

        # Apply Color Palette for Hazard Levels
        vis_params = {
            "min": 0,
            "max": 3,
            "palette": ["93c5fd", "3b82f6", "1d4ed8", "1e1b4b"] # Low to Extreme Blue
        }

        map_id_dict = hazard_image.getMapId(vis_params)

        return {
            "success": True,
            "tile_url": map_id_dict["tile_fetcher"].url_format,
            "mapid": map_id_dict["mapid"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/get-statistics")
def get_statistics(req: StatisticsRequest):
    """
    Computes zonal statistics (area in Hectares per hazard class) using GEE reduceRegion.
    """
    try:
        ee_geom = ee.Geometry(req.geometry)
        
        # Pixel area in m2
        pixel_area = ee.Image.pixelArea()
        
        # Load Hazard Image
        hazard_image = ee.Image("JRC/GSW1_4/GlobalSurfaceWater").select("occurrence")
        
        # Create masks for each class
        high_risk = hazard_image.gt(80).multiply(pixel_area)
        med_risk = hazard_image.gt(40).And(hazard_image.lte(80)).multiply(pixel_area)
        low_risk = hazard_image.gt(0).And(hazard_image.lte(40)).multiply(pixel_area)
        
        area_stats = ee.Image.cat([high_risk, med_risk, low_risk])\\
            .rename(["high_m2", "med_m2", "low_m2"])\\
            .reduceRegion(
                reducer=ee.Reducer.sum(),
                geometry=ee_geom,
                scale=req.scale_meters,
                maxPixels=1e9
            ).getInfo()
            
        high_ha = round((area_stats.get("high_m2", 0) or 0) / 10000.0, 2)
        med_ha = round((area_stats.get("med_m2", 0) or 0) / 10000.0, 2)
        low_ha = round((area_stats.get("low_m2", 0) or 0) / 10000.0, 2)
        total_ha = round(high_ha + med_ha + low_ha, 2)
        
        return {
            "totalAreaHa": total_ha,
            "highRiskHa": high_ha,
            "highRiskPct": round((high_ha / total_ha * 100), 1) if total_ha > 0 else 0,
            "mediumRiskHa": med_ha,
            "mediumRiskPct": round((med_ha / total_ha * 100), 1) if total_ha > 0 else 0,
            "lowRiskHa": low_ha,
            "lowRiskPct": round((low_ha / total_ha * 100), 1) if total_ha > 0 else 0,
            "riskCategory": "Critical" if high_ha > 500 else "High"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
`;

  const requirementsTxt = `fastapi==0.110.0
uvicorn==0.28.0
earthengine-api==0.1.395
pydantic==2.6.4
requests==2.31.0
python-dotenv==1.0.1
gunicorn==21.2.0
`;

  const copyToClipboard = (text: string, tabName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(tabName);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Terminal className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {lang === 'id' ? 'Kode Backend Python GEE' : 'Python GEE Backend Code'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">FastAPI, GEE API Python Client &amp; reduceRegion Zonal Stats</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Tabs */}
        <div className="flex items-center justify-between px-5 py-2 bg-slate-50 border-b border-slate-200 text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveCodeTab('fastapi')}
              className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition cursor-pointer ${
                activeCodeTab === 'fastapi' ? 'bg-white text-emerald-800 border border-slate-200 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileCode2 className="w-4 h-4 text-emerald-600" />
              <span>main.py (FastAPI + GEE)</span>
            </button>

            <button
              onClick={() => setActiveCodeTab('requirements')}
              className={`px-3 py-1.5 rounded-md flex items-center space-x-1.5 transition cursor-pointer ${
                activeCodeTab === 'requirements' ? 'bg-white text-emerald-800 border border-slate-200 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Terminal className="w-4 h-4 text-amber-600" />
              <span>requirements.txt</span>
            </button>
          </div>

          <button
            onClick={() => copyToClipboard(activeCodeTab === 'fastapi' ? fastapiCode : requirementsTxt, activeCodeTab)}
            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-md text-xs font-semibold flex items-center space-x-1.5 transition border border-slate-200 cursor-pointer shadow-xs"
          >
            {copiedTab === activeCodeTab ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>{lang === 'id' ? 'Tersalin!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>{lang === 'id' ? 'Salin Kode' : 'Copy Code'}</span>
              </>
            )}
          </button>
        </div>

        {/* Code Block */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-950 font-mono text-xs text-emerald-300 selection:bg-emerald-900">
          <pre className="whitespace-pre-wrap leading-relaxed">
            {activeCodeTab === 'fastapi' ? fastapiCode : requirementsTxt}
          </pre>
        </div>
      </div>
    </div>
  );
};
