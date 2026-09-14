import React, { useState } from 'react';
import { Company, Activity, ActivityType } from '../../types';
import { ExcelService } from '../../services/excelService';
import { 
  CalendarCheck, 
  BookOpen, 
  Bus, 
  Activity as ActivityIcon, 
  Mic, 
  Sparkles, 
  Plus, 
  Download, 
  Search, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Users, 
  ChevronRight, 
  FileText, 
  Calendar as CalendarIcon,
  Building,
  User,
  List,
  Columns,
  GraduationCap,
  Save,
  Trash2,
  FolderGit2,
  Briefcase,
  ShieldCheck,
  Award,
  DollarSign,
  Lightbulb,
  Check
} from 'lucide-react';

interface ActivitiesViewProps {
  companies: Company[];
  activities: Activity[];
  onAddActivity: (act: Activity) => void;
  onOpenAiModal: () => void;
  onNavigateTab: (tab: any) => void;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  companies,
  activities,
  onAddActivity,
  onOpenAiModal,
  onNavigateTab,
}) => {
  const [viewMode, setViewMode] = useState<'form' | 'table' | 'kanban'>('form');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [unitFilter, setUnitFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Form State for creating a new activity
  const [selectedType, setSelectedType] = useState<ActivityType>('Markalı Ders');
  const [selectedCompanyId, setSelectedCompanyId] = useState(companies[0]?.id || '');
  const [customCompanyName, setCustomCompanyName] = useState('');
  const [companyMode, setCompanyMode] = useState<'existing' | 'new'>('existing');
  const [title, setTitle] = useState('İlaç Endüstrisinde GMP ve Ruhsatlandırma');
  const [date, setDate] = useState('2026-11-18');
  const [timeRange, setTimeRange] = useState('10:00 - 13:00 (Her Çarşamba)');
  const [location, setLocation] = useState('Kemal Gözükara Yerleşkesi A-302');
  const [department, setDepartment] = useState('Eczacılık & Kimya Mühendisliği');
  const [coordinationUnit, setCoordinationUnit] = useState('ArelPro Kurumsal İlişkiler & TTO');
  const [coordinator, setCoordinator] = useState('Doç. Dr. Ahmet Yılmaz');
  const [targetStudents, setTargetStudents] = useState('42');
  const [description, setDescription] = useState('Ders kapsamında haftalık sektörel vaka analizleri ve 12. haftada Çerkezköy üretim tesisi teknik gezisi planlanmıştır.');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Type-specific state: Markalı Ders
  const [courseCode, setCourseCode] = useState('ECZ408 - İlaçta Kalite ve GMP');
  const [instructor, setInstructor] = useState('Dr. Selin Erdem (Ar-Ge Direktörü)');
  const [ectsCredits, setEctsCredits] = useState('5 AKTS • 45 Kontenjan');
  const [academicTerm, setAcademicTerm] = useState('2026-2027 Güz Dönemi');
  const [courseOutcome, setCourseOutcome] = useState('Sektörel Vaka Raporu & Başarı Belgesi');

  // Type-specific state: Proje (Ar-Ge & TÜBİTAK)
  const [projectCode, setProjectCode] = useState('TÜBİTAK-2244-PRJ-2026-08');
  const [fundingProgram, setFundingProgram] = useState('TÜBİTAK 2244 Sanayi Doktora Programı');
  const [projectBudget, setProjectBudget] = useState('₺1.850.000');
  const [projectDuration, setProjectDuration] = useState('24 Ay (Ekim 2026 - Ekim 2028)');
  const [academicLeader, setAcademicLeader] = useState('Prof. Dr. Hakan Demir (Makine Müh.)');
  const [industryLeader, setIndustryLeader] = useState('Dr. Caner Yıldız (Ar-Ge Müdürü)');
  const [scholarshipCount, setScholarshipCount] = useState('3 Bursiyer (2 Doktora, 1 YL)');
  const [patentIpStatus, setPatentIpStatus] = useState('Ortak Patent Başvurusu Planlandı (%50 Arel - %50 Firma)');

  // Type-specific state: Teknik Gezi
  const [tripFacility, setTripFacility] = useState('TEI TUSAŞ Motor Sanayii A.Ş. Üretim Tesisleri');
  const [transportInfo, setTransportInfo] = useState('2 Adet 35 Kişilik Otobüs Tahsisi (Arel Ulaşım)');
  const [departureTime, setDepartureTime] = useState('07:30 Servis Kalkış • 18:00 Dönüş');
  const [safetyProcedure, setSafetyProcedure] = useState('İSG Taahhütnamesi Alındı, Baret ve Yelek Temini Zorunlu');
  const [tripCoordinator, setTripCoordinator] = useState('Dr. Öğr. Üyesi Mehmet Akın');

  // Type-specific state: Seminer & Zirve
  const [speakers, setSpeakers] = useState('Serdar Keskin (Yapay Zeka Grup Lideri - LC Waikiki)');
  const [eventFormat, setEventFormat] = useState('Yüz Yüze Konferans');
  const [moderator, setModerator] = useState('Doç. Dr. Selin Kaya');
  const [hasCertificate, setHasCertificate] = useState('Karekodlu Katılım Sertifikası Verilecek');
  const [cateringPlan, setCateringPlan] = useState('Fuaye Alanında Networking Kokteyli ve Kahve Arası');

  // Type-specific state: Diğer Kurumsal
  const [activityScope, setActivityScope] = useState('Kariyer Mülakat Simülasyonu & İK Görüşmeleri');
  const [requiredSupport, setRequiredSupport] = useState('Fuaye Alanı, 6 Adet Mülakat Masası, Wi-Fi ve Roll-up Standı');
  const [corporateContact, setCorporateContact] = useState('Ayşe Yılmaz (İnsan Kaynakları Müdürü)');

  // Handler to switch activity type and populate sensible template defaults
  const handleSelectType = (type: ActivityType) => {
    setSelectedType(type);
    if (type === 'Proje') {
      setTitle('TÜBİTAK 2244 Sanayi Doktora Araştırma Projesi');
      setLocation('TTO Teknopark Ar-Ge Laboratuvarı & Şirket Ar-Ge Merkezi');
      setDepartment('Makine ve Bilgisayar Mühendisliği');
      setCoordinationUnit('Teknoloji Transfer Ofisi (TTO) Proje Yönetim Ofisi');
      setCoordinator('Prof. Dr. Hakan Demir');
      setTimeRange('Haftalık 15 Saat Çalışma (24 Ay Proje Süresi)');
      setTargetStudents('3');
      setDescription('ASELSAN iş birliğinde yürütülen TÜBİTAK 2244 Sanayi Doktora Programı. Savunma ve aviyonik sistemler için kompozit malzeme geliştirilmesi ve ticarileştirilmesi hedeflenmektedir.');
    } else if (type === 'Teknik Gezi') {
      setTitle('TEI TUSAŞ Motor Sanayii Fabrikası Teknik İnceleme Gezisi');
      setLocation('TEI TUSAŞ Tesisleri / Eskişehir Organize Sanayi');
      setDepartment('Makine ve Havacılık Mühendisliği');
      setCoordinationUnit('Mühendislik-Mimarlık Fakültesi Dekanlığı');
      setCoordinator('Dr. Öğr. Üyesi Mehmet Akın');
      setTimeRange('07:30 Servis Kalkış - 18:00 Dönüş');
      setTargetStudents('65');
      setDescription('Havacılık gaz türbin motorları üretim hatları ve test bremzeleri yerinde incelenecektir. Kemal Gözükara Yerleşkesinden servisler hareket edecektir.');
    } else if (type === 'Markalı Ders') {
      setTitle('İlaç Endüstrisinde GMP ve Ruhsatlandırma');
      setLocation('Kemal Gözükara Yerleşkesi A-302 Amfisi');
      setDepartment('Eczacılık & Kimya Mühendisliği');
      setCoordinationUnit('ArelPro Kurumsal İlişkiler & TTO');
      setCoordinator('Doç. Dr. Ahmet Yılmaz');
      setTimeRange('10:00 - 13:00 (Her Çarşamba)');
      setTargetStudents('42');
      setDescription('Ders kapsamında haftalık sektörel vaka analizleri ve 12. haftada Çerkezköy üretim tesisi teknik gezisi planlanmıştır.');
    } else if (type === 'Seminer & Zirve') {
      setTitle('Perakendede Üretken Yapay Zeka ve Büyük Veri Zirvesi');
      setLocation('Kemal Gözükara Ana Konferans Salonu');
      setDepartment('Bilgisayar Mühendisliği & Yönetim Bilişim Sistemleri');
      setCoordinationUnit('Kurumsal İletişim & Kariyer Merkezi');
      setCoordinator('Doç. Dr. Selin Kaya');
      setTimeRange('13:30 - 17:00');
      setTargetStudents('250');
      setDescription('Sektör profesyonellerinin katılımıyla yapay zeka destekli perakende analitiği ve e-ticaret lojistiği paneli gerçekleştirilecektir.');
    } else {
      setTitle('Kurumsal Kariyer Günleri & Mülakat Simülasyonu');
      setLocation('Cevizlibağ Yerleşkesi Fuaye Alanı');
      setDepartment('Kariyer Merkezi & Mezunlar Ofisi');
      setCoordinationUnit('ArelPro Kurumsal İlişkiler Koordinatörlüğü');
      setCoordinator('Kariyer Merkezi Koordinatörü');
      setTimeRange('10:00 - 16:00');
      setTargetStudents('120');
      setDescription('Öğrencilerin mezuniyet öncesi mülakat yetkinliklerinin geliştirilmesi amacıyla sektör İK liderleriyle birebir mülakat simülasyonları.');
    }
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCompanyName = companyMode === 'existing' ? selectedCompany?.name || 'VEM İlaç San. ve Tic. A.Ş.' : customCompanyName;

    const newAct: Activity = {
      id: `act-${Date.now()}`,
      code: selectedType === 'Proje' ? `PRJ-2026-${Math.floor(Math.random() * 800) + 200}` : `FL-2026-${Math.floor(Math.random() * 800) + 200}`,
      title: title.trim() || 'Yeni Kurumsal Faaliyet',
      type: selectedType,
      companyId: companyMode === 'existing' ? selectedCompanyId : 'custom-corp',
      companyName: finalCompanyName,
      date: date || '2026-11-18',
      timeRange: timeRange || '10:00 - 12:00',
      location: location || 'Kemal Gözükara Yerleşkesi',
      department: department || 'Mühendislik / TTO',
      coordinationUnit: coordinationUnit || 'ArelPro Kurumsal İlişkiler',
      coordinator: coordinator || 'Doç. Dr. Ahmet Yılmaz',
      targetStudents: parseInt(targetStudents, 10) || 40,
      attendedStudents: 0,
      status: 'Planlandı',
      academicTerm: academicTerm || '2026-2027 Güz',
      // Markalı Ders fields
      courseCode: selectedType === 'Markalı Ders' ? courseCode : undefined,
      instructorName: selectedType === 'Markalı Ders' ? instructor : undefined,
      ectsCredits: selectedType === 'Markalı Ders' ? ectsCredits : undefined,
      // Proje fields
      projectCode: selectedType === 'Proje' ? projectCode : undefined,
      fundingProgram: selectedType === 'Proje' ? fundingProgram : undefined,
      projectBudget: selectedType === 'Proje' ? projectBudget : undefined,
      projectDuration: selectedType === 'Proje' ? projectDuration : undefined,
      academicLeader: selectedType === 'Proje' ? academicLeader : undefined,
      industryLeader: selectedType === 'Proje' ? industryLeader : undefined,
      scholarshipCount: selectedType === 'Proje' ? scholarshipCount : undefined,
      patentIpStatus: selectedType === 'Proje' ? patentIpStatus : undefined,
      // Teknik Gezi fields
      tripFacility: selectedType === 'Teknik Gezi' ? tripFacility : undefined,
      transportInfo: selectedType === 'Teknik Gezi' ? transportInfo : undefined,
      departureTime: selectedType === 'Teknik Gezi' ? departureTime : undefined,
      safetyProcedure: selectedType === 'Teknik Gezi' ? safetyProcedure : undefined,
      tripCoordinator: selectedType === 'Teknik Gezi' ? tripCoordinator : undefined,
      // Seminer & Zirve fields
      speakers: selectedType === 'Seminer & Zirve' ? speakers : undefined,
      eventFormat: selectedType === 'Seminer & Zirve' ? eventFormat : undefined,
      moderator: selectedType === 'Seminer & Zirve' ? moderator : undefined,
      hasCertificate: selectedType === 'Seminer & Zirve' ? hasCertificate : undefined,
      cateringPlan: selectedType === 'Seminer & Zirve' ? cateringPlan : undefined,
      // Diğer Kurumsal fields
      activityScope: selectedType === 'Diğer Kurumsal' ? activityScope : undefined,
      requiredSupport: selectedType === 'Diğer Kurumsal' ? requiredSupport : undefined,
      corporateContact: selectedType === 'Diğer Kurumsal' ? corporateContact : undefined,
      description: description,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onAddActivity(newAct);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const filteredActivities = activities.filter(act => {
    const matchesSearch = 
      act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.coordinator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      act.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = 
      typeFilter === 'ALL' || 
      act.type === typeFilter ||
      (typeFilter === 'Proje' && (act.type === 'Proje' || act.type === 'Ar-Ge & TÜBİTAK'));
    const matchesUnit = unitFilter === 'ALL' || act.department.includes(unitFilter) || act.coordinationUnit.includes(unitFilter);
    const matchesStatus = statusFilter === 'ALL' || act.status === statusFilter;

    return matchesSearch && matchesType && matchesUnit && matchesStatus;
  });

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Breadcrumb & Page Command Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#64748B] text-xs tracking-wide uppercase font-semibold">
            <span className="text-[#00478F]">Kurumsal İlişkiler & İş Birlikleri</span>
            <span>&gt;</span>
            <span className="text-[#00677d]">Faaliyet Yönetimi</span>
            <span>&gt;</span>
            <span>2026-2027 Güz Dönemi</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#1E293B] tracking-tight">
              Faaliyet Yönetimi & İş Birlikleri Takibi
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#b3ebff] text-[#004e5f] text-xs font-bold">
              Güz 2026
            </span>
          </div>
          <p className="text-xs text-[#64748B] max-w-3xl">
            Üniversite - Sanayi iş birlikleri, markalı dersler, teknik geziler, TÜBİTAK/Ar-Ge projeleri ve seminerlerin merkezi yönetimi ve performans matrisi.
          </p>
        </div>

        {/* Quick Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            type="button"
            onClick={() => ExcelService.exportActivitiesToExcel(activities, [])}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-lg bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#1E293B] text-xs font-bold shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#64748B]" />
            <span>Faaliyet Raporu (Excel)</span>
          </button>
          <button
            type="button"
            onClick={onOpenAiModal}
            className="inline-flex items-center gap-2 h-10 px-3.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold shadow-xs cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>AI ile Hızlı Ekle</span>
            <span className="px-1.5 py-0.2 rounded bg-white text-emerald-700 text-[10px] font-bold">Gemini</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('form')}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#00478F] hover:bg-[#00356B] text-white text-xs font-bold shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Faaliyet Ekle</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Highlight Cards (Exact 5 Gradients from Screen 1) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#00478F] via-[#003166] to-[#00677d] p-4 text-white shadow-md flex flex-col justify-between min-h-[136px] group">
          <div className="flex items-start justify-between z-10">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-blue-200 font-bold">TOPLAM FAALİYET</span>
              <span className="text-3xl font-bold tracking-tight text-white mt-1">{activities.length * 6 + 12}</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
              +14
            </span>
          </div>
          <div className="flex items-center justify-between text-blue-100 text-[11px] z-10 pt-2 border-t border-white/20">
            <span>Güz Dönemi İlerlemesi</span>
            <span className="font-bold text-white">%92 Hedef</span>
          </div>
          <CalendarCheck className="w-24 h-24 text-white/10 absolute -right-3 -bottom-3 pointer-events-none" />
        </div>

        {/* Markalı Dersler (Blue Gradient) */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] p-4 text-white shadow-md flex flex-col justify-between min-h-[136px] group">
          <div className="flex items-start justify-between z-10">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-blue-100 font-bold">Markalı Dersler</span>
              <span className="text-3xl font-bold tracking-tight text-white mt-1">8</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
              8 Firma
            </span>
          </div>
          <div className="flex items-center justify-between text-blue-100 text-[11px] z-10 pt-2 border-t border-white/20">
            <span>Kayıtlı Öğrenci</span>
            <span className="font-bold text-white">420 Aktif</span>
          </div>
          <BookOpen className="w-24 h-24 text-white/10 absolute -right-3 -bottom-3 pointer-events-none" />
        </div>

        {/* Teknik Geziler (Secondary / Cyan Gradient) */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#00677d] to-[#004e5f] p-4 text-white shadow-md flex flex-col justify-between min-h-[136px] group">
          <div className="flex items-start justify-between z-10">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-[#b3ebff] font-bold">Teknik Geziler</span>
              <span className="text-3xl font-bold tracking-tight text-white mt-1">12</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
              Aktif Saha
            </span>
          </div>
          <div className="flex items-center justify-between text-[#b3ebff] text-[11px] z-10 pt-2 border-t border-white/20">
            <span>Sanayi Ziyareti</span>
            <span className="font-bold text-white">365 Katılımcı</span>
          </div>
          <Bus className="w-24 h-24 text-white/10 absolute -right-3 -bottom-3 pointer-events-none" />
        </div>

        {/* Proje (Emerald Gradient) */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] p-4 text-white shadow-md flex flex-col justify-between min-h-[136px] group">
          <div className="flex items-start justify-between z-10">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-emerald-100 font-bold">Proje</span>
              <span className="text-3xl font-bold tracking-tight text-white mt-1">9</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
              TÜBİTAK & Sanayi
            </span>
          </div>
          <div className="flex items-center justify-between text-emerald-100 text-[11px] z-10 pt-2 border-t border-white/20">
            <span>Onaylı Fon</span>
            <span className="font-bold text-white">₺3.8M Toplam</span>
          </div>
          <FolderGit2 className="w-24 h-24 text-white/10 absolute -right-3 -bottom-3 pointer-events-none" />
        </div>

        {/* Seminer & Zirve (Amber Gradient) */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] p-4 text-white shadow-md flex flex-col justify-between min-h-[136px] group">
          <div className="flex items-start justify-between z-10">
            <div className="flex flex-col">
              <span className="text-[11px] uppercase tracking-wider text-amber-100 font-bold">Seminer & Zirve</span>
              <span className="text-3xl font-bold tracking-tight text-white mt-1">19</span>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold">
              Konferans
            </span>
          </div>
          <div className="flex items-center justify-between text-amber-100 text-[11px] z-10 pt-2 border-t border-white/20">
            <span>Etkileşim</span>
            <span className="font-bold text-white">1,840 Dinleyici</span>
          </div>
          <Mic className="w-24 h-24 text-white/10 absolute -right-3 -bottom-3 pointer-events-none" />
        </div>
      </div>

      {/* Filter & View Controls Ribbon */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-4 flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Faaliyet başlığı, firma/kurum, öğretim üyesi veya bölüm ara..."
              className="w-full h-10 pl-9 pr-4 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] text-xs text-[#1E293B] placeholder:text-[#64748B] focus:outline-none focus:border-[#00478F]"
            />
          </div>

          {/* View Switcher */}
          <div className="flex items-center bg-[#f1f4f7] p-1 rounded-lg self-start lg:self-center shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('form')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'form' ? 'bg-white text-[#00478F] shadow-xs' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Giriş Formu</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#00478F] shadow-xs' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tablo Görünümü</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-[#00478F] shadow-xs' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Aşama / Kanban</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-[#E2E8F0]">
          {/* Filter: Tür */}
          <div className="flex items-center gap-1.5 bg-[#f1f4f7] px-2.5 py-1.5 rounded-lg text-xs">
            <span className="text-[#64748B] font-bold uppercase text-[10px]">Tür:</span>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-transparent text-[#1E293B] font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tüm Türler ({activities.length})</option>
              <option value="Markalı Ders">Markalı Ders</option>
              <option value="Teknik Gezi">Teknik Gezi</option>
              <option value="Proje">Proje (Ar-Ge & TÜBİTAK)</option>
              <option value="Seminer & Zirve">Seminer & Konferans</option>
              <option value="Diğer Kurumsal">Diğer Kurumsal</option>
            </select>
          </div>

          {/* Filter: Birim */}
          <div className="flex items-center gap-1.5 bg-[#f1f4f7] px-2.5 py-1.5 rounded-lg text-xs">
            <span className="text-[#64748B] font-bold uppercase text-[10px]">Birim:</span>
            <select
              value={unitFilter}
              onChange={e => setUnitFilter(e.target.value)}
              className="bg-transparent text-[#1E293B] font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tüm Fakülte / Birimler</option>
              <option value="Mühendislik">Mühendislik-Mimarlık Fakültesi</option>
              <option value="Eczacılık">Sağlık Bilimleri Fakültesi & Eczacılık</option>
              <option value="İİBF">İktisadi ve İdari Bilimler Fakültesi</option>
              <option value="TTO">Teknoloji Transfer Ofisi (TTO)</option>
            </select>
          </div>

          {/* Filter: Durum */}
          <div className="flex items-center gap-1.5 bg-[#f1f4f7] px-2.5 py-1.5 rounded-lg text-xs">
            <span className="text-[#64748B] font-bold uppercase text-[10px]">Durum:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-transparent text-[#1E293B] font-bold focus:outline-none cursor-pointer"
            >
              <option value="ALL">Tümü (Tamamlanan & Planlanan)</option>
              <option value="Tamamlandı">Tamamlandı</option>
              <option value="Planlandı">Planlandı / Yaklaşan</option>
              <option value="Onay Bekliyor">Onay Bekliyor</option>
            </select>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-[#64748B]">
              {filteredActivities.length} kayıt listeleniyor
            </span>
            <button
              type="button"
              onClick={() => { setSearchTerm(''); setTypeFilter('ALL'); setUnitFilter('ALL'); setStatusFilter('ALL'); }}
              className="p-1.5 rounded-lg hover:bg-[#f1f4f7] text-[#64748B] hover:text-[#00478F]"
              title="Filtreleri Temizle"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW: Table Mode */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
          <div className="p-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#1E293B]">Kayıtlı Tüm Faaliyetler ({filteredActivities.length})</h3>
            <button
              type="button"
              onClick={() => ExcelService.exportActivitiesToExcel(filteredActivities, [])}
              className="text-xs text-[#00478F] font-bold hover:underline"
            >
              Excel'e İndir
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f1f4f7] text-[#64748B] font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Kod & Başlık</th>
                  <th className="py-3 px-4">Tür</th>
                  <th className="py-3 px-4">Firma / Paydaş</th>
                  <th className="py-3 px-4">Tarih & Saat</th>
                  <th className="py-3 px-4">Yerleşke / Salon</th>
                  <th className="py-3 px-4">Koordinatör & Bölüm</th>
                  <th className="py-3 px-4">Hedef Öğrenci</th>
                  <th className="py-3 px-4">Durum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredActivities.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-[#1E293B]">
                      <span className="text-[10px] text-[#00478F] block font-mono">{a.code}</span>
                      {a.title}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-[#00478F] text-[10px] font-bold">
                        {a.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#1E293B]">{a.companyName}</td>
                    <td className="py-3 px-4 text-[#64748B]">
                      {a.date} <span className="block text-[10px]">{a.timeRange}</span>
                    </td>
                    <td className="py-3 px-4 text-[#64748B]">{a.location}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-[#1E293B]">{a.coordinator}</div>
                      <div className="text-[10px] text-[#64748B]">{a.department}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-[#1E293B]">{a.attendedStudents || a.targetStudents}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        a.status === 'Tamamlandı' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: Kanban Mode */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Onay Bekliyor', 'Planlandı', 'Tamamlandı'].map(stage => {
            const stageActs = activities.filter(a => a.status === stage || (stage === 'Planlandı' && a.status === 'Planlandı'));
            return (
              <div key={stage} className="bg-[#f1f4f7] rounded-xl p-4 border border-[#E2E8F0] flex flex-col gap-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                  <span className="font-bold text-xs text-[#1E293B]">{stage}</span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-bold text-[#64748B]">
                    {stageActs.length}
                  </span>
                </div>
                <div className="flex flex-col gap-2.5 overflow-y-auto max-h-[600px]">
                  {stageActs.map(item => (
                    <div key={item.id} className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs space-y-1.5">
                      <span className="px-1.5 py-0.2 rounded bg-blue-50 text-[#00478F] text-[9px] font-bold uppercase">
                        {item.type}
                      </span>
                      <h4 className="text-xs font-bold text-[#1E293B] line-clamp-2">{item.title}</h4>
                      <p className="text-[10px] text-[#64748B] truncate">{item.companyName}</p>
                      <div className="flex items-center justify-between text-[10px] text-[#64748B] pt-1 border-t border-slate-100">
                        <span>{item.date}</span>
                        <span className="font-semibold text-[#00478F]">{item.coordinator.split(' ')[0]}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW: Master Form & Inspector Grid (Exact Layout of Screen 1) */}
      {viewMode === 'form' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Master 8 Cols: Form & Metrics */}
          <div className="xl:col-span-8 flex flex-col gap-5">
            {/* Master Entry Form */}
            <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-[#E2E8F0] flex flex-col">
              {/* Header */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] bg-white">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-[#00478F] shrink-0 shadow-xs">
                    <CalendarCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                      Yeni Faaliyet & İş Birliği Girişi
                    </h2>
                    <span className="text-[11px] text-[#64748B]">
                      Üniversite - Sanayi iş birlikleri, markalı ders, teknik gezi ve Ar-Ge faaliyet kaydı
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Canlı Veri Tabanı Kaydı (CRM)
                  </span>
                  <button
                    type="button"
                    onClick={onOpenAiModal}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f1f4f7] hover:bg-slate-200 text-[#00677d] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Hızlı AI Doldur</span>
                  </button>
                </div>
              </div>

              {saveSuccess && (
                <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Faaliyet başarıyla veritabanına ve zaman akışı takvimine kaydedildi!</span>
                </div>
              )}

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 text-xs">
                {/* Faaliyet Türü Seçimi */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold">
                      Faaliyet Türü Seçimi *
                    </label>
                    <span className="text-[11px] text-[#00478F] font-semibold">
                      Seçilen Türe Göre Dinamik Form Alanları Güncellenir
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {(['Markalı Ders', 'Teknik Gezi', 'Proje', 'Seminer & Zirve', 'Diğer Kurumsal'] as ActivityType[]).map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleSelectType(type)}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          selectedType === type
                            ? 'border-[#00478F] bg-[#00478F]/10 text-[#00478F] shadow-xs ring-2 ring-[#00478F]/20'
                            : 'border-[#E2E8F0] bg-[#f1f4f7] hover:bg-slate-200 text-[#64748B]'
                        }`}
                      >
                        {type === 'Markalı Ders' && <BookOpen className="w-5 h-5" />}
                        {type === 'Teknik Gezi' && <Bus className="w-5 h-5" />}
                        {type === 'Proje' && <FolderGit2 className="w-5 h-5 text-emerald-600" />}
                        {type === 'Seminer & Zirve' && <Mic className="w-5 h-5 text-amber-600" />}
                        {type === 'Diğer Kurumsal' && <Building className="w-5 h-5 text-indigo-600" />}
                        <span className="truncate max-w-full">{type}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section A: Kurum & Eşleştirme */}
                <div className="p-4 rounded-xl bg-[#f1f4f7]/70 border border-[#E2E8F0] flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-2.5">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-[#00478F]" />
                      <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wide">
                        A. Kurum & Eşleştirme Yöntemi
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-1.5 cursor-pointer font-bold text-[#1E293B]">
                        <input
                          type="radio"
                          name="company_mode"
                          checked={companyMode === 'existing'}
                          onChange={() => setCompanyMode('existing')}
                          className="text-[#00478F] focus:ring-[#00478F]"
                        />
                        <span>Kayıtlı Firmalardan Seç</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer text-[#64748B] hover:text-[#1E293B]">
                        <input
                          type="radio"
                          name="company_mode"
                          checked={companyMode === 'new'}
                          onChange={() => setCompanyMode('new')}
                          className="text-[#00478F] focus:ring-[#00478F]"
                        />
                        <span>Kartı Olmayan / Yeni Kurum Gir</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] text-[#64748B] font-bold block mb-1">
                        {selectedType === 'Proje' ? 'Proje Ortağı Sanayi Kuruluşu / Firma *' : 'İlgili Firma / Paydaş *'}
                      </label>
                      {companyMode === 'existing' ? (
                        <select
                          value={selectedCompanyId}
                          onChange={e => setSelectedCompanyId(e.target.value)}
                          className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-semibold focus:outline-none focus:border-[#00478F]"
                        >
                          {companies.map(c => (
                            <option key={c.id} value={c.id}>
                              {c.name} ({c.protocolStatus === 'Aktif' ? 'Protokollü Aktif' : c.protocolStatus})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={customCompanyName}
                          onChange={e => setCustomCompanyName(e.target.value)}
                          placeholder="Kurum tam adını giriniz..."
                          className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-semibold focus:outline-none focus:border-[#00478F]"
                        />
                      )}
                    </div>
                    <div>
                      <label className="text-[11px] text-[#64748B] font-bold block mb-1">
                        {selectedType === 'Proje' 
                          ? 'Proje Adı / Başlığı *' 
                          : selectedType === 'Teknik Gezi' 
                          ? 'Teknik Gezi Başlığı / Saha Adı *' 
                          : selectedType === 'Seminer & Zirve' 
                          ? 'Seminer / Zirve Konu Başlığı *' 
                          : selectedType === 'Diğer Kurumsal' 
                          ? 'Etkinlik / Faaliyet Başlığı *' 
                          : 'Ders Adı & Konusu *'}
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder={
                          selectedType === 'Proje'
                            ? 'Örn: TÜBİTAK 2244 Sanayi Doktora Araştırma Projesi'
                            : selectedType === 'Teknik Gezi'
                            ? 'Örn: TEI TUSAŞ Fabrikası Teknik İnceleme Gezisi'
                            : selectedType === 'Seminer & Zirve'
                            ? 'Örn: Perakendede Yapay Zeka ve Büyük Veri Zirvesi'
                            : 'Faaliyet tam adını giriniz...'
                        }
                        className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-bold focus:outline-none focus:border-[#00478F]"
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Zaman & Lojistik */}
                <div className="p-4 rounded-xl bg-[#f1f4f7]/70 border border-[#E2E8F0] flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2.5">
                    <Clock className="w-4 h-4 text-[#00478F]" />
                    <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wide">
                      B. Zaman & Lojistik
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-[#64748B] font-bold block mb-1">
                        {selectedType === 'Proje' ? 'Proje Başlangıç / Onay Tarihi *' : 'Gerçekleşme / Planlanan Tarih *'}
                      </label>
                      <input
                        type="date"
                        value={date}
                        onChange={e => setDate(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-semibold focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#64748B] font-bold block mb-1">
                        {selectedType === 'Proje' ? 'Haftalık Mesai / Çalışma Saatleri *' : 'Saat / Saat Aralığı *'}
                      </label>
                      <input
                        type="text"
                        value={timeRange}
                        onChange={e => setTimeRange(e.target.value)}
                        placeholder={selectedType === 'Proje' ? 'Örn: Haftalık 15 Saat' : 'Örn: 10:00 - 13:00'}
                        className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#64748B] font-bold block mb-1">
                        {selectedType === 'Proje' 
                          ? 'Laboratuvar / Çalışma Yeri' 
                          : selectedType === 'Teknik Gezi' 
                          ? 'Ziyaret Edilecek Şehir / Tesis' 
                          : 'Yer / Yerleşke / Salon'}
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={e => setLocation(e.target.value)}
                        placeholder="Yerleşke, tesis veya salon..."
                        className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Section C: Seçilen Faaliyet Türüne Göre Değişen Dinamik Form Alanları */}
                <div className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors ${
                  selectedType === 'Proje' 
                    ? 'bg-emerald-50/60 border-emerald-200' 
                    : selectedType === 'Teknik Gezi'
                    ? 'bg-cyan-50/60 border-cyan-200'
                    : selectedType === 'Seminer & Zirve'
                    ? 'bg-amber-50/60 border-amber-200'
                    : selectedType === 'Diğer Kurumsal'
                    ? 'bg-indigo-50/60 border-indigo-200'
                    : 'bg-blue-50/60 border-blue-200'
                }`}>
                  <div className="flex items-center justify-between border-b pb-2.5 border-black/10">
                    <div className="flex items-center gap-2">
                      {selectedType === 'Markalı Ders' && <BookOpen className="w-4 h-4 text-[#00478F]" />}
                      {selectedType === 'Proje' && <FolderGit2 className="w-4 h-4 text-emerald-700" />}
                      {selectedType === 'Teknik Gezi' && <Bus className="w-4 h-4 text-cyan-700" />}
                      {selectedType === 'Seminer & Zirve' && <Mic className="w-4 h-4 text-amber-700" />}
                      {selectedType === 'Diğer Kurumsal' && <Building className="w-4 h-4 text-indigo-700" />}
                      <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wide">
                        C. {selectedType === 'Proje' 
                          ? 'Proje, Fonlama Destek Programı & Ar-Ge Bilgileri' 
                          : selectedType === 'Teknik Gezi'
                          ? 'Teknik Gezi Saha, Ulaşım & İSG Lojistik Bilgileri'
                          : selectedType === 'Seminer & Zirve'
                          ? 'Seminer, Konferans & Zirve Organizasyon Bilgileri'
                          : selectedType === 'Diğer Kurumsal'
                          ? 'Kurumsal İş Birliği, Kariyer & Etkinlik Bilgileri'
                          : 'Markalı Ders Müfredat, Dönem & Kontenjan Bilgileri'}
                      </span>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedType === 'Proje'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedType === 'Teknik Gezi'
                        ? 'bg-cyan-100 text-cyan-800'
                        : selectedType === 'Seminer & Zirve'
                        ? 'bg-amber-100 text-amber-800'
                        : selectedType === 'Diğer Kurumsal'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-blue-100 text-[#00478F]'
                    }`}>
                      {selectedType} Modülü
                    </span>
                  </div>

                  {/* 1. DYNAMIC FIELDS: MARKALI DERS */}
                  {selectedType === 'Markalı Ders' && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Ders Kodu & Müfredat Adı *</label>
                          <input
                            type="text"
                            value={courseCode}
                            onChange={e => setCourseCode(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-semibold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Dersi Veren Eğitmen / Sektör Uzmanı *</label>
                          <input
                            type="text"
                            value={instructor}
                            onChange={e => setInstructor(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Akademik Dönem *</label>
                          <select 
                            value={academicTerm}
                            onChange={e => setAcademicTerm(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-bold focus:outline-none"
                          >
                            <option>2026-2027 Güz Dönemi</option>
                            <option>2026-2027 Bahar Dönemi</option>
                            <option>2027-2028 Güz Dönemi</option>
                          </select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Hedef Öğrenci / Kontenjan Sayısı</label>
                          <input
                            type="number"
                            value={targetStudents}
                            onChange={e => setTargetStudents(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">AKTS Kredisi & Kontenjan Detayı</label>
                          <input
                            type="text"
                            value={ectsCredits}
                            onChange={e => setEctsCredits(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-semibold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Ders Çıktısı & Değerlendirme Yöntemi</label>
                          <input
                            type="text"
                            value={courseOutcome}
                            onChange={e => setCourseOutcome(e.target.value)}
                            placeholder="Örn: Sektörel Vaka Raporu & Başarı Belgesi"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 2. DYNAMIC FIELDS: PROJE (Ar-Ge & TÜBİTAK) */}
                  {selectedType === 'Proje' && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Proje Kodu / Referans No *</label>
                          <input
                            type="text"
                            value={projectCode}
                            onChange={e => setProjectCode(e.target.value)}
                            placeholder="Örn: TÜBİTAK-2244-PRJ-2026-08"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-bold font-mono focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Fonlama / Destek Programı *</label>
                          <select
                            value={fundingProgram}
                            onChange={e => setFundingProgram(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-bold focus:outline-none"
                          >
                            <option>TÜBİTAK 2244 Sanayi Doktora Programı</option>
                            <option>TÜBİTAK 1505 Üniversite-Sanayi İşbirliği</option>
                            <option>TÜBİTAK 1001 Bilimsel Araştırma Projesi</option>
                            <option>TÜBİTAK 1501 Sanayi Ar-Ge Destek Programı</option>
                            <option>TEYDEB 1512 BİGG Girişimcilik</option>
                            <option>KOSGEB Ar-Ge ve İnovasyon Desteği</option>
                            <option>Horizon Europe / Uluslararası Konsorsiyum</option>
                            <option>Arel BAP (Bilimsel Araştırma Projeleri)</option>
                            <option>Özel Sanayi Kontratlı Ar-Ge Sözleşmesi</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Toplam Proje Bütçesi / Fon Hacmi *</label>
                          <div className="relative">
                            <span className="absolute left-3 top-2.5 text-[#64748B] font-bold text-xs">₺</span>
                            <input
                              type="text"
                              value={projectBudget}
                              onChange={e => setProjectBudget(e.target.value)}
                              placeholder="₺1.850.000"
                              className="w-full h-10 pl-7 pr-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-emerald-700 font-bold focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Proje Süresi & Takvimi *</label>
                          <input
                            type="text"
                            value={projectDuration}
                            onChange={e => setProjectDuration(e.target.value)}
                            placeholder="Örn: 24 Ay (Ekim 2026 - Ekim 2028)"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-semibold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Akademik Yürütücü / Proje Lideri *</label>
                          <input
                            type="text"
                            value={academicLeader}
                            onChange={e => setAcademicLeader(e.target.value)}
                            placeholder="Örn: Prof. Dr. Hakan Demir"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Firma Ar-Ge Direktörü / Ortak Yürütücü</label>
                          <input
                            type="text"
                            value={industryLeader}
                            onChange={e => setIndustryLeader(e.target.value)}
                            placeholder="Örn: Dr. Caner Yıldız"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Bursiyer / Araştırmacı Kontenjanı</label>
                          <input
                            type="text"
                            value={scholarshipCount}
                            onChange={e => setScholarshipCount(e.target.value)}
                            placeholder="Örn: 3 Bursiyer (2 Doktora, 1 YL)"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-semibold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Fikri Mülkiyet (IP) & Patent Paylaşım Durumu</label>
                          <select
                            value={patentIpStatus}
                            onChange={e => setPatentIpStatus(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-semibold focus:outline-none"
                          >
                            <option>Ortak Patent Başvurusu Planlandı (%50 Arel - %50 Firma)</option>
                            <option>Tüm Haklar Üniversiteye Ait (Arel TTO Lisanslama)</option>
                            <option>Firma Bünyesinde Tescil (Üniversiteye Lisans Payı)</option>
                            <option>Açık İnovasyon / Akademik Yayın Çıktısı Odaklı</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. DYNAMIC FIELDS: TEKNİK GEZİ */}
                  {selectedType === 'Teknik Gezi' && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Ziyaret Edilecek Tesis / Fabrika / Lokasyon *</label>
                          <input
                            type="text"
                            value={tripFacility}
                            onChange={e => setTripFacility(e.target.value)}
                            placeholder="Örn: TEI TUSAŞ Motor Sanayii Üretim Tesisleri"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Ulaşım & Servis Tahsis Planı *</label>
                          <input
                            type="text"
                            value={transportInfo}
                            onChange={e => setTransportInfo(e.target.value)}
                            placeholder="Örn: 2 Adet 35 Kişilik Otobüs Tahsisi (Arel Ulaşım)"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-semibold focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Kalkış - Dönüş Saatleri</label>
                          <input
                            type="text"
                            value={departureTime}
                            onChange={e => setDepartureTime(e.target.value)}
                            placeholder="Örn: 07:30 Servis Kalkış • 18:00 Dönüş"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Katılımcı / Kontenjan Sayısı</label>
                          <input
                            type="number"
                            value={targetStudents}
                            onChange={e => setTargetStudents(e.target.value)}
                            placeholder="65"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Saha Sorumlusu & Rehber Akademisyen</label>
                          <input
                            type="text"
                            value={tripCoordinator}
                            onChange={e => setTripCoordinator(e.target.value)}
                            placeholder="Örn: Dr. Öğr. Üyesi Mehmet Akın"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-[#64748B] font-bold block mb-1">İSG & Saha Güvenlik Prosedürü</label>
                        <input
                          type="text"
                          value={safetyProcedure}
                          onChange={e => setSafetyProcedure(e.target.value)}
                          placeholder="Örn: İSG Taahhütnamesi Alındı, Baret ve Yelek Temini Zorunlu"
                          className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. DYNAMIC FIELDS: SEMİNER & ZİRVE */}
                  {selectedType === 'Seminer & Zirve' && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Konuşmacı(lar) & Kurumsal Unvanı *</label>
                          <input
                            type="text"
                            value={speakers}
                            onChange={e => setSpeakers(e.target.value)}
                            placeholder="Örn: Serdar Keskin (Yapay Zeka Grup Lideri - LC Waikiki)"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Etkinlik Formatı *</label>
                          <select
                            value={eventFormat}
                            onChange={e => setEventFormat(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-bold focus:outline-none"
                          >
                            <option>Yüz Yüze Konferans</option>
                            <option>Çevrimiçi / Online Webinar</option>
                            <option>Hibrit Panel & Söyleşi</option>
                            <option>Atölye & Workshop</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Moderatör / Oturum Başkanı</label>
                          <input
                            type="text"
                            value={moderator}
                            onChange={e => setModerator(e.target.value)}
                            placeholder="Örn: Doç. Dr. Selin Kaya"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Beklenen Dinleyici Kapasitesi</label>
                          <input
                            type="number"
                            value={targetStudents}
                            onChange={e => setTargetStudents(e.target.value)}
                            placeholder="250"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Katılım Belgesi / Sertifika Durumu</label>
                          <select
                            value={hasCertificate}
                            onChange={e => setHasCertificate(e.target.value)}
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-semibold focus:outline-none"
                          >
                            <option>Karekodlu Katılım Sertifikası Verilecek</option>
                            <option>Onaylı Dijital Katılım Belgesi</option>
                            <option>Sertifikasız Açık Oturum</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-[#64748B] font-bold block mb-1">İkram & Karşılama Planı</label>
                        <input
                          type="text"
                          value={cateringPlan}
                          onChange={e => setCateringPlan(e.target.value)}
                          placeholder="Örn: Fuaye Alanında Networking Kokteyli ve Kahve Arası"
                          className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* 5. DYNAMIC FIELDS: DİĞER KURUMSAL */}
                  {selectedType === 'Diğer Kurumsal' && (
                    <div className="flex flex-col gap-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Faaliyet Niteliği / Kapsamı *</label>
                          <input
                            type="text"
                            value={activityScope}
                            onChange={e => setActivityScope(e.target.value)}
                            placeholder="Örn: Kariyer Mülakat Simülasyonu & İK Görüşmeleri"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Firma İrtibat Yetkilisi & Unvanı</label>
                          <input
                            type="text"
                            value={corporateContact}
                            onChange={e => setCorporateContact(e.target.value)}
                            placeholder="Örn: Ayşe Yılmaz (İnsan Kaynakları Müdürü)"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Hedef Kitle / Katılımcı Sayısı</label>
                          <input
                            type="number"
                            value={targetStudents}
                            onChange={e => setTargetStudents(e.target.value)}
                            placeholder="120"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-bold focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#64748B] font-bold block mb-1">Gerekli Stand, Alan & Ekipman Desteği</label>
                          <input
                            type="text"
                            value={requiredSupport}
                            onChange={e => setRequiredSupport(e.target.value)}
                            placeholder="Örn: Fuaye Alanı, 6 Adet Mülakat Masası, Wi-Fi ve Roll-up Standı"
                            className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section D: Düzenleyen Ekip */}
                <div className="p-4 rounded-xl bg-[#f1f4f7]/70 border border-[#E2E8F0] flex flex-col gap-3">
                  <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2.5">
                    <Users className="w-4 h-4 text-[#00478F]" />
                    <span className="text-xs font-bold text-[#1E293B] uppercase tracking-wide">
                      D. Düzenleyen Akademik Ekip & Birimler
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] text-[#64748B] font-bold block mb-1">Düzenleyen Bölüm(ler) *</label>
                      <input
                        type="text"
                        value={department}
                        onChange={e => setDepartment(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#64748B] font-bold block mb-1">Düzenleyen Birim(ler) *</label>
                      <input
                        type="text"
                        value={coordinationUnit}
                        onChange={e => setCoordinationUnit(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-semibold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-[#64748B] font-bold block mb-1">
                        {selectedType === 'Proje'
                          ? 'Proje Yürütücüsü / Araştırmacı Akademisyen *'
                          : selectedType === 'Teknik Gezi'
                          ? 'Gezi Sorumlusu & Rehber Akademisyen *'
                          : selectedType === 'Markalı Ders'
                          ? 'Ders Koordinatörü & Öğretim Üyesi *'
                          : selectedType === 'Seminer & Zirve'
                          ? 'Etkinlik Sorumlusu & Moderatör *'
                          : 'Koordinatör / Birim Yetkilisi *'}
                      </label>
                      <input
                        type="text"
                        value={coordinator}
                        onChange={e => setCoordinator(e.target.value)}
                        className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] font-bold"
                      />
                    </div>
                  </div>
                </div>

                {/* Section E: Açıklama */}
                <div className="p-4 rounded-xl bg-[#f1f4f7]/70 border border-[#E2E8F0] flex flex-col gap-2">
                  <label className="text-[11px] uppercase tracking-wider text-[#64748B] font-bold flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#00478F]" />
                    <span>E. Faaliyet Açıklaması & Notlar</span>
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Faaliyet detayı, protokol kapsamı ve hedeflenen çıktılar..."
                    className="w-full p-3 rounded-lg bg-white border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => alert('Taslak kaydedildi.')}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#f1f4f7] hover:bg-slate-200 text-[#1E293B] text-xs font-bold transition-colors border border-[#E2E8F0] w-full sm:w-auto justify-center cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#64748B]" />
                    <span>Taslak Olarak Kaydet</span>
                  </button>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="reset"
                      onClick={() => { setTitle(''); setDescription(''); }}
                      className="inline-flex items-center gap-1.5 h-10 px-3.5 rounded-lg text-[#64748B] hover:text-[#1E293B] text-xs font-semibold cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Temizle</span>
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#00478F] hover:bg-[#00356B] text-white text-xs font-bold shadow-md cursor-pointer transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Faaliyeti Kaydet ve Sisteme İşle</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Quick Operational Metrics Grid Below Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Distribution Widget */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1E293B]">Faaliyet Türü Dağılımı</h3>
                  <span className="text-xs text-[#00677d] font-bold">2026-2027 Güz</span>
                </div>
                <div className="flex flex-col gap-3 pt-1 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-[#1E293B]">Seminer & Konferanslar (%40)</span>
                      <span className="text-[#64748B]">19 Faaliyet • 1,840 Katılım</span>
                    </div>
                    <div className="w-full h-2 bg-[#f1f4f7] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-[#1E293B]">Teknik Geziler (%25)</span>
                      <span className="text-[#64748B]">12 Faaliyet • 365 Katılım</span>
                    </div>
                    <div className="w-full h-2 bg-[#f1f4f7] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#00677d] to-[#50d9fe] rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-[#1E293B]">Projeler (Ar-Ge & TÜBİTAK) (%19)</span>
                      <span className="text-[#64748B]">9 Faaliyet • ₺3.8M Hacim</span>
                    </div>
                    <div className="w-full h-2 bg-[#f1f4f7] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#10B981] to-[#059669] rounded-full" style={{ width: '19%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span className="text-[#1E293B]">Markalı Dersler (%16)</span>
                      <span className="text-[#64748B]">8 Faaliyet • 420 Öğrenci</span>
                    </div>
                    <div className="w-full h-2 bg-[#f1f4f7] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] rounded-full" style={{ width: '16%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Faculty Leadership Leaderboard */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#1E293B]">En Aktif Düzenleyen Birimler</h3>
                  <GraduationCap className="w-5 h-5 text-[#00677d]" />
                </div>
                <div className="flex flex-col gap-2.5 pt-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f1f4f7] text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#00478F] text-white flex items-center justify-center font-bold text-xs">1</span>
                      <div>
                        <div className="font-bold text-[#1E293B]">Teknoloji Transfer Ofisi (TTO)</div>
                        <div className="text-[11px] text-[#64748B]">Sanayi İş Birlikleri & Patentler</div>
                      </div>
                    </div>
                    <span className="font-bold text-[#00478F]">14 Faaliyet</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f1f4f7] text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#00677d] text-white flex items-center justify-center font-bold text-xs">2</span>
                      <div>
                        <div className="font-bold text-[#1E293B]">Müh.-Mimarlık / Bilgisayar & Makine</div>
                        <div className="text-[11px] text-[#64748B]">Teknik Geziler & Markalı Ders</div>
                      </div>
                    </div>
                    <span className="font-bold text-[#00677d]">11 Faaliyet</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#f1f4f7] text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-300 text-[#1E293B] flex items-center justify-center font-bold text-xs">3</span>
                      <div>
                        <div className="font-bold text-[#1E293B]">Sağlık Bilimleri & Eczacılık</div>
                        <div className="text-[11px] text-[#64748B]">Hastane Protokolleri & Vaka</div>
                      </div>
                    </div>
                    <span className="font-bold text-[#1E293B]">9 Faaliyet</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Inspector / Upcoming Column (4 Cols) */}
          <div className="xl:col-span-4 flex flex-col gap-5">
            {/* Expanded Yaklaşan Etkinlikler Card */}
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-md overflow-hidden flex flex-col">
              <div className="p-4 bg-[#f1f4f7]/70 border-b border-[#E2E8F0] flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#00478F] text-white flex items-center justify-center shrink-0 shadow-xs font-bold text-xs">
                      <CalendarIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-[#1E293B]">Yaklaşan Etkinlikler</h3>
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          4 Aktif
                        </span>
                      </div>
                      <p className="text-[10px] text-[#64748B]">Önümüzdeki 10 gün içerisindeki saha takvimi</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 flex flex-col gap-3">
                {/* Event 1: TEI */}
                <div className="p-3 rounded-xl bg-[#f1f4f7] border border-[#E2E8F0] hover:border-[#00478F]/40 transition-all flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-lg bg-[#00478F] text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                      <span className="text-[9px] uppercase font-bold text-blue-200 leading-none">KAS</span>
                      <span className="text-sm font-bold leading-tight mt-0.5">22</span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="px-1.5 py-0.2 rounded bg-blue-100 text-[#00478F] text-[9px] font-bold uppercase">Teknik Gezi</span>
                        <span className="text-[10px] font-bold text-rose-600">2 Gün Kaldı</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#1E293B] truncate mt-0.5">TEI Aviyonik & Motor Fabrikası Gezisi</h4>
                      <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                        <span className="flex items-center gap-0.5 truncate"><MapPin className="w-3 h-3 text-[#00677d]" /> Eskişehir</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3 text-[#00677d]" /> 07:30 Servis</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-[10px]">
                    <span className="font-semibold text-[#64748B]">65/65 Kontenjan Dolu</span>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('calendar')}
                      className="text-[#00478F] hover:text-[#00677d] font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      Detay <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Event 2: ASELSAN */}
                <div className="p-3 rounded-xl bg-[#f1f4f7] border border-[#E2E8F0] hover:border-emerald-200 transition-all flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-lg bg-emerald-600 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                      <span className="text-[9px] uppercase font-bold text-emerald-100 leading-none">KAS</span>
                      <span className="text-sm font-bold leading-tight mt-0.5">25</span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase">TÜBİTAK 2244</span>
                        <span className="text-[10px] text-[#64748B]">5 Gün Kaldı</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#1E293B] truncate mt-0.5">ASELSAN 2244 Doktora Ara Raporlama</h4>
                      <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                        <span className="flex items-center gap-0.5 truncate"><MapPin className="w-3 h-3 text-[#00677d]" /> TTO Ana Salon</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3 text-[#00677d]" /> 14:00</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-[10px]">
                    <span className="font-semibold text-[#64748B]">Doç. Dr. Ahmet Yılmaz & Heyet</span>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('calendar')}
                      className="text-[#00478F] hover:text-[#00677d] font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      Gündem <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Event 3: LC Waikiki */}
                <div className="p-3 rounded-xl bg-[#f1f4f7] border border-[#E2E8F0] hover:border-amber-200 transition-all flex flex-col gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-lg bg-amber-500 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                      <span className="text-[9px] uppercase font-bold text-amber-100 leading-none">KAS</span>
                      <span className="text-sm font-bold leading-tight mt-0.5">28</span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 text-[9px] font-bold uppercase">Zirve</span>
                        <span className="text-[10px] text-[#64748B]">8 Gün Kaldı</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#1E293B] truncate mt-0.5">LC Waikiki Perakendede Yapay Zeka</h4>
                      <div className="flex items-center gap-2 text-[11px] text-[#64748B] mt-0.5">
                        <span className="flex items-center gap-0.5 truncate"><MapPin className="w-3 h-3 text-[#00677d]" /> Cevizlibağ Salonu</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3 text-[#00677d]" /> 13:30</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-[10px]">
                    <span className="font-semibold text-[#64748B]">240 Kayıtlı Katılımcı</span>
                    <button
                      type="button"
                      onClick={() => onNavigateTab('calendar')}
                      className="text-[#00478F] hover:text-[#00677d] font-bold flex items-center gap-0.5 cursor-pointer"
                    >
                      Liste <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#f1f4f7] border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => onNavigateTab('calendar')}
                  className="w-full py-2 rounded-lg bg-white hover:bg-slate-50 border border-[#E2E8F0] text-center text-[#00478F] font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Tüm Faaliyet Takvimini Aç</span>
                </button>
              </div>
            </div>

            {/* Structured Card: Aktif Seçili Faaliyet Detayı */}
            <div className="bg-white rounded-xl shadow-xs border border-[#E2E8F0] overflow-hidden flex flex-col">
              <div className={`p-4 text-white ${
                selectedType === 'Proje'
                  ? 'bg-gradient-to-br from-[#059669] via-[#047857] to-[#065F46]'
                  : selectedType === 'Teknik Gezi'
                  ? 'bg-gradient-to-br from-[#0891B2] via-[#0E7490] to-[#155E75]'
                  : selectedType === 'Seminer & Zirve'
                  ? 'bg-gradient-to-br from-[#D97706] via-[#B45309] to-[#92400E]'
                  : selectedType === 'Diğer Kurumsal'
                  ? 'bg-gradient-to-br from-[#4F46E5] via-[#4338CA] to-[#3730A3]'
                  : 'bg-gradient-to-br from-[#00478F] via-[#003166] to-[#00677d]'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">
                    Aktif Seçili Faaliyet Detayı
                  </span>
                  <span className="text-[10px] text-white/80 font-mono">
                    {selectedType === 'Proje' ? '#PRJ-2026-08' : '#FL-2026-884'}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white leading-snug">
                  {title || 'Faaliyet Başlığı'}
                </h3>
                <p className="text-[11px] text-white/80 mt-0.5">
                  {department} • {selectedType}
                </p>
              </div>

              <div className="p-4 flex flex-col gap-3 text-xs">
                {selectedType === 'Proje' ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg bg-[#f1f4f7] flex flex-col">
                        <span className="text-[10px] uppercase text-[#64748B] font-bold">Proje Fonu</span>
                        <span className="text-xs font-bold text-emerald-700 mt-0.5">{projectBudget || '₺1.850.000'}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#f1f4f7] flex flex-col">
                        <span className="text-[10px] uppercase text-[#64748B] font-bold">Bursiyer Sayısı</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-bold text-[#00478F]">{scholarshipCount.split(' ')[0] || '3'} Araştırmacı</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/60">
                      <span className="text-[10px] uppercase tracking-wider text-emerald-800 font-bold">Destek Programı</span>
                      <div className="font-bold text-[#1E293B] text-xs">{fundingProgram}</div>
                    </div>

                    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-[#f1f4f7]">
                      <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-bold">Proje Yürütücüleri</span>
                      <div className="flex items-center gap-2 pt-0.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                          PR
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#1E293B] truncate">{academicLeader}</div>
                          <div className="text-[10px] text-[#64748B] truncate">{industryLeader}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-[11px] text-[#1E293B]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">{location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <span className="truncate">{projectDuration}</span>
                      </div>
                    </div>
                  </>
                ) : selectedType === 'Teknik Gezi' ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg bg-[#f1f4f7] flex flex-col">
                        <span className="text-[10px] uppercase text-[#64748B] font-bold">Katılımcı</span>
                        <span className="text-xs font-bold text-cyan-700 mt-0.5">{targetStudents} Öğrenci</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#f1f4f7] flex flex-col">
                        <span className="text-[10px] uppercase text-[#64748B] font-bold">Ulaşım</span>
                        <span className="text-xs font-bold text-[#00478F] mt-0.5 truncate">2 Otobüs Tahsis</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-[#f1f4f7]">
                      <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-bold">Ziyaret Tesisi & Yetkili</span>
                      <div className="font-bold text-[#1E293B] text-xs truncate">{tripFacility}</div>
                      <div className="text-[10px] text-[#64748B] truncate">{tripCoordinator}</div>
                    </div>

                    <div className="flex flex-col gap-1 text-[11px] text-[#1E293B]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                        <span className="truncate">{location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                        <span className="truncate">{departureTime || timeRange}</span>
                      </div>
                    </div>
                  </>
                ) : selectedType === 'Seminer & Zirve' ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg bg-[#f1f4f7] flex flex-col">
                        <span className="text-[10px] uppercase text-[#64748B] font-bold">Kapasite</span>
                        <span className="text-xs font-bold text-amber-700 mt-0.5">{targetStudents} Dinleyici</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#f1f4f7] flex flex-col">
                        <span className="text-[10px] uppercase text-[#64748B] font-bold">Format</span>
                        <span className="text-xs font-bold text-[#00478F] mt-0.5 truncate">{eventFormat}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-[#f1f4f7]">
                      <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-bold">Konuşmacı & Moderatör</span>
                      <div className="font-bold text-[#1E293B] text-xs truncate">{speakers}</div>
                      <div className="text-[10px] text-[#64748B] truncate">Moderatör: {moderator}</div>
                    </div>

                    <div className="flex flex-col gap-1 text-[11px] text-[#1E293B]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="truncate">{location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="truncate">{timeRange}</span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-lg bg-[#f1f4f7] flex flex-col">
                        <span className="text-[10px] uppercase text-[#64748B] font-bold">Ders Kodu & AKTS</span>
                        <span className="text-xs font-bold text-[#00478F] mt-0.5">{courseCode.split(' ')[0] || 'ECZ408'} • {ectsCredits.split(' ')[0] || '5'} AKTS</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-[#f1f4f7] flex flex-col">
                        <span className="text-[10px] uppercase text-[#64748B] font-bold">Katılım / Hedef</span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs font-bold text-emerald-600">%94.2</span>
                          <span className="text-[10px] text-[#64748B]">({targetStudents} Öğrenci)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-[#f1f4f7]">
                      <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-bold">Paydaş & Eğitmen</span>
                      <div className="flex items-center gap-2 pt-0.5">
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-[#00478F] flex items-center justify-center font-bold text-[10px]">
                          SE
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-[#1E293B] truncate">{instructor}</div>
                          <div className="text-[10px] text-[#64748B] truncate">{selectedCompany?.name || 'VEM İlaç'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-[11px] text-[#1E293B]">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#00677d] shrink-0" />
                        <span className="truncate">{location}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#00677d] shrink-0" />
                        <span className="truncate">{timeRange}</span>
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => alert(`${title} için katılım ve kayıt listesi hazırlanıyor...`)}
                  className="w-full h-8 rounded-lg bg-[#00478F] hover:bg-[#00356B] text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs mt-1"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Katılımcı / Yoklama Listesi ({targetStudents} Kayıt)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
