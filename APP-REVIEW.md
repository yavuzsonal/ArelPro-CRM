# ArelPro CRM: Calistirma, Eksikler ve Canliya Alma

Inceleme tarihi: 2026-11-03

## Duzeltme durumu (2026-11-03)

CRM arayuzunun yerlesimi degistirilmeden kod ve ayarlar elden gecirildi; erisim
kontrolu icin ayri bir giris ekrani olusturuldu:

- Excel'den gelen ve kayitli firma adresleri yalnizca `http:` / `https:` ise
  tiklanabilir; `javascript:` gibi adresler baglanti olarak kullanilmaz.
- DB ayarlarindaki parola ve eski token/connection-string degerleri tarayici
  depolamasindan cikarilir. Ilk acilista eski kayitlar da temizlenir.
- DB baglanti testi ve senkronizasyon artik gercek olmayan basari veya ornek
  firma uretmez; gercek entegrasyon yoksa bunu hata olarak bildirir.
- Sahte baglanti durumu ve baslangic senkronizasyon loglari kaldirildi.
- CRM API'leri artik sunucu tarafinda dogrulanan oturum olmadan kullanilamaz.
  Ilk yonetici hesabi `.env` icindeki `ADMIN_USERNAME` / `ADMIN_PASSWORD` ile
  belirlenir; parola scrypt ile karsilastirilir. Oturum cookie'si HttpOnly,
  SameSite=Strict ve 8 saat omurludur (canlida Secure). Gecersiz giris denemeleri sinirlanir;
  yazma istekleri ayni origin kontrolunden gecer. Kurum SSO'su ve coklu kullanici
  rolleri henuz yoktur.
- Gemini endpoint'i girdi boyutu ve istek hizini sinirlar; oturum acmayi gerektirir.
  `GEMINI_API_KEY` sadece sunucu `.env` dosyasinda veya secret manager'da tutulur.
- Sunucu platformun `PORT` degerini kullanir; Windows uyumlu temizleme script'i
  eklendi.
- `npm run db:backup`, calisan SQLite veritabaninin tutarli bir kopyasini
  `data/backups/` altina alir; yedeklerin sunucu disina kopyalanmasi ve geri
  yukleme proseduru hosting ortami secilince belirlenmelidir.
  `npm run db:restore -- <backup.sqlite>` butunlugu dogrular, uygulama sunucusu
  calisirken restore'u reddeder ve onceki DB'yi korur.
- CRM gorunumleri ve agir Excel/sunum modallari lazy import ile ayri JS
  paketlerine bolundu; arayuz akisi degismeden ilk yukleme miktari azaltildi.
- Profil ekrani gorunen adi ve yonetici parolasini sunucu tarafinda gunceller;
  yeni parola SQLite metadata alaninda salt'li scrypt hash olarak saklanir.
- Sidebar'daki bildirim sayisi ve ust bardaki bildirim listesi SQLite'tan yuklenen
  faaliyet/toplanti kayitlarindan turetilir. Bildirime tiklaninca ilgili ekrana
  gidilir; faaliyet bildirimleri kayit detayini acar. Cikis islemi onay ister.
- Dashboard KPI'lari, aylik faaliyet/toplanti grafigi, protokol dagilimi,
  birim siralamasi ve katilim sayilari gercek CRM kayitlarindan hesaplanir.
- Faaliyet listesinde kayit detay penceresi ve veritabanindan yuklenen yaklasan
  faaliyetler bulunur. Toplanti listesi planlama/tutanak giris seciminden bagimsiz
  sekilde kendi filtre durumunu korur.
- Mobil gorunumde sol menü hamburger dugmesiyle acilip kapanir. Gelistirme
  sunucusu artik `HOST=0.0.0.0` ile ayni yerel agdaki telefondan erisilebilir;
  Vite HMR WebSocket'i varsayilan cakisma yasayan 24678 yerine 24679 portunu
  kullanir (`VITE_HMR_PORT` ile degistirilebilir).
- Faaliyetler ve toplantilar listeden duzenlenebilir; planlanmis kayitlar iptal
  durumuna alinabilir. Degisiklikler SQLite'a kaydedilir ve bagli takvim
  kayitlariyla senkronize edilir.
- Firma Excel dosyasi artik ilk acilista firma adlarini ve tum firma satirlarini
  gosterir; sayisal ozet sonraki sayfaya alindi.
