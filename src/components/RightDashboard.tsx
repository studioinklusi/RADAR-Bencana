import React, { useState, useEffect } from 'react';
import { 
  PieChart as PieIcon, 
  Share2, 
  Download, 
  Maximize2, 
  Eye, 
  Sparkles, 
  Bot,
  ShieldAlert, 
  Building2, 
  GraduationCap, 
  Anchor, 
  Users, 
  MapPin, 
  ChevronRight,
  TrendingUp,
  FileText,
  AlertTriangle,
  Info,
  Briefcase,
  CheckCircle,
  XCircle,
  AlertCircle,
  Compass,
  Check,
  Hospital,
  Shield,
  Flame,
  Siren,
  School,
  Church,
  Package,
  Trophy,
  Mountain,
  Waves,
  Zap,
  Ban,
  CheckCircle2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { AdminFeature, ZonalStatistics, AIRiskAssessment, HazardType, FacilitySubType, RadarInvestResult } from '../types';
import { HAZARD_LAYERS } from '../data/hazardLayers';
import { MOCK_FACILITIES } from '../data/mockFacilities';

interface RightDashboardProps {
  selectedDistrict: AdminFeature | null;
  selectedVillage?: string | null;
  selectedHazard: HazardType;
  stats: ZonalStatistics | null;
  aiAssessment: AIRiskAssessment | null;
  isAiLoading: boolean;
  onRequestAiAnalysis: () => void;
  onExportData: () => void;
  radarInvestResult?: RadarInvestResult | null;
}

export const RightDashboard: React.FC<RightDashboardProps> = ({
  selectedDistrict,
  selectedVillage,
  selectedHazard,
  stats,
  aiAssessment,
  isAiLoading,
  onRequestAiAnalysis,
  onExportData,
  radarInvestResult,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'invest' | 'ai'>('stats');

  // Auto switch tab when a district is selected or investment analysis computed
  useEffect(() => {
    if (selectedDistrict) {
      setActiveTab('stats');
    }
  }, [selectedDistrict]);

  useEffect(() => {
    if (radarInvestResult) {
      setActiveTab('invest');
    }
  }, [radarInvestResult]);

  useEffect(() => {
    if (aiAssessment || isAiLoading) {
      setActiveTab('ai');
    }
  }, [aiAssessment, isAiLoading]);

  const hazardConfig = HAZARD_LAYERS[selectedHazard];

  // Filter facilities clipped by selected district
  const districtFacilities = MOCK_FACILITIES.filter((fac) => {
    if (!selectedDistrict) return true; // All facilities if no district selected
    const selectedName = selectedDistrict.properties.name.toLowerCase().replace(/^(kabupaten|kota)\s+/, '');
    const facName = fac.districtName.toLowerCase().replace(/^(kabupaten|kota)\s+/, '');
    return facName.includes(selectedName) || selectedName.includes(facName);
  });

  const kritisFacilities = districtFacilities.filter((f) => f.category === 'kritis');
  const umumFacilities = districtFacilities.filter((f) => f.category === 'umum');

  const countBySubType = (subType: FacilitySubType) => 
    districtFacilities.filter((f) => f.subType === subType).length;

  // Prepare chart data matching MapBiomas Sunburst/Donut style (3 hazard classes)
  const chartData = stats
    ? [
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
      ]
    : [];

  const districtName = selectedDistrict
    ? selectedDistrict.properties.name
    : 'Banjarnegara (Seluruh Kabupaten)';
  const totalArea = stats ? stats.totalAreaHa.toLocaleString() : '12,980,500';

  return (
    <aside className="w-80 lg:w-96 bg-white/95 backdrop-blur-md border-l border-slate-200 text-slate-800 flex flex-col h-[calc(100vh-3.5rem)] shrink-0 z-20 select-none shadow-sm">
      {/* Top Header Title Panel */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-mono font-semibold">
            <MapPin className="w-3.5 h-3.5" />
            <span>{selectedVillage ? 'Desa / Kelurahan' : (selectedDistrict ? 'Kecamatan' : 'Kabupaten')}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onExportData}
              className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-white rounded transition-colors cursor-pointer"
              title="Download Data Report"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link dashboard disalin!');
              }}
              className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-white rounded transition-colors cursor-pointer"
              title="Bagikan Tampilan"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {selectedVillage ? selectedVillage : districtName}
        </h2>
        <p className="text-[11px] text-slate-500 font-mono mt-0.5">
          {selectedVillage
            ? `${selectedDistrict?.properties?.name || 'Kecamatan'} • Kab. Banjarnegara`
            : `Kab. Banjarnegara • Tingkat risiko bencana • 2024`}
        </p>

        {/* Action Badge Button */}
        <div className="mt-3 flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-xs font-semibold text-emerald-800">
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>Divisualisasikan pada peta</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Data satelit</span>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex items-center border-b border-slate-200 bg-slate-100/60 p-1 gap-1">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-white text-emerald-800 shadow-xs border border-slate-200 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <PieIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>Ringkasan</span>
        </button>
        <button
          onClick={() => setActiveTab('invest')}
          className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 relative cursor-pointer ${
            activeTab === 'invest'
              ? 'bg-white text-emerald-800 shadow-xs border border-emerald-300 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
          <span>Radar Invest</span>
          {radarInvestResult && (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-1.5 text-[11px] font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'ai'
              ? 'bg-white text-amber-800 shadow-xs border border-amber-300 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-amber-500" />
          <span>Analisis AI</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'stats' ? (
          <>
            {/* Donut / Sunburst Chart Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-xs font-bold text-slate-800 mb-2 flex items-center justify-between">
                <span>SEBARAN RISIKO BENCANA</span>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">Total: {totalArea} ha</span>
              </div>

              {/* Recharts Multi-ring Donut */}
              <div className="h-52 w-full relative my-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white border border-slate-200 p-2 rounded-lg shadow-lg text-xs font-mono">
                              <div className="font-bold text-slate-800">{data.name}</div>
                              <div className="text-emerald-700 font-semibold">{data.value.toLocaleString()} ha ({data.pct}%)</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Hole Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[10px] text-slate-500 font-mono uppercase font-bold">Status Risiko</span>
                  <span className={`text-sm font-extrabold font-mono ${
                    stats?.riskCategory === 'Critical' ? 'text-rose-600' : 'text-amber-600'
                  }`}>
                    {stats?.riskCategory === 'High' ? 'Tinggi' : stats?.riskCategory === 'Moderate' ? 'Sedang' : stats?.riskCategory || 'Tinggi'}
                  </span>
                </div>
              </div>

              {/* Detailed Legend List */}
              <div className="space-y-2 mt-4 pt-3 border-t border-slate-100">
                {chartData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                      <span className="text-slate-700 text-[11px] truncate max-w-[170px] font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-800">{item.value.toLocaleString()} ha</span>
                      <span className="text-slate-500 text-[10px] ml-1">({item.pct}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rincian Fasilitas Terdampak / Terpotong (Clipped) */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    <span>FASILITAS &amp; INFRASTRUKTUR</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {selectedDistrict ? `Kliping Wilayah: ${districtName}` : 'Seluruh Kabupaten Banjarnegara'}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 border border-emerald-200 text-emerald-800">
                  {districtFacilities.length} Unit Total
                </span>
              </div>

              {/* Grid Fasilitas Kritis */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-rose-700 font-mono flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Hospital className="w-3.5 h-3.5 text-rose-600" />
                    <span>FASILITAS KRITIS ({kritisFacilities.length})</span>
                  </div>
                  <span className="text-[9px] text-slate-500">Tanggap Darurat</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex items-center justify-between">
                    <span className="text-[10px] text-slate-700 flex items-center gap-1.5">
                      <Hospital className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="truncate">Rumah Sakit</span>
                    </span>
                    <span className="font-bold text-rose-700 text-xs ml-1">{countBySubType('Rumah Sakit')}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex items-center justify-between">
                    <span className="text-[10px] text-slate-700 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="truncate">Pos BPBD</span>
                    </span>
                    <span className="font-bold text-rose-700 text-xs ml-1">{countBySubType('Posko BPBD')}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex items-center justify-between">
                    <span className="text-[10px] text-slate-700 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="truncate">Pemadam</span>
                    </span>
                    <span className="font-bold text-rose-700 text-xs ml-1">{countBySubType('Pemadam')}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex items-center justify-between">
                    <span className="text-[10px] text-slate-700 flex items-center gap-1.5">
                      <Siren className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span className="truncate">Polisi</span>
                    </span>
                    <span className="font-bold text-rose-700 text-xs ml-1">{countBySubType('Polisi')}</span>
                  </div>
                </div>
              </div>

              {/* Grid Fasilitas Umum */}
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-bold text-blue-700 font-mono flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5 text-blue-600" />
                    <span>FASILITAS UMUM ({umumFacilities.length})</span>
                  </div>
                  <span className="text-[9px] text-slate-500">Pengungsian &amp; Logistik</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex items-center justify-between">
                    <span className="text-[10px] text-slate-700 flex items-center gap-1.5">
                      <School className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">Sekolah/Evak</span>
                    </span>
                    <span className="font-bold text-blue-700 text-xs ml-1">{countBySubType('Sekolah / Pengungsian')}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex items-center justify-between">
                    <span className="text-[10px] text-slate-700 flex items-center gap-1.5">
                      <Church className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">Tempat Ibadah</span>
                    </span>
                    <span className="font-bold text-blue-700 text-xs ml-1">{countBySubType('Tempat Ibadah')}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex items-center justify-between">
                    <span className="text-[10px] text-slate-700 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">Pasar/Logistik</span>
                    </span>
                    <span className="font-bold text-blue-700 text-xs ml-1">{countBySubType('Pasar / Logistik')}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-2 rounded-lg flex items-center justify-between">
                    <span className="text-[10px] text-slate-700 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">GOR</span>
                    </span>
                    <span className="font-bold text-blue-700 text-xs ml-1">{countBySubType('Gedung Olahraga')}</span>
                  </div>
                </div>
              </div>

              {/* Daftar Fasilitas Terpotong di Wilayah Ini */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider flex justify-between items-center">
                  <span>Daftar Unit Fasilitas ({districtFacilities.length}):</span>
                  {selectedDistrict && <span className="text-emerald-700 font-bold">✓ Terclip</span>}
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                  {districtFacilities.length > 0 ? (
                    districtFacilities.map((fac) => (
                      <div
                        key={fac.id}
                        className="p-2 bg-slate-50 rounded-lg border border-slate-200 text-[11px] space-y-1 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold text-slate-800 leading-tight flex items-center gap-1.5">
                            {fac.category === 'kritis' ? (
                              <Hospital className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                            ) : (
                              <School className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            )}
                            <span>{fac.name}</span>
                          </span>
                          <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                            fac.category === 'kritis' 
                              ? 'bg-rose-50 border-rose-200 text-rose-800' 
                              : 'bg-blue-50 border-blue-200 text-blue-800'
                          }`}>
                            {fac.subType}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">{fac.address}</p>
                        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 border-t border-slate-200 pt-1">
                          <span>{fac.districtName}</span>
                          <span className="text-emerald-700 font-semibold">{fac.status}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-[10px] text-slate-500 font-mono bg-slate-50 rounded-lg border border-slate-200">
                      Tidak ada titik fasilitas tercatat di wilayah ini.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : activeTab === 'invest' ? (
          /* RADAR INVEST ANALYTICS VIEW */
          <div className="space-y-4">
            {radarInvestResult ? (
              <div className="space-y-3">
                {/* Investment Header Banner */}
                <div className="bg-gradient-to-r from-emerald-50 via-white to-teal-50/50 border border-emerald-200 rounded-xl p-4 space-y-2 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      <span>ANALITIK RADAR INVEST</span>
                    </div>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                      Dunia Usaha &amp; KKPR
                    </span>
                  </div>

                  <h3 className="text-base font-extrabold text-slate-900">{radarInvestResult.projectName}</h3>

                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono text-slate-700">
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
                      <span className="text-[9px] text-slate-500 block">KOORDINAT TAPAK (X, Y)</span>
                      <span className="text-emerald-700 font-bold">Y: {radarInvestResult.lat}, X: {radarInvestResult.lng}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-xs">
                      <span className="text-[9px] text-slate-500 block">SEKTOR USAHA</span>
                      <span className="text-slate-800 font-semibold truncate block">{radarInvestResult.sector}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10px] text-slate-600 font-mono pt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{radarInvestResult.villageName}, {radarInvestResult.subdistrictName}, {radarInvestResult.districtName}</span>
                  </div>
                </div>

                {/* Status Feasibility & KKPR */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                  <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span>KESESUAIAN TATA RUANG (KKPR)</span>
                    <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center gap-3 ${
                    radarInvestResult.feasibilityStatus.includes('ZONA MERAH')
                      ? 'bg-rose-50 border-rose-200 text-rose-800'
                      : radarInvestResult.feasibilityStatus.includes('ZONA KUNING')
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    {radarInvestResult.feasibilityStatus.includes('ZONA MERAH') ? (
                      <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
                    ) : radarInvestResult.feasibilityStatus.includes('ZONA KUNING') ? (
                      <AlertCircle className="w-7 h-7 text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle className="w-7 h-7 text-emerald-600 shrink-0" />
                    )}
                    <div>
                      <div className="text-xs font-extrabold">{radarInvestResult.feasibilityStatus}</div>
                      <div className="text-[10px] opacity-90 mt-0.5 leading-snug">{radarInvestResult.kkprStatus}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-mono">STATUS KAWASAN LINDUNG</span>
                      <span className={`font-bold flex items-center gap-1.5 mt-0.5 ${radarInvestResult.isProtectedZone ? 'text-rose-700' : 'text-emerald-700'}`}>
                        <span className={`w-2 h-2 rounded-full ${radarInvestResult.isProtectedZone ? 'bg-rose-600' : 'bg-emerald-600'}`}></span>
                        <span>{radarInvestResult.isProtectedZone ? 'Kawasan Lindung' : 'Kawasan Budi Daya'}</span>
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-mono">KATEGORI ZONA</span>
                      <span className="font-bold text-slate-800">{radarInvestResult.zoneCategory}</span>
                    </div>
                  </div>

                  {/* ALASAN DESKRIPSI STATUS ZONA */}
                  {radarInvestResult.feasibilityReasons && radarInvestResult.feasibilityReasons.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="text-[11px] font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>ALASAN STATUS ZONA &amp; ANALISIS PENYEBAB</span>
                      </div>

                      {radarInvestResult.feasibilitySummary && (
                        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                          {radarInvestResult.feasibilitySummary}
                        </p>
                      )}

                      <div className="space-y-1.5">
                        {radarInvestResult.feasibilityReasons.map((reason, idx) => (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-lg border text-xs font-medium leading-relaxed flex items-start gap-2 ${
                              radarInvestResult.feasibilityStatus.includes('ZONA MERAH')
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : radarInvestResult.feasibilityStatus.includes('ZONA KUNING')
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            }`}
                          >
                            <span className="shrink-0 mt-0.5">
                              {radarInvestResult.feasibilityStatus.includes('ZONA MERAH') ? (
                                <Ban className="w-3.5 h-3.5 text-rose-600" />
                              ) : radarInvestResult.feasibilityStatus.includes('ZONA KUNING') ? (
                                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              )}
                            </span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* STATISTIK LUAS (HA) */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-100">
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>STATISTIK LUAS (HA)</span>
                    </h4>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold">
                      Plot Total: {radarInvestResult.plotAreaHa} Ha
                    </span>
                  </div>

                  {/* Visual Bar Breakdown */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>Rincian Komposisi Lahan</span>
                      <span>100%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                      <div
                        style={{ width: `${(radarInvestResult.areaBreakdown.buildableAreaHa / radarInvestResult.plotAreaHa) * 100}%` }}
                        className="bg-emerald-500 h-full"
                        title="Dapat Dibangun"
                      />
                      <div
                        style={{ width: `${(radarInvestResult.areaBreakdown.protectedAreaHa / radarInvestResult.plotAreaHa) * 100}%` }}
                        className="bg-rose-500 h-full"
                        title="Zona Lindung/Resapan"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-200 space-y-1">
                      <span className="text-slate-500 text-[10px] block font-sans">Dapat Dibangun (Budi Daya)</span>
                      <span className="text-sm font-bold text-emerald-800">{radarInvestResult.areaBreakdown.buildableAreaHa} Ha</span>
                      <span className="text-[9px] text-slate-500 block">
                        ({Math.round((radarInvestResult.areaBreakdown.buildableAreaHa / radarInvestResult.plotAreaHa) * 100)}% dari plot)
                      </span>
                    </div>

                    <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-200 space-y-1">
                      <span className="text-slate-500 text-[10px] block font-sans">Zona Lindung / Buffer</span>
                      <span className="text-sm font-bold text-rose-800">{radarInvestResult.areaBreakdown.protectedAreaHa} Ha</span>
                      <span className="text-[9px] text-slate-500 block">
                        ({Math.round((radarInvestResult.areaBreakdown.protectedAreaHa / radarInvestResult.plotAreaHa) * 100)}% dari plot)
                      </span>
                    </div>
                  </div>

                  {/* Risk Level Distribution Breakdown */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[10px] text-slate-500 font-mono font-bold block uppercase">
                      Distribusi Tingkat Kerentanan Bencana (Ha)
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-mono">
                      <div className="bg-rose-50 border border-rose-200 p-1.5 rounded-lg">
                        <span className="text-rose-800 block font-bold">{radarInvestResult.areaBreakdown.highRiskAreaHa} Ha</span>
                        <span className="text-slate-500 text-[9px]">Tinggi</span>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 p-1.5 rounded-lg">
                        <span className="text-amber-800 block font-bold">{radarInvestResult.areaBreakdown.mediumRiskAreaHa} Ha</span>
                        <span className="text-slate-500 text-[9px]">Sedang</span>
                      </div>
                      <div className="bg-emerald-50 border border-emerald-200 p-1.5 rounded-lg">
                        <span className="text-emerald-800 block font-bold">{radarInvestResult.areaBreakdown.lowRiskAreaHa} Ha</span>
                        <span className="text-slate-500 text-[9px]">Rendah</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Potensi Bencana pada Titik Tapak */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>STATUS POTENSI BENCANA LOKASI</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Mountain className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Tanah Longsor &amp; Gerakan Tanah</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-amber-100 text-amber-800 border border-amber-300 font-semibold">
                          {radarInvestResult.disasterPotentials?.landslide || radarInvestResult.hazardPotentials?.find(h => h.hazard.includes('Longsor'))?.risk || 'Rendah'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Waves className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>Banjir &amp; Genangan Air</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-blue-100 text-blue-800 border border-blue-300 font-semibold">
                          {radarInvestResult.disasterPotentials?.flood || radarInvestResult.hazardPotentials?.find(h => h.hazard.includes('Banjir'))?.risk || 'Rendah'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span>Sesar Aktif / Gempa Tektonik</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-purple-100 text-purple-800 border border-purple-300 font-semibold">
                          {radarInvestResult.disasterPotentials?.earthquake || radarInvestResult.hazardPotentials?.find(h => h.hazard.includes('Gempa'))?.risk || 'Rendah'}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                          <span>Kebakaran Hutan / Lahan (Karhutla)</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-orange-100 text-orange-800 border border-orange-300 font-semibold">
                          {radarInvestResult.disasterPotentials?.wildfire || radarInvestResult.hazardPotentials?.find(h => h.hazard.includes('Karhutla'))?.risk || 'Nihil'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rekomendasi Teknis Pengembang */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>REKOMENDASI TEKNIS &amp; MITIGASI INVESTOR</span>
                  </h4>

                  <ul className="space-y-2">
                    {(radarInvestResult.technicalMitigation || radarInvestResult.mitigationNotes || []).map((item, idx) => (
                      <li key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              /* State when no analysis has been run yet */
              <div className="bg-white border border-slate-200 rounded-xl p-6 text-center space-y-4 shadow-xs">
                <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Analitik Radar Invest (Dunia Usaha)</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Belum ada analisis koordinat aktif. Buka tab <span className="text-emerald-700 font-bold">&quot;Invest&quot;</span> di panel sebelah kiri untuk memasukkan titik koordinat (X, Y) lokasi rencana pembangunan Anda.
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* AI Risk Report View */
          <div className="space-y-4">
            <div className="bg-gradient-to-b from-amber-50/50 via-white to-emerald-50/30 border border-amber-200/80 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2 font-extrabold text-xs text-slate-800">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>Analisis Risiko Bencana AI</span>
                </div>
                <span className="text-[9px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-mono font-bold border border-amber-200">
                  Qwen 2.5 AI
                </span>
              </div>

              {isAiLoading ? (
                <div className="py-10 text-center space-y-3">
                  <span className="w-7 h-7 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin inline-block"></span>
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800">Memproses Data Risiko Spasial...</p>
                    <p className="text-[10px] text-slate-500 font-mono">Menghasilkan laporan rekomendasi BPBD untuk {districtName}</p>
                  </div>
                </div>
              ) : aiAssessment ? (
                <div className="space-y-4 text-xs">
                  {/* Executive Summary */}
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-emerald-600" />
                      <span>Ringkasan Eksekutif Spasial</span>
                    </h4>
                    <p className="text-slate-700 text-[11px] leading-relaxed bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      {aiAssessment.executiveSummary}
                    </p>
                  </div>

                  {/* Vulnerabilities */}
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Faktor Kerentanan Utama</span>
                    </h4>
                    <ul className="space-y-1.5 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100">
                      {aiAssessment.vulnerabilityFactors.map((v, i) => (
                        <li key={i} className="text-slate-700 text-[11px] flex items-start gap-2">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{v}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Immediate Action Plan */}
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>Rencana Aksi Tanggap Darurat BPBD</span>
                    </h4>
                    <ul className="space-y-1.5 bg-rose-50/30 p-2.5 rounded-xl border border-rose-100">
                      {aiAssessment.immediateActionPlan.map((action, i) => (
                        <li key={i} className="text-slate-700 text-[11px] flex items-start gap-2">
                          <span className="text-rose-600 font-bold">{i + 1}.</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Emergency Hotline */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl text-center font-mono shadow-2xs">
                    <span className="text-[10px] text-slate-500 block font-semibold mb-0.5">Protokol Kontak Darurat:</span>
                    <span className="text-xs font-bold text-emerald-700">{aiAssessment.emergencyContactProtocol}</span>
                  </div>

                  {/* Re-generate Button */}
                  <div className="pt-2 text-center">
                    <button
                      onClick={onRequestAiAnalysis}
                      className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Perbarui Analisis AI</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-8 px-2 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-100 to-amber-100 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-700 shadow-inner">
                    <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-slate-800 text-sm">Analisis Risiko Spasial AI</h4>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                      Dapatkan ringkasan eksekutif, analisis faktor kerentanan geologi/iklim, dan rekomendasi aksi darurat BPBD untuk <span className="font-bold text-slate-700">{districtName}</span>.
                    </p>
                  </div>
                  <button
                    onClick={onRequestAiAnalysis}
                    className="py-2.5 px-5 bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/30 hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Jalankan Analisis AI BPBD</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
