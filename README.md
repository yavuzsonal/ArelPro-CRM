# ArelPro CRM

Firma portföyü, faaliyet, toplantı ve takvim kayıtlarını yöneten; verileri
sunucu tarafındaki SQLite veritabanında saklayan bir CRM uygulaması.

## Gereksinimler

- Node.js 22.13 veya üzeri
- npm

## Yerel kurulum

Proje klasöründe:

```powershell
npm ci
Copy-Item .env.example .env
```

`.env` dosyasını açıp aşağıdaki zorunlu değerleri belirleyin:

| Değişken | Gereksinim |
| --- | --- |
| `ADMIN_USERNAME` | 3–64 karakter |
| `ADMIN_PASSWORD` | En az 16 bayt; tahmin edilmesi zor, benzersiz bir parola |
| `SESSION_SECRET` | En az 32 baytlık rastgele anahtar |

Oturum anahtarı üretmek için:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

`GEMINI_API_KEY` isteğe bağlıdır ve yalnızca AI asistanı kullanılacaksa
sunucu tarafındaki `.env` dosyasına eklenmelidir. Gerçek `.env` dosyasını,
API anahtarlarını veya parolaları Git'e eklemeyin.

Uygulamayı geliştirme modunda başlatın:

```powershell
npm run dev
```

Varsayılan adres `http://127.0.0.1:3000`'dir. Giriş, `.env` içindeki yönetici
kullanıcı adı ve parolasıyla yapılır. `PORT` değişkeni sunucu portunu
değiştirir.

### Telefonda yerel ağ üzerinden deneme

Bilgisayar ve telefon aynı güvenilir Wi-Fi ağına bağlıyken sunucuyu tüm yerel
ağ arayüzlerinde dinleyecek şekilde başlatın:

```powershell
$env:HOST = "0.0.0.0"
npm run dev
```

Telefonda `http://<bilgisayarın-yerel-IP-adresi>:3000` adresini açın. Gerekirse
Windows Güvenlik Duvarı'nda yalnızca özel ağ için izin verin. Bu geliştirme
sunucusunu genel internete açmayın. HMR WebSocket portu varsayılan olarak
`24679`'dur ve `VITE_HMR_PORT` ile değiştirilebilir.

## Test ve üretim derlemesi

```powershell
npm run lint
npm test
npm run build
npm start
```

`npm start`, derleme tamamlandıktan sonra üretim sunucusunu başlatır. Üretim
ortamında `PORT` barındırma platformunun sağladığı değeri kullanır; sunucuyu
HTTPS sağlayan bir proxy/hosting katmanı arkasında çalıştırın.

## Veritabanı ve yedekleme

İlk çalıştırmada başlangıç CRM verileri SQLite'a aktarılır. Varsayılan
veritabanı `data/arelpro.sqlite`, yedek klasörü `data/backups/`'tır. Konumları
`CRM_DB_PATH` ve `CRM_BACKUP_DIR` ile değiştirebilirsiniz. Üretimde bu
konumların kalıcı disk üzerinde olduğundan emin olun; otomatik harici yedekleme
ve geri yükleme planı ayrıca yapılandırılmalıdır.

Yedek oluşturmak için:

```powershell
npm run db:backup
```

Yedeği geri yüklemek için uygulama sunucusunu durdurun ve:

```powershell
npm run db:restore -- "C:\yedekler\arelpro.sqlite"
```

Veritabanı ve yedekler kaynak kontrolüne eklenmemelidir.

## GitHub Actions

Push ve elle çalıştırma tetikleyicileriyle CI; bağımlılıkları kurar, TypeScript
kontrolünü, testleri ve üretim derlemesini çalıştırır. Uygulama SQLite ve Node
sunucusu gerektirdiği için GitHub Pages tek başına uygun bir canlı yayın
hedefi değildir.

## Canlı kullanım notları

Bu proje tek bir yerel yönetici hesabı içerir; çok kullanıcılı hesap/rol
yönetimi ve kurum SSO'su içermez. Canlıya almadan önce kalıcı depolama,
HTTPS, erişim politikası, yedeklerin saklanması ve geri yükleme süreci hosting
ortamında ayrıca doğrulanmalıdır. Gerçek harici veritabanı/API entegrasyonu
mevcut değildir.
