import React, { useEffect, useState } from 'react';
import { Company } from '../../types';
import { 
  FileCheck2, 
  ExternalLink, 
  ArrowLeft, 
  ShieldCheck, 
  FileText, 
  Globe, 
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';

interface ProtocolsViewProps {
  companies?: Company[];
  onSelectCompany?: (company: Company) => void;
  onOpenNewCompanyModal?: () => void;
  onNavigateTab?: (tab: string) => void;
}

export const ProtocolsView: React.FC<ProtocolsViewProps> = ({
  onNavigateTab,
}) => {
  const [countdown, setCountdown] = useState(5);
  const [autoRedirectPaused, setAutoRedirectPaused] = useState(false);
  const RLX_URL = 'https://rlx.arel.edu.tr';

  useEffect(() => {
    if (autoRedirectPaused) return;

    if (countdown <= 0) {
      window.open(RLX_URL, '_blank', 'noopener,noreferrer');
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, autoRedirectPaused]);

  const handleOpenNow = () => {
    window.open(RLX_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div id="protocols-redirect-view" className="flex flex-col w-full max-w-5xl mx-auto gap-6 py-6 px-4">
      {/* Top Breadcrumb / Back Button */}
      {onNavigateTab && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('dashboard')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#00478F] hover:text-[#00356B] bg-white px-3 py-1.5 rounded-lg border border-[#CBD5E1] shadow-2xs hover:bg-slate-50 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Dashboard'a Geri Dön</span>
          </button>
        </div>
      )}

      {/* Main Redirection Hero Card */}
      <div className="bg-gradient-to-br from-white via-[#F8FAFC] to-[#F1F5F9] rounded-2xl border border-[#CBD5E1] shadow-sm p-6 sm:p-10 relative overflow-hidden">
        {/* Background Decorative Element */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#00478F]/5 pointer-events-none blur-2xl"></div>

        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          {/* Logo Badge */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-[#003B75] to-[#00607A] text-white flex items-center justify-center shadow-md mb-6 border border-white/20">
            <FileCheck2 className="w-10 h-10 text-[#8ee7ff]" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#00478F] text-xs font-bold mb-4">
            <Globe className="w-3.5 h-3.5" />
            <span>İstanbul Arel Üniversitesi Resmi Protokol Portalı</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#00478F] tracking-tight mb-3">
            Protokol Yönetimi İçin RLX Sistemine Yönlendiriliyorsunuz
          </h1>

          <p className="text-sm text-[#475569] leading-relaxed mb-6">
            Üniversite-Sanayi İş Birliği Protokol süreçleri, resmi sözleşmeler, hukuki onay aşamaları ve e-imza akışları 
            merkezi olarak <strong>Arel RLX Portalı</strong> üzerinden yönetilmektedir.
          </p>

          {/* URL Box */}
          <div className="w-full bg-white p-4 rounded-xl border border-blue-200 shadow-2xs mb-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#00478F] flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Hedef Sistem Adresi</span>
                <span className="text-sm font-mono font-bold text-[#00478F] break-all">https://rlx.arel.edu.tr</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium shrink-0">
              {countdown > 0 && !autoRedirectPaused ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                  <strong>{countdown} sn</strong> içinde yeni sekmede açılacak
                </span>
              ) : (
                <span className="text-slate-400">Otomatik yönlendirme beklemede</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 w-full">
            <a
              id="btn-goto-rlx"
              href={RLX_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleOpenNow}
              className="px-6 py-3 rounded-xl bg-[#00478F] hover:bg-[#00356B] text-white font-bold text-sm shadow-md hover:shadow-lg inline-flex items-center gap-2 cursor-pointer transition-all"
            >
              <span>rlx.arel.edu.tr Sayfasına Git</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {countdown > 0 && !autoRedirectPaused && (
              <button
                type="button"
                onClick={() => setAutoRedirectPaused(true)}
                className="px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-600 border border-[#CBD5E1] font-semibold text-sm cursor-pointer transition-colors"
              >
                Geri Sayımı Durdur
              </button>
            )}

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('dashboard')}
                className="px-4 py-3 rounded-xl bg-white hover:bg-slate-50 text-[#00478F] border border-[#CBD5E1] font-semibold text-sm cursor-pointer transition-colors"
              >
                Dashboard'a Dön
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Informative Pillars about RLX */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-2">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#00478F] flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#0F172A]">Merkezi Protokol Takibi</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Kurumlarla yapılan ikili iş birliği protokolleri, çerçeve sözleşmeler ve staj mutabakatları RLX portalında kayıt altına alınır.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-2">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#0F172A]">Hukuki & Rektörlük Onayı</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            Protokol taslaklarının Hukuk Müşavirliği incelemesi ve Rektörlük makamı imza akışları RLX onay mekanizmasıyla entegredir.
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs flex flex-col gap-2">
          <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-[#0F172A]">CRM Senkronizasyonu</h3>
          <p className="text-xs text-[#64748B] leading-relaxed">
            RLX üzerinde yürürlüğe giren ve imzalanan tüm protokoller, ArelPro CRM sistemine "Aktif Protokol" olarak yansır.
          </p>
        </div>
      </div>
    </div>
  );
};
