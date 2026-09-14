import { DatabaseSyncConfig, Company, Activity } from '../types';
import { StorageService } from './storageService';

export const DbSyncService = {
  getConfig(): DatabaseSyncConfig {
    return StorageService.getDbConfig();
  },

  saveConfig(config: DatabaseSyncConfig): void {
    StorageService.saveDbConfig(config);
  },

  getLogs() {
    return StorageService.getSyncLogs();
  },

  clearLogs(): void {
    try {
      localStorage.setItem('arel_crm_sync_logs_v1', JSON.stringify([]));
      window.dispatchEvent(new Event('arel_storage_updated'));
    } catch (e) {
      console.error(e);
    }
  },

  async runSync(config?: DatabaseSyncConfig) {
    const cfg = config || this.getConfig();
    return this.executeSync(cfg);
  },

  /**
   * Test connection to configured Database or API
   */
  async testConnection(config: DatabaseSyncConfig): Promise<{ success: boolean; message: string; latencyMs: number }> {
    const startTime = performance.now();
    await new Promise(resolve => setTimeout(resolve, 800)); // Network latency simulation
    const latencyMs = Math.round(performance.now() - startTime);

    if (!config.connectionString && !config.apiEndpoint) {
      return {
        success: false,
        message: 'Lütfen geçerli bir Veritabanı Bağlantı Dizesi (Connection String) veya API Endpoint adresi giriniz.',
        latencyMs,
      };
    }

    return {
      success: true,
      message: `${config.dbType} veri tabanı bağlantısı doğrulandı. Tablo "${config.tableName || 'crm_records'}" erişilebilir durumda (${latencyMs}ms).`,
      latencyMs,
    };
  },

  /**
   * Perform automatic or manual synchronization from Database / API
   */
  async executeSync(config: DatabaseSyncConfig): Promise<{ importedCount: number; updatedCount: number; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1400));

    // Simulated new incoming records from university ERP / Student Affairs / TTO database
    const incomingCompanies: Company[] = [
      {
        id: `comp-dbsync-${Date.now()}-1`,
        code: `AREL-2026-${Math.floor(Math.random() * 800) + 200}`,
        name: 'STM Savunma Teknolojileri Mühendislik ve Tic. A.Ş.',
        shortName: 'STM',
        sector: 'Siber Güvenlik, Denizcilik & İHA',
        address: 'Bilkent Cyberpark / Ankara',
        website: 'https://www.stm.com.tr',
        scale: 'Büyük İşletme (1500+ Çalışan)',
        protocolStatus: 'Aktif',
        protocolNumber: 'PRT-2026-STM-01',
        protocolSignDate: '15 Kasım 2026',
        protocolRenewDate: '15 Kasım 2029',
        protocolScope: ['CTF Siber Güvenlik Kampı', 'Stajyer Tahsisi'],
        contactPerson: {
          name: 'Gökhan Çetin',
          title: 'Siber Savunma Direktörü',
          phone: '+90 (312) 266 35 50',
          email: 'gokhan.cetin@stm.com.tr',
        },
        arelRepresentative: {
          name: 'Doç. Dr. Emre Çelik',
          title: 'Bilgisayar Mühendisliği Bölüm Bşk.',
          department: 'Mühendislik-Mimarlık Fakültesi',
          coordinationUnit: 'Arel TTO & Siber Lab',
        },
        stats: {
          totalActivities: 3,
          attendedStudents: 80,
          totalMeetings: 2,
          activeInterns: 4,
          score: 82,
        },
        notes: 'Veritabanı otomatik eşitleme servisiyle (PostgreSQL / API) sisteme çekildi.',
        createdAt: new Date().toISOString().slice(0, 10),
      },
      {
        id: `comp-dbsync-${Date.now()}-2`,
        code: `AREL-2026-${Math.floor(Math.random() * 800) + 201}`,
        name: 'Genveon İlaç Sanayi A.Ş.',
        shortName: 'GN',
        sector: 'İlaç & Biyoteknoloji Üretimi',
        address: 'Gebze OSB / Kocaeli',
        website: 'https://www.genveon.com.tr',
        scale: 'Büyük İşletme (800+ Çalışan)',
        protocolStatus: 'İmza Aşamasında',
        protocolNumber: 'PRT-2026-GEN-09',
        protocolSignDate: '01 Aralık 2026 (Planlanan)',
        protocolRenewDate: '01 Aralık 2029',
        protocolScope: ['Markalı Ders', 'Formülasyon Ar-Ge'],
        contactPerson: {
          name: 'Dr. Kerem Arslan',
          title: 'Formülasyon Ar-Ge Müdürü',
          phone: '+90 (262) 677 92 00',
          email: 'kerem.arslan@genveon.com.tr',
        },
        arelRepresentative: {
          name: 'Doç. Dr. Ahmet Yılmaz',
          title: 'Eczacılık Fakültesi Dekan Yard.',
          department: 'Eczacılık Fakültesi',
          coordinationUnit: 'ArelPro Kurumsal İlişkiler',
        },
        stats: {
          totalActivities: 1,
          attendedStudents: 35,
          totalMeetings: 1,
          activeInterns: 2,
          score: 75,
        },
        notes: 'Veritabanı API eşitlemesi ile içeri aktarıldı.',
        createdAt: new Date().toISOString().slice(0, 10),
      }
    ];

    const existing = StorageService.getCompanies();
    StorageService.saveCompanies([...incomingCompanies, ...existing]);

    // Update DB Config stats
    const now = new Date();
    const updatedConfig: DatabaseSyncConfig = {
      ...config,
      lastSyncTime: `Bugün, ${now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} (Otomatik)`,
      nextSyncTime: `Bugün, ${new Date(now.getTime() + config.frequencyMinutes * 60000).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`,
      successCount: config.successCount + incomingCompanies.length,
      status: 'connected',
    };
    StorageService.saveDbConfig(updatedConfig);

    // Record sync log
    StorageService.addSyncLog({
      source: 'Harici Veritabanı (SQL/API)',
      recordsProcessed: incomingCompanies.length,
      status: 'Başarılı',
      message: `${config.dbType} üzerinden ${incomingCompanies.length} yeni kurumsal partner kaydı ve ilişkili faaliyet verisi güncellendi.`,
    });

    return {
      importedCount: incomingCompanies.length,
      updatedCount: 0,
      message: `Senkronizasyon başarılı. ${incomingCompanies.length} yeni firma portföye eklendi.`,
    };
  }
};
