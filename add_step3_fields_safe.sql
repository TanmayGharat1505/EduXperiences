-- Add Step 3 fields to institution_profiles table - SAFE VERSION
-- This script only adds new fields without dropping existing objects
-- Use this if you want to preserve existing data

-- Add Step 3: Academic Courses fields (only if they don't exist)
DO $$ 
BEGIN
    -- Add course_categories column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'course_categories') THEN
        ALTER TABLE institution_profiles ADD COLUMN course_categories JSONB DEFAULT '{}';
        RAISE NOTICE 'Added course_categories column';
    ELSE
        RAISE NOTICE 'course_categories column already exists';
    END IF;

    -- Add course_details column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'course_details') THEN
        ALTER TABLE institution_profiles ADD COLUMN course_details JSONB DEFAULT '{}';
        RAISE NOTICE 'Added course_details column';
    ELSE
        RAISE NOTICE 'course_details column already exists';
    END IF;

    -- Add total_current_students column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'total_current_students') THEN
        ALTER TABLE institution_profiles ADD COLUMN total_current_students INTEGER DEFAULT 0;
        RAISE NOTICE 'Added total_current_students column';
    ELSE
        RAISE NOTICE 'total_current_students column already exists';
    END IF;

    -- Add average_batch_size column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'average_batch_size') THEN
        ALTER TABLE institution_profiles ADD COLUMN average_batch_size INTEGER DEFAULT 0;
        RAISE NOTICE 'Added average_batch_size column';
    ELSE
        RAISE NOTICE 'average_batch_size column already exists';
    END IF;

    -- Add student_teacher_ratio column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'student_teacher_ratio') THEN
        ALTER TABLE institution_profiles ADD COLUMN student_teacher_ratio VARCHAR(20) DEFAULT '';
        RAISE NOTICE 'Added student_teacher_ratio column';
    END IF;

    -- Add class_timings column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'class_timings') THEN
        ALTER TABLE institution_profiles ADD COLUMN class_timings JSONB DEFAULT '{}';
        RAISE NOTICE 'Added class_timings column';
    END IF;

    -- Add admission_test_required column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'admission_test_required') THEN
        ALTER TABLE institution_profiles ADD COLUMN admission_test_required BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Added admission_test_required column';
    END IF;

    -- Add minimum_qualification column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'minimum_qualification') THEN
        ALTER TABLE institution_profiles ADD COLUMN minimum_qualification VARCHAR(100) DEFAULT '';
        RAISE NOTICE 'Added minimum_qualification column';
    END IF;

    -- Add age_restrictions column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'age_restrictions') THEN
        ALTER TABLE institution_profiles ADD COLUMN age_restrictions TEXT DEFAULT '';
        RAISE NOTICE 'Added age_restrictions column';
    END IF;

    -- Add admission_fees column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'admission_fees') THEN
        ALTER TABLE institution_profiles ADD COLUMN admission_fees DECIMAL(10,2) DEFAULT 0.00;
        RAISE NOTICE 'Added admission_fees column';
    END IF;

    -- Add security_deposit column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'security_deposit') THEN
        ALTER TABLE institution_profiles ADD COLUMN security_deposit DECIMAL(10,2) DEFAULT 0.00;
        RAISE NOTICE 'Added security_deposit column';
    END IF;

    -- Add refund_policy column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'refund_policy') THEN
        ALTER TABLE institution_profiles ADD COLUMN refund_policy TEXT DEFAULT '';
        RAISE NOTICE 'Added refund_policy column';
    END IF;

END $$;

-- Add comments for the new Step 3 fields (only if they don't exist)
DO $$
BEGIN
    -- Add comments only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'institution_profiles'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attname = 'course_categories' AND attrelid = 'institution_profiles'::regclass)) THEN
        COMMENT ON COLUMN institution_profiles.course_categories IS 'JSON object storing selected course categories (CBSE, ICSE, etc.)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'institution_profiles'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attname = 'course_details' AND attrelid = 'institution_profiles'::regclass)) THEN
        COMMENT ON COLUMN institution_profiles.course_details IS 'JSON object storing detailed course information for each selected category';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'institution_profiles'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attname = 'total_current_students' AND attrelid = 'institution_profiles'::regclass)) THEN
        COMMENT ON COLUMN institution_profiles.total_current_students IS 'Total number of current students enrolled';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'institution_profiles'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attname = 'average_batch_size' AND attrelid = 'institution_profiles'::regclass)) THEN
        COMMENT ON COLUMN institution_profiles.average_batch_size IS 'Average number of students per batch';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'institution_profiles'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attname = 'student_teacher_ratio' AND attrelid = 'institution_profiles'::regclass)) THEN
        COMMENT ON COLUMN institution_profiles.student_teacher_ratio IS 'Student to teacher ratio (e.g., 15:1)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'institution_profiles'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attname = 'class_timings' AND attrelid = 'institution_profiles'::regclass)) THEN
        COMMENT ON COLUMN institution_profiles.class_timings IS 'JSON object storing available class timing options';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'institution_profiles'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attname = 'admission_test_required' AND attrelid = 'institution_profiles'::regclass)) THEN
        COMMENT ON COLUMN institution_profiles.admission_test_required IS 'Whether admission test is required for enrollment';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'institution_profiles'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attname = 'minimum_qualification' AND attrelid = 'institution_profiles'::regclass)) THEN
        COMMENT ON COLUMN institution_profiles.minimum_qualification IS 'Minimum educational qualification required for admission';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'institution_profiles'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attname = 'age_restrictions' AND attrelid = 'institution_profiles'::regclass)) THEN
        COMMENT ON COLUMN institution_profiles.age_restrictions IS 'Any age restrictions for admission';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'institution_profiles'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attname = 'admission_fees' AND attrelid = 'institution_profiles'::regclass)) THEN
        COMMENT ON COLUMN institution_profiles.admission_fees IS 'Admission fees amount in currency';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'institution_profiles'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attname = 'security_deposit' AND attrelid = 'institution_profiles'::regclass)) THEN
        COMMENT ON COLUMN institution_profiles.security_deposit IS 'Security deposit amount (refundable)';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_description WHERE objoid = 'institution_profiles'::regclass AND objsubid = (SELECT attnum FROM pg_attribute WHERE attname = 'refund_policy' AND attrelid = 'institution_profiles'::regclass)) THEN
        COMMENT ON COLUMN institution_profiles.refund_policy IS 'Detailed refund policy description';
    END IF;
END $$;

-- Create indexes for better performance on new fields (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_institution_profiles_course_categories ON institution_profiles USING GIN(course_categories);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_course_details ON institution_profiles USING GIN(course_details);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_class_timings ON institution_profiles USING GIN(class_timings);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_admission_fees ON institution_profiles(admission_fees);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_total_students ON institution_profiles(total_current_students);

-- Verify the new columns were added
SELECT 'Step 3 fields added successfully!' as status;

-- Show the updated table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'institution_profiles' 
  AND column_name IN (
    'course_categories', 'course_details', 'total_current_students', 
    'average_batch_size', 'student_teacher_ratio', 'class_timings',
    'admission_test_required', 'minimum_qualification', 'age_restrictions',
    'admission_fees', 'security_deposit', 'refund_policy'
  )
ORDER BY ordinal_position;

-- Show all columns to verify the complete structure
SELECT 
  'Complete Table Structure:' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'institution_profiles'
ORDER BY ordinal_position;
