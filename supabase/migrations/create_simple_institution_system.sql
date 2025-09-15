-- Simple Institution Signup System
-- This creates the basic tables needed for the multi-step institution signup

-- Create a simple institutions table
CREATE TABLE IF NOT EXISTS institutions (
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
CREATE TABLE IF NOT EXISTS institution_facilities (
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
CREATE TABLE IF NOT EXISTS institution_photos (
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
CREATE TABLE IF NOT EXISTS institution_academic_programs (
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_institutions_registration_number ON institutions(registration_number);
CREATE INDEX IF NOT EXISTS idx_institutions_email ON institutions(email);
CREATE INDEX IF NOT EXISTS idx_institution_facilities_institution_id ON institution_facilities(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_photos_institution_id ON institution_photos(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_academic_programs_institution_id ON institution_academic_programs(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_photos_type ON institution_photos(photo_type);

-- Enable RLS
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_academic_programs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for institutions
CREATE POLICY "Anyone can view institutions" ON institutions FOR SELECT USING (true);
CREATE POLICY "Anyone can insert institutions" ON institutions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update institutions" ON institutions FOR UPDATE USING (true);

-- Create RLS policies for institution_facilities
CREATE POLICY "Anyone can view institution facilities" ON institution_facilities FOR SELECT USING (true);
CREATE POLICY "Anyone can insert institution facilities" ON institution_facilities FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update institution facilities" ON institution_facilities FOR UPDATE USING (true);

-- Create RLS policies for institution_photos
CREATE POLICY "Anyone can view institution photos" ON institution_photos FOR SELECT USING (true);
CREATE POLICY "Anyone can insert institution photos" ON institution_photos FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update institution photos" ON institution_photos FOR UPDATE USING (true);

-- Create RLS policies for institution_academic_programs
CREATE POLICY "Anyone can view institution academic programs" ON institution_academic_programs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert institution academic programs" ON institution_academic_programs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update institution academic programs" ON institution_academic_programs FOR UPDATE USING (true);

-- Create storage policies for institution photos
CREATE POLICY "Anyone can upload institution photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'institution-photos');

CREATE POLICY "Anyone can view institution photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'institution-photos');

-- Grant permissions
GRANT ALL ON institutions TO authenticated;
GRANT ALL ON institution_facilities TO authenticated;
GRANT ALL ON institution_photos TO authenticated;
GRANT ALL ON institution_academic_programs TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;

-- Success message
SELECT 'Simple Institution Signup System Database Created Successfully!' as status;
