-- ADMIN ACCOUNT SETUP INSTRUCTIONS
-- Execute these steps to set up the admin account

-- Step 1: First, go to your application and sign up with:
-- Email: anilkumarkondeboina@gmail.com
-- Password: Anil1678
-- Full Name: Anil Kumar (or your preferred name)

-- The trigger will automatically assign admin role to this email.

-- Step 2: If you've already run the main schema, that's all you need!
-- The handle_new_user() trigger will create your admin profile automatically.

-- Step 3: Verify admin account (optional - run after signup):
-- SELECT * FROM users WHERE email = 'anilkumarkondeboina@gmail.com';
-- You should see role = 'admin'

-- Note: Only anilkumarkondeboina@gmail.com has admin privileges.
-- All other emails will be assigned 'student' role.
