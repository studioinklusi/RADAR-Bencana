import { PolaRuangFeatureCollection } from '../types';

// GeoJSON collection representing Pola Ruang RTRW (Spatial Plan Zoning) in Kabupaten Banjarnegara, Jawa Tengah
export const POLA_RUANG_DATA: PolaRuangFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      id: 'PR-BNJ-01',
      properties: {
        id_pola_ruang: 'PR-BNJ-01',
        kode_zona: 'HL',
        nama_zona: 'Kawasan Hutan Lindung & Resapan Dieng',
        kategori_utama: 'Kawasan Lindung',
        sub_zona_pola_ruang: 'Hutan Konservasi & Resapan Air Lereng Utara',
        kabupaten_kota: 'Kabupaten Banjarnegara',
        luas_ha: 4250.5,
        ketentuan_kkpr: 'Dilarang Alih Fungsi Lahan / Moratorium Komersial Non-Konservasi',
        status_konservasi: 'Zona Merah (Protected)',
        color: '#16a34a' // Green
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [109.70, -7.20],
            [109.80, -7.20],
            [109.78, -7.28],
            [109.68, -7.25],
            [109.70, -7.20]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'PR-BNJ-02',
      properties: {
        id_pola_ruang: 'PR-BNJ-02',
        kode_zona: 'KPI',
        nama_zona: 'Kawasan Peruntukan Industri Bawang & Purwonegoro',
        kategori_utama: 'Kawasan Budi Daya',
        sub_zona_pola_ruang: 'Zona Industri Pengolahan & Logistik Koridor Serayu',
        kabupaten_kota: 'Kabupaten Banjarnegara',
        luas_ha: 1420.0,
        ketentuan_kkpr: 'KKPR Disetujui Bersyarat Peil Banjir DAS Serayu & Kajian Geoteknik Longsor',
        status_konservasi: 'Zona Budi Daya Komersial',
        color: '#9333ea' // Purple
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [109.60, -7.42],
            [109.68, -7.42],
            [109.66, -7.47],
            [109.58, -7.46],
            [109.60, -7.42]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'PR-BNJ-03',
      properties: {
        id_pola_ruang: 'PR-BNJ-03',
        kode_zona: 'KPB',
        nama_zona: 'Kawasan Permukiman Padat Kota Banjarnegara',
        kategori_utama: 'Kawasan Budi Daya',
        sub_zona_pola_ruang: 'Perumahan & Fasilitas Umum Perkotaan',
        kabupaten_kota: 'Kabupaten Banjarnegara',
        luas_ha: 2890.0,
        ketentuan_kkpr: 'Pembangunan Wajib Mengikuti Sempadan Sungai Serayu & Kode Bangunan Tahan Gempa',
        status_konservasi: 'Zona Perkotaan / Pemukiman',
        color: '#3b82f6' // Blue
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [109.68, -7.38],
            [109.73, -7.38],
            [109.72, -7.43],
            [109.67, -7.42],
            [109.68, -7.38]
          ]
        ]
      }
    },
    {
      type: 'Feature',
      id: 'PR-BNJ-04',
      properties: {
        id_pola_ruang: 'PR-BNJ-04',
        kode_zona: 'KSR',
        nama_zona: 'Sempadan Sungai Serayu & Merawu',
        kategori_utama: 'Kawasan Lindung',
        sub_zona_pola_ruang: 'Zona Perlindungan Sempadan Sungai & Buffer Banjir',
        kabupaten_kota: 'Kabupaten Banjarnegara',
        luas_ha: 1850.2,
        ketentuan_kkpr: 'Dilarang Bangunan Permanen dalam Radius 50m dari Garis Sempadan Sungai',
        status_konservasi: 'Zona Kuning (Sempadan Protection)',
        color: '#eab308' // Yellow
      },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [109.62, -7.39],
            [109.75, -7.39],
            [109.74, -7.41],
            [109.61, -7.41],
            [109.62, -7.39]
          ]
        ]
      }
    }
  ]
};