- Ayarlardaki kullanilmayan harici DB baglanti/senkronizasyon formu kaldirilarak
  profil, SQLite yedegi ve Excel islemleri tek ekranda toplandi. Excel raporlari
  ozet sayfasi, filtrelenebilir basliklar ve okunabilir sutun genislikleriyle
  uretilir.
- Yetkili kullanici icin `POST /api/admin/backup` SQLite'in tutarli bir
  yedegini indirir. Guvenli parola ve yedek akisi API testlerine eklendi.
- `xlsx` bagimliligi bilinen prototype-pollution ve ReDoS advisories nedeniyle
  `@e965/xlsx` 0.20.3 ile degistirildi. `package-lock.json` eklendi; CI artik
  `npm ci`, type-check, SQLite ve API kimlik dogrulama testleri, backup testi ve
  frontend+backend build yapiyor.
  `npm audit`: 0 acik zafiyet.

### Canli kullanim icin halen dis bagimliliklar

- CRM kayitlari artik sunucu tarafindaki SQLite veritabaninda tutuluyor.
  Baslangic verileri ilk acilista SQLite'a seed edilir; uygulama API uzerinden
  okur/yazar. Uretimde SQLite dosyasi icin kalici disk, yedekleme ve geri yukleme
  plani gerekir. Tek bir yonetici hesabiyla yerel giris vardir; kullanici
  yonetimi, roller ve kurum SSO'su bu kod tabaninda henuz yok.
- Harici veritabani/API entegrasyonu su an uygulamada aktif degildir. Gercek
  entegrasyon icin universitenin onayli API sozlesmesi, test ortami,
  yetki/kapsam ve veri semasi gerekir; ayarlarda gercek disi baglanti durumu
  gosterilmez.
- GitHub Pages yalnizca statik dosya yayinlar ve SQLite/Node API'sini
  calistiramaz. Yanlis canli yayini onlemek icin Pages deploy is akisi
  kaldirildi; CI workflow'u artik yalnizca dogrulama/build yapar. Canli kullanim icin
  Node sunucusu ve HTTPS ayni uygulama mimarisinde yapilandirilmalidir.

## Ozet

Uygulama mevcut haliyle yerel/tanitim demosu olarak ele alinmalidir. Gercek
kullanicilarin ortak kullanacagi, kalici verili ve guvenli bir CRM olarak canliya
almaya hazir degildir. Aşağıdaki notlarda kodda doğrulanan bulgular ile bu
ortamda doğrulanamayan çalıştırma adımları ayrı tutulmuştur.

## Baslangicta saptanan guvenlik bulgulari ve durumu

| # | Severity | File | Lines | Vulnerability | Confidence |
|---|----------|------|-------|---------------|------------|
| 1 | 🟡 MEDIUM | [server.ts](./server.ts) | API middleware | Giderildi: CRM/AI API'leri oturum cookie'si olmadan kullanilamaz; login throttling, ayni-origin yazma kontrolu ve guvenli cookie ayarlari var. Kurum SSO/roller henuz yok. | 9/10 |
| 2 | 🟡 MEDIUM | [SettingsView.tsx](./src/components/views/SettingsView.tsx), [storageService.ts](./src/services/storageService.ts) | 350-360, 225-264 | Giderildi: parola artık tarayıcı depolamasına yazılmaz; eski parola/token/connection-string değerleri ilk ayar yüklemesinde temizlenir. | 9/10 |
| 3 | 🟡 MEDIUM | [excelService.ts](./src/services/excelService.ts), [CompaniesView.tsx](./src/components/views/CompaniesView.tsx), [urlService.ts](./src/services/urlService.ts) | 318, 338 | Giderildi: import ve görünüm yalnızca HTTP(S) adreslerini bağlantı olarak kullanır. | 9/10 |

Mevcut yerel oturum modeli ilk yoneticiye yoneliktir. Birden cok kullanici icin
kurumsal SSO/OIDC, rol/izin modeli ve denetim izi eklenmelidir. `.env` icindeki
ilk yonetici parolasi ve oturum imzalama anahtari kaynak koduna eklenmemelidir.

## Kod ve urun bulgulari

