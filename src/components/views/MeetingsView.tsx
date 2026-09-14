import React, { useState, useMemo } from 'react';
import { Company, Meeting, MeetingFormat, MeetingPurposeType } from '../../types';
import { ExcelService } from '../../services/excelService';
import { StorageService } from '../../services/storageService';
import { 
  Calendar, 
  Clock, 
  Search, 
  Filter, 
  Plus, 
  Download, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Video, 
  Phone, 
  FileText, 
  ChevronRight, 
  ListChecks, 
  CalendarDays,
  UserCheck,
  Send,
  Sparkles,
  Users,
  Target,
  FileCheck2,
  X,
  ExternalLink,
  Briefcase,
  Check,
  ArrowRight,
  ShieldCheck,
  Bookmark,
  CalendarClock,
  History
} from 'lucide-react';

interface MeetingsViewProps {
  companies: Company[];
  meetings: Meeting[];
  onAddMeeting: (m: Meeting) => void;
  onAddCompany?: (c: Company) => void;
  onOpenNewMeetingModal?: (companyId?: string) => void;
}

export const MeetingsView: React.FC<MeetingsViewProps> = ({
  companies,
  meetings,
  onAddMeeting,
  onAddCompany,
}) => {
  // --- Institution Selection: "Firma Kartı Bulunanlar" vs "Yeni Firma" ---
  const [institutionMode, setInstitutionMode] = useState<'existing' | 'new'>('existing');
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id || '');
  
  // New Company Fields (if institutionMode === 'new')
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanySector, setNewCompanySector] = useState('');
  const [newCompanyContactName, setNewCompanyContactName] = useState('');
  const [newCompanyContactTitle, setNewCompanyContactTitle] = useState('');
  const [newCompanyPhone, setNewCompanyPhone] = useState('');
  const [newCompanyEmail, setNewCompanyEmail] = useState('');
  const [newCompanyWebsite, setNewCompanyWebsite] = useState('');
  const [autoSaveCompanyCard, setAutoSaveCompanyCard] = useState(true);

  // --- Meeting Core Fields ---
  // Kim Tarafından (Organized by / Arel delegation)
  const [arelOrganizer, setArelOrganizer] = useState('Doç. Dr. Ahmet Yılmaz (Arel TTO & Kurumsal İlişkiler Direktörü)');
  const [arelDepartment, setArelDepartment] = useState('Kurumsal İlişkiler & TTO');
  const [arelAttendees, setArelAttendees] = useState('Doç. Dr. Ahmet Yılmaz, Yavuz Selim Önal (Kurumsal İlişkiler Yöneticisi)');

  // Kiminle (Company delegation / person)
  const [companyAttendees, setCompanyAttendees] = useState('');

  // Nerede (Location & Format)
  const [meetingFormat, setMeetingFormat] = useState<MeetingFormat>('Yüz Yüze');
  const [locationType, setLocationType] = useState<'kampus' | 'firma' | 'online' | 'hibrit'>('kampus');
  const [locationDetails, setLocationDetails] = useState('Arel Kemal Gözükara Yerleşkesi, Senato Toplantı Salonu');

  // Hangi Amaçla (Purpose, Agenda, Title)
  const [meetingPurposeType, setMeetingPurposeType] = useState<MeetingPurposeType>('Protokol & Sözleşme');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [agendaNotes, setAgendaNotes] = useState('');
  const [meetingTargetOutcome, setMeetingTargetOutcome] = useState('');

  // Zamanlama & Durum
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeRange, setTimeRange] = useState('14:00 - 15:30');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [meetingStatus, setMeetingStatus] = useState<'Planlandı' | 'Tamamlandı'>('Planlandı');
  const [decisionsAndActions, setDecisionsAndActions] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Form feedback state
  const [formFeedback, setFormFeedback] = useState<string | null>(null);

  // --- Bottom Section: Lists & Filters ---
  const [activeListTab, setActiveListTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [formatFilter, setFormatFilter] = useState('ALL');
  const [purposeFilter, setPurposeFilter] = useState('ALL');

  // Inspection modal
  const [inspectedMeeting, setInspectedMeeting] = useState<Meeting | null>(null);
  const [completingMeeting, setCompletingMeeting] = useState<Meeting | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');

  // Selected company object from existing companies
  const currentSelectedCompany = useMemo(() => {
    return companies.find(c => c.id === selectedCompanyId) || companies[0];
  }, [companies, selectedCompanyId]);

  // When company is selected, populate contact person suggestion if empty
  const handleSelectExistingCompany = (compId: string) => {
    setSelectedCompanyId(compId);
    const comp = companies.find(c => c.id === compId);
    if (comp && !companyAttendees) {
      setCompanyAttendees(`${comp.contactPerson.name} (${comp.contactPerson.title})`);
    }
    if (comp && comp.arelRepresentative) {
      setArelOrganizer(`${comp.arelRepresentative.name} (${comp.arelRepresentative.title})`);
    }
  };

  // Helper for location suggestion when format changes
  const handleFormatChange = (fmt: MeetingFormat, locPreset?: string) => {
    setMeetingFormat(fmt);
    if (fmt === 'Yüz Yüze') {
      if (locPreset === 'firma') {
        setLocationType('firma');
        const compName = institutionMode === 'existing' ? currentSelectedCompany?.name : newCompanyName;
        setLocationDetails(`${compName || 'Firma'} Genel Müdürlük / Tesisleri`);
      } else {
        setLocationType('kampus');
        setLocationDetails('Arel Kemal Gözükara Yerleşkesi, Rektörlük Toplantı Salonu');
      }
    } else if (fmt === 'Çevrimiçi / Online') {
      setLocationType('online');
      setLocationDetails('Microsoft Teams / Zoom Çevrim İçi Görüşme Linki');
    } else {
      setLocationType('hibrit');
      setLocationDetails('Arel Kampüs & Teams Hibrit Katılım');
    }
  };

  // Handle Form Submit
  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    let targetCompanyId = '';
    let targetCompanyName = '';
    let targetCompanySector = '';

    if (institutionMode === 'existing') {
      if (!currentSelectedCompany) {
        alert('Lütfen firma kartı bulunan kurumlardan birini seçiniz.');
        return;
      }
      targetCompanyId = currentSelectedCompany.id;
      targetCompanyName = currentSelectedCompany.name;
      targetCompanySector = currentSelectedCompany.sector;
    } else {
      if (!newCompanyName.trim()) {
        alert('Lütfen yeni firma / kurum adını giriniz.');
        return;
      }
      targetCompanyName = newCompanyName.trim();
      targetCompanySector = newCompanySector.trim() || 'Genel Sanayi / Hizmet';
      targetCompanyId = `comp-${Date.now()}`;

      // Automatically register company card if requested
      if (autoSaveCompanyCard && onAddCompany) {
        const createdCompany: Company = {
          id: targetCompanyId,
          code: `AREL-2026-${Math.floor(Math.random() * 800) + 100}`,
          name: targetCompanyName,
          shortName: targetCompanyName.slice(0, 3).toUpperCase(),
          sector: targetCompanySector,
          address: 'İstanbul',
          website: newCompanyWebsite.trim() || 'https://www.firma.com',
          scale: 'KOBİ / İşletme',
          protocolStatus: 'Müzakere',
          contactPerson: {
            name: newCompanyContactName.trim() || 'Firma Yetkilisi',
            title: newCompanyContactTitle.trim() || 'Kurumsal Temsilci',
            phone: newCompanyPhone.trim() || '+90 (212) 000 00 00',
            email: newCompanyEmail.trim() || 'info@kurum.com',
          },
          arelRepresentative: {
            name: arelOrganizer.split('(')[0]?.trim() || 'Doç. Dr. Ahmet Yılmaz',
            title: 'Kurumsal İlişkiler & TTO',
            department: arelDepartment,
            coordinationUnit: 'Arel TTO',
          },
          stats: {
            totalActivities: 0,
            attendedStudents: 0,
            totalMeetings: 1,
            activeInterns: 0,
            score: 50,
          },
          notes: 'Toplantı kaydı üzerinden sisteme yeni firma kartı olarak eklendi.',
          createdAt: new Date().toISOString().slice(0, 10),
        };
        onAddCompany(createdCompany);
      }
    }

    if (!meetingTitle.trim()) {
      alert('Lütfen toplantı başlığını veya ana konusunu giriniz.');
      return;
    }

    const newMeetingRecord: Meeting = {
      id: `mtg-${Date.now()}`,
      code: `MTG-2026-${Math.floor(Math.random() * 800) + 100}`,
      title: meetingTitle.trim(),
      companyId: targetCompanyId,
      companyName: targetCompanyName,
      date: meetingDate,
      timeRange,
      durationMinutes: Number(durationMinutes) || 60,
      format: meetingFormat,
      location: locationDetails.trim() || 'Arel Üniversitesi Yerleşkesi',
      companyAttendees: companyAttendees.trim() || (institutionMode === 'existing' ? `${currentSelectedCompany?.contactPerson.name} (${currentSelectedCompany?.contactPerson.title})` : `${newCompanyContactName || 'Firma Yetkilisi'}`),
      arelAttendees: arelAttendees.trim() || arelOrganizer,
      moderator: arelOrganizer.split('(')[0]?.trim() || 'Toplantı Yöneticisi',
      agendaItems: agendaNotes.trim() || `${meetingPurposeType} kapsamındaki iş birliği ve yol haritası görüşmesi`,
      decisionsAndActions: meetingStatus === 'Tamamlandı' 
        ? (decisionsAndActions.trim() || 'Toplantı gündemi görüşüldü ve takip maddeleri belirlendi.')
        : 'Toplantı planlandı; gündem maddeleri ve heyet katılımı teyit edildi.',
      actionItemsCount: meetingStatus === 'Tamamlandı' ? 2 : 1,
      status: meetingStatus,
      notes: additionalNotes.trim() || (meetingTargetOutcome ? `Hedeflenen Çıktı: ${meetingTargetOutcome}` : undefined),
      meetingType: meetingPurposeType,
      department: arelDepartment,
      purpose: meetingPurposeType,
      isNewCompany: institutionMode === 'new',
      companySector: targetCompanySector,
      companyPhone: institutionMode === 'new' ? newCompanyPhone : currentSelectedCompany?.contactPerson.phone,
      companyEmail: institutionMode === 'new' ? newCompanyEmail : currentSelectedCompany?.contactPerson.email,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onAddMeeting(newMeetingRecord);

    // Provide visual feedback
    setFormFeedback(`"${targetCompanyName}" ile "${meetingTitle}" toplantısı başarıyla kaydedildi.`);
    setTimeout(() => setFormFeedback(null), 6000);

    // Reset meeting specific fields
    setMeetingTitle('');
    setAgendaNotes('');
    setMeetingTargetOutcome('');
    setDecisionsAndActions('');
    setAdditionalNotes('');
    if (institutionMode === 'new') {
      setNewCompanyName('');
      setNewCompanySector('');
      setNewCompanyContactName('');
      setNewCompanyContactTitle('');
      setNewCompanyPhone('');
      setNewCompanyEmail('');
      setNewCompanyWebsite('');
    }
  };

  // Date helper for badge
  const getRelativeDateInfo = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);
    const diffDays = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { label: 'Bugün', isUpcoming: true, isPast: false, badgeClass: 'bg-amber-500 text-white' };
    if (diffDays === 1) return { label: 'Yarın', isUpcoming: true, isPast: false, badgeClass: 'bg-emerald-600 text-white' };
    if (diffDays > 1 && diffDays <= 7) return { label: `${diffDays} gün sonra`, isUpcoming: true, isPast: false, badgeClass: 'bg-blue-600 text-white' };
    if (diffDays > 7 && diffDays <= 30) return { label: `${Math.round(diffDays / 7)} hafta sonra`, isUpcoming: true, isPast: false, badgeClass: 'bg-indigo-600 text-white' };
    if (diffDays > 30) return { label: `${Math.round(diffDays / 30)} ay sonra`, isUpcoming: true, isPast: false, badgeClass: 'bg-slate-600 text-white' };
    if (diffDays === -1) return { label: 'Dün', isUpcoming: false, isPast: true, badgeClass: 'bg-slate-200 text-slate-700' };
    return { label: `${Math.abs(diffDays)} gün önce`, isUpcoming: false, isPast: true, badgeClass: 'bg-slate-100 text-slate-600' };
  };

  // Filtered lists
  const upcomingMeetings = useMemo(() => {
    return meetings.filter(m => m.status === 'Planlandı' || m.status === 'İmza Aşamasında');
  }, [meetings]);

  const pastMeetings = useMemo(() => {
    return meetings.filter(m => m.status === 'Tamamlandı' || m.status === 'Ertelendi');
  }, [meetings]);

  const displayedMeetings = useMemo(() => {
    let list = meetings;
    if (activeListTab === 'upcoming') {
      list = upcomingMeetings;
    } else if (activeListTab === 'past') {
      list = pastMeetings;
    }

    return list.filter(m => {
      const matchesSearch = 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.arelAttendees.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.companyAttendees.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.agendaItems.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.decisionsAndActions.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFormat = formatFilter === 'ALL' || m.format === formatFilter;
      const matchesPurpose = purposeFilter === 'ALL' || m.meetingType === purposeFilter;

      return matchesSearch && matchesFormat && matchesPurpose;
    });
  }, [meetings, activeListTab, upcomingMeetings, pastMeetings, searchTerm, formatFilter, purposeFilter]);

  // Complete planned meeting handler
  const handleMarkAsCompleted = (meeting: Meeting) => {
    setCompletingMeeting(meeting);
    setCompletionNotes(meeting.decisionsAndActions !== 'Toplantı planlandı; gündem maddeleri ve heyet katılımı teyit edildi.' ? meeting.decisionsAndActions : '');
  };

  const saveMeetingCompletion = () => {
    if (!completingMeeting) return;
    const updated = StorageService.updateMeeting(completingMeeting.id, {
      status: 'Tamamlandı',
      decisionsAndActions: completionNotes.trim() || 'Toplantı başarıyla icra edildi, kararlar tutanağa bağlandı.',
    });
    // Trigger update in parent or storage
    window.location.reload();
  };

  return (
    <div className="flex flex-col w-full gap-8 pb-16">
      {/* Top Header & Overview */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[#00677d] uppercase tracking-wider font-bold">
              Kurumsal İlişkiler & Sektörel Ortaklıklar
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2E8F0]"></span>
            <span className="text-xs text-[#64748B] font-semibold">Toplantı & Görüşme Masası</span>
          </div>
          <h1 className="text-2xl font-bold text-[#00478F] tracking-tight">
            Toplantı & Görüşme Yönetimi
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Yeni görüşme planlama, tutanak girişi, kim tarafından kiminle nerede ve hangi amaçla yapıldığının kurumsal hafızaya işlenmesi
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-[#E2E8F0] shadow-2xs text-xs font-semibold text-[#1E293B]">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span>{upcomingMeetings.length} Yaklaşan</span>
            <span className="text-[#94A3B8]">|</span>
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>{pastMeetings.length} Tutanak / Geçmiş</span>
          </div>

          <button
            type="button"
            onClick={() => ExcelService.exportMeetingsToExcel(meetings)}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#1E293B] text-xs font-bold shadow-2xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Tutanakları Excel'e Aktar</span>
          </button>
        </div>
      </div>

      {/* Success Feedback Banner */}
      {formFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 shadow-xs animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold">{formFeedback}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setFormFeedback(null)} 
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-1 rounded-md hover:bg-emerald-100"
          >
            Kapat
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* PRIMARY WORKBENCH: YENİ TOPLANTI & GÖRÜŞME EKLEME FORMU */}
      {/* ======================================================== */}
      <section className="bg-white rounded-2xl border border-[#00478F]/20 shadow-md overflow-hidden">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-[#00478F] to-[#00677d] px-6 py-4 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center border border-white/20">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Yeni Toplantı & Görüşme Kaydı</h2>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold text-white">
                  Ana Giriş Masası
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                Kim tarafından, kiminle, nerede ve hangi amaçla toplantı yapılacağını belirleyin.
              </p>
            </div>
          </div>

          {/* Toplantı Durum Tipi: Planlanan vs Tamamlanan */}
          <div className="flex items-center bg-black/20 p-1 rounded-xl border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setMeetingStatus('Planlandı')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                meetingStatus === 'Planlandı'
                  ? 'bg-white text-[#00478F] shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>İleri Tarihli Planla</span>
            </button>
            <button
              type="button"
              onClick={() => setMeetingStatus('Tamamlandı')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                meetingStatus === 'Tamamlandı'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Gerçekleşmiş Tutanak Gir</span>
            </button>
          </div>
        </div>

        {/* Main Form Body */}
        <form onSubmit={handleCreateMeeting} className="p-6 flex flex-col gap-6 text-xs">
          
          {/* ======================================================== */}
          {/* 1. TOPLANTI YAPILACAK KURUM (FİRMA KARTI BULUNANLAR / YENİ FİRMA) */}
          {/* ======================================================== */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00478F]" />
                <span className="font-bold text-[#1E293B] text-xs uppercase tracking-wide">
                  1. Toplantı Yapılacak Kurum / Paydaş Seçimi *
                </span>
              </div>

              {/* Two Options Toggle */}
              <div className="flex items-center bg-white p-1 rounded-lg border border-[#CBD5E1] shadow-2xs">
                <button
                  type="button"
                  onClick={() => setInstitutionMode('existing')}
                  className={`px-3.5 py-1.5 rounded-md font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5 ${
                    institutionMode === 'existing'
                      ? 'bg-[#00478F] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Firma Kartı Bulunanlar ({companies.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setInstitutionMode('new')}
                  className={`px-3.5 py-1.5 rounded-md font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5 ${
                    institutionMode === 'new'
                      ? 'bg-[#00677d] text-white shadow-xs'
                      : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni Firma Girişi</span>
                </button>
              </div>
            </div>

            {/* Content for Option 1: Firma Kartı Bulunanlar */}
            {institutionMode === 'existing' ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                <div className="lg:col-span-6 flex flex-col gap-1.5">
                  <label className="font-bold text-[#1E293B]">
                    Kayıtlı Kurumsal Firma / Paydaş *
                  </label>
                  <select
                    value={selectedCompanyId}
                    onChange={e => handleSelectExistingCompany(e.target.value)}
                    className="h-10 px-3.5 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs font-semibold focus:outline-none focus:border-[#00478F] shadow-2xs cursor-pointer"
                  >
                    {companies.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.sector} ({c.protocolStatus})
                      </option>
                    ))}
                  </select>
                  <span className="text-[11px] text-[#64748B]">
                    Seçilen firmanın iletişim ve heyet bilgileri alt alanlara otomatik yansıtılır.
                  </span>
                </div>

                {/* Selected Company Preview Card */}
                {currentSelectedCompany && (
                  <div className="lg:col-span-6 p-3 rounded-lg bg-white border border-[#E2E8F0] shadow-2xs flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#00478F] text-xs truncate">
                        {currentSelectedCompany.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        currentSelectedCompany.protocolStatus === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {currentSelectedCompany.protocolStatus} Protokol
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-[#64748B]">
                      <div>
                        <span className="block font-semibold text-[#1E293B]">Sektör:</span>
                        <span className="truncate block">{currentSelectedCompany.sector}</span>
                      </div>
                      <div>
                        <span className="block font-semibold text-[#1E293B]">Firma Yetkilisi:</span>
                        <span className="truncate block">{currentSelectedCompany.contactPerson.name} ({currentSelectedCompany.contactPerson.title})</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Content for Option 2: Yeni Firma */
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-[#1E293B] block mb-1">
                      Yeni Firma / Kurum Tam Adı *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCompanyName}
                      onChange={e => setNewCompanyName(e.target.value)}
                      placeholder="Örn: Baykar Savunma A.Ş."
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs font-semibold focus:outline-none focus:border-[#00677d]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#1E293B] block mb-1">
                      Faaliyet Sektörü *
                    </label>
                    <input
                      type="text"
                      required
                      value={newCompanySector}
                      onChange={e => setNewCompanySector(e.target.value)}
                      placeholder="Örn: Savunma Sanayii / Bilişim / Sağlık"
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs font-semibold focus:outline-none focus:border-[#00677d]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#1E293B] block mb-1">
                      Web Sitesi / Kurumsal Portalı
                    </label>
                    <input
                      type="text"
                      value={newCompanyWebsite}
                      onChange={e => setNewCompanyWebsite(e.target.value)}
                      placeholder="https://www.firma.com.tr"
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs focus:outline-none focus:border-[#00677d]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-[#1E293B] block mb-1">
                      Firma Yetkili Adı Soyadı & Unvanı *
                    </label>
                    <input
                      type="text"
                      value={newCompanyContactName}
                      onChange={e => {
                        setNewCompanyContactName(e.target.value);
                        if (!companyAttendees) setCompanyAttendees(e.target.value);
                      }}
                      placeholder="Örn: Selim Erdem (İK Direktörü)"
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs font-semibold focus:outline-none focus:border-[#00677d]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#1E293B] block mb-1">
                      Yetkili Telefon Numarası
                    </label>
                    <input
                      type="text"
                      value={newCompanyPhone}
                      onChange={e => setNewCompanyPhone(e.target.value)}
                      placeholder="+90 (212) 000 00 00"
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs focus:outline-none focus:border-[#00677d]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#1E293B] block mb-1">
                      Yetkili E-Posta Adresi
                    </label>
                    <input
                      type="email"
                      value={newCompanyEmail}
                      onChange={e => setNewCompanyEmail(e.target.value)}
                      placeholder="yetkili@firma.com"
                      className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs focus:outline-none focus:border-[#00677d]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="autoSaveCompany"
                    checked={autoSaveCompanyCard}
                    onChange={e => setAutoSaveCompanyCard(e.target.checked)}
                    className="w-4 h-4 rounded text-[#00677d] cursor-pointer"
                  />
                  <label htmlFor="autoSaveCompany" className="text-xs text-[#1E293B] font-semibold cursor-pointer">
                    Bu yeni firmayı kurumsal portföye ve firma rehberine otomatik olarak ekle
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* ======================================================== */}
          {/* 2. KİM TARAFINDAN & KİMİNLE (TARAFLAR VE HEYETLER) */}
          {/* ======================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* KİM TARAFINDAN (Arel Heyeti) */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
                <UserCheck className="w-4 h-4 text-[#00478F]" />
                <span className="font-bold text-[#1E293B] text-xs uppercase tracking-wide">
                  2. Kim Tarafından Yapılacak? (Arel Heyeti) *
                </span>
              </div>

              <div>
                <label className="font-bold text-[#1E293B] block mb-1">
                  Toplantıyı Düzenleyen / Sorumlu Arel Yetkilisi *
                </label>
                <input
                  type="text"
                  required
                  value={arelOrganizer}
                  onChange={e => setArelOrganizer(e.target.value)}
                  placeholder="Örn: Doç. Dr. Ahmet Yılmaz (Arel TTO & Kurumsal Direktör)"
                  className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs font-semibold focus:outline-none focus:border-[#00478F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-[#1E293B] block mb-1">
                    İlgili Koordinasyon Birimi / Fakülte
                  </label>
                  <select
                    value={arelDepartment}
                    onChange={e => setArelDepartment(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs font-medium focus:outline-none focus:border-[#00478F]"
                  >
                    <option value="Kurumsal İlişkiler & TTO">Kurumsal İlişkiler & TTO</option>
                    <option value="Kariyer Merkezi & Mezun İlişkileri">Kariyer Merkezi</option>
                    <option value="Mühendislik-Mimarlık Fakültesi">Mühendislik-Mimarlık Fakültesi</option>
                    <option value="Eczacılık Fakültesi">Eczacılık Fakültesi</option>
                    <option value="İktisadi ve İdari Bilimler Fakültesi">İİBF Fakültesi</option>
                    <option value="Sağlık Bilimleri Fakültesi">Sağlık Bilimleri Fakültesi</option>
                    <option value="Rektörlük Makamı">Rektörlük Makamı</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-[#1E293B] block mb-1">
                    Katılımcı Arel Heyeti / Üyeler
                  </label>
                  <input
                    type="text"
                    value={arelAttendees}
                    onChange={e => setArelAttendees(e.target.value)}
                    placeholder="Örn: Yavuz Selim Önal, Prof. Dr. Mehmet Kaya"
                    className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs focus:outline-none focus:border-[#00478F]"
                  />
                </div>
              </div>
            </div>

            {/* KİMİNLE (Firma Heyeti) */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-3">
              <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
                <Users className="w-4 h-4 text-[#00677d]" />
                <span className="font-bold text-[#1E293B] text-xs uppercase tracking-wide">
                  3. Kiminle Yapılacak? (Firma / Kurum Heyeti) *
                </span>
              </div>

              <div>
                <label className="font-bold text-[#1E293B] block mb-1">
                  Muhatap Firma Yetkilisi & Unvanı *
                </label>
                <input
                  type="text"
                  required
                  value={companyAttendees}
                  onChange={e => setCompanyAttendees(e.target.value)}
                  placeholder={
                    institutionMode === 'existing' && currentSelectedCompany
                      ? `${currentSelectedCompany.contactPerson.name} (${currentSelectedCompany.contactPerson.title})`
                      : 'Örn: Banu Erdem (İK ve İşe Alım Direktörü)'
                  }
                  className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs font-semibold focus:outline-none focus:border-[#00677d]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="font-bold text-[#1E293B] block mb-1">
                    Diğer Firma Katılımcıları (Varsa)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: Zeynep Aksoy (Ar-Ge Lideri)"
                    className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs focus:outline-none focus:border-[#00677d]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1E293B] block mb-1">
                    Heyet Büyüklüğü / Format
                  </label>
                  <input
                    type="text"
                    defaultValue="2-3 Kişilik Firma Heyeti"
                    className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs focus:outline-none focus:border-[#00677d]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 3. NEREDE & ZAMAN PLANLAMASI */}
          {/* ======================================================== */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
              <MapPin className="w-4 h-4 text-[#00478F]" />
              <span className="font-bold text-[#1E293B] text-xs uppercase tracking-wide">
                4. Nerede ve Ne Zaman Yapılacak? (Lokasyon & Takvim) *
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 items-end">
              {/* Format Presets */}
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label className="font-bold text-[#1E293B]">Toplantı Formatı & Yeri *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleFormatChange('Yüz Yüze', 'kampus')}
                    className={`h-9 px-2 rounded-lg font-bold text-[11px] border cursor-pointer flex items-center justify-center gap-1 transition-all ${
                      meetingFormat === 'Yüz Yüze' && locationType === 'kampus'
                        ? 'bg-[#00478F] text-white border-[#00478F] shadow-xs'
                        : 'bg-white text-[#1E293B] border-[#CBD5E1] hover:bg-slate-50'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Kampüste</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFormatChange('Yüz Yüze', 'firma')}
                    className={`h-9 px-2 rounded-lg font-bold text-[11px] border cursor-pointer flex items-center justify-center gap-1 transition-all ${
                      meetingFormat === 'Yüz Yüze' && locationType === 'firma'
                        ? 'bg-[#00478F] text-white border-[#00478F] shadow-xs'
                        : 'bg-white text-[#1E293B] border-[#CBD5E1] hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Firma Ziyareti</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFormatChange('Çevrimiçi / Online')}
                    className={`h-9 px-2 rounded-lg font-bold text-[11px] border cursor-pointer flex items-center justify-center gap-1 transition-all ${
                      meetingFormat === 'Çevrimiçi / Online'
                        ? 'bg-[#00677d] text-white border-[#00677d] shadow-xs'
                        : 'bg-white text-[#1E293B] border-[#CBD5E1] hover:bg-slate-50'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Çevrim İçi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFormatChange('Hibrit')}
                    className={`h-9 px-2 rounded-lg font-bold text-[11px] border cursor-pointer flex items-center justify-center gap-1 transition-all ${
                      meetingFormat === 'Hibrit'
                        ? 'bg-[#00677d] text-white border-[#00677d] shadow-xs'
                        : 'bg-white text-[#1E293B] border-[#CBD5E1] hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Hibrit / Karma</span>
                  </button>
                </div>
              </div>

              {/* Specific Location Details */}
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label className="font-bold text-[#1E293B]">Açık Adres / Salon / Online Link *</label>
                <input
                  type="text"
                  required
                  value={locationDetails}
                  onChange={e => setLocationDetails(e.target.value)}
                  placeholder="Örn: Kemal Gözükara Yerleşkesi Rektörlük Senato Odası"
                  className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs font-semibold focus:outline-none focus:border-[#00478F]"
                />
              </div>

              {/* Date, Time, Duration */}
              <div className="md:col-span-4 grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-[#1E293B] block mb-1">Tarih *</label>
                  <input
                    type="date"
                    required
                    value={meetingDate}
                    onChange={e => setMeetingDate(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs font-semibold focus:outline-none focus:border-[#00478F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1E293B] block mb-1">Saat *</label>
                  <input
                    type="text"
                    value={timeRange}
                    onChange={e => setTimeRange(e.target.value)}
                    placeholder="14:00 - 15:30"
                    className="w-full h-9 px-2 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs font-semibold focus:outline-none focus:border-[#00478F]"
                  />
                </div>

                <div>
                  <label className="font-bold text-[#1E293B] block mb-1">Süre (Dk)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    min={15}
                    step={15}
                    className="w-full h-9 px-2 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs font-semibold focus:outline-none focus:border-[#00478F]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* 4. HANGİ AMAÇLA YAPILACAK (AMAÇ, BAŞLIK, GÜNDEM, ÇIKTILAR) */}
          {/* ======================================================== */}
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
              <Target className="w-4 h-4 text-[#00677d]" />
              <span className="font-bold text-[#1E293B] text-xs uppercase tracking-wide">
                5. Hangi Amaçla Yapılacak? (Amaç, Gündem & Beklenen Çıktılar) *
              </span>
            </div>

            {/* Purpose Category Selection Pills */}
            <div>
              <label className="font-bold text-[#1E293B] block mb-1.5">
                Toplantı Amacı & Sektörel Kategori *
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {[
                  'Protokol & Sözleşme',
                  'Markalı Ders',
                  'Proje',
                  'Ar-Ge / TÜBİTAK',
                  'Staj & İstihdam',
                  'Teknik Gezi & Saha',
                  'Zirve & Sponsorluk',
                  'Genel Kurumsal'
                ].map(purpose => {
                  const isSelected = meetingPurposeType === purpose;
                  return (
                    <button
                      key={purpose}
                      type="button"
                      onClick={() => setMeetingPurposeType(purpose as MeetingPurposeType)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#00478F] text-white border-[#00478F] shadow-2xs'
                          : 'bg-white text-[#64748B] border-[#CBD5E1] hover:bg-slate-50'
                      }`}
                    >
                      {purpose}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meeting Title */}
            <div>
              <label className="font-bold text-[#1E293B] block mb-1">
                Toplantı Başlığı & Ana Konusu *
              </label>
              <input
                type="text"
                required
                value={meetingTitle}
                onChange={e => setMeetingTitle(e.target.value)}
                placeholder="Örn: 2026-2027 Güz Dönemi Markalı Ders ve 25 Öğrenci Staj Kotası Müzakeresi"
                className="w-full h-9 px-3 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs font-semibold focus:outline-none focus:border-[#00478F]"
              />
            </div>

            {/* Agenda Items / Purpose details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#1E293B] block mb-1">
                  Görüşülecek Gündem Maddeleri / Hedeflenen Çıktılar
                </label>
                <textarea
                  rows={3}
                  value={agendaNotes}
                  onChange={e => setAgendaNotes(e.target.value)}
                  placeholder="1. Protokol yenileme takvimi&#10;2. Bahar dönemi 15 kişilik uzun dönemli stajyer kotası&#10;3. Ortak Ar-Ge proje başvuru konsorsiyumu"
                  className="w-full p-2.5 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs focus:outline-none focus:border-[#00478F] leading-relaxed"
                />
              </div>

              <div>
                <label className="font-bold text-[#1E293B] block mb-1">
                  {meetingStatus === 'Tamamlandı' 
                    ? 'Alınan Kararlar & Tutanak Maddeleri *'
                    : 'Kurumsal Not & Beklenen Aksiyon Planı'}
                </label>
                <textarea
                  rows={3}
                  value={meetingStatus === 'Tamamlandı' ? decisionsAndActions : additionalNotes}
                  onChange={e => {
                    if (meetingStatus === 'Tamamlandı') {
                      setDecisionsAndActions(e.target.value);
                    } else {
                      setAdditionalNotes(e.target.value);
                    }
                  }}
                  placeholder={
                    meetingStatus === 'Tamamlandı'
                      ? 'Toplantıda alınan kararlar: 14 haftalık müfredat onaylandı, 26 Kasım gezi tarihi netleşti...'
                      : 'Görüşme öncesi hazırlık notları, Rektörlük onayı ve yetkili iletişim notları...'
                  }
                  className="w-full p-2.5 rounded-lg bg-white border border-[#CBD5E1] text-[#1E293B] text-xs focus:outline-none focus:border-[#00478F] leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Form Action Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#E2E8F0]">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Sparkles className="w-4 h-4 text-[#00677d]" />
              <span>Kayıt tamamlandığında takvim ve kurumsal firma istatistikleri otomatik güncellenecektir.</span>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => {
                  setMeetingTitle('');
                  setAgendaNotes('');
                  setAdditionalNotes('');
                  setDecisionsAndActions('');
                }}
                className="px-4 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#64748B] font-bold text-xs cursor-pointer transition-colors"
              >
                Temizle
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-6 h-10 rounded-xl bg-gradient-to-r from-[#00478F] to-[#00677d] hover:opacity-95 text-white font-bold text-xs shadow-sm cursor-pointer transition-all"
              >
                <Check className="w-4 h-4" />
                <span>
                  {meetingStatus === 'Planlandı'
                    ? 'Toplantıyı Planla & Takvime Ekle'
                    : 'Görüşme Tutanağını Sisteme Kaydet'}
                </span>
              </button>
            </div>
          </div>

        </form>
      </section>

      {/* ======================================================== */}
      {/* SECONDARY SECTION: YAKIN ZAMANDA VE GEÇMİŞ TOPLANTILAR (DAHA DETAYLI) */}
      {/* ======================================================== */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#00478F]" />
              <h2 className="text-lg font-bold text-[#1E293B]">
                Toplantı & Görüşme Tutanakları Hafızası
              </h2>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              Yakın zamanda gerçekleşecek randevular ve geçmiş tutanakların detaylı dökümü
            </p>
          </div>

          {/* Sub-Tab Navigation */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
            <button
              type="button"
              onClick={() => setActiveListTab('upcoming')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                activeListTab === 'upcoming'
                  ? 'bg-white text-[#00478F] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <CalendarClock className="w-3.5 h-3.5 text-blue-600" />
              <span>Yakın Zamanda Gerçekleşecek ({upcomingMeetings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveListTab('past')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                activeListTab === 'past'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Geçmiş Toplantılar ({pastMeetings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveListTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                activeListTab === 'all'
                  ? 'bg-white text-[#1E293B] shadow-xs'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <span>Tümü ({meetings.length})</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Firma, Arel temsilcisi, heyet yetkilisi, yer veya karar ara..."
              className="w-full h-9 pl-9 pr-4 rounded-lg bg-[#f8fafc] border border-[#E2E8F0] text-xs text-[#1E293B] placeholder:text-[#64748B] focus:outline-none focus:border-[#00478F]"
            />
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
            <select
              value={formatFilter}
              onChange={e => setFormatFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-[#f8fafc] border border-[#E2E8F0] text-xs text-[#1E293B] font-semibold cursor-pointer"
            >
              <option value="ALL">Format: Tümü</option>
              <option value="Yüz Yüze">Yüz Yüze</option>
              <option value="Çevrimiçi / Online">Çevrimiçi / Online</option>
              <option value="Hibrit">Hibrit</option>
            </select>

            <select
              value={purposeFilter}
              onChange={e => setPurposeFilter(e.target.value)}
              className="h-9 px-3 rounded-lg bg-[#f8fafc] border border-[#E2E8F0] text-xs text-[#1E293B] font-semibold cursor-pointer"
            >
              <option value="ALL">Amaç: Tümü</option>
              <option value="Protokol & Sözleşme">Protokol & Sözleşme</option>
              <option value="Markalı Ders">Markalı Ders</option>
              <option value="Proje">Proje</option>
              <option value="Ar-Ge / TÜBİTAK">Ar-Ge / TÜBİTAK</option>
              <option value="Staj & İstihdam">Staj & İstihdam</option>
            </select>
          </div>
        </div>

        {/* Detailed Meetings Cards List */}
        <div className="flex flex-col gap-4">
          {displayedMeetings.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-xl border border-dashed border-[#E2E8F0] flex flex-col items-center gap-2">
              <CalendarDays className="w-8 h-8 text-[#94A3B8]" />
              <span className="text-sm font-bold text-[#1E293B]">Kriterlere Uygun Toplantı Bulunamadı</span>
              <p className="text-xs text-[#64748B]">
                Arama terimlerinizi veya filtrelerinizi değiştirerek tekrar deneyebilirsiniz.
              </p>
            </div>
          ) : (
            displayedMeetings.map((mtg, idx) => {
              const dateInfo = getRelativeDateInfo(mtg.date);
              const isPlanned = mtg.status === 'Planlandı';

              return (
                <div
                  key={mtg.id ? `${mtg.id}-${idx}` : `mtg-${idx}`}
                  className="p-5 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs hover:border-[#00478F]/30 hover:shadow-md transition-all flex flex-col gap-4"
                >
                  {/* Top Bar: Badges, Title & Meta */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-md bg-[#00478F]/10 text-[#00478F] text-[11px] font-bold">
                        {mtg.meetingType || 'Kurumsal Toplantı'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-[#1E293B] text-[11px] font-bold">
                        {mtg.format}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        mtg.status === 'Tamamlandı'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {mtg.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${dateInfo.badgeClass}`}>
                        {dateInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#64748B] font-semibold">
                      <Clock className="w-3.5 h-3.5 text-[#00677d]" />
                      <span>{mtg.date}</span>
                      <span>•</span>
                      <span>{mtg.timeRange}</span>
                      <span>({mtg.durationMinutes || 60} dk)</span>
                    </div>
                  </div>

                  {/* Title and Organization */}
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-[#1E293B] hover:text-[#00478F] transition-colors">
                      {mtg.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-[#00478F] font-bold mt-1">
                      <Building2 className="w-4 h-4 text-[#00478F]" />
                      <span>{mtg.companyName}</span>
                      <span className="text-[#94A3B8] font-normal">• Ref: {mtg.code || mtg.id}</span>
                    </div>
                  </div>

                  {/* Detailed 4-Pillar Grid (Kim Tarafından, Kiminle, Nerede, Hangi Amaçla) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* 1. Kim Tarafından */}
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#00478F]">
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Kim Tarafından</span>
                      </div>
                      <span className="text-xs font-bold text-[#1E293B] line-clamp-1">
                        {mtg.arelAttendees || mtg.moderator}
                      </span>
                      <span className="text-[11px] text-[#64748B] line-clamp-1">
                        Birim: {mtg.department || 'Arel TTO & Kurumsal'}
                      </span>
                    </div>

                    {/* 2. Kiminle */}
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#00677d]">
                        <Users className="w-3.5 h-3.5" />
                        <span>Kiminle</span>
                      </div>
                      <span className="text-xs font-bold text-[#1E293B] line-clamp-1">
                        {mtg.companyAttendees}
                      </span>
                      <span className="text-[11px] text-[#64748B] line-clamp-1">
                        Kurum: {mtg.companyName}
                      </span>
                    </div>

                    {/* 3. Nerede */}
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#64748B]">
                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                        <span>Nerede</span>
                      </div>
                      <span className="text-xs font-bold text-[#1E293B] line-clamp-1">
                        {mtg.location}
                      </span>
                      <span className="text-[11px] text-[#64748B]">
                        Format: {mtg.format}
                      </span>
                    </div>

                    {/* 4. Hangi Amaçla */}
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-amber-700">
                        <Target className="w-3.5 h-3.5" />
                        <span>Hangi Amaçla</span>
                      </div>
                      <span className="text-xs font-bold text-[#1E293B] line-clamp-1">
                        {mtg.meetingType || 'Ortaklık & Görüşme'}
                      </span>
                      <span className="text-[11px] text-[#64748B] line-clamp-1">
                        {mtg.agendaItems || 'İş birliği müzakeresi'}
                      </span>
                    </div>
                  </div>

                  {/* Highlight for Decisions / Minutes if completed */}
                  {mtg.status === 'Tamamlandı' && mtg.decisionsAndActions && (
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Alınan Kararlar & Takip Çıktıları:</span>
                      </div>
                      <p className="font-semibold text-emerald-900 leading-relaxed pl-5">
                        {mtg.decisionsAndActions}
                      </p>
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
                      <Bookmark className="w-3.5 h-3.5 text-[#00677d]" />
                      <span>Kayıt Tarihi: {mtg.createdAt || mtg.date}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Mark Completed Button if Planned */}
                      {isPlanned && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsCompleted(mtg)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Tamamlandı Yap / Tutanak Ekle</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setInspectedMeeting(mtg)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#00478F] hover:bg-[#00356B] text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Tam Detay & Resmi Tutanak İncele</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* DETAYLI TOPLANTI & TUTANAK İNCELEME MODALI */}
      {/* ======================================================== */}
      {inspectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-[#CBD5E1] flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#00478F] to-[#00677d] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5" />
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Resmi Toplantı & Görüşme Tutanağı</h3>
                  <span className="text-[11px] text-white/80">Ref No: {inspectedMeeting.code || inspectedMeeting.id}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectedMeeting(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex flex-col gap-5 text-xs text-[#1E293B]">
              <div className="flex flex-col gap-2 pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-[#00478F] text-white text-xs font-bold">
                      {inspectedMeeting.meetingType || 'Toplantı'}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-100 text-[#1E293B] text-xs font-bold">
                      {inspectedMeeting.format}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {inspectedMeeting.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[#64748B] font-semibold">
                    <Calendar className="w-4 h-4 text-[#00677d]" />
                    <span>{inspectedMeeting.date}</span>
                    <span>•</span>
                    <span>{inspectedMeeting.timeRange}</span>
                  </div>
                </div>

                <h2 className="text-base font-bold text-[#1E293B] mt-1">
                  {inspectedMeeting.title}
                </h2>

                <div className="flex items-center gap-2 text-[#00478F] font-bold">
                  <Building2 className="w-4 h-4" />
                  <span>{inspectedMeeting.companyName}</span>
                </div>
              </div>

              {/* 4-Pillars Detailed View */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-[#00478F] uppercase flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>KİM TARAFINDAN (Arel Heyeti)</span>
                  </span>
                  <span className="text-xs font-bold text-[#1E293B]">{inspectedMeeting.arelAttendees}</span>
                  <span className="text-[11px] text-[#64748B]">Birim: {inspectedMeeting.department}</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-[#00677d] uppercase flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>KİMİNLE (Firma Heyeti)</span>
                  </span>
                  <span className="text-xs font-bold text-[#1E293B]">{inspectedMeeting.companyAttendees}</span>
                  <span className="text-[11px] text-[#64748B]">Kurum: {inspectedMeeting.companyName}</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-rose-600 uppercase flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>NEREDE (Lokasyon)</span>
                  </span>
                  <span className="text-xs font-bold text-[#1E293B]">{inspectedMeeting.location}</span>
                  <span className="text-[11px] text-[#64748B]">Format: {inspectedMeeting.format}</span>
                </div>

                <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    <span>HANGİ AMAÇLA</span>
                  </span>
                  <span className="text-xs font-bold text-[#1E293B]">{inspectedMeeting.meetingType}</span>
                  <span className="text-[11px] text-[#64748B]">Hedef: Sektörel protokol ve kurumsal mutabakat</span>
                </div>
              </div>

              {/* Gündem */}
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-[#1E293B] uppercase tracking-wide text-[11px]">
                  Toplantı Gündemi & Görüşülen Maddeler
                </span>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-[#E2E8F0] text-xs leading-relaxed whitespace-pre-line">
                  {inspectedMeeting.agendaItems}
                </div>
              </div>

              {/* Alınan Kararlar */}
              <div className="flex flex-col gap-1.5">
                <span className="font-bold text-emerald-800 uppercase tracking-wide text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Alınan Kararlar & Aksiyon Planı</span>
                </span>
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs font-semibold text-emerald-950 leading-relaxed whitespace-pre-line">
                  {inspectedMeeting.decisionsAndActions}
                </div>
              </div>

              {/* Notlar */}
              {inspectedMeeting.notes && (
                <div className="p-3 rounded-xl bg-slate-50 border border-[#E2E8F0] text-[11px] text-[#64748B]">
                  <span className="font-bold text-[#1E293B] block mb-0.5">Kurumsal Not:</span>
                  {inspectedMeeting.notes}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-[#E2E8F0] flex items-center justify-between">
              <button
                type="button"
                onClick={() => alert('Toplantı tutanağı resmi PDF çıktısı oluşturuluyor...')}
                className="inline-flex items-center gap-1.5 text-xs text-[#00478F] font-bold hover:underline cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Resmi Tutanak Belgesini İndir (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectedMeeting(null)}
                className="px-4 py-2 rounded-xl bg-[#00478F] hover:bg-[#00356B] text-white font-bold text-xs cursor-pointer"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TOPLANTIYI TAMAMLAMA & TUTANAK EKLEME MODALI */}
      {/* ======================================================== */}
      {completingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-[#CBD5E1] flex flex-col">
            <div className="bg-[#00677d] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <h3 className="font-bold text-sm">Toplantı Tutanağını Tamamla</h3>
              </div>
              <button
                type="button"
                onClick={() => setCompletingMeeting(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4 text-xs">
              <div>
                <span className="font-bold text-[#1E293B] block">{completingMeeting.title}</span>
                <span className="text-[#64748B]">{completingMeeting.companyName} • {completingMeeting.date}</span>
              </div>

              <div>
                <label className="font-bold text-[#1E293B] block mb-1">
                  Toplantıda Alınan Kararlar ve Aksiyonlar *
                </label>
                <textarea
                  rows={4}
                  required
                  value={completionNotes}
                  onChange={e => setCompletionNotes(e.target.value)}
                  placeholder="Görüşülen maddeler doğrultusunda varılan mutabakat, belirlenen sorumlular ve teslim tarihleri..."
                  className="w-full p-2.5 rounded-lg border border-[#CBD5E1] text-[#1E293B] text-xs focus:outline-none focus:border-[#00677d]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCompletingMeeting(null)}
                  className="px-3.5 py-1.5 rounded-lg bg-slate-100 text-[#64748B] font-bold text-xs cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  onClick={saveMeetingCompletion}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                >
                  Tamamlandı Olarak Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
