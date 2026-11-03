import React, { useState } from 'react';
import { Company, Activity, Meeting, DatabaseSyncConfig, SyncLog } from '../../types';
import { DbSyncService } from '../../services/dbSyncService';
import { ExcelService } from '../../services/excelService';
import { StorageService } from '../../services/storageService';
import { 
  Database,
  FileSpreadsheet, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Upload, 
  Sliders, 
  Server, 
  ShieldCheck, 
  Clock, 
  HardDrive, 
  Check, 
  FileText,
  Trash2,
  Lock,
  Users2,
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';

interface SettingsViewProps {
  companies: Company[];
  activities: Activity[];
  meetings: Meeting[];
  onDataRefresh: () => void;
  initialSubTab?: 'db' | 'excel' | 'logs' | 'general' | 'profile';
  username?: string;
  displayName?: string;
  onProfileUpdated?: (displayName: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  companies,
  activities,
  meetings,
  onDataRefresh,
  initialSubTab = 'profile',
  username = '',
  displayName = '',
  onProfileUpdated,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'db' | 'excel' | 'logs' | 'general' | 'profile'>(initialSubTab);

  // Sync subTab if prop changes
  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);
  
  // Database Configuration State
  const [config, setConfig] = useState<DatabaseSyncConfig>(DbSyncService.getConfig());
  const [logs, setLogs] = useState<SyncLog[]>(DbSyncService.getLogs());
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccessMessage, setSyncSuccessMessage] = useState<string | null>(null);

  // Excel Import State
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'companies' | 'activities'>('companies');
  const [importPreview, setImportPreview] = useState<any[] | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [profileName, setProfileName] = useState(displayName);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [creatingBackup, setCreatingBackup] = useState(false);

  React.useEffect(() => setProfileName(displayName), [displayName]);

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    setProfileError(null);
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: profileName }),
      });
      const result = await response.json() as { displayName?: string; error?: string };
      if (!response.ok || !result.displayName) throw new Error(result.error || 'Profil kaydedilemedi.');
      setProfileName(result.displayName);
      onProfileUpdated?.(result.displayName);
      setProfileMessage('Profil adı güncellendi.');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Profil kaydedilemedi.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event: React.FormEvent) => {
    event.preventDefault();
    setProfileMessage(null);
    setProfileError(null);
    try {
      const response = await fetch('/api/auth/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = response.status === 204 ? {} : await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || 'Parola güncellenemedi.');
      setCurrentPassword('');
      setNewPassword('');
      setProfileMessage('Parola güncellendi. Diğer etkin oturumlar sonlandırıldı.');
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'Parola güncellenemedi.');
    }
  };

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    setTestResult(null);
    try {
      const response = await fetch('/api/admin/backup', { method: 'POST' });
      if (!response.ok) {
        const result = await response.json() as { error?: string };
        throw new Error(result.error || 'Veritabanı yedeği alınamadı.');
      }
      const backupBlob = await response.blob();
      const objectUrl = URL.createObjectURL(backupBlob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `arelpro-${new Date().toISOString().slice(0, 10)}.sqlite`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Veritabanı yedeği alınamadı.',
      });
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await DbSyncService.testConnection(config);
      setTestResult(res);
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Bağlantı testi başarısız oldu.',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveConfig = () => {
    DbSyncService.saveConfig(config);
    setConfig(current => ({ ...current, password: '' }));
    setSyncSuccessMessage('Ayarlar kaydedildi. Dış bağlantı/zamanlayıcı henüz etkin değil; parola tarayıcıda saklanmadı.');
    setTimeout(() => setSyncSuccessMessage(null), 3000);
  };

  const handleRunSyncNow = async () => {
    setSyncing(true);
    setSyncSuccessMessage(null);
    try {
      const result = await DbSyncService.runSync(config);
      if (result.success) {
        setSyncSuccessMessage(`${result.importedCount} yeni kayıt içe aktarıldı.`);
        setLogs(DbSyncService.getLogs());
        onDataRefresh();
      } else {
        setTestResult({ success: false, message: result.message });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Senkronizasyon başarısız oldu.',
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    setImportError(null);
    setImportSuccess(null);

    try {
      if (importType === 'companies') {
        const parsed = await ExcelService.parseCompaniesExcel(file);
        setImportPreview(parsed);
      } else {
        const parsed = await ExcelService.parseActivitiesExcel(file);
        setImportPreview(parsed);
      }
    } catch (err: any) {
      setImportError('Excel dosyası çözümlenemedi. Lütfen geçerli bir format yükleyiniz.');
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview || importPreview.length === 0) return;

    try {
      if (importType === 'companies') {
        const existing = StorageService.getCompanies();
        const updated = [...importPreview, ...existing];
        await StorageService.saveCompanies(updated as Company[]);
        setImportSuccess(`${importPreview.length} adet firma portföye başarıyla aktarıldı!`);
      } else {
        const existing = StorageService.getActivities();
        const updated = [...importPreview, ...existing];
        await StorageService.saveActivities(updated as Activity[]);
        setImportSuccess(`${importPreview.length} adet faaliyet listeye başarıyla aktarıldı!`);
      }

      setImportPreview(null);
      setExcelFile(null);
      await onDataRefresh();
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'İçe aktarma başarısız oldu.');
    }
  };

  const handleResetToSeed = async () => {
    if (window.confirm('Tüm verileri varsayılan başlangıç haline sıfırlamak istediğinize emin misiniz?')) {
      try {
        await StorageService.resetToSeed();
        await onDataRefresh();
        alert('Tüm veritabanı başarıyla başlangıç verilerine sıfırlandı.');
      } catch (error) {
        setTestResult({
          success: false,
          message: error instanceof Error ? error.message : 'Veriler sıfırlanamadı.',
        });
      }
    }
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[#00677d] uppercase tracking-wider font-bold">
              Hesap & Sistem
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2E8F0]"></span>
            <span className="text-xs text-[#64748B] font-semibold">SQLite · Excel</span>
          </div>
          <h1 className="text-2xl font-bold text-[#00478F] tracking-tight">
            Ayarlar
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Profil bilgilerinizi, yerel SQLite veritabanınızı ve Excel aktarımlarınızı yönetin.
          </p>
        </div>

      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#E2E8F0] shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'profile' ? 'bg-[#00478F] text-white shadow-xs' : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#f1f4f7]'
          }`}
        >
          <Users2 className="w-4 h-4" />
          <span>Profil</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('db')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'db' ? 'bg-[#00478F] text-white shadow-xs' : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#f1f4f7]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>SQLite Veritabanı</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('excel')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'excel' ? 'bg-[#00478F] text-white shadow-xs' : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#f1f4f7]'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Excel ile İçe / Dışa Aktar</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'general' ? 'bg-[#00478F] text-white shadow-xs' : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#f1f4f7]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Genel & Sistem Sıfırlama</span>
        </button>
      </div>

      {activeSubTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <form onSubmit={handleSaveProfile} className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold text-[#1E293B]">Profil Bilgileri</h2>
              <p className="text-xs text-[#64748B] mt-1">Bu yönetici hesabında görünen adı güncelleyin.</p>
            </div>
            <label className="text-xs font-semibold text-[#475569]">
              Kullanıcı adı
              <input value={username} readOnly className="w-full h-10 mt-1 px-3 rounded-lg bg-slate-100 border border-[#E2E8F0] text-[#64748B]" />
            </label>
            <label className="text-xs font-semibold text-[#475569]">
              Görünen ad
              <input value={profileName} onChange={event => setProfileName(event.target.value)} required minLength={2} maxLength={80}
                className="w-full h-10 mt-1 px-3 rounded-lg bg-white border border-[#E2E8F0] text-[#1E293B]" />
            </label>
            <button type="submit" disabled={savingProfile} className="h-10 px-4 rounded-lg bg-[#00478F] text-white text-xs font-bold disabled:opacity-50">
              {savingProfile ? 'Kaydediliyor...' : 'Profil Adını Kaydet'}
            </button>
          </form>

          <form onSubmit={handleChangePassword} className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-bold text-[#1E293B]">Parola Değiştir</h2>
              <p className="text-xs text-[#64748B] mt-1">Yeni parola en az 16 karakter olmalıdır.</p>
            </div>
            <label className="text-xs font-semibold text-[#475569]">
              Mevcut parola
              <input type="password" autoComplete="current-password" value={currentPassword} onChange={event => setCurrentPassword(event.target.value)} required
                className="w-full h-10 mt-1 px-3 rounded-lg bg-white border border-[#E2E8F0]" />
            </label>
            <label className="text-xs font-semibold text-[#475569]">
              Yeni parola
              <input type="password" autoComplete="new-password" value={newPassword} onChange={event => setNewPassword(event.target.value)} required minLength={16}
                maxLength={1024} className="w-full h-10 mt-1 px-3 rounded-lg bg-white border border-[#E2E8F0]" />
            </label>
            <button type="submit" className="h-10 px-4 rounded-lg bg-[#00478F] text-white text-xs font-bold">Parolayı Güncelle</button>
          </form>
          {(profileMessage || profileError) && (
            <div className={`lg:col-span-2 p-3 rounded-lg border text-xs font-semibold ${profileError ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
              {profileError || profileMessage}
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'db' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 flex flex-col gap-5">
          <div className="flex items-start gap-3">
            <Database className="w-6 h-6 text-[#00478F]" />
            <div>
              <h2 className="text-sm font-bold text-[#1E293B]">Yerel SQLite Veritabanı</h2>
              <p className="text-xs text-[#64748B] mt-1">CRM kayıtları sunucu tarafındaki SQLite veritabanında saklanır. Harici veritabanı bağlantısı şu anda yapılandırılmamıştır.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[['Firma', companies.length], ['Faaliyet', activities.length], ['Toplantı', meetings.length]].map(([label, count]) => (
              <div key={label} className="rounded-lg bg-slate-50 border border-[#E2E8F0] p-4">
                <div className="text-xs text-[#64748B]">{label}</div><div className="text-xl font-bold text-[#00478F]">{count}</div>
              </div>
            ))}
          </div>
          {testResult && !testResult.success && <p className="text-xs text-rose-700">{testResult.message}</p>}
          <button type="button" onClick={handleCreateBackup} disabled={creatingBackup}
            className="inline-flex items-center justify-center gap-2 self-start h-10 px-4 rounded-lg bg-[#00478F] text-white text-xs font-bold disabled:opacity-50">
            <Download className="w-4 h-4" />{creatingBackup ? 'Yedek hazırlanıyor...' : 'SQLite Yedeğini İndir'}
          </button>
        </div>
      )}

      {/* Retired external database sync UI; configured providers are not connected to this application. */}
      {false && activeSubTab === 'db' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main DB Config Form (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#00478F] flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1E293B]">Harici Kurumsal Veritabanı Bağlantısı</h3>
                  <p className="text-xs text-[#64748B]">
                    Üniversitenin mevcut SQL veya REST veritabanından firma ve faaliyet verilerini otomatik çeker
                  </p>
                </div>
              </div>

              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                config.status === 'connected' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${config.status === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                {config.status === 'connected' ? 'Bağlantı Aktif' : 'Bağlantı Bekliyor'}
              </span>
            </div>

            {syncSuccessMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{syncSuccessMessage}</span>
              </div>
            )}

            {testResult && (
              <div className={`p-3 rounded-lg border text-xs font-bold flex items-center gap-2 ${
                testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[11px] uppercase font-bold text-[#64748B] block mb-1">
                  Veritabanı Türü (RDBMS / API)
                </label>
                <select
                  value={config.dbType}
                  onChange={e => setConfig({ ...config, dbType: e.target.value as any })}
                  className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] font-bold text-[#1E293B] focus:outline-none"
                >
                  <option value="PostgreSQL">PostgreSQL (Önerilen)</option>
                  <option value="MSSQL">Microsoft SQL Server (Arel Kampüs DB)</option>
                  <option value="MySQL">MySQL / MariaDB</option>
                  <option value="Oracle">Oracle Database</option>
                  <option value="REST_API">REST Webhook / JSON API Endpoint</option>
                  <option value="SQLite">Yerel SQLite Dosyası</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-[#64748B] block mb-1">
                  Sunucu / Host Adresi
                </label>
                <input
                  type="text"
                  value={config.host}
                  onChange={e => setConfig({ ...config, host: e.target.value })}
                  placeholder="Örn: db.arel.edu.tr veya 192.168.1.50"
                  className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] font-semibold text-[#1E293B] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-[#64748B] block mb-1">
                  Port Numarası
                </label>
                <input
                  type="number"
                  value={config.port}
                  onChange={e => setConfig({ ...config, port: parseInt(e.target.value, 10) || 5432 })}
                  className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] font-semibold text-[#1E293B] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-[#64748B] block mb-1">
                  Veritabanı Adı (Database Name)
                </label>
                <input
                  type="text"
                  value={config.databaseName}
                  onChange={e => setConfig({ ...config, databaseName: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] font-semibold text-[#1E293B] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-[#64748B] block mb-1">
                  Kullanıcı Adı
                </label>
                <input
                  type="text"
                  value={config.username}
                  onChange={e => setConfig({ ...config, username: e.target.value })}
                  className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] font-semibold text-[#1E293B] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold text-[#64748B] block mb-1">
                  Şifre (Bu oturumda saklanmaz)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={config.password || ''}
                    onChange={e => setConfig({ ...config, password: e.target.value })}
                    autoComplete="new-password"
                    className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] font-semibold text-[#1E293B] focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Otomatik Senkronizasyon Periyodu */}
            <div className="p-4 rounded-xl bg-[#f1f4f7] border border-[#E2E8F0] flex flex-col gap-3 text-xs">
              <span className="font-bold text-[#1E293B] uppercase tracking-wide">
                Senkronizasyon Tercihi
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#64748B] font-bold block mb-1">Senkronizasyon Sıklığı</label>
                  <select
                    value={config.syncFrequency}
                    onChange={e => setConfig({ ...config, syncFrequency: e.target.value as DatabaseSyncConfig['syncFrequency'] })}
                    className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] font-bold text-[#1E293B]"
                  >
                    <option value="HOURLY">Her 1 Saatte Bir Otomatik Çek</option>
                    <option value="DAILY">Her Gece 02:00 (Günlük)</option>
                    <option value="EVERY_6_HOURS">Her 6 Saatte Bir</option>
                    <option value="MANUAL">Yalnızca Manuel Butonla</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-[#64748B] font-bold block mb-1">Hedef Tablo / Eşleşme</label>
                  <input
                    type="text"
                    value={config.tableName}
                    onChange={e => setConfig({ ...config, tableName: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-white border border-[#E2E8F0] font-semibold text-[#1E293B]"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#1E293B] text-xs font-bold cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#00677d]" />
                <span>{testingConnection ? 'Test Ediliyor...' : 'Bağlantıyı Test Et'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#00478F] hover:bg-[#00356B] text-white text-xs font-bold cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Yapılandırmayı Kaydet</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Status Panel (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 flex flex-col gap-3 text-xs">
              <span className="font-bold text-[#1E293B] uppercase text-[11px] text-[#00478F]">
                Veri Senkronizasyon Durumu
              </span>
              <div className="p-3 rounded-lg bg-[#f1f4f7] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Son Başarılı Çekme:</span>
                  <span className="font-bold text-[#1E293B]">{config.lastSyncDate || 'Henüz senkronizasyon yapılmadı'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Son Çekilen Kayıt:</span>
                  <span className="font-bold text-emerald-600">{config.successCount} Kayıt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Bir Sonraki Planlı:</span>
                  <span className="font-bold text-[#00478F]">{config.nextSyncTime || 'Etkin değil'}</span>
                </div>
              </div>

              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Gerçek veri tabanı bağlantısı henüz yapılandırılmadı. Entegrasyon kurulana kadar dış sistemden veri çekilmez.
              </p>

              <button
                type="button"
                onClick={handleRunSyncNow}
                disabled={syncing}
                className="w-full py-2.5 rounded-lg bg-[#00677d] hover:bg-[#005c70] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>Hemen Çek ve Güncelle</span>
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-[#00478F] flex flex-col gap-2">
              <span className="font-bold flex items-center gap-1.5">
                <HardDrive className="w-4 h-4" />
                <span>Geçici Excel Köprüsü Açık</span>
              </span>
              <p className="text-[11px] text-[#64748B]">
                Veritabanı API erişim izni açılana kadar sağlanan Excel içe aktarım merkezini kullanarak portföyünüzü anında besleyebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Excel ile İçe / Dışa Aktar (User Requested: "Şimdilik excel ile içeri aktarabilirim") */}
      {activeSubTab === 'excel' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Upload Area (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 flex flex-col gap-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-sm font-bold text-[#1E293B]">Excel ile Toplu Veri Yükleme</h3>
                <p className="text-xs text-[#64748B]">
                  Kurumsal firma portföyü veya faaliyet kayıtlarını Excel dosyası yükleyerek sisteme aktarabilirsiniz
                </p>
              </div>

              {/* Template download buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => ExcelService.downloadCompanyTemplate()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f1f4f7] hover:bg-slate-200 text-[#00478F] text-xs font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Firma Şablonu İndir</span>
                </button>
                <button
                  type="button"
                  onClick={() => ExcelService.downloadActivityTemplate()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f1f4f7] hover:bg-slate-200 text-[#00677d] text-xs font-bold cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Faaliyet Şablonu İndir</span>
                </button>
              </div>
            </div>

            {/* Import Type Selector */}
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold text-[#1E293B]">Yüklenecek Veri Türü:</span>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="import_type"
                  checked={importType === 'companies'}
                  onChange={() => setImportType('companies')}
                  className="text-[#00478F]"
                />
                <span className="font-bold text-[#1E293B]">Firma Kartları & Portföy</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="import_type"
                  checked={importType === 'activities'}
                  onChange={() => setImportType('activities')}
                  className="text-[#00478F]"
                />
                <span className="font-bold text-[#1E293B]">Faaliyet & Etkinlik Kayıtları</span>
              </label>
            </div>

            {importSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{importSuccess}</span>
              </div>
            )}

            {importError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{importError}</span>
              </div>
            )}

            {/* Drag and Drop Zone */}
            <label className="border-2 border-dashed border-[#E2E8F0] hover:border-[#00478F] rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-[#f1f4f7]/40 cursor-pointer transition-colors text-center">
              <Upload className="w-8 h-8 text-[#00478F]" />
              <div>
                <span className="font-bold text-xs text-[#1E293B] block">
                  Excel Dosyasını Sürükleyip Bırakın veya Seçmek İçin Tıklayın
                </span>
                <span className="text-[11px] text-[#64748B]">Desteklenen formatlar: .xlsx, .xls (Maksimum 25 MB)</span>
              </div>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>

            {/* Import Preview Table */}
            {importPreview && importPreview.length > 0 && (
              <div className="flex flex-col gap-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E293B]">
                    Yüklenen Dosya Önizlemesi ({importPreview.length} Kayıt Bulundu)
                  </span>
                  <button
                    type="button"
                    onClick={handleConfirmImport}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{importPreview.length} Kaydı Sisteme Aktar</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-[#E2E8F0] max-h-60">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#f1f4f7] text-[#64748B] font-bold uppercase text-[10px]">
                      <tr>
                        <th className="py-2 px-3">Adı / Başlık</th>
                        <th className="py-2 px-3">{importType === 'companies' ? 'Sektör' : 'Tür'}</th>
                        <th className="py-2 px-3">{importType === 'companies' ? 'Yetkili' : 'Firma'}</th>
                        <th className="py-2 px-3">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0]">
                      {importPreview.slice(0, 5).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-bold text-[#1E293B]">{item.name || item.title}</td>
                          <td className="py-2 px-3">{item.sector || item.type}</td>
                          <td className="py-2 px-3">{item.contactPerson?.name || item.companyName}</td>
                          <td className="py-2 px-3 text-emerald-600 font-bold">{item.protocolStatus || item.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Export Center (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-5 flex flex-col gap-3 text-xs">
              <span className="font-bold text-[#1E293B] uppercase text-[11px] text-[#00478F]">
                Tüm Verileri Dışa Aktar (Backup)
              </span>
              <p className="text-[#64748B] text-[11px]">
                Sistemdeki tüm kayıtları tek tıkla Excel veya JSON olarak yedekleyebilirsiniz.
              </p>

              <button
                type="button"
                onClick={() => ExcelService.exportCompaniesToExcel(companies)}
                className="w-full py-2.5 rounded-lg bg-[#f1f4f7] hover:bg-slate-200 text-[#1E293B] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-[#E2E8F0]"
              >
                <ArrowDownToLine className="w-4 h-4 text-[#00478F]" />
                <span>Firmalar Listesi ({companies.length})</span>
              </button>

              <button
                type="button"
                onClick={() => ExcelService.exportActivitiesToExcel(activities, [])}
                className="w-full py-2.5 rounded-lg bg-[#f1f4f7] hover:bg-slate-200 text-[#1E293B] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-[#E2E8F0]"
              >
                <ArrowDownToLine className="w-4 h-4 text-[#00677d]" />
                <span>Faaliyetler Listesi ({activities.length})</span>
              </button>

              <button
                type="button"
                onClick={() => ExcelService.exportMeetingsToExcel(meetings)}
                className="w-full py-2.5 rounded-lg bg-[#f1f4f7] hover:bg-slate-200 text-[#1E293B] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-[#E2E8F0]"
              >
                <ArrowDownToLine className="w-4 h-4 text-emerald-600" />
                <span>Toplantı Tutanakları ({meetings.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Senkronizasyon Günlüğü */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Veritabanı Senkronizasyon Günlüğü</h3>
              <p className="text-xs text-[#64748B]">Geçmiş otomatik ve manuel veri aktarım kayıtları</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  await DbSyncService.clearLogs();
                  setLogs([]);
                } catch (error) {
                  setTestResult({
                    success: false,
                    message: error instanceof Error ? error.message : 'Senkronizasyon kayıtları silinemedi.',
                  });
                }
              }}
              className="text-xs text-rose-600 hover:underline font-bold"
            >
              Günlüğü Temizle
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-[#E2E8F0]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#f1f4f7] text-[#64748B] font-bold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Zaman</th>
                  <th className="py-2.5 px-3">Kaynak</th>
                  <th className="py-2.5 px-3">Durum</th>
                  <th className="py-2.5 px-3">Kayıt Sayısı</th>
                  <th className="py-2.5 px-3">Açıklama / Mesaj</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {logs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-medium text-[#1E293B]">{log.timestamp}</td>
                    <td className="py-2.5 px-3 font-semibold text-[#00478F]">{log.source}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        log.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {log.status === 'SUCCESS' ? 'BAŞARILI' : 'HATA'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-[#1E293B]">{log.recordsProcessed}</td>
                    <td className="py-2.5 px-3 text-[#64748B]">{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Genel & Sıfırlama */}
      {activeSubTab === 'general' && (
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-xs p-6 flex flex-col gap-6 max-w-2xl">
          <div>
            <h3 className="text-sm font-bold text-[#1E293B]">Kurumsal Tercihler & Kimlik</h3>
            <p className="text-xs text-[#64748B]">Sistem geneli varsayılan değerler</p>
          </div>

          <div className="flex flex-col gap-3 text-xs">
            <div>
              <label className="font-bold text-[#1E293B] block mb-1">Kurum Adı</label>
              <input
                type="text"
                readOnly
                value="İstanbul Arel Üniversitesi - Kurumsal İlişkiler & TTO"
                className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] font-bold text-[#00478F]"
              />
            </div>
            <div>
              <label className="font-bold text-[#1E293B] block mb-1">Aktif Akademik Dönem</label>
              <input
                type="text"
                readOnly
                value="2026-2027 Güz Dönemi"
                className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] font-semibold text-[#1E293B]"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-rose-100 flex flex-col gap-2">
            <span className="text-xs font-bold text-rose-700">Tehlikeli Bölge</span>
            <p className="text-[11px] text-[#64748B]">
              Tüm eklenen veya düzenlenen kayıtları sıfırlar, demo portföyü yeniden yükler.
            </p>
            <button
              type="button"
              onClick={handleResetToSeed}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer self-start"
            >
              <Trash2 className="w-4 h-4" />
              <span>Veritabanını Başlangıç Verilerine Sıfırla</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
