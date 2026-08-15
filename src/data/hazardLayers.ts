import { HazardLayerConfig, HazardType } from '../types';

export const HAZARD_LAYERS: Record<HazardType, HazardLayerConfig> = {
  flood: {
    id: 'flood',
    name: 'Indeks Risiko Banjir',
    description: 'Peta kelas risiko banjir genangan Kabupaten Banjarnegara berdasarkan analisis DAS Sungai Serayu & anak sungai.',
    unit: 'kelas risiko',
    geeAsset: 'projects/gee-disaster-mapping/assets/banjarnegara_flood_risk',
    colorPalette: {
      low: '#15803d',     // Hijau (Rendah - 0 s.d 0.3)
      medium: '#f59e0b',  // Kuning (Sedang - 0.3 s.d 0.6)
      high: '#ef4444',    // Merah (Tinggi - 0.6 s.d 1.0)
      extreme: '#b91c1c', // Merah Pekat
    },
    rangeText: 'Rendah (0-0.3) – Sedang (0.3-0.6) – Tinggi (0.6-1.0)',
  },
  flashflood: {
    id: 'flashflood',
    name: 'Indeks Risiko Banjir Bandang',
    description: 'Peta kelas risiko banjir bandang alur sungai sempit & lereng curam Kabupaten Banjarnegara.',
    unit: 'kelas risiko',
    geeAsset: 'projects/gee-disaster-mapping/assets/banjarnegara_flashflood_risk',
    colorPalette: {
      low: '#15803d',     // Hijau (Rendah - 0 s.d 0.3)
      medium: '#f59e0b',  // Kuning (Sedang - 0.3 s.d 0.6)
      high: '#ef4444',    // Merah (Tinggi - 0.6 s.d 1.0)
      extreme: '#b91c1c', // Merah Pekat
    },
    rangeText: 'Rendah (0-0.3) – Sedang (0.3-0.6) – Tinggi (0.6-1.0)',
  },
  landslide: {
    id: 'landslide',
    name: 'Indeks Kerentanan Longsor',
    description: 'Peta kelas kerentanan tanah longsor berdasarkan kemiringan lereng, curah hujan, dan jenis tanah wilayah Banjarnegara.',
    unit: 'kelas risiko',
    geeAsset: 'projects/gee-disaster-mapping/assets/banjarnegara_landslide_susceptibility',
    colorPalette: {
      low: '#15803d',     // Hijau (Rendah - 0 s.d 0.3)
      medium: '#f59e0b',  // Kuning (Sedang - 0.3 s.d 0.6)
      high: '#ef4444',    // Merah (Tinggi - 0.6 s.d 1.0)
      extreme: '#b91c1c', // Merah Pekat
    },
    rangeText: 'Rendah (0-0.3) – Sedang (0.3-0.6) – Tinggi (0.6-1.0)',
  },
  earthquake: {
    id: 'earthquake',
    name: 'Indeks Risiko Gempa Bumi',
    description: 'Peta kelas risiko gempa bumi berdasarkan proximity sesar aktif & data historis guncangan di wilayah Banjarnegara.',
    unit: 'kelas risiko',
    geeAsset: 'projects/gee-disaster-mapping/assets/banjarnegara_earthquake_risk',
    colorPalette: {
      low: '#15803d',     // Hijau (Rendah - 0 s.d 0.3)
      medium: '#f59e0b',  // Kuning (Sedang - 0.3 s.d 0.6)
      high: '#ef4444',    // Merah (Tinggi - 0.6 s.d 1.0)
      extreme: '#b91c1c', // Merah Pekat
    },
    rangeText: 'Rendah (0-0.3) – Sedang (0.3-0.6) – Tinggi (0.6-1.0)',
  },
  liquefaction: {
    id: 'liquefaction',
    name: 'Indeks Risiko Likuifaksi',
    description: 'Peta kelas risiko likuifaksi tanah akibat getaran gempa di kawasan aluvial DAS Serayu, Banjarnegara.',
    unit: 'kelas risiko',
    geeAsset: 'projects/gee-disaster-mapping/assets/banjarnegara_liquefaction_risk',
    colorPalette: {
      low: '#15803d',     // Hijau (Rendah - 0 s.d 0.3)
      medium: '#f59e0b',  // Kuning (Sedang - 0.3 s.d 0.6)
      high: '#ef4444',    // Merah (Tinggi - 0.6 s.d 1.0)
      extreme: '#b91c1c', // Merah Pekat
    },
    rangeText: 'Rendah (0-0.3) – Sedang (0.3-0.6) – Tinggi (0.6-1.0)',
  },
};
