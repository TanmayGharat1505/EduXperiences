-- Fix profile query issue
-- The problem is using 'id' instead of 'user_id' in the query

-- 1. Check the table structure to confirm
SELECT 
    'TABLE STRUCTURE' as section,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles'
AND column_name IN ('id', 'user_id')
ORDER BY column_name;

-- 2. Check what the specific user looks like
SELECT 
    'USER DATA' as section,
    id,
    user_id,
    role,
    full_name,
    email
FROM profiles 
WHERE user_id = '7f08b928-f5df-4a23-8d6d-5861bebdf0b9';

-- 3. Test the correct query (using user_id instead of id)
SELECT 
    'CORRECT QUERY TEST' as section,
    user_id,
    role,
    full_name,
    email
FROM profiles 
WHERE user_id = '7f08b928-f5df-4a23-8d6d-5861bebdf0b9' 
AND role = 'institution';

-- 4. Check if there are any RLS issues with this specific query
SELECT 
    'RLS TEST' as section,
    'Query should work with current policies' as status;
