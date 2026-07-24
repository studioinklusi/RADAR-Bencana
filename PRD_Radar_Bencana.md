# Product Requirement Document (PRD)
## RADAR Bencana — Web GIS & Earth Engine Hazard Mapping System

**Versi Dokumen:** 1.0.0  
**Tanggal:** 24 Juli 2026  
**Status:** Baseline Final  
**Platform:** Web Application (React 19 + Express.js + Google Earth Engine + Gemini AI)  

---

## 1. Latar Belakang & Visi Produk

### 1.1 Latar Belakang
Provinsi Jawa Barat secara topografis dan klimatologis memiliki tingkat kerentanan yang tinggi terhadap berbagai ancaman bencana alam, seperti banjir luapan sungai, tanah longsor di kawasan pegunungan, kebakaran hutan dan lahan (karhutla), serta banjir rob di wilayah pesisir. Di sisi lain, laju investasi pembangunan properti dan industri yang pesat sering kali mengalami kendala tumpang tindih dengan kawasan lindung atau area berisiko tinggi.

Proses analisis kesesuaian ruang dan risiko kebencanaan konvensional sering kali memerlukan waktu lama, keterbatasan akses ke data penginderaan jauh satelit, serta belum terintegrasinya sistem perizinan kesesuaian ruang (KKPR) dengan data risiko bencana secara real-time.

### 1.2 Visi Produk
**RADAR Bencana** hadir sebagai platform *Web GIS Interaktif* modern yang mengombinasikan kekuatan **Google Earth Engine (GEE)** untuk analisis tutupan lahan dan indeks bencana berbasis citra satelit, **Artificial Intelligence (Gemini AI)** untuk otomatisasi penilaian risiko & rekomendasi mitigasi, serta kalkulator **RadarInvest** untuk menilai kelayakan geospasial bagi rencana investasi & pemanfaatan ruang.

---

## 2. Target Pengguna (User Personas & Target Audience)

| Role Pengguna | Kebutuhan Utama | Fitur Utama yang Digunakan |
|---|---|---|
| **Masyarakat Umum / Warga Terdampak** | Pemantauan lokasi rawan bencana, informasi fasilitas shelter pengungsian, dan riwayat kejadian bencana. | Web GIS Map, Filter Fasilitas Shelter, Modal Titik Bencana. |
| **Analis BPBD & Dinas PUPR** | Analisis zonasi risiko (Zonal Statistics), pemantauan Pola Ruang (RTRW), serta pengunduhan data statistik risiko kawasan. | Multi-Layer Hazard Switcher, Zonal Statistics Dashboard, Gemini AI Assessment Report, Export CSV. |
| **Investor & Developer Properti / Industri** | Evaluasi kelayakan lokasi tapak proyek, kepastian status Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR), dan mitigasi fisik. | **RadarInvest Calculator**, Interactive Map Point Picker, KKPR Feasibility Status. |
| **Super Admin / Pengelola GIS** | Pembaruan dataset geospasial (GeoJSON, GeoTIFF, CSV), pemetaan atribut geospasial, dan manajemen layer. | Portal Admin Dashboard (`/admin-dashboard`), Data Ingest Hub, Form Manual Entri Geospasial. |

---

## 3. Arsitektur System & Tech Stack

```
[ Frontend: React 19 + Vite + TailwindCSS v4 + Leaflet GIS + Recharts ]
                               │
                               ▼
[ Backend Gateway: Node.js / Express.js (server.ts) + Turf.js ]
         │                                       │
         ▼                                       ▼
[ Google GenAI SDK (Gemini AI) ]       [ Python GEE Service ]
(Rekomendasi Mitigation & Risk)        (Earth Engine Satellite API)
```

- **Frontend Core:** React 19, TypeScript, Vite 6, TailwindCSS v4, Framer Motion.
- **GIS & Mapping Engine:** Leaflet.js 1.9, Turf.js 7.3, GeoJSON, GeoTIFF parser.
- **Data Visualization:** Recharts (Sunburst/Pie/Bar chart untuk statistik zonal).
- **Backend API:** Express.js (`server.ts`) dengan tsx execution engine.
- **AI Integration:** `@google/genai` (Gemini 2.5/3.6 Flash model).
- **Python Backend Subsystem:** `src/backend_python/gee_service.py` (Google Earth Engine Python API).

---

## 4. Spesifikasi Fitur Utama (Core Functional Requirements)

### 4.1 Interactive Multi-Layer Web GIS Visualizer
* **Dual-Mode Hazard Overlay:**
  * Mendukung 4 jenis bencana: **Banjir (Flood)**, **Tanah Longsor (Landslide)**, **Karhutla (Wildfire)**, dan **Banjir Rob (Coastal Inundation)**.
  * *Render Mode Switcher:* **Kelas Bahaya** (Klasifikasi bahaya: Rendah, Sedang, Tinggi, Ekstrem) dan **Indeks Bahaya** (Skala kontinu 0.0 - 100.0).
  * Pengaturan transparansi opacity layer (0% - 100%).
