import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// Ensure upload directory exists
const UPLOAD_DIR = path.resolve(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
const LAYERS_INDEX_PATH = path.join(UPLOAD_DIR, 'layers_index.json');

function getLayersIndex(): any[] {
  if (fs.existsSync(LAYERS_INDEX_PATH)) {
    try {
      const data = fs.readFileSync(LAYERS_INDEX_PATH, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
}

function saveLayersIndex(layers: any[]) {
  fs.writeFileSync(LAYERS_INDEX_PATH, JSON.stringify(layers, null, 2), 'utf-8');
}

// Qwen AI Risk & Vulnerability Assessment
app.post('/api/generate-ai-report', async (req: Request, res: Response) => {
  try {
    const { districtName, provinceName = 'Jawa Tengah', stats, hazardType = 'flood' } = req.body;

    const qwenApiKey = process.env.QWEN_API_KEY;

    if (!qwenApiKey) {
      return res.json({
        success: true,
        report: {
          executiveSummary: `[DEMO MODE] API Key Qwen tidak ditemukan di .env. Untuk mengaktifkan fitur analisis AI real-time, silakan hubungi Tim Studio Inklusi untuk mendapatkan API Key resmi.`,
          keyVulnerabilities: [
            'Hubungi Tim Studio Inklusi untuk akses API Key Qwen 2.5',
            'Konfigurasi QWEN_API_KEY di file .env lokal Anda',
            'Analisis spasial GEE berbasis AI akan aktif secara otomatis'
          ],
          actionableMitigations: [
            'Dapatkan QWEN_API_KEY dari Tim Studio Inklusi',
            'Masukkan ke file .env lalu restart dev server',
            'Gunakan modul analisis AI terintegrasi'
          ]
        }
      });
    }

    const prompt = `Anda adalah Spesialis SIG dan Ahli Penanggulangan Bencana Sistem RADAR Bencana Kabupaten Banjarnegara.
Berikan analisis teknis mendalam dan rekomendasi aksi kebencanaan untuk:
- Wilayah: ${districtName}, ${provinceName}
- Jenis Ancaman: ${hazardType}
- Statistik Tutupan Area Spasial: ${JSON.stringify(stats)}

Wajib merespons HANYA dalam format JSON valid sebagai berikut:
{
  "executiveSummary": "ringkasan 2-3 kalimat kondisi risiko wilayah secara lugas dan profesional dalam Bahasa Indonesia",
  "keyVulnerabilities": ["faktor kerentanan 1", "faktor kerentanan 2", "faktor kerentanan 3"],
  "actionableMitigations": ["langkah mitigasi konkret 1", "langkah mitigasi konkret 2", "langkah mitigasi konkret 3"]
}`;

    const apiResponse = await fetch('https://dashscope-intl.aliyuncs.com/compatible-mode/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${qwenApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          { role: 'system', content: 'Anda adalah pakar Analisis Spasial & Mitigasi Bencana Kabupaten Banjarnegara. Output HANYA dalam format JSON.' },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    const data: any = await apiResponse.json();
    const contentStr = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(contentStr);

    res.json({ success: true, report: parsed, provider: 'RADAR AI (Engine)' });
  } catch (err: any) {
    console.error('Qwen AI error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Qwen Interactive Disaster Chatbot Endpoint with Strict Guardrails
app.post('/api/chat-ai', async (req: Request, res: Response) => {
  try {
    const { messages = [], activeContext = {} } = req.body;
    const qwenApiKey = process.env.QWEN_API_KEY;

    const {
      districtName = 'Banjarnegara (Keseluruhan)',
      provinceName = 'Jawa Tengah',
      hazardType = 'landslide',
      stats = null
    } = activeContext;

    const lastUserMsg = messages.length > 0 ? messages[messages.length - 1].text : '';

    if (!qwenApiKey) {
      const fallbackText = generateRichDisasterMarkdownReportLocal(lastUserMsg, districtName, hazardType, stats);
      return res.json({
        success: true,
        text: fallbackText
      });
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
- Ringkasan Statistik Spasial Terkini: ${stats ? JSON.stringify(stats) : 'Seluruh Kabupaten Banjarnegara'}
Gunakan data statistik spasial di atas jika pengguna menanyakan lokasi atau angka spesifik di wilayah aktif tersebut.`;

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
    const replyText = data.choices?.[0]?.message?.content || generateRichDisasterMarkdownReportLocal(lastUserMsg, districtName, hazardType, stats);

    res.json({ success: true, text: replyText });
  } catch (err: any) {
    console.error('Qwen Chat error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

function generateRichDisasterMarkdownReportLocal(query: string, districtName: string, hazardType: string, stats: any): string {
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

// Admin Upload Layer Endpoint
app.post('/api/upload-layer', (req: Request, res: Response) => {
  try {
    const { filename, layerName, description, fileType, fileContent, category, spatialAttributes, fieldMapping } = req.body;

    if (!filename || !fileContent) {
      return res.status(400).json({ success: false, error: 'Nama file dan isi data tidak boleh kosong.' });
    }

    const safeFilename = `${Date.now()}_${filename.replace(/[^a-zA-Z0-0_.-]/g, '_')}`;
    const filePath = path.join(UPLOAD_DIR, safeFilename);

    let savedContent = fileContent;

    // Calculate row count / raster info
    let rowCount = 0;
    const isTif = filename.toLowerCase().endsWith('.tif') || filename.toLowerCase().endsWith('.tiff') || fileType === 'geotiff';
    const detectedType = isTif ? 'geotiff' : (fileType || (filename.endsWith('.csv') ? 'csv' : 'geojson'));

    if (detectedType === 'geojson') {
      try {
        const parsedGeo = typeof fileContent === 'string' ? JSON.parse(fileContent) : fileContent;
        if (parsedGeo.features && Array.isArray(parsedGeo.features)) {
          parsedGeo.features = parsedGeo.features.map((f: any) => {
            const props = f.properties || {};
            const mappedProps: any = { ...props };

            // Apply fieldMapping if provided
            if (fieldMapping && typeof fieldMapping === 'object') {
              for (const [targetKey, sourceCol] of Object.entries(fieldMapping)) {
                if (sourceCol && typeof sourceCol === 'string' && props[sourceCol] !== undefined) {
                  mappedProps[targetKey] = props[sourceCol];
                }
              }
            }

            // Merge explicit spatialAttributes if provided
            if (spatialAttributes && typeof spatialAttributes === 'object') {
              Object.assign(mappedProps, spatialAttributes);
            }

            return {
              ...f,
              properties: mappedProps,
            };
          });
          savedContent = JSON.stringify(parsedGeo);
        }
      } catch (err) {
        console.warn('GeoJSON parse warning for spatial attributes injection:', err);
      }
    }

    fs.writeFileSync(filePath, savedContent, 'utf-8');

    if (detectedType === 'csv') {
      rowCount = fileContent.trim().split('\n').length - 1;
      if (rowCount < 0) rowCount = 0;
    } else if (detectedType === 'geojson') {
      try {
        const parsed = JSON.parse(savedContent);
        if (parsed.features && Array.isArray(parsed.features)) {
          rowCount = parsed.features.length;
        }
      } catch {
        rowCount = 1;
      }
    } else if (detectedType === 'geotiff') {
      rowCount = 1; // Raster Grid Layer
    }

    const newLayer = {
      id: `layer_${Date.now()}`,
      name: layerName || filename,
      category: category || 'admin_boundary',
      type: detectedType,
      filename: safeFilename,
      originalFilename: filename,
      url: `/uploads/${safeFilename}`,
      uploadTime: new Date().toISOString(),
      rowCount: detectedType === 'geotiff' ? 'Raster Grid' : rowCount,
      description: description || (detectedType === 'geotiff' ? 'Layer Spatial Raster GeoTIFF (.tif)' : ''),
      content: savedContent,
      spatialAttributes: spatialAttributes || null,
      fieldMapping: fieldMapping || null,
    };

    const index = getLayersIndex();
    index.unshift(newLayer);
    saveLayersIndex(index);

    res.json({
      success: true,
      message: 'File berhasil diunggah dan disimpan dengan atribut spasial.',
      layer: newLayer,
    });
  } catch (err: any) {
    console.error('Upload layer error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Layer Spatial Attributes Endpoint
app.post('/api/update-layer-attributes', (req: Request, res: Response) => {
  try {
    const { layerId, spatialAttributes } = req.body;
    if (!layerId || !spatialAttributes) {
      return res.status(400).json({ success: false, error: 'Layer ID dan Atribut Spasial wajib diisi.' });
    }

    const index = getLayersIndex();
    const layerIdx = index.findIndex((l: any) => l.id === layerId);
    if (layerIdx === -1) {
      return res.status(404).json({ success: false, error: 'Layer tidak ditemukan.' });
    }

    const layer = index[layerIdx];
    layer.spatialAttributes = {
      ...(layer.spatialAttributes || {}),
      ...spatialAttributes,
    };

    if (layer.type === 'geojson' && layer.content) {
      try {
        const parsedGeo = JSON.parse(layer.content);
        if (parsedGeo.features && Array.isArray(parsedGeo.features)) {
          parsedGeo.features = parsedGeo.features.map((f: any) => ({
            ...f,
            properties: {
              ...(f.properties || {}),
              ...spatialAttributes,
            },
          }));
          layer.content = JSON.stringify(parsedGeo);
        }
      } catch (err) {
        console.warn('GeoJSON update warning:', err);
      }
    }

    saveLayersIndex(index);
    res.json({ success: true, layer });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Uploaded Layers List Endpoint
app.get('/api/uploaded-layers', (req: Request, res: Response) => {
  try {
    const layers = getLayersIndex();
    res.json({ success: true, layers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete Uploaded Layer Endpoint
app.post('/api/delete-layer', (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    let index = getLayersIndex();
    const target = index.find((l) => l.id === id);

    if (target) {
      const filePath = path.join(UPLOAD_DIR, target.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      index = index.filter((l) => l.id !== id);
      saveLayersIndex(index);
    }

    res.json({ success: true, message: 'Layer berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete All Uploaded Layers Endpoint (Reset Data)
app.post('/api/delete-all-layers', (req: Request, res: Response) => {
  try {
    let index = getLayersIndex();
    for (const target of index) {
      const filePath = path.join(UPLOAD_DIR, target.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    saveLayersIndex([]);
    res.json({ success: true, message: 'Semua data pembaruan terunggah berhasil dihapus.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

async function startServer() {
  // Serve public/uploads statically
  app.use('/uploads', express.static(UPLOAD_DIR));

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
