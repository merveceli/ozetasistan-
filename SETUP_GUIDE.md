# Özet Asistanı - Paket Sistemi ve Auth Kurulumu

Bu belge, yeni eklenen özellikler ve kurulum adımlarını açıklar.

## 🎯 Yeni Özellikler

### 1. **Landing Page** (`/landing`)
- Sitenin amacını anlatan modern tasarımlı ana sayfa
- Özellikler showcase
- Paket fiyatlandırma kartları
- CTA butonları

### 2. **Kullanıcı Kimlik Doğrulama**
- **Giriş Sayfası** (`/auth/login`): Email/şifre ve Google OAuth
- **Kayıt Sayfası** (`/auth/signup`): Paket seçimi ile kayıt
- **OAuth Callback** (`/auth/callback`): Google auth için

### 3. **Paket Sistemi**
Üç farklı paket ile kota yönetimi:

#### Ücretsiz Paket
- 5 Döküman Yükleme
- 10 Aylık Analiz
- 2 Sunum Oluşturma
- 100MB Depolama

#### Öğrenci Paketi (₺49.90/ay)
- 50 Döküman Yükleme
- 100 Aylık Analiz
- 20 Sunum Oluşturma
- 1GB Depolama
- Sesli Not Desteği
- Video Analizi

#### Akademik Paket (₺99.90/ay)
- **Sınırsız** Döküman
- **Sınırsız** Analiz
- **Sınırsız** Sunum
- 5GB Depolama
- Öncelikli Destek
- Gelişmiş AI Özellikleri

### 4. **Trial (Deneme) Sistemi**
- İlk kez gelen kullanıcılar **1 kez kayıt olmadan** uygulamayı deneyebilir
- Cookie ile takip edilir
- 2. ziyarette giriş yapmaları istenir

### 5. **Kota Yönetimi**
- Kullanıcı kotalarını takip eden sistem
- Header'da gerçek zamanlı kota göstergesi
- Limit aşımı kontrolü
- Aylık kullanım sıfırlama

## 📦 Database Schema

Yeni tablolar eklendi:

### `subscription_packages`
Paket tanımları ve limitler

### `usage_tracking`
Kullanıcı başına aylık kullanım istatistikleri

### `profiles` (Güncellendi)
- `subscription_tier`: Kullanıcının paketi
- `subscription_status`: active/cancelled/expired/trial
- `trial_used`: Deneme kullanıldı mı?
- `trial_uses_count`: Kaç kez deneme yapıldı

## 🚀 Kurulum Adımları

### 1. Database Migration

Supabase Dashboard'a gidin ve SQL Editor'de şu dosyayı çalıştırın:
```bash
supabase/schema.sql
```

Bu komut:
- ✅ Yeni tabloları oluşturur
- ✅ Varsayılan paketleri ekler
- ✅ RLS politikalarını kurar
- ✅ Trigger'ları oluşturur

### 2. Environment Değişkenleri

`.env.local` dosyanızda şunların olduğundan emin olun:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_gemini_key
```

### 3. Dependencies

Gerekli paketler zaten kurulu olmalı:
```bash
npm install
```

### 4. Development Server

```bash
npm run dev
```

## 📍 Route Yapısı

### Public Routes (Auth gerekmez)
- `/landing` - Ana sayfa
- `/auth/login` - Giriş
- `/auth/signup` - Kayıt
- `/auth/callback` - OAuth callback

### Protected Routes (Auth gerekir veya trial)
- `/` - Dashboard (Ana uygulama)
- `/asistan` - AI Asistan
- `/sunum-uret` - Sunum Oluştur
- `/kutuphanem` - Kütüphanem
- `/settings` - Ayarlar

## 🔐 Middleware Mantığı

```
Kullanıcı "/" adresine gelir
  ↓
Auth var mı?
  ├─ Evet → Dashboard'a git
  └─ Hayır → Trial cookie var mı?
       ├─ Var → Login'e yönlendir
       └─ Yok → Trial cookie set et → Dashboard göster
```

## 💡 Kullanım Örnekleri

### Quota Kontrolü (Backend)
```typescript
import { checkQuota, incrementUsage } from '@/lib/quota';

