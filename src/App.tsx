import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LeftSidebar } from './components/LeftSidebar';
import { MapContainer } from './components/MapContainer';
import { RightDashboard } from './components/RightDashboard';
import { CodeViewerModal } from './components/CodeViewerModal';
import { MyGeometryModal } from './components/MyGeometryModal';
import { DataGuideModal } from './components/DataGuideModal';
import { AllDisasterIncidentsModal } from './components/AllDisasterIncidentsModal';
import { MaximizedChatModal } from './components/MaximizedChatModal';
import { LoginPage } from './components/LoginPage';
import { AdminDashboardPage } from './components/AdminDashboardPage';

import { ADMIN_BOUNDARIES } from './data/mockAdminBoundaries';
import { AdminFeature, HazardType, ZonalStatistics, AIRiskAssessment, FacilityCategory, FacilitySubType, RadarInvestInput, RadarInvestResult, ChatMessage } from './types';
import { calculateRadarInvest } from './utils/radarInvestCalculator';


const ALL_FACILITY_SUBTYPES: FacilitySubType[] = [
  'Rumah Sakit',
  'Posko BPBD',
  'Pemadam',
  'Polisi',
  'Sekolah / Pengungsian',
  'Tempat Ibadah',
  'Pasar / Logistik',
  'Gedung Olahraga',
];

