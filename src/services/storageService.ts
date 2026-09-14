import { Company, Activity, Meeting, CalendarEvent, DatabaseSyncConfig, SyncLog } from '../types';
import { 
  INITIAL_COMPANIES, 
  INITIAL_ACTIVITIES, 
  INITIAL_MEETINGS, 
  INITIAL_CALENDAR_EVENTS, 
  INITIAL_DB_CONFIG, 
  INITIAL_SYNC_LOGS 
} from '../data/initialData';

const KEYS = {
  COMPANIES: 'arel_crm_companies_v1',
  ACTIVITIES: 'arel_crm_activities_v1',
  MEETINGS: 'arel_crm_meetings_v1',
  CALENDAR: 'arel_crm_calendar_v1',
  DB_CONFIG: 'arel_crm_db_config_v1',
  SYNC_LOGS: 'arel_crm_sync_logs_v1',
};

function sanitizeStorageString(str: string): string {
  return str
    .replaceAll('Dr. Yavuz Selim Önal', 'Yavuz Selim Önal')
    .replaceAll('Kurumsal İlişkiler Direktörü', 'Kurumsal İlişkiler Yöneticisi')
    .replaceAll('Kurumsal Direktör', 'Kurumsal İlişkiler Yöneticisi');
}

function deduplicateById<T extends { id?: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    if (!item) continue;
    const id = item.id;
    if (id) {
      if (!seen.has(id)) {
        seen.add(id);
        result.push(item);
      }
    } else {
      result.push(item);
    }
  }
  return result;
}

