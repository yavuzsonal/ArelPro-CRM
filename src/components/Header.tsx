import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  MessageSquare, 
  ChevronDown, 
  Sparkles, 
  Building2, 
  CalendarCheck, 
  Users2, 
  Settings,
  X,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { Company, Activity, Meeting } from '../types';

interface HeaderProps {
  onOpenAiModal: () => void;
  onNavigateSettings: () => void;
  onOpenNewCompanyModal: () => void;
  onOpenNewMeetingModal: () => void;
  onOpenNewActivityModal?: () => void;
  companies?: Company[];
  onSelectCompany?: (comp: Company) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAiModal,
  onNavigateSettings,
  onOpenNewCompanyModal,
  onOpenNewMeetingModal,
  onOpenNewActivityModal,
  companies = [],
  onSelectCompany,
}) => {
  const [showNewMenu, setShowNewMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = searchQuery.trim()
    ? companies.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contactPerson.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header className="w-full h-[68px] bg-white border-b border-[#E2E8F0] px-4 md:px-6 flex items-center justify-between shadow-2xs shrink-0 sticky top-0 z-20">
      {/* Search Bar */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              if (e.target.value.trim()) setShowSearchModal(true);
            }}
            onFocus={() => setShowSearchModal(true)}
            placeholder="Firma, yetkili, protokol veya sektör ara..."
            className="w-full h-10 pl-9 pr-14 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] text-xs text-[#1E293B] placeholder:text-[#64748B] hover:bg-slate-100 transition-all font-medium focus:outline-none focus:border-[#00478F] focus:bg-white"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setShowSearchModal(false);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#64748B] hover:text-[#1E293B] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-[#E2E8F0] bg-white text-[#64748B] text-[10px] font-bold shadow-2xs pointer-events-none">
              Ctrl+K
            </kbd>
          )}

          {/* Search Dropdown / Live Results */}
          {showSearchModal && searchQuery.trim() && (
            <div className="absolute top-12 left-0 right-0 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-2 z-50 max-h-80 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                Eşleşen Firmalar ({searchResults.length})
              </div>
              {searchResults.length > 0 ? (
                searchResults.map(comp => (
                  <div
                    key={comp.id}
                    onClick={() => {
                      onSelectCompany?.(comp);
                      setShowSearchModal(false);
                      setSearchQuery('');
                    }}
                    className="p-2.5 rounded-lg hover:bg-blue-50/60 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-bold text-xs text-[#1E293B]">{comp.name}</div>
                      <div className="text-[11px] text-[#64748B]">{comp.sector} • Yetkili: {comp.contactPerson.name}</div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#00478F]">
                      {comp.protocolStatus}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-[#64748B]">
                  "{searchQuery}" için sonuç bulunamadı.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 relative">
        {/* Gemini AI status pill */}
        <button
          type="button"
          onClick={onOpenAiModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
          title="Arel Kurumsal AI Asistanı"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-emerald-800">Gemini 2.5 Flash</span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
        </button>

        {/* New Record Dropdown Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-[#00478F] hover:bg-[#00356B] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Yeni Kayıt</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showNewMenu ? 'rotate-180' : ''}`} />
          </button>

          {showNewMenu && (
            <div className="absolute right-0 top-11 w-56 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <button
                type="button"
                onClick={() => {
                  setShowNewMenu(false);
                  onOpenNewCompanyModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#1E293B] hover:bg-[#f1f4f7] text-left cursor-pointer transition-colors"
              >
                <Building2 className="w-4 h-4 text-[#00478F]" />
                <div>
                  <div className="font-bold text-[#1E293B]">Yeni Firma Kartı</div>
                  <div className="text-[10px] text-[#64748B]">Portföye ortak firma ekle</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowNewMenu(false);
                  onOpenNewMeetingModal();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#1E293B] hover:bg-[#f1f4f7] text-left cursor-pointer transition-colors"
              >
                <Users2 className="w-4 h-4 text-[#00677d]" />
                <div>
                  <div className="font-bold text-[#1E293B]">Toplantı Tutanağı</div>
                  <div className="text-[10px] text-[#64748B]">Görüşme ve karar kaydet</div>
                </div>
              </button>

              {onOpenNewActivityModal && (
                <button
                  type="button"
                  onClick={() => {
                    setShowNewMenu(false);
                    onOpenNewActivityModal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#1E293B] hover:bg-[#f1f4f7] text-left cursor-pointer transition-colors"
                >
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-bold text-[#1E293B]">Yeni Faaliyet / Ders</div>
                    <div className="text-[10px] text-[#64748B]">Markalı ders veya gezi planla</div>
                  </div>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[#E2E8F0] mx-1"></div>

        {/* Notifications Icon with Interactive Popover */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-[#64748B] hover:bg-[#f1f4f7] hover:text-[#181c1e] transition-colors cursor-pointer"
            title="Sistem Bildirimleri"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-xl border border-[#E2E8F0] p-3 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] mb-2">
                <span className="text-xs font-bold text-[#1E293B]">Kurumsal Bildirimler</span>
                <span className="text-[10px] font-semibold text-[#00478F]">Tümünü Oku</span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00478F] shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-[#1E293B]">TEI TUSAŞ Teknik Gezisi Onaylandı</div>
                    <div className="text-[10px] text-[#64748B] mt-0.5">45 Makine & Havacılık öğrencisi kontenjanı ayrıldı.</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-bold text-[#1E293B]">Veritabanı Eşitlemesi Başarılı</div>
                    <div className="text-[10px] text-[#64748B] mt-0.5">Son otomatik senkronizasyon tamamlandı.</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings button */}
        <button
          type="button"
          onClick={onNavigateSettings}
          className="p-2 rounded-lg text-[#64748B] hover:bg-[#f1f4f7] hover:text-[#181c1e] transition-colors cursor-pointer"
          title="Veritabanı ve Excel Ayarları"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* User Avatar */}
        <div 
          onClick={onNavigateSettings}
          className="flex items-center gap-2 pl-1 cursor-pointer group"
          title="Yavuz Selim Önal (Kurumsal İlişkiler Yöneticisi)"
        >
          <div className="w-8 h-8 rounded-full bg-[#00478F] text-white flex items-center justify-center font-bold text-xs ring-1 ring-slate-200">
            YS
          </div>
        </div>
      </div>
    </header>
  );
};
