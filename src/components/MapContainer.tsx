import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Maximize2, 
  Minimize2,
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
  ListFilter,
  Lock,
  Unlock
} from 'lucide-react';
import { AdminFeatureCollection, AdminFeature, AdminProperties, HazardType, DisasterIncident, FacilityCategory, FacilitySubType, RadarInvestResult } from '../types';
import { HAZARD_LAYERS } from '../data/hazardLayers';
import { DISASTER_INCIDENTS } from '../data/mockDisasterIncidents';
import { MOCK_FACILITIES } from '../data/mockFacilities';
import { POLA_RUANG_DATA } from '../data/mockPolaRuang';
import { DESA_BOUNDARIES } from '../data/mockDesaBoundaries';

// In-memory cache for spatial impact GeoJSON datasets to avoid repeated fetches
const geoJsonCache: Record<string, any> = {};

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
  showImpactOverlay?: boolean;
  onToggleImpactOverlay?: () => void;
  customUploadedLayers?: any[];
  groupingMode?: string;
  onChangeGroupingMode?: (mode: string) => void;
  showBuildings?: boolean;
  onToggleBuildings?: () => void;
  onBuildingsLoadingChange?: (loading: boolean) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const MapContainerComponent: React.FC<MapContainerProps> = ({
  adminBoundaries,
  selectedDistrict,
  selectedVillage,
  onSelectDistrict,
  onSelectVillage,
  selectedHazard,
  showHazardLayer = true,
  onToggleHazardLayer,
  showImpactOverlay = true,
  onToggleImpactOverlay,
  hazardRenderMode = 'class',
  onChangeHazardRenderMode,
  opacity,
  showAdminBoundaries,
  showPolaRuang = true,
  showBuildings = false,
  onToggleBuildings,
  onBuildingsLoadingChange,
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
  groupingMode: controlledGroupingMode,
  onChangeGroupingMode,
  isFullscreen = false,
  onToggleFullscreen,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const desaLayerRef = useRef<L.GeoJSON | null>(null);
  const polaRuangLayerRef = useRef<L.GeoJSON | null>(null);
  const rasterCanvasOverlayRef = useRef<L.ImageOverlay | null>(null);
  const impactSpatialLayerRef = useRef<L.GeoJSON | null>(null);
  const incidentsLayerRef = useRef<L.LayerGroup | null>(null);
  const facilitiesLayerRef = useRef<L.LayerGroup | null>(null);
  const investLayerRef = useRef<L.LayerGroup | null>(null);
  const customUploadedLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const buildingsLayerRef = useRef<L.LayerGroup | null>(null);
  const loadedBuildingChunksRef = useRef<Set<string>>(new Set());

  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number }>({
    lat: -6.81482,
    lng: 107.60851,
  });
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [basemapStyle, setBasemapStyle] = useState<'google_hybrid' | 'google_satellite' | 'osm' | 'positron' | 'esri_satellite'>('positron');
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [internalGroupingMode, setInternalGroupingMode] = useState<string>('Kecamatan');
  const groupingMode = controlledGroupingMode || internalGroupingMode;
  const setGroupingMode = (mode: string) => {
    if (onChangeGroupingMode) {
      onChangeGroupingMode(mode);
    } else {
      setInternalGroupingMode(mode);
    }
  };
  const [isPlayingTimelapse, setIsPlayingTimelapse] = useState<boolean>(false);
  const [isTimelineVisible, setIsTimelineVisible] = useState<boolean>(true);
  const [isMapLocked, setIsMapLocked] = useState<boolean>(false);
  const [polaRuangGeoJson, setPolaRuangGeoJson] = useState<any>(null);

  // Fetch Full Pola Ruang RTRW GeoJSON (14 authentic zones of Banjarnegara)
  useEffect(() => {
    if (!showPolaRuang || polaRuangGeoJson) return;
    fetch('/data/polaRuangGeo.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setPolaRuangGeoJson(data);
      })
      .catch((err) => {
        console.error('Failed to load Pola Ruang GeoJSON:', err);
      });
  }, [showPolaRuang, polaRuangGeoJson]);

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

  // Handle Map Panning Lock / Unlock (strictly controls map movement only)
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    if (isMapLocked) {
      map.dragging.disable();
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      if ((map as any).tap) (map as any).tap.disable();
    } else {
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
      if ((map as any).tap) (map as any).tap.enable();
    }
  }, [isMapLocked]);

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

    // Debounced ResizeObserver to prevent thrashing map tiles on frame transitions
    let resizeObserver: ResizeObserver | null = null;
    let resizeTimer: any = null;
    if (mapRef.current && window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        if (resizeTimer) clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          map.invalidateSize();
        }, 150);
      });
      resizeObserver.observe(mapRef.current);
    }

    return () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      if (resizeObserver) resizeObserver.disconnect();
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

  // Render Admin Vector Layer (Kecamatan - 20 Subdistricts)
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
      geojsonLayerRef.current = null;
    }

    if (!showAdminBoundaries) return;

    // Show kecamatan layer if groupingMode is 'Kecamatan', 'Kecamatan & Desa', or if a district is selected in 'Desa' mode
    const shouldRenderKecamatan = groupingMode === 'Kecamatan' || groupingMode === 'Kecamatan & Desa' || (groupingMode === 'Desa' && Boolean(selectedDistrict));
    if (!shouldRenderKecamatan) return;

    const layer = L.geoJSON(adminBoundaries as any, {
      style: (feature) => {
        const isSelected = selectedDistrict && selectedDistrict.id === feature?.id;
        const isDesaMode = groupingMode === 'Desa';
        return {
          color: isSelected ? '#059669' : isDesaMode ? '#94a3b8' : '#475569',
          weight: isSelected ? 2.5 : isDesaMode ? 1 : 1.2,
          opacity: isSelected ? 1.0 : isDesaMode ? 0.4 : 0.75,
          fillColor: 'transparent',
          fillOpacity: 0,
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

        polygonLayer.on('click', (e: any) => {
          if (isPickingOnMap && onMapClickSelect) {
            onMapClickSelect(e.latlng.lat, e.latlng.lng);
            return;
          }
          L.DomEvent.stopPropagation(e);
          onSelectDistrict(feature as AdminFeature);
          if (onSelectVillage) onSelectVillage(null);

          // Zoom to polygon bounds
          if (polygonLayer instanceof L.Polygon) {
            map.fitBounds(polygonLayer.getBounds(), { padding: [50, 50], maxZoom: 11 });
          }
        });
      },
    }).addTo(map);

    geojsonLayerRef.current = layer;
  }, [adminBoundaries, selectedDistrict, showAdminBoundaries, groupingMode, onSelectDistrict, onSelectVillage, isPickingOnMap, onMapClickSelect]);

  // Render Desa Vector Layer (276 Desa in Banjarnegara)
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    if (desaLayerRef.current) {
      map.removeLayer(desaLayerRef.current);
      desaLayerRef.current = null;
    }

    if (!showAdminBoundaries) return;

    // Check if Desa layer should be rendered (strictly disabled in 'Kecamatan' mode)
    const isDesaMode = groupingMode === 'Desa';
    const isCombinedMode = groupingMode === 'Kecamatan & Desa';

    if (!isDesaMode && !isCombinedMode) {
      return;
    }

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
          color: isSelected ? '#059669' : '#475569',
          weight: isSelected ? 2.5 : 1,
          opacity: isSelected ? 1.0 : 0.65,
          fillColor: 'transparent',
          fillOpacity: 0,
          dashArray: '2, 2',
        };
      },
      onEachFeature: (feature: any, polygonLayer: L.Layer) => {
        const props = feature.properties;
        polygonLayer.bindTooltip(
          `
          <div class="p-1.5 font-sans">
            <div class="font-bold text-slate-800 text-xs">${props.name}</div>
            <div class="text-[10px] text-slate-500 font-mono">${props.subdistrict} • ${props.district}</div>
            <div class="text-[9px] text-emerald-700 font-mono">Luas: ${props.total_area_ha?.toLocaleString()} Ha ${props.population ? `• ${props.population.toLocaleString()} Jiwa` : ''}</div>
          </div>
          `,
          { sticky: true, direction: 'top' }
        );

        polygonLayer.bindPopup(
          `
          <div class="p-2.5 font-sans w-64 max-w-[280px] text-slate-800 bg-white/95 rounded-xl border border-slate-200 shadow-xl backdrop-blur">
            <div class="flex items-center justify-between gap-1 mb-1.5 pb-1 border-b border-slate-100">
              <span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                ${props.code || 'Batas Desa'}
              </span>
              <span class="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">${props.subdistrict}</span>
            </div>
            <h4 class="font-bold text-xs text-slate-900 mb-1 leading-snug">${props.name}</h4>
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-2 space-y-1 text-[10px]">
              <div class="flex justify-between border-b border-slate-200 pb-1">
                <span class="text-slate-500 font-mono">Luas Wilayah:</span>
                <span class="font-bold text-slate-800 font-mono">${props.total_area_ha?.toLocaleString() || '-'} Ha</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 font-mono">Populasi Desa:</span>
                <span class="font-medium text-slate-700 font-mono">${(props.population || 0).toLocaleString()} jiwa</span>
              </div>
            </div>
            <div class="text-[9px] text-emerald-700 font-medium">
              Batas Administrasi Desa / Kelurahan
            </div>
          </div>
          `,
          { closeButton: true }
        );

        polygonLayer.on('click', (e: any) => {
          if (isPickingOnMap && onMapClickSelect) {
            onMapClickSelect(e.latlng.lat, e.latlng.lng);
            return;
          }
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
  }, [selectedDistrict, selectedVillage, showAdminBoundaries, groupingMode, onSelectVillage, isPickingOnMap, onMapClickSelect]);

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

    const dataToRender = polaRuangGeoJson || (POLA_RUANG_DATA?.features?.length > 0 ? POLA_RUANG_DATA : null);
    if (!dataToRender) return;

    const layer = L.geoJSON(dataToRender as any, {
      style: (feature) => {
        const color = feature?.properties?.color || '#0d9488';
        return {
          color: color,
          weight: 1.5,
          opacity: 0.9,
          fillColor: color,
          fillOpacity: 0.28,
        };
      },
      onEachFeature: (feature, polygonLayer) => {
        const props = feature.properties || {};
        const isLindung = props.kategori_utama === 'Kawasan Lindung' || props.kategori_utama?.includes('Lindung');
        const isBadanAir = props.kategori_utama === 'Badan Air';
        const badgeColorClass = isLindung 
          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
          : isBadanAir
          ? 'bg-sky-50 text-sky-800 border-sky-200'
          : 'bg-purple-50 text-purple-800 border-purple-200';

        polygonLayer.bindTooltip(
          `
          <div class="p-1 font-sans">
            <div class="font-bold text-slate-800 text-xs">${props.kode_zona || 'ZONA'} - ${props.nama_zona}</div>
            <div class="text-[10px] text-teal-700 font-mono">${props.kategori_utama || 'RTRW'} • ${(props.luas_ha || 0).toLocaleString()} ha</div>
          </div>
          `,
          { sticky: true, direction: 'top' }
        );

        polygonLayer.bindPopup(
          `
          <div class="p-2.5 font-sans w-72 max-w-[290px] text-slate-800 bg-white/95 rounded-xl border border-slate-200 shadow-xl backdrop-blur">
            <div class="flex items-center justify-between gap-1 mb-2 pb-1.5 border-b border-slate-100">
              <span class="px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase tracking-wider border ${badgeColorClass}">
                ${props.kode_zona || 'RTRW'} • ${props.kategori_utama || 'Pola Ruang'}
              </span>
              <span class="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">${props.id_pola_ruang || 'PR'}</span>
            </div>

            <h4 class="font-bold text-xs text-slate-900 mb-2 leading-snug">${props.nama_zona}</h4>

            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-2 space-y-1 text-[10px]">
              <div class="flex justify-between border-b border-slate-200 pb-1">
                <span class="text-slate-500 font-mono">Kab/Kota:</span>
                <span class="font-semibold text-slate-800">${props.kabupaten_kota || 'Kabupaten Banjarnegara'}</span>
              </div>
              <div class="flex justify-between border-b border-slate-200 pb-1">
                <span class="text-slate-500 font-mono">Luas Area:</span>
                <span class="font-semibold text-teal-700 font-mono">${(props.luas_ha || 0).toLocaleString()} Ha</span>
              </div>
              <div class="flex justify-between pt-0.5">
                <span class="text-slate-500 font-mono">Sub-Zona:</span>
                <span class="font-medium text-slate-700 text-right shrink-0 max-w-[150px] truncate">${props.sub_zona_pola_ruang || props.nama_zona}</span>
              </div>
            </div>

            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-2 space-y-1">
              <div class="text-[8px] font-mono font-bold uppercase tracking-wider text-teal-700">
                Pedoman Zonasi Pola Ruang
              </div>
              <p class="text-[10px] text-slate-700 leading-snug font-sans">${props.pedoman_zonasi || props.ketentuan_kkpr || 'Mengikuti pedoman pola ruang Kabupaten Banjarnegara.'}</p>
            </div>

            <div class="flex items-center justify-between pt-1 border-t border-slate-100 text-[9px] font-mono">
              <span class="text-slate-500">Status: <strong class="text-amber-700">${props.status_konservasi || 'Zonasi RTRW'}</strong></span>
            </div>
          </div>
          `,
          { closeButton: true }
        );

        polygonLayer.on('click', (e: any) => {
          if (isPickingOnMap && onMapClickSelect) {
            onMapClickSelect(e.latlng.lat, e.latlng.lng);
            return;
          }
          L.DomEvent.stopPropagation(e);
          if (polygonLayer instanceof L.Polygon) {
            map.fitBounds(polygonLayer.getBounds(), { padding: [40, 40], maxZoom: 12 });
          }
        });
      },
    }).addTo(map);

    polaRuangLayerRef.current = layer;
  }, [showPolaRuang, polaRuangGeoJson, isPickingOnMap, onMapClickSelect]);

  // Render Village-Scoped Building Footprints (<50 KB per village, Instant Load <50ms)
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    if (buildingsLayerRef.current) {
      map.removeLayer(buildingsLayerRef.current);
      buildingsLayerRef.current = null;
    }

    if (!showBuildings || !selectedVillage) return;

    const layerGroup = L.layerGroup().addTo(map);
    buildingsLayerRef.current = layerGroup;

    let isCancelled = false;
    if (onBuildingsLoadingChange) onBuildingsLoadingChange(true);

    const cleanDesa = selectedVillage.toLowerCase().replace(/^(desa|kelurahan)\s+/i, '').trim();
    const cleanKec = selectedDistrict?.properties?.name?.toLowerCase().replace(/^(kecamatan|kabupaten)\s+/i, '').trim() || '';

    const loadVillageBuildings = async () => {
      try {
        const idxRes = await fetch('/data/villageBuildingsIndex.json');
        if (!idxRes.ok) throw new Error('Failed to load index');
        const indexData = await idxRes.json();

        let targetFileName = '';
        for (const [key, item] of Object.entries(indexData as Record<string, any>)) {
          const dName = item.desa.toLowerCase();
          const kName = item.kecamatan.toLowerCase();
          if (dName === cleanDesa && (!cleanKec || kName.includes(cleanKec) || cleanKec.includes(kName))) {
            targetFileName = item.fileName;
            break;
          }
        }

        if (!targetFileName) {
          for (const [key, item] of Object.entries(indexData as Record<string, any>)) {
            if (item.desa.toLowerCase() === cleanDesa) {
              targetFileName = item.fileName;
              break;
            }
          }
        }

        if (!targetFileName || isCancelled) {
          if (onBuildingsLoadingChange) onBuildingsLoadingChange(false);
          return;
        }

        const bldgRes = await fetch(`/data/buildings_by_village/${targetFileName}`);
        if (!bldgRes.ok || isCancelled) {
          if (onBuildingsLoadingChange) onBuildingsLoadingChange(false);
          return;
        }

        const bldgGeoJson = await bldgRes.json();
        if (isCancelled || !buildingsLayerRef.current) return;

        const geoLayer = L.geoJSON(bldgGeoJson, {
          style: (feat: any) => {
            const risk = feat?.properties?.risk || 'Rendah';
            const color = risk === 'Tinggi' ? '#ef4444' : risk === 'Sedang' ? '#f59e0b' : '#10b981';
            return {
              fillColor: color,
              fillOpacity: 0.75,
              color: color,
              weight: 1.5,
              opacity: 1.0,
            };
          },
          onEachFeature: (feat: any, polyLayer: any) => {
            const props = feat?.properties || {};
            const risk = props.risk || 'Rendah';
            const badgeBg = risk === 'Tinggi' ? 'bg-rose-100 text-rose-800 border-rose-300' : risk === 'Sedang' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300';

            polyLayer.bindTooltip(
              `<div class="p-1 text-xs font-sans">
                <b>Tapak Bangunan</b> • ${props.area_m2 || 0} m²
                <div class="text-[10px] font-mono mt-0.5">Risiko: <span class="font-bold">${risk}</span></div>
              </div>`,
              { sticky: true }
            );

            polyLayer.bindPopup(`
              <div class="p-3 font-sans w-56 text-slate-800 bg-white rounded-xl border border-slate-200 shadow-xl">
                <div class="flex items-center justify-between gap-1 mb-2 pb-1 border-b border-slate-100">
                  <span class="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeBg}">
                    ZONA ${risk.toUpperCase()}
                  </span>
                  <span class="text-[9px] font-mono text-slate-400">ID: ${(props.id || '').slice(-6)}</span>
                </div>
                <div class="space-y-1 text-xs">
                  <div class="flex justify-between">
                    <span class="text-slate-500 text-[11px]">Luas Tapak:</span>
                    <strong class="font-mono text-emerald-700">${props.area_m2 || 0} m²</strong>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-slate-500 text-[11px]">Tingkat Risiko:</span>
                    <strong class="${risk === 'Tinggi' ? 'text-rose-600' : risk === 'Sedang' ? 'text-amber-600' : 'text-emerald-600'}">${risk}</strong>
                  </div>
                  ${props.plus_code ? `
                  <div class="pt-1 border-t border-slate-100 text-[10px] font-mono text-slate-500">
                    Plus Code: <span class="text-slate-700 font-bold">${props.plus_code}</span>
                  </div>` : ''}
                </div>
              </div>
            `);
          }
        }).addTo(buildingsLayerRef.current);

        if (geoLayer.getBounds().isValid()) {
          map.fitBounds(geoLayer.getBounds(), { padding: [30, 30], maxZoom: 16 });
        }
      } catch (err) {
        console.error('Error loading village buildings:', err);
      } finally {
        if (onBuildingsLoadingChange) onBuildingsLoadingChange(false);
      }
    };

    loadVillageBuildings();

    return () => {
      isCancelled = true;
      if (buildingsLayerRef.current) {
        map.removeLayer(buildingsLayerRef.current);
        buildingsLayerRef.current = null;
      }
      if (onBuildingsLoadingChange) onBuildingsLoadingChange(false);
    };
  }, [showBuildings, selectedVillage, selectedDistrict]);

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
    const overlayClass = hazardRenderMode === 'index' ? 'smooth-raster-overlay-index' : 'smooth-raster-overlay-class';

    const overlay = L.imageOverlay(overlayUrl, bounds, {
      opacity: opacity,
      interactive: false,
      className: overlayClass,
    }).addTo(map);

    const applySmoothing = (el: HTMLElement) => {
      el.style.imageRendering = 'smooth';
      (el.style as any).msInterpolationMode = 'bicubic';
      if (hazardRenderMode === 'index') {
        el.style.filter = 'blur(0.4px) contrast(1.08) saturate(1.15)';
      } else {
        el.style.filter = 'contrast(1.05) saturate(1.1)';
      }
    };

    overlay.on('load', () => {
      const el = overlay.getElement();
      if (el) applySmoothing(el);
    });

    const imgEl = overlay.getElement();
    if (imgEl) {
      applySmoothing(imgEl);
    }

    rasterCanvasOverlayRef.current = overlay;
  }, [selectedHazard, opacity, showHazardLayer, hazardRenderMode]);

  // Render Real Spatial Impact Hazard Polygons (from QGIS Dasymetric GeoJSON)
  useEffect(() => {
    if (!leafletMap.current) return;
    const map = leafletMap.current;

    if (impactSpatialLayerRef.current) {
      map.removeLayer(impactSpatialLayerRef.current);
      impactSpatialLayerRef.current = null;
    }

    if (!showImpactOverlay) return;

    const geoUrl = 
      selectedHazard === 'flood'
        ? '/data/floodImpactGeo.json'
        : selectedHazard === 'landslide'
        ? '/data/landslideImpactGeo.json'
        : null;

    if (!geoUrl) return;

    let isMounted = true;

    const renderGeoLayer = (geoData: any) => {
      if (!isMounted || !leafletMap.current) return;

      const layer = L.geoJSON(geoData, {
        style: (feature: any) => {
          const props = feature?.properties || {};
          const isCurrentVillage = selectedVillage && props.NAMA_DESA &&
            props.NAMA_DESA.toLowerCase().replace(/^(desa|kelurahan)\s+/, '') === selectedVillage.toLowerCase().replace(/^(desa|kelurahan)\s+/, '');

          return {
            fillColor: 'transparent',
            fillOpacity: 0,
            color: isCurrentVillage ? '#ffffff' : 'transparent',
            weight: isCurrentVillage ? 2.5 : 0,
            opacity: isCurrentVillage ? 1.0 : 0,
          };
        },
        onEachFeature: (feature: any, polyLayer: L.Layer) => {
          const props = feature?.properties || {};
          const kls = props.KLS_BENC || 'Rendah';
          const isTinggi = kls === 'Tinggi' || kls.toLowerCase() === 'tinggi';
          const isSedang = kls === 'Sedang' || kls.toLowerCase() === 'sedang';
          const badgeBg = isTinggi ? 'bg-rose-100 text-rose-800 border-rose-300' : isSedang ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300';
          const badgeDot = isTinggi ? 'bg-rose-500' : isSedang ? 'bg-amber-500' : 'bg-emerald-500';

          polyLayer.bindTooltip(
            `
            <div class="p-1 font-sans text-xs">
              <div class="font-bold text-slate-900">${props.NAMA_DESA || 'Desa'} <span class="text-[10px] text-slate-500 font-mono">(${props.NAMA_KEC || 'Kecamatan'})</span></div>
              <div class="flex items-center gap-1 mt-0.5 text-[10px] font-mono">
                <span class="inline-block w-2 h-2 rounded-full ${badgeDot}"></span>
                <span class="font-bold">Kelas ${kls}</span> • <span>${Number(props.LUAS_HA || 0).toFixed(2)} Ha</span>
              </div>
              <div class="text-[10px] text-emerald-700 font-mono mt-0.5">
                Populasi Terpapar: <b>${(props.JML_JIWA || 0).toLocaleString()} jiwa</b>
              </div>
            </div>
            `,
            { sticky: true }
          );

          polyLayer.bindPopup(
            `
            <div class="p-2.5 font-sans w-64 max-w-[270px] text-slate-800 bg-white/95 rounded-xl border border-slate-200 shadow-xl backdrop-blur">
              <div class="flex items-center justify-between gap-1 mb-2 pb-1 border-b border-slate-100">
                <span class="px-2 py-0.5 text-[9px] font-mono font-bold rounded uppercase tracking-wider border ${badgeBg}">
                  ${kls.toUpperCase()} • ZONA BAHAYA
                </span>
                <span class="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">${selectedHazard.toUpperCase()}</span>
              </div>

              <h4 class="font-bold text-xs text-slate-900 mb-1 leading-snug">Desa ${props.NAMA_DESA || '-'}</h4>
              <p class="text-[10px] text-slate-500 font-mono mb-2">Kecamatan ${props.NAMA_KEC || '-'} • Banjarnegara</p>

              <div class="bg-slate-50 p-2 rounded-lg border border-slate-200/80 mb-2 space-y-1 text-[10px] font-mono">
                <div class="flex justify-between">
                  <span class="text-slate-500">Luas Zona Ini:</span>
                  <span class="font-bold text-slate-900">${Number(props.LUAS_HA || 0).toFixed(2)} Ha</span>
                </div>
                <div class="flex justify-between border-t border-slate-200 pt-1">
                  <span class="text-slate-500">Penduduk Terpapar:</span>
                  <span class="font-bold text-emerald-800">${(props.JML_JIWA || 0).toLocaleString()} Jiwa</span>
                </div>
              </div>

              <div class="text-[9px] text-slate-500 leading-tight italic">
                Data spasial hasil pemodelan dasimetrik Open Buildings v3 & raster risiko QGIS.
              </div>
            </div>
            `,
            { className: 'custom-leaflet-popup' }
          );

          polyLayer.on('click', (e: any) => {
            if (isPickingOnMap && onMapClickSelect) {
              onMapClickSelect(e.latlng.lat, e.latlng.lng);
              return;
            }
            L.DomEvent.stopPropagation(e);
            if (groupingMode === 'Kecamatan') {
              if (props.NAMA_KEC) {
                const kecClean = props.NAMA_KEC.toLowerCase().replace(/^(kecamatan|kec)\s+/, '').trim();
                const matchedKec = adminBoundaries.features.find((d: any) => {
                  const dNameClean = d.properties.name.toLowerCase().replace(/^(kecamatan|kec)\s+/, '').trim();
                  return dNameClean.includes(kecClean) || kecClean.includes(dNameClean);
                });
                if (matchedKec) {
                  onSelectDistrict(matchedKec);
                }
              }
              if (onSelectVillage) {
                onSelectVillage(null);
              }
            } else {
              if (onSelectVillage && props.NAMA_DESA) {
                onSelectVillage(props.NAMA_DESA);
              }
            }
          });
        },
      }).addTo(map);

      impactSpatialLayerRef.current = layer;
    };

    if (geoJsonCache[geoUrl]) {
      renderGeoLayer(geoJsonCache[geoUrl]);
    } else {
      fetch(geoUrl)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          return res.json();
        })
        .then((geoData) => {
          geoJsonCache[geoUrl] = geoData;
          renderGeoLayer(geoData);
        })
        .catch((err) => {
          console.warn('Could not load spatial impact GeoJSON:', err);
        });
    }

    return () => {
      isMounted = false;
      if (impactSpatialLayerRef.current && leafletMap.current) {
        leafletMap.current.removeLayer(impactSpatialLayerRef.current);
        impactSpatialLayerRef.current = null;
      }
    };
  }, [selectedHazard, showImpactOverlay, selectedVillage, groupingMode, adminBoundaries, onSelectDistrict, onSelectVillage, isPickingOnMap, onMapClickSelect]);

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
        <div class="text-[10px] text-emerald-700 font-mono font-bold uppercase">EVALUASI RISIKO TAPAK</div>
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

    // Automatically open popup marker
    marker.openPopup();

    // Only pan map if point is outside current viewport to prevent disorienting jumps/shifts
    const currentBounds = map.getBounds();
    const pinLatLng = L.latLng(lat, lng);

    if (!currentBounds.contains(pinLatLng)) {
      map.panTo([lat, lng], { animate: true, duration: 1.0 });
    }
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
    <div className={`relative flex-1 h-[calc(100vh-3.5rem)] bg-slate-100 overflow-hidden ${isMapLocked ? 'map-locked' : ''}`}>
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

      {/* Floating Guidance Banner when Building Layer is active but no village is selected */}
      {showBuildings && !selectedVillage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-slate-900/90 backdrop-blur-md text-white text-xs px-4 py-2 rounded-2xl shadow-xl border border-white/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-auto max-w-[90vw] text-center">
          <Home className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
          <span><strong>Mode Tapak Bangunan Aktif:</strong> Klik salah satu desa di peta atau pilih dari sidebar untuk memuat poligon bangunan.</span>
        </div>
      )}

      {/* Floating Top Controls & Legend Bar (Top-Right Aligned) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
        {/* Single Integrated Top Right Controls Bar */}
        <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-1.5 shadow-xl flex items-center gap-1.5 backdrop-blur-md pointer-events-auto shrink-0 max-w-full overflow-x-auto scrollbar-none">
          {/* Dropdown: Basemap Selection */}
          <div className="relative flex items-center">
            <Map className="w-3.5 h-3.5 text-emerald-600 absolute left-2 pointer-events-none" />
            <select
              value={basemapStyle}
              onChange={(e) => setBasemapStyle(e.target.value as any)}
              className="bg-transparent text-slate-800 text-xs rounded-xl pl-7 pr-6 py-1 focus:outline-none font-bold cursor-pointer appearance-none border-0"
              title="Pilih Gaya Peta Dasaran (Basemap)"
            >
              <option value="positron">Positron (Light)</option>
              <option value="google_hybrid">Satellite (Hybrid)</option>
              <option value="google_satellite">Satellite (Pure)</option>
              <option value="osm">OpenStreetMap</option>
              <option value="esri_satellite">Esri Satellite</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
          </div>

          <div className="h-4 w-px bg-slate-200 shrink-0" />

          {/* Dropdown: Kelompokkan berdasar... */}
          <div className="relative flex items-center">
            <select
              value={groupingMode}
              onChange={(e) => setGroupingMode(e.target.value)}
              className="bg-transparent text-slate-800 text-xs rounded-xl pl-2 pr-6 py-1 focus:outline-none font-bold cursor-pointer appearance-none border-0"
              title="Kelompokkan Batas Wilayah Peta"
            >
              <option value="Kecamatan">Zone: Kecamatan (20 Wilayah)</option>
              <option value="Desa">Zone: Batas Desa (276 Desa)</option>
              <option value="Kecamatan & Desa">Zone: Gabungan (Kec &amp; Desa)</option>
              <option value="DAS" disabled className="text-slate-400">Zone: DAS (Sungai) - Segera</option>
              <option value="Kelas Risk" disabled className="text-slate-400">Zone: Kelas Risiko - Segera</option>
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
          </div>

          <div className="h-4 w-px bg-slate-200 shrink-0" />

          {/* Quick Reset View Button */}
          <button
            onClick={onResetView}
            className="p-1 text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/80 rounded-xl transition-colors flex items-center gap-1 text-xs px-2 font-semibold cursor-pointer shrink-0"
            title="Reset Peta ke Tampilan Kabupaten Banjarnegara"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline font-mono text-[11px]">Reset</span>
          </button>

          <div className="h-4 w-px bg-slate-200 shrink-0" />

          {/* Lock / Unlock Map Panning Button */}
          <button
            onClick={() => setIsMapLocked(!isMapLocked)}
            className={`p-1 rounded-xl transition-all flex items-center gap-1.5 text-xs px-2.5 font-semibold cursor-pointer shrink-0 ${
              isMapLocked
                ? 'bg-rose-50 border border-rose-300 text-rose-700 hover:bg-rose-100 shadow-xs'
                : 'bg-emerald-50/50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-800'
            }`}
            title={isMapLocked ? 'Peta Terkunci (Klik untuk membuka kunci agar peta bisa digeser)' : 'Peta Bebas Digeser (Klik untuk mengunci posisi peta)'}
          >
            {isMapLocked ? (
              <>
                <Lock className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                <span className="font-mono text-[11px] font-bold text-rose-700">Terkunci</span>
              </>
            ) : (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-mono text-[11px] font-medium text-emerald-800">Bebas</span>
              </>
            )}
          </button>

          {/* Fullscreen Button */}
          {onToggleFullscreen && (
            <button
              onClick={onToggleFullscreen}
              className={`p-1 rounded-xl transition-all flex items-center gap-1 text-xs px-2 font-semibold cursor-pointer shrink-0 ${
                isFullscreen
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                  : 'text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/80'
              }`}
              title={isFullscreen ? 'Keluar Mode Fullscreen Peta (Tekan Esc)' : 'Tampilkan Peta Layar Penuh (Fullscreen)'}
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline font-mono text-[11px]">Keluar</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline font-mono text-[11px]">Fullscreen</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Legenda Hazard Box / Floating Compact Trigger */}
        {!showLegend ? (
          <button
            onClick={() => setShowLegend(true)}
            className="bg-white/95 hover:bg-emerald-50/90 border border-slate-200/90 hover:border-emerald-300 rounded-2xl shadow-xl px-3 py-1.5 flex items-center gap-2 backdrop-blur-md pointer-events-auto transition-all group cursor-pointer animate-in fade-in duration-150"
            title="Tampilkan Legenda Risiko Bencana"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-800">Legenda</span>
            <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
          </button>
        ) : (
          <div className="bg-white/95 border border-slate-200/90 rounded-2xl shadow-xl p-3 w-60 backdrop-blur-md pointer-events-auto transition-all animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Legenda Risiko</span>
              </div>
              <button
                onClick={() => setShowLegend(false)}
                className="text-slate-400 hover:text-slate-700 text-xs p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                title="Sembunyikan Legenda"
              >
                <EyeOff className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 pt-2 text-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-emerald-700 font-mono">
                <span className="truncate max-w-[150px]">{HAZARD_LAYERS[selectedHazard].name}</span>
                <span className="text-[9px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                  {showHazardLayer ? (hazardRenderMode === 'class' ? 'Tingkat' : 'Indeks') : 'Mati'}
                </span>
              </div>

              {!showHazardLayer ? (
                <div className="py-2 px-2.5 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 italic text-center">
                  Layer Bahaya Bencana Non-aktif
                </div>
              ) : (
                <div className="space-y-2">
                  {/* Continuous Gradient Bar with Floating Scale Markers */}
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[9px] font-mono text-slate-500 font-bold px-0.5">
                      <span>0</span>
                      <span className="text-emerald-700">0.3</span>
                      <span className="text-amber-700">0.6</span>
                      <span className="text-rose-700">1.0</span>
                    </div>

                    <div
                      className="relative h-2.5 rounded-full border border-slate-200/90 shadow-inner overflow-hidden"
                      style={{
                        background: 'linear-gradient(to right, #15803d 0%, #84cc16 30%, #facc15 45%, #f97316 60%, #dc2626 100%)',
                      }}
                    >
                      <div className="absolute top-0 bottom-0 left-[30%] w-[1.5px] bg-white/80" />
                      <div className="absolute top-0 bottom-0 left-[60%] w-[1.5px] bg-white/80" />
                    </div>
                  </div>

                  {/* Seamless Category Pill Badges */}
                  <div className="grid grid-cols-3 gap-1 pt-0.5">
                    <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-lg py-1 px-0.5 text-center shadow-2xs">
                      <div className="text-[9px] font-extrabold text-emerald-800 tracking-tight">RENDAH</div>
                      <div className="text-[8px] font-mono text-emerald-600 font-medium">0 - 0.3</div>
                    </div>
                    <div className="bg-amber-50/80 border border-amber-200/90 rounded-lg py-1 px-0.5 text-center shadow-2xs">
                      <div className="text-[9px] font-extrabold text-amber-800 tracking-tight">SEDANG</div>
                      <div className="text-[8px] font-mono text-amber-600 font-medium">0.3 - 0.6</div>
                    </div>
                    <div className="bg-rose-50/80 border border-rose-200/90 rounded-lg py-1 px-0.5 text-center shadow-2xs">
                      <div className="text-[9px] font-extrabold text-rose-800 tracking-tight">TINGGI</div>
                      <div className="text-[8px] font-mono text-rose-600 font-medium">0.6 - 1.0</div>
                    </div>
                  </div>

                  {/* Spatial Impact Classes Layer Indicator / Toggle */}
                  {(selectedHazard === 'flood' || selectedHazard === 'landslide') && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-700 font-mono">
                        <span className={`w-2 h-2 rounded-full ${showImpactOverlay ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        <span className="font-semibold">Zona Poligon QGIS:</span>
                      </div>
                      <button
                        onClick={onToggleImpactOverlay}
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded transition-all cursor-pointer ${
                          showImpactOverlay
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                        }`}
                        title={showImpactOverlay ? 'Klik untuk mematikan overlay poligon zona bahaya' : 'Klik untuk menyalakan overlay poligon zona bahaya'}
                      >
                        {showImpactOverlay ? 'AKTIF' : 'NONAKTIF'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isMapLoading && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-xs z-30 flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xl flex items-center gap-3">
            <span className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
            <div className="text-xs">
              <div className="font-bold text-slate-800">Memproses data wilayah...</div>
              <div className="text-[10px] text-slate-500 font-mono">Menghitung statistik risiko bencana</div>
            </div>
          </div>
        </div>
      )}

      {/* Unified Single Bottom Control Dock Bar */}
      <div className="absolute bottom-36 md:bottom-4 left-3 md:left-4 right-3 md:right-auto z-20 flex items-center justify-start pointer-events-none">
        {isTimelineVisible ? (
          <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-2 shadow-xl flex flex-wrap items-center gap-2 backdrop-blur-md pointer-events-auto max-w-full">
            {/* Play / Pause Timelapse Button */}
            <button
              onClick={() => setIsPlayingTimelapse(!isPlayingTimelapse)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
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
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl shrink-0 font-mono">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-black text-emerald-800">{selectedYear}</span>
            </div>

            {/* Compact Slider */}
            <div className="flex items-center gap-1.5 px-1 shrink-0 w-36 sm:w-44 font-mono">
              <span className="text-[9px] font-bold text-slate-400 shrink-0">2018</span>
              <div className="flex-1 flex flex-col justify-center">
                <input
                  type="range"
                  min="2018"
                  max="2025"
                  step="1"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="custom-slider w-full cursor-pointer"
                />
                <div className="flex justify-between items-center px-1 mt-0.5 text-[7px] font-mono text-slate-400">
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
              <span className="text-[9px] font-bold text-slate-400 shrink-0">2025</span>
            </div>

            <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />

            {/* Incident Pins Toggle */}
            <button
              onClick={onToggleIncidents}
              className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 font-mono shrink-0 transition-colors cursor-pointer ${
                showIncidents && !showAllIncidentsMode
                  ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilkan / Sembunyikan Titik Kejadian Bencana Tahun Aktif"
            >
              <MapPin className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-[10px]">Titik ({selectedYear})</span>
            </button>

            {/* All Incidents Toggle */}
            <button
              onClick={() => {
                if (onToggleAllIncidentsMode) onToggleAllIncidentsMode();
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 font-mono shrink-0 transition-all cursor-pointer ${
                showAllIncidentsMode
                  ? 'bg-rose-50 border-rose-300 text-rose-800 font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
              title="Tampilkan / Sembunyikan Semua Kejadian Bencana (2018-2025)"
            >
              <Flame className={`w-3.5 h-3.5 ${showAllIncidentsMode ? 'text-orange-600 animate-pulse' : 'text-rose-600'}`} />
              <span className="text-[10px]">Semua ({DISASTER_INCIDENTS.length})</span>
            </button>

            {/* Rekap Modal Button */}
            {onOpenAllIncidentsModal && (
              <button
                onClick={onOpenAllIncidentsModal}
                className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-amber-700 transition-colors flex items-center gap-1 text-[10px] font-mono shrink-0 cursor-pointer"
                title="Buka Rekapitulasi & Tabel Kejadian Bencana"
              >
                <ListFilter className="w-3.5 h-3.5 text-amber-600" />
              </button>
            )}

            <div className="h-4 w-px bg-slate-200 mx-0.5 hidden md:block" />

            {/* Integrated Scale Bar */}
            <div className="hidden lg:flex items-center gap-1.5 font-mono text-[10px] text-slate-500 pl-1">
              <span>Scale:</span>
              <div className="w-10 h-1 bg-slate-300 relative border-x border-slate-500">
                <span className="absolute -top-3 left-0 text-[8px] text-slate-600">0</span>
                <span className="absolute -top-3 right-0 text-[8px] text-slate-600">50km</span>
              </div>
            </div>

            {/* Integrated GPS Lat/Lon */}
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-600 pl-1">
              <Compass className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{mouseCoords.lat}, {mouseCoords.lng}</span>
            </div>

            {/* Hide Timeline Button */}
            <button
              onClick={() => setIsTimelineVisible(false)}
              className="p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors shrink-0 cursor-pointer ml-auto"
              title="Sembunyikan Panel Kontrol"
            >
              <EyeOff className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsTimelineVisible(true)}
            className="bg-white/95 border border-slate-200 rounded-xl px-3 py-2 shadow-md flex items-center gap-2 text-xs font-mono text-emerald-700 hover:text-emerald-800 hover:bg-slate-50 transition-all backdrop-blur-md pointer-events-auto cursor-pointer"
            title="Tampilkan Panel Kontrol Bawah"
          >
            <Play className="w-3.5 h-3.5 fill-current text-emerald-600" />
            <span className="text-[11px] font-bold">Kontrol Peta &amp; Timeline ({selectedYear})</span>
            <Eye className="w-3.5 h-3.5 text-slate-400 ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};

export const MapContainer = React.memo(MapContainerComponent);
