import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  MapPin, 
  AlertTriangle, 
  Building2, 
  Hospital, 
  Sparkles, 
  Briefcase, 
  PieChart as PieIcon, 
  Bot, 
  Share2, 
  Download, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle,
  X,
  Maximize2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { AdminFeature, ZonalStatistics, AIRiskAssessment, HazardType, FacilitySubType, RadarInvestResult } from '../types';
import { HAZARD_LAYERS } from '../data/hazardLayers';
import { MOCK_FACILITIES } from '../data/mockFacilities';

export type BottomSheetSnap = 'peek' | 'half' | 'full';

interface MobileBottomSheetProps {
  snapState: BottomSheetSnap;
  onSnapChange: (snap: BottomSheetSnap) => void;
  selectedDistrict: AdminFeature | null;
  selectedVillage?: string | null;
  selectedHazard: HazardType;
  stats: ZonalStatistics | null;
  aiAssessment: AIRiskAssessment | null;
  isAiLoading: boolean;
  onRequestAiAnalysis: () => void;
  onExportData: () => void;
  radarInvestResult?: RadarInvestResult | null;
  onOpenChatModal: () => void;
}

// In-memory cache for building stats summary
let cachedBuildingSummary: any = null;

export const MobileBottomSheetComponent: React.FC<MobileBottomSheetProps> = ({
  snapState,
  onSnapChange,
  selectedDistrict,
  selectedVillage,
  selectedHazard,
  stats,
  aiAssessment,
  isAiLoading,
  onRequestAiAnalysis,
  onExportData,
  radarInvestResult,
  onOpenChatModal,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'invest' | 'ai'>('stats');
  const [buildingSummary, setBuildingSummary] = useState<any>(cachedBuildingSummary);
  
  // Touch Drag State
  const touchStartY = useRef<number | null>(null);
  const touchCurrentY = useRef<number | null>(null);

  useEffect(() => {
    if (!cachedBuildingSummary) {
      fetch('/data/buildingStatsSummary.json')
        .then((r) => r.json())
        .then((d) => {
          cachedBuildingSummary = d;
          setBuildingSummary(d);
        })
        .catch(() => {});
    }
  }, []);

  const hazardConfig = HAZARD_LAYERS[selectedHazard];
  const isZeroRisk = stats && stats.highRiskHa === 0 && stats.mediumRiskHa === 0 && stats.lowRiskHa === 0;

  const chartData = useMemo(() => {
    if (!stats) return [];
    if (isZeroRisk) {
      return [
        {
          name: 'Zona Bebas Bahaya (Aman)',
          value: stats.totalAreaHa || 100,
          pct: 100,
          color: '#10b981',
        },
      ];
    }
    return [
      {
        name: 'Risiko Tinggi',
        value: stats.highRiskHa,
        pct: stats.highRiskPct,
        color: hazardConfig.colorPalette.high,
      },
      {
        name: 'Risiko Sedang',
        value: stats.mediumRiskHa,
        pct: stats.mediumRiskPct,
        color: hazardConfig.colorPalette.medium,
      },
      {
        name: 'Risiko Rendah',
        value: stats.lowRiskHa,
        pct: stats.lowRiskPct,
        color: hazardConfig.colorPalette.low,
      },
    ];
  }, [stats, isZeroRisk, hazardConfig]);

  const districtName = selectedDistrict
    ? selectedDistrict.properties.name
    : 'Banjarnegara';

  const currentDistrictName = selectedDistrict?.properties?.name?.replace(/^(kecamatan|desa|kabupaten)\s+/i, '') || '';
  const currentDistrictBuildingStats = buildingSummary?.districtStats?.[currentDistrictName] || null;

  // Filter facilities with memoization
  const districtFacilities = useMemo(() => {
    if (!selectedDistrict) return MOCK_FACILITIES;
    const selectedName = selectedDistrict.properties.name.toLowerCase().replace(/^(kabupaten|kota)\s+/, '');
    return MOCK_FACILITIES.filter((fac) => {
      const facName = fac.districtName.toLowerCase().replace(/^(kabupaten|kota)\s+/, '');
      return facName.includes(selectedName) || selectedName.includes(facName);
    });
  }, [selectedDistrict]);

  const kritisFacilities = useMemo(() => districtFacilities.filter((f) => f.category === 'kritis'), [districtFacilities]);

  // Handle Touch Swipes
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStartY.current === null || touchCurrentY.current === null) return;
    const deltaY = touchCurrentY.current - touchStartY.current;
    
    // Swipe Up (deltaY < -35)
    if (deltaY < -35) {
      if (snapState === 'peek') onSnapChange('half');
      else if (snapState === 'half') onSnapChange('full');
    }
    // Swipe Down (deltaY > 35)
    else if (deltaY > 35) {
      if (snapState === 'full') onSnapChange('half');
      else if (snapState === 'half') onSnapChange('peek');
    }

    touchStartY.current = null;
    touchCurrentY.current = null;
  };

  const toggleSnap = () => {
    if (snapState === 'peek') onSnapChange('half');
    else if (snapState === 'half') onSnapChange('full');
    else onSnapChange('peek');
  };

  // Hardware-accelerated GPU transform style (instant 60 FPS, no reflow)
  const getTransformStyle = () => {
    switch (snapState) {
      case 'peek':
        return 'translate-y-[calc(100%-74px)]';
      case 'half':
        return 'translate-y-[calc(100%-54dvh)]';
      case 'full':
        return 'translate-y-0';
    }
  };

  return (
    <div
      className={`fixed bottom-14 inset-x-0 z-30 md:hidden bg-white border-t border-slate-200 shadow-2xl rounded-t-3xl flex flex-col overflow-hidden select-none h-[88dvh] transition-transform duration-300 ease-out will-change-transform ${getTransformStyle()}`}
    >
      {/* Drag Handle Bar & Peek Header */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={toggleSnap}
        className="pt-2 px-4 pb-2 bg-slate-50 border-b border-slate-200/80 cursor-pointer shrink-0"
      >
        {/* Grab Pill Bar */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mb-1.5" />

        {/* Peek Summary Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black text-slate-800 truncate">
                  {selectedVillage ? selectedVillage : districtName}
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-mono">
                  {selectedVillage ? 'Desa' : (selectedDistrict ? 'Kec.' : 'Kab.')}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 truncate font-mono">
                Ancaman: <strong className="text-amber-700 font-bold uppercase">{selectedHazard}</strong> • {stats ? `${stats.totalAreaHa.toLocaleString()} Ha` : '-'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {stats && !isZeroRisk && (
              <div className="px-2 py-0.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold font-mono">
                🔴 {stats.highRiskPct}% Tinggi
              </div>
            )}
            <button
              type="button"
              className="p-1 text-slate-400 hover:text-slate-700"
              aria-label="Toggle Sheet"
            >
              {snapState === 'peek' ? (
                <ChevronUp className="w-4 h-4" />
              ) : snapState === 'full' ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Tabs Switcher */}
        <div className="flex items-center border-b border-slate-200 bg-slate-100/80 p-1 gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'stats'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                : 'text-slate-500'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ringkasan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('invest')}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'invest'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-300'
                : 'text-slate-500'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
            <span>Radar Invest</span>
            {radarInvestResult && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ai'
                ? 'bg-white text-amber-800 shadow-xs border border-amber-300'
                : 'text-slate-500'
            }`}
          >
            <Bot className="w-3.5 h-3.5 text-amber-500" />
            <span>AI Bencana</span>
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-safe select-text">
          {activeTab === 'stats' && (
            <>
              {/* 3 Risk Cards Grid */}
              {stats && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-rose-50/90 border border-rose-200/90 p-2.5 rounded-xl text-center shadow-2xs">
                    <div className="text-[10px] font-extrabold text-rose-800 uppercase tracking-tight">Tinggi</div>
                    <div className="text-xs font-mono font-black text-rose-900 mt-0.5">{stats.highRiskHa.toLocaleString()} Ha</div>
                    <div className="text-[9px] font-mono text-rose-700 mt-0.5">{stats.highRiskPct}%</div>
                  </div>
                  <div className="bg-amber-50/90 border border-amber-200/90 p-2.5 rounded-xl text-center shadow-2xs">
                    <div className="text-[10px] font-extrabold text-amber-800 uppercase tracking-tight">Sedang</div>
                    <div className="text-xs font-mono font-black text-amber-900 mt-0.5">{stats.mediumRiskHa.toLocaleString()} Ha</div>
                    <div className="text-[9px] font-mono text-amber-700 mt-0.5">{stats.mediumRiskPct}%</div>
                  </div>
                  <div className="bg-emerald-50/90 border border-emerald-200/90 p-2.5 rounded-xl text-center shadow-2xs">
                    <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-tight">Rendah</div>
                    <div className="text-xs font-mono font-black text-emerald-900 mt-0.5">{stats.lowRiskHa.toLocaleString()} Ha</div>
                    <div className="text-[9px] font-mono text-emerald-700 mt-0.5">{stats.lowRiskPct}%</div>
                  </div>
                </div>
              )}

              {/* Donut Chart */}
              {stats && (
                <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">Proporsi Luas Bahaya</span>
                    <span className="text-[10px] text-slate-500 font-mono">QGIS Raster 30m</span>
                  </div>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => [`${Number(value).toLocaleString()} Ha`, 'Luas']}
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            fontSize: '11px',
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Open Buildings & Facilities Impact */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs space-y-2">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Dampak Bangunan &amp; Fasilitas</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="text-[10px] text-slate-500">Estimasi Bangunan</div>
                    <div className="font-mono font-bold text-slate-800">
                      {currentDistrictBuildingStats?.totalBuildings?.toLocaleString() || stats?.affectedBuildings?.toLocaleString() || '12,450'} unit
                    </div>
                  </div>
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg">
                    <div className="text-[10px] text-rose-700">Zona Bahaya Tinggi</div>
                    <div className="font-mono font-bold text-rose-900">
                      {currentDistrictBuildingStats?.hazardHighCount?.toLocaleString() || stats?.highRiskBuildings?.toLocaleString() || '2,840'} unit
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Fasilitas Kritis Terpapar:</span>
                  <span className="font-bold text-slate-800">{kritisFacilities.length} Lokasi</span>
                </div>
              </div>

              {/* Export & Share Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onExportData}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Laporan PDF/CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Tautan disalin ke clipboard!');
                  }}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
                  title="Bagikan"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {activeTab === 'invest' && (
            <div className="space-y-3">
              {radarInvestResult ? (
                <div className="bg-white border border-emerald-200 rounded-xl p-3.5 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-800">{radarInvestResult.input.projectName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{radarInvestResult.input.sector}</div>
                      </div>
                    </div>
                    <span className={`text-xs font-black px-2.5 py-1 rounded-full font-mono ${
                      radarInvestResult.feasibilityScore >= 75
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : radarInvestResult.feasibilityScore >= 50
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}>
                      Skor: {radarInvestResult.feasibilityScore}/100
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg text-xs space-y-1.5">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Status Kelayakan:</span>
                      <strong className="text-slate-800">{radarInvestResult.feasibilityLabel}</strong>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Koordinat Titik:</span>
                      <span className="text-slate-700">{radarInvestResult.input.lat}, {radarInvestResult.input.lng}</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Estimasi CAPEX Mitigasi:</span>
                      <strong className="text-emerald-700">Rp {radarInvestResult.capexMitigationEstMillion.toLocaleString()} Juta</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
                  <Briefcase className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <div className="text-xs font-bold text-slate-800">Belum ada analisis investasi</div>
                  <p className="text-[11px] text-slate-500 mt-1 mb-3">
                    Buka tab Invest di menu bawah atau tentukan titik koordinat usaha di peta untuk menghitung risiko.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-200 rounded-xl p-3.5">
                <div className="flex items-center gap-2 mb-2">
                  <Bot className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-slate-800">Tanya AI Bencana</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  Dapatkan rekomendasi mitigasi berbasis AI spesifik untuk wilayah <strong>{selectedVillage || districtName}</strong>.
                </p>
                <button
                  type="button"
                  onClick={onOpenChatModal}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>Buka Chat AI Bencana</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const MobileBottomSheet = React.memo(MobileBottomSheetComponent);
