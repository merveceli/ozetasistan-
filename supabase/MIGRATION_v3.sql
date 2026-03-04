-- ============================================================
-- MIGRATION v3: Chat History + Image Support + Ad Rewards Fix
-- Supabase SQL Editor'da çalıştırın
-- ============================================================

-- 1. Sohbet Oturumları Tablosu
CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Yeni Sohbet',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Sohbet Mesajları Tablosu
CREATE TABLE IF NOT EXISTS chat_messages (
    id BIGSERIAL PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    image_url TEXT, -- Gönderilen görsel URL'si veya placeholder
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Reklam Ödülleri Tablosu (Güvenli sayım için)
CREATE TABLE IF NOT EXISTS ad_rewards (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    credits_earned INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. İndeksler (Performans)
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_updated_at ON chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ad_rewards_user_id_date ON ad_rewards(user_id, created_at);

-- 5. Row Level Security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_rewards ENABLE ROW LEVEL SECURITY;

-- 6. chat_sessions Policies
CREATE POLICY "Users can view own chat sessions"
    ON chat_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat sessions"
    ON chat_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
    ON chat_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions"
    ON chat_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- 7. chat_messages Policies (session üzerinden)
CREATE POLICY "Users can view messages in own sessions"
    ON chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert messages in own sessions"
    ON chat_messages FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete messages in own sessions"
    ON chat_messages FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM chat_sessions
            WHERE chat_sessions.id = chat_messages.session_id
            AND chat_sessions.user_id = auth.uid()
        )
    );

-- 8. ad_rewards Policies
CREATE POLICY "Users can view own ad rewards"
    ON ad_rewards FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own ad rewards"
    ON ad_rewards FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- 9. Admin tüm chat'lere erişebilsin (servis rolü üzerinden)
ALTER TABLE chat_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE chat_messages FORCE ROW LEVEL SECURITY;
ALTER TABLE ad_rewards FORCE ROW LEVEL SECURITY;

-- 10. Varolan profiles tablosuna user_credits yoksa ekle
ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS user_credits INTEGER NOT NULL DEFAULT 0;

-- 11. increment_user_credits RPC (yoksa oluştur)
CREATE OR REPLACE FUNCTION increment_user_credits(p_user_id UUID, p_amount INTEGER DEFAULT 1)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_credits INTEGER;
BEGIN
    UPDATE profiles
    SET user_credits = COALESCE(user_credits, 0) + p_amount
    WHERE id = p_user_id
    RETURNING user_credits INTO new_credits;

    RETURN COALESCE(new_credits, p_amount);
END;
$$;

-- 12. consume_analysis_credit RPC (yoksa oluştur/güncelle)
CREATE OR REPLACE FUNCTION consume_analysis_credit(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_credits INTEGER;
BEGIN
    SELECT user_credits INTO v_credits
    FROM profiles
    WHERE id = p_user_id
    FOR UPDATE;

    IF v_credits > 0 THEN
        UPDATE profiles
        SET user_credits = user_credits - 1
        WHERE id = p_user_id;
        RETURN jsonb_build_object('source', 'credit');
    ELSE
        RETURN jsonb_build_object('source', 'quota');
    END IF;
END;
$$;

-- Tamamlandı! ✅
COMMENT ON TABLE chat_sessions IS 'Kullanıcı sohbet oturumları';
COMMENT ON TABLE chat_messages IS 'Sohbet mesajları';
COMMENT ON TABLE ad_rewards IS 'Günlük reklam ödül kayıtları (max 3/gün)';
