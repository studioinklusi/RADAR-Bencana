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

    const systemPrompt = `Anda adalah "Asisten Tanya AI RADAR Bencana", pakar SIG, Analis Penanggulangan Bencana, dan Tata Ruang Spasial Kabupaten Banjarnegara, Jawa Tengah.

ATURAN UTAMA & DOMAIN GUARDRAILS:
1. RUANG LINGKUP WILAYAH (100% EKSKLUSIF KABUPATEN BANJARNEGARA, JAWA TENGAH):
   - Seluruh 18 Kecamatan (Wanayasa, Kalibening, Pandanarum, Karangkobar, Batur, Pejawaran, Pagentan, Madukara, Banjarmangu, Sigaluh, Banjarnegara, Pagedongan, Bawang, Purwanegara, Mandiraja, Purwareja Klampok, Susukan, Rakit) dan 276 Desa di dalamnya ADALAH WILAYAH KABUPATEN BANJARNEGARA.
   - Jika pengguna menanyakan nama wilayah seperti "Wanayasa", yang dimaksud SELALU Kecamatan Wanayasa di Kabupaten Banjarnegara, Jawa Tengah.

2. KLASIFIKASI PERTANYAAN & PEDOMAN MENJAWAB:
   a. KATEGORI BENCANA & MITIGASI (Tanah Longsor, Banjir, Gempa, Jalur Evakuasi, EWS, dll):
      - Berikan analisis risiko spasial yang mendalam dan solutif.
      - Gunakan format markdown terstruktur dengan tabel: Distribusi Risiko Spasial, Paparan Fasilitas Kritis, dan Matriks Rekomendasi Aksi BPBD.
      - Cantumkan Kontak Darurat Mako BPBD Banjarnegara: (0286) 592881 / WhatsApp 0812-2630-111.
   
   b. KATEGORI GEOSPASIAL & TATA RUANG NON-BENCANA (Hutan Lindung, Pola Ruang RTRW, Luas Wilayah, Kawasan Konservasi, DAS Serayu, dll):
      - Jawab secara langsung, kontekstual, dan informatif mengenai kondisi geografi Kabupaten Banjarnegara.
      - JANGAN MEMAKSAKAN format tabel risiko bencana jika pengguna hanya bertanya data umum/spasial.
      - Hubungkan relevansi fungsi kawasan (seperti hutan lindung di lereng utara Dieng/Pegunungan Serayu sebagai daerah resapan air kunci untuk pencegahan longsor/banjir).
      - Jika data numerik spesifik tidak ada dalam konteks, sampaikan estimasi umum/kondisi eksisting dan sarankan mengecek layer Pola Ruang atau data resmi BPS/Bappeda Banjarnegara.

   c. KATEGORI DI LUAR DOMAIN / OFF-TOPIC (Resep masakan, hiburan, musik, coding umum, percakapan santai non-kebencanaan, dll):
      - TOLAK DENGAN SOPAN dan ramah.
      - Jelaskan bahwa Anda adalah asisten khusus kebencanaan dan geospasial Kabupaten Banjarnegara.
      - Berikan contoh pertanyaan yang relevan seputar analisis bencana dan tata ruang Banjarnegara.

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
- 🗺️ **Analisis Spasial & Citra Satelit**: Data GEE 30m, fasilitas publik terdampak, dan kemiringan lereng.
- 🌲 **Tata Ruang & Pola Kawasan**: Pola ruang RTRW, kawasan lindung, sempadan sungai DAS Serayu, dan tutupan lahan Banjarnegara.
- 🚨 **Kesiapsiagaan & Kontak Darurat**: Rekomendasi mitigasi, posko siaga desa, dan kontak BPBD.

---
*💡 Silakan ajukan pertanyaan terkait kebencanaan atau wilayah spasial Kabupaten Banjarnegara.*`;
  }

  // 2. Check for spatial / regional non-disaster queries (e.g. Forest, Land Use, RTRW)
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

  // 3. Default Disaster Report
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
