-- Add start_time field to courses table
-- This allows tutors to specify when their courses will start

-- 1. Add start_time column to courses table
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS start_time TIMESTAMP WITH TIME ZONE;

-- 2. Add index for better performance on start_time queries
CREATE INDEX IF NOT EXISTS idx_courses_start_time ON courses(start_time);

-- 3. Update existing courses to have a default start time (1 week from now)
UPDATE courses 
SET start_time = NOW() + INTERVAL '7 days' 
WHERE start_time IS NULL;

-- 4. Make start_time NOT NULL after setting default values
ALTER TABLE courses 
ALTER COLUMN start_time SET NOT NULL;

-- 5. Add comment to document the field
COMMENT ON COLUMN courses.start_time IS 'When the course will start - helps students know when to expect classes to begin';
