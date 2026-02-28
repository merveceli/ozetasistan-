-- PRODUCTION ADMIN SCHEMA SETUP --

-- 1. Create Role Enum
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('user', 'support', 'admin', 'superAdmin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update Profiles Table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role public.user_role DEFAULT 'user';

-- 3. Create Feature Usage Logs
CREATE TABLE IF NOT EXISTS public.feature_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL, -- 'mindmap', 'focus-radio', 'summary', etc.
    document_id UUID REFERENCES public.documents(id) ON DELETE SET NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'TRY',
    status TEXT NOT NULL, -- 'success', 'failed', 'pending'
    package_id TEXT NOT NULL,
    provider_id TEXT, -- Stripe/Iyzico ID
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Create Admin Audit Logs
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'role_change', 'plan_change', 'user_ban'
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Function to get Dashboard Stats
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_stats(days_range INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
    total_users BIGINT;
    active_subscribers BIGINT;
    monthly_revenue DECIMAL;
    total_analyses BIGINT;
BEGIN
    -- Total Users
    SELECT count(*) INTO total_users FROM public.profiles;
    
    -- Active Subscribers (Non-Free)
    SELECT count(*) INTO active_subscribers FROM public.profiles WHERE subscription_tier != 'free';
    
    -- Monthly Revenue (Last 30 days)
    SELECT coalesce(sum(amount), 0) INTO monthly_revenue FROM public.payments 
    WHERE status = 'success' AND created_at > now() - (days_range || ' days')::interval;
    
    -- Total Analyses
    SELECT count(*) INTO total_analyses FROM public.feature_usage_logs;

    RETURN jsonb_build_object(
        'totalUsers', total_users,
        'activeSubscribers', active_subscribers,
        'monthlyRevenue', monthly_revenue,
        'totalAnalyses', total_analyses
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. RLS Policies for Admin Access
-- Only admins can see audit logs
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs
    FOR SELECT USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

-- Enable RLS for feature logs
ALTER TABLE public.feature_usage_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all usage logs" ON public.feature_usage_logs
    FOR SELECT USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);

-- Enable RLS for payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view all payments" ON public.payments
    FOR SELECT USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);
