# 🌍 DOKUMENTASI LENGKAP APLIKASI RADAR BENCANA
## Manual Arsitektur Sistem, Spesifikasi Fungsional, Pemetaan GIS & Integrasi Qwen 2.5 AI

---

## 📋 1. Ringkasan Eksekutif & Tujuan Sistem

**RADAR Bencana** (*Rekapitulasi Analisis Dampak Area & Risiko Bencana*) adalah sistem aplikasi **Web GIS (Geographic Information System)** interaktif modern berbasis web yang dirancang khusus untuk pemetaan risiko kebencanaan, analisis spasial statistik zonasi tutupan lahan **Google Earth Engine (GEE)**, serta dukungan pengambilan keputusan tanggap darurat dan mitigasi bencana di wilayah **Provinsi Jawa Barat**.

Aplikasi ini menyatukan analisis data geospasial multidimensi (Raster & Vektor) dengan kecerdasan buatan (*Artificial Intelligence*) berbasis **Qwen 2.5 AI (Alibaba Cloud DashScope)** untuk memberikan laporan eksekutif dan asisten obrolan (*Disaster Management Chatbot*) yang responsif, akurat, dan memiliki batasan pengetahuan (*domain guardrails*) yang ketat mengenai kebencanaan dan tata ruang RTRW/KKPR.

---

## 🏗️ 2. Arsitektur Teknologi & Tech Stack

Sistem dibangun menggunakan arsitektur *Single Page Application (SPA)* berbasis **React 18 + Vite** yang terintegrasi dengan **Express.js Backend Middleware** dalam satu lingkungan eksekusi TypeScript.

```
+-------------------------------------------------------------------+
|                        FRONTEND CLIENT                            |
|  - React 18 SPA (TypeScript)                                      |
|  - TailwindCSS (Clean Modern Emerald & Amber Light Theme)         |
|  - Leaflet.js & Tile Layer CartoDB Positron                       |
|  - Recharts (Sunburst Donut Analytics & Distribution Charts)      |
|  - Lucide React (Clean SVG Vector Icons System)                  |
+-------------------------------------------------------------------+
                                 |
                          HTTP REST API
                                 |
+-------------------------------------------------------------------+
|                        EXPRESS BACKEND                            |
|  - Express.js (Node.js ES Modules Middleware)                     |
|  - Multer Engine & File System Storage (/public/uploads)         |
|  - Layer Persistence Index (`layers_index.json`)                 |
|  - Spatial Attributes Parser (GeoJSON, GeoTIFF, CSV)              |
+-------------------------------------------------------------------+
                                 |
                          HTTPS API CALLS
                                 |
+-------------------------------------------------------------------+
|                        AI ENGINE (EXTERNAL)                       |
|  - Alibaba Cloud DashScope API (`qwen-plus` Model Engine)         |
|  - System Prompt Strict Domain Guardrails & Context Injection     |
+-------------------------------------------------------------------+
```

### Rincian Pustaka & Framework Utamanya:
* **Frontend Core**: React 18, TypeScript, Vite.
* **Map & Spatial Engine**: `leaflet`, `@types/leaflet`.
* **Styling & UI**: TailwindCSS, Lucide React (`lucide-react`).
* **Visualisasi Data Chart**: Recharts (`recharts`).
* **Backend Server**: Express.js (`express`), Multer (`multer`), TSX Server Runner (`tsx`).
* **AI Service**: DashScope API Qwen 2.5 (`qwen-plus`).

---

## 🛠️ 3. Modul & Fitur Utama Aplikasi

### 🗺️ A. Modul Web GIS & Visualisasi Spasial Peta Interaktif
Navigasi peta interaktif tiga panel yang menyajikan berbagai layer spasial:
1. **Layer Bahaya Bencana (4 Ancaman Utama)**:
   * 🌊 **Banjir Bandang & Genangan (Flood)**: Indeks risiko 100-tahun return period.
   * ⛰️ **Tanah Longsor (Landslide)**: Tingkat kerentanan lereng dan geologi.
   * 🔥 **Kebakaran Hutan & Lahan (Wildfire)**: Hotspot dan tutupan vegetasi kering.
   * 🌊 **Abrasi & Rob Pesisir (Coastal)**: Gelombang ekstrem & ancaman pesisir.
