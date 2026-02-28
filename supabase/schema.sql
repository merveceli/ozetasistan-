-- Create a table for subscription packages
create table if not exists subscription_packages (
  id text primary key,
  name text not null,
  display_name text not null,
  description text,
  price_monthly numeric(10,2) default 0,
  features jsonb default '[]'::jsonb,
  limits jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Insert default packages
insert into subscription_packages (id, name, display_name, description, price_monthly, limits, features) values
('free', 'free', 'Ücretsiz', 'Akademik yolculuğunuza başlayın', 0, 
  '{"max_documents": 5, "max_analyses_per_month": 10, "max_presentations": 2, "max_storage_mb": 100}'::jsonb,
  '["5 Döküman Yükleme", "10 Aylık Analiz", "2 Sunum Oluşturma", "100MB Depolama"]'::jsonb),
('student', 'student', 'Öğrenci', 'Tam öğrenci deneyimi', 49.90, 
  '{"max_documents": 50, "max_analyses_per_month": 100, "max_presentations": 20, "max_storage_mb": 1000}'::jsonb,
  '["50 Döküman Yükleme", "100 Aylık Analiz", "20 Sunum Oluşturma", "1GB Depolama", "Sesli Not Desteği", "Video Analizi"]'::jsonb),
('academic', 'academic', 'Akademik', 'Profesyonel araştırma araçları', 99.90, 
  '{"max_documents": -1, "max_analyses_per_month": -1, "max_presentations": -1, "max_storage_mb": 5000}'::jsonb,
  '["Sınırsız Döküman", "Sınırsız Analiz", "Sınırsız Sunum", "5GB Depolama", "Öncelikli Destek", "Gelişmiş AI Özellikleri", "Çapraz Okuma ve Sentez"]'::jsonb)
on conflict (id) do nothing;

-- Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  email text,
  subscription_tier text references subscription_packages(id) default 'free',
  subscription_status text check (subscription_status in ('active', 'cancelled', 'expired', 'trial')) default 'active',
  subscription_end_date timestamp with time zone,
  trial_used boolean default false,
  trial_uses_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create usage tracking table
create table if not exists usage_tracking (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  month_year text not null, -- Format: 'YYYY-MM'
  documents_uploaded integer default 0,
  analyses_completed integer default 0,
  presentations_created integer default 0,
  storage_used_mb numeric(10,2) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  unique(user_id, month_year)
);

-- Enable RLS for subscription_packages
alter table subscription_packages enable row level security;

drop policy if exists "Anyone can view subscription packages" on subscription_packages;
create policy "Anyone can view subscription packages"
  on subscription_packages for select
  using (true);

-- Enable RLS for profiles
alter table profiles enable row level security;

drop policy if exists "Users can view their own profile" on profiles;
create policy "Users can view their own profile"
  on profiles for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on profiles;
create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Enable RLS for usage_tracking
alter table usage_tracking enable row level security;

drop policy if exists "Users can view their own usage" on usage_tracking;
create policy "Users can view their own usage"
  on usage_tracking for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own usage" on usage_tracking;
create policy "Users can insert their own usage"
  on usage_tracking for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own usage" on usage_tracking;
create policy "Users can update their own usage"
  on usage_tracking for update
  using (auth.uid() = user_id);

-- Create a table for documents
create table if not exists documents (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  title text not null,
  file_url text not null,
  file_path text not null,
  file_type text check (file_type in ('pdf', 'audio', 'video', 'url')) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  analysis_status text check (analysis_status in ('pending', 'processing', 'completed', 'failed')) default 'pending',
  metadata jsonb default '{}'::jsonb
);

-- Enable Row Level Security (RLS)
alter table documents enable row level security;

-- Create policies for documents
drop policy if exists "Users can view their own documents" on documents;
create policy "Users can view their own documents"
  on documents for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own documents" on documents;
create policy "Users can insert their own documents"
  on documents for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update their own documents" on documents;
create policy "Users can update their own documents"
  on documents for update
  using (auth.uid() = user_id);

drop policy if exists "Users can delete their own documents" on documents;
create policy "Users can delete their own documents"
  on documents for delete
  using (auth.uid() = user_id);

-- Trigger for automatic profile creation and usage tracking initialization
create or replace function public.handle_new_user()
returns trigger as $$
declare
  current_month text;
  selected_tier text;
begin
  -- Get subscription tier from metadata or default to 'free'
  selected_tier := coalesce(new.raw_user_meta_data->>'subscription_tier', 'free');

  -- Create profile
  insert into public.profiles (id, full_name, avatar_url, email, subscription_tier)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    selected_tier
  );
  
  -- Initialize usage tracking for current month
  current_month := to_char(now(), 'YYYY-MM');
  insert into public.usage_tracking (user_id, month_year)
  values (new.id, current_month);
  
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger (drop first for safety)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- STORAGE POLICIES
-- Note: storage.objects policies need to specify that they are for storage.objects

drop policy if exists "Users can upload their own documents" on storage.objects;
create policy "Users can upload their own documents"
  on storage.objects for insert
  with check (
    bucket_id = 'documents' AND 
    auth.role() = 'authenticated' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can view their own files" on storage.objects;
create policy "Users can view their own files"
  on storage.objects for select
  using (
    bucket_id = 'documents' AND 
    (
      (auth.role() = 'authenticated' AND (storage.foldername(name))[1] = auth.uid()::text) OR
      (auth.role() = 'anon' AND (storage.foldername(name))[1] = '00000000-0000-0000-0000-000000000000')
    )
  );

drop policy if exists "Guest can upload trial files" on storage.objects;
create policy "Guest can upload trial files"
  on storage.objects for insert
  with check (
    bucket_id = 'documents' AND 
    (storage.foldername(name))[1] = '00000000-0000-0000-0000-000000000000'
  );

-- Also update documents table policies for guest access
drop policy if exists "Guest can insert trial documents" on documents;
create policy "Guest can insert trial documents"
  on documents for insert
  with check (user_id = '00000000-0000-0000-0000-000000000000');

drop policy if exists "Guest can view trial documents" on documents;
create policy "Guest can view trial documents"
  on documents for select
  using (user_id = '00000000-0000-0000-0000-000000000000');
