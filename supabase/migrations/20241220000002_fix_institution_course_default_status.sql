-- Fix Institution Course Default Status
-- Change default status from 'Draft' to 'Active' so courses are visible to students by default

-- 1. Update existing draft courses to active
UPDATE institution_courses 
SET status = 'Active' 
WHERE status = 'Draft';

-- 2. Change the default value for new courses
ALTER TABLE institution_courses 
ALTER COLUMN status SET DEFAULT 'Active';

-- 3. Update the check constraint to make 'Active' the first option (optional, for clarity)
ALTER TABLE institution_courses 
DROP CONSTRAINT IF EXISTS institution_courses_status_check;

ALTER TABLE institution_courses 
ADD CONSTRAINT institution_courses_status_check 
CHECK (status IN ('Active', 'Inactive', 'Draft'));
