import React, { useState } from 'react';
import { Company, Activity, Meeting, CalendarEvent } from '../../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Users, 
  Plus, 
  BookOpen, 
  Bus, 
  Mic, 
  Activity as ActivityIcon,
  Building2,
  CalendarCheck
} from 'lucide-react';

interface CalendarViewProps {
  companies: Company[];
  activities: Activity[];
  meetings: Meeting[];
  calendarEvents: CalendarEvent[];
  onOpenNewActivityModal: () => void;
  onOpenNewMeetingModal: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  companies,
  activities,
  meetings,
  calendarEvents,
  onOpenNewActivityModal,
  onOpenNewMeetingModal,
}) => {
  const [monthDate, setMonthDate] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<number>(() => new Date().getDate());
  const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const previousMonthDays = new Date(monthDate.getFullYear(), monthDate.getMonth(), 0).getDate();
  const prefixDays = Array.from(
    { length: (monthStart.getDay() + 6) % 7 },
    (_, index) => previousMonthDays - ((monthStart.getDay() + 6) % 7) + index + 1,
  );
  const currentMonth = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(monthDate);
  const monthKey = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
  const monthlyActivities = activities.filter(activity => activity.date.startsWith(monthKey));
  const monthlyMeetings = meetings.filter(meeting => meeting.date.startsWith(monthKey));
  const monthlyEvents = calendarEvents.filter(event => event.date.startsWith(monthKey));

  const getEventsForDay = (day: number) => {
    const dateQuery = `${monthKey}-${String(day).padStart(2, '0')}`;
    const dayActs = activities.filter(activity => activity.date === dateQuery);
    const dayMtgs = meetings.filter(meeting => meeting.date === dateQuery);
    const linkedIds = new Set([...dayActs, ...dayMtgs].map(item => item.id));
    const dayEvents = calendarEvents.filter(event =>
      event.date === dateQuery && (!event.referenceId || !linkedIds.has(event.referenceId)),
    );
    return { dayActs, dayMtgs, dayEvents };
  };

  const selectedEvents = getEventsForDay(selectedDay);

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[#00677d] uppercase tracking-wider font-bold">
              Kurumsal Zaman Akışı & Ajanda
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2E8F0]"></span>
            <span className="text-xs text-[#64748B] font-semibold">2026-2027 Güz</span>
          </div>
          <h1 className="text-2xl font-bold text-[#00478F] tracking-tight">
            Faaliyet & Toplantı Takvimi
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            İstanbul Arel Üniversitesi Kurumsal İlişkiler & Sektörel Ortaklıklar Saha ve Toplantı Takvimi
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-white border border-[#E2E8F0] rounded-lg p-1 shadow-xs">
            <button
              type="button"
              onClick={() => {
                const previousMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
                setMonthDate(previousMonth);
                setSelectedDay(Math.min(selectedDay, new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0).getDate()));
              }}
              className="p-1.5 rounded hover:bg-slate-100 text-[#64748B] cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-bold text-[#1E293B]">{currentMonth}</span>
            <button
              type="button"
              onClick={() => {
                const nextMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1);
                setMonthDate(nextMonth);
                setSelectedDay(Math.min(selectedDay, new Date(nextMonth.getFullYear(), nextMonth.getMonth() + 1, 0).getDate()));
              }}
              className="p-1.5 rounded hover:bg-slate-100 text-[#64748B] cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const today = new Date();
              setMonthDate(new Date(today.getFullYear(), today.getMonth(), 1));
              setSelectedDay(today.getDate());
            }}
            className="px-3 py-2 rounded-lg bg-white border border-[#E2E8F0] hover:bg-slate-50 text-xs font-bold text-[#1E293B] shadow-xs cursor-pointer"
          >
            Bugün
          </button>

          <button
            type="button"
            onClick={onOpenNewActivityModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00478F] hover:bg-[#00356B] text-white text-xs font-bold shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Faaliyet Ekle</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewMeetingModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#00677d] hover:bg-[#005c70] text-white text-xs font-bold shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Toplantı Ekle</span>
          </button>
        </div>
      </div>

      {/* Quick Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Bu Ay Faaliyet</span>
            <span className="text-xl font-bold text-[#00478F]">{monthlyActivities.length} Etkinlik</span>
          </div>
          <CalendarCheck className="w-8 h-8 text-blue-100" />
        </div>
        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Planlı Toplantı</span>
            <span className="text-xl font-bold text-[#00677d]">{monthlyMeetings.length} Görüşme</span>
          </div>
          <Users className="w-8 h-8 text-cyan-100" />
        </div>
        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Teknik Gezi</span>
            <span className="text-xl font-bold text-emerald-600">{monthlyActivities.filter(activity => activity.type === 'Teknik Gezi').length} Saha Ziyareti</span>
          </div>
          <Bus className="w-8 h-8 text-emerald-100" />
        </div>
        <div className="p-3 bg-white rounded-xl border border-[#E2E8F0] shadow-xs flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-[#64748B]">Protokol İmza Töreni</span>
            <span className="text-xl font-bold text-amber-600">{companies.filter(company => company.protocolStatus === 'Aktif').length} Aktif Protokol</span>
          </div>
          <Building2 className="w-8 h-8 text-amber-100" />
        </div>
      </div>

      {/* Main Calendar Workspace (Grid & Day Inspector) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid (8 cols) */}
        <div className="xl:col-span-8 bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-4 flex flex-col">
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-[#64748B] pb-2 border-b border-[#E2E8F0]">
            <div>Pzt</div>
            <div>Sal</div>
            <div>Çar</div>
            <div>Per</div>
            <div>Cum</div>
            <div className="text-rose-500">Cmt</div>
            <div className="text-rose-500">Paz</div>
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {/* Previous Month Days */}
            {prefixDays.map((d, i) => (
              <div key={`prev-${i}`} className="min-h-[96px] p-1.5 rounded-lg bg-[#f1f4f7]/40 text-[#64748B]/40 text-xs flex flex-col justify-between">
                <span>{d}</span>
              </div>
            ))}

            {/* Current Month Days */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const isSelected = selectedDay === day;
              const today = new Date();
              const isToday = day === today.getDate()
                && monthDate.getMonth() === today.getMonth()
                && monthDate.getFullYear() === today.getFullYear();
              const { dayActs, dayMtgs, dayEvents } = getEventsForDay(day);
              const totalEvents = dayActs.length + dayMtgs.length + dayEvents.length;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[105px] p-1.5 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-[#00478F] ring-1 ring-[#00478F]'
                      : isToday
                      ? 'bg-[#f1f4f7] border-[#00478F]/40'
                      : 'bg-white border-[#E2E8F0] hover:bg-[#f1f4f7]/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${
                      isToday ? 'w-5 h-5 rounded-full bg-[#00478F] text-white flex items-center justify-center' : 'text-[#1E293B]'
                    }`}>
                      {day}
                    </span>
                    {totalEvents > 0 && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    )}
                  </div>

                  {/* Mini Chips */}
                  <div className="flex flex-col gap-1 my-1 overflow-hidden">
                    {dayActs.slice(0, 2).map(act => (
                      <span
                        key={act.id}
                        className="px-1.5 py-0.5 rounded bg-blue-100 text-[#00478F] text-[9px] font-bold truncate block"
                        title={act.title}
                      >
                        {act.title}
                      </span>
                    ))}
                    {dayMtgs.slice(0, 1).map(mtg => (
                      <span
                        key={mtg.id}
                        className="px-1.5 py-0.5 rounded bg-cyan-100 text-[#00677d] text-[9px] font-bold truncate block"
                        title={mtg.title}
                      >
                        {mtg.title}
                      </span>
                    ))}
                    {dayEvents.slice(0, Math.max(0, 2 - dayActs.length - dayMtgs.length)).map(event => (
                      <span
                        key={event.id}
                        className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold truncate block"
                        title={event.title}
                      >
                        {event.title}
                      </span>
                    ))}
                    {totalEvents > 2 && (
                      <span className="text-[9px] text-[#64748B] font-bold text-right">
                        +{totalEvents - 2} daha
                      </span>
                    )}
                  </div>

                  <div className="text-[9px] text-[#64748B] text-right">
                    {totalEvents > 0 ? `${totalEvents} Kayıt` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Inspector (4 cols) */}
        <div className="xl:col-span-4 bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Seçili Gün Ajandası</span>
              <h3 className="text-base font-bold text-[#00478F]">
                {selectedDay} {new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(monthDate)}
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-[#f1f4f7] text-xs font-bold text-[#1E293B]">
              {selectedEvents.dayActs.length + selectedEvents.dayMtgs.length + selectedEvents.dayEvents.length} Etkinlik
            </span>
          </div>

          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
            {selectedEvents.dayActs.map(act => (
              <div key={act.id} className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-blue-200 text-[#00478F] text-[10px] font-bold uppercase">
                    {act.type}
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#00677d]" />
                    {act.timeRange}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#1E293B]">{act.title}</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <Building2 className="w-3.5 h-3.5 text-[#00677d]" />
                  <span>{act.companyName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <MapPin className="w-3.5 h-3.5 text-[#00677d]" />
                  <span>{act.location}</span>
                </div>
                <div className="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-[#00478F]">Hedef: {act.targetStudents} Katılımcı</span>
                  <span className="text-[#64748B]">Koor: {act.coordinator}</span>
                </div>
              </div>
            ))}

            {selectedEvents.dayMtgs.map(mtg => (
              <div key={mtg.id} className="p-3.5 rounded-xl border border-cyan-200 bg-cyan-50/40 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-cyan-200 text-[#00677d] text-[10px] font-bold uppercase">
                    {mtg.format}
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#00677d]" />
                    {mtg.timeRange}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#1E293B]">{mtg.title}</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <Building2 className="w-3.5 h-3.5 text-[#00677d]" />
                  <span>{mtg.companyName}</span>
                </div>
                <p className="text-[11px] text-[#64748B] bg-white p-2 rounded border border-cyan-200/60">
                  {mtg.decisionsAndActions}
                </p>
              </div>
            ))}

            {selectedEvents.dayEvents.map(event => (
              <div key={event.id} className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-amber-200 text-amber-900 text-[10px] font-bold uppercase">
                    {event.category}
                  </span>
                  <span className="text-[11px] font-semibold text-[#64748B] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#00677d]" />
                    {event.time}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-[#1E293B]">{event.title}</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <Building2 className="w-3.5 h-3.5 text-[#00677d]" />
                  <span>{event.companyName}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                  <MapPin className="w-3.5 h-3.5 text-[#00677d]" />
                  <span>{event.location}</span>
                </div>
                {event.description && <p className="text-[11px] text-[#64748B]">{event.description}</p>}
              </div>
            ))}

            {selectedEvents.dayActs.length === 0 && selectedEvents.dayMtgs.length === 0 && selectedEvents.dayEvents.length === 0 && (
              <div className="py-12 text-center text-xs text-[#64748B] border border-dashed rounded-xl flex flex-col items-center gap-2">
                <CalendarIcon className="w-8 h-8 text-slate-300" />
                <span>Bu tarihte planlanmış faaliyet veya toplantı bulunmuyor.</span>
                <button
                  type="button"
                  onClick={onOpenNewActivityModal}
                  className="text-xs text-[#00478F] font-bold hover:underline"
                >
                  + Faaliyet Planla
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
