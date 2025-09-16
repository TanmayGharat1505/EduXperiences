-- Debug script to check tutor availability data
-- Run this in your Supabase SQL Editor to diagnose the issue

-- 1. Check if the availability columns exist
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'tutor_profiles' 
  AND column_name IN ('timezone', 'weekly_schedule')
ORDER BY column_name;

-- 2. Check if any tutors have set availability
SELECT 
    user_id,
    timezone,
    weekly_schedule,
    CASE 
        WHEN weekly_schedule IS NULL THEN 'No schedule set'
        WHEN weekly_schedule = '{}' THEN 'Empty schedule'
        WHEN weekly_schedule::text = 'null' THEN 'Null schedule'
        ELSE 'Has schedule data'
    END as schedule_status
FROM tutor_profiles
LIMIT 10;

-- 3. Check the structure of weekly_schedule for tutors who have it
SELECT 
    user_id,
    timezone,
    weekly_schedule,
    jsonb_typeof(weekly_schedule) as schedule_type,
    CASE 
        WHEN weekly_schedule IS NOT NULL AND weekly_schedule != '{}' THEN
            (SELECT string_agg(key || ': ' || CASE 
                WHEN jsonb_typeof(value) = 'object' THEN 
                    CASE 
                        WHEN value ? 'available' THEN 
                            'available=' || (value->>'available') || ', slots=' || 
                            CASE 
                                WHEN value ? 'slots' THEN array_length(value->'slots', 1)::text
                                ELSE '0'
                            END
                        ELSE 'no available field'
                    END
                ELSE jsonb_typeof(value)
            END, ', ') 
            FROM jsonb_each(weekly_schedule))
        ELSE 'No schedule data'
    END as schedule_details
FROM tutor_profiles
WHERE weekly_schedule IS NOT NULL 
  AND weekly_schedule != '{}'
  AND weekly_schedule::text != 'null'
LIMIT 5;

-- 4. Check if there are any tutors at all
SELECT COUNT(*) as total_tutors FROM tutor_profiles;

-- 5. Check if there are any active courses
SELECT COUNT(*) as total_courses FROM courses WHERE is_active = true;

-- 6. Check the relationship between tutor_profiles and courses
SELECT 
    tp.user_id,
    tp.timezone,
    CASE WHEN tp.weekly_schedule IS NOT NULL THEN 'Has schedule' ELSE 'No schedule' END as has_schedule,
    COUNT(c.id) as course_count
FROM tutor_profiles tp
LEFT JOIN courses c ON tp.user_id = c.tutor_id AND c.is_active = true
GROUP BY tp.user_id, tp.timezone, tp.weekly_schedule
ORDER BY course_count DESC
LIMIT 10;
