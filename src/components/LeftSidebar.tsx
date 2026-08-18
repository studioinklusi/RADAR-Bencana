import React, { useState, useEffect } from 'react';
import { ChatMessageRenderer } from './ChatMessageRenderer';
import { POLA_RUANG_ZONES } from '../data/mockPolaRuang';
import { 
  Flame, 
  Waves, 
  Mountain, 
  CloudRain, 
  Activity,
  Zap,
  Info, 
  ChevronRight, 
  ChevronDown, 
  Sliders, 
  Sparkles, 
  Bot,
  Download, 
  Layers, 
  CheckCircle2,
  FileCode,
  MapPin,
  Building2,
  Hospital,
  Briefcase,
  Compass,
  Search,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Shield,
  Siren,
  School,
  Church,
  Package,
  Trophy,
  Send,
  MessageSquare,
  User,
  Maximize2,
  Minimize2,
  X,
  Lock,
  Unlock,
  LogIn,
  ShieldCheck
} from 'lucide-react';
import { HazardType, FacilityCategory, FacilitySubType, RadarInvestInput, RadarInvestResult, ChatMessage, AdminFeature, ZonalStatistics } from '../types';
import { HAZARD_LAYERS } from '../data/hazardLayers';

interface LeftSidebarProps {
  selectedHazard: HazardType;
  onSelectHazard: (hazard: HazardType) => void;
  showHazardLayer?: boolean;
  onToggleHazardLayer?: () => void;
  hazardRenderMode?: 'class' | 'index';
  onChangeHazardRenderMode?: (mode: 'class' | 'index') => void;
  opacity: number;
  onChangeOpacity: (val: number) => void;
  showAdminBoundaries: boolean;
  onToggleAdminBoundaries: () => void;
  showPolaRuang: boolean;
  onTogglePolaRuang: () => void;
  isAdminLoggedIn?: boolean;
  onRequireLogin?: () => void;
  showIncidents: boolean;
  onToggleIncidents: () => void;
  selectedIncidentHazards: HazardType[];
  onToggleIncidentHazard: (hazard: HazardType) => void;
  showFacilities: boolean;
  onToggleFacilities: () => void;
  selectedFacilityCategories: FacilityCategory[];
  onToggleFacilityCategory: (category: FacilityCategory) => void;
  selectedFacilitySubTypes: FacilitySubType[];
  onToggleFacilitySubType: (subType: FacilitySubType) => void;
  onRequestAiAnalysis: () => void;
  onExportData: () => void;
  isAiLoading: boolean;
  radarInvestResult?: RadarInvestResult | null;
  onRunRadarInvest?: (input: RadarInvestInput) => void;
  onClearRadarInvest?: () => void;
  isPickingOnMap?: boolean;
  onTogglePickOnMap?: () => void;
  pickedLocation?: { lat: number; lng: number } | null;
  selectedDistrict?: AdminFeature | null;
  stats?: ZonalStatistics | null;
  chatMessages?: ChatMessage[];
  inputChatText?: string;
  onChangeInputChatText?: (text: string) => void;
  onSendChatMessage?: (textToSend?: string) => void;
  isChatSending?: boolean;
  onOpenMaximizedChat?: () => void;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  selectedDistrict,
  stats,
  selectedHazard,
  onSelectHazard,
  showHazardLayer = true,
  onToggleHazardLayer,
  hazardRenderMode = 'class',
  onChangeHazardRenderMode,
  opacity,
  onChangeOpacity,
  showAdminBoundaries,
  onToggleAdminBoundaries,
  showPolaRuang,
  onTogglePolaRuang,
  isAdminLoggedIn = false,
  onRequireLogin,
  showIncidents,
  onToggleIncidents,
  selectedIncidentHazards,
  onToggleIncidentHazard,
  showFacilities,
  onToggleFacilities,
  selectedFacilityCategories,
  onToggleFacilityCategory,
  selectedFacilitySubTypes,
  onToggleFacilitySubType,
  onRequestAiAnalysis,
  onExportData,
  isAiLoading,
  radarInvestResult,
  onRunRadarInvest,
  onClearRadarInvest,
  isPickingOnMap = false,
  onTogglePickOnMap,
  pickedLocation,
  chatMessages = [],
  inputChatText = '',
  onChangeInputChatText,
  onSendChatMessage,
  isChatSending = false,
  onOpenMaximizedChat,
}) => {
  const [activeTab, setActiveTab] = useState<'tema' | 'invest'>('tema');
  const [expandedSection, setExpandedSection] = useState<'wilayah' | 'polaruang' | 'hazard' | 'incidents' | 'facilities' | null>('polaruang');

  // Form state for Radar Invest (Default to Banjarnegara Pusat)
  const [investLat, setInvestLat] = useState<number>(-7.3970);
  const [investLng, setInvestLng] = useState<number>(109.6970);
  const [investPlotHa, setInvestPlotHa] = useState<number>(10);
  const [investSector, setInvestSector] = useState<string>('Manufaktur & Kawasan Industri');
  const [investProjectName, setInvestProjectName] = useState<string>('Rencana Proyek Usaha');

  const [isChatMinimized, setIsChatMinimized] = useState(false);

  // Update form values when user picks a point on map
  useEffect(() => {
    if (pickedLocation) {
      const latFixed = Number(pickedLocation.lat.toFixed(5));
      const lngFixed = Number(pickedLocation.lng.toFixed(5));
      setInvestLat(latFixed);
      setInvestLng(lngFixed);

      if (onRunRadarInvest) {
        onRunRadarInvest({
          lat: latFixed,
          lng: lngFixed,
          plotAreaHa: investPlotHa,
          sector: investSector,
          projectName: investProjectName,
        });
      }
    }
  }, [pickedLocation]);

  const handleApplyPreset = (lat: number, lng: number, ha: number, sec: string, name: string) => {
    setInvestLat(lat);
    setInvestLng(lng);
    setInvestPlotHa(ha);
    setInvestSector(sec);
    setInvestProjectName(name);
    if (onRunRadarInvest) {
      onRunRadarInvest({
        lat,
        lng,
        plotAreaHa: ha,
        sector: sec,
        projectName: name,
      });
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onRunRadarInvest) {
      onRunRadarInvest({
        lat: investLat,
        lng: investLng,
        plotAreaHa: investPlotHa,
        sector: investSector,
        projectName: investProjectName,
      });
    }
  };

  const hazardIcons: Record<HazardType, React.ReactNode> = {
    flood: <Waves className="w-4 h-4 text-blue-600" />,
    flashflood: <CloudRain className="w-4 h-4 text-cyan-600" />,
    landslide: <Mountain className="w-4 h-4 text-amber-600" />,
    earthquake: <Activity className="w-4 h-4 text-purple-600" />,
    liquefaction: <Zap className="w-4 h-4 text-rose-600" />,
  };

  return (
    <aside className="w-72 bg-white/95 backdrop-blur-md border-r border-slate-200 text-slate-800 flex flex-col h-[calc(100vh-3.5rem)] shrink-0 z-20 select-none shadow-sm">
      {/* Top Tab Switcher */}
      <div className="flex items-center border-b border-slate-200 p-1.5 bg-slate-50 gap-1">
        <button
          onClick={() => setActiveTab('tema')}
          className={`flex-1 py-1.5 px-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'tema'
              ? 'bg-white text-emerald-700 border border-slate-200 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Layer Peta</span>
        </button>
        <button
          onClick={() => setActiveTab('invest')}
          className={`flex-1 py-1.5 px-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 relative ${
            activeTab === 'invest'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
          <span>Radar Invest</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </button>
      </div>

      {/* Main Content Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'tema' ? (
          <>
            {/* Accordion 1: WILAYAH (Administrative Layer Toggle) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <button
                onClick={() => setExpandedSection(expandedSection === 'wilayah' ? null : 'wilayah')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 uppercase tracking-wider text-[11px] text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WILAYAH</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  {expandedSection === 'wilayah' ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {expandedSection === 'wilayah' && (
                <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
                  <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 transition-all shadow-xs">
                    <span className="text-xs text-slate-800 flex items-center gap-2 font-medium">
                      <input
                        type="checkbox"
                        checked={showAdminBoundaries}
                        onChange={onToggleAdminBoundaries}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Batas Wilayah</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      8 Kecamatan
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Klik pada wilayah di peta untuk melihat detail data risiko bencana secara spesifik.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 2: POLA RUANG RTRW (TATA RUANG) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <button
                onClick={() => setExpandedSection(expandedSection === 'polaruang' ? null : 'polaruang')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 uppercase tracking-wider text-[11px] text-slate-700">
                  <Compass className="w-3.5 h-3.5 text-teal-600" />
                  <span>POLA RUANG (RTRW)</span>
                  {isAdminLoggedIn ? (
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Lock className="w-3 h-3 text-amber-500" />
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {isAdminLoggedIn ? (
                    <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Admin
                    </span>
                  ) : (
                    <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Terkunci
                    </span>
                  )}
                  <span className={`w-2 h-2 rounded-full ${showPolaRuang && isAdminLoggedIn ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`}></span>
                  {expandedSection === 'polaruang' ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {expandedSection === 'polaruang' && (
                <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-3">
                  {/* Master Toggle or Locked Warning */}
                  {isAdminLoggedIn ? (
                    <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-teal-300 transition-all shadow-xs">
                      <span className="text-xs text-slate-800 flex items-center gap-2 font-medium">
                        <input
                          type="checkbox"
                          checked={showPolaRuang}
                          onChange={onTogglePolaRuang}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                        <span>Tampilkan Layer Pola Ruang</span>
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        showPolaRuang 
                          ? 'text-teal-700 bg-teal-50 border-teal-200'
                          : 'text-slate-500 bg-slate-100 border-slate-200'
                      }`}>
                        {showPolaRuang ? 'Aktif' : 'Non-Aktif'}
                      </span>
                    </label>
                  ) : (
                    <div className="p-3 bg-gradient-to-br from-amber-50/90 to-orange-50/60 rounded-xl border border-amber-200/90 text-xs space-y-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-amber-900 font-bold text-xs">
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Zonasi RTRW Terproteksi</span>
                        </div>
                        <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                          Data Terbatas
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-snug">
                        Layer Pola Ruang memuat zonasi RTRW &amp; ketentuan KKPR sensitif. Masuk sebagai administrator untuk mengaktifkannya di peta.
                      </p>
                      <button
                        onClick={onRequireLogin}
                        className="w-full py-1.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Login untuk Buka Akses</span>
                      </button>
                    </div>
                  )}

                  {/* Legenda Zonasi RTRW */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center justify-between">
                      <span>Legenda Pola Ruang RTRW ({POLA_RUANG_ZONES.length} Zonasi):</span>
                      <span className="text-[9px] text-teal-700 font-bold">116k Ha</span>
                    </div>

                    <div className="space-y-1 text-[11px] max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200">
                      {POLA_RUANG_ZONES.map((zone) => {
                        const isLindung = zone.kategori_utama === 'Kawasan Lindung' || zone.kategori_utama.includes('Lindung');
                        const isBadanAir = zone.kategori_utama === 'Badan Air';
                        const badgeStyle = isLindung
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                          : isBadanAir
                          ? 'text-sky-700 bg-sky-50 border-sky-200'
                          : 'text-purple-700 bg-purple-50 border-purple-200';

                        return (
                          <div key={zone.kode_zona} className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200 hover:border-teal-300 transition-colors">
                            <div className="flex items-center gap-1.5 min-w-0 pr-1">
                              <span
                                className="w-3 h-3 rounded-xs shrink-0 border border-black/10 shadow-2xs"
                                style={{ backgroundColor: zone.color }}
                              />
                              <div className="truncate">
                                <span className="text-slate-800 font-semibold text-[10.5px] block truncate" title={zone.nama_zona}>
                                  {zone.nama_zona}
                                </span>
                                <span className="text-[9px] text-slate-400 font-mono block">
                                  {zone.kode_zona} • {zone.luas_ha.toLocaleString()} Ha
                                </span>
                              </div>
                            </div>
                            <span className={`text-[8.5px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${badgeStyle}`}>
                              {zone.kategori_utama === 'Kawasan Lindung' ? 'Lindung' : zone.kategori_utama === 'Badan Air' ? 'Air' : 'Budi Daya'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-200 pt-2">
                    {isAdminLoggedIn
                      ? 'Klik pada zonasi Pola Ruang di peta untuk melihat detail batas RTRW, aturan KKPR Dinas PUPR, dan status konservasi.'
                      : 'Informasi zonasi Pola Ruang hanya dapat ditampilkan di atas peta setelah pengguna terautentikasi.'}
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 3: LAYER BAHAYA BENCANA (GEE / TIF) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <button
                onClick={() => setExpandedSection(expandedSection === 'hazard' ? null : 'hazard')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 uppercase tracking-wider text-[11px] text-slate-700">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>LAYER BAHAYA BENCANA</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${showHazardLayer ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`}></span>
                  {expandedSection === 'hazard' ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {expandedSection === 'hazard' && (
                <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-3">
                  {/* Master Toggle */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-amber-300 transition-all shadow-xs">
                    <span className="text-xs text-slate-800 flex items-center gap-2 font-medium">
                      <input
                        type="checkbox"
                        checked={showHazardLayer}
                        onChange={onToggleHazardLayer}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span>Tampilkan Layer Bahaya Bencana</span>
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      showHazardLayer 
                        ? 'text-amber-700 bg-amber-50 border-amber-200'
                        : 'text-slate-500 bg-slate-100 border-slate-200'
                    }`}>
                      {showHazardLayer ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </label>
                  {/* Sub-layer Selector Tabs: Kelas Bahaya vs Indeks Bahaya */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-slate-500 font-bold flex justify-between">
                      <span>Tampilan Peta:</span>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-[10px] font-mono font-bold">
                      <button
                        type="button"
                        onClick={() => onChangeHazardRenderMode && onChangeHazardRenderMode('class')}
                        className={`flex-1 py-1.5 px-2 rounded-md transition-all text-center flex items-center justify-center gap-1.5 ${
                          hazardRenderMode === 'class'
                            ? 'bg-white text-emerald-800 border border-slate-200 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Tingkat Bahaya (Kelas)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onChangeHazardRenderMode && onChangeHazardRenderMode('index')}
                        className={`flex-1 py-1.5 px-2 rounded-md transition-all text-center flex items-center justify-center gap-1.5 ${
                          hazardRenderMode === 'index'
                            ? 'bg-white text-amber-800 border border-slate-200 shadow-xs'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span>Indeks Bahaya (Kontinu)</span>
                      </button>
                    </div>
                  </div>

                  {/* List of Hazard Datasets */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">Pilihan Jenis Ancaman Bencana:</div>
                    {(Object.keys(HAZARD_LAYERS) as HazardType[]).map((key) => {
                      const layer = HAZARD_LAYERS[key];
                      const isSelected = selectedHazard === key;
                      return (
                        <div
                          key={key}
                          onClick={() => onSelectHazard(key)}
                          className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-emerald-50/70 border-emerald-400 shadow-xs ring-1 ring-emerald-400/30'
                              : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              {hazardIcons[key]}
                              <span className="text-xs font-bold text-slate-800">{layer.name}</span>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                          </div>
                          <p className="text-[10px] text-slate-500 line-clamp-2 leading-normal">
                            {layer.description}
                          </p>
                          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1.5 border-t border-slate-100">
                            <span>Satuan: {layer.unit}</span>
                            <span className="text-emerald-700 font-medium">
                              {hazardRenderMode === 'class' ? 'Rendah → Sedang → Tinggi' : 'Indeks 0.0 (rendah) - 1.0 (tinggi)'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 4: TITIK KEJADIAN BENCANA (DISASTER INCIDENTS LAYER) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <button
                onClick={() => setExpandedSection(expandedSection === 'incidents' ? null : 'incidents')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 uppercase tracking-wider text-[11px] text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-amber-600" />
                  <span>TITIK KEJADIAN BENCANA</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${showIncidents ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`}></span>
                  {expandedSection === 'incidents' ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {expandedSection === 'incidents' && (
                <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-3">
                  {/* Master Toggle */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-amber-300 transition-all shadow-xs">
                    <span className="text-xs text-slate-800 flex items-center gap-2 font-medium">
                      <input
                        type="checkbox"
                        checked={showIncidents}
                        onChange={onToggleIncidents}
                        className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span>Tampilkan Layer Titik Pin</span>
                    </span>
                    <span className="text-[10px] text-amber-700 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Aktif
                    </span>
                  </label>

                  {/* Filter Custom Jenis Bencana */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center justify-between">
                      <span>Filter Jenis Bencana:</span>
                      <span className="text-slate-500">{selectedIncidentHazards.length}/4 Dipilih</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      {[
                        { id: 'flood', label: 'Banjir', color: 'border-blue-300 text-blue-700 bg-blue-50', icon: <Waves className="w-3.5 h-3.5 text-blue-600 shrink-0" /> },
                        { id: 'landslide', label: 'Longsor', color: 'border-amber-300 text-amber-700 bg-amber-50', icon: <Mountain className="w-3.5 h-3.5 text-amber-600 shrink-0" /> },
                        { id: 'wildfire', label: 'Karhutla', color: 'border-orange-300 text-orange-700 bg-orange-50', icon: <Flame className="w-3.5 h-3.5 text-orange-600 shrink-0" /> },
                        { id: 'coastal', label: 'Gelombang', color: 'border-teal-300 text-teal-700 bg-teal-50', icon: <Waves className="w-3.5 h-3.5 text-teal-600 shrink-0" /> },
                      ].map((item) => {
                        const isChecked = selectedIncidentHazards.includes(item.id as HazardType);
                        return (
                          <button
                            key={item.id}
                            onClick={() => onToggleIncidentHazard(item.id as HazardType)}
                            className={`p-1.5 rounded-lg border text-left flex items-center gap-1.5 transition-all text-xs font-sans cursor-pointer ${
                              isChecked
                                ? `${item.color} font-bold shadow-xs`
                                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-800'
                            }`}
                          >
                            {item.icon}
                            <span className="text-[11px] truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-200 pt-2">
                    Saat timelapse diputar, tampilan kamera peta akan otomatis bergeser dan fokus pada titik-titik kejadian bencana aktif tahun tersebut.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 5: LAYER FASILITAS (CRITICAL & PUBLIC FACILITIES) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <button
                onClick={() => setExpandedSection(expandedSection === 'facilities' ? null : 'facilities')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 uppercase tracking-wider text-[11px] text-slate-700">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>LAYER FASILITAS</span>
                  <Info className="w-3 h-3 text-slate-400" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${showFacilities ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                  {expandedSection === 'facilities' ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {expandedSection === 'facilities' && (
                <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-3">
                  {/* Master Toggle */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-emerald-300 transition-all shadow-xs">
                    <span className="text-xs text-slate-800 flex items-center gap-2 font-medium">
                      <input
                        type="checkbox"
                        checked={showFacilities}
                        onChange={onToggleFacilities}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Tampilkan Layer Fasilitas</span>
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      showFacilities 
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : 'text-slate-500 bg-slate-100 border-slate-200'
                    }`}>
                      {showFacilities ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </label>

                  {/* Filter Kategori & Subjenis Fasilitas */}
                  <div className="space-y-3">
                    {/* FASILITAS KRITIS */}
                    <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <button
                          onClick={() => onToggleFacilityCategory('kritis')}
                          className="flex items-center gap-1.5 text-xs font-bold text-rose-700 hover:text-rose-800 cursor-pointer"
                        >
                          <Hospital className="w-3.5 h-3.5 text-rose-600" />
                          <span>FASILITAS KRITIS</span>
                        </button>
                        <span className="text-[9px] font-mono text-slate-500">
                          {selectedFacilitySubTypes.filter(s => ['Rumah Sakit', 'Posko BPBD', 'Pemadam', 'Polisi'].includes(s)).length}/4 Tampil
                        </span>
                      </div>

                      <div className="space-y-1">
                        {[
                          { id: 'Rumah Sakit' as FacilitySubType, label: 'Rumah Sakit / UGD', icon: <Hospital className="w-3.5 h-3.5 text-rose-600 shrink-0" /> },
                          { id: 'Posko BPBD' as FacilitySubType, label: 'Posko Utama BPBD', icon: <Shield className="w-3.5 h-3.5 text-rose-600 shrink-0" /> },
                          { id: 'Pemadam' as FacilitySubType, label: 'Pemadam & Rescue', icon: <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0" /> },
                          { id: 'Polisi' as FacilitySubType, label: 'Pos Polisi / Keamanan', icon: <Siren className="w-3.5 h-3.5 text-rose-600 shrink-0" /> },
                        ].map((sub) => {
                          const isChecked = selectedFacilitySubTypes.includes(sub.id);
                          return (
                            <label
                              key={sub.id}
                              className={`flex items-center justify-between p-1.5 rounded-lg text-[11px] cursor-pointer transition-colors border ${
                                isChecked
                                  ? 'bg-rose-50/70 border-rose-200 text-rose-900 font-medium'
                                  : 'bg-white border-slate-100 text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => onToggleFacilitySubType(sub.id)}
                                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                />
                                {sub.icon}
                                <span>{sub.label}</span>
                              </span>
                              {isChecked && <span className="text-[9px] font-mono text-rose-700 font-bold">✓</span>}
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* FASILITAS UMUM */}
                    <div className="p-2 bg-white rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                        <button
                          onClick={() => onToggleFacilityCategory('umum')}
                          className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 cursor-pointer"
                        >
                          <School className="w-3.5 h-3.5 text-blue-600" />
                          <span>FASILITAS UMUM</span>
                        </button>
                        <span className="text-[9px] font-mono text-slate-500">
                          {selectedFacilitySubTypes.filter(s => ['Sekolah / Pengungsian', 'Tempat Ibadah', 'Pasar / Logistik', 'Gedung Olahraga'].includes(s)).length}/4 Tampil
                        </span>
                      </div>

                      <div className="space-y-1">
                        {[
                          { id: 'Sekolah / Pengungsian' as FacilitySubType, label: 'Sekolah / Pengungsian', icon: <School className="w-3.5 h-3.5 text-blue-600 shrink-0" /> },
                          { id: 'Tempat Ibadah' as FacilitySubType, label: 'Tempat Ibadah (Masjid/Gereja)', icon: <Church className="w-3.5 h-3.5 text-blue-600 shrink-0" /> },
                          { id: 'Pasar / Logistik' as FacilitySubType, label: 'Pasar / Logistik Pangan', icon: <Package className="w-3.5 h-3.5 text-blue-600 shrink-0" /> },
                          { id: 'Gedung Olahraga' as FacilitySubType, label: 'Gedung Olahraga (GOR)', icon: <Trophy className="w-3.5 h-3.5 text-blue-600 shrink-0" /> },
                        ].map((sub) => {
                          const isChecked = selectedFacilitySubTypes.includes(sub.id);
                          return (
                            <label
                              key={sub.id}
                              className={`flex items-center justify-between p-1.5 rounded-lg text-[11px] cursor-pointer transition-colors border ${
                                isChecked
                                  ? 'bg-blue-50/70 border-blue-200 text-blue-900 font-medium'
                                  : 'bg-white border-slate-100 text-slate-500 hover:text-slate-700'
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => onToggleFacilitySubType(sub.id)}
                                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                {sub.icon}
                                <span>{sub.label}</span>
                              </span>
                              {isChecked && <span className="text-[9px] font-mono text-blue-700 font-bold">✓</span>}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-200 pt-2">
                    Dua kategori data spasial fasilitas ini membantu pemetaan evakuasi dan kesiapsiagaan tanggap darurat di wilayah terdampak.
                  </p>
                </div>
              )}
            </div>

            {/* Slider Transparansi */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Transparansi Layer Map</span>
                </span>
                <span className="font-mono text-emerald-700 font-bold">{Math.round(opacity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={opacity}
                onChange={(e) => onChangeOpacity(parseFloat(e.target.value))}
                className="w-full custom-slider"
              />
            </div>

          </>
        ) : (
          /* RADAR INVEST TAB (DUNIA USAHA) */
          <div className="space-y-3 text-xs">
            <div className="bg-gradient-to-b from-emerald-50 via-white to-teal-50/30 border border-emerald-200 rounded-xl p-3 space-y-2 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  <span>RADAR INVEST (DUNIA USAHA)</span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold">
                  KKPR &amp; Spatial
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                Sistem analitik kelayakan tapak pembangunan. Masukkan titik koordinat (X, Y) untuk evaluasi status Kawasan Lindung, Risiko Bencana, dan Statistik Luas (Ha).
              </p>
            </div>

            {/* Input Form Koordinat Manual */}
            <form onSubmit={handleFormSubmit} className="bg-white border border-slate-200 rounded-xl p-3 space-y-3 shadow-xs">
              <div className="text-[11px] font-bold text-slate-800 flex items-center justify-between">
                <span>INPUT KOORDINAT TAPAK</span>
                <Compass className="w-3.5 h-3.5 text-emerald-600" />
              </div>

              {/* Button: Pilih Berdasarkan Peta */}
              <button
                type="button"
                onClick={onTogglePickOnMap}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 border shadow-xs ${
                  isPickingOnMap
                    ? 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 hover:border-emerald-400'
                }`}
              >
                <MapPin className={`w-4 h-4 ${isPickingOnMap ? 'text-amber-600 animate-bounce' : 'text-emerald-600'}`} />
                <span>{isPickingOnMap ? 'Klik Lokasi di Peta... (Batal)' : 'Pilih Berdasarkan Peta'}</span>
              </button>

              <div>
                <label className="block text-[10px] text-slate-500 font-mono mb-1">Nama Proyek / Kegiatan Usaha</label>
                <input
                  type="text"
                  value={investProjectName}
                  onChange={(e) => setInvestProjectName(e.target.value)}
                  placeholder="misal: Kawasan Industri Cikarang"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-1 focus:ring-emerald-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-mono mb-1">Latitude Y (Lintang)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={investLat}
                    onChange={(e) => setInvestLat(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-mono mb-1">Longitude X (Bujur)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={investLng}
                    onChange={(e) => setInvestLng(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 font-mono mb-1">Rencana Luas Plot (Ha)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={investPlotHa}
                    onChange={(e) => setInvestPlotHa(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-emerald-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 font-mono mb-1">Sektor Usaha</label>
                  <select
                    value={investSector}
                    onChange={(e) => setInvestSector(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-1.5 py-1.5 text-[11px] text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                  >
                    <option value="Manufaktur & Kawasan Industri">Industri &amp; Pabrik</option>
                    <option value="Perumahan & Real Estate">Perumahan &amp; Properti</option>
                    <option value="Pariwisata & Resort / Hotel">Pariwisata &amp; Hotel</option>
                    <option value="Energi, Pertambangan & Infrastruktur">Infrastruktur &amp; Energi</option>
                    <option value="Pertanian, Agribisnis & Peternakan">Agribisnis &amp; Pertanian</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/30 active:scale-95 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Analisis Kelayakan Tapak</span>
              </button>
            </form>

            {/* Quick Presets Sample Locations in Banjarnegara */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                LOKASI CONTOH PRESET (STRATEGIS BANJARNEGARA)
              </div>
              <div className="space-y-1.5">
                {[
                  {
                    name: 'Kawasan Industri Bawang (Budi Daya)',
                    lat: -7.4215,
                    lng: 109.6350,
                    ha: 25,
                    sec: 'Manufaktur & Kawasan Industri',
                    proj: 'Kawasan Industri Bawang'
                  },
                  {
                    name: 'Dataran Tinggi Dieng - Batur (Kawasan Lindung)',
                    lat: -7.2150,
                    lng: 109.9120,
                    ha: 15,
                    sec: 'Pariwisata & Resort / Hotel',
                    proj: 'Resort Agrowisata Dieng'
                  },
                  {
                    name: 'Kawasan Agrowisata Wanayasa (Zona Longsor)',
                    lat: -7.2579,
                    lng: 109.9158,
                    ha: 10,
                    sec: 'Pertanian & Komoditas',
                    proj: 'Sentra Agrowisata Wanayasa'
                  },
                  {
                    name: 'Bantaran DAS Serayu - Sigaluh (Zona Banjir)',
                    lat: -7.3920,
                    lng: 109.7350,
                    ha: 12,
                    sec: 'Energi, Pertambangan & Infrastruktur',
                    proj: 'Sub-Stasiun Logistik Sigaluh'
                  },
                  {
                    name: 'Kawasan Komersial Banjarnegara Kota',
                    lat: -7.3980,
                    lng: 109.6980,
                    ha: 8,
                    sec: 'Perumahan & Real Estate',
                    proj: 'Kawasan Komersial Banjarnegara Kota'
                  },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset.lat, preset.lng, preset.ha, preset.sec, preset.proj)}
                    className="w-full p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-left text-[11px] transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-emerald-700">{preset.name}</div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        X: {preset.lng}, Y: {preset.lat} • {preset.ha} Ha
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-mono font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Pilih →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* If Result Active */}
            {radarInvestResult && (
              <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-3 space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-800 font-mono flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ANALISIS AKTIF
                  </span>
                  <button
                    onClick={onClearRadarInvest}
                    className="text-[10px] text-slate-500 hover:text-rose-600 flex items-center gap-1 font-mono transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
                <div className="text-xs font-bold text-slate-900">{radarInvestResult.projectName}</div>
                <div className="text-[10px] text-slate-600 font-mono flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span>{radarInvestResult.districtName} ({radarInvestResult.villageName})</span>
                </div>
                
                <div className={`p-2 rounded-lg text-[10px] font-bold text-center font-mono border ${
                  radarInvestResult.feasibilityStatus.includes('ZONA MERAH')
                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                    : radarInvestResult.feasibilityStatus.includes('ZONA KUNING')
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}>
                  {radarInvestResult.feasibilityStatus}
                </div>

                {/* Deskripsi & Alasan Status */}
                {radarInvestResult.feasibilityReasons && radarInvestResult.feasibilityReasons.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-emerald-200">
                    <div className="text-[10px] font-bold text-slate-700 font-mono uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      <span>Alasan Status Zona:</span>
                    </div>
                    {radarInvestResult.feasibilitySummary && (
                      <p className="text-[10px] text-slate-700 leading-snug bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
                        {radarInvestResult.feasibilitySummary}
                      </p>
                    )}
                    <ul className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {radarInvestResult.feasibilityReasons.map((reason, idx) => (
                        <li
                          key={idx}
                          className={`text-[10px] p-1.5 rounded-lg border leading-relaxed ${
                            radarInvestResult.feasibilityStatus.includes('ZONA MERAH')
                              ? 'bg-rose-50 border-rose-200 text-rose-800'
                              : radarInvestResult.feasibilityStatus.includes('ZONA KUNING')
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          }`}
                        >
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Button */}
      <div className="p-3 border-t border-slate-200 bg-white shrink-0">
        <button
          onClick={onExportData}
          className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
        >
          <Download className="w-4 h-4 text-emerald-600" />
          <span>Download Laporan Data (CSV)</span>
        </button>
      </div>
    </aside>
  );
};
