import { HazardLayerConfig, HazardType } from '../types';

export const HAZARD_LAYERS: Record<HazardType, HazardLayerConfig> = {
  flood: {
    id: 'flood',
    name: 'Indeks Risiko Banjir',
    description: 'Peta kelas risiko banjir genangan Kabupaten Banjarnegara berdasarkan analisis DAS Sungai Serayu & anak sungai.',
    unit: 'kelas risiko',
    geeAsset: 'projects/gee-disaster-mapping/assets/banjarnegara_flood_risk',
    colorPalette: {
      low: '#10b981',     // Hijau (Rendah - DN 1)
      medium: '#f59e0b',  // Kuning (Sedang - DN 2)
      high: '#f43f5e',    // Merah (Tinggi - DN 3)
      extreme: '#9f1239', // Dark Crimson
    },
    rangeText: 'Rendah – Sedang – Tinggi',
  },
  flashflood: {
    id: 'flashflood',
    name: 'Indeks Risiko Banjir Bandang',
    description: 'Peta kelas risiko banjir bandang alur sungai sempit & lereng curam Kabupaten Banjarnegara.',
    unit: 'kelas risiko',
    geeAsset: 'projects/gee-disaster-mapping/assets/banjarnegara_flashflood_risk',
    colorPalette: {
      low: '#10b981',     // Hijau (Rendah - DN 1)
      medium: '#f59e0b',  // Kuning (Sedang - DN 2)
      high: '#f43f5e',    // Merah (Tinggi - DN 3)
      extreme: '#9f1239', // Dark Crimson
    },
    rangeText: 'Rendah – Sedang – Tinggi',
  },
  landslide: {
    id: 'landslide',
    name: 'Indeks Kerentanan Longsor',
    description: 'Peta kelas kerentanan tanah longsor berdasarkan kemiringan lereng, curah hujan, dan jenis tanah wilayah Banjarnegara.',
    unit: 'kelas risiko',
    geeAsset: 'projects/gee-disaster-mapping/assets/banjarnegara_landslide_susceptibility',
    colorPalette: {
      low: '#10b981',     // Hijau (Rendah - DN 1)
      medium: '#f59e0b',  // Kuning (Sedang - DN 2)
      high: '#f43f5e',    // Merah (Tinggi - DN 3)
      extreme: '#9f1239', // Dark Crimson
    },
    rangeText: 'Rendah – Sedang – Tinggi',
  },
  earthquake: {
    id: 'earthquake',
    name: 'Indeks Risiko Gempa Bumi',
    description: 'Peta kelas risiko gempa bumi berdasarkan proximity sesar aktif & data historis guncangan di wilayah Banjarnegara.',
    unit: 'kelas risiko',
    geeAsset: 'projects/gee-disaster-mapping/assets/banjarnegara_earthquake_risk',
    colorPalette: {
      low: '#10b981',     // Hijau (Rendah - DN 1)
      medium: '#f59e0b',  // Kuning (Sedang - DN 2)
      high: '#f43f5e',    // Merah (Tinggi - DN 3)
      extreme: '#9f1239', // Dark Crimson
    },
    rangeText: 'Rendah – Sedang – Tinggi',
  },
  liquefaction: {
    id: 'liquefaction',
    name: 'Indeks Risiko Likuifaksi',
    description: 'Peta kelas risiko likuifaksi tanah akibat getaran gempa di kawasan aluvial DAS Serayu, Banjarnegara.',
    unit: 'kelas risiko',
    geeAsset: 'projects/gee-disaster-mapping/assets/banjarnegara_liquefaction_risk',
    colorPalette: {
      low: '#10b981',     // Hijau (Rendah - DN 1)
      medium: '#f59e0b',  // Kuning (Sedang - DN 2)
      high: '#f43f5e',    // Merah (Tinggi - DN 3)
      extreme: '#9f1239', // Dark Crimson
    },
    rangeText: 'Rendah – Sedang – Tinggi',
  },
};
