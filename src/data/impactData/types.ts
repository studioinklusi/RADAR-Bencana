export interface DesaImpactRecord {
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
