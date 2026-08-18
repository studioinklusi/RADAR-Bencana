import { VILLAGE_BUILDING_STATS, VillageBuildingStat } from '../src/data/villageBuildingStatsData';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { messages = [], activeContext = {} } = req.body || {};
    const qwenApiKey = process.env.QWEN_API_KEY;

    const {
      districtName = 'Kabupaten Banjarnegara',
      provinceName = 'Jawa Tengah',
      hazardType = 'landslide',
      stats = null
    } = activeContext;

    const lastUserMsg = messages.length > 0 ? messages[messages.length - 1].text : '';
    const villageStat = findVillageBuildingStat(lastUserMsg);

    if (!qwenApiKey) {
      const reply = generateRichDisasterMarkdownReport(lastUserMsg, districtName, hazardType, stats, villageStat);
      return res.status(200).json({ success: true, text: reply, provider: 'Knowledge Engine Local (Markdown Table Supported)' });
    }

    const systemPrompt = `Anda adalah "Asisten Tanya AI RADAR Bencana", pakar SIG, Analis Penanggulangan Bencana, Tapak Bangunan Spasial, dan Tata Ruang Kabupaten Banjarnegara, Jawa Tengah.

ATURAN UTAMA & DOMAIN GUARDRAILS:
1. RUANG LINGKUP WILAYAH (100% EKSKLUSIF KABUPATEN BANJARNEGARA, JAWA TENGAH):
   - Seluruh 18 Kecamatan (Wanayasa, Kalibening, Pandanarum, Karangkobar, Batur, Pejawaran, Pagentan, Madukara, Banjarmangu, Sigaluh, Banjarnegara, Pagedongan, Bawang, Purwanegara, Mandiraja, Purwareja Klampok, Susukan, Rakit) dan 276 Desa di dalamnya ADALAH WILAYAH KABUPATEN BANJARNEGARA.
   - Jika pengguna menanyakan nama wilayah seperti "Wanadri" atau "Wanayasa", yang dimaksud SELALU wilayah di Kabupaten Banjarnegara, Jawa Tengah.

2. BASIS DATA TAPAK BANGUNAN RESMI (GOOGLE OPEN BUILDINGS AI - 465.806 POLIGON):
   - Total Bangunan Fisik Seluruh Banjarnegara: 465.806 unit (40.985.909 m² / 4.098,59 Ha luas atap fisik).
   - Sebaran Bahaya Bencana: 344.747 unit di Zona Risiko Tinggi (74.0%), 59.746 unit di Zona Sedang (12.8%), 61.313 unit di Zona Rendah (13.2%).
   ${villageStat ? `- Data Khusus Wilayah yang Ditanyakan: Desa ${villageStat.desa}, Kecamatan ${villageStat.kecamatan} memiliki TOTAL ${villageStat.totalBuildings.toLocaleString('id-ID')} unit bangunan tapak (luas total atap ${villageStat.totalAreaM2.toLocaleString('id-ID')} m²), populasi ${villageStat.totalPopulasi.toLocaleString('id-ID')} jiwa, luas wilayah ${villageStat.totalLuasHa} Ha.` : ''}

3. KLASIFIKASI PERTANYAAN & PEDOMAN MENJAWAB:
   a. PERTANYAAN JUMLAH BANGUNAN / RUMAH / PEMUKIMAN:
      - Jawab langsung dengan angka presisi dari basis data tapak bangunan Google Open Buildings AI di atas.
      - Berikan rincian luas tapak ($m^2$), estimasi paparan risiko bencana, dan rekomendasi struktural fisik bangunan.
   
   b. KATEGORI BENCANA & MITIGASI (Tanah Longsor, Banjir, Gempa, dll):
      - Berikan analisis risiko spasial yang mendalam dan solutif.
      - Gunakan format markdown terstruktur dengan tabel: Distribusi Risiko Spasial, Paparan Fasilitas Kritis, dan Matriks Rekomendasi Aksi BPBD.
      - Cantumkan Kontak Darurat Mako BPBD Banjarnegara: (0286) 592881 / WhatsApp 0812-2630-111.
   
   c. KATEGORI DI LUAR DOMAIN / OFF-TOPIC:
      - TOLAK DENGAN SOPAN dan ramah.

DATA KONTEKS SPASIAL AKTIF DI PETA SAAT INI:
- Wilayah Terpilih: ${districtName}, ${provinceName}
- Jenis Ancaman Aktif: ${hazardType.toUpperCase()}
- Ringkasan Statistik Spasial Terkini: ${stats ? JSON.stringify(stats) : 'Seluruh Kabupaten Banjarnegara'}`;

    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))
    ];

    const apiResponse = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${qwenApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: formattedMessages
      })
    });

    const data: any = await apiResponse.json();
    const replyText = data.choices?.[0]?.message?.content || generateRichDisasterMarkdownReport(lastUserMsg, districtName, hazardType, stats, villageStat);

    return res.status(200).json({ success: true, text: replyText });
  } catch (err: any) {
    console.error('Vercel serverless chat-ai error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

function findVillageBuildingStat(query: string): VillageBuildingStat | null {
  const q = (query || '').toLowerCase().trim();
  if (!q) return null;

  for (const [key, val] of Object.entries(VILLAGE_BUILDING_STATS)) {
    const desaName = val.desa.toLowerCase();
    const kecName = val.kecamatan.toLowerCase();
    if (q.includes(desaName) && (q.includes(kecName) || desaName.length >= 4)) {
      return val;
    }
  }

  for (const [key, val] of Object.entries(VILLAGE_BUILDING_STATS)) {
    const desaName = val.desa.toLowerCase();
    if (q.includes(desaName) && desaName.length >= 3) {
      return val;
    }
  }

  return null;
}

function generateRichDisasterMarkdownReport(query: string, districtName: string, hazardType: string, stats: any, villageStat: VillageBuildingStat | null): string {
  const q = (query || '').toLowerCase().trim();

  // 1. Check for off-topic queries
  const offTopicKeywords = [
    'resep', 'masak', 'goreng', 'nasi goreng', 'kue', 'makanan', 'minuman', 'kuliner',
    'game', 'film', 'lagu', 'chord', 'lirik', 'anime', 'manga', 'gosip', 'artis',
    'pacar', 'jodoh', 'cinta', 'zodiak', 'ramalan', 'skincare', 'makeup',
    'python', 'javascript', 'html', 'coding', 'react', 'tutorial', 'belajar matematika'
  ];
  const isOffTopic = offTopicKeywords.some(keyword => q.includes(keyword));

  if (isOffTopic) {
    return `### ℹ️ Informasi Domain Layanan RADAR AI

Mohon maaf, sebagai **Asisten AI RADAR Bencana Kabupaten Banjarnegara**, saya dikhususkan untuk menjawab pertanyaan seputar:
- 🛡️ **Potensi & Risiko Bencana**: Tanah longsor, banjir, gempa bumi, likuifaksi, dan banjir bandang.
- 🏠 **Data Tapak Bangunan (465k Footprints)**: Jumlah bangunan, rumah, luas tapak fisik per desa/kecamatan.
- 🗺️ **Analisis Spasial & Citra Satelit**: Data GEE 30m, fasilitas publik terdampak, dan kemiringan lereng.
- 🌲 **Tata Ruang & Pola Kawasan**: Pola ruang RTRW, kawasan lindung, sempadan sungai DAS Serayu, dan tutupan lahan Banjarnegara.
- 🚨 **Kesiapsiagaan & Kontak Darurat**: Rekomendasi mitigasi, posko siaga desa, dan kontak BPBD.

---
*💡 Silakan ajukan pertanyaan terkait kebencanaan atau wilayah spasial Kabupaten Banjarnegara.*`;
  }

  // 2. Check for building / village building specific queries
  const isBuildingQuery = q.includes('bangunan') || q.includes('rumah') || q.includes('gedung') || q.includes('footprint') || q.includes('atap') || villageStat !== null;
  if (isBuildingQuery) {
    if (villageStat) {
      return `### 🏠 Data Spasial Tapak Bangunan — Desa ${villageStat.desa}, Kecamatan ${villageStat.kecamatan}

Berdasarkan dataset **Google Open Buildings AI (465.806 Poligon Bangunan Kabupaten Banjarnegara)** dan pemetaan spasial BPBD:

---

#### 📊 1. Rincian Fisik Bangunan Desa ${villageStat.desa}

| Parameter Spasial | Nilai Terdata | Keterangan |
| :--- | :--- | :--- |
| **Total Tapak Bangunan** | **${villageStat.totalBuildings.toLocaleString('id-ID')} Unit** | Poligon fisik atap bangunan teridentifikasi AI |
| **Total Luas Atap Fisik** | **${villageStat.totalAreaM2.toLocaleString('id-ID')} m²** | $\\approx$ ${(villageStat.totalAreaM2 / 10000).toFixed(2)} Hektar luasan tapak |
| **Populasi Penduduk** | **${villageStat.totalPopulasi.toLocaleString('id-ID')} Jiwa** | Estimasi paparan penduduk desa |
| **Luas Wilayah Desa** | **${villageStat.totalLuasHa.toLocaleString('id-ID')} Ha** | Cakupan batas administrasi desa |
| **Tingkat Kerentanan Lokasi** | **${villageStat.highRiskBuildings > 0 ? 'Zona Risiko Tinggi' : 'Zona Sedang'}** | ${villageStat.highRiskBuildings > 0 ? `${villageStat.highRiskBuildings} unit di zona rentan bencana` : 'Kondisi relatif stabil'} |

---

#### 🏗️ 2. Rekomendasi Mitigasi Bangunan Fisik
1. **Perkuatan Pondasi & Dinding**: Pada lereng miring di sekitar Desa ${villageStat.desa}, wajib menggunakan sistem dinding penahan tanah (DPT) dan drainase resapan kedap air.
2. **Jalur Evakuasi Rumah Warga**: Pastikan akses antar-gang pemukiman memiliki rambu titik kumpul (*assembly point*) yang bebas dari ancaman retakan tanah.
3. **Visualisasi Peta**: Anda dapat mencentang layer **\`[✓] Tapak Bangunan (465k Unit)\`** di sidebar kiri untuk melihat langsung poligon atap rumah di Desa ${villageStat.desa} pada peta!`;
    }

    // General Banjarnegara building query
    return `### 🏠 Data Spasial Tapak Bangunan — Kabupaten Banjarnegara

Berdasarkan dataset **Google Open Buildings AI (465.806 Poligon Bangunan Kabupaten Banjarnegara)**:

---

#### 📊 1. Ringkasan Total Bangunan Kabupaten Banjarnegara

| Kategori Risiko | Jumlah Bangunan | Persentase (%) | Luas Tapak ($m^2$) |
| :--- | :--- | :--- | :--- |
| 🔴 **Zona Risiko Tinggi** | **344.747 Unit** | **74.0%** | $\\approx$ 30,32 Juta m² |
| 🟡 **Zona Risiko Sedang** | **59.746 Unit** | **12.8%** | $\\approx$ 5,25 Juta m² |
| 🟢 **Zona Risiko Rendah** | **61.313 Unit** | **13.2%** | $\\approx$ 5,41 Juta m² |
| **TOTAL KABUPATEN** | **465.806 Unit** | **100.0%** | **40.985.909 m² (4.098 Ha)** |

---

#### 💡 Panduan Cepat:
- Anda dapat menanyakan nama desa secara spesifik (contoh: *"Berapa jumlah bangunan di Desa Wanadri?"* atau *"Jumlah rumah di Desa Batur"*).
- Aktifkan layer **\`[✓] Tapak Bangunan (465k Unit)\`** di menu sidebar kiri untuk melihat sebaran atap rumah secara visual di peta.`;
  }

  // 3. Check for spatial / regional non-disaster queries (e.g. Forest, Land Use, RTRW)
  const isForestOrLandUse = q.includes('hutan') || q.includes('hutan lindung') || q.includes('pola ruang') || q.includes('rtrw') || q.includes('tata guna') || q.includes('tutupan lahan');
  if (isForestOrLandUse) {
    return `### 🌲 Informasi Kawasan Hutan & Tata Ruang — ${districtName}

Berdasarkan data spasial Pola Ruang RTRW dan analisis tutupan lahan Kabupaten Banjarnegara:

#### 📌 Profil Kawasan Hutan Lindung & Konservasi
- **Kawasan Hutan Lindung di Banjarnegara** sebagian besar tersebar di zona perbukitan utara (pegunungan dataran tinggi Dieng, Kecamatan Batur, Wanayasa, Pejawaran, Kalibening) serta lereng pegunungan selatan (Pagedongan).
- **Fungsi Utama**: Berfungsi krusial sebagai daerah resapan air (*water catchment area*), penyangga tata air DAS Kali Serayu, serta pencegah erosi dan stabilitas lereng dari bahaya tanah longsor.
- **Karakteristik**: Luas tutupan hutan dan kawasan lindung Banjarnegara mencakup lebih dari **15.000+ hektar** yang terbagi dalam kawasan hutan lindung, hutan produksi terbatas milik Perum Perhutani KPH Banyumas Timur / Kedu Selatan, serta kawasan cagar alam/taman wisata alam Dieng.

---

#### 💡 Rekomendasi Pengelolaan Spasial:
1. **Pengendalian Alih Fungsi Lahan**: Pertahankan tutupan vegetasi hutan di hulu dan batasi ekspansi pertanian semusim berkemiringan terjal (seperti kentang) tanpa terasering.
2. **Kombinasi Agroforestri**: Penanaman tanaman berakar dalam seperti vetiver, bambu, dan kopi di batas kawasan hutan lindung.
3. **Pemeriksaan Layer**: Anda dapat mengaktifkan layer **Pola Ruang / Tata Guna Lahan** di menu peta RADAR Bencana untuk melihat sebaran poligon kawasan lindung secara visual.`;
  }

  // 4. Default Disaster Report
  const hazardNameMap: Record<string, string> = {
    landslide: 'Tanah Longsor',
    flood: 'Banjir',
    flashflood: 'Banjir Bandang',
    earthquake: 'Gempa Bumi',
    liquefaction: 'Likuifaksi'
  };

  const hazardName = hazardNameMap[hazardType] || hazardType;
  const totalHa = stats?.totalAreaHa || 115712;
  const highHa = stats?.highRiskHa || Math.round(totalHa * 0.317);
  const medHa = stats?.mediumRiskHa || Math.round(totalHa * 0.367);
  const lowHa = stats?.lowRiskHa || Math.max(0, totalHa - highHa - medHa);

  const highPct = stats?.highRiskPct || Number(((highHa / totalHa) * 100).toFixed(1));
  const medPct = stats?.mediumRiskPct || Number(((medHa / totalHa) * 100).toFixed(1));
  const lowPct = stats?.lowRiskPct || Number(((lowHa / totalHa) * 100).toFixed(1));

  const hospitals = stats?.hospitalsExposed || 2;
  const schools = stats?.schoolsExposed || 14;
  const bridges = stats?.bridgesExposed || 6;

  return `### 🛡️ Laporan Analisis Potensi Bencana Spasial — ${districtName}

Berikut adalah analisis komprehensif tingkat risiko ancaman **${hazardName.toUpperCase()}** berdasarkan data raster 30-meter Google Earth Engine (GEE) & pemetaan spasial BPBD Kabupaten Banjarnegara.

---

#### 📊 1. Tabel Rincian Distribusi Risiko Spasial (GEE 30m)

| Kelas Risiko | Tingkat Ancaman | Luas Area (Hektar) | Persentase (%) | Status Kawasan & Rekomendasi |
| :--- | :--- | :--- | :--- | :--- |
| **Kelas 3** | **Tinggi (High Risk)** | **${highHa.toLocaleString('id-ID')} ha** | **${highPct}%** | 🔴 **Zona Merah** — Kawasan Rentan Pergerakan / Genangan Utama |
| **Kelas 2** | **Sedang (Moderate)** | **${medHa.toLocaleString('id-ID')} ha** | **${medPct}%** | 🟡 **Zona Kuning** — Waspada Musim Hujan & Erosi Lereng |
| **Kelas 1** | **Rendah (Low Risk)** | **${lowHa.toLocaleString('id-ID')} ha** | **${lowPct}%** | 🟢 **Zona Hijau** — Kawasan Stabil & Titik Kumpul Evakuasi |
| **TOTAL** | **Seluruh Area** | **${totalHa.toLocaleString('id-ID')} ha** | **100.0%** | **Cakupan Administrasi Terpetakan** |

---

#### 🏥 2. Tabel Paparan Sarana & Fasilitas Kritis Terpapar

| Jenis Fasilitas Publik | Jumlah Terpapar | Status Kesiapsiagaan & Fungsi Evakuasi |
| :--- | :--- | :--- |
| **Rumah Sakit / Puskesmas** | **${hospitals} Unit** | Rujukan utama & posko penanganan medis darurat |
| **Sekolah / Bangunan Publik** | **${schools} Unit** | Tempat pengungsian sementara (SHELTER) warga |
| **Jembatan & Alur DAS** | **${bridges} Titik** | Perkuatan pondasi jembatan & pemantauan arus sungai |

---

#### ⚠️ 3. Faktor Kerentanan Utama Geologi & Iklim
- **Topografi Lereng**: Berada pada zona perbukitan Serayu Utara/Selatan dengan kecenderungan kemiringan lereng terjal di kawasan **${districtName}**.
- **Infiltrasi Air Hujan**: Curah hujan harian tinggi memicu kejenuhan tanah dan erosi lereng pada titik retakan tanah.
- **Kepadatan Pemukiman**: Sebaran bangunan warga dan infrastruktur di area lereng serta sempadan alur sungai.

---

#### 📋 4. Matriks Rekomendasi Aksi BPBD & Protokol Darurat

| Tahap Aksi | Langkah Strategis Mitigasi Spasial | Penanggung Jawab / Kontak |
| :--- | :--- | :--- |
| **Kesiapsiagaan** | Aktivasi Posko Siaga Bencana Desa & Jalur Evakuasi | Tim Kencana Desa ${districtName} |
| **Struktur Fisik** | Pembuatan drainase lereng & penanaman akar wangi (vetiver) | BPBD & Dinas PU Banjarnegara |
| **Kontak Darurat** | **Posko Mako BPBD Banjarnegara**: (0286) 592881 / WA: **0812-2630-111** | Call Center 119 ext.8 |`;
}