* **Layer Pengawasan & Spatial Boundaries:**
  * **Batas Administrasi:** Batas Provinsi Jawa Barat dan 27 Kabupaten/Kota.
  * **Pola Ruang (RTRW):** Penanda kawasan Lindung (Hutan Lindung, Resapan Air, Sempadan) vs. Kawasan Budi Daya (Pemukiman, Industri, Pertanian).
  * **Titik Kejadian Bencana:** Marker interaktif kejadian bencana historical & aktif dengan filter berdasarkan jenis bencana.
  * **Fasilitas Kritis & Shelter:** RSUD, Posko BPBD, Pemadam Kebakaran, Kantor Polisi, Sekolah/Pengungsian, Tempat Ibadah, Logistik/Pasar, dan GOR.
* **Custom GeoJSON Layer:**
  * Kemampuan pengguna untuk mengunggah file `.geojson` mandiri untuk ditampilkan langsung di atas peta interaktif.

---

### 4.2 RadarInvest — Investment & Spatial Feasibility Calculator
Fitur unggulan untuk menilai kelayakan spasial dan risiko lingkungan terhadap rencana investasi atau pembangunan plot/tapak tanah.

* **Input Parametrik:**
  * Koordinat Geografis (Latitude & Longitude) — via input manual atau **Interactive Point Picker** pada peta.
  * Luas Plot Tanah (Hektar / Ha).
  * Sektor Pembangunan (misal: Industri & Manufaktur, Perumahan, Pariwisata, Energi).
  * Nama Proyek / Rencana Pembangunan.
* **Algoritma Output & Analisis:**
  * **Pencocokan Wilayah Administrasi & Desa:** Menentukan lokasi secara presisi hingga tingkat Desa/Kecamatan.
  * **Status Kelayakan (Feasibility Status):**
    1. 🔴 **ZONA MERAH (TIDAK DIREKOMENDASIKAN):** Tumpang tindih dengan Kawasan Lindung/Hutan Konservasi atau memiliki rasio risiko bencana ekstrem (>50%).
    2. 🟡 **ZONA KUNING (BISA DIBANGUN DENGAN SYARAT KETAT):** Berada pada kawasan penyangga/resapan air atau memiliki risiko bencana sedang-tinggi.
    3. 🟢 **ZONA HIJAU (DIREKOMENDASIKAN):** Berada pada Kawasan Budi Daya dan bebas dari ancaman bencana utama.
  * **Analisis Luas Area (Ha Breakdown):** Rincian rasio Luas Kawasan Lindung vs Luas Dapat Dibangun, serta pembagian Luas Risiko Tinggi/Sedang/Rendah.
  * **Status KKPR (Kesesuaian Kegiatan Pemanfaatan Ruang):** Proyeksi persetujuan perizinan KKPR (Disetujui / Bersyarat / Ditolak).
  * **Catatan Mitigasi Teknis:** Rekomendasi wajib (misal: alokasi RTH minimal, pembuatan Retaining Wall, pemasangan EWS, penyusunan AMDAL).

---

### 4.3 Google Earth Engine (GEE) Zonal Statistics & Exposure Analysis
* **Simulasi & Integration GEE:**
  * Endpoint `/api/get-statistics` menghitung tutupan lahan zonal di wilayah yang dipilih (*reduceRegion*).
  * Distribusi tutupan area: Pertanian, Hutan, Tumbuhan Non-Hutan, Non-Vegetasi, Tubuh Air.
* **Exposure & Impact Assessment:**
  * Estimasi populasi terpapar risiko bencana.
  * Jumlah fasilitas fisik terekspos (Rumah Sakit, Sekolah, Jembatan).
* **Data Export:**
  * Fitur unduh laporan statistik Zonal dalam format CSV.

---

### 4.4 AI-Powered Vulnerability & Risk Assessment (Gemini AI)
* **Otomatisasi Laporan Analisis:**
  * Mengirimkan data statistik zonal dan karakteristik bencana ke endpoint `/api/generate-ai-report` (Gemini 2.5/3.6 Flash).
* **Elemen Laporan AI:**
  * **Executive Summary:** Ringkasan tingkat risiko wilayah dalam 2-3 kalimat.
  * **Key Vulnerabilities:** 3 faktor utama pemicu kerentanan di wilayah tersebut.
  * **Actionable Mitigations:** Langkah penanganan darurat dan rencana mitigasi jangka panjang yang relevan.

---

### 4.5 Portal Super Admin Hub (`/admin-dashboard`)
Portal terproteksi untuk administrator GIS mengelola dataset dan layer spasial sistem.

