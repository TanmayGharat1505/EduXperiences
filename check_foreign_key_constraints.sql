-- Check Foreign Key Constraints
-- This script shows all foreign key constraints that might prevent deletion

-- 1. Check all foreign key constraints in the database
SELECT 
    'FOREIGN KEY CONSTRAINTS' as check_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 2. Check specific tables that might reference users
SELECT 
    'TABLES REFERENCING USERS' as check_type,
    table_name,
    column_name,
    'This table references auth.users' as note
FROM information_schema.key_column_usage
WHERE referenced_table_name = 'users'
    AND table_schema = 'public';

-- 3. Check notifications table specifically
SELECT 
    'NOTIFICATIONS TABLE' as check_type,
    COUNT(*) as total_notifications,
    COUNT(DISTINCT user_id) as unique_users,
    'These notifications reference users' as note
FROM notifications;

-- 4. Check which notifications belong to target users
SELECT 
    'TARGET USER NOTIFICATIONS' as check_type,
    COUNT(*) as target_notifications,
    'Notifications for isml.intern1@gmail.com and maseerah.research@gmail.com' as note
FROM notifications n
JOIN auth.users u ON n.user_id = u.id
WHERE u.email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com');

-- 5. Check which notifications belong to non-target users
SELECT 
    'NON-TARGET USER NOTIFICATIONS' as check_type,
    COUNT(*) as non_target_notifications,
    'These notifications will be deleted' as note
FROM notifications n
JOIN auth.users u ON n.user_id = u.id
WHERE u.email NOT IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com');

-- 6. Show sample notifications to be deleted
SELECT 
    'SAMPLE NOTIFICATIONS TO DELETE' as check_type,
    n.id,
    n.user_id,
    n.title,
    n.message,
    u.email,
    'This notification will be deleted' as status
FROM notifications n
JOIN auth.users u ON n.user_id = u.id
WHERE u.email NOT IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
LIMIT 5;
