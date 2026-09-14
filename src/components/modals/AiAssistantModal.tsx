import React, { useState, useRef, useEffect } from 'react';
import { Company, Activity, Meeting, MeetingFormat } from '../../types';
import { StorageService } from '../../services/storageService';
import { 
  X, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Building2,
  Bot,
  User,
  Calendar,
  MapPin,
  Clock,
  Search,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  HelpCircle,
  AlertCircle,
  Edit3,
  Briefcase
} from 'lucide-react';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  activities?: Activity[];
  meetings?: Meeting[];
  onAddMeeting?: (meeting: Meeting) => void;
  onAddActivity?: (activity: Activity) => void;
  onNavigateTab?: (tab: string) => void;
  selectedCompany?: Company;
  onApplyActivityData?: (data: Partial<Activity>) => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actionType?: 'MEETING_PROPOSED' | 'MEETING_APPROVED' | 'DATA_SEARCH_RESULT' | 'GENERAL_INFO';
  proposedMeeting?: Meeting;
  missingFields?: string[];
  clarificationQuestions?: string[];
  createdMeeting?: Meeting;
  matchedCompany?: Company;
  matchedActivities?: Activity[];
  matchedMeetings?: Meeting[];
  isApproved?: boolean;
  isCancelled?: boolean;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  companies,
  activities = [],
  meetings = [],
  onAddMeeting,
  onNavigateTab,
  selectedCompany,
}) => {
  // Default to general mode (empty string = "Tüm Kurumsal Portföy") so no company is forced!
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(selectedCompany?.id || '');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync if selectedCompany is explicitly passed from outside and changes
  useEffect(() => {
    if (selectedCompany?.id) {
      setSelectedCompanyId(selectedCompany.id);
    }
  }, [selectedCompany]);

  const activeComp = companies.find(c => c.id === selectedCompanyId);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `Merhaba! Ben İstanbul Arel Üniversitesi Kurumsal İlişkiler ve TTO Akıllı Asistanıyım.

Benimle iki temel amaç için çalışabilirsiniz:

1️⃣ **Toplantı & Kayıt Taslağı Oluşturma (Onaylı İşlem):**
Örn: *"TEI ile 25 Eylül'de Maslak'ta staj toplantısı yapacağım"* yazdığınızda, toplantıyı **doğrudan kaydetmem**. Detayları analiz eder, eksik bilgileri tespit edip size karşı soru sorar ve onayınıza sunarım. Onayınızla birlikte kurumsal sisteme ve takvime işlenir.

2️⃣ **Kayıtlar Arasında Veri Arama (Kurumsal Hafıza):**
Örn: *"VEM İlaç ile en son ne etkinlik yapılmış?"*, *"Hangi firmalarla aktif protokolümüz var?"* veya *"Siemens ile yapılan son görüşmeler neler?"* dediğinizde CRM veri tabanındaki tüm kayıtları tarayıp net ve tarihli olarak yanıtlarım.

Aşağıdaki hızlı komutlardan birini seçebilir veya isteğinizi doğrudan yazabilirsiniz.`,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  // Approve a proposed meeting
  const handleApproveMeeting = (messageId: string, meetingToApprove: Meeting) => {
    try {
      if (onAddMeeting) {
        onAddMeeting(meetingToApprove);
      } else {
        StorageService.addMeeting(meetingToApprove);
      }

      setMessages(prev => {
        const updated = prev.map(m => {
          if (m.id === messageId) {
            return {
              ...m,
              actionType: 'MEETING_APPROVED' as const,
              isApproved: true,
              createdMeeting: meetingToApprove,
            };
          }
          return m;
        });

        // Add assistant confirmation message
        return [
          ...updated,
          {
            id: `asst-confirmed-${Date.now()}`,
            role: 'assistant',
            content: `🎉 **Toplantı Onayınız Alındı ve Sisteme Kaydedildi!**\n\n"${meetingToApprove.title}" kaydı (${meetingToApprove.code}) başarıyla oluşturuldu, "Toplantı ve Görüşmeler" hafızasına ve kurumsal takvime işlendi.`,
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            actionType: 'GENERAL_INFO',
          },
        ];
      });
    } catch (err) {
      console.error('Failed to approve meeting:', err);
    }
  };

  // Cancel a proposed meeting draft
  const handleCancelMeeting = (messageId: string) => {
    setMessages(prev => {
      const updated = prev.map(m => {
        if (m.id === messageId) {
          return {
            ...m,
            isCancelled: true,
          };
        }
        return m;
      });

      return [
        ...updated,
        {
          id: `asst-cancelled-${Date.now()}`,
          role: 'assistant',
          content: `İşlem iptal edildi. Toplantı taslağı sisteme kaydedilmedi. Dilerseniz farklı bilgilerle yeni bir talep iletebilirsiniz.`,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          actionType: 'GENERAL_INFO',
        },
      ];
    });
  };

  // Natural Language Processing & Drafting Function
  const processQueryLocally = (query: string): {
    reply: string;
    actionType?: 'MEETING_PROPOSED' | 'DATA_SEARCH_RESULT' | 'GENERAL_INFO';
    proposedMeeting?: Meeting;
    missingFields?: string[];
    clarificationQuestions?: string[];
    matchedCompany?: Company;
    matchedActivities?: Activity[];
    matchedMeetings?: Meeting[];
  } => {
    const qLower = query.toLowerCase().trim();

    // Check if user is approving an existing pending draft
    const hasPendingProposal = messages.find(m => m.actionType === 'MEETING_PROPOSED' && !m.isApproved && !m.isCancelled);
    if (hasPendingProposal && (
      qLower === 'onayla' ||
      qLower === 'onaylıyorum' ||
      qLower === 'kaydet' ||
      qLower === 'tamamdır kaydet' ||
      qLower.includes('evet onayla') ||
      qLower.includes('uygundur') ||
      qLower.includes('kaydet lütfen')
    )) {
      if (hasPendingProposal.proposedMeeting) {
        handleApproveMeeting(hasPendingProposal.id, hasPendingProposal.proposedMeeting);
        return {
          reply: `Toplantı onaylandı ve sisteme işlendi.`,
          actionType: 'GENERAL_INFO',
        };
      }
    }

    // -------------------------------------------------------------
    // INTENT 1: PROPOSE MEETING DRAFT (Talimatı Direkt Uygulama -> Taslak Oluştur -> Karşı Soru Sor -> Onaya Sun)
    // -------------------------------------------------------------
    const isMeetingCreation = 
      qLower.includes('toplantı yap') ||
      qLower.includes('toplantı planla') ||
      qLower.includes('toplantı ekle') ||
      qLower.includes('toplantı oluştur') ||
      qLower.includes('toplantı ayarla') ||
      qLower.includes('toplantı kaydet') ||
      qLower.includes('görüşme yap') ||
      qLower.includes('görüşme planla') ||
      qLower.includes('görüşme ayarla') ||
      qLower.includes('görüşme ekle') ||
      qLower.includes('randevu oluştur') ||
      (qLower.includes(' ile ') && (qLower.includes('toplantı') || qLower.includes('görüşme')));

    if (isMeetingCreation) {
      const missingFields: string[] = [];
      const clarificationQuestions: string[] = [];

      // 1. Company Detection
      let matchedComp: Company | undefined = undefined;
      
      if (activeComp) {
        matchedComp = activeComp;
      } else {
        for (const comp of companies) {
          const nameLower = comp.name.toLowerCase();
          const shortLower = comp.shortName ? comp.shortName.toLowerCase() : '';
          
          if (
            (shortLower && qLower.includes(shortLower)) ||
            (comp.name.length > 3 && qLower.includes(nameLower.split(' ')[0].toLowerCase())) ||
            qLower.includes(nameLower)
          ) {
            matchedComp = comp;
            break;
          }
        }
      }

      let extractedCompanyName = matchedComp?.name || '';
      if (!matchedComp) {
        const ileMatch = query.match(/(?:yeni bir firma olan|yeni firma)?\s*([A-Za-zÇĞİÖŞÜçğıöşü0-9\.\s]+?)\s+(?:ile|firması ile|şirketi ile|kurumu ile)/i);
        if (ileMatch && ileMatch[1]) {
          extractedCompanyName = ileMatch[1].trim();
        } else {
          extractedCompanyName = 'Paydaş Kurum';
          missingFields.push('Firma / Kurum Adı');
          clarificationQuestions.push('Görüşülecek kurumun adı net anlaşılamadı. Hangi firma ile toplantı planlamak istiyorsunuz?');
        }
      }

      // 2. Date Detection & Checking
      const today = new Date();
      let extractedDate = '';
      let dateSpecified = false;
      
      if (qLower.includes('bugün')) {
        extractedDate = today.toISOString().slice(0, 10);
        dateSpecified = true;
      } else if (qLower.includes('yarın') || qLower.includes('ertesi gün')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        extractedDate = tomorrow.toISOString().slice(0, 10);
        dateSpecified = true;
      } else if (qLower.includes('haftaya') || qLower.includes('gelecek hafta')) {
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        extractedDate = nextWeek.toISOString().slice(0, 10);
        dateSpecified = true;
      } else {
        const monthMap: Record<string, string> = {
          'ocak': '01', 'şubat': '02', 'mart': '03', 'nisan': '04',
          'mayıs': '05', 'haziran': '06', 'temmuz': '07', 'ağustos': '08',
          'eylül': '09', 'ekim': '10', 'kasım': '11', 'aralık': '12'
        };
        const trDateMatch = qLower.match(/(\d{1,2})\s*(ocak|şubat|mart|nisan|mayıs|haziran|temmuz|ağustos|eylül|ekim|kasım|aralık)(?:\s*(\d{4}))?/i);
        if (trDateMatch) {
          const day = trDateMatch[1].padStart(2, '0');
          const month = monthMap[trDateMatch[2].toLowerCase()];
          const year = trDateMatch[3] || '2026';
          extractedDate = `${year}-${month}-${day}`;
          dateSpecified = true;
        } else {
          const isoMatch = qLower.match(/(\d{4})-(\d{2})-(\d{2})/);
          const dotMatch = qLower.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
          if (isoMatch) {
            extractedDate = isoMatch[0];
            dateSpecified = true;
          } else if (dotMatch) {
            extractedDate = `${dotMatch[3]}-${dotMatch[2].padStart(2, '0')}-${dotMatch[1].padStart(2, '0')}`;
            dateSpecified = true;
          } else {
            const future = new Date(today);
            future.setDate(future.getDate() + 3);
            extractedDate = future.toISOString().slice(0, 10);
            dateSpecified = false;
          }
        }
      }

      if (!dateSpecified) {
        missingFields.push('Toplantı Tarihi');
        clarificationQuestions.push(`Toplantı tarihi belirtilmedi. Taslağa varsayılan olarak "${extractedDate}" tarihi işlendi. Hangi gün gerçekleşmesini istersiniz?`);
      }

      // 3. Time Detection & Checking
      let extractedTime = '14:00 - 15:30';
      const timeMatch = query.match(/(?:saat|saatinde)\s*([0-9]{1,2}(?::[0-9]{2})?)/i) || query.match(/([0-9]{1,2}:[0-9]{2})/);
      let timeSpecified = false;
      if (timeMatch) {
        timeSpecified = true;
        let t = timeMatch[1];
        if (!t.includes(':')) t = `${t.padStart(2, '0')}:00`;
        extractedTime = `${t} - (60 dk)`;
      } else if (qLower.includes('sabah')) {
        timeSpecified = true;
        extractedTime = '10:00 - 11:30';
      } else if (qLower.includes('öğleden sonra') || qLower.includes('öğlen')) {
        timeSpecified = true;
        extractedTime = '14:00 - 15:30';
      } else {
        timeSpecified = false;
        missingFields.push('Toplantı Saati');
        clarificationQuestions.push('Toplantı saati belirtilmedi. Taslağa varsayılan "14:00 - 15:30" işlendi. Farklı bir saat belirlemek ister misiniz?');
      }

      // 4. Location & Format Detection & Checking
      let extractedFormat: MeetingFormat = 'Yüz Yüze';
      let extractedLocation = 'Arel Üniversitesi Kemal Gözükara Yerleşkesi Rektörlük Toplantı Salonu';
      let locationSpecified = false;

      if (qLower.includes('online') || qLower.includes('çevrim içi') || qLower.includes('zoom') || qLower.includes('teams')) {
        extractedFormat = 'Çevrimiçi / Online';
        extractedLocation = 'Microsoft Teams / Zoom Çevrim İçi Görüşme';
        locationSpecified = true;
      } else if (qLower.includes('maslak')) {
        extractedFormat = 'Yüz Yüze';
        extractedLocation = 'Maslak Genel Müdürlük Toplantı Salonu';
        locationSpecified = true;
      } else if (qLower.includes('kampüs') || qLower.includes('yerleşke') || qLower.includes('arel')) {
        extractedFormat = 'Yüz Yüze';
        extractedLocation = 'Arel Kemal Gözükara Yerleşkesi Rektörlük Toplantı Salonu';
        locationSpecified = true;
      } else {
        const locMatch = query.match(/(?:şurada|adreste|konumda)?\s*([A-Za-zÇĞİÖŞÜçğıöşü0-9]+(?:'te|'ta|'de|'da|te|ta|de|da))/i);
        if (locMatch && locMatch[1] && !['tarihte', 'haftada', 'günde', 'saatte'].includes(locMatch[1].toLowerCase())) {
          extractedLocation = `${locMatch[1]} Toplantı Salonu`;
          locationSpecified = true;
        } else {
          locationSpecified = false;
          missingFields.push('Toplantı Formatı & Yeri');
          clarificationQuestions.push('Toplantının nerede yapılacağı (Kampüste Yüz Yüze, Firma Ziyareti veya Teams üzerinden Online) belirtilmedi. Hangi formatı tercih edersiniz?');
        }
      }

      // 5. Purpose & Category Detection & Checking
      let extractedPurpose = 'Kurumsal İş Birliği';
      let extractedTitle = `${extractedCompanyName} Kurumsal İş Birliği Toplantısı`;
      let purposeSpecified = false;

      if (qLower.includes('staj') || qLower.includes('istihdam') || qLower.includes('kontenjan')) {
        extractedPurpose = 'Staj & İstihdam';
        extractedTitle = `${extractedCompanyName} Staj Protokolü & Kontenjan Toplantısı`;
        purposeSpecified = true;
      } else if (qLower.includes('markalı ders') || qLower.includes('müfredat') || qLower.includes('ders')) {
        extractedPurpose = 'Markalı Ders';
        extractedTitle = `${extractedCompanyName} Markalı Ders Müfredat Planlama Toplantısı`;
        purposeSpecified = true;
      } else if (qLower.includes('proje') || qLower.includes('tübitak') || qLower.includes('2244') || qLower.includes('ar-ge') || qLower.includes('arge')) {
        extractedPurpose = 'Proje';
        extractedTitle = `${extractedCompanyName} Ar-Ge & TÜBİTAK Proje Ortaklığı Görüşmesi`;
        purposeSpecified = true;
      } else if (qLower.includes('protokol') || qLower.includes('sözleşme') || qLower.includes('imza')) {
        extractedPurpose = 'Protokol & Sözleşme';
        extractedTitle = `${extractedCompanyName} Kurumsal İş Birliği ve Protokol Müzakeresi`;
        purposeSpecified = true;
      } else if (qLower.includes('teknik gezi') || qLower.includes('fabrika') || qLower.includes('saha ziyareti')) {
        extractedPurpose = 'Teknik Gezi';
        extractedTitle = `${extractedCompanyName} Saha İncelemesi & Teknik Gezi Koordinasyonu`;
        purposeSpecified = true;
      } else {
        purposeSpecified = false;
        clarificationQuestions.push('Görüşmenin ana gündem maddesi genel tanımlandı. Ele alınmasını istediğiniz özel bir amaç (Staj, Markalı Ders, Ar-Ge vb.) var mı?');
      }

      // Attendees check
      if (!matchedComp) {
        clarificationQuestions.push(`${extractedCompanyName} tarafından toplantıya katılacak yetkili ismi/unvanı biliniyor mu?`);
      }

      // 6. Build Proposal Meeting Record (NOT saved yet!)
      const newMeetingId = `mtg-ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newMeetingCode = `MTG-2026-${Math.floor(Math.random() * 800) + 100}`;
      
      const proposedMeeting: Meeting = {
        id: newMeetingId,
        code: newMeetingCode,
        title: extractedTitle,
        companyId: matchedComp ? matchedComp.id : `comp-${Date.now()}`,
        companyName: extractedCompanyName,
        date: extractedDate,
        timeRange: extractedTime,
        durationMinutes: 60,
        format: extractedFormat,
        location: extractedLocation,
        companyAttendees: matchedComp 
          ? `${matchedComp.contactPerson.name} (${matchedComp.contactPerson.title})`
          : `${extractedCompanyName} Yetkili Heyeti`,
        arelAttendees: matchedComp?.arelRepresentative 
          ? `${matchedComp.arelRepresentative.name} (${matchedComp.arelRepresentative.title})`
          : 'Doç. Dr. Ahmet Yılmaz (Arel TTO Koordinatörü)',
        moderator: 'Doç. Dr. Ahmet Yılmaz',
        agendaItems: `${extractedPurpose} kapsamındaki iş birliği hedefleri, takvim planlaması ve mutabakat maddelerinin istişare edilmesi.`,
        decisionsAndActions: 'Toplantı taslağı onaylandığında takvime işlenecektir.',
        actionItemsCount: 1,
        status: 'Planlandı',
        meetingType: extractedPurpose,
        department: 'Kurumsal İlişkiler & TTO',
        createdAt: new Date().toISOString().slice(0, 10),
      };

      // Formulate assistant message with clear proposal and clarification questions
      let reply = `📝 **Toplantı Kayıt Taslağı Hazırlandı (Onayınız Bekleniyor)**\n\nİlettiğiniz talimat doğrultusunda kayıt taslağı oluşturuldu. Talimatınız doğrudan sisteme girilmemiş, **onayınıza sunulmuştur.**\n\n`;

      if (clarificationQuestions.length > 0) {
        reply += `❓ **Eksik / Netleştirilecek Bilgiler ve Karşı Sorular:**\n`;
        clarificationQuestions.forEach((q, idx) => {
          reply += `${idx + 1}. ${q}\n`;
        });
        reply += `\n`;
      }

      reply += `📌 **Önerilen Taslak Bilgileri:**\n`;
      reply += `• **Kurum:** ${proposedMeeting.companyName}\n`;
      reply += `• **Tarih:** ${proposedMeeting.date} ${!dateSpecified ? '*(Öneri / Belirtilmedi)*' : ''}\n`;
      reply += `• **Saat:** ${proposedMeeting.timeRange} ${!timeSpecified ? '*(Öneri / Belirtilmedi)*' : ''}\n`;
      reply += `• **Yer / Format:** ${proposedMeeting.format} • ${proposedMeeting.location} ${!locationSpecified ? '*(Öneri / Belirtilmedi)*' : ''}\n`;
      reply += `• **Amaç / Kategori:** ${proposedMeeting.meetingType}\n`;
      reply += `• **Arel Heyeti:** ${proposedMeeting.arelAttendees}\n`;
      reply += `• **Firma Heyeti:** ${proposedMeeting.companyAttendees}\n\n`;
      reply += `👉 Aşağıdaki **"Onayla ve Sisteme Kaydet"** butonuna basarak kaydı takvime ve veri tabanına işleyebilir veya değiştirmek istediğiniz detayları bana yazabilirsiniz.`;

      return {
        reply,
        actionType: 'MEETING_PROPOSED',
        proposedMeeting,
        missingFields,
        clarificationQuestions,
        matchedCompany: matchedComp,
      };
    }

    // -------------------------------------------------------------
    // INTENT 2: SEARCH CRM DATA (Kayıtlar Arasında Veri Arama)
    // -------------------------------------------------------------
    const isSearchQuery = 
      qLower.includes('etkinlik') ||
      qLower.includes('faaliyet') ||
      qLower.includes('en son') ||
      qLower.includes('son toplantı') ||
      qLower.includes('yapılan toplantı') ||
      qLower.includes('ne zaman') ||
      qLower.includes('protokol var') ||
      qLower.includes('aktif protokol') ||
      qLower.includes('kayıtlar') ||
      qLower.includes('öğrenci sayısı') ||
      qLower.includes('kararlar') ||
      qLower.includes('tutanak') ||
      qLower.includes('hakkında bilgi');

    if (isSearchQuery) {
      let targetComp: Company | undefined = activeComp;
      
      if (!targetComp) {
        for (const comp of companies) {
          const nameLower = comp.name.toLowerCase();
          const shortLower = comp.shortName ? comp.shortName.toLowerCase() : '';
          
          if (
            (shortLower && qLower.includes(shortLower)) ||
            (comp.name.length > 3 && qLower.includes(nameLower.split(' ')[0].toLowerCase())) ||
            qLower.includes(nameLower)
          ) {
            targetComp = comp;
            break;
          }
        }
      }

      if (!targetComp && (qLower.includes('aktif protokol') || qLower.includes('hangi firma'))) {
        const activeProtocols = companies.filter(c => c.protocolStatus === 'Aktif');
        let reply = `📋 **Sistemde Aktif Protokolü Bulunan Kurumlar (${activeProtocols.length} Firma):**\n\n`;
        activeProtocols.forEach((c, idx) => {
          reply += `${idx + 1}. **${c.name}**\n   • Sektör: ${c.sector}\n   • Protokol No: ${c.protocolNumber || 'PRT-2025/11'}\n   • Arel Temsilcisi: ${c.arelRepresentative.name}\n   • Firma Yetkilisi: ${c.contactPerson.name} (${c.contactPerson.title})\n\n`;
        });
        reply += `💡 Dilediğiniz firma hakkında *"X ile en son ne etkinlik yapılmış?"* diyerek detaylı geçmişi sorgulayabilirsiniz.`;
        return { reply, actionType: 'DATA_SEARCH_RESULT' };
      }

      if (!targetComp && (qLower.includes('son toplantı') || qLower.includes('en son toplantılar'))) {
        const recentMtgs = [...meetings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
        let reply = `📅 **Kurumsal Hafızada Kayıtlı En Son Toplantılar:**\n\n`;
        recentMtgs.forEach((m, idx) => {
          reply += `${idx + 1}. **${m.title}** (${m.companyName})\n   • Tarih: ${m.date} | Format: ${m.format}\n   • Durum: ${m.status}\n   • Alınan Karar/Gündem: ${m.decisionsAndActions || m.agendaItems}\n\n`;
        });
        return { reply, actionType: 'DATA_SEARCH_RESULT', matchedMeetings: recentMtgs };
      }

      if (targetComp) {
        const compActivities = activities
          .filter(a => a.companyId === targetComp!.id || a.companyName.toLowerCase().includes(targetComp!.name.toLowerCase().split(' ')[0]))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const compMeetings = meetings
          .filter(m => m.companyId === targetComp!.id || m.companyName.toLowerCase().includes(targetComp!.name.toLowerCase().split(' ')[0]))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const latestAct = compActivities[0];
        const latestMtg = compMeetings[0];

        let reply = `🔍 **${targetComp.name}** için Kurumsal Kayıt Taraması Sonuçları:\n\n`;

        if (latestAct) {
          reply += `📌 **En Son Etkinlik & Faaliyet (${latestAct.date}):**\n`;
          reply += `• **Etkinlik Adı:** ${latestAct.title}\n`;
          reply += `• **Faaliyet Türü:** ${latestAct.type}\n`;
          reply += `• **Lokasyon:** ${latestAct.location}\n`;
          reply += `• **Katılımcı / Öğrenci Sayısı:** ${latestAct.attendedStudents || latestAct.targetStudents} Öğrenci\n`;
          reply += `• **Akademik Koordinatör:** ${latestAct.academicCoordinator}\n`;
          reply += `• **Durum:** ${latestAct.status}\n`;
          if (latestAct.summary) {
            reply += `• **Özet & Çıktı:** ${latestAct.summary}\n`;
          }
          reply += `\n`;
        } else {
          reply += `📌 **Etkinlik Kaydı:** Kuruma ait henüz tamamlanmış veya planlanmış saha faaliyeti bulunmamaktadır.\n\n`;
        }

        if (latestMtg) {
          reply += `📋 **En Son Toplantı & Görüşme Tutanağı (${latestMtg.date}):**\n`;
          reply += `• **Toplantı Başlığı:** ${latestMtg.title}\n`;
          reply += `• **Format & Yer:** ${latestMtg.format} • ${latestMtg.location}\n`;
          reply += `• **Toplantı Türü:** ${latestMtg.meetingType || 'Kurumsal Görüşme'}\n`;
          reply += `• **Alınan Kararlar:** ${latestMtg.decisionsAndActions || latestMtg.agendaItems}\n`;
          reply += `• **Durum:** ${latestMtg.status}\n\n`;
        } else {
          reply += `📋 **Toplantı Kaydı:** Kurumla kayıtlı geçmiş toplantı tutanağı bulunamadı.\n\n`;
        }

        reply += `🏛️ **Kurumsal Protokol ve İletişim Durumu:**\n`;
        reply += `• **Protokol Durumu:** ${targetComp.protocolStatus} (${targetComp.protocolNumber || 'Protokol Müzakere Aşamasında'})\n`;
        reply += `• **Arel Sorumlusu:** ${targetComp.arelRepresentative.name} (${targetComp.arelRepresentative.title})\n`;
        reply += `• **Firma Yetkilisi:** ${targetComp.contactPerson.name} (${targetComp.contactPerson.title} - 📞 ${targetComp.contactPerson.phone})\n`;

        return {
          reply,
          actionType: 'DATA_SEARCH_RESULT',
          matchedCompany: targetComp,
          matchedActivities: compActivities,
          matchedMeetings: compMeetings,
        };
      }
    }

    // -------------------------------------------------------------
    // INTENT 3: GENERAL DRAFTING OR PROMPT TEMPLATES
    // -------------------------------------------------------------
    const compName = activeComp?.name || 'Paydaş Kurum';
    const compContact = activeComp?.contactPerson.name || 'Firma Yetkilisi';

    if (qLower.includes('davet') || qLower.includes('e-posta') || qLower.includes('mail')) {
      return {
        reply: `Sayın ${compContact},
${compName} İlgili Direktörlüğü'ne,

İstanbul Arel Üniversitesi Kurumsal İlişkiler ve Teknoloji Transfer Ofisi (ArelPro) olarak, üniversite-sanayi iş birliği vizyonumuz kapsamında kurumunuzla yürüttüğümüz stratejik temaslardan büyük memnuniyet duyuyoruz.

2026-2027 Akademik Yılı kapsamında öğrencilerimizin sektörel donanımlarını artırmak ve kurumunuzun nitelikli insan kaynağı ihtiyacına katkı sağlamak amacıyla; ortak bir "Markalı Ders" açılması ve saha gezisi planlanması hususunda istişarelerde bulunmak üzere uygun göreceğiniz bir tarihte bir araya gelmekten onur duyarız.

Saygılarımızla,
Doç. Dr. Ahmet Yılmaz
İstanbul Arel Üniversitesi Kurumsal İlişkiler Koordinatörlüğü
arelpro@arel.edu.tr | +90 212 860 04 80`,
        actionType: 'GENERAL_INFO',
        matchedCompany: activeComp,
      };
    }

    // Default intelligent guidance
    return {
      reply: `İstanbul Arel Üniversitesi Kurumsal İlişkiler ve TTO Akıllı Asistanı:

Şu anda **${activeComp ? activeComp.name : 'Tüm Kurumsal Portföy & Veritabanı'}** genel modundasınız.

Bana doğrudan şu komutları verebilirsiniz:
• *"TEI ile 25 Eylül'de Maslak'ta staj toplantısı yapacağım"* ➡️ Detayları analiz eder, eksik kısımları sorup toplantı taslağını onayınıza sunarım.
• *"VEM İlaç ile en son ne etkinlik yapılmış?"* ➡️ Kurumsal hafızadan faaliyet ve tutanakları listelerim.
• *"Hangi firmalarla aktif protokolümüz var?"* ➡️ Tüm aktif anlaşmaları dökerim.`,
      actionType: 'GENERAL_INFO',
      matchedCompany: activeComp,
    };
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = { 
      id: `user-${Date.now()}`,
      role: 'user', 
      content: textToSend,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // First, try running local high-accuracy deterministic action engine
      const localResult = processQueryLocally(textToSend);

      // If it is meeting proposal (drafting & clarification)
      if (localResult.actionType === 'MEETING_PROPOSED') {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: `asst-draft-${Date.now()}`,
              role: 'assistant',
              content: localResult.reply,
              timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
              actionType: 'MEETING_PROPOSED',
              proposedMeeting: localResult.proposedMeeting,
              missingFields: localResult.missingFields,
              clarificationQuestions: localResult.clarificationQuestions,
              matchedCompany: localResult.matchedCompany,
            },
          ]);
          setLoading(false);
        }, 500);
        return;
      }

      // If it's a specific CRM data search, local engine returns the exact database records
      if (localResult.actionType === 'DATA_SEARCH_RESULT') {
        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: `asst-${Date.now()}`,
              role: 'assistant',
              content: localResult.reply,
              timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
              actionType: 'DATA_SEARCH_RESULT',
              matchedCompany: localResult.matchedCompany,
              matchedActivities: localResult.matchedActivities,
              matchedMeetings: localResult.matchedMeetings,
            },
          ]);
          setLoading(false);
        }, 600);
        return;
      }

      // For general questions or LLM consultation, query backend Gemini API
      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          companyContext: activeComp ? {
            name: activeComp.name,
            sector: activeComp.sector,
            protocolStatus: activeComp.protocolStatus,
            contactName: activeComp.contactPerson.name,
            contactTitle: activeComp.contactPerson.title,
          } : null,
          crmContext: {
            companies: companies.slice(0, 15),
            recentActivities: activities.slice(0, 10),
            recentMeetings: meetings.slice(0, 10),
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [
          ...prev, 
          { 
            id: `asst-${Date.now()}`,
            role: 'assistant', 
            content: data.reply || localResult.reply,
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            actionType: localResult.actionType,
            matchedCompany: localResult.matchedCompany,
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev, 
          { 
            id: `asst-${Date.now()}`,
            role: 'assistant', 
            content: localResult.reply,
            timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            actionType: localResult.actionType,
            matchedCompany: localResult.matchedCompany,
          }
        ]);
      }
    } catch (err) {
      const fallback = processQueryLocally(textToSend);
      setMessages(prev => [
        ...prev, 
        { 
          id: `asst-${Date.now()}`,
          role: 'assistant', 
          content: fallback.reply,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          actionType: fallback.actionType,
          proposedMeeting: fallback.proposedMeeting,
          matchedCompany: fallback.matchedCompany,
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div id="ai-assistant-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-[#CBD5E1] flex flex-col h-[90vh] max-h-[840px]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-[#003B75] via-[#00478F] to-[#00607A] text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/15">
              <Sparkles className="w-5 h-5 text-[#8ee7ff]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight">Arel Kurumsal Yapay Zeka Asistanı</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/25 text-amber-200 text-[10px] font-bold border border-amber-300/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Onaylı Kayıt Modu
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/25 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-blue-100">
                Talimatı Onaya Sunma • Eksik Bilgi Kontrolü • Kurumsal CRM Hafızası
              </p>
            </div>
          </div>

          <button
            id="btn-close-ai-assistant"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scope / Context Selector Toolbar: No firm forced by default! */}
        <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-[#00478F]" />
            <span className="font-semibold text-[#475569]">Bağlam / Firma Seçimi:</span>
            <select
              id="ai-company-context-select"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="h-8 px-2.5 rounded-lg bg-white border border-[#CBD5E1] text-[#0F172A] font-medium text-xs focus:outline-none focus:border-[#00478F] cursor-pointer"
            >
              <option value="">🌐 Tüm Kurumsal Portföy & Kayıtlar (Genel Mod)</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  🏢 {c.name} ({c.sector})
                </option>
              ))}
            </select>
          </div>

          {activeComp ? (
            <div className="flex items-center gap-2 text-[11px] text-[#00478F] bg-blue-50/80 px-2 py-1 rounded-md border border-blue-200">
              <span className="font-bold">{activeComp.shortName || activeComp.name}</span>
              <span className="text-slate-400">•</span>
              <span className="text-emerald-700 font-semibold">{activeComp.protocolStatus} Protokol</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
              Tüm kurum kayıtları taranabilir • Toplantı taslakları onayınıza sunulur
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-[#F1F5F9] border-b border-[#E2E8F0] flex items-center gap-2 overflow-x-auto scrollbar-thin">
          <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#00478F]" /> Örnekler:
          </span>

          <button
            id="chip-meeting-tei"
            type="button"
            onClick={() => handleSend("TEI ile 25 Eylül'de Maslak'ta staj toplantısı yapacağım")}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-[#CBD5E1] hover:border-[#00478F] text-[11px] font-medium text-[#00478F] shrink-0 cursor-pointer shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-3 h-3 text-amber-600" />
            <span>TEI ile 25 Eylül'de Maslak'ta staj toplantısı yapacağım</span>
          </button>

          <button
            id="chip-search-vem"
            type="button"
            onClick={() => handleSend("VEM İlaç ile en son ne etkinlik yapılmış?")}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-[#CBD5E1] hover:border-[#00478F] text-[11px] font-medium text-[#00478F] shrink-0 cursor-pointer shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <Search className="w-3 h-3 text-[#00607A]" />
            <span>VEM İlaç ile en son ne etkinlik yapılmış?</span>
          </button>

          <button
            id="chip-meeting-aselsan"
            type="button"
            onClick={() => handleSend("ASELSAN ile toplantı planla")}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-[#CBD5E1] hover:border-[#00478F] text-[11px] font-medium text-[#00478F] shrink-0 cursor-pointer shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <HelpCircle className="w-3 h-3 text-blue-600" />
            <span>ASELSAN ile toplantı planla (Eksik Bilgi Testi)</span>
          </button>

          <button
            id="chip-search-protocols"
            type="button"
            onClick={() => handleSend("Hangi firmalarla aktif protokolümüz var?")}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-[#CBD5E1] hover:border-[#00478F] text-[11px] font-medium text-[#00478F] shrink-0 cursor-pointer shadow-2xs flex items-center gap-1.5 transition-all"
          >
            <Search className="w-3 h-3 text-purple-600" />
            <span>Hangi firmalarla aktif protokolümüz var?</span>
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 text-xs bg-[#F8FAFC]">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[92%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${
                  isUser ? 'bg-[#00478F] text-white' : 'bg-[#00607A] text-white'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className={`p-4 rounded-2xl shadow-xs flex flex-col gap-2.5 ${
                  isUser
                    ? 'bg-[#00478F] text-white rounded-tr-xs'
                    : 'bg-white text-[#1E293B] border border-[#E2E8F0] rounded-tl-xs'
                }`}>
                  {/* Message Content */}
                  <div className="whitespace-pre-wrap leading-relaxed text-[12px]">
                    {m.content}
                  </div>

                  {/* VISUAL CARD: PROPOSED MEETING DRAFT (Awaiting Approval) */}
                  {m.actionType === 'MEETING_PROPOSED' && m.proposedMeeting && !m.isApproved && !m.isCancelled && (
                    <div className="mt-1.5 p-4 rounded-xl bg-gradient-to-br from-amber-50/70 via-white to-blue-50/50 border border-amber-300 text-[#0F172A] shadow-xs">
                      {/* Card Banner */}
                      <div className="flex items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-amber-200">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                          <span className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-600" />
                            Toplantı Taslağı — Onayınız Bekleniyor
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-mono font-bold text-[10px] border border-amber-200">
                          {m.proposedMeeting.code}
                        </span>
                      </div>

                      {/* Clarification Callout if Missing Info was detected */}
                      {m.clarificationQuestions && m.clarificationQuestions.length > 0 && (
                        <div className="mb-3 p-2.5 rounded-lg bg-amber-100/70 border border-amber-200 text-amber-950 text-[11px] flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <strong className="block font-semibold mb-1">Karşı Sorular & Netleştirilecek Detaylar:</strong>
                            <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-900">
                              {m.clarificationQuestions.map((q, idx) => (
                                <li key={idx}>{q}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Structured Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#334155] mb-3 bg-white/80 p-2.5 rounded-lg border border-slate-200/80">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#00478F] shrink-0" />
                          <span className="truncate"><strong>Kurum:</strong> {m.proposedMeeting.companyName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span><strong>Tarih:</strong> {m.proposedMeeting.date} ({m.proposedMeeting.timeRange})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate"><strong>Konum / Format:</strong> {m.proposedMeeting.format} • {m.proposedMeeting.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span><strong>Amaç:</strong> {m.proposedMeeting.meetingType}</span>
                        </div>
                      </div>

                      {/* Interactive Confirmation Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-amber-200">
                        <div className="flex items-center gap-2">
                          <button
                            id={`btn-approve-meeting-${m.id}`}
                            type="button"
                            onClick={() => handleApproveMeeting(m.id, m.proposedMeeting!)}
                            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                          >
                            <Check className="w-4 h-4" />
                            <span>Onayla ve Sisteme Kaydet</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setInput(`Şu bilgileri güncelle: `);
                              inputRef.current?.focus();
                            }}
                            className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#00478F] border border-[#CBD5E1] font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#00478F]" />
                            <span>Bilgileri Değiştir / Yanıtla</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCancelMeeting(m.id)}
                          className="px-2.5 py-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          İptal Et
                        </button>
                      </div>
                    </div>
                  )}

                  {/* VISUAL CARD: APPROVED MEETING (Saved to DB & Calendar) */}
                  {m.actionType === 'MEETING_APPROVED' && (m.createdMeeting || m.proposedMeeting) && (
                    <div className="mt-1 p-3.5 rounded-xl bg-gradient-to-br from-emerald-50 to-blue-50/50 border border-emerald-300 text-[#0F172A] shadow-2xs">
                      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-emerald-200">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-emerald-900 text-xs">
                            Toplantı Onaylandı ve Sisteme Kaydedildi
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono font-bold text-[10px]">
                          {(m.createdMeeting || m.proposedMeeting)?.code}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#334155] mb-2.5">
                        <div><strong>Kurum:</strong> {(m.createdMeeting || m.proposedMeeting)?.companyName}</div>
                        <div><strong>Tarih & Saat:</strong> {(m.createdMeeting || m.proposedMeeting)?.date} ({(m.createdMeeting || m.proposedMeeting)?.timeRange})</div>
                        <div><strong>Yer:</strong> {(m.createdMeeting || m.proposedMeeting)?.location}</div>
                        <div><strong>Kategori:</strong> {(m.createdMeeting || m.proposedMeeting)?.meetingType}</div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-emerald-200">
                        {onNavigateTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateTab('meetings')}
                            className="px-3 py-1 rounded-lg bg-[#00478F] hover:bg-[#00356B] text-white font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          >
                            <span>Toplantılar Ekranında Aç</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onNavigateTab && (
                          <button
                            type="button"
                            onClick={() => onNavigateTab('activities')}
                            className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-[#00478F] border border-[#CBD5E1] font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Takvimde Gör</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* VISUAL CARD: CANCELLED DRAFT */}
                  {m.isCancelled && (
                    <div className="mt-1 p-2.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-[11px] italic">
                      Bu toplantı taslağı kullanıcı tarafından iptal edilmiştir.
                    </div>
                  )}

                  {/* Visual Card: Data Search Result */}
                  {m.actionType === 'DATA_SEARCH_RESULT' && m.matchedCompany && (
                    <div className="mt-1 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[#0F172A] shadow-2xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-[#00478F]" />
                          <span className="font-bold text-xs text-[#0F172A]">{m.matchedCompany.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-[#00478F] font-semibold text-[10px]">
                          {m.matchedCompany.sector}
                        </span>
                      </div>
                      
                      {onNavigateTab && (
                        <div className="mt-2.5 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onNavigateTab('companies')}
                            className="text-[11px] font-bold text-[#00478F] hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Firma Kartını Görüntüle</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Copy button & Timestamp */}
                  {!isUser && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-[#94A3B8]">
                      <span>{m.timestamp}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(m.content, m.id)}
                        className="text-[#64748B] hover:text-[#00478F] font-bold inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Kopyalandı</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Metni Kopyala</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 self-start">
              <div className="w-8 h-8 rounded-full bg-[#00607A] text-white flex items-center justify-center shadow-2xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 bg-white rounded-2xl border border-[#E2E8F0] text-xs text-[#64748B] flex items-center gap-2.5 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#00478F] animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-[#00607A] animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]"></span>
                <span className="font-medium text-[#334155]">İşlem değerlendiriliyor & kurumsal veritabanı taranıyor...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3.5 bg-white border-t border-[#E2E8F0] flex items-center gap-2">
          <input
            ref={inputRef}
            id="ai-assistant-input"
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Örn: TEI ile 25 Eylül'de Maslak'ta staj toplantısı yapacağım VEYA VEM İlaç ile en son ne etkinlik yapılmış?"
            className="flex-1 h-11 px-4 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#00478F] focus:bg-white transition-all shadow-2xs"
          />
          <button
            id="btn-ai-send"
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="h-11 px-5 rounded-xl bg-[#00478F] hover:bg-[#00356B] text-white font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-40 transition-all shadow-xs shrink-0"
          >
            <span>Gönder</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
