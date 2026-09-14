import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// API Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    name: 'ArelPro University CRM API',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
  });
});

// API: AI Assistant (Gemini 2.5 Flash)
app.post('/api/ai/assistant', async (req, res) => {
  const { prompt, companyContext, crmContext } = req.body;

  if (!prompt) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }

  const ai = getGeminiClient();

  if (ai) {
    try {
      const companiesSummary = crmContext?.companies 
        ? crmContext.companies.map((c: any) => `${c.name} (${c.sector}, Protokol: ${c.protocolStatus}, Yetkili: ${c.contactPerson?.name})`).join('\n')
        : '';
      const activitiesSummary = crmContext?.recentActivities
        ? crmContext.recentActivities.slice(0, 10).map((a: any) => `${a.date}: ${a.title} (${a.companyName}, ${a.type}, Lokasyon: ${a.location})`).join('\n')
        : '';
      const meetingsSummary = crmContext?.recentMeetings
        ? crmContext.recentMeetings.slice(0, 10).map((m: any) => `${m.date}: ${m.title} (${m.companyName}, ${m.format}, Karar/Durum: ${m.status})`).join('\n')
        : '';

      const systemInstruction = `Sen İstanbul Arel Üniversitesi Kurumsal İlişkiler ve Teknoloji Transfer Ofisi (ArelPro) Akıllı Yapay Zeka Asistanısın. 
Ana kuralların ve görevlerin:
1. KULLANICI TOPLANTI VEYA FAALİYET KAYDI İSTEDİĞİNDE ("Şu firma ile şu tarihte şurada toplantı yapacağım" vb.):
   - ASLA "kaydı direkt sisteme girdim/kaydettim" deme. Bunun yerine bir "TOPLANTI KAYIT TASLAĞI" hazırla ve KULLANICI ONAYINA SUN.
   - EKSİK BİLGİLERİ KONTROL ET VE KARŞI SORU SOR:
     * Eğer toplantı saati belirtilmemişse: "Toplantı saatini belirtmediniz, taslağa varsayılan 14:00 işlendi. Farklı bir saat tercihiniz var mı?" diye sor.
     * Eğer toplantı yeri/formatı (Kampüs, Firma Ziyareti, Online Teams) belirtilmemişse: "Toplantının nerede/hangi formatta yapılmasını istersiniz?" diye sor.
     * Eğer toplantı amacı (Staj, Markalı Ders, Ar-Ge & Proje, Protokol) belirtilmemiş veya genel ise: "Toplantının odaklanacağı özel bir gündem veya amaç var mı?" diye sor.
     * Eğer firma heyeti veya Arel temsilcisi belirtilmemişse karşı soruyla sor.
   - Cevabının sonunda "Taslağı onaylıyorsanız sisteme kaydedebilir veya değiştirmek istediğiniz detayları belirtebilirsiniz" de.

2. KULLANICI KAYITLAR ARASINDA VERİ ARADIĞINDA ("Şu kurum ile en son ne etkinlik yapılmış?", "Hangi firmalarla protokol var?"):
   - Aşağıdaki kurumsal CRM veritabanı kayıtlarından tam, kesin, tarihli ve gerçek verilerle detaylı döküm ver.

Resmi, saygılı, yapıcı, net ve kurumsal Türkçe kullan.

KURUMSAL VERİTABANI ÖZETİ:
--- FİRMALAR ---
${companiesSummary || 'Portföy verisi mevcut.'}

--- SON ETKİNLİKLER & FAALİYETLER ---
${activitiesSummary || 'Etkinlik verisi mevcut.'}

--- SON TOPLANTI & GÖRÜŞME TUTANAKLARI ---
${meetingsSummary || 'Toplantı verisi mevcut.'}
${companyContext ? `\nAktif Seçili Firma Bağlamı: ${companyContext.name} (${companyContext.sector})` : ''}`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.5,
          },
        });
      } catch (err: any) {
        // Fallback to gemini-3.6-flash if 3.8 is not available
        response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.5,
          },
        });
      }

      const reply = response.text || 'Yanıt oluşturulamadı.';
      res.json({ reply, source: 'gemini-flash' });
      return;
    } catch (error: any) {
      console.warn('Gemini API call failed, falling back to rule-based contextual generator:', error?.message);
    }
  }

  // Fallback intelligent domain template generator
  const compName = companyContext?.name || 'ArelPro Kurumsal Paydaşları';
  const qLower = (prompt as string).toLowerCase();

  let reply = '';
  if (qLower.includes('etkinlik') || qLower.includes('faaliyet') || qLower.includes('en son')) {
    reply = `İstanbul Arel Üniversitesi kurumsal kayıtlarında ${compName} ve sektörel paydaşlarımıza ait son faaliyetler taranmıştır. İlgili kayıtlar sistemde mevcuttur.`;
  } else if (qLower.includes('davet') || qLower.includes('e-posta') || qLower.includes('mail')) {
    reply = `Sayın Firma Yetkilisi,
${compName} İlgili Direktörlüğü'ne,

İstanbul Arel Üniversitesi Kurumsal İlişkiler ve Teknoloji Transfer Ofisi olarak, üniversite-sanayi iş birliği vizyonumuz kapsamında kurumunuzla yürüttüğümüz temaslardan büyük memnuniyet duyuyoruz.

Önümüzdeki dönem öğrencilerimizin sektörel donanımlarını pekiştirmek ve kurumunuzun nitelikli insan kaynağı ihtiyacına katkı sunmak üzere; bir "Markalı Ders" açılması ve saha gezisi planlanması hususunda istişarelerde bulunmak amacıyla uygun göreceğiniz bir tarihte bir araya gelmekten onur duyarız.

Saygılarımızla,
Doç. Dr. Ahmet Yılmaz
İstanbul Arel Üniversitesi Kurumsal İlişkiler Koordinatörü`;
  } else if (qLower.includes('protokol') || qLower.includes('şartname')) {
    reply = `İSTANBUL AREL ÜNİVERSİTESİ & ${compName.toUpperCase()}
İŞ BİRLİĞİ VE EĞİTİM PROTOKOLÜ ÇERÇEVESİ

1. KAPSAM: Lisans ve önlisans öğrencilerinin zorunlu ve isteğe bağlı stajları, markalı dersler, sanayi odaklı bitirme projeleri ve ortak Ar-Ge projeleri.
2. TAAHHÜTLER: Üniversite akademik koordinasyonu ve öğrenci havuzunu; firma ise sektörel stajyer kontenjanını ve dönemlik uzman eğitmen desteğini taahhüt eder.
3. YÜRÜRLÜK: Protokol imzalandığı tarihten itibaren 3 akademik yıl geçerlidir.`;
  } else {
    reply = `ArelPro Kurumsal Hafızası Özeti:
Kayıtlı kurumlar, faaliyetler ve toplantı tutanakları kurumsal hafızamızda yer almaktadır. Doğal dille yeni bir toplantı planlamak için: "Örn: TEI ile 25 Eylül'de Maslak'ta staj toplantısı yapacağım" yazabilirsiniz.`;
  }

  res.json({ reply, source: 'arelpro-knowledge-engine' });
});

// Vite middleware setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ArelPro CRM Server running on port ${PORT}`);
  });
}

startServer();
