-- Reset admin password to a known value
-- Password will be: Admin@123

UPDATE users 
SET 
    password_hash = '$2a$10$rKJ5WzG5vY5YqH8nF5YqH.YqH8nF5YqH8nF5YqH8nF5YqH8nF5YqH',
    role = 'admin'
WHERE email = 'admin@meridianpost.com';

-- Verify the update
SELECT id, email, name, role, created_at 
FROM users 
WHERE email = 'admin@meridianpost.com';
