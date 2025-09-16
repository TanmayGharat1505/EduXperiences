-- Migration: Add availability management columns to tutor_profiles table
-- This migration adds timezone and weekly_schedule columns for tutor availability management

-- Add timezone column
ALTER TABLE tutor_profiles 
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'Asia/Kolkata';

-- Add weekly_schedule column as JSONB for flexible scheduling
ALTER TABLE tutor_profiles 
ADD COLUMN IF NOT EXISTS weekly_schedule JSONB DEFAULT '{
  "monday": {"available": false, "slots": []},
  "tuesday": {"available": false, "slots": []},
  "wednesday": {"available": false, "slots": []},
  "thursday": {"available": false, "slots": []},
  "friday": {"available": false, "slots": []},
  "saturday": {"available": false, "slots": []},
  "sunday": {"available": false, "slots": []}
}'::jsonb;

-- Add index on timezone for faster queries
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_timezone ON tutor_profiles(timezone);

-- Add index on weekly_schedule for JSON queries
CREATE INDEX IF NOT EXISTS idx_tutor_profiles_weekly_schedule ON tutor_profiles USING GIN (weekly_schedule);

-- Update existing records to have default values
UPDATE tutor_profiles 
SET 
  timezone = COALESCE(timezone, 'Asia/Kolkata'),
  weekly_schedule = COALESCE(weekly_schedule, '{
    "monday": {"available": false, "slots": []},
    "tuesday": {"available": false, "slots": []},
    "wednesday": {"available": false, "slots": []},
    "thursday": {"available": false, "slots": []},
    "friday": {"available": false, "slots": []},
    "saturday": {"available": false, "slots": []},
    "sunday": {"available": false, "slots": []}
  }'::jsonb)
WHERE timezone IS NULL OR weekly_schedule IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN tutor_profiles.timezone IS 'Tutor''s timezone for availability scheduling (e.g., Asia/Kolkata, America/New_York)';
COMMENT ON COLUMN tutor_profiles.weekly_schedule IS 'JSON object containing weekly availability schedule with time slots for each day';

-- Verify the migration
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'tutor_profiles' 
  AND column_name IN ('timezone', 'weekly_schedule')
ORDER BY column_name;
