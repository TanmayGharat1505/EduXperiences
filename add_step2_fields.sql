-- Add Step 2 fields to institution_profiles table
-- Infrastructure and Facilities

-- Add basic infrastructure fields
ALTER TABLE institution_profiles 
ADD COLUMN IF NOT EXISTS total_classrooms INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS classroom_capacity INTEGER DEFAULT 0;

-- Add facility availability fields (boolean)
ALTER TABLE institution_profiles 
ADD COLUMN IF NOT EXISTS library_available BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS computer_lab_available BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS wifi_available BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS parking_available BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cafeteria_available BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS air_conditioning_available BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cctv_security_available BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS wheelchair_accessible BOOLEAN DEFAULT FALSE;

-- Add teaching facility fields
ALTER TABLE institution_profiles 
ADD COLUMN IF NOT EXISTS projectors_smart_boards BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS audio_system BOOLEAN DEFAULT FALSE;

-- Add laboratory facility fields
ALTER TABLE institution_profiles 
ADD COLUMN IF NOT EXISTS physics_lab BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS chemistry_lab BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS biology_lab BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS computer_lab BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS language_lab BOOLEAN DEFAULT FALSE;

-- Add sports facility fields
ALTER TABLE institution_profiles 
ADD COLUMN IF NOT EXISTS indoor_games BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS outdoor_playground BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS gymnasium BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS swimming_pool BOOLEAN DEFAULT FALSE;

-- Add additional service fields
ALTER TABLE institution_profiles 
ADD COLUMN IF NOT EXISTS transportation_provided BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS hostel_facility BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS study_material_provided BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS online_classes BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recorded_sessions BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS mock_tests_assessments BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS career_counseling BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS job_placement_assistance BOOLEAN DEFAULT FALSE;

-- Add photo fields (text arrays for multiple photos)
ALTER TABLE institution_profiles 
ADD COLUMN IF NOT EXISTS main_building_photo TEXT,
ADD COLUMN IF NOT EXISTS classroom_photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS laboratory_photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS facilities_photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS achievement_photos TEXT[] DEFAULT '{}';

-- Add comments for documentation
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
