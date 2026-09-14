import React, { useState } from 'react';
import { DatabaseSyncConfig, SyncLog, Company, Activity, Meeting } from '../../types';
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
  ArrowDownToLine,
  ArrowUpFromLine
} from 'lucide-react';

interface SettingsViewProps {
  companies: Company[];
  activities: Activity[];
  meetings: Meeting[];
  onDataRefresh: () => void;
  initialSubTab?: 'db' | 'excel' | 'logs' | 'general';
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  companies,
  activities,
  meetings,
  onDataRefresh,
  initialSubTab = 'db',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'db' | 'excel' | 'logs' | 'general'>(initialSubTab);

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

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      const res = await DbSyncService.testConnection(config);
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, message: 'Bağlantı hatası meydana geldi.' });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSaveConfig = () => {
    DbSyncService.saveConfig(config);
    setSyncSuccessMessage('Veritabanı yapılandırması başarıyla kaydedildi!');
    setTimeout(() => setSyncSuccessMessage(null), 3000);
  };

  const handleRunSyncNow = async () => {
    setSyncing(true);
    setSyncSuccessMessage(null);
    try {
      const result = await DbSyncService.runSync();
      if (result.success) {
        setSyncSuccessMessage(`${result.insertedRecords} yeni kayıt dış veritabanından çekildi ve CRM sistemine işlendi.`);
        setLogs(DbSyncService.getLogs());
        onDataRefresh();
      }
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

  const handleConfirmImport = () => {
    if (!importPreview || importPreview.length === 0) return;

    if (importType === 'companies') {
      const existing = StorageService.getCompanies();
      const updated = [...importPreview, ...existing];
      StorageService.saveCompanies(updated);
      setImportSuccess(`${importPreview.length} adet firma portföye başarıyla aktarıldı!`);
    } else {
      const existing = StorageService.getActivities();
      const updated = [...importPreview, ...existing];
      StorageService.saveActivities(updated);
      setImportSuccess(`${importPreview.length} adet faaliyet listeye başarıyla aktarıldı!`);
    }

    setImportPreview(null);
    setExcelFile(null);
    onDataRefresh();
  };

  const handleResetToSeed = () => {
    if (window.confirm('Tüm verileri varsayılan başlangıç haline sıfırlamak istediğinize emin misiniz?')) {
      StorageService.resetToSeed();
      onDataRefresh();
      alert('Tüm veritabanı başarıyla başlangıç verilerine sıfırlandı.');
    }
  };

  return (
    <div className="flex flex-col w-full gap-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-[#00677d] uppercase tracking-wider font-bold">
              Sistem Mimarisi & Entegrasyonlar
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2E8F0]"></span>
            <span className="text-xs text-[#64748B] font-semibold">Veri Köprüsü</span>
          </div>
          <h1 className="text-2xl font-bold text-[#00478F] tracking-tight">
            Veritabanı Entegrasyonu & Excel Merkezi
          </h1>
          <p className="text-xs text-[#64748B] mt-0.5">
            Dış kurumsal veritabanlarından otomatik veri senkronizasyonu, Excel şablonlarıyla toplu aktarım ve sistem ayarları
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRunSyncNow}
            disabled={syncing}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#00478F] hover:bg-[#00356B] text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Senkronize Ediliyor...' : 'Şimdi Otomatik Senkronize Et'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-[#E2E8F0] shadow-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('db')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'db' ? 'bg-[#00478F] text-white shadow-xs' : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#f1f4f7]'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Veritabanı Entegrasyonu (Otomatik Çekme)</span>
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
          onClick={() => setActiveSubTab('logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeSubTab === 'logs' ? 'bg-[#00478F] text-white shadow-xs' : 'text-[#64748B] hover:text-[#1E293B] hover:bg-[#f1f4f7]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Senkronizasyon Günlüğü ({logs.length})</span>
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

      {/* SUBTAB 1: Veritabanı Entegrasyonu (User Requested: "Veritabanı entegrasyonu olacak. Verileri otomatik çekmesini istediğim bir veritabanı var") */}
      {activeSubTab === 'db' && (
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
                config.isConnected ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${config.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                {config.isConnected ? 'Bağlantı Aktif' : 'Bağlantı Bekliyor'}
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
                  Şifre (Güvenli Şifrelenmiş)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={config.password}
                    onChange={e => setConfig({ ...config, password: e.target.value })}
                    className="w-full h-10 px-3 rounded-lg bg-[#f1f4f7] border border-[#E2E8F0] font-semibold text-[#1E293B] focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Otomatik Senkronizasyon Periyodu */}
            <div className="p-4 rounded-xl bg-[#f1f4f7] border border-[#E2E8F0] flex flex-col gap-3 text-xs">
              <span className="font-bold text-[#1E293B] uppercase tracking-wide">
                Otomatik Veri Çekme Zamanlayıcısı
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#64748B] font-bold block mb-1">Senkronizasyon Sıklığı</label>
                  <select
                    value={config.syncFrequency}
                    onChange={e => setConfig({ ...config, syncFrequency: e.target.value as any })}
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
                    value={config.targetTable}
                    onChange={e => setConfig({ ...config, targetTable: e.target.value })}
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
                Otomatik Çekme Durumu
              </span>
              <div className="p-3 rounded-lg bg-[#f1f4f7] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Son Başarılı Çekme:</span>
                  <span className="font-bold text-[#1E293B]">{config.lastSyncDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Son Çekilen Kayıt:</span>
                  <span className="font-bold text-emerald-600">124 Kayıt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Bir Sonraki Planlı:</span>
                  <span className="font-bold text-[#00478F]">Bugün 18:00</span>
                </div>
              </div>

              <p className="text-[11px] text-[#64748B] leading-relaxed">
                Veritabanı servis modülü, yeni kurumsal kayıtları ve stajyer verilerini çekerken mevcut kayıtların kopyasını oluşturmaz, kimlik (vergi no / kod) eşleşmesiyle günceller.
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
              onClick={() => { DbSyncService.clearLogs(); setLogs([]); }}
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
