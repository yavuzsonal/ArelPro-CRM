# ArelPro CRM — İlk Sürümden Bugüne

Bu klasör, uygulamanın ilk CRM sürümü ile GitHub'daki mevcut sürüm arasındaki
değişiklikleri ve eklenen dosyaları kayıt altına alır.

## Karşılaştırma kapsamı

- İlk uygulama sürümü: `601008d` — `feat: initialize ArelPro CRM application project`
- Güncel sürüm: `45e3c98` — `Add Oracle Cloud VM deployment guide`
- Git karşılaştırması: `601008d..45e3c98`
- Sonuç: **19 dosya eklendi, 23 dosya değiştirildi, dosya silinmedi.**

İlk uygulama sürümünde CRM arayüzü, örnek kayıtlar, Excel araçları ve temel
Express/Gemini sunucusu bulunuyordu. CRM kayıtları ağırlıklı olarak tarayıcı
`localStorage` alanında tutuluyor; kullanıcı girişi, sunucu veritabanı,
yedekleme/geri yükleme, test paketi ve bu klasördeki canlı yayın belgeleri
bulunmuyordu.

## İşlevsel ve teknik değişiklikler

### Veri ve sunucu

- Tarayıcı depolaması yerine sunucu tarafında SQLite kalıcı CRM depolaması
  eklendi. Firma, faaliyet, toplantı, takvim ve senkronizasyon kayıtları SQLite
  API'si üzerinden okunup yazılır.
- İlk verilerin veritabanına bir kez aktarılması, sıralı/idempotent yazımlar ve
  eski tarayıcı kayıtlarının bir kez içe aktarılması sağlandı.
- Veritabanı şeması ve SQLite işlem/lock yönetimi eklendi.
- Uygulama artık gerekli yönetici ve oturum ayarları olmadan başlamaz; hosting
  `PORT` değerini kullanabilir ve üretimde derlenmiş frontend'i Express sunar.
- Gerçek harici veritabanı/kurumsal API bağlantısı olmadığı için ayarlardaki
  sahte bağlantı/senkronizasyon başarıları kaldırıldı. Bu entegrasyon, onaylı
  API ve şema bilgileri sağlanana kadar etkin değildir.

### Giriş ve güvenlik

- Giriş ekranı ve tek yönetici hesabı eklendi. Başlangıç yönetici bilgileri
  sunucu ortam değişkenlerinde tanımlanır; parola scrypt hash'i ile doğrulanır.
- Oturumlar imzalanır; cookie `HttpOnly`, `SameSite=Strict`, üretimde `Secure`
  olarak ayarlanır ve oturum süresi sınırlıdır.
- Yetkisiz CRM/AI API erişimi engellenir; başarısız giriş ve AI istekleri
  sınırlandırılır, yazma isteklerinde aynı-origin kontrolü uygulanır.
- Gemini anahtarı istemciye taşınmadan sunucu tarafında tutulur; AI girişinin
  boyutu/sıklığı sınırlandırılır.
- Excel veya firma kaydından gelen bağlantılar yalnızca HTTP/HTTPS ise açılır.
- Eski tarayıcı ayarlarında tutulmuş parola, token ve bağlantı sırları
  temizlenir; parola tarayıcı depolamasına yazılmaz.
- `xlsx` bağımlılığı güvenlik uyarıları nedeniyle `@e965/xlsx` 0.20.3 ile
  değiştirildi.

### Kullanıcı arayüzü ve CRM işlevleri

- Dashboard göstergeleri sabit örnek değerler yerine CRM kayıtlarından
  hesaplanır.
- Bildirim sayıları ve listesi faaliyet/toplantı kayıtlarından üretilir;
  bildirimler ilgili ekrana veya faaliyet detayına yönlendirir. Çıkış onay ister.
- Kullanıcı profili ve sunucu tarafında parola değiştirme akışı eklendi.
- Faaliyet detay görünümü; faaliyet/toplantı düzenleme ve iptal akışları ile
  ilişkili takvim kaydının eşzamanlanması eklendi. İptal, kaydı silmek yerine
  durumunu değiştirir.
