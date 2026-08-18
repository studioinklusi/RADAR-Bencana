const fs = require('fs');
const path = require('path');

const dataImpactDir = path.join(__dirname, '../data/databaru/dataimpact');
const outputDataDir = path.join(__dirname, '../src/data/impactData');
const publicDataDir = path.join(__dirname, '../public/data');

// Ensure output directories exist
if (!fs.existsSync(outputDataDir)) {
  fs.mkdirSync(outputDataDir, { recursive: true });
}
if (!fs.existsSync(publicDataDir)) {
  fs.mkdirSync(publicDataDir, { recursive: true });
}

function normalize(str) {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/^desa\s+/, '')
    .replace(/^kelurahan\s+/, '')
    .replace(/^kecamatan\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function processGeoJson(filePath, hazardName) {
  console.log(`Processing ${hazardName} from ${filePath}...`);
  const rawData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const desaMap = new Map();

  for (const feature of rawData.features) {
    const props = feature.properties;
    const desa = props.NAMA_DESA ? props.NAMA_DESA.trim() : '';
    const kec = props.NAMA_KEC ? props.NAMA_KEC.trim() : '';
    const kelas = props.KLS_BENC ? props.KLS_BENC.trim() : 'Rendah';
    const luas = Number(props.LUAS_HA) || 0;
    const jiwa = Number(props.JML_JIWA) || 0;

    const key = normalize(desa) + '|' + normalize(kec);

    if (!desaMap.has(key)) {
      desaMap.set(key, {
        desaName: desa,
        kecamatan: kec,
        luasRendahHa: 0,
        luasSedangHa: 0,
        luasTinggiHa: 0,
        popRendah: 0,
        popSedang: 0,
        popTinggi: 0,
      });
    }

    const record = desaMap.get(key);

    if (kelas === 'Rendah' || kelas.toLowerCase() === 'rendah') {
      record.luasRendahHa += luas;
      record.popRendah += jiwa;
    } else if (kelas === 'Sedang' || kelas.toLowerCase() === 'sedang') {
      record.luasSedangHa += luas;
      record.popSedang += jiwa;
    } else if (kelas === 'Tinggi' || kelas.toLowerCase() === 'tinggi') {
      record.luasTinggiHa += luas;
      record.popTinggi += jiwa;
    }
  }

  // Calculate totals and dominant class
  const records = [];
  for (const [_, rec] of desaMap.entries()) {
    const l1 = Number(rec.luasRendahHa.toFixed(2));
    const l2 = Number(rec.luasSedangHa.toFixed(2));
    const l3 = Number(rec.luasTinggiHa.toFixed(2));
    const totalLuas = Number((l1 + l2 + l3).toFixed(2));
    const totalPop = Math.round(rec.popRendah + rec.popSedang + rec.popTinggi);

    let kelasDominan = 'Rendah';
    const maxLuas = Math.max(l1, l2, l3);
    if (maxLuas === l3 && l3 > 0) {
      kelasDominan = 'Tinggi';
    } else if (maxLuas === l2 && l2 > 0) {
      kelasDominan = 'Sedang';
    } else {
      kelasDominan = 'Rendah';
    }

    records.push({
      desaName: rec.desaName,
      kecamatan: rec.kecamatan,
      luasRendahHa: l1,
      luasSedangHa: l2,
      luasTinggiHa: l3,
      totalLuasHa: totalLuas,
      kelasDominan,
      popRendah: Math.round(rec.popRendah),
      popSedang: Math.round(rec.popSedang),
      popTinggi: Math.round(rec.popTinggi),
      totalPop,
    });
  }

  records.sort((a, b) => a.kecamatan.localeCompare(b.kecamatan) || a.desaName.localeCompare(b.desaName));
  return records;
}

// 1. Generate Types
const typesContent = `export interface DesaImpactRecord {
  desaName: string;
  kecamatan: string;
  luasRendahHa: number;
  luasSedangHa: number;
  luasTinggiHa: number;
  totalLuasHa: number;
  kelasDominan: 'Rendah' | 'Sedang' | 'Tinggi';
  popRendah: number;
  popSedang: number;
  popTinggi: number;
  totalPop: number;
}
`;
fs.writeFileSync(path.join(outputDataDir, 'types.ts'), typesContent, 'utf8');

// 2. Generate Flood Summary
const floodRecords = processGeoJson(path.join(dataImpactDir, 'kelas Banjir.geojson'), 'Banjir');
const floodContent = `import { DesaImpactRecord } from './types';

export const FLOOD_IMPACT_DATA: DesaImpactRecord[] = ${JSON.stringify(floodRecords, null, 2)};
`;
fs.writeFileSync(path.join(outputDataDir, 'floodImpactSummary.ts'), floodContent, 'utf8');

// 3. Generate Landslide Summary
const landslideRecords = processGeoJson(path.join(dataImpactDir, 'kelas Longsor.geojson'), 'Longsor');
const landslideContent = `import { DesaImpactRecord } from './types';

export const LANDSLIDE_IMPACT_DATA: DesaImpactRecord[] = ${JSON.stringify(landslideRecords, null, 2)};
`;
fs.writeFileSync(path.join(outputDataDir, 'landslideImpactSummary.ts'), landslideContent, 'utf8');

// 4. Generate Registry & Helper Functions
const registryContent = `import { HazardType } from '../../types';
import { DesaImpactRecord } from './types';
import { FLOOD_IMPACT_DATA } from './floodImpactSummary';
import { LANDSLIDE_IMPACT_DATA } from './landslideImpactSummary';

export * from './types';
export { FLOOD_IMPACT_DATA } from './floodImpactSummary';
export { LANDSLIDE_IMPACT_DATA } from './landslideImpactSummary';

const IMPACT_REGISTRY: Partial<Record<HazardType, DesaImpactRecord[]>> = {
  flood: FLOOD_IMPACT_DATA,
  landslide: LANDSLIDE_IMPACT_DATA,
  // flashflood: FLASHFLOOD_IMPACT_DATA, // Siap ditambahkan di masa depan
  // earthquake: EARTHQUAKE_IMPACT_DATA, // Siap ditambahkan di masa depan
  // liquefaction: LIQUEFACTION_IMPACT_DATA, // Siap ditambahkan di masa depan
};

function normalizeName(str: string): string {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/^desa\\s+/, '')
    .replace(/^kelurahan\\s+/, '')
    .replace(/^kecamatan\\s+/, '')
    .replace(/\\s+/g, ' ')
    .trim();
}

/**
 * Cek apakah hazard type memiliki data dampak aktual hasil analisis dasimetrik
 */
export function hasRealImpactData(hazardType: HazardType): boolean {
  return IMPACT_REGISTRY[hazardType] !== undefined;
}

/**
 * Ambil data dampak per desa berdasarkan tipe bencana, nama desa, dan kecamatan
 */
export function getDesaImpact(
  hazardType: HazardType,
  desaName: string,
  kecamatanName?: string
): DesaImpactRecord | null {
  const records = IMPACT_REGISTRY[hazardType];
  if (!records) return null;

  const targetDesa = normalizeName(desaName);
  const targetKec = kecamatanName ? normalizeName(kecamatanName) : null;

  // 1. Coba exact match desa + kecamatan
  if (targetKec) {
    const exact = records.find(
      (r) => normalizeName(r.desaName) === targetDesa && normalizeName(r.kecamatan) === targetKec
    );
    if (exact) return exact;
  }

  // 2. Fallback match desa saja jika unik
  const nameMatches = records.filter((r) => normalizeName(r.desaName) === targetDesa);
  if (nameMatches.length === 1) {
    return nameMatches[0];
  }

  return null;
}

/**
 * Ambil agregasi data dampak seluruh desa dalam satu kecamatan
 */
export function getKecamatanImpact(
  hazardType: HazardType,
  kecamatanName: string
): DesaImpactRecord[] {
  const records = IMPACT_REGISTRY[hazardType];
  if (!records) return [];

  const targetKec = normalizeName(kecamatanName);
  return records.filter((r) => normalizeName(r.kecamatan) === targetKec);
}

/**
 * Ambil total agregasi dampak untuk seluruh kabupaten Banjarnegara
 */
export function getKabupatenImpact(
  hazardType: HazardType
): {
  luasRendahHa: number;
  luasSedangHa: number;
  luasTinggiHa: number;
  totalLuasHa: number;
  popRendah: number;
  popSedang: number;
  popTinggi: number;
  totalPop: number;
  desaCount: number;
} | null {
  const records = IMPACT_REGISTRY[hazardType];
  if (!records) return null;

  return records.reduce(
    (acc, r) => ({
      luasRendahHa: Number((acc.luasRendahHa + r.luasRendahHa).toFixed(2)),
      luasSedangHa: Number((acc.luasSedangHa + r.luasSedangHa).toFixed(2)),
      luasTinggiHa: Number((acc.luasTinggiHa + r.luasTinggiHa).toFixed(2)),
      totalLuasHa: Number((acc.totalLuasHa + r.totalLuasHa).toFixed(2)),
      popRendah: acc.popRendah + r.popRendah,
      popSedang: acc.popSedang + r.popSedang,
      popTinggi: acc.popTinggi + r.popTinggi,
      totalPop: acc.totalPop + r.totalPop,
      desaCount: acc.desaCount + 1,
    }),
    {
      luasRendahHa: 0,
      luasSedangHa: 0,
      luasTinggiHa: 0,
      totalLuasHa: 0,
      popRendah: 0,
      popSedang: 0,
      popTinggi: 0,
      totalPop: 0,
      desaCount: 0,
    }
  );
}
`;
fs.writeFileSync(path.join(outputDataDir, 'index.ts'), registryContent, 'utf8');

// 5. Copy GeoJSON files to public/data for lazy loading in Leaflet
console.log('Copying GeoJSON files to public/data...');
fs.copyFileSync(
  path.join(dataImpactDir, 'kelas Banjir.geojson'),
  path.join(publicDataDir, 'floodImpactGeo.json')
);
fs.copyFileSync(
  path.join(dataImpactDir, 'kelas Longsor.geojson'),
  path.join(publicDataDir, 'landslideImpactGeo.json')
);

console.log('Done! Generated:');
console.log(`- ${floodRecords.length} flood desa records`);
console.log(`- ${landslideRecords.length} landslide desa records`);
console.log(`- public/data/floodImpactGeo.json`);
console.log(`- public/data/landslideImpactGeo.json`);
