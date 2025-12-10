-- Create a test admin user in Supabase Auth
-- This bypasses email confirmation and creates a user you can log in with immediately

-- Email: admin@test.com
-- Password: Admin123456

-- Insert into auth.users (Supabase's authentication table)
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@test.com',
    crypt('Admin123456', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Admin User","role":"admin"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- Verify the user was created
SELECT id, email, email_confirmed_at, raw_user_meta_data 
FROM auth.users 
WHERE email = 'admin@test.com';
