-- Add Step 4 fields to institution_profiles table safely
-- This script adds all the faculty and staff information fields

-- Add Faculty Details fields
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'total_teaching_staff') THEN
    ALTER TABLE institution_profiles ADD COLUMN total_teaching_staff INTEGER DEFAULT 0;
    COMMENT ON COLUMN institution_profiles.total_teaching_staff IS 'Total number of teaching staff members';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'total_non_teaching_staff') THEN
    ALTER TABLE institution_profiles ADD COLUMN total_non_teaching_staff INTEGER DEFAULT 0;
    COMMENT ON COLUMN institution_profiles.total_non_teaching_staff IS 'Total number of non-teaching staff members';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'average_faculty_experience') THEN
    ALTER TABLE institution_profiles ADD COLUMN average_faculty_experience VARCHAR(50);
    COMMENT ON COLUMN institution_profiles.average_faculty_experience IS 'Average faculty experience (e.g., 1-2 years, 3-5 years, 5+ years)';
  END IF;
END $$;

-- Add Principal/Director Information fields
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'principal_director_name') THEN
    ALTER TABLE institution_profiles ADD COLUMN principal_director_name VARCHAR(255);
    COMMENT ON COLUMN institution_profiles.principal_director_name IS 'Name of the principal or director';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'principal_director_qualification') THEN
    ALTER TABLE institution_profiles ADD COLUMN principal_director_qualification VARCHAR(255);
    COMMENT ON COLUMN institution_profiles.principal_director_qualification IS 'Qualification of the principal or director';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'principal_director_experience') THEN
    ALTER TABLE institution_profiles ADD COLUMN principal_director_experience INTEGER DEFAULT 0;
    COMMENT ON COLUMN institution_profiles.principal_director_experience IS 'Experience of the principal or director in years';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'principal_director_photo') THEN
    ALTER TABLE institution_profiles ADD COLUMN principal_director_photo TEXT;
    COMMENT ON COLUMN institution_profiles.principal_director_photo IS 'Photo path of the principal or director';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'principal_director_bio') THEN
    ALTER TABLE institution_profiles ADD COLUMN principal_director_bio TEXT;
    COMMENT ON COLUMN institution_profiles.principal_director_bio IS 'Brief bio of the principal or director';
  END IF;
END $$;

-- Add Department Heads field (JSONB for flexible structure)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'department_heads') THEN
    ALTER TABLE institution_profiles ADD COLUMN department_heads JSONB DEFAULT '[]'::jsonb;
    COMMENT ON COLUMN institution_profiles.department_heads IS 'Array of department heads with their details (name, department, qualification, experience, photo, specialization)';
  END IF;
END $$;

-- Add Faculty Qualifications fields
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'phd_holders') THEN
    ALTER TABLE institution_profiles ADD COLUMN phd_holders INTEGER DEFAULT 0;
    COMMENT ON COLUMN institution_profiles.phd_holders IS 'Number of faculty members with PhD degrees';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'post_graduates') THEN
    ALTER TABLE institution_profiles ADD COLUMN post_graduates INTEGER DEFAULT 0;
    COMMENT ON COLUMN institution_profiles.post_graduates IS 'Number of faculty members with post-graduate degrees';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'graduates') THEN
    ALTER TABLE institution_profiles ADD COLUMN graduates INTEGER DEFAULT 0;
    COMMENT ON COLUMN institution_profiles.graduates IS 'Number of faculty members with graduate degrees';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'professional_certified') THEN
    ALTER TABLE institution_profiles ADD COLUMN professional_certified INTEGER DEFAULT 0;
    COMMENT ON COLUMN institution_profiles.professional_certified IS 'Number of faculty members with professional certifications';
  END IF;
END $$;

-- Add Faculty Achievements fields
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'awards_received') THEN
    ALTER TABLE institution_profiles ADD COLUMN awards_received TEXT;
    COMMENT ON COLUMN institution_profiles.awards_received IS 'Awards, recognitions, and achievements received by faculty members';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'publications') THEN
    ALTER TABLE institution_profiles ADD COLUMN publications TEXT;
    COMMENT ON COLUMN institution_profiles.publications IS 'Research papers, books, articles, and other publications by faculty members';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'industry_experience') THEN
    ALTER TABLE institution_profiles ADD COLUMN industry_experience TEXT;
    COMMENT ON COLUMN institution_profiles.industry_experience IS 'Industry experience and corporate background of faculty members';
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'institution_profiles' AND column_name = 'training_programs') THEN
    ALTER TABLE institution_profiles ADD COLUMN training_programs TEXT;
    COMMENT ON COLUMN institution_profiles.training_programs IS 'Training programs, workshops, and professional development courses attended by faculty members';
  END IF;
END $$;

-- Add indexes for better query performance
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'institution_profiles' AND indexname = 'idx_institution_profiles_teaching_staff') THEN
    CREATE INDEX idx_institution_profiles_teaching_staff ON institution_profiles(total_teaching_staff);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'institution_profiles' AND indexname = 'idx_institution_profiles_faculty_experience') THEN
    CREATE INDEX idx_institution_profiles_faculty_experience ON institution_profiles(average_faculty_experience);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'institution_profiles' AND indexname = 'idx_institution_profiles_department_heads') THEN
    CREATE INDEX idx_institution_profiles_department_heads ON institution_profiles USING GIN (department_heads);
  END IF;
END $$;

-- Update the updated_at trigger to include new columns
-- This will ensure the updated_at column is automatically updated when any of the new fields are modified

-- Verify the changes
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'institution_profiles' 
  AND column_name IN (
    'total_teaching_staff',
    'total_non_teaching_staff', 
    'average_faculty_experience',
    'principal_director_name',
    'principal_director_qualification',
    'principal_director_experience',
    'principal_director_photo',
    'principal_director_bio',
    'department_heads',
    'phd_holders',
    'post_graduates',
    'graduates',
    'professional_certified',
    'awards_received',
    'publications',
    'industry_experience',
    'training_programs'
  )
ORDER BY column_name;
