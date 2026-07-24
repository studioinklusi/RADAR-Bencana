import { AdminFeatureCollection } from '../types';

// GeoJSON collection representing Administrative Districts (Kabupaten / Kota) in Jawa Barat (West Java), Indonesia
export const ADMIN_BOUNDARIES: AdminFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: '3209',
      properties: {
        id: '3209',
        code: 'KAB-CIREBON',
        name: 'Kabupaten Cirebon',
        type: 'Kabupaten',
        province: 'Jawa Barat',
        population: 2270000,
        area_km2: 990.36,
        total_area_ha: 99036,
        density_per_km2: 2292,
        hospital_count: 12,
        school_count: 145,
        bridge_count: 48,
        primary_vulnerability: 'Banjir Pesisir & Luapan Sungai Cimanuk',
        luas_risiko_tinggi_ha: 28500,
        luas_risiko_sedang_ha: 35200,
        luas_risiko_rendah_ha: 35336,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [108.40, -6.65],
            [108.75, -6.65],
            [108.80, -6.90],
            [108.45, -6.90],
            [108.40, -6.65]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: '3208',
      properties: {
        id: '3208',
        code: 'KAB-KUNINGAN',
        name: 'Kabupaten Kuningan',
        type: 'Kabupaten',
        province: 'Jawa Barat',
        population: 1130000,
        area_km2: 1110.56,
        total_area_ha: 111056,
        density_per_km2: 1017,
        hospital_count: 8,
        school_count: 112,
        bridge_count: 36,
        primary_vulnerability: 'Tanah Longsor Lereng Gunung Ciremai',
        luas_risiko_tinggi_ha: 38200,
        luas_risiko_sedang_ha: 42100,
        luas_risiko_rendah_ha: 30756,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [108.45, -6.90],
            [108.75, -6.90],
            [108.70, -7.20],
            [108.35, -7.15],
            [108.45, -6.90]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: '3202',
      properties: {
        id: '3202',
        code: 'KAB-SUKABUMI',
        name: 'Kabupaten Sukabumi',
        type: 'Kabupaten',
        province: 'Jawa Barat',
        population: 2725000,
        area_km2: 4145.0,
        total_area_ha: 414500,
        density_per_km2: 657,
        hospital_count: 15,
        school_count: 210,
        bridge_count: 84,
        primary_vulnerability: 'Gerakan Tanah, Banjir Bandang & Gelombang Pasang',
        luas_risiko_tinggi_ha: 145000,
        luas_risiko_sedang_ha: 168000,
        luas_risiko_rendah_ha: 101500,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [106.35, -6.80],
            [107.05, -6.80],
            [107.00, -7.45],
            [106.35, -7.45],
            [106.35, -6.80]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: '3204',
      properties: {
        id: '3204',
        code: 'KAB-BANDUNG',
        name: 'Kabupaten Bandung',
        type: 'Kabupaten',
        province: 'Jawa Barat',
        population: 3620000,
        area_km2: 1767.96,
        total_area_ha: 176796,
        density_per_km2: 2047,
        hospital_count: 18,
        school_count: 320,
        bridge_count: 62,
        primary_vulnerability: 'Banjir Genangan Citarum & Longsor Hillside',
        luas_risiko_tinggi_ha: 45200,
        luas_risiko_sedang_ha: 68400,
        luas_risiko_rendah_ha: 63196,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [107.40, -6.85],
            [107.85, -6.85],
            [107.80, -7.25],
            [107.35, -7.20],
            [107.40, -6.85]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: '3205',
      properties: {
        id: '3205',
        code: 'KAB-GARUT',
        name: 'Kabupaten Garut',
        type: 'Kabupaten',
        province: 'Jawa Barat',
        population: 2630000,
        area_km2: 3065.19,
        total_area_ha: 306519,
        density_per_km2: 858,
        hospital_count: 11,
        school_count: 180,
        bridge_count: 55,
        primary_vulnerability: 'Banjir Bandang Sungai Cimanuk & Erupsi Gunung Api',
        luas_risiko_tinggi_ha: 98400,
        luas_risiko_sedang_ha: 112000,
        luas_risiko_rendah_ha: 96119,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [107.80, -7.00],
            [108.20, -7.00],
            [108.15, -7.70],
            [107.75, -7.65],
            [107.80, -7.00]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: '3206',
      properties: {
        id: '3206',
        code: 'KAB-TASIKMALAYA',
        name: 'Kabupaten Tasikmalaya',
        type: 'Kabupaten',
        province: 'Jawa Barat',
        population: 1860000,
        area_km2: 2551.19,
        total_area_ha: 255119,
        density_per_km2: 729,
        hospital_count: 9,
        school_count: 155,
        bridge_count: 42,
        primary_vulnerability: 'Gerakan Tanah Lereng Terjal & Abrasi Pantai',
        luas_risiko_tinggi_ha: 78500,
        luas_risiko_sedang_ha: 94200,
        luas_risiko_rendah_ha: 82419,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [108.00, -7.20],
            [108.40, -7.20],
            [108.35, -7.80],
            [107.95, -7.75],
            [108.00, -7.20]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: '3212',
      properties: {
        id: '3212',
        code: 'KAB-INDRAMAYU',
        name: 'Kabupaten Indramayu',
        type: 'Kabupaten',
        province: 'Jawa Barat',
        population: 1850000,
        area_km2: 2040.11,
        total_area_ha: 204011,
        density_per_km2: 906,
        hospital_count: 10,
        school_count: 160,
        bridge_count: 38,
        primary_vulnerability: 'Banjir Rob Pesisir Utara & Inundasi Sawah',
        luas_risiko_tinggi_ha: 62300,
        luas_risiko_sedang_ha: 75100,
        luas_risiko_rendah_ha: 66611,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [107.90, -6.25],
            [108.50, -6.25],
            [108.40, -6.65],
            [107.85, -6.65],
            [107.90, -6.25]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: '3203',
      properties: {
        id: '3203',
        code: 'KAB-CIANJUR',
        name: 'Kabupaten Cianjur',
        type: 'Kabupaten',
        province: 'Jawa Barat',
        population: 2470000,
        area_km2: 3614.35,
        total_area_ha: 361435,
        density_per_km2: 683,
        hospital_count: 8,
        school_count: 175,
        bridge_count: 49,
        primary_vulnerability: 'Sesar Cugenang Gempa & Tanah Longsor',
        luas_risiko_tinggi_ha: 112000,
        luas_risiko_sedang_ha: 145000,
        luas_risiko_rendah_ha: 104435,
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [106.95, -6.70],
            [107.45, -6.70],
            [107.40, -7.50],
            [106.90, -7.45],
            [106.95, -6.70]
          ]
        ]
      }
    }
  ]
};
