import React, { useState } from 'react';
import { Company, Activity, Meeting } from '../../types';
import { ExcelService } from '../../services/excelService';
import { 
  Building2, 
  Search, 
  Filter, 
  FileDown, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Phone, 
  Mail, 
  Calendar, 
  Users2, 
  Briefcase, 
  FileText, 
  GraduationCap, 
  Rocket, 
  Edit3, 
  MessageSquare,
  ChevronRight,
  ShieldCheck,
  BookOpen,
  Bus,
  Award
} from 'lucide-react';

interface CompaniesViewProps {
  companies: Company[];
  activities: Activity[];
  meetings: Meeting[];
  selectedCompanyId?: string;
  onSelectCompany: (company: Company) => void;
  onOpenNewCompanyModal: () => void;
  onOpenNewActivityModal: (companyId?: string) => void;
  onOpenNewMeetingModal: (companyId?: string) => void;
}

export const CompaniesView: React.FC<CompaniesViewProps> = ({
  companies,
  activities,
  meetings,
  selectedCompanyId,
  onSelectCompany,
  onOpenNewCompanyModal,
  onOpenNewActivityModal,
  onOpenNewMeetingModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('ALL');
  const [protocolFilter, setProtocolFilter] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState<'meetings' | 'activities' | 'interns' | 'documents'>('meetings');

  // Find active selected company
  const activeCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  // Filter companies list
  const filteredCompanies = companies.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.sector.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSector = sectorFilter === 'ALL' || c.sector.includes(sectorFilter);
    const matchesProtocol = protocolFilter === 'ALL' || c.protocolStatus === protocolFilter;

    return matchesSearch && matchesSector && matchesProtocol;
  });

  // Company specific activities & meetings
  const companyActivities = activities.filter(a => a.companyId === activeCompany?.id || a.companyName.includes(activeCompany?.name || ''));
  const companyMeetings = meetings.filter(m => m.companyId === activeCompany?.id || m.companyName.includes(activeCompany?.name || ''));

  return (
    <div className="flex flex-col w-full">
      {/* Page Header & Actions */}
      <section className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[#00677d] uppercase tracking-wider font-bold">
              Kurumsal İlişkiler & İş Birlikleri Portföyü
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2E8F0]"></span>
            <span className="text-xs text-[#64748B] font-semibold">ArelPro v2.4</span>
          </div>
          <h1 className="text-2xl font-bold text-[#00478F] tracking-tight">
            Firma Kartları & Kurumsal Portföy
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            İstanbul Arel Üniversitesi Kurumsal Ortaklar, Protokol Takibi ve Kurumsal Hafıza Sistemi
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => ExcelService.exportCompaniesToExcel(companies)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#1E293B] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <FileDown className="w-4 h-4 text-[#64748B]" />
            <span>Excel / RLX Dışa Aktar</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewCompanyModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00478F] hover:bg-[#00356B] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Yeni Firma Kaydı Ekle</span>
          </button>
        </div>
      </section>

      {/* Filter & Search Bar Ribbon */}
      <section className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Firma adı, sektör veya vergi/protokol no ara..."
              className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] text-xs text-[#1E293B] placeholder:text-[#64748B] focus:outline-none focus:border-[#00478F] transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Sector Selector */}
            <select
              value={sectorFilter}
              onChange={e => setSectorFilter(e.target.value)}
              className="h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] text-xs text-[#1E293B] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">Sektör: Tümü</option>
              <option value="İlaç">İlaç & Biyoteknoloji</option>
              <option value="Havacılık">Havacılık & Savunma</option>
              <option value="Sağlık">Sağlık Hizmetleri</option>
              <option value="Perakende">Perakende & Moda</option>
              <option value="Endüstri">Endüstri & Enerji</option>
            </select>

            {/* Protocol Selector */}
            <select
              value={protocolFilter}
              onChange={e => setProtocolFilter(e.target.value)}
              className="h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] text-xs text-[#1E293B] font-semibold focus:outline-none cursor-pointer"
            >
              <option value="ALL">Protokol: Tümü</option>
              <option value="Aktif">Protokol: Var (Aktif)</option>
              <option value="İmza Aşamasında">İmza Aşamasında</option>
              <option value="Müzakere">Müzakere Sürecinde</option>
              <option value="Pasif">Protokol Yok / Pasif</option>
            </select>

            <button
              type="button"
              onClick={() => { setSearchTerm(''); setSectorFilter('ALL'); setProtocolFilter('ALL'); }}
              className="p-2 h-10 w-10 flex items-center justify-center rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] hover:bg-slate-200 text-[#64748B] transition-colors"
              title="Filtreleri Sıfırla"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Master Detail Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Company Portfolio List (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#1E293B]">Portföy Listesi</span>
              <span className="px-2 py-0.5 rounded-full bg-[#ebeef1] text-[#424751] text-[10px] font-extrabold">
                {filteredCompanies.length} Firma
              </span>
            </div>
            <span className="text-[11px] text-[#00677d] font-semibold">Sırala: Kurumsal Skor</span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[820px] overflow-y-auto pr-1">
            {filteredCompanies.map(comp => {
              const isSelected = activeCompany?.id === comp.id;
              return (
                <div
                  key={comp.id}
                  onClick={() => onSelectCompany(comp)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-white border-[#00478F] shadow-md ring-1 ring-[#00478F]/20'
                      : 'bg-white border-[#E2E8F0] hover:bg-[#f1f4f7]/50 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs tracking-tight shrink-0 shadow-xs ${
                        isSelected ? 'bg-[#00478F] text-white' : 'bg-[#ebeef1] text-[#00478F]'
                      }`}>
                        {comp.shortName || comp.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-xs font-bold truncate ${isSelected ? 'text-[#00478F]' : 'text-[#1E293B]'}`}>
                          {comp.name}
                        </span>
                        <span className="text-[10px] text-[#64748B] truncate">Kod: {comp.code}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      comp.protocolStatus === 'Aktif'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : comp.protocolStatus === 'İmza Aşamasında'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${comp.protocolStatus === 'Aktif' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      {comp.protocolStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[#64748B] text-[11px] mt-2 pt-2 bg-[#f1f4f7]/60 rounded-lg px-2.5 py-1.5">
                    <span className="flex items-center gap-1 font-medium truncate max-w-[150px]">
                      <Briefcase className="w-3 h-3 text-[#00677d]" />
                      <span className="truncate">{comp.sector}</span>
                    </span>
                    <span className="text-[10px] text-[#00478F] font-bold shrink-0">
                      {comp.stats.totalActivities} Faaliyet / {comp.stats.totalMeetings} Toplantı
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Company Card (8 cols) */}
        {activeCompany ? (
          <div className="lg:col-span-8 flex flex-col gap-5">
            {/* Header Hero Banner */}
            <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col gap-4">
              <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-2 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-[#00478F] text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
                    {activeCompany.shortName || activeCompany.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#1E293B] truncate">
                        {activeCompany.name}
                      </h2>
                      <ShieldCheck className="w-5 h-5 text-[#00677d]" title="Doğrulanmış Kurumsal Partner" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#64748B]">
                      <span>{activeCompany.code}</span>
                      <span>•</span>
                      <span>{activeCompany.sector}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-bold">{activeCompany.protocolStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenNewActivityModal(activeCompany.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00478F] hover:bg-[#00356B] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Faaliyet Başlat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenNewMeetingModal(activeCompany.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00677d] hover:bg-[#005c70] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Toplantı Planla</span>
                  </button>
                </div>
              </div>

              {/* 4 Mini KPI Cards Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-lg bg-gradient-to-br from-[#00478F] to-[#003166] text-white relative overflow-hidden shadow-xs">
                  <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider block">Toplam Faaliyet</span>
                  <span className="text-2xl font-extrabold leading-tight mt-0.5 block">{activeCompany.stats.totalActivities}</span>
                  <BookOpen className="w-10 h-10 text-white/10 absolute right-1 -bottom-1 pointer-events-none" />
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] text-white relative overflow-hidden shadow-xs">
                  <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider block">Katılan Öğrenci</span>
                  <span className="text-2xl font-extrabold leading-tight mt-0.5 block">{activeCompany.stats.attendedStudents}</span>
                  <GraduationCap className="w-10 h-10 text-white/10 absolute right-1 -bottom-1 pointer-events-none" />
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-[#00677d] to-[#00478F] text-white relative overflow-hidden shadow-xs">
                  <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider block">Yapılan Toplantı</span>
                  <span className="text-2xl font-extrabold leading-tight mt-0.5 block">{activeCompany.stats.totalMeetings}</span>
                  <Users2 className="w-10 h-10 text-white/10 absolute right-1 -bottom-1 pointer-events-none" />
                </div>
                <div className="p-3 rounded-lg bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white relative overflow-hidden shadow-xs">
                  <span className="text-[10px] text-white/80 font-bold uppercase tracking-wider block">Aktif Stajyer</span>
                  <span className="text-2xl font-extrabold leading-tight mt-0.5 block">{activeCompany.stats.activeInterns}</span>
                  <Award className="w-10 h-10 text-white/10 absolute right-1 -bottom-1 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* 3 Key Info Structured Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Info Card 1: Kurumsal Bilgiler */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-2 bg-[#f1f4f7] px-2.5 py-1.5 rounded-lg">
                    <Building2 className="w-4 h-4 text-[#00478F]" />
                    <h3 className="text-xs font-bold text-[#00478F]">Kurumsal Bilgiler</h3>
                  </div>
                  <div className="flex flex-col gap-2.5 text-xs">
                    <div>
                      <span className="text-[#64748B] text-[10px] uppercase font-bold block">Ticari Ünvan</span>
                      <span className="text-[#1E293B] font-semibold">{activeCompany.name}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] text-[10px] uppercase font-bold block">Sektör</span>
                      <span className="text-[#1E293B] font-medium">{activeCompany.sector}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] text-[10px] uppercase font-bold block">Lokasyon / Adres</span>
                      <span className="text-[#1E293B] font-medium">{activeCompany.address}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] text-[10px] uppercase font-bold block">Resmi Web Portalı</span>
                      <a
                        href={activeCompany.website}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#00677d] hover:underline font-medium inline-flex items-center gap-1"
                      >
                        <span className="truncate max-w-[180px]">{activeCompany.website}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
                <div className="pt-3 mt-3 bg-[#f1f4f7]/60 rounded-lg p-2 text-center text-[11px] text-[#64748B]">
                  Ölçek: <strong>{activeCompany.scale}</strong>
                </div>
              </div>

              {/* Info Card 2: Firma Yetkilisi */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-2 bg-[#f1f4f7] px-2.5 py-1.5 rounded-lg">
                    <Users2 className="w-4 h-4 text-[#00677d]" />
                    <h3 className="text-xs font-bold text-[#00478F]">Firma Yetkilisi</h3>
                  </div>
                  <div className="flex flex-col gap-2.5 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#b3ebff] text-[#001f27] flex items-center justify-center font-bold text-xs shrink-0">
                        {activeCompany.contactPerson.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[#1E293B] font-bold truncate">{activeCompany.contactPerson.name}</span>
                        <span className="text-[#64748B] text-[11px] truncate">{activeCompany.contactPerson.title}</span>
                      </div>
                    </div>
                    <div className="mt-1">
                      <span className="text-[#64748B] text-[10px] uppercase font-bold block">Telefon</span>
                      <a href={`tel:${activeCompany.contactPerson.phone}`} className="text-[#1E293B] font-semibold hover:text-[#00478F] inline-flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#64748B]" />
                        <span>{activeCompany.contactPerson.phone}</span>
                      </a>
                    </div>
                    <div>
                      <span className="text-[#64748B] text-[10px] uppercase font-bold block">E-Posta</span>
                      <a href={`mailto:${activeCompany.contactPerson.email}`} className="text-[#00677d] hover:underline font-medium inline-flex items-center gap-1 truncate">
                        <Mail className="w-3.5 h-3.5 text-[#64748B]" />
                        <span className="truncate">{activeCompany.contactPerson.email}</span>
                      </a>
                    </div>
                    {activeCompany.contactPerson.secondaryContact && (
                      <div>
                        <span className="text-[#64748B] text-[10px] uppercase font-bold block">İkincil İrtibat</span>
                        <span className="text-[#1E293B] font-medium">{activeCompany.contactPerson.secondaryContact}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-2 mt-3">
                  <a
                    href={`https://wa.me/${activeCompany.contactPerson.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-1.5 px-2 rounded-lg bg-[#f1f4f7] hover:bg-slate-200 text-[#00478F] text-xs font-bold transition-colors inline-flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp / Mesaj İlet</span>
                  </a>
                </div>
              </div>

              {/* Info Card 3: Arel İlişki Yönetimi */}
              <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3 pb-2 bg-[#f1f4f7] px-2.5 py-1.5 rounded-lg">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-xs font-bold text-[#00478F]">Arel İlişki Yönetimi</h3>
                  </div>
                  <div className="flex flex-col gap-2 text-xs">
                    <div>
                      <span className="text-[#64748B] text-[10px] uppercase font-bold block">Arel İrtibat Sorumlusu</span>
                      <span className="text-[#1E293B] font-bold">{activeCompany.arelRepresentative.name}</span>
                      <span className="text-[#64748B] text-[11px] block">{activeCompany.arelRepresentative.title}</span>
                    </div>
                    <div>
                      <span className="text-[#64748B] text-[10px] uppercase font-bold block">Koordinasyon Birimi</span>
                      <span className="text-[#1E293B] font-medium">{activeCompany.arelRepresentative.coordinationUnit}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 bg-[#f1f4f7]/70 p-2 rounded-lg text-[11px]">
                      <div>
                        <span className="text-[#64748B] block text-[10px]">İmza Tarihi</span>
                        <span className="font-semibold text-[#1E293B]">{activeCompany.protocolSignDate || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] block text-[10px]">Yenileme Tarihi</span>
                        <span className="font-semibold text-[#00478F]">{activeCompany.protocolRenewDate || '-'}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[#64748B] text-[10px] uppercase font-bold block">Protokol Kapsamı</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {(activeCompany.protocolScope || ['İş Birliği']).map(scope => (
                          <span key={scope} className="px-1.5 py-0.5 rounded bg-[#ebeef1] text-[#424751] text-[10px] font-bold">
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="pt-2 mt-3 flex items-center justify-between text-[11px] text-[#64748B]">
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sözleşme Güncel</span>
                  </span>
                  <span className="font-semibold">Kalan: 582 gün</span>
                </div>
              </div>
            </div>

            {/* Sub-Tabs Section */}
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] shadow-xs flex flex-col gap-4">
              {/* Tab Selector */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-[#f1f4f7] p-1.5 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('meetings')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    activeSubTab === 'meetings' ? 'bg-white text-[#00478F] shadow-xs' : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-[#00677d]" />
                  <span>Toplantı Geçmişi ({companyMeetings.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('activities')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    activeSubTab === 'activities' ? 'bg-white text-[#00478F] shadow-xs' : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-[#00478F]" />
                  <span>Ortak Faaliyetler & Etkinlikler ({companyActivities.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('interns')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    activeSubTab === 'interns' ? 'bg-white text-[#00478F] shadow-xs' : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-emerald-600" />
                  <span>Öğrenci & Stajyer Takibi ({activeCompany.stats.activeInterns})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveSubTab('documents')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                    activeSubTab === 'documents' ? 'bg-white text-[#00478F] shadow-xs' : 'text-[#64748B] hover:text-[#1E293B]'
                  }`}
                >
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Protokol Belgeleri & Notlar</span>
                </button>
              </div>

              {/* Sub-Tab Content: Toplantı Geçmişi */}
              {activeSubTab === 'meetings' && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-bold text-[#1E293B]">Resmi Görüşme ve Toplantı Tutanakları</span>
                    <button
                      type="button"
                      onClick={() => onOpenNewMeetingModal(activeCompany.id)}
                      className="inline-flex items-center gap-1 text-xs text-[#00677d] hover:text-[#00478F] font-bold cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Yeni Toplantı Tutanağı Ekle</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#f1f4f7] text-[#64748B] font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Tarih</th>
                          <th className="py-2.5 px-3">Format / Yer</th>
                          <th className="py-2.5 px-3">Görüşülen Yetkili</th>
                          <th className="py-2.5 px-3">Arel Temsilcisi</th>
                          <th className="py-2.5 px-3">Görüşme Amacı & Alınan Kararlar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0]">
                        {companyMeetings.length > 0 ? (
                          companyMeetings.map((mtg, idx) => (
                            <tr key={mtg.id ? `${mtg.id}-${idx}` : `mtg-${idx}`} className="hover:bg-slate-50 transition-colors">
                              <td className="py-3 px-3 font-semibold text-[#00478F] whitespace-nowrap">
                                {mtg.date}
                                <span className="block text-[10px] text-[#64748B] font-normal">{mtg.timeRange}</span>
                              </td>
                              <td className="py-3 px-3 whitespace-nowrap">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f1f4f7] text-[#1E293B] text-[10px] font-bold">
                                  {mtg.format}
                                </span>
                              </td>
                              <td className="py-3 px-3 font-medium text-[#1E293B]">{mtg.companyAttendees}</td>
                              <td className="py-3 px-3 text-[#64748B]">{mtg.arelAttendees}</td>
                              <td className="py-3 px-3 max-w-sm">
                                <span className="font-bold text-[#1E293B] block">{mtg.title}</span>
                                <span className="text-[#64748B] text-[11px] line-clamp-2">{mtg.decisionsAndActions}</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-xs text-[#64748B]">
                              Bu firma ile henüz kaydedilmiş bir toplantı bulunmuyor. Yeni tutanak ekleyebilirsiniz.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub-Tab Content: Ortak Faaliyetler */}
              {activeSubTab === 'activities' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {companyActivities.length > 0 ? (
                    companyActivities.map(act => (
                      <div key={act.id} className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="px-2 py-0.5 rounded bg-blue-100 text-[#00478F] text-[10px] font-bold uppercase">
                              {act.type}
                            </span>
                            <span className="text-[10px] text-[#64748B] font-medium">{act.date}</span>
                          </div>
                          <h4 className="text-xs font-bold text-[#1E293B] line-clamp-2">{act.title}</h4>
                          <p className="text-[11px] text-[#64748B] mt-1 line-clamp-2">{act.description}</p>
                        </div>
                        <div className="mt-3 pt-2 bg-[#f1f4f7] rounded flex items-center justify-between text-[10px] px-2 py-1">
                          <span className="text-[#64748B]">Katılımcı / Hedef</span>
                          <span className="font-bold text-[#00478F]">{act.attendedStudents || act.targetStudents} Öğrenci</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-3 py-6 text-center text-xs text-[#64748B] border border-dashed rounded-xl">
                      Bu firmaya ait aktif faaliyet bulunmuyor. Yeni faaliyet ekleyebilirsiniz.
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab Content: Stajyer Takibi */}
              {activeSubTab === 'interns' && (
                <div className="p-4 rounded-xl bg-[#f1f4f7]/60 border border-[#E2E8F0] flex flex-col gap-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1E293B]">Aktif Stajyer & Bursiyer Listesi</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      {activeCompany.stats.activeInterns} Kontenjan Aktif
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-white rounded-lg border border-[#E2E8F0]">
                      <div className="font-bold text-[#1E293B]">Zeynep Kaya</div>
                      <div className="text-[11px] text-[#64748B]">Eczacılık Fakültesi 4. Sınıf • Ar-Ge Stajyeri</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-1">Staj Dönemi: Ekim 2026 - Ocak 2027</div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-[#E2E8F0]">
                      <div className="font-bold text-[#1E293B]">Mert Demir</div>
                      <div className="text-[11px] text-[#64748B]">Kimya Mühendisliği 4. Sınıf • Kalite Kontrol Stajyeri</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-1">Staj Dönemi: Ekim 2026 - Ocak 2027</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub-Tab Content: Belgeler & Notlar */}
              {activeSubTab === 'documents' && (
                <div className="flex flex-col gap-3 text-xs">
                  <div className="p-3.5 bg-[#f1f4f7] rounded-xl border border-[#E2E8F0] flex flex-col gap-2">
                    <span className="font-bold text-[#1E293B]">Kurumsal Hafıza ve Özel Notlar</span>
                    <p className="text-[#64748B] text-xs leading-relaxed">
                      {activeCompany.notes || 'Herhangi bir özel not bulunmuyor.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-[#E2E8F0]">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-red-500" />
                      <div>
                        <div className="font-bold text-[#1E293B]">İmzalı İş Birliği ve Protokol Metni.pdf</div>
                        <div className="text-[10px] text-[#64748B]">Ref: {activeCompany.protocolNumber || 'PRT-2024'} • 2.4 MB</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => alert('Protokol PDF belgesi indiriliyor...')}
                      className="px-3 py-1.5 rounded-lg bg-[#f1f4f7] hover:bg-slate-200 text-[#00478F] font-bold text-xs cursor-pointer"
                    >
                      İndir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
