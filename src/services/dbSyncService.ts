import { DatabaseSyncConfig, SyncResult } from '../types';
import { StorageService } from './storageService';

const integrationUnavailableMessage =
  'Gerçek veri tabanı/API entegrasyonu henüz yapılandırılmadı. Kurumun onaylı API adresi ve erişim bilgileri gereklidir.';

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

  async clearLogs(): Promise<void> {
    await StorageService.clearLogs();
  },

  async runSync(config?: DatabaseSyncConfig): Promise<SyncResult> {
    return this.executeSync(config || this.getConfig());
  },

  async testConnection(
    _config: DatabaseSyncConfig,
  ): Promise<{ success: boolean; message: string; latencyMs: number }> {
    return {
      success: false,
      message: integrationUnavailableMessage,
      latencyMs: 0,
    };
  },

  async executeSync(_config: DatabaseSyncConfig): Promise<SyncResult> {
    return {
      success: false,
      importedCount: 0,
      updatedCount: 0,
      message: integrationUnavailableMessage,
    };
  },
};