* **Otentikasi Access:** Sistem login terpisah (`/login`).
* **Pengelolaan 6 Kategori Dataset Spasial:**
  1. *SHP Administrasi* (Batas wilayah & data statistik populasi)
  2. *Pola Ruang / RTRW* (Zona Kawasan Lindung vs Budi Daya)
  3. *Kelas Bahaya* (GeoTIFF / GeoJSON klasifikasi bahaya)
  4. *Indeks Bahaya* (GeoTIFF / GeoJSON nilai indeks kerawanan)
  5. *Titik Bencana* (Koordinat & riwayat kejadian bencana)
  6. *Fasilitas Kritis & Shelter* (Sarana prasarana penanggulangan bencana)
* **Fitur Portal Admin:**
  * **File Upload Hub:** Mendukung format GeoJSON, GeoTIFF (`.tif`/`.tiff`), dan CSV.
  * **Spatial Attribute & Field Mapping Engine:** Pemetaaan atribut spasial secara dinamis ke dalam GeoJSON/Vector.
  * **Form Manual Entry:** Pengisian data geospasial langsung via form interaktif tanpa memerlukan perangkat lunak QGIS/ArcGIS.
  * **Dataset Management:** Fitur pratinjau, unduh, dan hapus dataset terunggah.

---

### 4.6 Developer Inspector & Secondary Modals
* **GEE Code Viewer Modal:** Menampilkan contoh skrip Python Google Earth Engine API (`gee_service.py`) untuk transparansi metodologi analisis geospasial bagi para peneliti dan pengembang.
* **Data Guide Modal:** Panduan spesifikasi data spasial dan file template CSV/GeoJSON untuk kemudahan pengunggah data.
* **All Disaster Incidents Modal:** Tabel dan peta komprehensif seluruh riwayat kejadian bencana di wilayah Jawa Barat.

---

## 5. Persyaratan Non-Fungsional (Non-Functional Requirements)

| Kategori | Persyaratan |
|---|---|
| **Performa (Performance)** | - Waktu muat awal peta Web GIS < 2 detik.<br>- Respon analisis kalkulasi RadarInvest < 500 ms.<br>- Respon generasi laporan Gemini AI < 3 detik. |
| **Keamanan (Security)** | - Proteksi halaman `/admin-dashboard` via halaman otentikasi `/login`.<br>- Penanganan aman API Key Gemini melalui environment variable server.<br>- Sanitasi upload file spasial untuk mencegah serangan injeksi. |
| **Skalabilitas & Format Data** | - Mendukung pengunggahan file spasial GeoJSON & GeoTIFF hingga ukuran 20MB.<br>- Pengelolaan direktori statis untuk layer terunggah (`public/uploads/layers_index.json`). |
| **Kenyamanan Pengguna (UX/UI)** | - Antarmuka modern 3-pane layout (Control Sidebar, Map View, Right Analytics Dashboard).<br>- Tema Dark Mode premium dengan glassmorphism & visual warna HSL yang harmonis.<br>- Dukungan Dwi-Bahasa (Bahasa Indonesia & English). |

---

## 6. Matrix Peran & Hak Akses (RBAC Matrix)

| Fitur / Halaman | Public User | Investor / Developer | Analis BPBD / PUPR | Super Admin |
|---|:---:|:---:|:---:|:---:|
| Eksplorasi Web GIS & Layer Hazard | ✅ | ✅ | ✅ | ✅ |
| Penggunaan Kalkulator RadarInvest | ✅ | ✅ | ✅ | ✅ |
| Generasi AI Risk Assessment Report | ✅ | ✅ | ✅ | ✅ |
| Ekspor Data Zonal Stats ke CSV | ✅ | ✅ | ✅ | ✅ |
| Unggah File GeoJSON Kustom (Sesi) | ✅ | ✅ | ✅ | ✅ |
| Halaman Admin Dashboard (`/admin-dashboard`) | ❌ | ❌ | ❌ | ✅ |
| Unggah & Simpan Dataset Spasial Permanen | ❌ | ❌ | ❌ | ✅ |
| Reset & Hapus Layer Spasial | ❌ | ❌ | ❌ | ✅ |

---

## 7. Rencana Pengembangan Masa Depan (Future Roadmap)

1. **Integrasi IoT Sensor Peringatan Dini (EWS):** Menghubungkan titik bencana dengan sensor telemetry curah hujan & debit air sungai secara live stream.
2. **On-the-fly Satellite Processing:** Mengintegrasikan panggilan langsung ke API Google Earth Engine Python service untuk pemrosesan citra Sentinel-2/Landsat 9 secara real-time di area ROI kustom.
3. **Ekspor Laporan PDF Resmi:** Fitur cetak dokumen hasil analisis RadarInvest & Gemini AI ke format PDF bertanda tangan digital untuk melengkapi berkas pengajuan perizinan KKPR.
