-- Test script to create a sample institution course
-- Run this in your Supabase SQL Editor to test institution course visibility

-- First, let's check if there are any institution courses
SELECT COUNT(*) as institution_courses_count FROM institution_courses;

-- Check if there are any active institution courses
SELECT COUNT(*) as active_institution_courses_count FROM institution_courses WHERE status = 'Active';

-- If no institution courses exist, create a test one
-- Note: Replace 'your-institution-user-id' with an actual institution user ID
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
) VALUES (
  (SELECT id FROM auth.users WHERE email LIKE '%institution%' LIMIT 1), -- Get first institution user
  'Test Mathematics Course',
  'A comprehensive mathematics course covering algebra, geometry, and calculus',
  'Mathematics',
  '120 hours',
  '{"type": "fixed", "amount": 5000, "currency": "INR"}',
  'Intermediate',
  'Active',
  'Dr. John Smith',
  0,
  4.5,
  0
) ON CONFLICT DO NOTHING;

-- Check the created course
SELECT * FROM institution_courses WHERE title = 'Test Mathematics Course';