export default function App() {
  const [selectedDistrict, setSelectedDistrict] = useState<AdminFeature | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<string | null>(null);
  const [selectedHazard, setSelectedHazard] = useState<HazardType>('flood');
  const [opacity, setOpacity] = useState<number>(0.85);
  const [showHazardLayer, setShowHazardLayer] = useState<boolean>(true);
  const [hazardRenderMode, setHazardRenderMode] = useState<'class' | 'index'>('class');
  const [showAdminBoundaries, setShowAdminBoundaries] = useState<boolean>(true);
  const [showPolaRuang, setShowPolaRuang] = useState<boolean>(true);
  const [showIncidents, setShowIncidents] = useState<boolean>(true);
  const [selectedIncidentHazards, setSelectedIncidentHazards] = useState<HazardType[]>([
    'flood',
    'flashflood',
    'landslide',
    'earthquake',
    'liquefaction',
  ]);

  const [showFacilities, setShowFacilities] = useState<boolean>(true);
  const [selectedFacilityCategories, setSelectedFacilityCategories] = useState<FacilityCategory[]>([
    'kritis',
    'umum',
  ]);
  const [selectedFacilitySubTypes, setSelectedFacilitySubTypes] = useState<FacilitySubType[]>(ALL_FACILITY_SUBTYPES);

  const handleToggleIncidentHazard = (hazard: HazardType) => {
    setSelectedIncidentHazards((prev) =>
      prev.includes(hazard)
        ? prev.filter((h) => h !== hazard)
        : [...prev, hazard]
    );
  };

  const handleToggleFacilityCategory = (category: FacilityCategory) => {
    const isCurrentlySelected = selectedFacilityCategories.includes(category);
    const categorySubTypes: FacilitySubType[] = category === 'kritis' 
      ? ['Rumah Sakit', 'Posko BPBD', 'Pemadam', 'Polisi']
      : ['Sekolah / Pengungsian', 'Tempat Ibadah', 'Pasar / Logistik', 'Gedung Olahraga'];

    if (isCurrentlySelected) {
      // Remove category and its subTypes
      setSelectedFacilityCategories((prev) => prev.filter((c) => c !== category));
      setSelectedFacilitySubTypes((prev) => prev.filter((s) => !categorySubTypes.includes(s)));
    } else {
      // Add category and its subTypes
      setSelectedFacilityCategories((prev) => [...prev, category]);
      setSelectedFacilitySubTypes((prev) => Array.from(new Set([...prev, ...categorySubTypes])));
    }
  };

  const handleToggleFacilitySubType = (subType: FacilitySubType) => {
    setSelectedFacilitySubTypes((prev) => {
      const next = prev.includes(subType)
        ? prev.filter((s) => s !== subType)
        : [...prev, subType];
      
      // Auto update categories based on remaining subTypes
      const kritisSubTypes: FacilitySubType[] = ['Rumah Sakit', 'Posko BPBD', 'Pemadam', 'Polisi'];
      const umumSubTypes: FacilitySubType[] = ['Sekolah / Pengungsian', 'Tempat Ibadah', 'Pasar / Logistik', 'Gedung Olahraga'];

      const hasKritis = kritisSubTypes.some((s) => next.includes(s));
      const hasUmum = umumSubTypes.some((s) => next.includes(s));

      const newCategories: FacilityCategory[] = [];
      if (hasKritis) newCategories.push('kritis');
      if (hasUmum) newCategories.push('umum');
      setSelectedFacilityCategories(newCategories);

      return next;
    });
  };

  const [stats, setStats] = useState<ZonalStatistics | null>(null);
  const [aiAssessment, setAiAssessment] = useState<AIRiskAssessment | null>(null);
  const [radarInvestResult, setRadarInvestResult] = useState<RadarInvestResult | null>(null);
  const [isPickingOnMap, setIsPickingOnMap] = useState<boolean>(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const handleRunRadarInvest = (input: RadarInvestInput) => {
    const result = calculateRadarInvest(input);
    setRadarInvestResult(result);
  };

  const handleSelectMapPoint = (lat: number, lng: number) => {
    setPickedLocation({ lat, lng });
    setIsPickingOnMap(false);
  };


  const [isMapLoading, setIsMapLoading] = useState<boolean>(false);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);

  const [isCodeModalOpen, setIsCodeModalOpen] = useState<boolean>(false);
  const [isGeometryModalOpen, setIsGeometryModalOpen] = useState<boolean>(false);
  const [isDataGuideOpen, setIsDataGuideOpen] = useState<boolean>(false);
  const [showAllIncidentsMode, setShowAllIncidentsMode] = useState<boolean>(false);
  const [isAllIncidentsModalOpen, setIsAllIncidentsModalOpen] = useState<boolean>(false);
  const [isMaximizedChatOpen, setIsMaximizedChatOpen] = useState<boolean>(false);
  const [focusedCoords, setFocusedCoords] = useState<[number, number] | null>(null);

  // Chatbot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Halo! Saya Asisten Tanya AI RADAR Bencana. Silakan tanyakan apapun seputar potensi bencana, analisis spasial GEE, tata ruang RTRW, atau rekomendasi mitigasi BPBD di Kabupaten Banjarnegara.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputChatText, setInputChatText] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);

  const handleSendChatMessage = async (textToSend?: string) => {
    const text = textToSend || inputChatText.trim();
    if (!text || isChatSending) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputChatText('');
    setIsChatSending(true);

    try {
      const activeContext = {
        districtName: selectedDistrict?.properties?.name || 'Kabupaten Banjarnegara',
        provinceName: selectedDistrict?.properties?.province || 'Jawa Tengah',
        hazardType: selectedHazard,
        stats: stats ? {
          highRiskHa: stats.highRiskHa,
          mediumRiskHa: stats.mediumRiskHa,
          lowRiskHa: stats.lowRiskHa,
          riskCategory: stats.riskCategory,
          totalAreaHa: stats.totalAreaHa,
        } : null
      };

      const res = await fetch('/api/chat-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg],
          activeContext
        })
      });

      let aiText = '';
      if (res.ok) {
        try {
          const data = await res.json();
          if (data && data.text) {
            aiText = data.text;
          }
        } catch {
          // Response was non-JSON (e.g. static html rewrite)
        }
      }

      if (!aiText) {
        const textLower = userMsg.text.toLowerCase();
        const distName = selectedDistrict?.properties?.name || 'Kabupaten Banjarnegara';
        if (textLower.includes('kalibening') || distName.toLowerCase().includes('kalibening')) {
          aiText = `Halo! Berikut adalah **Analisis Risiko Bencana Kecamatan Kalibening, Banjarnegara**:\n\n` +
            `• **Kerentanan Utama**: Tanah Longsor (Kategori TINGGI - Class 3) akibat topografi lereng curam pegunungan utara dan intensitas curah hujan tinggi.\n` +
            `• **Riwayat Kejadian**: Berdasarkan catatan BPBD Banjarnegara, Kalibening merupakan salah satu zona rawan longsor aktif (termasuk kawasan Desa Kasinoman & Sirukun).\n` +
            `• **Langkah Mitigasi BPBD**:\n` +
            `  1. Penataan sistem drainase lereng untuk mencegah penyerapan air liar ke retakan tanah.\n` +
            `  2. Penguatan posko siaga bencana desa dan jalur evakuasi kelompok rentan.\n` +
            `  3. Kontak Darurat Posko Mako BPBD Banjarnegara: **(0286) 592881 / 0812-2630-111**.`;
        } else if (textLower.includes('mitigasi') || textLower.includes('rekomendasi')) {
          aiText = `**Rekomendasi Aksi Mitigasi Bencana (${distName}):**\n\n` +
            `1. **Kesiapsiagaan Warga**: Pembentukan Tim Siaga Bencana Desa dan pemetaan titik kumpul aman.\n` +
            `2. **Pemberdayaan Vegetasi**: Penanaman vegetasi penguat lereng (akar wangi/vetiver) dan pembuatan retaining wall di kawasan terjal.\n` +
            `3. **Kontak Siaga Mako BPBD**: Telepon **(0286) 592881** atau WhatsApp **0812-2630-111** jika terdapat gejala retakan pergerakan tanah.`;
        } else {
          aiText = `Halo! Saya **Asisten AI RADAR Bencana Kabupaten Banjarnegara**.\n\n` +
            `Wilayah **${distName}** saat ini dipetakan dengan tingkat kewaspadaan terhadap ancaman **${selectedHazard.toUpperCase()}**.\n\n` +
            `• Silakan manfaatkan peta spasial 30m di atas untuk melihat detail per desa.\n` +
            `• Kontak Darurat Mako BPBD Banjarnegara: **(0286) 592881 / 0812-2630-111**.`;
        }
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat AI Error:', err);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: 'Halo! Saya Asisten AI RADAR Bencana Banjarnegara. Silakan tanyakan informasi seputar bencana, mitigasi BPBD, atau analisis wilayah.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsChatSending(false);
    }
  };

  const [lang, setLang] = useState<'ID' | 'EN'>('ID');

  // Client Routing State for Super Admin (/login, /admin-dashboard, /)
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname || '/');
  const [uploadedLayers, setUploadedLayers] = useState<any[]>([]);

  const fetchUploadedLayers = async () => {
    try {
      const res = await fetch('/api/uploaded-layers');
      if (res.ok) {
        const data = await res.json();
        setUploadedLayers(data.layers || []);
      }
    } catch (err) {
      console.error('Failed to load uploaded layers:', err);
    }
  };

  useEffect(() => {
    fetchUploadedLayers();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // Compute Static Zonal Statistics when District or Hazard Layer Changes
  useEffect(() => {
    setIsMapLoading(true);

    if (selectedDistrict) {
      const p = selectedDistrict.properties;
      const tinggi = p.luas_risiko_tinggi_ha || Math.round(p.total_area_ha * 0.35);
      const sedang = p.luas_risiko_sedang_ha || Math.round(p.total_area_ha * 0.40);
      const rendah = p.luas_risiko_rendah_ha || Math.max(0, p.total_area_ha - tinggi - sedang);
      const total = p.total_area_ha;

      const highPct = Number(((tinggi / total) * 100).toFixed(1));
      const medPct = Number(((sedang / total) * 100).toFixed(1));
      const lowPct = Number(((rendah / total) * 100).toFixed(1));

      setStats({
        districtId: selectedDistrict.id,
        districtName: p.name,
        provinceName: p.province,
        totalAreaHa: total,
        highRiskHa: tinggi,
        mediumRiskHa: sedang,
        lowRiskHa: rendah,
        highRiskPct: highPct,
        mediumRiskPct: medPct,
        lowRiskPct: lowPct,
        affectedPopulation: p.population,
        hospitalsExposed: p.hospital_count,
        schoolsExposed: p.school_count,
        bridgesExposed: p.bridge_count,
        riskCategory: tinggi > sedang ? 'High' : 'Moderate',
        overallScore: Math.round((tinggi / total) * 100),
        isClipped: true,
        computedAt: new Date().toISOString(),
      });
    } else {
      let sumTinggi = 0;
      let sumSedang = 0;
      let sumRendah = 0;
      let sumTotal = 0;
      let sumPop = 0;
      let sumHospitals = 0;
      let sumSchools = 0;
      let sumBridges = 0;

      ADMIN_BOUNDARIES.features.forEach((f) => {
        const p = f.properties;
        const t = p.luas_risiko_tinggi_ha || Math.round(p.total_area_ha * 0.35);
        const s = p.luas_risiko_sedang_ha || Math.round(p.total_area_ha * 0.40);
        const r = p.luas_risiko_rendah_ha || Math.max(0, p.total_area_ha - t - s);
        sumTinggi += t;
        sumSedang += s;
        sumRendah += r;
        sumTotal += p.total_area_ha;
        sumPop += p.population;
        sumHospitals += p.hospital_count;
        sumSchools += p.school_count;
        sumBridges += p.bridge_count;
      });

      const highPct = Number(((sumTinggi / sumTotal) * 100).toFixed(1));
      const medPct = Number(((sumSedang / sumTotal) * 100).toFixed(1));
      const lowPct = Number(((sumRendah / sumTotal) * 100).toFixed(1));

      setStats({
        districtId: 'REGIONAL_BANJARNEGARA',
        districtName: 'Banjarnegara (Keseluruhan)',
        provinceName: 'Jawa Tengah',
        totalAreaHa: sumTotal,
        highRiskHa: sumTinggi,
        mediumRiskHa: sumSedang,
        lowRiskHa: sumRendah,
        highRiskPct: highPct,
        mediumRiskPct: medPct,
        lowRiskPct: lowPct,
        affectedPopulation: sumPop,
        hospitalsExposed: sumHospitals,
        schoolsExposed: sumSchools,
        bridgesExposed: sumBridges,
        riskCategory: 'High',
        overallScore: Math.round((sumTinggi / sumTotal) * 100),
        isClipped: false,
        computedAt: new Date().toISOString(),
      });
    }

    setIsMapLoading(false);
  }, [selectedDistrict, selectedHazard]);

  // Request Qwen AI Risk Assessment
  const handleRequestAiAnalysis = async () => {
    setIsAiLoading(true);
    const districtName = selectedDistrict
      ? selectedDistrict.properties.name
      : 'Kabupaten Banjarnegara';

    const provinceName = selectedDistrict
      ? selectedDistrict.properties.province || 'Jawa Tengah'
      : 'Banjarnegara';

    try {
      const response = await fetch('/api/generate-ai-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          districtName,
          provinceName,
          hazardType: selectedHazard,
          stats: stats ? {
            summary: {
              highRiskHa: stats.highRiskHa,
              mediumRiskHa: stats.mediumRiskHa,
              lowRiskHa: stats.lowRiskHa,
              riskCategory: stats.riskCategory,
              totalAreaHa: stats.totalAreaHa,
            }
          } : undefined,
        }),
      });

      const resData = await response.json();
      if (resData && resData.success && resData.report) {
        const report = resData.report;
        setAiAssessment({
          districtName,
          hazardType: selectedHazard,
          severityLevel: stats?.riskCategory || 'Tinggi',
          executiveSummary: report.executiveSummary || '',
          vulnerabilityFactors: report.keyVulnerabilities || [],
          immediateActionPlan: report.actionableMitigations || [],
          longTermMitigations: report.actionableMitigations || [],
          emergencyContactProtocol: 'BPBD: 119 ext.8 | BNPB: (021) 2906 2900 | SAR: 115',
        });
      }
    } catch (err) {
      console.error('AI Risk Assessment error:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Export CSV Data
  const handleExportData = () => {
    if (!stats) return;

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Distrik / Kabupaten,Provinsi,Hazard Type,Total Area (ha),Sangat Tinggi / High Risk (ha),Sedang (ha),Rendah (ha),Kategori Risk',
        `"${stats.districtName}","${stats.provinceName}","${selectedHazard}",${stats.totalAreaHa},${stats.highRiskHa},${stats.mediumRiskHa},${stats.lowRiskHa},"${stats.riskCategory}"`,
      ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GEE_Zonal_Stats_${stats.districtName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Reset clipped boundary view
  const handleResetView = () => {
    setSelectedDistrict(null);
    setSelectedVillage(null);
    setAiAssessment(null);
  };

  // Custom GeoJSON application
  const handleApplyCustomGeometry = (customFeature: AdminFeature) => {
    ADMIN_BOUNDARIES.features.unshift(customFeature);
    setSelectedDistrict(customFeature);
  };

  // Route 1: Login Page (/login)
  if (currentPath === '/login') {
    return (
      <LoginPage
        onLoginSuccess={() => navigateTo('/admin-dashboard')}
        onBackToMap={() => navigateTo('/')}
      />
    );
  }

  // Route 2: Super Admin Dashboard Page (/admin-dashboard)
  if (currentPath === '/admin-dashboard') {
    return (
      <AdminDashboardPage
        onBackToMap={() => navigateTo('/')}
        onDataUploaded={fetchUploadedLayers}
      />
    );
  }

  // Route 3: Main GIS Map Page (/)
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 text-slate-800 overflow-hidden font-sans">
      {/* Top Header */}
      <Header
        districts={ADMIN_BOUNDARIES.features}
        selectedDistrict={selectedDistrict}
        selectedVillage={selectedVillage}
        onSelectDistrict={(d) => {
          setSelectedDistrict(d);
          setSelectedVillage(null);
        }}
        onSelectVillage={setSelectedVillage}
        onOpenCodeViewer={() => setIsCodeModalOpen(true)}
        onOpenGeometryModal={() => setIsGeometryModalOpen(true)}
        onNavigateToLogin={() => navigateTo('/login')}
        onResetView={handleResetView}
        lang={lang}
        onToggleLang={() => setLang(lang === 'ID' ? 'EN' : 'ID')}
      />

      {/* Main Web GIS Three-Pane Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar Control Panel */}
        <LeftSidebar
          selectedDistrict={selectedDistrict}
          stats={stats}
          selectedHazard={selectedHazard}
          onSelectHazard={setSelectedHazard}
          showHazardLayer={showHazardLayer}
          onToggleHazardLayer={() => setShowHazardLayer(!showHazardLayer)}
          hazardRenderMode={hazardRenderMode}
          onChangeHazardRenderMode={setHazardRenderMode}
          opacity={opacity}
          onChangeOpacity={setOpacity}
          showAdminBoundaries={showAdminBoundaries}
          onToggleAdminBoundaries={() => setShowAdminBoundaries(!showAdminBoundaries)}
          showPolaRuang={showPolaRuang}
          onTogglePolaRuang={() => setShowPolaRuang(!showPolaRuang)}
          showIncidents={showIncidents}
          onToggleIncidents={() => setShowIncidents(!showIncidents)}
          selectedIncidentHazards={selectedIncidentHazards}
          onToggleIncidentHazard={handleToggleIncidentHazard}
          showFacilities={showFacilities}
          onToggleFacilities={() => setShowFacilities(!showFacilities)}
          selectedFacilityCategories={selectedFacilityCategories}
          onToggleFacilityCategory={handleToggleFacilityCategory}
          selectedFacilitySubTypes={selectedFacilitySubTypes}
          onToggleFacilitySubType={handleToggleFacilitySubType}
          onRequestAiAnalysis={handleRequestAiAnalysis}
          onExportData={handleExportData}
          isAiLoading={isAiLoading}
          radarInvestResult={radarInvestResult}
          onRunRadarInvest={handleRunRadarInvest}
          onClearRadarInvest={() => setRadarInvestResult(null)}
          isPickingOnMap={isPickingOnMap}
          onTogglePickOnMap={() => setIsPickingOnMap(!isPickingOnMap)}
          pickedLocation={pickedLocation}
          chatMessages={chatMessages}
          inputChatText={inputChatText}
          onChangeInputChatText={setInputChatText}
          onSendChatMessage={handleSendChatMessage}
          isChatSending={isChatSending}
          onOpenMaximizedChat={() => setIsMaximizedChatOpen(true)}
        />

        {/* Center Map Box */}
        <MapContainer
          adminBoundaries={ADMIN_BOUNDARIES}
          selectedDistrict={selectedDistrict}
          selectedVillage={selectedVillage}
          onSelectDistrict={(d) => {
            setSelectedDistrict(d);
            setSelectedVillage(null);
          }}
          onSelectVillage={setSelectedVillage}
          selectedHazard={selectedHazard}
          showHazardLayer={showHazardLayer}
          onToggleHazardLayer={() => setShowHazardLayer(!showHazardLayer)}
          hazardRenderMode={hazardRenderMode}
          onChangeHazardRenderMode={setHazardRenderMode}
          opacity={opacity}
          showAdminBoundaries={showAdminBoundaries}
          showPolaRuang={showPolaRuang}
          showIncidents={showIncidents}
          onToggleIncidents={() => setShowIncidents(!showIncidents)}
          selectedIncidentHazards={selectedIncidentHazards}
          showFacilities={showFacilities}
          onToggleFacilities={() => setShowFacilities(!showFacilities)}
          selectedFacilityCategories={selectedFacilityCategories}
          selectedFacilitySubTypes={selectedFacilitySubTypes}
          isMapLoading={isMapLoading}
          onResetView={handleResetView}
          radarInvestResult={radarInvestResult}
          isPickingOnMap={isPickingOnMap}
          onMapClickSelect={handleSelectMapPoint}
          onCancelPickOnMap={() => setIsPickingOnMap(false)}
          showAllIncidentsMode={showAllIncidentsMode}
          onToggleAllIncidentsMode={() => setShowAllIncidentsMode(!showAllIncidentsMode)}
          onOpenAllIncidentsModal={() => setIsAllIncidentsModalOpen(true)}
          focusedCoords={focusedCoords}
          customUploadedLayers={uploadedLayers}
        />

        {/* Right Dashboard Analytics & Sunburst Chart Panel */}
        <RightDashboard
          selectedDistrict={selectedDistrict}
          selectedVillage={selectedVillage}
          selectedHazard={selectedHazard}
          stats={stats}
          aiAssessment={aiAssessment}
          isAiLoading={isAiLoading}
          onRequestAiAnalysis={handleRequestAiAnalysis}
          onExportData={handleExportData}
          radarInvestResult={radarInvestResult}
        />

      </div>

      {/* Code Inspector Modal (Step 1 & Step 2 Code) */}
      <CodeViewerModal
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      {/* Custom Geometry Modal */}
      <MyGeometryModal
        isOpen={isGeometryModalOpen}
        onClose={() => setIsGeometryModalOpen(false)}
        onApplyCustomGeometry={handleApplyCustomGeometry}
      />

      {/* Data Specification & Template CSV Guide Modal */}
      <DataGuideModal
        isOpen={isDataGuideOpen}
        onClose={() => setIsDataGuideOpen(false)}
      />

      {/* All Disaster Incidents Modal */}
      <AllDisasterIncidentsModal
        isOpen={isAllIncidentsModalOpen}
        onClose={() => setIsAllIncidentsModalOpen(false)}
        showAllIncidentsMode={showAllIncidentsMode}
        onToggleAllIncidentsMode={() => setShowAllIncidentsMode(!showAllIncidentsMode)}
        onSelectIncidentOnMap={(coords) => {
          setFocusedCoords(coords);
          setShowIncidents(true);
        }}
      />

      {/* Maximized Tanya AI Bencana Fullscreen Modal */}
      <MaximizedChatModal
        isOpen={isMaximizedChatOpen}
        onClose={() => setIsMaximizedChatOpen(false)}
        chatMessages={chatMessages}
        onSendMessage={handleSendChatMessage}
        inputChatText={inputChatText}
        onChangeInputChatText={setInputChatText}
        isChatSending={isChatSending}
        selectedDistrict={selectedDistrict}
        selectedHazard={selectedHazard}
      />
    </div>
  );
}
