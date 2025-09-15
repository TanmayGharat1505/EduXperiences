-- Institution Courses Table Migration
-- This creates the courses table for institutions

-- 1. Create institution_courses table
CREATE TABLE IF NOT EXISTS institution_courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    duration TEXT NOT NULL,
    fee_structure JSONB NOT NULL DEFAULT '{"type": "fixed", "amount": 0, "currency": "INR"}',
    prerequisites TEXT[] DEFAULT '{}',
    syllabus_url TEXT,
    certificate_details JSONB DEFAULT '{"provided": false, "name": "", "description": ""}',
    images JSONB DEFAULT '[]',
    level TEXT CHECK (level IN ('Beginner', 'Intermediate', 'Advanced')) DEFAULT 'Beginner',
    status TEXT CHECK (status IN ('Active', 'Inactive', 'Draft')) DEFAULT 'Draft',
    instructor TEXT,
    students_enrolled INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create institution_batches table
CREATE TABLE IF NOT EXISTS institution_batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES institution_courses(id) ON DELETE CASCADE,
    batch_name TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    schedule TEXT NOT NULL,
    max_students INTEGER NOT NULL,
    current_students INTEGER DEFAULT 0,
    instructor TEXT NOT NULL,
    status TEXT CHECK (status IN ('Upcoming', 'Ongoing', 'Completed', 'Cancelled')) DEFAULT 'Upcoming',
    location TEXT,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_institution_courses_institution_id ON institution_courses(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_courses_category ON institution_courses(category);
CREATE INDEX IF NOT EXISTS idx_institution_courses_status ON institution_courses(status);
CREATE INDEX IF NOT EXISTS idx_institution_batches_course_id ON institution_batches(course_id);
CREATE INDEX IF NOT EXISTS idx_institution_batches_status ON institution_batches(status);

-- 4. Enable Row Level Security
ALTER TABLE institution_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_batches ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for institution_courses
-- Institutions can view, insert, update, and delete their own courses
CREATE POLICY "Institutions can view own courses" ON institution_courses
    FOR SELECT USING (auth.uid() = institution_id);

CREATE POLICY "Institutions can insert own courses" ON institution_courses
    FOR INSERT WITH CHECK (auth.uid() = institution_id);

CREATE POLICY "Institutions can update own courses" ON institution_courses
    FOR UPDATE USING (auth.uid() = institution_id);

CREATE POLICY "Institutions can delete own courses" ON institution_courses
    FOR DELETE USING (auth.uid() = institution_id);

-- Students can view active courses (for browsing)
CREATE POLICY "Students can view active institution courses" ON institution_courses
    FOR SELECT USING (status = 'Active');

-- 6. Create RLS policies for institution_batches
-- Institutions can view, insert, update, and delete their own batches
CREATE POLICY "Institutions can view own batches" ON institution_batches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM institution_courses 
            WHERE institution_courses.id = institution_batches.course_id 
            AND institution_courses.institution_id = auth.uid()
        )
    );

CREATE POLICY "Institutions can insert own batches" ON institution_batches
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM institution_courses 
            WHERE institution_courses.id = institution_batches.course_id 
            AND institution_courses.institution_id = auth.uid()
        )
    );

CREATE POLICY "Institutions can update own batches" ON institution_batches
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM institution_courses 
            WHERE institution_courses.id = institution_batches.course_id 
            AND institution_courses.institution_id = auth.uid()
        )
    );

CREATE POLICY "Institutions can delete own batches" ON institution_batches
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM institution_courses 
            WHERE institution_courses.id = institution_batches.course_id 
            AND institution_courses.institution_id = auth.uid()
        )
    );

-- Students can view active batches
CREATE POLICY "Students can view active institution batches" ON institution_batches
    FOR SELECT USING (status IN ('Upcoming', 'Ongoing'));

-- 7. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_institution_courses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_institution_batches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create triggers
CREATE TRIGGER trigger_update_institution_courses_updated_at
    BEFORE UPDATE ON institution_courses
    FOR EACH ROW
    EXECUTE FUNCTION update_institution_courses_updated_at();

CREATE TRIGGER trigger_update_institution_batches_updated_at
    BEFORE UPDATE ON institution_batches
    FOR EACH ROW
    EXECUTE FUNCTION update_institution_batches_updated_at();

-- 9. Create storage bucket for course files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('institution-course-files', 'institution-course-files', true)
ON CONFLICT (id) DO NOTHING;

-- 10. Create storage policies for course files
CREATE POLICY "Institutions can upload course files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'institution-course-files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Institutions can view own course files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'institution-course-files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Institutions can update own course files" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'institution-course-files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Institutions can delete own course files" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'institution-course-files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 11. Create storage bucket for course images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('institution-course-images', 'institution-course-images', true)
ON CONFLICT (id) DO NOTHING;

-- 12. Create storage policies for course images
CREATE POLICY "Institutions can upload course images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'institution-course-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Institutions can view own course images" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'institution-course-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Institutions can update own course images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'institution-course-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Institutions can delete own course images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'institution-course-images' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );
