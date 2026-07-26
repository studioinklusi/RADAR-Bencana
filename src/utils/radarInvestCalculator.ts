import { RadarInvestInput, RadarInvestResult } from '../types';
import { ADMIN_BOUNDARIES } from '../data/mockAdminBoundaries';

export function calculateRadarInvest(input: RadarInvestInput): RadarInvestResult {
  const { lat, lng, plotAreaHa, sector, projectName } = input;

  // 1. Determine administrative district
  let matchedDistrictName = 'Kecamatan Banjarnegara';
  let matchedSubdistrict = 'Kecamatan Banjarnegara';
  let matchedVillage = 'Desa Kutabanjarnegara';

  // Check against ADMIN_BOUNDARIES
  for (const feature of ADMIN_BOUNDARIES.features) {
    let coords = feature.geometry.coordinates[0];
    if (Array.isArray(coords[0][0])) {
      coords = coords[0]; // MultiPolygon
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

  // Refine village/subdistrict based on location
  if (matchedDistrictName.includes('Banjarmangu')) {
    matchedVillage = 'Desa Pekandangan';
  } else if (matchedDistrictName.includes('Batur')) {
    matchedVillage = 'Desa Dieng Kulon';
  } else if (matchedDistrictName.includes('Karangkobar')) {
    matchedVillage = 'Desa Leksana';
  } else if (matchedDistrictName.includes('Pagentan')) {
    matchedVillage = 'Desa Aribaya';
  }

  // 2. Spatial Classification (Kawasan Lindung vs Budi Daya)
  // Protected zones in West Java:
  // - High elevation / Slope (Lat < -7.15 or Lembang Fault / Puncak)
  // - Coastal strip (Lat > -6.35)
  const isHighMountain = (lat < -7.15 && lng < 107.6) || (lat < -6.74 && lat > -6.83 && lng > 107.58 && lng < 107.72);
  const isCoastalProtection = lat > -6.38;
  const isSesarZone = (lat > -6.85 && lat < -6.78 && lng > 107.05 && lng < 107.25); // Fault line (e.g. Cugenang/Cianjur)

  let zoneCategory: RadarInvestResult['zoneCategory'] = 'Kawasan Budi Daya / Peruntukan Industri';
  let isProtectedZone = false;

  if (isHighMountain) {
    zoneCategory = 'Kawasan Lindung / Hutan Konservasi';
    isProtectedZone = true;
  } else if (isCoastalProtection) {
    zoneCategory = 'Kawasan Sempadan Sungai / Pantai';
    isProtectedZone = true;
  } else if (isSesarZone) {
    zoneCategory = 'Kawasan Resapan Air / Penyangga';
    isProtectedZone = false; // Buffer zone
  }

  // 3. Compute Area Breakdown (Statistic Luas in Ha)
  let protectedRatio = 0.05;
  if (zoneCategory === 'Kawasan Lindung / Hutan Konservasi') protectedRatio = 0.75;
  else if (zoneCategory === 'Kawasan Sempadan Sungai / Pantai') protectedRatio = 0.45;
  else if (zoneCategory === 'Kawasan Resapan Air / Penyangga') protectedRatio = 0.30;

  const protectedAreaHa = Number((plotAreaHa * protectedRatio).toFixed(2));
  const buildableAreaHa = Number((plotAreaHa - protectedAreaHa).toFixed(2));

  // Risk Area distribution within plot
  let highRiskRatio = 0.15;
  let medRiskRatio = 0.35;
  if (isProtectedZone || isSesarZone) {
    highRiskRatio = 0.60;
    medRiskRatio = 0.30;
  }

  const highRiskAreaHa = Number((plotAreaHa * highRiskRatio).toFixed(2));
  const mediumRiskAreaHa = Number((plotAreaHa * medRiskRatio).toFixed(2));
  const lowRiskAreaHa = Number(Math.max(0, plotAreaHa - highRiskAreaHa - mediumRiskAreaHa).toFixed(2));

  // 4. Feasibility Status & Overall Risk Level
  let feasibilityStatus: RadarInvestResult['feasibilityStatus'] = 'DIREKOMENDASIKAN (ZONA HIJAU)';
  let overallRiskLevel: RadarInvestResult['overallRiskLevel'] = 'Rendah';

  if (isProtectedZone || highRiskRatio > 0.5) {
    feasibilityStatus = 'TIDAK DIREKOMENDASIKAN (ZONA MERAH)';
    overallRiskLevel = 'Sangat Tinggi';
  } else if (zoneCategory === 'Kawasan Resapan Air / Penyangga' || highRiskRatio > 0.25) {
    feasibilityStatus = 'BISA DIBANGUN DENGAN SYARAT KETAT (ZONA KUNING)';
    overallRiskLevel = 'Tinggi';
  } else {
    feasibilityStatus = 'DIREKOMENDASIKAN (ZONA HIJAU)';
    overallRiskLevel = 'Rendah';
  }

  // Hazard Potentials breakdown
  const hazardPotentials = [
    {
      hazard: 'Tanah Longsor & Gerakan Tanah',
      risk: isHighMountain || matchedDistrictName.includes('Cianjur') ? 'Tinggi' as const : 'Rendah' as const,
      details: isHighMountain ? 'Kemiringan lereng > 35%, rawan gelinciran tanah saat hujan lebat.' : 'Kondisi topografi relatif stabil.'
    },
    {
      hazard: 'Banjir & Luapan Air',
      risk: isCoastalProtection || matchedDistrictName.includes('Cirebon') || matchedDistrictName.includes('Indramayu') ? 'Tinggi' as const : 'Sedang' as const,
      details: isCoastalProtection ? 'Potensi genangan rob pasang air laut & luapan muara.' : 'Drainase kawasan perlu jaringan retensi.'
    },
    {
      hazard: 'Gempa Bumi / Sesar Aktif',
      risk: isSesarZone || matchedDistrictName.includes('Cianjur') || matchedDistrictName.includes('Bandung') ? 'Tinggi' as const : 'Sedang' as const,
      details: isSesarZone ? 'Berada pada lintasan zona Sesar Aktif (Fault Line) dengan risiko deformasi tanah tinggi.' : 'Potensi guncangan seismik sedang.'
    },
    {
      hazard: 'Karhutla / Kebakaran Area',
      risk: sector.includes('Industri') || sector.includes('Energi') ? 'Sedang' as const : 'Nihil' as const,
      details: 'Mengingat jenis operasional kawasan dan potensi suhu lokal.'
    }
  ];

  // Build explicit feasibility reasons (Alasan Status Zona)
  const highRiskHazards = hazardPotentials.filter(h => h.risk === 'Tinggi').map(h => h.hazard);
  const medRiskHazards = hazardPotentials.filter(h => h.risk === 'Sedang').map(h => h.hazard);

  const feasibilityReasons: string[] = [];
  let feasibilitySummary = '';

  if (feasibilityStatus.includes('ZONA MERAH')) {
    feasibilitySummary = `Lokasi tapak ini dikategorikan ZONA MERAH karena berada pada zona berisiko tinggi / tumpang tindih dengan tutupan kawasan yang dilindungi secara hukum.`;
    
    if (isProtectedZone) {
      feasibilityReasons.push(`STATUS KAWASAN LINDUNG: Lahan seluas ${protectedAreaHa} Ha (${(protectedRatio * 100).toFixed(0)}% dari total plot) tumpang tindih dengan ${zoneCategory} yang dilarang untuk alih fungsi non-konservasi.`);
    } else {
      feasibilityReasons.push(`TINGKAT KERENTANAN EKSTREM: Seluas ${highRiskAreaHa} Ha (${(highRiskRatio * 100).toFixed(0)}% dari plot) berada pada zona kerentanan bencana sangat tinggi.`);
    }

    if (highRiskHazards.length > 0) {
      feasibilityReasons.push(`POTENSI BENCANA KATEGORI TINGGI: Teridentifikasi ancaman ${highRiskHazards.join(', ')}.`);
    }

    if (isSesarZone) {
      feasibilityReasons.push(`ZONA BANTALAN SESAR AKTIF: Titik koordinat melintasi zona patahan aktif tektonik yang memiliki risiko kerusakan fisik fatal bagi struktur bangunan.`);
    }

    feasibilityReasons.push(`KETENTUAN HUKUM & KKPR: Pengajuan KKPR untuk kegiatan ${sector} di lokasi ini berpotensi besar DITOLAK oleh Dinas PUPR & BPN demi keselamatan publik dan kelestarian lingkungan.`);

  } else if (feasibilityStatus.includes('ZONA KUNING')) {
    feasibilitySummary = `Lokasi tapak dikategorikan ZONA KUNING. Pembangunan dapat dipertimbangkan namun membutuhkan rekayasa mitigasi fisik dan persetujuan KKPR Bersyarat.`;
    
    feasibilityReasons.push(`STATUS KAWASAN PENYANGGA: Berada pada ${zoneCategory} yang mewajibkan penyediaan RTH minimal ${(protectedRatio * 100).toFixed(0)}% (${protectedAreaHa} Ha).`);
    
    if (highRiskHazards.length > 0 || medRiskHazards.length > 0) {
      const allHazards = [...highRiskHazards, ...medRiskHazards];
      feasibilityReasons.push(`POTENSI BENCANA TERIDENTIFIKASI: Terdapat ancaman ${allHazards.join(', ')}.`);
    }

    feasibilityReasons.push(`KETENTUAN KKPR BERSYARAT: Diwajibkan menyusun dokumen AMDAL/UKL-UPL, rekomendasi rekayasa sipil tahan bencana dari PUPR, serta retensi banjir.`);

  } else {
    feasibilitySummary = `Lokasi tapak dikategorikan ZONA HIJAU (Sangat Layak). Lahan sesuai dengan peruntukan tata ruang kawasan budi daya dan memiliki tingkat risiko bencana rendah.`;
    
    feasibilityReasons.push(`KAWASAN BUDI DAYA: Sesuai dengan RTRW ${matchedDistrictName} untuk peruntukan ${sector}.`);
    feasibilityReasons.push(`RISIKO BENCANA RENDAH: Kondisi geologis dan topografi stabil dengan aksesibilitas yang baik.`);
    feasibilityReasons.push(`KKPR DIPROYEKSIKAN SETUJU: Proses perizinan tata ruang dan lingkungan dapat diproses melalui prosedur standar.`);
  }

  // KKPR (Kesesuaian Kegiatan Pemanfaatan Ruang)
  let kkprStatus = 'KKPR Disetujui Otomatis (RTRW Budi Daya Komersial/Industri)';
  if (feasibilityStatus.includes('ZONA MERAH')) {
    kkprStatus = 'KKPR Ditolak (Tumpang tindih Kawasan Lindung / Hutan Tutupan Negara)';
  } else if (feasibilityStatus.includes('ZONA KUNING')) {
    kkprStatus = 'KKPR Bersyarat (Memerlukan Rekomendasi Teknis Dinas PUPR & AMDAL)';
  }

  // Mitigation Notes
  const mitigationNotes: string[] = [];
  if (protectedAreaHa > 0) {
    mitigationNotes.push(`Alokasikan sekurang-kurangnya ${protectedAreaHa} Ha (${(protectedRatio * 100).toFixed(0)}%) dari total plot sebagai Ruang Terbuka Hijau (RTH) / Zona Resapan Air.`);
  }
  if (highRiskAreaHa > 0) {
    mitigationNotes.push(`Wajib menerapkan rekayasa struktur tahan gempa SNI 1726:2019 & dinding penahan tanah (Retaining Wall) pada area seluas ${highRiskAreaHa} Ha.`);
  }
  mitigationNotes.push(`Diwajibkan menyusun dokumen AMDAL / UKL-UPL dan sistem pengelolaan limbah sebelum operasional fisik.`);
  mitigationNotes.push(`Pemasangan EWS (Early Warning System) terintegrasi BPBD ${matchedDistrictName}.`);

  const disasterPotentials = {
    landslide: hazardPotentials.find(h => h.hazard.includes('Longsor'))?.risk || 'Rendah',
    flood: hazardPotentials.find(h => h.hazard.includes('Banjir'))?.risk || 'Rendah',
    earthquake: hazardPotentials.find(h => h.hazard.includes('Gempa'))?.risk || 'Rendah',
    wildfire: hazardPotentials.find(h => h.hazard.includes('Karhutla'))?.risk || 'Nihil',
  };

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
    kkprStatus,
    mitigationNotes,
    technicalMitigation: mitigationNotes,
    analyzedAt: new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}
