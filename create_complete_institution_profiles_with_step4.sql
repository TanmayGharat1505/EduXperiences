-- Create complete institution_profiles table with all Steps 1-4 fields
-- This script creates the table from scratch with all required fields

-- Drop existing table if it exists
DROP TABLE IF EXISTS institution_profiles CASCADE;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_institution_profiles_updated_at() CASCADE;

-- Create the institution_profiles table
CREATE TABLE institution_profiles (
  -- Primary key and user reference
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  
  -- Step 1: Basic Institution Information
  institution_name VARCHAR(255) NOT NULL,
  institution_type VARCHAR(100),
  other_institution_type VARCHAR(255),
  establishment_year INTEGER,
  registration_number VARCHAR(100),
  pan_number VARCHAR(20),
  gst_number VARCHAR(20),
  official_email VARCHAR(255),
  primary_contact VARCHAR(20),
  secondary_contact VARCHAR(20),
  website_url TEXT,
  
  -- Step 1: Address Information
  complete_address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pin_code VARCHAR(10),
  landmark VARCHAR(255),
  map_location TEXT,
  
  -- Step 1: Legal Information
  owner_director_name VARCHAR(255),
  owner_contact_number VARCHAR(20),
  business_license_file TEXT,
  registration_certificate_file TEXT,
  agree_to_terms BOOLEAN DEFAULT FALSE,
  agree_to_background_verification BOOLEAN DEFAULT FALSE,
  
  -- Step 2: Infrastructure Details
  total_classrooms INTEGER DEFAULT 0,
  classroom_capacity INTEGER DEFAULT 0,
  library_available BOOLEAN DEFAULT FALSE,
  computer_lab_available BOOLEAN DEFAULT FALSE,
  wifi_available BOOLEAN DEFAULT FALSE,
  parking_available BOOLEAN DEFAULT FALSE,
  cafeteria_available BOOLEAN DEFAULT FALSE,
  air_conditioning_available BOOLEAN DEFAULT FALSE,
  cctv_security_available BOOLEAN DEFAULT FALSE,
  wheelchair_accessible BOOLEAN DEFAULT FALSE,
  projectors_smart_boards_available BOOLEAN DEFAULT FALSE,
  audio_system_available BOOLEAN DEFAULT FALSE,
  
  -- Step 2: Teaching & Laboratory Facilities
  laboratory_facilities TEXT,
  sports_facilities TEXT,
  
  -- Step 2: Additional Services
  transportation_provided BOOLEAN DEFAULT FALSE,
  hostel_facility BOOLEAN DEFAULT FALSE,
  study_material_provided BOOLEAN DEFAULT FALSE,
  online_classes BOOLEAN DEFAULT FALSE,
  recorded_sessions BOOLEAN DEFAULT FALSE,
  mock_tests_assessments BOOLEAN DEFAULT FALSE,
  career_counseling BOOLEAN DEFAULT FALSE,
  job_placement_assistance BOOLEAN DEFAULT FALSE,
  
  -- Step 2: Institution Photos
  main_building_photo TEXT,
  classroom_photos TEXT[],
  laboratory_photos TEXT[],
  facilities_photos TEXT[],
  achievement_photos TEXT[],
  
  -- Step 3: Academic Courses
  course_categories JSONB DEFAULT '{}'::jsonb,
  course_details JSONB DEFAULT '{}'::jsonb,
  
  -- Step 3: Batch Information
  total_current_students INTEGER DEFAULT 0,
  average_batch_size INTEGER DEFAULT 0,
  student_teacher_ratio VARCHAR(50),
  class_timings JSONB DEFAULT '[]'::jsonb,
  
  -- Step 3: Admission Process
  admission_test_required BOOLEAN DEFAULT FALSE,
  minimum_qualification VARCHAR(100),
  age_restrictions TEXT,
  admission_fees DECIMAL(10,2) DEFAULT 0.00,
  security_deposit DECIMAL(10,2) DEFAULT 0.00,
  refund_policy TEXT,
  
  -- Step 4: Faculty Details
  total_teaching_staff INTEGER DEFAULT 0,
  total_non_teaching_staff INTEGER DEFAULT 0,
  average_faculty_experience VARCHAR(50),
  
  -- Step 4: Principal/Director Information
  principal_director_name VARCHAR(255),
  principal_director_qualification VARCHAR(255),
  principal_director_experience INTEGER DEFAULT 0,
  principal_director_photo TEXT,
  principal_director_bio TEXT,
  
  -- Step 4: Department Heads
  department_heads JSONB DEFAULT '[]'::jsonb,
  
  -- Step 4: Faculty Qualifications
  phd_holders INTEGER DEFAULT 0,
  post_graduates INTEGER DEFAULT 0,
  graduates INTEGER DEFAULT 0,
  professional_certified INTEGER DEFAULT 0,
  
  -- Step 4: Faculty Achievements
  awards_received TEXT,
  publications TEXT,
  industry_experience TEXT,
  training_programs TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Additional fields for future use
  verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_reviews INTEGER DEFAULT 0,
  description TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_institution_profiles_user_id ON institution_profiles(user_id);
CREATE INDEX idx_institution_profiles_institution_name ON institution_profiles(institution_name);
CREATE INDEX idx_institution_profiles_city ON institution_profiles(city);
CREATE INDEX idx_institution_profiles_state ON institution_profiles(state);
CREATE INDEX idx_institution_profiles_institution_type ON institution_profiles(institution_type);
CREATE INDEX idx_institution_profiles_verified ON institution_profiles(verified);
CREATE INDEX idx_institution_profiles_rating ON institution_profiles(rating);
CREATE INDEX idx_institution_profiles_created_at ON institution_profiles(created_at);

-- Create indexes for Step 2 fields
CREATE INDEX idx_institution_profiles_total_classrooms ON institution_profiles(total_classrooms);
CREATE INDEX idx_institution_profiles_classroom_capacity ON institution_profiles(classroom_capacity);

-- Create indexes for Step 3 fields
CREATE INDEX idx_institution_profiles_total_students ON institution_profiles(total_current_students);
CREATE INDEX idx_institution_profiles_batch_size ON institution_profiles(average_batch_size);
CREATE INDEX idx_institution_profiles_admission_fees ON institution_profiles(admission_fees);

-- Create indexes for Step 4 fields
CREATE INDEX idx_institution_profiles_teaching_staff ON institution_profiles(total_teaching_staff);
CREATE INDEX idx_institution_profiles_faculty_experience ON institution_profiles(average_faculty_experience);
CREATE INDEX idx_institution_profiles_department_heads ON institution_profiles USING GIN (department_heads);

-- Create GIN indexes for JSONB columns
CREATE INDEX idx_institution_profiles_course_categories ON institution_profiles USING GIN (course_categories);
CREATE INDEX idx_institution_profiles_course_details ON institution_profiles USING GIN (course_details);
CREATE INDEX idx_institution_profiles_class_timings ON institution_profiles USING GIN (class_timings);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_institution_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER institution_profiles_updated_at
  BEFORE UPDATE ON institution_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_institution_profiles_updated_at();

-- Add comments to the table
COMMENT ON TABLE institution_profiles IS 'Comprehensive institution profile information including basic details, infrastructure, courses, and faculty information';

-- Add column comments for Step 1
COMMENT ON COLUMN institution_profiles.institution_name IS 'Name of the educational institution';
COMMENT ON COLUMN institution_profiles.institution_type IS 'Type of institution (School, College, University, etc.)';
COMMENT ON COLUMN institution_profiles.establishment_year IS 'Year when the institution was established';
COMMENT ON COLUMN institution_profiles.registration_number IS 'Official registration number of the institution';
COMMENT ON COLUMN institution_profiles.official_email IS 'Official email address of the institution';
COMMENT ON COLUMN institution_profiles.primary_contact IS 'Primary contact phone number';
COMMENT ON COLUMN institution_profiles.complete_address IS 'Complete address of the institution';
COMMENT ON COLUMN institution_profiles.city IS 'City where the institution is located';
COMMENT ON COLUMN institution_profiles.state IS 'State where the institution is located';
COMMENT ON COLUMN institution_profiles.pin_code IS 'PIN code of the institution location';
COMMENT ON COLUMN institution_profiles.owner_director_name IS 'Name of the owner or director';
COMMENT ON COLUMN institution_profiles.owner_contact_number IS 'Contact number of the owner or director';
COMMENT ON COLUMN institution_profiles.business_license_file IS 'Path to business license file';
COMMENT ON COLUMN institution_profiles.registration_certificate_file IS 'Path to registration certificate file';

-- Add column comments for Step 2
COMMENT ON COLUMN institution_profiles.total_classrooms IS 'Total number of classrooms in the institution';
COMMENT ON COLUMN institution_profiles.classroom_capacity IS 'Average capacity of each classroom';
COMMENT ON COLUMN institution_profiles.library_available IS 'Whether library facility is available';
COMMENT ON COLUMN institution_profiles.computer_lab_available IS 'Whether computer lab facility is available';
COMMENT ON COLUMN institution_profiles.wifi_available IS 'Whether WiFi facility is available';
COMMENT ON COLUMN institution_profiles.parking_available IS 'Whether parking facility is available';
COMMENT ON COLUMN institution_profiles.cafeteria_available IS 'Whether cafeteria facility is available';
COMMENT ON COLUMN institution_profiles.air_conditioning_available IS 'Whether air conditioning is available';
COMMENT ON COLUMN institution_profiles.cctv_security_available IS 'Whether CCTV security is available';
COMMENT ON COLUMN institution_profiles.wheelchair_accessible IS 'Whether the institution is wheelchair accessible';
COMMENT ON COLUMN institution_profiles.projectors_smart_boards_available IS 'Whether projectors and smart boards are available';
COMMENT ON COLUMN institution_profiles.audio_system_available IS 'Whether audio system is available';
COMMENT ON COLUMN institution_profiles.laboratory_facilities IS 'Description of laboratory facilities available';
COMMENT ON COLUMN institution_profiles.sports_facilities IS 'Description of sports facilities available';
COMMENT ON COLUMN institution_profiles.transportation_provided IS 'Whether transportation service is provided';
COMMENT ON COLUMN institution_profiles.hostel_facility IS 'Whether hostel facility is available';
COMMENT ON COLUMN institution_profiles.study_material_provided IS 'Whether study material is provided';
COMMENT ON COLUMN institution_profiles.online_classes IS 'Whether online classes are offered';
COMMENT ON COLUMN institution_profiles.recorded_sessions IS 'Whether recorded sessions are available';
COMMENT ON COLUMN institution_profiles.mock_tests_assessments IS 'Whether mock tests and assessments are provided';
COMMENT ON COLUMN institution_profiles.career_counseling IS 'Whether career counseling is provided';
COMMENT ON COLUMN institution_profiles.job_placement_assistance IS 'Whether job placement assistance is provided';
COMMENT ON COLUMN institution_profiles.main_building_photo IS 'Path to main building photo';
COMMENT ON COLUMN institution_profiles.classroom_photos IS 'Array of classroom photo paths';
COMMENT ON COLUMN institution_profiles.laboratory_photos IS 'Array of laboratory photo paths';
COMMENT ON COLUMN institution_profiles.facilities_photos IS 'Array of facilities photo paths';
COMMENT ON COLUMN institution_profiles.achievement_photos IS 'Array of achievement photo paths';

-- Add column comments for Step 3
COMMENT ON COLUMN institution_profiles.course_categories IS 'JSON object of selected course categories';
COMMENT ON COLUMN institution_profiles.course_details IS 'JSON object of detailed course information for each category';
COMMENT ON COLUMN institution_profiles.total_current_students IS 'Total number of current students enrolled';
COMMENT ON COLUMN institution_profiles.average_batch_size IS 'Average size of student batches';
COMMENT ON COLUMN institution_profiles.student_teacher_ratio IS 'Student to teacher ratio (e.g., 15:1)';
COMMENT ON COLUMN institution_profiles.class_timings IS 'JSON array of available class timings';
COMMENT ON COLUMN institution_profiles.admission_test_required IS 'Whether admission test is required';
COMMENT ON COLUMN institution_profiles.minimum_qualification IS 'Minimum qualification required for admission';
COMMENT ON COLUMN institution_profiles.age_restrictions IS 'Any age restrictions for admission';
COMMENT ON COLUMN institution_profiles.admission_fees IS 'Admission fees amount';
COMMENT ON COLUMN institution_profiles.security_deposit IS 'Security deposit amount (optional)';
COMMENT ON COLUMN institution_profiles.refund_policy IS 'Refund policy details';

-- Add column comments for Step 4
COMMENT ON COLUMN institution_profiles.total_teaching_staff IS 'Total number of teaching staff members';
COMMENT ON COLUMN institution_profiles.total_non_teaching_staff IS 'Total number of non-teaching staff members';
COMMENT ON COLUMN institution_profiles.average_faculty_experience IS 'Average faculty experience (e.g., 1-2 years, 3-5 years, 5+ years)';
COMMENT ON COLUMN institution_profiles.principal_director_name IS 'Name of the principal or director';
COMMENT ON COLUMN institution_profiles.principal_director_qualification IS 'Qualification of the principal or director';
COMMENT ON COLUMN institution_profiles.principal_director_experience IS 'Experience of the principal or director in years';
COMMENT ON COLUMN institution_profiles.principal_director_photo IS 'Photo path of the principal or director';
COMMENT ON COLUMN institution_profiles.principal_director_bio IS 'Brief bio of the principal or director';
COMMENT ON COLUMN institution_profiles.department_heads IS 'Array of department heads with their details (name, department, qualification, experience, photo, specialization)';
COMMENT ON COLUMN institution_profiles.phd_holders IS 'Number of faculty members with PhD degrees';
COMMENT ON COLUMN institution_profiles.post_graduates IS 'Number of faculty members with post-graduate degrees';
COMMENT ON COLUMN institution_profiles.graduates IS 'Number of faculty members with graduate degrees';
COMMENT ON COLUMN institution_profiles.professional_certified IS 'Number of faculty members with professional certifications';
COMMENT ON COLUMN institution_profiles.awards_received IS 'Awards, recognitions, and achievements received by faculty members';
COMMENT ON COLUMN institution_profiles.publications IS 'Research papers, books, articles, and other publications by faculty members';
COMMENT ON COLUMN institution_profiles.industry_experience IS 'Industry experience and corporate background of faculty members';
COMMENT ON COLUMN institution_profiles.training_programs IS 'Training programs, workshops, and professional development courses attended by faculty members';

-- Enable Row Level Security (RLS)
ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow all operations for authenticated users" ON institution_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON institution_profiles TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Verify the table structure
\d institution_profiles
