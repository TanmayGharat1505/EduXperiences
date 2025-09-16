-- Add Step 3 fields to institution_profiles table
-- This script adds the "Courses & Programs Offered" fields

-- Add Step 3: Academic Courses fields
ALTER TABLE institution_profiles 
ADD COLUMN IF NOT EXISTS course_categories JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS course_details JSONB DEFAULT '{}';

-- Add Step 3: Batch Information fields
ALTER TABLE institution_profiles 
ADD COLUMN IF NOT EXISTS total_current_students INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS average_batch_size INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS student_teacher_ratio VARCHAR(20) DEFAULT '',
ADD COLUMN IF NOT EXISTS class_timings JSONB DEFAULT '{}';

-- Add Step 3: Admission Process fields
ALTER TABLE institution_profiles 
ADD COLUMN IF NOT EXISTS admission_test_required BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS minimum_qualification VARCHAR(100) DEFAULT '',
ADD COLUMN IF NOT EXISTS age_restrictions TEXT DEFAULT '',
ADD COLUMN IF NOT EXISTS admission_fees DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS security_deposit DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS refund_policy TEXT DEFAULT '';

-- Add comments for the new Step 3 fields
COMMENT ON COLUMN institution_profiles.course_categories IS 'JSON object storing selected course categories (CBSE, ICSE, etc.)';
COMMENT ON COLUMN institution_profiles.course_details IS 'JSON object storing detailed course information for each selected category';
COMMENT ON COLUMN institution_profiles.total_current_students IS 'Total number of current students enrolled';
COMMENT ON COLUMN institution_profiles.average_batch_size IS 'Average number of students per batch';
COMMENT ON COLUMN institution_profiles.student_teacher_ratio IS 'Student to teacher ratio (e.g., 15:1)';
COMMENT ON COLUMN institution_profiles.class_timings IS 'JSON object storing available class timing options';
COMMENT ON COLUMN institution_profiles.admission_test_required IS 'Whether admission test is required for enrollment';
COMMENT ON COLUMN institution_profiles.minimum_qualification IS 'Minimum educational qualification required for admission';
COMMENT ON COLUMN institution_profiles.age_restrictions IS 'Any age restrictions for admission';
COMMENT ON COLUMN institution_profiles.admission_fees IS 'Admission fees amount in currency';
COMMENT ON COLUMN institution_profiles.security_deposit IS 'Security deposit amount (refundable)';
COMMENT ON COLUMN institution_profiles.refund_policy IS 'Detailed refund policy description';

-- Create indexes for better performance on new fields
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