| Durum | Dosyalar | Bulgular ve karar |
|---|---|---|
| Giderildi | [SettingsView.tsx](./src/components/views/SettingsView.tsx), [dbSyncService.ts](./src/services/dbSyncService.ts), [types.ts](./src/types.ts) | Senkronizasyon arayüzü ve servis sonuç tipleri hizalandı. |
| Guvenli sekilde kapatildi | [dbSyncService.ts](./src/services/dbSyncService.ts), [SettingsView.tsx](./src/components/views/SettingsView.tsx) | Uydurma bağlantı testi ve örnek firma ekleyen sync kaldırıldı; mevcut ayarlar SQLite ve yerel profil işlevlerini gösterir. Gerçek harici API, izin ve şema bilgisi gelene kadar entegrasyon kapalıdır. |
| Tamamlandi; canli icin ek onlem gerekli | [sqliteDatabase.ts](./src/services/sqliteDatabase.ts), [storageService.ts](./src/services/storageService.ts), [server.ts](./server.ts) | CRM verileri SQLite'a tasindi; API tabanli okuma/yazma, eski tarayici verisi migration'i ve `.env` tabanli ilk yonetici girisi eklendi. Uretimde kalici disk, harici yedekleme ve coklu kullanici SSO/rol yonetimi gerekir. |
| Giderildi | [SettingsView.tsx](./src/components/views/SettingsView.tsx), [storageService.ts](./src/services/storageService.ts) | Parola tarayıcıda saklanmıyor; eski secret alanları migrate edilirken siliniyor. |
| Pages deploy devre disi | [ci.yml](./.github/workflows/ci.yml), [server.ts](./server.ts) | GitHub Pages SQLite/Node API'sini sunamadigi icin workflow artik otomatik Pages deploy yapmaz; yalnizca test/build calistirir. |
| Giderildi | [server.ts](./server.ts), [package.json](./package.json) | Platform `PORT` desteği ve Windows uyumlu `clean` script'i eklendi. |
| Giderildi | [initialData.ts](./src/data/initialData.ts) | Demo DB endpoint/token değerleri kaldırıldı; başlangıç bağlantı durumu boş ve kapalı. |
| Giderildi | [package.json](./package.json), [package-lock.json](./package-lock.json) | Açık xlsx Prototype Pollution/ReDoS uyarıları, paket güncellemesiyle kapatıldı; audit temiz. |

## Gerekli API ve bilgiler

### Mevcut kodda bulunan

- `GET /api/health`: Node sunucusunun sağlık yanıtı.
- `GET /api/data`: SQLite'taki CRM koleksiyonlarini getirir.
- `POST`, `PUT`, `DELETE /api/data/...`: CRM kayitlarini SQLite'a yazar.
- `POST /api/data/reset`: seed verisini geri yukler.
- `POST /api/admin/backup`: oturum acmis yonetici icin SQLite yedegini indirir.
- `GET /api/auth/me`, `PUT /api/auth/profile`, `POST /api/auth/password`:
  yonetici profilini ve parolasini yonetir.
- `POST /api/ai/assistant`: AI asistanı; Gemini kullanımı için sunucu tarafında
  `GEMINI_API_KEY` gerekir. Anahtar yoksa API açıkça `503` döndürür; arayüzün
  yerel yanıt mekanizması Gemini yanıtı olarak kabul edilmemelidir.
- Excel içe/dışa aktarma tarayıcıda yapılır; harici Excel API'si gerekmiyor.

### Henüz gerçek entegrasyon olmayanlar

- Harici PostgreSQL/REST entegrasyonu uygulamada yapilandirilmis degildir.
  Gerçek entegrasyon için üniversite BT ekibinden
  onaylı API adresi, test ortamı, kimlik doğrulama yöntemi, erişim yetkileri,
  veri şeması, sayfalama/limitler ve hata/yeniden deneme kuralları alınmalı.
- Tek başına bir DB bağlantı dizesi frontend'den kullanılmamalı. DB erişimi
  backend üzerinden yapılmalı; dış sistem API sağlıyorsa sunucu tarafında
  kimlik doğrulamalı bir API istemcisi uygulanmalı.
- Bir yonetici hesabiyla yerel oturum acma mevcuttur. Oturumlar sunucu
  belleğinde tutuldugu icin tek Node instance'i kullanilmalidir; yeniden baslama
  aktif oturumlari sonlandirir. Gercek kullanici sayisi artmadan once kurumun
  SSO/OIDC saglayicisi ve rol/izin modeli belirlenmelidir.

## Yerelde calistirma ve dogrulama

Yeni internet bağlantısıyla npm sertifika doğrulaması başarılı oldu. Bağımlılıklar
`npm install --no-audit --no-fund` ile kuruldu. Aşağıdaki doğrulamalar geçti:

