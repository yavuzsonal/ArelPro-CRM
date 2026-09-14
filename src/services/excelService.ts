import * as XLSX from 'xlsx';
import { Company, Activity, Meeting } from '../types';
import { StorageService } from './storageService';

export interface ParsedExcelResult {
  companies: Partial<Company>[];
  activities: Partial<Activity>[];
  totalRows: number;
  sheetNames: string[];
  rawHeaders: string[];
  rawPreview: Record<string, any>[];
  errors: string[];
}

export const ExcelService = {
  /**
   * Generates a sample Excel template for University Corporate Relations CRM
   */
  downloadSampleTemplate(): void {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Kurumsal Firma Portföyü
    const companyHeaders = [
      'Firma Kodu',
      'Firma / Kurum Tam Adı',
      'Sektör',
      'Adres / Yerleşke',
      'Resmi Web Sitesi',
      'Ölçek',
      'Protokol Durumu (Aktif / İmza Aşamasında / Müzakere / Pasif)',
      'Protokol No',
      'İmza Tarihi',
      'Yenileme Tarihi',
      'Firma Yetkilisi Adı Soyadı',
      'Yetkili Unvanı',
      'Yetkili Telefonu',
      'Yetkili E-Postası',
      'Arel İrtibat Sorumlusu',
      'Sorumlu Fakülte / Birim',
      'Açıklama / Notlar'
    ];

    const sampleCompanies = [
      [
        'AREL-2026-099',
        'Baykar Teknoloji San. ve Tic. A.Ş.',
        'Havacılık, İHA & Yazılım',
        'Özdemir Bayraktar Milli İHA Ar-Ge Merkezi / Hadımköy',
        'https://baykartech.com',
        'Büyük İşletme (4000+ Çalışan)',
        'Aktif',
        'PRT-2025-110',
        '01.09.2025',
        '01.09.2028',
        'Haluk Gürbüz',
        'İnsan Kaynakları & Akademi Lideri',
        '+90 (212) 867 09 00',
        'akademi@baykartech.com',
        'Prof. Dr. Mehmet Kaya',
        'Mühendislik Fakültesi',
        'İHA sistemleri stajyer istihdamı ve mezun burs protokolü.'
      ],
      [
        'AREL-2026-100',
        'Havelsan Hava Elektronik San. A.Ş.',
        'Bilişim, Siber Güvenlik & Simülasyon',
        'Mustafa Kemal Mah. / Ankara',
        'https://www.havelsan.com.tr',
        'Büyük İşletme (2000+ Çalışan)',
        'İmza Aşamasında',
        'PRT-2026-044',
        '10.12.2026',
        '10.12.2029',
        'Sinan Yılmaz',
        'Ar-Ge ve Akademi Koordinatörü',
        '+90 (312) 219 57 80',
        'akademi@havelsan.com.tr',
        'Doç. Dr. Ahmet Yılmaz',
        'Bilgisayar Mühendisliği & TTO',
        'Siber Güvenlik Çalıştayı ve ortak sertifika eğitimi.'
      ]
    ];

    const wsCompanies = XLSX.utils.aoa_to_sheet([companyHeaders, ...sampleCompanies]);
    XLSX.utils.book_append_sheet(wb, wsCompanies, 'Firma Portföyü');

    // Sheet 2: Faaliyetler & Etkinlikler
    const activityHeaders = [
      'Faaliyet Kodu',
      'Faaliyet Başlığı / Konusu',
      'Faaliyet Türü (Markalı Ders / Teknik Gezi / Ar-Ge / Seminer)',
      'İlgili Firma / Paydaş',
      'Tarih (GG.AA.YYYY)',
      'Saat Aralığı',
      'Yer / Salon',
      'Düzenleyen Bölüm',
      'Düzenleyen Birim',
      'Koordinatör / Yetkili',
      'Hedef Öğrenci Sayısı',
      'Durum (Planlandı / Tamamlandı / Onay Bekliyor)',
      'Ders Kodu (Markalı Ders ise)',
      'Eğitmen Adı',
      'Açıklama'
    ];

    const sampleActivities = [
      [
        'FL-2026-920',
        'Siber Güvenlikte Güncel Tehdit Modellemesi',
        'Seminer & Zirve',
        'Havelsan Hava Elektronik San. A.Ş.',
        '15.12.2026',
        '14:00 - 16:30',
        'Kemal Gözükara Konferans Salonu',
        'Bilgisayar Mühendisliği',
        'Mühendislik Fakültesi',
        'Doç. Dr. Emre Çelik',
        180,
        'Planlandı',
        '',
        'Sinan Yılmaz',
        'Öğrencilere yönelik siber tehditler ve kariyer fırsatları semineri.'
      ]
    ];

    const wsActivities = XLSX.utils.aoa_to_sheet([activityHeaders, ...sampleActivities]);
    XLSX.utils.book_append_sheet(wb, wsActivities, 'Faaliyet Listesi');

    XLSX.writeFile(wb, 'ArelPro_Kurumsal_Iliskiler_Sablon.xlsx');
  },

  /**
   * Export current CRM companies to Excel
   */
  exportCompaniesToExcel(companies: Company[]): void {
    const wb = XLSX.utils.book_new();

    const data = companies.map(c => ({
      'Firma Kodu': c.code,
      'Firma Adı': c.name,
      'Sektör': c.sector,
      'Protokol Durumu': c.protocolStatus,
      'Protokol No': c.protocolNumber || '-',
      'İmza Tarihi': c.protocolSignDate || '-',
      'Yenileme Tarihi': c.protocolRenewDate || '-',
      'Yetkili Adı': c.contactPerson.name,
      'Yetkili Unvanı': c.contactPerson.title,
      'Yetkili Tel': c.contactPerson.phone,
      'Yetkili E-Posta': c.contactPerson.email,
      'Arel Sorumlusu': c.arelRepresentative.name,
      'Sorumlu Birim': c.arelRepresentative.coordinationUnit,
      'Toplam Faaliyet': c.stats.totalActivities,
      'Katılan Öğrenci': c.stats.attendedStudents,
      'Yapılan Toplantı': c.stats.totalMeetings,
      'Aktif Stajyer': c.stats.activeInterns,
      'Kurumsal Skor': c.stats.score,
      'Adres': c.address,
      'Web Sitesi': c.website,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Kurumsal Portföy');
    XLSX.writeFile(wb, `ArelPro_Firma_Portfoyu_${new Date().toISOString().slice(0, 10)}.xlsx`);
  },

  /**
   * Export activities & meetings
   */
  exportActivitiesToExcel(activities: Activity[], meetings: Meeting[]): void {
    const wb = XLSX.utils.book_new();

    const actData = activities.map(a => ({
      'Faaliyet Kodu': a.code,
      'Faaliyet Başlığı': a.title,
      'Tür': a.type,
      'Firma': a.companyName,
      'Tarih': a.date,
      'Saat': a.timeRange,
      'Yer': a.location,
      'Bölüm': a.department,
      'Koordinatör': a.coordinator,
      'Hedef Öğrenci': a.targetStudents,
      'Katılan': a.attendedStudents || 0,
      'Durum': a.status,
    }));

    const mtgData = meetings.map(m => ({
      'Toplantı Kodu': m.code,
      'Toplantı Başlığı': m.title,
      'Firma': m.companyName,
      'Tarih': m.date,
      'Saat': m.timeRange,
      'Format': m.format,
      'Lokasyon': m.location,
      'Firma Katılımcıları': m.companyAttendees,
      'Arel Heyeti': m.arelAttendees,
      'Moderatör': m.moderator,
      'Karar / Aksiyon': m.decisionsAndActions,
      'Durum': m.status,
    }));

    const ws1 = XLSX.utils.json_to_sheet(actData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Faaliyetler');

    const ws2 = XLSX.utils.json_to_sheet(mtgData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Toplantılar & Görüşmeler');

    XLSX.writeFile(wb, `ArelPro_Faaliyet_ve_Toplanti_Raporu_${new Date().toISOString().slice(0, 10)}.xlsx`);
  },

  exportMeetingsToExcel(meetings: Meeting[]): void {
    const wb = XLSX.utils.book_new();
    const mtgData = meetings.map(m => ({
      'Toplantı Kodu': m.code,
      'Toplantı Başlığı': m.title,
      'Firma': m.companyName,
      'Tarih': m.date,
      'Saat': m.timeRange,
      'Format': m.format,
      'Lokasyon': m.location,
      'Firma Katılımcıları': m.companyAttendees,
      'Arel Heyeti': m.arelAttendees,
      'Moderatör': m.moderator,
      'Karar / Aksiyon': m.decisionsAndActions,
      'Durum': m.status,
    }));
    const ws = XLSX.utils.json_to_sheet(mtgData);
    XLSX.utils.book_append_sheet(wb, ws, 'Toplantı Tutanakları');
    XLSX.writeFile(wb, `ArelPro_Toplanti_Tutanaklari_${new Date().toISOString().slice(0, 10)}.xlsx`);
  },

  downloadCompanyTemplate(): void {
    this.downloadSampleTemplate();
  },

  downloadActivityTemplate(): void {
    this.downloadSampleTemplate();
  },

  async parseCompaniesExcel(file: File): Promise<Company[]> {
    const res = await this.parseUploadedFile(file);
    return res.companies as Company[];
  },

  async parseActivitiesExcel(file: File): Promise<Activity[]> {
    const res = await this.parseUploadedFile(file);
    return res.activities as Activity[];
  },

  /**
   * Parse uploaded file (.xlsx, .xls, .csv)
   */
  async parseUploadedFile(file: File): Promise<ParsedExcelResult> {
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });

    const errors: string[] = [];
    const sheetNames = wb.SheetNames;
    if (sheetNames.length === 0) {
      throw new Error('Yüklenen dosyada herhangi bir çalışma sayfası (Sheet) bulunamadı.');
    }

    const firstSheetName = sheetNames[0];
    const ws = wb.Sheets[firstSheetName];
    const rawJson: Record<string, any>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

    if (!rawJson || rawJson.length === 0) {
      throw new Error('Çalışma sayfasında okunabilir veri satırı bulunamadı.');
    }

    const rawHeaders = Object.keys(rawJson[0]);

    // Intelligently map rows to Company / Activity objects
    const companies: Partial<Company>[] = [];
    const activities: Partial<Activity>[] = [];

    rawJson.forEach((row, index) => {
      // Find company name in row
      const nameKey = Object.keys(row).find(k => 
        /firma|şirket|kurum|company|partner|ad|isim/i.test(k)
      ) || rawHeaders[1] || rawHeaders[0];

      const companyName = String(row[nameKey] || '').trim();
      if (!companyName) return; // Skip empty row

      const sectorKey = Object.keys(row).find(k => /sektör|sector|alan/i.test(k));
      const sector = sectorKey ? String(row[sectorKey]) : 'Sanayi & Teknoloji';

      const contactKey = Object.keys(row).find(k => /yetkili|contact|kişi|temsilci/i.test(k));
      const contactName = contactKey ? String(row[contactKey]) : 'Yetkili Belirtilmedi';

      const phoneKey = Object.keys(row).find(k => /tel|telefon|phone/i.test(k));
      const phone = phoneKey ? String(row[phoneKey]) : '+90 (212) 000 00 00';

      const emailKey = Object.keys(row).find(k => /mail|posta|email/i.test(k));
      const email = emailKey ? String(row[emailKey]) : 'info@kurum.com';

      const protocolKey = Object.keys(row).find(k => /protokol|durum|status/i.test(k));
      const rawProt = protocolKey ? String(row[protocolKey]) : 'Aktif';
      let protocolStatus: Company['protocolStatus'] = 'Aktif';
      if (/imza|pending|aşama/i.test(rawProt)) protocolStatus = 'İmza Aşamasında';
      else if (/müzakere|nego/i.test(rawProt)) protocolStatus = 'Müzakere';
      else if (/pasif|yok/i.test(rawProt)) protocolStatus = 'Pasif';

      const arelRepKey = Object.keys(row).find(k => /arel|sorumlu|koordinatör|hoca/i.test(k));
      const arelRepName = arelRepKey ? String(row[arelRepKey]) : 'Yavuz Selim Önal';

      const comp: Partial<Company> = {
        id: `comp-excel-${Date.now()}-${index}`,
        code: `AREL-2026-${String(index + 101).padStart(3, '0')}`,
        name: companyName,
        shortName: companyName.slice(0, 2).toUpperCase(),
        sector: sector,
        address: String(row['Adres / Yerleşke'] || row['Adres'] || 'İstanbul'),
        website: String(row['Resmi Web Sitesi'] || row['Web'] || 'https://www.arel.edu.tr'),
        scale: String(row['Ölçek'] || 'Orta / Büyük Ölçekli'),
        protocolStatus: protocolStatus,
        protocolNumber: String(row['Protokol No'] || `PRT-2026-${index + 100}`),
        protocolSignDate: String(row['İmza Tarihi'] || '01.10.2026'),
        protocolRenewDate: String(row['Yenileme Tarihi'] || '01.10.2029'),
        contactPerson: {
          name: contactName,
          title: String(row['Yetkili Unvanı'] || 'Kurumsal Temsilci'),
          phone: phone,
          email: email,
        },
        arelRepresentative: {
          name: arelRepName,
          title: 'Kurumsal İlişkiler Yöneticisi',
          department: String(row['Sorumlu Fakülte / Birim'] || 'Teknoloji Transfer Ofisi (TTO)'),
          coordinationUnit: 'ArelPro Kurumsal İlişkiler Ofisi',
        },
        stats: {
          totalActivities: 1,
          attendedStudents: 25,
          totalMeetings: 1,
          activeInterns: 1,
          score: 70,
        },
        notes: String(row['Açıklama / Notlar'] || row['Açıklama'] || 'Excel içe aktarımı ile sisteme kaydedildi.'),
        createdAt: new Date().toISOString().slice(0, 10),
      };

      companies.push(comp);

      // Check if row has an activity
      const actTitleKey = Object.keys(row).find(k => /faaliyet|konu|başlık|activity/i.test(k));
      if (actTitleKey && row[actTitleKey]) {
        const actTitle = String(row[actTitleKey]).trim();
        if (actTitle && actTitle !== companyName) {
          activities.push({
            id: `act-excel-${Date.now()}-${index}`,
            code: `FL-2026-${index + 900}`,
            title: actTitle,
            type: 'Seminer & Zirve',
            companyId: comp.id!,
            companyName: companyName,
            date: '2026-12-10',
            timeRange: '14:00 - 16:00',
            location: 'Kemal Gözükara Yerleşkesi',
            department: 'TTO & Fakülteler',
            coordinationUnit: 'Arel Kurumsal İlişkiler',
            coordinator: arelRepName,
            targetStudents: 50,
            status: 'Planlandı',
            academicTerm: '2026-2027 Güz',
            description: 'Excel aktarımı ile otomatik oluşturuldu.',
            createdAt: new Date().toISOString().slice(0, 10),
          });
        }
      }
    });

    return {
      companies,
      activities,
      totalRows: rawJson.length,
      sheetNames,
      rawHeaders,
      rawPreview: rawJson.slice(0, 5),
      errors,
    };
  },

  /**
   * Commit parsed companies & activities to Storage
   */
  commitImport(companies: Company[], activities: Activity[]): number {
    const existingCompanies = StorageService.getCompanies();
    const existingActivities = StorageService.getActivities();

    StorageService.saveCompanies([...companies, ...existingCompanies]);
    if (activities.length > 0) {
      StorageService.saveActivities([...activities, ...existingActivities]);
    }

    StorageService.addSyncLog({
      source: 'Excel Dosyası',
      recordsProcessed: companies.length + activities.length,
      status: 'Başarılı',
      message: `${companies.length} firma kaydı ve ${activities.length} faaliyet başarıyla içe aktarıldı.`,
    });

    return companies.length + activities.length;
  }
};
