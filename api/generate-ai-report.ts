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
    const { districtName = 'Kabupaten Banjarnegara', provinceName = 'Jawa Tengah', stats, hazardType = 'landslide' } = req.body || {};
    const qwenApiKey = process.env.QWEN_API_KEY;

    if (!qwenApiKey) {
      return res.status(200).json({
        success: true,
        report: {
          executiveSummary: `Wilayah ${districtName} memiliki potensi risiko bencana ${hazardType.toUpperCase()} yang perlu diwaspadai secara berkala, terutama pada musim penghujan di kawasan lereng curam dan bantaran sungai.`,
          keyVulnerabilities: [
            `Kemiringan lereng curam dan tingkat erosi tanah tinggi di wilayah ${districtName}`,
            `Kepadatan permukiman di zona rentan pergerakan tanah / genangan banjir`,
            `Keterbatasan sistem peringatan dini (EWS) di beberapa desa terpencil`
          ],
          actionableMitigations: [
            'Penguatan posko siaga bencana desa & evakuasi warga kelompok rentan',
            'Pembuatan struktur penahan lereng (retaining wall) dan vegetasi akar wangi (vetiver)',
            'Koordinasi intensif dengan Posko Mako BPBD Banjarnegara: (0286) 592881'
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

    return res.status(200).json({ success: true, report: parsed, provider: 'RADAR AI (Engine)' });
  } catch (err: any) {
    console.error('Vercel serverless generate-ai-report error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