- Mobil görünümde açılır/kapanır sidebar ve dar ekran uyarlamaları eklendi.
- Firma Excel dışa aktarımında firma adları ve satırları ilk sayfada gösterilir;
  rapor tablolarına özet, filtre ve okunabilir sütun genişlikleri eklendi.
- Büyük arayüz bölümleri ve modallar ayrı JavaScript paketlerine bölündü;
  amaç arayüz davranışını değiştirmeden ilk yüklemeyi hafifletmektir.
- Kullanılmayan/gerçek entegrasyonu olmayan veritabanı bağlantı ayarları
  arayüzden kaldırılarak profil, yedekleme ve Excel işlevleri öne çıkarıldı.

### İşletim, yedekleme ve yayınlama

- Canlı SQLite veritabanının tutarlı yedeğini alma ve doğrulanmış yedekten
  güvenli geri yükleme komutları eklendi.
- Yönetici oturumuyla kullanılabilen SQLite yedeği indirme API'si eklendi.
- GitHub Actions CI; Node.js 22 üzerinde bağımlılık kurma, TypeScript kontrolü,
  test ve frontend/backend üretim derlemesini çalıştırır.
- GitHub Pages dağıtımı kaldırıldı: statik Pages, Node API'sini veya SQLite
  dosyasını çalıştıramaz.
- Oracle Cloud Ubuntu VM, systemd ve Caddy/HTTPS dağıtım şablonları eklendi.
- Kurulum, ortam değişkenleri, yedekleme ve Oracle VM yayını README'de
  belgelendi.
- `.env.example` ve `.gitignore`, gerekli sunucu ayarları ve yerel sır/veritabanı
  dosyalarının kaynak kontrolü dışında tutulması için güncellendi.

## Dosya envanteri

### Eklenen dosyalar (19)

| Dosya | İçerik |
| --- | --- |
| `.github/workflows/ci.yml` | Push/elle tetiklenen CI doğrulamaları |
| `APP-REVIEW.md` | Uygulama, güvenlik bulguları, eksikler ve yayınlama incelemesi |
| `README.md` | Kurulum, çalıştırma, yedekleme ve yayınlama rehberi |
| `database/schema.sql` | SQLite tablo şeması |
| `deployment/Caddyfile.example` | Alan adı için HTTPS reverse proxy örneği |
| `deployment/arelpro.service` | Ubuntu systemd servis tanımı |
| `package-lock.json` | npm bağımlılık kilidi ve tekrarlanabilir `npm ci` kurulumu |
| `scripts/backupDatabase.ts` | SQLite yedekleme komutu |
| `scripts/restoreDatabase.ts` | SQLite geri yükleme komutu |
| `src/components/LoginView.tsx` | Giriş ekranı |
| `src/services/backupService.ts` | Tutarlı yedekleme ve doğrulamalı geri yükleme |
| `src/services/notificationService.ts` | Kayıtlardan bildirim türetme kuralları |
| `src/services/serverConfig.ts` | Sunucu ortam değişkenlerinin doğrulanması |
| `src/services/sqliteDatabase.ts` | SQLite bağlantısı, başlangıç verisi ve CRUD işlemleri |
| `src/services/urlService.ts` | Güvenli HTTP/HTTPS URL kontrolü |
| `tests/excelService.test.ts` | Firma Excel çalışma sayfası regresyon testi |
| `tests/notificationService.test.ts` | Bildirim kapsamı ve tarih testleri |
| `tests/serverAuth.test.ts` | Oturum, giriş, API erişimi ve istek güvenliği testleri |
| `tests/sqliteDatabase.test.ts` | SQLite kayıt, migration, yedek ve geri yükleme testleri |

### Değiştirilen dosyalar (23)

