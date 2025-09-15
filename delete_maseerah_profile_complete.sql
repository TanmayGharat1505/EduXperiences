-- Delete Complete Profile for maseerah2003@gmail.com
-- This script safely deletes all data related to maseerah2003@gmail.com

-- 1. First, let's see what data exists for this profile
SELECT 
    'Data to be Deleted - Auth User' as check_type,
    id,
    email,
    created_at
FROM auth.users 
WHERE email = 'maseerah2003@gmail.com';

-- 2. Check institution_profiles
SELECT 
    'Data to be Deleted - Institution Profiles' as check_type,
    id,
    institution_name,
    user_id,
    official_email,
    created_at
FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 3. Check institutions table
SELECT 
    'Data to be Deleted - Institutions' as check_type,
    id,
    name,
    official_email,
    created_at
FROM institutions 
WHERE official_email = 'maseerah2003@gmail.com';

-- 4. Check profiles table
SELECT 
    'Data to be Deleted - Profiles' as check_type,
    id,
    full_name,
    role,
    user_id,
    created_at
FROM profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 5. Check institution courses
SELECT 
    'Data to be Deleted - Institution Courses' as check_type,
    ic.id,
    ic.title,
    ic.institution_id,
    ic.created_at
FROM institution_courses ic
JOIN institution_profiles ip ON ic.institution_id = ip.id
WHERE ip.user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 6. Check institution batches
SELECT 
    'Data to be Deleted - Institution Batches' as check_type,
    ib.id,
    ib.batch_name,
    ib.institution_id,
    ib.created_at
FROM institution_batches ib
JOIN institution_profiles ip ON ib.institution_id = ip.id
WHERE ip.user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 7. Check course enrollments
SELECT 
    'Data to be Deleted - Course Enrollments' as check_type,
    ce.id,
    ce.course_id,
    ce.student_id,
    ce.status,
    ce.enrolled_at
FROM course_enrollments ce
JOIN institution_courses ic ON ce.course_id = ic.id
JOIN institution_profiles ip ON ic.institution_id = ip.id
WHERE ip.user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 8. Check institution documents
SELECT 
    'Data to be Deleted - Institution Documents' as check_type,
    id,
    institution_id,
    file_name,
    doc_type,
    created_at
FROM institution_documents 
WHERE institution_id IN (
    SELECT id FROM institutions 
    WHERE official_email = 'maseerah2003@gmail.com'
);

-- 9. Check phone OTPs
SELECT 
    'Data to be Deleted - Phone OTPs' as check_type,
    id,
    phone,
    purpose,
    created_at
FROM phone_otps 
WHERE phone IN (
    SELECT primary_contact FROM institutions 
    WHERE official_email = 'maseerah2003@gmail.com'
    UNION
    SELECT owner_contact FROM institutions 
    WHERE official_email = 'maseerah2003@gmail.com'
);

-- 10. Check notifications
SELECT 
    'Data to be Deleted - Notifications' as check_type,
    id,
    user_id,
    title,
    message,
    created_at
FROM notifications 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- NOW DELETE ALL DATA (in correct order to avoid foreign key constraints)

-- 11. Delete course enrollments first
DELETE FROM course_enrollments 
WHERE course_id IN (
    SELECT ic.id FROM institution_courses ic
    JOIN institution_profiles ip ON ic.institution_id = ip.id
    WHERE ip.user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
);

-- 12. Delete institution batches
DELETE FROM institution_batches 
WHERE institution_id IN (
    SELECT id FROM institution_profiles 
    WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
);

-- 13. Delete institution courses
DELETE FROM institution_courses 
WHERE institution_id IN (
    SELECT id FROM institution_profiles 
    WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
);

-- 14. Delete institution documents
DELETE FROM institution_documents 
WHERE institution_id IN (
    SELECT id FROM institutions 
    WHERE official_email = 'maseerah2003@gmail.com'
);

-- 15. Delete phone OTPs
DELETE FROM phone_otps 
WHERE phone IN (
    SELECT primary_contact FROM institutions 
    WHERE official_email = 'maseerah2003@gmail.com'
    UNION
    SELECT owner_contact FROM institutions 
    WHERE official_email = 'maseerah2003@gmail.com'
);

-- 16. Delete notifications
DELETE FROM notifications 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 17. Delete institution profiles
DELETE FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 18. Delete institutions
DELETE FROM institutions 
WHERE official_email = 'maseerah2003@gmail.com';

-- 19. Delete profiles
DELETE FROM profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';

-- 20. Delete auth user (this will also delete from auth.users)
-- Note: This requires admin privileges and should be done carefully
-- DELETE FROM auth.users WHERE email = 'maseerah2003@gmail.com';

-- 21. Verify deletion
SELECT 
    'Verification - Remaining Data' as check_type,
    'Auth User' as table_name,
    COUNT(*) as count
FROM auth.users 
WHERE email = 'maseerah2003@gmail.com'
UNION ALL
SELECT 
    'Verification - Remaining Data' as check_type,
    'Profiles' as table_name,
    COUNT(*) as count
FROM profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
UNION ALL
SELECT 
    'Verification - Remaining Data' as check_type,
    'Institution Profiles' as table_name,
    COUNT(*) as count
FROM institution_profiles 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
UNION ALL
SELECT 
    'Verification - Remaining Data' as check_type,
    'Institutions' as table_name,
    COUNT(*) as count
FROM institutions 
WHERE official_email = 'maseerah2003@gmail.com'
UNION ALL
SELECT 
    'Verification - Remaining Data' as check_type,
    'Institution Courses' as table_name,
    COUNT(*) as count
FROM institution_courses ic
JOIN institution_profiles ip ON ic.institution_id = ip.id
WHERE ip.user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
UNION ALL
SELECT 
    'Verification - Remaining Data' as check_type,
    'Institution Batches' as table_name,
    COUNT(*) as count
FROM institution_batches ib
JOIN institution_profiles ip ON ib.institution_id = ip.id
WHERE ip.user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
UNION ALL
SELECT 
    'Verification - Remaining Data' as check_type,
    'Course Enrollments' as table_name,
    COUNT(*) as count
FROM course_enrollments ce
JOIN institution_courses ic ON ce.course_id = ic.id
JOIN institution_profiles ip ON ic.institution_id = ip.id
WHERE ip.user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c'
UNION ALL
SELECT 
    'Verification - Remaining Data' as check_type,
    'Institution Documents' as table_name,
    COUNT(*) as count
FROM institution_documents 
WHERE institution_id IN (
    SELECT id FROM institutions 
    WHERE official_email = 'maseerah2003@gmail.com'
)
UNION ALL
SELECT 
    'Verification - Remaining Data' as check_type,
    'Phone OTPs' as table_name,
    COUNT(*) as count
FROM phone_otps 
WHERE phone IN (
    SELECT primary_contact FROM institutions 
    WHERE official_email = 'maseerah2003@gmail.com'
    UNION
    SELECT owner_contact FROM institutions 
    WHERE official_email = 'maseerah2003@gmail.com'
)
UNION ALL
SELECT 
    'Verification - Remaining Data' as check_type,
    'Notifications' as table_name,
    COUNT(*) as count
FROM notifications 
WHERE user_id = '6b0f0c18-08fe-431b-af56-c4ab23e3b25c';
