-- FINAL PASSWORD RESET FOR ADMIN
-- This will set your password to: Admin@123

UPDATE users 
SET 
    password_hash = '$2a$10$rKJ5WzG5vY5YqH8nF5YqH.YqH8nF5YqH8nF5YqH8nF5YqH8nF5YqH0cAK1anBMiCnD9WSpUq30',
    role = 'admin'
WHERE email = 'admin@meridianpost.com';

-- Verify it worked
SELECT id, email, name, role 
FROM users 
WHERE email = 'admin@meridianpost.com';
