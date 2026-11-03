import { Company, Activity, Meeting, CalendarEvent, DatabaseSyncConfig, SyncLog } from '../types';
import { INITIAL_DB_CONFIG } from '../data/initialData';
import type { CrmCollection, CrmData } from './sqliteDatabase';

const KEYS = {
  COMPANIES: 'arel_crm_companies_v1',
  ACTIVITIES: 'arel_crm_activities_v1',
  MEETINGS: 'arel_crm_meetings_v1',
  CALENDAR: 'arel_crm_calendar_v1',
  DB_CONFIG: 'arel_crm_db_config_v1',
  SYNC_LOGS: 'arel_crm_sync_logs_v1',
};

const collectionKeys: Record<CrmCollection, string> = {
  companies: KEYS.COMPANIES,
  activities: KEYS.ACTIVITIES,
  meetings: KEYS.MEETINGS,
  calendarEvents: KEYS.CALENDAR,
  syncLogs: KEYS.SYNC_LOGS,
};

const cache: CrmData = {
  companies: [],
  activities: [],
  meetings: [],
  calendarEvents: [],
  syncLogs: [],
};

let initialization: Promise<void> | null = null;

function notifyStorageUpdated(): void {
  window.dispatchEvent(new Event('arel_storage_updated'));
}

function deduplicateById<T extends { id?: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter(item => {
    if (!item) return false;
    if (!item.id) return true;
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new Event('arel_auth_expired'));
    }
    let message = `CRM veri isteği başarısız oldu (${response.status}).`;
    try {
      const body: unknown = await response.json();
      if (typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string') {
        message = body.error;
      }
    } catch {
      throw new Error(message);
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function applyData(data: CrmData): void {
  if (!Array.isArray(data.companies)
    || !Array.isArray(data.activities)
    || !Array.isArray(data.meetings)
    || !Array.isArray(data.calendarEvents)
    || !Array.isArray(data.syncLogs)) {
    throw new Error('Sunucu geçersiz CRM verisi döndürdü.');
  }
  cache.companies = data.companies;
  cache.activities = data.activities;
  cache.meetings = data.meetings;
  cache.calendarEvents = data.calendarEvents;
  cache.syncLogs = data.syncLogs;
}

function readLegacyCollection<T>(key: string): T[] {
  const stored = localStorage.getItem(key);
  if (!stored) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(stored);
  } catch (error) {
    throw new Error(`Eski CRM verisi okunamadı (${key}); veri kaybını önlemek için silinmedi.`, { cause: error });
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`Eski CRM verisi geçersiz (${key}); veri kaybını önlemek için silinmedi.`);
  }
  return parsed as T[];
}

async function fetchAll(): Promise<CrmData> {
  return request<CrmData>('/api/data');
}

