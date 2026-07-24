# RADAR Bencana Rebuild — Modern Light Mode

Membangun ulang seluruh UI aplikasi RADAR Bencana Web GIS dari tema **Dark Mode** ke tema **Modern Light Mode** premium dan user-friendly di `U:\Project\RADAR REBUILD`.

---

## Keputusan Final

| Keputusan | Jawaban |
|---|---|
| **Lokasi kerja** | `U:\Project\RADAR REBUILD` (in-place) |
| **Palet warna** | **Putih + Hijau (Emerald) + Orange (Amber)** — nuansa kebencanaan |
| **Basemap peta** | CartoDB Positron (light minimalis) ✅ |
| **Target UX** | User-friendly untuk pengguna non-teknikal |
| **Fitur admin** | Dipertahankan + ditingkatkan UX-nya |

---

## Palet Warna: Hijau + Orange (Disaster Identity)

### Color System

| Token | Hex/Class | Penggunaan |
|---|---|---|
| **Background utama** | `#ffffff` / `white` | Body, card backgrounds |
| **Background secondary** | `#f8fafc` / `slate-50` | Panel bg, alternate rows |
| **Background subtle** | `#f0fdf4` / `emerald-50` | Highlight areas, sidebar tint |
| **Brand Primary** | `#10b981` → `#059669` / `emerald-500→600` | Logo, tombol utama, zona aman, link aktif |
| **Brand Warning** | `#f59e0b` → `#ea580c` / `amber-500→orange-600` | Alert, badge peringatan, zona waspada, status siaga |
| **Gradient Brand** | `from-emerald-500 via-teal-500 to-amber-500` | Header accent bar, logo border, splash |
| **Gradient Danger** | `from-orange-500 to-rose-500` | Zona merah, status kritis |
| **Text Primary** | `#1e293b` / `slate-800` | Judul, body text |
| **Text Secondary** | `#64748b` / `slate-500` | Subtitle, caption, label |
| **Text Muted** | `#94a3b8` / `slate-400` | Placeholder, hint |
| **Border** | `#e2e8f0` / `slate-200` | Card borders, dividers |
| **Border Accent** | `#a7f3d0` / `emerald-200` | Active card border |

### Konteks Penggunaan Warna

```
🟢 HIJAU (Emerald/Teal)         🟠 ORANGE (Amber/Orange)
├─ Logo RADAR                    ├─ Badge "BENCANA"
├─ Tombol aksi positif           ├─ Alert & warning banners
├─ Zona Hijau (aman)             ├─ Zona Kuning (waspada)
├─ Status "Direkomendasikan"     ├─ Status "Bersyarat"
├─ Active tab / selected         ├─ Loading spinner
├─ Sidebar accent               ├─ Incident markers
├─ KKPR "Disetujui"             ├─ KKPR "Bersyarat"
├─ Risk level "Rendah"          ├─ Risk level "Sedang"/"Tinggi"
└─ Export & download buttons    └─ AI analysis trigger button

🔴 MERAH (Rose) — hanya untuk:
├─ Zona Merah (tidak direkomendasikan)
├─ Delete buttons
├─ Error messages
└─ Status "Kritis" / "Ditolak"
```

---

## Filosofi Desain

> [!IMPORTANT]
> **Prinsip utama: "Sejelas mungkin, seminim mungkin klik."**
> Desain ditargetkan untuk pengguna non-teknikal (pejabat BPBD, warga umum, investor properti).

1. **Clean White Canvas** — Background putih bersih dengan aksen gradient hijau-orange yang profesional
2. **Glassmorphism Premium** — Panel menggunakan `bg-white/85 backdrop-blur-xl` dengan soft shadow
3. **Visual Hierarchy Jelas** — Font size, warna, dan spacing yang jelas membedakan konten
4. **Ikon + Label** — Setiap tombol selalu disertai label teks, bukan hanya ikon
5. **Tooltips & Hints** — Keterangan singkat di elemen teknis
6. **Feedback Visual** — Hover, loading, success/error states yang jelas
7. **Dual-Accent Identity** — Hijau = positif/aman, Orange = peringatan/siaga — intuitif untuk semua pengguna

---

## Proposed Changes

### Design System & Foundation

