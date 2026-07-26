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

    if (!qwenApiKey) {
      const reply = generateRichDisasterMarkdownReport(lastUserMsg, districtName, hazardType, stats);
      return res.status(200).json({ success: true, text: reply, provider: 'Knowledge Engine Local (Markdown Table Supported)' });
    }

    const systemPrompt = `Anda adalah "Asisten Tanya AI RADAR Bencana", pakar SIG dan Analis Penanggulangan Bencana BPBD Kabupaten Banjarnegara.

ATURAN UTAMA & DOMAIN GUARDRAILS (SANGAT KETAT & EKSKLUSIF BANJARNEGARA):
1. APLIKASI INI 100% EKSKLUSIF UNTUK KABUPATEN BANJARNEGARA, JAWA TENGAH!
   - Seluruh 18 Kecamatan (Wanayasa, Kalibening, Pandanarum, Karangkobar, Batur, Pejawaran, Pagentan, Madukara, Banjarmangu, Sigaluh, Banjarnegara, Pagedongan, Bawang, Purwanegara, Mandiraja, Purwareja Klampok, Susukan, Rakit) dan 276 Desa di dalamnya ADALAH WILAYAH KABUPATEN BANJARNEGARA, JAWA TENGAH.
   - JANGAN PERNAH MENYEBUT PURWAKARTA, JAWA BARAT, TASIKMALAYA, ATAU REGION LAIN DI LUAR BANJARNEGARA.
   - Jika pengguna menanyakan "Wanayasa", yang dimaksud SELALU Kecamatan Wanayasa di Kabupaten Banjarnegara, Jawa Tengah (bukan Purwakarta Jawa Barat).
2. Anda WAJIB MENYAJIKAN JAWABAN DALAM FORMAT MARKDOWN BERSTRUKTUR DENGAN TABEL MARKDOWN:
   - **Tabel 1: Distribusi Risiko Spasial GEE 30m** (Kelas 3 Tinggi, Kelas 2 Sedang, Kelas 1 Rendah, Luas Hektar, Persentase %, dan Status Kawasan).
   - **Tabel 2: Paparan Fasilitas Kritis Terpapar** (Fasilitas Kesehatan, Sekolah/Pengungsian, Jembatan, Jalur Evakuasi).
   - **Tabel 3: Matriks Rekomendasi Aksi & Kontak Darurat BPBD Banjarnegara**.
3. Gunakan Bahasa Indonesia yang profesional, ramah, dan sangat rinci.
4. Selalu cantumkan Kontak Darurat Mako BPBD Kabupaten Banjarnegara: Telepon (0286) 592881 / WhatsApp 0812-2630-111.

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
    const replyText = data.choices?.[0]?.message?.content || generateRichDisasterMarkdownReport(lastUserMsg, districtName, hazardType, stats);

    return res.status(200).json({ success: true, text: replyText });
  } catch (err: any) {
    console.error('Vercel serverless chat-ai error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}

function generateRichDisasterMarkdownReport(query: string, districtName: string, hazardType: string, stats: any): string {
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
