# 🚀 Akademik Asistan — Canlıya Alma & Shopier Onay Kılavuzu

## TL;DR
Shopier ödeme almak için → **Sitenizi canlı bir domain'e deploy etmeniz gerekiyor**.
Shopier size callback URL'si sorar ve bu URL canlı (https://) olmak zorundadır.

---

## Adım 1: Vercel'e Deploy Et (Önerilen, Ücretsiz)

### 1.1 GitHub'a Push Et
```bash
git init
git add .
git commit -m "initial deployment"
# GitHub'da yeni repo oluştur → https://github.com/new
git remote add origin https://github.com/KULLANICI_ADIN/akademik-asistan.git
git push -u origin main
```

### 1.2 Vercel Hesabı Aç
- [vercel.com](https://vercel.com) → GitHub ile giriş
- "Import Project" → GitHub reponuzu seçin

### 1.3 Environment Variables (Kritik!)
Vercel Dashboard > Settings > Environment Variables'a şunları ekleyin:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://uacemoqwwraqxfczcymz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (mevcut anon key) |
| `GEMINI_API_KEY` | (mevcut key) |
| `SHOPIER_API_KEY` | (mevcut key) |
| `SHOPIER_API_SECRET` | (mevcut secret) |
| `NEXT_PUBLIC_APP_URL` | `https://PROJENIZ.vercel.app` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard > Settings > API > service_role |

> ⚠️ **SUPABASE_SERVICE_ROLE_KEY** gizli tutun, hiçbir zaman frontend'e sızmayın!

### 1.4 Deploy Et
"Deploy" butonuna tıklayın. Birkaç dakika içinde:
- URL: `https://akademik-asistan.vercel.app` (veya özel)

---

## Adım 2: Özel Domain (İsteğe Bağlı, Önerilen)

### Namecheap / GoDaddy / Natro'dan Domain Al
- Örnek: `akademik-asistan.com.tr` (~₺150/yıl)

### Vercel'e Ekle
- Vercel Dashboard > Domains > "Add" → domain adını girin
- DNS A kaydını Vercel IP'sine yönlendirin

---

## Adım 3: Supabase Güncellemeleri (Canlı Ortam için)

### 3.1 SQL Migration'ı Çalıştır
Supabase Dashboard > SQL Editor'a gidip `supabase/MIGRATION_v2.sql` içeriğini çalıştırın.

### 3.2 Admin Kullanıcıyı Ayarla
```sql
-- Kendi e-postanıza admin flag ekleyin
UPDATE auth.users
  SET app_metadata = jsonb_set(
    COALESCE(app_metadata, '{}'),
    '{is_admin}',
    'true'::jsonb
  )
  WHERE email = 'SIZIN_EMAIL@example.com';
```

### 3.3 Supabase Auth Redirect URL Ekle
Supabase Dashboard > Authentication > URL Configuration:
- Site URL: `https://PROJENIZ.vercel.app`
- Redirect URLs'e ekle: `https://PROJENIZ.vercel.app/auth/callback`

---

## Adım 4: Shopier Webhook Ayarı

### 4.1 Shopier Panel'de Webhook URL'yi Güncelle
[shopier.com](https://shopier.com) → Hesabım → API Ayarları:

| Alan | Değer |
|------|-------|
| Callback URL | `https://PROJENIZ.vercel.app/api/webhooks/shopier` |
| Return URL | `https://PROJENIZ.vercel.app/settings?status=success` |

### 4.2 Shopier Mağaza Onayı
Shopier ödeme alabilmek için:
1. **Mağaza Profili doldurun**: İletişim bilgileri, site açıklaması
2. **Ürün(ler) ekleyin**: Her paket için bir dijital ürün oluşturun
3. **Onay başvurusu**: Shopier ekibine online mağaza olduğunuzu belirtin
4. **Bekleme**: Genellikle 1-3 iş günü

> ℹ️ Shopier, banka hesabınızı ve kimlik doğrulamanızı ister.
> Bireysel veya kurumsal başvuru yapabilirsiniz.

---

## Adım 5: Google AdSense (Reklam Sistemi)

### 5.1 AdSense Başvurusu İçin Gereksinimler
- ✅ Canlı bir domain (vercel.app de kabul edilir ama özel domain tercih edilir)
- ✅ En az 20-30 sayfa özgün içerik (login, kayıt, landing page vs.)
- ✅ Privacy Policy sayfası
- ✅ Terms of Service sayfası
- ✅ İletişim formu/sayfası

### 5.2 AdSense Başvurusu
1. [adsense.google.com](https://adsense.google.com) → Başvuru
2. Sitenizin URL'sini girin
3. Onay kodu (`<meta>` tag veya `<script>`) sitenize ekleyin
4. Onay süreci: 1-14 gün

### 5.3 Ödüllü Reklam (Rewarded Ad) Sistemi
AdSense'in web rewarded ads özelliği şu an sınırlı beta'da.
**Alternatif önerilen yaklaşım:**
- **Simülasyon modu**: Gerçek reklam yerine "Reklamı İzledim" butonu + küçük bir YouTube/video reklamı
- **Google AdMob**: Mobil uygulama isterseniz daha uygun

Mevcut `/api/watch-ad` endpoint'iniz üretim ortamında çalışır. Gerçek reklam gösterimi için:
```tsx
// components/RewardedAdModal.tsx içinde
// AdSense onayı gelince gerçek reklam entegre edilir
// Şu an simüle edilmiş (5 saniyelik bekleme + "Reklamı işledim" butonu)
```

---

## Adım 6: `.env.local` → `.env.production`

Vercel'e deploy sonrası loglara bakın:
```bash
# Vercel CLI ile local test
npx vercel@latest login
npx vercel@latest dev
```

---

## Özet Checklist

- [ ] `NEXT_PUBLIC_APP_URL` env variable güncellendi
- [ ] Supabase `MIGRATION_v2.sql` çalıştırıldı
- [ ] Admin email'i için SQL çalıştırıldı
- [ ] Supabase Auth redirect URL eklendi
- [ ] Vercel'e deploy edildi
- [ ] Shopier webhook URL güncellendi
- [ ] Google AdSense başvurusu yapıldı (isteğe bağlı)
