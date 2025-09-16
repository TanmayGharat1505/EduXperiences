-- Create Institutions Table if Missing
-- This script creates the institutions table with proper structure if it doesn't exist

-- 1. Check if table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'institutions') THEN
        -- Create institutions table
        CREATE TABLE institutions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL,
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

        RAISE NOTICE 'Institutions table created successfully';
    ELSE
        RAISE NOTICE 'Institutions table already exists';
    END IF;
END $$;

-- 2. Enable RLS
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
DROP POLICY IF EXISTS "Institutions can view own data" ON institutions;
DROP POLICY IF EXISTS "Institutions can update own data" ON institutions;
DROP POLICY IF EXISTS "Institutions can insert own data" ON institutions;
DROP POLICY IF EXISTS "Public can view approved institutions" ON institutions;

-- Policy 1: Institutions can view their own data
CREATE POLICY "Institutions can view own data" ON institutions
    FOR SELECT USING (
        official_email = auth.jwt() ->> 'email'
    );

-- Policy 2: Institutions can update their own data
CREATE POLICY "Institutions can update own data" ON institutions
    FOR UPDATE USING (
        official_email = auth.jwt() ->> 'email'
    );

-- Policy 3: Institutions can insert their own data
CREATE POLICY "Institutions can insert own data" ON institutions
    FOR INSERT WITH CHECK (
        official_email = auth.jwt() ->> 'email'
    );

-- Policy 4: Public can view approved institutions
CREATE POLICY "Public can view approved institutions" ON institutions
    FOR SELECT USING (
        status = 'approved'
    );

-- 4. Verify table creation
SELECT 
    'Table Created' as check_type,
    'institutions' as table_name,
    'RLS enabled' as status;

-- 5. Check policies
SELECT 
    'Policies Created' as check_type,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'institutions'
ORDER BY policyname;
