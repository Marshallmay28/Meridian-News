-- Create a trigger to automatically create users in the users table when they sign up
-- This syncs Supabase Auth users with our custom users table

-- First, create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, password_hash, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    'supabase_auth', -- Placeholder since Supabase Auth manages passwords
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill existing auth users into the users table
INSERT INTO public.users (id, email, password_hash, name, role)
SELECT 
  id,
  email,
  'supabase_auth', -- Placeholder since Supabase Auth manages passwords
  COALESCE(raw_user_meta_data->>'name', 'User') as name,
  COALESCE(raw_user_meta_data->>'role', 'user') as role
FROM auth.users
ON CONFLICT (email) DO UPDATE SET
  id = EXCLUDED.id,
  name = EXCLUDED.name,
  role = EXCLUDED.role;

-- Verify the sync
SELECT COUNT(*) as auth_users FROM auth.users;
SELECT COUNT(*) as public_users FROM public.users;