#### [MODIFY] [index.css](file:///U:/Project/RADAR%20REBUILD/src/index.css)
- **Scrollbar**: Track `#f1f5f9`, thumb `#94a3b8`, hover `#64748b`
- **Leaflet container**: Background `#f8fafc`
- **Leaflet zoom**: Background `#ffffff`, border `#e2e8f0`, hover accent emerald
- **Leaflet popups**: Background `#ffffff`, border `#e2e8f0`, tip putih, soft shadow
- **Custom popups**: Tip → `#ffffff`
- **Range slider**: Track `#e2e8f0`, thumb `#10b981` (emerald)
- **Zoom positioning**: Tetap bottom-right
- **Pulse animation**: Dipertahankan

#### [MODIFY] [index.html](file:///U:/Project/RADAR%20REBUILD/index.html)
- Body class → `bg-white text-slate-800`
- Tambah meta description

---

### App Shell

#### [MODIFY] [App.tsx](file:///U:/Project/RADAR%20REBUILD/src/App.tsx)
- Root container → `bg-slate-50 text-slate-800`
- Logic **tidak diubah**

---

### Header & Navigation

#### [MODIFY] [Header.tsx](file:///U:/Project/RADAR%20REBUILD/src/components/Header.tsx)
- Background → `bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-200`
- Logo: Gradient `emerald → teal → amber`, label "BENCANA" badge = `bg-amber-50 border-amber-300 text-amber-700`
- Breadcrumb → `bg-emerald-50 border-emerald-200/60`
- Search → `bg-slate-50 border-slate-200`, focus ring emerald
- Buttons → Light variants, Super Admin = `bg-gradient-to-r from-emerald-50 to-amber-50`

---

### Control Sidebar (Left)

#### [MODIFY] [LeftSidebar.tsx](file:///U:/Project/RADAR%20REBUILD/src/components/LeftSidebar.tsx)
- Background → `bg-white/90 backdrop-blur-xl shadow-lg`
- **Hazard Selector**: Cards besar, active = emerald gradient, inactive = `bg-slate-50`
- **Render Mode Toggle**: Pill toggle emerald
- **Opacity Slider**: Label + nilai %, thumb emerald
- **Layer Toggles**: Switch-style dengan label + subtitle
- **Facility Filter**: Checkbox + label + ikon per sub-type
- **RadarInvest Form**: Input `bg-white border-slate-200`, picker button = hijau, submit = gradient emerald-to-teal
- **AI & Export buttons**: AI = gradient amber-orange, Export = outlined emerald

---

### Map View (Center)

#### [MODIFY] [MapContainer.tsx](file:///U:/Project/RADAR%20REBUILD/src/components/MapContainer.tsx)
- **Basemap** → CartoDB Positron
- **Floating controls** → `bg-white/95 backdrop-blur shadow-lg`
- **Legend** → Light bg, soft border
- **Status bar** → `bg-white/95 backdrop-blur-md`
- **Point picker banner** → `bg-amber-50 border-amber-200 text-amber-800`
- **Popups** (incident, facility, district) → All light theme
- **District polygons** → Border/fill disesuaikan untuk light basemap

#### [MODIFY] [MapView.tsx](file:///U:/Project/RADAR%20REBUILD/src/components/MapView.tsx)
- Inline styles → Light theme

---

### Analytics Dashboard (Right)

#### [MODIFY] [RightDashboard.tsx](file:///U:/Project/RADAR%20REBUILD/src/components/RightDashboard.tsx)
- Background → `bg-white/90 backdrop-blur-xl shadow-lg`
- **Tabs**: Active = emerald gradient pill, inactive = `bg-slate-100`
- **Stat cards** → `bg-gradient-to-br from-white to-emerald-50/50 border-slate-200 shadow-sm`
- **Risk bars**: Merah/orange/hijau tetap, bg putih
- **Pie Chart**: Background putih, warna chart vibrant
- **RadarInvest Result**: Zona badges (🔴🟡🟢) tetap kuat, bg light
- **AI Assessment**: Summary = `bg-emerald-50`, Vulnerabilities = `bg-amber-50`, Mitigations = list hijau
- **Export button**: Outlined emerald

---

### Modal Dialogs

#### [MODIFY] [CodeViewerModal.tsx](file:///U:/Project/RADAR%20REBUILD/src/components/CodeViewerModal.tsx)
- Overlay → `bg-slate-900/40 backdrop-blur-sm`
- Modal → `bg-white shadow-2xl`
- **Code blocks tetap dark** (konvensi UI)