2. **Layer Pola Ruang RTRW (Kawasan Lindung vs Kawasan Budi Daya)**:
   * Menampilkan zonasi peruntukan lahan sesuai Perda RTRW Provinsi Jawa Barat (Hutan Lindung, Sempadan Sungai, Pemukiman, Industri, Pertanian).
   * Aturan KKPR (Kesesuaian Kegiatan Pemanfaatan Ruang) Dinas PUPR.
3. **Layer Batas Administrasi Kabupaten/Kota & Populasi Terpapar**:
   * Statistik jumlah penduduk terpapar tiap jenis bencana berdasarkan batas GeoJSON resmi.
4. **Layer Titik Kejadian Bencana & Fasilitas**:
   * **Titik Bencana**: Lokasi rincian kejadian bencana (dampak jiwa, rumah rusak, infrastruktur).
   * **Fasilitas (Kritis & Umum)**:
     * **Fasilitas Kritis**: Rumah Sakit / Faskes, Posko BPBD / Tagana, Stasiun Pemadam Kebakaran, Polisi / TNI.
     * **Fasilitas Umum (Fasum/Fasos/Shelter)**: Sekolah / Tempat Pengungsian, Tempat Ibadah, Pasar / Depo Logistik, Gedung Olahraga (GOR).

---

### 🤖 B. Modul Tanya AI Bencana & Laporan AI (Qwen 2.5 Engine)
Kecerdasan Buatan berteknologi **Qwen 2.5 (qwen-plus)** yang dilengkapi dua fitur utama:

1. **Jalankan Analisis Laporan AI**:
   * Menghasilkan Laporan Spasial Risiko Wilayah dalam format terstruktur: *Executive Summary*, *Key Vulnerabilities*, dan *Actionable Mitigations*.
2. **Tanya AI Bencana (Interactive Disaster Chatbot)**:
   * **Strict Domain Guardrails**: AI secara ketat dikondisikan hanya menjawab pertanyaan seputar kebencanaan, analisis spasial GEE, tata ruang RTRW/KKPR, dan protokol BPBD/BNPB Jawa Barat. Pertanyaan di luar topik (seperti resep masakan) akan ditolak secara sopan.
   * **Dynamic Context Injection**: AI secara otomatis membaca nama kabupaten yang sedang dipilih pengguna, jenis ancaman bencana aktif, dan data statistik luas hektar terancam dari peta untuk dimasukkan ke dalam konteks percakapan.
   * **UX Mode Layar Penuh (Maximized Fullscreen Modal)**: Jendela dialog chat yang dapat diperbesar menjadi modal layar penuh (`max-w-5xl h-[92vh]`) untuk memudahkan membaca laporan panjang, serta dapat diciutkan (*minimized*).

---

### 💼 C. Modul RADAR Invest Tapak (Studi Kelayakan Investasi Spasial)
Fitur analisis spasial otomatis untuk membantu **Dunia Usaha & Investor** mengevaluasi kesesuaian lokasi rencana tapak investasi terhadap risiko bencana dan aturan RTRW:
* **Analisis Kelayakan Spasial 3 Zona**:
  * 🔴 **ZONA MERAH (Ditolak / Sangat Berbahaya)**: Tumpang tindih dengan Kawasan Lindung / Sesar Aktif / Risiko Bencana Eksis.
  * 🟡 **ZONA KUNING (Bersyarat / Wajib Mitigasi Rekayasa)**: Berada pada kawasan penyangga / butuh AMDAL & retensi banjir.
  * 🟢 **ZONA HIJAU (Layak / Kawasan Budi Daya)**: Sesuai RTRW dan berisiko rendah.
* **Kalkulasi Radius Buffer Dinamis**: Menghitung luas persil hektar (`Ha`) menjadi radius buffer lingkaran spasial di atas peta.

---

### 🔐 D. Modul Super Admin & Pengelolaan Dataset Spasial (`/admin-dashboard`)
Portal administrasi terlindungi untuk tim data administrator:
* **Akses Otentikasi**: Halaman `/login` dengan validasi kredensial admin.
* **Upload Live Dataset**:
  * Berkas **GeoTIFF Raster (.tif/.tiff)**.
  * Berkas **GeoJSON Vector (.json/.geojson)**.
  * Berkas **Tabel Spasial CSV (.csv)**.
* **6 Kategori Data GIS**:
  1. Batas Administrasi (SHP)
  2. Pola Ruang (RTRW)
  3. Kelas Bahaya
  4. Indeks Bahaya
  5. Titik Kejadian Bencana
  6. Fasilitas (Kritis & Umum)
