import { PolaRuangFeatureCollection } from '../types';

export interface PolaRuangZoneMetadata {
  kode_zona: string;
  nama_zona: string;
  pola_ruang_raw: string;
  kategori_utama: 'Kawasan Lindung' | 'Kawasan Budi Daya' | 'Badan Air';
  sub_zona_pola_ruang: string;
  luas_ha: number;
  color: string;
  ketentuan_kkpr: string;
  status_konservasi: string;
}

// 14 Official Pola Ruang RTRW Zones of Kabupaten Banjarnegara V2
export const POLA_RUANG_ZONES: PolaRuangZoneMetadata[] = [
  {
    kode_zona: 'HL',
    nama_zona: 'HUTAN LINDUNG',
    pola_ruang_raw: 'HUTAN LINDUNG',
    kategori_utama: 'Kawasan Lindung',
    sub_zona_pola_ruang: 'Hutan Konservasi & Resapan Air Lereng Utara / Pegunungan Serayu',
    luas_ha: 2471.51,
    color: '#15803d',
    ketentuan_kkpr: 'Dilarang alih fungsi lahan / moratorium komersial. Wajib fungsi lindung dan resapan air.',
    status_konservasi: 'Zona Merah (Protected / Konservasi)'
  },
  {
    kode_zona: 'LB',
    nama_zona: 'KAWASAN LINDUNG BAWAHANNYA',
    pola_ruang_raw: 'KAWASAN LINDUNG BAWAHANNYA',
    kategori_utama: 'Kawasan Lindung',
    sub_zona_pola_ruang: 'Kawasan Resapan Air & Pengatur Tata Air Alami',
    luas_ha: 4372.69,
    color: '#047857',
    ketentuan_kkpr: 'Kawasan resapan air dan pengatur tata air. Dibatasi untuk aktivitas konstruksi kedap air.',
    status_konservasi: 'Zona Lindung Resapan Air'
  },
  {
    kode_zona: 'SS',
    nama_zona: 'SEMPADAN SUNGAI',
    pola_ruang_raw: 'SEMPADAN SUNGAI',
    kategori_utama: 'Kawasan Lindung',
    sub_zona_pola_ruang: 'Koridor Sempadan DAS Serayu, Merawu, dan Anak Sungai',
    luas_ha: 2509.13,
    color: '#0891b2',
    ketentuan_kkpr: 'Sempadan Sungai Serayu, Merawu & anak sungai (10-50m). Bebas dari bangunan permanen untuk mitigasi banjir.',
    status_konservasi: 'Zona Perlindungan Sempadan'
  },
  {
    kode_zona: 'SPK',
    nama_zona: 'SEMPADAN PERKOTAAN',
    pola_ruang_raw: 'SEMPADAN PERKOTAAN',
    kategori_utama: 'Kawasan Lindung',
    sub_zona_pola_ruang: 'Ruang Terbuka Hijau (RTH) & Koridor Infrastruktur Kota',
    luas_ha: 2.96,
    color: '#06b6d4',
    ketentuan_kkpr: 'Ruang Terbuka Hijau (RTH) dan sempadan jalan utama/rel/jalur utilitas perkotaan.',
    status_konservasi: 'Zona Sempadan & RTH'
  },
  {
    kode_zona: 'BA',
    nama_zona: 'AIR TAWAR',
    pola_ruang_raw: 'AIR TAWAR',
    kategori_utama: 'Badan Air',
    sub_zona_pola_ruang: 'Waduk Mrica, Telaga Dieng & Tubuh Air Permukaan',
    luas_ha: 1558.30,
    color: '#0284c7',
    ketentuan_kkpr: 'Kawasan konservasi dan retensi air permukaan, dilarang alih fungsi komersial tanpa izin BBWS.',
    status_konservasi: 'Zona Konservasi Perairan'
  },
  {
    kode_zona: 'HPT',
    nama_zona: 'HUTAN PRODUKSI TERBATAS',
    pola_ruang_raw: 'HUTAN PRODUKSI TERBATAS',
    kategori_utama: 'Kawasan Lindung',
    sub_zona_pola_ruang: 'Hutan Produksi Lereng Curam & Agroforestri Berkelanjutan',
    luas_ha: 16263.69,
    color: '#16a34a',
    ketentuan_kkpr: 'Hanya untuk pemanfaatan hasil hutan non-kayu dan agroforestri terkendali dengan izin KPH/Perhutani.',
    status_konservasi: 'Zona Konservasi Terbatas'
  },
  {
    kode_zona: 'HP',
    nama_zona: 'HUTAN PRODUKSI TETAP',
    pola_ruang_raw: 'HUTAN PRODUKSI TETAP',
    kategori_utama: 'Kawasan Budi Daya',
    sub_zona_pola_ruang: 'Kawasan Kehutanan Produksi Kayu & HHBK Terencana',
    luas_ha: 324.66,
    color: '#65a30d',
    ketentuan_kkpr: 'Pemanfaatan hutan produksi terencana dan terkelola sesuai Rencana Kerja Usaha (RKU) kehutanan.',
    status_konservasi: 'Zona Budi Daya Kehutanan'
  },
  {
    kode_zona: 'PSI',
    nama_zona: 'PERTANIAN SAWAH IRIGASI',
    pola_ruang_raw: 'PERTANIAN SAWAH IRIGASI',
    kategori_utama: 'Kawasan Budi Daya',
    sub_zona_pola_ruang: 'Lahan Pertanian Pangan Berkelanjutan (LP2B) Beririgasi Teknis',
    luas_ha: 169.69,
    color: '#10b981',
    ketentuan_kkpr: 'Lahan sawah beririgasi teknis/semi-teknis (LP2B). Moratorium ketat alih fungsi perumahan/komersial.',
    status_konservasi: 'Zona LP2B Irigasi Teknis'
  },
  {
    kode_zona: 'PLB',
    nama_zona: 'PERTANIAN LAHAN BASAH',
    pola_ruang_raw: 'PERTANIAN LAHAN BASAH',
    kategori_utama: 'Kawasan Budi Daya',
    sub_zona_pola_ruang: 'Sawah Irigasi Desa & Pertanian Padi Sawah Lembah',
    luas_ha: 8907.78,
    color: '#22c55e',
    ketentuan_kkpr: 'Lahan Pertanian Pangan Berkelanjutan (LP2B). Dilindungi dari konversi/alih fungsi non-pertanian.',
    status_konservasi: 'Zona LP2B Dilindungi'
  },
  {
    kode_zona: 'PLK',
    nama_zona: 'PERTANIAN LAHAN KERING',
    pola_ruang_raw: 'PERTANIAN LAHAN KERING',
    kategori_utama: 'Kawasan Budi Daya',
    sub_zona_pola_ruang: 'Pertanian Tanaman Pangan Ladang & Kebun Campuran',
    luas_ha: 5511.68,
    color: '#a3e635',
    ketentuan_kkpr: 'Pertanian tanaman pangan ladang/kebun rakyat. Pengendalian erosi pada lereng >15%.',
    status_konservasi: 'Zona Budi Daya Tanaman Kering'
  },
  {
    kode_zona: 'PTH',
    nama_zona: 'PERTANIAN HORTIKULTURA',
    pola_ruang_raw: 'PERTANIAN HORTIKULTURA',
    kategori_utama: 'Kawasan Budi Daya',
    sub_zona_pola_ruang: 'Sentra Sayuran, Kentang Dieng, Palawija & Perkebunan Dataran Tinggi',
    luas_ha: 58873.94,
    color: '#84cc16',
    ketentuan_kkpr: 'Kawasan budidaya hortikultura/sayuran dataran tinggi dengan metode konservasi tanah dan terasering.',
    status_konservasi: 'Zona Pertanian Hortikultura'
  },
  {
    kode_zona: 'PDR',
    nama_zona: 'PERMUKIMAN PERDESAAN',
    pola_ruang_raw: 'PERMUKIMAN PERDESAAN',
    kategori_utama: 'Kawasan Budi Daya',
    sub_zona_pola_ruang: 'Perumahan Desa, Fasilitas Dusun & Lingkungan Pedesaan',
    luas_ha: 9283.00,
    color: '#f59e0b',
    ketentuan_kkpr: 'Pembangunan perumahan perdesaan, fasilitas sosial & umum dengan standar mitigasi bencana longsor/gempa.',
    status_konservasi: 'Zona Budi Daya Perdesaan'
  },
  {
    kode_zona: 'PKT',
    nama_zona: 'PERMUKIMAN PERKOTAAN',
    pola_ruang_raw: 'PERMUKIMAN PERKOTAAN',
    kategori_utama: 'Kawasan Budi Daya',
    sub_zona_pola_ruang: 'Pusat Kegiatan Lokal, Perdagangan, Jasa & Hunian Kota',
    luas_ha: 5443.74,
    color: '#ea580c',
    ketentuan_kkpr: 'Pembangunan intensif perkotaan wajib memenuhi KDB, KLB, sempadan jalan/sungai, dan sistem drainase perkotaan.',
    status_konservasi: 'Zona Budi Daya Perkotaan'
  },
  {
    kode_zona: 'KPI',
    nama_zona: 'INDUSTRI',
    pola_ruang_raw: 'INDUSTRI',
    kategori_utama: 'Kawasan Budi Daya',
    sub_zona_pola_ruang: 'Kawasan Peruntukan Industri Pengolahan, Pergudangan & Logistik',
    luas_ha: 351.24,
    color: '#9333ea',
    ketentuan_kkpr: 'KKPR disetujui bersyarat: AMDAL/UKL-UPL, peil banjir, buffer pemukiman, dan kajian stabilitas lereng.',
    status_konservasi: 'Zona Peruntukan Industri'
  }
];

// Fallback skeleton
export const POLA_RUANG_DATA: PolaRuangFeatureCollection = {
  type: 'FeatureCollection',
  features: []
};
