const fs = require('fs');
const path = require('path');
const proj4 = require('proj4');

// Define EPSG:32749 (WGS 84 / UTM zone 49S)
// +proj=utm +zone=49 +south +datum=WGS84 +units=m +no_defs
proj4.defs("EPSG:32749", "+proj=utm +zone=49 +south +datum=WGS84 +units=m +no_defs");
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

const inputPath = path.resolve('data/POLA RUANG V2/POLA RUANG.geojson');
console.log('Reading input:', inputPath);

const raw = fs.readFileSync(inputPath, 'utf8');
const geojson = JSON.parse(raw);

console.log('Features count:', geojson.features.length);

function convertCoord(coord) {
  if (typeof coord[0] === 'number' && typeof coord[1] === 'number') {
    // [x, y] in UTM 49S -> [lng, lat] in WGS84
    const [lng, lat] = proj4("EPSG:32749", "EPSG:4326", [coord[0], coord[1]]);
    return [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
  }
  return coord;
}

function convertRing(ring) {
  return ring.map(convertCoord);
}

function convertPolygon(poly) {
  return poly.map(convertRing);
}

function convertGeometry(geom) {
  if (!geom) return null;
  if (geom.type === 'Polygon') {
    return {
      type: 'Polygon',
      coordinates: convertPolygon(geom.coordinates)
    };
  } else if (geom.type === 'MultiPolygon') {
    return {
      type: 'MultiPolygon',
      coordinates: geom.coordinates.map(convertPolygon)
    };
  }
  return geom;
}

// Color and metadata mapping for Banjarnegara Pola Ruang zones
const ZONE_METADATA = {
  'AIR TAWAR': {
    kode_zona: 'BA',
    kategori_utama: 'Badan Air',
    color: '#0284c7', // Sky Blue
    ketentuan_kkpr: 'Kawasan konservasi dan retensi air permukaan, dilarang alih fungsi komersial tanpa izin BBWS.',
    status_konservasi: 'Zona Konservasi Perairan'
  },
  'HUTAN LINDUNG': {
    kode_zona: 'HL',
    kategori_utama: 'Kawasan Lindung',
    color: '#15803d', // Dark Green
    ketentuan_kkpr: 'Dilarang alih fungsi lahan / moratorium komersial. Wajib fungsi lindung dan resapan air.',
    status_konservasi: 'Zona Merah (Protected / Konservasi)'
  },
  'HUTAN PRODUKSI TERBATAS': {
    kode_zona: 'HPT',
    kategori_utama: 'Kawasan Lindung / Budi Daya',
    color: '#16a34a', // Medium Green
    ketentuan_kkpr: 'Hanya untuk pemanfaatan hasil hutan non-kayu dan agroforestri terkendali dengan izin KPH/Perhutani.',
    status_konservasi: 'Zona Konservasi Terbatas'
  },
  'HUTAN PRODUKSI TETAP': {
    kode_zona: 'HP',
    kategori_utama: 'Kawasan Budi Daya',
    color: '#65a30d', // Light Green
    ketentuan_kkpr: 'Pemanfaatan hutan produksi terencana dan terkelola sesuai Rencana Kerja Usaha (RKU) kehutanan.',
    status_konservasi: 'Zona Budi Daya Kehutanan'
  },
  'INDUSTRI': {
    kode_zona: 'KPI',
    kategori_utama: 'Kawasan Budi Daya',
    color: '#9333ea', // Purple
    ketentuan_kkpr: 'KKPR disetujui bersyarat: AMDAL/UKL-UPL, peil banjir, buffer pemukiman, dan kajian stabilitas lereng.',
    status_konservasi: 'Zona Peruntukan Industri'
  },
  'KAWASAN LINDUNG BAWAHANNYA': {
    kode_zona: 'LB',
    kategori_utama: 'Kawasan Lindung',
    color: '#047857', // Forest Teal
    ketentuan_kkpr: 'Kawasan resapan air dan pengatur tata air. Dibatasi untuk aktivitas konstruksi kedap air.',
    status_konservasi: 'Zona Lindung Resapan Air'
  },
  'PERMUKIMAN PERDESAAN': {
    kode_zona: 'PDR',
    kategori_utama: 'Kawasan Budi Daya',
    color: '#f59e0b', // Amber
    ketentuan_kkpr: 'Pembangunan perumahan perdesaan, fasilitas sosial & umum dengan standar mitigasi bencana longsor/gempa.',
    status_konservasi: 'Zona Budi Daya Perdesaan'
  },
  'PERMUKIMAN PERKOTAAN': {
    kode_zona: 'PKT',
    kategori_utama: 'Kawasan Budi Daya',
    color: '#ea580c', // Orange
    ketentuan_kkpr: 'Pembangunan intensif perkotaan wajib memenuhi KDB, KLB, sempadan jalan/sungai, dan sistem drainase perkotaan.',
    status_konservasi: 'Zona Budi Daya Perkotaan'
  },
  'PERTANIAN HORTIKULTURA': {
    kode_zona: 'PTH',
    kategori_utama: 'Kawasan Budi Daya',
    color: '#84cc16', // Lime
    ketentuan_kkpr: 'Kawasan budidaya hortikultura/sayuran dataran tinggi dengan metode konservasi tanah dan terasering.',
    status_konservasi: 'Zona Pertanian Hortikultura'
  },
  'PERTANIAN LAHAN BASAH': {
    kode_zona: 'PLB',
    kategori_utama: 'Kawasan Budi Daya',
    color: '#22c55e', // Emerald Green
    ketentuan_kkpr: 'Lahan Pertanian Pangan Berkelanjutan (LP2B). Dilindungi dari konversi/alih fungsi non-pertanian.',
    status_konservasi: 'Zona LP2B Dilindungi'
  },
  'PERTANIAN LAHAN KERING': {
    kode_zona: 'PLK',
    kategori_utama: 'Kawasan Budi Daya',
    color: '#a3e635', // Yellow Green
    ketentuan_kkpr: 'Pertanian tanaman pangan ladang/kebun rakyat. Pengendalian erosi pada lereng >15%.',
    status_konservasi: 'Zona Budi Daya Tanaman Kering'
  },
  'PERTANIAN SAWAH IRIGASI': {
    kode_zona: 'PSI',
    kategori_utama: 'Kawasan Budi Daya',
    color: '#10b981', // Teal Green
    ketentuan_kkpr: 'Lahan sawah beririgasi teknis/semi-teknis (LP2B). Moratorium ketat alih fungsi perumahan/komersial.',
    status_konservasi: 'Zona LP2B Irigasi Teknis'
  },
  'SEMPADAN PERKOTAAN': {
    kode_zona: 'SPK',
    kategori_utama: 'Kawasan Lindung',
    color: '#06b6d4', // Cyan
    ketentuan_kkpr: 'Ruang Terbuka Hijau (RTH) dan sempadan jalan utama/rel/jalur utilitas perkotaan.',
    status_konservasi: 'Zona Sempadan & RTH'
  },
  'SEMPADAN SUNGAI': {
    kode_zona: 'SS',
    kategori_utama: 'Kawasan Lindung',
    color: '#0891b2', // Deep Cyan
    ketentuan_kkpr: 'Sempadan Sungai Serayu, Merawu & anak sungai (10-50m). Bebas dari bangunan permanen untuk mitigasi banjir.',
    status_konservasi: 'Zona Perlindungan Sempadan'
  }
};

const turf = require('@turf/turf');

const transformedFeatures = geojson.features.map((f, idx) => {
  const name = (f.properties?.POLA_RUANG || f.properties?.PL_CONVERT || `Zona ${idx + 1}`).trim().toUpperCase();
  const meta = ZONE_METADATA[name] || {
    kode_zona: `PR-${idx+1}`,
    kategori_utama: 'Kawasan RTRW',
    color: '#0d9488',
    ketentuan_kkpr: 'Sesuai dengan ketentuan rencana tata ruang wilayah Kabupaten Banjarnegara.',
    status_konservasi: 'Zona RTRW'
  };

  const newGeom = convertGeometry(f.geometry);
  
  let luasHa = 0;
  try {
    const areaSqMeters = turf.area({ type: 'Feature', properties: {}, geometry: newGeom });
    luasHa = Number((areaSqMeters / 10000).toFixed(2));
  } catch (err) {
    console.error('Error calculating area for', name, err);
  }

  return {
    type: 'Feature',
    id: `PR-BNJ-${String(idx + 1).padStart(2, '0')}`,
    properties: {
      id_pola_ruang: `PR-BNJ-${String(idx + 1).padStart(2, '0')}`,
      kode_zona: meta.kode_zona,
      nama_zona: name,
      pola_ruang_raw: name,
      pl_convert: f.properties?.PL_CONVERT || name,
      kategori_utama: meta.kategori_utama,
      sub_zona_pola_ruang: `Zonasi RTRW: ${name}`,
      kabupaten_kota: 'Kabupaten Banjarnegara',
      luas_ha: luasHa,
      ketentuan_kkpr: meta.ketentuan_kkpr,
      status_konservasi: meta.status_konservasi,
      color: meta.color
    },
    geometry: newGeom
  };
});

const outputGeoJson = {
  type: 'FeatureCollection',
  name: 'POLA_RUANG_BANJARNEGARA_V2',
  crs: {
    type: 'name',
    properties: {
      name: 'urn:ogc:def:crs:OGC:1.3:CRS84'
    }
  },
  features: transformedFeatures
};

const outPublicPath = path.resolve('public/data/polaRuangGeo.json');
fs.writeFileSync(outPublicPath, JSON.stringify(outputGeoJson));
console.log('Saved to:', outPublicPath, 'Size:', (fs.statSync(outPublicPath).size / 1024 / 1024).toFixed(2), 'MB');
