import { HazardLayerConfig, HazardType } from '../types';

export const HAZARD_LAYERS: Record<HazardType, HazardLayerConfig> = {
  flood: {
    id: 'flood',
    name: 'Flood Risk Index (100-Yr Return)',
    description: '100-year flood inundation depth modeled using Google Earth Engine Sentinel-1 SAR & Copernicus DEM data.',
    unit: 'meters inundation',
    geeAsset: 'projects/gee-disaster-mapping/assets/flood_hazard_100yr_v2',
    colorPalette: {
      low: '#10b981',     // Hijau (Rendah - Kelas 1)
      medium: '#f59e0b',  // Kuning (Sedang - Kelas 2)
      high: '#f43f5e',    // Merah (Tinggi - Kelas 3)
      extreme: '#9f1239', // Dark Crimson
    },
    rangeText: '0.1m - 4.5m Inundation Depth',
  },
  landslide: {
    id: 'landslide',
    name: 'Landslide Susceptibility Index',
    description: 'Slope, rainfall intensity, soil saturation, and fault line proximity raster derived from GEE SRTM + CHIRPS.',
    unit: 'vulnerability score (0-100)',
    geeAsset: 'projects/gee-disaster-mapping/assets/landslide_susceptibility_2025',
    colorPalette: {
      low: '#10b981',     // Hijau (Rendah - Kelas 1)
      medium: '#f59e0b',  // Kuning (Sedang - Kelas 2)
      high: '#f43f5e',    // Merah (Tinggi - Kelas 3)
      extreme: '#9f1239', // Dark Crimson
    },
    rangeText: 'Score 0 to 100',
  },
  wildfire: {
    id: 'wildfire',
    name: 'Wildfire Exposure & Canopy Density',
    description: 'MODIS/VIIRS thermal anomaly historic density combined with Sentinel-2 NDVI canopy dryness index.',
    unit: 'burn severity / fuel load',
    geeAsset: 'projects/gee-disaster-mapping/assets/wildfire_fuel_exposure_2025',
    colorPalette: {
      low: '#10b981',     // Hijau (Rendah - Kelas 1)
      medium: '#f59e0b',  // Kuning (Sedang - Kelas 2)
      high: '#f43f5e',    // Merah (Tinggi - Kelas 3)
      extreme: '#9f1239', // Dark Crimson
    },
    rangeText: 'Low to Severe Fire Danger',
  },
  coastal: {
    id: 'coastal',
    name: 'Coastal Storm Surge & Inundation',
    description: 'Sea level rise projection + storm surge elevation zone calculated using ETOPO1 global relief.',
    unit: 'surge elevation above MSL',
    geeAsset: 'projects/gee-disaster-mapping/assets/coastal_surge_risk_50yr',
    colorPalette: {
      low: '#10b981',     // Hijau (Rendah - Kelas 1)
      medium: '#f59e0b',  // Kuning (Sedang - Kelas 2)
      high: '#f43f5e',    // Merah (Tinggi - Kelas 3)
      extreme: '#9f1239', // Dark Crimson
    },
    rangeText: '0m to 5m Surge Height',
  },
};
