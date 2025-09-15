-- Simple query to check institution profile in profiles table
-- Run this in Supabase SQL Editor

-- Check if maseerah2003@gmail.com has a profile in the profiles table
SELECT 
    'profiles' as table_name,
    user_id,
    email,
    full_name,
    role,
    city,
    area,
    created_at,
    updated_at
FROM profiles 
WHERE email = 'maseerah2003@gmail.com';

-- Also check the auth.users table to confirm the user exists
SELECT 
    'auth.users' as table_name,
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data->>'role' as role_from_metadata
FROM auth.users 
WHERE email = 'maseerah2003@gmail.com';
