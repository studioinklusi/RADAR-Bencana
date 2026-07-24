import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  FileSpreadsheet, 
  Database, 
  Info, 
  CheckCircle2, 
  Trash2, 
  Download, 
  ShieldCheck,
  FileText,
  AlertCircle,
  RefreshCw,
  Sparkles,
  MapPin,
  Building2,
  AlertTriangle,
  Activity,
  Map,
  Compass
} from 'lucide-react';

export type CategoryType = 'admin_boundary' | 'pola_ruang' | 'kelas_bahaya' | 'indeks_bahaya' | 'incidents' | 'facilities';

interface UploadedLayer {
  id: string;
  name: string;
  category: CategoryType;
  type: string;
  filename: string;
  url: string;
  uploadTime: string;
  rowCount: number;
  description?: string;
  content?: string;
  spatialAttributes?: any;
}

interface AdminDashboardPageProps {
  onBackToMap: () => void;
  onDataUploaded?: () => void;
}

const CATEGORY_LABELS: Record<CategoryType, { name: string; icon: any; color: string; desc: string }> = {
  admin_boundary: { name: 'SHP Administrasi', icon: Map, color: 'text-emerald-800 border-emerald-300 bg-emerald-50', desc: 'Batas wilayah kabupaten, kecamatan & statistik populasi' },
  pola_ruang: { name: 'Pola Ruang (RTRW)', icon: Compass, color: 'text-teal-800 border-teal-300 bg-teal-50', desc: 'Zona pemanfaatan ruang (Hutan Lindung, Pemukiman, Industri)' },
  kelas_bahaya: { name: 'Kelas Bahaya', icon: AlertTriangle, color: 'text-amber-800 border-amber-300 bg-amber-50', desc: 'Peta Raster GeoTIFF (.tif/.tiff) & Vector Klasifikasi Bahaya (Rendah, Sedang, Tinggi)' },
  indeks_bahaya: { name: 'Indeks Bahaya', icon: Activity, color: 'text-orange-800 border-orange-300 bg-orange-50', desc: 'Peta Raster GeoTIFF (.tif/.tiff) & Vector Nilai Indeks Kerawanan (0.0 - 100.0)' },
  incidents: { name: 'Titik Bencana', icon: MapPin, color: 'text-rose-800 border-rose-300 bg-rose-50', desc: 'Sebaran koordinat titik lokasi kejadian bencana' },
  facilities: { name: 'Fasilitas (Kritis & Umum)', icon: Building2, color: 'text-blue-800 border-blue-300 bg-blue-50', desc: 'Fasilitas Kritis (RSUD, Posko BPBD, Pemadam, Polisi) & Fasilitas Umum (Sekolah, Masjid, Pasar, GOR)' },
};

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onBackToMap, onDataUploaded }) => {
  const [activeUploadTab, setActiveUploadTab] = useState<'file' | 'manual'>('file');
  const [targetCategory, setTargetCategory] = useState<CategoryType>('admin_boundary');

  // File Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [layerName, setLayerName] = useState('');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Category 1: Admin Boundary Form State
  const [adminName, setAdminName] = useState('Kabupaten Bogor');
  const [adminCode, setAdminCode] = useState('3201');
  const [adminProvince, setAdminProvince] = useState('Jawa Barat');
  const [adminTotalArea, setAdminTotalArea] = useState('298620');
  const [adminPopulation, setAdminPopulation] = useState('5427068');
  const [adminRiskHigh, setAdminRiskHigh] = useState('104500');
  const [adminRiskMed, setAdminRiskMed] = useState('119400');
  const [adminRiskLow, setAdminRiskLow] = useState('74720');

  // Category 2: Pola Ruang Form State
  const [polaName, setPolaName] = useState('Hutan Lindung Cisarua');
  const [polaCode, setPolaCode] = useState('HL');
  const [polaCategory, setPolaCategory] = useState('Kawasan Lindung');
  const [polaDistrict, setPolaDistrict] = useState('Kabupaten Bogor');
  const [polaArea, setPolaArea] = useState('1250');
  const [polaKkpr, setPolaKkpr] = useState('Dilarang Komersial');
  const [polaColor, setPolaColor] = useState('#16a34a');

  // Category 3: Kelas Bahaya Form State
  const [hazardZoneName, setHazardZoneName] = useState('Zona Bahaya Longsor Cisarua');
  const [hazardType, setHazardType] = useState('landslide');
  const [hazardClass, setHazardClass] = useState('Tinggi');
  const [hazardScore, setHazardScore] = useState('3');
  const [hazardArea, setHazardArea] = useState('1500');
  const [hazardDistrict, setHazardDistrict] = useState('Kabupaten Bogor');
  const [hazardLat, setHazardLat] = useState('-6.6920');
  const [hazardLng, setHazardLng] = useState('106.9400');

  // Category 4: Indeks Bahaya Form State
  const [indexDistrict, setIndexDistrict] = useState('Kabupaten Bogor');
  const [indexHazardType, setIndexHazardType] = useState('landslide');
  const [indexScore, setIndexScore] = useState('88.5');
  const [indexCategory, setIndexCategory] = useState('Sangat Tinggi');
  const [indexVulnerability, setIndexVulnerability] = useState('Kritis');
  const [indexLat, setIndexLat] = useState('-6.6920');
  const [indexLng, setIndexLng] = useState('106.9400');

  // Category 5: Incidents Form State
  const [incidentTitle, setIncidentTitle] = useState('Banjir Bandang Cisarua');
  const [incidentHazard, setIncidentHazard] = useState('flood');
  const [incidentDistrict, setIncidentDistrict] = useState('Kabupaten Bogor');
  const [incidentYear, setIncidentYear] = useState('2025');
  const [incidentImpact, setIncidentImpact] = useState('350 Jiwa Mengungsi & 45 Rumah Terendam');
  const [incidentLat, setIncidentLat] = useState('-6.6920');
  const [incidentLng, setIncidentLng] = useState('106.9400');

  // Category 6: Facilities Form State
  const [facilityName, setFacilityName] = useState('RSUD Al-Ihsan');
  const [facilityCategory, setFacilityCategory] = useState('kritis');
  const [facilitySubType, setFacilitySubType] = useState('Rumah Sakit');
  const [facilityDistrict, setFacilityDistrict] = useState('Kabupaten Bandung');
  const [facilityCapacity, setFacilityCapacity] = useState('Kapasitas 450 Bed');
  const [facilityContact, setFacilityContact] = useState('022-5940872');
  const [facilityLat, setFacilityLat] = useState('-6.9892');
  const [facilityLng, setFacilityLng] = useState('107.6312');

  const [isSavingManual, setIsSavingManual] = useState(false);
  const [uploadedLayers, setUploadedLayers] = useState<UploadedLayer[]>([]);
  const [isLoadingLayers, setIsLoadingLayers] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  // Spatial Attributes Input Fields for Administrative Upload (Format Sistem)
  const [spatialCode, setSpatialCode] = useState('3201.010.001');
  const [spatialKabupaten, setSpatialKabupaten] = useState('Kabupaten Bogor');
  const [spatialKecamatan, setSpatialKecamatan] = useState('Kecamatan Cisarua');
  const [spatialDesa, setSpatialDesa] = useState('Desa Tugu Selatan');
  const [spatialPopLongsor, setSpatialPopLongsor] = useState('1450');
  const [spatialPopBanjir, setSpatialPopBanjir] = useState('2850');
  const [spatialPopKebakaran, setSpatialPopKebakaran] = useState('420');
  const [spatialPopGempa, setSpatialPopGempa] = useState('3100');
  const [spatialTotalPop, setSpatialTotalPop] = useState('12450');
  const [spatialAreaHa, setSpatialAreaHa] = useState('1580');

  // Modal / Editing state for layer attributes
  const [editingLayer, setEditingLayer] = useState<UploadedLayer | null>(null);
  const [editSpatialAttrs, setEditSpatialAttrs] = useState<any>({});
  const [isSavingAttrs, setIsSavingAttrs] = useState(false);

  const [activeGuideTab, setActiveGuideTab] = useState<CategoryType>('admin_boundary');

  // Fetch uploaded layers list
  const fetchUploadedLayers = async () => {
    setIsLoadingLayers(true);
    try {
      const res = await fetch('/api/uploaded-layers');
      if (res.ok) {
        const data = await res.json();
        setUploadedLayers(data.layers || []);
      }
    } catch (err) {
      console.error('Failed to fetch layers:', err);
    } finally {
      setIsLoadingLayers(false);
    }
  };

  useEffect(() => {
    fetchUploadedLayers();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!layerName) {
        setLayerName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const openAttributeModal = (layer: UploadedLayer) => {
    setEditingLayer(layer);
    const attrs = layer.spatialAttributes || {};
    setEditSpatialAttrs({
      code: attrs.code || spatialCode,
      nama_kabupaten: attrs.nama_kabupaten || spatialKabupaten,
      nama_kecamatan: attrs.nama_kecamatan || spatialKecamatan,
      nama_desa: attrs.nama_desa || spatialDesa,
      populasi_terpapar_longsor: attrs.populasi_terpapar_longsor ?? spatialPopLongsor,
      populasi_terpapar_banjir: attrs.populasi_terpapar_banjir ?? spatialPopBanjir,
      populasi_terpapar_kebakaran: attrs.populasi_terpapar_kebakaran ?? spatialPopKebakaran,
      populasi_terpapar_gempa: attrs.populasi_terpapar_gempa ?? spatialPopGempa,
      total_populasi: attrs.total_populasi ?? spatialTotalPop,
      luas_wilayah_ha: attrs.luas_wilayah_ha ?? spatialAreaHa,
    });
  };

  const handleSaveLayerAttributes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLayer) return;

    setIsSavingAttrs(true);
    try {
      const res = await fetch('/api/update-layer-attributes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          layerId: editingLayer.id,
          spatialAttributes: editSpatialAttrs,
        }),
      });

      if (res.ok) {
        setUploadMessage({ type: 'success', text: `Atribut spasial untuk dataset "${editingLayer.name}" berhasil diperbarui & disinkronkan ke peta!` });
        setEditingLayer(null);
        fetchUploadedLayers();
        if (onDataUploaded) onDataUploaded();
      } else {
        const err = await res.json();
        setUploadMessage({ type: 'error', text: err.error || 'Gagal memperbarui atribut.' });
      }
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: `Terjadi kesalahan: ${err.message}` });
    } finally {
      setIsSavingAttrs(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadMessage({ type: 'error', text: 'Silakan pilih berkas Raster GeoTIFF (.tif/.tiff), GeoJSON, atau CSV terlebih dahulu.' });
      return;
    }

    setIsUploading(true);
    setUploadMessage(null);

    try {
      const fileNameLower = selectedFile.name.toLowerCase();
      const isTif = fileNameLower.endsWith('.tif') || fileNameLower.endsWith('.tiff');
      const isGeoJson = fileNameLower.endsWith('.geojson') || fileNameLower.endsWith('.json');
      const fileType = isTif ? 'geotiff' : (isGeoJson ? 'geojson' : 'csv');

      const spatialAttributes = targetCategory === 'admin_boundary' ? {
        code: spatialCode,
        nama_kabupaten: spatialKabupaten,
        nama_kecamatan: spatialKecamatan,
        nama_desa: spatialDesa,
        populasi_terpapar_longsor: Number(spatialPopLongsor) || 0,
        populasi_terpapar_banjir: Number(spatialPopBanjir) || 0,
        populasi_terpapar_kebakaran: Number(spatialPopKebakaran) || 0,
        populasi_terpapar_gempa: Number(spatialPopGempa) || 0,
        total_populasi: Number(spatialTotalPop) || 0,
        luas_wilayah_ha: Number(spatialAreaHa) || 0,
      } : undefined;

      const fileText = await selectedFile.text();
      const payload = {
        filename: selectedFile.name,
        layerName: layerName || selectedFile.name,
        category: targetCategory,
        description,
        fileType,
        fileContent: fileText,
        spatialAttributes,
      };

      const res = await fetch('/api/upload-layer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        const rowStr = result.layer.rowCount === 'Raster Grid' ? 'Raster Overlay' : `${result.layer.rowCount} record`;
        setUploadMessage({ type: 'success', text: `Berhasil meng-upload dataset "${result.layer.name}" (${rowStr}) dengan atribut spasial sistem!` });
        setSelectedFile(null);
        setLayerName('');
        setDescription('');
        fetchUploadedLayers();
        if (onDataUploaded) onDataUploaded();
      } else {
        const errData = await res.json();
        setUploadMessage({ type: 'error', text: errData.error || 'Gagal mengunggah berkas.' });
      }
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: `Terjadi kesalahan: ${err.message}` });
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingManual(true);
    setUploadMessage(null);

    try {
      let csvContent = '';
      let layerTitle = '';

      if (targetCategory === 'admin_boundary') {
        layerTitle = `Batas Administrasi: ${adminName}`;
        csvContent = `code,name,province,total_area_ha,population,luas_risiko_tinggi_ha,luas_risiko_sedang_ha,luas_risiko_rendah_ha\n${adminCode},${adminName},${adminProvince},${adminTotalArea},${adminPopulation},${adminRiskHigh},${adminRiskMed},${adminRiskLow}`;
      } else if (targetCategory === 'pola_ruang') {
        layerTitle = `Pola Ruang: ${polaName}`;
        csvContent = `id_pola_ruang,kode_zona,nama_zona,kategori_utama,kabupaten_kota,luas_ha,ketentuan_kkpr,color\nPR-${Date.now()},${polaCode},${polaName},${polaCategory},${polaDistrict},${polaArea},${polaKkpr},${polaColor}`;
      } else if (targetCategory === 'kelas_bahaya') {
        layerTitle = `Kelas Bahaya: ${hazardZoneName}`;
        csvContent = `hazard_type,zone_name,kelas_bahaya,score,area_ha,district,lat,lng\n${hazardType},${hazardZoneName},${hazardClass},${hazardScore},${hazardArea},${hazardDistrict},${hazardLat},${hazardLng}`;
      } else if (targetCategory === 'indeks_bahaya') {
        layerTitle = `Indeks Bahaya: ${indexDistrict} (${indexHazardType})`;
        csvContent = `hazard_type,district,index_score,risk_category,vulnerability_level,lat,lng\n${indexHazardType},${indexDistrict},${indexScore},${indexCategory},${indexVulnerability},${indexLat},${indexLng}`;
      } else if (targetCategory === 'incidents') {
        layerTitle = `Kejadian Bencana: ${incidentTitle}`;
        csvContent = `id,name,hazard,district,year,impact,lat,lng\nINC-${Date.now()},${incidentTitle},${incidentHazard},${incidentDistrict},${incidentYear},${incidentImpact},${incidentLat},${incidentLng}`;
      } else if (targetCategory === 'facilities') {
        layerTitle = `Fasilitas: ${facilityName}`;
        csvContent = `id,name,category,sub_type,district,capacity,contact,lat,lng\nFAC-${Date.now()},${facilityName},${facilityCategory},${facilitySubType},${facilityDistrict},${facilityCapacity},${facilityContact},${facilityLat},${facilityLng}`;
      }

      const filename = `manual_update_${targetCategory}_${Date.now()}.csv`;

      const payload = {
        filename,
        layerName: layerTitle,
        category: targetCategory,
        description: `Pembaruan data manual kategori ${CATEGORY_LABELS[targetCategory].name}`,
        fileType: 'csv',
        fileContent: csvContent,
      };

      const res = await fetch('/api/upload-layer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setUploadMessage({ type: 'success', text: `Berhasil menyimpan pembaruan data "${layerTitle}" (${CATEGORY_LABELS[targetCategory].name}) dan disinkronkan ke peta frontend.` });
        fetchUploadedLayers();
        if (onDataUploaded) onDataUploaded();
      } else {
        const errData = await res.json();
        setUploadMessage({ type: 'error', text: errData.error || 'Gagal menyimpan pembaruan data.' });
      }
    } catch (err: any) {
      setUploadMessage({ type: 'error', text: `Terjadi kesalahan: ${err.message}` });
    } finally {
      setIsSavingManual(false);
    }
  };

  const handleDeleteLayer = async (layerId: string, layerNameStr: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus layer dataset "${layerNameStr}" dari peta dan server?`)) return;

    try {
      const res = await fetch('/api/delete-layer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: layerId }),
      });

      if (res.ok) {
        setUploadMessage({ type: 'success', text: `Layer "${layerNameStr}" berhasil dihapus dari frontend & server.` });
        fetchUploadedLayers();
        if (onDataUploaded) onDataUploaded();
      }
    } catch (err) {
      console.error('Failed to delete layer:', err);
    }
  };

  const handleDeleteAllLayers = async () => {
    if (!confirm('PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA data pembaruan terunggah dari server dan mengosongkan layer kustom frontend?')) return;

    setIsDeletingAll(true);
    try {
      const res = await fetch('/api/delete-all-layers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setUploadMessage({ type: 'success', text: 'Semua data pembaruan terunggah telah berhasil dihapus dari server dan frontend.' });
        fetchUploadedLayers();
        if (onDataUploaded) onDataUploaded();
      }
    } catch (err) {
      console.error('Failed to delete all layers:', err);
    } finally {
      setIsDeletingAll(false);
    }
  };

  const downloadSampleCsv = (category: CategoryType) => {
    let filename = '';
    let content = '';

    switch (category) {
      case 'admin_boundary':
        filename = 'SHP_Batas_Administrasi_Sample.csv';
        content = 'code,name,province,total_area_ha,population,luas_risiko_tinggi_ha,luas_risiko_sedang_ha,luas_risiko_rendah_ha\n3201,Kabupaten Bogor,Jawa Barat,298620,5427068,104500,119400,74720\n3202,Kabupaten Sukabumi,Jawa Barat,414570,2725400,165800,145000,103770\n3203,Kabupaten Cianjur,Jawa Barat,361435,2477560,142000,130000,89435';
        break;
      case 'pola_ruang':
        filename = 'Pola_Ruang_RTRW_Sample.csv';
        content = 'id_pola_ruang,kode_zona,nama_zona,kategori_utama,kabupaten_kota,luas_ha,ketentuan_kkpr,color\nPR-3201-01,HL,Hutan Lindung Cisarua,Kawasan Lindung,Kabupaten Bogor,1250,Dilarang Komersial,#16a34a\nPR-3201-02,KPU,Pemukiman Kepadatan Tinggi,Kawasan Budidaya,Kabupaten Bogor,3400,Wajib K3 & Drainase,#eab308';
        break;
      case 'kelas_bahaya':
        filename = 'Kelas_Bahaya_Sample.csv';
        content = 'hazard_type,zone_name,kelas_bahaya,score,area_ha,district,lat,lng\nflood,Zona Bahaya Banjir Citarum,Tinggi,3,1580,Kabupaten Bandung,-6.9850,107.6250\nlandslide,Zona Bahaya Longsor Cisarua,Tinggi,3,2400,Kabupaten Bogor,-6.6920,106.9400\nwildfire,Zona Bahaya Kebakaran Hutan,Sedang,2,890,Kabupaten Garut,-7.2200,107.9000';
        break;
      case 'indeks_bahaya':
        filename = 'Indeks_Bahaya_Sample.csv';
        content = 'hazard_type,district,index_score,risk_category,vulnerability_level,lat,lng\nflood,Kabupaten Bogor,88.5,Sangat Tinggi,Kritis,-6.6920,106.9400\nlandslide,Kabupaten Sukabumi,92.1,Sangat Tinggi,Kritis,-6.9850,106.5500\nwildfire,Kabupaten Garut,64.2,Sedang,Moderat,-7.2200,107.9000';
        break;
      case 'incidents':
        filename = 'Titik_Kejadian_Bencana_Sample.csv';
        content = 'id,name,hazard,district,year,impact,lat,lng\nINC-2025-01,Banjir Bandang Cisarua,flood,Kabupaten Bogor,2025,350 Jiwa Mengungsi & 45 Rumah Terendam,-6.6920,106.9400\nINC-2025-02,Longsor Pelabuhanratu,landslide,Kabupaten Sukabumi,2025,Akses Jalan Jalur Selatan Terputus,-6.9850,106.5500\nINC-2025-03,Kebakaran Hutan Cikuray,wildfire,Kabupaten Garut,2025,12 Hektar Lahan Terbakar,-7.2200,107.9000';
        break;
      case 'facilities':
        filename = 'Sample_Format_Fasilitas_Kritis_dan_Umum.csv';
        content = 'id,name,category,sub_type,district,capacity,contact,lat,lng\nFAC-001,RSUD Al-Ihsan,kritis,Rumah Sakit,Kabupaten Bandung,Kapasitas 450 Bed,022-5940872,-6.9892,107.6312\nFAC-002,Posko BPBD Kabupaten Bogor,kritis,Posko BPBD,Kabupaten Bogor,Pusdatin 24/7,0811-2001-113,-6.5950,106.7890\nFAC-003,Stasiun Damkar Cibinong,kritis,Pemadam,Kabupaten Bogor,3 Unit Mobil Pemadam,021-8753555,-6.4800,106.8500\nFAC-004,Polres Sukabumi,kritis,Polisi,Kabupaten Sukabumi,Siaga 24 Jam,0266-431010,-6.9800,106.5600\nFAC-005,SMPN 1 Cisarua (Posko Pengungsian),umum,Sekolah / Pengungsian,Kabupaten Bogor,Kapasitas 600 Jiwa,0812-9988-7766,-6.6900,106.9450\nFAC-006,Masjid Agung Pelabuhanratu,umum,Tempat Ibadah,Kabupaten Sukabumi,Kapasitas 1000 Jamaah,0857-1122-3344,-6.9880,106.5520\nFAC-007,Depo Logistik Pasar Garut,umum,Pasar / Logistik,Kabupaten Garut,Stok Beras & Tenda,0262-234567,-7.2250,107.9050\nFAC-008,GOR Jalak Harupat,umum,Gedung Olahraga,Kabupaten Bandung,Kapasitas 2500 Jiwa,022-5891122,-6.9950,107.5300';
        break;
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-screen w-screen overflow-y-auto bg-slate-50 text-slate-800 flex flex-col font-sans scroll-smooth">
      {/* Top Admin Bar Navigation */}
      <header className="bg-white/95 border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToMap}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-1 transition-transform" />
            <span>Kembali ke Peta Utama</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200" />

          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                Dashboard Super Admin - Radar Bencana
              </h1>
              <p className="text-[11px] text-slate-500 font-mono">
                Pembaruan &amp; Manajemen Data GIS: SHP Administrasi, Pola Ruang, Kelas/Indeks Bahaya, Titik Bencana, Fasilitas
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold">
            Status: Super Admin Aktif
          </span>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8 pb-20">
        
        {/* SECTION 1: PEMILIHAN KATEGORI DATA UNTUK DIPERBAHARUI */}
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-emerald-500 to-amber-500 rounded-xl text-white font-bold shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Modul Pembaruan Data Sistem GIS (6 Kategori Utama)</h2>
                <p className="text-xs text-slate-500 font-mono">
                  Pilih jenis layer/data yang ingin diperbaharui atau diunggah agar disinkronkan secara langsung ke peta frontend
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex bg-slate-100 p-1 border border-slate-200 rounded-xl text-xs font-mono font-bold">
              <button
                onClick={() => setActiveUploadTab('file')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeUploadTab === 'file'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>1. Fitur Upload Berkas Spatial (.tif, .geojson, .csv) &amp; Kelola Dataset</span>
              </button>
              <button
                onClick={() => setActiveUploadTab('manual')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
                  activeUploadTab === 'manual'
                    ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>2. Form Input Langsung (Dinamis Atribut)</span>
              </button>
            </div>
          </div>

          {/* Selector 6 Kategori Data */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 font-mono uppercase tracking-wider">
              Pilih Target Kategori Data Yang Akan Diperbaharui:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {(Object.keys(CATEGORY_LABELS) as CategoryType[]).map((catKey) => {
                const cat = CATEGORY_LABELS[catKey];
                const Icon = cat.icon;
                const isSelected = targetCategory === catKey;

                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => {
                      setTargetCategory(catKey);
                      setActiveGuideTab(catKey);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                      isSelected
                        ? `${cat.color} border-2 shadow-sm scale-[1.02]`
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="w-5 h-5" />
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{cat.name}</div>
                      <div className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{cat.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {uploadMessage && (
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-mono ${
                uploadMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {uploadMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              )}
              <span>{uploadMessage.text}</span>
            </div>
          )}

          {/* TAB 1: FORM INPUT PEMBARUAN DATA MANUAL LANGSUNG (DINAMIS SAMA DENGAN FORMAT PANDUAN ATRIBUT) */}
          {activeUploadTab === 'manual' && (
            <form onSubmit={handleManualSubmit} className="space-y-5 bg-slate-50 p-5 border border-slate-200 rounded-2xl shadow-xs">
              <div className="text-xs font-mono text-emerald-800 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Form Input Langsung - Atribut Spasial Kategori: {CATEGORY_LABELS[targetCategory].name}</span>
              </div>

              {/* DYNAMIC FORM FIELDS BASED ON SELECTED CATEGORY */}

              {/* CATEGORY 1: SHP ADMINISTRASI */}
              {targetCategory === 'admin_boundary' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Kabupaten / Kota (name) *
                      </label>
                      <select
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-sans font-bold shadow-xs"
                      >
                        <option value="Kabupaten Bogor">Kabupaten Bogor</option>
                        <option value="Kabupaten Sukabumi">Kabupaten Sukabumi</option>
                        <option value="Kabupaten Cianjur">Kabupaten Cianjur</option>
                        <option value="Kabupaten Garut">Kabupaten Garut</option>
                        <option value="Kabupaten Tasikmalaya">Kabupaten Tasikmalaya</option>
                        <option value="Kabupaten Bandung">Kabupaten Bandung</option>
                        <option value="Kota Bogor">Kota Bogor</option>
                        <option value="Kota Bandung">Kota Bandung</option>
                      </select>
                      <span className="text-[10px] text-slate-500 font-mono">Atribut: `name`</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Kode Administrasi (code)
                      </label>
                      <input
                        type="text"
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                        placeholder="3201"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">Atribut: `code`</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Provinsi (province)
                      </label>
                      <input
                        type="text"
                        value={adminProvince}
                        onChange={(e) => setAdminProvince(e.target.value)}
                        placeholder="Jawa Barat"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-sans focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 shadow-xs"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">Atribut: `province`</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono uppercase">
                        Total Luas (total_area_ha)
                      </label>
                      <input
                        type="number"
                        value={adminTotalArea}
                        onChange={(e) => setAdminTotalArea(e.target.value)}
                        placeholder="298620"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">Satuan: Hektar</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono uppercase">
                        Populasi (population)
                      </label>
                      <input
                        type="number"
                        value={adminPopulation}
                        onChange={(e) => setAdminPopulation(e.target.value)}
                        placeholder="5427068"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">Jumlah Penduduk</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono uppercase">
                        Risiko Tinggi (Ha)
                      </label>
                      <input
                        type="number"
                        value={adminRiskHigh}
                        onChange={(e) => setAdminRiskHigh(e.target.value)}
                        placeholder="104500"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-rose-300 font-mono focus:outline-none focus:border-rose-500"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">`luas_risiko_tinggi_ha`</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono uppercase">
                        Risiko Sedang (Ha)
                      </label>
                      <input
                        type="number"
                        value={adminRiskMed}
                        onChange={(e) => setAdminRiskMed(e.target.value)}
                        placeholder="119400"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">`luas_risiko_sedang_ha`</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-300 mb-1 font-mono uppercase">
                        Risiko Rendah (Ha)
                      </label>
                      <input
                        type="number"
                        value={adminRiskLow}
                        onChange={(e) => setAdminRiskLow(e.target.value)}
                        placeholder="74720"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-emerald-300 font-mono focus:outline-none focus:border-emerald-500"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">`luas_risiko_rendah_ha`</span>
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY 2: POLA RUANG RTRW */}
              {targetCategory === 'pola_ruang' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Nama Zona Kawasan (nama_zona) *
                      </label>
                      <input
                        type="text"
                        required
                        value={polaName}
                        onChange={(e) => setPolaName(e.target.value)}
                        placeholder="Contoh: Hutan Lindung Cisarua"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-sans shadow-xs"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">Atribut: `nama_zona`</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Kode Zona RTRW (kode_zona)
                      </label>
                      <select
                        value={polaCode}
                        onChange={(e) => setPolaCode(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-teal-700 font-mono font-bold focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-xs"
                      >
                        <option value="HL">HL - Hutan Lindung</option>
                        <option value="KPU">KPU - Pemukiman Urban / Kepadatan Tinggi</option>
                        <option value="KPI">KPI - Kawasan Peruntukan Industri</option>
                        <option value="KPB">KPB - Kawasan Pertanian Budidaya</option>
                        <option value="HPT">HPT - Hutan Produksi Terbatas</option>
                      </select>
                      <span className="text-[10px] text-slate-500 font-mono">Atribut: `kode_zona`</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Kategori Utama (kategori_utama)
                      </label>
                      <select
                        value={polaCategory}
                        onChange={(e) => setPolaCategory(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-sans shadow-xs"
                      >
                        <option value="Kawasan Lindung">Kawasan Lindung</option>
                        <option value="Kawasan Budidaya">Kawasan Budidaya</option>
                      </select>
                      <span className="text-[10px] text-slate-500 font-mono">Atribut: `kategori_utama`</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Kabupaten / Lokasi (kabupaten_kota)
                      </label>
                      <select
                        value={polaDistrict}
                        onChange={(e) => setPolaDistrict(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-sans shadow-xs"
                      >
                        <option value="Kabupaten Bogor">Kabupaten Bogor</option>
                        <option value="Kabupaten Sukabumi">Kabupaten Sukabumi</option>
                        <option value="Kabupaten Cianjur">Kabupaten Cianjur</option>
                        <option value="Kabupaten Garut">Kabupaten Garut</option>
                        <option value="Kabupaten Tasikmalaya">Kabupaten Tasikmalaya</option>
                        <option value="Kabupaten Bandung">Kabupaten Bandung</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Luas Area (luas_ha)
                      </label>
                      <input
                        type="number"
                        value={polaArea}
                        onChange={(e) => setPolaArea(e.target.value)}
                        placeholder="1250"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 shadow-xs"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">Satuan Hektar</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Ketentuan KKPR (ketentuan_kkpr)
                      </label>
                      <select
                        value={polaKkpr}
                        onChange={(e) => setPolaKkpr(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-sans shadow-xs"
                      >
                        <option value="Dilarang Komersial">Dilarang Komersial</option>
                        <option value="Wajib K3 & Drainase">Wajib K3 &amp; Drainase</option>
                        <option value="Izin Terbatas BPBD">Izin Terbatas BPBD</option>
                        <option value="Kawasan Bebas Bangunan">Kawasan Bebas Bangunan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Warna Simbol Pola Ruang (color)
                      </label>
                      <select
                        value={polaColor}
                        onChange={(e) => setPolaColor(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 font-mono shadow-xs"
                      >
                        <option value="#16a34a">#16a34a - Hijau Lindung</option>
                        <option value="#eab308">#eab308 - Kuning Pemukiman</option>
                        <option value="#0284c7">#0284c7 - Biru Perairan</option>
                        <option value="#64748b">#64748b - Abu Industri</option>
                        <option value="#dc2626">#dc2626 - Merah Bahaya</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY 3: KELAS BAHAYA */}
              {targetCategory === 'kelas_bahaya' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Nama Zona Bahaya (zone_name) *
                      </label>
                      <input
                        type="text"
                        required
                        value={hazardZoneName}
                        onChange={(e) => setHazardZoneName(e.target.value)}
                        placeholder="Contoh: Zona Bahaya Longsor Cisarua"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-sans shadow-xs"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">Atribut: `zone_name`</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Jenis Bahaya (hazard_type)
                      </label>
                      <select
                        value={hazardType}
                        onChange={(e) => setHazardType(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-mono font-bold focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs"
                      >
                        <option value="flood">Banjir Bandang / Tergenang (flood)</option>
                        <option value="landslide">Tanah Longsor (landslide)</option>
                        <option value="wildfire">Kebakaran Hutan (wildfire)</option>
                        <option value="coastal">Abrasi / Rob / Gelombang (coastal)</option>
                      </select>
                      <span className="text-[10px] text-slate-500 font-mono">Atribut: `hazard_type`</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Kelas Bahaya (kelas_bahaya)
                      </label>
                      <select
                        value={hazardClass}
                        onChange={(e) => {
                          const val = e.target.value;
                          setHazardClass(val);
                          if (val === 'Tinggi') setHazardScore('3');
                          else if (val === 'Sedang') setHazardScore('2');
                          else setHazardScore('1');
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-sans shadow-xs"
                      >
                        <option value="Tinggi">Tinggi (Skor 3)</option>
                        <option value="Sedang">Sedang (Skor 2)</option>
                        <option value="Rendah">Rendah (Skor 1)</option>
                      </select>
                      <span className="text-[10px] text-slate-500 font-mono">Atribut: `kelas_bahaya` &amp; `score`</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Kabupaten / Wilayah (district)
                      </label>
                      <select
                        value={hazardDistrict}
                        onChange={(e) => setHazardDistrict(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 font-sans shadow-xs"
                      >
                        <option value="Kabupaten Bogor">Kabupaten Bogor</option>
                        <option value="Kabupaten Sukabumi">Kabupaten Sukabumi</option>
                        <option value="Kabupaten Cianjur">Kabupaten Cianjur</option>
                        <option value="Kabupaten Garut">Kabupaten Garut</option>
                        <option value="Kabupaten Tasikmalaya">Kabupaten Tasikmalaya</option>
                        <option value="Kabupaten Bandung">Kabupaten Bandung</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Luas Area Bahaya (area_ha)
                      </label>
                      <input
                        type="number"
                        value={hazardArea}
                        onChange={(e) => setHazardArea(e.target.value)}
                        placeholder="1500"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">Satuan Hektar</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Latitude / Y (lat)
                      </label>
                      <input
                        type="text"
                        value={hazardLat}
                        onChange={(e) => setHazardLat(e.target.value)}
                        placeholder="-6.6920"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Longitude / X (lng)
                      </label>
                      <input
                        type="text"
                        value={hazardLng}
                        onChange={(e) => setHazardLng(e.target.value)}
                        placeholder="106.9400"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY 4: INDEKS BAHAYA */}
              {targetCategory === 'indeks_bahaya' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Kabupaten / Wilayah (district) *
                      </label>
                      <select
                        value={indexDistrict}
                        onChange={(e) => setIndexDistrict(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-sans font-bold shadow-xs"
                      >
                        <option value="Kabupaten Bogor">Kabupaten Bogor</option>
                        <option value="Kabupaten Sukabumi">Kabupaten Sukabumi</option>
                        <option value="Kabupaten Cianjur">Kabupaten Cianjur</option>
                        <option value="Kabupaten Garut">Kabupaten Garut</option>
                        <option value="Kabupaten Tasikmalaya">Kabupaten Tasikmalaya</option>
                        <option value="Kabupaten Bandung">Kabupaten Bandung</option>
                      </select>
                      <span className="text-[10px] text-slate-500 font-mono">Atribut: `district`</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Jenis Bahaya (hazard_type)
                      </label>
                      <select
                        value={indexHazardType}
                        onChange={(e) => setIndexHazardType(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-orange-700 font-mono font-bold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
                      >
                        <option value="flood">Banjir (flood)</option>
                        <option value="landslide">Tanah Longsor (landslide)</option>
                        <option value="wildfire">Kebakaran Hutan (wildfire)</option>
                        <option value="coastal">Abrasi / Rob (coastal)</option>
                      </select>
                      <span className="text-[10px] text-slate-500 font-mono">Atribut: `hazard_type`</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Nilai Skor Indeks (index_score)
                      </label>
                      <input
                        type="text"
                        value={indexScore}
                        onChange={(e) => setIndexScore(e.target.value)}
                        placeholder="88.5"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-orange-700 font-mono font-bold focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">Rentang Skor: 0.0 - 100.0</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Kategori Risiko (risk_category)
                      </label>
                      <select
                        value={indexCategory}
                        onChange={(e) => setIndexCategory(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-sans shadow-xs"
                      >
                        <option value="Sangat Tinggi">Sangat Tinggi</option>
                        <option value="Tinggi">Tinggi</option>
                        <option value="Sedang">Sedang</option>
                        <option value="Rendah">Rendah</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Tingkat Kerentanan (vulnerability_level)
                      </label>
                      <select
                        value={indexVulnerability}
                        onChange={(e) => setIndexVulnerability(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 font-sans shadow-xs"
                      >
                        <option value="Kritis">Kritis</option>
                        <option value="Tinggi">Tinggi</option>
                        <option value="Moderat">Moderat</option>
                        <option value="Rendah">Rendah</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Latitude / Y (lat)
                      </label>
                      <input
                        type="text"
                        value={indexLat}
                        onChange={(e) => setIndexLat(e.target.value)}
                        placeholder="-6.6920"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Longitude / X (lng)
                      </label>
                      <input
                        type="text"
                        value={indexLng}
                        onChange={(e) => setIndexLng(e.target.value)}
                        placeholder="106.9400"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY 5: TITIK BENCANA */}
              {targetCategory === 'incidents' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Nama / Judul Kejadian (name) *
                      </label>
                      <input
                        type="text"
                        required
                        value={incidentTitle}
                        onChange={(e) => setIncidentTitle(e.target.value)}
                        placeholder="Contoh: Banjir Bandang Cisarua"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 font-sans shadow-xs"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">Atribut: `name`</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Jenis Bencana (hazard)
                      </label>
                      <select
                        value={incidentHazard}
                        onChange={(e) => setIncidentHazard(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-rose-700 font-mono font-bold focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 shadow-xs"
                      >
                        <option value="flood">Banjir Bandang / Tergenang (flood)</option>
                        <option value="landslide">Tanah Longsor (landslide)</option>
                        <option value="wildfire">Kebakaran Hutan (wildfire)</option>
                        <option value="coastal">Abrasi / Rob / Gelombang (coastal)</option>
                      </select>
                      <span className="text-[10px] text-slate-500 font-mono">Atribut: `hazard`</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Kabupaten / Wilayah (district)
                      </label>
                      <select
                        value={incidentDistrict}
                        onChange={(e) => setIncidentDistrict(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 font-sans shadow-xs"
                      >
                        <option value="Kabupaten Bogor">Kabupaten Bogor</option>
                        <option value="Kabupaten Sukabumi">Kabupaten Sukabumi</option>
                        <option value="Kabupaten Cianjur">Kabupaten Cianjur</option>
                        <option value="Kabupaten Garut">Kabupaten Garut</option>
                        <option value="Kabupaten Tasikmalaya">Kabupaten Tasikmalaya</option>
                        <option value="Kabupaten Bandung">Kabupaten Bandung</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Tahun Kejadian (year)
                      </label>
                      <select
                        value={incidentYear}
                        onChange={(e) => setIncidentYear(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 shadow-xs"
                      >
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                        <option value="2022">2022</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Rincian Dampak &amp; Korban (impact)
                      </label>
                      <input
                        type="text"
                        value={incidentImpact}
                        onChange={(e) => setIncidentImpact(e.target.value)}
                        placeholder="350 Jiwa Mengungsi & 45 Rumah Terendam"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 font-sans shadow-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1 font-mono uppercase">
                          Lat
                        </label>
                        <input
                          type="text"
                          value={incidentLat}
                          onChange={(e) => setIncidentLat(e.target.value)}
                          placeholder="-6.6920"
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1 font-mono uppercase">
                          Lng
                        </label>
                        <input
                          type="text"
                          value={incidentLng}
                          onChange={(e) => setIncidentLng(e.target.value)}
                          placeholder="106.9400"
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 shadow-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CATEGORY 6: FASILITAS (KRITIS & UMUM) */}
              {targetCategory === 'facilities' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Nama Fasilitas / Gedung (name) *
                      </label>
                      <input
                        type="text"
                        required
                        value={facilityName}
                        onChange={(e) => setFacilityName(e.target.value)}
                        placeholder="Contoh: RSUD Al-Ihsan / GOR Jalak Harupat"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-sans shadow-xs"
                      />
                      <span className="text-[10px] text-slate-500 font-mono">Atribut: `name`</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Kategori Utama (category) *
                      </label>
                      <select
                        value={facilityCategory}
                        onChange={(e) => {
                          const newCat = e.target.value;
                          setFacilityCategory(newCat);
                          if (newCat === 'kritis') {
                            setFacilitySubType('Rumah Sakit');
                          } else {
                            setFacilitySubType('Sekolah / Pengungsian');
                          }
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-sky-700 font-mono font-bold focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-xs"
                      >
                        <option value="kritis">kritis — Fasilitas Kritis / Infrastruktur Vital</option>
                        <option value="umum">umum — Fasilitas Umum / Fasum &amp; Fasos (Shelter)</option>
                      </select>
                      <span className="text-[10px] text-slate-500 font-mono">Atribut: `category` (`kritis` / `umum`)</span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Sub Jenis Fasilitas (sub_type) *
                      </label>
                      <select
                        value={facilitySubType}
                        onChange={(e) => setFacilitySubType(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-sans shadow-xs"
                      >
                        {facilityCategory === 'kritis' ? (
                          <>
                            <option value="Rumah Sakit">Rumah Sakit / Faskes Siaga</option>
                            <option value="Posko BPBD">Posko BPBD / Tagana</option>
                            <option value="Pemadam">Posko Pemadam Kebakaran (Damkar)</option>
                            <option value="Polisi">Kantor Polisi / Koramil / TNI</option>
                          </>
                        ) : (
                          <>
                            <option value="Sekolah / Pengungsian">Sekolah / Tempat Pengungsian</option>
                            <option value="Tempat Ibadah">Tempat Ibadah / Masjid / Gereja</option>
                            <option value="Pasar / Logistik">Pasar &amp; Depo Logistik Pangan</option>
                            <option value="Gedung Olahraga">Gedung Olahraga / GOR / Hall</option>
                          </>
                        )}
                      </select>
                      <span className="text-[10px] text-slate-500 font-mono">Atribut: `sub_type`</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Kabupaten / Wilayah (district)
                      </label>
                      <select
                        value={facilityDistrict}
                        onChange={(e) => setFacilityDistrict(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-sans shadow-xs"
                      >
                        <option value="Kabupaten Bogor">Kabupaten Bogor</option>
                        <option value="Kabupaten Sukabumi">Kabupaten Sukabumi</option>
                        <option value="Kabupaten Cianjur">Kabupaten Cianjur</option>
                        <option value="Kabupaten Garut">Kabupaten Garut</option>
                        <option value="Kabupaten Tasikmalaya">Kabupaten Tasikmalaya</option>
                        <option value="Kabupaten Bandung">Kabupaten Bandung</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Daya Tampung / Bed (capacity)
                      </label>
                      <input
                        type="text"
                        value={facilityCapacity}
                        onChange={(e) => setFacilityCapacity(e.target.value)}
                        placeholder="Kapasitas 450 Bed"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 font-sans shadow-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 font-mono uppercase">
                        Kontak Emergency / PIC (contact)
                      </label>
                      <input
                        type="text"
                        value={facilityContact}
                        onChange={(e) => setFacilityContact(e.target.value)}
                        placeholder="0811-2001-113"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1 font-mono uppercase">
                          Lat
                        </label>
                        <input
                          type="text"
                          value={facilityLat}
                          onChange={(e) => setFacilityLat(e.target.value)}
                          placeholder="-6.9892"
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-700 mb-1 font-mono uppercase">
                          Lng
                        </label>
                        <input
                          type="text"
                          value={facilityLng}
                          onChange={(e) => setFacilityLng(e.target.value)}
                          placeholder="107.6312"
                          className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isSavingManual}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSavingManual ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Menyimpan Pembaruan...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simpan &amp; Tampilkan di Peta Frontend</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: UPLOAD BERKAS CSV / GEOJSON */}
          {activeUploadTab === 'file' && (
            <form onSubmit={handleUploadSubmit} className="space-y-5 bg-slate-50 p-5 border border-slate-200 rounded-2xl shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 font-mono uppercase">
                    Nama Layer / Judul Dataset *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`Contoh: Dataset ${CATEGORY_LABELS[targetCategory].name} Terbaru`}
                    value={layerName}
                    onChange={(e) => setLayerName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2 font-mono uppercase">
                    Deskripsi Singkat (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Pembaruan resmi instansi terkait bulan Juli 2025"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 font-mono shadow-xs"
                  />
                </div>
              </div>

              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2 font-mono uppercase">
                  Pilih Berkas Spatial Raster GeoTIFF (.tif, .tiff), GeoJSON, atau CSV untuk {CATEGORY_LABELS[targetCategory].name}
                </label>
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center bg-white hover:bg-emerald-50/20 transition-all cursor-pointer group shadow-xs">
                  <input
                    type="file"
                    accept=".tif,.tiff,.geojson,.json,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="admin-file-upload"
                  />
                  <label htmlFor="admin-file-upload" className="cursor-pointer block space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 group-hover:border-emerald-500 flex items-center justify-center mx-auto transition-colors shadow-xs">
                      <FileSpreadsheet className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      {selectedFile ? (
                        <div className="text-emerald-700 font-bold font-mono text-sm">
                          Terpilih: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                        </div>
                      ) : (
                        <>
                          <div className="text-xs font-bold text-slate-800">
                            Klik untuk memilih atau seret file Raster GeoTIFF (.tif / .tiff), GeoJSON, atau CSV ke sini
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-1">
                            Format Utama: GeoTIFF Raster (.tif, .tiff), GeoJSON (.geojson), CSV (.csv) (Maksimal 20MB)
                          </div>
                        </>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Panel Input Field Atribut Spasial Administrasi (Format Sistem) */}
              {targetCategory === 'admin_boundary' && (
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <h3 className="text-xs font-bold text-slate-800 font-mono uppercase">
                        Input Field Atribut Spasial Administrasi (Format Sistem)
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Format Atribut Otomatis Disinkronkan ke Frontend
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 font-mono">
                    Isi atau sesuaikan field atribut spasial administrasi di bawah ini agar data hasil upload langsung disinkronkan dan ditampilkan secara lengkap pada kartu informasi &amp; popup peta frontend.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-700 mb-1">
                        Code / ID Wilayah *
                      </label>
                      <input
                        type="text"
                        value={spatialCode}
                        onChange={(e) => setSpatialCode(e.target.value)}
                        placeholder="3201.010.001"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nama Kabupaten / Kota *
                      </label>
                      <input
                        type="text"
                        value={spatialKabupaten}
                        onChange={(e) => setSpatialKabupaten(e.target.value)}
                        placeholder="Kabupaten Bogor"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nama Kecamatan *
                      </label>
                      <input
                        type="text"
                        value={spatialKecamatan}
                        onChange={(e) => setSpatialKecamatan(e.target.value)}
                        placeholder="Kecamatan Cisarua"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Nama Desa / Kelurahan *
                      </label>
                      <input
                        type="text"
                        value={spatialDesa}
                        onChange={(e) => setSpatialDesa(e.target.value)}
                        placeholder="Desa Tugu Selatan"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-amber-700 mb-1">
                        Populasi Terpapar Longsor (Jiwa)
                      </label>
                      <input
                        type="number"
                        value={spatialPopLongsor}
                        onChange={(e) => setSpatialPopLongsor(e.target.value)}
                        placeholder="1450"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-blue-700 mb-1">
                        Populasi Terpapar Banjir (Jiwa)
                      </label>
                      <input
                        type="number"
                        value={spatialPopBanjir}
                        onChange={(e) => setSpatialPopBanjir(e.target.value)}
                        placeholder="2850"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-orange-700 mb-1">
                        Populasi Terpapar Kebakaran (Jiwa)
                      </label>
                      <input
                        type="number"
                        value={spatialPopKebakaran}
                        onChange={(e) => setSpatialPopKebakaran(e.target.value)}
                        placeholder="420"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-rose-700 mb-1">
                        Populasi Terpapar Gempa (Jiwa)
                      </label>
                      <input
                        type="number"
                        value={spatialPopGempa}
                        onChange={(e) => setSpatialPopGempa(e.target.value)}
                        placeholder="3100"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Total Populasi Wilayah (Jiwa)
                      </label>
                      <input
                        type="number"
                        value={spatialTotalPop}
                        onChange={(e) => setSpatialTotalPop(e.target.value)}
                        placeholder="12450"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Luas Wilayah (Hektar / Ha)
                      </label>
                      <input
                        type="number"
                        value={spatialAreaHa}
                        onChange={(e) => setSpatialAreaHa(e.target.value)}
                        placeholder="1580"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isUploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Mengunggah &amp; Memproses...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload &amp; Sinkronkan ke Peta Frontend</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </section>

        {/* SECTION 2: INFORMASI PANDUAN FORMAT ATRIBUT LENGKAP BERSAMA TEMPLATE DOWNOAD UNTUK 6 KATEGORI */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Info className="w-5 h-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Panduan &amp; Instruksi Format Atribut Tabel Sistem (6 Kategori)
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-mono">Petunjuk Format Atribut GIS</span>
          </div>

          {/* Quick Sample Download Bar */}
          <div className="bg-emerald-50/60 border-b border-emerald-200/80 p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-emerald-900 font-medium">
              Unduh Sampel Template CSV untuk Kategori <b className="text-emerald-950 font-mono">{CATEGORY_LABELS[activeGuideTab].name}</b>:
            </div>
            <button
              onClick={() => downloadSampleCsv(activeGuideTab)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Template CSV {CATEGORY_LABELS[activeGuideTab].name}</span>
            </button>
          </div>

          {/* Format Guide Category Tabs */}
          <div className="p-5 space-y-4">
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3 font-mono text-xs">
              {(Object.keys(CATEGORY_LABELS) as CategoryType[]).map((catKey) => {
                const cat = CATEGORY_LABELS[catKey];
                const Icon = cat.icon;
                const isActive = activeGuideTab === catKey;

                return (
                  <button
                    key={catKey}
                    onClick={() => setActiveGuideTab(catKey)}
                    className={`px-3 py-1.5 rounded-lg transition-all font-bold flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Table for Selected Guide Category */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-100 text-slate-800 font-mono text-[11px] uppercase border-b border-slate-200">
                  <tr>
                    <th className="p-3">Nama Kolom (Field)</th>
                    <th className="p-3">Tipe Data</th>
                    <th className="p-3">Keterangan</th>
                    <th className="p-3">Contoh Nilai</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {activeGuideTab === 'admin_boundary' && (
                    <>
                      <tr>
                        <td className="p-3 font-mono font-bold text-emerald-700">code / id</td>
                        <td className="p-3 font-mono">String / Angka</td>
                        <td className="p-3">Kode Administrasi Kemendagri / ID Wilayah</td>
                        <td className="p-3 font-mono text-slate-500">3201</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-emerald-700">name</td>
                        <td className="p-3 font-mono">String</td>
                        <td className="p-3">Nama Resmi Kabupaten / Kota</td>
                        <td className="p-3 font-mono text-slate-500">Kabupaten Bogor</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-emerald-700">total_area_ha</td>
                        <td className="p-3 font-mono">Angka (Numeric)</td>
                        <td className="p-3">Total Luas Wilayah Administrasi (Hektar)</td>
                        <td className="p-3 font-mono text-slate-500">298620</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-emerald-700">population</td>
                        <td className="p-3 font-mono">Angka (Numeric)</td>
                        <td className="p-3">Jumlah Penduduk Terpapar Bencana</td>
                        <td className="p-3 font-mono text-slate-500">5427068</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-emerald-700">luas_risiko_tinggi_ha</td>
                        <td className="p-3 font-mono">Angka (Numeric)</td>
                        <td className="p-3">Luas Area Berisiko Tinggi Bencana (Ha)</td>
                        <td className="p-3 font-mono text-slate-500">104500</td>
                      </tr>
                    </>
                  )}

                  {activeGuideTab === 'pola_ruang' && (
                    <>
                      <tr>
                        <td className="p-3 font-mono font-bold text-teal-700">id_pola_ruang</td>
                        <td className="p-3 font-mono">String</td>
                        <td className="p-3">ID Unik Pola Ruang Zona RTRW</td>
                        <td className="p-3 font-mono text-slate-500">PR-3201-01</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-teal-700">kode_zona</td>
                        <td className="p-3 font-mono">String (HL, KPU, KPI, KPB, HPT)</td>
                        <td className="p-3">Kode Zona RTRW</td>
                        <td className="p-3 font-mono text-slate-500">HL</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-teal-700">nama_zona</td>
                        <td className="p-3 font-mono">String</td>
                        <td className="p-3">Nama Kawasan Pola Ruang</td>
                        <td className="p-3 font-mono text-slate-500">Hutan Lindung Cisarua</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-teal-700">kategori_utama</td>
                        <td className="p-3 font-mono">String</td>
                        <td className="p-3">Kawasan Lindung / Kawasan Budidaya</td>
                        <td className="p-3 font-mono text-slate-500">Kawasan Lindung</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-teal-700">color</td>
                        <td className="p-3 font-mono">String (Hex)</td>
                        <td className="p-3">Kode Warna Tampilan Simbol Map</td>
                        <td className="p-3 font-mono text-slate-500">#16a34a</td>
                      </tr>
                    </>
                  )}

                  {activeGuideTab === 'kelas_bahaya' && (
                    <>
                      <tr className="bg-amber-50/80 border-b border-amber-200 font-bold">
                        <td className="p-3 font-mono text-amber-900">Format Utama: GeoTIFF (.tif / .tiff)</td>
                        <td className="p-3 font-mono text-amber-800">Single-Band Raster Grid</td>
                        <td className="p-3 text-amber-900">Format Raster Standar GIS BNPB / InaRISK. Proyeksi WGS84 (EPSG:4326)</td>
                        <td className="p-3 font-mono text-amber-800">1 (Rendah), 2 (Sedang), 3 (Tinggi)</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-amber-700">zone_name (Vektor)</td>
                        <td className="p-3 font-mono">String</td>
                        <td className="p-3">Nama Area/Zona Bahaya (GeoJSON / CSV)</td>
                        <td className="p-3 font-mono text-slate-500">Zona Bahaya Longsor Cisarua</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-amber-700">hazard_type (Vektor)</td>
                        <td className="p-3 font-mono">String (flood, landslide, wildfire, coastal)</td>
                        <td className="p-3">Jenis Bahaya Spesifik</td>
                        <td className="p-3 font-mono text-slate-500">landslide</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-amber-700">kelas_bahaya (Vektor)</td>
                        <td className="p-3 font-mono">String (Tinggi, Sedang, Rendah)</td>
                        <td className="p-3">Klasifikasi Tingkat Bahaya</td>
                        <td className="p-3 font-mono text-slate-500">Tinggi</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-amber-700">score (Vektor)</td>
                        <td className="p-3 font-mono">Angka (1 - 3)</td>
                        <td className="p-3">Skor Bahaya (1=Rendah, 2=Sedang, 3=Tinggi)</td>
                        <td className="p-3 font-mono text-slate-500">3</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-amber-700">lat, lng (Vektor)</td>
                        <td className="p-3 font-mono">Angka Decimal</td>
                        <td className="p-3">Koordinat Lintang &amp; Bujur Centroid</td>
                        <td className="p-3 font-mono text-slate-500">-6.6920, 106.9400</td>
                      </tr>
                    </>
                  )}

                  {activeGuideTab === 'indeks_bahaya' && (
                    <>
                      <tr className="bg-orange-50/80 border-b border-orange-200 font-bold">
                        <td className="p-3 font-mono text-orange-900">Format Utama: GeoTIFF (.tif / .tiff)</td>
                        <td className="p-3 font-mono text-orange-800">Float32 / Int Raster Grid</td>
                        <td className="p-3 text-orange-900">Format Grid Raster Kontinu Indeks Risiko Bencana GIS. Proyeksi WGS84 (EPSG:4326)</td>
                        <td className="p-3 font-mono text-orange-800">Skor 0.0 - 100.0</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-orange-700">district (Vektor)</td>
                        <td className="p-3 font-mono">String</td>
                        <td className="p-3">Nama Kabupaten / Kota Lokasi (GeoJSON / CSV)</td>
                        <td className="p-3 font-mono text-slate-500">Kabupaten Bogor</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-orange-700">hazard_type (Vektor)</td>
                        <td className="p-3 font-mono">String</td>
                        <td className="p-3">Jenis Bahaya Bencana</td>
                        <td className="p-3 font-mono text-slate-500">flood</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-orange-700">index_score (Vektor)</td>
                        <td className="p-3 font-mono">Angka (0.0 - 100.0)</td>
                        <td className="p-3">Nilai Kontinu Skor Indeks Kerawanan</td>
                        <td className="p-3 font-mono text-slate-500">88.5</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-orange-700">risk_category (Vektor)</td>
                        <td className="p-3 font-mono">String</td>
                        <td className="p-3">Kategori Risiko (Sangat Tinggi, Tinggi, Sedang, Rendah)</td>
                        <td className="p-3 font-mono text-slate-500">Sangat Tinggi</td>
                      </tr>
                    </>
                  )}

                  {activeGuideTab === 'incidents' && (
                    <>
                      <tr>
                        <td className="p-3 font-mono font-bold text-rose-700">name</td>
                        <td className="p-3 font-mono">String</td>
                        <td className="p-3">Nama / Judul Kejadian Bencana</td>
                        <td className="p-3 font-mono text-slate-500">Banjir Bandang Cisarua</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-rose-700">hazard</td>
                        <td className="p-3 font-mono">String (flood, landslide, wildfire, coastal)</td>
                        <td className="p-3">Jenis Bencana Kejadian</td>
                        <td className="p-3 font-mono text-slate-500">flood</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-rose-700">year</td>
                        <td className="p-3 font-mono">Angka / String</td>
                        <td className="p-3">Tahun Kejadian Bencana</td>
                        <td className="p-3 font-mono text-slate-500">2025</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-rose-700">lat, lng</td>
                        <td className="p-3 font-mono">Angka Decimal</td>
                        <td className="p-3">Koordinat Lintang &amp; Bujur GPS</td>
                        <td className="p-3 font-mono text-slate-500">-6.6920, 106.9400</td>
                      </tr>
                    </>
                  )}

                  {activeGuideTab === 'facilities' && (
                    <>
                      <tr>
                        <td className="p-3 font-mono font-bold text-blue-700">name</td>
                        <td className="p-3 font-mono">String</td>
                        <td className="p-3">Nama Fasilitas Kritis / Fasilitas Umum / Lokasi Shelter</td>
                        <td className="p-3 font-mono text-slate-500">RSUD Al-Ihsan / GOR Jalak Harupat</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-blue-700">category</td>
                        <td className="p-3 font-mono">String (kritis / umum)</td>
                        <td className="p-3">Kategori Fasilitas: `kritis` (Vital) atau `umum` (Fasum/Fasos)</td>
                        <td className="p-3 font-mono text-slate-500">kritis / umum</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-blue-700">sub_type</td>
                        <td className="p-3 font-mono">String</td>
                        <td className="p-3">Rumah Sakit, Posko BPBD, Pemadam, Polisi (Kritis) | Sekolah / Pengungsian, Tempat Ibadah, Pasar / Logistik, Gedung Olahraga (Umum)</td>
                        <td className="p-3 font-mono text-slate-500">Rumah Sakit / Sekolah / Pengungsian</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-mono font-bold text-blue-700">capacity</td>
                        <td className="p-3 font-mono">String</td>
                        <td className="p-3">Informasi Daya Tampung / Bed / Logistik</td>
                        <td className="p-3 font-mono text-slate-500">Kapasitas 450 Bed / 1200 Jiwa</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 3: DAFTAR LAYER TER-UPLOAD & SINKRONISASI MANAJEMEN HAPUS FRONTEND */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-amber-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Daftar Pembaruan Data Terunggah di Server ({uploadedLayers.length})
              </h2>
            </div>
            
            <div className="flex items-center gap-2">
              {uploadedLayers.length > 0 && (
                <button
                  onClick={handleDeleteAllLayers}
                  disabled={isDeletingAll}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  title="Hapus Semua Pembaruan Terunggah"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeletingAll ? 'Mengeposkan...' : 'Hapus Semua Data Terunggah'}</span>
                </button>
              )}

              <button
                onClick={fetchUploadedLayers}
                className="px-3 py-1.5 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingLayers ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>

          <div className="p-5">
            {uploadedLayers.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/60 border border-slate-200 rounded-xl space-y-2">
                <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-600 font-mono">
                  Belum ada dataset kustom yang di-upload atau ditambahkan oleh Super Admin.
                </p>
                <p className="text-[11px] text-slate-500 font-mono">
                  Gunakan Form Input Langsung atau Upload Berkas CSV/GeoJSON di atas untuk memperbaharui peta frontend.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-slate-100 text-slate-800 font-mono text-[11px] uppercase border-b border-slate-200">
                    <tr>
                      <th className="p-3">Nama Dataset / Pembaruan</th>
                      <th className="p-3">Kategori GIS</th>
                      <th className="p-3">Format</th>
                      <th className="p-3">Jumlah Record</th>
                      <th className="p-3">Waktu Input</th>
                      <th className="p-3">Status Frontend</th>
                      <th className="p-3 text-right">Fitur Hapus Data</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-800">
                    {uploadedLayers.map((layer) => (
                      <tr key={layer.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{layer.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{layer.filename}</div>
                          {layer.spatialAttributes && (
                            <div className="mt-1 flex flex-wrap gap-1 text-[9px] font-mono text-emerald-700">
                              <span className="bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                ID: {layer.spatialAttributes.code || '-'}
                              </span>
                              <span className="bg-slate-100 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                                {layer.spatialAttributes.nama_desa || layer.spatialAttributes.nama_kecamatan || '-'}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          <span className="px-2 py-0.5 rounded-md font-bold bg-amber-50 border border-amber-200 text-amber-800">
                            {CATEGORY_LABELS[layer.category]?.name || layer.category}
                          </span>
                        </td>
                        <td className="p-3 font-mono uppercase text-emerald-700 font-bold">
                          {layer.type}
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-700">
                          {layer.rowCount} record
                        </td>
                        <td className="p-3 font-mono text-slate-500 text-[11px]">
                          {new Date(layer.uploadTime).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Aktif di Peta</span>
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openAttributeModal(layer)}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                              title="Edit Atribut Spasial Administrasi"
                            >
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Atribut Spasial</span>
                            </button>

                            <button
                              onClick={() => handleDeleteLayer(layer.id, layer.name)}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-[11px] font-mono font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                              title="Hapus Layer dari Frontend & Server"
                            >
                              <Trash2 className="w-3 h-3 text-rose-600" />
                              <span>Hapus</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* MODAL EDIT ATRIBUT SPASIAL LAYER */}
        {editingLayer && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-xl overflow-y-auto max-h-[90vh]">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-sm font-bold text-slate-900 font-mono">
                    Edit Atribut Spasial Dataset: {editingLayer.name}
                  </h3>
                </div>
                <button
                  onClick={() => setEditingLayer(null)}
                  className="text-slate-500 hover:text-slate-800 text-xs font-mono px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                >
                  ✕ Batal
                </button>
              </div>

              <form onSubmit={handleSaveLayerAttributes} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
                  <div>
                    <label className="block text-[11px] font-bold text-emerald-700 mb-1">Code / ID Wilayah *</label>
                    <input
                      type="text"
                      value={editSpatialAttrs.code || ''}
                      onChange={(e) => setEditSpatialAttrs({ ...editSpatialAttrs, code: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Kabupaten / Kota *</label>
                    <input
                      type="text"
                      value={editSpatialAttrs.nama_kabupaten || ''}
                      onChange={(e) => setEditSpatialAttrs({ ...editSpatialAttrs, nama_kabupaten: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Kecamatan *</label>
                    <input
                      type="text"
                      value={editSpatialAttrs.nama_kecamatan || ''}
                      onChange={(e) => setEditSpatialAttrs({ ...editSpatialAttrs, nama_kecamatan: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Nama Desa / Kelurahan *</label>
                    <input
                      type="text"
                      value={editSpatialAttrs.nama_desa || ''}
                      onChange={(e) => setEditSpatialAttrs({ ...editSpatialAttrs, nama_desa: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-700 mb-1">Populasi Terpapar Longsor (Jiwa)</label>
                    <input
                      type="number"
                      value={editSpatialAttrs.populasi_terpapar_longsor ?? 0}
                      onChange={(e) => setEditSpatialAttrs({ ...editSpatialAttrs, populasi_terpapar_longsor: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-blue-700 mb-1">Populasi Terpapar Banjir (Jiwa)</label>
                    <input
                      type="number"
                      value={editSpatialAttrs.populasi_terpapar_banjir ?? 0}
                      onChange={(e) => setEditSpatialAttrs({ ...editSpatialAttrs, populasi_terpapar_banjir: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-orange-700 mb-1">Populasi Terpapar Kebakaran (Jiwa)</label>
                    <input
                      type="number"
                      value={editSpatialAttrs.populasi_terpapar_kebakaran ?? 0}
                      onChange={(e) => setEditSpatialAttrs({ ...editSpatialAttrs, populasi_terpapar_kebakaran: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-rose-700 mb-1">Populasi Terpapar Gempa (Jiwa)</label>
                    <input
                      type="number"
                      value={editSpatialAttrs.populasi_terpapar_gempa ?? 0}
                      onChange={(e) => setEditSpatialAttrs({ ...editSpatialAttrs, populasi_terpapar_gempa: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Total Populasi Wilayah (Jiwa)</label>
                    <input
                      type="number"
                      value={editSpatialAttrs.total_populasi ?? 0}
                      onChange={(e) => setEditSpatialAttrs({ ...editSpatialAttrs, total_populasi: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Luas Wilayah (Ha)</label>
                    <input
                      type="number"
                      value={editSpatialAttrs.luas_wilayah_ha ?? 0}
                      onChange={(e) => setEditSpatialAttrs({ ...editSpatialAttrs, luas_wilayah_ha: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setEditingLayer(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingAttrs}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-mono font-bold rounded-xl flex items-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingAttrs ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>Simpan &amp; Update Frontend</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
