import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Maximize2, 
  Minimize2, 
  Layers, 
  Compass, 
  Grid, 
  RotateCcw, 
  Box, 
  ChevronDown, 
  Share2, 
  Sliders, 
  Info,
  Calendar,
  Layers3
} from 'lucide-react';
import { AdminFeature, HazardType } from '../types';
import { ADMIN_BOUNDARIES } from '../data/mockAdminBoundaries';
import { HAZARD_LAYERS } from '../data/hazardLayers';

interface MapViewProps {
  selectedDistrict: AdminFeature | null;
  selectedVillage?: string | null;
  onSelectDistrict: (district: AdminFeature | null) => void;
  activeHazard: HazardType;
  hazardRenderMode?: 'class' | 'index';
  selectedYear: number;
  onChangeYear: (year: number) => void;
  lang: 'id' | 'en';
}

export const MapView: React.FC<MapViewProps> = ({
  selectedDistrict,
  selectedVillage,
  onSelectDistrict,
  activeHazard,
  hazardRenderMode = 'class',
  selectedYear,
  onChangeYear,
  lang
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);

  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number }>({ lat: -6.814820, lng: 107.608514 });
  const [isLegendExpanded, setIsLegendExpanded] = useState(true);
  const [is3DActive, setIs3DActive] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Dark Map Base
    const map = L.map(mapContainerRef.current, {
      center: [-7.395, 109.695],
      zoom: 11,
      zoomControl: false,
      attributionControl: false
    });

    // Light Tile Layer (CartoDB Positron style)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Zoom control on right bottom
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Track mouse movement for lat/lon indicator
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setMouseCoords({
        lat: Number(e.latlng.lat.toFixed(6)),
        lng: Number(e.latlng.lng.toFixed(6))
      });
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Handle Admin GeoJSON Boundaries & Dynamic Clipped Raster Painting
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing GeoJSON
    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }

    // Add Administrative Polygons
    const geoLayer = L.geoJSON(ADMIN_BOUNDARIES as any, {
      style: (feature) => {
        const isSelected = selectedDistrict?.id === feature?.id;
        return {
          color: isSelected ? '#059669' : '#64748b',
          weight: isSelected ? 3.5 : 1.2,
          opacity: isSelected ? 1 : 0.65,
          fillColor: isSelected ? '#10b981' : '#ffffff',
          fillOpacity: isSelected ? 0.08 : 0.02,
          dashArray: isSelected ? '' : '3,3'
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        layer.bindTooltip(
          `<div class="font-bold text-xs text-slate-800">${props.name}</div><div class="text-[10px] text-slate-500">${props.province}</div>`,
          { permanent: false, direction: 'top', className: 'leaflet-popup-content-wrapper' }
        );

        layer.on({
          click: () => {
            onSelectDistrict(feature as any);
            // Fit bounds to clicked feature
            if ('getBounds' in layer && typeof (layer as any).getBounds === 'function') {
              map.fitBounds((layer as any).getBounds(), { padding: [50, 50], maxZoom: 11 });
            }
          },
          mouseover: (e) => {
            const l = e.target;
            if (selectedDistrict?.id !== feature.id) {
              l.setStyle({
                color: '#0284c7',
                weight: 2,
                fillOpacity: 0.15
              });
            }
          },
          mouseout: (e) => {
            if (selectedDistrict?.id !== feature.id) {
              geoLayer.resetStyle(e.target);
            }
          }
        });
      }
    }).addTo(map);

    geoJsonLayerRef.current = geoLayer;

    // Draw Clipped Raster Canvas onto the map viewport
    drawClippedRasterCanvas(map, selectedDistrict, activeHazard);

  }, [selectedDistrict, activeHazard]);

  // Canvas raster clipping renderer
  const drawClippedRasterCanvas = (map: L.Map, district: AdminFeature | null, hazard: HazardType) => {
    // Remove previous canvas layer
    const existingCanvas = document.getElementById('gee-clipped-raster-canvas');
    if (existingCanvas) {
      existingCanvas.remove();
    }

    const canvas = document.createElement('canvas');
    canvas.id = 'gee-clipped-raster-canvas';
    canvas.className = 'pointer-events-none absolute inset-0 z-[15] opacity-85';
    
    const size = map.getSize();
    canvas.width = size.x;
    canvas.height = size.y;

    const mapPane = map.getPanes().overlayPane;
    mapPane.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Target features to clip: either single selected district or all
    const featuresToDraw = district 
      ? [district] 
      : ADMIN_BOUNDARIES.features;

    const currentLayerConfig = HAZARD_LAYERS[hazard];
    const colors = [
      currentLayerConfig.colorPalette.low,
      currentLayerConfig.colorPalette.medium,
      currentLayerConfig.colorPalette.high,
    ];

    featuresToDraw.forEach((feat) => {
      if (!feat.geometry || !feat.geometry.coordinates) return;

      const coordsRing = feat.geometry.coordinates[0];
      if (!coordsRing) return;

      // Convert GeoJSON lat/lng to Leaflet screen points
      const screenPoints: L.Point[] = coordsRing.map((pt: number[]) => {
        const latLng = L.latLng(pt[1], pt[0]);
        return map.latLngToContainerPoint(latLng);
      });

      if (screenPoints.length < 3) return;

      // Clip Canvas Path to polygon shape
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
      for (let i = 1; i < screenPoints.length; i++) {
        ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
      }
      ctx.closePath();
      ctx.clip(); // <--- Dynamic Clipping directly in viewport canvas!

      // Fill clipped area with simulated GEE raster pixel matrix
      const minX = Math.min(...screenPoints.map(p => p.x));
      const maxX = Math.max(...screenPoints.map(p => p.x));
      const minY = Math.min(...screenPoints.map(p => p.y));
      const maxY = Math.max(...screenPoints.map(p => p.y));

      const step = 8; // Pixel size in screen coordinates
      for (let x = minX; x < maxX; x += step) {
        for (let y = minY; y < maxY; y += step) {
          // Pseudorandom index 0.0 to 1.0 based on coordinates
          const hash = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453);
          const indexVal = hash - Math.floor(hash);

          if (hazardRenderMode === 'class') {
            let colorIdx = 0;
            if (indexVal > 0.6) colorIdx = 2; // High (Merah)
            else if (indexVal > 0.3) colorIdx = 1; // Medium (Kuning)
            ctx.fillStyle = colors[colorIdx];
          } else {
            let rG: number, gG: number, bG: number;
            if (indexVal <= 0.5) {
              const t = indexVal / 0.5;
              rG = Math.round(16 + t * (245 - 16));
              gG = Math.round(185 + t * (158 - 185));
              bG = Math.round(129 + t * (11 - 129));
            } else {
              const t = (indexVal - 0.5) / 0.5;
              rG = Math.round(245 + t * (244 - 245));
              gG = Math.round(158 + t * (63 - 158));
              bG = Math.round(11 + t * (94 - 11));
            }
            ctx.fillStyle = `rgb(${rG}, ${gG}, ${bG})`;
          }
          ctx.fillRect(x, y, step, step);
        }
      }

      // Draw subtle grid lines over clipped raster
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 0.5;
      for (let x = minX; x < maxX; x += step * 3) {
        ctx.beginPath();
        ctx.moveTo(x, minY);
        ctx.lineTo(x, maxY);
        ctx.stroke();
      }

      ctx.restore();
    });
  };

  const handleResetView = () => {
    onSelectDistrict(null);
    if (mapRef.current) {
      mapRef.current.setView([-6.85, 107.6], 9);
    }
  };

  const activeLayerConfig = HAZARD_LAYERS[activeHazard];

  return (
    <div className="relative flex-1 h-[calc(100vh-3.5rem)] bg-slate-50 overflow-hidden select-none">
      {/* Leaflet Map Canvas Target */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Breadcrumb Bar at Map Top Left */}
      <div className="absolute top-3 left-4 z-20 flex items-center space-x-1.5 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 shadow-sm">
        <button onClick={handleResetView} title="Reset View" className="inline-flex items-center">
          <RotateCcw className="w-3.5 h-3.5 text-slate-500 hover:text-emerald-600 cursor-pointer mr-1 transition-colors" />
        </button>
        <span className="hover:text-emerald-700 cursor-pointer font-medium" onClick={handleResetView}>Kab. Banjarnegara</span>
        <span className="text-slate-400">/</span>
        <span className="hover:text-emerald-700 cursor-pointer" onClick={handleResetView}>
          {selectedDistrict ? selectedDistrict.properties.name : 'Semua Kecamatan'}
        </span>
        <span className="text-slate-400">/</span>
        <span className="text-emerald-700 font-semibold">
          {selectedVillage ? selectedVillage : (selectedDistrict ? 'Semua Desa' : 'Seluruh Desa')}
        </span>
      </div>

      {/* Floating Legend Box (MapBiomas style top-left) */}
      <div className="absolute top-12 left-4 z-20 w-64 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl shadow-lg overflow-hidden text-xs text-slate-800 transition">
        <div 
          onClick={() => setIsLegendExpanded(!isLegendExpanded)}
          className="p-2.5 bg-slate-50 flex items-center justify-between cursor-pointer border-b border-slate-200"
        >
          <div className="flex items-center space-x-2 font-bold text-slate-800">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>{lang === 'id' ? 'Legenda Raster' : 'Raster Legend'}</span>
          </div>
          <button className="text-slate-400 hover:text-slate-700">
            {isLegendExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {isLegendExpanded && (
          <div className="p-3 space-y-2">
            <div className="font-bold text-emerald-700 text-[11px]">
              {activeLayerConfig.name}
            </div>
            <div className="text-[10px] text-slate-500">
              {activeLayerConfig.description}
            </div>

            {/* Legend Color Gradients */}
            {hazardRenderMode === 'class' ? (
              <div className="grid grid-cols-3 gap-1 text-[10px] text-center font-medium pt-1">
                <div className="p-1 rounded text-slate-900 font-bold" style={{ backgroundColor: activeLayerConfig.colorPalette.low }}>
                  1 - Rendah
                </div>
                <div className="p-1 rounded text-slate-900 font-bold" style={{ backgroundColor: activeLayerConfig.colorPalette.medium }}>
                  2 - Sedang
                </div>
                <div className="p-1 rounded text-white font-bold" style={{ backgroundColor: activeLayerConfig.colorPalette.high }}>
                  3 - Tinggi
                </div>
              </div>
            ) : (
              <div className="space-y-1 pt-1">
                <div className="h-3.5 rounded bg-gradient-to-r from-[#10b981] via-[#f59e0b] to-[#f43f5e] border border-slate-200" />
                <div className="flex justify-between text-[9px] font-mono text-slate-600 font-bold">
                  <span className="text-emerald-700">0.0 (Rendah)</span>
                  <span className="text-amber-700">0.5 (Sedang)</span>
                  <span className="text-rose-700">1.0 (Tinggi)</span>
                </div>
              </div>
            )}

            <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-100">
              <span>{lang === 'id' ? 'Asset GEE:' : 'GEE Asset:'}</span>
              <span className="font-mono text-emerald-700 font-medium truncate max-w-[120px]" title={activeLayerConfig.geeAsset}>
                {activeLayerConfig.geeAsset.split('/').pop()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Top Right Floating Map Tools */}
      <div className="absolute top-3 right-4 z-20 flex items-center space-x-2">
        {/* Group By Dropdown */}
        <div className="bg-white/90 backdrop-blur-md border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 flex items-center space-x-2 shadow-sm">
          <span className="text-slate-500">{lang === 'id' ? 'Kelompokkan berdasar...' : 'Group by...'}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </div>

        {/* Floating Tool Buttons Stack */}
        <div className="flex items-center space-x-1 bg-white/90 backdrop-blur-md border border-slate-200 rounded-lg p-1 shadow-sm">
          <button 
            onClick={() => setIs3DActive(!is3DActive)}
            className={`p-1.5 rounded-md text-xs font-bold transition flex items-center space-x-1 ${
              is3DActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Toggle 3D Terrain Mode"
          >
            <Box className="w-3.5 h-3.5" />
            <span>3D</span>
          </button>
          <button 
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1.5 rounded-md transition ${
              showGrid ? 'text-emerald-700 bg-emerald-50' : 'text-slate-500 hover:text-slate-800'
            }`}
            title="Toggle Coordinates Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
          <button 
            onClick={handleResetView}
            className="p-1.5 text-slate-500 hover:text-slate-800 rounded-md transition"
            title="Reset Map Bounds"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Map Info Bar (Scale & Lat/Lon Coordinates) */}
      <div className="absolute bottom-16 right-16 z-20 bg-white/90 backdrop-blur-md border border-slate-200 rounded-lg px-3 py-1 text-[11px] font-mono text-slate-700 flex items-center space-x-4 shadow-sm">
        <div className="flex items-center space-x-1 text-slate-500">
          <span className="w-8 border-b-2 border-emerald-600 inline-block mr-1"></span>
          <span>50 km</span>
        </div>
        <div className="flex items-center space-x-2 border-l border-slate-200 pl-3">
          <span>lat: <span className="text-emerald-700 font-semibold">{mouseCoords.lat}</span></span>
          <span>lon: <span className="text-emerald-700 font-semibold">{mouseCoords.lng}</span></span>
        </div>
      </div>

      {/* Timeline Slider Bar at Map Bottom */}
      <div className="absolute bottom-3 left-4 right-16 z-20 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-2.5 flex items-center space-x-4 shadow-md text-xs text-slate-800">
        <div className="flex items-center space-x-2 font-bold text-emerald-700 shrink-0">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>{selectedYear}</span>
        </div>

        {/* Slider input */}
        <div className="flex-1 flex items-center space-x-2 relative">
          <input 
            type="range" 
            min="2018" 
            max="2024" 
            step="1"
            value={selectedYear}
            onChange={(e) => onChangeYear(Number(e.target.value))}
            className="w-full custom-slider"
          />
          <div className="flex justify-between w-full absolute -top-5 text-[9px] text-slate-500 font-mono pointer-events-none px-1 font-medium">
            <span>2018</span>
            <span>2019</span>
            <span>2020</span>
            <span>2021</span>
            <span>2022</span>
            <span>2023</span>
            <span className="text-emerald-700 font-bold">2024</span>
          </div>
        </div>
      </div>
    </div>
  );
};
