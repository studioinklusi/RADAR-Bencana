import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Waves, 
  Mountain, 
  CloudRain, 
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
  X
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
  const [activeTab, setActiveTab] = useState<'tema' | 'ai' | 'invest'>('tema');
  const [expandedSection, setExpandedSection] = useState<'wilayah' | 'polaruang' | 'hazard' | 'incidents' | 'facilities' | null>('polaruang');

  // Form state for Radar Invest
  const [investLat, setInvestLat] = useState<number>(-6.9175);
  const [investLng, setInvestLng] = useState<number>(107.6191);
  const [investPlotHa, setInvestPlotHa] = useState<number>(10);
  const [investSector, setInvestSector] = useState<string>('Manufaktur & Kawasan Industri');
  const [investProjectName, setInvestProjectName] = useState<string>('Rencana Pembangunan Industri');

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
    landslide: <Mountain className="w-4 h-4 text-amber-600" />,
    wildfire: <Flame className="w-4 h-4 text-orange-600" />,
    coastal: <CloudRain className="w-4 h-4 text-teal-600" />,
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
          <span>Tema</span>
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-1.5 px-1.5 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'ai'
              ? 'bg-white text-amber-700 border border-slate-200 shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-amber-500" />
          <span>Radar AI</span>
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
          <span>Invest</span>
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
                  <Info className="w-3 h-3 text-slate-400" title="Batas Administrasi Kabupaten/Kota Jawa Barat" />
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
                      <span>Batas Administrasi (Vector)</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      8 Kab/Kota
                    </span>
                  </label>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Klik pada polygon kabupaten/kota di peta untuk memotong data raster hazard GEE secara spesifik.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 2: POLA RUANG RTRW (TATA RUANG) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <button
                onClick={() => setExpandedSection(expandedSection === 'polaruang' ? null : 'polaruang')}
                className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2 uppercase tracking-wider text-[11px] text-slate-700">
                  <Compass className="w-3.5 h-3.5 text-teal-600" />
                  <span>POLA RUANG (RTRW)</span>
                  <Info className="w-3 h-3 text-slate-400" title="Zonasi Tata Ruang Kawasan Lindung & Kawasan Budi Daya RTRW Dinas PUPR" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${showPolaRuang ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`}></span>
                  {expandedSection === 'polaruang' ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {expandedSection === 'polaruang' && (
                <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-3">
                  {/* Master Toggle */}
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

                  {/* Legenda Zonasi RTRW */}
                  <div className="space-y-1.5 pt-1">
                    <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider flex items-center justify-between">
                      <span>Legenda Pola Ruang RTRW:</span>
                      <span className="text-teal-700 font-semibold">Vector SHP</span>
                    </div>

                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-emerald-600 border border-emerald-400 shrink-0"></span>
                          <span className="text-slate-800 font-medium">Hutan Lindung (HL)</span>
                        </div>
                        <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">Lindung</span>
                      </div>

                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-teal-600 border border-teal-400 shrink-0"></span>
                          <span className="text-slate-800 font-medium">Sempadan / KBAU</span>
                        </div>
                        <span className="text-[9px] font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">Sesar Aktif</span>
                      </div>

                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-purple-600 border border-purple-400 shrink-0"></span>
                          <span className="text-slate-800 font-medium">Industri (KPI)</span>
                        </div>
                        <span className="text-[9px] font-mono text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">Budi Daya</span>
                      </div>

                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-amber-500 border border-amber-300 shrink-0"></span>
                          <span className="text-slate-800 font-medium">Pemukiman (PP-1)</span>
                        </div>
                        <span className="text-[9px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Budi Daya</span>
                      </div>

                      <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-slate-200">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-lime-600 border border-lime-400 shrink-0"></span>
                          <span className="text-slate-800 font-medium">Pertanian (LP2B)</span>
                        </div>
                        <span className="text-[9px] font-mono text-lime-700 bg-lime-50 px-1.5 py-0.5 rounded border border-lime-200">Budi Daya</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-relaxed border-t border-slate-200 pt-2">
                    Arahkan kursor atau klik pada zonasi Pola Ruang di peta untuk melihat detail batas RTRW, aturan KKPR Dinas PUPR, dan status konservasi.
                  </p>
                </div>
              )}
            </div>

            {/* Accordion 3: LAYER BAHAYA BENCANA (GEE / TIF) */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-bold text-slate-800 bg-slate-50/80 border-b border-slate-200">
                <button
                  onClick={() => setExpandedSection(expandedSection === 'hazard' ? null : 'hazard')}
                  className="flex items-center gap-2 uppercase tracking-wider text-[11px] text-slate-700 hover:text-slate-900"
                >
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  <span>LAYER BAHAYA BENCANA</span>
                  <Info className="w-3 h-3 text-slate-400" title="Dataset Raster .TIF GEE (Opsi Sub-Layer: Kelas Bahaya 1-3 & Indeks Bahaya 0.0-1.0)" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleHazardLayer) onToggleHazardLayer();
                    }}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-all flex items-center gap-1 border ${
                      showHazardLayer
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                    title={showHazardLayer ? 'Sembunyikan Layer Bahaya Bencana di Peta' : 'Tampilkan Layer Bahaya Bencana di Peta'}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${showHazardLayer ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                    <span>{showHazardLayer ? 'Tampil' : 'Sembunyi'}</span>
                  </button>

                  <button
                    onClick={() => setExpandedSection(expandedSection === 'hazard' ? null : 'hazard')}
                    className="p-0.5 hover:bg-slate-200 rounded"
                  >
                    {expandedSection === 'hazard' ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>

              {expandedSection === 'hazard' && (
                <div className="p-2.5 bg-slate-50/40 space-y-2.5">
                  {/* Sub-layer Selector Tabs: Kelas Bahaya vs Indeks Bahaya */}
                  <div className="space-y-1">
                    <div className="text-[10px] font-mono uppercase text-slate-500 font-bold flex justify-between">
                      <span>Sub-Layer Tampilan Raster:</span>
                      <span className="text-emerald-700">Format .tif</span>
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
                        <span>Kelas Bahaya (1 - 3)</span>
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
                        <span>Indeks Bahaya (0.0 - 1.0)</span>
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
                              {hazardRenderMode === 'class' ? 'Diskrit (1=Low, 2=Med, 3=High)' : 'Kontinu Index (0.0 - 1.0)'}
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
                  <Info className="w-3 h-3 text-slate-400" title="Layer Lokasi Kejadian Bencana Lapangan" />
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
                  <Info className="w-3 h-3 text-slate-400" title="Layer Lokasi Fasilitas Kritis & Fasilitas Umum" />
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

            {/* Active Legend Palette Preview */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                <span>Palet {HAZARD_LAYERS[selectedHazard].name}</span>
                <span className="text-[10px] text-emerald-700 font-mono">
                  {hazardRenderMode === 'class' ? 'Raster Diskrit' : 'Raster Kontinu'}
                </span>
              </div>

              {hazardRenderMode === 'class' ? (
                <div className="grid grid-cols-3 gap-1">
                  <div className="text-center">
                    <div
                      className="h-3 rounded-l"
                      style={{ backgroundColor: HAZARD_LAYERS[selectedHazard].colorPalette.low }}
                    />
                    <span className="text-[9px] text-slate-500 font-mono mt-1 block">1 - Rendah</span>
                  </div>
                  <div className="text-center">
                    <div
                      className="h-3"
                      style={{ backgroundColor: HAZARD_LAYERS[selectedHazard].colorPalette.medium }}
                    />
                    <span className="text-[9px] text-slate-500 font-mono mt-1 block">2 - Sedang</span>
                  </div>
                  <div className="text-center">
                    <div
                      className="h-3 rounded-r"
                      style={{ backgroundColor: HAZARD_LAYERS[selectedHazard].colorPalette.high }}
                    />
                    <span className="text-[9px] text-slate-500 font-mono mt-1 block">3 - Tinggi</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="h-3.5 rounded bg-gradient-to-r from-[#10b981] via-[#f59e0b] to-[#f43f5e] border border-slate-200 shadow-inner" />
                  <div className="flex justify-between text-[9px] font-mono">
                    <span className="text-emerald-700 font-bold">0.0 (Rendah)</span>
                    <span className="text-amber-700 font-bold">0.5 (Sedang)</span>
                    <span className="text-rose-700 font-bold">1.0 (Tinggi)</span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : activeTab === 'ai' ? (
          /* RADAR AI Tab */
          <div className="space-y-3">
            {/* Card 1: GEE Zonal Risk Summary Generator */}
            <div className="bg-gradient-to-b from-emerald-50 via-white to-amber-50/30 border border-emerald-200 rounded-xl p-3 text-xs space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Analisis Laporan Risiko GEE</span>
                </div>
                <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">
                  Qwen 2.5
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Buat laporan ringkasan eksekutif, kerentanan, dan mitigasi BPBD untuk wilayah aktif.
              </p>
              <button
                onClick={onRequestAiAnalysis}
                disabled={isAiLoading}
                className="w-full py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs shadow-emerald-600/30 active:scale-95 cursor-pointer text-xs"
              >
                {isAiLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Menganalisis GEE...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Jalankan Analisis Laporan AI</span>
                  </>
                )}
              </button>
            </div>

            {/* Card 2: Interactive Tanya AI Bencana Chatbot */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs space-y-2.5 shadow-xs flex flex-col transition-all">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Tanya AI Bencana</span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-mono border border-emerald-200">
                    Qwen 2.5
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsChatMinimized(!isChatMinimized)}
                    title={isChatMinimized ? 'Perluas Chat' : 'Kecilkan Chat'}
                    className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-all cursor-pointer"
                  >
                    {isChatMinimized ? (
                      <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                    ) : (
                      <Minimize2 className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenMaximizedChat?.()}
                    title="Layar Penuh (Maximize)"
                    className="p-1 hover:bg-emerald-50 hover:text-emerald-700 rounded text-slate-500 transition-all cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {!isChatMinimized && (
                <>
                  {/* Chat Message History Window */}
                  <div className="max-h-56 min-h-[140px] overflow-y-auto space-y-2 pr-1 text-[11px]">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-1.5 ${
                          msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                            msg.sender === 'user'
                              ? 'bg-emerald-600 text-white'
                              : 'bg-amber-100 border border-amber-300 text-amber-800'
                          }`}
                        >
                          {msg.sender === 'user' ? (
                            <User className="w-3 h-3" />
                          ) : (
                            <Bot className="w-3 h-3" />
                          )}
                        </div>
                        <div
                          className={`p-2 rounded-xl max-w-[85%] leading-relaxed ${
                            msg.sender === 'user'
                              ? 'bg-emerald-600 text-white rounded-tr-none'
                              : 'bg-slate-50 border border-slate-200 text-slate-700 rounded-tl-none shadow-2xs'
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-[11px]">{msg.text}</p>
                          <span
                            className={`text-[8px] block mt-1 text-right font-mono ${
                              msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}

                    {isChatSending && (
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] py-1">
                        <span className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
                        <span>Qwen AI sedang berpikir...</span>
                      </div>
                    )}
                  </div>

                  {/* Suggested Quick Question Chips */}
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="text-[10px] text-slate-500 font-semibold block">Pertanyaan Cepat:</span>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => onSendChatMessage?.('Apa rekomendasi mitigasi bencana untuk wilayah yang sedang saya buka ini?')}
                        className="text-[10px] bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2 py-1 rounded border border-slate-200 transition-all text-left cursor-pointer truncate"
                      >
                        💡 Rekomendasi mitigasi wilayah ini
                      </button>
                      <button
                        onClick={() => onSendChatMessage?.('Fasilitas kritis apa saja yang rentan terdampak di lokasi ini?')}
                        className="text-[10px] bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2 py-1 rounded border border-slate-200 transition-all text-left cursor-pointer truncate"
                      >
                        🏥 Fasilitas kritis yang rentan
                      </button>
                      <button
                        onClick={() => onSendChatMessage?.('Bagaimana nomor dan kontak protokol darurat BPBD Jawa Barat?')}
                        className="text-[10px] bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2 py-1 rounded border border-slate-200 transition-all text-left cursor-pointer truncate"
                      >
                        🚨 Nomor kontak darurat BPBD
                      </button>
                    </div>
                  </div>

                  {/* Chat Input Form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      onSendChatMessage?.();
                    }}
                    className="flex items-center gap-1.5 pt-1"
                  >
                    <input
                      type="text"
                      value={inputChatText}
                      onChange={(e) => onChangeInputChatText?.(e.target.value)}
                      placeholder="Tanyakan risiko bencana..."
                      disabled={isChatSending}
                      className="flex-1 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-800 placeholder:text-slate-400"
                    />
                    <button
                      type="submit"
                      disabled={isChatSending || !inputChatText.trim()}
                      className="p-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-lg transition-all cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
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

            {/* Quick Presets Sample Locations in Jabar */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-xs">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                LOKASI CONTOH PRESET (SIMULASI JABAR)
              </div>
              <div className="space-y-1.5">
                {[
                  {
                    name: '🏬 Kawasan Industri Cikarang (Budi Daya)',
                    lat: -6.3150,
                    lng: 107.1520,
                    ha: 25,
                    sec: 'Manufaktur & Kawasan Industri',
                    proj: 'Pembangunan Pabrik & Gudang Cikarang'
                  },
                  {
                    name: '🌲 Ciwidey Patuha (Kawasan Lindung)',
                    lat: -7.1650,
                    lng: 107.4120,
                    ha: 15,
                    sec: 'Pariwisata & Resort / Hotel',
                    proj: 'Pengembangan Resort Ciwidey'
                  },
                  {
                    name: '🏙️ Lembang (Resapan Air & Sesar)',
                    lat: -6.8120,
                    lng: 107.6210,
                    ha: 8,
                    sec: 'Perumahan & Real Estate',
                    proj: 'Kawasan Komersial Lembang'
                  },
                  {
                    name: '🌊 Pesisir Cirebon (Rob Pesisir)',
                    lat: -6.7410,
                    lng: 108.5420,
                    ha: 20,
                    sec: 'Manufaktur & Kawasan Industri',
                    proj: 'Pusat Logistik Pesisir Cirebon'
                  },
                  {
                    name: '🗻 Cugenang Cianjur (Zona Sesar)',
                    lat: -6.8020,
                    lng: 107.1120,
                    ha: 12,
                    sec: 'Energi, Pertambangan & Infrastruktur',
                    proj: 'Depot Sub-Stasiun Cugenang'
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
                <div className="text-[10px] text-slate-600 font-mono">
                  📍 {radarInvestResult.districtName} ({radarInvestResult.villageName})
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

      {/* Bottom Sticky Action Buttons */}
      <div className="p-3 border-t border-slate-200 bg-white grid grid-cols-2 gap-2 shrink-0">
        <button
          onClick={onRequestAiAnalysis}
          className="py-2 px-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold text-xs border border-amber-300 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Buat analisis</span>
          <span className="text-[9px] text-amber-700 font-mono font-bold">AI</span>
        </button>

        <button
          onClick={onExportData}
          className="py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-300 rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Downloads</span>
        </button>
      </div>
    </aside>
  );
};
