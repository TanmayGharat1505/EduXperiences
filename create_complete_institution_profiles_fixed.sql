-- Create Complete Institution Profiles Table with All Steps (1, 2, and 3) - FIXED VERSION
-- This script handles existing objects gracefully and creates the complete table structure

-- Drop existing table if it exists (to avoid conflicts)
DROP TABLE IF EXISTS institution_profiles CASCADE;

-- Drop existing function if it exists
DROP FUNCTION IF EXISTS update_institution_profiles_updated_at() CASCADE;

-- Create the complete institution_profiles table
CREATE TABLE institution_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Step 1: Basic Information
    institution_name VARCHAR(255) NOT NULL,
    institution_type VARCHAR(100) NOT NULL,
    established_year INTEGER NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    pan_number VARCHAR(10) NOT NULL,
    gst_number VARCHAR(15),
    official_email VARCHAR(255) UNIQUE NOT NULL,
    primary_contact_number VARCHAR(15) UNIQUE NOT NULL,
    secondary_contact_number VARCHAR(15),
    website_url VARCHAR(500),
    
    -- Step 1: Address Information
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pin_code VARCHAR(6) NOT NULL,
    landmark VARCHAR(255),
    google_maps_location TEXT,
    
    -- Step 1: Legal Information
    owner_name VARCHAR(255) NOT NULL,
    owner_contact_number VARCHAR(15) NOT NULL,
    business_license TEXT,
    registration_certificate TEXT,
    agree_to_terms BOOLEAN NOT NULL DEFAULT FALSE,
    agree_to_background_verification BOOLEAN NOT NULL DEFAULT FALSE,
    
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
    
    -- Step 2: Teaching Facilities
    projectors_smart_boards BOOLEAN DEFAULT FALSE,
    audio_system BOOLEAN DEFAULT FALSE,
    
    -- Step 2: Laboratory Facilities
    physics_lab BOOLEAN DEFAULT FALSE,
    chemistry_lab BOOLEAN DEFAULT FALSE,
    biology_lab BOOLEAN DEFAULT FALSE,
    computer_lab BOOLEAN DEFAULT FALSE,
    language_lab BOOLEAN DEFAULT FALSE,
    
    -- Step 2: Sports Facilities
    indoor_games BOOLEAN DEFAULT FALSE,
    outdoor_playground BOOLEAN DEFAULT FALSE,
    gymnasium BOOLEAN DEFAULT FALSE,
    swimming_pool BOOLEAN DEFAULT FALSE,
    
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
    classroom_photos TEXT[] DEFAULT '{}',
    laboratory_photos TEXT[] DEFAULT '{}',
    facilities_photos TEXT[] DEFAULT '{}',
    achievement_photos TEXT[] DEFAULT '{}',
    
    -- Step 3: Academic Courses
    course_categories JSONB DEFAULT '{}',
    course_details JSONB DEFAULT '{}',
    
    -- Step 3: Batch Information
    total_current_students INTEGER DEFAULT 0,
    average_batch_size INTEGER DEFAULT 0,
    student_teacher_ratio VARCHAR(20) DEFAULT '',
    class_timings JSONB DEFAULT '{}',
    
    -- Step 3: Admission Process
    admission_test_required BOOLEAN DEFAULT FALSE,
    minimum_qualification VARCHAR(100) DEFAULT '',
    age_restrictions TEXT DEFAULT '',
    admission_fees DECIMAL(10,2) DEFAULT 0.00,
    security_deposit DECIMAL(10,2) DEFAULT 0.00,
    refund_policy TEXT DEFAULT '',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_institution_profiles_user_id ON institution_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_institution_name ON institution_profiles(institution_name);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_registration_number ON institution_profiles(registration_number);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_official_email ON institution_profiles(official_email);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_primary_contact ON institution_profiles(primary_contact_number);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_city ON institution_profiles(city);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_state ON institution_profiles(state);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_institution_type ON institution_profiles(institution_type);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_course_categories ON institution_profiles USING GIN(course_categories);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_course_details ON institution_profiles USING GIN(course_details);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_class_timings ON institution_profiles USING GIN(class_timings);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_admission_fees ON institution_profiles(admission_fees);
CREATE INDEX IF NOT EXISTS idx_institution_profiles_total_students ON institution_profiles(total_current_students);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_institution_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger (this will work now since we dropped the old one)
CREATE TRIGGER institution_profiles_updated_at
    BEFORE UPDATE ON institution_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_institution_profiles_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE institution_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON institution_profiles;

-- Create RLS policies
-- Policy: Allow all operations for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON institution_profiles
    FOR ALL USING (true);

-- Add comprehensive comments for documentation
COMMENT ON TABLE institution_profiles IS 'Complete institution profile information including basic details, facilities, courses, and admission processes';
COMMENT ON COLUMN institution_profiles.id IS 'Unique identifier for the institution profile';
COMMENT ON COLUMN institution_profiles.user_id IS 'Reference to the user who owns this institution profile';

