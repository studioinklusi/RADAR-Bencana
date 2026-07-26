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
      districtName = 'Banjarnegara (Keseluruhan)',
      provinceName = 'Jawa Tengah',
      hazardType = 'landslide',
      stats = null
    } = activeContext;

    if (!qwenApiKey) {
      // Fallback Response based on Context
      const lastUserMsg = messages.length > 0 ? messages[messages.length - 1].text.toLowerCase() : '';
      let reply = `Halo! Saya Asisten AI RADAR Bencana Kabupaten Banjarnegara. `;

      if (lastUserMsg.includes('kalibening') || districtName.toLowerCase().includes('kalibening')) {
        reply += `\n\n**Analisis Risiko Bencana Kecamatan Kalibening:**\n` +
          `• **Kerentanan Utama**: Tanah Longsor (Kategori TINGGI - Class 3) akibat kemiringan lereng curam dan curah hujan tinggi di Pegunungan Dieng utara.\n` +
          `• **Riwayat Kejadian**: Berdasarkan data BPBD Banjarnegara, Kalibening mencatat beberapa kejadian tanah longsor signifikan (misal: Desa Kasinoman, Sirukun, Bedana).\n` +
          `• **Rekomendasi BPBD**:\n` +
          `  1. Penataan drainase permukaan dan pencegahan resapan air pada retakan tanah.\n` +
          `  2. Penguatan posko siaga bencana desa & EWS (Early Warning System) mandiri.\n` +
          `  3. Pemantauan lereng berkala oleh Tim Kencana (Keluarga Tanggap Bencana).`;
      } else if (lastUserMsg.includes('mitigasi') || lastUserMsg.includes('rekomendasi')) {
        reply += `\n\n**Rekomendasi Mitigasi Risiko Bencana (${districtName}):**\n` +
          `1. **Kesiapsiagaan Warga**: Pembentukan Tim Siaga Bencana Desa dan pemetaan jalur evakuasi menuju titik kumpul aman.\n` +
          `2. **Struktur fisik**: Pembuatan dinding penahan tanah (tanggul/retaining wall) dan vegetasi pemantap lereng (akar wangi/vetiver).\n` +
          `3. **Kontak Darurat**: Hubungi BPBD Banjarnegara di **(0286) 592881 / 0812-2630-111** jika menemukan retakan tanah atau potensi pergerakan tanah.`;
      } else {
        reply += `\n\n**Konteks Wilayah Aktif (${districtName} - Ancaman: ${hazardType.toUpperCase()}):**\n` +
          `Wilayah ini memiliki potensi risiko yang perlu diwaspadai, khususnya pada musim penghujan. ` +
          `Untuk bantuan darurat atau informasi lebih lanjut, silakan hubungi Posko Mako BPBD Banjarnegara di (0286) 592881.`;
      }

      return res.status(200).json({ success: true, text: reply, provider: 'Knowledge Engine Local' });
    }

    const systemPrompt = `Anda adalah "Asisten Tanya AI RADAR Bencana", pakar SIG dan Analis Penanggulangan Bencana BPBD Kabupaten Banjarnegara.

ATURAN UTAMA & DOMAIN GUARDRAILS (SANGAT KETAT):
1. Anda HANYA BOLEH MENJAWAB pertanyaan yang berkaitan dengan kebencanaan, analisis spasial, tata ruang RTRW/KKPR, dan wilayah Kabupaten Banjarnegara.
2. Jawablah menggunakan Bahasa Indonesia yang profesional, jelas, ramah, dan ringkas. Gunakan poin-poin jika menjelaskan langkah mitigasi.

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
    const replyText = data.choices?.[0]?.message?.content || 'Maaf, terjadi kendala teknis saat memproses jawaban AI.';

    return res.status(200).json({ success: true, text: replyText });
  } catch (err: any) {
    console.error('Vercel serverless chat-ai error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