export const StorageService = {
  async initialize(): Promise<void> {
    if (!initialization) {
      initialization = (async () => {
        let data = await fetchAll();
        const legacyData: Partial<CrmData> = {
          companies: readLegacyCollection<Company>(KEYS.COMPANIES),
          activities: readLegacyCollection<Activity>(KEYS.ACTIVITIES),
          meetings: readLegacyCollection<Meeting>(KEYS.MEETINGS),
          calendarEvents: readLegacyCollection<CalendarEvent>(KEYS.CALENDAR),
          syncLogs: readLegacyCollection<SyncLog>(KEYS.SYNC_LOGS),
        };
        const hasLegacyData = Object.values(legacyData).some(records => records && records.length > 0);

        if (hasLegacyData) {
          await request<{ migrated: boolean }>('/api/data/legacy-migration', {
            method: 'POST',
            body: JSON.stringify(legacyData),
          });
          data = await fetchAll();
        }

        applyData(data);
        for (const key of Object.values(KEYS)) {
          if (key !== KEYS.DB_CONFIG) localStorage.removeItem(key);
        }
        notifyStorageUpdated();
      })().catch(error => {
        initialization = null;
        throw error;
      });
    }
    await initialization;
  },

  getCompanies(): Company[] {
    return cache.companies;
  },

  async saveCompanies(companies: Company[]): Promise<void> {
    const clean = deduplicateById(companies);
    await request<void>('/api/data/companies', { method: 'PUT', body: JSON.stringify(clean) });
    cache.companies = clean;
    notifyStorageUpdated();
  },

  async addCompany(company: Company): Promise<Company[]> {
    await request<void>('/api/data/companies', { method: 'POST', body: JSON.stringify(company) });
    cache.companies = [company, ...cache.companies.filter(item => item.id !== company.id)];
    notifyStorageUpdated();
    return cache.companies;
  },

  async updateCompany(companyOrId: Company | string, partial?: Partial<Company>): Promise<Company[]> {
    const id = typeof companyOrId === 'string' ? companyOrId : companyOrId.id;
    const existing = cache.companies.find(company => company.id === id);
    if (!existing) return cache.companies;
    const updated = typeof companyOrId === 'string'
      ? { ...existing, ...partial }
      : companyOrId;
    await request<void>('/api/data/companies', { method: 'POST', body: JSON.stringify(updated) });
    cache.companies = cache.companies.map(company => company.id === id ? updated : company);
    notifyStorageUpdated();
    return cache.companies;
  },

  async deleteCompany(id: string): Promise<void> {
    await request<void>(`/api/data/companies/${encodeURIComponent(id)}`, { method: 'DELETE' });
    cache.companies = cache.companies.filter(company => company.id !== id);
    notifyStorageUpdated();
  },

  getActivities(): Activity[] {
    return cache.activities;
  },

  async saveActivities(activities: Activity[]): Promise<void> {
    const clean = deduplicateById(activities);
    await request<void>('/api/data/activities', { method: 'PUT', body: JSON.stringify(clean) });
    cache.activities = clean;
    notifyStorageUpdated();
  },

  async addActivity(activity: Activity): Promise<Activity[]> {
    await request<void>('/api/data/activities', { method: 'POST', body: JSON.stringify(activity) });
    cache.activities = [activity, ...cache.activities.filter(item => item.id !== activity.id)];

    const calendarEvent: CalendarEvent = {
      id: `cal-gen-${activity.id}`,
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
    await this.addCalendarEvent(calendarEvent);
    cache.activities = [activity, ...cache.activities.filter(item => item.id !== activity.id)];
    notifyStorageUpdated();
    return cache.activities;
  },

  async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity[]> {
    const activity = cache.activities.find(item => item.id === id);
    if (!activity) return cache.activities;
    const updated = { ...activity, ...updates };
    await request<void>('/api/data/activities', { method: 'POST', body: JSON.stringify(updated) });
    cache.activities = cache.activities.map(item => item.id === id ? updated : item);
    const existingEvent = cache.calendarEvents.find(event => event.referenceId === id);
    if (existingEvent) {
      await this.addCalendarEvent({
        ...existingEvent,
        title: `${updated.timeRange.split(' ')[0] || ''} ${updated.title}`.trim(),
        date: updated.date,
        time: updated.timeRange,
        location: updated.location,
        companyName: updated.companyName,
        participantsCount: `${updated.targetStudents} Hedef`,
        status: updated.status === 'Tamamlandı'
          ? 'Tamamlandı'
          : updated.status === 'İptal Edildi' ? 'İptal Edildi' : 'Planlandı',
        description: updated.status === 'İptal Edildi'
          ? `İptal edildi. ${updated.description || ''}`.trim()
          : updated.description,
      });
    }
    notifyStorageUpdated();
    return cache.activities;
  },

  getMeetings(): Meeting[] {
    return cache.meetings;
  },

  async saveMeetings(meetings: Meeting[]): Promise<void> {
    const clean = deduplicateById(meetings);
    await request<void>('/api/data/meetings', { method: 'PUT', body: JSON.stringify(clean) });
    cache.meetings = clean;
    notifyStorageUpdated();
  },

  async updateMeeting(id: string, updates: Partial<Meeting>): Promise<Meeting[]> {
    const meeting = cache.meetings.find(item => item.id === id);
    if (!meeting) return cache.meetings;
    const updated = { ...meeting, ...updates };
    await request<void>('/api/data/meetings', { method: 'POST', body: JSON.stringify(updated) });
    cache.meetings = cache.meetings.map(item => item.id === id ? updated : item);
    const existingEvent = cache.calendarEvents.find(event => event.referenceId === id);
    if (existingEvent) {
      await this.addCalendarEvent({
        ...existingEvent,
        title: `${updated.timeRange.split(' ')[0] || ''} ${updated.title}`.trim(),
        date: updated.date,
        time: updated.timeRange,
        location: updated.location,
        companyName: updated.companyName,
        participantsCount: `${updated.actionItemsCount} Karar`,
        status: updated.status === 'Tamamlandı'
          ? 'Tamamlandı'
          : updated.status === 'İptal Edildi' ? 'İptal Edildi' : 'Planlandı',
        description: updated.decisionsAndActions,
      });
    }
    notifyStorageUpdated();
    return cache.meetings;
  },

  async addMeeting(meeting: Meeting): Promise<Meeting[]> {
    await request<void>('/api/data/meetings', { method: 'POST', body: JSON.stringify(meeting) });
    cache.meetings = [meeting, ...cache.meetings.filter(item => item.id !== meeting.id)];

    const calendarEvent: CalendarEvent = {
      id: `cal-mtg-${meeting.id}`,
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
    await this.addCalendarEvent(calendarEvent);
    notifyStorageUpdated();
    return cache.meetings;
  },

  getCalendarEvents(): CalendarEvent[] {
    return cache.calendarEvents;
  },

  async saveCalendarEvents(events: CalendarEvent[]): Promise<void> {
    const clean = deduplicateById(events);
    await request<void>('/api/data/calendarEvents', { method: 'PUT', body: JSON.stringify(clean) });
    cache.calendarEvents = clean;
    notifyStorageUpdated();
  },

  async addCalendarEvent(event: CalendarEvent): Promise<void> {
    await request<void>('/api/data/calendarEvents', { method: 'POST', body: JSON.stringify(event) });
    cache.calendarEvents = [
      event,
      ...cache.calendarEvents.filter(item =>
        item.id !== event.id && (!event.referenceId || item.referenceId !== event.referenceId),
      ),
    ];
    notifyStorageUpdated();
  },

  getDbConfig(): DatabaseSyncConfig {
    try {
      const data = localStorage.getItem(KEYS.DB_CONFIG);
      if (!data) return INITIAL_DB_CONFIG;

      const parsed: unknown = JSON.parse(data);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return INITIAL_DB_CONFIG;
      const {
        password: _password,
        connectionString: _connectionString,
        apiKeyOrToken: _apiKeyOrToken,
        ...safeConfig
      } = parsed as Record<string, unknown>;
      const config = {
        ...INITIAL_DB_CONFIG,
        ...safeConfig,
        password: '',
        isConnected: false,
        isSyncing: false,
        status: 'idle',
      } as DatabaseSyncConfig;
      localStorage.setItem(KEYS.DB_CONFIG, JSON.stringify({
        ...config,
        password: undefined,
      }));
      return config;
    } catch {
      return INITIAL_DB_CONFIG;
    }
  },

  saveDbConfig(config: DatabaseSyncConfig): void {
    try {
      const { password: _password, ...safeConfig } = config;
      localStorage.setItem(KEYS.DB_CONFIG, JSON.stringify(safeConfig));
      window.dispatchEvent(new Event('arel_storage_updated'));
    } catch (error) {
      console.error('Failed to save database configuration', error);
    }
  },

  getSyncLogs(): SyncLog[] {
    return cache.syncLogs;
  },

  async addSyncLog(log: Omit<SyncLog, 'id' | 'timestamp'>): Promise<void> {
    const now = new Date();
    const timestamp = now.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
      + ' ' + now.toLocaleTimeString('tr-TR');
    const newLog: SyncLog = {
      id: `log-${Date.now()}`,
      timestamp,
      ...log,
    };
    await request<void>('/api/data/syncLogs', { method: 'POST', body: JSON.stringify(newLog) });
    cache.syncLogs = [newLog, ...cache.syncLogs.filter(item => item.id !== newLog.id)];
    notifyStorageUpdated();
  },

  async clearLogs(): Promise<void> {
    await request<void>('/api/data/syncLogs', { method: 'PUT', body: JSON.stringify([]) });
    cache.syncLogs = [];
    notifyStorageUpdated();
  },

  async resetToDefault(): Promise<void> {
    const data = await request<CrmData>('/api/data/reset', { method: 'POST' });
    applyData(data);
    localStorage.removeItem(KEYS.DB_CONFIG);
    notifyStorageUpdated();
  },

  async resetToSeed(): Promise<void> {
    await this.resetToDefault();
  },
};
