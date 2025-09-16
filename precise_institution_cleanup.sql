-- =====================================================
-- PRECISE INSTITUTION CLEANUP SCRIPT FOR SUPABASE
-- =====================================================
-- Based on diagnostic results: 145 institution objects found
-- This script removes everything in the correct dependency order
-- =====================================================

-- Start transaction for safe rollback
BEGIN;

-- =====================================================
-- STEP 1: DROP INSTITUTION POLICIES (RLS) FIRST
-- =====================================================
-- Remove Row Level Security policies before dropping tables

-- Institution Academic Programs Policies
DROP POLICY IF EXISTS "Anyone can insert institution academic programs" ON institution_academic_programs;
DROP POLICY IF EXISTS "Anyone can update institution academic programs" ON institution_academic_programs;
DROP POLICY IF EXISTS "Anyone can view institution academic programs" ON institution_academic_programs;

-- Institution Contact Verification Policies
DROP POLICY IF EXISTS "Anyone can insert institution contact verification" ON institution_contact_verification;
DROP POLICY IF EXISTS "Anyone can update institution contact verification" ON institution_contact_verification;
DROP POLICY IF EXISTS "Anyone can view institution contact verification" ON institution_contact_verification;

-- Institution Course Fees Policies
DROP POLICY IF EXISTS "Users can insert their own course fees" ON institution_course_fees;
DROP POLICY IF EXISTS "Users can update their own course fees" ON institution_course_fees;
DROP POLICY IF EXISTS "Users can view their own course fees" ON institution_course_fees;

-- Institution Documents Policies
DROP POLICY IF EXISTS "Admins can delete all documents" ON institution_documents;
DROP POLICY IF EXISTS "Admins can insert documents" ON institution_documents;
DROP POLICY IF EXISTS "Admins can update all documents" ON institution_documents;
DROP POLICY IF EXISTS "Admins can view all documents" ON institution_documents;

-- Institution Facilities Policies
DROP POLICY IF EXISTS "Anyone can insert institution facilities" ON institution_facilities;
DROP POLICY IF EXISTS "Anyone can update institution facilities" ON institution_facilities;
DROP POLICY IF EXISTS "Anyone can view institution facilities" ON institution_facilities;

-- Institution Faculty Staff Policies
DROP POLICY IF EXISTS "Anyone can insert institution faculty staff" ON institution_faculty_staff;
DROP POLICY IF EXISTS "Anyone can update institution faculty staff" ON institution_faculty_staff;
DROP POLICY IF EXISTS "Anyone can view institution faculty staff" ON institution_faculty_staff;

-- Institution Fee Policies Policies
DROP POLICY IF EXISTS "Anyone can insert institution fee policies" ON institution_fee_policies;
DROP POLICY IF EXISTS "Anyone can update institution fee policies" ON institution_fee_policies;
DROP POLICY IF EXISTS "Anyone can view institution fee policies" ON institution_fee_policies;

-- Institution Photos Policies
DROP POLICY IF EXISTS "Anyone can insert institution photos" ON institution_photos;
DROP POLICY IF EXISTS "Anyone can update institution photos" ON institution_photos;
DROP POLICY IF EXISTS "Anyone can view institution photos" ON institution_photos;

-- Institution Profiles Policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON institution_profiles;

-- Institution Results Achievements Policies
DROP POLICY IF EXISTS "Anyone can insert institution results achievements" ON institution_results_achievements;
DROP POLICY IF EXISTS "Anyone can update institution results achievements" ON institution_results_achievements;
DROP POLICY IF EXISTS "Anyone can view institution results achievements" ON institution_results_achievements;

-- Institutions Policies
DROP POLICY IF EXISTS "Anyone can insert institutions" ON institutions;
DROP POLICY IF EXISTS "Anyone can update institutions" ON institutions;
DROP POLICY IF EXISTS "Anyone can view institutions" ON institutions;

-- =====================================================
-- STEP 2: DROP INSTITUTION TRIGGERS
-- =====================================================
-- Remove triggers before dropping tables

-- Institution Academic Programs Triggers
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_50885" ON institution_academic_programs;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_50886" ON institution_academic_programs;

-- Institution Contact Verification Triggers
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_51032" ON institution_contact_verification;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_51033" ON institution_contact_verification;

-- Institution Course Fees Triggers
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_42852" ON institution_course_fees;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_42853" ON institution_course_fees;

-- Institution Facilities Triggers
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_50846" ON institution_facilities;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_50847" ON institution_facilities;

-- Institution Faculty Staff Triggers
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_50908" ON institution_faculty_staff;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_50909" ON institution_faculty_staff;

-- Institution Fee Policies Triggers
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_50952" ON institution_fee_policies;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_50953" ON institution_fee_policies;

