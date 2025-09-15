-- Institution Facilities and Infrastructure System
-- This migration creates tables for storing institution details, facilities, and photos

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
CREATE INDEX IF NOT EXISTS idx_institution_facilities_institution_id ON institution_facilities(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_photos_institution_id ON institution_photos(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_photos_type ON institution_photos(photo_type);

-- Create RLS policies for institution_facilities
ALTER TABLE institution_facilities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view institution facilities" ON institution_facilities
  FOR SELECT USING (true);

CREATE POLICY "Institution owners can insert their own facilities" ON institution_facilities
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM institutions 
      WHERE id = institution_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Institution owners can update their own facilities" ON institution_facilities
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM institutions 
      WHERE id = institution_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Institution owners can delete their own facilities" ON institution_facilities
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM institutions 
      WHERE id = institution_id 
      AND user_id = auth.uid()
    )
  );

-- Create RLS policies for institution_photos
ALTER TABLE institution_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view institution photos" ON institution_photos
  FOR SELECT USING (true);

CREATE POLICY "Institution owners can insert their own photos" ON institution_photos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM institutions 
      WHERE id = institution_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Institution owners can update their own photos" ON institution_photos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM institutions 
      WHERE id = institution_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Institution owners can delete their own photos" ON institution_photos
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM institutions 
      WHERE id = institution_id 
      AND user_id = auth.uid()
    )
  );

-- Create storage policies for institution photos
CREATE POLICY "Institution owners can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'institution-photos' AND
    EXISTS (
      SELECT 1 FROM institutions 
      WHERE id::text = (storage.foldername(name))[1]
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view institution photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'institution-photos');

CREATE POLICY "Institution owners can update their photos" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'institution-photos' AND
    EXISTS (
      SELECT 1 FROM institutions 
      WHERE id::text = (storage.foldername(name))[1]
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Institution owners can delete their photos" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'institution-photos' AND
    EXISTS (
      SELECT 1 FROM institutions 
      WHERE id::text = (storage.foldername(name))[1]
      AND user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_institution_facilities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_institution_facilities_updated_at
  BEFORE UPDATE ON institution_facilities
  FOR EACH ROW
  EXECUTE FUNCTION update_institution_facilities_updated_at();

-- Insert sample data for testing (optional)
-- INSERT INTO institution_facilities (institution_id, total_classrooms, library_available, computer_lab)
-- VALUES ('sample-uuid', 20, true, true);

-- Grant necessary permissions
GRANT ALL ON institution_facilities TO authenticated;
GRANT ALL ON institution_photos TO authenticated;
GRANT USAGE ON SCHEMA storage TO authenticated;
