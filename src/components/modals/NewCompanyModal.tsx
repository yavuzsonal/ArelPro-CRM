import React, { useState } from 'react';
import { Company, ProtocolStatus } from '../../types';
import { X, Building2, User, Phone, Mail, FileText, CheckCircle2 } from 'lucide-react';

interface NewCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (company: Company) => void;
}

export const NewCompanyModal: React.FC<NewCompanyModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [sector, setSector] = useState('Bilişim & Yazılım Teknolojileri');
  const [scale, setScale] = useState('Büyük Ölçekli Kurumsal (1000+ Çalışan)');
  const [protocolStatus, setProtocolStatus] = useState<ProtocolStatus>('İmza Aşamasında');
  const [website, setWebsite] = useState('https://');
  const [address, setAddress] = useState('İstanbul, Türkiye');
  
  // Contact
  const [contactName, setContactName] = useState('');
  const [contactTitle, setContactTitle] = useState('İnsan Kaynakları & Üniversite İlişkileri Yöneticisi');
  const [contactPhone, setContactPhone] = useState('+90 212 ');
  const [contactEmail, setContactEmail] = useState('@');
  
  // Arel
  const [arelName, setArelName] = useState('Doç. Dr. Ahmet Yılmaz');
  const [arelUnit, setArelUnit] = useState('Kurumsal İlişkiler & TTO');
  
  // Protocol details
  const [protocolSignDate, setProtocolSignDate] = useState('2026-11-20');
  const [protocolScope, setProtocolScope] = useState('Staj, Markalı Ders, Ar-Ge');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Lütfen firma adını giriniz.');
      return;
    }

    const newCompany: Company = {
      id: `comp-${Date.now()}`,
      name: name.trim(),
      shortName: shortName.trim() || name.slice(0, 3).toUpperCase(),
      code: `ARL-${Math.floor(Math.random() * 800) + 100}`,
      sector,
      scale,
      website,
      address,
      contactPerson: {
        name: contactName || 'Yetkili Belirtilmedi',
        title: contactTitle,
        phone: contactPhone,
        email: contactEmail,
      },
      arelRepresentative: {
        name: arelName,
        title: 'Öğretim Üyesi / Koordinatör',
        department: 'Mühendislik & TTO',
        coordinationUnit: arelUnit,
      },
      protocolStatus,
      protocolSignDate,
      protocolScope: protocolScope.split(',').map(s => s.trim()).filter(Boolean),
      notes,
      stats: {
        totalActivities: 0,
        attendedStudents: 0,
        totalMeetings: 0,
        activeInterns: 0,
        score: 75,
      },
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onSave(newCompany);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-[#E2E8F0] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#00478F] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            <h2 className="text-sm font-bold">Yeni Kurumsal Firma & Ortak Ekle</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1E293B] block mb-1">Ticari Ünvan / Firma Adı *</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Örn: SoftTech Yazılım A.Ş."
                className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] font-semibold text-[#1E293B] focus:outline-none"
              />
            </div>
            <div>
              <label className="font-bold text-[#1E293B] block mb-1">Kısa İsim / Logo Kısaltması</label>
              <input
                type="text"
                value={shortName}
                onChange={e => setShortName(e.target.value)}
                placeholder="Örn: SOFT"
                className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] font-bold text-[#1E293B] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1E293B] block mb-1">Sektör</label>
              <select
                value={sector}
                onChange={e => setSector(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] font-semibold text-[#1E293B]"
              >
                <option value="Bilişim & Yazılım Teknolojileri">Bilişim & Yazılım Teknolojileri</option>
                <option value="İlaç & Biyoteknoloji">İlaç & Biyoteknoloji</option>
                <option value="Havacılık & Savunma Sanayii">Havacılık & Savunma Sanayii</option>
                <option value="Sağlık Hizmetleri & Hastane">Sağlık Hizmetleri & Hastane</option>
                <option value="Perakende & Moda">Perakende & Moda</option>
                <option value="Enerji & Otomotiv">Enerji & Otomotiv</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-[#1E293B] block mb-1">Protokol Durumu</label>
              <select
                value={protocolStatus}
                onChange={e => setProtocolStatus(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] font-bold text-[#00478F]"
              >
                <option value="Aktif">Aktif (Protokol İmzalı)</option>
                <option value="İmza Aşamasında">İmza Aşamasında</option>
                <option value="Müzakere">Müzakere Sürecinde</option>
                <option value="Pasif">Protokolsüz / Pasif</option>
              </select>
            </div>
          </div>

          {/* Contact Person */}
          <div className="p-3.5 bg-[#f1f4f7] rounded-xl border border-[#E2E8F0] flex flex-col gap-2.5">
            <span className="font-bold text-[#00478F] uppercase text-[10px]">Firma Yetkilisi & İrtibat</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-[#64748B] block mb-1">İsim Soyisim</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="Örn: Ayşe Demir"
                  className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-[#1E293B]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#64748B] block mb-1">Unvan</label>
                <input
                  type="text"
                  value={contactTitle}
                  onChange={e => setContactTitle(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-[#1E293B]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#64748B] block mb-1">Telefon</label>
                <input
                  type="text"
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-[#1E293B]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#64748B] block mb-1">E-Posta</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-white border border-[#E2E8F0] text-[#1E293B]"
                />
              </div>
            </div>
          </div>

          {/* Arel Sorumlusu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1E293B] block mb-1">Arel İrtibat Sorumlusu</label>
              <input
                type="text"
                value={arelName}
                onChange={e => setArelName(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] text-[#1E293B] font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-[#1E293B] block mb-1">Koordinasyon Birimi</label>
              <input
                type="text"
                value={arelUnit}
                onChange={e => setArelUnit(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] text-[#1E293B]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#1E293B] block mb-1">Protokol Kapsamı (Virgülle ayırınız)</label>
            <input
              type="text"
              value={protocolScope}
              onChange={e => setProtocolScope(e.target.value)}
              placeholder="Örn: Staj, Markalı Ders, Teknik Gezi, TÜBİTAK"
              className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] text-[#1E293B]"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#f1f4f7] hover:bg-slate-200 text-[#1E293B] font-bold cursor-pointer"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#00478F] hover:bg-[#00356B] text-white font-bold cursor-pointer shadow-xs"
            >
              Firmayı Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
