-- =====================================================
-- CREATE INSTITUTION TABLES FOR SUPABASE
-- =====================================================
-- This script creates the necessary tables for the new institution signup system
-- Run this after cleaning up the old institution tables
-- =====================================================

-- Start transaction
BEGIN;

-- =====================================================
-- STEP 1: CREATE STORAGE BUCKET FOR DOCUMENTS
-- =====================================================

-- Create storage bucket for institution documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('institution-documents', 'institution-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for institution documents
CREATE POLICY "Institution documents are accessible by authenticated users" ON storage.objects
    FOR SELECT USING (bucket_id = 'institution-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Institution documents can be uploaded by authenticated users" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'institution-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Institution documents can be updated by authenticated users" ON storage.objects
    FOR UPDATE USING (bucket_id = 'institution-documents' AND auth.role() = 'authenticated');

-- =====================================================
-- STEP 2: CREATE INSTITUTION SIGNUP STEPS TABLE
-- =====================================================

-- Table to store individual step data during signup process
CREATE TABLE IF NOT EXISTS institution_signup_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    step INTEGER NOT NULL CHECK (step >= 1 AND step <= 7),
    step_data JSONB NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT, -- To track signup sessions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_institution_signup_steps_step ON institution_signup_steps(step);
CREATE INDEX idx_institution_signup_steps_user_id ON institution_signup_steps(user_id);
CREATE INDEX idx_institution_signup_steps_session_id ON institution_signup_steps(session_id);
CREATE INDEX idx_institution_signup_steps_created_at ON institution_signup_steps(created_at);

-- =====================================================
-- STEP 3: CREATE MAIN INSTITUTIONS TABLE
-- =====================================================

-- Main table for institution information
CREATE TABLE IF NOT EXISTS institutions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Basic Information
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    establishment_year INTEGER NOT NULL CHECK (establishment_year >= 1900 AND establishment_year <= EXTRACT(YEAR FROM NOW())),
    registration_number VARCHAR(100) NOT NULL UNIQUE,
    pan_number VARCHAR(10) NOT NULL CHECK (pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
    gst_number VARCHAR(15) CHECK (gst_number ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9A-Z]{1}[Z]{1}[0-9A-Z]{1}$'),
    official_email VARCHAR(255) NOT NULL UNIQUE,
    primary_contact VARCHAR(10) NOT NULL CHECK (primary_contact ~ '^[0-9]{10}$'),
    secondary_contact VARCHAR(10) CHECK (secondary_contact ~ '^[0-9]{10}$'),
    website_url TEXT CHECK (website_url ~ '^https?://.*'),
    
    -- Address Information
    complete_address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pin_code VARCHAR(6) NOT NULL CHECK (pin_code ~ '^[0-9]{6}$'),
    landmark TEXT,
    map_location TEXT,
    
    -- Legal Information
    owner_director_name VARCHAR(255) NOT NULL,
    owner_contact_number VARCHAR(10) NOT NULL CHECK (owner_contact_number ~ '^[0-9]{10}$'),
    business_license_url TEXT,
    registration_certificate_url TEXT,
    
    -- Status and Verification
    status VARCHAR(50) DEFAULT 'pending_verification' CHECK (status IN ('pending_verification', 'verified', 'rejected', 'suspended')),
    verification_status VARCHAR(50) DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_progress', 'verified', 'rejected')),
    verification_notes TEXT,
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES auth.users(id),
    
    -- User and Session
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_institutions_name ON institutions(name);
CREATE INDEX idx_institutions_type ON institutions(type);
CREATE INDEX idx_institutions_city ON institutions(city);
CREATE INDEX idx_institutions_state ON institutions(state);
CREATE INDEX idx_institutions_status ON institutions(status);
CREATE INDEX idx_institutions_verification_status ON institutions(verification_status);
CREATE INDEX idx_institutions_user_id ON institutions(user_id);
CREATE INDEX idx_institutions_created_at ON institutions(created_at);
CREATE INDEX idx_institutions_official_email ON institutions(official_email);
CREATE INDEX idx_institutions_registration_number ON institutions(registration_number);

-- =====================================================
-- STEP 4: CREATE INSTITUTION VERIFICATION LOGS TABLE
-- =====================================================

-- Table to track verification activities
CREATE TABLE IF NOT EXISTS institution_verification_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    status_from VARCHAR(50),
    status_to VARCHAR(50),
    notes TEXT,
    performed_by UUID REFERENCES auth.users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_institution_verification_logs_institution_id ON institution_verification_logs(institution_id);
CREATE INDEX idx_institution_verification_logs_action ON institution_verification_logs(action);
CREATE INDEX idx_institution_verification_logs_performed_at ON institution_verification_logs(performed_at);

-- =====================================================
-- STEP 5: CREATE ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE institution_signup_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_verification_logs ENABLE ROW LEVEL SECURITY;

-- Institution Signup Steps Policies
CREATE POLICY "Users can view their own signup steps" ON institution_signup_steps
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own signup steps" ON institution_signup_steps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own signup steps" ON institution_signup_steps
    FOR UPDATE USING (auth.uid() = user_id);

-- Institutions Policies
CREATE POLICY "Users can view verified institutions" ON institutions
    FOR SELECT USING (status = 'verified');

CREATE POLICY "Users can view their own institutions" ON institutions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own institutions" ON institutions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own institutions" ON institutions
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies (for verification)
CREATE POLICY "Admins can view all institutions" ON institutions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Admins can update all institutions" ON institutions
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Verification Logs Policies
CREATE POLICY "Users can view verification logs for their institutions" ON institution_verification_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM institutions 
            WHERE institutions.id = institution_verification_logs.institution_id 
            AND institutions.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can view all verification logs" ON institution_verification_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Admins can insert verification logs" ON institution_verification_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- =====================================================
-- STEP 6: CREATE FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_institutions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER institutions_updated_at
    BEFORE UPDATE ON institutions
    FOR EACH ROW
    EXECUTE FUNCTION update_institutions_updated_at();

-- Function to log verification changes
CREATE OR REPLACE FUNCTION log_institution_verification_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status OR OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN
        INSERT INTO institution_verification_logs (
            institution_id,
            action,
            status_from,
            status_to,
            notes,
            performed_by
        ) VALUES (
            NEW.id,
            CASE 
                WHEN OLD.status IS DISTINCT FROM NEW.status THEN 'status_change'
                WHEN OLD.verification_status IS DISTINCT FROM NEW.verification_status THEN 'verification_status_change'
                ELSE 'update'
            END,
            CASE 
                WHEN OLD.status IS DISTINCT FROM NEW.status THEN OLD.status
                ELSE OLD.verification_status
            END,
            CASE 
                WHEN OLD.status IS DISTINCT FROM NEW.status THEN NEW.status
                ELSE NEW.verification_status
            END,
            'Status updated',
            auth.uid()
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to log verification changes
CREATE TRIGGER institution_verification_logging
    AFTER UPDATE ON institutions
    FOR EACH ROW
    EXECUTE FUNCTION log_institution_verification_change();

-- =====================================================
-- STEP 7: CREATE VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for verified institutions (public)
CREATE OR REPLACE VIEW verified_institutions AS
SELECT 
    id,
    name,
    type,
    establishment_year,
    city,
    state,
    official_email,
    primary_contact,
    website_url,
    created_at
FROM institutions
WHERE status = 'verified' AND verification_status = 'verified';

-- View for institution verification queue (admin only)
CREATE OR REPLACE VIEW institution_verification_queue AS
SELECT 
    i.id,
    i.name,
    i.type,
    i.official_email,
    i.primary_contact,
    i.city,
    i.state,
    i.status,
    i.verification_status,
    i.created_at,
    u.email as user_email
FROM institutions i
LEFT JOIN auth.users u ON i.user_id = u.id
WHERE i.status = 'pending_verification'
ORDER BY i.created_at ASC;

-- =====================================================
-- STEP 8: VERIFICATION
-- =====================================================

-- Check that all tables were created successfully
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('institution_signup_steps', 'institutions', 'institution_verification_logs');
    
    IF table_count = 3 THEN
        RAISE NOTICE '✅ SUCCESS: All institution tables created successfully!';
        RAISE NOTICE '📊 Tables created: %', table_count;
        RAISE NOTICE '🎯 Ready for institution signup system!';
    ELSE
        RAISE NOTICE '⚠️ WARNING: Only % out of 3 tables were created', table_count;
    END IF;
END $$;

-- =====================================================
-- COMMIT TRANSACTION
-- =====================================================

COMMIT;

-- =====================================================
-- SETUP COMPLETE
-- =====================================================
-- Created tables:
-- • institution_signup_steps - For storing step-by-step data
-- • institutions - Main institution records
-- • institution_verification_logs - For tracking verification activities
-- 
-- Created storage bucket:
-- • institution-documents - For file uploads
-- 
-- Features:
-- • Row Level Security (RLS) enabled
-- • Automatic timestamp updates
-- • Verification logging
-- • Admin verification capabilities
-- • Public views for verified institutions
-- =====================================================