| Dosya | Değişikliğin özeti |
| --- | --- |
| `.env.example` | Yönetici, oturum, AI ve kalıcı veri ayarlarının örneği |
| `.gitignore` | Gerçek `.env`, SQLite ve yedeklerin dışlanması |
| `package.json` | Test/backup/restore script'leri, motor şartı ve güvenli Excel bağımlılığı |
| `server.ts` | Oturum doğrulama, API güvenliği, SQLite API'si, yedek, production sunucusu |
| `src/App.tsx` | Giriş durumu, sunucu verisi, bildirimler, mobil sidebar ve CRUD bağlantıları |
| `src/components/Header.tsx` | Bildirim yönlendirmesi, çıkış onayı ve mobil başlık menüsü |
| `src/components/Sidebar.tsx` | Dinamik bildirim sayısı ve mobil açılır menü bağlantısı |
| `src/components/modals/AiAssistantModal.tsx` | AI isteğinin güvenli sunucu API'sine taşınması |
| `src/components/modals/NewCompanyModal.tsx` | Sunucu/SQLite depolama akışına uyarlama |
| `src/components/modals/NewMeetingModal.tsx` | Toplantı düzenleme ve sunucu depolama akışına uyarlama |
| `src/components/views/ActivitiesView.tsx` | Detay, düzenleme, iptal ve iptal filtresi |
| `src/components/views/CalendarView.tsx` | Veritabanı kayıtları ve durum değişiklikleriyle uyum |
| `src/components/views/CompaniesView.tsx` | Güvenli bağlantı kullanımı ve dışa aktarma davranışı |
| `src/components/views/DashboardView.tsx` | Gerçek CRM verilerinden KPI ve grafikler |
| `src/components/views/MeetingsView.tsx` | Toplantı düzenleme, iptal ve ilişkili takvim davranışı |
| `src/components/views/SettingsView.tsx` | Profil/parola, SQLite yedeği ve kullanılabilir ayarlar |
| `src/data/initialData.ts` | Başlangıç kayıtlarının ve eski entegrasyon örneklerinin düzenlenmesi |
| `src/services/dbSyncService.ts` | Gerçek olmayan harici DB bağlantı/senkronizasyonunun kapatılması |
| `src/services/excelService.ts` | Firma listesinin ilk sayfaya alınması ve rapor görünüm iyileştirmeleri |
| `src/services/storageService.ts` | `localStorage` yerine API/SQLite okuma-yazma ve eski veri aktarımı |
| `src/types.ts` | İptal durumu ve yeni servis/API veri türleri |
| `tsconfig.json` | Sunucu/test dosyalarının tip kontrolü kapsamına alınması |
| `vite.config.ts` | HMR portu ve mobil geliştirme sunucusu yapılandırması |

## Doğrulama ve canlı ortam notları

Geliştirme sırasında TypeScript kontrolü, 11 test ve üretim derlemesi başarılı
oldu. Oracle Cloud üzerinde Ubuntu 24.04, Node.js 22, SQLite, systemd ve Caddy
kuruldu; uygulama HTTPS üzerinden `HTTP 200` yanıtı verdi.

Canlı dağıtım sırasında Linux'a özel Rollup optional dependency kurulum sorunu
görüldü ve VM'de mimariye uygun paket geçici olarak kurularak derleme tamamlandı.
Bu manuel `node_modules` düzeltmesi GitHub'a eklenmiş bir değişiklik değildir;
temiz dağıtımda tekrarlanabilir kurulum/CI dağıtım prosedürüyle doğrulanmalıdır.

Uygulama tek yönetici hesabı kullanır; kullanıcı/rol yönetimi ve kurum SSO'su
yoktur. Ollama/yerel LLM entegrasyonu yapılmamıştır. Harici ERP/veritabanı
bağlantısı onaylı API ve şema bilgileri beklediği için kapalıdır. SQLite'ın
kalıcı disk ve harici yedeklemesi işletim sorumluluğudur. SSH anahtarları,
parolalar ve API sırları bu klasöre yazılmamalı veya GitHub'a gönderilmemelidir.

> **Güvenlik hatırlatması:** Yönetici parolası geliştirme görüşmesi sırasında
> IDE'de görünür hale geldi. Güncel parola rotasyonunun tamamlandığı teyit
> edilmedi. Paylaşım öncesinde sunucu parolasını yeni, benzersiz bir değerle
> değiştirin; parola ve `.env` içeriğini bu belgeye eklemeyin.
