import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Maximize2, 
  Layers, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Share2, 
  Camera, 
  Box, 
  Grid, 
  Map, 
  ChevronDown,
  Info,
  Calendar,
  Compass,
  Play,
  Pause,
  MapPin,
  AlertTriangle,
  Users,
  Home,
  ShieldAlert,
  Clock,
  Filter,
  Building2,
  Flame,
  ListFilter
} from 'lucide-react';
import { AdminFeatureCollection, AdminFeature, AdminProperties, HazardType, DisasterIncident, FacilityCategory, FacilitySubType, RadarInvestResult } from '../types';
import { HAZARD_LAYERS } from '../data/hazardLayers';
import { DISASTER_INCIDENTS } from '../data/mockDisasterIncidents';
import { MOCK_FACILITIES } from '../data/mockFacilities';
import { POLA_RUANG_DATA } from '../data/mockPolaRuang';
import { DESA_BOUNDARIES } from '../data/mockDesaBoundaries';

interface MapContainerProps {
  adminBoundaries: AdminFeatureCollection;
  selectedDistrict: AdminFeature | null;
  selectedVillage?: string | null;
  onSelectDistrict: (district: AdminFeature | null) => void;
  onSelectVillage?: (village: string | null) => void;
  selectedHazard: HazardType;
  showHazardLayer?: boolean;
  onToggleHazardLayer?: () => void;
  hazardRenderMode?: 'class' | 'index';
  onChangeHazardRenderMode?: (mode: 'class' | 'index') => void;
  opacity: number;
  showAdminBoundaries: boolean;
  showPolaRuang?: boolean;
  showIncidents: boolean;
  onToggleIncidents: () => void;
  selectedIncidentHazards: HazardType[];
  showFacilities: boolean;
  onToggleFacilities: () => void;
  selectedFacilityCategories: FacilityCategory[];
  selectedFacilitySubTypes: FacilitySubType[];
  mapTileUrlPattern?: string;
  isMapLoading: boolean;
  onResetView: () => void;
  radarInvestResult?: RadarInvestResult | null;
  isPickingOnMap?: boolean;
  onMapClickSelect?: (lat: number, lng: number) => void;
  onCancelPickOnMap?: () => void;
  showAllIncidentsMode?: boolean;
  onToggleAllIncidentsMode?: () => void;
  onOpenAllIncidentsModal?: () => void;
  focusedCoords?: [number, number] | null;
  customUploadedLayers?: any[];
}

