# KitapEvim - E-Ticaret ve Veri Kurtarma (Seeder) Sistemi

Bu proje, bir kitabevi online satış platformunun prototipidir. Proje kapsamında, test veya kullanım süreçlerinde bozulmuş verileri temizleyerek sistemi düzgün verilerle tekrar kullanılabilir bir pazarlama demosuna hazır hale getiren bir mekanizma (Golden State / Seeder) geliştirilmiştir.

Sistem, yönetici yetkisine sahip kullanıcılar tarafından tek tuşla sıfırlanabilmekte ve rastgele geçmiş satış verileri üretilerek analitik grafiklerin sınanması sağlanmaktadır.

---

## 🛠 Kullanılan Teknolojiler

- **Frontend:** React, TypeScript.
- **Backend:** NestJS, TypeScript, TypeORM
- **Veritabanı:** PostgreSQL (Docker Compose üzerinden)

---

## 📋 Kurulum Öncesi Gereksinimler

Projenin yerel ortamda çalıştırılabilmesi için aşağıdaki yazılımların sistemde kurulu olması gerekmektedir:

- Node.js 
- Docker ve Docker Compose (Veritabanı konteyneri için)
- Git

---

## 🚀 Kurulum Adımları

Projenin kaynak kodları bilgisayara indirildikten sonra aşağıdaki adımlar sırasıyla uygulanmalıdır.

### 1. Veritabanının Ayağa Kaldırılması

Projenin ana dizininde (`docker-compose.yml` dosyasının bulunduğu konumda) terminal açılarak veritabanı konteyneri başlatılmalıdır:

```bash
docker-compose up -d
```

### 2. Backend (Sunucu) Kurulumu

Yeni bir terminal penceresinde `backend` klasörüne girilmelidir:

```bash
cd backend
```

Gerekli ortam değişkenlerinin sağlanması için şablon dosyanın adı değiştirilerek aktif hale getirilmelidir:

> `.env.example` dosyasının adı `.env` olarak değiştirilmelidir. İçerisindeki PostgreSQL yapılandırmaları `docker-compose` ile uyumlu olarak hazır verilmiştir.

Ardından bağımlılıklar yüklenip sunucu başlatılmalıdır:

```bash
npm install
npm run start:dev
```

Sunucu `http://localhost:3000` adresinde çalışmaya başlayacaktır.

### 3. Frontend (İstemci) Kurulumu

Farklı bir terminal penceresinde `frontend` klasörüne girilmelidir:

```bash
cd frontend
```

Bağımlılıklar yüklenip kullanıcı arayüzü başlatılmalıdır:

```bash
npm install
npm run dev
```

İstemci tarafı terminalde belirtilen adreste (genellikle `http://localhost:5173`) çalışmaya başlayacaktır.

Varsayılan otomatik olarak superadmin yetkisinde oluşturulan kullanıcı giriş bilgileri; 
Email: kurucu@clone.com  
Şifre: Password123!

---

## 🎯 Demo ve Test İşlemleri

Proje ayağa kaldırıldıktan sonra aşağıdaki senaryo izlenebilir:

1. **Sisteme Giriş:** `http://localhost:5173` adresine gidilerek müşteri kaydı oluşturulabilir veya vitrinden doğrudan alışveriş yapılarak stok düşme/sipariş simülasyonları gerçekleştirilebilir.

2. **Veri Bozulması Simülasyonu:** Rastgele kitaplar eklenebilir, stoklar tüketilebilir ve sepet işlemleri ile veritabanında kasıtlı veri karmaşası yaratılabilir.

3. **Sistemi Sıfırlama (Golden State):** Üst menüden Admin Paneline girildiğinde, sağ üst köşede bulunan **"⚡ Sistemi Sıfırla (Golden State)"** butonuna tıklanmalıdır.

4. **Sonuç:** Bu işlem sırasıyla şunları gerçekleştirir:
   - Veritabanındaki tüm karmaşık verileri temizler
   - Başlangıçtaki varsayılan (altın) kitap envanterini yeniden yükler
   - Geçmiş aylara ait 80 adet rastgele sipariş üreterek satış grafiğini günceller
   - Sistemi yeni bir pazarlama demosu için tamamen temiz ve hazır hale getirir