* **Editor Atribut Spasial & Manajemen Hapus Layer**: Fitur memperbaharui atribut populasi terpapar dan menghapus layer dari server & frontend secara real-time.

---

## 📂 4. Struktur Direktori Proyek

```
RADAR REBUILD/
├── public/
│   └── uploads/                  # Lokasi penyimpanan berkas GIS ter-upload & index layers_index.json
├── src/
│   ├── components/               # Komponen Antarmuka (UI) React
│   │   ├── Header.tsx            # Header Navigasi Atas & Status Wilayah
│   │   ├── LeftSidebar.tsx       # Control Panel Kiri (Tema, Qwen Chat, Radar Invest)
│   │   ├── MapContainer.tsx      # Komponen Peta Utama Leaflet.js
│   │   ├── RightDashboard.tsx    # Panel Dashboard Kanan (Chart Distribusi & Tab Laporan AI)
│   │   ├── MaximizedChatModal.tsx# Modal Chatbot Fullscreen Mode Layar Penuh
│   │   ├── AdminDashboardPage.tsx# Halaman Portal Super Admin Upload Data
│   │   ├── LoginPage.tsx         # Halaman Login Admin
│   │   ├── CodeViewerModal.tsx   # Modal Inspector Kode GEE Python
│   │   ├── MyGeometryModal.tsx   # Modal Custom Polygon Geometry GeoJSON
│   │   ├── DataGuideModal.tsx    # Modal Panduan Format Atribut GIS
│   │   └── AllDisasterIncidentsModal.tsx # Modal Riwayat Kejadian Bencana
│   ├── data/                     # Data Mock & Spasial Bawaan
│   │   ├── mockAdminBoundaries.ts
│   │   ├── mockFacilities.ts
│   │   ├── mockIncidents.ts
│   │   └── mockPolaRuang.ts
│   ├── utils/                    # Utility Calculator & Formatters
│   │   └── radarInvestCalculator.ts
│   ├── types.ts                  # Definisi Antarmuka Data TypeScript
│   ├── App.tsx                   # Main Root Component & Routing State
│   └── main.tsx                  # Entry Point React DOM
├── .env                          # Kunci API QWEN_API_KEY & Port Konfigurasi
├── .env.example                  # Sampel Konfigurasi Environment
├── server.ts                     # Express.js Backend Middleware & Server Routing
├── README.md                     # Dokumentasi Instalasi & Quick Start
└── DOKUMENTASI_APLIKASI.md       # Dokumentasi Spesifikasi Sistem Terperinci
```

---

## 📡 5. Skema API Backend (`server.ts`)

Express server menangani endpoint berikut:

| Endpoint | Method | Fungsi & Deskripsi |
| :--- | :--- | :--- |
| `/api/generate-ai-report` | `POST` | Mengirim data statistik risiko & wilayah ke Qwen 2.5 AI untuk menghasilkan JSON Laporan Eksekutif. |
| `/api/chat-ai` | `POST` | Endpoint percakapan Tanya AI Bencana dengan Qwen 2.5 (Guardrails + Dynamic Context). |
| `/api/upload-layer` | `POST` | Menerima upload berkas GIS (GeoTIFF, GeoJSON, CSV) via Multer dan memperbarui `layers_index.json`. |
| `/api/uploaded-layers` | `GET` | Mengambil daftar semua dataset spasial yang aktif ter-upload di server. |
| `/api/delete-layer` | `POST` | Menghapus berkas layer spesifik berdasarkan `id` dari server dan memulihkan peta. |
| `/api/delete-all-layers` | `POST` | Menghapus seluruh layer kustom ter-upload dari server. |

---

## 🚀 6. Jalur Eksekusi & Perintah Pengoperasian

### 1. Menjalankan Mode Pengembang (Development)
```bash
npm run dev
```
* Menjalankan server pada `http://localhost:3000`.

### 2. Memeriksa Tipe TypeScript
```bash
npx tsc --noEmit
```

### 3. Membangun Bundle Produksi (Production Build)
```bash
npm run build
```
* Membangun berkas statis frontend Vite ke `dist/` dan mengompilasi `server.ts` menjadi `dist/server.js`.

---

## 🛡️ 7. Lisensi & Hak Cipta

Dikembangkan oleh **Tim Studio Inklusi** untuk mendukung resiliensi bencana dan keterbukaan informasi geospasial Provinsi Jawa Barat. Hak cipta dilindungi undang-undang.