export const StorageService = {
  getCompanies(): Company[] {
    try {
      const data = localStorage.getItem(KEYS.COMPANIES);
      const list = data ? JSON.parse(sanitizeStorageString(data)) : INITIAL_COMPANIES;
      return deduplicateById(list);
    } catch {
      return INITIAL_COMPANIES;
    }
  },

  saveCompanies(companies: Company[]): void {
    try {
      const cleanList = deduplicateById(companies);
      localStorage.setItem(KEYS.COMPANIES, JSON.stringify(cleanList));
      window.dispatchEvent(new Event('arel_storage_updated'));
    } catch (e) {
      console.error('Failed to save companies to storage', e);
    }
  },

  addCompany(company: Company): Company[] {
    const list = this.getCompanies().filter(c => c.id !== company.id);
    const updated = [company, ...list];
    this.saveCompanies(updated);
    return updated;
  },

  updateCompany(companyOrId: Company | string, partial?: Partial<Company>): Company[] {
    const list = this.getCompanies();
    if (typeof companyOrId === 'string') {
      const index = list.findIndex(c => c.id === companyOrId);
      if (index !== -1) {
        list[index] = { ...list[index], ...partial };
        this.saveCompanies([...list]);
      }
    } else {
      const index = list.findIndex(c => c.id === companyOrId.id);
      if (index !== -1) {
        list[index] = companyOrId;
        this.saveCompanies([...list]);
      }
    }
    return this.getCompanies();
  },

  deleteCompany(id: string): void {
    const list = this.getCompanies().filter(c => c.id !== id);
    this.saveCompanies(list);
  },

  getActivities(): Activity[] {
    try {
      const data = localStorage.getItem(KEYS.ACTIVITIES);
      const list = data ? JSON.parse(sanitizeStorageString(data)) : INITIAL_ACTIVITIES;
      return deduplicateById(list);
    } catch {
      return INITIAL_ACTIVITIES;
    }
  },

  saveActivities(activities: Activity[]): void {
    try {
      const cleanList = deduplicateById(activities);
      localStorage.setItem(KEYS.ACTIVITIES, JSON.stringify(cleanList));
      window.dispatchEvent(new Event('arel_storage_updated'));
    } catch (e) {
      console.error('Failed to save activities', e);
    }
  },

  addActivity(activity: Activity): Activity[] {
    const list = this.getActivities().filter(a => a.id !== activity.id);
    const updated = [activity, ...list];
    this.saveActivities(updated);

    // Also automatically create a matching calendar event
    const calEvent: CalendarEvent = {
      id: `cal-gen-${Date.now()}`,
      title: `${activity.timeRange.split(' ')[0] || ''} ${activity.title}`,
      date: activity.date,
      time: activity.timeRange,
      category: activity.type === 'Markalı Ders' ? 'Markalı Ders' :
                activity.type === 'Teknik Gezi' ? 'Teknik Gezi' :
                (activity.type === 'Proje' || activity.type === 'Ar-Ge & TÜBİTAK') ? 'Proje' : 'Zirve & Seminer',
      location: activity.location,
      companyName: activity.companyName,
      participantsCount: `${activity.targetStudents} Hedef`,
      status: activity.status === 'Tamamlandı' ? 'Tamamlandı' : 'Planlandı',
      description: activity.description,
      referenceId: activity.id,
    };
    this.addCalendarEvent(calEvent);
    return updated;
  },

  getMeetings(): Meeting[] {
    try {
      const data = localStorage.getItem(KEYS.MEETINGS);
      const list = data ? JSON.parse(sanitizeStorageString(data)) : INITIAL_MEETINGS;
      return deduplicateById(list);
    } catch {
      return INITIAL_MEETINGS;
    }
  },

  saveMeetings(meetings: Meeting[]): void {
    try {
      const cleanList = deduplicateById(meetings);
      localStorage.setItem(KEYS.MEETINGS, JSON.stringify(cleanList));
      window.dispatchEvent(new Event('arel_storage_updated'));
    } catch (e) {
      console.error('Failed to save meetings', e);
    }
  },

  updateMeeting(id: string, updates: Partial<Meeting>): Meeting[] {
    const list = this.getMeetings();
    const updated = list.map(m => m.id === id ? { ...m, ...updates } : m);
    this.saveMeetings(updated);
    return updated;
  },

  addMeeting(meeting: Meeting): Meeting[] {
    const list = this.getMeetings().filter(m => m.id !== meeting.id);
    const updated = [meeting, ...list];
    this.saveMeetings(updated);

    // Also add to calendar events
    const calEvent: CalendarEvent = {
      id: `cal-mtg-${Date.now()}`,
      title: `${meeting.timeRange.split(' ')[0] || ''} ${meeting.title}`,
      date: meeting.date,
      time: meeting.timeRange,
      category: 'Toplantı & Protokol',
      location: meeting.location,
      companyName: meeting.companyName,
      participantsCount: `${meeting.actionItemsCount} Karar`,
      status: meeting.status === 'Tamamlandı' ? 'Tamamlandı' : 'Planlandı',
      description: meeting.decisionsAndActions,
      keyNote: meeting.agendaItems,
      referenceId: meeting.id,
    };
    this.addCalendarEvent(calEvent);
    return updated;
  },

  getCalendarEvents(): CalendarEvent[] {
    try {
      const data = localStorage.getItem(KEYS.CALENDAR);
      const list = data ? JSON.parse(data) : INITIAL_CALENDAR_EVENTS;
      return deduplicateById(list);
    } catch {
      return INITIAL_CALENDAR_EVENTS;
    }
  },

  saveCalendarEvents(events: CalendarEvent[]): void {
    try {
      const cleanList = deduplicateById(events);
      localStorage.setItem(KEYS.CALENDAR, JSON.stringify(cleanList));
      window.dispatchEvent(new Event('arel_storage_updated'));
    } catch (e) {
      console.error('Failed to save calendar events', e);
    }
  },

  addCalendarEvent(event: CalendarEvent): void {
    const list = this.getCalendarEvents().filter(e => e.id !== event.id && (!event.referenceId || e.referenceId !== event.referenceId));
    this.saveCalendarEvents([event, ...list]);
  },

  getDbConfig(): DatabaseSyncConfig {
    try {
      const data = localStorage.getItem(KEYS.DB_CONFIG);
      return data ? JSON.parse(data) : INITIAL_DB_CONFIG;
    } catch {
      return INITIAL_DB_CONFIG;
    }
  },

  saveDbConfig(config: DatabaseSyncConfig): void {
    try {
      localStorage.setItem(KEYS.DB_CONFIG, JSON.stringify(config));
      window.dispatchEvent(new Event('arel_storage_updated'));
    } catch (e) {
      console.error('Failed to save db config', e);
    }
  },

  getSyncLogs(): SyncLog[] {
    try {
      const data = localStorage.getItem(KEYS.SYNC_LOGS);
      return data ? JSON.parse(data) : INITIAL_SYNC_LOGS;
    } catch {
      return INITIAL_SYNC_LOGS;
    }
  },

  addSyncLog(log: Omit<SyncLog, 'id' | 'timestamp'>): void {
    const now = new Date();
    const formatted = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }) + 
      ' ' + now.toLocaleTimeString('tr-TR');
    const newLog: SyncLog = {
      id: `log-${Date.now()}`,
      timestamp: formatted,
      ...log,
    };
    const current = this.getSyncLogs();
    try {
      localStorage.setItem(KEYS.SYNC_LOGS, JSON.stringify([newLog, ...current]));
      window.dispatchEvent(new Event('arel_storage_updated'));
    } catch (e) {
      console.error('Failed to add sync log', e);
    }
  },

  resetToDefault(): void {
    localStorage.removeItem(KEYS.COMPANIES);
    localStorage.removeItem(KEYS.ACTIVITIES);
    localStorage.removeItem(KEYS.MEETINGS);
    localStorage.removeItem(KEYS.CALENDAR);
    localStorage.removeItem(KEYS.DB_CONFIG);
    localStorage.removeItem(KEYS.SYNC_LOGS);
    window.dispatchEvent(new Event('arel_storage_updated'));
  },

  resetToSeed(): void {
    this.resetToDefault();
  }
};
