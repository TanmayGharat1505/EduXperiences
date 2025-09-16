-- Add missing columns to institution_profiles table
-- This migration adds all the columns needed for the 7-step registration process

-- 1. First, check current schema
SELECT 
    'Current Institution Profiles Schema' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'institution_profiles'
ORDER BY ordinal_position;

-- 2. Add missing columns for Step 1 (Basic Information)
ALTER TABLE institution_profiles 
ADD COLUMN IF NOT EXISTS other_institution_type TEXT,
ADD COLUMN IF NOT EXISTS password TEXT,
ADD COLUMN IF NOT EXISTS map_location TEXT,
ADD COLUMN IF NOT EXISTS owner_director_name TEXT,
ADD COLUMN IF NOT EXISTS owner_contact_number TEXT,
ADD COLUMN IF NOT EXISTS business_license TEXT,
ADD COLUMN IF NOT EXISTS registration_certificate TEXT;

-- 3. Add JSONB columns for Steps 2-7
ALTER TABLE institution_profiles 
ADD COLUMN IF NOT EXISTS step2_data JSONB,
ADD COLUMN IF NOT EXISTS step3_data JSONB,
ADD COLUMN IF NOT EXISTS step4_data JSONB,
ADD COLUMN IF NOT EXISTS step5_data JSONB,
ADD COLUMN IF NOT EXISTS step6_data JSONB,
ADD COLUMN IF NOT EXISTS step7_data JSONB;

-- 4. Add missing columns that might be referenced in the function
ALTER TABLE institution_profiles 
ADD COLUMN IF NOT EXISTS agree_to_terms BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS agree_to_background_verification BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Verify the updated schema
SELECT 
    'Updated Institution Profiles Schema' as check_type,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'institution_profiles'
ORDER BY ordinal_position;

-- 6. Show what columns were added
SELECT 
    'Added Columns Summary' as summary_type,
    'Step 1 Additional Fields' as category,
    'other_institution_type, password, map_location, owner_director_name, owner_contact_number, business_license, registration_certificate' as columns
UNION ALL
SELECT 'Added Columns Summary', 'Step 2-7 JSONB Fields', 'step2_data, step3_data, step4_data, step5_data, step6_data, step7_data'
UNION ALL
SELECT 'Added Columns Summary', 'System Fields', 'agree_to_terms, agree_to_background_verification, verified, created_at, updated_at'
UNION ALL
SELECT 'Added Columns Summary', 'Total New Columns', '15'
UNION ALL
SELECT 'Added Columns Summary', 'Status', 'READY FOR FUNCTION';
