-- =====================================================
-- INSTITUTION TABLES CLEANUP SCRIPT FOR SUPABASE
-- =====================================================
-- This script removes all old institution-related tables, data, and dependencies
-- WARNING: This will permanently delete all data. Backup first if needed.
-- =====================================================

-- Start transaction for safe rollback
BEGIN;

-- =====================================================
-- STEP 1: Drop all institution-related tables
-- =====================================================

-- Drop tables in dependency order (child tables first, then parent tables)

-- Institution signup/registration related tables
DROP TABLE IF EXISTS institution_signups CASCADE;
DROP TABLE IF EXISTS institution_registrations CASCADE;
DROP TABLE IF EXISTS institution_applications CASCADE;
DROP TABLE IF EXISTS institution_verifications CASCADE;
DROP TABLE IF EXISTS institution_otp_verifications CASCADE;
DROP TABLE IF EXISTS institution_sms_logs CASCADE;
DROP TABLE IF EXISTS institution_email_verifications CASCADE;

-- Institution profile and details tables
DROP TABLE IF EXISTS institution_profiles CASCADE;
DROP TABLE IF EXISTS institution_details CASCADE;
DROP TABLE IF EXISTS institution_basic_info CASCADE;
DROP TABLE IF EXISTS institution_addresses CASCADE;
DROP TABLE IF EXISTS institution_contacts CASCADE;
DROP TABLE IF EXISTS institution_documents CASCADE;
DROP TABLE IF EXISTS institution_licenses CASCADE;
DROP TABLE IF EXISTS institution_certificates CASCADE;
DROP TABLE IF EXISTS institution_owners CASCADE;
DROP TABLE IF EXISTS institution_directors CASCADE;

-- Institution academic/operational tables
DROP TABLE IF EXISTS institution_courses CASCADE;
DROP TABLE IF EXISTS institution_programs CASCADE;
DROP TABLE IF EXISTS institution_facilities CASCADE;
DROP TABLE IF EXISTS institution_staff CASCADE;
DROP TABLE IF EXISTS institution_students CASCADE;
DROP TABLE IF EXISTS institution_enrollments CASCADE;
DROP TABLE IF EXISTS institution_batches CASCADE;
DROP TABLE IF EXISTS institution_schedules CASCADE;

-- Institution financial and business tables
DROP TABLE IF EXISTS institution_payments CASCADE;
DROP TABLE IF EXISTS institution_subscriptions CASCADE;
DROP TABLE IF EXISTS institution_billing CASCADE;
DROP TABLE IF EXISTS institution_invoices CASCADE;
DROP TABLE IF EXISTS institution_transactions CASCADE;

-- Institution settings and configuration tables
DROP TABLE IF EXISTS institution_settings CASCADE;
DROP TABLE IF EXISTS institution_preferences CASCADE;
DROP TABLE IF EXISTS institution_configurations CASCADE;
DROP TABLE IF EXISTS institution_themes CASCADE;
DROP TABLE IF EXISTS institution_branding CASCADE;

-- Institution analytics and reporting tables
DROP TABLE IF EXISTS institution_analytics CASCADE;
DROP TABLE IF EXISTS institution_reports CASCADE;
DROP TABLE IF EXISTS institution_statistics CASCADE;
DROP TABLE IF EXISTS institution_metrics CASCADE;
DROP TABLE IF EXISTS institution_dashboards CASCADE;

-- Institution notification and communication tables
DROP TABLE IF EXISTS institution_notifications CASCADE;
DROP TABLE IF EXISTS institution_messages CASCADE;
DROP TABLE IF EXISTS institution_announcements CASCADE;
DROP TABLE IF EXISTS institution_newsletters CASCADE;
DROP TABLE IF EXISTS institution_broadcasts CASCADE;

-- Institution user management tables
DROP TABLE IF EXISTS institution_users CASCADE;
DROP TABLE IF EXISTS institution_user_roles CASCADE;
DROP TABLE IF EXISTS institution_permissions CASCADE;
DROP TABLE IF EXISTS institution_user_sessions CASCADE;
DROP TABLE IF EXISTS institution_login_logs CASCADE;

