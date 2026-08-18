import { RadarInvestInput, RadarInvestResult } from '../types';
import { ADMIN_BOUNDARIES } from '../data/mockAdminBoundaries';

export function calculateRadarInvest(input: RadarInvestInput): RadarInvestResult {
  const { lat, lng, plotAreaHa, sector, projectName } = input;

  // 1. Determine administrative district in Banjarnegara
  let matchedDistrictName = 'Kecamatan Banjarnegara';
  let matchedSubdistrict = 'Kecamatan Banjarnegara';
  let matchedVillage = 'Kutabanjarnegara';

  // Check against ADMIN_BOUNDARIES (GeoJSON bounding polygons)
  for (const feature of ADMIN_BOUNDARIES.features) {
    let coords = feature.geometry.coordinates[0];
    if (Array.isArray(coords[0][0])) {
      coords = coords[0]; // MultiPolygon fallback
    }
    let minLng = 180, maxLng = -180, minLat = 90, maxLat = -90;
    for (const p of coords) {
      if (p[0] < minLng) minLng = p[0];
      if (p[0] > maxLng) maxLng = p[0];
      if (p[1] < minLat) minLat = p[1];
      if (p[1] > maxLat) maxLat = p[1];
    }

    if (lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat) {
      matchedDistrictName = feature.properties.name;
      matchedSubdistrict = feature.properties.name;
      break;
    }
  }

  // Refine village based on Banjarnegara geography
  const distLower = matchedDistrictName.toLowerCase();
  if (distLower.includes('batur') || lat < -7.22) {
    matchedVillage = 'Desa Dieng Kulon';
  } else if (distLower.includes('pagentan')) {
    matchedVillage = 'Desa Aribaya';
  } else if (distLower.includes('karangkobar')) {
    matchedVillage = 'Desa Leksana';
  } else if (distLower.includes('wanayasa')) {
    matchedVillage = 'Desa Wanayasa';
  } else if (distLower.includes('pejawaran')) {
    matchedVillage = 'Desa Ratamba';
  } else if (distLower.includes('kalibening')) {
    matchedVillage = 'Desa Bedana';
  } else if (distLower.includes('pandanarum')) {
    matchedVillage = 'Desa Beji';
  } else if (distLower.includes('banjarmangu')) {
    matchedVillage = 'Desa Pekandangan';
  } else if (distLower.includes('punggelan')) {
    matchedVillage = 'Desa Danakerta';
  } else if (distLower.includes('rakit')) {
    matchedVillage = 'Desa Rakit';
  } else if (distLower.includes('madukara')) {
    matchedVillage = 'Desa Talunamba';
  } else if (distLower.includes('sigaluh')) {
    matchedVillage = 'Desa Singomerto';
  } else if (distLower.includes('mandiraja')) {
    matchedVillage = 'Desa Mandiraja Kulon';
  } else if (distLower.includes('purwanegara')) {
    matchedVillage = 'Desa Danaraja';
  } else if (distLower.includes('klampok') || distLower.includes('purwareja')) {
    matchedVillage = 'Desa Klampok';
  } else if (distLower.includes('susukan')) {
    matchedVillage = 'Desa Susukan';
  } else {
    matchedVillage = 'Desa Kutabanjarnegara';
  }

  // 2. Spatial Topography & Zone Classification
  // North Banjarnegara (Dieng/Pagentan/Wanayasa/Karangkobar): High elevation, steep slope, volcanic terrain
  const isHighMountainSlope = lat < -7.34 || distLower.includes('batur') || distLower.includes('wanayasa') || distLower.includes('pagentan') || distLower.includes('pejawaran') || distLower.includes('karangkobar');
  // River corridor / Valley (Serayu / Merawu): Flood & alluvial plain
  const isRiverCorridor = (lat > -7.42 && lat < -7.38 && lng > 109.65 && lng < 109.78) || distLower.includes('sigaluh') || distLower.includes('madukara');
  // Forest Conservation Zone
  const isProtectedZone = (lat < -7.25 && lng > 109.85) || (lat < -7.32 && lng < 109.60);

  let zoneCategory: RadarInvestResult['zoneCategory'] = 'Kawasan Budi Daya / Peruntukan Industri';
  if (isProtectedZone) {
    zoneCategory = 'Kawasan Lindung / Hutan Konservasi';
  } else if (isRiverCorridor) {
    zoneCategory = 'Kawasan Sempadan Sungai / Lembah Serayu';
  } else if (isHighMountainSlope) {
    zoneCategory = 'Kawasan Resapan Air / Lereng Perbukitan';
  }

  // 3. Compute Plot Breakdown (Ha)
  let protectedRatio = 0.10;
  if (zoneCategory === 'Kawasan Lindung / Hutan Konservasi') protectedRatio = 0.70;
  else if (zoneCategory === 'Kawasan Sempadan Sungai / Lembah Serayu') protectedRatio = 0.35;
  else if (zoneCategory === 'Kawasan Resapan Air / Lereng Perbukitan') protectedRatio = 0.25;

  const protectedAreaHa = Number((plotAreaHa * protectedRatio).toFixed(2));
  const buildableAreaHa = Number((plotAreaHa - protectedAreaHa).toFixed(2));

  // Risk distribution within plot
  let highRiskRatio = 0.15;
  let medRiskRatio = 0.35;
  if (isHighMountainSlope || isProtectedZone) {
    highRiskRatio = 0.55;
    medRiskRatio = 0.30;
  } else if (isRiverCorridor) {
    highRiskRatio = 0.35;
    medRiskRatio = 0.40;
  }

  const highRiskAreaHa = Number((plotAreaHa * highRiskRatio).toFixed(2));
  const mediumRiskAreaHa = Number((plotAreaHa * medRiskRatio).toFixed(2));
  const lowRiskAreaHa = Number(Math.max(0, plotAreaHa - highRiskAreaHa - mediumRiskAreaHa).toFixed(2));

  // 4. Hazard Potential Breakdown
  const landslideRisk = isHighMountainSlope ? ('Tinggi' as const) : (isRiverCorridor ? 'Sedang' as const : 'Rendah' as const);
  const floodRisk = isRiverCorridor ? ('Tinggi' as const) : (isHighMountainSlope ? 'Rendah' as const : 'Sedang' as const);
  const earthquakeRisk = isHighMountainSlope ? ('Sedang' as const) : 'Sedang' as const;
  const fireRisk = sector.toLowerCase().includes('industri') || sector.toLowerCase().includes('manufaktur') ? ('Sedang' as const) : 'Nihil' as const;

  const hazardPotentials = [
    {
      hazard: 'Tanah Longsor & Gerakan Tanah',
      risk: landslideRisk,
      details: isHighMountainSlope 
        ? 'Kemiringan lereng > 25°-40°, lapisan batuan volkanik lepas berpotensi gelincir saat jenuh air hujan.' 
        : 'Topografi relatif landai, potensi rayapan tanah skala mikro.'
    },
    {
      hazard: 'Banjir & Luapan Aliran Sungai',
      risk: floodRisk,
      details: isRiverCorridor 
        ? 'Dekat dengan koridor Daerah Aliran Sungai (DAS Serayu/Merawu), potensi limpasan saat debit puncak.' 
        : 'Sistem drainase alami lereng cukup baik, potensi genangan lokal minim.'
    },
    {
      hazard: 'Gempa Bumi & Getaran Seismik',
      risk: earthquakeRisk,
      details: 'Potensi guncangan seismik lokal zona sesar regional Jawa Tengah, membutuhkan struktur bangunan terikat.'
    },
    {
      hazard: 'Kebakaran & Bahaya Operasional',
      risk: fireRisk,
      details: sector.toLowerCase().includes('industri') 
        ? 'Perlu proteksi instalasi termal, suplai hidran, dan pemisahan buffer area bahan mudah terbakar.' 
        : 'Risiko kebakaran tapak tergolong rendah.'
    }
  ];

  // 5. Site Safety & Risk Evaluation Score (0 - 100)
  let safetyScore = 85;
  if (isProtectedZone || highRiskRatio >= 0.5) {
    safetyScore = 40;
  } else if (isHighMountainSlope || isRiverCorridor || highRiskRatio >= 0.3) {
    safetyScore = 65;
  }

  let siteRiskLevel: RadarInvestResult['siteRiskLevel'] = 'Rendah (Aman)';
  let feasibilityStatus: RadarInvestResult['feasibilityStatus'] = 'DIREKOMENDASIKAN (ZONA HIJAU)';
  let overallRiskLevel: RadarInvestResult['overallRiskLevel'] = 'Rendah';

  if (safetyScore <= 45) {
    siteRiskLevel = 'Tinggi (Rawan Bencana)';
    feasibilityStatus = 'TIDAK DIREKOMENDASIKAN (ZONA MERAH)';
    overallRiskLevel = 'Tinggi';
  } else if (safetyScore <= 70) {
    siteRiskLevel = 'Sedang (Waspada)';
    feasibilityStatus = 'BISA DIBANGUN DENGAN SYARAT KETAT (ZONA KUNING)';
    overallRiskLevel = 'Sedang';
  } else {
    siteRiskLevel = 'Rendah (Aman)';
    feasibilityStatus = 'DIREKOMENDASIKAN (ZONA HIJAU)';
    overallRiskLevel = 'Rendah';
  }

  // 6. INTELLIGENT MULTI-VARIABLE MITIGATION SYNTHESIS ENGINE
  const structuralMitigations: string[] = [];
  const nonStructuralMitigations: string[] = [];

  // A. Structural Mitigations (Physical & Engineering Interventions)
  if (landslideRisk === 'Tinggi') {
    structuralMitigations.push('Pembangunan Dinding Penahan Tanah (DPT) konstruksi kantilever / bronjong kawat bertingkat pada lereng kritis.');
    structuralMitigations.push('Pemasangan sistem drainase lereng kedap air dan pipa suling horisontal (sub-drain) untuk mereduksi tekanan air pori tanah.');
    structuralMitigations.push('Stabilisasi bioteknik lereng (bio-engineering) dengan terasering dan penanaman rumput Vetiver (akar wangi) serta tanaman berakar tunjang.');
  } else if (landslideRisk === 'Sedang') {
    structuralMitigations.push('Perkuatan tebing minor dengan pasangan batu kali dan penanaman pohon pengikat tanah pada zona berkemiringan sedang.');
    structuralMitigations.push('Pembuatan saluran pengelak air hujan (catch drain) agar limpasan permukaan tidak mengikis lereng tapak.');
  }

  if (floodRisk === 'Tinggi') {
    structuralMitigations.push('Peninggian peil lantai bangunan minimum +1.0m hingga +1.5m di atas Muka Air Banjir Rencana (peil banjir 50 tahunan).');
    structuralMitigations.push('Pembangunan kolam retensi air mandiri / polder dan sumur resapan berpori untuk menahan debit puncak limpasan.');
  } else if (floodRisk === 'Sedang') {
    structuralMitigations.push('Pembuatan saluran drainase tertutup dengan dimensi memadai dan sumur resapan air hujan di setiap blok tapak.');
  }

  // Structural Seismik / Building
  structuralMitigations.push('Penerapan standar struktur tahan gempa SNI 1726 dengan ikatan balok-kolom yang terintegrasi.');
  if (sector.toLowerCase().includes('industri') || sector.toLowerCase().includes('manufaktur')) {
    structuralMitigations.push('Pembangunan tanggul penahan sekunder (bund wall) dan proteksi khusus pada instalasi tangki/panel kelistrikan utama.');
  }

  // B. Non-Structural Mitigations (Governance, EWS, Capacity & Protocols)
  if (landslideRisk === 'Tinggi') {
    nonStructuralMitigations.push('Pemasangan alat pemantau retakan tanah / Early Warning System (EWS) pergerakan lereng berbasis sensor atau kabel tarikan.');
    nonStructuralMitigations.push('Penyusunan SOP evakuasi darurat mandiri saat intensitas curah hujan ekstrem melampaui >80 mm/hari atau >25 mm/jam selama 2 jam berturut-turut.');
  }

  if (floodRisk === 'Tinggi') {
    nonStructuralMitigations.push('Penetapan zona sempadan aman (buffer zone) bebas bangunan permanen minimal 15–30 meter dari garis sempadan sungai.');
    nonStructuralMitigations.push('Pemasangan sistem sensor pemantau ketinggian muka air dan integrasi informasi peringatan dini dengan BPBD.');
  }

  // Capacity, SOP, and Environmental Governance
  nonStructuralMitigations.push('Pembentukan Tim Siaga Bencana Tapak (K3 Tanggap Darurat) dan pelaksanaan simulasi evakuasi berkala minimal setiap 6 bulan.');
  nonStructuralMitigations.push('Pemasangan jalur evakuasi aman, rambu bahaya visual, dan penentuan titik kumpul (assembly point) yang bebas dari ancaman tebing.');
  if (protectedAreaHa > 0) {
    nonStructuralMitigations.push(`Pemeliharaan area Ruang Terbuka Hijau (RTH) seluas minimal ${protectedAreaHa} Ha (${(protectedRatio * 100).toFixed(0)}% dari plot) sebagai kawasan resapan air.`);
  }

  // Feasibility Summary & Reasons (Clean of legal KKPR claims)
  let feasibilitySummary = '';
  const feasibilityReasons: string[] = [];

  if (feasibilityStatus.includes('ZONA MERAH')) {
    feasibilitySummary = `Lokasi tapak dikategorikan ZONA RAWAN TINGGI. Memerlukan intervensi teknis mitigasi ekstra ketat sebelum pemanfaatan lahan dapat dipertimbangkan.`;
    if (isProtectedZone) {
      feasibilityReasons.push(`ZONA KONSERVASI / LINDUNG: Seluas ${protectedAreaHa} Ha (${(protectedRatio * 100).toFixed(0)}% dari plot) berada pada kawasan fungsi lindung yang wajib dipertahankan tutupan vegetasinya.`);
    }
    if (landslideRisk === 'Tinggi') {
      feasibilityReasons.push(`KERENTANAN GERAKAN TANAH TINGGI: Kondisi morfologi lereng curam rentan longsor saat musim penghujan intensitas tinggi.`);
    }
    if (floodRisk === 'Tinggi') {
      feasibilityReasons.push(`KERENTANAN BANJIR / LEMBAH: Terletak pada dataran rendah limpasan DAS yang berisiko tergenang banjir periodik.`);
    }
  } else if (feasibilityStatus.includes('ZONA KUNING')) {
    feasibilitySummary = `Lokasi tapak dikategorikan ZONA WASPADA. Pembangunan fisik layak dilaksanakan dengan menerapkan paket rekomendasi mitigasi struktural dan non-struktural.`;
    feasibilityReasons.push(`ZONA PENYANGGA / KEMIRINGAN SEDANG: Membutuhkan penataan drainase terpadu dan alokasi RTH resapan minimal ${(protectedRatio * 100).toFixed(0)}% (${protectedAreaHa} Ha).`);
    feasibilityReasons.push(`POTENSI BENCANA MODERAT: Teridentifikasi ancaman ${hazardPotentials.filter(h => h.risk === 'Sedang' || h.risk === 'Tinggi').map(h => h.hazard).join(', ')} yang dapat dimitigasi dengan rekayasa teknik.`);
  } else {
    feasibilitySummary = `Lokasi tapak dikategorikan ZONA AMAN. Kondisi topografi stabil, risiko bencana rendah, dan sangat mendukung pengembangan kegiatan ${sector}.`;
    feasibilityReasons.push(`STABILITAS LAHAN TINGGI: Topografi stabil dengan tingkat kerentanan bencana geologis dan hidrometeorologi yang rendah.`);
    feasibilityReasons.push(`PEMANFAATAN OPTIMAL: Area tapak siap dimanfaatkan dengan penerapan standar keselamatan dan K3 konstruksi standar.`);
  }

  const disasterPotentials = {
    landslide: landslideRisk,
    flood: floodRisk,
    earthquake: earthquakeRisk,
    wildfire: fireRisk,
  };

  const mitigationNotes = [
    ...structuralMitigations.slice(0, 2),
    ...nonStructuralMitigations.slice(0, 2),
  ];

  return {
    lat,
    lng,
    plotAreaHa,
    sector,
    projectName: projectName || 'Proyek Rencana Pembangunan',
    districtName: matchedDistrictName,
    subdistrictName: matchedSubdistrict,
    villageName: matchedVillage,
    isProtectedZone,
    zoneCategory,
    feasibilityStatus,
    feasibilitySummary,
    feasibilityReasons,
    overallRiskLevel,
    hazardPotentials,
    disasterPotentials,
    areaBreakdown: {
      totalPlotHa: plotAreaHa,
      protectedAreaHa,
      buildableAreaHa,
      highRiskAreaHa,
      mediumRiskAreaHa,
      lowRiskAreaHa,
    },
    siteRiskLevel,
    safetyScore,
    structuralMitigations,
    nonStructuralMitigations,
    mitigationNotes,
    technicalMitigation: structuralMitigations,
    analyzedAt: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}