- `npm run lint`
- `npm test` (SQLite, backup/restore, bildirim kurallari, profil/parola/yedek
  API'leri, anonim erisim reddi, oturum acma/kapama, hiz siniri ve CSRF korumasi)
- `npm run build` (lazy-loaded JS paketleri)
- `npm audit` (0 vulnerability)
- `GET /api/health` ve uygulama sayfası yerel HTTP kontrolü
- Güvensiz Excel URL, URL allowlist ve tarayıcı ayarlarından eski/yeni parolaların
  çıkarılması için odaklı kontroller

Sunucuyu baslatmadan once, `.env` henuz yoksa PowerShell'de
`if (-not (Test-Path .env)) { Copy-Item .env.example .env }` komutuyla ornek
ayar dosyasini kopyalayin.
`ADMIN_USERNAME` belirleyin, en az 16 karakterli `ADMIN_PASSWORD` secin ve
`SESSION_SECRET` icin dosyadaki komutla en az 32 baytlik rastgele anahtar uretin.
Gercek sirlar `.env` icinde kalmali ve repoya gonderilmemelidir. Gemini opsiyoneldir.

CRM verisi varsayilan olarak `data/arelpro.sqlite` dosyasinda tutulur;
`CRM_DB_PATH` ile baska bir yol verilebilir. Veritabani dosyasi `.gitignore`
icerisindedir ve repoya eklenmemelidir. SQLite, Node 22.13+ `node:sqlite`
modulunu kullanir; Node 22'de deneysel API uyarisini verir.

Yedek almak icin sunucu durdurulmadan `npm run db:backup` komutu calistirilabilir.
Yedek varsayilan olarak `data/backups/` altina yazilir. Uretimde bu klasor
uygulama sunucusu disinda, sifreli ve erisimi sinirli depoya duzenli aktarilmalidir.
Geri yukleme icin sunucuyu durdurun, sonra PowerShell'de
`npm run db:restore -- .\data\backups\<yedek-dosyasi>.sqlite` calistirin. Komut,
mevcut veritabanini once `data/backups/` icinde korur ve uygulama calisiyorsa
islemi reddeder. Zorla sonlandirilmis eski sunucudan `.app.lock` kaldiysa, PID'nin
calismadigini dogrulamadan bu dosyayi silmeyin.

Geliştirme sunucusu varsayılan olarak `127.0.0.1:3000` üzerinde çalışır. Port
kullanımdaysa PowerShell'de örneğin `$env:PORT='3002'; npm run dev` kullanın.
Ardından `http://127.0.0.1:3002` adresini açın. Telefonla aynı Wi-Fi üzerinden test için
PowerShell'de `$env:HOST='0.0.0.0'; $env:PORT='3000'; npm run dev` çalıştırın,
bilgisayarın yerel IPv4 adresini bulun (`ipconfig`) ve telefonda
`http://<bilgisayar-ip>:3000` adresini açın. Gerekirse Windows Güvenlik Duvarı'nda
Node.js için özel ağ erişimine izin verin; uygulamayı genel ağa açmayın.
Gemini kullanımı için gerçek
`GEMINI_API_KEY` yalnızca sunucu `.env` dosyasına veya secret manager'a eklenir.

## Canliya alma onerisi

### GitHub Pages

GitHub Pages statik dosyalari sunabilir; ancak SQLite ve Node API'si olmadigi
icin mevcut uygulama Pages'te calismaz. Node backend'i destekleyen bir hosting
hedefi secilmeden statik deploy yapilmamalidir.

### Gercek kullanim

Onerilen ilk hedef, Node backend ve frontend'i ayni origin altinda yayinlayan
bir uygulama servisi (or. Cloud Run) ve SQLite dosyasi icin kalici disk
volume'udur. Birden fazla uygulama instance'i veya yuksek eszamanlilik
gerektiginde yonetilen PostgreSQL'e gecis degerlendirilebilir. Universitenin
SSO saglayicisi ve gercek ERP/kurumsal API baglantisi backend'e entegre edilmeli;
Gemini anahtari ve entegrasyon token'lari secret manager'da saklanmalidir.

Canlıya geçmeden önce kurumdan SSO/OIDC sağlayıcısı, kullanıcı/rol kapsamı,
onaylı ERP API sözleşmesi ve kalıcı veri tabanı bilgileri alınmalıdır. Bunlar
saglandiginda backend'e coklu kullanici SSO/yetkilendirme ve gercek
kurumsal sync ve hedef sunucu deployment'i eklenmelidir.
Node sunucusu gecerli `ADMIN_USERNAME`, `ADMIN_PASSWORD` ve `SESSION_SECRET`
degerleri olmadan baslamaz. GitHub Pages dagitimi SQLite ve Node API'sini
sunmadigi icin devre disi birakilmistir.
