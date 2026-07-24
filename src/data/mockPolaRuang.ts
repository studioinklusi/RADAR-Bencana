import { PolaRuangFeatureCollection } from '../types';

// GeoJSON collection representing Pola Ruang RTRW (Spatial Plan Zoning) in Jawa Barat
export const POLA_RUANG_DATA: PolaRuangFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'PR-3204-01',
      properties: {
        id_pola_ruang: 'PR-3204-01',
        kode_zona: 'HL',
        nama_zona: 'Hutan Lindung Cikole & Kamojang',
        kategori_utama: 'Kawasan Lindung',
        sub_zona_pola_ruang: 'Hutan Konservasi & Resapan Air',
        kabupaten_kota: 'Kabupaten Bandung Barat',
        luas_ha: 1250.5,
        ketentuan_kkpr: 'Dilarang Bangunan Non-Konservasi / Moratorium Komersial',
        status_konservasi: 'Zona Merah (Protected)',
        color: '#16a34a' // Green
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [107.58, -6.78],
            [107.68, -6.78],
            [107.70, -6.84],
            [107.60, -6.84],
            [107.58, -6.78]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'PR-3204-02',
      properties: {
        id_pola_ruang: 'PR-3204-02',
        kode_zona: 'KPI',
        nama_zona: 'Kawasan Peruntukan Industri Dayeuhkolot & Rancaekek',
        kategori_utama: 'Kawasan Budi Daya',
        sub_zona_pola_ruang: 'Zona Industri & Logistik Perkotaan',
        kabupaten_kota: 'Kabupaten Bandung',
        luas_ha: 850.0,
        ketentuan_kkpr: 'KKPR Disetujui Otomatis / Bersyarat Peil Banjir DAS Citarum',
        status_konservasi: 'Zona Budi Daya Komersial',
        color: '#9333ea' // Purple
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [107.60, -6.96],
            [107.72, -6.96],
            [107.74, -7.02],
            [107.62, -7.02],
            [107.60, -6.96]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'PR-3204-03',
      properties: {
        id_pola_ruang: 'PR-3204-03',
        kode_zona: 'KBAU',
        nama_zona: 'Kawasan Bandung Utara (Sempadan Lembang & Sesar Active)',
        kategori_utama: 'Kawasan Lindung',
        sub_zona_pola_ruang: 'Kawasan Resapan & Sempadan Sesar Aktif',
        kabupaten_kota: 'Kabupaten Bandung Barat',
        luas_ha: 3400.2,
        ketentuan_kkpr: 'Pengawasan Ketat / Wajib AMDAL + KDB Maksimal 20%',
        status_konservasi: 'Zona Merah (Sesar Active & Resapan)',
        color: '#0d9488' // Teal
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [107.54, -6.80],
            [107.66, -6.80],
            [107.68, -6.86],
            [107.56, -6.86],
            [107.54, -6.80]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'PR-3204-04',
      properties: {
        id_pola_ruang: 'PR-3204-04',
        kode_zona: 'PP-1',
        nama_zona: 'Kawasan Pemukiman & Jasa Perkotaan Bandung',
        kategori_utama: 'Kawasan Budi Daya',
        sub_zona_pola_ruang: 'Pemukiman Kepadatan Tinggi & Pusat Bisnis',
        kabupaten_kota: 'Kota Bandung',
        luas_ha: 2100.0,
        ketentuan_kkpr: 'Disetujui untuk Usaha Jasa, Perdagangan, & Pemukiman',
        status_konservasi: 'Zona Budi Daya Perkotaan',
        color: '#eab308' // Yellow
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [107.55, -6.87],
            [107.67, -6.87],
            [107.67, -6.95],
            [107.55, -6.95],
            [107.55, -6.87]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'PR-3203-05',
      properties: {
        id_pola_ruang: 'PR-3203-05',
        kode_zona: 'HSA',
        nama_zona: 'Suaka Margasatwa & Resapan Air Gede Pangrango',
        kategori_utama: 'Kawasan Lindung',
        sub_zona_pola_ruang: 'Resapan Air & Hutan Conservasi Biodiversitas',
        kabupaten_kota: 'Kabupaten Cianjur',
        luas_ha: 5200.0,
        ketentuan_kkpr: 'Dilarang Alih Fungsi Lahan / Terproteksi Undang-Undang',
        status_konservasi: 'Zona Merah (Hutan Lindung)',
        color: '#065f46' // Dark Emerald Green
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [106.90, -6.75],
            [107.05, -6.75],
            [107.08, -6.88],
            [106.93, -6.88],
            [106.90, -6.75]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'PR-3216-06',
      properties: {
        id_pola_ruang: 'PR-3216-06',
        kode_zona: 'KPI-2',
        nama_zona: 'Kawasan Industri Koridor Cikarang & Karawang',
        kategori_utama: 'Kawasan Budi Daya',
        sub_zona_pola_ruang: 'Kawasan Industri Manufaktur & Otomotif',
        kabupaten_kota: 'Kabupaten Bekasi & Karawang',
        luas_ha: 6800.0,
        ketentuan_kkpr: 'Disetujui Otomatis Kawasan Industri Berizin / KITE',
        status_konservasi: 'Zona Budi Daya Industri Utama',
        color: '#a855f7' // Violet
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [107.10, -6.25],
            [107.35, -6.25],
            [107.38, -6.38],
            [107.12, -6.38],
            [107.10, -6.25]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'PR-3212-07',
      properties: {
        id_pola_ruang: 'PR-3212-07',
        kode_zona: 'KP-1',
        nama_zona: 'Kawasan Pertanian Pangan Berkelanjutan (LP2B)',
        kategori_utama: 'Kawasan Budi Daya',
        sub_zona_pola_ruang: 'Sawah Irigasi Teknis Lahan Pertanian Abadi',
        kabupaten_kota: 'Kabupaten Subang & Indramayu',
        luas_ha: 8900.0,
        ketentuan_kkpr: 'Dilarang Alih Fungsi Lahan Sawah ke Non-Pertanian',
        status_konservasi: 'Zona Kuning (LP2B Terproteksi)',
        color: '#84cc16' // Lime Green
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [107.70, -6.35],
            [108.10, -6.35],
            [108.15, -6.55],
            [107.75, -6.55],
            [107.70, -6.35]
          ]
        ]
      }
    }
  ]
};
