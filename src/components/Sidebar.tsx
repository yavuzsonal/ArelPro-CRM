import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { 
  LayoutDashboard, 
  Building2, 
  CalendarCheck, 
  Users2, 
  Calendar, 
  Sparkles, 
  FileSpreadsheet, 
  Database, 
  FileCheck2, 
  ExternalLink, 
  Settings, 
  MoreVertical,
  LogOut,
  UserCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  onNavigate?: (tab: ActiveTab) => void;
  openAiModal?: () => void;
  onOpenAiModal?: () => void;
  companiesCount?: number;
  activitiesCount?: number;
  meetingsCount?: number;
  collapsed?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onNavigate, 
  openAiModal,
  onOpenAiModal,
  companiesCount = 0,
  activitiesCount = 0,
  meetingsCount = 0
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleNavigate = (tab: ActiveTab) => {
    setActiveTab?.(tab);
    onNavigate?.(tab);
  };

  const handleAi = () => {
    openAiModal?.();
    onOpenAiModal?.();
  };

  const isActive = (tab: string) => {
    if (activeTab === tab) return true;
    if (tab === 'db-sync' && activeTab === 'settings') return true;
    return false;
  };

  return (
    <aside className="w-[260px] shrink-0 h-screen bg-white border-r border-[#E2E8F0] flex flex-col justify-between select-none shadow-sm z-30 sticky top-0 overflow-y-auto">
      <div className="flex flex-col">
        {/* University Brand Header */}
        <div 
          onClick={() => handleNavigate('dashboard')}
          className="h-[68px] px-5 flex items-center gap-3 border-b border-[#E2E8F0] bg-white cursor-pointer hover:bg-slate-50/70 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center p-0.5 shrink-0 shadow-2xs overflow-hidden">
            <img 
              src={`${import.meta.env.BASE_URL}arel-logo.svg`}
              alt="İstanbul Arel Üniversitesi Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[17px] text-[#00478F] tracking-tight font-black truncate">ArelPro</span>
              <span className="px-1.5 py-0.5 rounded-full bg-[#b3ebff] text-[#001f27] text-[10px] font-bold uppercase tracking-wider">
                CRM
              </span>
            </div>
            <span className="text-[11px] text-[#64748B] truncate font-medium">Kurumsal İlişkiler & Faaliyet</span>
          </div>
        </div>

        {/* Navigation Sections */}
        <div className="px-2 py-4 flex flex-col gap-4">
          {/* Main Menu */}
          <div className="flex flex-col gap-0.5">
            <span className="px-3 text-[10px] text-[#64748B] uppercase tracking-wider font-bold mb-1">
              Ana Menü
            </span>
            <nav className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={() => handleNavigate('dashboard')}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left cursor-pointer ${
                  isActive('dashboard')
                    ? 'bg-[#f1f4f7] text-[#00478F] font-bold border-l-[3px] border-[#00B4D8]'
                    : 'text-[#64748B] hover:bg-[#f1f4f7] hover:text-[#181c1e] font-medium'
                }`}
              >
                <LayoutDashboard className={`w-[18px] h-[18px] ${isActive('dashboard') ? 'text-[#00478F]' : 'text-[#64748B]'}`} />
                <span className="truncate">Dashboard / Genel Bakış</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('companies')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all text-left cursor-pointer ${
                  isActive('companies')
                    ? 'bg-[#f1f4f7] text-[#00478F] font-bold border-l-[3px] border-[#00B4D8]'
                    : 'text-[#64748B] hover:bg-[#f1f4f7] hover:text-[#181c1e] font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Building2 className={`w-[18px] h-[18px] shrink-0 ${isActive('companies') ? 'text-[#00478F]' : 'text-[#64748B]'}`} />
                  <span className="truncate">Firma Kartları & Portföy</span>
                </div>
                {companiesCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-[#00478F] text-[10px] font-bold shrink-0">
                    {companiesCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('activities')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all text-left cursor-pointer ${
                  isActive('activities')
                    ? 'bg-[#f1f4f7] text-[#00478F] font-bold border-l-[3px] border-[#00B4D8]'
                    : 'text-[#64748B] hover:bg-[#f1f4f7] hover:text-[#181c1e] font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CalendarCheck className={`w-[18px] h-[18px] shrink-0 ${isActive('activities') ? 'text-[#00478F]' : 'text-[#64748B]'}`} />
                  <span className="truncate">Faaliyet Yönetimi</span>
                </div>
                {activitiesCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold shrink-0">
                    {activitiesCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('meetings')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all text-left cursor-pointer ${
                  isActive('meetings')
                    ? 'bg-[#f1f4f7] text-[#00478F] font-bold border-l-[3px] border-[#00B4D8]'
                    : 'text-[#64748B] hover:bg-[#f1f4f7] hover:text-[#181c1e] font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Users2 className={`w-[18px] h-[18px] shrink-0 ${isActive('meetings') ? 'text-[#00478F]' : 'text-[#64748B]'}`} />
                  <span className="truncate">Toplantı & Görüşmeler</span>
                </div>
                {meetingsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold shrink-0">
                    {meetingsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('calendar')}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all text-left cursor-pointer ${
                  isActive('calendar')
                    ? 'bg-[#f1f4f7] text-[#00478F] font-bold border-l-[3px] border-[#00B4D8]'
                    : 'text-[#64748B] hover:bg-[#f1f4f7] hover:text-[#181c1e] font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className={`w-[18px] h-[18px] ${isActive('calendar') ? 'text-[#00478F]' : 'text-[#64748B]'}`} />
                  <span className="truncate">Zaman Akışı (Takvim)</span>
                </div>
                <span className="px-1.5 py-0.2 rounded-full bg-[#00478F] text-white text-[9px] font-bold">
                  Canlı
                </span>
              </button>
            </nav>
          </div>

          {/* Operations & Data */}
          <div className="flex flex-col gap-0.5">
            <span className="px-3 text-[10px] text-[#64748B] uppercase tracking-wider font-bold mb-1">
              İşlemler & Veri Entegrasyonu
            </span>
            <nav className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={handleAi}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm text-[#64748B] hover:bg-[#f1f4f7] hover:text-[#181c1e] transition-all text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Sparkles className="w-[18px] h-[18px] text-amber-500 shrink-0" />
                  <span className="truncate text-xs font-semibold text-[#1E293B]">AI Asistan ile Hızlı Kayıt</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold tracking-tight shrink-0 border border-amber-200">
                  Gemini
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('excel-sync')}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left cursor-pointer ${
                  isActive('excel-sync')
                    ? 'bg-[#f1f4f7] text-[#00478F] font-bold border-l-[3px] border-[#00B4D8]'
                    : 'text-[#64748B] hover:bg-[#f1f4f7] hover:text-[#181c1e] font-medium'
                }`}
              >
                <FileSpreadsheet className={`w-[18px] h-[18px] ${isActive('excel-sync') ? 'text-[#00478F]' : 'text-[#64748B]'}`} />
                <span className="truncate text-xs">Excel / RLX İçe Aktar</span>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('db-sync')}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left cursor-pointer ${
                  isActive('db-sync')
                    ? 'bg-[#f1f4f7] text-[#00478F] font-bold border-l-[3px] border-[#00B4D8]'
                    : 'text-[#64748B] hover:bg-[#f1f4f7] hover:text-[#181c1e] font-medium'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Database className={`w-[18px] h-[18px] ${isActive('db-sync') ? 'text-[#00478F]' : 'text-[#64748B]'}`} />
                  <span className="truncate text-xs">Veritabanı Entegrasyonu</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </button>
            </nav>
          </div>

          {/* System & Protocols */}
          <div className="flex flex-col gap-0.5">
            <span className="px-3 text-[10px] text-[#64748B] uppercase tracking-wider font-bold mb-1">
              Sistem & Entegrasyon
            </span>
            <nav className="flex flex-col gap-0.5">
              <a
                id="nav-protocols-rlx"
                href="https://rlx.arel.edu.tr"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all text-left cursor-pointer text-[#64748B] hover:bg-[#f1f4f7] hover:text-[#00478F] font-medium group"
                title="Arel RLX Protokol Yönetim Portalı (rlx.arel.edu.tr) - Yeni Sekmede Aç"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileCheck2 className="w-[18px] h-[18px] text-[#64748B] group-hover:text-[#00478F] transition-colors" />
                  <span className="truncate text-xs">Protokol Yönetimi</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#00478F] border border-blue-200">
                    RLX
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00478F] transition-colors" />
                </div>
              </a>

              <button
                type="button"
                onClick={() => handleNavigate('settings')}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all text-left cursor-pointer ${
                  isActive('settings')
                    ? 'bg-[#f1f4f7] text-[#00478F] font-bold border-l-[3px] border-[#00B4D8]'
                    : 'text-[#64748B] hover:bg-[#f1f4f7] hover:text-[#181c1e] font-medium'
                }`}
              >
                <Settings className="w-[18px] h-[18px] text-[#64748B]" />
                <span className="truncate text-xs">Ayarlar & API</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-[#E2E8F0] flex flex-col gap-2 bg-white relative">
        <div className="flex items-center justify-between px-1">
          <span className="px-2 py-0.5 rounded-md bg-[#ebeef1] text-[#424751] text-[10px] font-bold">
            PRO TIER
          </span>
          <span className="text-[11px] text-[#64748B] font-semibold">v2.4.0</span>
        </div>

        <div 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="flex items-center gap-2.5 p-2 rounded-lg bg-[#f1f4f7] hover:bg-slate-200 transition-colors border border-[#E2E8F0] cursor-pointer"
        >
          <div className="relative w-9 h-9 rounded-full bg-[#00478F] text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-xs">
            YS
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs text-[#1E293B] font-bold truncate">Yavuz Selim Önal</span>
            <span className="text-[10px] text-[#64748B] truncate font-medium">Kurumsal İlişkiler Yöneticisi</span>
          </div>
          <button 
            type="button" 
            className="text-[#64748B] hover:text-[#1E293B] transition-colors p-1 cursor-pointer" 
            title="Profil Menüsü"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Popover Menu */}
        {showProfileMenu && (
          <div className="absolute bottom-16 left-3 right-3 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-2 flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-bottom-2">
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu(false);
                handleNavigate('settings');
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#1E293B] hover:bg-[#f1f4f7] text-left cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 text-[#64748B]" />
              <span>Hesap & Sistem Ayarları</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowProfileMenu(false);
                handleAi();
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[#00478F] hover:bg-blue-50 text-left cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Asistanı Başlat</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
