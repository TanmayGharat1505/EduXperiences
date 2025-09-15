-- Migration: Enhance classes table for session bookings
-- This migration ensures the classes table has all necessary columns and constraints for session booking functionality

-- 1. Add missing columns if they don't exist
DO $$ 
BEGIN
    -- Add course_id column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'course_id') THEN
        ALTER TABLE classes ADD COLUMN course_id UUID REFERENCES courses(id) ON DELETE CASCADE;
    END IF;
    
    -- Add title column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'title') THEN
        ALTER TABLE classes ADD COLUMN title TEXT NOT NULL DEFAULT 'Booked Session';
    END IF;
    
    -- Add description column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'description') THEN
        ALTER TABLE classes ADD COLUMN description TEXT;
    END IF;
    
    -- Add duration_minutes column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'duration_minutes') THEN
        ALTER TABLE classes ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 60;
    END IF;
    
    -- Add meeting_link column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'meeting_link') THEN
        ALTER TABLE classes ADD COLUMN meeting_link TEXT;
    END IF;
    
    -- Add notes column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'notes') THEN
        ALTER TABLE classes ADD COLUMN notes TEXT;
    END IF;
    
    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'classes' AND column_name = 'updated_at') THEN
        ALTER TABLE classes ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- 2. Update existing records to have proper values
UPDATE classes 
SET 
    title = COALESCE(title, 'Booked Session'),
    description = COALESCE(description, 'Session booked by student'),
    duration_minutes = COALESCE(duration_minutes, 
        CASE 
            WHEN start_time IS NOT NULL AND end_time IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (end_time - start_time)) / 60
            ELSE 60
        END
    )
WHERE title IS NULL OR description IS NULL OR duration_minutes IS NULL;

-- 3. Add constraints if they don't exist
DO $$
BEGIN
    -- Add status check constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'classes_status_check'
    ) THEN
        ALTER TABLE classes ADD CONSTRAINT classes_status_check 
        CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled', 'rescheduled'));
    END IF;
    
    -- Add duration check constraint if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.check_constraints 
        WHERE constraint_name = 'classes_duration_check'
    ) THEN
        ALTER TABLE classes ADD CONSTRAINT classes_duration_check 
        CHECK (duration_minutes > 0 AND duration_minutes <= 480); -- Max 8 hours
    END IF;
END $$;

-- 4. Create or update indexes for better performance
CREATE INDEX IF NOT EXISTS idx_classes_course_id ON classes(course_id);
CREATE INDEX IF NOT EXISTS idx_classes_tutor_id ON classes(tutor_id);
CREATE INDEX IF NOT EXISTS idx_classes_student_id ON classes(student_id);
CREATE INDEX IF NOT EXISTS idx_classes_start_time ON classes(start_time);
CREATE INDEX IF NOT EXISTS idx_classes_status ON classes(status);
CREATE INDEX IF NOT EXISTS idx_classes_date_range ON classes(start_time, end_time);

-- 5. Create or update RLS policies
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Tutors can view own classes" ON classes;
    DROP POLICY IF EXISTS "Students can view own classes" ON classes;
    DROP POLICY IF EXISTS "Users can insert classes" ON classes;
    DROP POLICY IF EXISTS "Users can update own classes" ON classes;
    
    -- Create comprehensive policies
    CREATE POLICY "Tutors can view own classes" ON classes
        FOR SELECT USING (auth.uid() = tutor_id);
    
    CREATE POLICY "Students can view own classes" ON classes
        FOR SELECT USING (auth.uid() = student_id);
    
    CREATE POLICY "Users can insert classes" ON classes
        FOR INSERT WITH CHECK (
            auth.uid() = student_id OR auth.uid() = tutor_id
        );
    
    CREATE POLICY "Users can update own classes" ON classes
        FOR UPDATE USING (
            auth.uid() = student_id OR auth.uid() = tutor_id
        );
    
    CREATE POLICY "Users can delete own classes" ON classes
        FOR DELETE USING (
            auth.uid() = student_id OR auth.uid() = tutor_id
        );
END $$;

-- 6. Create or update triggers for updated_at
DO $$
BEGIN
    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS update_classes_updated_at ON classes;
    
    -- Create trigger for updated_at
    CREATE TRIGGER update_classes_updated_at
        BEFORE UPDATE ON classes
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
END $$;

-- 7. Verify the migration
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'classes'
ORDER BY ordinal_position;

-- 8. Show sample data structure
SELECT 
    'classes' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_sessions,
    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_sessions,
    COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_sessions
FROM classes;