-- Step 1 Comments
COMMENT ON COLUMN institution_profiles.institution_name IS 'Name of the educational institution';
COMMENT ON COLUMN institution_profiles.institution_type IS 'Type of educational institution';
COMMENT ON COLUMN institution_profiles.established_year IS 'Year when the institution was established';
COMMENT ON COLUMN institution_profiles.registration_number IS 'Government registration number (unique)';
COMMENT ON COLUMN institution_profiles.pan_number IS 'PAN number of the institution';
COMMENT ON COLUMN institution_profiles.gst_number IS 'GST number (optional)';
COMMENT ON COLUMN institution_profiles.official_email IS 'Official email address (unique)';
COMMENT ON COLUMN institution_profiles.primary_contact_number IS 'Primary contact number (unique)';
COMMENT ON COLUMN institution_profiles.secondary_contact_number IS 'Secondary contact number (optional)';
COMMENT ON COLUMN institution_profiles.website_url IS 'Institution website URL (optional)';
COMMENT ON COLUMN institution_profiles.address IS 'Complete address of the institution';
COMMENT ON COLUMN institution_profiles.city IS 'City where institution is located';
COMMENT ON COLUMN institution_profiles.state IS 'State where institution is located';
COMMENT ON COLUMN institution_profiles.pin_code IS 'PIN code of the area';
COMMENT ON COLUMN institution_profiles.landmark IS 'Landmark near the institution (optional)';
COMMENT ON COLUMN institution_profiles.google_maps_location IS 'Google Maps location link (optional)';
COMMENT ON COLUMN institution_profiles.owner_name IS 'Name of institution owner/director';
COMMENT ON COLUMN institution_profiles.owner_contact_number IS 'Contact number of owner/director';
COMMENT ON COLUMN institution_profiles.business_license IS 'Path to uploaded business license';
COMMENT ON COLUMN institution_profiles.registration_certificate IS 'Path to uploaded registration certificate';
COMMENT ON COLUMN institution_profiles.agree_to_terms IS 'Whether institution agrees to terms and conditions';
COMMENT ON COLUMN institution_profiles.agree_to_background_verification IS 'Whether institution agrees to background verification';

-- Step 2 Comments
COMMENT ON COLUMN institution_profiles.total_classrooms IS 'Total number of classrooms in the institution';
COMMENT ON COLUMN institution_profiles.classroom_capacity IS 'Average capacity per classroom';
COMMENT ON COLUMN institution_profiles.library_available IS 'Whether library facility is available';
COMMENT ON COLUMN institution_profiles.computer_lab_available IS 'Whether computer lab is available';
COMMENT ON COLUMN institution_profiles.wifi_available IS 'Whether WiFi is available';
COMMENT ON COLUMN institution_profiles.parking_available IS 'Whether parking facility is available';
COMMENT ON COLUMN institution_profiles.cafeteria_available IS 'Whether cafeteria/canteen is available';
COMMENT ON COLUMN institution_profiles.air_conditioning_available IS 'Whether air conditioning is available';
COMMENT ON COLUMN institution_profiles.cctv_security_available IS 'Whether CCTV security is available';
COMMENT ON COLUMN institution_profiles.wheelchair_accessible IS 'Whether wheelchair accessibility is available';
COMMENT ON COLUMN institution_profiles.projectors_smart_boards IS 'Whether projectors/smart boards are available';
COMMENT ON COLUMN institution_profiles.audio_system IS 'Whether audio system is available';
COMMENT ON COLUMN institution_profiles.physics_lab IS 'Whether physics laboratory is available';
COMMENT ON COLUMN institution_profiles.chemistry_lab IS 'Whether chemistry laboratory is available';
COMMENT ON COLUMN institution_profiles.biology_lab IS 'Whether biology laboratory is available';
COMMENT ON COLUMN institution_profiles.computer_lab IS 'Whether computer laboratory is available';
COMMENT ON COLUMN institution_profiles.language_lab IS 'Whether language laboratory is available';
COMMENT ON COLUMN institution_profiles.indoor_games IS 'Whether indoor games facilities are available';
COMMENT ON COLUMN institution_profiles.outdoor_playground IS 'Whether outdoor playground is available';
COMMENT ON COLUMN institution_profiles.gymnasium IS 'Whether gymnasium is available';
COMMENT ON COLUMN institution_profiles.swimming_pool IS 'Whether swimming pool is available';
COMMENT ON COLUMN institution_profiles.transportation_provided IS 'Whether transportation service is provided';
COMMENT ON COLUMN institution_profiles.hostel_facility IS 'Whether hostel accommodation is available';
COMMENT ON COLUMN institution_profiles.study_material_provided IS 'Whether study materials are provided';
COMMENT ON COLUMN institution_profiles.online_classes IS 'Whether online classes are offered';
COMMENT ON COLUMN institution_profiles.recorded_sessions IS 'Whether recorded sessions are provided';
COMMENT ON COLUMN institution_profiles.mock_tests_assessments IS 'Whether mock tests/assessments are provided';
COMMENT ON COLUMN institution_profiles.career_counseling IS 'Whether career counseling is provided';
COMMENT ON COLUMN institution_profiles.job_placement_assistance IS 'Whether job placement assistance is provided';
COMMENT ON COLUMN institution_profiles.main_building_photo IS 'URL/path to main building photo';
COMMENT ON COLUMN institution_profiles.classroom_photos IS 'Array of URLs/paths to classroom photos';
COMMENT ON COLUMN institution_profiles.laboratory_photos IS 'Array of URLs/paths to laboratory photos';
COMMENT ON COLUMN institution_profiles.facilities_photos IS 'Array of URLs/paths to facilities photos';
COMMENT ON COLUMN institution_profiles.achievement_photos IS 'Array of URLs/paths to achievement photos';

-- Step 3 Comments
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

-- Metadata Comments
COMMENT ON COLUMN institution_profiles.created_at IS 'Timestamp when the record was created';
COMMENT ON COLUMN institution_profiles.updated_at IS 'Timestamp when the record was last updated';

-- Verify the table was created successfully
SELECT 'Complete Institution Profiles Table Created Successfully!' as status;

-- Show the complete table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'institution_profiles'
ORDER BY ordinal_position;

-- Show the total number of columns
SELECT 
  'Total Columns:' as info,
  COUNT(*) as column_count
FROM information_schema.columns 
WHERE table_name = 'institution_profiles';