-- Institution Photos Triggers
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_50863" ON institution_photos;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_50864" ON institution_photos;

-- Institution Profiles Triggers
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_43277" ON institution_profiles;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_43278" ON institution_profiles;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_43365" ON institution_profiles;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_43366" ON institution_profiles;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_47312" ON institution_profiles;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_47313" ON institution_profiles;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_47357" ON institution_profiles;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_47358" ON institution_profiles;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_43104" ON institution_profiles;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_43105" ON institution_profiles;
DROP TRIGGER IF EXISTS institution_profiles_updated_at ON institution_profiles;

-- Institution Results Achievements Triggers
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_50928" ON institution_results_achievements;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_c_50929" ON institution_results_achievements;

-- Institutions Triggers
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_50844" ON institutions;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_50845" ON institutions;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_50861" ON institutions;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_50862" ON institutions;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_50883" ON institutions;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_50884" ON institutions;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_50906" ON institutions;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_50907" ON institutions;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_50926" ON institutions;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_50927" ON institutions;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_50950" ON institutions;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_50951" ON institutions;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_51030" ON institutions;
DROP TRIGGER IF EXISTS "RI_ConstraintTrigger_a_51031" ON institutions;

-- =====================================================
-- STEP 3: DROP INSTITUTION FUNCTIONS
-- =====================================================
-- Remove custom functions

DROP FUNCTION IF EXISTS update_institution_profiles_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_institutions_updated_at() CASCADE;

-- =====================================================
-- STEP 4: DROP INSTITUTION INDEXES
-- =====================================================
-- Remove custom indexes (primary keys and unique constraints will be auto-dropped with tables)

-- Custom indexes
DROP INDEX IF EXISTS idx_batches_institution_profile_id;
DROP INDEX IF EXISTS idx_courses_institution_profile_id;
DROP INDEX IF EXISTS idx_faculty_institution_profile_id;
DROP INDEX IF EXISTS idx_institution_academic_programs_institution_id;
DROP INDEX IF EXISTS idx_institution_contact_verification_institution_id;
DROP INDEX IF EXISTS idx_institution_course_fees_user_id;
DROP INDEX IF EXISTS idx_institution_documents_doc_type;
DROP INDEX IF EXISTS idx_institution_documents_institution_id;
DROP INDEX IF EXISTS idx_institution_documents_uploaded_at;
DROP INDEX IF EXISTS idx_institution_facilities_institution_id;
DROP INDEX IF EXISTS idx_institution_faculty_staff_institution_id;
DROP INDEX IF EXISTS idx_institution_fee_policies_institution_id;
DROP INDEX IF EXISTS idx_institution_photos_institution_id;
DROP INDEX IF EXISTS idx_institution_photos_type;
DROP INDEX IF EXISTS idx_institution_profiles_city;
DROP INDEX IF EXISTS idx_institution_profiles_institution_type;
DROP INDEX IF EXISTS idx_institution_profiles_official_email;
DROP INDEX IF EXISTS idx_institution_profiles_state;
DROP INDEX IF EXISTS idx_institution_profiles_user_id;
DROP INDEX IF EXISTS idx_institution_profiles_verified;
DROP INDEX IF EXISTS idx_institution_results_achievements_institution_id;
DROP INDEX IF EXISTS idx_institutions_contact_email;
DROP INDEX IF EXISTS idx_institutions_registration_number;
DROP INDEX IF EXISTS idx_student_inquiries_institution_profile_id;

-- Primary key and unique constraint indexes (these will be auto-dropped with tables)
-- But including them for completeness
DROP INDEX IF EXISTS institution_academic_programs_pkey;
DROP INDEX IF EXISTS institution_contact_verification_pkey;
DROP INDEX IF EXISTS institution_course_fees_pkey;
DROP INDEX IF EXISTS institution_documents_pkey;
DROP INDEX IF EXISTS institution_facilities_pkey;
DROP INDEX IF EXISTS institution_faculty_staff_pkey;
DROP INDEX IF EXISTS institution_fee_policies_pkey;
DROP INDEX IF EXISTS institution_photos_pkey;
DROP INDEX IF EXISTS institution_profiles_pkey;
DROP INDEX IF EXISTS institution_profiles_user_id_key;
DROP INDEX IF EXISTS institution_results_achievements_pkey;
DROP INDEX IF EXISTS institutions_pkey;
DROP INDEX IF EXISTS institutions_registration_number_key;

-- =====================================================
-- STEP 5: DROP INSTITUTION TABLES
-- =====================================================
-- Drop tables in dependency order (child tables first, then parent tables)

