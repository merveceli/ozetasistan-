-- =============================================================
-- MIGRATION v2 — Akademik Asistan Entegrasyon Güncellemeleri
-- Bu SQL'i Supabase Dashboard > SQL Editor'da çalıştırın
-- =============================================================

-- ---------------------------------------------------------------
-- 1. profiles tablosuna user_credits ekle
-- ---------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS user_credits INTEGER DEFAULT 0 NOT NULL;

-- ---------------------------------------------------------------
-- 2. profiles tablosuna subscription_end_date ekle (zaten yoksa)
-- ---------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- ---------------------------------------------------------------
-- 3. payments tablosuna subscription_end_date ekle
-- ---------------------------------------------------------------
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMPTZ;

-- ---------------------------------------------------------------
-- 4. analyses tablosu — arşiv ve kredi kontrol kalbi
--    Kullanıcının daha önce ürettiği analizleri tutar.
--    Arşiv'de tekrar görüntülemek kredi DÜŞÜRMEZ.
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  summary TEXT,
  key_points JSONB DEFAULT '[]'::jsonb,
  mind_map JSONB DEFAULT '{}'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- RLS for analyses
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own analyses" ON public.analyses;
CREATE POLICY "Users can view their own analyses"
  ON public.analyses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own analyses" ON public.analyses;
CREATE POLICY "Users can insert their own analyses"
  ON public.analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own analyses" ON public.analyses;
CREATE POLICY "Users can update their own analyses"
  ON public.analyses FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all analyses" ON public.analyses;
CREATE POLICY "Admins can view all analyses"
  ON public.analyses FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

-- ---------------------------------------------------------------
-- 5. feature_usage_logs için ekstra sütunlar
-- ---------------------------------------------------------------
ALTER TABLE public.feature_usage_logs
  ADD COLUMN IF NOT EXISTS credits_used INTEGER DEFAULT 0;

-- ---------------------------------------------------------------
-- 6. Admin bypass: service_role için RLS bypass fonksiyonu
--    (Admin paneli service_role key ile çağırır)
-- ---------------------------------------------------------------

-- Admin kullanıcı planını güncelleyebilmeli (RLS bypass)
DROP POLICY IF EXISTS "Service role can update profiles" ON public.profiles;
CREATE POLICY "Service role can update profiles"
  ON public.profiles FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Admin tüm profilleri görebilmeli
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    OR auth.uid() = id
  );

-- ---------------------------------------------------------------
-- 7. user_credits güvenli artırma fonksiyonu (watch-ad için)
--    SECURITY DEFINER → client tarafından doğrudan çağrılabilir
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_user_credits(p_user_id UUID, p_amount INTEGER DEFAULT 1)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_credits INTEGER;
BEGIN
  -- Sadece kendi kredisini artırabilir (veya admin)
  IF auth.uid() != p_user_id AND NOT (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  UPDATE public.profiles
    SET user_credits = GREATEST(0, user_credits + p_amount),
        updated_at = now()
    WHERE id = p_user_id
    RETURNING user_credits INTO new_credits;

  RETURN new_credits;
END;
$$;

-- ---------------------------------------------------------------
-- 8. Analiz hakkı tüketme fonksiyonu (güvenli)
--    credits_used: önce user_credits, sonra kota
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.consume_analysis_credit(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_row RECORD;
  result JSONB;
BEGIN
  SELECT * INTO profile_row FROM public.profiles WHERE id = p_user_id FOR UPDATE;

  IF profile_row IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Kullanıcı bulunamadı');
  END IF;

  -- Önce user_credits varsa tüket
  IF profile_row.user_credits > 0 THEN
    UPDATE public.profiles
      SET user_credits = user_credits - 1,
          updated_at = now()
      WHERE id = p_user_id;
    RETURN jsonb_build_object('success', true, 'source', 'credit', 'remaining_credits', profile_row.user_credits - 1);
  END IF;

  -- Yoksa quota_tracking üzerinden kontrol edilecek (uygulama katmanı halleder)
  RETURN jsonb_build_object('success', true, 'source', 'quota');
END;
$$;

-- ---------------------------------------------------------------
-- 9. Güncellenmiş admin dashboard stats fonksiyonu
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats(days_range INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
  total_users BIGINT;
  active_subscribers BIGINT;
  monthly_revenue DECIMAL;
  total_analyses BIGINT;
  new_users_this_month BIGINT;
  tier_distribution JSONB;
BEGIN
  SELECT count(*) INTO total_users FROM public.profiles;

  SELECT count(*) INTO active_subscribers
    FROM public.profiles
    WHERE subscription_tier != 'free' AND subscription_status = 'active';

  SELECT coalesce(sum(amount), 0) INTO monthly_revenue
    FROM public.payments
    WHERE status = 'success' AND created_at > now() - (days_range || ' days')::interval;

  SELECT count(*) INTO total_analyses FROM public.feature_usage_logs;

  SELECT count(*) INTO new_users_this_month
    FROM public.profiles
    WHERE created_at > date_trunc('month', now());

  SELECT jsonb_build_object(
    'free', count(*) FILTER (WHERE subscription_tier = 'free'),
    'student', count(*) FILTER (WHERE subscription_tier = 'student'),
    'academic', count(*) FILTER (WHERE subscription_tier = 'academic')
  ) INTO tier_distribution FROM public.profiles;

  RETURN jsonb_build_object(
    'totalUsers', total_users,
    'activeSubscribers', active_subscribers,
    'monthlyRevenue', monthly_revenue,
    'totalAnalyses', total_analyses,
    'newUsersThisMonth', new_users_this_month,
    'tierDistribution', tier_distribution
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---------------------------------------------------------------
-- 10. payments tablosu — adminlerin tümünü görmesi için
--     (yetki hatasını önlemek için)
-- ---------------------------------------------------------------
DROP POLICY IF EXISTS "Admins can view all payments" ON public.payments;
CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (
    (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    OR user_id = auth.uid()
  );

DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------
-- 11. Realtime: profiles tablosunu realtime'a kaydet (admin canlı takip için)
-- ---------------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feature_usage_logs;

-- =============================================================
-- MIGRATION TAMAMLANDI
-- Supabase Dashboard > SQL Editor'da bu SQL'i çalıştırın.
-- =============================================================
