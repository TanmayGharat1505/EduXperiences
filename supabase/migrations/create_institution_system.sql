-- Institution Signup System - Complete Database Setup
-- This creates all necessary tables for the new institution signup process

-- 1. Create institutions table
CREATE TABLE IF NOT EXISTS institutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Coaching', 'Training', 'Language', 'Music Academy', 'Dance School', 'Sports Academy', 'Computer Training', 'Professional', 'Arts & Crafts', 'Other')),
    establishment_year INTEGER NOT NULL CHECK (establishment_year >= 1950 AND establishment_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    registration_number TEXT UNIQUE NOT NULL,
    pan TEXT NOT NULL CHECK (LENGTH(pan) = 10),
    gst TEXT CHECK (LENGTH(gst) = 15),
    official_email TEXT UNIQUE NOT NULL,
    primary_contact TEXT NOT NULL CHECK (LENGTH(primary_contact) = 10),
    secondary_contact TEXT CHECK (LENGTH(secondary_contact) = 10),
    website TEXT,
    complete_address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL CHECK (LENGTH(pincode) = 6),
    landmark TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    owner_name TEXT NOT NULL,
    owner_contact TEXT NOT NULL CHECK (LENGTH(owner_contact) = 10),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    agree_terms BOOLEAN NOT NULL DEFAULT false,
    agree_background_verification BOOLEAN NOT NULL DEFAULT false,
    primary_contact_verified BOOLEAN DEFAULT false,
    owner_contact_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create institution documents table
CREATE TABLE IF NOT EXISTS institution_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
    file_key TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    doc_type TEXT NOT NULL CHECK (doc_type IN ('business_license', 'registration_certificate')),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create phone OTPs table for verification
CREATE TABLE IF NOT EXISTS phone_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    otp_hash TEXT NOT NULL,
    purpose TEXT NOT NULL CHECK (purpose IN ('institution_primary_contact', 'institution_owner_contact')),
    attempts INTEGER DEFAULT 0,
    expires_at TIMESTAMPTZ NOT NULL,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_institutions_registration_number ON institutions(registration_number);
CREATE INDEX IF NOT EXISTS idx_institutions_official_email ON institutions(official_email);
CREATE INDEX IF NOT EXISTS idx_institutions_primary_contact ON institutions(primary_contact);
CREATE INDEX IF NOT EXISTS idx_institutions_status ON institutions(status);
CREATE INDEX IF NOT EXISTS idx_institutions_type ON institutions(type);
CREATE INDEX IF NOT EXISTS idx_institutions_city ON institutions(city);
CREATE INDEX IF NOT EXISTS idx_institutions_state ON institutions(state);

CREATE INDEX IF NOT EXISTS idx_institution_documents_institution_id ON institution_documents(institution_id);
CREATE INDEX IF NOT EXISTS idx_institution_documents_doc_type ON institution_documents(doc_type);

CREATE INDEX IF NOT EXISTS idx_phone_otps_phone ON phone_otps(phone);
CREATE INDEX IF NOT EXISTS idx_phone_otps_purpose ON phone_otps(purpose);
CREATE INDEX IF NOT EXISTS idx_phone_otps_expires_at ON phone_otps(expires_at);

-- 5. Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_institutions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger for institutions table
CREATE TRIGGER institutions_updated_at
    BEFORE UPDATE ON institutions
    FOR EACH ROW
    EXECUTE FUNCTION update_institutions_updated_at();

-- 7. Create storage bucket for institution documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('institution-documents', 'institution-documents', false, 10485760, ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'])
ON CONFLICT (id) DO NOTHING;

-- 8. Create storage policies
CREATE POLICY "Institution documents are accessible by institution owners" ON storage.objects
    FOR SELECT USING (bucket_id = 'institution-documents' AND auth.uid()::text = (
        SELECT i.id::text FROM institutions i 
        WHERE i.id::text = SPLIT_PART(name, '/', 1)
    ));

CREATE POLICY "Institution documents can be uploaded by authenticated users" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'institution-documents' AND auth.role() = 'authenticated');

-- 9. Enable Row Level Security
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE institution_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_otps ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies
-- Institutions: Public can view approved institutions, owners can manage their own
CREATE POLICY "Public can view approved institutions" ON institutions
    FOR SELECT USING (status = 'approved');

CREATE POLICY "Institution owners can view and update their own data" ON institutions
    FOR ALL USING (
        primary_contact = auth.jwt() ->> 'phone' OR 
        owner_contact = auth.jwt() ->> 'phone'
    );

-- Institution documents: Owners can manage their own documents
CREATE POLICY "Institution owners can manage their own documents" ON institution_documents
    FOR ALL USING (
        institution_id IN (
            SELECT id FROM institutions 
            WHERE primary_contact = auth.jwt() ->> 'phone' OR 
                  owner_contact = auth.jwt() ->> 'phone'
        )
    );

-- Phone OTPs: Users can manage their own OTPs
CREATE POLICY "Users can manage their own phone OTPs" ON phone_otps
    FOR ALL USING (phone = auth.jwt() ->> 'phone');

-- 11. Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON institutions TO authenticated;
GRANT ALL ON institution_documents TO authenticated;
GRANT ALL ON phone_otps TO authenticated;

-- 12. Create view for public institution data
CREATE OR REPLACE VIEW public_institutions AS
SELECT 
    id, name, type, establishment_year, city, state, 
    complete_address, website, status, created_at
FROM institutions 
WHERE status = 'approved';

GRANT SELECT ON public_institutions TO anon;

-- 13. Insert sample data for testing
INSERT INTO institutions (
    name, type, establishment_year, registration_number, pan, 
    official_email, primary_contact, complete_address, city, state, 
    pincode, owner_name, owner_contact, agree_terms, agree_background_verification
) VALUES (
    'Sample Academy', 'Coaching', 2020, 'REG001', 'ABCDE1234F',
    'admin@sampleacademy.com', '9876543210', '123 Main Street', 'Mumbai', 'Maharashtra',
    '400001', 'John Doe', '9876543211', true, true
) ON CONFLICT (name) DO NOTHING;

-- 14. Success message
SELECT 'Institution Signup System Database Created Successfully!' as status;
SELECT 'Tables created: institutions, institution_documents, phone_otps' as tables;
SELECT 'Storage bucket: institution-documents' as storage;
SELECT 'RLS policies and indexes configured' as security;