export const MapContainer: React.FC<MapContainerProps> = ({
  adminBoundaries,
  selectedDistrict,
  selectedVillage,
  onSelectDistrict,
  onSelectVillage,
  selectedHazard,
  showHazardLayer = true,
  onToggleHazardLayer,
  hazardRenderMode = 'class',
  onChangeHazardRenderMode,
  opacity,
  showAdminBoundaries,
  showPolaRuang = true,
  showIncidents,
  onToggleIncidents,
  selectedIncidentHazards,
  showFacilities,
  onToggleFacilities,
  selectedFacilityCategories,
  selectedFacilitySubTypes,
  mapTileUrlPattern,
  isMapLoading,
  onResetView,
  radarInvestResult,
  isPickingOnMap = false,
  onMapClickSelect,
  onCancelPickOnMap,
  showAllIncidentsMode = false,
  onToggleAllIncidentsMode,
  onOpenAllIncidentsModal,
  focusedCoords = null,
  customUploadedLayers = [],
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const desaLayerRef = useRef<L.GeoJSON | null>(null);
  const polaRuangLayerRef = useRef<L.GeoJSON | null>(null);
  const rasterCanvasOverlayRef = useRef<L.ImageOverlay | null>(null);
  const incidentsLayerRef = useRef<L.LayerGroup | null>(null);
  const facilitiesLayerRef = useRef<L.LayerGroup | null>(null);
  const investLayerRef = useRef<L.LayerGroup | null>(null);
  const customUploadedLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number }>({
    lat: -6.81482,
    lng: 107.60851,
  });
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [basemapStyle, setBasemapStyle] = useState<'google_hybrid' | 'google_satellite' | 'osm' | 'positron' | 'esri_satellite'>('positron');
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [groupingMode, setGroupingMode] = useState<string>('Kecamatan & Desa');
  const [isPlayingTimelapse, setIsPlayingTimelapse] = useState<boolean>(false);
  const [isTimelineVisible, setIsTimelineVisible] = useState<boolean>(true);
  const [isScaleVisible, setIsScaleVisible] = useState<boolean>(true);

  // Automated Timelapse Player Loop
  useEffect(() => {
    let timer: any = null;
    if (isPlayingTimelapse) {
      timer = setInterval(() => {
        setSelectedYear((prev) => (prev >= 2025 ? 2018 : prev + 1));
      }, 1800);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlayingTimelapse]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    // West Java center coordinates
    const map = L.map(mapRef.current, {
      center: [-6.85, 107.50],
      zoom: 9,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Mouse move coordinate listener
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setMouseCoords({
        lat: Number(e.latlng.lat.toFixed(6)),
        lng: Number(e.latlng.lng.toFixed(6)),
      });
    });

    leafletMap.current = map;

    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // Focus map on specific coordinates when selected from All Disaster Incidents Modal
  useEffect(() => {
    if (focusedCoords && leafletMap.current) {
      leafletMap.current.flyTo(focusedCoords, 13, { animate: true, duration: 1.5 });
    }
  }, [focusedCoords]);

  // Map Click Listener for "Pilih Berdasarkan Peta" mode
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isPickingOnMap && onMapClickSelect) {
        onMapClickSelect(e.latlng.lat, e.latlng.lng);
      }
    };

    if (isPickingOnMap) {
      map.on('click', handleMapClick);
      if (mapRef.current) {
        mapRef.current.style.cursor = 'crosshair';
      }
    } else {
      if (mapRef.current) {
        mapRef.current.style.cursor = '';
      }
    }

    return () => {
      map.off('click', handleMapClick);
      if (mapRef.current) {
        mapRef.current.style.cursor = '';
      }
    };
  }, [isPickingOnMap, onMapClickSelect]);

  // Update Basemap Tiles
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
    let subdomains: string | string[] = 'abcd';
    let maxZoom = 19;

    if (basemapStyle === 'google_satellite') {
      url = 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}';
      subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
      maxZoom = 20;
    } else if (basemapStyle === 'google_hybrid') {
      url = 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}';
      subdomains = ['mt0', 'mt1', 'mt2', 'mt3'];
      maxZoom = 20;
    } else if (basemapStyle === 'osm') {
      url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = ['a', 'b', 'c'];
      maxZoom = 19;
    } else if (basemapStyle === 'esri_satellite') {
      url = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      subdomains = 'abcd';
      maxZoom = 19;
    } else if (basemapStyle === 'positron') {
      url = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
      subdomains = 'abcd';
      maxZoom = 19;
    }

    L.tileLayer(url, { maxZoom, subdomains }).addTo(map);
  }, [basemapStyle]);

  // Render Admin Vector Layer
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
      geojsonLayerRef.current = null;
    }

    if (!showAdminBoundaries) return;

    const layer = L.geoJSON(adminBoundaries as any, {
      style: (feature) => {
        const isSelected = selectedDistrict && selectedDistrict.id === feature?.id;
        return {
          color: isSelected ? '#059669' : '#64748b',
          weight: isSelected ? 3 : 1.2,
          opacity: isSelected ? 1.0 : 0.7,
          fillColor: isSelected ? '#10b981' : '#ffffff',
          fillOpacity: isSelected ? 0.15 : 0.03,
          dashArray: isSelected ? '' : '3, 3',
        };
      },
      onEachFeature: (feature, polygonLayer) => {
        const props = feature.properties as AdminProperties;
        const tinggi = props.luas_risiko_tinggi_ha || Math.round(props.total_area_ha * 0.35);
        const sedang = props.luas_risiko_sedang_ha || Math.round(props.total_area_ha * 0.40);
        const rendah = props.luas_risiko_rendah_ha || Math.max(0, props.total_area_ha - tinggi - sedang);

        polygonLayer.bindTooltip(
          `
          <div class="p-1 font-sans">
            <div class="font-bold text-slate-800 text-xs">${props.name}</div>
            <div class="text-[10px] text-slate-500 font-mono">${props.type} • ${props.total_area_ha.toLocaleString()} ha</div>
            <div class="text-[9px] text-rose-600 font-mono">Tinggi: ${tinggi.toLocaleString()} Ha | Sedang: ${sedang.toLocaleString()} Ha</div>
          </div>
          `,
          { sticky: true, direction: 'top' }
        );

        polygonLayer.bindPopup(
          `
          <div class="p-2.5 font-sans w-72 max-w-[290px] text-slate-800 bg-white/95 rounded-xl border border-slate-200 shadow-xl backdrop-blur">
            <div class="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-slate-100">
              <span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                ${props.code} • Batas Administrasi
              </span>
              <span class="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">${props.province}</span>
            </div>

            <h4 class="font-bold text-xs text-slate-900 mb-2 leading-snug">${props.name}</h4>

            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-2 space-y-1 text-[10px]">
              <div class="flex justify-between border-b border-slate-200 pb-1">
                <span class="text-slate-500 font-mono">Luas Total:</span>
                <span class="font-bold text-slate-800 font-mono">${props.total_area_ha.toLocaleString()} Ha</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 font-mono">Populasi:</span>
                <span class="font-medium text-slate-700">${props.population.toLocaleString()} jiwa</span>
              </div>
            </div>

            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-2 space-y-1.5">
              <div class="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-700 flex items-center justify-between">
                <span>Rincian Luasan Kelas Bencana (Ha):</span>
              </div>

              <div class="space-y-1 text-[10px] font-mono">
                <div class="flex items-center justify-between p-1 rounded bg-rose-50 border border-rose-200">
                  <span class="text-rose-800 font-semibold flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-rose-500"></span> Kelas Tinggi:
                  </span>
                  <span class="font-bold text-rose-900">${tinggi.toLocaleString()} Ha</span>
                </div>

                <div class="flex items-center justify-between p-1 rounded bg-amber-50 border border-amber-200">
                  <span class="text-amber-800 font-semibold flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-amber-500"></span> Kelas Sedang:
                  </span>
                  <span class="font-bold text-amber-900">${sedang.toLocaleString()} Ha</span>
                </div>

                <div class="flex items-center justify-between p-1 rounded bg-emerald-50 border border-emerald-200">
                  <span class="text-emerald-800 font-semibold flex items-center gap-1">
                    <span class="w-2 h-2 rounded-full bg-emerald-500"></span> Kelas Rendah:
                  </span>
                  <span class="font-bold text-emerald-900">${rendah.toLocaleString()} Ha</span>
                </div>
              </div>
            </div>

            <div class="text-[9px] text-slate-500 leading-tight">
              Kerentanan Utama: <span class="text-slate-800 font-medium">${props.primary_vulnerability}</span>
            </div>
          </div>
          `,
          { closeButton: true }
        );

        polygonLayer.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          onSelectDistrict(feature as AdminFeature);

          // Zoom to polygon bounds
          if (polygonLayer instanceof L.Polygon) {
            map.fitBounds(polygonLayer.getBounds(), { padding: [50, 50], maxZoom: 11 });
          }
        });
      },
    }).addTo(map);

    geojsonLayerRef.current = layer;
  }, [adminBoundaries, selectedDistrict, showAdminBoundaries, onSelectDistrict]);

  // Render Desa Vector Layer (276 Desa in Banjarnegara)
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    if (desaLayerRef.current) {
      map.removeLayer(desaLayerRef.current);
      desaLayerRef.current = null;
    }

    if (!showAdminBoundaries) return;

    // Filter desas by selected district if a district is selected
    const desasToRender = selectedDistrict
      ? DESA_BOUNDARIES.features.filter(
          (f: any) =>
            f.properties.subdistrict.toLowerCase().includes(selectedDistrict.properties.name.toLowerCase()) ||
            selectedDistrict.properties.name.toLowerCase().includes(f.properties.subdistrict.toLowerCase())
        )
      : DESA_BOUNDARIES.features;

    const layer = L.geoJSON({ type: 'FeatureCollection', features: desasToRender } as any, {
      style: (feature: any) => {
        const isSelected = selectedVillage && selectedVillage.toLowerCase() === feature?.properties?.name?.toLowerCase();
        return {
          color: isSelected ? '#059669' : '#334155',
          weight: isSelected ? 2.5 : 0.8,
          opacity: isSelected ? 0.95 : 0.45,
          fillColor: isSelected ? '#10b981' : '#64748b',
          fillOpacity: isSelected ? 0.25 : 0.04,
          dashArray: '2, 2',
        };
      },
      onEachFeature: (feature: any, polygonLayer: L.Layer) => {
        const props = feature.properties;
        polygonLayer.bindTooltip(
          `
          <div class="p-1 font-sans">
            <div class="font-bold text-slate-800 text-xs">${props.name}</div>
            <div class="text-[10px] text-slate-500 font-mono">${props.subdistrict} • ${props.district}</div>
            <div class="text-[9px] text-emerald-700 font-mono">Luas: ${props.total_area_ha?.toLocaleString()} Ha</div>
          </div>
          `,
          { sticky: true, direction: 'top' }
        );

        polygonLayer.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          if (onSelectVillage) {
            onSelectVillage(props.name);
          }
          if (polygonLayer instanceof L.Polygon) {
            map.fitBounds(polygonLayer.getBounds(), { padding: [40, 40], maxZoom: 14 });
          }
        });
      },
    }).addTo(map);

    desaLayerRef.current = layer;
  }, [selectedDistrict, selectedVillage, showAdminBoundaries, onSelectVillage]);

  // Smooth Zoom-in effect when selectedVillage changes
  useEffect(() => {
    if (!leafletMap.current || !selectedVillage) return;
    const map = leafletMap.current;

    const matchedDesa = DESA_BOUNDARIES.features.find(
      (f: any) => f.properties.name.toLowerCase() === selectedVillage.toLowerCase()
    );

    if (matchedDesa && matchedDesa.geometry) {
      let coords = matchedDesa.geometry.coordinates[0];
      if (Array.isArray(coords[0][0])) {
        coords = coords[0];
      }
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
      coords.forEach(([lng, lat]: [number, number]) => {
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
      });

      map.fitBounds([[minLat, minLng], [maxLat, maxLng]], { padding: [60, 60], maxZoom: 15 });
    }
  }, [selectedVillage]);

  // Render Pola Ruang RTRW Vector Layer
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    if (polaRuangLayerRef.current) {
      map.removeLayer(polaRuangLayerRef.current);
      polaRuangLayerRef.current = null;
    }

    if (!showPolaRuang) return;

    const layer = L.geoJSON(POLA_RUANG_DATA as any, {
      style: (feature) => {
        const color = feature?.properties?.color || '#0d9488';
        return {
          color: color,
          weight: 2,
          opacity: 0.85,
          fillColor: color,
          fillOpacity: 0.25,
          dashArray: '4, 4',
        };
      },
      onEachFeature: (feature, polygonLayer) => {
        const props = feature.properties;
        const isLindung = props.kategori_utama === 'Kawasan Lindung';
        const badgeColorClass = isLindung 
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
          : 'bg-purple-50 text-purple-800 border-purple-200';

        polygonLayer.bindTooltip(
          `
          <div class="p-1 font-sans">
            <div class="font-bold text-slate-800 text-xs">${props.kode_zona} - ${props.nama_zona}</div>
            <div class="text-[10px] text-teal-700 font-mono">${props.kategori_utama} • ${props.luas_ha.toLocaleString()} ha</div>
          </div>
          `,
          { sticky: true, direction: 'top' }
        );

        polygonLayer.bindPopup(
          `
          <div class="p-2.5 font-sans w-72 max-w-[290px] text-slate-800 bg-white/95 rounded-xl border border-slate-200 shadow-xl backdrop-blur">
            <div class="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-slate-100">
              <span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase tracking-wider border ${badgeColorClass}">
                ${props.kode_zona} • ${props.kategori_utama}
              </span>
              <span class="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">${props.id_pola_ruang}</span>
            </div>

            <h4 class="font-bold text-xs text-slate-900 mb-2 leading-snug">${props.nama_zona}</h4>

            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-2 space-y-1 text-[10px]">
              <div class="flex justify-between border-b border-slate-200 pb-1">
                <span class="text-slate-500 font-mono">Kab/Kota:</span>
                <span class="font-semibold text-slate-800">${props.kabupaten_kota}</span>
              </div>
              <div class="flex justify-between border-b border-slate-200 pb-1">
                <span class="text-slate-500 font-mono">Luas Area:</span>
                <span class="font-semibold text-teal-700 font-mono">${props.luas_ha.toLocaleString()} Ha</span>
              </div>
              <div class="flex justify-between pt-0.5">
                <span class="text-slate-500 font-mono">Sub-Zona:</span>
                <span class="font-medium text-slate-700 text-right shrink-0 max-w-[150px] truncate">${props.sub_zona_pola_ruang}</span>
              </div>
            </div>

            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-2 space-y-1">
              <div class="text-[8px] font-mono font-bold uppercase tracking-wider text-amber-700">
                Ketentuan KKPR (Dinas PUPR)
              </div>
              <p class="text-[10px] text-slate-700 leading-snug font-sans">${props.ketentuan_kkpr}</p>
            </div>

            <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px] font-mono">
              <span class="text-slate-500">Status: <strong class="text-amber-700">${props.status_konservasi}</strong></span>
            </div>
          </div>
          `,
          { closeButton: true }
        );

        polygonLayer.on('click', (e) => {
          L.DomEvent.stopPropagation(e);
          if (polygonLayer instanceof L.Polygon) {
            map.fitBounds(polygonLayer.getBounds(), { padding: [40, 40], maxZoom: 12 });
          }
        });
      },
    }).addTo(map);

    polaRuangLayerRef.current = layer;
  }, [showPolaRuang]);

  // Render Real 30-meter Disaster Risk Index Raster Overlay (from INDEKS BENCANA 30 GeoTIFFs)
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    if (rasterCanvasOverlayRef.current) {
      map.removeLayer(rasterCanvasOverlayRef.current);
      rasterCanvasOverlayRef.current = null;
    }

    if (!showHazardLayer) return;

    // Real 30-meter GeoTIFF bounds for Banjarnegara (EPSG:3395 WGS84)
    const bounds: L.LatLngBoundsExpression = [
      [-7.540781817456455, 109.36131288641874],
      [-7.162227603288682, 109.9178192049308]
    ];

    const overlayUrl = `/hazard_rasters/${selectedHazard}_${hazardRenderMode}.png`;

    const overlay = L.imageOverlay(overlayUrl, bounds, {
      opacity: opacity,
      interactive: false,
    }).addTo(map);

    rasterCanvasOverlayRef.current = overlay;
  }, [selectedHazard, opacity, showHazardLayer, hazardRenderMode]);

  // Render Interactive Disaster Incident Markers (Titik Bencana)
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    if (incidentsLayerRef.current) {
      map.removeLayer(incidentsLayerRef.current);
      incidentsLayerRef.current = null;
    }

    if (!showIncidents) return;

    const layerGroup = L.layerGroup();

    const filteredIncidents = DISASTER_INCIDENTS.filter((inc) => {
      if (showAllIncidentsMode) return true;
      const matchYear = inc.year === selectedYear;
      const matchHazardType = selectedIncidentHazards.includes(inc.hazardType);
      return matchYear && matchHazardType;
    });

    filteredIncidents.forEach((incident) => {
      const hazardColor = 
        incident.hazardType === 'flood' ? '#2563eb' :
        incident.hazardType === 'flashflood' ? '#0891b2' :
        incident.hazardType === 'landslide' ? '#d97706' :
        incident.hazardType === 'earthquake' ? '#9333ea' : '#e11d48';

      const hazardBadgeText =
        incident.hazardType === 'flood' ? 'Banjir' :
        incident.hazardType === 'flashflood' ? 'Banjir Bandang' :
        incident.hazardType === 'landslide' ? 'Longsor' :
        incident.hazardType === 'earthquake' ? 'Gempa' : 'Likuifaksi';

      const customIcon = L.divIcon({
        className: 'custom-disaster-pin',
        html: `
          <div class="relative group cursor-pointer">
            <span class="absolute -inset-1 rounded-full animate-ping opacity-60" style="background-color: ${hazardColor};"></span>
            <div class="relative w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md border-2 border-white font-bold" style="background-color: ${hazardColor};">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker(incident.coordinates, { icon: customIcon });

      const popupContent = `
        <div class="p-2.5 font-sans w-64 max-w-[260px] text-slate-800 bg-white/95 rounded-xl border border-slate-200 shadow-xl backdrop-blur">
          <div class="flex items-center justify-between gap-1 mb-1.5 pb-1 border-b border-slate-100">
            <div class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full animate-pulse" style="background-color: ${hazardColor};"></span>
              <span class="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded uppercase tracking-wider" style="background-color: ${hazardColor}15; color: ${hazardColor}; border: 1px solid ${hazardColor}40;">
                ${hazardBadgeText}
              </span>
            </div>
            <span class="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">${incident.date}</span>
          </div>

          <h4 class="font-bold text-[11px] text-slate-900 mb-1.5 leading-snug">${incident.title}</h4>

          <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-1.5 space-y-0.5 text-[10px]">
            <div class="text-[8px] font-mono font-bold uppercase tracking-wider text-rose-700 mb-0.5 flex items-center gap-1">
              <span>ALAMAT & LOKASI KEJADIAN</span>
            </div>
            <div class="flex items-start justify-between gap-2 text-slate-700">
              <span class="text-slate-500 font-mono shrink-0">Desa/Kel:</span>
              <span class="font-semibold text-slate-800 text-right truncate">${incident.villageName || '-'}</span>
            </div>
            <div class="flex items-start justify-between gap-2 text-slate-700">
              <span class="text-slate-500 font-mono shrink-0">Kecamatan:</span>
              <span class="font-semibold text-slate-800 text-right truncate">${incident.subdistrictName || '-'}</span>
            </div>
            <div class="flex items-start justify-between gap-2 text-slate-700">
              <span class="text-slate-500 font-mono shrink-0">Kab/Kota:</span>
              <span class="font-semibold text-slate-800 text-right truncate">${incident.districtName}</span>
            </div>
            <div class="flex items-start justify-between gap-2 text-slate-600 text-[9px] border-t border-slate-200 pt-0.5 mt-0.5">
              <span class="text-slate-500 font-mono shrink-0">Titik Detail:</span>
              <span class="text-slate-700 text-right truncate">${incident.locationName}</span>
            </div>
          </div>

          <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-1.5 space-y-1">
            <div class="text-[8px] font-mono font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
              <span>DAMPAK BENCANA</span>
            </div>
            
            <p class="text-[10px] text-slate-700 leading-snug font-sans">
              ${incident.description}
            </p>

            ${incident.infrastructureImpact ? `
              <div class="text-[9px] text-slate-700 bg-white p-1.5 rounded border border-slate-200 leading-snug mt-1">
                <span class="text-amber-700 font-mono text-[8px] block mb-0.5 font-bold uppercase tracking-wider">Infrastruktur & Fasilitas:</span>
                <span class="text-slate-800 font-medium">${incident.infrastructureImpact}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px] font-mono">
            <span class="text-slate-500">Status: <strong class="text-emerald-700">${incident.status}</strong></span>
            <span class="px-1.5 py-0.5 rounded text-[8px] uppercase font-bold text-rose-800 bg-rose-50 border border-rose-200">${incident.severity}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'custom-leaflet-popup',
        maxWidth: 270,
      });

      marker.on('click', () => {
        marker.openPopup();
      });

      layerGroup.addLayer(marker);
    });

    layerGroup.addTo(map);
    incidentsLayerRef.current = layerGroup;

    if (filteredIncidents.length > 0) {
      if (filteredIncidents.length === 1) {
        const coords = filteredIncidents[0].coordinates;
        map.flyTo(coords, 11, { duration: 1.2, animate: true });
      } else {
        const bounds = L.latLngBounds(filteredIncidents.map((inc) => inc.coordinates));
        map.flyToBounds(bounds, { maxZoom: 12, padding: [80, 80], duration: 1.2, animate: true });
      }
    }
  }, [showIncidents, selectedYear, selectedIncidentHazards, showAllIncidentsMode]);

  // Render Facilities Layer (Fasilitas Kritis & Fasilitas Umum)
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    if (facilitiesLayerRef.current) {
      map.removeLayer(facilitiesLayerRef.current);
      facilitiesLayerRef.current = null;
    }

    if (!showFacilities) return;

    const layerGroup = L.layerGroup();

    const filteredFacilities = MOCK_FACILITIES.filter((fac) => {
      const categoryMatch = selectedFacilityCategories.includes(fac.category);
      const subTypeMatch = selectedFacilitySubTypes.includes(fac.subType);

      let districtMatch = true;
      if (selectedDistrict) {
        const districtName = selectedDistrict.properties.name.toLowerCase().replace(/^(kabupaten|kota)\s+/, '');
        const facDistrictName = fac.districtName.toLowerCase().replace(/^(kabupaten|kota)\s+/, '');
        districtMatch = facDistrictName.includes(districtName) || districtName.includes(facDistrictName);
      }

      return categoryMatch && subTypeMatch && districtMatch;
    });

    const subTypeSvgIcons: Record<FacilitySubType, string> = {
      'Rumah Sakit': `<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6v12M6 12h12"/></svg>`,
      'Posko BPBD': `<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.8 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/></svg>`,
      'Pemadam': `<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z"/></svg>`,
      'Polisi': `<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
      'Sekolah / Pengungsian': `<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
      'Tempat Ibadah': `<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="21" x2="21" y2="21"/><line x1="6" y1="21" x2="6" y2="11"/><line x1="10" y1="21" x2="10" y2="11"/><line x1="14" y1="21" x2="14" y2="11"/><line x1="18" y1="21" x2="18" y2="11"/><polygon points="12 3 2 10 22 10 12 3"/></svg>`,
      'Pasar / Logistik': `<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
      'Gedung Olahraga': `<svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><path d="M9 9h6v6H9z"/></svg>`,
    };

    filteredFacilities.forEach((fac) => {
      const isKritis = fac.category === 'kritis';
      const themeColor = isKritis ? '#059669' : '#2563eb';
      const badgeText = isKritis ? 'Fasilitas Kritis' : 'Fasilitas Umum';
      const badgeClass = isKritis
        ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
        : 'text-blue-800 bg-blue-50 border-blue-200';

      const iconSvg = subTypeSvgIcons[fac.subType] || subTypeSvgIcons['Rumah Sakit'];

      const customIcon = L.divIcon({
        className: 'custom-facility-pin',
        html: `
          <div class="relative group cursor-pointer">
            <div class="w-7 h-7 rounded-lg flex items-center justify-center text-xs shadow-md border-2 border-white font-bold transition-transform hover:scale-110" style="background-color: ${themeColor};">
              ${iconSvg}
            </div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(fac.coordinates, { icon: customIcon });

      const popupContent = `
        <div class="p-2.5 font-sans w-64 max-w-[260px] text-slate-800 bg-white/95 rounded-xl border border-slate-200 shadow-xl backdrop-blur">
          <div class="flex items-center justify-between gap-1 mb-1.5 pb-1 border-b border-slate-100">
            <div class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${themeColor};"></span>
              <span class="px-1.5 py-0.5 text-[9px] font-mono font-bold rounded uppercase tracking-wider border ${badgeClass}">
                ${badgeText}
              </span>
            </div>
            <span class="text-[9px] font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">${fac.subType}</span>
          </div>

          <h4 class="font-bold text-[11px] text-slate-900 mb-1.5 leading-snug">${fac.name}</h4>

          <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-1.5 space-y-0.5 text-[10px]">
            <div class="text-[8px] font-mono font-bold uppercase tracking-wider text-emerald-700 mb-0.5 flex items-center gap-1">
              <span>DETAIL LOKASI</span>
            </div>
            <div class="flex items-start justify-between gap-2 text-slate-700">
              <span class="text-slate-500 font-mono shrink-0">Desa/Kel:</span>
              <span class="font-semibold text-slate-800 text-right truncate">${fac.villageName || '-'}</span>
            </div>
            <div class="flex items-start justify-between gap-2 text-slate-700">
              <span class="text-slate-500 font-mono shrink-0">Kecamatan:</span>
              <span class="font-semibold text-slate-800 text-right truncate">${fac.subdistrictName || '-'}</span>
            </div>
            <div class="flex items-start justify-between gap-2 text-slate-700">
              <span class="text-slate-500 font-mono shrink-0">Kab/Kota:</span>
              <span class="font-semibold text-slate-800 text-right truncate">${fac.districtName}</span>
            </div>
            <div class="flex items-start justify-between gap-2 text-slate-600 text-[9px] border-t border-slate-200 pt-0.5 mt-0.5">
              <span class="text-slate-500 font-mono shrink-0">Jalan:</span>
              <span class="text-slate-700 text-right truncate">${fac.address}</span>
            </div>
          </div>

          <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-1.5 space-y-1 text-[9px]">
            <div class="text-[8px] font-mono font-bold uppercase tracking-wider text-teal-700 flex items-center gap-1">
              <span>KAPASITAS & KONTAK</span>
            </div>
            <p class="text-slate-800 font-medium leading-snug">${fac.capacityInfo || 'Fasilitas pendukung darurat'}</p>
            ${fac.contact ? `
              <div class="text-slate-500 font-mono text-[8px] pt-1 border-t border-slate-200 flex justify-between">
                <span>Kontak:</span>
                <span class="text-emerald-700 font-bold">${fac.contact}</span>
              </div>
            ` : ''}
          </div>

          <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px] font-mono">
            <span class="text-slate-500">Status: <strong class="text-emerald-700">${fac.status}</strong></span>
            <span class="px-1.5 py-0.5 rounded text-[8px] font-bold text-slate-700 bg-slate-100 border border-slate-200">${fac.category.toUpperCase()}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        className: 'custom-leaflet-popup',
        maxWidth: 270,
      });

      marker.on('click', () => {
        marker.openPopup();
      });

      layerGroup.addLayer(marker);
    });

    layerGroup.addTo(map);
    facilitiesLayerRef.current = layerGroup;
  }, [showFacilities, selectedFacilityCategories, selectedFacilitySubTypes, selectedDistrict]);

  // Render Radar Invest Plot Marker & Buffer Circle
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    if (investLayerRef.current) {
      map.removeLayer(investLayerRef.current);
      investLayerRef.current = null;
    }

    if (!radarInvestResult) return;

    const layerGroup = L.layerGroup().addTo(map);
    investLayerRef.current = layerGroup;

    const { lat, lng, projectName, plotAreaHa, feasibilityStatus, isProtectedZone, areaBreakdown, districtName, villageName } = radarInvestResult;

    const areaM2 = plotAreaHa * 10000;
    const radiusMeters = Math.max(80, Math.round(Math.sqrt(areaM2 / Math.PI)));

    const color = feasibilityStatus.includes('ZONA MERAH')
      ? '#dc2626'
      : feasibilityStatus.includes('ZONA KUNING')
      ? '#d97706'
      : '#059669';

    const circle = L.circle([lat, lng], {
      color: color,
      fillColor: color,
      fillOpacity: 0.35,
      weight: 3,
      radius: radiusMeters,
    }).addTo(layerGroup);

    const pinHtml = `
      <div class="relative flex items-center justify-center">
        <span class="animate-ping absolute inline-flex h-8 w-8 rounded-full opacity-75" style="background-color: ${color}"></span>
        <div class="relative inline-flex rounded-full h-8 w-8 items-center justify-center text-white font-bold text-xs shadow-md border-2 border-white" style="background-color: ${color}">
          <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        </div>
      </div>
    `;

    const icon = L.divIcon({
      html: pinHtml,
      className: 'invest-plot-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([lat, lng], { icon }).addTo(layerGroup);

    const popupContent = `
      <div class="p-2 text-slate-800 font-sans max-w-xs space-y-1.5 bg-white/95 rounded-xl border border-slate-200 shadow-xl backdrop-blur">
        <div class="text-[10px] text-emerald-700 font-mono font-bold uppercase">RADAR INVEST TAPAK</div>
        <div class="font-bold text-xs text-slate-900">${projectName}</div>
        <div class="text-[10px] text-slate-600 font-mono">${villageName}, ${districtName}</div>
        <div class="text-[10px] text-slate-500 font-mono">X: ${lng}, Y: ${lat} • ${plotAreaHa} Ha</div>
        <div class="p-1 rounded text-[10px] font-bold text-center" style="background-color: ${color}15; color: ${color}; border: 1px solid ${color}40">
          ${feasibilityStatus}
        </div>
        <div class="text-[10px] text-slate-600 font-mono pt-1 border-t border-slate-100">
          Budi Daya: <b class="text-emerald-700">${areaBreakdown.buildableAreaHa} Ha</b> |
          Lindung: <b class="text-rose-700">${areaBreakdown.protectedAreaHa} Ha</b>
        </div>
      </div>
    `;

    marker.bindPopup(popupContent, { className: 'custom-leaflet-popup' });
    circle.bindPopup(popupContent, { className: 'custom-leaflet-popup' });

    map.flyTo([lat, lng], 13, { duration: 1.5 });

  }, [radarInvestResult]);

  // Render Super Admin Custom Uploaded Layers (CSV / GeoJSON)
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    if (customUploadedLayerGroupRef.current) {
      map.removeLayer(customUploadedLayerGroupRef.current);
      customUploadedLayerGroupRef.current = null;
    }

    if (!customUploadedLayers || customUploadedLayers.length === 0) return;

    const layerGroup = L.layerGroup().addTo(map);
    customUploadedLayerGroupRef.current = layerGroup;

    customUploadedLayers.forEach((layer) => {
      if (!layer.content && !layer.spatialAttributes) return;

      const spatialAttrs = layer.spatialAttributes || {};

      if (layer.type === 'geojson') {
        try {
          const geoJsonData = typeof layer.content === 'string' ? JSON.parse(layer.content) : layer.content;
          L.geoJSON(geoJsonData, {
            style: {
              color: layer.category === 'admin_boundary' ? '#059669' : '#0284c7',
              weight: 2,
              fillColor: layer.category === 'admin_boundary' ? '#10b981' : '#38bdf8',
              fillOpacity: 0.35,
            },
            onEachFeature: (feature, l) => {
              const props = feature.properties || {};
              const merged = { ...props, ...spatialAttrs };

              let popupHtml = '';
              if (layer.category === 'admin_boundary' || merged.nama_kabupaten || merged.populasi_terpapar_longsor) {
                const code = merged.code || merged.id || merged.kode_desa || '-';
                const kab = merged.nama_kabupaten || merged.kabupaten || merged.kabupaten_kota || '-';
                const kec = merged.nama_kecamatan || merged.kecamatan || '-';
                const desa = merged.nama_desa || merged.desa || merged.kelurahan || '-';
                const popLongsor = merged.populasi_terpapar_longsor || merged.terpapar_longsor || 0;
                const popBanjir = merged.populasi_terpapar_banjir || merged.terpapar_banjir || 0;
                const popKebakaran = merged.populasi_terpapar_kebakaran || merged.terpapar_kebakaran || 0;
                const popGempa = merged.populasi_terpapar_gempa || merged.terpapar_gempa || 0;
                const totalPop = merged.total_populasi || merged.population || 0;
                const areaHa = merged.luas_wilayah_ha || merged.luas_ha || 0;

                popupHtml = `
                  <div class="p-3 font-sans text-xs text-slate-800 bg-white/95 rounded-xl border border-slate-200 shadow-xl space-y-2">
                    <div class="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        SPASIAL ADMINISTRASI
                      </span>
                      <span class="text-[10px] font-mono text-slate-500">ID: ${code}</span>
                    </div>
                    <div class="font-bold text-amber-700 text-sm">${layer.name}</div>
                    <div class="grid grid-cols-2 gap-1 text-[10px] bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <div><span class="text-slate-500">Kabupaten:</span> <b class="text-slate-800 block">${kab}</b></div>
                      <div><span class="text-slate-500">Kecamatan:</span> <b class="text-slate-800 block">${kec}</b></div>
                      <div><span class="text-slate-500">Desa/Kel:</span> <b class="text-slate-800 block">${desa}</b></div>
                      <div><span class="text-slate-500">Luas Area:</span> <b class="text-slate-800 block">${Number(areaHa).toLocaleString('id-ID')} Ha</b></div>
                    </div>
                    <div class="p-2 bg-rose-50/70 rounded-lg border border-rose-200 space-y-1">
                      <div class="text-[10px] font-mono font-bold text-rose-800 flex items-center justify-between">
                        <span>POPULASI TERPAPAR BENCANA</span>
                        <span>Tot: ${Number(totalPop).toLocaleString('id-ID')} Jiwa</span>
                      </div>
                      <div class="grid grid-cols-2 gap-1 text-[10px] font-mono pt-0.5">
                        <div class="text-amber-800">Longsor: <b>${Number(popLongsor).toLocaleString('id-ID')}</b></div>
                        <div class="text-blue-800">Banjir: <b>${Number(popBanjir).toLocaleString('id-ID')}</b></div>
                        <div class="text-orange-800">Kebakaran: <b>${Number(popKebakaran).toLocaleString('id-ID')}</b></div>
                        <div class="text-rose-800">Gempa: <b>${Number(popGempa).toLocaleString('id-ID')}</b></div>
                      </div>
                    </div>
                  </div>
                `;
              } else {
                popupHtml = `<div class="p-2 text-xs font-sans text-slate-800 bg-white rounded-xl shadow-lg border border-slate-200">`;
                popupHtml += `<div class="font-bold text-amber-700 mb-1">Layer Super Admin: ${layer.name}</div>`;
                for (const [key, value] of Object.entries(merged)) {
                  popupHtml += `<div class="text-[10px]"><b class="text-slate-500">${key}:</b> ${value}</div>`;
                }
                popupHtml += `</div>`;
              }

              l.bindPopup(popupHtml, { className: 'custom-leaflet-popup' });
            },
          }).addTo(layerGroup);
        } catch (e) {
          console.error('Failed to render custom geojson layer:', e);
        }
      } else if (layer.type === 'csv') {
        const lines = layer.content ? layer.content.trim().split('\n') : [];
        if (lines.length >= 2) {
          const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase());
          const latIdx = headers.findIndex((h: string) => h === 'lat' || h === 'latitude' || h === 'y');
          const lngIdx = headers.findIndex((h: string) => h === 'lng' || h === 'longitude' || h === 'lon' || h === 'x');
          const nameIdx = headers.findIndex((h: string) => h === 'name' || h === 'nama' || h === 'title' || h === 'title_kejadian');

          if (latIdx !== -1 && lngIdx !== -1) {
            for (let i = 1; i < lines.length; i++) {
              const cols = lines[i].split(',').map((c: string) => c.trim());
              const lat = parseFloat(cols[latIdx]);
              const lng = parseFloat(cols[lngIdx]);
              const name = nameIdx !== -1 ? cols[nameIdx] : `Point ${i}`;

              if (!isNaN(lat) && !isNaN(lng)) {
                const icon = L.divIcon({
                  className: 'custom-admin-marker',
                  html: `
                    <div class="relative flex items-center justify-center">
                      <span class="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-amber-400 opacity-60"></span>
                      <div class="relative inline-flex rounded-full h-5 w-5 items-center justify-center bg-amber-500 text-white font-black text-[10px] shadow-md border border-white">
                        •
                      </div>
                    </div>
                  `,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                });

                const marker = L.marker([lat, lng], { icon }).addTo(layerGroup);
                const popupHtml = `
                  <div class="p-2.5 font-sans text-xs text-slate-800 bg-white/95 rounded-xl border border-slate-200 shadow-xl">
                    <div class="text-[9px] font-mono font-bold text-amber-700 uppercase mb-1">DATA ADMIN: ${layer.name}</div>
                    <div class="font-bold text-slate-900 mb-1">${name}</div>
                    <div class="text-[10px] text-slate-500 font-mono">X: ${lng}, Y: ${lat}</div>
                  </div>
                `;
                marker.bindPopup(popupHtml, { className: 'custom-leaflet-popup' });
              }
            }
          }
        }
      } else if (layer.type === 'geotiff' || layer.type === 'tif' || layer.type === 'tiff') {
        const bounds: L.LatLngBoundsExpression = [
          [-7.3500, 106.4000],
          [-6.3000, 107.9500]
        ];

        const isKelas = layer.category === 'kelas_bahaya';
        const rectColor = isKelas ? '#d97706' : '#ea580c';
        const rectFill = isKelas ? '#ef4444' : '#f59e0b';

        const hazardRasterRect = L.rectangle(bounds, {
          color: rectColor,
          weight: 2,
          dashArray: '6, 6',
          fillColor: rectFill,
          fillOpacity: 0.35,
        }).addTo(layerGroup);

        const popupHtml = `
          <div class="p-3 font-sans text-xs text-slate-800 bg-white/95 rounded-xl border border-slate-200 shadow-xl space-y-2">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                RASTER GEOTIFF (.TIF)
              </span>
            </div>
            <div class="font-bold text-emerald-700 text-sm">${layer.name}</div>
            <div class="text-[11px] text-slate-600 font-mono">File: ${layer.filename}</div>
            <div class="p-2 bg-slate-50 rounded-lg text-[10px] font-mono text-slate-600 space-y-1 border border-slate-200">
              <div>Kategori: <b>${layer.category}</b></div>
              <div>Proyeksi: <b>EPSG:4326 (WGS 84)</b></div>
              <div>Status: <b class="text-emerald-700">Raster Overlay Aktif di Peta</b></div>
            </div>
          </div>
        `;
        hazardRasterRect.bindPopup(popupHtml, { className: 'custom-leaflet-popup' });
      }
    });
  }, [customUploadedLayers]);

  return (
    <div className="relative flex-1 h-[calc(100vh-3.5rem)] bg-slate-100 overflow-hidden">
      {/* Map Element */}
      <div ref={mapRef} className="w-full h-full z-0" />

      {/* Floating Active Banner when Point Picker is Active */}
      {isPickingOnMap && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-amber-50 border-2 border-amber-400 rounded-2xl px-5 py-3 shadow-xl flex items-center gap-4 backdrop-blur-md animate-pulse">
          <div className="w-3.5 h-3.5 rounded-full bg-amber-500 animate-ping shrink-0" />
          <div className="text-xs font-sans">
            <span className="font-extrabold text-amber-900 block text-xs tracking-wider">MODE PILIH KOORDINAT TAPAK</span>
            <span className="text-amber-800 text-[11px]">Klik di mana saja pada peta untuk menentukan lokasi proyek usaha</span>
          </div>
          <button
            onClick={onCancelPickOnMap}
            className="ml-2 px-3 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition-all shrink-0 shadow-xs cursor-pointer"
          >
            Batal
          </button>
        </div>
      )}

      {/* Floating Top Controls & Legend Bar (Top-Right Aligned) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
        {/* Floating Top Right Controls Bar */}
        <div className="flex flex-wrap items-center justify-end gap-2 pointer-events-auto">
          {/* Dropdown: Basemap Selection */}
          <div className="relative flex items-center">
            <select
              value={basemapStyle}
              onChange={(e) => setBasemapStyle(e.target.value as any)}
              className="bg-white/95 border border-slate-200 text-slate-800 text-xs rounded-lg pl-8 pr-8 py-1.5 focus:outline-none focus:border-emerald-500 font-semibold shadow-md backdrop-blur-md cursor-pointer appearance-none"
            >
              <option value="positron">Basemap: CartoDB Positron (Light)</option>
              <option value="google_hybrid">Basemap: Google Satellite (Hybrid)</option>
              <option value="google_satellite">Basemap: Google Satellite (Pure)</option>
              <option value="osm">Basemap: OpenStreetMap (OSM)</option>
              <option value="esri_satellite">Basemap: Esri World Satellite</option>
            </select>
            <Map className="w-3.5 h-3.5 text-emerald-600 absolute left-2.5 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
          </div>

          {/* Dropdown: Kelompokkan berdasar... */}
          <div className="relative">
            <select
              value={groupingMode}
              onChange={(e) => setGroupingMode(e.target.value)}
              className="bg-white/95 border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500 font-semibold shadow-md backdrop-blur-md cursor-pointer appearance-none pr-8"
            >
              <option value="Kecamatan & Desa">Kelompokkan: Kecamatan &amp; Desa</option>
              <option value="DAS (Daerah Aliran Sungai)">Kelompokkan: DAS (Sungai)</option>
              <option value="Kelas Risk">Kelompokkan: Kelas Risiko</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* Quick Toolbar Icons */}
          <div className="bg-white/95 border border-slate-200 rounded-lg p-1 flex items-center gap-1 shadow-md backdrop-blur-md">
            <button
              onClick={onResetView}
              className="p-1.5 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors flex items-center gap-1 text-xs px-2 font-medium"
              title="Reset Peta ke Tampilan Kabupaten Banjarnegara"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline font-mono text-[11px]">Reset View</span>
            </button>
          </div>
        </div>

        {/* Legenda Hazard Box (Positioned Under Filter Controls) */}
        <div className="bg-white/95 border border-slate-200 rounded-xl shadow-lg p-3 w-64 backdrop-blur-md pointer-events-auto">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Legenda Hazard</span>
            </div>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="text-slate-400 hover:text-slate-700 text-xs p-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
              title={showLegend ? "Sembunyikan Legenda" : "Tampilkan Legenda"}
            >
              {showLegend ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showLegend && (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 font-mono">
                <span>{HAZARD_LAYERS[selectedHazard].name}</span>
                <span className="text-[10px] text-slate-500">
                  {showHazardLayer ? (hazardRenderMode === 'class' ? 'Kelas (1-3)' : 'Indeks (0-1)') : 'Mati'}
                </span>
              </div>

              {!showHazardLayer ? (
                <div className="py-2 px-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-500 italic text-center">
                  Layer Bahaya Bencana Non-aktif
                </div>
              ) : hazardRenderMode === 'class' ? (
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded shrink-0" style={{ backgroundColor: HAZARD_LAYERS[selectedHazard].colorPalette.high }}></span>
                    <span className="text-slate-700 text-[11px]">3 - Tinggi (High Vulnerability)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded shrink-0" style={{ backgroundColor: HAZARD_LAYERS[selectedHazard].colorPalette.medium }}></span>
                    <span className="text-slate-700 text-[11px]">2 - Sedang (Moderate Hazard)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded shrink-0" style={{ backgroundColor: HAZARD_LAYERS[selectedHazard].colorPalette.low }}></span>
                    <span className="text-slate-700 text-[11px]">1 - Rendah (Low Danger)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 pt-1">
                  <div className="h-3 rounded bg-gradient-to-r from-[#10b981] via-[#f59e0b] to-[#f43f5e] border border-slate-200 shadow-inner" />
                  <div className="flex justify-between text-[9px] font-mono font-bold">
                    <span className="text-emerald-700">0.0 (Rendah)</span>
                    <span className="text-amber-700">0.5 (Sedang)</span>
                    <span className="text-rose-700">1.0 (Tinggi)</span>
                  </div>
                </div>
              )}

              {/* Incident Toggle Status in Legend */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                <button
                  onClick={onToggleIncidents}
                  className="flex items-center gap-1.5 text-amber-700 hover:underline font-semibold cursor-pointer"
                >
                  <MapPin className="w-3 h-3" />
                  <span>{showIncidents ? 'Titik Bencana: Aktif' : 'Titik Bencana: Mati'}</span>
                </button>
                <span className="text-emerald-700 font-bold">{selectedYear}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {isMapLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-xs z-30 flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xl flex items-center gap-3">
            <span className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
            <div className="text-xs">
              <div className="font-bold text-slate-800">Memotong Raster GEE (.clip)...</div>
              <div className="text-[10px] text-slate-500 font-mono">Menghitung reduceRegion zonal statistics</div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Time Slider & Map Controls Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pointer-events-none">
        {/* Timeline Slider with Play/Pause Timelapse */}
        {isTimelineVisible ? (
          <div className="bg-white/95 border border-slate-200 rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 backdrop-blur-md pointer-events-auto flex-1 min-w-0 overflow-x-auto scrollbar-none">
            {/* Play / Pause Timelapse Button */}
            <button
              onClick={() => setIsPlayingTimelapse(!isPlayingTimelapse)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                isPlayingTimelapse
                  ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/30'
              }`}
              title={isPlayingTimelapse ? 'Jeda Simulasi Timelapse' : 'Putar Simulasi Timelapse Kebencanaan'}
            >
              {isPlayingTimelapse ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span className="font-mono text-[11px]">Jeda</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span className="font-mono text-[11px]">Timelapse</span>
                </>
              )}
            </button>

            {/* Selected Year Badge */}
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg shrink-0 font-mono">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-black text-emerald-800">{selectedYear}</span>
            </div>

            {/* Compact & Proportional Slider Container */}
            <div className="flex-1 flex flex-col justify-center px-1 min-w-[120px] sm:min-w-[180px]">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-500 font-mono shrink-0">2018</span>
                <input
                  type="range"
                  min="2018"
                  max="2025"
                  step="1"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="custom-slider w-full cursor-pointer"
                />
                <span className="text-[10px] font-bold text-slate-500 font-mono shrink-0">2025</span>
              </div>

              {/* Clickable Tick Dots / Quick Year Selectors */}
              <div className="flex justify-between items-center px-[18px] mt-0.5 text-[8px] font-mono text-slate-400">
                {[2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map((yr) => (
                  <button
                    key={yr}
                    onClick={() => setSelectedYear(yr)}
                    className={`transition-all hover:text-emerald-600 font-bold cursor-pointer ${
                      selectedYear === yr ? 'text-emerald-700 scale-125' : 'text-slate-400'
                    }`}
                    title={`Pilih tahun ${yr}`}
                  >
                    •
                  </button>
                ))}
              </div>
            </div>

            {/* Toggle Incident Pins */}
            <button
              onClick={onToggleIncidents}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-mono shrink-0 transition-colors cursor-pointer ${
                showIncidents && !showAllIncidentsMode
                  ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilkan / Sembunyikan Titik Kejadian Bencana Tahun Aktif"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline text-[10px]">Titik ({selectedYear})</span>
            </button>

            {/* Button: Kejadian Bencana Secara Keseluruhan */}
            <button
              onClick={() => {
                if (onToggleAllIncidentsMode) onToggleAllIncidentsMode();
              }}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 font-mono shrink-0 transition-all cursor-pointer ${
                showAllIncidentsMode
                  ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilkan / Sembunyikan Semua Kejadian Bencana (2018-2025)"
            >
              <Flame className={`w-3.5 h-3.5 ${showAllIncidentsMode ? 'text-orange-600 animate-pulse' : 'text-rose-600'}`} />
              <span className={`px-1 py-0.2 rounded text-[9px] font-mono font-bold ${
                showAllIncidentsMode ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {DISASTER_INCIDENTS.length}
              </span>
            </button>

            {/* Detail Rekap Modal Button */}
            {onOpenAllIncidentsModal && (
              <button
                onClick={onOpenAllIncidentsModal}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-amber-700 transition-colors flex items-center gap-1 text-[10px] font-mono shrink-0 cursor-pointer"
                title="Buka Rekapitulasi & Tabel Kejadian Bencana"
              >
                <ListFilter className="w-3.5 h-3.5 text-amber-600" />
              </button>
            )}

            {/* Hide Timeline Toggle Button */}
            <button
              onClick={() => setIsTimelineVisible(false)}
              className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shrink-0 cursor-pointer"
              title="Sembunyikan Panel Timelapse & Timeline"
            >
              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        ) : (
          /* Unhide Timeline Pill Button */
          <button
            onClick={() => setIsTimelineVisible(true)}
            className="bg-white/95 border border-slate-200 rounded-xl px-3 py-2 shadow-md flex items-center gap-2 text-xs font-mono text-emerald-700 hover:text-emerald-800 hover:bg-slate-50 transition-all backdrop-blur-md pointer-events-auto cursor-pointer"
            title="Tampilkan Panel Timelapse & Timeline"
          >
            <Play className="w-3.5 h-3.5 fill-current text-emerald-600" />
            <span className="text-[11px] font-bold">Timelapse &amp; Timeline ({selectedYear})</span>
            <Eye className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>
        )}

        {/* Scale & Coordinates Footer Bar */}
        {isScaleVisible ? (
          <div className="bg-white/95 border border-slate-200 rounded-xl px-3 py-2 shadow-md flex items-center gap-2.5 text-xs font-mono backdrop-blur-md pointer-events-auto shrink-0">
            {/* Scale bar indicator */}
            <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
              <span className="text-slate-500 text-[10px]">Scale:</span>
              <div className="w-12 h-1 bg-slate-300 relative border-x border-slate-500">
                <span className="absolute -top-3 left-0 text-[9px] text-slate-600">0</span>
                <span className="absolute -top-3 right-0 text-[9px] text-slate-600">50km</span>
              </div>
            </div>

            {/* Real-time Lat / Lon */}
            <div className="flex items-center gap-2 text-[10px]">
              <Compass className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-slate-500">lat:</span>
              <span className="text-slate-800 font-semibold">{mouseCoords.lat}</span>
              <span className="text-slate-500">lon:</span>
              <span className="text-slate-800 font-semibold">{mouseCoords.lng}</span>
            </div>

            {/* Hide Scale Toggle Button */}
            <button
              onClick={() => setIsScaleVisible(false)}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors ml-1 cursor-pointer"
              title="Sembunyikan Panel Skala & GPS"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Unhide Scale Pill Button */
          <button
            onClick={() => setIsScaleVisible(true)}
            className="bg-white/95 border border-slate-200 rounded-xl px-3 py-2 shadow-md flex items-center gap-2 text-xs font-mono text-slate-700 hover:text-slate-900 hover:bg-slate-50 transition-all backdrop-blur-md pointer-events-auto cursor-pointer"
            title="Tampilkan Skala & GPS"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-semibold">Skala &amp; GPS</span>
            <Eye className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};
