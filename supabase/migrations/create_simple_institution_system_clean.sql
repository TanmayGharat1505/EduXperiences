-- Clean Institution Signup System Migration
-- This script will drop existing tables and recreate them with the correct schema

-- Drop existing tables in correct order (due to foreign key constraints)
DROP TABLE IF EXISTS institution_fee_policies CASCADE;
DROP TABLE IF EXISTS institution_results_achievements CASCADE;
DROP TABLE IF EXISTS institution_academic_programs CASCADE;
DROP TABLE IF EXISTS institution_faculty_staff CASCADE;
DROP TABLE IF EXISTS institution_photos CASCADE;
DROP TABLE IF EXISTS institution_facilities CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;

-- Create a simple institutions table
CREATE TABLE institutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_name TEXT NOT NULL,
  institution_type TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create institution_facilities table
CREATE TABLE institution_facilities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- Infrastructure Details
  total_classrooms INTEGER NOT NULL CHECK (total_classrooms >= 1 AND total_classrooms <= 100),
  classroom_capacity INTEGER,
  library_available BOOLEAN DEFAULT false,
  computer_lab BOOLEAN DEFAULT false,
  wifi_available BOOLEAN DEFAULT false,
  parking_available BOOLEAN DEFAULT false,
  cafeteria_canteen BOOLEAN DEFAULT false,
  air_conditioning BOOLEAN DEFAULT false,
  cctv_security BOOLEAN DEFAULT false,
  wheelchair_accessible BOOLEAN DEFAULT false,
  
  -- Teaching Facilities
  projectors_smart_boards BOOLEAN DEFAULT false,
  audio_system BOOLEAN DEFAULT false,
  
  -- Laboratory Facilities (JSON array for multiple selections)
  laboratory_facilities JSONB DEFAULT '[]',
  
  -- Sports Facilities (JSON array for multiple selections)
  sports_facilities JSONB DEFAULT '[]',
  
  -- Additional Services
  transportation_provided BOOLEAN DEFAULT false,
  hostel_facility BOOLEAN DEFAULT false,
  study_material_provided BOOLEAN DEFAULT false,
  online_classes BOOLEAN DEFAULT false,
  recorded_sessions BOOLEAN DEFAULT false,
  mock_tests_assessments BOOLEAN DEFAULT false,
  career_counseling BOOLEAN DEFAULT false,
  job_placement_assistance BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create institution_photos table
CREATE TABLE institution_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  photo_type VARCHAR(50) NOT NULL CHECK (photo_type IN (
    'main_building',
    'classroom',
    'laboratory',
    'facilities',
    'achievement_certificate'
  )),
  photo_url TEXT NOT NULL,
  photo_name VARCHAR(255),
  photo_size INTEGER,
  photo_mime_type VARCHAR(100),
  is_primary BOOLEAN DEFAULT false,
  upload_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create institution_academic_programs table
CREATE TABLE institution_academic_programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- Course Categories (JSON array for complex course data)
  course_categories JSONB NOT NULL DEFAULT '[]',
  
  -- Batch Information
  total_current_students INTEGER NOT NULL CHECK (total_current_students > 0),
  average_batch_size INTEGER NOT NULL CHECK (average_batch_size > 0),
  student_teacher_ratio VARCHAR(20) NOT NULL,
  class_timings JSONB NOT NULL DEFAULT '[]',
  
  -- Admission Process
  admission_test_required BOOLEAN DEFAULT false,
  minimum_qualification VARCHAR(100) NOT NULL,
  age_restrictions VARCHAR(100),
  admission_fees DECIMAL(10,2) NOT NULL CHECK (admission_fees >= 0),
  security_deposit DECIMAL(10,2) CHECK (security_deposit >= 0),
  refund_policy TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create institution_faculty_staff table
