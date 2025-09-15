-- Fix foreign key relationships for courses table
-- This migration ensures proper foreign key constraints are established

-- First, let's check if the foreign key constraints exist and drop them if they do
DO $$ 
BEGIN
    -- Drop existing foreign key constraints if they exist
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'courses_tutor_id_fkey' 
        AND table_name = 'courses'
    ) THEN
        ALTER TABLE courses DROP CONSTRAINT courses_tutor_id_fkey;
    END IF;
END $$;

-- Now recreate the foreign key constraint properly
ALTER TABLE courses 
ADD CONSTRAINT courses_tutor_id_fkey 
FOREIGN KEY (tutor_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Handle profiles table foreign key more carefully
DO $$ 
BEGIN
    -- Check if profiles table already has the foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        -- First, let's see what data exists in profiles that might not be in auth.users
        RAISE NOTICE 'Checking for orphaned profiles records...';
        
        -- Count orphaned profiles (profiles with IDs not in auth.users)
        PERFORM COUNT(*) FROM profiles p 
        WHERE NOT EXISTS (
            SELECT 1 FROM auth.users u WHERE u.id = p.id
        );
        
        -- If there are orphaned records, we'll skip adding the constraint for now
        -- and just log a warning
        IF EXISTS (
            SELECT 1 FROM profiles p 
            WHERE NOT EXISTS (
                SELECT 1 FROM auth.users u WHERE u.id = p.id
            )
        ) THEN
            RAISE WARNING 'Found profiles records that do not exist in auth.users. Skipping profiles foreign key constraint.';
            RAISE NOTICE 'You may need to clean up orphaned profiles data before adding the constraint.';
        ELSE
            -- Only add the constraint if all profiles have corresponding auth.users
            ALTER TABLE profiles 
            ADD CONSTRAINT profiles_id_fkey 
            FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
            RAISE NOTICE 'Successfully added profiles foreign key constraint.';
        END IF;
    ELSE
        RAISE NOTICE 'Profiles foreign key constraint already exists.';
    END IF;
END $$;

-- Verify the constraints are properly set up
DO $$ 
BEGIN
    RAISE NOTICE 'Foreign key constraints have been set up for courses table';
    RAISE NOTICE 'courses.tutor_id -> auth.users(id)';
    
    -- Check if profiles constraint was added
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        RAISE NOTICE 'profiles.id -> auth.users(id) - CONSTRAINT ADDED';
    ELSE
        RAISE NOTICE 'profiles.id -> auth.users(id) - CONSTRAINT SKIPPED (orphaned data found)';
    END IF;
END $$;
