export type HazardType = 'flood' | 'flashflood' | 'landslide' | 'earthquake' | 'liquefaction';

export interface HazardLayerConfig {
  id: HazardType;
  name: string;
  description: string;
  unit: string;
  geeAsset: string;
  colorPalette: {
    low: string;
    medium: string;
    high: string;
    extreme: string;
  };
  rangeText: string;
}

export interface AdminProperties {
  id: string;
  code: string;
  name: string;
  type?: string;
  province: string;
  population: number;
  area_km2?: number;
  total_area_ha: number;
  density_per_km2?: number;
  hospital_count?: number;
  school_count?: number;
  bridge_count?: number;
  primary_vulnerability?: string;
  subdistrict?: string;
  district?: string;
  luas_risiko_tinggi_ha?: number;
  luas_risiko_sedang_ha?: number;
  luas_risiko_rendah_ha?: number;
}

export interface AdminFeature {
  type: 'Feature';
  id: string;
  properties: AdminProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any[];
  };
}

export interface AdminFeatureCollection {
  type: 'FeatureCollection';
  features: AdminFeature[];
}

export interface ZonalStatistics {
  districtId: string;
  districtName: string;
  provinceName: string;
  totalAreaHa: number;
  highRiskHa: number;
  mediumRiskHa: number;
  lowRiskHa: number;
  highRiskPct: number;
  mediumRiskPct: number;
  lowRiskPct: number;
  affectedPopulation: number;
  popRendah?: number;
  popSedang?: number;
  popTinggi?: number;
  dominantRiskClass?: 'Rendah' | 'Sedang' | 'Tinggi';
  dataSource?: 'dasimetrik' | 'estimasi';
  hospitalsExposed: number;
  schoolsExposed: number;
  bridgesExposed: number;
  riskCategory: 'Critical' | 'High' | 'Moderate' | 'Low';
  overallScore: number; // 0 - 100
  isClipped: boolean;
  computedAt: string;
}

export interface MapLayerResponse {
  layerId: HazardType;
  mapId: string;
  tileUrlPattern: string;
  bbox: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  isClipped: boolean;
  clippedDistrictId?: string;
  geeAssetUsed: string;
  palette: string[];
}

export interface AIRiskAssessment {
  districtName: string;
  hazardType: string;
  severityLevel: string;
  executiveSummary: string;
  vulnerabilityFactors: string[];
  immediateActionPlan: string[];
  longTermMitigations: string[];
  emergencyContactProtocol: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface PythonCodeTab {
  filename: string;
  language: string;
  code: string;
  description: string;
}

export type FacilityCategory = 'kritis' | 'umum';

export type FacilitySubType = 
  | 'Rumah Sakit' 
  | 'Posko BPBD' 
  | 'Pemadam' 
  | 'Polisi' 
  | 'Sekolah / Pengungsian' 
  | 'Tempat Ibadah' 
  | 'Pasar / Logistik' 
  | 'Gedung Olahraga';

export interface FacilityItem {
  id: string;
  name: string;
  category: FacilityCategory;
  subType: FacilitySubType;
  villageName?: string;
  subdistrictName?: string;
  districtName: string;
  coordinates: [number, number];
  capacityInfo?: string;
  contact?: string;
  status: 'Siap Operasional' | 'Kapasitas Penuh' | 'Siaga Bencana';
  address: string;
}

export interface DisasterIncident {
  id: string;
  title: string;
  hazardType: HazardType;
  date: string; // YYYY-MM-DD
  year: number;
  locationName: string;
  villageName?: string; // Nama Desa / Kelurahan
  subdistrictName?: string; // Nama Kecamatan
  districtId: string;
  districtName: string; // Kabupaten / Kota
  coordinates: [number, number]; // [lat, lng]
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedVictims: number;
  evacuatedPeople: number;
  damagedHouses: number;
  infrastructureImpact?: string; // Dampak Infrastruktur / Fasilitas
  status: 'Aktif / Penanganan' | 'Telah Tertangani' | 'Waspada' | 'Tanggap Darurat';
  description: string;
}

export interface RadarInvestInput {
  lat: number;
  lng: number;
  plotAreaHa: number;
  sector: string;
  projectName: string;
}

export interface RadarInvestResult {
  lat: number;
  lng: number;
  plotAreaHa: number;
  sector: string;
  projectName: string;
  districtName: string;
  subdistrictName: string;
  villageName: string;
  isProtectedZone: boolean;
  zoneCategory: 'Kawasan Lindung / Hutan Konservasi' | 'Kawasan Budi Daya / Peruntukan Industri' | 'Kawasan Resapan Air / Penyangga' | 'Kawasan Sempadan Sungai / Pantai' | 'Kawasan Sempadan Sungai / Lembah Serayu' | 'Kawasan Resapan Air / Lereng Perbukitan' | string;
  feasibilityStatus: 'TIDAK DIREKOMENDASIKAN (ZONA MERAH)' | 'BISA DIBANGUN DENGAN SYARAT KETAT (ZONA KUNING)' | 'DIREKOMENDASIKAN (ZONA HIJAU)';
  feasibilitySummary?: string;
  feasibilityReasons?: string[];
  overallRiskLevel: 'Sangat Tinggi' | 'Tinggi' | 'Sedang' | 'Rendah';
  hazardPotentials: { hazard: string; risk: 'Tinggi' | 'Sedang' | 'Rendah' | 'Nihil'; details: string }[];
  disasterPotentials?: {
    landslide: string;
    flood: string;
    earthquake: string;
    wildfire: string;
  };
  areaBreakdown: {
    totalPlotHa: number;
    protectedAreaHa: number;
    buildableAreaHa: number;
    highRiskAreaHa: number;
    mediumRiskAreaHa: number;
    lowRiskAreaHa: number;
  };
  siteRiskLevel: 'Rendah (Aman)' | 'Sedang (Waspada)' | 'Tinggi (Rawan Bencana)';
  safetyScore: number;
  structuralMitigations: string[];
  nonStructuralMitigations: string[];
  mitigationNotes: string[];
  technicalMitigation?: string[];
  analyzedAt: string;
}

export interface PolaRuangProperties {
  id_pola_ruang: string;
  kode_zona: string;
  nama_zona: string;
  kategori_utama: 'Kawasan Lindung' | 'Kawasan Budi Daya' | 'Badan Air' | string;
  sub_zona_pola_ruang: string;
  kabupaten_kota: string;
  luas_ha: number;
  pedoman_zonasi?: string;
  ketentuan_kkpr?: string;
  status_konservasi: string;
  color?: string;
  pola_ruang_raw?: string;
  pl_convert?: string;
}

export interface PolaRuangFeature {
  type: 'Feature';
  id: string;
  properties: PolaRuangProperties;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: any[];
  };
}

export interface PolaRuangFeatureCollection {
  type: 'FeatureCollection';
  name?: string;
  crs?: any;
  features: PolaRuangFeature[];
}

