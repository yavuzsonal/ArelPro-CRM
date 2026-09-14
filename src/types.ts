export type ActiveTab = 
  | 'dashboard'
  | 'companies'
  | 'activities'
  | 'meetings'
  | 'calendar'
  | 'ai-assistant'
  | 'excel-sync'
  | 'db-sync'
  | 'protocols'
  | 'settings';

export type NavigationTab = ActiveTab;

export type ProtocolStatus = 'Aktif' | 'İmza Aşamasında' | 'Müzakere' | 'Pasif' | 'Protokol Yok';

export interface Company {
  id: string;
  code: string;
  name: string;
  shortName: string;
  sector: string;
  address: string;
  website: string;
  scale: string;
  protocolStatus: ProtocolStatus;
  protocolNumber?: string;
  protocolSignDate?: string;
  protocolRenewDate?: string;
  protocolScope?: string[];
  contactPerson: {
    name: string;
    title: string;
    phone: string;
    email: string;
    secondaryContact?: string;
  };
  arelRepresentative: {
    name: string;
    title: string;
    department: string;
    coordinationUnit: string;
  };
  stats: {
    totalActivities: number;
    attendedStudents: number;
    totalMeetings: number;
    activeInterns: number;
    score: number;
  };
  notes?: string;
  createdAt: string;
}

export type ActivityType = 
  | 'Markalı Ders'
  | 'Teknik Gezi'
  | 'Proje'
  | 'Ar-Ge & TÜBİTAK'
  | 'Seminer & Zirve'
  | 'Kariyer & Staj'
  | 'Diğer Kurumsal';

export type ActivityStatus = 'Tamamlandı' | 'Planlandı' | 'Onay Bekliyor' | 'İptal Edildi';

export interface Activity {
  id: string;
  code: string;
  title: string;
  type: ActivityType;
  companyId: string;
  companyName: string;
  date: string;
  timeRange: string;
  location: string;
  department: string;
  coordinationUnit: string;
  coordinator: string;
  targetStudents: number;
  attendedStudents?: number;
  status: ActivityStatus;
  academicTerm: string;
  // Specific fields for Branded Courses (Markalı Ders)
  courseCode?: string;
  instructorName?: string;
  ectsCredits?: string;
  quota?: number;
  // Specific fields for Projects (Proje / Ar-Ge / TÜBİTAK)
  projectCode?: string;
  fundingProgram?: string;
  projectBudget?: string;
  projectDuration?: string;
  academicLeader?: string;
  industryLeader?: string;
  scholarshipCount?: string;
  patentIpStatus?: string;
  // Specific fields for Field Trips (Teknik Gezi)
  tripFacility?: string;
  transportInfo?: string;
  departureTime?: string;
  safetyProcedure?: string;
  tripCoordinator?: string;
  // Specific fields for Seminars & Summits (Seminer & Zirve)
  speakers?: string;
  eventFormat?: string;
  moderator?: string;
  hasCertificate?: string;
  cateringPlan?: string;
  // Specific fields for Other Corporate (Diğer Kurumsal)
  activityScope?: string;
  requiredSupport?: string;
  corporateContact?: string;
  description?: string;
  createdAt: string;
}

export type MeetingFormat = 'Yüz Yüze' | 'Çevrimiçi / Online' | 'Hibrit';
export type MeetingStatus = 'Tamamlandı' | 'Planlandı' | 'İmza Aşamasında' | 'Ertelendi';

export type MeetingPurposeType = 
  | 'Protokol & Sözleşme' 
  | 'Markalı Ders' 
  | 'Ar-Ge / TÜBİTAK' 
  | 'Proje'
  | 'Staj & İstihdam'
  | 'Teknik Gezi & Saha'
  | 'Zirve & Sponsorluk'
  | 'Genel Kurumsal';

export interface Meeting {
  id: string;
  code: string;
  title: string;
  companyId: string;
  companyName: string;
  date: string;
  timeRange: string;
  durationMinutes: number;
  format: MeetingFormat;
  location: string;
  companyAttendees: string;
  arelAttendees: string;
  moderator: string;
  agendaItems: string;
  decisionsAndActions: string;
  actionItemsCount: number;
  nextMeetingDate?: string;
  nextMeetingLocation?: string;
  status: MeetingStatus;
  notes?: string;
  signedDocumentUrl?: string;
  meetingType: MeetingPurposeType | string;
  department: string;
  purpose?: string;
  isNewCompany?: boolean;
  companySector?: string;
  companyPhone?: string;
  companyEmail?: string;
  createdAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  category: 'Toplantı & Protokol' | 'Markalı Ders' | 'Teknik Gezi' | 'Proje' | 'Ar-Ge / TÜBİTAK' | 'Zirve & Seminer';
  location: string;
  companyName: string;
  participantsCount?: string;
  status: 'Tamamlandı' | 'Planlandı' | 'Bugün';
  description?: string;
  keyNote?: string;
  referenceId?: string;
}

export interface DatabaseSyncConfig {
  syncMode: 'auto' | 'manual';
  frequencyMinutes: number; // e.g. 15, 60, 1440
  dbType: 'PostgreSQL' | 'Oracle' | 'MySQL' | 'REST_API' | 'SQL_Server';
  connectionString: string;
  apiEndpoint: string;
  apiKeyOrToken: string;
  tableName: string;
  autoMapColumns: boolean;
  lastSyncTime?: string;
  nextSyncTime?: string;
  isSyncing: boolean;
  status: 'connected' | 'idle' | 'error' | 'syncing';
  errorCount: number;
  successCount: number;
}

export interface SyncLog {
  id: string;
  timestamp: string;
  source: 'Excel Dosyası' | 'Harici Veritabanı (SQL/API)' | 'Manuel Giriş' | 'AI Tutanak Çözümleme';
  recordsProcessed: number;
  status: 'Başarılı' | 'Uyarı' | 'Hatalı';
  message: string;
}
