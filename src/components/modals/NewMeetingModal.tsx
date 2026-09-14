import React, { useState } from 'react';
import { Company, Meeting, MeetingFormat } from '../../types';
import { X, Calendar, Clock, Building2, CheckCircle2, UserCheck } from 'lucide-react';

interface NewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
  initialCompanyId?: string;
  onSave: (meeting: Meeting) => void;
}

export const NewMeetingModal: React.FC<NewMeetingModalProps> = ({
  isOpen,
  onClose,
  companies,
  initialCompanyId,
  onSave,
}) => {
  const [companyId, setCompanyId] = useState(initialCompanyId || companies[0]?.id || '');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [timeRange, setTimeRange] = useState('14:00 - 15:30');
  const [format, setFormat] = useState<MeetingFormat>('Yüz Yüze (Kampüs)');
  const [companyAttendees, setCompanyAttendees] = useState('');
  const [arelAttendees, setArelAttendees] = useState('Doç. Dr. Ahmet Yılmaz (Arel TTO Koordinatörü)');
  const [decisions, setDecisions] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const selectedComp = companies.find(c => c.id === companyId) || companies[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Lütfen toplantı başlığını giriniz.');
      return;
    }

    const formatMap: Record<string, MeetingFormat> = {
      'Yüz Yüze (Kampüs)': 'Yüz Yüze',
      'Yüz Yüze (Firma Ziyareti)': 'Yüz Yüze',
      'Çevrim İçi (Teams/Zoom)': 'Çevrimiçi / Online',
      'Telefon Görüşmesi': 'Hibrit',
    };

    const newMeeting: Meeting = {
      id: `mtg-${Date.now()}`,
      code: `TOP-2026-${Math.floor(Math.random() * 800) + 100}`,
      companyId: selectedComp?.id || 'corp',
      companyName: selectedComp?.name || 'Kurumsal Paydaş',
      date,
      timeRange,
      durationMinutes: 60,
      format: (formatMap[format] || 'Yüz Yüze') as MeetingFormat,
      location: format.includes('Firma') ? 'Firma Genel Merkezi' : 'Arel Kemal Gözükara Yerleşkesi',
      title: title.trim(),
      arelAttendees,
      companyAttendees: companyAttendees || (selectedComp?.contactPerson?.name ? `${selectedComp.contactPerson.name} (${selectedComp.contactPerson.title})` : 'Firma Yetkilisi'),
      moderator: 'Doç. Dr. Ahmet Yılmaz',
      agendaItems: 'İş birliği protokolü ve staj kotaları görüşmesi',
      decisionsAndActions: decisions || 'Toplantı gündemi görüşüldü ve takip takvimi belirlendi.',
      actionItemsCount: 3,
      notes,
      meetingType: 'Protokol & Sözleşme',
      department: 'Kurumsal İlişkiler & TTO',
      status: 'Tamamlandı',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onSave(newMeeting);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-[#E2E8F0] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#00677d] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <h2 className="text-sm font-bold">Yeni Toplantı & Görüşme Tutanağı Ekle</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex flex-col gap-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1E293B] block mb-1">Görüşülen Firma / Paydaş *</label>
              <select
                value={companyId}
                onChange={e => setCompanyId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] font-bold text-[#1E293B]"
              >
                {companies.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-[#1E293B] block mb-1">Görüşme Formatı / Kanalı</label>
              <select
                value={format}
                onChange={e => setFormat(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] font-semibold text-[#1E293B]"
              >
                <option value="Yüz Yüze (Kampüs)">Yüz Yüze (Arel Kampüsü)</option>
                <option value="Yüz Yüze (Firma Ziyareti)">Yüz Yüze (Firma Merkez Ziyareti)</option>
                <option value="Çevrim İçi (Teams/Zoom)">Çevrim İçi (Microsoft Teams / Zoom)</option>
                <option value="Telefon Görüşmesi">Telefon Görüşmesi</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-[#1E293B] block mb-1">Toplantı Başlığı & Ana Konu *</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Örn: 2026-2027 Dönemi Staj & Ar-Ge İş Birliği Görüşmesi"
              className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] font-bold text-[#1E293B]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1E293B] block mb-1">Tarih *</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] text-[#1E293B]"
              />
            </div>
            <div>
              <label className="font-bold text-[#1E293B] block mb-1">Saat / Saat Aralığı</label>
              <input
                type="text"
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
                placeholder="Örn: 10:30 - 12:00"
                className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] text-[#1E293B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#1E293B] block mb-1">Firma Katılımcıları (İsim & Unvan)</label>
              <input
                type="text"
                value={companyAttendees}
                onChange={e => setCompanyAttendees(e.target.value)}
                placeholder="Örn: Ayşe Demir (İK Direktörü), Burak Öz (Ar-Ge Md.)"
                className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] text-[#1E293B]"
              />
            </div>
            <div>
              <label className="font-bold text-[#1E293B] block mb-1">Arel Heyeti (İsim & Unvan)</label>
              <input
                type="text"
                value={arelAttendees}
                onChange={e => setArelAttendees(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] text-[#1E293B]"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-[#1E293B] block mb-1">Alınan Kararlar & Eylem Planı *</label>
            <textarea
              rows={3}
              required
              value={decisions}
              onChange={e => setDecisions(e.target.value)}
              placeholder="Toplantıda mutabık kalınan konular, belirlenen hedefler ve teslim tarihleri..."
              className="w-full p-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] text-[#1E293B] resize-none"
            />
          </div>

          <div>
            <label className="font-bold text-[#1E293B] block mb-1">Özel Notlar & Bir Sonraki Adım</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Hatırlatmalar, protokol taslağı gönderilecek tarih vb..."
              className="w-full p-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] text-[#1E293B] resize-none"
            />
          </div>

          {/* Footer */}
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
              className="px-5 py-2 rounded-lg bg-[#00677d] hover:bg-[#005c70] text-white font-bold cursor-pointer shadow-xs"
            >
              Tutanağı Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
