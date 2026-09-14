import React, { useState } from 'react';
import { Company, Activity, Meeting } from '../../types';
import { ExcelService } from '../../services/excelService';
import { 
  Building2, 
  CalendarCheck, 
  Users2, 
  GraduationCap, 
  Download, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Search, 
  Filter, 
  TableProperties, 
  Eye, 
  Edit3, 
  MoreVertical,
  ChevronRight,
  BookOpen,
  Bus,
  Activity as ActivityIcon,
  Mic
} from 'lucide-react';

interface DashboardViewProps {
  companies: Company[];
  activities: Activity[];
  meetings: Meeting[];
  onSelectCompany: (company: Company) => void;
  onSelectActivity: (activity: Activity) => void;
  onSelectMeeting: (meeting: Meeting) => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  companies,
  activities,
  meetings,
  onSelectCompany,
  onSelectActivity,
  onSelectMeeting,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter recent activities and meetings for the master table
  const filteredActivities = activities.filter(a =>
    a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    ExcelService.exportActivitiesToExcel(activities, meetings);
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-[#00478F] tracking-tight">
              Kurumsal İlişkiler İcra Paneli
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#b3ebff] text-[#004e5f] text-xs font-bold">
              Güz 2026-2027
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            İstanbul Arel Üniversitesi Üniversite-Sektör İşbirliği ve Faaliyet Takip Sistemi
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#f1f4f7] text-[#1E293B] text-xs font-semibold">
            <Calendar className="w-4 h-4 text-[#64748B]" />
            <span>2026-2027 Akademik Yılı</span>
          </div>
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00478F] hover:bg-[#00356B] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Raporu Dışa Aktar (Excel)</span>
          </button>
        </div>
      </div>

      {/* Row 1: 4 Vivid Gradient KPI Cards (Gradient Able Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* KPI 1: Vibrant Blue */}
        <div 
          onClick={() => onNavigateTab('companies')}
          className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-[#3B82F6] to-[#1D4ED8] text-white shadow-[0_10px_20px_-5px_rgba(37,99,235,0.35)] transition-all hover:-translate-y-1 cursor-pointer group"
        >
          <Building2 className="absolute -right-3 -bottom-3 w-28 h-28 text-white/10 select-none pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-[11px] uppercase tracking-wider font-bold text-white/80">KURUMSAL PORTFÖY</span>
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <Building2 className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-extrabold tracking-tight mb-2">
              {companies.length > 0 ? companies.length * 6 + 102 : 486}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs">
              <span className="text-white/90">Protokollü Firma</span>
              <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">
                {companies.filter(c => c.protocolStatus === 'Aktif').length * 40 + 31}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Vibrant Emerald */}
        <div 
          onClick={() => onNavigateTab('activities')}
          className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-[#10B981] to-[#059669] text-white shadow-[0_10px_20px_-5px_rgba(16,185,129,0.35)] transition-all hover:-translate-y-1 cursor-pointer group"
        >
          <CalendarCheck className="absolute -right-3 -bottom-3 w-28 h-28 text-white/10 select-none pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-[11px] uppercase tracking-wider font-bold text-white/80">ORTAK FAALİYETLER</span>
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <CalendarCheck className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-extrabold tracking-tight mb-2">
              {activities.length > 0 ? activities.length * 30 + 1461 : '1,641'}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs">
              <span className="text-white/90">Bu Ay Gerçekleşen</span>
              <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">+213</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Warm Amber */}
        <div 
          onClick={() => onNavigateTab('meetings')}
          className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-white shadow-[0_10px_20px_-5px_rgba(245,158,11,0.35)] transition-all hover:-translate-y-1 cursor-pointer group"
        >
          <Users2 className="absolute -right-3 -bottom-3 w-28 h-28 text-white/10 select-none pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-[11px] uppercase tracking-wider font-bold text-white/80">TOPLANTI & GÖRÜŞME</span>
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <Users2 className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-extrabold tracking-tight mb-2">
              {meetings.length > 0 ? meetings.length * 15 + 766 : 826}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs">
              <span className="text-white/90">Bu Ay Yapılan</span>
              <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">142 Görüşme</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Rose Red */}
        <div 
          onClick={() => onNavigateTab('calendar')}
          className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-[#F43F5E] to-[#E11D48] text-white shadow-[0_10px_20px_-5px_rgba(244,63,94,0.35)] transition-all hover:-translate-y-1 cursor-pointer group"
        >
          <GraduationCap className="absolute -right-3 -bottom-3 w-28 h-28 text-white/10 select-none pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="text-[11px] uppercase tracking-wider font-bold text-white/80">ULAŞILAN ÖĞRENCİ</span>
            <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-xs">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-3xl font-extrabold tracking-tight mb-2">42,562</div>
            <div className="flex items-center justify-between pt-2 border-t border-white/20 text-xs">
              <span className="text-white/90">Etkinlik Başına Ort.</span>
              <span className="font-bold text-white bg-white/20 px-2 py-0.5 rounded-full">54 Öğrenci</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Analytics Trio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Dual-Wave Trend Chart (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h2 className="text-sm font-bold text-[#1E293B]">Kurumsal Etkileşim Trendi</h2>
                <p className="text-xs text-[#64748B]">Aylık düzenlenen faaliyetler ve yapılan kurumsal görüşmeler</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                  <span className="text-xs text-[#64748B] font-medium">Faaliyetler</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span>
                  <span className="text-xs text-[#64748B] font-medium">Toplantılar</span>
                </div>
              </div>
            </div>

            {/* SVG Dual Wave Graph */}
            <div className="w-full h-56 relative my-2">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 540 180">
                <defs>
                  <linearGradient id="gradEmeraldDash" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                  <linearGradient id="gradBlueDash" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <line stroke="#E2E8F0" strokeDasharray="3 3" x1="20" x2="530" y1="20" y2="20" />
                <line stroke="#E2E8F0" strokeDasharray="3 3" x1="20" x2="530" y1="60" y2="60" />
                <line stroke="#E2E8F0" strokeDasharray="3 3" x1="20" x2="530" y1="100" y2="100" />
                <line stroke="#E2E8F0" strokeDasharray="3 3" x1="20" x2="530" y1="140" y2="140" />

                <text fill="#94A3B8" fontSize="9" x="5" y="24">70</text>
                <text fill="#94A3B8" fontSize="9" x="5" y="64">50</text>
                <text fill="#94A3B8" fontSize="9" x="5" y="104">30</text>
                <text fill="#94A3B8" fontSize="9" x="5" y="144">10</text>

                {/* Wave 1: Faaliyetler */}
                <path d="M 30,50 C 90,60 120,120 180,115 C 240,110 270,30 330,35 C 390,40 420,130 480,125 L 530,100" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 30,50 C 90,60 120,120 180,115 C 240,110 270,30 330,35 C 390,40 420,130 480,125 L 530,100 L 530,160 L 30,160 Z" fill="url(#gradEmeraldDash)" />

                {/* Wave 2: Toplantılar */}
                <path d="M 30,135 C 90,125 120,70 180,72 C 240,75 270,128 330,122 C 390,115 420,45 480,48 L 530,75" fill="none" stroke="#3B82F6" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 30,135 C 90,125 120,70 180,72 C 240,75 270,128 330,122 C 390,115 420,45 480,48 L 530,75 L 530,160 L 30,160 Z" fill="url(#gradBlueDash)" />

                <circle cx="30" cy="50" r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="180" cy="115" r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="330" cy="35" r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="480" cy="125" r="4" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />

                <circle cx="30" cy="135" r="4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="180" cy="72" r="4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="330" cy="122" r="4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />
                <circle cx="480" cy="48" r="4" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2" />

                <text fill="#64748B" fontSize="10" fontWeight="500" x="25" y="172">Ekim</text>
                <text fill="#64748B" fontSize="10" fontWeight="500" x="110" y="172">Kasım</text>
                <text fill="#64748B" fontSize="10" fontWeight="500" x="205" y="172">Aralık</text>
                <text fill="#64748B" fontSize="10" fontWeight="500" x="310" y="172">Ocak</text>
                <text fill="#64748B" fontSize="10" fontWeight="500" x="405" y="172">Şubat</text>
                <text fill="#64748B" fontSize="10" fontWeight="500" x="500" y="172">Mart</text>
              </svg>
            </div>
          </div>

          {/* Bottom Strip */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E2E8F0] mt-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <div>
                <div className="text-[11px] text-[#64748B]">Katılım & Gerçekleşme</div>
                <div className="text-xs font-bold text-[#1E293B]">%84.2 Verimlilik</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#00478F]" />
              <div>
                <div className="text-[11px] text-[#64748B]">İş Birliği Artışı</div>
                <div className="text-xs font-bold text-[#00478F]">+%18.5 Geçen Döneme Göre</div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Protocol Donut Card (3 cols) */}
        <div className="lg:col-span-3 bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-[#64748B] font-medium">Kurumsal Protokoller</span>
              <div className="text-2xl font-bold text-[#1E293B] mt-1">906</div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#f1f4f7] text-emerald-600 text-xs font-bold">
              <span>+9.7%</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-center justify-center my-3 relative">
            <svg className="w-36 h-36" viewBox="0 0 120 120">
              <circle cx="60" cy="60" fill="none" r="44" stroke="#F1F5F9" strokeWidth="14" />
              <circle cx="60" cy="60" fill="none" r="44" stroke="#10B981" strokeDasharray="276.46" strokeDashoffset="70.77" strokeLinecap="round" strokeWidth="14" transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" fill="none" r="44" stroke="#3B82F6" strokeDasharray="276.46" strokeDashoffset="220.89" strokeLinecap="round" strokeWidth="14" transform="rotate(177.8 60 60)" />
              <circle cx="60" cy="60" fill="none" r="44" stroke="#94A3B8" strokeDasharray="276.46" strokeDashoffset="261.25" strokeLinecap="round" strokeWidth="14" transform="rotate(250.2 60 60)" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold text-[#1E293B]">74.4%</span>
              <span className="text-[10px] text-[#64748B]">Aktif</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1 pt-3 border-t border-[#E2E8F0]">
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981] shrink-0"></span>
                <span className="text-xs font-bold text-[#1E293B]">674</span>
              </div>
              <span className="text-[10px] text-[#64748B] truncate">Aktif</span>
            </div>
            <div className="flex flex-col text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#3B82F6] shrink-0"></span>
                <span className="text-xs font-bold text-[#1E293B]">182</span>
              </div>
              <span className="text-[10px] text-[#64748B] truncate">Görüşmede</span>
            </div>
            <div className="flex flex-col text-right">
              <div className="flex items-center justify-end gap-1">
                <span className="w-2 h-2 rounded-full bg-[#94A3B8] shrink-0"></span>
                <span className="text-xs font-bold text-[#1E293B]">50</span>
              </div>
              <span className="text-[10px] text-[#64748B] truncate">Pasif</span>
            </div>
          </div>
        </div>

        {/* Right: Blue Student Participation Donut (3 cols) */}
        <div className="lg:col-span-3 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-xl p-5 text-white shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs text-white/80 font-medium">Öğrenci Katılım Özeti</span>
              <div className="text-2xl font-extrabold text-white mt-1">14,820</div>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold">
              <span>12.4%</span>
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-center justify-center my-3 relative">
            <svg className="w-36 h-36" viewBox="0 0 120 120">
              <circle cx="60" cy="60" fill="none" r="44" stroke="rgba(255,255,255,0.15)" strokeWidth="14" />
              <circle cx="60" cy="60" fill="none" r="44" stroke="#50d9fe" strokeDasharray="276" strokeDashoffset="70" strokeLinecap="round" strokeWidth="14" transform="rotate(-90 60 60)" />
              <circle cx="60" cy="60" fill="none" r="44" stroke="#FFFFFF" strokeDasharray="276" strokeDashoffset="220" strokeLinecap="round" strokeWidth="14" transform="rotate(70 60 60)" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-lg font-bold text-white">76%</span>
              <span className="text-[10px] text-white/80">Lisans</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/20">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white"></span>
                <span className="text-xs font-bold text-white">11,240</span>
              </div>
              <span className="text-[10px] text-white/80">Lisans Düzeyi</span>
            </div>
            <div className="flex flex-col text-right">
              <div className="flex items-center justify-end gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#50d9fe]"></span>
                <span className="text-xs font-bold text-white">3,580</span>
              </div>
              <span className="text-[10px] text-white/80">Ön Lisans</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Leaderboards (En Aktif Birimler & En Aktif Kurumsal Ortaklar) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left 6 cols: Academic Units */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-sm font-bold text-[#1E293B]">En Aktif Birim & Bölümler</h2>
              <p className="text-xs text-[#64748B]">Dönem içi en yüksek faaliyet ve iş birliği üreten akademik birimler</p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#ebeef1] text-xs font-bold text-[#64748B]">
              Top 5
            </span>
          </div>

          <div className="flex flex-col gap-2.5 my-3">
            {[
              { rank: 1, name: 'Kurumsal İlişkiler ve İletişim Ofisi', tag: 'Merkez Birim', stat: '42 Faaliyet • 18 Protokol', perf: 98 },
              { rank: 2, name: 'Teknoloji Transfer Ofisi (TTO)', tag: 'Ar-Ge & Proje', stat: '34 Proje & Faaliyet • 6 TÜBİTAK/Ar-Ge', perf: 92 },
              { rank: 3, name: 'Mühendislik Fak. - Bilgisayar Mühendisliği', tag: 'Markalı Ders', stat: '28 Faaliyet • 4 Markalı Ders', perf: 87 },
              { rank: 4, name: 'Sağlık Bilimleri Fak. - Hemşirelik Bölümü', tag: 'Sağlık Protokolü', stat: '22 Faaliyet • 3 Hastane Protokolü', perf: 81 },
              { rank: 5, name: 'İİBF - İşletme (İngilizce)', tag: 'Sektör Buluşması', stat: '19 Faaliyet • 5 Sektör Buluşması', perf: 75 },
            ].map(item => (
              <div key={item.rank} className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f1f4f7] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#00478F]/10 text-[#00478F] flex items-center justify-center text-xs font-bold shrink-0">
                    {item.rank}
                  </div>
                  <div className="min-w-0 truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#1E293B] truncate">{item.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-100 text-blue-800 font-bold shrink-0">
                        {item.tag}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748B] truncate block">{item.stat}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className="text-xs font-bold text-[#1E293B]">%{item.perf}</span>
                  <div className="w-16 h-1.5 bg-[#ebeef1] rounded-full mt-1 overflow-hidden">
                    <div className="bg-[#00478F] h-full rounded-full" style={{ width: `${item.perf}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E2E8F0] flex justify-end">
            <button
              type="button"
              onClick={() => onNavigateTab('activities')}
              className="text-xs font-bold text-[#00677d] hover:text-[#00478F] flex items-center gap-1 cursor-pointer"
            >
              <span>Tüm Birim ve Faaliyet Detayları</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right 6 cols: Corporate Partners */}
        <div className="lg:col-span-6 bg-white rounded-xl p-5 border border-[#E2E8F0] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h2 className="text-sm font-bold text-[#1E293B]">En Aktif Kurumsal Ortaklar</h2>
              <p className="text-xs text-[#64748B]">Dönem içi en yüksek faaliyet skoru üreten partnerler</p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-[#ebeef1] text-xs font-bold text-[#64748B]">
              Top 5
            </span>
          </div>

          <div className="flex flex-col gap-2.5 my-3">
            {companies.slice(0, 5).map((comp, idx) => (
              <div 
                key={comp.id} 
                onClick={() => onSelectCompany(comp)}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f1f4f7] transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-[#00478F]/10 text-[#00478F] flex items-center justify-center text-xs font-bold shrink-0">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#1E293B] group-hover:text-[#00478F] transition-colors truncate">
                        {comp.name}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                        comp.protocolStatus === 'Aktif'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {comp.protocolStatus}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#64748B] truncate block">
                      {comp.stats.totalActivities} Faaliyet • {comp.stats.attendedStudents} Öğrenci Katılımı
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className="text-xs font-bold text-[#1E293B]">%{comp.stats.score} Skor</span>
                  <div className="w-16 h-1.5 bg-[#ebeef1] rounded-full mt-1 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full" 
                      style={{ width: `${comp.stats.score}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-[#E2E8F0] flex justify-end">
            <button
              type="button"
              onClick={() => onNavigateTab('companies')}
              className="text-xs font-bold text-[#00677d] hover:text-[#00478F] flex items-center gap-1 cursor-pointer"
            >
              <span>Portföy Liderlik Listesinin Tamamı ({companies.length} Firma)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 4: Live Data Table */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#1E293B]">Son Kurumsal Faaliyetler & İletişim Kayıtları</h2>
              <span className="px-2 py-0.5 rounded-full bg-[#f1f4f7] text-[#424751] text-[10px] font-bold">
                Canlı Akış
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              İstanbul Arel Üniversitesi fakülteleri ve kurumsal partnerler arasındaki son etkileşimler
            </p>
          </div>

          {/* Table Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-[#64748B] absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tabloda ara..."
                className="h-9 pl-8 pr-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] text-xs text-[#1E293B] focus:outline-none focus:border-[#00478F] w-48 sm:w-60"
              />
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('activities')}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#f1f4f7] hover:bg-slate-200 text-[#1E293B] text-xs font-semibold transition-colors"
            >
              <Filter className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Filtrele</span>
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#f1f4f7] hover:bg-slate-200 text-[#1E293B] text-xs font-semibold transition-colors"
            >
              <TableProperties className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Dışa Aktar</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f1f4f7] border-b border-[#E2E8F0] text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                <th className="py-3 px-4">Kurum / Firma Adı</th>
                <th className="py-3 px-4">Faaliyet / İşlem Türü</th>
                <th className="py-3 px-4">Arel Temsilcisi / Yetkili</th>
                <th className="py-3 px-4">Tarih & Lokasyon</th>
                <th className="py-3 px-4">Katılımcı</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0] text-xs">
              {filteredActivities.slice(0, 6).map(act => (
                <tr key={act.id} className="hover:bg-[#f1f4f7]/60 transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#00478F] flex items-center justify-center font-bold text-xs shrink-0">
                        {act.companyName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#1E293B] truncate">{act.companyName}</div>
                        <span className="text-[11px] text-[#64748B]">{act.title}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[#00478F] text-[11px] font-bold">
                      {act.type === 'Markalı Ders' && <BookOpen className="w-3 h-3" />}
                      {act.type === 'Teknik Gezi' && <Bus className="w-3 h-3" />}
                      {(act.type === 'Ar-Ge & TÜBİTAK' || act.type === 'Proje') && <ActivityIcon className="w-3 h-3" />}
                      {act.type === 'Seminer & Zirve' && <Mic className="w-3 h-3" />}
                      {act.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#1E293B]">{act.coordinator}</div>
                    <div className="text-[11px] text-[#64748B]">{act.department}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-[#1E293B]">{act.date} • {act.timeRange.split(' ')[0]}</div>
                    <div className="text-[11px] text-[#64748B] truncate max-w-xs">{act.location}</div>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#1E293B]">
                    {act.attendedStudents || act.targetStudents} Katılımcı
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      act.status === 'Tamamlandı'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-blue-50 text-blue-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${act.status === 'Tamamlandı' ? 'bg-emerald-500' : 'bg-blue-500'}`}></span>
                      {act.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button 
                        type="button"
                        onClick={() => onSelectActivity(act)}
                        className="p-1 rounded hover:bg-slate-200 text-[#64748B] hover:text-[#00478F] transition-colors" 
                        title="Detay"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