CREATE TABLE institution_faculty_staff (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- Faculty Details
  total_teaching_staff INTEGER NOT NULL CHECK (total_teaching_staff > 0),
  total_non_teaching_staff INTEGER DEFAULT 0,
  average_faculty_experience VARCHAR(20) NOT NULL,
  
  -- Principal/Director Information
  principal_name TEXT NOT NULL,
  principal_qualification TEXT NOT NULL,
  principal_experience INTEGER NOT NULL CHECK (principal_experience >= 0),
  principal_photo_url TEXT,
  principal_bio TEXT,
  
  -- Head of Departments (JSON array for multiple department heads)
  department_heads JSONB NOT NULL DEFAULT '[]',
  
  -- Faculty Qualifications
  phd_holders INTEGER DEFAULT 0,
  post_graduates INTEGER DEFAULT 0,
  graduates INTEGER DEFAULT 0,
  professional_certified INTEGER DEFAULT 0,
  
  -- Faculty Achievements
  awards_received TEXT,
  publications TEXT,
  industry_experience TEXT,
  training_programs_attended TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create institution_results_achievements table
CREATE TABLE institution_results_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- Academic Results (last 3 years) - JSON array for multiple year results
  academic_results JSONB NOT NULL DEFAULT '[]',
  
  -- Competitive Exam Results - JSON array for multiple exam results
  competitive_exam_results JSONB NOT NULL DEFAULT '[]',
  
  -- Awards & Recognition
  institution_awards JSONB NOT NULL DEFAULT '[]',
  student_achievements JSONB NOT NULL DEFAULT '[]',
  
  -- Accreditations
  government_accreditation BOOLEAN DEFAULT false,
  board_affiliation_details TEXT NOT NULL,
  university_affiliation TEXT,
  professional_body_membership TEXT,
  quality_certifications TEXT,
  
  -- Success Stories
  alumni_success_stories TEXT,
  placement_records TEXT,
  higher_studies_admissions TEXT,
  scholarship_recipients TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create institution_fee_policies table
CREATE TABLE institution_fee_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  
  -- Detailed Fee Structure (repeatable per Course/Subject) - JSON array for multiple fee structures
  fee_structures JSONB NOT NULL DEFAULT '[]',
  
  -- Payment Options
  payment_modes_accepted JSONB NOT NULL DEFAULT '[]',
  payment_schedule VARCHAR(50) NOT NULL,
  
  -- Fee Policies
  late_payment_penalty TEXT,
  refund_policy TEXT NOT NULL,
  scholarship_available BOOLEAN DEFAULT false,
  scholarship_criteria TEXT,
  
  -- Discounts
  discount_for_multiple_courses BOOLEAN DEFAULT false,
  sibling_discount BOOLEAN DEFAULT false,
  early_bird_discount BOOLEAN DEFAULT false,
  
  -- Financial Aid
  education_loan_assistance BOOLEAN DEFAULT false,
  installment_facility BOOLEAN DEFAULT false,
  hardship_support BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create storage bucket for institution photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'institution-photos',
  'institution-photos',
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_institutions_registration_number ON institutions(registration_number);
CREATE INDEX IF NOT EXISTS idx_institutions_contact_email ON institutions(contact_email);
CREATE INDEX IF NOT EXISTS idx_institution_facilities_institution_id ON institution_facilities(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_photos_institution_id ON institution_photos(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_academic_programs_institution_id ON institution_academic_programs(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_faculty_staff_institution_id ON institution_faculty_staff(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_results_achievements_institution_id ON institution_results_achievements(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_fee_policies_institution_id ON institution_fee_policies(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_photos_type ON institution_photos(photo_type);

-- Enable RLS
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_academic_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_faculty_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_results_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_fee_policies ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for institutions (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institutions' AND policyname = 'Anyone can view institutions') THEN
    CREATE POLICY "Anyone can view institutions" ON institutions FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institutions' AND policyname = 'Anyone can insert institutions') THEN
    CREATE POLICY "Anyone can insert institutions" ON institutions FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institutions' AND policyname = 'Anyone can update institutions') THEN
    CREATE POLICY "Anyone can update institutions" ON institutions FOR UPDATE USING (true);
  END IF;
END $$;

-- Create RLS policies for institution_facilities (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_facilities' AND policyname = 'Anyone can view institution facilities') THEN
    CREATE POLICY "Anyone can view institution facilities" ON institution_facilities FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_facilities' AND policyname = 'Anyone can insert institution facilities') THEN
    CREATE POLICY "Anyone can insert institution facilities" ON institution_facilities FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_facilities' AND policyname = 'Anyone can update institution facilities') THEN
    CREATE POLICY "Anyone can update institution facilities" ON institution_facilities FOR UPDATE USING (true);
  END IF;
END $$;

-- Create RLS policies for institution_photos (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_photos' AND policyname = 'Anyone can view institution photos') THEN
    CREATE POLICY "Anyone can view institution photos" ON institution_photos FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_photos' AND policyname = 'Anyone can insert institution photos') THEN
    CREATE POLICY "Anyone can insert institution photos" ON institution_photos FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_photos' AND policyname = 'Anyone can update institution photos') THEN
    CREATE POLICY "Anyone can update institution photos" ON institution_photos FOR UPDATE USING (true);
  END IF;
END $$;

-- Create RLS policies for institution_academic_programs (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_academic_programs' AND policyname = 'Anyone can view institution academic programs') THEN
    CREATE POLICY "Anyone can view institution academic programs" ON institution_academic_programs FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_academic_programs' AND policyname = 'Anyone can insert institution academic programs') THEN
    CREATE POLICY "Anyone can insert institution academic programs" ON institution_academic_programs FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_academic_programs' AND policyname = 'Anyone can update institution academic programs') THEN
    CREATE POLICY "Anyone can update institution academic programs" ON institution_academic_programs FOR UPDATE USING (true);
  END IF;
END $$;

-- Create RLS policies for institution_faculty_staff (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_faculty_staff' AND policyname = 'Anyone can view institution faculty staff') THEN
    CREATE POLICY "Anyone can view institution faculty staff" ON institution_faculty_staff FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_faculty_staff' AND policyname = 'Anyone can insert institution faculty staff') THEN
    CREATE POLICY "Anyone can insert institution faculty staff" ON institution_faculty_staff FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_faculty_staff' AND policyname = 'Anyone can update institution faculty staff') THEN
    CREATE POLICY "Anyone can update institution faculty staff" ON institution_faculty_staff FOR UPDATE USING (true);
  END IF;
END $$;

-- Create RLS policies for institution_results_achievements (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_results_achievements' AND policyname = 'Anyone can view institution results achievements') THEN
    CREATE POLICY "Anyone can view institution results achievements" ON institution_results_achievements FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_results_achievements' AND policyname = 'Anyone can insert institution results achievements') THEN
    CREATE POLICY "Anyone can insert institution results achievements" ON institution_results_achievements FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_results_achievements' AND policyname = 'Anyone can update institution results achievements') THEN
    CREATE POLICY "Anyone can update institution results achievements" ON institution_results_achievements FOR UPDATE USING (true);
  END IF;
END $$;

-- Create RLS policies for institution_fee_policies (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_fee_policies' AND policyname = 'Anyone can view institution fee policies') THEN
    CREATE POLICY "Anyone can view institution fee policies" ON institution_fee_policies FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_fee_policies' AND policyname = 'Anyone can insert institution fee policies') THEN
    CREATE POLICY "Anyone can insert institution fee policies" ON institution_fee_policies FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'institution_fee_policies' AND policyname = 'Anyone can update institution fee policies') THEN
    CREATE POLICY "Anyone can update institution fee policies" ON institution_fee_policies FOR UPDATE USING (true);
  END IF;
END $$;

-- Create storage policies for institution photos (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Anyone can upload institution photos'
  ) THEN
    CREATE POLICY "Anyone can upload institution photos" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'institution-photos');
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'objects' 
    AND schemaname = 'storage' 
    AND policyname = 'Anyone can view institution photos'
  ) THEN
    CREATE POLICY "Anyone can view institution photos" ON storage.objects
      FOR SELECT USING (bucket_id = 'institution-photos');
  END IF;
END $$;

-- Grant permissions
GRANT ALL ON institutions TO authenticated;
GRANT ALL ON institution_facilities TO authenticated;
GRANT ALL ON institution_photos TO authenticated;
GRANT ALL ON institution_academic_programs TO authenticated;
GRANT ALL ON institution_faculty_staff TO authenticated;
GRANT ALL ON institution_results_achievements TO authenticated;
GRANT ALL ON institution_fee_policies TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- Success message
SELECT 'Clean Institution Signup System Database Created Successfully!' as status;
