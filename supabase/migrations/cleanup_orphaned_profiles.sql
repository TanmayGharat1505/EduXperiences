-- Clean up orphaned profiles data
-- This migration removes profiles records that don't have corresponding auth.users

-- First, let's see what orphaned data exists
DO $$ 
DECLARE
    orphaned_count INTEGER;
BEGIN
    -- Count orphaned profiles
    SELECT COUNT(*) INTO orphaned_count
    FROM profiles p 
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users u WHERE u.id = p.id
    );
    
    RAISE NOTICE 'Found % orphaned profiles records', orphaned_count;
    
    -- Show some examples of orphaned records
    IF orphaned_count > 0 THEN
        RAISE NOTICE 'Examples of orphaned profile IDs:';
        FOR orphaned_id IN 
            SELECT p.id FROM profiles p 
            WHERE NOT EXISTS (
                SELECT 1 FROM auth.users u WHERE u.id = p.id
            )
            LIMIT 5
        LOOP
            RAISE NOTICE '  - %', orphaned_id.id;
        END LOOP;
    END IF;
END $$;

-- Option 1: Remove orphaned profiles (UNCOMMENT IF YOU WANT TO DELETE THEM)
-- WARNING: This will permanently delete profiles that don't have corresponding auth.users
/*
DELETE FROM profiles 
WHERE id IN (
    SELECT p.id FROM profiles p 
    WHERE NOT EXISTS (
        SELECT 1 FROM auth.users u WHERE u.id = p.id
    )
);
*/

-- Option 2: Just log the orphaned data (SAFER - NO DELETION)
-- This is the default behavior - it just shows you what would be deleted
DO $$ 
BEGIN
    RAISE NOTICE 'To remove orphaned profiles, uncomment the DELETE statement above.';
    RAISE NOTICE 'Orphaned profiles have been identified but not deleted.';
    RAISE NOTICE 'Check the logs above to see which profile IDs are orphaned.';
END $$;
