-- Check All Requirements in Supabase Database
-- Run this in your Supabase SQL editor to see the current state of all requirements

-- ==========================================
-- 1. OVERVIEW: Count of requirements by status
-- ==========================================
SELECT 
    'OVERVIEW' as section,
    status,
    COUNT(*) as count
FROM requirements 
GROUP BY status
ORDER BY status;

-- ==========================================
-- 2. DETAILED LIST: All requirements with full details
-- ==========================================
SELECT 
    'DETAILED_LIST' as section,
    id,
    student_id,
    subject,
    category,
    status,
    created_at,
    updated_at,
    location,
    description,
    urgency,
    budget_range
FROM requirements 
ORDER BY created_at DESC;

-- ==========================================
-- 3. CHECK FOR DELETED REQUIREMENTS
-- ==========================================
SELECT 
    'DELETED_CHECK' as section,
    id,
    student_id,
    subject,
    status,
    created_at,
    updated_at
FROM requirements 
WHERE status = 'deleted'
ORDER BY updated_at DESC;

-- ==========================================
-- 4. CHECK FOR NON-ACTIVE REQUIREMENTS
-- ==========================================
SELECT 
    'NON_ACTIVE_CHECK' as section,
    id,
    student_id,
    subject,
    status,
    created_at,
    updated_at
FROM requirements 
WHERE status != 'active'
ORDER BY status, updated_at DESC;

-- ==========================================
-- 5. CHECK REQUIREMENT-TUTOR MATCHES
-- ==========================================
SELECT 
    'TUTOR_MATCHES' as section,
    rtm.requirement_id,
    rtm.tutor_id,
    rtm.status as match_status,
    r.subject,
    r.status as requirement_status,
    rtm.created_at as match_created,
    rtm.updated_at as match_updated
FROM requirement_tutor_matches rtm
JOIN requirements r ON rtm.requirement_id = r.id
ORDER BY rtm.updated_at DESC;

-- ==========================================
-- 6. CHECK FOR ORPHANED MATCHES
-- ==========================================
SELECT 
    'ORPHANED_MATCHES' as section,
    rtm.requirement_id,
    rtm.tutor_id,
    rtm.status,
    rtm.created_at
FROM requirement_tutor_matches rtm
LEFT JOIN requirements r ON rtm.requirement_id = r.id
WHERE r.id IS NULL
ORDER BY rtm.created_at DESC;

-- ==========================================
-- 7. CHECK STUDENT PROFILES FOR REQUIREMENTS
-- ==========================================
SELECT 
    'STUDENT_PROFILES' as section,
    r.id as requirement_id,
    r.subject,
    r.status as requirement_status,
    p.user_id as student_id,
    p.full_name as student_name,
    p.role as student_role
FROM requirements r
JOIN profiles p ON r.student_id = p.user_id
ORDER BY r.created_at DESC;

-- ==========================================
-- 8. CHECK FOR INCONSISTENCIES
-- ==========================================
SELECT 
    'INCONSISTENCIES' as section,
    'Requirements with deleted status but recent updates' as issue_type,
    id,
    student_id,
    subject,
    status,
    created_at,
    updated_at
FROM requirements 
WHERE status = 'deleted' 
  AND updated_at > created_at
ORDER BY updated_at DESC;

-- ==========================================
-- 9. CHECK REAL-TIME SUBSCRIPTION STATUS
-- ==========================================
SELECT 
    'REALTIME_STATUS' as section,
    'Check if real-time subscriptions are working' as note,
    'Look for active channels in Supabase Dashboard > Database > Replication' as instruction;

-- ==========================================
-- 10. SUMMARY AND RECOMMENDATIONS
-- ==========================================
SELECT 
    'SUMMARY' as section,
    'Total requirements:' as metric,
    COUNT(*) as value
FROM requirements
UNION ALL
SELECT 
    'SUMMARY' as section,
    'Active requirements:' as metric,
    COUNT(*) as value
FROM requirements 
WHERE status = 'active'
UNION ALL
SELECT 
    'SUMMARY' as section,
    'Deleted requirements:' as metric,
    COUNT(*) as value
FROM requirements 
WHERE status = 'deleted'
UNION ALL
SELECT 
    'SUMMARY' as section,
    'Requirements with tutor matches:' as metric,
    COUNT(DISTINCT r.id) as value
FROM requirements r
JOIN requirement_tutor_matches rtm ON r.id = rtm.requirement_id
WHERE r.status = 'active';
