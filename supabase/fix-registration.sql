-- ============================================
-- FIX: Registration Error (Database error saving new user)
-- ============================================

-- 1. Relax constraints on users table
-- We don't need password_hash in public.users since Supabase Auth handles it.
ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL;
ALTER TABLE public.users ALTER COLUMN name DROP NOT NULL;

-- 2. Ensure the trigger function is robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, password_hash, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NULL, -- No need for password hash in public table
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Re-attach the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Verify policies allow insertion (just in case)
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.users; -- Clean up potential old policy
-- Ensure Service Role (which runs the trigger) has access. 
-- Since the function is SECURITY DEFINER, it runs as the owner (admin), so it bypasses RLS for the table operations inside it.
-- But we can ensure RLS is enabled.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