// Eylem öncesi kontrol
const quotaCheck = await checkQuota(userId, 'analyze');
if (!quotaCheck.allowed) {
  return { error: quotaCheck.reason };
}

// Eylem başarılı olduktan sonra
await incrementUsage(userId, 'analyze');
```

### Quota Durumu Al (Frontend)
```typescript
const response = await fetch('/api/quota');
const { quotaStatus } = await response.json();

console.log(quotaStatus.remainingAnalyses); // Kalan analiz sayısı
console.log(quotaStatus.canUploadDocument); // Döküman yüklenebilir mi?
```

## 🎨 UI Bileşenleri

### Header
- Kullanıcı profili
- Kota göstergesi (progress bar)
- Logout düğmesi
- Upgrade linki (kota dolunca)

### Landing Page
- Hero section
- Features showcase
- Pricing cards (database'den dinamik)
- CTA sections

### Auth Pages
- Modern, responsive tasarım
- Google OAuth entegrasyonu
- Paket seçimi (signup'ta)
- Error handling

## 🔄 Workflow

### Yeni Kullanıcı Kaydı
1. Kullanıcı `/auth/signup` sayfasına gelir
2. Paket seçer (varsayılan: free)
3. Email/şifre veya Google ile kayıt olur
4. Supabase trigger otomatik olarak:
   - Profile kaydı oluşturur
   - İlk aylık usage_tracking kaydı oluşturur
5. Dashboard'a yönlendirilir

### Kota Kontrolü
1. Kullanıcı bir eylem yapar (ör: döküman yükle)
2. Backend `checkQuota()` fonksiyonunu çağırır
3. Kullanıcının paketi ve mevcut kullanımı kontrol edilir
4. İzin varsa eylem gerçekleşir ve `incrementUsage()` çağrılır
5. İzin yoksa kullanıcıya hata mesajı gösterilir

## 📊 Database Queries

### Kullanıcının Paketini Değiştir
```sql
UPDATE profiles 
SET subscription_tier = 'student'
WHERE id = 'user_id';
```

### Aylık İstatistikleri Sıfırla (Cron job için)
```sql
-- Her ayın 1'inde çalışmalı
INSERT INTO usage_tracking (user_id, month_year)
SELECT id, TO_CHAR(NOW(), 'YYYY-MM')
FROM auth.users
ON CONFLICT (user_id, month_year) DO NOTHING;
```

## 🐛 Debugging

### Quota çalışmıyor?
1. `usage_tracking` tablosunda kullanıcı için kayıt var mı?
2. `subscription_packages` tablosu dolu mu?
3. RLS politikaları aktif mi?

### Trial sistem çalışmıyor?
1. Browser cookies temizle
2. `middleware.ts` dosyası doğru yolda mı? (root directory)
3. `next.config.ts`'de middleware config var mı?

## 🎉 Test Senaryoları

### 1. Yeni Visitor (Trial)
- [ ] Landing page görüntülenir
- [ ] "Ücretsiz Dene" tıkla → Dashboard açılır
- [ ] Logout yap
- [ ] Tekrar "/" git → Login'e yönlendirilir

### 2. Kayıt ve Paket
- [ ] Signup sayfası açılır
- [ ] Paket seçimi çalışır
- [ ] Kayıt başarılı olur
- [ ] Dashboard açılır
- [ ] Header'da doğru paket görünür

### 3. Kota Sistemi
- [ ] Header'da kota göstergesi görünür
- [ ] Eylem yapınca kota azalır
- [ ] Limit dolunca uyarı gösterilir
- [ ] "Yükselt" butonu çalışır

## 📝 Sonraki Adımlar

1. ✅ Database migration yap
2. ✅ Test kullanıcısı oluştur
3. ⬜ Payment gateway entegre et (Stripe/Iyzico)
4. ⬜ Email verification ekle
5. ⬜ Settings sayfası oluştur (paket yükseltme)
6. ⬜ Admin panel (kullanıcı/paket yönetimi)

## 💬 Destek

Herhangi bir sorun yaşarsanız:
1. Browser console'u kontrol edin
2. Supabase logs'u inceleyin
3. Database RLS politikalarını kontrol edin

---

**Önemli**: İlk çalıştırmadan önce mutlaka `supabase/schema.sql` dosyasını Supabase'de çalıştırın!
