-- Add Status Field to Courses Table Migration
-- This migration adds a status field to track course status (scheduled, completed, cancelled)

-- 1. Add status column to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'scheduled' 
CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_enrollments'));

-- 2. Update existing courses to have 'scheduled' status
UPDATE courses 
SET status = 'scheduled' 
WHERE status IS NULL;

-- 3. Add index for status field for better performance
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);

-- 4. Update RLS policies to include status field
-- The existing policies will automatically work with the new status field
-- since they use SELECT * and don't restrict specific columns

-- 5. Add comment to document the status field
COMMENT ON COLUMN courses.status IS 'Course status: scheduled, in_progress, completed, cancelled, or no_enrollments';