#### [MODIFY] [DataGuideModal.tsx](file:///U:/Project/RADAR%20REBUILD/src/components/DataGuideModal.tsx)
- Modal → `bg-white`, tables = light striped, tabs = light pills

#### [MODIFY] [AllDisasterIncidentsModal.tsx](file:///U:/Project/RADAR%20REBUILD/src/components/AllDisasterIncidentsModal.tsx)
- Modal → `bg-white`, table headers = `bg-emerald-50`, badges tetap colorful

#### [MODIFY] [CustomGeoModal.tsx](file:///U:/Project/RADAR%20REBUILD/src/components/CustomGeoModal.tsx)
- Modal → `bg-white`, textarea = `bg-slate-50 font-mono`

#### [MODIFY] [MyGeometryModal.tsx](file:///U:/Project/RADAR%20REBUILD/src/components/MyGeometryModal.tsx)
- Modal → `bg-white`, instruksi jelas untuk non-teknikal

#### [MODIFY] [PythonCodeModal.tsx](file:///U:/Project/RADAR%20REBUILD/src/components/PythonCodeModal.tsx)
- Modal → `bg-white`, **code blocks tetap dark**

---

### Authentication & Admin Portal

#### [MODIFY] [LoginPage.tsx](file:///U:/Project/RADAR%20REBUILD/src/components/LoginPage.tsx)
- Page bg → `bg-gradient-to-br from-white via-emerald-50/30 to-amber-50/30`
- Login card → `bg-white shadow-2xl`, accent bar = gradient emerald→amber
- Login button → Gradient `from-emerald-500 to-teal-500`
- Error → `bg-rose-50 border-rose-200`

#### [MODIFY] [AdminDashboardPage.tsx](file:///U:/Project/RADAR%20REBUILD/src/components/AdminDashboardPage.tsx)
- Page bg → `bg-gradient-to-br from-slate-50 to-emerald-50/20`
- **Category Cards**: Ikon besar + deskripsi + badge counter, active = emerald border
- **Upload Zone**: Drag-drop besar `bg-emerald-50/50 border-dashed border-emerald-300`
- **Field Mapping**: Label jelas "Hubungkan Kolom Data → Kolom Sistem" + hints
- **Management Table**: Light striped, hapus = merah + **konfirmasi dialog**
- **Delete All**: Tombol merah + konfirmasi ganda

---

### Files NOT Modified

- [types.ts](file:///U:/Project/RADAR%20REBUILD/src/types.ts)
- [hazardLayers.ts](file:///U:/Project/RADAR%20REBUILD/src/data/hazardLayers.ts)
- [mockAdminBoundaries.ts](file:///U:/Project/RADAR%20REBUILD/src/data/mockAdminBoundaries.ts)
- [mockDisasterIncidents.ts](file:///U:/Project/RADAR%20REBUILD/src/data/mockDisasterIncidents.ts)
- [mockFacilities.ts](file:///U:/Project/RADAR%20REBUILD/src/data/mockFacilities.ts)
- [mockPolaRuang.ts](file:///U:/Project/RADAR%20REBUILD/src/data/mockPolaRuang.ts)
- [radarInvestCalculator.ts](file:///U:/Project/RADAR%20REBUILD/src/utils/radarInvestCalculator.ts)
- [server.ts](file:///U:/Project/RADAR%20REBUILD/server.ts)
- [vite.config.ts](file:///U:/Project/RADAR%20REBUILD/vite.config.ts) / [tsconfig.json](file:///U:/Project/RADAR%20REBUILD/tsconfig.json) / [package.json](file:///U:/Project/RADAR%20REBUILD/package.json)

---

## Verification Plan

### Automated
```bash
cd "U:\Project\RADAR REBUILD"
npm install
npm run dev
npm run lint
```

### Manual Checklist
- [ ] **`/`** — Layout putih + aksen hijau-orange
- [ ] **Peta** — Basemap Positron, layer, popup → light
- [ ] **Left Sidebar** — Kontrol user-friendly, hijau/orange accent
- [ ] **Right Dashboard** — Chart, stats, AI → light
- [ ] **`/login`** — Premium light, gradient hijau-amber
- [ ] **`/admin-dashboard`** — Upload, mapping, table → light + UX improved
- [ ] **5 Modals** — Light (code tetap dark)
- [ ] **Responsive** — Viewport kecil OK
- [ ] **Hapus data** — Konfirmasi dialog
- [ ] **Upload** — Field mapping otomatis
