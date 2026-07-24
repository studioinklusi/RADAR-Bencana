# 🌍 RADAR Bencana — Web GIS & Earth Engine Hazard Mapping System

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/GIS-Leaflet-199900?logo=leaflet)](https://leafletjs.com/)
[![AI Engine](https://img.shields.io/badge/AI-Qwen%202.5%20(Alibaba%20Cloud)-FF6A00)](https://help.aliyun.com/zh/dashscope/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Sistem Informasi Geografis (Web GIS) modern dan interaktif untuk rekapitulasi, pemetaan risiko kebencanaan, analisis statistik zonasi *Google Earth Engine (GEE)*, serta rekomendasi aksi tanggap darurat BPBD Jawa Barat berbasis **Qwen 2.5 AI (Alibaba Cloud)**.

---

## 📌 Daftar Isi

- [⚡ Prasyarat Sistem](#-prasyarat-sistem)
- [📥 Panduan Kloning & Instalasi](#-panduan-kloning--instalasi)
- [🔑 Konfigurasi Environment Variables (`.env`)](#-konfigurasi-environment-variables-env)
- [🚀 Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [🛠️ Fitur Utama Sistem](#️-fitur-utama-sistem)
- [📂 Struktur Direktori Proyek](#-struktur-direktori-proyek)
- [🤖 Integrasi Qwen 2.5 AI & Guardrails](#-integrasi-qwen-25-ai--guardrails)
- [🌐 Deployment (Vercel & Supabase)](#-deployment-vercel--supabase)

---

## ⚡ Prasyarat Sistem

Sebelum memulai, pastikan perangkat Anda telah terinstal perangkat lunak berikut:

* **Node.js**: `v18.x` atau `v20.x` (Direkomendasikan LTS)
* **npm**: `v9.x` ke atas (atau Paket Manager `bun` / `yarn` / `pnpm`)
* **Git**: `v2.x` ke atas

---

## 📥 Panduan Kloning & Instalasi

Ikuti langkah-langkah berikut untuk mengonfigurasi proyek di komputer lokal Anda:

### 1. Kloning Repository dari GitHub

```bash
git clone https://github.com/username-anda/RADAR-Bencana.git
cd RADAR-Bencana
```

### 2. Instalasi Dependensi (Node Modules)

Jalankan perintah instalasi paket dependensi:

```bash
npm install
```

---

## 🔑 Konfigurasi Environment Variables (`.env`)

Aplikasi ini menggunakan kunci API dari **Alibaba Cloud DashScope (Qwen 2.5)** untuk fitur kecerdasan buatan.

1. Salin berkas sampel `.env.example` menjadi `.env`:

   ```bash
   cp .env.example .env
   ```

2. Buka berkas `.env` dan masukkan API Key Anda:

   ```env
   # API Key Qwen 2.5 dari Alibaba Cloud DashScope
   # (Hubungi Tim Studio Inklusi untuk mendapatkan API Key resmi)
   QWEN_API_KEY=your_qwen_api_key_here

   # Port Server Express Backend
   PORT=3000
   ```

---

## 🚀 Menjalankan Aplikasi

### 1. Mode Pengembang (Development Mode)

Jalankan perintah dev server yang mengintegrasikan **Vite HMR** (Frontend React) dan **Express Backend**:

```bash
npm run dev
```

Aplikasi akan berjalan pada alamat:  
👉 **`http://localhost:3000`**

### 2. Pemeriksaan Tipe TypeScript (Type Check)

Untuk memastikan tidak ada kesalahan tipe data TypeScript sebelum commit/push:

```bash
npx tsc --noEmit
```

### 3. Kompilasi Produksi (Production Build)

Untuk menghasilkan bundel produksi teroptimasi:

```bash
npm run build
```

Hasil kompilasi akan tersimpan di direktori `/dist` (`dist/index.html` & `dist/server.js`).

---

## 🛠️ Fitur Utama Sistem

1. **Peta Interaktif Web GIS (Leaflet + CartoDB Positron):**
   - Basemap terang minimalis *CartoDB Positron* yang nyaman di mata.
   - Pilihan 4 Layer Utama Hazard: **Banjir (Flood)**, **Tanah Longsor (Landslide)**, **Karhutla (Wildfire)**, dan **Banjir Pesisir (Coastal)**.
   - Mode Tampilan: Klassifikasi Kategori Kualitatif & Mode Indeks Kontinu.

2. **Google Earth Engine (GEE) Zonal Statistics:**
   - Rekapitulasi luas area berdampak (*Risiko Tinggi, Sedang, Rendah*) per kabupaten/kota di Jawa Barat.
   - Estimasi populasi terdampak, rumah sakit rentan, sekolah/pengungsian, dan jembatan kritis.

3. **Portal Super Admin & Pengelolaan Data GIS (`/admin-dashboard`):**
   - Upload berkas spatial (SHP/GeoJSON/CSV).
   - Mapping atribut kolom dinamis & visualisasi preview data layer terunggah.

4. **Kalkulator RADAR Invest (Dunia Usaha):**
   - Pengujian koordinat lokasi rencana proyek terhadap Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR) & RTRW 2021–2041.

5. **Qwen 2.5 AI Risk Report & Interactive Disaster Chatbot ("Tanya AI Bencana"):**
   - Generator Laporan Risiko Otomatis.
   - Chatbot interaktif dengan **Strict Domain Knowledge Guardrails** (hanya menjawab seputar kebencanaan, SIG, dan BPBD Jabar).

---

## 📂 Struktur Direktori Proyek

```
RADAR-REBUILD/
├── public/                # Asset publik (ikon, gambar, uploads SHP)
├── src/
│   ├── assets/            # Aksen visual & asset GIS
│   ├── components/        # Komponen React (Sidebar, Map, Dashboards, Modals)
│   │   ├── AdminDashboardPage.tsx  # Portal Super Admin
│   │   ├── Header.tsx              # Navigation & Search Bar
│   │   ├── LeftSidebar.tsx         # Sidebar Kontrol & Tanya AI Chatbot
│   │   ├── LoginPage.tsx           # Halaman Login Admin
│   │   ├── MapContainer.tsx        # Container Leaflet Map
│   │   ├── RightDashboard.tsx      # Dashboard Analitis & Laporan AI
│   │   └── ... (Modals)
│   ├── data/              # Mock Boundaries, Pola Ruang, Facilities
│   ├── types.ts           # Definisi Interface TypeScript
│   ├── App.tsx            # Main App Router & State Hydration
│   ├── main.tsx           # React DOM Root Entry
│   └── index.css          # Design System & Tailwind Utilities
├── server.ts              # Express Backend (API Uploads, Qwen AI proxy)
├── vite.config.ts         # Konfigurasi Build Vite
├── tsconfig.json          # Konfigurasi Compiler TypeScript
├── package.json           # Dependensi & Scripts
└── .env                   # Environment Variables (Local)
```

---

## 🤖 Integrasi Qwen 2.5 AI & Guardrails

Sistem ini ditenagai oleh **Qwen 2.5 (`qwen-plus`)** dari Alibaba Cloud DashScope dengan dua fungsi utama:

1. **`POST /api/generate-ai-report`**:  
   Menerima statistik spasial raster GEE dan mengembalikan analisis JSON terstruktur (*Ringkasan Eksekutif, Faktor Kerentanan, & Aksi Mitigasi BPBD*).

2. **`POST /api/chat-ai`**:  
   Fitur **Tanya AI Bencana** interaktif yang menyuntikkan data wilayah aktif (*Dynamic Spatial Context*) dan membatasi pembicaraan secara ketat (*Strict Guardrails*) hanya pada domain kebencanaan & SIG Jawa Barat.

---

## 🌐 Deployment (Vercel & Supabase)

Aplikasi ini siap dipublikasikan secara online:

* **Frontend & Backend**: Siap di-deploy ke **Vercel** (`vercel.json`).
* **Database Spasial**: Dapat dihubungkan ke **Supabase** dengan ekstensi **PostGIS** untuk penyimpanan titik bencana & polygon SHP secara terpusat.

---

## 👥 Tim & Kontribusi

Silakan ajukan *Pull Request* atau laporkan *Issues* untuk pengembangan fitur kebencanaan lebih lanjut!

**Salam Tangguh, Salam Kemanusiaan!** 🛡️🇮🇩