-- Institution audit and history tables
DROP TABLE IF EXISTS institution_audit_logs CASCADE;
DROP TABLE IF EXISTS institution_change_history CASCADE;
DROP TABLE IF EXISTS institution_version_history CASCADE;
DROP TABLE IF EXISTS institution_activity_logs CASCADE;

-- Institution relationship tables
DROP TABLE IF EXISTS institution_partnerships CASCADE;
DROP TABLE IF EXISTS institution_affiliations CASCADE;
DROP TABLE IF EXISTS institution_collaborations CASCADE;
DROP TABLE IF EXISTS institution_networks CASCADE;

-- Institution content and media tables
DROP TABLE IF EXISTS institution_galleries CASCADE;
DROP TABLE IF EXISTS institution_media CASCADE;
DROP TABLE IF EXISTS institution_files CASCADE;
DROP TABLE IF EXISTS institution_images CASCADE;
DROP TABLE IF EXISTS institution_videos CASCADE;
DROP TABLE IF EXISTS institution_documents_old CASCADE;

-- Institution feedback and review tables
DROP TABLE IF EXISTS institution_reviews CASCADE;
DROP TABLE IF EXISTS institution_ratings CASCADE;
DROP TABLE IF EXISTS institution_feedback CASCADE;
DROP TABLE IF EXISTS institution_testimonials CASCADE;
DROP TABLE IF EXISTS institution_surveys CASCADE;

-- Institution event and activity tables
DROP TABLE IF EXISTS institution_events CASCADE;
DROP TABLE IF EXISTS institution_activities CASCADE;
DROP TABLE IF EXISTS institution_workshops CASCADE;
DROP TABLE IF EXISTS institution_seminars CASCADE;
DROP TABLE IF EXISTS institution_conferences CASCADE;

-- Institution location and branch tables
DROP TABLE IF EXISTS institution_branches CASCADE;
DROP TABLE IF EXISTS institution_locations CASCADE;
DROP TABLE IF EXISTS institution_campuses CASCADE;
DROP TABLE IF EXISTS institution_centers CASCADE;

-- Institution category and classification tables
DROP TABLE IF EXISTS institution_categories CASCADE;
DROP TABLE IF EXISTS institution_types CASCADE;
DROP TABLE IF EXISTS institution_specializations CASCADE;
DROP TABLE IF EXISTS institution_subjects CASCADE;
DROP TABLE IF EXISTS institution_streams CASCADE;

-- Institution quality and accreditation tables
DROP TABLE IF EXISTS institution_accreditations CASCADE;
DROP TABLE IF EXISTS institution_certifications CASCADE;
DROP TABLE IF EXISTS institution_quality_standards CASCADE;
DROP TABLE IF EXISTS institution_ratings_old CASCADE;
DROP TABLE IF EXISTS institution_rankings CASCADE;

-- Institution marketing and SEO tables
DROP TABLE IF EXISTS institution_seo CASCADE;
DROP TABLE IF EXISTS institution_keywords CASCADE;
DROP TABLE IF EXISTS institution_meta_tags CASCADE;
DROP TABLE IF EXISTS institution_social_media CASCADE;

-- Institution backup and archive tables
DROP TABLE IF EXISTS institution_backups CASCADE;
DROP TABLE IF EXISTS institution_archives CASCADE;
DROP TABLE IF EXISTS institution_temp_data CASCADE;
DROP TABLE IF EXISTS institution_staging CASCADE;

-- =====================================================
-- STEP 2: Drop institution-related views
-- =====================================================

-- Drop views that reference institution tables
DROP VIEW IF EXISTS institution_summary_view CASCADE;
DROP VIEW IF EXISTS institution_stats_view CASCADE;
DROP VIEW IF EXISTS institution_report_view CASCADE;
DROP VIEW IF EXISTS institution_dashboard_view CASCADE;
DROP VIEW IF EXISTS institution_analytics_view CASCADE;
DROP VIEW IF EXISTS institution_user_view CASCADE;
DROP VIEW IF EXISTS institution_course_view CASCADE;
DROP VIEW IF EXISTS institution_enrollment_view CASCADE;

-- =====================================================
-- STEP 3: Drop institution-related functions
-- =====================================================

