-- RUN THIS IN YOUR SUPABASE SQL EDITOR --

-- 1. Add is_admin column to profiles table tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Create a function to toggle admin status (Utility)
CREATE OR REPLACE FUNCTION public.set_admin_status(user_email TEXT, status BOOLEAN)
RETURNS VOID AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Get User ID from email
    SELECT id INTO target_user_id FROM auth.users WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;

    -- Update Profiles table
    UPDATE public.profiles SET is_admin = status WHERE id = target_user_id;
    
    -- Update App Metadata (Used by Middleware)
    UPDATE auth.users 
    SET raw_app_meta_data = 
        coalesce(raw_app_meta_data, '{}'::jsonb) || 
        jsonb_build_object('is_admin', status)
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ACTIVATE ADMIN FOR YOURSELF
-- Replace 'your-email@example.com' with your actual account email
-- SELECT public.set_admin_status('your-email@example.com', true);

-- 4. Add Policy to allow Admins to see all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
);

-- 5. Add Policy for Admin Dashboard Stats (Optional: allow admins to see everything)
-- You can add similar policies for documents, usage_tracking etc.
