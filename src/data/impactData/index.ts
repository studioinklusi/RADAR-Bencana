import { HazardType } from '../../types';
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
    .replace(/^desa\s+/, '')
    .replace(/^kelurahan\s+/, '')
    .replace(/^kecamatan\s+/, '')
    .replace(/\s+/g, ' ')
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
