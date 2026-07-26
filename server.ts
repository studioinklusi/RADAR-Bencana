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
    const { districtName, provinceName = 'Jawa Barat', stats, hazardType = 'flood' } = req.body;

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

    res.json({ success: true, report: parsed, provider: 'Qwen 2.5 (Alibaba Cloud)' });
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

    if (!qwenApiKey) {
      return res.json({
        success: true,
        text: 'API Key Qwen 2.5 belum terkonfigurasi. Silakan hubungi Tim Studio Inklusi untuk mendapatkan API Key resmi.'
      });
    }

    const {
      districtName = 'Banjarnegara (Keseluruhan)',
      provinceName = 'Jawa Tengah',
      hazardType = 'landslide',
      stats = null
    } = activeContext;

    const systemPrompt = `Anda adalah "Asisten Tanya AI RADAR Bencana", pakar SIG dan Analis Penanggulangan Bencana BPBD Kabupaten Banjarnegara.

ATURAN UTAMA & DOMAIN GUARDRAILS (SANGAT KETAT):
1. Anda HANYA BOLEH MENJAWAB pertanyaan yang berkaitan dengan:
   - Kebencanaan (Tanah Longsor, Banjir, Banjir Bandang, Gempa Bumi, Likuifaksi, dll).
   - Analisis Spasial, Peta SIG, Google Earth Engine (GEE), Pola Ruang RTRW & Kesesuaian Kegiatan Pemanfaatan Ruang (KKPR).
   - Statistik risiko bencana wilayah Kabupaten Banjarnegara & Indonesia.
   - Prosedur tanggap darurat, mitigasi risiko, evakuasi, dan nomor kontak darurat BPBD Banjarnegara (0286) 592881 / 0812-2630-111 / BNPB / SAR.
   - Fitur-fitur aplikasi RADAR Bencana ini.
2. Jika pengguna mengajukan pertanyaan DI LUAR DOMAIN (misalnya resep makanan, hiburan, pemrograman umum, politik luar negeri, gosip, dll):
   - Jawab dengan sopan dan ramah bahwa Anda adalah Asisten Spesialis Kebencanaan RADAR Bencana dan hanya dapat membantu menjawab topik seputar kebencanaan, analisis risiko spasial, dan tata ruang GIS.
   - Arahkan pengguna kembali untuk bertanya mengenai risiko bencana atau peta wilayah yang sedang aktif.
3. Jawablah menggunakan Bahasa Indonesia yang profesional, jelas, ramah, dan ringkas. Gunakan poin-poin jika menjelaskan langkah mitigasi.

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
    const replyText = data.choices?.[0]?.message?.content || 'Maaf, terjadi kendala teknis saat memproses jawaban AI.';

    res.json({ success: true, text: replyText });
  } catch (err: any) {
    console.error('Qwen Chat error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

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