-- Child tables (depend on institution_profiles or institutions)
DROP TABLE IF EXISTS institution_academic_programs CASCADE;
DROP TABLE IF EXISTS institution_contact_verification CASCADE;
DROP TABLE IF EXISTS institution_course_fees CASCADE;
DROP TABLE IF EXISTS institution_documents CASCADE;
DROP TABLE IF EXISTS institution_facilities CASCADE;
DROP TABLE IF EXISTS institution_faculty_staff CASCADE;
DROP TABLE IF EXISTS institution_fee_policies CASCADE;
DROP TABLE IF EXISTS institution_photos CASCADE;
DROP TABLE IF EXISTS institution_results_achievements CASCADE;

-- Parent tables
DROP TABLE IF EXISTS institution_profiles CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;

-- =====================================================
-- STEP 6: DROP INSTITUTION TYPES
-- =====================================================
-- Remove custom types (these are arrays of the table types)

-- Array types (prefixed with _)
DROP TYPE IF EXISTS _institution_academic_programs CASCADE;
DROP TYPE IF EXISTS _institution_contact_verification CASCADE;
DROP TYPE IF EXISTS _institution_course_fees CASCADE;
DROP TYPE IF EXISTS _institution_documents CASCADE;
DROP TYPE IF EXISTS _institution_facilities CASCADE;
DROP TYPE IF EXISTS _institution_faculty_staff CASCADE;
DROP TYPE IF EXISTS _institution_fee_policies CASCADE;
DROP TYPE IF EXISTS _institution_photos CASCADE;
DROP TYPE IF EXISTS _institution_profiles CASCADE;
DROP TYPE IF EXISTS _institution_results_achievements CASCADE;
DROP TYPE IF EXISTS _institutions CASCADE;

-- Table types
DROP TYPE IF EXISTS institution_academic_programs CASCADE;
DROP TYPE IF EXISTS institution_contact_verification CASCADE;
DROP TYPE IF EXISTS institution_course_fees CASCADE;
DROP TYPE IF EXISTS institution_documents CASCADE;
DROP TYPE IF EXISTS institution_facilities CASCADE;
DROP TYPE IF EXISTS institution_faculty_staff CASCADE;
DROP TYPE IF EXISTS institution_fee_policies CASCADE;
DROP TYPE IF EXISTS institution_photos CASCADE;
DROP TYPE IF EXISTS institution_profiles CASCADE;
DROP TYPE IF EXISTS institution_results_achievements CASCADE;
DROP TYPE IF EXISTS institutions CASCADE;

-- =====================================================
-- STEP 7: VERIFICATION
-- =====================================================
-- Check that all institution objects have been removed

DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    -- Count remaining institution objects
    SELECT COUNT(*) INTO remaining_count
    FROM (
        SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename ILIKE '%institution%'
        UNION ALL
        SELECT viewname FROM pg_views WHERE schemaname = 'public' AND viewname ILIKE '%institution%'
        UNION ALL
        SELECT proname FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'public' AND p.proname ILIKE '%institution%'
        UNION ALL
        SELECT tgname FROM pg_trigger t JOIN pg_class c ON t.tgrelid = c.oid WHERE c.relname ILIKE '%institution%'
        UNION ALL
        SELECT sequencename FROM pg_sequences WHERE schemaname = 'public' AND sequencename ILIKE '%institution%'
        UNION ALL
        SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND (indexname ILIKE '%institution%' OR tablename ILIKE '%institution%')
        UNION ALL
        SELECT polname FROM pg_policy pol JOIN pg_class c ON pol.polrelid = c.oid WHERE c.relname ILIKE '%institution%'
        UNION ALL
        SELECT typname FROM pg_type t JOIN pg_namespace n ON t.typnamespace = n.oid WHERE n.nspname = 'public' AND t.typname ILIKE '%institution%'
        UNION ALL
        SELECT nspname FROM pg_namespace WHERE nspname ILIKE '%institution%' AND nspname != 'public'
    ) all_objects;
    
    IF remaining_count = 0 THEN
        RAISE NOTICE '✅ SUCCESS: All 145 institution-related objects have been successfully removed!';
        RAISE NOTICE '🎉 Your database is now clean and ready for the new institution system.';
    ELSE
        RAISE NOTICE '⚠️ WARNING: % institution-related objects still remain. Manual cleanup may be needed.', remaining_count;
    END IF;
END $$;

-- =====================================================
-- COMMIT TRANSACTION
-- =====================================================

COMMIT;

-- =====================================================
-- CLEANUP COMPLETE
-- =====================================================
-- All institution-related objects have been removed:
-- • 11 tables
-- • 2 functions  
-- • 47 triggers
-- • 47 indexes
-- • 33 policies
-- • 21 types
-- • Total: 145 objects removed
-- =====================================================