-- Drop functions that handle institution operations
DROP FUNCTION IF EXISTS create_institution_profile() CASCADE;
DROP FUNCTION IF EXISTS update_institution_details() CASCADE;
DROP FUNCTION IF EXISTS delete_institution() CASCADE;
DROP FUNCTION IF EXISTS validate_institution_email() CASCADE;
DROP FUNCTION IF EXISTS verify_institution_phone() CASCADE;
DROP FUNCTION IF EXISTS send_institution_otp() CASCADE;
DROP FUNCTION IF EXISTS verify_institution_otp() CASCADE;
DROP FUNCTION IF EXISTS process_institution_payment() CASCADE;
DROP FUNCTION IF EXISTS generate_institution_report() CASCADE;
DROP FUNCTION IF EXISTS calculate_institution_stats() CASCADE;
DROP FUNCTION IF EXISTS notify_institution_users() CASCADE;
DROP FUNCTION IF EXISTS backup_institution_data() CASCADE;

-- =====================================================
-- STEP 4: Drop institution-related triggers
-- =====================================================

-- Drop triggers that monitor institution table changes
DROP TRIGGER IF EXISTS institution_audit_trigger ON institution_profiles CASCADE;
DROP TRIGGER IF EXISTS institution_update_trigger ON institution_details CASCADE;
DROP TRIGGER IF EXISTS institution_delete_trigger ON institution_profiles CASCADE;
DROP TRIGGER IF EXISTS institution_notification_trigger ON institution_applications CASCADE;
DROP TRIGGER IF EXISTS institution_log_trigger ON institution_users CASCADE;

-- =====================================================
-- STEP 5: Drop institution-related sequences
-- =====================================================

-- Drop sequences used for institution IDs
DROP SEQUENCE IF EXISTS institution_id_seq CASCADE;
DROP SEQUENCE IF EXISTS institution_user_id_seq CASCADE;
DROP SEQUENCE IF EXISTS institution_course_id_seq CASCADE;
DROP SEQUENCE IF EXISTS institution_enrollment_id_seq CASCADE;
DROP SEQUENCE IF EXISTS institution_payment_id_seq CASCADE;
DROP SEQUENCE IF EXISTS institution_notification_id_seq CASCADE;

-- =====================================================
-- STEP 6: Drop institution-related indexes
-- =====================================================

-- Note: Indexes are automatically dropped when tables are dropped
-- This section is for any custom indexes that might exist

-- =====================================================
-- STEP 7: Drop institution-related policies (RLS)
-- =====================================================

-- Drop Row Level Security policies for institution tables
-- Note: These are automatically dropped when tables are dropped

-- =====================================================
-- STEP 8: Clean up any remaining references
-- =====================================================

-- Check for any remaining tables with 'institution' in the name
DO $$
DECLARE
    table_record RECORD;
BEGIN
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename ILIKE '%institution%'
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(table_record.tablename) || ' CASCADE';
        RAISE NOTICE 'Dropped table: %', table_record.tablename;
    END LOOP;
END $$;

-- Check for any remaining functions with 'institution' in the name
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT proname 
        FROM pg_proc 
        WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
        AND proname ILIKE '%institution%'
    LOOP
        EXECUTE 'DROP FUNCTION IF EXISTS ' || quote_ident(func_record.proname) || '() CASCADE';
        RAISE NOTICE 'Dropped function: %', func_record.proname;
    END LOOP;
END $$;

-- =====================================================
-- STEP 9: Clean up storage buckets (if using Supabase Storage)
-- =====================================================

-- Note: Storage buckets need to be managed through Supabase dashboard
-- or using storage API. This is just a reminder.

-- =====================================================
-- STEP 10: Verification and cleanup summary
-- =====================================================

-- List remaining tables to verify cleanup
DO $$
DECLARE
    remaining_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO remaining_count
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename ILIKE '%institution%';
    
    IF remaining_count = 0 THEN
        RAISE NOTICE '✅ All institution-related tables have been successfully removed!';
    ELSE
        RAISE NOTICE '⚠️ % institution-related tables still remain. Check manually.', remaining_count;
    END IF;
END $$;

-- =====================================================
-- COMMIT TRANSACTION
-- =====================================================

COMMIT;

-- =====================================================
-- CLEANUP COMPLETE
-- =====================================================
-- All old institution-related tables, data, and dependencies have been removed.
-- You can now implement your new institution system with a clean slate.
-- =====================================================
