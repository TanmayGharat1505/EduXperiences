-- Test Institution Course Visibility
-- Run this in your Supabase SQL Editor to test if institution courses are visible to students

-- 1. Check if institution_courses table exists and has data
SELECT 
  'institution_courses' as table_name,
  COUNT(*) as total_courses,
  COUNT(CASE WHEN status = 'Active' THEN 1 END) as active_courses
FROM institution_courses;

-- 2. Check if there are any institution users
SELECT 
  'institution_users' as table_name,
  COUNT(*) as total_users
FROM auth.users 
WHERE email LIKE '%institution%' OR email LIKE '%@edu%' OR email LIKE '%@school%';

-- 3. Create a test institution course if none exist
INSERT INTO institution_courses (
  institution_id,
  title,
  description,
  category,
  duration,
  fee_structure,
  level,
  status,
  instructor,
  students_enrolled,
  rating,
  total_reviews
) 
SELECT 
  u.id as institution_id,
  'Advanced Mathematics Course' as title,
  'Comprehensive mathematics course covering advanced topics' as description,
  'Mathematics' as category,
  '100 hours' as duration,
  '{"type": "fixed", "amount": 8000, "currency": "INR"}' as fee_structure,
  'Advanced' as level,
  'Active' as status,
  'Dr. Sarah Johnson' as instructor,
  0 as students_enrolled,
  4.8 as rating,
  0 as total_reviews
FROM auth.users u
WHERE u.email LIKE '%institution%' OR u.email LIKE '%@edu%' OR u.email LIKE '%@school%'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 4. Verify the test course was created
SELECT 
  id,
  title,
  category,
  level,
  status,
  fee_structure,
  created_at
FROM institution_courses 
WHERE title = 'Advanced Mathematics Course';

-- 5. Test RLS policy - this should work for students
-- (This will only work if you're logged in as a student)
SELECT 
  'RLS Test' as test_name,
  COUNT(*) as visible_courses
FROM institution_courses 
WHERE status = 'Active';
