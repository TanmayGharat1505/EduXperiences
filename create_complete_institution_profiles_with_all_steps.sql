-- Complete Institution Profiles Table with all Steps 1-5
-- This script creates the table from scratch with all fields

-- Drop existing table if it exists (WARNING: This will delete all data)
-- DROP TABLE IF EXISTS institution_profiles CASCADE;

-- Create the institution_profiles table with all fields
CREATE TABLE IF NOT EXISTS institution_profiles (
  -- Primary key and metadata
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Step 1: Basic Information
  institution_name TEXT NOT NULL,
  institution_type TEXT,
  other_institution_type TEXT,
  established_year INTEGER,
  registration_number TEXT,
  pan_number TEXT,
  gst_number TEXT,
  official_email TEXT,
  primary_contact TEXT,
  secondary_contact TEXT,
  website_url TEXT,
  complete_address TEXT,
  city TEXT,
  state TEXT,
  pin_code TEXT,
  landmark TEXT,
  map_location TEXT,
  owner_director_name TEXT,
  owner_contact_number TEXT,
  business_license_file TEXT,
  registration_certificate_file TEXT,
  agree_to_terms BOOLEAN DEFAULT FALSE,
  agree_to_background_verification BOOLEAN DEFAULT FALSE,
  
  -- Step 2: Infrastructure & Facilities
  total_classrooms INTEGER,
  classroom_capacity INTEGER,
  library_available TEXT,
  computer_lab_available TEXT,
  wifi_available TEXT,
  parking_available TEXT,
  cafeteria_available TEXT,
  air_conditioning_available TEXT,
  cctv_security_available TEXT,
  wheelchair_accessible TEXT,
  projectors_smart_boards_available TEXT,
  audio_system_available TEXT,
  laboratory_facilities JSONB DEFAULT '{}',
  sports_facilities JSONB DEFAULT '{}',
  transportation_provided TEXT,
  hostel_facility TEXT,
  study_material_provided TEXT,
  online_classes TEXT,
  recorded_sessions TEXT,
  mock_tests_assessments TEXT,
  career_counseling TEXT,
  job_placement_assistance TEXT,
  main_building_photo TEXT,
  classroom_photos TEXT[],
  laboratory_photos TEXT[],
  facilities_photos TEXT[],
  achievement_photos TEXT[],
  
  -- Step 3: Courses & Programs
  course_categories JSONB DEFAULT '{}',
  course_details JSONB DEFAULT '{}',
  total_current_students INTEGER,
  average_batch_size INTEGER,
  student_teacher_ratio TEXT,
  class_timings JSONB DEFAULT '{}',
  admission_test_required TEXT,
  minimum_qualification TEXT,
  age_restrictions TEXT,
  admission_fees DECIMAL(10,2),
  security_deposit DECIMAL(10,2),
  refund_policy TEXT,
  
  -- Step 4: Faculty & Staff
  total_teaching_staff INTEGER,
  total_non_teaching_staff INTEGER,
  average_faculty_experience TEXT,
  principal_director_name TEXT,
  principal_director_qualification TEXT,
  principal_director_experience INTEGER,
  principal_director_photo TEXT,
  principal_director_bio TEXT,
  department_heads JSONB DEFAULT '[]',
  phd_holders INTEGER,
  post_graduates INTEGER,
  graduates INTEGER,
  professional_certified INTEGER,
  awards_received TEXT,
  publications TEXT,
  industry_experience TEXT,
  training_programs TEXT,
  
  -- Step 5: Results & Achievements
  board_exam_results JSONB DEFAULT '[]',
  competitive_exam_results JSONB DEFAULT '[]',
  institution_awards JSONB DEFAULT '{}',
  student_achievements JSONB DEFAULT '{}',
  accreditations JSONB DEFAULT '{}',
  success_stories JSONB DEFAULT '{}',
  
  -- Additional metadata
  verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0.0,
  total_reviews INTEGER DEFAULT 0,
  description TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_institution_profiles_user_id ON institution_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_institution_name ON institution_profiles(institution_name);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_city ON institution_profiles(city);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_state ON institution_profiles(state);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_institution_type ON institution_profiles(institution_type);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_verified ON institution_profiles(verified);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_rating ON institution_profiles(rating);

-- Create indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_course_categories ON institution_profiles USING GIN (course_categories);
CREATE INDEX IF NOT EXISTS idx_course_details ON institution_profiles USING GIN (course_details);
CREATE INDEX IF NOT EXISTS idx_laboratory_facilities ON institution_profiles USING GIN (laboratory_facilities);
CREATE INDEX IF NOT EXISTS idx_sports_facilities ON institution_profiles USING GIN (sports_facilities);
CREATE INDEX IF NOT EXISTS idx_class_timings ON institution_profiles USING GIN (class_timings);
CREATE INDEX IF NOT EXISTS idx_department_heads ON institution_profiles USING GIN (department_heads);
CREATE INDEX IF NOT EXISTS idx_board_exam_results ON institution_profiles USING GIN (board_exam_results);
CREATE INDEX IF NOT EXISTS idx_competitive_exam_results ON institution_profiles USING GIN (competitive_exam_results);
CREATE INDEX IF NOT EXISTS idx_institution_awards ON institution_profiles USING GIN (institution_awards);
CREATE INDEX IF NOT EXISTS idx_student_achievements ON institution_profiles USING GIN (student_achievements);
CREATE INDEX IF NOT EXISTS idx_accreditations ON institution_profiles USING GIN (accreditations);
CREATE INDEX IF NOT EXISTS idx_success_stories ON institution_profiles USING GIN (success_stories);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER institution_profiles_updated_at
  BEFORE UPDATE ON institution_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own institution profile
CREATE POLICY "Users can view own institution profile" ON institution_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own institution profile
CREATE POLICY "Users can insert own institution profile" ON institution_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own institution profile
CREATE POLICY "Users can update own institution profile" ON institution_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own institution profile
CREATE POLICY "Users can delete own institution profile" ON institution_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Add comments for all columns
COMMENT ON TABLE institution_profiles IS 'Complete institution profiles with all signup steps data';
COMMENT ON COLUMN institution_profiles.id IS 'Unique identifier for the institution profile';
COMMENT ON COLUMN institution_profiles.user_id IS 'Reference to the authenticated user who owns this profile';
COMMENT ON COLUMN institution_profiles.created_at IS 'Timestamp when the profile was created';
COMMENT ON COLUMN institution_profiles.updated_at IS 'Timestamp when the profile was last updated';

-- Step 1 comments
COMMENT ON COLUMN institution_profiles.institution_name IS 'Name of the educational institution';
COMMENT ON COLUMN institution_profiles.institution_type IS 'Type of institution (school, college, university, etc.)';
COMMENT ON COLUMN institution_profiles.established_year IS 'Year when the institution was established';
COMMENT ON COLUMN institution_profiles.registration_number IS 'Official registration number of the institution';
COMMENT ON COLUMN institution_profiles.official_email IS 'Official email address of the institution';
COMMENT ON COLUMN institution_profiles.primary_contact IS 'Primary contact number for the institution';
COMMENT ON COLUMN institution_profiles.complete_address IS 'Complete address of the institution';
COMMENT ON COLUMN institution_profiles.city IS 'City where the institution is located';
COMMENT ON COLUMN institution_profiles.state IS 'State where the institution is located';
COMMENT ON COLUMN institution_profiles.pin_code IS 'PIN code of the institution location';
COMMENT ON COLUMN institution_profiles.owner_director_name IS 'Name of the owner or director';
COMMENT ON COLUMN institution_profiles.owner_contact_number IS 'Contact number of the owner or director';
COMMENT ON COLUMN institution_profiles.business_license_file IS 'Path to uploaded business license file';
COMMENT ON COLUMN institution_profiles.registration_certificate_file IS 'Path to uploaded registration certificate file';

-- Step 2 comments
COMMENT ON COLUMN institution_profiles.total_classrooms IS 'Total number of classrooms in the institution';
COMMENT ON COLUMN institution_profiles.classroom_capacity IS 'Average capacity of each classroom';
COMMENT ON COLUMN institution_profiles.library_available IS 'Whether library facility is available';
COMMENT ON COLUMN institution_profiles.computer_lab_available IS 'Whether computer lab facility is available';
COMMENT ON COLUMN institution_profiles.wifi_available IS 'Whether WiFi facility is available';
COMMENT ON COLUMN institution_profiles.laboratory_facilities IS 'JSON object containing available laboratory facilities';
COMMENT ON COLUMN institution_profiles.sports_facilities IS 'JSON object containing available sports facilities';
COMMENT ON COLUMN institution_profiles.main_building_photo IS 'Path to main building photo';
COMMENT ON COLUMN institution_profiles.classroom_photos IS 'Array of paths to classroom photos';

-- Step 3 comments
COMMENT ON COLUMN institution_profiles.course_categories IS 'JSON object containing selected course categories';
COMMENT ON COLUMN institution_profiles.course_details IS 'JSON object containing detailed course information for each category';
COMMENT ON COLUMN institution_profiles.total_current_students IS 'Total number of current students enrolled';
COMMENT ON COLUMN institution_profiles.average_batch_size IS 'Average size of student batches';
COMMENT ON COLUMN institution_profiles.student_teacher_ratio IS 'Student to teacher ratio (e.g., 15:1)';
COMMENT ON COLUMN institution_profiles.class_timings IS 'JSON object containing available class timing options';
COMMENT ON COLUMN institution_profiles.admission_fees IS 'Admission fees amount';
COMMENT ON COLUMN institution_profiles.security_deposit IS 'Security deposit amount (optional)';

-- Step 4 comments
COMMENT ON COLUMN institution_profiles.total_teaching_staff IS 'Total number of teaching staff members';
COMMENT ON COLUMN institution_profiles.total_non_teaching_staff IS 'Total number of non-teaching staff members';
COMMENT ON COLUMN institution_profiles.average_faculty_experience IS 'Average experience level of faculty members';
COMMENT ON COLUMN institution_profiles.principal_director_name IS 'Name of the principal or director';
COMMENT ON COLUMN institution_profiles.principal_director_qualification IS 'Qualification of the principal or director';
COMMENT ON COLUMN institution_profiles.principal_director_experience IS 'Years of experience of the principal or director';
COMMENT ON COLUMN institution_profiles.principal_director_photo IS 'Path to principal/director photo';
COMMENT ON COLUMN institution_profiles.principal_director_bio IS 'Brief biography of the principal or director';
COMMENT ON COLUMN institution_profiles.department_heads IS 'Array of department head information';
COMMENT ON COLUMN institution_profiles.phd_holders IS 'Number of faculty members with PhD degrees';
COMMENT ON COLUMN institution_profiles.post_graduates IS 'Number of faculty members with post-graduate degrees';
COMMENT ON COLUMN institution_profiles.graduates IS 'Number of faculty members with graduate degrees';
COMMENT ON COLUMN institution_profiles.professional_certified IS 'Number of professionally certified faculty members';
COMMENT ON COLUMN institution_profiles.awards_received IS 'Awards and recognition received by faculty';
COMMENT ON COLUMN institution_profiles.publications IS 'Publications by faculty members';
COMMENT ON COLUMN institution_profiles.industry_experience IS 'Industry experience of faculty members';
COMMENT ON COLUMN institution_profiles.training_programs IS 'Training programs attended by faculty';

-- Step 5 comments
COMMENT ON COLUMN institution_profiles.board_exam_results IS 'Array of board exam results for last 3 years with year, pass percentage, distinction percentage, and top scorer details';
COMMENT ON COLUMN institution_profiles.competitive_exam_results IS 'Array of competitive exam results with exam type, year, students appeared, qualified, top ranks, and success percentage';
COMMENT ON COLUMN institution_profiles.institution_awards IS 'Object containing institution awards, government recognition, education board awards, quality certifications, and media recognition';
COMMENT ON COLUMN institution_profiles.student_achievements IS 'Object containing sports achievements, cultural achievements, academic excellence awards, and competition winners';
COMMENT ON COLUMN institution_profiles.accreditations IS 'Object containing government accreditation, board affiliation, university affiliation, professional memberships, quality certifications, and certificate documents';
COMMENT ON COLUMN institution_profiles.success_stories IS 'Object containing alumni success stories, placement records, higher studies admissions, and scholarship recipients';

-- Additional metadata comments
COMMENT ON COLUMN institution_profiles.verified IS 'Whether the institution profile has been verified';
COMMENT ON COLUMN institution_profiles.rating IS 'Average rating of the institution (0.0 to 5.0)';
COMMENT ON COLUMN institution_profiles.total_reviews IS 'Total number of reviews received';
COMMENT ON COLUMN institution_profiles.description IS 'General description of the institution';

-- Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'institution_profiles' 
ORDER BY ordinal_position;
