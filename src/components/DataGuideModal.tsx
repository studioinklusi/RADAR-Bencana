import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, Database, Info, ShieldAlert, MapPin, Building2, Layers, CheckCircle2, Compass } from 'lucide-react';

interface DataGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataGuideModal: React.FC<DataGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'admin' | 'polaruang' | 'hazard' | 'facilities' | 'incidents' | 'invest'>('admin');

  if (!isOpen) return null;

  const downloadCsv = (filename: string, url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Panduan Kustomisasi Data &amp; Template Atribut Tabel (CSV / GeoJSON / SHP)
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Struktur kolom terpisah untuk Batas Administrasi, SHP Pola Ruang RTRW, Bahaya Bencana, dan Tapak Investasi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Download Bar */}
        <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Unduh berkas sampel CSV (atribut tabel SHP):</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => downloadCsv('Batas_Administrasi.csv', '/template_data/Batas_Administrasi.csv')}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3 h-3 text-emerald-600" />
              <span>1. Batas Administrasi</span>
            </button>
            <button
              onClick={() => downloadCsv('Pola_Ruang_RTRW.csv', '/template_data/Pola_Ruang_RTRW.csv')}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-teal-800 border border-teal-300 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3 h-3 text-teal-600" />
              <span>2. SHP Pola Ruang</span>
            </button>
            <button
              onClick={() => downloadCsv('Peta_Bahaya_Bencana.csv', '/template_data/Peta_Bahaya_Bencana.csv')}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-amber-800 border border-amber-300 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3 h-3 text-amber-600" />
              <span>3. Bahaya Bencana</span>
            </button>
            <button
              onClick={() => downloadCsv('Fasilitas_Kritis_Infrastruktur.csv', '/template_data/Fasilitas_Kritis_Infrastruktur.csv')}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-blue-800 border border-blue-300 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3 h-3 text-blue-600" />
              <span>4. Fasilitas Kritis</span>
            </button>
            <button
              onClick={() => downloadCsv('Riwayat_Kejadian_Bencana.csv', '/template_data/Riwayat_Kejadian_Bencana.csv')}
              className="px-2 py-1 bg-white hover:bg-slate-100 text-rose-800 border border-rose-300 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3 h-3 text-rose-600" />
              <span>5. Riwayat Bencana</span>
            </button>
            <button
              onClick={() => downloadCsv('Analisis_Investasi_Tapak.csv', '/template_data/Analisis_Investasi_Tapak.csv')}
              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3 h-3" />
              <span>6. Tapak Investasi</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-50 px-6 pt-3 flex gap-2 border-b border-slate-200 overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-t border-x flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-white border-slate-200 text-emerald-800 shadow-xs'
                : 'bg-slate-100 border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>1. Batas Administrasi</span>
          </button>

          <button
            onClick={() => setActiveTab('polaruang')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-t border-x flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'polaruang'
                ? 'bg-white border-slate-200 text-teal-800 shadow-xs'
                : 'bg-slate-100 border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-4 h-4 text-teal-600" />
            <span>2. SHP Pola Ruang RTRW (Terpisah)</span>
          </button>

          <button
            onClick={() => setActiveTab('hazard')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-t border-x flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'hazard'
                ? 'bg-white border-slate-200 text-amber-800 shadow-xs'
                : 'bg-slate-100 border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            <span>3. Bahaya Bencana</span>
          </button>

          <button
            onClick={() => setActiveTab('facilities')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-t border-x flex items-center gap-1.5 ${
              activeTab === 'facilities'
                ? 'bg-slate-900 border-slate-700 text-blue-400'
                : 'bg-slate-950 border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>4. Fasilitas Kritis</span>
          </button>

          <button
            onClick={() => setActiveTab('incidents')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-t border-x flex items-center gap-1.5 ${
              activeTab === 'incidents'
                ? 'bg-slate-900 border-slate-700 text-rose-400'
                : 'bg-slate-950 border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>5. Riwayat Bencana</span>
          </button>

          <button
            onClick={() => setActiveTab('invest')}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all border-t border-x flex items-center gap-1.5 ${
              activeTab === 'invest'
                ? 'bg-slate-900 border-slate-700 text-emerald-400'
                : 'bg-slate-950 border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>6. Tapak Investasi</span>
          </button>
        </div>

        {/* Content Table Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-emerald-400 block text-sm">Layer 1: Batas Wilayah Administrasi (Pure Boundary SHP/CSV)</span>
                <p>
                  Khusus memuat batas wilayah pemerintahan (Kabupaten/Kota/Kecamatan), populasi, dan rincian luasan (Ha) per masing-masing kelas risiko bencana (Tinggi, Sedang, Rendah) tanpa dicampur data Pola Ruang.
                </p>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-300 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Nama Kolom (Field)</th>
                      <th className="p-3">Tipe Data</th>
                      <th className="p-3">Wajib?</th>
                      <th className="p-3">Keterangan &amp; Format Nilai</th>
                      <th className="p-3">Contoh Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-emerald-400">code / id</td>
                      <td className="p-3 font-mono text-slate-400">String/Number</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Kode BPS/Kemendagri unik wilayah.</td>
                      <td className="p-3 font-mono text-slate-400">3204</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-emerald-400">name</td>
                      <td className="p-3 font-mono text-slate-400">String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Nama resmi Kabupaten atau Kota.</td>
                      <td className="p-3 font-mono text-slate-400">Kabupaten Bandung</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-emerald-400">provinsi</td>
                      <td className="p-3 font-mono text-slate-400">String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Nama Provinsi tempat wilayah berada.</td>
                      <td className="p-3 font-mono text-slate-400">Jawa Barat</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-emerald-400">luas_ha / total_area_ha</td>
                      <td className="p-3 font-mono text-slate-400">Number</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Total luas daratan wilayah dalam Hektar (Ha).</td>
                      <td className="p-3 font-mono text-slate-400">176239</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-emerald-400">populasi</td>
                      <td className="p-3 font-mono text-slate-400">Number</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Jumlah penduduk dalam jiwa.</td>
                      <td className="p-3 font-mono text-slate-400">3600000</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-emerald-400">luas_risiko_tinggi_ha</td>
                      <td className="p-3 font-mono text-slate-400">Number (Ha)</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Luasan wilayah yang masuk kelas bencana Risiko Tinggi (Ha).</td>
                      <td className="p-3 font-mono text-rose-400">45200</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-emerald-400">luas_risiko_sedang_ha</td>
                      <td className="p-3 font-mono text-slate-400">Number (Ha)</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Luasan wilayah yang masuk kelas bencana Risiko Sedang (Ha).</td>
                      <td className="p-3 font-mono text-amber-400">68400</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-emerald-400">luas_risiko_rendah_ha</td>
                      <td className="p-3 font-mono text-slate-400">Number (Ha)</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Luasan wilayah yang masuk kelas bencana Risiko Rendah (Ha).</td>
                      <td className="p-3 font-mono text-emerald-400">62639</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-emerald-400">koordinat_lat / lng</td>
                      <td className="p-3 font-mono text-slate-400">Float (WGS84)</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Titik tengah centroid geografis wilayah.</td>
                      <td className="p-3 font-mono text-slate-400">-7.0252, 107.5197</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'polaruang' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-teal-400 block text-sm">Layer 2: Standalone SHP Pola Ruang &amp; Zonasi RTRW (Terpisah)</span>
                <p>
                  Layer khusus penataan Pola Ruang RTRW hasil pemetaan GIS/SHP. Memuat zonasi rinci Kawasan Lindung vs Kawasan Budi Daya beserta aturan Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR).
                </p>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-300 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Nama Kolom (Field)</th>
                      <th className="p-3">Tipe Data</th>
                      <th className="p-3">Wajib?</th>
                      <th className="p-3">Keterangan &amp; Format Nilai</th>
                      <th className="p-3">Contoh Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-teal-400">id_pola_ruang</td>
                      <td className="p-3 font-mono text-slate-400">String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Kode Unik Poligon Pola Ruang RTRW.</td>
                      <td className="p-3 font-mono text-slate-400">PR-3204-01</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-teal-400">kode_zona</td>
                      <td className="p-3 font-mono text-slate-400">String Code</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Kode standar RTRW (contoh: HL, KBAU, KPI, HSA, PP).</td>
                      <td className="p-3 font-mono text-slate-400">HL / KBAU / KPI</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-teal-400">nama_zona</td>
                      <td className="p-3 font-mono text-slate-400">String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Nama lengkap kawasan tata ruang.</td>
                      <td className="p-3 font-mono text-slate-400">Hutan Lindung Cikole / Kawasan Industri Dayeuhkolot</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-teal-400">kategori_utama</td>
                      <td className="p-3 font-mono text-slate-400">Enum String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Harus diisi: <strong className="text-emerald-300">Kawasan Lindung</strong> ATAU <strong className="text-amber-300">Kawasan Budi Daya</strong>.</td>
                      <td className="p-3 font-mono text-slate-400">Kawasan Lindung</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-teal-400">sub_zona_pola_ruang</td>
                      <td className="p-3 font-mono text-slate-400">String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Rincian sub-fungsi lahan (Hutan Conservasi, Resapan Air, Industri, Pemukiman).</td>
                      <td className="p-3 font-mono text-slate-400">Hutan Konservasi &amp; Resapan Air</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-teal-400">kabupaten_kota</td>
                      <td className="p-3 font-mono text-slate-400">String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Lokasi administratif poligon zona.</td>
                      <td className="p-3 font-mono text-slate-400">Kabupaten Bandung Barat</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-teal-400">luas_ha</td>
                      <td className="p-3 font-mono text-slate-400">Number</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Luas poligon zona dalam satuan Hektar (Ha).</td>
                      <td className="p-3 font-mono text-slate-400">1250.5</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-teal-400">ketentuan_kkpr</td>
                      <td className="p-3 font-mono text-slate-400">Text</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Aturan Kesesuaian Kegiatan Pemanfaatan Ruang Dinas PUPR.</td>
                      <td className="p-3 font-mono text-slate-400">Dilarang Bangunan Non-Konservasi / KKPR Bersyarat</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-teal-400">status_konservasi</td>
                      <td className="p-3 font-mono text-slate-400">String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Status hukum/risiko zona (Zona Merah Protected, Zona Budi Daya Komersial).</td>
                      <td className="p-3 font-mono text-slate-400">Zona Merah (Protected)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'hazard' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
                <span className="font-bold text-amber-400 block text-sm">Layer 3: Peta Bahaya &amp; Kerentanan Bencana (Format Raster .tif &amp; Vector SHP/CSV)</span>
                <p>
                  Sistem mendukung format <strong>Raster GeoTIFF (.tif)</strong> dan <strong>Vector (SHP/GeoJSON/CSV)</strong> untuk memuat data spasial multi-ancaman (Longsor, Banjir, Sesar Aktif, Karhutla).
                </p>
              </div>

              {/* GeoTIFF Raster Guide */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-900/40 space-y-3">
                <div className="flex items-center justify-between text-amber-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800">FORMAT RASTER .TIF</span>
                    <span>Spesifikasi Layer GeoTIFF (Sub-Layer Kelas &amp; Indeks)</span>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="text-emerald-400 font-bold font-mono">1. Sub-Layer Kelas Bahaya (Raster Diskrit / Integer):</div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Menggunakan file raster 1-band berskala ordinal integer dengan visualisasi 3 kelas:
                    </p>
                    <div className="grid grid-cols-3 gap-2 pt-0.5 font-mono text-xs">
                      <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800/80 flex flex-col gap-0.5">
                        <span className="text-emerald-400 font-bold">Pixel: 1</span>
                        <span className="text-slate-200 text-[11px]">Kelas Rendah</span>
                        <span className="text-[10px] text-emerald-500 font-sans">Palet Hijau (#10b981)</span>
                      </div>
                      <div className="p-2 rounded bg-amber-950/60 border border-amber-800/80 flex flex-col gap-0.5">
                        <span className="text-amber-400 font-bold">Pixel: 2</span>
                        <span className="text-slate-200 text-[11px]">Kelas Sedang</span>
                        <span className="text-[10px] text-amber-500 font-sans">Palet Kuning (#f59e0b)</span>
                      </div>
                      <div className="p-2 rounded bg-rose-950/60 border border-rose-800/80 flex flex-col gap-0.5">
                        <span className="text-rose-400 font-bold">Pixel: 3</span>
                        <span className="text-slate-200 text-[11px]">Kelas Tinggi</span>
                        <span className="text-[10px] text-rose-500 font-sans">Palet Merah (#f43f5e)</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="text-amber-400 font-bold font-mono">2. Sub-Layer Indeks Bahaya (Raster Kontinu / Float 0.0 - 1.0):</div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      Menggunakan raster float nilai kontinu dari 0.0 sampai 1.0 dengan pewarnaan gradasi halus:
                    </p>
                    <div className="space-y-1 pt-1">
                      <div className="h-3.5 rounded bg-gradient-to-r from-[#10b981] via-[#f59e0b] to-[#f43f5e] border border-slate-700/50" />
                      <div className="flex justify-between text-[10px] font-mono text-slate-300">
                        <span>Min: 0.0 (Hijau - Rendah)</span>
                        <span>Mid: 0.5 (Kuning - Sedang)</span>
                        <span>Max: 1.0 (Merah - Tinggi)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-300 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Nama Kolom (Field)</th>
                      <th className="p-3">Tipe Data</th>
                      <th className="p-3">Wajib?</th>
                      <th className="p-3">Keterangan &amp; Format Nilai</th>
                      <th className="p-3">Contoh Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-amber-400">id / hazard_id</td>
                      <td className="p-3 font-mono text-slate-400">String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Kode Unik Poligon/Titik Hazard.</td>
                      <td className="p-3 font-mono text-slate-400">HZ-01</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-amber-400">jenis_bahaya</td>
                      <td className="p-3 font-mono text-slate-400">Enum String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Jenis Bencana: Longsor, Banjir, Sesar Aktif, Karhutla.</td>
                      <td className="p-3 font-mono text-slate-400">Tanah Longsor &amp; Gerakan Tanah</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-amber-400">tingkat_risiko</td>
                      <td className="p-3 font-mono text-slate-400">Enum String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Level Risiko: Sangat Tinggi, Tinggi, Sedang, Rendah, Nihil.</td>
                      <td className="p-3 font-mono text-slate-400">Tinggi</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-amber-400">skor_kerentanan</td>
                      <td className="p-3 font-mono text-slate-400">Number (0-100)</td>
                      <td className="p-3 font-bold text-emerald-400">Opsional</td>
                      <td className="p-3">Nilai indeks ancaman spasial.</td>
                      <td className="p-3 font-mono text-slate-400">88.5</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-amber-400">luas_zona_berisiko_ha</td>
                      <td className="p-3 font-mono text-slate-400">Number</td>
                      <td className="p-3 font-bold text-emerald-400">Opsional</td>
                      <td className="p-3">Luas wilayah terdampak bahaya (Ha).</td>
                      <td className="p-3 font-mono text-slate-400">12500</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-amber-400">deskripsi_potensi_bencana</td>
                      <td className="p-3 font-mono text-slate-400">Text</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Penjelasan kondisi geologis / iklim pemicu bencana.</td>
                      <td className="p-3 font-mono text-slate-400">Lereng &gt;35% rawan longsor saat hujan deras.</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-amber-400">rekomendasi_mitigasi</td>
                      <td className="p-3 font-mono text-slate-400">Text</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Langkah penanggulangan teknis &amp; sipil.</td>
                      <td className="p-3 font-mono text-slate-400">Pemasangan EWS dan tembok penahan tanah.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'facilities' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-blue-400 block text-sm">Layer 4: Fasilitas Kritis, Logistik, &amp; Posko Kebencanaan</span>
                <p>
                  Lokasi titik infrastruktur tanggap darurat seperti Pos Pemadam, Rumah Sakit Rujukan, Posko BPBD, dan Lokasi Evakuasi Pengungsi.
                </p>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-300 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Nama Kolom (Field)</th>
                      <th className="p-3">Tipe Data</th>
                      <th className="p-3">Wajib?</th>
                      <th className="p-3">Keterangan &amp; Format Nilai</th>
                      <th className="p-3">Contoh Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-blue-400">id_fasilitas</td>
                      <td className="p-3 font-mono text-slate-400">String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Kode unik fasilitas.</td>
                      <td className="p-3 font-mono text-slate-400">FAS-001</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-blue-400">nama_fasilitas</td>
                      <td className="p-3 font-mono text-slate-400">String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Nama instansi / gedung tempat fasilitas.</td>
                      <td className="p-3 font-mono text-slate-400">RSUD Otista Bandung</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-blue-400">kategori_utama</td>
                      <td className="p-3 font-mono text-slate-400">Enum String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Damkar, Fasilitas Kesehatan, Posko Kebencanaan, Tempat Evakuasi, Akses Logistik.</td>
                      <td className="p-3 font-mono text-slate-400">Fasilitas Kesehatan</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-blue-400">kapasitas_penampungan</td>
                      <td className="p-3 font-mono text-slate-400">String/Number</td>
                      <td className="p-3 font-bold text-emerald-400">Opsional</td>
                      <td className="p-3">Jumlah tempat tidur, kendaraan, atau kapasitas pengungsi.</td>
                      <td className="p-3 font-mono text-slate-400">350 Tempat Tidur</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-blue-400">nomor_kontak_darurat</td>
                      <td className="p-3 font-mono text-slate-400">String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Nomor telepon call center / hotline darurat.</td>
                      <td className="p-3 font-mono text-slate-400">022-5891122</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-blue-400">latitude / longitude</td>
                      <td className="p-3 font-mono text-slate-400">Float (WGS84)</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Koordinat presisi posisi titik fasilitas di peta.</td>
                      <td className="p-3 font-mono text-slate-400">-7.0280, 107.5210</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'incidents' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-rose-400 block text-sm">Layer 5: Catatan Riwayat Bencana Historis</span>
                <p>
                  Catatan historis kejadian bencana masa lalu untuk validasi frekuensi dan dampak nyata terhadap wilayah target.
                </p>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-300 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Nama Kolom (Field)</th>
                      <th className="p-3">Tipe Data</th>
                      <th className="p-3">Wajib?</th>
                      <th className="p-3">Keterangan &amp; Format Nilai</th>
                      <th className="p-3">Contoh Nilai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-rose-400">id_kejadian</td>
                      <td className="p-3 font-mono text-slate-400">String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Kode unik laporan kejadian BPBD.</td>
                      <td className="p-3 font-mono text-slate-400">INC-2024-001</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-rose-400">jenis_bencana</td>
                      <td className="p-3 font-mono text-slate-400">String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Banjir, Longsor, Gempa Bumi, Puting Beliung, Karhutla.</td>
                      <td className="p-3 font-mono text-slate-400">Banjir Bandang</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-rose-400">tanggal_kejadian</td>
                      <td className="p-3 font-mono text-slate-400">Date (YYYY-MM-DD)</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Tanggal terjadinya peristiwa.</td>
                      <td className="p-3 font-mono text-slate-400">2024-03-15</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-rose-400">korban_jiwa</td>
                      <td className="p-3 font-mono text-slate-400">Number</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Jumlah jiwa meninggal / luka berat.</td>
                      <td className="p-3 font-mono text-slate-400">2</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-rose-400">kerugian_estimasi_rp</td>
                      <td className="p-3 font-mono text-slate-400">Number (Rupiah)</td>
                      <td className="p-3 font-bold text-emerald-400">Opsional</td>
                      <td className="p-3">Estimasi dampak finansial / kerusakan infrastruktur.</td>
                      <td className="p-3 font-mono text-slate-400">3500000000</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-rose-400">penyebab_utama</td>
                      <td className="p-3 font-mono text-slate-400">Text</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Uraian singkat faktor pemicu kejadian.</td>
                      <td className="p-3 font-mono text-slate-400">Intensitas hujan &gt;120mm/jam dan luapan sungai.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'invest' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-emerald-400 block text-sm">Layer 6: Atribut Hasil Analisis Kelayakan Tapak (Radar Invest)</span>
                <p>
                  Atribut khusus yang diproses oleh mesin kalkulator kesesuaian lahan investasi untuk menentukan ZONA MERAH, ZONA KUNING, dan ZONA HIJAU beserta alasannya.
                </p>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-300 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Nama Kolom (Field)</th>
                      <th className="p-3">Tipe Data</th>
                      <th className="p-3">Wajib?</th>
                      <th className="p-3">Keterangan &amp; Penjelasan Fungsi</th>
                      <th className="p-3">Contoh Keterangan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-emerald-400">status_zona_kelayakan</td>
                      <td className="p-3 font-mono text-slate-400">Enum String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3 font-semibold text-rose-300">
                        ZONA MERAH (Ditolak/Risiko Ekstrem) / ZONA KUNING (Bersyarat) / ZONA HIJAU (Sangat Layak)
                      </td>
                      <td className="p-3 font-mono text-slate-400">TIDAK DIREKOMENDASIKAN (ZONA MERAH)</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-emerald-400">alasan_deskripsi_zona_merah_kuning</td>
                      <td className="p-3 font-mono text-slate-400">Text Array / List</td>
                      <td className="p-3 font-bold text-amber-400">Wajib untuk Zona Merah/Kuning</td>
                      <td className="p-3">
                        Deskripsi eksplisit penyebab penetapan Zona Merah: status kawasan lindung, perpotongan lintasan sesar aktif, atau ancaman bencana geologis/banjir.
                      </td>
                      <td className="p-3 font-mono text-slate-400">
                        Status Kawasan Lindung KBAU seluas 5.5 Ha + Perpotongan lintasan Sesar Lembang aktif.
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-emerald-400">rekomendasi_kkpr</td>
                      <td className="p-3 font-mono text-slate-400">String</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Status Kesesuaian Kegiatan Pemanfaatan Ruang Dinas PUPR &amp; BPN.</td>
                      <td className="p-3 font-mono text-slate-400">KKPR Berpotensi Besar Ditolak PUPR</td>
                    </tr>
                    <tr className="hover:bg-slate-800/30">
                      <td className="p-3 font-mono font-bold text-emerald-400">catatan_mitigasi_teknis</td>
                      <td className="p-3 font-mono text-slate-400">Text List</td>
                      <td className="p-3 font-bold text-amber-400">Wajib</td>
                      <td className="p-3">Rekomendasi teknis rekayasa sipil &amp; persyarat lingkungan (AMDAL/UKL-UPL).</td>
                      <td className="p-3 font-mono text-slate-400">Wajib pembuatan retensi banjir dan dokumen AMDAL.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Format CSV/SHP kompatibel dengan ArcGIS Pro, QGIS, GeoJSON, Excel, &amp; PostGIS.</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-950/50"
          >
            Tutup Panduan
          </button>
        </div>
      </div>
    </div>
  );
};
