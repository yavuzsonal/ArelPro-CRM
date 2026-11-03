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

## Oracle Cloud VM'de yayınlama

Mevcut SQLite ve Node.js sunucusunu koruyarak paylaşılabilir bir HTTPS adresi
elde etmek için Oracle Cloud Infrastructure (OCI) üzerinde Ubuntu VM
kullanılabilir. Burada Oracle Database servisi değil, uygulamanın çalışacağı
OCI Compute VM gerekir. OCI kaynaklarının ücretsiz olup olmadığı ve bölgedeki
kapasite, hesabınıza ve seçtiğiniz bölgeye bağlıdır; oluşturmadan önce OCI
fiyatlandırmasını kontrol edin.

1. OCI'de Ubuntu 24.04 VM oluşturun ve bir public IPv4 adresi atayın. SSH
   (TCP 22) erişimini yalnızca kendi IP'nizle, HTTP/HTTPS (TCP 80/443)
   erişimini internetten gelecek şekilde sınırlandırın. İşletim sistemi ve
   uygulama verileri için yeterli kalıcı disk ayırın.
2. Bir alan adınız varsa DNS'te `A` kaydını VM'nin public IP'sine yönlendirin.
   HTTPS ve güvenli oturum çerezi için geçerli alan adı gereklidir; IP adresiyle
   HTTP üzerinden paylaşım güvenli değildir.
3. VM'ye SSH ile bağlanıp Git, Node.js 22.13+ ve Caddy kurun. Uygulama
   hesabını ve kalıcı veri dizinlerini oluşturun:

   ```bash
   sudo useradd --system --create-home --shell /usr/sbin/nologin arelpro
   sudo install -d -o arelpro -g arelpro /var/lib/arelpro/data /var/lib/arelpro/backups
   sudo install -d -o root -g arelpro -m 0750 /etc/arelpro
   sudo install -d -o root -g root -m 0755 /opt/arelpro
   sudo git clone https://github.com/yavuzsonal/ArelPro-CRM.git /opt/arelpro/app
   cd /opt/arelpro/app
   sudo npm ci
   sudo npm run build
   ```

4. `/etc/arelpro/arelpro.env` dosyasını oluşturun ve yalnızca sunucuda saklayın:

   ```ini
   ADMIN_USERNAME=your-admin-name
   ADMIN_PASSWORD=use-a-unique-random-password-at-least-16-bytes
   SESSION_SECRET=generate-a-random-secret-at-least-32-bytes
   GEMINI_API_KEY=
   ```

   `SESSION_SECRET` için bu README'deki Node.js komutunu kullanın. Dosyaya
   yalnızca `arelpro` hesabının okuyabileceği izin verin:

   ```bash
   sudo chown root:arelpro /etc/arelpro/arelpro.env
   sudo chmod 0640 /etc/arelpro/arelpro.env
   ```

5. DNS kaydı etkinleştikten sonra `deployment/Caddyfile.example` dosyasını
   `/etc/caddy/Caddyfile` konumuna kopyalayın ve `crm.example.com` yerine kendi
   alan adınızı yazın. OCI ağ güvenlik listesi ve Ubuntu güvenlik duvarında
   80/443 portlarının açık olduğundan emin olun.
6. `deployment/arelpro.service` dosyasını
   `/etc/systemd/system/arelpro.service` konumuna kopyalayın. Sonra servisleri
   etkinleştirin:

   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now arelpro
   sudo systemctl reload caddy
   ```

   Durumu `sudo systemctl status arelpro` ile, uygulama loglarını
   `sudo journalctl -u arelpro -f` ile kontrol edin. Caddy, alan adı DNS'i ve
   port erişimi doğruysa HTTPS sertifikasını otomatik alır. Uygulama
   `https://<alan-adiniz>` adresinden paylaşılabilir.

SQLite dosyası `/var/lib/arelpro/data/arelpro.sqlite` konumunda kalıcı diskte
tutulur. VM veya disk oluşturulduktan sonra otomatik yedekleme ve geri yükleme
prosedürünü ayrıca ayarlayın; VM'nin tek kopyası yedek sayılmaz. Yeni sürüm
yayımlarken uygulama dosyalarını güncelleyip `npm ci`, `npm run build` ve
`sudo systemctl restart arelpro` çalıştırın. Secret değerlerini GitHub'a
eklemeyin veya sohbet üzerinden paylaşmayın.

## Canlı kullanım notları

Bu proje tek bir yerel yönetici hesabı içerir; çok kullanıcılı hesap/rol
yönetimi ve kurum SSO'su içermez. Canlıya almadan önce kalıcı depolama,
HTTPS, erişim politikası, yedeklerin saklanması ve geri yükleme süreci hosting
ortamında ayrıca doğrulanmalıdır. Gerçek harici veritabanı/API entegrasyonu
mevcut değildir.
